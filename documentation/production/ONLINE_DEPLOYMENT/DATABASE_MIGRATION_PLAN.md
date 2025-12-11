# תוכנית העברת Database - Testing ל-Online

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** תוכנית מפורטת להעברת database מ-Testing ל-Online

---

## 📋 סקירה כללית

לאחר הקמת סביבת Online, נצטרך להעביר את ה-database מ-Testing ל-Online.

**מקור:** `TikTrack-db-testing` (מחשב מקומי)  
**יעד:** `TikTrack-db-online` (שרת uPress)

---

## 🎯 מטרת ההעברה

### מה מעבירים

- ✅ **Schema מלא** - כל הטבלאות, indexes, constraints
- ✅ **Data** - כל הנתונים הקיימים (trades, executions, וכו')
- ✅ **Preferences** - הגדרות מערכת
- ✅ **Users** - משתמשים (אם יש)

### מה לא מעבירים

- ❌ **Logs** - לוגים ישנים
- ❌ **Temporary data** - נתונים זמניים
- ❌ **Test data** - נתוני בדיקה (אם יש)

---

## 📊 תהליך העברה

### שלב 1: גיבוי Database Testing

**מטרה:** יצירת גיבוי לפני העברה

```bash
# גיבוי מלא
pg_dump -U TikTrakDBAdmin -d "TikTrack-db-testing" \
    --format=custom \
    --file="tiktrack-testing-backup-$(date +%Y%m%d-%H%M%S).dump"

# או SQL format
pg_dump -U TikTrakDBAdmin -d "TikTrack-db-testing" \
    --file="tiktrack-testing-backup-$(date +%Y%m%d-%H%M%S).sql"
```

**בדיקה:**

```bash
# בדיקת גודל הגיבוי
ls -lh tiktrack-testing-backup-*.dump

# בדיקת תקינות
pg_restore --list tiktrack-testing-backup-*.dump | head -20
```

---

### שלב 2: העתקת הגיבוי לשרת

**אפשרות 1: SCP**

```bash
# העתקת הגיבוי לשרת
scp tiktrack-testing-backup-*.dump user@server:/path/to/backups/
```

**אפשרות 2: rsync**

```bash
# העתקת הגיבוי לשרת
rsync -avz tiktrack-testing-backup-*.dump user@server:/path/to/backups/
```

**אפשרות 3: ישירות דרך PostgreSQL**

```bash
# העתקה ישירה (אם יש חיבור ישיר)
pg_dump -U TikTrakDBAdmin -d "TikTrack-db-testing" -h localhost | \
    psql -U TikTrakDBAdmin -d "TikTrack-db-online" -h server.upress.co.il
```

---

### שלב 3: יצירת Database Online

**על השרת:**

```bash
# יצירת database חדש
createdb -U TikTrakDBAdmin "TikTrack-db-online"

# או דרך psql
psql -U TikTrakDBAdmin -c "CREATE DATABASE \"TikTrack-db-online\";"
```

**בדיקה:**

```bash
# בדיקת יצירה
psql -U TikTrakDBAdmin -l | grep "TikTrack-db-online"
```

---

### שלב 4: שחזור Database

**על השרת:**

```bash
# שחזור מ-custom format
pg_restore -U TikTrakDBAdmin \
    -d "TikTrack-db-online" \
    --verbose \
    tiktrack-testing-backup-*.dump

# או מ-SQL format
psql -U TikTrakDBAdmin -d "TikTrack-db-online" < tiktrack-testing-backup-*.sql
```

**בדיקה:**

```bash
# בדיקת טבלאות
psql -U TikTrakDBAdmin -d "TikTrack-db-online" -c "\dt"

# בדיקת מספר רשומות
psql -U TikTrakDBAdmin -d "TikTrack-db-online" -c "SELECT COUNT(*) FROM trades;"
```

---

## 🔄 תהליך מיגרציות

### שלב 1: בדיקת מיגרציות נדרשות

**על השרת:**

```bash
# השוואת schema בין testing ל-online
# (אם יש כלי לזה)
```

### שלב 2: הרצת מיגרציות

**על השרת:**

```bash
# הרצת מיגרציות נדרשות
python3 scripts/production-update/steps/08_run_migrations.py \
    --env online \
    --database "TikTrack-db-online"
```

---

## ✅ Checklist העברת Database

### לפני העברה

- [ ] גיבוי database testing
- [ ] בדיקת תקינות הגיבוי
- [ ] העתקת הגיבוי לשרת
- [ ] יצירת database online

### העברה

- [ ] שחזור database על השרת
- [ ] בדיקת טבלאות
- [ ] בדיקת data
- [ ] הרצת מיגרציות (אם נדרש)

### אחרי העברה

- [ ] בדיקת חיבור מהאפליקציה
- [ ] בדיקת queries בסיסיים
- [ ] בדיקת integrity
- [ ] בדיקת ביצועים

---

## 🔧 כלים וסקריפטים

### סקריפט גיבוי

```bash
#!/bin/bash
# scripts/deployment/backup_testing_db.sh

BACKUP_DIR="/path/to/backups"
DB_NAME="TikTrack-db-testing"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

pg_dump -U TikTrakDBAdmin -d "$DB_NAME" \
    --format=custom \
    --file="$BACKUP_DIR/tiktrack-testing-$TIMESTAMP.dump"

echo "Backup created: $BACKUP_DIR/tiktrack-testing-$TIMESTAMP.dump"
```

### סקריפט העברה

```bash
#!/bin/bash
# scripts/deployment/migrate_db_to_online.sh

SOURCE_DB="TikTrack-db-testing"
TARGET_DB="TikTrack-db-online"
TARGET_HOST="server.upress.co.il"

# גיבוי
pg_dump -U TikTrakDBAdmin -d "$SOURCE_DB" --format=custom | \
    pg_restore -U TikTrakDBAdmin -d "$TARGET_DB" -h "$TARGET_HOST"

echo "Migration completed"
```

---

## ⚠️ הערות חשובות

### לפני העברה

- **חובה:** גיבוי מלא לפני העברה
- **מומלץ:** בדיקת תקינות הגיבוי
- **חובה:** בדיקת חיבור לשרת

### במהלך העברה

- **חובה:** בדיקת תקינות השחזור
- **מומלץ:** בדיקת מספר רשומות
- **חובה:** הרצת מיגרציות (אם נדרש)

### אחרי העברה

- **חובה:** בדיקת חיבור מהאפליקציה
- **חובה:** בדיקת queries בסיסיים
- **מומלץ:** בדיקת ביצועים

---

## 📊 הערכת זמן

### גיבוי

- **Database קטן (< 1GB):** 1-5 דקות
- **Database בינוני (1-10GB):** 5-30 דקות
- **Database גדול (> 10GB):** 30+ דקות

### העתקה לשרת

- **תלוי בגודל ו-bandwidth:** 5-60 דקות

### שחזור

- **Database קטן (< 1GB):** 2-10 דקות
- **Database בינוני (1-10GB):** 10-60 דקות
- **Database גדול (> 10GB):** 60+ דקות

**סה"כ משוער:** 30-120 דקות (תלוי בגודל)

---

## 🔗 קבצים רלוונטיים

### Scripts

- `scripts/deployment/backup_testing_db.sh` - גיבוי (אם נוצר)
- `scripts/deployment/migrate_db_to_online.sh` - העברה (אם נוצר)

### Documentation

- `documentation/production/ONLINE_DEPLOYMENT/DATABASE_MIGRATION_PLAN.md` - זה הקובץ
- `documentation/production/PRODUCTION_DATABASE_SETUP_GUIDE.md` - מדריך קיים

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** מוכן - ממתין לשרת

