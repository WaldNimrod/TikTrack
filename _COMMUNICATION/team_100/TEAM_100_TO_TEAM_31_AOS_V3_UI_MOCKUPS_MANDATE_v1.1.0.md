---
id: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v1.1.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 31 (AOS Frontend Implementation)
cc: Team 00 (Principal), Team 11 (AOS Gateway)
date: 2026-03-26
type: ACTIVATION_PROMPT + MANDATE
domain: agents_os
mandate_scope: AOS v3 UI Mockup Implementation (5 pages)
status: APPROVED_FOR_EXECUTION
supersedes: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v1.0.0.md
basis: |
  Stage 8 Module Map + Integration Spec v1.0.1 (base spec)
  Stage 8A UI Spec Amendment v1.0.2 (approved — GATE CLOSED)---

# ╔══════════════════════════════════════════════════════════════════╗
# ║  TEAM 31 — AOS FRONTEND IMPLEMENTATION                         ║
# ║  ACTIVATION PROMPT + MANDATE v1.1.0                             ║
# ║  AOS v3 UI Mockups — 5 Pages: Pipeline, History, Configuration, ║
# ║  Teams, Portfolio                                                ║
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
- Stage 8 Module Map + Integration Spec v1.0.1 (§4 API, §6.1–§6.3 UI — base SSOT)
- **Stage 8A UI Spec Amendment v1.0.2** (`_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md`) — §6.1 corrections, §6.4, §6.5, §4.12–§4.18 — **PRIMARY SSOT for this mandate**

---

# LAYER 3 — CURRENT STATE

## Project Context

AOS v3 (Agents_OS v3) is a greenfield rebuild of the pipeline engine. The specification phase (8 stages + Stage 8A amendment) is **complete and gate-approved**. Your work is the first BUILD artifact.

**Key spec documents:**
1. Stage 8 Module Map + Integration Spec v1.0.1 — base API/UI contracts
2. **Stage 8A UI Spec Amendment v1.0.2** — 5-page UI, 7 new API endpoints, Teams page, Portfolio page

## Existing UI (v1/v2) — Reference

The current AOS UI lives at `agents_os/ui/`. It is a **static HTML + vanilla JS** application served on port 8090.

**Existing pages (reference for patterns — NOT for copy):**
- `PIPELINE_DASHBOARD.html` — main dashboard
- `PIPELINE_MONITOR.html` — live event monitor
- `PIPELINE_ROADMAP.html` — roadmap view
- `PIPELINE_TEAMS.html` — team roster
- `PIPELINE_CONSTITUTION.html` — governance reference

**Layout patterns from existing UI:**
- Sticky header (`agents-header`) at top — logo, title, refresh button
- Sticky nav (`pipeline-nav`) below header — tab links to pages
- Main content area uses CSS Grid (`grid-template-columns: 1fr 300px` for sidebar layouts)
- Domain switching: `localStorage.pipeline_domain` toggles `html.theme-tiktrack`
- Accordions and modals via class toggling (no component framework)

## Design Tokens (from `pipeline-shared.css`)

**AOS dark theme (default):**
```css
:root {
  --bg:           #0d1117;
  --surface:      #161b22;
  --surface2:     #1c2128;
  --border:       #30363d;
  --text:         #c9d1d9;
  --text-muted:   #8b949e;
  --accent:       #58a6ff;
  --success:      #3fb950;
  --warning:      #d29922;
  --danger:       #f85149;
  --current:      #1f6feb;
  --mono:         'SF Mono', 'Fira Code', monospace;
}
```

**TikTrack light theme:**
```css
html.theme-tiktrack {
  --bg:           #ffffff;
  --surface:      #f6f8fa;
  --surface2:     #eaeef2;
  --border:       #d0d7de;
  --text:         #1f2328;
  --text-muted:   #636e7b;
  --accent:       #0969da;
  --success:      #1a7f37;
  --warning:      #9a6700;
  --danger:       #cf222e;
  --current:      #0550ae;
}
```

**Typography:** `system-ui, -apple-system, sans-serif` at 14px base; `var(--mono)` for code/prompt areas.

---

