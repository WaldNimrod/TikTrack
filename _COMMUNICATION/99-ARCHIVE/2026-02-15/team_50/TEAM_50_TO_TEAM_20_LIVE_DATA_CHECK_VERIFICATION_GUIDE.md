# Team 50 → Team 20: הודעה מפורטת — אימות Live Data Check (POST /me/tickers)

**From:** Team 50 (QA & Fidelity)  
**To:** Team 20 (Backend / צד שרת)  
**Date:** 2026-02-14  
**נושא:** POST /me/tickers מחזיר 422 — איך לבדוק ולתקן  
**מקור:** TEAM_50_TO_TEAM_20_FIX_REQUEST_LIVE_DATA_CHECK_POST_TICKERS, TEAM_20_TO_TEAM_50_FIX_REQUEST_LIVE_DATA_CHECK_ACK

---

## 1. תקציר

`POST /api/v1/me/tickers?symbol=AAPL&ticker_type=STOCK` מחזיר 422 עם:
```json
{"detail":"Provider could not fetch data for this symbol. Check ALPHA_VANTAGE_API_KEY in api/.env and Yahoo availability. Ticker not created.","error_code":"VALIDATION_INVALID_FORMAT"}
```

הסיבה: `_live_data_check` (Yahoo → Alpha) נכשל — אף Provider לא מחזיר מחיר חי.

---

## 2. איך זה עובד (לוגיקת קוד)

| שלב | קובץ | פונקציה | תיאור |
|-----|------|---------|-------|
| 1 | `api/services/user_tickers_service.py` | `add_ticker` (בערך שורה 197) | לפני יצירת טיקר חדש קורא ל־`_live_data_check` |
| 2 | `api/services/user_tickers_service.py` | `_live_data_check` (שורות 53–95) | מנסה YahooProvider ראשון, אחריו AlphaProvider |
| 3 | `api/integrations/market_data/providers/yahoo_provider.py` | `get_ticker_price` | Yahoo — לרוב ללא API key |
| 4 | `api/integrations/market_data/providers/alpha_provider.py` | `get_ticker_price` | Alpha — קורא `os.environ.get("ALPHA_VANTAGE_API_KEY", "")` (שורה 114) |

**אם Yahoo ו-Alpha שניהם נכשלים** → `_live_data_check` מחזיר False → 422.

---

## 3. איך לבדוק שהמפתח נטען

### 3.1 וידוא קובץ .env

```bash
# מיקום
ls -la api/.env

# בדיקה שהמפתח קיים (בלי לחשוף ערך)
grep -q "ALPHA_VANTAGE_API_KEY=" api/.env && echo "Key defined" || echo "Key NOT defined"
```

**פורמט נכון ב־api/.env:**
```
ALPHA_VANTAGE_API_KEY=your_actual_key_here
```
ללא רווחים מסביב ל־`=`, ללא גרשיים מיותרים.

### 3.2 וידוא טעינה ב־Backend

ה־Backend טוען את `.env` **רק בעת הפעלה**. שינוי ב־`.env` דורש **הפעלה מחדש**.

```bash
# עצירת Backend קיים (אם רץ)
lsof -i :8082
# הפסקת התהליך: kill <PID>

# הפעלה מחדש (מתיקיית הפרויקט)
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8082
```

### 3.3 אבחון מהטרמינל (אופציונלי)

אם רוצים לוודא שה־env נטען לפני שהקריאות יוצאות:

```python
# בתוך api/ או python -c
import os
from pathlib import Path

# טעינת .env ידנית (כמו שעושה app)
env_path = Path("api/.env")
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if line.strip().startswith("ALPHA_VANTAGE_API_KEY="):
            key = line.split("=", 1)[1].strip().strip('"').strip("'")
            print(f"Key length: {len(key)} chars" if key else "Key is EMPTY")
            break
else:
    print("api/.env not found")
```

---

## 4. איך לבדוק את ה־API (שלב־אחר־שלב)

### 4.1 Login

```bash
TOKEN=$(curl -s -X POST "http://127.0.0.1:8082/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

echo "Token length: ${#TOKEN}"
```
**מצופה:** Token לא ריק.

### 4.2 POST AAPL (בדיקה מרכזית)

```bash
curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
  "http://127.0.0.1:8082/api/v1/me/tickers?symbol=AAPL&ticker_type=STOCK" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**מצופה בהצלחה:** `HTTP_CODE:201` או `HTTP_CODE:409` (טיקר כבר קיים).  
**בכישלון:** `HTTP_CODE:422` + JSON עם `"Provider could not fetch data..."`.

### 4.3 הרצת סקריפט QA המלא

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
bash scripts/run-user-tickers-qa-api.sh
```

**מצופה בהצלחה:**
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

---

## 5. סיבות אפשריות לכישלון

| סיבה | בדיקה | פתרון |
|------|-------|-------|
| מפתח לא מוגדר | `grep ALPHA_VANTAGE api/.env` | הוסף `ALPHA_VANTAGE_API_KEY=...` ל־api/.env |
| Backend לא הופעל מחדש | תאריך הפעלת התהליך | עצור והפעל מחדש את uvicorn |
| מפתח לא תקף | Alpha Vantage dashboard | החלף מפתח חדש |
| Yahoo rate limit | לוגים / שגיאות רשת | חכה או השתמש ב-Alpha בלבד (אם מפתח תקין) |
| בעיית רשת | `curl -s "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=DEMO"` | וודא גישה חופשית ל־Alpha |
| **Bypass (dev/QA)** | — | הוסף `SKIP_LIVE_DATA_CHECK=true` ל־api/.env — **רק dev, אסור ב־production** |

---

## 6. קבצים רלוונטיים

| קובץ | תיאור |
|------|-------|
| `api/services/user_tickers_service.py` | `_live_data_check`, `add_ticker` |
| `api/integrations/market_data/providers/alpha_provider.py` | קריאת `ALPHA_VANTAGE_API_KEY` מ־env |
| `api/.env` | הגדרת מפתח (לא ב־git) |
| `api/.env.example` | דוגמה — מוזכר ALPHA_VANTAGE_API_KEY |
| `scripts/run-user-tickers-qa-api.sh` | סקריפט אימות מלא |

---

## 7. מסמכים קשורים

- TEAM_50_TO_TEAM_20_FIX_REQUEST_LIVE_DATA_CHECK_POST_TICKERS
- TEAM_20_TO_TEAM_50_FIX_REQUEST_LIVE_DATA_CHECK_ACK
- TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE

---

**log_entry | TEAM_50 | TO_TEAM_20 | LIVE_DATA_CHECK_VERIFICATION_GUIDE | 2026-02-14**
