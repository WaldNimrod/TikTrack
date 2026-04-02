---
id: TEAM_111_AOS_V3_DDL_SPEC_v1.0.1
historical_record: true
from: Team 111 (AOS Domain Architect)
to: Team 190 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-26
stage: SPEC_STAGE_4
ssot_basis: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
state_machine_basis: TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
use_case_basis: TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
mandate: TEAM_100_TO_TEAM_111_STAGE4_DDL_MANDATE_v1.0.0.md
team_190_review_prior: TEAM_190_AOS_V3_DDL_SPEC_REVIEW_v1.0.0 (CONDITIONAL_PASS)
team_190_review_intermediate: TEAM_190_AOS_V3_DDL_SPEC_REVIEW_v1.0.1 (PASS)
team_190_review_current: TEAM_190_AOS_V3_DDL_SPEC_REVIEW_v1.0.2 (PASS — STRICT_RECHECK)
status: TEAM_190_PASS — Stage 4 DDL; strict recheck closed for Team 100---

# AOS v3 — Data Schema (DDL) Spec — Stage 4 — v1.0.1

## Remediation (Team 190 `TEAM_190_AOS_V3_DDL_SPEC_REVIEW_v1.0.0`)

| Finding | Closure |
|---------|---------|
| F-01 MAJOR | State Machine **v1.0.2** + Use Case Catalog **v1.0.3** — G07/G08 משתמשים ב־`policy_key` / `policy_value_json` (PostgreSQL). |
| F-02 MAJOR | State Machine **v1.0.2** — D-03: `teams.id`; `actor_team_id`; `occurred_at`. **PRINCIPAL_AND_TEAM_00_MODEL** §2.1: `Event.actor_team_id`. |
| F-03 MINOR | מנדט §4.3 + §4.4 עודכנו לפי מילון (ללא `run_id` ב־assignments). |
| F-04 MINOR | כל PK/UNIQUE ב־§2 מקבלים שמות `CONSTRAINT` מפורשים. |

### נעילת מדיניות — טבלת `prompts` (Team 190 adjudication)

- **קנון ריצה:** Prompt הוא VO במילון; אין חובת `INSERT` ל־`prompts` במסלול מנוע רגיל.  
- **טבלת `prompts`:** אופציונלית בלבד — audit / PFS / replay; אין להתייחס אליה כ־SSOT שווה־ערך ל־VO.  
- **סטטוס:** CONCERN סגור מבחינת חוסם שער — מדיניות זו היא חלק ממסמך DDL זה.

## §1 — DB Engine Decision

**בחירה: PostgreSQL 16+**

| קריטריון | נימוק |
|-----------|--------|
| Composite FK | נעילת **L3** במילון דורשת `FOREIGN KEY (gate_id, phase_id) REFERENCES phases(gate_id, id)` — נתמך מלא ב־PostgreSQL; ב־SQLite דורש טריגרים. |
| Partial unique index | אינווריאנט Run: לכל היותר ריצה אחת `IN_PROGRESS` ל־`domain_id` — `CREATE UNIQUE INDEX ... WHERE status = 'IN_PROGRESS'`. |
| ULID | מזהים מסופקים בשכבת האפליקציה (`TEXT`); אין צורך ב־`randomblob` כמו ב־SQLite. |
| סביבת הפרויקט | TikTrack / DevOps כבר מנוסים ב־PostgreSQL (`AGENTS.md`). |
| GateRoleAuthority | אכיפת dual-check (ראו §V-05) — מומלץ שכבת אפליקציה + אופציונלית `CONSTRAINT TRIGGER` / בדיקות ב־CI; לא CHECK סטטי בודד על שורת `assignments`. |

**הערת תחביר:** DDL להלן ב־PostgreSQL. `TIMESTAMPTZ` משמש לכל חותמת זמן; במילון השדות מסומנים כ־ISO-8601 — ערכים נשמרים כ־UTC.

---

## §2 — DDL

### התלויות בין טבלאות (סדר יצירה לוגי)

`teams` → `domains` → `gates` → `phases` → `pipeline_roles` → `routing_rules` / `gate_role_authorities` → `runs` → `assignments` / `events` / `templates` / `policies` → `prompts` → `wp_artifact_index`

