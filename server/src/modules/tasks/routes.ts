import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { and, asc, eq, gte, inArray, isNull, lt, type SQL } from 'drizzle-orm';
import * as s from '../../db/schema.js';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../db/schema.js';
import { requirePermission, brandScope } from '../../plugins/auth.js';
import { notFound, uuid } from '../../lib/util.js';
import { writeAudit, writeActivity } from '../../lib/audit.js';
import { getLeadScoped } from '../crm/service.js';

const TaskBody = z.object({
    leadId: z.string().uuid().nullable().optional(),
    type: z.string().trim().min(1).max(100),
    reason: z.string().trim().max(255).optional(),
    dueAt: z.string().datetime({ offset: true }).nullable().optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    assignedTo: z.string().uuid().nullable().optional()
});

const TaskPatch = TaskBody.partial().extend({ status: z.enum(TASK_STATUSES).optional() });

// Asia/Jakarta has no DST: day boundaries are fixed UTC+7 offsets.
const jakartaDayBounds = (now = new Date()) => {
    const offset = 7 * 3600_000;
    const local = new Date(now.getTime() + offset);
    const start = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - offset);
    return { start, end: new Date(start.getTime() + 86400_000) };
};

export default async function taskRoutes(app: FastifyInstance) {
    app.get('/', { preHandler: requirePermission('task.manage') }, async (req) => {
        const q = z.object({ view: z.enum(['today', 'overdue', 'upcoming', 'all']).default('all'), leadId: z.string().uuid().optional(), scope: z.enum(['all']).optional() }).parse(req.query);
        const conds: SQL[] = [inArray(s.followUpTasks.brandId, brandScope(req)), isNull(s.followUpTasks.deletedAt)];
        if (q.leadId) conds.push(eq(s.followUpTasks.leadId, q.leadId));
        const { start, end } = jakartaDayBounds();
        if (q.view !== 'all') conds.push(eq(s.followUpTasks.status, 'PENDING'));
        if (q.view === 'today') conds.push(gte(s.followUpTasks.dueAt, start), lt(s.followUpTasks.dueAt, end));
        if (q.view === 'overdue') conds.push(lt(s.followUpTasks.dueAt, start));
        if (q.view === 'upcoming') conds.push(gte(s.followUpTasks.dueAt, end));
        const rows = await app.db.select().from(s.followUpTasks).where(and(...conds)).orderBy(asc(s.followUpTasks.dueAt)).limit(500);
        return { data: rows };
    });

    app.post('/', { preHandler: requirePermission('task.manage') }, async (req, reply) => {
        const body = TaskBody.parse(req.body);
        const brandId = req.auth!.activeBrandId;
        let clientId: string | null = null;
        if (body.leadId) {
            const lead = await getLeadScoped(app.db, [brandId], body.leadId);
            if (!lead) throw notFound('Lead');
            clientId = lead.client.id;
        }
        const id = uuid();
        await app.db.transaction(async (tx) => {
            await tx.insert(s.followUpTasks).values({
                id, brandId, clientId, leadId: body.leadId ?? null, type: body.type, reason: body.reason ?? null,
                priority: body.priority ?? 'NORMAL', dueAt: body.dueAt ? new Date(body.dueAt) : null,
                assignedTo: body.assignedTo ?? req.auth!.user.id, createdBy: req.auth!.user.id
            });
            await writeActivity(tx, { brandId, clientId, leadId: body.leadId ?? null, type: 'task.created', summary: `Follow-up dijadwalkan: ${body.type}`, actorId: req.auth!.user.id });
            await writeAudit(tx, req, { action: 'task.create', entity: 'task', entityId: id, after: { type: body.type, dueAt: body.dueAt ?? null } });
        });
        const [row] = await app.db.select().from(s.followUpTasks).where(eq(s.followUpTasks.id, id));
        return reply.status(201).send({ data: row });
    });

    app.patch('/:id', { preHandler: requirePermission('task.manage') }, async (req) => {
        const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
        const body = TaskPatch.parse(req.body);
        const [task] = await app.db.select().from(s.followUpTasks)
            .where(and(eq(s.followUpTasks.id, id), inArray(s.followUpTasks.brandId, req.auth!.brandIds), isNull(s.followUpTasks.deletedAt))).limit(1);
        if (!task) throw notFound('Tugas');
        const patch: Partial<typeof s.followUpTasks.$inferInsert> = {};
        if (body.type !== undefined) patch.type = body.type;
        if (body.reason !== undefined) patch.reason = body.reason;
        if (body.priority !== undefined) patch.priority = body.priority;
        if (body.dueAt !== undefined) patch.dueAt = body.dueAt ? new Date(body.dueAt) : null;
        if (body.status !== undefined) {
            patch.status = body.status;
            patch.completedAt = body.status === 'DONE' ? new Date() : null;
        }
        await app.db.transaction(async (tx) => {
            await tx.update(s.followUpTasks).set(patch).where(eq(s.followUpTasks.id, id));
            if (body.status === 'DONE') {
                await writeActivity(tx, { brandId: task.brandId, clientId: task.clientId, leadId: task.leadId, type: 'task.completed', summary: `Follow-up selesai: ${task.type}`, actorId: req.auth!.user.id });
            }
            await writeAudit(tx, req, { action: 'task.update', entity: 'task', entityId: id, brandId: task.brandId, before: task, after: patch });
        });
        const [row] = await app.db.select().from(s.followUpTasks).where(eq(s.followUpTasks.id, id));
        return { data: row };
    });

    app.delete('/:id', { preHandler: requirePermission('task.manage') }, async (req) => {
        const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
        const [task] = await app.db.select().from(s.followUpTasks)
            .where(and(eq(s.followUpTasks.id, id), inArray(s.followUpTasks.brandId, req.auth!.brandIds), isNull(s.followUpTasks.deletedAt))).limit(1);
        if (!task) throw notFound('Tugas');
        await app.db.transaction(async (tx) => {
            await tx.update(s.followUpTasks).set({ deletedAt: new Date() }).where(eq(s.followUpTasks.id, id));
            await writeAudit(tx, req, { action: 'task.archive', entity: 'task', entityId: id, brandId: task.brandId, before: task });
        });
        return { ok: true };
    });
}
