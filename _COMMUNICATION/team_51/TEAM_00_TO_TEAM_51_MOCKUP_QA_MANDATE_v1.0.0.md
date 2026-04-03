---
id: TEAM_00_TO_TEAM_51_MOCKUP_QA_MANDATE_v1.0.0
historical_record: true
from: Team 00 (System Designer)
to: Team 51 (AOS QA)
cc: Team 31 (AOS Frontend), Team 100 (Chief System Architect)
date: 2026-03-27
type: MANDATE
priority: BLOCKING — no Team 00 UX review until QA PASS
subject: AOS v3 Mockup QA — Full 5-Page Scenario Coverage
blocked_on: TEAM_00_TO_TEAM_31_MOCKUP_MANDATE_v1.0.0.md (Team 31 deliverable)---

# Mandate: AOS v3 Mockup QA — Full 5-Page Coverage

## Authority

Team 00 directive. Team 00 will not conduct UX review until Team 51 issues a QA PASS verdict with this checklist completed in full.

## Prerequisite

**DO NOT START** until Team 31 notifies you their mockup rebuild is complete and live at `http://127.0.0.1:8766/agents_os_v3/ui/`.

Before starting, read:
1. `TEAM_00_TO_TEAM_31_MOCKUP_MANDATE_v1.0.0.md` — full mockup requirements (what Team 31 was asked to build)
2. `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.0.md` — spec amendment (authoritative source for correct behavior)
3. Stage 8 §6: `TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md` — original spec

---

## Deliverable

**Filename:** `TEAM_51_AOS_V3_MOCKUP_QA_REPORT_v1.0.0.md`
**Path:** `_COMMUNICATION/team_51/`
**Format:** This checklist filled in, verdict issued, all FAIL items documented with exact description and screenshot reference

**Verdict options:**
- **PASS** — all items PASS, Team 31 notified, Team 00 UX review may begin
- **CONDITIONAL_PASS** — MINOR issues only, Team 31 corrects, re-verify before Team 00 review
- **FAIL** — MAJOR issues found, Team 31 corrects, full re-test required

**MAJOR = BUILD BLOCKER:** Wrong field names, missing sections, wrong behavior, missing scenarios, missing page
**MINOR = NON-BLOCKER:** Cosmetic issues, label capitalization variance, minor alignment issues

---

## Verification Method

Use MCP browser automation tools for systematic verification:
```
mcp__Claude_in_Chrome__navigate     — navigate to each page URL
mcp__Claude_in_Chrome__read_page    — capture full DOM for verification
mcp__Claude_in_Chrome__javascript_tool — switch scenarios, trigger modals
mcp__Claude_in_Chrome__computer (screenshot) — capture visual state for report
mcp__Claude_in_Chrome__find         — locate specific elements
```

For every FAIL finding: include the exact DOM element or text that is wrong, and the spec reference that defines what it should be.

---

## Checklist

### TC-M01 — Navigation Bar (All Pages)

Verify on each of the 5 pages that navigation shows exactly 5 tabs in this order:

| Check | Page | Expected | PASS/FAIL |
|---|---|---|---|
| M01-1 | index.html | `Pipeline | History | Configuration | Teams | Portfolio` | |
| M01-2 | history.html | same 5 tabs | |
| M01-3 | config.html | same 5 tabs | |
| M01-4 | teams.html | same 5 tabs | |
| M01-5 | portfolio.html | same 5 tabs | |
| M01-6 | All pages | Active tab highlighted/bold | |
| M01-7 | All pages | Dark/Light theme toggle present | |

---

### TC-M02 — Pipeline View: IN_PROGRESS Scenario

Navigate to `/index.html`. Set scenario to `IN_PROGRESS (GATE_3)`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M02-1 | Status badge shows `IN_PROGRESS` (blue) | |
| M02-2 | `current_gate_id` row present with value | |
| M02-3 | `current_phase_id` row present with value | |
| M02-4 | `correction_cycle_count` row present | |
| M02-5 | `execution_mode` row present | |
| M02-6 | `started_at` row present (ISO-8601) | |
| M02-7 | `last_updated` row present (ISO-8601) | |
| M02-8 | CURRENT ACTOR section present with actor value | |
| M02-9 | SENTINEL section present showing `inactive` | |
| M02-10 | **ASSEMBLED PROMPT section VISIBLE** | |
| M02-11 | Prompt section contains multi-line text (L1/L2/L3/L4 markers visible) | |
| M02-12 | `token count: NNN tokens` label present below prompt text | |
| M02-13 | `Copy to clipboard` button present (blue/primary) | |
| M02-14 | `Regenerate` button present (secondary/outline) | |
| M02-15 | ACTIONS section shows: ADVANCE, FAIL, APPROVE, PAUSE, RESUME, OVERRIDE | |
| M02-16 | No "Start Run" form visible | |

