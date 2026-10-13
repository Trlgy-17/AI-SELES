import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import type { AppConfig } from './config.js';
import type { Db } from './db/client.js';
import authPlugin from './plugins/auth.js';
import { HttpError, dbFailureKind } from './lib/util.js';
import authRoutes from './modules/auth/routes.js';
import crmRoutes from './modules/crm/routes.js';
import taskRoutes from './modules/tasks/routes.js';
import aiRoutes from './modules/ai/routes.js';
import migrationRoutes from './modules/migrations/routes.js';
import ereportRoutes from './modules/integrations/ereport/routes.js';
import metaRoutes from './modules/meta/routes.js';

declare module 'fastify' {
    interface FastifyInstance {
        db: Db;
        config: AppConfig;
    }
}

const REDACTED_PATHS = ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'];

export const buildApp = async ({ config, db, logger = true }: { config: AppConfig; db: Db; logger?: boolean }): Promise<FastifyInstance> => {
    const app = Fastify({
        logger: logger ? { level: config.isProduction ? 'info' : 'warn', redact: REDACTED_PATHS } : false,
        trustProxy: true,
        bodyLimit: 12 * 1024 * 1024
    });

    app.decorate('db', db);
    app.decorate('config', config);

    await app.register(cookie);
    await app.register(rateLimit, { global: false });
    await app.register(authPlugin);

    app.setErrorHandler((err, req, reply) => {
        if (err instanceof HttpError) {
            return reply.status(err.statusCode).send({ error: { code: err.code, message: err.message, details: err.details } });
        }
        if (err instanceof ZodError) {
            return reply.status(400).send({ error: { code: 'VALIDATION', message: 'Data tidak valid.', details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) } });
        }
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 429) return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Terlalu banyak permintaan. Coba lagi sebentar.' } });
        if (status && status < 500) return reply.status(status).send({ error: { code: 'BAD_REQUEST', message: (err as Error).message } });
        const dbIssue = dbFailureKind(err);
        if (dbIssue) {
            req.log.error({ err }, 'Database unavailable');
            return reply.status(503).send({
                error: {
                    code: 'DB_UNAVAILABLE',
                    message: dbIssue === 'rejected'
                        ? 'Database menolak koneksi: kredensial atau nama database tidak cocok. Periksa DATABASE_URL di env server.'
                        : 'Database tidak dapat dihubungi. Pastikan server MySQL berjalan, lalu coba lagi.'
                }
            });
        }
        req.log.error({ err }, 'Unhandled error');
        return reply.status(500).send({ error: { code: 'INTERNAL', message: 'Terjadi kesalahan server.' } });
    });

    app.get('/api/health', async () => ({ ok: true }));

    await app.register(async (v1) => {
        await v1.register(authRoutes, { prefix: '/auth' });
        await v1.register(metaRoutes);
        await v1.register(crmRoutes);
        await v1.register(taskRoutes, { prefix: '/tasks' });
        await v1.register(aiRoutes, { prefix: '/ai' });
        await v1.register(migrationRoutes, { prefix: '/migrations' });
        await v1.register(ereportRoutes, { prefix: '/integrations/ereport' });
    }, { prefix: '/api/v1' });

    return app;
};
