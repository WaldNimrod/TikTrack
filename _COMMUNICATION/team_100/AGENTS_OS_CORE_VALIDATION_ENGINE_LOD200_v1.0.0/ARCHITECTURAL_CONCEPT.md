---
**project_domain:** AGENTS_OS
**id:** AGENTS_OS_CORE_VALIDATION_ENGINE_LOD200_ARCHITECTURAL_CONCEPT_v1.0.0
**gate_id:** GATE_0
**architectural_approval_type:** SPEC
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GATE_0 |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Problem Statement

The current governance system requires two critical validation flows that are executed manually by LLM sessions:

- **Spec Validation (170→190):** Team 190 manually reviews each LLD400 submission against 44 distinct criteria spanning identity headers, section structure, gate model compliance, WSM/SSM alignment, domain isolation, package completeness, and LOD200 traceability.
- **Execution Validation (10→90):** Team 90 manually reviews each work package execution package against 11 criteria spanning work plan integrity, code quality, and evidence completeness.

Manual validation is:
- Inconsistent across sessions (different LLM instances apply criteria differently)
- Not reproducible (no audit trail of exactly which criteria were checked)
- Slow (full context load per validation cycle)
- Prone to drift (criteria evolve but old sessions don't update)

**The system cannot scale beyond its current manual bottleneck.**

---

## 2) Solution — Core Validation Engine

A Python-based deterministic validation engine that automates the structural and governance checks for both flows, with an LLM quality gate for content judgment that cannot be scripted.

### 2.1 Design Principles

1. **Deterministic first** — everything that can be expressed as a rule IS a rule. No LLM for what a regex can check.
2. **Tiered execution** — cheap checks run first; expensive checks (LLM) run only after all deterministic checks pass.
3. **Evidence-by-path output** — every BLOCK finding includes exact file path, line (if applicable), criterion ID, and required remediation. No vague failures.
4. **Zero assumptions** — if a required field is absent, it is a BLOCK. Not a warning.
5. **Template locking as foundation** — TIER 2 (section structure) validation requires locked Markdown templates for LOD200 and LLD400. Template locking is deliverable T001 of WP001 and a prerequisite for TIER 2 validators.

### 2.2 Exit Code Protocol

| Code | Status | Meaning | Next Action |
|---|---|---|---|
| `0` | PASS | All checks passed | Proceed to next gate |
| `1` | BLOCK | Deterministic check failed | Fix specific finding, resubmit |
| `2` | HOLD | LLM quality concern | Human review required before proceeding |

HOLD is not a soft pass. HOLD stops progression and requires explicit human decision to override or remediate.

### 2.3 Validation Architecture

```
Submission Artifact(s)
        │
        ▼
┌─────────────────────────────┐
│  TIER 1: Identity Header    │  13 regex/presence checks — exits with BLOCK on first fail
│  (V-01 – V-13)              │
└─────────────────────────────┘
        │ PASS
        ▼
┌─────────────────────────────┐
│  TIER 2: Section Structure  │  Requires locked templates (T001 prerequisite)
│  (V-14 – V-20)              │  6 section/format checks
└─────────────────────────────┘
        │ PASS
        ▼
┌─────────────────────────────┐
│  TIER 3: Gate Model         │  4 checks — gate enum, version, lifecycle chain
│  (V-21 – V-24)              │
└─────────────────────────────┘
        │ PASS
        ▼
┌─────────────────────────────┐
│  TIER 4: WSM/SSM Alignment  │  5 cross-reference checks against live WSM state
│  (V-25 – V-29)              │
└─────────────────────────────┘
        │ PASS
        ▼
┌─────────────────────────────┐
│  TIER 5: Domain Isolation   │  4 path + import checks
│  (V-30 – V-33)              │
└─────────────────────────────┘
        │ PASS
        ▼
┌─────────────────────────────┐
│  TIER 6: Package Complete.  │  8 file existence + header checks (7-file format)
│  (V-34 – V-41)              │
└─────────────────────────────┘
        │ PASS
        ▼
┌─────────────────────────────┐
│  TIER 7: LOD200 Traceability│  3 source reference + scope/risk coverage checks
│  (V-42 – V-44)              │
└─────────────────────────────┘
        │ PASS
        ▼
┌─────────────────────────────┐
│  LLM QUALITY GATE           │  5 quality judgment calls (Q-01 – Q-05)
│  (Q-01 – Q-05)              │  HOLD on any negative — human review required
└─────────────────────────────┘
        │ PASS
        ▼
    RESULT: PASS (exit 0)
```

**For 10→90 Execution Validation flow:** same architecture with TIER E1 (work plan, E-01–E-06) and TIER E2 (code quality, E-07–E-11) replacing TIERS 1–7.

### 2.4 Two-Phase 10↔90 Model (Resolved Ambiguity)

Team 90 operates in two distinct phases — this ambiguity was a major historical failure source (B1-B3 in archive):

| Phase | Gate | Trigger | Validates |
|---|---|---|---|
| Phase 1 | G3.5 (within GATE_3) | WP work plan submitted at G3.5 sub-stage | Work plan completeness, gate sequencing, criteria |
| Phase 2 | GATE_5 | GATE_4 (QA) PASS | Execution quality, architecture alignment, code standards |

The engine routes by `gate_id` field in the submission: `G3.5` → Phase 1 validator; `GATE_5` → Phase 2 validator.
Note: `PRE_GATE_3` is removed from the active canonical gate model (Gate Lifecycle v1.1.0 §Core transition rules). Work-plan validation is canonically G3.5, a sub-stage within GATE_3.

---

## 3) Program Vision — Gate Process Skeleton

This program creates the **skeleton for the full automated gate process** by automating the two foundational validation flows:

- **Spec Validation (170→190)** — the governance entrance gate: every architectural spec is validated before implementation begins
- **Execution Validation (10→90)** — the execution quality gate: every work package is validated before and after development

Together these two flows cover the critical decision points in the gate lifecycle. Every future program that runs through the Agents_OS will pass through these validators. This is the foundation layer, not a standalone tool.

```
Gate Lifecycle — Automated Coverage After This Program

GATE_0 ──► [future]
GATE_1 ──► SPEC VALIDATOR (170→190) ✓ WP001
GATE_2 ──► Team 100 (architectural judgment — human)
GATE_3 / G3.5 ──► EXECUTION VALIDATOR Phase 1 (10→90) ✓ WP002
GATE_3 ──► Team 10 opens WP (G3.5 = work plan validation sub-stage)
GATE_4 ──► [future]
GATE_5 ──► EXECUTION VALIDATOR Phase 2 (10→90) ✓ WP002
GATE_6 ──► Nimrod (human review — irreplaceable)
GATE_7 ──► [future]
GATE_8 ──► [future]
```

---

## 4) Program Structure — Two Work Packages

This program contains **two Work Packages**, each independently gate-cycled (GATE_3 through GATE_8):

### WP001 — Spec Validation Engine (170→190 Flow)

Builds the automated validator for LLD400 spec submissions:
- Shared infrastructure (base layer shared with WP002)
- Document template locking for LOD200 + LLD400 (prerequisite for structural validation)
- 44 deterministic checks across 7 tiers
- LLM quality gate (5 prompts, exit code 2=HOLD)

### WP002 — Execution Validation Engine (10→90 Flow)

Builds the automated validator for work package execution submissions:
- Two-phase model: G3.5 within GATE_3 (work plan) + GATE_5 (execution quality)
- 11 deterministic checks across 2 tiers
- LLM quality gate (shared framework from WP001)

**Dependency:** WP002 depends on WP001's shared base infrastructure. WP001 must reach GATE_4 before WP002 opens.

---

## 5) Program Scope

### In Scope

| Item | WP | Rationale |
|---|---|---|
| Document template locking (LOD200 + LLD400) | WP001 | Prerequisite for structural validation — T001 |
| Shared validator infrastructure | WP001 | Base classes, parsers, generators — shared by both WPs |
| Spec Validator (170→190): 44 deterministic checks | WP001 | Full implementation of TIER 1–7 |
| Execution Validator (10→90): 11 deterministic checks | WP002 | Full implementation of TIER E1–E2 |
| LLM Quality Gate | WP001 (framework) + WP002 (reuse) | Q-01–Q-05 via API |
| Test suite: full coverage per validator | WP001 + WP002 | pytest, deterministic only (LLM gate mocked) |
| Validation runner / CLI | WP001 (base) + WP002 (extension) | Sequences tiers; generates canonical response artifact |
| WSM live state reader | WP001 | Reads CURRENT_OPERATIONAL_STATE for cross-reference |

### Out of Scope

| Item | Reason |
|---|---|
| Full pipeline orchestrator (GATE_0, GATE_4, GATE_6, GATE_8 automation) | Future program (S002-P002) |
| UI / dashboard | Not in Phase 1 |
| Distributed / multi-agent execution | Future architecture |
| TikTrack runtime changes | Strict domain isolation |
| Auto-remediation | Out of scope for Phase 1 |

---

## 6) Required Artifacts (Canonical Taxonomy — Program Level)

All code under `agents_os/`. No artifacts in TikTrack domain.

The exact artifact breakdown per WP is defined by Team 10 in the WP definitions. At program level:

```
agents_os/
├── validators/
│   ├── base/          ← WP001 — shared infrastructure
│   ├── spec/          ← WP001 — 170→190 spec validator (7 tiers, 44 checks)
│   └── execution/     ← WP002 — 10→90 execution validator (2 tiers, 11 checks)
├── llm_gate/          ← WP001 (framework) — quality judge (5 prompts)
├── orchestrator/      ← WP001 + WP002 — CLI validation runner
└── tests/             ← WP001 + WP002 — test suite per flow
```

Template artifacts — output of WP001 Task T001:
```
documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/
├── LOD200_TEMPLATE_v1.0.0.md
└── LLD400_TEMPLATE_v1.0.0.md
```

## 7) Exit Criteria (Program Complete)

**WP001 complete when:**
- All 44 spec validator checks implemented and tested
- LOD200 and LLD400 templates locked
- LLM quality gate framework operational (HOLD on negative)
- Validation runner produces canonical PASS/BLOCK/HOLD response artifact

**WP002 complete when:**
- All 11 execution validator checks implemented and tested
- Two-phase routing operational (G3.5 → plan validator; GATE_5 → execution validator)
- LLM quality gate extended for execution context

**Program complete when:** WP001 GATE_8 + WP002 GATE_8 both passed.

---

**log_entry | TEAM_100 | AGENTS_OS_CORE_VALIDATION_ENGINE_LOD200_CONCEPT | GATE_0 | 2026-02-24**
**log_entry | TEAM_100 | ARCHITECTURAL_CONCEPT_REMEDIATION | BF-02_PRE_GATE_3_REMOVED | GATE_0_BLOCK_FOR_FIX_RESPONSE | 2026-02-25**
