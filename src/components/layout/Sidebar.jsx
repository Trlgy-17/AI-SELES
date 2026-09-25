// File: src/components/layout/Sidebar.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { Icons } from '../Icons.jsx';

export const Sidebar = ({ 
    isSidebarOpen, 
    setIsSidebarOpen, 
    activeTab, 
    setActiveTab, 
    syncStatus, 
    onOpenCloudModal,
    onOpenAuthModal,
    toggleButtonRef,
    activeBrand,
    currentUser,
    overdueCount = 0,
    todayCount = 0
}) => {
    const sidebarRef = useRef(null);
    const closeBtnRef = useRef(null);

    const brandName = activeBrand?.brandName || 'NACIRA STUDIO';

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
        if (toggleButtonRef && toggleButtonRef.current) {
            toggleButtonRef.current.focus();
        }
    }, [setIsSidebarOpen, toggleButtonRef]);

    useEffect(() => {
        if (isSidebarOpen) {
            closeBtnRef.current?.focus();
        }
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                closeSidebar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSidebarOpen, closeSidebar]);

    return (
        <React.Fragment>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-md transition-opacity duration-300 ${
                    isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={closeSidebar}
                aria-hidden="true"
            ></div>

            {/* Sidebar Drawer */}
            <aside 
                ref={sidebarRef}
                aria-label="Navigasi Utama"
                aria-hidden={!isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024}
                className={`w-72 bg-[#121216] text-slate-300 flex flex-col h-[100dvh] fixed left-0 top-0 shadow-2xl z-40 transition-all duration-300 ease-out border-r border-[#26262d] ${
                    isSidebarOpen 
                        ? 'translate-x-0 visible pointer-events-auto' 
                        : '-translate-x-full invisible lg:visible lg:translate-x-0 lg:pointer-events-auto'
                }`}
            >
                {/* Brand Header */}
                <div className="p-6 flex items-center justify-between border-b border-[#26262d]">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-[#c5a059]/20 border border-[#c5a059]/40 bg-[#141418] flex items-center justify-center p-0.5 flex-shrink-0">
                            <img 
                                src={activeBrand?.id === 'brand_nacira' ? '/logo-badge.png' : '/logo-nacira.png'} 
                                alt={brandName} 
                                className="w-full h-full object-contain rounded-lg"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="serif-font font-bold text-sm tracking-wider text-white truncate">{brandName}</h2>
                            <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                Multi-Brand Sales AI
                            </span>
                        </div>
                    </div>
                    <button 
                        ref={closeBtnRef}
                        onClick={closeSidebar} 
                        className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1a20]"
                        aria-label="Tutup menu navigasi"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* User Profile Card */}
                <div className="px-4 pt-4 pb-1">
                    <button
                        onClick={onOpenAuthModal}
                        className="w-full bg-[#181820] hover:bg-[#20202a] border border-[#2a2a36] rounded-2xl p-3 flex items-center justify-between text-left transition-colors"
                        title="Klik untuk ganti akun atau profil"
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold text-xs border border-[#c5a059]/30 flex-shrink-0">
                                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-xs font-bold text-white truncate">{currentUser?.fullName || 'Ary'}</div>
                                <div className="text-[10px] text-zinc-400 truncate">{currentUser?.role === 'SUPER_ADMIN' ? '👑 Super Admin' : 'Staf Marketing'}</div>
                            </div>
                        </div>
                        <span className="text-xs text-zinc-500">⇄</span>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
                    <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Modul Operasional</div>
                    
                    <button 
                        onClick={() => { setActiveTab('workspace'); closeSidebar(); }} 
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 text-xs font-semibold ${activeTab === 'workspace' ? 'bg-gradient-to-r from-[#c5a059] to-[#b8972e] text-[#0d0d0d] font-bold shadow-lg shadow-[#c5a059]/20' : 'hover:bg-[#1a1a20] text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Icons.MessageSquare />
                            <span>Sales Ary</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/20 font-mono font-bold">3 OPSI</span>
                    </button>

                    <button 
                        onClick={() => { setActiveTab('crm'); closeSidebar(); }} 
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-xs font-semibold ${activeTab === 'crm' ? 'bg-gradient-to-r from-[#c5a059] to-[#b8972e] text-[#0d0d0d] font-bold shadow-lg shadow-[#c5a059]/20' : 'hover:bg-[#1a1a20] text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <Icons.Users />
                        <span>CRM Leads {brandName.split(' ')[0]}</span>
                    </button>

                    <button 
                        onClick={() => { setActiveTab('estimator'); closeSidebar(); }} 
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-xs font-semibold ${activeTab === 'estimator' ? 'bg-gradient-to-r from-[#c5a059] to-[#b8972e] text-[#0d0d0d] font-bold shadow-lg shadow-[#c5a059]/20' : 'hover:bg-[#1a1a20] text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <Icons.Calculator />
                        <span>Kalkulator Estimasi RAB</span>
                    </button>

                    <div className="pt-3 px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Basis Pengetahuan</div>

                    <button 
                        onClick={() => { setActiveTab('knowledge'); closeSidebar(); }} 
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-xs font-semibold ${activeTab === 'knowledge' ? 'bg-gradient-to-r from-[#c5a059] to-[#b8972e] text-[#0d0d0d] font-bold shadow-lg shadow-[#c5a059]/20' : 'hover:bg-[#1a1a20] text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <Icons.BookOpen />
                        <span>Knowledge & Override</span>
                    </button>
                </nav>

                {/* Footer Sync & Brand Status */}
                <div className="p-4 border-t border-[#26262d] bg-[#0e0e12]/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                            {syncStatus === 'synced' ? 'Cloud Terhubung' : 'Penyimpanan Lokal'}
                        </span>
                        <button 
                            onClick={onOpenCloudModal} 
                            className="text-zinc-400 hover:text-[#c5a059] transition-colors p-1"
                            title="Pengaturan Database Cloud"
                        >
                            <Icons.Settings />
                        </button>
                    </div>
                    <div className="text-[10px] text-zinc-500 text-center font-mono">
                        Multi-Brand Core v2026.1
                    </div>
                </div>
            </aside>
        </React.Fragment>
    );
};
