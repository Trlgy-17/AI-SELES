import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import * as s from '../../db/schema.js';
import { requirePermission } from '../../plugins/auth.js';
import { uuid } from '../../lib/util.js';
import { writeAudit } from '../../lib/audit.js';
import { runLegacyImport } from './legacyImport.js';

const LegacyBody = z.object({
    leads: z.array(z.record(z.string(), z.unknown())).max(20_000).default([]),
    tasks: z.array(z.record(z.string(), z.unknown())).max(20_000).default([]),
    tombstones: z.object({ leads: z.array(z.string()).optional(), tasks: z.array(z.string()).optional() }).optional()
});

export default async function migrationRoutes(app: FastifyInstance) {
    app.post('/legacy-import', { preHandler: requirePermission('data.import') }, async (req, reply) => {
        const body = LegacyBody.parse(req.body);
        const auth = req.auth!;
        const report = await runLegacyImport(app.db, { actorId: auth.user.id, activeBrandId: auth.activeBrandId, allowedBrandIds: auth.brandIds }, body);
        const runId = uuid();
        await app.db.insert(s.migrationRuns).values({
            id: runId, kind: 'legacy_localstorage', brandId: auth.activeBrandId, actorId: auth.user.id,
            totalRecords: report.totalRecords, imported: report.imported, skipped: report.skipped, duplicates: report.duplicates,
            invalid: report.invalid, failed: report.failed, report: { brandDefaulted: report.brandDefaulted, flaggedDuplicates: report.flaggedDuplicates, issues: report.issues }
        });
        await writeAudit(app.db, req, { action: 'data.legacy_import', entity: 'migration_run', entityId: runId, after: { total: report.totalRecords, imported: report.imported } });
        return reply.status(201).send({ data: { runId, ...report } });
    });

    app.get('/runs', { preHandler: requirePermission('data.import') }, async (req) => {
        const rows = await app.db.select().from(s.migrationRuns).where(eq(s.migrationRuns.actorId, req.auth!.user.id)).orderBy(desc(s.migrationRuns.createdAt)).limit(20);
        return { data: rows };
    });
}
