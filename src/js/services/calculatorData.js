// File: src/js/services/calculatorData.js

/**
 * MASTER PRICELIST & ESTIMATOR DATA 2026
 * Diambil langsung dari Dokumen Resmi PUTRA CORPORATION:
 * - PL DK: Price List Dalam Kota (Bandung & Tasikmalaya)
 * - PL LK: Price List Luar Kota (Jabodetabek, Pantura, Jatim & Jateng)
 * - PL INT SVY: Standar Rumus Perhitungan & SOP Pengukuran
 * 
 * Pengelompokan Item Terpadu Sesuai File:
 * 1. Area Kitchen Set (Kabinet Dapur, Meja Cor, Top Table, Backsplash, Mini Bar, Topi Bar, Box Elektronik, Hambalan)
 * 2. Area Kamar Set (Lemari Wardrobe, Dipan Ranjang, Headboard, Nakas, Rangka Dipan Tingkat, Meja Rias)
 * 3. Area Living Room (Backdrop TV, Lemari Bawah Tangga, Cradienza, Partisi Sekat, Bench, Wallpanel & Sofa)
 * 4. Sipil & Bengkel Las (Canopi Spandek/Alderon, Pagar Wire Mesh, Cor Meja Beton & Jasa Sipil)
 */

export const ESTIMATOR_CATEGORIES = [
    { 
        id: 'KITCHEN_SET', 
        name: 'Area Kitchen Set', 
        icon: '🍳', 
        unit: 'All-in-One Dapur',
        description: 'Kabinet Dapur, Meja Cor, Top Table, Backsplash, Mini Bar, Topi Bar, Box Elektronik & Hambalan' 
    },
    { 
        id: 'KAMAR_SET', 
        name: 'Area Kamar Set', 
        icon: '🛏️', 
        unit: 'Master Bedroom',
        description: 'Lemari Wardrobe, Dipan Ranjang, Headboard, Nakas, Rangka Dipan Tingkat & Meja Rias' 
    },
    { 
        id: 'LIVING_ROOM', 
        name: 'Area Living Room', 
        icon: '📺', 
        unit: 'Ruang Keluarga & Tamu',
        description: 'Backdrop TV, Lemari Bawah Tangga, Cradienza, Partisi Sekat, Bench, Wallpanel & Sofa Custom' 
    },
    { 
        id: 'SIPIL_BENGKEL', 
        name: 'Sipil & Bengkel Las', 
        icon: '🏗️', 
        unit: 'Eksterior & Sipil',
        description: 'Canopi Spandek/Alderon, Pagar Wire Mesh/Hollow, Cor Meja Beton & Jasa Bongkaran' 
    }
];

export const KAMAR_SET_ITEMS = [
    { id: 'LEMARI_WARDROBE', name: 'Lemari Pakaian / Wardrobe', unit: 'P x T (m2)', icon: '🚪' },
    { id: 'DIPAN_HEADBOARD', name: 'Dipan Ranjang & Headboard', unit: 'P x L (m2)', icon: '🛏️' },
    { id: 'RANGKA_DIPAN_TINGKAT', name: 'Penambahan Rangka Dipan Tingkat', unit: 'Unit', icon: '🪜' },
    { id: 'MEJA_RIAS', name: 'Meja Rias', unit: 'P (meter)', icon: '🪞' }
];

export const LIVING_ROOM_ITEMS = [
    { id: 'BACKDROP_TV', name: 'Backdrop TV', unit: 'P x T (m2)', icon: '📺' },
    { id: 'LEMARI_BAWAH_TANGGA', name: 'Lemari Bawah Tangga', unit: 'P x T x 0.8', icon: '📐' },
    { id: 'CRADIENZA', name: 'Cradienza / Kredensa', unit: 'P (meter)', icon: '🗄️' },
    { id: 'PARTISI_BENCH', name: 'Partisi & Sekat Ruangan', unit: 'P x T (m2)', icon: '🚪' },
    { id: 'BENCH', name: 'Bench / Bangku Duduk', unit: 'P (meter)', icon: '🛋️' },
    { id: 'WALLPANEL_KACA', name: 'Wallpanel & Cermin Bevel / WPC', unit: 'P x T (m2)', icon: '🪞' },
    { id: 'SOFA', name: 'Sofa Custom', unit: 'P : 0.60', icon: '🛋️' }
];

