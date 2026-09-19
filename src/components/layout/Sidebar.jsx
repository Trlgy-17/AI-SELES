import React, { useRef, useEffect, useCallback } from 'react';
import { Icons } from '../Icons.jsx';

export const Sidebar = ({ 
    isSidebarOpen, 
    setIsSidebarOpen, 
    activeTab, 
    setActiveTab, 
    syncStatus, 
    onOpenCloudModal,
    toggleButtonRef 
}) => {
    const sidebarRef = useRef(null);
    const closeBtnRef = useRef(null);

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
                <div className="p-6 flex items-center justify-between border-b border-[#26262d]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-[#c5a059]/20 border border-[#c5a059]/40 bg-[#141418] flex items-center justify-center p-0.5">
                            <img src="/logo-badge.png" alt="Nacira Studio" className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <div>
                            <h2 className="serif-font font-bold text-base tracking-wider text-white">NACIRA STUDIO</h2>
                            <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-semibold">Sales AI v2026</span>
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

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Core Engine</div>
                    <button 
                        onClick={() => { setActiveTab('workspace'); closeSidebar(); }} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === 'workspace' ? 'bg-[#c5a059] text-[#0d0d0d] font-bold shadow-lg shadow-[#c5a059]/25' : 'hover:bg-[#1a1a20] text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <Icons.MessageSquare />
                        <span>AI Workspace</span>
                    </button>
                    <button 
                        onClick={() => { setActiveTab('crm'); closeSidebar(); }} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === 'crm' ? 'bg-[#c5a059] text-[#0d0d0d] font-bold shadow-lg shadow-[#c5a059]/25' : 'hover:bg-[#1a1a20] text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <Icons.Users />
                        <span>CRM Data</span>
                    </button>
                    <button 
                        onClick={() => { setActiveTab('followup'); closeSidebar(); }} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === 'followup' ? 'bg-[#c5a059] text-[#0d0d0d] font-bold shadow-lg shadow-[#c5a059]/25' : 'hover:bg-[#1a1a20] text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <Icons.LayoutDashboard />
                        <span>Follow-Up Flow</span>
                    </button>
                    <button 
                        onClick={() => { setActiveTab('knowledge'); closeSidebar(); }} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === 'knowledge' ? 'bg-[#c5a059] text-[#0d0d0d] font-bold shadow-lg shadow-[#c5a059]/25' : 'hover:bg-[#1a1a20] text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <Icons.BookOpen />
                        <span>Knowledge Base</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-[#26262d]">
                    <button 
                        onClick={onOpenCloudModal}
                        className="w-full text-left p-3 bg-[#18181e] hover:bg-[#202028] rounded-xl border border-[#26262d] flex items-center justify-between transition-colors group"
                        aria-label="Buka Pengaturan Cloud dan Database"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                                syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' : 
                                syncStatus === 'checking' ? 'bg-amber-400 animate-pulse' : 
                                syncStatus === 'error' ? 'bg-rose-500' : 'bg-zinc-500'
                            }`}></div>
                            <div className="text-xs">
                                <p className="font-semibold text-zinc-200 flex items-center gap-1.5">
                                    <Icons.CloudSync /> 
                                    {syncStatus === 'synced' ? 'Cloud Synced' : 
                                     syncStatus === 'checking' ? 'Memeriksa koneksi...' : 
                                     syncStatus === 'error' ? 'Gagal Sinkron' : 'Mode Lokal (Storage)'}
                                </p>
                                <p className="text-[11px] text-zinc-400">
                                    {syncStatus === 'synced' ? 'Firestore aktif' : 
                                     syncStatus === 'checking' ? 'Menghubungkan...' : 
                                     syncStatus === 'error' ? 'Perlu perbaikan izin' : 'Data tersimpan di browser'}
                                </p>
                            </div>
                        </div>
                        <span className="text-zinc-500 group-hover:text-white transition-colors">
                            <Icons.Settings />
                        </span>
                    </button>
                </div>
            </aside>
        </React.Fragment>
    );
};
