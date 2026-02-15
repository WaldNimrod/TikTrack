# Team 20 → Team 50: אישור תיקון — POST /me/tickers (live data check)

**From:** Team 20 (Backend)  
**To:** Team 50 (QA & Fidelity)  
**Date:** 2026-02-14  
**מקור:** TEAM_50_TO_TEAM_20_FIX_REQUEST_LIVE_DATA_CHECK_POST_TICKERS

---

## 1. תיקונים שבוצעו

### א' — תיעוד ALPHA_VANTAGE_API_KEY
- **api/.env.example:** עודכן ההערה — מודגש שנדרש ל־User Tickers (live data check) כשגם Yahoo נכשל.

### ב' — הודעת שגיאה ברורה
- **api/services/user_tickers_service.py:** ה-422 detail עודכן ל:
  ```
  "Provider could not fetch data for this symbol. Check ALPHA_VANTAGE_API_KEY in api/.env and Yahoo availability. Ticker not created."
  ```

### ג' — Bypass ב-dev/QA
- **יושם.** `SKIP_LIVE_DATA_CHECK=true` ב־`api/.env` — מדלג על live check. **רק dev/QA, אסור ב־production.**

---

## 2. תנאי להצלחה (תשתית)

**חובה:** `ALPHA_VANTAGE_API_KEY` ב־`api/.env` ו־Backend מופעל מחדש.  
ללא מפתח — Yahoo ו-Alpha עלולים לא להחזיר מחיר, ו-POST ייכשל ב־422.

---

## 3. אימות

```bash
# 1. וודא api/.env מכיל ALPHA_VANTAGE_API_KEY
# 2. הפעל מחדש Backend
# 3. הרץ:
bash scripts/run-user-tickers-qa-api.sh
```

**מצופה:** ✅ POST (AAPL מניה) → 201 או 409

---

**log_entry | TEAM_20 | TO_TEAM_50 | FIX_REQUEST_LIVE_DATA_CHECK_ACK | 2026-02-14**
