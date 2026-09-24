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

// Global Shared Core Knowledge (Milik Bersama Seluruh Brand)
export const GLOBAL_CORE_KNOWLEDGE = [
    {
        id: 'core_kitchen_bdg',
        scope: 'GLOBAL',
        category: 'KITCHEN_SET',
        subCategory: 'bandung',
        title: 'Master Price List Kitchen Set (Bandung & Sekitarnya)',
        content: `• Blockboard 18mm: Minimalis Rp 2,0jt/m | Semi Klasik Rp 2,5jt/m | Klasik Rp 2,9jt/m
• Multipleks Plywood 18mm (Rekomendasi Utama): Minimalis Rp 2,5jt/m | Semi Klasik Rp 2,7jt/m | Klasik Rp 3,2jt/m
• PVC Board Waterproof (Area basah/bawah wastafel 100% anti air & anti rayap): Rp 4,0jt - Rp 4,8jt/m
• Finishing Cat Duco: Mulai Rp 4,0jt - Rp 5,5jt/m
• Alumunium & ACP (Rangka non-kayu tahan api): Rp 3,3jt - Rp 4,5jt/m`,
        keywords: ['kitchen', 'dapur', 'kitchen set', 'bandung', 'harga', 'per meter', 'sink'],
        priority: 10,
        version: '2026.1',
        isActive: true
    },
    {
        id: 'core_kitchen_jkt',
        scope: 'GLOBAL',
        category: 'KITCHEN_SET',
        subCategory: 'jabodetabek',
        title: 'Master Price List Kitchen Set (Jabodetabek)',
        content: `• Blockboard 18mm: Minimalis Rp 2,3jt/m | Semi Klasik Rp 2,6jt/m | Klasik Rp 3,0jt/m
• Multipleks Plywood 18mm: Minimalis Rp 2,6jt/m | Semi Klasik Rp 2,8jt/m | Klasik Rp 3,3jt/m
• PVC Board Waterproof: Rp 4,1jt - Rp 4,8jt/m
• Alumunium & ACP: Rp 3,5jt - Rp 5,5jt/m`,
        keywords: ['kitchen', 'dapur', 'jabodetabek', 'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi'],
        priority: 10,
        version: '2026.1',
        isActive: true
    },
    {
        id: 'core_wardrobe',
        scope: 'GLOBAL',
        category: 'WARDROBE',
        subCategory: 'bedroom',
        title: 'Master Price List Wardrobe, Kamar Set & Dipan',
        content: `• Lemari / Wardrobe Multipleks HPL: Bandung mulai Rp 2,5jt/m | Jabodetabek mulai Rp 2,6jt/m
• Lemari Finishing Cat Duco: Mulai Rp 4,8jt - Rp 6,3jt/m
• Lemari Alumunium Luxury Frameless Glass: Rp 5,0jt - Rp 6,0jt/m
• Dipan Multipleks HPL: Rp 2,5jt - Rp 2,6jt/m | Blockboard Rp 2,1jt - Rp 2,2jt/m
• Headboard: Mulai Rp 1,35jt - Rp 1,6jt/m (Busa +Rp 250rb - 500rb/m)
• Meja Rias Custom: Rp 1,9jt - Rp 2,6jt/m`,
        keywords: ['lemari', 'wardrobe', 'kamar', 'dipan', 'ranjang', 'meja rias', 'baju'],
        priority: 10,
        version: '2026.1',
        isActive: true
    },
    {
        id: 'core_living',
        scope: 'GLOBAL',
        category: 'LIVING_ROOM',
        subCategory: 'living',
        title: 'Master Price List Living Room & Area Lainnya',
        content: `• Backdrop TV Multipleks HPL: Mulai Rp 2,3jt - Rp 2,9jt/m (Cat Duco Rp 4,6jt - 6,1jt/m)
• Partisi / Sekat Ruangan Minimalis: Rp 2,1jt - Rp 2,5jt/m
• Cradienza & Rak TV: Rp 1,9jt - Rp 2,6jt/m
• Wallpanel WPC: Rp 850rb - Rp 950rb/m | Wallpanel Multipleks Kaca Bevel: Rp 1,35jt - Rp 1,95jt/m
• Lemari Bawah Tangga: Rp 2,3jt - Rp 2,5jt/m
• Minibar & Meja Island: Rp 2,1jt - Rp 2,7jt/m`,
        keywords: ['tv', 'backdrop', 'partisi', 'sekat', 'wallpanel', 'bawah tangga', 'island', 'minibar'],
        priority: 10,
        version: '2026.1',
        isActive: true
    },
    {
        id: 'core_sipil',
        scope: 'GLOBAL',
        category: 'SIPIL_BENGKEL',
        subCategory: 'civil',
        title: 'Master Price List Sipil, Kanopi & Bengkel Las',
        content: `• Canopi Spandek / Alderon: Rangka Baja/Besi Hollow Rp 750rb - Rp 1,8jt/m² (Atap Kaca mulai Rp 2,8jt/m²)
• Pagar Besi Hollow & Wire Mesh: Rp 1,8jt - Rp 2,4jt/m²
• Meja Coran Dapur Beton: Rp 1,9jt - Rp 2,4jt/m
• Pasang Backsplash & Keramik: Rp 650rb - Rp 1,5jt/m`,
        keywords: ['kanopi', 'canopi', 'pagar', 'las', 'sipil', 'cor', 'keramik', 'backsplash', 'atap'],
        priority: 10,
        version: '2026.1',
        isActive: true
    },
    {
        id: 'core_services_sop',
        scope: 'GLOBAL',
        category: 'SOP_SALES',
        subCategory: 'policy',
        title: 'SOP Penjualan & Layanan Gratis Resmi',
        content: `• GRATIS Konsultasi & Estimasi Rencana Anggaran Biaya (RAB) Awal
• GRATIS Survey Pengukuran Lokasi (Area Bandung & Jabodetabek) tanpa ikatan komitmen
• GRATIS Desain 3D & Spatial Layout setelah survei pengukuran
• Garansi Pemeliharaan 6 Bulan Pasca Serah Terima Unit
• Skema Termin Pembayaran: DP 50% saat fabrikasi workshop, 40% progres sebelum kirim, 10% pelunasan pasca instalasi & serah terima`,
        keywords: ['survei', 'survey', 'desain 3d', 'gratis', 'garansi', 'termin', 'pembayaran', 'dp', 'biaya'],
        priority: 10,
        version: '2026.1',
        isActive: true
    }
];

