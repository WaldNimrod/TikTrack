# Shared Workspace Documentation

**תאריך:** 2025-01-21  
**גרסה:** 1.0.0  
**מטרה:** הגדרת מסמכי עבודה משותפים בין סביבת הפיתוח לסביבת הפרודקשן

---

## 🎯 מטרת המסמך

מסמך זה מגדיר:

- אילו מסמכים משותפים בין שתי הסביבות
- מבנה התוכן בכל מסמך
- כללי עבודה למניעת דריסת מידע
- איך לראות עדכונים שביצע הצד השני

---

## 📋 רשימת מסמכים משותפים

### 1. `documentation/production/UPDATE_PROCESS.md`

**מטרה:** תהליך עדכון פרודקשן

**מבנה:**

- סקירה מהירה
- תהליך מפורט (כולל שלב 0: הכנה בסביבת הפיתוח)
- פתרון בעיות
- Checklist

**כללי עבודה:**

- **סביבת הפיתוח:** מעדכנת את התהליך המקדים (שלב 0)
- **סביבת הפרודקשן:** מעדכנת את התהליך בסביבת הפרודקשן (שלבים 1-6)
- **אין דריסה:** כל צד עובד על חלק אחר של המסמך

**איך לראות עדכונים:**

```bash
# בסביבת הפיתוח
git pull origin main
# המסמך מתעדכן אוטומטית

# בסביבת הפרודקשן
git pull origin production
# המסמך מתעדכן אוטומטית
```

---

### 2. `documentation/production/SERVER_CHANGES.md`

**מטרה:** תיעוד שינויים בהגדרות השרת

**מבנה:**

- רשימת שינויים לפי תאריך
- כל שינוי כולל: תאריך, קובץ, שינוי, סיבה, השפעה

**כללי עבודה:**

- **סביבת הפרודקשן:** מעדכנת את המסמך עם שינויים ב-config
- **סביבת הפיתוח:** קוראת את המסמך לראות שינויים
- **אין דריסה:** כל עדכון נוסף בסוף המסמך (append)

**איך לראות עדכונים:**

```bash
# בסביבת הפיתוח
git pull origin main
cat documentation/production/SERVER_CHANGES.md
```

**איך לעדכן:**

```bash
# בסביבת הפרודקשן
python3 scripts/production-update/document_server_changes.py
# או עדכון ידני
```

---

### 3. `documentation/production/PRODUCTION_DEVELOPER_GUIDE.md`

**מטרה:** מדריך למפתחי פרודקשן

**מבנה:**

- תהליך עבודה
- סינכרון עם פיתוח
- בדיקות ואימות
- פתרון בעיות

**כללי עבודה:**

- **סביבת הפרודקשן:** מעדכנת את המדריך עם ניסיון מעשי
- **סביבת הפיתוח:** קוראת את המדריך להבנת תהליך הפרודקשן
- **אין דריסה:** עדכונים בתוספת, לא מחליפים

**איך לראות עדכונים:**

```bash
# בסביבת הפיתוח
git pull origin main
cat documentation/production/PRODUCTION_DEVELOPER_GUIDE.md
```

---

### 4. `documentation/production/SHARED_WORKSPACE.md` (המסמך הזה)

**מטרה:** הגדרת מסמכי עבודה משותפים

**מבנה:**

- רשימת מסמכים
- מבנה כל מסמך
- כללי עבודה
- הוראות עדכון

**כללי עבודה:**

- **שני הצדדים:** יכולים לעדכן
- **אין דריסה:** עדכונים בתוספת, לא מחליפים
- **תמיד תיעוד:** כל שינוי במסמך הזה חייב להיות מתועד

---

## 🔄 תהליך עבודה עם מסמכים משותפים

### שלב 1: קריאת עדכונים

```bash
# בסביבת הפיתוח
git pull origin main
git log --oneline documentation/production/ -10

# בסביבת הפרודקשן
git pull origin production
git log --oneline documentation/production/ -10
```

### שלב 2: עדכון מסמך

**לפני עדכון:**

1. בדוק מה השתנה לאחרונה
2. ודא שאתה לא דורס מידע
3. אם יש ספק, צור section חדש

**במהלך עדכון:**

