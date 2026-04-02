---
id: TEAM_00_TO_TEAM_100_UI_SPEC_AMENDMENT_MANDATE_v1.0.0
historical_record: true
from: Team 00 (System Designer)
to: Team 100 (Chief System Architect)
date: 2026-03-27
type: MANDATE
priority: BLOCKING — no BUILD starts without this
subject: AOS v3 UI Spec Amendment — §6 expansion + new API endpoints
basis: mockup review (2026-03-27) — 3 scope gaps + 3 spec-vs-mockup gaps identified---

# Mandate: AOS v3 UI Spec Amendment — §6 + API Extension

## Authority

Team 00 directive. No BUILD begins until this spec amendment is written, validated by Team 190, and gate-approved by Team 00.

## Context

Mockup review of `http://127.0.0.1:8766/agents_os_v3/ui/` identified:
1. **Spec-vs-mockup gaps** — items in Stage 8 §6.1 not implemented in mockup
2. **Scope gaps** — valid operational requirements not in Stage 8 spec at all

The Stage 8 spec was correctly written for its defined scope (pipeline run engine). The scope gaps are legitimate additions required for operational completeness before BUILD.

---

## Deliverable

**Filename:** `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.0.md`
**Path:** `_COMMUNICATION/team_100/`
**Format:** Spec document — same standard as Stage 8 §6

---

## Scope of Amendment

### A. Fix §6.1 Pipeline View — 3 additions

#### A.1 — Prompt Section (MISSING FROM MOCKUP — was in spec §6.1 table)

Stage 8 §6.1 lists "Copy prompt" as a user action but no prompt display section was specced. Define it now:

**Section name:** `ASSEMBLED PROMPT`
**Visibility:** Only when `status ∈ {IN_PROGRESS, CORRECTION}` (not PAUSED, IDLE, COMPLETE)
**Data source:** `GET /api/runs/{run_id}/prompt` (NEW endpoint — see §C below)
**Contents:**
- Assembled prompt text (read-only, rendered from 4 layers L1+L2+L3+L4)
- Token count indicator
- "Copy to clipboard" button (primary action)
- "Regenerate" button (re-calls assembly, busts L4 cache for this run)
- Spec: prompt text display is read-only textarea or pre block — NO editing in UI

**Constraint:** This is the OPERATIVE output of the pipeline. Team 00 copies this and pastes it to the relevant team's agent session. The visual weight of this section must reflect its importance — it should not be smaller or lower-priority than the RUN STATUS section.

#### A.2 — Start Run Form (IDLE state)

When `status = IDLE`, the main panel currently shows only "No active run." Define the IDLE action panel:

**Fields:**
| Field | Type | Required | Values |
|---|---|---|---|
| `work_package_id` | text input | YES | Free text (WP registry lookup optional) |
| `domain_id` | select | YES | Populated from `/api/domains` (or hardcoded from definition.yaml) |
| `process_variant` | select | NO | TRACK_FULL, TRACK_FOCUSED, TRACK_FAST (default: domain default) |
| `execution_mode` | select | NO | MANUAL, DASHBOARD, AUTOMATIC (default: MANUAL) |

**Button:** "Start Run" → `POST /api/runs`
**On success:** panel refreshes to IN_PROGRESS state with new run_id

#### A.3 — paused_at display (PAUSED state)

When `status = PAUSED`, add `paused_at` (ISO-8601) to the RUN STATUS section. This field is already in the `GET /api/state` response (§4.5 response schema).

---

### B. New Page: §6.4 Teams (`/teams`)

**Purpose:** Generate the 4-layer context package for any team at any time. This is the primary interface for Team 00 to activate a new agent session or refresh an existing agent's context.

**URL:** `/teams`
**Data sources:** `GET /api/teams` + `GET /api/state` (to identify current actor)

#### B.1 Layout

**Two-panel layout:**
- **Left panel (300px, scrollable):** Team Roster
- **Right panel (main area):** Context Generator for selected team

#### B.2 Team Roster (left panel)

Each team entry shows:
| Field | Source | Display |
|---|---|---|
| `team_id` | teams table | e.g. `team_21` |
| `label` | teams table | e.g. `Team 21 — AOS Backend` |
| `engine` | teams table | badge: `cursor` / `claude_code` / `openai` / `human` |
| `group` | teams table | `x0_tiktrack` / `x1_aos` / `cross_domain` |
| `is_current_actor` | compare with /api/state actor | highlighted in blue if YES |
| `has_active_assignment` | from /api/teams response | dot indicator |

Filter controls above roster:
- Group filter: All / AOS / TikTrack / Cross-domain
- Show only: current actor toggle

#### B.3 Context Generator (right panel)

When a team is selected, show the 4-layer context package:

**Layer 1 — Identity**
Contents: team_id, label, engine, role description, domain, parent team, children teams
Source: teams table + org structure (definition.yaml)

