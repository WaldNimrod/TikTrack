---
id: TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0
historical_record: true
from: Team 00 (System Designer)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 100 (Chief System Architect), Team 21 (AOS Backend), Team 31 (AOS Frontend),
    Team 51 (AOS QA), Team 61 (AOS DevOps), Team 111 (AOS Domain Architect),
    Team 190 (Validator), Team 191 (Git Governance Ops)
date: 2026-03-27
type: BUILD_PROCESS_MAP
status: ACTIVE
process_variant: TRACK_FOCUSED
spec_basis: TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md---

# AOS v3 — BUILD Phase Process Map

## Executive Summary

The AOS v3 spec development process is complete (8 stages, SPEC_PROCESS_COMPLETE). This document is the authoritative process map for the BUILD phase. It defines the gate sequence, team assignments, module build order, testing requirements, and E2E validation protocol using our MCP servers.

**Process Variant:** TRACK_FOCUSED (מסלול מרוכז)
**Gate Authority:** Team 100 (GATE_2) → Team 00 (GATE_4)
**Entry condition:** Stage 8 gate approval issued (A102 — 2026-03-27)

---

## §1 — AOS Domain Org Structure

```
Team 00 (Principal — Nimrod)
  └── Team 100 (Chief System Architect)
        ├── Team 111 (AOS Domain Architect — IDE oversight, DDL)
        ├── Team 11  (AOS Gateway / Execution Lead — orchestrates BUILD)
        │     ├── Team 21  (AOS Backend Implementation)
        │     ├── Team 31  (AOS Frontend Implementation)
        │     ├── Team 51  (AOS QA & Functional Acceptance)
        │     └── Team 61  (AOS DevOps & Platform)
        ├── Team 170 (Spec & Governance — docs closure)
        ├── Team 190 (Constitutional Validator — gate validation)
        └── Team 191 (Git Governance Ops — archive cleanup)
```

### Team Responsibilities in BUILD

| Team | Role | BUILD Responsibility |
|---|---|---|
| **Team 00** | Principal | GATE_4 personal UX approval; escalation authority |
| **Team 100** | Chief System Architect | GATE_2 approval; architectural sign-off; unblock issues |
| **Team 111** | AOS Domain Architect | DDL-ERRATA-01 delivery; DB schema oversight; seed data review |
| **Team 11** | AOS Gateway / Execution Lead | Orchestrates all phases; issues mandates to teams; gate submissions |
| **Team 21** | AOS Backend | All Python modules (definitions/ → state/ → routing/ → prompting/ → audit/ → policy/ → management/ → governance/) |
| **Team 31** | AOS Frontend | UI pages (Pipeline View, History View, Configuration) |
| **Team 51** | AOS QA | Unit tests, integration tests, E2E test execution via MCP |
| **Team 61** | AOS DevOps | Infrastructure, DB setup, FastAPI app server, deployment, CI |
| **Team 170** | Spec & Governance | Documentation closure at GATE_5 |
| **Team 190** | Validator | Gate validation review (GATE_2, GATE_3, GATE_4 artifacts) |
| **Team 191** | Git Governance Ops | Archive cleanup at GATE_5 (archive_pending in Artifact Index) |

---

## §2 — Gate Sequence Overview

```
BUILD_AUTHORIZED (A102)
        │
        ▼
   [GATE_0] ─── Entry acknowledgement + team activation
        │
        ▼
   [GATE_1] ─── Infrastructure ready + Foundation modules built
        │        (DDL applied, definitions/ + audit/ + policy/ DONE)
        ▼
   [GATE_2] ─── Core logic complete + unit tests PASS (Team 100 approves)
        │        (state/ + routing/ + prompting/ DONE; 14 unit test suites PASS)
        ▼
   [GATE_3] ─── Full implementation + integration tests PASS
        │        (management/ + governance/ + UI DONE; all 14 TCs PASS)
        ▼
   [GATE_4] ─── E2E validation PASS + Nimrod UX sign-off
        │        (MCP-driven E2E; Pipeline View + History + Config reviewed)
        ▼
   [GATE_5] ─── WP closure + documentation + archive
                 (Team 170 docs; Team 191 archive; DDL-ERRATA-01 closed)
```

| Gate | Approver | Approval Type | Blocking? |
|---|---|---|---|
| GATE_0 | Team 11 | Entry acknowledgement | YES — no work starts without this |
| GATE_1 | Team 100 | Architecture review + DB verification | YES |
| GATE_2 | **Team 100** (delegated by Team 00) | Core modules + unit tests PASS | YES — no Layer 3 work starts |
| GATE_3 | Team 190 (validator) | Integration test suite review | YES — no E2E starts |
| GATE_4 | **Team 00 (Nimrod)** | E2E PASS + UX personal approval | YES — no closure |
| GATE_5 | Team 11 | Closure checklist | Lifecycle end |

---

## §3 — Pre-Build Readiness (Entry Conditions)

Before GATE_0 can open, Team 11 confirms:

