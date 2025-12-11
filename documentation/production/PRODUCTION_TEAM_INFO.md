# מידע לצוות הפרודקשן - Production Team Information

**תאריך:** 2025-01-21  
**גרסה:** 1.0.0  
**מטרה:** מסמך מרכזי עם כל המידע הנדרש לצוות הפרודקשן

---

## 🎯 מטרת המסמך

מסמך זה מכיל את כל המידע שצוות הפרודקשן צריך לדעת כדי לבצע עדכון פרודקשן בצורה נכונה ובטוחה.

---

## 📋 מידע כללי

### תהליך עדכון מלא

ראה [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) לתהליך מפורט.

### תהליך מהיר

```bash
# 1. שמירת שינויים בפרודקשן (אם יש)
python3 scripts/production-update/preserve_production_changes.py

# 2. עדכון מ-main
git pull origin production
git merge main

# 3. הרצת Master Script
python3 scripts/production-update/master.py

# 4. תיעוד עדכוני שרת (אם יש שינויים)
python3 scripts/production-update/document_server_changes.py
```

---

## ⚠️ נקודות קריטיות

### 1. שמירת שינויים בפרודקשן

**קריטי:** לפני כל merge, יש לשמור שינויים שנעשו ישירות בפרודקשן!

```bash
# בדיקת שינויים
git status

# שמירת שינויים (אם יש)
python3 scripts/production-update/preserve_production_changes.py
```

**קבצים שצריך לשמור:**

- `production/Backend/config/settings.py`
- `production/Backend/config/logging.py`
- `production/Backend/config/database.py`
- כל שינוי אחר שנעשה ישירות בפרודקשן

### 2. Conflict Resolution

**Conflict resolver שומר אוטומטית על:**

- כל הקבצים ב-`production/Backend/config/`
- קבצי DB ו-logs

**אם יש קונפליקטים אחרים:**

- פתור ידנית
- ודא שהקוד תקין

### 3. הגדרות Production

**אחרי כל sync, ודא:**

- `IS_PRODUCTION = True` (hardcoded)
- `PORT = 5001` (hardcoded)
- `DEVELOPMENT_MODE = False`
- `CACHE_DISABLED = False`

Master Script מתקן זאת אוטומטית, אבל תמיד כדאי לבדוק.

---

## 📝 מסמכי עבודה משותפים

ראה [`SHARED_WORKSPACE.md`](./SHARED_WORKSPACE.md) לפרטים על:

- אילו מסמכים משותפים
- איך לעבוד איתם בלי לדרוס
- איך לראות עדכונים

### מסמכים עיקריים

1. **`UPDATE_PROCESS.md`** - תהליך עדכון מלא
   - סביבת הפיתוח: מעדכנת שלב 0 (הכנה)
   - סביבת הפרודקשן: מעדכנת שלבים 1-6

2. **`SERVER_CHANGES.md`** - תיעוד שינויים בשרת
   - סביבת הפרודקשן: מעדכנת עם שינויים ב-config
   - סביבת הפיתוח: קוראת לראות שינויים

3. **`PRODUCTION_DEVELOPER_GUIDE.md`** - מדריך למפתחי פרודקשן
   - שני הצדדים: יכולים לעדכן

4. **`SHARED_WORKSPACE.md`** - הגדרת מסמכי עבודה משותפים
   - שני הצדדים: יכולים לעדכן

---

## 🔄 תהליך סינכרון

### שלב 1: הכנה (סביבת הפיתוח)

סביבת הפיתוח מבצעת:

1. Commit & Push ל-main
2. יצירת changelog
3. Pre-sync validation

### שלב 2: עדכון (סביבת הפרודקשן)

סביבת הפרודקשן מבצעת:

1. שמירת שינויים בפרודקשן (אם יש)
2. Merge מ-main
3. הרצת Master Script
4. תיעוד עדכוני שרת

---

## 📊 מידע טכני

### Master Script

**מיקום:** `scripts/production-update/master.py`

**שלבים:**

1. Collect Changes
2. Merge Main (עם conflict resolver)
3. Cleanup Documentation
4. Backup Database
5. Sync Code (Backend + UI)
6. Cleanup Backups
7. Fix Config
8. Validate
9. Bump Version
10. Commit & Push
11. Start Server (אופציונלי)

**שימוש:**

```bash
# כל השלבים
python3 scripts/production-update/master.py

# שלבים ספציפיים
python3 scripts/production-update/master.py --steps 1,2,5

# דילוג על שלבים
python3 scripts/production-update/master.py --skip 11

# Dry-run
python3 scripts/production-update/master.py --dry-run
```

### כלי עזר

- **`preserve_production_changes.py`** - שמירת שינויים בפרודקשן
- **`document_server_changes.py`** - תיעוד עדכוני שרת
- **`sync_verifier.py`** - בדיקת sync עם checksums
- **`pre_sync_validation.py`** - בדיקת מוכנות לפני sync

---

## 🆘 פתרון בעיות

### בעיה: קונפליקטים במיזוג

**פתרון:**

- Conflict resolver שומר אוטומטית על קבצי config של production
- אם יש קונפליקטים אחרים, פתור ידנית

### בעיה: שינויים אבדו אחרי merge

**פתרון:**

- ודא ששמרת את השינויים ב-git לפני merge
- השתמש ב-`preserve_production_changes.py`

### בעיה: הגדרות production לא נכונות

**פתרון:**

- Master Script מתקן אוטומטית
- אם לא, תקן ידנית ב-`config/settings.py`

---

## 📞 תקשורת

### איך לראות עדכונים מסביבת הפיתוח

```bash
# רשימת commits אחרונים
git log --oneline origin/main -10

# השוואה
git diff main..production -- documentation/production/

# קריאת מסמכים
cat documentation/production/UPDATE_PROCESS.md
cat documentation/production/SERVER_CHANGES.md
```

### איך לעדכן את סביבת הפיתוח

```bash
# Commit שינויים
git add documentation/production/
git commit -m "docs: Update production documentation [תיאור]"
git push origin production

# סביבת הפיתוח תראה את העדכונים ב-merge הבא
```

---

## ✅ Checklist לפני עדכון

- [ ] כל השינויים בפרודקשן נשמרו ב-git
- [ ] כל השינויים בפרודקשן נדחפו ל-production branch
- [ ] אין שינויים לא שמורים בפרודקשן
- [ ] Master Script מוכן לרוץ
- [ ] יש גיבוי של DB (אופציונלי, אבל מומלץ)

---

## 📚 מסמכים נוספים

- [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) - תהליך עדכון מלא
- [`PRODUCTION_DEVELOPER_GUIDE.md`](./PRODUCTION_DEVELOPER_GUIDE.md) - מדריך למפתחי פרודקשן
- [`SHARED_WORKSPACE.md`](./SHARED_WORKSPACE.md) - מסמכי עבודה משותפים
- [`SERVER_CHANGES.md`](./SERVER_CHANGES.md) - תיעוד שינויים בשרת

---

**עודכן:** 2025-01-21  
**גרסה:** 1.0.0

