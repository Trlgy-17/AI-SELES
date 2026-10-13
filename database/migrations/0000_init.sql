CREATE TABLE `activities` (
	`id` char(36) NOT NULL,
	`brand_id` varchar(40) NOT NULL,
	`client_id` char(36),
	`lead_id` char(36),
	`type` varchar(60) NOT NULL,
	`summary` varchar(255) NOT NULL,
	`metadata` json,
	`actor_id` char(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_feedback` (
	`id` char(36) NOT NULL,
	`generation_id` char(36) NOT NULL,
	`user_id` char(36),
	`rating` enum('GOOD','NEEDS_WORK') NOT NULL,
	`reason` varchar(40),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `ai_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_generations` (
	`id` char(36) NOT NULL,
	`brand_id` varchar(40),
	`user_id` char(36),
	`provider` varchar(20) NOT NULL,
	`model` varchar(80) NOT NULL,
	`prompt_version` varchar(40) NOT NULL,
	`strategy` varchar(40),
	`latency_ms` int,
	`input_chars` int,
	`output_chars` int,
	`success` boolean NOT NULL,
	`error_code` varchar(60),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `ai_generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` char(36) NOT NULL,
	`actor_id` char(36),
	`brand_id` varchar(40),
	`action` varchar(60) NOT NULL,
	`entity` varchar(60) NOT NULL,
	`entity_id` varchar(60),
	`before` json,
	`after` json,
	`ip` varchar(64),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brand_memberships` (
	`user_id` char(36) NOT NULL,
	`brand_id` varchar(40) NOT NULL,
	`is_default` boolean NOT NULL DEFAULT false,
	CONSTRAINT `brand_memberships_user_id_brand_id_pk` PRIMARY KEY(`user_id`,`brand_id`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` varchar(40) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`brand_name` varchar(120) NOT NULL,
	`display_name` varchar(190) NOT NULL,
	`short_description` varchar(255),
	`configuration` json,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` char(36) NOT NULL,
	`brand_id` varchar(40) NOT NULL,
	`name` varchar(120) NOT NULL,
	`phone_raw` varchar(40),
	`normalized_phone` varchar(20),
	`email` varchar(190),
	`source` varchar(40) NOT NULL DEFAULT 'manual',
	`location` varchar(190),
	`notes` text,
	`external_source` varchar(30),
	`external_id` varchar(60),
	`external_account_id` varchar(40),
	`external_updated_at` datetime(3),
	`external_hash` char(64),
	`is_source_locked` boolean NOT NULL DEFAULT false,
	`potential_duplicate_of` char(36),
	`created_by` char(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`deleted_at` datetime(3),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_external_uq` UNIQUE(`external_source`,`external_id`)
);
--> statement-breakpoint
CREATE TABLE `ereport_account_mappings` (
	`ereport_account_id` varchar(40) NOT NULL,
	`ereport_account_name` varchar(190) NOT NULL,
	`brand_id` varchar(40),
	`enabled` boolean NOT NULL DEFAULT false,
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `ereport_account_mappings_ereport_account_id` PRIMARY KEY(`ereport_account_id`)
);
--> statement-breakpoint
CREATE TABLE `ereport_status_mappings` (
	`ereport_status_id` varchar(40) NOT NULL,
	`ereport_status_name` varchar(190) NOT NULL,
	`stage` enum('PROSPECT_SURVEY','DESIGN_REVIEW','QUOTATION','CLOSING_DP','COMPLETED','LOST') NOT NULL DEFAULT 'PROSPECT_SURVEY',
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `ereport_status_mappings_ereport_status_id` PRIMARY KEY(`ereport_status_id`)
);
--> statement-breakpoint
CREATE TABLE `external_sync_runs` (
	`id` char(36) NOT NULL,
	`source` varchar(30) NOT NULL,
	`trigger` varchar(20) NOT NULL,
	`status` enum('RUNNING','SUCCESS','PARTIAL','FAILED') NOT NULL,
	`fetched` int NOT NULL DEFAULT 0,
	`created` int NOT NULL DEFAULT 0,
	`updated` int NOT NULL DEFAULT 0,
	`unchanged` int NOT NULL DEFAULT 0,
	`archived` int NOT NULL DEFAULT 0,
	`duplicate_flags` int NOT NULL DEFAULT 0,
	`failed` int NOT NULL DEFAULT 0,
	`error` text,
	`actor_id` char(36),
	`started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`finished_at` datetime(3),
	CONSTRAINT `external_sync_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `follow_up_tasks` (
	`id` char(36) NOT NULL,
	`brand_id` varchar(40) NOT NULL,
	`client_id` char(36),
	`lead_id` char(36),
	`assigned_to` char(36),
	`type` varchar(100) NOT NULL,
	`reason` varchar(255),
	`status` enum('PENDING','DONE','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`priority` enum('LOW','NORMAL','HIGH') NOT NULL DEFAULT 'NORMAL',
	`due_at` datetime(3),
	`completed_at` datetime(3),
	`legacy_id` varchar(80),
	`created_by` char(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`deleted_at` datetime(3),
	CONSTRAINT `follow_up_tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `tasks_legacy_uq` UNIQUE(`brand_id`,`legacy_id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_documents` (
	`id` varchar(80) NOT NULL,
	`scope` enum('GLOBAL','BRAND_OVERRIDE','CAMPAIGN') NOT NULL,
	`brand_id` varchar(40),
	`category` varchar(60) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`priority` int NOT NULL DEFAULT 10,
	`version` int NOT NULL DEFAULT 1,
	`status` enum('ACTIVE','DRAFT','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
	`effective_at` datetime(3),
	`effective_until` datetime(3),
	`updated_by` char(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `knowledge_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_stage_history` (
	`id` char(36) NOT NULL,
	`lead_id` char(36) NOT NULL,
	`from_stage` enum('PROSPECT_SURVEY','DESIGN_REVIEW','QUOTATION','CLOSING_DP','COMPLETED','LOST'),
	`to_stage` enum('PROSPECT_SURVEY','DESIGN_REVIEW','QUOTATION','CLOSING_DP','COMPLETED','LOST') NOT NULL,
	`lost_reason` enum('budget','competitor','no_response','postponed','location','scope_mismatch','cancelled','other'),
	`changed_by` char(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `lead_stage_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` char(36) NOT NULL,
	`brand_id` varchar(40) NOT NULL,
	`client_id` char(36) NOT NULL,
	`project_type` varchar(200),
	`dimensions` varchar(190),
	`value_idr` bigint unsigned,
	`stage` enum('PROSPECT_SURVEY','DESIGN_REVIEW','QUOTATION','CLOSING_DP','COMPLETED','LOST') NOT NULL DEFAULT 'PROSPECT_SURVEY',
	`lost_reason` enum('budget','competitor','no_response','postponed','location','scope_mismatch','cancelled','other'),
	`assigned_to` char(36),
	`notes` text,
	`legacy_id` varchar(80),
	`external_source` varchar(30),
	`external_id` varchar(60),
	`external_status` varchar(120),
	`last_activity_at` datetime(3),
	`created_by` char(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`deleted_at` datetime(3),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `leads_legacy_uq` UNIQUE(`brand_id`,`legacy_id`),
	CONSTRAINT `leads_external_uq` UNIQUE(`external_source`,`external_id`)
);
--> statement-breakpoint
CREATE TABLE `migration_runs` (
	`id` char(36) NOT NULL,
	`kind` varchar(40) NOT NULL,
	`brand_id` varchar(40),
	`actor_id` char(36),
	`total_records` int NOT NULL DEFAULT 0,
	`imported` int NOT NULL DEFAULT 0,
	`skipped` int NOT NULL DEFAULT 0,
	`duplicates` int NOT NULL DEFAULT 0,
	`invalid` int NOT NULL DEFAULT 0,
	`failed` int NOT NULL DEFAULT 0,
	`report` json,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `migration_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(60) NOT NULL,
	`description` varchar(190) NOT NULL,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` varchar(40) NOT NULL,
	`permission_id` varchar(60) NOT NULL,
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(40) NOT NULL,
	`label` varchar(80) NOT NULL,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id_hash` char(64) NOT NULL,
	`user_id` char(36) NOT NULL,
	`active_brand_id` varchar(40),
	`ip` varchar(64),
	`user_agent` varchar(255),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`last_seen_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`expires_at` datetime(3) NOT NULL,
	CONSTRAINT `sessions_id_hash` PRIMARY KEY(`id_hash`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`key` varchar(100) NOT NULL,
	`value` json NOT NULL,
	`updated_by` char(36),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `system_settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` char(36) NOT NULL,
	`role_id` varchar(40) NOT NULL,
	CONSTRAINT `user_roles_user_id_role_id_pk` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`username` varchar(60) NOT NULL,
	`email` varchar(190) NOT NULL,
	`full_name` varchar(120) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`status` enum('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
	`last_login_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_uq` UNIQUE(`username`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `activities_client_idx` ON `activities` (`client_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `activities_brand_idx` ON `activities` (`brand_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `ai_feedback_gen_idx` ON `ai_feedback` (`generation_id`);--> statement-breakpoint
CREATE INDEX `ai_gen_brand_idx` ON `ai_generations` (`brand_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_logs` (`entity`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `clients_brand_phone_idx` ON `clients` (`brand_id`,`normalized_phone`);--> statement-breakpoint
CREATE INDEX `clients_brand_deleted_idx` ON `clients` (`brand_id`,`deleted_at`);--> statement-breakpoint
CREATE INDEX `tasks_assigned_due_idx` ON `follow_up_tasks` (`assigned_to`,`due_at`);--> statement-breakpoint
CREATE INDEX `tasks_brand_status_idx` ON `follow_up_tasks` (`brand_id`,`status`);--> statement-breakpoint
CREATE INDEX `knowledge_scope_brand_idx` ON `knowledge_documents` (`scope`,`brand_id`);--> statement-breakpoint
CREATE INDEX `stage_history_lead_idx` ON `lead_stage_history` (`lead_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `leads_brand_stage_idx` ON `leads` (`brand_id`,`stage`);--> statement-breakpoint
CREATE INDEX `leads_assigned_idx` ON `leads` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `leads_client_idx` ON `leads` (`client_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);