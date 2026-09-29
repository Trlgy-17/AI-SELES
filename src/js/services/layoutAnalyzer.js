// File: src/js/services/layoutAnalyzer.js
import { DEFAULT_GEMINI_API_KEY, DEFAULT_GEMINI_MODEL } from '../constants.js';
import { optimizeImageForAI } from '../utils/image.js';

/**
 * Service untuk menganalisis file denah, layout gambar arsitektur, foto sketsa ukuran tangan,
 * dan dokumen spesifikasi interior untuk langsung dimasukkan ke Kalkulator RAB.
 */
export const LayoutAnalyzerService = {
    /**
     * Menganalisis file (gambar/dokumen/teks) dan mengembalikan ekstraksi parameter estimasi
     */
    analyzeFile: async ({
        file,
        customApiKey = '',
        selectedModel = '',
        customProxyUrl = '',
        activeBrand = {}
    }) => {
        if (!file) {
            throw new Error('Tidak ada file yang dipilih untuk dianalisis.');
        }

        const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
        const apiKey = customApiKey || (isTestEnv ? '' : DEFAULT_GEMINI_API_KEY);
        const model = selectedModel || 'gemini-flash-latest'; // Utamakan model vision yang handal

        // 1. Ekstrak data file (Gambar vs Teks/PDF)
        let isImage = file.type && file.type.startsWith('image/');
        let imagePart = null;
        let fileTextContent = '';

        if (isImage && typeof window !== 'undefined') {
            try {
                const optimized = await optimizeImageForAI(file, 1600, 0.88);
                imagePart = {
                    inlineData: {
                        data: optimized.base64,
                        mimeType: optimized.mimeType || 'image/jpeg'
                    }
                };
            } catch (err) {
                if (typeof FileReader !== 'undefined') {
                    try {
                        const base64Data = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const result = reader.result;
                                const base64 = result.includes(',') ? result.split(',')[1] : result;
                                resolve(base64);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        });
                        imagePart = {
                            inlineData: {
                                data: base64Data,
                                mimeType: file.type || 'image/jpeg'
                            }
                        };
                    } catch (e) {
                        console.warn('Gagal membaca gambar secara langsung:', e);
                    }
                }
            }
        } else if (!isImage) {
            // Jika file teks atau dokumen
            if (typeof file.text === 'function') {
                try {
                    fileTextContent = await file.text();
                } catch (e) {
                    fileTextContent = `Nama file: ${file.name}, Ukuran: ${Math.round((file.size || 0) / 1024)} KB`;
                }
            } else {
                fileTextContent = `Nama file: ${file.name}, Ukuran: ${Math.round((file.size || 0) / 1024)} KB`;
            }
        }

        // 2. Siapkan System Prompt & Instruksi Khusus Estimasi Interior
        const systemPrompt = `Kamu adalah Senior Interior Estimator, Quantity Surveyor, dan Arsitek Ahli di ${activeBrand?.brandName || 'Nacira Studio'}.
Tugasmu adalah menganalisis file denah arsitektur, layout 2D/3D, sketsa ukuran tulisan tangan, atau foto ruangan yang diunggah.

ATURAN EKSTRAKSI DATA INTERIOR:
1. Identifikasi Area Utama:
   - "KITCHEN_SET" jika denah dapur, kabinet, meja cor, kulkas, mini bar.
   - "KAMAR_SET" jika lemari pakaian/wardrobe, tempat tidur/dipan, meja rias.
   - "LIVING_ROOM" jika backdrop TV, lemari bawah tangga, kisi-kisi partisi, credenza, sofa.
   - "SIPIL_BENGKEL" jika kanopi, pagar/railing, atau cor beton.

2. Jika KITCHEN SET (satukan semua elemen):
   - cabinetBawah: panjang kabinet bawah dalam meter (contoh: 3.0). Jika tertera meja cor beton / kusen saja, tandai isKusenBawahOnly: true.
   - cabinetAtas: panjang kabinet atas dalam meter (contoh: 2.5).
   - topTableOption: 'AICA' | 'QUADRA' | 'GRANIT' | 'none'
   - topTableLength: panjang top table (meter), jika sama dengan cabinet bawah biarkan sama.
   - backsplashOption: 'AICA' | 'QUADRA' | 'GRANIT' | 'KERAMIK_BEVEL' | 'MOZAIC' | 'CERMIN_GREY' | 'none'
   - backsplashLength: panjang dinding backsplash (meter).
   - miniBarLength: panjang meja bar/island jika ada (meter).
   - topiBarLength: panjang topi bar jika ada (meter).
   - boxElektronik: { active: boolean, boxP: number, boxT: number, boxQty: number } (kulkas/oven).
     Aturan resmi Box: jika P & T > 1m dihitung P x T, jika P & T < 1m ambil tertinggi, jika salah satu < 1m ambil terbesar.
   - hambalanLength: panjang hambalan floating dalam meter (permeter).

3. Jika Kamar Set / Living Room / Lainnya:
   - p: panjang (meter)
   - t: tinggi (meter)
   - l: lebar/kedalaman (meter)
   - subItem: id sub-item yang sesuai ('LEMARI_WARDROBE', 'DIPAN_HEADBOARD', 'BACKDROP_TV', 'LEMARI_BAWAH_TANGGA', 'CANOPI', dll)

4. Material & Style:
   - material: 'BLOCKBOARD' | 'MULTIPLEKS' | 'ALUMUNIUM' | 'PVC' | 'DUCO_LUXURY' (default: MULTIPLEKS jika tidak spesifik).
   - style: 'MINIMALIS' | 'SEMI_KLASIK' | 'KLASIK' | 'SINGLE_LAYER' | 'DOUBLE_LAYER' (default: MINIMALIS).

5. Format Wajib:
Keluarkan MURNI JSON valid tanpa markdown, tanpa awalan backticks, persis dengan struktur berikut:
{
  "category": "KITCHEN_SET",
  "subItem": null,
  "material": "MULTIPLEKS",
  "style": "MINIMALIS",
  "cabinetBawah": 3.0,
  "cabinetAtas": 2.5,
  "isKusenBawahOnly": false,
  "topTableOption": "GRANIT",
  "topTableLength": 3.0,
  "backsplashOption": "KERAMIK_BEVEL",
  "backsplashLength": 3.0,
  "miniBarLength": 0,
  "topiBarLength": 0,
  "boxElektronik": {
    "active": false,
    "boxP": 0.8,
    "boxT": 2.0,
    "boxQty": 1
  },
  "hambalanLength": 0,
  "p": 3.0,
  "t": 2.2,
  "l": 0.6,
  "detectedSummary": "Deskripsi singkat hasil analisa denah/sketsa dalam 1-2 kalimat bahasa Indonesia yang jelas."
}`;

        // 3. Panggil Gemini Vision API jika key ada
        if (apiKey || customProxyUrl) {
            try {
                const parts = [];
                if (imagePart) {
                    parts.push(imagePart);
                    parts.push({
                        text: `Analisis gambar denah / sketsa ukuran / foto ruangan berikut secara teliti.
Ekstrak seluruh dimensi ukuran fisik (dalam meter) dan elemen kabinet interior sesuai standar resmi.
Keluarkan hasil murni JSON sesuai skema sistem.`
                    });
                } else {
                    parts.push({
                        text: `Analisis isi spesifikasi dokumen / teks berikut:
${fileTextContent}

Ekstrak seluruh dimensi ukuran fisik (dalam meter) dan elemen kabinet interior sesuai standar resmi.
Keluarkan hasil murni JSON sesuai skema sistem.`
                    });
                }

                const endpoint = customProxyUrl && customProxyUrl.trim()
                    ? customProxyUrl.trim()
                    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts }],
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        generationConfig: {
                            temperature: 0.1,
                            responseMimeType: "application/json"
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (text) {
                        const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                        const parsed = JSON.parse(cleanJson);
                        return {
                            success: true,
                            ...parsed,
                            source: 'ai_vision'
                        };
                    }
                } else {
                    console.warn(`Gemini Vision API status ${response.status}, beralih ke fallback analitik.`);
                }
            } catch (apiErr) {
                console.warn('Gagal memproses via AI API, beralih ke fallback lokal:', apiErr);
            }
        }

        // 4. Intelligent Local Fallback Parser
        // Membaca nama file atau parameter teks secara heuristik jika API belum diisi / offline
        const fileName = (file.name || '').toLowerCase();
        let fallbackCategory = 'KITCHEN_SET';
        let fallbackSubItem = null;
        let fallbackBawah = 3.0;
        let fallbackAtas = 2.5;
        let fallbackBox = { active: false, boxP: 0.8, boxT: 2.0, boxQty: 1 };
        let fallbackHambalan = 0;
        let fallbackMiniBar = 0;

        if (fileName.includes('wardrobe') || fileName.includes('lemari') || fileName.includes('kamar')) {
            fallbackCategory = 'KAMAR_SET';
            fallbackSubItem = 'LEMARI_WARDROBE';
        } else if (fileName.includes('tv') || fileName.includes('backdrop') || fileName.includes('living')) {
            fallbackCategory = 'LIVING_ROOM';
            fallbackSubItem = 'BACKDROP_TV';
        } else if (fileName.includes('kanopi') || fileName.includes('pagar') || fileName.includes('sipil')) {
            fallbackCategory = 'SIPIL_BENGKEL';
            fallbackSubItem = 'CANOPI';
        }

        // Cari angka di nama file misal 'dapur_3.5m_2.8m'
        const numMatches = fileName.match(/\d+([.,]\d+)?/g);
        if (numMatches && numMatches.length > 0) {
            const parsedNums = numMatches.map(n => parseFloat(n.replace(',', '.'))).filter(n => n > 0 && n < 20);
            if (parsedNums.length >= 2) {
                fallbackBawah = parsedNums[0];
                fallbackAtas = parsedNums[1];
            } else if (parsedNums.length === 1) {
                fallbackBawah = parsedNums[0];
                fallbackAtas = Math.max(1, Math.round((parsedNums[0] * 0.8) * 10) / 10);
            }
        }

        if (fileName.includes('kulkas') || fileName.includes('box')) {
            fallbackBox.active = true;
        }
        if (fileName.includes('hambalan') || fileName.includes('shelf')) {
            fallbackHambalan = 1.5;
        }
        if (fileName.includes('minibar') || fileName.includes('island')) {
            fallbackMiniBar = 1.6;
        }

        return {
            success: true,
            category: fallbackCategory,
            subItem: fallbackSubItem,
            material: 'MULTIPLEKS',
            style: 'MINIMALIS',
            cabinetBawah: fallbackBawah,
            cabinetAtas: fallbackAtas,
            isKusenBawahOnly: fileName.includes('kusen') || fileName.includes('cor'),
            topTableOption: fileName.includes('granit') ? 'GRANIT' : (fileName.includes('quadra') ? 'QUADRA' : 'none'),
            topTableLength: fallbackBawah,
            backsplashOption: fileName.includes('keramik') ? 'KERAMIK_BEVEL' : (fileName.includes('splash') ? 'AICA' : 'none'),
            backsplashLength: fallbackBawah,
            miniBarLength: fallbackMiniBar,
            topiBarLength: 0,
            boxElektronik: fallbackBox,
            hambalanLength: fallbackHambalan,
            p: fallbackBawah,
            t: 2.2,
            l: 0.6,
            detectedSummary: `File denah/sketsa "${file.name}" berhasil diunggah. Terdeteksi estimasi awal dimensi untuk ${fallbackCategory.replace(/_/g, ' ')}. Silakan periksa atau sesuaikan angka pada formulir.`,
            source: 'heuristic_fallback'
        };
    }
};