| # | Item | Source | Owner |
|---|---|---|---|
| 1 | Stage 8 gate approval (A102) | `_COMMUNICATION/team_00/TEAM_00_AOS_V3_STAGE8_GATE_APPROVAL_v1.0.0.md` | Team 00 ✅ |
| 2 | All 7 SSOT specs accessible | See §7 SSOT map | Team 100 ✅ |
| 3 | Artifact Index at SPEC_PROCESS_COMPLETE (v1.31.0) | `AOS_V3_SPEC_ARTIFACT_INDEX_v1.0.0.json` | Team 00 ✅ |
| 4 | DDL spec confirmed (v1.0.1) | `TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` | Team 111 ✅ |
| 5 | DDL-ERRATA-01 mandate active | Team 111 mandate — partial unique index pending | Team 111 🔄 |
| 6 | `agents_os_v2/` codebase available as reference | Existing repo | Team 21 ✅ |

---

## §4 — GATE_0: BUILD Authorization Entry

**Responsible:** Team 11 (AOS Gateway)
**Trigger:** A102 gate approval received
**Duration:** 1 session

### Actions

1. **Team 11** reads this process map + all 7 SSOT specs (§7)
2. **Team 11** issues activation mandates to: Team 61 (infra setup), Team 111 (DDL-ERRATA-01 timeline), Team 21 (Layer 0–1 start)
3. **Team 61** confirms environment: Python 3.11+, PostgreSQL, FastAPI, test runner (pytest)
4. **Team 11** registers BUILD WP in pipeline + opens pipeline run

### GATE_0 Acceptance Criteria

- [ ] All 7 team mandates issued
- [ ] Team 61 confirms environment ready
- [ ] `agents_os_v3/` directory structure created (matching §1 file tree)
- [ ] `definition.yaml` skeleton committed

---

## §5 — GATE_1: Infrastructure + Foundation Modules

**Responsible:** Team 61 (infra) + Team 111 (DDL) + Team 21 (definitions/)
**Target:** Database live, definitions/ and leaf modules complete
**Duration:** 2–3 sessions

### Phase 1A — Infrastructure (Team 61)

| Task | Deliverable | Acceptance |
|---|---|---|
| PostgreSQL schema apply | DDL v1.0.1 fully applied; all tables created | `\dt` confirms 8+ tables |
| DDL-ERRATA-01 path | If Team 111 delivers: apply partial unique index | `\d templates` shows partial index |
| FastAPI app scaffold | `agents_os_v3/` installable package; app boots | `uvicorn app:app` starts without error |
| `seed.py` execution | All reference data loaded from `definition.yaml` | D-03 validation passes (team_00 exists) |
| Environment | pytest + dependencies installed; CI pipeline wired | `pytest --collect-only` shows 0 errors |

### Phase 1B — DDL-ERRATA-01 (Team 111)

| Task | Deliverable | Timing |
|---|---|---|
| Deliver `TEAM_111_AOS_V3_DDL_SPEC_v1.0.2.md` | Adds partial unique index on `templates(gate_id, phase_id, domain_id) WHERE is_active=1` | Before GATE_2 (parallel to Phase 1B–2) |
| Apply migration | Adds index to live DB | At migration time |

**Interim:** Until v1.0.2 lands, `templates.py` application-layer check enforces uniqueness (AD-S8-01 mitigation).

### Phase 1C — Foundation Modules (Team 21)

Build in strict dependency order — **Layer 0 first, no exceptions.**

#### Layer 0 — No dependencies

| Module | File | Key contracts | Notes |
|---|---|---|---|
| `definitions/` | `models.py` | All dataclasses: Run, Team, Gate, Phase, Domain, PipelineRole, RoutingRule, Assignment, GateRoleAuthority, EventRecord, ResolvedRouting, AssembledPrompt, SnapshotSchema | Stage 8 §3.1 |
| `definitions/` | `constants.py` | Enums: RunStatus (8), ActorType (3), EventType (15), ProcessVariant (3), ExecutionMode (3), ScopeType, AssignmentStatus, OverrideAction | Stage 8 §3.2; EventType must match Stage 7 §1 exactly |
| `definitions/` | `queries.py` | `get_gate()`, `get_phase()`, `get_team()`, `get_domain()`, `get_pipeline_role()`, `list_gates()`, `list_phases_for_gate()`, `is_final_phase()` | Stage 8 §3.3; read-only |

#### Layer 1 — Depend only on definitions/

| Module | File | Key contracts | Notes |
|---|---|---|---|
| `audit/` | `ledger.py` | `append_event(run_id, event_type, gate_id, phase_id, domain_id, actor, payload_json) → EventRecord`; `query_events(filters) → list[EventRecord]` | Stage 8 §3.6; hash chain integrity; raises `AuditLedgerError` on insert failure |
| `policy/` | `settings.py` | `get_policy_value(key, scope) → dict`; `get_governance_version() → str`; `list_policies(scope_type) → list[Policy]`; `update_policy(key, value_json) → Policy` | Stage 8 §3.11; AD-S6-05: returns full JSON object |
| `state/` | `repository.py` | `create_run()`, `update_run_status()`, `get_run()`, `get_active_run()`, `write_snapshot()`, `clear_snapshot()` | Stage 8 §3.7 |
| `governance/` | `artifact_index.py` | `get_wp_artifacts()`, `create_artifact()`, `update_artifact_status()` | Stage 8 §3.14 |

### Unit Testing — Layer 0 + Layer 1 (Team 51)

Team 51 co-develops unit tests **in parallel** with Team 21's implementation.

