# Team 20 → Team 60: מסירת Migration — user_data.user_tickers

**From:** Team 20 (Backend)  
**To:** Team 60 (DevOps)  
**Date:** 2026-02-14  
**Task:** 60.UT.1 — הרצת migration ל־user_data.user_tickers

---

## 1. קובץ Migration

**נתיב:** `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql`

---

## 2. תוכן (סיכום)

1. **market_data.tickers** — הוספת עמודת `status` אם לא קיימת (pending|active|inactive|cancelled)
2. **user_data.user_tickers** — טבלה חדשה:
   - user_id, ticker_id, created_at, deleted_at
   - FK ל-users ו-tickers
   - UNIQUE (user_id, ticker_id) WHERE deleted_at IS NULL
   - אינדקסים

---

## 3. הנחיות הרצה

- הרצה בסביבות רלוונטיות (dev, staging, prod לפי נוהל)
- אין שבירת build
- Evidence: דיווח כי הטבלה קיימת ב-DB

---

**log_entry | [Team 20] | TO_TEAM_60 | MIGRATION_HANDOFF | USER_TICKERS | 2026-02-14**
