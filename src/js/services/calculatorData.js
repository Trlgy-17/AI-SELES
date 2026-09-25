// File: src/js/services/calculatorData.js

/**
 * MASTER PRICELIST & ESTIMATOR DATA 2026
 * Diambil langsung dari 24 Halaman Dokumen Resmi PUTRA CORPORATION
 * Mencakup Wilayah:
 * - Dalam Kota (PL DK: Bandung & Tasikmalaya)
 * - Luar Kota (PL LK: Jabodetabek, Pantura, Jatim & Jateng)
 */

export const ESTIMATOR_CATEGORIES = [
    { id: 'KITCHEN_SET', name: 'Kitchen Set', icon: '🍳', unit: 'meter lari' },
    { id: 'LEMARI_BAWAH_TANGGA', name: 'Lemari Bawah Tangga', icon: '📐', unit: 'P x T x 0.8' },
    { id: 'LEMARI_WARDROBE', name: 'Lemari Pakaian / Wardrobe', icon: '🚪', unit: 'P x T (m2)' },
    { id: 'BACKDROP_TV', name: 'Backdrop TV', icon: '📺', unit: 'P x T (m2)' },
    { id: 'MINIBAR_ISLAND', name: 'Mini Bar / Meja Island', icon: '🍸', unit: 'P x 0.6 / unit' },
    { id: 'TOPI_BOX_HAMBALAN', name: 'Topi Bar, Box Elektronik & Hambalan', icon: '📦', unit: 'unit / meter' },
    { id: 'DIPAN_HEADBOARD', name: 'Dipan, Headboard & Nakas', icon: '🛏️', unit: 'P x L / meter' },
    { id: 'RANGKA_DIPAN_TINGKAT', name: 'Penambahan Rangka Dipan Tingkat', icon: '🪜', unit: 'unit' },
    { id: 'CRADIENZA', name: 'Cradienza / Kredensa', icon: '🗄️', unit: 'meter lari' },
    { id: 'WALLPANEL_KACA', name: 'Wallpanel & Cermin Bevel', icon: '🪞', unit: 'P x T (m2)' },
    { id: 'PARTISI_BENCH', name: 'Partisi & Bench', icon: '🛋️', unit: 'P x T / meter' },
    { id: 'SOFA', name: 'Sofa Custom', icon: '🛋️', unit: 'P x 0.60' }
];

