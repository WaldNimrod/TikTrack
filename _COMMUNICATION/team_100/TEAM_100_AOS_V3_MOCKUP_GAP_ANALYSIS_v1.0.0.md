---
id: TEAM_100_AOS_V3_MOCKUP_GAP_ANALYSIS_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (System Designer / Nimrod)
date: 2026-03-27
type: GAP_ANALYSIS_REPORT
subject: AOS v3 Mockup — Gap Analysis vs. v2 System + Operational Workflow
basis:
  - v2 system review (agents_os_v2/orchestrator/pipeline.py + context/injection.py)
  - v3 mockup review (http://127.0.0.1:8766/agents_os_v3/ui/ — all 5 pages)
  - Spec amendment v1.0.2 (Stage 8A canonical)---

# AOS v3 Mockup Gap Analysis

## Background: The Operational Model We're Replacing

Before flagging gaps, the core v2 operating pattern must be restated — because the entire UI must serve this loop:

```
1. Pipeline CLI generates prompt (4-layer: L1 identity + L2 governance + L3 state + L4 task)
2. Nimrod copies the prompt → pastes into a Cursor/Claude/Codex session for the relevant team
3. The agent does the work and finishes
4. Nimrod reads the output, judges the verdict (PASS / FAIL + reason)
5. Nimrod runs the terminal command: ./pipeline_run.sh pass  OR  ./pipeline_run.sh fail "findings"
6. Repeat from step 1 for the next gate/phase
```

**The v3 dashboard is a control surface for this loop.** Every page must serve one or more steps.

Key constraint from v2 (HITL prohibition, hardcoded in every generated prompt):
> `⛔ DO NOT run ./pipeline_run.sh or any pipeline CLI command. ✅ Notify Nimrod. Nimrod runs all pipeline commands.`

This means **Nimrod is always the human at the keyboard** — the dashboard is his personal cockpit, not an agent-facing UI.

---

## Page 1 — Pipeline View (`/index.html`)

### What the mockup has (confirmed)
- Operator Handoff section (UNSPECCED — Team 31 proposal)
- Start Run form (§6.1.B)
- Assembled Prompt section (§6.1.A) with checkboxes (blend options)
- Run Status + Current Actor + Sentinel + Actions
- Current Run Log (embedded event table for this run)
- Gate map + phase chips in sidebar
- Program control (Stop / Activate)

### Gaps and issues

| # | Finding | Severity | Detail |
|---|---|---|---|
| P-01 | **Operator Handoff section not in spec — needs gate decision** | MAJOR | Team 31 added an "Operator handoff" section (last event + suggested next action + CLI command + Copy CLI button). This directly addresses the core workflow loop and is architecturally correct. BUT: (a) it's marked "Draft UX / not locked" — it needs a formal spec entry; (b) the CLI shown is a `curl` command to the v3 REST API, not `./pipeline_run.sh` — for the BUILD phase the correct command needs to be defined. This section is the most operationally important thing on the page and currently has no spec backing. **Recommendation: APPROVE and spec it as §6.1.D.** |
| P-02 | **Advance/Fail actions have no input for verdict/reason** | MAJOR | The "POST /advance" and "POST /fail" buttons are shown but there is no input field for the operator to enter: (a) the verdict reason/summary, (b) the finding notes on failure. In v2 this was: `./pipeline_run.sh fail "Contract inconsistencies in UC-04/05"`. In v3 it needs to be: a short text input next to the Advance/Fail buttons so Nimrod can record the summary before clicking. Currently the mockup shows disabled buttons only — the pattern where the reason is captured is missing. |
| P-03 | **"Copy to clipboard" checkboxes need spec clarification** | MINOR | The Assembled Prompt section has checkboxes: "Team context (L1-L4 from Teams mock)" and "Policies (governance mock)". These are blend options — toggle whether to include L1-L4 context and policy layer when copying. This is a good UX addition but is not in §6.1.A spec. Either spec it or remove it. If kept, it must have default states defined. |
| P-04 | **Sidebar Run Metadata duplicates main panel** | MINOR | The sidebar shows run_id, work_package_id, domain_id, process_variant. These same fields appear in the main "Run status" section. Duplication adds noise. Recommendation: sidebar keeps only run_id (short) + domain_id + gate map. Remove the rest from sidebar. |
| P-05 | **Gate map shows only GATE_0..5 — no phase progress indicator** | MINOR | The gate map chips show which gate is active (GATE_3 highlighted). The phases section below shows "phase_3_1 / phase_3_2" chips. However there is no visual indicator of WHICH phase is currently active within the gate, just a static chip list. A simple "active phase" highlight on the phase chip would close this. |
| P-06 | **COMPLETE scenario — actions visible** | MINOR | The COMPLETE state was added (dropdown option). Verify: in COMPLETE state, Advance/Fail/Pause/Resume should be hidden, only Override visible. Not confirmed from DOM reading — needs TC-M08 check. |

---

## Page 2 — Teams (`/teams.html`)

### What the mockup has (confirmed)
- Organization tree (left panel top)
- Compact team roster (list of all teams, click to select)
- Current actor indicator (team_61 marked)
- L1–L4 context layers with Copy L1/L2/L3/L4 buttons
- Copy Full Context button
- engine dropdown (editable — for testing different engines)
- Filters: Domain, Group, "Current actor only" checkbox

### Gaps and issues

| # | Finding | Severity | Detail |
|---|---|---|---|
| T-01 | **"Copy Full Context" is the primary operator action — visual hierarchy is wrong** | MAJOR | The spec says "Copy Full Context" is the PRIMARY CTA — "prominent, top right". In the mockup it's at the bottom of a long vertical scroll, after all 4 layer sections. This defeats the purpose. Nimrod's primary use case is: open Teams page → select team → click Copy Full Context → paste into agent session. The button must be above the layer sections, ideally in a fixed action bar. |
| T-02 | **Context layers are static text — not optimized for the copy workflow** | MAJOR | The context shown for L3 (Current State) says: "Active Run: S003-P002-WP001 (agents_os) Gate: GATE_3 / phase_3_1 Status: IN_PROGRESS Assignment: You are the current actor..." — this is truncated in the DOM. The full text is not visible. When Nimrod copies L4 (Task), he needs to see the FULL prompt template, not a truncated preview. If L4 is truncated and he pastes it, the agent gets incomplete context. |
| T-03 | **"CURRENT ACTOR ★" visibility in compact roster is too subtle** | MINOR | In the roster, team_61 shows "current actor" badge (confirmed in DOM). But the visual prominence in the compact list is unclear — the badge is a small label among other small labels. In practice Nimrod needs to spot the current actor immediately on page open. Recommendation: current actor row should have full-width background highlight, not just a text label. |
| T-04 | **Team roster "engine" field is an editable dropdown** | MINOR | The engine field in the detail panel is a `<select>` dropdown (ref_100) — it's editable. This is not per spec (team engine is `definition.yaml`-canonical, read-only in UI unless team_00 explicitly edits). If this is intended as a temporary config override, it needs a note. If not, it should be read-only text. |
| T-05 | **No "children" displayed** | MINOR | The §6.4.2 spec requires children to be shown. The DOM shows "children" label (ref_113) but no values are visible — likely empty array in mock data. For teams that DO have children (e.g. team_100 has team_110, team_111; team_11 has team_21, team_31, team_51, team_61), this should show actual child team IDs. |
| T-06 | **No "Refresh" button visible in L3 — Current State** | MINOR | §6.4.3 specifies a "Refresh" button to re-fetch current state. The DOM shows a Refresh button (ref_133) at the very bottom, below the Copy Full Context button. Should be positioned next to Copy Full Context in the action bar. |
| T-07 | **Missing: "last assignment" for non-current-actor teams** | ADVISORY | For teams that are NOT the current actor, Layer 4 shows "Not current actor." — per spec. But no "last assignment" context is shown. In v2 this was important for Nimrod to know e.g. "Team 61 last worked on GATE_2/phase_2_1, 2026-03-26" — helps diagnose state. Consider adding last event for this team from /api/history to Layer 3. |

---

## Page 3 — Portfolio (`/portfolio.html`)

### What the mockup has (confirmed)
- 4 tabs: Active Runs, Completed Runs, Work Packages, Ideas Pipeline
- Active Runs: table with run_id (8-char), domain_id, wp, status badge, gate/phase, started, actor, actions
- Completed Runs: paginated, run_id, domain, wp, status, started→completed, cycles, View History
- Work Packages: wp_id, label, domain, status badge, linked_run_id, actions (Start Run / View Run)
- Ideas Pipeline: table with all 5 statuses + inline actions + New Idea modal + Edit modal
- New Idea modal: title + description + priority (no notes — GATE-F-01 ✅)
- Edit modal: all fields + decision_notes + status transitions

### Gaps and issues

| # | Finding | Severity | Detail |
|---|---|---|---|
| PO-01 | **domain_id column shows literal "domain_id" text in all rows** | MAJOR | Both Active Runs and Completed Runs tables show the column header value "domain_id" as the cell VALUE — not the actual domain (e.g. "agents_os", "tiktrack"). This means the mock data is displaying the column key, not the column value. Real data should show: `agents_os` or `tiktrack`. Team 31 needs to fix the mock data. |
| PO-02 | **Ideas inline action buttons shown for ALL statuses** | MAJOR | Spec says: inline [Approve] [Reject] [Defer] buttons only for NEW and EVALUATING ideas. APPROVED/DEFERRED/REJECTED ideas should show only [Edit]. In the current mockup, ALL 4 buttons (Edit, Approve, Reject, Defer) appear on ALL rows including APPROVED and REJECTED ideas. This is incorrect and misleading — you'd be offering "Approve" on an already-approved idea. |
| PO-03 | **Work Packages — domain_id column also shows "domain_id" text** | MAJOR | Same issue as PO-01 — the domain_id value in Work Packages rows shows the literal string "domain_id" instead of actual values. |
| PO-04 | **Work Packages — "Start Run" button for PLANNED WP blocked by "Active run exists"** | MINOR | WP S003-P003-WP001 (PLANNED) shows button: "Active run exists for this domain" — this is a correct disabled state reason. However the button should be visually disabled/greyed. If it looks like an active button, Nimrod might click it expecting to start a run. |
| PO-05 | **Completed Runs — only 2 rows (spec asked for 3)** | MINOR | Minor mock data gap. Not blocking. |
| PO-06 | **Active Runs — no PAUSED status row in mock** | MINOR | The spec mentions PAUSED as a valid status in Active Runs (queried as `?status=IN_PROGRESS,CORRECTION,PAUSED`). The mock has IN_PROGRESS and CORRECTION but not PAUSED. For completeness, add one PAUSED row to exercise the badge. |
| PO-07 | **Ideas Pipeline — EVALUATING is shown but badge color unclear** | ADVISORY | Only one EVALUATING idea is present (idea #2, CRITICAL priority). The badge color differentiation between NEW (accent) and EVALUATING (warning/amber) should be clearly distinct. Worth verifying in the visual render. |
| PO-08 | **Ideas — APPROVED idea still shows inline Approve/Reject/Defer** | DUPLICATE | Covered by PO-02 — flagging again as it's the most jarring case visually. |

---

## Page 4 — History (`/history.html`)

### What the mockup has (confirmed)
- All 15 event types in dropdown ✅
- GATE_FAILED_ADVISORY vs GATE_FAILED_BLOCKING badge distinction ✅
- Filters: domain_id, gate_id, event_type, actor_team_id, limit, order, offset ✅
- Event table with occurred_at, event_type, gate/phase, actor, verdict, reason ✅
- Pagination (Prev/Next) ✅
- Total count ✅

### Gaps and issues

| # | Finding | Severity | Detail |
|---|---|---|---|
| H-01 | **Missing run_id filter** | MAJOR | When clicking "View History" from Portfolio → Completed Runs, the intent is to see events for THAT specific run. But the History page has no `run_id` filter field. The link from Portfolio must pass a run_id, and the History page needs a run_id filter to act on it. Currently Portfolio's "View History" button (ref_83, ref_89) has no way to filter by run. Without this, "View History" from Portfolio is broken as a navigation target. |
| H-02 | **gate_id filter only shows GATE_0..GATE_3** | MINOR | The gate_id dropdown (ref_20-25) shows GATE_0, GATE_1, GATE_2, GATE_3 — missing GATE_4 and GATE_5. All 6 gates (GATE_0..GATE_5) must be present. |
| H-03 | **run_id column missing from History table** | ADVISORY | When History is used cross-run (all events, not filtered by run), there is no run_id column to tell which run each event belongs to. For the Portfolio overview use case this matters. Optional: add run_id (truncated) as first column when no run_id filter is active. |

---

## Page 5 — Configuration (`/config.html`)

### What the mockup has (confirmed)
- 3 sub-tabs: Routing rules / Templates / Policies ✅
- Routing rules: read-only note ✅
- Templates: Preview body (expandable), Edit disabled (team_00 only) ✅
- Policies: parsed JSON display, Edit disabled ✅

### Gaps and issues

| # | Finding | Severity | Detail |
|---|---|---|---|
| C-01 | **Routing rules table is empty** | MAJOR | The routing rules tab shows only the "Read-only table — mock data from mandate" label but the actual routing rules table (ref_20) is empty — no rows visible in DOM. The spec (mandate A105) requires at least 3 mock rows. Team 31 needs to populate mock routing rule data. |
| C-02 | **POST/PUT mock row for routing rules missing** | MINOR | Mandate A105 §3 requires a greyed POST/PUT row to illustrate edit capability (team_00 only). Not present in current mockup. |

---

## Cross-Cutting Gaps (Not Page-Specific)

| # | Finding | Severity | Detail |
|---|---|---|---|
| X-01 | **The "Operator Handoff" section is the most important thing in the UI — it needs a spec entry** | MAJOR | The v2 workflow is fundamentally: prompt → agent → Nimrod judges → terminal command. The Operator Handoff section (showing last event + suggested next step + copy CLI command) is the dashboard equivalent of `./pipeline_run.sh --next`. This section MUST be formally specced in §6.1.D before BUILD. Without it, the dashboard does not serve the core loop. The v2 system had a `--next` flag that printed "next action" — this section is that, in visual form. |
| X-02 | **No verdict/reason input for Advance/Fail actions** | MAJOR | Covered in P-02 above but elevated here because it affects ALL gate operations. In v2: `./pipeline_run.sh pass` accepts an optional summary; `./pipeline_run.sh fail "reason"` requires the finding text. In v3: `POST /api/runs/{run_id}/advance` and `POST /api/runs/{run_id}/fail` need request bodies. The UI must provide input fields. Currently: no input fields visible anywhere in the mockup for capturing the judgment reason. This is a functional gap that blocks real operation. |
| X-03 | **CORRECTION state — no display of blocking findings** | MAJOR | When a gate enters CORRECTION state (GATE_FAILED_BLOCKING), Nimrod needs to see WHAT was blocking — the specific findings from the last GATE_FAILED_BLOCKING event. Currently the CORRECTION scenario shows a red banner "CORRECTION_ESCALATED — notify Team 00 (mock banner)" but shows no structured view of the findings that caused the failure. The operator cannot act without knowing what failed. Recommendation: in CORRECTION state, add a "Blocking findings (last failure)" section that displays the reason/findings from the last GATE_FAILED_BLOCKING event in the run log. |
| X-04 | **Prompt copy workflow — two distinct use cases not visually separated** | ADVISORY | There are two distinct "copy prompt" moments: (A) Starting a new agent session — use Teams page "Copy Full Context"; (B) Sending the current gate task — use Pipeline "Copy to clipboard". These are different in nature. The UI currently doesn't guide Nimrod on which to use when. A tooltip or contextual label on each would help: e.g. Pipeline prompt section: "Copy gate task for current actor"; Teams: "Copy full onboarding context for new session". |
| X-05 | **No "copy prompt then what?" completion signal** | ADVISORY | After Nimrod copies the prompt and pastes it to an agent, he goes away and does things. When he comes back, the dashboard needs to reflect the current state. The Operator Handoff section's "suggested next step" is designed to address this. But: in the mockup, the text is static mock. The BUILD version needs this to be dynamic — compute "last ledger event" → determine "what is the next operator action". This is the core intelligence of the dashboard. |

---

## Summary Table

| Category | MAJOR | MINOR | ADVISORY |
|---|---|---|---|
| Pipeline View | 2 (P-01, P-02) | 4 (P-03–P-06) | 0 |
| Teams | 2 (T-01, T-02) | 4 (T-03–T-06) | 1 (T-07) |
| Portfolio | 3 (PO-01, PO-02, PO-03) | 3 (PO-04–PO-06) | 2 (PO-07, PO-08) |
| History | 1 (H-01) | 1 (H-02) | 1 (H-03) |
| Configuration | 1 (C-01) | 1 (C-02) | 0 |
| Cross-cutting | 3 (X-01, X-02, X-03) | 0 | 2 (X-04, X-05) |
| **TOTAL** | **12** | **13** | **6** |

---

## Prioritized Action List for Team 31

### MUST FIX before Team 51 QA (MAJOR findings)

| Priority | Finding | Action |
|---|---|---|
| 1 | X-01 / P-01 | Operator Handoff section needs Team 00 gate decision → then spec entry in §6.1.D |
| 2 | X-02 / P-02 | Add verdict/reason text input next to Advance and Fail buttons |
| 3 | X-03 | In CORRECTION state: add "Blocking findings" section showing last GATE_FAILED_BLOCKING reason |
| 4 | PO-01/03 | Fix mock data: domain_id cells show actual values (agents_os / tiktrack), not the string "domain_id" |
| 5 | PO-02 | Ideas inline actions: Approve/Reject/Defer only on NEW and EVALUATING rows |
| 6 | H-01 | Add run_id filter to History page; Portfolio "View History" must pass run_id as query param |
| 7 | C-01 | Populate routing rules table with 3 mock rows |
| 8 | T-01 | Move "Copy Full Context" to top of right panel (above layer sections) |
| 9 | T-02 | Layer text must not be truncated — full content must be visible/scrollable |

### SHOULD FIX before Team 51 QA (MINOR findings)

| Priority | Finding | Action |
|---|---|---|
| 10 | T-03 | Current actor row: full-width background highlight in roster |
| 11 | H-02 | gate_id filter: add GATE_4 and GATE_5 options |
| 12 | PO-04 | "Active run exists" button should be visually disabled/greyed |
| 13 | P-04 | Remove duplicate run metadata from sidebar (keep only run_id + domain) |
| 14 | T-04 | Engine field: decide read-only vs editable; add note if editable |
| 15 | C-02 | Add greyed POST/PUT row to routing rules |
| 16 | P-05 | Active phase chip highlight within gate map |
| 17 | PO-05/06 | Add 3rd completed run row; add 1 PAUSED row to active runs |
| 18 | T-05 | Show actual children team IDs in roster detail |

---

## Items Requiring Team 00 Decision Before Team 31 Can Proceed

These items are BLOCKED on a Team 00 gate decision — Team 31 cannot implement without a direction:

| # | Question | Options |
|---|---|---|
| **D-01** | **Operator Handoff section (P-01/X-01)** — spec it as §6.1.D or remove? | A) Approve and formalize in spec (recommended); B) Remove from mockup — only Pipeline actions remain |
| **D-02** | **Verdict/reason input (X-02)** — where does the reason go in the advance/fail flow? | A) Inline text input below each button; B) Modal dialog with reason field + confirm; C) Reason optional — advance/fail with no input |
| **D-03** | **History run_id filter (H-01)** — how does "View History" from Portfolio navigate? | A) Add run_id filter field to History page; B) "View History" opens a run-specific sub-view (separate modal or filtered page state) |
| **D-04** | **Teams page engine field (T-04)** — editable or read-only? | A) Read-only (per AD-S8A-05 — definition.yaml canonical); B) Editable for session-level override (mock only) |

---

## What v2 Had That v3 Mockup Does Not Yet Have (And Should)

| v2 Capability | v3 Status | Notes |
|---|---|---|
| `--next` flag: printed "suggested next action" | ✅ Partial (Operator Handoff section exists but unspecced) | Needs formal spec |
| Per-phase mandate display (what each team should do, phase order, parallel/sequential) | ❌ Missing | In v2: generated as `gate_X_mandates.md`. In v3 UI: could be shown as "Current gate mandate" expandable section in Pipeline view |
| Correction cycle: view what was blocking | ❌ Missing | v2 showed blocking findings in generated prompt; v3 UI has no structured display |
| Verdict reason capture | ❌ Missing | v2: `./pipeline_run.sh fail "reason"` CLI arg; v3 UI: no input field |
| Multi-team gate phase execution order | ❌ Not yet in mockup | v2: `phase_routing.json` generated; v3: could show in Configuration → Routing rules |

---

**log_entry | TEAM_100 | MOCKUP_GAP_ANALYSIS | v1.0.0 | SUBMITTED_TO_TEAM_00 | 2026-03-27**