---

### TC-M03 — Pipeline View: IDLE Scenario

Switch scenario to `IDLE — no active run`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M03-1 | Main panel shows "No active run for this domain." text | |
| M03-2 | **Start Run form IS visible** | |
| M03-3 | Form field label: `Work Package ID` (text input) | |
| M03-4 | Form field label: `Domain` (select with options: agents_os, tiktrack) | |
| M03-5 | Form field label: `Process Variant` (select: TRACK_FULL, TRACK_FOCUSED, TRACK_FAST) | |
| M03-6 | Form field label: `Execution Mode` (select: MANUAL, DASHBOARD, AUTOMATIC) | |
| M03-7 | Button label: `Start Run →` (primary blue) | |
| M03-8 | **ASSEMBLED PROMPT section NOT visible** | |
| M03-9 | No RUN STATUS, CURRENT ACTOR, SENTINEL sections in main area | |

---

### TC-M04 — Pipeline View: PAUSED Scenario

Switch scenario to `PAUSED (actor null)`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M04-1 | Status badge shows `PAUSED` (grey) | |
| M04-2 | **`paused_at` row present in RUN STATUS section** (ISO-8601 value) | |
| M04-3 | CURRENT ACTOR section: actor value is `—` or `null` (not a team name) | |
| M04-4 | AD-S5-02 note visible: "PAUSED → actor shown as null/—" | |
| M04-5 | **ASSEMBLED PROMPT section NOT visible** (no prompt while paused) | |
| M04-6 | RESUME button visible in ACTIONS | |

---

### TC-M05 — Pipeline View: CORRECTION + Escalated

Switch scenario to `CORRECTION + escalated banner`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M05-1 | **Red/amber banner at top** (above RUN STATUS) | |
| M05-2 | Banner text contains: `CORRECTION_ESCALATED` and `Team 00` | |
| M05-3 | Status badge shows `CORRECTION` (orange/amber) | |
| M05-4 | `correction_cycle_count` shows value ≥ 1 | |
| M05-5 | **ASSEMBLED PROMPT section VISIBLE** (correction still has a prompt) | |
| M05-6 | ACTIONS section present with RESUBMIT or ADVANCE visible | |

---

### TC-M06 — Pipeline View: Human Gate

Switch scenario to `Human gate (APPROVE visible)`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M06-1 | Status shows `IN_PROGRESS` | |
| M06-2 | `actor` shows `team_00` | |
| M06-3 | Actor type shows `human` | |
| M06-4 | **APPROVE button visible** in ACTIONS (prominent) | |
| M06-5 | ASSEMBLED PROMPT section visible | |

---

### TC-M07 — Pipeline View: Sentinel Active

Switch scenario to `Sentinel active + override`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M07-1 | SENTINEL section shows `active · override: team_30` | |
| M07-2 | `execution_mode` shows `DASHBOARD` | |
| M07-3 | Actor field shows `team_30` | |
| M07-4 | ASSEMBLED PROMPT section visible | |

---

### TC-M08 — Pipeline View: COMPLETE (NEW scenario)

Switch scenario to `COMPLETE — run finished`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M08-1 | Status badge shows `COMPLETE` (green) | |
| M08-2 | `completed_at` row visible (ISO-8601) | |
| M08-3 | **ASSEMBLED PROMPT section NOT visible** | |
| M08-4 | ADVANCE, FAIL, PAUSE, RESUME buttons disabled or hidden | |
| M08-5 | OVERRIDE button still present (team_00 can always override) | |

---

### TC-M09 — History View: Full Coverage

