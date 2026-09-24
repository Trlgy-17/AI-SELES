// File: src/js/services/ai/KnowledgeRetriever.js
import { KnowledgeService } from '../knowledge.js';
import { CustomerMemoryEngine } from './CustomerMemoryEngine.js';

export const KnowledgeRetriever = {
    // Retrieval cerdas yang mempertimbangkan Active Brand, Query Text, Memori Klien, dan Kategori
    retrieveForPrompt: ({ brandId, queryText = '', clientMemory = null, category = null }) => {
        // Deteksi preferensi wilayah dari memori klien jika queryText belum menyebutkan wilayah
        let enrichedQuery = queryText || '';
        if (clientMemory?.location && !/dalam kota|luar kota|dk|lk|bandung|tasik|jakarta/i.test(enrichedQuery)) {
            const cityCat = CustomerMemoryEngine.detectCityCategory(clientMemory.location);
            if (cityCat === 'PL_DK') enrichedQuery += ' dalam kota bandung';
            else if (cityCat === 'PL_LK') enrichedQuery += ' luar kota jabodetabek';
        }

        const resolved = KnowledgeService.resolveKnowledge({
            brandId,
            queryText: enrichedQuery,
            category
        });

        return resolved;
    }
};