export const SIPIL_BENGKEL_ITEMS = [
    { id: 'CANOPI', name: 'Canopi (Spandek / Alderon / Kaca)', unit: 'P x L (m2)', icon: '🏠' },
    { id: 'PAGAR', name: 'Pagar & Railing (Wire Mesh / Hollow)', unit: 'P x T (m2)', icon: '🛡️' },
    { id: 'JASA_SIPIL', name: 'Jasa Sipil & Bongkaran', unit: 'Borongan / Titik', icon: '🔨' }
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
            },
            PVC: {
                MINIMALIS: { base: 4000000, plafonLt50: 3800000, plafon50to70: 4000000, kusen: 1650000 },
                SEMI_KLASIK: { base: 4500000, plafonLt50: 4300000, plafon50to70: 4500000, kusen: 1850000 },
                KLASIK: { base: 4800000, plafonLt50: 4500000, plafon50to70: 4700000, kusen: 1850000 }
            },
            ALUMUNIUM: {
                SINGLE_LAYER: { base: 4000000, plafonLt50: 3800000, plafon50to70: 4000000, kusen: 1750000 },
                DOUBLE_LAYER: { base: 5500000, plafonLt50: 5200000, plafon50to70: 5500000, kusen: 2150000 },
                MINIMALIS: { base: 4000000, plafonLt50: 3800000, plafon50to70: 4000000, kusen: 1750000 },
                SEMI_KLASIK: { base: 5500000, plafonLt50: 5200000, plafon50to70: 5500000, kusen: 2150000 },
                KLASIK: { base: 5500000, plafonLt50: 5200000, plafon50to70: 5500000, kusen: 2150000 }
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
            },
            PVC: {
                MINIMALIS: { base: 4100000, plafonLt50: 3800000, plafon50to70: 4000000, kusen: 1650000 },
                SEMI_KLASIK: { base: 4500000, plafonLt50: 4300000, plafon50to70: 4500000, kusen: 1850000 },
                KLASIK: { base: 4800000, plafonLt50: 4500000, plafon50to70: 4700000, kusen: 1850000 }
            },
            ALUMUNIUM: {
                SINGLE_LAYER: { base: 4000000, plafonLt50: 3800000, plafon50to70: 4000000, kusen: 1750000 },
                DOUBLE_LAYER: { base: 5500000, plafonLt50: 5200000, plafon50to70: 5500000, kusen: 2150000 },
                MINIMALIS: { base: 4000000, plafonLt50: 3800000, plafon50to70: 4000000, kusen: 1750000 },
                SEMI_KLASIK: { base: 5500000, plafonLt50: 5200000, plafon50to70: 5500000, kusen: 2150000 },
                KLASIK: { base: 5500000, plafonLt50: 5200000, plafon50to70: 5500000, kusen: 2150000 },
                LUXURY_FRAMELESS: { base: 5500000, kusen: 2150000 }
            }
        }
    },

    // ----------------------------------------------------
    // 2. MINI BAR / MEJA ISLAND (Page 7 & 10)
    // Formula: P : 0.6 x Harga
    // ----------------------------------------------------
    MINIBAR_ISLAND: {
        dalam_kota: {
            BLOCKBOARD: { MINIMALIS: 2100000, SEMI_KLASIK: 2500000, KLASIK: 2500000, INDUSTRIAL: 2100000, RANGKA_BESI: 1800000, RANGKA_WIREMESH: 2000000 },
            MULTIPLEKS: { MINIMALIS: 2500000, SEMI_KLASIK: 2700000, KLASIK: 2700000, INDUSTRIAL: 2500000, RANGKA_BESI: 1800000, RANGKA_WIREMESH: 2000000 },
            ALUMUNIUM: { SINGLE_LAYER: 4000000, DOUBLE_LAYER: 5500000, MINIMALIS: 4000000, SEMI_KLASIK: 5500000, KLASIK: 5500000 }
        },
        luar_kota: {
            BLOCKBOARD: { MINIMALIS: 2300000, SEMI_KLASIK: 2700000, KLASIK: 2700000, INDUSTRIAL: 2300000, RANGKA_BESI: 2100000, RANGKA_WIREMESH: 2300000 },
            MULTIPLEKS: { MINIMALIS: 2500000, SEMI_KLASIK: 2700000, KLASIK: 2700000, INDUSTRIAL: 2500000, RANGKA_BESI: 2100000, RANGKA_WIREMESH: 2300000 },
            ALUMUNIUM: { SINGLE_LAYER: 4000000, DOUBLE_LAYER: 5500000, MINIMALIS: 4000000, SEMI_KLASIK: 5500000, KLASIK: 5500000 }
        }
    },

    // ----------------------------------------------------
    // 3. TOPI BAR, BOX ELEKTRONIK & HAMBALAN (Page 8 & 9)
    // ----------------------------------------------------
    TOPI_BOX_HAMBALAN: {
        dalam_kota: {
            TOPI_BAR: { BLOCKBOARD: 1250000, MULTIPLEK: 1450000, DUCO: 2100000 },
            BOX_ELEKTRONIK_ADDON: 100000, // Harga material dasar kitchen set + Rp 100.000
            BOX_ELEKTRONIK_BLOCKBOARD: { LT_1M: 2100000, GT_1M: 2200000 },
            BOX_ELEKTRONIK_MULTIPLEKS: { LT_1M: 2600000, GT_1M: 2700000 },
            HAMBALAN_PER_METER: 650000,
            HAMBALAN: { DENGAN_LAMPU: 650000, TANPA_LAMPU: 650000, PER_METER: 650000 }
        },
        luar_kota: {
            TOPI_BAR: { BLOCKBOARD: 1350000, MULTIPLEK: 1450000, DUCO: 2100000 },
            BOX_ELEKTRONIK_ADDON: 100000,
            BOX_ELEKTRONIK_BLOCKBOARD: { LT_1M: 2400000, GT_1M: 2500000 },
            BOX_ELEKTRONIK_MULTIPLEKS: { LT_1M: 2700000, GT_1M: 2800000 },
            HAMBALAN_PER_METER: 650000,
            HAMBALAN: { DENGAN_LAMPU: 650000, TANPA_LAMPU: 650000, PER_METER: 650000 }
        }
    },

    // ----------------------------------------------------
    // 4. LEMARI / WARDROBE (Page 15 & 16)
    // Formula: P x T x Harga (Standar Kedalaman 60cm)
    // ----------------------------------------------------
    LEMARI_WARDROBE: {
        dalam_kota: {
            BLOCKBOARD: { MINIMALIS: 2300000, SEMI_KLASIK: 2700000, KLASIK: 2950000 },
            MULTIPLEKS: { MINIMALIS: 2500000, SEMI_KLASIK: 2750000, KLASIK: 3000000 },
            DUCO: { MINIMALIS: 4800000, SEMI_KLASIK: 5300000, KLASIK: 6300000 },
            ALUMUNIUM: { SINGLE_LAYER: 4000000, DOUBLE_LAYER: 5500000, MINIMALIS: 4000000, SEMI_KLASIK: 5500000, KLASIK: 5500000 },
            PINTU_KACA: { KACA_POLOS: 650000, KACA_RIBEN: 1250000, CERMIN_BIASA: 750000, CERMIN_BRONZE_GREY: 1850000 }
        },
        luar_kota: {
            BLOCKBOARD: { MINIMALIS: 2400000, SEMI_KLASIK: 2800000, KLASIK: 3050000 },
            MULTIPLEKS: { MINIMALIS: 2600000, SEMI_KLASIK: 2850000, KLASIK: 3100000 },
            DUCO: { MINIMALIS: 4800000, SEMI_KLASIK: 5300000, KLASIK: 6300000 },
            ALUMUNIUM: { SINGLE_LAYER: 4000000, DOUBLE_LAYER: 5500000, MINIMALIS: 4000000, SEMI_KLASIK: 5500000, KLASIK: 5500000 },
            PINTU_KACA: { KACA_POLOS: 750000, KACA_RIBEN: 1250000, CERMIN_BIASA: 850000, CERMIN_BRONZE_GREY: 1850000 }
        }
    },

    // ----------------------------------------------------
    // 5. DIPAN, HEADBOARD & NAKAS (Page 11 & 14)
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
    // 6. PENAMBAHAN RANGKA DIPAN TINGKAT (Page 12 & 13)
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
    // 7. MEJA RIAS (Page 16)
    // Formula: P x Harga (Standar Kedalaman 60cm + Kaca)
    // ----------------------------------------------------
    MEJA_RIAS: {
        dalam_kota: {
            BLOCKBOARD: { MINIMALIS: 1900000, SEMI_KLASIK: 2200000, KLASIK: 2400000 },
            MULTIPLEKS: { MINIMALIS: 2100000, SEMI_KLASIK: 2450000, KLASIK: 2600000 }
        },
        luar_kota: {
            BLOCKBOARD: { MINIMALIS: 1900000, SEMI_KLASIK: 2200000, KLASIK: 2400000 },
            MULTIPLEKS: { MINIMALIS: 2100000, SEMI_KLASIK: 2450000, KLASIK: 2600000 }
        }
    },

    // ----------------------------------------------------
    // 8. BACKDROP TV (Page 17 & 18)
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
    // 9. LEMARI BAWAH TANGGA (Page 22 & 23)
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
    // 10. CRADIENZA / KREDENSA (Page 19)
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
    // 11. PARTISI & BENCH (Page 21)
    // ----------------------------------------------------
    PARTISI_BENCH: {
        dalam_kota: {
            PARTISI_BLOCKBOARD: 2100000, // P x T
            PARTISI_MULTIPLEK_MINIMALIS: 2400000,
            PARTISI_MULTIPLEK_DUCO: 4500000,
            BENCH_BLOCKBOARD: 2000000, // P x Harga
            BENCH_MULTIPLEK: 2200000,
            BUSA_STANDARD: 650000
        },
        luar_kota: {
            PARTISI_BLOCKBOARD: 2200000,
            PARTISI_MULTIPLEK_MINIMALIS: 2400000,
            PARTISI_MULTIPLEK_DUCO: 4500000,
            BENCH_BLOCKBOARD: 2100000,
            BENCH_MULTIPLEK: 2300000,
            BUSA_STANDARD: 650000
        }
    },

    // ----------------------------------------------------
    // 12. WALLPANEL & KACA CERMIN BEVEL (Page 20)
    // Formula: P x T x Harga
    // ----------------------------------------------------
    WALLPANEL_KACA: {
        all_regions: {
            WALLPANEL_MULTIPLEK: { MINIMALIS: 1350000, SEMI_KLASIK: 1500000, KLASIK: 1650000, DUCO: 2750000 },
            KACA_BEVEL: { CERMIN_BIASA: 1850000, CERMIN_BRONZE_GREY: 1950000 },
            WPC_PANEL: { dalam_kota: 850000, luar_kota: 950000 }
        }
    },

    // ----------------------------------------------------
    // 13. SOFA (Page 24)
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
    },

    // ----------------------------------------------------
    // 14. CANOPI & PAGAR (Sipil & Bengkel Las)
    // ----------------------------------------------------
    SIPIL_BENGKEL: {
        CANOPI: {
            HOLO_4X4_SPANDEK: { label: 'Hollow 4x4 Atap Spandek', price: 1200000 },
            HOLO_4X6_SPANDEK: { label: 'Hollow 4x6 Atap Spandek', price: 1400000 },
            HOLO_4X4_ALDERON: { label: 'Hollow 4x4 Atap Alderon 2 Layer', price: 1600000 },
            HOLO_4X6_ALDERON: { label: 'Hollow 4x6 Atap Alderon 2 Layer', price: 1800000 },
            BAJA_RINGAN_SPANDEK: { label: 'Baja Ringan Atap Spandek', price: 750000 },
            ATAP_KACA: { label: 'Atap Kaca Tempered Solid', price: 2800000 }
        },
        PAGAR: {
            MINIMALIS: { label: 'Pagar Besi Minimalis', price: 1800000 },
            MODERN_MINIMALIS: { label: 'Pagar Modern Minimalis', price: 2100000 },
            MODERN_CLASSIC: { label: 'Pagar Modern Classic Profil', price: 2400000 },
            WIRE_MESH: { label: 'Pagar & Railing Wire Mesh Jaring', price: 1800000 }
        },
        JASA_SIPIL: {
            dalam_kota: {
                COR_MEJA_DAPUR: { label: 'Bikin Meja Cor Dapur (Jasa Borong)', price: 2400000, unit: 'm\'' },
                BOBOK_KOMPOR_SINK: { label: 'Bobok Lubang Kompor / Sink', price: 500000, unit: 'lubang' },
                PINDAH_TITIK_AIR: { label: 'Pindah Titik Air Bersih/Kotor', price: 750000, unit: 'titik' },
                PINDAH_TITIK_LISTRIK: { label: 'Pindah Titik Saklar / Stop Kontak', price: 650000, unit: 'titik' },
                PENGECATAN: { label: 'Pengecatan Tembok (Jasa Borong)', price: 200000, unit: 'm2' },
                BONGKAR_CORAN: { label: 'Bongkar Coran Beton (1-2m)', price: 1000000, unit: 'paket' },
                BONGKAR_KABINET: { label: 'Bongkar Kitchenset Lama (2-4m)', price: 1250000, unit: 'paket' }
            },
            luar_kota: {
                COR_MEJA_DAPUR: { label: 'Bikin Meja Cor Dapur (Finishing Keramik)', price: 2400000, unit: 'm\'' },
                BOBOK_KOMPOR_SINK: { label: 'Bobok Lubang Kompor / Sink', price: 750000, unit: 'lubang' },
                PINDAH_TITIK_AIR: { label: 'Pindah Titik Air Bersih/Kotor', price: 450000, unit: 'm\'' },
                PINDAH_TITIK_LISTRIK: { label: 'Pindah Titik Saklar / Stop Kontak', price: 650000, unit: 'm\'' },
                PENGECATAN: { label: 'Pengecatan Tembok (Jasa Borong)', price: 1250000, unit: 'm2' },
                BONGKAR_CORAN: { label: 'Bongkar Coran Beton (0-5m)', price: 1750000, unit: 'paket' },
                BONGKAR_KABINET: { label: 'Bongkar Kitchenset Lama (0-3m)', price: 2000000, unit: 'paket' }
            }
        }
    }
};

