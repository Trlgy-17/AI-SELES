// File: src/js/services/knowledge.js
import { StorageService } from './storage.js';
import { GLOBAL_CORE_KNOWLEDGE, DEFAULT_BRAND_OVERRIDES } from '../constants.js';

const KNOWLEDGE_ITEMS_KEY = 'multibrand_knowledge_items';

export const KnowledgeService = {
    // Membaca seluruh data knowledge tersimpan (Global + Brand + Campaign)
    getAllItems: () => {
        const stored = StorageService.getItem(KNOWLEDGE_ITEMS_KEY, null);
        if (stored && Array.isArray(stored) && stored.length > 0) {
            return stored;
        }
        // Gabungkan initial data
        const initial = [...GLOBAL_CORE_KNOWLEDGE, ...DEFAULT_BRAND_OVERRIDES];
        StorageService.setItem(KNOWLEDGE_ITEMS_KEY, initial);
        return initial;
    },

    saveAllItems: (items) => {
        StorageService.setItem(KNOWLEDGE_ITEMS_KEY, items);
    },

    // Resolusi Knowledge dengan urutan hierarki mutlak
    // Priority: CAMPAIGN (100) > BRAND OVERRIDE (50) > GLOBAL (10)
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
            matchingItems = activeItems.filter(item => {
                const matchCategory = category ? item.category === category : true;
                if (!matchCategory) return false;

                // Pencocokan kata kunci
                const inTitle = item.title.toLowerCase().includes(normalizedQuery);
                const inContent = item.content.toLowerCase().includes(normalizedQuery);
                const inKeywords = item.keywords ? item.keywords.some(k => normalizedQuery.includes(k.toLowerCase())) : false;
                
                // Intent matching cerdas
                const isKitchenQuery = /dapur|kitchen|kitchen set|sink|kompor|masak|hpl|multipleks/i.test(normalizedQuery);
                const isWardrobeQuery = /lemari|wardrobe|kamar|baju|dipan|ranjang/i.test(normalizedQuery);
                const isLivingQuery = /tv|backdrop|partisi|sekat|sofa|living/i.test(normalizedQuery);
                const isSipilQuery = /kanopi|canopi|pagar|las|besi|baja|atap|alderon/i.test(normalizedQuery);

                if (isKitchenQuery && item.category === 'KITCHEN_SET') return true;
                if (isWardrobeQuery && item.category === 'WARDROBE') return true;
                if (isLivingQuery && item.category === 'LIVING_ROOM') return true;
                if (isSipilQuery && item.category === 'SIPIL_BENGKEL') return true;

                // Selalu sertakan SOP dan Layanan jika relevan
                if (item.category === 'SOP_SALES' || item.category === 'SERVICES') return true;

                return inTitle || inContent || inKeywords;
            });
        }

        // Jika pencarian terlalu spesifik dan menghasilkan 0, fallback ke seluruh item aktif
        if (matchingItems.length === 0) {
            matchingItems = activeItems;
        }

        // 3. Kelompokkan berdasarkan category dan ambil yang memiliki prioritas tertinggi (Override Resolution)
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
        const citations = resolvedChunks.map(chunk => `${chunk.title} (${chunk.scope === 'GLOBAL' ? 'Core' : 'Brand Override'} v${chunk.version || '1.0'})`);
        const formattedContent = resolvedChunks.map(chunk => `[${chunk.title}]:\n${chunk.content}`).join('\n\n');

        return {
            resolvedChunks,
            formattedContent,
            citations
        };
    },

    // Menambah override harga untuk brand tertentu
    addBrandOverride: ({ brandId, category, title, content, keywords = [] }) => {
        const allItems = KnowledgeService.getAllItems();
        const newItem = {
            id: `override_${brandId}_${Date.now()}`,
            scope: 'BRAND',
            brandId,
            category,
            title,
            content,
            keywords,
            priority: 50, // Lebih tinggi dari Global (10)
            version: '2026.1',
            isActive: true,
            createdAt: new Date().toISOString()
        };
        allItems.push(newItem);
        KnowledgeService.saveAllItems(allItems);
        return newItem;
    },

    // Update Global Knowledge
    updateGlobalItem: (id, updatedContent) => {
        const allItems = KnowledgeService.getAllItems();
        const idx = allItems.findIndex(i => i.id === id);
        if (idx !== -1) {
            allItems[idx] = {
                ...allItems[idx],
                content: updatedContent,
                updatedAt: new Date().toISOString()
            };
            KnowledgeService.saveAllItems(allItems);
            return allItems[idx];
        }
        return null;
    }
};
