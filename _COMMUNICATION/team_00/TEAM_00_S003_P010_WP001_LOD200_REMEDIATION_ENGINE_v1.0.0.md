---
project_domain: AGENTS_OS
id: TEAM_00_S003_P010_WP001_LOD200_REMEDIATION_ENGINE_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
to: Team 100 (GATE_0/GATE_2 authority), Team 190 (GATE_1 validation), Team 170 (registry sync)
cc: Team 61 (implementation), Team 10 (intake), Team 90 (validation)
date: 2026-03-19
status: LOD200 — APPROVED FOR GATE_0
authority: ARCHITECT_DIRECTIVE_AOS_ROADMAP_RESET_v1.0.0---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P010 |
| work_package_id | S003-P010-WP001 |
| gate_id | pre-GATE_0 |
| phase_owner | Team 100 (GATE_0/GATE_2) |
| required_active_stage | S003 |
| project_domain | AGENTS_OS |
| architectural_approval_type | SPEC |

---

## §1 — Work Package Overview

**Name:** Remediation Engine + Gate/Phase Separation

**One sentence:** Replace the "blind re-implementation" pattern with a deterministic remediation mandate system, and enforce structural separation between execution and QA phases.

**Source problems (from S003-P009-WP001 test flight):**
1. After GATE_4/GATE_5 FAIL, pipeline routed execution teams back to `implementation_mandates.md` — full feature spec — causing agents to rewrite from scratch instead of fixing the specific blocker
2. Team 50 (QA) was bundled inside `CURSOR_IMPLEMENTATION` execution phase, causing pipeline freeze when QA failed (no FAIL_ROUTING for execution phase)
3. No persistent storage of blocking findings across gate transitions
4. `CURSOR_IMPLEMENTATION` had zero correction-cycle awareness (unlike GATE_0 which already had the pattern)

**Context:** IDEA-040 Pillar 7 + Team 100 Remediation Lifecycle Architectural Review (2026-03-18). Team 00 ruling in Pillar 7: direct flow — validator becomes local router; G3_REMEDIATION scoped to multi-team deadlock only.

---

## §2 — Deliverables

### D-01: `last_blocking_findings` field in `PipelineState` (state.py)

**Current state:** `state.py` has no persistent field for blocking findings. GATE_0 reads them ad-hoc from disk on each correction cycle.

**Required changes to `agents_os_v2/orchestrator/state.py`:**
```python
# Add to PipelineState dataclass:
last_blocking_findings: str = ""     # raw BF block from last failed verdict (bullet list)
last_blocking_gate: str = ""         # gate that produced the last failure e.g. "GATE_5"
remediation_cycle_count: int = 0     # increments each time FAIL routing triggers
```

**Iron rule:** These fields MUST be written to `pipeline_state_{domain}.json` on every `save()` call and survive pipeline restarts.

**Population logic (in `advance()` — when advancing with FAIL):**
```python
# When recording a FAIL verdict:
findings, source = _extract_blocking_findings(gate_id, state.work_package_id)
if findings:
    state.last_blocking_findings = findings
    state.last_blocking_gate = gate_id
    state.remediation_cycle_count += 1
state.save()
```

---

### D-02: `_generate_remediation_mandate()` function (pipeline.py)

**Trigger:** Called instead of `_generate_mandate_doc()` when `state.remediation_cycle_count > 0` AND routing to CURSOR_IMPLEMENTATION from a FAIL.

**Output artifact:** `remediation_mandates.md` (domain-prefixed). NEVER overwrites `implementation_mandates.md`.

**Structure of `remediation_mandates.md`:**
```
§1: REMEDIATION HEADER (mandatory)
    - "⚠️ REMEDIATION CYCLE #N — DO NOT RE-IMPLEMENT FROM SCRATCH"
    - Gate that failed: {last_blocking_gate}
    - Source verdict: {verdict_file_path}
    - Blocking findings (verbatim from state.last_blocking_findings):
        BF-01: ...
        BF-02: ...

§2: TARGETED TASKS — ONE SECTION PER AFFECTED TEAM
    - Phase ordering: sequential by BF origin (see §4 phase rules)
    - Only teams with assigned BF items appear
    - Each section: team label + specific task derived from BF + file/function to modify

§3: NON-SCOPE (mandatory)
    - Explicit list: "DO NOT TOUCH — out of scope for this cycle"
    - Minimum: all components not mentioned in BF findings

§4: ACCEPTANCE
    - Per-BF acceptance criterion: "BF-XX resolved when [measurable condition]"
```

**BF attribution logic (automated):**
- `doc` route: pipeline assigns all BFs to the team that owns the failing gate (GATE_4 → Team 20+30; GATE_5 → Team 61)
- `full` route: Team 10 produces `remediation_work_plan.md` at G3_PLAN; pipeline reads it for per-team assignment

---

### D-03: FAIL_ROUTING changes (pipeline.py)

**Current GATE_4 routing:**
```python
"GATE_4": {
    "doc":  ("CURSOR_IMPLEMENTATION", "..."),
    "full": ("G3_6_MANDATES",         "..."),
},
```

