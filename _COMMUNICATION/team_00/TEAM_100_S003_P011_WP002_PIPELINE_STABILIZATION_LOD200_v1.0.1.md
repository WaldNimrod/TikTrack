---
id: TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 101 (AOS Domain Architect — LLD400 production), Team 11, Team 61, Team 51, Team 90, Team 170, Team 190
cc: Team 00 (Nimrod)
date: 2026-03-20
status: ACTIVE — GATE_2 Phase 2.1 (LLD400 production)
program: S003-P011
wp: S003-P011-WP002
domain: agents_os
track: TRACK_FOCUSED
gate: GATE_2
current_phase: "2.1"
lod200_author_team: team_101
version: 1.0.1
supersedes: TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.0
changes_from_v1.0.0: BF-01 (migration table G3_PLAN corrected), BF-02 (header lifecycle state updated), H-01 (registry parity AC), H-02 (D-11 governance promotion), M-01 (test suite split + baseline updated), M-02 (route_recommendation resolved), M-03 (naming schema field renamed), Team-101 refinements (Pydantic, nested routing dict, CanonicalPathBuilder, 4-phase plan, certification suite rename)

---

# S003-P011-WP002: Pipeline Stabilization & Hardening
## LOD200 — Requirements Specification v1.0.1

---

## §0 — Executive Summary

**WP001 delivered the spec, the state machine, and the dashboard. It did not deliver a working pipeline.**

Running WP001 through its own pipeline exposed fundamental breakage at every layer:
- Prompt generators produce wrong prompts (wrong team, wrong phase, wrong gate)
- Routing logic ignores `process_variant` and `project_domain`
- `fail` / `pass` commands don't enforce pipeline state correctly
- No dry-run test coverage — the pipeline was never tested end-to-end before WP001 shipped
- GATE_SEQUENCE_CANON defines the 5-gate model; `pipeline.py` implements a broken hybrid of old + new

**This WP exists to stabilize the pipeline to the point where every work package — AOS and TikTrack — can run fully automated, correctly routed, and verifiably passing.**

**Success definition:** A fresh WP can be registered, initialized, and run through all 5 gates in both TRACK_FULL (TikTrack) and TRACK_FOCUSED (AOS) variants, with every gate producing the correct prompt for the correct team at the correct phase, and the `fail`/`pass` commands enforcing all state transitions correctly.

**LLD400 owner:** Team 101 (AOS Domain Architect) — `lod200_author_team=team_101` in pipeline state. Team 101 produces the LLD400; Team 190 validates; Team 100 signs off at GATE_2 Phase 2.3. Team 170 is NOT the LLD400 producer for this WP (confirmed in pipeline state, per GATE_SEQUENCE_CANON §2 Phase 2.1 routing via lod200_author_team field).

---

## §1 — Problem Statement: What Is Broken

### 1.1 — Architectural Gap: Hybrid Old/New State

`pipeline.py` currently contains TWO gate sequences simultaneously:
```python
# NEW (implemented in WP001):
GATE_SEQUENCE = ["GATE_1", "GATE_2", "GATE_3", "GATE_4", "GATE_5"]

# OLD (still present in GATE_CONFIG — NOT removed):
GATE_CONFIG.update({
    "GATE_0", "WAITING_GATE2_APPROVAL", "G3_PLAN", "G3_5",
    "G3_6_MANDATES", "G3_REMEDIATION", "CURSOR_IMPLEMENTATION",
    "GATE_6", "GATE_7", "GATE_8", ...
})
```

The old gates are NOT migrated. They are still present as first-class routing targets. The new GATE_1–GATE_5 are in GATE_SEQUENCE but their prompt generators are mostly stubs or missing. The result: any real execution falls through to old behavior.

**Active TikTrack WP (S002-P002-WP001) is stuck at `G3_6_MANDATES`** — an old gate ID that has no path to the new 5-gate model without a migration.

### 1.2 — GATE_META: Hardcoded to TikTrack Teams

```python
GATE_META = {
    "GATE_3": {"owner": "team_11", ...},  # AOS only — wrong for TikTrack
    "GATE_5": {"owner": "team_170", ...},  # AOS only — wrong for TikTrack
}
```

GATE_META has no domain awareness. For TikTrack, GATE_3 should route to `team_10`, GATE_5 to `team_70`. For AOS, GATE_3 routes to `team_11`, GATE_5 to `team_170`. The `_resolve_phase_owner()` function was added but is only called in some paths, not all.

### 1.3 — Gate Prompt Generators: Mostly Broken or Missing

From running WP001 through the pipeline, the following generators were broken:

| Gate | Phase | Bug | KB |
|---|---|---|---|
| GATE_2 | 2.2 (Work Plan) | Skipped entirely — routes to 2.3 directly | KB-27 |
| GATE_2 | 2.2v (Team 90 review) | Skipped entirely | KB-27 |
| GATE_3 | All | G3_REMEDIATION returns "Unknown gate" | KB-30 |
| GATE_3 | 3.1 | G3_6_MANDATES routes to team_10 regardless of domain | KB-29 |
| GATE_3 | 3.2 | CURSOR_IMPLEMENTATION routes to teams_20_30 regardless of domain | KB-31 |
| All gates | N/a | Correction-cycle prompt not rendered when remediation_cycle_count > 0 | KB-26 |
| GATE_5 | 5.1 | Prompt title says "Dev Validation / Team 90" — wrong content for GATE_5 | KB-34 |
| WAITING_GATE2_APPROVAL | — | Still present in routing; should be replaced by gate_state="HUMAN_PENDING" | KB-27 |

### 1.4 — `fail` / `pass` Commands: No State Enforcement

Current behavior:
```bash
./pipeline_run.sh fail "reason"
# → Advances pipeline state
# → Does NOT write reason to last_blocking_findings
# → Does NOT write current_gate to last_blocking_gate
# → Next prompt cannot show correction context

./pipeline_run.sh pass
# → Advances regardless of active BLOCK_FOR_FIX
# → No gate identifier = silent wrong-gate advance risk
# → No artifact check before advancing
```

Required behavior per GATE_SEQUENCE_CANON §3 (FCP model):
- `fail "reason"` must write `last_blocking_findings`, `last_blocking_gate`
- `pass` must check no active BLOCK_FOR_FIX is unresolved
- All prompt generators must check correction-cycle condition and render targeted fix prompt

### 1.5 — State Migration: Active TikTrack WP Stranded

S002-P002-WP001 is at `current_gate="G3_6_MANDATES"` — an old gate ID.
The new 5-gate model maps this to `GATE_3 / current_phase="3.1"`.
No migration script exists. Manual edit required. **This MUST be automated.**

### 1.6 — No Dry-Run Test Coverage

The pipeline was implemented but **never tested end-to-end** with a real WP before shipping.
There are unit tests for state management (127 currently collected), but:
- No integration test: "run a WP from GATE_1 to GATE_5 and verify all prompts are correct"
- No MCP-based validation: "verify the prompt generated at each phase matches what teams expect"
- No cross-variant test: "verify TRACK_FULL and TRACK_FOCUSED generate different team assignments"

### 1.7 — FCP Routing: Defined but Not Enforced

