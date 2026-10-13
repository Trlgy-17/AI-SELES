import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { and, eq, gt, inArray } from 'drizzle-orm';
import * as s from '../db/schema.js';
import type { Permission } from '../lib/rbac.js';
import { HttpError, sha256, forbidden } from '../lib/util.js';

export const SESSION_COOKIE = 'nacira_sid';
export const SESSION_IDLE_MS = 12 * 60 * 60 * 1000;
export const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthContext = {
    sessionHash: string;
    user: { id: string; username: string; email: string; fullName: string };
    roles: string[];
    permissions: Set<Permission>;
    brandIds: string[];
    activeBrandId: string;
};

declare module 'fastify' {
    interface FastifyRequest {
        auth: AuthContext | null;
    }
    interface FastifyInstance {
        requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

export const loadAuthContext = async (app: FastifyInstance, userId: string, sessionHash: string, activeBrandId: string | null): Promise<AuthContext | null> => {
    const [user] = await app.db.select().from(s.users).where(eq(s.users.id, userId)).limit(1);
    if (!user || user.status !== 'ACTIVE') return null;
    const roleRows = await app.db.select().from(s.userRoles).where(eq(s.userRoles.userId, userId));
    const roleIds = roleRows.map((r) => r.roleId);
    const permRows = roleIds.length
        ? await app.db.select().from(s.rolePermissions).where(inArray(s.rolePermissions.roleId, roleIds))
        : [];
    const memberships = await app.db.select().from(s.brandMemberships).where(eq(s.brandMemberships.userId, userId));
    const brandIds = memberships.map((m) => m.brandId);
    if (!brandIds.length) return null;
    const fallback = memberships.find((m) => m.isDefault)?.brandId ?? brandIds[0];
    return {
        sessionHash,
        user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName },
        roles: roleIds,
        permissions: new Set(permRows.map((p) => p.permissionId as Permission)),
        brandIds,
        activeBrandId: activeBrandId && brandIds.includes(activeBrandId) ? activeBrandId : fallback
    };
};

export default fp(async (app: FastifyInstance) => {
    app.decorateRequest('auth', null);

    // CSRF defence for cookie-authenticated mutations: custom header (not sendable cross-site without CORS) + Origin check.
    app.addHook('onRequest', async (req) => {
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
        if (req.headers['x-requested-with'] !== 'nacira') {
            throw new HttpError(403, 'CSRF', 'Permintaan ditolak (header keamanan tidak ada).');
        }
        const origin = req.headers.origin;
        if (origin && !app.config.APP_ORIGIN.includes(origin)) {
            throw new HttpError(403, 'CSRF', 'Origin tidak diizinkan.');
        }
    });

    app.addHook('preHandler', async (req) => {
        const token = req.cookies[SESSION_COOKIE];
        if (!token) return;
        const idHash = sha256(token);
        const now = new Date();
        const [session] = await app.db.select().from(s.sessions)
            .where(and(eq(s.sessions.idHash, idHash), gt(s.sessions.expiresAt, now)))
            .limit(1);
        if (!session) return;
        if (now.getTime() - session.lastSeenAt.getTime() > SESSION_IDLE_MS) {
            await app.db.delete(s.sessions).where(eq(s.sessions.idHash, idHash));
            return;
        }
        const ctx = await loadAuthContext(app, session.userId, idHash, session.activeBrandId);
        if (!ctx) return;
        req.auth = ctx;
        // Touch at most once per minute to avoid a write on every request.
        if (now.getTime() - session.lastSeenAt.getTime() > 60_000) {
            await app.db.update(s.sessions).set({ lastSeenAt: now }).where(eq(s.sessions.idHash, idHash));
        }
    });

    app.decorate('requireAuth', async (req: FastifyRequest) => {
        if (!req.auth) throw new HttpError(401, 'UNAUTHENTICATED', 'Silakan login terlebih dahulu.');
    });
});

export const requirePermission = (...perms: Permission[]) => async (req: FastifyRequest) => {
    if (!req.auth) throw new HttpError(401, 'UNAUTHENTICATED', 'Silakan login terlebih dahulu.');
    for (const p of perms) {
        if (!req.auth.permissions.has(p)) throw forbidden();
    }
};

// Brands the current request may touch. Cross-brand reads must be explicit (?scope=all) and permitted.
export const brandScope = (req: FastifyRequest): string[] => {
    const auth = req.auth!;
    const scope = (req.query as Record<string, unknown> | undefined)?.scope;
    if (scope === 'all') {
        if (!auth.permissions.has('brand.switch')) throw forbidden('Tampilan lintas brand hanya untuk Super Admin / Owner.');
        return auth.brandIds;
    }
    return [auth.activeBrandId];
};
