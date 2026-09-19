// File: src/js/services/storage.js

export const StorageService = {
    getUserKey: (baseKey, userId) => {
        const tenant = userId ? `user_${userId}` : 'local_default';
        return `${baseKey}_${tenant}`;
    },

    getItem: (key, fallback = null) => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return fallback;
            try {
                return JSON.parse(item);
            } catch (parseErr) {
                // Penyelamatan data rusak: simpan ke kunci pemulihan, jangan ditimpa
                const recoveryKey = `${key}_corrupted_backup_${Date.now()}`;
                try {
                    localStorage.setItem(recoveryKey, item);
                } catch (e) {
                    // Abaikan jika storage penuh
                }
                console.error(`[StorageService] Gagal parse JSON key "${key}". Data rusak disimpan di: ${recoveryKey}`, parseErr);
                return fallback;
            }
        } catch (e) {
            console.error(`[StorageService] Gagal membaca key "${key}":`, e);
            return fallback;
        }
    },

    setItem: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return { success: true };
        } catch (e) {
            console.error(`[StorageService] Gagal menyimpan key "${key}":`, e);
            const isQuota = (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
            return { success: false, isQuotaExceeded: isQuota, error: e.message };
        }
    },

    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }
};
