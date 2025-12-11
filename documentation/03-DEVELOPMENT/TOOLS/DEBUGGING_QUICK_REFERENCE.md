# Quick Reference - דיבוגינג וניטור

## Debugging Quick Reference

### תאריך יצירה

ינואר 2025

## טבלת כלים לפי סוג בעיה

| סוג בעיה | כלי מומלץ | פקודה/שימוש |
|---------|-----------|-------------|
| **JavaScript Debugging** | Debugger for Firefox | `./scripts/debug/launch-firefox.sh` או F5 ב-VS Code |
| **Python Debugging** | VS Code Python Debugger | F5 ב-VS Code → "Python: Flask App" |
| **Event Debugging** | EventHandlerManager Debug API | `window.EventHandlerManager.debug.getStatistics()` |
| **System Debugging** | System Debug Helper | `window.debugSystem()` |
| **Error Monitoring** | Logger Service | `window.Logger.error('message', context)` |
| **Performance Monitoring** | Chrome/Firefox Profiler | DevTools → Performance → Record |
| **Code Duplicates** | jscpd | `npm run check:duplicates` |
| **Process Monitoring** | Server Lock Manager | `python3 Backend/utils/server_lock_manager.py` |
| **Health Check** | Health Service | `curl http://localhost:8080/api/health` |
| **Selenium Testing** | test_pages_console_errors.py | `python3 scripts/test_pages_console_errors.py` |

## פקודות מהירות

### דיבוגינג

```bash
# הפעל Firefox עם remote debugging (מומלץ)
./scripts/debug/launch-firefox.sh

# בדוק סטטוס דיבוגינג
./scripts/debug/check-debug-status.sh

# בדוק איזה דפדפן בשימוש (מזהיר אם Chrome)
./scripts/debug/check-browser.sh

# חבר ל-Firefox רץ
./scripts/debug/attach-firefox.sh
```

**⚠️ חשוב:** ב-VS Code/Cursor, לחץ F5 ואז **בחר "🚀 Launch Firefox - Development (RECOMMENDED)"** מהרשימה. אל תלחץ F5 בלי לבחור - זה יפתח דפדפן ברירת מחדל (כנראה Chrome)!

### ניטור

```bash
# Health check
curl http://localhost:8080/api/health

# Detailed health
curl http://localhost:8080/api/health/detailed

# Collect metrics
curl -X POST http://localhost:8080/api/metrics/collect
```

### כפילויות

```bash
# Check duplicates
npm run check:duplicates

# JavaScript duplicates
python3 documentation/tools/analysis/js-duplicate-analyzer.py

# Advanced duplicate detection
node scripts/monitors/advanced-duplicate-detector.js
```

### תהליכים

```bash
# Check processes
python3 Backend/utils/server_lock_manager.py

# Check port
lsof -i :8080
```

### בדיקות Selenium

```bash
# Full Selenium test suite
python3 scripts/test_pages_console_errors.py

# Basic test (no Selenium)
python3 scripts/test_pages_console_simple.py
```

## Keyboard Shortcuts

### VS Code/Cursor Debugging

| קיצור | פעולה |
|------|-------|
| **F5** | Start/Continue debugging |
| **Shift+F5** | Stop debugging |
| **F9** | Toggle breakpoint |
| **F10** | Step over |
| **F11** | Step into |
| **Shift+F11** | Step out |
| **Ctrl+Shift+F5** | Restart debugging |

### Browser DevTools

| קיצור | פעולה |
|------|-------|
| **F12** | Open DevTools |
| **Ctrl+Shift+I** | Open DevTools (Windows/Linux) |
| **Cmd+Option+I** | Open DevTools (Mac) |
| **Ctrl+Shift+J** | Open Console (Windows/Linux) |
| **Cmd+Option+J** | Open Console (Mac) |

## Common Workflows

### 1. דיבוגינג JavaScript

```bash
# 1. הפעל שרת
./start_server.sh

# 2. הפעל Firefox
./scripts/debug/launch-firefox.sh

# 3. ב-VS Code/Cursor:
#    - לחץ F5
#    - בחר "Launch Firefox - Development"
#    - הגדר breakpoints
#    - השתמש ב-F10/F11
```

### 2. דיבוגינג Python

```bash
# 1. ב-VS Code/Cursor:
#    - לחץ F5
#    - בחר "Python: Flask App"
#    - הגדר breakpoints
#    - השתמש ב-F10/F11
```

### 3. בדיקת כפילויות

```bash
# 1. Check duplicates
npm run check:duplicates

# 2. Review results
# 3. Fix duplicates
# 4. Re-check
```

### 4. בדיקת תהליכים

```bash
# 1. Check processes
python3 Backend/utils/server_lock_manager.py

# 2. Kill if needed
# 3. Restart
```

## Console Commands

### JavaScript Console

```javascript
// System debug
window.debugSystem()
window.debugCache()
window.debugPages()
window.debugErrors()
window.debugPerformance()

// Event Handler debug
window.EventHandlerManager.debug.getStatistics()
window.EventHandlerManager.debug.getEventHistory(50)
window.EventHandlerManager.debug.findListenersForElement('#myButton')

// Logger
window.Logger.debug('message', context)
window.Logger.info('message', context)
window.Logger.warn('message', context)
window.Logger.error('message', context)
window.Logger.critical('message', context)
```

## Common Issues & Solutions

### בעיה: Firefox לא מתחבר

**פתרון:**

```bash
./scripts/debug/check-debug-status.sh
# אם לא פעיל:
./scripts/debug/launch-firefox.sh
```

### בעיה: Breakpoints לא עובדים

**פתרון:**

1. בדוק source maps
2. רענן דפדפן
3. בדוק path mappings

### בעיה: שגיאות לא נשלחות

**פתרון:**

```javascript
// בדוק Sentry
if (window.Sentry) {
    window.Sentry.captureException(error);
}
```

## קישורים מהירים

- [QA and Debugging Guide](QA_AND_DEBUGGING_GUIDE.md)
- [Selenium Testing Guide](../TESTING/SELENIUM_TESTING_GUIDE.md)
- [Browser Debugging Standards](../GUIDELINES/BROWSER_DEBUGGING_STANDARDS.md)
- [Debugging Standards](../GUIDELINES/DEBUGGING_STANDARDS.md)
- [Monitoring Standards](../GUIDELINES/MONITORING_STANDARDS.md)

---

**תאריך עדכון:** ינואר 2025

