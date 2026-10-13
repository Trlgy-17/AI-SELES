# Handoff — Pindah Integrasi e-report ke API Produksi

> Dokumen serah-terima untuk agent/dev berikutnya. Tujuan: aplikasi Sales AI CRM ini mengambil data konsumen (lead) dari **API e-report produksi** `https://api-ereport.interiorcustom.id`, bukan lagi dari server e-report lokal `http://127.0.0.1:8000`.

## 📍 PETA PATH (baca dulu)

**Aplikasi yang dikerjakan: Sales AI (NACIRA CRM)** (BUKAN e-report). Buka workspace: `C:\laragon\www\SALES-AI-NACIRA-main`

### Lokasi dokumen ini
```
C:\laragon\www\SALES-AI-NACIRA-main\docs\EREPORT_PRODUCTION_HANDOFF.md
```

### Dua aplikasi yang terlibat
| Aplikasi | Path lokal | Repo git | Peran |
|---|---|---|---|
| **Sales AI (NACIRA CRM)** — dikerjakan di dokumen ini | `C:\laragon\www\SALES-AI-NACIRA-main` | `https://github.com/Trlgy-17/SALES-AI-NACIRA.git` (branch `main`) | Pemakai data (hanya membaca) |
| e-report backend (Laravel) | `C:\laragon\www\E-REPOR_v0.1\E-REPORT-BACKEND_API` | `https://github.com/xamonxx/api_e-report_v0.2.git` (branch `master`) | Sumber data; produksi `https://api-ereport.interiorcustom.id` |
| e-report frontend (Next.js) | `C:\laragon\www\E-REPOR_v0.1\E-REPORT-FRONTEND` | repo terpisah | UI e-report (tempat fitur token nanti) |

### File Sales AI yang terkait integrasi
```
C:\laragon\www\SALES-AI-NACIRA-main\.env                                                   (EREPORT_API_URL, EREPORT_API_TOKEN, EREPORT_SYNC_INTERVAL_MINUTES — gitignored)
C:\laragon\www\SALES-AI-NACIRA-main\.env.example                                           (contoh tanpa nilai rahasia)
C:\laragon\www\SALES-AI-NACIRA-main\server\src\config.ts                                   (validasi env EREPORT_*)
C:\laragon\www\SALES-AI-NACIRA-main\server\src\index.ts                                    (scheduler sinkron otomatis)
C:\laragon\www\SALES-AI-NACIRA-main\server\src\modules\integrations\ereport\client.ts      (HTTP client GET-only)
C:\laragon\www\SALES-AI-NACIRA-main\server\src\modules\integrations\ereport\sync.ts        (logika sinkron)
C:\laragon\www\SALES-AI-NACIRA-main\server\src\modules\integrations\ereport\routes.ts      (/api/v1/integrations/ereport/*)
C:\laragon\www\SALES-AI-NACIRA-main\server\src\db\schema.ts                                (tabel ereport_*, kolom external_* di clients/leads)
C:\laragon\www\SALES-AI-NACIRA-main\server\tests\import-ai-ereport.test.ts                 (test integrasi)
C:\laragon\www\SALES-AI-NACIRA-main\src\components\modals\CloudSettingsModal.jsx           (panel Pengaturan → Integrasi e-report)
C:\laragon\www\SALES-AI-NACIRA-main\src\components\modules\CRMModule.jsx                   (badge e-report, lead terkunci)
C:\laragon\www\SALES-AI-NACIRA-main\README.md                                              (bagian "e-report integration")
```

### File di e-report yang dirujuk (dibaca saja dari tugas ini)
```
C:\laragon\www\E-REPOR_v0.1\E-REPORT-BACKEND_API\docs\INTEGRATION_API.md
C:\laragon\www\E-REPOR_v0.1\E-REPORT-APP\PLAN (INI ADALAH IDE ATAU UPDATE)\PLAN_PENGATURAN_API_TOKEN_INTEGRASI.md
```

### Tools lokal
```
MySQL  : C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe  --defaults-file=C:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini   (DB nacira_crm & nacira_crm_test, root tanpa password)
PHP    : C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe
Kredensial awal (gitignored, hapus setelah dipakai): C:\laragon\www\SALES-AI-NACIRA-main\.seed-credentials.local.txt
```

