# S002_P003_WP002_BACKGROUND_TASK_ORCHESTRATION_LOD400_CONTRACT_v1.0.0

**project_domain:** TIKTRACK  
**id:** S002_P003_WP002_BACKGROUND_TASK_ORCHESTRATION_LOD400_CONTRACT  
**from:** Team 170 (Spec Owner / Canonical Foundations)  
**to:** Team 10, Team 20, Team 60  
**cc:** Team 00, Team 100, Team 190  
**date:** 2026-03-02  
**status:** LOCKED_FOR_IMPLEMENTATION  
**gate_id:** GATE_3  
**program_id:** S002-P003  
**work_package_id:** S002-P003-WP002  
**source_authority:** ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md  

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| task_id | N/A |
| gate_id | GATE_3 |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Purpose

Define the LOD400 contract for background-task orchestration artifacts mandated by Team 00:

- `scheduler_registry.py`
- `job_runner.py`
- `job_run_log` schema extension
- Background Jobs section in `system_management`

This contract is implementation-binding for Team 20 and runtime-validation-binding for Team 60.

## 2) Contracted Files

| File | Contract |
|---|---|
| `api/background/scheduler_registry.py` | Single canonical registry for all jobs. Every job entry must include job_name, module, function, trigger, runtime_class, enabled_default. |
| `api/background/job_runner.py` | Shared runtime bootstrap only: DB acquisition, single-flight check via `job_run_log`, run lifecycle write/update, exit_code/status handling. |
| `api/background/scheduler_startup.py` | APScheduler init/stop hooks for FastAPI lifespan. |
| `api/background/jobs/sync_intraday.py` | Converted from script form to `run(db)` entrypoint; no direct `.env` parsing. |
| `api/background/jobs/check_alert_conditions.py` | Converted from script form to `run(db)` entrypoint; no direct `.env` parsing. |
| `api/routers/background_jobs.py` | Admin control plane endpoints for list/detail/history/trigger/toggle/analytics. |

## 3) `job_run_log` DDL Contract (M-005b)

Team 20 must apply migration extending `admin_data.job_run_log` to include:

- `runtime_class VARCHAR(40) NOT NULL DEFAULT 'TARGET_RUNTIME'`
- `exit_code SMALLINT`
- `duration_ms INTEGER`
- `records_skipped INTEGER`
- `records_failed INTEGER`
- `error_class VARCHAR(100)`
- `stdout_ref TEXT`
- `stderr_ref TEXT`
- `executor_info JSONB`

Mandatory status enum surface:

`running` | `completed` | `failed` | `skipped_concurrent` | `skipped_disabled` | `timeout`

Mandatory indexes:

- `(job_name, started_at DESC)`
- partial index for `status='running'`

## 4) Background Jobs UI Contract (`system_management`)

Background Jobs section must expose:

1. Summary cards: total jobs, running jobs, disabled jobs, last failure.
2. Jobs table columns: job_name, description, cadence, enabled status, last_run_at, last_status, duration_ms, processed/skipped/failed counts, actions.
3. Actions:
   - manual trigger (async) with run_id feedback
   - enable/disable toggle
   - inline history expansion (last 20 runs)

No alternate admin page is allowed; this section belongs inside `system_management`.

## 5) Runtime Evidence Contract

Gate-eligible evidence requires:

- `runtime_class = TARGET_RUNTIME`
- scheduler started from FastAPI lifespan
- successful runs for both canonical jobs
- `job_run_log` rows populated with extended fields

Runs classified as `LOCAL_DEV_NON_AUTHORITATIVE` are not gate-eligible.

## 6) Non-Negotiable Constraints

- No direct `.env` parsing inside job modules.
- No `fcntl` lock usage for single-flight control.
- No launchd/cron artifact as runtime authority.
- No unregistered job execution outside `scheduler_registry.py`.

---

**log_entry | TEAM_170 | S002_P003_WP002_BACKGROUND_TASK_ORCHESTRATION_LOD400_CONTRACT | LOCKED_FOR_IMPLEMENTATION | 2026-03-02**
