---
document_id:    TEAM_00_TO_TEAM_61_EVENT_LOG_ARCHITECTURAL_FEEDBACK_v1.0.0
author:         Team 00 — Chief Architect
date:           2026-03-16
status:         APPROVED — ACTIVE MANDATE
to:             Team 61 (Cursor Cloud Agent — Implementation)
cc:             Team 10, Team 100, Team 190
subject:        Architectural Feedback: Pipeline Event Log + S003-P007 Connection + WP004 Spec
priority:       HIGH — Parallel to WP003 execution
authority:      Team 00 constitutional authority + Nimrod approval (2026-03-16)
---

# Architectural Feedback — Pipeline Event Log
## Team 00 → Team 61 | Implementation Mandate + Spec

---

## 0. Summary

Team 61's Pipeline Event Log proposal (`TEAM_61_PIPELINE_EVENT_LOG_IMPLEMENTATION_PLAN_v1.0.0.md`) has been reviewed by Team 00 and Team 100.

**Verdict: APPROVED WITH ARCHITECTURAL CORRECTIONS AND SCOPE EXPANSION**

The core implementation plan is sound. However, this session has produced architectural decisions that materially affect scope, design, and the strategic importance of what you are building. You must read this entire document before starting implementation.

**The short version:** `aos_ui_server.py` is not just an event log server. It is **Phase 1 of S003-P007** — the AOS Pipeline Server. You are building the foundation of the system's server-side layer. Design it accordingly.

---

## 1. Architectural Context (Required Reading)

### 1.1 Why the Server Layer Matters

This session identified that the AOS Dashboard has three structural failures as a static HTML application:

**Failure 1 — Real-time blindness:** Static HTML can only read what is on disk. It has no way to compute live state. Every pre-computed file (STATE_SNAPSHOT, OPERATIONAL_VIEW) is stale the moment any writer changes WSM or JSON. There is no architectural workaround for this in HTML alone.

**Failure 2 — Copy-paste command execution:** In Mode 2, the dashboard generates commands for the operator to copy-paste. This works today but is architecturally broken for Mode 3 (full automation).

**Failure 3 — No transactions:** No mechanism exists to update WSM + JSON atomically. They are written by different processes with no coordination.

**The server layer (`aos_ui_server.py`) fixes all three failures.** This is why it matters architecturally, not just as a feature.

### 1.2 S003-P007 — Redefined

S003-P007 (`Command Bridge Lite`) was previously scoped as "add copy-command buttons to dashboard." That scope was too narrow.

**Correct scope of S003-P007:**
```
AOS Pipeline Server — a Starlette/FastAPI micro-server that:
  - Serves static dashboard files
  - Reads WSM + JSON live on every request (no stale pre-computed files)
  - Detects drift inline (WSM vs JSON disagreement)
  - Executes pipeline commands from dashboard (Mode 2+)
  - Provides WebSocket push for Mode 3
  - Enables atomic WSM + JSON updates
```

**The Event Log server you are building IS Phase 1 of S003-P007.**

Design `aos_ui_server.py` so it can grow into the full S003-P007 server without a rewrite. The architectural decisions in this document specify what that means concretely.

### 1.3 One Human — All Other Teams Are AI Agents

**Iron Rule (locked 2026-03-16):** There is exactly one human in this organization: Nimrod (Team 00). All other teams — including Team 61 — are LLM agents running in specific computational environments.

**Implication for your implementation:**
- Every API endpoint you build will be called by both Nimrod (human, via browser) AND other AI agents (Team 10, Team 190, etc.)
- All responses must be **structured JSON** — no HTML-only responses
- All error messages must be **machine-readable** (structured codes, not prose)
- All schemas must be **deterministic** — no fields that require interpretation

### 1.4 Cross-Engine Validation Principle

**Iron Rule (locked 2026-03-16):** Every LLM action must be validated by a different agent — with strong preference for a different engine and environment.

**Implication for the D-4 WP flow (see Section 5):** Every stage of your implementation must include a validation gate before advancing.

---

## 2. Architectural Assessment of Team 61's Plan

### 2.1 What the Plan Gets Right

| Element | Assessment |
|---------|------------|
| Replace `http.server 8090` with custom server | ✅ CORRECT — this was always wrong; we need a real server |
| JSONL event log storage | ✅ CORRECT — append-only, simple, auditable |
| POST /log endpoint for event ingestion | ✅ CORRECT — clean separation: writers push, server stores |
| GET /logs/events for UI consumption | ✅ CORRECT |
| No new external dependencies | ✅ CORRECT — Starlette is already in the stack |
| Event display in Roadmap UI | ✅ CORRECT |
| Execution sequence (log_events.py first) | ✅ CORRECT |

