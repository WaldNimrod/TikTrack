# GATE_3 Batch 1 — T190-Price runtime evidence (Team 60)

**Purpose:** Runtime corroboration for T190-Price (Intraday Price Surface Staleness).  
**Activation:** TEAM_10_TO_TEAM_60_S002_P003_WP002_GATE3_BATCH1_ACTIVATION_v1.0.0  
**date:** 2026-03-06

## Checks to run (optional re-run for this batch)

### 1) Job run log — qualifying recent rows

Ensure both jobs have at least one recent **completed** run with `TARGET_RUNTIME` and `duration_ms` set.

```sql
-- Qualifying: status='completed', runtime_class='TARGET_RUNTIME', duration_ms IS NOT NULL
SELECT job_name,
       EXISTS (
         SELECT 1 FROM admin_data.job_run_log j2
         WHERE j2.job_name = j.job_name
           AND j2.status = 'completed'
           AND j2.runtime_class = 'TARGET_RUNTIME'
           AND j2.duration_ms IS NOT NULL
           AND j2.started_at > NOW() - INTERVAL '48 hours'
       ) AS has_recent_qualifying
FROM (SELECT DISTINCT job_name FROM admin_data.job_run_log) j
WHERE job_name IN ('sync_ticker_prices_intraday', 'check_alert_conditions');

-- Sample rows (last 20)
SELECT job_name, status, runtime_class, duration_ms, exit_code, started_at, completed_at
FROM admin_data.job_run_log
WHERE job_name IN ('sync_ticker_prices_intraday', 'check_alert_conditions')
ORDER BY started_at DESC
LIMIT 20;
```

Save stdout as: `check_job_run_log_qualifying.log`.

### 2) Intraday table — latest write

Confirm intraday table is still being written (freshness).

```sql
SELECT MAX(price_timestamp) AS latest_utc, COUNT(*) AS row_count
FROM market_data.ticker_prices_intraday;
```

Save stdout as: `check_intraday_latest.log`.

---

Evidence paths referenced in Team 60 response:

- `_COMMUNICATION/team_60/evidence/gate3_batch1_t190_price/check_job_run_log_qualifying.log`
- `_COMMUNICATION/team_60/evidence/gate3_batch1_t190_price/check_intraday_latest.log`

Existing Phase F evidence (`phase_f_runtime_final_clear/check_03_job_run_log_recent_qualifying.log`) may be reused if no regression and re-run not required.