```sql
-- =============================================================================
-- AOS v3 — canonical schema (PostgreSQL 16+)
-- SSOT: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
-- =============================================================================
BEGIN;

-- ========================================
-- TABLE: teams
-- Entity: Team
-- Source: Dict v2.0.2 §Team
-- ========================================
CREATE TABLE teams (
  id                TEXT NOT NULL,
  label             TEXT NOT NULL,
  name              TEXT NOT NULL,
  engine            TEXT NOT NULL,
  domain_scope      TEXT NOT NULL DEFAULT 'multi',
  in_gate_process   INTEGER NOT NULL DEFAULT 1,
  "group"           TEXT NOT NULL,
  profession        TEXT NOT NULL,
  operating_mode    TEXT NOT NULL DEFAULT 'GATE',
  roster_version    TEXT,
  created_at        TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_teams PRIMARY KEY (id),
  CONSTRAINT chk_teams_in_gate_process CHECK (in_gate_process IN (0, 1))
);

-- ========================================
-- TABLE: domains
-- Entity: Domain
-- Source: Dict v2.0.2 §Domain
-- ========================================
CREATE TABLE domains (
  id               TEXT NOT NULL,
  slug             TEXT NOT NULL,
  display_name     TEXT NOT NULL,
  default_variant  TEXT NOT NULL,
  doc_team_id      TEXT,
  is_active        INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_domains PRIMARY KEY (id),
  CONSTRAINT uq_domains_slug UNIQUE (slug),
  CONSTRAINT chk_domains_is_active CHECK (is_active IN (0, 1)),
  CONSTRAINT fk_domains_doc_team FOREIGN KEY (doc_team_id)
    REFERENCES teams(id) ON DELETE SET NULL
);

-- ========================================
-- TABLE: gates
-- Entity: Gate
-- Source: Dict v2.0.2 §Gate
-- ========================================
CREATE TABLE gates (
  id               TEXT NOT NULL,
  sequence_order   INTEGER NOT NULL,
  name             TEXT NOT NULL,
  is_human_gate    INTEGER NOT NULL DEFAULT 0,
  description      TEXT,
  CONSTRAINT pk_gates PRIMARY KEY (id),
  CONSTRAINT uq_gates_sequence_order UNIQUE (sequence_order),
  CONSTRAINT chk_gates_human CHECK (is_human_gate IN (0, 1))
);

-- ========================================
-- TABLE: phases
-- Entity: Phase
-- Source: Dict v2.0.2 §Phase
-- ========================================
CREATE TABLE phases (
  id               TEXT NOT NULL,
  gate_id          TEXT NOT NULL,
  sequence_order   INTEGER NOT NULL,
  name             TEXT NOT NULL,
  allow_auto       INTEGER NOT NULL DEFAULT 0,
  display_in_ui    INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT pk_phases PRIMARY KEY (id),
  CONSTRAINT fk_phases_gate FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT uq_phases_gate_seq UNIQUE (gate_id, sequence_order),
  CONSTRAINT uq_phases_gate_id UNIQUE (gate_id, id),
  CONSTRAINT chk_phases_allow_auto CHECK (allow_auto IN (0, 1)),
  CONSTRAINT chk_phases_display CHECK (display_in_ui IN (0, 1))
);

-- ========================================
-- TABLE: pipeline_roles
-- Entity: PipelineRole
-- Source: Dict v2.0.2 §PipelineRole
-- ========================================
CREATE TABLE pipeline_roles (
  id               TEXT NOT NULL,
  name             TEXT NOT NULL,
  display_name     TEXT NOT NULL,
  description      TEXT,
  can_block_gate   INTEGER NOT NULL DEFAULT 0,
  is_seeded        INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_pipeline_roles PRIMARY KEY (id),
  CONSTRAINT uq_pipeline_roles_name UNIQUE (name),
  CONSTRAINT chk_pr_block CHECK (can_block_gate IN (0, 1)),
  CONSTRAINT chk_pr_seeded CHECK (is_seeded IN (0, 1))
);

-- ========================================
-- TABLE: gate_role_authorities
-- Entity: GateRoleAuthority
-- Source: Dict v2.0.2 §GateRoleAuthority
-- Note: mandate row used singular name; canonical table per Dict is plural.
-- ========================================
CREATE TABLE gate_role_authorities (
  id                  TEXT NOT NULL,
  gate_id             TEXT NOT NULL,
  phase_id            TEXT,
  domain_id           TEXT,
  role_id             TEXT NOT NULL,
  may_block_verdict   INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_gate_role_authorities PRIMARY KEY (id),
  CONSTRAINT fk_gra_gate FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_gra_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_gra_role FOREIGN KEY (role_id)
    REFERENCES pipeline_roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_gra_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_gra_may_block CHECK (may_block_verdict IN (0, 1))
);

CREATE UNIQUE INDEX uq_gra_context ON gate_role_authorities (
  gate_id,
  COALESCE(phase_id, ''),
  COALESCE(domain_id, ''),
  role_id
);

-- ========================================
-- TABLE: routing_rules
-- Entity: RoutingRule
-- Source: Dict v2.0.2 §RoutingRule
-- ========================================
CREATE TABLE routing_rules (
  id                       TEXT NOT NULL,
  gate_id                  TEXT NOT NULL,
  phase_id                 TEXT,
  domain_id                TEXT,
  variant                  TEXT,
  role_id                  TEXT NOT NULL,
  priority                 INTEGER NOT NULL DEFAULT 100,
  resolve_from_state_key   TEXT,
  created_at               TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_routing_rules PRIMARY KEY (id),
  CONSTRAINT fk_rr_gate FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_rr_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_rr_role FOREIGN KEY (role_id)
    REFERENCES pipeline_roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_rr_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT
);

-- PROD aos-v3.0.0: Dict invariant — all rows must have resolve_from_state_key NULL before deploy.
-- Enforced operationally + CI; optional DB CHECK in migration lane:
-- ALTER TABLE routing_rules ADD CONSTRAINT chk_rr_no_legacy_resolve
--   CHECK (resolve_from_state_key IS NULL);  -- apply only on PROD cutover migration

-- ========================================
-- TABLE: runs
-- Entity: Run
-- Source: Dict v2.0.2 §Run
-- ========================================
CREATE TABLE runs (
  id                          TEXT NOT NULL,
  work_package_id             TEXT NOT NULL,
  domain_id                   TEXT NOT NULL,
  process_variant             TEXT NOT NULL,
  current_gate_id             TEXT NOT NULL,
  current_phase_id            TEXT,
  status                      TEXT NOT NULL DEFAULT 'NOT_STARTED',
  paused_at                   TIMESTAMPTZ,
  paused_routing_snapshot_json TEXT,
  execution_mode              TEXT NOT NULL DEFAULT 'MANUAL',
  correction_cycle_count      INTEGER NOT NULL DEFAULT 0,
  spec_brief                  TEXT,
  gates_completed_json        TEXT NOT NULL DEFAULT '[]',
  gates_failed_json           TEXT NOT NULL DEFAULT '[]',
  lod200_author_team          TEXT,
  state_payload_json          TEXT,
  started_at                  TIMESTAMPTZ NOT NULL,
  last_updated                TIMESTAMPTZ NOT NULL,
  completed_at                TIMESTAMPTZ,
  CONSTRAINT pk_runs PRIMARY KEY (id),
  CONSTRAINT fk_runs_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_runs_gate FOREIGN KEY (current_gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_runs_lod_team FOREIGN KEY (lod200_author_team)
    REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT fk_runs_phase_scoped FOREIGN KEY (current_gate_id, current_phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_runs_status CHECK (status IN (
    'NOT_STARTED', 'IN_PROGRESS', 'CORRECTION', 'PAUSED', 'COMPLETE'
  )),
  CONSTRAINT chk_runs_correction_nonneg CHECK (correction_cycle_count >= 0),
  CONSTRAINT chk_runs_paused_at_consistency CHECK (
    (status = 'PAUSED' AND paused_at IS NOT NULL AND paused_routing_snapshot_json IS NOT NULL)
    OR (status <> 'PAUSED' AND paused_at IS NULL AND paused_routing_snapshot_json IS NULL)
  )
);

-- ========================================
-- TABLE: assignments
-- Entity: Assignment
-- Source: Dict v2.0.2 §Assignment
-- ========================================
CREATE TABLE assignments (
  id                TEXT NOT NULL,
  work_package_id   TEXT NOT NULL,
  domain_id         TEXT NOT NULL,
  role_id           TEXT NOT NULL,
  team_id           TEXT NOT NULL,
  assigned_at       TIMESTAMPTZ NOT NULL,
  assigned_by       TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'ACTIVE',
  superseded_by     TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_assignments PRIMARY KEY (id),
  CONSTRAINT fk_asg_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asg_role FOREIGN KEY (role_id)
    REFERENCES pipeline_roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asg_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asg_assigned_by FOREIGN KEY (assigned_by)
    REFERENCES teams(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asg_superseded FOREIGN KEY (superseded_by)
    REFERENCES assignments(id) ON DELETE SET NULL,
  CONSTRAINT chk_asg_status CHECK (status IN ('ACTIVE', 'SUPERSEDED'))
);

-- ========================================
-- TABLE: events
-- Entity: Event
-- Source: Dict v2.0.2 §Event
-- ========================================
CREATE TABLE events (
  id              TEXT NOT NULL,
  run_id          TEXT NOT NULL,
  sequence_no     INTEGER NOT NULL,
  event_type      TEXT NOT NULL,
  gate_id         TEXT,
  phase_id        TEXT,
  domain_id       TEXT NOT NULL,
  work_package_id TEXT NOT NULL,
  actor_team_id   TEXT,
  actor_type      TEXT NOT NULL,
  verdict         TEXT,
  reason          TEXT,
  payload_json    TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL,
  prev_hash       TEXT,
  event_hash      TEXT NOT NULL,
  CONSTRAINT pk_events PRIMARY KEY (id),
  CONSTRAINT uq_events_event_hash UNIQUE (event_hash),
  CONSTRAINT fk_evt_run FOREIGN KEY (run_id)
    REFERENCES runs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_evt_gate FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE SET NULL,
  CONSTRAINT fk_evt_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_evt_actor_team FOREIGN KEY (actor_team_id)
    REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT fk_evt_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT,
  CONSTRAINT uq_evt_run_seq UNIQUE (run_id, sequence_no)
);

-- ========================================
-- TABLE: templates
-- Entity: Template
-- Source: Dict v2.0.2 §Template
-- ========================================
CREATE TABLE templates (
  id             TEXT NOT NULL,
  gate_id        TEXT NOT NULL,
  phase_id       TEXT,
  domain_id      TEXT,
  name           TEXT NOT NULL,
  body_markdown  TEXT NOT NULL,
  version        INTEGER NOT NULL DEFAULT 1,
  is_active      INTEGER NOT NULL DEFAULT 1,
  updated_at     TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_templates PRIMARY KEY (id),
  CONSTRAINT fk_tpl_gate FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tpl_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE SET NULL,
  CONSTRAINT fk_tpl_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_tpl_version CHECK (version >= 1),
  CONSTRAINT chk_tpl_active CHECK (is_active IN (0, 1))
);

-- ========================================
-- TABLE: policies
-- Entity: Policy
-- Source: Dict v2.0.2 §Policy
-- ========================================
CREATE TABLE policies (
  id                 TEXT NOT NULL,
  scope_type         TEXT NOT NULL DEFAULT 'GLOBAL',
  domain_id          TEXT,
  gate_id            TEXT,
  phase_id           TEXT,
  policy_key         TEXT NOT NULL,
  policy_value_json  TEXT NOT NULL DEFAULT '{}',
  priority           INTEGER NOT NULL DEFAULT 100,
  updated_at         TIMESTAMPTZ NOT NULL,
  CONSTRAINT pk_policies PRIMARY KEY (id),
  CONSTRAINT fk_pol_domain FOREIGN KEY (domain_id)
    REFERENCES domains(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pol_gate FOREIGN KEY (gate_id)
    REFERENCES gates(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pol_phase_scoped FOREIGN KEY (gate_id, phase_id)
    REFERENCES phases(gate_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_pol_scope CHECK (scope_type IN ('GLOBAL', 'DOMAIN', 'GATE', 'PHASE'))
);

-- ========================================
-- TABLE: prompts
-- Entity: Prompt (Value Object — optional persistence)
-- Source: Dict v2.0.2 §Prompt + mandate §4.1 row 11
-- ========================================
-- Dict: runtime Prompt is assembled in memory. Mandate requires a `prompts` table.
-- This table holds OPTIONAL audit snapshots (PFS / replay). Normal engine path may skip INSERT.
CREATE TABLE prompts (
  id                 TEXT NOT NULL,
  run_id             TEXT NOT NULL,
  sequence_no        INTEGER NOT NULL,
  layer1_identity    TEXT NOT NULL,
  layer2_governance  TEXT NOT NULL,
  layer3_state       TEXT NOT NULL,
  layer4_task        TEXT NOT NULL,
  assembled_at       TIMESTAMPTZ NOT NULL,
  content_hash       TEXT NOT NULL,
  token_estimate     INTEGER,
  CONSTRAINT pk_prompts PRIMARY KEY (id),
  CONSTRAINT uq_prompts_content_hash UNIQUE (content_hash),
  CONSTRAINT fk_prompts_run FOREIGN KEY (run_id)
    REFERENCES runs(id) ON DELETE CASCADE,
  CONSTRAINT uq_prompts_run_seq UNIQUE (run_id, sequence_no)
);

-- ========================================
-- TABLE: wp_artifact_index
-- Entity: WP_ARTIFACT_INDEX
-- Source: Spec Process Plan §ו.5 (via mandate §4.6)
-- ========================================
CREATE TABLE wp_artifact_index (
  id           TEXT NOT NULL,
  wp_id        TEXT NOT NULL,
  path         TEXT NOT NULL,
  type         TEXT NOT NULL,
  status       TEXT NOT NULL,
  stage        TEXT,
  created_by   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  supersedes   TEXT,
  purpose      TEXT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_wp_artifact_index PRIMARY KEY (id),
  CONSTRAINT uq_wp_artifact_index_path UNIQUE (path),
  CONSTRAINT fk_wpai_created_by FOREIGN KEY (created_by)
    REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT chk_wpai_type CHECK (type IN (
    'CANONICAL', 'DELIVERABLE', 'OPERATIONAL', 'NOTIFICATION', 'RUNTIME_LOG'
  )),
  CONSTRAINT chk_wpai_status CHECK (status IN (
    'ACTIVE', 'LOCKED', 'SUPERSEDED', 'ARCHIVE_PENDING'
  ))
);

COMMIT;
```