1. הוסף מידע חדש בסוף section רלוונטי
2. אל תמחק מידע קיים
3. תעד את התאריך והסיבה

**אחרי עדכון:**

1. Commit עם הודעה ברורה
2. Push ל-remote
3. הודע לצד השני (אם רלוונטי)

### שלב 3: סינכרון

```bash
# בסביבת הפיתוח
git add documentation/production/
git commit -m "docs: Update production documentation [תיאור]"
git push origin main

# בסביבת הפרודקשן
git pull origin main
# או
git merge main
```

---

## 📝 כללי עבודה כלליים

### 1. אין דריסה

**❌ אסור:**

- מחיקת מידע קיים
- החלפת מידע קיים
- עריכה של sections ששייכים לצד השני

**✅ מותר:**

- הוספת מידע חדש
- עדכון מידע קיים (אם זה שלך)
- תיקון שגיאות כתיב

### 2. תיעוד מלא

**כל עדכון חייב לכלול:**

- תאריך
- שם המעדכן (אופציונלי)
- תיאור השינוי
- סיבה לשינוי (אם רלוונטי)

### 3. תקשורת

**אם יש שינוי משמעותי:**

- הודע לצד השני
- הסבר את השינוי
- בקש אישור (אם נדרש)

---

## 🔍 איך לראות עדכונים

### דרך Git

```bash
# רשימת commits אחרונים
git log --oneline documentation/production/ -10

# השוואה בין branches
git diff main..production -- documentation/production/

# היסטוריה של קובץ ספציפי
git log --oneline documentation/production/UPDATE_PROCESS.md
```

### דרך קבצים

```bash
# קריאת קובץ
cat documentation/production/SERVER_CHANGES.md

# חיפוש שינויים אחרונים
grep -A 5 "2025-01" documentation/production/SERVER_CHANGES.md
```

---

## 📊 דוגמה לעבודה משותפת

### תרחיש: עדכון תהליך בסביבת הפיתוח

1. **סביבת הפיתוח:**

   ```bash
   # עריכת המסמך
   vim documentation/production/UPDATE_PROCESS.md
   # הוספת שלב 0: הכנה בסביבת הפיתוח
   
   # Commit
   git add documentation/production/UPDATE_PROCESS.md
   git commit -m "docs: Add pre-sync preparation step to UPDATE_PROCESS.md"
   git push origin main
   ```

2. **סביבת הפרודקשן:**

   ```bash
   # עדכון מ-main
   git pull origin production
   git merge main
   
   # קריאת העדכון
   cat documentation/production/UPDATE_PROCESS.md
   # רואה את שלב 0 החדש
   ```

### תרחיש: עדכון שינויים בשרת בסביבת הפרודקשן

1. **סביבת הפרודקשן:**

   ```bash
   # עדכון הגדרות
   vim production/Backend/config/settings.py
   # שינוי PORT ל-5002
   
   # תיעוד
   python3 scripts/production-update/document_server_changes.py
   # או עדכון ידני ב-SERVER_CHANGES.md
   
   # Commit
   git add production/Backend/config/settings.py documentation/production/SERVER_CHANGES.md
   git commit -m "chore: Update production port to 5002"
   git push origin production
   ```

2. **סביבת הפיתוח:**

   ```bash
   # עדכון מ-production (אם צריך)
   git fetch origin production
   git log origin/production -- documentation/production/SERVER_CHANGES.md -5
   
   # קריאת העדכון
   git show origin/production:documentation/production/SERVER_CHANGES.md
   ```

---

## ⚠️ אזהרות חשובות

1. **אל תדרוס מידע** - תמיד הוסף, אל תמחק
2. **תמיד תעד** - כל שינוי חייב להיות מתועד
3. **תקשר** - אם יש שינוי משמעותי, הודע לצד השני
4. **בדוק לפני commit** - ודא שהכל תקין

---

## 📚 מסמכים נוספים

- [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) - תהליך עדכון מלא
- [`PRODUCTION_DEVELOPER_GUIDE.md`](./PRODUCTION_DEVELOPER_GUIDE.md) - מדריך למפתחי פרודקשן
- [`SERVER_CHANGES.md`](./SERVER_CHANGES.md) - תיעוד שינויים בשרת

---

**עודכן:** 2025-01-21  
**גרסה:** 1.0.0

