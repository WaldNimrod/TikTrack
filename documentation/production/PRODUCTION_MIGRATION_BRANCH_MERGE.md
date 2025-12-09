# Production Migration - Branch Merge Guide

# ============================================

# מדריך למזיגת ענף המיגרציה ל-main לפני עדכון הפרודקשן

**תאריך:** נובמבר 2025  
**גרסה:** 1.0

---

## 📋 **סקירה כללית**

כל העבודה על מיגרציית הפרודקשן נעשתה בענף `new-db-uopgrde`.  
לפני שהפרודקשן יוכל להשתמש בסקריפטים, **חובה למזג את הענף ל-main**.

**למה?**

- הפרודקשן מעדכן קוד מ-`main` branch
- הסקריפטים והתיעוד נמצאים ב-`new-db-uopgrde`
- ללא מזיגה ל-main, הפרודקשן לא יקבל את הקבצים

---

## ✅ **תהליך המזיגה**

### **שלב 1: בדיקות אחרונות בענף המיגרציה**

```bash
# ודא שאתה בענף המיגרציה
git checkout new-db-uopgrde

# הרץ את בדיקת הדרישות המוקדמות
./scripts/db/check_production_prerequisites.sh

# ודא שכל הקבצים קיימים
ls -la scripts/db/migrate_production_to_pg.py
ls -la scripts/db/setup_production_postgresql.sh
ls -la scripts/db/backup_postgresql_production.sh
ls -la scripts/db/verify_production_setup.sh
ls -la scripts/db/check_production_prerequisites.sh

# ודא שכל התיעוד קיים
ls -la documentation/production/PRODUCTION_MIGRATION*.md
```

### **שלב 2: עדכון main branch**

```bash
# עדכן את main מה-remote
git checkout main
git pull origin main
```

### **שלב 3: מזיגה ל-main**

```bash
# מזג את new-db-uopgrde ל-main
git merge new-db-uopgrde

# אם יש conflicts, פתור אותם
# אחרי פתרון:
git add .
git commit -m "Merge production PostgreSQL migration from new-db-uopgrde"
```

### **שלב 4: דחיפה ל-remote**

```bash
# דחוף את main ל-GitHub
git push origin main
```

### **שלב 5: אימות**

```bash
# ודא שהקבצים ב-main
git checkout main
ls -la scripts/db/migrate_production_to_pg.py
ls -la documentation/production/PRODUCTION_MIGRATION_MASTER_GUIDE.md
```

---

## 📋 **רשימת קבצים שצריכים להיות ב-main**

### **סקריפטים:**

- ✅ `scripts/db/migrate_production_to_pg.py`
- ✅ `scripts/db/setup_production_postgresql.sh`
- ✅ `scripts/db/backup_postgresql_production.sh`
- ✅ `scripts/db/verify_production_setup.sh`
- ✅ `scripts/db/check_production_prerequisites.sh`
- ✅ `scripts/db/production_start_server_template.sh`

### **תיעוד:**

- ✅ `documentation/production/PRODUCTION_MIGRATION_MASTER_GUIDE.md`
- ✅ `documentation/production/PRODUCTION_MIGRATION_EXECUTION_GUIDE.md`
- ✅ `documentation/production/PRODUCTION_POSTGRESQL_MIGRATION.md`
- ✅ `documentation/production/PRODUCTION_STARTUP_SCRIPT_UPDATE.md`
- ✅ `documentation/production/PRODUCTION_MIGRATION_CHECKLIST.md`
- ✅ `documentation/production/PRODUCTION_MIGRATION_PREREQUISITES.md`
- ✅ `documentation/production/PRODUCTION_MIGRATION_BRANCH_MERGE.md` (זה)

---

## ⚠️ **נקודות חשובות**

### **1. לפני המזיגה:**

- ✅ ודא שכל הבדיקות עוברות
- ✅ ודא שכל הקבצים committed
- ✅ ודא שכל הקבצים pushed ל-remote

### **2. אחרי המזיגה:**

- ✅ ודא שהקבצים ב-main
- ✅ ודא שהפרודקשן יכול לעדכן מ-main
- ✅ עדכן את צוות הפרודקשן שהקבצים מוכנים

### **3. אם יש conflicts:**

- פתור conflicts בזהירות
- ודא שהקבצים החדשים לא נמחקו
- בדוק שוב אחרי פתרון

---

## 🔄 **תהליך עדכון הפרודקשן (אחרי המזיגה)**

לאחר שהקבצים ב-main, הפרודקשן יכול לעדכן:

```bash
# בפרודקשן
git checkout main
git pull origin main

# עכשיו הקבצים זמינים
ls -la scripts/db/migrate_production_to_pg.py
```

---

## 📝 **Checklist לפני מזיגה**

- [ ] כל הבדיקות עוברות: `./scripts/db/check_production_prerequisites.sh`
- [ ] כל הקבצים committed ב-`new-db-uopgrde`
- [ ] כל הקבצים pushed ל-remote
- [ ] `main` branch מעודכן מה-remote
- [ ] מוכן למזיגה

---

## 🔗 **קישורים**

- [מדריך ראשי](PRODUCTION_MIGRATION_MASTER_GUIDE.md)
- [דרישות מוקדמות](PRODUCTION_MIGRATION_PREREQUISITES.md)
- [מדריך ביצוע](PRODUCTION_MIGRATION_EXECUTION_GUIDE.md)

---

**תאריך עדכון אחרון:** נובמבר 2025  
**גרסה:** 1.0

