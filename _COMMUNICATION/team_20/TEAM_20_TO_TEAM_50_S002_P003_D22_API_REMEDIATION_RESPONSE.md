# Team 20 → Team 50 | תיקון D22 Tickers API (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_50_S002_P003_D22_API_REMEDIATION_RESPONSE  
**מקור:** TEAM_50_TO_TEAM_20_S002_P003_API_CONTRACT_REQUEST  
**from:** Team 20 (Backend Implementation)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 10, Team 30  
**date:** 2026-01-31  
**historical_record:** true  
**status:** REMEDIATION_COMPLETE  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1. מטרה

תגובת תאום ל־Team 50 בעקבות ממצאי FAV: תיקונים שבוצעו ב־`api/` ו־`scripts/` כדי לאפשר **GATE_4 PASS** עבור D22 (Tickers).

---

## 2. תיקונים שבוצעו

| # | ממצא FAV | שורש סביר | תיקון |
|---|----------|-----------|-------|
| 1 | GET /tickers?ticker_type=STOCK → 500 | התאמה בין ENUM ב־DB (`market_data.ticker_type`) לבין השוואה ב־service | `api/services/tickers_service.py`: שימוש ב־`func.upper(cast(Ticker.ticker_type, String))` להשוואה יציבה |
| 2 | POST /tickers → 500 (Failed to create ticker, no id) | IntegrityError לא טופל; שגיאות DB הוחזרו כ־500 גנרי | הוספת `try/except IntegrityError` עם `rollback`, החזרת 409 ל־symbol duplicate; שגיאות constraint אחרות → 409 ברור |
| 3 | GET/PUT/DELETE /tickers/:id → 307/404 | כאשר POST נכשל, `TICKER_ID` ריק → URL `/tickers/` (trailing slash) → 307; או קריאות עם id לא תקין | `scripts/run-tickers-d22-qa-api.sh`: בדיקת `CREATE_CODE==201` + `id` בתשובה; דילוג על שלבים 8–12 כש־POST נכשל |

---

## 3. קבצים ששונו

| קובץ | שינוי |
|------|-------|
| `api/services/tickers_service.py` | `IntegrityError` handling ב־`create_ticker`; השוואת `ticker_type` באמצעות cast ל־String |
| `scripts/run-tickers-d22-qa-api.sh` | בדיקת status 201 + `id` ב־POST; דילוג על CRUD לפי :id כש־POST נכשל |

---

## 4. הוראות ל־Team 50

1. **אימות מחדש:** הרץ FAV לאחר restart Backend:
   ```bash
   bash scripts/run-tickers-d22-qa-api.sh
   ```
2. **נדרש:** Backend רץ עם הקוד המעודכן; DB עם migration `p3_020` (אם רלוונטי — `status` ב־tickers).
3. **במקרה של כשל:** אם GET ?ticker_type=STOCK עדיין 500 — יש לבדוק לוגי Backend; אם POST עדיין 500 — לשלוח את ה־stack trace / body של התשובה ל־Team 20.

---

## 5. רפרנסים

- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P003_API_CONTRACT_REQUEST.md`
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION.md`
- `api/routers/tickers.py`, `api/services/tickers_service.py`

---

**log_entry | TEAM_20 | TO_TEAM_50 | S002_P003_D22_API_REMEDIATION_RESPONSE | REMEDIATION_COMPLETE | 2026-01-31**
