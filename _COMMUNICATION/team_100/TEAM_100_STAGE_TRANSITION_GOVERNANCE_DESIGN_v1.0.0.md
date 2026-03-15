---
project_domain: AGENTS_OS
id: TEAM_100_STAGE_TRANSITION_GOVERNANCE_DESIGN_v1.0.0
from: Team 100 (AOS Domain Architects)
to: Team 00 (for review) + S002-P005-WP002 scope
cc: Team 10, Team 170
date: 2026-03-15
status: DESIGN_DRAFT — awaiting WP002 activation
scheduled_for: S002-P005-WP002 (Pipeline Governance — PASS_WITH_ACTION micro-cycle)
trigger: Nimrod instruction 2026-03-15 — stage transition UX + validation
---

## Context

During active work on S001-P002-WP001, a stage mismatch was discovered:
`pipeline_state_tiktrack.json.stage_id = S001` while `WSM.active_stage_id = S002`.
This was an authorized exception (S001-P002 deferred parallel activation), but exposed
two gaps:
1. **No formal stage transition flow** — the system had no controlled way to close a stage
   and handle open work packages
2. **No advance-time validation** — `./pipeline_run.sh pass` could execute against a
   wrong-stage state file silently

Both gaps are now partially addressed (stage updated manually, validation added to pipeline_run.sh).
This document designs the complete, permanent solution for WP002.

---

## Problem Statement

When a stage closes:
- Open work packages may exist in the closing stage (not yet at GATE_8)
- These WPs must be explicitly handled — NOT silently abandoned
- The system must prevent any future pipeline operation against a stale-stage state file
- The UI must provide a clear "stage transition" flow with decision gates per open WP

---

## Design — Stage Transition Flow

### Trigger

User clicks "Close Stage" in the Dashboard (or via `./pipeline_run.sh stage-close`).

### Flow

```
Step 1 — System detects open WPs
  Query pipeline_state_{domain}.json:
    - work_package_id != "" AND current_gate NOT IN ["", "GATE_8_COMPLETE"]

  If no open WPs → proceed directly to Step 4.

Step 2 — Per open WP: user decision required
  For each open WP, show:
    ┌─────────────────────────────────────────────────────────────┐
    │ WP: S001-P002-WP001 — Alerts Summary Widget                │
    │ Current gate: WAITING_GATE2_APPROVAL                       │
    │ Progress: GATE_0 ✅  GATE_1 ✅  GATE_2 ✅  → awaiting you │
    ├────────────────────────────────────┬────────────────────────┤
    │ [DEFER → reschedule to next stage] │ [CANCEL — permanently] │
    └────────────────────────────────────┴────────────────────────┘

  DEFER: WP data preserved, moved to pipeline_state._deferred_wps[]
  CANCEL: WP data discarded, status = CANCELLED (logged, irreversible)

Step 3 — Confirmation gate
  "You are about to close Stage SXX. The following decisions were made:
    - S001-P002-WP001 → DEFERRED (to be resumed in S002)
  This action cannot be undone. Confirm?"
  [Confirm Stage Transition]  [Cancel]

Step 4 — Execute transition
  - pipeline_state.stage_id ← new_stage
  - pipeline_state.work_package_id ← ""
  - pipeline_state.current_gate ← ""
  - pipeline_state.gates_completed ← []
  - pipeline_state.gates_failed ← []
  - pipeline_state._deferred_wps ← [...deferred WP records]
  - pipeline_state.last_updated ← now

Step 5 — Post-transition validation
  - Stage alignment check runs immediately
  - Health warnings panel refreshes
  - Dashboard shows "No active WP — ready for new work package"
```

---

## Pipeline State Schema Additions (WP002 scope)

```json
{
  "_schema_version": "2.0",
  "status": "ACTIVE | IDLE | DEFERRED",
  "_deferred_wps": [
    {
      "work_package_id": "S001-P002-WP001",
      "deferred_at_gate": "WAITING_GATE2_APPROVAL",
      "deferred_reason": "Stage S001 closed",
      "gates_completed_at_deferral": ["GATE_0", "GATE_1", "GATE_2"],
      "spec_brief_snapshot": "...",
      "lld400_content_snapshot": "...",
      "target_stage": "S002",
      "deferred_at": "ISO timestamp",
      "deferred_by": "Nimrod"
    }
  ],
  "_cancelled_wps": [
    {
      "work_package_id": "...",
      "cancelled_at_gate": "...",
      "cancelled_reason": "...",
      "cancelled_at": "ISO timestamp"
    }
  ]
}
```

---

## Validation Design

### Layer 1 — pipeline_run.sh startup guard (IMPLEMENTED 2026-03-15)

`_validate_stage_alignment()` runs before every `pass`, `fail`, `approve` command.

