// File: src/js/services/ai/CustomerMemoryEngine.js

export const CustomerMemoryEngine = {
    // Normalisasi struktur memori klien ke skema baku
    createEmptyMemory: () => ({
        name: '',
        location: '',
        cityCategory: 'UNKNOWN', // 'PL_DK' | 'PL_LK' | 'UNKNOWN'
        dimensions: '',
        budget: '',
        projectType: '',
        notes: ''
    }),

    // Deteksi klasifikasi wilayah (PL DK: Bandung & Tasik vs PL LK: Luar Kota / Jabodetabek)
    detectCityCategory: (locationStr = '') => {
        if (!locationStr) return 'UNKNOWN';
        const loc = locationStr.toLowerCase();
        if (/bandung|cimahi|padalarang|soreang|lembang|tasik|tasikmalaya|ciamis|garut|banjar/i.test(loc)) {
            return 'PL_DK';
        }
        if (/jakarta|bogor|depok|tangerang|bekasi|jabodetabek|pantura|cirebon|semarang|surabaya|bali/i.test(loc)) {
            return 'PL_LK';
        }
        return 'UNKNOWN';
    },

    // Format memori klien menjadi blok prompt dengan instruksi ketat ANTI-TANYA ULANG
    buildMemoryPromptBlock: (clientMemory) => {
        if (!clientMemory || Object.keys(clientMemory).length === 0) {
            return '# CLIENT CONTEXT & MEMORY (DATA TERKONFIRMASI — DILARANG DITANYAKAN ULANG)\nBelum ada memori spesifik tersimpan. Gali informasi lokasi dan ukuran secara santun hanya jika relevan.';
        }

        let block = '# CLIENT CONTEXT & MEMORY (DATA TERKONFIRMASI — DILARANG DITANYAKAN ULANG)\n';
        let hasActiveMemory = false;

        if (clientMemory.name && clientMemory.name.trim()) {
            block += `- Nama Klien: ${clientMemory.name.trim()} (Gunakan sapaan sopan dengan nama ini jika cocok)\n`;
            hasActiveMemory = true;
        }

        if (clientMemory.location && clientMemory.location.trim()) {
            const cat = CustomerMemoryEngine.detectCityCategory(clientMemory.location);
            const catNote = cat === 'PL_LK' ? 'PL LK (Luar Kota)' : 'PL DK (Dalam Kota)';
            block += `- Lokasi Terkonfirmasi: ${clientMemory.location.trim()} (SUDAH DIKETAHUI, JANGAN TANYAKAN LAGI!) — Gunakan pricelist yang cocok dengan wilayah ini (${catNote})\n`;
            hasActiveMemory = true;
        }

        if (clientMemory.dimensions && clientMemory.dimensions.trim()) {
            block += `- Dimensi Ruangan: ${clientMemory.dimensions.trim()} (SUDAH DIKETAHUI, JANGAN TANYAKAN LAGI!) — Langsung hitung estimasi totalnya\n`;
            hasActiveMemory = true;
        }

        if (clientMemory.budget && clientMemory.budget.trim()) {
            block += `- Alokasi Budget Klien: ${clientMemory.budget.trim()} (Sesuaikan rekomendasi agar masuk range ini)\n`;
            hasActiveMemory = true;
        }

        if (clientMemory.projectType && clientMemory.projectType.trim()) {
            block += `- Tipe Rencana Proyek: ${clientMemory.projectType.trim()} (Fokus ke kebutuhan ini)\n`;
            hasActiveMemory = true;
        }

        if (clientMemory.notes && clientMemory.notes.trim()) {
            block += `- Catatan Tambahan Admin: ${clientMemory.notes.trim()}\n`;
            hasActiveMemory = true;
        }

        if (!hasActiveMemory) {
            return '# CLIENT CONTEXT & MEMORY (DATA TERKONFIRMASI — DILARANG DITANYAKAN ULANG)\nBelum ada memori spesifik tersimpan. Gali informasi lokasi dan ukuran secara santun hanya jika relevan.';
        }

        return block.trim();
    },

    // Menggabungkan ekstraksi AI ke dalam memori klien yang ada
    mergeExtractedData: (currentMemory, extractedAnalysis) => {
        if (!extractedAnalysis) return currentMemory;
        const updated = { ...currentMemory };

        if (extractedAnalysis.extractedLocation && !updated.location) {
            updated.location = extractedAnalysis.extractedLocation;
            updated.cityCategory = CustomerMemoryEngine.detectCityCategory(extractedAnalysis.extractedLocation);
        }

        if (extractedAnalysis.extractedBudget && !updated.budget) {
            updated.budget = extractedAnalysis.extractedBudget;
        }

        if (extractedAnalysis.projectType && !updated.projectType) {
            updated.projectType = extractedAnalysis.projectType;
        }

        return updated;
    }
};
