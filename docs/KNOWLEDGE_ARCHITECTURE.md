# KNOWLEDGE ARCHITECTURE & RETRIEVAL ENGINE SPECIFICATION
**Sistem:** MULTI-BRAND INTERIOR SALES INTELLIGENCE PLATFORM  
**Versi:** 3.0-KNOWLEDGE-ENGINE  
**Status:** Standar Manajemen Pengetahuan & Mekanisme RAG

---

## 1. Arsitektur Pengetahuan 3-Lapisan (3-Layer Knowledge Architecture)

Knowledge Base interior dirancang dalam 3 tingkatan hierarkis untuk memisahkan kebenaran teknis bersama dari fleksibilitas bisnis masing-masing brand:

```
┌─────────────────────────────────────────────────────────────┐
│                 LAYER 3: CAMPAIGN / PROMO                   │
│ Scope: Brand atau Global | Bersifat Sementara (Effective Date)│
│ Contoh: Promo September Berkah, Cashback Survey, Free Sink  │
├─────────────────────────────────────────────────────────────┤
│                 LAYER 2: BRAND OVERRIDE                     │
│ Scope: Khusus Brand Tertentu (Berdasarkan brand_id)         │
│ Contoh: Kurnia Interior Minimum Project 20jt, Garansi 1 Thn │
├─────────────────────────────────────────────────────────────┤
│                 LAYER 1: GLOBAL CORE KNOWLEDGE              │
│ Scope: Bersama (Digunakan seluruh brand secara default)     │
│ Master Price List 2026, SOP WhatsApp, Kamus Material       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Data Item Pengetahuan (`knowledge_items`)

Setiap unit pengetahuan disimpan dalam format chunk terstruktur dengan metadata:

| Field | Tipe | Penjelasan |
| :--- | :--- | :--- |
| `id` | String | Identifier unik chunk (misal `kn_kitchen_bdg_v2`) |
| `scope` | Enum | `GLOBAL`, `BRAND`, atau `CAMPAIGN` |
| `brand_id` | String / Null | NULL jika `GLOBAL`; ID brand jika `BRAND` atau `CAMPAIGN` |
| `category` | String | `KITCHEN_SET`, `WARDROBE`, `LIVING_ROOM`, `MATERIAL`, `SOP_SALES`, `WARRANTY`, `FAQ`, `SIPIL_BENGKEL` |
| `title` | String | Judul ringkas untuk preview & citation |
| `content` | Text | Isi pengetahuan teknis, angka harga, atau panduan SOP |
| `keywords` | Array/String | Kata kunci pencarian cepat (*keyword matching*) |
| `priority` | Integer | Bobot prioritas (Default Global = 10, Brand Override = 50, Campaign = 100) |
| `version` | String | Versi rilis knowledge (misal `2026.1`, `v1.2`) |
| `effective_from` | Date | Tanggal mulai berlaku (khusus campaign/promo) |
| `effective_until` | Date | Tanggal berakhir berlaku (otomatis kedaluwarsa) |
| `is_active` | Boolean | Status aktif/non-aktif |

---

## 3. Knowledge Resolution Engine (Logika Resolusi Konflik)

Ketika AI merespons pertanyaan klien, resolusi knowledge berjalan secara deterministik:
1. **Query Filtering:**
   Sistem mencari seluruh chunk aktif dengan filter:
   `is_active = TRUE AND (scope = 'GLOBAL' OR (brand_id = active_brand_id AND (effective_until IS NULL OR effective_until >= TODAY)))`
2. **Conflict Overriding:**
   Jika ditemukan chunk pada `category` yang sama antara `GLOBAL` dan `BRAND_OVERRIDE`, item dengan **`priority` lebih tinggi (Brand Override)** akan menggantikan nilai Global.
   - *Contoh Kasus:*
     - Global Kitchen Bandung: Multipleks HPL Rp 2,5jt - 3,2jt/m.
     - Brand Override Putra Interior: Multipleks HPL Rp 2,4jt - 3,0jt/m.
     - *Hasil Resolusi Putra Interior:* Menggunakan Rp 2,4jt - 3,0jt/m.
     - *Hasil Resolusi Heya Interior:* Tetap menggunakan Rp 2,5jt - 3,2jt/m (Global).
3. **Campaign Injection:**
   Jika terdapat Campaign aktif untuk brand tersebut (misal Promo Free Cooker Hood), informasi campaign disuntikkan sebagai nilai tambah promosi.

---

## 4. Mekanisme Retrieval (RAG Cerdas & Ringan)

Untuk menjaga performa sub-2 detik dan menghemat token LLM:
1. **Classifier Keyword & Intent:**
   Input percakapan klien dianalisis untuk menentukan kategori yang relevan:
   - Kata kunci: "dapur", "kitchen", "kitchen set", "sink", "kompor" → Ambil kategori `KITCHEN_SET` & `MATERIAL_WATERPROOF`.
   - Kata kunci: "lemari", "wardrobe", "baju", "dipan", "kamar" → Ambil kategori `WARDROBE` & `BEDROOM`.
   - Kata kunci: "tv", "backdrop", "ruang tamu", "partisi" → Ambil kategori `LIVING_ROOM`.
   - Kata kunci: "kanopi", "pagar", "las", "baja", "spandek" → Ambil kategori `SIPIL_BENGKEL`.
2. **Top-K Retrieval:**
   Hanya 2 hingga 4 chunk teratas (~150 - 300 token) yang disuntikkan ke dalam prompt AI, alih-alih mengirim seluruh ensiklopedia harga yang mencapai ribuan token.
3. **Fallback Graceful:**
   Jika kategori tidak dapat ditentukan secara spesifik (misal obrolan umum), sistem menyuntikkan overview ringkasan harga dan SOP konsultasi.

---

## 5. Sistem Sitasi Internal (*Internal Source Citation*)

Untuk kebutuhan audit dan verifikasi admin:
- Setiap balasan AI menyertakan referensi internal: `knowledgeSources: ["Pricelist Master 2026 > Kitchen Set Bandung (v2026.1)", "SOP Sales > Micro Commitment"]`.
- Referensi ini ditampilkan pada **Smart Context Panel** di layar admin internal.
- Teks yang dikirimkan ke WhatsApp klien **bersih dari sitasi teknis** sehingga tetap natural dan santun.

---

## 6. Konsol Pengujian Pengetahuan (*Knowledge Testing Console*)

Halaman khusus di bawah menu Admin / Super Admin untuk:
- Menguji query pertanyaan simulasi klien (misal: "Berapa biaya kitchen set 3 meter di Heya Interior?").
- Menampilkan visual:
  1. Active Brand Context yang terbaca.
  2. Daftar chunk knowledge yang terpilih oleh retrieval engine.
  3. Skor relevansi & prioritas resolusi.
  4. Preview draf balasan 3 alternatif yang dihasilkan.
  5. Token usage & latency counter.
