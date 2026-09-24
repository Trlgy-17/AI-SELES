// File: src/js/services/ai.js
import { PRICE_MASTER, DEFAULT_GEMINI_API_KEY, DEFAULT_GEMINI_MODEL } from '../constants.js';

export const AIService = {
    buildSystemPrompt: () => {
        return `# NACIRA STUDIO · WHATSAPP INBOUND SALES CONSULTANT (SOP v2026)
Admin Sales: Ary (+62 853-8506-9717 | nacirastudio.com)
Coverage: Bandung & Jabodetabek. Survei & Desain 3D GRATIS. Garansi Pemeliharaan 6 Bulan.

PRICELIST RESMI:
• Kitchen Set Bandung: Blockboard Rp2,0-2,9jt/m | Multipleks Plywood HPL Rp2,5-3,2jt/m | PVC Waterproof (khusus area bawah sink/anti air & rayap) Rp4,0-4,8jt/m | Alumunium Rp3,3-4,5jt/m | Cat Duco Rp4,0-5,5jt/m.
• Kitchen Set Jabodetabek: Blockboard Rp2,3-3,0jt/m | Multipleks HPL Rp2,6-3,3jt/m | PVC Waterproof Rp4,1-4,8jt/m | Alumunium Rp3,5-5,5jt/m.
• Kamar Set & Wardrobe: Lemari Multipleks HPL Bandung mulai Rp2,5jt/m | Jabodetabek mulai Rp2,6jt/m | Cat Duco mulai Rp4,8jt/m. Dipan Multipleks HPL Rp2,5-2,6jt/m.
• Living Room & Sipil: Backdrop TV Multipleks HPL Rp2,3-2,9jt/m. Partisi Rp2,1-2,5jt/m. Canopi Spandek/Alderon Rp750rb-1,8jt/m2.

ATURAN BALASAN CHAT/SCREENSHOT (SIAP COPY-PASTE):
1. SCREENSHOT VISION: Bubble Kanan = Tim Admin Ary. Bubble Kiri = Calon Klien. Jawab fokus pada pesan terakhir klien di kiri bawah. Pindai nama kontak klien untuk sapaan akrab.
2. JAWAB HARGA LANGSUNG: Sebutkan kisaran harga per meter transparan (dilarang berbelit atau suruh survei tanpa estimasi).
3. NILAI TAMBAH: Edukasi kombinasi bahan (Multipleks kokoh + PVC anti air sink), sebutkan Survei & Desain 3D GRATIS.
4. MICRO-COMMITMENT: Selalu akhiri dengan 1 pertanyaan ringan (tanya lokasi Bandung/Jabodetabek atau ukuran ruangan).
5. GHOSTING ENGINE: Jika klien belum membalas pesan sebelumnya, berikan opsi 1 huruf:
   A. Mau dikirimi estimasi budget & inspirasi desain
   B. Mau dijadwalkan survei & konsultasi gratis
   C. Masih tahap membandingkan vendor
Gaya: Hangat, santun, format WhatsApp (*bold* poin penting, paragraf pendek).
Output WAJIB JSON:
{"reply": "Teks balasan WhatsApp siap kirim", "principlesUsed": ["Prinsip yang dipakai"], "explanation": "Analisis lead HOT/WARM/COLD & rekomendasi"}`;
    },

    parseJsonResponse: (text) => {
        if (!text) {
            return {
                reply: "",
                principlesUsed: ["Konsultasi Nilai Tambah"],
                explanation: "Tidak ada respons teks yang dapat dianalisis."
            };
        }
        try {
            return JSON.parse(text);
        } catch (e) {
            // Bersihkan markdown code block jika model membungkus dengan ```json ... ```
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                try {
                    return JSON.parse(text.slice(start, end + 1));
                } catch (e2) {}
            }

            // Ekstraksi darurat: Jika token JSON terpotong di bagian explanation, ekstrak "reply" secara presisi
            const replyMatch = text.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
            if (replyMatch && replyMatch[1]) {
                const unescapedReply = replyMatch[1]
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '')
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\');
                return {
                    reply: unescapedReply.trim(),
                    principlesUsed: ["Transparansi Harga Langsung", "Edukasi Material & Survei 3D Gratis"],
                    explanation: "Balasan berhasil disusun dan diurai sesuai SOP Sales Nacira Studio 2026."
                };
            }

            return {
                reply: text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, ''),
                principlesUsed: ["Konsultasi Nilai Tambah", "Penjadwalan Survey"],
                explanation: "Balasan disusun berdasarkan SOP WhatsApp Sales Nacira Studio 2026."
            };
        }
    },

    generateWhatsAppReply: async ({ 
        provider = 'gemini',
        inputText, 
        imagePart, 
        // Gemini Config
        customApiKey, 
        selectedModel, 
        customProxyUrl,
        // OpenAI / Custom Provider Config
        openaiBaseUrl,
        openaiApiKey,
        openaiModel
    }) => {
        if (provider === 'openai') {
            return await AIService.generateOpenAIReply({
                inputText,
                imagePart,
                baseUrl: openaiBaseUrl,
                apiKey: openaiApiKey,
                model: openaiModel
            });
        }
        return await AIService.generateGeminiReply({
            inputText,
            imagePart,
            customApiKey,
            selectedModel,
            customProxyUrl
        });
    },

    generateOpenAIReply: async ({ inputText, imagePart, baseUrl, apiKey, model }) => {
        let cleanBaseUrl = (baseUrl || 'https://api.openai.com/v1').trim();
        cleanBaseUrl = cleanBaseUrl.replace(/\/+$/, '');
        const endpoint = cleanBaseUrl.endsWith('/chat/completions') 
            ? cleanBaseUrl 
            : `${cleanBaseUrl}/chat/completions`;

        const effectiveModel = model?.trim() || 'gpt-4o-mini';
        const effectiveKey = apiKey?.trim() || '';

        const headers = {
            'Content-Type': 'application/json'
        };
        if (effectiveKey) {
            headers['Authorization'] = `Bearer ${effectiveKey}`;
        }
        if (cleanBaseUrl.includes('openrouter.ai')) {
            headers['HTTP-Referer'] = 'https://nacirastudio.com';
            headers['X-Title'] = 'Nacira Sales AI';
        }

        const systemPrompt = AIService.buildSystemPrompt();

        const userPrompt = inputText && inputText.trim() 
            ? `Pesan / chat WhatsApp calon klien:\n"${inputText.trim()}"`
            : "Analisis screenshot chat WhatsApp calon klien berikut dan buatkan balasan pesan WhatsApp siap copy-paste sesuai SOP Sales Nacira Studio.";

        let userContent;
        if (imagePart?.inlineData?.data) {
            userContent = [
                { type: 'text', text: userPrompt },
                { 
                    type: 'image_url', 
                    image_url: { 
                        url: `data:${imagePart.inlineData.mimeType || 'image/jpeg'};base64,${imagePart.inlineData.data}`,
                        detail: 'auto'
                    } 
                }
            ];
        } else {
            userContent = userPrompt;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ];

        // Optimasi latensi: max_tokens 500 cukup untuk seluruh teks WhatsApp & analisis CRM lengkap
        const bodyPayload = {
            model: effectiveModel,
            messages: messages,
            temperature: 0.25,
            max_tokens: 500,
            response_format: { type: 'json_object' }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 14000);

        let response;
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                signal: controller.signal,
                body: JSON.stringify(bodyPayload)
            });

            // Fallback otomatis jika provider/model tidak mendukung response_format json_object
            if (!response.ok && (response.status === 400 || response.status === 422)) {
                delete bodyPayload.response_format;
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: headers,
                    signal: controller.signal,
                    body: JSON.stringify(bodyPayload)
                });
            }
        } catch (netErr) {
            if (netErr.name === 'AbortError') {
                throw new Error(`Koneksi ke custom provider (${endpoint}) melampaui batas waktu (timeout). Pastikan provider aktif.`);
            }
            throw new Error(`Gagal menghubungi API (${endpoint}): ${netErr.message}`);
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(`[OpenAI API Error] ${errMsg}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content;
        if (!rawContent) {
            throw new Error("Provider AI tidak mengembalikan teks jawaban.");
        }

        return AIService.parseJsonResponse(rawContent);
    },

    generateGeminiReply: async ({ inputText, imagePart, customApiKey, selectedModel, customProxyUrl }) => {
        const apiKey = customApiKey || DEFAULT_GEMINI_API_KEY;
        const requestedModel = selectedModel || DEFAULT_GEMINI_MODEL;

        if (!apiKey && !customProxyUrl) {
            throw new Error("Kunci API Gemini belum dikonfigurasi. Masukkan API Key Anda di Pengaturan AI.");
        }

        const parts = [];
        if (inputText && inputText.trim()) {
            parts.push({ text: `Pesan / chat WhatsApp calon klien:\n"${inputText.trim()}"` });
        } else {
            parts.push({ text: "Analisis screenshot chat WhatsApp calon klien berikut dan buatkan balasan pesan WhatsApp siap copy-paste sesuai SOP Sales Nacira Studio." });
        }
        if (imagePart) {
            parts.push(imagePart);
        }

        const systemPromptText = AIService.buildSystemPrompt();

        const buildPayload = (useThinking) => {
            const genConfig = {
                temperature: 0.2,
                maxOutputTokens: 500, // Cukup untuk pesan WA lengkap tanpa terpotong
                responseMimeType: "application/json"
            };

            if (useThinking) {
                genConfig.thinkingConfig = { thinkingBudget: 0 };
            }

            return {
                contents: [{ role: 'user', parts: parts }],
                systemInstruction: { parts: [{ text: systemPromptText }] },
                generationConfig: genConfig
            };
        };

        // Prioritaskan model ultra-cepat yang teruji responsif dan aktif
        const candidateModels = [
            requestedModel,
            'gemini-flash-lite-latest',
            'gemini-flash-latest'
        ].filter((m, idx, arr) => arr.indexOf(m) === idx);

        let lastError = null;

        for (const model of candidateModels) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 28000); // 28 detik per kandidat model (mencegah abort prematur saat traffic padat)

            try {
                let endpoint = "";
                let headers = { "Content-Type": "application/json" };

                if (customProxyUrl && customProxyUrl.trim()) {
                    endpoint = customProxyUrl.trim();
                    if (apiKey) {
                        headers["Authorization"] = `Bearer ${apiKey}`;
                        headers["x-goog-api-key"] = apiKey;
                    }
                } else {
                    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
                    headers["x-goog-api-key"] = apiKey;
                }

                const isThinkingModel = model.includes('3.6') || model.includes('3.7') || model.includes('pro');
                let payload = buildPayload(isThinkingModel);

                let response = await fetch(endpoint, {
                    method: "POST",
                    headers: headers,
                    signal: controller.signal,
                    body: JSON.stringify(payload)
                });

                if (!response.ok && response.status === 400 && isThinkingModel) {
                    payload = buildPayload(false);
                    response = await fetch(endpoint, {
                        method: "POST",
                        headers: headers,
                        signal: controller.signal,
                        body: JSON.stringify(payload)
                    });
                }

                if (!response.ok && (response.status === 429 || response.status === 503 || response.status === 404)) {
                    console.warn(`[AIService] Model ${model} status ${response.status}, mencoba kandidat cepat berikutnya...`);
                    continue;
                }

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    const errMsg = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
                    lastError = new Error(errMsg);
                    continue;
                }

                const result = await response.json();
                const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!textContent) {
                    continue;
                }

                return AIService.parseJsonResponse(textContent);
            } catch (err) {
                if (err.name === 'AbortError') {
                    console.warn(`[AIService] Model ${model} timeout (>28s), beralih ke model berikutnya...`);
                } else {
                    lastError = err;
                }
            } finally {
                clearTimeout(timeoutId);
            }
        }

        throw lastError || new Error("Semua model AI sedang sibuk atau mengalami batas kuota. Silakan coba kembali dalam beberapa detik.");
    }
};
