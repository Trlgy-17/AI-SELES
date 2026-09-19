// File: src/js/services/migration.js
import { StorageService } from './storage.js';
import { generateId } from '../utils/id.js';
import { getAsiaJakartaIso } from '../utils/date.js';
import { normalizePhone } from '../utils/phone.js';
import { CANONICAL_LEAD_STATUS_MAP } from '../constants.js';

export const BASE_KEYS = {
    CRM_LEADS: 'nacira_crm_leads_v2',
    FOLLOWUP_TASKS: 'nacira_followup_tasks_v2',
    TOMBSTONE_LEADS: 'nacira_tombstone_leads_v2',
    TOMBSTONE_TASKS: 'nacira_tombstone_tasks_v2',
    CRM_BACKUP_V1: 'nacira_crm_leads_backup_v1',
    FOLLOWUP_BACKUP_V1: 'nacira_followup_tasks_backup_v1',
    PRE_MIGRATION_BACKUP: 'nacira_pre_migration_backup'
};

export const mapLeadStatus = (status) => {
    return CANONICAL_LEAD_STATUS_MAP[status] || 'Prospek / Survey';
};

export const getTombstones = (type, userId) => {
    const key = type === 'leads' ? BASE_KEYS.TOMBSTONE_LEADS : BASE_KEYS.TOMBSTONE_TASKS;
    const namespacedKey = StorageService.getUserKey(key, userId);
    return new Set(StorageService.getItem(namespacedKey, []));
};

export const addTombstone = (type, id, userId) => {
    if (!id) return;
    const key = type === 'leads' ? BASE_KEYS.TOMBSTONE_LEADS : BASE_KEYS.TOMBSTONE_TASKS;
    const namespacedKey = StorageService.getUserKey(key, userId);
    const list = StorageService.getItem(namespacedKey, []);
    if (!list.includes(String(id))) {
        list.push(String(id));
        StorageService.setItem(namespacedKey, list);
    }
};

export const migrateLeads = (rawLeads) => {
    if (!Array.isArray(rawLeads)) return [];
    return rawLeads.map(item => {
        if (!item || typeof item !== 'object') return null;

        // Idempoten: skema v2 yang sudah valid dipertahankan tanpa mutasi destruktif
        if (item.schemaVersion === 2) {
            return {
                id: item.id || generateId('lead'),
                schemaVersion: 2,
                name: (item.name || '').trim().slice(0, 100),
                phoneRaw: item.phoneRaw || item.phone || '',
                phoneNormalized: item.phoneNormalized || normalizePhone(item.phoneRaw || item.phone || ''),
                project: (item.project || '').trim().slice(0, 200),
                value: (typeof item.value === 'number' && !isNaN(item.value) && isFinite(item.value) && item.value >= 0)
                    ? item.value
                    : null,
                status: mapLeadStatus(item.status),
                createdAt: item.createdAt || null,
                updatedAt: item.updatedAt || getAsiaJakartaIso(),
                isLegacyFallbackCandidate: !!item.isLegacyFallbackCandidate || (item.value === 15000000),
                syncStatus: item.syncStatus || 'synced'
            };
        }

        // Migrasi dari format v1 lama
        const phoneRaw = (item.phone === '081200000000' || item.phone === '0812-0000-0000') ? '' : (item.phone || '');
        const phoneNormalized = normalizePhone(phoneRaw);
        const isLegacyDefaultVal = (item.value === 15000000);

        let cleanValue = null;
        if (typeof item.value === 'number' && !isNaN(item.value) && isFinite(item.value) && item.value >= 0) {
            cleanValue = item.value;
        }

        return {
            id: item.id ? String(item.id) : generateId('lead'),
            schemaVersion: 2,
            name: (item.name || 'Prospek Tanpa Nama').trim().slice(0, 100),
            phoneRaw: phoneRaw,
            phoneNormalized: phoneNormalized,
            project: (item.project || '').trim().slice(0, 200),
            value: cleanValue,
            status: mapLeadStatus(item.status),
            // Jika ada field date lama gunakan, jika tidak null (tanpa tanggal historis palsu)
            createdAt: item.date ? `${item.date}T00:00:00+07:00` : (item.createdAt || null),
            updatedAt: getAsiaJakartaIso(),
            isLegacyFallbackCandidate: isLegacyDefaultVal,
            syncStatus: 'synced'
        };
    }).filter(Boolean);
};

