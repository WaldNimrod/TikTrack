# AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400_v1.0.0

**project_domain:** AGENTS_OS  
**id:** AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400_v1.0.0  
**from:** Team 170 (Spec Owner)  
**to:** Team 190 (Constitutional Architectural Validator)  
**cc:** Team 100, Team 00  
**date:** 2026-02-24  
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
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GATE_1 |
| architectural_approval_type | SPEC |
| spec_version | 1.0.0 |
| date | 2026-02-24 |
| source | _COMMUNICATION/team_100/AGENTS_OS_CORE_VALIDATION_ENGINE_LOD200_v1.0.0 (COVER_NOTE, ARCHITECTURAL_CONCEPT, DOMAIN_ISOLATION_MODEL, REPO_IMPACT_ANALYSIS, ROADMAP_ALIGNMENT, RISK_REGISTER) |
| required_ssm_version | 1.0.0 |
| required_wsm_version | 1.0.0 |
| required_active_stage | S002 |
| phase_owner | Team 170 |

---

## §2 Program Definition

### §2.1 Objective

Program **S002-P001: Agents_OS Core Validation Engine** builds the **skeleton for the full automated gate process** by implementing two foundational validation flows:

1. **Spec Validation (170→190)** — Automated structural and governance checks for LLD400 spec submissions (44 deterministic checks across 7 tiers + LLM quality gate). Every architectural spec is validated before implementation begins.
2. **Execution Validation (10→90)** — Automated checks for work package execution submissions (11 deterministic checks across 2 tiers + LLM gate). Two-phase model: **G3.5 within GATE_3** (work plan) and GATE_5 (execution quality).

Design principles (from LOD200): deterministic first; tiered execution; evidence-by-path output; zero assumptions; template locking as foundation for TIER 2.

### §2.2 Scope

| In scope | WP | Trace to LOD200 |
|----------|-----|------------------|
| Document template locking (LOD200 + LLD400) | WP001 | ARCHITECTURAL_CONCEPT §4, REPO_IMPACT §3 |
| Shared validator infrastructure (base, parsers, response generator, WSM reader) | WP001 | ARCHITECTURAL_CONCEPT §2.3, REPO_IMPACT §2 |
| Spec Validator: 44 checks TIER 1–7 + LLM quality gate Q-01–Q-05 | WP001 | ARCHITECTURAL_CONCEPT §2.3 |
| Execution Validator: 11 checks TIER E1–E2 + LLM extension | WP002 | ARCHITECTURAL_CONCEPT §2.3, §2.4 |
| Test suite per validator (pytest; LLM mocked) | WP001 + WP002 | ARCHITECTURAL_CONCEPT §5 |
| Validation runner / CLI | WP001 + WP002 | REPO_IMPACT §2 |
| WSM live state reader (read-only) | WP001 | DOMAIN_ISOLATION §3 |

| Out of scope | Reason (LOD200) |
|--------------|------------------|
| Full pipeline orchestrator (GATE_0, GATE_4, GATE_6, GATE_8) | Future program S002-P002 |
| UI / dashboard | Not Phase 1 |
| TikTrack runtime changes | Strict domain isolation |
| Auto-remediation | Out of scope Phase 1 |

### §2.3 Architecture Boundaries

- **Domain root:** `agents_os/` only. No TikTrack imports; no code outside `agents_os/` (path validation V-30; AST scan E-11).
- **Governance docs:** Read-only for validators (SSM, WSM, Gate Model). Team 70 retains exclusive write to `documentation/`. Templates created under `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/` per T001.
- **WSM/SSM:** WSMStateReader read-only; no write methods. Validation results written only to `_COMMUNICATION/` (team paths).

### §2.4 Work Package Structure

| WP | Purpose | Dependencies | High-level deliverables |
|----|---------|--------------|-------------------------|
| **S002-P001-WP001** | Spec Validation Engine (170→190) | None (first WP) | Shared base; LOD200/LLD400 templates (T001); 44 checks TIER 1–7; LLM gate framework; validation runner base; tests |
| **S002-P001-WP002** | Execution Validation Engine (10→90) | WP001 shared base (WP001 GATE_4 before WP002 open) | TIER E1 (E-01–E-06), TIER E2 (E-07–E-11); two-phase routing **G3.5 within GATE_3** / GATE_5; LLM extension; tests |

Task breakdown, assignments, and timelines are **Team 10's responsibility** (not part of LLD400).

### §2.5 Required Artifacts (canonical taxonomy, mapped to WP)