FAIL_ROUTING table exists in `pipeline.py`. FCP fields exist in state. But:
- `fail` command doesn't populate `finding_type` or `fcp_level`
- `FAIL_ROUTING` table uses old gate IDs (GATE_4 → CURSOR_IMPLEMENTATION, GATE_5 → CURSOR_IMPLEMENTATION) (KB-32)
- No validation that `finding_type` is a valid FCP ENUM value before routing
- `unclear` finding_type should block automatic routing → not implemented

### 1.8 — Dashboard: Mandates Not Surfaced to Teams

When `G3_6_MANDATES` (now GATE_3 phase 3.1) completes, the mandate files need to reach the implementing teams. Currently:
- Mandate files written to `_COMMUNICATION/agents_os/prompts/`
- Dashboard shows Team Mandates panel (implemented in WP001)
- BUT: Dashboard reads from old GATE_CONFIG keys — mandate panel references `G3_6_MANDATES` (old key)
- For new 5-gate model: dashboard needs to read mandate for `GATE_3` when `current_phase == "3.1"`

---

## §2 — Required Architecture: What MUST Work After This WP

### 2.1 — Single Canonical Gate Sequence

After this WP, `pipeline.py` MUST contain EXACTLY:
```python
GATE_SEQUENCE = ["GATE_1", "GATE_2", "GATE_3", "GATE_4", "GATE_5"]
```

All old gate IDs (`GATE_0`, `WAITING_GATE2_APPROVAL`, `G3_PLAN`, `G3_5`, `G3_6_MANDATES`, `G3_REMEDIATION`, `CURSOR_IMPLEMENTATION`, `GATE_6`, `GATE_7`, `GATE_8`) MUST be:
- Removed from active routing
- Preserved ONLY as `GATE_ALIASES` (backward-compat display, read-only) — mapping to new canonical IDs per §2.7
- Any old gate ID encountered in state → auto-migrated via `_run_migration()` in PipelineState

**Iron Rule:** After WP002, NO active pipeline state file may contain an old gate ID in `current_gate`. Migration must run automatically on load.

### 2.2 — Per-Gate, Per-Phase, Per-Domain Prompt Generator Architecture

Each gate must have a dedicated prompt generator function:
```python
def _generate_gate_N_prompt(state: PipelineState) -> str:
    """
    Gate N prompt generator.
    Must:
    1. Read state.current_phase to determine which phase is active
    2. Read state.process_variant to determine team routing
    3. Read state.project_domain for domain-specific context
    4. Check correction-cycle condition:
       if state.last_blocking_gate == f"GATE_{N}" and state.remediation_cycle_count > 0:
           → render correction banner + inject last_blocking_findings
    5. Dispatch to phase-specific sub-generator
    6. All team IDs resolved via _resolve_phase_owner() — zero hardcoded team IDs
    """
```

**Required generator functions (minimum):**

| Gate | Function | Phase coverage |
|---|---|---|
| GATE_1 | `_generate_gate1_prompt()` | 1.1 (Nimrod+Team 100/101 LOD200), 1.2 (program registration) |
| GATE_2 | `_generate_gate2_prompt()` | 2.1 (Team 101 spec), 2.1v (Team 190), 2.2 (Team 11/10 work plan), 2.2v (Team 90), 2.3 (Team 100 sign-off) |
| GATE_3 | `_generate_gate3_prompt()` | 3.1 (Team 11/10 mandates), 3.2 (Team 61/20/30 impl), 3.3 (Team 51/50 QA) |
| GATE_4 | `_generate_gate4_prompt()` | 4.1 (Team 90 dev validation), 4.2 (lod200_author_team arch review), 4.3 (Team 00 human UX) |
| GATE_5 | `_generate_gate5_prompt()` | 5.1 (Team 170/70 AS_MADE), 5.2 (Team 90 lock) |

Each function MUST dispatch to a phase-specific sub-generator based on `state.current_phase`.

### 2.3 — Domain-Aware Team Routing Table (Complete — Nested Dict)

The `_resolve_phase_owner()` function must be replaced by a complete lookup table structured as a nested dict for O(1) lookup and zero ambiguity:

```python
# agents_os_v2/orchestrator/pipeline.py
_DOMAIN_PHASE_ROUTING: dict[str, dict[str, dict[str, str | list]]] = {
    "GATE_1": {
        "1.1": {"TRACK_FULL": "team_00",     "TRACK_FOCUSED": "team_00"},     # human + Team 100/101
        "1.2": {"TRACK_FULL": "pipeline",    "TRACK_FOCUSED": "pipeline"},    # auto-registration
    },
    "GATE_2": {
        "2.1":  {"TRACK_FULL": "team_101",   "TRACK_FOCUSED": "team_101"},    # lod200_author_team (runtime: reads state.lod200_author_team)
        "2.1v": {"TRACK_FULL": "team_190",   "TRACK_FOCUSED": "team_190"},
        "2.2":  {"TRACK_FULL": "team_10",    "TRACK_FOCUSED": "team_11"},
        "2.2v": {"TRACK_FULL": "team_90",    "TRACK_FOCUSED": "team_90"},
        "2.3":  {"TRACK_FULL": "team_100",   "TRACK_FOCUSED": "team_100"},    # Team 100 sign-off; reviewer = lod200_author_team
    },
    "GATE_3": {
        "3.1":  {"TRACK_FULL": "team_10",    "TRACK_FOCUSED": "team_11"},
        "3.2":  {"TRACK_FULL": ["team_20", "team_30", "team_40"], "TRACK_FOCUSED": "team_61"},
        "3.3":  {"TRACK_FULL": "team_50",    "TRACK_FOCUSED": "team_51"},
    },
    "GATE_4": {
        "4.1":  {"TRACK_FULL": "team_90",    "TRACK_FOCUSED": "team_90"},
        "4.2":  {"TRACK_FULL": "lod200_author_team",   "TRACK_FOCUSED": "lod200_author_team"},  # runtime: reads state.lod200_author_team
        "4.3":  {"TRACK_FULL": "team_00",    "TRACK_FOCUSED": "team_00"},     # human
    },
    "GATE_5": {
        "5.1":  {"TRACK_FULL": "team_70",    "TRACK_FOCUSED": "team_170"},
        "5.2":  {"TRACK_FULL": "team_90",    "TRACK_FOCUSED": "team_90"},
    },
}
```

**Sentinel values:**
- `"lod200_author_team"` → runtime resolves to `state.lod200_author_team`
- `"team_00"` at 4.3 + 1.1 → human gate; `gate_state="HUMAN_PENDING"` set on entry
- `"pipeline"` → auto-action, no prompt sent to team

**`_resolve_phase_owner(state, gate, phase)`** — reads from `_DOMAIN_PHASE_ROUTING`:
```python
def _resolve_phase_owner(state: PipelineState, gate: str, phase: str) -> str | list[str]:
    entry = _DOMAIN_PHASE_ROUTING[gate][phase][state.process_variant]
    if entry == "lod200_author_team":
        return state.lod200_author_team
    return entry
```

This table is the SINGLE canonical routing source. **Zero hardcoded team IDs** anywhere in prompt generators.

### 2.4 — `fail` Command Requirements

```bash
./pipeline_run.sh fail "reason" [--finding-type TYPE] [--fcp-level LEVEL]
```

