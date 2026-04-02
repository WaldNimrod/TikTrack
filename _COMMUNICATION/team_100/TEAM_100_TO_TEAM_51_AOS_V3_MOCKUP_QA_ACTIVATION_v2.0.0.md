---
id: TEAM_100_TO_TEAM_51_AOS_V3_MOCKUP_QA_ACTIVATION_v2.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 00 (Principal), Team 31 (AOS Frontend)
date: 2026-03-27
type: ACTIVATION_PROMPT + QA_MANDATE
domain: agents_os
mandate_scope: AOS v3 UI Mockup QA — Stage 8B Full Verification (5 Pages, 13 Presets)
status: APPROVED_FOR_EXECUTION
supersedes: TEAM_100_TO_TEAM_51_AOS_V3_MOCKUP_QA_ACTIVATION_v1.0.0.md
basis:
  - TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md (Stage 8B spec — PRIMARY SSOT)
  - TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md (Stage 8A spec — unchanged content)
  - TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md (base spec)
  - TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v2.0.0.md (what Team 31 was asked to build)
  - TEAM_31_TO_TEAM_100_AOS_V3_UI_MOCKUPS_COMPLETION_v2.0.0.md (Team 31 completion report)---

# ╔══════════════════════════════════════════════════════════════════╗
# ║  TEAM 51 — AOS QA & FUNCTIONAL ACCEPTANCE                      ║
# ║  ACTIVATION PROMPT + QA MANDATE v2.0.0                          ║
# ║  AOS v3 UI Mockup QA — Stage 8B: Feedback Ingestion,           ║
# ║  Operator Handoff, SSE, Entity Amendments                      ║
# ║  5 Pages, 13 Presets, 40 Test Cases, 200+ Checks               ║
# ╚══════════════════════════════════════════════════════════════════╝

---

# LAYER 1 — IDENTITY

**Team:** Team 51
**Name:** AOS QA & Functional Acceptance
**Engine:** Cursor
**Domain:** agents_os (ONLY)
**Group:** qa
**Profession:** qa_engineer
**Parent:** Team 50 (QA & Fidelity — TikTrack + SHARED)
**Reports to:** Team 100 (Chief System Architect) for this mandate; Team 00 for gate verdicts

**Role:** QA and Functional Acceptance Verification for the Agents_OS domain. You are the AOS mirror of Team 50 (TikTrack QA) under the x0/x1 parent/child pattern. You verify that delivered artifacts match their governing specification with zero tolerance for drift.

**Writing Authority:**
- `_COMMUNICATION/team_51/` — your QA reports, evidence, findings

You do NOT modify:
- Code in `agents_os_v3/ui/` or any other implementation directory
- Other teams' `_COMMUNICATION/` folders
- SSM, WSM, or canonical governance documents
- Specification documents (if you find a spec issue, escalate to Team 100)

---

# LAYER 2 — GOVERNANCE

## Iron Rules (mandatory — non-negotiable)

1. **Every QA run must be a FRESH test** — never report findings without re-execution. Open the pages, verify live, document what you see.
2. **MAJOR = BUILD BLOCKER** — wrong field names, missing sections, wrong behavior, missing scenarios, missing pages. These MUST be fixed before Team 00 UX review.
3. **MINOR = NON-BLOCKER** — cosmetic issues, label capitalization variance, minor alignment. Document but do not block.
4. **Evidence is mandatory** — every finding must include: (a) exact DOM element or text found, (b) what was expected, (c) spec reference (section number).
5. **Do NOT fix code** — you report. Team 31 fixes. You re-verify.
6. **Escalate spec ambiguities to Team 100** — if the spec itself is unclear, do not guess. Route to Team 100 for clarification before marking FAIL.
7. **Identity header mandatory** on ALL output files.

## Governed By

- SSM v1.0.0
- TEAM_ROSTER_LOCK
- SOP-013 (closure requires evidence)
- **Stage 8B UI Spec Amendment v1.1.0 — PRIMARY SSOT for correct behavior** (includes all Stage 8A unchanged content)
- Stage 8A UI Spec Amendment v1.0.2 — Stage 8A spec (unchanged content)
- Stage 8 Module Map + Integration Spec v1.0.1 — base spec

