# מדריך מקיף למערכת הלוגים - TikTrack

## Logging System Guide

### תאריך יצירה: דצמבר 2025

### גרסה: 1.0.0

### מחבר: TikTrack Development Team

---

## 📋 סקירה כללית

מערכת הלוגים של TikTrack היא מערכת מתקדמת ומקיפה המאפשרת ניטור, דיבוג וניהול שגיאות ברמה גבוהה. המערכת כוללת שני רבדים עיקריים:

1. **Logger Service (Frontend)** - מערכת לוגים מתקדמת בצד הלקוח
2. **Server Logs API (Backend)** - ניהול לוגים בצד השרת

---

## 🏗️ ארכיטקטורה

### רובד Frontend - Logger Service

#### מיקום: `trading-ui/scripts/logger-service.js`

#### תכונות עיקריות

- **5 רמות לוג**: DEBUG, INFO, WARN, ERROR, CRITICAL
- **שליחה לשרת**: batching אוטומטי עם הגנות
- **העדפות משתמש**: בקרת לוגים לפי קטגוריות
- **מניעת לופים**: הגנות מפני recursive calls
- **זיכרון חכם**: מניעת כפילויות ו-overflow

#### מצבי פעולה

- **מצב DEBUG**: כל הלוגים מוצגים ונשלחים לשרת
- **מצב ייצור**: רק שגיאות קריטיות

### רובד Backend - Server Logs API

#### מיקום: `Backend/routes/api/server_logs.py`

#### תכונות עיקריות

- **קריאה בלבד**: Read-Only Access לקבצי לוג
- **הגבלת גודל**: מקסימום 1000 רשומות
- **זנב לוג**: קריאת השורות האחרונות
- **סטטיסטיקות**: מידע על גודל ותאריך קבצים

---

## 📁 מקורות הלוגים

### לוגי שרת (Backend/logs/)

```text
app.log              - לוגים כלליים של האפליקציה
errors.log           - שגיאות בלבד
performance.log      - ביצועים וזמני טעינה
database.log         - פעולות בסיס נתונים
background_tasks.log - משימות ברקע
cache.log            - פעולות מטמון
```

### לוגי לקוח (נשמרים בשרת)

- נאספים דרך Logger Service
- נשמרים בטבלאות מסד נתונים
- נגישים דרך API endpoints

---

## 🔧 כלי ניהול לוגים

### 1. קריאת לוגים בטרמינל

#### קריאת לוגים חיים

```bash
# לוגים כלליים
tail -f Backend/logs/app.log

# שגיאות בלבד
tail -f Backend/logs/errors.log

# 100 השורות האחרונות
tail -n 100 Backend/logs/app.log
```

#### חיפוש מתקדם

```bash
# חיפוש שגיאות לפי סוג
grep "ERROR" Backend/logs/app.log | tail -20

# חיפוש לפי משתמש
grep "user123" Backend/logs/errors.log

# חיפוש לפי עמוד
grep "trades" Backend/logs/errors.log

# ספירת שגיאות
grep "ERROR" Backend/logs/app.log | cut -d' ' -f4 | sort | uniq -c | sort -nr
```

### 2. API Endpoints

#### סטטוס לוגים

```bash
curl http://localhost:8080/api/logs/status
```

#### קריאת לוג ספציפי

```bash
# 1000 השורות האחרונות
curl http://localhost:8080/api/logs/raw/app

# 50 שורות אחרונות
curl "http://localhost:8080/api/logs/raw/app?max_lines=50"

# זנב הלוג (100 שורות אחרונות)
curl "http://localhost:8080/api/logs/raw/app/tail?lines=100"
```

### 3. ממשק משתמש

#### דפי ניטור

- **Server Monitor**: `http://localhost:8080/server_monitor`
- **System Management**: `http://localhost:8080/system_management`

#### Unified Log Display

```javascript
// תצוגת לוגים מתקדמת
const logDisplay = new UnifiedLogDisplay('container-id', {
    logType: 'notificationHistory',
    displayConfig: 'default'
});
```

### 4. סקריפטים אוטומטיים

#### ניתוח לוגי קונסול

```bash
# מנתח שגיאות בדפים
python3 scripts/test_pages_console_errors.py

# ניתוח לוגי הומפייג'
python3 scripts/analyze_homepage_logs.py
```

---

## 📝 שימוש ב-Logger Service

### במקום console.log - השתמש ב-window.Logger

#### דוגמאות בסיסיות

