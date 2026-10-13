import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import * as s from '../../db/schema.js';
import { LEAD_STAGES, LOST_REASONS } from '../../db/schema.js';
import { requirePermission, brandScope } from '../../plugins/auth.js';
import { stageFromLabel, STAGE_LABELS } from '../../lib/rbac.js';
import { HttpError, notFound, uuid, badRequest } from '../../lib/util.js';
import { writeAudit, writeActivity } from '../../lib/audit.js';
import { normalizePhone } from '../../../../src/js/utils/phone.js';
import { findDuplicates, getLeadScoped, listLeads, toLeadDto } from './service.js';

const StageInput = z.union([z.enum(LEAD_STAGES), z.string()]).transform((v, ctx) => {
    const stage = stageFromLabel(v);
    if (!stage) {
        ctx.addIssue({ code: 'custom', message: 'Tahap tidak dikenal.' });
        return z.NEVER;
    }
    return stage;
});

// Omitted stays undefined (field untouched on PATCH); empty string clears to null.
const optionalText = (max: number) => z.string().trim().max(max).transform((v) => (v ? v : null)).optional();

const LeadCreate = z.object({
    name: z.string().trim().min(1, 'Nama klien wajib diisi.').max(120),
    phone: z.string().trim().max(30).optional(),
    email: z.string().trim().toLowerCase().email('Email tidak valid.').max(190).optional().or(z.literal('')),
    project: optionalText(200),
    location: optionalText(150),
    dimensions: optionalText(190),
    notes: optionalText(5000),
    value: z.number().int('Nilai harus bilangan bulat rupiah.').min(0).max(1e13).nullable().optional(),
    status: StageInput.optional(),
    lostReason: z.enum(LOST_REASONS).optional(),
    confirmDuplicate: z.boolean().optional()
});

const LeadUpdate = LeadCreate.partial().omit({ confirmDuplicate: true });

const StageChange = z.object({ stage: StageInput, lostReason: z.enum(LOST_REASONS).optional() });

const UuidParam = z.object({ id: z.string().uuid() });

