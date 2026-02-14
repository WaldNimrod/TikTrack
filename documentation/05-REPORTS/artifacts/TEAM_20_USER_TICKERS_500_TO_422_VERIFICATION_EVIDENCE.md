# Team 20 — Evidence: אימות 500→422 + סקריפט verify

**תאריך:** 2026-01-31  
**מקור:** QA results (POST fake 500→422); משתמש — "הפעלת מחדש, תבדקו, אין סיבה שלא תבצעו איתחול לפני הגשה"

---

## 1. תוצאות QA (אחרי restart)

| בדיקה | תוצאה |
|-------|--------|
| Login | ✅ |
| GET /me/tickers | ✅ 200 |
| POST (fake) | ✅ 422 |
| POST (AAPL) | ✅ 409 |
| POST (BTC) | ⚠️ 422 (ספק לא החזיר) |
| POST (TEVA.TA, ANAU.MI) | ⚠️ 422 |

**מצופה:** POST (fake) → 422 — **הושג**. Item 4 (provider failure → 422) — PASS.

---

## 2. סקריפט אימות לפני הגשה

**נוצר:** `scripts/verify-user-tickers-fix.sh`

**תפקיד:** restart Backend + הרצת run-user-tickers-qa-api.sh — **חובה** אחרי שינוי בקוד.

**שימוש:**
```bash
bash scripts/verify-user-tickers-fix.sh
```

**מתועד ב:** TEAM_20_USER_TICKERS_PRE_QA_CHECKLIST, SERVERS_SCRIPTS_SSOT.

---

## 3. עדכון Checklist

- נהל: אחרי שינוי ב־me_tickers.py / user_tickers_service.py — **חובה** verify לפני הגשה.
- סקריפט מאוחד: verify-user-tickers-fix.sh.

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | USER_TICKERS_500_TO_422_VERIFICATION_EVIDENCE | 2026-01-31**
