import { hash } from '@node-rs/argon2';
import { eq, sql } from 'drizzle-orm';
import { createDb, type Db } from './client.js';
import * as s from './schema.js';
import { PERMISSIONS, ROLES } from '../lib/rbac.js';
import { generatePassword, uuid } from '../lib/util.js';
// Reuse the existing frontend data definitions as the single seed source.
import { INITIAL_BRANDS, INITIAL_USERS, GLOBAL_CORE_KNOWLEDGE, DEFAULT_BRAND_OVERRIDES } from '../../../src/js/constants.js';

type SeedResult = { createdUsers: { username: string; email: string; password: string; role: string }[] };

export const seedDatabase = async (db: Db, opts: { resetPasswords?: boolean; fixedPassword?: string } = {}): Promise<SeedResult> => {
    const createdUsers: SeedResult['createdUsers'] = [];

    for (const [permId, description] of Object.entries(PERMISSIONS)) {
        await db.insert(s.permissions).values({ id: permId, description }).onDuplicateKeyUpdate({ set: { description } });
    }
    for (const [roleId, role] of Object.entries(ROLES)) {
        await db.insert(s.roles).values({ id: roleId, label: role.label }).onDuplicateKeyUpdate({ set: { label: role.label } });
        await db.delete(s.rolePermissions).where(eq(s.rolePermissions.roleId, roleId));
        await db.insert(s.rolePermissions).values(role.permissions.map((p) => ({ roleId, permissionId: p })));
    }

    for (const b of INITIAL_BRANDS as any[]) {
        const { id, slug, brandName, displayName, shortDescription, isActive, ...rest } = b;
        await db.insert(s.brands)
            .values({ id, slug, brandName, displayName, shortDescription, configuration: rest, isActive: isActive !== false })
            .onDuplicateKeyUpdate({ set: { brandName, displayName, shortDescription, configuration: rest } });
    }

    const allBrandIds = (INITIAL_BRANDS as any[]).map((b) => b.id);
    for (const u of INITIAL_USERS as any[]) {
        const existing = await db.select().from(s.users).where(eq(s.users.username, u.username)).limit(1);
        let userId = existing[0]?.id;
        if (!userId || opts.resetPasswords) {
            const password = opts.fixedPassword ?? generatePassword();
            const passwordHash = await hash(password);
            if (!userId) {
                userId = uuid();
                await db.insert(s.users).values({ id: userId, username: u.username, email: u.email, fullName: u.fullName, passwordHash });
            } else {
                await db.update(s.users).set({ passwordHash }).where(eq(s.users.id, userId));
            }
            createdUsers.push({ username: u.username, email: u.email, password, role: u.role });
        }
        await db.insert(s.userRoles).values({ userId, roleId: u.role }).onDuplicateKeyUpdate({ set: { roleId: u.role } });
        const memberBrands = u.role === 'SUPER_ADMIN' ? allBrandIds : [u.brandId];
        for (const brandId of memberBrands) {
            await db.insert(s.brandMemberships)
                .values({ userId, brandId, isDefault: brandId === u.brandId })
                .onDuplicateKeyUpdate({ set: { isDefault: brandId === u.brandId } });
        }
    }

    for (const k of [...GLOBAL_CORE_KNOWLEDGE, ...DEFAULT_BRAND_OVERRIDES] as any[]) {
        const row = {
            id: k.id,
            scope: k.scope,
            brandId: k.brandId ?? null,
            category: k.category || 'UMUM',
            title: k.title,
            content: k.content,
            priority: Number(k.priority) || 10,
            status: (k.isActive === false ? 'ARCHIVED' : 'ACTIVE') as 'ACTIVE' | 'ARCHIVED',
            effectiveAt: k.effectiveFrom ? new Date(k.effectiveFrom) : null,
            effectiveUntil: k.effectiveUntil ? new Date(k.effectiveUntil) : null
        };
        await db.insert(s.knowledgeDocuments).values(row).onDuplicateKeyUpdate({ set: { title: row.title, content: row.content, priority: row.priority } });
    }

    await db.insert(s.systemSettings)
        .values({ key: 'ai.allowed_models', value: { gemini: ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.8-flash'], openai: ['gpt-4o-mini', 'gpt-4o'] } })
        .onDuplicateKeyUpdate({ set: { key: sql`\`key\`` } });

    return { createdUsers };
};

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('server/src/db/seed.ts')) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    const { db, pool } = createDb(url);
    const { createdUsers } = await seedDatabase(db, { resetPasswords: process.argv.includes('--reset-passwords') });
    console.log('Seed selesai: role, permission, brand, user, knowledge.');
    if (createdUsers.length) {
        console.log('\nKredensial baru (DICETAK SEKALI — simpan di password manager, lalu ganti setelah login):');
        console.table(createdUsers);
    } else {
        console.log('User sudah ada; password tidak diubah. Jalankan `npm run db:seed -- --reset-passwords` untuk membuat ulang.');
    }
    await pool.end();
}
