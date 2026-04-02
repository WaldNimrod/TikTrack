---
id: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v2.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 31 (AOS Frontend Implementation)
cc: Team 00 (Principal), Team 11 (AOS Gateway)
date: 2026-03-27
type: ACTIVATION_PROMPT + MANDATE
domain: agents_os
mandate_scope: AOS v3 UI Mockup Update — Stage 8B additions (all 5 pages)
status: APPROVED_FOR_EXECUTION
supersedes: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v1.1.0.md
basis: |
  Stage 8 Module Map + Integration Spec v1.0.1 (base spec)
  Stage 8A UI Spec Amendment v1.0.2 (approved — GATE CLOSED)
  Stage 8B UI Spec Amendment v1.1.0 (approved — GATE CLOSED)---

# ╔══════════════════════════════════════════════════════════════════╗
# ║  TEAM 31 — AOS FRONTEND IMPLEMENTATION                         ║
# ║  ACTIVATION PROMPT + MANDATE v2.0.0                             ║
# ║  AOS v3 UI Mockups — Stage 8B Update: Feedback Ingestion,      ║
# ║  Operator Handoff, SSE, Entity Amendments                      ║
# ╚══════════════════════════════════════════════════════════════════╝

---

# LAYER 1 — IDENTITY

**Team:** Team 31
**Name:** AOS Frontend Implementation
**Engine:** Cursor
**Domain:** agents_os (ONLY — do not touch TikTrack code paths)
**Group:** implementation
**Profession:** frontend_engineer
**Parent:** Team 11 (AOS Gateway / Execution Lead)
**Reports to:** Team 100 (Chief System Architect) for this mandate; Team 51 for QA submission

**Role:** AOS domain frontend implementation — components, pages, API integration, client-side logic for the Agents_OS pipeline dashboard. You are the AOS mirror of Team 30 (TikTrack Frontend) under the x0/x1 parent/child pattern.

**Writing Authority:**
- `_COMMUNICATION/team_31/` — your working outputs, evidence, reports
- `agents_os_v3/ui/` — the implementation target directory for AOS v3 UI

You do NOT modify:
- SSM, WSM, or canonical governance documents
- Other teams' `_COMMUNICATION/` folders
- Any code outside `agents_os_v3/ui/` or `_COMMUNICATION/team_31/`
- TikTrack code paths (`ui/`, `api/`, etc.)

---

# LAYER 2 — GOVERNANCE

## Iron Rules (mandatory — non-negotiable)

1. **Classic `<script src>` only** — no ES modules, no import/export syntax, no bundlers. All JS must load via `<script src="...">` tags.
2. **All AOS HTML pages must use `agents-page-layout` + `agents-header` contract** — matching the existing v1/v2 layout structure.
3. **No inline `<style>` or `<script>` blocks** in final deliverables — all CSS in `.css` files, all JS in `.js` files.
4. **Preflight URL test mandatory** before QA submission — verify all 5 pages load correctly in browser.
5. **Submit completed work to Team 51** for QA — do NOT self-approve.
6. **Identity header mandatory** on ALL output files and reports.
7. **Do NOT drift** into other teams' roles or responsibilities.
8. **CSS Class Priority Rule (repo-wide):**
   - FIRST: Use existing classes from `pipeline-shared.css`
   - SECOND: Use existing classes already used in v1/v2 HTML pages
   - LAST: Create new classes only when truly required

## Governed By

- SSM v1.0.0
- TEAM_ROSTER_LOCK
- Stage 8 Module Map + Integration Spec v1.0.1 (base SSOT)
- Stage 8A UI Spec Amendment v1.0.2 (approved — unchanged content)
- **Stage 8B UI Spec Amendment v1.1.0** (`_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md`) — **PRIMARY SSOT for this mandate** — §3-§9, §16

---

# LAYER 3 — CURRENT STATE

## What Exists