| Path | Purpose | WP |
|------|---------|-----|
| `agents_os/validators/base/message_parser.py` | Canonical message format parser | WP001 |
| `agents_os/validators/base/validator_base.py` | Abstract base + exit code protocol | WP001 |
| `agents_os/validators/base/response_generator.py` | Canonical response artifacts | WP001 |
| `agents_os/validators/base/seal_generator.py` | SOP-013 seal protocol | WP001 |
| `agents_os/validators/base/wsm_state_reader.py` | Read CURRENT_OPERATIONAL_STATE (read-only) | WP001 |
| `agents_os/validators/spec/tier1_identity_header.py` | V-01–V-13 | WP001 |
| `agents_os/validators/spec/tier2_section_structure.py` | V-14–V-20 (gated on T001) | WP001 |
| `agents_os/validators/spec/tier3_gate_model.py` | V-21–V-24 | WP001 |
| `agents_os/validators/spec/tier4_wsm_alignment.py` | V-25–V-29 | WP001 |
| `agents_os/validators/spec/tier5_domain_isolation.py` | V-30–V-33 | WP001 |
| `agents_os/validators/spec/tier6_package_completeness.py` | V-34–V-41 | WP001 |
| `agents_os/validators/spec/tier7_lod200_traceability.py` | V-42–V-44 | WP001 |
| `agents_os/validators/execution/tier_e1_work_plan.py` | E-01–E-06 | WP002 |
| `agents_os/validators/execution/tier_e2_code_quality.py` | E-07–E-11 | WP002 |
| `agents_os/llm_gate/quality_judge.py` | Q-01–Q-05 | WP001 |
| `agents_os/orchestrator/validation_runner.py` | CLI runner | WP001 + WP002 |
| `agents_os/tests/spec/` | Spec validator tests | WP001 |
| `agents_os/tests/execution/` | Execution validator tests | WP002 |
| `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md` | Locked LOD200 template (T001 output) | WP001 |
| `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md` | Locked LLD400 template (T001 output) | WP001 |

### §2.6 Exit Criteria

- **WP001:** All 44 spec validator checks implemented and tested; LOD200 and LLD400 templates locked (T001); LLM quality gate operational (HOLD on negative); validation runner produces canonical PASS/BLOCK/HOLD artifact.
- **WP002:** All 11 execution validator checks implemented and tested; two-phase routing (**G3.5 within GATE_3** / GATE_5) operational; LLM gate extended for execution context.
- **Program complete:** WP001 GATE_8 PASS and WP002 GATE_8 PASS.

---

## §3 Repo Reality Evidence

Audit of paths from §2.5 (exists / does-not-exist; brief content summary).

