# 🕵️ Market Indicators & Fundamentals — SSOT Draft (Stage‑1)

**id:** `MARKET_INDICATORS_AND_FUNDAMENTALS_SSOT_DRAFT`  
**owner:** Team 90 (Draft for Team 10 SSOT promotion)  
**status:** DRAFT — SSOT INSERTION REQUIRED  
**date:** 2026-02-13

---

## 1) Scope (Stage‑1)

**Included now:**
- **ATR(14)**
- **MA(20, 50, 150, 200)**
- **CCI(20)**
- **Market Cap**

**Deferred (later stage):**
- **EPS** (with full Fundamentals)

---

## 2) Definitions (Stage‑1 defaults)

| Indicator | Period | Source Data | Cadence | Precision |
|---|---|---|---|---|
| **ATR** | 14 | Daily OHLC (250 days) | Daily (EOD) | NUMERIC(20,8) |
| **MA** | 20/50/150/200 | Daily Close (250 days) | Daily (EOD) | NUMERIC(20,8) |
| **CCI** | 20 | Daily OHLC (250 days) | Daily (EOD) | NUMERIC(20,8) |

**Market Cap**
- Source: Provider (Yahoo/Alpha)
- Cadence: Daily (EOD)
- Precision: NUMERIC(20,8)

---

## 3) Computation Rules

- Indicators are computed from **daily historical prices** (no intraday requirement).  
- Minimum history required: **250 trading days**.  
- Stage‑1 supports **fixed periods** (ATR‑14, CCI‑20).  
- Future enhancement: allow user‑selectable periods via Settings.

---

## 4) Storage Strategy (Stage‑1)

- **Default:** compute‑on‑read in service layer.  
- **Optional cache:** if performance required, store in `market_data.ticker_indicators` (future table).  

**Note:** If cached, must include `as_of` + `calculated_at` timestamps and adhere to Precision Policy.

---

## 5) SSOT Dependencies

- `MARKET_DATA_COVERAGE_MATRIX_SSOT`  
- `MARKET_DATA_PIPE_SPEC.md` (cache‑first, provider priority)  
- `PRECISION_POLICY_SSOT.md` (prices/rates = 20,8; add market_cap if missing)

---

**log_entry | TEAM_90 | INDICATORS_FUNDAMENTALS_SSOT_DRAFT | 2026-02-13**
