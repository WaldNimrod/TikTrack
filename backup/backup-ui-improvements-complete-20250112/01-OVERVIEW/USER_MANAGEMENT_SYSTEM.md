# מערכת ניהול משתמשים - TikTrack

> 📋 **אפיון מפורט**: [EXTERNAL_DATA_INTEGRATION_SPECIFICATION_v1.3.1.md](../EXTERNAL_DATA_INTEGRATION_SPECIFICATION_v1.3.1.md)

## סקירה כללית

מערכת ניהול המשתמשים של TikTrack מספקת תמיכה מלאה בניהול משתמשים עם fallback אוטומטי למשתמש ברירת מחדל. המערכת מוכנה למעבר לעבודה עם מספר משתמשים בעתיד.

## ארכיטקטורה

### שלב נוכחי (v1.0) - Fallback למשתמש ברירת מחדל

המערכת פועלת עם משתמש ברירת מחדל אחד:
- **משתמש ברירת מחדל**: nimrod (ID: 1)
- **Fallback אוטומטי**: כל הפונקציות חוזרות למשתמש ברירת מחדל אם לא נמצא משתמש אחר
- **העדפות**: נשמרות בבסיס הנתונים עם מיזוג ברירות מחדל

### שלב עתידי (v2.0) - מערכת משתמשים מלאה

- **אותנטיקציה**: מערכת login/logout
- **הרשאות**: ניהול הרשאות מתקדם
- **פרופילים**: פרופילי משתמש מלאים
- **העדפות אישיות**: העדפות נפרדות לכל משתמש

## מבנה בסיס הנתונים

### טבלת Users

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    is_default BOOLEAN NOT NULL DEFAULT 0,
    preferences TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);
```

### שדות מפתח

- **username**: שם משתמש ייחודי
- **email**: כתובת אימייל (אופציונלי)
- **first_name/last_name**: שם פרטי ומשפחה
- **is_active**: האם המשתמש פעיל
- **is_default**: האם זה משתמש ברירת מחדל
- **preferences**: העדפות JSON
- **created_at/updated_at**: תאריכי יצירה ועדכון

## שירות User (UserService)

### מיקום: `Backend/services/user_service.py`

#### פונקציות עיקריות

##### 1. ניהול משתמש ברירת מחדל

```python
@staticmethod
def get_default_user(db: Session) -> Optional[User]:
    """Get the default user from database"""

@staticmethod
def create_default_user(db: Session) -> User:
    """Create default user if not exists"""

@staticmethod
def ensure_default_user_exists(db: Session) -> User:
    """Ensure default user exists in database"""
```

##### 2. ניהול משתמשים

```python
@staticmethod
def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID with fallback to default user"""

@staticmethod
def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username with fallback to default user"""

@staticmethod
def get_all_users(db: Session) -> List[User]:
    """Get all users from database"""
```

##### 3. ניהול העדפות

```python
@staticmethod
def get_user_preferences(db: Session, user_id: int = None) -> Dict[str, Any]:
    """Get user preferences with fallback to default user"""

@staticmethod
def set_user_preferences(db: Session, preferences: Dict[str, Any], user_id: int = None) -> bool:
    """Set user preferences with fallback to default user"""

@staticmethod
def load_default_preferences() -> Dict[str, Any]:
    """Load default preferences from JSON file"""
```

##### 4. פונקציות עזר

```python
@staticmethod
def get_current_user_id() -> int:
    """Get current user ID (for now always returns default user ID)"""

@staticmethod
def validate_user_data(user_data: dict) -> Dict[str, Any]:
    """Validate user data"""
```

### קבועים

```python
DEFAULT_USER_ID: int = 1
DEFAULT_USERNAME: str = "nimrod"
```

## מודל User

### מיקום: `Backend/models/user.py`

#### שדות

```python
username = Column(String(50), unique=True, nullable=False)
email = Column(String(100), unique=True, nullable=True)
first_name = Column(String(50), nullable=False)
last_name = Column(String(50), nullable=False)
is_active = Column(Boolean, default=True, nullable=False)
is_default = Column(Boolean, default=False, nullable=False)
preferences = Column(Text, nullable=True)
created_at = Column(DateTime, default=datetime.utcnow)
updated_at = Column(DateTime, nullable=True)
```

#### פונקציות

```python
def get_preferences(self) -> Dict[str, Any]:
    """Get user preferences as dictionary"""

def set_preferences(self, preferences: Dict[str, Any]) -> None:
    """Set user preferences from dictionary"""

@property
def full_name(self) -> str:
    """Full name of the user"""

@property
def display_name(self) -> str:
    """Display name of the user"""
```

## API Users

### מיקום: `Backend/routes/api/users.py`

#### נתיבים

##### 1. קבלת משתמשים

```http
GET /api/users/
GET /api/users/<int:user_id>
GET /api/users/default
GET /api/users/current
```

##### 2. ניהול משתמשים

```http
POST /api/users/
PUT /api/users/<int:user_id>
DELETE /api/users/<int:user_id>
POST /api/users/ensure-default
```

#### דוגמאות תגובה

##### קבלת משתמש ברירת מחדל

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "nimrod",
    "email": "nimrod@tiktrack.com",
    "first_name": "Nimrod",
    "last_name": "User",
    "is_active": true,
    "is_default": true,
    "preferences": "{\"primaryCurrency\": \"USD\", \"defaultStopLoss\": 5, ...}",
    "created_at": "2025-08-30T03:08:37",
    "updated_at": null
  }
}
```

