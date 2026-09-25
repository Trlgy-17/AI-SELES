// File: src/components/layout/CommandPalette.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../Icons.jsx';

export const CommandPalette = ({
    isOpen,
    onClose,
    onNavigate,
    brands = [],
    currentUser,
    onSwitchBrand,
    onOpenAuthModal
}) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 50);
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

    if (!isOpen) return null;

    const baseActions = [
        { id: 'workspace', title: 'Sales Ary', icon: <Icons.MessageSquare />, action: () => onNavigate('workspace'), category: 'Navigasi' },
        { id: 'crm', title: 'CRM Data Leads', icon: <Icons.Users />, action: () => onNavigate('crm'), category: 'Navigasi' },
        { id: 'estimator', title: 'Kalkulator Estimasi RAB & Cetak PDF', icon: <Icons.Calculator />, action: () => onNavigate('estimator'), category: 'Navigasi' },
        { id: 'knowledge', title: 'Knowledge Base & Master Pricelist', icon: <Icons.BookOpen />, action: () => onNavigate('knowledge'), category: 'Navigasi' },
        { id: 'auth', title: 'Ganti Akun Admin / Login Profil', icon: <Icons.Key />, action: () => { onClose(); onOpenAuthModal(); }, category: 'Pengguna' }
    ];

    const brandActions = isSuperAdmin ? brands.map(b => ({
        id: `switch_${b.id}`,
        title: `Pindah Workspace: ${b.brandName}`,
        icon: <Icons.Brain />,
        action: () => { onSwitchBrand(b.id); onClose(); },
        category: 'Workspace Brand (Super Admin)'
    })) : [];

    const allActions = [...baseActions, ...brandActions];
    const filteredActions = query.trim() === '' 
        ? allActions 
        : allActions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-[#15151a] border border-[#2e2e38] rounded-3xl max-w-lg w-full max-h-[85dvh] shadow-2xl overflow-hidden flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input Bar */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#26262d] bg-[#1a1a22]">
                    <div className="text-[#c5a059]"><Icons.Search /></div>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                        placeholder="Ketik perintah atau cari menu (Ctrl+K)..." 
                        className="bg-transparent text-white text-base sm:text-sm w-full focus:outline-none placeholder:text-zinc-500 font-medium"
                    />
                    <kbd className="text-[10px] bg-[#22222c] text-zinc-400 px-2 py-0.5 rounded border border-[#30303e] font-mono">ESC</kbd>
                </div>

                {/* Command List */}
                <div className="max-h-80 overflow-y-auto p-3 space-y-1">
                    {filteredActions.length > 0 ? (
                        filteredActions.map(action => (
                            <button
                                key={action.id}
                                onClick={() => { action.action(); onClose(); }}
                                className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-2xl hover:bg-[#20202a] text-zinc-300 hover:text-white transition-all text-left text-xs font-medium group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-500 group-hover:text-[#c5a059] transition-colors">{action.icon}</span>
                                    <span>{action.title}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{action.category}</span>
                            </button>
                        ))
                    ) : (
                        <div className="p-8 text-center text-xs text-zinc-500">
                            Tidak ditemukan perintah yang cocok dengan "{query}".
                        </div>
                    )}
                </div>

                <div className="p-3 bg-[#111115] border-t border-[#26262d] text-[10px] text-zinc-500 flex justify-between items-center px-5">
                    <span>Gunakan navigasi keyboard atau klik</span>
                    <span>Pusat Kendali Multi-Brand</span>
                </div>
            </div>
        </div>
    );
};
