---
id: TEAM_00_TO_TEAM_31_MOCKUP_MANDATE_v1.0.0
historical_record: true
from: Team 00 (System Designer)
to: Team 31 (AOS Frontend)
cc: Team 100 (Chief System Architect), Team 51 (AOS QA)
date: 2026-03-27
type: MANDATE
priority: BLOCKING — no BUILD starts without mockup approval
subject: AOS v3 UI Mockup — Full Rebuild / Expansion per Spec Amendment
blocked_on: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.0.md (Team 100 deliverable)---

# Mandate: AOS v3 UI Mockup — Full 5-Page Rebuild

## Authority

Team 00 directive. BUILD is blocked until this mockup passes Team 51 QA review and Team 00 personal sign-off.

## Prerequisite

**DO NOT START** until `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.0.md` is delivered and approved. The spec amendment is the authoritative source for all label names, field names, button text, and behavior. Every pixel in this mockup must be traceable to a spec section.

When spec is available, read it in full before writing a single line of HTML.

Also read (before starting):
- Stage 8 §6 (existing UI spec): `TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md`
- Stage 8 §4 (API contracts): same file
- Stage 7 §1 (15 event types): `TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md`

---

## Deliverable

**Location:** `agents_os_v3/ui/` — expand or replace existing mockup files
**Server:** `http://127.0.0.1:8766/agents_os_v3/ui/`
**Format:** Static HTML + CSS + vanilla JS only (no frameworks, no bundler — same as existing mockup)
**Mock data:** All data is hardcoded/simulated — no real API calls

---

## Pages Required

| Page | URL | Status |
|---|---|---|
| Pipeline View | `/index.html` | AMEND existing |
| History View | `/history.html` | VERIFY existing (likely complete) |
| Configuration | `/config.html` | VERIFY existing (likely complete) |
| **Teams** | `/teams.html` | **NEW** |
| **Portfolio** | `/portfolio.html` | **NEW** |

---

## §1 — Pipeline View (`/index.html`) — Amendments

### 1.1 Navigation Bar

Update navigation to 5 tabs:
```
[ Pipeline ] [ History ] [ Configuration ] [ Teams ] [ Portfolio ]
```
Active tab highlighted. Same nav bar on all 5 pages.

### 1.2 ASSEMBLED PROMPT Section — NEW

**Visibility:** Only when scenario = IN_PROGRESS or CORRECTION (NOT PAUSED, IDLE, COMPLETE)
**Position:** Between SENTINEL section and ACTIONS section
**Section header:** `ASSEMBLED PROMPT`

**Contents:**
```
ASSEMBLED PROMPT                            [ Regenerate ]
─────────────────────────────────────────────────────────
[pre/textarea block — full prompt text, scrollable, max 300px height]
[L1 — System context for agents_os domain...]
[L2 — Team 61 assignment context: GATE_3 / phase_3_1...]
[L3 — Domain policy context...]
[L4 — Template body: "You are Team 61 (DevOps Engineer)...]

token count: 342 tokens                  [ Copy to clipboard ]
```

**Mock prompt text:** Use realistic multi-line text that reflects a real gate prompt. Include clearly visible L1/L2/L3/L4 layer markers in the mock text.

**"Copy to clipboard" button:** Primary style (blue, right-aligned). Label: `Copy to clipboard`.
**"Regenerate" button:** Secondary style (outline, top-right of section). Label: `Regenerate`.
**Token count:** Left-aligned below prompt text. Format: `token count: NNN tokens`.

**When CORRECTION:** Show same section. Mock prompt text reflects correction context.

### 1.3 IDLE State — Start Run Form

When scenario = IDLE, replace the "No active run" text with a proper form:

```
No active run for this domain.
─────────────────────────────────────────────────────
START NEW RUN

Work Package ID    [ S003-P002-WP001 _____________ ]
Domain             [ agents_os              ▼     ]
Process Variant    [ TRACK_FOCUSED          ▼     ]  (default: domain default)
Execution Mode     [ MANUAL                 ▼     ]

                                   [ Start Run → ]
```

**Labels (exact):**
- `Work Package ID` — text input, placeholder: work package identifier
- `Domain` — select with options from mock: `agents_os`, `tiktrack`
- `Process Variant` — select: `TRACK_FULL`, `TRACK_FOCUSED`, `TRACK_FAST`
- `Execution Mode` — select: `MANUAL`, `DASHBOARD`, `AUTOMATIC`
- Button: `Start Run →` — primary blue button

