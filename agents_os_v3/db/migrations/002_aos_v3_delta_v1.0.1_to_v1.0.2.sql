-- =============================================================================
-- AOS v3 — DELTA MIGRATION — v1.0.1 → v1.0.2
-- Apply to: PostgreSQL 16+ database already at v1.0.1 schema
-- DDL Spec basis: TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md (Team 190 PASS)
-- Mandate: TEAM_11_TO_TEAM_111_AOS_V3_BUILD_ACTIVATION_v1.0.0.md (WP D.5)
-- Author: Team 111 (AOS Domain Architect)
-- Date: 2026-03-28
-- Branch: aos-v3
--
-- NAMING RULE (WP D.5 — IRON RULE):
--   work_packages.id  = DB primary key (TEXT)
--   "wp_id"           = API-layer alias ONLY — never a column name in DB
--
-- APPLY ORDER (single transaction):
--   Step 1:  DDL-ERRATA-01-A — rename wp_artifact_index.wp_id → work_package_id
--   Step 2:  DDL-ERRATA-01-B — add partial unique index on templates (active slot)
--   Step 3:  teams.engine — column already present in v1.0.1 spec (TEXT NOT NULL);
--              if upgrading from a pre-v1.0.1 DB that lacks it: see commented ALTER.
--   Step 4:  CREATE TABLE work_packages (NEW)
--   Step 5:  Backfill FKs on existing tables → work_packages
--   Step 6:  CREATE TABLE ideas (NEW — supersedes any Stage 8A draft)
--   Step 7:  CREATE TABLE pending_feedbacks (NEW)
--   Step 8:  New indexes
--
-- PRE-FLIGHT CHECKS (run before applying):
--   SELECT COUNT(*) FROM wp_artifact_index WHERE wp_id IS NOT NULL;
--   -- Confirm column exists and data is present before rename.
--
--   SELECT COUNT(*) FROM information_schema.columns
--     WHERE table_name = 'teams' AND column_name = 'engine';
--   -- If 0 rows: uncomment Step 3 ALTER TABLE.
-- =============================================================================

BEGIN;

-- ============================================================================
-- Step 1: DDL-ERRATA-01-A
-- Rename wp_artifact_index.wp_id → work_package_id
-- Rationale: WP D.5 Iron Rule — no column named "wp_id" in DB.
--            "wp_id" is API-layer alias only.
-- ============================================================================
ALTER TABLE wp_artifact_index
  RENAME COLUMN wp_id TO work_package_id;

-- Recreate the index with the corrected column name
-- (the old idx_wpai_wp referenced wp_id; drop it first if it exists)
DROP INDEX IF EXISTS idx_wpai_wp;
CREATE INDEX idx_wpai_wp ON wp_artifact_index (work_package_id);

-- ============================================================================
-- Step 2: DDL-ERRATA-01-B
-- Add partial unique index on templates — active-slot uniqueness.
-- Rationale: get_active_template() (templates.py) must return at most one row.
--            Index enforces uniqueness: one active template per
--            (gate_id, phase_id-or-NULL, domain_id-or-NULL, name).
-- ============================================================================
CREATE UNIQUE INDEX uq_templates_active_slot
  ON templates (gate_id, COALESCE(phase_id, ''), COALESCE(domain_id, ''), name)
  WHERE is_active = 1;

-- ============================================================================
-- Step 3: teams.engine column
-- DDL Spec v1.0.1 already includes `engine TEXT NOT NULL` in CREATE TABLE teams.
-- If migrating from a pre-v1.0.1 DB that does NOT have this column, uncomment:
-- ----------------------------------------------------------------------------
-- ALTER TABLE teams
--   ADD COLUMN engine VARCHAR(50) NOT NULL DEFAULT 'cursor';
-- ----------------------------------------------------------------------------
-- For v1.0.1 → v1.0.2 migrations this step is a no-op (column already exists).
-- ============================================================================

