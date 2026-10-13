// File: src/js/app.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/geist';
import { TriangleAlert, RotateCw } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell.jsx';
import { Toast } from '../components/common/Toast.jsx';
import { AIWorkspace } from '../components/modules/AIWorkspace.jsx';
import { CRMModule } from '../components/modules/CRMModule.jsx';
import { EstimatorCalculator } from '../components/modules/EstimatorCalculator.jsx';
import { KnowledgeBase } from '../components/modules/KnowledgeBase.jsx';
import { CloudSettingsModal } from '../components/modals/CloudSettingsModal.jsx';
import { AuthModal } from '../components/modals/AuthModal.jsx';
import { CommandPalette } from '../components/layout/CommandPalette.jsx';
import { PageHeader, Button } from '../components/ui/index.js';
import { LoginScreen } from '../components/auth/LoginScreen.jsx';
import { AuthApi, LeadsApi, TasksApi } from './services/api.js';
import { getAsiaJakartaDate } from './utils/date.js';

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
                <div className="flex min-h-[100dvh] items-center justify-center bg-bg p-6 text-fg">
                    <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-floating">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-danger/10 text-red-400">
                            <TriangleAlert size={20} aria-hidden="true" />
                        </div>
                        <h2 className="text-h2 font-semibold">Aplikasi mengalami kendala</h2>
                        <p className="mt-1.5 text-body text-fg-3">
                            Terjadi kesalahan saat menampilkan halaman. Data Anda tetap tersimpan. Muat ulang untuk melanjutkan.
                        </p>
                        <details className="mt-4 rounded-sm border border-border bg-surface-2 p-3 text-body-sm text-fg-3">
                            <summary className="cursor-pointer text-fg-2">Detail teknis</summary>
                            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-caption">{this.state.error?.toString()}</pre>
                        </details>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-primary text-body font-semibold text-primary-fg hover:bg-primary-hover"
                        >
                            <RotateCw size={16} aria-hidden="true" />
                            Muat ulang aplikasi
                        </button>
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

// Legacy task shape used by the reminder banner: Jakarta calendar date + Indonesian status.
const toBannerTask = (t) => ({
    id: t.id,
    status: t.status === 'DONE' ? 'Selesai' : t.status === 'CANCELLED' ? 'Batal' : 'Pending',
    dueDate: t.dueAt ? new Date(new Date(t.dueAt).getTime() + 7 * 3600_000).toISOString().slice(0, 10) : null,
    needsReschedule: !t.dueAt && t.status === 'PENDING'
});

