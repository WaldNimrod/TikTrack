---
id: TEAM_100_TO_TEAM_11_S003_P011_WP002_GATE_2_PHASE_2.2_MANDATE_v1.0.0
from: Team 100 (Chief System Architect)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 00, Team 61, Team 101, Team 190
date: 2026-03-20
gate: GATE_2
phase: "2.2"
wp: S003-P011-WP002
type: MANDATE
status: ACTIVE
program: S003-P011
domain: agents_os
subject: Produce GATE_2 Phase 2.2 Work Plan for S003-P011-WP002 (Pipeline Stabilization)
---

# GATE_2 Phase 2.2 — Work Plan Production Mandate
## Team 11 (AOS Gateway / Execution Lead)

---

## §0 — Your Task

You are Team 11, AOS Gateway and Execution Lead. You are now in **GATE_2 Phase 2.2**.
Your deliverable is a **complete, Team 61-actionable Work Plan** for WP002 implementation.

The Work Plan is NOT a high-level overview. It is a sequenced, structured execution document
that Team 61 (AOS Backend Implementor) will follow step-by-step to implement
`S003-P011-WP002 — Pipeline Stabilization and Hardening`.

**Output file:**
```
_COMMUNICATION/team_11/TEAM_11_S003_P011_WP002_GATE_2_WORKPLAN_v1.0.0.md
```

**After submission:** Team 90 performs Phase 2.2v review. Then Team 100 performs Phase 2.3 final
sign-off. Then GATE_3 (Team 61 implementation) begins.

---

## §1 — Specification Documents (Read All Before Writing)

You MUST read ALL of the following before producing the Work Plan:

