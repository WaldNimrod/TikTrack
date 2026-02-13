# ⚠️ הודעה: Specs חסרים - EFR ו-GED

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Implementation)  
**תאריך:** 2026-02-06  
**סטטוס:** ⚠️ **SPECS MISSING**  
**עדיפות:** 🔴 **HIGH**

---

## ✅ Executive Summary

**תודה על הגשת UAI Architectural Design! המסמך מפורט ומקיף.**

לאחר בדיקה מול מנדט האדריכלית, זוהו שני Specs חסרים:

**מה קיים:**
- ✅ UAI (Unified App Init) - **הוגש** ✅

**מה חסר:**
- ❌ **EFR (Entity Field Renderer)** - לא הוגש
- ❌ **GED (Global Event Delegation)** - לא הוגש

---

## ⚠️ Specs חסרים

### **1. EFR (Entity Field Renderer) - חסר**

**דרישות לפי מנדט האדריכלית:**
> "Entity Field Renderer (EFR): מנוע רינדור אחיד לטבלאות (סכומים, תאריכים, באדג'ים)"

**תפקיד:**
- רינדור אחיד של שדות בטבלאות
- פורמט סכומים (מטבע, +/-)
- פורמט תאריכים (DD/MM/YYYY)
- רינדור באדג'ים (Badges) צבעוניים

**קבצים קשורים:**
- `Shared_Services.js` (PDSC + EFR)
- `ui/src/cubes/shared/tableFormatters.js` (קיים - להתייחסות)

**דרישות ל-Spec:**
- [ ] תיאור כללי של EFR
- [ ] מנוע רינדור אחיד לטבלאות
- [ ] פורמט סכומים (מטבע, +/-)
- [ ] פורמט תאריכים (DD/MM/YYYY)
- [ ] רינדור באדג'ים (Badges) צבעוניים
- [ ] אינטגרציה עם `tableFormatters.js` הקיים
- [ ] API / Interface
- [ ] דוגמאות קוד
- [ ] Dependencies

**קובץ Spec נדרש:** `_COMMUNICATION/team_30/TEAM_30_EFR_SPEC.md`

---

### **2. GED (Global Event Delegation) - חסר**

**דרישות לפי מנדט האדריכלית:**
> "Global Event Delegation (GED): ניהול אירועים מרכזי למניעת דליפות זיכרון"

**תפקיד:**
- ניהול Event Listeners מרכזי
- מניעת דליפות זיכרון
- ניהול cleanup אוטומטי

**קבצים קשורים:**
- `Phoenix_Platform_Core.js` (UAI + GED)

**הערה:** UAI Spec מזכיר Event System, אבל לא מפורט כ-GED נפרד.

**דרישות ל-Spec:**
- [ ] תיאור כללי של GED
- [ ] ניהול Event Listeners מרכזי
- [ ] מניעת דליפות זיכרון
- [ ] ניהול cleanup אוטומטי
- [ ] אינטגרציה עם UAI
- [ ] API / Interface
- [ ] דוגמאות קוד
- [ ] Dependencies

**קובץ Spec נדרש:** `_COMMUNICATION/team_30/TEAM_30_GED_SPEC.md`

---

## 📋 משימות לביצוע

### **1. יצירת EFR Spec**

**קובץ:** `_COMMUNICATION/team_30/TEAM_30_EFR_SPEC.md`

**תבנית:** השתמש ב-`_COMMUNICATION/team_10/TEAM_10_SPEC_TEMPLATE.md`

**תוכן נדרש:**
- [ ] Executive Summary
- [ ] Purpose & Goals
- [ ] Architecture
- [ ] API / Interface (render methods)
- [ ] Workflow / Lifecycle
- [ ] Error Handling
- [ ] Examples (סכומים, תאריכים, באדג'ים)
- [ ] Dependencies (`tableFormatters.js`, `phoenix-components.css`)
- [ ] Checklist

**תאריך יעד:** 2026-02-08

---

### **2. יצירת GED Spec**

**קובץ:** `_COMMUNICATION/team_30/TEAM_30_GED_SPEC.md`

**תבנית:** השתמש ב-`_COMMUNICATION/team_10/TEAM_10_SPEC_TEMPLATE.md`

**תוכן נדרש:**
- [ ] Executive Summary
- [ ] Purpose & Goals
- [ ] Architecture
- [ ] API / Interface (event delegation methods)
- [ ] Workflow / Lifecycle
- [ ] Error Handling
- [ ] Examples (event delegation, cleanup)
- [ ] Dependencies (UAI, DOM APIs)
- [ ] Checklist

**תאריך יעד:** 2026-02-08

---

## 🔗 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`

### **תבנית Spec:**
- `_COMMUNICATION/team_10/TEAM_10_SPEC_TEMPLATE.md`

### **Specs קיימים:**
- `_COMMUNICATION/team_30/UAI_Architectural_Design.md` (להתייחסות)

### **קבצים קשורים:**
- `ui/src/cubes/shared/tableFormatters.js` (EFR - להתייחסות)
- `ui/src/components/core/phoenixFilterBridge.js` (GED - להתייחסות)

---

## ✅ Checklist סופי

### **EFR Spec:**
- [ ] יצירת `TEAM_30_EFR_SPEC.md`
- [ ] מילוי כל הסעיפים בתבנית
- [ ] התייחסות ל-`tableFormatters.js` הקיים
- [ ] דוגמאות קוד מפורטות
- [ ] הגשה תחת `_COMMUNICATION/team_30/`

### **GED Spec:**
- [ ] יצירת `TEAM_30_GED_SPEC.md`
- [ ] מילוי כל הסעיפים בתבנית
- [ ] תיאום עם UAI Event System
- [ ] דוגמאות קוד מפורטות
- [ ] הגשה תחת `_COMMUNICATION/team_30/`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** ⚠️ **SPECS MISSING - COMPLETION REQUIRED**

**log_entry | [Team 10] | TEAM_30 | EFR_GED_SPECS_MISSING | YELLOW | 2026-02-06**
