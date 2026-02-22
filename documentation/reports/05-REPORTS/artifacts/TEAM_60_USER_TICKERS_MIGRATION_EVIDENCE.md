# Team 60: Evidence — User Tickers Migration (P3-020)
**project_domain:** TIKTRACK

**date:** 2026-02-14  
**מקור:** TEAM_20_TO_TEAM_60_USER_TICKERS_MIGRATION_READY; TEAM_10_USER_TICKERS_WORK_PLAN 60.UT.1

---

## 1. הרצה

| פריט | ערך |
|------|------|
| **Migration** | `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql` |
| **הרצה** | הצלחה (exit 0) |
| **Make target** | `make migrate-p3-020` |

---

## 2. תוצאה

| טבלה/שדה | סטטוס |
|-----------|--------|
| `market_data.tickers.status` | נוסף (אם חסר) — pending\|active\|inactive\|cancelled |
| `user_data.user_tickers` | נוצר — id, user_id, ticker_id, created_at, deleted_at |
| אינדקסים | idx_user_tickers_user_ticker_active (UNIQUE), idx_user_tickers_user_id, idx_user_tickers_ticker_id |
| FK | user_id → users, ticker_id → tickers |

---

## 3. אימות

```
\d user_data.user_tickers — טבלה קיימת, עמודות ואינדקסים תואמים.
```

---

**log_entry | TEAM_60 | USER_TICKERS_MIGRATION_EVIDENCE | 2026-02-14**
