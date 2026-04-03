---
id: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-27
stage: SPEC_STAGE_8A
type: SPEC_AMENDMENT
basis: TEAM_00_TO_TEAM_100_UI_SPEC_AMENDMENT_MANDATE_v1.0.0.md
amends: TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md
ssot_basis:
  - TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
  - TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
  - TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md
status: SUBMITTED_FOR_REVIEW
reviewer: team_190
gate_approver: team_00
note: Additive amendment — all content in Module Map v1.0.1 remains unchanged. This document adds §6.1 corrections, §6.4, §6.5, §4.12–§4.18, §10 DDL additions, and §11 navigation.---

# AOS v3 — UI Spec Amendment (Stage 8A) — v1.0.0

**Scope:** This amendment extends the Stage 8 Module Map + Integration Spec v1.0.1 with:
- 3 corrections/additions to §6.1 (Pipeline View)
- §6.4 (new page: Teams)
- §6.5 (new page: Portfolio)
- §4.12–§4.18 (7 new API endpoint contracts)
- §10 (DDL additions: `ideas` + `work_packages` tables)
- §11 (navigation update to 5-page bar)

**Unchanged:** §1–§5, §6.2, §6.3, §7–§9 of the base spec remain in force without modification.

---

## §6.1 — Pipeline View Corrections

The following additions are applied to §6.1 of the base spec. Existing content is unchanged; these are additive.

### §6.1.A — Assembled Prompt Section

**Section name:** `ASSEMBLED PROMPT`
**Visibility:** Only when `status ∈ {IN_PROGRESS, CORRECTION}`. Hidden when PAUSED, IDLE, or COMPLETE.
**Data source:** `GET /api/runs/{run_id}/prompt` (§4.12)

**Contents:**

| Element | Type | Description |
|---|---|---|
| Prompt text | Read-only `<pre>` block | Assembled L1+L2+L3+L4 from prompt assembly pipeline (Prompt Arch Spec v1.0.2) |
| Token count | Badge | `token_count` from response — displayed as `{count} tokens` with advisory color per AD-S6-07 |
| Copy to clipboard | Primary button | Copies full `prompt_text` to clipboard |
| Regenerate | Secondary button | Re-calls `GET /api/runs/{run_id}/prompt?bust_cache=true` — invalidates L4 cache for this context |

**Visual weight constraint (AD-S8A-01):** The Assembled Prompt section MUST have equal or greater visual prominence than the Run Status section. This is the operative output of the pipeline — Team 00 copies this and pastes it to the target agent's session.

**Iron Rule:** Prompt text is read-only in the UI. No editing. What the prompt assembly pipeline produces is what the user copies.

---

### §6.1.B — Start Run Form (IDLE State)

**Visibility:** Only when `status = IDLE` (no active run for selected domain).
**Action:** Submits `POST /api/runs` (§4.1 in base spec).

**Form fields:**

| Field | HTML Type | Required | Source/Values | Maps to |
|---|---|---|---|---|
| `work_package_id` | `<input type="text">` | YES | Free text | `POST /api/runs` body.work_package_id |
| `domain_id` | `<select>` | YES | Populated from domains in `definition.yaml` (agents_os, tiktrack) | body.domain_id |
| `process_variant` | `<select>` | NO | TRACK_FULL, TRACK_FOCUSED, TRACK_FAST. Default: domain's `default_variant` | body.process_variant |
| `execution_mode` | `<select>` | NO | MANUAL, DASHBOARD, AUTOMATIC. Default: MANUAL | body.execution_mode |

**Button:** `Start Run →` (primary CTA)
**On success (201):** Panel refreshes. Status transitions from IDLE → IN_PROGRESS. New `run_id` displayed.
**On error:** Display error message from response (`DOMAIN_ALREADY_ACTIVE`, `UNKNOWN_WP`, `DOMAIN_INACTIVE`).

---

