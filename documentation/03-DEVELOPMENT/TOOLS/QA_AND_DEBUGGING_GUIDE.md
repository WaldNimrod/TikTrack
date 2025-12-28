# מדריך QA ודיבוגינג מרכזי - TikTrack

## QA and Debugging Guide

### תאריך יצירה

ינואר 2025

## סקירה כללית

מדריך זה מספק סקירה מקיפה של כל כלי ה-QA והדיבוגינג במערכת TikTrack, כולל מתי להשתמש בכל כלי, דרכי יישום מיטביות, ודוגמאות שימוש.

## כלי דיבוגינג

### 1. Debugger for Firefox

**תיאור:** תוסף ל-VS Code/Cursor המאפשר דיבוגינג ישיר ב-Firefox מתוך ה-IDE.

**מתי להשתמש:**

- דיבוגינג JavaScript רגיל
- בדיקת source maps
- בדיקת breakpoints
- בדיקת variables ו-watch expressions

**דרכי יישום:**

1. הפעל Firefox עם remote debugging: `./scripts/debug/launch-firefox.sh`
2. או השתמש ב-VS Code/Cursor launch configuration "Launch Firefox - Development"
3. הגדר breakpoints ב-IDE
4. השתמש ב-step through, watch expressions, call stack

**דוגמה:**

```bash
# הפעל Firefox
./scripts/debug/launch-firefox.sh

# ב-VS Code/Cursor:
# 1. לחץ F5
# 2. בחר "Launch Firefox - Development"
# 3. הגדר breakpoints
# 4. השתמש ב-F10/F11 לשלב
```

**קישורים:**

- [Browser Debugging Standards](../GUIDELINES/BROWSER_DEBUGGING_STANDARDS.md)
- [Debugging Standards](../GUIDELINES/DEBUGGING_STANDARDS.md)

---

### 2. VS Code Python Debugger

**תיאור:** תוסף ל-VS Code המאפשר דיבוגינג Python ישירות מה-IDE.

**מתי להשתמש:**

- דיבוגינג Python/Flask
- בדיקת API endpoints
- בדיקת business logic
- בדיקת database queries

**דרכי יישום:**

1. התקן Python extension ב-VS Code
2. השתמש ב-launch configuration "Python: Flask App"
3. הגדר breakpoints ב-Python code
4. השתמש ב-step through, watch expressions

**דוגמה:**

```python
# ב-Python code
def get_trades(user_id):
    # Set breakpoint here
    trades = db.query(Trade).filter_by(user_id=user_id).all()
    return trades
```

**קישורים:**

- [Debugging Standards](../GUIDELINES/DEBUGGING_STANDARDS.md)

---

### 3. System Debug Helper

**תיאור:** כלי דיבוגינג מקיף לבדיקת המערכת.

**מתי להשתמש:**

- בדיקה מקיפה של המערכת
- בדיקת מטמון
- בדיקת עמודים
- בדיקת שגיאות וביצועים

**דרכי יישום:**

```javascript
// בקונסולה של הדפדפן
window.debugSystem()      // בדיקה מקיפה
window.debugCache()       // בדיקת מטמון
window.debugPages()       // בדיקת עמודים
window.debugErrors()      // בדיקת שגיאות
window.debugPerformance() // בדיקת ביצועים
```

**קישורים:**

- [Code Quality Systems Guide](CODE_QUALITY_SYSTEMS_GUIDE.md)

---

### 4. EventHandlerManager Debug API

**תיאור:** API דיבוגינג למערכת Event Handler.

**מתי להשתמש:**

- דיבוגינג אירועים
- בדיקת event listeners
- בדיקת event history
- בדיקת שגיאות אירועים

**דרכי יישום:**

```javascript
// Get debug API
const debug = window.EventHandlerManager.debug;

// Check system status
const stats = debug.getStatistics();
console.log('System status:', stats);

// Get event history
const history = debug.getEventHistory(50);
console.log('Recent events:', history);

// Find listeners for element
const listeners = debug.findListenersForElement('#myButton');
console.log('Listeners:', listeners);
```

**קישורים:**

