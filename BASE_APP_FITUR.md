# Fitur Dasar Aplikasi — NACIRA STUDIO Sales AI CRM

Ringkasan fitur yang benar-benar tersedia di aplikasi (per redesign UI September 2026).

## 1. Sales AI
- Tempel chat calon klien atau unggah / paste (Ctrl+V) screenshot WhatsApp; gambar dioptimasi otomatis.
- Enam strategi respon: **Smart Auto** (AI menentukan strategi), **Harga**, **Survei**, **Keberatan**, **Follow-up**, **Closing**.
- Arahan cepat (follow-up survei weekend, arahkan survei, jelaskan harga, atasi budget, kunci DP, tanyakan ukuran).
- Hasil: balasan rekomendasi, tombol Salin, Buka WhatsApp, Buat ulang, dan umpan balik (Akurat / Perlu koreksi).
- Analisis konteks: intent, tahap, jenis proyek, lokasi, informasi yang masih dibutuhkan, dan langkah berikutnya.
- Memori klien: nama, lokasi, ukuran, budget; bisa diisi dari lead CRM; kunci cepat wilayah DK/LK.
- Provider AI: Google Gemini (default) atau API format OpenAI (OpenAI, OpenRouter, DeepSeek, Groq, Ollama). Kunci bisa disimpan di browser atau hanya untuk sesi.
- Shortcut: Ctrl+Enter untuk generate.

## 2. CRM Leads
- Lead terisolasi per brand; Super Admin dapat menampilkan semua brand.
- Tambah lead lewat panel samping (nama, WhatsApp, proyek, lokasi, estimasi nilai, tahap) dengan peringatan nomor duplikat.
- Metrik: total lead, nilai pipeline, jumlah tahap survei, nilai closing.
- Pencarian (nama, proyek, lokasi, status, nomor), filter status, urutan (terbaru, terlama, nilai, nama).
- Tampilan tabel (desktop), kartu (mobile), dan pipeline per tahap.
- Aksi per lead: WhatsApp, edit (termasuk lokasi, ukuran, catatan), konsultasi di Sales AI, hapus.
- Ekspor CSV.
- Tahap: Prospek / Survey, Design Review, Penawaran RAB, Closing / DP Masuk, Selesai / Terpasang, Batal.

## 3. Estimator (RAB)
- Kategori: Kitchen Set, Kamar Set, Living Room, Sipil & Bengkel Las.
- Wilayah harga: PL DK (Bandung & Tasik) dan PL LK (Jabodetabek, Jateng, Jatim), termasuk aturan gratis ongkir.
- Pilihan material, model/finishing, dimensi, countertop, backsplash, aksesoris, dan pekerjaan tambahan.
- Ringkasan biaya real-time (sticky di desktop, bottom sheet di mobile).
- Salin penawaran format WhatsApp, ekspor PDF penawaran, atau kirim ringkasan ke Sales AI.

## 4. Knowledge Base
- Kartu knowledge dari tiga layer: Global, Brand Override, Campaign.
- Pencarian, filter kategori, filter layer, dan tampilan baca artikel dengan daftar terkait.
- Uji retrieval AI: lihat potongan knowledge dan sitasi yang dipilih untuk sebuah pertanyaan.

## 5. Multi-brand, akun & sistem
- Lima brand dengan profil sendiri (kontak, wilayah layanan, nilai proyek minimum, gaya sapaan, tone sales).
- Ganti akun cepat (Super Admin dan admin marketing per brand).
- Super Admin dapat berpindah workspace brand dari top bar atau command palette.
- Sinkronisasi opsional ke Firebase Firestore; tanpa konfigurasi data disimpan di browser.
- Command palette (Ctrl/Cmd+K): navigasi, tambah lead, cari klien, ganti akun, ganti brand.
- Pengingat follow-up in-app selama tab terbuka.

## Batasan yang diketahui
- Modul Follow-up (`FollowUpModule.jsx`) ada di kode tetapi belum ditampilkan di aplikasi.
- "Konsultasi di Sales AI" dari CRM baru berpindah halaman; data lead belum dikirim otomatis ke memori klien.
