# Arsitektur Target

> Menggantikan `TARGET_ARCHITECTURE.md` (lama) untuk arah backend.

```
Browser (React + Vite, JS)
   │  cookie httpOnly nacira_sid · header X-Requested-With
   ▼
/api/v1  ── Fastify (Node + TypeScript) — modular monolith
   ├─ plugins: auth (sesi DB), CSRF, rate limit, error handler, redaksi log
   ├─ modules: auth · crm (clients/leads) · tasks · meta (knowledge, audit, dashboard) · ai · migrations · integrations/ereport
   ├─ validasi Zod di setiap body/query, RBAC permission guard, brand scope guard
   ├─ Drizzle ORM ──► MySQL 8 (single source of truth)
   ├─ AI transport ──► Gemini / OpenAI-compatible (key hanya di server)
   └─ e-report client (GET-only) ──► API e-report /api/v1/integration/* (token read-only)
```

## Prinsip
- **Data sebagai source of truth**: bisnis data hanya di MySQL. localStorage tinggal untuk preferensi UI (sidebar, model AI pilihan).
- **Keamanan di server**: isolasi brand, izin, dan validasi dilakukan backend; filter frontend hanya kenyamanan.
- **Modular monolith**: satu proses, satu database, transaksi lokal. Tanpa microservice, Redis, queue, atau vector DB sampai ada kebutuhan terbukti.
- **AI sebagai lapisan intelijen**: prompt hanya mengatur perilaku; aturan bisnis (harga, SOP) berasal dari knowledge/config.
- **Manusia memegang keputusan**: AI menyarankan; perubahan tahap, penghapusan, pengiriman WhatsApp tetap aksi user.

## Deployment (Hostinger Node + MySQL)
- Build: `npm run build` (frontend → `dist/`) dan `npm run build:api` (→ `dist-server/`).
- Jalankan API: `node dist-server/server/src/index.js` dengan env dari panel Hostinger (bukan file `.env` di repo). API melayani `/api/*`; frontend statis disajikan web server/Node di domain yang sama agar cookie tetap first-party.
- Env wajib: `DATABASE_URL` (host `127.0.0.1`), `SESSION_SECRET`, `APP_ORIGIN`, `GEMINI_API_KEY`, `EREPORT_API_URL`, `EREPORT_API_TOKEN`, `EREPORT_SYNC_INTERVAL_MINUTES`, `NODE_ENV=production`.
- Tahapan: development (Laragon) → staging (database terpisah) → production: backup → migrate → smoke test → aktifkan → pantau.
