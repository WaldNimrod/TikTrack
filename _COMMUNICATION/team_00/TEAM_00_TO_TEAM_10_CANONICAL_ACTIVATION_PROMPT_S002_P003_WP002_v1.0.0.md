# TEAM 00 → TEAM 10 — Canonical Activation Prompt
## S002-P003-WP002 G7 Remediation — Full Execution Package

```
from:           Team 00 — Chief Architect
to:             Team 10 — Gateway & Execution Lead
date:           2026-03-02
re:             S002-P003-WP002 — GATE_3 ACTIVE — full execution activation
status:         ACTIVE — read and act immediately
authority:      Team 00 constitutional authority + Nimrod approval
```

---

## YOUR ROLE IN THIS PACKAGE

You are **Team 10 — Gateway**. This means:

- You own the master execution plan for this work package
- You activate all other teams and sequence their work
- You are the single point of contact for cross-team routing
- You submit to GATE_4 when all criteria are GREEN
- You update the WSM at each gate transition
- You NEVER build code — you orchestrate who builds what and when

**DO NOT skip ahead. Read the full specification package before activating any team.**

---

## STEP 1 — READ THE FULL SPECIFICATION PACKAGE (in order)

Before issuing any team activation, read all 4 documents. They are additive — later documents amend and extend earlier ones.

```
DOCUMENT 1 — Main G7 Remediation Directive (16 findings, 3 streams)
  _COMMUNICATION/_Architects_Decisions/
  ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0.md

DOCUMENT 2 — LOD400 Supplement (5 implementation gaps A-E)
  _COMMUNICATION/_Architects_Decisions/
  ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT_v1.0.0.md

DOCUMENT 3 — Addendum (display_name + APScheduler migration) ← NEW
  _COMMUNICATION/_Architects_Decisions/
  ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_ADDENDUM_v1.0.0.md

DOCUMENT 4 — Background Task Orchestration Canonical Lock ← NEW
  _COMMUNICATION/_Architects_Decisions/
  ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md
```

**Also read** your updated broadcast document for the complete scope summary:
```
  _COMMUNICATION/team_00/
  TEAM_00_TO_TEAM_10_S002_P003_WP002_UPDATED_BROADCAST_v1.0.0.md
```

---

## STEP 2 — MASTER EXECUTION PLAN

The work is organized into 5 execution phases. **Do not begin a later phase until the prior phase is complete.** Phases A and B are sequential; C/D may overlap with careful coordination.

### Phase A — DB Migrations (foundations, blocks everything else)

**Owner: Team 20**
Run all migrations in this exact order:

| Migration | Table | Content |
|---|---|---|
| M-001 | `user_data.user_tickers` | ADD status, notes, display_name, updated_at, updated_by |
| M-002 | `user_data.alerts` | ADD trigger_status |
| M-003 | `user_data.notifications` | CREATE TABLE |
| M-004 | `admin_data` | CREATE SCHEMA IF NOT EXISTS |
| M-005b | `admin_data.job_run_log` | Extended schema (replaces M-005 — see Addendum §2) |
| M-006 | `market_data.tickers` | Verify status column exists |
| M-007 | `user_data.alerts` | Data migration: backfill status/trigger_status |

**All migration rollback scripts must exist and exit 0 on dry-run before GATE_4.**

---

### Phase B — Backend Infrastructure (after M-001..M-007 applied)

**Owner: Team 20**

| Deliverable | Source | Location |
|---|---|---|
| `canonical_ticker_service.py` | Main directive §stream1 | `api/services/canonical_ticker_service.py` |
| Status cascade service | Main directive §stream1 | `api/services/tickers_service.py` (extend) |
| APScheduler infrastructure | Addendum §2 + BG directive §2-4 | `api/background/` (full module tree) |
| `sync_intraday.py` module | Addendum §2 | `api/background/jobs/sync_intraday.py` |
| `check_alert_conditions.py` module | Addendum §2 + Main §stream2 | `api/background/jobs/check_alert_conditions.py` |
| `api/routers/background_jobs.py` | BG directive §4.3 | 6 endpoints |
| FastAPI lifespan hook | BG directive §4.2 | `api/main.py` |
| Notifications service | Main §F-14 | `api/services/notifications_service.py` |
| Notifications router | Main §F-14 | `api/routers/notifications.py` |

