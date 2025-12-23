# הוראות עבודה - עדכון סביבת Testing

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** הוראות עבודה מפורטות שלב אחר שלב להפיכת סביבת production לסביבת Testing

---

## 📋 סקירה כללית

### מה משתנה

- **שם סביבה:** `production` → `testing`
- **שם Database:** `TikTrack-db-production` → `TikTrack-db-testing`
- **הגדרות Config:** `IS_PRODUCTION = True` → `IS_TESTING = True`
- **תיקייה:** `production/` נשארת (רק המשמעות משתנה)

### מה נשאר זהה

- תיקיית הקוד: `production/` (נשאר)
- פורט: 5001 (נשאר)
- תהליך עדכון: Master Script נשאר זהה

---

## ⚠️ חשוב לפני התחלה

### חובה לפני התחלה

- ✅ **גיבוי מלא** של database הנוכחי
- ✅ **גיבוי** של כל קבצי config
- ✅ **בדיקה** שהסביבה הנוכחית עובדת
- ✅ **תיעוד** של כל ההגדרות הנוכחיות

### תנאים

- ✅ יש גישה ל-PostgreSQL
- ✅ יש גישה לתיקייה `production/`
- ✅ יש הרשאות לערוך קבצים
- ✅ יש הרשאות להפעיל שרת

---

## 🔄 שלב 1: גיבוי Database

### 1.1 גיבוי Database הנוכחי

```bash
# גיבוי database הנוכחי (אם קיים)
pg_dump -U TikTrakDBAdmin -d "TikTrack-db-production" > \
    backup_production_$(date +%Y%m%d_%H%M%S).sql

# או אם אין database בשם הזה, בדוק מה יש:
psql -U TikTrakDBAdmin -l | grep -i tiktrack
```

### 1.2 גיבוי קבצי Config

```bash
# גיבוי קבצי config
cd production/Backend/config
cp settings.py settings.py.backup_$(date +%Y%m%d_%H%M%S)
```

### 1.3 גיבוי start_server.sh

```bash
# גיבוי start_server.sh
cp start_server.sh start_server.sh.backup_$(date +%Y%m%d_%H%M%S)
```

---

## 💾 שלב 2: יצירת Database Testing

### 2.1 בדיקת Databases קיימים

```bash
# בדיקת databases קיימים
psql -U TikTrakDBAdmin -l | grep -i tiktrack
```

**תוצאה צפויה:**

```
TikTrack-db-development
TikTrack-db-production  (אם קיים)
```

### 2.2 יצירת Database Testing

```bash
# יצירת database חדש
createdb -U TikTrakDBAdmin "TikTrack-db-testing"

# בדיקה שהדאטאבייס נוצר
psql -U TikTrakDBAdmin -l | grep -i testing
```

### 2.3 העתקת Data (אם יש database production)

```bash
# אם יש database production, העתק את ה-data
if psql -U TikTrakDBAdmin -lqt | cut -d \| -f 1 | grep -qw "TikTrack-db-production"; then
    echo "מעתיק data מ-production ל-testing..."
    pg_dump -U TikTrakDBAdmin -d "TikTrack-db-production" | \
        psql -U TikTrakDBAdmin -d "TikTrack-db-testing"
    echo "✅ העתקת data הושלמה"
else
    echo "⚠️ אין database production - מדלג על העתקת data"
fi
```

### 2.4 העתקת Schema מ-Development (אם אין data)

```bash
# אם אין database production, העתק schema מ-development
if ! psql -U TikTrakDBAdmin -lqt | cut -d \| -f 1 | grep -qw "TikTrack-db-production"; then
    echo "מעתיק schema מ-development ל-testing..."
    pg_dump -U TikTrakDBAdmin -d "TikTrack-db-development" --schema-only | \
        psql -U TikTrakDBAdmin -d "TikTrack-db-testing"
    echo "✅ העתקת schema הושלמה"
fi
```

### 2.5 בדיקת Database

```bash
# בדיקת שהדאטאבייס נוצר ונכון
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"

# בדיקת מספר טבלאות
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

---

## ⚙️ שלב 3: עדכון Config

### 3.1 עדכון settings.py

**קובץ:** `production/Backend/config/settings.py`

**שינויים נדרשים:**

1. **הוספת IS_TESTING:**

```python
# לפני:
IS_PRODUCTION = ENVIRONMENT == "production"

