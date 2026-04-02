---
id: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1
historical_record: true
type: SPEC_AMENDMENT
stage: SPEC_STAGE_8B
status: SUBMITTED
from: Team 100 (Chief System Architect)
date: 2026-03-28
correction_cycle: 2
amends:
  - TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.2
  - TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.3
ssot_basis:
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md
  - _COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
  - agents_os_v2/orchestrator/json_enforcer.py (reference)
  - agents_os_v2/orchestrator/pipeline.py (reference)
mandate: TEAM_100_ACTIVATION_PROMPT_STAGE8B_FEEDBACK_INGESTION_v1.0.0 (A119)
note: >
  Additive amendment — all content in Module Map v1.0.1 and UI Spec Amendment v1.0.2 remains unchanged.
  This document adds: Feedback Ingestion Pipeline (FIP), Operator Handoff UI, SSE Stream,
  API amendments/additions, Stage 8A entity amendments (Team 00 additions), DDL, and new modules.---

# AOS v3 — UI Spec Amendment (Stage 8B) — v1.1.0

**Scope:** This amendment extends the Stage 8 Module Map v1.0.1 and UI Spec Amendment v1.0.2 with:

- §1 (canonical terminology — 8 locked terms)
- §2 (Feedback Ingestion Pipeline — 4 Detection Modes × 3 Ingestion Layers)
- §3 (Operator Handoff UI — §6.1.D: PREVIOUS / NEXT / CLI)
- §4 (Verdict/Reason Input — §6.1.E: pre-fill + manual)
- §5 (CORRECTION Blocking Findings — §6.1.F)
- §6 (SSE Stream — event-driven real-time push)
- §7 (Teams Engine Edit — §6.4 amendment)
- §8 (History Analytics — §6.2 amendment)
- §9 (Stage 8A Entity Amendments — Ideas fields + WP detail + Portfolio gate organization)
- §10 (new + amended API endpoint contracts)
- §11 (new error codes registry — 8 new, total 49)
- §12 (new module specs: `audit/ingestion.py`, `audit/sse.py`)
- §13 (DDL additions: `pending_feedbacks` + `ideas` amendments)
- §14 (architectural decisions: AD-S8B-01 through AD-S8B-11)
- §15 (impact analysis on existing stages)
- §16 (mockup scope for Team 31)
- §17 (integration tests: TC-15 through TC-26)

**Unchanged:** All sections of Module Map v1.0.1 and UI Spec Amendment v1.0.2 remain in force without modification unless explicitly amended below.

---

## §1 — Canonical Terminology

These terms are locked. Use of alternative terminology is a MAJOR finding.

| Canonical Term | Definition | Forbidden Alternatives |
|---|---|---|
| **Feedback Ingestion** | The complete process: detect team output, parse it, produce a FeedbackRecord | "parsing", "extraction", "verdict scan" |
| **Detection Mode** | One of 4 methods for discovering team output and feeding it into the ingestion pipeline | "input method", "source type" |
| **FeedbackRecord** | The canonical structured representation of team output after ingestion | "verdict file", "result object" |
| **Operator Handoff** | Dashboard section: what happened + what to do next + CLI command | "copilot", "assistant", "guidance panel" |
| **Next Action** | The next command/action required from the operator, computed server-side | "next step", "suggested action" |
| **Previous Event** | The most recent event in the events table for the current run_id | "last event", "recent event" |
| **SSE Stream** | Server-Sent Events endpoint for real-time event push to dashboard | "websocket", "webhook", "push notifications" |
| **Ingestion Layer** | A specific parsing stage in the 3-layer chain (IL-1 / IL-2 / IL-3) | "fallback", "tier", "attempt" |

---

## §2 — Feedback Ingestion Pipeline (FIP)

### §2.1 — Purpose

The Feedback Ingestion Pipeline closes the gap between "agent finished working" and "operator decides to advance/fail the gate." In v2, this gap was bridged by manual CLI (`./pipeline_run.sh pass`) + file scanning. In v3, FIP provides 4 structured detection modes and 3 parsing layers to produce a canonical FeedbackRecord.

**Principle:** Dashboard = consumer only. All parsing occurs server-side in the API. The dashboard sends raw input, receives structured FeedbackRecord. (AD-S8B-01, consistent with Team 101 Iron Rule.)

**v2 basis:** `agents_os_v2/orchestrator/json_enforcer.py` (IL-1 JSON extraction), `agents_os_v2/orchestrator/pipeline.py` (verdict file search, BF-NN extraction, route_recommendation regex). The v3 FIP formalizes and extends these patterns.

### §2.2 — 4 Detection Modes

| Mode | ID | Trigger | Mechanism | Who Initiates |
|------|-----|---------|-----------|---------------|
| A | `CANONICAL_AUTO` | Agent calls API directly | `POST /api/runs/{run_id}/advance` with `feedback_json` body field | Agent (LLM) |
| B | `OPERATOR_NOTIFY` | "Agent Completed" button | System searches canonical verdict file paths (§2.5) → parse | Operator click |
| C | `NATIVE_FILE` | File path input field | System reads file from operator-provided path → parse | Operator input |
| D | `RAW_PASTE` | Textarea submission | System parses operator-pasted text inline | Operator paste |

**Fallback chain (B→C→D):** Mode B attempts file search. If it fails → dashboard shows Mode C + D options. Mode A is independent — not part of the fallback chain.

**Mode B failure definition:**
- File does not exist at any canonical path (§2.5), OR
- File exists but `mtime < runs.started_at` for the current gate (stale file), OR
- File exists but all 3 Ingestion Layers return `verdict=PENDING_REVIEW` (unparseable)

### §2.3 — 3 Ingestion Layers

All modes (B/C/D) run the same 3-layer parsing chain. Mode A provides pre-structured JSON and bypasses the chain.

| Layer | ID | Logic | Output on Success | Confidence |
|-------|----|-------|-------------------|------------|
| IL-1 | `JSON_BLOCK` | Search for `` ```json ... ``` `` block (regex: `r"```json\s*\n(.*?)\n```"`, `re.DOTALL`). `json.loads()`. Validate required fields: `verdict`, `summary`. | Full FeedbackRecord | HIGH |
| IL-2 | `REGEX_EXTRACT` | Extract `verdict:` line, `summary:` line, `BF-NN: description \| evidence: X` lines (regex: `r"(BF[-_\s]?\d+)\s*:?\s*(.*)"`, `re.IGNORECASE`), `route_recommendation:` (regex: `r'route[_\s-]*recommendation\s*[:\-=]\s*([A-Za-z_-]+)'`, `re.IGNORECASE`) | Partial FeedbackRecord | MEDIUM |
| IL-3 | `RAW_DISPLAY` | No extraction attempted. Store full text as `raw_text`. Set `verdict=PENDING_REVIEW`. | FeedbackRecord (raw) | LOW |

**Chain execution:** IL-1 → if fails → IL-2 → if fails → IL-3 (infallible — always produces output).

**Regex reference:** IL-1 JSON block regex derived from v2 `json_enforcer.py:_extract_first_json_block()`. IL-2 BF-NN regex derived from v2 `pipeline.py:_extract_blocking_findings()`. Both adapted for v3 structured output.

### §2.4 — FeedbackRecord Schema