export default async function crmRoutes(app: FastifyInstance) {
    app.get('/leads', { preHandler: requirePermission('client.read') }, async (req) => {
        const q = z.object({
            search: z.string().trim().max(100).optional(),
            stage: StageInput.optional(),
            source: z.enum(['ereport', 'manual']).optional(),
            scope: z.enum(['all']).optional()
        }).parse(req.query);
        const rows = await listLeads(app.db, brandScope(req), { search: q.search, stage: q.stage, source: q.source });
        return { data: rows.map(toLeadDto) };
    });

    app.get('/leads/:id', { preHandler: requirePermission('client.read') }, async (req) => {
        const { id } = UuidParam.parse(req.params);
        const row = await getLeadScoped(app.db, req.auth!.brandIds, id);
        if (!row) throw notFound('Lead');
        return { data: toLeadDto(row) };
    });

    app.post('/leads', { preHandler: requirePermission('client.create') }, async (req, reply) => {
        const body = LeadCreate.parse(req.body);
        const brandId = req.auth!.activeBrandId;
        const normalized = body.phone ? normalizePhone(body.phone) || null : null;
        const stage = body.status ?? 'PROSPECT_SURVEY';
        if (stage === 'LOST' && !body.lostReason) throw badRequest('Alasan lead batal wajib diisi.');

        const duplicates = await findDuplicates(app.db, brandId, { name: body.name, normalizedPhone: normalized, email: body.email || null, location: body.location });
        if (duplicates.length && !body.confirmDuplicate) {
            return reply.status(409).send({ error: { code: 'POTENTIAL_DUPLICATE', message: `Kemungkinan duplikat dengan "${duplicates[0].name}".`, details: { potentialDuplicates: duplicates } } });
        }

        const clientId = uuid();
        const leadId = uuid();
        const actor = req.auth!.user.id;
        await app.db.transaction(async (tx) => {
            await tx.insert(s.clients).values({
                id: clientId, brandId, name: body.name, phoneRaw: body.phone || null, normalizedPhone: normalized,
                email: body.email || null, location: body.location, source: 'manual', createdBy: actor,
                potentialDuplicateOf: duplicates[0]?.clientId ?? null
            });
            await tx.insert(s.leads).values({
                id: leadId, brandId, clientId, projectType: body.project, dimensions: body.dimensions, notes: body.notes,
                valueIdr: body.value ?? null, stage, lostReason: stage === 'LOST' ? body.lostReason : null,
                assignedTo: actor, createdBy: actor, lastActivityAt: new Date()
            });
            await tx.insert(s.leadStageHistory).values({ id: uuid(), leadId, fromStage: null, toStage: stage, lostReason: stage === 'LOST' ? body.lostReason : null, changedBy: actor });
            await writeActivity(tx, { brandId, clientId, leadId, type: 'lead.created', summary: `Lead dibuat: ${body.name}`, actorId: actor });
            await writeAudit(tx, req, { action: 'lead.create', entity: 'lead', entityId: leadId, after: { name: body.name, stage, value: body.value ?? null, duplicateConfirmed: Boolean(duplicates.length) } });
        });
        const row = await getLeadScoped(app.db, [brandId], leadId);
        return reply.status(201).send({ data: toLeadDto(row!), potentialDuplicates: duplicates });
    });

    app.patch('/leads/:id', { preHandler: requirePermission('client.update') }, async (req) => {
        const { id } = UuidParam.parse(req.params);
        const body = LeadUpdate.parse(req.body);
        const row = await getLeadScoped(app.db, req.auth!.brandIds, id);
        if (!row) throw notFound('Lead');
        const { lead, client } = row;

        const lockedFields = ['name', 'phone', 'location'] as const;
        if (client.isSourceLocked) {
            for (const f of lockedFields) {
                if (body[f] !== undefined) {
                    const current = f === 'name' ? client.name : f === 'phone' ? client.phoneRaw ?? '' : client.location ?? '';
                    if ((body[f] ?? '') !== current) throw new HttpError(409, 'SOURCE_LOCKED', 'Nama, telepon, dan lokasi dikelola di e-report dan tidak dapat diubah di sini.');
                }
            }
        }

        const nextStage = body.status ?? lead.stage;
        const lostReason = nextStage === 'LOST' ? (body.lostReason ?? lead.lostReason) : null;
        if (nextStage === 'LOST' && !lostReason) throw badRequest('Alasan lead batal wajib diisi.');

        const clientPatch: Partial<typeof s.clients.$inferInsert> = {};
        if (!client.isSourceLocked) {
            if (body.name !== undefined) clientPatch.name = body.name;
            if (body.phone !== undefined) {
                clientPatch.phoneRaw = body.phone || null;
                clientPatch.normalizedPhone = body.phone ? normalizePhone(body.phone) || null : null;
            }
            if (body.location !== undefined) clientPatch.location = body.location;
        }
        if (body.email !== undefined) clientPatch.email = body.email || null;

        const leadPatch: Partial<typeof s.leads.$inferInsert> = { lastActivityAt: new Date() };
        if (body.project !== undefined) leadPatch.projectType = body.project;
        if (body.dimensions !== undefined) leadPatch.dimensions = body.dimensions;
        if (body.notes !== undefined) leadPatch.notes = body.notes;
        if (body.value !== undefined) leadPatch.valueIdr = body.value;
        if (nextStage !== lead.stage || lostReason !== lead.lostReason) {
            leadPatch.stage = nextStage;
            leadPatch.lostReason = lostReason;
        }

        const actor = req.auth!.user.id;
        await app.db.transaction(async (tx) => {
            if (Object.keys(clientPatch).length) await tx.update(s.clients).set(clientPatch).where(eq(s.clients.id, client.id));
            await tx.update(s.leads).set(leadPatch).where(eq(s.leads.id, lead.id));
            if (nextStage !== lead.stage) {
                await tx.insert(s.leadStageHistory).values({ id: uuid(), leadId: lead.id, fromStage: lead.stage, toStage: nextStage, lostReason, changedBy: actor });
                await writeActivity(tx, { brandId: lead.brandId, clientId: client.id, leadId: lead.id, type: 'lead.stage_changed', summary: `Tahap: ${STAGE_LABELS[lead.stage]} → ${STAGE_LABELS[nextStage]}`, actorId: actor });
            } else {
                await writeActivity(tx, { brandId: lead.brandId, clientId: client.id, leadId: lead.id, type: 'lead.updated', summary: 'Data lead diperbarui', actorId: actor });
            }
            await writeAudit(tx, req, { action: 'lead.update', entity: 'lead', entityId: lead.id, brandId: lead.brandId, before: { ...client, ...lead }, after: { ...clientPatch, ...leadPatch } });
        });
        const updated = await getLeadScoped(app.db, req.auth!.brandIds, id);
        return { data: toLeadDto(updated!) };
    });

    app.patch('/leads/:id/stage', { preHandler: requirePermission('client.update') }, async (req) => {
        const { id } = UuidParam.parse(req.params);
        const body = StageChange.parse(req.body);
        const row = await getLeadScoped(app.db, req.auth!.brandIds, id);
        if (!row) throw notFound('Lead');
        if (body.stage === 'LOST' && !body.lostReason) throw badRequest('Alasan lead batal wajib diisi.');
        if (body.stage === row.lead.stage) return { data: toLeadDto(row) };
        const actor = req.auth!.user.id;
        await app.db.transaction(async (tx) => {
            await tx.update(s.leads).set({ stage: body.stage, lostReason: body.stage === 'LOST' ? body.lostReason : null, lastActivityAt: new Date() }).where(eq(s.leads.id, id));
            await tx.insert(s.leadStageHistory).values({ id: uuid(), leadId: id, fromStage: row.lead.stage, toStage: body.stage, lostReason: body.lostReason ?? null, changedBy: actor });
            await writeActivity(tx, { brandId: row.lead.brandId, clientId: row.client.id, leadId: id, type: 'lead.stage_changed', summary: `Tahap: ${STAGE_LABELS[row.lead.stage]} → ${STAGE_LABELS[body.stage]}`, actorId: actor });
            await writeAudit(tx, req, { action: 'lead.stage_change', entity: 'lead', entityId: id, brandId: row.lead.brandId, before: { stage: row.lead.stage }, after: { stage: body.stage, lostReason: body.lostReason ?? null } });
        });
        const updated = await getLeadScoped(app.db, req.auth!.brandIds, id);
        return { data: toLeadDto(updated!) };
    });

    app.delete('/leads/:id', { preHandler: requirePermission('client.delete') }, async (req) => {
        const { id } = UuidParam.parse(req.params);
        const row = await getLeadScoped(app.db, req.auth!.brandIds, id);
        if (!row) throw notFound('Lead');
        if (row.client.isSourceLocked) throw new HttpError(409, 'SOURCE_LOCKED', 'Lead dari e-report tidak dapat dihapus di sini. Arsipkan di e-report.');
        const now = new Date();
        await app.db.transaction(async (tx) => {
            await tx.update(s.leads).set({ deletedAt: now }).where(eq(s.leads.id, id));
            const remaining = await tx.select({ id: s.leads.id }).from(s.leads).where(and(eq(s.leads.clientId, row.client.id), isNull(s.leads.deletedAt)));
            if (!remaining.length) await tx.update(s.clients).set({ deletedAt: now }).where(eq(s.clients.id, row.client.id));
            await tx.update(s.followUpTasks).set({ leadId: null }).where(eq(s.followUpTasks.leadId, id));
            await writeActivity(tx, { brandId: row.lead.brandId, clientId: row.client.id, leadId: id, type: 'lead.archived', summary: 'Lead diarsipkan', actorId: req.auth!.user.id });
            await writeAudit(tx, req, { action: 'lead.archive', entity: 'lead', entityId: id, brandId: row.lead.brandId, before: { name: row.client.name, stage: row.lead.stage } });
        });
        return { ok: true };
    });

    app.get('/clients/:id/duplicates', { preHandler: requirePermission('client.read') }, async (req) => {
        const { id } = UuidParam.parse(req.params);
        const [client] = await app.db.select().from(s.clients)
            .where(and(eq(s.clients.id, id), inArray(s.clients.brandId, req.auth!.brandIds), isNull(s.clients.deletedAt))).limit(1);
        if (!client) throw notFound('Klien');
        return { data: await findDuplicates(app.db, client.brandId, client, client.id) };
    });

    app.get('/activities', { preHandler: requirePermission('client.read') }, async (req) => {
        const q = z.object({ clientId: z.string().uuid().optional(), leadId: z.string().uuid().optional() }).parse(req.query);
        const conds = [inArray(s.activities.brandId, req.auth!.brandIds)];
        if (q.clientId) conds.push(eq(s.activities.clientId, q.clientId));
        if (q.leadId) conds.push(eq(s.activities.leadId, q.leadId));
        const rows = await app.db.select().from(s.activities).where(and(...conds)).orderBy(desc(s.activities.createdAt)).limit(200);
        return { data: rows };
    });
}