After `fail`:
1. `state.last_blocking_findings = reason`
2. `state.last_blocking_gate = state.current_gate`
3. `state.remediation_cycle_count += 1`
4. `state.finding_type = TYPE` (if provided; else leave None)
5. `state.fcp_level = LEVEL` (if provided; else auto-classify from finding_type)
6. FCP routing: if finding_type is defined, auto-route per FAIL_ROUTING + FCP table
7. `state.return_target_team` = resolved return team
8. State saved before routing

**`finding_type` validation:** MUST be one of FCP ENUM values. Invalid type → error + abort.

### 2.5 — `pass` Command Requirements

```bash
./pipeline_run.sh [--domain DOMAIN] pass [GATE_ID] [--phase PHASE]
```

The `[GATE_ID]` parameter is STRONGLY RECOMMENDED (per IDEA-050 / KB-36). Optional for backward compat.

Before advancing:
1. If `[GATE_ID]` provided: verify `state.current_gate == GATE_ID` (else abort with error)
2. If `state.last_blocking_gate == state.current_gate` AND `state.remediation_cycle_count > 0`:
   → WARN: "Active correction cycle detected. Are findings resolved? [y/n]"
3. Clear `last_blocking_findings` + `last_blocking_gate` on confirmed pass
4. Advance `current_gate` to next in GATE_SEQUENCE
5. Reset `current_phase` to first phase of next gate (e.g. "2.x" → "3.1")
6. Write event log entry

### 2.6 — Correction-Cycle Prompt Banner (All Gates)

Every prompt generator MUST begin with:
```python
if state.last_blocking_gate == current_gate and state.remediation_cycle_count > 0:
    prompt += CORRECTION_CYCLE_BANNER.format(
        cycle=state.remediation_cycle_count,
        gate=current_gate,
        findings=state.last_blocking_findings,
    )
```

`CORRECTION_CYCLE_BANNER` format:
```
═══════════════════════════════════════════════════════════════
🔴 CORRECTION CYCLE #{cycle} — {gate}
═══════════════════════════════════════════════════════════════
Previous blocking findings requiring fix:

{findings}

Your task: address ONLY the items above. Do not expand scope.
═══════════════════════════════════════════════════════════════
```

### 2.7 — State Migration (Auto-Run on Load)

**[FIX v1.0.1 — BF-01]:** Migration table corrected. `G3_PLAN` is the legacy *work plan* gate → maps to `GATE_2 / "2.2"`. It does NOT map to `GATE_3 / "3.1"` (mandates). Previous v1.0.0 table had both `G3_PLAN` and `G3_6_MANDATES` mapping to GATE_3/3.1 — incorrect.

`PipelineState._run_migration()` MUST handle the following migrations on every `PipelineState.load()`:

| Old `current_gate` | New `current_gate` | New `current_phase` | Notes |
|---|---|---|---|
| `GATE_0` | `GATE_1` | `"1.2"` | Pre-registration state |
| `GATE_1` (old pre-WP001) | `GATE_2` | `"2.1v"` | After LLD400 produced |
| `GATE_2` (old pre-WP001) | `GATE_2` | `"2.3"` | Near sign-off state |
| `WAITING_GATE2_APPROVAL` | `GATE_2` | `"2.3"` | + `gate_state="HUMAN_PENDING"` |
| `G3_PLAN` | `GATE_2` | `"2.2"` | ← **CORRECTED from v1.0.0** — work plan gate → GATE_2 Phase 2.2 |
| `G3_5` | `GATE_2` | `"2.2v"` | Post-work-plan Team 90 review |
| `G3_6_MANDATES` | `GATE_3` | `"3.1"` | Mandate generation phase |
| `G3_REMEDIATION` | `GATE_3` | `"3.1"` | FCP return; + `remediation_cycle_count += 1` |
| `CURSOR_IMPLEMENTATION` | `GATE_3` | `"3.2"` | Implementation phase |
| `GATE_4` (old) | `GATE_3` | `"3.3"` | QA phase |
| `GATE_5` (old) | `GATE_4` | `"4.1"` | Dev validation |
| `GATE_6` | `GATE_4` | `"4.2"` | Arch review |
| `GATE_7` | `GATE_4` | `"4.3"` | + `gate_state="HUMAN_PENDING"` |
| `GATE_8` | `GATE_5` | `"5.1"` | Documentation closure |

Migration MUST:
1. Log migration event to pipeline event log (stdout + event log file)
2. Save migrated state immediately
3. NOT fail silently — print migration notice to stdout

**Implementation:** Migration must be implemented as `PipelineState._run_migration()` called inside `PipelineState.load()`. The method checks `self.current_gate` against the migration table; if a match is found, applies the new gate/phase values and logs the event.

**Pydantic integration (per Team 101):** See D-01 note — `_run_migration()` is called as a Pydantic model validator (`@model_validator(mode="after")`) or as a post-load hook in the `load()` classmethod.

**Active TikTrack WP migration (immediate, automated by D-02):**
`pipeline_state_tiktrack.json`: `G3_6_MANDATES` → `GATE_3 / current_phase="3.1"`

`GATE_ALIASES` dict MUST map old IDs → new canonical IDs (not to themselves — KB-39):
```python
GATE_ALIASES = {
    "GATE_0": "GATE_1",
    "WAITING_GATE2_APPROVAL": "GATE_2",
    "G3_PLAN": "GATE_2",
    "G3_5": "GATE_2",
    "G3_6_MANDATES": "GATE_3",
    "G3_REMEDIATION": "GATE_3",
    "CURSOR_IMPLEMENTATION": "GATE_3",
    "GATE_4": "GATE_3",   # old GATE_4 = QA
    "GATE_5": "GATE_4",   # old GATE_5 = dev validation
    "GATE_6": "GATE_4",
    "GATE_7": "GATE_4",
    "GATE_8": "GATE_5",
}
```

### 2.8 — FAIL_ROUTING Table: Aligned to New Gate IDs

Current `FAIL_ROUTING` in `pipeline.py` uses old gate IDs as targets (KB-32). Must be rewritten with 5-gate IDs + FCP-level classification:

```python
FAIL_ROUTING = {
    "GATE_1": {
        "doc":  ("GATE_1",  "LLD400 doc/format issues — Team 170/101 fixes"),
        "full": ("GATE_1",  "LLD400 rejected — full rewrite required"),
    },
    "GATE_2": {
        "FCP-1": ("GATE_2",  "Wording/PWA — Team 10/11 direct fix → re-validate Phase 2.3"),
        "FCP-2": ("GATE_2",  "Work plan issue → Team 10/11 fix → re-validate Phase 2.3"),
        "FCP-2_spec": ("GATE_2",  "Spec issue → lod200_author_team fix → re-validate from Phase 2.1v"),
        "FCP-3": ("GATE_1",  "Full spec failure → lod200_author_team full rewrite"),
    },
    "GATE_3": {
        "FCP-1": ("GATE_3",  "PWA fix — Team 10/11 direct fix → re-validate"),
        "FCP-2": ("GATE_3",  "Bounded fix → specialist team → targeted QA"),
        "FCP-3": ("GATE_2",  "Multi-team / architectural → full re-plan"),
    },
    "GATE_4": {
        "FCP-1": ("GATE_4",  "PWA — Team 10/11 fix → re-validate from rejecting phase"),
        "FCP-2": ("GATE_3",  "Bounded code fix → Team 3.2 → targeted QA → re-validate"),
        "FCP-3": ("GATE_3",  "Multi-team / scope → GATE_3 full restart (phase 3.1)"),
    },
    "GATE_5": {
        "doc":  ("GATE_5",  "Doc incomplete — Team 170/70 revises and re-runs Phase 5.1"),
        "full": ("GATE_3",  "Code issues found at doc review — return to implementation"),
    },
}
```

