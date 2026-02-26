---
**project_domain:** AGENTS_OS
**id:** S002_P001_WP002_EXECUTION_VALIDATOR_ARCHITECTURAL_CONCEPT_v1.0.0
**from:** Team 100 (Development Architecture Authority)
**to:** Team 10, Team 170
**date:** 2026-02-26
**status:** ACTIVE — IMMEDIATE EXECUTION
**purpose:** Full canonical architectural concept for WP002 — Execution Validation Engine (10→90 flow). Guides Team 170 LLD400 production and Team 10 execution.
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | S002-P001-WP002 |
| task_id | N/A |
| gate_id | N/A (pre-GATE_3) |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

# S002-P001-WP002 — EXECUTION VALIDATOR: FULL ARCHITECTURAL CONCEPT v1.0.0

---

## 1) Context and Dependency

### Program context

This work package is the **second and final work package** under `S002-P001 — Agents_OS Core Validation Engine`. The program contains two WPs:

```
S002-P001
├── WP001 — Spec Validation Engine (170→190 flow)    ← GATE_8 PASS 2026-02-26 ✅
└── WP002 — Execution Validation Engine (10→90 flow) ← THIS DOCUMENT
```

### Dependency status

| Dependency | Requirement | Status |
|---|---|---|
| WP001 shared base infrastructure | WP001 must reach GATE_4 before WP002 opens | ✅ CLEARED — WP001 GATE_8 PASS 2026-02-26 |
| `agents_os/validators/base/` | Base classes, parsers, generators built and tested | ✅ PRESENT |
| `agents_os/llm_gate/quality_judge.py` | LLM quality gate framework | ✅ PRESENT |
| `agents_os/orchestrator/validation_runner.py` | CLI runner base | ✅ PRESENT — WP002 extends it |

**All dependencies cleared. WP002 may open immediately under GATE_3.**

---

## 2) Purpose

WP002 builds the **automated validator for work package execution submissions** flowing through the `Team 10 → Team 90` channel.

Currently, Team 90 manually reviews each execution submission against 11 quality criteria. WP002 automates this process with:
- 6 deterministic work plan integrity checks (TIER E1)
- 5 deterministic code quality checks (TIER E2)
- LLM quality gate (5 prompts — reusing WP001 framework)
- CLI runner extension (phases: G3.5 and GATE_5)

**This is the final piece of S002-P001. When WP002 reaches GATE_8, the program is complete.**

---

## 3) Two-Phase Routing Architecture

The execution validator operates in **two phases** within the gate lifecycle:

```
GATE_3 intake
    └── G3.5 (WORK_PACKAGE_VALIDATION_WITH_TEAM_90)
            │
            ▼
    PHASE 1 — WORK PLAN VALIDATION
    Validator: execution/tier_e1_work_plan.py
    Scope: TIER E1 only (E-01–E-06)
    Input: Work package definition submitted by Team 10
    Output: PASS (proceed to development) | BLOCK (return to Team 10)
            │
            ▼ [development proceeds — Team 20 / Team 70]
            │
    GATE_5 (DEV_VALIDATION)
            │
            ▼
    PHASE 2 — EXECUTION QUALITY VALIDATION
    Validator: execution/tier_e1_work_plan.py + execution/tier_e2_code_quality.py
    Scope: TIER E1 (re-run) + TIER E2 (E-07–E-11) + LLM quality gate
    Input: Completed execution submission (artifacts + code)
    Output: exit_code=0 PASS | exit_code=1 BLOCK | exit_code=2 HOLD (LLM)
```

**Phase 1 at G3.5:** validates governance completeness of the work plan *before* development starts. Catch structural problems early.

**Phase 2 at GATE_5:** validates both governance (re-run TIER E1 with full evidence) and code quality (TIER E2). Confirms "what was built" is complete and clean.

---

## 4) Check Catalogue — 11 Deterministic Checks

### TIER E1 — Work Plan Integrity (E-01 to E-06)

Validates the **governance and structural completeness** of a work package submission.

**Phase binding:** Runs in BOTH Phase 1 (G3.5) and Phase 2 (GATE_5).
- At G3.5: evidence paths are checked for *declaration* only (files may not exist yet)
- At GATE_5: evidence paths are checked for *physical existence* on disk

| Check ID | Name | Validation Logic | Failure Condition |
|---|---|---|---|
| E-01 | Identity Header Completeness | All 9 mandatory header fields present and non-empty: `roadmap_id`, `stage_id`, `program_id`, `work_package_id`, `task_id`, `gate_id`, `phase_owner`, `required_ssm_version`, `required_active_stage` | Any field missing or empty string |
| E-02 | Gate Prerequisite Chain | Declared prerequisite gates/WPs confirmed PASS in WSM CURRENT_OPERATIONAL_STATE (via `wsm_state_reader.py`) | Prerequisite gate not found as PASS in WSM |
| E-03 | Completion Criteria Defined | Work package definition includes a `completion_criteria` or `exit_criteria` section with ≥1 measurable criterion | Section absent or empty |
| E-04 | Evidence Index Declared | Submission includes an evidence index (table or list) referencing at minimum: work package definition, at least one team completion report | Index absent or references fewer than 2 artifacts |
| E-05 | Team Activation Compliance | For each team activated via directive in this WP: at least one completion report exists (path present in evidence index at GATE_5) | Activated team with no completion report at GATE_5 |
| E-06 | WSM Active Scope Consistency | `work_package_id` in submission matches `active_work_package_id` or `last_closed_work_package_id` in WSM; `gate_id` is within `allowed_gate_range` | Mismatch or gate out of range |