### Primary Specification
```
_COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md
```
This is the LOD200 (requirements specification). It defines:
- 12 deliverables (D-01..D-12)
- 22 acceptance criteria (AC-WP2-01..22)
- 11 Iron Rules (including Rule #11: SSOT)
- Execution phases (Foundation → Core Logic → Content Generation → Certification)
- Test strategy (Tier-1 CERT_01..15 + Tier-2 SMOKE_01..03)

### Implementation Contract (LLD400)
```
_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md
```
Status: `TEAM_190_PASS` — all 5 blocking findings (BF-01..BF-05) closed.
This is the binding implementation specification for Team 61. It defines:
- §1: Complete `PipelineState` Pydantic model with all fields
- §2: Complete `_DOMAIN_PHASE_ROUTING` nested dict (all 5 gates, 2 variants)
- §3: Gate prompt generator architecture
- §4: `CORRECTION_CYCLE_BANNER` constant
- §5: `GATE_ALIASES` dict
- §6: `FAIL_ROUTING` rewrite
- §7: `fail` and `pass` command handler specs
- §8: `GATE_MANDATE_FILES` and dashboard update
- §9: Dashboard `flags.waiting_human_approval` fix
- §10: Certification suite structure with fixtures
- §11: Team 90 verdict template
- §12: `CanonicalPathBuilder` class
- §13..§16: Additional implementation details
- §17: Blocking Findings Closure Addendum (contains definitive versions of §17.1..§17.5)

**§17 takes precedence** over §1..§16 where there is any conflict.

### Architectural Review and Clarifications
```
_COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_GATE_2_ARCHITECTURAL_REVIEW_v1.0.0.md
```
Read §3 carefully — it contains **binding clarifications** that override any ambiguity in LLD400:
- §3.1: Migration: Validator vs Load (save() placement)
- §3.2: Single migration implementation (_run_migration canonical)
- §3.3: "pipeline" sentinel handling
- §3.4: Phase naming convention

### Architectural Directives (Binding Iron Rules)
```
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_DECISIONS_WP2_02_03_04_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_SINGLE_SOURCE_OF_TRUTH_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md
```

### Current Pipeline State
```
_COMMUNICATION/agents_os/pipeline_state_agentsos.json
```

---

## §2 — Binding Clarifications (Mandatory in Work Plan)

Your Work Plan MUST incorporate the following clarifications as explicit Team 61 mandates.
These are not suggestions. Team 61 must implement exactly as specified here.

### 2.1 — Migration: No save() Inside Pydantic Validator

**BINDING CONSTRAINT:**

The `@model_validator(mode="after")` on `PipelineState` (LLD400 §17.2) MUST:
- Update ONLY in-memory fields: `current_gate`, `current_phase`, `gate_state`, `remediation_cycle_count`
- NOT call `self.save()` — save() causes file I/O on every model instantiation, including in tests

The `PipelineState.load(domain)` classmethod MUST:
- Call `_run_migration()` or detect gate change via `_perform_migration()`
- Call `self.save()` ONLY if migration was applied (was_migrated=True)
- Log the migration event ONLY inside `load()`, never inside the validator

The `_MIGRATION_TABLE` is a module-level dict in `pipeline.py`.
The validator reads from it. **No file I/O inside validators — ever.**

LLD400 §17.2 describes the validator structure. The `load()` classmethod skeleton in LLD400 §1
shows the correct structure (steps 4→6: migrate → validate → if was_migrated: save).

### 2.2 — Single Migration Implementation

**BINDING CONSTRAINT:**

LLD400 §1 shows `_perform_migration()` as a static method (dict-based).
LLD400 §17.2 shows `_run_migration()` as the model validator approach.

**Team 61 implements ONLY the `@model_validator` approach from §17.2.**
The static `_perform_migration()` from §1 is superseded by §17.2.
The migration table name is `_MIGRATION_TABLE` (module-level constant in `pipeline.py`).

There MUST be exactly ONE migration code path. No dual implementations.

### 2.3 — "pipeline" Sentinel Handling

**BINDING CONSTRAINT:**

When `_resolve_phase_owner()` returns `"pipeline"`:
- The gate/phase is an **auto-action**, not a team prompt
- No prompt text is generated
- The pipeline performs the action automatically (e.g., write program to registry)
- Phase advances immediately after auto-action completes
- Applicable: `GATE_1 Phase 1.2` (program registration)

The `_generate_gate1_prompt()` function must check for `"pipeline"` ownership and branch into
the auto-action path. Team 61 must specify in their implementation exactly what the
auto-action writes (see LOD200 D-09 and GATE_SEQUENCE_CANON §3).

### 2.4 — Phase Naming Convention

**BINDING CONSTRAINT:**

`GATE_PHASE_GENERATORS` dict key naming convention (LLD400 §17.4):
```python
_g1_1_1   # GATE_1, Phase 1.1
_g2_2_1   # GATE_2, Phase 2.1
_g2_2_1v  # GATE_2, Phase 2.1v  ← "v" suffix = validation phase
_g2_2_2   # GATE_2, Phase 2.2
_g2_2_3   # GATE_2, Phase 2.3
```
Note: `"2.1v"` is a phase string (string key in `_DOMAIN_PHASE_ROUTING`).
`process_variant="TRACK_FOCUSED"` is a separate concept — no naming collision.

---

## §3 — Scope of Work (D-01..D-12)

The Work Plan must sequence the 12 deliverables from LOD200 §4 in the correct execution order.

### LOD200 Implementation Sequence (from LOD200 §5)

**Phase 1 — Foundation (D-02 → D-01 first):**
- D-02: `PipelineState` Pydantic migration
- D-01: Routing table + gate sequence + aliases + FAIL_ROUTING + `_resolve_phase_owner()`

**Phase 2 — Core Logic (D-09 → D-06 → D-03):**
- D-09: `CanonicalPathBuilder` utility class
- D-06: `pipeline_run.sh` CLI + `fail`/`pass`/`approve`/`dry-run`/`status` commands
- D-03: Certification test suite (`test_certification.py`, CERT_01..CERT_15)

**Phase 3 — Content Generation (D-04 → D-05):**
- D-04: Gate prompt generators (D-04a: gate stubs; D-04b: content per gate/phase)
- D-04 (extended per architectural review A3): Monitor constitution map fix —
  `pipeline-monitor-core.js` phase→owners matrix must be replaced with data sourced from
  `_DOMAIN_PHASE_ROUTING` (exported JSON or `phase_routing.json` snapshot). The UI must NOT
  have a separate hardcoded routing table. This is a D-04 scope item.
- D-05: Team 90 verdict template

**Phase 4 — Governance & Closure (D-11 → D-12):**
- D-07: `dry-run` test mode
- D-08: Path-safe `save()` (atomic write)
- D-10: Known bugs remediation (KB-27..39 per KNOWN_BUGS_REGISTER)
- D-11: Governance document promotion (all superseded docs get ARCHIVED headers)
- D-12: SSOT audit (see §4 below for expanded scope)

### D-12 Expanded Scope (per architectural review A5)

**Addition to D-12:** Team 170 must create minimal identity files for ALL active teams
that currently lack them. Confirmed missing:
- `team_11` — identity file required
- `team_101` — identity file required
- `team_102` — identity file required
- `team_191` — identity file required

Identity file format: `_COMMUNICATION/team_{N}/IDENTITY.md` (or equivalent)
Minimum content: team name, engine, domain, constitutional authority reference.
GATE_5 closure requires all active teams to have identity file coverage.

Team 61's mandate for D-12 must include a step for Team 170 to execute this audit and creation.

---

## §4 — Work Plan Document Structure (Required)

Your Work Plan must contain ALL of the following sections:

### Required Sections

```
§1 — Overview and Context
  - WP ID, domain, process_variant, active gate/phase
  - Reference to LOD200 v1.0.1 and LLD400 v1.0.1

§2 — Implementation Team and Tools
  - Team 61: AOS Backend Implementor (Cursor Composer)
  - Confirm engine: Cursor Composer (per TEAM_ROSTER_v2.0.0)
  - File scope: agents_os_v2/orchestrator/pipeline.py, state.py, agents_os/ui/js/pipeline-monitor-core.js,
    agents_os_v2/utils/path_builder.py, agents_os_v2/tests/test_certification.py

§3 — Binding Clarifications (reproduce §2.1..§2.4 of this mandate verbatim)
  These become Team 61's implementation constraints

§4 — Deliverables Sequence
  D-01..D-12 with:
  - Description of what Team 61 must produce
  - Exact LLD400 section references (e.g., "implement PipelineState per LLD400 §17.1..§17.2")
  - Success criterion per deliverable

§5 — Implementation Sequence (ordered execution plan)
  Phase 1: D-02 → D-01
  Phase 2: D-09 → D-06 → D-03
  Phase 3: D-04 (including monitor fix) → D-05
  Phase 4: D-07 → D-08 → D-10 → D-11 → D-12

§6 — Acceptance Criteria
  Reference all 22 ACs from LOD200 §7 (AC-WP2-01..22)
  Mark which deliverable(s) satisfy each AC

§7 — Certification Scenarios
  List all 15 CERT scenarios (CERT_01..CERT_15) from LLD400 §17.5
  For each: scenario description, fixture needed, assertion
  List all 3 SMOKE scenarios (SMOKE_01..03) from LOD200 §2.9

§8 — Iron Rules (reproduction)
  All 11 Iron Rules from LOD200 §6 (Team 61 must not violate any)
  Plus: the 3-layer engine authority rule (ARCHITECT_DIRECTIVE_DECISIONS_WP2_02_03_04)

§9 — Out of Scope (WP002 boundary)
  Explicitly list items that are NOT in WP002:
  - Role-Based Team Management (deferred to WP003 — DECISION-WP2-02)
  - Teams UI catalog refactor (deferred to WP003 — C2)
  - Missing TEAMS_ROSTER entries for team_11/101/102 (deferred to WP003 — C3)
  - TRACK_FAST variant implementation (deferred — C8)

§10 — GATE_3 Entry Conditions
  What Team 61 must produce before GATE_3 Phase 3.1 submission:
  - All D-01..D-12 deliverables complete
  - CERT_01..CERT_15 all passing
  - SMOKE_01..03 passing
  - Known bugs KB-27..39 resolved

§11 — Submission Header (YAML)
  Team 61's work plan submission must include canonical YAML header per LOD200 §10
```

---

## §5 — What Team 61 Receives From This Work Plan

Team 61's activation prompt (GATE_3 Phase 3.2) will be generated FROM your Work Plan.
Make it implementation-ready. Team 61 must be able to:
1. Open the Work Plan and immediately know what files to create/modify
2. Know the exact sequence of operations
3. Have all LLD400 section references they need
4. Have the binding constraints (§2.1..§2.4) as explicit implementation rules
5. Know the exact certification checklist they must pass

If the Work Plan is underspecified, Team 61 will produce incorrect or incomplete code.
Team 11 is accountable for Work Plan quality.

---

## §6 — Iron Rules for Your Work Plan

1. **Reference LLD400 v1.0.1** — every implementation step must cite the relevant LLD400 section.
   Do not paraphrase the LLD400. Direct Team 61 to the exact section.

2. **§17 supersedes §1..§16** — Where LLD400 §1..§16 and §17 (Blocking Findings Closure Addendum)
   conflict, §17 is authoritative. Your Work Plan must reflect §17 as the implementation contract.

3. **Binding clarifications are non-negotiable** — §2.1..§2.4 in this mandate are Team 00-approved
   architectural constraints. They override any LLD400 ambiguity. Include them verbatim in §3
   of your Work Plan.

4. **No scope expansion** — WP002 scope is exactly D-01..D-12 as defined. Do not add deliverables
   without Team 100 approval. DECISION-WP2-02 explicitly forbids role-catalog work in WP002.

5. **Canonical output path** — your Work Plan file MUST be at:
   `_COMMUNICATION/team_11/TEAM_11_S003_P011_WP002_GATE_2_WORKPLAN_v1.0.0.md`

6. **YAML header required** — use standard canonical header (see §7 below).

---

## §7 — Required YAML Header for Your Submission

```yaml
---
id: TEAM_11_S003_P011_WP002_GATE_2_WORKPLAN_v1.0.0
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 90 (for Phase 2.2v review), Team 100 (for Phase 2.3 sign-off)
cc: Team 00, Team 61, Team 101, Team 190
date: [DATE]
gate: GATE_2
phase: "2.2"
wp: S003-P011-WP002
type: WORKPLAN
status: SUBMITTED_FOR_REVIEW
lod200_ref: _COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md
lld400_ref: _COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md
---
```

---

## §8 — Self-Validation Checklist (Complete Before Submitting)

Before submitting your Work Plan, verify:

- [ ] Read LOD200 v1.0.1 completely (all 12 deliverables, 22 ACs, 11 Iron Rules)
- [ ] Read LLD400 v1.0.1 completely — especially §17.1..§17.5 (binding implementation contracts)
- [ ] Read Architectural Review §3 (binding clarifications §3.1..§3.4)
- [ ] Read ARCHITECT_DIRECTIVE_DECISIONS_WP2_02_03_04 (all three decisions understood)
- [ ] §3 Binding Clarifications section reproduced verbatim in Work Plan
- [ ] All 12 deliverables (D-01..D-12) present with LLD400 section references
- [ ] D-04 scope includes monitor constitution map fix (RBTM-F03 / architectural review A3)
- [ ] D-12 scope includes identity files for team_11, team_101, team_102, team_191
- [ ] Implementation sequence matches LOD200 §5 ordering
- [ ] All 22 ACs from LOD200 §7 referenced in §6 of Work Plan
- [ ] All 15 CERT scenarios (from LLD400 §17.5) listed in §7 of Work Plan
- [ ] All 3 SMOKE scenarios (from LOD200 §2.9) listed in §7 of Work Plan
- [ ] Out-of-scope section explicitly lists Role-Based Team Management as WP003-deferred
- [ ] Output file at correct canonical path
- [ ] YAML header complete and accurate
- [ ] No pseudocode substituted for concrete LLD400 references

---

## §9 — Phase 2.2 Authorization Statement

**Phase 2.2 is AUTHORIZED to proceed.**

- GATE_2 Phase 2.1: PASS — LLD400 v1.0.1 produced by Team 101 (2026-03-20)
- GATE_2 Phase 2.1v: PASS — Team 190 constitutional validation (2026-03-20)
- All pre-2.2 blockers: RESOLVED
- Architectural review: COMPLETE (Team 100, 2026-03-20)
- Team 00 decision: APPROVED (2026-03-20)

**Team 11: you may proceed immediately.**

---

**log_entry | TEAM_100 | GATE_2_PHASE_2.2_MANDATE | S003_P011_WP002 | ISSUED_TO_TEAM_11 | 2026-03-20**