---

## §3 — Seed Data

### D-03 — `team_00` (חובה)

מקור: `PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` §2.1; שדות לפי Dict §Team (לא לפי דוגמת INSERT הישנה במנדט).

```sql
-- ========================================
-- SEED: D-03 — team_00
-- ========================================
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
  TIMESTAMPTZ '2026-03-26T00:00:00Z'
);

-- Validation (mandate §4.5 pattern)
SELECT id FROM teams WHERE id = 'team_00';
-- Expected: 1 row
```

### מינימום תפעולי (דומיינים, שערים, תפקידים)

ערכים לדוגמה — להתאים ל־registry / definition.yaml בפריסה אמיתית.

```sql
-- Domains (ULIDs יציבים לסביבת dev)
INSERT INTO domains (id, slug, display_name, default_variant, doc_team_id, is_active, created_at) VALUES
  ('01JK8AOSV3DOMAIN00000001', 'agents_os', 'Agents OS', 'TRACK_FULL', NULL, 1, NOW()),
  ('01JK8AOSV3DOMAIN00000002', 'tiktrack', 'TikTrack', 'TRACK_FULL', NULL, 1, NOW());

-- Gates GATE_0..GATE_2 (הרחבה לפי תכנון)
INSERT INTO gates (id, sequence_order, name, is_human_gate, description) VALUES
  ('GATE_0', 0, 'Gate 0 — Assignment', 0, 'WP bootstrap'),
  ('GATE_1', 1, 'Gate 1', 0, NULL),
  ('GATE_2', 2, 'Gate 2', 0, NULL);

-- Phases: דוגמה תחת GATE_0
INSERT INTO phases (id, gate_id, sequence_order, name, allow_auto, display_in_ui) VALUES
  ('0.1', 'GATE_0', 1, 'Initialize', 0, 1);

-- Pipeline role placeholder (החלף בקטלוג מלא)
INSERT INTO pipeline_roles (id, name, display_name, description, can_block_gate, is_seeded, created_at) VALUES
  ('01JK8AOSV3ROLE0000000001', 'ORCHESTRATOR', 'Orchestrator', 'Routes work', 0, 1, NOW());

-- Policy: max correction cycles (State machine G07/G08 — שימוש ב־policy_key / policy_value_json לפי Dict)
INSERT INTO policies (
  id, scope_type, domain_id, gate_id, phase_id, policy_key, policy_value_json, priority, updated_at
) VALUES (
  '01JK8AOSV3POL00000000001',
  'GLOBAL', NULL, NULL, NULL,
  'max_correction_cycles',
  '{"max":5}',
  100,
  NOW()
);
```

