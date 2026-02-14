# Team 20 → Team 50: הוראות להעברת QA (POST /me/tickers)

**תאריך:** 2026-02-14  
**מקור:** TEAM_50_FIX_REQUEST — "תקן ולבדוק עד למעבר"

---

## 1. תיקון יושם

- **Bypass:** `SKIP_LIVE_DATA_CHECK=true` — מדלג על live data check כאשר מוגדר ב־`api/.env`
- **אזהרה:** רק dev/QA — **אסור** ב־production

---

## 2. להעברת הבדיקות (כש־DB פעיל אך Providers לא)

### אופציה א' — סקריפט
```bash
bash scripts/ensure-skip-live-data-check.sh
# אז הפעל מחדש את ה-Backend
```

### אופציה ב' — ידנית
הוסף ל־`api/.env`:
```
SKIP_LIVE_DATA_CHECK=true
```
הפעל מחדש את ה-Backend.

### אופציה ג' — מפתח Alpha (ללא bypass)
הגדר `ALPHA_VANTAGE_API_KEY` ב־`api/.env`, הפעל מחדש Backend.

---

## 3. הרצה
```bash
bash scripts/run-user-tickers-qa-api.sh
```

**מצופה:** ✅ POST (AAPL מניה) → 201 או 409

---

**log_entry | TEAM_20 | TO_TEAM_50 | QA_PASS_INSTRUCTIONS | 2026-02-14**
