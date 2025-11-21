# Production Migration Execution Guide
# =====================================
# מדריך ביצוע מיגרציה של הפרודקשן

**תאריך:** נובמבר 2025  
**גרסה:** 1.0

---

## 📋 **סקירה כללית**

מדריך זה מפרט את כל השלבים לביצוע המיגרציה של סביבת הפרודקשן מ-SQLite ל-PostgreSQL.

**מיקום פרודקשן:** `/Users/nimrod/Documents/TikTrack/TikTrackApp-Production`

---

## 📦 **שלב 1: העתקת קבצים לפרודקשן**

### **קבצים להעתקה:**

1. **סקריפטי מיגרציה:**
   ```bash
   # מהפרויקט הנוכחי לפרודקשן
   cp scripts/db/migrate_production_to_pg.py /Users/nimrod/Documents/TikTrack/TikTrackApp-Production/scripts/db/
   cp scripts/db/backup_postgresql_production.sh /Users/nimrod/Documents/TikTrack/TikTrackApp-Production/scripts/db/
   cp scripts/db/setup_production_postgresql.sh /Users/nimrod/Documents/TikTrack/TikTrackApp-Production/scripts/db/
   cp scripts/db/verify_production_setup.sh /Users/nimrod/Documents/TikTrack/TikTrackApp-Production/scripts/db/
   cp scripts/db/production_start_server_template.sh /Users/nimrod/Documents/TikTrack/TikTrackApp-Production/scripts/db/
   ```

2. **הגדרת הרשאות:**
   ```bash
   cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production
   chmod +x scripts/db/*.sh
   chmod +x scripts/db/*.py
   ```

---

## 🚀 **שלב 2: ביצוע המיגרציה**

### **צעד 1: גיבוי SQLite**

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production

# צור תיקיית גיבוי אם לא קיימת
mkdir -p archive/database_backups

# גבה את SQLite
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp Backend/db/tiktrack.db archive/database_backups/tiktrack_production_${TIMESTAMP}.db

# ודא שהגיבוי תקין
ls -lh archive/database_backups/tiktrack_production_${TIMESTAMP}.db
```

### **צעד 2: עצירת השרת**

```bash
# עצור את שרת הפרודקשן
pkill -f "python.*app.py"

# או אם יש סקריפט עצירה
./stop_server.sh  # או פקודה דומה
```

### **צעד 3: יצירת Database והתקנת Schema**

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production

# הרץ את סקריפט ההתקנה
./scripts/db/setup_production_postgresql.sh
```

הסקריפט:
- יוצר את `TikTrack-db-production` database
- מאתחל את כל הטבלאות (ריקות)
- מעתיק טבלאות מערכת מ-SQLite (אם קיים ב-`Backend/db/tiktrack.db`)

**אם SQLite לא נמצא:**
- הסקריפט יצור database ריק
- תוכל להריץ מיגרציה מאוחר יותר (ראה צעד 4)

### **צעד 4: מיגרציה ידנית (אם נדרש)**

אם SQLite לא נמצא במיקום ברירת המחדל, הרץ מיגרציה ידנית:

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production

SQLITE_MIGRATION_PATH=/path/to/production/tiktrack.db \
POSTGRES_HOST=localhost \
POSTGRES_DB=TikTrack-db-production \
POSTGRES_USER=TikTrakDBAdmin \
POSTGRES_PASSWORD="BigMeZoo1974!?" \
python3 scripts/db/migrate_production_to_pg.py
```

### **צעד 5: אימות המיגרציה**

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production

# הרץ סקריפט אימות
./scripts/db/verify_production_setup.sh
```

או בדיקה ידנית:

```bash
# בדוק טבלאות מערכת
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM constraints;"
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM system_settings;"
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM currencies;"

# ודא שטבלאות משתמשים ריקות
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM tickers;"
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM trades;"
```

---

## 🔧 **שלב 3: עדכון סקריפטי הפעלה**

### **עדכון start_server.sh**

1. **פתח את `start_server.sh` של הפרודקשן**

2. **הוסף את הפונקציות** (ראה `scripts/db/production_start_server_template.sh`):
   - `setup_postgresql_env()`
   - `check_postgresql_container()`

3. **הוסף קריאות לפונקציות** בפונקציה `main()`:
   ```bash
   # Setup PostgreSQL environment variables (production mode)
   setup_postgresql_env
   
   # Check PostgreSQL container (production mode with PostgreSQL)
   check_postgresql_container
   ```

