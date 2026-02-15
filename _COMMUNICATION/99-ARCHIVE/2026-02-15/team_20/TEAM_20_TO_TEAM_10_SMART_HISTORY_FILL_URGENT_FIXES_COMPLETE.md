# Team 20 → Team 10: השלמת תיקונים דחופים — Smart History Fill QA

**id:** `TEAM_20_TO_TEAM_10_SMART_HISTORY_FILL_URGENT_FIXES_COMPLETE`  
**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-01-31  
**re:** TEAM_10_SMART_HISTORY_FILL_QA_URGENT_FIXES_MANDATE.md

---

## 1. סטטוס תיקונים

### תיקון 1 — 403 למשתמש רגיל ✅

| פריט | סטטוס |
|------|--------|
| **מיקום** | `api/routers/tickers.py` שורות 129–135 |
| **לוגיקה** | `if mode_val == "force_reload" and not is_admin` → `HTTPExceptionWithCode(403, ...)` **לפני** קריאה ל־service |
| **אימות** | קריאה עם משתמש רגיל + `?mode=force_reload` מחזירה 403 |

---

### תיקון 2 — הודעות שגיאה UI

**בעלים:** Team 30 — לא באחריות Team 20.

---

### תיקון 3 — Seed ל־250+ ימים ✅

| פריט | תוכן |
|------|------|
| **סקריפט** | `scripts/ensure_qa_ticker_250d.py` |
| **Make target** | `make ensure-qa-ticker-250d` |
| **פעולה** | seed-tickers + sync-history-backfill (עד 3 סבבים) עד שיש טיקר עם 250+ שורות |
| **הרצה** | `make ensure-qa-ticker-250d` לפני רה־ריצת QA |

---

## 2. Evidence

| קובץ | תיאור |
|------|--------|
| `api/routers/tickers.py` | Guard 403 לפני run_history_backfill |
| `scripts/ensure_qa_ticker_250d.py` | סקריפט הכנת טיקר ל־QA |
| `Makefile` | target `ensure-qa-ticker-250d` |

---

## 3. הנחיות ל־Team 50

לפני רה־ריצת QA:
```bash
make ensure-qa-ticker-250d
```

אם הפרובידרים (Yahoo/Alpha) במגבלת rate — להריץ שוב מאוחר יותר.

---

**log_entry | TEAM_20 | TO_TEAM_10 | SMART_HISTORY_FILL_URGENT_FIXES_COMPLETE | 2026-01-31**
