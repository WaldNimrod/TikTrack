# Team 50 → Team 20 | אימות מחדש D22 FAV (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_20_S002_P003_D22_FAV_REVALIDATION_RESPONSE  
**in_response_to:** TEAM_20_TO_TEAM_50_S002_P003_D22_API_REMEDIATION_RESPONSE  
**from:** Team 50 (QA / FAV)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 10  
**date:** 2026-01-31  
**status:** PARTIAL_PASS — filter תוקן; POST עדיין 500  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1) מטרה

דיווח תוצאות אימות מחדש לאחר תיקוני Team 20 (REMEDIATION_RESPONSE §4). **אתחול:** הופעל `scripts/fix-env-after-restart.sh` (Postgres + עצירה/הפעלה של Backend); לאחר מכן הופעל `scripts/run-tickers-d22-qa-api.sh` מול Backend פעיל.

---

## 2) תוצאות ריצה

| שלב | תוצאה | הערה |
|-----|--------|------|
| Admin Login | ✅ 200 | |
| GET /tickers/summary | ✅ 200 | |
| GET /tickers | ✅ 200 | |
| GET /tickers?ticker_type=STOCK | ✅ **200** | **תיקון תקף** — לא עוד 500 |
| GET /tickers?is_active=true | ✅ 200 | |
| GET /tickers?search=A | ✅ 200 | |
| POST /tickers | ❌ **500** | עדיין נכשל — לא 201, לא id |

**סיכום:** 6/7 עברו. POST /tickers מחזיר 500.

---

## 3) פרטי כשל POST /tickers

- **בקשה:** `POST /api/v1/tickers`  
  Body: `{"symbol":"QA_D22_TEST_001","ticker_type":"STOCK","is_active":false}`  
  Header: `Authorization: Bearer <token>` (Login תקין).

- **תשובה:** HTTP 500  
  Body: `{"detail":"Failed to create ticker","error_code":"SERVER_ERROR"}`  

- **הערה:** אין stack trace או פרט שגיאה ב־response. נדרש: לוג Backend בעת הקריאה או הרחבת ה־error detail (למשל constraint name / field) כדי לאבחן.

---

## 4) פעולה מצופה

1. **Team 20:** לבדוק לוגי Backend בעת `POST /tickers` (לאחר הרצת הסקריפט או קריאה ידנית); לוודא ש־Backend רץ עם הקוד המעודכן מ־REMEDIATION (כולל `IntegrityError` handling ו־409). אם השגיאה אינה IntegrityError — לטפל בהתאם ו/או להחזיר 4xx עם פרט ברור.
2. **Team 50:** יבצע ריצת FAV חוזרת לאחר עדכון מ־Team 20 וידווח שוב.

---

## 5) רפרנסים

- _COMMUNICATION/team_20/TEAM_20_TO_TEAM_50_S002_P003_D22_API_REMEDIATION_RESPONSE.md
- _COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P003_API_CONTRACT_REQUEST.md
- `scripts/run-tickers-d22-qa-api.sh`

---

**log_entry | TEAM_50 | TO_TEAM_20 | S002_P003_D22_FAV_REVALIDATION | PARTIAL_PASS | 2026-01-31**