**Note:** The Start Run action is mock-disabled (same as other actions) but the form must be fully rendered.

### 1.4 PAUSED State — Add paused_at

In the RUN STATUS section, when scenario = PAUSED, add `paused_at` row:
```
paused_at                              2026-03-26T14:05:00Z
```
Position: after `last_updated` row.

### 1.5 Scenario Selector — Add COMPLETE State

Add a new scenario option: `COMPLETE — run finished`
When selected:
- Status badge: `COMPLETE` (green)
- `completed_at`: ISO-8601 timestamp
- `current_gate_id`: last gate
- `current_phase_id`: last phase
- CURRENT ACTOR section: shows final actor
- ASSEMBLED PROMPT section: HIDDEN (no prompt for completed run)
- ACTIONS section: ADVANCE, FAIL, PAUSE, RESUME all disabled/hidden; OVERRIDE still visible

---

## §2 — History View (`/history.html`) — Verify

Review existing mockup against spec. Confirm:
- [ ] All 15 event types in EVENT_TYPE filter dropdown (list them all)
- [ ] `GATE_FAILED_ADVISORY` row has visually distinct (muted/orange) badge, NOT treated as an error
- [ ] Navigation bar updated to 5 tabs
- [ ] Dark/Light theme toggle present
- [ ] Pagination shows total count, Prev/Next controls

If all confirmed, no changes needed beyond navigation bar update.

---

## §3 — Configuration (`/config.html`) — Verify + Minor Updates

Review existing mockup. Confirm:
- [ ] 3 sub-tabs: Routing rules / Templates / Policies
- [ ] Routing rules: READ-ONLY note visible
- [ ] Templates: Preview body expandable, Edit disabled label `(team_00 only)`
- [ ] Policies: JSON parsed display, Edit disabled label `(team_00 only)`
- [ ] Navigation bar updated to 5 tabs

Add one missing item: In the **Routing rules tab**, add a **POST / PUT row mock** to illustrate what an edit would look like (greyed out, labelled "team_00 only") — because the spec defines admin CRUD for routing rules.

---

## §4 — Teams Page (`/teams.html`) — NEW

### 4.1 Page Structure

```
Agents OS v3 — Teams   GET /api/teams (mock)              [Dark] [Light]
[ Pipeline ] [ History ] [ Configuration ] [ Teams ] [ Portfolio ]

┌─────────────────────┬─────────────────────────────────────────────────┐
│  TEAM ROSTER        │  CONTEXT GENERATOR                               │
│  ─────────────────  │  ─────────────────────────────────────────────── │
│  Group filter:      │  Team 21 — AOS Backend                          │
│  [All ▼]            │  engine: cursor  ·  group: x1_aos               │
│  [☐ current only]   │                                                  │
│                     │  [ Copy Full Context ]  (primary, top right)     │
│  ● team_00 (human)  │                                                  │
│    Team 00 (human)  │  ▼ Layer 1 — Identity          [ Copy L1 ]      │
│    CURRENT ACTOR ★  │  ─────────────────────────────────────────────── │
│                     │  team_id: team_21                                │
│  ● team_100         │  label: AOS Backend Implementation               │
│    Chief Architect  │  engine: cursor                                  │
│    cursor           │  group: x1_aos                                   │
│                     │  parent: team_11                                 │
│  ● team_21 ←selected│  children: none                                  │
│    AOS Backend      │                                                  │
│    cursor           │  ▼ Layer 2 — Governance        [ Copy L2 ]      │
│                     │  ─────────────────────────────────────────────── │
│  ● team_31          │  authority: implementation                        │
│    AOS Frontend     │  writes_to: agents_os_v3/modules/                │
│    cursor           │  governed_by: TEAM_00_CONSTITUTION_v1.0.0.md    │
│                     │  iron_rules: [list]                              │
│  ● team_51          │                                                  │
│    AOS QA           │  ▼ Layer 3 — Current State     [ Copy L3 ]      │
│    cursor           │  ─────────────────────────────────────────────── │
│                     │  active_run: S003-P002-WP001                     │
│  ● team_61          │  domain: agents_os                               │
│    AOS DevOps       │  gate: GATE_3 / phase_3_1                       │
│    cursor           │  status: IN_PROGRESS                             │
│                     │  recent events: [last 3 events]                  │
│  ● team_111         │                                                  │
│    AOS Domain Arch  │  ▼ Layer 4 — Task              [ Copy L4 ]      │
│    cursor           │  ─────────────────────────────────────────────── │
│                     │  NOT CURRENT ACTOR                               │
│                     │  (prompt only available for current actor)       │
└─────────────────────┴─────────────────────────────────────────────────┘
```