### §6.1.C — paused_at Display (PAUSED State)

**Addition to PAUSED state display:** When `status = PAUSED`, the Run Status section MUST display:

| Field | Source | Format |
|---|---|---|
| `paused_at` | `GET /api/state` response → `paused_at` | ISO-8601 → human-readable relative time + absolute tooltip |

This field is already present in the `/api/state` response (base spec §4.9). This correction adds it to the display requirement.

---

## §6.4 — Teams Page (`/teams`)

**URL:** `/teams`
**Purpose:** Generate the 4-layer context package for any team. Primary interface for Team 00 to activate agent sessions.
**Data sources:** `GET /api/teams` (§4.13) + `GET /api/state` (§4.9) + `GET /api/history` (§4.10) + `GET /api/runs/{run_id}/prompt` (§4.12)

### §6.4.1 Layout

Two-panel layout:
- **Left panel:** 300px, scrollable — Team Roster
- **Right panel:** Main area — Context Generator for selected team

### §6.4.2 Team Roster (Left Panel)

Each team entry displays:

| Field | Source | Display |
|---|---|---|
| `team_id` | `/api/teams` | e.g. `team_21` |
| `label` | `/api/teams` | e.g. `Team 21 — AOS Backend` |
| `engine` | `/api/teams` | Badge: `cursor` / `claude_code` / `codex` / `human` |
| `group` | `/api/teams` | Visual grouping by `x0_tiktrack` / `x1_aos` / `cross_domain` |
| Current actor indicator | Compare with `/api/state` → `actor.team_id` | `CURRENT ACTOR ★` badge (accent color) if match; `Not current actor.` in muted text if no match |
| Active assignment | `/api/teams` → `has_active_assignment` | Dot indicator (success color if active) |

**Filter controls (above roster):**
- Group filter: `All` / `AOS` / `TikTrack` / `Cross-domain`
- Toggle: "Show current actor only"

**Selection behavior:** Click a team entry → right panel loads that team's context.

### §6.4.3 Context Generator (Right Panel)

When a team is selected, display the 4-layer context package:

**Layer 1 — Identity**

| Content | Source |
|---|---|
| team_id, label, name | `/api/teams` |
| engine | `/api/teams` |
| role description | `/api/teams` or `definition.yaml` |
| domain | `/api/teams` |
| parent_team_id | `/api/teams` |
| children | `/api/teams` |

**Layer 2 — Governance**

| Content | Source |
|---|---|
| Authority scope (gate_authority if any) | `definition.yaml` / governance policy |
| writes_to paths | `definition.yaml` |
| governed_by documents | `definition.yaml` |
| Iron Rules (team-specific) | `definition.yaml` |

**Layer 3 — Current State**

| Content | Source |
|---|---|
| Active run summary (domain, gate, phase, status) | `GET /api/state` |
| Current assignment (if this team is current actor) | `/api/state` → actor |
| Recent events (last 5 by this actor) | `GET /api/history?actor_team_id={team_id}&limit=5` |

**Layer 4 — Task**

| Content | Source |
|---|---|
| Current gate requirements | Gate definition from context |
| Prompt template (if team is current actor) | `GET /api/runs/{run_id}/prompt` |
| Acceptance criteria, deliverables | Gate/phase definition |

**Action buttons:**

| Button | Label | Behavior |
|---|---|---|
| Copy Layer 1 | `Copy L1` | Copies Layer 1 section to clipboard |
| Copy Layer 2 | `Copy L2` | Copies Layer 2 section to clipboard |
| Copy Layer 3 | `Copy L3` | Copies Layer 3 section to clipboard |
| Copy Layer 4 | `Copy L4` | Copies Layer 4 section to clipboard |
| **Copy Full Context** | `Copy Full Context` | **Primary CTA** — copies all 4 layers assembled as single markdown document |
| Refresh | `Refresh` | Re-fetches current state data |

**Copied context format (AD-S8A-02):**

