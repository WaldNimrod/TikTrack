# WSM Structural Update v2.2.0 — For Canonical Integration

**id:** WSM_STRUCTURAL_UPDATE_v2.2.0  
**from:** Team 170 (Librarian)  
**to:** Team 10, Team 190  
**re:** TEAM_100_RETURN_FOR_CANONICAL_UPDATE_v2.2.0 — WSM integration  
**date:** 2026-02-20  

---

## 1. Hierarchy and flow definitions (embed into WSM)

- **Hierarchy:** Roadmap → Stage → Program → Work Package → Task. English & Hebrew: Stage = שלב, Program = תכנית, Work Package = חבילת עבודה, Task = משימה.  
- **Numbering:** S{NNN}-P{NNN}-WP{NNN}-T{NNN}; prefix inheritance; no implicit numbering; no duplicates.  
- **Gate binding:** Only to Work Package (L3). All WSM execution gates (execution_start_gate, execution_end_gate) apply at work_package_id level.  
- **Mandatory identity header:** Every WSM artifact must carry roadmap_id, stage_id, program_id, work_package_id, task_id (when applicable), gate_id, phase_owner, required_ssm_version, required_active_stage.

---

## 2. Knowledge Promotion and GATE_8 in flow

- **GATE_2 (KNOWLEDGE_PROMOTION):** Executor **Team 70 (Librarian) ONLY.** Team 170 does not retain promotion execution in WSM flow definitions.  
- **GATE_8 (DOCUMENTATION_CLOSURE):** Owner Team 190; Executor Team 70. Trigger: GATE_7 PASS. Lifecycle not complete without GATE_8 PASS. WSM flow must reference GATE_8 as final gate before stage closure.

---

**log_entry | TEAM_170 | WSM_STRUCTURAL_UPDATE_v2.2.0 | 2026-02-20**
