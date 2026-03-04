---
**project_domain:** TIKTRACK
**id:** TEAM_00_TO_TEAM_50_SCHEDULER_FIX_VALIDATION_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 50 (QA & FAV)
**cc:** Team 10 (awareness — no action required)
**date:** 2026-03-04
**status:** ACTIVE — ACTION REQUIRED
**work_package_id:** S002-P003-WP002
---

# TEAM 00 → TEAM 50 | Validation Mandate — Scheduler run_after Fix

---

## §1 CONTEXT

A P1 bug was identified and fixed directly by Team 00 (2026-03-04) in:

```
api/background/scheduler_startup.py
```

**Bug:** The `run_after` dependency field declared in `scheduler_registry.py` was never read by `scheduler_startup.py`. Both `sync_ticker_prices_intraday` and `check_alert_conditions` were registered with `next_run_time=now()` simultaneously. `check_alert_conditions` could fire before `sync_ticker_prices_intraday` completed, evaluating alert conditions on stale market data.

**Fix applied:** `scheduler_startup.py` now:
1. Builds a dependency map from the registry at startup
2. Parent job wrapper triggers dependent jobs via `modify_job(dep_id, next_run_time=now())` after successful completion
3. Dependent jobs get `next_run_time = now + interval` on startup (not `now`) — ensuring the parent always runs first

---

## §2 YOUR MANDATE

Team 50 must add one new unit test covering the `run_after` ordering enforcement.

### Test specification

**File location:** `tests/` directory — new file: `test_scheduler_run_after_b01.py`

**Test name:** `test_run_after_ordering_enforced`

**What to verify:**
1. Given the real `JOB_REGISTRY` from `scheduler_registry.py`:
   - `check_alert_conditions` has `run_after: sync_ticker_prices_intraday`
2. When `start_scheduler()` registers jobs:
   - `sync_ticker_prices_intraday` must have `next_run_time ≈ now` (immediate — within 5 seconds)
   - `check_alert_conditions` must have `next_run_time > now + (interval - 1 minute)` (delayed)
3. When the parent job wrapper (`sync_ticker_prices_intraday` wrapper) is invoked and completes:
   - `_scheduler.modify_job("check_alert_conditions", next_run_time=now)` must be called exactly once

**Mocking required:**
- `AsyncSessionLocal` — mock DB context (no real DB needed)
- `run_job` — mock as async no-op
- `_scheduler` — use a real `AsyncIOScheduler` instance (initialized but not started) OR mock `modify_job`
- `_get_minutes` settings lookup — mock to return a fixed value (e.g., 15)

**Test must NOT:**
- Require a running database
- Require a running APScheduler (mock or test-mode only)
- Take more than 2 seconds

### Pass criteria

| Check | Expected |
|---|---|
| `sync_ticker_prices_intraday.next_run_time` on registration | ≈ `now()` (immediate) |
| `check_alert_conditions.next_run_time` on registration | `now() + interval` (delayed) |
| `modify_job` called after parent wrapper completes | Exactly once, with `dep_id="check_alert_conditions"` |
| `modify_job` NOT called if parent wrapper raises | Confirmed (test parent raising exception) |

---

## §3 COVERAGE GAP CONFIRMATION

The existing test `test_sync_intraday_b01_fallback.py` does NOT cover ordering between jobs. This new test closes that gap specifically. Do not modify the existing test.

---

## §4 COMPLETION REQUIREMENT

The new test must:
1. Pass with `-q` flag: `pytest tests/test_scheduler_run_after_b01.py -q`
2. Be included in the test suite that runs at GATE_4

Notify Team 10 (via your communication channel) when the test is written and passing — Team 10 will include it in the GATE_4 submission.

---

**log_entry | TEAM_00→TEAM_50 | SCHEDULER_RUN_AFTER_VALIDATION_MANDATE | ACTIVE | 2026-03-04**
