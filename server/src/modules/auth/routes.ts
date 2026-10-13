import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { verify, hash } from '@node-rs/argon2';
import { and, eq, or } from 'drizzle-orm';
import * as s from '../../db/schema.js';
import { SESSION_COOKIE, SESSION_ABSOLUTE_MS, loadAuthContext, type AuthContext } from '../../plugins/auth.js';
import { HttpError, randomToken, sha256 } from '../../lib/util.js';
import { writeAudit } from '../../lib/audit.js';

const LoginBody = z.object({
    identifier: z.string().trim().min(1).max(190),
    password: z.string().min(1).max(200)
});

// Burns comparable CPU when the account does not exist (defeats user enumeration by timing).
let dummyHash: string | null = null;
const getDummyHash = async () => (dummyHash ??= await hash('not-a-real-password-' + randomToken(8)));

export const serializeAuth = async (app: FastifyInstance, auth: AuthContext) => {
    const brandRows = await app.db.select().from(s.brands);
    const brands = brandRows
        .filter((b) => auth.brandIds.includes(b.id))
        .map((b) => ({ id: b.id, slug: b.slug, brandName: b.brandName, displayName: b.displayName, shortDescription: b.shortDescription, ...(b.configuration || {}) }));
    const primaryRole = ['SUPER_ADMIN', 'OWNER', 'SUPERVISOR', 'MARKETING_ADMIN', 'SALES'].find((r) => auth.roles.includes(r)) ?? auth.roles[0];
    return {
        user: { ...auth.user, role: primaryRole, roles: auth.roles, brandId: auth.activeBrandId },
        permissions: [...auth.permissions].sort(),
        brands,
        activeBrandId: auth.activeBrandId,
        activeBrand: brands.find((b) => b.id === auth.activeBrandId) ?? null
    };
};

const setSessionCookie = (app: FastifyInstance, reply: FastifyReply, token: string) => {
    reply.setCookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: app.config.isProduction,
        path: '/',
        maxAge: Math.floor(SESSION_ABSOLUTE_MS / 1000)
    });
};

export default async function authRoutes(app: FastifyInstance) {
    app.post('/login', {
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 minute',
                // Run after body parsing so the key can include the identifier.
                hook: 'preHandler',
                keyGenerator: (req: FastifyRequest) => `${req.ip}:${String((req.body as any)?.identifier ?? '').toLowerCase()}`
            }
        }
    }, async (req, reply) => {
        const body = LoginBody.parse(req.body);
        const ident = body.identifier.toLowerCase();
        const [user] = await app.db.select().from(s.users)
            .where(or(eq(s.users.username, ident), eq(s.users.email, ident)))
            .limit(1);
        const ok = user ? await verify(user.passwordHash, body.password) : (await verify(await getDummyHash(), body.password), false);
        if (!user || !ok || user.status !== 'ACTIVE') {
            await writeAudit(app.db, req, { action: 'auth.login_failed', entity: 'user', entityId: user?.id ?? null, after: { identifier: ident.slice(0, 3) + '***' }, actorId: user?.id ?? null, brandId: null });
            throw new HttpError(401, 'INVALID_CREDENTIALS', 'Username/email atau password salah.');
        }

        // Rotate: drop any session presented with this request, then issue a fresh one.
        const previous = req.cookies[SESSION_COOKIE];
        if (previous) await app.db.delete(s.sessions).where(eq(s.sessions.idHash, sha256(previous)));

        const token = randomToken(32);
        const idHash = sha256(token);
        const ctx = await loadAuthContext(app, user.id, idHash, null);
        if (!ctx) throw new HttpError(403, 'NO_BRAND', 'Akun ini belum terhubung ke brand mana pun.');
        await app.db.insert(s.sessions).values({
            idHash,
            userId: user.id,
            activeBrandId: ctx.activeBrandId,
            ip: req.ip,
            userAgent: String(req.headers['user-agent'] ?? '').slice(0, 255),
            expiresAt: new Date(Date.now() + SESSION_ABSOLUTE_MS)
        });
        await app.db.update(s.users).set({ lastLoginAt: new Date() }).where(eq(s.users.id, user.id));
        await writeAudit(app.db, req, { action: 'auth.login', entity: 'user', entityId: user.id, actorId: user.id, brandId: ctx.activeBrandId });
        setSessionCookie(app, reply, token);
        return serializeAuth(app, ctx);
    });

    app.post('/logout', async (req, reply) => {
        const token = req.cookies[SESSION_COOKIE];
        if (token) await app.db.delete(s.sessions).where(eq(s.sessions.idHash, sha256(token)));
        if (req.auth) await writeAudit(app.db, req, { action: 'auth.logout', entity: 'user', entityId: req.auth.user.id });
        reply.clearCookie(SESSION_COOKIE, { path: '/' });
        return { ok: true };
    });

    app.get('/me', { preHandler: app.requireAuth }, async (req) => serializeAuth(app, req.auth!));

    app.post('/switch-brand', { preHandler: app.requireAuth }, async (req) => {
        const { brandId } = z.object({ brandId: z.string().min(1).max(40) }).parse(req.body);
        const auth = req.auth!;
        if (!auth.brandIds.includes(brandId)) throw new HttpError(403, 'FORBIDDEN', 'Anda tidak terdaftar di brand ini.');
        if (brandId !== auth.activeBrandId && !auth.permissions.has('brand.switch')) {
            throw new HttpError(403, 'FORBIDDEN', 'Hanya Super Admin / Owner yang dapat berpindah brand.');
        }
        await app.db.update(s.sessions).set({ activeBrandId: brandId }).where(eq(s.sessions.idHash, auth.sessionHash));
        await writeAudit(app.db, req, { action: 'auth.switch_brand', entity: 'session', before: { brandId: auth.activeBrandId }, after: { brandId }, brandId });
        const next = await loadAuthContext(app, auth.user.id, auth.sessionHash, brandId);
        return serializeAuth(app, next!);
    });

    app.post('/change-password', { preHandler: app.requireAuth }, async (req) => {
        const body = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(10).max(200) }).parse(req.body);
        const [user] = await app.db.select().from(s.users).where(eq(s.users.id, req.auth!.user.id)).limit(1);
        if (!user || !(await verify(user.passwordHash, body.currentPassword))) throw new HttpError(400, 'INVALID_PASSWORD', 'Password saat ini salah.');
        await app.db.update(s.users).set({ passwordHash: await hash(body.newPassword) }).where(eq(s.users.id, user.id));
        // Invalidate every other session of this user.
        const others = await app.db.select({ idHash: s.sessions.idHash }).from(s.sessions).where(eq(s.sessions.userId, user.id));
        for (const o of others) if (o.idHash !== req.auth!.sessionHash) await app.db.delete(s.sessions).where(and(eq(s.sessions.idHash, o.idHash)));
        await writeAudit(app.db, req, { action: 'auth.change_password', entity: 'user', entityId: user.id });
        return { ok: true };
    });
}
