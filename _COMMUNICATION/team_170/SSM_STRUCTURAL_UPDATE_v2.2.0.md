# SSM Structural Update v2.2.0 — For Canonical Integration
**project_domain:** TIKTRACK

**id:** SSM_STRUCTURAL_UPDATE_v2.2.0  
**from:** Team 170 (Librarian)  
**to:** Team 10, Team 190  
**re:** TEAM_100_RETURN_FOR_CANONICAL_UPDATE_v2.2.0 — SSM integration  
**date:** 2026-02-20  

---

## 1. Canonical Hierarchy & Taxonomy (embed into SSM)

**Hierarchy:** Roadmap → Stage (שלב) → Program (תכנית) → Work Package (חבילת עבודה) → Task (משימה).  
**Rule:** Gate binding only to Work Package.  
**Identity header schema:** roadmap_id, stage_id, program_id, work_package_id, task_id (when applicable), gate_id, phase_owner, required_ssm_version, required_active_stage.  

(Full definitions and numbering format S{NNN}-P{NNN}-WP{NNN}-T{NNN} in 04_GATE_MODEL_PROTOCOL_v2.2.0.)

---

## 2. Role definitions (correct for Knowledge Promotion)

- **Knowledge Promotion Executor:** **Team 70 (Librarian) ONLY.** Team 170 must not retain promotion execution authority.  
- **Team 190:** Validation authority only for GATE_2 and GATE_8.  
- **Promotion authority (SSM):** Update from "Team 170 (proposal); promotion by Team 10 / Architect" to reflect: **promotion execution by Team 70 only**; Team 170 = SSOT/documentation integrity (no promotion execution); validation_authority = Team 190.

---

## 3. GATE_8 — DOCUMENTATION_CLOSURE

Add to SSM gate signer semantics: **Gate 8 (DOCUMENTATION_CLOSURE — AS_MADE_LOCK):** Owner Team 190; Executor Team 70. Purpose: AS_MADE_REPORT, Developer Guides update, clean communication folders, archive by Stage, canonical consistency. Lifecycle not complete without GATE_8 PASS.

---

**log_entry | TEAM_170 | SSM_STRUCTURAL_UPDATE_v2.2.0 | 2026-02-20**
