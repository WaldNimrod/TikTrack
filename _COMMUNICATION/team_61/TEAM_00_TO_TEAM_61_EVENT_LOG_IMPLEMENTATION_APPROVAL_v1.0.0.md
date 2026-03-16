---
document_id:    TEAM_00_TO_TEAM_61_EVENT_LOG_IMPLEMENTATION_APPROVAL_v1.0.0
author:         Team 00 — Chief Architect
date:           2026-03-16
status:         APPROVED — PROCEED IMMEDIATELY
to:             Team 61 (Cursor Cloud — Implementation)
cc:             Team 51 (Gemini QA — GATE_4 validator), Team 10 (phase coordinator), Team 00 (awareness)
subject:        APPROVED: AOS Event Log Server — Phase 2 Implementation Authorization
authority:      Team 00 constitutional authority + Nimrod approval (2026-03-16 session)
prerequisite:   TEAM_61_PIPELINE_EVENT_LOG_IMPLEMENTATION_PLAN_v1.1.0.md (reviewed and APPROVED)
---

# Team 61 — AOS Event Log Server: Phase 2 APPROVED

## ✅ PLAN v1.1.0 APPROVED

Team 61's revised plan `TEAM_61_PIPELINE_EVENT_LOG_IMPLEMENTATION_PLAN_v1.1.0.md` has been reviewed by
Team 00 (Chief Architect) and is **FULLY APPROVED**. All 10 architectural requirements from the prior
feedback document `TEAM_00_TO_TEAM_61_EVENT_LOG_ARCHITECTURAL_FEEDBACK_v1.0.0.md` are confirmed met.

**Confirmation of immediate actions already completed (per resubmission evidence):**

| Item | Status |
|------|--------|
| state.py defaults fixed (`work_package_id: str = ""`, `stage_id: str = ""`) | ✅ DONE |
| `is_initialized()` guard added to state.py | ✅ DONE |
| `save()` guard: skips if `not self.is_initialized()` | ✅ DONE |
| Phantom tiktrack JSON deleted: `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` | ✅ DONE |
| 23/23 tests PASS | ✅ CONFIRMED |

---

## Identity & Governance Context

**Iron Rule — IR-ONE-HUMAN-01 (locked 2026-03-16):**
There is exactly ONE human in this organization: Nimrod (Team 00).
All other teams (10, 20, 30, 51, 61, 100, 170, 190...) are LLM agents running in specific environments.
- Team 61: Cursor Cloud agents
- Team 51: Gemini API (your QA validator)
- Team 00: Claude Code (Nimrod/human interface)

Design ALL interfaces (APIs, schemas, protocols) to be deterministic and AI-agent-readable.
Source directive: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_ONE_HUMAN_ALL_TEAMS_AI_AGENTS_v1.0.0.md`

**Iron Rule — IR-VAL-01 (Validation Circle, locked 2026-03-16):**
Every LLM output MUST be validated by a different agent (preferably different engine + environment).
Validation circle: Team 61 (Cursor) → Team 51 (Gemini QA) → GATE_4 PASS → proceed.
Source directive: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_CROSS_ENGINE_VALIDATION_PRINCIPLE_v1.0.0.md` §Validation Circle

**Active pipeline context:**
- Active Stage: S002
- Active Program: S002-P005 (Agents_OS: Pipeline Governance & UI)
- Parallel track: S002-P005-WP003 at GATE_1 (LLD400 validation in progress)
- This work (Event Log Server) = Phase 1 of S003-P007 (AOS Pipeline Server)
- Execution runs in PARALLEL with WP003 — no dependency

---

## Phase 2 Scope — What You Are Building

You are building `agents_os_v2/server/aos_ui_server.py` — a Starlette micro-server on **port 8090**.
This is Phase 1 of S003-P007 (AOS Pipeline Server), establishing the server foundation and Event Log.

### File Structure to Create

```
agents_os_v2/server/
├── __init__.py
├── aos_ui_server.py          ← main Starlette application + startup
├── routes/
│   ├── __init__.py
│   ├── health.py             ← GET / and GET /api/health
│   ├── events.py             ← POST /api/log/event + GET /api/log/events
│   └── state_stub.py         ← Phase 2 stubs (501 responses)
└── models/
    ├── __init__.py
    └── event.py              ← EventLog model + EventType enum
```

### API Surface (Phase 1 — full implementation)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Server info + version + uptime |
| GET | `/api/health` | Health check: `{"status": "ok", "uptime_s": N}` |
| POST | `/api/log/event` | Ingest a pipeline event |
| GET | `/api/log/events` | Query events (filters: domain, gate, event_type, limit) |
| GET | `/static/{path}` | Serve static assets from `agents_os/ui/` |

