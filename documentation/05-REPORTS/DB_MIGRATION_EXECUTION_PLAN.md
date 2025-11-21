# תוכנית עבודה מפורטת - ביצוע מיגרציה SQLite → PostgreSQL

**תאריך עדכון:** 17 November 2025  
**סטטוס:** ✅ מוכן לביצוע  
**מטרה:** העברת נתונים מ-SQLite ל-PostgreSQL עם אימות מלא

---

## 📋 סקירה כללית

תוכנית זו מפרטת את כל הצעדים הנדרשים לביצוע המיגרציה בפועל, כולל:
- הכנות לפני המיגרציה
- יצירת סכמת PostgreSQL
- העתקת נתונים
- אימותים ובדיקות
- נקודות rollback

**זמן משוער:** 2-3 שעות  
**רמת סיכון:** בינונית (כל הפעולות על בסיס נתונים נפרד)

---

## ✅ דרישות מוקדמות

### 1. תשתית PostgreSQL
- [x] Docker Compose מוכן (`docker/docker-compose.dev.yml`)
- [x] PostgreSQL databases נוצרו:
  - `TikTrack-db-development`
  - `TikTrack-db-prodution`
- [x] Database user נוצר: `TikTrakDBAdmin`

### 2. גיבויים
- [x] גיבוי מלא של SQLite database
- [x] גיבוי קוד ל-GitHub
- [x] אימות תקינות קבצי הגיבוי

### 3. תשתית קוד
- [x] כל ה-SQLAlchemy models קיימים ומעודכנים
- [x] סקריפטי המיגרציה מוכנים
- [x] כלי אימות מוכנים

---

## 🚀 שלב 1: הכנות אחרונות

### 1.1 בדיקת סביבת PostgreSQL

```bash
# בדיקה שהדוקר רץ
docker ps | grep postgres

# בדיקה שהמסד נתונים קיימים
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "\dt"
```

**תוצאה צפויה:** רשימת טבלאות ריקה (או טבלאות קיימות אם כבר בוצעה מיגרציה חלקית)

### 1.2 אימות גיבויים

```bash
# בדיקת תקינות גיבוי SQLite
sqlite3 backup/db/tiktrack.db "PRAGMA integrity_check;"

# בדיקת גיבוי קוד
tar -tzf backup/code-backup.tar.gz | head -20
```

**תוצאה צפויה:** `ok` עבור SQLite, רשימת קבצים עבור קוד

### 1.3 בדיקת תצורת חיבור

```bash
# בדיקת חיבור ל-PostgreSQL
export DATABASE_URL="postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"
python3 -c "from sqlalchemy import create_engine; engine = create_engine('$DATABASE_URL'); print('✅ Connection OK')"
```

**תוצאה צפויה:** `✅ Connection OK`

---

## 🏗️ שלב 2: יצירת סכמת PostgreSQL

### 2.1 יצירת כל הטבלאות מ-SQLAlchemy Models

**סקריפט:** `Backend/config/database.py` - `init_db()`

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp

# הגדרת חיבור ל-PostgreSQL
export POSTGRES_HOST="localhost"
export POSTGRES_PORT="5432"
export POSTGRES_DB="TikTrack-db-development"
export POSTGRES_USER="TikTrakDBAdmin"
export POSTGRES_PASSWORD="BigMeZoo1974!?"
export DATABASE_URL="postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"

# יצירת סכמה
python3 << 'PYTHON_SCRIPT'
import sys
import os
sys.path.insert(0, 'Backend')

# הגדרת environment variables
os.environ['POSTGRES_HOST'] = 'localhost'
os.environ['POSTGRES_DB'] = 'TikTrack-db-development'
os.environ['POSTGRES_USER'] = 'TikTrakDBAdmin'
os.environ['POSTGRES_PASSWORD'] = 'BigMeZoo1974!?'
os.environ['DATABASE_URL'] = 'postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development'

from config.database import init_db
print("🏗️  Creating PostgreSQL schema from SQLAlchemy models...")
try:
    init_db()
    print("✅ Schema creation complete")
except Exception as e:
    print(f"❌ Error creating schema: {e}")
    raise
