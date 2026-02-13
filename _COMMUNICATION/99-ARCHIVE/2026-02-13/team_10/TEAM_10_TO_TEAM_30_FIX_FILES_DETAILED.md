# 🔧 הודעה: החלפת קבצים בגרסאות FIX - הוראות מפורטות

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-04  
**סטטוס:** 🟢 **MEDIUM PRIORITY - P2**  
**מקור:** פקודת האדריכל המאוחדת

---

## 📢 Executive Summary

כל קבצי FIX נמצאו ומוכנים להחלפה. הוראות מפורטות להחלפת כל קובץ.

---

## ✅ קבצי FIX שנמצאו

### **מיקום:** `_COMMUNICATION/90_Architects_comunication/`

1. ✅ **`FIX_PhoenixFilterContext.jsx`** - Gold Standard v1.1
2. ✅ **`FIX_transformers.js`** - Hardened v1.2
3. ✅ **`routes.json`** - SSOT Paths v1.1.0
4. ✅ **`auth-guard.js`** - Hardened v1.2 (ב-`_COMMUNICATION/team_10/`)

---

## 📋 הוראות מפורטות

### **1. החלפת `PhoenixFilterContext.jsx`**

**מיקום נוכחי:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`  
**קובץ FIX:** `_COMMUNICATION/90_Architects_comunication/FIX_PhoenixFilterContext.jsx`

**שינויים בגרסת FIX:**
- ✅ הוספת `useEffect` עם Listener ל-`phoenix-filter-change` event
- ✅ עדכון State בהתאם לאירועי Bridge
- ✅ חיבור ל-`window.PhoenixBridge`

**פעולות:**
1. לגבות את הקובץ הנוכחי
2. להעתיק את `FIX_PhoenixFilterContext.jsx` ל-`ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`
3. לבדוק שהכל עובד

**בדיקות:**
- [ ] Context נטען נכון
- [ ] Listener לאירועי Bridge עובד
- [ ] עדכון State בהתאם לאירועי Bridge

---

### **2. החלפת `transformers.js`**

**מיקום נוכחי:** `ui/src/cubes/shared/utils/transformers.js`  
**קובץ FIX:** `_COMMUNICATION/90_Architects_comunication/FIX_transformers.js`

**שינויים בגרסת FIX:**
- ✅ המרת מספרים כפויה לשדות כספיים (`balance`, `price`, `amount`)
- ✅ ערכי ברירת מחדל (`value !== null ? Number(value) : 0`)
- ✅ Nullish coalescing (`value ?? null`)

**פעולות:**
1. לגבות את הקובץ הנוכחי
2. להעתיק את `FIX_transformers.js` ל-`ui/src/cubes/shared/utils/transformers.js`
3. לבדוק שהכל עובד

**בדיקות:**
- [ ] המרת מספרים עובדת נכון
- [ ] ערכי ברירת מחדל נכונים
- [ ] כל ה-API calls עובדים

---

### **3. החלפת `auth-guard.js`**

**מיקום נוכחי:** `ui/src/components/core/authGuard.js`  
**קובץ FIX:** `_COMMUNICATION/team_10/auth-guard.js`

**שינויים צפויים בגרסת FIX:**
- ✅ Debug-only masking
- ✅ Token censoring
- ✅ Runtime route fetching מ-`routes.json`

**פעולות:**
1. לקרוא את הקובץ FIX המלא
2. להשוות עם הקובץ הנוכחי
3. למזג את השינויים או להחליף

**הערה:** הקובץ FIX נראה חלקי (17 שורות) - צריך לבדוק אם יש קובץ מלא יותר.

**בדיקות:**
- [ ] Masking עובד נכון
- [ ] טעינת routes מ-`routes.json` עובדת
- [ ] כל הפונקציונליות עובדת

---

### **4. העברת `routes.json`**

**מיקום נוכחי:** `_COMMUNICATION/90_Architects_comunication/routes.json`  
**מיקום יעד:** `ui/public/routes.json`

**תוכן הקובץ:**
```json
{
  "version": "1.1.0",
  "frontend": 8080,
  "backend": 8082,
  "routes": {
    "auth": {
      "login": "/login.html",
      "register": "/register.html"
    },
    "financial": {
      "accounts": "/trading_accounts.html"
    }
  }
}
```

**פעולות:**
1. להעתיק את `routes.json` ל-`ui/public/routes.json`
2. לעדכן את המבנה לפי הצורך (להוסיף routes נוספים)
3. לבדוק שהקובץ נגיש ב-runtime דרך `/routes.json`

**בדיקות:**
- [ ] הקובץ נגיש ב-`http://localhost:8080/routes.json`
- [ ] `auth-guard.js` יכול לטעון אותו דרך Fetch

---

## 🔍 בדיקות נדרשות

### **לאחר כל החלפה:**

- [ ] הקובץ נטען נכון
- [ ] אין שגיאות JavaScript
- [ ] כל הפונקציונליות עובדת
- [ ] אין regressions

---

## 📚 מסמכים קשורים

- `ARCHITECT_PORT_LOCK.md` - פקודת האדריכל (קבצי FIX)
- `TEAM_10_ARCHITECT_MANDATE_UPDATED_PLAN.md` - תוכנית עבודה מעודכנת

---

## ⏱️ זמן משוער

**3 שעות**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🟢 **MEDIUM PRIORITY - P2**

**log_entry | [Team 10] | FIX_FILES | DETAILED_INSTRUCTIONS | GREEN | 2026-02-04**
