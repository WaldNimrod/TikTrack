# 🔧 הודעה: החלפת קבצים בגרסאות FIX (P2)

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

---

## 📋 משימות

### **1. החלפת `PhoenixFilterContext.jsx`**
- **מיקום:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`
- **קובץ FIX:** `_COMMUNICATION/90_Architects_comunication/FIX_PhoenixFilterContext.jsx`
- **שינויים:** הוספת Listener ל-`phoenix-filter-change` event

### **2. החלפת `transformers.js`**
- **מיקום:** `ui/src/cubes/shared/utils/transformers.js`
- **קובץ FIX:** `_COMMUNICATION/90_Architects_comunication/FIX_transformers.js`
- **שינויים:** המרת מספרים כפויה לשדות כספיים (`balance`, `price`, `amount`)

---

## 📚 קובץ מפורט

**לפרטים מלאים:** `TEAM_10_TO_TEAM_30_FIX_FILES_DETAILED.md`

---

## ⏱️ זמן משוער

**3 שעות**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🟢 **MEDIUM PRIORITY - P2**