### 4.2 Team Roster — Exact Field Specs

**Team card (each item in roster):**
```
● team_21                   [cursor badge]
  AOS Backend Implementation
  [active assignment dot if assigned]
```

**Indicators:**
- `CURRENT ACTOR ★` — blue label, shown only next to current actor team
- Engine badge: `cursor` (grey), `claude_code` (orange), `openai` (green), `human` (blue)
- Active assignment: filled dot (●) = has assignment, empty dot (○) = no assignment

**Group filter dropdown:** All / AOS (x1) / TikTrack (x0) / Cross-domain
**"Current actor only" checkbox:** When checked, roster shows only the current actor team

### 4.3 Context Generator — Mock Scenarios

**Scenario A — Selected team is current actor:**
Layer 4 shows:
```
▼ Layer 4 — Task                [ Copy L4 ]
──────────────────────────────────────────────────
CURRENT ACTOR — prompt available

Gate: GATE_3 / phase_3_1
Prompt template: "Implementation Default"

[prompt text preview — first 200 chars truncated]
                                    [ View full prompt ]
Acceptance criteria:
  - All Layer 2 unit tests PASS
  - AD-S7-01 atomic TX verified
```

**Scenario B — Selected team is NOT current actor:**
Layer 4 shows:
```
▼ Layer 4 — Task                [ Copy L4 ]
──────────────────────────────────────────────────
Not current actor.
No active assignment for this gate.
Last assignment: GATE_2 / phase_2_1 (2026-03-26)
```

**Copy Full Context button behavior (mock):**
Shows a toast/notification: `Context copied to clipboard (mock — 4 layers, ~1200 tokens)`

### 4.4 Team Roster — Mock Data

Include mock entries for these teams (AOS domain):

| team_id | label | engine | group | is_current_actor |
|---|---|---|---|---|
| team_00 | Team 00 — System Designer | human | cross_domain | NO |
| team_100 | Chief System Architect | claude_code | cross_domain | NO |
| team_11 | AOS Gateway / Execution Lead | cursor | x1_aos | NO |
| team_21 | AOS Backend Implementation | cursor | x1_aos | YES (default selected scenario) |
| team_31 | AOS Frontend Implementation | cursor | x1_aos | NO |
| team_51 | AOS QA | cursor | x1_aos | NO |
| team_61 | AOS DevOps | cursor | x1_aos | NO |
| team_111 | AOS Domain Architect | cursor | x1_aos | NO |
| team_190 | Constitutional Validator | openai | cross_domain | NO |

---

## §5 — Portfolio Page (`/portfolio.html`) — NEW

### 5.1 Page Structure

```
Agents OS v3 — Portfolio   (mock)                         [Dark] [Light]
[ Pipeline ] [ History ] [ Configuration ] [ Teams ] [ Portfolio ]

[ Active Runs ] [ Completed Runs ] [ Work Packages ] [ Ideas Pipeline ]
```

### 5.2 Tab 1 — Active Runs

**Table columns (exact labels):**
`RUN_ID` | `DOMAIN` | `WORK_PACKAGE` | `STATUS` | `GATE / PHASE` | `CORRECTION CYCLES` | `STARTED` | `CURRENT ACTOR` | `ACTIONS`

**Mock rows (2–3 rows):**

| run_id | domain | wp | status | gate/phase | cycles | started | actor | actions |
|---|---|---|---|---|---|---|---|---|
| 01JQX...BCDE | agents_os | S003-P002-WP001 | `IN_PROGRESS` | GATE_3/phase_3_1 | 0 | 2026-03-26 | team_21 | [View] [Pause] |
| 01JRY...FGHI | tiktrack | S002-P003-WP002 | `CORRECTION` | GATE_2/phase_2_1 | 2 | 2026-03-20 | team_100 | [View] [Override] |

**Status badges:** same color coding as Pipeline View (IN_PROGRESS = blue, CORRECTION = orange, PAUSED = grey)
**[View] button:** label exactly `View`, secondary style
**[Pause] button:** label exactly `Pause`, secondary style
**[Override] button:** label exactly `Override (team_00)`, secondary style

