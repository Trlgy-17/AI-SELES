# Panduan Kesiapan Produksi — NACIRA STUDIO AI CRM

Panduan ini berisi instruksi komprehensif bagi Administrator dan Tim Pengembang untuk mengonfigurasi backend, aturan keamanan, dan integrasi kecerdasan buatan aplikasi **NACIRA STUDIO — Sales Intelligence & AI CRM**.

---

## 1. Konfigurasi Backend Firebase & Firestore

Aplikasi mendukung arsitektur *Hybrid / Local-First*. Data selalu disimpan di peramban secara lokal dan disinkronkan ke Cloud Firestore saat kredensial valid tersedia.

### Langkah Setup Firebase Console:
1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru (misal: `nacira-studio-crm`).
2. Masuk ke menu **Build -> Authentication**:
   - Tab **Sign-in method**: Aktifkan penyedia **Anonymous** (atau Email/Password).
3. Masuk ke menu **Build -> Firestore Database**:
   - Klik **Create database**, pilih lokasi server terdekat (`asia-southeast2` / Jakarta).
   - Mulai dalam mode terkunci (*production mode*).
4. Masuk ke **Project Settings -> General**:
   - Di bagian *Your apps*, tambahkan **Web app** (`</>`).
   - Salin objek konfigurasi `firebaseConfig`:
     ```json
     {
       "apiKey": "AIzaSy...",
       "authDomain": "nacira-studio-crm.firebaseapp.com",
       "projectId": "nacira-studio-crm",
       "storageBucket": "nacira-studio-crm.firebasestorage.app",
       "messagingSenderId": "...",
       "appId": "..."
     }
     ```
5. Masukkan konfigurasi ini ke aplikasi:
   - Klik menu **Pengaturan Cloud & Database** di sidebar aplikasi NACIRA STUDIO.
   - Tempel JSON konfigurasi atau simpan melalui variabel lingkungan hosting.

---

## 2. Pendaftaran Domain Otorisasi (Authorized Domains)

Jika aplikasi dijalankan di dalam Gemini Canvas, Google Cloud Workstations, atau domain kustom, domain tersebut harus didaftarkan di Firebase Auth agar tidak muncul error `auth/unauthorized-domain`:

1. Buka [Firebase Console](https://console.firebase.google.com/) -> Proyek Anda.
2. Masuk ke **Authentication -> Settings -> Authorized domains**.
3. Klik **Add domain**, lalu masukkan:
   - Domain produksi Anda (misal: `crm.nacirastudio.com`).
   - Domain preview Canvas (lihat petunjuk domain yang tertera secara otomatis pada modal Pengaturan Cloud di aplikasi).
   - `localhost` (untuk pengembangan lokal).

---

## 3. Deploy Aturan Keamanan (Firestore Security Rules)

Berkas `firestore.rules` dan `firebase.json` sudah tersedia di repositori ini. Aturan ini memastikan:
- Hanya pengguna terautentikasi yang dapat mengakses jalurnya sendiri (`/artifacts/{appId}/users/{userId}/*`).
- Tidak ada kebocoran data antar-pengguna (*zero cross-tenant leak*).
- Validasi tipe data dan skema ketat pada nama klien, nilai rupiah, dan status prospek.

### Cara Deploy via Terminal:
```bash
# 1. Pastikan Firebase CLI terpasang
npm install -g firebase-tools

# 2. Login ke akun Google Firebase Anda
firebase login

# 3. Hubungkan ke proyek Anda
firebase use --add

# 4. Deploy aturan keamanan ke Cloud Firestore
firebase deploy --only firestore:rules
```

---

## 4. Keamanan & Konfigurasi Google Gemini AI

Aplikasi menggunakan REST API Google Generative AI untuk menyusun balasan penjualan WhatsApp otomatis.

### Kebijakan Keamanan yang Diterapkan:
1. **Header-Based Authentication:** Kunci API dikirim melalui header HTTP `x-goog-api-key`, bukan melalui parameter URL query string (`?key=...`), sehingga mencegah perekaman key di web server access logs, browser history, atau proxy.
2. **Penyimpanan Sesi (Session / In-Memory):** Pengguna dapat memilih opsi penyimpanan kunci hanya untuk sesi kerja aktif (*Session Storage* / *Memory*), sehingga kunci otomatis hilang saat peramban ditutup.
3. **Model Selection:** Pengguna dapat memilih model Google Gemini (`gemini-2.5-flash`, `gemini-2.0-flash`, atau `gemini-1.5-flash`).
4. **Dukungan Enterprise Custom Proxy:**  
   Untuk lingkungan korporat yang melarang peramban memegang API Key langsung, sediakan endpoint proxy internal (misal: `https://api.nacirastudio.com/ai/generate`). Masukkan URL proxy pada pengaturan AI; aplikasi akan merutekan panggilan AI tanpa membutuhkan API Key di sisi klien peramban.

---

## 5. Ringkasan Fitur Integritas Data Klien

- **Last-Write-Wins (LWW):** Rekonsiliasi cloud vs lokal membandingkan timestamp ISO `updatedAt`. Modifikasi terbaru selalu dipertahankan.
- **Tombstone Deletion:** Penghapusan prospek atau jadwal follow-up menyertakan penanda penghapusan sehingga item tidak dibangkitkan kembali oleh sinkronisasi cloud berikutnya.
- **CSV Sanitization:** Ekspor CSV mematuhi standar RFC 4180 dan memitigasi *Formula Injection* dengan membungkus sel yang diawali tanda `=`, `+`, `-`, atau `@`.
- **Phone Normalization:** Nomor WhatsApp dinormalisasi ke standar internasional Indonesia (`628...`) untuk memastikan tautan `wa.me` langsung terhubung ke chat pelanggan.
