# 🎯 תוכנית עבודה מעודכנת: יישום פקודת האדריכל המאוחדת

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-04  
**סטטוס:** ✅ **UPDATED - FILES FOUND - NAMING CLARIFIED**

---

## 📢 Executive Summary

תוכנית עבודה מעודכנת לאחר:
1. ✅ איתור כל קבצי FIX מהאדריכל
2. ✅ הבהרה: מינוח נתונים הוא **רבים תמיד** (לא יחיד)
3. ✅ עדכון כל המסמכים בהתאם

---

## ✅ קבצי FIX שנמצאו

### **מיקום:** `_COMMUNICATION/90_Architects_comunication/`

1. ✅ **`FIX_PhoenixFilterContext.jsx`** - Gold Standard v1.1
   - כולל Window Event Listener ל-Bridge
   - מחובר ל-`phoenix-filter-change` event

2. ✅ **`FIX_transformers.js`** - Hardened v1.2
   - המרת מספרים כפויה לשדות כספיים
   - ערכי ברירת מחדל

3. ✅ **`routes.json`** - SSOT Paths v1.1.0
   - מכיל routes ל-auth ו-financial
   - מוכן לשימוש

4. ✅ **`auth-guard.js`** - Hardened v1.2 (ב-`_COMMUNICATION/team_10/`)
   - Debug-only masking
   - Token censoring
   - Runtime route fetching

### **מסמכי מדיניות:**

5. ✅ **`ARCHITECT_POLICY_HYBRID_SCRIPTS.md`** - מדיניות סקריפטים
6. ✅ **`ARCHITECT_MANDATE_SINGULAR_NAMING.md`** - ⚠️ דורש עדכון (לרבים)
7. ✅ **`ARCHITECT_PORT_LOCK_FINAL.md`** - נעילת פורטים סופית

---

## ✅ עדכון: מינוח נתונים

### **הבהרה מהמנהל:**
- **מינוח נתונים הוא רבים תמיד** (`user_ids`, `trading_account_ids`)
- לא יחיד כפי שצוין בפקודת האדריכל

### **פעולות:**
- ✅ ביטול כל המשימות הקשורות ל-Refactor מינוח
- ✅ עדכון המסמכים - מינוח רבים תמיד
- ✅ הודעה לאדריכל לעדכן את `ARCHITECT_MANDATE_SINGULAR_NAMING.md`

---

## 🔴 P0 - חוסם אינטגרציה

### **1. נעילת פורטים** 🔴 **CRITICAL**

**משימות:**
- ✅ Team 60: עדכון CORS ב-FastAPI (1-2 שעות)
- ✅ Team 30: עדכון `auth.js` ו-`apiKeys.js` להשתמש ב-proxy (30 דקות - 1 שעה)
- ✅ Team 10: עדכון `PHOENIX_MASTER_BIBLE.md` - מדיניות סקריפטים (1 שעה)

**סה"כ:** 2.5-4 שעות

---

### **2. עדכון מדיניות סקריפטים** 🔴 **CRITICAL**

**משימות:**
- ✅ Team 10: עדכון `PHOENIX_MASTER_BIBLE.md` (1 שעה)
- ✅ Team 10: יצירת `ARCHITECT_POLICY_HYBRID_SCRIPTS.md` (קיים - להעתיק) (30 דקות)

**סה"כ:** 1.5 שעות

---

## 🟡 P1 - יציבות ארכיטקטונית

### **3. ניהול נתיבים (Routes SSOT)** 🟡 **HIGH**

**קבצים זמינים:**
- ✅ `routes.json` קיים ב-`_COMMUNICATION/90_Architects_comunication/`

**משימות:**
- ✅ Team 30: העברת `routes.json` ל-`ui/public/` (30 דקות)
- ✅ Team 30: עדכון `auth-guard.js` (2 שעות)
- ✅ Team 30: עדכון `vite.config.js` (1 שעה)

**סה"כ:** 3.5 שעות

---

### **4. מינוח נתונים** ✅ **CANCELLED**

**משימות:**
- ✅ **בוטל** - מינוח רבים תמיד (לא צריך Refactor)

---

### **5. אבטחה וניטור (Masked Log)** 🟡 **HIGH**

**קבצים זמינים:**
- ✅ `auth-guard.js` קיים ב-`_COMMUNICATION/team_10/` (Hardened v1.2)

**משימות:**
- ✅ Team 30: החלפת `auth-guard.js` בגרסת FIX (1 שעה)
- ✅ Team 30: עדכון `navigationHandler.js` (30 דקות)