| Test Scope | Min Coverage | Tooling |
|---|---|---|
| `definitions/models.py` — dataclass instantiation, field types | 100% | pytest |
| `definitions/constants.py` — enum completeness (15 EventTypes vs Stage 7 §1) | 100% | pytest |
| `definitions/queries.py` — DB reads return correct types | All 8 functions | pytest + test DB fixture |
| `audit/ledger.py` — append + query + hash chain | Happy path + hash failure | pytest |
| `policy/settings.py` — resolve correct value + full JSON return | All functions | pytest |
| `state/repository.py` — CRUD correctness | All CRUD + rollback | pytest |

### GATE_1 Acceptance Criteria

- [ ] PostgreSQL schema applied (all DDL v1.0.1 tables)
- [ ] `seed.py` runs clean (D-03 passes)
- [ ] `definitions/` — 3 files complete, typed, committed
- [ ] `audit/ledger.py` — complete + unit tests PASS
- [ ] `policy/settings.py` — complete + unit tests PASS
- [ ] `state/repository.py` — complete + unit tests PASS
- [ ] `governance/artifact_index.py` — complete + unit tests PASS
- [ ] EventType enum: exactly 15 values matching Stage 7 §1 registry
- [ ] All Layer 0+1 unit tests: PASS (pytest report submitted to Team 100)
- [ ] DDL-ERRATA-01: timeline confirmed from Team 111

---

## §6 — GATE_2: Core Logic Complete (Team 100 Approval)

**Responsible:** Team 21 implements → Team 51 tests → Team 100 approves
**Gate approver:** **Team 100** (delegated by Team 00 — GATE_2 authority)
**Trigger:** GATE_1 passed

### Phase 2A — Core Logic Modules (Team 21)

Build in dependency order. **DO NOT start Layer 2 until Layer 1 unit tests PASS.**

#### Layer 2A — Independent core (depend on definitions/ only)

| Module | File | Key contracts | Spec section |
|---|---|---|---|
| `routing/` | `resolver.py` | `resolve_actor(run, gate, phase, domain, process_variant) → ResolvedRouting`; raises `RoutingUnresolved`, `RoutingMisconfiguration` | Stage 8 §3.4; **AD-S5-01**: process_variant in resolver; **AD-S5-02**: NOT called when status=PAUSED; **AD-S5-05**: sentinel check first |
| `prompting/` | `templates.py` | `get_active_template(gate_id, phase_id, domain_id) → Template | None`; `update_template(id, body_markdown) → Template` | Stage 8 §3.10; IS NOT DISTINCT FROM SQL; DDL-ERRATA-01 application-layer guard |
| `prompting/` | `cache.py` | `get_cached(key) → str | None`; `set_cached(key, value, version_key)`; `invalidate(template_id)` | Stage 8 §3.9; L2 (assignment) + L4 (template) version-keyed; **AD-S6-01**: L1+L3 never cached |

#### Layer 2B — Depends on Layer 2A

| Module | File | Key contracts | Spec section |
|---|---|---|---|
| `prompting/` | `builder.py` | `assemble_prompt(run, gate, phase, domain, assignment, policy_context) → AssembledPrompt`; raises `TemplateNotFound`, `TemplateRenderError`, `PolicyNotFound`, `RoutingResolutionFailed` | Stage 8 §3.8; 4-layer assembly; **AD-S5-02** precondition (PAUSED guard); **AD-S6-07**: token budget = log.warn only |
| `state/` | `machine.py` | `execute_transition(run, transition, actor, payload) → (Run, EventRecord)`; raises `InsufficientAuthorityError`, `MaxCyclesReachedError`; **AD-S7-01**: atomic TX (UPDATE runs + INSERT events in same tx; `AuditLedgerError` → full rollback) | Stage 8 §3.5; all T01–T12 + A01–A10E |

### Unit Testing — Layer 2 (Team 51)

| Test Scope | Min Coverage | Critical paths |
|---|---|---|
| `routing/resolver.py` | All branches | Sentinel bypass (A-type), B.1/B.2/B.3 resolution chain, RoutingUnresolved fail-closed |
| `prompting/templates.py` | All functions | IS NOT DISTINCT FROM NULL handling, DDL-ERRATA-01 uniqueness guard |
| `prompting/cache.py` | All functions | L2 hit/miss, L4 invalidation on template update, L1/L3 never cached (AD-S6-01) |
| `prompting/builder.py` | All 4 error paths | TemplateNotFound, TemplateRenderError, token budget warn-only (AD-S6-07) |
| `state/machine.py` | All T01–T12 transitions | AD-S7-01 atomic TX; rollback on AuditLedgerError; InsufficientAuthorityError; MaxCyclesReachedError |

### Cross-module Integration Tests — Layer 2 (Team 51)

Before GATE_2 submission, Team 51 runs:

| Test | Modules Under Test | Validates |
|---|---|---|
| Routing → Builder pipeline | routing/ + prompting/ | resolve_actor() → assemble_prompt() full chain |
| Machine atomic TX | state/machine.py + audit/ledger.py | AD-S7-01: state transition rolls back if event INSERT fails |
| Machine exception signals | state/machine.py | InsufficientAuthorityError + MaxCyclesReachedError are raised, not swallowed |
| Sentinel bypass | routing/resolver.py + definitions/ | lod200_author_team present → routing returns sentinel, WARN logged |

