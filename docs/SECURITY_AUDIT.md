# Audit & Perbaikan Keamanan (2026-09-29)

| # | Temuan (sebelum) | Risiko | Status sekarang |
|---|---|---|---|
| S1 | API key Gemini asli di `constants.js` → ikut bundle & riwayat git | Penyalahgunaan kuota/biaya | **Diperbaiki di kode**: key dihapus dari frontend, dipindah ke env server. Diverifikasi tidak ada di `dist/`. **Tindakan wajib: rotasi key di Google AI Studio** (masih ada di riwayat git). |
| S2 | 5 user hard-code, password `password123` plain text; sesi SUPER_ADMIN otomatis | Siapa pun jadi super admin | Login server (argon2id), password acak saat seed, sesi di DB, gerbang login wajib. |
| S3 | Isolasi brand hanya filter frontend | Kebocoran data antar brand | Scope brand di setiap query server; akses ID brand lain → 404. Diuji (IDOR). |
| S4 | API key user tersimpan plain text di local/sessionStorage | Pencurian key via XSS/perangkat bersama | Kolom key dihapus; UI hanya memilih model dari allowlist server. |
| S5 | Tidak ada audit log | Perubahan tak terlacak | `audit_logs` untuk login (berhasil/gagal), CRUD lead, ganti tahap, ganti brand, impor, sinkron, pemetaan. PII diredaksi. |
| S6 | Firestore rules per user anonim, tanpa brand | Data tidak terkendali | Firestore tidak lagi dipakai aplikasi (hanya sumber impor lama). |
| S7 | Tidak ada rate limit | Brute force login, abuse AI | Login 5/menit per IP+identitas; AI 30/menit per user. |
| S8 | Tidak ada CSRF (belum ada sesi) | — | Mutasi wajib header `X-Requested-With: nacira` + cek Origin; cookie `SameSite=Lax`, `HttpOnly`, `Secure` di produksi. |
| S9 | Validasi input lemah | Data korup/injeksi | Zod di semua body/query; query via ORM (parameterized); LIKE di-escape. |
| S10 | Upload gambar ke AI tanpa batas tipe | Payload berbahaya/boros | MIME allowlist (png/jpeg/webp), base64 regex, batas ukuran; body limit 12 MB. |
| S11 | Log berisiko memuat PII/secret | Kebocoran | Logger meredaksi cookie/authorization; `ai_generations` tanpa teks prompt; audit meredaksi telepon/email. |
| S12 | Integrasi e-report (baru) | Aplikasi bisa mengubah data sumber | Token integrasi bukan User (tidak lolos `auth:sanctum`), rute GET-only + middleware 405, allowlist akun, client GET-only di sisi CRM. Diuji di kedua sisi. |

## Sisa pekerjaan keamanan
- Rotasi Gemini key (S1) dan token e-report lokal sebelum produksi (buat token baru di server produksi).
- Kebijakan password (panjang ≥10 sudah; tambahkan cek password bocor bila perlu), reset password oleh admin (belum ada UI).
- Header keamanan (CSP, HSTS) di web server produksi.
- Rate limit berbasis store bersama jika API dijalankan >1 instance.