### 5.3 Tab 2 — Completed Runs

**Table columns:**
`RUN_ID` | `DOMAIN` | `WORK_PACKAGE` | `STATUS` | `STARTED` | `COMPLETED` | `CORRECTION CYCLES` | `ACTIONS`

**Mock rows (3 rows):**

| run_id | domain | wp | status | started | completed | cycles | actions |
|---|---|---|---|---|---|---|---|
| 01JPA...0001 | agents_os | S002-P005-WP001 | `COMPLETE` | 2026-03-15 | 2026-03-26 | 2 | [History] |
| 01JPB...0002 | tiktrack | S002-P003-WP001 | `COMPLETE` | 2026-03-01 | 2026-03-20 | 1 | [History] |
| 01JPC...0003 | agents_os | S002-P004-WP001 | `COMPLETE` | 2026-02-20 | 2026-03-10 | 0 | [History] |

**Pagination:** Show `Total: 12 completed runs` with Prev / Next controls.
**[History] button:** navigates to History View filtered by run_id (mock note in tooltip)

### 5.4 Tab 3 — Work Packages

**Table columns:**
`WP_ID` | `LABEL` | `DOMAIN` | `STATUS` | `LINKED RUN` | `ACTIONS`

**Status values:** `PLANNED` (grey) | `ACTIVE` (blue) | `COMPLETE` (green) | `CANCELLED` (red)

**Mock rows (5–6 rows including planned, active, complete):**

| wp_id | label | domain | status | linked_run | actions |
|---|---|---|---|---|---|
| S003-P002-WP001 | AOS v3 BUILD Phase | agents_os | `ACTIVE` | 01JQX...BCDE | [View Run] |
| S003-P003-WP001 | System Settings Page | tiktrack | `PLANNED` | — | [Start Run] |
| S003-P004-WP001 | AOS v3 Spec Development | agents_os | `COMPLETE` | 01JPA...0001 | [History] |
| S002-P003-WP002 | D22/D33/D34/D35 Features | tiktrack | `COMPLETE` | 01JPB...0002 | [History] |
| S003-P005-WP001 | TikTrack Mobile MVP | tiktrack | `PLANNED` | — | [Start Run] |

**[Start Run] button:** secondary style, only visible for PLANNED WPs — clicking navigates to Pipeline View IDLE state with wp_id pre-filled in form

### 5.5 Tab 4 — Ideas Pipeline

**Header row:**
```
IDEAS PIPELINE                                    [ + New Idea ]
```

**Table columns:**
`IDEA_ID` | `TITLE` | `STATUS` | `PRIORITY` | `SUBMITTED BY` | `SUBMITTED` | `ACTIONS`

**Status badges:**
- `NEW` — blue
- `EVALUATING` — yellow/amber
- `APPROVED` — green
- `DEFERRED` — grey
- `REJECTED` — red

**Priority badges:**
- `CRITICAL` — red
- `HIGH` — orange
- `MEDIUM` — yellow
- `LOW` — grey

**Mock rows (5–6 rows, diverse statuses and priorities):**

| idea_id | title | status | priority | submitted_by | submitted | actions |
|---|---|---|---|---|---|---|
| IDEA-001 | Agent memory persistence across sessions | `EVALUATING` | `HIGH` | team_00 | 2026-03-25 | [Edit] [Approve] [Defer] [Reject] |
| IDEA-002 | Multi-domain parallel pipeline runs | `NEW` | `MEDIUM` | team_100 | 2026-03-26 | [Edit] [Approve] [Defer] [Reject] |
| IDEA-003 | OAuth/JWT auth for v3.1 | `APPROVED` | `HIGH` | team_00 | 2026-03-20 | [Edit] |
| IDEA-004 | Automatic git commit on gate pass | `DEFERRED` | `LOW` | team_190 | 2026-03-15 | [Edit] |
| IDEA-005 | Token budget hard limit (AD-S6-07 amendment) | `REJECTED` | `MEDIUM` | team_100 | 2026-03-10 | [Edit] |

**[+ New Idea] button:** primary style, top right of tab. Clicking opens a modal:
```
╔═══ New Idea ══════════════════════════════════════╗
║                                                   ║
║ Title*        [_________________________________] ║
║                                                   ║
║ Description   [_________________________________] ║
║               [_________________________________] ║
║               [_________________________________] ║
║                                                   ║
║ Priority      [ MEDIUM ▼ ]                        ║
║                                                   ║
║               [ Cancel ]  [ Submit Idea ]         ║
╚═══════════════════════════════════════════════════╝
```

