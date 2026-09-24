// File: src/js/services/auth.js
import { INITIAL_BRANDS, INITIAL_USERS } from '../constants.js';
import { StorageService } from './storage.js';

const AUTH_STORAGE_KEY = 'multibrand_auth_session';
const BRANDS_STORAGE_KEY = 'multibrand_registered_brands';
const USERS_STORAGE_KEY = 'multibrand_registered_users';

export const AuthService = {
    // Inisialisasi daftar brand di storage (jika belum ada)
    getBrands: () => {
        const stored = StorageService.getItem(BRANDS_STORAGE_KEY, null);
        if (stored && Array.isArray(stored) && stored.length > 0) {
            return stored;
        }
        StorageService.setItem(BRANDS_STORAGE_KEY, INITIAL_BRANDS);
        return INITIAL_BRANDS;
    },

    saveBrands: (brands) => {
        StorageService.setItem(BRANDS_STORAGE_KEY, brands);
    },

    getBrandById: (brandId) => {
        const brands = AuthService.getBrands();
        return brands.find(b => b.id === brandId) || brands.find(b => b.id === 'brand_nacira') || brands[0];
    },

    // Inisialisasi daftar user di storage
    getUsers: () => {
        const stored = StorageService.getItem(USERS_STORAGE_KEY, null);
        if (stored && Array.isArray(stored) && stored.length > 0) {
            return stored;
        }
        StorageService.setItem(USERS_STORAGE_KEY, INITIAL_USERS);
        return INITIAL_USERS;
    },

    saveUsers: (users) => {
        StorageService.setItem(USERS_STORAGE_KEY, users);
    },

    // Sesi aktif saat ini
    getCurrentSession: () => {
        const saved = StorageService.getItem(AUTH_STORAGE_KEY, null);
        if (saved && saved.user) {
            // Validasi brand yang aktif
            const activeBrand = AuthService.getBrandById(saved.activeBrandId || saved.user.brandId);
            return {
                ...saved,
                activeBrand
            };
        }
        // Default session awal: Super Admin (Ary) pada brand Nacira Studio
        const defaultUser = INITIAL_USERS[0];
        const defaultBrand = INITIAL_BRANDS[0];
        const defaultSession = {
            user: {
                id: defaultUser.id,
                username: defaultUser.username,
                fullName: defaultUser.fullName,
                email: defaultUser.email,
                role: defaultUser.role,
                brandId: defaultUser.brandId
            },
            activeBrandId: defaultBrand.id,
            activeBrand: defaultBrand
        };
        StorageService.setItem(AUTH_STORAGE_KEY, defaultSession);
        return defaultSession;
    },

    // Login dengan validasi kredensial
    login: (username, password) => {
        const users = AuthService.getUsers();
        const cleanUser = (username || '').trim().toLowerCase();
        const found = users.find(u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser);
        
        if (!found) {
            throw new Error("Akun pengguna tidak ditemukan.");
        }
        if (found.password !== password) {
            throw new Error("Kata sandi yang Anda masukkan salah.");
        }
        if (!found.isActive) {
            throw new Error("Akun ini sedang dinonaktifkan oleh Super Admin.");
        }

        const brandToUse = AuthService.getBrandById(found.brandId || 'brand_nacira');
        const session = {
            user: {
                id: found.id,
                username: found.username,
                fullName: found.fullName,
                email: found.email,
                role: found.role,
                brandId: found.brandId
            },
            activeBrandId: found.brandId || brandToUse.id,
            activeBrand: brandToUse
        };

        StorageService.setItem(AUTH_STORAGE_KEY, session);
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: session }));
        }
        return session;
    },

    // Switch workspace khusus SUPER_ADMIN
    switchWorkspace: (newBrandId) => {
        const session = AuthService.getCurrentSession();
        if (session.user.role !== 'SUPER_ADMIN') {
            throw new Error("Hanya Super Admin yang berhak mengganti Brand Workspace.");
        }

        const targetBrand = AuthService.getBrandById(newBrandId);
        if (!targetBrand) {
            throw new Error("Brand target tidak valid.");
        }

        const updatedSession = {
            ...session,
            activeBrandId: targetBrand.id,
            activeBrand: targetBrand
        };

        StorageService.setItem(AUTH_STORAGE_KEY, updatedSession);
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: updatedSession }));
        }
        return updatedSession;
    },

    logout: () => {
        StorageService.removeItem(AUTH_STORAGE_KEY);
        // Reset ke default super admin agar aplikasi tetap dapat diakses
        const resetSession = AuthService.getCurrentSession();
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: resetSession }));
        }
        return resetSession;
    }
};
