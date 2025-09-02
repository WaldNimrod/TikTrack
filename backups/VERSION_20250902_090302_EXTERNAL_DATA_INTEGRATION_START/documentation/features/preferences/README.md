# מערכת העדפות - TikTrack

## סקירה כללית

מערכת ההעדפות מאפשרת למשתמשים להגדיר הגדרות מערכת מותאמות אישית, כולל מטבע ראשי, אזור זמן, ברירות מחדל לטריידים, והגדרות מערכת הנתונים החיצוניים.

## תכונות מרכזיות

### הגדרות בסיסיות
- **מטבע ראשי**: USD, ILS, EUR
- **אזור זמן**: Asia/Jerusalem, UTC, America/New_York
- **סטופ לוס ברירת מחדל**: אחוז הסטופ לוס לטריידים חדשים
- **יעד ברירת מחדל**: אחוז היעד לטריידים חדשים
- **עמלה ברירת מחדל**: עמלה לעסקאות קניה/מכירה

### פילטרים ברירת מחדל
- **פילטר סטטוס**: all, open, closed, cancelled
- **פילטר סוג**: all, swing, investment, passive
- **פילטר חשבון**: all + חשבונות דינמיים
- **פילטר טווח תאריכים**: all, this_week, week, mtd, 30_days, 60_days, 90_days, year, ytd

### הגדרות מערכת הנתונים החיצוניים
- **מרווח רענון נתונים**: זמן בין רענון נתונים חיצוניים (בדקות)
- **ספק נתונים ראשי**: Yahoo Finance, Google Finance, Alpha Vantage
- **ספק נתונים משני**: גיבוי במקרה של כשל
- **מרווח זמן Cache**: זמן שמירת נתונים במטמון (בדקות)
- **מספר מקסימלי של טיקרים לרענון**: מספר הטיקרים המקסימלי שירענן בבת אחת
- **מרווח בין בקשות**: מרווח זמן בין בקשות לספקי נתונים (במילישניות)
- **מספר ניסיונות חוזרים**: מספר הניסיונות החוזרים במקרה של כשל
- **זמן פסקה בין ניסיונות**: זמן המתנה בין ניסיונות חוזרים (בשניות)
- **רענון אוטומטי**: הפעלת רענון אוטומטי של נתונים
- **לוגים מפורטים**: הצגת לוגים מפורטים של פעולות נתונים

## ארכיטקטורה

### Frontend
- **קובץ HTML**: `trading-ui/preferences.html`
- **קובץ JavaScript**: `trading-ui/scripts/preferences.js`
- **תלויות**: `filter-system.js`, `main.js`, `tables.js`, `ui-utils.js`

### Backend
- **Blueprint**: `Backend/routes/api/preferences.py`
- **Service**: `Backend/services/user_service.py`
- **Model**: `Backend/models/user.py`

## API Endpoints

### GET /api/v1/preferences/
מחזיר את כל ההעדפות של המשתמש הנוכחי

**תגובה:**
```json
{
  "primaryCurrency": "USD",
  "timezone": "Asia/Jerusalem",
  "defaultStopLoss": 5,
  "defaultTargetPrice": 10,
  "defaultCommission": 1.0,
  "defaultStatusFilter": "open",
  "defaultTypeFilter": "swing",
  "defaultAccountFilter": "all",
  "defaultDateRangeFilter": "this_week",
  "dataRefreshInterval": 5,
  "primaryDataProvider": "yahoo",
  "secondaryDataProvider": "google",
  "cacheTTL": 5,
  "maxBatchSize": 25,
  "requestDelay": 200,
  "retryAttempts": 2,
  "retryDelay": 5,
  "autoRefresh": true,
  "verboseLogging": false
}
```

### POST /api/v1/preferences/
שומר את כל ההעדפות של המשתמש הנוכחי

**בקשה:**
```json
{
  "preferences": {
    "primaryCurrency": "EUR",
    "defaultStopLoss": 3
  }
}
```

**תגובה:**
```json
{
  "success": true,
  "message": "Preferences saved successfully"
}
```