-- ============================================================================
-- Step 4: CREATE TABLE work_packages (NEW in v1.0.2)
-- PK = id (TEXT).  API alias "wp_id" is application-layer only.
-- ============================================================================
CREATE TABLE work_packages (
  id              TEXT        NOT NULL,
  label           TEXT        NOT NULL,
  domain_id       TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'PLANNED',
  linked_run_id   TEXT,
  created_at      TIMESTAMPTZ NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_work_packages PRIMARY KEY (id),
  CONSTRAINT fk_wp_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_wp_linked_run FOREIGN KEY (linked_run_id)
    REFERENCES runs(id) ON DELETE SET NULL,
  CONSTRAINT chk_wp_status CHECK (status IN (
    'PLANNED', 'ACTIVE', 'COMPLETE', 'CANCELLED'
  ))
);

CREATE INDEX idx_wp_domain ON work_packages (domain_id);
CREATE INDEX idx_wp_status ON work_packages (status);

-- ============================================================================
-- Step 5: Backfill FK constraints on existing tables → work_packages
--
-- IMPORTANT: These ALTER statements will FAIL if any existing row references
-- a work_package_id / work_package_id value that does NOT exist in work_packages.
-- Before applying:
--   1. Populate work_packages with rows for every distinct WP ID in scope.
--   2. Verify referential integrity:
--      SELECT DISTINCT work_package_id FROM runs
--        WHERE work_package_id NOT IN (SELECT id FROM work_packages);
--      SELECT DISTINCT work_package_id FROM assignments
--        WHERE work_package_id NOT IN (SELECT id FROM work_packages);
--      SELECT DISTINCT work_package_id FROM events
--        WHERE work_package_id NOT IN (SELECT id FROM work_packages);
--      SELECT DISTINCT work_package_id FROM wp_artifact_index
--        WHERE work_package_id NOT IN (SELECT id FROM work_packages);
-- ============================================================================

-- runs.work_package_id → work_packages.id
ALTER TABLE runs
  ADD CONSTRAINT fk_runs_work_package FOREIGN KEY (work_package_id)
    REFERENCES work_packages(id) ON DELETE RESTRICT;

-- assignments.work_package_id → work_packages.id
ALTER TABLE assignments
  ADD CONSTRAINT fk_asg_work_package FOREIGN KEY (work_package_id)
    REFERENCES work_packages(id) ON DELETE RESTRICT;

-- events.work_package_id → work_packages.id
ALTER TABLE events
  ADD CONSTRAINT fk_evt_work_package FOREIGN KEY (work_package_id)
    REFERENCES work_packages(id) ON DELETE RESTRICT;

-- wp_artifact_index.work_package_id → work_packages.id
ALTER TABLE wp_artifact_index
  ADD CONSTRAINT fk_wpai_work_package FOREIGN KEY (work_package_id)
    REFERENCES work_packages(id) ON DELETE RESTRICT;

