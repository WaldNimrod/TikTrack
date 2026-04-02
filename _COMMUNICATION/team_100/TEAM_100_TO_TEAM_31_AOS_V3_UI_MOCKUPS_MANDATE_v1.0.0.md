---
id: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 31 (AOS Frontend Implementation)
cc: Team 00 (Principal), Team 11 (AOS Gateway)
date: 2026-03-26
type: ACTIVATION_PROMPT + MANDATE
domain: agents_os
mandate_scope: AOS v3 UI Mockup Implementation (3 pages)
status: APPROVED_FOR_EXECUTION---

# ╔══════════════════════════════════════════════════════════════╗
# ║  TEAM 31 — AOS FRONTEND IMPLEMENTATION                     ║
# ║  ACTIVATION PROMPT + MANDATE                                ║
# ║  AOS v3 UI Mockups — Pipeline View, History, Configuration  ║
# ╚══════════════════════════════════════════════════════════════╝

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
4. **Preflight URL test mandatory** before QA submission — verify all 3 pages load correctly in browser.
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
- Stage 8 Module Map + Integration Spec v1.0.1 (§6 UI Pages Contract — SSOT for this task)

---

# LAYER 3 — CURRENT STATE

## Project Context

AOS v3 (Agents_OS v3) is a greenfield rebuild of the pipeline engine. The specification phase (8 stages) is **complete**. Stage 8 (Module Map + Integration Spec) has passed validation and is pending gate approval. Your work is the first BUILD artifact.

**7 SSOT specification documents** define the complete architecture:
1. Entity Dictionary v2.0.2 — data models
2. State Machine Spec v1.0.2 — transitions T01–T12
3. Use Case Catalog v1.0.3 — UC-01 through UC-14
4. DDL Spec v1.0.1 — database schema
5. Routing Spec v1.0.1 — actor resolution
6. Prompt Architecture Spec v1.0.2 — 4-layer prompt assembly
7. Event & Observability Spec v1.0.2 — event ledger, audit

**Stage 8 Module Map + Integration Spec v1.0.1** (`_COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md`) is the **primary source** for your work. Specifically §4 (API Endpoint Contracts) and §6 (UI Pages Contract).

## Existing UI (v1/v2) — Reference

The current AOS UI lives at `agents_os/ui/`. It is a **static HTML + vanilla JS** application served by `agents_os_v2/server/aos_ui_server.py` on port 8090.

**Existing pages (reference for patterns — NOT for copy):**
- `PIPELINE_DASHBOARD.html` — main dashboard
- `PIPELINE_MONITOR.html` — live event monitor
- `PIPELINE_ROADMAP.html` — roadmap view
- `PIPELINE_TEAMS.html` — team roster
- `PIPELINE_CONSTITUTION.html` — governance reference

**Existing CSS structure:**
- `css/pipeline-shared.css` — global tokens, header, nav, themes
- `css/pipeline-dashboard.css` — dashboard-specific layout
- `css/pipeline-monitor.css` — monitor layout
- etc.

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

Create **3 HTML mockup pages** for the AOS v3 pipeline dashboard UI, based on the Stage 8 §6 UI Pages Contract and §4 API Endpoint Contracts. These mockups will serve as visual reference and initial implementation for the BUILD phase.

The mockups must use **mock data** (hardcoded JSON) that simulates realistic API responses. No live API calls — all data is embedded in JS.

## Target Directory

```
agents_os_v3/ui/
├── index.html              # Pipeline View (/)
├── history.html            # History View (/history)
├── config.html             # Configuration (/config)
├── app.js                  # Shared API client (mock data provider)
├── style.css               # Shared styles (based on design tokens above)
```

## Page 1 — Pipeline View (`index.html`)

**Data source (mock):** `GET /api/state?domain_id=agents_os`

**Mock response to embed:**
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

**Action buttons (non-functional in mockup — rendered as disabled or styled):**
- ADVANCE (POST /advance)
- FAIL (POST /fail) 
- APPROVE (POST /approve) — visible only when `is_human_gate=1`
- PAUSE / RESUME (toggle based on status)
- OVERRIDE (POST /override) — `team_00` only indicator

**Layout:** Header + Nav + Main content area with sidebar (300px) for domain selector + run metadata.

**Also provide a second mock state for "IDLE":**
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
Render this as an empty state with "No active run" message.

## Page 2 — History View (`history.html`)

**Data source (mock):** `GET /api/history`

**Mock response to embed:**
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
- `GATE_FAILED_ADVISORY` shown as standard event with distinct advisory styling (AD-S8-04)
- Filter controls: domain_id dropdown, gate_id dropdown, event_type dropdown (15 types from registry), actor_team_id
- Pagination controls: limit (default 50, max 200), offset, total count display
- Order toggle: asc/desc (default desc — newest first)

**Layout:** Header + Nav + Full-width content with filter bar at top.

## Page 3 — Configuration (`config.html`)

**Data source (mock):** Routing rules, templates, and policies.

**Mock data sections:**

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
- Routing rules: table with all columns, read-only display
- Templates: list with name, gate/phase/domain scope, version, is_active badge. Body preview on click/expand.
- Policies: key-value table with parsed JSON display
- `team_00` indicator: "Edit" buttons visible but marked as `team_00 only` (disabled in mockup)

**Layout:** Header + Nav + Tabbed content area (full width).

## Acceptance Criteria

1. All 3 pages render correctly in Chrome/Safari
2. Both themes work: AOS dark (default) + TikTrack light (`html.theme-tiktrack`)
3. Layout matches existing v1/v2 patterns: sticky header + nav + content
4. All mock data is displayed correctly per the schemas above
5. No inline `<style>` or `<script>` blocks
6. Classic `<script src>` only — no ES modules
7. CSS uses the design tokens from `pipeline-shared.css` (reuse or reference)
8. Filter controls on History page are rendered (functional filtering of mock data is bonus)
9. Pagination controls are rendered
10. Status badges use semantic colors (`--success`, `--warning`, `--danger`, `--accent`)

## Deliverables

1. `agents_os_v3/ui/index.html` — Pipeline View
2. `agents_os_v3/ui/history.html` — History View
3. `agents_os_v3/ui/config.html` — Configuration
4. `agents_os_v3/ui/app.js` — Mock data provider + shared rendering functions
5. `agents_os_v3/ui/style.css` — Shared styles
6. Evidence report in `_COMMUNICATION/team_31/` with preflight URL test results

## Submission

After completion:
1. Verify all 3 pages load in browser (preflight test)
2. Write evidence report to `_COMMUNICATION/team_31/TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v1.0.0.md`
3. Notify Team 100 for review
4. Route to Team 51 for QA

---

**log_entry | TEAM_100 | TEAM_31_MANDATE_ISSUED | AOS_V3_UI_MOCKUPS | 2026-03-26**
