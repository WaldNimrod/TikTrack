# Team 00 — Program Lifecycle Management UI Spec
## TEAM_00_PROGRAM_LIFECYCLE_UI_SPEC_v1.1.0.md

**project_domain:** SHARED (AGENTS_OS + TIKTRACK)
**from:** Team 00 (Chief Architect)
**to:** Team 170 (Documentation & UI Spec), Team 10 (Execution)
**cc:** Team 100
**date:** 2026-03-14
**status:** APPROVED — IMPLEMENTATION MANDATE TO FOLLOW
**supersedes:** TEAM_00_PROGRAM_LIFECYCLE_UI_SPEC_v1.0.0.md
**change:** Separated planning phase from execution phase in lifecycle model

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 (first consumer) |
| document_type | UI_ARCHITECTURE_SPEC |
| phase_owner | Team 00 |
| implementation_team | Team 170 (spec) → Team 10 (code) |

---

## 1. Core Design Principle: Planning vs Execution are Distinct Phases

A program has **two independent lifecycle dimensions** that must be tracked and displayed separately:

1. **Planning Phase** — specification work: from idea to approved LOD400. Happens before any code is written. Owner: Team 00 (Architect).
2. **Execution Phase** — implementation work: from WP001 activation to GATE_8 closure. Happens only after LOD400 approval. Owner: Teams 10/20/30/50.

Each phase has its own active/hold/cancelled sub-states. A program in "hold" during planning is very different from a program in "hold" during execution.

---

## 2. Full Lifecycle State Machine

### Planning Phase States

```
[concept] ──────────────────────────────────►  [planning:lod_in_progress]
 Initial idea, no formal doc                     LOD200 or LOD400 being written
                                                 by Team 00
                                                      │
                                           (Architecture review cycle:
                                            draft → review → revisions)
                                                      │
                                                      ▼
                                              [planning:lod_review]
                                               Submitted, awaiting
                                               Team 00 approval
                                                      │
                                               ┌──────┴──────┐
                                             PASS          FAIL
                                               │              │
                                               ▼              ▼
                                       [planning:approved]  [back to lod_in_progress]
                                        LOD400 locked,
                                        ready to activate
```

**Planning holds/cancels:**
- `planning:hold` — planning paused by Team 00 (capacity, priority shift)
- `planning:cancelled` — cancelled before execution began (concept rejected, priority removed)

---

### Execution Phase States

```
[planning:approved] ──(Activate)──► [execution:active]
                                         │  WP001 created, GATE_0 running
                                         │  Normal gate flow: GATE_0→...→GATE_8
                                         │
                              ┌──────────┼──────────┐
                           (Hold)      (Cancel)   (GATE_8 PASS)
                              │           │            │
                              ▼           ▼            ▼
                      [execution:hold] [execution:  [complete]
                           │            cancelled]
                        (Revive)
                           │
                           ▼
                    [execution:active]
                    (resumed from last gate)
```

---

### Full State List

| State | Phase | Label (UI) | Color |
|---|---|---|---|
| `concept` | Planning | 💡 Concept | Gray |
| `planning:lod_in_progress` | Planning | 📐 Spec: In Progress | Blue |
| `planning:lod_review` | Planning | 🔍 Spec: Under Review | Amber |
| `planning:approved` | Planning | ✅ Spec: Approved — Ready | Green (pulse) |
| `planning:hold` | Planning | ⏸ Planning: On Hold | Amber |
| `planning:cancelled` | Planning | ❌ Planning: Cancelled | Red |
| `execution:active` | Execution | ⚙️ Executing: Gate N | Blue |
| `execution:hold` | Execution | ⏸ Execution: On Hold | Amber |
| `execution:cancelled` | Execution | ❌ Execution: Cancelled | Red |
| `complete` | — | ✅ Complete | Green |

---

## 3. Valid Transitions per State

| From State | Allowed Actions | To State | Who |
|---|---|---|---|
| `concept` | Begin Spec | `planning:lod_in_progress` | Team 00 |
| `planning:lod_in_progress` | Submit for Review | `planning:lod_review` | Team 00 |
| `planning:lod_review` | Approve LOD400 | `planning:approved` | Team 00 |
| `planning:lod_review` | Reject → Revise | `planning:lod_in_progress` | Team 00 |
| `planning:approved` | **Activate** | `execution:active` | Nimrod (via CLI) |
| `planning:*` | Hold | `planning:hold` | Team 00 |
| `planning:hold` | Resume | previous planning state | Team 00 |
| `planning:*` | Cancel | `planning:cancelled` | Team 00 |
| `execution:active` | Hold | `execution:hold` | Nimrod |
| `execution:hold` | Revive | `execution:active` | Nimrod |
| `execution:active/hold` | Cancel | `execution:cancelled` | Nimrod |
| `execution:active` | (GATE_8 PASS) | `complete` | System (automatic) |

**Key rule:** Only `planning:approved` → `execution:active` transition exists. You cannot go directly from concept to execution. LOD400 approval is mandatory before activation.

---

## 4. UI Component Design

### 4.1 Placement: PIPELINE_ROADMAP.html (Map Page)

The lifecycle panel extends the **existing `prog-detail-panel`** shown when a program row is clicked.

**Extended panel layout:**

