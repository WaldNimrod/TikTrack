---
id: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.3
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (Gate Approver)
cc: Team 11 (AOS Gateway), Team 21 (AOS Backend)
date: 2026-03-28
stage: SPEC_STAGE_8A
type: SPEC_AMENDMENT
basis: TEAM_00_TO_TEAM_100_UI_SPEC_AMENDMENT_MANDATE_v1.0.0.md
amends: TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md
correction_cycle: 3
supersedes_ad: AD-S8A-03 (partial — AUTHORITY_MODEL_v1.0.0), AD-S8A-04 (partial — AUTHORITY_MODEL_v1.0.0)
authority_directive: ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md
ssot_basis:
  - TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
  - TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
  - TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md
  - ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md
status: SUBMITTED
reviewer: team_190
gate_approver: team_00
remediation_summary: |
  CC1 — closes F-01 through F-06 from TEAM_190_AOS_V3_UI_SPEC_AMENDMENT_REVIEW_v1.0.0.md:
  F-01 BLOCKER: Fixed date from 2026-03-27 → 2026-03-26 in spec + review request.
  F-02 MAJOR: Added NOT_PRINCIPAL (403) to §4.18 errors for unauthorized status transitions. Locked: whole-request rejection (AD-S8A-04).
  F-03 MAJOR: Replaced semantic-drifted error codes — MISSING_REASON → IDEA_TITLE_REQUIRED, RUN_NOT_FOUND → IDEA_NOT_FOUND. New codes declared in §9.
  F-04 MAJOR: Added §8 SSOT Anchoring — ideas/work_packages declared first-class entities for Entity Dict v2.0.3 + DDL v1.0.2 scope. Team hierarchy fields (parent_team_id, children) explicitly definition.yaml-canonical, computed at response time (AD-S8A-05).
  F-05 MINOR: DDL tables now use named constraints (pk_, chk_, fk_) + CHECK enum guards per DDL v1.0.1 style.
  F-06 MINOR: Added INVALID_HISTORY_PARAMS to §4.16 errors for offset validation.
  CC2 — closes GATE-F-01, GATE-F-02 from Team 00 gate review:
  GATE-F-01 MAJOR: Removed orphan `notes` field from New Idea modal. Create form = title + description + priority only. decision_notes is Edit-modal-only (approver scope).
  GATE-F-02 MAJOR: Added run_id as first column in §6.5.2 (Active Runs) and §6.5.3 (Completed Runs). Display: last 8 chars with full ULID on hover.
  CC3 — AUTHORITY_MODEL_v1.0.0 amendments (TEAM_00_TO_TEAM_100_AOS_V3_SPEC_AMENDMENT_AUTHORITY_MODEL_v1.0.0):
  AM-01: Removed is_current_actor from GET /api/teams response (§4.13). Teams page = static management.
  AM-02: NOT_PRINCIPAL → INSUFFICIENT_AUTHORITY in §4.18, §9; authorization logic updated to Tier 1/2 model.
  AM-03: AD-S8A-03, AD-S8A-04 updated with supersession notes per AUTHORITY_MODEL_v1.0.0.
  AM-04: Added §0 automation-first operating philosophy preamble.
note: Additive amendment — all content in Module Map v1.0.1 remains unchanged. This document adds §6.1 corrections, §6.4, §6.5, §4.12–§4.18, §8 SSOT anchoring, §9 new error codes, §10 DDL additions, and §11 navigation.---

# AOS v3 — UI Spec Amendment (Stage 8A) — v1.0.3

**Scope:** This amendment extends the Stage 8 Module Map + Integration Spec v1.0.1 with:
- 3 corrections/additions to §6.1 (Pipeline View)
- §6.4 (new page: Teams)
- §6.5 (new page: Portfolio)
- §4.12–§4.18 (7 new API endpoint contracts)
- §8 (SSOT anchoring for new entities)
- §9 (new error codes registry)
- §10 (DDL additions: `ideas` + `work_packages` tables)
- §11 (navigation update to 5-page bar)

**Unchanged:** §1–§5, §6.2, §6.3, §7 of the base spec remain in force without modification.

---

## §0 — Operating Philosophy (AUTHORITY_MODEL v1.0.0)

