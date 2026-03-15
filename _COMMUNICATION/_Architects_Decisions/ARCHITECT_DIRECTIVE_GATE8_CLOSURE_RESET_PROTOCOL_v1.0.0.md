---
document_id:   ARCHITECT_DIRECTIVE_GATE8_CLOSURE_RESET_PROTOCOL_v1.0.0
author:        Team 00 — Chief Architect
date:          2026-03-15
status:        LOCKED — Iron Rule
authority:     Team 00 constitutional authority + Nimrod approval
trigger:       Team 191 identified active-gate ambiguity during commit — S002_P003_WP002_GATE8 detected
               in portfolio_snapshot.md despite no active work package existing in execution
---

# ARCHITECT DIRECTIVE — GATE_8 Closure Reset Protocol v1.0.0

## Root Cause Analysis (2026-03-15)

Team 191 flagged: `current_gate: GATE_8` in `portfolio_snapshot.md` with
`active_work_package_id: N/A`. This creates a false-positive: the snapshot looks like
GATE_8 is in active execution when in fact the lifecycle is DOCUMENTATION_CLOSED.

**Three concurrent defects identified:**

### Defect 1 — WSM `current_gate` sentinel gap
After GATE_8 PASS, the WSM `current_gate` field is **not reset**. It retains the value `GATE_8`
from the closing lifecycle. This means after GATE_8 PASS:
```
current_gate:           GATE_8        ← looks like "in GATE_8 now"
active_work_package_id: N/A           ← no WP active
```
These two fields are semantically contradictory. `current_gate` should mean "the gate currently
in active execution," not "the last gate that was processed."

### Defect 2 — WP registry premature closure (S002-P003-WP002)
WP registry shows `S002-P003-WP002: CLOSED / GATE_8 (PASS) / 2026-03-07`. However:
- MEMORY.md (updated 2026-03-11) shows WP002 still at GATE_7 awaiting Nimrod sign-off
- GATE_7 was confirmed by Nimrod on 2026-03-15
- GATE_8 was activated on 2026-03-15 (not 2026-03-07)
Team 170 prematurely synced a CLOSED state before GATE_7/GATE_8 were complete.

### Defect 3 — pipeline_state_tiktrack.json stale artifact
`_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` shows `current_gate: GATE_0` with
`gates_failed: ["GATE_0"]`. This is a stale broken artifact from a session that tried to start
a new WP and failed at GATE_0. It was never cleaned up after S002-P003-WP002 became active.
This file should reflect the actual active pipeline CLI state for the TikTrack domain.

---

## IRON RULES — Effective Immediately

### Rule 1 — `current_gate` must be `N/A` after GATE_8 PASS

**Iron Rule:** When GATE_8 PASS is issued and a WP transitions to DOCUMENTATION_CLOSED:

```
WSM field:    current_gate → "N/A (post-GATE_8_PASS)"
WSM field:    active_work_package_id → "N/A"
WSM field:    active_program_id → N/A (or omit until next activation)
WSM field:    active_flow → "[WP_ID] — GATE_8 PASS / DOCUMENTATION_CLOSED — no active WP"
```

The previous gate number is preserved in `last_gate_event` (already contains full context).
Setting `current_gate = N/A` removes the false-positive of "GATE_8 is active."

**Who enforces:** Team 10 (WSM update after GATE_8 PASS). Team 90 reminder in GATE_8 PASS
output: "Include `current_gate: N/A` instruction in Team 10 WSM update package."

### Rule 2 — WP registry `is_active` and `current_gate` must be consistent

**Iron Rule:** At all times, the WP registry must satisfy:

| Active state | `is_active` | `current_gate` | `status` |
|---|---|---|---|
| WP in active execution (any gate) | `true` | `GATE_X (ACTIVE)` | `IN_PROGRESS` |
| WP has passed GATE_8 (lifecycle closed) | `false` | `GATE_8 (PASS)` | `CLOSED` |
| No WP active (between packages) | — | all `false` | — |

There must never be a WP with `is_active = false` and `status = CLOSED` that contradicts the
WSM `active_work_package_id` (i.e., if WSM has an active WP, the registry row must be `is_active = true`).

**Who enforces:** Team 170 sync runs `sync_registry_mirrors_from_wsm.py --write` after every
WSM update. NEVER mark a WP as CLOSED before GATE_8 PASS is confirmed.

### Rule 3 — pipeline_state_DOMAIN.json must be reset after GATE_8 PASS

**Iron Rule:** After GATE_8 PASS, Team 10 (or Team 60 on instruction) MUST reset the domain's
`pipeline_state_DOMAIN.json` to the canonical post-closure state:

