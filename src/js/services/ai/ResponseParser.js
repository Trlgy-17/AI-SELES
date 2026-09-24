// File: src/js/services/ai/ResponseParser.js

export const ResponseParser = {
    // Normalisasi struktur output ke format baku 1 rekomendasi utama
    normalizeOutput: (raw = {}, activeBrand) => {
        const brandName = activeBrand?.brandName || 'Nacira Studio';
        
        const singleReply = raw.reply || raw.recommended || raw.replies?.recommended || (typeof raw.replies === 'string' ? raw.replies : "") || `Halo Kak! Ada yang bisa kami bantu dari *${brandName}*?`;
        
        const replies = {
            recommended: singleReply,
            alternativeSoft: raw.replies?.alternativeSoft || raw.alternativeSoft || singleReply,
            alternativeDirect: raw.replies?.alternativeDirect || raw.alternativeDirect || singleReply
        };

        const clientAnalysis = raw.clientAnalysis || {
            intent: raw.intent || "CONSULTATION",
            stage: raw.stage || "DISCOVERY",
            temperature: raw.temperature || "WARM",
            projectType: raw.projectType || "Interior Custom",
            extractedLocation: raw.extractedLocation || null,
            extractedBudget: raw.extractedBudget || null,
            missingInformation: Array.isArray(raw.missingInformation) ? raw.missingInformation : ["Ukuran ruangan", "Lokasi kota"],
            nextBestAction: raw.nextBestAction || raw.explanation || raw.recommendedAction || "Arahkan klien untuk survei pengukuran gratis."
        };

        return {
            clientAnalysis,
            reply: singleReply,
            replies,
            principlesUsed: Array.isArray(raw.principlesUsed) ? raw.principlesUsed : ["Transparansi Harga", "Micro-Commitment"],
            internalSources: Array.isArray(raw.internalSources) ? raw.internalSources : ["Master Price List 2026"],
            confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.95
        };
    },

    // Parsing JSON tangguh dengan multi-layer fallback
    parse: (text, activeBrand) => {
        const defaultBrandName = activeBrand?.brandName || 'Nacira Studio';
        if (!text || typeof text !== 'string') {
            const defaultReply = `Halo Kak! Terima kasih sudah menghubungi *${defaultBrandName}*. Ada yang bisa kami bantu untuk kebutuhan interior impian Kakak hari ini? 😊`;
            return ResponseParser.normalizeOutput({ reply: defaultReply }, activeBrand);
        }

        // Layer 1: JSON.parse langsung
        try {
            const parsed = JSON.parse(text);
            return ResponseParser.normalizeOutput(parsed, activeBrand);
        } catch (e1) {
            // Layer 2: Cari kurung kurawal terluar { ... }
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                try {
                    const parsed = JSON.parse(text.slice(start, end + 1));
                    return ResponseParser.normalizeOutput(parsed, activeBrand);
                } catch (e2) {}
            }

            // Layer 3: Regex extraction untuk field "reply" atau "recommended" jika streaming terputus
            let extractedReply = "";
            const replyMatch = text.match(/"(?:reply|recommended)"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
            if (replyMatch && replyMatch[1]) {
                extractedReply = replyMatch[1]
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '')
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\')
                    .trim();
            } else {
                extractedReply = text.trim()
                    .replace(/^```json\s*/i, '')
                    .replace(/^```\s*/i, '')
                    .replace(/```$/i, '')
                    .trim();
            }

            return ResponseParser.normalizeOutput({
                reply: extractedReply,
                clientAnalysis: {
                    intent: "ASK_PRICE",
                    stage: "CONSULTATION",
                    temperature: "WARM",
                    missingInformation: ["Ukuran panjang ruangan", "Lokasi detail"],
                    nextBestAction: "Gali informasi lokasi dan ukuran ruangan sebelum estimasi akhir."
                },
                confidence: 0.85
            }, activeBrand);
        }
    },

    // Mengekstrak teks parsial saat streaming untuk preview cepat
    extractStreamingPreview: (accumulatedText = '') => {
        if (!accumulatedText) return '';
        // Cari nilai reply yang sedang digenerate: "reply": "..."
        const match = accumulatedText.match(/"(?:reply|recommended)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/s);
        if (match && match[1]) {
            return match[1]
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
        }
        return '';
    }
};