```json
{
  "id":                     "TEXT NOT NULL — ULID",
  "run_id":                 "TEXT NOT NULL — FK → runs",
  "detection_mode":         "TEXT NOT NULL — CANONICAL_AUTO | OPERATOR_NOTIFY | NATIVE_FILE | RAW_PASTE",
  "ingestion_layer":        "TEXT NOT NULL — JSON_BLOCK | REGEX_EXTRACT | RAW_DISPLAY",
  "verdict":                "TEXT NOT NULL — PASS | FAIL | PENDING_REVIEW",
  "summary":                "TEXT NULL",
  "blocking_findings_json":  "TEXT NOT NULL DEFAULT '[]' — JSON array: [{id, description, evidence}]",
  "route_recommendation":   "TEXT NULL — doc | full",
  "raw_text":               "TEXT NULL — populated for IL-3 only",
  "source_path":            "TEXT NULL — file path for Mode B/C",
  "confidence":             "TEXT NOT NULL — HIGH | MEDIUM | LOW",
  "proposed_action":        "TEXT NOT NULL — ADVANCE | FAIL | MANUAL_REVIEW",
  "ingested_at":            "TIMESTAMPTZ NOT NULL DEFAULT NOW()",
  "cleared_at":             "TIMESTAMPTZ NULL — set by POST /feedback/clear"
}
```

**`proposed_action` computation (server-side, after parsing):**

| confidence | verdict | proposed_action |
|---|---|---|
| HIGH | PASS | ADVANCE |
| HIGH | FAIL | FAIL |
| MEDIUM | PASS | ADVANCE |
| MEDIUM | FAIL | FAIL |
| LOW | PENDING_REVIEW | MANUAL_REVIEW |
| any | PENDING_REVIEW | MANUAL_REVIEW |

### §2.5 — Canonical Verdict File Paths (Mode B)

Search in order (stop at first match):

```
_COMMUNICATION/team_{assignment.team_id}/{wp_id}_VERDICT.md
_COMMUNICATION/team_{assignment.team_id}/{wp_id_underscored}_VERDICT.md
_COMMUNICATION/team_{assignment.team_id}/{wp_id}_GATE_{gate_id}_*.md
_COMMUNICATION/team_{assignment.team_id}/{wp_id}_COMPLETION_*.md
_COMMUNICATION/team_{assignment.team_id}/{wp_id}_GATE_{gate_id}_DECISION*.md
```

**Underscore interop:** `S003-P002-WP001` ↔ `S003_P002_WP001` — check both variants for each pattern. Consistent with v2 `pipeline.py:_verdict_candidates()` which applies `wp.replace("-", "_")`.

**Source values:** `wp_id` from `runs.work_package_id`; `assignment.team_id` from current actor via `GET /api/state`; `gate_id` from `runs.current_gate_id`.

---

## §3 — Operator Handoff UI (adds §6.1.D to Pipeline View)

### §3.1 — Layout & Visibility

**Section name:** `OPERATOR HANDOFF`
**Position:** Between ASSEMBLED PROMPT (§6.1.A) and ACTIONS section.
**Visibility:** Displayed when `status ∈ {IN_PROGRESS, CORRECTION, PAUSED}`. Hidden when `status ∈ {IDLE, COMPLETE}`.

### §3.2 — Sub-section A: PREVIOUS

Renders the `previous_event` field from `GET /api/state` response (§10.7).

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

**Data source:** `GET /api/state` → `previous_event` object.
**Fields:** event_type (badge colored by type), occurred_at (relative + absolute tooltip), actor_team_id (team label), gate_id/phase_id, verdict, reason.
**Empty state:** When `previous_event` is null (run just started): "No events recorded yet for this run."

### §3.3 — Sub-section B: NEXT

Renders `next_action` from `GET /api/state` response. Server-computed, dashboard renders only (AD-S8B-09).

**AWAIT_FEEDBACK state** (IN_PROGRESS, no pending feedback):

```
NEXT
──────────────────────────────────────────────────────────────────
Awaiting agent completion for: team_90 · GATE_3 / phase_3_1

[ Agent Completed ]    [ Provide File Path ]    [ Paste Feedback ]
```

**CONFIRM_ADVANCE state** (feedback ingested, verdict=PASS):

```
NEXT
──────────────────────────────────────────────────────────────────
Feedback ingested — PASS confirmed (confidence: HIGH)
↳ Advance to GATE_4 / phase_4_1 · actor: team_21

[ ✓ Confirm Advance ]   [ Clear & Re-ingest ]
```

**CONFIRM_FAIL state** (feedback ingested, verdict=FAIL):

```
NEXT
──────────────────────────────────────────────────────────────────
Feedback ingested — FAIL (confidence: HIGH · 2 blocking findings)
↳ Fail GATE_3 · route: doc

  • BF-01: Template not found for GATE_3/phase_3_1 | evidence: builder.py:143
  • BF-02: Routing gap — no match for agents_os / TRACK_FOCUSED

[ ✗ Confirm Fail ]   [ Clear & Re-ingest ]
```

**MANUAL_REVIEW state** (IL-3 / PENDING_REVIEW):

```
NEXT
──────────────────────────────────────────────────────────────────
⚠️ Low confidence (IL-3 raw). Manual verdict required:

[ ✓ Mark PASS ]   [ ✗ Mark FAIL ]

Reason: [______________________________________] (required for FAIL)
```

**HUMAN_APPROVE state** (HITL gate, `is_human_gate=1`):

```
NEXT
──────────────────────────────────────────────────────────────────
Human gate — your approval required.
Actor: team_00 · GATE_4 UX review

[ ✓ APPROVE ]
```

**RESUME state** (PAUSED):

```
NEXT
──────────────────────────────────────────────────────────────────
Run is paused.

[ ▶ Resume Run ]
```

### §3.4 — Sub-section C: CLI COMMAND

Renders a pre-built curl command ready to copy-paste.

```
CLI COMMAND                                        [ Copy CLI ]
──────────────────────────────────────────────────────────────────
curl -X POST http://localhost:8082/api/v1/runs/01JQX.../advance \
  -H "X-API-Key: {actor_api_key_placeholder}" \
  -H "Content-Type: application/json" \
  -d '{
    "verdict": "PASS",
    "summary": "Team 90 advisory — AD-S6-07 token threshold, non-blocking"
  }'
```

**Source:** `next_action.cli_command` from `GET /api/state` response — server-computed, pre-filled where possible.
**Copy CLI button:** Copies the full command to clipboard with toast notification.

**CLI content per next_action.type:**

| next_action.type | CLI command content |
|---|---|
| AWAIT_FEEDBACK | `POST /api/runs/{run_id}/feedback` (Mode B trigger) |
| CONFIRM_ADVANCE | `POST /api/runs/{run_id}/advance` with pre-filled summary |
| CONFIRM_FAIL | `POST /api/runs/{run_id}/fail` with pre-filled reason + route |
| MANUAL_REVIEW | `POST /api/runs/{run_id}/advance` or `/fail` skeleton |
| HUMAN_APPROVE | `POST /api/runs/{run_id}/approve` |
| RESUME | `POST /api/runs/{run_id}/resume` |

---

## §4 — Verdict/Reason Input Forms (adds §6.1.E to Pipeline View)

### §4.1 — Pre-filled from FeedbackRecord

When `pending_feedback.has_pending = true`, Advance/Fail forms are pre-filled:

**ADVANCE form (pre-filled):**

```
Confirm Advance → GATE_4 / phase_4_1
──────────────────────────────────────
Summary:  [Team 90 QA review complete — 0 blockers     ]  (editable)
Verdict:  [PASS ▼]  (locked if from CANONICAL_AUTO / JSON_BLOCK)

                            [ Cancel ]  [ Confirm Advance → ]
```

**FAIL form (pre-filled):**

```
Confirm Fail — GATE_3
──────────────────────────────────────
Blocking findings from ingestion (2):
  • BF-01: Template not found for GATE_3/phase_3_1 | evidence: builder.py:143
  • BF-02: Routing gap — no match for domain agents_os, variant TRACK_FOCUSED

Reason:  [2 blocking findings — template gap + routing rule     ]  (editable)
Route:   [doc ▼]  (doc / full — pre-filled from route_recommendation)

                            [ Cancel ]  [ Confirm Fail → ]
```

