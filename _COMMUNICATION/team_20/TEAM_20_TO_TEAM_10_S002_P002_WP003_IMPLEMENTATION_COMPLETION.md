# Team 20 → Team 10 | S002-P002-WP003 Market Data Hardening — Implementation Completion

**id:** `TEAM_20_TO_TEAM_10_S002_P002_WP003_IMPLEMENTATION_COMPLETION`  
**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-03-10  
**ssot:** `_COMMUNICATION/_ARCHITECT_INBOX/TIKTRACK_PHASE_2/INFRASTRUCTURE_STAGE_2/S002_P002_WP003_MARKET_DATA_HARDENING/LOD400_v1.0.0.md`  
**mandate:** `TEAM_10_TO_TEAM_20_S002_P002_WP003_IMPLEMENTATION_MANDATE`

---

## 1. Summary

**All 4 fixes implemented per LOD400.**

| Fix ID | Name | Status |
|--------|------|--------|
| FIX-1 | Priority-based refresh filter | ✅ |
| FIX-2 | Yahoo multi-symbol batch fetch | ✅ |
| FIX-3 | Alpha quota-exhausted → long cooldown | ✅ |
| FIX-4 | Eligibility gate on ticker re-activation | ✅ |

---

## 2. FIX-1 — Priority-Based Refresh Filter

**File:** `api/background/jobs/sync_intraday.py`

- Added `_get_active_trade_ticker_ids(db)` — `SELECT DISTINCT ticker_id FROM user_data.trades WHERE status = 'ACTIVE'`
- Added `_get_last_fetched_at(db, ticker_id)` — latest `fetched_at` from `market_data.ticker_prices_intraday`
- Priority categories:
  - **FIRST_FETCH:** `last_fetched is None` → always fetch
  - **HIGH:** ticker in `active_trade_ids` and `market_is_open` → always fetch
  - **LOW:** else, skip if `age_minutes < off_hours_interval_minutes`
- `market_is_open` via `get_current_cadence_minutes() == get_intraday_interval_minutes()`

---

## 3. FIX-2 — Yahoo Multi-Symbol Batch Fetch

**Files:** `api/integrations/market_data/providers/yahoo_provider.py`, `market_data_settings.py`, `sync_intraday.py`

- **market_data_settings.py:** `max_symbols_per_request` default changed from 5 to 50
- **yahoo_provider.py:**
  - Added `_fetch_prices_batch_sync(symbols)` — module-level sync using Yahoo v7/finance/quote
  - Added `YahooProvider.get_ticker_prices_batch(symbols)` — async wrapper via `run_in_executor`
  - REPLAY mode returns `{}`; caller falls back to per-symbol path
- **sync_intraday.py:** Batch-first flow:
  1. After FIX-1 filter → build `tickers_to_fetch`
  2. If Yahoo not in cooldown → `yahoo.get_ticker_prices_batch(yahoo_symbols_unique)`
  3. Per ticker: batch result → individual Yahoo → Alpha → LAST_KNOWN
  4. 429 on batch → `set_cooldown`, fall through to per-ticker path

---

## 4. FIX-3 — Alpha Quota-Exhausted Long Cooldown

**Files:** `alpha_provider.py`, `provider_cooldown.py`, `market_data_settings.py`, `sync_intraday.py`

- **alpha_provider.py:** `AlphaQuotaExhaustedException`; raise in `get_ticker_price`, `get_ticker_price_crypto`, `_get_price_from_timeseries_daily` when `Information`/`Note` present
- **provider_cooldown.py:** `set_cooldown_hours()`, `_persist_alpha_cooldown()` to `market_data.system_settings` (`alpha_cooldown_until`), `_read_alpha_cooldown_from_db()`, `is_in_cooldown()` checks DB for Alpha
- **market_data_settings.py:** `alpha_quota_cooldown_hours` (6–48, default 24), `get_alpha_quota_cooldown_hours()`
- **sync_intraday.py:** `except AlphaQuotaExhaustedException` → `set_cooldown_hours("ALPHA_VANTAGE", ...)`; no re-raise — LAST_KNOWN fallback preserved

---

## 5. FIX-4 — Eligibility Gate on Ticker Re-Activation

**File:** `api/services/tickers_service.py`

- In `update_ticker()`, when transitioning `is_active` from false/None to true: call `validate_ticker_with_providers()` via `canonical_ticker_service`
- If validation fails → HTTP 422 with `TICKER_SYMBOL_INVALID`
- Only set `is_active=True` after validation passes

---

## 6. File Change Summary

| File | Changes |
|------|---------|
| `api/background/jobs/sync_intraday.py` | FIX-1 (priority filter), FIX-2 (batch flow), FIX-3 (AlphaQuotaException catch) |
| `api/integrations/market_data/providers/yahoo_provider.py` | FIX-2 (`_fetch_prices_batch_sync`, `get_ticker_prices_batch`) |
| `api/integrations/market_data/providers/alpha_provider.py` | FIX-3 (`AlphaQuotaExhaustedException`, raise instead of return None) |
| `api/integrations/market_data/provider_cooldown.py` | FIX-3 (`set_cooldown_hours`, DB persistence, `is_in_cooldown` DB check) |
| `api/integrations/market_data/market_data_settings.py` | FIX-2 (max_symbols default 50), FIX-3 (`alpha_quota_cooldown_hours`) |
| `api/services/tickers_service.py` | FIX-4 (eligibility gate in `update_ticker`) |

---

## 7. Constraints (LOD400 §10)

- NUMERIC(20,8) preserved via `Decimal` quantize
- No schema migrations
- REPLAY mode unchanged (Alpha provider returns fixtures; batch returns `{}`)
- Batch partial failure: valid prices committed; missing symbols use individual fallback
- maskedLog: no raw prices or API keys in logs

---

## 8. Team 50 Handoff (GATE_4)

**Evidence EV-WP003-01 through EV-WP003-10** per LOD400 §8 to be produced by Team 50 (QA).

---

**log_entry | TEAM_20 | S002_P002_WP003_IMPLEMENTATION | TO_TEAM_10 | 2026-03-10**
