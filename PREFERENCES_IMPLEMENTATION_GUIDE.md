# מדריך יישום מערכת העדפות
## TikTrack Preferences System - Implementation Guide

**תאריך יצירה:** 11 בספטמבר 2025  
**גרסה:** 1.0  
**מטרה:** מדריך מפורט ליישום ותחזוקת מערכת העדפות

---

## 📋 **תוכן עניינים**

1. [התקנה ראשונית](#התקנה-ראשונית)
2. [הגדרת בסיס נתונים](#הגדרת-בסיס-נתונים)
3. [הגדרת Backend](#הגדרת-backend)
4. [הגדרת Frontend](#הגדרת-frontend)
5. [בדיקות ואימות](#בדיקות-ואימות)
6. [תחזוקה שוטפת](#תחזוקה-שוטפת)
7. [פתרון בעיות](#פתרון-בעיות)
8. [עדכונים ושיפורים](#עדכונים-ושיפורים)

---

## 🚀 **התקנה ראשונית**

### **דרישות מערכת:**
- Python 3.8+
- SQLite3
- Flask
- JavaScript ES6+

### **שלבי התקנה:**

#### **1. הכנת סביבת עבודה:**
```bash
# יצירת תיקיית פרויקט
mkdir tiktrack-preferences
cd tiktrack-preferences

# יצירת סביבה וירטואלית
python -m venv venv
source venv/bin/activate  # Linux/Mac
# או
venv\Scripts\activate     # Windows

# התקנת חבילות
pip install flask sqlalchemy
```

#### **2. העתקת קבצים:**
```bash
# העתקת קבצי המערכת
cp -r trading-ui/ ./
cp -r Backend/ ./
```

---

## 🗄️ **הגדרת בסיס נתונים**

### **יצירת טבלאות:**

#### **1. טבלת הגדרות משתמש:**
```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    profile_name VARCHAR(100) DEFAULT 'ברירת מחדל',
    preferences_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2. טבלת פרופילים:**
```sql
CREATE TABLE preference_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **3. טבלת היסטוריה:**
```sql
CREATE TABLE preference_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    profile_id INTEGER,
    change_type VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **הכנסת נתונים ראשוניים:**
```sql
-- יצירת פרופיל ברירת מחדל
INSERT INTO preference_profiles (user_id, name, description, is_default) 
VALUES (1, 'ברירת מחדל', 'פרופיל ברירת מחדל', TRUE);

-- הגדרות ברירת מחדל
INSERT INTO user_preferences (user_id, profile_name, preferences_json) 
VALUES (1, 'ברירת מחדל', '{"currency": "USD", "timezone": "UTC"}');
```

---

## ⚙️ **הגדרת Backend**

### **1. יצירת מודל SQLAlchemy:**

```python
# Backend/models/user_preferences.py
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class UserPreferences(Base):
    __tablename__ = 'user_preferences'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    profile_name = Column(String(100), default='ברירת מחדל')
    preferences_json = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PreferenceProfile(Base):
    __tablename__ = 'preference_profiles'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PreferenceHistory(Base):
    __tablename__ = 'preference_history'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    profile_id = Column(Integer)
    change_type = Column(String(50))
    old_value = Column(Text)
    new_value = Column(Text)
    changed_at = Column(DateTime, default=datetime.utcnow)
```

### **2. יצירת שירות עסקי:**

```python
# Backend/services/preferences_service.py
import json
from sqlalchemy.orm import sessionmaker
from models.user_preferences import UserPreferences, PreferenceProfile, PreferenceHistory

class PreferencesService:
    def __init__(self, db_session):
        self.db = db_session
    
    def get_user_preferences(self, user_id, profile_name=None):
        """קבלת הגדרות משתמש"""
        query = self.db.query(UserPreferences).filter(UserPreferences.user_id == user_id)
        
        if profile_name:
            query = query.filter(UserPreferences.profile_name == profile_name)
        else:
            # קבלת פרופיל ברירת מחדל
            default_profile = self.db.query(PreferenceProfile).filter(
                PreferenceProfile.user_id == user_id,
                PreferenceProfile.is_default == True
            ).first()
            
            if default_profile:
                query = query.filter(UserPreferences.profile_name == default_profile.name)
        
        preferences = query.first()
        if preferences:
            return json.loads(preferences.preferences_json)
        return {}
    
    def update_user_preferences(self, user_id, preferences_data, profile_name=None):
        """עדכון הגדרות משתמש"""
        # לוגיקה לעדכון הגדרות
        pass
    
    def create_profile(self, user_id, name, description=""):
        """יצירת פרופיל חדש"""
        # לוגיקה ליצירת פרופיל
        pass
```

### **3. יצירת API endpoints:**

```python
# Backend/routes/api/preferences.py
from flask import Blueprint, request, jsonify
from services.preferences_service import PreferencesService

preferences_bp = Blueprint('preferences', __name__, url_prefix='/api/preferences')

@preferences_bp.route('/', methods=['GET'])
def get_preferences():
    """קבלת הגדרות משתמש"""
    user_id = request.args.get('user_id', 1)
    profile_name = request.args.get('profile')
    
    service = PreferencesService(db_session)
    preferences = service.get_user_preferences(user_id, profile_name)
    
    return jsonify({
        'success': True,
        'data': {
            'preferences': preferences,
            'user_id': user_id,
            'profile': profile_name
        }
    })

@preferences_bp.route('/', methods=['POST'])
def update_preferences():
    """עדכון הגדרות משתמש"""
    data = request.get_json()
    user_id = data.get('user_id', 1)
    preferences = data.get('preferences', {})
    profile_name = data.get('profile')
    
    service = PreferencesService(db_session)
    result = service.update_user_preferences(user_id, preferences, profile_name)
    
    return jsonify({
        'success': True,
        'message': 'הגדרות עודכנו בהצלחה',
        'data': result
    })
```

---

## 🎨 **הגדרת Frontend**

### **1. הכנת HTML:**

```html
<!-- trading-ui/preferences.html -->
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>העדפות - TikTrack</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="styles/preferences.css">
</head>
<body>
    <div class="preferences-container">
        <!-- תוכן המערכת -->
    </div>
    
    <!-- JavaScript -->
    <script src="scripts/preferences.js"></script>
</body>
</html>
```

### **2. הכנת JavaScript:**

```javascript
// trading-ui/scripts/preferences.js
class Preferences {
    constructor() {
        this.currentProfile = null;
        this.preferences = {};
        this.isInitialized = false;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        // טעינת הגדרות
        await this.loadPreferences();
        
        // הגדרת event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
    }
    
    async loadPreferences() {
        try {
            const response = await fetch('/api/preferences/');
            const data = await response.json();
            
            if (data.success) {
                this.preferences = data.data.preferences;
                this.updateUI();
            }
        } catch (error) {
            console.error('שגיאה בטעינת הגדרות:', error);
        }
    }
    
    async savePreferences() {
        try {
            const response = await fetch('/api/preferences/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    preferences: this.preferences
                })
            });
            
            const data = await response.json();
            if (data.success) {
                this.showNotification('הגדרות נשמרו בהצלחה', 'success');
            }
        } catch (error) {
            console.error('שגיאה בשמירת הגדרות:', error);
            this.showNotification('שגיאה בשמירת הגדרות', 'error');
        }
    }
}

// אתחול המערכת
document.addEventListener('DOMContentLoaded', function() {
    window.preferences = new Preferences();
    window.preferences.init();
});
```

---

## ✅ **בדיקות ואימות**

### **1. בדיקות Backend:**

```python
# test_preferences_backend.py
import unittest
from services.preferences_service import PreferencesService

class TestPreferencesService(unittest.TestCase):
    def setUp(self):
        # הגדרת בדיקות
        pass
    
    def test_get_user_preferences(self):
        """בדיקת קבלת הגדרות משתמש"""
        service = PreferencesService(db_session)
        preferences = service.get_user_preferences(1)
        self.assertIsInstance(preferences, dict)
    
    def test_update_user_preferences(self):
        """בדיקת עדכון הגדרות משתמש"""
        service = PreferencesService(db_session)
        result = service.update_user_preferences(1, {'currency': 'USD'})
        self.assertTrue(result)
```

### **2. בדיקות Frontend:**

```javascript
// test_preferences_frontend.js
describe('Preferences System', function() {
    beforeEach(function() {
        // הגדרת בדיקות
    });
    
    it('should load preferences on init', async function() {
        const preferences = new Preferences();
        await preferences.init();
        expect(preferences.isInitialized).toBe(true);
    });
    
    it('should save preferences', async function() {
        const preferences = new Preferences();
        preferences.preferences = {'currency': 'USD'};
        const result = await preferences.savePreferences();
        expect(result).toBe(true);
    });
});
```

### **3. בדיקות אינטגרציה:**

```bash
# בדיקת API endpoints
curl -X GET http://localhost:8080/api/preferences/
curl -X POST http://localhost:8080/api/preferences/ -d '{"preferences": {"currency": "USD"}}'

# בדיקת ממשק משתמש
open http://localhost:8080/preferences.html
```

---

## 🔧 **תחזוקה שוטפת**

### **1. גיבוי יומי:**

```bash
#!/bin/bash
# backup_preferences.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/preferences_$DATE"

mkdir -p $BACKUP_DIR

# גיבוי בסיס נתונים
sqlite3 simpleTrade_new.db ".backup $BACKUP_DIR/preferences.db"

# גיבוי קבצי הגדרות
cp Backend/config/preferences_defaults.json $BACKUP_DIR/

echo "גיבוי הושלם: $BACKUP_DIR"
```

### **2. ניטור ביצועים:**

```python
# monitor_preferences.py
import time
import psutil
from services.preferences_service import PreferencesService

def monitor_performance():
    """ניטור ביצועי מערכת העדפות"""
    start_time = time.time()
    
    # בדיקת זמני תגובה
    service = PreferencesService(db_session)
    preferences = service.get_user_preferences(1)
    
    response_time = time.time() - start_time
    
    # בדיקת שימוש בזיכרון
    memory_usage = psutil.Process().memory_info().rss / 1024 / 1024
    
    print(f"זמן תגובה: {response_time:.3f} שניות")
    print(f"שימוש בזיכרון: {memory_usage:.2f} MB")
```

### **3. ניקוי נתונים:**

```sql
-- ניקוי היסטוריה ישנה (מעל 30 יום)
DELETE FROM preference_history 
WHERE changed_at < datetime('now', '-30 days');

-- ניקוי פרופילים לא בשימוש
DELETE FROM preference_profiles 
WHERE id NOT IN (
    SELECT DISTINCT profile_id FROM user_preferences
);
```

---

## 🚨 **פתרון בעיות**

### **בעיות נפוצות:**

#### **1. שגיאות חיבור לבסיס נתונים:**
```python
# בדיקת חיבור
try:
    db_session.execute("SELECT 1")
    print("חיבור לבסיס נתונים תקין")
except Exception as e:
    print(f"שגיאת חיבור: {e}")
```

#### **2. שגיאות API:**
```javascript
// בדיקת זמינות API
fetch('/api/preferences/')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log('API תקין:', data))
    .catch(error => console.error('שגיאת API:', error));
```

#### **3. בעיות ביצועים:**
```python
# אופטימיזציה של שאילתות
# הוספת אינדקסים
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_preference_profiles_user_id ON preference_profiles(user_id);
```

### **לוגים ודיבוג:**

```python
# הגדרת לוגים
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('preferences.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('preferences')
```

---

## 🔄 **עדכונים ושיפורים**

### **1. עדכון גרסה:**

```bash
# גיבוי לפני עדכון
./backup_preferences.sh

# עדכון קבצים
git pull origin main

# הפעלת מיגרציות
python migrate_preferences.py

# בדיקת תקינות
python test_preferences_system.py
```

### **2. הוספת תכונות חדשות:**

```python
# הוספת הגדרה חדשה
def add_new_preference(preference_key, default_value):
    """הוספת הגדרה חדשה למערכת"""
    # עדכון ברירות מחדל
    with open('Backend/config/preferences_defaults.json', 'r') as f:
        defaults = json.load(f)
    
    defaults[preference_key] = default_value
    
    with open('Backend/config/preferences_defaults.json', 'w') as f:
        json.dump(defaults, f, indent=2)
    
    # עדכון UI
    update_preferences_ui(preference_key)
```

### **3. אופטימיזציות:**

```python
# Cache להגדרות
from functools import lru_cache

@lru_cache(maxsize=128)
def get_cached_preferences(user_id, profile_name):
    """Cache להגדרות משתמש"""
    service = PreferencesService(db_session)
    return service.get_user_preferences(user_id, profile_name)
```

---

## 📞 **תמיכה ועזרה**

### **מקורות מידע:**
- **דוקומנטציה מרכזית** - `PREFERENCES_SYSTEM_DOCUMENTATION.md`
- **מדריך זה** - `PREFERENCES_IMPLEMENTATION_GUIDE.md`
- **קבצי דוגמה** - `Backend/config/preferences_defaults.json`

### **צור קשר:**
- **צוות פיתוח** - TikTrack Development Team
- **תאריך עדכון אחרון** - 11 בספטמבר 2025
- **גרסה נוכחית** - 1.0

---

*מדריך זה מספק הוראות מפורטות ליישום ותחזוקת מערכת העדפות TikTrack.*
