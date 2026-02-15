# 🕵️ Market Data Coverage Matrix — SSOT Draft (Stage‑1)

**id:** `MARKET_DATA_COVERAGE_MATRIX_SSOT_DRAFT`  
**owner:** Team 90 (Draft for Team 10 SSOT promotion)  
**status:** DRAFT — SSOT INSERTION REQUIRED  
**date:** 2026-02-13

---

## 1) Purpose
Define **which data is loaded per ticker**, cadence, storage, precision, and UI freshness behavior. This matrix prevents scope gaps and enables future expansion without code rewrites.

---

## 2) Stage‑1 Coverage (Locked Decisions)

| Domain | Data Items | Provider Priority | Cadence | Storage | Precision | Freshness UI | Notes |
|---|---|---|---|---|---|---|---|
| **FX Rates** | conversion_rate, last_sync_time | **Alpha → Yahoo** | **EOD בלבד** | `market_data.exchange_rates` | **20,8** | Clock + tooltip (stale) | USD/EUR/ILS בלבד |
| **Prices (Active tickers)** | price, open, high, low, close, volume | **Yahoo → Alpha** | **Intraday** | `market_data.ticker_prices` | **20,8** | Clock + tooltip (stale) | Active tickers only |
| **Prices (Inactive)** | price, open, high, low, close, volume | **Yahoo → Alpha** | **EOD בלבד** | `market_data.ticker_prices` | **20,8** | Clock + tooltip (stale) | Cadence per ticker status |
| **Historical Daily** | OHLCV daily | **Yahoo → Alpha** | **Daily** | `market_data.ticker_prices` | **20,8** | N/A | **250 trading days retention** |
| **Indicators** | ATR(14), MA(20/50/150/200), CCI(20) | Derived from daily OHLC | **Daily** | Derived (compute) or cached | **20,8** | N/A | Computed from 250‑day history |
| **Market Cap** | market_cap | **Yahoo → Alpha** | **Daily (EOD)** | `market_data.ticker_prices` (new field) | **20,8** | Clock + tooltip | **Required now** |
| **EPS** | eps | TBD (future) | Future | Future | TBD | Future | **Deferred with Fundamentals** |

---

## 3) Stage‑1 Rules

1. **Intraday only for Active tickers** (defined by System Settings).  
2. **Historical daily** data is required to compute ATR/MA/CCI.  
3. **No intraday retention for full 250‑day range.**  
4. **Market Cap** is required now; EPS deferred to advanced fundamentals.  
5. **Provider Swap** must be possible via config only (Agnostic Interface).  
6. **Cache‑First** applies to all domains.

---

## 4) Required SSOT Alignments

- `MARKET_DATA_PIPE_SPEC.md` → insert this matrix or reference it.  
- `FOREX_MARKET_SPEC.md` → FX cadence + providers + precision.  
- `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md` → provider mapping.  
- `PRECISION_POLICY_SSOT.md` → add **market_cap = 20,8** if not already defined.

---

## 5) Open Implementation Question (requires locking in SSOT)

**How to distinguish intraday vs daily in `ticker_prices`?**  
Options:
- Add `price_interval` (ENUM: 1d, 1h, 15m).  
- Or split into `ticker_prices_daily` + `ticker_prices_intraday`.

Decision required before implementation.

---

**log_entry | TEAM_90 | MARKET_DATA_COVERAGE_MATRIX_SSOT_DRAFT | 2026-02-13**