```markdown
# [Team Label] — Session Context
## Layer 1 — Identity
[layer 1 content]
## Layer 2 — Governance
[layer 2 content]
## Layer 3 — Current State
[layer 3 content]
## Layer 4 — Task
[layer 4 content]
```

---

## §6.5 — Portfolio Page (`/portfolio`)

**URL:** `/portfolio`
**Purpose:** Operational overview for Team 00 — all runs, work packages, and ideas pipeline.

### §6.5.1 Layout — 4 Tabs

Tab bar: `Active Runs` | `Completed Runs` | `Work Packages` | `Ideas Pipeline`

### §6.5.2 Tab 1: Active Runs

**Data source:** `GET /api/runs?status=IN_PROGRESS,CORRECTION,PAUSED` (§4.14)

| Column | Source | Display |
|---|---|---|
| domain_id | runs | Text |
| work_package_id | runs | Text |
| status | runs.status | Badge: IN_PROGRESS (accent), CORRECTION (warning), PAUSED (text-muted) |
| current_gate / phase | runs | `GATE_3 / phase_3_1` |
| correction_cycle_count | runs | Integer |
| started_at | runs | Relative time |
| current_actor | runs.current_actor_team_id | Team label |
| Actions | — | `[View]` `[Pause]` `[Override]` |

**[View]** → navigates to Pipeline View (`/`) filtered to this run's domain_id.
**[Pause]** → calls `POST /api/runs/{run_id}/pause` (visible only for IN_PROGRESS runs, team_00 only).
**[Override]** → calls `POST /api/runs/{run_id}/override` (team_00 only).

### §6.5.3 Tab 2: Completed Runs

**Data source:** `GET /api/runs?status=COMPLETE&limit=20&offset=0` (§4.14)

| Column | Source | Display |
|---|---|---|
| domain_id | runs | Text |
| work_package_id | runs | Text |
| status | runs.status | Badge: COMPLETE (success) |
| started_at → completed_at | runs | Date range |
| correction_cycle_count | runs | Integer |
| Actions | — | `[View History]` |

**[View History]** → navigates to History View (`/history`) filtered to this run's run_id.
**Pagination:** limit/offset controls.

### §6.5.4 Tab 3: Work Packages

**Data source:** `GET /api/work-packages` (§4.15)

| Column | Source | Display |
|---|---|---|
| wp_id | work_packages | Text |
| label | work_packages | Text |
| domain_id | work_packages | Text |
| status | work_packages.status | Badge: PLANNED (text-muted), ACTIVE (accent), COMPLETE (success), CANCELLED (danger) |
| linked_run_id | work_packages | Link to Pipeline View if present |
| Actions | — | `[Start Run]` (if PLANNED + no active run for domain) |

**[Start Run]** → navigates to Pipeline View IDLE state with `work_package_id` pre-filled in the Start Run form (§6.1.B).

### §6.5.5 Tab 4: Ideas Pipeline

**Data source:** `GET /api/ideas` (§4.16)

| Column | Source | Display |
|---|---|---|
| idea_id | ideas | ULID (truncated) |
| title | ideas | Text |
| status | ideas.status | Badge: NEW (accent), EVALUATING (warning), APPROVED (success), DEFERRED (text-muted), REJECTED (danger) |
| priority | ideas.priority | Badge: CRITICAL (danger), HIGH (warning), MEDIUM (accent), LOW (text-muted) |
| submitted_by | ideas | Team label |
| submitted_at | ideas | Relative time |
| target_program_id | ideas | Text (if approved) |
| Actions | — | `[Edit]` `[Approve]` `[Reject]` `[Defer]` |

**[+ New Idea] button** (above table) → opens New Idea modal.

**New Idea modal:**

| Field | HTML Type | Required |
|---|---|---|
| title | `<input type="text">` | YES |
| description | `<textarea>` | NO |
| priority | `<select>` (LOW/MEDIUM/HIGH/CRITICAL) | YES (default: MEDIUM) |
| notes | `<textarea>` | NO |