##### יצירת משתמש חדש

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "first_name": "New",
    "last_name": "User",
    "is_active": true,
    "is_default": false,
    "preferences": "{}",
    "created_at": "2025-08-30T06:45:00",
    "updated_at": null
  }
}
```

## API Preferences (מעודכן)

### מיקום: `Backend/routes/api/preferences.py`

#### שינויים עיקריים

1. **עבודה עם משתמשים**: במקום קובץ JSON
2. **Fallback אוטומטי**: למשתמש ברירת מחדל
3. **מיזוג העדפות**: עם ברירות מחדל

#### נתיבים

```http
GET /api/preferences/
POST /api/preferences/
PUT /api/preferences/<key>
POST /api/preferences/reset
```

#### דוגמאות

##### קבלת העדפות

```json
{
  "primaryCurrency": "USD",
  "defaultStopLoss": 5,
  "defaultTargetPrice": 10,
  "defaultCommission": 1.0,
  "consoleCleanupInterval": 60000,
  "timezone": "Asia/Jerusalem",
  "defaultStatusFilter": "open",
  "defaultTypeFilter": "swing",
  "defaultAccountFilter": "all",
  "defaultDateRangeFilter": "this_week",
  "defaultSearchFilter": ""
}
```

##### שמירת העדפות

```json
{
  "success": true,
  "message": "Preferences saved successfully"
}
```

## ברירות מחדל

### העדפות ברירת מחדל

```json
{
  "primaryCurrency": "USD",
  "defaultStopLoss": 5,
  "defaultTargetPrice": 10,
  "defaultCommission": 1.0,
  "consoleCleanupInterval": 60000,
  "timezone": "Asia/Jerusalem",
  "defaultStatusFilter": "open",
  "defaultTypeFilter": "swing",
  "defaultAccountFilter": "all",
  "defaultDateRangeFilter": "this_week",
  "defaultSearchFilter": ""
}
```

### מיקום ברירות מחדל

- **Backend**: `Backend/services/user_service.py` - `load_default_preferences()`
- **JSON File**: `Backend/trading-ui/config/preferences-v2.json`
- **Fallback**: Hardcoded values in `UserService`

## לוגיקת Fallback

### עקרון הפעולה

1. **בדיקת משתמש**: האם המשתמש המבוקש קיים?
2. **Fallback אוטומטי**: אם לא, חזרה למשתמש ברירת מחדל
3. **מיזוג העדפות**: העדפות משתמש + ברירות מחדל
4. **שמירה**: שמירת העדפות מיזוג בבסיס הנתונים

### דוגמה

```python
# אם משתמש 999 לא קיים
user = UserService.get_user_by_id(db, 999)
# יחזור אוטומטית למשתמש nimrod (ID: 1)

# אם העדפות לא קיימות
preferences = UserService.get_user_preferences(db, 999)
# יחזור ברירות מחדל + העדפות nimrod
```

## בדיקות ומעקב

### בדיקות API

```bash
# בדיקת משתמש ברירת מחדל
curl -s http://localhost:8080/api/users/default | jq

# בדיקת העדפות
curl -s http://localhost:8080/api/preferences/ | jq

# שמירת העדפות
curl -s -X POST http://localhost:8080/api/preferences/ \
  -H "Content-Type: application/json" \
  -d '{"preferences": {"defaultStopLoss": 15}}' | jq
```

### בדיקות בסיס נתונים

```sql
-- בדיקת משתמשים
SELECT * FROM users;

-- בדיקת משתמש ברירת מחדל
SELECT * FROM users WHERE is_default = 1;

-- בדיקת העדפות
SELECT id, username, preferences FROM users WHERE id = 1;
```

## אינטגרציה עם המערכת

### שימוש ב-Frontend

```javascript
// קבלת העדפות משתמש
fetch('/api/preferences/')
  .then(response => response.json())
  .then(preferences => {
    console.log('User preferences:', preferences);
  });

// שמירת העדפות
fetch('/api/preferences/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    preferences: { defaultStopLoss: 10 }
  })
});
```

### שימוש ב-Backend

```python
from services.user_service import UserService

# קבלת משתמש נוכחי
user = UserService.get_user_by_id(db, user_id)

# קבלת העדפות
preferences = UserService.get_user_preferences(db, user_id)

# שמירת העדפות
success = UserService.set_user_preferences(db, new_preferences, user_id)
```

## תכנון עתידי (v2.0)

### תכונות מתוכננות

1. **אותנטיקציה**
   - מערכת login/logout
   - ניהול sessions
   - JWT tokens

2. **הרשאות**
   - רמות הרשאה שונות
   - ניהול תפקידים
   - בקרת גישה

3. **פרופילים**
   - תמונות פרופיל
   - מידע אישי מורחב
   - הגדרות פרטיות

4. **העדפות מתקדמות**
   - העדפות לפי מודול
   - תבניות העדפות
   - ייצוא/ייבוא העדפות

### מבנה נתונים עתידי

```sql
-- טבלת הרשאות
CREATE TABLE user_permissions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    permission_name VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- טבלת sessions
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    session_token VARCHAR(255),
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## סיכום

מערכת ניהול המשתמשים של TikTrack מספקת:

✅ **שלב נוכחי (v1.0)**:
- Fallback אוטומטי למשתמש ברירת מחדל
- ניהול העדפות מלא
- API מלא לניהול משתמשים
- אינטגרציה מלאה עם המערכת

🔄 **שלב עתידי (v2.0)**:
- מערכת משתמשים מלאה
- אותנטיקציה והרשאות
- פרופילים מתקדמים
- העדפות מורכבות

המערכת מוכנה לשימוש מיידי ומתוכננת להרחבה עתידית.



