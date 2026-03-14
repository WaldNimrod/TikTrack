# Team 00 — Program Lifecycle Management UI Spec
## TEAM_00_PROGRAM_LIFECYCLE_UI_SPEC_v1.0.0.md

**project_domain:** SHARED (AGENTS_OS + TIKTRACK)
**from:** Team 00 (Chief Architect)
**to:** Team 170 (Documentation & UI Spec), Team 10 (Execution)
**cc:** Team 100
**date:** 2026-03-14
**status:** APPROVED — IMPLEMENTATION MANDATE TO FOLLOW
**authority_basis:** Architectural decision — program lifecycle management

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

## 1. Problem Statement

The current `PIPELINE_ROADMAP.html` map shows program cards as **read-only status indicators**. There is no UI for the three operational needs:

1. **Activate** (הפעלה) — start a new/queued program (creates WP001, moves to GATE_0)
2. **Pause / Hold** (עצירה) — pause an active program with documented reason
3. **Cancel** (ביטול) — formally close a program before completion with audit trail
4. **Revive** (החייאה) — resume a held/deferred program from its last known state

These operations are currently performed via ad-hoc Python one-liners or manual JSON editing. This spec defines the correct UI surface.

---

## 2. Lifecycle State Machine

```
        ┌──────────────────────────────────┐
        │                                  ▼
  [planned] ──(Activate)──► [active] ──(Hold)──► [hold]
                │                │               │
                │           (Cancel)          (Revive)
                │                │               │
                │                ▼               │
                └──────────► [cancelled]         └──► [active]
                                                         │
                                                    (Complete all gates)
                                                         │
                                                         ▼
                                                   [complete]
```

**Valid transitions per state:**

| Current State | Allowed Actions | Result State |
|---|---|---|
| `planned` | Activate | `active` |
| `active` | Hold, Cancel | `hold`, `cancelled` |
| `hold` | Revive, Cancel | `active`, `cancelled` |
| `deferred` | Activate (= Revive for deferred) | `active` |
| `complete` | None (read-only) | — |
| `cancelled` | None (read-only) | — |

---

## 3. UI Component Design

### 3.1 Placement — PIPELINE_ROADMAP.html (Map Page)

The lifecycle actions extend the **existing `prog-detail-panel`** that appears when a program row is clicked in the roadmap tree. No new page or modal infrastructure required.

**Current panel structure:**
```
┌─ prog-detail-panel ─────────────────────────────────┐
│ Program ID / Name / Status / Domain / Description   │
│ Current gate mirror (monospace)                     │
└─────────────────────────────────────────────────────┘
```

**Extended panel structure (this spec):**
```
┌─ prog-detail-panel ─────────────────────────────────┐
│ Program ID / Name / Status / Domain / Description   │
│ Current gate mirror (monospace)                     │
│ ─────────────────────────────────────────────────   │
│ ACTIONS                                             │
│ [context-sensitive lifecycle buttons]               │
│                                                     │
│ COMMAND PREVIEW                                     │
│ $ ./pipeline_run.sh --domain <X> <action>           │
└─────────────────────────────────────────────────────┘
```

### 3.2 Action Buttons

Buttons are rendered from a `LIFECYCLE_ACTIONS` config object keyed by program status:

```javascript
const LIFECYCLE_ACTIONS = {
  planned:   [{ label: '🟢 Activate → GATE_0', action: 'activate', variant: 'success' }],
  active:    [
    { label: '⏸ Hold',   action: 'hold',   variant: 'warning', requiresReason: true },
    { label: '❌ Cancel', action: 'cancel', variant: 'danger',  requiresReason: true },
  ],
  hold:      [
    { label: '▶️ Revive', action: 'revive', variant: 'primary' },
    { label: '❌ Cancel', action: 'cancel', variant: 'danger',  requiresReason: true },
  ],
  deferred:  [{ label: '🟢 Activate', action: 'activate', variant: 'success' }],
  complete:  [],  // no actions
  cancelled: [],  // no actions
};
```

### 3.3 Confirmation Flow

For **irreversible actions** (Cancel) and **Activate** (state-creating):

1. Click button → compact inline confirmation replaces the button row:
   ```
   ┌────────────────────────────────────────────────────┐
   │ Confirm: Activate S002-P005?                       │
   │ This will create WP001 and start GATE_0.           │
   │ Domain: agents_os                                  │
   │                              [Confirm] [Cancel]    │
   └────────────────────────────────────────────────────┘
   ```

