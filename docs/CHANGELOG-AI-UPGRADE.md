# CATATAN PERUBAHAN UPGRADE (CHANGELOG)
**Proyek:** NACIRA STUDIO Multi-Brand Sales Intelligence AI  
**Rilis:** v2026.2.0 (Interior Sales AI Copilot Production Upgrade)  
**Tanggal:** 25 September 2026  
**File:** `/docs/CHANGELOG-AI-UPGRADE.md`  

---

## 1. PENINGKATAN PERFORMA & STREAMING ENGINE (LATENCY OPTIMIZATION)
- **Implementasi Server-Sent Events (SSE) Streaming:** Menambahkan dukungan `streamGenerateContent` pada Google Gemini API dan `stream: true` pada endpoint OpenAI/OpenRouter, memangkas Time To First Token (TTFT) dari ~4.8s menjadi ~650ms.
- **Instrumentasi Latensi Real-Time:** Menambahkan modul `src/js/services/telemetry.js` yang mengukur durasi siklus `requestStart`, `imageDuration`, `retrievalDuration`, `llmTTFT`, dan `totalDuration`.
- **In-Memory LRU Image Fingerprint Cache:** Menambahkan sistem caching pada `src/js/utils/image.js` untuk mencegah optimasi canvas dan encoding ulang saat admin mengganti mode balasan dengan screenshot yang sama (<1ms retrieval).
- **Pengurangan Ukuran Payload Screenshot:** Kompresi canvas cerdas (1200px @ 0.85 Quality) menghemat 96% ukuran file dari ~3-5MB menjadi ~120KB tanpa mengurangi ketajaman teks WhatsApp.

---

## 2. MODULARISASI ARSITEKTUR AI ORKESTRASI
Memecah logika monolitik AI menjadi sub-layanan mandiri dan teruji di bawah folder `src/js/services/ai/`:
- **`ConversationAnalyzer.js`:** Mendukung standar 26 Sales Intents, 15 Funnel Stages, 3 Lead Temperatures (HOT, WARM, COLD), dan 20 Next Best Actions.
- **`CustomerMemoryEngine.js`:** Menangani skema memori klien, deteksi regional otomatis PL DK (Bandung & Priangan) vs PL LK (Jabodetabek & Luar Kota), dan aturan imperatif anti-tanya-ulang.
- **`SalesStrategyEngine.js`:** Menyediakan playbook SOP taktis untuk 6 response mode (`SMART_REPLY`, `PRICE_EXPLANATION`, `SURVEY_INVITATION`, `OBJECTION_HANDLING`, `FOLLOW_UP`, `CLOSING`).
- **`KnowledgeRetriever.js`:** Mengintegrasikan memori wilayah dengan pencarian knowledge base hierarkis 3-tier serta pemotongan token konteks yang tidak relevan.
- **`ResponseParser.js`:** Parser tangguh 3-layer (Direct JSON, Slice Search, Regex Extractor) yang menjamin zero-crash saat model LLM mengalami timeout atau respon terpotong di tengah streaming.

---

## 3. PENINGKATAN ANTARMUKA PENGGUNA (UI / UX ACCELERATORS)
- **Live Streaming Typing Preview:** Saat status loading aktif dan token streaming tiba, antarmuka menampilkan preview balasan WhatsApp secara langsung dengan kursor ketik aktif (`▍`).
- **Pill Indikator Latensi:** Menampilkan ringkasan metrik kecepatan secara transparan (contoh: `⚡ 1.15s (Retrieval: 4ms | LLM: 1.14s)`).
- **Tombol 1-Klik Buka WhatsApp Web (`wa.me` deep link):** Admin dapat langsung membuka WhatsApp Web dengan teks balasan terisi otomatis tanpa perlu copy-paste manual.
- **Quick Feedback Rating (👍 / 👎):** Tombol umpan balik cepat "Akurat" atau "Koreksi" yang langsung dicatat ke log telemetri untuk evaluasi berkelanjutan tim marketing.

---

## 4. KEAMANAN & PRIVASI DATA (SECURITY & COMPLIANCE)
- **PII Phone Number Masking:** Nomor telepon calon klien disamarkan secara otomatis (`0812****7890`) sebelum disimpan ke log telemetri.
- **Anti-Prompt Injection Defense:** Pesan klien diisolasi dalam tag `<untrusted_customer_message>` dengan instruksi penjaga di Layer 1 System Core.
- **Tenant Isolation Verification:** Memastikan isolasi ketat antar 5 brand tanpa risiko kebocoran data kontak, harga, atau materi workshop.

---

## 5. PENGUJIAN AKSEPTANSI & DOKUMENTASI
- **Ekspansi Test Suite:** Memperluas `scripts/run_acceptance_tests.mjs` dari 45 assertion menjadi **63 assertion otomatis** (15 test suites), mencakup seluruh logika baru dengan tingkat kelulusan 100%.
- **Dokumentasi Lengkap di `/docs/`:**
  - `AI-SALES-COPILOT-AUDIT.md` (Audit Baseline)
  - `AI-ARCHITECTURE.md` (Spesifikasi Arsitektur Sistem)
  - `AI-KNOWLEDGE-ARCHITECTURE.md` (Arsitektur Knowledge & Pricelist DK/LK)
  - `AI-MEMORY.md` (Sistem Memori Anti-Tanya Ulang)
  - `AI-SALES-ENGINE.md` (Playbook & Strategi Penjualan WhatsApp)
  - `AI-PERFORMANCE.md` (Benchmark Kinerja & Latensi)
  - `AI-SECURITY.md` (Protokol Keamanan & Masking PII)
  - `AI-EVALUATION.md` (Laporan Uji Akseptansi 63/63 Tests)
  - `CHANGELOG-AI-UPGRADE.md` (Catatan Riwayat Rilis)
