import { and, desc, eq, inArray, isNull, like, or, sql, type SQL } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import * as s from '../../db/schema.js';
import { STAGE_LABELS, type StageCode } from '../../lib/rbac.js';
import { nameSimilarity } from '../../lib/util.js';

export type LeadRow = {
    lead: typeof s.leads.$inferSelect;
    client: typeof s.clients.$inferSelect;
};

// Shape consumed by the existing React CRM (keeps field names used across the UI).
export const toLeadDto = ({ lead, client }: LeadRow) => ({
    id: lead.id,
    clientId: client.id,
    brandId: lead.brandId,
    name: client.name,
    phoneRaw: client.phoneRaw ?? '',
    phoneNormalized: client.normalizedPhone ?? '',
    email: client.email ?? '',
    location: client.location ?? '',
    project: lead.projectType ?? '',
    dimensions: lead.dimensions ?? '',
    notes: lead.notes ?? '',
    value: lead.valueIdr ?? null,
    stage: lead.stage,
    status: STAGE_LABELS[lead.stage as StageCode],
    lostReason: lead.lostReason ?? null,
    assignedTo: lead.assignedTo ?? null,
    source: client.source,
    externalSource: lead.externalSource ?? client.externalSource ?? null,
    externalStatus: lead.externalStatus ?? null,
    isSourceLocked: client.isSourceLocked,
    potentialDuplicateOf: client.potentialDuplicateOf ?? null,
    lastActivityAt: lead.lastActivityAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString()
});

export const listLeads = async (db: Db, brandIds: string[], opts: { search?: string; stage?: StageCode; source?: 'ereport' | 'manual'; limit?: number }) => {
    const where: SQL[] = [inArray(s.leads.brandId, brandIds), isNull(s.leads.deletedAt), isNull(s.clients.deletedAt)];
    if (opts.stage) where.push(eq(s.leads.stage, opts.stage));
    if (opts.source === 'ereport') where.push(eq(s.clients.externalSource, 'ereport'));
    if (opts.source === 'manual') where.push(isNull(s.clients.externalSource));
    if (opts.search) {
        const q = `%${opts.search.replace(/[%_\\]/g, (c) => '\\' + c)}%`;
        const digits = opts.search.replace(/\D/g, '');
        const conds: SQL[] = [like(s.clients.name, q), like(s.leads.projectType, q), like(s.clients.location, q)];
        if (digits.length >= 4) conds.push(like(s.clients.normalizedPhone, `%${digits.replace(/^0/, '')}%`));
        where.push(or(...conds)!);
    }
    const rows = await db.select({ lead: s.leads, client: s.clients })
        .from(s.leads)
        .innerJoin(s.clients, eq(s.clients.id, s.leads.clientId))
        .where(and(...where))
        .orderBy(desc(s.leads.createdAt))
        .limit(Math.min(opts.limit ?? 500, 2000));
    return rows;
};

export const getLeadScoped = async (db: Db, brandIds: string[], leadId: string): Promise<LeadRow | null> => {
    const [row] = await db.select({ lead: s.leads, client: s.clients })
        .from(s.leads)
        .innerJoin(s.clients, eq(s.clients.id, s.leads.clientId))
        .where(and(eq(s.leads.id, leadId), inArray(s.leads.brandId, brandIds), isNull(s.leads.deletedAt)))
        .limit(1);
    return row ?? null;
};

export type DuplicateCandidate = { clientId: string; name: string; reason: 'phone' | 'email' | 'name_location'; score: number };

export const findDuplicates = async (
    db: Db,
    brandId: string,
    input: { name: string; normalizedPhone?: string | null; email?: string | null; location?: string | null },
    excludeClientId?: string
): Promise<DuplicateCandidate[]> => {
    const conds: SQL[] = [];
    if (input.normalizedPhone) conds.push(eq(s.clients.normalizedPhone, input.normalizedPhone));
    if (input.email) conds.push(eq(s.clients.email, input.email.toLowerCase()));
    if (input.location) conds.push(eq(s.clients.location, input.location));
    if (!conds.length) return [];
    const rows = await db.select().from(s.clients)
        .where(and(eq(s.clients.brandId, brandId), isNull(s.clients.deletedAt), or(...conds)))
        .limit(50);
    const out: DuplicateCandidate[] = [];
    for (const c of rows) {
        if (c.id === excludeClientId) continue;
        if (input.normalizedPhone && c.normalizedPhone === input.normalizedPhone) out.push({ clientId: c.id, name: c.name, reason: 'phone', score: 1 });
        else if (input.email && c.email && c.email.toLowerCase() === input.email.toLowerCase()) out.push({ clientId: c.id, name: c.name, reason: 'email', score: 0.95 });
        else if (input.location && c.location === input.location) {
            const score = nameSimilarity(input.name, c.name);
            if (score >= 0.85) out.push({ clientId: c.id, name: c.name, reason: 'name_location', score: Number(score.toFixed(2)) });
        }
    }
    return out;
};

export const touchLead = (db: Pick<Db, 'update'>, leadId: string) =>
    db.update(s.leads).set({ lastActivityAt: sql`CURRENT_TIMESTAMP(3)` }).where(eq(s.leads.id, leadId));
