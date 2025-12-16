# מדריך למפתחים חדשים - דיבוגינג וניטור

## Onboarding Debugging Guide

### תאריך יצירה

ינואר 2025

## היכרות עם כלי דיבוגינג

### 1. Debugger for Firefox

**מה זה:**
תוסף ל-VS Code/Cursor המאפשר דיבוגינג ישיר ב-Firefox מתוך ה-IDE.

**למה זה חשוב:**

- דיבוגינג מהיר ויעיל
- אינטגרציה מלאה עם IDE
- תמיכה ב-source maps

**איך להתחיל:**

**⚠️ חשוב:** VS Code/Cursor יפתח את דפדפן ברירת המחדל אם לא תבחר configuration!

**דרך נכונה:**

1. **אפשרות 1 (מומלץ):** הפעל Firefox: `./scripts/debug/launch-firefox.sh`
2. **אפשרות 2:** ב-VS Code/Cursor:
   - לחץ F5
   - **חובה:** בחר "🚀 Launch Firefox - Development (RECOMMENDED)" מהרשימה
   - אל תבחר Chrome או דפדפן אחר!
3. הגדר breakpoints בקוד
4. השתמש ב-F10/F11 לשלב

**⚠️ מה לא לעשות:**

- ❌ אל תלחץ F5 בלי לבחור configuration - זה יפתח דפדפן ברירת מחדל (כנראה Chrome)
- ❌ אל תבחר Chrome - זה רק לבדיקות תאימות ספציפיות

**קישורים:**

- [Browser Debugging Standards](BROWSER_DEBUGGING_STANDARDS.md)
- [Debugging Standards](DEBUGGING_STANDARDS.md)

---

### 2. VS Code Python Debugger

**מה זה:**
תוסף ל-VS Code המאפשר דיבוגינג Python ישירות מה-IDE.

**למה זה חשוב:**

- דיבוגינג Python/Flask
- בדיקת API endpoints
- בדיקת business logic

**איך להתחיל:**

1. התקן Python extension ב-VS Code
2. לחץ F5
3. בחר "Python: Flask App"
4. הגדר breakpoints ב-Python code
5. השתמש ב-F10/F11 לשלב

**קישורים:**

- [Debugging Standards](DEBUGGING_STANDARDS.md)

---

### 3. System Debug Helper

**מה זה:**
כלי דיבוגינג מקיף לבדיקת המערכת.

**למה זה חשוב:**

- בדיקה מקיפה של המערכת
- בדיקת מטמון, עמודים, שגיאות, ביצועים

**איך להתחיל:**

```javascript
// בקונסולה של הדפדפן
window.debugSystem()      // בדיקה מקיפה
window.debugCache()       // בדיקת מטמון
window.debugPages()       // בדיקת עמודים
window.debugErrors()      // בדיקת שגיאות
window.debugPerformance() // בדיקת ביצועים
```

**קישורים:**

- [Code Quality Systems Guide](../TOOLS/CODE_QUALITY_SYSTEMS_GUIDE.md)

---

### 4. Selenium Testing

**מה זה:**
מערכת בדיקות אוטומטיות בדפדפן לבדיקת שגיאות JavaScript, console messages, ואיתחול מערכות.

**למה זה חשוב:**

- בדיקת שגיאות JavaScript בזמן ריצה (לא נראות ב-HTML)
- אוטומציה מלאה - לא צריך לבדוק ידנית כל עמוד
- חובה לפני סיום תוכנית או בקשת בדיקות ידניות

**איך להתחיל:**

```bash
# התקן Selenium (אם לא מותקן)
pip install selenium webdriver-manager

# הרץ בדיקות מלאות
python3 scripts/test_pages_console_errors.py
```

**קישורים:**

- [Selenium Testing Guide](../TESTING/SELENIUM_TESTING_GUIDE.md)
- [QA and Debugging Guide](../TOOLS/QA_AND_DEBUGGING_GUIDE.md)

---

## Workflow בסיסי

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

1. **הגדר breakpoints** ב-IDE
2. **השתמש ב-step through** (F10/F11)
3. **בדוק variables** ב-Watch expressions
4. **בדוק call stack** להבנת זרימת הקוד
5. **תעד את הממצאים**

### 3. אחרי עבודה

1. **הסר breakpoints זמניים**
2. **הסר console logs זמניים**
3. **תעד את הפתרון**
4. **סגור Firefox אם לא צריך**

---

## Common Issues ופתרונות

### בעיה: Firefox לא מתחבר ל-remote debugging

**תסמינים:**

- לא יכול להתחבר ל-Firefox
- Breakpoints לא עובדים

**פתרון:**

1. בדוק ש-Firefox רץ עם `--start-debugger-server`
2. בדוק שהפורט 6000 פנוי
3. הרץ: `./scripts/debug/check-debug-status.sh`
4. אם לא פעיל: `./scripts/debug/launch-firefox.sh`

