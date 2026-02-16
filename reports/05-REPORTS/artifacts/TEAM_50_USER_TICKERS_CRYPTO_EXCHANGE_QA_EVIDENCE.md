# Team 50 — Evidence: User Tickers Crypto + Exchanges QA

**id:** TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE  
**from:** Team 50 (QA & Fidelity)  
**date:** 2026-02-14  
**מיקום:** documentation/05-REPORTS/artifacts/  
**מקור:** TEAM_10_TO_TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE, TEAM_30_TO_TEAM_50_USER_TICKERS_QA_REQUEST

---

## 1. משימות בדיקה (מנדט)

| בדיקה | חובה | פרמטרים | קריטריון הצלחה |
|-------|------|----------|-----------------|
| AAPL (מניה) | כן | symbol=AAPL, ticker_type=STOCK | 201/409 |
| BTC (קריפטו) | כן | symbol=BTC, ticker_type=CRYPTO, market=USD | 201/409 |
| TEVA.TA (TASE) | כן | symbol=TEVA.TA, ticker_type=STOCK | 201/409 |
| ANAU.MI (מילאנו) | אופציונלי | symbol=ANAU.MI, ticker_type=STOCK | 201/409 |
| Fake symbol | כן | symbol=ZZZZZZZFAKE999 | 422/400 |

---

## 2. סטטוס הרצה

### 2.1 API (2026-02-14 — איתחול מלא)

| בדיקה | תוצאה |
|-------|-------|
| Login | ✅ |
| GET /me/tickers | ✅ 200 |
| POST (fake) | ⚠️ 500 (צפוי 422) |
| POST (AAPL) | ✅ 201 |
| POST (BTC) | ⚠️ 500 |
| POST (TEVA.TA) | ⚠️ 500 |
| POST (ANAU.MI) | ⚠️ 500 |
| DELETE /me/tickers/{id} | ✅ 204 |

### 2.2 E2E

| פריט | תוצאה |
|------|-------|
| 1a, 1b, 2, 3, 5 | ✅ PASS |
| Item 4 (provider failure 422) | ❌ FAIL — התקבל 500 |

### 2.3 בדיקה ישירה של ספקים (test-providers-direct.py)

| Symbol | Yahoo | Alpha |
|--------|-------|-------|
| AAPL | ❌ | ✅ |
| BTC | ❌ | ✅ (תיקון volume עבד) |
| TEVA.TA, ANAU.MI | ❌ | ❌ |
| Fake | ❌ | ❌ |

**הערה:** POST fake/BTC/TEVA/ANAU עדיין 500 (צפוי 422 ל-fake). AAPL 201 עובד.

---

## 3. תיקוני Root Fix (Team 20 ACK)

- 500→422, Alpha volume, provider_mapping_data — יושמו.  
- דוח בדיקה חוזרת: TEAM_50_USER_TICKERS_ROOT_FIX_RERUN_REPORT.md

---

## 4. מסמכים קשורים

- `_COMMUNICATION/team_50/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE.md` — Evidence מלא
- `_COMMUNICATION/team_50/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_RUN_REPORT.md` — דוח הרצה
- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_QA_REPORT.md` — דוח ל-Team 10

---

**log_entry | TEAM_50 | USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE | 05-REPORTS | 2026-02-14**
