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
| current_gate | GATE_3 \| GATE_4 \| … \| GATE_8 (mirror from WSM) |
| is_active | true \| false |
| active_marker_reason | Reason this WP is active, or `NO_ACTIVE_WORK_PACKAGE` when none |

---

## Work Packages

| work_package_id | program_id | status | current_gate | is_active | active_marker_reason |
|-----------------|-------------|--------|--------------|-----------|----------------------|
| S001-P001-WP001 | S001-P001 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-02-22 |
| S001-P001-WP002 | S001-P001 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-02-23 |

**Current active WP state (mirror from WSM):** **NO_ACTIVE_WORK_PACKAGE** — WSM `active_work_package_id=N/A`; `last_closed_work_package_id=S001-P001-WP002` (GATE_8 PASS 2026-02-23). No row has `is_active=true`.

**Mirror source:** WSM CURRENT_OPERATIONAL_STATE (last update 2026-02-23). When no WP is active, no row has `is_active=true`; state is explicit in WSM and reflected here.

---

**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | v1.0.0_CREATED | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | SYNC_WSM_B2_REMEDIATION | 2026-02-23**
