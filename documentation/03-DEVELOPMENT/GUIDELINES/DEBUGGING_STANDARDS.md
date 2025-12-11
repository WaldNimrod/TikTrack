# כללי דיבוגינג - TikTrack

## Debugging Standards

### תאריך יצירה

ינואר 2025

## כללים עיקריים

### 1. Breakpoints

**חוק:** תמיד להגדיר breakpoints ב-IDE (VS Code/Cursor), לא ב-DevTools של הדפדפן.

**סיבות:**

- Breakpoints נשמרים בין sessions
- אינטגרציה טובה יותר עם source maps
- ניהול קל יותר של multiple breakpoints
- תמיכה ב-conditional breakpoints ו-Logpoints

**יישום:**

- השתמש ב-VS Code/Cursor debugger
- הגדר breakpoints ישירות בקוד
- השתמש ב-conditional breakpoints כאשר צריך

### 2. Console Logs

**חוק:** Console logs רק למידע זמני, לא ל-production.

**סיבות:**

- Console logs יכולים להאט את הביצועים
- Console logs יכולים לחשוף מידע רגיש
- Console logs יכולים ליצור רעש בקונסולה

**יישום:**

- השתמש ב-`window.Logger.debug()` במקום `console.log()`
- הסר console logs לפני commit
- השתמש ב-Logpoints במקום console logs בדיבוגינג

**דוגמה:**

```javascript
// ❌ לא נכון
console.log('User data:', userData);

// ✅ נכון
window.Logger.debug('User data loaded', { userId: userData.id });

// ✅ נכון - Logpoint ב-IDE
// Logpoint: window.Logger.debug('Current value:', value)
```

### 3. Debug Mode

**חוק:** Debug mode תמיד מופעל בפיתוח.

**יישום:**

- הגדר `FLASK_DEBUG=1` ב-Python
- השתמש ב-`TIKTRACK_DEV_MODE=true` ב-JavaScript
- הפעל verbose logging כאשר צריך

**בדיקה:**

```bash
# Python
echo $FLASK_DEBUG  # צריך להיות 1

# JavaScript
# בדוק ב-console: window.TIKTRACK_DEV_MODE
```

### 4. Error Tracking

**חוק:** חובה לכל שגיאה קריטית.

**יישום:**

- השתמש ב-Sentry (אם מותקן) לשגיאות production
- השתמש ב-`window.Logger.error()` לשגיאות development
- תעד כל שגיאה עם context מלא

**דוגמה:**

```javascript
try {
    // code
} catch (error) {
    window.Logger.error('Failed to load data', {
        error: error.message,
        stack: error.stack,
        context: { userId, pageId }
    });
    // handle error
}
```

## כללי Step Through

### 1. Step Over (F10)

**מתי להשתמש:**

- כאשר לא צריך להיכנס לפונקציה
- כאשר הפונקציה היא library function
- כאשר הפונקציה כבר נבדקה

### 2. Step Into (F11)

**מתי להשתמש:**

- כאשר צריך להיכנס לפונקציה
- כאשר יש בעיה בתוך הפונקציה
- כאשר צריך לבדוק את הלוגיקה הפנימית

### 3. Step Out (Shift+F11)

**מתי להשתמש:**

- כאשר סיימת לבדוק פונקציה
- כאשר רוצה לחזור ל-caller
- כאשר הפונקציה ארוכה מדי

## כללי Watch Expressions

### 1. מתי להשתמש

**מתי להשתמש:**

- כאשר צריך לבדוק ערכים של משתנים
- כאשר צריך לבדוק ביטויים מורכבים
- כאשר צריך לבדוק שינויים בערכים

**דוגמה:**

```javascript
// Watch expressions:
// - userData.id
// - userData.trades.length
// - calculateTotal(userData.trades)
```

### 2. מה לא לבדוק

**מה לא לבדוק:**

- ביטויים עם side effects
- פונקציות שמשנות state
- ביטויים שמבצעים API calls

## כללי Call Stack

### 1. שימוש ב-Call Stack

**מתי להשתמש:**

- כאשר צריך להבין את זרימת הקוד
- כאשר יש שגיאה ורוצים לראות מאיפה היא הגיעה
- כאשר צריך לבדוק את ה-call chain

### 2. ניתוח Call Stack

**איך לנתח:**

- התחל מלמעלה (הפונקציה הנוכחית)
- עבור למטה (הפונקציות שקראו)
- חפש את המקור של הבעיה