| Path | State | Summary |
|------|--------|--------|
| `agents_os/__init__.py` | EXISTS | Stub (empty) — domain root marker |
| `agents_os/validators/__init__.py` | EXISTS | Present |
| `agents_os/validators/validator_stub.py` | EXISTS | Working stub; to be replaced by tier1 + validator_base |
| `agents_os/validators/base/` | DOES NOT EXIST | To be created (WP001) |
| `agents_os/validators/spec/` | DOES NOT EXIST | To be created (WP001) |
| `agents_os/validators/execution/` | DOES NOT EXIST | To be created (WP002) |
| `agents_os/llm_gate/` | DOES NOT EXIST | To be created (WP001) |
| `agents_os/orchestrator/` | EXISTS (dir) | Empty — to be populated |
| `agents_os/runtime/__init__.py` | EXISTS | Empty stub — placeholder |
| `agents_os/tests/` | EXISTS | test_validator_stub.py present; tests/spec/ and tests/execution/ to be added |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | EXISTS | Canonical; read-only |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` | EXISTS | Canonical; read-only |
| `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` | EXISTS | Canonical; read-only |
| `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/` | DOES NOT EXIST | To be created by T001 (WP001) |

---

## §4 Proposed Deltas

- **WSM delta:** None by Team 170. WSM CURRENT_OPERATIONAL_STATE update upon GATE_1 PASS (or GATE_0/GATE_2 closure) is **Team 190** responsibility per Gate Model. When Team 10 opens WP001, Gate Owner will update WSM per runbook.
- **Roadmap delta:** Program **S002-P001** added to PHOENIX_PROGRAM_REGISTRY (this spec); registry already updated. No change to PHOENIX_PORTFOLIO_ROADMAP stage list (S002 already ACTIVE).
- **Index delta:** When T001 delivers templates, add entries to GOVERNANCE_PROCEDURES_INDEX / SOURCE_MAP for `AGENTS_OS_GOVERNANCE/02-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md` and `LLD400_TEMPLATE_v1.0.0.md`. No delta to 00_MASTER_DOCUMENTATION_TABLE until templates exist.

---

## §5 Risk Register

All risks from LOD200 RISK_REGISTER carried forward with mitigations.

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R-01 | Template locking dependency — TIER 2 blocked until T001 | HIGH | T001 first task in WP001; TIER 1 and TIERS 3–7 independent; TIER 2 explicitly gated on T001 PASS. |
| R-02 | LLM non-determinism | MEDIUM | HOLD (exit 2); all prompts/responses logged with timestamp and model version; human review required. |
| R-03 | WSM live read fragility | MEDIUM | WSMStateReader schema validation; parse failure → WSM_READ_ERROR, no silent BLOCK. |
| R-04 | Scope creep / silent gaps | HIGH | One test per criterion; CI fails if untested; NOT_IMPLEMENTED stub instead of skip. |
| R-05 | Criterion drift | MEDIUM | Canonical refs (SSM/WSM/Gate version) pinned in validator config; version mismatch → startup warning. |
| R-06 | Bootstrap paradox (validator cannot validate itself) | LOW | By design; documented. |
| R-07 | Python 3.9 compatibility | LOW | Standard library; SDK pinned in requirements.txt. |

---

## §6 Template Locking (T001 deliverable — prerequisite for TIER 2)

The LLD400 specifies the following **canonical template paths** and minimum structure. These become the basis for TIER 2 validators (V-14–V-20).

### LOD200 template

- **Canonical path:** `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md`
- **Minimum required sections:** (1) Identity block (YAML frontmatter or table) with project_domain, id, from, to, cc, date, status, gate_id, architectural_approval_type; (2) Mandatory Identity Header table with roadmap_id, stage_id, program_id, work_package_id, task_id, gate_id, phase_owner, required_ssm_version, required_active_stage; (3) Purpose; (4) Package contents or equivalent; (5) Next steps or exit criteria.
- **Mandatory fields in identity:** project_domain, id, gate_id (GATE_0), architectural_approval_type (SPEC), date, required_ssm_version, required_active_stage.

### LLD400 template

- **Canonical path:** `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md`
- **Minimum required sections:** (1) Identity block with project_domain, id, gate_id=GATE_1, architectural_approval_type=SPEC, spec_version, date, source, required_ssm_version, required_wsm_version, required_active_stage, phase_owner; (2) §1 Identity Header (full 13-field table); (3) §2 Program Definition (Objective, Scope, Architecture Boundaries, Work Package Structure, Required Artifacts, Exit Criteria); (4) §3 Repo Reality Evidence; (5) §4 Proposed Deltas; (6) §5 Risk Register.
- **Mandatory fields:** All 13 identity header fields per 04_GATE_MODEL_PROTOCOL_v2.3.0 §1.4 plus spec_version, source, required_wsm_version.

---

## §7 Validation Criteria Summary (testable spec for the validator)

The validator will implement the following as **testable checks**. Exact field names, regex patterns, and enum values are defined in the validator implementation; this section summarizes scope.

### Spec flow (170→190) — 44 checks

| Tier | Check IDs | Scope |
|------|-----------|--------|
| TIER 1 | V-01–V-13 | Identity header: 13 fields, presence and format (regex where applicable) |
| TIER 2 | V-14–V-20 | Section structure: dependent on locked LOD200/LLD400 templates (T001) |
| TIER 3 | V-21–V-24 | Gate model: gate_id enum, SSM/WSM version refs, lifecycle chain |
| TIER 4 | V-25–V-29 | WSM/SSM alignment: cross-reference to live WSM CURRENT_OPERATIONAL_STATE |
| TIER 5 | V-30–V-33 | Domain isolation: path patterns, no TikTrack imports |
| TIER 6 | V-34–V-41 | Package completeness: 7-file format, file existence, header format |
| TIER 7 | V-42–V-44 | LOD200 traceability: source references, scope/risk coverage |

### Execution flow (10→90) — 11 checks

| Tier | Check IDs | Scope |
|------|-----------|--------|
| TIER E1 | E-01–E-06 | Work plan integrity: completeness, gate sequencing, criteria |
| TIER E2 | E-07–E-11 | Code quality: standards, AST (e.g. no TikTrack import) |

### LLM quality gate — 5 prompts

| ID | Purpose |
|----|--------|
| Q-01–Q-05 | Quality judgment; exact prompt language, input context, and HOLD criteria to be defined in validator implementation. HOLD (exit 2) on any negative; human review required. |

---

**log_entry | TEAM_170 | AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400 | v1.0.0_SUBMITTED_GATE_1 | 2026-02-24**
