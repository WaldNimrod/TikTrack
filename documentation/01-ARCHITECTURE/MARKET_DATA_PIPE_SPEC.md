# MARKET_DATA_PIPE_SPEC — SSOT

**id:** `MARKET_DATA_PIPE_SPEC`  
**משימה:** 1-002 (Stage-1)  
**בעלים:** Team 20 (Backend) + Team 60 (תשתית)  
**תלות:** FOREX_MARKET_SPEC (1-001)  
**מפת דרכים:** Roadmap v2.1 — Stage-1 (BLOCKING BATCH 3)  
**סטטוס:** SSOT — קודם מטיוטת Team 20 ע"י Team 10 (Knowledge Promotion)  
**תאריך קידום:** 2026-02-13

---

## 1. מטרה

אפיון תשתית אספקת מחירי שוק (Market Data Pipeline) — היררכיית מקורות, מדיניות Staleness, ואי־חסימת UI.

---

## 2. היררכיית מקורות (Source Hierarchy)

| רמה | מקור | תיאור |
|-----|------|--------|
| 1 | **Cache** | מטמון מקומי — עדיפות ראשונה |
| 2 | **EOD** | End-of-Day / API חיצוני |
| 3 | **LocalStore** | שמירה מקומית (fallback) |

**מקור קיים:** `documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md`

---

## 2.1 Providers & Priority (Stage-1 — LOCKED)

| Domain | Primary | Fallback |
|--------|---------|----------|
| FX (Exchange Rates) | Alpha Vantage | Yahoo Finance |
| Prices (Ticker Prices) | Yahoo Finance | Alpha Vantage |

**No Frankfurter.** IBKR is **Broker only** (not market-data provider in Stage-1).  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE; ARCHITECT_VERDICT_MARKET_DATA_STAGE_1 (ADR-022).

---

## 2.2 Provider Guardrails (LOCKED)

| ספק | חובה |
|-----|------|
| **Yahoo Finance** | User-Agent Rotation **required**. |
| **Alpha Vantage** | RateLimitQueue **required** (12.5s delay → 5 calls/min). |

---

## 2.3 Cache-First (Mandatory)

1. **Always check local cache (DB)** before any external API call.
2. Cache HIT → return immediately.
3. Cache MISS → Provider (Primary → Fallback).
4. Both fail → return stale (if exists) + `staleness=na`. **Never block UI.**

---

## 2.4 Cadence Policy

- **FX:** EOD בלבד.
- **Prices:** Intraday for **Active tickers**; EOD for inactive (לפי System Settings — Domain + Ticker Status).
- **Historical daily:** 250 trading days retention (OHLCV) — נדרש ל־Indicators (ATR/MA/CCI).
- **Market Cap:** Daily (EOD). **Indicators:** ATR(14), MA(20/50/150/200), CCI(20) — Daily, derived from 250d history.

**מטריצת כיסוי מלאה:** `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md`.

---

## 2.5 Data Freshness & UI Indicator (No Banner)

- UI must show **Last Update Clock** for prices.
- If stale/EOD → clock changes color + tooltip explains staleness.
- Fields: `price_timestamp` (as_of), `fetched_at`, `is_stale`. **אין באנר** — Clock + color + tooltip בלבד.

---

## 3. מדיניות (Policy)

| כלל | תיאור |
|-----|--------|
| **Never block UI** | אסור לחסום את ה-UI בגלל קריאה ל-API חיצוני |
| **Staleness Warning** | התראה כשהנתונים בני 15 דקות |
| **Staleness N/A** | אחרי יום מסחר מלא — N/A / אין ציפייה |

---

## 4. ממשקים צפויים

### 4.1 מחירי טיקרים (Ticker Prices)

- טבלה: `market_data.ticker_prices`
- שדות: `price`, `open_price`, `high_price`, `low_price`, `close_price`, **`market_cap`** — `NUMERIC(20,8)`
- **Historical daily:** 250 trading days retention (OHLCV) — נדרש ל־Indicators.
- **Indicators (Stage-1):** ATR(14), MA(20/50/150/200), CCI(20) — ראה `MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md`.
- מקור: `api/models/ticker_prices.py`

### 4.2 שערי חליפין (Exchange Rates)

- לפי FOREX_MARKET_SPEC (1-001) — `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md`
- `conversion_rate` — `NUMERIC(20,8)`

---

## 5. תיאום Team 60

| נושא | בעלים | הערות |
|------|--------|--------|
| תשתית Cache | Team 60 | **DB as Cache** — טבלאות DB + `market_data.latest_ticker_prices` (MV) כמאגר; ללא Redis בשלב זה. |
| סנכרון EOD | Team 60 | **Cron** דוגמה: `0 22 * * 1-5` (22:00 ימים א'–ה'); **אזור זמן:** UTC. סקריפט: `scripts/sync_exchange_rates_eod.py`. |
| ספק + Scope מטבעות | Team 60 | **Alpha Vantage → Yahoo.** **Scope ראשוני:** USD, EUR, ILS בלבד. הרחבה לפי ISO 4217 — עתידי. |
| DDL / Schema | Team 60 | טבלאות ticker_prices, exchange_rates |

---

## 6. תוכנית ולידציה

1. וידוא שהממשק לא חוסם UI (timeout, fallback).
2. וידוא Staleness logic — Warning / N/A.
3. Precision Audit (1-004) — NUMERIC(20,8) בכל השדות.

---

## 7. הפניות

| מסמך | נתיב |
|------|------|
| TT2_MARKET_DATA_RESILIENCE | documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md |
| FOREX_MARKET_SPEC | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md |
| ticker_prices model | api/models/ticker_prices.py |
| Roadmap v2.1 | _COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md |

---

**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | MARKET_DATA_PIPE_SPEC_SSOT | 2026-02-13**  
**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | CACHE_EOD_DECISION_TO_SSOT | 2026-02-13**  
**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | EXTERNAL_DATA_SSOT_INTEGRATION | 2026-02-13** — Providers (Yahoo+Alpha), Guardrails, Cache-First, Cadence, UI Clock (מקור: TEAM_90_MARKET_DATA_SSOT_INTEGRATION_DRAFT). — DB-as-Cache, Cron+UTC, Scope USD/EUR/ILS (מקור: Team 60).  
**log_entry | TEAM_10 | SSOT_EXPANSION | RESUBMISSION_90 | 2026-02-13** — Market Cap, Indicators (ATR/MA/CCI), 250d historical, Coverage Matrix + Indicators Spec (מקור: TEAM_90_RESUBMISSION_REQUIRED, TEAM_90_INDICATORS_ADDENDUM).
