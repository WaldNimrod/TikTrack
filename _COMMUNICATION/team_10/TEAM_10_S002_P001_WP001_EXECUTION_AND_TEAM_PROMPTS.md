# S002-P001-WP001 — G3.4 Execution Plan and Team Prompts (Spec Validation Engine)

**project_domain:** AGENTS_OS  
**id:** TEAM_10_S002_P001_WP001_EXECUTION_AND_TEAM_PROMPTS  
**from:** Team 10 (Execution Orchestrator)  
**re:** G3.4 detailed build plan — tasks by team, sequence, dependencies, evidence  
**date:** 2026-02-25  
**status:** ACTIVE  
**gate_id:** GATE_3  
**phase_indicator:** G3.5 (submitted for validation)  
**work_package_id:** S002-P001-WP001  

---

## Mandatory identity header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | S002-P001-WP001 |
| task_id | N/A |
| gate_id | GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

## 1) Scope summary (from LLD400 §2.5)

WP001 delivers: shared validator base, LOD200/LLD400 templates (T001), 44 spec checks TIER 1–7, LLM quality gate, validation runner, tests. All under `agents_os/` or `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/`.

---

## 2) Teams in scope (TEAM_DEVELOPMENT_ROLE_MAPPING)

| Squad | In scope | Rationale |
|-------|----------|-----------|
| **Team 20** | YES | Backend/runtime: validators base, spec tiers, llm_gate, orchestrator, tests (Python) |
| **Team 70** | YES | Documentation: LOD200/LLD400 locked templates under documentation/ (exclusive write) |
| Team 30 | NO | No frontend in WP001 |
| Team 40 | NO | No UI assets in WP001 |
| Team 60 | Optional | Runner/CLI infra if needed; can be folded into Team 20 for WP001 |

---

## 3) Deterministic task sequence (G3.4 build plan)

### Phase A — Foundation (Team 20)

| Seq | Task ID | Deliverable / path | Team | Dependencies | Evidence output |
|-----|---------|---------------------|------|--------------|-----------------|
| A1 | T001-base-1 | `agents_os/validators/base/message_parser.py` | 20 | None | File + unit test path |
| A2 | T001-base-2 | `agents_os/validators/base/validator_base.py` | 20 | None | File + exit code protocol |
| A3 | T001-base-3 | `agents_os/validators/base/response_generator.py` | 20 | A2 | File |
| A4 | T001-base-4 | `agents_os/validators/base/seal_generator.py` | 20 | A2 | File (SOP-013) |
| A5 | T001-base-5 | `agents_os/validators/base/wsm_state_reader.py` | 20 | None | File (read-only) |
| A6 | T001-spec-1 | `agents_os/validators/spec/tier1_identity_header.py` (V-01–V-13) | 20 | A1–A5 | File + tests |
| A7 | T001-spec-2 | `agents_os/validators/spec/tier2_section_structure.py` (V-14–V-20) | 20 | A6, T001 templates | File + tests (gated on T001) |
| A8 | T001-spec-3 | `agents_os/validators/spec/tier3_gate_model.py` (V-21–V-24) | 20 | A6 | File + tests |
| A9 | T001-spec-4 | `agents_os/validators/spec/tier4_wsm_alignment.py` (V-25–V-29) | 20 | A5, A6 | File + tests |
| A10 | T001-spec-5 | `agents_os/validators/spec/tier5_domain_isolation.py` (V-30–V-33) | 20 | A6 | File + tests |
| A11 | T001-spec-6 | `agents_os/validators/spec/tier6_package_completeness.py` (V-34–V-41) | 20 | A6 | File + tests |
| A12 | T001-spec-7 | `agents_os/validators/spec/tier7_lod200_traceability.py` (V-42–V-44) | 20 | A6 | File + tests |
| A13 | T001-llm | `agents_os/llm_gate/quality_judge.py` (Q-01–Q-05) | 20 | A2 | File + tests (LLM mocked) |
| A14 | T001-runner | `agents_os/orchestrator/validation_runner.py` (CLI) | 20 | A6–A13 | File; produces PASS/BLOCK/HOLD |
| A15 | T001-tests | `agents_os/tests/spec/` (pytest) | 20 | A6–A14 | Test suite; all pass |

### Phase B — Templates (Team 70)

| Seq | Task ID | Deliverable / path | Team | Dependencies | Evidence output |
|-----|---------|---------------------|------|--------------|-----------------|
| B1 | T001-T70-1 | `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md` | 70 | None | File (locked) |
| B2 | T001-T70-2 | `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md` | 70 | None | File (locked) |

**Dependency note:** Tier2 (A7) is gated on T001; Team 20 may start A1–A6 and A8–A15 in parallel with B1–B2, then complete A7 once templates exist.

---

## 4) Execution order and handoffs

1. **Kick-off:** Team 10 issues mandate to Team 20 (Phase A) and Team 70 (Phase B) per prompts below.
2. **Team 70** delivers B1, B2 → evidence to Team 10; templates linked in WORK_PACKAGE_DEFINITION.
3. **Team 20** delivers A1–A15 in sequence (or A1–A6, A8–A15 in parallel; A7 after B1–B2).
4. **Team 10:** Collect completion reports; internal pre-check (G3.8); build GATE_3 exit package; submit to GATE_4 (QA).

---

## 5) Team prompts (mandate per squad)

### 5.1 Team 20 — Spec Validation Engine (backend)

**Mandate:** Implement all WP001 code deliverables under `agents_os/` per LLD400 §2.5: validators/base (message_parser, validator_base, response_generator, seal_generator, wsm_state_reader), validators/spec (tier1 through tier7 — 44 checks), llm_gate/quality_judge.py, orchestrator/validation_runner.py, tests in agents_os/tests/spec/. Use Phase A task sequence above. Domain isolation: no TikTrack imports. Deliver completion report to Team 10 with paths and pytest result.

### 5.2 Team 70 — Template locking (T001)

**Mandate:** Create and lock LOD200 and LLD400 templates under `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/` per LLD400 T001. Deliverables: LOD200_TEMPLATE_v1.0.0.md, LLD400_TEMPLATE_v1.0.0.md. Report completion to Team 10 with paths.

---

## 6) Evidence list (for G3.5 and GATE_3 exit)

| # | Evidence path | Owner |
|---|----------------|-------|
| 1 | agents_os/validators/base/*.py | Team 20 |
| 2 | agents_os/validators/spec/tier*.py | Team 20 |
| 3 | agents_os/llm_gate/quality_judge.py | Team 20 |
| 4 | agents_os/orchestrator/validation_runner.py | Team 20 |
| 5 | agents_os/tests/spec/ | Team 20 |
| 6 | documentation/.../02-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md | Team 70 |
| 7 | documentation/.../02-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md | Team 70 |
| 8 | Team 20 completion report | Team 20 |
| 9 | Team 70 completion report | Team 70 |

---

**log_entry | TEAM_10 | S002_P001_WP001 | EXECUTION_AND_TEAM_PROMPTS | G3_4_PLAN | 2026-02-25**
