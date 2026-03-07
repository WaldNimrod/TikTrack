# AGENTS_OS_CORE_VALIDATION_ENGINE_WP002_LLD400_v1.0.0

**project_domain:** AGENTS_OS  
**id:** AGENTS_OS_CORE_VALIDATION_ENGINE_WP002_LLD400  
**from:** Team 170 (Spec Owner)  
**to:** Team 190 (Constitutional Architectural Validator)  
**cc:** Team 100, Team 00, Team 10  
**date:** 2026-02-26  
**status:** SUBMITTED_FOR_GATE_1_VALIDATION  
**gate_id:** GATE_1  
**architectural_approval_type:** SPEC  

---

## §1 Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | S002-P001-WP002 |
| task_id | N/A |
| gate_id | GATE_1 |
| architectural_approval_type | SPEC |
| spec_version | 1.0.0 |
| date | 2026-02-26 |
| source | _COMMUNICATION/team_100/S002_P001_WP002_EXECUTION_VALIDATOR_ARCHITECTURAL_CONCEPT_v1.0.0.md; _COMMUNICATION/team_170/AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400_v1.0.0.md (program context) |
| required_ssm_version | 1.0.0 |
| required_wsm_version | 1.0.0 |
| required_active_stage | S002 |
| phase_owner | Team 170 |

---

## §2 Work Package Definition (WP002 — Execution Validation Engine)

### §2.1 Objective

**S002-P001-WP002** implements the **Execution Validation Engine** for the Team 10 → Team 90 flow. It automates validation of work package execution submissions with:

1. **Phase 1 (G3.5 within GATE_3):** Work plan validation — TIER E1 (E-01–E-06) on the work package definition before development starts. Output: PASS (proceed to build) or BLOCK (return to Team 10).
2. **Phase 2 (GATE_5):** Execution quality validation — TIER E1 (re-run with full evidence) + TIER E2 (E-07–E-11) + LLM quality gate. Output: exit 0 PASS | exit 1 BLOCK | exit 2 HOLD (LLM; human review).

**Two-phase routing:** All references use the canonical term **G3.5 within GATE_3** for Phase 1; **GATE_5** for Phase 2. No deprecated terminology.

### §2.2 Scope

| In scope | Trace |
|----------|-------|
| TIER E1 (E-01–E-06) — work plan integrity | Architectural concept §4 |
| TIER E2 (E-07–E-11) — code quality | Architectural concept §4 |
| Two-phase routing: **G3.5 within GATE_3** (Phase 1), GATE_5 (Phase 2) | Architectural concept §3 |
| Validation runner extension: `--mode=execution --phase=1|2` | Architectural concept §7 |
| LLM quality gate extension (Q-01–Q-05 execution context) | Architectural concept §5 |
| Reuse of WP001 base (validator_base, message_parser, response_generator, seal_generator, wsm_state_reader, quality_judge) | Architectural concept §6 |

| Out of scope | Reason |
|--------------|--------|
| Spec validation flow (170→190) | WP001 |
| Template locking (LOD200/LLD400) | WP001 (T001) |
| TikTrack or non–agents_os code | Domain isolation |

### §2.3 Architecture Boundaries

- **Domain root:** `agents_os/` only. No TikTrack imports; path validation and AST scan per E-07, E-11.
- **Governance docs:** Read-only (WSM via wsm_state_reader; SSM/Gate Model refs). No write from validators.
- **Shared base:** WP002 reuses WP001 modules without modification (see §2.6). Extension points: `validation_runner.py` (add execution mode); `quality_judge.py` (add execution prompts).

### §2.4 Work Package Structure

| WP | Purpose | Dependencies | Deliverables |
|----|---------|--------------|--------------|
| S002-P001-WP002 | Execution Validation Engine (10→90) | WP001 shared base (WP001 GATE_4+ before WP002 open; **cleared** — WP001 GATE_8 PASS 2026-02-26) | TIER E1, TIER E2; two-phase routing **G3.5 within GATE_3** / GATE_5; runner extension; LLM extension; tests |

