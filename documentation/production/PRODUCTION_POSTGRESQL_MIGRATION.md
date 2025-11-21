# Production PostgreSQL Migration Guide
# ======================================
# מדריך מיגרציה של סביבת הפרודקשן מ-SQLite ל-PostgreSQL

**גרסה:** 1.0  
**תאריך:** נובמבר 2025  
**מפתח:** TikTrack Development Team

---

## 📋 **סקירה כללית**

מדריך זה מפרט את תהליך המיגרציה של סביבת הפרודקשן מ-SQLite ל-PostgreSQL.

**הבדלים ממיגרציית הפיתוח:**
- משתמש באותו Docker container (`tiktrack-postgres-dev`)
- database נפרד: `TikTrack-db-production`
- מעתיק רק טבלאות מערכת (לא נתוני משתמשים)
- נתוני משתמשים נשארים ריקים (clean start)

---

## ✅ **דרישות מוקדמות**

1. **Docker Container רץ:**
   ```bash
   docker ps | grep postgres
   ```
   Container `tiktrack-postgres-dev` חייב לרוץ

2. **גיבוי SQLite של הפרודקשן:**
   - גיבוי מלא של בסיס הנתונים SQLite של הפרודקשן
   - שמור ב-`archive/database_backups/`

3. **סקריפטי המיגרציה:**
   - `scripts/db/setup_production_postgresql.sh`
   - `scripts/db/migrate_production_to_pg.py`
   - `scripts/db/backup_postgresql_production.sh`

---

## 🚀 **תהליך המיגרציה**

### **שלב 1: הכנות**

1. **עצור את שרת הפרודקשן:**
   ```bash
   # בתיקיית הפרודקשן
   pkill -f "python.*app.py"
   ```

2. **גבה את SQLite של הפרודקשן:**
   ```bash
   # בתיקיית הפרודקשן
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   cp Backend/db/tiktrack.db archive/database_backups/tiktrack_production_${TIMESTAMP}.db
   ```

3. **ודא שה-Docker container רץ:**
   ```bash
   docker ps | grep tiktrack-postgres-dev
   ```

### **שלב 2: יצירת Database והתקנת Schema**

1. **הרץ את סקריפט ההתקנה:**
   ```bash
   # בתיקיית הפרודקשן
   ./scripts/db/setup_production_postgresql.sh
   ```

   הסקריפט:
   - יוצר את `TikTrack-db-production` database
   - מאתחל את כל הטבלאות (ריקות)
   - מעתיק טבלאות מערכת מ-SQLite (אם קיים)

2. **אם SQLite לא נמצא:**
   - הסקריפט יצור database ריק
   - תוכל להריץ מיגרציה מאוחר יותר:
     ```bash
     SQLITE_MIGRATION_PATH=/path/to/production/tiktrack.db \
     POSTGRES_HOST=localhost \
     POSTGRES_DB=TikTrack-db-production \
     POSTGRES_USER=TikTrakDBAdmin \
     POSTGRES_PASSWORD="BigMeZoo1974!?" \
     python3 scripts/db/migrate_production_to_pg.py
     ```

### **שלב 3: עדכון סקריפטי הפעלה**

1. **עדכן את `start_server.sh` (או סקריפט מקביל):**
   - הוסף הגדרת משתני סביבה של PostgreSQL
   - הוסף בדיקת PostgreSQL container
   - עיין ב-`start_server.sh` של הפיתוח כדוגמה

2. **משתני סביבה לפרודקשן:**
   ```bash
   export POSTGRES_HOST=localhost
   export POSTGRES_DB=TikTrack-db-production
   export POSTGRES_USER=TikTrakDBAdmin
   export POSTGRES_PASSWORD="BigMeZoo1974!?"
   ```

### **שלב 4: בדיקות**

1. **הפעל את שרת הפרודקשן:**
   ```bash
   ./start_server.sh
   ```

2. **בדוק חיבור לבסיס הנתונים:**
   ```bash
   curl http://localhost:5001/api/system/health
   ```

3. **ודא שטבלאות מערכת מכילות נתונים:**
   ```bash
   docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM constraints;"
   docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM system_settings;"
   ```

