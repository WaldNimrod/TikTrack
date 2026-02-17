# Evidence — User Tickers Crypto + Provider Mapping Corrective

**Team:** 20 (Backend)  
**Date:** 2026-02-14  
**Source:** TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_AND_CORRECTIVE_PLAN, TEAM_10_TO_TEAM_20_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE

---

## 1. Implemented Changes

### 1.1 Alpha Vantage — DIGITAL_CURRENCY_DAILY
- **File:** `api/integrations/market_data/providers/alpha_provider.py`
- **Method:** `get_ticker_price_crypto(symbol: str, market: str = "USD")`
- **Endpoint:** `function=DIGITAL_CURRENCY_DAILY`, `symbol=BTC`, `market=USD`
- **Behavior:** Returns latest daily close; no GLOBAL_QUOTE for crypto.

### 1.2 User Tickers Service — Provider Mapping
- **File:** `api/services/user_tickers_service.py`
- **Functions:** `_infer_provider_mapping()`, `_live_data_check(symbol, ticker_type, market, provider_mapping)`
- **Logic:**
  - CRYPTO: yahoo.symbol = "BTC-USD", alpha.symbol = "BTC", alpha.market = "USD"
  - STOCK: yahoo.symbol = alpha.symbol = symbol
- **Storage:** `ticker_metadata.provider_mapping_data` on new ticker creation.

### 1.3 Router — Market Parameter
- **File:** `api/routers/me_tickers.py`
- **Change:** `market: Optional[str] = Query(None)` for POST /me/tickers
- **Usage:** Passed to service when creating CRYPTO ticker.

---

## 2. Success Criteria (Partial)

| Criterion | Status |
|-----------|--------|
| Add crypto ticker (BTC-USD) without 422 | ✅ Implemented |
| Live-data check uses provider mapping | ✅ Implemented |
| Alpha uses DIGITAL_CURRENCY_DAILY for crypto | ✅ Implemented |
| European exchanges + TASE | ⏳ Awaiting seed from Team 10 |

---

## 3. Files Modified

- `api/integrations/market_data/providers/alpha_provider.py`
- `api/services/user_tickers_service.py`
- `api/routers/me_tickers.py`

---

## 4. Sync Scripts (TEAM_60_COORDINATION)

Per TEAM_60_TO_TEAM_20_USER_TICKERS_CRYPTO_EXCHANGE_COORDINATION:

- **EOD, Intraday, History backfill**: Load ticker_type + metadata; use provider mapping for CRYPTO.
- **provider_mapping_utils.py**: Shared logic.
- **history_backfill_service.py**: Passes ticker_type, metadata to fetch.

---

**log_entry | TEAM_20 | USER_TICKERS_CRYPTO_CORRECTIVE_EVIDENCE | 2026-02-14**
