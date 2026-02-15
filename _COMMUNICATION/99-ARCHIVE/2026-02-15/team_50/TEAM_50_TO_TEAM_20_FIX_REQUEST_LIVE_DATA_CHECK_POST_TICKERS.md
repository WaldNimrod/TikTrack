# Team 50 → Team 20: דרישת תיקון — POST /me/tickers נכשל (live data check)

**From:** Team 50 (QA & Fidelity)  
**To:** Team 20 (Backend)  
**Date:** 2026-02-14  
**חומרה:** High — חוסם סגירת User Tickers Crypto + Exchanges QA  
**מקור:** TEAM_10_TO_TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE

---

## 1. השגיאה המדויקת

**תגובת API (422):**
```json
{"detail":"Provider could not fetch data for this symbol. Ticker not created.","error_code":"VALIDATION_INVALID_FORMAT"}
```

**בקשה שנכשלה:**
```
POST /api/v1/me/tickers?symbol=AAPL&ticker_type=STOCK
Authorization: Bearer <access_token>
Content-Type: application/json
```

**תוצאה:** HTTP 422 — טיקר לא נוצר.

---

## 2. שחזור (Reproduction)

```bash
# 1. Login
TOKEN=$(curl -s -X POST "http://127.0.0.1:8082/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

# 2. POST ticker (נכשל)
curl -s -X POST "http://127.0.0.1:8082/api/v1/me/tickers?symbol=AAPL&ticker_type=STOCK" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"
# → 422 + JSON לעיל
```

**תנאים:** Backend 8082 פעיל, DB פעיל, Login מצליח.  
**מושפע:** AAPL, BTC, TEVA.TA, ANAU.MI — כל טיקר חדש (לא קיים במערכת).

---

## 3. מיקום בקוד

| קובץ | שורות | פונקציה |
|------|-------|---------|
| `api/services/user_tickers_service.py` | 53–95 | `_live_data_check` |
| `api/services/user_tickers_service.py` | 196–201 | `add_ticker` — קריאה ל־`_live_data_check` |

**לוגיקה:** לפני יצירת טיקר חדש, `_live_data_check` בודק Yahoo → Alpha. אם שניהם נכשלים → 422.

---

## 4. סיבת הכשל (משפט אחד)

YahooProvider ו־AlphaProvider ב־LIVE mode לא מחזירים מחיר תקף — ככל הנראה `ALPHA_VANTAGE_API_KEY` לא מוגדר ו/או Yahoo rate-limited / רשת.

---

## 5. תיקון נדרש

**אפשרות א' (מומלצת לתשתית):** לוודא ש־`ALPHA_VANTAGE_API_KEY` מוגדר ב־`api/.env` בסביבת dev/QA, ולהפעיל מחדש את ה־Backend.

**אפשרות ב' (שיפור UX):** להוסיף הודעת שגיאה מפורטת כש־live check נכשל, למשל:  
`"Provider could not fetch data. Check ALPHA_VANTAGE_API_KEY and Yahoo availability."`  
(כפי שנעשה ב־`history_backfill_service.py` שורה 183.)

**אפשרות ג' (ארכיטקטונית):** אם יש אופציה ל־REPLAY/FIXTURES בסביבת QA — לאפשר bypass ל־live check ב־dev (בהסכמת Team 10 / Bridge).

**נדרש:** לפחות אחת מהאפשרויות — כך ש־POST AAPL (ובהמשך BTC, TEVA.TA) יחזיר 201 או 409.

---

## 6. אימות אחרי תיקון

```bash
bash scripts/run-user-tickers-qa-api.sh
# צפוי: ✅ POST (AAPL מניה) → 201 או 409
```

---

## 7. Evidence

- TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE.md  
- TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_RUN_REPORT.md

---

**log_entry | TEAM_50 | TO_TEAM_20 | FIX_REQUEST_LIVE_DATA_CHECK_POST_TICKERS | 2026-02-14**
