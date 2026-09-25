// File: src/js/constants.js

export const INITIAL_BRANDS = [
    {
        id: 'brand_nacira',
        slug: 'nacira-studio',
        brandName: 'NACIRA STUDIO',
        displayName: 'Nacira Studio Interior & Build',
        shortDescription: 'Architectural Interior Design & Build — Sejak 2018',
        companyDescription: 'Layanan desain arsitektural dan interior custom premium berbasis di Bandung Barat dengan jangkauan Jawa & Bali.',
        whatsapp: '+62 853-8506-9717',
        email: 'nacirastudio@gmail.com',
        website: 'nacirastudio.com',
        instagram: '@nacirastudio',
        address: 'Kp Cibogo, RT.03/RW.04, Citatah, Kec. Cipatat, Kabupaten Bandung Barat, Jawa Barat 40554',
        serviceArea: 'Bandung & sekitarnya, Jabodetabek, dan seluruh pulau Jawa & Bali.',
        minProjectValue: 'Bandung & Jabodetabek: Rp 15 juta · Luar Jawa Barat: Rp 100 juta.',
        greetingStyle: 'Kak',
        closingSignature: 'Salam hangat,\n*Ary — Nacira Studio*',
        salesTone: 'consultative_luxury',
        isActive: true
    },
    {
        id: 'brand_homeputra',
        slug: 'homeputra-interior',
        brandName: 'HOMEPUTRA INTERIOR',
        displayName: 'Homeputra Interior & Custom Furniture',
        shortDescription: 'Modern Living & Custom Interior Specialist',
        companyDescription: 'Spesialis interior hunian modern, kitchen set fungsional, dan custom furniture keluarga.',
        whatsapp: '+62 812-2233-4455',
        email: 'halo@homeputrainterior.com',
        website: 'homeputrainterior.com',
        instagram: '@homeputra.interior',
        address: 'Jl. Terusan Buah Batu No. 88, Bandung',
        serviceArea: 'Bandung Raya, Cimahi, dan Jabodetabek.',
        minProjectValue: 'Bandung: Rp 12 juta · Jabodetabek: Rp 15 juta.',
        greetingStyle: 'Kak',
        closingSignature: 'Terima kasih,\n*Tim Sales Homeputra Interior*',
        salesTone: 'warm_family',
        isActive: true
    },
    {
        id: 'brand_heya',
        slug: 'heya-interior',
        brandName: 'HEYA INTERIOR',
        displayName: 'Heya Interior Studio',
        shortDescription: 'Aesthetic Japandi & Scandinavian Interior Design',
        companyDescription: 'Studio desain interior bergaya Japandi, Scandinavian, dan minimalis estetis untuk rumah masa kini dan apartemen.',
        whatsapp: '+62 813-8899-7711',
        email: 'hello@heyainterior.id',
        website: 'heyainterior.id',
        instagram: '@heya.interior',
        address: 'Jl. Riau No. 120, Citarum, Bandung Wetan',
        serviceArea: 'Bandung, Jabodetabek, dan sekitarnya.',
        minProjectValue: 'Bandung: Rp 15 juta · Jabodetabek: Rp 20 juta.',
        greetingStyle: 'Kak',
        closingSignature: 'Best regards,\n*Heya Interior Studio*',
        salesTone: 'aesthetic_trendy',
        isActive: true
    },
    {
        id: 'brand_putra',
        slug: 'putra-interior',
        brandName: 'PUTRA INTERIOR',
        displayName: 'Putra Interior Workshop & Production',
        shortDescription: 'Bengkel Fabrikasi Interior Presisi & Berkualitas',
        companyDescription: 'Workshop langsung spesialis kitchen set, lemari HPL, dan backdrop dengan pengerjaan cepat dan kokoh.',
        whatsapp: '+62 821-3344-5566',
        email: 'workshop@putrainterior.com',
        website: 'putrainterior.com',
        instagram: '@putrainterior.official',
        address: 'Kawasan Industri Cimareme, Bandung Barat',
        serviceArea: 'Bandung, Cimahi, Sumedang, dan Jabodetabek.',
        minProjectValue: 'Bandung: Rp 10 juta · Jabodetabek: Rp 15 juta.',
        greetingStyle: 'Kak',
        closingSignature: 'Hormat kami,\n*Workshop Putra Interior*',
        salesTone: 'direct_technical',
        isActive: true
    },
    {
        id: 'brand_kurnia',
        slug: 'kurnia-interior',
        brandName: 'KURNIA INTERIOR',
        displayName: 'Kurnia Interior & Living',
        shortDescription: 'Desain Interior Eksklusif & Pengerjaan Terpercaya',
        companyDescription: 'Layanan desain interior terpercaya dengan standar material grade A dan garansi purna jual prima.',
        whatsapp: '+62 852-7788-9900',
        email: 'sales@kurniainterior.com',
        website: 'kurniainterior.com',
        instagram: '@kurnia.interior',
        address: 'Jl. Soekarno Hatta No. 450, Bandung',
        serviceArea: 'Bandung, Priangan Timur, dan Jabodetabek.',
        minProjectValue: 'Bandung & Jabodetabek: Rp 15 juta.',
        greetingStyle: 'Kak / Bapak / Ibu',
        closingSignature: 'Salam sukses,\n*Konsultan Kurnia Interior*',
        salesTone: 'polite_trusted',
        isActive: true
    }
];

export const INITIAL_USERS = [
    {
        id: 'usr_super_ary',
        username: 'admin',
        password: 'password123',
        fullName: 'Ary (Super Administrator)',
        email: 'ary@interiorcorp.com',
        role: 'SUPER_ADMIN',
        brandId: 'brand_nacira', // Default initial active brand
        isActive: true
    },
    {
        id: 'usr_homeputra',
        username: 'homeputra',
        password: 'password123',
        fullName: 'Admin Marketing Homeputra',
        email: 'sales@homeputrainterior.com',
        role: 'MARKETING_ADMIN',
        brandId: 'brand_homeputra',
        isActive: true
    },
    {
        id: 'usr_heya',
        username: 'heya',
        password: 'password123',
        fullName: 'Admin Marketing Heya',
        email: 'sales@heyainterior.id',
        role: 'MARKETING_ADMIN',
        brandId: 'brand_heya',
        isActive: true
    },
    {
        id: 'usr_putra',
        username: 'putra',
        password: 'password123',
        fullName: 'Admin Marketing Putra Interior',
        email: 'sales@putrainterior.com',
        role: 'MARKETING_ADMIN',
        brandId: 'brand_putra',
        isActive: true
    },
    {
        id: 'usr_kurnia',
        username: 'kurnia',
        password: 'password123',
        fullName: 'Admin Marketing Kurnia',
        email: 'sales@kurniainterior.com',
        role: 'MARKETING_ADMIN',
        brandId: 'brand_kurnia',
        isActive: true
    }
];