**סה"כ:** 1.5 שעות

---

### **6. מקור אמת למצב (State SSOT)** 🟡 **HIGH**

**משימות:**
- ✅ Team 30: חיפוש שימוש ב-Zustand (30 דקות)
- ✅ Team 30: הסרת Zustand (אם נמצא) (2-3 שעות)
- ✅ Team 30: וידוא Bridge Integration (1 שעה)

**סה"כ:** 2-4 שעות

---

## 🟢 P2 - ניקוי וניטור

### **7. החלפת קבצי FIX** 🟢 **MEDIUM**

**קבצים זמינים:**
- ✅ `FIX_PhoenixFilterContext.jsx` - קיים
- ✅ `FIX_transformers.js` - קיים
- ✅ `auth-guard.js` - קיים

**משימות:**
- ✅ Team 30: החלפת `PhoenixFilterContext.jsx` (1 שעה)
- ✅ Team 30: החלפת `transformers.js` (1 שעה)
- ✅ Team 30: החלפת `auth-guard.js` (1 שעה)

**סה"כ:** 3 שעות

---

### **8. ניקוי D16** 🟢 **MEDIUM**

**משימות:**
- ✅ Team 30: עדכון הערות ולוגים (1-2 שעות) - כבר זוהה בדוח קודם

**סה"כ:** 1-2 שעות

---

### **9. עדכון תיעוד** 🟢 **MEDIUM**

**משימות:**
- ✅ Team 10: עדכון `D15_SYSTEM_INDEX.md` (30 דקות)
- ✅ Team 10: עדכון `ui/infrastructure/README.md` (30 דקות)
- ✅ Team 10: עדכון מסמכי ארכיטקטורה (1 שעה)
- ✅ Team 10: העתקת `ARCHITECT_POLICY_HYBRID_SCRIPTS.md` ל-documentation (30 דקות)

**סה"כ:** 2.5 שעות

---

## 📊 סיכום זמן משוער מעודכן

| עדיפות | משימות | זמן משוער |
|:-------|:-------|:----------|
| **P0** | נעילת פורטים + מדיניות סקריפטים | 4-5.5 שעות |
| **P1** | Routes SSOT + אבטחה + State SSOT | 7-9 שעות |
| **P2** | קבצי FIX + ניקוי D16 + תיעוד | 6.5-7.5 שעות |
| **סה"כ** | | **17.5-22 שעות** |

**הערה:** בוטל מינוח נתונים (4-6 שעות) - לא נדרש.

---

## ✅ צעדים הבאים

### **מיידי (P0):**
1. ⏳ **Team 60:** עדכון CORS ב-FastAPI
2. ⏳ **Team 30:** עדכון `auth.js` ו-`apiKeys.js` להשתמש ב-proxy
3. ⏳ **Team 10:** עדכון `PHOENIX_MASTER_BIBLE.md` + העתקת `ARCHITECT_POLICY_HYBRID_SCRIPTS.md`

### **לאחר P0 (P1):**
4. ⏳ **Team 30:** יישום Routes SSOT (העברת `routes.json` + עדכון `auth-guard.js` + `vite.config.js`)
5. ⏳ **Team 30:** אבטחה וניטור (החלפת `auth-guard.js` בגרסת FIX)
6. ⏳ **Team 30:** בדיקת והסרת Zustand

### **לאחר P1 (P2):**
7. ⏳ **Team 30:** החלפת קבצי FIX (`PhoenixFilterContext.jsx`, `transformers.js`)
8. ⏳ **Team 30:** ניקוי D16
9. ⏳ **Team 10:** עדכון תיעוד

---

## 📚 מסמכים קשורים

### **קבצי FIX:**
- `_COMMUNICATION/90_Architects_comunication/FIX_PhoenixFilterContext.jsx`
- `_COMMUNICATION/90_Architects_comunication/FIX_transformers.js`
- `_COMMUNICATION/team_10/auth-guard.js`
- `_COMMUNICATION/90_Architects_comunication/routes.json`

### **מסמכי מדיניות:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_POLICY_HYBRID_SCRIPTS.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_MANDATE_SINGULAR_NAMING.md` (דורש עדכון)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PORT_LOCK_FINAL.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** ✅ **UPDATED - READY FOR IMPLEMENTATION**

**log_entry | [Team 10] | ARCHITECT_MANDATE | UPDATED_PLAN | GREEN | 2026-02-04**
