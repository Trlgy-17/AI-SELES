// File: src/js/services/legacyExport.js
// Reads the pre-database localStorage data (raw, untouched) so it can be imported into the central database.

const IMPORTED_AT_KEY = 'nacira_legacy_imported_at';
const RECOVERABLE_FIELDS = ['brandId', 'location', 'dimensions', 'notes'];

const readJson = (key) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const allKeys = () => {
    try {
        return Object.keys(localStorage);
    } catch {
        return [];
    }
};

export const collectLegacyData = () => {
    const keys = allKeys();
    const sources = [];
    const leadsById = new Map();
    const tasksById = new Map();
    const tombLeads = new Set();
    const tombTasks = new Set();

    const addAll = (list, target, key) => {
        if (!Array.isArray(list) || !list.length) return;
        sources.push(`${key} (${list.length})`);
        for (const item of list) {
            if (!item || typeof item !== 'object') continue;
            const id = item.id ? String(item.id) : `noid_${target.size}_${key}`;
            if (!target.has(id)) target.set(id, { ...item, id: item.id ?? id });
        }
    };

    for (const key of keys) {
        if (/^nacira_crm_leads_v2(_|$)/.test(key) && !key.includes('corrupted')) addAll(readJson(key), leadsById, key);
        else if (/^nacira_followup_tasks_v2(_|$)/.test(key) && !key.includes('corrupted')) addAll(readJson(key), tasksById, key);
        else if (/^nacira_tombstone_leads_v2/.test(key)) (readJson(key) || []).forEach((id) => tombLeads.add(String(id)));
        else if (/^nacira_tombstone_tasks_v2/.test(key)) (readJson(key) || []).forEach((id) => tombTasks.add(String(id)));
    }
    addAll(readJson('nacira_crm_leads_2026'), leadsById, 'nacira_crm_leads_2026');
    addAll(readJson('nacira_followup_tasks_2026'), tasksById, 'nacira_followup_tasks_2026');

    // Older builds dropped brandId/location/dimensions/notes on reload; the pre-migration backup still has them.
    for (const key of keys.filter((k) => k.startsWith('nacira_pre_migration_backup_leads_'))) {
        const backup = readJson(key);
        if (!Array.isArray(backup)) continue;
        for (const old of backup) {
            const current = old?.id ? leadsById.get(String(old.id)) : null;
            if (!current) continue;
            for (const f of RECOVERABLE_FIELDS) {
                if ((current[f] === undefined || current[f] === null || current[f] === '') && old[f]) current[f] = old[f];
            }
        }
    }

    return {
        sources,
        payload: {
            leads: [...leadsById.values()],
            tasks: [...tasksById.values()],
            tombstones: { leads: [...tombLeads], tasks: [...tombTasks] }
        }
    };
};

export const markLegacyImported = () => {
    try {
        localStorage.setItem(IMPORTED_AT_KEY, new Date().toISOString());
    } catch {
        // Not critical: re-imports are idempotent on the server.
    }
};

export const getLegacyImportedAt = () => {
    try {
        return localStorage.getItem(IMPORTED_AT_KEY);
    } catch {
        return null;
    }
};
