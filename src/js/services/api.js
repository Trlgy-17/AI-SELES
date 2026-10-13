// File: src/js/services/api.js
// Thin client for the backend API. Session lives in an httpOnly cookie; nothing sensitive is stored in JS.

export class ApiError extends Error {
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

const BASE = '/api/v1';

const request = async (method, path, body) => {
    const headers = { Accept: 'application/json' };
    const init = { method, headers, credentials: 'same-origin' };
    if (method !== 'GET') {
        headers['X-Requested-With'] = 'nacira';
        headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(body ?? {});
    }
    let res;
    try {
        res = await fetch(`${BASE}${path}`, init);
    } catch {
        throw new ApiError(0, 'NETWORK', 'Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = data?.error || {};
        if (res.status === 401 && path !== '/auth/login' && path !== '/auth/me') {
            window.dispatchEvent(new CustomEvent('api-unauthorized'));
        }
        throw new ApiError(res.status, err.code || 'HTTP_' + res.status, err.message || `Permintaan gagal (${res.status}).`, err.details);
    }
    return data;
};

export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    patch: (path, body) => request('PATCH', path, body),
    put: (path, body) => request('PUT', path, body),
    del: (path) => request('DELETE', path)
};

export const AuthApi = {
    me: () => api.get('/auth/me'),
    login: (identifier, password) => api.post('/auth/login', { identifier, password }),
    logout: () => api.post('/auth/logout'),
    switchBrand: (brandId) => api.post('/auth/switch-brand', { brandId }),
    changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword })
};

export const LeadsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
        return api.get(`/leads${qs ? `?${qs}` : ''}`);
    },
    create: (payload) => api.post('/leads', payload),
    update: (id, payload) => api.patch(`/leads/${id}`, payload),
    changeStage: (id, stage, lostReason) => api.patch(`/leads/${id}/stage`, { stage, lostReason }),
    archive: (id) => api.del(`/leads/${id}`)
};

export const TasksApi = {
    list: (view = 'all') => api.get(`/tasks?view=${view}`)
};

export const AiApi = {
    config: () => api.get('/ai/config'),
    generate: (payload) => api.post('/ai/generate', payload),
    feedback: (generationId, rating, reason) => api.post('/ai/feedback', { generationId, rating, reason })
};

export const MigrationApi = {
    legacyImport: (payload) => api.post('/migrations/legacy-import', payload)
};

export const EreportApi = {
    status: () => api.get('/integrations/ereport/status'),
    accounts: () => api.get('/integrations/ereport/accounts'),
    saveMappings: (mappings) => api.put('/integrations/ereport/mappings', { mappings }),
    statusMappings: () => api.get('/integrations/ereport/status-mappings'),
    saveStatusMappings: (mappings) => api.put('/integrations/ereport/status-mappings', { mappings }),
    sync: () => api.post('/integrations/ereport/sync'),
    runs: () => api.get('/integrations/ereport/runs')
};

export const LOST_REASON_OPTIONS = [
    { value: 'budget', label: 'Budget tidak cocok' },
    { value: 'competitor', label: 'Memilih kompetitor' },
    { value: 'no_response', label: 'Tidak ada respons' },
    { value: 'postponed', label: 'Ditunda' },
    { value: 'location', label: 'Di luar area layanan' },
    { value: 'scope_mismatch', label: 'Kebutuhan tidak sesuai' },
    { value: 'cancelled', label: 'Dibatalkan klien' },
    { value: 'other', label: 'Lainnya' }
];