## ATURAN WAJIB (jangan dilanggar)
1. **Read-only.** Aplikasi ini TIDAK BOLEH mengubah data di e-report. Jangan pernah menambah request selain GET di `server/src/modules/integrations/ereport/client.ts`, dan jangan membuka rute tulis untuk token integrasi di e-report.
2. **Token rahasia.** Token `erpi_…` hanya disimpan di env server (`.env` lokal yang di-gitignore / environment variable Hostinger). Jangan di-commit, jangan ditulis di kode frontend, jangan ditampilkan di chat/log.
3. **Tanpa aksi di luar izin.** Commit, push, deploy ke server produksi, dan membuat token produksi harus dikonfirmasi pemilik (user) dulu.
4. Komunikasi dengan user dalam **Bahasa Indonesia**.
5. **Keamanan maksimal, nol kebocoran data.** Data yang disalin berisi data pribadi konsumen (nama, telepon, alamat). Setiap celah sekecil apa pun harus ditutup; jika ragu, pilih opsi yang lebih aman. Detail di bagian "Checklist keamanan" di bawah.

## Checklist keamanan (wajib lulus sebelum dianggap selesai)
- [ ] `EREPORT_API_URL` produksi memakai **https**; client menolak URL `http://` saat `NODE_ENV=production`.
- [ ] Token e-report hanya ada di env server. Tidak pernah dikirim ke browser: cek respons `/api/v1/integrations/ereport/status` & `/accounts`, bundle `dist/` (`grep -r erpi_ dist/` kosong), dan log server.
- [ ] Error dari e-report tidak diteruskan mentah ke browser atau log (bisa memuat header/URL); tampilkan pesan generik, log tanpa header `Authorization`.
- [ ] Semua endpoint `/api/v1/integrations/ereport/*` butuh login + permission `settings.manage`; uji dengan role SALES/MARKETING_ADMIN → 403, tanpa login → 401.
- [ ] Lead hasil sinkron tetap terisolasi per brand: user brand A tidak bisa melihat lead e-report yang dipetakan ke brand B (akses lewat ID → 404).
- [ ] Client e-report tetap GET-only (test `ereportClient menolak non-GET` harus lulus). Tidak ada kode yang mengirim data kembali ke e-report.
- [ ] Audit log & `external_sync_runs` tidak menyimpan data pribadi mentah atau token — hanya jumlah dan ID.
- [ ] Produksi: `NODE_ENV=production` (cookie `Secure`), `APP_ORIGIN` = domain asli, `SESSION_SECRET` acak ≥ 32 karakter dan berbeda dari lokal, API Node hanya listen di 127.0.0.1/di belakang proxy Hostinger, MySQL tidak dibuka ke publik.
- [ ] Rotasi `GEMINI_API_KEY` lama yang pernah bocor di riwayat git sebelum go-live.
- [ ] Hapus `.seed-credentials.local.txt` setelah password awal diganti; jangan pernah di-upload ke server.
- [ ] Jika menemukan celah lain di aplikasi ini atau di e-report, laporkan ke user — jangan diabaikan.

## Status saat ini (2026-09-29)
| Bagian | Status |
|---|---|
| Kode integrasi di aplikasi ini (`server/src/modules/integrations/ereport/`) | Selesai, teruji (`npm run test:api` → 20/20 lulus) |
| Kode integrasi di repo e-report (lokal) | Selesai, teruji, **belum di-commit & belum di-deploy** |
| e-report produksi | **Belum punya rute integrasi** — `GET https://api-ereport.interiorcustom.id/api/v1/integration/accounts` → `404` |
| `.env` aplikasi ini | Masih `EREPORT_API_URL=http://127.0.0.1:8000` + token lokal |

## Lokasi
- Aplikasi ini: `C:\laragon\www\SALES-AI-NACIRA-main` (repo `Trlgy-17/SALES-AI-NACIRA`, branch `main`).
- Repo e-report: `C:\laragon\www\E-REPOR_v0.1\E-REPORT-BACKEND_API` (remote `https://github.com/xamonxx/api_e-report_v0.2.git`, branch `master`). Laravel 11 + Sanctum.
- Dokumentasi API integrasi: `E-REPORT-BACKEND_API/docs/INTEGRATION_API.md`.

## Cara kerja singkat
- e-report punya tabel `integration_clients` (bukan user). Token disimpan sebagai hash SHA-256, punya allowlist `allowed_account_ids`, bisa dicabut dan diberi tanggal kedaluwarsa.
- Middleware `integration.token` (`IntegrationTokenAuth`) menolak metode selain GET/HEAD dengan **405** dan tidak pernah lolos `auth:sanctum`.
- Endpoint (GET, `Authorization: Bearer erpi_…`, throttle 60/menit):
  - `/api/v1/integration/accounts`
  - `/api/v1/integration/consultations?account=&updated_since=&include_deleted=1&per_page=100`
  - `/api/v1/integration/consultations/{consultation_id}`
  - `/api/v1/integration/master-data/statuses`
  - `/api/v1/integration/master-data/needs-categories`
