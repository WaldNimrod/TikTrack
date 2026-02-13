# MARKET_DATA_PIPE — טיוטה להעלאה ל-SSOT

**id:** `TEAM_20_STAGE1_1_002_MARKET_DATA_PIPE_DRAFT`  
**משימה:** 1-002 MARKET_DATA_PIPE  
**בעלים:** Team 20 (Backend) + Team 60 (תשתית)  
**תאריך:** 2026-01-31  
**תלות:** FOREX_MARKET_SPEC (1-001)  
**מקום SSOT יעד:** `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`  
**מפת דרכים:** Roadmap v2.1 — Stage-1 (BLOCKING BATCH 3)

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

- טבלה: `user_data.ticker_prices`
- שדות: `price`, `open_price`, `high_price`, `low_price`, `close_price` — `NUMERIC(20,8)`
- מקור: `api/models/ticker_prices.py`

### 4.2 שערי חליפין (Exchange Rates)

- לפי FOREX_MARKET_SPEC (1-001)
- `conversion_rate` — `NUMERIC(20,8)`

---

## 5. תיאום Team 60

| נושא | בעלים | הערות |
|------|--------|--------|
| תשתית Cache | Team 60 | Redis / in-memory / DB — לפי החלטה |
| סנכרון EOD | Team 60 | cron / job — לפי החלטה |
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
| FOREX_MARKET_SPEC | _COMMUNICATION/team_20/TEAM_20_STAGE1_1_001_FOREX_MARKET_SPEC_DRAFT.md |
| ticker_prices model | api/models/ticker_prices.py |
| Roadmap v2.1 | _COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md |

---

**בקשה ל-Team 10:** לקדם טיוטה זו ל־`documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`.  
**בקשה ל-Team 60:** לתאם תשתית Cache/EOD לפי Spec זה.

**log_entry | TEAM_20 | STAGE1_1_002 | MARKET_DATA_PIPE_DRAFT | 2026-01-31**
