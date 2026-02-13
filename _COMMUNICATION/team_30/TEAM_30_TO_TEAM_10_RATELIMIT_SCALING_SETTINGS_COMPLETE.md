# Team 30 → Team 10: סיום מנדט Rate‑Limit & Scaling — System Settings UI

**id:** `TEAM_30_TO_TEAM_10_RATELIMIT_SCALING_SETTINGS_COMPLETE`  
**from:** Team 30 (UI)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_30_RATELIMIT_SCALING_SETTINGS_MANDATE; TEAM_90_RATELIMIT_SCALING_LOCK

---

## 1. סטטוס

עמוד ניהול המערכת מוצג **כמצופה**. ארבע הבקרות נטענות מ־API ומוצגות.

---

## 2. API (Team 20)

| פריט | תוכן |
|------|------|
| נתיב | `GET /api/v1/settings/market-data` |
| מקור | `api/routers/settings.py` — מחזיר את 4 הבקרות |
| ערכים | `market_data_settings.py` (env vars) |

---

## 3. UI (Team 30)

| פריט | תוכן |
|------|------|
| עמוד | `/system_management.html` |
| ניווט | תפריט **ניהול** → **🔧 ניהול מערכת** |

| בקרה | תיאור |
|------|--------|
| max_active_tickers | מקסימום טיקרים פעילים (Intraday) |
| intraday_interval_minutes | מרווח Intraday (דקות) |
| provider_cooldown_minutes | זמן Cooldown אחרי 429 (דקות) |
| max_symbols_per_request | מקסימום סימבולים לבקשה |

**קבצים:**
- `ui/src/views/management/systemManagement/system_management.html`
- `ui/src/views/management/systemManagement/systemManagementSettingsInit.js`

---

## 4. בדיקה ידנית (מומלצת)

- לפתוח `/system_management.html` (דרך תפריט ניהול).
- לוודא שהערכים נטענים מ־API ומוצגים כמצופה.

**אין צורך בשינויי קוד** — המימוש קיים.

---

## 5. הערה — עמוד ניהול טיקרים

בעמוד **ניהול טיקרים** עדיין **אין נתונים** (נושא נפרד — נתונים/ sync / ticker_prices). לא חלק ממנדט System Settings.

---

**log_entry | TEAM_30 | TO_TEAM_10 | RATELIMIT_SCALING_SETTINGS_COMPLETE | 2026-02-13**
