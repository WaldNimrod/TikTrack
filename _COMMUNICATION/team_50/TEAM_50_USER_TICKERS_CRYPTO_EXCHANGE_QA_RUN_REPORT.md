# Team 50 — דוח הרצת בדיקות: User Tickers Crypto + Exchanges

**From:** Team 50 (QA & Fidelity)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-14  
**Subject:** תוצרות הרצה — API + E2E  
**מקור:** TEAM_10_TO_TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE

---

## 1. תוצרות הרצה (2026-02-14 — איתחול מלא)

### 1.1 סיכום הרצה

| בדיקה | פקודה | תוצאה |
|-------|--------|--------|
| **API Crypto QA** | `bash scripts/run-user-tickers-qa-api.sh` | ⚠️ חלקי — Login OK, GET 200, fake 422; AAPL → 422 (exit 1) |
| **E2E User Tickers** | `cd tests && node user-tickers-qa.e2e.test.js` | ✅ כל 6 פריטים PASS |
| **Backend health** | `curl http://127.0.0.1:8082/health` | 200 |

### 1.2 פלט API (מציאותי)

```
=== User Tickers QA — API Verification (Crypto + Exchanges) ===
Backend: http://127.0.0.1:8082
✅ Login OK
✅ GET /me/tickers → 200
✅ POST (fake) → 422
❌ POST (AAPL) → 422 — חובה
```

### 1.3 הסבר AAPL → 422

`POST /me/tickers?symbol=AAPL&ticker_type=STOCK` מחזיר 422.  
**הודעת שגיאה (אחרי תיקון Team 20):**
`"Provider could not fetch data for this symbol. Check ALPHA_VANTAGE_API_KEY in api/.env and Yahoo availability. Ticker not created."`

**סיבה:** `_live_data_check` (Yahoo → Alpha) נכשל — `ALPHA_VANTAGE_API_KEY` לא מוגדר או Backend לא הופעל מחדש.

---

## 2. מה מצופה בהרצה מוצלחת (לאחר הגדרת API key)

### API

```
✅ Login OK
✅ GET /me/tickers → 200
✅ POST (fake) → 422
✅ POST (AAPL מניה) → 201
✅ POST (BTC קריפטו) → 201
✅ POST (TEVA.TA TASE) → 201
✅ POST (ANAU.MI) → 201 (אופציונלי)
=== API Verification Done ===
```

### E2E

```
✅ [PASS] Item 1a, 1b, 2, 3, 4, 5
```

---

## 3. הוראות הרצה חוזרת

```bash
# 1. הגדר ALPHA_VANTAGE_API_KEY ב־api/.env
# 2. הפעל מחדש Backend
# 3. הרץ בדיקות:
bash scripts/run-user-tickers-qa-api.sh
cd tests && node user-tickers-qa.e2e.test.js
```

---

## 4. קבצי Evidence + דוחות

| קובץ | מיקום |
|------|-------|
| TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE | _COMMUNICATION/team_50/ |
| TEAM_50_TO_TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_QA_REPORT | _COMMUNICATION/team_50/ |
| TEAM_50_TO_TEAM_20_FIX_REQUEST_LIVE_DATA_CHECK_POST_TICKERS | _COMMUNICATION/team_50/ |
| TEAM_20_TO_TEAM_50_FIX_REQUEST_LIVE_DATA_CHECK_ACK | _COMMUNICATION/team_20/ |

---

## 5. סיכום

**סטטוס:** ⚠️ **חלקי** — E2E PASS מלא; API חסום על POST עד הגדרת `ALPHA_VANTAGE_API_KEY`.  
**תיקון Team 20:** ACK התקבל — הודעת שגיאה ברורה, תיעוד .env.example.  
**פעולה נדרשת:** הגדרת `ALPHA_VANTAGE_API_KEY` ב־api/.env → הפעלה מחדש של Backend → הרצה חוזרת של סקריפט API.

---

**log_entry | TEAM_50 | USER_TICKERS_CRYPTO_QA_RUN_REPORT | 2026-02-14**
