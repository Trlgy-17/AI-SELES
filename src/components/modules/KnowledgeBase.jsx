import React, { useState, useMemo } from 'react';
import { BookOpen, Calculator, FlaskConical, ChevronDown, Layers, Megaphone, Globe, Building2, Quote } from 'lucide-react';
import { KnowledgeService } from '../../js/services/knowledge.js';
import { Button } from '../ui/Button.jsx';
import { Input, SearchInput } from '../ui/Input.jsx';
import { Panel, PageHeader, Badge, Chip, EmptyState } from '../ui/Surface.jsx';
import { Modal } from '../ui/Modal.jsx';
import { cn } from '../../js/utils/cn.js';

const SCOPE_META = {
    GLOBAL: { label: 'Global', variant: 'primary', icon: Globe },
    BRAND_OVERRIDE: { label: 'Brand override', variant: 'warning', icon: Building2 },
    CAMPAIGN: { label: 'Campaign', variant: 'purple', icon: Megaphone }
};

const prettyCategory = (cat = '') =>
    cat.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

const ScopeBadge = ({ scope }) => {
    const meta = SCOPE_META[scope] || SCOPE_META.GLOBAL;
    return <Badge variant={meta.variant} icon={meta.icon}>{meta.label}</Badge>;
};

export const KnowledgeBase = ({ activeBrand, onOpenEstimator }) => {
    const currentBrandId = activeBrand?.id || 'brand_nacira';
    const brandName = activeBrand?.brandName || 'NACIRA STUDIO';

    const [activeLayerFilter, setActiveLayerFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [openItem, setOpenItem] = useState(null);
    const [showTester, setShowTester] = useState(false);

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

    const categories = useMemo(() => {
        const set = new Set(filteredItems.map((i) => i.category).filter(Boolean));
        return [...set].sort((a, b) => a.localeCompare(b, 'id'));
    }, [filteredItems]);

    const visibleItems = activeCategory === 'ALL' ? filteredItems : filteredItems.filter((i) => i.category === activeCategory);

    const relatedItems = openItem
        ? filteredItems.filter((i) => i !== openItem && i.category === openItem.category).slice(0, 5)
        : [];

    const layerTabs = [
        { id: 'ALL', label: 'Semua' },
        { id: 'GLOBAL', label: 'Global' },
        { id: 'BRAND_OVERRIDE', label: 'Brand override' },
        { id: 'CAMPAIGN', label: 'Campaign' }
    ];

    return (
        <div className="space-y-5 pb-8 animate-fade-in">
            <PageHeader
                title="Knowledge Base"
                description="SOP, harga, dan material yang dipakai AI dan tim sales."
                meta={<Badge variant="neutral" icon={Layers}>{filteredItems.length} modul · {brandName}</Badge>}
                actions={
                    onOpenEstimator && (
                        <Button variant="ghost" icon={Calculator} onClick={onOpenEstimator}>
                            Buka Estimator
                        </Button>
                    )
                }
            />

            {/* Search & filters */}
            <div className="space-y-3">
                <SearchInput
                    placeholder="Cari knowledge, SOP, material…"
                    aria-label="Cari knowledge"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                    className="sm:h-11 text-base sm:text-body"
                />
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none" role="group" aria-label="Filter kategori">
                        <Chip active={activeCategory === 'ALL'} onClick={() => setActiveCategory('ALL')}>Semua kategori</Chip>
                        {categories.map((cat) => (
                            <Chip key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>{prettyCategory(cat)}</Chip>
                        ))}
                    </div>
                    <div role="radiogroup" aria-label="Filter layer" className="inline-flex max-w-full shrink-0 items-center gap-1 self-start overflow-x-auto rounded-md border border-border bg-surface-2 p-1 scrollbar-none">
                        {layerTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="radio"
                                aria-checked={activeLayerFilter === tab.id}
                                onClick={() => setActiveLayerFilter(tab.id)}
                                className={cn(
                                    'h-8 whitespace-nowrap rounded-xs px-2.5 text-label font-medium transition-colors',
                                    activeLayerFilter === tab.id ? 'bg-surface-3 text-fg ring-1 ring-border-strong' : 'text-fg-3 hover:text-fg'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Article grid */}
            {visibleItems.length === 0 ? (
                <Panel>
                    <EmptyState
                        icon={BookOpen}
                        title="Knowledge tidak ditemukan"
                        description="Coba kata kunci lain atau ubah filter kategori dan layer."
                        action={
                            <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); setActiveLayerFilter('ALL'); }}>
                                Reset filter
                            </Button>
                        }
                    />
                </Panel>
            ) : (
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {visibleItems.map((item, idx) => (
                        <li key={item.id || idx}>
                            <button
                                type="button"
                                onClick={() => setOpenItem(item)}
                                className="group flex h-full w-full flex-col rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate text-caption font-medium text-fg-3">{prettyCategory(item.category)}</span>
                                    <ScopeBadge scope={item.scope} />
                                </div>
                                <h3 className="mt-2 text-body font-semibold text-fg group-hover:text-primary-text">{item.title}</h3>
                                <p className="mt-1.5 line-clamp-3 text-body-sm text-fg-3">{item.content}</p>
                                <span className="mt-auto pt-3 text-caption text-fg-muted">Prioritas {item.priority || 10}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* RAG tester */}
            <Panel padded={false}>
                <button
                    type="button"
                    onClick={() => setShowTester((v) => !v)}
                    aria-expanded={showTester}
                    aria-controls="rag-tester"
                    className="flex w-full min-h-[52px] items-center gap-3 px-4 py-3 text-left sm:px-5"
                >
                    <FlaskConical size={16} className="shrink-0 text-ai" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                        <span className="block text-body-sm font-semibold text-fg">Uji retrieval AI</span>
                        <span className="block truncate text-caption text-fg-muted">Lihat knowledge mana yang dipilih AI untuk sebuah pertanyaan klien.</span>
                    </span>
                    <ChevronDown size={16} className={cn('shrink-0 text-fg-muted transition-transform', showTester && 'rotate-180')} aria-hidden="true" />
                </button>

                {showTester && (
                    <div id="rag-tester" className="space-y-4 border-t border-border px-4 py-4 sm:px-5 animate-fade-in">
                        <form onSubmit={handleRunTest} className="flex flex-col gap-2 sm:flex-row">
                            <label htmlFor="rag-query" className="sr-only">Pertanyaan klien</label>
                            <Input
                                id="rag-query"
                                wrapperClassName="flex-1"
                                className="flex-1 text-base sm:text-sm"
                                value={testQuery}
                                onChange={(e) => setTestQuery(e.target.value)}
                                placeholder="Berapa harga kitchen set per meter di Bandung?"
                            />
                            <Button type="submit" variant="secondary" icon={FlaskConical}>Uji</Button>
                        </form>

                        {testResult && (
                            <div className="space-y-3 animate-fade-in">
                                <div className="text-label font-medium text-fg-2">
                                    {testResult.resolvedChunks?.length || 0} potongan knowledge dipilih untuk {brandName}
                                </div>
                                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    {testResult.resolvedChunks?.map((chunk, idx) => (
                                        <li key={idx} className="rounded-sm border border-border bg-surface-2 p-3">
                                            <div className="mb-1 flex items-center justify-between gap-2">
                                                <span className="truncate text-body-sm font-medium text-fg">{chunk.title}</span>
                                                <ScopeBadge scope={chunk.scope} />
                                            </div>
                                            <p className="line-clamp-3 text-caption text-fg-3">{chunk.content}</p>
                                            <div className="mt-1.5 flex justify-between text-caption text-fg-muted">
                                                <span>Prioritas {chunk.priority || 10}</span>
                                                <span>{prettyCategory(chunk.category)}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {testResult.citations?.length > 0 && (
                                    <div>
                                        <div className="mb-1.5 text-caption text-fg-muted">Sitasi</div>
                                        <ul className="space-y-1">
                                            {testResult.citations.map((cit, i) => (
                                                <li key={i} className="flex items-start gap-2 text-caption text-fg-3">
                                                    <Quote size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                                                    {cit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Panel>

            {/* Reading view */}
            <Modal
                isOpen={Boolean(openItem)}
                onClose={() => setOpenItem(null)}
                variant="sheet"
                size="lg"
                title={openItem?.title}
                description={openItem ? `${prettyCategory(openItem.category)} · Prioritas ${openItem.priority || 10}` : undefined}
                icon={BookOpen}
            >
                {openItem && (
                    <article className="mx-auto max-w-[720px]">
                        <div className="mb-4"><ScopeBadge scope={openItem.scope} /></div>
                        <div className="whitespace-pre-wrap text-[15px] leading-[1.75] text-fg-2">{openItem.content}</div>
                        {relatedItems.length > 0 && (
                            <aside className="mt-8 border-t border-border pt-4" aria-label="Knowledge terkait">
                                <h3 className="mb-2 text-label font-medium text-fg-3">Terkait</h3>
                                <ul className="space-y-1">
                                    {relatedItems.map((rel, i) => (
                                        <li key={rel.id || i}>
                                            <button
                                                type="button"
                                                onClick={() => setOpenItem(rel)}
                                                className="w-full rounded-xs px-2 py-1.5 text-left text-body-sm text-fg-2 hover:bg-surface-hover hover:text-primary-text"
                                            >
                                                {rel.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                        )}
                    </article>
                )}
            </Modal>
        </div>
    );
};
