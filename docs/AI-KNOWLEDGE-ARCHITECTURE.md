# ARSITEKTUR KNOWLEDGE BASE: MULTI-BRAND INTERIOR
**Versi:** 2026.2  
**File:** `/docs/AI-KNOWLEDGE-ARCHITECTURE.md`  
**Status:** PRODUCTION KNOWLEDGE BASE ARCHITECTURE  

---

## 1. STRUKTUR HIERARKI KNOWLEDGE BASE (3-TIER RESOLUTION)

Sistem menggunakan mesin resolusi hierarki berbobot (weighted resolution hierarchy) untuk memastikan informasi paling spesifik dan terkini selalu mengalahkan informasi umum:

```
┌───────────────────────────────────────────────────────────────┐
│ TIER 1: CAMPAIGN / FLASH SALE (Prioritas: 100)               │
│ Promo berbatas waktu, bonus aksesoris event, potongan volume. │
├───────────────────────────────────────────────────────────────┤
│ TIER 2: BRAND OVERRIDES (Prioritas: 50)                      │
│ Harga spesifik brand, alamat workshop, nomor CS, garansi.     │
├───────────────────────────────────────────────────────────────┤
│ TIER 3: GLOBAL CORE KNOWLEDGE (Prioritas: 10)                 │
│ Standar bahan dasar, termin pembayaran standar, SOP sales.   │
└───────────────────────────────────────────────────────────────┘
```

### Algoritma Resolusi (`KnowledgeService.resolveKnowledge`)
1. Filter item yang aktif (`isActive === true`) dan dalam rentang tanggal valid (`effectiveFrom` s/d `effectiveUntil`).
2. Saring item berdasarkan kesesuaian brand (`scope === 'GLOBAL'` atau `item.brandId === activeBrandId`).
3. Kelompokkan item berdasarkan kunci unik: `${item.category}_${item.subCategory || 'default'}`.
4. Item dengan bobot prioritas lebih tinggi otomatis menimpa item berbobot rendah pada kategori yang sama.
5. Susun teks terstruktur lengkap dengan metadata dan daftar sitasi resmi (`citations`).

---

## 2. PEMISAHAN WILAYAH: PL DK (DALAM KOTA) VS PL LK (LUAR KOTA)

Untuk menghindari kesalahan penawaran biaya logistik dan akomodasi tim pemasangan, Master Pricelist 2026 dipisahkan secara tegas:

| Parameter | PL DK (Dalam Kota) | PL LK (Luar Kota) |
|---|---|---|
| **Cakupan Wilayah** | Bandung Raya, Cimahi, Padalarang, Soreang, Lembang, Tasikmalaya, Ciamis, Garut. | Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi), Pantura, Cirebon, Jateng, Jatim, Bali. |
| **Kitchen Set Plywood HPL** | **Rp 2.500.000 - Rp 3.200.000 / m lari** | **Rp 2.800.000 - Rp 3.600.000 / m lari** |
| **Kitchen Set PVC Board Anti Air** | **Rp 4.000.000 - Rp 4.800.000 / m lari** | **Rp 4.400.000 - Rp 5.200.000 / m lari** |
| **Wardrobe / Lemari Pakaian** | **Rp 2.500.000 - Rp 3.200.000 / m lari** | **Rp 2.800.000 - Rp 3.600.000 / m lari** |
| **Backdrop TV & Wallpanel WPC** | **Rp 2.200.000 - Rp 2.800.000 / m2** | **Rp 2.500.000 - Rp 3.200.000 / m2** |
| **Biaya Survei & Desain 3D** | **100% GRATIS** tanpa syarat | **100% GRATIS** setelah konsultasi awal |
| **Ongkos Kirim & Instalasi** | Gratis / Termasuk dalam RAB | Tergantung minimum volume proyek |

### Logika Routing Wilayah (`KnowledgeRetriever.js`)
Ketika teks klien atau memori mendeteksi kata kunci wilayah:
- Keyword `Bandung`, `Tasik`, `Garut`, `Ciamis` -> Mengaktifkan filter `PL DK` dan menyisihkan item `luar_kota`.
- Keyword `Jakarta`, `Tangerang`, `Bekasi`, `Depok`, `Bogor` -> Mengaktifkan filter `PL LK` dan menyisihkan item `dalam_kota`.
- Jika lokasi klien belum terdeteksi, sistem menyajikan rentang dasar dan menanyakan kota tujuan secara santun.

---

## 3. STANDARISASI MATERIAL & SPESIFIKASI TEKNIS

Seluruh brand berada di bawah SOP material yang telah teruji:
1. **Badan Struktur (Body Cabinet):**
   - Multipleks / Plywood Meranti Grade A tebal 18mm padat (Bukan serbuk kayu MDF atau Particle Board yang mudah lapuk terkena lembab).
   - Finishing luar: High Pressure Laminate (HPL) merek standar Taco / Arborite / Carta.
   - Finishing dalam: Melaminto putih halus / HPL putih doff bersih.
2. **Area Basah (Sink / Bawah Bak Cuci Piring):**
   - Wajib ditawarkan kombinasi **PVC Board 100% Waterproof** anti rayap, anti lapuk, dan anti air seumur hidup.
3. **Hardware & Fitting:**
   - Engsel pintu sendok tipe Slow-Motion / Soft-Closing (anti bantingan).
   - Rel laci tipe Double Track Ball Bearing atau Undermount Tandem Box slow-motion.
   - Rak piring stainless steel anti karat atas dan bawah.

---

## 4. CONTEXT-AWARE PRUNING (PENGHEMATAN TOKEN PROMPT)

Sebelum dikirim ke prompt LLM, sistem melakukan evaluasi query intent:
- Jika calon klien hanya bertanya tentang **Wardrobe**, modul **Kitchen Set Sink** dan **Pekerjaan Bengkel Las** dipotong dari context window.
- Modul **SOP Sales** (jadwal survei gratis, garansi, skema termin) selalu disertakan sebagai jangkar konversi.
- Pengurangan token konteks ini menghasilkan penurunan biaya LLM hingga 65% dan mempercepat Time To First Token (TTFT) di bawah 800ms.
