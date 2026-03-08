# Team 10 → Team 60 | ולידציית טיקרים — Restart + אימות שהתיקון פתר

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_TICKER_VALIDATION_RESTART_AND_VERIFY_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 60 (Infrastructure & Environment)  
**date:** 2026-03-07  
**status:** MANDATE_ACTIVE  
**מקור:** _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_TICKER_VALIDATION_RE_QA_REPORT_v1.0.0.md  

---

## רקע

Re-QA ולידציית טיקרים נכשל: POST /tickers עם סמל לא תקף (INVALID999E2E) החזיר **201** במקום **422**.  
**סיבה סבירה:** Backend לא הופעל מחדש אחרי עדכון api/.env — התהליך רץ עם env ישן.

---

## משימה (3 שלבים)

### שלב 1 — תיקון

| # | פעולה | פרטים |
|---|--------|--------|
| 1 | אימות api/.env | `RUN_LIVE_SYMBOL_VALIDATION=true`, `SKIP_LIVE_DATA_CHECK=false` |
| 2 | Restart Backend | `scripts/stop-backend.sh` → `scripts/start-backend.sh` (או דומה) |
| 3 | וידוא Backend עלה | GET http://127.0.0.1:8082/health או דומה → 200 |

### שלב 2 — בדיקה שהתיקון פתר

| # | בדיקה | תוצאה מצופה |
|---|--------|-------------|
| 1 | POST /tickers עם body `{"symbol":"INVALID999E2E",...}` (Admin token) | **422** |
| 2 | (אופציונלי) PUT /tickers/{id} עם שינוי סמל ל־INVALID999PUT | **422** |

**פקודה מומלצת:** `scripts/run-tickers-d22-qa-api.sh` — או קריאה ידנית ל־POST /tickers עם סמל לא תקף.

### שלב 3 — משוב ל־Team 10

| תוצאה | פעולה |
|--------|--------|
| **PASS** (422 התקבל) | דוח: `TEAM_60_TO_TEAM_10_TICKER_VALIDATION_RESTART_VERIFY_COMPLETION.md` — status: PASS; Evidence (HTTP code, response snippet). |
| **FAIL** (201/200 התקבל) | דוח: `TEAM_60_TO_TEAM_10_TICKER_VALIDATION_RESTART_VERIFY_COMPLETION.md` — status: FAIL; Evidence; המלצה להעברת ל־Team 20 (בדיקת לוגיקה). |

---

## Acceptance Criteria

| # | קריטריון |
|---|-----------|
| 1 | Restart בוצע; env אומת |
| 2 | בדיקת POST /tickers (INVALID999E2E) הורצה |
| 3 | דוח הוחזר ל־Team 10 עם status (PASS/FAIL) ו־Evidence |

---

## תוצר מצופה

**נתיב:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_TICKER_VALIDATION_RESTART_VERIFY_COMPLETION.md`

**תוכן מינימלי:**
- status: PASS | FAIL
- env values (ממוסכים)
- תאריך/שעה Restart
- תוצאת בדיקה: HTTP code ל־POST /tickers (INVALID999E2E)
- Evidence (snippet או path ל־log)

---

**log_entry | TEAM_10 | TICKER_VALIDATION_RESTART_VERIFY_MANDATE | TO_TEAM_60 | 2026-03-07**