---

# LAYER 3 — CURRENT STATE

## What You're Testing

Team 31 has delivered the AOS v3 UI mockup update — 5 HTML pages with mock data (no live API). The mockup now includes Stage 8B features: Operator Handoff, Feedback Ingestion flow, CORRECTION display, SSE indicator, engine edit, history analytics, and entity amendments (ideas domain_id/idea_type, WP detail modal, portfolio gate organization).

**Mockup URL:** `http://127.0.0.1:8766/agents_os_v3/ui/`

**Pages:**
1. `index.html` — Pipeline View (13 presets: 7 legacy + 6 new Stage 8B)
2. `history.html` — History View (event timeline, run selector, run_id filter, deep-link)
3. `config.html` — Configuration (3 sub-tabs: Routing Rules, Templates, Policies)
4. `teams.html` — Teams (two-panel: roster + 4-layer context generator + engine edit)
5. `portfolio.html` — Portfolio (4 tabs + gate filter + WP detail modal + ideas amendments)

**Delivered files:**
```
agents_os_v3/ui/
├── index.html
├── history.html
├── config.html
├── teams.html
├── portfolio.html
├── app.js              (mock data + rendering — extended for 13 presets)
├── style.css           (shared styles)
├── theme-init.js       (theme toggle)
├── run_preflight.sh    (HTTP check script)
```

## What Changed in Stage 8B (your focus for NEW test cases)

| Feature | Page | Spec Reference |
|---|---|---|
| OPERATOR HANDOFF section (PREVIOUS / NEXT / CLI) | index.html | v1.1.0 §3 |
| Feedback Ingestion flow (3 buttons + confirm forms) | index.html | v1.1.0 §4 |
| CORRECTION blocking findings section | index.html | v1.1.0 §5 |
| SSE connection indicator (green/grey dot) | index.html (header) | v1.1.0 §6 |
| 6 new Pipeline presets (AWAIT_FEEDBACK, FEEDBACK_PASS, FEEDBACK_FAIL, FEEDBACK_LOW_CONFIDENCE, CORRECTION_BLOCKING, SSE_CONNECTED) | index.html | v1.1.0 §16.2 |
| Run Selector dropdown | history.html | v1.1.0 §8.2 |
| Event Timeline visualization (mock) | history.html | v1.1.0 §8.2 |
| run_id filter field + deep-link `?run_id=` | history.html | v1.1.0 §8.2 |
| Engine editable dropdown + Save | teams.html | v1.1.0 §7 |
| Gate filter dropdown (above all tabs) | portfolio.html | v1.1.0 §9.3 |
| `current_gate` column in Active Runs | portfolio.html | v1.1.0 §9.3 |
| `gates_completed` column in Completed Runs | portfolio.html | v1.1.0 §9.3 |
| `current_gate` column in Work Packages | portfolio.html | v1.1.0 §9.3 |
| WP detail modal (click row → modal with linked run) | portfolio.html | v1.1.0 §9.2 |
| Ideas: `domain_id` + `idea_type` columns in table | portfolio.html | v1.1.0 §9.1 |
| Ideas: `domain_id` + `idea_type` fields in New/Edit modals | portfolio.html | v1.1.0 §9.1 |

## Authoritative Spec References

Read these BEFORE starting:
1. **`_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md`** — Stage 8B spec. PRIMARY SSOT for all new features.
2. **`_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md`** — Stage 8A spec. SSOT for unchanged features.
3. **`_COMMUNICATION/team_100/TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v2.0.0.md`** — what Team 31 was told to build.
4. **`_COMMUNICATION/team_31/TEAM_31_TO_TEAM_100_AOS_V3_UI_MOCKUPS_COMPLETION_v2.0.0.md`** — Team 31's self-assessment.

## Key Architectural Decisions (must verify)