// Global Shared Core Knowledge (Milik Bersama Seluruh Brand — PL DK & PL LK 2026)
export const GLOBAL_CORE_KNOWLEDGE = [
    {
        id: 'core_kitchen_dk',
        scope: 'GLOBAL',
        category: 'KITCHEN_SET',
        subCategory: 'dalam_kota',
        title: 'Master Price List Kitchen Set Dalam Kota (PL DK: Bandung & Tasikmalaya)',
        content: `• Bahan Multipleks Plywood 18mm Fin. HPL (Grade B):
  - Minimalis: Rp 2.500.000,-/m
  - Semi Klasik: Rp 2.700.000,-/m
  - Klasik: Rp 3.200.000,-/m
  (Note: Finishing HPL Luar & Dalam +Rp 700.000,-/m)

• Bahan Blockboard 18mm Fin. HPL (Grade C):
  - Minimalis: Rp 2.000.000,-/m
  - Semi Klasik: Rp 2.500.000,-/m
  - Klasik: Rp 2.900.000,-/m
  (Note: Finishing HPL Luar & Dalam +Rp 700.000,-/m)

• Bahan PVC Board 18mm Waterproof (Grade A Non Kayu — 100% Anti Air & Anti Rayap):
  - Minimalis: Rp 4.000.000,-/m
  - Semi Klasik: Rp 4.500.000,-/m
  - Klasik: Rp 4.800.000,-/m
  (Note: Finishing HPL Luar & Dalam +Rp 700.000,-/m. Sangat direkomendasikan untuk area sink/bawah wastafel)

• Bahan Alumunium ACP 4mm (Grade A Non Kayu):
  - Minimalis: Rp 3.300.000,-/m
  - Semi Klasik: Rp 3.750.000,-/m
  (Note: Finishing ACP Luar & Dalam +Rp 700.000,-/m)

• Bahan Multipleks Finishing Cat Duco:
  - Minimalis: Rp 4.500.000,-/m
  - Semi Klasik: Rp 4.700.000,-/m
  - Klasik: Rp 5.500.000,-/m
  (Note: Finishing HPL Dalam +Rp 700.000,-/m | Finishing Duco Luar & Dalam +Rp 1.000.000,-/m)

• Kitchenset Industrial (Bandung & Tasikmalaya):
  - Bahan Blockboard Fin. HPL: Rp 2.000.000,-/m
  - Bahan Multipleks Fin. HPL: Rp 2.300.000,-/m | Fin. Duco: Rp 4.500.000,-/m
  - Rangka Besi: Rp 1.800.000,-/m | Rangka Besi + Wire Mesh: Rp 2.000.000,-/m (Harga besi terpisah)

• Ketentuan DK:
  - Project di bawah Rp 10jt dikenakan biaya Ongkir Rp 500.000,- (Wilayah Bandung & sekitarnya) dan belum include rak piring, rak bumbu, dan rak sendok.
  - Project di atas Rp 10jt include: Rell double track, engsel slow motion stainless, rak piring atas/bawah, rak bumbu, lampu LED strip/downlight, rak sendok, rell gas & ventilasi, rell panci.`,
        keywords: ['kitchen', 'dapur', 'kitchen set', 'dk', 'dalam kota', 'bandung', 'tasikmalaya', 'harga per meter'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_kitchen_lk',
        scope: 'GLOBAL',
        category: 'KITCHEN_SET',
        subCategory: 'luar_kota',
        title: 'Master Price List Kitchen Set Luar Kota (PL LK: Jabodetabek, Pantura, Jateng, Jatim)',
        content: `• Bahan Multipleks Plywood 18mm Fin. HPL (Grade B):
  - Minimalis: Rp 2.600.000,-/m
  - Semi Klasik: Rp 2.800.000,-/m
  - Klasik: Rp 3.300.000,-/m
  (Note: Finishing HPL Luar & Dalam +Rp 700.000,-/m)

• Bahan Blockboard 18mm Fin. HPL (Grade C):
  - Minimalis: Rp 2.300.000,-/m
  - Semi Klasik: Rp 2.600.000,-/m
  - Klasik: Rp 3.000.000,-/m
  (Note: Finishing HPL Luar & Dalam +Rp 700.000,-/m)

• Bahan PVC Board 18mm Waterproof (Grade A Non Kayu — 100% Anti Air & Anti Rayap):
  - Minimalis: Rp 4.100.000,-/m
  - Semi Klasik: Rp 4.500.000,-/m
  - Klasik: Rp 4.800.000,-/m
  (Note: Finishing HPL Luar & Dalam +Rp 700.000,-/m)

• Bahan Alumunium ACP 4mm:
  - Minimalis (Visible Frame): Rp 3.500.000,-/m
  - Premium (Visible Frame): Rp 4.500.000,-/m
  - Semi Klasik (Visible Frame Mix PVC): Rp 5.000.000,-/m
  - Luxury (Frameless): Rp 5.500.000,-/m
  (Note: Finishing ACP Luar & Dalam)

• Bahan Multipleks Finishing Cat Duco:
  - Minimalis: Rp 4.000.000,-/m
  - Semi Klasik: Rp 4.600.000,-/m
  - Klasik: Rp 4.800.000,-/m
  (Note: Finishing HPL Dalam +Rp 500.000,-/m)

• Kitchenset Industrial (Jabodetabek, Pantura, Jateng & Jatim):
  - Bahan Blockboard Fin. HPL: Rp 2.300.000,-/m
  - Bahan Multipleks Fin. HPL: Rp 2.700.000,-/m | Fin. Duco: Rp 4.500.000,-/m
  - Rangka Besi: Rp 2.100.000,-/m | Rangka Besi + Wire Mesh: Rp 2.300.000,-/m (Harga besi terpisah)

• Ketentuan LK:
  - Project di bawah Rp 15jt dikenakan biaya Ongkir Rp 500.000,- (Wilayah Bandung & sekitarnya).
  - Project di bawah Rp 20jt dikenakan biaya Ongkir Rp 1.000.000,- (Wilayah Jabodetabek, Pantura, Jatim, Jateng dan sekitarnya).
  - Order di bawah 10jt tidak include rak piring, rak bumbu, dan rak sendok.`,
        keywords: ['kitchen', 'dapur', 'kitchen set', 'lk', 'luar kota', 'jabodetabek', 'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'pantura', 'jateng', 'jatim'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_minibar_island',
        scope: 'GLOBAL',
        category: 'MINIBAR_ISLAND',
        subCategory: 'all_regions',
        title: 'Master Price List Minibar, Meja Island & Box Elektronik (DK & LK)',
        content: `• DALAM KOTA (PL DK: Bandung & Tasikmalaya):
  1. Minimalis: Blockboard Rp 2.100.000,-/m | Multipleks Rp 2.500.000,-/m
  2. Semi Klasik: Blockboard Rp 2.500.000,-/m | Multipleks Rp 2.700.000,-/m
  3. Klasik: Blockboard Rp 2.500.000,-/m | Multipleks Rp 2.700.000,-/m
  4. Topi Bar: Blockboard Rp 1.250.000,-/m | Multipleks Rp 1.450.000,-/m
  5. Rak Terbuka: Blockboard Rp 2.000.000,-/m | Multipleks Rp 2.300.000,-/m
  6. Box Elektronik: Blockboard Rp 2.100.000,-/m | Multipleks Rp 2.500.000,-/m

• LUAR KOTA (PL LK: Jabodetabek, Pantura, Jateng):
  1. Minimalis: Blockboard Rp 2.300.000,-/m | Multipleks Rp 2.500.000,-/m
  2. Semi Klasik: Blockboard Rp 2.700.000,-/m | Multipleks Rp 2.700.000,-/m
  3. Klasik: Blockboard Rp 2.700.000,-/m | Multipleks Rp 2.700.000,-/m
  4. Topi Bar: Blockboard Rp 1.350.000,-/m | Multipleks Rp 1.450.000,-/m
  5. Rak Terbuka: Blockboard Rp 2.100.000,-/m | Multipleks Rp 2.300.000,-/m
  6. Box Elektronik: Blockboard Rp 2.300.000,-/m | Multipleks Rp 2.600.000,-/m
  - Minibar Alumunium Luxury (Frameless): Rp 5.500.000,-/m
  - Minibar Alumunium Minimalis (Visible Frame): Rp 4.850.000,-/m

• Note: Harga Semi Klasik & Klasik hanya bagian depan saja, jika Full Semi Klasik atau Klasik termasuk hitungan kabinet kitchenset.`,
        keywords: ['minibar', 'meja island', 'island', 'topi bar', 'box elektronik', 'rak terbuka', 'dk', 'lk'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_aksesoris_kitchen',
        scope: 'GLOBAL',
        category: 'AKSESORIS',
        subCategory: 'kitchen',
        title: 'Master Price List Penambahan & Upgrade Aksesoris Kitchenset',
        content: `• Penambahan Aksesoris Satuan:
  - Lampu Down Light: Rp 85.000 / pcs
  - Lampu LED Strip: Rp 100.000 / meter
  - Rak Bumbu Kayu: Rp 400.000
  - Rell Gas & Ventilasi: Rp 300.000
  - Rell Panci: Rp 300.000
  - Tangga Lipat Kabinet Bawah: Rp 2.500.000
  - Rak Sudut Revolve Basket Stainless: Rp 2.500.000 (Rak Sudut Revolve Biasa: Rp 1.350.000)
  - Tarikan Edging Stainless: Rp 150.000 / meter | Tarikan Keong: Rp 45.000 / pcs | Ventilasi: Rp 50.000 / pcs
  - Rak Piring Bawah Model Line 2 Susun: Rp 350.000 / pcs
  - Rak Pantry Stainless (Tall Unit): Rp 7.300.000
  - Rak Piring Elevator (Tarik Turun Atas):
    * Ukuran 60cm: Rp 3.700.000
    * Ukuran 70cm: Rp 4.700.000
    * Ukuran 80cm: Rp 4.915.000
    * Ukuran 90cm: Rp 5.120.000
  - Engsel Pintu Aventos (Bi-Fold Lift Up): Rp 1.100.000

• Upgrade Aksesoris Kitchenset:
  - Lapisan Melaminto upgrade ke HPL: +Rp 700.000 / meter
  - Rell Double Track upgrade ke Rell Tandem Slow Motion: +Rp 450.000 / pasang
  - Rell Double Track upgrade ke Rell Slow Motion: +Rp 150.000 / pasang
  - Engsel Standar upgrade ke Engsel Slow Motion Full Stainless: +Rp 75.000 / pasang
  - Rak Piring Bawah Modelline upgrade ke Stainless: +Rp 650.000 / pcs
  - Rak Piring Atas Modelline upgrade ke Stainless: +Rp 450.000 / pcs`,
        keywords: ['aksesoris', 'rak piring', 'rak bumbu', 'downlight', 'led strip', 'aventos', 'revolve', 'pantry', 'slow motion'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_kamarset_dk',
        scope: 'GLOBAL',
        category: 'WARDROBE',
        subCategory: 'dalam_kota',
        title: 'Master Price List Kamarset Dalam Kota (PL DK: Bandung & Tasikmalaya)',
        content: `• DIPAN (Bahan Blockboard & Multipleks DK):
  - Dipan Blockboard Fin. HPL: Rp 2.100.000,-/m
  - Dipan Multipleks Fin. HPL: Rp 2.500.000,-/m | Finishing Duco: Rp 3.100.000,-/m

• HEADBOARD (Tinggi Standar 70 CM):
  - Blockboard: Rp 1.350.000,-/m | Multipleks: Rp 1.600.000,-/m
  - Blockboard + Busa: Rp 1.850.000,-/m | Multipleks + Busa: Rp 2.100.000,-/m
  - Semi Klasik: Blockboard Rp 1.600.000,-/m | Multipleks Rp 1.900.000,-/m

• NAKAS:
  - Minimalis: Rp 2.500.000,-/m | Semi Klasik: Rp 2.800.000,-/m | Klasik: Rp 3.000.000,-/m

• PENAMBAHAN RANGKA DIPAN TINGKAT DK (Besi Hollow Lapis HPL):
  - Dipan 90 x 200: Rp 2.000.000 / unit
  - Dipan 100 x 200: Rp 2.000.000 / unit
  - Dipan 120 x 200: Rp 2.250.000 / unit
  - Dipan 160 x 200: Rp 2.750.000 / unit
  - Dipan 180 x 200: Rp 3.000.000 / unit
  - Dipan 200 x 200: Rp 3.250.000 / unit

• PRICELIST LEMARI PAKAIAN / WARDROBE DK (Standar Lebar/Kedalaman 60 CM):
  - Bahan Blockboard: Minimalis Rp 2.300.000/m | Semi Klasik Rp 2.700.000/m | Klasik Rp 2.950.000/m
  - Bahan Multipleks: Minimalis Rp 2.500.000/m | Semi Klasik Rp 2.750.000/m | Klasik Rp 3.000.000/m
  - Bahan Multipleks Cat Duco: Minimalis Rp 4.800.000/m | Semi Klasik Rp 5.300.000/m | Klasik Rp 6.300.000/m
  - Tambahan Pintu Kaca: Kaca Polos Rp 650.000/m | Cermin Biasa Rp 750.000/m | Kaca Riben Rp 1.250.000/m | Cermin Bronze / Grey Rp 1.850.000/m

• PRICELIST MEJA RIAS DK:
  - Bahan Blockboard: Minimalis Rp 1.900.000/m | Semi Klasik Rp 2.200.000/m | Klasik Rp 2.400.000/m
  - Bahan Multipleks: Minimalis Rp 2.100.000/m | Semi Klasik Rp 2.450.000/m | Klasik Rp 2.600.000/m
  - Tambahan Kaca: Kaca Polos Rp 650.000/m | Cermin Biasa Rp 750.000/m | Kaca Riben Rp 1.250.000/m | Cermin Bronze / Grey Rp 1.850.000/m`,
        keywords: ['lemari', 'wardrobe', 'dipan', 'headboard', 'nakas', 'meja rias', 'kamar set', 'dk', 'bandung', 'tasikmalaya'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_kamarset_lk',
        scope: 'GLOBAL',
        category: 'WARDROBE',
        subCategory: 'luar_kota',
        title: 'Master Price List Kamarset Luar Kota (PL LK: Jabodetabek, Pantura, Jateng)',
        content: `• DIPAN (Bahan Blockboard & Multipleks LK):
  - Dipan Blockboard Fin. HPL: Rp 2.200.000,-/m
  - Dipan Multipleks Fin. HPL: Rp 2.600.000,-/m | Finishing Duco: Rp 3.100.000,-/m

• HEADBOARD (Tinggi Standar 70 CM):
  - Blockboard: Rp 1.350.000,-/m | Multipleks: Rp 1.600.000,-/m
  - Blockboard + Busa: Rp 1.850.000,-/m | Multipleks + Busa: Rp 2.100.000,-/m
  - Semi Klasik: Blockboard Rp 1.600.000,-/m | Multipleks Rp 1.900.000,-/m

• NAKAS:
  - Minimalis: Rp 2.500.000,-/m | Semi Klasik: Rp 2.800.000,-/m | Klasik: Rp 3.000.000,-/m

• PENAMBAHAN RANGKA DIPAN TINGKAT LK (Besi Hollow Lapis HPL):
  - Dipan 90 x 200: Rp 2.500.000 / unit
  - Dipan 100 x 200: Rp 2.500.000 / unit
  - Dipan 120 x 200: Rp 2.750.000 / unit
  - Dipan 160 x 200: Rp 3.250.000 / unit
  - Dipan 180 x 200: Rp 3.500.000 / unit
  - Dipan 200 x 200: Rp 3.750.000 / unit

• PRICELIST LEMARI PAKAIAN / WARDROBE LK (Standar Lebar/Kedalaman 60 CM):
  - Bahan Blockboard: Minimalis Rp 2.400.000/m | Semi Klasik Rp 2.800.000/m | Klasik Rp 3.050.000/m
  - Bahan Multipleks: Minimalis Rp 2.600.000/m | Semi Klasik Rp 2.850.000/m | Klasik Rp 3.100.000/m
  - Bahan Multipleks Cat Duco: Minimalis Rp 4.800.000/m | Semi Klasik Rp 5.300.000/m | Klasik Rp 6.300.000/m
  - Bahan Alumunium Premium (Visible Frame): Rp 5.000.000,-/m
  - Bahan Alumunium Luxury (Frameless): Rp 6.000.000,-/m
  - Tambahan Pintu Kaca: Kaca Polos Rp 750.000/m | Cermin Biasa Rp 850.000/m | Kaca Riben Rp 1.250.000/m | Cermin Bronze / Grey Rp 1.850.000/m

• PRICELIST MEJA RIAS LK:
  - Bahan Blockboard: Minimalis Rp 1.900.000/m | Semi Klasik Rp 2.200.000/m | Klasik Rp 2.400.000/m
  - Bahan Multipleks: Minimalis Rp 2.100.000/m | Semi Klasik Rp 2.450.000/m | Klasik Rp 2.600.000/m
  - Tambahan Kaca: Kaca Polos Rp 750.000/m | Cermin Biasa Rp 850.000/m | Kaca Riben Rp 1.250.000/m | Cermin Bronze / Grey Rp 1.850.000/m`,
        keywords: ['lemari', 'wardrobe', 'dipan', 'headboard', 'nakas', 'meja rias', 'kamar set', 'lk', 'jabodetabek', 'jakarta'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_living_dk',
        scope: 'GLOBAL',
        category: 'LIVING_ROOM',
        subCategory: 'dalam_kota',
        title: 'Master Price List Living Room Dalam Kota (PL DK: Bandung & Tasikmalaya)',
        content: `• BACKDROP TV DK (Standar Lebar/Kedalaman 60 CM):
  - Bahan Blockboard: Minimalis Rp 2.100.000/m | Semi Klasik Rp 2.300.000/m | Klasik Rp 2.500.000/m
  - Bahan Multipleks: Minimalis Rp 2.300.000/m | Semi Klasik Rp 2.500.000/m | Klasik Rp 2.800.000/m
  - Bahan Multipleks Cat Duco: Minimalis Rp 4.600.000/m | Semi Klasik Rp 5.100.000/m | Klasik Rp 6.100.000/m
  - Tambahan Kaca: Kaca Polos Rp 650.000/m | Cermin Biasa Rp 750.000/m | Kaca Riben Rp 1.250.000/m | Cermin Bronze / Grey Rp 1.850.000/m

• PARTISI & SEKAT RUANGAN DK:
  - Partisi Kisi-Kisi: Blockboard Rp 2.100.000/m | Multipleks Rp 2.400.000/m | Cat Duco Rp 4.500.000/m
  - Partisi Storage: Blockboard Rp 2.200.000/m | Multipleks Rp 2.300.000/m | Cat Duco Rp 4.500.000/m

• BENCH / BANGKU DUDUK DK:
  - Minimalis: Blockboard Rp 2.000.000/m | Multipleks Rp 2.200.000/m (Busa Standard +Rp 650.000/m)
  - Semi Klasik: Blockboard Rp 2.200.000/m | Multipleks Rp 2.300.000/m (Busa Standard +Rp 650.000/m)
  - Klasik: Blockboard Rp 2.300.000/m | Multipleks Rp 2.500.000/m (Busa Standard +Rp 650.000/m)

• WALLPANEL DK:
  - Multipleks HPL: Minimalis Rp 1.350.000/m | Semi Klasik Rp 1.500.000/m | Klasik Rp 1.650.000/m
  - Penambahan Cermin Biasa Bevel: Rp 1.850.000/m | Cermin Bronze / Grey Bevel: Rp 1.950.000/m
  - Wallpanel WPC: Rp 850.000,-/m

• LEMARI BAWAH TANGGA DK:
  - Blockboard: Minimalis Rp 2.300.000/m | Semi Klasik Rp 2.700.000/m | Klasik Rp 2.950.000/m
  - Multipleks: Minimalis Rp 2.500.000/m | Semi Klasik Rp 2.750.000/m | Klasik Rp 3.000.000/m
  - Multipleks Cat Duco: Minimalis Rp 4.800.000/m | Semi Klasik Rp 5.300.000/m | Klasik Rp 6.300.000/m`,
        keywords: ['tv', 'backdrop', 'partisi', 'sekat', 'bench', 'wallpanel', 'wpc', 'bawah tangga', 'dk', 'bandung', 'tasikmalaya'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_living_lk',
        scope: 'GLOBAL',
        category: 'LIVING_ROOM',
        subCategory: 'luar_kota',
        title: 'Master Price List Living Room Luar Kota (PL LK: Jabodetabek, Pantura, Jateng)',
        content: `• BACKDROP TV LK (Standar Lebar/Kedalaman 60 CM):
  - Bahan Blockboard: Minimalis Rp 2.100.000/m | Semi Klasik Rp 2.300.000/m | Klasik Rp 2.600.000/m
  - Bahan Multipleks: Minimalis Rp 2.400.000/m | Semi Klasik Rp 2.600.000/m | Klasik Rp 2.900.000/m
  - Bahan Multipleks Cat Duco: Minimalis Rp 4.600.000/m | Semi Klasik Rp 5.100.000/m | Klasik Rp 6.100.000/m
  - Tambahan Kaca: Kaca Polos Rp 750.000/m | Cermin Biasa Rp 850.000/m | Kaca Riben Rp 1.250.000/m | Cermin Bronze / Grey Rp 1.850.000/m

• PARTISI & SEKAT RUANGAN LK:
  - Partisi Kisi-Kisi: Blockboard Rp 2.200.000/m | Multipleks Rp 2.400.000/m | Cat Duco Rp 4.500.000/m
  - Partisi Storage: Blockboard Rp 2.300.000/m | Multipleks Rp 2.500.000/m | Cat Duco Rp 4.500.000/m

• BENCH / BANGKU DUDUK LK:
  - Minimalis: Blockboard Rp 2.100.000/m | Multipleks Rp 2.300.000/m (Busa Standard +Rp 650.000/m)
  - Semi Klasik: Blockboard Rp 2.300.000/m | Multipleks Rp 2.400.000/m (Busa Standard +Rp 850.000/m)
  - Klasik: Blockboard Rp 2.400.000/m | Multipleks Rp 2.500.000/m (Busa Standard +Rp 850.000/m)

• WALLPANEL LK:
  - Multipleks HPL: Minimalis Rp 1.350.000/m | Semi Klasik Rp 1.500.000/m | Klasik Rp 1.850.000/m
  - Penambahan Cermin Biasa Bevel: Rp 1.850.000/m | Cermin Bronze / Grey Bevel: Rp 1.950.000/m
  - Wallpanel WPC: Rp 950.000,-/m

• LEMARI BAWAH TANGGA LK:
  - Blockboard: Minimalis Rp 2.400.000/m | Semi Klasik Rp 2.800.000/m | Klasik Rp 3.050.000/m
  - Multipleks: Minimalis Rp 2.600.000/m | Semi Klasik Rp 2.850.000/m | Klasik Rp 3.100.000/m
  - Multipleks Cat Duco: Minimalis Rp 4.800.000/m | Semi Klasik Rp 5.300.000/m | Klasik Rp 6.300.000/m
  - Alumunium Premium (Visible Frame): Rp 6.000.000,-/m
  - Alumunium Luxury (Frameless): Rp 6.000.000,-/m`,
        keywords: ['tv', 'backdrop', 'partisi', 'sekat', 'bench', 'wallpanel', 'wpc', 'bawah tangga', 'lk', 'jabodetabek', 'jakarta'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_sipil_dk',
        scope: 'GLOBAL',
        category: 'SIPIL_BENGKEL',
        subCategory: 'dalam_kota',
        title: 'Master Price List Sipil & Bongkaran Dalam Kota (PL DK: Bandung & Sekitarnya)',
        content: `• PENGECATAN (PxT): Jasa saja Rp 80.000/m | Jasa borong Rp 200.000/m
• PINDAH TITIK (Px):
  - Titik Air (Jasa Saja): Rp 250.000 / titik | Jasa Borong: Rp 750.000 / titik
  - Titik Listrik (Jasa Saja): Rp 250.000 / titik | Jasa Borong: Rp 650.000 / titik
• PASANG BACKSPLASH (Px): Bevel Biasa Rp 850.000 | Mozaic Rp 1.100.000
• BIKIN CORAN (Meja Beton Dapur) (Px): Jasa Borong Rp 2.400.000
• WALL MOULDING: Jasa Borong Keliling x Rp 250.000
• BOBOK LUBANG KOMPOR & SINK: Jasa Borong Rp 500.000 / lubang
• BONGKAR CORAN:
  - < 1 meter: Rp 850.000
  - 1-2 meter: Rp 1.000.000
  - 2-3 meter: Rp 1.500.000
  - 3-5 meter: Rp 2.000.000
  - > 5 meter: Rp 3.000.000
• BONGKAR BACKSPLASH:
  - 0-2 meter: Rp 850.000
  - 2-3 meter: Rp 1.000.000
  - 3-5 meter: Rp 1.500.000
  - > 5 meter: Rp 2.500.000
• BONGKAR KABINET:
  - 0-2 meter: Rp 850.000
  - 2-4 meter: Rp 1.250.000
  - 4-6 meter: Rp 1.750.000
  - > 6 meter: Rp 2.750.000
• BONGKARAN PAKET (Px):
  - Coran + Back Splash + CA + CB: Rp 1.750.000
  - Coran + Back Splash + CA/CB: Rp 1.500.000
  - Coran + CA + CB: Rp 1.500.000
  - Coran + Back Splash: Rp 1.250.000
  - Coran + CA/CB: Rp 1.250.000
  - Back Splash + CA + CB: Rp 1.000.000
  - Back Splash + CA/CB: Rp 750.000
  (Perkalian meteran diambil yang paling panjang)
• Biaya Transport Dalam Kota: Rp 500.000,-`,
        keywords: ['sipil', 'cor', 'coran', 'meja beton', 'bongkar', 'cat', 'titik air', 'titik listrik', 'backsplash', 'moulding', 'bobok', 'dk', 'bandung'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_sipil_lk',
        scope: 'GLOBAL',
        category: 'SIPIL_BENGKEL',
        subCategory: 'luar_kota',
        title: 'Master Price List Sipil Umum Luar Kota (PL LK: Jabodetabek, Pantura, Jateng)',
        content: `• PENGECATAN (PxT): Jasa saja Rp 90.000/m | Jasa borong Rp 125.000/m
• PINDAH TITIK (Px):
  - Titik Air (Jasa Borong): Rp 450.000 / meter
  - Titik Listrik (Jasa Borong): Rp 650.000 / meter
  (Jika di bawah 1 meter dihitung 1 meter)
• PASANG BACKSPLASH (Px): Bevel Biasa Rp 1.050.000 | Bevel Model Rp 1.150.000 | Mozaic Rp 1.500.000
• BIKIN CORAN (Meja Beton Dapur) (Px): Finishing Acian Rp 1.900.000 | Finishing Keramik Rp 2.400.000
• WALL MOULDING: Jasa Borong Keliling x Rp 250.000
• BOBOK LUBANG KOMPOR & SINK: Jasa Borong Rp 750.000 / lubang
• BONGKAR CORAN: Panjang 0-5 meter Rp 1.750.000 | > 5 meter Menyesuaikan Volume
• BONGKAR BACKSPLASH: Panjang 0-5 meter Rp 1.750.000 | > 5 meter Menyesuaikan Volume
• BONGKAR KABINET: Panjang 0-3 meter Rp 2.000.000 | 3-5 meter Rp 2.750.000 | > 5 meter Rp 3.250.000
• KERAMIK & LANTAI LK:
  - Bongkar Keramik (Standard): Rp 350.000 / m² | Pasang Keramik (Standard): Rp 650.000 / m²
  - Decking: Rp 2.250.000 / m² | Rumput Sintetis: Rp 1.500.000 / m²
  - Vinyl Lem (Standard): Rp 850.000 / m² | Vinyl Lem (Herringbone): Rp 950.000 / m² | Vinyl Click: Rp 950.000 / m²`,
        keywords: ['sipil', 'keramik', 'vinyl', 'decking', 'bongkar', 'cor', 'coran', 'meja beton', 'backsplash', 'lk', 'jabodetabek'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_bengkel_las',
        scope: 'GLOBAL',
        category: 'SIPIL_BENGKEL',
        subCategory: 'canopi_pagar',
        title: 'Master Price List Bengkel Las (Canopi Spandex/Alderon & Pagar Wire Mesh) DK & LK',
        content: `• PRICE LIST CANOPI (SPANDEX & ALDERON):
  - Holo 4x4 Atap Spandek: Rp 1.200.000 / m²
  - Holo 4x6 Atap Spandek: Rp 1.400.000 / m²
  - Holo 4x4 Atap Alderon Double Layer: Rp 1.600.000 / m²
  - Holo 4x6 Atap Alderon Double Layer: Rp 1.800.000 / m²
  - Baja Ringan Atap Spandek: Rp 750.000 / m²
  - Tambahan Bukaan Atap: Manual Rp 1.200.000 / unit | Otomatis: Rp 4.250.000 / unit
  - Atap Kaca (Rangka & Tiang Menyesuaikan): Ketebalan Kaca mulai Rp 2.800.000 / m²

• PRICE LIST PAGAR (BESI HOLLOW & JARING WIRE MESH):
  - Minimalis: Rp 1.800.000 / m²
  - Modern Minimalis: Rp 2.100.000 / m²
  - Modern Classic: Rp 2.400.000 / m²
  - Full Classic: Rp 4.800.000 / m²
  - Rangka Besi: Rp 1.800.000 / m²

• ONGKIR BENGKEL LAS:
  - Pemesanan Dalam Kota (Bandung & sekitarnya): Rp 500.000,-
  - Pemesanan Wilayah Luar Kota (Jabodetabek, Pantura, Jateng, Jatim): Rp 1.500.000,-

• LAYANAN RESMI: GRATIS Survey (Bandung & sekitarnya), GRATIS Konsultasi, GRATIS Desain 3D.`,
        keywords: ['kanopi', 'canopi', 'alderon', 'spandek', 'pagar', 'railing', 'bengkel las', 'besi', 'hollow', 'wire mesh', 'dk', 'lk'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_services_sop',
        scope: 'GLOBAL',
        category: 'SOP_SALES',
        subCategory: 'policy',
        title: 'Master SOP Penjualan, Ketentuan Ongkir & Termin Pembayaran',
        content: `• KETENTUAN LAYANAN GRATIS:
  - GRATIS Konsultasi & Estimasi RAB Awal
  - GRATIS Survey Pengukuran Lokasi (Area Bandung, Tasikmalaya, & Jabodetabek) tanpa ikatan komitmen
  - GRATIS Desain 3D Spatial Layout setelah pengukuran

• GARANSI RESMI:
  - Material Blockboard: Garansi 3 Bulan pasca serah terima unit
  - Material Multipleks & PVC: Garansi 6 Bulan penuh pasca serah terima unit
  - Project di atas Rp 200 Juta: Garansi 1 Tahun penuh pasca serah terima unit

• SKEMA TERMIN PEMBAYARAN:
  - DP 50% saat fabrikasi workshop dimulai
  - 40% progres workshop sebelum kirim/instalasi
  - 10% pelunasan setelah instalasi & serah terima unit

• ATURAN MINIMAL PROJECT & ONGKIR:
  - Dalam Kota (PL DK: Bandung & Tasikmalaya): Project di bawah Rp 10jt dikenakan ongkir Rp 500.000,-.
  - Luar Kota (PL LK: Jabodetabek, Pantura, Jateng, Jatim): Project di bawah Rp 15jt dikenakan ongkir Rp 500.000,- (Bandung), atau Rp 1.000.000,- untuk wilayah Jabodetabek, Pantura, Jateng, Jatim (Bengkel Las Luar Kota Rp 1.500.000,-).`,
        keywords: ['survei', 'survey', 'desain 3d', 'gratis', 'garansi', 'termin', 'dp', 'ongkir', 'minimal project', 'sop', 'dk', 'lk'],
        priority: 10,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'core_estimator_master_pricelist_2026',
        scope: 'GLOBAL',
        category: 'PRICELIST_CALCULATOR_2026',
        subCategory: 'all_regions',
        title: 'Master Price List 2026 & Rumus Kalkulator Estimasi Lengkap (Putra Corporation)',
        content: `• MASTER PRICELIST 2026 LENGKAP (24 HALAMAN DOKUMEN RESMI):

1. KITCHENSET (PL DK: Bandung & Tasikmalaya / PL LK: Luar Kota & Jabodetabek):
   - Cabinet Bawah (CB) & Cabinet Atas (CA): Masing-masing dihitung terpisah per meter lari (m') sesuai kebutuhan tata ruang dapur klien:
     * Klien dapat memesan satu set lengkap (Cabinet Bawah + Cabinet Atas), atau hanya Cabinet Bawah saja / Cabinet Atas saja.
   - Blockboard Minimalis: DK Rp 2.000.000/m | LK Rp 2.300.000/m
   - Blockboard Semi Klasik: DK Rp 2.500.000/m | LK Rp 2.600.000/m
   - Blockboard Klasik: DK Rp 2.900.000/m | LK Rp 3.000.000/m
   - Multiplek Minimalis: DK Rp 2.500.000/m | LK Rp 2.600.000/m
   - Multiplek Semi Klasik: DK Rp 2.700.000/m | LK Rp 2.800.000/m
   - Multiplek Klasik: DK Rp 3.200.000/m | LK Rp 3.300.000/m
   - Multiplek Duco Luxury: DK Rp 4.000.000/m (Minimalis) - Rp 4.700.000/m (Klasik) | LK Rp 4.000.000/m - Rp 4.800.000/m
   - Duco Klasik (Double Profil): DK Rp 6.100.000/m | LK Rp 6.200.000/m
   - Industrial: DK Rp 2.000.000 - Rp 2.300.000/m (Rangka Besi +Rp 1.800.000/m DK, Rp 2.100.000/m LK | +Wire Mesh Rp 2.000.000/m DK, Rp 2.300.000/m LK)
   - Kabinet Atas Full Plafon: Tingkat 2 (T < 50cm): Rp 1.800.000 - Rp 2.400.000/m | Tingkat 2 (T 50-70cm): Rp 1.950.000 - Rp 2.600.000/m
   - Cabinet Bawah Pintu Kusen Saja (Meja Cor Beton): Minimalis Rp 1.450.000/m | Klasik Rp 1.650.000/m
   - Top Table (Meja Countertop Dapur per meter lari m'):
     * Aica (HPL / Solid Surface): Rp 1.400.000,- / meter
     * Quadra (Sintered Stone Mewah): Rp 2.300.000,- / meter
     * Granit (Batu Alam Solid Nero): Rp 2.800.000,- / meter
   - Backsplash (Dinding Dapur per meter lari m'):
     * Aica Splash Panel: Rp 1.400.000,- / meter
     * Quadra Sintered Stone: Rp 2.300.000,- / meter
     * Granit Backsplash: Rp 2.800.000,- / meter
     * Keramik Bevel / Subway: DK Rp 850.000/m | LK Rp 1.050.000/m
     * Mozaic Tile: DK Rp 1.100.000/m | LK Rp 1.500.000/m
     * Cermin Bronze / Grey Bevel: Rp 1.850.000/m
   - Elemen Kitchen Set Tambahan:
     * Topi Bar: Blockboard Rp 1.250.000 - Rp 1.350.000/m | Multipleks Rp 1.450.000/m | Duco Rp 2.100.000/m
     * Box Elektronik (Kulkas/Oven): T < 1m Rp 2.100.000 - Rp 2.600.000/unit | T > 1m Rp 2.200.000 - Rp 2.700.000/unit
     * Hambalan Floating: +LED Strip Rp 500.000 - Rp 600.000/pcs | Polos Rp 450.000 - Rp 550.000/pcs

2. LEMARI BAWAH TANGGA:
   - Rumus Standar (Kedalaman 60cm): Panjang x Tinggi x 0,8 x Harga
   - Jika Kedalaman > 60cm: Panjang x Tinggi x Harga
   - Blockboard: DK Minimalis Rp 2.300.000/m, Semi Klasik Rp 2.700.000/m, Klasik Rp 2.950.000/m | LK Minimalis Rp 2.400.000/m, Semi Klasik Rp 2.850.000/m, Klasik Rp 3.050.000/m
   - Multipleks: DK Minimalis Rp 2.500.000/m, Semi Klasik Rp 2.750.000/m, Klasik Rp 3.000.000/m | LK Minimalis Rp 2.600.000/m, Semi Klasik Rp 2.850.000/m, Klasik Rp 3.100.000/m
   - Multipleks Cat Duco: Minimalis Rp 4.800.000/m (DK) / Rp 4.100.000/m (LK), Klasik Rp 6.300.000/m (DK) / Rp 5.500.000/m (LK)

3. LEMARI WARDROBE (Standar Kedalaman 60cm):
   - Rumus: Panjang x Tinggi x Harga per m2
   - Blockboard: DK Rp 2.300.000 - Rp 2.950.000/m2 | LK Rp 2.400.000 - Rp 3.050.000/m2
   - Multipleks: DK Rp 2.500.000 - Rp 3.000.000/m2 | LK Rp 2.600.000 - Rp 3.100.000/m2
   - Add-on Pintu Kaca: Kaca Polos Rp 650.000 - Rp 750.000/m2 | Kaca Riben Rp 1.250.000/m2 | Cermin Biasa Rp 750.000 - Rp 850.000/m2 | Cermin Bronze / Grey Rp 1.850.000/m2

4. BACKDROP TV:
   - Rumus: Panjang x Tinggi x Harga per m2
   - Blockboard: DK Rp 2.100.000 - Rp 2.500.000/m2 | LK Rp 2.100.000 - Rp 2.600.000/m2
   - Multipleks HPL: DK Rp 2.300.000 - Rp 2.800.000/m2 | LK Rp 2.400.000 - Rp 2.900.000/m2
   - Multipleks Duco: Rp 4.600.000 - Rp 6.100.000/m2

5. MINI BAR & MEJA ISLAND:
   - Rumus: (Panjang : 0,6) x Harga per unit
   - Blockboard: DK Rp 2.100.000 - Rp 2.500.000 | LK Rp 2.300.000 - Rp 2.700.000
   - Multipleks: DK Rp 2.500.000 - Rp 2.700.000 | LK Rp 2.500.000 - Rp 2.700.000

6. TOPI BAR, BOX ELEKTRONIK & HAMBALAN:
   - Topi Bar: Blockboard Rp 1.250.000 - Rp 1.350.000/m | Multiplek Rp 1.450.000/m | Duco Rp 2.100.000/m
   - Box Elektronik (P < 1m): Tinggi x Rp 2.100.000 - Rp 2.600.000 | (P > 1m): P x T x Rp 2.200.000 - Rp 2.700.000
   - Hambalan: Lampu Rp 500.000 - Rp 600.000 / pcs | Tanpa Lampu Rp 450.000 - Rp 550.000 / pcs

7. DIPAN, HEADBOARD & NAKAS:
   - Dipan Blockboard HPL: P x L x Rp 2.100.000 (DK) / Rp 2.200.000 (LK)
   - Dipan Multiplek HPL: P x L x Rp 2.500.000 (DK) / Rp 2.600.000 (LK) | Duco: P x L x Rp 3.100.000
   - Headboard (Tinggi Standar 70cm): Blockboard Rp 1.350.000/m | Multipleks Rp 1.600.000/m | +Busa Rp 1.850.000 - Rp 2.100.000/m
   - Rangka Dipan Tingkat (Besi Hollow Lapis HPL): 90x200 (Rp 2jt DK / Rp 2,5jt LK), 120x200 (Rp 2,25jt DK / Rp 2,75jt LK), 160x200 (Rp 2,75jt DK / Rp 3,25jt LK), 180x200 (Rp 3jt DK / Rp 3,5jt LK), 200x200 (Rp 3,25jt DK / Rp 3,75jt LK)

8. CRADIENZA / KREDENSA:
   - Rumus: Panjang x Harga
   - Blockboard: Minimalis Rp 1.900.000/m | Semi Klasik Rp 2.200.000/m | Klasik Rp 2.400.000/m
   - Multipleks: Minimalis Rp 2.100.000/m | Semi Klasik Rp 2.450.000/m | Klasik Rp 2.600.000/m | Duco: Rp 2.600.000 - Rp 3.600.000/m

9. WALLPANEL & KACA CERMIN BEVEL:
   - Wallpanel Multiplek: Minimalis Rp 1.350.000/m2 | Semi Klasik Rp 1.500.000/m2 | Klasik Rp 1.650.000/m2 | Duco Rp 2.750.000/m2
   - Kaca Bevel: Cermin Biasa Rp 1.850.000/m2 | Cermin Bronze / Grey Rp 1.950.000/m2

10. PARTISI & BENCH:
    - Partisi Multipleks: Minimalis Rp 2.400.000/m2 | Duco Rp 4.500.000/m2
    - Bench: Blockboard Rp 2.100.000/m | Multipleks Rp 2.600.000/m

11. SOFA CUSTOM:
    - Rumus: (Panjang : 0,60) x Harga
    - Minimalis: Rp 1.650.000 | Klasik: Rp 2.000.000
    - Upgrade Cover: Kulit Oscar +Rp 100.000/m | Kulit MBtech +Rp 175.000/m | Corduroy Premium +Rp 150.000/m
    - Gratis bantal jika pembelian > 2 seat | Ongkir luar kota Rp 750.000,-

• KETENTUAN PROYEK & FREE ONGKIR:
- Finishing HPL Luar & Dalam: Tambahan Rp 700.000,- / meter
- Dalam Kota (Bandung & Tasik): Order < Rp 10.000.000 dikenakan Ongkir Rp 500.000,- dan biaya penambahan Rak Bumbu & Piring. Order >= Rp 10.000.000 GRATIS Ongkir Bandung & sekitarnya.
- Luar Kota (Jabodetabek, Pantura, Jateng, Jatim): Order < Rp 15.000.000 dikenakan Ongkir Rp 500.000,-. Order >= Rp 15.000.000 GRATIS Ongkir.`,
        keywords: ['kalkulator', 'estimasi', 'rab', 'pricelist 2026', 'kitchen', 'lemari', 'backdrop', 'bawah tangga', 'sofa', 'dipan', 'cradienza', 'wallpanel', 'partisi', 'minibar', 'dk', 'lk'],
        priority: 15,
        version: '2026.2',
        isActive: true
    }
];

export const DEFAULT_BRAND_OVERRIDES = [
    {
        id: 'override_putra_kitchen',
        scope: 'BRAND_OVERRIDE',
        brandId: 'brand_putra',
        category: 'KITCHEN_SET',
        subCategory: 'dalam_kota',
        title: 'Putra Interior — Pricelist Kitchen Set Langsung Workshop',
        content: `• Multipleks Plywood 18mm Fin. HPL: Rp 2,4jt - 3,0jt/m (Tarif Khusus Langsung Pengrajin/Workshop)
• Blockboard 18mm Fin. HPL: Rp 2,0jt - 2,3jt/m
• PVC Board 100% Anti Air: Rp 3,9jt - 4,4jt/m
• Spesialisasi: Fabrikasi Cepat Workshop 10-14 Hari Kerja`,
        keywords: ['kitchen', 'dapur', 'putra', 'workshop', 'harga', 'pengrajin'],
        priority: 50,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'override_heya_kitchen',
        scope: 'BRAND_OVERRIDE',
        brandId: 'brand_heya',
        category: 'KITCHEN_SET',
        subCategory: 'dalam_kota',
        title: 'Heya Interior — Paket Scandinavian Minimalist Kitchen',
        content: `• Multipleks Premium HPL Woodgrain & Solid Matte: Rp 2,6jt - 3,3jt/m
• PVC Board Waterproof Area Sink: Rp 4,1jt - 4,8jt/m
• Free Aksesoris: Rak Piring Tarik Stainless & Slow-Motion Hinges`,
        keywords: ['kitchen', 'dapur', 'heya', 'scandinavian', 'minimalis', 'harga'],
        priority: 50,
        version: '2026.2',
        isActive: true
    },
    {
        id: 'override_kurnia_kitchen',
        scope: 'BRAND_OVERRIDE',
        brandId: 'brand_kurnia',
        category: 'KITCHEN_SET',
        subCategory: 'dalam_kota',
        title: 'Kurnia Interior — Paket Kitchen Set Eksklusif',
        content: `• Multipleks Plywood 18mm Grade Premium HPL: Rp 2,6jt - 3,3jt/m (Include Rel Soft Close & LED Strip Warm White)
• PVC Board Waterproof Anti Air: Rp 4,2jt - 4,9jt/m
• Garansi Pemeliharaan Ekstra: 12 Bulan Penuh (Khusus Brand Kurnia Interior)`,
        keywords: ['kitchen', 'dapur', 'kurnia', 'harga'],
        priority: 50,
        version: '2026.2',
        isActive: true
    }
];

export const DEFAULT_GEMINI_API_KEY = 'REMOVED_SECRET';
export const DEFAULT_GEMINI_MODEL = 'gemini-flash-lite-latest';

// Status Pipeline CRM
export const PIPELINE_STAGES = [
    { id: 'NEW_LEAD', label: 'Prospek Masuk (New)', badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'CONSULTATION', label: 'Konsultasi / Tanya Harga', badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'SURVEY_READY', label: 'Jadwal Survei Gratis', badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'DESIGN_REVIEW', label: 'Review Desain 3D', badgeClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { id: 'QUOTATION', label: 'Pengajuan Penawaran / RAB', badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { id: 'NEGOTIATION', label: 'Negosiasi / Revisi', badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { id: 'DEAL', label: 'Closing Deal (DP Masuk)', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'HOLD', label: 'Hold / Menunggu Kunci/Renov', badgeClass: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
    { id: 'LOST', label: 'Batal / Unqualified', badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30' }
];

export const LEAD_STATUS_OPTIONS = [
    'Prospek / Survey',
    'Design Review',
    'Penawaran RAB',
    'Closing / DP Masuk',
    'Selesai / Terpasang',
    'Batal'
];

export const CANONICAL_LEAD_STATUS_MAP = {
    'Prospek / Survey': 'Prospek / Survey',
    'Design Review': 'Design Review',
    'Penawaran RAB': 'Penawaran RAB',
    'Closing / DP Masuk': 'Closing / DP Masuk',
    'Selesai / Terpasang': 'Selesai / Terpasang',
    'Batal': 'Batal',
    'Prospek': 'Prospek / Survey',
    'Survey': 'Prospek / Survey',
    'Design': 'Design Review',
    'RAB': 'Penawaran RAB',
    'Closing': 'Closing / DP Masuk',
    'Deal': 'Closing / DP Masuk',
    'DP': 'Closing / DP Masuk',
    'Selesai': 'Selesai / Terpasang',
    'Lost': 'Batal'
};

export const TASK_STATUS_OPTIONS = ['Pending', 'Selesai'];

export const AI_RESPONSE_MODES = [
    { 
        id: 'SMART_REPLY', 
        label: '⚡ Smart Auto Reply', 
        tagline: 'Deteksi Otomatis & Solutif',
        desc: 'Otomatis analisis konteks chat & balas paling tepat sasaran', 
        badge: 'Default SOP' 
    },
    { 
        id: 'PRICE_EXPLANATION', 
        label: '💰 Transparansi Harga', 
        tagline: 'Estimasi RAB & Edukasi Bahan',
        desc: 'Rincian harga per meter (DK vs LK) & spesifikasi 18mm + PVC', 
        badge: 'Pricelist' 
    },
    { 
        id: 'SURVEY_INVITATION', 
        label: '📐 Ajak Survei Gratis', 
        tagline: 'Ukur Lokasi & Desain 3D',
        desc: 'Arahkan booking survei lokasi & ukur gratis tanpa risiko', 
        badge: 'Survei' 
    },
    { 
        id: 'OBJECTION_HANDLING', 
        label: '🛡️ Tangani Keberatan', 
        tagline: 'Atasi Mahal & Ragu Vendor',
        desc: 'Patahkan komparasi vendor dengan edukasi kualitas & win-win', 
        badge: 'Negosiasi' 
    },
    { 
        id: 'FOLLOW_UP', 
        label: '⏰ Follow-Up Halus', 
        tagline: 'Pancing Respon Ghosting',
        desc: 'Sapa prospek pasif dengan referensi karya & rute tim survei', 
        badge: 'Follow-Up' 
    },
    { 
        id: 'CLOSING', 
        label: '🤝 Dorong DP / Closing', 
        tagline: 'Kunci Antrian Workshop',
        desc: 'Bantu klien amankan kuota perakitan dengan termin DP 50%', 
        badge: 'Closing' 
    }
];

// Fallback untuk backward compatibility
export const PRICE_MASTER = {
    kitchenBandung: GLOBAL_CORE_KNOWLEDGE[0].content,
    kitchenJabodetabek: GLOBAL_CORE_KNOWLEDGE[1].content,
    wardrobe: GLOBAL_CORE_KNOWLEDGE[2].content,
    livingRoom: GLOBAL_CORE_KNOWLEDGE[3].content,
    sipilBengkel: GLOBAL_CORE_KNOWLEDGE[4].content,
    services: GLOBAL_CORE_KNOWLEDGE[5].content,
    specifications: "Multipleks Plywood 18mm, Blockboard 18mm, PVC Board Waterproof, Cat Duco, Finishing HPL."
};
