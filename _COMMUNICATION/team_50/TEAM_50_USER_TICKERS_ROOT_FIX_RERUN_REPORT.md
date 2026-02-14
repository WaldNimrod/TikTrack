# Team 50 — דוח בדיקה חוזרת: User Tickers Root Fix

**From:** Team 50 (QA & Fidelity)  
**To:** Team 10 (The Gateway), Team 20 (Backend)  
**Date:** 2026-02-14  
**מקור:** TEAM_10_USER_TICKERS_FINAL_TEST_AND_ROOT_FIX_PLAN, TEAM_20_TO_TEAM_10_USER_TICKERS_ROOT_FIX_ACK  
**מנדט:** הרצת בדיקות חוזרות — POST מזויף 422, POST BTC ללא crash, DELETE

---

## 1. תוצאות בדיקה חוזרת (2026-02-14 — איתחול מלא)

### 1.1 API — `scripts/run-user-tickers-qa-api.sh`

| בדיקה | תוצאה | מצופה |
|-------|-------|-------|
| Login | ✅ | — |
| GET /me/tickers | ✅ 200 | — |
| POST (fake) | ⚠️ 500 | 422 |
| POST (AAPL) | ✅ 201 | 201/409 |
| POST (BTC) | ⚠️ 500 | 201/409 |
| POST (TEVA.TA) | ⚠️ 500 | 201/409 |
| POST (ANAU.MI) | ⚠️ 500 | 201/409 |

### 1.2 DELETE — בדיקה מפורשת

| בדיקה | תוצאה |
|-------|-------|
| DELETE /me/tickers/{ticker_id} | ✅ 204 |

### 1.3 E2E — `tests/user-tickers-qa.e2e.test.js`

| פריט | תוצאה |
|------|-------|
| 1a, 1b, 2, 3, 5 | ✅ PASS |
| Item 4 (provider failure → 422) | ❌ FAIL — התקבל 500 |

### 1.4 בדיקה ישירה של ספקים — `scripts/test-providers-direct.py`

| Symbol | Type | Yahoo | Alpha | הערות |
|--------|------|-------|-------|-------|
| AAPL | STOCK | ❌ | ✅ | Alpha price=255.78 |
| BTC | CRYPTO | ❌ | ✅ | **Alpha price=68944** — תיקון volume עבד |
| TEVA.TA | STOCK | ❌ | ❌ | — |
| ANAU.MI | STOCK | ❌ | ❌ | — |
| ZZZZZZZFAKE999 | STOCK | ❌ | ❌ | כמצופה |

**מסקנה מהסקריפט:** תיקון Alpha volume (BTC) **עובד** — הסקריפט טוען קוד עדכני.  
**מסקנה מ-API:** POST fake + POST BTC עדיין 500 — **Backend כנראה רץ עם קוד ישן** (לא הופעל מחדש).

---

## 2. השוואה לתיקוני Root Fix

| # | תיקון | Evidence בסקריפט | Evidence ב-API |
|---|--------|-------------------|----------------|
| 1 | 500 → 422 | — | ❌ עדיין 500 |
| 2 | Alpha volume | ✅ BTC עובד | ❌ 500 (Backend ישן?) |
| 3 | Alpha DIGITAL_CURRENCY_DAILY | ✅ | — |
| 4 | provider_mapping_data | — | — |
| 5 | Yahoo BTC-USD | — | — |
| 6 | Yahoo None | ❌ עדיין None | — |

---

## 3. המלצות

1. **הפעלת Backend מחדש** — לוודא שה-backend טוען את הקוד המעודכן (כולל try/except 422, volume fix).
2. **הרצה חוזרת** — לאחר restart:
   - POST fake → צפוי **422**
   - POST BTC → צפוי **201** או 409 (Alpha מחזיר נתונים)
3. **E2E Item 4** — יעבור כאשר POST fake יחזיר 422.

---

## 4. Evidence

| מסמך | מיקום |
|------|-------|
| TEAM_20_TO_TEAM_10_USER_TICKERS_ROOT_FIX_ACK | _COMMUNICATION/team_20/ |
| TEAM_10_USER_TICKERS_FINAL_TEST_AND_ROOT_FIX_PLAN | _COMMUNICATION/team_10/ |
| documentation/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE | 05-REPORTS/artifacts/ |

---

**log_entry | TEAM_50 | USER_TICKERS_ROOT_FIX_RERUN_REPORT | 2026-02-14**
