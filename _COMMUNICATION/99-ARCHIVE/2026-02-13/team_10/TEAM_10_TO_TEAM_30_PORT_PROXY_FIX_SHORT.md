# 🔧 הודעה: תיקון שימוש ב-Proxy במקום כתובות ישירות (P0)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-04  
**סטטוס:** 🔴 **CRITICAL - P0**  
**מקור:** פקודת האדריכל המאוחדת (אושר)

---

## 📢 Executive Summary

לפי פקודת האדריכל ודוח הביקורת החיצונית, יש לעדכן את השירותים להשתמש ב-proxy של Vite במקום כתובות ישירות ל-Backend.

**בעיה:** `auth.js` ו-`apiKeys.js` משתמשים ב-`http://localhost:8082/api/v1` ישירות במקום דרך proxy.

---

## 📋 משימות

1. ⚠️ **עדכון `auth.js`** - להשתמש ב-`/api/v1` דרך proxy במקום `http://localhost:8082/api/v1`
2. ⚠️ **עדכון `apiKeys.js`** - להשתמש ב-`/api/v1` דרך proxy במקום `http://localhost:8082/api/v1`

**שינוי נדרש:**
```javascript
// לפני
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1';

// אחרי
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
```

---

## 📚 קובץ מפורט

**לפרטים מלאים:** `TEAM_10_TO_TEAM_30_PORT_PROXY_FIX.md`

---

## ⏱️ זמן משוער

**30 דקות - 1 שעה**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🔴 **CRITICAL - P0**