2. For Hold/Cancel: inline text field for reason appears before confirm.

3. On **Confirm**:
   - Show "Command to run" box with exact terminal command (copy button)
   - No automatic pipeline execution from UI — command is always surfaced to Nimrod

### 3.4 Command Preview Block

Every action generates a **CLI command preview** below the buttons. This is the key design decision: **the UI never directly executes pipeline operations** — it surfaces the exact command for the operator.

```
┌─ Command to run ─────────────────────────────────┐
│  $ ./pipeline_run.sh --domain agents_os new       │
│    S002-P005                                [📋] │
└──────────────────────────────────────────────────┘
```

This maintains **Zero-Trust**: Nimrod always sees and copies the command, never "click to execute."

### 3.5 Visual States per Button

| Variant | Background | Border | Use for |
|---|---|---|---|
| `success` | rgba(63,185,80,0.15) | var(--success) | Activate, Revive |
| `warning` | rgba(210,153,34,0.15) | var(--warning) | Hold |
| `danger` | rgba(248,81,73,0.15) | var(--danger) | Cancel |
| `primary` | rgba(31,111,235,0.2) | var(--current) | Revive from hold |

---

## 4. Command Mapping

Each UI action maps to a `pipeline_run.sh` subcommand (R4 from S002-P005):

| UI Action | CLI Command | Required in Stage A |
|---|---|---|
| Activate | `./pipeline_run.sh --domain <X> new <PROGRAM_ID>` | ✅ Yes |
| Hold | `./pipeline_run.sh --domain <X> hold "<reason>"` | Stage B |
| Cancel | `./pipeline_run.sh --domain <X> cancel "<reason>"` | Stage B |
| Revive | `./pipeline_run.sh --domain <X> revive` | Stage B |

**Stage A (S002-P005) implements only Activate.** Hold/Cancel/Revive UI buttons will render but show "Available in Stage B" when clicked.

---

## 5. Data Source

The program list and status data come from `PHOENIX_PROGRAM_REGISTRY` read via `STATE_SNAPSHOT.json`. The Roadmap page should add `program_status` and `program_domain` fields to its data model from the registry.

**Registry data needed per program (for lifecycle actions):**
```json
{
  "program_id": "S002-P005",
  "name": "Agents_OS v2 Writing Semantics Hardening",
  "status": "planned",
  "domain": "agents_os",
  "stage_id": "S002",
  "active_wp": null,
  "last_gate": null
}
```

This is additional scope for S002-P005 R2 (desync check) — the `state_reader.py` should output a `programs[]` array from the Program Registry.

---

## 6. Implementation Notes for Team 170

This spec goes to Team 170 (UI Spec) → Team 10 (implementation) after Nimrod approves.

**Stage A deliverables (Team 170 spec, Team 10 code):**
1. CSS additions: `.lifecycle-actions`, `.lifecycle-btn`, `.lifecycle-btn-success/warning/danger`, `.cmd-preview-box`
2. JS: `LIFECYCLE_ACTIONS` config + `renderLifecycleActions(programId, status, domain)` function
3. JS: `showLifecycleConfirm(action, programId)` — inline confirmation
4. JS: `generateLifecycleCommand(action, programId, domain, reason)` → returns CLI string
5. Extend `prog-detail-panel` to include `#lifecycle-section` div
6. Wire to roadmap tree click handler — pass `programStatus` from loaded registry data

**What Team 170 does NOT need to do:**
- No new pages
- No backend API calls
- No pipeline execution — command is display-only
- No state mutations — UI is informational + command-generator

---

## 7. Open Questions (Non-Blocking for Stage A)

1. **Auto-refresh after command**: After Nimrod runs the terminal command, the roadmap page should refresh and show updated status. Existing auto-refresh mechanism handles this if `STATE_SNAPSHOT.json` is updated.

2. **Multi-WP programs**: Future programs may have WP002, WP003. The `new` command creates WP001; when WP001 closes, the UI should show "Activate WP002?" — design deferred to Stage B.

---

**log_entry | TEAM_00 | PROGRAM_LIFECYCLE_UI_SPEC | APPROVED | 2026-03-14**
