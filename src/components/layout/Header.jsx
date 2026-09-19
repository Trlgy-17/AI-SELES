// File: src/components/layout/Header.jsx
import React from 'react';

export const Header = ({ setIsSidebarOpen, activeTab, toggleButtonRef }) => {
    return (
        <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
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
                    <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-[#c5a059]/20 border border-[#c5a059]/40 bg-[#16161c] flex-shrink-0 hidden sm:flex items-center justify-center p-0.5">
                        <img src="/logo-badge.png" alt="Nacira Studio Logo" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div>
                        <h1 className="serif-font text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            NACIRA STUDIO <br className="md:hidden" />
                            <span className="gold-gradient-text">Sales Intelligence AI</span>
                        </h1>
                        <p className="text-zinc-400 mt-1 text-sm md:text-base font-medium">
                            Architectural Interior Design & Build — Master Price List 2026
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-[#16161c] text-[#c5a059] px-4 py-2.5 rounded-2xl text-xs font-extrabold border border-[#2e2e38] shadow-sm self-start md:self-auto whitespace-nowrap flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse"></span>
                {activeTab === 'workspace' ? 'AI WhatsApp Workspace' : `${activeTab.toUpperCase()} Module Active`}
            </div>
        </header>
    );
};