AOS v3 is an automation-first orchestration system. Agents are the primary
API clients. The Dashboard is Nimrod's interface to the system — equivalent
to how agents interact via API — providing full action capability plus
monitoring-first layout.

Human intervention is scoped to: GATE_4 (permanent HITL), GATE_2 questions
(conditional HITL), Principal-only decisions, and pipeline overrides.
All other operations proceed automatically without human action.

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
| role description | `/api/teams` → `profession` |
| domain | `/api/teams` → `domain_scope` |
| parent_team_id | `/api/teams` — computed from `definition.yaml` (AD-S8A-05) |
| children | `/api/teams` — computed from `definition.yaml` (AD-S8A-05) |

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
| run_id | runs.run_id | Last 8 chars (`…BCDE1234`), full ULID on hover tooltip |
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
| run_id | runs.run_id | Last 8 chars (`…BCDE1234`), full ULID on hover tooltip |
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
      "has_active_assignment":  "boolean"
    }
  ]
}
```

**Field sourcing (AD-S8A-05):**
- `team_id`, `label`, `name`, `engine`, `group`, `profession`, `domain_scope`: from `teams` DB table
- `parent_team_id`, `children`: **computed at response time from `definition.yaml`** — NOT stored in DB. The `teams` DDL table (v1.0.1) has no hierarchy columns. Hierarchy is a configuration-time concern, managed in the static definition file and resolved by the API layer at read time.
- `has_active_assignment`: computed — `EXISTS (SELECT 1 FROM assignments WHERE team_id=t.id AND status='ACTIVE')`

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
| `INVALID_HISTORY_PARAMS` | 400 | offset < 0 |

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
| `IDEA_TITLE_REQUIRED` | 400 | title is empty or missing |
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
| `IDEA_NOT_FOUND` | 404 | idea_id does not exist |
| `INVALID_ACTION` | 400 | status or priority not in valid set |
| `INSUFFICIENT_AUTHORITY` | 403 | Caller lacks Tier 1 or Tier 2 authority (per AUTHORITY_MODEL v1.0.0) and request includes `status` field |

**Authorization policy (AD-S8A-04 — superseded by AUTHORITY_MODEL v1.0.0 §2–§4):** Status transitions on ideas require **Tier 1 or Tier 2 authority** per `ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0`:
- `team_00` (Tier 1) → always allowed
- Any team with active `IDEA_STATUS_AUTHORITY` role in `gate_role_authorities` (Tier 2) → allowed
- All others → `INSUFFICIENT_AUTHORITY` (403), **whole-request rejection** — the API does not silently strip unauthorized fields. If caller lacks authority and request includes `status` field, the entire request is rejected.
Default state: no Tier 2 delegations active. Authority granted by team_00 explicitly via `gate_role_authorities`. Any team may update non-status fields (title, description, priority, decision_notes, target_program_id) without restriction.

---

## §8 — SSOT Anchoring for New Entities

This amendment introduces two new domain entities (`Idea`, `WorkPackage`) and references team hierarchy fields not present in current SSOT sources. This section explicitly anchors their status.

### §8.1 — New Entities: Idea, WorkPackage

**Current SSOT status:** Entity Dictionary v2.0.2 does NOT define `Idea` or `WorkPackage` entities. DDL v1.0.1 does NOT define `ideas` or `work_packages` tables.

**Anchoring decision (AD-S8A-06):** `Idea` and `WorkPackage` are declared as **first-class SSOT entities** in the AOS v3 domain model. They are NOT tactical UI storage — they are canonical domain objects with defined lifecycles:

| Entity | Lifecycle States | Owning SSOT | DDL Target |
|---|---|---|---|
| Idea | NEW → EVALUATING → APPROVED / DEFERRED / REJECTED | Entity Dict v2.0.3 (scope) | DDL v1.0.2 |
| WorkPackage | PLANNED → ACTIVE → COMPLETE / CANCELLED | Entity Dict v2.0.3 (scope) | DDL v1.0.2 |

**Forward dependency:** Entity Dictionary v2.0.3 and DDL v1.0.2 MUST include formal definitions for both entities before BUILD implementation. This amendment's §10 DDL serves as the **draft specification** for DDL v1.0.2 scope — the DDL owner (Team 111) produces the canonical version.

### §8.2 — Team Hierarchy Fields

**Current SSOT status:** The `teams` table in DDL v1.0.1 defines: `id, label, name, engine, group, profession, domain_scope, in_gate_process, created_at`. No `parent_team_id` or `children` columns exist.

**Anchoring decision (AD-S8A-05):** Team hierarchy (`parent_team_id`, `children`) is **`definition.yaml`-canonical**. These fields are:
- NOT stored in the database
- NOT added to the `teams` DDL table
- Computed at API response time by the application layer reading `definition.yaml`

This avoids dual-source ownership between DB and config file. The `teams` DB table remains the SSOT for runtime team attributes (assignment eligibility, gate process state). The `definition.yaml` file remains the SSOT for organizational structure (hierarchy, governance rules, Iron Rules).

---

## §9 — New Error Codes Registry

This amendment introduces 3 new error codes not present in the Stage 7 registry (39 codes). All existing Stage 7 codes are reused with their canonical semantics.

| Code | HTTP | Domain | Introduced In | Semantic |
|---|---|---|---|---|
| `IDEA_TITLE_REQUIRED` | 400 | Ideas | §4.17 | `POST /api/ideas` — title field empty or missing |
| `IDEA_NOT_FOUND` | 404 | Ideas | §4.18 | `PUT /api/ideas/{idea_id}` — idea_id does not exist |
| `INSUFFICIENT_AUTHORITY` | 403 | Ideas | §4.18 | Caller lacks Tier 1 or Tier 2 authority (per AUTHORITY_MODEL v1.0.0); request includes restricted field (status). Replaces prior `NOT_PRINCIPAL` code. |

**Justification for new codes (closing F-03):**
- `IDEA_TITLE_REQUIRED` replaces prior v1.0.0's misuse of `MISSING_REASON`. `MISSING_REASON` is defined in the Stage 7 registry (§6.1) as a run/override-scoped code ("missing mandatory notes for override action"). Applying it to idea title validation would be semantic drift.
- `IDEA_NOT_FOUND` replaces prior v1.0.0's misuse of `RUN_NOT_FOUND`. `RUN_NOT_FOUND` is run-scoped. Ideas are a separate entity domain and require their own entity-not-found code.
- `INSUFFICIENT_AUTHORITY` reuses the existing Stage 7 code (UC-04 blocking authority) with expanded scope for ideas status transitions. The prior `NOT_PRINCIPAL` code is **removed** per `ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0` §8 — it incorrectly implied human-only authority. The system supports agent-held authority via `gate_role_authorities`.

**Updated total error code count:** 39 (Stage 7 base, with `NOT_PRINCIPAL` merged into `INSUFFICIENT_AUTHORITY`) + 2 (Stage 8A net new: `IDEA_TITLE_REQUIRED`, `IDEA_NOT_FOUND`) = **41 total**.

---

## §10 — DDL Additions

**Note:** These DDL definitions serve as the draft specification for DDL v1.0.2 scope (see §8.1 forward dependency). Team 111 produces the canonical DDL version.

### §10.1 — `ideas` table

```sql
CREATE TABLE ideas (
    id                TEXT NOT NULL,
    title             TEXT NOT NULL,
    description       TEXT,
    status            TEXT NOT NULL DEFAULT 'NEW',
    priority          TEXT NOT NULL DEFAULT 'MEDIUM',
    submitted_by      TEXT NOT NULL,
    submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_notes    TEXT,
    target_program_id TEXT,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_ideas PRIMARY KEY (id),
    CONSTRAINT fk_ideas_submitted_by FOREIGN KEY (submitted_by)
        REFERENCES teams(id) ON DELETE RESTRICT,
    CONSTRAINT chk_ideas_status CHECK (status IN (
        'NEW', 'EVALUATING', 'APPROVED', 'DEFERRED', 'REJECTED'
    )),
    CONSTRAINT chk_ideas_priority CHECK (priority IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    ))
);

CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_priority ON ideas(priority);
```

### §10.2 — `work_packages` table

```sql
CREATE TABLE work_packages (
    id            TEXT NOT NULL,
    label         TEXT NOT NULL,
    domain_id     TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'PLANNED',
    linked_run_id TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_work_packages PRIMARY KEY (id),
    CONSTRAINT fk_wp_domain FOREIGN KEY (domain_id)
        REFERENCES domains(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wp_linked_run FOREIGN KEY (linked_run_id)
        REFERENCES runs(id) ON DELETE SET NULL,
    CONSTRAINT chk_wp_status CHECK (status IN (
        'PLANNED', 'ACTIVE', 'COMPLETE', 'CANCELLED'
    ))
);

CREATE INDEX idx_work_packages_domain ON work_packages(domain_id);
CREATE INDEX idx_work_packages_status ON work_packages(status);
```

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
| **AD-S8A-03** | ~~Ideas pipeline status transitions restricted to `team_00` only.~~ **SUPERSEDED by AUTHORITY_MODEL v1.0.0:** Ideas status transitions require Tier 1 (team_00) or Tier 2 authority (delegated via `gate_role_authorities`). Any team may create ideas or update non-status fields. | §4.18 | Authority pyramid replaces hard-coded team_00-only restriction. Default: no delegation active. |
| **AD-S8A-04** | PUT /api/ideas with unauthorized `status` field → whole-request rejection (**INSUFFICIENT_AUTHORITY** 403). No partial application. ~~Prior code: NOT_PRINCIPAL.~~ **SUPERSEDED by AUTHORITY_MODEL v1.0.0 §8:** Error code renamed; behavior (whole-request rejection) retained. | §4.18 | Deterministic contract — API never silently strips fields. Caller knows exactly whether update succeeded or was entirely rejected. |
| **AD-S8A-05** | Team hierarchy (`parent_team_id`, `children`) is `definition.yaml`-canonical. NOT stored in DB. Computed at API response time. | §4.13, §8.2 | Avoids dual-source ownership. DB = runtime attributes; definition.yaml = organizational structure. |
| **AD-S8A-06** | `Idea` and `WorkPackage` are first-class SSOT entities. Require Entity Dict v2.0.3 + DDL v1.0.2 formal definitions before BUILD. | §8.1 | Prevents tactical-UI-storage drift. Entities have defined lifecycles and are domain-canonical. |

---

## Pre-submission Checklist

- [x] §6.1.A: Prompt section — data source, contents, visibility, copy action, visual weight AD
- [x] §6.1.B: IDLE Start Run — form fields, POST mapping, success/error behavior
- [x] §6.1.C: PAUSED paused_at — display requirement
- [x] §6.4: Teams page — two-panel layout, roster fields, 4-layer context, copy actions
- [x] §6.5: Portfolio page — 4 tabs with columns, data sources, action buttons, 2 modals
- [x] §4.12–§4.18: All 7 new API endpoints — request/response/error contracts
- [x] §8: SSOT anchoring — Idea/WorkPackage first-class; team hierarchy definition.yaml-canonical
- [x] §9: 2 net new error codes + 1 reused (INSUFFICIENT_AUTHORITY) — no drift from Stage 7 registry
- [x] §10: DDL additions — named constraints, CHECK enum guards, DDL v1.0.1 style
- [x] §11: Navigation updated to 5-page bar
- [x] All error codes from Stage 7 registry or new with explicit justification (§9)
- [x] Zero open questions — all design decisions locked as AD-S8A-01 through AD-S8A-06
- [x] CC3: AUTHORITY_MODEL v1.0.0 — is_current_actor removed, NOT_PRINCIPAL → INSUFFICIENT_AUTHORITY, AD-S8A-03/04 superseded, §0 preamble added

---

**log_entry | TEAM_100 | UI_SPEC_AMENDMENT | v1.0.0 | SUBMITTED_FOR_REVIEW | 2026-03-27**
**log_entry | TEAM_100 | UI_SPEC_AMENDMENT | v1.0.1 | CC1_REMEDIATION | F-01_F-02_F-03_F-04_F-05_F-06_CLOSED | 2026-03-26**
**log_entry | TEAM_100 | UI_SPEC_AMENDMENT | v1.0.2 | CC2_GATE_REVIEW | GATE-F-01_GATE-F-02_CLOSED | 2026-03-26**
**log_entry | TEAM_100 | UI_SPEC_AMENDMENT | v1.0.3 | CC3_AUTHORITY_MODEL | AM-01_AM-02_AM-03_AM-04_APPLIED | 2026-03-28**