# אחרי:
IS_PRODUCTION = ENVIRONMENT == "production"
IS_TESTING = ENVIRONMENT == "testing"
IS_ONLINE = ENVIRONMENT == "online"
```

2. **עדכון Database Name:**

```python
# לפני:
POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-development")

# אחרי:
# Default database name based on environment
if IS_TESTING:
    DEFAULT_DB_NAME = "TikTrack-db-testing"
elif IS_ONLINE:
    DEFAULT_DB_NAME = "TikTrack-db-online"
else:
    DEFAULT_DB_NAME = "TikTrack-db-development"
POSTGRES_DB = os.getenv("POSTGRES_DB", DEFAULT_DB_NAME)
```

3. **עדכון Port:**

```python
# לפני:
PORT = 5001 if IS_PRODUCTION else 8080

# אחרי:
PORT = 5001 if (IS_PRODUCTION or IS_TESTING) else 8080
```

4. **עדכון Development Mode:**

```python
# לפני:
if IS_PRODUCTION:
    DEVELOPMENT_MODE = False
    CACHE_DISABLED = False

# אחרי:
if IS_PRODUCTION or IS_TESTING:
    DEVELOPMENT_MODE = False
    CACHE_DISABLED = False
```

### 3.2 בדיקת Config

```bash
# בדיקת שהקונפיגורציה תקינה
cd production/Backend
python3 -c "from config.settings import IS_TESTING, POSTGRES_DB; \
    print(f'Testing: {IS_TESTING}, DB: {POSTGRES_DB}')"
```

**תוצאה צפויה:**

```
Testing: True, DB: TikTrack-db-testing
```

---

## 🔧 שלב 4: עדכון start_server.sh

### 4.1 עדכון זיהוי סביבה

**קובץ:** `start_server.sh`

**שינויים נדרשים:**

1. **עדכון detect_environment_from_directory:**

```bash
# לפני:
if [[ "$workspace_name" == *"Production"* ]]; then
    echo "production"
    return 0

# אחרי:
# Check for Online in directory name (case-insensitive) - highest priority
if [[ "$workspace_name" == *"Online"* ]] || [[ "$workspace_name" == *"online"* ]]; then
    echo "online"
    return 0
# Check for Production in directory name (case-insensitive) - now maps to testing
elif [[ "$workspace_name" == *"Production"* ]] || [[ "$workspace_name" == *"production"* ]]; then
    echo "testing"
    return 0
```

2. **עדכון setup_postgresql_env:**

```bash
# הוספת case ל-testing:
elif [ "$ENVIRONMENT" = "testing" ]; then
    log_info "Setting PostgreSQL environment variables (testing defaults)..."
    export POSTGRES_HOST=localhost
    export POSTGRES_DB=TikTrack-db-testing
    export POSTGRES_USER=TikTrakDBAdmin
    export POSTGRES_PASSWORD="BigMeZoo1974!?"
    log_success "PostgreSQL environment variables configured for testing"
```

3. **עדכון case statement:**

```bash
# הוספת case ל-testing:
case "$ENVIRONMENT" in
    testing|test|TESTING|Test)
        ENVIRONMENT="testing"
        SERVER_DIR="production/Backend"
        SERVER_FILE="$SERVER_DIR/app.py"
        LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
        SERVER_PORT=5001
        DB_PATH="$SERVER_DIR/db/tiktrack.db"
        log_info "Environment: TESTING → Port: 5001"
        ;;
```

### 4.2 בדיקת start_server.sh

```bash
# בדיקת syntax
bash -n start_server.sh

# בדיקת זיהוי סביבה
cd /path/to/TikTrackApp-Production
./start_server.sh --check-only
```

---

## 🧪 שלב 5: בדיקות ואימות

### 5.1 בדיקת Config

```bash
# בדיקת config
cd production/Backend
python3 -c "
from config.settings import (
    IS_PRODUCTION, IS_TESTING, ENVIRONMENT, 
    POSTGRES_DB, PORT
)
print(f'Environment: {ENVIRONMENT}')
print(f'IS_PRODUCTION: {IS_PRODUCTION}')
print(f'IS_TESTING: {IS_TESTING}')
print(f'Database: {POSTGRES_DB}')
print(f'Port: {PORT}')
"
```

**תוצאה צפויה (כאשר TIKTRACK_ENV=testing):**

```
Environment: testing
IS_PRODUCTION: False
IS_TESTING: True
Database: TikTrack-db-testing
Port: 5001
```

### 5.2 בדיקת Database Connection

```bash
# בדיקת חיבור ל-database
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "SELECT version();"

