-- =============================================================================
-- AOS v3 — COMPLETE FRESH SCHEMA — v1.0.2
-- Apply to: empty PostgreSQL 16+ database (empty → v1.0.2)
-- DDL Spec basis: TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md (Team 190 PASS)
-- v1.0.2 additions: DDL-ERRATA-01, ideas, work_packages, pending_feedbacks;
--                   teams.engine column (VARCHAR(50))
-- Mandate: TEAM_11_TO_TEAM_111_AOS_V3_BUILD_ACTIVATION_v1.0.0.md
-- Author: Team 111 (AOS Domain Architect)
-- Date: 2026-03-28
-- Branch: aos-v3
--
-- NAMING RULE (WP D.5 — IRON RULE):
--   work_packages.id  = DB primary key (TEXT)
--   "wp_id"           = API-layer alias ONLY — never a column name in DB
--
-- APPLY ORDER (single transaction — empty DB):
--   teams → domains → gates → phases → pipeline_roles →
--   gate_role_authorities → routing_rules → work_packages (no linked_run FK yet) →
--   runs → assignments → events → templates → policies → prompts →
--   wp_artifact_index → ideas → pending_feedbacks →
--   ALTER TABLE work_packages ADD FK linked_run_id → runs
--   ALTER TABLE runs / assignments / events ADD FK → work_packages
--   indexes
-- =============================================================================

BEGIN;

-- ============================================================================
-- TABLE: teams
-- ============================================================================
CREATE TABLE teams (
  id                VARCHAR(50)  NOT NULL,
  label             TEXT         NOT NULL,
  name              TEXT         NOT NULL,
  engine            VARCHAR(50)  NOT NULL,
  domain_scope      TEXT         NOT NULL DEFAULT 'multi',
  in_gate_process   INTEGER      NOT NULL DEFAULT 1,
  "group"           TEXT         NOT NULL,
  profession        TEXT         NOT NULL,
  operating_mode    TEXT         NOT NULL DEFAULT 'GATE',
  roster_version    TEXT,
  created_at        TIMESTAMPTZ  NOT NULL,
  CONSTRAINT pk_teams PRIMARY KEY (id),
  CONSTRAINT chk_teams_in_gate_process CHECK (in_gate_process IN (0, 1))
);

-- ============================================================================
-- TABLE: domains
-- ============================================================================
CREATE TABLE domains (
  id               TEXT        NOT NULL,
  slug             TEXT        NOT NULL,
  display_name     TEXT        NOT NULL,
  default_variant  TEXT        NOT NULL,
  doc_team_id      VARCHAR(50),
  is_active        INTEGER     NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_domains PRIMARY KEY (id),
  CONSTRAINT uq_domains_slug UNIQUE (slug),
  CONSTRAINT chk_domains_is_active CHECK (is_active IN (0, 1)),
  CONSTRAINT fk_domains_doc_team FOREIGN KEY (doc_team_id)
    REFERENCES teams(id) ON DELETE SET NULL
);

-- ============================================================================
-- TABLE: gates
-- ============================================================================
CREATE TABLE gates (
  id               TEXT    NOT NULL,
  sequence_order   INTEGER NOT NULL,
  name             TEXT    NOT NULL,
  is_human_gate    INTEGER NOT NULL DEFAULT 0,
  description      TEXT,
  CONSTRAINT pk_gates PRIMARY KEY (id),
  CONSTRAINT uq_gates_sequence_order UNIQUE (sequence_order),
  CONSTRAINT chk_gates_human CHECK (is_human_gate IN (0, 1))
);

-- ============================================================================
-- TABLE: phases
-- ============================================================================
CREATE TABLE phases (
  id               TEXT    NOT NULL,
  gate_id          TEXT    NOT NULL,
  sequence_order   INTEGER NOT NULL,
  name             TEXT    NOT NULL,
  allow_auto       INTEGER NOT NULL DEFAULT 0,
  display_in_ui    INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT pk_phases PRIMARY KEY (id),
  CONSTRAINT fk_phases_gate FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT uq_phases_gate_seq  UNIQUE (gate_id, sequence_order),
  CONSTRAINT uq_phases_gate_id   UNIQUE (gate_id, id),
  CONSTRAINT chk_phases_allow_auto CHECK (allow_auto IN (0, 1)),
  CONSTRAINT chk_phases_display   CHECK (display_in_ui IN (0, 1))
);

