# כללי דיבוגינג בדפדפן - TikTrack

## Browser Debugging Standards

### תאריך יצירה

ינואר 2025

## כללים עיקריים

### 1. דפדפן ברירת מחדל לפיתוח

**חוק:** תמיד להריץ בדפדפן Firefox למרות שהוא לא דפדפן ברירת המחדל.

**סיבות:**

- Debugger for Firefox מותקן ומאפשר דיבוגינג ישירות מה-IDE
- Firefox Developer Tools מספקים כלי דיבוגינג מתקדמים
- תאימות טובה יותר עם source maps
- אינטגרציה טובה יותר עם VS Code/Cursor

**יישום:**

- השתמש ב-`scripts/debug/launch-firefox.sh` להרצת Firefox עם remote debugging
- או השתמש ב-VS Code/Cursor launch configuration "Launch Firefox - Development"

### 2. שימוש בדפדפנים אחרים

#### Chrome DevTools

**מתי להשתמש:**

- בדיקות ספציפיות ל-Chrome
- בעיות תאימות ספציפיות ל-Chrome
- ניתוח ביצועים עם Chrome Performance Profiler

**מתי לא להשתמש:**

- דיבוגינג רגיל (תמיד Firefox)
- בדיקות יומיומיות

#### Safari

**מתי להשתמש:**

- בדיקות תאימות ל-Safari בלבד
- בעיות ספציפיות ל-Safari

**מתי לא להשתמש:**

- דיבוגינג רגיל
- פיתוח יומיומי

#### Edge

**מתי להשתמש:**

- בדיקות תאימות ל-Edge בלבד
- בעיות ספציפיות ל-Edge

**מתי לא להשתמש:**

- דיבוגינג רגיל
- פיתוח יומיומי

## תהליך עבודה מומלץ

### 1. התחלת דיבוגינג

**⚠️ חשוב:** VS Code/Cursor יפתח את דפדפן ברירת המחדל של המערכת אם לא תבחר configuration ספציפי!

**דרך נכונה:**

```bash
# אפשרות 1: שימוש בסקריפט (מומלץ)
./scripts/debug/launch-firefox.sh

# אפשרות 2: שימוש ב-VS Code/Cursor
# 1. לחץ F5
# 2. **חובה:** בחר "🚀 Launch Firefox - Development (RECOMMENDED)" מהרשימה
# 3. אל תבחר Chrome או דפדפן אחר!
```

**⚠️ מה לא לעשות:**
- ❌ אל תלחץ F5 בלי לבחור configuration - זה יפתח דפדפן ברירת מחדל (כנראה Chrome)
- ❌ אל תבחר "⚠️ Launch Chrome (NOT RECOMMENDED)" - זה רק לבדיקות תאימות ספציפיות
- ❌ אל תפתח דפדפן ידנית - השתמש ב-launch configuration או בסקריפט

### 2. בדיקת סטטוס

```bash
./scripts/debug/check-debug-status.sh
```

### 3. חיבור לדפדפן רץ

```bash
# בדוק אם Firefox רץ עם remote debugging
./scripts/debug/attach-firefox.sh

# או השתמש ב-VS Code/Cursor
# בחר "Attach to Firefox" מהרשימה
```

## כללי Breakpoints

### 1. מיקום Breakpoints

**חוק:** תמיד להגדיר breakpoints ב-IDE (VS Code/Cursor), לא ב-DevTools של הדפדפן.

**סיבות:**

- Breakpoints נשמרים בין sessions
- אינטגרציה טובה יותר עם source maps
- ניהול קל יותר של multiple breakpoints
- תמיכה ב-conditional breakpoints

### 2. Conditional Breakpoints

**מתי להשתמש:**

- כאשר צריך לעצור רק בתנאים מסוימים
- כאשר יש לולאות עם הרבה iterations
- כאשר צריך לבדוק ערכים ספציפיים

**דוגמה:**

```javascript
// Conditional breakpoint: i > 10
for (let i = 0; i < 100; i++) {
    // code
}
```

### 3. Logpoints

**מתי להשתמש:**

- כאשר צריך לוגים ללא עצירה
- כאשר צריך לבדוק ערכים ללא הפרעה
- כאשר צריך לוגים זמניים

**דוגמה:**

```javascript
// Logpoint: console.log('Current value:', value)
```

## כללי Console

### 1. Console Logs

**חוק:** Console logs רק למידע זמני, לא ל-production.

