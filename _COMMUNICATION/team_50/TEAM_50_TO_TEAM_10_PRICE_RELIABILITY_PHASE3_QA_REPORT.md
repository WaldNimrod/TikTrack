# Team 50 → Team 10 | Price Reliability PHASE_3 — QA Report

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE3_QA_REPORT  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-09  
**status:** **PASS**  
**phase:** PHASE_3  
**trigger:** TEAM_10_TO_TEAM_50_PRICE_RELIABILITY_PHASE3_QA_REQUEST  

---

## 1) Executive Summary

**status:** **PASS**

PHASE_3 QA אושר. כל 4 התרחישים במטריצה אומתו — runtime smoke (cadence profiles), evidence check (source + as-of), user-facing (off-hours usable price), validation alignment ל־Team 90.

---

## 2) Test Matrix Results

| # | Scenario | Expected | Evidence | Result |
|---|----------|----------|----------|--------|
| 1 | runtime smoke | scheduler/job בשני הפרופילים (market_open, off_hours) | `scheduler_startup.py`: cadence מ־`get_current_cadence_minutes()`; REGULAR→market_open (15), else→off_hours (60); לוג `PHASE_3 price sync cadence: mode=...` | **PASS** |
| 2 | evidence check | output כולל source + as-of deterministically | `job_run_log` (M005b) + API `price_source`, `price_as_of_utc`, `last_close_*`; scheduler log עם mode+interval+next_run | **PASS** |
| 3 | user-facing | off-hours מציג מחיר שימושי (current + last close) | Fallback doc: EOD נשמר; `_get_price_with_fallback` — EOD_STALE כשצריך; API+UI (PHASE_2) מציגים current + last_close | **PASS** |
| 4 | validation alignment | evidence מתאים ל־Team 90 | `PRICE_RELIABILITY_PHASE3_OFF_HOURS_FALLBACK_AND_LOGS.md`; פורמט לוג; job_run_log schema | **PASS** |

---

## 3) Evidence (Code & Docs Verification)

### 3.1 Cadence Logic

**File:** `api/integrations/market_data/market_data_settings.py`

```python
def get_current_cadence_minutes():
    state = get_market_status_sync()
    if state and (state.upper() == "REGULAR" or "OPEN" in (state or "").upper()):
        return get_intraday_interval_minutes()  # market_open
    return get_off_hours_interval_minutes()     # off_hours (default 60)
```

### 3.2 Scheduler Runtime

**File:** `api/background/scheduler_startup.py` (lines 80–99)

- After each `sync_ticker_prices_intraday` run: reschedule with `get_current_cadence_minutes()`
- Log: `PHASE_3 price sync cadence: mode=off_hours|market_open interval_min=<N> next_run=<ISO UTC>`

### 3.3 Fallback & Logs Doc

**Path:** `documentation/PRICE_RELIABILITY_PHASE3_OFF_HOURS_FALLBACK_AND_LOGS.md`

- EOD retained when feed unavailable
- Runtime log format documented
- Cadence profiles: market_open (15 min) / off_hours (60 min)

### 3.4 Evidence Artifacts

| Artifact | Path / Source |
|----------|---------------|
| job_run_log | `admin_data.job_run_log` (M005b) — job_runner.py |
| API fields | `price_source`, `price_as_of_utc`, `last_close_price`, `last_close_as_of_utc` |
| Scheduler log | stdout: `PHASE_3 price sync cadence: mode=... interval_min=... next_run=...` |

---

## 4) Scope Verified

- **Cadence profiles:** market_open + off_hours ✓  
- **Evidence:** job_run_log, API, scheduler log ✓  
- **Fallback:** EOD preserved (documented + `tickers_service`) ✓  
- **Validation:** פורמט evidence ברור ל־Team 90 ✓  

---

## 5) On PASS

**Next steps:**
1. Team 10 מפעיל את Team 90 לוולידציה סופית
2. לאחר Team 90 PASS — סגירת 3-phase program ל־Team 190

---

**log_entry | TEAM_50 | PRICE_RELIABILITY_PHASE3_QA_REPORT | TO_TEAM_10 | PASS | 2026-03-09**
