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

כל תוכנית = sub של שלב. סדר: לפי stage_id (Roadmap) ואז program_id. דומיין: TikTrack או Agents_OS.



| stage_id | program_id | program_name | domain | status | current_gate_mirror |
| --- | --- | --- | --- | --- | --- |
| S001 | S001-P001 | Agents_OS Phase 1 | AGENTS_OS | COMPLETE | DOCUMENTATION_CLOSED (GATE_8 PASS 2026-02-23) |
| S001 | S001-P002 | Alerts POC (per SSM §5.1) | AGENTS_OS | HOLD | — (lock released 2026-02-22; activation decision pending Team 00) |
| S002 | S002-P001 | Agents_OS Core Validation Engine | AGENTS_OS | ACTIVE | GATE_3; active_flow=GATE_3_IN_PROGRESS (WP002); LLD400_VALIDATED_PASS; READY_FOR_G3.5_PLAN_VALIDATION; active_work_package_id=S002-P001-WP002 |
| S002 | S002-P002 | Full Pipeline Orchestrator | AGENTS_OS | PIPELINE | — (LOD200 concept ready; pending S002-P001 completion + Team 00 activation decision) |



**current_gate_mirror source:** WSM CURRENT_OPERATIONAL_STATE (last update 2026-02-26). Sync contract: `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`.

**WSM mirror (2026-02-26):** active_stage_id=S002; active_program_id=S002-P001; current_gate=GATE_3; active_work_package_id=S002-P001-WP002; active_flow=GATE_3_IN_PROGRESS (WP002); LLD400_VALIDATED_PASS; READY_FOR_G3.5_PLAN_VALIDATION.

---

**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | v1.0.0_CREATED | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | SYNC_WSM_B1_B5_REMEDIATION | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | SYNC_WSM_STAGE_S002_NO_ACTIVE_PROGRAM | 2026-02-24**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | S002_P001_ADDED_LLD400_SUBMITTED | 2026-02-24**
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | S002_P001_CORRECTED_GATE0_LOD200_SUBMITTED | 2026-02-24**
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | S002_P001_GATE0_PASS_GATE1_ACTIVE_TEAM_170_ACTIVATED | 2026-02-25**
**log_entry | TEAM_190 | PHOENIX_PROGRAM_REGISTRY | S002_P001_GATE2_APPROVED_GATE3_INTAKE_TEAM10_NEXT | 2026-02-25**
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | S002_P001_WP001_GATE8_PASS_WP002_ACTIVATED_S002_P002_PIPELINE_ADDED | 2026-02-26**
**log_entry | TEAM_190 | PHOENIX_PROGRAM_REGISTRY | SYNC_WSM_WP002_GATE3_INTAKE_PENDING_TEAM10_OPEN_REQUIRED | 2026-02-26**