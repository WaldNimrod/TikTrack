# מערכת העדפות - דוקומנטציה מרכזית מלאה
## Preferences System - Complete Central Documentation

> **גרסה 1.0** - מערכת העדפות גמישה ומתקדמת

---

## 🎯 מדריך מהיר למפתחים

### איך להשתמש במערכת בצורה אופטימלית:

1. **קריאת העדפות** - השתמש ב-`PreferencesService.get_preference()` עם cache
2. **שמירת העדפות** - השתמש ב-`PreferencesService.save_user_preferences()` 
3. **ניהול פרופילים** - השתמש ב-`PreferencesService.get_profiles()` ו-`create_profile()`
4. **אופטימיזציה** - העדפות נטענות פעם אחת ונשמרות ב-cache

### איך לעדכן את המערכת:

1. **הוספת הגדרה חדשה** - עדכן את `preference_types` table
2. **הוספת קבוצה חדשה** - עדכן את `preference_groups` table  
3. **שינוי מבנה** - עדכן את המודלים ב-`Backend/models/preferences.py`

---

## 📋 תוכן עניינים

- [מבנה בסיס הנתונים](#מבנה-בסיס-הנתונים)
- [פונקציות נגישות](#פונקציות-נגישות)
- [Cache Strategy](#cache-strategy)
- [API Endpoints](#api-endpoints)
- [Frontend JavaScript](#frontend-javascript)
- [ממשק ניהול](#ממשק-ניהול)
- [Error Handling](#error-handling)
- [דוגמאות שימוש](#דוגמאות-שימוש)
- [Migration Guide](#migration-guide)

---

## 🗄️ מבנה בסיס הנתונים

### 1. טבלת `preference_groups` (קבוצות העדפות)
```sql
CREATE TABLE preference_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**תכלית:** קבוצות לוגיות של העדפות (כללי, צבעים, פילטרים, וכו')

**דוגמאות:**
- `general` - הגדרות כלליות
- `colors` - צבעי ממשק
- `filters` - פילטרים ברירת מחדל
- `ui` - הגדרות ממשק משתמש
- `external_data` - נתונים חיצוניים
- `notifications` - התראות

---

### 2. טבלת `preference_types` (סוגי העדפות)
```sql
CREATE TABLE preference_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    data_type VARCHAR(20) NOT NULL,
    preference_name VARCHAR(100) NOT NULL,
    description TEXT,
    constraints TEXT,  -- JSON עם הגבלות ואימותים
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES preference_groups(id),
    UNIQUE(group_id, preference_name)
);
```

**תכלית:** הגדרת סוגי העדפות זמינים במערכת

**סוגי נתונים נתמכים:**
- `string` - מחרוזת
- `number` - מספר
- `boolean` - true/false
- `json` - מבנה JSON
- `color` - קוד צבע (#ffffff)
- `select` - רשימת אפשרויות

---

### 3. טבלת `preference_profiles` (פרופילים)
```sql
CREATE TABLE preference_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    profile_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_by INTEGER,
    last_used_at DATETIME,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, profile_name)
);
```

**תכלית:** פרופילי העדפות לכל משתמש

---

### 4. טבלת `user_preferences` (העדפות שמורות)
```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    preference_id INTEGER NOT NULL,
    saved_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES preference_profiles(id),
    FOREIGN KEY (preference_id) REFERENCES preference_types(id),
    UNIQUE(user_id, profile_id, preference_id)
);
```

**תכלית:** העדפות שמורות בפועל

---

## 🔧 פונקציות נגישות

### PreferencesService - פונקציות מרכזיות

#### **1. קריאת העדפה בודדת**
```python
@classmethod
def get_preference(cls, db: Session, user_id: int, preference_identifier: Union[str, int], 
                  profile_id: int = None, use_cache: bool = True):
    """
    קבלת העדפה בודדת
    
    Args:
        user_id: מזהה משתמש
        preference_identifier: שם העדפה (str) או מזהה (int)
        profile_id: מזהה פרופיל (אופציונלי - יבחר אוטומטית פרופיל פעיל)
        use_cache: האם להשתמש במטמון
    
    Returns:
        הערך של ההעדפה או None אם לא נמצאה
    """
```

#### **2. קריאת קבוצת העדפות**
```python
@classmethod
def get_group_preferences(cls, db: Session, user_id: int, group_name: str, 
                         profile_id: int = None, use_cache: bool = True):
    """
    קבלת כל ההעדפות בקבוצה
    
    Args:
        user_id: מזהה משתמש
        group_name: שם הקבוצה
        profile_id: מזהה פרופיל (אופציונלי)
        use_cache: האם להשתמש במטמון
    
    Returns:
        מילון עם כל ההעדפות בקבוצה
    """
```

#### **3. קריאת העדפות מרובות**
```python
@classmethod
def get_preferences_by_names(cls, db: Session, user_id: int, preference_names: List[str], 
                            profile_id: int = None, use_cache: bool = True):
    """
    קבלת העדפות מרובות לפי שמות
    
    Args:
        user_id: מזהה משתמש
        preference_names: רשימת שמות העדפות
        profile_id: מזהה פרופיל (אופציונלי)
        use_cache: האם להשתמש במטמון
    
    Returns:
        מילון עם העדפות שנמצאו
    """
```

#### **4. קריאת כל ההעדפות**
```python
@classmethod
def get_all_user_preferences(cls, db: Session, user_id: int, profile_id: int = None, 
                            use_cache: bool = True):
    """
    קבלת כל ההעדפות של משתמש
    
    Args:
        user_id: מזהה משתמש
        profile_id: מזהה פרופיל (אופציונלי)
        use_cache: האם להשתמש במטמון
    
    Returns:
        מילון עם כל ההעדפות
    """
```

---

## ⚡ Cache Strategy

### Cache Key Structure
```python
# Cache key format:
cache_key = f"preferences:{user_id}:{profile_id}:{preference_name}"

# או עבור קבוצות:
cache_key = f"preferences:{user_id}:{profile_id}:group:{group_name}"

# או עבור כל ההעדפות:
cache_key = f"preferences:{user_id}:{profile_id}:all"
```

### Cache Configuration
- **TTL**: 24 שעות (ארוך מאוד)
- **Strategy**: Per-user cache
- **Invalidation**: בעת שמירת העדפות
- **Storage**: In-memory או Redis

### Cache Invalidation
```python
def invalidate_user_cache(user_id: int, profile_id: int = None):
    """מחק מטמון של משתמש/פרופיל"""
    if profile_id:
        # מחק מטמון פרופיל ספציפי
        cache_pattern = f"preferences:{user_id}:{profile_id}:*"
    else:
        # מחק כל המטמון של המשתמש
        cache_pattern = f"preferences:{user_id}:*"
    
    cache.delete_pattern(cache_pattern)
```

---

## 🔌 API Endpoints

### העדפות משתמש
- `GET /api/v1/preferences/user` - קבלת העדפות משתמש
- `POST /api/v1/preferences/user` - שמירת העדפות משתמש

### ניהול פרופילים
- `GET /api/v1/preferences/profiles` - קבלת פרופילים
- `POST /api/v1/preferences/profiles/create` - יצירת פרופיל חדש
- `PUT /api/v1/preferences/profiles/{id}` - עדכון פרופיל
- `DELETE /api/v1/preferences/profiles/{id}` - מחיקת פרופיל

### ממשק ניהול (Admin)
- `GET /api/v1/preferences/admin/types` - קבלת סוגי העדפות
- `GET /api/v1/preferences/admin/groups` - קבלת קבוצות
- `GET /api/v1/preferences/admin/search` - חיפוש העדפות

---

## 🎨 Frontend JavaScript

### פונקציות נגישות
```javascript
// טעינת העדפה בודדת
window.getPreference(preference_name)

// טעינת קבוצת העדפות
window.getGroupPreferences(group_name)

// טעינת העדפות מרובות
window.getPreferencesByNames(preference_names)

// טעינת כל ההעדפות
window.getAllUserPreferences()
```

### פונקציות עיקריות
```javascript
// טעינת העדפות
window.loadPreferences()

// שמירת העדפות  
window.saveAllPreferences()

// ניהול פרופילים
window.createProfile()
window.loadProfiles()
window.loadProfile()
```

---

## 🛠️ ממשק ניהול

### תצוגת טבלה מלאה
- הצגת כל סוגי ההעדפות במערכת
- נתונים בזמן אמת
- אפשרות עריכה ישירה

### חיפוש העדפות
- בחירת משתמש (dropdown)
- בחירת פרופיל (dropdown - פעיל אחרי בחירת משתמש)
- בחירת קבוצת הגדרות (dropdown)
- הצגת נתונים מסוננים

---

## ❌ Error Handling

### Custom Exception Classes
```python
class PreferenceNotFoundError(Exception):
    """העדפה לא נמצאה"""
    def __init__(self, preference_identifier, user_id, profile_id=None):
        self.preference_identifier = preference_identifier
        self.user_id = user_id
        self.profile_id = profile_id
        super().__init__(f"העדפה '{preference_identifier}' לא נמצאה למשתמש {user_id}")

class UserNotFoundError(Exception):
    """משתמש לא נמצא"""
    def __init__(self, user_id):
        self.user_id = user_id
        super().__init__(f"משתמש {user_id} לא נמצא במערכת")

class ProfileNotFoundError(Exception):
    """פרופיל לא נמצא"""
    def __init__(self, user_id, profile_id=None):
        self.user_id = user_id
        self.profile_id = profile_id
        super().__init__(f"פרופיל לא נמצא למשתמש {user_id}")
```

### הודעות שגיאה מפורטות
- בעברית
- מידע על הבעיה המדויקת
- הצעות לפתרון
- קישור לדוקומנטציה

---

## 📝 דוגמאות שימוש

### Backend - Python
```python
from Backend.services.preferences_service import PreferencesService
from Backend.database import get_db

# קבלת העדפה בודדת
db = next(get_db())
timezone = PreferencesService.get_preference(db, user_id=1, preference_identifier="timezone")
print(f"אזור זמן: {timezone}")

# קבלת קבוצת צבעים
colors = PreferencesService.get_group_preferences(db, user_id=1, group_name="colors")
print(f"צבעים: {colors}")

# קבלת העדפות מרובות
preferences = PreferencesService.get_preferences_by_names(
    db, user_id=1, preference_names=["timezone", "defaultStopLoss", "primaryColor"]
)
print(f"העדפות: {preferences}")
```

### Frontend - JavaScript
```javascript
// קבלת העדפה בודדת
async function getTimezone() {
  try {
    const timezone = await window.getPreference('timezone');
    console.log('אזור זמן:', timezone);
    return timezone;
  } catch (error) {
    console.error('שגיאה בטעינת אזור זמן:', error.message);
    return 'Asia/Jerusalem'; // ברירת מחדל
  }
}

// קבלת קבוצת צבעים
async function getColors() {
  try {
    const colors = await window.getGroupPreferences('colors');
    applyColorsToUI(colors);
  } catch (error) {
    console.error('שגיאה בטעינת צבעים:', error.message);
    applyDefaultColors();
  }
}

// קבלת העדפות מרובות
async function getMultiplePreferences() {
  try {
    const preferences = await window.getPreferencesByNames([
      'timezone', 'defaultStopLoss', 'primaryColor'
    ]);
    console.log('העדפות:', preferences);
  } catch (error) {
    console.error('שגיאה בטעינת העדפות:', error.message);
  }
}
```

---

## 🔄 Migration Guide

### שלב 1: יצירת טבלאות חדשות
```sql
-- הרץ את ה-CREATE TABLE statements למעלה
```

### שלב 2: מילוי נתונים בסיסיים
```sql
-- הוסף קבוצות
INSERT INTO preference_groups (group_name, description) VALUES
('general', 'הגדרות כלליות'),
('colors', 'צבעי ממשק'),
('filters', 'פילטרים ברירת מחדל'),
('ui', 'הגדרות ממשק משתמש'),
('external_data', 'נתונים חיצוניים'),
('notifications', 'התראות');

-- הוסף סוגי העדפות
-- (ראה דוגמאות למעלה)
```

### שלב 3: העברת נתונים קיימים
```sql
-- העבר נתונים מ-user_preferences הישן לחדש
-- (script נפרד לפי הצורך)
```

### שלב 4: מחיקת טבלאות ישנות
```sql
-- DROP TABLE user_preferences_old;
-- DROP TABLE preference_profiles_old;
```

---

## 🚀 יתרונות המערכת החדשה

### ✅ גמישות
- הוספת העדפות חדשות ללא שינוי קוד
- סוגי נתונים מגוונים
- קבוצות לוגיות

### ✅ ביצועים
- אינדקסים מותאמים
- שאילתות יעילות
- Cache-friendly

### ✅ תחזוקה
- מבנה ברור ומובן
- קל להוסיף תכונות
- תמיכה ב-migrations

### ✅ אבטחה
- Validation ברמת בסיס הנתונים
- Constraints ו-foreign keys
- Audit trail עם timestamps

---

## 🔧 תחזוקה ועדכונים

### הוספת הגדרה חדשה
1. הוסף ל-`preference_groups` אם נדרש
2. הוסף ל-`preference_types` עם group_id
3. עדכן את ה-Frontend אם נדרש

### שינוי מבנה
1. עדכן את המודלים
2. צור migration script
3. עדכן את ה-API endpoints
4. בדוק תאימות עם Frontend

---

*עדכון אחרון: ינואר 2025 | גרסה 3.0*
