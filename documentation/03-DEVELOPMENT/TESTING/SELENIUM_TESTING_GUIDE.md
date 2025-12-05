# מדריך בדיקות Selenium - TikTrack

**תאריך יצירה:** 5 בדצמבר 2025  
**גרסה:** 1.0.0

---

## 📋 תוכן עניינים

1. [מה זה Selenium?](#מה-זה-selenium)
2. [התקנה](#התקנה)
3. [שימוש](#שימוש)
4. [סקריפטים זמינים](#סקריפטים-זמינים)
5. [פרשנות תוצאות](#פרשנות-תוצאות)
6. [Best Practices](#best-practices)

---

## מה זה Selenium?

Selenium היא ספרייה לבדיקות אוטומטיות בדפדפן. היא מאפשרת לשלוט בדפדפן מתוך Python ולבצע בדיקות מלאות של:

- ✅ שגיאות JavaScript בזמן ריצה
- ✅ הודעות קונסול (errors, warnings)
- ✅ איתחול מערכות
- ✅ ביצועים (זמני טעינה)
- ✅ UI interactions

**למה זה חשוב?**
- בדיקת HTTP status לא מספיקה - היא לא רואה שגיאות JavaScript בזמן ריצה
- Selenium פותח דפדפן אמיתי ורואה את כל השגיאות
- אוטומציה מלאה - לא צריך לבדוק ידנית כל עמוד

---

## התקנה

### 1. התקנת Python packages
```bash
pip install selenium webdriver-manager
```

### 2. ChromeDriver
ChromeDriver מותקן אוטומטית על ידי `webdriver-manager` - אין צורך בהתקנה ידנית.

### 3. Chrome Browser
ודא ש-Chrome מותקן במחשב.

---

## שימוש

### הרצת בדיקת קונסול מלאה
```bash
python3 scripts/test_pages_console_errors.py
```

### מה הסקריפט עושה?
1. פותח Chrome headless (ללא חלון)
2. טוען כל עמוד ברשימה
3. קורא את כל הודעות הקונסול
4. בודק שגיאות JavaScript
5. בודק איתחול מערכות
6. שומר תוצאות ל-JSON

### תוצאות
- **קובץ JSON:** `console_errors_report.json`
- **פלט בקונסול:** סיכום מפורט של כל העמודים

---

## סקריפטים זמינים

### 1. `scripts/test_pages_console_errors.py`
**תיאור:** בדיקת שגיאות JavaScript מלאה עם Selenium

**שימוש:**
```bash
python3 scripts/test_pages_console_errors.py
```

**תוצאות:**
- `console_errors_report.json` - דוח מלא
- פלט בקונסול עם סיכום

**מה הוא בודק:**
- ✅ שגיאות JavaScript בזמן ריצה
- ✅ הודעות קונסול (errors, warnings)
- ✅ איתחול מערכות (Header, Core Systems)
- ✅ זמני טעינה
- ✅ שגיאות קריטיות (Maximum call stack, Uncaught errors)

**אופטימיזציה:**
- ✅ Rate limiting tracking - מניעת שגיאות 429
- ✅ Retry logic עם exponential backoff
- ✅ Adaptive delay - התאמה אוטומטית של delay
- 📖 [קרא עוד על האופטימיזציה](./TEST_OPTIMIZATION_RATE_LIMITING.md)

### 2. `scripts/test_pages_console_simple.py`
**תיאור:** בדיקה בסיסית ללא Selenium (רק HTTP + HTML patterns)

**שימוש:**
```bash
python3 scripts/test_pages_console_simple.py
```

**הערה:** בדיקה זו לא רואה שגיאות JavaScript בזמן ריצה - רק patterns ב-HTML.

---

## פרשנות תוצאות

### שגיאות לא קריטיות (מסוננות אוטומטית)
- ✅ **401 UNAUTHORIZED** על `/api/auth/me` - תקין (אין משתמש מחובר)
- ✅ **Failed to load resource** על קבצים אופציונליים - לא קריטי
- ✅ **Warnings** - לא קריטי, אבל כדאי לבדוק

### שגיאות קריטיות (דורשות תיקון)
- ❌ **Maximum call stack size exceeded** - רקורסיה אינסופית
- ❌ **Uncaught TypeError** - שגיאת JavaScript
- ❌ **SyntaxError** - שגיאת תחביר
- ❌ **ReferenceError** - משתנה לא מוגדר
- ❌ **Failed to load** על קבצים קריטיים (core-systems, preferences-core)

### דוגמת תוצאה
```json
{
  "page": "דף הבית",
  "url": "/",
  "success": false,
  "console_errors": [
    {
      "level": "SEVERE",
      "message": "Uncaught TypeError: Logger.info is not a function"
    }
  ],
  "console_warnings": [
    {
      "level": "WARNING",
      "message": "Using legacy TABLE_COLUMN_MAPPINGS"
    }
  ]
}
```

---

## Best Practices

### 1. הרצה לפני כל commit
```bash
# לפני commit - הרץ בדיקה מלאה
python3 scripts/test_pages_console_errors.py
```

### 2. בדיקה אחרי שינויים גדולים
אחרי שינויים ב:
- מערכות ליבה (Preferences, Notifications, Cache)
- איתחול עמודים
- JavaScript core files

### 3. בדיקה לפני production
לפני העלאה ל-production:
1. הרץ `test_pages_console_errors.py`
2. ודא 0 שגיאות קריטיות
3. בדוק warnings חשובים

### 4. שילוב ב-workflow
- **לפני commit:** בדיקה בסיסית (`test_pages_console_simple.py`)
- **לפני merge:** בדיקה מלאה (`test_pages_console_errors.py`)
- **לפני production:** בדיקה מלאה + בדיקה ידנית

---

## Troubleshooting

### שגיאה: "ChromeDriver not found"
**פתרון:** `webdriver-manager` אמור להתקין אוטומטית. אם לא:
```bash
pip install --upgrade webdriver-manager
```

### שגיאה: "Chrome browser not found"
**פתרון:** התקן Chrome browser.

### שגיאה: "Connection refused"
**פתרון:** ודא שהשרת רץ:
```bash
./start_server.sh
```

### שגיאה: "Timeout"
**פתרון:** הגדל timeout ב-`test_pages_console_errors.py`:
```python
WebDriverWait(driver, 20)  # במקום 10
```

---

## קישורים

- **Selenium Documentation:** https://www.selenium.dev/documentation/
- **WebDriver Manager:** https://github.com/SergeyPirogov/webdriver_manager
- **ChromeDriver:** https://chromedriver.chromium.org/
- **אופטימיזציה לבדיקות - Rate Limiting:** [TEST_OPTIMIZATION_RATE_LIMITING.md](./TEST_OPTIMIZATION_RATE_LIMITING.md)

---

**תאריך עדכון אחרון:** 5 בדצמבר 2025

