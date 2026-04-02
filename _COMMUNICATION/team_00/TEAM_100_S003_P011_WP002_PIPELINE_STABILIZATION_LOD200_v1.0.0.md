---
id: TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (Nimrod) — for approval and activation
date: 2026-03-20
status: DRAFT — awaiting Team 00 approval
program: S003-P011
wp: S003-P011-WP002
domain: agents_os
track: TRACK_FOCUSED
gate: GATE_1 (LOD200 pending registration)---

# S003-P011-WP002: Pipeline Stabilization & Hardening
## LOD200 — Requirements Specification (Full)

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
| GATE_5 | 5.1 | Prompt title says "Dev Validation / Team 90" — wrong content for GATE_5 | New |
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
There are unit tests for state management (108 passing), but:
- No integration test: "run a WP from GATE_1 to GATE_5 and verify all prompts are correct"
- No MCP-based validation: "verify the prompt generated at each phase matches what teams expect"
- No cross-variant test: "verify TRACK_FULL and TRACK_FOCUSED generate different team assignments"

### 1.7 — FCP Routing: Defined but Not Enforced

FAIL_ROUTING table exists in `pipeline.py`. FCP fields exist in state. But:
- `fail` command doesn't populate `finding_type` or `fcp_level`
- `FAIL_ROUTING` table uses old gate IDs (GATE_4 → CURSOR_IMPLEMENTATION, GATE_5 → CURSOR_IMPLEMENTATION)
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
- Preserved ONLY as `GATE_ALIASES` (backward-compat display, read-only)
- Any old gate ID encountered in state → auto-migrated via `migrate_state.py`

**Iron Rule:** After WP002, NO active pipeline state file may contain an old gate ID in `current_gate`. Migration must run automatically on load.

### 2.2 — Per-Gate, Per-Phase, Per-Domain Prompt Generator Architecture

Each gate must have a dedicated prompt generator function:
```python
def generate_gate_N_prompt(state: PipelineState) -> str:
    """
    Gate N prompt generator.
    Must:
    1. Read state.current_phase to determine which phase is active
    2. Read state.process_variant to determine team routing
    3. Read state.project_domain for domain-specific context
    4. Check correction-cycle condition:
       if state.last_blocking_gate == f"GATE_{N}" and state.remediation_cycle_count > 0:
           → render correction banner + inject last_blocking_findings
    5. Generate phase-appropriate prompt for the correct team
    """
```

**Required generator functions (minimum):**

| Gate | Function | Phase coverage |
|---|---|---|
| GATE_1 | `_generate_gate1_prompt()` | 1.1 (Nimrod+Team 100 LOD200), 1.2 (program registration) |
| GATE_2 | `_generate_gate2_prompt()` | 2.1 (Team 170/101 spec), 2.1v (Team 190), 2.2 (Team 11/10 work plan), 2.2v (Team 90), 2.3 (Team 100 sign-off) |
| GATE_3 | `_generate_gate3_prompt()` | 3.1 (Team 11/10 mandates), 3.2 (Team 61/20/30 impl), 3.3 (Team 51/50 QA) |
| GATE_4 | `_generate_gate4_prompt()` | 4.1 (Team 90 dev validation), 4.2 (Team 100 arch review), 4.3 (Team 00 human UX) |
| GATE_5 | `_generate_gate5_prompt()` | 5.1 (Team 170/70 AS_MADE), 5.2 (Team 90 lock) |

Each function MUST dispatch to a phase-specific sub-generator based on `state.current_phase`.

### 2.3 — Domain-Aware Team Routing Table (Complete)

The `_resolve_phase_owner()` function must be expanded to a complete lookup table:

```
GATE_2:
  Phase 2.1:  team_170 (AOS) / team_170 (TikTrack) — spec author same both domains
  Phase 2.1v: team_190 (both)
  Phase 2.2:  team_11 (TRACK_FOCUSED/AOS) / team_10 (TRACK_FULL/TikTrack)
  Phase 2.2v: team_90 (both)
  Phase 2.3:  state.lod200_author_team (both — reads state field)

GATE_3:
  Phase 3.1:  team_11 (TRACK_FOCUSED/AOS) / team_10 (TRACK_FULL/TikTrack)
  Phase 3.2:  team_61 (TRACK_FOCUSED/AOS) / [team_20, team_30, team_40] (TRACK_FULL/TikTrack)
  Phase 3.3:  team_51 (AOS) / team_50 (TikTrack)

GATE_4:
  Phase 4.1:  team_90 (both)
  Phase 4.2:  state.lod200_author_team (both — reads state field)
  Phase 4.3:  team_00 (human — both)

GATE_5:
  Phase 5.1:  team_170 (AOS) / team_70 (TikTrack)
  Phase 5.2:  team_90 (both)
```

