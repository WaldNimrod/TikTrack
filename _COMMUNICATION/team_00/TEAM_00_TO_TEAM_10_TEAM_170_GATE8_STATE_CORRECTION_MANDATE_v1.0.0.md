---
document_id:   TEAM_00_TO_TEAM_10_TEAM_170_GATE8_STATE_CORRECTION_MANDATE_v1.0.0
from:          Team 00 — Chief Architect
to:            Team 10 (WSM + pipeline state), Team 170 (WP registry + snapshot)
cc:            Team 191 (verification), Team 61 (snapshot check fix)
date:          2026-03-15
status:        SUPERSEDED_HISTORICAL
historical_record: true
superseded_by: documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md (S002-P003-WP002 GATE_8 PASS 2026-03-07)
execution_status: VOIDED_DO_NOT_EXECUTE
authority:     Team 00 constitutional authority + Nimrod approval
subject:       SUPERSEDED — historical correction mandate (retained for audit only)
---

# IMMEDIATE STATE CORRECTION MANDATE

## SUPERSEDED NOTICE (Do Not Execute)

This mandate is retained for traceability only and must not be executed.

- Canonical runtime/registry state already confirms `S002-P003-WP002` closed at `GATE_8 PASS` on `2026-03-07`.
- Current SSOT program focus is `S002-P005` (per WSM active program).
- Any operational update must follow current WSM/registry state and not this historical correction flow.

## Context

Team 191 flagged an active-gate ambiguity during a commit:
`portfolio_snapshot` shows `current_gate: GATE_8` + `active_work_package_id: N/A` simultaneously.

Root causes have been analyzed and a governance directive issued:
`ARCHITECT_DIRECTIVE_GATE8_CLOSURE_RESET_PROTOCOL_v1.0.0.md`

Three state corrections are required immediately:

---

## Part A — Team 10: Update WSM for S002-P003-WP002 GATE_8 Activation

**Trigger:** GATE_8 has been activated for S002-P003-WP002 as of 2026-03-15 (Nimrod confirmed
GATE_7 PASS; mandate issued: `TEAM_00_TO_TEAM_90_S002_P003_WP002_GATE8_ACTIVATION_v1.0.0.md`).

The WSM currently shows S002-P005 as active program (last closed WP). It must be updated to
reflect S002-P003-WP002 as the currently active work package.

**WSM `CURRENT_OPERATIONAL_STATE` fields to update:**

```
| active_flow              | S002-P003-WP002 (TikTrack Alignment D22/D33/D34/D35) — GATE_8 ACTIVATED 2026-03-15. Team 70 producing AS_MADE docs. Team 90 validation pending. S003 GATE_0 trigger authorized after GATE_8 PASS. |
| active_stage_id          | S002 |
| active_program_id        | S002-P003 |
| active_work_package_id   | S002-P003-WP002 |
| current_gate             | GATE_8 |
| last_gate_event          | GATE_7_PASS_NIMROD_CONFIRMED; 2026-03-15; Nimrod confirmed GATE_7 for S002-P003-WP002 (D22/D33/D34/D35); GATE_8 activation mandate issued to Team 90. |
| next_required_action     | Team 70: produce AS_MADE documentation for D22/D33/D34/D35. Team 90: validate and issue GATE_8 PASS. |
| next_governance_event    | S002-P003-WP002 GATE_8 PASS → S003 GATE_0 activation for P001/P002 |
| phase_owner_team         | Team 90 (GATE_8 owner) |
| last_closed_work_package_id | S002-P005-WP002 (GATE_8 PASS 2026-03-15; DOCUMENTATION_CLOSED) |
| last_closed_program_id   | S002-P005 (GATE_8 PASS 2026-03-15) |
```

**Note:** `current_gate: GATE_8` here is CORRECT for the active state. Per directive, after
GATE_8 PASS it must be reset to `N/A (post-GATE_8_PASS)` — but right now GATE_8 is active.

Also update the Gate-owner update evidence header in the WSM block:
```
**Gate-owner update evidence:** This block was updated 2026-03-15 by Team 10 — S002-P003-WP002
GATE_8 ACTIVATED; GATE_7 confirmed by Nimrod; GATE_8 mandate issued to Team 90.
```

**WSM log entry to add:**
```
**log_entry | TEAM_10 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | S002-P003-WP002 GATE_8 ACTIVATED; GATE_7 confirmed Nimrod 2026-03-15; GATE_8 mandate issued Team 90 | 2026-03-15**
```

---

## Part B — Team 170: Correct WP Registry for S002-P003-WP002

**Problem:** WP registry shows `S002-P003-WP002: CLOSED / GATE_8 (PASS) / is_active=false /
"Lifecycle complete 2026-03-07"`. This is INCORRECT — GATE_7 was only confirmed 2026-03-15.

The premature CLOSED state was a sync error (Team 170 synced a future state before it was real).

**Correction required in PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md:**

Change S002-P003-WP002 row from:
```
| S002-P003 | S002-P003-WP002 | CLOSED | GATE_8 (PASS) | false | Lifecycle complete 2026-03-07 |
```

To:
```
| S002-P003 | S002-P003-WP002 | IN_PROGRESS | GATE_8 (ACTIVE) | true | GATE_8 ACTIVATED 2026-03-15; GATE_7 PASS confirmed Nimrod; AS_MADE docs pending Team 70 → Team 90 |
```

Also update the "Current active WP state" block at the bottom of the registry to:
```
**Current active WP state (mirror from WSM):** S002-P003-WP002 — GATE_8 ACTIVE —
WSM `active_stage_id=S002`, `active_program_id=S002-P003`,
`current_gate=GATE_8`, `active_work_package_id=S002-P003-WP002`.
```

