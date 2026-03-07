# ARCHITECT DIRECTIVE — G7 Remediation Addendum
## S002-P003-WP002 — Session 2026-03-02 Additions

```
directive_id:  ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_ADDENDUM_v1.0.0
author:        Team 00 — Chief Architect
date:          2026-03-02
status:        LOCKED
authority:     Nimrod-approved, Team 00 constitutional authority
supplements:
  - ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0.md         (main directive)
  - ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT_v1.0.0.md (LOD400 gaps A-E)
references:
  - ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md           (runtime lock)
routes_to:
  - Team 10: integrate into G7 remediation master plan immediately
  - Team 20: implementation
  - Team 60: runtime re-validation
```

---

## PURPOSE

This addendum adds two items to the S002-P003-WP002 scope that were not in the original directive:

1. **`display_name` field on `user_tickers`** — addition to migration M-001
2. **Background task orchestration migration** — APScheduler conversion of both background scripts

Both are mandatory. Both must be complete before GATE_4 handoff.

---

## ADDITION 1 — `display_name` on `user_tickers` (M-001 amendment)

### Decision
Legacy V1 had `name_custom` — a free-text label that users gave to tickers for personal display ("AAPL Core", "My ETF Hedge"). This field was absent from the original G7 directive.

Nimrod-approved 2026-03-02: Add `display_name VARCHAR(100) NULL` to `user_tickers`.

### Schema Change (amend M-001)

```sql
-- ADD to existing M-001 migration (after status + notes columns):
ALTER TABLE user_data.user_tickers
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(100) NULL;

COMMENT ON COLUMN user_data.user_tickers.display_name
    IS 'User-defined display label for this ticker (personal alias, optional)';
```

### API Changes

**UserTickerResponse schema:** Add `display_name: Optional[str] = None`

**UserTickerCreate / UserTickerUpdate:** Add `display_name: Optional[str] = Field(None, max_length=100)`

**D33 Table column:** Add "שם תצוגה" column (nullable, shows `display_name` if set, otherwise shows `ticker.symbol`).

**D33 Edit form:** Add optional text input labeled "שם תצוגה (אישי)" below ticker symbol field.

### Acceptance Criteria
- [ ] `display_name` column exists on `user_tickers` after migration
- [ ] API returns `display_name` in all user_ticker response objects
- [ ] Create/edit form exposes the field
- [ ] Table renders display_name if set, symbol otherwise
- [ ] max_length=100 enforced at API level (422 if exceeded)

---

## ADDITION 2 — Background Task Orchestration Migration

### Decision
**Full canonical lock:** `ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md`

Team 60's readiness check produced a hard BLOCK:
```
launchd: [Errno 1] Operation not permitted × 150 invocations (SIP/Gatekeeper blocked)
```
Team 190 confirmed the pattern is systemic across all background scripts.

This addendum mandates resolution within the current WP execution cycle.

### What changes in this WP

| Item | Old | New |
|---|---|---|
| `sync_ticker_prices_intraday.py` | `scripts/` standalone, fcntl lock, direct .env parse | `api/background/jobs/sync_intraday.py` module, APScheduler, shared bootstrap |
| `check_alert_conditions.py` | `scripts/` standalone, fcntl lock, direct .env parse | `api/background/jobs/check_alert_conditions.py` module, APScheduler, shared bootstrap |
| Scheduler trigger | macOS launchd (SIP-blocked) | APScheduler in FastAPI lifespan |
| Single-flight lock | fcntl (host-local) | DB-based via job_run_log |
| Config access | direct `.env` parse per script | FastAPI settings (shared) |
| `api/routers/background_jobs.py` | MISSING | BUILT (6 endpoints) |
| `job_run_log` schema | M-005 (incomplete) | Extended schema per directive §3 |

### New files required (in addition to G7 main directive)

