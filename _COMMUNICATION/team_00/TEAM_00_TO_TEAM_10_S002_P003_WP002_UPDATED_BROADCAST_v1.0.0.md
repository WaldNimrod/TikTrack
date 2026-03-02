# UPDATED TEAM BROADCAST — S002-P003-WP002 G7 REMEDIATION
## Complete Work Plan for Current Package

```
from:           Team 00 — Chief Architect
to:             Team 10 (Gateway), Team 20 (Backend), Team 30 (Frontend),
                Team 40 (UI Assets), Team 50 (QA+FAV), Team 60 (Runtime/Infra),
                Team 90 (Validation), Team 170 (Spec/Governance), Team 190 (Constitutional)
date:           2026-03-02
re:             S002-P003-WP002 — complete updated work plan post GATE_7 rejection
status:         ACTIVE — package is in GATE_3 execution
```

---

## SITUATION SUMMARY

Work package S002-P003-WP002 (D22 + D33 + D34 + D35) was **rejected at GATE_7** (human browser-level validation). Per Gate Model Protocol, this returns the package to **GATE_3** — full development cycle required.

Since the rejection, this session has produced:
1. A complete architectural specification (16 findings, LOD400-complete)
2. A LOD400 supplement (5 implementation gaps closed)
3. An addendum (2 additional scope items added: `display_name` + background task orchestration)
4. A standalone architectural directive for background task orchestration (systemic fix)
5. A roadmap amendment directive (for Team 170)

**Everything is specified. Nothing is left to assumption. Build exactly what is written.**

---

## THE COMPLETE SPECIFICATION PACKAGE

Read all 4 documents, in order, before writing any code:

```
1. ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0.md
   → 16 findings, 3 streams, DB migrations M-001..M-007, acceptance criteria

2. ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT_v1.0.0.md
   → LOD400 detail: entityOptionLoader.js, trigger_status UX, notification bell,
     crosses evaluation engine, job_run_log integration

3. ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_ADDENDUM_v1.0.0.md  ← NEW
   → display_name on user_tickers (M-001 amendment)
   → Background task orchestration migration (APScheduler)
   → M-005b extended job_run_log schema
   → Background Jobs UI section in system_management.html

4. ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md           ← NEW
   → Canonical runtime lock: APScheduler in FastAPI lifespan
   → scheduler_registry.py Iron Rule
   → job_runner.py shared bootstrap Iron Rule
   → DB single-flight, evidence classification, admin control plane spec
```

All 4 documents are in: `_COMMUNICATION/_Architects_Decisions/`

---

## COMPLETE SCOPE — WHAT MUST BE BUILT

### Stream 1 — Backend Infrastructure (do first, blocks everything)

| Item | Source | Key deliverable |
|---|---|---|
| M-001: user_tickers + display_name | Main §5 + Addendum §1 | status, notes, display_name, updated_at, updated_by |
| M-002: alerts trigger_status | Main §5 | trigger_status field |
| M-003: notifications table | Main §5 | user_data.notifications |
| M-004: admin_data schema | Main §5 | schema creation |
| M-005b: job_run_log extended | Addendum §2 | all new columns per spec |
| M-006: tickers status verify | Main §5 | status field check |
| M-007: alerts data migration | Main §5 | data backfill |
| canonical_ticker_service.py | Main stream 1 | single creation path |
| Status cascade | Main stream 1 | system_ticker cancelled → user_tickers |
| deleted_at policy | Main stream 1 | supplement to status |
| APScheduler setup | Addendum §2 | scheduler_registry.py, scheduler_startup.py, job_runner.py |
| sync_intraday.py → module | Addendum §2 | api/background/jobs/sync_intraday.py |
| check_alert_conditions.py → module | Addendum §2 | api/background/jobs/check_alert_conditions.py |
| api/routers/background_jobs.py | Main + Addendum | 6 admin endpoints |

### Stream 2 — Semantic Layer + Condition Builder (after M-001..M-007 applied)

