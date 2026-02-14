# Team 20 → Team 50: תיקון נוסף — 500→422 ב-Router

**From:** Team 20 (Backend)  
**To:** Team 50 (QA & Fidelity)  
**Date:** 2026-02-14  
**מקור:** TEAM_50_USER_TICKERS_ROOT_FIX_RERUN_REPORT — POST fake/BTC עדיין 500

---

## 1. תיקון

נוסף **fallback ב-router** (`me_tickers.py`): כשנופל `Exception` מ-add_ticker, אם הודעת השגיאה מכילה "provider", "could not fetch" או "invalid literal" → **422** במקום 500.

כך גם אם ספק מפריש exception שלא נתפס בשירות, ה־API יחזיר 422.

---

## 2. הפעלת Backend מחדש

**חובה:** להפעיל מחדש את ה-Backend לאחר עדכון הקוד:
```bash
# עצור את התהליך הקיים (lsof -i :8082; kill <PID>)
# הפעל מחדש:
cd /path/to/TikTrackAppV2-phoenix
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8082
```

---

## 3. הרצה חוזרת

```bash
bash scripts/run-user-tickers-qa-api.sh
```

**מצופה:** POST (fake) → 422, POST (BTC) → 201 או 409.

---

**log_entry | TEAM_20 | TO_TEAM_50 | 500_TO_422_ROUTER_FIX | 2026-02-14**