**WP registry log entry to add:**
```
**log_entry | TEAM_170 | PHOENIX_WORK_PACKAGE_REGISTRY | S002_P003_WP002_CORRECTED_PREMATURE_CLOSED_GATE8_ACTIVATED | 2026-03-15**
```

**After Part A (WSM update) is complete:** Run:
```bash
python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --write
```
This will re-sync all mirror fields from the corrected WSM.

---

## Part C — Team 10: Reset pipeline_state_tiktrack.json

**Problem:** `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` shows:
```json
{
  "current_gate": "GATE_0",
  "gates_failed": ["GATE_0"],
  ...
}
```
This is a stale broken artifact from a previous session that tried to start a new WP and
failed at GATE_0. It was never cleaned up.

**Action:** Reset the file to reflect S002-P003-WP002 at GATE_8 ACTIVE state.

Per `ARCHITECT_DIRECTIVE_GATE8_CLOSURE_RESET_PROTOCOL_v1.0.0.md` Rule 3 (inverted for
active state): the active state version of the canonical template is:

```json
{
  "pipe_run_id": "s002-p003-wp002-g8",
  "work_package_id": "S002-P003-WP002",
  "stage_id": "S002",
  "project_domain": "tiktrack",
  "spec_brief": "TikTrack Alignment D22+D33+D34+D35 — GATE_8 DOCUMENTATION_CLOSURE",
  "current_gate": "GATE_8",
  "gates_completed": ["GATE_0","GATE_1","GATE_2","GATE_3","GATE_4","GATE_5","GATE_6","GATE_7"],
  "gates_failed": [],
  "lld400_content": "",
  "work_plan": "",
  "mandates": "",
  "implementation_files": [],
  "implementation_endpoints": [],
  "spec_path": "_COMMUNICATION/team_00/TEAM_00_TO_TEAM_90_S002_P003_WP002_GATE8_ACTIVATION_v1.0.0.md",
  "started_at": "2026-03-15T00:00:00Z",
  "last_updated": "2026-03-15T23:30:00Z",
  "gate_state": null,
  "pending_actions": ["Team 70: AS_MADE docs D22/D33/D34/D35", "Team 90: GATE_8 validation"],
  "override_reason": null
}
```

**After GATE_8 PASS**, reset to canonical no-active-WP state per directive Rule 3.

---

## Part D — Team 61: Fix snapshot check script (1 line)

In `scripts/portfolio/build_portfolio_snapshot.py`, update the `no_active_gate_markers` check:

**Current code (approx line 366):**
```python
active_program_id = runtime.get("active_program_id", "")
current_gate = runtime.get("current_gate", "")
if active_program_id and current_gate:
    matching = ...
```

**Fix — add `no_active_gate_markers` guard:**
```python
active_program_id = runtime.get("active_program_id", "")
current_gate = runtime.get("current_gate", "")
_no_active_gate = {"", "N/A", "NONE", "N/A (post-GATE_8_PASS)"}
if active_program_id and current_gate and current_gate.strip().upper() not in {m.upper() for m in _no_active_gate}:
    matching = ...
```

This prevents the false-positive when `current_gate = "N/A (post-GATE_8_PASS)"`.

---

## Part E — Team 170: Rebuild Portfolio Snapshot

After Parts A, B, C are complete:

```bash
# Re-sync registry mirrors from updated WSM
python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --write

# Rebuild snapshot
python3 scripts/portfolio/build_portfolio_snapshot.py --write

# Verify runtime block
python3 -c "import json; d=json.load(open('portfolio_project/portfolio_snapshot.json')); print(json.dumps(d['runtime'], indent=2))"
```

**Expected runtime after correction:**
```json
{
  "active_stage_id": "S002",
  "active_work_package_id": "S002-P003-WP002",
  "in_progress_work_package_id": "S002-P003-WP002",
  "current_gate": "GATE_8",
  "active_program_id": "S002-P003",
  "last_gate_event": "GATE_7_PASS_NIMROD_CONFIRMED; 2026-03-15; ...",
  ...
}
```

---

## Part F — Team 191: Verify Guard PASS

After all corrections, Team 191 runs the pre-push guard on a test commit touching governance
files. Expected result:

```
PORTFOLIO PRE-PUSH GUARD: PASS
DATE-LINT: PASS
```

With NO false-positive "active stage S002_P003_WP002_GATE8" detection from ambiguous sentinel.

**Submit verification report to:** `_COMMUNICATION/_ARCHITECT_INBOX/`
`TEAM_191_TO_TEAM_00_GATE8_STATE_CORRECTION_VERIFICATION_v1.0.0.md`

---

## Execution Order (strict)

```
A → B → C (parallel with B) → D (parallel with B,C) → E → F
```

Team 170 coordinates with Team 10 to ensure WSM is updated before running `--write` sync.

---

## Future: After S002-P003-WP002 GATE_8 PASS

When Team 90 issues GATE_8 PASS for S002-P003-WP002:

Follow the 6-step sequence from
`ARCHITECT_DIRECTIVE_GATE8_CLOSURE_RESET_PROTOCOL_v1.0.0.md` §Rule 4, which includes:
- WSM `current_gate` → `N/A (post-GATE_8_PASS)` (not `GATE_8`)
- pipeline_state_tiktrack.json → canonical NONE state (Rule 3 template)
- WP registry row: is_active=false, status=CLOSED, current_gate="GATE_8 (PASS)"

---

**log_entry | TEAM_00 | MANDATE_ISSUED | GATE8_STATE_CORRECTION | TEAM_10_TEAM_170 | IMMEDIATE | 2026-03-15**
**log_entry | TEAM_00 | MANDATE_STATUS_UPDATE | GATE8_STATE_CORRECTION | SUPERSEDED_HISTORICAL_DO_NOT_EXECUTE | 2026-03-15**