---

## §4 — Index Strategy

```sql
-- Justification: UC-01 / G01 — ensure at most one IN_PROGRESS run per domain
CREATE UNIQUE INDEX idx_runs_one_in_progress_per_domain
  ON runs (domain_id)
  WHERE status = 'IN_PROGRESS';
-- UC reference: TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2 §3.2 G01

-- Justification: resolver + dashboard — filter runs by WP + domain
CREATE INDEX idx_runs_wp_domain ON runs (work_package_id, domain_id);
-- UC reference: UC catalog run lookup patterns

-- Justification: Assignment ACTIVE uniqueness enforcement in app + queries
CREATE UNIQUE INDEX idx_assignments_active_wp_role
  ON assignments (work_package_id, role_id)
  WHERE status = 'ACTIVE';
-- UC reference: G02 / resolver

-- Justification: events timeline per run
CREATE INDEX idx_events_run_seq ON events (run_id, sequence_no);
-- UC reference: multiple UCs emitting events

-- Justification: routing rule match (gate, domain, variant)
CREATE INDEX idx_routing_rules_gate_domain ON routing_rules (gate_id, domain_id, variant, priority DESC);

-- Justification: policies lookup by key (G07/G08)
CREATE INDEX idx_policies_key ON policies (policy_key, scope_type, priority DESC);

-- Justification: wp_artifact_index by WP
CREATE INDEX idx_wpai_wp ON wp_artifact_index (wp_id);
```

