---
project_domain: AGENTS_OS
id: ARCHITECT_DIRECTIVE_STATE_SCAN_INACTIVE_GATES_FIX_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
date: 2026-03-19
status: LOCKED
type: BUG_FIX + PREVENTION_RULE---

# Architectural Directive — State Scan Inactive Gates Fix
## `_INACTIVE_GATES` Expansion + Data Reset

---

## §1 — Bug Description

**File:** `agents_os_v2/orchestrator/state.py` — `PipelineState.load()` domain scan

**Original (broken):**
```python
_INACTIVE_GATES = {"", "GATE_0", "NOT_STARTED"}
_PLACEHOLDER_WPS = {"", "REQUIRED"}
```

**Fixed:**
```python
_INACTIVE_GATES = {"", "GATE_0", "NOT_STARTED", "COMPLETE", "NONE"}
_PLACEHOLDER_WPS = {"", "REQUIRED", "NONE"}
```

---

## §2 — Root Cause Chain

During S003-P010 QA sprint (2026-03-19), Team 51 ran `PipelineState.load().save()` without `--domain` to validate state persistence. At the time:

| Domain | `current_gate` | In `_INACTIVE_GATES` before fix |
|---|---|---|
| agents_os | GATE_0 (early sprint phase) | ✅ YES — skipped correctly |
| tiktrack | G3_6_MANDATES (stale S002 data) | ❌ NO — incorrectly selected as "active" |

`PipelineState.load()` found only tiktrack as "active" → returned stale S002 state → `save()` called → `last_updated` bumped to 2026-03-19 on S002-P002-WP001 data → dashboard displays stale WP.

Secondary effect: `STATE_VIEW.json` was written from a synthetic test state (S002-P001-WP001, GATE_3) during another QA test call.

---

## §3 — Why "COMPLETE" and "NONE" Were Missing

The original `_INACTIVE_GATES` was designed for the pipeline-start scenario: "is this domain ready to start a new WP?" At the time of writing, the assumption was that COMPLETE states would be immediately replaced by the next WP. In a multi-domain environment with asynchronous WP lifecycles (tiktrack and agents_os advance independently), a COMPLETE domain state can coexist with an active one — and both were incorrectly treated as candidates.

---

## §4 — Data Repair (2026-03-19)

| File | Before | After |
|---|---|---|
| `pipeline_state_tiktrack.json` | S002-P002-WP001 at G3_6_MANDATES (stale) | NONE sentinel (work_package_id=NONE, current_gate=NONE) |
| `STATE_VIEW.json` | S002-P001-WP001 at GATE_3 (synthetic test artifact) | S003-P009-WP001 at COMPLETE, pipeline_health=IDLE |

---

## §5 — Prevention Rules (Iron Rules — effective immediately)

**RULE 1 — `_INACTIVE_GATES` must include terminal states:**
Any gate that represents a "no work in progress" condition MUST be in `_INACTIVE_GATES`. Terminal states are: `""`, `"GATE_0"`, `"NOT_STARTED"`, `"COMPLETE"`, `"NONE"`.

**RULE 2 — Test state isolation:**
QA sprint tests that call `PipelineState.load()` or `PipelineState.save()` MUST use explicit `--domain` flag or `PipelineState.load_domain("agents_os")`. Never rely on auto-scan during test runs that manipulate both domain state files.

**RULE 3 — State file reset on WP close:**
When GATE_8 PASS is processed for a domain, the domain state should be confirmed at `current_gate="COMPLETE"`. Stale states from incomplete WP lifecycles (orphaned mid-pipeline) must be manually reset by Team 00 via data repair (not via pipeline — there is no automated cleanup for orphaned WPs).

**RULE 4 — STATE_VIEW.json source:**
`STATE_VIEW.json` MUST always reflect the most recent `PipelineState.save()` from an actual pipeline run — not from test synthetic states. Any test that calls `state.save()` on a synthetic state must restore STATE_VIEW.json afterward, OR use a patched output path.

---

## §6 — Dashboard Behavior Post-Fix

After fix:
- tiktrack domain: displays "No active WP" (WP=NONE, gate=NONE)
- agents_os domain: displays COMPLETE (S003-P009, health=IDLE)
- Next WP activation will set the correct domain state via `pipeline_run.sh GATE_0`

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | STATE_SCAN_INACTIVE_GATES_FIX | _INACTIVE_GATES_EXPANDED | DATA_REPAIRED | 2026-03-19**
