# Team 20 → Team 30: תיאום מימוש — Market Data Settings UI
**project_domain:** TIKTRACK

**id:** `TEAM_20_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_COORDINATION`  
**from:** Team 20 (Backend)  
**to:** Team 30 (Frontend)  
**date:** 2026-01-31  
**מקור:** TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE; MD-SETTINGS — תיאום API לחוזה מימוש מדויק

---

## 1. מטרת התיאום

תיאום API, סכמות ותגובות שגיאה למימוש מדויק של ממשק הגדרות נתוני שוק בעמוד ניהול מערכת. היקף: [TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT](../../documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md).

---

## 2. API Endpoints

**Base URL:** `/api/v1` (sharedServices)

| Method | Path | תיאור |
|--------|------|-------|
| GET | `/settings/market-data` | טעינת הגדרות (Admin-only) |
| PATCH | `/settings/market-data` | עדכון חלקי (Admin-only) |

**הרשאה:** Admin-only — non-admin מחזיר **403 Forbidden**.

---

## 3. GET — Request & Response

**Request:** `GET /api/v1/settings/market-data`  
**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "max_active_tickers": 50,
  "intraday_interval_minutes": 15,
  "provider_cooldown_minutes": 15,
  "max_symbols_per_request": 5,
  "delay_between_symbols_seconds": 0,
  "intraday_enabled": true
}
```

---

## 4. PATCH — Request & Response

**Request:** `PATCH /api/v1/settings/market-data`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:** עדכון חלקי — רק שדות שמשתנים נשלחים.

**דוגמה:**
```json
{
  "max_active_tickers": 100,
  "intraday_enabled": false
}
```

**Response 200:** אותו מבנה כמו GET — הערכים העדכניים (כולל שדות שלא נשלחו).

---

## 5. תגובות שגיאה — הצגה ב-UI

| Status | מצב | הודעת UI מומלצת |
|--------|-----|-----------------|
| **403** | non-admin | "אין הרשאה — נדרש תפקיד Admin." |
| **422** | ולידציה (ערכים מחוץ לטווח) | הצגת `detail.validation_errors` — לכל key: `key` + `error` |
| **422** | No fields to update | `detail` = "No fields to update" |
| **500** | שגיאת שרת | "שגיאה בשמירה. נסה שוב." |
| **503** | טבלה לא מיגרציה (Team 60) | "הגדרות עדיין לא זמינות. יש לתאם עם DevOps." |

**מבנה 422 (validation_errors):**
```json
{
  "detail": {
    "validation_errors": [
      { "key": "max_active_tickers", "error": "must be between 1 and 500" }
    ]
  }
}
```

---

## 6. שדות וטווחים — מימוש UI

| key | type | min | max | default | label (עברית) | input |
|-----|------|-----|-----|---------|---------------|-------|
| max_active_tickers | integer | 1 | 500 | 50 | מקסימום טיקרים פעילים (Intraday) | number, min=1, max=500 |
| intraday_interval_minutes | integer | 5 | 240 | 15 | מרווח Intraday (דקות) | number, min=5, max=240 |
| provider_cooldown_minutes | integer | 5 | 120 | 15 | זמן Cooldown אחרי 429 (דקות) | number, min=5, max=120 |
| max_symbols_per_request | integer | 1 | 50 | 5 | מקסימום סימבולים לבקשה | number, min=1, max=50 |
| delay_between_symbols_seconds | integer | 0 | 30 | 0 | רווח (שניות) בין סימבולים | number, min=0, max=30 |
| intraday_enabled | boolean | — | — | true | הפעלת רענון Intraday | checkbox/toggle |

**הערה:** ולידציה ב-Backend מלאה — UI יכולה להציג placeholder/help (למשל "1–500") לשיפור חוויית משתמש.

---

## 7. UX Flow

1. **טעינה ראשונית:** GET → הצגת ערכים בשדות לעריכה.
2. **עריכה:** משתמש משנה ערכים; ולידציה client-side (אופציונלית, להנחיית משתמש).
3. **שמירה:** כפתור "שמור" → PATCH עם השדות ששונו בלבד.
4. **הצלחה:** PATCH 200 → Reload GET או עדכון state מהתגובה; הודעת "נשמר בהצלחה".
5. **שגיאה:** הצגת הודעות לפי חוזה (סעיף 5).

---

## 8. קבצים רלוונטיים

| קובץ | שינויים מצופים |
|------|-----------------|
| `ui/src/views/management/systemManagement/systemManagementSettingsInit.js` | הרחבה: 6 שדות (כולל delay_between_symbols_seconds, intraday_enabled), שדות לעריכה, כפתור שמירה, PATCH, טיפול בשגיאות |
| `ui/src/views/management/systemManagement/system_management.html` | עדכון הערה: "ערכים מ-Backend (DB > env)" |

---

## 9. מסמכים

| מסמך | נתיב |
|------|------|
| SSOT | documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md |
| מנדט Team 30 | TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE.md |
| Work Plan | TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md |

---

**log_entry | TEAM_20 | TO_TEAM_30 | MARKET_DATA_SETTINGS_UI_COORDINATION | 2026-01-31**