### 2.2 Architectural Gaps Requiring Correction

#### Gap 1: Server is designed as standalone — must be designed as foundation

The plan treats `aos_ui_server.py` as a purpose-built event log server. It must instead be designed as the **base of S003-P007** with event logging as its first module.

**Required:** Server structure must follow the API surface defined in Section 3.

#### Gap 2: Event schema is too narrow

Team 61's proposed event schema:
```json
{
  "timestamp": "...",
  "event_type": "...",
  "domain": "...",
  "gate": "...",
  "description": "..."
}
```

This schema is incomplete. Required fields and corrections: see Section 4.

#### Gap 3: Missing critical event types

Team 100's impact report correctly identified missing events. Complete list in Section 4.2.

#### Gap 4: Race condition in state.py

`PipelineState.work_package_id` has default value `"REQUIRED"` — a sentinel that propagates to disk as actual data. This creates phantom pipeline state for the tiktrack domain.

**Immediate fix required (before Event Log implementation):** see Section 6.

#### Gap 5: D-4 flow missing validation gates

Team 61's proposed D-4 flow:
```
Team 00+100: write spec → Team 61: implements → Team 00: reviews
```

**Corrected D-4 flow (Nimrod decision, 2026-03-16):**
```
Team 00+100: write spec/skeleton
    ↓ [GATE_0: Team 190 validates spec]
Team 61: implements
    ↓ [GATE_4: Team 51 QA validates]
Team 51: QA PASS
    ↓ [GATE_5: Team 190 constitutional validates]
Team 190: validates
    ↓ [GATE_6: Team 100 architectural review]
Team 100: reviews
    ↓ [GATE_7: Nimrod approves]
Nimrod: approves
```

No stage advances without the preceding validation passing. This is Iron Rule IR-CEV-05.

---

## 3. Server Architecture — `aos_ui_server.py`

### 3.1 Design Principle

```
aos_ui_server.py = AOS Pipeline Server, Phase 1
                   (designed to grow to full S003-P007 without rewrite)
```

The server must be built with **extension points** for the capabilities that will be added in later WPs. Do not build disposable code — build a foundation.

### 3.2 Required API Surface (Phase 1 — Event Log Scope)

```python
# Phase 1 endpoints — implement NOW (Event Log WP)
GET  /                          → serve index.html (dashboard entry point)
GET  /api/health                → server health + log file integrity check
POST /api/log/event             → ingest pipeline event
GET  /api/log/events            → retrieve event log (query params: domain, gate, limit)
GET  /static/{path}             → serve static files (CSS, JS, HTML)

# Phase 2 endpoints — STUB ONLY (placeholder, not implemented)
# These stubs signal to future implementers where to add functionality
GET  /api/state/{domain}        → STUB: "not implemented — see S003-P007"
POST /api/pipeline/{domain}/{command}  → STUB: "not implemented — see S003-P007"
GET  /api/state/drift           → STUB: "not implemented — see S003-P007"
# /ws/pipeline-events            → WebSocket stub (Mode 3 foundation)
```

**Implementation requirement:** Phase 2 stubs must return HTTP 501 (Not Implemented) with JSON body:
```json
{
  "error": "not_implemented",
  "planned_for": "S003-P007",
  "description": "Live state API — will be implemented in S003-P007 AOS Pipeline Server expansion"
}
```

This ensures:
1. The routing structure is established now (no future refactor needed)
2. Callers get clear, machine-readable errors (not 404)
3. The server already has the correct API surface shape

### 3.3 Server File Structure

```
agents_os_v2/
├── server/
│   ├── __init__.py
│   ├── aos_ui_server.py        ← Main Starlette application
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py           ← GET /api/health
│   │   ├── events.py           ← POST /api/log/event + GET /api/log/events
│   │   └── state_stub.py       ← Phase 2 stubs (501 responses)
│   └── models/
│       ├── __init__.py
│       └── event.py            ← PipelineEvent dataclass + validation
```

**Rationale for routes/ separation:** When S003-P007 is implemented, `state.py` and `pipeline.py` routes are added to `routes/` without touching `aos_ui_server.py`. This is the extension pattern.

### 3.4 Port and Configuration

