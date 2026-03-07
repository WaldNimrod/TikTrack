# Team 60 → Team 10 | ולידציית טיקרים — Restart + אימות (השלמה)

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_10_TICKER_VALIDATION_RESTART_VERIFY_COMPLETION  
**from:** Team 60 (Infrastructure & Environment)  
**to:** Team 10 (Gateway Orchestration)  
**cc:** Team 50  
**date:** 2026-03-07  
**status:** PASS  
**in_response_to:** TEAM_10_TO_TEAM_60_TICKER_VALIDATION_RESTART_AND_VERIFY_MANDATE  
**מקור:** TEAM_50_TO_TEAM_10_TICKER_VALIDATION_RE_QA_REPORT_v1.0.0.md  

---

## 1) סיכום

- **status:** **PASS** — התיקון פתר. POST /tickers עם סמל לא תקף מחזיר **422** אחרי Restart וטעינת api/.env לסביבה.
- **שינוי נוסף:** עדכון `scripts/start-backend.sh` — טעינת `api/.env` ל־shell (source) לפני הרצת uvicorn, כדי ש־`os.environ.get("SKIP_LIVE_DATA_CHECK")` בקוד יקבל את הערך מ־.env.

---

## 2) שלב 1 — תיקון ואימות

| # | פעולה | תוצאה |
|---|--------|--------|
| 1 | אימות api/.env | `RUN_LIVE_SYMBOL_VALIDATION=true`, `SKIP_LIVE_DATA_CHECK=false` (מאומת) |
| 2 | Restart Backend | בוצע: `scripts/stop-backend.sh` → `scripts/start-backend.sh` |
| 3 | וידוא Backend עלה | GET http://127.0.0.1:8082/health → **200** |

**הערה:** ה-backend קורא ל־`os.environ.get("SKIP_LIVE_DATA_CHECK")` ב־`canonical_ticker_service`; pydantic קורא רק ל־Settings מ־.env. כדי שה־env יהיה זמין גם ל־os.environ, נוספה ב־`start-backend.sh` טעינת `.env` (source) לפני הרצת uvicorn.

---

## 3) שלב 2 — בדיקה שהתיקון פתר

| # | בדיקה | תוצאה |
|---|--------|--------|
| 1 | POST /tickers עם `{"symbol":"INVALID999RESTART",...}` (Admin token) | **422** — `"Provider could not fetch data for this symbol. Ticker not created..."`, `error_code: TICKER_SYMBOL_INVALID` |
| 2 | (אופציונלי) סמל INVALID999E2E | אם הטיקר כבר קיים ב-DB מהרצה קודמת — ייתכן 201 (idempotent). לבדיקת ולידציה יש להשתמש בסמל חדש (למשל INVALID999RESTART). |

---

## 4) Evidence (snippet)

**ערכי env (ממוסכים):**  
- `RUN_LIVE_SYMBOL_VALIDATION=true`  
- `SKIP_LIVE_DATA_CHECK=false`

**תאריך/שעה Restart:** 2026-03-07 (לאחר עדכון start-backend.sh).

**תוצאת בדיקה — POST /tickers (סמל לא תקף):**
- **Request:** POST /api/v1/tickers, body `{"symbol":"INVALID999RESTART","ticker_type":"STOCK","is_active":false}`, Authorization: Bearer &lt;admin token&gt;
- **Response:** HTTP **422**
- **Body:** `{"detail":"Provider could not fetch data for this symbol. Ticker not created. Verify symbol exists and try again.","message":"...","error_code":"TICKER_SYMBOL_INVALID"}`

---

## 5) Acceptance Criteria

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | Restart בוצע; env אומת | מתקיים; בנוסף: .env נטען לסביבה ב־start-backend.sh |
| 2 | בדיקת POST /tickers (סמל לא תקף) הורצה | INVALID999RESTART → 422 |
| 3 | דוח ל־Team 10 עם status ו־Evidence | דוח זה — status PASS |

---

**log_entry | TEAM_60 | TICKER_VALIDATION_RESTART_VERIFY_COMPLETION | TO_TEAM_10 | PASS | 2026-03-07**