### GATE_2 Submission Package (Team 11 → Team 100)

Team 11 prepares and submits:
1. **pytest report** — all Layer 0+1+2 unit tests PASS (zero failures)
2. **Cross-module integration report** — 4 tests above PASS
3. **Code review** — Team 111 reviews routing/resolver.py + state/machine.py for AD compliance
4. **DDL-ERRATA-01 status** — Team 111 update

### GATE_2 Acceptance Criteria (Team 100 decision)

- [ ] `routing/resolver.py` — complete, AD-S5-01/02/05 verified
- [ ] `prompting/` — 3 files complete, AD-S6-01/07 verified
- [ ] `state/machine.py` — complete, AD-S7-01 atomic TX verified, internal branch signals preserved
- [ ] All Layer 0+1+2 unit tests: PASS
- [ ] Cross-module integration: AD-S7-01 rollback test PASS
- [ ] No invented error codes (all from Stage 7 registry of 39 codes)
- [ ] Team 111 AD compliance sign-off on routing + machine modules
- [ ] **Team 100 GATE_2 PASS decision issued**

---

## §7 — GATE_3: Full Implementation + Integration Tests

**Responsible:** Team 21 (management/ + governance/) + Team 31 (UI) → Team 51 (14 TCs) → Team 190 (validation)
**Gate approver:** Team 190 (Constitutional Validator)
**Trigger:** GATE_2 passed

### Phase 3A — Orchestration Layer (Team 21)

**DO NOT start until GATE_2 PASS.**

#### Layer 3 — management/ (depends on ALL prior layers)

| File | Key contracts | Spec section |
|---|---|---|
| `management/use_cases.py` | UC-01..UC-14; 3 shared entry points: `advance_gate()` (UC-02/03/11), `fail_gate()` (UC-04/05), `resubmit_correction()` (UC-09/10) | Stage 8 §3.12; **F-01/F-02 fix**: internal branching, not API errors; all 14 UC signatures with exact types |
| `management/api.py` | FastAPI routes; 11 transactional/query endpoints + 8 admin CRUD endpoints; `X-API-Key` auth (AD-S8-03) | Stage 8 §3.13 + §4; Iron Rule: all errors from 39-code registry only |
| `governance/archive.py` | `generate_archive_manifest(wp_id) → dict` | Stage 8 §3.15 |
| `cli/pipeline_run.sh` | v3 CLI wrapper: `start`, `status`, `advance`, `pass`, `fail` commands | Stage 8 §1 |

#### Critical implementation rules for use_cases.py

| Rule | Location | What to implement |
|---|---|---|
| `advance_gate()` shared semantics | UC-02/03/11 | Returns `event_type: PHASE_PASSED | RUN_COMPLETED | CORRECTION_RESOLVED` discriminated by machine state |
| `fail_gate()` G03 branching | UC-04/05 | `InsufficientAuthorityError` caught → UC-05 advisory path; HTTP 200 `blocking: false` |
| `resubmit_correction()` G07/G08 branching | UC-09/10 | `MaxCyclesReachedError` caught → UC-10 escalation path; HTTP 200 `escalated: true` |
| Admin operations = ADMINISTRATIVE_ONLY | §4.11 | No event emission (AD-S8-02); team_00 auth required (AD-S8-03) |
| PAUSED actor=null | UC-13 GetCurrentState | SQL CASE WHEN status=PAUSED THEN NULL for actor columns (AD-S5-02 at SQL level) |

### Phase 3B — UI Implementation (Team 31)

**Can start in parallel with Phase 3A** once management/api.py HTTP contracts are published (Team 11 publishes §4 endpoint contracts from Stage 8 spec as team mandate).

| File | Page | Data source | Key rules |
|---|---|---|---|
| `ui/index.html` + `app.js` | Pipeline View (`/`) | `GET /api/state?domain_id=<d>` polling | Display: status badge, gate/phase, actor (null when PAUSED), sentinel indicator, correction count, execution mode, escalated warning |
| `ui/history.html` | History View (`/history`) | `GET /api/history` with filters | Filters: domain_id, gate_id, event_type (15 options), actor_team_id; pagination (limit/offset); `GATE_FAILED_ADVISORY` shown as standard event (AD-S8-04) |
| `ui/config.html` | Configuration (`/config`) | Admin CRUD endpoints (§4.11) | Routing rules table, templates list + edit (team_00 only), policy viewer; read-only for non-team_00 |
| `ui/style.css` | All pages | — | Consistent with agents_os_v2 UI canon |

**Iron Rule (enforced by Team 111):** `app.js` contains ZERO business logic. All validation is server-side. UI = renders API responses only.

### Integration Tests — All 14 TCs (Team 51)

Team 51 executes the full integration test suite from Stage 8 §7. These are the acceptance criteria for GATE_3.

