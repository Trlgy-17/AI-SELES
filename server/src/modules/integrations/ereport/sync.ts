import { and, eq, isNull, ne, or } from 'drizzle-orm';
import type { Db } from '../../../db/client.js';
import * as s from '../../../db/schema.js';
import { sha256, uuid } from '../../../lib/util.js';
import { normalizePhone } from '../../../../../src/js/utils/phone.js';
import type { EreportClient, EreportConsultation } from './client.js';

export type SyncCounts = { fetched: number; created: number; updated: number; unchanged: number; archived: number; duplicateFlags: number; failed: number };

const cursorKey = (accountId: string) => `ereport.cursor.${accountId}`;

const locationOf = (c: EreportConsultation) =>
    [c.address, c.district, c.city, c.province].map((v) => (v ?? '').trim()).filter(Boolean).join(', ').slice(0, 190) || null;

const projectOf = (c: EreportConsultation) => {
    const parts: string[] = [];
    for (const v of [...(c.needs ?? []), c.product_details ?? '']) {
        const t = v.trim();
        if (t && !parts.some((p) => p.toLowerCase() === t.toLowerCase())) parts.push(t);
    }
    return parts.join(' — ').slice(0, 200) || null;
};

// Only source-owned fields participate in change detection.
export const sourceHash = (c: EreportConsultation) =>
    sha256(JSON.stringify([c.client_name, c.phone, c.emergency_phone, c.address, c.district, c.city, c.province, c.needs, c.product_details, c.status_id, c.consultation_date, c.deleted_at]));

let running = false;

export const runEreportSync = async (db: Db, client: EreportClient, opts: { trigger: 'manual' | 'schedule'; actorId?: string | null }) => {
    if (running) throw new Error('Sinkronisasi e-report sedang berjalan.');
    running = true;
    const runId = uuid();
    const counts: SyncCounts = { fetched: 0, created: 0, updated: 0, unchanged: 0, archived: 0, duplicateFlags: 0, failed: 0 };
    const errors: string[] = [];
    await db.insert(s.externalSyncRuns).values({ id: runId, source: 'ereport', trigger: opts.trigger, status: 'RUNNING', actorId: opts.actorId ?? null });

    try {
        const mappings = (await db.select().from(s.ereportAccountMappings)).filter((m) => m.enabled && m.brandId);
        const statusMap = new Map((await db.select().from(s.ereportStatusMappings)).map((m) => [m.ereportStatusId, m.stage]));

        for (const mapping of mappings) {
            const brandId = mapping.brandId!;
            const [cursorRow] = await db.select().from(s.systemSettings).where(eq(s.systemSettings.key, cursorKey(mapping.ereportAccountId))).limit(1);
            const since = typeof cursorRow?.value === 'string' ? cursorRow.value : undefined;
            let maxUpdated = since ?? '';
            let page = 1;
            let lastPage = 1;
            do {
                const res = await client.consultations({ account: mapping.ereportAccountId, updated_since: since, page, per_page: 100, include_deleted: true });
                lastPage = res.meta?.last_page ?? 1;
                for (const c of res.data) {
                    counts.fetched++;
                    // Defense in depth: never accept rows for an account we did not ask for.
                    if (String(c.account_id) !== mapping.ereportAccountId) {
                        counts.failed++;
                        errors.push(`Baris ${c.consultation_id} berasal dari akun lain, diabaikan.`);
                        continue;
                    }
                    if (c.updated_at && c.updated_at > maxUpdated) maxUpdated = c.updated_at;
                    try {
                        await upsertConsultation(db, brandId, c, statusMap, counts);
                    } catch (err: any) {
                        counts.failed++;
                        errors.push(`${c.consultation_id}: ${String(err?.code || err?.message).slice(0, 120)}`);
                    }
                }
                page++;
            } while (page <= lastPage);

            if (maxUpdated) {
                await db.insert(s.systemSettings).values({ key: cursorKey(mapping.ereportAccountId), value: maxUpdated })
                    .onDuplicateKeyUpdate({ set: { value: maxUpdated } });
            }
        }

        const status = counts.failed ? 'PARTIAL' : 'SUCCESS';
        await db.update(s.externalSyncRuns).set({ status, ...counts, error: errors.slice(0, 50).join('\n') || null, finishedAt: new Date() }).where(eq(s.externalSyncRuns.id, runId));
        return { runId, status, ...counts };
    } catch (err: any) {
        await db.update(s.externalSyncRuns).set({ status: 'FAILED', ...counts, error: String(err?.message || err).slice(0, 2000), finishedAt: new Date() }).where(eq(s.externalSyncRuns.id, runId));
        throw err;
    } finally {
        running = false;
    }
};

