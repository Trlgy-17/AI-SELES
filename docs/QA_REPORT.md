# QA Report — Fondasi Sales OS (2026-09-29)

## Otomatis
| Suite | Perintah | Hasil |
|---|---|---|
| API (Node test runner, DB `nacira_crm_test`) | `npm run test:api` | **20/20 lulus** |
| Acceptance lama (estimator, PDF, prompt, responsif) | `node scripts/run_acceptance_tests.mjs` | **191/191 lulus** |
| e-report integrasi (Laravel) | `php artisan test --filter=IntegrationApiTest` | **7/7 lulus** (29 assertion) |
| e-report seluruh suite (regresi) | `php artisan test` | **75/75 lulus** (603 assertion) |
| Build frontend | `npm run build` | Lulus |
| Build API | `npm run build:api` / `tsc --noEmit` | Lulus |

Cakupan test API: login benar/salah, password lama ditolak, rate limit login, endpoint butuh sesi, CSRF (header & origin), logout mencabut sesi, RBAC (marketing admin tidak bisa ganti brand; SALES tidak bisa arsip), lintas brand butuh izin, **IDOR: user brand B GET/PATCH/stage lead brand A → 404**, duplikat 409 + confirm, riwayat tahap + activity + audit, LOST wajib alasan, PATCH parsial, validasi uang/email, isolasi tugas, impor data lama (akuntansi record + sampel + idempoten), skema output AI, allowlist model, client e-report menolak non-GET tanpa request jaringan, sinkron e-report (akun tak dipetakan tidak diminta, field sumber terkunci, inkremental, update & arsip, catatan lokal dipertahankan).

## Manual (browser + curl, lokal)
- Tanpa sesi → layar login; password `password123` ditolak; login seed berhasil; cookie tidak terbaca JS (httpOnly).
- CRM: 4 lead e-report tampil dengan badge; buat lead → tersimpan di MySQL; nomor sama → peringatan server + "Tetap simpan"; edit lead e-report: nama/telepon/lokasi terkunci, catatan internal tersimpan; audit log mencatat login gagal/berhasil, create, update.
- Sales AI via `/api/v1/ai/generate`: balasan natural dengan harga DK benar; tercatat di `ai_generations` tanpa teks prompt; key tidak ada di bundle.
- Logout → `/auth/me` 401. Super Admin: panel Pengaturan (pemetaan akun & status e-report), Sinkron sekarang (10 diambil / 10 tetap), tab impor, ganti brand ke Heya → 6 lead.
- e-report live (lokal): `/integration/accounts` hanya 4 akun diizinkan, 10 dari 50 konsultasi terlihat, POST → 405, token integrasi di rute user → 401.
- Sinkron nyata: akun HOME PUTRA (4) → 4 lead, HEYA (6) → 6 lead; sinkron kedua 0 baru.

## Bug yang ditemukan & diperbaiki selama QA
1. Rate limit login memakai kunci IP saja (body belum diparse) → semua login berbagi kuota. Diperbaiki (`hook: preHandler`).
2. PATCH lead menimpa field yang tidak dikirim menjadi NULL (transform Zod). Diperbaiki + test.
3. Timestamp default MySQL mengikuti zona server (WIB) sementara aplikasi menulis UTC. Diperbaiki: koneksi di-pin `time_zone='+00:00'`. (Beberapa baris dev yang dibuat sebelum perbaikan tercatat dalam WIB.)
4. Proyek dari e-report duplikat ("Kitchenset — KITCHENSET"). Diperbaiki (dedupe tanpa beda huruf; berlaku saat data berubah).

## Belum diuji
- Deploy produksi Hostinger, restore backup, beban tinggi, beberapa instance API, browser Safari/iOS fisik.