This table must be the SINGLE canonical routing source. No hardcoded team IDs anywhere else in prompt generators.

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

The `[GATE_ID]` parameter is STRONGLY RECOMMENDED (per IDEA-050). Optional for backward compat.

Before advancing:
1. If `[GATE_ID]` provided: verify `state.current_gate == GATE_ID` (else abort with error)
2. If `state.last_blocking_gate == state.current_gate` AND `state.remediation_cycle_count > 0`:
   → WARN: "Active correction cycle detected. Are findings resolved? [y/n]"
3. Clear `last_blocking_findings` + `last_blocking_gate` on confirmed pass
4. Advance `current_gate` to next in GATE_SEQUENCE
5. Reset `current_phase` to first phase of next gate (e.g. "1.1" → "2.1")
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

`migrate_state.py` MUST handle the following automatic migrations on every `PipelineState.load()`:

| Old `current_gate` | New `current_gate` | New `current_phase` |
|---|---|---|
| `GATE_0` | `GATE_1` | `"1.2"` |
| `GATE_1` (old) | `GATE_2` | `"2.1v"` |
| `GATE_2` (old, if not migrated) | `GATE_2` | `"2.3"` |
| `WAITING_GATE2_APPROVAL` | `GATE_2` | `"2.3"` + `gate_state="HUMAN_PENDING"` |
| `G3_PLAN` | `GATE_3` | `"3.1"` |
| `G3_5` | `GATE_2` | `"2.2v"` |
| `G3_6_MANDATES` | `GATE_3` | `"3.1"` |
| `G3_REMEDIATION` | `GATE_3` | `"3.1"` (FCP return) |
| `CURSOR_IMPLEMENTATION` | `GATE_3` | `"3.2"` |
| `GATE_4` (old) | `GATE_3` | `"3.3"` |
| `GATE_5` (old) | `GATE_4` | `"4.1"` |
| `GATE_6` | `GATE_4` | `"4.2"` |
| `GATE_7` | `GATE_4` | `"4.3"` + `gate_state="HUMAN_PENDING"` |
| `GATE_8` | `GATE_5` | `"5.1"` |

Migration must:
1. Log migration event to pipeline event log
2. Save migrated state
3. NOT fail silently — print migration notice to stdout

**Active TikTrack WP migration (immediate):**
`pipeline_state_tiktrack.json`: `G3_6_MANDATES` → `GATE_3 / current_phase="3.1"`

### 2.8 — FAIL_ROUTING Table: Aligned to New Gate IDs

Current `FAIL_ROUTING` in `pipeline.py` uses old gate IDs as targets. Must be rewritten:

```python
FAIL_ROUTING = {
    "GATE_1": {
        "doc":  ("GATE_1",  "LLD400 doc/format issues — Team 170 fixes"),
        "full": ("GATE_1",  "LLD400 rejected — full rewrite required"),
    },
    "GATE_2": {
        "FCP-1": ("GATE_2",  "Wording/PWA — Team 10/11 direct fix → re-validate Phase 2.3"),
        "FCP-2": ("GATE_2",  "Work plan issue → Team 10/11 fix → re-validate Phase 2.3"),
        "FCP-2_spec": ("GATE_2",  "Spec issue → Team 170 fix → re-validate from Phase 2.1v"),
        "FCP-3": ("GATE_1",  "Full spec failure → Team 170 full rewrite"),
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

### 2.9 — Dry-Run Test Suite (MCP-Based End-to-End)

**Iron Rule for this WP:** No gate prompt generator is accepted without a passing dry-run test.

Each dry-run test scenario MUST:
1. Initialize a test WP with known state
2. Call the prompt generator
3. Verify the output contains the correct team ID, phase label, engine label, domain-specific routing
4. Cover both TRACK_FULL (TikTrack) and TRACK_FOCUSED (AOS) variants
5. Cover correction-cycle case (remediation_cycle_count > 0)

**Required test scenarios:**

```
DRY_RUN_01: GATE_2 Phase 2.2 — AOS / TRACK_FOCUSED
  → team_11 prompt generated
  → work plan instructions present
  → output path: _COMMUNICATION/team_11/...

