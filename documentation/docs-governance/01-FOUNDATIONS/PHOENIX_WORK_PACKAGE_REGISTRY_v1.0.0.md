
# PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PHOENIX_WORK_PACKAGE_REGISTRY  
**version:** 1.0.0  
**owner:** Work Package creation by Team 10 (execution); registry sync per PORTFOLIO_WSM_SYNC_RULES  
**date:** 2026-03-10  
**directive:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0

---

## Boundary

Each Work Package has **one** gate lifecycle. **current_gate** and **is_active** are mirrored from WSM; WSM is runtime SSOT. State **NO_ACTIVE_WORK_PACKAGE** is allowed when no WP is active.

---

## Schema

| Field | Description |
|-------|-------------|
| work_package_id | S{NNN}-P{NNN}-WP{NNN} |
| program_id | S{NNN}-P{NNN} |
| status | IN_PROGRESS \| CLOSED \| HOLD |
| current_gate | GATE_3 \| GATE_4 \| … \| GATE_8 \| GATE_8 (PASS) (mirror from WSM) |
| is_active | true \| false |
| active_marker_reason | Reason this WP is active, or `NO_ACTIVE_WORK_PACKAGE` when none |

---

## Work Packages

כל חבילת עבודה = sub של תוכנית. סדר: לפי program_id (Program Registry) ואז work_package_id.



| program_id | work_package_id | status | current_gate | is_active | active_marker_reason |
| --- | --- | --- | --- | --- | --- |
| S001-P001 | S001-P001-WP001 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-02-22 |
| S001-P001 | S001-P001-WP002 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-02-23 |
| S001-P002 | S001-P002-WP001 | IN_PROGRESS | GATE_0 | false | Deferred program activation; GATE_0 spec validation in progress; authorized per ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0 (2026-03-14) |
| S002-P001 | S002-P001-WP001 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-02-26 |
| S002-P001 | S002-P001-WP002 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-02-26 |
| S002-P002 | S002-P002-WP003 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-03-13 |
| S002-P003 | S002-P003-WP002 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-03-07 |
| S002-P005 | S002-P005-WP002 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-03-15 |
| S002-P005 | S002-P005-WP003 | IN_PROGRESS | GATE_1 | false | S002-P005-WP003 (State Alignment) — **GATE_0 PASS** (Team 190 revalidation confirmed); advancing to GATE_1; spec: `TEAM_100_AGENTS_OS_STATE_ALIGNMENT_WP003_LOD200_v1.0.0.md` |
| S003-P001 | S003-P001-WP001 | CLOSED | FAST_4 (PASS) | false | Data Model Validator deployed; FAST_4 CLOSED 2026-03-11 (Team 170 closure) |
| S003-P002 | S003-P002-WP001 | CLOSED | FAST_4 (PASS) | false | Test Template Generator deployed; G3.7 in gate chain; FAST_4 CLOSED 2026-03-12 (Team 170 closure) |
| S003-P003 | S003-P003-WP001 | IN_PROGRESS | GATE_2 | false | NORMAL — GATE_0 active (TikTrack S003-P003-WP001) |
| S003-P009 | S003-P009-WP001 | CLOSED | GATE_8 (PASS) | false | Pipeline Resilience Package — GATE_8 PASS 2026-03-18; Team 90 closure validation; DOCUMENTATION_CLOSED. |
| S003-P010 | S003-P010-WP001 | CLOSED | SPRINT_ACTIVE | false | SUPERVISED_SPRINT — Pipeline Core Reliability — DOCUMENTATION_CLOSED 2026-03-19 |
| S003-P011 | S003-P011-WP001 | CLOSED | COMPLETE (5-gate + GATE_8 doc closure) | false | Process Architecture v2.0 — GATE_5 PASS; Team 70 AS_MADE + archive 2026-03-19; `pipeline_state_agentsos.json` current_gate=COMPLETE. Next: WP002 Dashboard Copilot (activation pending). |
| S003-P011 | S003-P011-WP002 | IN_PROGRESS | GATE_2 | false | Pipeline Stabilization & Hardening — ACTIVE at GATE_2/2.1 (Team 101 LLD400 lane). Mirror aligned to WSM and `pipeline_state_agentsos.json` on 2026-03-20. |
| S003-P011 | S003-P011-WP099 | IN_PROGRESS | GATE_3 | true | HOLD — S003-P003-WP001 paused at G3_PLAN pending gate sequence canonicalization |



