// File: src/components/modules/EstimatorCalculator.jsx
import React, { useState, useMemo } from 'react';
import { Icons } from '../Icons.jsx';
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
            boxP: category === 'KITCHEN_SET' ? boxP : 0,
            boxT: category === 'KITCHEN_SET' ? boxT : 0,
            boxQty: category === 'KITCHEN_SET' ? boxQty : 1,
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
            showToast?.("Hasil estimasi berhasil dimasukkan ke Sales Ary Workspace!");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Region Switcher */}
            <div className="bg-[#15151a] p-5 md:p-6 rounded-3xl border border-[#26262d] shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl md:text-2xl">🧮</span>
                            <h2 className="serif-font text-lg md:text-xl font-bold text-white">
                                Kalkulator Estimasi Biaya Interior (Master RAB 2026)
                            </h2>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                            Standar Perhitungan Resmi: <span className="text-[#c5a059] font-semibold">PL DK</span> (Dalam Kota) • <span className="text-[#c5a059] font-semibold">PL LK</span> (Luar Kota) • <span className="text-[#c5a059] font-semibold">PL INT SVY</span> (Rumus Hitungan Putra Corporation).
                        </p>
                    </div>

                    {/* Region Selector Pill: PL DK vs PL LK */}
                    <div className="flex flex-col sm:flex-row w-full sm:w-auto p-1 bg-[#101014] rounded-2xl border border-[#2e2e38] gap-1">
                        <button
                            type="button"
                            onClick={() => setRegion('dalam_kota')}
                            className={`px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 touch-manipulation active:scale-95 ${
                                region === 'dalam_kota'
                                    ? 'bg-[#c5a059] text-black shadow-md font-black'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <span>🏠</span>
                            <span>PL DK (Dalam Kota: Bandung & Tasik)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRegion('luar_kota')}
                            className={`px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 touch-manipulation active:scale-95 ${
                                region === 'luar_kota'
                                    ? 'bg-[#c5a059] text-black shadow-md font-black'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <span>🏙️</span>
                            <span>PL LK (Luar Kota: Jabodetabek, Jateng, Jatim)</span>
                        </button>
                    </div>
                </div>

                {/* Sub-banner: Rule Info */}
                <div className="p-3 bg-[#111116] rounded-xl border border-[#26262d] flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[#c5a059]">📌</span>
                        <span>
                            {region === 'dalam_kota' 
                                ? 'Wilayah PL DK: Minimal order Rp 10.000.000,- GRATIS Ongkir Bandung & Tasikmalaya (Order < 10jt: Ongkir Rp 500rb).'
                                : 'Wilayah PL LK: Minimal order Rp 15.000.000,- GRATIS Ongkir Jabodetabek & sekitarnya (Order < 15jt: Ongkir Rp 500rb).'
                            }
                        </span>
                    </div>
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        100% Bebas Biaya Survei & Desain 3D
                    </span>
                </div>
            </div>

            {/* 4 Master Category Selector Tabs (Area Kitchen Set, Area Kamar Set, Area Living Room, Sipil & Bengkel Las) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {ESTIMATOR_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all min-h-[58px] touch-manipulation active:scale-95 ${
                            category === cat.id
                                ? 'bg-[#c5a059]/20 border-[#c5a059] text-white shadow-lg shadow-[#c5a059]/10 ring-1 ring-[#c5a059]'
                                : 'bg-[#15151a] text-zinc-400 border-[#26262d] hover:border-zinc-600 hover:text-zinc-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{cat.icon}</span>
                            <span className="text-xs sm:text-sm font-bold text-zinc-100">{cat.name}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{cat.description}</div>
                    </button>
                ))}
            </div>

            {/* Sub-item Switcher for KAMAR_SET, LIVING_ROOM, and SIPIL_BENGKEL */}
            {category !== 'KITCHEN_SET' && (
                <div className="bg-[#15151a] p-3 rounded-2xl border border-[#26262d] flex items-center gap-2 overflow-x-auto scrollbar-thin">
                    <span className="text-[11px] font-bold text-[#c5a059] uppercase tracking-wider px-2 whitespace-nowrap">
                        Pilih Item:
                    </span>
                    {(category === 'KAMAR_SET' ? KAMAR_SET_ITEMS : (category === 'LIVING_ROOM' ? LIVING_ROOM_ITEMS : SIPIL_BENGKEL_ITEMS)).map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                setSubItem(item.id);
                                if (item.id === 'LEMARI_WARDROBE') setT(2.8);
                                else if (item.id === 'BACKDROP_TV') setT(2.4);
                            }}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 min-h-[40px] touch-manipulation active:scale-95 ${
                                subItem === item.id
                                    ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-md font-bold'
                                    : 'bg-[#1c1c24] text-zinc-400 border-[#2e2e38] hover:text-zinc-200 hover:border-zinc-500'
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                            <span className="text-[10px] opacity-75 font-mono">({item.unit})</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Main Form & Calculation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* SISI KIRI: INPUT PARAMETER */}
                <div className="lg:col-span-7 space-y-5 bg-[#15151a] p-6 md:p-8 rounded-3xl border border-[#26262d] shadow-xl">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#c5a059] pb-3 border-b border-[#26262d] flex items-center justify-between">
                        <span>
                            {category === 'KITCHEN_SET' ? '1. Spesifikasi All-in-One Kitchen Set' : `1. Spesifikasi Material & Dimensi (${subItem?.replace(/_/g, ' ')})`}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-normal lowercase">{estimate.regionLabel}</span>
                    </h3>

                    {/* Material Selector (Tidak ditampilkan untuk Rangka Dipan & Sofa & Sipil/Bengkel) */}
                    {category !== 'SIPIL_BENGKEL' && subItem !== 'RANGKA_DIPAN_TINGKAT' && subItem !== 'SOFA' && (
                        <div>
                            <label className="text-xs font-bold text-zinc-300 block mb-2">Bahan Dasar Utama</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { id: 'MULTIPLEKS', label: 'Multipleks 18mm', desc: 'Plywood Meranti Padat (Grade B)' },
                                    { id: 'BLOCKBOARD', label: 'Blockboard 18mm', desc: 'Kayu Lapis Standar (Grade C)' },
                                    { id: 'DUCO_LUXURY', label: 'Cat Duco Luxury', desc: 'Finishing Semprot Mewah' },
                                    { id: 'PVC', label: 'PVC Board Waterproof', desc: '100% Anti Air & Anti Rayap' },
                                    { id: 'ALUMUNIUM', label: 'Alumunium ACP', desc: 'Kokoh, Higienis & Tahan Karat' }
                                ].map((mat) => (
                                    <button
                                        key={mat.id}
                                        type="button"
                                        onClick={() => {
                                            setMaterial(mat.id);
                                            if (mat.id === 'ALUMUNIUM' && style !== 'SINGLE_LAYER' && style !== 'DOUBLE_LAYER') {
                                                setStyle('SINGLE_LAYER');
                                            } else if (mat.id !== 'ALUMUNIUM' && (style === 'SINGLE_LAYER' || style === 'DOUBLE_LAYER')) {
                                                setStyle('MINIMALIS');
                                            }
                                        }}
                                        className={`p-3 rounded-2xl border text-left transition-all ${
                                            material === mat.id
                                                ? 'bg-[#c5a059]/15 border-[#c5a059] text-white shadow-sm ring-1 ring-[#c5a059]/50'
                                                : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        <div className="text-xs font-bold text-zinc-100">{mat.label}</div>
                                        <div className="text-[10px] text-zinc-400 mt-0.5">{mat.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Model / Gaya Selector */}
                    {category !== 'SIPIL_BENGKEL' && subItem !== 'RANGKA_DIPAN_TINGKAT' && subItem !== 'WALLPANEL_KACA' && (
                        <div>
                            <label className="text-xs font-bold text-zinc-300 block mb-2">Model Desain & Finishing</label>
                            {material === 'ALUMUNIUM' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {[
                                        { id: 'SINGLE_LAYER', label: 'Alumunium Single Layer', price: 'Rp 4.000.000 / m\'', desc: 'Visible frame kokoh & minimalis clean' },
                                        { id: 'DOUBLE_LAYER', label: 'Alumunium Double Layer', price: 'Rp 5.500.000 / m\'', desc: 'Double skin frameless mewah & solid' }
                                    ].map((st) => {
                                        const isSelected = style === st.id || (st.id === 'SINGLE_LAYER' && (style === 'MINIMALIS' || !style)) || (st.id === 'DOUBLE_LAYER' && (style === 'SEMI_KLASIK' || style === 'KLASIK' || style === 'INDUSTRIAL'));
                                        return (
                                            <button
                                                key={st.id}
                                                type="button"
                                                onClick={() => setStyle(st.id)}
                                                className={`p-3 rounded-2xl border text-left transition-all ${
                                                    isSelected
                                                        ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-sm font-black ring-1 ring-[#c5a059]'
                                                        : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-300 hover:text-white'
                                                }`}
                                            >
                                                <div className="text-xs font-bold">{st.label}</div>
                                                <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-black/80 font-bold' : 'text-[#c5a059]'}`}>{st.price}</div>
                                                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-black/70' : 'text-zinc-500'}`}>{st.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'MINIMALIS', label: 'Minimalis Modern' },
                                        { id: 'SEMI_KLASIK', label: 'Semi Klasik' },
                                        { id: 'KLASIK', label: 'Klasik Profil Mewah' },
                                        { id: 'INDUSTRIAL', label: 'Industrial (Besi)' }
                                    ].map((st) => (
                                        <button
                                            key={st.id}
                                            type="button"
                                            onClick={() => setStyle(st.id)}
                                            className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                                                style === st.id
                                                    ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-sm font-black'
                                                    : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-300 hover:text-white'
                                            }`}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* BAGIAN 1: KITCHEN SET UNIFIED (SEMUA ITEM DISATUKAN) */}
                    {/* ========================================================= */}
                    {category === 'KITCHEN_SET' ? (
                        <div className="space-y-4 pt-2">
                            {/* 1A. Kabinet Dapur (Cabinet Bawah & Cabinet Atas) */}
                            <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-3">
                                <div className="text-xs font-bold text-[#c5a059] flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <span>🍳</span>
                                        <span>Kabinet Kitchen Set (Cabinet Bawah & Cabinet Atas)</span>
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-mono">Rumus: m' x Harga</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Cabinet Bawah */}
                                    <div className="p-3 bg-[#121216] rounded-xl border border-[#26262d] space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-bold text-zinc-200">Cabinet Bawah</label>
                                            <span className="text-[10px] text-zinc-500 font-mono">Meter Lari (m')</span>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={cabinetBawah}
                                                onChange={(e) => setCabinetBawah(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-base sm:text-sm text-white font-mono focus:border-[#c5a059] focus:outline-none min-h-[44px]"
                                                placeholder="Contoh: 2.0"
                                            />
                                            <span className="text-xs text-zinc-500 ml-2 font-mono">m'</span>
                                        </div>
                                        <label className="flex items-center gap-2 pt-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isKusenBawahOnly}
                                                onChange={(e) => setIsKusenBawahOnly(e.target.checked)}
                                                className="w-4 h-4 accent-[#c5a059] rounded"
                                            />
                                            <span className="text-[11px] text-zinc-300">
                                                Hanya Pintu Kusen (Meja Cor Semen)
                                            </span>
                                        </label>
                                    </div>

                                    {/* Cabinet Atas */}
                                    <div className="p-3 bg-[#121216] rounded-xl border border-[#26262d] space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-bold text-zinc-200">Cabinet Atas</label>
                                            <span className="text-[10px] text-zinc-500 font-mono">Meter Lari (m')</span>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={cabinetAtas}
                                                onChange={(e) => setCabinetAtas(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-base sm:text-sm text-white font-mono focus:border-[#c5a059] focus:outline-none min-h-[44px]"
                                                placeholder="Contoh: 2.0"
                                            />
                                            <span className="text-xs text-zinc-500 ml-2 font-mono">m'</span>
                                        </div>
                                        <div className="pt-1">
                                            <label className="text-[10px] text-zinc-400 block mb-1">Kabinet Plafon Tingkat 2:</label>
                                            <select
                                                value={plafonOption}
                                                onChange={(e) => setPlafonOption(e.target.value)}
                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-lg px-2 py-1 text-xs text-white focus:border-[#c5a059] focus:outline-none"
                                            >
                                                <option value="none">Tanpa Plafon Tingkat 2</option>
                                                <option value="lt_50">Tinggi &lt; 50cm</option>
                                                <option value="50_to_70">Tinggi 50 - 70cm</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 1B. Top Table (Countertop) */}
                            <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-[#c5a059] flex items-center gap-1.5">
                                        <span>🍳</span>
                                        <span>Top Table (Countertop Meja Dapur)</span>
                                    </label>
                                    <span className="text-[10px] text-zinc-400">Harga Resmi Permeter</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'none', label: 'Tanpa Top Table', price: 'Rp 0' },
                                        { id: 'AICA', label: 'Aica HPL / Solid', price: 'Rp 1.400.000/m\'' },
                                        { id: 'QUADRA', label: 'Quadra Sintered', price: 'Rp 2.300.000/m\'' },
                                        { id: 'GRANIT', label: 'Granit Alam / Nero', price: 'Rp 2.800.000/m\'' }
                                    ].map((tt) => (
                                        <button
                                            key={tt.id}
                                            type="button"
                                            onClick={() => setTopTableOption(tt.id)}
                                            className={`p-2 rounded-xl border text-left transition-all ${
                                                topTableOption === tt.id
                                                    ? 'bg-[#c5a059]/20 border-[#c5a059] text-white shadow-sm ring-1 ring-[#c5a059]'
                                                    : 'bg-[#121216] border-[#2e2e38] text-zinc-400 hover:text-zinc-200'
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-zinc-200">{tt.label}</div>
                                            <div className="text-[10px] text-[#c5a059] font-mono mt-0.5">{tt.price}</div>
                                        </button>
                                    ))}
                                </div>
                                {topTableOption !== 'none' && (
                                    <div className="pt-1 flex items-center gap-2">
                                        <span className="text-[11px] text-zinc-400 whitespace-nowrap">Panjang Top Table:</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={topTableLength}
                                            onChange={(e) => setTopTableLength(e.target.value)}
                                            placeholder={`Auto (${cabinetBawah || p} m')`}
                                            className="w-32 bg-[#111115] border border-[#2e2e38] rounded-xl px-2.5 py-1 text-xs text-white font-mono focus:border-[#c5a059] focus:outline-none"
                                        />
                                        <span className="text-xs text-zinc-500 font-mono">m'</span>
                                        <span className="text-[10px] text-zinc-500 ml-1">Kosongkan jika sama dengan cabinet bawah</span>
                                    </div>
                                )}
                            </div>

                            {/* 1C. Backsplash (Dinding Dapur) */}
                            <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-[#c5a059] flex items-center gap-1.5">
                                        <span>🧱</span>
                                        <span>Backsplash (Dinding Dapur)</span>
                                    </label>
                                    <span className="text-[10px] text-zinc-400">Harga Resmi Permeter</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'none', label: 'Tanpa Backsplash', price: 'Rp 0' },
                                        { id: 'AICA', label: 'Aica Splash Panel', price: 'Rp 1.400.000/m\'' },
                                        { id: 'QUADRA', label: 'Quadra Sintered', price: 'Rp 2.300.000/m\'' },
                                        { id: 'GRANIT', label: 'Granit Backsplash', price: 'Rp 2.800.000/m\'' },
                                        { id: 'KERAMIK_BEVEL', label: 'Keramik Bevel', price: region === 'dalam_kota' ? 'Rp 850.000/m\'' : 'Rp 1.050.000/m\'' },
                                        { id: 'MOZAIC', label: 'Mozaik Tile', price: region === 'dalam_kota' ? 'Rp 1.100.000/m\'' : 'Rp 1.500.000/m\'' },
                                        { id: 'CERMIN_GREY', label: 'Cermin Bronze/Grey', price: 'Rp 1.850.000/m\'' }
                                    ].map((bs) => (
                                        <button
                                            key={bs.id}
                                            type="button"
                                            onClick={() => setBacksplashOption(bs.id)}
                                            className={`p-2 rounded-xl border text-left transition-all ${
                                                backsplashOption === bs.id
                                                    ? 'bg-[#c5a059]/20 border-[#c5a059] text-white shadow-sm ring-1 ring-[#c5a059]'
                                                    : 'bg-[#121216] border-[#2e2e38] text-zinc-400 hover:text-zinc-200'
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-zinc-200">{bs.label}</div>
                                            <div className="text-[10px] text-[#c5a059] font-mono mt-0.5">{bs.price}</div>
                                        </button>
                                    ))}
                                </div>
                                {backsplashOption !== 'none' && (
                                    <div className="pt-1 flex items-center gap-2">
                                        <span className="text-[11px] text-zinc-400 whitespace-nowrap">Panjang Backsplash:</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={backsplashLength}
                                            onChange={(e) => setBacksplashLength(e.target.value)}
                                            placeholder={`Auto (${cabinetBawah || p} m')`}
                                            className="w-32 bg-[#111115] border border-[#2e2e38] rounded-xl px-2.5 py-1 text-xs text-white font-mono focus:border-[#c5a059] focus:outline-none"
                                        />
                                        <span className="text-xs text-zinc-500 font-mono">m'</span>
                                        <span className="text-[10px] text-zinc-500 ml-1">Kosongkan jika sama dengan cabinet bawah</span>
                                    </div>
                                )}
                            </div>

                            {/* 1D. Mini Bar / Meja Island (Disatukan ke Kitchen Set - Rumus PL INT SVY: P : 0.6 x Harga) */}
                            <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-[#c5a059] flex items-center gap-1.5">
                                        <span>🍸</span>
                                        <span>Mini Bar / Meja Island (Kitchen Set)</span>
                                    </label>
                                    <span className="text-[10px] text-zinc-400 font-mono">Rumus PL INT SVY: P : 0.6 x Harga</span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={miniBarLength}
                                        onChange={(e) => setMiniBarLength(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                        className="w-full bg-[#111115] border border-[#2e2e38] rounded-xl px-3 py-2 text-base sm:text-sm text-white font-mono focus:border-[#c5a059] focus:outline-none min-h-[44px]"
                                        placeholder="0 (Isi jika memesan mini bar / meja island)"
                                    />
                                    <span className="text-xs text-zinc-500 ml-2 font-mono">m'</span>
                                </div>
                                <p className="text-[10px] text-zinc-500">
                                    Isi 0 jika tidak ada penambahan mini bar / meja island di dapur.
                                </p>
                            </div>

                            {/* 1E. Topi Bar, Box Elektronik & Hambalan (Disatukan ke Kitchen Set) */}
                            <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-3">
                                <div className="text-xs font-bold text-[#c5a059] flex items-center gap-1.5">
                                    <span>📦</span>
                                    <span>Topi Bar, Box Elektronik & Hambalan Kitchen Set</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                    {/* Topi Bar (P x Harga) */}
                                    <div className="p-2.5 bg-[#121216] rounded-xl border border-[#26262d] space-y-1.5">
                                        <label className="text-[11px] font-bold text-zinc-300 block">Topi Bar (m')</label>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={topiBarLength}
                                                onChange={(e) => setTopiBarLength(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-[#c5a059] focus:outline-none"
                                                placeholder="0"
                                            />
                                            <span className="text-xs text-zinc-500 ml-1.5 font-mono">m'</span>
                                        </div>
                                        <div className="text-[9px] text-zinc-500">DK Rp 1.45jt/m' (Multipleks)</div>
                                    </div>

                                    {/* Box Elektronik */}
                                    <div className="p-2.5 bg-[#121216] rounded-xl border border-[#26262d] space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-bold text-zinc-300 block">Box Elektronik (Kulkas/Oven)</label>
                                            <span className="text-[10px] text-[#c5a059] font-mono">Rp {(boxUnitPrice / 1000000).toFixed(1)}jt/m</span>
                                        </div>
                                        <select
                                            value={boxElektronikType}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setBoxElektronikType(val);
                                                if (val !== 'none') {
                                                    if (!boxP) setBoxP(0.8);
                                                    if (!boxT) setBoxT(2.0);
                                                }
                                            }}
                                            className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-lg px-2 py-1 text-xs text-white focus:border-[#c5a059] focus:outline-none"
                                        >
                                            <option value="none">Tanpa Box</option>
                                            <option value="box_kulkas">Ada Box Kulkas / Oven</option>
                                        </select>
                                        {boxElektronikType !== 'none' && (
                                            <div className="space-y-1.5 pt-1 border-t border-[#26262d]">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-zinc-400 block">Panjang (m)</label>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                value={boxP}
                                                                onChange={(e) => setBoxP(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                                placeholder="0.8"
                                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded px-2 py-1 text-xs text-white font-mono focus:border-[#c5a059] focus:outline-none"
                                                            />
                                                            <span className="text-[10px] text-zinc-500 ml-1 font-mono">m</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-zinc-400 block">Tinggi (m)</label>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                value={boxT}
                                                                onChange={(e) => setBoxT(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                                placeholder="2.0"
                                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded px-2 py-1 text-xs text-white font-mono focus:border-[#c5a059] focus:outline-none"
                                                            />
                                                            <span className="text-[10px] text-zinc-500 ml-1 font-mono">m</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                                                    <span>Qty Box:</span>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={boxQty}
                                                            onChange={(e) => setBoxQty(parseInt(e.target.value, 10) || 1)}
                                                            className="w-12 bg-[#1b1b22] border border-[#2e2e38] rounded px-1.5 py-0.5 text-xs text-white font-mono text-center"
                                                        />
                                                        <span className="text-zinc-500 text-[10px]">unit</span>
                                                    </div>
                                                </div>

                                                <div className="text-[9px] leading-tight text-zinc-400 bg-[#17171e] p-1.5 rounded border border-[#26262d]">
                                                    {(() => {
                                                        const pVal = parseFloat(boxP) || 0;
                                                        const tVal = parseFloat(boxT) || 0;
                                                        if (pVal > 1 && tVal > 1) {
                                                            return (
                                                                <span className="text-emerald-400">
                                                                    P &amp; T &gt; 1m → Dihitung P x T: <strong className="text-white font-mono">{(pVal * tVal).toFixed(2)}m²</strong>
                                                                </span>
                                                            );
                                                        } else if (pVal < 1 && tVal < 1) {
                                                            const maxVal = Math.max(pVal, tVal);
                                                            return (
                                                                <span className="text-amber-400">
                                                                    P &amp; T &lt; 1m → Ambil tertinggi: <strong className="text-white font-mono">{maxVal.toFixed(2)}m'</strong>
                                                                </span>
                                                            );
                                                        } else {
                                                            const maxVal = Math.max(pVal, tVal);
                                                            return (
                                                                <span className="text-amber-400">
                                                                    Salah satu &lt; 1m → Ambil terbesar: <strong className="text-white font-mono">{maxVal.toFixed(2)}m'</strong>
                                                                </span>
                                                            );
                                                        }
                                                    })()}
                                                    <div className="text-zinc-500 mt-0.5">
                                                        Tarif: Rp {boxUnitPrice.toLocaleString('id-ID')} (+100rb dr material)
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hambalan Floating */}
                                    <div className="p-2.5 bg-[#121216] rounded-xl border border-[#26262d] space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-bold text-zinc-300 block">Hambalan Floating (m')</label>
                                            <span className="text-[10px] text-[#c5a059] font-mono">Rp 650rb/m'</span>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={hambalanLength}
                                                onChange={(e) => setHambalanLength(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-[#c5a059] focus:outline-none"
                                                placeholder="0"
                                            />
                                            <span className="text-xs text-zinc-500 ml-1.5 font-mono">m'</span>
                                        </div>
                                        <div className="text-[9px] text-zinc-500">Hitungan resmi permeter: Rp 650.000/m'</div>
                                        {parseFloat(hambalanLength) > 0 && (
                                            <div className="text-[9.5px] text-[#c5a059] font-mono bg-[#17171e] px-1.5 py-0.5 rounded border border-[#26262d]">
                                                {hambalanLength}m' x Rp 650.000 = Rp {Math.round(parseFloat(hambalanLength) * 650000).toLocaleString('id-ID')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ========================================================= */
                        /* BAGIAN 2, 3, 4: KAMAR SET, LIVING ROOM, SIPIL/BENGKEL */
                        /* ========================================================= */
                        <div className="space-y-4 pt-2">
                            {/* Ukuran Dimensi */}
                            <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-3">
                                <div className="text-xs font-bold text-[#c5a059] flex items-center justify-between">
                                    <span>2. Ukuran Dimensi & Parameter Hitungan</span>
                                    <span className="text-[10px] text-zinc-400 font-mono">Standar PL INT SVY</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Panjang (P) / Meter</label>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.5"
                                                value={p}
                                                onChange={(e) => setP(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-base sm:text-sm text-white focus:border-[#c5a059] focus:outline-none min-h-[44px]"
                                            />
                                            <span className="text-xs text-zinc-500 ml-2">m</span>
                                        </div>
                                    </div>

                                    {(subItem === 'LEMARI_WARDROBE' || subItem === 'BACKDROP_TV' || subItem === 'LEMARI_BAWAH_TANGGA' || subItem === 'PARTISI_BENCH' || subItem === 'WALLPANEL_KACA' || subItem === 'PAGAR') && (
                                        <div>
                                            <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Tinggi (T) / Meter</label>
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.5"
                                                    value={t}
                                                    onChange={(e) => setT(parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-base sm:text-sm text-white focus:border-[#c5a059] focus:outline-none min-h-[44px]"
                                                />
                                                <span className="text-xs text-zinc-500 ml-2">m</span>
                                            </div>
                                        </div>
                                    )}

                                    {(subItem === 'DIPAN_HEADBOARD' || subItem === 'CANOPI') && (
                                        <div>
                                            <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">
                                                {subItem === 'CANOPI' ? 'Lebar Kanopi (L) / Meter' : 'Lebar Ranjang (L) / Meter'}
                                            </label>
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.5"
                                                    value={l}
                                                    onChange={(e) => setL(parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-base sm:text-sm text-white focus:border-[#c5a059] focus:outline-none min-h-[44px]"
                                                />
                                                <span className="text-xs text-zinc-500 ml-2">m</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Opsi Khusus Sub-Item */}
                            {subItem === 'LEMARI_WARDROBE' && (
                                <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2">
                                    <label className="text-xs font-bold text-[#c5a059] block">Add-on Pintu Kaca / Cermin Wardrobe</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { id: 'none', label: 'Pintu HPL Kayu' },
                                            { id: 'KACA_POLOS', label: 'Kaca Polos' },
                                            { id: 'KACA_RIBEN', label: 'Kaca Riben' },
                                            { id: 'CERMIN_BRONZE_GREY', label: 'Cermin Bronze/Grey' }
                                        ].map((kaca) => (
                                            <button
                                                key={kaca.id}
                                                type="button"
                                                onClick={() => setPintuKaca(kaca.id)}
                                                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                                                    pintuKaca === kaca.id
                                                        ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                                                        : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-400'
                                                }`}
                                            >
                                                {kaca.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {subItem === 'DIPAN_HEADBOARD' && (
                                <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-3">
                                    <label className="text-xs font-bold text-[#c5a059] block">Headboard & Nakas Kamar Tidur</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {[
                                            { id: 'none', label: 'Tanpa Headboard' },
                                            { id: 'MULTIPLEKS', label: 'Headboard Polos' },
                                            { id: 'MULTIPLEKS_BUSA', label: 'Headboard + Busa Jok' },
                                            { id: 'SEMI_KLASIK_MULTIPLEKS', label: 'Headboard Semi Klasik' }
                                        ].map((hb) => (
                                            <button
                                                key={hb.id}
                                                type="button"
                                                onClick={() => setHeadboardOption(hb.id)}
                                                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                                                    headboardOption === hb.id
                                                        ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                                                        : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-400'
                                                }`}
                                            >
                                                {hb.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Nakas Input */}
                                    <div className="pt-2 flex items-center gap-3">
                                        <span className="text-xs text-zinc-300 font-semibold">Nakas Bedside Table:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={nakasQty}
                                            onChange={(e) => setNakasQty(parseInt(e.target.value, 10) || 0)}
                                            className="w-20 bg-[#111115] border border-[#2e2e38] rounded-xl px-2.5 py-1 text-xs text-white font-mono"
                                            placeholder="0 unit"
                                        />
                                        <span className="text-xs text-zinc-500">unit</span>
                                    </div>
                                </div>
                            )}

                            {subItem === 'RANGKA_DIPAN_TINGKAT' && (
                                <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2">
                                    <label className="text-xs font-bold text-[#c5a059] block">Ukuran Rangka Dipan Tingkat (Besi Hollow Lapis HPL)</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {['90x200', '100x200', '120x200', '160x200', '180x200', '200x200'].map((sz) => (
                                            <button
                                                key={sz}
                                                type="button"
                                                onClick={() => setRangkaDipanTingkat(sz)}
                                                className={`p-2 rounded-xl border text-xs font-bold text-center transition-all ${
                                                    rangkaDipanTingkat === sz
                                                        ? 'bg-[#c5a059] text-black border-[#c5a059] font-black'
                                                        : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-300'
                                                }`}
                                            >
                                                {sz}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {subItem === 'LEMARI_BAWAH_TANGGA' && (
                                <label className="flex items-center gap-2 p-3 rounded-2xl bg-[#1b1b22] border border-[#2e2e38] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={bawahTanggaKedalamanGt60}
                                        onChange={(e) => setBawahTanggaKedalamanGt60(e.target.checked)}
                                        className="w-4 h-4 accent-[#c5a059] rounded"
                                    />
                                    <span className="text-xs text-zinc-300">
                                        Kedalaman lemari lebih dari 60cm (Dihitung P x T x Harga penuh tanpa faktor 0.8)
                                    </span>
                                </label>
                            )}

                            {subItem === 'WALLPANEL_KACA' && (
                                <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2">
                                    <label className="text-xs font-bold text-[#c5a059] block">Jenis Wallpanel & Cermin</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'MULTIPLEK', label: 'Wallpanel Multipleks HPL' },
                                            { id: 'CERMIN_BEVEL', label: 'Kaca Cermin Bevel Polos' },
                                            { id: 'WPC', label: 'Wallpanel WPC Panel' }
                                        ].map((wp) => (
                                            <button
                                                key={wp.id}
                                                type="button"
                                                onClick={() => setWallpanelType(wp.id)}
                                                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                                                    wallpanelType === wp.id
                                                        ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                                                        : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-400'
                                                }`}
                                            >
                                                {wp.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {subItem === 'SOFA' && (
                                <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2">
                                    <label className="text-xs font-bold text-[#c5a059] block">Pilihan Bahan Kain & Cover Sofa Custom</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { id: 'standard', label: 'Kain Standard' },
                                            { id: 'KULIT_OSCAR', label: 'Kulit Sintetis Oscar' },
                                            { id: 'KULIT_MBTECH', label: 'Kulit MBTech Mewah' },
                                            { id: 'CORDUROY_PREMIUM', label: 'Corduroy Premium' }
                                        ].map((cv) => (
                                            <button
                                                key={cv.id}
                                                type="button"
                                                onClick={() => setSofaCover(cv.id)}
                                                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                                                    sofaCover === cv.id
                                                        ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                                                        : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-400'
                                                }`}
                                            >
                                                {cv.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Opsi Sipil & Bengkel Las */}
                            {subItem === 'CANOPI' && (
                                <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2">
                                    <label className="text-xs font-bold text-[#c5a059] block">Tipe Material Canopi</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {Object.entries(PRICELIST_CATALOG.SIPIL_BENGKEL.CANOPI).map(([key, data]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setCanopiType(key)}
                                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                                    canopiType === key
                                                        ? 'bg-[#c5a059]/20 border-[#c5a059] text-white ring-1 ring-[#c5a059]'
                                                        : 'bg-[#121216] border-[#2e2e38] text-zinc-400'
                                                }`}
                                            >
                                                <div className="text-xs font-bold text-zinc-200">{data.label}</div>
                                                <div className="text-[10px] text-[#c5a059] font-mono mt-0.5">
                                                    Rp {data.price.toLocaleString('id-ID')} / m2
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {subItem === 'PAGAR' && (
                                <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2">
                                    <label className="text-xs font-bold text-[#c5a059] block">Model Pagar & Railing</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(PRICELIST_CATALOG.SIPIL_BENGKEL.PAGAR).map(([key, data]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setPagarType(key)}
                                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                                    pagarType === key
                                                        ? 'bg-[#c5a059]/20 border-[#c5a059] text-white ring-1 ring-[#c5a059]'
                                                        : 'bg-[#121216] border-[#2e2e38] text-zinc-400'
                                                }`}
                                            >
                                                <div className="text-xs font-bold text-zinc-200">{data.label}</div>
                                                <div className="text-[10px] text-[#c5a059] font-mono mt-0.5">
                                                    Rp {data.price.toLocaleString('id-ID')} / m2
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {subItem === 'JASA_SIPIL' && (
                                <div className="p-4 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-3">
                                    <label className="text-xs font-bold text-[#c5a059] block">Pilihan Pekerjaan Sipil & Bongkaran</label>
                                    <select
                                        value={jasaSipilType}
                                        onChange={(e) => setJasaSipilType(e.target.value)}
                                        className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c5a059] focus:outline-none"
                                    >
                                        {Object.entries(PRICELIST_CATALOG.SIPIL_BENGKEL.JASA_SIPIL[region] || {}).map(([key, item]) => (
                                            <option key={key} value={key}>
                                                {item.label} — Rp {item.price.toLocaleString('id-ID')} / {item.unit}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">Volume / Jumlah Qty:</span>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="1"
                                            value={jasaSipilQty}
                                            onChange={(e) => setJasaSipilQty(parseFloat(e.target.value) || 1)}
                                            className="w-24 bg-[#111115] border border-[#2e2e38] rounded-xl px-2.5 py-1 text-xs text-white font-mono"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Shared Upgrades: Finishing HPL Luar Dalam & Custom Addons */}
                    <div className="pt-2 space-y-3">
                        <label className="flex items-center gap-2 p-3 rounded-2xl bg-[#1b1b22] border border-[#2e2e38] cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isHplLuarDalam}
                                onChange={(e) => setIsHplLuarDalam(e.target.checked)}
                                className="w-4 h-4 accent-[#c5a059] rounded"
                            />
                            <span className="text-xs text-zinc-300">
                                Upgrade Finishing HPL Luar & Dalam (+Rp 700.000 / meter)
                            </span>
                        </label>

                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs text-zinc-400 whitespace-nowrap">Aksesoris Tambahan (Manual):</span>
                            <div className="flex items-center w-full">
                                <span className="text-xs text-zinc-500 mr-2 font-mono">Rp</span>
                                <input
                                    type="number"
                                    step="50000"
                                    min="0"
                                    value={customAddons}
                                    onChange={(e) => setCustomAddons(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#c5a059] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SISI KANAN: RINCIAN ESTIMASI BIAYA & AKSI */}
                <div className="lg:col-span-5 space-y-5">
                    <div className="bg-[#15151a] p-6 md:p-8 rounded-3xl border border-[#26262d] shadow-2xl flex flex-col justify-between h-full space-y-6">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-[#26262d]">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">RAB Hasil Hitungan</span>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                    Live Calculator 2026
                                </span>
                            </div>

                            {/* Itemized List */}
                            <div className="space-y-3 mt-4">
                                {estimate.itemBreakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-xs border-b border-[#202028] pb-2">
                                        <div>
                                            <div className="font-semibold text-zinc-200">{item.label}</div>
                                            {item.detail && (
                                                <div className="text-[10px] text-zinc-400 mt-0.5">{item.detail}</div>
                                            )}
                                        </div>
                                        <div className="font-mono font-bold text-zinc-200 whitespace-nowrap ml-2">
                                            Rp {item.amount.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                ))}

                                {/* Subtotal */}
                                <div className="flex justify-between items-center text-xs pt-1 text-zinc-400">
                                    <span>Subtotal Produksi:</span>
                                    <span className="font-mono font-semibold text-zinc-300">
                                        Rp {estimate.subtotal.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                {/* Ongkir Status */}
                                <div className="flex justify-between items-center text-xs pt-1">
                                    <span className="flex items-center gap-1 text-zinc-400">
                                        <span>🚚</span> Ongkos Kirim:
                                    </span>
                                    {estimate.isFreeOngkir ? (
                                        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                                            GRATIS
                                        </span>
                                    ) : (
                                        <span className="font-mono font-semibold text-amber-400">
                                            Rp {estimate.ongkirCost.toLocaleString('id-ID')}
                                        </span>
                                    )}
                                </div>
                                {!estimate.isFreeOngkir && (
                                    <p className="text-[10px] text-zinc-500 text-right">
                                        (Gratis ongkir untuk order di atas Rp {(estimate.minFreeOngkir / 1000000).toFixed(0)} Juta)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Grand Total Box */}
                        <div className="space-y-4 pt-4 border-t border-[#26262d]">
                            <div className="bg-[#1c1c24] p-4 rounded-2xl border border-[#c5a059]/30 flex justify-between items-center shadow-inner">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">Total Estimasi RAB</div>
                                    <div className="text-xl md:text-2xl font-black font-mono text-white mt-0.5">
                                        Rp {estimate.grandTotal.toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <div className="text-right text-[10px] text-zinc-400">
                                    <div>Survei & 3D</div>
                                    <div className="text-emerald-400 font-bold">100% GRATIS</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className={`w-full py-3 px-4 min-h-[46px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg touch-manipulation active:scale-95 ${
                                        copied
                                            ? 'bg-emerald-500 text-white'
                                            : 'gold-btn shadow-[#c5a059]/20'
                                    }`}
                                >
                                    {copied ? (
                                        <React.Fragment><Icons.CheckCircle /> Rincian Disalin ke Clipboard!</React.Fragment>
                                    ) : (
                                        <React.Fragment><Icons.Copy /> Salin Format Chat WhatsApp</React.Fragment>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExportPDF}
                                    disabled={isExportingPDF}
                                    className="w-full py-2.5 px-4 min-h-[46px] rounded-xl text-xs font-bold transition-all bg-[#1a1a24] hover:bg-[#252533] text-[#c5a059] border border-[#c5a059]/40 flex items-center justify-center gap-2 shadow-md hover:border-[#c5a059] touch-manipulation active:scale-95 disabled:opacity-50"
                                >
                                    <span>📄</span>
                                    <span>{isExportingPDF ? 'Membuat Dokumen PDF...' : `Ekspor PDF Penawaran RAB (${brandName})`}</span>
                                </button>

                                {onApplyToAI && (
                                    <button
                                        type="button"
                                        onClick={handleSendToAI}
                                        className="w-full py-2.5 px-4 min-h-[46px] rounded-xl text-xs font-bold transition-all bg-[#202028] hover:bg-[#2e2e38] text-zinc-200 border border-[#2e2e38] flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                                    >
                                        <Icons.Brain />
                                        <span>Gunakan untuk Balasan Sales Ary</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
