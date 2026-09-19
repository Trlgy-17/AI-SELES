// File: src/components/modules/KnowledgeBase.jsx
import React from 'react';
import { PRICE_MASTER } from '../../js/constants.js';
import { Icons } from '../Icons.jsx';

export const KnowledgeBase = () => {
    const company = PRICE_MASTER?.company || {};

    const kbItems = [
        { 
            category: "Profil & Kontak Resmi", 
            title: "Nacira Studio — Identitas & Kontak", 
            desc: `Admin: ${company.admin || 'Ary'} · Website: ${company.website || 'nacirastudio.com'} · WhatsApp: ${company.phone || '+62 853-8506-9717'} · Kantor & Workshop: ${company.office || 'Citatah, Bandung Barat'}. Studio Architectural Interior Design & Build sejak 2018.` 
        },
        { 
            category: "SOP & Garansi", 
            title: "Alur Kerja End-to-End & Garansi 6 Bulan", 
            desc: `1. Konsultasi & Estimasi Awal (Gratis) · 2. Survey & Desain 3D (Gratis Area Bandung & Jabodetabek) · 3. Fabrikasi Workshop Presisi (14-21 hari) · 4. Instalasi & Serah Terima. Skema Termin: DP 50% fabrikasi, 40% progres workshop, pelunasan instalasi. Garansi pemeliharaan 6 bulan penuh.` 
        },
        { 
            category: "Coverage & Nilai Minimal", 
            title: "Cakupan Wilayah & Minimal Order Proyek", 
            desc: `${company.coverage || 'Bandung, Jabodetabek, dan seluruh Pulau Jawa & Bali.'} Ketentuan Minimal Project: ${company.minProject || 'Bandung 15jt, Jabodetabek 15jt, Luar Jawa Barat 100jt.'} Jam admin aktif 24 jam & survey dibuka setiap hari.` 
        },
        { 
            category: "Kitchen Set (Bandung)", 
            title: "Pricelist Kitchen Set Bandung & Tasikmalaya", 
            desc: Array.isArray(PRICE_MASTER?.kitchenBandung) 
                ? PRICE_MASTER.kitchenBandung.map(k => `${k.material} (${k.display})`).join(' · ')
                : "Blockboard Rp 2jt/m, Multipleks Rp 2,5jt/m, PVC Board Rp 4jt/m, Alumunium Rp 3,3jt/m, Duco Rp 4,5jt/m"
        },
        { 
            category: "Kitchen Set (Jabodetabek)", 
            title: "Pricelist Kitchen Set Jabodetabek & Luar Kota", 
            desc: Array.isArray(PRICE_MASTER?.kitchenJabodetabek)
                ? PRICE_MASTER.kitchenJabodetabek.map(k => `${k.material} (${k.display})`).join(' · ')
                : "Blockboard Rp 2,3jt/m, Multipleks Rp 2,6jt/m, PVC Board Rp 4,1jt/m, Alumunium Rp 3,5jt - 5,5jt/m, Duco Rp 4,0jt - 4,8jt/m"
        },
        { 
            category: "Kamar Set & Wardrobe", 
            title: "Pricelist Lemari, Dipan, Headboard & Meja Rias", 
            desc: `Lemari Blockboard mulai Rp 2,3jt/m (Bandung) & Rp 2,4jt/m (Jabodetabek). Lemari Multipleks HPL Rp 2,5jt - 2,6jt/m, Cat Duco Rp 4,8jt - 6,3jt/m, Alumunium Frameless Kaca Rp 5jt - 6jt/m. Dipan mulai Rp 2,1jt/m, Headboard mulai Rp 1,35jt/m, Meja Rias mulai Rp 1,9jt/m, Rangka Tingkat Rp 2jt - 3,75jt.` 
        },
        { 
            category: "Living Room & Interior", 
            title: "Backdrop TV, Cradienza, Partisi & Wallpanel", 
            desc: `Backdrop TV Blockboard mulai Rp 2,1jt/m, Multipleks HPL Rp 2,3jt - 2,9jt/m, Duco Rp 4,6jt - 6,1jt/m. Cradienza mulai Rp 1,9jt/m. Partisi 2 Sisi Rp 2,1jt - 2,4jt/m. Wallpanel WPC Rp 850rb - 950rb/m, Wallpanel Multipleks Cermin Bevel Rp 1,35jt - 1,95jt/m. Lemari Bawah Tangga mulai Rp 2,3jt/m.` 
        },
        { 
            category: "Bengkel Las & Sipil", 
            title: "Canopi, Pagar Besi, Coran Dapur & Keramik", 
            desc: `Canopi Spandex / Alderon Rp 750rb - 1,8jt/m² (Atap Kaca Rp 2,8jt/m²). Pagar Besi Hollow & Wire Mesh Rp 1,8jt - 2,4jt/m² (Full Klasik Rp 4,8jt/m²). Meja Coran Dapur Beton Rp 1,9jt - 2,4jt/m, Pasang Backsplash & Keramik mulai Rp 650rb/m², Bobok lubang kompor/sink Rp 500rb - 750rb.` 
        },
        { 
            category: "Material Specs", 
            title: "Spesifikasi Material Resmi Nacira Studio", 
            desc: PRICE_MASTER?.specifications || "Blockboard 18mm, Multipleks Plywood 18mm, PVC Board Waterproof anti air, Alumunium & ACP anti rayap tahan api, Finishing HPL & Cat Duco Klasik." 
        }
    ];

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-[#26262d] flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="serif-font text-xl font-extrabold text-white">Knowledge Base & Master SOP Nacira Studio</h2>
                    <p className="text-sm text-zinc-400 mt-1">Master database SOP WhatsApp Inbound Sales v1.2, spesifikasi material, garansi, dan tarif resmi 2026.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-[#202028] text-[#c5a059] font-bold text-xs rounded-xl border border-[#33333d] shadow-sm">
                        {kbItems.length} Modul Terintegrasi
                    </span>
                    <span className="px-3.5 py-2 bg-emerald-950 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-800 flex items-center gap-1.5">
                        <Icons.CheckCircle /> SOP v1.2 Aktif
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kbItems.map((item, idx) => (
                    <div key={idx} className="bg-[#15151a] rounded-3xl p-6 border border-[#26262d] shadow-2xl flex flex-col justify-between hover:border-[#c5a059]/50 transition-all group">
                        <div>
                            <span className="text-xs font-extrabold px-3 py-1 bg-[#202028] text-[#c5a059] rounded-xl inline-block mb-4 border border-[#2e2e38] group-hover:border-[#c5a059]/40 transition-colors">
                                {item.category}
                            </span>
                            <h3 className="serif-font font-extrabold text-white text-base group-hover:text-[#f3e7c4] transition-colors">{item.title}</h3>
                            <p className="text-sm text-zinc-400 mt-2.5 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#26262d] flex justify-between items-center text-xs">
                            <span className="text-zinc-500 font-medium">Terhubung ke Gemini AI Engine</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                                <Icons.CheckCircle /> Terverifikasi
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KnowledgeBase;
