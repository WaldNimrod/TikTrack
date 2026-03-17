---
id: TEAM_00_TO_TEAM_61_WP004_PIPELINE_GOVERNANCE_MANDATE_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 61 (AOS Local Cursor Implementation)
cc: Team 51, Team 100
date: 2026-03-17
status: ACTIVE
authority: TEAM_00_CONSTITUTIONAL_MANDATE
work_package_id: S002-P005-WP004
reference: ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM_v1.0.0.md §C
---

# Implementation Mandate — S002-P005-WP004
## Pipeline Governance Code Integrity

---

## Context

WP003 (AOS State Alignment) delivered its full original scope and is proceeding to GATE_6
closure. During the WP003 cycle, architectural analysis identified five pipeline code
integrity issues (§C of the Gate Architecture Addendum). These are assigned to WP004.

**No G3_PLAN required.** This mandate is precise enough to serve as the work plan.
Team 10 is not in the execution path for this WP.

---

## Execution Sequence

```
This mandate (Team 00)
    ↓
Team 61 — implement C.1 → C.2 → C.3 → C.4 → C.5
    ↓
Team 51 — QA validation
    ↓
Team 100 — GATE_6 WP004
```

---

## Task C.1 — Remove G5_DOC_FIX (P0)

**Rationale:** G5_DOC_FIX is an anti-pattern. GATE_5 admin failures route directly to
the implementation team without a separate gate state.

### `agents_os_v2/orchestrator/pipeline.py`

1. Remove `"G5_DOC_FIX"` from `GATE_SEQUENCE` (line ~38)
2. Remove `"G5_DOC_FIX"` entry from `GATE_CONFIG` dict (line ~55)
3. Remove `"G5_DOC_FIX"` from `FAIL_ROUTING` (lines ~114–119)
4. Delete the `_generate_g5_doc_fix_prompt()` function entirely
5. Update GATE_5 `doc` routing entry:

```python
"GATE_5": {
    # doc route: targeted fix — return directly to implementation with instructions
    # No separate G5_DOC_FIX state. Team 10/61 fixes docs, then re-presents to GATE_5.
    "doc":  ("CURSOR_IMPLEMENTATION", "Doc/artifact gap — implementation team fixes directly → GATE_5 re-validation"),
    "full": ("G3_PLAN",               "Code/design issues — full re-plan → mandates → impl → QA → GATE_5"),
},
```

### `pipeline_run.sh`

- Remove any `G5_DOC_FIX` case handling
- Update any prompt-showing logic that references G5_DOC_FIX

### `agents_os/ui/js/pipeline-config.js`

- Remove `G5_DOC_FIX` from `ALL_GATE_DEFS`
- Remove `G5_DOC_FIX` from any gate sequence arrays

---

## Task C.2 — Fix Team 10 "Orchestrator" Label Drift (P0)

**Rationale:** Team 10's canonical role is "Work Plan Generator." All "Execution Orchestrator"
labels in pipeline.py are drift.

| File | Line area | Current text | Replace with |
|------|-----------|-------------|--------------|
| `pipeline.py` | Line ~6 | `"The Orchestrator IS Team 10..."` | `"Team 10 is the Work Plan Generator. The Python pipeline is the sole orchestrator."` |
| `pipeline.py` | Line ~1250 | `"Team 10 — Execution Orchestrator"` | `"Team 10 — Work Plan Generator"` |
| `pipeline.py` | Line ~1267 | Same | Same |
| `pipeline.py` | Lines ~1040–1042 | WSM update = Team 10 responsibility | `"WSM updates are managed by the pipeline system. Team 10 does not modify WSM directly."` |

---

## Task C.3 — PASS_WITH_ACTION Button in Dashboard UI (P1)

**Rationale:** `pass_with_actions` is fully implemented in pipeline.py and pipeline_run.sh
but is not surfaced in the dashboard. Operators cannot use it without CLI access.

### `agents_os/ui/js/pipeline-dashboard.js`

Add a third button to ALL validation gate PASS/FAIL sections:

```
✅ PASS      ⚠️ PASS_WITH_ACTION      ❌ FAIL
```

**PASS_WITH_ACTION button spec:**

- `data-testid="pass-with-action-btn"` on the button
- On click: show a `<textarea>` for the operator to list actions (pipe-separated)
- Generates command: `./pipeline_run.sh --domain [domain] pass_with_actions "ACTION-1|ACTION-2"`
- Only shown for VALIDATION gates (those owned by Team 90, 190, 50, 51)
- NOT shown for EXECUTION gates or HUMAN gates

**Pending actions display:**

- Add `data-testid="pending-actions-panel"` to display any currently pending actions
  from pipeline state (read from `pipeline_state.json` `pending_actions` field if present)

---

## Task C.4 — GATE_CONFIG Rename Comment (P1 doc)

**Rationale:** Document the pending canonical rename of CURSOR_IMPLEMENTATION → GATE_3_IMPL
directly in the code so it is visible to all agents reading pipeline.py.

### `agents_os_v2/orchestrator/pipeline.py`

In the `GATE_CONFIG` dict, find the `CURSOR_IMPLEMENTATION` entry. Add a comment on the line
immediately above it:

```python
# canonical display name: GATE_3_IMPL (rename pending — separate WP in S003)
"CURSOR_IMPLEMENTATION": { ...
```

---

## Task C.5 — Fix WAITING_GATE2_APPROVAL Engine Drift (P1)

**Rationale:** `engine: "human"` for WAITING_GATE2_APPROVAL is incorrect. GATE_7 is the
only human gate in the pipeline. All other gates are architectural or execution.

### `agents_os_v2/orchestrator/pipeline.py`

Find the `WAITING_GATE2_APPROVAL` entry in `GATE_CONFIG`. Two options — apply whichever
aligns with how the state is currently used:

**Option A — retain state, fix engine:**
```python
"WAITING_GATE2_APPROVAL": {
    "owner": "team_00",
    "engine": "codex",   # architectural review, not human
    ...
}
```

**Option B — eliminate the state entirely** (if it is redundant with GATE_2 PASS):
- Remove from `GATE_SEQUENCE`
- Remove from `GATE_CONFIG`
- Update GATE_2 PASS routing to skip this state and route directly to G3_PLAN

**Recommendation: Option A unless the state is demonstrably unreachable in current flow.**
Flag in the GATE_6 submission which option was applied and why.

---

## Delivery

### Completion document

Write: `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP004_IMPLEMENTATION_COMPLETE_v1.0.0.md`

Required sections:
- Task completion status (C.1–C.5)
- Files modified (path + change type)
- C.5 option chosen (A or B) with rationale

### Hand off to Team 51 for QA

After implementation complete, submit QA request to Team 51:
`_COMMUNICATION/team_51/TEAM_61_TO_TEAM_51_WP004_QA_REQUEST_v1.0.0.md`

### GATE_6 submission to Team 100

After Team 51 QA PASS:
`_COMMUNICATION/team_61/TEAM_61_TO_TEAM_100_WP004_GATE6_REQUEST_v1.0.0.md`

---

**log_entry | TEAM_00 | WP004_MANDATE_ISSUED | PIPELINE_GOVERNANCE_CODE_INTEGRITY | 2026-03-17**