/**
 * ATURAN PROYEK MINIMUM & ONGKIR RESMI:
 * - PL DK (Dalam Kota: Bandung & Tasikmalaya):
 *   Project < Rp 10.000.000 -> Ongkir Rp 500.000,- & penambahan biaya Rak Bumbu/Piring
 *   Project >= Rp 10.000.000 -> Gratis Ongkir Bandung & Tasikmalaya
 * - PL LK (Luar Kota: Jabodetabek, Pantura, Jatim, Jateng):
 *   Project < Rp 15.000.000 -> Ongkir Rp 500.000,-
 *   Project >= Rp 15.000.000 -> Gratis Ongkir Jabodetabek & sekitarnya
 * - Finishing HPL Luar & Dalam: Tambahan Rp 700.000,- / meter
 */
export const PROJECT_RULES = {
    dalam_kota: {
        minFreeOngkir: 10000000,
        ongkirUnderMin: 500000,
        finishingHplLuarDalamPerMeter: 700000,
        areaLabel: 'PL DK (Bandung & Tasikmalaya - Dalam Kota)'
    },
    luar_kota: {
        minFreeOngkir: 15000000,
        ongkirUnderMin: 500000,
        finishingHplLuarDalamPerMeter: 700000,
        areaLabel: 'PL LK (Jabodetabek, Pantura, Jateng & Jatim - Luar Kota)'
    }
};

/**
 * DAFTAR HARGA TOP TABLE & BACKSPLASH RESMI
 */
export const TOP_TABLE_PRICES = {
    AICA: { id: 'AICA', label: 'Aica (HPL / Solid Surface)', price: 1400000, desc: 'Higienis, tahan gores & mudah dibersihkan' },
    QUADRA: { id: 'QUADRA', label: 'Quadra Sintered Stone', price: 2300000, desc: 'Batu sinter mewah, tahan panas & anti noda' },
    GRANIT: { id: 'GRANIT', label: 'Granit Alam / Nero', price: 2800000, desc: 'Batu alam solid premium berkelas & kokoh' }
};