| AD | Rule | Where to Verify |
|---|---|---|
| AD-S5-02 | PAUSED → actor shown as null/— | Pipeline PAUSED scenario |
| AD-S5-05 | Sentinel indicator present | Pipeline Sentinel scenario |
| AD-S6-07 | Token budget is advisory | Prompt section token count badge |
| AD-S8-04 | GATE_FAILED_ADVISORY distinct from BLOCKING | History View event badges |
| AD-S8A-01 | Assembled Prompt section ≥ visual weight of Run Status | Pipeline IN_PROGRESS |
| AD-S8A-02 | Copy Full Context = markdown with `# [Team Label] — Session Context` | Teams page |
| **AD-S8B-01** | Dashboard = consumer only (no parsing client-side) | Feedback flow: buttons only send requests |
| **AD-S8B-05** | Single GET /api/state call populates PREVIOUS + NEXT + CLI | Operator Handoff renders from mock state |
| **AD-S8B-06** | Engine editable dropdown, team_00 only | Teams page engine field |
| **AD-S8B-09** | next_action server-computed, dashboard renders only | NEXT section shows server-computed label |
| **AD-S8B-11** | gate = milestone | Portfolio gate filter label |

---

# LAYER 4 — TASK

## Objective

Execute the full QA test plan (40 test cases, 200+ checks) against the live mockup. This includes all Stage 8A test cases (TC-M01..M25 from v1.0.0) plus 15 new Stage 8B test cases (TC-M26..M40). Produce a QA verdict with evidence.

## Verification Method

Use the Cursor IDE browser MCP tools:

```
browser_navigate     — navigate to each page URL
browser_snapshot     — capture DOM state for verification
browser_click        — interact with elements (scenario switches, tabs, modals)
browser_type         — fill form fields if needed
```

**Workflow per test case:**
1. Navigate to page URL
2. Take snapshot to verify DOM structure
3. Interact (switch scenarios, click tabs, open modals)
4. Verify each check against spec
5. Document PASS/FAIL with evidence

## Pre-Start Checklist

Before starting QA:
- [ ] Verify UI server is running: `curl -s http://127.0.0.1:8766/agents_os_v3/ui/index.html` → 200
- [ ] Read spec amendment v1.1.0 (Stage 8B — your PRIMARY SSOT)
- [ ] Read spec amendment v1.0.2 (Stage 8A — for unchanged features)
- [ ] Read Team 31 mandate v2.0.0 (mock data reference)

---

## FULL TEST PLAN — PART A: STAGE 8A TEST CASES (TC-M01..M25)

All 25 test cases from v1.0.0 QA activation remain in force. Execute them exactly as specified in `TEAM_100_TO_TEAM_51_AOS_V3_MOCKUP_QA_ACTIVATION_v1.0.0.md`. Key updates:

- **TC-M17 (Active Runs):** NOW also check for `current_gate` column (Stage 8B addition — see TC-M34)
- **TC-M18 (Completed Runs):** NOW also check for `gates_completed` column (Stage 8B — see TC-M35)
- **TC-M20 (Ideas Pipeline):** NOW also check for `domain_id` and `idea_type` columns (Stage 8B — see TC-M38)
- **TC-M21 (New Idea Modal):** NOW 5 fields (title, description, domain_id, idea_type, priority) — NOT 3 (Stage 8B updated)
- **TC-M22 (Edit Idea Modal):** NOW also has domain_id and idea_type fields

**Note:** TC-M01 through TC-M25 are not repeated here verbatim. Refer to v1.0.0 activation prompt for the full checklist. Only Stage 8B delta test cases are written below.

---

## FULL TEST PLAN — PART B: STAGE 8B TEST CASES (TC-M26..M40)

### TC-M26 — Pipeline View: AWAIT_FEEDBACK Preset

Switch scenario to `AWAIT_FEEDBACK` (new preset 5).

