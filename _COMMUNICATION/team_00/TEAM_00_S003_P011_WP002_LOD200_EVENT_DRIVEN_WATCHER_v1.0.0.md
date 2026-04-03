---
project_domain: AGENTS_OS
id: TEAM_00_S003_P011_WP002_LOD200_EVENT_DRIVEN_WATCHER_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
to: Team 100, Team 190, Team 170
cc: Team 61
date: 2026-03-19
status: LOD200 — APPROVED FOR GATE_0
authority: ARCHITECT_DIRECTIVE_AOS_ROADMAP_RESET_v1.0.0
depends_on: S003-P010-WP002 GATE_8 (JSON verdicts must exist before watcher can parse)
parallel_start_after: S003-P011-WP001 GATE_2---

## Mandatory Identity Header

| Field | Value |
|---|---|
| stage_id | S003 |
| program_id | S003-P011 |
| work_package_id | S003-P011-WP002 |
| gate_id | pre-GATE_0 |
| project_domain | AGENTS_OS |

---

## §1 — Work Package Overview

**Name:** Event-Driven File Watcher + SSE Push

**One sentence:** Monitor `_COMMUNICATION/` for new verdict files, auto-parse their JSON content, advance the pipeline state automatically, and push live updates to the Dashboard via Server-Sent Events — eliminating manual `./pipeline_run.sh pass` for ≥70% of gate transitions.

**Source problem (IDEA-040 Pillar 2):**
The pipeline currently requires the operator to:
1. Wait for an agent to write a verdict file in `_COMMUNICATION/`
2. Manually check if the file exists
3. Run `./pipeline_run.sh pass` or `fail`
4. Reload the dashboard

This manual loop is error-prone, slow, and requires CLI knowledge. It directly contradicts the "no CLI required" goal.

**Hard dependency on P010-WP002:** The file watcher reads JSON-fenced verdict files. If verdicts are still Markdown with YAML-regex, the watcher cannot reliably parse them. P010-WP002 MUST be deployed and all validation teams MUST be using JSON format before this WP's watcher is enabled in production.

---

## §2 — Architecture

```
_COMMUNICATION/ directory
         │
         │  new file created
         ▼
┌──────────────────────────┐
│  FileWatcher             │  watchdog / inotify / polling
│  (communication_watcher.py) │
└──────────┬───────────────┘
           │ filename matches verdict pattern?
           ▼
┌──────────────────────────┐
│  json_enforcer.py        │  validate JSON structure
│  (from P010-WP002)       │
└──────────┬───────────────┘
           │ valid verdict?
           ▼
┌──────────────────────────┐
│  pipeline.py --advance   │  CLI invocation or direct Python call
│  [GATE] PASS|FAIL        │
└──────────┬───────────────┘
           │ state updated
           ▼
┌──────────────────────────┐
│  SSE Event Publisher     │  pushes to /api/agents-os/stream
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Dashboard (browser)     │  re-renders Next Action Panel
│  EventSource listener    │
└──────────────────────────┘
```

---

## §3 — Deliverables

### D-01: `communication_watcher.py`

**Location:** `agents_os_v2/orchestrator/communication_watcher.py`

**Core responsibilities:**
1. Watch `_COMMUNICATION/` recursively for new file creation events
2. Match filenames against verdict patterns:
   ```python
   VERDICT_PATTERNS = [
       r"TEAM_\d+_.*_GATE_\d+_VERDICT.*\.md",
       r"TEAM_\d+_.*_BLOCKING_REPORT.*\.md",
       r"TEAM_\d+_.*_GATE_\d+_VERDICT.*\.json",
   ]
   ```
3. On match: call `json_enforcer.enforce_json_verdict(file_path)`
4. On valid JSON verdict:
   a. Extract `gate_id`, `decision`, `route_recommendation`
   b. Call `pipeline.py --advance {gate_id} {decision}` (subprocess or direct import)
   c. Emit SSE event to connected dashboard clients
5. On invalid JSON or parse error: log to `pipeline_events.jsonl`; do NOT auto-advance; set `gate_state = MANUAL_ROUTING_REQUIRED`

**Watch library:** Use Python `watchdog` (already in agents_os requirements or add). Fallback: polling every 10 seconds if watchdog unavailable.

**Domain scope:** Watcher is domain-specific — watches subdirectory patterns matching `team_*/` files only for the active domain's WP. Uses `state.work_package_id` to filter: only files containing the active WP ID prefix are processed.

**Idempotency guard:** Track processed file paths in memory (set). Re-creation or modification of already-processed file does NOT trigger re-advance.

---

### D-02: SSE Endpoint

**Location:** `agents_os_v2/server.py`

**Endpoint:** `GET /api/agents-os/stream`

**Protocol:** Server-Sent Events (SSE) — text/event-stream

**Event types:**

```
event: pipeline_state_changed
data: {"gate": "GATE_1", "decision": "PASS", "new_gate": "GATE_2", "health": "GREEN"}

event: verdict_detected
data: {"file": "_COMMUNICATION/team_190/TEAM_190_..._GATE_1_VERDICT.md", "gate": "GATE_1"}

event: manual_routing_required
data: {"gate": "GATE_5", "reason": "verdict_parse_error"}

event: phase_advanced
data: {"from_phase": 1, "to_phase": 2, "gate": "CURSOR_IMPLEMENTATION"}

event: heartbeat
data: {"timestamp": "2026-03-19T14:30:00Z", "health": "GREEN"}
```

