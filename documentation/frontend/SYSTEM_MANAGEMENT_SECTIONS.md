# System Management Sections Documentation

## מטרת המסמך

מסמך זה מכיל תיאור מפורט של כל הסקשנים בעמוד מנהל מערכת.

## מבנה כללי

כל סקשן הוא instance של class שמרחיב את `SMBaseSection`. כל סקשן:

- נטען אוטומטית על ידי `SystemManagementMain`
- מנהל את הנתונים שלו באופן עצמאי
- תומך ב-auto-refresh
- מטפל בשגיאות באופן עצמאי

## Sections Overview

### 1. Dashboard Section (sm-dashboard)

**Class:** `SMDashboardSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-dashboard.js`

**תיאור:**
סקשן מרכזי המציג סקירה כללית של המערכת כולל בריאות, ביצועים, ומידע סביבה.

**נתונים מוצגים:**

- בריאות מערכת (System Score) - 0-100%
- זמן תגובה (Response Time) - מילישניות
- זמן פעילות (Uptime)
- זיכרון זמין (Memory Available) - %
- עומס CPU - %
- סביבה (Environment) - Development/Production
- פורט שרת (Port)
- שם בסיס נתונים (Database Name)
- סטטוס רכיבי מערכת (Server, Database, Cache, External Data)

**APIs בשימוש:**

- `GET /api/system/overview`
- `GET /api/system/environment`

**Event Listeners:**

- אין event listeners מיוחדים

**Auto-refresh:**

- פעיל: כן
- תדירות: 30 שניות

---

### 2. Server Section (sm-server)

**Class:** `SMServerSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-server.js`

**תיאור:**
סקשן המציג מידע מפורט על השרת כולל סטטוס, משאבים, ומידע מערכת.

**נתונים מוצגים:**

- סטטוס שרת
- זמן פעילות
- משאבי מערכת (CPU, RAM, Disk)
- מידע תהליכים
- מידע מערכת (OS, Python, Flask)

**APIs בשימוש:**

- `GET /api/server/status`
- `GET /api/system/resources`
- `GET /api/system/overview`

**Event Listeners:**

- אין event listeners מיוחדים

**Auto-refresh:**

- פעיל: כן
- תדירות: 60 שניות

**קישור מהיר:**

- "ניטור שרת מלא" → `/server-monitor`

---

### 3. Cache Section (sm-cache)

**Class:** `SMCacheSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-cache.js`

**תיאור:**
סקשן לניהול מטמון המציג סטטיסטיקות, בריאות, וביצועים.

**נתונים מוצגים:**

- סטטיסטיקות (Hit Rate, Miss Rate, Total Requests)
- בריאות מטמון
- ביצועים (זמן תגובה, גודל)
- שכבות מטמון (Memory, localStorage, IndexedDB, Backend)

**APIs בשימוש:**

- `GET /api/cache/stats`
- `GET /api/cache/health`
- `GET /api/cache/info`

**Event Listeners:**

- כפתורי ניקוי מטמון
- כפתור רענון סטטיסטיקות

**Auto-refresh:**

- פעיל: כן
- תדירות: 45 שניות

**קישור מהיר:**

- "ניהול מטמון מלא" → `/cache-management`

---

### 4. Performance Section (sm-performance)

**Class:** `SMPerformanceSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-performance.js`

**תיאור:**
סקשן המציג מדדי ביצועים של המערכת.

**נתונים מוצגים:**

- זיכרון מערכת
- עומס CPU
- שימוש בדיסק
- חיבורי רשת

**APIs בשימוש:**

- `GET /api/system/overview`
- `GET /api/system/metrics`
- `GET /api/system/performance`

**Event Listeners:**

- אין event listeners מיוחדים

**Auto-refresh:**

- פעיל: כן
- תדירות: 30 שניות

---

### 5. External Data Section (sm-external-data)

**Class:** `SMExternalDataSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-external-data.js`

**תיאור:**
סקשן לניהול נתונים חיצוניים המציג סטטוס ספקים ונתונים.

**נתונים מוצגים:**

- ספקים פעילים
- ספקים בריאים
- ספקים לא בריאים
- נתונים אחרונים

**APIs בשימוש:**

- External Data Dashboard APIs

**Event Listeners:**

- כפתורי רענון
- כפתורי ניקוי מטמון
- כפתורי אופטימיזציה

**Auto-refresh:**