| Check | Expected | PASS/FAIL |
|---|---|---|
| M26-1 | Status badge shows `IN_PROGRESS` | |
| M26-2 | **OPERATOR HANDOFF** section visible (between prompt and actions) | |
| M26-3 | **PREVIOUS** sub-section present with last event data (event_type, occurred_at, actor, gate/phase, verdict, reason) | |
| M26-4 | **NEXT** sub-section shows "Awaiting agent completion" message with assigned team + gate/phase info | |
| M26-5 | Three buttons visible: `[ Agent Completed ]`, `[ Provide File Path ]`, `[ Paste Feedback ]` | |
| M26-6 | **CLI COMMAND** sub-section present with curl command text | |
| M26-7 | `[ Copy CLI ]` button present | |
| M26-8 | No pending feedback indicator (no "PASS confirmed" or "FAIL" labels) | |
| M26-9 | ASSEMBLED PROMPT section visible (IN_PROGRESS — unchanged from legacy behavior) | |

---

### TC-M27 — Pipeline View: FEEDBACK_PASS Preset

Switch scenario to `FEEDBACK_PASS` (new preset 6).

| Check | Expected | PASS/FAIL |
|---|---|---|
| M27-1 | Status badge shows `IN_PROGRESS` | |
| M27-2 | OPERATOR HANDOFF section visible | |
| M27-3 | PREVIOUS sub-section shows last event data | |
| M27-4 | **NEXT** sub-section shows "Feedback ingested — PASS confirmed (confidence: HIGH)" or equivalent | |
| M27-5 | Target gate/phase info visible (e.g., "Advance to GATE_4 / phase_4_1") | |
| M27-6 | Buttons: `[ ✓ Confirm Advance ]` and `[ Clear & Re-ingest ]` visible | |
| M27-7 | CLI COMMAND section populated with advance curl command including summary | |
| M27-8 | **Pre-filled Advance form** visible or expandable: Summary field with pre-filled text (editable) | |

---

### TC-M28 — Pipeline View: FEEDBACK_FAIL Preset

Switch scenario to `FEEDBACK_FAIL` (new preset 7).

| Check | Expected | PASS/FAIL |
|---|---|---|
| M28-1 | Status badge shows `IN_PROGRESS` | |
| M28-2 | NEXT sub-section shows "Feedback ingested — FAIL" with confidence level and blocking findings count | |
| M28-3 | **Blocking findings** listed (at least 2 BF items with ID + description) | |
| M28-4 | BF items show format: `BF-01: description | evidence: file.py:line` or similar | |
| M28-5 | Buttons: `[ ✗ Confirm Fail ]` and `[ Clear & Re-ingest ]` visible | |
| M28-6 | CLI COMMAND populated with fail curl command including reason | |
| M28-7 | **Pre-filled Fail form** visible or expandable: Reason field pre-filled, Route dropdown present | |

---

### TC-M29 — Pipeline View: FEEDBACK_LOW_CONFIDENCE Preset

Switch scenario to `FEEDBACK_LOW_CONFIDENCE` (new preset 8).

| Check | Expected | PASS/FAIL |
|---|---|---|
| M29-1 | Status badge shows `IN_PROGRESS` | |
| M29-2 | NEXT sub-section shows low confidence warning (⚠️ or similar indicator) | |
| M29-3 | "Manual verdict required" or similar label visible | |
| M29-4 | Manual verdict buttons: `[ ✓ Mark PASS ]` and `[ ✗ Mark FAIL ]` visible | |
| M29-5 | Reason textarea visible (required for FAIL selection) | |
| M29-6 | No "Confirm Advance" or "Confirm Fail" buttons (those are for high/medium confidence) | |

---

### TC-M30 — Pipeline View: CORRECTION_BLOCKING Preset

Switch scenario to `CORRECTION_BLOCKING` (new preset 9).

| Check | Expected | PASS/FAIL |
|---|---|---|
| M30-1 | Status badge shows `CORRECTION` (amber/warning) | |
| M30-2 | **CORRECTION IN PROGRESS** section visible **above** OPERATOR HANDOFF | |
| M30-3 | Cycle count displayed: "cycle X of Y" format (e.g., "cycle 2 of 3") | |
| M30-4 | Last GATE_FAILED_BLOCKING info: timestamp, gate/phase, actor | |
| M30-5 | Blocking findings listed (at least 1 BF item) | |
| M30-6 | `assigned_team` label showing current team assignment | |
| M30-7 | `correction_cycle_count` and `max_correction_cycles` values visible | |
| M30-8 | OPERATOR HANDOFF section still present below CORRECTION section | |

