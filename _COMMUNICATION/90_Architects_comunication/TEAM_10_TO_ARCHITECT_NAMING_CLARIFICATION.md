# 📡 הודעה לאדריכל: הבהרה על מינוח נתונים

**מאת:** Team 10 (The Gateway)  
**אל:** Chief Architect  
**תאריך:** 2026-02-04  
**סטטוס:** ✅ **CLARIFICATION PROVIDED**

---

## 📢 Executive Summary

לפי הבהרה מהמנהל, **מינוח נתונים הוא רבים תמיד** (`user_ids`, `trading_account_ids`), ולא יחיד כפי שצוין בפקודת האדריכל המאוחדת.

**דרישה:** לעדכן את פקודת האדריכל בהתאם.

---

## ⚠️ סתירה שזוהתה

### **פקודת האדריכל המקורית:**
- שמות שדות ב-API ובישויות יהיו תמיד ביחיד (`user_id`, `trading_account_id`)
- שימוש ברבים מותר רק למערכים

### **הבהרה מהמנהל:**
- **רבים תמיד** (`user_ids`, `trading_account_ids`)

---

## ✅ מצב נוכחי - מאומת

### **תיעוד קיים:**
- ✅ `.cursorrules` - מציין "Plural names only" ✅ נכון
- ✅ `WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS.md` - מציין "Plural Standard (G-10)" ✅ נכון
- ✅ שדות בתיעוד: `internal_ids`, `external_ulids`, `owner_user_ids`, `display_names`, `is_active_statuses` ✅ נכון

### **מסקנה:**
התיעוד הקיים נכון - מינוח רבים תמיד.

---

## 📋 דרישה לעדכון

### **קבצים לעדכון:**

1. **`ARCHITECT_MANDATE_SINGULAR_NAMING.md`** ⚠️ **דורש עדכון**
   - הקובץ מציין יחיד - צריך לעדכן לרבים

2. **`ARCHITECT_PORT_LOCK.md`** (אם קיים) ⚠️ **דורש עדכון**
   - אם מציין יחיד - צריך לעדכן לרבים

---

## ✅ פעולות שבוצעו

1. ✅ זיהוי הסתירה
2. ✅ הבהרה מהמנהל - רבים תמיד
3. ✅ עדכון כל המסמכים בהתאם
4. ✅ ביטול כל המשימות הקשורות ל-Refactor מינוח

---

## 📚 מסמכים קשורים

- `ARCHITECT_MANDATE_SINGULAR_NAMING.md` - קובץ שדורש עדכון
- `.cursorrules` - כלל Plural names (נכון)
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS.md` - Field Map (נכון)

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** ✅ **CLARIFICATION PROVIDED**

**log_entry | [Team 10] | NAMING_CLARIFICATION | TO_ARCHITECT | GREEN | 2026-02-04**
