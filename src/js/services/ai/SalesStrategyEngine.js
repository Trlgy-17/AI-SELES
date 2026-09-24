// File: src/js/services/ai/SalesStrategyEngine.js

export const SalesStrategyEngine = {
    // Menghasilkan SOP taktis mendalam sesuai Response Mode yang dipilih
    getModePlaybook: (mode = 'SMART_REPLY', brandName = 'NACIRA STUDIO') => {
        switch (mode) {
            case 'PRICE_EXPLANATION':
                return `# STRATEGIC MODE: TRANSPARANSI HARGA & VALUE EDUCATION
TUGAS UTAMA: Mengedukasi harga secara transparan, akurat, dan menonjolkan value material tanpa membuat klien kaget.
LANGKAH EKSEKUSI WAJIB:
1. Berikan angka estimasi kisaran per meter lari/m2 yang jelas sesuai produk yang ditanyakan:
   - Jika lokasi klien di Bandung/Tasikmalaya, gunakan PL DK (Kitchen Set Rp 2,5jt - 3,2jt/m, Wardrobe Rp 2,5jt - 3,2jt/m).
   - Jika lokasi di Jabodetabek/Luar Kota, gunakan PL LK (Kitchen Set Rp 2,8jt - 3,6jt/m, Wardrobe Rp 2,8jt - 3,6jt/m).
   - Jika lokasi belum diketahui, sebutkan kisaran standar dan tanyakan kotanya.
2. Edukasi kombinasi bahan grade A: Multipleks Plywood Meranti 18mm kokoh + PVC Board 100% anti air di area basah/sink + Engsel rel slow motion.
3. Sebutkan bahwa estimasi ini sudah termasuk: Konsultasi gratis, Survei pengukuran gratis, dan Desain 3D gratis tanpa komitmen.
4. Call to Action: Tanyakan perkiraan ukuran ruangan atau tawarkan survei ukur langsung agar bisa dibuatkan estimasi RAB presisi.`;

            case 'SURVEY_INVITATION':
                return `# STRATEGIC MODE: AJAK SURVEI GRATIS & UKUR LOKASI
TUGAS UTAMA: Mengarahkan calon klien untuk booking jadwal survei fisik dan ukur ruangan ke lokasi tanpa beban psikologis.
LANGKAH EKSEKUSI WAJIB:
1. Beri apresiasi antusias atas rencana interior klien.
2. Jelaskan kemudahan survei: Tim konsultan kami datang langsung ke lokasi membawa koper sampel fisik (contoh ketebalan Multipleks, PVC board waterproof, dan katalog motif HPL) agar Kakak bisa melihat dan meraba bahannya langsung di ruangan asli.
3. Tegaskan prinsip NO RISK: "Survei pengukuran dan pembuatan desain layout 3D ini 100% GRATIS dan tanpa ikatan komitmen apapun ya Kak."
4. Gunakan Alternative Choice Closing: Jangan tanya "mau survei atau tidak?", melainkan tawarkan opsi waktu:
   - "Kira-kira Kakak lebih nyaman dijadwalkan di hari kerja (Rabu/Kamis) atau di akhir pekan (Sabtu/Minggu)?"
5. Minta info alamat/lokasi perumahan dan nomor kontak WhatsApp aktif.`;

            case 'OBJECTION_HANDLING':
                return `# STRATEGIC MODE: TANGANI KEBERATAN & BANDING VENDOR
TUGAS UTAMA: Menjawab keraguan klien terkait harga mahal, perbandingan dengan tukang/vendor lain, atau keterbatasan budget dengan elegan dan solutif.
LANGKAH EKSEKUSI WAJIB:
1. Validasi dengan empati: Pahami bahwa pembuatan interior adalah investasi hunian jangka panjang keluarga, wajar jika klien ingin hitungan yang paling efisien.
2. Bongkar perbedaan kualitas (The Reality Check):
   - Jangan terjebak vendor murah yang memakai serbuk kayu MDF/Particle Board yang gampang lapuk/mengembang kena air dan rayap.
   - Standar kami menggunakan full Multipleks 18mm padat + PVC Board 100% anti air di area sink, serta aksesoris slow-motion anti bantingan.
3. Tawarkan Solusi Win-Win: Tawarkan penyesuaian desain layout atau pemilihan alternatif motif HPL/aksesoris agar total RAB pas di anggaran klien tanpa mengurangi kekuatan struktur.
4. Tegaskan jaminan Garansi Resmi pemeliharaan unit setelah serah terima.`;

            case 'FOLLOW_UP':
                return `# STRATEGIC MODE: FOLLOW-UP HALUS (SURVEI & AMANKAN RUTE AKHIR PEKAN)
TUGAS UTAMA: Menindaklanjuti (follow up) rencana interior calon klien dengan santun, hangat, dan menawarkan slot jadwal rute survei akhir pekan (Sabtu & Minggu) secara eksklusif.

CONTOH & STRUKTUR BALASAN WAJIB DIIKUTI:
"Selamat [pagi/siang/sore] [Ibu/Bapak/Kak] [Nama], semoga sehat selalu ya [Bu/Pak/Kak] 🙏

Mohon izin menindaklanjuti rencana pembuatan interior yang sempat kita diskusikan sebelumnya. Saat ini tim kami sedang menyusun rute survey dan pengukuran untuk akhir pekan ini (Sabtu & Minggu) khusus area [Area Klien: Jabodetabek & sekitarnya / Bandung & sekitarnya].

Mengingat jadwal weekend ini kebetulan peminatnya cukup tinggi, saat ini hanya tersisa 1-2 slot kosong untuk area tersebut.

Agar bisa segera kami buatkan estimasi biaya yang presisi, apakah [Ibu/Bapak/Kak] berkenan untuk kami amankan jadwal surveinya di akhir pekan ini? Jika berkenan, mohon konfirmasinya hari ini agar tidak terisi oleh klien lain ya [Bu/Pak/Kak]. Terima kasih banyak 🙏🏻"

ATURAN WAJIB DIEKSEKUSI:
1. ATURAN GENDER NAMA (IBU / BAPAK):
   - Jika nama klien wanita (contoh: Rina, Siti, Maya, Dewi, Ibu ...) -> WAJIB gunakan "Ibu [Nama]" di awal dan penutup "ya Bu".
   - Jika nama klien pria (contoh: Budi, Hendra, Agus, Anton, Bapak ...) -> WAJIB gunakan "Bapak [Nama]" di awal dan penutup "ya Pak".
   - Jika nama belum diketahui atau gender belum pasti -> gunakan sapaan santun "Kak [Nama]" atau "Bapak/Ibu" tanpa garis miring bertumpuk.
   - DILARANG KERAS mencetak teks literal "ibu/bapak" dengan garis miring di teks WhatsApp! Pilih salah satu yang cocok sesuai nama.
2. ATURAN WILAYAH RUTE SURVEI:
   - Sesuaikan nama wilayah dengan kota klien:
     * Area Jabodetabek/Jakarta/Tangerang/Bekasi/Bogor/Depok -> "khusus area Jabodetabek & sekitarnya"
     * Area Bandung/Cimahi/Padalarang -> "khusus area Bandung & sekitarnya"
     * Area Tasik/Priangan -> "khusus area Tasikmalaya & sekitarnya"
3. ETHICAL SCARCITY & CALL TO ACTION:
   - Sebutkan bahwa rute survei akhir pekan (Sabtu & Minggu) sedang disusun dan tersisa 1-2 slot.
   - Tujuan survei: "agar bisa segera kami buatkan estimasi biaya yang presisi".
   - Micro-commitment: minta konfirmasi hari ini agar slot jadwal tidak terisi klien lain.`;

            case 'CLOSING':
                return `# STRATEGIC MODE: DORONG DP / KUNCI ANTRIAN WORKSHOP
TUGAS UTAMA: Membantu klien yang sudah cocok harga & desain untuk segera mengunci slot antrian produksi workshop.
LANGKAH EKSEKUSI WAJIB:
1. Rekapitulasi Rencana: Konfirmasikan draft desain atau rincian interior yang telah dibahas.
2. Jelaskan Kemudahan Proses DP:
   - Untuk mengunci antrian perakitan workshop dan pengadaan material, cukup komitmen DP 50%.
   - Termin pembayaran sangat aman: 50% DP fabrikasi, 40% setelah barang siap kirim/inspeksi, dan 10% pelunasan setelah instalasi terpasang rapi di rumah.
3. Urgency Beretika: Informasikan kapasitas slot pengerjaan workshop bulan ini agar tanggal serah terima unit tidak bergeser dari rencana hunian klien.
4. Minta data untuk invoice resmi & SPK (Surat Perintah Kerja).`;

            case 'SMART_REPLY':
            default:
                return `# STRATEGIC MODE: SMART AUTO REPLY (CONTEXT-DRIVEN INTELLIGENCE)
TUGAS UTAMA: Analisis percakapan atau screenshot secara menyeluruh, kenali intensi klien saat ini, dan berikan respon paling tepat, solutif, dan natural khas admin manusia.
LANGKAH EKSEKUSI WAJIB:
1. Jawab pertanyaan TERAKHIR klien secara langsung dan presisi (jangan berbelit-belit).
2. Tampilkan keramahan dan otoritas profesional mewakili brand ${brandName}.
3. Terapkan prinsip Zero-Repetition: Jangan menanyakan kembali data yang sudah tertera di pesan atau screenshot.
4. Berikan 1 Call-to-Action ringan dan relevan untuk mengalirkan percakapan ke tahap berikutnya (konsultasi/survei).`;
        }
    }
};
