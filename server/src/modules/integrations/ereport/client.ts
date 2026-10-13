// Read-only HTTP client for the e-report integration API.
// Only GET is implemented; any other verb is rejected before a request leaves this process.

export type EreportAccount = { id: number | string; name: string; city?: string | null; province?: string | null };
export type EreportStatus = { id: number | string; name: string; color?: string | null };
export type EreportConsultation = {
    consultation_id: string;
    client_name: string;
    phone?: string | null;
    phone_normalized?: string | null;
    emergency_phone?: string | null;
    province?: string | null;
    city?: string | null;
    district?: string | null;
    address?: string | null;
    account_id: number | string;
    account_name?: string | null;
    needs?: string[] | null;
    product_details?: string | null;
    status_id?: number | string | null;
    status_name?: string | null;
    notes?: string | null;
    consultation_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
};
export type Paginated<T> = { data: T[]; meta: { current_page: number; last_page: number; total: number; per_page?: number } };

export class EreportError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export const createEreportClient = (baseUrl: string, token: string, fetchImpl: typeof fetch = fetch) => {
    if (!baseUrl || !token) throw new EreportError(0, 'Integrasi e-report belum dikonfigurasi (EREPORT_API_URL / EREPORT_API_TOKEN).');
    const root = baseUrl.replace(/\/+$/, '');

    const request = async <T>(method: string, path: string, query: Record<string, string | number | boolean | undefined> = {}): Promise<T> => {
        if (method !== 'GET') throw new EreportError(0, `Metode ${method} diblokir: integrasi e-report hanya boleh membaca data.`);
        const url = new URL(`${root}/api/v1/integration${path}`);
        for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== '') url.searchParams.set(k, String(v));

        let attempt = 0;
        while (true) {
            attempt++;
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 20_000);
            try {
                const res = await fetchImpl(url, {
                    method: 'GET',
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                    signal: controller.signal
                });
                if ((res.status === 429 || res.status >= 500) && attempt < 3) {
                    await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
                    continue;
                }
                const body: any = await res.json().catch(() => ({}));
                if (res.status === 401 || res.status === 403) throw new EreportError(res.status, `e-report menolak token integrasi (HTTP ${res.status}). Periksa EREPORT_API_TOKEN di env server.`);
                if (!res.ok) throw new EreportError(res.status, body?.message || `e-report HTTP ${res.status}`);
                return body as T;
            } catch (err: any) {
                if (err instanceof EreportError) throw err;
                if (attempt < 3) {
                    await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
                    continue;
                }
                if (err?.name === 'AbortError') throw new EreportError(0, `e-report di ${url.origin} tidak merespons (timeout 20 detik).`);
                // Node's fetch reports connection failures as "fetch failed"; the real reason sits on cause.code.
                const cause = err?.cause?.code ?? err?.code;
                if (cause === 'ECONNREFUSED') throw new EreportError(0, `e-report tidak berjalan di ${url.origin} (koneksi ditolak). Jalankan server e-report, lalu coba lagi.`);
                if (cause === 'ENOTFOUND' || cause === 'EAI_AGAIN') throw new EreportError(0, `Alamat e-report ${url.origin} tidak ditemukan. Periksa EREPORT_API_URL.`);
                throw new EreportError(0, `Gagal menghubungi e-report di ${url.origin}${cause ? ` (${cause})` : ''}.`);
            } finally {
                clearTimeout(timer);
            }
        }
    };

    return {
        /** Exposed only for tests of the read-only guard. */
        _request: request,
        get: <T>(path: string, query?: Record<string, string | number | boolean | undefined>) => request<T>('GET', path, query),
        accounts: () => request<{ data: EreportAccount[] }>('GET', '/accounts'),
        statuses: () => request<{ data: EreportStatus[] }>('GET', '/master-data/statuses'),
        consultations: (q: { account: string | number; updated_since?: string; page?: number; per_page?: number; include_deleted?: boolean }) =>
            request<Paginated<EreportConsultation>>('GET', '/consultations', { ...q, include_deleted: q.include_deleted ? 1 : undefined })
    };
};

export type EreportClient = ReturnType<typeof createEreportClient>;