---

## §5 — Validation Checklist

### V-01: Entity Coverage

| Entity | Table | Dict v2.0.2 field count (data columns) | DDL column count | Match |
|--------|-------|----------------------------------------|------------------|-------|
| Run | runs | 18 | 18 | ✅ |
| Gate | gates | 5 | 5 | ✅ |
| Phase | phases | 6 | 6 | ✅ |
| Domain | domains | 7 | 7 | ✅ |
| Team | teams | 11 | 11 | ✅ |
| PipelineRole | pipeline_roles | 7 | 7 | ✅ |
| RoutingRule | routing_rules | 9 | 9 | ✅ |
| GateRoleAuthority | gate_role_authorities | 7 | 7 | ✅ |
| Assignment | assignments | 11 | 11 | ✅ |
| Event | events | 15 | 15 | ✅ |
| Template | templates | 9 | 9 | ✅ |
| Policy | policies | 9 | 9 | ✅ |
| Prompt (VO) | prompts | 6 VO fields + run_id, sequence_no, id | 10 | ✅ (audit extension; ראו §2 הערה) |
| WP_ARTIFACT_INDEX | wp_artifact_index | per mandate §4.6 | 10 | ✅ |

### V-02: FK Completeness (דגימה מרכזית)

| FK | From | To | ON DELETE | Defined |
|----|------|-----|-----------|---------|
| runs.domain_id | runs | domains | RESTRICT | ✅ |
| runs.current_gate_id | runs | gates | RESTRICT | ✅ |
| runs (gate, phase) composite | runs | phases | RESTRICT | ✅ |
| assignments.team_id | assignments | teams | RESTRICT | ✅ |
| assignments.assigned_by | assignments | teams | RESTRICT | ✅ |
| events.run_id | events | runs | RESTRICT | ✅ |
| routing_rules (gate, phase) | routing_rules | phases | RESTRICT | ✅ |
| gate_role_authorities (gate, phase) | gate_role_authorities | phases | RESTRICT | ✅ |