**Button:** `Submit Idea` → `POST /api/ideas` (§4.17)

**Edit Idea modal:**

Same fields as New Idea, plus:
- Current status displayed
- Status transition buttons: `[Approve]` `[Reject]` `[Defer]` `[Set Evaluating]`
- `decision_notes` field (textarea)
- `target_program_id` field (text, visible only when status = APPROVED)

**Button:** `Save Changes` → `PUT /api/ideas/{idea_id}` (§4.18)

---

## §4.12 — GET /api/runs/{run_id}/prompt — Assemble Prompt

**Purpose:** Returns the assembled 4-layer prompt for the current gate/phase/actor of a run.

**Response 200:**
```json
{
  "run_id":         "string (ULID)",
  "gate_id":        "string",
  "phase_id":       "string | null",
  "actor_team_id":  "string",
  "prompt_text":    "string — assembled L1+L2+L3+L4",
  "token_count":    "integer",
  "assembled_at":   "ISO-8601",
  "cache_hit":      "boolean"
}
```

**Query params:**
- `bust_cache`: boolean (default false) — if true, invalidates L4 cache for this context before assembly

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `INVALID_STATE` | 409 | run.status ∈ {PAUSED, NOT_STARTED} or no active run |
| `RUN_NOT_FOUND` | 404 | run_id not found |
| `TEMPLATE_NOT_FOUND` | 404 | No active template for current gate/phase/domain context |
| `ROUTING_UNRESOLVED` | 500 | Cannot determine current actor |

**Delegates to:** `prompting/builder.py:assemble_prompt()` (base spec §3.8)

---

## §4.13 — GET /api/teams — List Teams

**Purpose:** Returns all registered teams with their current assignment status.

**Response 200:**
```json
{
  "teams": [
    {
      "team_id":               "string",
      "label":                 "string",
      "name":                  "string",
      "engine":                "string",
      "group":                 "string",
      "profession":            "string",
      "domain_scope":          "string",
      "parent_team_id":        "string | null",
      "children":              ["string"],
      "has_active_assignment":  "boolean",
      "is_current_actor":      "boolean"
    }
  ]
}
```

**Logic:**
- `has_active_assignment`: `EXISTS (SELECT 1 FROM assignments WHERE team_id=t.id AND status='ACTIVE')`
- `is_current_actor`: matches `actor.team_id` from current active run's `/api/state` response

**Errors:** None (always returns 200, empty array if no teams).

---

## §4.14 — GET /api/runs — List Runs (Paginated)

**Purpose:** Lists runs with optional status/domain filtering. Used by Portfolio tabs.

**Query params:**
- `status`: CSV of status values (e.g., `IN_PROGRESS,CORRECTION,PAUSED`)
- `domain_id`: filter by domain
- `limit`: integer (default 20, max 100)
- `offset`: integer (default 0)