DRY_RUN_02: GATE_2 Phase 2.2 — TikTrack / TRACK_FULL
  → team_10 prompt generated (not team_11)

DRY_RUN_03: GATE_3 Phase 3.1 — AOS / TRACK_FOCUSED
  → team_11 mandate generation prompt
  → NOT teams_20_30

DRY_RUN_04: GATE_3 Phase 3.2 — AOS / TRACK_FOCUSED
  → team_61 implementation prompt
  → NOT teams_20_30

DRY_RUN_05: GATE_3 Phase 3.2 — TikTrack / TRACK_FULL
  → teams_20_30 implementation prompt

DRY_RUN_06: GATE_4 Phase 4.2 — lod200_author_team=team_101
  → team_101 arch review prompt (not team_100)

DRY_RUN_07: GATE_4 Phase 4.2 — lod200_author_team=team_100
  → team_100 arch review prompt

DRY_RUN_08: GATE_5 Phase 5.1 — AOS
  → team_170 doc closure prompt (NOT team_70)

DRY_RUN_09: GATE_5 Phase 5.1 — TikTrack
  → team_70 doc closure prompt (NOT team_170)

DRY_RUN_10: Correction cycle — GATE_3, remediation_cycle_count=2
  → CORRECTION_CYCLE_BANNER present in prompt
  → last_blocking_findings injected into prompt

DRY_RUN_11: `fail` command enforcement
  → last_blocking_findings written correctly
  → last_blocking_gate written correctly
  → remediation_cycle_count incremented

DRY_RUN_12: `pass` command with gate identifier
  → ./pipeline_run.sh --domain agents_os pass GATE_3 → succeeds if at GATE_3
  → ./pipeline_run.sh --domain agents_os pass GATE_2 → ABORTS if at GATE_3

DRY_RUN_13: State migration — old gate G3_6_MANDATES
  → PipelineState.load() with current_gate="G3_6_MANDATES"
  → After load: current_gate="GATE_3", current_phase="3.1"
  → Migration event logged

DRY_RUN_14: FCP-1 routing
  → fail with finding_type="doc" → state.fcp_level="FCP-1"
  → return_target_team set correctly

DRY_RUN_15: Full GATE_1→GATE_5 run (AOS / TRACK_FOCUSED)
  → End-to-end dry-run with MCP state verification at each gate
  → All 5 gates produce valid, team-addressed prompts
  → State advances correctly through all phases