```json
{
  "pipe_run_id": "[new UUID]",
  "work_package_id": "NONE",
  "stage_id": "[current stage]",
  "project_domain": "[domain]",
  "spec_brief": "",
  "current_gate": "NONE",
  "gates_completed": [],
  "gates_failed": [],
  "lld400_content": "",
  "work_plan": "",
  "mandates": "",
  "implementation_files": [],
  "implementation_endpoints": [],
  "spec_path": "",
  "started_at": "",
  "last_updated": "[ISO timestamp of GATE_8 PASS]",
  "gate_state": null,
  "pending_actions": [],
  "override_reason": null
}
```

This canonical "no active WP" state is what Team 191 expects when checking for active pipeline
work. `current_gate: "NONE"` (or `""`) is the unambiguous sentinel — NOT `"GATE_0"`, NOT `"GATE_8"`.

**Who resets:** Team 10 (TikTrack domain), Team 51 (Agents_OS domain) — as part of GATE_8 PASS
processing sequence, after WSM is updated.

### Rule 4 — GATE_8 PASS sequence is atomic (6 steps)

**Iron Rule:** Team 90 GATE_8 PASS package triggers this mandatory 6-step sequence in order:

```
Step 1: Team 90 issues GATE_8 PASS document
Step 2: Team 10 updates WSM:
        - current_gate → "N/A (post-GATE_8_PASS)"
        - active_work_package_id → "N/A"
        - last_closed_work_package_id → [WP_ID]
        - last_gate_event → "GATE_8_PASS_DOCUMENTATION_CLOSED; [date]; [ref]"
Step 3: Team 170 syncs WP registry (sync_registry_mirrors_from_wsm.py --write):
        - WP row: is_active=false, status=CLOSED, current_gate="GATE_8 (PASS)"
Step 4: Team 10 OR Team 60 resets pipeline_state_DOMAIN.json to canonical NONE state
Step 5: Run: python3 scripts/portfolio/build_portfolio_snapshot.py --write
        Verify: runtime.current_gate = "N/A (post-GATE_8_PASS)" in snapshot
Step 6: Team 191 runs pre-push guard: confirm NO active-gate ambiguity detected
```

Only after Step 6 PASS is the lifecycle considered fully closed in all state files.

---

## Prohibited Patterns

1. **Never leave `current_gate: GATE_8` after GATE_8 PASS** — always reset to `N/A`
2. **Never mark a WP as CLOSED before GATE_8 PASS is confirmed** — is_active must be true until the PASS is issued
3. **Never leave pipeline_state_DOMAIN.json with a stale gate** — broken session artifacts must be cleaned up immediately by Team 10/60
4. **Never skip Step 6 (Team 191 guard verification)** — the 6-step sequence is atomic

---

## Impact on Snapshot Check

The `build_portfolio_snapshot.py --check` script validates:
```python
if active_program_id and current_gate:   # triggers if both non-empty, non-N/A
    ... check program gate mirror ...
```

After this directive, when `current_gate = "N/A (post-GATE_8_PASS)"`:
- `if active_program_id and current_gate` → the N/A value makes this check context-aware
- The existing `NO_ACTIVE_MARKERS` set in `build_portfolio_snapshot.py` should be extended
  to include "N/A (post-GATE_8_PASS)" variants

**Note for Team 61 (future enhancement):** Update `NO_ACTIVE_MARKERS` in
`scripts/portfolio/build_portfolio_snapshot.py` to include:
```python
no_active_markers = {"", "N/A", "—", "-", "NONE", "N/A (post-GATE_8_PASS)"}
```
And add the same to the `current_gate` check:
```python
no_active_gate_markers = {"", "N/A", "NONE", "N/A (post-GATE_8_PASS)"}
if active_program_id and current_gate not in no_active_gate_markers:
    ... check program gate mirror ...
```
This change is low-risk (1 line) and should be included in the immediate correction mandate.

---

## Immediate Correction Required (2026-03-15)

Three state corrections are required immediately (see mandate:
`TEAM_00_TO_TEAM_10_TEAM_170_GATE8_STATE_CORRECTION_MANDATE_v1.0.0.md`):

1. **WSM `current_gate`**: Currently `GATE_8` (stale from S002-P005-WP002 GATE_8 PASS).
   Must be updated to reflect S002-P003-WP002 GATE_8 ACTIVATED state.

2. **WP registry S002-P003-WP002**: Currently CLOSED/GATE_8 PASS/2026-03-07 (premature).
   Must be corrected to IN_PROGRESS/GATE_8 (ACTIVATED)/is_active=true.

3. **pipeline_state_tiktrack.json**: Currently `GATE_0 FAILED` (stale artifact).
   Must be reset to reflect S002-P003-WP002 GATE_8 ACTIVATED state.

---

**log_entry | TEAM_00 | DIRECTIVE_LOCKED | GATE8_CLOSURE_RESET_PROTOCOL | TEAM_191_TRIGGER | 2026-03-15**