- [Event Handler Debugging Guide](../GUIDES/EVENT_HANDLER_DEBUGGING_GUIDE.md)

---

## כלי ניטור

### 1. Logger Service

**תיאור:** מערכת לוגים מאוחדת עם שליטה מלאה על רמות הלוג.

**מתי להשתמש:**

- לוגים ברמות שונות
- שמירה מקומית ושליחה לשרת
- מצב DEBUG ו-Production

**דרכי יישום:**

```javascript
// לוגים ברמות שונות
window.Logger.debug('מידע מפורט לפיתוח', context)
window.Logger.info('מידע כללי', context)
window.Logger.warn('אזהרות', context)
window.Logger.error('שגיאות', context)
window.Logger.critical('שגיאות קריטיות', context)
```

**קישורים:**

- [Monitoring Standards](../GUIDELINES/MONITORING_STANDARDS.md)

---

### 2. Health Service

**תיאור:** מערכת ניטור בריאות מערכת מקיפה.

**מתי להשתמש:**

- בדיקות בריאות מקיפות
- Database Health, Cache Health, System Health, API Health
- מדדי ביצועים

**דרכי יישום:**

```bash
# Health check
curl http://localhost:8080/api/health

# Detailed health
curl http://localhost:8080/api/health/detailed
```

**קישורים:**

- [Monitoring Standards](../GUIDELINES/MONITORING_STANDARDS.md)
- [Server Management Guide](../../server/SERVER_MANAGEMENT_GUIDE.md)

---

### 3. Metrics Collector

**תיאור:** מערכת איסוף מדדי ביצועים.

**מתי להשתמש:**

- Performance Metrics
- Database Metrics
- Business Metrics
- Cache Metrics

**דרכי יישום:**

```bash
# Collect metrics
curl -X POST http://localhost:8080/api/metrics/collect
```

**קישורים:**

- [Monitoring Standards](../GUIDELINES/MONITORING_STANDARDS.md)

---

## כלי זיהוי כפילויות

### 1. jscpd

**תיאור:** Copy/paste detector ל-JavaScript, TypeScript, Python, ועוד.

**מתי להשתמש:**

- זיהוי כפילויות אוטומטי
- לפני commit
- במהלך code review

**דרכי יישום:**

```bash
# Check duplicates
npm run check:duplicates

# או
npx jscpd trading-ui/scripts/
```

**קישורים:**

- [Duplicate Prevention Standards](../GUIDELINES/DUPLICATE_PREVENTION_STANDARDS.md)

---

### 2. js-duplicate-analyzer.py

**תיאור:** מנתח כפילויות JavaScript.

**מתי להשתמש:**

- סריקה מקיפה של כל קבצי JavaScript
- זיהוי פונקציות כפולות, משתנים כפולים
- זיהוי event listeners כפולים

**דרכי יישום:**

```bash
python3 documentation/tools/analysis/js-duplicate-analyzer.py
```

**קישורים:**

- [Duplicate Prevention Standards](../GUIDELINES/DUPLICATE_PREVENTION_STANDARDS.md)

---

### 3. advanced-duplicate-detector.js

**תיאור:** זיהוי כפילויות מתקדם.

**מתי להשתמש:**

- זיהוי כפילויות מתקדם
- בדיקות מקיפות
- דוחות מפורטים

**דרכי יישום:**

```bash
node scripts/monitors/advanced-duplicate-detector.js
```

**קישורים:**

- [Duplicate Prevention Standards](../GUIDELINES/DUPLICATE_PREVENTION_STANDARDS.md)
- [Code Quality Dashboard](../../../trading-ui/code_quality_dashboard.html)

---

## כלי בדיקות אוטומטיות

### 1. Selenium Testing

**תיאור:** מערכת בדיקות אוטומטיות בדפדפן לבדיקת שגיאות JavaScript, console messages, ואיתחול מערכות.

**מתי להשתמש:**

- לפני סיום תוכנית או בקשת בדיקות ידניות
- אחרי שינויים גדולים במערכות ליבה
- לפני production deployment
- אחרי תיקון באגים

**דרכי יישום:**