**Response 200:**
```json
{
  "total":  "integer",
  "limit":  "integer",
  "offset": "integer",
  "runs": [
    {
      "run_id":                "string (ULID)",
      "work_package_id":       "string",
      "domain_id":             "string",
      "status":                "string",
      "process_variant":       "string",
      "current_gate_id":       "string | null",
      "current_phase_id":      "string | null",
      "correction_cycle_count": "integer",
      "started_at":            "ISO-8601",
      "completed_at":          "ISO-8601 | null",
      "current_actor_team_id": "string | null"
    }
  ]
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `INVALID_LIMIT` | 400 | limit < 1 or > 100 |
| `INVALID_HISTORY_PARAMS` | 400 | offset < 0 |

---

## §4.15 — GET /api/work-packages — WP Registry

**Purpose:** Lists all work packages from the WP registry.

**Response 200:**
```json
{
  "work_packages": [
    {
      "wp_id":          "string",
      "label":          "string",
      "domain_id":      "string",
      "status":         "PLANNED | ACTIVE | COMPLETE | CANCELLED",
      "linked_run_id":  "string | null"
    }
  ]
}
```

**Logic:** `linked_run_id` is populated by joining `runs` where `work_package_id = wp.id AND status IN ('IN_PROGRESS', 'CORRECTION', 'PAUSED')`.

**Errors:** None (always returns 200).

---

## §4.16 — GET /api/ideas — List Ideas

**Purpose:** Lists ideas from the ideas pipeline with optional filtering.

**Query params:**
- `status`: filter by idea status (NEW, EVALUATING, APPROVED, DEFERRED, REJECTED)
- `priority`: filter by priority (LOW, MEDIUM, HIGH, CRITICAL)
- `limit`: integer (default 50, max 200)
- `offset`: integer (default 0)

**Response 200:**
```json
{
  "total": "integer",
  "limit": "integer",
  "offset": "integer",
  "ideas": [
    {
      "idea_id":            "string (ULID)",
      "title":              "string",
      "description":        "string | null",
      "status":             "NEW | EVALUATING | APPROVED | DEFERRED | REJECTED",
      "priority":           "LOW | MEDIUM | HIGH | CRITICAL",
      "submitted_by":       "string — teams.id",
      "submitted_at":       "ISO-8601",
      "decision_notes":     "string | null",
      "target_program_id":  "string | null",
      "updated_at":         "ISO-8601"
    }
  ]
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `INVALID_LIMIT` | 400 | limit < 1 or > 200 |

---

## §4.17 — POST /api/ideas — Create Idea

**Purpose:** Creates a new idea in the ideas pipeline.

**Request:**
```json
{
  "title":       "string — required",
  "description": "string | null — optional",
  "priority":    "string — required; ∈ {LOW, MEDIUM, HIGH, CRITICAL}"
}
```

**Response 201:**
```json
{
  "idea_id":       "string (ULID)",
  "title":         "string",
  "description":   "string | null",
  "status":        "NEW",
  "priority":      "string",
  "submitted_by":  "string — resolved from API key (AD-S8-03)",
  "submitted_at":  "ISO-8601"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `MISSING_REASON` | 400 | title empty |
| `INVALID_ACTION` | 400 | priority not in valid set |

**Access:** Any authenticated team (via API key, AD-S8-03). `submitted_by` resolved from API key → team_id.

---

## §4.18 — PUT /api/ideas/{idea_id} — Update Idea

**Purpose:** Updates an existing idea — status transitions, priority changes, decision notes.

**Request:**
```json
{
  "title":              "string | null — optional update",
  "description":        "string | null — optional update",
  "status":             "string | null — optional; ∈ {NEW, EVALUATING, APPROVED, DEFERRED, REJECTED}",
  "priority":           "string | null — optional; ∈ {LOW, MEDIUM, HIGH, CRITICAL}",
  "decision_notes":     "string | null — optional",
  "target_program_id":  "string | null — optional; set when status = APPROVED"
}
```

**Response 200:** Updated idea object (same schema as GET /api/ideas item).

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `RUN_NOT_FOUND` | 404 | idea_id not found (reusing code — maps to "entity not found") |
| `INVALID_ACTION` | 400 | status or priority not in valid set |

**Access:** `team_00` only for status transitions (AD-S8-01 pattern). Any team may update title/description/priority.

---

## §10 — DDL Additions

### §10.1 — `ideas` table

```sql
CREATE TABLE ideas (
    id                TEXT PRIMARY KEY,                     -- ULID
    title             TEXT NOT NULL,
    description       TEXT,
    status            TEXT NOT NULL DEFAULT 'NEW',          -- NEW / EVALUATING / APPROVED / DEFERRED / REJECTED
    priority          TEXT NOT NULL DEFAULT 'MEDIUM',       -- LOW / MEDIUM / HIGH / CRITICAL
    submitted_by      TEXT NOT NULL REFERENCES teams(id),
    submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_notes    TEXT,
    target_program_id TEXT,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `CREATE INDEX idx_ideas_status ON ideas(status);`
- `CREATE INDEX idx_ideas_priority ON ideas(priority);`

### §10.2 — `work_packages` table

**Note:** DDL v1.0.1 does NOT define a `work_packages` table. The base spec's `runs.work_package_id` is a free-text field. This amendment defines the table for the Portfolio WP registry.

```sql
CREATE TABLE work_packages (
    id            TEXT PRIMARY KEY,                          -- e.g. S003-P002-WP001
    label         TEXT NOT NULL,
    domain_id     TEXT NOT NULL REFERENCES domains(id),
    status        TEXT NOT NULL DEFAULT 'PLANNED',           -- PLANNED / ACTIVE / COMPLETE / CANCELLED
    linked_run_id TEXT REFERENCES runs(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `CREATE INDEX idx_work_packages_domain ON work_packages(domain_id);`
- `CREATE INDEX idx_work_packages_status ON work_packages(status);`

**Coordination note:** These DDL additions are candidates for DDL v1.0.2 (alongside DDL-ERRATA-01 partial index). Team 111 mandate scope may include both.

---

## §11 — Navigation Update

The navigation bar is updated from 3 pages to 5 pages. All 5 pages use the same `pipeline-nav` component.

```
[ Pipeline ] [ History ] [ Configuration ] [ Teams ] [ Portfolio ]
```

| Nav item | URL | Page |
|---|---|---|
| Pipeline | `/` | Pipeline View (§6.1) |
| History | `/history` | History View (§6.2) |
| Configuration | `/config` | Configuration (§6.3) |
| Teams | `/teams` | Teams (§6.4 — new) |
| Portfolio | `/portfolio` | Portfolio (§6.5 — new) |

---

## §12 — Architectural Decisions (Stage 8A)

| AD ID | Decision | Locked In | Rationale |
|---|---|---|---|
| **AD-S8A-01** | Assembled Prompt section MUST have equal or greater visual prominence than Run Status section. | §6.1.A | This is the operative output of the pipeline — Team 00 copies this to target agent. Visual hierarchy must reflect operational importance. |
| **AD-S8A-02** | Copied context format for Teams page uses markdown with `# [Team Label] — Session Context` header and `## Layer N — [Name]` section headers. | §6.4.3 | Standardized format ensures consistent agent onboarding across all sessions. |
| **AD-S8A-03** | Ideas pipeline status transitions restricted to `team_00` only. Any team may create ideas or update non-status fields. | §4.18 | Consistent with AD-S8-01 administrative pattern — decision authority resides with Principal. |

---

## Pre-submission Checklist

- [x] §6.1.A: Prompt section — data source, contents, visibility, copy action, visual weight AD
- [x] §6.1.B: IDLE Start Run — form fields, POST mapping, success/error behavior
- [x] §6.1.C: PAUSED paused_at — display requirement
- [x] §6.4: Teams page — two-panel layout, roster fields, 4-layer context, copy actions
- [x] §6.5: Portfolio page — 4 tabs with columns, data sources, action buttons, 2 modals
- [x] §4.12–§4.18: All 7 new API endpoints — request/response/error contracts
- [x] §10: DDL additions — `ideas` table (10 columns), `work_packages` table (7 columns)
- [x] §11: Navigation updated to 5-page bar
- [x] All error codes from Stage 7 registry or reused canonical codes (INVALID_LIMIT, INVALID_ACTION, etc.)
- [x] Zero open questions — all design decisions locked as AD-S8A-01/02/03

---

**log_entry | TEAM_100 | UI_SPEC_AMENDMENT | v1.0.0 | SUBMITTED_FOR_REVIEW | 2026-03-27**
