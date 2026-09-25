// File: src/components/modules/EstimatorCalculator.jsx
import React, { useState, useMemo } from 'react';
import { Icons } from '../Icons.jsx';
import { 
    ESTIMATOR_CATEGORIES, 
    calculateEstimate, 
    formatEstimateForWhatsApp,
    PROJECT_RULES 
} from '../../js/services/calculatorData.js';
import { copyToClipboard } from '../../js/utils/clipboard.js';

export const EstimatorCalculator = ({ 
    activeBrand, 
    onApplyToAI, 
    showToast 
}) => {
    const brandName = activeBrand?.brandName || 'PUTRA INTERIOR';

    // Form States
    const [region, setRegion] = useState('dalam_kota'); // 'dalam_kota' | 'luar_kota'
    const [category, setCategory] = useState('KITCHEN_SET');
    const [material, setMaterial] = useState('MULTIPLEKS');
    const [style, setStyle] = useState('MINIMALIS');
    
    // Dimensions
    const [p, setP] = useState(3.0);
    const [t, setT] = useState(category === 'LEMARI_WARDROBE' ? 2.8 : 1.0);
    const [l, setL] = useState(1.6);

    // Kitchen Set Specific: Cabinet Bawah & Cabinet Atas
    const [cabinetBawah, setCabinetBawah] = useState(2.0);
    const [cabinetAtas, setCabinetAtas] = useState(2.0);
    const [isKusenBawahOnly, setIsKusenBawahOnly] = useState(false);

    // Options & Add-ons
    const [plafonOption, setPlafonOption] = useState('none'); // 'none' | 'lt_50' | '50_to_70'
    const [isHplLuarDalam, setIsHplLuarDalam] = useState(false);
    const [pintuKusen, setPintuKusen] = useState(false);
    const [pintuKaca, setPintuKaca] = useState('none');
    const [sofaCover, setSofaCover] = useState('standard');
    const [headboardOption, setHeadboardOption] = useState('none');
    const [rangkaDipanTingkat, setRangkaDipanTingkat] = useState('160x200');
    const [bawahTanggaKedalamanGt60, setBawahTanggaKedalamanGt60] = useState(false);
    const [customAddons, setCustomAddons] = useState(0);

    const [copied, setCopied] = useState(false);

    // Real-time calculation
    const estimate = useMemo(() => {
        return calculateEstimate({
            region,
            category,
            material,
            style,
            p,
            t,
            l,
            cabinetBawah: category === 'KITCHEN_SET' ? cabinetBawah : undefined,
            cabinetAtas: category === 'KITCHEN_SET' ? cabinetAtas : undefined,
            isKusenBawahOnly: category === 'KITCHEN_SET' ? isKusenBawahOnly : false,
            plafonOption,
            isHplLuarDalam,
            pintuKusen,
            pintuKaca,
            sofaCover,
            headboardOption,
            rangkaDipanTingkat,
            bawahTanggaKedalamanGt60,
            customAddons: parseFloat(customAddons) || 0
        });
    }, [
        region, category, material, style, p, t, l,
        cabinetBawah, cabinetAtas, isKusenBawahOnly,
        plafonOption, isHplLuarDalam, pintuKusen, pintuKaca,
        sofaCover, headboardOption, rangkaDipanTingkat,
        bawahTanggaKedalamanGt60, customAddons
    ]);

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

    const handleSendToAI = () => {
        if (onApplyToAI) {
            let dimString = `${p}m ${t > 1 ? `x ${t}m` : ''} ${l > 1 ? `x ${l}m` : ''}`.trim();
            if (category === 'KITCHEN_SET') {
                dimString = `Cabinet Bawah: ${cabinetBawah}m', Cabinet Atas: ${cabinetAtas}m'`;
            }
            onApplyToAI({
                dimensions: dimString,
                budget: `Rp ${(estimate.grandTotal / 1000000).toFixed(1)} Juta`,
                projectType: `${category.replace(/_/g, ' ')} (${material} ${style})`,
                notes: `Estimasi RAB: Rp ${estimate.grandTotal.toLocaleString('id-ID')} (${estimate.regionLabel})`
            });
            showToast?.("Hasil estimasi berhasil dimasukkan ke AI Copilot Workspace!");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Region Switcher */}
            <div className="bg-[#15151a] p-5 rounded-3xl border border-[#26262d] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🧮</span>
                        <h2 className="serif-font text-lg md:text-xl font-bold text-white">
                            Kalkulator Estimasi Biaya Interior (Master RAB 2026)
                        </h2>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                        Dihitung berdasarkan 24 lembar pricelist resmi Putra Corporation & SOP pengerjaan brand.
                    </p>
                </div>

                {/* Region Selector Pill */}
                <div className="flex items-center p-1 bg-[#101014] rounded-2xl border border-[#2e2e38]">
                    <button
                        type="button"
                        onClick={() => setRegion('dalam_kota')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            region === 'dalam_kota'
                                ? 'bg-[#c5a059] text-black shadow-md'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <span>🏠</span>
                        <span>PL DK (Bandung & Tasik)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRegion('luar_kota')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            region === 'luar_kota'
                                ? 'bg-[#c5a059] text-black shadow-md'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <span>🏙️</span>
                        <span>PL LK (Jabodetabek & Luar Kota)</span>
                    </button>
                </div>
            </div>

            {/* Category Scroll / Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {ESTIMATOR_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                            setCategory(cat.id);
                            if (cat.id === 'LEMARI_WARDROBE' && t < 2) setT(2.8);
                        }}
                        className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                            category === cat.id
                                ? 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059] shadow-lg shadow-[#c5a059]/10'
                                : 'bg-[#15151a] text-zinc-400 border-[#26262d] hover:border-zinc-600 hover:text-zinc-200'
                        }`}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Main Form & Calculation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* SISI KIRI: INPUT PARAMETER */}
                <div className="lg:col-span-7 space-y-5 bg-[#15151a] p-6 md:p-8 rounded-3xl border border-[#26262d] shadow-xl">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#c5a059] pb-3 border-b border-[#26262d] flex items-center justify-between">
                        <span>1. Spesifikasi Material & Model</span>
                        <span className="text-[11px] text-zinc-400 font-normal lowercase">{estimate.regionLabel}</span>
                    </h3>

                    {/* Material Selector */}
                    {category !== 'RANGKA_DIPAN_TINGKAT' && category !== 'SOFA' && (
                        <div>
                            <label className="text-xs font-bold text-zinc-300 block mb-2">Bahan Dasar</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { id: 'MULTIPLEKS', label: 'Multipleks 18mm', desc: 'Plywood Meranti Padat' },
                                    { id: 'BLOCKBOARD', label: 'Blockboard', desc: 'Kayu Lapis Standar' },
                                    { id: 'DUCO_LUXURY', label: 'Cat Duco Luxury', desc: 'Finishing Semprot Mewah' }
                                ].map((mat) => (
                                    <button
                                        key={mat.id}
                                        type="button"
                                        onClick={() => setMaterial(mat.id)}
                                        className={`p-3 rounded-2xl border text-left transition-all ${
                                            material === mat.id
                                                ? 'bg-[#c5a059]/15 border-[#c5a059] text-white shadow-sm'
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
                    {category !== 'RANGKA_DIPAN_TINGKAT' && category !== 'WALLPANEL_KACA' && (
                        <div>
                            <label className="text-xs font-bold text-zinc-300 block mb-2">Model / Style</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                    { id: 'MINIMALIS', label: 'Minimalis' },
                                    { id: 'SEMI_KLASIK', label: 'Semi Klasik' },
                                    { id: 'KLASIK', label: 'Klasik Profil' },
                                    { id: 'INDUSTRIAL', label: 'Industrial (Besi)' }
                                ].map((st) => (
                                    <button
                                        key={st.id}
                                        type="button"
                                        onClick={() => setStyle(st.id)}
                                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                                            style === st.id
                                                ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-sm'
                                                : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-300 hover:text-white'
                                        }`}
                                    >
                                        {st.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dimensi Ruangan */}
                    <div className="pt-2">
                        <label className="text-xs font-bold text-zinc-300 block mb-2">
                            {category === 'KITCHEN_SET' ? '2. Ukuran Kabinet Kitchen Set (Cabinet Bawah & Cabinet Atas)' : '2. Ukuran / Dimensi'}
                        </label>

                        {category === 'KITCHEN_SET' ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Cabinet Bawah */}
                                    <div className="p-3.5 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-[#c5a059] flex items-center gap-1.5">
                                                <span>🔽</span>
                                                <span>Cabinet Bawah</span>
                                            </label>
                                            <span className="text-[10px] text-zinc-400 font-mono">Meter Lari (m')</span>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={cabinetBawah}
                                                onChange={(e) => setCabinetBawah(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                                className="w-full bg-[#111115] border border-[#2e2e38] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#c5a059] focus:outline-none"
                                                placeholder="Contoh: 2.0"
                                            />
                                            <span className="text-xs text-zinc-500 ml-2 font-mono">m'</span>
                                        </div>
                                        <label className="flex items-center gap-2 pt-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isKusenBawahOnly}
                                                onChange={(e) => setIsKusenBawahOnly(e.target.checked)}
                                                className="w-3.5 h-3.5 accent-[#c5a059] rounded"
                                            />
                                            <span className="text-[11px] text-zinc-300">
                                                Hanya Pintu Kusen (Meja Cor Semen)
                                            </span>
                                        </label>
                                        <p className="text-[10px] text-zinc-500">
                                            Standar T: 80-85cm, Kedalaman 60cm. Isi 0 jika tidak memesan cabinet bawah.
                                        </p>
                                    </div>

                                    {/* Cabinet Atas */}
                                    <div className="p-3.5 bg-[#17171e] rounded-2xl border border-[#2e2e38] space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-[#c5a059] flex items-center gap-1.5">
                                                <span>🔼</span>
                                                <span>Cabinet Atas</span>
                                            </label>
                                            <span className="text-[10px] text-zinc-400 font-mono">Meter Lari (m')</span>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={cabinetAtas}
                                                onChange={(e) => setCabinetAtas(parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0)}
                                                className="w-full bg-[#111115] border border-[#2e2e38] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#c5a059] focus:outline-none"
                                                placeholder="Contoh: 2.0"
                                            />
                                            <span className="text-xs text-zinc-500 ml-2 font-mono">m'</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 pt-2">
                                            Standar T: 80cm gantung, Kedalaman 35cm. Isi 0 jika tidak memesan cabinet atas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
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
                                            className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-sm text-white focus:border-[#c5a059] focus:outline-none"
                                        />
                                        <span className="text-xs text-zinc-500 ml-2">m</span>
                                    </div>
                                </div>

                                {(category === 'LEMARI_WARDROBE' || category === 'BACKDROP_TV' || category === 'LEMARI_BAWAH_TANGGA' || category === 'WALLPANEL_KACA' || category === 'PARTISI_BENCH') && (
                                    <div>
                                        <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Tinggi (T) / Meter</label>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.5"
                                                value={t}
                                                onChange={(e) => setT(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-sm text-white focus:border-[#c5a059] focus:outline-none"
                                            />
                                            <span className="text-xs text-zinc-500 ml-2">m</span>
                                        </div>
                                    </div>
                                )}

                                {(category === 'DIPAN_HEADBOARD') && (
                                    <div>
                                        <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Lebar Ranjang (L) / Meter</label>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.9"
                                                value={l}
                                                onChange={(e) => setL(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-3 py-2 text-sm text-white focus:border-[#c5a059] focus:outline-none"
                                            />
                                            <span className="text-xs text-zinc-500 ml-2">m</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Opsi Tambahan Spesifik Kategori */}
                    <div className="pt-2 space-y-3">
                        <label className="text-xs font-bold text-zinc-300 block mb-1">3. Opsi & Aksesoris Tambahan</label>

                        {/* Kitchen Set Plafon */}
                        {category === 'KITCHEN_SET' && (
                            <div className="space-y-2">
                                <label className="text-[11px] text-zinc-400 block">Kabinet Plafon Atas (Tingkat 2)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'none', label: 'Tanpa Plafon' },
                                        { id: 'lt_50', label: 'Tinggi < 50cm' },
                                        { id: '50_to_70', label: 'Tinggi 50 - 70cm' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setPlafonOption(opt.id)}
                                            className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                                                plafonOption === opt.id
                                                    ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                                                    : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-400'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lemari Pintu Kaca */}
                        {category === 'LEMARI_WARDROBE' && (
                            <div>
                                <label className="text-[11px] text-zinc-400 block mb-1">Add-on Pintu Kaca / Cermin</label>
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

                        {/* Rangka Dipan Tingkat */}
                        {category === 'RANGKA_DIPAN_TINGKAT' && (
                            <div>
                                <label className="text-[11px] text-zinc-400 block mb-1">Ukuran Rangka Dipan Tingkat (Besi Hollow Lapis HPL)</label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {['90x200', '100x200', '120x200', '160x200', '180x200', '200x200'].map((sz) => (
                                        <button
                                            key={sz}
                                            type="button"
                                            onClick={() => setRangkaDipanTingkat(sz)}
                                            className={`p-2 rounded-xl border text-xs font-bold text-center transition-all ${
                                                rangkaDipanTingkat === sz
                                                    ? 'bg-[#c5a059] text-black border-[#c5a059]'
                                                    : 'bg-[#1b1b22] border-[#2e2e38] text-zinc-300'
                                            }`}
                                        >
                                            {sz}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lemari Bawah Tangga Kedalaman */}
                        {category === 'LEMARI_BAWAH_TANGGA' && (
                            <label className="flex items-center gap-2 p-3 rounded-2xl bg-[#1b1b22] border border-[#2e2e38] cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={bawahTanggaKedalamanGt60}
                                    onChange={(e) => setBawahTanggaKedalamanGt60(e.target.checked)}
                                    className="w-4 h-4 accent-[#c5a059] rounded"
                                />
                                <span className="text-xs text-zinc-300">
                                    Kedalaman lemari lebih dari 60cm (Dihitung P x T x Harga tanpa faktor 0.8)
                                </span>
                            </label>
                        )}

                        {/* Finishing HPL Luar & Dalam (+700rb/m) */}
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
                    </div>
                </div>

                {/* SISI KANAN: RINCIAN ESTIMASI BIAYA & AKSI */}
                <div className="lg:col-span-5 space-y-5">
                    <div className="bg-[#15151a] p-6 md:p-8 rounded-3xl border border-[#26262d] shadow-2xl flex flex-col justify-between h-full space-y-6">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-[#26262d]">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">RAB Hasil Hitungan</span>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                    Live Calculator
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
                                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
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

                                {onApplyToAI && (
                                    <button
                                        type="button"
                                        onClick={handleSendToAI}
                                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all bg-[#202028] hover:bg-[#2e2e38] text-zinc-200 border border-[#2e2e38] flex items-center justify-center gap-2"
                                    >
                                        <Icons.Brain />
                                        <span>Gunakan untuk Balasan AI Copilot</span>
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
