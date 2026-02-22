# Market Indicators & Fundamentals — SSOT (Stage‑1)
**project_domain:** TIKTRACK

**id:** `MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC`  
**owner:** Team 10 (SSOT); מקור: Team 90 Draft  
**status:** 🔒 SSOT — Stage-1  
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

- `MARKET_DATA_COVERAGE_MATRIX.md`  
- `MARKET_DATA_PIPE_SPEC.md` (cache‑first, provider priority)  
- `PRECISION_POLICY_SSOT.md` (prices/rates = 20,8; market_cap = 20,8)

---

**log_entry | TEAM_10 | SSOT_PROMOTION | MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC | 2026-02-13**