### §4.2 — Manual (no feedback ingested)

**ADVANCE button** (expand-on-click inline):

```
[ Advance Gate ↓ ]
  ↓ expands inline:
Summary (optional): [_________________________________]
                                    [ Confirm Advance ]
```

**FAIL button** (expand-on-click inline):

```
[ Fail Gate ↓ ]
  ↓ expands inline:
Reason* (required): [_________________________________]
Route:              [doc ▼]
                                      [ Confirm Fail ]
```

**Validation:** ADVANCE summary = optional. FAIL reason = required (validated server-side; `MISSING_REASON` (400) when empty — AD-S8B-08).

---

## §5 — CORRECTION Blocking Findings Display (adds §6.1.F to Pipeline View)

When `status = CORRECTION`, display this section **above** OPERATOR HANDOFF:

```
CORRECTION IN PROGRESS                           cycle 2 of 3
──────────────────────────────────────────────────────────────────
Last GATE_FAILED_BLOCKING:
  2026-03-26T09:12:00Z · GATE_3 / phase_3_1 · team_90

  • BF-01: Template not found for GATE_3/phase_3_1 | evidence: builder.py:143
  • BF-02: Routing gap — no match for agents_os / TRACK_FOCUSED

assigned_team:           team_21 — AOS Backend
correction_cycle_count:  2
max_correction_cycles:   3   (policy: max_correction_cycles)
```

**Data source:** `GET /api/history?run_id={run_id}&event_type=GATE_FAILED_BLOCKING&limit=1`
**Extract from:** `events.payload_json → blocking_findings[]` (if present in payload), `events.reason`, `events.gate_id`, `events.occurred_at`, `events.actor_team_id`.
**`max_correction_cycles` source:** `GET /api/config/policies?key=max_correction_cycles` (existing policy endpoint from Stage 6).

---

## §6 — SSE Stream (Event-Driven Architecture)

### §6.1 — Decision

S003-P011 WP003 (LOD200, 2026-03-19) planned SSE push for the dashboard. It was deferred but not cancelled. In v3, SSE is included in the BUILD phase — not optional, not deferred. (AD-S8B-04.)

### §6.2 — SSE Endpoint Contract

See §10.4 for the full `GET /api/events/stream` contract.

**Event types pushed via SSE:**

| SSE event name | Data shape | Trigger |
|---|---|---|
| `pipeline_event` | `{event_id, event_type, run_id, occurred_at, gate_id, phase_id, actor_team_id, verdict, reason}` | Every INSERT into `events` table (all 15 Stage 7 event types) |
| `run_state_changed` | `{run_id, new_status, previous_status, occurred_at}` | Every `runs.status` change |
| `feedback_ingested` | `{run_id, feedback_id, verdict, confidence, proposed_action}` | Every successful `POST /api/runs/{run_id}/feedback` |
| `heartbeat` | `{ts}` | Every 30 seconds |

**`feedback_ingested` is SSE-only:** It is NOT one of the 15 `events` table event types (Stage 7 §1). It is a system notification pushed via SSE, not persisted to the `events` table. (See §15 impact analysis.)

### §6.3 — Dashboard Subscription

**Pipeline View** connects to SSE after page load:

```javascript
const evtSource = new EventSource('/api/events/stream?run_id={run_id}');

evtSource.addEventListener('pipeline_event', (e) => {
    const evt = JSON.parse(e.data);
    updatePreviousEventSection(evt);
    if (isStateChangingEvent(evt.event_type)) refreshState();
});

evtSource.addEventListener('run_state_changed', (e) => {
    refreshState();
});

evtSource.addEventListener('feedback_ingested', (e) => {
    refreshState();
});
```

**History View** also subscribes (updates event log in real-time).

**Polling fallback:** If SSE connection fails (network error) → fallback to polling `GET /api/state` every 15 seconds. Dashboard shows indicator: green dot = SSE connected, grey dot = polling mode.

### §6.4 — Server Implementation

**Module:** `audit/sse.py` (new module — see §12 for interface contract).

**Integration point:** `state/machine.py` calls `broadcaster.broadcast(event)` **after** `db.commit()`, not inside the transaction. (AD-S7-01: DB atomicity concerns DB only. SSE is fire-and-forget post-commit — AD-S8B-10.)

**Implementation:** Python `asyncio.Queue` per subscriber + FastAPI `StreamingResponse`. No external message broker required for v3.0 (AD-S8B-04).

---

## §7 — Teams Engine Edit (amends §6.4 of UI Spec Amendment v1.0.2)

In the Context Generator (§6.4.3 of v1.0.2), Layer 1 section, add an engine editor:

```
engine:   [ cursor ▼ ]   [ Save ]
          (options from Entity Dict v2.0.2 teams.engine enum)
```

**Valid engine values (Entity Dict v2.0.2 SSOT):** `cursor`, `cursor_composer`, `claude`, `claude_code`, `codex`, `openai`, `human`, `orchestrator`.

**Behavior:** `PUT /api/teams/{team_id}/engine` (§10.3). On success → toast: "Engine updated: team_21 → claude_code".
**Authorization:** team_00 only. Non-team_00 users see engine as read-only text. (AD-S8B-06: engine = runtime attribute, DB SSOT. `definition.yaml` is NOT SSOT for engine.)

---

## §8 — History Analytics (amends §6.2 of Module Map v1.0.1)

### §8.1 — Repositioning

History page = **Observability Analytics** (AD-S8B-07). Additive — existing event log table remains unchanged.

### §8.2 — New Additions

**Run Selector (header):**

```
Run:  [ 01JQX...BCDE · S003-P002-WP001 · IN_PROGRESS ▼ ]    [ Apply ]
```

Source: `GET /api/runs` — populated with recent runs. "Apply" re-queries history for the selected run.

**Event Timeline (new section above event log — mock in UI):**

```
GATE_0 ─── GATE_1 ─── GATE_2 ─── GATE_3 ──▶ (current)
  ✓ RUN_INITIATED  ✓ GATE_PASSED  ✓ GATE_PASSED  ✗ GATE_FAILED  ↻ CORRECTION
  team_11           team_21         team_61         team_90         team_21
```

Source (for BUILD): `GET /api/history?run_id={run_id}&order=asc` → client renders timeline from events.

**run_id filter field:**

```
Run ID: [ _________________________ ]
```

Pre-filled when navigating from Portfolio "View History" button (`/history?run_id=...`).

**Note (SSOT correction):** `run_id` is already a query parameter on `GET /api/history` (Module Map v1.0.1 §4.10). Stage 8B adds the **UI input field** and the Portfolio deep-link behavior, not the API parameter itself.

---

## §9 — Stage 8A Entity Amendments (Team 00 Additions)

### §9.1 — Ideas: `domain_id` + `idea_type` Fields

Stage 8A (v1.0.2) defined the `ideas` entity with fields: `id`, `title`, `description`, `status`, `priority`, `submitted_by`, `submitted_at`, `decision_notes`, `target_program_id`, `updated_at`.

Stage 8B adds two required fields:

**`domain_id` (TEXT NOT NULL, FK → domains.id):** Every idea must be scoped to a domain. This enables domain-level filtering in the Ideas Pipeline and ensures ideas are actionable within a specific operational context.

**`idea_type` (TEXT NOT NULL):** Classifies the idea by nature. Enum values:

| Value | Meaning |
|---|---|
| `BUG` | Defect or regression |
| `FEATURE` | New capability |
| `IMPROVEMENT` | Enhancement to existing capability |
| `TECH_DEBT` | Technical debt remediation |
| `RESEARCH` | Exploratory investigation |

