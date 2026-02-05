# 🔧 הודעה: החלפת קבצים בגרסאות FIX

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-04  
**סטטוס:** 🟢 **MEDIUM PRIORITY - P2**  
**מקור:** פקודת האדריכל המאוחדת

---

## 📢 Executive Summary

לפי פקודת האדריכל, יש להחליף קבצים מסוימים בגרסאות FIX שסופקו על ידי האדריכל.

**קבצים שצריך להחליף:**
1. `PhoenixFilterContext.jsx` - גרסה עם Listener לאירועי Bridge
2. `transformers.js` - גרסה מוקשחת עם המרת מספרים כפויה
3. `auth-guard.js` - גרסה מאובטחת עם Masking (קיים ב-`_COMMUNICATION/team_10/`)

---

## ✅ קבצים נמצאו

**הקבצים נמצאו ב-`_COMMUNICATION/90_Architects_comunication/`** ✅

---

## 📋 משימות

### **1. קבצי FIX שנמצאו** ✅

**מיקום:** `_COMMUNICATION/90_Architects_comunication/`

**קבצים זמינים:**
- ✅ `FIX_PhoenixFilterContext.jsx` - Gold Standard v1.1
- ✅ `FIX_transformers.js` - Hardened v1.2
- ✅ `auth-guard.js` - Hardened v1.2 (ב-`_COMMUNICATION/team_10/`)

---

### **2. החלפת `PhoenixFilterContext.jsx`**

**מיקום נוכחי:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`

**שינויים צפויים:**
- הוספת Listener לאירועי Bridge (`window.PhoenixBridge`)
- עדכון State בהתאם לאירועי Bridge

**פעולות:**
1. לגבות את הקובץ הנוכחי
2. להחליף בגרסת FIX
3. לבדוק שהכל עובד

---

### **3. החלפת `transformers.js`**

**מיקום נוכחי:** `ui/src/cubes/shared/utils/transformers.js`

**שינויים צפויים:**
- המרת מספרים כפויה לשדות כספיים
- ערכי ברירת מחדל

**פעולות:**
1. לגבות את הקובץ הנוכחי
2. להחליף בגרסת FIX
3. לבדוק שהכל עובד

---

### **4. החלפת `auth-guard.js`**

**מיקום נוכחי:** `ui/src/components/core/authGuard.js`  
**קובץ FIX:** `_COMMUNICATION/team_10/auth-guard.js` ✅ קיים

**שינויים צפויים:**
- Masking לטוקנים
- טעינת routes מ-`routes.json`

**פעולות:**
1. לקרוא את הקובץ FIX
2. להשוות עם הקובץ הנוכחי
3. להחליף או למזג את השינויים

---

## 🔍 בדיקות נדרשות

### **לאחר התיקונים:**

- [ ] `PhoenixFilterContext.jsx` מחובר ל-Bridge
- [ ] `transformers.js` ממיר מספרים נכון
- [ ] `auth-guard.js` משתמש ב-maskedLog
- [ ] `auth-guard.js` טוען routes מ-`routes.json`
- [ ] כל הפונקציונליות עובדת נכון

---

## 📚 מסמכים קשורים

- `ARCHITECT_PORT_LOCK.md` - פקודת האדריכל (קבצי FIX)
- `_COMMUNICATION/team_10/auth-guard.js` - קובץ FIX קיים

---

## ⏱️ זמן משוער

**3 שעות** (כל הקבצים נמצאו ✅)

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🟢 **MEDIUM PRIORITY - P2**

**log_entry | [Team 10] | FIX_FILES | TO_TEAM_30 | GREEN | 2026-02-04**