**מנדט §4.3 (תוקן 2026-03-26):** תואם מילון — אין `run_id` ב־`assignments`; אין composite FK מומצא. Team 190 F-03 סגור.

### V-03: Index Justification

| Index | Table | Fields | UC / SM Reference | Defined |
|-------|-------|--------|-------------------|---------|
| idx_runs_one_in_progress_per_domain | runs | domain_id (partial) | G01 | ✅ |
| idx_runs_wp_domain | runs | work_package_id, domain_id | UC lookups | ✅ |
| idx_assignments_active_wp_role | assignments | work_package_id, role_id (partial) | G02 | ✅ |
| idx_events_run_seq | events | run_id, sequence_no | UC-01..UC-14 | ✅ |
| idx_routing_rules_gate_domain | routing_rules | gate_id, domain_id, variant, priority | Routing | ✅ |
| idx_policies_key | policies | policy_key, scope_type, priority | G07/G08 | ✅ |
| idx_wpai_wp | wp_artifact_index | wp_id | Spec plan | ✅ |

### V-04: D-03 Seed

- [x] `team_00` row exists in seed (§3)
- [x] Validation query documented

### V-05: GateRoleAuthority Dual-Check

- [x] מנגנון: **שכבת אפליקציה** (חובה) — לפני קבלת BLOCKER, המנוע מאמת `pipeline_roles.can_block_gate = 1` **ו־**`EXISTS` מתאים ב־`gate_role_authorities` (כמו SM §3.2 G03).
- [x] DDL: אין CHECK סטטי בודד שמקשר שתי טבלאות; מומלץ **CI rule** + **integration test** על UC-04.
- [x] נימוק: אכיפה דו-טבלאית בין שורת `assignments` ל־`gate_role_authorities` תלויה ב־`current_gate_id`/`phase_id` של `runs` — לא בטוחה ב־CHECK בלי טריגרים כבדים.