# LAYER 4 — TASK

## Objective

Create **5 HTML mockup pages** for the AOS v3 pipeline dashboard UI. These mockups serve as visual reference and initial implementation for the BUILD phase.

All mockups use **mock data** (hardcoded JSON) — no live API calls.

## Navigation Bar (all 5 pages)

```
[ Pipeline ] [ History ] [ Configuration ] [ Teams ] [ Portfolio ]
```

Every page uses the same `pipeline-nav` component with these 5 links.

## Target Directory

```
agents_os_v3/ui/
├── index.html              # Pipeline View (/)
├── history.html            # History View (/history)
├── config.html             # Configuration (/config)
├── teams.html              # Teams (/teams)
├── portfolio.html          # Portfolio (/portfolio)
├── app.js                  # Shared mock data provider + rendering functions
├── style.css               # Shared styles (based on design tokens above)
```

---

## Page 1 — Pipeline View (`index.html`)

**Data source (mock):** `GET /api/state?domain_id=agents_os`

### Scenario A: IN_PROGRESS state

**Mock response:**
```json
{
  "run_id": "01JQXYZ123456789ABCDEF",
  "work_package_id": "S003-P002-WP001",
  "domain_id": "agents_os",
  "process_variant": "TRACK_FULL",
  "status": "IN_PROGRESS",
  "current_gate_id": "GATE_3",
  "current_phase_id": "phase_3_1",
  "correction_cycle_count": 0,
  "paused_at": null,
  "completed_at": null,
  "started_at": "2026-03-26T08:00:00Z",
  "last_updated": "2026-03-26T14:30:00Z",
  "actor": {
    "team_id": "team_61",
    "label": "Team 61",
    "engine": "cursor"
  },
  "sentinel": {
    "active": false,
    "override_team": null
  },
  "execution_mode": "MANUAL"
}
```

**Display requirements:**
- Run status badge — colored pill: IN_PROGRESS (accent), CORRECTION (warning), PAUSED (text-muted), COMPLETE (success), IDLE (border)
- Current gate + phase names
- Current actor: team_id, label, engine. **Must show null for PAUSED** (AD-S5-02)
- Sentinel indicator: active/inactive + override_team if set (AD-S5-05)
- Correction cycle count display
- Execution mode badge
- `escalated: true` warning banner when latest event = `CORRECTION_ESCALATED`

**Action buttons (rendered as disabled/styled — non-functional in mockup):**
- ADVANCE (POST /advance)
- FAIL (POST /fail)
- APPROVE (POST /approve) — visible only when `is_human_gate=1`
- PAUSE / RESUME (toggle based on status)
- OVERRIDE (POST /override) — `team_00` only indicator

**Layout:** Header + Nav + Main content area with sidebar (300px) for domain selector + run metadata.

### Scenario B: IDLE state

**Mock response:**
```json
{
  "run_id": null,
  "domain_id": "agents_os",
  "status": "IDLE",
  "current_gate_id": null,
  "current_phase_id": null,
  "actor": null,
  "sentinel": null
}
```

**Display:** "No active run" message + **Start Run form** (§6.1.B):

| Field | HTML Type | Required | Values |
|---|---|---|---|
| `work_package_id` | `<input type="text">` | YES | Free text |
| `domain_id` | `<select>` | YES | agents_os, tiktrack |
| `process_variant` | `<select>` | NO | TRACK_FULL, TRACK_FOCUSED, TRACK_FAST |
| `execution_mode` | `<select>` | NO | MANUAL, DASHBOARD, AUTOMATIC |

**Button:** `Start Run →` (primary CTA)

### Scenario C: PAUSED state

Same as IN_PROGRESS but with:
- `status: "PAUSED"`
- `actor: null` (AD-S5-02)
- **`paused_at: "2026-03-26T15:00:00Z"`** — MUST be displayed in Run Status section (§6.1.C)

### Scenario D: COMPLETE state

```json
{
  "run_id": "01JQXYZ123456789ABCDEF",
  "domain_id": "agents_os",
  "status": "COMPLETE",
  "completed_at": "2026-03-26T18:00:00Z",
  "started_at": "2026-03-26T08:00:00Z",
  "correction_cycle_count": 1,
  "actor": null,
  "sentinel": null
}
```