-- ============================================================================
-- TABLE: pipeline_roles
-- ============================================================================
CREATE TABLE pipeline_roles (
  id               TEXT        NOT NULL,
  name             TEXT        NOT NULL,
  display_name     TEXT        NOT NULL,
  description      TEXT,
  can_block_gate   INTEGER     NOT NULL DEFAULT 0,
  is_seeded        INTEGER     NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_pipeline_roles PRIMARY KEY (id),
  CONSTRAINT uq_pipeline_roles_name UNIQUE (name),
  CONSTRAINT chk_pr_block  CHECK (can_block_gate IN (0, 1)),
  CONSTRAINT chk_pr_seeded CHECK (is_seeded IN (0, 1))
);

-- ============================================================================
-- TABLE: gate_role_authorities
-- ============================================================================
CREATE TABLE gate_role_authorities (
  id                  TEXT        NOT NULL,
  gate_id             TEXT        NOT NULL,
  phase_id            TEXT,
  domain_id           TEXT,
  role_id             TEXT        NOT NULL,
  may_block_verdict   INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_gate_role_authorities PRIMARY KEY (id),
  CONSTRAINT fk_gra_gate   FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_gra_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_gra_role   FOREIGN KEY (role_id)
    REFERENCES pipeline_roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_gra_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_gra_may_block CHECK (may_block_verdict IN (0, 1))
);

CREATE UNIQUE INDEX uq_gra_context ON gate_role_authorities (
  gate_id,
  COALESCE(phase_id,  ''),
  COALESCE(domain_id, ''),
  role_id
);

-- ============================================================================
-- TABLE: routing_rules
-- ============================================================================
CREATE TABLE routing_rules (
  id                       TEXT        NOT NULL,
  gate_id                  TEXT        NOT NULL,
  phase_id                 TEXT,
  domain_id                TEXT,
  variant                  TEXT,
  role_id                  TEXT        NOT NULL,
  priority                 INTEGER     NOT NULL DEFAULT 100,
  resolve_from_state_key   TEXT,
  created_at               TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_routing_rules PRIMARY KEY (id),
  CONSTRAINT fk_rr_gate   FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_rr_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_rr_role   FOREIGN KEY (role_id)
    REFERENCES pipeline_roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_rr_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT
);
-- Note: resolve_from_state_key must be NULL on PROD cutover (Dict invariant).
-- Optional CI-lane migration: ALTER TABLE routing_rules ADD CONSTRAINT
--   chk_rr_no_legacy_resolve CHECK (resolve_from_state_key IS NULL);

-- ============================================================================
-- TABLE: work_packages  (NEW in v1.0.2)
-- PK = id (TEXT).  API alias "wp_id" is application-layer only — not a column.
-- NOTE: linked_run_id FK → runs is added after runs is created (see ALTER below).
-- ============================================================================
CREATE TABLE work_packages (
  id              TEXT        NOT NULL,
  label           TEXT        NOT NULL,
  domain_id       TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'PLANNED',
  linked_run_id   TEXT,                        -- FK added after runs exists
  created_at      TIMESTAMPTZ NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_work_packages PRIMARY KEY (id),
  CONSTRAINT fk_wp_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT chk_wp_status CHECK (status IN (
    'PLANNED', 'ACTIVE', 'COMPLETE', 'CANCELLED'
  ))
);