```bash
# הרצת בדיקות Selenium מלאות
python3 scripts/test_pages_console_errors.py

# או בדיקה בסיסית (ללא Selenium)
python3 scripts/test_pages_console_simple.py
```

**מה הוא בודק:**

- שגיאות JavaScript בזמן ריצה (לא נראות ב-HTML)
- הודעות קונסול (errors, warnings)
- איתחול מערכות (Header, Core Systems, Preferences)
- זמני טעינה
- שגיאות קריטיות (Maximum call stack, Uncaught errors, SyntaxError)

**תוצאות:**

- `console_errors_report.json` - דוח מלא
- פלט בקונסול עם סיכום

**קישורים:**

- [Selenium Testing Guide](../TESTING/SELENIUM_TESTING_GUIDE.md)
- [Selenium Testing Rule](../../../.cursorrules) - חוק CRITICAL

---

## עמודי בדיקה (Test Pages)

### סקירה כללית

המערכת כוללת 18 עמודי בדיקה קיימים ו-8 עמודי בדיקה מוצעים לבדיקת מערכות כלליות.

**קישור למדריך מלא:** [מדריך עמודי בדיקה](../TESTING/TEST_PAGES_GUIDE.md)

### עמודי בדיקה קיימים (18 עמודים)

#### בדיקות מערכות ליבה (Core Systems)

1. **test_header_only.html** - בדיקת Header System ופילטרים
   - מיקום: `trading-ui/test_header_only.html`
   - מטרה: בדיקת Header System, פילטרים, אינטגרציה עם טבלאות
   - שימוש: `http://localhost:8080/test_header_only`

2. **test_monitoring.html** - בדיקת מערכת ניטור
   - מיקום: `trading-ui/test_monitoring.html`
   - מטרה: בדיקת מערכת ניטור, DataCollectionService, UnifiedCacheManager, NotificationSystem, Logger Service
   - שימוש: `http://localhost:8080/test_monitoring`

3. **test_frontend_wrappers.html** - בדיקת Business Logic API Wrappers
   - מיקום: `trading-ui/test_frontend_wrappers.html`
   - מטרה: בדיקת TradesData, ExecutionsData, AlertsData wrappers ו-UI Utils functions
   - שימוש: `http://localhost:8080/test_frontend_wrappers`

#### בדיקות UI Components

4. **test_bootstrap_popover_comparison.html** - השוואת Bootstrap Popover vs WidgetOverlayService
   - מיקום: `trading-ui/test_bootstrap_popover_comparison.html`
   - מטרה: השוואת ביצועים ותכונות
   - שימוש: `http://localhost:8080/test_bootstrap_popover_comparison`

5. **test_nested_modal_rich_text.html** - בדיקת Rich Text Editor במודלים מקוננים
   - מיקום: `trading-ui/test_nested_modal_rich_text.html`
   - מטרה: בדיקת Quill.js initialization במודלים מקוננים
   - שימוש: `http://localhost:8080/test_nested_modal_rich_text`

6. **test_overlay_debug.html** - בדיקת WidgetOverlayService
   - מיקום: `trading-ui/test_overlay_debug.html`
   - מטרה: בדיקת positioning ו-debug
   - שימוש: `http://localhost:8080/test_overlay_debug`

7. **test_quill.html** - בדיקת Quill.js
   - מיקום: `trading-ui/test_quill.html`
   - מטרה: בדיקת Rich Text Editor ו-dynamic loading
   - שימוש: `http://localhost:8080/test_quill`

#### בדיקות ווידג'טים

8. **test_unified_widget.html** - בדיקת Unified Pending Actions Widget בסיסי
   - מיקום: `trading-ui/test_unified_widget.html`
   - מטרה: בדיקת widget initialization ו-functionality
   - שימוש: `http://localhost:8080/test_unified_widget`

9. **test_unified_widget_integration.html** - בדיקת אינטגרציה של Unified Widget
   - מיקום: `trading-ui/test_unified_widget_integration.html`
   - מטרה: בדיקת אינטגרציה עם מערכות אחרות
   - שימוש: `http://localhost:8080/test_unified_widget-integration`
   - **הערה:** מומלץ לאחד עם `test_unified_widget.html`

