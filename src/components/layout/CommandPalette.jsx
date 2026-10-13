// File: src/components/layout/CommandPalette.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, MessageSquareText, UsersRound, Calculator, BookOpen, KeyRound, UserPlus, Building2, CornerDownLeft } from 'lucide-react';
import { cn } from '../../js/utils/cn.js';

export const CommandPalette = ({
    isOpen,
    onClose,
    onNavigate,
    brands = [],
    currentUser,
    onSwitchBrand,
    onOpenAuthModal,
    onAddLead
}) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const restoreRef = useRef(null);
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    useEffect(() => {
        if (isOpen) {
            restoreRef.current = document.activeElement;
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 30);
        } else {
            restoreRef.current?.focus?.();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else window.dispatchEvent(new CustomEvent('open-command-palette'));
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const allActions = useMemo(() => {
        const base = [
            { id: 'workspace', title: 'Sales AI', hint: 'Buka workspace balasan AI', icon: MessageSquareText, action: () => onNavigate('workspace'), category: 'Navigasi' },
            { id: 'crm', title: 'CRM Leads', hint: 'Kelola prospek & pipeline', icon: UsersRound, action: () => onNavigate('crm'), category: 'Navigasi' },
            { id: 'estimator', title: 'Estimator', hint: 'Hitung RAB & ekspor PDF', icon: Calculator, action: () => onNavigate('estimator'), category: 'Navigasi' },
            { id: 'knowledge', title: 'Knowledge Base', hint: 'SOP, harga & material', icon: BookOpen, action: () => onNavigate('knowledge'), category: 'Navigasi' },
            { id: 'add_lead', title: 'Tambah lead baru', hint: 'Buka form lead di CRM', icon: UserPlus, action: () => onAddLead?.(), category: 'Aksi' },
            { id: 'search_client', title: 'Cari klien', hint: 'Buka CRM untuk mencari klien', icon: Search, action: () => onNavigate('crm'), category: 'Aksi' },
            { id: 'auth', title: 'Akun & sesi', hint: 'Ganti password atau keluar', icon: KeyRound, action: () => onOpenAuthModal(), category: 'Pengguna' }
        ];
        const brandActions = isSuperAdmin
            ? brands.map((b) => ({
                  id: `switch_${b.id}`,
                  title: `Pindah ke ${b.brandName}`,
                  hint: b.shortDescription,
                  icon: Building2,
                  action: () => onSwitchBrand(b.id),
                  category: 'Workspace brand'
              }))
            : [];
        return [...base, ...brandActions];
    }, [brands, isSuperAdmin, onNavigate, onAddLead, onOpenAuthModal, onSwitchBrand]);

    const filteredActions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allActions;
        return allActions.filter((a) => `${a.title} ${a.hint || ''} ${a.category}`.toLowerCase().includes(q));
    }, [allActions, query]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (!isOpen) return null;

    const run = (item) => {
        onClose();
        item.action();
    };

    const onInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filteredActions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filteredActions[activeIndex]) {
            e.preventDefault();
            run(filteredActions[activeIndex]);
        } else if (e.key === 'Tab') {
            e.preventDefault();
        }
    };

    let lastCategory = null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-[10dvh] sm:p-4 sm:pt-[14dvh]" role="presentation">
            <div className="absolute inset-0 bg-overlay backdrop-blur-[2px] animate-fade-in" onClick={onClose} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Menu perintah"
                className="relative flex max-h-[80dvh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-floating animate-sheet-up"
            >
                <div className="flex items-center gap-3 border-b border-border px-4">
                    <Search size={18} className="shrink-0 text-fg-muted" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls="command-list"
                        aria-activedescendant={filteredActions[activeIndex] ? `cmd-${filteredActions[activeIndex].id}` : undefined}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onInputKeyDown}
                        placeholder="Cari halaman, aksi, atau brand…"
                        className="h-14 w-full bg-transparent text-base text-fg placeholder:text-fg-muted focus:outline-none sm:text-body"
                    />
                    <kbd className="hidden rounded-xs border border-border bg-surface-3 px-1.5 py-px text-caption text-fg-3 sm:inline">Esc</kbd>
                </div>

                <ul id="command-list" ref={listRef} role="listbox" className="flex-1 overflow-y-auto p-2">
                    {filteredActions.length === 0 && (
                        <li className="px-4 py-10 text-center text-body-sm text-fg-3">Tidak ada hasil untuk “{query}”.</li>
                    )}
                    {filteredActions.map((item, index) => {
                        const Icon = item.icon;
                        const showHeader = item.category !== lastCategory;
                        lastCategory = item.category;
                        const selected = index === activeIndex;
                        return (
                            <React.Fragment key={item.id}>
                                {showHeader && (
                                    <li role="presentation" className="px-2.5 pb-1 pt-2.5 text-caption font-medium uppercase tracking-wider text-fg-muted">
                                        {item.category}
                                    </li>
                                )}
                                <li
                                    id={`cmd-${item.id}`}
                                    role="option"
                                    aria-selected={selected}
                                    data-index={index}
                                    onMouseMove={() => setActiveIndex(index)}
                                    onClick={() => run(item)}
                                    className={cn(
                                        'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2',
                                        selected ? 'bg-primary-subtle text-fg' : 'text-fg-2'
                                    )}
                                >
                                    <Icon size={16} className={cn('shrink-0', selected ? 'text-primary-text' : 'text-fg-muted')} aria-hidden="true" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-body-sm font-medium">{item.title}</span>
                                        {item.hint && <span className="block truncate text-caption text-fg-muted">{item.hint}</span>}
                                    </span>
                                    {selected && <CornerDownLeft size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />}
                                </li>
                            </React.Fragment>
                        );
                    })}
                </ul>

                <div className="hidden items-center gap-4 border-t border-border px-4 py-2 text-caption text-fg-muted sm:flex">
                    <span><kbd className="font-sans">↑↓</kbd> pilih</span>
                    <span><kbd className="font-sans">Enter</kbd> buka</span>
                    <span><kbd className="font-sans">Esc</kbd> tutup</span>
                </div>
            </div>
        </div>
    );
};