**DDL amendment:** See §13.2 for the updated `ideas` DDL.

**API amendments:** See §10.8, §10.9, §10.10 for `POST /api/ideas`, `GET /api/ideas`, `PUT /api/ideas` changes.

**UI amendments:**

**New Idea modal (amends §6.5.5 of v1.0.2):**

| Field | HTML Type | Required |
|---|---|---|
| title | `<input type="text">` | YES |
| description | `<textarea>` | NO |
| domain_id | `<select>` (populated from domains list) | YES |
| idea_type | `<select>` (BUG / FEATURE / IMPROVEMENT / TECH_DEBT / RESEARCH) | YES (default: FEATURE) |
| priority | `<select>` (LOW / MEDIUM / HIGH / CRITICAL) | YES (default: MEDIUM) |

**Edit Idea modal:** Same additions — `domain_id` and `idea_type` are editable.

**Ideas Pipeline tab (amends §6.5.5 columns):** Add `domain_id` and `idea_type` columns with badges:

| Column | Display |
|---|---|
| domain_id | Text |
| idea_type | Badge: BUG (danger), FEATURE (accent), IMPROVEMENT (info), TECH_DEBT (warning), RESEARCH (text-muted) |

### §9.2 — Work Package Detail Modal

**New UI element (amends §6.5.4 of v1.0.2):** Clicking a WP row opens a detail modal.

**Modal content:**

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

**Data source:** `GET /api/work-packages/{wp_id}` (§10.5) — returns WP with joined run data.

**Navigation:**
- `[View Pipeline]` → navigates to Pipeline View (`/`) filtered to the WP's domain_id
- `[View History]` → navigates to History View (`/history?run_id={linked_run_id}`) — visible only when `linked_run_id` is present

### §9.3 — Portfolio Gate Organization (gate = milestone)

**Architectural Decision (AD-S8B-11):** In AOS v3, a **gate** is semantically equivalent to a **milestone** in project management. Gates represent sequential quality checkpoints that a run must pass. The Portfolio view organizes runs by their current gate position.

**Gate filter (above all tabs):**

```
Milestone (Gate):  [ All Gates ▼ ]    [ Apply ]
                   (GATE_0 / GATE_1 / GATE_2 / GATE_3 / GATE_4 / GATE_5)
```

Source: static gate list from `definition.yaml` or `GET /api/teams` (gates are seeded at boot).

**Active Runs tab (amends §6.5.2):** Add `current_gate_id` as a visible column. When gate filter is applied, show only runs at that gate.

| Column | Source | Display |
|---|---|---|
| current_gate | runs.current_gate_id | Badge with gate name |

**Completed Runs tab (amends §6.5.3):** Add `gates_completed` summary column showing total gates passed and total correction cycles.

| Column | Source | Display |
|---|---|---|
| gates_completed | runs.gates_completed_json | "5/5 gates · 2 corrections" |

**Work Packages tab (amends §6.5.4):** Add `current_gate` column showing the linked run's current gate (or "Not Started" / "Complete").

| Column | Source | Display |
|---|---|---|
| current_gate | linked run's current_gate_id | Gate badge or "—" if no linked run |

---

## §10 — API Endpoint Contracts

### §10.1 — POST /api/runs/{run_id}/feedback (new §4.19)

**Purpose:** Trigger Feedback Ingestion for a run. Operator-initiated modes only (B/C/D).

**Request:**

```json
{
  "detection_mode": "OPERATOR_NOTIFY | NATIVE_FILE | RAW_PASTE",
  "file_path":      "string | null — required for NATIVE_FILE",
  "raw_text":       "string | null — required for RAW_PASTE"
}
```

Note: `CANONICAL_AUTO` is NOT triggered via this endpoint — it uses `POST /api/runs/{run_id}/advance` with `feedback_json` field (§10.6).

**Response 200:**

```json
{
  "feedback_record":   { ...FeedbackRecord (§2.4)... },
  "fallback_required": "boolean — true if Mode B found no file (show C+D options)",
  "next_action":       { "type": "...", "label": "...", "target_gate": "...", "blocking_count": "..." }
}
```

**Errors:**

| Code | HTTP | Condition |
|------|------|-----------|
| `INVALID_STATE` | 409 | `run.status ∉ {IN_PROGRESS, CORRECTION}` |
| `RUN_NOT_FOUND` | 404 | run_id not found |
| `FILE_NOT_FOUND` | 404 | Mode NATIVE_FILE: file_path does not exist |
| `INGESTION_FAILED` | 422 | All 3 layers produced no output (defensive — IL-3 is infallible) |
| `FEEDBACK_ALREADY_INGESTED` | 409 | Pending FeedbackRecord exists (`cleared_at IS NULL`) — idempotency guard |

**Delegate chain:** `api.py` → `management/use_cases.py:ingest_feedback()` (UC-15) → `audit/ingestion.py:FeedbackIngestor.ingest()`

### §10.2 — POST /api/runs/{run_id}/feedback/clear (new §4.20)

**Purpose:** Clear a pending FeedbackRecord so operator can re-ingest.

**Request:** No body.
**Response 200:** `{ "cleared": true, "cleared_at": "ISO-8601" }`

**Errors:**

| Code | HTTP | Condition |
|------|------|-----------|
| `RUN_NOT_FOUND` | 404 | run_id not found |
| `NO_PENDING_FEEDBACK` | 404 | No pending FeedbackRecord to clear |

### §10.3 — PUT /api/teams/{team_id}/engine (new §4.21)

**Purpose:** Update the engine of a team. team_00 only.

**Request:**

```json
{
  "engine": "string — must be in Entity Dict v2.0.2 teams.engine enum"
}
```

**Response 200:**

```json
{
  "team_id":    "string",
  "engine":     "string",
  "updated_at": "ISO-8601"
}
```

**Errors:**

| Code | HTTP | Condition |
|------|------|-----------|
| `INVALID_ENGINE` | 400 | engine value not in valid set |
| `INSUFFICIENT_AUTHORITY` | 403 | caller lacks required authority tier (Tier 1 — AUTHORITY_MODEL v1.0.0 §3) |
| `TEAM_NOT_FOUND` | 404 | team_id not found |

### §10.4 — GET /api/events/stream (new §4.22 — SSE)

**Purpose:** Server-Sent Events stream for real-time event notification.

**Query params:**
- `run_id` (optional): filter to specific run
- `domain_id` (optional): filter to domain

**Response:** `Content-Type: text/event-stream`

```
event: pipeline_event
data: {"event_id":"01JQX...","event_type":"GATE_PASSED","run_id":"...","occurred_at":"..."}

event: heartbeat
data: {"ts":"2026-03-27T14:30:00Z"}

event: run_state_changed
data: {"run_id":"...","new_status":"CORRECTION","previous_status":"IN_PROGRESS"}

event: feedback_ingested
data: {"run_id":"...","feedback_id":"...","verdict":"PASS","confidence":"HIGH","proposed_action":"ADVANCE"}
```

**Error handling:** SSE connection drops → client retries with `EventSource` default backoff. Server does not store undelivered events (no guaranteed delivery — polling fallback handles gaps).

### §10.5 — GET /api/work-packages/{wp_id} (new §4.23)

**Purpose:** Returns a single work package with extended data including linked run details.

**Response 200:**

