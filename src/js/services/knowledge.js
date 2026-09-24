// File: src/js/services/knowledge.js
import { StorageService } from './storage.js';
import { GLOBAL_CORE_KNOWLEDGE, DEFAULT_BRAND_OVERRIDES } from '../constants.js';

// Versi 2026.2 memuat Master Price List DK (Dalam Kota) & LK (Luar Kota) lengkap
const KNOWLEDGE_ITEMS_KEY = 'multibrand_knowledge_items_v2026_2';

export const KnowledgeService = {
    // Membaca seluruh data knowledge tersimpan (Global + Brand + Campaign)
    getAllItems: () => {
        const stored = StorageService.getItem(KNOWLEDGE_ITEMS_KEY, null);
        if (stored && Array.isArray(stored) && stored.length > 0) {
            return stored;
        }
        // Gabungkan initial data resmi 2026.2
        const initial = [...GLOBAL_CORE_KNOWLEDGE, ...DEFAULT_BRAND_OVERRIDES];
        StorageService.setItem(KNOWLEDGE_ITEMS_KEY, initial);
        return initial;
    },

    saveAllItems: (items) => {
        StorageService.setItem(KNOWLEDGE_ITEMS_KEY, items);
    },

    // Resolusi Knowledge dengan urutan hierarki mutlak:
    // Priority: CAMPAIGN (100) > BRAND OVERRIDE (50) > GLOBAL (10)
    // Mendukung pemisahan cerdas: PL DK (Dalam Kota) vs PL LK (Luar Kota)
    resolveKnowledge: ({ brandId, queryText = '', category = null }) => {
        const allItems = KnowledgeService.getAllItems();
        const todayStr = new Date().toISOString().slice(0, 10);

        // 1. Filter item yang aktif dan relevan untuk brand aktif atau global
        const activeItems = allItems.filter(item => {
            if (!item.isActive) return false;
            // Cek masa berlaku campaign jika ada
            if (item.effectiveUntil && item.effectiveUntil < todayStr) return false;
            if (item.effectiveFrom && item.effectiveFrom > todayStr) return false;

            // Global terbuka untuk semua brand
            if (item.scope === 'GLOBAL') return true;
            // Brand & Campaign khusus brand aktif
            if (item.brandId === brandId) return true;

            return false;
        });

        // 2. Deteksi relevansi query jika queryText diberikan
        const normalizedQuery = (queryText || '').toLowerCase();
        
        let matchingItems = activeItems;
        if (normalizedQuery.trim().length > 2) {
            const isDkQuery = /\bdk\b|dalam kota|bandung|tasik|tasikmalaya|ciamis|garut/i.test(normalizedQuery);
            const isLkQuery = /\blk\b|luar kota|jabodetabek|jakarta|bogor|depok|tangerang|bekasi|pantura|jateng|jatim|surabaya|semarang/i.test(normalizedQuery);
            const isKitchenQuery = /dapur|kitchen|kitchen set|sink|kompor|masak|hpl|multipleks|pvc|duco|alumunium/i.test(normalizedQuery);
            const isWardrobeQuery = /lemari|wardrobe|kamar|baju|dipan|ranjang|headboard|nakas|meja rias/i.test(normalizedQuery);
            const isLivingQuery = /tv|backdrop|partisi|sekat|sofa|living|bench|bangku|wallpanel|wpc|bawah tangga/i.test(normalizedQuery);
            const isMinibarQuery = /minibar|mini bar|meja bar|island|meja island|topi bar|box elektronik/i.test(normalizedQuery);
            const isAksesorisQuery = /aksesoris|rak piring|rak bumbu|rak sendok|downlight|led strip|aventos|revolve|pantry|slow motion|engsel/i.test(normalizedQuery);
            const isSipilQuery = /kanopi|canopi|pagar|las|bengkel las|besi|baja|atap|alderon|spandek|sipil|cor|coran|meja beton|backsplash|moulding|bobok|bongkar|keramik|decking|vinyl/i.test(normalizedQuery);

            matchingItems = activeItems.filter(item => {
                const matchCategory = category ? item.category === category : true;
                if (!matchCategory) return false;

                // Filter Region DK vs LK jika spesifik ditanyakan
                if (isDkQuery && !isLkQuery) {
                    if (item.subCategory === 'luar_kota') return false;
                } else if (isLkQuery && !isDkQuery) {
                    if (item.subCategory === 'dalam_kota') return false;
                }

                // Pencocokan kata kunci langsung
                const inTitle = item.title.toLowerCase().includes(normalizedQuery);
                const inContent = item.content.toLowerCase().includes(normalizedQuery);
                const inKeywords = item.keywords ? item.keywords.some(k => normalizedQuery.includes(k.toLowerCase())) : false;
                
                // Intent matching cerdas
                if (isKitchenQuery && item.category === 'KITCHEN_SET') return true;
                if (isWardrobeQuery && item.category === 'WARDROBE') return true;
                if (isLivingQuery && item.category === 'LIVING_ROOM') return true;
                if (isMinibarQuery && (item.category === 'MINIBAR_ISLAND' || item.category === 'KITCHEN_SET')) return true;
                if (isAksesorisQuery && (item.category === 'AKSESORIS' || item.category === 'KITCHEN_SET')) return true;
                if (isSipilQuery && item.category === 'SIPIL_BENGKEL') return true;

                // Selalu sertakan SOP dan Layanan Gratis
                if (item.category === 'SOP_SALES' || item.category === 'SERVICES') return true;

                return inTitle || inContent || inKeywords;
            });
        }

        // Jika pencarian terlalu spesifik dan menghasilkan 0, fallback ke seluruh item aktif
        if (matchingItems.length === 0) {
            matchingItems = activeItems;
        }

        // 3. Kelompokkan berdasarkan category dan subCategory, ambil yang memiliki prioritas tertinggi (Override Resolution)
        const categoryMap = new Map();
        
        // Urutkan dari prioritas terendah ke tertinggi
        matchingItems.sort((a, b) => (a.priority || 10) - (b.priority || 10));

        matchingItems.forEach(item => {
            const key = `${item.category}_${item.subCategory || 'default'}`;
            // Item dengan prioritas lebih tinggi akan menimpa item sebelumnya
            categoryMap.set(key, item);
        });

        const resolvedChunks = Array.from(categoryMap.values());
        
        // Bentuk teks knowledge kontekstual dan daftar sitasi
        const citations = resolvedChunks.map(chunk => `${chunk.title} (${chunk.scope === 'GLOBAL' ? 'Core' : 'Brand Override'} v${chunk.version || '2026.2'})`);
        const formattedContent = resolvedChunks.map(chunk => `[${chunk.title}]:\n${chunk.content}`).join('\n\n');

        return {
            resolvedChunks,
            formattedContent,
            citations
        };
    },

    // Menambah override harga untuk brand tertentu
    addBrandOverride: ({ brandId, category, subCategory = 'default', title, content, keywords = [] }) => {
        const allItems = KnowledgeService.getAllItems();
        const newItem = {
            id: `override_${brandId}_${Date.now()}`,
            scope: 'BRAND_OVERRIDE',
            brandId,
            category,
            subCategory,
            title,
            content,
            keywords,
            priority: 50,
            version: '2026.2',
            isActive: true
        };
        const updated = [...allItems, newItem];
        KnowledgeService.saveAllItems(updated);
        return newItem;
    },

    // Menambah campaign promo berbatas waktu
    addCampaignPromo: ({ brandId, title, content, effectiveFrom, effectiveUntil, keywords = [] }) => {
        const allItems = KnowledgeService.getAllItems();
        const newItem = {
            id: `campaign_${Date.now()}`,
            scope: 'CAMPAIGN',
            brandId: brandId || null,
            category: 'CAMPAIGN_PROMO',
            subCategory: 'flash_sale',
            title,
            content,
            effectiveFrom,
            effectiveUntil,
            keywords,
            priority: 100,
            version: '2026.2',
            isActive: true
        };
        const updated = [...allItems, newItem];
        KnowledgeService.saveAllItems(updated);
        return newItem;
    }
};