export const PRICELIST_CATALOG = {
    // ----------------------------------------------------
    // 1. KITCHEN SET (Page 1-6)
    // ----------------------------------------------------
    KITCHEN_SET: {
        dalam_kota: {
            BLOCKBOARD: {
                MINIMALIS: { base: 2000000, plafonLt50: 1800000, plafon50to70: 1950000, kusen: 1450000 },
                SEMI_KLASIK: { base: 2500000, plafonLt50: 2300000, plafon50to70: 2500000, kusen: 1650000 },
                KLASIK: { base: 2900000, plafonLt50: 2500000, plafon50to70: 2600000, kusen: 1650000 },
                INDUSTRIAL: { base: 2000000, rangkaBesi: 1800000, rangkaWiremesh: 2000000, kusen: 1450000 }
            },
            MULTIPLEKS: {
                MINIMALIS: { base: 2500000, plafonLt50: 2300000, plafon50to70: 2500000, kusen: 1450000 },
                SEMI_KLASIK: { base: 2700000, plafonLt50: 2400000, plafon50to70: 2700000, kusen: 1650000 },
                KLASIK: { base: 3200000, plafonLt50: 3000000, plafon50to70: 3200000, kusen: 1650000 },
                INDUSTRIAL: { base: 2300000, rangkaBesi: 1800000, rangkaWiremesh: 2000000, kusen: 1450000 }
            },
            DUCO_LUXURY: {
                MINIMALIS: { base: 4000000, plafonLt50: 3800000, plafon50to70: 4000000, kusen: 1850000 },
                SEMI_KLASIK: { base: 4500000, plafonLt50: 4300000, plafon50to70: 4500000, kusen: 2150000 },
                KLASIK: { base: 4700000, plafonLt50: 4500000, plafon50to70: 4700000, kusen: 2150000 },
                DUCO_DOUBLE_PROFIL: { base: 6100000, kusen: 2350000 },
                INDUSTRIAL: { base: 4500000, rangkaBesi: 2100000, rangkaWiremesh: 2300000 }
            }
        },
        luar_kota: {
            BLOCKBOARD: {
                MINIMALIS: { base: 2300000, plafonLt50: 2100000, plafon50to70: 2300000, kusen: 1450000 },
                SEMI_KLASIK: { base: 2600000, plafonLt50: 2400000, plafon50to70: 2600000, kusen: 1650000 },
                KLASIK: { base: 3000000, plafonLt50: 2800000, plafon50to70: 3000000, kusen: 1650000 },
                INDUSTRIAL: { base: 2300000, rangkaBesi: 2100000, rangkaWiremesh: 2300000, kusen: 1450000 }
            },
            MULTIPLEKS: {
                MINIMALIS: { base: 2600000, plafonLt50: 2400000, plafon50to70: 2600000, kusen: 1450000 },
                SEMI_KLASIK: { base: 2800000, plafonLt50: 2600000, plafon50to70: 2800000, kusen: 1650000 },
                KLASIK: { base: 3300000, plafonLt50: 3100000, plafon50to70: 3300000, kusen: 1650000 },
                INDUSTRIAL: { base: 2700000, rangkaBesi: 2100000, rangkaWiremesh: 2300000, kusen: 1450000 }
            },
            DUCO_LUXURY: {
                MINIMALIS: { base: 4000000, plafonLt50: 3800000, plafon50to70: 4000000, kusen: 1950000 },
                SEMI_KLASIK: { base: 4600000, plafonLt50: 4400000, plafon50to70: 4600000, kusen: 2250000 },
                KLASIK: { base: 4800000, plafonLt50: 4600000, plafon50to70: 4800000, kusen: 2250000 },
                DUCO_DOUBLE_PROFIL: { base: 6200000, kusen: 2450000 },
                INDUSTRIAL: { base: 4500000, rangkaBesi: 2100000, rangkaWiremesh: 2300000 }
            }
        }
    },

    // ----------------------------------------------------
    // 2. LEMARI BAWAH TANGGA (Page 22 & 23)
    // Formula: P x T x 0.8 x Harga (Standar Kedalaman 60cm)
    // Jika kedalaman > 60cm: P x T x Harga
    // ----------------------------------------------------
    LEMARI_BAWAH_TANGGA: {
        dalam_kota: {
            BLOCKBOARD: { MINIMALIS: 2300000, SEMI_KLASIK: 2700000, KLASIK: 2950000 },
            MULTIPLEKS: { MINIMALIS: 2500000, SEMI_KLASIK: 2750000, KLASIK: 3000000 },
            DUCO: { MINIMALIS: 4800000, SEMI_KLASIK: 5300000, KLASIK: 6300000 }
        },
        luar_kota: {
            BLOCKBOARD: { MINIMALIS: 2400000, SEMI_KLASIK: 2850000, KLASIK: 3050000 },
            MULTIPLEKS: { MINIMALIS: 2600000, SEMI_KLASIK: 2850000, KLASIK: 3100000 },
            DUCO: { MINIMALIS: 4100000, SEMI_KLASIK: 4800000, KLASIK: 5500000 }
        }
    },

    // ----------------------------------------------------
    // 3. LEMARI / WARDROBE (Page 15 & 16)
    // Formula: P x T x Harga (Standar Kedalaman 60cm)
    // ----------------------------------------------------
    LEMARI_WARDROBE: {
        dalam_kota: {
            BLOCKBOARD: { MINIMALIS: 2300000, SEMI_KLASIK: 2700000, KLASIK: 2950000 },
            MULTIPLEKS: { MINIMALIS: 2500000, SEMI_KLASIK: 2750000, KLASIK: 3000000 },
            DUCO: { MINIMALIS: 4800000, SEMI_KLASIK: 5300000, KLASIK: 6300000 },
            PINTU_KACA: { KACA_POLOS: 650000, KACA_RIBEN: 1250000, CERMIN_BIASA: 750000, CERMIN_BRONZE_GREY: 1850000 }
        },
        luar_kota: {
            BLOCKBOARD: { MINIMALIS: 2400000, SEMI_KLASIK: 2800000, KLASIK: 3050000 },
            MULTIPLEKS: { MINIMALIS: 2600000, SEMI_KLASIK: 2850000, KLASIK: 3100000 },
            DUCO: { MINIMALIS: 4800000, SEMI_KLASIK: 5300000, KLASIK: 6300000 },
            PINTU_KACA: { KACA_POLOS: 750000, KACA_RIBEN: 1250000, CERMIN_BIASA: 850000, CERMIN_BRONZE_GREY: 1850000 }
        }
    },

    // ----------------------------------------------------
    // 4. BACKDROP TV (Page 17 & 18)
    // Formula: P x T x Harga
    // ----------------------------------------------------
    BACKDROP_TV: {
        dalam_kota: {
            BLOCKBOARD: { MINIMALIS: 2100000, SEMI_KLASIK: 2300000, KLASIK: 2500000 },
            MULTIPLEKS: { MINIMALIS: 2300000, SEMI_KLASIK: 2500000, KLASIK: 2800000 },
            DUCO: { MINIMALIS: 4600000, SEMI_KLASIK: 5100000, KLASIK: 6100000 }
        },
        luar_kota: {
            BLOCKBOARD: { MINIMALIS: 2100000, SEMI_KLASIK: 2300000, KLASIK: 2600000 },
            MULTIPLEKS: { MINIMALIS: 2400000, SEMI_KLASIK: 2600000, KLASIK: 2900000 },
            DUCO: { MINIMALIS: 4600000, SEMI_KLASIK: 5100000, KLASIK: 6100000 }
        }
    },

    // ----------------------------------------------------
    // 5. MINI BAR / MEJA ISLAND (Page 7 & 10)
    // Formula: P : 0.6 x Harga
    // ----------------------------------------------------
    MINIBAR_ISLAND: {
        dalam_kota: {
            BLOCKBOARD: { MINIMALIS: 2100000, SEMI_KLASIK: 2500000, KLASIK: 2500000, INDUSTRIAL: 2100000, RANGKA_BESI: 1800000, RANGKA_WIREMESH: 2000000 },
            MULTIPLEKS: { MINIMALIS: 2500000, SEMI_KLASIK: 2700000, KLASIK: 2700000, INDUSTRIAL: 2500000, RANGKA_BESI: 1800000, RANGKA_WIREMESH: 2000000 }
        },
        luar_kota: {
            BLOCKBOARD: { MINIMALIS: 2300000, SEMI_KLASIK: 2700000, KLASIK: 2700000, INDUSTRIAL: 2300000, RANGKA_BESI: 2100000, RANGKA_WIREMESH: 2300000 },
            MULTIPLEKS: { MINIMALIS: 2500000, SEMI_KLASIK: 2700000, KLASIK: 2700000, INDUSTRIAL: 2500000, RANGKA_BESI: 2100000, RANGKA_WIREMESH: 2300000 }
        }
    },

    // ----------------------------------------------------
    // 6. TOPI BAR, BOX ELEKTRONIK & HAMBALAN (Page 8 & 9)
    // ----------------------------------------------------
    TOPI_BOX_HAMBALAN: {
        dalam_kota: {
            TOPI_BAR: { BLOCKBOARD: 1250000, MULTIPLEK: 1450000, DUCO: 2100000 },
            BOX_ELEKTRONIK_BLOCKBOARD: { LT_1M: 2100000, GT_1M: 2200000 },
            BOX_ELEKTRONIK_MULTIPLEKS: { LT_1M: 2500000, GT_1M: 2600000 },
            HAMBALAN: { DENGAN_LAMPU: 500000, TANPA_LAMPU: 450000 }
        },
        luar_kota: {
            TOPI_BAR: { BLOCKBOARD: 1350000, MULTIPLEK: 1450000, DUCO: 2100000 },
            BOX_ELEKTRONIK_BLOCKBOARD: { LT_1M: 2300000, GT_1M: 2400000 },
            BOX_ELEKTRONIK_MULTIPLEKS: { LT_1M: 2600000, GT_1M: 2700000 },
            HAMBALAN: { DENGAN_LAMPU: 600000, TANPA_LAMPU: 550000 }
        }
    },

    // ----------------------------------------------------
    // 7. DIPAN, HEADBOARD & NAKAS (Page 11 & 14)
    // ----------------------------------------------------
    DIPAN_HEADBOARD: {
        dalam_kota: {
            DIPAN_BLOCKBOARD_HPL: 2100000, // P x L x Rp
            DIPAN_MULTIPLEK_HPL: 2500000,
            DIPAN_MULTIPLEK_DUCO: 3100000,
            HEADBOARD: {
                BLOCKBOARD: 1350000,
                MULTIPLEKS: 1600000,
                BLOCKBOARD_BUSA: 1850000,
                MULTIPLEKS_BUSA: 2100000,
                SEMI_KLASIK_BLOCKBOARD: 1600000,
                SEMI_KLASIK_MULTIPLEKS: 1900000
            },
            NAKAS: { MINIMALIS: 2500000, SEMI_KLASIK: 2800000, KLASIK: 3000000 }
        },
        luar_kota: {
            DIPAN_BLOCKBOARD_HPL: 2200000,
            DIPAN_MULTIPLEK_HPL: 2600000,
            DIPAN_MULTIPLEK_DUCO: 3100000,
            HEADBOARD: {
                BLOCKBOARD: 1350000,
                MULTIPLEKS: 1600000,
                BLOCKBOARD_BUSA: 1850000,
                MULTIPLEKS_BUSA: 2100000,
                SEMI_KLASIK_BLOCKBOARD: 1600000,
                SEMI_KLASIK_MULTIPLEKS: 1900000
            },
            NAKAS: { MINIMALIS: 2500000, SEMI_KLASIK: 2800000, KLASIK: 3000000 }
        }
    },

    // ----------------------------------------------------
    // 8. PENAMBAHAN RANGKA DIPAN TINGKAT (Page 12 & 13)
    // Besi Hollow lapis HPL per Unit
    // ----------------------------------------------------
    RANGKA_DIPAN_TINGKAT: {
        dalam_kota: {
            '90x200': 2000000,
            '100x200': 2000000,
            '120x200': 2250000,
            '160x200': 2750000,
            '180x200': 3000000,
            '200x200': 3250000
        },
        luar_kota: {
            '90x200': 2500000,
            '100x200': 2500000,
            '120x200': 2750000,
            '160x200': 3250000,
            '180x200': 3500000,
            '200x200': 3750000
        }
    },

    // ----------------------------------------------------
    // 9. CRADIENZA / KREDENSA (Page 19)
    // Formula: P x Harga
    // ----------------------------------------------------
    CRADIENZA: {
        all_regions: {
            BLOCKBOARD: { MINIMALIS: 1900000, SEMI_KLASIK: 2200000, KLASIK: 2400000 },
            MULTIPLEKS: { MINIMALIS: 2100000, SEMI_KLASIK: 2450000, KLASIK: 2600000 },
            DUCO: { MINIMALIS: 2600000, SEMI_KLASIK: 3100000, KLASIK: 3600000 }
        }
    },

    // ----------------------------------------------------
    // 10. WALLPANEL & KACA CERMIN BEVEL (Page 20)
    // Formula: P x T x Harga
    // ----------------------------------------------------
    WALLPANEL_KACA: {
        all_regions: {
            WALLPANEL_MULTIPLEK: { MINIMALIS: 1350000, SEMI_KLASIK: 1500000, KLASIK: 1650000, DUCO: 2750000 },
            KACA_BEVEL: { CERMIN_BIASA: 1850000, CERMIN_BRONZE_GREY: 1950000 }
        }
    },

    // ----------------------------------------------------
    // 11. PARTISI & BENCH (Page 21)
    // ----------------------------------------------------
    PARTISI_BENCH: {
        dalam_kota: {
            PARTISI_BLOCKBOARD: 2100000, // P x T
            PARTISI_MULTIPLEK_MINIMALIS: 2400000,
            PARTISI_MULTIPLEK_DUCO: 4500000,
            BENCH_BLOCKBOARD: 2100000, // P x Harga
            BENCH_MULTIPLEK: 2600000
        }
    },

    // ----------------------------------------------------
    // 12. SOFA (Page 24)
    // Formula: P : 0.60 x Harga
    // ----------------------------------------------------
    SOFA: {
        all_regions: {
            MINIMALIS: 1650000,
            KLASIK: 2000000,
            COVER_ADDON: {
                KULIT_OSCAR: 100000, // per meter
                KULIT_MBTECH: 175000,
                CORDUROY_PREMIUM: 150000
            },
            ONGKIR_LUAR_KOTA: 750000
        }
    }
};