```json
{
  "wp_id":          "string",
  "label":          "string",
  "domain_id":      "string",
  "status":         "PLANNED | ACTIVE | COMPLETE | CANCELLED",
  "linked_run_id":  "string | null",
  "created_at":     "ISO-8601",
  "updated_at":     "ISO-8601",
  "linked_run":     {
    "run_id":                "string",
    "status":                "string",
    "current_gate_id":       "string | null",
    "current_phase_id":      "string | null",
    "current_actor_team_id": "string | null",
    "current_actor_label":   "string | null",
    "started_at":            "ISO-8601",
    "completed_at":          "ISO-8601 | null",
    "correction_cycle_count": "integer"
  } | null
}
```

**Errors:**

| Code | HTTP | Condition |
|------|------|-----------|
| `WP_NOT_FOUND` | 404 | wp_id not found |

**Logic:** `linked_run` is populated by joining `runs` where `work_package_id = wp.id AND status IN ('IN_PROGRESS', 'CORRECTION', 'PAUSED')`. If no active run, also check for `COMPLETE` runs (most recent). `null` if no run ever linked.

### §10.6 — POST /api/runs/{run_id}/advance (amends Module Map §4.2)

**Changes from Module Map v1.0.1:**

1. **Rename `notes` → `summary`** (Team 00 confirmed): The `notes` field is renamed to `summary` for semantic consistency with FeedbackRecord.summary.

2. **Add `feedback_json` field** for CANONICAL_AUTO (Mode A):

**Updated request:**

```json
{
  "actor_team_id": "string — required; teams.id",
  "summary":       "string | null — optional (renamed from notes)",
  "feedback_json": "object | null — optional; Mode A agent-provided structured verdict"
}
```

**`feedback_json` behavior:** If present, system ingests it as Detection Mode A before executing the state transition. Bypasses file search. Must contain at minimum `verdict` and `summary` fields. Stored as FeedbackRecord with `detection_mode=CANONICAL_AUTO`, `ingestion_layer=JSON_BLOCK`, `confidence=HIGH`.

**`summary` default:** If `pending_feedback` exists for this run and `summary` is not provided in the request, defaults to `feedback_record.summary`.

**Response and errors:** Unchanged from Module Map v1.0.1 §4.2.

### §10.7 — GET /api/state (amends Module Map §4.9)

**Adds 3 new fields + `cli_command` to response:**

```json
{
  "...existing 15 fields from Module Map v1.0.1 §4.9...",

  "previous_event": {
    "event_type":    "string | null",
    "occurred_at":   "ISO-8601 | null",
    "actor_team_id": "string | null",
    "gate_id":       "string | null",
    "phase_id":      "string | null",
    "verdict":       "string | null",
    "reason":        "string | null"
  },

  "pending_feedback": {
    "has_pending":     "boolean",
    "feedback_id":     "string | null — ULID",
    "verdict":         "string | null — PASS | FAIL | PENDING_REVIEW",
    "confidence":      "string | null — HIGH | MEDIUM | LOW",
    "proposed_action": "string | null — ADVANCE | FAIL | MANUAL_REVIEW",
    "ingested_at":     "ISO-8601 | null"
  },

  "next_action": {
    "type":           "AWAIT_FEEDBACK | CONFIRM_ADVANCE | CONFIRM_FAIL | MANUAL_REVIEW | HUMAN_APPROVE | RESUME | IDLE",
    "label":          "string — human-readable operator instruction",
    "target_gate":    "string | null",
    "target_phase":   "string | null",
    "blocking_count": "integer | null",
    "cli_command":    "string | null — full curl command string, pre-filled where possible"
  }
}
```

**`previous_event` source:** `SELECT ... FROM events WHERE run_id=:run_id ORDER BY sequence_no DESC LIMIT 1`

**`next_action` computation (server-side, AD-S8B-09):**

| Run Status | has_pending | verdict | is_human_gate | next_action.type |
|---|---|---|---|---|
| IDLE | — | — | — | IDLE |
| IN_PROGRESS | false | — | false | AWAIT_FEEDBACK |
| IN_PROGRESS | true | PASS | — | CONFIRM_ADVANCE |
| IN_PROGRESS | true | FAIL | — | CONFIRM_FAIL |
| IN_PROGRESS | true | PENDING_REVIEW | — | MANUAL_REVIEW |
| IN_PROGRESS | — | — | true | HUMAN_APPROVE |
| PAUSED | — | — | — | RESUME |
| COMPLETE | — | — | — | IDLE |
| CORRECTION | true | PASS | — | CONFIRM_ADVANCE |
| CORRECTION | true | FAIL | — | CONFIRM_FAIL |
| CORRECTION | true | PENDING_REVIEW | — | MANUAL_REVIEW |
| CORRECTION | false | — | — | AWAIT_FEEDBACK |

**Query params and existing fields:** Unchanged from Module Map v1.0.1 §4.9.

### §10.8 — POST /api/ideas (amends UI Spec Amendment §4.17)

**Adds `domain_id` and `idea_type` to request:**

```json
{
  "title":       "string — required",
  "description": "string | null — optional",
  "domain_id":   "string — required; FK → domains.id",
  "idea_type":   "string — required; ∈ {BUG, FEATURE, IMPROVEMENT, TECH_DEBT, RESEARCH}",
  "priority":    "string — required; ∈ {LOW, MEDIUM, HIGH, CRITICAL}"
}
```

**Response 201:** Updated to include `domain_id` and `idea_type` in the returned idea object.

**Additional errors:**

| Code | HTTP | Condition |
|------|------|-----------|
| `DOMAIN_INACTIVE` | 400 | domain_id not found or domain is inactive (reused from UC-01) |
| `INVALID_IDEA_TYPE` | 400 | idea_type not in valid enum set |

### §10.9 — GET /api/ideas (amends UI Spec Amendment §4.16)

**Adds query params:**
- `domain_id`: filter by domain (exact match)
- `idea_type`: filter by type (exact match)

**Response:** Each idea item now includes `domain_id` and `idea_type` fields.

### §10.10 — PUT /api/ideas/{idea_id} (amends UI Spec Amendment §4.18)

**Adds optional fields:**

```json
{
  "...existing fields...",
  "domain_id":  "string | null — optional update",
  "idea_type":  "string | null — optional update; ∈ {BUG, FEATURE, IMPROVEMENT, TECH_DEBT, RESEARCH}"
}
```

**Additional errors:** `INVALID_IDEA_TYPE` (400), `DOMAIN_INACTIVE` (400) — same as §10.8.

### §10.11 — SSOT Corrections (confirmation, not amendments)

**POST /api/runs/{run_id}/fail (Module Map §4.3):** The `reason` field is confirmed as **already required** in Module Map v1.0.1 §4.3 (`reason: string — required`, error: `MISSING_REASON (400)`). Stage 8B does not amend this endpoint — it confirms the existing behavior (AD-S8B-08).

**GET /api/history (Module Map §4.10):** The `run_id` query parameter is confirmed as **already present** in Module Map v1.0.1 §4.10. Stage 8B adds the UI input field (§8.2) and Portfolio deep-link behavior, not the API parameter.

---

## §11 — New Error Codes Registry (Stage 8B)

| Code | HTTP | Endpoint | Semantic |
|---|---|---|---|
| `FILE_NOT_FOUND` | 404 | POST /feedback | Mode NATIVE_FILE: file_path does not exist |
| `INGESTION_FAILED` | 422 | POST /feedback | All 3 ingestion layers failed (defensive — IL-3 is infallible) |
| `FEEDBACK_ALREADY_INGESTED` | 409 | POST /feedback | Pending FeedbackRecord exists (cleared_at IS NULL) |
| `INVALID_ENGINE` | 400 | PUT /teams/engine | Engine value not in Entity Dict v2.0.2 valid set |
| `NO_PENDING_FEEDBACK` | 404 | POST /feedback/clear | No pending FeedbackRecord to clear |
| `INVALID_IDEA_TYPE` | 400 | POST /ideas, PUT /ideas | idea_type not in valid enum set |
| `WP_NOT_FOUND` | 404 | GET /work-packages/{wp_id} | Work package ID not found in work_packages table |
| `TEAM_NOT_FOUND` | 404 | PUT /teams/engine | team_id not found in teams table |

