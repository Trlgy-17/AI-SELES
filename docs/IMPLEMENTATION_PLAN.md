# MASTER IMPLEMENTATION PLAN
## UPGRADE MULTI-BRAND INTERIOR SALES INTELLIGENCE AI
**Target Sistem:** Multi-Brand Sales Assistant Platform (Nacira Studio, Homeputra Interior, Heya Interior, Putra Interior, Kurnia Interior)  
**Dokumen Referensi:** `/docs/` (Audit, Target Arch, Database Schema, AI Arch, Knowledge Arch, RBAC, Security, Test Plan)  
**Prinsip Utama:** CORRECTNESS > SECURITY > DATA INTEGRITY > UX > PERFORMANCE > VISUAL EFFECT

---

## 1. Existing Condition, Problems & Root Causes

### A. Kondisi Eksisting (Existing Condition)
- Aplikasi berbasis Vite + React 18 SPA dengan 4 tab utama (`AIWorkspace`, `CRMModule`, `FollowUpModule`, `KnowledgeBase`).
- Seluruh teks brand, nomor kontak WhatsApp, nama admin ("Ary"), serta katalog harga di-hardcode dengan identitas tunggal "NACIRA STUDIO".
- Data leads dan tugas follow-up disimpan di `localStorage` / Firebase tanpa atribut `brand_id`.
- Tidak ada sistem otentikasi akun atau manajemen hak akses (*Role-Based Access Control*).
- System prompt monolitik berukuran besar (~2000 token) dikirimkan pada setiap pemanggilan AI tanpa mekanisme *Knowledge Retrieval* (RAG).

### B. Masalah Utama (Core Problems)
1. **Ketidakmampuan Multi-Brand:** Admin marketing dari brand lain (Homeputra, Heya, Putra, Kurnia) tidak bisa menggunakan aplikasi karena UI dan output AI selalu menyatakan diri sebagai "Nacira Studio" dan "Ary".
2. **Risiko Pencampuran Data Klien (100% Data Leak):** Semua admin mengakses database leads yang sama; tidak ada isolasi data antar brand.
3. **Pemborosan Biaya & Latensi AI:** Seluruh basis pengetahuan harga dimasukkan sekaligus ke dalam prompt AI, memicu latensi tinggi dan potensi halusinasi.
4. **Respon Tunggal & Hilangnya Konteks Klien:** AI hanya memberikan 1 draf balasan tanpa opsi alternatif gaya komunikasi (*Soft / Direct*), dan sering mengulang pertanyaan yang sudah pernah dijawab oleh klien (*amnesia percakapan*).

### C. Akar Masalah (Root Causes)
- Arsitektur lama didesain sebagai alat internal monolitik untuk 1 pemilik bisnis tunggal (*single-tenant*).
- Belum ada abstraksi antara **Data Identitas Brand (Brand Context)** dengan **Fakta Pengetahuan Teknis (Core Knowledge)**.
- Ketiadaan layer sesi terotentikasi (*Authenticated Session Context*).

---

## 2. Solusi Rekomendasi (Recommended Solution)

1. **Shared Core Knowledge + Brand Context:**
   - Mempertahankan seluruh pengetahuan teknis, SOP sales, dan master pricelist 2026 milik Nacira sebagai **Global Shared Core Knowledge**.
   - Menyediakan layer **Brand Context** dinamis yang mengambil identitas (nama, logo, kontak, salam penutup, gaya bahasa) dari brand aktif yang terotentikasi.
2. **Layered Knowledge Engine:**
   - 3 Layer: `GLOBAL KNOWLEDGE` → `BRAND OVERRIDE` → `ACTIVE CAMPAIGN`.
   - Menggunakan *Keyword & Intent Retrieval* ringan untuk menyuntikkan hanya informasi relevan ke LLM.
3. **Autentikasi & RBAC:**
   - Struktur pengguna dengan role `SUPER_ADMIN`, `BRAND_ADMIN`, dan `MARKETING_ADMIN`.
   - Super Admin memiliki *Brand Switcher Workspace*; Marketing Admin terkunci secara ketat pada brand miliknya.
4. **Isolasi Data Mutlak:**
   - Seluruh query data (`clients`, `conversations`, `messages`, `followups`) wajib menyertakan filter `brand_id`.