PYTHON_SCRIPT
```

**תוצאה צפויה:** כל הטבלאות נוצרו ללא שגיאות

**הערה:** אם יש שגיאות, בדוק:
- שהמסד נתונים קיים
- שהמשתמש `TikTrakDBAdmin` קיים ויש לו הרשאות
- שהחיבור ל-PostgreSQL עובד

### 2.2 אימות יצירת הטבלאות

```bash
# ספירת טבלאות
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# רשימת טבלאות
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "\dt" | head -50
```

**תוצאה צפויה:** לפחות 36 טבלאות (כל הטבלאות מקבוצות B-F)

### 2.3 בדיקת Foreign Keys ו-Indexes

```bash
# בדיקת Foreign Keys
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';"

# בדיקת Indexes
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';"
```

**תוצאה צפויה:** Foreign Keys ו-Indexes נוצרו בהצלחה

---

## 📦 שלב 3: העתקת נתונים

### 3.1 הרצת סקריפט המיגרציה

**סקריפט:** `scripts/db/migrate_sqlite_to_pg.py`

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp

# הגדרת משתני סביבה
export SQLITE_MIGRATION_PATH="Backend/db/tiktrack.db"
export POSTGRES_HOST="localhost"
export POSTGRES_PORT="5432"
export POSTGRES_DB="TikTrack-db-development"
export POSTGRES_USER="TikTrakDBAdmin"
export POSTGRES_PASSWORD="BigMeZoo1974!?"
export DATABASE_URL="postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"

# הרצת המיגרציה
python3 scripts/db/migrate_sqlite_to_pg.py
```

**הערות חשובות:**
- הסקריפט מעתיק רק טבלאות מקבוצות B-F (reference data)
- טבלאות מקבוצה A (business entities) לא מועתקות - רק סכמה נוצרת
- הסקריפט מבצע `TRUNCATE` לפני העתקה (זה בטוח כי זה development DB)

**תוצאה צפויה:**
```
✅ users: copied X rows from users
✅ preference_types: copied Y rows from preference_types
✅ preference_groups: copied Z rows from preference_groups
...
Migration summary:
 - users: X rows copied
 - preference_types: Y rows copied
 ...
```

### 3.2 אימות ספירת רשומות

```bash
# השוואת ספירות בין SQLite ל-PostgreSQL
python3 << 'PYTHON_SCRIPT'
import sqlite3
from sqlalchemy import create_engine, text

sqlite_path = "Backend/db/tiktrack.db"
pg_url = "postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"

sqlite_conn = sqlite3.connect(sqlite_path)
pg_engine = create_engine(pg_url)

tables = [
    'users', 'preference_types', 'preference_groups', 'preference_profiles',
    'user_preferences', 'preferences_legacy', 'trading_methods', 'method_parameters',
    'constraints', 'constraint_validations', 'enum_values', 'note_relation_types',
    'currencies', 'external_data_providers', 'quotes_last',
    'system_setting_types', 'system_settings', 'system_setting_groups',
    'tag_categories', 'tags'
]

print("📊 Comparing row counts:\n")
for table in tables:
    try:
        sqlite_count = sqlite_conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        with pg_engine.connect() as conn:
            pg_count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).fetchone()[0]
        
        status = "✅" if sqlite_count == pg_count else "❌"
        print(f"{status} {table}: SQLite={sqlite_count}, PostgreSQL={pg_count}")
    except Exception as e:
        print(f"⚠️  {table}: Error - {e}")

sqlite_conn.close()
PYTHON_SCRIPT
```

**תוצאה צפויה:** כל הטבלאות עם `✅` - ספירות זהות

---

## ✅ שלב 4: אימותים ובדיקות

### 4.1 אימות Foreign Keys

```bash
# בדיקת תקינות Foreign Keys
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;
" | head -50
```

**תוצאה צפויה:** רשימת Foreign Keys תקינים

### 4.2 אימות Constraints

```bash
# בדיקת Constraints דינמיים
python3 scripts/db/export_constraints_from_sqlite.py | grep -c "constraint_type"
```

**תוצאה צפויה:** לפחות 114 constraints פעילים

### 4.3 אימות נתונים קריטיים

```bash
# בדיקת נתונים קריטיים
python3 << 'PYTHON_SCRIPT'
from sqlalchemy import create_engine, text

pg_url = "postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"
engine = create_engine(pg_url)

checks = [
    ("users", "SELECT COUNT(*) FROM users WHERE is_default = true"),
    ("currencies", "SELECT COUNT(*) FROM currencies WHERE symbol = 'USD'"),
    ("preference_types", "SELECT COUNT(*) FROM preference_types"),
    ("trading_methods", "SELECT COUNT(*) FROM trading_methods WHERE is_active = true"),
]

print("🔍 Critical data verification:\n")
for name, query in checks:
    with engine.connect() as conn:
        result = conn.execute(text(query)).fetchone()[0]
        status = "✅" if result > 0 else "⚠️"
        print(f"{status} {name}: {result} records")
PYTHON_SCRIPT
```

