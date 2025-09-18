# API Reference - מערכת העדפות
## API Reference - Preferences System

> **גרסה 3.0** - API מלא ומתקדם

---

## 🎯 סקירה כללית

מערכת העדפות מספקת API מקיף לניהול העדפות משתמשים, פרופילים, וסוגי העדפות.

**Base URL:** `/api/v1/preferences`

---

## 📋 תוכן עניינים

- [העדפות משתמש](#העדפות-משתמש)
- [ניהול פרופילים](#ניהול-פרופילים)
- [ממשק ניהול](#ממשק-ניהול)
- [קודי שגיאה](#קודי-שגיאה)
- [דוגמאות](#דוגמאות)

---

## 👤 העדפות משתמש

### GET /api/v1/preferences/user

קבלת העדפות משתמש נוכחי.

**Parameters:**
- `profile_id` (optional) - מזהה פרופיל ספציפי

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "general": {
        "timezone": "Asia/Jerusalem",
        "defaultStopLoss": 5.0
      },
      "colors": {
        "primaryColor": "#007bff",
        "entityTickerColor": "#dc3545"
      }
    },
    "profiles": [
      {
        "id": 1,
        "name": "ברירת מחדל",
        "isDefault": true,
        "isActive": true,
        "description": "פרופיל ברירת מחדל",
        "createdAt": "2025-01-07T10:00:00Z",
        "lastUsedAt": "2025-01-07T15:30:00Z",
        "usageCount": 25
      }
    ],
    "currentProfile": {
      "id": 1,
      "name": "ברירת מחדל"
    }
  },
  "timestamp": "2025-01-07T21:55:00Z"
}
```

### POST /api/v1/preferences/user

שמירת העדפות משתמש.

**Request Body:**
```json
{
  "preferences": {
    "general": {
      "timezone": "America/New_York",
      "defaultStopLoss": 8.5
    },
    "colors": {
      "primaryColor": "#00ff00",
      "entityTickerColor": "#ff0000"
    }
  },
  "profile_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "העדפות נשמרו בהצלחה",
  "data": {
    "savedCount": 15,
    "updatedCount": 3,
    "newCount": 12
  },
  "timestamp": "2025-01-07T21:55:00Z"
}
```

---

## 👥 ניהול פרופילים

### GET /api/v1/preferences/profiles

קבלת פרופילים של משתמש נוכחי.

**Response:**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": 1,
        "name": "ברירת מחדל",
        "isDefault": true,
        "isActive": true,
        "description": "פרופיל ברירת מחדל",
        "createdAt": "2025-01-07T10:00:00Z",
        "lastUsedAt": "2025-01-07T15:30:00Z",
        "usageCount": 25
      },
      {
        "id": 2,
        "name": "פרופיל עבודה",
        "isDefault": false,
        "isActive": true,
        "description": "הגדרות לעבודה",
        "createdAt": "2025-01-07T11:00:00Z",
        "lastUsedAt": "2025-01-07T14:20:00Z",
        "usageCount": 8
      }
    ]
  },
  "timestamp": "2025-01-07T21:55:00Z"
}
```

### POST /api/v1/preferences/profiles/create

יצירת פרופיל חדש.

**Request Body:**
```json
{
  "profile_name": "פרופיל חדש",
  "description": "תיאור הפרופיל",
  "is_default": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "פרופיל נוצר בהצלחה",
  "data": {
    "profile": {
      "id": 3,
      "name": "פרופיל חדש",
      "isDefault": false,
      "isActive": true,
      "description": "תיאור הפרופיל",
      "createdAt": "2025-01-07T21:55:00Z",
      "usageCount": 0
    }
  },
  "timestamp": "2025-01-07T21:55:00Z"
}
```

### PUT /api/v1/preferences/profiles/{id}

עדכון פרופיל קיים.

**Request Body:**
```json
{
  "profile_name": "שם מעודכן",
  "description": "תיאור מעודכן",
  "is_default": true
}
```

### DELETE /api/v1/preferences/profiles/{id}

מחיקת פרופיל.

**Response:**
```json
{
  "success": true,
  "message": "פרופיל נמחק בהצלחה",
  "timestamp": "2025-01-07T21:55:00Z"
}
```

---

## 🛠️ ממשק ניהול

### GET /api/v1/preferences/admin/types

קבלת כל סוגי ההעדפות במערכת.

**Response:**
```json
{
  "success": true,
  "data": {
    "types": [
      {
        "id": 1,
        "group_id": 1,
        "group_name": "general",
        "data_type": "string",
        "preference_name": "timezone",
        "description": "אזור זמן של המשתמש",
        "constraints": {
          "options": ["Asia/Jerusalem", "America/New_York"]
        },
        "default_value": "Asia/Jerusalem",
        "is_required": true,
        "is_active": true
      }
    ]
  },
  "timestamp": "2025-01-07T21:55:00Z"
}
```

### GET /api/v1/preferences/admin/groups

קבלת כל קבוצות ההעדפות.

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": 1,
        "group_name": "general",
        "description": "הגדרות כלליות"
      },
      {
        "id": 2,
        "group_name": "colors",
        "description": "צבעי ממשק"
      }
    ]
  },
  "timestamp": "2025-01-07T21:55:00Z"
}
```

### GET /api/v1/preferences/admin/search

חיפוש העדפות עם פילטרים.

**Parameters:**
- `user_id` (optional) - מזהה משתמש
- `profile_id` (optional) - מזהה פרופיל
- `group_id` (optional) - מזהה קבוצה

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": [
      {
        "user_id": 1,
        "profile_id": 1,
        "profile_name": "ברירת מחדל",
        "preference_name": "timezone",
        "group_name": "general",
        "saved_value": "Asia/Jerusalem",
        "data_type": "string",
        "updated_at": "2025-01-07T15:30:00Z"
      }
    ],
    "filters": {
      "user_id": 1,
      "profile_id": 1,
      "group_id": 1
    }
  },
  "timestamp": "2025-01-07T21:55:00Z"
}
```