# בדיקת טבלאות
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"
```

### 5.3 בדיקת Server Startup

```bash
# הפעלת שרת (במצב testing)
export TIKTRACK_ENV=testing
./start_server.sh

# או פשוט (הסקריפט מזהה אוטומטית):
./start_server.sh
```

**בדיקות:**

```bash
# בדיקת health endpoint
curl http://localhost:5001/api/health

# בדיקת environment endpoint
curl http://localhost:5001/api/system/environment
```

### 5.4 בדיקת UI

```bash
# פתיחת דפדפן
open http://localhost:5001

# בדיקת:
# - דף ראשי נטען
# - אין שגיאות ב-console
# - API calls עובדים
```

---

## 🔍 פתרון בעיות

### בעיה: Database לא נמצא

**תסמינים:**

```
Error: database "TikTrack-db-testing" does not exist
```

**פתרון:**

```bash
# יצירת database
createdb -U TikTrakDBAdmin "TikTrack-db-testing"

# בדיקה
psql -U TikTrakDBAdmin -l | grep testing
```

### בעיה: Config לא מזהה testing

**תסמינים:**

```
IS_TESTING: False
Database: TikTrack-db-development
```

**פתרון:**

```bash
# בדיקת משתנה סביבה
echo $TIKTRACK_ENV

# הגדרת משתנה סביבה
export TIKTRACK_ENV=testing

# בדיקה מחדש
cd production/Backend
python3 -c "from config.settings import IS_TESTING; print(IS_TESTING)"
```

### בעיה: Server לא מתחיל

**תסמינים:**

```
Server process exited immediately
```

**פתרון:**

```bash
# בדיקת לוגים
tail -f production/Backend/server_output.log

# בדיקת conflicts
./start_server.sh --check-only

# בדיקת PostgreSQL
docker ps | grep postgres
```

### בעיה: Port כבר בשימוש

**תסמינים:**

```
Port 5001 is already in use
```

**פתרון:**

```bash
# מציאת process
lsof -i :5001

# עצירת process
kill <PID>

# או שימוש ב-force (לא מומלץ)
./start_server.sh --force
```

---

## ✅ Checklist סופי

### לפני סיום

- [ ] Database `TikTrack-db-testing` נוצר
- [ ] Data הועתק (אם נדרש)
- [ ] `settings.py` עודכן
- [ ] `start_server.sh` עודכן
- [ ] Config נבדק
- [ ] Database connection נבדק
- [ ] Server מתחיל בהצלחה
- [ ] Health endpoint עובד
- [ ] UI נטען נכון
- [ ] אין שגיאות ב-console

### אחרי סיום

- [ ] גיבויים נשמרו
- [ ] שינויים commit & push
- [ ] תיעוד עודכן
- [ ] צוות הודיע על השלמה

---

## 📞 תמיכה

**אם יש בעיות:**

1. **בדיקת לוגים:**

   ```bash
   tail -f production/Backend/server_output.log
   ```

2. **בדיקת config:**

   ```bash
   cd production/Backend
   python3 -c "from config.settings import *; print(locals())"
   ```

3. **בדיקת database:**

   ```bash
   psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"
   ```

4. **פניה לצוות הפיתוח** עם:
   - פרטי השגיאה
   - לוגים רלוונטיים
   - שלב שבו הבעיה קרתה

---

## 🔗 קבצים רלוונטיים

### קבצי Config

- `production/Backend/config/settings.py` - הגדרות סביבה
- `start_server.sh` - סקריפט הפעלה

### Documentation

- `documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_QUICK_REFERENCE.md` - Quick reference
- `documentation/production/ONLINE_DEPLOYMENT/HANDOFF_README.md` - README להעברה
- `documentation/production/ONLINE_DEPLOYMENT/ENVIRONMENT_NAMING.md` - שמות סביבות

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0