**Layer 2 — Governance**
Contents: authority scope, writes_to paths, governed_by documents, Iron Rules relevant to this team
Source: governance definitions (from definition.yaml / governance policy)

**Layer 3 — Current State**
Contents: active run summary (domain, gate, phase, status), current assignment (if this team is current actor), recent events (last 5 from /api/history filtered by actor_team_id)
Source: `GET /api/state` + `GET /api/history?actor_team_id={team_id}&limit=5`

**Layer 4 — Task**
Contents: current gate requirements, prompt template for this gate/phase (if team is current actor), acceptance criteria, deliverables
Source: `GET /api/runs/{run_id}/prompt` (if team is current actor) + current gate definition

**Actions:**
- "Copy Layer 1" / "Copy Layer 2" / "Copy Layer 3" / "Copy Layer 4" — per layer clipboard copy
- **"Copy Full Context"** (primary CTA, prominent) — copies all 4 layers assembled as a single document
- "Refresh" — re-fetches current state

**Format of copied context:** Markdown document with clear layer headers. Structure:
```
# [Team Label] — Session Context
## Layer 1 — Identity
...
## Layer 2 — Governance
...
## Layer 3 — Current State
...
## Layer 4 — Task
...
```

---

### C. New Page: §6.5 Portfolio (`/portfolio`)

**Purpose:** Give Team 00 the full operational picture — all programs, WPs, runs (active + completed), and the ideas pipeline.

**URL:** `/portfolio`

#### C.1 Layout — 4 Tabs

**Tab 1: Active Runs**
Table of all currently active runs across all domains.
| Column | Source |
|---|---|
| domain_id | runs |
| work_package_id | runs |
| status badge | runs.status |
| current_gate / phase | runs |
| correction_cycle_count | runs |
| started_at | runs |
| current actor | assignments |
| Actions: [View] [Pause] [Override] | — |

Data source: `GET /api/runs?status=IN_PROGRESS,CORRECTION,PAUSED`
Click [View] → navigates to Pipeline View filtered to this run's domain

**Tab 2: Completed Runs**
Paginated table of completed and failed runs.
| Column | Source |
|---|---|
| domain_id | runs |
| work_package_id | runs |
| status (COMPLETE / FAILED) | runs |
| started_at → completed_at | runs |
| correction_cycle_count | runs |
| Actions: [View History] | — |

Data source: `GET /api/runs?status=COMPLETE&limit=20&offset=0`

**Tab 3: Work Packages**
Registry of all defined WPs (from definition.yaml / seed data).
| Column | Source |
|---|---|
| wp_id | work_packages table |
| label | work_packages |
| domain_id | work_packages |
| status: PLANNED / ACTIVE / COMPLETE / CANCELLED | work_packages |
| linked_run_id (if active) | runs join |
| Actions: [Start Run] (if PLANNED + no active run for domain) | — |

Data source: `GET /api/work-packages`
[Start Run] → navigates to Pipeline View IDLE state with wp_id pre-filled

**Tab 4: Ideas Pipeline**
| Column | Source |
|---|---|
| idea_id | ideas table |
| title | ideas |
| status badge: NEW / EVALUATING / APPROVED / DEFERRED / REJECTED | ideas |
| priority: LOW / MEDIUM / HIGH / CRITICAL | ideas |
| submitted_by | ideas |
| submitted_at | ideas |
| target_program_id (if approved) | ideas |
| Actions: [Edit] [Approve] [Reject] [Defer] | — |

Data source: `GET /api/ideas`

**Ideas form (modal):** When [+ New Idea] clicked:
- title (required)
- description (textarea)
- priority (select)
- notes

**Edit idea modal:**
- All above fields + status transition buttons

---

### D. New API Endpoints Required

Define full contracts (request, response, errors) for each:

#### D.1 `GET /api/runs/{run_id}/prompt` — Assemble current prompt

Returns the assembled prompt for the current gate/phase/actor of the run.

**Response:**
```json
{
  "run_id": "string",
  "gate_id": "string",
  "phase_id": "string | null",
  "actor_team_id": "string",
  "prompt_text": "string — assembled L1+L2+L3+L4",
  "token_count": "integer",
  "assembled_at": "ISO-8601",
  "cache_hit": "boolean"
}
```

**Errors:** `INVALID_STATE` (409) if status=PAUSED or IDLE; `TEMPLATE_NOT_FOUND`; `ROUTING_UNRESOLVED`

#### D.2 `GET /api/teams` — List all teams

**Response:**
```json
{
  "teams": [
    {
      "team_id": "string",
      "label": "string",
      "engine": "string",
      "group": "string",
      "profession": "string",
      "parent_team_id": "string | null",
      "children": ["string"],
      "has_active_assignment": "boolean",
      "is_current_actor": "boolean"
    }
  ]
}
```

