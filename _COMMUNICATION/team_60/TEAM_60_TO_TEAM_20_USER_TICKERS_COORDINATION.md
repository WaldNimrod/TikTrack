# Team 60 → Team 20: תאום — User Tickers Migration

**id:** `TEAM_60_TO_TEAM_20_USER_TICKERS_COORDINATION`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**date:** 2026-02-14  
**מקור:** TEAM_10_USER_TICKERS_WORK_PLAN (20.UT.1 → 60.UT.1); TEAM_90_USER_TICKERS_IMPLEMENTATION_BRIEF §4.3

---

## 1. הקשר

Team 60 ממתין להרצת migration לטבלה `user_data.user_tickers` — **תלוי ב־20.UT.1** (DDL + migration script).

---

## 2. בקשת תאום

### 2.1 נדרש מ־Team 20

- **קובץ DDL/migration** ל־`user_data.user_tickers`
- **מיקום:** `scripts/migrations/` (למשל `create_user_tickers_table.sql` או `p3_020_user_tickers.sql`)
- **מבנה:** לפי Work Plan — `user_id`, `ticker_id`, `created_at`, `deleted_at`; FK ל־users ו־tickers; UNIQUE (user_id, ticker_id) WHERE deleted_at IS NULL; אינדקסים

### 2.2 התחייבות Team 60

לאחר קבלת הקובץ:
1. הרצה בסביבת dev (docker/psql)
2. וידוא טבלה קיימת, אין שבירת build
3. Evidence ב־`documentation/05-REPORTS/artifacts/`
4. דיווח ל־Team 10 על סיום

---

## 3. תלות

| צוות | משימה | תלות |
|------|--------|-------|
| **20** | 20.UT.1 — DDL + migration | — |
| **60** | 60.UT.1 — הרצת migration | 20.UT.1 |

---

## 4. המשך

נא לעדכן כאשר הקובץ מוכן — Team 60 יריץ וידווח.

---

**log_entry | TEAM_60 | TO_TEAM_20 | USER_TICKERS_COORDINATION | 2026-02-14**
