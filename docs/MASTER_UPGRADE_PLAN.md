# Master Upgrade Plan

Status: ✅ selesai · 🟡 sebagian · ⏳ berikutnya

| Fase | Tujuan | File / area | DB | API | Risiko | Test | Kriteria selesai | Status |
|---|---|---|---|---|---|---|---|---|
| 0 Audit | Pahami sistem dari kode | `docs/AUDIT_CURRENT_SYSTEM.md` dkk. | — | — | Salah asumsi | — | Dokumen berbasis kode | ✅ |
| 1 Arsitektur | Backend modular monolith | `server/`, `vite.config.js`, `package.json` | — | `/api/health` | Tooling Windows | build:api | API berjalan, typecheck bersih | ✅ |
| 2 Database & migrasi | MySQL sebagai sumber kebenaran | `server/src/db/*`, `database/migrations/*` | 22 tabel + FULLTEXT | `/migrations/legacy-import` | Kehilangan data lama | import test (hitungan & sampel) | Semua record tercatat, idempoten | ✅ |
| 3 Auth + RBAC | Login nyata, izin, isolasi brand | `plugins/auth.ts`, `modules/auth`, `lib/rbac.ts`, `LoginScreen.jsx` | users, roles, sessions… | `/auth/*` | Terkunci keluar | auth-rbac tests, IDOR test | Brand B → 404 untuk data brand A | ✅ |
| 4 Customer 360 | Halaman klien terpadu | `modules/clients`, UI baru | projects, contacts | `/clients/:id` (360) | Scope besar | e2e | Satu halaman identitas–pipeline–timeline | ⏳ |
| 5 Memori terstruktur | Fakta + konflik | `modules/memory` | client_memory_facts | `/clients/:id/memory` | Overwrite diam-diam | conflict tests | Konflik butuh persetujuan | ⏳ |
| 6 Pipeline + timeline + tugas | Alur kerja CRM | CRM UI, `modules/tasks` | activities ✅, tasks ✅ | `/tasks` ✅, `/activities` ✅ | Mapping SOP | stage tests ✅ | Kanban, timeline, UI tugas, 13 tahap sesuai SOP | 🟡 (API siap, UI tugas/timeline belum) |
| 7 Orkestrasi AI | Pipeline modular + next action | `modules/ai` | ai_generations ✅ | `/ai/generate` ✅ | Latensi | schema tests ✅ | Next best action + kandidat memori | 🟡 (proxy + log + feedback ✅) |
| 8 Knowledge retrieval | FULLTEXT server + provenance | `modules/meta`, KnowledgeBase | knowledge_documents ✅ | `/knowledge?q=` ✅ | Relevansi | retrieval tests | Retriever AI pakai server | 🟡 |
| 9 Estimator | RAB versi + price snapshot | Estimator, `modules/estimates` | estimates, items | `/estimates` | Rumus berubah | acceptance ✅ | V1/V2 tersimpan, harga reproducible | ⏳ |
| 10 UI integration | Menu baru (Dashboard, Clients, Pipeline, Tasks…) | layout | — | — | Regresi responsif | QA viewport | Navigasi sesuai brief | ⏳ |
| 11 Analytics | Metrik yang dapat ditindaklanjuti | dashboard | — | `/dashboard/summary` 🟡 | Metrik palsu | — | Owner vs sales view | ⏳ |
| 12 QA + security + migrasi | Validasi akhir | tests, docs | — | — | — | semua suite | Laporan QA | 🟡 (fondasi) |
| E Integrasi e-report | Baca lead dari e-report tanpa bisa mengubah | `modules/integrations/ereport`, repo e-report | 3 tabel + kolom external | `/integrations/ereport/*` | Kebocoran/penulisan | 7 test Laravel + sync test | Jumlah cocok, write → 405 | ✅ |

Kebijakan: hanya berhenti untuk persetujuan jika menghapus data produksi, mengubah rumus harga, mengganti auth secara destruktif, menghapus brand/fitur kritis, atau butuh kredensial produksi.
