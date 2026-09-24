# TARGET ARCHITECTURE SPECIFICATION
**Sistem:** MULTI-BRAND INTERIOR SALES INTELLIGENCE PLATFORM  
**Versi Arsitektur:** 3.0-ENTERPRISE  
**Status:** Blueprint Desain & Standar Implementasi

---

## 1. Arsitektur Berlapis (Layered Architecture Blueprint)

Sistem dirancang dengan pola modular berlapis untuk menjamin keamanan multi-tenant, skalabilitas brand, dan kecepatan respons AI:

```
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│   Tailwind CSS Dark Luxury + React 18 Modular Views    │
│  [Dynamic Header] [Workspace Copilot] [CRM] [FollowUp] │
│  [Smart Context Panel] [Command Palette CTRL+K]        │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              AUTHENTICATION & RBAC LAYER               │
│  Authenticated Session: User ID, Role, Active Brand ID  │
│  Super Admin: All Brands | Marketing Admin: Single Brand│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│             KNOWLEDGE RESOLUTION ENGINE                │
│             1. System Safety & Guardrails              │
│                          ↓                             │
│             2. Active Brand Config                     │
│                          ↓                             │
│             3. Brand Override Knowledge                │
│                          ↓                             │
│             4. Active Campaign / Promo                 │
│                          ↓                             │
│             5. Global Shared Core Knowledge            │
│                          ↓                             │
│             6. Client Profile & Memory                 │
│                          ↓                             │
│             7. Conversation Context History            │
│                          ↓                             │
│             8. Untrusted Client Message                │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              AI SALES COPILOT ENGINE                   │
│   • Intent & Stage Classifier                          │
│   • 3 Alternative Generator: Recommended, Soft, Direct │
│   • Internal Smart Context & Next Best Action          │
│   • Anti-Hallucination & Zero-Invent Verification      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│            DATA ISOLATION & STORAGE LAYER              │
│   Scoped Queries: WHERE brand_id = session.brand_id    │
│   • Brands & Users Database                            │
│   • Scoped Clients, Leads, Conversations & Messages    │
│   • Structured Client Memory Store                     │
│   • Audit Logging Service                              │
└────────────────────────────────────────────────────────┘
```

---

## 2. Shared Core Knowledge vs Brand Context

### A. Shared Core Knowledge (Warisan Nacira):
- **Prinsip Utama:** Tidak ada copy-paste 5 database knowledge terpisah.
- **Isi Core:**
  - SOP WhatsApp Inbound Sales & Lead Qualification
  - Master Material Interior (Multipleks Plywood 18mm, Blockboard, PVC Waterproof, Alumunium & ACP, Finishing HPL & Duco)
  - Master Price List 2026 (Area Bandung & Jabodetabek)
  - Term of Payment (Termin 50% - 40% - Pelunasan)
  - Garansi Resmi Pemeliharaan 6 Bulan
  - Prosedur Survei Lokasi & Desain 3D Gratis
  - Kamus Istilah Interior & Hardware (Engsel slow-motion, rel double track, hidrolik)
  - Objection Handling Matrix (Kemahalan, bandingkan vendor, minta diskon, belum siap budget)

### B. Brand Context (Identitas Komunikasi Dinamis):
Setiap brand memiliki identitas tersendiri yang diinjeksikan secara dinamis tanpa mengubah Core Knowledge:
1. **NACIRA STUDIO:**
   - Tagline: Architectural Interior Design & Build — Sejak 2018
   - Admin Default: Ary | WhatsApp: +62 853-8506-9717 | Website: nacirastudio.com
   - Tone: Elegan, arsitektural, presisi, konsultatif premium.
2. **HOMEPUTRA INTERIOR:**
   - Tagline: Modern Living & Custom Interior Specialist
   - Tone: Hangat, solutif, ramah keluarga, fokus kenyamanan hunian.
3. **HEYA INTERIOR:**
   - Tagline: Aesthetic Japandi & Scandinavian Interior Design
   - Tone: Estetis, simpel, santai, trendi, personal anak muda/milenial.
4. **PUTRA INTERIOR:**
   - Tagline: Bengkel Fabrikasi Interior Presisi & Berkualitas
   - Tone: Praktis, lugas, mengedepankan ketahanan material & kecepatan workshop.
5. **KURNIA INTERIOR:**
   - Tagline: Desain Interior Eksklusif & Pengerjaan Terpercaya
   - Tone: Santun, terpercaya, detail teknis lengkap, dedikasi layanan purna jual.

---

## 3. Knowledge Resolution Engine (Aturan Precedence)

Ketika AI menyusun balasan untuk klien, knowledge dieksekusi dengan urutan hierarki mutlak:
1. **Safety Constraints (P0):** Anti-halusinasi, perlindungan data kredensial, proteksi prompt injection.
2. **Active Brand Config (P1):** Nama brand, nomor WhatsApp resmi, alamat kantor/workshop, persona sales.
3. **Brand Override (P2):** Jika brand tertentu memiliki penyesuaian khusus (misal Kurnia Interior menetapkan minimum order atau tarif khusus luar kota), override ini **menggugurkan** nilai global.
4. **Active Campaign / Promo (P3):** Diskon musiman, promo cashback, atau gift voucher yang sedang aktif untuk brand tersebut.
5. **Global Shared Knowledge (P4):** Pricelist master 2026, spesifikasi material teknis, dan SOP sales interior.
6. **Client Context & Memory (P5):** Data historis klien (lokasi, dimensi, budget yang sudah diketahui agar tidak ditanyakan ulang).
7. **Conversation History (P6):** 3-5 percakapan terakhir dalam sesi chat.
8. **Client Message (P7):** Pesan teks atau screenshot terkini yang perlu dibalas.

---

## 4. Keamanan & Tenant Isolation Mutlak

1. **Prinsip "Never Trust Frontend":**
   Frontend tidak pernah diperbolehkan mengirimkan parameter mentah seperti `{ "brandName": "HOMEPUTRA INTERIOR" }` untuk diproses backend. Seluruh penentuan brandId dilakukan via **Authenticated Session**.
2. **Data Scoping:**
   Setiap mutasi dan pembacaan data (`clients`, `conversations`, `messages`, `followups`) **wajib menyertakan filter `brand_id = session.user.brand_id`**.
3. **Super Admin Workspace Switching:**
   Hanya akun dengan role `SUPER_ADMIN` yang memiliki hak beralih workspace brand. Ketika Super Admin berpindah brand, seluruh state memory dan client context di-flush untuk mencegah kebocoran data (*zero data leak*).