### §6.1.A — Assembled Prompt Section

**CRITICAL (AD-S8A-01):** This section has EQUAL OR GREATER visual prominence than Run Status.

**Visibility:** Only when `status ∈ {IN_PROGRESS, CORRECTION}`. Hidden in PAUSED, IDLE, COMPLETE.
**Data source (mock):** `GET /api/runs/{run_id}/prompt`

**Mock response:**
```json
{
  "run_id": "01JQXYZ123456789ABCDEF",
  "gate_id": "GATE_3",
  "phase_id": "phase_3_1",
  "actor_team_id": "team_61",
  "prompt_text": "# Team 61 — Session Context\n\n## Layer 1 — Identity\n\n**Team:** Team 61\n**Name:** Cloud Agent / DevOps Automation\n**Engine:** Cursor\n**Domain:** agents_os\n**Group:** implementation\n**Profession:** devops_engineer\n\n## Layer 2 — Governance\n\n**Authority:** Agents_OS V2 infrastructure, CI/CD, quality scans\n**Writes to:** agents_os_v2/, _COMMUNICATION/team_61/\n**Iron Rules:**\n1. Run tests before push\n2. No force push to main\n\n## Layer 3 — Current State\n\n**Active Run:** S003-P002-WP001 (agents_os)\n**Gate:** GATE_3 / phase_3_1\n**Status:** IN_PROGRESS\n**Assignment:** You are the CURRENT ACTOR\n\n## Layer 4 — Task\n\n**Gate 3 Requirements:** Implementation per LOD400 spec.\n**Deliverables:** Production code + unit tests.\n**Acceptance Criteria:** All tests pass, no linter errors, code review by Team 100.",
  "token_count": 247,
  "assembled_at": "2026-03-26T14:30:00Z",
  "cache_hit": false
}
```

**Display elements:**
- Prompt text in read-only `<pre>` block (use `var(--mono)` font)
- Token count badge: `247 tokens`
- **`Copy to clipboard`** button (primary action)
- **`Regenerate`** button (secondary)

---

## Page 2 — History View (`history.html`)

**Data source (mock):** `GET /api/history`

