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
- שדות: `price`, `open_price`, `high_price`, `low_price`, `close_price` — `NUMERIC(20,8)`
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
| ספק + Scope מטבעות | Team 60 | **Frankfurter API** (חינם); **Scope ראשוני:** USD, EUR, ILS בלבד. הרחבה לפי ISO 4217 — עתידי. |
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
**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | CACHE_EOD_DECISION_TO_SSOT | 2026-02-13** — DB-as-Cache, Cron+UTC, Frankfurter, Scope USD/EUR/ILS (מקור: Team 60 TEAM_60_TO_TEAM_10_CACHE_EOD_CONDITIONAL_APPROVAL_FIXES)