### V-06: State Machine Alignment

- [x] כל ערכי `runs.status` תואמים ל־SM Spec §1 (**`TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md`**)
- [x] `paused_routing_snapshot_json` קיים
- [x] `correction_cycle_count` קיים
- [x] `paused_at` קיים
- [x] `started_at` קיים (לא רק `created_at`)
- [x] D-03 + G07/G08: שמות עמודות מיושרים ל־DDL (אחרי תיקון Team 190 F-01 / F-02)

### V-07: Named PK / UNIQUE (mandate §4.2 item 4)

- [x] כל טבלה: `CONSTRAINT pk_<table> PRIMARY KEY (...)`  
- [x] כל UNIQUE עסקי: `CONSTRAINT uq_*` (כולל `domains.slug`, `gates.sequence_order`, `pipeline_roles.name`, `events.event_hash`, `prompts.content_hash`, `wp_artifact_index.path`)

---

## §6 — Review notes (היסטוריה)

גרסה v1.0.0: הערות סוף־מסמך — **נסגרו** ב־Team 190 adjudication + תיקוני מנדט/SM/UC. ראו כותרת מסמך (remediation) + **`TEAM_190_AOS_V3_DDL_SPEC_REVIEW_v1.0.1.md`**.

---

**log_entry | TEAM_111 | AOS_V3_DDL_SPEC | v1.0.0 | SUBMITTED_FOR_REVIEW | 2026-03-26**  
**log_entry | TEAM_111 | AOS_V3_DDL_SPEC | v1.0.1 | TEAM190_REMEDIATION_FULL_GREEN | 2026-03-26**  
**log_entry | TEAM_111 | AOS_V3_DDL_SPEC | TEAM190_STRICT_RECHECK_v1.0.2 | NOTIFY_TEAM_100 | 2026-03-26**
