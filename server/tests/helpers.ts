import { hash } from '@node-rs/argon2';
import { sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createDb, type Db } from '../src/db/client.js';
import * as s from '../src/db/schema.js';
import { seedDatabase } from '../src/db/seed.js';
import { uuid } from '../src/lib/util.js';

export const TEST_PASSWORD = 'test-password-123';
export const ORIGIN = 'http://localhost:3000';
export const TUNNEL_ORIGIN = 'http://192.168.1.40:3000';

const TABLES = [
    'sessions', 'user_roles', 'brand_memberships', 'users', 'role_permissions', 'roles', 'permissions', 'brands',
    'clients', 'leads', 'lead_stage_history', 'follow_up_tasks', 'activities', 'audit_logs', 'system_settings',
    'migration_runs', 'ai_generations', 'ai_feedback', 'knowledge_documents', 'ereport_account_mappings',
    'ereport_status_mappings', 'external_sync_runs'
];

export const setup = async (): Promise<{ app: FastifyInstance; db: Db; close: () => Promise<void> }> => {
    const url = process.env.TEST_DATABASE_URL;
    if (!url || !/_test\b|_test$/.test(new URL(url).pathname)) throw new Error('TEST_DATABASE_URL must point to a *_test database');
    const config = loadConfig({ NODE_ENV: 'test', DATABASE_URL: url, APP_ORIGIN: `${ORIGIN},${TUNNEL_ORIGIN}`, GEMINI_API_KEY: 'test-key' });
    const { db, pool } = createDb(url);
    await db.execute(sql.raw('SET FOREIGN_KEY_CHECKS=0'));
    for (const t of TABLES) await db.execute(sql.raw(`TRUNCATE TABLE \`${t}\``));
    await seedDatabase(db, { resetPasswords: true, fixedPassword: TEST_PASSWORD });
    // Extra SALES user in brand_heya for permission tests.
    const salesId = uuid();
    await db.insert(s.users).values({ id: salesId, username: 'sales_heya', email: 'sales.heya@test.local', fullName: 'Sales Heya', passwordHash: await hash(TEST_PASSWORD) });
    await db.insert(s.userRoles).values({ userId: salesId, roleId: 'SALES' });
    await db.insert(s.brandMemberships).values({ userId: salesId, brandId: 'brand_heya', isDefault: true });
    const app = await buildApp({ config, db, logger: false });
    await app.ready();
    return { app, db, close: async () => { await app.close(); await pool.end(); } };
};

export type Session = { cookie: string; body: any };

export const login = async (app: FastifyInstance, identifier: string, password = TEST_PASSWORD): Promise<Session> => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { 'x-requested-with': 'nacira', origin: ORIGIN }, payload: { identifier, password } });
    if (res.statusCode !== 200) throw new Error(`login ${identifier} failed: ${res.statusCode} ${res.body}`);
    const setCookie = res.headers['set-cookie'];
    const raw = Array.isArray(setCookie) ? setCookie[0] : String(setCookie);
    return { cookie: raw.split(';')[0], body: res.json() };
};

export const api = (app: FastifyInstance, session: Session | null) => ({
    get: (url: string) => app.inject({ method: 'GET', url, headers: session ? { cookie: session.cookie } : {} }),
    send: (method: 'POST' | 'PATCH' | 'PUT' | 'DELETE', url: string, payload?: unknown) =>
        app.inject({ method, url, payload: payload as any, headers: { 'x-requested-with': 'nacira', origin: ORIGIN, ...(session ? { cookie: session.cookie } : {}) } })
});
