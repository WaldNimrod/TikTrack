# תוכנית עדכוני קוד - 3 סביבות

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** רשימת כל השינויים הנדרשים בקוד לתמיכה ב-3 סביבות

---

## 📋 סקירה כללית

עדכון הקוד לתמיכה ב-3 סביבות:

1. **Development** - ללא שינוי
2. **Testing** - שינוי מ-production
3. **Online** - חדש

---

## 📁 קבצים לעדכון

### 1. Backend/config/settings.py

**שינויים נדרשים:**

- הוספת תמיכה ב-`testing` ו-`online` environments
- הוספת `IS_TESTING` ו-`IS_ONLINE` flags
- עדכון לוגיקה לזיהוי 3 סביבות

**קוד נוכחי:**

```python
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "development").lower()
IS_PRODUCTION = ENVIRONMENT == "production"
```

**קוד חדש:**

```python
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "development").lower()
IS_PRODUCTION = False  # רק אם צריך backward compatibility
IS_TESTING = ENVIRONMENT == "testing"
IS_ONLINE = ENVIRONMENT == "online"
IS_DEVELOPMENT = ENVIRONMENT == "development"
```

---

### 2. production/Backend/config/settings.py

**שינויים נדרשים:**

- שינוי מ-`production` ל-`testing`
- שינוי database name מ-`TikTrack-db-production` ל-`TikTrack-db-testing`
- עדכון `IS_PRODUCTION = False`, `IS_TESTING = True`

**קוד נוכחי:**

```python
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "development").lower()
IS_PRODUCTION = ENVIRONMENT == "production"
POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-production")
```

**קוד חדש:**

```python
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "testing").lower()  # שינוי
IS_PRODUCTION = False  # שינוי
IS_TESTING = True  # חדש
IS_ONLINE = False
POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-testing")  # שינוי
```

---

### 3. start_server.sh

**שינויים נדרשים:**

- הוספת זיהוי `testing` במקום `production`
- הוספת זיהוי `online` environment
- עדכון case statement ל-3 סביבות

**קוד נוכחי:**

```bash
if [[ "$workspace_name" == *"Production"* ]]; then
    echo "production"
elif [[ "$workspace_name" == "TikTrackApp" ]]; then
    echo "development"
fi
```

**קוד חדש:**

```bash
if [[ "$workspace_name" == *"Online"* ]]; then
    echo "online"
elif [[ "$workspace_name" == *"Production"* ]]; then
    echo "testing"  # שינוי מ-production
elif [[ "$workspace_name" == "TikTrackApp" ]]; then
    echo "development"
fi
```

**עדכון case statement:**

```bash
case "$ENVIRONMENT" in
    testing|test|TESTING|Test)
        ENVIRONMENT="testing"
        SERVER_DIR="production/Backend"
        SERVER_PORT=5001
        # ...
        ;;
    online|ONLINE|Online)
        ENVIRONMENT="online"
        SERVER_DIR="online/Backend"
        SERVER_PORT=8080  # פנימי
        # ...
        ;;
esac
```

---

### 4. online/Backend/config/settings.py (חדש)

**יצירת קובץ חדש:**

```python
import os
from pathlib import Path

# Environment detection
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "online").lower()
IS_PRODUCTION = False
IS_TESTING = False
IS_ONLINE = True
IS_DEVELOPMENT = False

# Paths
BASE_DIR = Path(__file__).parent.parent
UI_DIR = BASE_DIR.parent / "trading-ui"

# PostgreSQL database configuration
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-online")
POSTGRES_USER = os.getenv("POSTGRES_USER", "TikTrakDBAdmin")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")

# Database URL
DEFAULT_DATABASE_URL = (
    f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

# Flask settings
DEBUG = False
HOST = "0.0.0.0"  # להאזנה על כל ה-interfaces
PORT = 8080  # פנימי, Nginx מעביר ל-80/443

# Production settings
DEVELOPMENT_MODE = False
CACHE_DISABLED = False
DEFAULT_CACHE_TTL = 300
CACHE_ENABLED = True
```

---

## 🔄 שינויים נוספים

### 5. עדכון סקריפטי sync

**קבצים לעדכון:**

- `scripts/sync_to_production.py` → עדכון ל-`sync_to_testing.py` (אופציונלי)
- `scripts/sync_to_online.py` - חדש

### 6. עדכון documentation

**קבצים לעדכון:**

- `documentation/production/UPDATE_PROCESS.md` - הוספת תמיכה ב-online
- `documentation/production/PRODUCTION_SETUP.md` - עדכון ל-3 סביבות

---

## ✅ Checklist עדכוני קוד

### לפני עדכון

- [ ] גיבוי כל הקבצים
- [ ] יצירת branch חדש (`feature/3-environments`)
- [ ] בדיקת שינויים לא שמורים

### עדכון קבצים

- [ ] `Backend/config/settings.py` - הוספת testing/online
- [ ] `production/Backend/config/settings.py` - שינוי ל-testing
- [ ] `start_server.sh` - עדכון זיהוי סביבות
- [ ] יצירת `online/Backend/config/settings.py` (חדש)

### בדיקות

- [ ] בדיקת Development (ללא שינוי)
- [ ] בדיקת Testing (אחרי שינויים)
- [ ] בדיקת Online (אחרי יצירה)

### אחרי עדכון

- [ ] כל הבדיקות עברו
- [ ] Commit עם הודעה ברורה
- [ ] Push ל-remote

---

## ⚠️ הערות חשובות

### לפני עדכון

- **חובה:** גיבוי כל הקבצים
- **מומלץ:** יצירת branch חדש
- **חובה:** בדיקת שינויים לא שמורים

### במהלך עדכון

- **חובה:** בדיקות אחרי כל שינוי
- **מומלץ:** commit קטנים
- **חובה:** בדיקת backward compatibility

### אחרי עדכון

- **חובה:** בדיקות מקיפות
- **חובה:** עדכון documentation
- **מומלץ:** code review

---

## 🔗 קבצים רלוונטיים

### קבצי Config

- `Backend/config/settings.py` - Development
- `production/Backend/config/settings.py` - Testing
- `online/Backend/config/settings.py` - Online (חדש)

### Scripts

- `start_server.sh` - עדכון זיהוי
- `scripts/sync_to_online.py` - חדש

### Documentation

- `documentation/production/ONLINE_DEPLOYMENT/CODE_CHANGES_PLAN.md` - זה הקובץ
- `documentation/production/ONLINE_DEPLOYMENT/ENVIRONMENT_SETUP.md` - הגדרת סביבות

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** תכנון - לא לבצע עד לקבלת תשובה מ-uPress

