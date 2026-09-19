// File: src/js/services/firebase.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const DEFAULT_APP_ID = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'nacira-sales-ai-2026';

export const getActiveFirebaseConfig = () => {
    try {
        const saved = localStorage.getItem('nacira_custom_firebase_config');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.apiKey && parsed.apiKey !== 'mock') return parsed;
        }
    } catch (e) {}

    if (typeof window !== 'undefined') {
        if (typeof window.__firebase_config === 'string') {
            try {
                const parsed = JSON.parse(window.__firebase_config);
                if (parsed && parsed.apiKey && parsed.apiKey !== 'mock') return parsed;
            } catch (e) {}
        }
        if (window.__firebase_config && window.__firebase_config.apiKey && window.__firebase_config.apiKey !== 'mock') {
            return window.__firebase_config;
        }
    }

    return null;
};

let app = null;
let auth = null;
let db = null;

export const initializeFirebase = (config) => {
    if (!config || !config.apiKey || config.apiKey === 'mock') {
        return { isConfigured: false, reason: 'missing_or_mock_config' };
    }
    try {
        const existingApps = getApps();
        if (existingApps.length > 0) {
            app = existingApps[0];
        } else {
            app = initializeApp(config);
        }
        auth = getAuth(app);
        db = getFirestore(app);
        return { isConfigured: true, app, auth, db };
    } catch (err) {
        console.warn("[Firebase Service] Inisialisasi Firebase gagal:", err);
        return { isConfigured: false, error: err };
    }
};

// Pasang bridge global untuk kompatibilitas hook sinkronisasi
export const setupFirebaseBridge = () => {
    const initialConfig = getActiveFirebaseConfig();
    const initStatus = initializeFirebase(initialConfig);

    const bridge = {
        app, auth, db,
        appId: DEFAULT_APP_ID,
        isConfigured: initStatus.isConfigured,
        getActiveConfig: getActiveFirebaseConfig,
        reconfigure: (newConfig) => {
            try {
                if (newConfig) {
                    localStorage.setItem('nacira_custom_firebase_config', JSON.stringify(newConfig));
                } else {
                    localStorage.removeItem('nacira_custom_firebase_config');
                }
                const result = initializeFirebase(newConfig);
                bridge.app = app;
                bridge.auth = auth;
                bridge.db = db;
                bridge.isConfigured = result.isConfigured;
                window.dispatchEvent(new CustomEvent('firebase-reconfigured', { detail: result }));
                return result;
            } catch (e) {
                return { isConfigured: false, error: e };
            }
        },
        signInAnonymously,
        signInWithCustomToken,
        onAuthStateChanged,
        doc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, getDocs
    };

    if (typeof window !== 'undefined') {
        window.firebaseServices = bridge;
        window.dispatchEvent(new Event('firebase-ready'));
    }

    return bridge;
};