**Reused (not new):** `MISSING_REASON` (Stage 7 §6.1), `DOMAIN_INACTIVE` (Stage 7 §6.1), `RUN_NOT_FOUND` (Stage 7 §6.1), `INSUFFICIENT_AUTHORITY` (Stage 7 §6.1 — absorbs prior `NOT_PRINCIPAL` per AUTHORITY_MODEL v1.0.0 §8), `INVALID_STATE` (Stage 7 §6.1).

**Updated total:** 40 (Stage 8A corrected: 38 Stage 7 base + 2 net new Stage 8A) + 8 (Stage 8B) = **48 total unique error codes**.

---

## §12 — New Module Specs

### §12.1 — audit/ingestion.py

Extends `agents_os_v3/modules/audit/` (currently contains only `ledger.py`).

```python
class FeedbackIngestor:
    """
    3-layer Feedback Ingestion Pipeline.
    Implements IL-1 (JSON_BLOCK), IL-2 (REGEX_EXTRACT), IL-3 (RAW_DISPLAY).
    All parsing server-side — never in client/dashboard (AD-S8B-01).
    """

    def ingest(self, source: IngestSource) -> FeedbackRecord:
        """
        Try IL-1 → IL-2 → IL-3.
        Always returns a FeedbackRecord (IL-3 is infallible).
        Sets proposed_action based on confidence + verdict.
        """
        ...

    def _try_json_block(self, text: str) -> Optional[dict]:
        """IL-1: Extract ```json ... ``` block, json.loads(), validate schema.
        Regex: r'```json\\s*\\n(.*?)\\n```' (re.DOTALL)
        Required fields: verdict, summary.
        Returns parsed dict or None on failure."""
        ...

    def _try_regex_extract(self, text: str) -> Optional[dict]:
        """IL-2: Extract verdict, summary, BF-NN lines, route_recommendation via regex.
        BF regex: r'(BF[-_\\s]?\\d+)\\s*:?\\s*(.*)' (re.IGNORECASE)
        Route regex: r'route[_\\s-]*recommendation\\s*[:\\-=]\\s*([A-Za-z_-]+)' (re.IGNORECASE)
        Returns partial dict or None on failure."""
        ...

    def _raw_display(self, text: str) -> FeedbackRecord:
        """IL-3: Infallible fallback. verdict=PENDING_REVIEW, confidence=LOW."""
        ...

    def _find_canonical_file(self, team_id: str, wp_id: str,
                              gate_id: str) -> Optional[Path]:
        """Mode B: Search canonical verdict file paths (§2.5) with hyphen/underscore interop.
        Applies: wp_id.replace('-', '_') for underscore variant."""
        ...


@dataclass
class IngestSource:
    detection_mode: str          # OPERATOR_NOTIFY | NATIVE_FILE | RAW_PASTE
    run_id: str
    gate_id: str
    team_id: str
    wp_id: str
    file_path: Optional[str]     # NATIVE_FILE only
    raw_text: Optional[str]      # RAW_PASTE only
```

**Integration:** `management/use_cases.py:ingest_feedback()` (UC-15) → `FeedbackIngestor.ingest()` → store result to `pending_feedbacks` table.

### §12.2 — audit/sse.py

```python
class SSEBroadcaster:
    """
    Thread-safe event broadcaster for SSE connections.
    Implementation: asyncio.Queue per subscriber.
    No external broker required for v3.0 (AD-S8B-04).
    """

    async def broadcast(self, event: EventRecord) -> None:
        """
        Called by machine.py after every successful event INSERT (AD-S7-01).
        Must be called AFTER transaction commit — not inside TX (AD-S8B-10).
        Broadcasts to all matching subscribers (filtered by run_id/domain_id).
        """
        ...

    async def broadcast_run_state_changed(self, run_id: str,
                                           new_status: str,
                                           previous_status: str) -> None:
        """Broadcast run_state_changed SSE event."""
        ...

    async def broadcast_feedback_ingested(self, feedback: FeedbackRecord) -> None:
        """Broadcast feedback_ingested SSE event (SSE-only, not persisted)."""
        ...

    async def subscribe(self, run_id: Optional[str],
                        domain_id: Optional[str]) -> AsyncIterator[str]:
        """Returns async generator of SSE-formatted strings for FastAPI StreamingResponse."""
        ...
```

### §12.3 — Updated Directory Structure

Amends Module Map v1.0.1 §1:

```
agents_os_v3/modules/audit/
├── __init__.py
├── ledger.py          # Stage 7 | append_event(), query_events()
├── ingestion.py       # Stage 8B | FeedbackIngestor — 3-layer parsing pipeline
└── sse.py             # Stage 8B | SSEBroadcaster — event-driven SSE push
```

### §12.4 — UC-15: FeedbackIngestion (new use case)

**Decision:** `ingest_feedback` is formalized as **UC-15** (next available after UC-14 in Use Case Catalog v1.0.3). It is a use case — not an admin-only operation — because it has defined preconditions, guards, inputs, outputs, and postconditions.

**UC-15 summary:**

| Field | Value |
|---|---|
| Name | FeedbackIngestion |
| SM Reference | None (no state transition — side-channel operation) |
| Actor | operator (team_00) or pipeline_engine (Mode A) |
| Precondition | `run.status ∈ {IN_PROGRESS, CORRECTION}` |
| Input | detection_mode, file_path (Mode C), raw_text (Mode D) |
| Output | FeedbackRecord stored in `pending_feedbacks` |
| Postcondition | `pending_feedbacks` row with `cleared_at IS NULL` for run_id |

**Note:** UC-15 does NOT cause a state transition. `pending_feedback` is NOT a RunStatus (State Machine v1.0.2 §1 — 5 states only). Feedback ingestion is a side-channel that produces data consumed by the operator's subsequent advance/fail action.

**OQ-S3-02 status:** OQ-S3-02 (admin operations) remains open — full closure requires formal cataloging of template/policy management UCs, deferred per OQ-S7-01.

---

## §13 — DDL Additions

### §13.1 — `pending_feedbacks` table (new)

```sql
CREATE TABLE pending_feedbacks (
    id                    TEXT NOT NULL,
    run_id                TEXT NOT NULL,
    detection_mode        TEXT NOT NULL,
    ingestion_layer       TEXT NOT NULL,
    verdict               TEXT NOT NULL,
    summary               TEXT,
    blocking_findings_json TEXT NOT NULL DEFAULT '[]',
    route_recommendation  TEXT,
    raw_text              TEXT,
    source_path           TEXT,
    confidence            TEXT NOT NULL,
    proposed_action       TEXT NOT NULL,
    ingested_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cleared_at            TIMESTAMPTZ,
    CONSTRAINT pk_pending_feedbacks PRIMARY KEY (id),
    CONSTRAINT fk_pf_run FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE,
    CONSTRAINT chk_pf_verdict CHECK (verdict IN ('PASS','FAIL','PENDING_REVIEW')),
    CONSTRAINT chk_pf_confidence CHECK (confidence IN ('HIGH','MEDIUM','LOW')),
    CONSTRAINT chk_pf_detection_mode CHECK (detection_mode IN (
        'CANONICAL_AUTO','OPERATOR_NOTIFY','NATIVE_FILE','RAW_PASTE'
    )),
    CONSTRAINT chk_pf_ingestion_layer CHECK (ingestion_layer IN (
        'JSON_BLOCK','REGEX_EXTRACT','RAW_DISPLAY'
    )),
    CONSTRAINT chk_pf_proposed_action CHECK (proposed_action IN (
        'ADVANCE','FAIL','MANUAL_REVIEW'
    ))
);

CREATE INDEX idx_pf_run_id ON pending_feedbacks(run_id);
CREATE INDEX idx_pf_ingested_at ON pending_feedbacks(ingested_at);
```