```javascript
// ❌ לא לעשות
console.log("טעינת נתונים");
console.error("שגיאה קרתה", error);

// ✅ כן לעשות
window.Logger.info("טעינת נתונים", {
    page: "trades",
    userId: 123
});

window.Logger.error("שגיאה בטעינת נתונים", {
    error: error.message,
    page: "trades",
    userId: 123,
    stack: error.stack
});
```

### רמות לוג זמינות

```javascript
// רמות כלליות
window.Logger.debug("פרטים טכניים", context);
window.Logger.info("אירוע חשוב", context);
window.Logger.warn("אזהרה", context);
window.Logger.error("שגיאה", context);
window.Logger.critical("שגיאה קריטית", context);

// לוגים ספציפיים
window.Logger.performance("פעולה", duration, context);
window.Logger.userAction("לחיצה על כפתור", context);
window.Logger.apiCall("GET", "/api/trades", 200, 150, context);
window.Logger.cacheOperation("get", "trades_data", context);
```

### Context מומלץ

```javascript
const context = {
    page: window.location.pathname,        // עמוד נוכחי
    userId: currentUser?.id,              // מזהה משתמש
    sessionId: getSessionId(),            // מזהה סשן
    timestamp: new Date().toISOString(),  // חותמת זמן
    userAgent: navigator.userAgent,       // דפדפן
    action: "save_trade",                 // פעולה ספציפית
    entityId: tradeId,                    // מזהה ישות
    entityType: "trade"                   // סוג ישות
};

window.Logger.info("Trade saved successfully", context);
```

---

## 🎯 מדריך לצוות הפיתוח

### א. הגדרת סביבת פיתוח

```bash
# 1. התחל את השרת
./start_server.sh

# 2. בדוק שכל הלוגים נוצרים
ls -la Backend/logs/

# 3. פתח טרמינל נפרד לניטור
tail -f Backend/logs/app.log
```

### ב. ניטור בזמן פיתוח

```bash
# חלון 1: לוגים כלליים
tail -f Backend/logs/app.log

# חלון 2: שגיאות בלבד
tail -f Backend/logs/errors.log

# חלון 3: ביצועים
tail -f Backend/logs/performance.log
```

### ג. ניתוח שגיאות

```bash
# שגיאות לפי סוג
grep "ERROR" Backend/logs/app.log | tail -20

# שגיאות לפי משתמש
grep "user123" Backend/logs/errors.log

# שגיאות לפי עמוד
grep "trades" Backend/logs/errors.log

# סטטיסטיקות שגיאות
grep "ERROR" Backend/logs/app.log | grep -o '"level":"[^"]*"' | sort | uniq -c
```

### ד. ניטור ביצועים

```bash
# זמני טעינה
grep "performance\|duration" Backend/logs/performance.log

# קריאות API איטיות
grep "duration.*[0-9]\{4,\}" Backend/logs/performance.log

# מטמון
tail -f Backend/logs/cache.log
```

---

## 🚀 תכונות מתקדמות

### 1. העדפות משתמש

#### בקרת לוגים לפי קטגוריות

```javascript
// העדפות ב-userPreferences
{
    "console": {
        "logLevel": "INFO",
        "verboseLogging": true,
        "categories": {
            "console_logs_cache_enabled": true,
            "console_logs_ui_enabled": false,
            "console_logs_business_enabled": true
        }
    }
}
```

#### קטגוריות זמינות

- `cache` - פעולות מטמון
- `ui_components` - רכיבי ממשק
- `notifications` - התראות
- `system` - מערכת
- `initialization` - אתחול
- `business` - לוגיקה עסקית

### 2. Batching ושליחה לשרת

#### הגדרות batching

- **גודל batch**: 50 לוגים
- **timeout**: 10 שניות
- **max retries**: 3
- **rate limiting**: הגנה מפני 429 errors

#### תהליך השליחה

1. לוגים נאספים ב-`pendingLogs`
2. כשמגיעים ל-50 לוגים או ל-timeout → שליחה
3. שמירה ב-localStorage כגיבוי
4. ניקוי אחרי שליחה מוצלחת

### 3. הגנות מתקדמות

#### מניעת recursive calls

```javascript
if (this.isLogging) {
    return; // מונע לופים אינסופיים
}
```

#### מניעת כפילויות

```javascript
if (level >= Logger.LogLevel.ERROR) {
    const logKey = `${level}-${message}-${JSON.stringify(context)}`;
    if (this.duplicateLogs.has(logKey)) {
        return; // לוג כפול
    }
}
```

#### הגבלת גודל context

