# Team 30 → Team 10: Rate-Limit & Scaling — System Settings UI — הושלם

**from:** Team 30 (UI)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_30_RATELIMIT_SCALING_SETTINGS_MANDATE  
**סטטוס:** ✅ **הושלם**

---

## 1. דרישה

System Settings UI/API חייבים לכלול את ארבע הבקרות:
- `max_active_tickers`
- `intraday_interval_minutes`
- `provider_cooldown_minutes`
- `max_symbols_per_request`

---

## 2. יישום

### 2.1 API (תיאום Team 20)
- **נתיב:** `GET /api/v1/settings/market-data`
- **קובץ:** `api/routers/settings.py`
- **מקור:** `market_data_settings.py` (env: MAX_ACTIVE_TICKERS, INTRADAY_INTERVAL_MINUTES, וכו')
- **אימות:** `curl http://127.0.0.1:8082/api/v1/settings/market-data` → מחזיר 4 שדות

### 2.2 UI — עמוד ניהול מערכת
- **נתיב:** `/system_management.html`
- **תפריט:** ניהול → ניהול מערכת
- **קבצים:**
  - `ui/src/views/management/systemManagement/system_management.html`
  - `ui/src/views/management/systemManagement/systemManagementPageConfig.js`
  - `ui/src/views/management/systemManagement/systemManagementSettingsInit.js`
- **מקור נתונים:** `GET /settings/market-data` (דרך sharedServices)

---

## 3. בקרות מוצגות

| בקרה | תיאור UI |
|------|----------|
| max_active_tickers | מקסימום טיקרים פעילים (Intraday) |
| intraday_interval_minutes | מרווח Intraday (דקות) |
| provider_cooldown_minutes | זמן Cooldown אחרי 429 (דקות) |
| max_symbols_per_request | מקסימום סימבולים לבקשה |

---

## 4. Evidence

- עמוד ניהול מערכת נגיש ב־`/system_management.html`
- ארבע הבקרות נטענות מה-API ומוצגות
- ערכים נקבעים ב-Backend (env) — קריאה בלבד ב-UI

---

**log_entry | TEAM_30 | RATELIMIT_SCALING_SETTINGS | COMPLETE | 2026-02-13**