- Aplikasi ini menyalin data ke MySQL lokal lewat `runEreportSync` (`server/src/modules/integrations/ereport/sync.ts`):
  - cursor inkremental `updated_since` per akun disimpan di `system_settings` dengan key `ereport.cursor.{accountId}`;
  - upsert berdasarkan `external_id` (= `consultation_id`);
  - data yang dihapus di e-report diarsipkan (`deleted_at`), tidak dihapus permanen;
  - telepon yang sama dengan lead manual hanya diberi tanda duplikat (tidak di-merge);
  - lead dari e-report `is_source_locked = 1` (nama/telepon/lokasi tidak bisa diedit di aplikasi ini).

## Langkah pengerjaan

### Langkah 1 — Commit perubahan di repo e-report (butuh izin user)
File milik fitur integrasi:
```
M  bootstrap/app.php                       (alias middleware integration.token)
M  routes/api.php                          (grup /api/v1/integration, sebelum grup auth:sanctum)
?? app/Console/Commands/IntegrationClientCommand.php
?? app/Http/Controllers/Api/Integration/IntegrationController.php
?? app/Http/Middleware/IntegrationTokenAuth.php
?? app/Models/IntegrationClient.php
?? database/migrations/2026_09_29_000001_create_integration_clients_table.php
?? tests/Feature/Integration/IntegrationApiTest.php
?? docs/INTEGRATION_API.md
```
**Perhatian:** di repo yang sama ada file untracked lain yang BUKAN bagian fitur ini (`Dockerfile`, `Dockerfile.prod`, `.dockerignore`, `docker/`, dan mungkin file lain di `docs/`). Jangan ikut di-commit tanpa bertanya ke user. Gunakan `git add <path>` spesifik, bukan `git add -A`.

Sebelum commit jalankan test:
```bash
php artisan test --filter=IntegrationApiTest
```
(PHP lokal: `C:/laragon/bin/php/php-8.3.30-Win32-vs16-x64/php.exe`.)

### Langkah 2 — Deploy ke server e-report produksi (dilakukan user / butuh akses server)
Setelah kode ter-deploy, di server produksi:
```bash
php artisan migrate --force
php artisan integration:client create "Nacira CRM" --accounts=<ID_AKUN_1>,<ID_AKUN_2>
```
- Tanyakan ke user ID akun mana yang boleh dibaca (di lokal dipakai 1, 9, 12, 17 — ID produksi bisa berbeda).
- Token hanya tercetak sekali; user yang menyalinnya ke env aplikasi ini.
- Opsional `--expires=YYYY-MM-DD`.

> **Rencana ke depan:** token tidak perlu lagi dibuat lewat SSH/artisan setelah fitur **Pengaturan → Integrasi API** di e-report selesai (Super Admin buat/cabut token dari UI). Spesifikasi: `C:\laragon\www\E-REPOR_v0.1\E-REPORT-APP\PLAN (INI ADALAH IDE ATAU UPDATE)\PLAN_PENGATURAN_API_TOKEN_INTEGRASI.md`. Perintah artisan tetap dipertahankan sebagai jalur darurat.

Verifikasi dari luar:
```bash
# harus 401 (rute ada, tanpa token)
curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" https://api-ereport.interiorcustom.id/api/v1/integration/accounts
# dengan token harus 200 dan hanya menampilkan akun di allowlist
curl -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" https://api-ereport.interiorcustom.id/api/v1/integration/accounts
# metode tulis harus 405
curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" https://api-ereport.interiorcustom.id/api/v1/integration/consultations
# rute biasa dengan token integrasi harus 401
curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" https://api-ereport.interiorcustom.id/api/v1/consultations
```

### Langkah 3 — Arahkan aplikasi ini ke produksi
Di `.env` (lokal) atau environment variable Hostinger (`hosting_nodejs_replace-environment-variables` = full replace, sertakan semua variabel lain juga):
```
EREPORT_API_URL=https://api-ereport.interiorcustom.id
EREPORT_API_TOKEN=erpi_...
EREPORT_SYNC_INTERVAL_MINUTES=15
```
- Tanpa `/` di akhir URL.
- `0` = sinkron otomatis mati (hanya manual).
- Restart proses API (`npm run dev:api` lokal, atau restart app Node di Hostinger).