```python
# aos_ui_server.py
SERVER_PORT = 8090              # Current http.server port — preserved
API_PREFIX  = "/api"
LOG_FILE    = "_COMMUNICATION/agents_os/pipeline_events.jsonl"
STATIC_DIR  = "agents_os/ui"
```

Port 8090 is preserved — no change to existing start scripts or references.

---

## 4. Event Schema — Corrected and Extended

### 4.1 Canonical Event Schema (v2)

```json
{
  "timestamp":      "2026-03-16T14:32:01Z",   // ISO-8601, UTC
  "pipe_run_id":    "a7f209c1",                // UUID prefix from pipeline state
  "event_type":     "GATE_PASS",               // See 4.2 for full enum
  "domain":         "agents_os",               // "agents_os" | "tiktrack" | "global"
  "stage_id":       "S002",                    // Active roadmap stage
  "work_package_id": "S002-P005-WP003",        // Active WP (from WSM — NOT from JSON sentinel)
  "gate":           "GATE_0",                  // Gate identifier (null if not gate-related)
  "agent_team":     "Team 190",                // Which team/agent produced this event
  "severity":       "info",                    // "info" | "warn" | "error" | "critical"
  "description":    "GATE_0 validation PASS — WP003 state alignment spec approved",
  "metadata":       {}                         // Optional: event-type-specific data (see 4.3)
}
```

**Schema Iron Rules:**
- `timestamp`: Always UTC, always ISO-8601. Never local time.
- `work_package_id`: Always sourced from WSM `active_work_package_id` — NEVER from `pipeline_state.json` identity fields (those are the source of drift)
- `stage_id`: Always sourced from WSM `active_stage_id`
- `pipe_run_id`: From `pipeline_state_{domain}.json` execution section
- `domain`: `"global"` for events that apply to both domains or to the AOS system itself

### 4.2 Event Type Enum (Complete)

```python
class EventType(str, Enum):
    # Gate lifecycle
    GATE_ENTER        = "GATE_ENTER"         # Gate activation
    GATE_PASS         = "GATE_PASS"          # Gate verdict: PASS
    GATE_FAIL         = "GATE_FAIL"          # Gate verdict: FAIL
    GATE_BLOCK        = "GATE_BLOCK"         # Gate verdict: BLOCK (constitutional)
    GATE_ADVANCE_BLOCKED = "GATE_ADVANCE_BLOCKED"  # Attempt to advance without PASS (NEW)

    # Pipeline lifecycle
    INIT_PIPELINE     = "INIT_PIPELINE"      # pipeline_run.sh init — CRITICAL (NEW)
    PIPELINE_PASS     = "PIPELINE_PASS"      # pipeline_run.sh pass
    PIPELINE_FAIL     = "PIPELINE_FAIL"      # pipeline_run.sh fail
    PIPELINE_APPROVE  = "PIPELINE_APPROVE"   # Human approval gate (Nimrod)
    PIPELINE_RESET    = "PIPELINE_RESET"     # Full pipeline reset

    # State management
    WSM_UPDATE        = "WSM_UPDATE"         # WSM file modified (CRITICAL — see 4.3)
    DRIFT_DETECTED    = "DRIFT_DETECTED"     # WSM vs JSON disagreement detected (CRITICAL)
    DRIFT_RESOLVED    = "DRIFT_RESOLVED"     # Drift corrected

    # Artifact lifecycle
    ARTIFACT_STORE    = "ARTIFACT_STORE"     # Document/artifact written to disk (NEW)
    ARTIFACT_VALIDATE = "ARTIFACT_VALIDATE"  # Validation verdict on artifact

    # Server lifecycle
    SERVER_START      = "SERVER_START"       # aos_ui_server.py started
    SERVER_STOP       = "SERVER_STOP"        # Server stopped (graceful)
    SERVER_ERROR      = "SERVER_ERROR"       # Server error condition

    # Future (stub — not emitted in Phase 1)
    # AGENT_SESSION_START / AGENT_SESSION_END — for when AI agent sessions are trackable
```

### 4.3 Metadata by Event Type

