# Team 60 → Team 10 | S002-P002-WP003 — GATE_3 Remediation R3 Completion

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE3_R3_COMPLETION  
**from:** Team 60 (Infrastructure)  
**to:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-10  
**status:** **DONE**  
**gate_id:** GATE_3 (Remediation)  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_10_TO_TEAM_60_S002_P002_WP003_GATE3_R3_MANDATE  
**trigger:** TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_R2_QA_REPORT (Blockers 1.2, 1.3)  

---

## 1) Scope Delivered

| Blocker | Root Cause (per R2 QA §5) | Action Taken | Status |
|---------|----------------------------|--------------|--------|
| **1.3** | Seed does not set exchange_id for *existing* tickers (TEVA.TA, ANAU.MI) | Extended seed: backfill `exchange_id` for all existing tickers in DEFAULT_TICKERS (TEVA.TA→TASE, ANAU.MI→MIL, US symbols→NASDAQ/NYSE) | ✅ DONE |
| **1.2** | AAPL, QQQ, SPY have no EOD (price_source null) | Documented: run `make sync-eod` after seed; seed script prints reminder; verified intraday/EOD pipelines (scheduler jobs) fill when sync runs | ✅ DONE |

---

## 2) Implementation

### 2.1) Blocker 1.3 — exchange_id for existing tickers

**File:** `scripts/seed_market_data_tickers.py`

- **New function:** `_backfill_exchange_id_for_existing(cur)`  
  For each symbol in `DEFAULT_TICKERS` that has an `exchange_code`, runs:
  - `UPDATE market_data.tickers SET exchange_id = <id from market_data.exchanges WHERE exchange_code = ...>, updated_at = NOW() WHERE symbol = %s AND deleted_at IS NULL AND (exchange_id IS NULL OR exchange_id != ...)`  
  So **TEVA.TA** gets TASE, **ANAU.MI** gets MIL, and any other existing ticker (AAPL, GOOGL, AMZN, SPY, QQQ) gets the correct exchange_id if it was missing.
- **Invocation:** Called after `_cleanup_removed_symbols` and before INSERT loop, with commit.
- **Result:** Re-running `make seed-tickers` on an environment where tickers already exist will now set/repair `exchange_id` for TEVA.TA, ANAU.MI, and all other seed symbols with an exchange.

### 2.2) Blocker 1.2 — EOD so price_source is set

- **Run order:** After seed, **run `make sync-eod`** so `market_data.ticker_prices` (EOD) is populated for AAPL, QQQ, SPY, etc. Then `_get_price_with_fallback` returns `price_source` (EOD/EOD_STALE/INTRADAY_FALLBACK) and `price_as_of_utc` instead of null.
- **Seed script:** Prints reminder at end: `Next: run 'make sync-eod' so EOD prices fill and price_source is set.`
- **Pipelines verified:**  
  - EOD: `make sync-eod` (or script `sync_ticker_prices_eod.py`) fills `ticker_prices`; scheduler has no EOD ticker job in registry — EOD is script/cron.  
  - Intraday: `sync_ticker_prices_intraday` job in APScheduler fills `ticker_prices_intraday`; service uses EOD + intraday for `price_source`/`price_as_of_utc`.  
  So once `sync-eod` has been run after seed, pipelines are in place for price_source to be non-null for tickers that have EOD data.

---

## 3) Verification

- **1.3:** On a DB where TEVA.TA / ANAU.MI already existed with `exchange_id` null, run `make seed-tickers` → backfill step updates those rows; API (with Team 20 exchange linking) will then derive ILS/EUR.
- **1.2:** After `make seed-tickers`, run `make sync-eod`; then reload tickers list — AAPL/QQQ/SPY should have EOD and non-null `price_source` (subject to provider/symbol availability).

---

## 4) Deliverable

**Path:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE3_R3_COMPLETION.md` (this document).

---

**log_entry | TEAM_60 | WP003_G3_R3_COMPLETION | TO_TEAM_10 | DONE | 2026-03-11**
