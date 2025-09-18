# מערכת העדפות - מדריך למפתחים
## Preferences System - Developer Guide

> **גרסה 3.0** - מערכת העדפות גמישה ומתקדמת

---

## 🎯 מדריך מהיר למפתחים

### איך להשתמש במערכת בצורה אופטימלית:

1. **קריאת העדפות** - השתמש ב-`PreferencesService.get_user_preferences()` עם cache
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
- [API Endpoints](#api-endpoints)
- [שירותי Backend](#שירותי-backend)
- [Frontend JavaScript](#frontend-javascript)
- [ממשק ניהול](#ממשק-ניהול)
- [אופטימיזציה](#אופטימיזציה)
- [דוגמאות שימוש](#דוגמאות-שימוש)

---

## 🗄️ מבנה בסיס הנתונים

### 1. טבלת `preference_types` (סוגי העדפות)
```sql
CREATE TABLE preference_types (
    id INTEGER PRIMARY KEY,
    group_id INTEGER NOT NULL,
    data_type VARCHAR(20) NOT NULL,  -- 'string', 'number', 'boolean', 'json'
    preference_name VARCHAR(100) NOT NULL,
    description TEXT,
    constraints TEXT,  -- JSON עם הגבלות
    FOREIGN KEY (group_id) REFERENCES preference_groups(id)
);
```

### 2. טבלת `preference_groups` (קבוצות העדפות)
```sql
CREATE TABLE preference_groups (
    id INTEGER PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    description TEXT
);
```

### 3. טבלת `preference_profiles` (פרופילים)
```sql
CREATE TABLE preference_profiles (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    profile_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_by INTEGER,
    last_used_at DATETIME,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. טבלת `user_preferences` (העדפות משתמש)
```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    preference_id INTEGER NOT NULL,  -- FK to preference_types
    saved_value TEXT NOT NULL,       -- ערך שמור בהתאם לסוג הנתון
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES preference_profiles(id),
    FOREIGN KEY (preference_id) REFERENCES preference_types(id)
);
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

## ⚙️ שירותי Backend

### PreferencesService
```python
class PreferencesService:
    @classmethod
    def get_user_preferences(cls, db: Session, user_id: int, profile_id: int = None)
    @classmethod  
    def save_user_preferences(cls, db: Session, user_id: int, preferences: dict, profile_id: int = None)
    @classmethod
    def get_profiles(cls, db: Session, user_id: int)
    @classmethod
    def create_profile(cls, db: Session, user_id: int, profile_name: str, is_default: bool = False)
```

---

## 🎨 Frontend JavaScript

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

## 🚀 אופטימיזציה

### Cache Strategy
- העדפות נטענות פעם אחת ונשמרות ב-cache
- רענון cache רק בעת שינוי
- Cache per user + profile

### Database Optimization
- אינדקסים על user_id, profile_id, preference_id
- Query optimization עם JOINs
- Batch operations לשמירה

---

## 📝 דוגמאות שימוש

### קריאת העדפות
```python
preferences = PreferencesService.get_user_preferences(db, user_id=1, profile_id=1)
timezone = preferences.get('general', {}).get('timezone', 'Asia/Jerusalem')
```

### שמירת העדפות
```python
new_preferences = {
    'general': {'timezone': 'America/New_York'},
    'colors': {'primaryColor': '#007bff'}
}
PreferencesService.save_user_preferences(db, user_id=1, preferences=new_preferences)
```

### יצירת פרופיל
```python
profile = PreferencesService.create_profile(
    db, 
    user_id=1, 
    profile_name="פרופיל עבודה",
    is_default=False
)
```

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