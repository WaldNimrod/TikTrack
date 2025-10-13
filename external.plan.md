<!-- f5cc846b-ba17-4682-ac3e-11e5c4a7ca7b 0d2174a4-5014-4d52-b5dd-a2784bb1c3e1 -->
# מדיניות רענון נתונים חיצוניים — הגדרות מערכת

## תמצית

הטמעת חנות הגדרות מערכתית (DB) גנרית לשמירת מדיניות רענון לנתונים חיצוניים (לא פר־משתמש); ספק TTL במודול `external_data` לפי סטטוס ושעות מסחר (ניו־יורק); endpoint ייעודי לקוהורט פעילים/פתוחים; אינטגרציה עם דקורטורי cache וה־Scheduler; ממשק ניהול ב־`external-data-dashboard` לעריכה; עדכון דוקומנטציה (כולל אינדקס); גיבוי לפני/אחרי ל־GitHub; ובדיקות מקיפות בסיום.

## החלטות עיקריות

- TTL ברירת־מחדל: active=5m, open=15m, closed=60m, cancelled=24h (ניתן לעריכה בדשבורד)
- אחסון: סכימת DB גמישה (groups/types/values) לשימוש מערכתי כללי
- שעות מסחר: America/New_York; פונקציה `is_market_hours(now_utc)`
- Endpoint: `GET /api/tickers/active` (ללא תאימות לאחור)
- מיפוי סטטוסים: `active_trades=true`, `open` מתכניות פעילות, `closed`/`cancelled` כרגיל
- Cache deps: `external_data`, `tickers`, `tickers:*`, `linked_items:ticker:*`
- Frontend: UCM+SWR מיושר ל־TTL שרת (ללא מורכבות מיותרת)
- יעדי ביצועים: p50 ≤ 300ms, p95 ≤ 700ms
- Scheduler: דגל מערכת להדלקה/כיבוי; שימוש במערכת משימות רקע הקיימת
- Overrides לפי `ticker_id`
- היסטוריה: `quotes_last` ב־DB ל־last; היסטוריה קצרה ב־IndexedDB (לפי אפיון קיים)
- Batch/Rate: לפי אפיון קיים (Yahoo ~50/100rpm)
- דשבורד: מסך ניהול הגדרות + ניטור
- ניקוי Cache: Smart בלא־נוקלארי; Full אמיתי בנוקלארי
- שגיאות: ללא Mock; התראות ברורות ו־console
- טריות: “עודכן לפני X דק׳” + סף סטיילן
- כשל חלקי: להציג הצלחות + שגיאות פר־טיקר + retry נקודתי

## שלבים

### 1) חנות הגדרות מערכת (DB + Service)

- מודלים + מיגרציה:
- `system_setting_groups(id, name, description, created_at, updated_at)`
- `system_setting_types(id, group_id, key, data_type, description, default_value, is_active, constraints_json, created_at, updated_at)`
- `system_settings(id, type_id, value, updated_at, updated_by)`
- קבצים: `Backend/models/system_settings.py`, `Backend/services/system_settings_service.py`
- Cache: `@cache_with_deps(['preferences','external_data'])`
- API מנהלי (מערכתי בלבד): `Backend/routes/api/system_settings.py`

### 2) ספק מדיניות TTL (external_data)

- קובץ: `Backend/services/external_data/policy_provider.py`
- פונקציות:
- `get_refresh_policy_for_status(status: str, market_hours: Optional[bool]) -> int`
- `is_market_hours(now_utc: datetime) -> bool`
- קריאה ל־SystemSettingsService; נפילה לברירות מחדל
- מפתחות בקבוצה `external_data_settings`:
- `ttlActiveSeconds`, `ttlOpenSeconds`, `ttlClosedSeconds`, `ttlCancelledSeconds`
- אופציונלי off-hours: `ttl*OffHoursSeconds`; `externalDataSchedulerEnabled`, `maxBatchSize`

### 3) Endpoint

