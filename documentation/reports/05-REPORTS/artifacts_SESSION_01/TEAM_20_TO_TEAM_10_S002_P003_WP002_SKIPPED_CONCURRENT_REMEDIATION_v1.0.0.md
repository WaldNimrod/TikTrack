# TEAM_20 → TEAM_10 | S002-P003-WP002 SKIPPED_CONCURRENT REMEDIATION

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P003_WP002_SKIPPED_CONCURRENT_REMEDIATION_v1.0.0  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10  
**cc:** Team 60  
**date:** 2026-03-02  
**in_response_to:** TEAM_60_TO_TEAM_10_S002_P003_WP002_FINAL_PHASE_B_RUNTIME_REVALIDATION_ADDENDUM_v1.0.0  

---

## 1) Root cause

`sync_ticker_prices_intraday` produced `skipped_concurrent` because:
- A previous run left a row with `status='running'` (orphaned when process was killed/reloaded before UPDATE)
- New runs hit the single-flight check, found the stale `running` row, and inserted `skipped_concurrent`
- Evidence: `sync_ticker_prices_intraday|running|2026-03-02 21:42:29` with no `completed_at`

---

## 2) Fix applied

**File:** `api/background/job_runner.py`

Before the concurrent-run check, added **stale lock cleanup**:
- UPDATE any `running` rows for this job where `started_at < NOW() - 5 minutes` → `status='timeout'`, `completed_at=NOW()`
- Clears orphaned runs from reload/kill; allows new runs to proceed

---

## 3) Expected effect

- On next startup, stale `running` rows are cleared
- `sync_ticker_prices_intraday` will complete with `status='completed'`, `duration_ms` populated
- Ready for Team 60 re-validation