---

## ❌ קודי שגיאה

### 400 Bad Request
```json
{
  "success": false,
  "error": "validation_error",
  "message": "נתונים לא תקינים",
  "details": {
    "timezone": "ערך לא חוקי",
    "defaultStopLoss": "חייב להיות מספר בין 0 ל-100"
  },
  "timestamp": "2025-01-07T21:55:00Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "not_found",
  "message": "פרופיל לא נמצא",
  "timestamp": "2025-01-07T21:55:00Z"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "conflict",
  "message": "פרופיל עם השם הזה כבר קיים",
  "timestamp": "2025-01-07T21:55:00Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "internal_error",
  "message": "שגיאה פנימית בשרת",
  "timestamp": "2025-01-07T21:55:00Z"
}
```

---

## 📝 דוגמאות שימוש

### JavaScript - טעינת העדפות
```javascript
async function loadPreferences() {
  try {
    const response = await fetch('/api/v1/preferences/user');
    const result = await response.json();
    
    if (result.success) {
      const preferences = result.data.preferences;
      console.log('העדפות נטענו:', preferences);
      return preferences;
    } else {
      console.error('שגיאה בטעינה:', result.message);
    }
  } catch (error) {
    console.error('שגיאת רשת:', error);
  }
}
```

### JavaScript - שמירת העדפות
```javascript
async function savePreferences(preferences, profileId = null) {
  try {
    const response = await fetch('/api/v1/preferences/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        preferences: preferences,
        profile_id: profileId
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('העדפות נשמרו:', result.message);
      return true;
    } else {
      console.error('שגיאה בשמירה:', result.message);
      return false;
    }
  } catch (error) {
    console.error('שגיאת רשת:', error);
    return false;
  }
}
```

### Python - שימוש ב-Backend
```python
from Backend.services.preferences_service import PreferencesService
from Backend.database import get_db

# קבלת העדפות
db = next(get_db())
preferences = PreferencesService.get_user_preferences(db, user_id=1, profile_id=1)
print(f"אזור זמן: {preferences.get('general', {}).get('timezone')}")

# שמירת העדפות
new_preferences = {
    'general': {'timezone': 'America/New_York'},
    'colors': {'primaryColor': '#007bff'}
}
PreferencesService.save_user_preferences(db, user_id=1, preferences=new_preferences, profile_id=1)
```

---

## 🔧 Headers נדרשים

### Content-Type
```
Content-Type: application/json
```

### Authentication (עתידי)
```
Authorization: Bearer <token>
```

---

## 📊 Rate Limiting

- **GET requests:** 100 requests/minute
- **POST/PUT/DELETE:** 20 requests/minute
- **Admin endpoints:** 10 requests/minute

---

*עדכון אחרון: ינואר 2025 | גרסה 3.0*
