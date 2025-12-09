# Production Migration Prerequisites

# ===================================

# דרישות מוקדמות למיגרציה של הפרודקשן

**תאריך:** נובמבר 2025  
**גרסה:** 1.0

---

## 📋 **סקירה כללית**

מדריך זה מפרט את כל הדרישות המוקדמות שצריך לבדוק ולהכין **בסביבת הפיתוח** לפני ביצוע המיגרציה של הפרודקשן.

---

## ✅ **דרישות מוקדמות בסביבת הפיתוח**

### **1. Docker Container רץ**

**בדיקה:**

```bash
docker ps | grep tiktrack-postgres-dev
```

**אם לא רץ:**

```bash
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev
```

**למה זה חשוב:**

- הפרודקשן משתמש באותו Docker container
- אם ה-container לא רץ, המיגרציה של הפרודקשן תיכשל

---

### **2. Development Database קיים ופועל**

**בדיקה:**

```bash
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -l | grep TikTrack-db-development
```

**בדיקת חיבור:**

```bash
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "SELECT 1;"
```

**למה זה חשוב:**

- וידוא שה-PostgreSQL עובד בסביבת הפיתוח
- אם הפיתוח לא עובד, הפרודקשן לא יעבוד

---

### **3. סקריפטי המיגרציה קיימים ומוכנים**

**בדיקה:**

```bash
ls -la scripts/db/migrate_production_to_pg.py
ls -la scripts/db/setup_production_postgresql.sh
ls -la scripts/db/backup_postgresql_production.sh
ls -la scripts/db/verify_production_setup.sh
```

**בדיקת הרשאות:**

```bash
chmod +x scripts/db/*.sh
chmod +x scripts/db/*.py
```

**למה זה חשוב:**

- הסקריפטים צריכים להיות מוכנים להעתקה לפרודקשן
- ללא הסקריפטים, לא ניתן לבצע מיגרציה

---

### **4. בדיקת syntax של הסקריפטים**

**בדיקת Python:**

```bash
python3 -m py_compile scripts/db/migrate_production_to_pg.py
```

**בדיקת Bash:**

```bash
bash -n scripts/db/setup_production_postgresql.sh
bash -n scripts/db/backup_postgresql_production.sh
bash -n scripts/db/verify_production_setup.sh
```

**למה זה חשוב:**

- וידוא שהסקריפטים תקינים לפני העתקה
- חיסכון בזמן בפרודקשן

---

### **5. בדיקת תלויות Python**

**בדיקה:**

```bash
python3 -c "import sqlalchemy; import psycopg2; print('✅ All dependencies available')"
```

**אם חסר:**

```bash
pip install psycopg2-binary sqlalchemy
```

**למה זה חשוב:**

- הסקריפטים דורשים `psycopg2` ו-`sqlalchemy`
- ללא התלויות, המיגרציה תיכשל

---

### **6. בדיקת גישה ל-Docker**

**בדיקה:**

```bash
docker ps
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -c "SELECT version();"
```

**למה זה חשוב:**

- המיגרציה דורשת גישה ל-Docker
- ללא גישה, לא ניתן ליצור database או לגבות

---

### **7. בדיקת מבנה תיקיות**

**בדיקה:**

```bash
# וידוא שתיקיית scripts/db קיימת
ls -d scripts/db/

# וידוא שתיקיית archive/database_backups קיימת (או תיווצר)
mkdir -p archive/database_backups
```

**למה זה חשוב:**

- הסקריפטים מצפים למבנה תיקיות מסוים
- גיבויים נשמרים ב-`archive/database_backups`

---

## 🔍 **בדיקות מקיפות (מומלץ)**

### **בדיקה 1: Test Run של סקריפט המיגרציה**

**הערה:** זה לא יבצע מיגרציה אמיתית, רק יבדוק שהסקריפט עובד:

```bash
# בדיקת dry-run (אם הסקריפט תומך)
# או בדיקת syntax בלבד
python3 -m py_compile scripts/db/migrate_production_to_pg.py
```

### **בדיקה 2: Test של יצירת Database**

