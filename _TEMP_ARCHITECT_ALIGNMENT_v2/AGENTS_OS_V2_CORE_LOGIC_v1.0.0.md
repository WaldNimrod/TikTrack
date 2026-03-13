# AGENTS_OS_V2_CORE_LOGIC v1.0.0

**project_domain:** AGENTS_OS  
**id:** TEAM_190_AGENTS_OS_V2_CORE_LOGIC_v1.0.0  
**from:** Team 190  
**to:** Chief Architect (Team 00)  
**date:** 2026-03-13  
**status:** SNAPSHOT (DETERMINISTIC CODE-DERIVED)

---

## 1) Engine Loop — Spec Builder ↔ Code Generator

### 1.1 Deterministic gate sequence (state machine)
Source: `copies/agents_os_v2/orchestrator/pipeline.py`
- `GATE_SEQUENCE`: `GATE_0 → GATE_1 → GATE_2 → WAITING_GATE2_APPROVAL → G3_PLAN → G3_5 → G3_6_MANDATES → CURSOR_IMPLEMENTATION → GATE_4 → GATE_5 → GATE_6 → WAITING_GATE6_APPROVAL → GATE_7 → GATE_8`

### 1.2 Spec Builder side
- `GATE_1` prompt explicitly defines:
  - Team 170 produces LLD400.
  - Team 190 validates LLD400.
- `GATE_2` prompt consumes `state.lld400_content` as the approved spec payload.

### 1.3 Code Generator side
- `G3_PLAN` builds implementation plan from approved spec.
- `G3_5` validates work plan.
- `G3_6_MANDATES` deterministically generates mandates (Team 20 / Team 30 / Team 50).
- `CURSOR_IMPLEMENTATION` drives implementation handoff execution.

### 1.4 Artifact handoff contract in state
`store_artifact()` mapping:
- `GATE_1` -> `state.lld400_content`
- `G3_PLAN` -> `state.work_plan`
- `CURSOR_IMPLEMENTATION` -> `state.implementation_files`

This is the concrete loop bridge between spec production and execution.

---

## 2) LOD400 Contract (new governance basis)

### 2.1 Canonical contract source
- `copies/documentation/docs-governance/05-CONTRACTS/GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md`

### 2.2 Contract clauses used by V2 flow
1. GATE_1 output must include AUTO_TESTABLE / HUMAN_ONLY classification for every acceptance criterion.
2. GATE_2 package must include residuals shell (`G7_HUMAN_RESIDUALS_MATRIX.md`) and confirmation classification is complete.
3. No transition across GATE_0/1/2 without decision artifact + WSM update by Team 190.

### 2.3 Program-level LOD400 evidence in AGENTS_OS lane
- `copies/_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_v1.0.0.md`
- `copies/_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_ADDENDUM_v1.0.0.md`
- `copies/_COMMUNICATION/team_00/TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_v1.0.0.md`

---

## 3) How V2 consumes SSM + WSM

### 3.1 State snapshot generation
Source: `copies/agents_os_v2/observers/state_reader.py`
- Reads canonical WSM path: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
- Reads canonical SSM path: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`
- Writes: `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json`

### 3.2 Pipeline startup coupling
Source: `copies/agents_os_v2/orchestrator/pipeline.py`
- `start_pipeline()` triggers state snapshot refresh (`update_snapshot()`) before initializing run state.

### 3.3 Prompt-level context injection
Source: `copies/agents_os_v2/context/injection.py`
- 4-layer model:
  1. team identity
  2. governance rules
  3. current state summary (from `STATE_SNAPSHOT.json`)
  4. task-specific gate request

---

## 4) Relevant ADRs

- `copies/_COMMUNICATION/_Architects_Decisions/ADR_026_AGENT_OS_FINAL_VERDICT.md`
- `copies/_COMMUNICATION/_Architects_Decisions/ADR_027_TEAM_100_TEAM_00_ARCHITECTURAL_CHARTER.md`
- `copies/_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0.md`
- `copies/_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT_v1.0.0.md`

---

## 5) Deterministic Conclusion

The v2 engine loop is implemented as a gate-driven state machine with explicit state-carried artifacts (`lld400_content`, `work_plan`, `implementation_files`), and runtime context is sourced from canonical SSM/WSM through `STATE_SNAPSHOT` injection.

---

**log_entry | TEAM_190 | AGENTS_OS_V2_CORE_LOGIC | SNAPSHOT_CREATED_FOR_RFM_190_02 | 2026-03-13**
