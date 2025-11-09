# API URL Usage Guide - TikTrack

**תאריך:** 2025-11-09  
**גרסה:** 1.0.0  
**מטרה:** מדריך לשימוש בכתובות API בקוד Frontend

---

## סקירה כללית

כל הקוד ב-Frontend משתמש ב-**relative URLs** (`/api/...`) במקום hardcoded URLs. זה מאפשר לקוד לעבוד אוטומטית גם בפיתוח (פורט 8080) וגם בפרודקשן (פורט 5001).

## הגדרות מרכזיות

### קובץ `api-config.js`

קובץ `trading-ui/scripts/api-config.js` מגדיר את ההגדרות המרכזיות:

```javascript
// API Base URL - משתמש ב-relative URLs
window.API_BASE_URL = '';

// זיהוי סביבה אוטומטי
window.API_ENV = 'development' | 'production';
```

**הערה:** הקובץ נטען ראשון בכל עמוד (לפני כל שאר הסקריפטים).

## שימוש בקוד

### דוגמה 1: Fetch פשוט

**לפני (❌ לא נכון):**
```javascript
const response = await fetch('http://127.0.0.1:8080/api/currencies/');
```

**אחרי (✅ נכון):**
```javascript
const response = await fetch('/api/currencies/');
```

### דוגמה 2: עם Headers

**לפני (❌ לא נכון):**
```javascript
const response = await fetch('http://127.0.0.1:8080/api/trades/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**אחרי (✅ נכון):**
```javascript
const response = await fetch('/api/trades/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### דוגמה 3: Classes עם apiBase

**לפני (❌ לא נכון):**
```javascript
class ConstraintsMonitor {
  constructor() {
    this.apiBase = 'http://localhost:8080/api/constraints';
  }
}
```

**אחרי (✅ נכון):**
```javascript
class ConstraintsMonitor {
  constructor() {
    this.apiBase = '/api/constraints';
  }
}
```

### דוגמה 4: File Protocol Fallback (לא נדרש)

**לפני (❌ לא נכון):**
```javascript
const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
const url = `${base}/api/trade_plans/`;
```

**אחרי (✅ נכון):**
```javascript
// Use relative URL to work with both development (8080) and production (5001)
const url = '/api/trade_plans/';
```

## בדיקת Hardcoded URLs

### סקריפט בדיקה

הרצת סקריפט לבדיקת hardcoded URLs שנותרו:

```bash
python3 scripts/check-hardcoded-urls.py
```

הסקריפט יחפש:
- `http://127.0.0.1:8080`
- `http://localhost:8080`
- `:8080` בכתובות
- `location.protocol === 'file:'` fallbacks

### תוצאה צפויה

```
================================================================================
TikTrack - Hardcoded URLs Checker
================================================================================

✅ SUCCESS: No hardcoded URLs found!
All URLs use relative paths or window.API_BASE_URL
```

## כללים חשובים

1. **תמיד להשתמש ב-relative URLs:** `/api/...` במקום hardcoded URLs
2. **לא להשתמש ב-file protocol fallback:** לא נדרש בפרודקשן
3. **לא להשתמש ב-window.API_BASE_URL:** לא נדרש אם משתמשים ב-relative URLs ישירות
4. **לבדוק אחרי שינויים:** להריץ `check-hardcoded-urls.py` אחרי שינויים

## יתרונות

1. **עובד אוטומטית:** הקוד עובד בפיתוח ובפרודקשן ללא שינויים
2. **פשוט לתחזק:** אין צורך לשנות כתובות בכל מקום
3. **פחות שגיאות:** אין סיכון לכתובות שגויות
4. **גמיש:** עובד עם כל פורט וכתובת שרת

## קבצים שתוקנו

כל הקבצים הבאים תוקנו להשתמש ב-relative URLs:

- `trading_accounts.js`
- `data-utils.js`
- `modules/data-advanced.js`
- `constraint-manager.js`
- `constraints.js`
- `currencies.js`
- `auth.js`
- `modules/ui-basic.js`
- `modules/business-module.js`
- `trades.js`
- `trade_plans.js`
- `trade-plan-service.js`
- `ui-utils.js`
- `cash_flows.js`
- `active-alerts-component.js`
- `external-data-dashboard.js`

**סה"כ:** 16 קבצים תוקנו, 22 hardcoded URLs הוחלפו.

---

**Last Updated:** 2025-11-09  
**Version:** 1.0.0  
**Author:** TikTrack Development Team