### Langkah 4 — Bersihkan data uji lokal (tanyakan user dulu)
Lead dari e-report lokal sudah ada di MySQL (`clients`/`leads` dengan `external_source='ereport'`), beserta mapping dan cursor lama. Sebelum sinkron produksi, pilih salah satu:
- **Direkomendasikan:** arsipkan data uji dan reset cursor, supaya tidak tercampur:
  ```sql
  UPDATE leads   SET deleted_at = UTC_TIMESTAMP(3) WHERE external_source = 'ereport' AND deleted_at IS NULL;
  UPDATE clients SET deleted_at = UTC_TIMESTAMP(3) WHERE external_source = 'ereport' AND deleted_at IS NULL;
  DELETE FROM system_settings WHERE `key` LIKE 'ereport.cursor.%';
  DELETE FROM ereport_account_mappings;
  DELETE FROM ereport_status_mappings;
  ```
  (Cek dulu nama kolom di `server/src/db/schema.ts` sebelum menjalankan; ini soft delete, bisa dikembalikan.)
- Di produksi Hostinger database masih baru, jadi langkah ini tidak perlu di sana.

### Langkah 5 — Mapping & sinkron dari UI
Login sebagai SUPER_ADMIN → **Pengaturan → Integrasi e-report**:
1. Status harus "Terhubung ke https://api-ereport.interiorcustom.id — Hanya baca".
2. Petakan tiap akun e-report ke brand (Nacira, Homeputra, Heya, Putra, Kurnia), aktifkan.
3. Petakan status e-report → tahap (PROSPECT_SURVEY, DESIGN_REVIEW, QUOTATION, CLOSING_DP, COMPLETED, LOST). ID status produksi bisa beda dengan lokal — cek `/integration/master-data/statuses`.
4. Klik **Sinkron sekarang**, lalu cek riwayat run.

## Kriteria selesai
- [ ] `GET /api/v1/integration/accounts` produksi → 401 tanpa token, 200 dengan token.
- [ ] POST dengan token integrasi → 405; `/api/v1/consultations` dengan token integrasi → 401.
- [ ] Panel Pengaturan menunjukkan terhubung ke URL produksi.
- [ ] Jumlah lead per akun di aplikasi = `meta.total` dari `/integration/consultations?account=<id>`.
- [ ] Sinkron kedua hanya memperbarui yang berubah (lihat angka `unchanged` di riwayat run).
- [ ] Akun di luar allowlist tidak ikut masuk.
- [ ] Lead e-report tampil dengan badge "e-report" dan field sumber terkunci.
- [ ] `npm run test:api` tetap lulus.
- [ ] Tidak ada token di git (`git grep erpi_` kosong).

## Troubleshooting
| Gejala | Penyebab kemungkinan |
|---|---|
| 404 di `/integration/*` | Kode belum ter-deploy / route cache: `php artisan route:clear` (atau `route:cache` ulang) di server |
| 401 dengan token | Token salah/dicabut/kedaluwarsa, atau migrasi `integration_clients` belum jalan di produksi |
| 429 | Throttle 60/menit; client sudah retry dengan backoff, kurangi frekuensi sinkron |
| Panel "Tidak terhubung" | `EREPORT_API_URL`/`EREPORT_API_TOKEN` kosong atau API belum di-restart setelah ubah env |
| Lead masuk ke brand salah | Mapping akun → brand keliru; perbaiki mapping lalu sinkron ulang |
| Tahap lead salah | Mapping status → tahap belum diisi untuk ID status produksi |
| Token bocor | `php artisan integration:client revoke <id>` lalu `create` baru, ganti env |

## File terkait di aplikasi ini
- `server/src/modules/integrations/ereport/client.ts` — HTTP client GET-only
- `server/src/modules/integrations/ereport/sync.ts` — logika sinkron
- `server/src/modules/integrations/ereport/routes.ts` — endpoint `/api/v1/integrations/ereport/*` (butuh `settings.manage`)
- `server/src/config.ts` — variabel env `EREPORT_*`
- `server/src/index.ts` — scheduler sinkron otomatis
- `src/components/modals/CloudSettingsModal.jsx` — panel UI
- `server/tests/import-ai-ereport.test.ts` — test integrasi
- `README.md` bagian "e-report integration (read-only)"
