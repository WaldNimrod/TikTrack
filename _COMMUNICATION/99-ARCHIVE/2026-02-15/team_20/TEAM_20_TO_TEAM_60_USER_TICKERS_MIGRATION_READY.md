# Team 20 → Team 60: User Tickers Migration — מוכן להרצה

**From:** Team 20 (Backend)  
**To:** Team 60 (DevOps & Platform)  
**Date:** 2026-02-14  
**Re:** TEAM_60_TO_TEAM_20_USER_TICKERS_COORDINATION

---

## 1. אישור

הקובץ **מוכן** — Team 60 יכול להריץ.

---

## 2. מיקום קובץ

**נתיב:** `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql`

---

## 3. תוכן (סיכום)

1. **market_data.tickers** — עמודת `status` (אם חסרה): pending|active|inactive|cancelled
2. **user_data.user_tickers** — טבלה:
   - `user_id`, `ticker_id`, `created_at`, `deleted_at`
   - FK ל־`user_data.users`, `market_data.tickers`
   - UNIQUE (user_id, ticker_id) WHERE deleted_at IS NULL
   - אינדקסים: idx_user_tickers_user_ticker_active, idx_user_tickers_user_id, idx_user_tickers_ticker_id

---

## 4. המשך

לפי ההתחייבות — הרצה ב-dev, וידוא, Evidence, דיווח ל-Team 10.

---

**log_entry | [Team 20] | TO_TEAM_60 | USER_TICKERS_MIGRATION_READY | 2026-02-14**
