import type { FastifyRequest } from 'fastify';
import type { Db } from '../db/client.js';
import * as s from '../db/schema.js';
import { uuid } from './util.js';

type Tx = Pick<Db, 'insert'>;

// PII columns are never copied into audit snapshots in full.
const REDACT = new Set(['passwordHash', 'phoneRaw', 'normalizedPhone', 'email']);

const redact = (row: Record<string, unknown> | null | undefined) => {
    if (!row) return null;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
        if (REDACT.has(k)) out[k] = v ? `***${String(v).slice(-3)}` : v;
        else out[k] = v instanceof Date ? v.toISOString() : v;
    }
    return out;
};

export const writeAudit = async (
    tx: Tx,
    req: FastifyRequest | null,
    entry: { action: string; entity: string; entityId?: string | null; brandId?: string | null; before?: Record<string, unknown> | null; after?: Record<string, unknown> | null; actorId?: string | null }
) => {
    await tx.insert(s.auditLogs).values({
        id: uuid(),
        actorId: entry.actorId ?? req?.auth?.user.id ?? null,
        brandId: entry.brandId ?? req?.auth?.activeBrandId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        before: redact(entry.before),
        after: redact(entry.after),
        ip: req?.ip ?? null
    });
};

export const writeActivity = async (
    tx: Tx,
    entry: { brandId: string; clientId?: string | null; leadId?: string | null; type: string; summary: string; metadata?: Record<string, unknown>; actorId?: string | null }
) => {
    await tx.insert(s.activities).values({ id: uuid(), ...entry, clientId: entry.clientId ?? null, leadId: entry.leadId ?? null, metadata: entry.metadata ?? null, actorId: entry.actorId ?? null });
};
