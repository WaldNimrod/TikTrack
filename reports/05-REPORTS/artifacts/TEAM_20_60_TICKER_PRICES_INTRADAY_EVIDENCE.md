# Evidence — טבלת market_data.ticker_prices_intraday (לסוויטה C)

**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_REVIEW — מכשול 3.  
**תאריך:** 2026-02-13

---

## DDL / Migration

הטבלה מוגדרת ב־**migration:**

| פריט | נתיב |
|------|------|
| Migration | `scripts/migrations/p3_016_create_ticker_prices_intraday.sql` |

תוכן: `CREATE TABLE IF NOT EXISTS market_data.ticker_prices_intraday (...)` עם שדות לפי MARKET_DATA_PIPE_SPEC §4.1, §7.

---

## וידוא שהטבלה קיימת ב-DB

לפני הרצת סוויטה C יש להריץ את ה-migration (אם טרם הורצה). לוידוא שהטבלה קיימת:

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'market_data' AND table_name = 'ticker_prices_intraday'
);
-- תוצאה צפויה: true
```

או:

```sql
\dt market_data.ticker_prices_intraday
-- (psql)
```

**אחריות:** Team 20/60 — להריץ migration ו/או לספק פלט בדיקה אם Team 90 דורשים Evidence מהמסד.

---

**log_entry | TEAM_10 | TICKER_PRICES_INTRADAY_EVIDENCE | 2026-02-13**
