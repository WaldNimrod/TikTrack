# ARCHITECT DIRECTIVE — Background Task Orchestration
## Canonical Lock: Runtime Orchestration for All Background Jobs

```
directive_id:     ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0
author:           Team 00 — Chief Architect
date:             2026-03-02
status:           LOCKED
authority:        Team 00 constitutional authority
supersedes:       Current fcntl + launchd/cron pattern (all scripts)
responds_to:
  - _COMMUNICATION/_ARCHITECT_INBOX/TIKTRACK_PHASE_2/INFRASTRUCTURE_STAGE_2/
    RUNTIME_ORCHESTRATION_ARCHITECTURAL_REVIEW/SUBMISSION_v1.0.0/
  - Team 190 finding F-01 through F-08
  - Team 60 BLOCK: launchd SIP failure [Errno 1] x150
routes_to:
  - Team 170: LOD400 contract for scheduler + job_run_log extension
  - Team 10: integration into active G7 remediation + all future WPs
  - Team 20: immediate implementation
  - Team 60: runtime readiness re-validation after implementation
```

---

## 1. CONTEXT — WHY THIS DIRECTIVE EXISTS

Team 60's runtime readiness check produced a hard BLOCK:

```
launchd stderr: python3: can't open file '...check_alert_conditions.py': [Errno 1] Operation not permitted
(150 repetitions, zero successful launchd invocations)
```

Team 190 identified this as **systemic** — not a one-off issue:
- Both `check_alert_conditions.py` and `sync_ticker_prices_intraday.py` share the same pattern
- macOS launchd/SIP blocking is not fixable at the application level
- `fcntl` single-flight protection is host-local only (not portable, not cluster-safe)
- Cron schedule exists only in comments, not as a repo artifact
- `.env` parsing is duplicated in every script independently
- `api/routers/background_jobs.py` was mandated but never built
- `job_run_log` has schema/code drift

The current architecture has **zero stable runtime guarantee** for any background job.
Nimrod's explicit direction: "Stable background task management without excessive environment dependency. Includes a management and control page for all processes."

---

## 2. LOCKED DECISION — CANONICAL RUNTIME MODEL

### 2.1 Execution Substrate

**LOCKED: APScheduler 3.x integrated into the FastAPI application process.**

APScheduler starts during FastAPI startup (`lifespan` context), registers all jobs as code, and runs them within the application process.

**Why APScheduler (not cron, launchd, Celery, or standalone scripts):**

| Requirement | APScheduler | cron/launchd | Celery |
|---|---|---|---|
| Cross-platform (macOS + Linux + Docker) | ✅ | ❌ macOS-specific | ✅ |
| No external infrastructure (no Redis) | ✅ | ✅ | ❌ |
| Scheduler-as-code (repo artifact) | ✅ | ❌ crontab on host | ✅ |
| Single-flight protection (DB-backed) | ✅ (via job_run_log) | ❌ fcntl only | ✅ |
| Manual trigger via admin API | ✅ | ❌ | ✅ |
| Admin enable/disable without restart | ✅ (pause/resume) | ❌ | ✅ |
| Self-contained management UI | ✅ | ❌ | partial |

**Process model:** FastAPI process owns the scheduler. If the API restarts, scheduled jobs restart automatically. This is acceptable for TikTrack's scale.

**Future path:** If TikTrack scales to multi-instance deployment, APScheduler can be reconfigured to use a PostgreSQL JobStore for coordination without code changes.

---

### 2.2 Scheduler-as-Code — Registry File

**LOCKED: All jobs MUST be registered in `api/background/scheduler_registry.py`.**

This file is the single authoritative source for:
- Job name (canonical key, used in `job_run_log` and admin API)
- Entry point function
- Cadence (cron expression or interval)
- Runtime class (`TARGET_RUNTIME` / `LOCAL_DEV_NON_AUTHORITATIVE`)
- DB identity requirement (inherited from FastAPI, no hardcoding)
- Default enabled state