### PUT /api/v1/preferences/<key>
מעדכן העדפה ספציפית

**בקשה:**
```json
{
  "value": "new_value"
}
```

### POST /api/v1/preferences/reset
מאפס את כל ההעדפות לברירות מחדל

## תיקונים אחרונים (אוגוסט 2025)

### בעיות שתוקנו:
1. **שגיאת מערכת פילטרים**: `window.filterSystem.resetFilters is not a function`
2. **סקריפטים חסרים**: הוספת `filter-system.js`, `main.js`, `tables.js`
3. **קוד כפול**: ניקוי פונקציה `resetToDefaults` מכפילות
4. **אתחול שגוי**: תיקון אתחול מערכת הפילטרים

### שינויים שבוצעו:
- הוספת הסקריפטים החסרים לעמוד ההעדפות
- תיקון סדר הטעינה של הסקריפטים
- תיקון אתחול מערכת הפילטרים מ-`simpleFilter` ל-`filterSystem` ✅ הושלם
- ניקוי קוד כפול ופגום בפונקציה `resetToDefaults`
- הוספת פונקציות עזר גלובליות ב-`header-system.js`

### פונקציות חדשות שנוספו:
- `getVisibleContainers()` - קבלת כל הקונטיינרים הנראים
- `showAllRecordsInTable()` - הצגת כל הרשומות בטבלה
- `updateTableCount()` - עדכון מספר הרשומות בטבלה
- `resetFiltersManually()` - איפוס ידני של פילטרים (גיבוי)
- `handleElementNotFound()` - טיפול במקרה שאלמנט לא נמצא
- `handleDataLoadError()` - טיפול בשגיאות טעינת נתונים
- `tryLoadData()` - ניסיון לטעינת נתונים

## שימוש

### טעינת העדפות
```javascript
await loadPreferences();
```

### עדכון העדפה
```javascript
updatePreference('primaryCurrency', 'EUR');
```

### שמירת כל ההעדפות
```javascript
await saveAllPreferences();
```

### איפוס לברירות מחדל
```javascript
await resetToDefaults();
```

## תלויות

### Frontend Dependencies
- `filter-system.js` - מערכת פילטרים גלובלית
- `main.js` - פונקציות גלובליות
- `tables.js` - פונקציות טבלאות
- `ui-utils.js` - פונקציות ממשק משתמש
- `notification-system.js` - מערכת התראות

### Backend Dependencies
- `UserService` - שירות ניהול משתמשים
- `User` model - מודל משתמש
- SQLite database - בסיס נתונים

## הערות טכניות

### שמירת העדפות
העדפות נשמרות בבסיס הנתונים בטבלת `users` בעמודה `preferences` כ-JSON.

### ברירות מחדל
ברירות מחדל מוגדרות בקובץ `trading-ui/config/preferences.json`.

### גיבוי משתמש
המערכת תומכת במערכת רב-משתמשים עם גיבוי למשתמש ברירת מחדל.

### טיפול בשגיאות
המערכת כוללת טיפול מקיף בשגיאות עם הודעות משתמש ידידותיות.

## היסטוריית גרסאות

### v1.3.1 (אוגוסט 2025)
- תיקון שגיאות מערכת פילטרים
- הוספת פונקציות עזר גלובליות
- ניקוי קוד כפול
- שיפור אתחול מערכת

### v1.3.0 (אוגוסט 2025)
- הוספת הגדרות מערכת הנתונים החיצוניים
- שיפור API endpoints
- הוספת תמיכה במערכת רב-משתמשים

### v1.2.0 (יולי 2025)
- הוספת פילטרים ברירת מחדל
- שיפור ממשק משתמש
- הוספת מערכת התראות

### v1.1.0 (יוני 2025)
- הוספת הגדרות בסיסיות
- יצירת API endpoints
- אינטגרציה עם מערכת המשתמשים

### v1.0.0 (מאי 2025)
- גרסה ראשונית
- הגדרות בסיסיות בלבד
