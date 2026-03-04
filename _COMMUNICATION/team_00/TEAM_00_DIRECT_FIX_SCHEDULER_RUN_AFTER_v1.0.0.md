---
**project_domain:** TIKTRACK
**id:** TEAM_00_DIRECT_FIX_SCHEDULER_RUN_AFTER_v1.0.0
**from:** Team 00 (Chief Architect — direct code authority)
**to:** Team 10, Team 90
**cc:** Team 100 (awareness)
**date:** 2026-03-04
**status:** FIX APPLIED — VALIDATION + DOCUMENTATION ONLY
**work_package_id:** S002-P003-WP002
---

# TEAM 00 — DIRECT FIX: scheduler_startup.py run_after enforcement

---

## §1 CONTEXT

A P1 bug was identified in `api/background/scheduler_startup.py`:

- `scheduler_registry.py` declares `"run_after": "sync_ticker_prices_intraday"` for `check_alert_conditions`
- `scheduler_startup.py` never read the `run_after` field — all jobs were registered with identical `next_run_time=now()`
- Result: `check_alert_conditions` could fire before `sync_ticker_prices_intraday` completed, evaluating alert conditions against stale market data

Because Team 10 is already mid-execution, no process stop was warranted. The fix has been applied directly by Team 00.

---

## §2 WHAT WAS CHANGED

**File:** `api/background/scheduler_startup.py`

**Changes (summary):**

1. **`_make_job_wrapper` now accepts `dependents: List[str]`**
   — After `run_job` completes successfully, the wrapper calls `_scheduler.modify_job(dep_id, next_run_time=now)` for each dependent
   — If `run_job` raises, dependents are NOT triggered (stale-data protection is preserved)

2. **`start_scheduler` builds a dependency map from the registry**
   — `dep_map: { parent_job_id → [child_job_ids] }` built once at startup
   — Parent jobs: `next_run_time = now` (unchanged — fires immediately for runtime validation)
   — Dependent jobs: `next_run_time = now + interval` (delayed by one cycle on startup — parent will trigger them sooner via `modify_job`)

3. **Removed unused import** (`asynccontextmanager`)

4. **Imports moved to module level** (`datetime`, `timedelta`, `timezone`)

**What did NOT change:**
- `scheduler_registry.py` — unchanged (no job definitions modified)
- `check_alert_conditions.py` — unchanged
- `sync_intraday.py` — unchanged
- Database schema — unchanged
- Job runner logic — unchanged

---

## §3 BEHAVIORAL CHANGE (runtime)

| Scenario | Before fix | After fix |
|---|---|---|
| App startup | Both jobs fire at once (race condition) | `sync_intraday` fires immediately; `check_alert_conditions` waits one interval |
| After sync_intraday completes | check_alerts fires at its next interval (may be stale) | check_alerts triggered immediately after sync completes |
| sync_intraday fails/raises | check_alerts still fires on interval (stale data) | check_alerts NOT triggered by parent; fires on its own interval (fallback only) |
| Log output | `registered job X (interval=Nm)` | `registered job X (interval=Nm, first_run=immediate/delayed +Nm)` + trigger log on each chained fire |

---

## §4 REQUIRED ACTIONS — BY TEAM

### Team 10 — VALIDATION ONLY

No implementation needed. Required:

1. **Restart the application** to apply the new scheduler behavior
2. **Verify startup log sequence:**
   - `check_alert_conditions` should log `first_run=delayed +Nm (run_after=sync_ticker_prices_intraday)` — NOT `immediate`
   - `sync_ticker_prices_intraday` should log `first_run=immediate`
3. **After first sync_intraday cycle completes:** verify log shows `APScheduler: triggered dependent job check_alert_conditions after sync_ticker_prices_intraday completed`
4. **Add one test** (see §5) to `tests/` covering run_after ordering — test must pass before GATE_4

### Team 90 — DOCUMENTATION + VALIDATION SCENARIO

1. **Add to validation scenarios:** verify that `check_alert_conditions` is triggered by `sync_ticker_prices_intraday` (via log evidence), not independently on startup
2. **Update any existing test documentation** referencing the old scheduler startup behavior

---

## §5 REQUIRED TEST (Team 10 must add)

Location: `tests/` (Selenium/unit — unit test preferred for scheduler logic)

**Test name:** `test_scheduler_run_after_ordering`

**What it verifies:**
- Given `JOB_REGISTRY` with a job `B` that has `run_after: A`
- When `start_scheduler` registers jobs:
  - Job `A` gets `next_run_time ≈ now` (immediate)
  - Job `B` gets `next_run_time > now` (delayed)
- When Job `A`'s wrapper completes successfully:
  - `_scheduler.modify_job("B", next_run_time=now)` is called

This can be a pure unit test using `unittest.mock` to mock `AsyncSessionLocal`, `run_job`, and `_scheduler`.

---

## §6 LOG EVIDENCE CHECKLIST (for Team 90 GATE_5 validation)

| Log line | Expected |
|---|---|
| Startup: sync_ticker_prices_intraday | `first_run=immediate` |
| Startup: check_alert_conditions | `first_run=delayed +Nm (run_after=sync_ticker_prices_intraday)` |
| After first sync cycle | `triggered dependent job check_alert_conditions after sync_ticker_prices_intraday completed` |

All three lines must be present in the application log before GATE_5 pass.

---

**log_entry | TEAM_00 | DIRECT_FIX | SCHEDULER_RUN_AFTER_ENFORCEMENT | APPLIED_2026-03-04 | VALIDATION_ONLY**
