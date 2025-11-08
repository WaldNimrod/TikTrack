# TikTrack Production Documentation

**תאריך:** 2025-11-08  
**גרסה:** 1.0.0

---

## 🚀 עדכון פרודקשן - התחלה כאן!

**📖 מדריך עדכון מלא:** [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md)

### תהליך עדכון מהיר:

```bash
# 1. עדכון ומיזוג
git checkout main && git pull origin main
git checkout production && git pull origin production
git merge main

# 2. סינכרון קוד
./scripts/sync_to_production.py

# 3. בדיקות
./scripts/verify_production_isolation.sh

# 4. Commit & Push
git add production/ scripts/ documentation/production/
git commit -m "feat: Update production from main"
git push origin production
```

---

## 📚 מדריכים זמינים

### 1. [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) - ⭐ התחל כאן
**תהליך מלא ומפורט לעדכון פרודקשן**
- תהליך עדכון מפורט (5 שלבים)
- פתרון בעיות
- Checklist לפני commit
- דוגמאות מלאות

### 2. [`CODE_SEPARATION.md`](./CODE_SEPARATION.md)
**הפרדת קוד פרודקשן מסביבת הפיתוח**
- מבנה תקיות
- קבצים בפרודקשן
- תהליך sync
- Git branches

### 3. [`PRODUCTION_SETUP.md`](./PRODUCTION_SETUP.md)
**הקמת סביבת פרודקשן**
- דרישות מוקדמות
- תהליך הקמה
- הפעלת שרת
- תחזוקה

### 4. [`ISOLATION_VERIFICATION.md`](./ISOLATION_VERIFICATION.md)
**בדיקות הפרדה מלאה**
- בדיקות אוטומטיות
- בדיקות ידניות
- וידוא הפרדה

### 5. [`PARALLEL_RUNNING.md`](./PARALLEL_RUNNING.md)
**הרצה במקביל של פיתוח ופרודקשן**
- תשובות לשאלות נפוצות
- פתרונות לבעיות
- המלצות

---

## 🎯 מהירות התחלה

### עדכון פרודקשן (5 דקות)
1. ראה [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md)
2. בצע את 5 השלבים
3. בדוק שהכל עובד

### הקמת פרודקשן חדש (10 דקות)
1. ראה [`PRODUCTION_SETUP.md`](./PRODUCTION_SETUP.md)
2. הרץ `create_production_db.py`
3. הפעל `start_production.sh`

### בדיקת הפרדה (2 דקות)
1. ראה [`ISOLATION_VERIFICATION.md`](./ISOLATION_VERIFICATION.md)
2. הרץ `verify_production_isolation.sh`
3. בדוק את התוצאות

---

## 📋 קבצים חשובים

### סקריפטים
- `scripts/sync_to_production.py` - סינכרון קוד
- `scripts/sync_ui_to_production.py` - סינכרון UI
- `scripts/verify_production_isolation.sh` - בדיקת הפרדה
- `scripts/verify_production.sh` - בדיקת מבנה

### הגדרות
- `production/Backend/config/settings.py` - הגדרות פרודקשן
- `production/start_production.sh` - הפעלת שרת

### תיעוד
- `documentation/production/UPDATE_PROCESS.md` - ⭐ תהליך עדכון
- `documentation/production/CODE_SEPARATION.md` - הפרדת קוד
- `documentation/production/PRODUCTION_SETUP.md` - הקמת סביבה

---

## 🔗 קישורים מהירים

- **עדכון פרודקשן:** [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md)
- **הקמת סביבה:** [`PRODUCTION_SETUP.md`](./PRODUCTION_SETUP.md)
- **בדיקות:** [`ISOLATION_VERIFICATION.md`](./ISOLATION_VERIFICATION.md)

---

**עודכן:** 2025-11-08  
**גרסה:** 1.0.0