---

### בעיה: Source maps לא עובדים

**תסמינים:**

- Breakpoints לא עובדים
- לא רואה קוד מקורי

**פתרון:**

1. בדוק ש-source maps מופעלים ב-build
2. בדוק ש-path mappings נכונים ב-launch.json
3. בדוק שהקבצים המקוריים קיימים
4. נסה לרענן את הדפדפן

---

### בעיה: Breakpoints לא עובדים

**תסמינים:**

- Breakpoints לא עוצרים
- לא רואה variables

**פתרון:**

1. בדוק ש-source maps עובדים
2. בדוק ש-path mappings נכונים
3. נסה לרענן את הדפדפן
4. בדוק ש-launch.json מוגדר נכון

---

### בעיה: שגיאות לא נשלחות ל-Sentry

**תסמינים:**

- שגיאות לא מופיעות ב-Sentry
- לא רואה שגיאות production

**פתרון:**

1. בדוק ש-Sentry מותקן ומוגדר
2. בדוק ש-DSN נכון
3. בדוק ש-source maps מוגדרים
4. בדוק את ה-console לשגיאות

---

## Best Practices

### 1. שימוש ב-Breakpoints

**עשה:**

- השתמש ב-breakpoints ב-IDE
- השתמש ב-conditional breakpoints
- השתמש ב-Logpoints

**אל תעשה:**

- אל תשתמש ב-breakpoints ב-DevTools
- אל תשאיר breakpoints זמניים
- אל תשתמש ב-breakpoints ב-production

---

### 2. שימוש ב-Console Logs

**עשה:**

- השתמש ב-`window.Logger.*` במקום `console.log()`
- הסר console logs לפני commit
- השתמש ב-Logpoints במקום console logs

**אל תעשה:**

- אל תשתמש ב-`console.log()` ב-production
- אל תחשוף מידע רגיש
- אל תשאיר console logs זמניים

---

### 3. שימוש במערכות כלליות

**עשה:**

- בדוק את `GENERAL_SYSTEMS_LIST.md` לפני כתיבה
- השתמש במערכות כלליות קיימות
- תעד שימוש במערכות כלליות

**אל תעשה:**

- אל תכתוב קוד חדש לפני בדיקה
- אל תכפול קוד קיים
- אל תתעלם ממערכות כלליות

---

## משאבים נוספים

### תיעוד

- [QA and Debugging Guide](../TOOLS/QA_AND_DEBUGGING_GUIDE.md)
- [Debugging Quick Reference](../TOOLS/DEBUGGING_QUICK_REFERENCE.md)
- [Debugging Checklist](DEBUGGING_CHECKLIST.md)
- [Debugging Tools Research](../TOOLS/DEBUGGING_TOOLS_RESEARCH.md)

### כללי עבודה

- [Browser Debugging Standards](BROWSER_DEBUGGING_STANDARDS.md)
- [Debugging Standards](DEBUGGING_STANDARDS.md)
- [Monitoring Standards](MONITORING_STANDARDS.md)
- [Duplicate Prevention Standards](DUPLICATE_PREVENTION_STANDARDS.md)

### מערכות כלליות

- [General Systems List](../../frontend/GENERAL_SYSTEMS_LIST.md)
- [Code Quality Systems Guide](../TOOLS/CODE_QUALITY_SYSTEMS_GUIDE.md)

---

## שאלות נפוצות

### Q: איזה דפדפן להשתמש לדיבוגינג

**A:** תמיד Firefox למרות שהוא לא ברירת מחדל. ראה [Browser Debugging Standards](BROWSER_DEBUGGING_STANDARDS.md).

---

### Q: מתי להשתמש ב-Chrome DevTools

**A:** רק לבדיקות ספציפיות ל-Chrome או לניתוח ביצועים. ראה [Browser Debugging Standards](BROWSER_DEBUGGING_STANDARDS.md).

---

### Q: איך לבדוק כפילויות

**A:** השתמש ב-`npm run check:duplicates` או `jscpd`. ראה [Duplicate Prevention Standards](DUPLICATE_PREVENTION_STANDARDS.md).

---

### Q: איך לבדוק תהליכים מקבילים

**A:** השתמש ב-`python3 Backend/utils/server_lock_manager.py`. ראה [Parallel Process Prevention Standards](PARALLEL_PROCESS_PREVENTION_STANDARDS.md).

---

### Q: מתי להריץ בדיקות Selenium

**A:** תמיד לפני סיום תוכנית או בקשת בדיקות ידניות. ראה [Selenium Testing Guide](../TESTING/SELENIUM_TESTING_GUIDE.md).

---

## צור קשר

אם יש שאלות או בעיות:

1. בדוק את התיעוד
2. שאל את הצוות
3. תעד את הבעיה

---

**תאריך עדכון:** ינואר 2025

