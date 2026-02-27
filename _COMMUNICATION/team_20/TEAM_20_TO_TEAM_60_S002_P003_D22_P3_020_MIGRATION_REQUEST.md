# Team 20 → Team 60 | דרישת מיגרציה p3_020 — D22 Tickers (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_60_S002_P003_D22_P3_020_MIGRATION_REQUEST  
**from:** Team 20 (Backend Implementation)  
**to:** Team 60 (DevOps & Platform)  
**cc:** Team 10, Team 50  
**date:** 2026-01-31  
**status:** ACKNOWLEDGED — TEAM_60_TO_TEAM_20_S002_P003_D22_P3_020_MIGRATION_RESPONSE_v1.0.0  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1) מטרה

דרישה רשמית להרצת **migration p3_020** — תנאי להשלמת D22 FAV (POST /tickers). ללא המיגרציה, המודל `api/models/tickers.py` נכשל ב־ProgrammingError (עמודת `status` חסרה).

---

## 2) רקע

| פריט | פרטים |
|------|--------|
| **בעיה** | POST /tickers מחזיר 500 |
| **סיבה** | `market_data.tickers` חסרה עמודת `status` — נוספת ב־p3_020 |
| **מקור** | `TEAM_50_TO_TEAM_20_S002_P003_D22_FAV_REVALIDATION_RESPONSE` — 6/7 עברו, POST נכשל |
| **תיקון Backend** | טיפול ב־ProgrammingError → 503 עם `detail: "Run: make migrate-p3-020"` |

---

## 3) דרישה מ-Team 60

### 3.1 הרצת המיגרציה

**פקודה:**
```bash
make migrate-p3-020
```

**קובץ:** `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql`  
**תוכן:**
- הוספת עמודת `status` ל־`market_data.tickers` (אם לא קיימת)
- יצירת טבלת `user_data.user_tickers`

**אידמפוטנטי:** המיגרציה בודקת `IF NOT EXISTS` — הרצה חוזרת בטוחה.

### 3.2 אופציונלי — אינטגרציה ב־fix-env-after-restart.sh

כדי שסביבת FAV תהיה מוכנה אחרי restart מחשב — מומלץ להוסיף הרצת `make migrate-p3-020` לתוך `scripts/fix-env-after-restart.sh` (לפני Restart Backend).  
**החלטה:** Team 60.

---

## 4) אימות אחרי המיגרציה

1. הרצת `scripts/fix-env-after-restart.sh` (או restart Backend)
2. הרצת `scripts/run-tickers-d22-qa-api.sh` — כל 7 הבדיקות אמורות לעבור
3. POST /tickers → 201 + id בתשובה

---

## 5) רפרנסים

- `TEAM_50_TO_TEAM_20_S002_P003_D22_FAV_REVALIDATION_RESPONSE.md`
- `documentation/reports/05-REPORTS/artifacts/USER_TICKERS_QA_DB_CHECKLIST.md`
- `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql`

---

---

## 6) תולדה

**TEAM_60_TO_TEAM_20_S002_P003_D22_P3_020_MIGRATION_RESPONSE_v1.0.0** — Team 60 אישר ביצוע: migration קיים; נוסף ל־fix-env-after-restart.sh. Team 20 / Team 50 יכולים לאמת FAV.

---

**log_entry | TEAM_20 | TO_TEAM_60 | S002_P003_D22_P3_020_MIGRATION_REQUEST | ACKNOWLEDGED | 2026-02-26**
