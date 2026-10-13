import { and, eq, isNull } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import * as s from '../../db/schema.js';
import { stageFromLabel, type StageCode } from '../../lib/rbac.js';
import { uuid } from '../../lib/util.js';
import { normalizePhone } from '../../../../src/js/utils/phone.js';

export type LegacyPayload = {
    leads: Record<string, unknown>[];
    tasks: Record<string, unknown>[];
    tombstones?: { leads?: string[]; tasks?: string[] };
};

export type ImportIssue = { kind: 'lead' | 'task'; legacyId: string | null; reason: string };

export type ImportReport = {
    totalRecords: number;
    imported: number;
    skipped: number;
    duplicates: number;
    invalid: number;
    failed: number;
    brandDefaulted: number;
    flaggedDuplicates: number;
    issues: ImportIssue[];
};

const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const parseDate = (v: unknown) => {
    if (typeof v !== 'string' || !v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
};
// Legacy due dates are Jakarta calendar days (YYYY-MM-DD); store 09:00 WIB as UTC.
const jakartaDueDate = (v: unknown) => {
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    return new Date(`${v}T02:00:00.000Z`);
};

export const runLegacyImport = async (
    db: Db,
    ctx: { actorId: string; activeBrandId: string; allowedBrandIds: string[] },
    payload: LegacyPayload
): Promise<ImportReport> => {
    const report: ImportReport = { totalRecords: 0, imported: 0, skipped: 0, duplicates: 0, invalid: 0, failed: 0, brandDefaulted: 0, flaggedDuplicates: 0, issues: [] };
    const deletedLeadIds = new Set((payload.tombstones?.leads ?? []).map(String));
    const deletedTaskIds = new Set((payload.tombstones?.tasks ?? []).map(String));
    const leadIdMap = new Map<string, { leadId: string; clientId: string; brandId: string }>();
    const seenLegacy = new Set<string>();

    const leads = Array.isArray(payload.leads) ? payload.leads : [];
    const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
    report.totalRecords = leads.length + tasks.length;

    for (const raw of leads) {
        const legacyId = str(raw.id, 80);
        const issue = (reason: string) => report.issues.push({ kind: 'lead', legacyId, reason });
        if (legacyId && deletedLeadIds.has(legacyId)) {
            report.skipped++;
            issue('dihapus sebelumnya (tombstone)');
            continue;
        }
        const name = str(raw.name, 120);
        if (!name) {
            report.invalid++;
            issue('nama kosong');
            continue;
        }
        let brandId = str(raw.brandId, 40);
        if (!brandId) {
            brandId = ctx.activeBrandId;
            report.brandDefaulted++;
        } else if (!ctx.allowedBrandIds.includes(brandId)) {
            report.skipped++;
            issue(`brand ${brandId} di luar akses pengimpor`);
            continue;
        }
        const dedupeKey = `${brandId}:${legacyId ?? name}`;
        if (seenLegacy.has(dedupeKey)) {
            report.duplicates++;
            issue('duplikat di dalam file impor');
            continue;
        }
        seenLegacy.add(dedupeKey);

        try {
            if (legacyId) {
                const [existing] = await db.select({ id: s.leads.id, clientId: s.leads.clientId }).from(s.leads)
                    .where(and(eq(s.leads.brandId, brandId), eq(s.leads.legacyId, legacyId))).limit(1);
                if (existing) {
                    report.duplicates++;
                    leadIdMap.set(legacyId, { leadId: existing.id, clientId: existing.clientId, brandId });
                    issue('sudah pernah diimpor');
                    continue;
                }
            }
            const phoneRaw = str(raw.phoneRaw ?? raw.phone, 40);
            const normalized = phoneRaw ? normalizePhone(phoneRaw) || null : (str(raw.phoneNormalized, 20) || null);
            let potentialDuplicateOf: string | null = null;
            if (normalized) {
                const [match] = await db.select({ id: s.clients.id, name: s.clients.name }).from(s.clients)
                    .where(and(eq(s.clients.brandId, brandId), eq(s.clients.normalizedPhone, normalized), isNull(s.clients.deletedAt))).limit(1);
                if (match) {
                    if (match.name.trim().toLowerCase() === name.toLowerCase()) {
                        report.duplicates++;
                        issue('klien dengan nama & telepon sama sudah ada');
                        continue;
                    }
                    potentialDuplicateOf = match.id;
                    report.flaggedDuplicates++;
                }
            }
            const stage: StageCode = stageFromLabel(raw.status) ?? 'PROSPECT_SURVEY';
            const valueNum = typeof raw.value === 'number' ? raw.value : Number(raw.value);
            const value = Number.isFinite(valueNum) && valueNum >= 0 ? Math.round(valueNum) : null;
            const createdAt = parseDate(raw.createdAt) ?? new Date();
            const clientId = uuid();
            const leadId = uuid();
            await db.transaction(async (tx) => {
                await tx.insert(s.clients).values({
                    id: clientId, brandId: brandId!, name, phoneRaw, normalizedPhone: normalized, location: str(raw.location, 190),
                    source: 'legacy_import', potentialDuplicateOf, createdBy: ctx.actorId, createdAt
                });
                await tx.insert(s.leads).values({
                    id: leadId, brandId: brandId!, clientId, projectType: str(raw.project, 200), dimensions: str(raw.dimensions, 190),
                    notes: str(raw.notes, 5000), valueIdr: value, stage, lostReason: stage === 'LOST' ? 'other' : null,
                    legacyId, assignedTo: ctx.actorId, createdBy: ctx.actorId, createdAt, lastActivityAt: parseDate(raw.updatedAt) ?? createdAt
                });
                await tx.insert(s.leadStageHistory).values({ id: uuid(), leadId, fromStage: null, toStage: stage, changedBy: ctx.actorId });
                await tx.insert(s.activities).values({ id: uuid(), brandId: brandId!, clientId, leadId, type: 'lead.imported', summary: 'Diimpor dari data lokal lama', actorId: ctx.actorId });
            });
            if (legacyId) leadIdMap.set(legacyId, { leadId, clientId, brandId });
            report.imported++;
        } catch (err: any) {
            report.failed++;
            issue(`gagal disimpan: ${String(err?.code || err?.message || 'unknown').slice(0, 80)}`);
        }
    }

    for (const raw of tasks) {
        const legacyId = str(raw.id, 80);
        const issue = (reason: string) => report.issues.push({ kind: 'task', legacyId, reason });
        if (legacyId && deletedTaskIds.has(legacyId)) {
            report.skipped++;
            issue('dihapus sebelumnya (tombstone)');
            continue;
        }
        const type = str(raw.type, 100) ?? 'Follow-Up Prospek';
        const linked = typeof raw.leadId === 'string' ? leadIdMap.get(raw.leadId) : undefined;
        let brandId = linked?.brandId ?? str(raw.brandId, 40) ?? ctx.activeBrandId;
        if (!ctx.allowedBrandIds.includes(brandId)) {
            report.skipped++;
            issue(`brand ${brandId} di luar akses pengimpor`);
            continue;
        }
        try {
            if (legacyId) {
                const [existing] = await db.select({ id: s.followUpTasks.id }).from(s.followUpTasks)
                    .where(and(eq(s.followUpTasks.brandId, brandId), eq(s.followUpTasks.legacyId, legacyId))).limit(1);
                if (existing) {
                    report.duplicates++;
                    issue('sudah pernah diimpor');
                    continue;
                }
            }
            const statusRaw = String(raw.status ?? 'Pending');
            const status = statusRaw === 'Selesai' ? 'DONE' : statusRaw === 'Batal' ? 'CANCELLED' : 'PENDING';
            await db.insert(s.followUpTasks).values({
                id: uuid(), brandId, clientId: linked?.clientId ?? null, leadId: linked?.leadId ?? null, type,
                reason: str(raw.client, 120) ? `Klien: ${str(raw.client, 120)}` : null, status,
                dueAt: jakartaDueDate(raw.dueDate), completedAt: status === 'DONE' ? parseDate(raw.updatedAt) : null,
                legacyId, assignedTo: ctx.actorId, createdBy: ctx.actorId, createdAt: parseDate(raw.createdAt) ?? new Date()
            });
            report.imported++;
        } catch (err: any) {
            report.failed++;
            issue(`gagal disimpan: ${String(err?.code || err?.message || 'unknown').slice(0, 80)}`);
        }
    }

    report.issues = report.issues.slice(0, 500);
    return report;
};