### 2.9 — Pipeline Certification Suite (Split: Deterministic + MCP Smoke)

**[FIX v1.0.1 — M-01]:** Test strategy split into two tiers. MCP-based browser verification cannot run in CI/pre-commit. The testing strategy is restructured as follows:

**Tier 1 — Deterministic pytest suite** (`agents_os_v2/tests/test_certification.py`):
- All routing logic, state transitions, prompt content (string matching), migration, fail/pass command behavior
- Runs in CI + pre-commit
- Must not require MCP, browser, or external tools
- Baseline: current suite = 127 tests passing (corrected from v1.0.0's stale "108")

**Tier 2 — MCP/Manual Smoke Suite** (documented in `docs-governance/04-PROCEDURES/PIPELINE_SMOKE_TESTS_v1.0.0.md`):
- Actual `./pipeline_run.sh` invocations with real state files
- Real MCP tool calls verifying state at each gate
- Executed manually before GATE_3 close and at GATE_4 Phase 4.1 by Team 90
- Not required in pre-commit (environment-bound)

**Iron Rule (revised):** No gate prompt generator is accepted without passing Tier-1 certification tests. Tier-2 smoke suite is required before GATE_4 Phase 4.1 validation by Team 90.

#### Tier-1 Certification Test Scenarios (pytest):

```
CERT_01: GATE_2 Phase 2.2 — AOS / TRACK_FOCUSED
  → team_11 prompt generated
  → work plan instructions present
  → output path: _COMMUNICATION/team_11/...

CERT_02: GATE_2 Phase 2.2 — TikTrack / TRACK_FULL
  → team_10 prompt generated (not team_11)

CERT_03: GATE_3 Phase 3.1 — AOS / TRACK_FOCUSED
  → team_11 mandate generation prompt
  → NOT teams_20_30

CERT_04: GATE_3 Phase 3.2 — AOS / TRACK_FOCUSED
  → team_61 implementation prompt
  → NOT teams_20_30

CERT_05: GATE_3 Phase 3.2 — TikTrack / TRACK_FULL
  → teams_20_30 implementation prompt

CERT_06: GATE_4 Phase 4.2 — lod200_author_team=team_101
  → team_101 arch review prompt (not team_100)

CERT_07: GATE_4 Phase 4.2 — lod200_author_team=team_100
  → team_100 arch review prompt

CERT_08: GATE_5 Phase 5.1 — AOS
  → team_170 doc closure prompt (NOT team_70)

CERT_09: GATE_5 Phase 5.1 — TikTrack
  → team_70 doc closure prompt (NOT team_170)

CERT_10: Correction cycle — GATE_3, remediation_cycle_count=2
  → CORRECTION_CYCLE_BANNER present in prompt
  → last_blocking_findings injected into prompt

CERT_11: `fail` command enforcement
  → last_blocking_findings written correctly
  → last_blocking_gate written correctly
  → remediation_cycle_count incremented

CERT_12: `pass` command with gate identifier
  → ./pipeline_run.sh --domain agents_os pass GATE_3 → succeeds if at GATE_3
  → ./pipeline_run.sh --domain agents_os pass GATE_2 → ABORTS if at GATE_3

CERT_13: State migration — old gate G3_6_MANDATES
  → PipelineState.load() with current_gate="G3_6_MANDATES"
  → After load: current_gate="GATE_3", current_phase="3.1"
  → Migration event logged

CERT_14: State migration — old gate G3_PLAN [v1.0.1 addition]
  → PipelineState.load() with current_gate="G3_PLAN"
  → After load: current_gate="GATE_2", current_phase="2.2"  ← corrected from v1.0.0

CERT_15: FCP-1 routing
  → fail with finding_type="doc" → state.fcp_level="FCP-1"
  → return_target_team set correctly
```

#### Tier-2 Smoke Scenarios (MCP/manual, required before GATE_4):

```
SMOKE_01: Full GATE_1→GATE_5 run (AOS / TRACK_FOCUSED)
  → End-to-end with actual ./pipeline_run.sh invocations
  → MCP state file read at each gate to confirm expected gate/phase
  → All 5 gates produce valid, team-addressed prompts
  → State advances correctly through all phases

SMOKE_02: Full GATE_1→GATE_5 run (TikTrack / TRACK_FULL)
  → Same as SMOKE_01 but for TikTrack variant

SMOKE_03: Correction cycle end-to-end
  → fail → correction banner in next prompt → pass → clean state
```

### 2.10 — Dashboard Alignment

The Dashboard Team Mandates panel currently reads from `G3_6_MANDATES`. Must be updated:
- When `state.current_gate == "GATE_3"` and `state.current_phase == "3.1"` → show mandate file
- Mandate file path lookup: `_COMMUNICATION/agents_os/prompts/{domain}_GATE_3_mandates.md`
- `GATE_MANDATE_FILES` in `pipeline.py` must be updated to map `"GATE_3"` → `"GATE_3_mandates.md"` (keyed to new gate IDs)
- `flags.waiting_human_approval` in dashboard must check `gate_state == "HUMAN_PENDING"` (not old gate IDs `WAITING_GATE2_APPROVAL` / `GATE_7`) — KB-37

---

## §3 — Known Bugs Register: Issues This WP Must Fix

The following KB entries are IN SCOPE for WP002:

| KB ID | Severity | Summary | Fix Location |
|---|---|---|---|
| KB-2026-03-19-26 | MEDIUM | Correction-cycle prompt not rendered; `pass`/`fail` don't enforce findings state | `pipeline.py` — all prompt generators + `fail`/`pass` handlers |
| KB-2026-03-19-27 | MEDIUM | GATE_2 skips Phase 2.2 + 2.2v; `WAITING_GATE2_APPROVAL` stale | `pipeline.py` — GATE_META + GATE_2 routing |
| KB-2026-03-19-28 | LOW | Team 90 `route_recommendation: doc` on PASS — protocol gap in verdict schema | Team 90 prompt template (Team 170 scope) + verdict parser (Team 61 scope) |
| KB-2026-03-19-29 | MEDIUM | G3_PLAN/G3_5/G3_6_MANDATES hardcoded team_10; ignores TRACK_FOCUSED | `pipeline.py` — routing table refactor |
| KB-2026-03-19-30 | MEDIUM | G3_REMEDIATION no prompt generator — "Unknown gate" | `pipeline.py` — remove G3_REMEDIATION from sequence + FCP handles re-routing |
| KB-2026-03-19-31 | MEDIUM | CURSOR_IMPLEMENTATION routes to teams_20_30 regardless of domain | `pipeline.py` — domain-aware routing + dashboard mandate panel |
| KB-2026-03-19-32 | HIGH | `FAIL_ROUTING` table uses old gate IDs as targets | `pipeline.py` — FAIL_ROUTING rewrite (§2.8) |
| KB-2026-03-19-33 | HIGH | `migrate_state.py` exists but `PipelineState.load()` does NOT call auto-migration | `state.py` — call `_run_migration()` in `load()` |
| KB-2026-03-19-34 | HIGH | GATE_5 prompt generator produces "Dev Validation / Team 90" content — wrong for GATE_5 | `pipeline.py` — `_generate_gate5_prompt()` rewrite |
| KB-2026-03-19-35 | MEDIUM | `GATE_MANDATE_FILES` maps to `G3_6_MANDATES` — must map to `GATE_3` with phase check | `pipeline.py` + dashboard |
| KB-2026-03-19-36 | MEDIUM | `pass` command has no gate identifier parameter — silent wrong-gate advance risk | `pipeline_run.sh` + CLI handler |
| KB-2026-03-19-37 | MEDIUM | Dashboard `flags.waiting_human_approval` checks old gate IDs | Dashboard JS + pipeline.py state view |
| KB-2026-03-19-38 | MEDIUM | No dry-run / certification test coverage | `agents_os_v2/tests/test_certification.py` (new) |
| KB-2026-03-19-39 | LOW | `GATE_ALIASES` maps old IDs to themselves (identity) — useless | `pipeline.py` — rewrite per §2.7 table |

---

## §4 — Required Deliverables

### D-01: `pipeline.py` — Full Rewrite of Gate Logic Layer
- [ ] `GATE_SEQUENCE` = 5 canonical gates only
- [ ] `GATE_META` — domain-unaware metadata only (desc, default_fail_route)
- [ ] `_DOMAIN_PHASE_ROUTING` — complete nested dict per §2.3 schema
- [ ] `_resolve_phase_owner(state, gate, phase)` — reads from `_DOMAIN_PHASE_ROUTING`, resolves sentinels
- [ ] One generator function per gate: `_generate_gate1_prompt()` through `_generate_gate5_prompt()`
- [ ] Each generator: correction-cycle banner + phase dispatch + domain routing
- [ ] `FAIL_ROUTING` — rewritten to 5-gate + FCP-level routing per §2.8
- [ ] `GATE_ALIASES` — maps old IDs to new canonical IDs per §2.7 migration table
- [ ] `pass` command: gate identifier parameter + BLOCK_FOR_FIX check per §2.5
- [ ] `fail` command: writes all correction-cycle fields per §2.4
- [ ] `GATE_MANDATE_FILES`: `GATE_3 → GATE_3_mandates.md` per §2.10

**[Team 101 addition — D-01 note]:** `PipelineState` in `state.py` MUST be migrated from dataclass to `pydantic.BaseModel`. Rationale: schema validation + type coercion on load from JSON eliminates entire class of state corruption bugs. Implementation guidance from Team 101:
```python
from pydantic import BaseModel, model_validator

class PipelineState(BaseModel):
    work_package_id: str
    current_gate: str
    current_phase: str
    process_variant: str = "TRACK_FOCUSED"
    # ... all existing fields ...

    @model_validator(mode="after")
    def _run_migration(self) -> "PipelineState":
        """Auto-migrate old gate IDs to canonical on load."""
        if self.current_gate in GATE_ALIASES:
            # apply migration table per §2.7
            ...
        return self
```
All downstream code that accesses PipelineState fields must remain functionally identical (same field names, same API). This is an internal refactor; no external contract changes.

### D-02: `migrate_state.py` — Auto-Migration on Load
- [ ] Complete migration table per §2.7 (including CORRECTED G3_PLAN → GATE_2/2.2)
- [ ] Called automatically from `PipelineState._run_migration()` (Pydantic validator) or `load()` classmethod
- [ ] Writes migration event to event log (stdout + event file)
- [ ] Saves migrated state
- [ ] Migrate TikTrack active WP on first load: `G3_6_MANDATES → GATE_3 / current_phase="3.1"`

### D-03: Pipeline Certification Suite
- [ ] File: `agents_os_v2/tests/test_certification.py` (new — per Team 101 naming)
- [ ] All 15 Tier-1 certification scenarios (CERT_01..CERT_15) implemented as pytest tests
- [ ] Tier-1 runs in CI + pre-commit
- [ ] Coverage: TRACK_FULL + TRACK_FOCUSED variants for each gate
- [ ] Smoke test documentation: `docs-governance/04-PROCEDURES/PIPELINE_SMOKE_TESTS_v1.0.0.md` (Tier-2)
- [ ] Tier-2 (SMOKE_01..SMOKE_03): manual execution required before GATE_4 Phase 4.1

### D-04: Dashboard Alignment
- [ ] Team Mandates panel: reads from `GATE_3` when `current_phase == "3.1"`
- [ ] `flags.waiting_human_approval`: reads `gate_state == "HUMAN_PENDING"` (not old gate IDs)
- [ ] Gate Timeline: display names updated to new canonical names
- [ ] Engine Assignment: confirmed working (AC-19 post-WP001)

### D-05: Team 90 Verdict Template Update (+ route_recommendation resolution)

**[FIX v1.0.1 — M-02 resolution]:** Team 190 identified a constitutional tension: LOD200 requires `route_recommendation` in Team 90 verdict templates, while role mapping says validators are verdict-only. **Team 100 resolution (granted as explicit exception):**

> `route_recommendation` is PERMITTED as optional classification metadata in `BLOCK_FOR_FIX` verdicts ONLY. It MUST NOT appear in `PASS` verdicts. It is not a routing command — it is classification context that the pipeline uses for FCP routing. This is consistent with the process-functional separation principle because it is data, not a routing action. The pipeline is the routing actor; Team 90 is the data source.

- [ ] GATE_4 Phase 4.1 prompt template for Team 90 — add verdict schema
- [ ] Verdict schema MUST include: `verdict: PASS | BLOCK_FOR_FIX`, `finding_type` (FCP ENUM), `fcp_level`
- [ ] `route_recommendation` field: ALLOWED in `BLOCK_FOR_FIX` only, PROHIBITED in `PASS`
- [ ] Closes KB-2026-03-19-28

### D-06: `pipeline_run.sh` — Gate Identifier Support
- [ ] `./pipeline_run.sh [--domain X] pass [GATE_ID]` — optional gate identifier
- [ ] If GATE_ID provided and != current_gate → abort with error message
- [ ] Update usage documentation in script header
- [ ] Closes KB-36

### D-07: Known Bugs Register + Registry Parity
- [ ] KB-26 through KB-39 marked `IN_REMEDIATION` at WP002 GATE_3 start
- [ ] All items CLOSED at WP002 GATE_5 pass
- [ ] **[FIX v1.0.1 — H-01]:** WP002 registered in `PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` (if not already done) — registry parity required between WSM + Program Registry + WP Registry at every gate state change

### D-08: Architectural Directive — Canonical File Naming Schema
- [ ] Path: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_CANONICAL_FILE_NAMING_v1.0.0.md`
- [ ] Owner: Team 100 drafts → Team 00 approves
- [ ] Content: §10 of this document, promoted to standalone directive
- [ ] Applies to all new files produced during WP002+

### D-09: `_read_coordination_file()` Update + CanonicalPathBuilder

**[Team 101 addition]:** Team 101 recommends a `CanonicalPathBuilder` utility class to centralize all canonical path construction and parsing:
- [ ] New file: `agents_os_v2/utils/path_builder.py`
- [ ] `CanonicalPathBuilder.build(sender, recipient, wp_id, gate, phase, doc_type, version)` → canonical filename
- [ ] `CanonicalPathBuilder.parse(filename)` → extracted fields dict
- [ ] `_read_coordination_file()` in `pipeline.py` updated to use `CanonicalPathBuilder.build()` as primary lookup
- [ ] Fallback: existing glob pattern preserved for legacy files (backward compat)

### D-10: WP002 Output Files — New Naming Schema Applied
- [ ] All new files produced in WP002 use the canonical schema from §10 / D-08
- [ ] No retroactive renames of existing files

### D-11: Governance Document Promotion [NEW — H-02]

**[FIX v1.0.1 — H-02]:** Dual-source governance risk: `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0` is now the canonical gate model, but `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` and `04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` still reference the old 0..8 gate model. Teams executing under old docs will produce incorrect work.

- [ ] Owner: Team 170 (doc owner) + Team 190 validation
- [ ] Add deprecation header to `04_GATE_MODEL_PROTOCOL_v2.3.0.md`:
  `⚠️ DEPRECATED — Superseded by ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0 for all new WPs. This document is retained for historical reference only.`
- [ ] Update `AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` §gate-references to point to GATE_SEQUENCE_CANON
- [ ] Team 170 produces promotion package → Team 190 validates → AS_MADE_LOCK at WP002 GATE_5
- [ ] This is a WP002 closure criterion (GATE_5 Phase 5.1 scope)

### D-12: SSOT Governance Audit [NEW — Iron Rule: Single Source of Truth]

**Context:** During WP002 Team 190 review, a systemic governance risk was identified: multiple documents can define the same concept with no explicit deprecation, creating competing sources of truth. Team 00 (Nimrod) has elevated this to an Iron Rule. See: `ARCHITECT_DIRECTIVE_SINGLE_SOURCE_OF_TRUTH_v1.0.0.md`.

**Mandate:** Teams 170 + 190 perform a full SSOT audit of all governance documentation within WP002 scope.

Scan locations:
- `documentation/docs-governance/01-FOUNDATIONS/`
- `documentation/docs-governance/04-PROCEDURES/`
- `_COMMUNICATION/_Architects_Decisions/`
- All team constitutions in `_COMMUNICATION/team_*/`

Look for:
- Superseded documents not yet archived
- Contradicting definitions of the same concept
- Duplicate iron rule definitions
- Stale references to old gate IDs, team IDs, or file paths

- [ ] Team 170 produces `TEAM_170_S003_P011_WP002_GATE_5_SSOT_AUDIT_REPORT_v1.0.0.md`
  - Lists all conflicts found + resolution applied or recommended
- [ ] Team 190 validates audit report and resolutions
- [ ] All discovered conflicts resolved (archive headers added to deprecated docs)
- [ ] This is a WP002 GATE_5 Phase 5.1 closure criterion
- [ ] Superseded document archive protocol per `ARCHITECT_DIRECTIVE_SINGLE_SOURCE_OF_TRUTH_v1.0.0.md`

---

## §5 — Team Assignments (TRACK_FOCUSED) + 4-Phase Execution Plan

**[Team 101 4-phase execution plan — adopted]**

```
Domain: agents_os
Track: TRACK_FOCUSED
LLD400 owner: Team 101 (AOS Domain Architect)
```

### Phase 1 — Foundation & Governance (GATE_2)

```
GATE_2 Phase 2.1 (LLD400):       Team 101 (AOS Domain Architect)
  → Produce LLD400 for D-01..D-11 based on this LOD200
  → Define implementation API contracts for all deliverables
  → Output: LLD400 document (schema for all new structures)

GATE_2 Phase 2.1v (Validate):    Team 190
  → Constitutional validation of LLD400
  → Verify D-01 architecture (pipeline.py rewrite contracts)
  → Verify D-03 test strategy completeness

GATE_2 Phase 2.2 (Work Plan):    Team 11 (AOS Gateway)
  → Implementation work plan for Team 61
  → Sequencing: D-02 (migrate) first, then D-01, then D-03, then D-04/D-06

GATE_2 Phase 2.2v (Review):      Team 90
  → Work Plan quality + feasibility review

GATE_2 Phase 2.3 (Sign-off):     Team 100
  → Architectural approval of LLD400 + Work Plan combined
  → GATE_2 close
```

### Phase 2 — Core Logic (GATE_3 Phase 3.1–3.2, first tier)

```
GATE_3 Phase 3.1 (Mandates):     Team 11
  → Produce implementation mandates for Team 61:
    - D-01 mandate: pipeline.py rewrite (CORE)
    - D-02 mandate: migrate_state.py / Pydantic migration
    - D-09 mandate: CanonicalPathBuilder

GATE_3 Phase 3.2 (Implementation): Team 61
  Sequence order (mandatory):
  1. D-02: PipelineState → Pydantic + _run_migration() + migration table (foundation)
  2. D-01: pipeline.py full rewrite (builds on D-02)
  3. D-09: CanonicalPathBuilder + _read_coordination_file() update
  4. D-08: Canonical file naming ADR draft (Team 100 to approve)
```

### Phase 3 — Content Generation (GATE_3 Phase 3.2, second tier)

```
  Team 61 continues:
  5. D-03: Pipeline Certification Suite (Tier-1 pytest + Tier-2 smoke docs)
  6. D-04: Dashboard alignment
  7. D-06: pipeline_run.sh gate identifier support

  Parallel track:
  8. D-05: Team 90 prompt template update (Team 170 writes → Team 100 validates)
  9. D-11: Governance docs promotion (Team 170 writes → Team 190 validates)

GATE_3 Phase 3.3 (QA):             Team 51
  → Verify all 15 CERT scenarios pass
  → Verify all D-01..D-10 deliverables present and correct
  → Verify no regression on existing 127+ tests
```

### Phase 4 — Certification & Alignment (GATE_4, GATE_5)

```
GATE_4 Phase 4.1:  Team 90
  → Dev validation of implementation
  → Execute Tier-2 smoke scenarios (SMOKE_01..SMOKE_03)

GATE_4 Phase 4.2:  Team 101 (lod200_author_team)
  → Architectural review — verify implementation matches LLD400

GATE_4 Phase 4.3:  Team 00 (Nimrod — human)
  → Final pipeline UX approval

GATE_5 Phase 5.1:  Team 170
  → AS_MADE documentation closure
  → Includes D-11 governance promotion package

GATE_5 Phase 5.2:  Team 90
  → AS_MADE_LOCK validation
```

---

## §6 — Iron Rules (Non-Negotiable)

1. **No hybrid gate sequences.** After WP002, old gate IDs must NOT appear in `current_gate` of any active pipeline state.
2. **Every prompt generator must be certified.** All CERT_01..CERT_15 must pass before GATE_3 closes.
3. **Tier-2 smoke tests required before GATE_4.** Real pipeline invocations with MCP state verification at each gate.
4. **Migration is automatic.** `PipelineState.load()` must auto-migrate old gate IDs — no manual edits required.
5. **All routing is domain/variant-aware.** Zero hardcoded team IDs in prompt generators. All team routing via `_resolve_phase_owner()` from `_DOMAIN_PHASE_ROUTING`.
6. **`fail` command always writes findings.** No exception. No silent fail.
7. **Gate identifier on `pass` is enforced.** If provided, it MUST match current state.
8. **No regression.** All 127+ existing tests must continue passing after this WP.
9. **Registry parity.** WSM + Program Registry + WP Registry must reflect consistent state at every gate close.
10. **Governance docs updated.** WP002 closure (GATE_5) is not complete until D-11 governance promotion is validated by Team 190.
11. **Single Source of Truth (Iron Rule — NEW).** Every governance concept has exactly ONE canonical source. Superseded documents must be explicitly archived (D-12). WP002 GATE_5 close requires Team 170 SSOT audit + Team 190 validation. See `ARCHITECT_DIRECTIVE_SINGLE_SOURCE_OF_TRUTH_v1.0.0.md`.

---

## §7 — Acceptance Criteria

### Process (Iron Rules verified by certification)
- [ ] AC-WP2-01: `CERT_01..CERT_15` all PASS in pytest (`test_certification.py`)
- [ ] AC-WP2-02: `./pipeline_run.sh --domain agents_os` at GATE_3 Phase 3.1 → prompt addressed to Team 11 (not Team 10)
- [ ] AC-WP2-03: `./pipeline_run.sh --domain tiktrack` at GATE_3 Phase 3.1 → prompt addressed to Team 10
- [ ] AC-WP2-04: `./pipeline_run.sh fail "reason"` → `last_blocking_findings` written to state file
- [ ] AC-WP2-05: `./pipeline_run.sh pass GATE_2` when at GATE_3 → abort with mismatch error
- [ ] AC-WP2-06: Active TikTrack WP (S002-P002-WP001) loads cleanly at `GATE_3 / current_phase="3.1"` via auto-migration
- [ ] AC-WP2-07: GATE_5 Phase 5.1 prompt (AOS) addressed to Team 170 (not Team 90)
- [ ] AC-WP2-08: GATE_5 Phase 5.1 prompt (TikTrack) addressed to Team 70 (not Team 170)
- [ ] AC-WP2-09: Correction-cycle banner appears in GATE_3 prompt when `remediation_cycle_count=1`
- [ ] AC-WP2-10: Team 90 verdict template enforces FCP ENUM schema; `route_recommendation` absent on PASS (KB-28 closed)

### Migration correctness
- [ ] AC-WP2-11-a: `G3_PLAN` → `GATE_2 / "2.2"` (v1.0.1 correction verified — CERT_14)
- [ ] AC-WP2-11-b: `G3_6_MANDATES` → `GATE_3 / "3.1"` (confirmed correct)

### Regression
- [ ] AC-WP2-12: `pytest agents_os_v2/` — all 127+ existing tests PASS (updated from v1.0.0 stale "108")
- [ ] AC-WP2-13: Dashboard renders correctly for AOS and TikTrack domains
- [ ] AC-WP2-14: `team_engine_config.json` R/W still works (engine editor not broken, AC-19 preserved)

### Documentation & Governance
- [ ] AC-WP2-15: KNOWN_BUGS_REGISTER KB-26..39 marked CLOSED
- [ ] AC-WP2-16: WSM + Program Registry + WP Registry show consistent WP002 state at every gate close **[NEW — H-01]**
- [ ] AC-WP2-17: `04_GATE_MODEL_PROTOCOL_v2.3.0.md` has deprecation header + pointer to GATE_SEQUENCE_CANON **[NEW — H-02]**
- [ ] AC-WP2-18: `AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` updated to reference GATE_SEQUENCE_CANON **[NEW — H-02]**

### Smoke (Tier-2 — verified by Team 90 at GATE_4 Phase 4.1)
- [ ] AC-WP2-19: SMOKE_01 (AOS GATE_1→GATE_5 end-to-end) PASS with MCP state evidence **[NEW — M-01]**
- [ ] AC-WP2-20: SMOKE_02 (TikTrack GATE_1→GATE_5 end-to-end) PASS **[NEW — M-01]**
- [ ] AC-WP2-21: SSOT audit report produced by Team 170, validated by Team 190; no unresolved conflicts **[NEW — Iron Rule SSOT]**
- [ ] AC-WP2-22: All superseded documents have explicit `⚠️ ARCHIVED` headers; no active document cites a deprecated source **[NEW — Iron Rule SSOT]**

---

## §8 — Scope Exclusions (Explicitly OUT)

- TikTrack domain feature work (S002-P003, etc.) — separate pipeline
- GATE_7 UX browser review automation
- Makefile (Option B) — separate mandate (Team 190)
- TRACK_FAST implementation — spec defined (GATE_SEQUENCE_CANON §4), implementation deferred
- New Dashboard features beyond mandate panel fix and gate timeline rename

---

## §9 — Registration Status (Updated)

WP002 is REGISTERED and ACTIVE. Pipeline state file confirms GATE_2 / Phase 2.1.

```
Program ID:     S003-P011
Work Package:   S003-P011-WP002
WP Title:       Pipeline Stabilization & Hardening
LOD200 Owner:   Team 100 (this document)
LLD400 Owner:   Team 101 (AOS Domain Architect)
Priority:       HIGH — blocks all AOS WPs and TikTrack active WP migration
Track:          TRACK_FOCUSED
Stage:          S003
Current Status: GATE_2 / Phase 2.1 — Team 101 producing LLD400
```

**Next action:** Team 101 → produce LLD400 for D-01..D-11 based on this LOD200 v1.0.1.

---

## §10 — Canonical File Naming Convention

### 10.1 — The Problem

Current naming in `_COMMUNICATION/team_*/` is partially canonical but lacks systematic type and phase encoding. Consequence: `_read_coordination_file()` cannot reliably glob/find files for a given WP+gate+phase combination.

### 10.2 — Canonical Naming Schema

**[FIX v1.0.1 — M-03]:** Field formerly named `domain` in v1.0.0 (which confusingly held a WP token format like `S003_P011_WP002`) is renamed `wp_id`. The field IS the work package identifier — not the project domain. This eliminates parser ambiguity in `_read_coordination_file()`.

**Format:**
```
TEAM_{sender}[_TO_TEAM_{recipient}]_{wp_id}_{GATE}[_PHASE_{phase}]_{TYPE}_{version}.{ext}
```

**Field definitions:**

| Field | Format | Example | Required |
|---|---|---|---|
| sender | `{2-3 digit team number}` | `100`, `11`, `170` | Always |
| recipient | `{2-3 digit team number}` | `61`, `170` | When directed to specific team |
| **wp_id** | `S{NNN}_P{NNN}_WP{NNN}` | `S003_P011_WP002` | Always ← renamed from "domain" in v1.0.0 |
| GATE | `GATE_{N}` | `GATE_3`, `GATE_5` | Always |
| phase | `{N.N}` | `3.1`, `4.2` | When phase-specific |
| TYPE | See TYPE ENUM below | `VERDICT`, `MANDATE` | Always |
| version | `v{major}.{minor}.{patch}` | `v1.0.0`, `v1.2.0` | Always |
| ext | `md` (documents), `json` (data) | `md` | Always |

**TYPE ENUM (canonical — locked):**

| TYPE | Meaning | Produced by | Consumed by |
|---|---|---|---|
| `LLD400` | Feature specification (formal) | Team 170/101/102 | Team 190 (validate), Team 100 (review) |
| `SPEC` | Lightweight spec / LOD200 | Team 100/00 | All |
| `WORKPLAN` | Work plan for gate execution | Team 10/11 | Team 90 (review), Team 100 (sign-off) |
| `MANDATE` | Implementation mandate/activation prompt | Team 10/11/100 | Implementing team |
| `VERDICT` | Validation verdict (PASS/BLOCK/PWA) | Validating team (90/190/100/51) | Pipeline (routing) |
| `REVIEW` | Architectural review (Team 100 only) | Team 100 | Team 00 (approval) |
| `CLOSURE` | GATE_5 AS_MADE documentation closure | Team 70/170 | Team 90 (lock validation) |
| `CORRECTION` | Targeted correction prompt after BLOCK | Team 190/90/100 | Receiving team |
| `DECISIONS` | Decision lock document | Team 00/100 | All teams |
| `ACTIVATION` | Team activation/onboarding prompt | Team 100/00 | Receiving team |
| `REPORT` | General report (fallback for misc) | Any team | — |
| `MIGRATION` | State/data migration artifact | Team 61/170 | Pipeline |

**Examples (canonical):**

```
# Team 100 → Team 61: mandate for GATE_3 Phase 3.2 implementation
TEAM_100_TO_TEAM_61_S003_P011_WP002_GATE_3_PHASE_3.2_MANDATE_v1.0.0.md

# Team 90: verdict for GATE_4 Phase 4.1 validation
TEAM_90_S003_P011_WP002_GATE_4_PHASE_4.1_VERDICT_v1.0.0.md

# Team 190: BLOCK correction prompt → Team 170
TEAM_190_TO_TEAM_170_S003_P011_WP002_GATE_1_CORRECTION_v1.0.0.md

# Team 101: LLD400 spec
TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.0.md

# Team 100: architectural review of Phase 4.2
TEAM_100_S003_P011_WP002_GATE_4_PHASE_4.2_REVIEW_v1.0.0.md

# Team 170: GATE_5 AS_MADE closure
TEAM_170_S003_P011_WP002_GATE_5_CLOSURE_v1.0.0.md
```

### 10.3 — Shorthand Rules

1. **Omit `_TO_TEAM_{N}`** when the document is self-referential (produced for own folder, not directed)
2. **Omit `_PHASE_{N.N}`** when the document covers the full gate (not phase-specific)
3. **Legacy files:** do NOT rename existing files — backward compat. Apply new schema to all new files in WP002+
4. **Version increments:** `v1.0.0` → `v1.0.1` for minor fixes / `v1.1.0` for significant updates / `v2.0.0` for full rewrites

### 10.4 — Pipeline Integration Requirement (CanonicalPathBuilder — D-09)

`_read_coordination_file()` in `pipeline.py` uses `CanonicalPathBuilder` (D-09):
- `CanonicalPathBuilder.build(sender, wp_id, gate, phase, doc_type, version, recipient=None)` → canonical filename
- Primary lookup: exact canonical name per §10.2
- Fallback: existing glob pattern (team folder + WP pattern) — preserved for legacy files
- Parser: `CanonicalPathBuilder.parse(filename)` → `{sender, recipient, wp_id, gate, phase, type, version}` dict

### 10.5 — This Naming Schema Is a Deliverable of WP002

- **D-08:** Publish as `ARCHITECT_DIRECTIVE_CANONICAL_FILE_NAMING_v1.0.0.md`
- **D-09:** `CanonicalPathBuilder` + `_read_coordination_file()` update
- **D-10:** All new WP002 files use new schema

---

## §11 — Open Decisions Requiring Team 00 (Nimrod) Approval

### [DECISION-WP2-01] Governance Source Hierarchy — GATE_SEQUENCE_CANON vs. 04_GATE_MODEL_PROTOCOL

**Status:** OPEN — requires Team 00 ratification before Team 170 executes D-11.

**Context:** Team 190 identified that `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0` defines the new 5-gate model, but `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` and `04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` still contain the old 0..8 gate model. Teams operating from old docs will produce incorrect work.

**Options:**

| Option | Scope | Action |
|---|---|---|
| A (Team 100 recommendation) | Global — both AOS and TikTrack | GATE_SEQUENCE_CANON supersedes 04_GATE_MODEL_PROTOCOL globally. Team 170 adds `⚠️ DEPRECATED` header to old doc. All new WPs (AOS + TikTrack) operate under GATE_SEQUENCE_CANON. |
| B | AOS only (WP002 scope) | GATE_SEQUENCE_CANON governs AOS domain only. TikTrack WPs still governed by old doc until TikTrack migration WP. |
| C | Defer | Leave dual-source state as-is until TikTrack S003 activation. Risk: TikTrack teams may execute incorrect gate model. |

**Team 100 recommendation:** Option A. The 5-gate model was designed to govern both domains (TRACK_FULL + TRACK_FOCUSED both present in GATE_SEQUENCE_CANON). Option B creates exactly the dual-source problem Team 190 flagged. Option C leaves known governance risk unresolved.

**If Team 00 approves Option A:** D-11 scope confirmed as written above. Team 170 executes deprecation during WP002 GATE_5 Phase 5.1.
**If Team 00 approves Option B:** D-11 scope reduced to AOS docs only; TikTrack deprecation deferred to separate WP.

---

## §12 — Change Log

| Version | Date | Changes |
|---|---|---|
| v1.0.0 | 2026-03-20 | Initial LOD200 — Team 100 draft |
| v1.0.1 | 2026-03-20 | BF-01: G3_PLAN migration corrected (GATE_2/2.2 not GATE_3/3.1); BF-02: header updated to ACTIVE/GATE_2; H-01: registry parity AC-WP2-16 added + D-07 updated; H-02: D-11 governance promotion added; M-01: test strategy split (Tier-1 pytest vs Tier-2 smoke), baseline corrected 108→127, CERT_14 added; M-02: route_recommendation resolved (allowed in BLOCK_FOR_FIX only, by Team 100 exception grant); M-03: naming schema field "domain" renamed to "wp_id"; Team 101 refinements adopted: Pydantic BaseModel (D-01), _DOMAIN_PHASE_ROUTING nested dict schema (§2.3), CanonicalPathBuilder (D-09), 4-phase execution plan (§5), Pipeline Certification Suite rename (D-03); DECISION-WP2-01 resolved (Option A — GATE_SEQUENCE_CANON global supersession approved by Team 00); D-12 added: SSOT governance audit (Iron Rule SSOT); AC-WP2-21/22 added; Iron Rule #11 added |

---

**log_entry | TEAM_100 | LOD200_v1.0.1 | S003_P011_WP002 | PIPELINE_STABILIZATION | ACTIVE | 2026-03-20**
