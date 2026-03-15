---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_61_WP002_GATE7_PREP_ACTIVATION_v1.0.0
from: Team 00 (Chief Architect)
to: Team 61 (AOS Local Cursor Implementation)
cc: Team 10, Team 51
date: 2026-03-15
status: MANDATE_ACTIVE
priority: HIGH — execute in order below
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| gate_id | GATE_7 (prep) |
| mandate_type | GATE_PREP + UI_IMPLEMENTATION |

---

## Context

GATE_6 for S002-P005-WP002 was APPROVED (2026-03-15) by Team 00.
Decision: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_GATE6_DECISION_S002_P005_WP002_v1.0.0.md`
GATE_7 is authorized. This package contains all Team 61 deliverables required **before** Nimrod performs the GATE_7 browser review.

---

## TASK 1 — Pipeline State Update (BLOCKING — do first)

**File:** `_COMMUNICATION/agents_os/pipeline_state_agentsos.json`

Update to reflect WP002 in GATE_7:

```json
{
  "work_package_id": "S002-P005-WP002",
  "stage_id": "S002",
  "spec_brief": "Pipeline Governance — PASS_WITH_ACTION micro-cycle",
  "current_gate": "GATE_7",
  "gates_completed": ["GATE_0", "GATE_1", "GATE_2", "GATE_3", "GATE_4", "GATE_5", "GATE_6"],
  "gate_state": null,
  "pending_actions": [],
  "override_reason": null
}
```

**Critical:**
- `override_reason` MUST be `null` — current value `"Nimrod approved expedited close"` is residual test data (flagged in GATE_6 decision §5)
- `gate_state` and `pending_actions` MUST be cleared — current test data must not persist in production state
- Keep `pipe_run_id`, `project_domain: "agents_os"`, `started_at`, `last_updated` fields intact (update `last_updated` to now)

---

## TASK 2 — OBS-02: `insist` Command Verification (BLOCKING before GATE_7 sign-off)

From GATE_6 decision OBS-02:

The approved design (`TEAM_100_PASS_WITH_ACTION_PIPELINE_GOVERNANCE_BACKLOG_v1.0.0.md §2.3`) includes:
```
./pipeline_run.sh insist   # stay at gate, generate correction prompt
```

**Required — confirm one of:**

**Option A — `insist` IS implemented:**
- Provide evidence: code path in `pipeline_run.sh` + manual test output
- Test: `./pipeline_run.sh --domain agents_os insist` → should stay at gate + generate correction prompt
- Submit evidence to `_COMMUNICATION/team_61/`

**Option B — `insist` is NOT implemented:**
- Implement in `pipeline_run.sh` (< 15 lines):
  - Command: `insist` — stays at current gate, outputs correction prompt text
  - Should NOT advance gate. Should NOT change `gate_state`. Should display: the current gate prompt with an "insist" framing ("You have chosen to stay at [GATE]. Correct the following and re-submit:").
- Re-submit to Team 51 for targeted re-QA on `insist` only
- Submit result to `_COMMUNICATION/team_61/` as `TEAM_61_TO_TEAM_00_OBS02_INSIST_RESOLUTION_v1.0.0.md`

---

## TASK 3 — OBS-03: test_injection Tracking Note

Submit to `_COMMUNICATION/team_61/` a brief note (< 1 paragraph) covering:

1. What do the `test_injection` tests cover? (scope summary)
2. What are the 2 known failures? (condition / reason accepted)
3. Are they technical debt requiring a future fix, or permanently acceptable?

File name: `TEAM_61_TO_TEAM_00_OBS03_TEST_INJECTION_NOTE_v1.0.0.md`

This does NOT block GATE_7.

---

## TASK 4 — Help Modal Upgrade (IMMEDIATE — does NOT block GATE_7 but is IMMEDIATE priority)

Execute the full mandate: `TEAM_00_TO_TEAM_61_HELP_MODAL_UPGRADE_MANDATE_v1.0.0.md`

Summary of deliverables:
- `agents_os/ui/PIPELINE_DASHBOARD.html` lines 37–244: replace with 4-tab modal (🚀 Start | 🗺️ Gates | 📋 Commands | ❓ Help)
- `agents_os/ui/js/pipeline-help.js`: tab switching + `buildHelpContextBanner()` reading `window.pipelineState`
- `agents_os/ui/css/pipeline-dashboard.css`: tab styles (`.help-tab-bar`, `.help-tab-btn`, `.help-context-banner`, `.help-modes-box`)

15 ACs per mandate. Submit completion to `_COMMUNICATION/team_61/`.

---

## Execution Order

```
Step 1:  TASK 1 — Update pipeline state JSON (5 min, blocking)
Step 2:  TASK 2 — insist verification (Option A: 15 min | Option B: 1-2h + Team 51 re-QA)
Step 3:  TASK 3 — test_injection note (15 min, non-blocking)
Step 4:  TASK 4 — Help modal implementation (parallel to Steps 2-3 if resources allow)
Step 5:  Notify Team 00 when TASK 1 + TASK 2 are complete → Nimrod can begin GATE_7 browser review
```

---

## Completion Criteria

Team 61 submits to `_COMMUNICATION/team_61/`:
- `TEAM_61_TO_TEAM_00_WP002_GATE7_PREP_COMPLETE_v1.0.0.md` — confirming TASK 1 done, TASK 2 resolved, TASK 3 submitted
- Evidence for OBS-02 resolution (A or B)
- OBS-03 tracking note

Team 00 will initiate GATE_7 browser review upon receipt.

---

*log_entry | TEAM_00 | GATE7_PREP_ACTIVATION | TEAM_61 | S002_P005_WP002 | ISSUED | 2026-03-15*
