# כללי מניעת כפילויות - TikTrack

## Duplicate Prevention Standards

### תאריך יצירה

ינואר 2025

## כללים עיקריים

### 1. בדיקה לפני כתיבה

**חוק:** חובה לבדוק מערכות כלליות לפני כתיבת קוד חדש.

**יישום:**

1. בדוק את `documentation/frontend/GENERAL_SYSTEMS_LIST.md`
2. חפש במערכות קיימות
3. בדוק אם יש מערכת כללית שמתאימה
4. רק אם לא נמצא - כתוב קוד חדש

**תהליך:**

```bash
# 1. בדוק את רשימת המערכות הכלליות
cat documentation/frontend/GENERAL_SYSTEMS_LIST.md

# 2. חפש במערכות קיימות
grep -r "function_name" trading-ui/scripts/

# 3. בדוק אם יש מערכת כללית
# ראה GENERAL_SYSTEMS_LIST.md
```

### 2. שימוש במערכות קיימות

**חוק:** חובה להשתמש במערכות קיימות לפני יצירת קוד חדש.

**יישום:**

- השתמש ב-`FieldRendererService` לרינדור שדות
- השתמש ב-`ModalManagerV2` לניהול מודלים
- השתמש ב-`EventHandlerManager` לניהול אירועים
- השתמש ב-`CRUDResponseHandler` לטיפול בתגובות CRUD

**דוגמה:**

```javascript
// ❌ לא נכון - יצירת קוד חדש
function renderStatus(status) {
    switch (status) {
        case 'open': return '<span class="status-open">Open</span>';
        case 'closed': return '<span class="status-closed">Closed</span>';
    }
}

// ✅ נכון - שימוש במערכת כללית
window.FieldRendererService.renderStatus(status, 'trade');
```

### 3. Code Review

**חוק:** Code review חובה לזיהוי כפילויות.

**יישום:**

- בדוק כל PR לכפילויות
- השתמש ב-`jscpd` לזיהוי אוטומטי
- בדוק שימוש במערכות כלליות
- תעד כפילויות שנמצאו

**בדיקה:**

```bash
# הרץ jscpd
npm run check:duplicates

# בדוק שימוש במערכות כלליות
npm run check:general-systems-usage
```

### 4. Automated Checks

**חוק:** הרצה לפני commit.

**יישום:**

- הוסף בדיקות ל-pre-commit hook
- הרץ `jscpd` לפני commit
- בדוק שימוש במערכות כלליות
- תעד כפילויות שנמצאו

**בדיקה:**

```bash
# Pre-commit hook (אוטומטי)
git commit -m "message"

# Manual check
npm run check:duplicates
npm run check:general-systems-usage
```

## כללי זיהוי כפילויות

### 1. כלי זיהוי

**כלים:**

- `jscpd` - Copy/paste detector
- `js-duplicate-analyzer.py` - כפילויות JavaScript
- `html-duplicate-analyzer.py` - כפילויות HTML
- `css-analyzer.py` - כפילויות CSS
- `advanced-duplicate-detector.js` - זיהוי מתקדם

**יישום:**

```bash
# jscpd
npm run check:duplicates

# Python analyzers
python3 documentation/tools/analysis/js-duplicate-analyzer.py
python3 documentation/tools/analysis/html-duplicate-analyzer.py
python3 documentation/tools/css/css-analyzer.py

# Advanced detector
node scripts/monitors/advanced-duplicate-detector.js
```

### 2. סוגי כפילויות

**סוגים:**

- **Code duplication:** קוד זהה או דומה
- **Function duplication:** פונקציות זהות
- **Pattern duplication:** דפוסים חוזרים
- **Logic duplication:** לוגיקה כפולה

**טיפול:**

- איחוד קוד כפול
- יצירת פונקציות כלליות
- שימוש במערכות כלליות
- יצירת utilities

### 3. עדיפויות תיקון

**סדר עדיפות:**

1. **קריטי:** כפילויות שמונעות תחזוקה
2. **גבוה:** כפילויות שמונעות שימוש במערכות כלליות
3. **בינוני:** כפילויות שמונעות שיפור קוד
4. **נמוך:** כפילויות קטנות

## כללי מניעת כפילויות

### 1. לפני כתיבת קוד

**תהליך:**

1. בדוק את `GENERAL_SYSTEMS_LIST.md`
2. חפש במערכות קיימות
3. בדוק אם יש מערכת כללית
4. רק אם לא נמצא - כתוב קוד חדש

### 2. במהלך כתיבת קוד

**תהליך:**

1. השתמש במערכות כלליות
2. יצור utilities לחזרה
3. תעד את הקוד
4. בדוק כפילויות

### 3. אחרי כתיבת קוד

**תהליך:**

1. הרץ `jscpd`
2. בדוק שימוש במערכות כלליות
3. תקן כפילויות שנמצאו
4. תעד את התיקונים

## כללי עבודה יומיומיים

### 1. לפני התחלת עבודה

```bash
# בדוק את רשימת המערכות הכלליות
cat documentation/frontend/GENERAL_SYSTEMS_LIST.md

# בדוק כפילויות קיימות
npm run check:duplicates
```

### 2. במהלך עבודה

- השתמש במערכות כלליות
- בדוק כפילויות
- תעד את הקוד
- בדוק שימוש במערכות כלליות

### 3. בסיום עבודה

- הרץ `jscpd`
- בדוק שימוש במערכות כלליות
- תקן כפילויות שנמצאו
- תעד את התיקונים

## Troubleshooting

### בעיה: jscpd מזהה false positives

**פתרון:**

1. בדוק את ה-configuration
2. התאם את ה-threshold
3. הוסף exceptions
4. תעד false positives

### בעיה: לא מוצא מערכת כללית

**פתרון:**

1. בדוק את `GENERAL_SYSTEMS_LIST.md`
2. חפש במערכות קיימות
3. שאל את הצוות
4. רק אם לא נמצא - כתוב קוד חדש

## קישורים רלוונטיים

- [General Systems List](../../frontend/GENERAL_SYSTEMS_LIST.md)
- [Parallel Process Prevention Standards](PARALLEL_PROCESS_PREVENTION_STANDARDS.md)
- [QA and Debugging Guide](../TOOLS/QA_AND_DEBUGGING_GUIDE.md)

---

**תאריך עדכון:** ינואר 2025

