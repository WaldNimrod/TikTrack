# Team 20 → Team 50 | שורש הבעיה POST /tickers 500 — תיקון (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_50_S002_P003_D22_POST_500_ROOT_CAUSE_RESPONSE  
**in_response_to:** TEAM_50_TO_TEAM_20_S002_P003_D22_FAV_REVALIDATION_RESPONSE  
**from:** Team 20 (Backend Implementation)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 10, Team 60  
**date:** 2026-01-31  
**historical_record:** true  
**status:** REMEDIATION_COMPLETE  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1) שורש הבעיה

**סיבה:** המודל `api/models/tickers.py` דורש עמודת `status` ב־`market_data.tickers`. עמודה זו נוספת ב־**migration p3_020** (`scripts/migrations/p3_020_user_tickers_and_ticker_status.sql`).  
כש־p3_020 **לא הורצה**, ה־INSERT/refresh נכשל עם `ProgrammingError` (column does not exist) — והוחזר 500 גנרי.

---

## 2) תיקונים שבוצעו (Team 20)

| # | תיקון | קובץ |
|---|-------|------|
| 1 | טיפול ב־`ProgrammingError` — כאשר עמודה חסרה → **503** עם הודעת פעולה: `market_data.tickers schema outdated. Run: make migrate-p3-020` | `api/services/tickers_service.py` |
| 2 | הודעת דרישה ל־**Team 60** (אחראי מיגרציות): `TEAM_20_TO_TEAM_60_S002_P003_D22_P3_020_MIGRATION_REQUEST.md` | `_COMMUNICATION/team_20/` |

---

## 3) הוראות ל־Team 50

1. **תלות ב־Team 60:** הרצת `make migrate-p3-020` נמצאת באחריות Team 60. דרישה פורסמה ב־`TEAM_20_TO_TEAM_60_S002_P003_D22_P3_020_MIGRATION_REQUEST.md`.
2. **לפני FAV:** להריץ `scripts/fix-env-after-restart.sh`; לוודא ש־Team 60 הריץ את המיגרציה בסביבה.
3. **אימות:** להריץ `scripts/run-tickers-d22-qa-api.sh` — כל 7 הבדיקות אמורות לעבור אחרי המיגרציה.
4. **אם POST מחזיר 503:** התשובה תכלול `detail: "market_data.tickers schema outdated. Run: make migrate-p3-020"` — לצורך התיאום עם Team 60 להרצת המיגרציה.

---

## 4) רפרנסים

- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P003_D22_FAV_REVALIDATION_RESPONSE.md`
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_S002_P003_D22_P3_020_MIGRATION_REQUEST.md` (דרישה ל־Team 60)
- `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql`
- `documentation/reports/05-REPORTS/artifacts/USER_TICKERS_QA_DB_CHECKLIST.md`

---

**log_entry | TEAM_20 | TO_TEAM_50 | D22_POST_500_ROOT_CAUSE | REMEDIATION_COMPLETE | 2026-01-31**
