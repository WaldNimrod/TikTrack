# מערכת העדפות היברידית - אפיון מפורט

## 📅 תאריך יצירה
15 בינואר 2025

## 🎯 מטרת המסמך
מסמך זה מפרט את הארכיטקטורה החדשה למערכת העדפות היברידית של TikTrack, המשלבת בסיס נתונים עם קבצי JSON לביצועים מיטביים.

---

## ⚠️ **הערה חשובה על התפתחות המערכת**

**מערכת העדפות V2 הפכה למערכת העדפות הגנרית**

המערכת הנוכחית התפתחה ממערכת "V2" למערכת העדפות גנרית ומובילה. התהליך כלל:

1. **שלב V1** - מערכת בסיסית (הוסרה לחלוטין)
2. **שלב V2** - מערכת מתקדמת עם פרופילים מרובים
3. **שלב נוכחי** - מערכת העדפות גנרית (לשעבר V2)

**כל ההפניות ל-V2 הוסרו מהקוד והממשק** כדי לפשט את המערכת ולהפוך אותה לגנרית יותר.

---

## 📋 תוכן עניינים
1. [סקירה כללית](#סקירה-כללית)
2. [בעיות המערכת הנוכחית](#בעיות-המערכת-הנוכחית)
3. [ארכיטקטורה חדשה](#ארכיטקטורה-חדשה)
4. [מבנה בסיס הנתונים](#מבנה-בסיס-הנתונים)
5. [מבנה הקבצים](#מבנה-הקבצים)
6. [תהליכי המערכת](#תהליכי-המערכת)
7. [שלבי פיתוח](#שלבי-פיתוח)
8. [דוגמאות קוד](#דוגמאות-קוד)
9. [הדרכה טכנית](#הדרכה-טכנית)
10. [קישורים לדוקומנטציה](#קישורים-לדוקומנטציה)

---

## 🔍 סקירה כללית

### רקע
מערכת ההעדפות הנוכחית של TikTrack סובלת מקשיחות מובנית ומורכבות יתר. כל הוספת העדפה חדשה דורשת שינויים בכמה קבצים, מה שהופך את התחזוקה לקשה ולא יעילה.

### הפתרון המוצע
ארכיטקטורה היברידית המשלבת:
- **בסיס נתונים** כמקור אמת לניהול העדפות
- **קבצי JSON** לביצועים מיטביים בזמן ריצה
- **מערכת fallback** אוטומטית לכל העדפה

### יתרונות מרכזיים
- ⚡ **ביצועים מעולים** - טעינה מהירה מקבצים
- 🔧 **גמישות מלאה** - ניהול דינמי בבסיס נתונים
- 🛡️ **אמינות גבוהה** - מקור אמת + fallback
- 📈 **Scalability** - מוכן לעתיד ולמשתמשים מרובים

---

## ❌ בעיות המערכת הנוכחית

### 1. קשיחות מובנית
- כל העדפה דורשת שינוי ב-4-5 קבצים שונים
- מודל SQLAlchemy עם עמודות קבועות
- API endpoints ספציפיים לכל העדפה
- JavaScript functions נפרדות לכל סוג העדפה

### 2. כפילות מיותרת
- ברירות מחדל מוגדרות במודל, ב-API, וב-JavaScript
- קוד דומה חוזר על עצמו במקומות רבים
- לוגיקת fallback מפוזרת בכל מקום

### 3. מורכבות יתר
כל הוספת העדפה חדשה דורשת:
- עדכון מודל SQLAlchemy
- הוספת עמודה חדשה
- עדכון API endpoints
- הוספת פונקציות JavaScript
- עדכון עמוד ההעדפות

### 4. חוסר גמישות
- לא ניתן להוסיף העדפות דינמיות
- סוגי ערכים מוגבלים (רק מה שמוגדר במודל)
- לא ניתן לארגן העדפות בקטגוריות

---

## 🏗️ ארכיטקטורה חדשה

### עקרונות יסוד

#### 1. הפרדת אחריות
- **בסיס נתונים** - מקור אמת, ניהול, היסטוריה
- **קבצי JSON** - ביצועים, cache, fallback
- **API** - ממשק פשוט ואחיד
- **Frontend** - JavaScript מינימלי

#### 2. תהליך העבודה
```
משתמש נכנס → טעינת קובץ JSON → העדפות זמינות מיידית
משתמש שומר → עדכון DB → יצירת קובץ חדש → עדכון cache
מנהל משנה מבנה → עדכון DB → יצירת קבצים לכל המשתמשים
```

#### 3. מבנה היברידי
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   בסיס נתונים    │◄──►│   קבצי JSON      │◄──►│   Frontend      │
│   (מקור אמת)     │    │   (ביצועים)      │    │   (ממשק)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🗄️ מבנה בסיס הנתונים

### טבלה 1: preference_definitions
הגדרות העדפות - מה כל העדפה עושה ואיך להשתמש בה

```sql
CREATE TABLE preference_definitions (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    value_type VARCHAR(20) NOT NULL, -- string, number, boolean, object, array
    default_value TEXT NOT NULL,
    validation_rules JSON, -- כללי validation
    is_required BOOLEAN DEFAULT FALSE,
    is_user_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### טבלה 2: preference_defaults
ברירות מחדל עם versioning

```sql
CREATE TABLE preference_defaults (
    id SERIAL PRIMARY KEY,
    preference_key VARCHAR(100) REFERENCES preference_definitions(key),
    default_value TEXT NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### טבלה 3: user_preferences
העדפות משתמשים

```sql
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    preference_key VARCHAR(100) REFERENCES preference_definitions(key),
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, preference_key)
);
```

### טבלה 4: preference_history
היסטוריה של שינויים

```sql
CREATE TABLE preference_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    preference_key VARCHAR(100) REFERENCES preference_definitions(key),
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER REFERENCES users(id),
    change_reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📁 מבנה הקבצים

### קובץ משתמש: preferences_user_{id}.json
```json
{
  "metadata": {
    "user_id": 1,
    "last_updated": "2025-01-15T10:30:00Z",
    "version": "2.1.0",
    "file_size": 2048
  },
  "defaults": {
    "primary_currency": "USD",
    "timezone": "Asia/Jerusalem",
    "default_stop_loss": 5.0,
    "default_target_price": 10.0,
    "default_commission": 1.0
  },
  "fallback": {
    "string": "",
    "number": 0,
    "boolean": false,
    "object": {},
    "array": []
  },
  "user_preferences": {
    "primary_currency": "ILS",
    "theme": "dark",
    "notifications_enabled": true,
    "numeric_value_colors": {
      "positive": {"light": "#d4edda", "medium": "#28a745"},
      "negative": {"light": "#f8d7da", "medium": "#dc3545"}
    }
  }
}
```

### קובץ גלובלי: preferences_global.json
```json
{
  "metadata": {
    "last_updated": "2025-01-15T10:30:00Z",
    "version": "2.1.0",
    "total_preferences": 45
  },
  "definitions": {
    "primary_currency": {
      "type": "string",
      "category": "basic",
      "required": true,
      "validation": ["USD", "ILS", "EUR", "GBP"],
      "display_name": "מטבע ראשי",
      "description": "המטבע הראשי של המשתמש"
    },
    "theme": {
      "type": "string",
      "category": "ui",
      "required": false,
      "validation": ["light", "dark", "auto"],
      "display_name": "ערכת נושא",
      "description": "ערכת הצבעים של הממשק"
    }
  },
  "defaults": {
    "primary_currency": "USD",
    "timezone": "Asia/Jerusalem",
    "theme": "light",
    "notifications_enabled": true
  }
}
```

### קובץ fallback: preferences_fallback.json
```json
{
  "metadata": {
    "version": "1.0.0",
    "description": "ערכי fallback לכל סוגי ההעדפות"
  },
  "fallback_values": {
    "string": "",
    "number": 0,
    "boolean": false,
    "object": {},
    "array": []
  },
  "error_handling": {
    "missing_preference": "use_default",
    "invalid_value": "use_fallback",
    "corrupted_file": "regenerate_from_db"
  }
}
```

---

## ⚙️ תהליכי המערכת

### תהליך 1: טעינת העדפות משתמש
```python
def load_user_preferences(user_id):
    """
    טעינת העדפות משתמש - קודם מהקובץ, אחר כך מבסיס הנתונים
    """
    # 1. ניסיון טעינה מהקובץ
    user_file = f"preferences_user_{user_id}.json"
    if os.path.exists(user_file):
        try:
            with open(user_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # בדיקת תקינות הקובץ
                if validate_preferences_file(data):
                    return data
        except Exception as e:
            logger.warning(f"Error loading preferences file for user {user_id}: {e}")
    
    # 2. אם הקובץ לא קיים או פגום - יצירה מבסיס הנתונים
    logger.info(f"Generating preferences file for user {user_id}")
    return generate_user_preferences_file(user_id)
```

### תהליך 2: שמירת העדפה
```python
def save_user_preference(user_id, key, value, category=None):
    """
    שמירת העדפה - עדכון DB + יצירת קובץ חדש
    """
    try:
        # 1. בדיקת תקינות הערך
        if not validate_preference_value(key, value):
            raise ValueError(f"Invalid value for preference {key}")
        
        # 2. עדכון בסיס נתונים
        db = get_db_session()
        update_database_preference(db, user_id, key, value, category)
        
        # 3. יצירת קובץ חדש
        generate_user_preferences_file(user_id)
        
        # 4. עדכון cache
        invalidate_user_cache(user_id)
        
        # 5. רישום בהיסטוריה
        log_preference_change(user_id, key, value)
        
        return True
        
    except Exception as e:
        logger.error(f"Error saving preference {key} for user {user_id}: {e}")
        return False
```

### תהליך 3: עדכון מבנה העדפות
```python
def update_preference_structure():
    """
    עדכון מבנה העדפות - יצירת קבצים חדשים לכל המשתמשים
    """
    try:
        # 1. עדכון בסיס נתונים
        update_database_structure()
        
        # 2. קבלת רשימת כל המשתמשים
        user_ids = get_all_user_ids()
        
        # 3. יצירת קבצים חדשים במקביל
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(generate_user_preferences_file, user_id) 
                for user_id in user_ids
            ]
            
            # המתנה לסיום כל המשימות
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    logger.error(f"Error generating preferences file: {e}")
        
        # 4. עדכון cache גלובלי
        invalidate_global_cache()
        
        # 5. עדכון קובץ גלובלי
        generate_global_preferences_file()
        
        logger.info(f"Updated preferences structure for {len(user_ids)} users")
        return True
        
    except Exception as e:
        logger.error(f"Error updating preference structure: {e}")
        return False
```

---

## 🚀 שלבי פיתוח

### שלב 1: הכנת בסיס הנתונים (שבוע 1)
**מטרה:** יצירת הטבלאות החדשות

**משימות:**
1. **יצירת migration script**
   - `Backend/migrations/create_preferences_tables.py`
   - יצירת 4 הטבלאות החדשות
   - הוספת indexes לביצועים

2. **העברת נתונים קיימים**
   - `Backend/migrations/migrate_existing_preferences.py`
   - העברת העדפות מהמודל הישן לחדש
   - יצירת הגדרות ברירת מחדל

3. **בדיקות**
   - בדיקת תקינות הנתונים
   - בדיקת ביצועים
   - בדיקת indexes

**קבצים ליצירה:**
- `Backend/migrations/create_preferences_tables.py`
- `Backend/migrations/migrate_existing_preferences.py`
- `Backend/models/preferences_new.py`

### שלב 2: יצירת השירותים (שבוע 2)
**מטרה:** פיתוח הלוגיקה העסקית

**משימות:**
1. **PreferencesService**
   - `Backend/services/preferences_service.py`
   - פונקציות CRUD בסיסיות
   - לוגיקת fallback

2. **PreferencesFileManager**
   - `Backend/services/preferences_file_manager.py`
   - ניהול קבצי JSON
   - יצירה ועדכון קבצים

3. **PreferencesValidator**
   - `Backend/services/preferences_validator.py`
   - בדיקת תקינות ערכים
   - validation rules

**קבצים ליצירה:**
- `Backend/services/preferences_service.py`
- `Backend/services/preferences_file_manager.py`
- `Backend/services/preferences_validator.py`

### שלב 3: עדכון API (שבוע 3)
**מטרה:** יצירת API פשוט ואחיד

**משימות:**
1. **API endpoints חדשים**
   - `Backend/routes/api/preferences_v2.py`
   - 3 endpoints פשוטים
   - error handling

2. **הסרת endpoints ישנים**
   - הסרת קוד מיותר
   - עדכון imports

3. **בדיקות API**
   - unit tests
   - integration tests
   - performance tests

**קבצים לעדכון:**
- `Backend/routes/api/preferences.py` (הסרה)
- `Backend/routes/api/preferences_v2.py` (חדש)
- `Backend/tests/test_preferences_api.py` (חדש)

### שלב 4: עדכון Frontend (שבוע 4)
**מטרה:** JavaScript פשוט ומינימלי

**משימות:**
1. **PreferencesManager**
   - `trading-ui/scripts/preferences-manager.js`
   - מחלקה אחת לכל ההעדפות
   - cache management

2. **עדכון עמוד העדפות**
   - `trading-ui/preferences-v2.html`
   - הסרת קוד מורכב
   - שימוש ב-PreferencesManager

3. **עדכון עמודים אחרים**
   - שימוש ב-PreferencesManager
   - הסרת פונקציות ישנות

**קבצים לעדכון:**
- `trading-ui/scripts/preferences-v2.js` (עדכון)
- `trading-ui/scripts/preferences-manager.js` (חדש)
- `trading-ui/preferences-v2.html` (עדכון)
- כל העמודים שמשתמשים בהעדפות

### שלב 5: ממשק ניהול (שבוע 5)
**מטרה:** כלי ניהול למנהלים

**משימות:**
1. **עמוד ניהול העדפות**
   - `trading-ui/preferences-admin.html`
   - רשימת העדפות
   - הוספה ועריכה

2. **כפתורי פעולה**
   - "עדכן קבצים"
   - "בדוק תקינות"
   - "גיבוי העדפות"

3. **דוחות וסטטיסטיקות**
   - שימוש בהעדפות
   - היסטוריה של שינויים

**קבצים ליצירה:**
- `trading-ui/preferences-admin.html`
- `trading-ui/scripts/preferences-admin.js`
- `trading-ui/styles/preferences-admin.css`

### שלב 6: בדיקות ואופטימיזציה (שבוע 6)
**מטרה:** וידוא איכות וביצועים

**משימות:**
1. **בדיקות מקיפות**
   - unit tests
   - integration tests
   - performance tests
   - load tests

2. **אופטימיזציה**
   - ביצועים
   - זיכרון
   - קבצים

3. **תיעוד**
   - API documentation
   - user guide
   - developer guide

**קבצים ליצירה:**
- `Backend/tests/test_preferences_complete.py`
- `documentation/PREFERENCES_USER_GUIDE.md`
- `documentation/PREFERENCES_DEVELOPER_GUIDE.md`

---

## 💻 דוגמאות קוד

### Backend - PreferencesService
```python
class PreferencesService:
    """שירות העדפות פשוט וגמיש"""
    
    @staticmethod
    def get_preference(db: Session, user_id: int, key: str, category: str = None):
        """קבלת העדפה בודדת עם fallback אוטומטי"""
        try:
            # חיפוש העדפה של המשתמש
            pref = db.query(UserPreference).filter(
                UserPreference.user_id == user_id,
                UserPreference.key == key
            ).first()
            
            if pref:
                return PreferencesService._parse_value(pref.value, pref.value_type)
            
            # fallback לברירת מחדל
            default = PreferencesService._get_default(key, category)
            if default:
                return default['value']
            
            # fallback סופי לפי סוג
            return FALLBACK_VALUES.get(default.get('type', 'string'), '')
            
        except Exception as e:
            logger.error(f"Error getting preference {key}: {e}")
            return FALLBACK_VALUES.get('string', '')
    
    @staticmethod
    def set_preference(db: Session, user_id: int, key: str, value: Any, category: str = None):
        """הגדרת העדפה - פשוט וישיר"""
        try:
            # קביעת סוג הערך
            value_type = PreferencesService._detect_type(value)
            
            # חיפוש העדפה קיימת
            pref = db.query(UserPreference).filter(
                UserPreference.user_id == user_id,
                UserPreference.key == key
            ).first()
            
            if pref:
                # עדכון העדפה קיימת
                pref.value = json.dumps(value, ensure_ascii=False)
                pref.value_type = value_type
                pref.updated_at = datetime.utcnow()
            else:
                # יצירת העדפה חדשה
                pref = UserPreference(
                    user_id=user_id,
                    key=key,
                    value=json.dumps(value, ensure_ascii=False),
                    value_type=value_type,
                    category=category or 'basic'
                )
                db.add(pref)
            
            db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error setting preference {key}: {e}")
            db.rollback()
            return False
```

### Backend - API Endpoints
```python
@preferences_bp.route('/api/v2/preferences/', methods=['GET'])
def get_preferences():
    """קבלת כל ההעדפות - פשוט וישיר"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        preferences = PreferencesService.get_all_preferences(db, user_id)
        return jsonify(preferences)
        
    except Exception as e:
        logger.error(f"Error getting preferences: {e}")
        return jsonify(PreferencesService._get_all_defaults())

@preferences_bp.route('/api/v2/preferences/<key>', methods=['PUT'])
def set_preference(key: str):
    """הגדרת העדפה בודדת"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        data = request.json
        
        value = data.get('value')
        category = data.get('category')
        
        success = PreferencesService.set_preference(db, user_id, key, value, category)
        
        if success:
            return jsonify({'success': True, 'message': f'Preference {key} saved'})
        else:
            return jsonify({'success': False, 'message': 'Error saving preference'}), 500
            
    except Exception as e:
        logger.error(f"Error setting preference {key}: {e}")
        return jsonify({'success': False, 'message': 'Error saving preference'}), 500
```

### Frontend - PreferencesManager
```javascript
class PreferencesManager {
    constructor() {
        this.preferences = {};
        this.loaded = false;
        this.cache = new Map();
    }
    
    // טעינת העדפות
    async load() {
        try {
            const response = await fetch('/api/v2/preferences/');
            this.preferences = await response.json();
            this.loaded = true;
            
            // עדכון cache
            this.updateCache();
            
            return this.preferences;
        } catch (error) {
            console.error('Error loading preferences:', error);
            return {};
        }
    }
    
    // קבלת העדפה
    get(key, fallback = null) {
        if (!this.loaded) {
            console.warn('Preferences not loaded yet');
            return fallback;
        }
        
        // חיפוש ב-cache
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        // חיפוש בהעדפות
        const value = this.preferences[key] !== undefined ? this.preferences[key] : fallback;
        
        // עדכון cache
        this.cache.set(key, value);
        
        return value;
    }
    
    // הגדרת העדפה
    async set(key, value, category = null) {
        try {
            const response = await fetch(`/api/v2/preferences/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value, category })
            });
            
            if (response.ok) {
                this.preferences[key] = value;
                this.cache.set(key, value);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error setting preference:', error);
            return false;
        }
    }
    
    // עדכון cache
    updateCache() {
        this.cache.clear();
        for (const [key, value] of Object.entries(this.preferences)) {
            this.cache.set(key, value);
        }
    }
}

// יצירת instance גלובלי
window.preferencesManager = new PreferencesManager();

// פונקציות עזר פשוטות
window.getPreference = (key, fallback = null) => window.preferencesManager.get(key, fallback);
window.setPreference = (key, value, category = null) => window.preferencesManager.set(key, value, category);
```

---

## 📚 הדרכה טכנית

### התקנה והגדרה

#### 1. הכנת סביבת הפיתוח
```bash
# מעבר לתיקיית הפרויקט
cd /Users/nimrod/Documents/TikTrack/TikTrackApp

# הפעלת סביבה וירטואלית
source .venv/bin/activate

# התקנת dependencies חדשים (אם נדרש)
pip install -r requirements.txt
```

#### 2. הרצת Migration
```bash
# יצירת הטבלאות החדשות
python Backend/migrations/create_preferences_tables.py

# העברת נתונים קיימים
python Backend/migrations/migrate_existing_preferences.py

# בדיקת תקינות
python Backend/scripts/validate_preferences_migration.py
```

#### 3. הפעלת השרת
```bash
# הפעלת השרת עם המערכת החדשה
python Backend/app.py

# או עם restart script
./restart --preferences-v2
```

### בדיקות

#### 1. בדיקות יחידה
```bash
# הרצת בדיקות PreferencesService
python -m pytest Backend/tests/test_preferences_service.py -v

# בדיקות API
python -m pytest Backend/tests/test_preferences_api.py -v

# בדיקות Frontend
npm test trading-ui/scripts/preferences-manager.js
```

#### 2. בדיקות אינטגרציה
```bash
# בדיקת תהליך מלא
python Backend/tests/test_preferences_integration.py

# בדיקת ביצועים
python Backend/tests/test_preferences_performance.py
```

#### 3. בדיקות ידניות
1. פתיחת עמוד העדפות
2. שינוי העדפה
3. בדיקת שמירה
4. רענון הדף
5. וידוא שההעדפה נשמרה

### ניהול שגיאות

#### 1. שגיאות נפוצות
- **קובץ העדפות פגום** - המערכת תצור קובץ חדש מבסיס הנתונים
- **העדפה לא קיימת** - שימוש בברירת מחדל
- **ערך לא תקין** - שימוש ב-fallback
- **שגיאת רשת** - retry אוטומטי

#### 2. לוגים
```bash
# צפייה בלוגים
tail -f Backend/logs/preferences.log

# חיפוש שגיאות
grep "ERROR" Backend/logs/preferences.log

# חיפוש העדפות
grep "preference" Backend/logs/preferences.log
```

#### 3. ניקוי בעיות
```bash
# ניקוי קבצי העדפות פגומים
python Backend/scripts/cleanup_preferences_files.py

# יצירת קבצים חדשים לכל המשתמשים
python Backend/scripts/regenerate_all_preferences.py

# בדיקת תקינות בסיס הנתונים
python Backend/scripts/validate_preferences_db.py
```

---

## 🔗 קישורים לדוקומנטציה

### דוקומנטציה קיימת
- [README.md](./README.md) - סקירה כללית של הפרויקט
- [EXTERNAL_DATA_INTEGRATION_SPECIFICATION_v1.3.1.md](./EXTERNAL_DATA_INTEGRATION_SPECIFICATION_v1.3.1.md) - מערכת נתונים חיצוניים
- [DEVELOPMENT_TOOLS_STANDARDIZATION_TASKS.md](./DEVELOPMENT_TOOLS_STANDARDIZATION_TASKS.md) - כלי פיתוח
- [SERVER_TASKS_LIST.md](./SERVER_TASKS_LIST.md) - משימות שרת

### קבצי קוד רלוונטיים
- `Backend/models/user_preferences.py` - המודל הנוכחי
- `Backend/routes/api/preferences.py` - API נוכחי
- `trading-ui/scripts/preferences-v2.js` - JavaScript נוכחי
- `trading-ui/preferences-v2.html` - עמוד העדפות

### קבצי תצורה
- `Backend/config/database.py` - הגדרות בסיס נתונים
- `Backend/services/advanced_cache_service.py` - מערכת מטמון
- `trading-ui/styles/styles.css` - עיצוב כפתורים

### קבצי בדיקות
- `Backend/tests/` - בדיקות שרת
- `trading-ui/tests/` - בדיקות Frontend

---

## 📞 תמיכה ועזרה

### צוות הפיתוח
- **מנהל פרויקט:** TikTrack Development Team
- **תאריך עדכון אחרון:** 15 בינואר 2025
- **גרסה:** 2.0.0

### שאלות נפוצות
1. **איך להוסיף העדפה חדשה?** - הוספה לטבלת preference_definitions
2. **איך לעדכן ברירת מחדל?** - עדכון בטבלת preference_defaults
3. **איך לבדוק תקינות?** - הרצת validate_preferences_db.py
4. **איך לגבות העדפות?** - הרצת backup_preferences.py

### קישורים נוספים
- [מדריך RTL לעברית](./documentation/RTL_HEBREW_GUIDE.md)
- [ארכיטקטורת המערכת](./Backend/ARCHITECTURE_DOCUMENTATION.html)
- [מדריך API](./documentation/API_GUIDE.md)

---

**סוף המסמך**

*מסמך זה עודכן לאחרונה ב-15 בינואר 2025*