#### D.3 `GET /api/runs` — List all runs (paginated)

**Query params:** `status` (CSV of statuses), `domain_id`, `limit` (default 20, max 100), `offset`

**Response:**
```json
{
  "total": "integer",
  "limit": "integer",
  "offset": "integer",
  "runs": [
    {
      "run_id": "string",
      "work_package_id": "string",
      "domain_id": "string",
      "status": "string",
      "process_variant": "string",
      "current_gate_id": "string | null",
      "current_phase_id": "string | null",
      "correction_cycle_count": "integer",
      "started_at": "ISO-8601",
      "completed_at": "ISO-8601 | null",
      "current_actor_team_id": "string | null"
    }
  ]
}
```

#### D.4 `GET /api/work-packages` — WP registry

**Response:**
```json
{
  "work_packages": [
    {
      "wp_id": "string",
      "label": "string",
      "domain_id": "string",
      "status": "PLANNED | ACTIVE | COMPLETE | CANCELLED",
      "linked_run_id": "string | null"
    }
  ]
}
```

#### D.5 `GET /api/ideas` — List ideas

**Query params:** `status` (filter), `priority` (filter), `limit`, `offset`

**Response:**
```json
{
  "total": "integer",
  "ideas": [
    {
      "idea_id": "string",
      "title": "string",
      "description": "string | null",
      "status": "NEW | EVALUATING | APPROVED | DEFERRED | REJECTED",
      "priority": "LOW | MEDIUM | HIGH | CRITICAL",
      "submitted_by": "string",
      "submitted_at": "ISO-8601",
      "decision_notes": "string | null",
      "target_program_id": "string | null"
    }
  ]
}
```

#### D.6 `POST /api/ideas` — Create idea

**Request:** `{ "title": "string", "description": "string | null", "priority": "string" }`
**Response 201:** Created idea object.

#### D.7 `PUT /api/ideas/{idea_id}` — Update idea

**Request:** `{ "status": "string | null", "priority": "string | null", "decision_notes": "string | null", "title": "string | null", "description": "string | null" }`
**Response 200:** Updated idea object.

---

### E. New DDL Tables Required

Define the following additions to DDL (coordinate with Team 111 for DDL v1.0.2 scope — may include DDL-ERRATA-01 + these additions):

**`ideas` table:**
```sql
CREATE TABLE ideas (
    id          TEXT PRIMARY KEY,           -- ULID
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'NEW',  -- NEW/EVALUATING/APPROVED/DEFERRED/REJECTED
    priority    TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW/MEDIUM/HIGH/CRITICAL
    submitted_by TEXT NOT NULL REFERENCES teams(id),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_notes TEXT,
    target_program_id TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**`work_packages` table** (if not already defined in DDL v1.0.1 — check):
```sql
CREATE TABLE work_packages (
    id          TEXT PRIMARY KEY,           -- e.g. S003-P002-WP001
    label       TEXT NOT NULL,
    domain_id   TEXT NOT NULL REFERENCES domains(id),
    status      TEXT NOT NULL DEFAULT 'PLANNED',
    linked_run_id TEXT REFERENCES runs(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### F. Navigation — Add to All Pages

Add the two new pages to the navigation bar:
```
[ Pipeline ] [ History ] [ Configuration ] [ Teams ] [ Portfolio ]
```

The navigation bar update applies to all 5 pages (all use same nav component).

---

## Acceptance Criteria

The spec amendment document (Team 100 deliverable) must pass Team 190 review with PASS before Team 31 starts mockup. Acceptance criteria:

- [ ] §6.1 Prompt section: full contract (data source, contents, visibility rules, copy action)
- [ ] §6.1 IDLE Start Run: form fields, POST /api/runs mapping, success behavior
- [ ] §6.1 PAUSED: paused_at in display spec
- [ ] §6.4 Teams page: full layout, team roster fields, 4-layer context contents, copy actions
- [ ] §6.5 Portfolio page: 4 tabs, each with columns, data sources, action buttons
- [ ] D.1–D.7: All 7 new API endpoints with request/response/error contracts
- [ ] E: DDL additions (ideas table, work_packages table if needed)
- [ ] F: Navigation updated to 5-page bar
- [ ] All new error codes from Stage 7 registry or explicitly flagged as new additions
- [ ] Zero open questions — all design decisions locked with AD-S8A-xx designation

---

## Sequencing

```
Team 100: Spec Amendment (this mandate)
    ↓ (after PASS from Team 190 + Team 00 approval)
Team 31: Mockup (separate mandate)
    ↓ (after mockup draft)
Team 51: Mockup QA (separate mandate)
    ↓ (after PASS)
BUILD begins
```

Team 100 should not block on Team 31 or Team 51 — write the spec independently.

---

**log_entry | TEAM_00 | UI_SPEC_AMENDMENT_MANDATE | ISSUED | team_100 | 2026-03-27**
