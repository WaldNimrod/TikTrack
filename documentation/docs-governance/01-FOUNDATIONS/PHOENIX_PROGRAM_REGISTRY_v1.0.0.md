# PHOENIX_PROGRAM_REGISTRY_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PHOENIX_PROGRAM_REGISTRY  
**version:** 1.0.0  
**owner:** Team 100 / Team 00 (architectural); mirror sync per PORTFOLIO_WSM_SYNC_RULES  
**date:** 2026-02-23  
**directive:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0

---

## Boundary

Programs are **single-domain only**. **current_gate_mirror** is derived from WSM; it is not a runtime source. Runtime SSOT remains `PHOENIX_MASTER_WSM_v1.0.0.md` block CURRENT_OPERATIONAL_STATE.

---

## Schema

| Field | Description |
|-------|-------------|
| program_id | S{NNN}-P{NNN} |
| program_name | Short label |
| domain | Single domain only (e.g. AGENTS_OS, TIKTRACK) |
| stage_id | S{NNN} |
| status | ACTIVE \| CLOSED \| HOLD |
| current_gate_mirror | Mirror of current gate from WSM (informational; WSM is SSOT) |

---

## Programs

| program_id | program_name | domain | stage_id | status | current_gate_mirror |
|------------|--------------|--------|----------|--------|---------------------|
| S001-P001 | Agents_OS Phase 1 | AGENTS_OS | S001 | COMPLETE | DOCUMENTATION_CLOSED (GATE_8 PASS 2026-02-23) |
| S001-P002 | Alerts POC (per SSM §5.1) | AGENTS_OS | S001 | FROZEN | — (not activated; lock until S001-P001-WP001 GATE_8) |

**current_gate_mirror source:** WSM CURRENT_OPERATIONAL_STATE (last update 2026-02-23). Sync contract: `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`.

---

**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | v1.0.0_CREATED | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | SYNC_WSM_B1_B5_REMEDIATION | 2026-02-23**
