# Event Log Reference
## documentation/docs-agents-os/02-ARCHITECTURE/EVENT_LOG_REFERENCE_v1.0.0.md

**project_domain:** AGENTS_OS  
**owner:** Team 170  
**date:** 2026-03-10  
**source:** S002-P005-WP003 Event Log Phase 2  
**status:** ACTIVE  

---

## 1. Overview

The Event Log is an append-only audit trail of pipeline events (gate passes, init, snapshot, server start, etc.). It is consumed by the Dashboard and Roadmap UIs to display recent activity per domain and work package.

| Aspect | Value |
|--------|-------|
| **Storage** | `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl` (append-only) |
| **API** | GET `/api/log/events`, POST `/api/log/event` |
| **UI** | Dashboard (Event Log accordion), Roadmap (Event Log accordion) |
| **Server** | AOS Starlette (`agents_os_v2/server/aos_ui_server.py`) port 8090 |

---

## 2. API Contract

### GET /api/log/events

Query pipeline events with optional filters.

| Query param | Type | Description |
|-------------|------|-------------|
| `domain` | string | Filter by domain (`tiktrack`, `agents_os`, `global`) |
| `work_package_id` | string | Prefix match (e.g. `S002-P005` matches `S002-P005-WP003`) |
| `gate` | string | Exact match on gate ID |
| `event_type` | string | Exact match on event_type |
| `limit` | int | Max events to return (1–100, default 20) |

**Response:** JSON array of event objects, newest first.

### POST /api/log/event

Ingest a single pipeline event. Request body: JSON object per `PipelineEvent` schema.

**PipelineEvent fields:** `timestamp`, `pipe_run_id`, `event_type`, `domain`, `stage_id`, `work_package_id`, `gate`, `agent_team`, `severity`, `description`, `metadata`.

---

## 3. Event Types

| Category | Types |
|----------|-------|
| Gate | `GATE_PASS`, `GATE_FAIL`, `GATE_BLOCK`, `GATE_ADVANCE_BLOCKED`, `PIPELINE_APPROVE`, `PASS_WITH_ACTION`, `OVERRIDE` |
| State | `SNAPSHOT_GENERATED`, `DRIFT_DETECTED`, `DRIFT_RESOLVED`, `WSM_UPDATE` |
| System | `INIT_PIPELINE`, `PHASE_TRANSITION`, `ARTIFACT_STORE`, `SERVER_START`, `SERVER_STOP`, `SERVER_ERROR`, `ERROR` |

---

## 4. Instrumentation Sources

Events are appended by:

| Source | Trigger |
|--------|---------|
| `agents_os_v2/orchestrator/log_events.py` | `append_event()` — called from pipeline, state_reader |
| `agents_os_v2/server/aos_ui_server.py` | `emit_server_start()` on startup |
| `pipeline_run.sh`, `init_pipeline.sh` | Shell wrapper instrumentation |
| `agents_os/scripts/seed_event_log.py` | Manual seed for dev/E2E |

---

## 5. UI Integration

### Dashboard

- **Panel:** `#event-log-panel`, `#event-log-list` (accordion open by default)
- **Script:** `agents_os/ui/js/event-log.js`
- **Filters:** domain from `currentDomain`, work_package from `pipelineState.work_package_id` (program prefix)
- **Ticker:** `#event-log-ticker-events`, `#event-log-ticker-count` in Current Step Banner
- **Fallback:** When domain-filtered returns empty → retry system-wide; show "Showing system-wide (domain had no events)"

### Roadmap

- **Panel:** `#event-log-roadmap-panel`, `#event-log-roadmap-list`
- **Script:** `agents_os/ui/js/event-log-roadmap.js`
- **Options:** System-wide checkbox, domain select, limit select
- **Default:** Program-scoped (from active program in roadmap context)

---

## 6. Seed & E2E

**Seed script:** `python3 agents_os/scripts/seed_event_log.py`  
Appends sample events for `agents_os`, `tiktrack`, and `global` domains. Safe to run multiple times.

**E2E validation:** `./tests/e2e_event_log_validation.sh`  
Verifies API returns events, `_COMMUNICATION` mount serves pipeline state, seed availability.

---

## 7. File Map

| Path | Purpose |
|------|---------|
| `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl` | Append-only event store |
| `agents_os_v2/orchestrator/log_events.py` | `append_event()`, `LOG_FILE` |
| `agents_os_v2/server/routes/events.py` | GET/POST handlers |
| `agents_os/ui/js/event-log.js` | Dashboard Event Log |
| `agents_os/ui/js/event-log-roadmap.js` | Roadmap Event Log |
| `agents_os/scripts/seed_event_log.py` | Seed script |
| `tests/e2e_event_log_validation.sh` | E2E validation |

---

**log_entry | TEAM_170 | EVENT_LOG_REFERENCE | DELIVERED | 2026-03-10**