**Heartbeat interval:** 30 seconds (keeps connection alive through proxies).

**Client reconnect:** Standard SSE `retry: 5000` header — browser auto-reconnects after 5s on disconnect.

---

### D-03: Dashboard EventSource Integration

**Location:** `agents_os/ui/js/pipeline-state.js`

**Replace polling with SSE:**
```javascript
// Remove: setInterval(pollStateView, 5000)
// Add:
const eventSource = new EventSource('/api/agents-os/stream');

eventSource.addEventListener('pipeline_state_changed', (e) => {
    const data = JSON.parse(e.data);
    refreshStateView();   // re-fetches STATE_VIEW.json and re-renders
});

eventSource.addEventListener('manual_routing_required', (e) => {
    showManualRoutingPanel(JSON.parse(e.data));
});

eventSource.onerror = () => {
    // fallback: poll STATE_VIEW.json every 10s until SSE reconnects
    startFallbackPolling();
};
```

**Fallback:** If SSE connection fails, degrade gracefully to 10-second polling of `STATE_VIEW.json`. Never show error to user.

---

### D-04: Watcher Lifecycle Management

**Start:** Watcher starts automatically when `agents_os_v2/server.py` starts (in `lifespan` context manager, same pattern as APScheduler in TikTrack).

**Stop:** Watcher stops cleanly on server shutdown.

**Config flag:** `pipeline-config.js` (or server config): `ENABLE_FILE_WATCHER: true | false`. Default `true` in production; `false` in test environments where manual advance is needed.

**Test mode override:** `./pipeline_run.sh --domain agents_os --no-watcher` disables watcher for the session.

---

### D-05: Gates Covered by Auto-Advance

| Gate | Auto-advance? | Condition |
|---|---|---|
| GATE_0 | ✅ | Team 190 verdict file written |
| GATE_1 | ✅ | Team 190 verdict file written |
| GATE_2 | ❌ | Human approval required — manual only |
| WAITING_GATE2_APPROVAL | ❌ | Human approval — manual only |
| G3_5 | ✅ | Team 90 verdict file written |
| GATE_4 | ✅ | Team 50 blocking report written |
| GATE_5 | ✅ | Team 90 verdict file written |
| GATE_6 | ❌ | Team 100 architectural review — manual (sensitive) |
| GATE_7 | ❌ | Nimrod human UX review — always manual |
| GATE_8 | ✅ | Team 90 closure verdict written |

**Manual gates (GATE_2, GATE_7) will never be auto-advanced.** The watcher explicitly ignores these gates even if a verdict file matching their pattern appears.

---

## §4 — Files Created / Modified

| File | Change | Description |
|---|---|---|
| `agents_os_v2/orchestrator/communication_watcher.py` | CREATE | FileWatcher + verdict detection + auto-advance logic |
| `agents_os_v2/server.py` | MODIFY | SSE endpoint; watcher start/stop in lifespan |
| `agents_os/ui/js/pipeline-state.js` | MODIFY | Replace polling with EventSource + fallback |
| `agents_os_v2/requirements.txt` | MODIFY | Add `watchdog>=3.0.0` |
| `agents_os/ui/js/pipeline-config.js` | MODIFY | Add `ENABLE_FILE_WATCHER` config flag |

---

## §5 — Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | Watcher starts on server boot; visible in server logs |
| AC-02 | Writing a valid JSON verdict for GATE_0 → pipeline advances to GATE_1 within 3s |
| AC-03 | Dashboard re-renders next action within 5s of pipeline state change |
| AC-04 | Invalid JSON verdict → `MANUAL_ROUTING_REQUIRED` state set; dashboard shows routing panel |
| AC-05 | GATE_2 verdict file does NOT trigger auto-advance (human gate protection) |
| AC-06 | GATE_7 verdict file does NOT trigger auto-advance (human gate protection) |
| AC-07 | Watcher stops cleanly on server shutdown (no zombie processes) |
| AC-08 | SSE fallback to polling when EventSource disconnects; no error shown to user |
| AC-09 | Idempotency: writing same verdict file twice does NOT advance pipeline twice |
| AC-10 | With `ENABLE_FILE_WATCHER: false`, manual `./pipeline_run.sh pass` still works |
| AC-11 | `pipeline_events.jsonl` logs `WATCHER_AUTO_ADVANCE` event for each auto-advance |

---

## §6 — What This Does NOT Include

- Writing verdict files on behalf of agents (agents still write their own output)
- Parsing non-JSON legacy verdict files (P010-WP002 must be deployed first)
- Auto-approving GATE_2 or GATE_7 (human gates — never automated)
- TikTrack domain watching (AGENTS_OS domain only for S003)

---

**log_entry | TEAM_00 | LOD200_P011_WP002 | EVENT_DRIVEN_WATCHER_SSE_SPEC_APPROVED | 2026-03-19**
