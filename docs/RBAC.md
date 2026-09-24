# ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS SPECIFICATION
**Sistem:** MULTI-BRAND INTERIOR SALES INTELLIGENCE PLATFORM  
**Versi:** 3.0-SECURITY-RBAC  
**Status:** Matriks Izin Akses & Kebijakan Hak Pengguna

---

## 1. Definisi Peran (*User Roles*)

Sistem mendefinisikan 3 tingkatan peran pengguna dengan batas otoritas yang tegas:

```
┌─────────────────────────────────────────────────────────────┐
│                       1. SUPER_ADMIN                        │
│ Akses Penuh Lintas Brand: Brand Switcher, Master Knowledge, │
│ Analytics Global, User Management, Global Prompt Settings   │
├──────────────────────────────┬──────────────────────────────┤
│       2. BRAND_ADMIN         │      3. MARKETING_ADMIN      │
│ Otoritas Penuh di 1 Brand:   │ Staf Operasional di 1 Brand: │
│ Brand Profile, Override Harga│ AI Sales Copilot, Chat WA,   │
│ Kelola Tim Marketing Brand   │ CRM Leads Brand, Follow-Up   │
└──────────────────────────────┴──────────────────────────────┘
```

### A. `SUPER_ADMIN`
- **Tujuan:** Pemilik grup bisnis / direksi / technical lead.
- **Karakteristik:**
  - Memiliki fitur **Brand Switcher** di Header/Sidebar untuk berpindah konteks antar seluruh brand (`NACIRA STUDIO`, `HOMEPUTRA INTERIOR`, `HEYA INTERIOR`, `PUTRA INTERIOR`, `KURNIA INTERIOR`).
  - Mengelola Global Core Knowledge.
  - Menambah dan menonaktifkan brand.
  - Mengelola seluruh akun pengguna dan hak akses brand.
  - Memantau performa sales & analitik gabungan seluruh brand.

### B. `BRAND_ADMIN`
- **Tujuan:** Manajer operasional / manajer marketing pada satu brand tertentu.
- **Karakteristik:**
  - Terikat permanen pada 1 brand (`brand_id` tetap). Tidak memiliki Brand Switcher.
  - Dapat memperbarui profil brand (nomor kontak, alamat workshop, deskripsi, logo).
  - Dapat membuat Brand Override (penyesuaian harga khusus brand, promo campaign).
  - Dapat melihat seluruh client dan percakapan tim marketing pada brand tersebut.

### C. `MARKETING_ADMIN`
- **Tujuan:** Staf admin WhatsApp sales garis depan yang membalas chat calon klien.
- **Karakteristik:**
  - Terikat pada 1 brand.
  - Hanya dapat mengakses AI Sales Workspace, CRM Leads, dan Follow-Up brand miliknya.
  - **Dilarang keras melihat:** Leads, chat, analytics, atau konfigurasi rahasia milik brand lain.

---

## 2. Matriks Hak Akses (*Permission Matrix*)

| Kode Izin (*Permission*) | Penjelasan | SUPER_ADMIN | BRAND_ADMIN | MARKETING_ADMIN |
| :--- | :--- | :---: | :---: | :---: |
| `brand:create` | Membuat brand baru di sistem | ✅ | ❌ | ❌ |
| `brand:edit_all` | Mengedit konfigurasi seluruh brand | ✅ | ❌ | ❌ |
| `brand:edit_own` | Mengedit profil brand miliknya sendiri | ✅ | ✅ | ❌ |
| `brand:switch_workspace` | Mengganti active brand workspace di UI | ✅ | ❌ | ❌ |
| `user:create_admin` | Mendaftarkan akun admin baru | ✅ | ❌ | ❌ |
| `user:assign_brand` | Menetapkan pengguna ke suatu brand | ✅ | ❌ | ❌ |
| `knowledge:manage_global` | Menambah/mengedit Global Core Knowledge | ✅ | ❌ | ❌ |
| `knowledge:manage_override`| Mengatur override harga & campaign brand | ✅ | ✅ | ❌ |
| `knowledge:test_console` | Mengakses AI Playground & Testing Console | ✅ | ✅ | ❌ |
| `client:read_all` | Membaca database client seluruh brand | ✅ | ❌ | ❌ |
| `client:read_own_brand` | Membaca database client brand miliknya | ✅ | ✅ | ✅ |
| `client:write_own_brand`| Menambah/mengedit data client brand miliknya | ✅ | ✅ | ✅ |
| `ai:generate_reply` | Menggunakan AI WhatsApp Sales Copilot | ✅ | ✅ | ✅ |
| `analytics:view_global` | Melihat laporan performa global multi-brand| ✅ | ❌ | ❌ |
| `analytics:view_own_brand`| Melihat analitik performa brand sendiri | ✅ | ✅ | ❌ |
| `audit_log:view` | Memeriksa riwayat aktivitas sistem | ✅ | ❌ | ❌ |

---

## 3. Kebijakan Penegakan Hak Akses (*Enforcement Policy*)

1. **Aturan Query Scoping Otomatis:**
   Semua fungsi pembacaan data (`getCrmLeads`, `getFollowUpTasks`, `getConversations`) secara otomatis menerapkan klausul pemfilteran:
   ```javascript
   function getScopedQuery(session, resourceBrandId) {
       if (session.role === 'SUPER_ADMIN') {
           // Super Admin melihat brand yang sedang aktif dipilih di UI
           return resourceBrandId === session.activeBrandId;
       }
       // Marketing Admin hanya boleh melihat data brand yang tertanam di sesi login
       return resourceBrandId === session.user.brandId;
   }
   ```
2. **Pencegahan Akses IDOR:**
   Setiap permintaan spesifik per entitas (misal request detail klien `/clients/:id`) memeriksa:
   `if (client.brand_id !== session.activeBrandId) throw new ForbiddenError("403: Akses ditolak ke data brand lain");`
