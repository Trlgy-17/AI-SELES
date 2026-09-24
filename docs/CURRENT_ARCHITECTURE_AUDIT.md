# AUDIT ARSITEKTUR EKSISTING (CURRENT STATE AUDIT)
**Aplikasi:** NACIRA STUDIO — Sales Intelligence AI  
**Tanggal Audit:** 25 September 2026  
**Auditor:** Senior Full-Stack & AI Architecture Team  
**Status:** Audit Menyeluruh Sebelum Migrasi Multi-Brand

---

## 1. Audit Source Code Eksisting
- **Stack Teknologi:** Vite 6.4 + React 18 (SPA) dengan Tailwind CSS via CDN / style kustom di `src/styles/style.css`.
- **Struktur Proyek:**
  - `src/components/common/`: Komponen UI atomik (`Toast`, `FormField`, `StatusBadge`, `ConfirmModal`, `InAppReminderBanner`).
  - `src/components/layout/`: Shell layout desktop & mobile drawer (`AppShell`, `Header`, `Sidebar`).
  - `src/components/modals/`: Modal dialog (`ApiKeyModal`, `CloudSettingsModal`, `EditLeadModal`, `EditTaskModal`).
  - `src/components/modules/`: 4 Tab Modul Utama:
    1. `AIWorkspace.jsx`: Textarea input chat + upload screenshot image, copy button, status badge, trigger API.
    2. `CRMModule.jsx`: Manajemen leads tabel, filter pipeline (Prospek, Desain, Closing, Batal), modal add/edit lead, pagination, export CSV.
    3. `FollowUpModule.jsx`: Kanban/list tugas tindak lanjut berdasarkan tanggal (`overdue`, `today`, `reschedule`).
    4. `KnowledgeBase.jsx`: Katalog visual harga, material, layanan, dan spesifikasi.
  - `src/js/services/`: Service layer (`ai.js`, `storage.js`, `firebase.js`, `migration.js`, `export.js`).
  - `src/js/utils/`: Helper utility (`clipboard.js`, `date.js`, `id.js`, `image.js`, `phone.js`).
- **Temuan Utama:**
  - Aplikasi bertipe *client-side only*. Seluruh proses state management tersimpan di `window.localStorage` atau Firebase client SDK.
  - Belum ada konsep router (seperti React Router) melainkan single tab state: `activeTab` ('workspace', 'crm', 'followup', 'knowledge').

---

## 2. Audit Struktur Database
- **Penyimpanan Lokal:** `window.localStorage` dibungkus oleh `StorageService` (`src/js/services/storage.js`).
- **Penyimpanan Cloud (Opsional):** Firebase Firestore anonymous auth (`artifacts/{appId}/users/{userId}/crmLeads` dan `followUpTasks`).
- **Schema Data Eksisting:**
  - **Leads:**
    ```json
    {
      "id": "lead_171...",
      "name": "Bpk Hendra",
      "phone": "08123456789",
      "city": "Bandung",
      "projectType": "Kitchen Set",
      "budget": "Rp 25.000.000",
      "status": "Prospek / Survey",
      "priority": "High",
      "notes": "...",
      "createdAt": "2026-09-24T...",
      "updatedAt": "2026-09-24T..."
    }
    ```
  - **Tasks:**
    ```json
    {
      "id": "task_171...",
      "leadId": "lead_171...",
      "title": "Follow up survey",
      "dueDate": "2026-09-25",
      "status": "Belum",
      "needsReschedule": false
    }
    ```
- **Kelemahan Kritis:**
  - **Tidak ada field `brand_id`** pada data lead maupun task!
  - Tidak ada tabel atau relasi untuk `brands`, `users`, `roles`, `permissions`, `brand_overrides`, `campaigns`, `conversations`, atau `messages`.
  - Jika banyak brand menggunakan sistem ini, semua data bercampur aduk dalam 1 ember.

---

