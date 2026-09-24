# SALES STRATEGY & INTELLIGENCE ENGINE: INTERIOR COPILOT
**Versi:** 2026.2  
**File:** `/docs/AI-SALES-ENGINE.md`  
**Status:** PRODUCTION SALES PLAYBOOK SPECIFICATION  

---

## 1. KLASIFIKASI INTELIJEN PERCAKAPAN

Interior Sales Copilot mengoperasikan sistem analisis percakapan multimodal yang mampu mendeteksi maksud klien, tahapan funnel, dan tingkat urgensi (lead temperature).

### 1.1 Daftar 26 Standar Intent Penjualan Interior (`SALES_INTENTS`)
1. `ASK_PRICE_KITCHEN` — Menanyakan harga kabinet dapur per meter lari.
2. `ASK_PRICE_WARDROBE` — Menanyakan harga lemari pakaian / walk-in closet.
3. `ASK_PRICE_LIVING` — Menanyakan harga backdrop TV, kisi-kisi partisi, meja kerja.
4. `ASK_PRICE_GENERAL` — Menanyakan harga umum interior per meter atau estimasi per unit.
5. `ASK_MATERIAL_MULTIPLEKS` — Menanyakan jenis plywood, ketebalan, merk HPL.
6. `ASK_MATERIAL_PVC` — Menanyakan kelebihan PVC board anti air di area basah/sink.
7. `ASK_MATERIAL_FINISHING` — Menanyakan perbedaan HPL, Cat Duco, Melamic, Taco Sheet.
8. `ASK_WORKSHOP_LOCATION` — Menanyakan alamat studio, workshop pabrikasi, atau jam buka.
9. `ASK_SERVICE_AREA` — Menanyakan apakah melayani luar kota (Jabodetabek/Jabar/Jateng).
10. `ASK_SURVEY_SCHEDULE` — Menanyakan jadwal luang tim survei ukur lokasi.
11. `ASK_DESIGN_3D` — Menanyakan biaya gambar 3D, revisi denah, spatial layout.
12. `ASK_PRODUCTION_LEADTIME` — Menanyakan berapa lama proses pembuatan di workshop.
13. `ASK_INSTALLATION_PROCESS` — Menanyakan berapa hari pemasangan di rumah.
14. `ASK_WARRANTY_TERMS` — Menanyakan masa garansi purna jual & cakupan perbaikan.
15. `ASK_PAYMENT_TERMS` — Menanyakan skema termin DP, progres, dan pelunasan.
16. `ASK_CIVIL_WORK` — Menanyakan pekerjaan sipil (kanopi, meja cor, bobok, keramik).
17. `PRICE_OBJECTION_EXPENSIVE` — Mengeluhkan harga terlalu mahal dibanding tukang lokal.
18. `PRICE_OBJECTION_COMPETITOR` — Membandingkan penawaran dengan vendor interior lain.
19. `BUDGET_CONSTRAINED` — Anggaran terbatas dan meminta opsi penyesuaian.
20. `FOLLOW_UP_WARM` — Merespon klien yang membaca penawaran tapi belum ada kabar.
21. `FOLLOW_UP_COLD` — Menyapa prospek lama yang sudah lama tidak aktif.
22. `GHOSTING_REENGAGE` — Menghidupkan kembali chat yang terhenti mendadak.
23. `CLOSING_READY_TO_DP` — Klien siap transfer DP dan meminta nomor rekening.
24. `CLOSING_SPK_REQUEST` — Meminta draf Surat Perintah Kerja (SPK) resmi.
25. `GREETING_NEW_LEAD` — Sapaan awal perkenalan dari iklan Facebook/Instagram/TikTok.
26. `UNKNOWN_INQUIRY` — Pesan di luar kategori umum interior.

---

## 2. TAHAPAN CORONG PENJUALAN (15 PIPELINE STAGES)

1. `AWARENESS` -> 2. `INITIAL_CONTACT` -> 3. `DISCOVERY` -> 4. `SPECIFICATION_REVIEW` -> 5. `ESTIMATION_REQUESTED` -> 6. `SURVEY_OFFERED` -> 7. `SURVEY_SCHEDULED` -> 8. `SURVEY_COMPLETED` -> 9. `3D_DESIGN_IN_PROGRESS` -> 10. `QUOTATION_REVIEW` -> 11. `OBJECTION_HANDLING` -> 12. `NEGOTIATION` -> 13. `COMMITTED_DP` -> 14. `IN_PRODUCTION` -> 15. `COMPLETED`.

---

## 3. SUHU PROSPEK (LEAD TEMPERATURE MATRIX)

| Suhu | Ciri Percakapan | Strategi Respon AI |
|---|---|---|
| **HOT PROSPECT** 🔥 | Sudah punya ukuran, menanyakan jadwal survei, bertanya termin pembayaran / DP, lokasi proyek jelas. | Kunci jadwal survei langsung atau berikan nomor rekening/draf SPK. Jangan berbelit-belit. |
| **WARM LEAD** ⚡ | Bertanya kisaran harga per meter, membandingkan bahan PVC vs Multiplex, mengeksplorasi portofolio. | Jawab harga transparan, edukasi value bahan padat 18mm, dan tawarkan survei & desain 3D gratis tanpa komitmen. |
| **COLD / GHOSTING** ❄️ | Hanya membaca (centang biru), sapaan singkat tanpa kelanjutan, keberatan harga tinggi. | Gunakan soft follow-up tanpa tekanan. Informasikan slot tim survei yang sedang melintas di area kotanya. |

---

## 4. SOP 6 RESPONSE MODES BERDASARKAN PLAYBOOK

1. **`SMART_REPLY`:** Analisis multimodal dinamis yang menyesuaikan langsung dengan pertanyaan terakhir klien.
2. **`PRICE_EXPLANATION`:** Transparansi harga per meter lari (PL DK vs PL LK), edukasi bahan Grade A, penegasan survei & desain 3D 100% gratis.
3. **`SURVEY_INVITATION`:** Menawarkan survei lokasi dengan membawa sampel fisik HPL & PVC. Menggunakan *Alternative Choice Closing* (Pilihan Hari Kerja vs Akhir Pekan).
4. **`OBJECTION_HANDLING`:** Menangani keluhan harga dengan membongkar perbedaan bahan (Multipleks 18mm kokoh vs serbuk kayu MDF murah yang lapuk kena air).
5. **`FOLLOW_UP`:** Sapaan ramah tanpa memaksa (No-Pressure Reassurance) dengan menyertakan nilai tambah atau referensi portofolio terbaru.
6. **`CLOSING`:** Rekapitulasi pesanan, penegasan termin aman (DP 50%, progres 40%, serah terima 10%), dan ajakan mengunci antrian pabrikasi workshop.

---

## 5. STANDAR GAYA PENULISAN PESAN WHATSAPP (SOP COPYWRITING)

- **Panjang Pesan Ideal:** 20 s/d 80 kata (1 hingga 4 kalimat pendek).
- **Struktur Paragraf:** Dipisahkan dengan baris kosong (`\n\n`) agar nyaman dibaca di layar smartphone.
- **Formatting WhatsApp:** Gunakan `*bold*` pada angka harga atau poin kunci (contoh: `*Rp 2,5jt - 3,2jt/m*`, `*100% GRATIS*`).
- **Satu Pesan Satu Tindakan (Single CTA):** Selalu akhiri pesan dengan 1 pertanyaan micro-commitment ringan yang mudah dijawab calon klien.