### §2.5 Required Artifacts (WP002)

| Path | Purpose |
|------|---------|
| `agents_os/validators/execution/__init__.py` | Package marker |
| `agents_os/validators/execution/tier_e1_work_plan.py` | E-01–E-06 |
| `agents_os/validators/execution/tier_e2_code_quality.py` | E-07–E-11 |
| `agents_os/orchestrator/validation_runner.py` | **Extend** — add `--mode=execution --phase=1|2`; WP001 `--mode=spec` unchanged |
| `agents_os/tests/execution/__init__.py` | Package marker |
| `agents_os/tests/execution/test_tier_e1.py` | Tests for E-01–E-06 |
| `agents_os/tests/execution/test_tier_e2.py` | Tests for E-07–E-11 |

### §2.6 Shared Base Reuse (no modifications)

| Module | Reuse |
|--------|-------|
| `validators/base/validator_base.py` | Base class for tier_e1 and tier_e2 |
| `validators/base/message_parser.py` | Input parsing |
| `validators/base/response_generator.py` | Output artifact generation |
| `validators/base/seal_generator.py` | Seal on PASS |
| `validators/base/wsm_state_reader.py` | WSM state for E-02, E-06 |
| `llm_gate/quality_judge.py` | Quality gate framework — **extend** with execution-context prompts (Q-01–Q-05) |

### §2.7 Exit Criteria

- **G3.5 PASS:** TIER E1 (E-01–E-06) all pass on work package definition; Phase 1 routing operational.
- **WP002 GATE_4 PASS:** QA report green; E-01–E-11 implemented; runner extension working; WP001 spec mode regression pass.
- **WP002 GATE_5 PASS:** Team 90: TIER E1 + TIER E2 + LLM gate pass on real submission; 0 failures.
- **WP002 GATE_8 PASS:** Documentation closed; S002-P001 program complete.

---

## §3 Repo Reality Evidence

| Path | State | Summary |
|------|--------|--------|
| `agents_os/validators/base/` | EXISTS | WP001 delivered; message_parser, validator_base, response_generator, seal_generator, wsm_state_reader |
| `agents_os/validators/execution/` | DOES NOT EXIST | To be created (WP002) |
| `agents_os/llm_gate/quality_judge.py` | EXISTS | WP001; extend with execution prompts |
| `agents_os/orchestrator/validation_runner.py` | EXISTS | WP001 base; extend with execution mode |
| `agents_os/tests/execution/` | DOES NOT EXIST | To be created (WP002) |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | EXISTS | Canonical; read-only |

---

## §4 Proposed Deltas

- **WSM delta:** None by Team 170. WSM update on GATE_1 PASS is Team 190 responsibility. Execution gate progression (G3.5, GATE_5) is Team 10 / Team 90 per runbook.
- **Repo delta:** New directories and files per §2.5; extension of `validation_runner.py` and `quality_judge.py` only at defined extension points; no changes to WP001 spec flow.

---

## §5 Risk Register

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R-WP2-01 | Runner extension breaks WP001 spec mode | MEDIUM | Regression test WP001 `--mode=spec` before WP002 GATE_4 close; no modification of spec path. |
| R-WP2-02 | G3.5 evidence paths — files don't exist yet | BY DESIGN | E-04 at G3.5 checks declaration only; E-05 physical check at GATE_5. |
| R-WP2-03 | LLM non-determinism | MEDIUM | HOLD (exit 2); human review; prompts logged. |
| R-WP2-04 | AST scan false positives | LOW | Allowlist stdlib + known pip packages. |

---

## §6 Two-Phase Routing and Runner Extension

### §6.1 CLI Signature

```
validation_runner --mode=execution --phase=1 <submission_path>   # G3.5: TIER E1 only
validation_runner --mode=execution --phase=2 <submission_path>   # GATE_5: E1 + E2 + LLM
```

Existing `--mode=spec` (WP001) must remain unchanged.

### §6.2 Phase 1 (G3.5 within GATE_3)