## 3. Audit Authentication & Session
- **Kondisi Eksisting:**
  - **Tidak ada sistem login/autentikasi pengguna!**
  - Siapa pun yang membuka URL `http://localhost:3000` langsung masuk sebagai admin "Ary" (Nacira Studio).
  - Firebase hanya menggunakan `signInAnonymously()`, yang hanya membedakan instalasi browser secara anonim, bukan user akun resmi.
- **Kelemahan Kritis:**
  - Tidak ada proteksi akses berbasis akun (email/password, OAuth, JWT token).
  - Tidak ada verifikasi otentikasi di sisi backend; frontend tidak memiliki sesi pengguna yang terverifikasi.

---

## 4. Audit Knowledge Database
- **Kondisi Eksisting:**
  - Data harga dan SOP di-hardcode di dua tempat terpisah:
    1. Objek JavaScript statis `PRICE_MASTER` di `src/js/constants.js`.
    2. Teks string panjang di dalam `AIService.buildSystemPrompt()` pada `src/js/services/ai.js`.
  - Terdapat duplikasi data antara `constants.js` dan `ai.js`.
- **Kelemahan Kritis:**
  - Tidak ada layer pemisah antara **Global Shared Core Knowledge** dengan **Brand Context/Override**.
  - Tidak ada sistem versioning (misal v1.0, v2.1).
  - Admin/Super Admin tidak bisa mengedit harga atau SOP tanpa menyentuh kode program.

---

## 5. Audit AI Prompting
- **Kondisi Eksisting:**
  - Prompt menggunakan satu string besar yang menggabungkan persona Nacira Studio, nomor telepon Ary, data harga, SOP WhatsApp, hingga aturan output JSON.
  - Nama "NACIRA STUDIO" dan "Ary" tertulis mati (hardcoded) di dalam prompt.
- **Kelemahan Kritis:**
  - Tidak ada pembagian modular: `SYSTEM_CORE`, `SALES_POLICY`, `BRAND_CONTEXT`, `KNOWLEDGE_CONTEXT`, `CLIENT_CONTEXT`, `CONVERSATION_CONTEXT`, `TASK_CONTEXT`.
  - Menghalangi multi-brand karena LLM selalu menganggap dirinya "Nacira Studio" dan mewakili "Ary".

---

## 6. Audit Pengiriman Knowledge ke LLM (Retrieval / RAG)
- **Kondisi Eksisting:**
  - **Zero Retrieval:** Seluruh pricelist dan SOP dimasukkan sekaligus ke dalam System Prompt pada setiap pemanggilan API (baik client tanya harga dapur, canopi, maupun sekadar tanya jam buka).
- **Kelemahan Kritis:**
  - Menghabiskan token input (~550 - 2000 token per request) secara boros.
  - Meningkatkan latensi pra-inferensi (pre-fill) dan biaya API.
  - Memperbesar peluang halusinasi karena model harus memproses database harga menyeluruh sekaligus.
  - Tidak ada chunking, indexing metadata, semantic search, maupun keyword fallback.

---

## 7. Audit Session / Chat History & Client Memory
- **Kondisi Eksisting:**
  - Modul AI Workspace bersifat stateless: teks chat di-input di textarea, dikirim ke AI, lalu hasilnya ditampilkan. Begitu di-refresh atau digenerate ulang, konteks percakapan sebelumnya hilang.
  - Tidak ada entitas `conversations` atau `messages` yang tersimpan terhubung dengan `client_id`.
- **Kelemahan Kritis:**
  - AI menderita *amnesia percakapan*: AI tidak tahu bahwa kemarin klien sudah memberitahukan ukuran dapur 3 meter atau berlokasi di Cimahi, sehingga AI berulang kali menanyakan hal yang sama (melanggar prinsip Sales SOP).

---