| Item | Source | Key deliverable |
|---|---|---|
| statusValues.js integration | Main stream 2 | user_ticker status display |
| Condition builder UI | Main F-06 + Supplement Gap A | 7 fields × 7 operators |
| entityOptionLoader.js | Supplement Gap A | shared dynamic entity loader |
| Alert filter bug fix | Main F-10 | ticker_id in query string |
| Note parent_type model | Main F-15 | no 'general', datetime field |
| Note form dynamic loading | Main F-16 | entityOptionLoader per type |
| Alert evaluation engine | Main F-13 + Supplement Gap E | crosses logic, job_run_log |
| Notifications CRUD | Main F-14 + Supplement Gap C | user_data.notifications endpoints |

### Stream 3 — UX Components (after Stream 2)

| Item | Source | Key deliverable |
|---|---|---|
| display_name in D33 table + form | Addendum §1 | optional text field, show if set |
| trigger_status row treatment | Main F-11 + Supplement Gap B | visual treatment, re-arm button |
| Notification bell widget | Main F-12 + Supplement Gap C | notificationBell.js, polling, badge |
| Background Jobs UI section | Addendum §2 + BG directive §5 | system_management.html new section |
| Email notification preview | Main F-12 | DB flag only, no SMTP |

---

## EXECUTION ORDER

```
Phase A: DB migrations M-001..M-007 + M-005b (all migrations first, in order)
Phase B: canonical_ticker_service.py + APScheduler infrastructure + service layer updates
Phase C: entityOptionLoader.js + condition builder + note parent model + evaluation engine
Phase D: display_name + statusValues + trigger_status UX + notification bell + BG jobs UI
Phase E: Full regression suite (D22 + D33 + D34 + D35 API scripts + E2E suites)
```

---

## IRON RULES (violations block GATE_4)

1. Financial values: `NUMERIC(20,8)` — zero rounding
2. All logs: `maskedLog` — no raw values
3. Status values: `pending | active | inactive | cancelled` per SSOT — everywhere
4. PhoenixModal `cancelButtonText`: always pass `'ביטול'` explicitly
5. Single ticker creation path: all creates → `canonical_ticker_service.py`
6. `ticker_indicators` table: **DEFERRED** — do not implement
7. **`scheduler_registry.py` is the ONLY place jobs are registered** — Iron Rule
8. **No script parses `api/.env` directly** — use FastAPI settings — Iron Rule
9. **`fcntl` is banned** in background jobs — DB single-flight only
10. **`launchd` plist must not exist in repo** — remove it
11. Rich text: **one unified component** — no per-entity variations

---

## COMPLETE ACCEPTANCE CRITERIA CHECKLIST

### Migrations
- [ ] M-001: user_tickers has status, notes, display_name, updated_at, updated_by
- [ ] M-002: alerts has trigger_status column
- [ ] M-003: user_data.notifications table exists
- [ ] M-004: admin_data schema exists
- [ ] M-005b: job_run_log has runtime_class, exit_code, duration_ms, records_failed, executor_info, etc.
- [ ] M-006: tickers status verified
- [ ] M-007: alerts data migrated
- [ ] All migration rollback scripts present and validated (exit 0 dry-run)

### Backend — Stream 1
- [ ] canonical_ticker_service.py exists; D22 + D33 creates route through it
- [ ] Status cascade: cancel system_ticker → all user_tickers cancelled + deleted_at
- [ ] APScheduler starts in FastAPI lifespan (confirmed in startup log)
- [ ] scheduler_registry.py lists sync_intraday + check_alert_conditions
- [ ] Both job modules exist at api/background/jobs/
- [ ] Both jobs produce job_run_log rows with runtime_class='TARGET_RUNTIME'
- [ ] api/routers/background_jobs.py: 6 endpoints responding (200 for list, 200 for trigger)
- [ ] fcntl NOT present in any background file
- [ ] .env parsing NOT present in any background file
- [ ] launchd plist NOT in repo

### Backend — Stream 2
- [ ] trigger_status values: untriggered | triggered_unread | triggered_read
- [ ] VALID_TARGET_TYPES: 'general' NOT present
- [ ] update_alert() bug: target_type/target_id/ticker_id not updatable after create
- [ ] Condition builder: 7 fields, 7 operators including crosses_above/crosses_below
- [ ] Alert filter: ticker_id param correctly passed
- [ ] Note parent_type: no 'general'; datetime = single datetime field
- [ ] check_alert_conditions evaluation: crosses logic correct (2-point comparison)

