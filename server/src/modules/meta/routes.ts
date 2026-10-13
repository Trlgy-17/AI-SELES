import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { and, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import * as s from '../../db/schema.js';
import { requirePermission, brandScope } from '../../plugins/auth.js';

export default async function metaRoutes(app: FastifyInstance) {
    // Knowledge visible to the active brand: global + that brand's overrides/campaigns. FULLTEXT search when q is given.
    app.get('/knowledge', { preHandler: app.requireAuth }, async (req) => {
        const q = z.object({ q: z.string().trim().max(200).optional() }).parse(req.query);
        const brandId = req.auth!.activeBrandId;
        const visibility = and(eq(s.knowledgeDocuments.status, 'ACTIVE'), or(eq(s.knowledgeDocuments.scope, 'GLOBAL'), eq(s.knowledgeDocuments.brandId, brandId)));
        if (q.q && q.q.length >= 3) {
            const rows = await app.db.select({
                doc: s.knowledgeDocuments,
                score: sql<number>`MATCH(${s.knowledgeDocuments.title}, ${s.knowledgeDocuments.content}) AGAINST (${q.q} IN NATURAL LANGUAGE MODE)`
            }).from(s.knowledgeDocuments)
                .where(and(visibility, sql`MATCH(${s.knowledgeDocuments.title}, ${s.knowledgeDocuments.content}) AGAINST (${q.q} IN NATURAL LANGUAGE MODE)`))
                .orderBy(desc(sql`2`), desc(s.knowledgeDocuments.priority))
                .limit(20);
            return { data: rows.map((r) => ({ ...r.doc, score: Number(r.score) })) };
        }
        const rows = await app.db.select().from(s.knowledgeDocuments).where(visibility).orderBy(desc(s.knowledgeDocuments.priority));
        return { data: rows };
    });

    app.get('/audit-logs', { preHandler: requirePermission('audit.view') }, async (req) => {
        const q = z.object({ entity: z.string().max(60).optional(), entityId: z.string().max(60).optional(), scope: z.enum(['all']).optional() }).parse(req.query);
        const conds = [inArray(s.auditLogs.brandId, brandScope(req))];
        if (q.entity) conds.push(eq(s.auditLogs.entity, q.entity));
        if (q.entityId) conds.push(eq(s.auditLogs.entityId, q.entityId));
        const rows = await app.db.select().from(s.auditLogs).where(and(...conds)).orderBy(desc(s.auditLogs.createdAt)).limit(200);
        return { data: rows };
    });

    app.get('/dashboard/summary', { preHandler: requirePermission('client.read') }, async (req) => {
        const brandIds = brandScope(req);
        const stages = await app.db.select({ stage: s.leads.stage, count: sql<number>`COUNT(*)`, value: sql<number>`COALESCE(SUM(${s.leads.valueIdr}),0)` })
            .from(s.leads)
            .where(and(inArray(s.leads.brandId, brandIds), isNull(s.leads.deletedAt)))
            .groupBy(s.leads.stage);
        return { data: { stages: stages.map((r) => ({ ...r, count: Number(r.count), value: Number(r.value) })) } };
    });
}