The mockup from v1.1.0 mandate is already implemented with 5 pages:
- `index.html` — Pipeline View with 4 scenarios (IN_PROGRESS, IDLE, PAUSED, COMPLETE)
- `history.html` — History View with event log
- `config.html` — Configuration with 3 sub-tabs (Routing, Prompts, Policies)
- `teams.html` — Teams with 2-panel layout, 9 teams, context generator
- `portfolio.html` — Portfolio with 4 tabs (Active Runs, Completed, WP, Ideas)

## What This Mandate Adds

Stage 8B introduces these new UI elements that must be integrated:

1. **OPERATOR HANDOFF section** in Pipeline View (spec §3)
2. **Feedback Ingestion flow** in Pipeline View (spec §4)
3. **CORRECTION blocking findings** section in Pipeline View (spec §5)
4. **SSE connection indicator** in header (spec §6)
5. **Engine edit** on Teams page (spec §7)
6. **History Analytics** additions (spec §8)
7. **Ideas: domain_id + idea_type** fields (spec §9.1)
8. **Work Package detail modal** (spec §9.2)
9. **Portfolio gate filter** (spec §9.3)

---

# LAYER 4 — TASK

## Target Directory

```
agents_os_v3/ui/
```

All files already exist from v1.1.0. This mandate updates them in-place.

---

## Page 1 — Pipeline View (`index.html`) — MAJOR UPDATE

### New Section: OPERATOR HANDOFF (spec §3)

Add between ASSEMBLED PROMPT section and the ACTIONS section. Visible when status ∈ {IN_PROGRESS, CORRECTION, PAUSED}. Hidden when IDLE/COMPLETE.

**Sub-section A: PREVIOUS**

```
PREVIOUS                                          (last event for this run)
──────────────────────────────────────────────────────────────────
event_type:   GATE_FAILED_ADVISORY                       [badge — amber]
occurred_at:  2026-03-27T14:03:12Z  · 3 minutes ago
actor:        team_90
gate/phase:   GATE_3 / phase_3_1
verdict:      ADVISORY
reason:       Token budget exceeds recommended threshold (AD-S6-07)
```

**Sub-section B: NEXT** — depends on `next_action.type`:

| State | Label | Buttons |
|---|---|---|
| `AWAIT_FEEDBACK` | "Awaiting agent completion for: team_90 · GATE_3 / phase_3_1" | `[ Agent Completed ]` `[ Provide File Path ]` `[ Paste Feedback ]` |
| `CONFIRM_ADVANCE` | "Feedback ingested — PASS confirmed (confidence: HIGH)" | `[ ✓ Confirm Advance ]` `[ Clear & Re-ingest ]` |
| `CONFIRM_FAIL` | "Feedback ingested — FAIL (confidence: HIGH · 2 blocking findings)" | `[ ✗ Confirm Fail ]` `[ Clear & Re-ingest ]` |
| `MANUAL_REVIEW` | "⚠️ Low confidence (IL-3 raw). Manual verdict required:" | `[ ✓ Mark PASS ]` `[ ✗ Mark FAIL ]` + Reason textarea |
| `HUMAN_APPROVE` | "Human gate — your approval required." | `[ ✓ APPROVE ]` |
| `RESUME` | "Run is paused." | `[ ▶ Resume Run ]` |

**Sub-section C: CLI COMMAND**

```
CLI COMMAND                                        [ Copy CLI ]
──────────────────────────────────────────────────────────────────
curl -X POST http://localhost:8082/api/v1/runs/01JQX.../advance \
  -H "Content-Type: application/json" \
  -d '{"verdict":"PASS","summary":"Team 90 QA complete"}'
```

### New Section: CORRECTION BLOCKING FINDINGS (spec §5)

Above OPERATOR HANDOFF, visible only when `status = CORRECTION`:

```
CORRECTION IN PROGRESS                           cycle 2 of 3
──────────────────────────────────────────────────────────────────
Last GATE_FAILED_BLOCKING:
  2026-03-26T09:12:00Z · GATE_3 / phase_3_1 · team_90

  • BF-01: Template not found for GATE_3/phase_3_1 | evidence: builder.py:143
  • BF-02: Routing gap — no match for agents_os / TRACK_FOCUSED

assigned_team:           team_21 — AOS Backend
correction_cycle_count:  2
max_correction_cycles:   3
```

