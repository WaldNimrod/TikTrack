---
document_id:    TEAM_00_TO_TEAM_170_WP004_AND_S003P007_REGISTRY_UPDATE_MANDATE_v1.0.0
author:         Team 00 — Chief Architect
date:           2026-03-16
status:         ACTIVE MANDATE
to:             Team 170 (Gemini — Spec-Author / Documentation)
cc:             Team 100 (for WP004 LOD200 co-authoring), Team 190 (constitutional validation)
subject:        (A) Register WP004 in WP Registry; (B) Update S003-P007 scope in Program Registry
priority:       HIGH — required for roadmap accuracy
authority:      Team 00 constitutional authority + Nimrod approval (2026-03-16 session)
---

# Mandate — WP004 Registration + S003-P007 Scope Update
## Team 00 → Team 170 | Program and WP Registry Updates

---

## Part A — Register S002-P005-WP004 in WP Registry

### A.1 WP Identity

| Field | Value |
|-------|-------|
| work_package_id | S002-P005-WP004 |
| program_id | S002-P005 |
| stage_id | S002 |
| domain | AGENTS_OS |
| status | PLANNED |
| trigger | S002-P005-WP003 GATE_8 PASS |
| lod200_status | PENDING — Team 00 + Team 100 to co-author (next dedicated session) |

### A.2 WP004 Scope Summary

WP004 is the **Two-Authority Schema Change**. It resolves the architectural root cause of WSM↔pipeline JSON drift by establishing clear ownership boundaries.

**Scope items:**

| ID | Description |
|----|-------------|
| SCHEMA-01 | Remove identity fields from pipeline JSON (`work_package_id`, `stage_id`, `project_domain`) — these fields belong exclusively to WSM |
| SCHEMA-02 | Remove `agents_os_parallel_track` prose field from WSM CURRENT_OPERATIONAL_STATE |
| SCHEMA-03 | `STAGE_PARALLEL_TRACKS` table (added in WP003 hotfix) becomes the sole structured source for parallel domain tracking |
| SCHEMA-04 | `STATE_SNAPSHOT.json` improvement — Option B: enhance existing file to include WSM identity fields + drift cross-check (do NOT create new OPERATIONAL_VIEW.json or similar) |
| SCHEMA-05 | Update all SOPs and gate prompts that reference `agents_os_parallel_track` prose field — replace with structured `STAGE_PARALLEL_TRACKS` table reference |
| SCHEMA-06 | Update all affected team activation prompts to reflect new schema (no more identity fields in pipeline JSON) |

**What WP004 is NOT:**
- Not a code change to pipeline_run.sh (that is WP003 scope)
- Not a UI change (that is S003-P007 scope)
- Not a new state file (Option B = improve existing, not create new)

### A.3 Authority Documents

| Document | Status |
|----------|--------|
| `TEAM_00_STATE_SCHEMA_ARCHITECTURAL_RECOMMENDATION_v1.0.0.md` | ✅ Written — contains full Two-Authority schema design |
| `ARCHITECT_DIRECTIVE_DASHBOARD_ARCHITECTURE_EVOLUTION_v1.0.0.md` | ✅ Written — §6 Iron Rules IR-STAGE-01..04 |
| WP004 LOD200 | PENDING — Team 00 + Team 100 will co-author in next dedicated session |

### A.4 Registration Action

Add WP004 to the WP Registry under S002-P005:

```
| S002-P005-WP004 | Two-Authority Schema Change | AGENTS_OS | PLANNED |
  Scope: Remove identity fields from pipeline JSON; deprecate agents_os_parallel_track prose;
  STAGE_PARALLEL_TRACKS → sole structured source; STATE_SNAPSHOT Option B improvement;
  SOP updates (all references to agents_os_parallel_track).
  Trigger: S002-P005-WP003 GATE_8 PASS.
  LOD200: pending Team 00 + Team 100 (next dedicated session).
  Authority: TEAM_00_STATE_SCHEMA_ARCHITECTURAL_RECOMMENDATION_v1.0.0.md
```