-- ============================================================================
-- Step 6: CREATE TABLE ideas (NEW in v1.0.2)
-- Supersedes any Stage 8A v1.0.2 §10.1 draft definition.
-- Full definition per UI Spec Amendment v1.1.0 §13.2:
--   adds domain_id (NOT NULL FK), idea_type, decision_notes vs. Stage 8A base.
-- If ideas table already exists from Stage 8A draft, DROP it first:
--   DROP TABLE IF EXISTS ideas;
-- ============================================================================
CREATE TABLE ideas (
  id                TEXT        NOT NULL,
  title             TEXT        NOT NULL,
  description       TEXT,
  domain_id         TEXT        NOT NULL,
  idea_type         TEXT        NOT NULL DEFAULT 'FEATURE',
  status            TEXT        NOT NULL DEFAULT 'NEW',
  priority          TEXT        NOT NULL DEFAULT 'MEDIUM',
  submitted_by      VARCHAR(50) NOT NULL,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decision_notes    TEXT,
  target_program_id TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_ideas PRIMARY KEY (id),
  CONSTRAINT fk_ideas_submitted_by FOREIGN KEY (submitted_by)
    REFERENCES teams(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ideas_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT chk_ideas_status CHECK (status IN (
    'NEW', 'EVALUATING', 'APPROVED', 'DEFERRED', 'REJECTED'
  )),
  CONSTRAINT chk_ideas_priority CHECK (priority IN (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  )),
  CONSTRAINT chk_ideas_type CHECK (idea_type IN (
    'BUG', 'FEATURE', 'IMPROVEMENT', 'TECH_DEBT', 'RESEARCH'
  ))
);

CREATE INDEX idx_ideas_status   ON ideas (status);
CREATE INDEX idx_ideas_priority ON ideas (priority);
CREATE INDEX idx_ideas_domain   ON ideas (domain_id);
CREATE INDEX idx_ideas_type     ON ideas (idea_type);

-- ============================================================================
-- Step 7: CREATE TABLE pending_feedbacks (NEW in v1.0.2)
-- FeedbackRecord store per UI Spec Amendment v1.1.0 §13.1.
-- Idempotency guard: at most one row per run_id with cleared_at IS NULL
-- (enforced in application layer: UC-15 checks before INSERT).
-- ============================================================================
CREATE TABLE pending_feedbacks (
  id                     TEXT        NOT NULL,
  run_id                 TEXT        NOT NULL,
  detection_mode         TEXT        NOT NULL,
  ingestion_layer        TEXT        NOT NULL,
  verdict                TEXT        NOT NULL,
  summary                TEXT,
  blocking_findings_json TEXT        NOT NULL DEFAULT '[]',
  route_recommendation   TEXT,
  raw_text               TEXT,
  source_path            TEXT,
  confidence             TEXT        NOT NULL,
  proposed_action        TEXT        NOT NULL,
  ingested_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cleared_at             TIMESTAMPTZ,
  CONSTRAINT pk_pending_feedbacks PRIMARY KEY (id),
  CONSTRAINT fk_pf_run FOREIGN KEY (run_id)
    REFERENCES runs(id) ON DELETE CASCADE,
  CONSTRAINT chk_pf_verdict CHECK (verdict IN (
    'PASS', 'FAIL', 'PENDING_REVIEW'
  )),
  CONSTRAINT chk_pf_confidence CHECK (confidence IN (
    'HIGH', 'MEDIUM', 'LOW'
  )),
  CONSTRAINT chk_pf_detection_mode CHECK (detection_mode IN (
    'CANONICAL_AUTO', 'OPERATOR_NOTIFY', 'NATIVE_FILE', 'RAW_PASTE'
  )),
  CONSTRAINT chk_pf_ingestion_layer CHECK (ingestion_layer IN (
    'JSON_BLOCK', 'REGEX_EXTRACT', 'RAW_DISPLAY'
  )),
  CONSTRAINT chk_pf_proposed_action CHECK (proposed_action IN (
    'ADVANCE', 'FAIL', 'MANUAL_REVIEW'
  ))
);

CREATE INDEX idx_pf_run_id      ON pending_feedbacks (run_id);
CREATE INDEX idx_pf_ingested_at ON pending_feedbacks (ingested_at);

-- ============================================================================
-- Step 8: Additional indexes introduced in v1.0.2
-- ============================================================================

-- runs: work_package_id lookup (supplemental to existing idx_runs_wp_domain)
-- (idx_runs_wp_domain already exists in v1.0.1 schema — no-op here)

-- ============================================================================
-- POST-MIGRATION VALIDATION QUERIES
-- ============================================================================
-- Run these after applying and before committing to environment:

-- V1: work_packages table exists and has correct PK column name
SELECT column_name, data_type
  FROM information_schema.columns
 WHERE table_name = 'work_packages' AND column_name = 'id';
-- Expected: 1 row, data_type = 'text'

-- V2: No "wp_id" column exists anywhere in DB
SELECT table_name, column_name
  FROM information_schema.columns
 WHERE column_name = 'wp_id';
-- Expected: 0 rows

-- V3: uq_templates_active_slot index exists
SELECT indexname FROM pg_indexes
 WHERE tablename = 'templates' AND indexname = 'uq_templates_active_slot';
-- Expected: 1 row

-- V4: pending_feedbacks table exists
SELECT COUNT(*) FROM information_schema.tables
 WHERE table_name = 'pending_feedbacks';
-- Expected: 1

-- V5: ideas table has domain_id column (v1.0.2 amendment)
SELECT column_name FROM information_schema.columns
 WHERE table_name = 'ideas' AND column_name IN ('domain_id','idea_type','decision_notes')
 ORDER BY column_name;
-- Expected: 3 rows

COMMIT;
