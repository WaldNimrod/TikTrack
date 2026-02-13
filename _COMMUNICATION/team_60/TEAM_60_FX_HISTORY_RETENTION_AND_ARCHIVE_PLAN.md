# Team 60: תוכנית Retention + ארכיון — FX History

**id:** `TEAM_60_FX_HISTORY_RETENTION_ARCHIVE_PLAN`  
**מקור:** MARKET_DATA_PIPE_SPEC §7.3; TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE §6.3  
**date:** 2026-02-13  
**סטטוס:** DRAFT — ממתין לאישור אדריכל / Team 10

---

## 1. מדיניות (SSOT §7.3)

| טווח | מדיניות |
|------|----------|
| **DB Retention** | 250 ימי מסחר |
| **Archive** | לא מחיקה קשיחה — העברה לקבצי ארכיון |
| **קריאה מאוחרת** | קבצי ארכיון — קריאה איטית בעת הצורך |

---

## 2. Job — FX History Cleanup

| פעולה | תיאור |
|--------|--------|
| **ניקוי** | מחיקת רשומות ישנות מ־250 ימי מסחר (או השארתן — לפי החלטה) |
| **ארכוב** | ייצוא ל־CSV/SQL לפני מחיקה (אם נדרש) |
| **תזמון** | Daily — כחלק מ-cleanup-market-data או job נפרד |

---

## 3. מימוש מתוכנן

- הרחבת `scripts/cleanup_market_data.py` — פונקציה `run_cleanup_fx_history()`  
- או: job נפרד `scripts/archive_exchange_rates_history.py`  
- Evidence: last_run_time, rows_pruned, rows_archived

---

## 4. תלות

- **טבלת exchange_rates_history** — DDL ממתין לאישור; ראה `scripts/migrations/p3_exchange_rates_history_DRAFT.sql`

---

**log_entry | TEAM_60 | FX_HISTORY_RETENTION_PLAN | DRAFT | 2026-02-13**
