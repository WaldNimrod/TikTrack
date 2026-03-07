# Team 10 → Team 50 | ולידציית טיקרים — Re-QA לאחר תיקוני צוותים

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_TICKER_VALIDATION_RE_QA_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-03-07  
**status:** MANDATE_ACTIVE  
**מקור:** _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_TICKER_VALIDATION_POST_FIX_QA_REPORT_v1.0.0.md  
**תנאי מקדים:** Team 20 (הסרת קוד מת) + Team 60 (env verification + restart) — להשלים לפני Re-QA  

---

## היקף (Team 50 — QA)

הרצת **Re-QA מלא** לולידציית טיקרים **אחרי** ש־Team 20 ו־Team 60 השלימו את משימותיהם.  
**חשוב:** Team 50 **לא** מבצע שינויים בקוד — רק בדיקות ודיווח.

---

## תנאי הרצה (חובה)

| # | תנאי | אימות |
|---|-------|--------|
| 1 | Team 20 השלים | קיים `TEAM_20_TO_TEAM_10_TICKER_VALIDATION_DEAD_CODE_REMOVAL_COMPLETION.md` |
| 2 | Team 60 השלים | קיים `TEAM_60_TO_TEAM_10_TICKER_VALIDATION_ENV_VERIFICATION_COMPLETION.md` |
| 3 | Backend + Frontend רצים | `http://127.0.0.1:8082`, `http://127.0.0.1:8080` |
| 4 | env תקין | `RUN_LIVE_SYMBOL_VALIDATION=true`, `SKIP_LIVE_DATA_CHECK=false` (אומת על ידי Team 60) |

---

## בדיקות נדרשות

### 5.1 API — User Tickers (`scripts/run-user-tickers-qa-api.sh`)

| בדיקה | תוצאה מצופה |
|-------|-------------|
| POST /me/tickers (סמל בדוי, למשל ZZZZZZZFAKE999) | **422** |
| POST /me/tickers (AAPL או סמל תקף אחר) | **201** או **409** (אם כבר ברשימה) |

### 5.2 API — D22 Tickers (`scripts/run-tickers-d22-qa-api.sh`)

| בדיקה | תוצאה מצופה |
|-------|-------------|
| POST /tickers (סמל לא תקף, למשל INVALID999E2E או QA_D22_$$) | **422** |
| POST /tickers (AAPL) | **201** |

### 5.3 API — עריכת טיקר

| בדיקה | תוצאה מצופה |
|-------|-------------|
| PUT /tickers/{id} עם שינוי סמל לערך לא תקף | **422** |

### 5.4 E2E (מומלץ — אם הזמן מאפשר)

| סקריפט | תיאור |
|--------|--------|
| `tests/gate3-batch3-e2e.test.js` | BF-G7-008 — סמל לא תקף → שגיאה ב־UI |
| `tests/g7-26bf-deep-e2e.test.js` | ולידציית סמל |
| `tests/tickers-d22-e2e.test.js` | D22 מלא |
| `tests/user-tickers-qa.e2e.test.js` | הטיקרים שלי |

---

## קריטריונים להצלחה (מתוך הדוח המקורי)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | POST /tickers עם סמל לא תקף → **422** | חובה |
| 2 | POST /tickers עם סמל תקף (AAPL) → **201** | חובה |
| 3 | POST /me/tickers?symbol=INVALID999 → **422** | חובה (כבר עבר בעבר) |
| 4 | PUT /tickers/{id} עם שינוי סמל לא תקף → **422** | חובה |
| 5 | env: RUN_LIVE_SYMBOL_VALIDATION=true, SKIP_LIVE_DATA_CHECK=false | אומת על ידי Team 60 |

---

## תוצר מצופה

- **דוח Re-QA:** `TEAM_50_TO_TEAM_10_TICKER_VALIDATION_RE_QA_REPORT_v1.0.0.md`
- **תוכן:** טבלת בדיקות, תוצאה (PASS/FAIL) לכל שורה, Evidence (לוגים/צילומי מסך אם רלוונטי).
- **במקרה FAIL:** רשימת ממצאים חוסמים; הפניה ל־Team 20/60 אם הבעיה ב־env או קוד.

---

## הנחיה — חריגת משילות

לפי הדוח: Team 50 **לא** יבצע שינויים בקוד. בעתיד — דרישת תיקון (`TEAM_50_TO_TEAM_[N]_FIX_REQUEST_*`) בלבד.

---

**log_entry | TEAM_10 | TICKER_VALIDATION_RE_QA_MANDATE | TO_TEAM_50 | 2026-03-07**