**Current active WP state (mirror from WSM):** **ACTIVE_WORK_PACKAGE_PRESENT** — WSM `active_stage_id=S003`, `active_program_id=S003-P011`, `current_gate=GATE_3`, `active_work_package_id=S003-P011-WP099`.

**Mirror source:** WSM CURRENT_OPERATIONAL_STATE (last update 2026-03-21). When no WP is active, no row has `is_active=true`; state is explicit in WSM and reflected here.

---

**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | v1.0.0_CREATED | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_B2_REMEDIATION | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_STAGE_S002_NO_ACTIVE_WP | 2026-02-24**
**log_entry | TEAM_190 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_GATE2_APPROVED_GATE3_NO_ACTIVE_WP_YET | 2026-02-25**
**log_entry | TEAM_190 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_WP002_G3_INTAKE_PENDING_TEAM10_OPEN_REQUIRED | 2026-02-26**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | TEAM_00_ALIGNMENT_SCOPE_EXTENSION_NOTE_APPLIED | 2026-03-02**
**log_entry | TEAM_90 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P003_WP002_G5_PASS_GATE6_ROUTING_PREPARATION_ACTIVE | 2026-03-04**
**log_entry | TEAM_90 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P003_WP002_G6_SUBMITTED_AWAITING_DECISION | 2026-03-04**
**log_entry | TEAM_90 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P003_WP002_REMEDIATION_EXECUTION_PACKAGE_ISSUED_TO_TEAM10 | 2026-03-04**
**log_entry | TEAM_90 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P003_WP002_G7_REJECTED_CODE_CHANGE_REQUIRED_SYNCED_TO_WSM | 2026-03-04**
**log_entry | TEAM_90 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P003_WP002_G5_BLOCKED_REMEDIATION_INCOMPLETE_SYNCED_TO_WSM | 2026-03-06**
**log_entry | TEAM_90 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P003_WP002_G5_PASS_GATE6_ROUTING_PREPARATION_ACTIVE_SYNCED_TO_WSM | 2026-03-06**
**log_entry | TEAM_90 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P003_WP002_G6_SUBMITTED_AWAITING_DECISION_SYNCED_TO_WSM | 2026-03-06**
**log_entry | TEAM_90 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P003_WP002_G6_APPROVED_GATE7_HUMAN_SIGNOFF_ACTIVE_SYNCED_TO_WSM | 2026-03-06**
**log_entry | TEAM_10 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_POST_GATE8_S002_P002_ACTIVE_NO_ACTIVE_WP | 2026-03-07**
**log_entry | TEAM_90 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P002_PRICE_RELIABILITY_TEAM190_REVALIDATION_PASS_GATE7_ACTIVE_NO_ACTIVE_WP | 2026-03-09**
**log_entry | TEAM_10 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P002_WP003_GATE7_BLOCK_TO_GATE3_REMEDIATION_SYNCED | 2026-03-11**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | S003_P001_WP001_FAST4_CLOSED_ADDED | 2026-03-11**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | S003_P002_WP001_FAST4_CLOSED_ADDED | 2026-03-12**
**log_entry | TEAM_00 | PHOENIX_WORK_PACKAGE_REGISTRY | S001_P002_WP001_REGISTERED_GATE_0_IN_PROGRESS_PER_ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0 | 2026-03-14**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P005_WP002_GATE1_PASS_MIRROR_SYNC_PER_WP002_FV_ACT01 | 2026-03-15**
**log_entry | TEAM_190 | PHOENIX_WORK_PACKAGE_REGISTRY | S003_P011_WP002_ACTIVE_ROW_ADDED_SYNC_TO_WSM_AND_PIPELINE_STATE | 2026-03-20**