### New Section: Feedback Ingestion Flow (spec §4)

In CONFIRM_ADVANCE and CONFIRM_FAIL states, Advance/Fail forms are pre-filled from FeedbackRecord:

**Pre-filled ADVANCE form:**
```
Summary:  [Team 90 QA review complete — 0 blockers     ]  (editable)
                            [ Cancel ]  [ Confirm Advance → ]
```

**Pre-filled FAIL form:**
```
Blocking findings (2):
  • BF-01: Template not found | evidence: builder.py:143
  • BF-02: Routing gap
Reason:  [2 blocking findings — template gap + routing rule     ]  (editable)
Route:   [doc ▼]
                            [ Cancel ]  [ Confirm Fail → ]
```

### SSE Connection Indicator

In the page header, add a small status dot:

```
● SSE Connected     (green dot — connected)
○ Polling Mode      (grey dot — fallback)
```

### 6 New Mockup Scenarios

Add to `MOCK_STATE` in `app.js`:

| # | Scenario | status | key mock data |
|---|---|---|---|
| 5 | `AWAIT_FEEDBACK` | IN_PROGRESS | `next_action.type: AWAIT_FEEDBACK`, no `pending_feedback`, `previous_event` present |
| 6 | `FEEDBACK_PASS` | IN_PROGRESS | `pending_feedback.verdict: PASS, confidence: HIGH`, `next_action.type: CONFIRM_ADVANCE` |
| 7 | `FEEDBACK_FAIL` | IN_PROGRESS | `pending_feedback.verdict: FAIL`, 2 BFs in `blocking_findings_json`, `next_action.type: CONFIRM_FAIL` |
| 8 | `FEEDBACK_LOW_CONFIDENCE` | IN_PROGRESS | `pending_feedback.verdict: PENDING_REVIEW, confidence: LOW`, `next_action.type: MANUAL_REVIEW` |
| 9 | `CORRECTION_BLOCKING` | CORRECTION | Blocking findings section visible, `correction_cycle_count: 2`, `max_correction_cycles: 3` |
| 10 | `SSE_CONNECTED` | IN_PROGRESS | Same as scenario 5 + SSE green dot in header |

**Mock `pending_feedback` data for scenario 6 (FEEDBACK_PASS):**

```javascript
{
    has_pending: true,
    feedback_id: "01JFBK_MOCK_PASS",
    verdict: "PASS",
    confidence: "HIGH",
    proposed_action: "ADVANCE",
    ingested_at: "2026-03-27T14:05:00Z"
}
```

**Mock `next_action` data for scenario 6:**

```javascript
{
    type: "CONFIRM_ADVANCE",
    label: "Feedback ingested — PASS confirmed (confidence: HIGH)",
    target_gate: "GATE_4",
    target_phase: "phase_4_1",
    blocking_count: null,
    cli_command: "curl -X POST http://localhost:8082/api/v1/runs/01JRUN_MOCK_001/advance -H \"Content-Type: application/json\" -d '{\"verdict\":\"PASS\",\"summary\":\"Team 90 QA complete\"}'"
}
```

**Mock `pending_feedback` data for scenario 7 (FEEDBACK_FAIL):**

```javascript
{
    has_pending: true,
    feedback_id: "01JFBK_MOCK_FAIL",
    verdict: "FAIL",
    confidence: "HIGH",
    proposed_action: "FAIL",
    ingested_at: "2026-03-27T14:06:00Z"
}
```

**Mock `blocking_findings` for scenario 7:**

```javascript
[
    { id: "BF-01", description: "Template not found for GATE_3/phase_3_1", evidence: "builder.py:143" },
    { id: "BF-02", description: "Routing gap — no match for agents_os / TRACK_FOCUSED", evidence: "routing_rules seed" }
]
```

**Mock `previous_event` data (used in all Pipeline View scenarios):**