```
api/
  background/
    __init__.py
    scheduler_registry.py          ← Iron Rule: all jobs registered here
    scheduler_startup.py           ← APScheduler lifespan hook
    job_runner.py                  ← shared bootstrap
    jobs/
      __init__.py
      sync_intraday.py             ← converted from scripts/sync_ticker_prices_intraday.py
      check_alert_conditions.py    ← converted from scripts/check_alert_conditions.py
```

### M-005b — Extended job_run_log schema

Replace M-005 DDL with:

```sql
-- M-005b: extended job_run_log (replaces M-005 if not yet applied; ALTER TABLE if M-005 applied)
ALTER TABLE admin_data.job_run_log
    ADD COLUMN IF NOT EXISTS runtime_class   VARCHAR(40)   NOT NULL DEFAULT 'TARGET_RUNTIME',
    ADD COLUMN IF NOT EXISTS exit_code       SMALLINT,
    ADD COLUMN IF NOT EXISTS duration_ms     INTEGER,
    ADD COLUMN IF NOT EXISTS records_skipped INTEGER,
    ADD COLUMN IF NOT EXISTS records_failed  INTEGER,
    ADD COLUMN IF NOT EXISTS error_class     VARCHAR(100),
    ADD COLUMN IF NOT EXISTS stdout_ref      TEXT,
    ADD COLUMN IF NOT EXISTS stderr_ref      TEXT,
    ADD COLUMN IF NOT EXISTS executor_info   JSONB;

-- job_run_log status canonical values:
-- running | completed | failed | skipped_concurrent | skipped_disabled | timeout

CREATE INDEX IF NOT EXISTS idx_job_run_log_job_name_started
    ON admin_data.job_run_log(job_name, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_run_log_running
    ON admin_data.job_run_log(status) WHERE status = 'running';
```

### Background Jobs UI section in system_management.html

Per `ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md §5`:

- Summary bar: total / running / disabled / last failure
- Jobs table: name, description, cadence, enabled toggle, last run, last status, duration, records, actions (▶ manual trigger, 📋 history)
- Run history panel: inline expansion, last 20 runs, all extended fields visible

### Iron Rules (inherited from background tasks directive)

1. **`scheduler_registry.py` is the ONLY place jobs are registered** — no job exists outside it
2. **No script may parse `api/.env` directly** — use FastAPI settings
3. **`fcntl` is banned** — DB single-flight only
4. **`launchd` plist must be removed from repo** — it is SIP-blocked and misleading

### Acceptance Criteria (addition to main directive checklist)

- [ ] `api/background/scheduler_registry.py` exists and lists both jobs
- [ ] APScheduler starts during FastAPI lifespan (confirmed in startup log)
- [ ] `sync_intraday.py` module runs via APScheduler with `runtime_class='TARGET_RUNTIME'`
- [ ] `check_alert_conditions.py` module runs via APScheduler with `runtime_class='TARGET_RUNTIME'`
- [ ] Both jobs produce `job_run_log` rows with all extended fields populated
- [ ] `api/routers/background_jobs.py` exists with 6 endpoints responding correctly
- [ ] Background Jobs section visible and functional in system_management.html
- [ ] `launchd` plist **not present** in repo
- [ ] `fcntl` imports **not present** in any background job file
- [ ] Direct `.env` file parsing **not present** in any background job file
- [ ] M-005b migration applied (all new columns present in job_run_log)
- [ ] DB single-flight: concurrent trigger of same job → `skipped_concurrent` row in log

---

## UPDATED GATE_4 HANDOFF CHECKLIST

All criteria from main directive + supplement + this addendum must be GREEN:

**From this addendum specifically:**
- display_name column + API + UI ✅
- APScheduler startup confirmed ✅
- Both jobs running with TARGET_RUNTIME classification ✅
- Background jobs UI section functional ✅
- launchd plist removed ✅
- M-005b applied ✅

---

*log_entry | TEAM_00 | G7_REMEDIATION_ADDENDUM | LOCKED | 2026-03-02*
