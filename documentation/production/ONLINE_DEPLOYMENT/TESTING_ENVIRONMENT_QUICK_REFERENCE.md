# Quick Reference - סביבת Testing

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** Quick reference מהיר - פקודות ובדיקות עיקריות

---

## 🚀 פקודות מהירות

### הפעלת שרת

```bash
# הפעלה אוטומטית (מזהה testing מהתיקייה)
./start_server.sh

# הפעלה מפורשת
export TIKTRACK_ENV=testing
./start_server.sh

# בדיקת conflicts בלבד
./start_server.sh --check-only
```

### בדיקת Config

```bash
# בדיקה מהירה
cd production/Backend
python3 -c "from config.settings import IS_TESTING, POSTGRES_DB; \
    print(f'Testing: {IS_TESTING}, DB: {POSTGRES_DB}')"
```

### בדיקת Database

```bash
# רשימת databases
psql -U TikTrakDBAdmin -l | grep -i tiktrack

# חיבור ל-database
psql -U TikTrakDBAdmin -d "TikTrack-db-testing"

# בדיקת טבלאות
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"

# בדיקת מספר רשומות
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c \
    "SELECT COUNT(*) FROM trades;"
```

### בדיקת Server

```bash
# Health check
curl http://localhost:5001/api/health

# Environment info
curl http://localhost:5001/api/system/environment

# בדיקת לוגים
tail -f production/Backend/server_output.log
```

---

## 📋 Checklist מהיר

### לפני התחלה
- [ ] גיבוי database
- [ ] גיבוי config
- [ ] בדיקת PostgreSQL

### ביצוע
- [ ] יצירת `TikTrack-db-testing`
- [ ] העתקת data
- [ ] עדכון `settings.py`
- [ ] עדכון `start_server.sh`

### אחרי ביצוע
- [ ] בדיקת config
- [ ] בדיקת database
- [ ] בדיקת server startup
- [ ] בדיקת UI

---

## 🔍 בדיקות מהירות

### 1. בדיקת Config

```bash
cd production/Backend
python3 << EOF
from config.settings import (
    IS_PRODUCTION, IS_TESTING, ENVIRONMENT,
    POSTGRES_DB, PORT
)
print(f"Environment: {ENVIRONMENT}")
print(f"IS_PRODUCTION: {IS_PRODUCTION}")
print(f"IS_TESTING: {IS_TESTING}")
print(f"Database: {POSTGRES_DB}")
print(f"Port: {PORT}")
EOF
```

**תוצאה צפויה:**
```
Environment: testing
IS_PRODUCTION: False
IS_TESTING: True
Database: TikTrack-db-testing
Port: 5001
```

### 2. בדיקת Database

```bash
# יצירת database (אם לא קיים)
createdb -U TikTrakDBAdmin "TikTrack-db-testing"

# בדיקת חיבור
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "SELECT version();"
```

### 3. בדיקת Server

```bash
# הפעלה
./start_server.sh

# Health check
curl http://localhost:5001/api/health

# Environment
curl http://localhost:5001/api/system/environment | jq
```

---

## 🛠️ פקודות Database

### יצירה והעתקה

```bash
# יצירת database
createdb -U TikTrakDBAdmin "TikTrack-db-testing"

# העתקת data מ-production (אם קיים)
pg_dump -U TikTrakDBAdmin -d "TikTrack-db-production" | \
    psql -U TikTrakDBAdmin -d "TikTrack-db-testing"

# העתקת schema מ-development
pg_dump -U TikTrakDBAdmin -d "TikTrack-db-development" --schema-only | \
    psql -U TikTrakDBAdmin -d "TikTrack-db-testing"
```

### בדיקות

```bash
# רשימת טבלאות
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"

# מספר טבלאות
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# בדיקת data
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c \
    "SELECT COUNT(*) FROM trades;"
```

---

## 🔧 פקודות Config

### בדיקת משתני סביבה

```bash
# בדיקת TIKTRACK_ENV
echo $TIKTRACK_ENV

# הגדרת testing
export TIKTRACK_ENV=testing

# בדיקת config
cd production/Backend
python3 -c "from config.settings import IS_TESTING; print(IS_TESTING)"
```

### עדכון Config

**קובץ:** `production/Backend/config/settings.py`

**שינויים עיקריים:**
- הוספת `IS_TESTING = ENVIRONMENT == "testing"`
- עדכון `POSTGRES_DB` default ל-`TikTrack-db-testing` כאשר `IS_TESTING`
- עדכון `PORT` ל-5001 גם עבור testing

---

## 🐛 פתרון בעיות מהיר

### Database לא נמצא

```bash
createdb -U TikTrakDBAdmin "TikTrack-db-testing"
```

### Config לא מזהה testing

```bash
export TIKTRACK_ENV=testing
cd production/Backend
python3 -c "from config.settings import IS_TESTING; print(IS_TESTING)"
```

### Server לא מתחיל

```bash
# בדיקת לוגים
tail -f production/Backend/server_output.log

# בדיקת conflicts
./start_server.sh --check-only

# בדיקת PostgreSQL
docker ps | grep postgres
```

### Port בשימוש

```bash
# מציאת process
lsof -i :5001

# עצירת process
kill <PID>
```

---

## 📊 מידע סביבה

### משתני סביבה

| משתנה | ערך Testing |
|--------|-------------|
| `TIKTRACK_ENV` | `testing` |
| `POSTGRES_DB` | `TikTrack-db-testing` |
| `PORT` | `5001` |
| `IS_PRODUCTION` | `False` |
| `IS_TESTING` | `True` |

### Endpoints

| Endpoint | תיאור |
|----------|-------|
| `http://localhost:5001/api/health` | Health check |
| `http://localhost:5001/api/system/environment` | מידע סביבה |
| `http://localhost:5001/` | דף ראשי |

---

## 🔗 קישורים מהירים

### Documentation
- `TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md` - הוראות מפורטות
- `HANDOFF_README.md` - README להעברה
- `ENVIRONMENT_NAMING.md` - שמות סביבות

### קבצים
- `production/Backend/config/settings.py` - Config
- `start_server.sh` - סקריפט הפעלה
- `production/Backend/server_output.log` - לוגים

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0

