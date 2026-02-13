# Team 60 → Team 20: תיאום Stage-1 משימה 1-002 (MARKET_DATA_PIPE)

**id:** `TEAM_60_STAGE1_1_002_COORDINATION`  
**משימה:** 1-002 MARKET_DATA_PIPE  
**תאריך:** 2026-02-13  
**מקור:** TEAM_20_STAGE1_1_002_MARKET_DATA_PIPE_DRAFT; TEAM_10_TO_TEAM_60_STAGE1_COORDINATION.md

---

## 1. אישור קבלת הטיוטה

Team 60 קיבל את הטיוטה `TEAM_20_STAGE1_1_002_MARKET_DATA_PIPE_DRAFT.md` ומאשר תיאום.

**תלות:** 1-001 FOREX_MARKET_SPEC — התחלה מתוכננת 2026-02-23.

---

## 2. סטטוס תשתית נוכחי

| רכיב | סטטוס | הערות |
|------|--------|-------|
| **ticker_prices** | ✅ קיים | market_data.ticker_prices — price, open_price, high_price, low_price, close_price NUMERIC(20,8) |
| **exchange_rates** | ❌ לא קיים | יידרש DDL לפי FOREX_MARKET_SPEC (1-001) |
| **Cache** | ⏳ ממתין | Redis / in-memory / DB — לפי החלטה ב-Spec הסופי |
| **סנכרון EOD** | ⏳ ממתין | cron / job — לפי החלטה ב-Spec הסופי |

---

## 3. DDL מוצע — exchange_rates (לאחר 1-001)

**מתי:** לאחר קידום FOREX_MARKET_SPEC ל-SSOT  
**בקשה:** Team 20/Team 10 — לספק Spec סופי לשדות exchange_rates

**שלד מוצע (לפי הטיוטה):**
```sql
-- exchange_rates — בהתאם ל-FOREX_MARKET_SPEC
-- conversion_rate NUMERIC(20,8)
```

Team 60 יבצע את ה-DDL לאחר אישור Spec.

---

## 4. התחייבות

- ✅ תיאום על Cache/EOD — לאחר Spec ב-SSOT (`documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`)
- ✅ DDL exchange_rates — לאחר FOREX_MARKET_SPEC
- ✅ דיווח התחלה — 2026-02-23 (תאריך מתוכנן)
- ✅ דיווח השלמה — ל-Team 10

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| טיוטה Team 20 | _COMMUNICATION/team_20/TEAM_20_STAGE1_1_002_MARKET_DATA_PIPE_DRAFT.md |
| Market Data Resilience | documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md |
| מנדט Stage-1 | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_STAGE1_MANDATE.md |

---

**log_entry | TEAM_60 | STAGE1_1_002 | COORDINATION_SENT | 2026-02-13**
