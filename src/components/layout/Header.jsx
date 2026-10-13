// File: src/components/layout/Header.jsx
import React from 'react';
import { Menu as MenuIcon, Search, UserRound, Settings2, LogIn, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { BrandSwitcher } from './BrandSwitcher.jsx';
import { PAGE_META } from './navigation.js';
import { Menu } from '../ui/Menu.jsx';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '');

export const Header = ({
    setIsSidebarOpen,
    isCollapsed = false,
    onToggleCollapsed,
    activeTab,
    toggleButtonRef,
    activeBrand,
    currentUser,
    brands = [],
    onSwitchBrand,
    onOpenAuthModal,
    onOpenCloudModal,
    onOpenCommandPalette
}) => {
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const page = PAGE_META[activeTab] || { title: 'Sales AI' };
    const initial = currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U';

    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-bg/85 px-3.5 backdrop-blur-md sm:gap-3 sm:px-6 lg:px-8">
            <button
                ref={toggleButtonRef}
                onClick={() => setIsSidebarOpen(true)}
                className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-sm text-fg-2 hover:bg-surface-hover hover:text-fg md:flex lg:hidden"
                aria-label="Buka menu navigasi"
            >
                <MenuIcon size={20} aria-hidden="true" />
            </button>

            <button
                onClick={onToggleCollapsed}
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-sm text-fg-3 hover:bg-surface-hover hover:text-fg lg:flex"
                aria-label={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
                aria-expanded={!isCollapsed}
                title={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
            >
                {isCollapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
            </button>

            <div className="min-w-0 flex-1">
                <nav aria-label="Breadcrumb" className="hidden text-caption text-fg-muted sm:block">
                    <span className="truncate">{(activeBrand?.brandName || 'NACIRA STUDIO').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                    <span className="mx-1.5" aria-hidden="true">/</span>
                    <span className="text-fg-3">{page.title}</span>
                </nav>
                <div className="truncate text-h3 font-semibold text-fg sm:text-body">{page.title}</div>
            </div>

            <button
                onClick={onOpenCommandPalette}
                className="flex h-11 w-11 sm:h-9 sm:w-auto shrink-0 items-center justify-center gap-2 rounded-sm border border-border bg-surface text-fg-3 transition-colors hover:border-border-strong hover:text-fg sm:min-w-[200px] sm:justify-start sm:px-2.5"
                aria-label="Cari atau buka menu perintah (Ctrl K)"
                title="Cari (Ctrl+K)"
            >
                <Search size={16} aria-hidden="true" />
                <span className="hidden flex-1 text-left text-body-sm sm:block">Cari…</span>
                <kbd className="hidden rounded-xs border border-border bg-surface-3 px-1.5 py-px font-sans text-caption text-fg-3 sm:inline">
                    {isMac ? '⌘K' : 'Ctrl K'}
                </kbd>
            </button>

            <BrandSwitcher activeBrand={activeBrand} brands={brands} canSwitch={isSuperAdmin} onSwitchBrand={onSwitchBrand} />

            <Menu
                items={[
                    { type: 'label', label: currentUser?.fullName || 'Pengguna' },
                    { id: 'account', label: 'Akun & sesi', icon: LogIn, onSelect: onOpenAuthModal },
                    { id: 'cloud', label: 'Pengaturan', icon: Settings2, onSelect: onOpenCloudModal }
                ]}
                trigger={({ props }) => (
                    <button
                        type="button"
                        {...props}
                        aria-label="Menu akun"
                        className="flex h-11 w-11 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 text-label font-semibold text-fg ring-1 ring-border-strong hover:ring-primary/50">
                            {initial || <UserRound size={14} aria-hidden="true" />}
                        </span>
                    </button>
                )}
            />
        </header>
    );
};
