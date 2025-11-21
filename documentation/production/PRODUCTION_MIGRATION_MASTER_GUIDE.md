# Production PostgreSQL Migration - Master Guide
# ===============================================
# מדריך ראשי מרוכז למיגרציה של סביבת הפרודקשן

**תאריך:** נובמבר 2025  
**גרסה:** 1.0  
**מטרה:** מיגרציה של סביבת הפרודקשן מ-SQLite ל-PostgreSQL

---

## 📋 **סקירה כללית**

מדריך זה הוא נקודת הכניסה המרכזית למיגרציה של סביבת הפרודקשן.  
הוא מכיל קישורים לכל הקבצים והמסמכים הרלוונטיים.

**מיקום פרודקשן:** `/Users/nimrod/Documents/TikTrack/TikTrackApp-Production`

---

## 🎯 **מה זה כולל?**

### **מה משתנה:**
- ✅ בסיס הנתונים: SQLite → PostgreSQL
- ✅ Database name: `TikTrack-db-production`
- ✅ אותו Docker container: `tiktrack-postgres-dev`
- ✅ סקריפטי הפעלה: עדכון לתמיכה ב-PostgreSQL

### **מה נשמר:**
- ✅ כל טבלאות המערכת (constraints, system_settings, currencies, וכו')
- ✅ מבנה העדפות (preference_groups, preference_types)
- ✅ שיטות מסחר (trading_methods, method_parameters)
- ✅ הגדרות מערכת

### **מה לא נשמר:**
- ❌ נתוני משתמשים (tickers, trades, executions, cash_flows, וכו')
- ❌ טבלאות משתמשים נשארות ריקות (clean start)

---

## 📚 **מסמכים וקבצים**

### **דרישות מוקדמות:**

0. **[דרישות מוקדמות בסביבת הפיתוח](PRODUCTION_MIGRATION_PREREQUISITES.md)** ⚠️ **קרא קודם!**
   - מה צריך לבדוק לפני המיגרציה
   - בדיקות בסביבת הפיתוח
   - סקריפט בדיקה אוטומטית
   - **👉 התחל כאן לפני הכל!**

### **מדריכים מפורטים:**

0. **[מדריך אכיפת תהליכי עבודה](WORKFLOW_ENFORCEMENT_GUIDE.md)** ⚠️ **קרא קודם!**
   - כללי הזהב לעבודה מסודרת
   - תהליכי עבודה מפורטים
   - כלים לאכיפת תהליכים
   - **👉 קרא זה לפני הכל!**

1. **[מדריך ביצוע מלא](PRODUCTION_MIGRATION_EXECUTION_GUIDE.md)**
   - שלבים מפורטים לביצוע המיגרציה
   - הוראות העתקת קבצים
   - בדיקות ואימותים
   - **👉 התחל כאן!**

2. **[מדריך מיגרציה מפורט](PRODUCTION_POSTGRESQL_MIGRATION.md)**
   - הסבר על תהליך המיגרציה
   - טבלאות שמועתקות/לא מועתקות
   - פתרון בעיות

3. **[מדריך עדכון סקריפט הפעלה](PRODUCTION_STARTUP_SCRIPT_UPDATE.md)**
   - הוראות עדכון `start_server.sh`
   - קוד לדוגמה
   - בדיקות

4. **[רשימת בדיקות](PRODUCTION_MIGRATION_CHECKLIST.md)**
   - רשימת בדיקות לפני/במהלך/אחרי
   - פקודות שימושיות
   - טבלאות לבדיקה

### **סקריפטים:**

1. **`scripts/db/setup_production_postgresql.sh`** ⭐ **התחל כאן**
   - סקריפט התקנה מלא
   - יוצר database
   - מאתחל schema
   - מעתיק נתונים (אם SQLite קיים)

2. **`scripts/db/migrate_production_to_pg.py`**
   - מיגרציה ידנית של טבלאות מערכת
   - לשימוש אם SQLite לא נמצא במיקום ברירת מחדל

3. **`scripts/db/backup_postgresql_production.sh`**
   - יצירת גיבוי PostgreSQL
   - לשימוש שוטף אחרי המיגרציה

4. **`scripts/db/verify_production_setup.sh`**
   - אימות שהמיגרציה הצליחה
   - בדיקת טבלאות ונתונים

5. **`scripts/db/production_start_server_template.sh`**
   - תבנית קוד לעדכון `start_server.sh`
   - העתק את הקוד משם

6. **`scripts/db/check_production_prerequisites.sh`** ⚠️ **הרץ קודם!**
   - בודק את כל הדרישות המוקדמות
   - הרץ לפני המיגרציה
   - **👉 הרץ זה ראשון!**

7. **`scripts/db/enforce_workflow.sh`** ⚠️ **חובה לפני כל שינוי!**
   - בודק תהליך עבודה מסודר
   - בודק Git status
   - בודק database environment
   - **👉 הרץ לפני כל שינוי!**

8. **`scripts/db/pre_change_check.sh`** ⚠️ **חובה לפני שינוי בפרודקשן!**
   - בדיקת בטיחות לפני שינוי
   - יצירת גיבוי אוטומטי
   - אישור מפורש בפרודקשן
   - **👉 הרץ לפני כל שינוי בפרודקשן!**

9. **`scripts/db/check_environment_isolation.sh`**
   - בודק רמת בידוד בין סביבות
   - מציג משאבים משותפים
   - נותן המלצות

---

## 🚀 **תהליך מהיר (Quick Start)**

### **שלב 0: בדיקת תהליך עבודה (חובה!)**

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production

# בדוק תהליך עבודה
./scripts/db/enforce_workflow.sh

# בדיקת בטיחות לפני שינוי
./scripts/db/pre_change_check.sh
```

### **שלב 1: העתקת קבצים**

```bash
# מהפרויקט הנוכחי לפרודקשן
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production

# העתק סקריפטים
cp ../TikTrackApp/scripts/db/migrate_production_to_pg.py scripts/db/
cp ../TikTrackApp/scripts/db/backup_postgresql_production.sh scripts/db/
cp ../TikTrackApp/scripts/db/setup_production_postgresql.sh scripts/db/
cp ../TikTrackApp/scripts/db/verify_production_setup.sh scripts/db/
cp ../TikTrackApp/scripts/db/production_start_server_template.sh scripts/db/

# הגדר הרשאות
chmod +x scripts/db/*.sh
chmod +x scripts/db/*.py
```

### **שלב 2: גיבוי SQLite**

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production
mkdir -p archive/database_backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp Backend/db/tiktrack.db archive/database_backups/tiktrack_production_${TIMESTAMP}.db
```

### **שלב 3: ביצוע המיגרציה**

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production

# עצור את השרת
pkill -f "python.*app.py"

# הרץ את סקריפט ההתקנה
./scripts/db/setup_production_postgresql.sh
```

### **שלב 4: עדכון סקריפט הפעלה**

ראה: [PRODUCTION_STARTUP_SCRIPT_UPDATE.md](PRODUCTION_STARTUP_SCRIPT_UPDATE.md)

### **שלב 5: בדיקות**

```bash
# אימות
./scripts/db/verify_production_setup.sh

# הפעלת שרת
./start_server.sh

# בדיקת health
curl http://localhost:5001/api/system/health
```

---

## 📊 **טבלאות - מה מועתק ומה לא**

### **✅ טבלאות מערכת (מועתקות):**

| טבלה | תיאור |
|------|-------|
| `users` | חשבונות משתמשים |
| `preference_groups` | קבוצות העדפות |
| `preference_types` | סוגי העדפות |
| `preference_profiles` | פרופילי העדפות |
| `currencies` | מטבעות |
| `external_data_providers` | ספקי נתונים חיצוניים |
| `trading_methods` | שיטות מסחר |
| `method_parameters` | פרמטרים של שיטות |
| `note_relation_types` | סוגי קשרים להערות |
| `tag_categories` | קטגוריות תגיות |
| `system_setting_groups` | קבוצות הגדרות מערכת |
| `system_setting_types` | סוגי הגדרות מערכת |
| `system_settings` | הגדרות מערכת |
| `constraints` | אילוצים |
| `constraint_validations` | ולידציות אילוצים |
| `enum_values` | ערכי enum |

### **❌ טבלאות משתמשים (לא מועתקות - נשארות ריקות):**

| טבלה | תיאור |
|------|-------|
| `tickers` | טיקרים |
| `trades` | עסקאות |
| `trade_plans` | תוכניות מסחר |
| `executions` | ביצועים |
| `cash_flows` | תזרימי מזומן |
| `trading_accounts` | חשבונות מסחר |
| `alerts` | התראות |
| `notes` | הערות |
| `tags` | תגיות משתמש |

---

## 🔧 **תשתית טכנית**

### **Docker Container:**
- **Container:** `tiktrack-postgres-dev` (אותו container של פיתוח)
- **Database:** `TikTrack-db-production` (נפרד מ-development)
- **User:** `TikTrakDBAdmin`
- **Port:** `5432`

### **משתני סביבה:**
```bash
POSTGRES_HOST=localhost
POSTGRES_DB=TikTrack-db-production
POSTGRES_USER=TikTrakDBAdmin
POSTGRES_PASSWORD="BigMeZoo1974!?"
```

---

## 📝 **רשימת בדיקות מהירה**

### **לפני המיגרציה:**
- [ ] SQLite מגובה
- [ ] Docker container רץ
- [ ] סקריפטים הועתקו לפרודקשן

### **אחרי המיגרציה:**
- [ ] Database נוצר: `docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -l | grep TikTrack-db-production`
- [ ] Schema נוצר: `docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "\dt"`
- [ ] טבלאות מערכת מכילות נתונים
- [ ] טבלאות משתמשים ריקות
- [ ] השרת מתחיל בהצלחה
- [ ] Health check עובר

ראה [PRODUCTION_MIGRATION_CHECKLIST.md](PRODUCTION_MIGRATION_CHECKLIST.md) לרשימה מפורטת.

---

## 🔄 **גיבוי ושחזור**

### **יצירת גיבוי:**
```bash
./scripts/db/backup_postgresql_production.sh
```

### **שחזור מגיבוי:**
```bash
docker exec -i tiktrack-postgres-dev psql \
  -U TikTrakDBAdmin \
  -d TikTrack-db-production \
  < archive/database_backups/TikTrack-db-production_YYYYMMDD_HHMMSS.sql
```

ראה [PRODUCTION_POSTGRESQL_MIGRATION.md](PRODUCTION_POSTGRESQL_MIGRATION.md) לפרטים נוספים.

---

## ⚠️ **נקודות חשובות**

1. **SQLite נשאר ללא שינוי** - ניתן לחזור אליו בכל עת
2. **אותו Docker container** - פיתוח ופרודקשן משתמשים ב-`tiktrack-postgres-dev`
3. **Database נפרד** - `TikTrack-db-development` ו-`TikTrack-db-production`
4. **טבלאות משתמשים ריקות** - זה התנהגות מכוונת (clean start)
5. **לא צריך לשמור נתוני משתמשים** - רק טבלאות מערכת

---

## 🆘 **פתרון בעיות**

### **בעיה: "Container not running"**
```bash
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev
```

### **בעיה: "Database already exists"**
הסקריפט ישאל אם למחוק וליצור מחדש.

### **בעיה: "SQLite not found"**
- הסקריפט ייצור database ריק
- הרץ מיגרציה ידנית עם `migrate_production_to_pg.py`

### **בעיה: "Foreign key violations"**
- הסקריפט מסנן אוטומטית רשומות לא תקינות
- בדוק את הלוגים

ראה [PRODUCTION_POSTGRESQL_MIGRATION.md](PRODUCTION_POSTGRESQL_MIGRATION.md) לפתרון בעיות נוספות.

---

## 📞 **תמיכה**

### **במקרה של בעיות:**
1. בדוק את [PRODUCTION_MIGRATION_CHECKLIST.md](PRODUCTION_MIGRATION_CHECKLIST.md)
2. ראה [PRODUCTION_POSTGRESQL_MIGRATION.md](PRODUCTION_POSTGRESQL_MIGRATION.md) לפתרון בעיות
3. בדוק את הלוגים: `Backend/logs/errors.log`
4. הרץ `verify_production_setup.sh` לאימות

---

## 🔗 **קישורים מהירים**

### **מדריכים:**
- [מדריך ביצוע מלא](PRODUCTION_MIGRATION_EXECUTION_GUIDE.md) ⭐ **התחל כאן**
- [מדריך מיגרציה מפורט](PRODUCTION_POSTGRESQL_MIGRATION.md)
- [מדריך עדכון סקריפט הפעלה](PRODUCTION_STARTUP_SCRIPT_UPDATE.md)
- [רשימת בדיקות](PRODUCTION_MIGRATION_CHECKLIST.md)

### **סקריפטים:**
- `scripts/db/setup_production_postgresql.sh` ⭐ **התחל כאן**
- `scripts/db/migrate_production_to_pg.py`
- `scripts/db/backup_postgresql_production.sh`
- `scripts/db/verify_production_setup.sh`
- `scripts/db/production_start_server_template.sh`

### **דוקומנטציה כללית:**
- [PostgreSQL Startup Guide](../server/POSTGRESQL_STARTUP_GUIDE.md) - הפעלת PostgreSQL
- [PostgreSQL Backup Guide](../server/POSTGRESQL_BACKUP_GUIDE.md) - גיבוי PostgreSQL
- [Server Management Guide](../server/SERVER_MANAGEMENT_GUIDE.md) - ניהול שרת

---

## 📅 **לוח זמנים מוצע**

1. **יום 1:** העתקת קבצים וגיבוי SQLite
2. **יום 1:** הרצת `setup_production_postgresql.sh`
3. **יום 1:** עדכון `start_server.sh`
4. **יום 2:** בדיקות ואימותים
5. **יום 2:** הפעלת שרת ובדיקות סופיות

**זמן משוער:** 2-4 שעות

---

## ✅ **סיכום**

### **מה צריך לעשות:**
1. ✅ העתק סקריפטים לפרודקשן
2. ✅ גבה SQLite
3. ✅ הרץ `setup_production_postgresql.sh`
4. ✅ עדכן `start_server.sh`
5. ✅ בדוק שהכל עובד

### **מה קיבלת:**
- ✅ 5 סקריפטים מוכנים לשימוש
- ✅ 4 מדריכים מפורטים
- ✅ תבנית לעדכון סקריפט הפעלה
- ✅ כלים לאימות ובדיקה

---

**תאריך עדכון אחרון:** נובמבר 2025  
**גרסה:** 1.0  
**מפתח:** TikTrack Development Team

---

## 🎯 **התחל כאן**

⚠️ **חשוב:** לפני שהפרודקשן יוכל להשתמש בסקריפטים, **חובה למזג את `new-db-uopgrde` ל-`main`**!

👉 **[מדריך בידוד סביבות](ENVIRONMENT_ISOLATION_GUIDE.md)** - **קרא קודם!** ⚠️ **קריטי!**

👉 **[מדריך מזיגה ל-main](PRODUCTION_MIGRATION_BRANCH_MERGE.md)** - **קרא קודם!**

👉 **[מדריך ביצוע מלא](PRODUCTION_MIGRATION_EXECUTION_GUIDE.md)** - שלבים מפורטים

👉 **[סקריפט התקנה](scripts/db/setup_production_postgresql.sh)** - הרץ זה ראשון


