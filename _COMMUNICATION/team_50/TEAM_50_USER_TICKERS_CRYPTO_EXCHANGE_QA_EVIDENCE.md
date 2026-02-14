# Team 50 — Evidence: User Tickers Crypto + Exchanges QA

**id:** TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE  
**from:** Team 50 (QA & Fidelity)  
**date:** 2026-02-14  
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

## 2. סקריפט API

**קובץ:** `scripts/run-user-tickers-qa-api.sh`  
**הרצה:** `bash scripts/run-user-tickers-qa-api.sh`  
**דרישות:** Backend 8082, משתמש TikTrackAdmin/4181

---

## 3. סטטוס הרצה (2026-02-14 — איתחול מלא)

### 3.1 תוצאות API

| בדיקה | תוצאה | הערות |
|-------|-------|-------|
| Login | ✅ | access_token התקבל |
| GET /me/tickers | ✅ 200 | |
| POST (fake) | ⚠️ 500 | צפוי 422 — provider failure |
| POST (AAPL) | ✅ 201 | יצירה + הוספה עובדת |
| POST (BTC) | ⚠️ 500 | |
| POST (TEVA.TA) | ⚠️ 500 | |
| POST (ANAU.MI) | ⚠️ 500 | |
| DELETE /me/tickers/{id} | ✅ 204 | |

### 3.2 תוצאות E2E

| פריט | תוצאה |
|------|-------|
| Item 1a, 1b, 2, 3, 5 | ✅ PASS |
| Item 4: provider failure → 422 | ❌ FAIL — התקבל 500 |

---

## 4. תיקון Team 20 (ACK)

**מסמך:** TEAM_20_TO_TEAM_50_FIX_REQUEST_LIVE_DATA_CHECK_ACK

- **א'** — api/.env.example: תיעוד — המפתח נדרש ל-User Tickers כש-Yahoo נכשל
- **ב'** — user_tickers_service.py: הודעת 422 ברורה עם hint ל-ALPHA_VANTAGE_API_KEY
- **ג'** — Bypass ב-dev: לא יושם (נדרשת הסכמת Team 10 / Bridge)

**תנאי להצלחת POST:** הגדרת `ALPHA_VANTAGE_API_KEY` ב־api/.env + הפעלה מחדש של Backend.

---

## 5. קריטריון סגירה (מנדט)

- [ ] לפחות 3 טיקרים: 2 מניות + 1 קריפטו
- [ ] TEVA.TA — fetch חיים מוצלח
- [x] Evidence מעודכן
- [ ] דוח מלא ל-Team 10 (במקביל)

---

## 6. מסמכים קשורים

| מסמך | מיקום |
|------|-------|
| TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_RUN_REPORT | _COMMUNICATION/team_50/ |
| TEAM_50_TO_TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_QA_REPORT | _COMMUNICATION/team_50/ |
| TEAM_50_TO_TEAM_20_FIX_REQUEST_LIVE_DATA_CHECK_POST_TICKERS | _COMMUNICATION/team_50/ |
| TEAM_20_TO_TEAM_50_FIX_REQUEST_LIVE_DATA_CHECK_ACK | _COMMUNICATION/team_20/ |

---

**log_entry | TEAM_50 | USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE | 2026-02-14**