Navigate to `/history.html`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M09-1 | EVENT_TYPE filter dropdown contains exactly 15 options | |
| M09-2 | List all 15 — verify against Stage 7 §1: RUN_INITIATED, PHASE_PASSED, GATE_PASSED, RUN_COMPLETED, GATE_FAILED_BLOCKING, GATE_FAILED_ADVISORY, GATE_APPROVED, CORRECTION_RESUBMITTED, CORRECTION_ESCALATED, CORRECTION_RESOLVED, RUN_PAUSED, RUN_RESUMED, RUN_RESUMED_WITH_NEW_ASSIGNMENT, PRINCIPAL_OVERRIDE, ROUTING_FAILED | |
| M09-3 | GATE_FAILED_ADVISORY row has DISTINCT visual treatment from GATE_FAILED_BLOCKING | |
| M09-4 | GATE_FAILED_ADVISORY badge is NOT red (should be amber/orange/muted) | |
| M09-5 | GATE_FAILED_BLOCKING badge IS red | |
| M09-6 | Filters: DOMAIN_ID, GATE_ID, EVENT_TYPE, ACTOR_TEAM_ID, LIMIT, ORDER, OFFSET all present | |
| M09-7 | Total count displayed | |
| M09-8 | Prev / Next pagination controls | |
| M09-9 | Dark/Light theme toggle works | |

---

### TC-M10 — Configuration: Routing Rules

Navigate to `/config.html`. Click Routing rules tab.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M10-1 | Table columns: ID, GATE_ID, PHASE_ID, DOMAIN_ID, VARIANT, ROLE_ID, PRIORITY | |
| M10-2 | Read-only note visible above table | |
| M10-3 | At least 3 mock rows | |
| M10-4 | POST/PUT mock row present (greyed, labelled "team_00 only") | |

---

### TC-M11 — Configuration: Templates

Click Templates sub-tab.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M11-1 | At least 2 template cards visible | |
| M11-2 | Each card shows: name, version badge (e.g. v3), `active` badge | |
| M11-3 | Each card shows scope: `GATE_X / phase_X_X / domain` | |
| M11-4 | `Preview body` button present | |
| M11-5 | `Edit (team_00 only)` button present, greyed/disabled | |

---

### TC-M12 — Configuration: Policies

Click Policies sub-tab.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M12-1 | Table columns: POLICY_KEY, SCOPE_TYPE, POLICY_VALUE (PARSED) | |
| M12-2 | `max_correction_cycles` row with `{"max": 3}` value | |
| M12-3 | `token_budget` row with L1/L2/L3/L4 values | |
| M12-4 | `Edit (team_00 only)` button present, greyed/disabled | |

---

### TC-M13 — Teams Page: Structure

Navigate to `/teams.html`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M13-1 | Two-panel layout: roster (left ~300px) + context generator (right/main) | |
| M13-2 | Page subtitle contains `GET /api/teams (mock)` | |
| M13-3 | Group filter dropdown present: All / AOS / TikTrack / Cross-domain | |
| M13-4 | "Current actor only" filter/toggle present | |
| M13-5 | At least 9 teams in roster (team_00, team_100, team_11, team_21, team_31, team_51, team_61, team_111, team_190) | |
| M13-6 | `CURRENT ACTOR ★` label present on exactly ONE team | |
| M13-7 | Engine badges present on each team entry (cursor / claude_code / openai / human) | |

---

### TC-M14 — Teams Page: Current Actor Selected

Select the team marked as `CURRENT ACTOR` (should be team_21 by default).

| Check | Expected | PASS/FAIL |
|---|---|---|
| M14-1 | Context generator right panel updates for selected team | |
| M14-2 | **Layer 1 — Identity** section present and expanded | |
| M14-3 | Layer 1 shows: team_id, label, engine, group, parent, children | |
| M14-4 | **Layer 2 — Governance** section present | |
| M14-5 | Layer 2 shows: authority, writes_to, governed_by, iron_rules | |
| M14-6 | **Layer 3 — Current State** section present | |
| M14-7 | Layer 3 shows: active_run, domain, gate, status, recent events | |
| M14-8 | **Layer 4 — Task** section present | |
| M14-9 | Layer 4 shows "CURRENT ACTOR" label + prompt preview + acceptance criteria | |
| M14-10 | `Copy L1` / `Copy L2` / `Copy L3` / `Copy L4` buttons present | |
| M14-11 | **`Copy Full Context` button present** (primary, prominent) | |
| M14-12 | Clicking "Copy Full Context" shows toast/notification | |