```

**MCP verification at each step:**
```python
# In each dry-run: verify via MCP tool
mcp_verify({
    "state_file": "pipeline_state_agentsos.json",
    "expected_gate": "GATE_3",
    "expected_phase": "3.1",
    "expected_team": "team_11",
    "prompt_contains": ["Team 11", "AOS Gateway", "Phase 3.1"],
})
```

### 2.10 — Dashboard Alignment

The Dashboard Team Mandates panel currently reads from `G3_6_MANDATES`. Must be updated:
- When `state.current_gate == "GATE_3"` and `state.current_phase == "3.1"` → show mandate file
- Mandate file path lookup: `_COMMUNICATION/agents_os/prompts/{domain}_GATE_3_mandates.md`
- `GATE_MANDATE_FILES` in `pipeline.py` must be updated to map `"GATE_3"` → `"GATE_3_mandates.md"`

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

**Additionally in scope (new items discovered in this architectural review):**

| New ID | Severity | Summary |
|---|---|---|
| NEW-01 | HIGH | `FAIL_ROUTING` table uses old gate IDs as targets (GATE_4 → CURSOR_IMPLEMENTATION) — invalid after 5-gate model |
| NEW-02 | HIGH | `migrate_state.py` exists but auto-migration on `PipelineState.load()` NOT implemented — TikTrack WP stranded |
| NEW-03 | HIGH | GATE_5 prompt generator produces "Dev Validation / Team 90" content — wrong for GATE_5 |
| NEW-04 | MEDIUM | `GATE_MANDATE_FILES` maps to `G3_6_MANDATES` — must be updated to `GATE_3` with phase check |
| NEW-05 | MEDIUM | `pass` command has no gate identifier parameter — silent wrong-gate advance risk (IDEA-050) |
| NEW-06 | MEDIUM | Dashboard `flags.waiting_human_approval` checks `WAITING_GATE2_APPROVAL` and `GATE_7` (old IDs) — must check `gate_state=="HUMAN_PENDING"` |
| NEW-07 | LOW | `GATE_ALIASES` dict maps old IDs to themselves (identity) — not useful; must map to new canonical IDs |
| NEW-08 | LOW | `STATE_VIEW.json` `flags.waiting_human_approval` checks old gate IDs — same as NEW-06 |

---

## §4 — Required Deliverables

### D-01: `pipeline.py` — Full Rewrite of Gate Logic Layer
- [ ] `GATE_SEQUENCE` = 5 canonical gates only
- [ ] `GATE_META` — domain-unaware metadata only (desc, default_fail_route)
- [ ] `_DOMAIN_PHASE_ROUTING` — complete domain/variant/phase → team routing table (§2.3)
- [ ] `_resolve_phase_owner()` — reads from `_DOMAIN_PHASE_ROUTING`
- [ ] One generator function per gate: `_generate_gate1_prompt()` through `_generate_gate5_prompt()`
- [ ] Each generator: correction-cycle banner + phase dispatch + domain routing
- [ ] `FAIL_ROUTING` — rewritten to 5-gate + FCP-level routing (§2.8)
- [ ] `GATE_ALIASES` — maps old IDs to new canonical IDs (§2.7 migration table)
- [ ] `pass` command: gate identifier parameter + BLOCK_FOR_FIX check (§2.5)
- [ ] `fail` command: writes all correction-cycle fields (§2.4)
- [ ] `GATE_MANDATE_FILES`: `GATE_3 → GATE_3_mandates.md` (§2.10)

### D-02: `migrate_state.py` — Auto-Migration on Load
- [ ] Complete migration table per §2.7
- [ ] Called automatically from `PipelineState.load()` if `current_gate` is an old ID
- [ ] Writes migration event to event log
- [ ] Saves migrated state
- [ ] Migrate TikTrack active WP: `G3_6_MANDATES → GATE_3 / current_phase="3.1"`

### D-03: Dry-Run Test Suite
- [ ] All 15 dry-run scenarios (§2.9) implemented as pytest tests
- [ ] MCP state verification at each gate
- [ ] Tests run as part of pre-commit hook
- [ ] Coverage: TRACK_FULL + TRACK_FOCUSED variants for each gate

### D-04: Dashboard Alignment
- [ ] Team Mandates panel: reads from `GATE_3` when `current_phase == "3.1"`
- [ ] `flags.waiting_human_approval`: reads `gate_state == "HUMAN_PENDING"` (not old gate IDs)
- [ ] Gate Timeline: display names updated to new canonical names
- [ ] Engine Assignment: confirmed working (AC-19 post-WP001)

### D-05: Team 90 Prompt Template Update
- [ ] GATE_4 Phase 4.1 prompt template for Team 90 — add verdict schema
- [ ] Verdict schema MUST include: `verdict: PASS | BLOCK_FOR_FIX`, `finding_type` (FCP ENUM), `fcp_level`
- [ ] `route_recommendation` MUST only appear when `verdict == BLOCK_FOR_FIX`
- [ ] Closes KB-2026-03-19-28

### D-06: `pipeline_run.sh` — Gate Identifier Support
- [ ] `./pipeline_run.sh [--domain X] pass [GATE_ID]` — optional gate identifier
- [ ] If GATE_ID provided and != current_gate → abort with error message
- [ ] Update usage documentation in script header

### D-07: Known Bugs Register — Update Status
- [ ] KB-26 through KB-31 marked `IN_REMEDIATION` at WP002 start
- [ ] NEW-01 through NEW-08 formally registered in KNOWN_BUGS_REGISTER
- [ ] All items CLOSED at WP002 GATE_5 pass

---

## §5 — Team Assignments (TRACK_FOCUSED)

```
Domain: agents_os
Track: TRACK_FOCUSED

GATE_2:
  Phase 2.2 (Work Plan):     Team 11 (AOS Gateway)
  Phase 2.2v (Review):       Team 90
  Phase 2.3 (Arch Sign-off): Team 100