4. **ודא שטבלאות משתמשים ריקות:**
   ```bash
   docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM tickers;"
   docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM trades;"
   ```

---

## 📊 **טבלאות שמועתקות**

### **טבלאות מערכת (מועתקות):**
- `users` - חשבונות משתמשים
- `preference_groups`, `preference_types`, `preference_profiles` - מבנה העדפות
- `currencies` - מטבעות
- `external_data_providers` - ספקי נתונים חיצוניים
- `trading_methods`, `method_parameters` - שיטות מסחר
- `note_relation_types` - סוגי קשרים להערות
- `tag_categories` - קטגוריות תגיות
- `system_setting_groups`, `system_setting_types`, `system_settings` - הגדרות מערכת
- `constraints`, `constraint_validations`, `enum_values` - אילוצים וערכי enum

### **טבלאות משתמשים (לא מועתקות - נשארות ריקות):**
- `tickers` - טיקרים
- `trades` - עסקאות
- `trade_plans` - תוכניות מסחר
- `executions` - ביצועים
- `cash_flows` - תזרימי מזומן
- `trading_accounts` - חשבונות מסחר
- `alerts` - התראות
- `notes` - הערות
- `tags` - תגיות (תגיות משתמש, לא קטגוריות)

---

## 🔄 **גיבוי ושחזור**

### **יצירת גיבוי:**
```bash
./scripts/db/backup_postgresql_production.sh
```

הגיבוי נשמר ב-`archive/database_backups/TikTrack-db-production_YYYYMMDD_HHMMSS.sql`

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

### **לפני מיגרציה:**
1. **תמיד צור גיבוי** של SQLite לפני מיגרציה
2. **ודא שה-container רץ** לפני התחלה
3. **עצור את השרת** לפני מיגרציה

### **במהלך מיגרציה:**
- המיגרציה **לא תמחק** את SQLite המקורי
- SQLite נשאר כגיבוי
- ניתן לחזור ל-SQLite אם צריך

### **אחרי מיגרציה:**
- **בדוק** שכל טבלאות המערכת מכילות נתונים
- **ודא** שטבלאות משתמשים ריקות
- **בדוק** שהשרת מתחיל בהצלחה

---

## 🔧 **פתרון בעיות**

### **בעיה: "Database already exists"**
```bash
# הסקריפט ישאל אם למחוק וליצור מחדש
# או מחק ידנית:
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -c "DROP DATABASE \"TikTrack-db-production\";"
```

### **בעיה: "Container not running"**
```bash
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev
```

### **בעיה: "SQLite not found"**
- הסקריפט ייצור database ריק
- תוכל להריץ מיגרציה מאוחר יותר עם `migrate_production_to_pg.py`

### **בעיה: "Foreign key violations"**
- הסקריפט מסנן אוטומטית רשומות עם foreign keys לא תקינים
- בדוק את הלוגים לראות כמה רשומות הוסרו

---

## 📚 **משאבים נוספים**

### **סקריפטים:**
- `scripts/db/setup_production_postgresql.sh` - התקנה מלאה
- `scripts/db/migrate_production_to_pg.py` - מיגרציה ידנית
- `scripts/db/backup_postgresql_production.sh` - גיבוי

### **דוקומנטציה:**
- [PostgreSQL Startup Guide](../server/POSTGRESQL_STARTUP_GUIDE.md)
- [PostgreSQL Backup Guide](../server/POSTGRESQL_BACKUP_GUIDE.md)
- [Development Migration Plan](../../05-REPORTS/DB_MIGRATION_EXECUTION_PLAN.md)

---

## 🔄 **Rollback Plan**

אם צריך לחזור ל-SQLite:

1. **עצור את השרת**
2. **הסר משתני סביבה של PostgreSQL** מסקריפט ההפעלה
3. **ודא ש-SQLite קיים** ב-`Backend/db/tiktrack.db`
4. **הפעל מחדש את השרת**

**הערה:** SQLite נשאר ללא שינוי במהלך המיגרציה, כך שניתן לחזור אליו בכל עת.

---

**תאריך עדכון אחרון:** נובמבר 2025  
**גרסה:** 1.0  
**מפתח:** TikTrack Development Team