4. **עדכן את `start_server()`** להצגת מידע PostgreSQL

5. **ראה מדריך מפורט:** `documentation/production/PRODUCTION_STARTUP_SCRIPT_UPDATE.md`

---

## ✅ **שלב 4: בדיקות סופיות**

### **בדיקת השרת:**

1. **הפעל את השרת:**
   ```bash
   cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production
   ./start_server.sh
   ```

2. **בדוק health endpoint:**
   ```bash
   curl http://localhost:5001/api/system/health
   ```

3. **בדוק חיבור לבסיס נתונים:**
   ```bash
   curl http://localhost:5001/api/system/health | jq '.components.database'
   ```

4. **בדוק API endpoints:**
   ```bash
   # בדוק endpoints שדורשים טבלאות מערכת
   curl http://localhost:5001/api/currencies
   curl http://localhost:5001/api/trading-methods
   ```

---

## 📊 **טבלאות שצריכות להכיל נתונים**

לאחר המיגרציה, הטבלאות הבאות צריכות להכיל נתונים:

- `users` - חשבונות משתמשים
- `preference_groups`, `preference_types`, `preference_profiles`
- `currencies` - מטבעות
- `external_data_providers` - ספקי נתונים
- `trading_methods`, `method_parameters` - שיטות מסחר
- `note_relation_types` - סוגי קשרים
- `tag_categories` - קטגוריות תגיות
- `system_setting_groups`, `system_setting_types`, `system_settings` - הגדרות מערכת
- `constraints`, `constraint_validations`, `enum_values` - אילוצים

---

## 📊 **טבלאות שצריכות להיות ריקות**

הטבלאות הבאות צריכות להיות ריקות (clean start):

- `tickers` = 0
- `trades` = 0
- `trade_plans` = 0
- `executions` = 0
- `cash_flows` = 0
- `trading_accounts` = 0
- `alerts` = 0
- `notes` = 0
- `tags` = 0 (תגיות משתמש, לא קטגוריות)

---

## 🔄 **גיבוי ושחזור**

### **יצירת גיבוי PostgreSQL:**

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production
./scripts/db/backup_postgresql_production.sh
```

### **שחזור מגיבוי:**

```bash
# 1. עצור את השרת
pkill -f "python.*app.py"

# 2. שחזר את הגיבוי
docker exec -i tiktrack-postgres-dev psql \
  -U TikTrakDBAdmin \
  -d TikTrack-db-production \
  < archive/database_backups/TikTrack-db-production_YYYYMMDD_HHMMSS.sql

# 3. הפעל מחדש את השרת
./start_server.sh
```

---

## ⚠️ **נקודות חשובות**

1. **SQLite נשאר ללא שינוי** - ניתן לחזור אליו בכל עת
2. **אותו Docker container** - פיתוח ופרודקשן משתמשים ב-`tiktrack-postgres-dev`
3. **Database נפרד** - `TikTrack-db-development` ו-`TikTrack-db-production`
4. **טבלאות משתמשים ריקות** - זה התנהגות מכוונת

---

## 🔧 **פתרון בעיות**

### **בעיה: "Container not running"**
```bash
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev
```

### **בעיה: "Database already exists"**
הסקריפט ישאל אם למחוק וליצור מחדש, או מחק ידנית:
```bash
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -c "DROP DATABASE \"TikTrack-db-production\";"
```

### **בעיה: "SQLite not found"**
- הסקריפט ייצור database ריק
- הרץ מיגרציה ידנית עם `migrate_production_to_pg.py`

---

## 📚 **משאבים**

### **סקריפטים:**
- `scripts/db/setup_production_postgresql.sh` - התקנה מלאה
- `scripts/db/migrate_production_to_pg.py` - מיגרציה ידנית
- `scripts/db/backup_postgresql_production.sh` - גיבוי
- `scripts/db/verify_production_setup.sh` - אימות

### **דוקומנטציה:**
- `PRODUCTION_POSTGRESQL_MIGRATION.md` - מדריך מיגרציה מפורט
- `PRODUCTION_STARTUP_SCRIPT_UPDATE.md` - עדכון סקריפט הפעלה
- `PRODUCTION_MIGRATION_CHECKLIST.md` - רשימת בדיקות

---

**תאריך עדכון אחרון:** נובמבר 2025  
**גרסה:** 1.0