**סיבות:**

- Console logs יכולים להאט את הביצועים
- Console logs יכולים לחשוף מידע רגיש
- Console logs יכולים ליצור רעש בקונסולה

**יישום:**

- השתמש ב-`window.Logger.debug()` במקום `console.log()`
- הסר console logs לפני commit
- השתמש ב-Logpoints במקום console logs בדיבוגינג

### 2. Console Commands

**מתי להשתמש:**

- בדיקת ערכים בזמן אמת
- הרצת פונקציות לבדיקה
- בדיקת מצב אובייקטים

**מתי לא להשתמש:**

- שינויים בקוד (תמיד לערוך בקוד)
- בדיקות מורכבות (תמיד לכתוב tests)

## כללי Source Maps

### 1. וידוא Source Maps

**חוק:** תמיד לוודא ש-source maps מופעלים ופועלים נכון.

**בדיקה:**

- פתח DevTools → Sources
- בדוק שהקבצים המקוריים מופיעים
- בדוק ש-breakpoints עובדים בקוד המקורי

### 2. הגדרת Path Mappings

**חוק:** תמיד להגדיר path mappings נכונים ב-launch.json.

**דוגמה:**

```json
{
  "pathMappings": [
    {
      "url": "http://localhost:8080",
      "path": "${workspaceFolder}/trading-ui"
    }
  ]
}
```

## כללי Performance

### 1. ניתוח ביצועים

**מתי להשתמש:**

- לפני release
- כאשר יש בעיות ביצועים
- כאשר יש slowdowns

**כלים:**

- Chrome Performance Profiler (לבדיקות ספציפיות)
- Firefox Performance Profiler (לבדיקות רגילות)
- Lighthouse (לבדיקות אוטומטיות)

### 2. Memory Profiling

**מתי להשתמש:**

- כאשר יש memory leaks
- כאשר יש שימוש זיכרון גבוה
- כאשר יש בעיות ביצועים

**כלים:**

- Chrome Memory Profiler
- Firefox Memory Profiler

## כללי תאימות

### 1. בדיקות תאימות

**מתי לבצע:**

- לפני release
- כאשר יש בעיות תאימות
- כאשר יש שינויים גדולים

**דפדפנים לבדיקה:**

1. Firefox (עדיפות ראשונה)
2. Chrome (עדיפות שנייה)
3. Safari (אם יש משתמשים Mac)
4. Edge (אם יש משתמשים Windows)

### 2. תעדוף בעיות תאימות

**סדר עדיפות:**

1. Firefox - בעיות קריטיות
2. Chrome - בעיות קריטיות
3. Safari - בעיות בינוניות
4. Edge - בעיות נמוכות

## כללי עבודה יומיומיים

### 1. לפני התחלת עבודה

```bash
# בדוק סטטוס דיבוגינג
./scripts/debug/check-debug-status.sh

# הפעל שרת אם צריך
./start_server.sh

# הפעל Firefox עם remote debugging
./scripts/debug/launch-firefox.sh
```

### 2. במהלך עבודה

- השתמש ב-breakpoints ב-IDE
- השתמש ב-Watch expressions
- השתמש ב-Call stack
- השתמש ב-Debug console

### 3. בסיום עבודה

- הסר breakpoints זמניים
- סגור Firefox אם לא צריך
- בדוק שלא נשארו console logs

## Troubleshooting

### בעיה: Firefox לא מתחבר ל-remote debugging

**פתרון:**

1. בדוק ש-Firefox רץ עם `--start-debugger-server`
2. בדוק שהפורט 6000 פנוי
3. בדוק ש-launch.json מוגדר נכון

### בעיה: Source maps לא עובדים

**פתרון:**

1. בדוק ש-source maps מופעלים ב-build
2. בדוק ש-path mappings נכונים
3. בדוק שהקבצים המקוריים קיימים

### בעיה: Breakpoints לא עובדים

**פתרון:**

1. בדוק ש-source maps עובדים
2. בדוק ש-path mappings נכונים
3. נסה לרענן את הדפדפן

## קישורים רלוונטיים

- [Debugging Standards](DEBUGGING_STANDARDS.md)
- [QA and Debugging Guide](../TOOLS/QA_AND_DEBUGGING_GUIDE.md)
- [Debugging Quick Reference](../TOOLS/DEBUGGING_QUICK_REFERENCE.md)

---

**תאריך עדכון:** ינואר 2025