/**
 * ATURAN PROYEK MINIMUM & ONGKIR RESMI:
 * - Dalam Kota (Bandung & sekitarnya):
 *   Project < Rp 10.000.000 -> Ongkir Rp 500.000,- & penambahan biaya Rak Bumbu/Piring
 *   Project >= Rp 10.000.000 -> Gratis Ongkir Bandung
 * - Luar Kota (Jabodetabek, Pantura, Jatim, Jateng):
 *   Project < Rp 15.000.000 -> Ongkir Rp 500.000,-
 *   Project >= Rp 15.000.000 -> Gratis Ongkir Jabodetabek & sekitarnya
 * - Finishing HPL Luar & Dalam: Tambahan Rp 700.000,- / meter
 */
export const PROJECT_RULES = {
    dalam_kota: {
        minFreeOngkir: 10000000,
        ongkirUnderMin: 500000,
        finishingHplLuarDalamPerMeter: 700000,
        areaLabel: 'Bandung & Tasikmalaya (Dalam Kota)'
    },
    luar_kota: {
        minFreeOngkir: 15000000,
        ongkirUnderMin: 500000,
        finishingHplLuarDalamPerMeter: 700000,
        areaLabel: 'Jabodetabek, Pantura, Jateng & Jatim (Luar Kota)'
    }
};

