# Environment Isolation Guide
# =============================
# מדריך לבידוד סביבות פיתוח ופרודקשן

**תאריך:** נובמבר 2025  
**גרסה:** 1.0

---

## ⚠️ **בעיית הבידוד**

### **המצב הנוכחי:**
- ✅ שתי הסביבות (פיתוח ופרודקשן) על אותו מחשב
- ✅ שתי הסביבות משתמשות באותו Docker container (`tiktrack-postgres-dev`)
- ✅ ההפרדה היא רק ב:
  - תיקיות נפרדות
  - פורט שרת שונה (8080 vs 5001)
  - Database names נפרדים (`TikTrack-db-development` vs `TikTrack-db-production`)

### **הסיכונים:**
- ❌ אם container נפל - שתי הסביבות נפגעות
- ❌ אם יש בעיה ב-container - שתי הסביבות נפגעות
- ❌ קשה לבדוק שינויים בלי להשפיע על השני
- ❌ אין בידוד אמיתי ברמת התשתית

---

## ✅ **אסטרטגיית בידוד - רמות הגנה**

### **רמה 1: הפרדת Databases (כבר קיים) ✅**

**מה יש:**
- `TikTrack-db-development` - לפיתוח
- `TikTrack-db-production` - לפרודקשן

**איך זה עובד:**
- כל סביבה מתחברת ל-database שלה בלבד
- אין גישה cross-database (אלא אם כן מפורש)

**אימות:**
```bash
# בדיקת databases
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -l | grep TikTrack

# תוצאה צפויה:
# TikTrack-db-development
# TikTrack-db-production
```

---

### **רמה 2: Environment Variables נפרדים**

**מה צריך:**
- כל סביבה משתמשת במשתני סביבה שונים
- משתני סביבה מוגדרים בסקריפטי הפעלה

**איך זה עובד:**

**פיתוח (`start_server.sh`):**
```bash
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"
```

**פרודקשן (`start_server.sh`):**
```bash
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-production
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"
```

**אימות:**
```bash
# בפיתוח
./start_server.sh
# בדוק: echo $POSTGRES_DB -> TikTrack-db-development

# בפרודקשן
./start_server.sh
# בדוק: echo $POSTGRES_DB -> TikTrack-db-production
```

---

### **רמה 3: תיקיות נפרדות (כבר קיים) ✅**

**מה יש:**
- פיתוח: `/Users/nimrod/Documents/TikTrack/TikTrackApp`
- פרודקשן: `/Users/nimrod/Documents/TikTrack/TikTrackApp-Production`

**איך זה עובד:**
- כל סביבה בקוד נפרד
- כל סביבה בלוגים נפרדים
- כל סביבה בהגדרות נפרדות

---

### **רמה 4: פורטים נפרדים (כבר קיים) ✅**

**מה יש:**
- פיתוח: פורט `8080`
- פרודקשן: פורט `5001`

**איך זה עובד:**
- כל סביבה מאזינה על פורט שונה
- אין התנגשויות

---

### **רמה 5: תהליכי עבודה מסודרים**

**מה צריך:**

#### **1. תהליך עדכון מסודר:**
- פיתוח → main → production
- לא לעדכן ישירות בפרודקשן
- תמיד דרך Git

#### **2. בדיקות לפני שינויים:**
- תמיד לבדוק בפיתוח קודם
- רק אחרי בדיקה - להעביר לפרודקשן

#### **3. גיבויים לפני שינויים:**
- תמיד לגבות לפני שינויים בפרודקשן
- שמירת גיבויים נפרדים

---

## 🔒 **הגנות נוספות**

### **1. Database User Permissions**

**המלצה:** יצירת users נפרדים (אם אפשר)

```sql
-- User לפיתוח
CREATE USER tiktrack_dev WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE "TikTrack-db-development" TO tiktrack_dev;

-- User לפרודקשן
CREATE USER tiktrack_prod WITH PASSWORD 'prod_password';
GRANT ALL PRIVILEGES ON DATABASE "TikTrack-db-production" TO tiktrack_prod;
```

**יתרונות:**
- בידוד ברמת הרשאות
- אם user אחד נפרץ - השני בטוח

**חסרונות:**
- יותר מורכב לניהול
- צריך לעדכן את כל הקונפיגורציות

---

### **2. Docker Networks נפרדים (אם נדרש)**

**אם רוצים בידוד מלא יותר:**

```yaml
# docker-compose.dev.yml
networks:
  dev-network:
    name: tiktrack-dev-network

# docker-compose.prod.yml (חדש)
networks:
  prod-network:
    name: tiktrack-prod-network
```

**יתרונות:**
- בידוד ברמת רשת
- containers לא יכולים לתקשר

**חסרונות:**
- יותר מורכב
- צריך containers נפרדים

---

### **3. Volumes נפרדים**

**כבר קיים:**
- כל database ב-volume נפרד
- נתונים לא מתערבבים

---

## 📋 **Checklist לבידוד**

### **לפני כל שינוי:**