| TC | Name | Modules | Key assertion |
|---|---|---|---|
| **TC-01** | Full run happy path | All | RUN_INITIATED + N×PHASE_PASSED + RUN_COMPLETED; contiguous sequence_no |
| **TC-02** | Blocking fail + correction + resolve | UC-04/09/11 | CORRECTION state cycle; correction_cycle_count=1 (not reset on resolve) |
| **TC-03** | Advisory fail | UC-05 | `blocking: false`; status stays IN_PROGRESS; GATE_FAILED_ADVISORY event |
| **TC-04** | HITL gate approval | UC-06 | `is_human_gate=1` guard; actor_type=human; GATE_APPROVED event |
| **TC-05** | Pause + resume (Branch A) | UC-07/08 | Snapshot written + cleared; gate/phase unchanged after resume |
| **TC-06** | PAUSED actor=null in GetCurrentState | UC-13 | `actor: null` in response; SQL CASE enforced |
| **TC-07** | Sentinel bypass | routing/ | SENTINEL_LEGACY path; WARN logged; no assignment lookup |
| **TC-08** | ROUTING_UNRESOLVED | UC-01 | 500 + ROUTING_UNRESOLVED event; fail-closed |
| **TC-09** | **Atomic TX rollback (AD-S7-01)** | state/ + audit/ | Simulated event INSERT failure → runs.status unchanged; no orphaned event in ledger |
| **TC-10** | Principal override FORCE_PASS | UC-12 | CORRECTION → IN_PROGRESS; PRINCIPAL_OVERRIDE event with action=FORCE_PASS |
| **TC-11** | Admin template update | §4.11 | Version bumped; L4 cache invalidated; **zero** events in events table |
| **TC-12** | Max correction cycles → escalation | UC-09/10 | `escalated: true`; CORRECTION_ESCALATED event; status stays CORRECTION |
| **TC-13** | GetHistory pagination + filter | UC-14 | total = filtered count; events = slice [offset..offset+limit] |
| **TC-14** | Wrong actor rejected | UC-02 | 403 + WRONG_ACTOR |

**TC-09 protocol (AD-S7-01 is the most critical test):**
```python
# Inject mock that raises AuditLedgerError after runs UPDATE
# Verify: runs.status unchanged (original state), events table has no new row
# Verify: machine.execute_transition() raises AuditLedgerError to caller
```

### GATE_3 Submission Package (Team 11 → Team 190)

1. pytest report — all 14 TCs PASS (zero failures, zero skips)
2. Code coverage report — management/use_cases.py ≥ 90%
3. Error code audit — list of all error codes used, confirmed against Stage 7 §6 registry
4. UI smoke test — manual confirmation all 3 pages load and render API data

### GATE_3 Acceptance Criteria (Team 190 decision)

- [ ] `management/use_cases.py` — 14 UCs, 3 shared entry points, F-01/F-02 branching correct
- [ ] `management/api.py` — 11 transactional + 8 admin endpoints; X-API-Key auth
- [ ] UI — 3 pages; Iron Rule confirmed (app.js has no business logic)
- [ ] All 14 integration TCs: PASS
- [ ] TC-09 (AD-S7-01): atomic TX rollback confirmed
- [ ] TC-11: no event emitted for admin operations (AD-S8-02)
- [ ] Error code audit: zero invented codes
- [ ] **Team 190 GATE_3 PASS decision issued**

---

## §8 — GATE_4: E2E Validation + Nimrod UX Sign-off

**Responsible:** Team 51 (E2E execution via MCP) → Team 00 (Nimrod personal approval)
**Gate approver:** **Team 00 (Nimrod)** — personal sign-off required
**Trigger:** GATE_3 passed

### Phase 4A — E2E Execution Protocol (Team 51)

Full end-to-end validation driven by MCP browser automation. The AOS v3 application must be running locally before this phase begins.

#### Pre-conditions
```bash
# Team 61 ensures:
uvicorn agents_os_v3.management.api:app --port 8090  # AOS v3 API live
# Static UI served at http://localhost:8090/
```

#### E2E Scenario 1 — Full Pipeline Happy Path (TC-01 at E2E level)

| Step | MCP Tool | Action | Assertion |
|---|---|---|---|
| 1 | `mcp__Claude_in_Chrome__navigate` | Open `http://localhost:8090/` | Pipeline View loads; status=IDLE |
| 2 | `mcp__Claude_in_Chrome__javascript_tool` | `POST /api/runs` via fetch — initiate run (domain=tiktrack, variant=TRACK_FOCUSED) | run_id returned; Pipeline View shows IN_PROGRESS |
| 3 | `mcp__Claude_in_Chrome__read_page` | Read Pipeline View | Gate/phase displayed; actor shown (not null); sentinel indicator visible |
| 4 | `mcp__Claude_in_Chrome__form_input` + `javascript_tool` | Click PASS button (advance_gate) as authorized actor | Phase advances; event_type=PHASE_PASSED in response |
| 5 | Repeat Step 4 | Advance through all phases and gates | Each advance: status stays IN_PROGRESS; phase increments |
| 6 | Final advance | Last gate advance | status=COMPLETE; RUN_COMPLETED event |
| 7 | `mcp__Claude_in_Chrome__navigate` | Open `http://localhost:8090/history` | History View shows full event chain |
| 8 | `mcp__Claude_in_Chrome__read_page` | Read history | Events: RUN_INITIATED + N×PHASE_PASSED + RUN_COMPLETED; sequence_no contiguous |

#### E2E Scenario 2 — Correction Cycle (TC-02 at E2E level)

