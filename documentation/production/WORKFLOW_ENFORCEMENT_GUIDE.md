# Workflow Enforcement Guide
# ===========================
# מדריך לאכיפת תהליכי עבודה מסודרים

**תאריך:** נובמבר 2025  
**גרסה:** 1.0

---

## 📋 **סקירה כללית**

מדריך זה מפרט את תהליכי העבודה המסודרים שצריך לעקוב אחריהם כדי לשמור על בידוד תקין בין סביבות פיתוח ופרודקשן.

---

## ✅ **כללי הזהב**

### **1. תמיד לעבוד דרך Git**
- ✅ כל שינוי דרך Git
- ✅ פיתוח → main → production
- ❌ לא לעדכן ישירות בפרודקשן

### **2. תמיד לבדוק בפיתוח קודם**
- ✅ לבדוק כל שינוי בפיתוח
- ✅ רק אחרי בדיקה - להעביר לפרודקשן
- ❌ לא לבדוק ישירות בפרודקשן

### **3. תמיד לגבות לפני שינויים**
- ✅ גיבוי לפני כל שינוי בפרודקשן
- ✅ שמירת גיבויים נפרדים
- ❌ לא לעשות שינויים בלי גיבוי

### **4. תמיד לבדוק את הסביבה**
- ✅ לבדוק איזו סביבה אתה משנה
- ✅ לבדוק database name נכון
- ✅ לבדוק פורט נכון
- ❌ לא להניח - תמיד לבדוק

---

## 🔧 **כלים לאכיפת תהליכים**

### **1. סקריפט בדיקת תהליך עבודה**

```bash
./scripts/db/enforce_workflow.sh
```

**מה הסקריפט בודק:**
- ✅ Git status (שינויים לא שמורים)
- ✅ Branch נכון (production/development)
- ✅ Database environment variables
- ✅ Port נכון
- ✅ שינויים ישירים בפרודקשן
- ✅ גיבויים לפני שינויים

**מתי להריץ:**
- לפני כל שינוי
- לפני commit
- לפני merge

---

### **2. סקריפט בדיקת בטיחות לפני שינוי**

```bash
./scripts/db/pre_change_check.sh
```

**מה הסקריפט בודק:**
- ✅ Git status נקי
- ✅ גיבוי database (בפרודקשן)
- ✅ Database environment נכון
- ✅ אישור מפורש (בפרודקשן)

**מתי להריץ:**
- לפני כל שינוי בפרודקשן
- לפני הרצת סקריפטי מיגרציה
- לפני שינויים ב-database

---

## 📋 **תהליכי עבודה מפורטים**

### **תהליך 1: שינוי בפיתוח**

```bash
# 1. בדוק תהליך עבודה
./scripts/db/enforce_workflow.sh

# 2. בצע שינוי
# ... עשה את השינוי ...

# 3. בדוק שהכל עובד
# ... בדוק בפיתוח ...

# 4. Commit
git add .
git commit -m "feat: Description of change"

# 5. Push ל-main
git push origin main
```

---

### **תהליך 2: העברת שינוי לפרודקשן**

```bash
# בפרודקשן:

# 1. בדוק תהליך עבודה
./scripts/db/enforce_workflow.sh

# 2. בדיקת בטיחות לפני שינוי
./scripts/db/pre_change_check.sh

# 3. עדכון מ-main
git checkout production
git pull origin production
git merge main

# 4. בדוק שהכל עובד
# ... בדוק בפרודקשן ...

# 5. Commit
git add .
git commit -m "feat: Update from main - [description]"
git push origin production
```

---

### **תהליך 3: שינוי ישיר בפרודקשן (לא מומלץ!)**

```bash
# ⚠️ רק במקרים חריגים!

# 1. בדיקת בטיחות
./scripts/db/pre_change_check.sh

# 2. גיבוי
./scripts/db/backup_postgresql_production.sh

# 3. בצע שינוי
# ... עשה את השינוי ...

# 4. Commit מיד
git add .
git commit -m "fix: Emergency fix in production - [description]"
git push origin production

# 5. העבר לפיתוח
# ... העתק את השינוי לפיתוח ...
```

---

## 🚨 **אזהרות קריטיות**

### **אזהרה 1: שינוי ב-database הלא נכון**

**סימנים:**
- שינוי בפיתוח אבל נתונים משתנים בפרודקשן
- שינוי בפרודקשן אבל נתונים משתנים בפיתוח

**פתרון:**
```bash
# תמיד לבדוק לפני שינוי
echo $POSTGRES_DB

# או
./scripts/db/enforce_workflow.sh
```

---

### **אזהרה 2: שינוי ישיר בפרודקשן**

**סימנים:**
- שינויים לא שמורים בפרודקשן
- אין merge מ-main

**פתרון:**
```bash
# בדוק תהליך עבודה
./scripts/db/enforce_workflow.sh

# אם יש שינויים - commit או revert
git status
git add .
git commit -m "fix: Direct production change - [description]"
```

---

### **אזהרה 3: שינוי בלי גיבוי**

**סימנים:**
- שינוי בפרודקשן בלי גיבוי
- אין גיבוי אחרון

**פתרון:**
```bash
# תמיד להריץ לפני שינוי
./scripts/db/pre_change_check.sh

# או ידנית
./scripts/db/backup_postgresql_production.sh
```

---

## 📊 **Checklist לפני כל שינוי**

### **בפיתוח:**
- [ ] הרצתי `enforce_workflow.sh`
- [ ] בדקתי שהכל עובד
- [ ] Committed ל-Git
- [ ] Pushed ל-main

### **בפרודקשן:**
- [ ] הרצתי `enforce_workflow.sh`
- [ ] הרצתי `pre_change_check.sh`
- [ ] יצרתי גיבוי
- [ ] בדקתי database name נכון
- [ ] עדכנתי מ-main
- [ ] בדקתי שהכל עובד
- [ ] Committed ל-Git
- [ ] Pushed ל-production

---

## 🔗 **קישורים**

- [מדריך בידוד סביבות](ENVIRONMENT_ISOLATION_GUIDE.md)
- [מדריך מיגרציה ראשי](PRODUCTION_MIGRATION_MASTER_GUIDE.md)
- [מדריך ביצוע](PRODUCTION_MIGRATION_EXECUTION_GUIDE.md)

---

**תאריך עדכון אחרון:** נובמבר 2025  
**גרסה:** 1.0