export const BACKSPLASH_PRICES = {
    dalam_kota: {
        AICA: { id: 'AICA', label: 'Aica Splash Panel', price: 1400000, desc: 'Senada dengan solid surface/HPL' },
        QUADRA: { id: 'QUADRA', label: 'Quadra Sintered Stone', price: 2300000, desc: 'Sintered stone mewah seamless' },
        GRANIT: { id: 'GRANIT', label: 'Granit Backsplash', price: 2800000, desc: 'Batu granit alami kokoh & mewah' },
        KERAMIK_BEVEL: { id: 'KERAMIK_BEVEL', label: 'Keramik Bevel / Subway', price: 850000, desc: 'Motif subway tile klasik' },
        MOZAIC: { id: 'MOZAIC', label: 'Mozaik Tile', price: 1100000, desc: 'Mozaik kotak artistik' },
        CERMIN_GREY: { id: 'CERMIN_GREY', label: 'Cermin Bronze / Grey Bevel', price: 1850000, desc: 'Kaca cermin bevel elegan & luas' }
    },
    luar_kota: {
        AICA: { id: 'AICA', label: 'Aica Splash Panel', price: 1400000, desc: 'Senada dengan solid surface/HPL' },
        QUADRA: { id: 'QUADRA', label: 'Quadra Sintered Stone', price: 2300000, desc: 'Sintered stone mewah seamless' },
        GRANIT: { id: 'GRANIT', label: 'Granit Backsplash', price: 2800000, desc: 'Batu granit alami kokoh & mewah' },
        KERAMIK_BEVEL: { id: 'KERAMIK_BEVEL', label: 'Keramik Bevel / Subway', price: 1050000, desc: 'Motif subway tile klasik' },
        MOZAIC: { id: 'MOZAIC', label: 'Mozaik Tile', price: 1500000, desc: 'Mozaik kotak artistik' },
        CERMIN_GREY: { id: 'CERMIN_GREY', label: 'Cermin Bronze / Grey Bevel', price: 1850000, desc: 'Kaca cermin bevel elegan & luas' }
    }
};

/**
 * Mesin kalkulasi estimasi presisi untuk interior sales
 * Sesuai rumus resmi dokumen PL INT SVY, PL DK, dan PL LK
 */