**אזהרה:** זה ייצור database בדיקה - לא להשתמש ב-production!

```bash
# בדיקת יכולת יצירת database
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -c "CREATE DATABASE test_migration_check;"
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -c "DROP DATABASE test_migration_check;"
```

### **בדיקה 3: Test של גיבוי**

```bash
# בדיקת יכולת גיבוי (על development database)
docker exec tiktrack-postgres-dev pg_dump -U TikTrakDBAdmin -d TikTrack-db-development > /tmp/test_backup.sql
ls -lh /tmp/test_backup.sql
rm /tmp/test_backup.sql
```

---

## 📝 **רשימת בדיקות מהירה**

הרץ את הפקודות הבאות לפני המיגרציה:

```bash
#!/bin/bash
# Quick Prerequisites Check

echo "=== Production Migration Prerequisites Check ==="
echo ""

# 1. Docker container
if docker ps --format '{{.Names}}' | grep -q 'tiktrack-postgres-dev'; then
    echo "✅ Docker container is running"
else
    echo "❌ Docker container is NOT running"
    exit 1
fi

# 2. Development database
if docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "TikTrack-db-development"; then
    echo "✅ Development database exists"
else
    echo "❌ Development database does NOT exist"
    exit 1
fi

# 3. Migration scripts
if [ -f "scripts/db/migrate_production_to_pg.py" ] && \
   [ -f "scripts/db/setup_production_postgresql.sh" ] && \
   [ -f "scripts/db/backup_postgresql_production.sh" ]; then
    echo "✅ Migration scripts exist"
else
    echo "❌ Migration scripts are missing"
    exit 1
fi

# 4. Python dependencies
if python3 -c "import sqlalchemy, psycopg2" 2>/dev/null; then
    echo "✅ Python dependencies available"
else
    echo "❌ Python dependencies missing"
    exit 1
fi

# 5. Script permissions
if [ -x "scripts/db/setup_production_postgresql.sh" ]; then
    echo "✅ Scripts have execute permissions"
else
    echo "⚠️  Setting execute permissions..."
    chmod +x scripts/db/*.sh
    chmod +x scripts/db/*.py
fi

echo ""
echo "✅ All prerequisites met!"
```

---

## 🚨 **אזהרות חשובות**

### **1. אל תבצע מיגרציה על Development Database**

- הסקריפטים מיועדים **רק** לפרודקשן
- Development database צריך להישאר ללא שינוי

### **2. ודא שיש גיבוי של SQLite הפרודקשן**

- לפני מיגרציה, **חובה** לגבות את SQLite של הפרודקשן
- זה לא חלק מהתהליך בפיתוח, אבל צריך לוודא שזה נעשה

### **3. בדוק שהכל עובד בפיתוח לפני העתקה**

- אם משהו לא עובד בפיתוח, זה לא יעבוד בפרודקשן
- תמיד לבדוק בפיתוח קודם

---

## 📋 **תהליך מומלץ לפני מיגרציה**

### **שלב 1: בדיקות בסביבת הפיתוח**

1. ✅ בדוק ש-Docker container רץ
2. ✅ בדוק ש-Development database עובד
3. ✅ בדוק שהסקריפטים קיימים ותקינים
4. ✅ בדוק תלויות Python
5. ✅ הרץ את רשימת הבדיקות המהירה

### **שלב 2: הכנות להעתקה**

1. ✅ ודא שכל הסקריפטים עם הרשאות נכונות
2. ✅ ודא שכל התיעוד מעודכן
3. ✅ ודא שכל הקבצים ב-Git

### **שלב 3: העתקה לפרודקשן**

1. העתק את הסקריפטים לפרודקשן
2. הרץ את המיגרציה בפרודקשן

---

## 🔗 **קישורים**

- [מדריך ראשי](PRODUCTION_MIGRATION_MASTER_GUIDE.md)
- [מדריך ביצוע](PRODUCTION_MIGRATION_EXECUTION_GUIDE.md)
- [רשימת בדיקות](PRODUCTION_MIGRATION_CHECKLIST.md)

---

**תאריך עדכון אחרון:** נובמבר 2025  
**גרסה:** 1.0

