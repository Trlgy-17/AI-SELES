# DATABASE SCHEMA & MIGRATION SPECIFICATION
**Sistem:** MULTI-BRAND INTERIOR SALES INTELLIGENCE PLATFORM  
**Model Database:** Relational / Document Multi-Tenant Hybrid (Indexed)  
**Status:** Skema Standar & Aturan Migrasi

---

## 1. Skema Entitas Inti (Core Schema)

### A. Tabel `brands`
Menyimpan profil identitas resmi setiap brand interior.
```sql
CREATE TABLE brands (
    id VARCHAR(64) PRIMARY KEY,              -- contoh: 'brand_nacira', 'brand_homeputra'
    slug VARCHAR(64) UNIQUE NOT NULL,        -- 'nacira-studio', 'homeputra-interior'
    brand_name VARCHAR(128) NOT NULL,        -- 'HOMEPUTRA INTERIOR'
    display_name VARCHAR(128) NOT NULL,      -- 'Homeputra Interior & Custom Furniture'
    logo_badge_url TEXT,                     -- Path logo icon kecil
    logo_full_url TEXT,                      -- Path logo teks horizontal
    short_description TEXT,                  -- 'Spesialis Interior Minimalis & Hunian Modern'
    company_description TEXT,
    whatsapp VARCHAR(32) NOT NULL,           -- Format: '+628...'
    email VARCHAR(128),
    website VARCHAR(128),
    instagram VARCHAR(64),
    address TEXT,
    service_area TEXT,                       -- 'Bandung, Jabodetabek, dan sekitarnya'
    min_project_value VARCHAR(64),           -- 'Rp 15.000.000'
    greeting_style VARCHAR(64) DEFAULT 'Kak',-- 'Kak', 'Bapak/Ibu'
    closing_signature TEXT,                  -- Salam penutup WhatsApp khas brand
    sales_tone VARCHAR(64) DEFAULT 'warm',   -- 'warm', 'luxury', 'casual', 'technical'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_active ON brands(is_active);
```

### B. Tabel `users` & `roles`
Mendukung RBAC (*Role-Based Access Control*) dan penetapan brand.
```sql
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,              -- 'usr_admin_ary', 'usr_homeputra_1'
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32),
    avatar_url TEXT,
    role VARCHAR(32) NOT NULL,               -- 'SUPER_ADMIN', 'BRAND_ADMIN', 'MARKETING_ADMIN'
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_brands (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id VARCHAR(64) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, brand_id)
);
CREATE INDEX idx_user_brands_user ON user_brands(user_id);
CREATE INDEX idx_user_brands_brand ON user_brands(brand_id);
```

### C. Tabel `clients` (Scoped per `brand_id`)
Penyimpanan data prospek dengan isolasi tenant mutlak.
```sql
CREATE TABLE clients (
    id VARCHAR(64) PRIMARY KEY,              -- 'cli_982341...'
    brand_id VARCHAR(64) NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    assigned_user_id VARCHAR(64) REFERENCES users(id),
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,              -- Ter-normalisasi (E.164: +628...)
    city VARCHAR(64),
    district VARCHAR(64),
    project_type VARCHAR(64),                -- 'Kitchen Set', 'Wardrobe', 'Interior 2 BR', dll
    budget_range VARCHAR(64),                -- 'Rp 20jt - 35jt'
    status VARCHAR(64) NOT NULL,             -- 'NEW_LEAD', 'CONSULTATION', 'SURVEY_READY', 'CLOSING', dll
    temperature VARCHAR(16) DEFAULT 'WARM',  -- 'HOT', 'WARM', 'COLD'
    source VARCHAR(64) DEFAULT 'WhatsApp Inbound',
    notes TEXT,
    hold_reason VARCHAR(64),                 -- 'Belum serah terima kunci', 'Bandingkan vendor', dll
    last_contact TIMESTAMP,
    next_followup_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clients_brand_status ON clients(brand_id, status);
CREATE INDEX idx_clients_brand_phone ON clients(brand_id, phone);
CREATE INDEX idx_clients_next_followup ON clients(brand_id, next_followup_date);
```

### D. Tabel `client_memories` (Long-Term AI Memory)
Menyimpan preferensi terstruktur agar AI tidak mengulang pertanyaan.
```sql
CREATE TABLE client_memories (
    id VARCHAR(64) PRIMARY KEY,
    client_id VARCHAR(64) UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    brand_id VARCHAR(64) NOT NULL REFERENCES brands(id),
    room_dimensions TEXT,                    -- contoh: 'Panjang 3.2m x 2.1m (Letter L)'
    material_preferences TEXT,               -- 'Multipleks HPL abu semen, PVC bawah wastafel'
    style_preference TEXT,                   -- 'Minimalis Modern, tanpa handle (push-to-open)'
    budget_max NUMERIC(15,2),
    timeline_expectation VARCHAR(64),        -- 'Pindah rumah awal November'
    known_objections TEXT,                   -- 'Sempat khawatir pengerjaan telat'
    key_requirements TEXT,                   -- 'Butuh kompor tanam 2 tungku + oven built-in'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_client_memories_client ON client_memories(client_id);
```