| Step | MCP Tool | Action | Assertion |
|---|---|---|---|
| 1–2 | `javascript_tool` | Initiate run → advance to GATE_2 | IN_PROGRESS |
| 3 | `javascript_tool` | `POST /api/runs/{id}/fail` (blocking=true, reason="test") | status=CORRECTION; `blocking: true` |
| 4 | `read_page` | Refresh Pipeline View | Status badge = CORRECTION; correction_cycle_count=1 |
| 5 | `javascript_tool` | `POST /api/runs/{id}/resubmit` | status=IN_PROGRESS; `escalated: false` |
| 6 | `read_page` | History View | GATE_FAILED_BLOCKING + CORRECTION_RESUBMITTED + CORRECTION_RESOLVED in ledger |

#### E2E Scenario 3 — Advisory Fail (TC-03 at E2E level)

| Step | MCP Tool | Action | Assertion |
|---|---|---|---|
| 1 | `javascript_tool` | `POST /api/runs/{id}/fail` with actor lacking blocking authority | `blocking: false`; status stays IN_PROGRESS |
| 2 | `navigate` → history | Check History View | GATE_FAILED_ADVISORY visible in event list (AD-S8-04); NOT shown in Pipeline View status |

#### E2E Scenario 4 — Pause + Resume (TC-05/06 at E2E level)

| Step | MCP Tool | Action | Assertion |
|---|---|---|---|
| 1 | `javascript_tool` | `POST /api/runs/{id}/pause` (actor=team_00) | status=PAUSED |
| 2 | `read_page` | Pipeline View | Status=PAUSED; **actor=null** (AD-S5-02 visible in UI) |
| 3 | `javascript_tool` | `GET /api/state` | `actor: null` in JSON response |
| 4 | `javascript_tool` | `POST /api/runs/{id}/resume` (actor=team_00) | status=IN_PROGRESS; gate/phase unchanged (Branch A) |
| 5 | `read_page` | Pipeline View | Actor restored; same gate/phase as before pause |

#### E2E Scenario 5 — Configuration Page (TC-11 at E2E level)

| Step | MCP Tool | Action | Assertion |
|---|---|---|---|
| 1 | `navigate` | Open `http://localhost:8090/config` | Config page loads; routing rules table visible |
| 2 | `read_page` | Check templates section | Active templates listed with body_markdown preview |
| 3 | `javascript_tool` | `PUT /api/templates/{id}` with new body_markdown (team_00 key) | Template version bumped; success 200 |
| 4 | `javascript_tool` | `GET /api/history?event_type=TEMPLATE_UPDATED` | **events: []** — zero events for admin ops (AD-S8-02) |
| 5 | `javascript_tool` | `PUT /api/templates/{id}` with non-team_00 key | 403 Forbidden |

#### E2E Scenario 6 — Wrong Actor + Auth Boundary (TC-14 at E2E level)

| Step | MCP Tool | Action | Assertion |
|---|---|---|---|
| 1 | `javascript_tool` | `POST /api/runs/{id}/advance` with wrong actor_team_id | 403 + WRONG_ACTOR |
| 2 | `read_network_requests` | Inspect network log | WRONG_ACTOR in response body; HTTP 403 confirmed |
| 3 | `javascript_tool` | `POST /api/runs/{id}/approve` without team_00 key | 403 + NOT_PRINCIPAL |

#### E2E Validation Report (Team 51 → Team 00)

Team 51 prepares and sends to Team 00:

```
E2E Validation Report — AOS v3
Date: YYYY-MM-DD
Environment: http://localhost:8090/

Scenario 1 (Happy Path):   PASS | FAIL | screenshots attached
Scenario 2 (Correction):   PASS | FAIL
Scenario 3 (Advisory):     PASS | FAIL
Scenario 4 (Pause/Resume): PASS | FAIL
Scenario 5 (Config/Admin): PASS | FAIL
Scenario 6 (Auth/WRONG_ACTOR): PASS | FAIL

Network requests log: [attached]
Console errors: [none / list]
Coverage: TCs 01, 02, 03, 05, 06, 11, 14 verified via MCP automation

Verdict: ALL PASS / BLOCKED
```

### Phase 4B — Nimrod UX Sign-off (Team 00)

Nimrod personally reviews:

| Review Item | What to check | Pass condition |
|---|---|---|
| **Pipeline View** | Status badges legible; actor display; sentinel indicator; escalation warning when CORRECTION_ESCALATED | Dashboard is readable and operational at a glance |
| **History View** | Event timeline is clear; GATE_FAILED_ADVISORY distinguishable; filters work; pagination works | History is usable for audit purposes |
| **Configuration View** | Routing rules visible; template edit works; policy values shown | Config is operational for team_00 management tasks |
| **CLI** | `pipeline_run.sh start`, `status`, `advance`, `pass`, `fail` commands work | CLI usable without browser |
| **Overall flow** | Entire pipeline run (initiate → complete) is operable via dashboard without confusion | Can operate the system confidently |

### GATE_4 Acceptance Criteria (Team 00 decision)

- [ ] All 6 E2E scenarios: PASS (MCP validation report submitted)
- [ ] Console errors: zero blocking errors
- [ ] Network requests: no unexpected 500s
- [ ] Pipeline View: Nimrod UX approval
- [ ] History View: Nimrod UX approval
- [ ] Configuration: Nimrod UX approval
- [ ] CLI: functional
- [ ] **Team 00 (Nimrod) GATE_4 PASS decision issued**

---

## §9 — GATE_5: WP Closure + Archive