**תוצאה צפויה:** כל הבדיקות עם `✅` - נתונים קיימים

### 4.4 בדיקת תקינות Constraints דינמיים

```bash
# בדיקת תקינות Enum Values
python3 << 'PYTHON_SCRIPT'
from sqlalchemy import create_engine, text

pg_url = "postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"
engine = create_engine(pg_url)

with engine.connect() as conn:
    # בדיקת Enum Values
    enum_count = conn.execute(text("SELECT COUNT(*) FROM enum_values WHERE is_active = true")).fetchone()[0]
    constraint_count = conn.execute(text("SELECT COUNT(*) FROM constraints WHERE constraint_type = 'ENUM' AND is_active = true")).fetchone()[0]
    
    print(f"📊 Enum Constraints: {constraint_count}")
    print(f"📊 Enum Values: {enum_count}")
    print(f"✅ Ratio: {enum_count / constraint_count if constraint_count > 0 else 0:.1f} values per constraint")
PYTHON_SCRIPT
```

**תוצאה צפויה:** Enum Values תקינים

---

## 🔄 שלב 5: יישום Triggers ו-Constraints נוספים

### 5.1 יישום Triggers

**סקריפט:** `scripts/db/convert_triggers_to_postgres.py`

```bash
# יצירת PostgreSQL triggers
python3 scripts/db/convert_triggers_to_postgres.py > /tmp/pg_triggers.sql

# יישום Triggers
docker exec -i tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development < /tmp/pg_triggers.sql
```

**תוצאה צפויה:** Triggers נוצרו בהצלחה

### 5.2 אימות Triggers

```bash
# בדיקת Triggers
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
"
```

**תוצאה צפויה:** לפחות 2 triggers (currency protection)

---

## 🧪 שלב 6: בדיקות פונקציונליות

### 6.1 בדיקת חיבור מהאפליקציה

```bash
# בדיקת חיבור דרך הקוד
python3 << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, 'Backend')
from config.database import SessionLocal
from models.user import User

session = SessionLocal()
try:
    users = session.query(User).limit(5).all()
    print(f"✅ Connection OK - Found {len(users)} users")
    for user in users:
        print(f"   - {user.username} (id: {user.id})")
finally:
    session.close()
PYTHON_SCRIPT
```

**תוצאה צפויה:** חיבור תקין, רשימת משתמשים

### 6.2 בדיקת Preferences Service

```bash
# בדיקת Preferences Service
python3 << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, 'Backend')
from services.preferences_service import PreferencesService

service = PreferencesService()
# בדיקת קבלת preferences
print("✅ PreferencesService initialized successfully")
PYTHON_SCRIPT
```

**תוצאה צפויה:** Service עובד תקין

### 6.3 בדיקת Constraint Service

```bash
# בדיקת Constraint Service
python3 << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, 'Backend')
from services.constraint_service import ConstraintService

service = ConstraintService()
constraints = service.get_all_constraints()
print(f"✅ ConstraintService OK - Found {len(constraints)} constraints")
PYTHON_SCRIPT
```

**תוצאה צפויה:** Service עובד תקין

---

## 📝 שלב 7: תיעוד וסיכום

### 7.1 יצירת דוח מיגרציה

```bash
# יצירת דוח מפורט
python3 << 'PYTHON_SCRIPT'
from sqlalchemy import create_engine, text
from datetime import datetime

pg_url = "postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"
engine = create_engine(pg_url)

report = f"""# Migration Execution Report

**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Database:** TikTrack-db-development
**Status:** ✅ COMPLETED

## Tables Migrated

"""

with engine.connect() as conn:
    tables = conn.execute(text("""
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)).fetchall()
    
    for table_name, col_count in tables:
        row_count = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).fetchone()[0]
        report += f"- **{table_name}**: {row_count} rows, {col_count} columns\n"

print(report)
PYTHON_SCRIPT
```

### 7.2 עדכון מסמכי התקדמות

עדכון `DB_MIGRATION_PROGRESS.md` עם סטטוס "Migration Completed"

---

## 🔙 נקודות Rollback

### Rollback Point 1: לפני יצירת סכמה
**פעולה:** אין צורך - רק יצירת טבלאות