/**
 * Mesin kalkulasi estimasi presisi untuk interior sales
 */
export const calculateEstimate = ({
    region = 'dalam_kota', // 'dalam_kota' | 'luar_kota'
    category = 'KITCHEN_SET',
    material = 'MULTIPLEKS', // 'BLOCKBOARD' | 'MULTIPLEKS' | 'DUCO_LUXURY' | 'DUCO'
    style = 'MINIMALIS', // 'MINIMALIS' | 'SEMI_KLASIK' | 'KLASIK' | 'INDUSTRIAL' | 'DUCO_DOUBLE_PROFIL'
    p = 3, // Panjang dalam meter
    t = 1, // Tinggi dalam meter
    l = 1, // Lebar dalam meter
    cabinetBawah = undefined, // Panjang meter lari kabinet bawah
    cabinetAtas = undefined,  // Panjang meter lari kabinet atas
    isKusenBawahOnly = false, // Jika kabinet bawah hanya pintu/kusen cor beton
    plafonOption = 'none', // 'none' | 'lt_50' | '50_to_70'
    isHplLuarDalam = false,
    pintuKusen = false,
    pintuKaca = 'none', // 'none' | 'KACA_POLOS' | 'KACA_RIBEN' | 'CERMIN_BIASA' | 'CERMIN_BRONZE_GREY'
    sofaCover = 'standard', // 'standard' | 'KULIT_OSCAR' | 'KULIT_MBTECH' | 'CORDUROY_PREMIUM'
    headboardOption = 'none', // 'none' | 'BLOCKBOARD' | 'MULTIPLEKS' | 'BLOCKBOARD_BUSA' | 'MULTIPLEKS_BUSA'
    rangkaDipanTingkat = 'none', // 'none' | '90x200' | '100x200' | ...
    bawahTanggaKedalamanGt60 = false, // Jika > 60cm dihitung P x T x Harga penuh
    customAddons = 0 // Biaya tambahan manual
}) => {
    const rules = PROJECT_RULES[region] || PROJECT_RULES.dalam_kota;
    let baseUnitPrice = 0;
    let formulaText = '';
    let subtotal = 0;
    const itemBreakdown = [];

    const numP = parseFloat(p) || 0;
    const numT = parseFloat(t) || 0;
    const numL = parseFloat(l) || 0;

    // 1. KITCHEN SET (Cabinet Bawah & Cabinet Atas)
    if (category === 'KITCHEN_SET') {
        const catPrices = PRICELIST_CATALOG.KITCHEN_SET[region]?.[material] || PRICELIST_CATALOG.KITCHEN_SET[region]?.MULTIPLEKS;
        const styleData = catPrices?.[style] || catPrices?.MINIMALIS || { base: 2500000 };
        baseUnitPrice = styleData.base;

        const hasExplicitCabinets = (cabinetBawah !== undefined || cabinetAtas !== undefined);
        const lenBawah = hasExplicitCabinets ? (parseFloat(cabinetBawah) || 0) : 0;
        const lenAtas = hasExplicitCabinets ? (parseFloat(cabinetAtas) || 0) : 0;

        if (hasExplicitCabinets && (lenBawah > 0 || lenAtas > 0)) {
            // 1a. Cabinet Bawah
            if (lenBawah > 0) {
                if ((isKusenBawahOnly || pintuKusen) && styleData.kusen) {
                    const kusenCost = Math.round(lenBawah * styleData.kusen);
                    subtotal += kusenCost;
                    itemBreakdown.push({
                        label: `Cabinet Bawah (Pintu Kusen Meja Cor)`,
                        amount: kusenCost,
                        detail: `${lenBawah}m' x Rp ${styleData.kusen.toLocaleString('id-ID')}`
                    });
                } else {
                    const costBawah = Math.round(lenBawah * baseUnitPrice);
                    subtotal += costBawah;
                    itemBreakdown.push({
                        label: `Cabinet Bawah (${material} ${style})`,
                        amount: costBawah,
                        detail: `${lenBawah}m' x Rp ${baseUnitPrice.toLocaleString('id-ID')}`
                    });
                }
            }

            // 1b. Cabinet Atas
            if (lenAtas > 0) {
                const costAtas = Math.round(lenAtas * baseUnitPrice);
                subtotal += costAtas;
                itemBreakdown.push({
                    label: `Cabinet Atas (${material} ${style})`,
                    amount: costAtas,
                    detail: `${lenAtas}m' x Rp ${baseUnitPrice.toLocaleString('id-ID')}`
                });

                // Kabinet Atas Plafon Tingkat 2
                if (plafonOption === 'lt_50' && styleData.plafonLt50) {
                    const plafonCost = Math.round(lenAtas * styleData.plafonLt50);
                    subtotal += plafonCost;
                    itemBreakdown.push({
                        label: 'Kabinet Plafon Tingkat 2 (T < 50cm)',
                        amount: plafonCost,
                        detail: `${lenAtas}m' x Rp ${styleData.plafonLt50.toLocaleString('id-ID')}`
                    });
                } else if (plafonOption === '50_to_70' && styleData.plafon50to70) {
                    const plafonCost = Math.round(lenAtas * styleData.plafon50to70);
                    subtotal += plafonCost;
                    itemBreakdown.push({
                        label: 'Kabinet Plafon Tingkat 2 (T 50-70cm)',
                        amount: plafonCost,
                        detail: `${lenAtas}m' x Rp ${styleData.plafon50to70.toLocaleString('id-ID')}`
                    });
                }
            }
        } else {
            // Fallback backward-compatible: single panjang P
            subtotal = Math.round(numP * baseUnitPrice);
            formulaText = `${numP}m x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: `Kitchen Set (${material} ${style})`, amount: subtotal, detail: formulaText });

            // Kabinet Atas Full Plafon
            if (plafonOption === 'lt_50' && styleData.plafonLt50) {
                const plafonCost = Math.round(numP * styleData.plafonLt50);
                subtotal += plafonCost;
                itemBreakdown.push({ label: 'Kabinet Plafon Tingkat 2 (T < 50cm)', amount: plafonCost, detail: `${numP}m x Rp ${styleData.plafonLt50.toLocaleString('id-ID')}` });
            } else if (plafonOption === '50_to_70' && styleData.plafon50to70) {
                const plafonCost = Math.round(numP * styleData.plafon50to70);
                subtotal += plafonCost;
                itemBreakdown.push({ label: 'Kabinet Plafon Tingkat 2 (T 50-70cm)', amount: plafonCost, detail: `${numP}m x Rp ${styleData.plafon50to70.toLocaleString('id-ID')}` });
            }

            // Pintu Kusen
            if (pintuKusen && styleData.kusen) {
                const kusenCost = Math.round(numP * styleData.kusen);
                subtotal += kusenCost;
                itemBreakdown.push({ label: 'Pintu Kusen Bawah', amount: kusenCost, detail: `${numP}m x Rp ${styleData.kusen.toLocaleString('id-ID')}` });
            }
        }
    }

    // 2. LEMARI BAWAH TANGGA
    else if (category === 'LEMARI_BAWAH_TANGGA') {
        const catPrices = PRICELIST_CATALOG.LEMARI_BAWAH_TANGGA[region]?.[material] || PRICELIST_CATALOG.LEMARI_BAWAH_TANGGA[region]?.MULTIPLEKS;
        baseUnitPrice = catPrices?.[style] || catPrices?.MINIMALIS || 2500000;
        
        if (bawahTanggaKedalamanGt60) {
            subtotal = Math.round(numP * numT * baseUnitPrice);
            formulaText = `${numP}m x ${numT}m x Rp ${baseUnitPrice.toLocaleString('id-ID')} (Kedalaman > 60cm)`;
        } else {
            subtotal = Math.round(numP * numT * 0.8 * baseUnitPrice);
            formulaText = `${numP}m x ${numT}m x 0.8 x Rp ${baseUnitPrice.toLocaleString('id-ID')} (Kedalaman standar 60cm)`;
        }
        itemBreakdown.push({ label: `Lemari Bawah Tangga (${material} ${style})`, amount: subtotal, detail: formulaText });
    }

    // 3. LEMARI WARDROBE
    else if (category === 'LEMARI_WARDROBE') {
        const catPrices = PRICELIST_CATALOG.LEMARI_WARDROBE[region]?.[material] || PRICELIST_CATALOG.LEMARI_WARDROBE[region]?.MULTIPLEKS;
        baseUnitPrice = catPrices?.[style] || catPrices?.MINIMALIS || 2500000;
        const luasM2 = numP * numT;
        subtotal = luasM2 * baseUnitPrice;
        formulaText = `${numP}m x ${numT}m (${luasM2.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
        itemBreakdown.push({ label: `Lemari Wardrobe (${material} ${style})`, amount: subtotal, detail: formulaText });

        // Add-on Pintu Kaca
        if (pintuKaca !== 'none') {
            const kacaPrices = PRICELIST_CATALOG.LEMARI_WARDROBE[region]?.PINTU_KACA || {};
            const kacaRate = kacaPrices[pintuKaca] || 0;
            if (kacaRate > 0) {
                const kacaCost = luasM2 * kacaRate;
                subtotal += kacaCost;
                itemBreakdown.push({ label: `Add-on Pintu Kaca (${pintuKaca})`, amount: kacaCost, detail: `${luasM2.toFixed(2)} m2 x Rp ${kacaRate.toLocaleString('id-ID')}` });
            }
        }
    }

    // 4. BACKDROP TV
    else if (category === 'BACKDROP_TV') {
        const catPrices = PRICELIST_CATALOG.BACKDROP_TV[region]?.[material] || PRICELIST_CATALOG.BACKDROP_TV[region]?.MULTIPLEKS;
        baseUnitPrice = catPrices?.[style] || catPrices?.MINIMALIS || 2300000;
        const luasM2 = numP * numT;
        subtotal = luasM2 * baseUnitPrice;
        formulaText = `${numP}m x ${numT}m (${luasM2.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
        itemBreakdown.push({ label: `Backdrop TV (${material} ${style})`, amount: subtotal, detail: formulaText });
    }

    // 5. MINI BAR / MEJA ISLAND
    else if (category === 'MINIBAR_ISLAND') {
        const catPrices = PRICELIST_CATALOG.MINIBAR_ISLAND[region]?.[material] || PRICELIST_CATALOG.MINIBAR_ISLAND[region]?.MULTIPLEKS;
        baseUnitPrice = catPrices?.[style] || catPrices?.MINIMALIS || 2500000;
        // Formula: P : 0.6 x Harga
        const unitSlots = numP / 0.6;
        subtotal = unitSlots * baseUnitPrice;
        formulaText = `(Panjang ${numP}m / 0.6 = ${unitSlots.toFixed(2)} unit) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
        itemBreakdown.push({ label: `Mini Bar / Meja Island (${material} ${style})`, amount: subtotal, detail: formulaText });
    }

    // 6. DIPAN & HEADBOARD
    else if (category === 'DIPAN_HEADBOARD') {
        const isBlockboard = material === 'BLOCKBOARD';
        baseUnitPrice = isBlockboard 
            ? (PRICELIST_CATALOG.DIPAN_HEADBOARD[region]?.DIPAN_BLOCKBOARD_HPL || 2100000)
            : (style === 'DUCO' ? (PRICELIST_CATALOG.DIPAN_HEADBOARD[region]?.DIPAN_MULTIPLEK_DUCO || 3100000) : (PRICELIST_CATALOG.DIPAN_HEADBOARD[region]?.DIPAN_MULTIPLEK_HPL || 2500000));
        
        const luasDipan = numP * numL;
        subtotal = luasDipan * baseUnitPrice;
        formulaText = `${numP}m x ${numL}m (${luasDipan.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
        itemBreakdown.push({ label: `Dipan Ranjang (${material})`, amount: subtotal, detail: formulaText });

        // Headboard
        if (headboardOption !== 'none') {
            const hbPrices = PRICELIST_CATALOG.DIPAN_HEADBOARD[region]?.HEADBOARD || {};
            const hbRate = hbPrices[headboardOption] || 1600000;
            const hbCost = numP * hbRate;
            subtotal += hbCost;
            itemBreakdown.push({ label: `Headboard (${headboardOption})`, amount: hbCost, detail: `${numP}m x Rp ${hbRate.toLocaleString('id-ID')}` });
        }
    }

    // 7. RANGKA DIPAN TINGKAT
    else if (category === 'RANGKA_DIPAN_TINGKAT') {
        const sizeKey = rangkaDipanTingkat !== 'none' ? rangkaDipanTingkat : '160x200';
        baseUnitPrice = PRICELIST_CATALOG.RANGKA_DIPAN_TINGKAT[region]?.[sizeKey] || 2750000;
        subtotal = baseUnitPrice;
        formulaText = `1 Unit Rangka Besi Hollow Lapis HPL (${sizeKey})`;
        itemBreakdown.push({ label: `Rangka Dipan Tingkat (${sizeKey})`, amount: subtotal, detail: formulaText });
    }

    // 8. CRADIENZA
    else if (category === 'CRADIENZA') {
        const catPrices = PRICELIST_CATALOG.CRADIENZA.all_regions[material] || PRICELIST_CATALOG.CRADIENZA.all_regions.MULTIPLEKS;
        baseUnitPrice = catPrices?.[style] || catPrices?.MINIMALIS || 2100000;
        subtotal = numP * baseUnitPrice;
        formulaText = `${numP}m x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
        itemBreakdown.push({ label: `Cradienza (${material} ${style})`, amount: subtotal, detail: formulaText });
    }

    // 9. WALLPANEL & KACA
    else if (category === 'WALLPANEL_KACA') {
        const luasM2 = numP * numT;
        if (material === 'KACA_BEVEL') {
            baseUnitPrice = PRICELIST_CATALOG.WALLPANEL_KACA.all_regions.KACA_BEVEL.CERMIN_BIASA;
            subtotal = luasM2 * baseUnitPrice;
            formulaText = `${numP}m x ${numT}m (${luasM2.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: 'Cermin Bevel Biasa', amount: subtotal, detail: formulaText });
        } else {
            const catPrices = PRICELIST_CATALOG.WALLPANEL_KACA.all_regions.WALLPANEL_MULTIPLEK;
            baseUnitPrice = catPrices?.[style] || catPrices?.MINIMALIS || 1350000;
            subtotal = luasM2 * baseUnitPrice;
            formulaText = `${numP}m x ${numT}m (${luasM2.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: `Wallpanel Multiplek (${style})`, amount: subtotal, detail: formulaText });
        }
    }

    // 10. SOFA
    else if (category === 'SOFA') {
        baseUnitPrice = style === 'KLASIK' ? PRICELIST_CATALOG.SOFA.all_regions.KLASIK : PRICELIST_CATALOG.SOFA.all_regions.MINIMALIS;
        const seatSlots = numP / 0.60;
        subtotal = seatSlots * baseUnitPrice;
        formulaText = `(Panjang ${numP}m / 0.60 = ${seatSlots.toFixed(2)} seat) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
        itemBreakdown.push({ label: `Sofa (${style})`, amount: subtotal, detail: formulaText });

        if (sofaCover !== 'standard') {
            const coverRate = PRICELIST_CATALOG.SOFA.all_regions.COVER_ADDON[sofaCover] || 0;
            const coverCost = numP * coverRate;
            subtotal += coverCost;
            itemBreakdown.push({ label: `Upgrade Cover Sofa (${sofaCover})`, amount: coverCost, detail: `${numP}m x Rp ${coverRate.toLocaleString('id-ID')}` });
        }
    }

    // Tambahan Finishing HPL Luar & Dalam jika dipilih
    const hasExplicitCabinets = (category === 'KITCHEN_SET' && (cabinetBawah !== undefined || cabinetAtas !== undefined));
    const hplBaseLength = hasExplicitCabinets
        ? ((parseFloat(cabinetBawah) || 0) + (parseFloat(cabinetAtas) || 0))
        : numP;

    if (isHplLuarDalam && hplBaseLength > 0) {
        const hplCost = Math.round(hplBaseLength * rules.finishingHplLuarDalamPerMeter);
        subtotal += hplCost;
        itemBreakdown.push({
            label: 'Finishing HPL Luar & Dalam',
            amount: hplCost,
            detail: `${hplBaseLength}m' x Rp ${rules.finishingHplLuarDalamPerMeter.toLocaleString('id-ID')}`
        });
    }

    // Custom Addons
    if (customAddons > 0) {
        subtotal += customAddons;
        itemBreakdown.push({ label: 'Aksesoris Tambahan', amount: customAddons, detail: 'Input Manual Admin' });
    }

    // Perhitungan Ongkir Berdasarkan Minimum Nilai Proyek
    subtotal = Math.round(subtotal);
    const isFreeOngkir = subtotal >= rules.minFreeOngkir;
    const ongkirCost = isFreeOngkir ? 0 : rules.ongkirUnderMin;
    const grandTotal = Math.round(subtotal + ongkirCost);

    return {
        region,
        regionLabel: rules.areaLabel,
        category,
        material,
        style,
        dimensions: {
            p: numP,
            t: numT,
            l: numL,
            cabinetBawah: (cabinetBawah !== undefined) ? (parseFloat(cabinetBawah) || 0) : undefined,
            cabinetAtas: (cabinetAtas !== undefined) ? (parseFloat(cabinetAtas) || 0) : undefined
        },
        subtotal,
        isFreeOngkir,
        ongkirCost,
        minFreeOngkir: rules.minFreeOngkir,
        grandTotal,
        itemBreakdown
    };
};

/**
 * Format hasil estimasi ke teks pesan WhatsApp siap kirim
 */
export const formatEstimateForWhatsApp = (estimate, brandName = 'PUTRA INTERIOR') => {
    if (!estimate) return '';

    let dimText = `P: ${estimate.dimensions.p}m ${estimate.dimensions.t > 0 ? `| T: ${estimate.dimensions.t}m` : ''} ${estimate.dimensions.l > 0 ? `| L: ${estimate.dimensions.l}m` : ''}`.trim();
    if (estimate.category === 'KITCHEN_SET' && (estimate.dimensions.cabinetBawah !== undefined || estimate.dimensions.cabinetAtas !== undefined)) {
        dimText = `Cabinet Bawah: ${estimate.dimensions.cabinetBawah || 0}m' | Cabinet Atas: ${estimate.dimensions.cabinetAtas || 0}m'`;
    }

    const lines = [
        `Halo Kak! Berikut rincian simulasi estimasi biaya interior dari *${brandName}*:`,
        '',
        `📍 *Wilayah:* ${estimate.regionLabel}`,
        `🛠️ *Spesifikasi:* ${estimate.category.replace(/_/g, ' ')} (${estimate.material} - ${estimate.style})`,
        `📐 *Ukuran:* ${dimText}`,
        '',
        `📝 *Rincian Estimasi Biaya:*`
    ];

    estimate.itemBreakdown.forEach((item, idx) => {
        lines.push(`${idx + 1}. *${item.label}:* Rp ${item.amount.toLocaleString('id-ID')}`);
        if (item.detail) {
            lines.push(`   └ _(${item.detail})_`);
        }
    });

    lines.push('');
    lines.push(`💰 *Subtotal Produksi:* Rp ${estimate.subtotal.toLocaleString('id-ID')}`);

    if (estimate.isFreeOngkir) {
        lines.push(`🚚 *Ongkos Kirim & Instalasi:* *GRATIS* (Memenuhi minimum order Rp ${(estimate.minFreeOngkir / 1000000).toFixed(0)}jt)`);
    } else {
        lines.push(`🚚 *Ongkos Kirim:* Rp ${estimate.ongkirCost.toLocaleString('id-ID')} _(Order di bawah Rp ${(estimate.minFreeOngkir / 1000000).toFixed(0)}jt)_`);
    }

    lines.push('');
    lines.push(`⭐ *TOTAL ESTIMASI RAB:* *Rp ${estimate.grandTotal.toLocaleString('id-ID')}*`);
    lines.push('');
    lines.push(`✨ *Catatan Layanan:*`);
    lines.push(`- Konsultasi, survei ukur lokasi, dan pembuatan desain 3D *100% GRATIS* tanpa komitmen.`);
    lines.push(`- Angka di atas merupakan estimasi awal transparan; nilai akhir presisi akan disesuaikan setelah pengukuran fisik di lokasi.`);
    lines.push('');
    lines.push(`Kira-kira apakah Kakak berkenan untuk kami jadwalkan survei pengukuran gratis ke lokasi di akhir pekan ini? 😊`);

    return lines.join('\n');
};
