# Market Data Coverage Matrix — SSOT (Stage‑1)

**id:** `MARKET_DATA_COVERAGE_MATRIX`  
**owner:** Team 10 (SSOT); מקור: Team 90 Draft  
**status:** 🔒 SSOT — Stage-1  
**date:** 2026-02-13

---

## 1) Purpose

Define **which data is loaded per ticker**, cadence, storage, precision, and UI freshness behavior. This matrix prevents scope gaps and enables future expansion without code rewrites.

---

## 2) Stage‑1 Coverage (Locked Decisions)

| Domain | Data Items | Provider Priority | Cadence | Storage | Precision | Freshness UI | Notes |
|---|---|---|---|---|---|---|---|
| **FX Rates** | conversion_rate, last_sync_time | **Alpha → Yahoo** | **EOD בלבד** | `market_data.exchange_rates` | **20,8** | Clock + tooltip (stale) | USD/EUR/ILS בלבד |
| **Prices (is_active = true)** | price, open, high, low, close, volume | **Yahoo → Alpha** | **Intraday** (configurable) | `market_data.ticker_prices_intraday` | **20,8** | Clock + tooltip (stale) | מקור: TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT |
| **Prices (is_active = false)** | price, open, high, low, close, volume | **Yahoo → Alpha** | **EOD בלבד** | `market_data.ticker_prices` | **20,8** | Clock + tooltip (stale) | מקור: TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT |
| **Historical Daily** | OHLCV daily | **Yahoo → Alpha** | **Daily** | `market_data.ticker_prices` | **20,8** | N/A | **250 trading days retention** |
| **Indicators** | ATR(14), MA(20/50/150/200), CCI(20) | Derived from daily OHLC | **Daily** | Derived (compute) or cached | **20,8** | N/A | Computed from 250‑day history |
| **Market Cap** | market_cap | **Yahoo → Alpha** | **Daily (EOD)** | `market_data.ticker_prices` (new field) | **20,8** | Clock + tooltip | **Required now** |
| **EPS** | eps | TBD (future) | Future | Future | TBD | Future | **Deferred with Fundamentals** |

---

## 3) Stage‑1 Rules

1. **Intraday** רק לטיקרים עם **`is_active = true`** (מצב נוכחי ב-DB). סטטוס טיקר וקצב: מקור אמת [TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT](../09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md). System Settings: תזמון Intraday ניתן להגדרה.  
2. **Historical daily** data is required to compute ATR/MA/CCI.  
3. **No intraday retention for full 250‑day range.**  
4. **Market Cap** is required now; EPS deferred to advanced fundamentals.  
5. **Provider Swap** must be possible via config only (Agnostic Interface).  
6. **Cache‑First** applies to all domains.
7. **Retention + Archive:**  
   - Intraday DB: 30 days → archive files (1 year) → delete.  
   - EOD/FX DB: 250 trading days → archive files (no hard delete).
8. **Rate‑Limit & Scaling Policy:** Cache‑First + Single‑Flight + cooldown on 429; configurable cadence in System Settings.
9. **Smart History Fill (LOCKED):** 250 trading days minimum per ticker; **Gap-First** (fill only missing dates); **Full Reload only from Admin** (explicit confirmation); API: single endpoint `mode=gap_fill` (default) | `force_reload`; Provider interface: `date_from`/`date_to` optional; Retry: immediate + batch at night. **מקור SSOT:** MARKET_DATA_PIPE_SPEC §5.

---

## 4) SSOT References

- **סטטוס טיקר וקצב טעינה:** [TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md](../09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md) — מצב נוכחי: is_active (true/false); יעד: שדה status.
- `MARKET_DATA_PIPE_SPEC.md` — hierarchy, guardrails, cadence.  
- `FOREX_MARKET_SPEC.md` — FX cadence + providers + precision.  
- `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md` — provider mapping.  
- `PRECISION_POLICY_SSOT.md` — market_cap = 20,8.  
- `MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md` — ATR/MA/CCI definitions.
- **Smart History Fill (Locked):** MARKET_DATA_PIPE_SPEC §5.

---

**log_entry | TEAM_10 | SSOT_PROMOTION | MARKET_DATA_COVERAGE_MATRIX | 2026-02-13**  
**log_entry | TEAM_90 | INTRADAY_LOCK | SEPARATE_INTRADAY_TABLE | 2026-02-13**
**log_entry | TEAM_90 | RETENTION_ARCHIVE_LOCK | 2026-02-13** — Intraday 30d→archive 1y; EOD/FX 250d→archive.  
**log_entry | TEAM_10 | SSOT_UPDATE | SMART_HISTORY_FILL_RULE_9 | 2026-02-14** — Rule 9: Smart History Fill (250d min, Gap-First, Reload Admin only, API mode, Retry). מקור SSOT: MARKET_DATA_PIPE_SPEC §5.