const upsertConsultation = async (db: Db, brandId: string, c: EreportConsultation, statusMap: Map<string, string>, counts: SyncCounts) => {
    const externalId = String(c.consultation_id);
    const hash = sourceHash(c);
    const [existing] = await db.select().from(s.clients).where(and(eq(s.clients.externalSource, 'ereport'), eq(s.clients.externalId, externalId))).limit(1);
    const mappedStage = c.status_id != null ? (statusMap.get(String(c.status_id)) as typeof s.LEAD_STAGES[number] | undefined) : undefined;
    const name = (c.client_name || 'Tanpa nama').slice(0, 120);
    const phoneRaw = c.phone ? String(c.phone).slice(0, 40) : null;
    const normalized = phoneRaw ? normalizePhone(phoneRaw) || c.phone_normalized || null : c.phone_normalized || null;
    const externalUpdatedAt = c.updated_at ? new Date(c.updated_at) : null;

    if (existing) {
        const [lead] = await db.select().from(s.leads).where(and(eq(s.leads.externalSource, 'ereport'), eq(s.leads.externalId, externalId))).limit(1);
        if (c.deleted_at) {
            if (!existing.deletedAt) {
                const now = new Date();
                await db.transaction(async (tx) => {
                    await tx.update(s.clients).set({ deletedAt: now, externalHash: hash }).where(eq(s.clients.id, existing.id));
                    if (lead) await tx.update(s.leads).set({ deletedAt: now }).where(eq(s.leads.id, lead.id));
                    await tx.insert(s.activities).values({ id: uuid(), brandId: existing.brandId, clientId: existing.id, leadId: lead?.id ?? null, type: 'ereport.archived', summary: 'Diarsipkan karena dihapus di e-report' });
                });
                counts.archived++;
            } else counts.unchanged++;
            return;
        }
        if (existing.externalHash === hash && !existing.deletedAt) {
            counts.unchanged++;
            return;
        }
        await db.transaction(async (tx) => {
            await tx.update(s.clients).set({
                name, phoneRaw, normalizedPhone: normalized, location: locationOf(c), externalHash: hash,
                externalUpdatedAt, externalAccountId: String(c.account_id), deletedAt: null
            }).where(eq(s.clients.id, existing.id));
            if (lead) {
                const statusChanged = (c.status_name ?? null) !== lead.externalStatus;
                const patch: Partial<typeof s.leads.$inferInsert> = { projectType: projectOf(c), externalStatus: c.status_name ?? null, deletedAt: null };
                if (statusChanged && mappedStage && mappedStage !== lead.stage) {
                    patch.stage = mappedStage;
                    patch.lostReason = mappedStage === 'LOST' ? (lead.lostReason ?? 'other') : null;
                    await tx.insert(s.leadStageHistory).values({ id: uuid(), leadId: lead.id, fromStage: lead.stage, toStage: mappedStage, lostReason: patch.lostReason ?? null, changedBy: null });
                }
                await tx.update(s.leads).set(patch).where(eq(s.leads.id, lead.id));
            }
            await tx.insert(s.activities).values({ id: uuid(), brandId: existing.brandId, clientId: existing.id, leadId: lead?.id ?? null, type: 'ereport.updated', summary: 'Data diperbarui dari e-report' });
        });
        counts.updated++;
        return;
    }

    if (c.deleted_at) {
        counts.unchanged++;
        return;
    }

    let potentialDuplicateOf: string | null = null;
    if (normalized) {
        const [dup] = await db.select({ id: s.clients.id }).from(s.clients)
            .where(and(eq(s.clients.brandId, brandId), eq(s.clients.normalizedPhone, normalized), isNull(s.clients.deletedAt), or(isNull(s.clients.externalSource), ne(s.clients.externalSource, 'ereport'))))
            .limit(1);
        if (dup) {
            potentialDuplicateOf = dup.id;
            counts.duplicateFlags++;
        }
    }

    const clientId = uuid();
    const leadId = uuid();
    const stage = mappedStage ?? 'PROSPECT_SURVEY';
    const createdAt = c.consultation_date ? new Date(c.consultation_date) : (c.created_at ? new Date(c.created_at) : new Date());
    await db.transaction(async (tx) => {
        await tx.insert(s.clients).values({
            id: clientId, brandId, name, phoneRaw, normalizedPhone: normalized, location: locationOf(c), source: 'ereport',
            externalSource: 'ereport', externalId, externalAccountId: String(c.account_id), externalUpdatedAt, externalHash: hash,
            isSourceLocked: true, potentialDuplicateOf, createdAt
        });
        await tx.insert(s.leads).values({
            id: leadId, brandId, clientId, projectType: projectOf(c), stage, lostReason: stage === 'LOST' ? 'other' : null,
            externalSource: 'ereport', externalId, externalStatus: c.status_name ?? null, createdAt, lastActivityAt: externalUpdatedAt ?? createdAt
        });
        await tx.insert(s.leadStageHistory).values({ id: uuid(), leadId, fromStage: null, toStage: stage, changedBy: null });
        await tx.insert(s.activities).values({ id: uuid(), brandId, clientId, leadId, type: 'ereport.imported', summary: `Lead masuk dari e-report (${externalId})` });
    });
    counts.created++;
};