### §13.2 — `ideas` table amendment

Amends Stage 8A v1.0.2 §10.1. Adds `domain_id` and `idea_type` columns:

```sql
CREATE TABLE ideas (
    id                TEXT NOT NULL,
    title             TEXT NOT NULL,
    description       TEXT,
    domain_id         TEXT NOT NULL,
    idea_type         TEXT NOT NULL DEFAULT 'FEATURE',
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
    CONSTRAINT fk_ideas_domain FOREIGN KEY (domain_id)
        REFERENCES domains(id) ON DELETE RESTRICT,
    CONSTRAINT chk_ideas_status CHECK (status IN (
        'NEW', 'EVALUATING', 'APPROVED', 'DEFERRED', 'REJECTED'
    )),
    CONSTRAINT chk_ideas_priority CHECK (priority IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    )),
    CONSTRAINT chk_ideas_type CHECK (idea_type IN (
        'BUG', 'FEATURE', 'IMPROVEMENT', 'TECH_DEBT', 'RESEARCH'
    ))
);

CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_priority ON ideas(priority);
CREATE INDEX idx_ideas_domain ON ideas(domain_id);
CREATE INDEX idx_ideas_type ON ideas(idea_type);
```

**DDL coordination note:** Team 111 is responsible for DDL v1.0.2 which includes:
1. DDL-ERRATA-01 (partial unique index on templates)
2. Stage 8A `work_packages` table (unchanged from v1.0.2 §10.2)
3. Stage 8B `ideas` table (this amended version supersedes v1.0.2 §10.1)
4. Stage 8B `pending_feedbacks` table (§13.1)

---

## §14 — Architectural Decisions (Stage 8B)

| AD ID | Decision | Locked In | Rationale |
|-------|----------|-----------|-----------|
| **AD-S8B-01** | FIP = 4 Detection Modes × 3 Ingestion Layers. All parsing server-side. Dashboard = consumer only. | §2 | Team 101 Iron Rule (2026-03-24): dashboard must not parse markdown or compute routing. |
| **AD-S8B-02** | FeedbackRecord = canonical output of FIP. Stored in `pending_feedbacks` table. Pre-fills Advance/Fail forms. | §2.4 | Single source of truth for feedback state — prevents dual-path bugs between API and UI. |
| **AD-S8B-03** | Mode B canonical path search follows v2 `_verdict_candidates()` pattern with hyphen/underscore interop. | §2.5 | Backward compatibility with v2 verdict file conventions. Consistent migration path. |
| **AD-S8B-04** | SSE Stream included in BUILD phase. Polling fallback (15s) when SSE unavailable. No external message broker (asyncio.Queue per subscriber). | §6 | S003-P011 WP003 (LOD200 2026-03-19): planned and deferred, now executed. asyncio.Queue sufficient for v3.0 single-server deployment. |
| **AD-S8B-05** | `GET /api/state` response extended with `previous_event`, `pending_feedback`, `next_action` (incl. `cli_command`) — single API call for full Operator Handoff render. | §10.7 | Minimizes round-trips. Dashboard renders entire Operator Handoff section from one response. |
| **AD-S8B-06** | Team `engine` field = editable runtime attribute. SSOT = `teams` DB table. `definition.yaml` is NOT SSOT for engine. team_00 only. | §7, §10.3 | `engine` changes at runtime when Nimrod switches models. Hierarchy stays in definition.yaml (AD-S8A-05 still holds for parent/children). |
| **AD-S8B-07** | History page = Observability Analytics. Run selector + Event Timeline added. | §8 | Operational need: deep per-run analysis. Portfolio navigation requires per-run filtering. |
| **AD-S8B-08** | FAIL `reason` = required field (server-validated). ADVANCE `summary` = optional. | §4.2, §10.11 | FAIL without reason is untraceable. ADVANCE may have empty context for routine passes. Confirmed: `reason` was already required in Module Map v1.0.1 §4.3. |
| **AD-S8B-09** | `next_action` + `cli_command` are server-computed. Dashboard renders, never computes. | §3.3, §10.7 | Consistent with AD-S8B-01. Prevents client-side logic drift from server state. |
| **AD-S8B-10** | SSE broadcast (`broadcaster.broadcast()`) called AFTER `db.commit()`, NOT inside transaction. | §6.4, §12.2 | AD-S7-01: DB atomicity concerns DB only. SSE is fire-and-forget post-commit. Lost SSE events are recovered by polling fallback. |
| **AD-S8B-11** | In AOS v3, a **gate** is semantically equivalent to a **milestone** in project management. Portfolio view organizes runs by gate position. | §9.3 | Gates are sequential quality checkpoints — the natural unit of progress measurement. Enables meaningful Portfolio grouping and filtering. |

---

## §15 — Impact Analysis on Existing Stages

| Stage | Spec | Impact | Resolution |
|---|---|---|---|
| Stage 2 (State Machine) | v1.0.2 | `pending_feedback` is NOT a new RunStatus. Ingestion is a side-channel, not a state transition. The 5 RunStatus values (NOT_STARTED, IN_PROGRESS, CORRECTION, PAUSED, COMPLETE) remain unchanged. | No amendment needed. Clarified in §12.4 (UC-15). |
| Stage 3 (Use Case Catalog) | v1.0.3 | `ingest_feedback` = new UC-15. OQ-S3-02 partially addressed — admin management UCs still deferred per OQ-S7-01. | UC-15 defined in §12.4. Entity Dict v2.0.3 scope. |
| Stage 7 (Event Observability) | v1.0.2 | `feedback_ingested` is a new SSE event type — NOT in the 15 `events` table types. It is a system notification pushed only via SSE, NOT persisted to the `events` table. | Clarified in §6.2 — SSE-only events are a separate category from persisted domain events. |
| Stage 8 (Module Map) | v1.0.1 | 2 new modules: `audit/ingestion.py`, `audit/sse.py`. `management/use_cases.py` gets `ingest_feedback()` (UC-15). §4.2 amended (`notes`→`summary` + `feedback_json`). §4.9 amended (3 new response fields). §1 directory structure extended. | Amendments documented in §10.6, §10.7, §12.3. |
| Stage 8A (UI Spec) | v1.0.2 | §6.1 gets §6.1.D + §6.1.E + §6.1.F. §6.2 gets analytics additions. §6.4 gets engine editor. §6.5 gets gate organization + WP detail modal. Ideas API/DDL amended with `domain_id` + `idea_type`. | This document IS Stage 8B — additive to Stage 8A. |

---

## §16 — Mockup Scope for Team 31

Team 31 updates the mockup AFTER Stage 8B spec is gate-approved.

### §16.1 — File Changes