**APScheduler file tree required:**
```
api/
  background/
    __init__.py
    scheduler_registry.py      ← Iron Rule: ALL jobs registered here
    scheduler_startup.py       ← lifespan hook
    job_runner.py              ← shared bootstrap
    jobs/
      __init__.py
      sync_intraday.py
      check_alert_conditions.py
```

---

### Phase C — Semantic Layer + Frontend Core (after Phase B)

**Owners: Team 20 (backend) + Team 30 (frontend)**

| Deliverable | Owner | Source |
|---|---|---|
| Alert condition builder backend | Team 20 | Main §F-06 + Supplement §Gap A |
| `entityOptionLoader.js` | Team 30 | Supplement §Gap A |
| Alert evaluation engine (crosses logic) | Team 20 | Main §F-13 + Supplement §Gap E |
| Alert filter bug fix | Team 30 | Main §F-10 |
| Note parent_type model fix (remove 'general') | Team 20 + Team 30 | Main §F-14, §F-15, §F-16 |
| Note form dynamic entity loading | Team 30 | Main §F-16 + Supplement §Gap A |
| `statusValues.js` integration | Team 30 | Main §stream2 |
| `trigger_status` backend values | Team 20 | Main §F-11 + Supplement §Gap B |
| Crosses evaluation: 2-point comparison | Team 20 | Supplement §Gap E |

---

### Phase D — UX + Display Layer (after Phase C)

**Owner: Team 30, advisory Team 40 (UI Assets)**

| Deliverable | Owner | Source |
|---|---|---|
| `display_name` in D33 table + edit form | Team 30 | Addendum §1 |
| `trigger_status` row treatment + re-arm button | Team 30 | Main §F-11 + Supplement §Gap B |
| Notification bell widget | Team 30 | Main §F-12 + Supplement §Gap C |
| Background Jobs UI section in system_management.html | Team 30 | Addendum §2 + BG directive §5 |
| Email notification preview record (no SMTP) | Team 30 | Main §F-12 |
| D33: Replace browser alert() with PhoenixModal | Team 30 | Main §F-03 |
| D33: Add edit action (status + notes) | Team 30 | Main §F-04 |
| All cancel buttons → 'ביטול' | Team 30 | Main §iron rules |
| All action button tooltips | Team 30 | Main §F-13 |

**Team 40 involvement:** Advisory only in this WP unless new design tokens or CSS assets are explicitly requested. Do not route QA, testing, or validation to Team 40.

---

### Phase E — QA, Testing & FAV (after Phases A–D complete)

**Owner: Team 50 (QA + FAV)**

| Deliverable | Source | Target |
|---|---|---|
| D22 API test script | Main §acceptance criteria | 12/12 PASS |
| D34 API FAV script (extended with ≥4 error contracts) | Main + GF-G6-003 fix | ≥14/14 PASS |
| D35 E2E suite (with error contract tests) | Main + GF-G6-003 fix | 5/5 PASS |
| D33 E2E suite | Main §acceptance criteria | X/Y PASS exit 0 |
| Background job smoke test | Addendum §2 acceptance criteria | Both jobs: TARGET_RUNTIME run log present |
| DB single-flight test | BG directive §2.4 | Concurrent trigger → `skipped_concurrent` row |
| SOP-013 Seal — D34-FAV track | SOP-013 protocol | Seal block in completion report |
| SOP-013 Seal — D35-FAV track | SOP-013 protocol | Seal block in completion report |

**Team 50 must issue SOP-013 seals for BOTH D34-FAV and D35-FAV tracks before GATE_4 submission.**

---

### Phase F — Runtime Re-Validation

**Owner: Team 60 (DevOps & Platform)**

Team 60's previous BLOCK clears when:
1. APScheduler starts in FastAPI lifespan (confirmed in startup log)
2. Both jobs (`sync_intraday` + `check_alert_conditions`) run with `runtime_class='TARGET_RUNTIME'`
3. `job_run_log` rows present with all extended fields populated (M-005b applied)

**Evidence required from Team 60:**
- APScheduler startup log line (captured during application start)
- At least one `job_run_log` row per job showing `runtime_class='TARGET_RUNTIME'`, `status='completed'`, `duration_ms` populated

