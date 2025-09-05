# מערכת העדפות - TikTrack

## 🚀 **מערכת V2 חדשה זמינה! (ינואר 2025)**

**מערכת העדפות V2** עכשיו זמינה עם תכונות מתקדמות:
- ✅ **פרופילים מרובים** לכל משתמש
- ✅ **יבוא/יצוא הגדרות** לקובצי JSON
- ✅ **היסטוריית שינויים** מפורטת
- ✅ **בדיקות תקינות** אוטומטיות
- ✅ **ממשק מתקדם** Apple-inspired
- ✅ **50+ הגדרות** (במקום 35)
- ✅ **תאימות מלאה** עם V1

**🔗 גישה:** `http://localhost:5000/preferences-v2.html`

---

## סקירה כללית - V1 & V2

מערכת ההעדפות מאפשרת למשתמשים להגדיר הגדרות מערכת מותאמות אישית בשתי גרסאות:
- **V1 (מסורתית)**: הגדרות בסיסיות עם ממשק HTML פשוט
- **V2 (מתקדמת)**: פרופילים מרובים, יבוא/יצוא, והיסטוריה

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

### 🚀 **V2 (מערכת חדשה ומתקדמת)**

#### **Frontend V2:**
- **קובץ HTML**: `trading-ui/preferences-v2.html` (1,056 שורות)
- **JavaScript ראשי**: `trading-ui/scripts/preferences-v2.js` (919 שורות)
- **שכבת תאימות**: `trading-ui/scripts/preferences-v2-compatibility.js`
- **תכונות**: פרופילים, יבוא/יצוא, אנימציות, responsive design

#### **Backend V2:**
- **API Blueprint**: `Backend/routes/api/preferences_v2.py` (8 endpoints)
- **Service מתקדם**: `Backend/services/preferences_service_v2.py`
- **מודלים**: `Backend/models/user_preferences_v2.py` (3 classes)
- **כלי מיגרציה**: `Backend/scripts/simple_migrate_v1_to_v2.py`

#### **מסד נתונים V2:**
- **`preference_profiles`**: פרופילים מרובים לכל משתמש
- **`user_preferences_v2`**: 50+ שדות מובנים + JSON fields
- **`preference_history`**: היסטוריית שינויים מלאה

### 📋 **V1 (מערכת מסורתית - תאימות לאחור)**

#### **Frontend V1:**
- **קובץ HTML**: `trading-ui/preferences.html`
- **קובץ JavaScript**: `trading-ui/scripts/preferences.js`
- **תלויות**: `filter-system.js`, `main.js`, `tables.js`, `ui-utils.js`

#### **Backend V1:**
- **Blueprint**: `Backend/routes/api/preferences.py`
- **Service**: `Backend/services/user_service.py`
- **Model**: `Backend/models/user.py`, `Backend/models/user_preferences.py`

## API Endpoints

## 🚀 **V2 API Endpoints (מתקדם)**

### GET /api/v2/preferences/
קבלת הגדרות V2 עבור פרופיל ספציפי

**פרמטרים:**
- `profile_id` (optional): מזהה פרופיל

