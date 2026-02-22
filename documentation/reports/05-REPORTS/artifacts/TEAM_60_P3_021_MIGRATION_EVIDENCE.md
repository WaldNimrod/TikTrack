# Team 60: Evidence — P3-021 Market Data Reference Tables
**project_domain:** TIKTRACK

**date:** 2026-01-31  
**מקור:** TEAM_20_TO_TEAM_60_USER_TICKERS_DB_SCHEMA_BLOCKER

---

## 1. הרצה

| פריט | ערך |
|------|------|
| **Migration** | `scripts/migrations/p3_021_market_data_reference_tables.sql` |
| **הרצה** | הצלחה (exit 0) |
| **Make target** | `make migrate-p3-021` |

---

## 2. טבלאות ו־seed

| טבלה | סטטוס | שורות |
|------|--------|-------|
| `market_data.exchanges` | ✅ קיימת + seed | 5 (NASDAQ, NYSE, LSE, TASE, MIL) |
| `market_data.sectors` | ✅ קיימת + seed | 11 |
| `market_data.industries` | ✅ קיימת | — |
| `market_data.market_cap_groups` | ✅ קיימת + seed | 6 |

---

## 3. אימות QA

```
bash scripts/run-user-tickers-qa-api.sh
```

| בדיקה | תוצאה |
|--------|--------|
| POST (AAPL) | 201/409 ✅ — אין 422 מ־ForeignKey |
| POST (fake) | 422 ✅ |

---

**log_entry | TEAM_60 | P3_021_MIGRATION_EVIDENCE | 2026-01-31**