**Mock response:**
```json
{
  "total": 8,
  "limit": 50,
  "offset": 0,
  "events": [
    {
      "id": "01JQABC100000000000001",
      "run_id": "01JQXYZ123456789ABCDEF",
      "sequence_no": 8,
      "event_type": "PHASE_PASSED",
      "gate_id": "GATE_3",
      "phase_id": "phase_3_1",
      "domain_id": "agents_os",
      "work_package_id": "S003-P002-WP001",
      "actor": {"team_id": "team_61", "label": "Team 61", "type": "agent"},
      "verdict": "PASS",
      "reason": null,
      "payload_json": null,
      "occurred_at": "2026-03-26T14:30:00Z"
    },
    {
      "id": "01JQABC100000000000002",
      "run_id": "01JQXYZ123456789ABCDEF",
      "sequence_no": 7,
      "event_type": "GATE_FAILED_ADVISORY",
      "gate_id": "GATE_2",
      "phase_id": "phase_2_3",
      "domain_id": "agents_os",
      "work_package_id": "S003-P002-WP001",
      "actor": {"team_id": "team_190", "label": "Team 190", "type": "agent"},
      "verdict": "FAIL",
      "reason": "Minor doc inconsistency — non-blocking",
      "payload_json": {"findings": [{"id": "F-01", "severity": "MINOR"}], "advisory": true},
      "occurred_at": "2026-03-26T13:45:00Z"
    },
    {
      "id": "01JQABC100000000000003",
      "run_id": "01JQXYZ123456789ABCDEF",
      "sequence_no": 6,
      "event_type": "GATE_APPROVED",
      "gate_id": "GATE_2",
      "phase_id": "phase_2_2",
      "domain_id": "agents_os",
      "work_package_id": "S003-P002-WP001",
      "actor": {"team_id": "team_00", "label": "Team 00", "type": "human"},
      "verdict": "PASS",
      "reason": null,
      "payload_json": {"approval_notes": "Spec alignment verified"},
      "occurred_at": "2026-03-26T12:00:00Z"
    },
    {
      "id": "01JQABC100000000000004",
      "run_id": "01JQXYZ123456789ABCDEF",
      "sequence_no": 5,
      "event_type": "CORRECTION_RESUBMITTED",
      "gate_id": "GATE_2",
      "phase_id": "phase_2_1",
      "domain_id": "agents_os",
      "work_package_id": "S003-P002-WP001",
      "actor": {"team_id": "team_100", "label": "Team 100", "type": "agent"},
      "verdict": null,
      "reason": "Fixed F-01/F-02 per CC1",
      "payload_json": {"artifacts": {"spec_version": "v1.0.1"}, "cycle_number": 1},
      "occurred_at": "2026-03-26T11:00:00Z"
    },
    {
      "id": "01JQABC100000000000005",
      "run_id": "01JQXYZ123456789ABCDEF",
      "sequence_no": 4,
      "event_type": "GATE_FAILED_BLOCKING",
      "gate_id": "GATE_2",
      "phase_id": "phase_2_1",
      "domain_id": "agents_os",
      "work_package_id": "S003-P002-WP001",
      "actor": {"team_id": "team_190", "label": "Team 190", "type": "agent"},
      "verdict": "FAIL",
      "reason": "Contract inconsistencies in UC-04/05 and UC-09/10",
      "payload_json": {"findings": [{"id": "F-01", "severity": "MAJOR"}, {"id": "F-02", "severity": "MAJOR"}], "cycle_number": 1},
      "occurred_at": "2026-03-26T10:00:00Z"
    },
    {
      "id": "01JQABC100000000000006",
      "run_id": "01JQXYZ123456789ABCDEF",
      "sequence_no": 3,
      "event_type": "PHASE_PASSED",
      "gate_id": "GATE_1",
      "phase_id": "phase_1_2",
      "domain_id": "agents_os",
      "work_package_id": "S003-P002-WP001",
      "actor": {"team_id": "team_100", "label": "Team 100", "type": "agent"},
      "verdict": "PASS",
      "reason": null,
      "payload_json": null,
      "occurred_at": "2026-03-26T09:30:00Z"
    },
    {
      "id": "01JQABC100000000000007",
      "run_id": "01JQXYZ123456789ABCDEF",
      "sequence_no": 2,
      "event_type": "PHASE_PASSED",
      "gate_id": "GATE_1",
      "phase_id": "phase_1_1",
      "domain_id": "agents_os",
      "work_package_id": "S003-P002-WP001",
      "actor": {"team_id": "team_111", "label": "Team 111", "type": "agent"},
      "verdict": "PASS",
      "reason": null,
      "payload_json": null,
      "occurred_at": "2026-03-26T09:00:00Z"
    },
    {
      "id": "01JQABC100000000000008",
      "run_id": "01JQXYZ123456789ABCDEF",
      "sequence_no": 1,
      "event_type": "RUN_INITIATED",
      "gate_id": "GATE_0",
      "phase_id": null,
      "domain_id": "agents_os",
      "work_package_id": "S003-P002-WP001",
      "actor": {"team_id": "team_00", "label": "Team 00", "type": "human"},
      "verdict": null,
      "reason": "AOS v3 spec program initiated",
      "payload_json": null,
      "occurred_at": "2026-03-26T08:00:00Z"
    }
  ]
}
```

**Display requirements:**
- Event timeline table: occurred_at, event_type (colored badge), gate/phase, actor (team_id + label), verdict, reason
- `GATE_FAILED_ADVISORY` shown with distinct advisory styling (AD-S8-04)
- Filter controls: domain_id, gate_id, event_type (15 types from registry), actor_team_id
- Pagination: limit (default 50, max 200), offset, total count
- Order toggle: asc/desc (default desc — newest first)

**Layout:** Header + Nav + Full-width content with filter bar at top.

---

## Page 3 — Configuration (`config.html`)

**Data source (mock):** Routing rules, templates, and policies.

**Mock data:**