| Event Type | Required Metadata Fields |
|------------|--------------------------|
| `GATE_PASS` / `GATE_FAIL` / `GATE_BLOCK` | `{ "verdict_file": "path/to/verdict.md", "findings_count": N, "blocker_count": N }` |
| `INIT_PIPELINE` | `{ "initialized_by": "pipeline_run.sh", "work_package_id": "...", "source": "WSM\|CLI_PARAM\|SENTINEL" }` |
| `WSM_UPDATE` | `{ "fields_changed": ["active_work_package_id", ...], "changed_by_team": "Team 10" }` |
| `DRIFT_DETECTED` | `{ "wsm_value": "...", "json_value": "...", "field": "work_package_id", "domain": "..." }` |
| `ARTIFACT_STORE` | `{ "artifact_path": "...", "artifact_type": "LOD200\|LOD400\|VERDICT\|MANDATE\|DIRECTIVE" }` |
| `GATE_ADVANCE_BLOCKED` | `{ "attempted_gate": "GATE_X", "reason": "no PASS verdict for gate", "blocking_team": "Team 190" }` |

---

## 5. D-4 WP Flow (Amended — Nimrod Decision 2026-03-16)

This is the canonical Work Package execution flow for WP003, WP004, and all future WPs.

```
┌─────────────────────────────────────────────────────────────┐
│  D-4 WP FLOW — AMENDED (with mandatory validation gates)    │
│  Iron Rule IR-CEV-05 — Nimrod 2026-03-16                    │
└─────────────────────────────────────────────────────────────┘

Step 1: Team 00 + Team 100 write spec/skeleton
        Output: LOD200 spec + WP skeleton document

        ↓
[GATE_0: Team 190 validates spec]
        Input:  LOD200 spec
        Output: PASS | FAIL | BLOCK verdict
        Rule:   No implementation until GATE_0 PASS
        ↓

Step 2: Team 61 implements
        Input:  GATE_0 PASS + LOD200 spec + this document
        Output: Implementation PR / code artifacts

        ↓
[GATE_4: Team 51 QA validates]
        Input:  Implemented code
        Output: QA verdict (test suite results + structured verdict)
        Rule:   No advance until GATE_4 PASS
        ↓

[GATE_5: Team 190 constitutional validates]
        Input:  GATE_4 PASS + implementation artifacts
        Output: Constitutional verdict (Iron Rules compliance, schema compliance)
        Rule:   No advance until GATE_5 PASS
        ↓

[GATE_6: Team 100 architectural review]
        Input:  GATE_5 PASS + all artifacts
        Output: Architectural review verdict
        Rule:   No advance until GATE_6 PASS
        ↓

[GATE_7: Nimrod approves]
        Input:  GATE_6 PASS
        Output: Human approval (UX + vision sign-off)
        Rule:   No GATE_8 until GATE_7 PASS
        ↓

Step 3: Team 170 closes WP (GATE_8)
        Registry update + closure documents
```

**Team 61's responsibility in this flow:**
- Step 2 only: implement what the spec says, nothing more, nothing less
- No routing decisions — the pipeline engine routes after each verdict
- No self-validation — Team 61 does not validate its own output (IR-CEV-01)
- On GATE_4 FAIL: receive correction mandate from pipeline, revise, resubmit

---

## 6. Immediate Actions Required (Before Event Log Implementation)

These fixes address the WSM↔JSON drift root cause and must be completed before the Event Log server is started. They are mechanical and do not require a full WP cycle.

### Action 1 — Fix `state.py` Broken Default

**File:** `agents_os_v2/orchestrator/state.py`

**Problem:**
```python
@dataclass
class PipelineState:
    work_package_id: str = "REQUIRED"  # ← BROKEN SENTINEL — propagates to disk
    stage_id: str = "S002"              # ← HARDCODED — should read from WSM
```

**Required fix:**
```python
@dataclass
class PipelineState:
    work_package_id: str = ""           # Empty string — not a sentinel, not data
    stage_id: str = ""                  # Empty string — loaded from WSM at init

    def is_initialized(self) -> bool:
        """True only when loaded from real WSM data, not defaults."""
        return bool(self.work_package_id) and self.work_package_id != "REQUIRED"
```

**And update `save()` to guard against writing uninitialized state:**
```python
def save(self, path: str) -> None:
    if not self.is_initialized():
        raise ValueError(
            f"Refusing to save uninitialized PipelineState "
            f"(work_package_id='{self.work_package_id}'). "
            f"Call load() or set work_package_id from WSM before saving."
        )
    # ... existing save logic
```

### Action 2 — Delete Phantom tiktrack JSON

**File to delete:** `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`

**Reason:** tiktrack domain is currently IDLE (no active WP). An IDLE domain must not have a pipeline state file. The existing file contains `work_package_id: "REQUIRED"` (the broken sentinel) and `gates_failed: ["GATE_0"]` — phantom state that confuses the dashboard.

**Rule going forward:** A domain's pipeline state JSON file exists ONLY when that domain has an active WP. When a WP closes (GATE_8), its JSON is archived or deleted — not left with stale data.