- פעיל: כן
- תדירות: 120 שניות

**קישור מהיר:**

- "דשבורד מלא" → `/external_data_dashboard`

---

### 6. Alerts Section (sm-alerts)

**Class:** `SMAlertsSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-alerts.js`

**תיאור:**
סקשן המציג התראות מערכת.

**נתונים מוצגים:**

- התראות פעילות
- סוגי התראות
- חומרת התראות
- זמן התראות

**APIs בשימוש:**

- `GET /api/system/alerts`

**Event Listeners:**

- אין event listeners מיוחדים

**Auto-refresh:**

- פעיל: כן
- תדירות: 15 שניות

---

### 7. Database Section (sm-database)

**Class:** `SMDatabaseSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-database.js`

**תיאור:**
סקשן המציג מידע על בסיס הנתונים.

**נתונים מוצגים:**

- סטטוס DB
- גודל DB
- מספר טבלאות
- מידע נוסף

**APIs בשימוש:**

- `GET /api/system/database`

**Event Listeners:**

- אין event listeners מיוחדים

**Auto-refresh:**

- פעיל: כן
- תדירות: 90 שניות

---

### 8. Background Tasks Section (sm-background-tasks)

**Class:** `SMBackgroundTasksSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-background-tasks.js`

**תיאור:**
סקשן המציג משימות רקע.

**נתונים מוצגים:**

- משימות פעילות
- סטטוס משימות
- זמן ביצוע

**APIs בשימוש:**

- `GET /api/background-tasks/`

**Event Listeners:**

- אין event listeners מיוחדים

**Auto-refresh:**

- פעיל: כן
- תדירות: 30 שניות

---

### 9. Operations Section (sm-operations)

**Class:** `SMOperationsSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-operations.js`

**תיאור:**
סקשן לפעולות מערכת.

**נתונים מוצגים:**

- כפתורי פעולות

**APIs בשימוש:**

- `POST /api/server/restart`
- `POST /api/cache/clear`

**Event Listeners:**

- כפתורי פעולות

**Auto-refresh:**

- פעיל: לא

---

### 10. System Settings Section (sm-system-settings)

**Class:** `SMSystemSettingsSection`  
**File:** `trading-ui/scripts/system-management/sections/sm-section-system-settings.js`

**תיאור:**
סקשן לניהול הגדרות מערכת כולל SMTP ונתונים חיצוניים.

**נתונים מוצגים:**

- הגדרות SMTP
- הגדרות נתונים חיצוניים
- קבוצות הגדרות נוספות

**APIs בשימוש:**

- `GET /api/system-settings/smtp`
- `POST /api/system-settings/smtp`
- `POST /api/system-settings/smtp/test`
- `POST /api/system-settings/smtp/test-email`
- `GET /api/system-settings/external-data`
- `POST /api/system-settings/external-data`
- `GET /api/system-setting-groups`

**Event Listeners:**

- טופס SMTP settings
- כפתור בדיקת חיבור
- כפתור שליחת מייל בדיקה
- טופס External Data settings
- כפתור toggle password visibility

**Auto-refresh:**

- פעיל: לא

---

## Base Section (SMBaseSection)

**File:** `trading-ui/scripts/system-management/core/sm-base.js`

**תכונות משותפות:**

- Loading states
- Error handling
- Auto-refresh
- Retry logic
- Data validation

**Methods:**

- `init()` - אתחול הסקשן
- `loadData()` - טעינת נתונים (override required)
- `render(data)` - הצגת נתונים (override required)
- `showLoadingState()` - הצגת מצב טעינה
- `showEmptyState(message)` - הצגת מצב ריק
- `handleError(error, context)` - טיפול בשגיאות
- `fetchWithTimeout(url, options, timeout)` - fetch עם timeout
- `loadDataWithRetry(maxRetries)` - טעינת נתונים עם retry

---

## Initialization Order

הסקשנים מאותחלים לפי priority:

1. sm-dashboard (priority: 1)
2. sm-server (priority: 2)
3. sm-cache (priority: 3)
4. sm-performance (priority: 4)
5. sm-external-data (priority: 5)
6. sm-alerts (priority: 6)
7. sm-database (priority: 7)
8. sm-background-tasks (priority: 8)
9. sm-operations (priority: 9)
10. sm-system-settings (priority: 10)

---

## הערות

- תאריך עדכון: ___________
- גרסה: ___________