```javascript
const contextString = JSON.stringify(context);
if (contextString.length > this.maxContextSize) {
    context = { ...context, _truncated: true };
}
```

---

## 🛠️ פתרון בעיות נפוצות

### בעיה: לוגים לא מוצגים בקונסול

**פתרון:**

```javascript
// בדוק מצב DEBUG
console.log('DEBUG_MODE:', window.Logger?.DEBUG_MODE);

// בדוק העדפות משתמש
console.log('User preferences:', window.currentPreferences?.console);

// בדוק אם השירות נטען
console.log('Logger available:', !!window.Logger);
```

### בעיה: לוגים לא נשלחים לשרת

**פתרון:**

```bash
# בדוק חיבור לשרת
curl http://localhost:8080/api/health

# בדוק אם הלוגים נשמרים ב-localStorage
# (פתח DevTools → Application → Local Storage)

# בדוק לוגי שרת
tail -f Backend/logs/app.log
```

### בעיה: יותר מדי לוגים

**פתרון:**

```javascript
// כבה לוגים לפי קטגוריה
window.currentPreferences.console.categories['console_logs_cache_enabled'] = false;

// או שנה רמת לוג
window.Logger.setLevel(window.Logger.LogLevel.WARN);
```

---

## 📊 ניתוח לוגים מתקדם

### 1. סקריפט ניתוח אוטומטי

```bash
# ניתוח מקיף של לוגים
python3 scripts/analyze_logs_comprehensive.py \
    --type errors \
    --hours 24 \
    --output report.json
```

### 2. דשבורד לוגים (עתידי)

#### רעיון למימוש

- **גרף שגיאות לאורך זמן**
- **סטטיסטיקות לפי קטגוריה**
- **חיפוש מתקדם**
- **התראות בזמן אמת**
- **ייצוא דוחות**

### 3. אינטגרציה עם כלי חיצוניים

#### Sentry (לשגיאות קריטיות)

```javascript
if (window.Logger.DEBUG_MODE && window.Sentry) {
    window.Sentry.captureException(error);
}
```

#### Slack/Discord webhooks

```javascript
// התראות על שגיאות קריטיות לצוות
window.Logger.critical("Database connection failed", {
    notify: true,
    channels: ["#alerts", "#dev-team"]
});
```

---

## 📋 רשימת משימות להדרכת הצוות

### שבוע 1: יסודות

- [ ] הכרת מקורות הלוגים
- [ ] התקנת כלי קריאה בסיסיים
- [ ] הבנת ההבדל בין console.log ל-Logger

### שבוע 2: כלים מתקדמים

- [ ] שימוש ב-API endpoints
- [ ] ניתוח לוגים עם grep ו-sed
- [ ] יצירת scripts אוטומטיים

### שבוע 3: ניטור מתמשך

- [ ] הגדרת dashboards
- [ ] ניטור ביצועים
- [ ] טיפול בשגיאות production

### שבוע 4: שיפורים

- [ ] הצעות לשיפור הלוגים
- [ ] יצירת כלי ניתוח חדשים
- [ ] אוטומציה של תהליכי ניטור

---

## 🔗 קישורים חשובים

### תיעוד קשור

- [Debugging Quick Reference](DEBUGGING_QUICK_REFERENCE.md)
- [QA and Debugging Guide](QA_AND_DEBUGGING_GUIDE.md)
- [Browser Debugging Standards](../GUIDELINES/BROWSER_DEBUGGING_STANDARDS.md)

### קבצים חשובים

- `trading-ui/scripts/logger-service.js` - Logger Service
- `Backend/routes/api/server_logs.py` - Server Logs API
- `Backend/logs/` - תיקיית לוגי השרת

### סקריפטים שימושיים

- `scripts/test_pages_console_errors.py` - בדיקת שגיאות בדפים
- `scripts/analyze_homepage_logs.py` - ניתוח לוגי הומפייג'

---

## 📞 קשר ותמיכה

לשאלות או בעיות עם מערכת הלוגים:

- **טכני**: פנה ל-TikTrack Development Team
- **תיעוד**: עדכן את המסמך הזה עם שיפורים
- **באגים**: דווח דרך מערכת הלוגים עצמה!

---

**תאריך עדכון:** דצמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** פעיל ומתוחזק

---

*מערכת הלוגים של TikTrack היא כלי מתקדם המאפשר ניטור מקיף, דיבוג יעיל וניתוח שגיאות ברמה גבוהה.
השקעה בלמידת המערכת תחזיר את עצמה פי כמה באיכות הקוד ובמהירות הפיתוח.*