5. **AI Sales Copilot Tingkat Lanjut:**
   - Menghasilkan 3 variasi balasan terstruktur: `RECOMMENDED`, `ALTERNATIVE_SOFT`, dan `ALTERNATIVE_DIRECT`.
   - Smart Context Panel internal (Intent, Buying Stage, Temperature, Missing Information, Next Best Action, Internal Knowledge Sources).
   - Memori Klien Terstruktur (*Client Memory*) untuk mencegah pengulangan pertanyaan.
6. **Command Palette (`CTRL + K`) & UX Dark Luxury Modern:**
   - Akses cepat keyboard-driven untuk admin marketing.

---

## 3. Rencana Bertahap (15-Phase Execution Plan)

```
[Phase 1] Audit & Dokumentasi Blueprint (SELESAI)
   ↓
[Phase 2] Struktur Database Multi-Tenant & Skema State
   ↓
[Phase 3] Sistem Autentikasi, Sesi Pengguna & RBAC
   ↓
[Phase 4] Engine Pengetahuan 3-Lapisan (Global, Override, Campaign)
   ↓
[Phase 5] Dynamic Brand Context Injection & Brand Switcher
   ↓
[Phase 6] Modular AI Prompt Architecture (7 Konteks)
   ↓
[Phase 7] CRM Upgrade: Tenant Scoping & Client Memory Engine
   ↓
[Phase 8] Smart Workspace: 3 Alternatif Balasan & Smart Context Panel
   ↓
[Phase 9] Follow-Up Intelligence & Reaktivasi Ghosting Cerdas
   ↓
[Phase 10] UI/UX Redesign: Dynamic Header, Brand Identity & Responsive
   ↓
[Phase 11] Dashboard Analitik Performa Multi-Brand
   ↓
[Phase 12] Security Hardening & Prompt Injection Guardrails
   ↓
[Phase 13] Optimasi Kinerja, Caching & Token Reduction
   ↓
[Phase 14] Pengujian Otomatis (10 Acceptance Tests Suite)
   ↓
[Phase 15] Audit Kesiapan Produksi & Laporan Akhir
```

### Rincian Tiap Fase:

#### Fase 1: Audit & Dokumentasi Blueprint (Status: SELESAI)
- Menyusun 9 dokumen arsitektur dan audit di `/docs/`.

#### Fase 2: Struktur Database Multi-Tenant & Skema State
- Membuat model entitas: `brands`, `users`, `clients`, `client_memories`, `conversations`, `messages`, `followup_tasks`, `knowledge_items`, `audit_logs`.
- Menambahkan helper migrasi data eksisting Nacira ke `brand_nacira` dengan backup otomatis.

#### Fase 3: Sistem Autentikasi, Sesi Pengguna & RBAC
- Implementasi session manager terotentikasi di client-side service.
- Menetapkan akun default untuk Super Admin dan masing-masing Admin Marketing (`HOMEPUTRA`, `HEYA`, `PUTRA`, `KURNIA`, `NACIRA`).
- Penegakan izin akses per role.

#### Fase 4: Engine Pengetahuan 3-Lapisan
- Migrasi data harga `constants.js` menjadi `GLOBAL_KNOWLEDGE`.
- Implementasi logika resolusi: Safety → Brand Config → Brand Override → Campaign → Global Knowledge.
- Konsol Pengujian Pengetahuan (*Knowledge Testing Console*).

#### Fase 5: Dynamic Brand Context Injection & Brand Switcher
- Komponen Header dan Sidebar dinamis menyesuaikan data brand aktif.
- Brand Switcher khusus role `SUPER_ADMIN`.
- Penyesuaian nama tab dan indikator status knowledge.

#### Fase 6: Modular AI Prompt Architecture
- Pembagian prompt menjadi 7 layer (`SYSTEM_CORE`, `SALES_POLICY`, `BRAND_CONTEXT`, `KNOWLEDGE_CONTEXT`, `CLIENT_CONTEXT`, `CONVERSATION_CONTEXT`, `TASK_CONTEXT`).
- Penghapusan seluruh teks statis "Nacira Studio" dan "Ary" dari logic prompt.

#### Fase 7: CRM Upgrade & Client Memory
- Penambahan kolom `brand_id` pada seluruh record klien.
- Penyimpanan memori spesifikasi klien (dimensi, lokasi, budget, preferensi).
- Normalisasi nomor telepon E.164 dan deteksi duplikasi kontak.

