# Team 60 → Team 10 | Price Reliability — PHASE_3 Completion

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_10_PRICE_RELIABILITY_PHASE3_COMPLETION  
**from:** Team 60 (Runtime/Platform)  
**to:** Team 10 (Gateway Orchestration)  
**cc:** Team 50, Team 90  
**date:** 2026-03-08  
**status:** IMPLEMENTATION_COMPLETE  
**in_response_to:** TEAM_10_TO_TEAM_60_PRICE_RELIABILITY_PHASE3_MANDATE  
**authority:** TEAM_190_TO_TEAM_10_TEAMS_20_30_50_60_90_MANDATORY_3_PHASE_PRICE_RELIABILITY_EXECUTION_MANDATE_v1.0.0  

---

## 1) Summary

Team 60 has implemented the PHASE_3 requirements for price visibility outside normal market hours: two cadence profiles (market-open + off-hours), deterministic evidence for `price_source` and `price_as_of_utc`, documented fallback (retain close value), and runtime logs for off-hours mode. **PHASE_3_PASS** remains conditional on Team 50 QA report and Team 90 validation (per mandate §5).

---

## 2) Required implementation — delivered

| # | פעולה | סטטוס | פרטים |
|---|--------|--------|--------|
| 1 | Two cadence profiles | ✅ | **market-open cadence:** `intraday_interval_minutes` (default 15). **off-hours cadence:** `off_hours_interval_minutes` (default 60). Both active via scheduler; cadence chosen at runtime from US market status (REGULAR → market-open, else → off-hours). |
| 2 | Evidence | ✅ | Jobs produce evidence: `job_run_log` (M005b) + API response fields `price_source`, `price_as_of_utc` (and `last_close_*`) — deterministic provenance (Phase 2 already in place; scheduler logs cadence mode). |
| 3 | Fallback | ✅ | Documented: when off-hours feed unavailable, **last close (EOD) is retained** — no null; `tickers_service._get_price_with_fallback` preserves EOD/EOD_STALE. See `documentation/PRICE_RELIABILITY_PHASE3_OFF_HOURS_FALLBACK_AND_LOGS.md`. |
| 4 | Runtime logs | ✅ | After each `sync_ticker_prices_intraday` run: log line `PHASE_3 price sync cadence: mode=off_hours|market_open interval_min=<N> next_run=<ISO UTC>`. Backend stdout/stderr (and any log aggregation) provide artifacts for off-hours mode. |

---

## 3) Code and config changes

- **api/core/config.py:** Added `off_hours_interval_minutes: int = 60`.
- **api/integrations/market_data/market_data_settings.py:** Added `off_hours_interval_minutes` to SSOT/env, `get_off_hours_interval_minutes()`, `get_current_cadence_minutes()` (uses `market_status_service.get_market_status_sync()`: REGULAR → intraday interval, else off-hours). Exposed in `get_all_settings` / `get_ssot_constraints`.
- **api/background/scheduler_startup.py:** For `sync_ticker_prices_intraday`: initial interval from `_get_sync_intraday_minutes()` (dynamic); after each run, reschedule with `get_current_cadence_minutes()` and log cadence mode + next_run (PHASE_3 runtime artifact).
- **documentation/PRICE_RELIABILITY_PHASE3_OFF_HOURS_FALLBACK_AND_LOGS.md:** Fallback behavior and runtime logs description (reference for Team 50 / Team 90).

---

## 4) Required tests (reference — mandate §4)

| # | Test | Owner | Team 60 note |
|---|------|-------|----------------|
| 1 | runtime smoke: scheduler/job in both cadence profiles | Team 60 | Scheduler runs job; cadence switches by market status; log line confirms mode. |
| 2 | evidence check: output includes source + as-of deterministically | Team 60 + Team 50 | `job_run_log` + API `price_source` / `price_as_of_utc` (and last_close_*) are the evidence. |
| 3 | user-facing: off-hours shows usable price context (current + last close) | Team 50 | API already returns current price + last_close_*; fallback keeps close when feed unavailable. |
| 4 | validation package: Team 90 confirms no ambiguity in gate evidence | Team 90 | Evidence format and docs provided; Team 90 to validate. |

---

## 5) Closure

- **Completion report:** This document.
- **QA:** Pending Team 50 PHASE_3 QA report.
- **Validation:** Pending Team 90 final validation response.
- **PHASE_3_PASS:** Only after Team 50 + Team 90 PASS (per mandate §5).

---

**log_entry | TEAM_60 | PRICE_RELIABILITY_PHASE3 | TO_TEAM_10 | IMPLEMENTATION_COMPLETE | 2026-03-08**
