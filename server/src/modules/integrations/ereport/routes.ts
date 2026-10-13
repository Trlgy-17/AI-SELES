import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import * as s from '../../../db/schema.js';
import { LEAD_STAGES } from '../../../db/schema.js';
import { requirePermission } from '../../../plugins/auth.js';
import { HttpError } from '../../../lib/util.js';
import { writeAudit } from '../../../lib/audit.js';
import { createEreportClient, EreportError, type EreportClient } from './client.js';
import { runEreportSync } from './sync.js';

declare module 'fastify' {
    interface FastifyInstance {
        ereportClientFactory?: () => EreportClient;
    }
}

export default async function ereportRoutes(app: FastifyInstance) {
    const getClient = () => {
        try {
            return app.ereportClientFactory ? app.ereportClientFactory() : createEreportClient(app.config.EREPORT_API_URL, app.config.EREPORT_API_TOKEN);
        } catch (err) {
            if (err instanceof EreportError) throw new HttpError(503, 'EREPORT_NOT_CONFIGURED', err.message);
            throw err;
        }
    };
    const wrap = async <T>(fn: () => Promise<T>) => {
        try {
            return await fn();
        } catch (err) {
            if (err instanceof EreportError) throw new HttpError(502, 'EREPORT_ERROR', err.message);
            throw err;
        }
    };

    const guard = { preHandler: requirePermission('settings.manage') };

    app.get('/status', guard, async () => {
        const configured = Boolean(app.ereportClientFactory || (app.config.EREPORT_API_URL && app.config.EREPORT_API_TOKEN));
        const [lastRun] = await app.db.select().from(s.externalSyncRuns).where(eq(s.externalSyncRuns.source, 'ereport')).orderBy(desc(s.externalSyncRuns.startedAt)).limit(1);
        return {
            data: {
                configured,
                baseUrl: app.config.EREPORT_API_URL ? new URL(app.config.EREPORT_API_URL).origin : null,
                intervalMinutes: app.config.EREPORT_SYNC_INTERVAL_MINUTES,
                readOnly: true,
                lastRun: lastRun ?? null
            }
        };
    });

    app.get('/accounts', guard, async () => {
        const remote = await wrap(() => getClient().accounts());
        const mappings = new Map((await app.db.select().from(s.ereportAccountMappings)).map((m) => [m.ereportAccountId, m]));
        return {
            data: remote.data.map((a) => {
                const m = mappings.get(String(a.id));
                return { id: String(a.id), name: a.name, city: a.city ?? null, brandId: m?.brandId ?? null, enabled: m?.enabled ?? false };
            })
        };
    });

    app.put('/mappings', guard, async (req) => {
        const body = z.object({
            mappings: z.array(z.object({
                ereportAccountId: z.string().min(1).max(40),
                ereportAccountName: z.string().min(1).max(190),
                brandId: z.string().max(40).nullable(),
                enabled: z.boolean()
            })).max(200)
        }).parse(req.body);
        const allowed = new Set((await app.db.select({ id: s.brands.id }).from(s.brands)).map((b) => b.id));
        for (const m of body.mappings) {
            if (m.brandId && !allowed.has(m.brandId)) throw new HttpError(400, 'BAD_BRAND', `Brand ${m.brandId} tidak dikenal.`);
            if (m.enabled && !m.brandId) throw new HttpError(400, 'BAD_MAPPING', `Akun ${m.ereportAccountName} harus dipetakan ke brand sebelum diaktifkan.`);
            await app.db.insert(s.ereportAccountMappings).values(m).onDuplicateKeyUpdate({ set: { ereportAccountName: m.ereportAccountName, brandId: m.brandId, enabled: m.enabled } });
        }
        await writeAudit(app.db, req, { action: 'ereport.mappings_update', entity: 'ereport_account_mapping', after: { mappings: body.mappings } });
        return { data: await app.db.select().from(s.ereportAccountMappings) };
    });

    app.get('/status-mappings', guard, async () => {
        const remote = await wrap(() => getClient().statuses());
        const local = new Map((await app.db.select().from(s.ereportStatusMappings)).map((m) => [m.ereportStatusId, m.stage]));
        return { data: remote.data.map((st) => ({ id: String(st.id), name: st.name, color: st.color ?? null, stage: local.get(String(st.id)) ?? null })) };
    });

    app.put('/status-mappings', guard, async (req) => {
        const body = z.object({
            mappings: z.array(z.object({ ereportStatusId: z.string().min(1).max(40), ereportStatusName: z.string().min(1).max(190), stage: z.enum(LEAD_STAGES) })).max(200)
        }).parse(req.body);
        for (const m of body.mappings) {
            await app.db.insert(s.ereportStatusMappings).values(m).onDuplicateKeyUpdate({ set: { ereportStatusName: m.ereportStatusName, stage: m.stage } });
        }
        await writeAudit(app.db, req, { action: 'ereport.status_mappings_update', entity: 'ereport_status_mapping', after: { count: body.mappings.length } });
        return { ok: true };
    });

    app.post('/sync', guard, async (req) => {
        const client = getClient();
        const result = await wrap(() => runEreportSync(app.db, client, { trigger: 'manual', actorId: req.auth!.user.id }))
            .catch((err) => {
                if (err instanceof Error && err.message.includes('sedang berjalan')) throw new HttpError(409, 'SYNC_RUNNING', err.message);
                throw err;
            });
        await writeAudit(app.db, req, { action: 'ereport.sync', entity: 'external_sync_run', entityId: result.runId, after: result });
        return { data: result };
    });

    app.get('/runs', guard, async () => ({
        data: await app.db.select().from(s.externalSyncRuns).where(eq(s.externalSyncRuns.source, 'ereport')).orderBy(desc(s.externalSyncRuns.startedAt)).limit(20)
    }));
}
