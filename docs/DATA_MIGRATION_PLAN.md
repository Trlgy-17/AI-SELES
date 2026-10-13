# Rencana Migrasi Data

## Sumber data lama
1. **localStorage tiap browser admin** — lead (`nacira_crm_leads_v2*`, `nacira_crm_leads_2026`), tugas (`nacira_followup_tasks_v2*`, `_2026`), tombstone, backup pra-migrasi.
2. **Firestore** (opsional, per user anonim) — `artifacts/{appId}/users/{uid}/crmLeads|followUpTasks`. Belum diimpor (fase berikutnya, via ekspor JSON → endpoint yang sama).
3. **e-report** — sumber lead berkelanjutan (sinkron read-only, bukan migrasi sekali jalan).

## Proses impor localStorage (sudah berjalan)
```
Browser: Pengaturan → Impor data lokal
  collectLegacyData(): baca key mentah + pulihkan brandId/location/dimensions/notes dari backup pra-migrasi
      ↓ POST /api/v1/migrations/legacy-import (butuh permission data.import)
Server: normalisasi → validasi → dedupe → petakan brand → insert per record (transaksi) → migration_runs
```
- **Normalize**: telepon via `normalizePhone` yang sama dengan frontend; uang dibulatkan ke rupiah integer; label status → kode tahap; `Batal` → `LOST` (alasan `other`).
- **Validate**: nama wajib; brand harus termasuk akses pengimpor.
- **Deduplicate**: legacy id per brand (idempoten — impor ulang tidak menggandakan), duplikat di dalam file, nama+telepon sama → `duplicates`; telepon sama tapi nama beda → diimpor dan ditandai `potential_duplicate_of`.
- **Map brand**: tanpa brand → brand aktif pengimpor (`brandDefaulted`).
- **Verify counts**: `total = imported + skipped + duplicates + invalid + failed` (diuji otomatis). Rincian tiap record yang tidak masuk ada di `migration_runs.report.issues`.
- Data lama di browser **tidak dihapus**; frontend mencatat `nacira_legacy_imported_at`.

## Urutan saat go-live
1. **Backup** database produksi (`mysqldump --single-transaction nacira_crm > backup.sql`) dan simpan ekspor localStorage (tombol impor membaca data yang sama).
2. `npm run db:migrate` lalu `npm run db:seed` (password acak dicetak sekali — bagikan lewat kanal aman, minta ganti setelah login).
3. Tiap admin login di browser yang biasa dipakai → Pengaturan → Impor data lokal → periksa laporan.
4. Super Admin: petakan akun e-report & status → Sinkron sekarang → cocokkan jumlah dengan e-report.
5. Smoke test (login, CRM, Sales AI, estimator) → aktifkan untuk tim.
6. Arsip: setelah 30 hari tanpa masalah, data localStorage boleh dibersihkan manual.

## Rollback
- Kode: kembali ke commit sebelum migrasi (frontend lama berjalan dari localStorage yang tidak disentuh).
- Database: restore dari backup langkah 1. Tidak ada operasi destruktif pada sumber data lama.

## Backup & restore produksi
- Hostinger menyediakan backup harian; tambahkan `mysqldump` terjadwal (cron) ke penyimpanan terpisah.
- **Uji restore** minimal sekali per bulan ke database staging (`mysql nacira_crm_restore < backup.sql` → jalankan `npm run test:api` terhadapnya). Backup yang belum pernah diuji restore tidak dianggap valid.
