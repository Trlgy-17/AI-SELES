import { randomUUID, randomBytes, createHash } from 'node:crypto';

export const uuid = () => randomUUID();

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');

export const generatePassword = () => randomBytes(12).toString('base64url');

export class HttpError extends Error {
    constructor(public statusCode: number, public code: string, message: string, public details?: unknown) {
        super(message);
    }
}

// Driver-level failures that mean "the database never answered", not "the query was wrong".
const DB_UNREACHABLE_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH', 'ECONNRESET', 'EPIPE', 'PROTOCOL_CONNECTION_LOST', 'PROTOCOL_SEQUENCE_TIMEOUT', 'ER_CON_COUNT_ERROR']);
const DB_REJECTED_CODES = new Set(['ER_ACCESS_DENIED_ERROR', 'ER_DBACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_NOT_SUPPORTED_AUTH_MODE']);

/** Walks the `cause` chain (Drizzle wraps the mysql2 error) and classifies connection failures. */
export const dbFailureKind = (err: unknown): 'unreachable' | 'rejected' | null => {
    for (let e = err as { code?: unknown; cause?: unknown } | null | undefined, depth = 0; e && depth < 6; e = e.cause as typeof e, depth++) {
        const code = typeof e.code === 'string' ? e.code : null;
        if (!code) continue;
        if (DB_UNREACHABLE_CODES.has(code)) return 'unreachable';
        if (DB_REJECTED_CODES.has(code)) return 'rejected';
    }
    return null;
};

export const notFound = (entity = 'Data') => new HttpError(404, 'NOT_FOUND', `${entity} tidak ditemukan.`);
export const forbidden = (message = 'Anda tidak memiliki izin untuk tindakan ini.') => new HttpError(403, 'FORBIDDEN', message);
export const badRequest = (message: string, details?: unknown) => new HttpError(400, 'BAD_REQUEST', message, details);

// Dice coefficient on bigrams — good enough for Indonesian personal names.
export const nameSimilarity = (a: string, b: string) => {
    const norm = (s: string) => s.toLowerCase().replace(/\b(ibu|bu|bapak|pak|kak|mas|mbak)\b/g, '').replace(/[^a-z0-9]/g, '');
    const x = norm(a);
    const y = norm(b);
    if (!x || !y) return 0;
    if (x === y) return 1;
    const grams = (s: string) => {
        const m = new Map<string, number>();
        for (let i = 0; i < s.length - 1; i++) m.set(s.slice(i, i + 2), (m.get(s.slice(i, i + 2)) || 0) + 1);
        return m;
    };
    const gx = grams(x);
    const gy = grams(y);
    let overlap = 0;
    for (const [g, c] of gx) overlap += Math.min(c, gy.get(g) || 0);
    return (2 * overlap) / (x.length - 1 + y.length - 1);
};