### API Surface (Phase 2 — stubs returning 501)

| Method | Path | Future purpose |
|--------|------|----------------|
| GET | `/api/state/{domain}` | Live state computation |
| POST | `/api/pipeline/{domain}/{command}` | Pipeline command execution |
| GET | `/api/state/drift` | WSM↔JSON drift detection |

---

## Event Schema v2 — Canonical Definition

```python
class EventType(str, Enum):
    GATE_PASS            = "GATE_PASS"
    GATE_FAIL            = "GATE_FAIL"
    GATE_BLOCK           = "GATE_BLOCK"
    GATE_ADVANCE_BLOCKED = "GATE_ADVANCE_BLOCKED"
    PIPELINE_APPROVE     = "PIPELINE_APPROVE"
    PHASE_TRANSITION     = "PHASE_TRANSITION"
    INIT_PIPELINE        = "INIT_PIPELINE"
    WSM_UPDATE           = "WSM_UPDATE"
    DRIFT_DETECTED       = "DRIFT_DETECTED"
    DRIFT_RESOLVED       = "DRIFT_RESOLVED"
    PASS_WITH_ACTION     = "PASS_WITH_ACTION"
    OVERRIDE             = "OVERRIDE"
    SNAPSHOT_GENERATED   = "SNAPSHOT_GENERATED"
    ERROR                = "ERROR"

class PipelineEvent(BaseModel):
    timestamp:        str           # ISO-8601 UTC — required
    pipe_run_id:      str           # UUID or unique run ID
    event_type:       EventType     # from enum above
    domain:           str           # "agents_os" | "tiktrack"
    stage_id:         str           # from WSM ONLY (e.g. "S002")
    work_package_id:  str           # from WSM ONLY (e.g. "S002-P005-WP003")
    gate:             str           # current gate ID (e.g. "GATE_1")
    agent_team:       str           # team that triggered event (e.g. "team_61")
    severity:         str           # "INFO" | "WARN" | "ERROR"
    description:      str           # human-readable event description
    metadata:         dict          # optional structured payload
```

**Iron Rule — stage_id and work_package_id:**
These fields MUST be sourced from WSM (`PHOENIX_MASTER_WSM_v1.0.0.md`), NOT from pipeline JSON.
WSM is the authoritative identity source. Pipeline JSON is operational state only.

**WSM read path:**
`documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
Extract: `active_stage_id` + `active_work_package_id` from CURRENT_OPERATIONAL_STATE block.

---

## Instrumentation Targets

Add event emission to the following locations:

### pipeline_run.sh
- Gate PASS → emit `GATE_PASS`
- Gate FAIL → emit `GATE_FAIL`
- Phase transition (phase1/phase2 commands) → emit `PHASE_TRANSITION`
- Pipeline init (new command) → emit `INIT_PIPELINE`
- approve/override/actions_clear → emit `PIPELINE_APPROVE` / `OVERRIDE`

### pipeline.py
- Gate advancement (save_gate_pass, save_gate_fail) → emit corresponding event
- LLD400 store (AC-10 auto-store block in generate_gate_1_mandates) → emit `PHASE_TRANSITION`
- PASS_WITH_ACTION set → emit `PASS_WITH_ACTION`

### state_reader.py
- Add `read_wsm_identity_fields()`: reads active_stage_id + active_work_package_id from WSM
- Add `detect_drift()`: compare WSM identity fields vs pipeline JSON work_package_id, stage_id
- Snapshot generation → emit `SNAPSHOT_GENERATED`
- Drift detected → emit `DRIFT_DETECTED`

### init_pipeline.sh
- Pipeline initialization → emit `INIT_PIPELINE`

---

## UI Integration (Event Log Panel)

Add event log panel to existing dashboard right sidebar (`PIPELINE_DASHBOARD.html`):

- **Position**: New sidebar section below domain stats
- **Refresh**: 10-second auto-refresh (same as state poll)
- **Filters**: domain, gate, event_type, limit (default: 20)
- **Display**: chronological list, most recent first
- **Per-event**: timestamp, event_type badge (colored), domain, gate, agent_team, description
- **Source**: `GET /api/log/events?domain={domain}&limit=20`

**data-testid anchors required:**
- `data-testid="event-log-panel"` — outer container
- `data-testid="event-log-list"` — events list
- `data-testid="event-log-filter-domain"` — domain filter
- `data-testid="event-log-filter-type"` — event_type filter

---

## STAGE_PARALLEL_TRACKS Integration

During server init and state read operations, Team 61 MUST read the `STAGE_PARALLEL_TRACKS` block
from WSM (the new structured table replacing the deprecated `agents_os_parallel_track` prose field).

The `STAGE_PARALLEL_TRACKS` table is the canonical source for which domains are active and at what
gate. Use this to populate `domain`, `stage_id`, `work_package_id` in emitted events.

WSM path: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
Block: `## STAGE_PARALLEL_TRACKS`