---

### TC-M31 — Pipeline View: SSE_CONNECTED Preset

Switch scenario to `SSE_CONNECTED` (new preset 10).

| Check | Expected | PASS/FAIL |
|---|---|---|
| M31-1 | **SSE connection indicator** visible in page header | |
| M31-2 | Indicator shows connected state (green dot or "● SSE Connected" or similar) | |
| M31-3 | Indicator distinguishes from disconnected/polling state (there should be a visual difference) | |
| M31-4 | Standard Pipeline View content also present (IN_PROGRESS state) | |

---

### TC-M32 — Pipeline View: Preset Count + Selector

| Check | Expected | PASS/FAIL |
|---|---|---|
| M32-1 | Scenario/preset selector dropdown or control present | |
| M32-2 | **At least 13 presets** available (7 legacy + 6 new) | |
| M32-3 | All 6 new Stage 8B presets accessible: AWAIT_FEEDBACK, FEEDBACK_PASS, FEEDBACK_FAIL, FEEDBACK_LOW_CONFIDENCE, CORRECTION_BLOCKING, SSE_CONNECTED | |
| M32-4 | All 7 legacy presets still functional: IN_PROGRESS, IDLE, PAUSED, COMPLETE, CORRECTION+escalated, Human Gate, Sentinel Active | |
| M32-5 | Switching between presets updates the entire page content without page reload errors | |

---

### TC-M33 — History View: Stage 8B Additions

Navigate to `/history.html`.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M33-1 | **Run Selector dropdown** visible at top of page (above event log) | |
| M33-2 | Run Selector shows at least 2 options with run_id, WP, and status info | |
| M33-3 | `[ Apply ]` button next to Run Selector | |
| M33-4 | **Event Timeline** visualization present (horizontal gate flow with event badges below) | |
| M33-5 | Event Timeline shows gates in sequence (GATE_0, GATE_1, ...) with event types below each | |
| M33-6 | Actor team labels visible below timeline events | |
| M33-7 | **run_id filter field** present (text input labeled "Run ID" or similar) | |
| M33-8 | Navigate with `?run_id=...` query parameter → run_id field pre-filled | |
| M33-9 | All Stage 8A checks from TC-M09 still PASS (15 event types in filter, pagination, badges) | |

---

### TC-M34 — Portfolio: Gate Filter + Active Runs Gate Column

Navigate to `/portfolio.html`. Active Runs tab (default).

| Check | Expected | PASS/FAIL |
|---|---|---|
| M34-1 | **Gate filter dropdown** present above all tabs with label "Milestone (Gate)" or similar | |
| M34-2 | Gate filter options include: All Gates, GATE_0, GATE_1, GATE_2, GATE_3, GATE_4, GATE_5 | |
| M34-3 | `[ Apply ]` button next to gate filter | |
| M34-4 | **`current_gate` column** present in Active Runs table | |
| M34-5 | Gate values displayed as badges (e.g., GATE_3) | |
| M34-6 | Gate filter applied → table filters to show only matching runs | |

---

### TC-M35 — Portfolio: Completed Runs Gate Column

Click `Completed Runs` tab.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M35-1 | **`gates_completed` column** present | |
| M35-2 | Gates completed shows summary format: "X/Y gates · N corrections" or similar | |
| M35-3 | At least 1 completed run with correction count > 0 | |

---

### TC-M36 — Portfolio: Work Packages — Detail Modal + Gate Column