**Routing rules:**
```json
{"routing_rules": [
  {"id": "rr_001", "gate_id": "GATE_0", "phase_id": null, "domain_id": "agents_os", "variant": null, "role_id": "constitutional_validator", "priority": 100},
  {"id": "rr_002", "gate_id": "GATE_2", "phase_id": "phase_2_1", "domain_id": "agents_os", "variant": "TRACK_FULL", "role_id": "domain_architect", "priority": 100},
  {"id": "rr_003", "gate_id": "GATE_3", "phase_id": "phase_3_1", "domain_id": "agents_os", "variant": "TRACK_FULL", "role_id": "devops_engineer", "priority": 100}
]}
```

**Templates:**
```json
{"templates": [
  {"id": "tmpl_001", "gate_id": "GATE_2", "phase_id": "phase_2_1", "domain_id": "agents_os", "name": "Spec Review", "version": 3, "is_active": 1, "body_markdown": "## Review {{team_name}}\n\nReview the following spec artifact..."},
  {"id": "tmpl_002", "gate_id": "GATE_3", "phase_id": "phase_3_1", "domain_id": null, "name": "Implementation Default", "version": 1, "is_active": 1, "body_markdown": "## Build Task\n\nImplement per LOD400 spec..."}
]}
```

**Policies:**
```json
{"policies": [
  {"policy_key": "max_correction_cycles", "scope_type": "GLOBAL", "policy_value_json": "{\"max\": 3}"},
  {"policy_key": "token_budget", "scope_type": "GLOBAL", "policy_value_json": "{\"L1\": 40, \"L2\": 200, \"L3\": 100, \"L4\": 300}"}
]}
```

**Display requirements:**
- 3-tab layout: Routing Rules | Templates | Policies
- Routing rules: table with all columns, read-only
- Templates: list with name, gate/phase/domain scope, version, is_active badge. Body preview on click/expand.
- Policies: key-value table with parsed JSON display
- `team_00` indicator: "Edit" buttons visible but marked as `team_00 only` (disabled in mockup)

**Layout:** Header + Nav + Tabbed content area (full width).

---

## Page 4 — Teams (`teams.html`)

**Data source (mock):** `GET /api/teams` + `GET /api/state`

### Two-Panel Layout

- **Left panel (300px, scrollable):** Team Roster
- **Right panel (main area):** Context Generator for selected team

### Mock Teams Response

```json
{
  "teams": [
    {"team_id": "team_00", "label": "Team 00 — System Designer", "name": "System Designer", "engine": "human", "group": "cross_domain", "profession": "principal", "domain_scope": "all", "parent_team_id": null, "children": ["team_10", "team_11"], "has_active_assignment": false, "is_current_actor": false},
    {"team_id": "team_11", "label": "Team 11 — AOS Gateway", "name": "AOS Gateway", "engine": "cursor", "group": "x1_aos", "profession": "gateway_lead", "domain_scope": "agents_os", "parent_team_id": "team_00", "children": ["team_21", "team_31", "team_51", "team_61"], "has_active_assignment": false, "is_current_actor": false},
    {"team_id": "team_21", "label": "Team 21 — AOS Backend", "name": "AOS Backend Implementation", "engine": "cursor", "group": "x1_aos", "profession": "backend_engineer", "domain_scope": "agents_os", "parent_team_id": "team_11", "children": [], "has_active_assignment": false, "is_current_actor": false},
    {"team_id": "team_31", "label": "Team 31 — AOS Frontend", "name": "AOS Frontend Implementation", "engine": "cursor", "group": "x1_aos", "profession": "frontend_engineer", "domain_scope": "agents_os", "parent_team_id": "team_11", "children": [], "has_active_assignment": false, "is_current_actor": false},
    {"team_id": "team_51", "label": "Team 51 — Agents_OS QA", "name": "Agents_OS QA Agent", "engine": "cursor", "group": "x1_aos", "profession": "qa_engineer", "domain_scope": "agents_os", "parent_team_id": "team_11", "children": [], "has_active_assignment": false, "is_current_actor": false},
    {"team_id": "team_61", "label": "Team 61 — Cloud Agent", "name": "Cloud Agent / DevOps Automation", "engine": "cursor", "group": "x1_aos", "profession": "devops_engineer", "domain_scope": "agents_os", "parent_team_id": "team_11", "children": [], "has_active_assignment": true, "is_current_actor": true},
    {"team_id": "team_100", "label": "Team 100 — Chief Architect", "name": "Chief System Architect", "engine": "claude_code", "group": "cross_domain", "profession": "system_architect", "domain_scope": "all", "parent_team_id": "team_00", "children": [], "has_active_assignment": false, "is_current_actor": false},
    {"team_id": "team_110", "label": "Team 110 — AOS Domain Architect", "name": "AOS Domain Architect (IDE)", "engine": "cursor", "group": "x1_aos", "profession": "domain_architect", "domain_scope": "agents_os", "parent_team_id": "team_100", "children": [], "has_active_assignment": false, "is_current_actor": false},
    {"team_id": "team_190", "label": "Team 190 — Constitutional Validator", "name": "Constitutional Architectural Validator", "engine": "claude_code", "group": "cross_domain", "profession": "validator", "domain_scope": "all", "parent_team_id": null, "children": ["team_191"], "has_active_assignment": false, "is_current_actor": false}
  ]
}
```