---

## STEP 3 — TEAM ACTIVATION SEQUENCE

Activate teams in this order. Do NOT activate Phase B teams until Phase A is verified complete.

```
ACTIVATE NOW:
  Team 20 → Phase A (DB migrations M-001..M-007 + M-005b)

ACTIVATE AFTER M-001..M-007 APPLIED (Team 20 confirms):
  Team 20 → Phase B (APScheduler, services, routers)
  Team 60 → Parallel: verify M-005b applied; prepare runtime re-validation

ACTIVATE AFTER Phase B COMPLETE:
  Team 20 → Phase C backend (condition builder, evaluation engine, notifications)
  Team 30 → Phase C frontend (entityOptionLoader, condition builder UI, filter fix)

ACTIVATE AFTER Phase C COMPLETE:
  Team 30 → Phase D (display_name, trigger_status UX, notification bell, BG jobs UI)
  Team 40 → Advisory only (contact only if Team 30 requires new design assets)

ACTIVATE AFTER Phases A–D COMPLETE:
  Team 50 → Phase E (full QA + FAV + SOP-013 seals)
  Team 60 → Phase F (runtime re-validation, confirm BLOCK cleared)

ACTIVATE AFTER Phase E + F COMPLETE:
  Team 90 → GATE_5 Validation submission preparation
```

---

## STEP 4 — DOCUMENTS TO ROUTE TO EACH TEAM

When activating each team, route the following documents:

| Team | Documents to route |
|---|---|
| **Team 20** | Main directive + Supplement + Addendum + BG Orchestration directive — ALL 4 |
| **Team 30** | Main directive + Supplement + Addendum + BG Orchestration directive §5 (UI section) |
| **Team 40** | Updated broadcast (for context). Advisory role only. |
| **Team 50** | Updated broadcast + Main directive acceptance criteria + GF-G6-003 remediation requirements |
| **Team 60** | BG Orchestration directive §2 (runtime model) + §7 (interim operating rule) + Addendum §2 acceptance criteria |
| **Team 90** | Updated broadcast (for GATE_5 preparation) |
| **Team 100** | Updated broadcast (awareness; GATE_6 owner) |

---

## STEP 5 — WSM UPDATE

Before activating teams, update the WSM:

1. Confirm `current_gate = GATE_3` is reflected (it should be — GATE_7 rejection triggers GATE_3 rollback)
2. Add scope note to WSM CURRENT_OPERATIONAL_STATE:
   ```
   scope_extensions_2026-03-02:
     - background_task_orchestration: APScheduler migration (2 scripts → modules)
     - display_name: user_tickers.display_name VARCHAR(100) NULL added to M-001
   ```

**Do NOT update the WSM gate state beyond GATE_3 until Team 50 and Team 60 evidence is complete.**

---

## STEP 6 — GATE_4 SUBMISSION CRITERIA

**DO NOT submit to GATE_4 until every item below is GREEN.**

Before submitting, confirm with each team:

### Team 20 confirmation required:
- [ ] All 7 migrations applied (M-001..M-007 + M-005b) — exit 0
- [ ] All rollback scripts exist and exit 0 dry-run
- [ ] `canonical_ticker_service.py` exists; D22 + D33 creates route through it
- [ ] Status cascade: cancel system_ticker → all user_tickers cancelled + deleted_at
- [ ] APScheduler starts in FastAPI lifespan (startup log evidence)
- [ ] `scheduler_registry.py` lists both jobs
- [ ] Both job modules exist at `api/background/jobs/`
- [ ] `api/routers/background_jobs.py`: 6 endpoints responding
- [ ] `fcntl` NOT present in any background file
- [ ] Direct `.env` parsing NOT present in any background file
- [ ] `launchd` plist NOT in repo
- [ ] Condition builder: 7 fields × 7 operators including crosses_above/crosses_below
- [ ] Notifications: created on alert trigger
- [ ] DB single-flight: concurrent trigger → `skipped_concurrent` row