## כללי Conditional Breakpoints

### 1. מתי להשתמש

**מתי להשתמש:**

- כאשר יש לולאות עם הרבה iterations
- כאשר צריך לעצור רק בתנאים מסוימים
- כאשר צריך לבדוק ערכים ספציפיים

**דוגמה:**

```javascript
// Conditional breakpoint: i > 10 && item.status === 'active'
for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // code
}
```

### 2. ביטויים מורכבים

**מתי להשתמש:**

- כאשר התנאי מורכב
- כאשר צריך לבדוק מספר תנאים
- כאשר צריך לבדוק ערכים של אובייקטים

**דוגמה:**

```javascript
// Conditional breakpoint: user.role === 'admin' && user.active === true
```

## כללי Logpoints

### 1. מתי להשתמש

**מתי להשתמש:**

- כאשר צריך לוגים ללא עצירה
- כאשר צריך לבדוק ערכים ללא הפרעה
- כאשר צריך לוגים זמניים

**דוגמה:**

```javascript
// Logpoint: console.log('Current iteration:', i, 'Item:', item)
for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // code
}
```

### 2. יתרונות

**יתרונות:**

- לא עוצר את הביצוע
- לא צריך להוסיף קוד
- קל להסיר

## כללי Error Handling

### 1. Try-Catch

**חוק:** תמיד להשתמש ב-try-catch לשגיאות קריטיות.

**יישום:**

```javascript
try {
    // code
} catch (error) {
    window.Logger.error('Operation failed', {
        error: error.message,
        stack: error.stack,
        context: { /* relevant context */ }
    });
    // handle error
}
```

### 2. Error Context

**חוק:** תמיד לכלול context מלא בשגיאות.

**יישום:**

```javascript
window.Logger.error('Failed to save trade', {
    error: error.message,
    stack: error.stack,
    context: {
        tradeId: trade.id,
        userId: user.id,
        action: 'save',
        timestamp: Date.now()
    }
});
```

## כללי Performance Debugging

### 1. Performance Profiling

**מתי להשתמש:**

- כאשר יש בעיות ביצועים
- לפני release
- כאשר יש slowdowns

**כלים:**

- Chrome Performance Profiler
- Firefox Performance Profiler
- VS Code Performance Profiler

### 2. Memory Profiling

**מתי להשתמש:**

- כאשר יש memory leaks
- כאשר יש שימוש זיכרון גבוה
- כאשר יש בעיות ביצועים

**כלים:**

- Chrome Memory Profiler
- Firefox Memory Profiler

## כללי עבודה יומיומיים

### 1. לפני התחלת דיבוגינג

```bash
# בדוק סטטוס דיבוגינג
./scripts/debug/check-debug-status.sh

# הפעל שרת אם צריך
./start_server.sh

# הפעל Firefox עם remote debugging
./scripts/debug/launch-firefox.sh
```

### 2. במהלך דיבוגינג

- השתמש ב-breakpoints ב-IDE
- השתמש ב-Watch expressions
- השתמש ב-Call stack
- השתמש ב-Debug console
- תעד את הממצאים

### 3. בסיום דיבוגינג

- הסר breakpoints זמניים
- הסר console logs זמניים
- תעד את הפתרון
- סגור Firefox אם לא צריך

## Troubleshooting

### בעיה: Breakpoints לא עובדים

**פתרון:**

1. בדוק ש-source maps עובדים
2. בדוק ש-path mappings נכונים
3. נסה לרענן את הדפדפן
4. בדוק ש-launch.json מוגדר נכון

### בעיה: Watch expressions לא עובדים

**פתרון:**

1. בדוק שהמשתנים קיימים ב-scope
2. בדוק שהביטוי תקין
3. נסה לרענן את הדפדפן

### בעיה: Step through לא עובד

**פתרון:**

1. בדוק ש-source maps עובדים
2. בדוק ש-path mappings נכונים
3. נסה לרענן את הדפדפן

## קישורים רלוונטיים

- [Browser Debugging Standards](BROWSER_DEBUGGING_STANDARDS.md)
- [Monitoring Standards](MONITORING_STANDARDS.md)
- [QA and Debugging Guide](../TOOLS/QA_AND_DEBUGGING_GUIDE.md)
- [Debugging Quick Reference](../TOOLS/DEBUGGING_QUICK_REFERENCE.md)

---

**תאריך עדכון:** ינואר 2025

