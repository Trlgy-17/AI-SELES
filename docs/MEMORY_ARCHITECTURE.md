# Arsitektur Memori Klien (desain — fase 5)

Tiga konsep dipisah tegas:
- **Sesi user** — login (`sessions`, cookie httpOnly). Sudah dibangun.
- **Sesi percakapan AI** — pesan terbaru + ringkasan bergulir per client (`conversations`, `conversation_messages`, `conversation_summaries`).
- **Memori jangka panjang klien** — fakta terstruktur (`client_memory_facts`).

## Fakta memori
| Kolom | Isi |
|---|---|
| client_id, brand_id | pemilik |
| category | identity · project · dimension · preference · budget · sales (objection/concern/decision factor) · commitment · behavioral (preferensi kontak, jam) |
| key | mis. `location`, `project_type`, `kitchen_length_m`, `budget_max_idr`, `survey_date` |
| value | teks/angka ternormalisasi |
| source | chat · screenshot · admin · ereport · estimator |
| confidence | high/medium/low (dari aturan ekstraksi, bukan angka palsu) |
| state | VERIFIED · INFERRED · OUTDATED · CONFLICTING |
| created_by, created_at, updated_at, verified_at | jejak |

Tidak menyimpan label psikologis sensitif atau spekulasi.

## Aturan pembaruan
- Inferensi AI masuk sebagai **INFERRED**; admin mengonfirmasi → **VERIFIED**.
- Nilai baru yang bertentangan dengan fakta VERIFIED → fakta lama tetap, kandidat baru **CONFLICTING**; UI: "Budget: Rp30 jt → Rp20 jt [Terima baru] [Pertahankan]".
- Data dari e-report (nama/telepon/lokasi) dianggap VERIFIED dan terkunci.

## Kebutuhan per tahap (untuk "informasi yang masih dibutuhkan")
NEW/Prospek: nama, kebutuhan, lokasi · Kualifikasi: ukuran, target waktu, budget · Survei: alamat lengkap, jadwal, PIC, kondisi ruangan · Desain: gaya, fungsi, warna, material · Penawaran: lingkup, kuantitas, material, sensitivitas harga · Negosiasi: keberatan, alternatif, skema bayar · DP: nominal, tanggal, komitmen produksi · Produksi/Instalasi/Serah terima: status, jadwal, kendala, item tersisa · After sales: garansi, referral, repeat order.

## Konteks yang dikirim ke AI
Pesan terbaru (N terakhir) + ringkasan bergulir + fakta VERIFIED (dan INFERRED bertanda) + tahap & field yang hilang + knowledge relevan. Riwayat lama diringkas tanpa membuang fakta (fakta sudah tersimpan terstruktur).

Saat ini (fondasi) memori masih berupa form di Sales AI; tombol "Konsultasi di Sales AI" dari CRM sudah mengisi memori dari data lead (nama, lokasi, ukuran, proyek, nilai, catatan).
