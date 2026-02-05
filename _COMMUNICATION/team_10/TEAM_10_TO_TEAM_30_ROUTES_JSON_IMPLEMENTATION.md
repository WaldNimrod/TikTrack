# 🗺️ הודעה: יישום Routes SSOT - routes.json

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-04  
**סטטוס:** 🟡 **HIGH PRIORITY - P1**  
**מקור:** פקודת האדריכל המאוחדת + דוח ביקורת חיצונית

---

## 📢 Executive Summary

לפי פקודת האדריכל, יש לאמץ `routes.json` כמקור אמת יחיד לנתיבי המערכת, נגיש ב-Runtime דרך Fetch ב-Auth Guard.

**בעיה:** `vite.config.js` מכיל hardcoded `routeToHtmlMap` שלא נגיש ב-runtime, ו-`auth-guard.js` לא משתמש ב-routes.

---

## ⚠️ בעיה שזוהתה

### **מצב נוכחי:**

**`ui/vite.config.js`:**
```javascript
const routeToHtmlMap = {
  '/trading_accounts': '/views/financial/trading_accounts.html',
  '/brokers_fees': '/views/financial/brokers_fees.html',
  '/cash_flows': '/views/financial/cash_flows.html',
};
```

**בעיה:** זה לא נגיש ב-browser runtime - רק ב-build time.

**`_COMMUNICATION/team_10/routes.json`:**
```json
{
  "version": "1.0.0",
  "base_url": "http://localhost:8080",
  "api_url": "http://localhost:8082",
  "paths": {
    "auth": {
      "login": "/login.html",
      "register": "/register.html"
    },
    "financial": {
      "accounts": "/trading_accounts.html",
      "dashboard": "/index.html"
    }
  }
}
```

**בעיה:** הקובץ לא נגיש ב-runtime - צריך להיות ב-`ui/public/`.

---

## ✅ פתרון

### **1. העברת `routes.json` ל-`ui/public/`**

**פעולות:**
1. להעתיק את `routes.json` מ-`_COMMUNICATION/team_10/` ל-`ui/public/routes.json`
2. לעדכן את המבנה לפי הצורך:
   ```json
   {
     "version": "1.0.0",
     "base_url": "http://localhost:8080",
     "api_url": "http://localhost:8082",
     "routes": {
       "/trading_accounts": "/views/financial/tradingAccounts/trading_accounts.html",
       "/brokers_fees": "/views/financial/brokersFees/brokers_fees.html",
       "/cash_flows": "/views/financial/cashFlows/cash_flows.html",
       "/login": "/login",
       "/register": "/register"
     },
     "public_routes": [
       "/login",
       "/register",
       "/reset-password"
     ]
   }
   ```

---

### **2. עדכון `auth-guard.js` לטעון routes**

**פעולות:**
1. להוסיף פונקציה לטעינת `routes.json` דרך Fetch
2. להשתמש ב-routes לזיהוי public routes
3. להשתמש ב-routes לזיהוי HTML pages

**דוגמה:**
```javascript
let routesConfig = null;

async function loadRoutesConfig() {
  if (routesConfig) return routesConfig;
  
  try {
    const response = await fetch('/routes.json');
    if (!response.ok) throw new Error('Failed to load routes.json');
    routesConfig = await response.json();
    return routesConfig;
  } catch (error) {
    console.error('[Auth Guard] Failed to load routes.json:', error);
    // Fallback to default routes
    return {
      public_routes: ['/login', '/register', '/reset-password'],
      routes: {}
    };
  }
}

// Use in isPublicRoute
async function isPublicRoute(path) {
  const config = await loadRoutesConfig();
  return config.public_routes?.includes(path) || false;
}
```

---

### **3. עדכון `vite.config.js` להשתמש ב-routes.json**

**פעולות:**
1. לטעון את `routes.json` ב-build time
2. להשתמש בו במקום hardcoded map

**דוגמה:**
```javascript
import fs from 'fs';
import path from 'path';

// Load routes.json
const routesPath = path.join(__dirname, 'public', 'routes.json');
let routeToHtmlMap = {};

if (fs.existsSync(routesPath)) {
  const routesConfig = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
  routeToHtmlMap = routesConfig.routes || {};
} else {
  console.warn('[Vite Config] routes.json not found, using fallback');
  // Fallback
  routeToHtmlMap = {
    '/trading_accounts': '/views/financial/tradingAccounts/trading_accounts.html',
    '/brokers_fees': '/views/financial/brokersFees/brokers_fees.html',
    '/cash_flows': '/views/financial/cashFlows/cash_flows.html',
  };
}
```

---

## 🔍 בדיקות נדרשות

### **לאחר התיקונים:**

- [ ] `routes.json` קיים ב-`ui/public/` ונגיש ב-runtime
- [ ] `auth-guard.js` טוען routes מ-`/routes.json`
- [ ] `auth-guard.js` משתמש ב-routes לזיהוי public routes
- [ ] `vite.config.js` משתמש ב-`routes.json` במקום hardcoded map
- [ ] כל הנתיבים עובדים נכון

---

## 📚 מסמכים קשורים

- `ARCHITECT_PORT_LOCK.md` - פקודת האדריכל (Routes SSOT)
- `TEAM_10_EXTERNAL_AUDIT_FINAL_REPORT.md` - דוח ביקורת חיצונית (סעיף 5)
- `_COMMUNICATION/team_10/routes.json` - קובץ routes קיים

---

## ⏱️ זמן משוער

**3-4 שעות**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🟡 **HIGH PRIORITY - P1**

**log_entry | [Team 10] | ROUTES_JSON | TO_TEAM_30 | YELLOW | 2026-02-04**