### TIER E2 — Code Quality (E-07 to E-11)

Validates the **code artifacts produced** during the work package execution.

**Phase binding:** Runs in Phase 2 (GATE_5) only. Code does not exist at G3.5.

| Check ID | Name | Validation Logic | Failure Condition |
|---|---|---|---|
| E-07 | Domain Isolation — Import Scan | Grep/regex scan of all `.py` files under `agents_os/` for import statements referencing paths outside `agents_os/` (excluding stdlib and third-party pip packages) | Any import of `tiktrack`, app-level non-`agents_os` modules found |
| E-08 | Test Directory Coverage | For each new validator module introduced in this WP (any new `.py` under `agents_os/validators/`), at least one corresponding test file exists under `agents_os/tests/` | New validator module with no test file |
| E-09 | Test Suite Green | `python3 -m pytest agents_os/tests/ -q` returns exit code 0 | Any test failure (exit code ≠ 0) |
| E-10 | No Debug Artifacts | Scan all `.py` production files (under `agents_os/`, excluding `agents_os/tests/`) for uncommented debug statements: `print(`, `breakpoint()`, `import pdb`, `pdb.set_trace()` | Any match found in production code |
| E-11 | AST Cross-Domain Boundary Scan | AST-level parse of all new `.py` files introduced in this WP; inspect all `import` and `from ... import` nodes; flag any reference to TikTrack application modules or non-`agents_os` application code | AST import node referencing prohibited path |

---

## 5) LLM Quality Gate (Phase 2 — GATE_5 only)

Reuses the `quality_judge.py` framework built in WP001. WP002 extends it with execution-context prompts.

| Prompt ID | Purpose |
|---|---|
| Q-01 | Overall execution quality: is the implementation logically sound and complete? |
| Q-02 | Architectural compliance: does the code follow the approved two-phase routing architecture? |
| Q-03 | Test quality: are the tests meaningful (not trivially passing), covering real edge cases? |
| Q-04 | Completion report quality: are Team 20/70 completion reports substantive and evidence-backed? |
| Q-05 | Risk assessment: does the implementation introduce any risks to the Agents_OS domain or gate governance? |

**Exit code 2 (HOLD) on any negative judgment — mandatory human review before progression.**

---

## 6) Artifacts to Build

```
agents_os/
├── validators/
│   └── execution/                          ← NEW (WP002)
│       ├── __init__.py
│       ├── tier_e1_work_plan.py            ← E-01 to E-06
│       └── tier_e2_code_quality.py         ← E-07 to E-11
├── orchestrator/
│   └── validation_runner.py               ← EXTEND (add execution flow routing)
└── tests/
    └── execution/                          ← NEW (WP002)
        ├── __init__.py
        ├── test_tier_e1.py
        └── test_tier_e2.py
```

**No new files outside `agents_os/`. No TikTrack changes. Domain isolation mandatory.**

### Shared base reuse

WP002 inherits and reuses the following from WP001 (no modifications allowed without Team 100 approval):

| Module | Reuse |
|---|---|
| `validators/base/validator_base.py` | Base class for tier_e1 and tier_e2 |
| `validators/base/message_parser.py` | Input parsing |
| `validators/base/response_generator.py` | Output artifact generation |
| `validators/base/seal_generator.py` | Seal on PASS responses |
| `validators/base/wsm_state_reader.py` | WSM state cross-reference (E-02, E-06) |
| `llm_gate/quality_judge.py` | Quality gate framework (extend with execution prompts) |

---

## 7) Validation Runner Extension

`orchestrator/validation_runner.py` must be extended (not replaced) to support execution flow routing:

```
validation_runner --mode=execution --phase=1 <submission_path>   # G3.5: TIER E1 only
validation_runner --mode=execution --phase=2 <submission_path>   # GATE_5: E1 + E2 + LLM
```

The existing `--mode=spec` flow (WP001) must remain functional and unchanged.

---

## 8) Exit Criteria

| Milestone | Criteria |
|---|---|
| G3.5 PASS | TIER E1 (E-01–E-06) all pass on work package definition; Phase 1 routing operational |
| WP002 GATE_4 PASS | QA report 100% green (Team 50); all E-01–E-11 implemented; runner extension working |
| WP002 GATE_5 PASS | Team 90: TIER E1 + TIER E2 + LLM gate all pass on a real submission; 0 failures |
| WP002 GATE_8 PASS | Documentation closed; S002-P001 program complete |

**Program complete when: WP001 GATE_8 PASS ✅ + WP002 GATE_8 PASS.**

---

## 9) Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| AST scan false positives (stdlib imports flagged) | LOW | Allowlist: stdlib + known pip packages (pytest, anthropic, etc.) |
| Test suite slow (E-09 runs all tests) | LOW | WP002 tests are small; full suite should remain <30s |
| runner --mode extension breaks WP001 spec flow | MEDIUM | Team 20: regression test WP001 spec mode before closing WP002 GATE_4 |
| G3.5 Phase 1 evidence paths — files don't exist yet | BY DESIGN | E-04 at G3.5 checks declaration only; E-05 physical check deferred to GATE_5 |

---

**log_entry | TEAM_100 | S002_P001_WP002_EXECUTION_VALIDATOR_ARCHITECTURAL_CONCEPT_v1.0.0_CREATED | 2026-02-26**