**Required changes:**
```python
"GATE_4": {
    "doc":  ("CURSOR_IMPLEMENTATION", "QA: targeted fix — remediation_mandates.md generated, BF auto-injected"),
    "full": ("G3_PLAN",               "QA: code failures — Team 10 produces BF-scoped work plan → G3_6_MANDATES → remediation_mandates.md"),
},
"GATE_5": {
    "doc":  ("CURSOR_IMPLEMENTATION", "Targeted fix — remediation_mandates.md generated, BF auto-injected"),
    "full": ("G3_PLAN",               "Code/design issues — BF-scoped re-plan → G3_6_MANDATES → remediation_mandates.md"),
},
```

**Note:** `full` route from GATE_4 changes from `G3_6_MANDATES` to `G3_PLAN`. Team 10 must produce a **scoped remediation work plan** (not a full feature re-plan) before mandates are generated. The `state.last_blocking_findings` is auto-injected into the G3_PLAN prompt.

---

### D-04: CURSOR_IMPLEMENTATION correction-cycle awareness

**Current state:** `CURSOR_IMPLEMENTATION` prompt is stateless — identical on first run and on every re-entry after FAIL.

**Required:** When `state.remediation_cycle_count > 0`:
1. Prompt header shows `## ⚠ REMEDIATION CYCLE #{remediation_cycle_count}` block (identical pattern to GATE_0 at lines 966–1012 of pipeline.py)
2. Prompt points to `remediation_mandates.md` (NOT `implementation_mandates.md`)
3. Explicit prohibition displayed: `"DO NOT open implementation_mandates.md — it is the original spec, not your current task"`

**First-run detection:** `state.remediation_cycle_count == 0` → normal flow, `implementation_mandates.md`.

---

### D-05: Gate/Phase Separation — Remove Team 50 from CURSOR_IMPLEMENTATION

**Current state:** `G3_6_MANDATES` generator sometimes includes Team 50 as a Phase 3 step within the implementation mandate.

**Required:**
1. `_build_implementation_steps()` (or equivalent) MUST NOT include team_50 in any MandateStep
2. Team 50 is activated EXCLUSIVELY at GATE_4 by the GATE_4 prompt generator
3. Add assertion/guard: if any MandateStep in `G3_6_MANDATES` has `team_id="team_50"` → raise `ArchitecturalViolationError`

**GATE_4 prompt must explicitly state:** "Team 50 is your ONLY task at this gate. Do not reference implementation_mandates.md."

---

### D-06: `G3_REMEDIATION` gate — limited scope

**When activated:** ONLY when `remediation_cycle_count > 0` AND blocking findings span ≥2 distinct teams (multi-team deadlock).

**NOT activated for:** single-team FAIL (doc or full). Those route directly per D-03 above.

**Gate config addition:**
```python
"G3_REMEDIATION": {
    "owner": "team_10", "engine": "cursor",
    "desc": "Team 10 diagnoses multi-team BF → remediation_work_plan.md (scoped to BF only)"
},
```

**Team 10 scope at G3_REMEDIATION:** Strictly translate BF items → concrete per-team tasks. MUST NOT add new features. MUST NOT describe original requirements. Output = `remediation_work_plan.md` with rows: `BF-NN | team_XX | file:function | fix_description`.

---

## §3 — Files Modified

| File | Change type | Description |
|---|---|---|
| `agents_os_v2/orchestrator/state.py` | MODIFY | Add 3 fields to PipelineState dataclass |
| `agents_os_v2/orchestrator/pipeline.py` | MODIFY | _generate_remediation_mandate(), FAIL_ROUTING, CURSOR_IMPLEMENTATION correction-cycle, G3_REMEDIATION gate config, phase separation guard |
| `pipeline_run.sh` | MODIFY | CURSOR_IMPLEMENTATION case: detect remediation_cycle_count > 0, point to remediation_mandates.md |
| `agents_os/ui/js/pipeline-config.js` | MODIFY | Add G3_REMEDIATION to gate sequence |

---

## §4 — Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | GATE_4 FAIL `doc` route → `remediation_mandates.md` generated with correct BF content; `implementation_mandates.md` unchanged |
| AC-02 | GATE_4 FAIL `full` route → pipeline routes to G3_PLAN with `state.last_blocking_findings` injected into prompt |
| AC-03 | `state.remediation_cycle_count` increments on each FAIL routing; persists across restarts |
| AC-04 | `CURSOR_IMPLEMENTATION` prompt on remediation cycle shows `## ⚠ REMEDIATION CYCLE #N` and references `remediation_mandates.md` |
| AC-05 | No MandateStep with `team_id="team_50"` appears in any `implementation_mandates.md` |
| AC-06 | `G3_REMEDIATION` activates only when ≥2 teams have BF assignments; skipped for single-team failures |
| AC-07 | `remediation_mandates.md` contains §3 NON-SCOPE section explicitly listing out-of-scope components |

---

## §5 — What This Does NOT Include

- JSON verdict parsing (→ WP002)
- Dashboard UI changes (→ P011-WP001)
- Date auto-correction (→ WP003)
- Full gate renaming (→ deferred S004)

---

**log_entry | TEAM_00 | LOD200_P010_WP001 | REMEDIATION_ENGINE_SPEC_APPROVED | 2026-03-19**