---

## Part B — Update S003-P007 Scope in Program Registry

### B.1 Current Registry Entry (to be updated)

S003-P007 currently reads:
> "Agents_OS Command Bridge Lite (ADR-031 Stage B) — scope lock: approve-path desync block, command bridge copy flow with Task ID + context, model-B path realignment; backlog candidate: PIPELINE_HELP.html..."

### B.2 New Scope (locked by Team 00 directive, 2026-03-16)

S003-P007 has been **redefined** as the **AOS Pipeline Server** — the server-side layer for the AOS Dashboard.

This redefinition is locked in:
- `ARCHITECT_DIRECTIVE_DASHBOARD_ARCHITECTURE_EVOLUTION_v1.0.0.md` — §1, §4, §5
- `TEAM_00_TO_TEAM_61_EVENT_LOG_ARCHITECTURAL_FEEDBACK_v1.0.0.md` — §3 (server architecture)

**New scope entry for Program Registry:**

```
S003-P007 | AOS Pipeline Server (ADR-031 Stage B — redefined) | AGENTS_OS | PLANNED
  Prior name: "Command Bridge Lite". Scope redefined 2026-03-16 per Team 00 architectural decision.
  New scope: Full server-side layer for AOS Dashboard.

  Core deliverables:
    - aos_ui_server.py: Starlette micro-server replacing http.server 8090
      (Phase 1 = Event Log server per TEAM_61 Event Log WP; grows into full S003-P007)
    - GET /api/state/{domain}: live state computation (reads WSM + JSON on every request)
    - POST /api/pipeline/{domain}/{command}: pipeline command execution from dashboard
    - GET /api/state/drift: WSM↔JSON drift detection endpoint
    - Dashboard WSM-update interface: structured UI for Nimrod to review + apply state updates
      (replaces manual WSM editing — Nimrod approves via browser, server writes atomically)
    - WebSocket stub for Mode 3 (full automation) foundation

  Activation trigger: S002-P005-WP003 GATE_8 PASS
  LOD200: required before GATE_0. Authority: TEAM_00_TO_TEAM_61_EVENT_LOG_ARCHITECTURAL_FEEDBACK_v1.0.0.md §3
  Predecessor scope items preserved: approve-path desync block, model-B path realignment
    (these are now sub-items of the server, not standalone features)

  ADR-031 sequence: S002-P005 (Stage A) → S003-P007 (Stage B, this program) → S004-P008 (Stage C)
```

### B.3 Dashboard WSM-Update Interface — Scope Note

**Important:** The ability for Nimrod to update WSM state through the dashboard (rather than editing files directly) is a **S003-P007 deliverable**, not a current scope item. This is intentionally planned for the future.

Until S003-P007 is implemented, WSM updates are performed by the Gate Owner team as specified in the WSM_OWNER_MATRIX (or by Team 00 as a one-time exception, as done on 2026-03-16).

This note must appear in any documentation of the current WSM update process.

---

## Part C — Program Registry Mirror Sync

After completing Parts A and B, run the registry mirror sync:

```bash
python3 sync_registry_mirrors_from_wsm.py --write
python3 sync_registry_mirrors_from_wsm.py --check
```

Both commands must complete without errors before submitting the completion report.

---

## Submission Requirements

Submit completion report to `_COMMUNICATION/_ARCHITECT_INBOX/` containing:
1. Confirmation that WP004 is registered in WP Registry (with exact entry text)
2. Confirmation that S003-P007 scope is updated in Program Registry (with exact new entry)
3. Mirror sync check output (both commands PASS)
4. Team 190 validation requested (per IR-VAL-01 — Team 170 does not validate own output)

---

**log_entry | TEAM_00 | WP004_REGISTRATION_AND_S003P007_SCOPE_MANDATE | ISSUED_TO_TEAM_170 | 2026-03-16**