```python
# api/background/scheduler_registry.py — CANONICAL JOB REGISTRY
JOB_REGISTRY = [
    {
        "job_name": "sync_ticker_prices_intraday",
        "module": "api.background.jobs.sync_intraday",
        "function": "run",
        "trigger": "interval",
        "minutes": "from_settings:INTRADAY_INTERVAL_MINUTES",
        "runtime_class": "TARGET_RUNTIME",
        "enabled_default": True,
        "description": "Syncs intraday price data for active tickers",
    },
    {
        "job_name": "check_alert_conditions",
        "module": "api.background.jobs.check_alert_conditions",
        "function": "run",
        "trigger": "interval",
        "minutes": "from_settings:INTRADAY_INTERVAL_MINUTES",
        "run_after": "sync_ticker_prices_intraday",   # ordering guarantee
        "runtime_class": "TARGET_RUNTIME",
        "enabled_default": True,
        "description": "Evaluates alert conditions against latest market data",
    },
]
```

**No new job may be created without a registry entry.** This is an Iron Rule.

---

### 2.3 Shared Runtime Bootstrap

**LOCKED: Replace all per-script `.env` parsing with a shared bootstrap module.**

```python
# api/background/job_runner.py — SHARED BOOTSTRAP
# All jobs call this — never parse .env directly
async def run_job(job_name: str, job_fn: Callable) -> None:
    """
    Shared job runner:
    1. Acquires DB connection from FastAPI pool (no .env parsing)
    2. Checks single-flight lock in job_run_log (replaces fcntl)
    3. Inserts job_run_log row (status='running', runtime_class, started_at)
    4. Calls job_fn(db)
    5. Updates job_run_log row (status='completed'/'failed', exit_code, duration_ms)
    6. Releases DB connection
    """
```

**No script may parse `api/.env` directly.** This is an Iron Rule.

---

### 2.4 Single-Flight Protection — DB-Based Lock

**LOCKED: Replace `fcntl` with `job_run_log`-based single-flight check.**

```sql
-- Single-flight check: is this job already running?
SELECT id FROM admin_data.job_run_log
WHERE job_name = $1
  AND status = 'running'
  AND started_at > NOW() - INTERVAL '30 minutes'   -- stale lock protection
LIMIT 1;
```

If a row is found: skip this run, log a `skipped_concurrent` event, exit 0.
If no row: insert `status='running'` row, proceed.

This replaces the host-local `fcntl` lock and works correctly across restarts and deployments.

---

### 2.5 Evidence Classification

**LOCKED: All job run evidence MUST carry an explicit `runtime_class` field.**

| Class | Meaning | Gate eligibility |
|---|---|---|
| `TARGET_RUNTIME` | Job ran inside FastAPI process on the actual deployment target | **Gate-eligible** |
| `LOCAL_DEV_NON_AUTHORITATIVE` | Ran manually during development (standalone script, dev machine) | **NOT gate-eligible** |

This field MUST be recorded in `job_run_log.runtime_class` on every run.

---

## 3. job_run_log — EXTENDED SCHEMA

**Team 170 MUST update the `job_run_log` schema from the current M-005 DDL to include the following columns.**

Current M-005 schema (incomplete):
```sql
CREATE TABLE admin_data.job_run_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'running',
    records_processed INTEGER,
    error_message TEXT,
    metadata JSONB
);
```

**Canonical schema (LOCKED):**
```sql
CREATE TABLE admin_data.job_run_log (
    id              UUID             DEFAULT gen_random_uuid() PRIMARY KEY,
    job_name        VARCHAR(100)     NOT NULL,
    started_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    status          VARCHAR(30)      NOT NULL DEFAULT 'running',
    -- EXTENDED FIELDS:
    runtime_class   VARCHAR(40)      NOT NULL DEFAULT 'TARGET_RUNTIME',
    exit_code       SMALLINT,                               -- 0=ok, non-zero=error
    duration_ms     INTEGER,                                -- derived but stored for query speed
    records_processed INTEGER,
    records_skipped INTEGER,
    records_failed  INTEGER,
    error_message   TEXT,
    error_class     VARCHAR(100),                           -- e.g. 'ConnectionError', 'ValueError'
    stdout_ref      TEXT,                                   -- log path or 'in-process'
    stderr_ref      TEXT,                                   -- log path or 'in-process'
    executor_info   JSONB,                                  -- {host, pid, python_version, git_sha}
    metadata        JSONB                                   -- job-specific payload
);

-- Mandatory indexes:
CREATE INDEX idx_job_run_log_job_name_started ON admin_data.job_run_log(job_name, started_at DESC);
CREATE INDEX idx_job_run_log_status ON admin_data.job_run_log(status) WHERE status = 'running';
```