GATE_3:
  Phase 3.1 (Mandates):      Team 11
  Phase 3.2 (Implementation): Team 61
    - D-01: pipeline.py rewrite (CORE)
    - D-02: migrate_state.py
    - D-03: dry-run test suite
    - D-04: dashboard alignment
    - D-06: pipeline_run.sh update
  Phase 3.3 (QA):             Team 51

GATE_4:
  Phase 4.1:  Team 90
  Phase 4.2:  Team 101 (AOS Domain Architect)
  Phase 4.3:  Team 00 (Nimrod — human)

GATE_5:
  Phase 5.1:  Team 170
  Phase 5.2:  Team 90

Separate track:
  D-05 (Team 90 template):   Team 170 writes template → Team 100 validates
```

---

## §6 — Iron Rules (Non-Negotiable)

1. **No hybrid gate sequences.** After WP002, old gate IDs must NOT appear in `current_gate` of any active pipeline state.
2. **Every prompt generator must be tested.** DRY_RUN suite must pass before GATE_3 closes.
3. **Dry-runs must use MCP.** Each dry-run scenario must verify state via MCP tool, not just string matching.
4. **Migration is automatic.** `PipelineState.load()` must auto-migrate old gate IDs — no manual edits required.
5. **All routing is domain/variant-aware.** Zero hardcoded team IDs in prompt generators. All team routing via `_resolve_phase_owner()` which reads `_DOMAIN_PHASE_ROUTING`.
6. **`fail` command always writes findings.** No exception. No silent fail.
7. **Gate identifier on `pass` is enforced.** If provided, it MUST match current state.
8. **No regression on pytest 108.** All existing tests must continue passing after this WP.

---

## §7 — Acceptance Criteria

### Process (Iron Rules verified by dry-run)
- [ ] AC-WP2-01: `DRY_RUN_01..15` all PASS in pytest
- [ ] AC-WP2-02: `./pipeline_run.sh --domain agents_os` produces GATE_3 Phase 3.1 prompt addressed to Team 11 (not Team 10)
- [ ] AC-WP2-03: `./pipeline_run.sh --domain tiktrack` at GATE_3 Phase 3.1 produces prompt addressed to Team 10
- [ ] AC-WP2-04: `./pipeline_run.sh fail "reason"` → `last_blocking_findings` written to state file
- [ ] AC-WP2-05: `./pipeline_run.sh pass GATE_2` at GATE_3 → abort with mismatch error
- [ ] AC-WP2-06: Active TikTrack WP (S002-P002-WP001) loads cleanly at `GATE_3 / current_phase="3.1"`
- [ ] AC-WP2-07: GATE_5 Phase 5.1 prompt (AOS) addressed to Team 170 (not Team 90)
- [ ] AC-WP2-08: GATE_5 Phase 5.1 prompt (TikTrack) addressed to Team 70 (not Team 170)
- [ ] AC-WP2-09: Correction-cycle banner appears in GATE_3 prompt when `remediation_cycle_count=1`
- [ ] AC-WP2-10: Team 90 verdict template enforces FCP ENUM schema (KB-28 closed)

### Regression
- [ ] AC-WP2-11: `pytest agents_os_v2/` — all 108 existing tests PASS
- [ ] AC-WP2-12: Dashboard renders correctly for AOS and TikTrack domains
- [ ] AC-WP2-13: `team_engine_config.json` R/W still works (engine editor not broken)

### Documentation
- [ ] AC-WP2-14: KNOWN_BUGS_REGISTER KB-26..31 + NEW-01..08 marked CLOSED
- [ ] AC-WP2-15: GATE_SEQUENCE_CANON §8 migration table updated to reflect WP002 completion

---

## §10 — Canonical File Naming Convention (Required Deliverable)

**Implementing directly because:** Nimrod explicitly requested this architectural addition for this session.

### 10.1 — The Problem

Current naming in `_COMMUNICATION/team_*/` is partially canonical but lacks systematic type and phase encoding. Examples of current ambiguity:
- `TEAM_100_TO_TEAM_11_S003_P011_WP001_PHASE31_MANDATE_PROMPT_v1.0.0.md` — acceptable
- `TEAM_90_TO_TEAM_11_PHASE22V_VALIDATION_RESPONSE_v1.0.0.md` — missing domain, WP-ID
- `TEAM_170_S003_P011_WP001_GATE5_AS_MADE_CLOSURE_v1.0.0.md` — acceptable but TYPE missing in older files

Consequence: the system, the pipeline, and teams cannot reliably glob/find files for a given WP+gate+phase combination, making the coordination file lookup in `_read_coordination_file()` fragile.

### 10.2 — Canonical Naming Schema

**Format:**
```
TEAM_{sender}[_TO_TEAM_{recipient}]_{domain}_{WP_ID}_{GATE}[_PHASE_{phase}]_{TYPE}_{version}.{ext}
```

**Field definitions:**

| Field | Format | Example | Required |
|---|---|---|---|
| sender | `{2-3 digit team number}` | `100`, `11`, `170` | Always |
| recipient | `{2-3 digit team number}` | `61`, `170` | When directed to specific team |
| domain | `S{NNN}_P{NNN}_WP{NNN}` | `S003_P011_WP002` | Always |
| GATE | `GATE_{N}` | `GATE_3`, `GATE_5` | Always |
| phase | `{N.N}` | `3.1`, `4.2` | When phase-specific |
| TYPE | See TYPE ENUM below | `VERDICT`, `MANDATE` | Always |
| version | `v{major}.{minor}.{patch}` | `v1.0.0`, `v1.2.0` | Always |
| ext | `md` (documents), `json` (data) | `md` | Always |

**TYPE ENUM (canonical — locked):**

| TYPE | Meaning | Produced by | Consumed by |
|---|---|---|---|
| `SPEC` / `LLD400` | Feature specification | Team 170/101/102 | Team 190 (validate), Team 100 (review) |
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

# Team 170: LLD400 spec
TEAM_170_S003_P011_WP002_GATE_2_LLD400_v1.0.0.md

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

### 10.4 — Pipeline Integration Requirement

`_read_coordination_file()` in `pipeline.py` must be updated to use this schema:
- Given: `(sender_team, domain, wp_id, gate, phase, type)` → generate canonical filename candidate
- Primary lookup: exact canonical name per §10.2
- Fallback: existing glob pattern (team folder + WP pattern) — preserved for legacy files
- This makes file discovery deterministic rather than heuristic

### 10.5 — This Naming Schema Is a Deliverable of WP002

- **D-08:** Publish canonical naming schema as an Architectural Directive
  - Path: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_CANONICAL_FILE_NAMING_v1.0.0.md`
  - Owner: Team 100 drafts → Team 00 approves
  - Content: this §10 section, promoted to standalone directive
