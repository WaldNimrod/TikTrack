# Production Migration Checklist
# ===============================
# רשימת בדיקות למיגרציה של הפרודקשן

**תאריך:** נובמבר 2025

---

## ✅ **לפני המיגרציה**

- [ ] גיבוי מלא של SQLite של הפרודקשן
- [ ] גיבוי קוד ל-Git
- [ ] Docker container `tiktrack-postgres-dev` רץ
- [ ] סקריפטי המיגרציה זמינים בפרודקשן

---

## 🚀 **תהליך המיגרציה**

### **שלב 1: הכנות**
- [ ] עצירת שרת הפרודקשן
- [ ] יצירת גיבוי SQLite: `cp Backend/db/tiktrack.db archive/database_backups/tiktrack_production_YYYYMMDD_HHMMSS.db`
- [ ] בדיקת תקינות הגיבוי

### **שלב 2: יצירת Database**
- [ ] הרצת `./scripts/db/setup_production_postgresql.sh`
- [ ] וידוא שה-database נוצר: `docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -l | grep TikTrack-db-production`
- [ ] וידוא שה-schema נוצר: `docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "\dt"`

### **שלב 3: מיגרציית נתונים**
- [ ] הרצת מיגרציה (אם SQLite קיים): הסקריפט יעשה זאת אוטומטית
- [ ] בדיקת מספר שורות בטבלאות מערכת:
  - [ ] `constraints`: `docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM constraints;"`
  - [ ] `system_settings`: `docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM system_settings;"`
  - [ ] `currencies`: `docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM currencies;"`
- [ ] וידוא שטבלאות משתמשים ריקות:
  - [ ] `tickers`: `docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM tickers;"`
  - [ ] `trades`: `docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM trades;"`

### **שלב 4: עדכון סקריפטים**
- [ ] עדכון `start_server.sh` עם תמיכה ב-PostgreSQL
- [ ] הוספת `setup_postgresql_env()` function
- [ ] הוספת `check_postgresql_container()` function
- [ ] עדכון `start_server()` function להצגת מידע PostgreSQL
- [ ] בדיקת syntax: `bash -n start_server.sh`

### **שלב 5: בדיקות**
- [ ] הפעלת שרת הפרודקשן: `./start_server.sh`
- [ ] בדיקת health endpoint: `curl http://localhost:5001/api/system/health`
- [ ] בדיקת חיבור לבסיס נתונים: `curl http://localhost:5001/api/system/health | jq '.components.database'`
- [ ] בדיקת API endpoints שדורשים טבלאות מערכת
- [ ] הרצת `./scripts/db/verify_production_setup.sh` לאימות מלא

---

## 📊 **טבלאות לבדיקה**

### **טבלאות מערכת (צריכות להכיל נתונים):**
- [ ] `users`
- [ ] `preference_groups`
- [ ] `preference_types`
- [ ] `preference_profiles`
- [ ] `currencies`
- [ ] `external_data_providers`
- [ ] `trading_methods`
- [ ] `method_parameters`
- [ ] `note_relation_types`
- [ ] `tag_categories`
- [ ] `system_setting_groups`
- [ ] `system_setting_types`
- [ ] `system_settings`
- [ ] `constraints`
- [ ] `constraint_validations`
- [ ] `enum_values`

### **טבלאות משתמשים (צריכות להיות ריקות):**
- [ ] `tickers` = 0
- [ ] `trades` = 0
- [ ] `trade_plans` = 0
- [ ] `executions` = 0
- [ ] `cash_flows` = 0
- [ ] `trading_accounts` = 0
- [ ] `alerts` = 0
- [ ] `notes` = 0
- [ ] `tags` = 0

---

## 🔧 **פקודות שימושיות**

### **בדיקת Database:**
```bash
# רשימת databases
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -l

# רשימת טבלאות
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "\dt"

# ספירת רשומות בטבלה
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT COUNT(*) FROM constraints;"
```

### **גיבוי:**
```bash
./scripts/db/backup_postgresql_production.sh
```

### **אימות:**
```bash
./scripts/db/verify_production_setup.sh
```

---

## ⚠️ **נקודות תשומת לב**

1. **SQLite נשאר ללא שינוי** - ניתן לחזור אליו בכל עת
2. **טבלאות משתמשים נשארות ריקות** - זה התנהגות מכוונת
3. **אותו Docker container** - פיתוח ופרודקשן משתמשים באותו container
4. **Database נפרד** - `TikTrack-db-development` ו-`TikTrack-db-production`

---

**תאריך עדכון:** נובמבר 2025


