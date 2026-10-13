# Audit Fitur — KEEP / IMPROVE / MERGE / REMOVE

| Fitur | Keputusan | Catatan |
|---|---|---|
| Sales AI (balasan WhatsApp) | IMPROVE | Kini lewat proxy server; nanti pipeline modular + next best action. |
| Enam mode strategi AI | MERGE (sebagian) | UI sudah Smart Auto sebagai default + 5 override ringkas; tidak ada lagi enam kartu besar. |
| Arahan cepat (quick directives) | KEEP | Teks disesuaikan agar tidak memicu sapaan "Ibu/Bapak". |
| Memori klien (form) | IMPROVE | Diisi otomatis dari lead CRM; target: fakta terstruktur + konflik. |
| CRM leads | IMPROVE | Pindah ke API/MySQL, duplikat di server, alasan batal, badge e-report, arsip (soft delete). |
| Follow-up module (tidak dirender) | MERGE (berikutnya) | Tugas sudah ada di API (`/tasks`); UI tugas masuk ke Customer 360/CRM di fase 6. File lama masih memakai Firebase — belum disentuh. |
| Estimator + rumus | KEEP | Tidak diubah; 191 acceptance test (termasuk matematika estimator) lulus. |
| Ekspor PDF RAB | KEEP | Tidak diubah. |
| Knowledge base 3-layer | IMPROVE | Sudah di-seed ke MySQL + FULLTEXT; UI/retriever masih localStorage (fase 8). |
| Multi-brand + brand switcher | IMPROVE | Kini sesi server + membership; super admin saja yang bisa pindah brand. |
| Command palette | KEEP | Label akun diperbarui. |
| Login cepat `password123` | REMOVE | Diganti login server & halaman akun (ganti password, keluar). |
| Input API key di browser | REMOVE | Key di server; UI jadi pemilih model. |
| Pengaturan Firebase (JSON config) | REMOVE | Diganti panel Pengaturan: integrasi e-report + impor data lokal. |
| Sinkron Firestore anonim | REMOVE (dari app) | Kode `firebase.js` hanya tersisa untuk modul follow-up lama yang tidak dirender. |
| `server.js` static server lama | REMOVE | Rusak (CommonJS di paket ESM) dan tidak dipakai. |
| `auth.js` (auth palsu) | REMOVE | Digantikan `/api/v1/auth/*`. |
| Integrasi e-report | ADD | Sinkron read-only terjadwal/manual per akun → brand. |
| Audit log, RBAC, sesi | ADD | Fondasi keamanan. |
