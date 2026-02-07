# ⚠️ הודעה: פערים ב-PDSC Spec - נדרש השלמה

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend Implementation)  
**תאריך:** 2026-02-06  
**סטטוס:** ⚠️ **SPEC GAPS IDENTIFIED**  
**עדיפות:** 🔴 **HIGH**

---

## ✅ Executive Summary

**תודה על הגשת PDSC Error Contract Specification!**

לאחר בדיקה מול מנדט האדריכלית, זוהו פערים ב-Spec שצריך להשלים:

**מה קיים:**
- ✅ Error Contract Specification
- ✅ Error Response Schema
- ✅ Error Codes
- ✅ PDSC Service Layer (ארכיטקטורה)

**מה חסר:**
- ❌ **Fetching (API calls)** - לא מתועד
- ❌ **Hardened Transformers Integration** - לא מתועד במפורט
- ❌ **Routes SSOT Integration** - לא מתועד במפורט

---

## ⚠️ פערים שזוהו

### **1. Fetching (API Calls) - חסר**

**דרישות לפי מנדט האדריכלית:**
> "Phoenix Data Service Core (PDSC): ניהול Fetching, Error Codes, ו-Hardened Transformers"

**מה חסר ב-Spec:**
- ❌ איך PDSC מבצע API calls?
- ❌ איך PDSC משתמש ב-`routes.json` (SSOT)?
- ❌ איך PDSC מטפל ב-Authorization headers?
- ❌ איך PDSC מטפל ב-Request/Response?
- ❌ איך PDSC מטפל ב-Query Parameters?
- ❌ איך PDSC מטפל ב-Request Body?

**המלצה:** יש להוסיף סעיף מפורט "Fetching (API Calls)" עם:
- שימוש ב-`routes.json` (SSOT) לבניית URLs
- Authorization headers management
- Request/Response handling
- Query parameters construction
- Request body serialization

---

### **2. Hardened Transformers Integration - חסר**

**דרישות לפי מנדט האדריכלית:**
> "Phoenix Data Service Core (PDSC): ניהול Fetching, Error Codes, ו-**Hardened Transformers**"

**מה חסר ב-Spec:**
- ❌ איך PDSC משתמש ב-`transformers.js` v1.2?
- ❌ איך PDSC מבצע המרת נתונים (snake_case ↔ camelCase)?
- ❌ איך PDSC מבצע המרת מספרים כפויה?
- ❌ מתי מתבצעת ההמרה (Request/Response)?
- ❌ איך PDSC מטפל בשגיאות המרה?

**המלצה:** יש להוסיף סעיף מפורט "Hardened Transformers Integration" עם:
- שימוש ב-`transformers.js` v1.2
- המרת Request (camelCase → snake_case)
- המרת Response (snake_case → camelCase)
- המרת מספרים כפויה
- טיפול בשגיאות המרה

---

### **3. Routes SSOT Integration - לא מפורט**

**דרישות לפי מנדט האדריכלית:**
> "ניהול Routes SSOT (`routes.json` v1.1.2)"

**מה קיים ב-Spec:**
- ✅ אזכור ל-`routes.json` בכמה מקומות

**מה חסר:**
- ❌ איך PDSC טוען את `routes.json`?
- ❌ איך PDSC בונה URLs מ-`routes.json`?
- ❌ איך PDSC מטפל בגרסאות `routes.json`?
- ❌ איך PDSC מטפל בשגיאות טעינת `routes.json`?

**המלצה:** יש להרחיב את הסעיף על Routes SSOT עם:
- טעינת `routes.json` (SSOT)
- בניית URLs מ-`routes.json`
- גרסה verification
- Fallback mechanisms

---

## 📋 משימות להשלמה

### **1. הוספת סעיף "Fetching (API Calls)"**

**מיקום:** אחרי "Error Response Schema", לפני "ארכיטקטורה מוצעת"

**תוכן נדרש:**
- [ ] שימוש ב-`routes.json` (SSOT) לבניית URLs
- [ ] Authorization headers management
- [ ] Request/Response handling
- [ ] Query parameters construction
- [ ] Request body serialization
- [ ] דוגמאות קוד

---

### **2. הוספת סעיף "Hardened Transformers Integration"**

**מיקום:** אחרי "Fetching (API Calls)", לפני "Error Handling"

**תוכן נדרש:**
- [ ] שימוש ב-`transformers.js` v1.2
- [ ] המרת Request (camelCase → snake_case)
- [ ] המרת Response (snake_case → camelCase)
- [ ] המרת מספרים כפויה
- [ ] טיפול בשגיאות המרה
- [ ] דוגמאות קוד

---

### **3. הרחבת סעיף "Routes SSOT Integration"**

**מיקום:** בתוך "Fetching (API Calls)" או כסעיף נפרד

**תוכן נדרש:**
- [ ] טעינת `routes.json` (SSOT)
- [ ] בניית URLs מ-`routes.json`
- [ ] גרסה verification (v1.1.2)
- [ ] Fallback mechanisms
- [ ] דוגמאות קוד

---

## 📞 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`

### **Spec קיים:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md`

### **קבצים קשורים:**
- `ui/src/cubes/shared/utils/transformers.js` (Transformers)
- `routes.json` (Routes SSOT)

---

## ✅ Checklist להשלמה

- [ ] הוספת סעיף "Fetching (API Calls)"
- [ ] הוספת סעיף "Hardened Transformers Integration"
- [ ] הרחבת סעיף "Routes SSOT Integration"
- [ ] עדכון "API / Interface" עם Fetching methods
- [ ] עדכון "Examples" עם דוגמאות Fetching
- [ ] עדכון גרסה ל-v1.1

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** ⚠️ **SPEC GAPS IDENTIFIED - COMPLETION REQUIRED**

**log_entry | [Team 10] | TEAM_20 | PDSC_SPEC_GAPS | YELLOW | 2026-02-06**