- [ ] בדוק איזו סביבה אתה משנה
- [ ] ודא שמשתני הסביבה נכונים
- [ ] בדוק שהפורט נכון
- [ ] ודא שה-database name נכון

### **במהלך עבודה:**

- [ ] אל תערבב בין סביבות
- [ ] אל תשנה database של סביבה אחרת
- [ ] אל תעצור container בלי לבדוק מי משתמש

### **אחרי שינוי:**

- [ ] בדוק שהסביבה שלך עובדת
- [ ] בדוק שהסביבה השנייה לא נפגעה
- [ ] תיעד שינויים

---

## 🚨 **תרחישי סיכון ופתרונות**

### **תרחיש 1: Container נפל**

**מה קורה:**
- שתי הסביבות נפגעות

**פתרון:**
```bash
# בדיקה מהירה
docker ps | grep postgres

# אם לא רץ - הפעל
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev

# בדוק ששתי הסביבות עובדות
# פיתוח: curl http://localhost:8080/api/system/health
# פרודקשן: curl http://localhost:5001/api/system/health
```

---

### **תרחיש 2: Database נמחק בטעות**

**מה קורה:**
- אם נמחק database אחד - רק סביבה אחת נפגעת

**פתרון:**
```bash
# גיבוי אוטומטי לפני כל שינוי
./scripts/db/backup_postgresql_production.sh

# שחזור מגיבוי
docker exec -i tiktrack-postgres-dev psql \
  -U TikTrakDBAdmin \
  -d TikTrack-db-production \
  < archive/database_backups/TikTrack-db-production_YYYYMMDD_HHMMSS.sql
```

---

### **תרחיש 3: שינוי בטעות ב-database הלא נכון**

**מה קורה:**
- שינוי בפיתוח במקום פרודקשן או להיפך

**פתרון:**
- תמיד לבדוק `POSTGRES_DB` לפני שינוי
- להשתמש בסקריפטים שמכירים את הסביבה
- לא לעשות שינויים ידניים ב-SQL

---

### **תרחיש 4: Container restart משפיע על שתי הסביבות**

**מה קורה:**
- restart של container משפיע על שתי הסביבות

**פתרון:**
- תמיד לבדוק מי משתמש ב-container לפני restart
- לתאם עם צוותים אחרים
- להשתמש ב-health checks

---

## 🔧 **כלים לבדיקת בידוד**

### **1. סקריפט בדיקת בידוד**

```bash
#!/bin/bash
# check_isolation.sh

echo "=== Environment Isolation Check ==="

# בדיקת databases
echo "Databases:"
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -lqt | grep TikTrack

# בדיקת פורטים
echo ""
echo "Ports:"
lsof -i :8080 | grep LISTEN  # פיתוח
lsof -i :5001 | grep LISTEN   # פרודקשן

# בדיקת משתני סביבה
echo ""
echo "Environment variables (if server running):"
# צריך לבדוק בתהליך השרת
```

### **2. בדיקת חיבורים**

```bash
# בדיקת חיבור לפיתוח
psql -h localhost -U TikTrakDBAdmin -d TikTrack-db-development -c "SELECT current_database();"

# בדיקת חיבור לפרודקשן
psql -h localhost -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT current_database();"
```

---

## 📊 **טבלת בידוד**

| רכיב | פיתוח | פרודקשן | בידוד |
|------|--------|----------|-------|
| **תיקייה** | `/TikTrackApp` | `/TikTrackApp-Production` | ✅ מלא |
| **פורט** | `8080` | `5001` | ✅ מלא |
| **Database** | `TikTrack-db-development` | `TikTrack-db-production` | ✅ מלא |
| **Docker Container** | `tiktrack-postgres-dev` | `tiktrack-postgres-dev` | ❌ משותף |
| **Docker Network** | משותף | משותף | ❌ משותף |
| **User** | `TikTrakDBAdmin` | `TikTrakDBAdmin` | ❌ משותף |
| **Volumes** | נפרד | נפרד | ✅ מלא |

---

## 🎯 **המלצות**

### **בידוד טוב (נוכחי):**
- ✅ Databases נפרדים
- ✅ תיקיות נפרדות
- ✅ פורטים נפרדים
- ✅ Environment variables נפרדים

### **שיפורים אפשריים:**
- ⚠️ Users נפרדים (אם נדרש)
- ⚠️ Networks נפרדים (אם נדרש)
- ⚠️ Containers נפרדים (אם נדרש - מורכב יותר)

### **חשוב:**
- ✅ תהליכי עבודה מסודרים
- ✅ בדיקות לפני שינויים
- ✅ גיבויים לפני שינויים
- ✅ תיעוד שינויים

---

## 🔗 **קישורים**

- [מדריך מיגרציה ראשי](PRODUCTION_MIGRATION_MASTER_GUIDE.md)
- [מדריך ביצוע](PRODUCTION_MIGRATION_EXECUTION_GUIDE.md)
- [רשימת בדיקות](PRODUCTION_MIGRATION_CHECKLIST.md)

---

**תאריך עדכון אחרון:** נובמבר 2025  
**גרסה:** 1.0