### E. Tabel `conversations` & `messages`
Riwayat interaksi chat WhatsApp klien yang terasosiasi per client.
```sql
CREATE TABLE conversations (
    id VARCHAR(64) PRIMARY KEY,
    brand_id VARCHAR(64) NOT NULL REFERENCES brands(id),
    client_id VARCHAR(64) REFERENCES clients(id) ON DELETE SET NULL,
    channel VARCHAR(32) DEFAULT 'whatsapp',
    title VARCHAR(128),
    current_intent VARCHAR(64),
    current_stage VARCHAR(64),
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_conversations_brand ON conversations(brand_id);
CREATE INDEX idx_conversations_client ON conversations(client_id);

CREATE TABLE messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(16) NOT NULL,        -- 'CLIENT', 'ADMIN', 'AI_DRAFT'
    content TEXT NOT NULL,
    screenshot_url TEXT,
    ai_metadata JSON,                        -- { intent, stage, temperature, principlesUsed, explanation }
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
```

### F. Tabel `followup_tasks`
Tugas tindak lanjut otomatis dan manual.
```sql
CREATE TABLE followup_tasks (
    id VARCHAR(64) PRIMARY KEY,
    brand_id VARCHAR(64) NOT NULL REFERENCES brands(id),
    client_id VARCHAR(64) REFERENCES clients(id) ON DELETE CASCADE,
    assigned_user_id VARCHAR(64) REFERENCES users(id),
    task_title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(16) DEFAULT 'Normal',   -- 'High', 'Normal', 'Low'
    status VARCHAR(32) DEFAULT 'Belum',      -- 'Belum', 'Selesai', 'Dibatalkan'
    followup_stage VARCHAR(16),              -- 'FU1_D1', 'FU2_D3', 'FINAL_D7', 'D14', 'D30'
    suggested_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_followup_brand_due ON followup_tasks(brand_id, due_date, status);
```

### G. Tabel `knowledge_items` (3-Layered Knowledge Engine)
```sql
CREATE TABLE knowledge_items (
    id VARCHAR(64) PRIMARY KEY,
    scope VARCHAR(16) NOT NULL,              -- 'GLOBAL', 'BRAND', 'CAMPAIGN'
    brand_id VARCHAR(64) REFERENCES brands(id), -- NULL jika GLOBAL
    category VARCHAR(64) NOT NULL,           -- 'PRICE_LIST', 'MATERIAL', 'SOP_SALES', 'PROMO', 'WARRANTY'
    title VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT,                           -- 'kitchen set, multipleks, duco, per meter, harga'
    version VARCHAR(16) DEFAULT '1.0',
    priority INT DEFAULT 10,                 -- Nilai lebih tinggi mengalahkan nilai lebih rendah
    effective_from DATE,
    effective_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_knowledge_scope_brand ON knowledge_items(scope, brand_id, category);
CREATE INDEX idx_knowledge_active ON knowledge_items(is_active);
```

### H. Tabel `audit_logs`
```sql
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    brand_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,             -- 'GENERATE_AI_REPLY', 'CREATE_LEAD', 'UPDATE_PRICE', 'SWITCH_BRAND'
    resource_type VARCHAR(64),
    resource_id VARCHAR(64),
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_brand_created ON audit_logs(brand_id, created_at);
```

---

## 2. Strategi Migrasi Data Aman (Non-Destructive Migration)

1. **Inisialisasi Brand Resmi Pertama:**
   - Masukkan record `brand_nacira` ('NACIRA STUDIO') ke tabel `brands`.
   - Masukkan 4 brand baru: `brand_homeputra`, `brand_heya`, `brand_putra`, `brand_kurnia`.
2. **Migrasi Data Eksisting:**
   - Semua data leads (`nacira_crm_leads_*`) dan follow-up tasks (`nacira_followup_tasks_*`) yang sudah ada di localStorage/Firestore secara otomatis di-tag dengan `brand_id = 'brand_nacira'`.
   - Backup snapshot dibuat otomatis ke key `backup_v2_pre_multibrand_*` sebelum migrasi diterapkan.
3. **Migrasi Knowledge Eksisting:**
   - Seluruh data pricelist, SOP WhatsApp, dan spesifikasi material Nacira dipindahkan sebagai `scope = 'GLOBAL'`, sehingga langsung dapat dinikmati oleh ke-5 brand secara bersamaan.
   - Tidak ada data yang dihapus (*Zero Data Loss*).
