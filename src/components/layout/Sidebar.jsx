// File: src/components/layout/Sidebar.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { MessageSquareText, UsersRound, Calculator, BookOpen, Settings2, X, ChevronsUpDown } from 'lucide-react';
import { BrandMark } from '../Icons.jsx';
import { cn } from '../../js/utils/cn.js';

const roleLabel = (role) => (role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Marketing');

export const Sidebar = ({
    isSidebarOpen,
    isCollapsed = false,
    setIsSidebarOpen,
    activeTab,
    setActiveTab,
    syncStatus,
    onOpenCloudModal,
    onOpenAuthModal,
    toggleButtonRef,
    currentUser
}) => {
    const closeBtnRef = useRef(null);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
        if (isSidebarOpen && toggleButtonRef?.current) {
            toggleButtonRef.current.focus();
        }
    }, [setIsSidebarOpen, toggleButtonRef, isSidebarOpen]);

    useEffect(() => {
        if (isSidebarOpen) closeBtnRef.current?.focus();
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isSidebarOpen) closeSidebar();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSidebarOpen, closeSidebar]);

    const navGroups = [
        {
            label: 'Workspace',
            items: [
                { id: 'workspace', label: 'Sales AI', icon: MessageSquareText, onSelect: () => setActiveTab('workspace') },
                { id: 'crm', label: 'CRM Leads', icon: UsersRound, onSelect: () => setActiveTab('crm') },
                { id: 'estimator', label: 'Estimator', icon: Calculator, onSelect: () => setActiveTab('estimator') }
            ]
        },
        {
            label: 'Knowledge',
            items: [{ id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, onSelect: () => setActiveTab('knowledge') }]
        },
        {
            label: 'System',
            items: [{ id: 'cloud', label: 'Pengaturan', icon: Settings2, onSelect: () => onOpenCloudModal() }]
        }
    ];

    // Rail (icon-only) only on tablet when the drawer is closed.
    const rail = !isSidebarOpen;
    const hideOnRail = rail ? (isCollapsed ? 'md:sr-only' : 'md:max-lg:sr-only') : '';
    const centerOnRail = rail ? (isCollapsed ? 'md:justify-center md:px-0' : 'md:max-lg:justify-center md:max-lg:px-0') : '';

    const syncLabel = syncStatus === 'synced' ? 'Tersimpan di server' : syncStatus === 'error' ? 'Server tidak terjangkau' : 'Memuat…';
    const syncDot = syncStatus === 'synced' ? 'bg-success' : syncStatus === 'error' ? 'bg-danger' : 'bg-warning';
    const initial = currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U';

    return (
        <>
            <div
                className={cn(
                    'fixed inset-0 z-30 bg-overlay backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
                    isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            <aside
                aria-label="Navigasi utama"
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex h-[100dvh] flex-col border-r border-border bg-sidebar transition-[transform,width] duration-200 ease-out',
                    isSidebarOpen
                        ? 'w-64 translate-x-0 shadow-floating lg:shadow-none'
                        : isCollapsed
                            ? 'w-64 -translate-x-full max-md:invisible md:translate-x-0 md:w-[72px]'
                            : 'w-64 -translate-x-full max-md:invisible md:translate-x-0 md:w-[72px] lg:w-64'
                )}
            >
                {/* Brand */}
                <div className={cn('flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4', centerOnRail)}>
                    <div className="flex min-w-0 items-center gap-2.5">
                        <BrandMark size={32} />
                        <div className={cn('min-w-0', hideOnRail)}>
                            <div className="truncate text-body font-semibold tracking-tight text-fg">Nacira AI</div>
                            <div className="truncate text-caption text-fg-muted">Asisten Sales Cerdas</div>
                        </div>
                    </div>
                    <button
                        ref={closeBtnRef}
                        onClick={closeSidebar}
                        className={cn('flex h-11 w-11 items-center justify-center rounded-sm text-fg-3 hover:bg-surface-hover hover:text-fg lg:hidden', !isSidebarOpen && 'hidden')}
                        aria-label="Tutup menu navigasi"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Menu">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <div className={cn('px-2.5 pb-1.5 text-caption font-medium uppercase tracking-wider text-fg-muted', hideOnRail)}>
                                {group.label}
                            </div>
                            <ul className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => {
                                                    item.onSelect();
                                                    closeSidebar();
                                                }}
                                                aria-current={isActive ? 'page' : undefined}
                                                title={item.label}
                                                className={cn(
                                                    'relative flex w-full min-h-[44px] sm:min-h-[38px] items-center gap-3 rounded-sm px-2.5 text-body font-medium transition-colors duration-150',
                                                    centerOnRail,
                                                    isActive
                                                        ? 'bg-primary-subtle text-primary-text'
                                                        : 'text-fg-3 hover:bg-surface-hover hover:text-fg'
                                                )}
                                            >
                                                {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary-text" aria-hidden="true" />}
                                                <Icon size={18} strokeWidth={1.9} className="shrink-0" aria-hidden="true" />
                                                <span className={cn('truncate', hideOnRail)}>{item.label}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="shrink-0 border-t border-border p-3 safe-padding-bottom lg:pb-3">
                    <button
                        onClick={onOpenAuthModal}
                        className={cn(
                            'flex w-full min-h-[44px] items-center gap-2.5 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-surface-hover',
                            centerOnRail
                        )}
                        title="Ganti akun atau lihat sesi"
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-label font-semibold text-fg ring-1 ring-border-strong">
                            {initial}
                        </span>
                        <span className={cn('min-w-0 flex-1', hideOnRail)}>
                            <span className="block truncate text-body-sm font-medium text-fg">{currentUser?.fullName || 'Pengguna'}</span>
                            <span className="block truncate text-caption text-fg-muted">{roleLabel(currentUser?.role)}</span>
                        </span>
                        <ChevronsUpDown size={14} className={cn('shrink-0 text-fg-muted', hideOnRail)} aria-hidden="true" />
                    </button>
                    <div className={cn('mt-2 flex items-center gap-1.5 px-2 text-caption text-fg-muted', hideOnRail)} role="status">
                        <span className={cn('h-1.5 w-1.5 rounded-full', syncDot)} aria-hidden="true" />
                        {syncLabel}
                    </div>
                </div>
            </aside>
        </>
    );
};
