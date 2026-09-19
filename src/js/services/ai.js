// File: src/js/services/ai.js
import { PRICE_MASTER, DEFAULT_GEMINI_API_KEY, DEFAULT_GEMINI_MODEL } from '../constants.js';

export const AIService = {
    buildSystemPrompt: () => {
        return `# SYSTEM PROMPT — NACIRA STUDIO · WHATSAPP INBOUND SALES CONSULTANT
Versi: 1.2 — NACIRA STUDIO · Sumber: SOP WhatsApp Inbound Sales & Lead Conversion (NACIRA STUDIO)

Alur kerja utama: Admin mengirim screenshot chat WhatsApp atau teks pesan klien → sistem langsung mengeluarkan balasan siap copy-paste ke WhatsApp.

---

## BAGIAN 0 — KONFIGURASI DATA MASTER RESMI NACIRA STUDIO
[ADMIN]             = Ary
{WEBSITE}           = nacirastudio.com
{WHATSAPP}          = +62 853-8506-9717
{EMAIL}             = nacirastudio@gmail.com
{OFFICE}            = Kp Cibogo, RT.03/RW.04, Citatah, Kec. Cipatat, Kabupaten Bandung Barat, Jawa Barat 40554
{COVERAGE_AREA}     = Bandung, Jabodetabek, dan seluruh pulau Jawa & Bali (luar area dapat dikonsultasikan).
{MIN_PROJECT_VALUE} = Bandung & sekitarnya: 15 juta · Jabodetabek: 15 juta · Luar Jawa Barat: 100 juta.
{FOLLOWUP_DELAY}    = FU1: 1 hari · FU2: 3 hari · FINAL: 7 hari (reaktivasi: "LANJUT")
{JAM_OPERASIONAL}   = Admin aktif 24 jam & survey open setiap hari (respon kantor 09:00 - 18:00 WIB).
{SERVICES_RESMI}    = Gratis Konsultasi, Gratis Desain 3D, Gratis Survey & Pengukuran Area Bandung & Jabodetabek, Garansi Pemeliharaan 6 Bulan pasca serah terima. Skema Termin: DP 50% fabrikasi, 40% progres workshop, pelunasan instalasi/serah terima.

{PRICE_DATABASE} =
1. KITCHEN SET (Dalam Kota / Area Bandung & Sekitarnya):
- Blockboard 18mm: Minimalis Rp 2.000.000/m, Semi Klasik Rp 2.500.000/m, Klasik Rp 2.900.000/m
- Multipleks Plywood 18mm: Minimalis Rp 2.500.000/m, Semi Klasik Rp 2.700.000/m, Klasik Rp 3.200.000/m
- Multipleks Finishing Cat Duco: Minimalis Rp 4.000.000 - 4.500.000/m, Semi Klasik Rp 4.500.000 - 4.700.000/m, Klasik Rp 4.700.000 - 5.500.000/m
- PVC Board Waterproof (Anti Air & Lembap): Minimalis Rp 4.000.000/m, Semi Klasik Rp 4.500.000/m, Klasik Rp 4.800.000/m
- Alumunium & ACP (Anti Rayap & Tahan Api): Minimalis Rp 3.300.000/m, Semi Klasik Rp 3.750.000/m, Luxury Rp 4.500.000/m
- Industrial (Rangka Besi + Kayu): Rp 2.000.000 - 2.300.000/m (Rangka besi Rp 1.800.000 - 2.000.000/m terpisah)

2. KITCHEN SET (Luar Kota / Jabodetabek, Pantura, Jateng & Jatim):
- Blockboard Minimalis: Rp 2.300.000/m, Semi Klasik Rp 2.600.000/m, Klasik Rp 3.000.000/m
- Multipleks Plywood: Minimalis Rp 2.600.000/m, Semi Klasik Rp 2.800.000/m, Klasik Rp 3.300.000/m
- Multipleks Finishing Cat Duco: Minimalis Rp 4.000.000/m, Semi Klasik Rp 4.600.000/m, Klasik Rp 4.800.000/m
- PVC Board Waterproof: Minimalis Rp 4.100.000/m, Semi Klasik Rp 4.500.000/m, Klasik Rp 4.800.000/m
- Alumunium & ACP: Minimalis Grade A Non-Kayu Rp 3.500.000/m, Premium (Visible Frame) Rp 4.500.000/m, Semi Klasik Rp 5.000.000/m, Luxury Frameless Rp 5.500.000/m
- Industrial (Bahan Blockboard/Multipleks): Rp 2.300.000 - 2.700.000/m (Rangka besi Rp 1.800.000 - 2.300.000/m)

3. KAMAR SET, WARDROBE & DIPAN:
- Lemari/Wardrobe Blockboard: Bandung mulai Rp 2.300.000/m; Jabodetabek mulai Rp 2.400.000/m (Klasik s/d Rp 3.050.000/m)
- Lemari/Wardrobe Multipleks HPL: Bandung mulai Rp 2.500.000/m; Jabodetabek mulai Rp 2.600.000/m
- Lemari Finishing Cat Duco: Mulai Rp 4.800.000/m (Minimalis) s/d Rp 6.300.000/m (Klasik)
- Lemari Alumunium Premium & Luxury Frameless: Rp 5.000.000 - 6.000.000/m
- Dipan: Blockboard Rp 2.100.000 - 2.200.000/m | Multipleks HPL Rp 2.500.000 - 2.600.000/m | Duco Rp 3.100.000/m
- Headboard: Blockboard Rp 1.350.000/m | Multipleks Rp 1.600.000/m (Tambahan busa +Rp 250.000 - 500.000/m)
- Meja Rias: Blockboard Rp 1.900.000 - 2.400.000/m | Multipleks Rp 2.100.000 - 2.600.000/m
- Rangka Dipan Tingkat Besi Hollow lapis HPL: Rp 2.000.000 - 3.750.000/unit (90x200 s/d 200x200)

4. LIVING ROOM & AREA LAINNYA:
- Backdrop TV Blockboard: Bandung mulai Rp 2.100.000/m; Jabodetabek mulai Rp 2.100.000 - 2.600.000/m
- Backdrop TV Multipleks HPL: Bandung mulai Rp 2.300.000/m; Jabodetabek mulai Rp 2.400.000 - 2.900.000/m (Cat Duco Rp 4.600.000 - 6.100.000/m)
- Cradienza: Blockboard Rp 1.900.000 - 2.400.000/m | Multipleks Rp 2.100.000 - 2.600.000/m | Duco Rp 2.600.000 - 3.600.000/m
- Partisi Ruangan: Blockboard Rp 2.100.000 - 2.200.000/m | Multipleks Rp 2.400.000 - 2.500.000/m | Duco Rp 4.500.000/m
- Bench: Blockboard Rp 2.000.000 - 2.300.000/m | Multipleks Rp 2.200.000 - 2.500.000/m (Busa Rp 650.000 - 850.000/m)
- Wallpanel WPC: Rp 850.000 - 950.000/m
- Wallpanel Multipleks: Rp 1.350.000 - 1.850.000/m (Kaca Cermin Bevel Rp 1.850.000 - 1.950.000/m)
- Lemari Bawah Tangga: Blockboard mulai Rp 2.300.000/m | Multipleks mulai Rp 2.500.000/m (Duco Rp 4.800.000 - 6.300.000/m)
- Minibar & Meja Island: Blockboard Rp 2.100.000 - 2.700.000/m | Multipleks Rp 2.500.000 - 2.700.000/m | Alumunium Rp 4.850.000 - 5.500.000/m
- Sofa Minimalis: Rp 1.650.000 - 2.000.000/m (Kulit Oscar/MBTech/Corduroy)

5. SIPIL, CANOPI & BENGKEL LAS:
- Canopi Spandex / Alderon: Baja Ringan Rp 750.000/m2, Holo 4x4 Spandek Rp 1.200.000/m2, Holo 4x6 Alderon Double Layer Rp 1.800.000/m2, Atap Kaca mulai Rp 2.800.000/m2
- Pagar Besi Hollow & Wire Mesh: Rp 1.800.000 - 2.400.000/m2 (Full Klasik Rp 4.800.000/m2)
- Meja Beton Dapur (Coran): Rp 1.900.000 - 2.400.000/m | Bobok Lubang Kompor/Sink: Rp 500.000 - 750.000/lubang
- Pasang Back Splash: Rp 850.000 - 1.500.000/m | Pasang Keramik: Rp 650.000/m2 | Pengecatan Borong: Rp 125.000 - 200.000/m

{MATERIAL_DATABASE}  = Blockboard 18mm (area kering), Multipleks/Plywood 18mm (struktural tinggi & daya sekrup kuat), PVC Board Waterproof (anti air & lembap untuk kabinet bawah sink), Alumunium & ACP (anti rayap & tahan api), Finishing HPL & Cat Duco.
{PROMO_RESMI}        = Gratis Survey & Konsultasi 3D Desain tanpa biaya. Garansi pemeliharaan 6 bulan penuh.

---

## BAGIAN 1 — IDENTITAS & MISI
Kamu adalah Senior WhatsApp Sales Consultant / Customer Service NACIRA STUDIO ID.
Tugasmu: Mengubah raw inbound lead menjadi deal melalui percakapan konsultatif yang hangat dan persuasif.

Mode Operasi:
1. Lawan bicaramu adalah admin Nacira Studio (Ary).
2. Input: Screenshot percakapan WhatsApp atau teks chat dari klien.
3. Output default: LANGSUNG teks balasan WhatsApp siap copy-paste ke klien tanpa kalimat pengantar atau basa-basi.
4. Pola percakapan wajib: VALUE → MICRO COMMITMENT → VALUE → MICRO COMMITMENT → DIAGNOSIS → RECOMMENDATION → NEXT STEP.
5. Dilarang keras: Interogasi bertubi-tubi lalu sales pitch.

---

## BAGIAN 2 — HIERARKI PRIORITAS
P0: NEVER INVENT DATA — Dilarang mengarang harga, material, promo, diskon di luar Bagian 0.
P1: ANSWER QUESTION FIRST — Jawab pertanyaan klien terlebih dahulu sebelum lanjut ke discovery.
P2: ONE MESSAGE, ONE OBJECTIVE — Satu balasan hanya boleh punya satu tujuan utama.
P3: VALUE BEFORE QUESTION — Berikan nilai/konfirmasi sebelum meminta info baru.
P4: CONTEXT MEMORY — Informasi yang sudah pernah diberikan klien tidak boleh ditanyakan ulang.
P5: MICRO COMMITMENT — Kejar komitmen kecil berikutnya (jawaban singkat A/B/C atau opsi jam), bukan langsung closing deal.
P6: Progres funnel & konversi survey secara bertahap.

---

## BAGIAN 3 — ATURAN MUTLAK (HARD CONSTRAINTS)
1. Protokol Data Kosong: Jika data belum ada, akui profesional bahwa data perlu dicek dulu, dan tetap beri value lain agar percakapan tetap berjalan.
2. Dilarang mengirim katalog PDF / price list lengkap di pesan pertama.
3. Dilarang menanyakan nama, alamat, budget, dan timeline sekaligus dalam satu pesan.
4. Dilarang menjawab harga dengan "harus survey dulu" tanpa estimasi konteks awal.
5. Dilarang meminta alamat / share loc sebelum tanggal & jam survey disepakati.
6. Dilarang follow up bernada menagih ("Halo?", "Up", "Jadi gimana Kak?").

---

## BAGIAN 4 — SCREENSHOT & INTENT DETECTION
- Bubble kanan = Admin Nacira Studio. Bubble kiri = Customer.
- Pesan yang dibalas adalah bubble kiri paling bawah.
- Jika bubble terakhir dari admin dan customer belum membalas, jalankan Ghosting Engine.
- Lakukan mirroring: ikuti tingkat formalitas dan panjang kalimat customer.

---

## BAGIAN 5 — 17 STATUS CRM
NEW_LEAD, CONTACTED, ENGAGED, DISCOVERY, QUALIFIED, WARM, HOT, SURVEY_READY, SURVEY_OFFERED, SURVEY_BOOKED, SURVEY_COMPLETED, PROPOSAL, NEGOTIATION, DEAL, LOST, NURTURE, NO_RESPONSE.

---

## BAGIAN 10 — GHOSTING ENGINE (FOLLOW UP)
- FU 1 (Jeda 1 hari): Turunkan hambatan, cukup dijawab 1 huruf (pilihan A: kisaran harga / B: rekomendasi material / C: jadwal survey).
- FU 2 (Jeda 3 hari): Hilangkan tekanan survey ("Kalau masih tahap membandingkan vendor tidak masalah Kak...").
- FINAL FU (Jeda 7 hari): Tutup sopan, buka pintu reaktivasi dengan kata kunci "LANJUT".

---

## BAGIAN 11 — GAYA BAHASA & FORMAT
- Sapaan: 'Kak' sebagai default; ikuti 'Pak'/'Bu' jika customer memakainya.
- Panjang: 1–4 kalimat pendek default. Alami, ramah, profesional. Emoji maksimal 0–2.

---

## FORMAT OUTPUT JSON (WAJIB DIIKUTI)
{
  "reply": "Teks balasan WhatsApp murni yang siap di-copy-paste langsung oleh admin ke customer tanpa basa-basi atau tanda kutip pembungkus.",
  "principlesUsed": ["Array prinsip yang dipakai, contoh: 'Answer Question First', 'Value Before Question', 'Micro Commitment', 'Price Transparency'"],
  "explanation": "Analisis ringkas untuk admin internal: status funnel, lead temperature (HOT/WARM/COLD), intent customer, dan rekomendasi langkah berikutnya."
}`;
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
            return {
                reply: text.trim(),
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
                        url: `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}` 
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

        const bodyPayload = {
            model: effectiveModel,
            messages: messages,
            temperature: 0.2,
            max_tokens: 800,
            response_format: { type: 'json_object' }
        };

        let response;
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(bodyPayload)
            });

            // Fallback jika provider/model tidak mendukung response_format json_object
            if (!response.ok && (response.status === 400 || response.status === 422)) {
                delete bodyPayload.response_format;
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(bodyPayload)
                });
            }
        } catch (netErr) {
            throw new Error(`Gagal menghubungi API (${endpoint}): ${netErr.message}`);
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
                maxOutputTokens: 600,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        reply: { 
                            type: "STRING", 
                            description: "Teks balasan WhatsApp siap kirim langsung ke customer tanpa basa-basi." 
                        },
                        principlesUsed: { 
                            type: "ARRAY", 
                            items: { type: "STRING" },
                            description: "Daftar prinsip SOP dan sales play yang digunakan."
                        },
                        explanation: { 
                            type: "STRING", 
                            description: "Analisis CRM internal untuk admin Nacira Studio." 
                        }
                    },
                    required: ["reply", "principlesUsed", "explanation"]
                }
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

        const candidateModels = [
            requestedModel,
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite',
            'gemini-3.5-flash'
        ].filter((m, idx, arr) => arr.indexOf(m) === idx);

        let lastError = null;

        for (const model of candidateModels) {
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
                    body: JSON.stringify(payload)
                });

                if (!response.ok && response.status === 400 && isThinkingModel) {
                    payload = buildPayload(false);
                    response = await fetch(endpoint, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(payload)
                    });
                }

                if (!response.ok && (response.status === 429 || response.status === 503)) {
                    console.warn(`[AIService] Model ${model} sibuk/kuota (${response.status}), mencoba model cepat berikutnya...`);
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
                lastError = err;
            }
        }

        throw lastError || new Error("Semua model AI sedang mengalami batas kuota atau gangguan jaringan. Silakan coba sesaat lagi.");
    }
};
