# TikTrack PostgreSQL Startup Guide

# ===================================

# מדריך הפעלת שרת TikTrack עם PostgreSQL

**גרסה:** 1.0  
**תאריך עדכון:** נובמבר 2025  
**מפתח:** TikTrack Development Team

---

## 📋 **סקירה כללית**

מערכת TikTrack משתמשת ב-PostgreSQL בלבד.  
**השרת חייב להיות מופעל עם משתני סביבה של PostgreSQL.**

---

## ⚠️ **חשוב מאוד - קריאה לפני הפעלה**

### **❌ מה לא לעשות:**

```bash
# ❌ אל תפעיל כך - חסרים משתני סביבה של PostgreSQL
python3 Backend/app.py
```

### **✅ מה לעשות:**

```bash
# ✅ הדרך הנכונה להפעיל את השרת (מגדיר אוטומטית PostgreSQL)
./start_server.sh

# ✅ או (wrapper לשמירת תאימות):
./start_pg_server.sh
```

> **הערה**: `start_server.sh` מגדיר אוטומטית משתני סביבה של PostgreSQL בסביבת פיתוח!

---

## 🚀 **הפעלת השרת - שלבים**

### **שלב 1: בדיקת PostgreSQL Container**

```bash
# בדוק אם ה-container רץ
docker ps | grep postgres

# אם לא רץ, הפעל אותו:
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev

# המתן עד שה-container מוכן (healthy)
docker ps | grep postgres
```

### **שלב 2: הפעלת השרת**

```bash
# הפעל את השרת עם PostgreSQL
./start_pg_server.sh
```

### **שלב 3: בדיקת חיבור**

```bash
# בדוק שהשרת רץ
curl http://localhost:8080/api/health

# בדוק חיבור לבסיס הנתונים
curl http://localhost:8080/api/system/health
```

---

## 📁 **קבצים חשובים**

### **קבצי הפעלה:**

- **`start_pg_server.sh`** - סקריפט הפעלה עם PostgreSQL (השתמש רק בו!)
- **`start_server.sh`** - סקריפט בסיסי (נקרא על ידי start_pg_server.sh)

### **קבצי תצורה:**

- **`Backend/config/settings.py`** - הגדרות בסיס נתונים
- **`docker/docker-compose.dev.yml`** - הגדרות PostgreSQL container

### **קבצי בסיס נתונים:**

- **PostgreSQL**: Docker volume `postgres-dev-data`

---

## 🔧 **משתני סביבה**

הסקריפט `start_pg_server.sh` מגדיר אוטומטית:

```bash
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"
```

**⚠️ חשוב:** אם אתה מפעיל את השרת ידנית, הקפד להגדיר את כל המשתנים האלה!

---

## 🐳 **ניהול PostgreSQL Container**

### **הפעלה:**

```bash
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev
```

### **עצירה:**

```bash
docker-compose -f docker/docker-compose.dev.yml stop postgres-dev
```

### **הסרה (זהירות - מוחק נתונים!):**

```bash
docker-compose -f docker/docker-compose.dev.yml down -v
```

### **בדיקת סטטוס:**

```bash
docker ps | grep postgres
docker logs tiktrack-postgres-dev
```

### **חיבור ידני ל-PostgreSQL:**

```bash
docker exec -it tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development
```

---

## ⚠️ **פתרון בעיות**

### **בעיה: "No data appears" / "Database connection failed"**

**סיבה:** השרת הופעל בלי משתני סביבה של PostgreSQL.

**פתרון:**

1. עצור את השרת: `kill $(lsof -ti:8080)`
2. הפעל מחדש: `./start_pg_server.sh`

### **בעיה: "PostgreSQL container not running"**

**פתרון:**

```bash
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev
# המתן 10-20 שניות עד שה-container מוכן
docker ps | grep postgres  # בדוק שהוא healthy
```

### **בעיה: "Port 8080 already in use"**

**פתרון:**

```bash
# מצא את התהליך
lsof -ti:8080

# עצור אותו
kill $(lsof -ti:8080)

# או השתמש בסקריפט
./start_server.sh --check-only
```

### **בעיה: "Profile 1 not found for user 1"**

**סיבה:** בסיס הנתונים לא מכיל את הפרופילים הנדרשים.

**פתרון:**

1. בדוק שיש נתונים: `docker exec -it tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "SELECT * FROM preference_profiles;"`
2. אם אין נתונים, טען דאטה התחלתי ממקורות המערכת

---

## 📊 **בדיקת חיבור לבסיס הנתונים**

### **בדיקה מהירה:**

```bash
curl http://localhost:8080/api/system/health | jq '.components.database'
```

### **בדיקה מפורטת:**

```bash
POSTGRES_HOST=localhost POSTGRES_DB=TikTrack-db-development POSTGRES_USER=TikTrakDBAdmin POSTGRES_PASSWORD="BigMeZoo1974!?" python3 << 'PYEOF'
import sys
sys.path.insert(0, 'Backend')
from config.database import engine
from config.settings import DATABASE_URL

print(f"DATABASE_URL: {DATABASE_URL}")
try:
    with engine.connect() as conn:
        result = conn.execute("SELECT 1")
        print("✅ Database connection successful!")
        result = conn.execute("SELECT current_database(), current_user")
        row = result.fetchone()
        print(f"   Database: {row[0]}")
        print(f"   User: {row[1]}")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
PYEOF
```

---

## 📚 **משאבים נוספים**

### **דוקומנטציה קשורה:**

- [Server Management Guide](SERVER_MANAGEMENT_GUIDE.md) - מדריך ניהול שרת כללי
- [Database Migration Plan](../05-REPORTS/DB_MIGRATION_EXECUTION_PLAN.md) - תוכנית מיגרציה

### **קבצים חשובים:**

- `start_pg_server.sh` - סקריפט הפעלה
- `Backend/config/settings.py` - הגדרות בסיס נתונים
- `docker/docker-compose.dev.yml` - הגדרות PostgreSQL

---

## 🆘 **תמיכה**

### **במקרה של בעיות:**

1. **בדוק את הלוגים**: `Backend/logs/errors.log`
2. **בדוק את ה-container**: `docker logs tiktrack-postgres-dev`
3. **בדוק חיבור**: הרץ את הבדיקה המפורטת למעלה
4. **פנה לצוות הפיתוח** עם פרטי השגיאה

---

**תאריך עדכון אחרון:** נובמבר 2025  
**גרסה:** 1.0  
**מפתח:** TikTrack Development Team