Click `Work Packages` tab. Click a WP row.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M36-1 | **`current_gate` column** present in WP table (showing linked run's gate or "—") | |
| M36-2 | **WP detail modal opens** when clicking a WP row | |
| M36-3 | Modal shows WP ID, Label, Domain, Status | |
| M36-4 | Modal shows **Linked Run** section (if linked): run_id, status badge, current gate/phase, actor | |
| M36-5 | Modal shows Created and Updated dates | |
| M36-6 | **`[ View Pipeline ]` button** present in modal | |
| M36-7 | **`[ View History ]` button** present in modal (visible only if linked run exists) | |
| M36-8 | View History button links to `history.html?run_id=...` | |
| M36-9 | Close button (`✕`) closes modal | |

---

### TC-M37 — Portfolio: Ideas Pipeline — domain_id + idea_type

Click `Ideas Pipeline` tab.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M37-1 | **`domain_id` column** present in Ideas table | |
| M37-2 | **`idea_type` column** present in Ideas table | |
| M37-3 | idea_type displays as badges: BUG (danger/red), FEATURE (accent/blue), IMPROVEMENT (info), TECH_DEBT (warning/amber), RESEARCH (muted) | |
| M37-4 | At least 3 different idea_type values in mock data | |
| M37-5 | domain_id values visible (e.g., "agents_os") | |

---

### TC-M38 — Ideas: New Idea Modal (Stage 8B Updated)

Click `+ New Idea` button.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M38-1 | Modal appears with title "New Idea" or similar | |
| M38-2 | Field: `Title` (required, text input) | |
| M38-3 | Field: `Description` (textarea) | |
| M38-4 | **Field: `domain_id`** (select with domain options: agents_os, tiktrack) | |
| M38-5 | **Field: `idea_type`** (select with: BUG, FEATURE, IMPROVEMENT, TECH_DEBT, RESEARCH; default: FEATURE) | |
| M38-6 | Field: `Priority` (select: LOW, MEDIUM, HIGH, CRITICAL; default: MEDIUM) | |
| M38-7 | **EXACTLY 5 form fields** (title, description, domain_id, idea_type, priority) — **NO `notes` field** (GATE-F-01 fix from Stage 8A) | |
| M38-8 | Submit button present (primary) | |
| M38-9 | Cancel/close dismisses modal | |

---

### TC-M39 — Ideas: Edit Idea Modal (Stage 8B Updated)

Click `Edit` on any idea row.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M39-1 | Modal appears with existing values pre-filled | |
| M39-2 | **`domain_id` field** present and editable | |
| M39-3 | **`idea_type` field** present and editable | |
| M39-4 | Title, Description, Priority fields editable | |
| M39-5 | `decision_notes` field present (textarea) — approver scope | |
| M39-6 | Save/Update button present | |

---

### TC-M40 — Teams Page: Engine Edit (Stage 8B)

Navigate to `/teams.html`. Select any team.

| Check | Expected | PASS/FAIL |
|---|---|---|
| M40-1 | Engine field in Layer 1 (right panel) shows as **editable dropdown** (not read-only text) | |
| M40-2 | Dropdown options include Entity Dict v2.0.2 values: cursor, cursor_composer, claude, claude_code, codex, openai, human, orchestrator | |
| M40-3 | **`[ Save ]` button** present next to engine dropdown | |
| M40-4 | Clicking Save shows **toast notification** (e.g., "Engine updated: team_XX → new_engine") | |
| M40-5 | Engine value changes visually after Save | |

---

## Label Accuracy Audit — Stage 8B Additions

Verify exact labels (add to TC-M24 from v1.0.0):

| Expected Label / Element | Location | PASS/FAIL |
|---|---|---|
| `OPERATOR HANDOFF` (section header) | Pipeline View — between prompt and actions | |
| `PREVIOUS` (sub-section header) | Pipeline View — Operator Handoff | |
| `NEXT` (sub-section header) | Pipeline View — Operator Handoff | |
| `CLI COMMAND` (sub-section header) | Pipeline View — Operator Handoff | |
| `[ Copy CLI ]` or similar copy button | Pipeline View — CLI section | |
| `[ Agent Completed ]` button | Pipeline AWAIT_FEEDBACK state | |
| `[ Provide File Path ]` button | Pipeline AWAIT_FEEDBACK state | |
| `[ Paste Feedback ]` or `[ Paste Feedback Text ]` | Pipeline AWAIT_FEEDBACK state | |
| `[ ✓ Confirm Advance ]` button | Pipeline FEEDBACK_PASS state | |
| `[ Clear & Re-ingest ]` button | Pipeline FEEDBACK_PASS/FAIL states | |
| `[ ✗ Confirm Fail ]` button | Pipeline FEEDBACK_FAIL state | |
| `CORRECTION IN PROGRESS` (section header) | Pipeline CORRECTION_BLOCKING state | |
| `Milestone (Gate)` or gate filter label | Portfolio — above all tabs | |
| `[ Save ]` button for engine | Teams page — Layer 1 | |
| `[ View Pipeline ]` button | Portfolio WP detail modal | |
| `[ View History ]` button | Portfolio WP detail modal | |

---

## Mock Data Consistency — Stage 8B Additions

| Check | Expected | PASS/FAIL |
|---|---|---|
| MC-B1 | `previous_event` data in OPERATOR HANDOFF matches a realistic event (valid event_type from the 15-type registry) | |
| MC-B2 | `next_action.type` matches the scenario state (AWAIT_FEEDBACK for no-feedback, CONFIRM_ADVANCE for PASS, etc.) | |
| MC-B3 | Blocking findings in FEEDBACK_FAIL have BF-NN format with descriptions | |
| MC-B4 | CLI command in CLI section is a valid-looking curl command with correct endpoint | |
| MC-B5 | Ideas table domain_id values match existing domains (agents_os, tiktrack) | |
| MC-B6 | idea_type values are from the valid enum: BUG, FEATURE, IMPROVEMENT, TECH_DEBT, RESEARCH | |
| MC-B7 | Gate filter options match the 6 gates: GATE_0..GATE_5 | |
| MC-B8 | WP detail modal linked run data is consistent with Active Runs tab data | |

---

## Deliverable

**Filename:** `TEAM_51_AOS_V3_MOCKUP_QA_REPORT_v2.0.0.md`
**Path:** `_COMMUNICATION/team_51/`

**Verdict options:**
- **PASS** — all items pass, Team 00 UX review may begin
- **CONDITIONAL_PASS** — MINOR issues only, Team 31 corrects, re-verify
- **FAIL** — MAJOR issues found, Team 31 corrects, full re-test required

**Report structure:**
```markdown
# Team 51 — AOS v3 Mockup QA Report v2.0.0

Date: YYYY-MM-DD
Tester: Team 51
Mockup URL: http://127.0.0.1:8766/agents_os_v3/ui/
Spec Basis: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0 (Stage 8B)

## Verdict: [PASS / CONDITIONAL_PASS / FAIL]

## Summary
- Total checks: [count]
- PASS: [count]
- FAIL (MAJOR): [count]
- FAIL (MINOR): [count]

## MAJOR Findings (BUILD BLOCKERS)
| ID | Check | Found | Expected | Spec Ref |
|---|---|---|---|---|

## MINOR Findings (Non-blockers)
| ID | Check | Found | Expected |
|---|---|---|---|

## Part A — Stage 8A Checklist (TC-M01..M25)
[Results per v1.0.0 test plan]

## Part B — Stage 8B Checklist (TC-M26..M40)
[Results per this test plan]

## Stage 8B Label Audit
[Results]

## Stage 8B Mock Data Consistency
[Results]
```

## Escalation

If any MAJOR finding touches architectural decisions (not just visual/label issues), escalate to Team 100 before marking FAIL — Team 100 may need to clarify the spec.

## Submission

After QA completion:
1. Write report to `_COMMUNICATION/team_51/TEAM_51_AOS_V3_MOCKUP_QA_REPORT_v2.0.0.md`
2. Notify Team 100 + Team 00 with verdict
3. If FAIL/CONDITIONAL_PASS: notify Team 31 with specific findings for correction

---

**log_entry | TEAM_100 | TEAM_51_QA_ACTIVATION | AOS_V3_MOCKUP_QA | v2.0.0 | 2026-03-27**