## 8. Audit UI/UX
- **Kondisi Eksisting:**
  - Header: Hardcoded "NACIRA STUDIO Sales Intelligence AI".
  - Sidebar: Hardcoded "NACIRA STUDIO Sales AI v2026" beserta logo badge tunggal.
  - Hasil Generate: Hanya menghasilkan 1 variasi balasan tunggal.
  - Tidak ada tombol variasi komunikasi: *Recommended*, *Alternative - Soft*, *Alternative - Direct*.
  - Tidak ada internal *Smart Context Panel* (analisis profil klien, missing info, next best action).
  - Tidak ada Command Palette (`CTRL + K`) untuk operasional super cepat admin marketing.
  - Tidak ada Brand Switcher untuk Super Admin.

---

## 9. Audit Performa
- **Kondisi Eksisting:**
  - Kompresi gambar screenshot di sisi browser (`optimizeImageForAI`) sudah berjalan baik (~150KB).
  - Namun pemrosesan knowledge masih monolitik tanpa caching per query.
  - Seluruh data leads dan tasks dimuat sekaligus ke memori tanpa pagination/virtualization di level storage.

---

## 10. Audit Security & Vulnerabilities
- **IDOR (Insecure Direct Object Reference):** Tidak ada validasi kepemilikan data antar brand/admin.
- **Client-Side API Key Exposure:** Kunci API Gemini/OpenAI tersimpan dalam `localStorage` / `sessionStorage` browser tanpa enkripsi at rest.
- **Prompt Injection:** Input teks dari klien dimasukkan langsung ke prompt tanpa pembatas (*delimiters*) khusus yang membedakan instruksi sistem dari input klien yang tidak tepercaya (*untrusted input*).
- **Brand Forgery:** Karena tidak ada backend token, frontend bisa dengan mudah memanipulasi identitas brand jika API menerima parameter mentah.

---

## 11. Audit Kemungkinan Data Antar Admin Bercampur
- **Risiko Saat Ini: 100% Bercampur.**
- Jika 2 admin marketing (misal Admin Homeputra Interior dan Admin Heya Interior) mengakses browser yang sama atau instance yang sama, keduanya akan melihat daftar lead yang sama persis karena ketiadaan `brand_id` dan *tenant isolation*.

---

## 12. Audit Hardcoded Text "NACIRA STUDIO"
Ditemukan **58 referensi hardcoded** tersebar di:
1. `src/components/Icons.jsx` (L70): `NaciraLogoIcon`
2. `src/components/layout/Header.jsx` (L18, L22): Logo & text "NACIRA STUDIO"
3. `src/components/layout/Sidebar.jsx` (L64, L67): Logo & text "NACIRA STUDIO"
4. `src/components/modals/ApiKeyModal.jsx` (L150): Proxy placeholder
5. `src/components/modules/AIWorkspace.jsx` (L22, L78-93, L370): Storage keys `nacira_*`, brand heading
6. `src/components/modules/KnowledgeBase.jsx` (L12, L56, L65): Hardcoded cards
7. `src/js/constants.js` (L5, L8, L10): `PRICE_MASTER.company`
8. `src/js/services/ai.js` (L6-7, L61, L68, L121, L129, L219): Prompt, headers, default strings
9. `src/js/services/export.js` (L5): CSV filename `Nacira_CRM_Export_*`
10. `src/js/services/firebase.js` (L6, L10, L69): `DEFAULT_APP_ID: nacira-sales-crm-default`
11. `src/js/services/migration.js` (L9-15, L174, L197): Storage keys `nacira_*`
12. `src/js/utils/phone.js` (L48): Pesan WhatsApp pembuka default

---

## Kesimpulan Audit
Aplikasi saat ini memiliki fondasi UI yang elegan dan fungsionalitas kompresi screenshot yang cepat, namun **secara fundamental masih monolitik, single-tenant, hardcoded brand, dan tidak aman untuk multi-brand**. Diperlukan restrukturisasi arsitektur menyeluruh sesuai blueprint target.
