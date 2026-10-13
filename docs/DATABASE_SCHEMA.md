# Skema Database (MySQL 8)

Sumber kebenaran: `server/src/db/schema.ts` (Drizzle) → migrasi di `database/migrations/`.
Konvensi: ID `CHAR(36)` UUID · uang `BIGINT` rupiah · waktu `DATETIME(3)` UTC (koneksi di-pin `time_zone='+00:00'`) · soft delete `deleted_at` · entitas bisnis punya `brand_id`.

## Dibangun (fase fondasi)

### Identitas & akses
| Tabel | Kolom penting | Index / catatan |
|---|---|---|
| `users` | username, email, full_name, password_hash (argon2id), status, last_login_at | unique username, email |
| `roles` | id (SUPER_ADMIN, OWNER, SUPERVISOR, MARKETING_ADMIN, SALES), label | |
| `permissions` | id (mis. `client.update`), description | |
| `role_permissions` | role_id, permission_id | PK gabungan |
| `user_roles` | user_id, role_id | PK gabungan |
| `brands` | slug, brand_name, display_name, short_description, configuration (JSON: kontak, tone, signature), is_active | unique slug |
| `brand_memberships` | user_id, brand_id, is_default | PK gabungan — dasar isolasi brand |
| `sessions` | id_hash (SHA-256 token cookie), user_id, active_brand_id, ip, user_agent, last_seen_at, expires_at | idx user_id |

### CRM
| Tabel | Kolom penting | Index / catatan |
|---|---|---|
| `clients` | brand_id, name, phone_raw, normalized_phone, email, source (manual/legacy_import/ereport), location, notes, external_source, external_id, external_account_id, external_updated_at, external_hash, is_source_locked, potential_duplicate_of | (brand_id, normalized_phone), (brand_id, deleted_at), unique (external_source, external_id) |
| `leads` | brand_id, client_id, project_type, dimensions, value_idr, stage, lost_reason, assigned_to, notes, legacy_id, external_source, external_id, external_status, last_activity_at | (brand_id, stage), assigned_to, client_id, unique (brand_id, legacy_id), unique (external_source, external_id) |
| `lead_stage_history` | lead_id, from_stage, to_stage, lost_reason, changed_by (NULL = sistem/sinkron) | (lead_id, created_at) |
| `follow_up_tasks` | brand_id, client_id, lead_id, assigned_to, type, reason, status, priority, due_at, completed_at, legacy_id | (assigned_to, due_at), (brand_id, status) |
| `activities` | brand_id, client_id, lead_id, type, summary, metadata, actor_id | (client_id, created_at), (brand_id, created_at) — sumber timeline |

Tahap (`stage`): `PROSPECT_SURVEY`, `DESIGN_REVIEW`, `QUOTATION`, `CLOSING_DP`, `COMPLETED`, `LOST` (dipetakan 1:1 ke label UI yang ada). `LOST` wajib `lost_reason` ∈ budget, competitor, no_response, postponed, location, scope_mismatch, cancelled, other.

### Governance, AI, knowledge
| Tabel | Kolom penting | Catatan |
|---|---|---|
| `audit_logs` | actor_id, brand_id, action, entity, entity_id, before, after (JSON, PII di-redaksi), ip | (entity, entity_id), created_at |
| `system_settings` | key, value (JSON) | allowlist model AI, cursor sinkron e-report |
| `migration_runs` | kind, total_records, imported, skipped, duplicates, invalid, failed, report | laporan impor data lama |
| `ai_generations` | provider, model, prompt_version, strategy, latency_ms, input_chars, output_chars, success, error_code | tanpa isi prompt/PII |
| `ai_feedback` | generation_id, rating (GOOD/NEEDS_WORK), reason | |
| `knowledge_documents` | scope (GLOBAL/BRAND_OVERRIDE/CAMPAIGN), brand_id, category, title, content, priority, version, status, effective_at/until | FULLTEXT (title, content) |

### Integrasi e-report (read-only)
| Tabel | Kolom | Catatan |
|---|---|---|
| `ereport_account_mappings` | ereport_account_id, ereport_account_name, brand_id, enabled | akun e-report → brand |
| `ereport_status_mappings` | ereport_status_id, ereport_status_name, stage | status e-report → tahap |
| `external_sync_runs` | source, trigger, status, fetched, created, updated, unchanged, archived, duplicate_flags, failed, error | riwayat sinkron |

## Direncanakan (fase berikutnya — belum dibuat)
`client_contacts`, `client_addresses`, `projects`, `surveys`, `estimates` + `estimate_items` (versi V1/V2 + price snapshot JSON), `payments`, `conversations` + `conversation_messages`, `conversation_summaries`, `client_memory_facts` (value, source, confidence, state VERIFIED/INFERRED/OUTDATED/CONFLICTING, verified_at, created_by), `client_preferences`, `sales_actions`, `knowledge_chunks`, `knowledge_tags`, `notifications`, `attachments` (metadata + object-storage key). Tabel-tabel ini ditambahkan hanya saat fiturnya dibangun.
