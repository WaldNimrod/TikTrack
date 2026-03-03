# PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PHOENIX_WORK_PACKAGE_REGISTRY  
**version:** 1.0.0  
**owner:** Work Package creation by Team 10 (execution); registry sync per PORTFOLIO_WSM_SYNC_RULES  
**date:** 2026-02-23  
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
| S002-P001 | S002-P001-WP001 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-02-26 |
| S002-P001 | S002-P001-WP002 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-02-26 |
| S002-P003 | S002-P003-WP002 | IN_PROGRESS | GATE_7 (HUMAN_BROWSER_APPROVAL_ACTIVE) | true | S002-P003; GATE_6 APPROVED on WP002 (full scope: D22 + D33 + D34 + D35 + background-task orchestration); GATE_7 human browser approval is active and awaiting Nimrod decision |



**Current active WP state (mirror from WSM):** **ACTIVE_WORK_PACKAGE_PRESENT** — WSM `active_stage_id=S002`, `active_program_id=S002-P003`, `current_gate=GATE_7 (HUMAN_BROWSER_APPROVAL_ACTIVE)`, `active_work_package_id=S002-P003-WP002`.

**Mirror source:** WSM CURRENT_OPERATIONAL_STATE (last update 2026-03-03). When no WP is active, no row has `is_active=true`; state is explicit in WSM and reflected here.

---

**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | v1.0.0_CREATED | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_B2_REMEDIATION | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_STAGE_S002_NO_ACTIVE_WP | 2026-02-24**
**log_entry | TEAM_190 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_GATE2_APPROVED_GATE3_NO_ACTIVE_WP_YET | 2026-02-25**
**log_entry | TEAM_190 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_WP002_G3_INTAKE_PENDING_TEAM10_OPEN_REQUIRED | 2026-02-26**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | TEAM_00_ALIGNMENT_SCOPE_EXTENSION_NOTE_APPLIED | 2026-03-02**