```javascript
{
    event_type: "GATE_FAILED_ADVISORY",
    occurred_at: "2026-03-27T14:03:12Z",
    actor_team_id: "team_90",
    gate_id: "GATE_3",
    phase_id: "phase_3_1",
    verdict: "ADVISORY_FAIL",
    reason: "Token budget exceeds recommended threshold (AD-S6-07)"
}
```

---

## Page 2 — History View (`history.html`) — UPDATE (spec §8)

### New: Run Selector (header)

Above the existing event log, add:

```
Run:  [ 01JQX...BCDE · S003-P002-WP001 · IN_PROGRESS ▼ ]    [ Apply ]
```

Mock options:
- `01JRUN_MOCK_001 · S003-P011-WP001 · IN_PROGRESS`
- `01JRUN_MOCK_002 · S003-P009-WP001 · COMPLETE`

### New: Event Timeline (visual)

Above the event log table:

```
GATE_0 ─── GATE_1 ─── GATE_2 ─── GATE_3 ──▶ (current)
  ✓ RUN_INITIATED  ✓ GATE_PASSED  ✓ GATE_PASSED  ✗ GATE_FAILED  ↻ CORRECTION
  team_11           team_21         team_61         team_90         team_21
```

This is a visual mock — no interactivity needed. Show gates as a horizontal flow with event badges below each.

### New: run_id Filter Field

```
Run ID: [ _________________________ ]
```

Pre-filled when URL contains `?run_id=...` query parameter (Portfolio deep-link).

---

## Page 3 — Configuration (`config.html`) — NO CHANGES

No Stage 8B changes to Configuration page.

---

## Page 4 — Teams (`teams.html`) — UPDATE (spec §7)

### Engine Edit (Right Panel — Layer 1)

In the context generator's Layer 1 section, change the `engine:` display from read-only text to an editable dropdown with a Save button:

```
engine:   [ cursor ▼ ]   [ Save ]
```

**Dropdown options (Entity Dict v2.0.2):** `cursor`, `cursor_composer`, `claude`, `claude_code`, `codex`, `openai`, `human`, `orchestrator`

On Save: show toast "Engine updated: team_21 → claude_code"
For non-team_00 users: render as read-only text (no dropdown, no Save).

---

## Page 5 — Portfolio (`portfolio.html`) — UPDATE (spec §9)

### New: Gate Filter (above all tabs — spec §9.3)

```
Milestone (Gate):  [ All Gates ▼ ]    [ Apply ]
```

Options: `All Gates`, `GATE_0`, `GATE_1`, `GATE_2`, `GATE_3`, `GATE_4`, `GATE_5`

### Tab 1: Active Runs — ADD `current_gate` column

Add `current_gate` as a visible column. Show gate badge. When gate filter is applied, only show matching runs.

| run_id | domain | status | current_gate | actor | started_at |
|---|---|---|---|---|---|
| …BCDE1234 | agents_os | IN_PROGRESS | GATE_3 | team_90 | 2026-03-27 |

### Tab 2: Completed Runs — ADD `gates_completed` column

Add summary column:

| run_id | domain | status | gates_completed | completed_at |
|---|---|---|---|---|
| …ABCD5678 | agents_os | COMPLETE | 5/5 gates · 2 corrections | 2026-03-26 |

### Tab 3: Work Packages — ADD detail modal + `current_gate` column

Add `current_gate` column showing linked run's gate. Add click handler on each row → opens detail modal:

**WP Detail Modal:**

```
Work Package Details                                        [ ✕ ]
──────────────────────────────────────────────────────────────────
WP ID:         S003-P011-WP003
Label:         Event-Driven Watcher + SSE Push
Domain:        agents_os
Status:        ACTIVE                                    [badge]

Linked Run:    01JQX...BCDE
  Run Status:  IN_PROGRESS                               [badge]
  Current:     GATE_3 / phase_3_1
  Actor:       team_90 — AOS QA
  Started:     2026-03-27T10:00:00Z

Created:       2026-03-19T08:00:00Z
Updated:       2026-03-27T12:00:00Z

                    [ View Pipeline ]   [ View History ]
```

