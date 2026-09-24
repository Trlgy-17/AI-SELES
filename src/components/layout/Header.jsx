// File: src/components/layout/Header.jsx
import React from 'react';
import { Icons } from '../Icons.jsx';

export const Header = ({ 
    setIsSidebarOpen, 
    activeTab, 
    toggleButtonRef, 
    activeBrand, 
    currentUser, 
    brands = [], 
    onSwitchBrand,
    onOpenAuthModal,
    onOpenCommandPalette
}) => {
    const brandName = activeBrand?.brandName || 'NACIRA STUDIO';
    const shortDesc = activeBrand?.shortDescription || 'Architectural Interior Design & Build — Master Price List 2026';
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    return (
        <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4 animate-fade-in">
            <div className="flex items-start gap-4">
                <button 
                    ref={toggleButtonRef}
                    onClick={() => setIsSidebarOpen(true)} 
                    className="lg:hidden mt-1 p-2.5 bg-[#16161c] border border-[#26262d] rounded-2xl text-zinc-300 shadow-sm hover:bg-[#1f1f28]"
                    aria-label="Buka menu navigasi"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-[#c5a059]/20 border border-[#c5a059]/40 bg-[#16161c] flex-shrink-0 hidden sm:flex items-center justify-center p-1">
                        <img 
                            src={activeBrand?.id === 'brand_nacira' ? '/logo-badge.png' : '/logo-nacira.png'} 
                            alt={`${brandName} Logo`} 
                            className="w-full h-full object-contain rounded-xl"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="serif-font text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                                {brandName} <span className="gold-gradient-text text-xl md:text-2xl font-sans font-bold">Sales Copilot</span>
                            </h1>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                                {activeBrand?.id === 'brand_nacira' ? 'Flagship' : 'Multi-Brand'}
                            </span>
                        </div>
                        <p className="text-zinc-400 mt-0.5 text-xs md:text-sm font-medium line-clamp-1 max-w-xl">
                            {shortDesc}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Workspace Switcher */}
            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
                {/* Command Palette Trigger */}
                <button
                    onClick={onOpenCommandPalette}
                    className="bg-[#16161c] hover:bg-[#202028] text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-[#2e2e38] transition-all flex items-center gap-2 shadow-sm"
                    title="Buka Command Palette (Ctrl+K)"
                >
                    <Icons.Search />
                    <span className="hidden sm:inline">Cari / Menu</span>
                    <kbd className="bg-[#242430] text-[10px] px-1.5 py-0.5 rounded text-zinc-300 border border-[#363644] font-mono">⌘K</kbd>
                </button>

                {/* Super Admin Brand Switcher */}
                {isSuperAdmin && brands.length > 0 && (
                    <div className="relative">
                        <select
                            value={activeBrand?.id}
                            onChange={(e) => onSwitchBrand(e.target.value)}
                            className="bg-[#16161c] text-[#c5a059] font-bold text-xs py-2 px-3 pr-8 rounded-xl border border-[#c5a059]/40 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/40 shadow-sm cursor-pointer appearance-none"
                            aria-label="Pilih Brand Workspace"
                        >
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>
                                    🏢 {b.brandName}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#c5a059] text-[10px]">
                            ▼
                        </div>
                    </div>
                )}

                {/* Profile / Account Badge */}
                <button
                    onClick={onOpenAuthModal}
                    className="bg-[#16161c] hover:bg-[#202028] text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#2e2e38] flex items-center gap-2 shadow-sm transition-all"
                    title="Ganti Akun / Info Sesi"
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-white max-w-[120px] truncate">{currentUser?.fullName?.split(' ')[0] || 'User'}</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest hidden lg:inline">({currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Marketing'})</span>
                </button>
            </div>
        </header>
    );
};