### Rollback Point 2: אחרי יצירת סכמה, לפני העתקת נתונים
```bash
# מחיקת כל הטבלאות
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO TikTrakDBAdmin;
"
```

### Rollback Point 3: אחרי העתקת נתונים
**פעולה:** חזרה ל-SQLite דרך `DATABASE_URL` ב-`Backend/config/settings.py`

---

## ⚠️ נקודות תשומת לב

### 1. טבלאות Group A (Business Entities)
- **לא מועתקות** - רק סכמה נוצרת
- נתונים יוזנו דרך Seed/Fixtures

### 2. איחוד `user_preferences`
- `user_preferences_v3` → `user_preferences`
- `preferences_legacy` נשמר כגיבוי

### 3. טבלאות גיבוי
- `tickers_backup`, `tickers_new`, `lost_and_found` - **לא מועתקות**

### 4. Constraints דינמיים
- מועתקים דרך `constraints` ו-`enum_values`
- יש לוודא שכל ה-constraints פעילים

---

## ✅ Checklist סופי

### לפני המיגרציה
- [ ] גיבוי SQLite מאומת
- [ ] גיבוי קוד ל-GitHub
- [ ] Docker PostgreSQL רץ
- [ ] Databases נוצרו
- [ ] חיבור מאומת

### במהלך המיגרציה
- [ ] סכמה נוצרה בהצלחה
- [ ] כל הטבלאות קיימות
- [ ] נתונים הועתקו
- [ ] ספירות זהות
- [ ] Foreign Keys תקינים

### אחרי המיגרציה
- [ ] Triggers יושמו
- [ ] Constraints דינמיים פעילים
- [ ] Services עובדים
- [ ] בדיקות פונקציונליות עברו
- [ ] דוח נוצר

---

## 📞 תמיכה ועזרה

### בעיות נפוצות

**בעיה:** שגיאת חיבור ל-PostgreSQL  
**פתרון:** 
```bash
# בדוק ש-Docker רץ
docker ps | grep postgres

# בדוק שהמסד נתונים קיים
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "\l"
```

**בעיה:** Foreign Key violations  
**פתרון:** 
- הסקריפט `migrate_sqlite_to_pg.py` מבטל זמנית Foreign Keys לפני העתקה
- אם עדיין יש שגיאות, בדוק סדר העתקת הטבלאות (תלויות)

**בעיה:** Constraints לא פעילים  
**פתרון:** 
```bash
# הרץ סקריפט סינכרון constraints
python3 scripts/db/sync_constraints_postgres.py
```

**בעיה:** שגיאת "table already exists"  
**פתרון:**
```bash
# מחיקת סכמה קיימת (רק development!)
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO TikTrakDBAdmin;
"
```

**בעיה:** שגיאת "permission denied"  
**פתרון:**
```bash
# בדוק הרשאות
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "\du"
```

---

## 🔄 מעבר לשימוש ב-PostgreSQL באפליקציה

לאחר שהמיגרציה הושלמה בהצלחה, כדי שהאפליקציה תשתמש ב-PostgreSQL:

### Development Environment

```bash
# הגדרת environment variables
export POSTGRES_HOST="localhost"
export POSTGRES_DB="TikTrack-db-development"
export POSTGRES_USER="TikTrakDBAdmin"
export POSTGRES_PASSWORD="BigMeZoo1974!?"
export DATABASE_URL="postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"

# הפעלת השרת
./start_server.sh
```

### Production Environment

עדכן את `Backend/config/settings.prod.py` או הגדר environment variables ב-production.

---

## 📊 מדדי הצלחה

המיגרציה נחשבת מוצלחת אם:

1. ✅ כל הטבלאות נוצרו (36+ טבלאות)
2. ✅ כל הנתונים הועתקו (ספירות זהות)
3. ✅ Foreign Keys תקינים
4. ✅ Constraints דינמיים פעילים
5. ✅ Services עובדים (PreferencesService, ConstraintService)
6. ✅ אין שגיאות ב-logs
7. ✅ בדיקות פונקציונליות עברו

---

**סטטוס:** ✅ **מוכן לביצוע**

כל הכלים, הסקריפטים והתשתיות מוכנים. ניתן להתחיל בביצוע המיגרציה.

**זמן משוער:** 2-3 שעות  
**רמת סיכון:** נמוכה (כל הפעולות על בסיס נתונים נפרד, לא משפיע על SQLite הקיים)

