// File: src/components/modules/EstimatorCalculator.jsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    CookingPot, BedDouble, Sofa, Hammer, Calculator, Home, Building2, Info, Truck, Copy, Check, FileDown, Send, ChevronUp
} from 'lucide-react';
import { FormField } from '../common/FormField.jsx';
import { Button } from '../ui/Button.jsx';
import { Input, Select } from '../ui/Input.jsx';
import { Panel, Badge, Chip, SelectableCard } from '../ui/Surface.jsx';
import { Modal } from '../ui/Modal.jsx';
import { cn } from '../../js/utils/cn.js';
import { 
    ESTIMATOR_CATEGORIES,
    KAMAR_SET_ITEMS,
    LIVING_ROOM_ITEMS,
    SIPIL_BENGKEL_ITEMS,
    calculateEstimate, 
    formatEstimateForWhatsApp,
    PROJECT_RULES,
    TOP_TABLE_PRICES,
    BACKSPLASH_PRICES,
    PRICELIST_CATALOG
} from '../../js/services/calculatorData.js';
import { copyToClipboard } from '../../js/utils/clipboard.js';
import { exportEstimateToPDF } from '../../js/utils/pdfExport.js';

export const EstimatorCalculator = ({ 
    activeBrand, 
    onApplyToAI, 
    showToast 
}) => {
    const brandName = activeBrand?.brandName || 'PUTRA INTERIOR';
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    // Form States
    const [region, setRegion] = useState('dalam_kota'); // 'dalam_kota' (PL DK) | 'luar_kota' (PL LK)
    const [category, setCategory] = useState('KITCHEN_SET'); // 4 Master Areas
    const [subItem, setSubItem] = useState('LEMARI_WARDROBE'); // Sub-item selector for non-kitchen
    const [material, setMaterial] = useState('MULTIPLEKS');
    const [style, setStyle] = useState('MINIMALIS');
    
    // Generic Dimensions
    const [p, setP] = useState(3.0);
    const [t, setT] = useState(2.8);
    const [l, setL] = useState(1.6);

    // Kitchen Set Unified: Cabinet Bawah & Cabinet Atas
    const [cabinetBawah, setCabinetBawah] = useState(2.0);
    const [cabinetAtas, setCabinetAtas] = useState(2.0);
    const [isKusenBawahOnly, setIsKusenBawahOnly] = useState(false);

    // Kitchen Set Unified: Top Table & Backsplash
    const [topTableOption, setTopTableOption] = useState('none'); // 'none' | 'AICA' | 'QUADRA' | 'GRANIT'
    const [topTableLength, setTopTableLength] = useState('');
    const [backsplashOption, setBacksplashOption] = useState('none'); // 'none' | 'AICA' | 'QUADRA' | 'GRANIT' | 'KERAMIK_BEVEL' | 'MOZAIC' | 'CERMIN_GREY'
    const [backsplashLength, setBacksplashLength] = useState('');

    // Kitchen Set Unified: Mini Bar, Topi Bar, Box Elektronik & Hambalan
    const [miniBarLength, setMiniBarLength] = useState(0); // Rumus: P : 0.6 x Harga
    const [topiBarLength, setTopiBarLength] = useState(0); // Rumus: P x Harga
    const [boxElektronikType, setBoxElektronikType] = useState('none'); // 'none' | 'box_kulkas'
    const [boxP, setBoxP] = useState(0.8);
    const [boxT, setBoxT] = useState(2.0);
    const [boxQty, setBoxQty] = useState(1);
    const [hambalanLength, setHambalanLength] = useState(0); // Rumus resmi: Rp 650.000 / m'
    const [plafonOption, setPlafonOption] = useState('none'); // 'none' | 'lt_50' | '50_to_70'

    // Kamar Set Specific
    const [pintuKaca, setPintuKaca] = useState('none');
    const [headboardOption, setHeadboardOption] = useState('none');
    const [nakasQty, setNakasQty] = useState(0);
    const [nakasOption, setNakasOption] = useState('MINIMALIS');
    const [rangkaDipanTingkat, setRangkaDipanTingkat] = useState('160x200');

    // Living Room Specific
    const [bawahTanggaKedalamanGt60, setBawahTanggaKedalamanGt60] = useState(false);
    const [partisiType, setPartisiType] = useState('kisi');
    const [benchBusa, setBenchBusa] = useState(false);
    const [wallpanelType, setWallpanelType] = useState('MULTIPLEK');
    const [sofaCover, setSofaCover] = useState('standard');

    // Sipil & Bengkel Specific
    const [canopiType, setCanopiType] = useState('HOLO_4X4_SPANDEK');
    const [pagarType, setPagarType] = useState('MINIMALIS');
    const [jasaSipilType, setJasaSipilType] = useState('COR_MEJA_DAPUR');
    const [jasaSipilQty, setJasaSipilQty] = useState(1);

    // Shared Add-ons
    const [isHplLuarDalam, setIsHplLuarDalam] = useState(false);
    const [customAddons, setCustomAddons] = useState(0);
    const [copied, setCopied] = useState(false);

    // Saat ganti kategori utama, sinkronisasi subItem yang sesuai
    const handleCategoryChange = (catId) => {
        setCategory(catId);
        if (catId === 'KAMAR_SET') {
            setSubItem('LEMARI_WARDROBE');
            setT(2.8);
        } else if (catId === 'LIVING_ROOM') {
            setSubItem('BACKDROP_TV');
            setT(2.4);
        } else if (catId === 'SIPIL_BENGKEL') {
            setSubItem('CANOPI');
            setP(4.0);
            setL(3.0);
        }
    };

    // Real-time calculation
    const estimate = useMemo(() => {
        return calculateEstimate({
            region,
            category,
            subItem,
            material,
            style,
            p,
            t,
            l,
            cabinetBawah: category === 'KITCHEN_SET' ? cabinetBawah : undefined,
            cabinetAtas: category === 'KITCHEN_SET' ? cabinetAtas : undefined,
            isKusenBawahOnly: category === 'KITCHEN_SET' ? isKusenBawahOnly : false,
            topTableOption: category === 'KITCHEN_SET' ? topTableOption : 'none',
            topTableLength: category === 'KITCHEN_SET' ? topTableLength : undefined,
            backsplashOption: category === 'KITCHEN_SET' ? backsplashOption : 'none',
            backsplashLength: category === 'KITCHEN_SET' ? backsplashLength : undefined,
            miniBarLength: category === 'KITCHEN_SET' ? miniBarLength : 0,
            topiBarLength: category === 'KITCHEN_SET' ? topiBarLength : 0,
            boxElektronikType: category === 'KITCHEN_SET' ? boxElektronikType : 'none',
            boxP: (category === 'KITCHEN_SET' && boxElektronikType !== 'none') ? boxP : 0,
            boxT: (category === 'KITCHEN_SET' && boxElektronikType !== 'none') ? boxT : 0,
            boxQty: (category === 'KITCHEN_SET' && boxElektronikType !== 'none') ? boxQty : 0,
            hambalanLength: category === 'KITCHEN_SET' ? hambalanLength : 0,
            hambalanQty: category === 'KITCHEN_SET' ? hambalanLength : 0,
            plafonOption,
            // Kamar Set
            pintuKaca,
            headboardOption,
            nakasQty,
            nakasOption,
            rangkaDipanTingkat,
            // Living Room
            bawahTanggaKedalamanGt60,
            partisiType,
            benchBusa,
            wallpanelType,
            sofaCover,
            // Sipil & Bengkel
            canopiType,
            pagarType,
            jasaSipilType,
            jasaSipilQty,
            // Shared
            isHplLuarDalam,
            customAddons: parseFloat(customAddons) || 0
        });
    }, [
        region, category, subItem, material, style, p, t, l,
        cabinetBawah, cabinetAtas, isKusenBawahOnly,
        topTableOption, topTableLength, backsplashOption, backsplashLength,
        miniBarLength, topiBarLength, boxElektronikType, boxP, boxT, boxQty, hambalanLength,
        plafonOption, pintuKaca, headboardOption, nakasQty, nakasOption, rangkaDipanTingkat,
        bawahTanggaKedalamanGt60, partisiType, benchBusa, wallpanelType, sofaCover,
        canopiType, pagarType, jasaSipilType, jasaSipilQty,
        isHplLuarDalam, customAddons
    ]);

    // Tarif dasar Box Elektronik = Material Kitchen Set + Rp 100.000
    const boxUnitPrice = useMemo(() => {
        const catPrices = PRICELIST_CATALOG.KITCHEN_SET[region]?.[material] || PRICELIST_CATALOG.KITCHEN_SET[region]?.MULTIPLEKS;
        let resolvedStyle = style;
        if (material === 'ALUMUNIUM') {
            resolvedStyle = (style === 'DOUBLE_LAYER' || style === 'SEMI_KLASIK' || style === 'KLASIK') ? 'DOUBLE_LAYER' : 'SINGLE_LAYER';
        }
        const styleData = catPrices?.[resolvedStyle] || catPrices?.[style] || catPrices?.MINIMALIS || { base: 2000000 };
        return (styleData.base || 2000000) + 100000;
    }, [region, material, style]);

    const formattedWhatsAppText = useMemo(() => {
        return formatEstimateForWhatsApp(estimate, brandName);
    }, [estimate, brandName]);

    const handleCopy = async () => {
        const ok = await copyToClipboard(formattedWhatsAppText);
        if (ok) {
            setCopied(true);
            showToast?.("Rincian estimasi biaya berhasil disalin dalam format WhatsApp!");
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleExportPDF = async () => {
        try {
            setIsExportingPDF(true);
            exportEstimateToPDF(estimate, activeBrand);
            showToast?.(`File PDF penawaran RAB (${brandName}) berhasil diunduh!`, 'success');
        } catch (err) {
            console.error('Gagal membuat dokumen PDF:', err);
            showToast?.('Gagal membuat dokumen PDF: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const handleSendToAI = () => {
        if (onApplyToAI) {
            let dimString = `${p}m ${t > 1 ? `x ${t}m` : ''} ${l > 1 ? `x ${l}m` : ''}`.trim();
            if (category === 'KITCHEN_SET') {
                const parts = [`Cabinet Bawah: ${cabinetBawah}m'`, `Cabinet Atas: ${cabinetAtas}m'`];
                if (topTableOption !== 'none') parts.push(`Top Table: ${topTableOption}`);
                if (backsplashOption !== 'none') parts.push(`Backsplash: ${backsplashOption}`);
                if (miniBarLength > 0) parts.push(`Mini Bar: ${miniBarLength}m'`);
                dimString = parts.join(' | ');
            }
            onApplyToAI({
                dimensions: dimString,
                budget: `Rp ${(estimate.grandTotal / 1000000).toFixed(1)} Juta`,
                projectType: `${category.replace(/_/g, ' ')} (${material} ${style})`,
                notes: `Estimasi RAB: Rp ${estimate.grandTotal.toLocaleString('id-ID')} (${estimate.regionLabel})`
            });
            showToast?.("Hasil estimasi berhasil dimasukkan ke Sales AI.");
        }
    };


    const [showSummarySheet, setShowSummarySheet] = useState(false);
    const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
    const subItems = category === 'KAMAR_SET' ? KAMAR_SET_ITEMS : (category === 'LIVING_ROOM' ? LIVING_ROOM_ITEMS : SIPIL_BENGKEL_ITEMS);
    const showMaterial = category !== 'SIPIL_BENGKEL' && subItem !== 'RANGKA_DIPAN_TINGKAT' && subItem !== 'SOFA';
    const showStyle = category !== 'SIPIL_BENGKEL' && subItem !== 'RANGKA_DIPAN_TINGKAT' && subItem !== 'WALLPANEL_KACA';
    let step = 0;
    const nextStep = () => ++step;

    const renderSummary = (inSheet = false) => (
        <div className="flex flex-col">
            {!inSheet && (
                <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3.5">
                    <h2 className="text-h3 font-semibold text-fg">Ringkasan estimasi</h2>
                    <Badge variant="neutral">{region === 'dalam_kota' ? 'PL DK' : 'PL LK'}</Badge>
                </div>
            )}
            <div className={cn('space-y-2.5', inSheet ? 'pb-2' : 'px-5 py-4')}>
                {estimate.itemBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 text-body-sm">
                        <div className="min-w-0">
                            <div className="text-fg-2">{item.label}</div>
                            {item.detail && <div className="text-caption text-fg-muted">{item.detail}</div>}
                        </div>
                        <div className="shrink-0 font-medium text-fg tabular">{formatRp(item.amount)}</div>
                    </div>
                ))}
                <div className="my-1 h-px bg-border" />
                <div className="flex items-center justify-between text-body-sm">
                    <span className="text-fg-3">Subtotal produksi</span>
                    <span className="text-fg-2 tabular">{formatRp(estimate.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                    <span className="flex items-center gap-1.5 text-fg-3">
                        <Truck size={14} aria-hidden="true" /> Ongkos kirim
                    </span>
                    {estimate.isFreeOngkir ? (
                        <span className="font-medium text-emerald-400">Gratis</span>
                    ) : (
                        <span className="text-amber-400 tabular">{formatRp(estimate.ongkirCost)}</span>
                    )}
                </div>
                {!estimate.isFreeOngkir && (
                    <p className="text-right text-caption text-fg-muted">
                        Gratis ongkir untuk order di atas Rp {(estimate.minFreeOngkir / 1000000).toFixed(0)} juta
                    </p>
                )}
            </div>
            <div className={cn('border-t border-border', inSheet ? 'pt-4' : 'px-5 py-4')}>
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <div className="text-label font-medium text-fg-3">Estimasi total</div>
                        <div className="mt-0.5 text-h1 font-semibold tracking-tight text-fg tabular" aria-live="polite">{formatRp(estimate.grandTotal)}</div>
                    </div>
                    <span className="pb-1 text-caption text-emerald-400">Survei & 3D gratis</span>
                </div>
                <div className="mt-4 space-y-2">
                    <Button variant="primary" className="w-full" icon={copied ? Check : Copy} onClick={handleCopy}>
                        {copied ? 'Penawaran disalin' : 'Salin penawaran WhatsApp'}
                    </Button>
                    <div className={cn('grid gap-2', onApplyToAI ? 'grid-cols-2' : 'grid-cols-1')}>
                        <Button variant="secondary" icon={FileDown} onClick={handleExportPDF} loading={isExportingPDF}>
                            {isExportingPDF ? 'Membuat…' : 'Ekspor PDF'}
                        </Button>
                        {onApplyToAI && (
                            <Button variant="secondary" icon={Send} onClick={handleSendToAI}>
                                Pakai di Sales AI
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Category + region */}
            <Panel className="space-y-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div role="tablist" aria-label="Kategori estimasi" className="-mx-1 flex gap-1 overflow-x-auto px-1 scrollbar-none">
                        {ESTIMATOR_CATEGORIES.map((cat) => {
                            const Icon = CATEGORY_ICONS[cat.id] || Calculator;
                            const selected = category === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    title={cat.description}
                                    className={cn(
                                        'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-sm px-3.5 text-body-sm font-medium transition-colors duration-150 sm:min-h-0 sm:h-9',
                                        selected ? 'bg-primary-subtle text-primary-text' : 'text-fg-3 hover:bg-surface-hover hover:text-fg'
                                    )}
                                >
                                    <Icon size={16} aria-hidden="true" />
                                    {cat.name.replace(/^Area\s+/i, '')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Region: PL DK vs PL LK */}
                    <div role="radiogroup" aria-label="Wilayah harga" className="flex flex-col sm:flex-row gap-1 rounded-md border border-border bg-surface-2 p-1">
                        {[
                            { id: 'dalam_kota', label: 'PL DK', hint: 'Bandung & Tasik', icon: Home },
                            { id: 'luar_kota', label: 'PL LK', hint: 'Jabodetabek, Jateng, Jatim', icon: Building2 }
                        ].map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                role="radio"
                                aria-checked={region === r.id}
                                onClick={() => setRegion(r.id)}
                                className={cn(
                                    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xs px-3 text-body-sm font-medium transition-colors duration-150 sm:min-h-0 sm:h-8',
                                    region === r.id ? 'bg-surface-3 text-fg shadow-sm ring-1 ring-border-strong' : 'text-fg-3 hover:text-fg'
                                )}
                            >
                                <r.icon size={14} className={region === r.id ? 'text-primary-text' : ''} aria-hidden="true" />
                                <span>{r.label}</span>
                                <span className="text-caption text-fg-muted">{r.hint}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-caption text-fg-3">
                    <span className="flex items-start gap-1.5">
                        <Info size={14} className="mt-px shrink-0 text-fg-muted" aria-hidden="true" />
                        {region === 'dalam_kota'
                            ? 'Wilayah PL DK: Minimal order Rp 10.000.000,- GRATIS Ongkir Bandung & Tasikmalaya (Order < 10jt: Ongkir Rp 500rb).'
                            : 'Wilayah PL LK: Minimal order Rp 15.000.000,- GRATIS Ongkir Jabodetabek & sekitarnya (Order < 15jt: Ongkir Rp 500rb).'}
                    </span>
                    <Badge variant="success">Survei & desain 3D gratis</Badge>
                </div>

                {category !== 'KITCHEN_SET' && (
                    <div className="border-t border-border pt-3">
                        <div className="mb-2 text-label font-medium text-fg-2" id="sub-item-label">Item</div>
                        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none" role="group" aria-labelledby="sub-item-label">
                            {subItems.map((item) => (
                                <Chip
                                    key={item.id}
                                    active={subItem === item.id}
                                    onClick={() => {
                                        setSubItem(item.id);
                                        if (item.id === 'LEMARI_WARDROBE') setT(2.8);
                                        else if (item.id === 'BACKDROP_TV') setT(2.4);
                                    }}
                                >
                                    {item.name}
                                    <span className="text-caption text-fg-muted">{item.unit}</span>
                                </Chip>
                            ))}
                        </div>
                    </div>
                )}
            </Panel>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                {/* Configuration */}
                <Panel padded={false} className="divide-y divide-border">
                    <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5">
                        <span className="text-body-sm font-medium text-fg">
                            {category === 'KITCHEN_SET' ? 'Kitchen set all-in-one' : (subItems.find((i) => i.id === subItem)?.name || subItem?.replace(/_/g, ' '))}
                        </span>
                        <span className="text-caption text-fg-muted">{estimate.regionLabel}</span>
                    </div>

                    {showMaterial && (
                        <Section step={nextStep()} title="Material">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                {[
                                    { id: 'MULTIPLEKS', label: 'Multipleks 18mm', desc: 'Plywood Meranti Padat (Grade B)' },
                                    { id: 'BLOCKBOARD', label: 'Blockboard 18mm', desc: 'Kayu Lapis Standar (Grade C)' },
                                    { id: 'DUCO_LUXURY', label: 'Cat Duco Luxury', desc: 'Finishing Semprot Mewah' },
                                    { id: 'PVC', label: 'PVC Board Waterproof', desc: '100% Anti Air & Anti Rayap' },
                                    { id: 'ALUMUNIUM', label: 'Alumunium ACP', desc: 'Kokoh, Higienis & Tahan Karat' }
                                ].map((mat) => (
                                    <SelectableCard
                                        key={mat.id}
                                        selected={material === mat.id}
                                        title={mat.label}
                                        description={mat.desc}
                                        onClick={() => {
                                            setMaterial(mat.id);
                                            if (mat.id === 'ALUMUNIUM' && style !== 'SINGLE_LAYER' && style !== 'DOUBLE_LAYER') {
                                                setStyle('SINGLE_LAYER');
                                            } else if (mat.id !== 'ALUMUNIUM' && (style === 'SINGLE_LAYER' || style === 'DOUBLE_LAYER')) {
                                                setStyle('MINIMALIS');
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </Section>
                    )}

                    {showStyle && (
                        <Section step={nextStep()} title="Model & finishing">
                            {material === 'ALUMUNIUM' ? (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {[
                                        { id: 'SINGLE_LAYER', label: 'Alumunium Single Layer', price: 'Rp 4.000.000 / m\'', desc: 'Visible frame kokoh & minimalis clean' },
                                        { id: 'DOUBLE_LAYER', label: 'Alumunium Double Layer', price: 'Rp 5.500.000 / m\'', desc: 'Double skin frameless mewah & solid' }
                                    ].map((st) => {
                                        const isSelected = style === st.id || (st.id === 'SINGLE_LAYER' && (style === 'MINIMALIS' || !style)) || (st.id === 'DOUBLE_LAYER' && (style === 'SEMI_KLASIK' || style === 'KLASIK' || style === 'INDUSTRIAL'));
                                        return (
                                            <SelectableCard key={st.id} selected={isSelected} onClick={() => setStyle(st.id)} title={st.label} description={st.desc} meta={st.price} />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {[
                                        { id: 'MINIMALIS', label: 'Minimalis Modern' },
                                        { id: 'SEMI_KLASIK', label: 'Semi Klasik' },
                                        { id: 'KLASIK', label: 'Klasik Profil Mewah' },
                                        { id: 'INDUSTRIAL', label: 'Industrial (Besi)' }
                                    ].map((st) => (
                                        <SelectableCard key={st.id} selected={style === st.id} onClick={() => setStyle(st.id)} title={st.label} />
                                    ))}
                                </div>
                            )}
                        </Section>
                    )}

                    {category === 'KITCHEN_SET' ? (
                        <>
                            <Section step={nextStep()} title="Dimensi kabinet" hint="Rumus: m' × harga">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2.5">
                                        <NumberField
                                            id="cabinet-bawah"
                                            label="Cabinet bawah"
                                            unit="m'"
                                            step="0.1"
                                            min="0"
                                            value={cabinetBawah}
                                            onChange={(e) => setCabinetBawah(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                            placeholder="2.0"
                                        />
                                        <CheckboxRow
                                            checked={isKusenBawahOnly}
                                            onChange={(e) => setIsKusenBawahOnly(e.target.checked)}
                                            label="Hanya pintu kusen (meja cor semen)"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <NumberField
                                            id="cabinet-atas"
                                            label="Cabinet atas"
                                            unit="m'"
                                            step="0.1"
                                            min="0"
                                            value={cabinetAtas}
                                            onChange={(e) => setCabinetAtas(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                            placeholder="2.0"
                                        />
                                        <FormField label="Kabinet plafon tingkat 2" htmlFor="plafon-option">
                                            <Select id="plafon-option" value={plafonOption} onChange={(e) => setPlafonOption(e.target.value)}>
                                                <option value="none">Tanpa plafon tingkat 2</option>
                                                <option value="lt_50">Tinggi &lt; 50cm</option>
                                                <option value="50_to_70">Tinggi 50 - 70cm</option>
                                            </Select>
                                        </FormField>
                                    </div>
                                </div>
                            </Section>

                            <Section step={nextStep()} title="Countertop" hint="Harga resmi per meter">
                                <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                                    {[
                                        { id: 'none', label: 'Tanpa Top Table', price: 'Rp 0' },
                                        { id: 'AICA', label: 'Aica', price: 'Rp 1.400.000/m\'' },
                                        { id: 'QUADRA', label: 'Quadra Sintered', price: 'Rp 2.300.000/m\'' },
                                        { id: 'GRANIT', label: 'Granit Alam / Nero', price: 'Rp 2.800.000/m\'' }
                                    ].map((tt) => (
                                        <SelectableCard key={tt.id} selected={topTableOption === tt.id} onClick={() => setTopTableOption(tt.id)} title={tt.label} description={tt.price} />
                                    ))}
                                </div>
                                {topTableOption !== 'none' && (
                                    <NumberField
                                        id="top-table-length"
                                        className="mt-3 sm:max-w-xs"
                                        label="Panjang top table"
                                        unit="m'"
                                        step="0.1"
                                        min="0"
                                        value={topTableLength}
                                        onChange={(e) => setTopTableLength(e.target.value)}
                                        placeholder={`Auto (${cabinetBawah || p} m')`}
                                        helper="Kosongkan jika sama dengan cabinet bawah"
                                    />
                                )}
                            </Section>

                            <Section step={nextStep()} title="Backsplash" hint="Harga resmi per meter">
                                <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                                    {[
                                        { id: 'none', label: 'Tanpa Backsplash', price: 'Rp 0' },
                                        { id: 'AICA', label: 'Aica Splash Panel', price: 'Rp 1.400.000/m\'' },
                                        { id: 'QUADRA', label: 'Quadra Sintered', price: 'Rp 2.300.000/m\'' },
                                        { id: 'GRANIT', label: 'Granit Backsplash', price: 'Rp 2.800.000/m\'' },
                                        { id: 'KERAMIK_BEVEL', label: 'Keramik Bevel', price: region === 'dalam_kota' ? 'Rp 850.000/m\'' : 'Rp 1.050.000/m\'' },
                                        { id: 'MOZAIC', label: 'Mozaik Tile', price: region === 'dalam_kota' ? 'Rp 1.100.000/m\'' : 'Rp 1.500.000/m\'' },
                                        { id: 'CERMIN_GREY', label: 'Cermin Bronze/Grey', price: 'Rp 1.850.000/m\'' }
                                    ].map((bs) => (
                                        <SelectableCard key={bs.id} selected={backsplashOption === bs.id} onClick={() => setBacksplashOption(bs.id)} title={bs.label} description={bs.price} />
                                    ))}
                                </div>
                                {backsplashOption !== 'none' && (
                                    <NumberField
                                        id="backsplash-length"
                                        className="mt-3 sm:max-w-xs"
                                        label="Panjang backsplash"
                                        unit="m'"
                                        step="0.1"
                                        min="0"
                                        value={backsplashLength}
                                        onChange={(e) => setBacksplashLength(e.target.value)}
                                        placeholder={`Auto (${cabinetBawah || p} m')`}
                                        helper="Kosongkan jika sama dengan cabinet bawah"
                                    />
                                )}
                            </Section>

                            <Section step={nextStep()} title="Aksesoris dapur">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <NumberField
                                        id="mini-bar"
                                        label="Mini bar / meja island"
                                        unit="m'"
                                        step="0.1"
                                        min="0"
                                        value={miniBarLength}
                                        onChange={(e) => setMiniBarLength(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                        placeholder="0"
                                        helper="Rumus PL INT SVY: P : 0.6 × harga. Isi 0 jika tidak ada."
                                    />
                                    <NumberField
                                        id="topi-bar"
                                        label="Topi bar"
                                        unit="m'"
                                        step="0.1"
                                        min="0"
                                        value={topiBarLength}
                                        onChange={(e) => setTopiBarLength(parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        helper="DK Rp 1.45jt/m' (Multipleks)"
                                    />
                                    <div className="space-y-3">
                                        <FormField label="Box elektronik (kulkas/oven)" htmlFor="box-elektronik">
                                            <Select
                                                id="box-elektronik"
                                                value={boxElektronikType}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setBoxElektronikType(value);
                                                    if (value !== 'none') {
                                                        if (!boxP) setBoxP(0.8);
                                                        if (!boxT) setBoxT(2.0);
                                                    }
                                                }}
                                            >
                                                <option value="none">Tanpa box</option>
                                                <option value="box_kulkas">Ada box kulkas / oven</option>
                                            </Select>
                                        </FormField>
                                        {boxElektronikType !== 'none' && (
                                            <div className="space-y-3 rounded-sm border border-border bg-surface-2 p-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <NumberField
                                                        id="box-p"
                                                        label="Panjang box"
                                                        unit="m"
                                                        step="0.1"
                                                        min="0"
                                                        value={boxP}
                                                        onChange={(e) => setBoxP(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                    />
                                                    <NumberField
                                                        id="box-t"
                                                        label="Tinggi box"
                                                        unit="m"
                                                        step="0.1"
                                                        min="0"
                                                        value={boxT}
                                                        onChange={(e) => setBoxT(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                    />
                                                </div>
                                                <NumberField
                                                    id="box-qty"
                                                    label="Jumlah box"
                                                    unit="unit"
                                                    min="1"
                                                    value={boxQty}
                                                    onChange={(e) => setBoxQty(parseInt(e.target.value, 10) || 1)}
                                                    helper={`Tarif Rp ${boxUnitPrice.toLocaleString('id-ID')}: P & T > 1m dihitung P × T; selain itu memakai dimensi terbesar.`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <NumberField
                                            id="hambalan"
                                            label="Hambalan floating"
                                            unit="m'"
                                            step="0.1"
                                            min="0"
                                            value={hambalanLength}
                                            onChange={(e) => setHambalanLength(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                            placeholder="0"
                                            helper="Harga resmi Rp 650.000 per meter lari"
                                        />
                                        {parseFloat(hambalanLength) > 0 && (
                                            <p className="text-caption text-fg-muted tabular">
                                                {hambalanLength}m' × Rp 650.000 = Rp {Math.round(parseFloat(hambalanLength) * 650000).toLocaleString('id-ID')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Section>
                        </>
                    ) : (
                        <>
                            <Section step={nextStep()} title="Dimensi" hint="Standar PL INT SVY">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <NumberField
                                        id="dim-p"
                                        label="Panjang (P)"
                                        unit="m"
                                        step="0.1"
                                        min="0.5"
                                        value={p}
                                        onChange={(e) => setP(parseFloat(e.target.value) || 0)}
                                    />
                                    {(subItem === 'LEMARI_WARDROBE' || subItem === 'BACKDROP_TV' || subItem === 'LEMARI_BAWAH_TANGGA' || subItem === 'PARTISI_BENCH' || subItem === 'WALLPANEL_KACA' || subItem === 'PAGAR') && (
                                        <NumberField
                                            id="dim-t"
                                            label="Tinggi (T)"
                                            unit="m"
                                            step="0.1"
                                            min="0.5"
                                            value={t}
                                            onChange={(e) => setT(parseFloat(e.target.value) || 0)}
                                        />
                                    )}
                                    {(subItem === 'DIPAN_HEADBOARD' || subItem === 'CANOPI') && (
                                        <NumberField
                                            id="dim-l"
                                            label={subItem === 'CANOPI' ? 'Lebar kanopi (L)' : 'Lebar ranjang (L)'}
                                            unit="m"
                                            step="0.1"
                                            min="0.5"
                                            value={l}
                                            onChange={(e) => setL(parseFloat(e.target.value) || 0)}
                                        />
                                    )}
                                </div>
                            </Section>

                            {subItem === 'LEMARI_WARDROBE' && (
                                <Section step={nextStep()} title="Pintu kaca / cermin">
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {[
                                            { id: 'none', label: 'Pintu HPL Kayu' },
                                            { id: 'KACA_POLOS', label: 'Kaca Polos' },
                                            { id: 'KACA_RIBEN', label: 'Kaca Riben' },
                                            { id: 'CERMIN_BRONZE_GREY', label: 'Cermin Bronze/Grey' }
                                        ].map((kaca) => (
                                            <SelectableCard key={kaca.id} selected={pintuKaca === kaca.id} onClick={() => setPintuKaca(kaca.id)} title={kaca.label} />
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {subItem === 'DIPAN_HEADBOARD' && (
                                <Section step={nextStep()} title="Headboard & nakas">
                                    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                                        {[
                                            { id: 'none', label: 'Tanpa Headboard' },
                                            { id: 'MULTIPLEKS', label: 'Headboard Polos' },
                                            { id: 'MULTIPLEKS_BUSA', label: 'Headboard + Busa Jok' },
                                            { id: 'SEMI_KLASIK_MULTIPLEKS', label: 'Headboard Semi Klasik' }
                                        ].map((hb) => (
                                            <SelectableCard key={hb.id} selected={headboardOption === hb.id} onClick={() => setHeadboardOption(hb.id)} title={hb.label} />
                                        ))}
                                    </div>
                                    <NumberField
                                        id="nakas-qty"
                                        className="mt-3 sm:max-w-xs"
                                        label="Nakas (bedside table)"
                                        unit="unit"
                                        min="0"
                                        value={nakasQty}
                                        onChange={(e) => setNakasQty(parseInt(e.target.value, 10) || 0)}
                                        placeholder="0"
                                    />
                                </Section>
                            )}

                            {subItem === 'RANGKA_DIPAN_TINGKAT' && (
                                <Section step={nextStep()} title="Ukuran rangka dipan tingkat" hint="Besi hollow lapis HPL">
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                        {['90x200', '100x200', '120x200', '160x200', '180x200', '200x200'].map((sz) => (
                                            <SelectableCard key={sz} selected={rangkaDipanTingkat === sz} onClick={() => setRangkaDipanTingkat(sz)} title={sz} className="justify-center text-center" />
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {subItem === 'LEMARI_BAWAH_TANGGA' && (
                                <Section step={nextStep()} title="Kedalaman">
                                    <CheckboxRow
                                        checked={bawahTanggaKedalamanGt60}
                                        onChange={(e) => setBawahTanggaKedalamanGt60(e.target.checked)}
                                        label="Kedalaman lemari lebih dari 60cm"
                                        description="Dihitung P × T × harga penuh tanpa faktor 0.8"
                                    />
                                </Section>
                            )}

                            {subItem === 'WALLPANEL_KACA' && (
                                <Section step={nextStep()} title="Jenis wallpanel & cermin">
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        {[
                                            { id: 'MULTIPLEK', label: 'Wallpanel Multipleks HPL' },
                                            { id: 'CERMIN_BEVEL', label: 'Kaca Cermin Bevel Polos' },
                                            { id: 'WPC', label: 'Wallpanel WPC Panel' }
                                        ].map((wp) => (
                                            <SelectableCard key={wp.id} selected={wallpanelType === wp.id} onClick={() => setWallpanelType(wp.id)} title={wp.label} />
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {subItem === 'SOFA' && (
                                <Section step={nextStep()} title="Bahan cover sofa">
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {[
                                            { id: 'standard', label: 'Kain Standard' },
                                            { id: 'KULIT_OSCAR', label: 'Kulit Sintetis Oscar' },
                                            { id: 'KULIT_MBTECH', label: 'Kulit MBTech Mewah' },
                                            { id: 'CORDUROY_PREMIUM', label: 'Corduroy Premium' }
                                        ].map((cv) => (
                                            <SelectableCard key={cv.id} selected={sofaCover === cv.id} onClick={() => setSofaCover(cv.id)} title={cv.label} />
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {subItem === 'CANOPI' && (
                                <Section step={nextStep()} title="Material kanopi">
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {Object.entries(PRICELIST_CATALOG.SIPIL_BENGKEL.CANOPI).map(([key, data]) => (
                                            <SelectableCard key={key} selected={canopiType === key} onClick={() => setCanopiType(key)} title={data.label} description={`Rp ${data.price.toLocaleString('id-ID')} / m2`} />
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {subItem === 'PAGAR' && (
                                <Section step={nextStep()} title="Model pagar & railing">
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {Object.entries(PRICELIST_CATALOG.SIPIL_BENGKEL.PAGAR).map(([key, data]) => (
                                            <SelectableCard key={key} selected={pagarType === key} onClick={() => setPagarType(key)} title={data.label} description={`Rp ${data.price.toLocaleString('id-ID')} / m2`} />
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {subItem === 'JASA_SIPIL' && (
                                <Section step={nextStep()} title="Pekerjaan sipil & bongkaran">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                                        <FormField label="Jenis pekerjaan" htmlFor="jasa-sipil">
                                            <Select id="jasa-sipil" value={jasaSipilType} onChange={(e) => setJasaSipilType(e.target.value)}>
                                                {Object.entries(PRICELIST_CATALOG.SIPIL_BENGKEL.JASA_SIPIL[region] || {}).map(([key, item]) => (
                                                    <option key={key} value={key}>
                                                        {item.label} — Rp {item.price.toLocaleString('id-ID')} / {item.unit}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormField>
                                        <NumberField
                                            id="jasa-sipil-qty"
                                            label="Volume / qty"
                                            step="0.5"
                                            min="1"
                                            value={jasaSipilQty}
                                            onChange={(e) => setJasaSipilQty(parseFloat(e.target.value) || 1)}
                                        />
                                    </div>
                                </Section>
                            )}
                        </>
                    )}

                    <Section step={nextStep()} title="Pekerjaan tambahan">
                        <div className="space-y-3">
                            <CheckboxRow
                                checked={isHplLuarDalam}
                                onChange={(e) => setIsHplLuarDalam(e.target.checked)}
                                label="Upgrade finishing HPL luar & dalam"
                                meta="+Rp 700.000 / meter"
                            />
                            <NumberField
                                id="custom-addons"
                                className="sm:max-w-xs"
                                label="Aksesoris tambahan (manual)"
                                prefix="Rp"
                                step="50000"
                                min="0"
                                value={customAddons}
                                onChange={(e) => setCustomAddons(parseFloat(e.target.value) || 0)}
                                placeholder="0"
                            />
                        </div>
                    </Section>
                </Panel>

                {/* Summary (desktop sticky) */}
                <Panel padded={false} as="aside" aria-label="Ringkasan estimasi" className="hidden lg:block lg:sticky lg:top-20">
                    {renderSummary()}
                </Panel>
            </div>

            {/* Mobile / tablet sticky total (portaled so no animated ancestor can capture position:fixed) */}
            {createPortal(
            <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-sidebar/95 px-4 py-2.5 backdrop-blur-md md:bottom-0 lg:hidden" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-caption text-fg-muted">Estimasi total</div>
                        <div className="truncate text-h3 font-semibold text-fg tabular">{formatRp(estimate.grandTotal)}</div>
                    </div>
                    <Button variant="primary" onClick={() => setShowSummarySheet(true)} iconRight={ChevronUp}>
                        Lihat rincian
                    </Button>
                </div>
            </div>,
                document.body
            )}
            <div className="h-20 lg:hidden" aria-hidden="true" />

            <Modal
                isOpen={showSummarySheet}
                onClose={() => setShowSummarySheet(false)}
                variant="bottom"
                size="md"
                title="Ringkasan estimasi"
                description={estimate.regionLabel}
            >
                {renderSummary(true)}
            </Modal>
        </div>
    );
};

const CATEGORY_ICONS = {
    KITCHEN_SET: CookingPot,
    KAMAR_SET: BedDouble,
    LIVING_ROOM: Sofa,
    SIPIL_BENGKEL: Hammer
};

const Section = ({ step, title, hint, children }) => (
    <section className="px-4 py-5 sm:px-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="flex items-center gap-2 text-body font-semibold text-fg">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-surface-3 text-caption font-semibold text-fg-3 tabular" aria-hidden="true">
                    {step}
                </span>
                {title}
            </h3>
            {hint && <span className="text-caption text-fg-muted">{hint}</span>}
        </div>
        {children}
    </section>
);

const NumberField = ({ id, label, unit, prefix, helper, className, ...inputProps }) => (
    <FormField label={label} htmlFor={id} helperText={helper} className={className}>
        <Input id={id} type="number" inputMode="decimal" suffix={unit} prefix={prefix} className="tabular" {...inputProps} />
    </FormField>
);

const CheckboxRow = ({ checked, onChange, label, description, meta }) => (
    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-sm border border-border bg-surface-2 px-3 py-2.5 transition-colors hover:border-border-strong">
        <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 h-4 w-4 shrink-0 accent-sky-500" />
        <span className="min-w-0 flex-1">
            <span className="block text-body-sm text-fg">{label}</span>
            {description && <span className="block text-caption text-fg-muted">{description}</span>}
        </span>
        {meta && <span className="shrink-0 text-caption text-fg-3 tabular">{meta}</span>}
    </label>
);
