# Audit Sistem Saat Ini — NACIRA Sales AI CRM

Tanggal audit: 2026-09-29. Semua temuan berasal dari pembacaan kode di branch `main`.

## 1. Arsitektur saat ini
- **Frontend-only**: React 18 + Vite 6 + Tailwind v4 (`src/`). Tidak ada backend aplikasi.
- `server.js` di root adalah static file server lama berbasis `require()`; `package.json` bertipe ESM sehingga file ini tidak dapat dijalankan dan tidak dipakai script apa pun (dead code).
- Navigasi tab di `src/js/app.jsx` (`workspace`, `crm`, `estimator`, `knowledge`), semua state di komponen `App`.
- Firebase (CDN v11.6.1, `src/js/services/firebase.js`) opsional: konfigurasi diisi user di modal Pengaturan Cloud dan disimpan di localStorage.

## 2. Alur data
```
UI (React state) ──► StorageService (localStorage, key per user anonim)
        │
        └──(opsional)► Firestore artifacts/{appId}/users/{anonUid}/crmLeads|followUpTasks
```
- Sumber kebenaran de facto: localStorage browser masing-masing admin. Data tidak dibagi antar perangkat/admin kecuali Firebase diaktifkan.
- Firestore disinkron per **user anonim**, bukan per brand, dan tidak ada aturan akses brand.

## 3. Pipeline AI
- `AIWorkspace.jsx` → `AIService.generateWhatsAppReply` (`src/js/services/ai.js`).
- Prompt modular disusun di browser: system core, sales policy, human voice, persuasion playbook, brand, knowledge (dari `KnowledgeRetriever` → localStorage), client memory (`CustomerMemoryEngine`), mode playbook (`SalesStrategyEngine`), directive admin, skema JSON.
- **Panggilan ke Gemini/OpenAI dilakukan langsung dari browser** dengan API key yang ada di bundle (`DEFAULT_GEMINI_API_KEY`) atau yang diketik user (disimpan plain text di local/sessionStorage).
- Output diparse `ResponseParser`; telemetry disimpan di localStorage (maks 200 event).

## 4. Pipeline CRM
- Lead dibuat di `CRMModule.jsx` (id acak, `brandId`, telepon dinormalisasi, status label bahasa Indonesia).
- Status: `Prospek / Survey`, `Design Review`, `Penawaran RAB`, `Closing / DP Masuk`, `Selesai / Terpasang`, `Batal`.
- Deteksi duplikat hanya berdasarkan nomor telepon di brand yang sama (client-side).
- Follow-up task (`FollowUpModule.jsx`) ada di kode tetapi **tidak dirender**.

## 5. Storage yang ada
| Key | Isi |
|---|---|
| `nacira_crm_leads_v2_user_{uid}` / `_local_default` | lead |
| `nacira_followup_tasks_v2_user_{uid}` | task |
| `nacira_tombstone_leads_v2*`, `nacira_tombstone_tasks_v2*` | id yang dihapus |
| `nacira_crm_leads_2026`, `nacira_followup_tasks_2026` | data legacy (dibaca sekali) |
| `nacira_*_backup_v1`, `nacira_pre_migration_backup` | backup lokal |
| `multibrand_auth_session`, `multibrand_registered_users/brands` | sesi & user palsu |
| `multibrand_knowledge_items_v2026_2` | knowledge base |
| `sales_ai_telemetry_events_v1` | telemetry |
| `nacira_gemini_api_key`, `nacira_openai_api_key` (+ sessionStorage) | **API key plain text** |
| `nacira_custom_firebase_config` | konfigurasi Firebase |
| `nacira_sidebar_collapsed` dll. | preferensi UI (boleh tetap) |

## 6. Autentikasi saat ini
- `INITIAL_USERS` di `src/js/constants.js` berisi 5 user dengan password `password123`, dibandingkan plain text di `auth.js`.
- `getCurrentSession()` otomatis membuat sesi SUPER_ADMIN bila belum ada → **tidak ada gerbang login**.
- Role hanya `SUPER_ADMIN` dan `MARKETING_ADMIN`; user punya satu `brandId`; tidak ada tabel membership.
- Firebase memakai `signInAnonymously`.

## 7. Technical debt kritis
1. **Bug kehilangan data**: `migrateLeads`/`migrateTasks` (`src/js/services/migration.js`) membangun ulang objek tanpa `brandId`, `location`, `dimensions`, `notes`. `loadUserData` berjalan setiap load → field hilang, lead brand lain jatuh ke `brand_nacira`.
2. Tidak ada backend, database terpusat, audit log, atau otorisasi server.
3. Business rule (harga DK/LK, termin, garansi) tersebar di prompt, `constants.js`, dan `calculatorData.js`.
4. Komponen besar (`AIWorkspace.jsx`, `EstimatorCalculator.jsx` ~1000 baris).
5. Uang disimpan sebagai `Number` JS; tanggal campuran string ISO lokal.

## 8. Temuan keamanan (ringkas — detail di `SECURITY_AUDIT.md`)
- API key Gemini asli di bundle frontend dan riwayat git → **wajib dirotasi**.
- Password hard-code, tidak di-hash, login dapat dilewati.
- Isolasi brand hanya filter di frontend.
- API key user tersimpan plain text di browser.
- Firestore rules tidak memeriksa brand.

## 9. Temuan UI/UX
Sudah diperbaiki di redesign "Modern Sky Intelligence" (lihat `UI_REDESIGN_REPORT.md`). Sisa: follow-up module tidak dirender; "Konsultasi di Sales AI" tidak membawa data lead.

## 10–13. Fitur (ringkas — detail di `FEATURE_AUDIT.md`)
- **Keep**: Sales AI, CRM, Estimator (rumus), PDF export, Knowledge 3-layer, multi-brand, command palette.
- **Merge**: follow-up task ke CRM (task per lead); enam mode AI → Smart Auto + override lanjutan.
- **Remove**: `server.js` lama, API key di frontend, password hard-code, sinkron Firestore anonim (menjadi sumber impor saja).
- **Belum ada**: database terpusat, login nyata, RBAC, audit log, timeline, Customer 360, memori terstruktur, integrasi e-report.

## 14. Risiko migrasi
- Data tersebar di localStorage tiap browser admin → perlu impor per perangkat.
- Field hilang akibat bug nomor 1 tidak dapat dipulihkan dari data lama yang sudah tertimpa; backup `nacira_pre_migration_backup` bisa berisi versi lebih lengkap.
- Lead tanpa `brandId` harus dipetakan manual/ditandai.
- Nomor telepon tidak valid → dicatat `invalid`, tidak dibuang diam-diam.
