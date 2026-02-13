# Team 60 → Team 20: DDL exchange_rates — הורץ בהצלחה

**id:** `TEAM_60_EXCHANGE_RATES_DDL_EXECUTED`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**מקור:** TEAM_20_TO_TEAM_60_EXCHANGE_RATES_DDL_SPEC.md

---

## 1. ביצוע

טבלת `market_data.exchange_rates` נוצרה והדלקה ב-DB.

**סקריפט:** `scripts/migrations/create_exchange_rates_table.sql`  
**הרצה:** exit code 0

---

## 2. מבנה מאומת

| עמודה | טיפוס | הערות |
|-------|-------|--------|
| id | UUID | PK, gen_random_uuid() |
| from_currency | VARCHAR(3) | ISO 4217 |
| to_currency | VARCHAR(3) | ISO 4217 |
| conversion_rate | NUMERIC(20, 8) | per FOREX_MARKET_SPEC |
| last_sync_time | TIMESTAMPTZ | default now() |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |

**אילוצים:** UNIQUE(from_currency, to_currency), CHECK(conversion_rate > 0)

---

## 3. צעדים הבאים (Team 20)

- יצירת מודל / API ל־exchange_rates
- לוגיקת EOD sync (קריאה ל־API חיצוני וכתיבה לטבלה)

---

**log_entry | TEAM_60 | TO_TEAM_20 | EXCHANGE_RATES_DDL_EXECUTED | 2026-02-13**
