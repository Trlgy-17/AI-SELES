# NACIRA STUDIO — Sales AI CRM

Multi-brand sales workspace for Indonesian interior design & build companies: AI-assisted WhatsApp replies, lead CRM, RAB (cost) estimator with PDF quotes, and a 3-layer knowledge base.

Supported brands: Nacira Studio, Homeputra Interior, Heya Interior, Putra Interior, Kurnia Interior (defined in `src/js/constants.js`).

## Quick start (local, Laragon)

Requirements: Node 20+, MySQL 8 (Laragon's MySQL running on 127.0.0.1:3306).

```bash
npm install
cp .env.example .env            # fill SESSION_SECRET, GEMINI_API_KEY (and EREPORT_* for the e-report integration)
mysql -uroot -e "CREATE DATABASE nacira_crm CHARACTER SET utf8mb4; CREATE DATABASE nacira_crm_test CHARACTER SET utf8mb4;"
npm run db:migrate              # create tables
npm run db:seed                 # roles, brands, users (random passwords printed ONCE), knowledge
npm run dev:all                 # web http://localhost:3000 + API http://127.0.0.1:4000 (/api proxied by Vite)
```

For LAN or tunnel access, add every browser origin to the comma-separated `APP_ORIGIN` value (for example `http://localhost:3000,http://192.168.1.40:3000`). Vite already listens on all interfaces; keep the API on `127.0.0.1` behind Vite's same-origin proxy.

Other scripts:

```bash
npm run test:api                          # API tests against nacira_crm_test (auth, RBAC, brand isolation, import, e-report)
node scripts/run_acceptance_tests.mjs     # estimator math, PDF, prompt & responsive guards
npm run build && npm run build:api        # frontend → dist/, API → dist-server/
npm run db:seed -- --reset-passwords      # regenerate seed user passwords
```

All business data lives in MySQL behind the API; API keys stay server-side. Architecture, schema, security and the upgrade plan are in `docs/` (start with `docs/FINAL_UPGRADE_REPORT.md`).

### e-report integration (read-only)
1. On the e-report server: `php artisan migrate`, then `php artisan integration:client create "Nacira CRM" --accounts=1,9` (token is printed once).
2. Put `EREPORT_API_URL` and `EREPORT_API_TOKEN` in this API's env; optional `EREPORT_SYNC_INTERVAL_MINUTES`.
3. In the app (Super Admin): **Pengaturan → Integrasi e-report** → map accounts to brands and statuses to stages → **Sinkron sekarang**.

The integration token can only call GET endpoints limited to its allowed accounts; this app's client also refuses any non-GET request.

## Modules

| Module | What it does |
|---|---|
| **Sales AI** | Paste a client chat or WhatsApp screenshot, pick a strategy (Smart Auto, Harga, Survei, Keberatan, Follow-up, Closing), generate a reply, then copy it or open WhatsApp. Shows context analysis (intent, stage, missing info, next step) and client memory. Providers: Google Gemini or any OpenAI-compatible API. |
| **CRM Leads** | Brand-scoped leads with search, status filter, sort, CSV export, duplicate-phone warning, table / pipeline views, edit and delete. Statuses: Prospek / Survey, Design Review, Penawaran RAB, Closing / DP Masuk, Selesai / Terpasang, Batal. |
| **Estimator** | RAB calculator for Kitchen Set, Kamar Set, Living Room, and Sipil & Bengkel with DK/LK regional pricing. Copy as WhatsApp quote, export PDF, or send to Sales AI. |
| **Knowledge Base** | Searchable knowledge cards across Global, Brand Override and Campaign layers, plus an AI retrieval tester. |

Super Admin accounts can switch brand workspaces from the top bar; other roles are locked to their brand.

## Tech stack

React 18 · Vite 6 · Tailwind CSS v4 (`@tailwindcss/vite`) · Lucide icons · Geist font · jsPDF · Firebase (optional).

## Project structure

```
src/
├── components/
│   ├── ui/          # Design-system primitives (Button, Input, Modal, Menu, Badge, Panel…)
│   ├── layout/      # AppShell, Sidebar, Header, BottomNav, BrandSwitcher, CommandPalette
│   ├── common/      # FormField, Toast, StatusBadge, ConfirmModal, reminder banner
│   ├── modals/      # Lead / task / auth / API key / cloud settings dialogs
│   └── modules/     # AIWorkspace, CRMModule, EstimatorCalculator, KnowledgeBase
├── js/
│   ├── app.jsx      # App state & tab routing
│   ├── constants.js # Brands, statuses, AI modes, knowledge seed
│   ├── services/    # AI, auth, storage, firebase, calculatorData, knowledge, export…
│   └── utils/       # phone, date, clipboard, image, pdfExport, cn
└── styles/style.css # Design tokens (dark default, light-ready) + Tailwind
```

Design system and redesign notes: `docs/UI_REDESIGN_AUDIT.md`, `docs/UI_REDESIGN_PLAN.md`, `docs/UI_REDESIGN_REPORT.md`.

Contact: nacirastudio@gmail.com · +62 853-8506-9717
# AI-SELES