- הוספת `GET /api/tickers/active`
- פרמטרים: `active_mode=active|open|both` (ברירת־מחדל active), `market=true|false`, `fields=...`
- יישום TTL דרך `policy_provider` + `@cache_with_deps(ttl=..., dependencies=['external_data','tickers'])`
- Projection מינימלי לביצועים

### 4) Scheduler & רקע

- אתחול `DataRefreshScheduler` רק כש־`externalDataSchedulerEnabled=true`
- קצב בהתאם לשעות מסחר ניו־יורק
- שמירה על invalidation ו־batch מהאפיון

### 5) Frontend — דשבורד

- הרחבת `trading-ui/scripts/external-data-dashboard.js`:
- צפייה/עריכה: TTLs מערכתיים, Toggle Scheduler, Overrides לפי `ticker_id`
- שימוש במערכות קיימות: התראות, UCM, איסוף טפסים
- Prewarm `ActiveTickersBasic` באתחול מאוחד; SWR מיושר TTL
- הצגת טריות ושגיאות; retry נקודתי

### 6) היסטוריה (Client)

- אימות/שימוש ב־IndexedDB adapters להיסטוריה קצרה פר־`ticker_id`
- DB כ־last בלבד בשלב זה

### 7) ניקוי Cache

- התאמה להתנהגות Smart/Full; פעולות דשבורד מכבדות זאת
- Invalidate `external_data` + `tickers` בעת שמירת הגדרות

### 8) דוקומנטציה + אינדקס

- עדכון:
- `documentation/04-FEATURES/CORE/external_data/EXTERNAL_DATA_SYSTEM.md`
- `documentation/INDEX.md` (מצב External Data + מדיניות רענון)
- `documentation/frontend/GENERAL_SYSTEMS_LIST.md` (אזכור חנות ההגדרות המערכתית)
- `CACHE_SYSTEM_FINAL_REPORT.md` (יישור התנהגות ניקוי)
- קובץ התוכנית (סימון החלטות בוצעו)

### 9) גיבויים ל־GitHub

- לפני שינויי סכימה/קוד: commit וגיבוי
- אחרי יישום מלא ועדכון דוקו: commit מסכם + tag גרסת תיקון (טלאי)

### 10) בדיקות מקיפות בסוף

- Backend: יחידה (SystemSettings, PolicyProvider, Market-hours), אינטגרציה (`/api/tickers/active`, Scheduler)
- Frontend: דשבורד (עריכה/שמירה), טריות, partial failure
- אימות ביצועים: p50/p95, TTL אפקטיבי, ניקוי Cache

## לא יעשה

- ללא העדפות משתמש
- ללא WebSocket
- ללא מערכות כפולות

## תלות

- שימוש במערכות cache, רקע, UCM קיימות

## To-dos

- [x] Create DB models + migration for generic system settings (groups/types/values)
- [x] Implement SystemSettingsService with caching and validation
- [x] Add system-level settings API (get/save)
- [x] Add policy_provider with NY market-hours + TTL lookup
- [x] Add GET /api/tickers/active with TTL via provider
- [x] Wire scheduler enablement to system setting + market-hours
- [x] Extend external-data-dashboard to edit system TTLs and toggle scheduler
- [ ] Prewarm ActiveTickersBasic and align SWR with server TTL
- [x] Hook settings save to invalidate external_data + tickers
- [ ] Store short-term quote history in IndexedDB via existing adapter
- [x] Update all relevant docs and the plan file decisions
- [ ] Add unit/integration tests for settings, provider, endpoint, scheduler
- [ ] Add UI tests for settings editor, freshness, partial-failure retry

# Logging Standardization (external_data)

- [x] Define external_data RotatingFileHandler (logs/external_data.log)
- [x] Expose via Server Logs API type=external_data
- [x] Emit adapter/status lifecycle entries
- [x] Map unified log key externalDataLog → /api/logs/raw/external_data
- [x] Remove UCM usage for logs (display only)
- [x] Docs updated (UNIFIED_LOG_SYSTEM_GUIDE.md, EXTERNAL_DATA_SYSTEM.md)


