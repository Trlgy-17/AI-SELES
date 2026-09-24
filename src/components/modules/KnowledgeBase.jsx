import React, { useState, useMemo } from 'react';
import { KnowledgeService } from '../../js/services/knowledge.js';
import { Icons } from '../Icons.jsx';
import { EstimatorCalculator } from './EstimatorCalculator.jsx';

export const KnowledgeBase = ({ activeBrand, currentUser, onApplyToAI, showToast }) => {
    const currentBrandId = activeBrand?.id || 'brand_nacira';
    const brandName = activeBrand?.brandName || 'NACIRA STUDIO';

    const [viewMode, setViewMode] = useState('CALCULATOR'); // 'CALCULATOR' | 'CATALOG'
    const [activeLayerFilter, setActiveLayerFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    
    // RAG Testing Console States
    const [testQuery, setTestQuery] = useState('');
    const [testResult, setTestResult] = useState(null);

    const allKnowledgeItems = useMemo(() => {
        return KnowledgeService.getAllItems();
    }, []);

    // Filter Knowledge Items sesuai Brand Aktif & Tab Layer
    const filteredItems = useMemo(() => {
        return allKnowledgeItems.filter(item => {
            // Cek apakah relevan untuk brand aktif (GLOBAL atau milik brand aktif)
            const isRelevantForBrand = item.scope === 'GLOBAL' || item.brandId === currentBrandId;
            if (!isRelevantForBrand) return false;

            // Filter tab layer
            if (activeLayerFilter === 'GLOBAL' && item.scope !== 'GLOBAL') return false;
            if (activeLayerFilter === 'BRAND_OVERRIDE' && item.scope !== 'BRAND_OVERRIDE') return false;
            if (activeLayerFilter === 'CAMPAIGN' && item.scope !== 'CAMPAIGN') return false;

            // Filter teks pencarian
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const inTitle = (item.title || '').toLowerCase().includes(q);
                const inContent = (item.content || '').toLowerCase().includes(q);
                const inCat = (item.category || '').toLowerCase().includes(q);
                return inTitle || inContent || inCat;
            }

            return true;
        });
    }, [allKnowledgeItems, currentBrandId, activeLayerFilter, searchQuery]);

    // Jalankan pengujian resolusi knowledge (RAG tester)
    const handleRunTest = (e) => {
        e?.preventDefault();
        const res = KnowledgeService.resolveKnowledge({
            brandId: currentBrandId,
            queryText: testQuery
        });
        setTestResult(res);
    };

    const getScopeBadge = (scope) => {
        if (scope === 'CAMPAIGN') {
            return (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Layer 3: Campaign Promo
                </span>
            );
        }
        if (scope === 'BRAND_OVERRIDE') {
            return (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Layer 2: Brand Override ({brandName})
                </span>
            );
        }
        return (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Layer 1: Global Shared Core
            </span>
        );
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header Brand Bar */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-[#26262d] flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#202028] text-[#c5a059] flex items-center justify-center font-bold text-lg border border-[#33333d]">
                        <Icons.BookOpen />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="serif-font text-xl md:text-2xl font-extrabold text-white">
                                3-Layer Knowledge Base Engine
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                                {brandName}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                            Pusat pengetahuan penjualan resmi: Core Master Pricelist 2026 milik bersama, didukung Layer Override khusus untuk setiap brand interior.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3.5 py-2 bg-[#202028] text-[#c5a059] font-bold text-xs rounded-xl border border-[#33333d] shadow-sm flex items-center gap-1.5">
                        <Icons.Brain /> {filteredItems.length} Modul Terverifikasi
                    </span>
                    <span className="px-3 py-2 bg-emerald-950/80 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-800 flex items-center gap-1.5">
                        <Icons.CheckCircle /> SOP v2026.1 Aktif
                    </span>
                </div>
            </div>

            {/* VIEW MODE TABS: KALKULATOR ESTIMASI vs KATALOG KNOWLEDGE */}
            <div className="flex items-center gap-2 p-1.5 bg-[#15151a] rounded-2xl border border-[#26262d] w-fit flex-wrap">
                <button
                    type="button"
                    onClick={() => setViewMode('CALCULATOR')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        viewMode === 'CALCULATOR'
                            ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    <span className="text-base">🧮</span>
                    <span>Kalkulator Estimasi Biaya (RAB Master 2026)</span>
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode('CATALOG')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        viewMode === 'CATALOG'
                            ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    <span className="text-base">📚</span>
                    <span>Katalog Knowledge Base & SOP ({filteredItems.length})</span>
                </button>
            </div>

            {viewMode === 'CALCULATOR' ? (
                <EstimatorCalculator 
                    activeBrand={activeBrand} 
                    onApplyToAI={onApplyToAI} 
                    showToast={showToast} 
                />
            ) : (
                <React.Fragment>
                    {/* RAG PLAYGROUND / KNOWLEDGE RESOLUTION TESTER */}
                    <div className="bg-[#15151a] rounded-3xl p-6 md:p-8 shadow-2xl border border-[#26262d] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-[#202028] text-[#c5a059] rounded-xl">
                            <Icons.Zap />
                        </div>
                        <div>
                            <h3 className="serif-font font-bold text-base text-white">
                                Knowledge Testing Console (RAG Inspector)
                            </h3>
                            <p className="text-xs text-zinc-400">
                                Uji bagaimana AI mencocokkan query klien dengan urutan hierarki: Campaign &gt; Brand Override &gt; Global Core.
                            </p>
                        </div>
                    </div>
                    <span className="text-[11px] text-zinc-500 bg-[#1b1b22] px-3 py-1 rounded-xl border border-[#26262d]">
                        Multi-Brand Resolution Mode: <strong className="text-white">{brandName}</strong>
                    </span>
                </div>

                <form onSubmit={handleRunTest} className="flex gap-2">
                    <input 
                        type="text"
                        value={testQuery}
                        onChange={(e) => setTestQuery(e.target.value)}
                        placeholder="Contoh query klien: 'Berapa harga kitchen set per meter di Bandung?' atau 'Ada diskon promo apa?'..."
                        className="flex-1 bg-[#1b1b22] border border-[#26262d] rounded-2xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a059]"
                    />
                    <button
                        type="submit"
                        className="gold-btn px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#c5a059]/20 flex-shrink-0"
                    >
                        <Icons.Search /> Test Resolusi RAG
                    </button>
                </form>

                {testResult && (
                    <div className="mt-4 p-5 bg-[#1b1b22] border border-[#2e2e38] rounded-2xl space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#26262d] pb-3">
                            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                <Icons.CheckCircle />
                                {testResult.resolvedChunks?.length || 0} Knowledge Chunks Terpilih untuk LLM
                            </div>
                            <div className="text-[11px] text-zinc-400">
                                Brand Aktif: <span className="text-[#c5a059] font-bold">{brandName}</span>
                            </div>
                        </div>

                        {/* Visualizer Chunks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {testResult.resolvedChunks?.map((chunk, idx) => (
                                <div key={idx} className="bg-[#15151a] p-3.5 rounded-xl border border-[#26262d] text-xs">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-bold text-white truncate">{chunk.title}</span>
                                        {getScopeBadge(chunk.scope)}
                                    </div>
                                    <div className="text-[11px] text-zinc-400 line-clamp-3 font-mono bg-[#111115] p-2 rounded-lg border border-[#202026]">
                                        {chunk.content}
                                    </div>
                                    <div className="mt-2 text-[10px] text-zinc-500 flex justify-between">
                                        <span>Prioritas: {chunk.priority || 10}</span>
                                        <span>Kategori: {chunk.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sitasi yang Disematkan */}
                        <div className="pt-2">
                            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1.5">
                                Daftar Sitasi Resmi (Divalidasi Anti-Halusinasi):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {testResult.citations?.map((cit, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#202028] text-[#c5a059] text-[11px] font-medium border border-[#33333d]">
                                        📖 {cit}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FILTER LAYER & PENCARIAN */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#15151a] p-4 rounded-3xl border border-[#26262d]">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    {[
                        { id: 'ALL', label: 'Semua Layer' },
                        { id: 'GLOBAL', label: 'Layer 1: Global Core' },
                        { id: 'BRAND_OVERRIDE', label: `Layer 2: Override (${brandName})` },
                        { id: 'CAMPAIGN', label: 'Layer 3: Campaign' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveLayerFilter(tab.id)}
                            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                                activeLayerFilter === tab.id
                                    ? 'bg-[#c5a059] text-[#0d0d0d] shadow-md shadow-[#c5a059]/20'
                                    : 'bg-[#1b1b22] text-zinc-400 hover:text-white border border-[#2a2a34]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <input 
                        type="text" 
                        placeholder="Cari modul atau materi..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1b1b22] border border-[#26262d] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a059]"
                    />
                    <div className="absolute left-3.5 top-3 text-zinc-500">
                        <Icons.Search />
                    </div>
                </div>
            </div>

            {/* GRID DAFTAR KNOWLEDGE CHUNKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, idx) => (
                    <div 
                        key={item.id || idx} 
                        className="bg-[#15151a] rounded-3xl p-6 border border-[#26262d] shadow-2xl flex flex-col justify-between hover:border-[#c5a059]/50 transition-all group"
                    >
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-extrabold px-3 py-1 bg-[#202028] text-[#c5a059] rounded-xl border border-[#2e2e38]">
                                    {item.category}
                                </span>
                                {getScopeBadge(item.scope)}
                            </div>

                            <h3 className="serif-font font-extrabold text-white text-base group-hover:text-[#f3e7c4] transition-colors mt-2">
                                {item.title}
                            </h3>
                            <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed font-medium line-clamp-5">
                                {item.content}
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#26262d] flex justify-between items-center text-xs">
                            <span className="text-zinc-500 font-medium">Prioritas Resolusi: {item.priority || 10}</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                                <Icons.CheckCircle /> Terverifikasi
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            </React.Fragment>
            )}
        </div>
    );
};