| File | Change |
|------|--------|
| `index.html` | Add OPERATOR HANDOFF section (§3) with 3 sub-sections: PREVIOUS, NEXT, CLI |
| `index.html` | Add Feedback Ingestion flow (§4): 3 detection mode buttons + Mode C/D fallback UIs |
| `index.html` | Add CORRECTION blocking findings section above OPERATOR HANDOFF (§5) |
| `index.html` | Advance/Fail forms: pre-fill + expand-on-click (§4) |
| `index.html` | Add SSE connection indicator in header (green dot = SSE, grey = polling) |
| `history.html` | Add Run Selector dropdown, Event Timeline (mock), run_id filter field (§8) |
| `teams.html` | Engine field: editable dropdown + Save button (§7) |
| `portfolio.html` | Gate filter dropdown above tabs (§9.3) |
| `portfolio.html` | Ideas Pipeline tab: add `domain_id` + `idea_type` columns + modal field updates (§9.1) |
| `portfolio.html` | Work Packages tab: add WP detail modal + `current_gate` column (§9.2, §9.3) |
| `portfolio.html` | Active/Completed Runs tabs: add `current_gate` column (§9.3) |
| `app.js` | Extend MOCK_STATE with `previous_event`, `pending_feedback`, `next_action` per scenario |
| `app.js` | Add 6 new scenarios (§16.2) |

### §16.2 — 6 New Mockup Scenarios

| # | Scenario Name | Status | Key UI State |
|---|---|---|---|
| 1 | `AWAIT_FEEDBACK` | IN_PROGRESS | NEXT shows 3 detection mode buttons, no pending feedback |
| 2 | `FEEDBACK_PASS` | IN_PROGRESS | Feedback ingested (verdict=PASS, confidence=HIGH), NEXT shows Confirm Advance |
| 3 | `FEEDBACK_FAIL` | IN_PROGRESS | Feedback ingested (verdict=FAIL, 2 BFs), NEXT shows Confirm Fail |
| 4 | `FEEDBACK_LOW_CONFIDENCE` | IN_PROGRESS | IL-3 raw display, NEXT shows manual PASS/FAIL buttons |
| 5 | `CORRECTION_BLOCKING` | CORRECTION | Blocking findings section visible, cycle 2 of 3 |
| 6 | `SSE_CONNECTED` | IN_PROGRESS | SSE green dot indicator visible in header |

**Total scenarios after Stage 8B:** existing (IN_PROGRESS, IDLE, PAUSED, COMPLETE) + 6 new = 10.

---

## §17 — Integration Tests (Stage 8B additions)

Extends from TC-14 (Module Map v1.0.1 §7).

| TC ID | Test | Inputs | Expected | Spec Ref |
|---|---|---|---|---|
| TC-15 | Mode B ingestion — IL-1 success | Run IN_PROGRESS; verdict file exists at canonical path with valid JSON block containing `verdict: PASS` | FeedbackRecord: verdict=PASS, ingestion_layer=JSON_BLOCK, confidence=HIGH, proposed_action=ADVANCE | §2.3 IL-1 |
| TC-16 | Mode B ingestion — no file | Run IN_PROGRESS; no verdict file at any canonical path | Response: fallback_required=true, feedback_record=null | §2.2 Mode B failure |
| TC-17 | Mode D ingestion — IL-2 with BF-NN | RAW_PASTE with text containing `verdict: FAIL`, `BF-01: desc \| evidence: file.py:10`, `BF-02: desc` | FeedbackRecord: ingestion_layer=REGEX_EXTRACT, blocking_findings has 2 items, confidence=MEDIUM | §2.3 IL-2 |
| TC-18 | GET /state includes next_action | Run IN_PROGRESS; pending FeedbackRecord with verdict=PASS | `next_action.type=CONFIRM_ADVANCE`, `cli_command` contains `/advance` with summary | §10.7 |
| TC-19 | POST /advance with feedback pre-fill | FeedbackRecord pending (verdict=PASS, summary="QA complete"); call advance without summary in body | Event GATE_PASSED created; event.payload_json contains summary="QA complete" from FeedbackRecord | §10.6 |
| TC-20 | POST /fail without reason | Call POST /fail with reason="" | 400 MISSING_REASON | §10.11 |
| TC-21 | SSE stream receives events | Subscribe to SSE; trigger POST /advance | `pipeline_event` and `run_state_changed` SSE events received within 2 seconds of commit | §10.4 |
| TC-22 | PUT /engine — non-principal | Call PUT /teams/team_21/engine as team_21 (non-team_00) | 403 INSUFFICIENT_AUTHORITY | §10.3 |
| TC-23 | POST /ideas with domain_id + idea_type | Create idea with domain_id=agents_os, idea_type=BUG | 201 with domain_id and idea_type in response | §10.8 |
| TC-24 | POST /ideas with invalid idea_type | Create idea with idea_type=INVALID | 400 INVALID_IDEA_TYPE | §10.8 |
| TC-25 | GET /work-packages/{wp_id} — detail with linked run | WP with active linked run | Response includes linked_run object with run status, gate, phase, actor | §10.5 |
| TC-26 | Portfolio gate filter | Apply gate filter GATE_3 to Active Runs tab | Only runs with current_gate_id=GATE_3 displayed | §9.3 |

---

## §18 — Pre-submission Checklist

- [x] §1: Terminology glossary — all 8 canonical terms defined and used consistently
- [x] §2: FIP — 4 detection modes with trigger, mechanism, fallback chain
- [x] §2.3: 3 Ingestion Layers with regex patterns (reference v2 json_enforcer.py + pipeline.py)
- [x] §2.4: FeedbackRecord schema — all fields typed, proposed_action logic defined
- [x] §2.5: Canonical verdict file paths — all patterns with underscore interop note
- [x] §3: Operator Handoff — 3 sub-sections (PREVIOUS / NEXT / CLI), all 6 NEXT states
- [x] §4: Verdict/Reason Input — pre-fill behavior + manual fallback
- [x] §5: CORRECTION blocking findings — data source explicit
- [x] §6: SSE — endpoint + server implementation + dashboard subscription + polling fallback
- [x] §7: Teams engine edit — trigger + API + auth
- [x] §8: History Analytics — run selector, event timeline, run_id UI filter
- [x] §9.1: Ideas entity amendments — domain_id + idea_type fields, DDL, API, UI
- [x] §9.2: Work Package detail modal — UI spec + new API endpoint
- [x] §9.3: Portfolio gate organization — AD-S8B-11 locked, filter + columns
- [x] §10.1: POST /feedback — full contract with errors
- [x] §10.2: POST /feedback/clear — full contract
- [x] §10.3: PUT /teams/engine — full contract with auth policy
- [x] §10.4: GET /api/events/stream — SSE spec with all 4 event types
- [x] §10.5: GET /api/work-packages/{wp_id} — full contract
- [x] §10.6: POST /advance amendment — `summary` field + CANONICAL_AUTO path
- [x] §10.7: GET /state amendment — 3 new response fields + `cli_command`
- [x] §10.8–10.10: Ideas API amendments — domain_id + idea_type
- [x] §10.11: SSOT corrections documented (fail reason, history run_id)
- [x] §11: 8 new error codes, total 49
- [x] §12: `audit/ingestion.py` + `audit/sse.py` interface contracts + UC-15 defined
- [x] §13: `pending_feedbacks` DDL + `ideas` DDL amendment — named constraints, CHECK guards
- [x] §14: AD-S8B-01..AD-S8B-11 all present with section reference + rationale
- [x] §15: Impact on Stages 2/3/7/8/8A — UC-15 decision locked, SSE-only clarified
- [x] §16: Mockup scope + 6 new scenarios for Team 31
- [x] §17: TC-15..TC-26 — all deterministic, all with spec reference
- [x] Zero TBD, zero "implementation will decide"
- [x] Consistent terminology throughout (§1 glossary)

---

**log_entry | TEAM_100 | STAGE8B_SPEC | SUBMITTED | v1.1.0 | 2026-03-27**
**log_entry | TEAM_100 | STAGE8B_SPEC | CC2_AUTHORITY_MODEL | NOT_PRINCIPAL_REPLACED_x3_COUNT_CORRECTED | v1.1.1 | 2026-03-28**