**[Edit] button:** opens edit modal with all fields + status transition buttons:
```
[ Mark Approved ] [ Mark Deferred ] [ Mark Rejected ]
```
These buttons are mock-visible but show a toast "Status updated (mock)"

**[Approve] / [Defer] / [Reject] buttons:** inline quick-action buttons, only shown for NEW and EVALUATING ideas. Show toast on click (mock).

---

## §6 — Global Requirements

### 6.1 Navigation

All 5 pages share identical navigation bar:
```
Agents OS v3 — [Page Name]   [subtitle/API call]              [Dark] [Light]
[ Pipeline ] [ History ] [ Configuration ] [ Teams ] [ Portfolio ]
```
Active page tab: bold + underline + primary color
Inactive tabs: normal weight, grey

### 6.2 Dark / Light Theme

All pages must support Dark and Light themes via the existing toggle. Verify all new pages switch correctly.

### 6.3 Mock State Label

All mock pages display a clear indicator that data is mocked:
- Pipeline View: existing "MOCK STATE PRESET" panel — keep
- History View: existing "(mock)" in header subtitle — keep
- New pages: add `(mock)` in the page subtitle next to the API call description

### 6.4 Labels — Exact Text

No variations or paraphrasing. Use these exact labels throughout:

| Concept | Exact Label |
|---|---|
| Run start button | `Start Run →` |
| Prompt copy | `Copy to clipboard` |
| Prompt regenerate | `Regenerate` |
| Teams full copy | `Copy Full Context` |
| Teams layer copy | `Copy L1` / `Copy L2` / `Copy L3` / `Copy L4` |
| Portfolio start | `Start Run` |
| Portfolio view run | `View` |
| Portfolio history | `View History` |
| Portfolio ideas new | `+ New Idea` |
| Ideas approve quick | `Approve` |
| Ideas defer quick | `Defer` |
| Ideas reject quick | `Reject` |
| Ideas modal submit | `Submit Idea` |
| Ideas modal cancel | `Cancel` |
| Current actor indicator | `CURRENT ACTOR ★` |
| Not current actor | `Not current actor.` |

### 6.5 Iron Rules for Mockup

1. **Zero business logic** in app.js — UI renders mock state only
2. **All API calls labelled** — show the mock API call in the page subtitle (e.g., `GET /api/teams (mock)`)
3. **All edit actions** that are team_00-only must show `(team_00 only)` label
4. **Disabled actions** show as greyed buttons with `(mock — disabled)` tooltip/label
5. **No navigation** from mock to real endpoints — all links are mock-internal only

---

## §7 — Scenario Coverage Requirement

Each page must support scenario switching (same pattern as existing Pipeline View):

### Pipeline View scenarios (update existing):
- IN_PROGRESS (GATE_3) — with prompt section visible
- IDLE — with Start Run form
- PAUSED (actor null) — with paused_at
- CORRECTION + escalated banner — with prompt section visible
- Human gate (APPROVE visible) — with prompt section
- Sentinel active + override — with prompt section
- **NEW: COMPLETE — run finished** — prompt section hidden

### History View scenarios (verify coverage):
- Full event chain (all 8+ events)
- Filtered by GATE_FAILED_ADVISORY only
- Filtered by actor_team_id
- Empty results (no events match filter)

### Teams page scenarios:
- Current actor selected (Layer 4 shows prompt + task)
- Non-current actor selected (Layer 4 shows "not current actor")
- Group filter: AOS only
- "Current actor only" toggle active

### Portfolio scenarios:
- Active Runs tab — 2 active runs
- Completed Runs tab — paginated, 3 rows
- Work Packages tab — mix of PLANNED/ACTIVE/COMPLETE
- Ideas Pipeline tab — mix of all 5 statuses
- Ideas Pipeline tab — new idea modal open
- Ideas Pipeline tab — edit idea modal open

---

## Submission

When complete:
1. All 5 pages live at `http://127.0.0.1:8766/agents_os_v3/ui/`
2. Notify Team 51 (QA mandate) for systematic review
3. Submit completion report to Team 00

Team 00 will not review the mockup until Team 51 has issued a QA PASS verdict.

---

**log_entry | TEAM_00 | MOCKUP_MANDATE | ISSUED | team_31 | 2026-03-27**