### Team 30 confirmation required:
- [ ] D33: `display_name` column shows (display_name if set, symbol otherwise)
- [ ] D33: Edit form includes `display_name` field (optional, max 100)
- [ ] D33: No browser `alert()` calls — replaced with PhoenixModal confirmMode
- [ ] D34: Condition builder renders all 7 fields and 7 operators
- [ ] D34: `entityOptionLoader.js` populates entity dropdowns dynamically
- [ ] D34: `trigger_status` row treatment: visual distinction for `triggered_unread`
- [ ] D34: Re-arm button in alert details modal
- [ ] D34: Notification bell in unified-header (polling, unread badge)
- [ ] D35: Note form parent_type dropdown drives entity loading via `entityOptionLoader`
- [ ] D35: 'general' parent_type NOT present in any dropdown
- [ ] Background Jobs section visible and functional in `system_management.html`

### Team 50 confirmation required:
- [ ] D22 API script: 12/12 PASS exit 0
- [ ] D34 API script: ≥14/14 PASS (including ≥4 error contract tests)
- [ ] D35 E2E: 5/5 PASS exit 0 (including error contracts)
- [ ] D33 E2E: documented result (X/Y PASS exit 0)
- [ ] Background job smoke test: both jobs run, `job_run_log` rows correct
- [ ] DB single-flight test: concurrent trigger → `skipped_concurrent` row
- [ ] **SOP-013 Seal: D34-FAV track** — seal block in completion report
- [ ] **SOP-013 Seal: D35-FAV track** — seal block in completion report

### Team 60 confirmation required:
- [ ] APScheduler startup confirmed in log
- [ ] Both jobs produced `job_run_log` rows with `runtime_class='TARGET_RUNTIME'`
- [ ] M-005b applied — all new columns present in `job_run_log`

---

## STEP 7 — GATE PATH

```
GATE_3 (ACTIVE — you are here)
  ↓ Team 20 + Team 30 + Team 60 execute
  ↓ Team 50 validates
GATE_4: Team 50 QA → submit to Team 90
GATE_5: Team 90 Validation package
GATE_6: Team 100 Architectural Review
GATE_7: Nimrod Browser-Level Sign-Off (Team 00)
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
12. **Team 50 = QA + FAV** — never route QA or testing to Team 40

---

## TEAM ROSTER REFERENCE

| Team | Role | This WP |
|---|---|---|
| Team 10 | **YOU** — Gateway, execution lead | Orchestrate all teams, own gate submissions |
| Team 20 | Backend Implementation | Migrations, services, routers, APScheduler, evaluation engine |
| Team 30 | Frontend Execution | Condition builder, entityOptionLoader, notification bell, BG jobs UI, display_name, D33 edit |
| Team 40 | UI Assets & Design | **Advisory only** — no active deliverable unless new design assets needed |
| Team 50 | **QA + FAV** | ALL test scripts, E2E suites, regression, FAV, SOP-013 seals |
| Team 60 | DevOps & Platform | APScheduler startup evidence, TARGET_RUNTIME confirmation, M-005b verification |
| Team 90 | Validation | GATE_5 submission package |
| Team 100 | Architectural Review | GATE_6 |
| Team 170 | Spec & Governance | (separate routing — see canonical alignment document) |
| Team 190 | Constitutional Validation | Background tasks directive review (separate prompt) |

---

## KEY REFERENCE FILES

```
# Specification package:
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_ADDENDUM_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md

# Your broadcast:
_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_S002_P003_WP002_UPDATED_BROADCAST_v1.0.0.md

# Team roster (Iron Rule reference):
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md

# Governance SSOTs:
documentation/docs-governance/01-FOUNDATIONS/TT2_SYSTEM_STATUS_VALUES_SSOT.md
documentation/docs-governance/01-FOUNDATIONS/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md
documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md

# Key models:
api/models/user_tickers.py        api/models/alerts.py
api/models/notes.py               api/models/tickers.py

# Key UI patterns:
ui/src/views/shared/unified-header.html
ui/src/components/shared/PhoenixModal.js
ui/src/views/management/systemManagement/system_management.html

# Background job reference (to be replaced):
scripts/sync_ticker_prices_intraday.py
scripts/check_alert_conditions.py
```

---

*log_entry | TEAM_00 | TEAM_10_CANONICAL_ACTIVATION_PROMPT_S002_P003_WP002 | ACTIVE | 2026-03-02*