export const DEFAULT_BRAND_OVERRIDES = [
    {
        id: 'override_putra_kitchen',
        scope: 'BRAND_OVERRIDE',
        brandId: 'brand_putra',
        category: 'KITCHEN_SET',
        subCategory: 'bandung',
        title: 'Putra Interior — Pricelist Kitchen Set Langsung Workshop',
        content: `• Multipleks Plywood 18mm Fin. HPL: Rp 2,4jt - 3,0jt/m (Tarif Khusus Langsung Pengrajin/Workshop)
• Blockboard 18mm Fin. HPL: Rp 2,0jt - 2,3jt/m
• PVC Board 100% Anti Air: Rp 3,9jt - 4,4jt/m
• Spesialisasi: Fabrikasi Cepat Workshop 10-14 Hari Kerja`,
        keywords: ['kitchen', 'dapur', 'putra', 'workshop', 'harga', 'pengrajin'],
        priority: 50,
        version: '2026.1',
        isActive: true
    },
    {
        id: 'override_heya_kitchen',
        scope: 'BRAND_OVERRIDE',
        brandId: 'brand_heya',
        category: 'KITCHEN_SET',
        subCategory: 'bandung',
        title: 'Heya Interior — Paket Scandinavian Minimalist Kitchen',
        content: `• Multipleks Premium HPL Woodgrain & Solid Matte: Rp 2,6jt - 3,3jt/m
• PVC Board Waterproof Area Sink: Rp 4,1jt - 4,8jt/m
• Free Aksesoris: Rak Piring Tarik Stainless & Slow-Motion Hinges`,
        keywords: ['kitchen', 'dapur', 'heya', 'scandinavian', 'minimalis', 'harga'],
        priority: 50,
        version: '2026.1',
        isActive: true
    },
    {
        id: 'override_kurnia_kitchen',
        scope: 'BRAND_OVERRIDE',
        brandId: 'brand_kurnia',
        category: 'KITCHEN_SET',
        subCategory: 'bandung',
        title: 'Kurnia Interior — Paket Kitchen Set Eksklusif',
        content: `• Multipleks Plywood 18mm Grade Premium HPL: Rp 2,6jt - 3,3jt/m (Include Rel Soft Close & LED Strip Warm White)
• PVC Board Waterproof Anti Air: Rp 4,2jt - 4,9jt/m
• Garansi Pemeliharaan Ekstra: 12 Bulan Penuh (Khusus Brand Kurnia Interior)`,
        keywords: ['kitchen', 'dapur', 'kurnia', 'harga'],
        priority: 50,
        version: '2026.1',
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
    { id: 'SMART_REPLY', label: '⚡ Smart Auto Reply', desc: 'Analisis percakapan & buat 3 alternatif balasan optimal' },
    { id: 'PRICE_EXPLANATION', label: '💰 Transparansi Harga', desc: 'Fokus jelaskan estimasi per meter dan keunggulan bahan' },
    { id: 'SURVEY_INVITATION', label: '📐 Ajak Survei Gratis', desc: 'Arahkan klien untuk booking jadwal survei & ukur lokasi' },
    { id: 'OBJECTION_HANDLING', label: '🛡️ Tangani Keberatan', desc: 'Atasi respon mahal, bandingkan vendor, atau ragu' },
    { id: 'FOLLOW_UP', label: '⏰ Follow-Up Halus', desc: 'Pancing respon klien yang belum membalas tanpa mendesak' },
    { id: 'CLOSING', label: '🤝 Dorong DP / Closing', desc: 'Kunci kesepakatan produksi dan komitmen awal' }
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