**Add this to your `log_events.py`:**
```python
# Emit WSM_UPDATE event when WSM active_work_package_id is read on init
# Emit DRIFT_DETECTED event if pipeline_state JSON work_package_id ≠ WSM value
```

### Action 3 — Add WSM Read to `state_reader.py`

**File:** `agents_os_v2/observers/state_reader.py`

**Problem:** `read_governance_state()` reads WSM but only extracts `active_stage`. It does NOT extract `active_work_package_id` or `active_project_domain`.

**Required addition:**
```python
def read_wsm_identity_fields(wsm_path: str) -> dict:
    """
    Read the Two-Authority identity fields from WSM.
    These are the ground-truth values for: stage, active WP, active domain.
    Returns dict with keys: active_stage_id, active_work_package_id, active_project_domain
    """
    # Parse WSM CURRENT_OPERATIONAL_STATE block
    # Extract: active_stage_id, active_work_package_id, active_project_domain
    # Return structured dict (not raw text)
```

**And add drift detection:**
```python
def detect_drift(wsm_identity: dict, json_execution: dict) -> list[DriftItem]:
    """
    Compare WSM identity fields against pipeline JSON execution fields.
    Returns list of DriftItem(field, wsm_value, json_value, severity).
    Empty list = no drift.
    """
```

---

## 7. WP003 vs WP004 — What Team 61 Implements When

### WP003 (Current — CS-01..CS-08 Scope)

WP003 has already passed GATE_0. Team 61 executes:

| CS-ID | Description | Status |
|-------|-------------|--------|
| CS-01 | State provenance — WSM `active_work_package_id` extraction | WP003 |
| CS-02 | Sentinel value guard — state.py broken default fix | WP003 (= Action 1 above) |
| CS-03 | Phantom state removal — delete idle domain JSON | WP003 (= Action 2 above) |
| CS-04 | state_reader.py WSM identity extraction | WP003 (= Action 3 above) |
| CS-05 | STATE_SNAPSHOT drift cross-check | WP003 |
| CS-06 | Teams page global state consistency | WP003 |
| CS-07 | STAGE_PARALLEL_TRACKS read by state_reader.py | WP003 |
| CS-08 | Dashboard sentinel value display guard | WP003 |

Event Log server implementation runs **in parallel to WP003** — it is not part of WP003 scope.

### WP004 (Next — Schema Change Scope)

WP004 will be registered by Team 170 and contains:

| Item | Description |
|------|-------------|
| SCHEMA-01 | Remove identity fields from pipeline JSON (work_package_id, stage_id, project_domain) |
| SCHEMA-02 | Remove `agents_os_parallel_track` prose field from WSM |
| SCHEMA-03 | `STAGE_PARALLEL_TRACKS` becomes sole source for parallel domain state |
| SCHEMA-04 | STATE_SNAPSHOT improvement (Option B — enhanced, not replaced) |
| SCHEMA-05 | Update all SOPs referencing `agents_os_parallel_track` |
| SCHEMA-06 | Team 170 updates all activation prompts for affected teams |

WP004 spec (LOD200 skeleton) will be authored by Team 00 + Team 100. Team 61 implements after GATE_0 PASS.

---

## 8. STAGE_PARALLEL_TRACKS — What Team 61 Must Support

WSM will be updated (immediately, before WP004) to add the following structured block:

```yaml
## STAGE_PARALLEL_TRACKS

| domain     | active_program_id | active_work_package_id | phase_status     | current_gate | gate_owner_team |
|------------|-------------------|------------------------|------------------|--------------|-----------------|
| AGENTS_OS  | S002-P005         | S002-P005-WP003        | GATE_0_PASSED    | GATE_3       | Team 61         |
| TIKTRACK   | —                 | —                      | IDLE             | —            | —               |
```

**Team 61 must read `STAGE_PARALLEL_TRACKS` (not `agents_os_parallel_track`) when:**
1. Initializing pipeline state — use the table to determine active WP per domain
2. Emitting `INIT_PIPELINE` events — include `work_package_id` from this table
3. Detecting drift — compare this table against pipeline JSON execution fields

**The `agents_os_parallel_track` prose field will continue to exist until WP004.** Treat it as legacy — readable for context, but not authoritative. `STAGE_PARALLEL_TRACKS` table is authoritative.

---

## 9. Event Log UI Requirements

### 9.1 Display Location
Event log display goes in the **Roadmap page** — in the right-side panel (300px column) below gate history.