**Status values (canonical):**
`running` | `completed` | `failed` | `skipped_concurrent` | `skipped_disabled` | `timeout`

---

## 4. REQUIRED NEW FILES

### 4.1 File Tree

```
api/
  background/
    __init__.py
    scheduler_registry.py         ← canonical job registry (Iron Rule: all jobs here)
    scheduler_startup.py          ← APScheduler init, hooks into FastAPI lifespan
    job_runner.py                 ← shared bootstrap: DB, logging, job_run_log writes
    jobs/
      __init__.py
      sync_intraday.py            ← converted from scripts/sync_ticker_prices_intraday.py
      check_alert_conditions.py   ← converted from scripts/check_alert_conditions.py
```

### 4.2 FastAPI Lifespan Hook

```python
# api/main.py — add to lifespan context
from api.background.scheduler_startup import start_scheduler, stop_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    await start_scheduler()
    yield
    await stop_scheduler()
```

### 4.3 Admin Control Plane — `api/routers/background_jobs.py`

**MANDATORY — was missing (Team 190 finding F-06). MUST be built.**

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/background-jobs` | admin | List all registered jobs + current status (enabled, is_running, last_run_at, last_status) |
| GET | `/api/v1/admin/background-jobs/{job_name}` | admin | Single job detail + 24h run history |
| GET | `/api/v1/admin/background-jobs/{job_name}/history` | admin | Paginated run history, `?limit=` |
| POST | `/api/v1/admin/background-jobs/{job_name}/trigger` | admin | Manual trigger (async, returns run_id) |
| POST | `/api/v1/admin/background-jobs/{job_name}/toggle` | admin | Enable / disable job |
| GET | `/api/v1/admin/background-jobs/analytics` | admin | Aggregate stats `?period=1d|7d|30d` |

---

## 5. SYSTEM MANAGEMENT PAGE — BACKGROUND JOBS SECTION

The existing `system_management.html` receives a new section (adjacent to the existing market data settings section).

### 5.1 Section: Background Jobs Management

**Summary bar (4 cards):**
- Total registered jobs
- Currently running jobs (live)
- Jobs disabled
- Last failure (job name + time)

**Jobs table:**

| Column | Notes |
|---|---|
| שם משימה | `job_name` — canonical key |
| תיאור | Human-readable description |
| תדירות | Cadence label ("כל 5 דקות", "יומי 02:00") |
| סטטוס | enabled / disabled toggle (inline) |
| הרצה אחרונה | `last_run_at` relative time |
| תוצאה אחרונה | `last_status` badge (completed/failed/skipped_concurrent) |
| משך | `duration_ms` of last run |
| רשומות | processed / skipped / failed counts |
| פעולות | ▶ הפעל ידנית  |  📋 היסטוריה |

**Run history panel (inline expansion):** Last 20 runs for selected job.
Columns: started_at, duration_ms, status badge, exit_code, records_processed, error_message (truncated, expand on click).

**Manual trigger UX:** POST to trigger endpoint → show "הופעל" feedback → auto-refresh row after 3s.

**Enable/disable toggle:** Calls toggle endpoint → immediate UI update. Disabled job shows status = `skipped_disabled` on next scheduled run.

---

## 6. MIGRATION OF EXISTING SCRIPTS

### 6.1 `scripts/sync_ticker_prices_intraday.py`

**Action required:** Convert to `api/background/jobs/sync_intraday.py` with a `run(db)` entrypoint.
- Remove direct `.env` parsing (lines 29/30/34/42/48)
- Remove `fcntl` single-flight (replaced by `job_runner.py`)
- Call `shared_bootstrap.get_settings()` for `INTRADAY_INTERVAL_MINUTES`
- Keep all business logic unchanged

**Original script** may remain at `scripts/` for local debug use ONLY with `runtime_class = LOCAL_DEV_NON_AUTHORITATIVE`. It MUST NOT be used for gate evidence.

### 6.2 `scripts/check_alert_conditions.py`

Same conversion. Entrypoint: `api/background/jobs/check_alert_conditions.py`.

---

## 7. INTERIM OPERATING RULE (effective immediately)

Until Team 20 delivers the APScheduler implementation and Team 60 re-validates:

1. **Local script runs** (direct `python scripts/...py`) generate `LOCAL_DEV_NON_AUTHORITATIVE` evidence only. Not gate-eligible.
2. **Gate conditions requiring background job evidence** remain BLOCKED until `TARGET_RUNTIME` evidence exists.
3. **launchd plist** MUST be removed from the repo. It is macOS-specific and Gatekeeper-blocked. Its presence is misleading.

---

## 8. ROUTING INSTRUCTIONS

| Team | Action |
|---|---|
| **Team 170** | Produce LOD400 for: scheduler_registry.py schema, job_runner.py contract, extended job_run_log DDL (migration M-005b), Background Jobs section in system_management.html |
| **Team 10** | Integrate this directive into G7 remediation master plan (add as new stream or extend Stream 1). Activate Team 20 for script conversion. |
| **Team 20** | Implement all new files + convert existing scripts. Deliver evidence: APScheduler startup log, first scheduled run of both jobs with TARGET_RUNTIME classification |
| **Team 60** | Re-run runtime readiness validation after Team 20 delivery. BLOCK condition clears when: (a) APScheduler starts in FastAPI lifespan, (b) both jobs run successfully with TARGET_RUNTIME classification, (c) job_run_log rows present with all new fields populated |
| **Team 190** | Review directive against SUBMISSION_v1.0.0 checklist. Issue DIRECTIVE_APPROVED response if D-01..D-06 are addressed |

---

## 9. FORMAL RESPONSES TO TEAM 190 REQUESTS

| Request | Response |
|---|---|
| D-01: Lock canonical execution substrate | ✅ LOCKED: APScheduler 3.x in FastAPI process |
| D-02: Scheduler-as-code | ✅ LOCKED: `scheduler_registry.py` — Iron Rule |
| D-03: Machine-checkable runtime tuple | ✅ LOCKED: `executor_info JSONB` in `job_run_log` |
| D-04: Evidence classification | ✅ LOCKED: `runtime_class` field — `TARGET_RUNTIME` / `LOCAL_DEV_NON_AUTHORITATIVE` |
| D-05: Canonical status surface | ✅ LOCKED: Extended `job_run_log` schema §3 |
| D-06: Transition from host-coupled scheduling | ✅ LOCKED: APScheduler replaces launchd/cron entirely |

**Team 190 findings addressed:**

| Finding | Resolution |
|---|---|
| F-01: Direct `.env` parsing | Replaced by shared bootstrap via FastAPI pool |
| F-02: `fcntl` host-local lock | Replaced by DB-based single-flight (§2.4) |
| F-03: Cron in comments only | Replaced by `scheduler_registry.py` repo artifact |
| F-04: Hardcoded DB role | Eliminated — FastAPI uses configured DB user |
| F-05: `job_run_log` schema drift | Extended canonical schema (§3) |
| F-06: Missing `background_jobs.py` router | Mandated and specced (§4.3) |
| F-07: Systemic `.env` pattern | Iron Rule: no per-script `.env` parsing |
| F-08: Alert loop body = `pass` | Functional implementation mandated in G7 directive |

---

*log_entry | TEAM_00 | DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION | LOCKED | 2026-03-02*