10. **test_unified_widget_comprehensive.html** - בדיקות מקיפות של Unified Widget
    - מיקום: `trading-ui/test_unified_widget_comprehensive.html`
    - מטרה: בדיקת כל התכונות
    - שימוש: `http://localhost:8080/test_unified_widget-comprehensive`

11. **test_recent_items_widget.html** - בדיקת Recent Items Widget
    - מיקום: `trading-ui/test_recent_items_widget.html`
    - מטרה: בדיקת widget functionality
    - שימוש: `http://localhost:8080/test_recent_items_widget`

12. **test_ticker_widgets_performance.html** - בדיקת ביצועי Ticker Widgets
    - מיקום: `trading-ui/test_ticker_widgets_performance.html`
    - מטרה: בדיקת performance
    - שימוש: `http://localhost:8080/test_ticker_widgets_performance`

#### בדיקות אינטגרציה

13. **test_user_ticker_integration.html** - בדיקת אינטגרציה של User Ticker
    - מיקום: `trading-ui/test_user_ticker_integration.html`
    - מטרה: בדיקת אינטגרציה עם מערכות אחרות
    - שימוש: `http://localhost:8080/test_user_ticker_integration`

14. **scripts/test-user-ticker-frontend.html** - בדיקת User Ticker Frontend
    - מיקום: `trading-ui/scripts/test-user-ticker-frontend.html`
    - מטרה: בדיקת frontend functionality
    - שימוש: `http://localhost:8080/scripts/test-user-ticker-frontend.html`

15. **conditions_test.html** - בדיקת מערכת Conditions
    - מיקום: `trading-ui/conditions_test.html`
    - מטרה: בדיקת תנאי מסחר ו-CRUD operations
    - שימוש: `http://localhost:8080/conditions_test`

16. **external_data_dashboard.html** - דשבורד נתונים חיצוניים
    - מיקום: `trading-ui/external_data_dashboard.html`
    - מטרה: ניהול מקורות נתונים חיצוניים
    - שימוש: `http://localhost:8080/external_data_dashboard`

#### בדיקות מיושנות (לבדיקת רלוונטיות)

17. **test_phase1_recovery.html** - בדיקת שחזור Phase 1
    - מיקום: `trading-ui/test_phase1_recovery.html`
    - מטרה: בדיקת מערכת ניטור, Logger Service, Cache Systems
    - שימוש: `http://localhost:8080/test_phase1_recovery`
    - **הערה:** לבדוק רלוונטיות - האם Phase 1 עדיין רלוונטי?

18. **test_phase3_1_comprehensive.html** - בדיקות מקיפות של Phase 3.1
    - מיקום: `trading-ui/test_phase3_1_comprehensive.html`
    - מטרה: בדיקת UnifiedAppInitializer, Preferences, Cache System
    - שימוש: `http://localhost:8080/test_phase3_1_comprehensive`
    - **הערה:** לבדוק רלוונטיות - האם Phase 3.1 עדיין רלוונטי?

### עמודי בדיקה מוצעים (8 עמודים - עדיפות גבוהה)

1. **test-cache-system.html** - בדיקת UnifiedCacheManager (4 שכבות)
2. **test-preferences-system.html** - בדיקת PreferencesSystem
3. **test-data-services.html** - בדיקת כל Data Services (12 ישויות)
4. **test-table-system.html** - בדיקת UnifiedTableSystem
5. **test-modal-system.html** - בדיקת ModalManagerV2
6. **test-notification-system.html** - בדיקת NotificationSystem
7. **test-button-system.html** - בדיקת ButtonSystem
8. **test-initialization-system.html** - בדיקת Unified Initialization System

### בעיות עיקריות בעמודי בדיקה קיימים

1. **Logger Service:** 14 עמודים לא משתמשים כלל, 4 עמודים משתמשים חלקית
2. **מערכות UI:** רוב העמודים לא משתמשים במערכות כלליות
3. **מערכות נתונים:** רוב העמודים לא משתמשים במערכות כלליות
4. **כפילויות:** 3 קבוצות של כפילויות מזוהות