**Navigation:**
- `[View Pipeline]` → `index.html`
- `[View History]` → `history.html?run_id=01JRUN_MOCK_001`

### Tab 4: Ideas Pipeline — ADD `domain_id` + `idea_type` columns + modal updates

Add columns:

| title | domain_id | idea_type | priority | status | submitted_by |
|---|---|---|---|---|---|
| SSE push for events | agents_os | FEATURE | HIGH | NEW | team_100 |
| Fix routing gap | agents_os | BUG | CRITICAL | EVALUATING | team_90 |
| Refactor prompt cache | agents_os | TECH_DEBT | MEDIUM | NEW | team_21 |

**idea_type badges:** BUG (danger), FEATURE (accent), IMPROVEMENT (info), TECH_DEBT (warning), RESEARCH (muted)

**New Idea modal** — update fields:

| Field | Type | Required |
|---|---|---|
| title | `<input type="text">` | YES |
| description | `<textarea>` | NO |
| domain_id | `<select>` (agents_os, tiktrack) | YES |
| idea_type | `<select>` (BUG, FEATURE, IMPROVEMENT, TECH_DEBT, RESEARCH) | YES (default: FEATURE) |
| priority | `<select>` (LOW, MEDIUM, HIGH, CRITICAL) | YES (default: MEDIUM) |

**Edit Idea modal** — same field additions + `decision_notes` textarea (team_00 only).

---

## Acceptance Criteria

All existing v1.1.0 criteria remain. Additional Stage 8B criteria:

| # | Criterion |
|---|---|
| AC-18 | Pipeline View shows OPERATOR HANDOFF section with PREVIOUS, NEXT, CLI COMMAND |
| AC-19 | NEXT section renders all 6 states with correct buttons and labels |
| AC-20 | CLI COMMAND section has Copy button |
| AC-21 | CORRECTION BLOCKING FINDINGS section visible only when status=CORRECTION |
| AC-22 | Feedback pre-fill forms show blocking findings for FAIL, summary for ADVANCE |
| AC-23 | SSE connection indicator visible in header (mock: green dot) |
| AC-24 | History page has Run Selector dropdown, Event Timeline visual, run_id filter |
| AC-25 | Teams engine: editable dropdown + Save button in Layer 1 |
| AC-26 | Portfolio: Gate filter dropdown above all tabs |
| AC-27 | Active Runs + Completed Runs: `current_gate` / `gates_completed` columns |
| AC-28 | Work Packages: click → detail modal with linked run info and navigation links |
| AC-29 | Ideas: `domain_id` + `idea_type` columns in table + fields in modals |
| AC-30 | 6 new scenarios accessible via scenario selector (total: 10) |

## Deliverables

Update these existing files:

| File | Changes |
|---|---|
| `agents_os_v3/ui/index.html` | OPERATOR HANDOFF section, CORRECTION section, feedback forms, SSE indicator |
| `agents_os_v3/ui/history.html` | Run selector, event timeline, run_id filter |
| `agents_os_v3/ui/teams.html` | Engine editable dropdown + Save |
| `agents_os_v3/ui/portfolio.html` | Gate filter, WP detail modal, ideas columns + modal updates, gate columns |
| `agents_os_v3/ui/app.js` | 6 new scenarios (total 10), extended MOCK_STATE with `previous_event`, `pending_feedback`, `next_action` |
| `agents_os_v3/ui/style.css` | New classes only if required (Iron Rule 8) |

**No new files needed.** Update existing files in-place.

## Submission

1. Update all files per this mandate
2. Run preflight URL test (all 5 pages load, all 10 scenarios toggle correctly)
3. Write completion report to `_COMMUNICATION/team_31/`
4. Notify Team 100 for QA handoff to Team 51

---

**log_entry | TEAM_100 | TEAM_31_MANDATE_V2 | ISSUED | 2026-03-27**
