# TikTrack Production Developer Guide

**תאריך:** 2025-01-21  
**גרסה:** 1.0.0  
**מטרה:** מדריך למפתחי סביבת הפרודקשן

---

## 🎯 מטרת המדריך

מדריך זה מיועד למפתחים שעובדים בסביבת הפרודקשן ומסביר:

- איך לעבוד עם סביבת הפרודקשן
- איך לשמור על סינכרון עם סביבת הפיתוח
- איך למנוע דריסת מידע בין שני הצדדים
- איך לראות עדכונים שביצע הצד השני

---

## 📋 תהליך עבודה בסביבת הפרודקשן

### 1. הכנה לפני עבודה

```bash
# מעבר ל-production worktree
cd /path/to/TikTrackApp-Production

# עדכון מ-remote
git checkout production
git pull origin production
```

### 2. ביצוע שינויים

**שינויים מותרים:**

- הגדרות production (`config/settings.py`, `config/logging.py`)
- תיקוני bugs ספציפיים לפרודקשן
- שינויים ב-DB schema (רק עם תיעוד)

**שינויים אסורים:**

- שינויים בקוד שמגיע מ-main (צריך לעבור דרך main)
- מחיקת קבצים שמגיעים מ-main
- שינויים ב-UI שמגיעים מ-main

### 3. שמירת שינויים

**⚠️ קריטי:** כל שינוי חייב להישמר ב-git לפני merge!

```bash
# בדיקת שינויים
git status

# הוספת שינויים
git add production/Backend/config/

# Commit
git commit -m "chore: Preserve production config changes [תאריך]"

# Push
git push origin production
```

---

## 🔄 סינכרון עם סביבת הפיתוח

### תהליך עדכון מ-main

```bash
# 1. שמירת שינויים בפרודקשן (אם יש)
git add production/Backend/config/
git commit -m "chore: Preserve production config changes"
git push origin production

# 2. עדכון מ-main
git pull origin production
git merge main

# 3. פתרון קונפליקטים (אם יש)
# Conflict resolver שומר אוטומטית על קבצי config של production

# 4. הרצת Master Script
python3 scripts/production-update/master.py
```

### תהליך עדכון מ-production ל-main

**⚠️ זה לא מומלץ!** שינויים בפרודקשן צריכים לעבור דרך main.

אם יש צורך להעביר שינוי מ-production ל-main:

1. בדוק שהשינוי רלוונטי גם לפיתוח
2. העתק את השינוי ידנית ל-main
3. Commit ב-main
4. Push ל-main

---

## 📝 מסמכי עבודה משותפים

ראה [`SHARED_WORKSPACE.md`](./SHARED_WORKSPACE.md) לפרטים על:

- אילו מסמכים משותפים
- איך לעבוד איתם בלי לדרוס
- איך לראות עדכונים

---

## 🔍 בדיקות ואימות

### בדיקת sync

```bash
# בדיקת sync עם checksums
python3 scripts/sync_verifier.py
```

### בדיקת מבנה

```bash
# בדיקת מבנה כללי
./scripts/verify_production.sh
```

### בדיקת הפרדה

```bash
# בדיקת הפרדה מלאה
./scripts/verify_production_isolation.sh
```

---

## ⚠️ כללי זהירות

1. **תמיד שמור שינויים ב-git** לפני merge
2. **אל תשנה קוד שמגיע מ-main** - עדכן ב-main
3. **תעד שינויים** ב-`SERVER_CHANGES.md`
4. **בדוק לפני commit** - ודא שהכל תקין
5. **השתמש ב-Master Script** - הוא מבצע את כל התהליך בצורה בטוחה

---

## 🆘 פתרון בעיות

### בעיה: קונפליקטים במיזוג

**פתרון:**

- Conflict resolver שומר אוטומטית על קבצי config של production
- אם יש קונפליקטים אחרים, פתור ידנית

### בעיה: שינויים אבדו אחרי merge

**פתרון:**

- ודא ששמרת את השינויים ב-git לפני merge
- בדוק ב-`git log` אם השינויים קיימים
- אם צריך, שחזר מ-commit קודם

### בעיה: הגדרות production לא נכונות

**פתרון:**

- Master Script מתקן אוטומטית את ההגדרות
- אם לא, תקן ידנית ב-`config/settings.py`

---

## 📚 מסמכים נוספים

- [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) - תהליך עדכון מלא
- [`SHARED_WORKSPACE.md`](./SHARED_WORKSPACE.md) - מסמכי עבודה משותפים
- [`SERVER_CHANGES.md`](./SERVER_CHANGES.md) - תיעוד שינויים בשרת
- [`CODE_SEPARATION.md`](./CODE_SEPARATION.md) - הפרדת קוד

---

**עודכן:** 2025-01-21  
**גרסה:** 1.0.0