---

### TC-M15 — Teams Page: Non-Current Actor Selected

Select any team that is NOT the current actor (e.g., team_61).

| Check | Expected | PASS/FAIL |
|---|---|---|
| M15-1 | Layer 1 / Layer 2 / Layer 3 still shown | |
| M15-2 | **Layer 4 shows "Not current actor."** (exact text) | |
| M15-3 | No prompt preview in Layer 4 | |
| M15-4 | Layer 3 current state reflects this is NOT the active actor | |
| M15-5 | `Copy Full Context` still present and clickable | |

---

### TC-M16 — Teams Page: Group Filter

| Check | Expected | PASS/FAIL |
|---|---|---|
| M16-1 | Select "AOS" filter — roster shows only x1_aos + cross_domain teams | |
| M16-2 | Select "TikTrack" filter — roster updates | |
| M16-3 | Select "All" — all 9 teams visible | |
| M16-4 | "Current actor only" toggle — shows only the current actor team | |

---

### TC-M17 — Portfolio: Active Runs Tab

Navigate to `/portfolio.html`. Active Runs tab should be default.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M17-1 | Table columns: RUN_ID, DOMAIN, WORK_PACKAGE, STATUS, GATE / PHASE, CORRECTION CYCLES, STARTED, CURRENT ACTOR, ACTIONS | |
| M17-2 | At least 2 mock rows | |
| M17-3 | `IN_PROGRESS` badge (blue) present on at least 1 row | |
| M17-4 | `CORRECTION` badge (orange) present on at least 1 row | |
| M17-5 | `View` button present on each row | |
| M17-6 | `Pause` button present on IN_PROGRESS row | |
| M17-7 | `Override (team_00)` button present on CORRECTION row | |

---

### TC-M18 — Portfolio: Completed Runs Tab

Click `Completed Runs` tab.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M18-1 | Table columns: RUN_ID, DOMAIN, WORK_PACKAGE, STATUS, STARTED, COMPLETED, CORRECTION CYCLES, ACTIONS | |
| M18-2 | At least 3 mock rows | |
| M18-3 | `COMPLETE` badge (green) on all rows | |
| M18-4 | `View History` button on each row | |
| M18-5 | Total count displayed: `Total: 12 completed runs` (or similar) | |
| M18-6 | Prev / Next pagination controls visible | |

---

### TC-M19 — Portfolio: Work Packages Tab

Click `Work Packages` tab.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M19-1 | Table columns: WP_ID, LABEL, DOMAIN, STATUS, LINKED RUN, ACTIONS | |
| M19-2 | At least 5 mock rows | |
| M19-3 | `PLANNED` (grey), `ACTIVE` (blue), `COMPLETE` (green) badges all present | |
| M19-4 | ACTIVE row has `View Run` button | |
| M19-5 | PLANNED rows have `Start Run` button | |
| M19-6 | COMPLETE rows have `View History` button | |
| M19-7 | `Start Run` button only on PLANNED rows (NOT on ACTIVE or COMPLETE) | |

---

### TC-M20 — Portfolio: Ideas Pipeline Tab

Click `Ideas Pipeline` tab.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M20-1 | `+ New Idea` button present, top right | |
| M20-2 | Table columns: IDEA_ID, TITLE, STATUS, PRIORITY, SUBMITTED BY, SUBMITTED, ACTIONS | |
| M20-3 | At least 5 mock rows | |
| M20-4 | All 5 status badges present: NEW, EVALUATING, APPROVED, DEFERRED, REJECTED | |
| M20-5 | NEW badge = blue | |
| M20-6 | EVALUATING badge = amber/yellow | |
| M20-7 | APPROVED badge = green | |
| M20-8 | DEFERRED badge = grey | |
| M20-9 | REJECTED badge = red | |
| M20-10 | Priority badges: CRITICAL, HIGH, MEDIUM, LOW with distinct colors | |
| M20-11 | Inline `Approve`, `Defer`, `Reject` buttons on NEW/EVALUATING rows only | |
| M20-12 | APPROVED/DEFERRED/REJECTED rows have only `Edit` button | |

