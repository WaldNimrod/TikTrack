---
project_domain: AGENTS_OS
id: TEAM_100_PASS_WITH_ACTION_PIPELINE_GOVERNANCE_BACKLOG_v1.0.0
from: Team 100 (Agents_OS Architectural Authority)
to: BACKLOG (future work package assignment)
cc: Team 00
date: 2026-03-15
status: BACKLOG_PENDING_SCHEDULING
priority: MEDIUM
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | TBD (S002-P005-WP002 or early S003) |
| decision_origin | Nimrod session 2026-03-15 |
| design_approved | YES — design locked |
| implementation_status | NOT YET STARTED |

---

## 1) Problem Statement

Currently, `PASS_WITH_ACTION` verdicts from QA/validation teams exist only at the communication-document layer. `pipeline_state.json` has no concept of this state. There is no enforcement mechanism — action items are tracked in docs and frequently lost without follow-up.

**Impact:** Governance quality items silently fall through with no audit trail and no structured resolution cycle.

---

## 2) Approved Design (locked 2026-03-15)

### 2.1 Lifecycle

```
Validator issues PASS_WITH_ACTION
    ↓
gate_state = "PASS_WITH_ACTION" recorded in pipeline_state.json
current_gate does NOT advance — gate is HELD
    ↓
Responsible team receives auto-generated correction prompt
    ↓
Correction cycle (micro-cycle — same gate, fast)
    ↓
Approving team performs targeted re-check (not full cycle)
    ↓
┌─────────────────────────────────────────────────────┐
│ Re-check PASS → actions_clear → gate advances       │
│ Re-check FAIL → Nimrod chooses:                     │
│   "להתעקש" (insist) → another correction cycle     │
│   "להתקדם" (advance) → override + log + advance    │
└─────────────────────────────────────────────────────┘
```

### 2.2 Pipeline State Schema Changes

New fields in `pipeline_state.json`:

```json
{
  "current_gate": "GATE_5",
  "gate_state": "PASS_WITH_ACTION",
  "pending_actions": [
    "action description 1",
    "action description 2"
  ],
  "override_reason": null
}
```

| Field | Type | Values |
|---|---|---|
| `gate_state` | string\|null | `null` (normal) \| `"PASS_WITH_ACTION"` \| `"OVERRIDE"` |
| `pending_actions` | array | list of action description strings |
| `override_reason` | string\|null | null or Nimrod's stated reason when overriding |

### 2.3 New pipeline_run.sh Commands

| Command | Description |
|---|---|
| `./pipeline_run.sh pass_with_actions "a1\|a2\|a3"` | Record PASS_WITH_ACTION, store action list, HOLD gate (do not advance) |
| `./pipeline_run.sh actions_clear` | All actions resolved — FULL PASS — advance gate automatically |
| `./pipeline_run.sh override "reason"` | Nimrod's "להתקדם" — advance with override_reason logged, pending_actions cleared |
| `./pipeline_run.sh insist` | Nimrod's "להתעקש" — stay at gate, generate correction prompt for responsible team |

Gate advance is **blocked** when `gate_state === "PASS_WITH_ACTION"` and `--force` is not used. Attempting `./pipeline_run.sh pass` in this state returns an error: "Gate is in PASS_WITH_ACTION state — use actions_clear or override."

### 2.4 Dashboard UI Changes

In `pipeline-dashboard.js`:
- When `gate_state === "PASS_WITH_ACTION"`: show yellow `PASS_WITH_ACTION` banner in sidebar
- Banner content: pending action list (one item per line)
- Two action buttons: `✅ Actions Resolved` (calls `actions_clear`) and `⚡ Override & Advance` (prompts for reason, calls `override`)
- When `gate_state === "OVERRIDE"`: show grey "Advance with override" note in gate history

In `pipeline-shared.css` / `pipeline-dashboard.css`:
```css
.pwa-banner { background:rgba(210,153,34,0.10); border:1px solid var(--warning); border-radius:6px; padding:10px 12px; }
.pwa-banner-title { color:var(--warning); font-weight:700; margin-bottom:6px; }
.pwa-action-item { font-size:11px; color:var(--text); padding:3px 0; border-bottom:1px solid var(--border); }
.pwa-btn-clear    { /* green accent */ }
.pwa-btn-override { /* danger accent */ }
```

---

## 3) Implementation Scope

| Component | Change | Effort |
|---|---|---|
| `pipeline_state.json` | +3 new fields | Trivial |
| `pipeline_run.sh` | +4 new commands + gate advance validation | Small (~40 lines) |
| `agents_os/ui/js/pipeline-dashboard.js` | PWA banner rendering + 2 action buttons | Medium (~50 lines) |
| `agents_os/ui/css/pipeline-dashboard.css` | 5 new CSS classes for banner | Small (~15 lines) |
| `agents_os_v2/observers/state_reader.py` | Parse `gate_state` field | Trivial |

Total estimated effort: **Small-to-Medium** — no new architecture, no new dependencies.

---

## 4) Dependencies and Scheduling

| Dependency | Status | Notes |
|---|---|---|
| Team 61 UI extraction merged | DONE (2026-03-15) | Dashboard JS extraction complete — this builds on top |
| S002-P005 task closure | DONE (2026-03-15) | No conflict |
| `pipeline_run.sh` artifact validation (current) | DONE | PASS_WITH_ACTION commands extend the existing validation pattern |

**No blocking dependencies.** Can start at any time after scheduling.

### Recommended scheduling:

| Option | When | Rationale |
|---|---|---|
| **A — S002-P005-WP002 (next)** | After S002-P005 WP001 GATE_8 | Fits naturally in the same program — same domain, same pipeline tooling |
| **B — S003 pre-work** | Before S003 programs start | Ensures the governance mechanic is in place before higher-stakes S003 deliveries |
| **C — Standalone micro-task** | Any available Team 10 slot | Small scope, can be parallelized with other work |

**Team 100 recommendation:** Option A — S002-P005-WP002. Natural continuation of pipeline governance hardening. The `pass_with_actions` command would immediately be usable in S003 QA cycles.

---

## 5) Acceptance Criteria (for implementation)

| AC | Criterion |
|---|---|
| AC-01 | `./pipeline_run.sh pass_with_actions "a1\|a2"` records state, gate does not advance |
| AC-02 | `./pipeline_run.sh pass` fails with meaningful error when gate_state = PASS_WITH_ACTION |
| AC-03 | `./pipeline_run.sh actions_clear` advances gate and clears pending_actions |
| AC-04 | `./pipeline_run.sh override "reason"` advances gate, logs override_reason |
| AC-05 | Dashboard shows PASS_WITH_ACTION banner when gate_state = PASS_WITH_ACTION |
| AC-06 | "Actions Resolved" button triggers actions_clear flow |
| AC-07 | "Override & Advance" button requires reason text, triggers override flow |
| AC-08 | `state_reader.py` parses `gate_state` correctly |

---

## 6) Triggering Note

This backlog item must be **assigned to a specific work package** by Team 00 or Team 100 during the next planning session. It should not float as an unscheduled item.

Suggested trigger: when S002-P005 WP001 GATE_8 is confirmed closed, activate WP002 with this backlog item as the primary task.

---

**log_entry | TEAM_100 | PASS_WITH_ACTION_BACKLOG | DESIGN_LOCKED | PENDING_SCHEDULING | 2026-03-15**