### Backend — Notifications + Jobs
- [ ] Notification created on alert trigger
- [ ] Email preview record created (no SMTP)
- [ ] Background Jobs section visible in system_management.html
- [ ] Manual trigger button works (returns 200, creates run)
- [ ] Enable/disable toggle works (skipped_disabled on next run)

### Frontend — D33
- [ ] display_name column shows: display_name if set, symbol otherwise
- [ ] Edit form includes display_name field (optional, max 100)
- [ ] Status column shows canonical labels (pending/active/inactive/cancelled)
- [ ] No browser alert() calls — replaced with PhoenixModal confirmMode

### Frontend — D34
- [ ] Condition builder renders all 7 fields and 7 operators
- [ ] entityOptionLoader.js populates entity dropdowns dynamically
- [ ] trigger_status row treatment: visual distinction for triggered_unread
- [ ] Re-arm button in alert details modal
- [ ] Notification bell in unified-header (polling, unread badge)

### Frontend — D35
- [ ] Note form: parent_type dropdown drives entity loading via entityOptionLoader
- [ ] 'general' parent_type NOT present in any dropdown

### Tests
- [ ] D22 API script: 12/12 PASS
- [ ] D34 API script: ≥14/14 PASS (including ≥4 error contract tests)
- [ ] D35 E2E: 5/5 PASS
- [ ] D33 E2E: documented result (X/Y PASS exit 0)
- [ ] Background job smoke test: both jobs run, job_run_log rows correct
- [ ] DB single-flight test: concurrent trigger → skipped_concurrent row
- [ ] SOP-013 seals issued for D34-FAV and D35-FAV tracks

---

## GATE PATH

```
GATE_3 (ACTIVE — you are here)
  → GATE_4: Team 50 QA
  → GATE_5: Team 90 Validation
  → GATE_6: Team 100 Architectural Review
  → GATE_7: Nimrod Browser-Level Sign-Off
```

**DO NOT submit to GATE_4 until every checkbox above is GREEN.**

---

## TEAM ROUTING

| Team | Responsibility |
|---|---|
| **Team 10** | Integration lead, master plan, team activation, gate submissions |
| **Team 20** | All backend: migrations, services, routers, evaluation engine, APScheduler |
| **Team 30** | All frontend: condition builder, entityOptionLoader, notification bell, BG jobs UI, D33 display_name, D35 parent form |
| **Team 40** | UI Assets & Design: design tokens, CSS, visual consistency (advisory role in this WP — no active deliverable unless new design assets are required) |
| **Team 50** | QA + FAV: all test scripts, E2E suites, regression, final acceptance validation, SOP-013 seals |
| **Team 60** | Runtime re-validation: APScheduler startup, TARGET_RUNTIME evidence, M-005b applied |
| **Team 90** | GATE_5 validation submission package |
| **Team 170** | (separate routing) Roadmap amendment per ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0.md |
| **Team 190** | Constitutional review of background tasks directive responses |

---

## KEY REFERENCE FILES

```
# Your spec package:
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_ADDENDUM_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md

# Key governance:
documentation/docs-governance/01-FOUNDATIONS/TT2_SYSTEM_STATUS_VALUES_SSOT.md
documentation/docs-governance/01-FOUNDATIONS/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md
documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md

# Key models to extend:
api/models/user_tickers.py        api/models/alerts.py
api/models/notes.py               api/models/tickers.py

# Key UI patterns:
ui/src/views/shared/unified-header.html
ui/src/components/shared/PhoenixModal.js
ui/src/views/management/systemManagement/system_management.html

# Background job pattern (reference):
scripts/sync_ticker_prices_intraday.py   ← current pattern; to be REPLACED by module
```

---

*log_entry | TEAM_00 | UPDATED_BROADCAST_S002_P003_WP002 | ACTIVE | 2026-03-02*