export const migrateTasks = (rawTasks) => {
    if (!Array.isArray(rawTasks)) return [];
    return rawTasks.map(item => {
        if (!item || typeof item !== 'object') return null;

        if (item.schemaVersion === 2) {
            return {
                id: item.id || generateId('task'),
                schemaVersion: 2,
                leadId: item.leadId || null,
                client: (item.client || '').trim().slice(0, 100),
                phoneRaw: item.phoneRaw || item.phone || '',
                phoneNormalized: item.phoneNormalized || normalizePhone(item.phoneRaw || item.phone || ''),
                type: (item.type || 'Follow-Up Prospek').trim().slice(0, 100),
                status: item.status || 'Pending',
                dueDate: item.dueDate || null,
                needsReschedule: !!item.needsReschedule,
                createdAt: item.createdAt || null,
                updatedAt: item.updatedAt || getAsiaJakartaIso(),
                isDetachedFromDeletedLead: !!item.isDetachedFromDeletedLead,
                syncStatus: item.syncStatus || 'synced'
            };
        }

        const phoneRaw = (item.phone === '081200000000' || item.phone === '0812-0000-0000') ? '' : (item.phone || '');
        const phoneNormalized = normalizePhone(phoneRaw);
        let dueDate = null;
        let needsReschedule = false;

        if (item.due && /^\d{4}-\d{2}-\d{2}$/.test(item.due)) {
            dueDate = item.due;
        } else if (item.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate)) {
            dueDate = item.dueDate;
        } else if (item.due) {
            // Teks relatif lama ("Hari ini", "Besok") ditandai butuh reschedule
            needsReschedule = true;
        }

        return {
            id: item.id ? String(item.id) : generateId('task'),
            schemaVersion: 2,
            leadId: item.leadId || null,
            client: (item.client || 'Klien Follow-up').trim().slice(0, 100),
            phoneRaw: phoneRaw,
            phoneNormalized: phoneNormalized,
            type: (item.type || 'Follow-Up Prospek').trim().slice(0, 100),
            status: item.status || 'Pending',
            dueDate: dueDate,
            needsReschedule: needsReschedule,
            createdAt: null,
            updatedAt: getAsiaJakartaIso(),
            isDetachedFromDeletedLead: false,
            syncStatus: 'synced'
        };
    }).filter(Boolean);
};

export const loadUserData = (userId) => {
    const leadsKey = StorageService.getUserKey(BASE_KEYS.CRM_LEADS, userId);
    const tasksKey = StorageService.getUserKey(BASE_KEYS.FOLLOWUP_TASKS, userId);
    const tombLeads = getTombstones('leads', userId);
    const tombTasks = getTombstones('tasks', userId);

    let leads = [];
    let tasks = [];

    const rawLeads = localStorage.getItem(leadsKey);
    if (rawLeads !== null) {
        try {
            const parsed = JSON.parse(rawLeads);
            const backupKey = `${BASE_KEYS.PRE_MIGRATION_BACKUP}_leads_${userId || 'local'}`;
            if (!localStorage.getItem(backupKey)) {
                try { localStorage.setItem(backupKey, rawLeads); } catch (e) {}
            }
            leads = migrateLeads(parsed);
        } catch (e) {
            const recoveryKey = `${leadsKey}_corrupted_backup_${Date.now()}`;
            try { localStorage.setItem(recoveryKey, rawLeads); } catch (e2) {}
            console.error('[MigrationService] Data leads rusak, disimpan ke:', recoveryKey);
            leads = [];
        }
    } else {
        const legacyLeads = StorageService.getItem('nacira_crm_leads_2026', null);
        if (legacyLeads) {
            leads = migrateLeads(legacyLeads);
            StorageService.setItem(BASE_KEYS.CRM_BACKUP_V1, legacyLeads);
        }
    }

    const rawTasks = localStorage.getItem(tasksKey);
    if (rawTasks !== null) {
        try {
            const parsed = JSON.parse(rawTasks);
            const backupKey = `${BASE_KEYS.PRE_MIGRATION_BACKUP}_tasks_${userId || 'local'}`;
            if (!localStorage.getItem(backupKey)) {
                try { localStorage.setItem(backupKey, rawTasks); } catch (e) {}
            }
            tasks = migrateTasks(parsed);
        } catch (e) {
            const recoveryKey = `${tasksKey}_corrupted_backup_${Date.now()}`;
            try { localStorage.setItem(recoveryKey, rawTasks); } catch (e2) {}
            console.error('[MigrationService] Data tasks rusak, disimpan ke:', recoveryKey);
            tasks = [];
        }
    } else {
        const legacyTasks = StorageService.getItem('nacira_followup_tasks_2026', null);
        if (legacyTasks) {
            tasks = migrateTasks(legacyTasks);
            StorageService.setItem(BASE_KEYS.FOLLOWUP_BACKUP_V1, legacyTasks);
        }
    }

    leads = leads.filter(l => !tombLeads.has(l.id));
    tasks = tasks.filter(t => !tombTasks.has(t.id));

    return { leads, tasks };
};

export const reconcileCloudData = (localItems, cloudItems, tombstones) => {
    const mergedMap = new Map();

    localItems.forEach(item => {
        if (!tombstones.has(item.id)) {
            mergedMap.set(item.id, item);
        }
    });

    cloudItems.forEach(cloudItem => {
        if (tombstones.has(cloudItem.id)) return;

        if (!mergedMap.has(cloudItem.id)) {
            mergedMap.set(cloudItem.id, cloudItem);
        } else {
            const localItem = mergedMap.get(cloudItem.id);
            const localTime = new Date(localItem.updatedAt || 0).getTime();
            const cloudTime = new Date(cloudItem.updatedAt || 0).getTime();

            // Last-Write-Wins (LWW)
            if (cloudTime > localTime) {
                mergedMap.set(cloudItem.id, cloudItem);
            }
        }
    });

    return Array.from(mergedMap.values());
};