export function App({ session, onSessionChange, onLoggedOut }) {
    const [activeTab, setActiveTab] = useState('workspace');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [addLeadRequested, setAddLeadRequested] = useState(false);
    const [aiPrefillLead, setAiPrefillLead] = useState(null);
    const toastTimerRef = useRef(null);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showCloudModal, setShowCloudModal] = useState(false);

    const [crmLeads, setCrmLeads] = useState([]);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [followUpTasks, setFollowUpTasks] = useState([]);
    const [syncStatus, setSyncStatus] = useState('synced');

    const showToast = useCallback((message, type = 'info') => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ message, type });
        toastTimerRef.current = setTimeout(() => {
            setToast(null);
        }, 3500);
    }, []);

    useEffect(() => {
        const handleOpenPalette = () => setShowCommandPalette(true);
        window.addEventListener('open-command-palette', handleOpenPalette);
        return () => {
            window.removeEventListener('open-command-palette', handleOpenPalette);
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    const activeBrand = session.activeBrand;
    const currentUser = session.user;
    const allBrands = session.brands;
    const can = useCallback((perm) => Boolean(session.permissions?.includes(perm)), [session.permissions]);

    const reloadLeads = useCallback(async () => {
        setLeadsLoading(true);
        try {
            const res = await LeadsApi.list();
            setCrmLeads(res.data);
            setSyncStatus('synced');
        } catch (err) {
            setSyncStatus('error');
            showToast(err.message, 'error');
        } finally {
            setLeadsLoading(false);
        }
    }, [showToast]);

    const reloadTasks = useCallback(async () => {
        if (!session.permissions?.includes('task.manage')) return;
        try {
            const res = await TasksApi.list('all');
            setFollowUpTasks(res.data.map(toBannerTask));
        } catch {
            // Banner is non-critical; errors surface on the CRM page.
        }
    }, [session.permissions]);

    useEffect(() => {
        reloadLeads();
        reloadTasks();
    }, [session.activeBrandId, reloadLeads, reloadTasks]);

    const handleSwitchBrand = async (brandId) => {
        try {
            const next = await AuthApi.switchBrand(brandId);
            onSessionChange(next);
            showToast(`Beralih ke workspace ${next.activeBrand?.brandName}`, 'info');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleLogout = async () => {
        try {
            await AuthApi.logout();
        } finally {
            onLoggedOut();
        }
    };

    const todayStr = getAsiaJakartaDate();
    const overdueCount = useMemo(() => followUpTasks.filter(t => t.status === 'Pending' && t.dueDate && t.dueDate < todayStr).length, [followUpTasks, todayStr]);
    const todayCount = useMemo(() => followUpTasks.filter(t => t.dueDate === todayStr && t.status === 'Pending').length, [followUpTasks, todayStr]);
    const rescheduleCount = useMemo(() => followUpTasks.filter(t => t.needsReschedule).length, [followUpTasks]);

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
                    prefillLead={aiPrefillLead}
                    onPrefillHandled={() => setAiPrefillLead(null)}
                />
            )}
            {activeTab === 'crm' && (
                <CRMModule
                    crmLeads={crmLeads}
                    setCrmLeads={setCrmLeads}
                    isLoading={leadsLoading}
                    can={can}
                    showToast={showToast}
                    activeBrand={activeBrand}
                    currentUser={currentUser}
                    autoOpenAddLead={addLeadRequested}
                    onAutoOpenAddLeadHandled={() => setAddLeadRequested(false)}
                    onConsultLeadInAI={(lead) => {
                        setAiPrefillLead(lead);
                        setActiveTab('workspace');
                        showToast(`Memori klien ${lead.name} dimuat di Sales AI.`, 'info');
                    }}
                />
            )}
            {activeTab === 'estimator' && (
                <div className="space-y-6">
                    <PageHeader
                        title="Estimator"
                        description="Simulasikan RAB proyek interior, lalu bagikan ke klien atau gunakan di Sales AI."
                    />
                    <EstimatorCalculator
                        activeBrand={activeBrand}
                        showToast={showToast}
                        onApplyToAI={(calcData) => {
                            setActiveTab('workspace');
                            showToast(`Hasil hitungan ${calcData.projectType} (${calcData.budget}) siap digunakan di Sales AI.`);
                        }}
                    />
                </div>
            )}
            {activeTab === 'knowledge' && (
                <KnowledgeBase
                    activeBrand={activeBrand}
                    currentUser={currentUser}
                    onOpenEstimator={() => setActiveTab('estimator')}
                    showToast={showToast}
                />
            )}

            <CloudSettingsModal
                isOpen={showCloudModal}
                onClose={() => setShowCloudModal(false)}
                session={session}
                can={can}
                showToast={showToast}
                onDataChanged={() => { reloadLeads(); reloadTasks(); }}
            />

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                session={session}
                showToast={showToast}
                onLogout={handleLogout}
            />

            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                onNavigate={(tab) => setActiveTab(tab)}
                brands={allBrands}
                currentUser={currentUser}
                onSwitchBrand={handleSwitchBrand}
                onOpenAuthModal={() => setShowAuthModal(true)}
                onAddLead={() => {
                    setActiveTab('crm');
                    setAddLeadRequested(true);
                }}
            />
        </AppShell>
    );
}

// Session gate: nothing renders until the server confirms the httpOnly session.
function AppRoot() {
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        AuthApi.me().then(setSession).catch(() => setSession(null));
        const onUnauthorized = () => setSession(null);
        window.addEventListener('api-unauthorized', onUnauthorized);
        return () => window.removeEventListener('api-unauthorized', onUnauthorized);
    }, []);

    if (session === undefined) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-bg text-fg-3" role="status" aria-live="polite">
                Memuat sesi…
            </div>
        );
    }
    if (!session) return <LoginScreen onLoggedIn={setSession} />;
    return <App key={session.user.id} session={session} onSessionChange={setSession} onLoggedOut={() => setSession(null)} />;
}

// =========================================================================
// BOOTSTRAP
// =========================================================================
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <ErrorBoundary>
            <AppRoot />
        </ErrorBoundary>
    );
}