**תגובה:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "general": {
        "primaryCurrency": "USD",
        "secondaryCurrency": "ILS", 
        "timezone": "Asia/Jerusalem",
        "defaultStopLoss": 5.0,
        "riskPercentage": 2.0
      },
      "defaultFilters": {
        "status": "open",
        "type": "swing", 
        "dateRange": "this_week"
      },
      "ui": {
        "theme": "light",
        "compactMode": false,
        "showAnimations": true
      },
      "externalData": {
        "providers": {
          "primary": "yahoo",
          "secondary": "google",
          "fallback": "alpha_vantage"
        }
      }
    },
    "profile": {
      "id": 1,
      "name": "ברירת מחדל",
      "isDefault": true
    }
  }
}
```

### POST /api/v2/preferences/
עדכון הגדרות V2

**בקשה:**
```json
{
  "profile_id": 1,
  "preferences": {
    "general": {
      "primaryCurrency": "EUR",
      "defaultStopLoss": 3.0
    }
  }
}
```

### GET /api/v2/preferences/profiles
קבלת כל פרופילי ההגדרות של המשתמש

### POST /api/v2/preferences/profiles
יצירת פרופיל חדש

### POST /api/v2/preferences/migrate
מיגרציה מV1 לV2

### GET /api/v2/preferences/export
יצוא הגדרות לקובץ JSON

### POST /api/v2/preferences/import
יבוא הגדרות מקובץ JSON

### GET /api/v2/preferences/history
קבלת היסטוריית שינויים

---

## 📋 **V1 API Endpoints (מסורתי)**

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

## תיקונים אחרונים (ספטמבר 2025)

### בעיות שתוקנו:
1. **שגיאת מערכת פילטרים**: `window.filterSystem.resetFilters is not a function`
2. **סקריפטים חסרים**: הוספת `filter-system.js`, `main.js`, `tables.js`
3. **קוד כפול**: ניקוי פונקציה `resetToDefaults` מכפילות
4. **אתחול שגוי**: תיקון אתחול מערכת הפילטרים
5. **בעיית שמירת שינויים**: העדפות לא עודכנו בממשק אחרי שמירה ✅ **תוקן**

### שינויים שבוצעו:
- הוספת הסקריפטים החסרים לעמוד ההעדפות
- תיקון סדר הטעינה של הסקריפטים
- תיקון אתחול מערכת הפילטרים מ-`simpleFilter` ל-`filterSystem` ✅ הושלם
- ניקוי קוד כפול ופגום בפונקציה `resetToDefaults`
- הוספת פונקציות עזר גלובליות ב-`header-system.js`
- **תיקון cache system**: שינוי מ-`@cache_for` ל-`@cache_with_deps` עם dependency 'preferences'
- **תיקון JavaScript**: הוספת טעינה מחדש של העדפות אחרי שמירה מוצלחת

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
העדפות נשמרות בבסיס הנתונים בטבלת `user_preferences` (החדשה) או בטבלת `users` בעמודה `preferences_json` (legacy).

### מערכת Cache
המערכת משתמשת במערכת cache מתקדמת עם dependency management:
- GET endpoint משתמש ב-`@cache_with_deps(ttl=300, dependencies=['preferences'])`
- POST/PUT endpoints מבטלים cache עם `invalidate_cache('preferences')`

### ברירות מחדל
ברירות מחדל מוגדרות ב-hardcode ב-`UserService.load_default_preferences()` ולא יותר בקובץ JSON.

### גיבוי משתמש
המערכת תומכת במערכת רב-משתמשים עם גיבוי למשתמש ברירת מחדל (ID=1).

### טיפול בשגיאות
המערכת כוללת טיפול מקיף בשגיאות עם הודעות משתמש ידידותיות.

### רענון ממשק
אחרי שמירה מוצלחת, הממשק טוען מחדש את ההעדפות מהשרת כדי להציג את השינויים העדכניים.

### ממשק סקשנים
עמוד ההעדפות מחולק לסקשנים נפרדים עם יכולת פתיחה/סגירה:

#### **סקשנים זמינים:**
1. **הגדרות בסיסיות** (⚙️): מטבע, אזור זמן, סטופ לוס, יעד, עמלה
2. **הגדרות פילטרים ברירת מחדל** (🔍): פילטרי סטטוס, סוג, חשבון, תאריכים, חיפוש
3. **הגדרות מערכת הנתונים החיצוניים** (🌐): רענון נתונים, ספקי נתונים, cache, batch processing
4. **סולמות צבעים** (🎨): צבעים לערכים מספריים וישויות
5. **הגדרות ניהול קונסול** (🖥️): ניקוי אוטומטי, הסתרת הודעות

#### **פונקציונליות:**
- **כפתור ראשי**: פתיחה/סגירה של כל הסקשנים בלחיצה אחת
- **כפתורי סקשן**: פתיחה/סגירה של סקשן ספציפי
- **אנימציות חלקות**: מעברים עם CSS transitions
- **זיכרון מצב**: כל סקשן זוכר את מצבו (פתוח/סגור)

#### **מימוש טכני:**
```javascript
// פתיחה/סגירה של סקשן ספציפי
function togglePreferenceSection(sectionId)

// פתיחה/סגירה של כל הסקשנים
function toggleAllPreferenceSections()
```

## היסטוריית גרסאות

### v1.3.3 (ספטמבר 2025) ✅ **הגרסה הנוכחית**
- **שיפור ממשק משתמש**: הוספת כפתורי פתיחה/סגירה לכל סקשן
- **ארגון מחדש**: חלוקה לסקשנים נפרדים: הגדרות בסיסיות, פילטרים, נתונים חיצוניים, צבעים, קונסול
- **כפתור ראשי**: פתיחה/סגירה של כל הסקשנים בלחיצה אחת
- **עיצוב מתקדם**: סגנונות CSS עם אנימציות חלקות ו-gradients
- **נגישות משופרת**: ממשק מאורגן וקל לניווט

### v1.3.2 (ספטמבר 2025)
- **תיקון קריטי**: פתרון בעיית שמירת שינויים בעמוד העדפות
- שיפור מערכת Cache: מעבר מ-`@cache_for` ל-`@cache_with_deps` עם dependency management
- תיקון JavaScript: הוספת רענון אוטומטי של ממשק אחרי שמירה מוצלחת
- שיפור חוויית משתמש: השינויים מוצגים מיד אחרי שמירה
- עדכון דוקומנטציה טכנית מלאה

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