### קישורים לדוחות מפורטים

- [מדריך עמודי בדיקה מלא](../TESTING/TEST_PAGES_GUIDE.md)
- [דוח ניתוח מפורט](../TESTING/TEST_PAGES_ANALYSIS_REPORT.md)
- [מטריצת מיפוי מערכות ↔ עמודי בדיקה](../TESTING/SYSTEMS_TO_TEST_PAGES_MAPPING.md)
- [דוח בעיות אינטגרציה](../TESTING/INTEGRATION_ISSUES_REPORT.md)
- [דוח זיהוי כפילויות](../TESTING/DUPLICATES_IDENTIFICATION_REPORT.md)
- [דוח מערכות ללא עמוד בדיקה](../TESTING/MISSING_TEST_PAGES_REPORT.md)
- [רשימת עמודי בדיקה מוצעים](../TESTING/PROPOSED_NEW_TEST_PAGES.md)
- [מטריצת התקדמות](../TESTING/TEST_PAGES_PROGRESS_MATRIX.md)

---

## כלי ניטור תהליכים

### 1. Server Lock Manager

**תיאור:** מערכת ניהול תהליכי שרת למניעת תהליכים מקבילים.

**מתי להשתמש:**

- בדיקת תהליכים קיימים
- מניעת תהליכים מקבילים
- ניהול תהליכי שרת

**דרכי יישום:**

```bash
# Check processes
python3 Backend/utils/server_lock_manager.py

# או
./start_server.sh --check-only
```

**קישורים:**

- [Parallel Process Prevention Standards](../GUIDELINES/PARALLEL_PROCESS_PREVENTION_STANDARDS.md)
- [Server Management Guide](../../server/SERVER_MANAGEMENT_GUIDE.md)

---

## מתי להשתמש בכל כלי

### לפי סוג בעיה

#### בעיות JavaScript

1. **Debugger for Firefox** - דיבוגינג רגיל
2. **System Debug Helper** - בדיקה מקיפה
3. **EventHandlerManager Debug API** - בעיות אירועים
4. **Logger Service** - לוגים וניטור

#### בעיות Python

1. **VS Code Python Debugger** - דיבוגינג רגיל
2. **pdb** - דיבוגינג מהיר
3. **Logger Service** - לוגים וניטור

#### בעיות כפילויות

1. **jscpd** - זיהוי אוטומטי
2. **js-duplicate-analyzer.py** - ניתוח JavaScript
3. **advanced-duplicate-detector.js** - ניתוח מתקדם

#### בעיות תהליכים מקבילים

1. **Server Lock Manager** - בדיקת תהליכים
2. **Process monitoring** - ניטור תהליכים

#### בדיקות אוטומטיות

1. **Selenium Testing** - בדיקות מלאות לפני סיום תוכנית
2. **test_pages_console_errors.py** - בדיקת שגיאות JavaScript

---

## דרכי יישום מיטביות

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

### 3. אחרי דיבוגינג

- הסר breakpoints זמניים
- הסר console logs זמניים
- תעד את הפתרון
- סגור Firefox אם לא צריך

---

## Troubleshooting Guide

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

### בעיה: שגיאות לא נשלחות ל-Sentry

**פתרון:**

1. בדוק ש-Sentry מותקן ומוגדר
2. בדוק ש-DSN נכון
3. בדוק ש-source maps מוגדרים

### בעיה: jscpd מזהה false positives

**פתרון:**

1. בדוק את ה-configuration
2. התאם את ה-threshold
3. הוסף exceptions

---

## קישורים רלוונטיים

- [Debugging Quick Reference](DEBUGGING_QUICK_REFERENCE.md)
- [Onboarding Debugging Guide](../GUIDELINES/ONBOARDING_DEBUGGING_GUIDE.md)
- [Debugging Checklist](../GUIDELINES/DEBUGGING_CHECKLIST.md)
- [Debugging Tools Research](DEBUGGING_TOOLS_RESEARCH.md)

---

**תאריך עדכון:** ינואר 2025