#### Fase 8: Smart Workspace: 3 Alternatif Balasan
- Output AI menghasilkan 3 pilihan respons: `RECOMMENDED`, `SOFT`, `DIRECT`.
- Tombol Copy sekali klik dengan format WhatsApp bersih.
- Smart Context Panel internal (Intent, Stage, Temperature, Missing Info, Next Action).

#### Fase 9: Follow-Up Intelligence
- Penjadwalan follow-up cerdas (D+1, D+3, D+7, D+14, D+30).
- Penanganan klien Hold / Dormant berdasarkan alasan.

#### Fase 10: UI/UX Redesign & Responsive Layout
- Tema Dark Luxury konsisten (Black, Charcoal, Warm Gold, Off-White).
- Dukungan Command Palette (`CTRL + K`).
- Pengujian visual responsif dari 320px hingga 1920px.

#### Fase 11: Dashboard Analitik
- Ringkasan leads per brand: Today's Leads, Hot Leads, Survey Candidates, Quotation, Closing Deal, Win Rate.
- Filter waktu (Hari Ini, 7 Hari, 30 Hari).

#### Fase 12: Security Hardening
- Pembungkus input tidak tepercaya `<untrusted_customer_message>`.
- Pencegahan kebocoran data antar tenant (IDOR checks).
- Masking kunci API dan audit logging.

#### Fase 13: Optimasi Kinerja
- Retrieval berbasis keyword/kategori untuk memangkas token input hingga 70%.
- Caching hasil query knowledge.

#### Fase 14: Pengujian Otomatis
- Eksekusi 10 skenario Acceptance Tests (Section AZ).
- Unit testing fungsi parser, resolusi prioritas, dan kompresi gambar.

#### Fase 15: Kesiapan Produksi & Laporan Akhir
- Eksekusi `npm run build` dan type/lint audit.
- Menyusun `/docs/FINAL_IMPLEMENTATION_REPORT.md`.

---

## 4. Berkas yang Terdampak (*Files Impacted*)
- `src/js/constants.js`: Tambah data master 5 brands resmi, skema role, default global knowledge.
- `src/js/services/auth.js`: Service baru untuk sesi pengguna terotentikasi & RBAC.
- `src/js/services/knowledge.js`: Service baru untuk resolusi 3-layer knowledge & retrieval RAG.
- `src/js/services/ai.js`: Restrukturisasi total ke 7-layer modular prompt & output JSON 3 alternatif.
- `src/js/services/storage.js`: Penegakan tenant scoping (`brand_id`).
- `src/js/services/migration.js`: Migrasi non-destruktif data lama ke `brand_nacira`.
- `src/components/layout/Header.jsx`: Dynamic brand header + Brand Switcher untuk Super Admin.
- `src/components/layout/Sidebar.jsx`: Dynamic brand navigation, profil brand aktif, indikator role.
- `src/components/layout/CommandPalette.jsx`: Komponen baru Command Palette (`CTRL + K`).
- `src/components/modules/AIWorkspace.jsx`: 3 alternatif balasan + Smart Context Panel + Mode Penjualan.
- `src/components/modules/CRMModule.jsx`: Scoped client list, client memory viewer, phone normalizer.
- `src/components/modules/KnowledgeBase.jsx`: 3-layer view (Global vs Brand Override vs Campaign) + Tester Console.
- `src/components/modals/AuthModal.jsx`: Modal login dan ganti akun admin marketing.
- `src/js/app.jsx`: Root context provider untuk Auth, Active Brand, dan Multi-Tenant Sync.

---

## 5. Rencana Migrasi Data (Zero Data Loss)
1. **Fase Pra-Migrasi:** Buat salinan cadangan snapshot `localStorage` ke key `nacira_backup_v2_pre_multibrand`.
2. **Pemberian Tagging Brand:** Setiap lead eksisting otomatis diberikan atribut `brand_id: 'brand_nacira'`.
3. **Penyelarasan Knowledge:** Objek `PRICE_MASTER` lama dijadikan record `scope: 'GLOBAL'` sehingga dapat langsung diakses oleh kelima brand tanpa duplikasi.
4. **Verifikasi:** Memastikan jumlah data lead dan tugas sebelum dan sesudah migrasi bernilai identik.