| Condition | Result |
|---|---|
| `stage_id` matches WSM `active_stage_id` | ✅ PASS silently |
| `work_package_id` is empty (IDLE state) | ✅ PASS silently |
| `stage_id` in `AUTHORIZED_STAGE_EXCEPTIONS` | ℹ️ INFO + continue |
| Mismatch, no exception | 🔴 BLOCK + error message + resolution instructions |

### Layer 2 — Dashboard health warnings (existing, AD-V2-05)

Already implemented. Shows 🟢 info for authorized exceptions, 🔴 error for conflicts.

### Layer 3 — Stage transition confirmation gate (WP002 scope)

New: before `stage-close` completes, require explicit confirmation with WP disposition.

### Layer 4 — WSM sync validation (WP002 scope)

After any stage transition:
- STATE_SNAPSHOT.json refreshed automatically
- WSM active_stage_id compared to all domain pipeline states
- Any remaining mismatch shown as health warning

---

## new pipeline_run.sh commands (WP002 scope)

```bash
./pipeline_run.sh stage-close                     → Interactive stage close flow
./pipeline_run.sh stage-close --domain tiktrack    → Close specific domain stage
./pipeline_run.sh defer-wp "reason"               → Defer current open WP
./pipeline_run.sh resume-wp WP_ID                 → Resume a deferred WP (restore state)
./pipeline_run.sh idle                            → Explicitly mark pipeline as idle (no active WP)
```

### `defer-wp` flow:
1. Reads current WP from pipeline state
2. Moves it to `_deferred_wps[]`
3. Clears active WP fields
4. Updates stage_id to current WSM active stage
5. Sets status = "IDLE"

### `resume-wp` flow:
1. Reads WP from `_deferred_wps[]`
2. Restores all WP fields to pipeline state
3. Re-validates: checks stage_id alignment, validates gates
4. Shows current gate prompt

---

## Dashboard UI Additions (WP002 scope)

### Stage Transition Panel (new section)

```
┌─────────────────────────────────────────────────────────┐
│  🔄 Stage Management                                    │
│  Active stage (WSM): S002                               │
│  Pipeline stage (state): S002  ✅                       │
│                                                         │
│  Deferred WPs: 1                                        │
│  • S001-P002-WP001 — WAITING_GATE2_APPROVAL [Resume]   │
│                                                         │
│  [Close Stage / Begin Transition]                       │
└─────────────────────────────────────────────────────────┘
```

### Deferred WP card (when idle):

```
┌─────────────────────────────────────────────────────────┐
│  📋 No Active Work Package                              │
│                                                         │
│  Deferred (1):                                          │
│  • S001-P002-WP001 — Alerts Widget — at G2_APPROVAL    │
│    [Resume this WP]                                     │
│                                                         │
│  [Start New WP] (runs ./pipeline_run.sh store ...)     │
└─────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria (for WP002 implementation)

| AC | Criterion |
|---|---|
| AC-01 | `./pipeline_run.sh stage-close` detects open WPs and prompts for decision |
| AC-02 | DEFER stores full WP state in `_deferred_wps[]` — no data loss |
| AC-03 | CANCEL records in `_cancelled_wps[]` with reason and timestamp |
| AC-04 | Stage transition updates stage_id + clears active WP fields atomically |
| AC-05 | `./pipeline_run.sh resume-wp WP_ID` restores deferred WP correctly |
| AC-06 | Dashboard shows deferred WP list with Resume button |
| AC-07 | Stage mismatch after transition triggers 🔴 health warning immediately |
| AC-08 | `_validate_stage_alignment` blocks `pass`/`fail`/`approve` on unauthorized mismatch |
| AC-09 | All `_deferred_wps` and `_cancelled_wps` fields are preserved through normal pipeline ops |
| AC-10 | Python PipelineState class reads `_deferred_wps` and `_cancelled_wps` without errors |

---

## Current State After Immediate Fix (2026-03-15)

| Item | Status |
|---|---|
| `pipeline_state_tiktrack.json.stage_id` | ✅ Updated to S002 |
| S001-P002-WP001 disposition | ✅ DEFERRED — recorded in `_deferred_wp` field |
| `_validate_stage_alignment()` in pipeline_run.sh | ✅ Active — guards pass/fail/approve |
| Full stage transition UI | ⏳ PLANNED — S002-P005-WP002 |
| `defer-wp` / `resume-wp` commands | ⏳ PLANNED — S002-P005-WP002 |
| Dashboard Stage Management panel | ⏳ PLANNED — S002-P005-WP002 |

---

**log_entry | TEAM_100 | STAGE_TRANSITION_GOVERNANCE_DESIGN | DRAFT_COMPLETE | 2026-03-15**