### Left Panel — Team Roster Display

Each team entry shows:
- `team_id` (e.g. `team_61`)
- `label` (e.g. `Team 61 — Cloud Agent`)
- `engine` badge: `cursor` / `claude_code` / `codex` / `human`
- `group` visual grouping
- **Current actor:** `CURRENT ACTOR ★` badge (accent color) for team_61. For all others: `Not current actor.` in muted text.
- Active assignment: dot indicator (success color if `has_active_assignment: true`)

**Filter controls (above roster):**
- Group filter: `All` / `AOS` / `TikTrack` / `Cross-domain`
- Toggle: "Show current actor only"

### Right Panel — Context Generator

When team_61 is selected (default — it's the current actor), show:

**Layer 1 — Identity**
```
Team: team_61
Name: Cloud Agent / DevOps Automation
Engine: cursor
Domain: agents_os
Parent: team_11 (AOS Gateway)
Children: none
```

**Layer 2 — Governance**
```
Authority: Agents_OS V2 infrastructure, CI/CD, quality scans
Writes to: agents_os_v2/, _COMMUNICATION/team_61/
Iron Rules:
1. Run tests before push
2. No force push to main
3. Verify 0 test failures before push
```

**Layer 3 — Current State**
```
Active Run: S003-P002-WP001 (agents_os)
Gate: GATE_3 / phase_3_1
Status: IN_PROGRESS
Assignment: You are the CURRENT ACTOR
Recent events: [last 5 from history mock filtered by actor=team_61]
```

**Layer 4 — Task**
```
Gate 3 Requirements: Implementation per LOD400 spec.
Deliverables: Production code + unit tests.
Acceptance Criteria: All tests pass, no linter errors.
```

**Action buttons:**
- `Copy L1` / `Copy L2` / `Copy L3` / `Copy L4` — per-layer clipboard copy
- **`Copy Full Context`** — primary CTA (prominent), copies all 4 layers as single markdown (AD-S8A-02 format)
- `Refresh` — re-fetches current state

**Layout:** Header + Nav + Two-panel (left 300px scrollable + right main area).

---

## Page 5 — Portfolio (`portfolio.html`)

**Layout:** Header + Nav + 4 Tabs

Tab bar: `Active Runs` | `Completed Runs` | `Work Packages` | `Ideas Pipeline`

### Tab 1: Active Runs

**Mock data:**
```json
{
  "total": 2,
  "runs": [
    {
      "run_id": "01JQXYZ123456789ABCDEF",
      "work_package_id": "S003-P002-WP001",
      "domain_id": "agents_os",
      "status": "IN_PROGRESS",
      "process_variant": "TRACK_FULL",
      "current_gate_id": "GATE_3",
      "current_phase_id": "phase_3_1",
      "correction_cycle_count": 0,
      "started_at": "2026-03-26T08:00:00Z",
      "completed_at": null,
      "current_actor_team_id": "team_61"
    },
    {
      "run_id": "01JR0AB987654321ZYXWVU",
      "work_package_id": "S004-P001-WP001",
      "domain_id": "tiktrack",
      "status": "CORRECTION",
      "process_variant": "TRACK_FOCUSED",
      "current_gate_id": "GATE_2",
      "current_phase_id": "phase_2_1",
      "correction_cycle_count": 1,
      "started_at": "2026-03-25T10:00:00Z",
      "completed_at": null,
      "current_actor_team_id": "team_100"
    }
  ]
}
```

**Columns (in this order):**
1. `run_id` — **last 8 chars** (`…ABCDEF` / `…ZYXWVU`), full ULID on hover tooltip
2. `domain_id`
3. `work_package_id`
4. `status` badge: IN_PROGRESS (accent), CORRECTION (warning), PAUSED (text-muted)
5. `current_gate / phase`
6. `correction_cycle_count`
7. `started_at` (relative time)
8. `current_actor` (team label)
9. Actions: `[View]` `[Pause]` `[Override]`

### Tab 2: Completed Runs

**Mock data:**
```json
{
  "total": 2,
  "runs": [
    {
      "run_id": "01JPQRS111111111111111",
      "work_package_id": "S001-P001-WP001",
      "domain_id": "agents_os",
      "status": "COMPLETE",
      "started_at": "2026-03-20T08:00:00Z",
      "completed_at": "2026-03-22T16:00:00Z",
      "correction_cycle_count": 2
    },
    {
      "run_id": "01JPTUV222222222222222",
      "work_package_id": "S002-P001-WP001",
      "domain_id": "tiktrack",
      "status": "COMPLETE",
      "started_at": "2026-03-18T09:00:00Z",
      "completed_at": "2026-03-19T14:00:00Z",
      "correction_cycle_count": 0
    }
  ]
}
```

**Columns (in this order):**
1. `run_id` — **last 8 chars**, full ULID on hover tooltip
2. `domain_id`
3. `work_package_id`
4. `status` badge: COMPLETE (success)
5. `started_at → completed_at` (date range)
6. `correction_cycle_count`
7. Actions: `[View History]`

**Pagination:** limit/offset controls.

### Tab 3: Work Packages

**Mock data:**
```json
{
  "work_packages": [
    {"wp_id": "S003-P002-WP001", "label": "AOS v3 Module Map Implementation", "domain_id": "agents_os", "status": "ACTIVE", "linked_run_id": "01JQXYZ123456789ABCDEF"},
    {"wp_id": "S004-P001-WP001", "label": "TikTrack Data Import Redesign", "domain_id": "tiktrack", "status": "ACTIVE", "linked_run_id": "01JR0AB987654321ZYXWVU"},
    {"wp_id": "S003-P003-WP001", "label": "AOS v3 UI BUILD", "domain_id": "agents_os", "status": "PLANNED", "linked_run_id": null},
    {"wp_id": "S002-P002-WP001", "label": "TikTrack Auth Migration", "domain_id": "tiktrack", "status": "COMPLETE", "linked_run_id": null}
  ]
}
```

**Columns:** wp_id, label, domain_id, status badge, linked_run_id (link if present), Actions: `[Start Run]` (only if PLANNED + no active run for domain)

### Tab 4: Ideas Pipeline

**Mock data:**
```json
{
  "total": 4,
  "ideas": [
    {"idea_id": "01JR1AA000000000000001", "title": "Automated regression test suite for AOS v3", "status": "APPROVED", "priority": "HIGH", "submitted_by": "team_100", "submitted_at": "2026-03-24T10:00:00Z", "decision_notes": "Approved for S005 program", "target_program_id": "S005"},
    {"idea_id": "01JR1AA000000000000002", "title": "MCP integration for live pipeline state", "status": "EVALUATING", "priority": "CRITICAL", "submitted_by": "team_61", "submitted_at": "2026-03-25T14:00:00Z", "decision_notes": null, "target_program_id": null},
    {"idea_id": "01JR1AA000000000000003", "title": "Dark mode toggle in pipeline nav", "status": "NEW", "priority": "LOW", "submitted_by": "team_31", "submitted_at": "2026-03-26T09:00:00Z", "decision_notes": null, "target_program_id": null},
    {"idea_id": "01JR1AA000000000000004", "title": "Pipeline health dashboard widget", "status": "DEFERRED", "priority": "MEDIUM", "submitted_by": "team_51", "submitted_at": "2026-03-22T11:00:00Z", "decision_notes": "Deferred to post-BUILD", "target_program_id": null}
  ]
}
```

**Columns:** idea_id (truncated ULID), title, status badge, priority badge, submitted_by (team label), submitted_at (relative time), target_program_id, Actions: `[Edit]` `[Approve]` `[Reject]` `[Defer]`

**`[+ New Idea]` button** → opens modal with 3 fields ONLY:
- `title` (required)
- `description` (textarea, optional)
- `priority` (select: LOW/MEDIUM/HIGH/CRITICAL, default MEDIUM)
- **NO `notes` field** — `decision_notes` belongs to Edit modal only (approver scope)
- Button: `Submit Idea`

**Edit Idea modal:**
- Same 3 fields as New Idea
- Current status displayed
- Status transition buttons: `[Approve]` `[Reject]` `[Defer]` `[Set Evaluating]`
- `decision_notes` field (textarea)
- `target_program_id` field (text, visible only when APPROVED)
- Button: `Save Changes`

---

## Acceptance Criteria

1. All **5** pages render correctly in Chrome/Safari
2. Both themes work: AOS dark (default) + TikTrack light (`html.theme-tiktrack`)
3. Layout matches existing v1/v2 patterns: sticky header + nav + content
4. All mock data is displayed correctly per the schemas above
5. No inline `<style>` or `<script>` blocks
6. Classic `<script src>` only — no ES modules
7. CSS uses the design tokens from `pipeline-shared.css`
8. Navigation bar shows all 5 pages on every page
9. Status badges use semantic colors (`--success`, `--warning`, `--danger`, `--accent`)
10. Pipeline View: Assembled Prompt section visible in IN_PROGRESS with equal/greater visual weight than Run Status (AD-S8A-01)
11. Pipeline View: Start Run form displayed in IDLE state with 4 fields + `Start Run →` button
12. Pipeline View: `paused_at` displayed in PAUSED state
13. Teams page: Two-panel layout, 9 teams in roster, context generator with Copy L1/L2/L3/L4 + `Copy Full Context` buttons
14. Teams page: Current actor (team_61) shows `CURRENT ACTOR ★` badge
15. Portfolio: `run_id` as FIRST column in Active Runs and Completed Runs (last 8 chars + hover)
16. Portfolio: New Idea modal has exactly 3 fields (title, description, priority) — NO `notes` field
17. Portfolio: Edit Idea modal has `decision_notes` + `target_program_id` + status transition buttons

## Deliverables

1. `agents_os_v3/ui/index.html` — Pipeline View (4 scenarios)
2. `agents_os_v3/ui/history.html` — History View
3. `agents_os_v3/ui/config.html` — Configuration
4. `agents_os_v3/ui/teams.html` — Teams (two-panel)
5. `agents_os_v3/ui/portfolio.html` — Portfolio (4 tabs + 2 modals)
6. `agents_os_v3/ui/app.js` — Mock data provider + shared rendering functions
7. `agents_os_v3/ui/style.css` — Shared styles
8. Evidence report in `_COMMUNICATION/team_31/`

## Submission

After completion:
1. Verify all 5 pages load in browser (preflight test)
2. Write evidence report to `_COMMUNICATION/team_31/TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v1.1.0.md`
3. Notify Team 100 for review
4. Route to Team 51 for QA

---

**log_entry | TEAM_100 | TEAM_31_MANDATE_ISSUED | AOS_V3_UI_MOCKUPS | v1.0.0 | 2026-03-26**
**log_entry | TEAM_100 | TEAM_31_MANDATE_UPDATED | AOS_V3_UI_MOCKUPS | v1.1.0 | 5_PAGES | SPEC_AMENDMENT_v1.0.2 | 2026-03-26**