- **Input:** Work package definition (submission from Team 10).
- **Scope:** TIER E1 (E-01–E-06) only. E-04/E-05 at G3.5: evidence **declaration** only (paths may not exist on disk).
- **Output:** PASS (proceed to development) | BLOCK (return to Team 10). Canonical artifact format per response_generator/seal_generator.

### §6.3 Phase 2 (GATE_5)

- **Input:** Completed execution submission (artifacts + code).
- **Scope:** TIER E1 (re-run with physical existence checks) + TIER E2 (E-07–E-11) + LLM quality gate (Q-01–Q-05 execution context).
- **Output:** exit_code=0 PASS | exit_code=1 BLOCK | exit_code=2 HOLD (LLM negative → human review).

---

## §7 Check Catalogue (E-01–E-11) and LLM Gate

### §7.1 TIER E1 — Work Plan Integrity (E-01–E-06)

| Check ID | Name | Validation Logic | Failure Condition | Phase |
|----------|------|-------------------|-------------------|-------|
| E-01 | Identity Header Completeness | All 9 mandatory header fields present and non-empty: roadmap_id, stage_id, program_id, work_package_id, task_id, gate_id, phase_owner, required_ssm_version, required_active_stage | Any field missing or empty | 1 + 2 |
| E-02 | Gate Prerequisite Chain | Prerequisite gates/WPs confirmed PASS in WSM CURRENT_OPERATIONAL_STATE (wsm_state_reader) | Prerequisite not PASS in WSM | 1 + 2 |
| E-03 | Completion Criteria Defined | Work package definition includes completion_criteria or exit_criteria with ≥1 measurable criterion | Section absent or empty | 1 + 2 |
| E-04 | Evidence Index Declared | Submission includes evidence index referencing ≥ work package definition + ≥1 team completion report | Index absent or &lt;2 artifacts | 1 (declaration); 2 (physical) |
| E-05 | Team Activation Compliance | For each activated team: at least one completion report (path in evidence index; at GATE_5: file exists) | Activated team with no report at GATE_5 | 1 (declaration); 2 (physical) |
| E-06 | WSM Active Scope Consistency | work_package_id in submission matches WSM active_work_package_id or last_closed; gate_id within allowed_gate_range | Mismatch or out of range | 1 + 2 |

### §7.2 TIER E2 — Code Quality (E-07–E-11)

| Check ID | Name | Validation Logic | Failure Condition | Phase |
|----------|------|-------------------|-------------------|-------|
| E-07 | Domain Isolation — Import Scan | Grep/regex scan of .py under agents_os/ for imports outside agents_os/ (exclude stdlib, pip) | Any tiktrack or non–agents_os app import | 2 only |
| E-08 | Test Directory Coverage | For each new validator module under agents_os/validators/, ≥1 test file under agents_os/tests/ | New validator with no test file | 2 only |
| E-09 | Test Suite Green | `python3 -m pytest agents_os/tests/ -q` exit 0 | exit ≠ 0 | 2 only |
| E-10 | No Debug Artifacts | Scan .py under agents_os/ (excl. tests/) for print(, breakpoint(), import pdb, pdb.set_trace() | Any match in production | 2 only |
| E-11 | AST Cross-Domain Boundary Scan | AST parse of new .py; flag import/from referencing TikTrack or non–agents_os app code | AST import to prohibited path | 2 only |

### §7.3 LLM Quality Gate (Phase 2 — GATE_5 only)

| Prompt ID | Purpose |
|-----------|---------|
| Q-01 | Overall execution quality: logically sound and complete? |
| Q-02 | Architectural compliance: two-phase routing followed? |
| Q-03 | Test quality: meaningful, edge-case coverage? |
| Q-04 | Completion report quality: substantive, evidence-backed? |
| Q-05 | Risk: risks to Agents_OS or gate governance? |

**HOLD (exit 2)** on any negative judgment — mandatory human review before progression.

---

**log_entry | TEAM_170 | AGENTS_OS_CORE_VALIDATION_ENGINE_WP002_LLD400 | v1.0.0_SUBMITTED_GATE_1 | 2026-02-26**
