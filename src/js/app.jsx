// File: src/js/app.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react';
import ReactDOM from 'react-dom/client';
import { AppShell } from '../components/layout/AppShell.jsx';
import { Toast } from '../components/common/Toast.jsx';
import { Icons } from '../components/Icons.jsx';
import { AIWorkspace } from '../components/modules/AIWorkspace.jsx';
import { CRMModule } from '../components/modules/CRMModule.jsx';
import { FollowUpModule } from '../components/modules/FollowUpModule.jsx';
import { KnowledgeBase } from '../components/modules/KnowledgeBase.jsx';
import { CloudSettingsModal } from '../components/modals/CloudSettingsModal.jsx';
import { AuthModal } from '../components/modals/AuthModal.jsx';
import { CommandPalette } from '../components/layout/CommandPalette.jsx';
import { AuthService } from './services/auth.js';
import { StorageService } from './services/storage.js';
import { 
    BASE_KEYS, 
    loadUserData, 
    reconcileCloudData, 
    getTombstones 
} from './services/migration.js';
import { getAsiaJakartaDate } from './utils/date.js';
import { setupFirebaseBridge } from './services/firebase.js';

// Pasang bridge Firebase
setupFirebaseBridge();

// =========================================================================
// ERROR BOUNDARY
// =========================================================================
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("[ErrorBoundary] Tangkapan error render:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[100dvh] bg-[#0d0d0d] text-white p-8 flex flex-col items-center justify-center">
                    <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center border border-rose-800 space-y-4">
                        <div className="w-12 h-12 bg-rose-950 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
                            <Icons.AlertTriangle />
                        </div>
                        <h2 className="serif-font text-xl font-bold text-white">Terjadi Kesalahan Aplikasi</h2>
                        <p className="text-xs text-zinc-400 bg-[#15151a] p-3 rounded-xl border border-[#26262d] text-left overflow-auto max-h-32">
                            {this.state.error?.toString()}
                        </p>
                        <div className="space-y-2 pt-2">
                            <button 
                                onClick={() => window.location.reload()} 
                                className="gold-btn px-6 py-2.5 rounded-xl text-xs font-bold w-full"
                            >
                                Muat Ulang Aplikasi
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// =========================================================================
// TOP-LEVEL APP (ORCHESTRATOR)
// =========================================================================
export function App() {
    const [activeTab, setActiveTab] = useState('workspace');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const toastTimerRef = useRef(null);

    // Multi-Brand Auth Session & Modal States
    const [authSession, setAuthSession] = useState(() => AuthService.getCurrentSession());
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);

    const [userId, setUserId] = useState(null);
    const [syncStatus, setSyncStatus] = useState(() => {
        return window.firebaseServices?.isConfigured ? 'checking' : 'local';
    });
    const [showCloudModal, setShowCloudModal] = useState(false);
    const [firebaseConfigState, setFirebaseConfigState] = useState(() => {
        return window.firebaseServices?.getActiveConfig?.() || null;
    });

    const showToast = useCallback((message, type = 'info') => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ message, type });
        toastTimerRef.current = setTimeout(() => {
            setToast(null);
        }, 3500);
    }, []);

    // Listen event ganti auth dan command palette
    useEffect(() => {
        const handleAuthChanged = (e) => {
            if (e.detail) {
                setAuthSession(e.detail);
            }
        };
        const handleOpenPalette = () => {
            setShowCommandPalette(true);
        };
        window.addEventListener('auth-changed', handleAuthChanged);
        window.addEventListener('open-command-palette', handleOpenPalette);
        return () => {
            window.removeEventListener('auth-changed', handleAuthChanged);
            window.removeEventListener('open-command-palette', handleOpenPalette);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    const activeBrand = authSession?.activeBrand;
    const currentUser = authSession?.user;
    const allBrands = useMemo(() => AuthService.getBrands(), [authSession]);

    const handleSwitchBrand = (brandId) => {
        try {
            const updated = AuthService.switchWorkspace(brandId);
            setAuthSession(updated);
            showToast(`Beralih ke workspace ${updated.activeBrand?.brandName}`, 'info');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleLoginSuccess = (session) => {
        setAuthSession(session);
        showToast(`Sesi aktif: ${session.user?.fullName} (${session.activeBrand?.brandName})`, 'info');
    };

    const [crmLeads, setCrmLeads] = useState(() => {
        const { leads } = loadUserData(null);
        return leads;
    });

    const [followUpTasks, setFollowUpTasks] = useState(() => {
        const { tasks } = loadUserData(null);
        return tasks;
    });

    // Storage synchronization
    useEffect(() => {
        const key = StorageService.getUserKey(BASE_KEYS.CRM_LEADS, userId);
        const res = StorageService.setItem(key, crmLeads);
        if (!res.success && res.isQuotaExceeded) {
            showToast("Peringatan: Kuota penyimpanan browser penuh! Segera ekspor data ke CSV.", "error");
        }
    }, [crmLeads, userId, showToast]);

    useEffect(() => {
        const key = StorageService.getUserKey(BASE_KEYS.FOLLOWUP_TASKS, userId);
        const res = StorageService.setItem(key, followUpTasks);
        if (!res.success && res.isQuotaExceeded) {
            showToast("Peringatan: Kuota penyimpanan browser penuh! Segera ekspor data ke CSV.", "error");
        }
    }, [followUpTasks, userId, showToast]);

    // Firebase Lifecycle & Real-Time Sync
    useEffect(() => {
        let unsubAuth = null;
        let unsubLeadsSnapshot = null;
        let unsubTasksSnapshot = null;
        let isMounted = true;

        const connectFirebase = async () => {
            if (!window.firebaseServices || !window.firebaseServices.isConfigured) {
                if (isMounted) setSyncStatus('local');
                return;
            }

            const { auth, db, appId, signInAnonymously, onAuthStateChanged, collection, onSnapshot } = window.firebaseServices;

            if (!auth || !db) {
                if (isMounted) setSyncStatus('local');
                return;
            }

            if (isMounted) setSyncStatus('checking');

            try {
                await signInAnonymously(auth);
            } catch (authErr) {
                console.warn("[App] Auth error:", authErr);
                if (isMounted) {
                    if (authErr.code === 'auth/unauthorized-domain') {
                        setSyncStatus('error');
                        showToast(`Domain "${window.location.hostname}" belum diizinkan di Firebase Console. Buka Pengaturan Cloud untuk instruksi.`, "error");
                    } else {
                        setSyncStatus('local');
                    }
                }
            }

            unsubAuth = onAuthStateChanged(auth, (user) => {
                if (!isMounted) return;

                if (user) {
                    setUserId(user.uid);

                    const userLocalData = loadUserData(user.uid);
                    setCrmLeads(userLocalData.leads);
                    setFollowUpTasks(userLocalData.tasks);

                    const leadsCol = collection(db, 'artifacts', appId, 'users', user.uid, 'crmLeads');
                    unsubLeadsSnapshot = onSnapshot(leadsCol, (snapshot) => {
                        if (!isMounted) return;
                        const cloudItems = [];
                        snapshot.forEach(docSnap => cloudItems.push(docSnap.data()));

                        const tombstones = getTombstones('leads', user.uid);
                        setCrmLeads(prev => reconcileCloudData(prev, cloudItems, tombstones));
                        setSyncStatus('synced');
                    }, (err) => {
                        console.warn("[App] Leads snapshot error:", err);
                        if (isMounted) setSyncStatus('error');
                    });

                    const tasksCol = collection(db, 'artifacts', appId, 'users', user.uid, 'followUpTasks');
                    unsubTasksSnapshot = onSnapshot(tasksCol, (snapshot) => {
                        if (!isMounted) return;
                        const cloudTasks = [];
                        snapshot.forEach(docSnap => cloudTasks.push(docSnap.data()));

                        const tombstones = getTombstones('tasks', user.uid);
                        setFollowUpTasks(prev => reconcileCloudData(prev, cloudTasks, tombstones));
                    }, (err) => {
                        console.warn("[App] Tasks snapshot error:", err);
                    });

                } else {
                    setUserId(null);
                    setSyncStatus('local');
                }
            });
        };

        connectFirebase();

        const handleReconfigured = () => {
            if (isMounted) {
                setFirebaseConfigState(window.firebaseServices.getActiveConfig());
                connectFirebase();
            }
        };

        window.addEventListener('firebase-ready', connectFirebase);
        window.addEventListener('firebase-reconfigured', handleReconfigured);

        return () => {
            isMounted = false;
            window.removeEventListener('firebase-ready', connectFirebase);
            window.removeEventListener('firebase-reconfigured', handleReconfigured);
            if (unsubAuth) unsubAuth();
            if (unsubLeadsSnapshot) unsubLeadsSnapshot();
            if (unsubTasksSnapshot) unsubTasksSnapshot();
        };
    }, [showToast]);

    const handleSaveCloudConfig = (config) => {
        if (window.firebaseServices?.reconfigure) {
            const res = window.firebaseServices.reconfigure(config);
            setFirebaseConfigState(config);
            if (res.isConfigured) {
                showToast("Konfigurasi Firebase diterapkan! Memeriksa koneksi...", "info");
            } else {
                setSyncStatus('local');
                showToast("Beralih ke mode penyimpanan lokal.", "info");
            }
        }
    };

    const handleForceLocal = () => {
        handleSaveCloudConfig(null);
        setShowCloudModal(false);
    };

    const todayStr = getAsiaJakartaDate();
    const overdueCount = useMemo(() => followUpTasks.filter(t => t.status !== 'Selesai' && t.dueDate && t.dueDate < todayStr).length, [followUpTasks, todayStr]);
    const todayCount = useMemo(() => followUpTasks.filter(t => t.dueDate === todayStr && t.status !== 'Selesai').length, [followUpTasks, todayStr]);
    const rescheduleCount = useMemo(() => followUpTasks.filter(t => t.needsReschedule || (!t.dueDate && t.status !== 'Selesai')).length, [followUpTasks]);

    return (
        <AppShell
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            syncStatus={syncStatus}
            onOpenCloudModal={() => setShowCloudModal(true)}
            overdueCount={overdueCount}
            todayCount={todayCount}
            rescheduleCount={rescheduleCount}
            activeBrand={activeBrand}
            currentUser={currentUser}
            brands={allBrands}
            onSwitchBrand={handleSwitchBrand}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onOpenCommandPalette={() => setShowCommandPalette(true)}
        >
            <Toast toast={toast} />

            {activeTab === 'workspace' && (
                <AIWorkspace 
                    activeBrand={activeBrand} 
                    currentUser={currentUser} 
                    crmLeads={crmLeads} 
                    showToast={showToast} 
                />
            )}
            {activeTab === 'crm' && (
                <CRMModule 
                    crmLeads={crmLeads} 
                    setCrmLeads={setCrmLeads} 
                    followUpTasks={followUpTasks} 
                    setFollowUpTasks={setFollowUpTasks} 
                    userId={userId} 
                    showToast={showToast}
                    activeBrand={activeBrand}
                    currentUser={currentUser}
                    onConsultLeadInAI={(lead) => {
                        setActiveTab('workspace');
                        showToast(`Membuka AI Copilot untuk klien ${lead.name}`, 'info');
                    }}
                />
            )}
            {activeTab === 'followup' && (
                <FollowUpModule 
                    followUpTasks={followUpTasks} 
                    setFollowUpTasks={setFollowUpTasks} 
                    crmLeads={crmLeads} 
                    userId={userId} 
                    showToast={showToast}
                    activeBrand={activeBrand}
                    currentUser={currentUser}
                />
            )}
            {activeTab === 'knowledge' && (
                <KnowledgeBase 
                    activeBrand={activeBrand}
                    currentUser={currentUser}
                />
            )}

            <CloudSettingsModal 
                isOpen={showCloudModal}
                onClose={() => setShowCloudModal(false)}
                onSaveConfig={handleSaveCloudConfig}
                currentConfig={firebaseConfigState}
                syncStatus={syncStatus}
                onForceLocalMode={handleForceLocal}
            />

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                currentUser={currentUser}
                activeBrand={activeBrand}
                onLoginSuccess={handleLoginSuccess}
            />

            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                onNavigate={(tab) => setActiveTab(tab)}
                brands={allBrands}
                currentUser={currentUser}
                onSwitchBrand={handleSwitchBrand}
                onOpenAuthModal={() => setShowAuthModal(true)}
            />
        </AppShell>
    );
}

// =========================================================================
// BOOTSTRAP
// =========================================================================
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
}
