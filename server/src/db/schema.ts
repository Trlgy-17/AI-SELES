import {
    mysqlTable, char, varchar, text, datetime, bigint, int, boolean, json, mysqlEnum,
    primaryKey, index, uniqueIndex
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

const id = () => char('id', { length: 36 }).primaryKey();
const ts = (name: string) => datetime(name, { mode: 'date', fsp: 3 });
const createdAt = () => ts('created_at').notNull().default(sql`CURRENT_TIMESTAMP(3)`);
const updatedAt = () => ts('updated_at').notNull().default(sql`CURRENT_TIMESTAMP(3)`).$onUpdate(() => new Date());

export const LEAD_STAGES = ['PROSPECT_SURVEY', 'DESIGN_REVIEW', 'QUOTATION', 'CLOSING_DP', 'COMPLETED', 'LOST'] as const;
export const LOST_REASONS = ['budget', 'competitor', 'no_response', 'postponed', 'location', 'scope_mismatch', 'cancelled', 'other'] as const;
export const TASK_STATUSES = ['PENDING', 'DONE', 'CANCELLED'] as const;
export const TASK_PRIORITIES = ['LOW', 'NORMAL', 'HIGH'] as const;

// ── Identity & access ───────────────────────────────────────────────────────
export const users = mysqlTable('users', {
    id: id(),
    username: varchar('username', { length: 60 }).notNull(),
    email: varchar('email', { length: 190 }).notNull(),
    fullName: varchar('full_name', { length: 120 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    status: mysqlEnum('status', ['ACTIVE', 'DISABLED']).notNull().default('ACTIVE'),
    lastLoginAt: ts('last_login_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt()
}, (t) => [uniqueIndex('users_username_uq').on(t.username), uniqueIndex('users_email_uq').on(t.email)]);

export const roles = mysqlTable('roles', {
    id: varchar('id', { length: 40 }).primaryKey(),
    label: varchar('label', { length: 80 }).notNull()
});

export const permissions = mysqlTable('permissions', {
    id: varchar('id', { length: 60 }).primaryKey(),
    description: varchar('description', { length: 190 }).notNull()
});

export const rolePermissions = mysqlTable('role_permissions', {
    roleId: varchar('role_id', { length: 40 }).notNull(),
    permissionId: varchar('permission_id', { length: 60 }).notNull()
}, (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]);

export const userRoles = mysqlTable('user_roles', {
    userId: char('user_id', { length: 36 }).notNull(),
    roleId: varchar('role_id', { length: 40 }).notNull()
}, (t) => [primaryKey({ columns: [t.userId, t.roleId] })]);

export const brands = mysqlTable('brands', {
    id: varchar('id', { length: 40 }).primaryKey(),
    slug: varchar('slug', { length: 80 }).notNull(),
    brandName: varchar('brand_name', { length: 120 }).notNull(),
    displayName: varchar('display_name', { length: 190 }).notNull(),
    shortDescription: varchar('short_description', { length: 255 }),
    configuration: json('configuration').$type<Record<string, unknown>>(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt()
}, (t) => [uniqueIndex('brands_slug_uq').on(t.slug)]);

export const brandMemberships = mysqlTable('brand_memberships', {
    userId: char('user_id', { length: 36 }).notNull(),
    brandId: varchar('brand_id', { length: 40 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false)
}, (t) => [primaryKey({ columns: [t.userId, t.brandId] })]);

export const sessions = mysqlTable('sessions', {
    idHash: char('id_hash', { length: 64 }).primaryKey(),
    userId: char('user_id', { length: 36 }).notNull(),
    activeBrandId: varchar('active_brand_id', { length: 40 }),
    ip: varchar('ip', { length: 64 }),
    userAgent: varchar('user_agent', { length: 255 }),
    createdAt: createdAt(),
    lastSeenAt: ts('last_seen_at').notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    expiresAt: ts('expires_at').notNull()
}, (t) => [index('sessions_user_idx').on(t.userId)]);

// ── CRM core ───────────────────────────────────────────────────────────────
export const clients = mysqlTable('clients', {
    id: id(),
    brandId: varchar('brand_id', { length: 40 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    phoneRaw: varchar('phone_raw', { length: 40 }),
    normalizedPhone: varchar('normalized_phone', { length: 20 }),
    email: varchar('email', { length: 190 }),
    source: varchar('source', { length: 40 }).notNull().default('manual'),
    location: varchar('location', { length: 190 }),
    notes: text('notes'),
    externalSource: varchar('external_source', { length: 30 }),
    externalId: varchar('external_id', { length: 60 }),
    externalAccountId: varchar('external_account_id', { length: 40 }),
    externalUpdatedAt: ts('external_updated_at'),
    externalHash: char('external_hash', { length: 64 }),
    isSourceLocked: boolean('is_source_locked').notNull().default(false),
    potentialDuplicateOf: char('potential_duplicate_of', { length: 36 }),
    createdBy: char('created_by', { length: 36 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: ts('deleted_at')
}, (t) => [
    index('clients_brand_phone_idx').on(t.brandId, t.normalizedPhone),
    index('clients_brand_deleted_idx').on(t.brandId, t.deletedAt),
    uniqueIndex('clients_external_uq').on(t.externalSource, t.externalId)
]);

export const leads = mysqlTable('leads', {
    id: id(),
    brandId: varchar('brand_id', { length: 40 }).notNull(),
    clientId: char('client_id', { length: 36 }).notNull(),
    projectType: varchar('project_type', { length: 200 }),
    dimensions: varchar('dimensions', { length: 190 }),
    valueIdr: bigint('value_idr', { mode: 'number', unsigned: true }),
    stage: mysqlEnum('stage', LEAD_STAGES).notNull().default('PROSPECT_SURVEY'),
    lostReason: mysqlEnum('lost_reason', LOST_REASONS),
    assignedTo: char('assigned_to', { length: 36 }),
    notes: text('notes'),
    legacyId: varchar('legacy_id', { length: 80 }),
    externalSource: varchar('external_source', { length: 30 }),
    externalId: varchar('external_id', { length: 60 }),
    externalStatus: varchar('external_status', { length: 120 }),
    lastActivityAt: ts('last_activity_at'),
    createdBy: char('created_by', { length: 36 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: ts('deleted_at')
}, (t) => [
    index('leads_brand_stage_idx').on(t.brandId, t.stage),
    index('leads_assigned_idx').on(t.assignedTo),
    index('leads_client_idx').on(t.clientId),
    uniqueIndex('leads_legacy_uq').on(t.brandId, t.legacyId),
    uniqueIndex('leads_external_uq').on(t.externalSource, t.externalId)
]);

export const leadStageHistory = mysqlTable('lead_stage_history', {
    id: id(),
    leadId: char('lead_id', { length: 36 }).notNull(),
    fromStage: mysqlEnum('from_stage', LEAD_STAGES),
    toStage: mysqlEnum('to_stage', LEAD_STAGES).notNull(),
    lostReason: mysqlEnum('lost_reason', LOST_REASONS),
    changedBy: char('changed_by', { length: 36 }),
    createdAt: createdAt()
}, (t) => [index('stage_history_lead_idx').on(t.leadId, t.createdAt)]);

export const followUpTasks = mysqlTable('follow_up_tasks', {
    id: id(),
    brandId: varchar('brand_id', { length: 40 }).notNull(),
    clientId: char('client_id', { length: 36 }),
    leadId: char('lead_id', { length: 36 }),
    assignedTo: char('assigned_to', { length: 36 }),
    type: varchar('type', { length: 100 }).notNull(),
    reason: varchar('reason', { length: 255 }),
    status: mysqlEnum('status', TASK_STATUSES).notNull().default('PENDING'),
    priority: mysqlEnum('priority', TASK_PRIORITIES).notNull().default('NORMAL'),
    dueAt: ts('due_at'),
    completedAt: ts('completed_at'),
    legacyId: varchar('legacy_id', { length: 80 }),
    createdBy: char('created_by', { length: 36 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: ts('deleted_at')
}, (t) => [
    index('tasks_assigned_due_idx').on(t.assignedTo, t.dueAt),
    index('tasks_brand_status_idx').on(t.brandId, t.status),
    uniqueIndex('tasks_legacy_uq').on(t.brandId, t.legacyId)
]);

export const activities = mysqlTable('activities', {
    id: id(),
    brandId: varchar('brand_id', { length: 40 }).notNull(),
    clientId: char('client_id', { length: 36 }),
    leadId: char('lead_id', { length: 36 }),
    type: varchar('type', { length: 60 }).notNull(),
    summary: varchar('summary', { length: 255 }).notNull(),
    metadata: json('metadata').$type<Record<string, unknown>>(),
    actorId: char('actor_id', { length: 36 }),
    createdAt: createdAt()
}, (t) => [index('activities_client_idx').on(t.clientId, t.createdAt), index('activities_brand_idx').on(t.brandId, t.createdAt)]);

// ── Governance ─────────────────────────────────────────────────────────────
export const auditLogs = mysqlTable('audit_logs', {
    id: id(),
    actorId: char('actor_id', { length: 36 }),
    brandId: varchar('brand_id', { length: 40 }),
    action: varchar('action', { length: 60 }).notNull(),
    entity: varchar('entity', { length: 60 }).notNull(),
    entityId: varchar('entity_id', { length: 60 }),
    before: json('before').$type<Record<string, unknown> | null>(),
    after: json('after').$type<Record<string, unknown> | null>(),
    ip: varchar('ip', { length: 64 }),
    createdAt: createdAt()
}, (t) => [index('audit_entity_idx').on(t.entity, t.entityId), index('audit_created_idx').on(t.createdAt)]);

export const systemSettings = mysqlTable('system_settings', {
    key: varchar('key', { length: 100 }).primaryKey(),
    value: json('value').$type<unknown>().notNull(),
    updatedBy: char('updated_by', { length: 36 }),
    updatedAt: updatedAt()
});

export const migrationRuns = mysqlTable('migration_runs', {
    id: id(),
    kind: varchar('kind', { length: 40 }).notNull(),
    brandId: varchar('brand_id', { length: 40 }),
    actorId: char('actor_id', { length: 36 }),
    totalRecords: int('total_records').notNull().default(0),
    imported: int('imported').notNull().default(0),
    skipped: int('skipped').notNull().default(0),
    duplicates: int('duplicates').notNull().default(0),
    invalid: int('invalid').notNull().default(0),
    failed: int('failed').notNull().default(0),
    report: json('report').$type<Record<string, unknown>>(),
    createdAt: createdAt()
});

// ── AI & knowledge ─────────────────────────────────────────────────────────
export const aiGenerations = mysqlTable('ai_generations', {
    id: id(),
    brandId: varchar('brand_id', { length: 40 }),
    userId: char('user_id', { length: 36 }),
    provider: varchar('provider', { length: 20 }).notNull(),
    model: varchar('model', { length: 80 }).notNull(),
    promptVersion: varchar('prompt_version', { length: 40 }).notNull(),
    strategy: varchar('strategy', { length: 40 }),
    latencyMs: int('latency_ms'),
    inputChars: int('input_chars'),
    outputChars: int('output_chars'),
    success: boolean('success').notNull(),
    errorCode: varchar('error_code', { length: 60 }),
    createdAt: createdAt()
}, (t) => [index('ai_gen_brand_idx').on(t.brandId, t.createdAt)]);

export const aiFeedback = mysqlTable('ai_feedback', {
    id: id(),
    generationId: char('generation_id', { length: 36 }).notNull(),
    userId: char('user_id', { length: 36 }),
    rating: mysqlEnum('rating', ['GOOD', 'NEEDS_WORK']).notNull(),
    reason: varchar('reason', { length: 40 }),
    createdAt: createdAt()
}, (t) => [index('ai_feedback_gen_idx').on(t.generationId)]);

export const knowledgeDocuments = mysqlTable('knowledge_documents', {
    id: varchar('id', { length: 80 }).primaryKey(),
    scope: mysqlEnum('scope', ['GLOBAL', 'BRAND_OVERRIDE', 'CAMPAIGN']).notNull(),
    brandId: varchar('brand_id', { length: 40 }),
    category: varchar('category', { length: 60 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    priority: int('priority').notNull().default(10),
    version: int('version').notNull().default(1),
    status: mysqlEnum('status', ['ACTIVE', 'DRAFT', 'ARCHIVED']).notNull().default('ACTIVE'),
    effectiveAt: ts('effective_at'),
    effectiveUntil: ts('effective_until'),
    updatedBy: char('updated_by', { length: 36 }),
    createdAt: createdAt(),
    updatedAt: updatedAt()
}, (t) => [index('knowledge_scope_brand_idx').on(t.scope, t.brandId)]);

// ── e-report integration (read-only source) ────────────────────────────────
export const ereportAccountMappings = mysqlTable('ereport_account_mappings', {
    ereportAccountId: varchar('ereport_account_id', { length: 40 }).primaryKey(),
    ereportAccountName: varchar('ereport_account_name', { length: 190 }).notNull(),
    brandId: varchar('brand_id', { length: 40 }),
    enabled: boolean('enabled').notNull().default(false),
    updatedAt: updatedAt()
});

export const ereportStatusMappings = mysqlTable('ereport_status_mappings', {
    ereportStatusId: varchar('ereport_status_id', { length: 40 }).primaryKey(),
    ereportStatusName: varchar('ereport_status_name', { length: 190 }).notNull(),
    stage: mysqlEnum('stage', LEAD_STAGES).notNull().default('PROSPECT_SURVEY'),
    updatedAt: updatedAt()
});

export const externalSyncRuns = mysqlTable('external_sync_runs', {
    id: id(),
    source: varchar('source', { length: 30 }).notNull(),
    trigger: varchar('trigger', { length: 20 }).notNull(),
    status: mysqlEnum('status', ['RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED']).notNull(),
    fetched: int('fetched').notNull().default(0),
    created: int('created').notNull().default(0),
    updated: int('updated').notNull().default(0),
    unchanged: int('unchanged').notNull().default(0),
    archived: int('archived').notNull().default(0),
    duplicateFlags: int('duplicate_flags').notNull().default(0),
    failed: int('failed').notNull().default(0),
    error: text('error'),
    actorId: char('actor_id', { length: 36 }),
    startedAt: ts('started_at').notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    finishedAt: ts('finished_at')
});
