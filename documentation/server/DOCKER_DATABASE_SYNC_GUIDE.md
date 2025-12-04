# TikTrack Docker Database Sync Guide
# ===================================
# מדריך סנכרון בסיס הנתונים בין סביבת הפיתוח המקומית ל-Docker

**גרסה:** 1.0  
**תאריך עדכון:** ינואר 2025  
**מפתח:** TikTrack Development Team

---

## 📋 **סקירה כללית**

מערכת TikTrack משתמשת ב-PostgreSQL שפועל ב-Docker container (`tiktrack-postgres-dev`).  
בסיס הנתונים המקומי (localhost) ובסיס הנתונים ב-Docker צריכים להיות זהים ב-100% במבנה ובנתונים.

**מטרה:** להבטיח שסביבת הפיתוח המקומית וסביבת Docker זהות לחלוטין.

---

## 🔍 **בדיקת מצב נוכחי**

### **בדיקת נתונים (Data Counts)**

```bash
# השוואת מספר רשומות בטבלאות עיקריות
python3 scripts/db/verify_schema_match.py
```

הסקריפט בודק:
- ✅ מספר טבלאות
- ✅ מבנה טבלאות (עמודות, טיפוסים)
- ✅ מספר רשומות בטבלאות עיקריות

### **בדיקת מבנה (Schema Verification)**

```bash
# בדיקת מבנה מפורטת
python3 scripts/db/verify_schema_match.py
```

הסקריפט בודק:
- ✅ רשימת טבלאות
- ✅ מבנה עמודות (שם, טיפוס, NULL, default)
- ✅ אינדקסים
- ✅ Foreign keys

---

## 🔄 **תהליך סנכרון - מקומי → Docker**

### **שיטה 1: סקריפט אוטומטי (מומלץ)**

```bash
./scripts/db/sync_local_to_docker.sh
```

**מה הסקריפט עושה:**
1. ✅ בודק שה-Docker container רץ
2. ✅ בודק חיבור לבסיס הנתונים המקומי
3. ✅ יוצר גיבוי של בסיס הנתונים ב-Docker (לפני סנכרון)
4. ✅ מייצא את בסיס הנתונים המקומי (pg_dump)
5. ✅ מייבא את הנתונים ל-Docker (pg_restore)
6. ✅ מאמת שהסנכרון הצליח (השוואת מספר רשומות)
7. ✅ מנקה קבצים זמניים

**תוצאה:**
- בסיס הנתונים ב-Docker זהה ב-100% למקומי
- גיבוי נשמר ב-`archive/database_backups/docker_pre_sync_YYYYMMDD_HHMMSS.sql`

### **שיטה 2: תהליך ידני**

```bash
# 1. צור גיבוי של Docker (לפני שינויים)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec tiktrack-postgres-dev pg_dump \
  -U TikTrakDBAdmin \
  -d TikTrack-db-development \
  --clean --if-exists \
  > archive/database_backups/docker_backup_${TIMESTAMP}.sql

# 2. ייצא את בסיס הנתונים המקומי
export PGPASSWORD="BigMeZoo1974!?"
pg_dump -h localhost -U TikTrakDBAdmin -d TikTrack-db-development \
  --clean --if-exists \
  --no-owner --no-privileges \
  > /tmp/local_dump_${TIMESTAMP}.sql

# 3. ייבא ל-Docker
docker exec -i tiktrack-postgres-dev psql \
  -U TikTrakDBAdmin \
  -d TikTrack-db-development \
  < /tmp/local_dump_${TIMESTAMP}.sql

# 4. בדוק שהסנכרון הצליח
python3 scripts/db/verify_schema_match.py

# 5. נקה קבצים זמניים
rm /tmp/local_dump_${TIMESTAMP}.sql
```

---

## 📊 **אימות סנכרון**

### **בדיקה מהירה**

```bash
# השוואת מספר רשומות
python3 << 'EOF'
import os
import sys
sys.path.insert(0, 'Backend')
os.environ['POSTGRES_HOST'] = 'localhost'
os.environ['POSTGRES_DB'] = 'TikTrack-db-development'
os.environ['POSTGRES_USER'] = 'TikTrakDBAdmin'
os.environ['POSTGRES_PASSWORD'] = 'BigMeZoo1974!?'

from sqlalchemy import create_engine, text
import subprocess

local_conn = create_engine(f"postgresql://{os.environ['POSTGRES_USER']}:{os.environ['POSTGRES_PASSWORD']}@{os.environ['POSTGRES_HOST']}/{os.environ['POSTGRES_DB']}")

tables = ['users', 'tickers', 'user_tickers', 'trading_accounts', 
          'trade_plans', 'trades', 'executions', 'cash_flows',
          'alerts', 'notes', 'ai_analysis_requests']

print("📊 השוואת נתונים:")
for table in tables:
    with local_conn.connect() as c:
        local_count = c.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
    
    result = subprocess.run(
        ['docker', 'exec', 'tiktrack-postgres-dev', 'psql', 
         '-U', 'TikTrakDBAdmin', '-d', 'TikTrack-db-development', 
         '-t', '-c', f'SELECT COUNT(*) FROM {table};'],
        capture_output=True, text=True
    )
    docker_count = int(result.stdout.strip())
    
    status = "✅" if local_count == docker_count else "❌"
    print(f"   {status} {table}: local={local_count}, docker={docker_count}")
EOF
```

### **בדיקה מפורטת**

```bash
# בדיקת מבנה מלא
python3 scripts/db/verify_schema_match.py
```

---

## ⚠️ **הערות חשובות**

### **מתי לבצע סנכרון?**

1. **לפני עבודה עם Docker:**
   - אם עבדת על בסיס הנתונים המקומי
   - אם יצרת נתוני דוגמה חדשים
   - אם ביצעת שינויים במבנה (migrations)

2. **לאחר שינויים ב-Docker:**
   - אם עבדת ישירות על Docker
   - אם יש צורך להעתיק שינויים למקומי

### **גיבויים**

- הסקריפט יוצר גיבוי אוטומטי לפני סנכרון
- גיבויים נשמרים ב-`archive/database_backups/`
- שמור גיבויים חשובים לפני שינויים גדולים

### **ביצועים**

- סנכרון של בסיס נתונים גדול (100MB+) יכול לקחת מספר דקות
- השתמש ב-`--verbose` לפרטים נוספים

---

## 🔧 **פתרון בעיות**

### **בעיה: Docker container לא רץ**

```bash
# הפעל את ה-container
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev

# בדוק שהוא רץ
docker ps | grep postgres
```

### **בעיה: שגיאת חיבור למקומי**

```bash
# בדוק שהשרת המקומי רץ
ps aux | grep postgres

# בדוק משתני סביבה
echo $POSTGRES_HOST
echo $POSTGRES_DB
echo $POSTGRES_USER
```

### **בעיה: נתונים לא זהים לאחר סנכרון**

```bash
# הרץ בדיקה מפורטת
python3 scripts/db/verify_schema_match.py

# בדוק לוגים
cat archive/database_backups/docker_pre_sync_*.sql | tail -50
```

---

## 📝 **סיכום**

**תהליך אופטימלי לסנכרון:**

1. ✅ **בדיקה ראשונית:** `python3 scripts/db/verify_schema_match.py`
2. ✅ **סנכרון:** `./scripts/db/sync_local_to_docker.sh`
3. ✅ **אימות:** `python3 scripts/db/verify_schema_match.py`

**תוצאה:** בסיס הנתונים המקומי ו-Docker זהים ב-100% במבנה ובנתונים.

---

**עדכון אחרון:** ינואר 2025  
**גרסה:** 1.0

