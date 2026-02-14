# Team 30 → Team 20: אבחון מצב שוק "—"

**id:** `TEAM_30_TO_TEAM_20_MARKET_STATUS_DASH_DIAGNOSTIC`  
**from:** Team 30 (UI)  
**to:** Team 20 (Backend)  
**date:** 2026-01-31  
**נושא:** בדיקת מקור תצוגת "—" במצב שוק

---

## 1. תסמין

בממשק בקרת תקינות נתונים (Tickers) מצב השוק מציג **"—"** במקום ערך (שוק פתוח / פרהמרקט / שוק סגור וכו').

---

## 2. זרימת הנתונים (Team 30)

1. `eodStalenessCheck.js` קורא: `GET /system/market-status` (דרך sharedServices)
2. אם התשובה fulfilled: `market_state`, `display_label` מועברים ל־`updateStalenessClock`
3. אם rejected (401, network): איננו מציגים "—" אלא "חסר נתון"

**מסקנה:** כשמוצג "—" בממשק, המשמעות היא שהתשובה מה־API הגיעה בהצלחה אבל עם `display_label: "—"` — כלומר הבעיה בצד Backend/Yahoo.

---

## 3. בקשת תאום

1. **לוודא** ש־`GET /api/v1/system/market-status` מחזיר ערכים תקינים כשה־Yahoo זמין  
2. **לבדוק** לוגים: Timeout, Yahoo fetch failure, rate limit  
3. **לוודא** ש־`_fetch_market_status_sync` (Yahoo) רץ בהצלחה בסביבת פיתוח/production  

---

## 4. קבצי Backend רלוונטיים

- `api/routers/system.py` — endpoint
- `api/services/market_status_service.py` — מחזיר `(None, "—")` על timeout/exception
- `api/integrations/market_data/providers/yahoo_provider.py` — `_fetch_market_status_sync()`