```
┌─ prog-detail-panel ──────────────────────────────────────────┐
│  S002-P005 — Agents_OS Writing Semantics Hardening           │
│  Domain: agents_os  │  Stage: S002                           │
│                                                              │
│  ┌─ PLANNING STATUS ──────────────────────────────────────┐  │
│  │ ✅ Spec: Approved (LOD400 locked 2026-03-14)           │  │
│  │ Spec file: TEAM_00_S002_P005_ARCHITECTURAL_REVIEW...   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ EXECUTION STATUS ─────────────────────────────────────┐  │
│  │ Not yet started                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ACTIONS (context-sensitive)                                  │
│  [🟢 Activate → GATE_0]                                      │
│                                                              │
│  ┌─ Command to run ────────────────────────────────────┐     │
│  │  $ ./pipeline_run.sh --domain agents_os new         │     │
│  │    S002-P005                              [📋 Copy] │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

### 4.2 Active Program View

```
┌─ prog-detail-panel ──────────────────────────────────────────┐
│  S002-P005 — Agents_OS Writing Semantics Hardening           │
│                                                              │
│  ┌─ PLANNING STATUS ──────────────────────────────────────┐  │
│  │ ✅ Spec: Approved                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ EXECUTION STATUS ─────────────────────────────────────┐  │
│  │ ⚙️ Active — GATE_4 (Team 30: Frontend Implementation)  │  │
│  │ WP: S002-P005-WP001  │  Started: 2026-03-15            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ACTIONS                                                     │
│  [⏸ Hold]   [❌ Cancel]                                     │
└──────────────────────────────────────────────────────────────┘
```

---

### 4.3 Action Buttons Configuration

```javascript
const LIFECYCLE_ACTIONS = {
  // Planning states — owner: Team 00 (architect actions)
  'concept':                   [{ label: '📐 Begin Spec', action: 'begin_spec',  variant: 'info' }],
  'planning:lod_in_progress':  [{ label: '🔍 Submit for Review', action: 'submit_review', variant: 'info' },
                                { label: '⏸ Hold Planning', action: 'hold_planning', variant: 'warning', requiresReason: true },
                                { label: '❌ Cancel', action: 'cancel', variant: 'danger', requiresReason: true }],
  'planning:lod_review':       [{ label: '✅ Approve LOD400', action: 'approve_spec', variant: 'success' },
                                { label: '↩️ Reject → Revise', action: 'reject_spec', variant: 'warning', requiresReason: true }],
  'planning:approved':         [{ label: '🟢 Activate → GATE_0', action: 'activate', variant: 'success' },
                                { label: '⏸ Hold Planning', action: 'hold_planning', variant: 'warning', requiresReason: true }],
  'planning:hold':             [{ label: '▶️ Resume Planning', action: 'resume_planning', variant: 'primary' },
                                { label: '❌ Cancel', action: 'cancel', variant: 'danger', requiresReason: true }],

  // Execution states — owner: Nimrod (operator actions)
  'execution:active':          [{ label: '⏸ Hold Execution', action: 'hold',   variant: 'warning', requiresReason: true },
                                { label: '❌ Cancel', action: 'cancel', variant: 'danger',  requiresReason: true }],
  'execution:hold':            [{ label: '▶️ Revive', action: 'revive', variant: 'primary' },
                                { label: '❌ Cancel', action: 'cancel', variant: 'danger',  requiresReason: true }],

  // Terminal states — no actions
  'complete':            [],
  'planning:cancelled':  [],
  'execution:cancelled': [],
};
```

---

### 4.4 Command Preview Block (Zero-Trust — UI Never Executes)

Every action generates a CLI command to copy. UI never directly invokes the pipeline.

| Action | Generated Command |
|---|---|
| Activate | `./pipeline_run.sh --domain <X> new <PROGRAM_ID>` |
| Hold (execution) | `./pipeline_run.sh --domain <X> hold "<reason>"` |
| Cancel | `./pipeline_run.sh --domain <X> cancel "<reason>"` |
| Revive | `./pipeline_run.sh --domain <X> revive` |
| Planning state changes | `# Planning states managed via Team 00 architectural decisions` |

---

## 5. Stage A Scope (S002-P005)

Stage A implements only the **Activate** action:
- `planning:approved` → `execution:active` transition
- `pipeline_run.sh new <PROGRAM_ID>` command (R4 approved by Nimrod)
- UI shows two status blocks (planning + execution) — static data for now
- Other action buttons render but show "Available in Stage B" tooltip

**Stage B adds:** Hold, Cancel, Revive commands + full state machine

---

## 6. Data Model

Each program in the registry needs these fields for lifecycle display:

```json
{
  "program_id": "S002-P005",
  "name": "Agents_OS v2 Writing Semantics Hardening",
  "domain": "agents_os",
  "stage_id": "S002",
  "planning_status": "approved",
  "planning_spec_ref": "_COMMUNICATION/team_00/TEAM_00_S002_P005_ARCHITECTURAL_REVIEW_v1.0.0.md",
  "planning_approved_date": "2026-03-14",
  "execution_status": "not_started",
  "execution_active_wp": null,
  "execution_current_gate": null,
  "execution_started_date": null
}
```

This data lives in `STATE_SNAPSHOT.json` (produced by `state_reader.py`) — extending it is part of S002-P005 R2 scope.

---

**log_entry | TEAM_00 | LIFECYCLE_UI_SPEC | v1.1.0 APPROVED | PLANNING_EXECUTION_SEPARATED | 2026-03-14**