**Responsible:** Team 11 (orchestration) + Team 170 (docs) + Team 191 (archive)
**Trigger:** GATE_4 passed

### Phase 5A — Documentation (Team 170)

| Deliverable | Owner | Content |
|---|---|---|
| AOS v3 BUILD Summary Doc | Team 170 | System overview, module map, API reference index, deployment guide |
| `agents_os_v3/` README | Team 170 | Quick-start, `seed.py` usage, `definition.yaml` structure, CLI reference |
| DDL-ERRATA-01 closure note | Team 111 (if complete) | Confirm partial index applied; DDL v1.0.2 canonical |

### Phase 5B — Archive Cleanup (Team 191)

Execute `archive_pending` from Artifact Index v1.31.0:

| File | Reason | Action |
|---|---|---|
| `TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.0.md` | SUPERSEDED by v1.0.1 (CC1) | Archive |
| `TEAM_100_TO_TEAM_190_STAGE8_MODULE_MAP_REVIEW_REQUEST_v1.0.0.md` | SUPERSEDED by CC1 review request | Archive |
| All other `archive_pending` entries (STAGE_1B_GATE_CLOSE) | Per Artifact Index | Archive |

Team 191 uses `governance/archive.py → generate_archive_manifest()` to generate the cleanup manifest.

### Phase 5C — Final Artifact Index Update (Team 00)

Update `AOS_V3_SPEC_ARTIFACT_INDEX_v1.0.0.json`:
- `current_spec_stage` → `WP_CLOSED`
- Add BUILD completion artifacts (A103+)
- Mark all `archive_pending` items with `archive_completed_at`

### GATE_5 Acceptance Criteria

- [ ] Team 170: BUILD summary + README delivered
- [ ] Team 191: archive_pending entries cleaned
- [ ] DDL-ERRATA-01: either closed (v1.0.2) or formally deferred with mandate refresh
- [ ] Artifact Index updated to WP_CLOSED
- [ ] Pipeline run marked COMPLETE in AOS v3 itself (meta: first run of the system = its own build!)

---

## §10 — Module Dependency Build Sequence (Visual)

```
DEPENDENCY ORDER — STRICT (do not invert)
═══════════════════════════════════════════════════════

LAYER 0 — Leaf (no dependencies)
  definitions/models.py
  definitions/constants.py
  definitions/queries.py
            │
            ▼
LAYER 1 — Direct definitions/ dependents
  ┌─────────────────┬──────────────────┬──────────────────────┐
  │  audit/ledger   │  policy/settings │  state/repository    │
  │                 │                  │  governance/artifact  │
  └────────┬────────┴────────┬─────────┴───────────┬──────────┘
           │                 │                     │
           └────────────┬────┘                     │
                        ▼                          │
LAYER 2A — Core logic (depends on Layer 0/1)       │
  routing/resolver.py                              │
  prompting/templates.py                           │
  prompting/cache.py                               │
           │                                       │
           ▼                                       │
LAYER 2B — Composite (depends on Layer 2A)         │
  prompting/builder.py ←── routing/ + templates/ + cache/ + policy/
  state/machine.py ←──── state/repository/ + audit/ledger
           │                 │
           └────────┬────────┘
                    ▼
LAYER 3 — Orchestrator (depends on ALL layers above)
  management/use_cases.py ←── ALL modules
  management/api.py ←──────── use_cases.py
  governance/archive.py ←──── artifact_index.py

           ▼
LAYER 4 — UI (depends on API being live)
  ui/index.html + app.js (Pipeline View) ←── /api/state
  ui/history.html (History View) ←────────── /api/history
  ui/config.html (Configuration) ←─────────── /api/* admin
```

---

## §11 — Testing Strategy Summary

| Level | Owner | When | Tooling | Min bar |
|---|---|---|---|---|
| **Unit — Layer 0** | Team 51 | Parallel with Team 21 Layer 0 | pytest | 100% function coverage |
| **Unit — Layer 1** | Team 51 | Parallel with Team 21 Layer 1 | pytest | 100% function coverage |
| **Unit — Layer 2A/2B** | Team 51 | Parallel with Team 21 Layer 2 | pytest + mock | All branches, all error paths |
| **Cross-module integration (pre-GATE_2)** | Team 51 | Before GATE_2 submission | pytest | 4 critical cross-module tests |
| **Integration TCs 01–14** | Team 51 | After GATE_3 | pytest | All 14 PASS, zero skips |
| **TC-09 atomic TX** | Team 51 | Mandatory before GATE_3 | pytest + mock inject | Rollback verified at DB level |
| **E2E — 6 scenarios** | Team 51 | After GATE_3 | MCP Chrome + Preview | All 6 PASS |
| **UX review** | Team 00 (Nimrod) | After E2E PASS | Manual browser | Personal sign-off |

**Principle:** Tests co-developed with implementation. Team 51 never receives code without a test mandate. No gate passes without a pytest report.

---

## §12 — MCP E2E Tooling Reference

Team 51 uses the following MCP tools for E2E validation:

| Tool | Purpose |
|---|---|
| `mcp__Claude_in_Chrome__navigate` | Navigate to Pipeline View, History, Config |
| `mcp__Claude_in_Chrome__read_page` | Capture rendered UI state for assertions |
| `mcp__Claude_in_Chrome__javascript_tool` | Execute API calls (fetch), inspect JS state, drive actions |
| `mcp__Claude_in_Chrome__form_input` | Fill forms (API key header, run parameters) |
| `mcp__Claude_in_Chrome__find` | Locate specific UI elements (status badge, actor field, event rows) |
| `mcp__Claude_in_Chrome__read_network_requests` | Verify HTTP status codes, response bodies, no unexpected 500s |
| `mcp__Claude_in_Chrome__read_console_messages` | Confirm zero console errors; verify WARN logs for sentinel/token budget |
| `mcp__Claude_Preview__preview_screenshot` | Capture screenshots for GATE_4 UX report to Nimrod |
| `mcp__Claude_Preview__preview_network` | Inspect network traffic for API contract compliance |

**E2E test environment setup (Team 61 mandate):**
```
AOS v3 API: http://localhost:8090
Static UI:  http://localhost:8090/ (served by FastAPI StaticFiles)
Test DB:    PostgreSQL test schema (isolated, seeded from definition.yaml)
API keys:   team_00 key + team_11 key configured in definition.yaml test block
```

---

## §13 — Open Items at BUILD Entry

| Item | Owner | Status | Impact |
|---|---|---|---|
| **DDL-ERRATA-01** | Team 111 | Mandate active — partial unique index `uq_templates_active_scope` | `templates.py` application-layer guard in place; no BUILD blocker |
| **DDL v1.0.2** | Team 111 | Pending delivery | When delivered: apply migration + update SSOT reference in `templates.py` note |
| **AOS v3 WP formal registration** | Team 11 | Provisional WP ID in Artifact Index | Register formal WP_ID in pipeline before GATE_0 |

---

## §14 — 7 SSOT Documents (READ BEFORE ANY IMPLEMENTATION)

Every team reads these before touching code. No exceptions.

| # | Document | Location | Must-reads |
|---|---|---|---|
| 1 | Entity Dictionary v2.0.2 | `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md` | All entities, field names, types |
| 2 | State Machine Spec v1.0.2 | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` | T01–T12, A01–A10E, guard conditions G01–G09 |
| 3 | Use Case Catalog v1.0.3 | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md` | UC-01..UC-14 inputs/outputs/guards |
| 4 | DDL Spec v1.0.1 | `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` | Column names, types, constraints |
| 5 | Routing Spec v1.0.1 | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md` | B.1/B.2/B.3 resolution chain, sentinel |
| 6 | Prompt Architecture Spec v1.0.2 | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md` | 4-layer assembly, AD-S6-01..07 |
| 7 | Event & Observability Spec v1.0.2 | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md` | 15 event types, 39 error codes, UC-13/14 |
| 8 | Module Map + Integration Spec v1.0.1 | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md` | **Primary BUILD reference** — directory structure, all interfaces, all API contracts |

---

## §15 — Architectural Decisions — Full Carry List

Every implementer reads these ADs. Non-compliance = gate rejection.

| AD | Rule | Enforced in |
|---|---|---|
| AD-S5-01 | `process_variant` passed to resolver + returned in API response | `routing/resolver.py`, `GET /api/state` |
| AD-S5-02 | `resolve_actor()` NOT called when run.status=PAUSED; `actor=null` in all outputs | `routing/resolver.py`, `state/machine.py`, SQL in UC-13 |
| AD-S5-03 | UC-08 Branch A: read snapshot only; no routing re-query | `management/use_cases.py:resume_run()` |
| AD-S5-05 | Sentinel `lod200_author_team` exposed in `/api/state` response | `GET /api/state` response schema |
| AD-S6-01 | L1 (system) + L3 (domain) layers: NEVER cached | `prompting/cache.py` — only L2 + L4 |
| AD-S6-02 | Unknown placeholder in template = `TemplateRenderError` (hard failure) | `prompting/builder.py` |
| AD-S6-03 | Template specificity chain: (gate+phase+domain) → (gate+phase) → (gate+domain) → (gate) | `prompting/templates.py` SQL |
| AD-S6-04 | `prompts` table = audit + PFS only; not lookup | `prompting/builder.py` — write only |
| AD-S6-05 | `get_policy_value()` returns full JSON object | `policy/settings.py` |
| AD-S6-06 | Template SQL uses `IS NOT DISTINCT FROM NULL` | `prompting/templates.py` SQL |
| AD-S6-07 | Token budget check = `log.warn` only; no block, no error code | `prompting/builder.py:_check_token_budget()` |
| AD-S7-01 | State transition + event emission = **same DB transaction**; `AuditLedgerError` → full rollback | `state/machine.py` |
| AD-S8-01 | Admin ops = ADMINISTRATIVE_ONLY; not formal UCs | `management/api.py` §4.11 |
| AD-S8-02 | No events emitted for admin ops; event registry closed at 15 | `management/api.py` §4.11 |
| AD-S8-03 | Auth = API key per team via `X-API-Key` header | `management/api.py` — all endpoints |
| AD-S8-04 | `GATE_FAILED_ADVISORY` in History View only; not a status indicator in Pipeline View | `ui/` |
| AD-S8-05 | Escalation = passive (event + dashboard + log.warn); no push/email | `management/use_cases.py:resubmit_correction()` |

---

**log_entry | TEAM_00 | AOS_V3_BUILD_PROCESS_MAP | v1.0.0 | ACTIVE | 2026-03-27**
