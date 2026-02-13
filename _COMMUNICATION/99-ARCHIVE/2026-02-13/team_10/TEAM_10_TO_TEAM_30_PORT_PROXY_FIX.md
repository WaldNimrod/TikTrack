# 🔧 הודעה: תיקון שימוש ב-Proxy במקום כתובות ישירות

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-04  
**סטטוס:** 🔴 **CRITICAL - P0**  
**מקור:** פקודת האדריכל המאוחדת + דוח ביקורת חיצונית

---

## 📢 Executive Summary

לפי פקודת האדריכל ודוח הביקורת החיצונית, יש לעדכן את השירותים להשתמש ב-proxy של Vite במקום כתובות ישירות ל-Backend.

**בעיה:** `auth.js` ו-`apiKeys.js` משתמשים ב-`http://localhost:8082/api/v1` ישירות במקום דרך proxy.

---

## ⚠️ בעיה שזוהתה

### **מצב נוכחי:**

**`ui/src/cubes/identity/services/auth.js`:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1';
```

**`ui/src/cubes/identity/services/apiKeys.js`:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1';
```

**בעיה:** השימוש ב-`http://localhost:8082/api/v1` ישיר עוקף את ה-proxy של Vite.

---

## ✅ פתרון

### **שימוש ב-Proxy של Vite:**

**Vite כבר מוגדר עם proxy:**
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8082',
    changeOrigin: true,
    secure: false,
  },
}
```

**זה אומר:** כל בקשה ל-`/api/*` תועבר אוטומטית ל-`http://localhost:8082/api/*`.

---

## 📋 משימות

### **1. עדכון `auth.js`** 🔴 **CRITICAL**

**לפני:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1';
```

**אחרי:**
```javascript
// Use Vite proxy - all requests to /api/* are proxied to http://localhost:8082/api/*
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
```

**הסבר:**
- ב-Development: Vite proxy מעביר `/api/v1` ל-`http://localhost:8082/api/v1`
- ב-Production: צריך להגדיר `VITE_API_BASE_URL` ב-environment variables

---

### **2. עדכון `apiKeys.js`** 🔴 **CRITICAL**

**לפני:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1';
```

**אחרי:**
```javascript
// Use Vite proxy - all requests to /api/* are proxied to http://localhost:8082/api/*
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
```

---

## 🔍 בדיקות נדרשות

### **לאחר התיקונים:**

- [ ] `auth.js` משתמש ב-`/api/v1` דרך proxy
- [ ] `apiKeys.js` משתמש ב-`/api/v1` דרך proxy
- [ ] אין שגיאות CORS
- [ ] כל הבקשות עוברות דרך proxy
- [ ] Login/Register עובדים נכון

---

## 📚 מסמכים קשורים

- `ARCHITECT_PORT_LOCK.md` - פקודת נעילת פורטים
- `TEAM_10_EXTERNAL_AUDIT_FINAL_REPORT.md` - דוח ביקורת חיצונית (סעיף 1)
- `ui/vite.config.js` - הגדרות Proxy

---

## ⏱️ זמן משוער

**30 דקות - 1 שעה**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🔴 **CRITICAL - P0**

**log_entry | [Team 10] | PORT_PROXY_FIX | TO_TEAM_30 | RED | 2026-02-04**