- **D-09:** Update `_read_coordination_file()` per §10.4
- **D-10:** Apply naming schema to all new WP002 output files (retroactive only if trivial rename)

---

## §8 — Scope Exclusions (Explicitly OUT)

- TikTrack domain feature work (S002-P003, etc.) — separate pipeline
- GATE_7 UX browser review automation
- Makefile (Option B) — separate mandate (Team 190)
- TRACK_FAST implementation — spec defined (GATE_SEQUENCE_CANON §4), implementation deferred
- New Dashboard features beyond mandate panel fix and gate timeline rename

---

## §9 — Recommended Registration

```
Program ID:     S003-P011
Work Package:   WP002
WP Title:       Pipeline Stabilization & Hardening
LOD200 Owner:   Team 100 (this document)
LLD400 Owner:   Team 101 (AOS Domain Architect)
Priority:       HIGH — blocks all AOS WPs and TikTrack active WP migration
Track:          TRACK_FOCUSED
Stage:          S003
Status:         GATE_1 pending — awaiting Team 00 approval
```

**Recommended sequence:**
1. Team 00 (Nimrod) approves this LOD200 → registers in PHOENIX_PROGRAM_REGISTRY
2. Team 101 produces LLD400 → Team 190 validates
3. Team 11 produces Work Plan → Team 90 reviews → Team 100 signs off (GATE_2)
4. Team 61 implements (GATE_3) with mandatory dry-run test suite
5. Team 51 QA, Team 90 validation, Team 101 arch review, Nimrod human approval (GATE_4)
6. Team 170 AS_MADE closure (GATE_5)

---

**log_entry | TEAM_100 | LOD200 | S003_P011_WP002 | PIPELINE_STABILIZATION | DRAFT | 2026-03-20**