### 9.2 Filter Controls Required

```
Domain:  [All | Agents OS | TikTrack | Global]    ← dropdown
Gate:    [All | GATE_0 | GATE_1 | ... | GATE_8]   ← dropdown
Type:    [All | Gate Events | State Events | System] ← dropdown
Limit:   [20 | 50 | 100]                           ← dropdown
```

### 9.3 Event Row Display

```
[timestamp short] [domain badge] [gate badge] [event_type chip] [description]
[agent_team]                                                     [severity icon]
```

Color coding:
- `GATE_PASS`: green
- `GATE_FAIL` / `GATE_BLOCK` / `GATE_ADVANCE_BLOCKED`: red
- `DRIFT_DETECTED`: orange + bold
- `DRIFT_RESOLVED`: green (dimmed)
- `WSM_UPDATE`: blue
- `SERVER_*`: gray
- `INIT_PIPELINE`: teal

### 9.4 Auto-refresh

Poll `GET /api/log/events?limit=50&domain={active_domain}` every 10 seconds.
On new events (compare last event timestamp): scroll to bottom and flash new entries.

---

## 10. Cross-Engine Validation — Team 61 Compliance

Per Iron Rule `IR-CEV-01` (Cross-Engine Validation Principle):

> A team that produced an artifact may NOT be the primary validator of that artifact.

**Team 61 (Cursor) produces code → Team 51 (Gemini QA) validates.**

Team 61 must:
1. NOT submit self-validation as a gate verdict
2. Submit to GATE_4 (Team 51 QA) after implementation is complete
3. NOT advance to GATE_5 without Team 51 PASS verdict
4. Accept GATE_4 FAIL verdicts and revise without argument

This is not a quality preference. It is a structural requirement derived from the statistical nature of LLM output.

---

## 11. Deliverables Required from Team 61

### Phase 1 — Immediate (before Event Log WP start):
- [ ] Fix `state.py` broken default (`work_package_id = "REQUIRED"` → `""`) with `is_initialized()` guard
- [ ] Delete `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`
- [ ] Confirm `state_reader.py` WSM identity extraction is in WP003 scope (or implement per CS-01/CS-04)

### Phase 2 — Event Log Server (parallel to WP003):
- [ ] Implement `aos_ui_server.py` with Phase 1 API surface + Phase 2 stubs
- [ ] Implement `agents_os_v2/server/routes/events.py` — POST /api/log/event + GET /api/log/events
- [ ] Implement `agents_os_v2/server/routes/health.py` — GET /api/health
- [ ] Implement `agents_os_v2/server/routes/state_stub.py` — 501 stubs for future S003-P007 endpoints
- [ ] Implement `agents_os_v2/server/models/event.py` — PipelineEvent v2 schema (Section 4.1)
- [ ] Update `log_events.py` to emit full v2 event schema
- [ ] Instrument `pipeline.py` with all event types (Section 4.2) including INIT_PIPELINE
- [ ] Instrument `pipeline_run.sh` to emit events on init, pass, fail, approve, reset
- [ ] Update Roadmap UI with event log panel (Section 9)
- [ ] Update `start_ui_server.sh` to launch `aos_ui_server.py`
- [ ] Update `pipeline-config.js` with event log endpoint URL

### Validation:
- [ ] Submit to Team 51 (QA) for GATE_4 validation
- [ ] Do NOT submit self-validation as gate verdict

---

## 12. Restatement of Architectural Decisions (Session 2026-03-16)

For Team 61's implementation record:

**D-1: Two-Authority Schema** — WSM owns identity (stage_id, work_package_id, project_domain). Pipeline JSON owns execution (gates, verdicts, pipe_run_id). No field has two writers. **Enforced in WP004.**

**D-2: No new state files** — Improve STATE_SNAPSHOT.json (Option B). Do not create OPERATIONAL_VIEW.json or any additional generated state file.

**D-3: Event log server = S003-P007 Phase 1** — `aos_ui_server.py` is the foundation. Design for extensibility.

**D-4 (amended): Mandatory validation at every stage** — No WP stage advances without QA/validation PASS. The flow is: spec → [GATE_0] → implement → [GATE_4 QA] → [GATE_5 constitutional] → [GATE_6 architectural] → [GATE_7 Nimrod] → close.

---

**log_entry | TEAM_00 | TEAM_61_EVENT_LOG_ARCHITECTURAL_FEEDBACK | MANDATE_ISSUED | 2026-03-16**