---

### TC-M21 — Ideas: New Idea Modal

Click `+ New Idea` button.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M21-1 | Modal appears | |
| M21-2 | Modal title: `New Idea` | |
| M21-3 | Field: `Title*` (required, text input) | |
| M21-4 | Field: `Description` (textarea, multi-line) | |
| M21-5 | Field: `Priority` (select: LOW, MEDIUM, HIGH, CRITICAL) | |
| M21-6 | Button: `Cancel` (secondary) | |
| M21-7 | Button: `Submit Idea` (primary blue) | |
| M21-8 | Cancel closes modal | |
| M21-9 | Submit shows toast/notification (mock) | |

---

### TC-M22 — Ideas: Edit Idea Modal

Click `Edit` on any idea row.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M22-1 | Modal appears with existing values pre-filled | |
| M22-2 | Title, Description, Priority fields editable | |
| M22-3 | Status transition buttons present: `Mark Approved`, `Mark Deferred`, `Mark Rejected` | |
| M22-4 | Each status transition button shows toast/notification on click | |
| M22-5 | `Cancel` and `Save` (or `Update`) buttons present | |

---

### TC-M23 — Theme: Dark/Light on New Pages

| Check | Expected | PASS/FAIL |
|---|---|---|
| M23-1 | Teams page: Dark theme applies correctly (no white text on white background, etc.) | |
| M23-2 | Teams page: Light theme applies correctly | |
| M23-3 | Portfolio page: Dark/Light toggle works | |
| M23-4 | No layout breaks when switching theme on any page | |

---

### TC-M24 — Label Accuracy Audit

Verify exact label text (no paraphrasing):

| Expected Label | Location | PASS/FAIL |
|---|---|---|
| `Start Run →` | Pipeline IDLE form | |
| `Copy to clipboard` | Pipeline prompt section | |
| `Regenerate` | Pipeline prompt section | |
| `Copy Full Context` | Teams page (primary button) | |
| `Copy L1` | Teams page Layer 1 | |
| `Copy L2` | Teams page Layer 2 | |
| `Copy L3` | Teams page Layer 3 | |
| `Copy L4` | Teams page Layer 4 | |
| `CURRENT ACTOR ★` | Teams roster | |
| `Not current actor.` | Teams Layer 4 when not actor | |
| `+ New Idea` | Portfolio Ideas tab | |
| `Submit Idea` | Ideas modal | |
| `View History` | Completed runs / WPs | |

---

### TC-M25 — Mock Data Consistency

| Check | Expected | PASS/FAIL |
|---|---|---|
| M25-1 | Current actor in Pipeline View matches "CURRENT ACTOR" in Teams page | |
| M25-2 | Active run in Portfolio matches domain/WP in Pipeline View | |
| M25-3 | Run IDs are realistic ULID format (26 chars, starts with `01J`) | |
| M25-4 | All ISO-8601 timestamps are valid format | |
| M25-5 | No broken layouts / overflow at standard viewport (1440px width) | |

---

## QA Report Template

```markdown
# Team 51 — AOS v3 Mockup QA Report v1.0.0

Date: YYYY-MM-DD
Tester: Team 51
Mockup URL: http://127.0.0.1:8766/agents_os_v3/ui/

## Verdict: [PASS / CONDITIONAL_PASS / FAIL]

## Summary
- Total checks: 130+
- PASS: X
- FAIL (MAJOR): X
- FAIL (MINOR): X

## MAJOR Findings (BUILD BLOCKERS)
| ID | Check | Found | Expected | Spec Ref |
|---|---|---|---|---|
| F-01 | TC-M0X-X | [what was found] | [what was expected] | [§X.X] |

## MINOR Findings (Non-blockers)
| ID | Check | Found | Expected |
|---|---|---|---|

## Full Checklist
[Insert filled checklist from this document]

## Screenshots
[Reference to screenshots taken during review]
```

---

## Escalation

If any MAJOR finding touches architectural decisions (not just visual/label issues), escalate to Team 100 before marking FAIL — Team 100 may need to clarify the spec.

---

**log_entry | TEAM_00 | MOCKUP_QA_MANDATE | ISSUED | team_51 | 2026-03-27**