-- ============================================================================
-- TABLE: runs
-- ============================================================================
CREATE TABLE runs (
  id                           TEXT        NOT NULL,
  work_package_id              TEXT        NOT NULL,
  domain_id                    TEXT        NOT NULL,
  process_variant              TEXT        NOT NULL,
  current_gate_id              TEXT        NOT NULL,
  current_phase_id             TEXT,
  status                       TEXT        NOT NULL DEFAULT 'NOT_STARTED',
  paused_at                    TIMESTAMPTZ,
  paused_routing_snapshot_json TEXT,
  execution_mode               TEXT        NOT NULL DEFAULT 'MANUAL',
  correction_cycle_count       INTEGER     NOT NULL DEFAULT 0,
  spec_brief                   TEXT,
  gates_completed_json         TEXT        NOT NULL DEFAULT '[]',
  gates_failed_json            TEXT        NOT NULL DEFAULT '[]',
  lod200_author_team           VARCHAR(50),
  state_payload_json           TEXT,
  started_at                   TIMESTAMPTZ NOT NULL,
  last_updated                 TIMESTAMPTZ NOT NULL,
  completed_at                 TIMESTAMPTZ,
  CONSTRAINT pk_runs PRIMARY KEY (id),
  CONSTRAINT fk_runs_work_package FOREIGN KEY (work_package_id)
    REFERENCES work_packages(id) ON DELETE RESTRICT,
  CONSTRAINT fk_runs_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_runs_gate  FOREIGN KEY (current_gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_runs_lod_team FOREIGN KEY (lod200_author_team)
    REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT fk_runs_phase_scoped FOREIGN KEY (current_gate_id, current_phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_runs_status CHECK (status IN (
    'NOT_STARTED', 'IN_PROGRESS', 'CORRECTION', 'PAUSED', 'COMPLETE'
  )),
  CONSTRAINT chk_runs_correction_nonneg CHECK (correction_cycle_count >= 0),
  CONSTRAINT chk_runs_paused_consistency CHECK (
    (status = 'PAUSED'
     AND paused_at IS NOT NULL
     AND paused_routing_snapshot_json IS NOT NULL)
    OR
    (status <> 'PAUSED'
     AND paused_at IS NULL
     AND paused_routing_snapshot_json IS NULL)
  )
);

-- ============================================================================
-- TABLE: assignments
-- ============================================================================
CREATE TABLE assignments (
  id                TEXT        NOT NULL,
  work_package_id   TEXT        NOT NULL,
  domain_id         TEXT        NOT NULL,
  role_id           TEXT        NOT NULL,
  team_id           VARCHAR(50) NOT NULL,
  assigned_at       TIMESTAMPTZ NOT NULL,
  assigned_by       VARCHAR(50) NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'ACTIVE',
  superseded_by     TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_assignments PRIMARY KEY (id),
  CONSTRAINT fk_asg_work_package FOREIGN KEY (work_package_id)
    REFERENCES work_packages(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asg_domain  FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asg_role    FOREIGN KEY (role_id)
    REFERENCES pipeline_roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asg_team    FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asg_assigned_by FOREIGN KEY (assigned_by)
    REFERENCES teams(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asg_superseded  FOREIGN KEY (superseded_by)
    REFERENCES assignments(id) ON DELETE SET NULL,
  CONSTRAINT chk_asg_status CHECK (status IN ('ACTIVE', 'SUPERSEDED'))
);

-- ============================================================================
-- TABLE: events
-- ============================================================================
CREATE TABLE events (
  id              TEXT        NOT NULL,
  run_id          TEXT        NOT NULL,
  sequence_no     INTEGER     NOT NULL,
  event_type      TEXT        NOT NULL,
  gate_id         TEXT,
  phase_id        TEXT,
  domain_id       TEXT        NOT NULL,
  work_package_id TEXT        NOT NULL,
  actor_team_id   VARCHAR(50),
  actor_type      TEXT        NOT NULL,
  verdict         TEXT,
  reason          TEXT,
  payload_json    TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL,
  prev_hash       TEXT,
  event_hash      TEXT        NOT NULL,
  CONSTRAINT pk_events PRIMARY KEY (id),
  CONSTRAINT uq_events_event_hash UNIQUE (event_hash),
  CONSTRAINT uq_evt_run_seq       UNIQUE (run_id, sequence_no),
  CONSTRAINT fk_evt_run   FOREIGN KEY (run_id)
    REFERENCES runs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_evt_work_package FOREIGN KEY (work_package_id)
    REFERENCES work_packages(id) ON DELETE RESTRICT,
  CONSTRAINT fk_evt_gate  FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE SET NULL,
  CONSTRAINT fk_evt_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_evt_actor_team FOREIGN KEY (actor_team_id)
    REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT fk_evt_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLE: templates
-- ============================================================================
CREATE TABLE templates (
  id             TEXT        NOT NULL,
  gate_id        TEXT        NOT NULL,
  phase_id       TEXT,
  domain_id      TEXT,
  name           TEXT        NOT NULL,
  body_markdown  TEXT        NOT NULL,
  version        INTEGER     NOT NULL DEFAULT 1,
  is_active      INTEGER     NOT NULL DEFAULT 1,
  updated_at     TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_templates PRIMARY KEY (id),
  CONSTRAINT fk_tpl_gate   FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tpl_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE SET NULL,
  CONSTRAINT fk_tpl_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_tpl_version CHECK (version >= 1),
  CONSTRAINT chk_tpl_active  CHECK (is_active IN (0, 1))
);

-- ============================================================================
-- TABLE: policies
-- ============================================================================
CREATE TABLE policies (
  id                 TEXT        NOT NULL,
  scope_type         TEXT        NOT NULL DEFAULT 'GLOBAL',
  domain_id          TEXT,
  gate_id            TEXT,
  phase_id           TEXT,
  policy_key         TEXT        NOT NULL,
  policy_value_json  TEXT        NOT NULL DEFAULT '{}',
  priority           INTEGER     NOT NULL DEFAULT 100,
  updated_at         TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_policies PRIMARY KEY (id),
  CONSTRAINT fk_pol_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pol_gate   FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pol_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_pol_scope CHECK (scope_type IN ('GLOBAL', 'DOMAIN', 'GATE', 'PHASE'))
);

-- ============================================================================
-- TABLE: prompts  (optional audit / PFS / replay — VO; normal engine may skip INSERT)
-- ============================================================================
CREATE TABLE prompts (
  id                 TEXT        NOT NULL,
  run_id             TEXT        NOT NULL,
  sequence_no        INTEGER     NOT NULL,
  layer1_identity    TEXT        NOT NULL,
  layer2_governance  TEXT        NOT NULL,
  layer3_state       TEXT        NOT NULL,
  layer4_task        TEXT        NOT NULL,
  assembled_at       TIMESTAMPTZ NOT NULL,
  content_hash       TEXT        NOT NULL,
  token_estimate     INTEGER,
  CONSTRAINT pk_prompts PRIMARY KEY (id),
  CONSTRAINT uq_prompts_content_hash UNIQUE (content_hash),
  CONSTRAINT uq_prompts_run_seq      UNIQUE (run_id, sequence_no),
  CONSTRAINT fk_prompts_run FOREIGN KEY (run_id)
    REFERENCES runs(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: wp_artifact_index
-- NOTE: column is "work_package_id" (not "wp_id") per WP D.5 naming rule.
-- ============================================================================
CREATE TABLE wp_artifact_index (
  id               TEXT        NOT NULL,
  work_package_id  TEXT        NOT NULL,      -- WP D.5 naming rule: NOT wp_id
  path             TEXT        NOT NULL,
  type             TEXT        NOT NULL,
  status           TEXT        NOT NULL,
  stage            TEXT,
  created_by       VARCHAR(50),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  supersedes       TEXT,
  purpose          TEXT,
  last_updated     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_wp_artifact_index PRIMARY KEY (id),
  CONSTRAINT uq_wp_artifact_index_path UNIQUE (path),
  CONSTRAINT fk_wpai_work_package FOREIGN KEY (work_package_id)
    REFERENCES work_packages(id) ON DELETE RESTRICT,
  CONSTRAINT fk_wpai_created_by FOREIGN KEY (created_by)
    REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT chk_wpai_type CHECK (type IN (
    'CANONICAL', 'DELIVERABLE', 'OPERATIONAL', 'NOTIFICATION', 'RUNTIME_LOG'
  )),
  CONSTRAINT chk_wpai_status CHECK (status IN (
    'ACTIVE', 'LOCKED', 'SUPERSEDED', 'ARCHIVE_PENDING'
  ))
);

-- ============================================================================
-- TABLE: ideas  (NEW in v1.0.2 — full definition per UI Spec v1.1.0 §13.2)
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

-- ============================================================================
-- TABLE: pending_feedbacks  (NEW in v1.0.2 — per UI Spec v1.1.0 §13.1)
-- Stores FeedbackRecord from the Feedback Ingestion Pipeline (FIP).
-- Idempotency guard: at most one row per run_id with cleared_at IS NULL.
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

-- ============================================================================
-- DEFERRED FKs — resolve circular dependency work_packages ↔ runs
-- ============================================================================

-- work_packages.linked_run_id → runs.id  (nullable — WP may exist before any run)
ALTER TABLE work_packages
  ADD CONSTRAINT fk_wp_linked_run FOREIGN KEY (linked_run_id)
    REFERENCES runs(id) ON DELETE SET NULL;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Invariant: at most one IN_PROGRESS run per domain (SM §3.2 G01)
CREATE UNIQUE INDEX idx_runs_one_in_progress_per_domain
  ON runs (domain_id)
  WHERE status = 'IN_PROGRESS';

-- Run lookup by WP + domain
CREATE INDEX idx_runs_wp_domain ON runs (work_package_id, domain_id);

-- Active assignment uniqueness per WP+role (G02)
CREATE UNIQUE INDEX idx_assignments_active_wp_role
  ON assignments (work_package_id, role_id)
  WHERE status = 'ACTIVE';

-- Event timeline per run
CREATE INDEX idx_events_run_seq ON events (run_id, sequence_no);

-- Routing rule match
CREATE INDEX idx_routing_rules_gate_domain
  ON routing_rules (gate_id, domain_id, variant, priority DESC);

-- Policy lookup by key (G07/G08)
CREATE INDEX idx_policies_key
  ON policies (policy_key, scope_type, priority DESC);

-- WP artifact lookup
CREATE INDEX idx_wpai_wp ON wp_artifact_index (work_package_id);

-- DDL-ERRATA-01: Active-slot uniqueness on templates
-- Enforces: at most one active template per (gate, phase, domain, name) slot.
-- Enables get_active_template() to guarantee a deterministic single result.
CREATE UNIQUE INDEX uq_templates_active_slot
  ON templates (gate_id, COALESCE(phase_id, ''), COALESCE(domain_id, ''), name)
  WHERE is_active = 1;

-- ideas lookup indexes
CREATE INDEX idx_ideas_status   ON ideas (status);
CREATE INDEX idx_ideas_priority ON ideas (priority);
CREATE INDEX idx_ideas_domain   ON ideas (domain_id);
CREATE INDEX idx_ideas_type     ON ideas (idea_type);

-- pending_feedbacks lookup
CREATE INDEX idx_pf_run_id      ON pending_feedbacks (run_id);
CREATE INDEX idx_pf_ingested_at ON pending_feedbacks (ingested_at);

-- work_packages lookup
CREATE INDEX idx_wp_domain  ON work_packages (domain_id);
CREATE INDEX idx_wp_status  ON work_packages (status);

-- ============================================================================
-- SEED DATA — minimal operational seed (D-03 mandatory + dev stubs)
-- ============================================================================

-- D-03: team_00 (mandatory per PRINCIPAL_AND_TEAM_00_MODEL §2.1)
INSERT INTO teams (
  id, label, name, engine, domain_scope, in_gate_process,
  "group", profession, operating_mode, roster_version, created_at
) VALUES (
  'team_00',
  'Team 00',
  'System Designer (Principal / human operator)',
  'human',
  'multi',
  1,
  'leadership',
  'principal',
  'GATE',
  '1.6.0',
  '2026-03-26T00:00:00Z'
);

-- Domains (stable ULIDs for dev; replace with runtime-generated ULIDs on PROD)
INSERT INTO domains (id, slug, display_name, default_variant, doc_team_id, is_active, created_at) VALUES
  ('01JK8AOSV3DOMAIN00000001', 'agents_os', 'Agents OS', 'TRACK_FULL', NULL, 1, NOW()),
  ('01JK8AOSV3DOMAIN00000002', 'tiktrack',  'TikTrack',  'TRACK_FULL', NULL, 1, NOW());

-- Gates GATE_0..GATE_5 (active pipeline per WSM GATE_0..GATE_5)
INSERT INTO gates (id, sequence_order, name, is_human_gate, description) VALUES
  ('GATE_0', 0, 'Gate 0 — Assignment',         0, 'WP bootstrap and team assignment'),
  ('GATE_1', 1, 'Gate 1 — Spec',               0, 'Specification delivery'),
  ('GATE_2', 2, 'Gate 2 — Arch Approval',      0, 'Architecture approval (Team 100)'),
  ('GATE_3', 3, 'Gate 3 — Implementation',     0, 'Implementation delivery'),
  ('GATE_4', 4, 'Gate 4 — UX Sign-off',        1, 'UX/vision sign-off (Nimrod)'),
  ('GATE_5', 5, 'Gate 5 — Lifecycle Close',    0, 'Lifecycle closure');

-- Phase stubs under GATE_0 (expand per spec)
INSERT INTO phases (id, gate_id, sequence_order, name, allow_auto, display_in_ui) VALUES
  ('0.1', 'GATE_0', 1, 'Initialize', 0, 1),
  ('0.2', 'GATE_0', 2, 'Assign',     0, 1);

-- Pipeline role stub (replace with full catalog)
INSERT INTO pipeline_roles (id, name, display_name, description, can_block_gate, is_seeded, created_at) VALUES
  ('01JK8AOSV3ROLE0000000001', 'ORCHESTRATOR', 'Orchestrator', 'Routes work', 0, 1, NOW());

-- Policy: max correction cycles (SM G07/G08)
INSERT INTO policies (
  id, scope_type, domain_id, gate_id, phase_id,
  policy_key, policy_value_json, priority, updated_at
) VALUES (
  '01JK8AOSV3POL00000000001',
  'GLOBAL', NULL, NULL, NULL,
  'max_correction_cycles',
  '{"max":5}',
  100,
  NOW()
);

-- Validation
SELECT id FROM teams WHERE id = 'team_00';
-- Expected: 1 row

COMMIT;