export const calculateEstimate = ({
    region = 'dalam_kota', // 'dalam_kota' (PL DK) | 'luar_kota' (PL LK)
    category = 'KITCHEN_SET', // Master Area atau legacy category
    subItem = undefined, // Sub-item di dalam Kamar Set, Living Room, Sipil/Bengkel
    material = 'MULTIPLEKS', // 'BLOCKBOARD' | 'MULTIPLEKS' | 'DUCO_LUXURY' | 'DUCO' | 'PVC' | 'ALUMUNIUM'
    style = 'MINIMALIS', // 'MINIMALIS' | 'SEMI_KLASIK' | 'KLASIK' | 'INDUSTRIAL'
    p = 3, // Panjang dalam meter
    t = 1, // Tinggi dalam meter
    l = 1, // Lebar dalam meter
    // Kitchen Set Unified:
    cabinetBawah = undefined, // Panjang meter lari kabinet bawah
    cabinetAtas = undefined,  // Panjang meter lari kabinet atas
    isKusenBawahOnly = false, // Jika kabinet bawah hanya pintu/kusen cor beton
    topTableOption = 'none', // 'none' | 'AICA' | 'QUADRA' | 'GRANIT'
    topTableLength = undefined, // default mengikuti cabinetBawah
    backsplashOption = 'none', // 'none' | 'AICA' | 'QUADRA' | 'GRANIT' | 'KERAMIK_BEVEL' | 'MOZAIC' | 'CERMIN_GREY'
    backsplashLength = undefined, // default mengikuti cabinetBawah
    miniBarLength = 0, // Panjang Mini Bar / Meja Island (Rumus: P : 0.6 x Harga)
    topiBarLength = 0, // Panjang meter lari topi bar (Rumus: P x Harga)
    boxElektronikType = 'none', // 'none' | 'box_kulkas' | 'LT_1M' | 'GT_1M'
    boxElektronikQty = 0, // jumlah unit box elektronik
    boxP = 0, // Panjang Box (m)
    boxT = 0, // Tinggi Box (m)
    boxQty = 1, // Jumlah unit box kulkas/oven
    hambalanQty = 0, // backward compat
    hambalanLength = 0, // Panjang meter lari hambalan (Rp 650.000/m')
    hambalanType = 'PER_METER', // 'DENGAN_LAMPU' | 'TANPA_LAMPU'
    plafonOption = 'none', // 'none' | 'lt_50' | '50_to_70'
    // Kamar Set Specific:
    pintuKaca = 'none', // 'none' | 'KACA_POLOS' | 'KACA_RIBEN' | 'CERMIN_BIASA' | 'CERMIN_BRONZE_GREY'
    headboardOption = 'none', // 'none' | 'BLOCKBOARD' | 'MULTIPLEKS' | 'BLOCKBOARD_BUSA' | 'MULTIPLEKS_BUSA' | 'SEMI_KLASIK_BLOCKBOARD' | 'SEMI_KLASIK_MULTIPLEKS'
    nakasQty = 0,
    nakasOption = 'none', // 'none' | 'MINIMALIS' | 'SEMI_KLASIK' | 'KLASIK'
    rangkaDipanTingkat = 'none', // 'none' | '90x200' | '100x200' | '120x200' | '160x200' | '180x200' | '200x200'
    // Living Room Specific:
    bawahTanggaKedalamanGt60 = false, // Jika > 60cm dihitung P x T x Harga penuh
    partisiType = 'kisi', // 'kisi' | 'storage'
    benchBusa = false, // +650k / meter
    wallpanelType = 'MULTIPLEK', // 'MULTIPLEK' | 'CERMIN_BEVEL' | 'WPC'
    sofaCover = 'standard', // 'standard' | 'KULIT_OSCAR' | 'KULIT_MBTECH' | 'CORDUROY_PREMIUM'
    // Sipil & Bengkel Specific:
    canopiType = 'HOLO_4X4_SPANDEK',
    pagarType = 'MINIMALIS',
    jasaSipilType = 'COR_MEJA_DAPUR',
    jasaSipilQty = 1,
    // Shared:
    isHplLuarDalam = false,
    pintuKusen = false,
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
    const numMiniBar = parseFloat(miniBarLength) || 0;
    const numTopiBar = parseFloat(topiBarLength) || 0;
    const numBoxP = parseFloat(boxP) || 0;
    const numBoxT = parseFloat(boxT) || 0;
    const numBoxQuantity = parseInt(boxQty, 10) || (parseInt(boxElektronikQty, 10) || 1);
    const numBoxQty = parseInt(boxElektronikQty, 10) || 0;
    const numHambalanLen = (hambalanLength !== undefined && hambalanLength !== null && hambalanLength !== '' && parseFloat(hambalanLength) > 0)
        ? (parseFloat(hambalanLength) || 0)
        : (parseFloat(hambalanQty) || 0);
    const numHambalan = parseInt(hambalanQty, 10) || 0;
    const numNakas = parseInt(nakasQty, 10) || 0;

    // Normalisasi Kategori Utama & Sub-item
    let resolvedCategory = category;
    let resolvedSubItem = subItem;

    if (category === 'KAMAR_SET') {
        resolvedSubItem = subItem || 'LEMARI_WARDROBE';
    } else if (category === 'LIVING_ROOM') {
        resolvedSubItem = subItem || 'BACKDROP_TV';
    } else if (category === 'SIPIL_BENGKEL') {
        resolvedSubItem = subItem || 'CANOPI';
    } else if (['LEMARI_WARDROBE', 'DIPAN_HEADBOARD', 'RANGKA_DIPAN_TINGKAT', 'MEJA_RIAS'].includes(category)) {
        resolvedCategory = 'KAMAR_SET';
        resolvedSubItem = category;
    } else if (['BACKDROP_TV', 'LEMARI_BAWAH_TANGGA', 'CRADIENZA', 'PARTISI_BENCH', 'BENCH', 'WALLPANEL_KACA', 'SOFA'].includes(category)) {
        resolvedCategory = 'LIVING_ROOM';
        resolvedSubItem = category;
    } else if (category === 'MINIBAR_ISLAND') {
        // Mini bar standalone legacy call -> dihitung dengan rumus resmi P : 0.6 x Harga
        resolvedCategory = 'KITCHEN_SET';
    }

    // =========================================================================
    // 1. AREA KITCHEN SET (SATUKAN SEMUANYA: KABINET, TOP TABLE, BACKSPLASH, MINI BAR, TOPI BAR, BOX, HAMBALAN)
    // =========================================================================
    if (resolvedCategory === 'KITCHEN_SET') {
        const catPrices = PRICELIST_CATALOG.KITCHEN_SET[region]?.[material] || PRICELIST_CATALOG.KITCHEN_SET[region]?.MULTIPLEKS;
        let resolvedStyle = style;
        if (material === 'ALUMUNIUM') {
            resolvedStyle = (style === 'DOUBLE_LAYER' || style === 'SEMI_KLASIK' || style === 'KLASIK' || style === 'LUXURY_FRAMELESS') ? 'DOUBLE_LAYER' : 'SINGLE_LAYER';
        }
        const styleData = catPrices?.[resolvedStyle] || catPrices?.[style] || catPrices?.MINIMALIS || { base: 2500000 };
        baseUnitPrice = styleData.base;
        const styleDisplayName = material === 'ALUMUNIUM'
            ? (resolvedStyle === 'DOUBLE_LAYER' ? 'Double Layer' : 'Single Layer')
            : style;

        const hasExplicitCabinets = (cabinetBawah !== undefined || cabinetAtas !== undefined);
        const lenBawah = hasExplicitCabinets ? (parseFloat(cabinetBawah) || 0) : 0;
        const lenAtas = hasExplicitCabinets ? (parseFloat(cabinetAtas) || 0) : 0;

        if (hasExplicitCabinets) {
            // 1a. Cabinet Bawah (m' x Harga)
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
                        label: `Cabinet Bawah (${material} ${styleDisplayName})`,
                        amount: costBawah,
                        detail: `${lenBawah}m' x Rp ${baseUnitPrice.toLocaleString('id-ID')}`
                    });
                }
            }

            // 1b. Cabinet Atas (m' x Harga)
            if (lenAtas > 0) {
                const costAtas = Math.round(lenAtas * baseUnitPrice);
                subtotal += costAtas;
                itemBreakdown.push({
                    label: `Cabinet Atas (${material} ${styleDisplayName})`,
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
        } else if (category === 'MINIBAR_ISLAND') {
            // Standalone Mini bar legacy mode
            const unitSlots = numP / 0.6;
            const barCost = Math.round(unitSlots * baseUnitPrice);
            subtotal += barCost;
            itemBreakdown.push({
                label: `Mini Bar / Meja Island (${material} ${style})`,
                amount: barCost,
                detail: `(Panjang ${numP}m / 0.6 = ${unitSlots.toFixed(2)} unit) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`
            });
        } else {
            // Fallback backward-compatible: single panjang P
            subtotal = Math.round(numP * baseUnitPrice);
            formulaText = `${numP}m x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: `Kitchen Set (${material} ${styleDisplayName})`, amount: subtotal, detail: formulaText });

            if (plafonOption === 'lt_50' && styleData.plafonLt50) {
                const plafonCost = Math.round(numP * styleData.plafonLt50);
                subtotal += plafonCost;
                itemBreakdown.push({ label: 'Kabinet Plafon Tingkat 2 (T < 50cm)', amount: plafonCost, detail: `${numP}m x Rp ${styleData.plafonLt50.toLocaleString('id-ID')}` });
            } else if (plafonOption === '50_to_70' && styleData.plafon50to70) {
                const plafonCost = Math.round(numP * styleData.plafon50to70);
                subtotal += plafonCost;
                itemBreakdown.push({ label: 'Kabinet Plafon Tingkat 2 (T 50-70cm)', amount: plafonCost, detail: `${numP}m x Rp ${styleData.plafon50to70.toLocaleString('id-ID')}` });
            }

            if (pintuKusen && styleData.kusen) {
                const kusenCost = Math.round(numP * styleData.kusen);
                subtotal += kusenCost;
                itemBreakdown.push({ label: 'Pintu Kusen Bawah', amount: kusenCost, detail: `${numP}m x Rp ${styleData.kusen.toLocaleString('id-ID')}` });
            }
        }

        // 1c. Top Table (Aica, Granit, Quadra)
        if (topTableOption && topTableOption !== 'none') {
            const ttData = TOP_TABLE_PRICES[topTableOption];
            if (ttData) {
                const ttLength = (topTableLength !== undefined && topTableLength !== '') 
                    ? (parseFloat(topTableLength) || 0) 
                    : (lenBawah > 0 ? lenBawah : numP);
                if (ttLength > 0) {
                    const ttCost = Math.round(ttLength * ttData.price);
                    subtotal += ttCost;
                    itemBreakdown.push({
                        label: `Top Table (${ttData.label})`,
                        amount: ttCost,
                        detail: `${ttLength}m' x Rp ${ttData.price.toLocaleString('id-ID')}`
                    });
                }
            }
        }

        // 1d. Backsplash (Aica, Granit, Quadra, Keramik Bevel, Mozaic, Cermin Grey)
        if (backsplashOption && backsplashOption !== 'none') {
            const bsCatalog = BACKSPLASH_PRICES[region] || BACKSPLASH_PRICES.dalam_kota;
            const bsData = bsCatalog[backsplashOption];
            if (bsData) {
                const bsLength = (backsplashLength !== undefined && backsplashLength !== '') 
                    ? (parseFloat(backsplashLength) || 0) 
                    : (lenBawah > 0 ? lenBawah : numP);
                if (bsLength > 0) {
                    const bsCost = Math.round(bsLength * bsData.price);
                    subtotal += bsCost;
                    itemBreakdown.push({
                        label: `Backsplash (${bsData.label})`,
                        amount: bsCost,
                        detail: `${bsLength}m' x Rp ${bsData.price.toLocaleString('id-ID')}`
                    });
                }
            }
        }

        // 1e. Mini Bar / Meja Island (Disatukan ke Kitchen Set - Rumus: P : 0.6 x Harga)
        if (numMiniBar > 0) {
            const mbPrices = PRICELIST_CATALOG.MINIBAR_ISLAND[region]?.[material] || PRICELIST_CATALOG.MINIBAR_ISLAND[region]?.MULTIPLEKS;
            let mbResolvedStyle = style;
            if (material === 'ALUMUNIUM') {
                mbResolvedStyle = (style === 'DOUBLE_LAYER' || style === 'SEMI_KLASIK' || style === 'KLASIK') ? 'DOUBLE_LAYER' : 'SINGLE_LAYER';
            }
            const mbRate = mbPrices?.[mbResolvedStyle] || mbPrices?.[style] || mbPrices?.MINIMALIS || 2500000;
            const mbSlots = numMiniBar / 0.6;
            const mbCost = Math.round(mbSlots * mbRate);
            subtotal += mbCost;
            itemBreakdown.push({
                label: `Mini Bar / Meja Island (${material} ${styleDisplayName})`,
                amount: mbCost,
                detail: `(${numMiniBar}m / 0.6 = ${mbSlots.toFixed(2)} unit) x Rp ${mbRate.toLocaleString('id-ID')}`
            });
        }

        // 1f. Topi Bar (Disatukan ke Kitchen Set - Rumus: P x Harga)
        if (numTopiBar > 0) {
            const tbPrices = PRICELIST_CATALOG.TOPI_BOX_HAMBALAN[region]?.TOPI_BAR || {};
            const isDuco = material === 'DUCO_LUXURY' || material === 'DUCO';
            const isBlock = material === 'BLOCKBOARD';
            const tbRate = isDuco ? tbPrices.DUCO : (isBlock ? tbPrices.BLOCKBOARD : tbPrices.MULTIPLEK) || 1450000;
            const tbCost = Math.round(numTopiBar * tbRate);
            subtotal += tbCost;
            itemBreakdown.push({
                label: `Topi Bar (${material})`,
                amount: tbCost,
                detail: `${numTopiBar}m' x Rp ${tbRate.toLocaleString('id-ID')}`
            });
        }

        // 1g. Box Elektronik (Disatukan ke Kitchen Set)
        // Aturan Resmi:
        // - Harga: Lebih Rp 100.000 dari harga material kitchen set yang ada (contoh Blockboard DK 2jt -> Box 2,1jt)
        // - Jika Panjang > 1m: dihitung Tinggi nya saja (T x Harga)
        // - Jika Panjang <= 1m: dihitung Panjang x Tinggi (P x T x Harga)

        const isBoxActive = (boxElektronikType && boxElektronikType !== 'none') || (numBoxP > 0 && numBoxT > 0);

        if (isBoxActive && (numBoxP > 0 || numBoxT > 0 || boxElektronikType === 'LT_1M' || boxElektronikType === 'GT_1M' || boxElektronikType === 'box_kulkas')) {
            const boxRate = baseUnitPrice + 100000;
            let effectiveP = numBoxP;
            let effectiveT = numBoxT;

            // Backward compat jika caller lama hanya oper boxElektronikType tanpa P & T
            if (effectiveP === 0 && effectiveT === 0) {
                if (boxElektronikType === 'GT_1M') {
                    effectiveP = 1.2;
                    effectiveT = 2.0;
                } else {
                    effectiveP = 0.8;
                    effectiveT = 2.0;
                }
            }

            let boxVolume = 0;
            let detailFormula = '';

            if (effectiveP > 1) {
                // Panjang > 1m: dihitung tingginya saja
                boxVolume = effectiveT;
                detailFormula = `Tinggi ${effectiveT}m' (P ${effectiveP}m > 1m) x Rp ${boxRate.toLocaleString('id-ID')}`;
            } else {
                // Panjang <= 1m: dihitung Panjang x Tinggi
                boxVolume = effectiveP * effectiveT;
                detailFormula = `${effectiveP}m x ${effectiveT}m = ${boxVolume.toFixed(2)}m² (P ≤ 1m) x Rp ${boxRate.toLocaleString('id-ID')}`;
            }

            if (numBoxQuantity > 1) {
                detailFormula += ` x ${numBoxQuantity} unit`;
            }

            const boxCost = Math.round(boxVolume * boxRate * numBoxQuantity);
            subtotal += boxCost;
            itemBreakdown.push({
                label: `Box Elektronik / Kulkas (${material} ${styleDisplayName})`,
                amount: boxCost,
                detail: detailFormula
            });
        }

        // 1h. Hambalan Floating (Disatukan ke Kitchen Set) - Dihitung Permeter Rp 650.000 / m'


        if (numHambalanLen > 0) {
            const hbRate = 650000; // Rp 650.000 / m'
            const hbCost = Math.round(numHambalanLen * hbRate);
            subtotal += hbCost;
            itemBreakdown.push({
                label: `Hambalan Floating Shelf`,
                amount: hbCost,
                detail: `${numHambalanLen}m' x Rp ${hbRate.toLocaleString('id-ID')}`
            });
        }
    }

    // =========================================================================
    // 2. AREA KAMAR SET (WARDROBE, DIPAN, HEADBOARD, NAKAS, RANGKA TINGKAT, MEJA RIAS)
    // =========================================================================
    else if (resolvedCategory === 'KAMAR_SET') {
        if (resolvedSubItem === 'LEMARI_WARDROBE') {
            const catPrices = PRICELIST_CATALOG.LEMARI_WARDROBE[region]?.[material] || PRICELIST_CATALOG.LEMARI_WARDROBE[region]?.MULTIPLEKS;
            let wardResolvedStyle = style;
            if (material === 'ALUMUNIUM') {
                wardResolvedStyle = (style === 'DOUBLE_LAYER' || style === 'SEMI_KLASIK' || style === 'KLASIK') ? 'DOUBLE_LAYER' : 'SINGLE_LAYER';
            }
            baseUnitPrice = catPrices?.[wardResolvedStyle] || catPrices?.[style] || catPrices?.MINIMALIS || 2500000;
            const wardStyleDisplayName = material === 'ALUMUNIUM'
                ? (wardResolvedStyle === 'DOUBLE_LAYER' ? 'Double Layer' : 'Single Layer')
                : style;
            const luasM2 = numP * numT;
            subtotal = Math.round(luasM2 * baseUnitPrice);
            formulaText = `${numP}m x ${numT}m (${luasM2.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: `Lemari Wardrobe (${material} ${wardStyleDisplayName})`, amount: subtotal, detail: formulaText });

            if (pintuKaca !== 'none') {
                const kacaPrices = PRICELIST_CATALOG.LEMARI_WARDROBE[region]?.PINTU_KACA || {};
                const kacaRate = kacaPrices[pintuKaca] || 0;
                if (kacaRate > 0) {
                    const kacaCost = Math.round(luasM2 * kacaRate);
                    subtotal += kacaCost;
                    itemBreakdown.push({ label: `Add-on Pintu Kaca (${pintuKaca})`, amount: kacaCost, detail: `${luasM2.toFixed(2)} m2 x Rp ${kacaRate.toLocaleString('id-ID')}` });
                }
            }
        } else if (resolvedSubItem === 'DIPAN_HEADBOARD') {
            const isBlockboard = material === 'BLOCKBOARD';
            baseUnitPrice = isBlockboard 
                ? (PRICELIST_CATALOG.DIPAN_HEADBOARD[region]?.DIPAN_BLOCKBOARD_HPL || 2100000)
                : (style === 'DUCO' ? (PRICELIST_CATALOG.DIPAN_HEADBOARD[region]?.DIPAN_MULTIPLEK_DUCO || 3100000) : (PRICELIST_CATALOG.DIPAN_HEADBOARD[region]?.DIPAN_MULTIPLEK_HPL || 2500000));
            
            const luasDipan = numP * numL;
            const dipanCost = Math.round(luasDipan * baseUnitPrice);
            subtotal += dipanCost;
            formulaText = `${numP}m x ${numL}m (${luasDipan.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: `Dipan Ranjang Termasuk 2 Laci (${material})`, amount: dipanCost, detail: formulaText });

            // Headboard
            if (headboardOption !== 'none') {
                const hbPrices = PRICELIST_CATALOG.DIPAN_HEADBOARD[region]?.HEADBOARD || {};
                const hbRate = hbPrices[headboardOption] || 1600000;
                const hbCost = Math.round(numP * hbRate);
                subtotal += hbCost;
                itemBreakdown.push({ label: `Headboard Tinggi 70cm (${headboardOption})`, amount: hbCost, detail: `${numP}m x Rp ${hbRate.toLocaleString('id-ID')}` });
            }

            // Nakas
            if (nakasOption !== 'none' && numNakas > 0) {
                const nakasPrices = PRICELIST_CATALOG.DIPAN_HEADBOARD[region]?.NAKAS || {};
                const nakasRate = nakasPrices[nakasOption] || 2500000;
                const nakasCost = Math.round(numNakas * nakasRate);
                subtotal += nakasCost;
                itemBreakdown.push({ label: `Nakas Bedside Table (${nakasOption})`, amount: nakasCost, detail: `${numNakas} unit x Rp ${nakasRate.toLocaleString('id-ID')}` });
            }
        } else if (resolvedSubItem === 'RANGKA_DIPAN_TINGKAT') {
            const sizeKey = rangkaDipanTingkat !== 'none' ? rangkaDipanTingkat : '160x200';
            baseUnitPrice = PRICELIST_CATALOG.RANGKA_DIPAN_TINGKAT[region]?.[sizeKey] || 2750000;
            subtotal = baseUnitPrice;
            formulaText = `1 Unit Rangka Besi Hollow Lapis HPL (${sizeKey})`;
            itemBreakdown.push({ label: `Penambahan Rangka Dipan Tingkat (${sizeKey})`, amount: subtotal, detail: formulaText });
        } else if (resolvedSubItem === 'MEJA_RIAS') {
            const mrCatalog = PRICELIST_CATALOG.MEJA_RIAS[region]?.[material] || PRICELIST_CATALOG.MEJA_RIAS[region]?.MULTIPLEKS;
            baseUnitPrice = mrCatalog?.[style] || mrCatalog?.MINIMALIS || 2100000;
            subtotal = Math.round(numP * baseUnitPrice);
            formulaText = `${numP}m x Rp ${baseUnitPrice.toLocaleString('id-ID')} (Termasuk Cermin)`;
            itemBreakdown.push({ label: `Meja Rias Custom (${material} ${style})`, amount: subtotal, detail: formulaText });
        }
    }

    // =========================================================================
    // 3. AREA LIVING ROOM (BACKDROP TV, BAWAH TANGGA, CRADIENZA, PARTISI, BENCH, WALLPANEL, SOFA)
    // =========================================================================
    else if (resolvedCategory === 'LIVING_ROOM') {
        if (resolvedSubItem === 'BACKDROP_TV') {
            const catPrices = PRICELIST_CATALOG.BACKDROP_TV[region]?.[material] || PRICELIST_CATALOG.BACKDROP_TV[region]?.MULTIPLEKS;
            baseUnitPrice = catPrices?.[style] || catPrices?.MINIMALIS || 2300000;
            const luasM2 = numP * numT;
            subtotal = Math.round(luasM2 * baseUnitPrice);
            formulaText = `${numP}m x ${numT}m (${luasM2.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: `Backdrop TV (${material} ${style})`, amount: subtotal, detail: formulaText });
        } else if (resolvedSubItem === 'LEMARI_BAWAH_TANGGA') {
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
        } else if (resolvedSubItem === 'CRADIENZA') {
            const catPrices = PRICELIST_CATALOG.CRADIENZA.all_regions[material] || PRICELIST_CATALOG.CRADIENZA.all_regions.MULTIPLEKS;
            baseUnitPrice = catPrices?.[style] || catPrices?.MINIMALIS || 2100000;
            subtotal = Math.round(numP * baseUnitPrice);
            formulaText = `${numP}m x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: `Cradienza / Kredensa (${material} ${style})`, amount: subtotal, detail: formulaText });
        } else if (resolvedSubItem === 'PARTISI_BENCH') {
            const partisiRate = material === 'BLOCKBOARD' 
                ? (PRICELIST_CATALOG.PARTISI_BENCH[region]?.PARTISI_BLOCKBOARD || 2100000)
                : (style === 'DUCO' ? (PRICELIST_CATALOG.PARTISI_BENCH[region]?.PARTISI_MULTIPLEK_DUCO || 4500000) : (PRICELIST_CATALOG.PARTISI_BENCH[region]?.PARTISI_MULTIPLEK_MINIMALIS || 2400000));
            const luasPartisi = numP * numT;
            subtotal = Math.round(luasPartisi * partisiRate);
            const partisiLabel = partisiType === 'storage' ? 'Partisi Model Storage' : 'Partisi Kisi-Kisi Minimalis';
            formulaText = `${numP}m x ${numT}m (${luasPartisi.toFixed(2)} m2) x Rp ${partisiRate.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: `${partisiLabel} (${material})`, amount: subtotal, detail: formulaText });
        } else if (resolvedSubItem === 'BENCH') {
            const benchRate = material === 'BLOCKBOARD'
                ? (PRICELIST_CATALOG.PARTISI_BENCH[region]?.BENCH_BLOCKBOARD || 2000000)
                : (PRICELIST_CATALOG.PARTISI_BENCH[region]?.BENCH_MULTIPLEK || 2200000);
            let benchCost = Math.round(numP * benchRate);
            subtotal += benchCost;
            itemBreakdown.push({ label: `Bench Dudukan (${material} ${style})`, amount: benchCost, detail: `${numP}m x Rp ${benchRate.toLocaleString('id-ID')}` });

            if (benchBusa) {
                const busaRate = PRICELIST_CATALOG.PARTISI_BENCH[region]?.BUSA_STANDARD || 650000;
                const busaCost = Math.round(numP * busaRate);
                subtotal += busaCost;
                itemBreakdown.push({ label: 'Tambahan Busa Jok Standard', amount: busaCost, detail: `${numP}m x Rp ${busaRate.toLocaleString('id-ID')}` });
            }
        } else if (resolvedSubItem === 'WALLPANEL_KACA') {
            const luasM2 = numP * numT;
            if (wallpanelType === 'WPC') {
                const wpcRate = PRICELIST_CATALOG.WALLPANEL_KACA.all_regions.WPC_PANEL[region] || 850000;
                subtotal = Math.round(numP * wpcRate);
                itemBreakdown.push({ label: 'Wallpanel WPC Modern', amount: subtotal, detail: `${numP}m x Rp ${wpcRate.toLocaleString('id-ID')}` });
            } else if (wallpanelType === 'CERMIN_BEVEL') {
                baseUnitPrice = PRICELIST_CATALOG.WALLPANEL_KACA.all_regions.KACA_BEVEL.CERMIN_BIASA;
                subtotal = Math.round(luasM2 * baseUnitPrice);
                itemBreakdown.push({ label: 'Kaca Cermin Bevel Polos', amount: subtotal, detail: `${numP}m x ${numT}m (${luasM2.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}` });
            } else {
                const catPrices = PRICELIST_CATALOG.WALLPANEL_KACA.all_regions.WALLPANEL_MULTIPLEK;
                baseUnitPrice = catPrices?.[style] || catPrices?.MINIMALIS || 1350000;
                subtotal = Math.round(luasM2 * baseUnitPrice);
                itemBreakdown.push({ label: `Wallpanel Multipleks HPL (${style})`, amount: subtotal, detail: `${numP}m x ${numT}m (${luasM2.toFixed(2)} m2) x Rp ${baseUnitPrice.toLocaleString('id-ID')}` });
            }
        } else if (resolvedSubItem === 'SOFA') {
            baseUnitPrice = style === 'KLASIK' ? PRICELIST_CATALOG.SOFA.all_regions.KLASIK : PRICELIST_CATALOG.SOFA.all_regions.MINIMALIS;
            const seatSlots = numP / 0.60;
            subtotal = Math.round(seatSlots * baseUnitPrice);
            formulaText = `(Panjang ${numP}m / 0.60 = ${seatSlots.toFixed(2)} seat) x Rp ${baseUnitPrice.toLocaleString('id-ID')}`;
            itemBreakdown.push({ label: `Sofa Custom (${style})`, amount: subtotal, detail: formulaText });

            if (sofaCover !== 'standard') {
                const coverRate = PRICELIST_CATALOG.SOFA.all_regions.COVER_ADDON[sofaCover] || 0;
                const coverCost = Math.round(numP * coverRate);
                subtotal += coverCost;
                itemBreakdown.push({ label: `Upgrade Cover Sofa (${sofaCover})`, amount: coverCost, detail: `${numP}m x Rp ${coverRate.toLocaleString('id-ID')}` });
            }
        }
    }

    // =========================================================================
    // 4. SIPIL & BENGKEL LAS (CANOPI, PAGAR, JASA SIPIL & BONGKARAN)
    // =========================================================================
    else if (resolvedCategory === 'SIPIL_BENGKEL') {
        if (resolvedSubItem === 'CANOPI') {
            const canopiData = PRICELIST_CATALOG.SIPIL_BENGKEL.CANOPI[canopiType] || PRICELIST_CATALOG.SIPIL_BENGKEL.CANOPI.HOLO_4X4_SPANDEK;
            const luasCanopi = numP * numL;
            subtotal = Math.round(luasCanopi * canopiData.price);
            itemBreakdown.push({
                label: `Canopi (${canopiData.label})`,
                amount: subtotal,
                detail: `${numP}m x ${numL}m (${luasCanopi.toFixed(2)} m2) x Rp ${canopiData.price.toLocaleString('id-ID')}`
            });
        } else if (resolvedSubItem === 'PAGAR') {
            const pagarData = PRICELIST_CATALOG.SIPIL_BENGKEL.PAGAR[pagarType] || PRICELIST_CATALOG.SIPIL_BENGKEL.PAGAR.MINIMALIS;
            const luasPagar = numP * numT;
            subtotal = Math.round(luasPagar * pagarData.price);
            itemBreakdown.push({
                label: `Pagar & Railing (${pagarData.label})`,
                amount: subtotal,
                detail: `${numP}m x ${numT}m (${luasPagar.toFixed(2)} m2) x Rp ${pagarData.price.toLocaleString('id-ID')}`
            });
        } else if (resolvedSubItem === 'JASA_SIPIL') {
            const sipilCatalog = PRICELIST_CATALOG.SIPIL_BENGKEL.JASA_SIPIL[region] || PRICELIST_CATALOG.SIPIL_BENGKEL.JASA_SIPIL.dalam_kota;
            const itemData = sipilCatalog[jasaSipilType] || sipilCatalog.COR_MEJA_DAPUR;
            const qty = parseFloat(jasaSipilQty) || 1;
            subtotal = Math.round(qty * itemData.price);
            itemBreakdown.push({
                label: `Pekerjaan Sipil (${itemData.label})`,
                amount: subtotal,
                detail: `${qty} ${itemData.unit} x Rp ${itemData.price.toLocaleString('id-ID')}`
            });
        }
    }

    // Tambahan Finishing HPL Luar & Dalam jika dipilih
    const hasExplicitCabinets = (resolvedCategory === 'KITCHEN_SET' && (cabinetBawah !== undefined || cabinetAtas !== undefined));
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
        category: resolvedCategory,
        subItem: resolvedSubItem,
        material,
        style,
        dimensions: {
            p: numP,
            t: numT,
            l: numL,
            cabinetBawah: (cabinetBawah !== undefined) ? (parseFloat(cabinetBawah) || 0) : undefined,
            cabinetAtas: (cabinetAtas !== undefined) ? (parseFloat(cabinetAtas) || 0) : undefined,
            topTable: topTableOption !== 'none' ? topTableOption : undefined,
            backsplash: backsplashOption !== 'none' ? backsplashOption : undefined,
            miniBarLength: numMiniBar > 0 ? numMiniBar : undefined,
            topiBarLength: numTopiBar > 0 ? numTopiBar : undefined,
            boxP: numBoxP > 0 ? numBoxP : undefined,
            boxT: numBoxT > 0 ? numBoxT : undefined,
            boxQty: numBoxQuantity > 1 ? numBoxQuantity : undefined,
            hambalanLength: numHambalanLen > 0 ? numHambalanLen : undefined
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