---

## Iron Rules (Non-Negotiable)

These apply to ALL code produced by Team 61:

| Rule | Requirement |
|------|-------------|
| **maskedLog** | ALL logging through `maskedLog()` — no `print()` / `console.log()` with PII |
| **NUMERIC(20,8)** | Financial data (if any) uses NUMERIC(20,8) — zero rounding |
| **No new backend state** | Server is stateless; events stored in-memory (Phase 1) or append-only log file — no new DB |
| **No identity fields in pipeline JSON** | stage_id/work_package_id come from WSM ONLY (per WP004 design) |
| **Port 8090** | Server must bind to port 8090, not 8080/8082 |
| **No ES modules** | Use classic `<script src>` tags only — no bundler, no import statements in UI |

---

## Validation Gate (GATE_4)

After Phase 2 implementation is complete:

1. **Submit to Team 51** (Gemini QA) — cross-engine validation per IR-VAL-01
2. Team 51 runs QA checklist:
   - All API endpoints respond correctly
   - Event schema validation (all required fields)
   - WSM-sourced identity fields (stage_id/work_package_id NOT from JSON)
   - `maskedLog` used throughout
   - Phase 2 stubs return 501 with appropriate error body
   - Event log UI panel renders correctly
   - data-testid anchors present
3. Team 51 issues GATE_4 verdict → submit to Team 00
4. Team 00 acknowledges + pipeline advances

---

## Execution Order

```
[IMMEDIATE] Implement Phase 2 (Event Log Server) in parallel with WP003 GATE_1:
   1. Create agents_os_v2/server/ directory + file skeleton
   2. Implement health.py routes (GET /, GET /api/health)
   3. Implement event.py model (EventType enum + PipelineEvent schema)
   4. Implement events.py routes (POST /api/log/event, GET /api/log/events)
   5. Implement state_stub.py (Phase 2 stubs → 501)
   6. Implement aos_ui_server.py (Starlette app + mount routes + static + startup)
   7. Add instrumentation to pipeline_run.sh (gate pass/fail/phase events)
   8. Add instrumentation to pipeline.py (gate advancement + LLD400 store events)
   9. Add read_wsm_identity_fields() + detect_drift() to state_reader.py
  10. Add Event Log panel to PIPELINE_DASHBOARD.html + JS fetch
  11. Run all tests (pytest + existing test suite must remain 23/23 PASS)

[AFTER ALL ABOVE] Submit to Team 51 for GATE_4 validation.
```

---

## Files to Create / Modify (canonical list from v1.1.0 plan)

**Create (9 new files):**
- `agents_os_v2/server/__init__.py`
- `agents_os_v2/server/aos_ui_server.py`
- `agents_os_v2/server/routes/__init__.py`
- `agents_os_v2/server/routes/health.py`
- `agents_os_v2/server/routes/events.py`
- `agents_os_v2/server/routes/state_stub.py`
- `agents_os_v2/server/models/__init__.py`
- `agents_os_v2/server/models/event.py`
- `agents_os_v2/server/tests/test_server.py`

**Modify (instrumentation — 5 files):**
- `agents_os_v2/orchestrator/pipeline_run.sh` — add event emission calls
- `agents_os_v2/orchestrator/pipeline.py` — add event emission in gate transitions
- `agents_os_v2/observers/state_reader.py` — add `read_wsm_identity_fields()` + `detect_drift()`
- `agents_os/ui/PIPELINE_DASHBOARD.html` — add Event Log panel
- `agents_os/ui/js/pipeline-dashboard.js` (or new `event-log.js`) — Event Log fetch + render

---

## Submission

When Phase 2 is complete and all tests pass:

1. Commit all changes with descriptive message
2. Submit to Team 51 (Gemini QA) for GATE_4 validation
3. Submit completion report to `_COMMUNICATION/team_61/` containing:
   - Confirmation all 9 new files created
   - Instrumentation coverage (which events are emitted where)
   - Test results (existing 23/23 PASS + new server tests PASS)
   - Team 51 GATE_4 request issued

---

**log_entry | TEAM_00 | TEAM_61_EVENT_LOG_PHASE_2_APPROVED | ISSUED | 2026-03-16**
