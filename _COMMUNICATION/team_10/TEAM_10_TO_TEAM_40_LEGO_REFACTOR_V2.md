# 📡 הודעה: Team 10 → Team 40 (UI Assets) | תוכנית LEGO Refactor V2

**From:** Team 10 (The Gateway)  
**To:** Team 40 (UI Assets & Design)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** LEGO_REFACTOR_PLAN_V2 | Status: 🟢 **ACTIVE**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 📋 Executive Summary

התוכנית לבנייה מחדש עודכנה בהתאם לארכיטקטורת LEGO מודולרית. תפקידכם עודכן - אתם אחראים על תיקון היררכיית CSS ועבודה עם Team 30 על יצירת Cube Components Library.

---

## 🎯 תפקידכם המעודכן

### **אחריות מרכזית:**
1. **תיקון היררכיית CSS** (שלב 2) - ⏳ **IN PROGRESS**
2. **עבודה עם Team 30 על Cube Components Library** (שלב 2.5) - ⏸️ **PENDING**
3. **ולידציה ויזואלית** של Components משותפים

---

## 📊 משימות מיידיות

### **שלב 2.4: תיקון היררכיה וחלוקה** ⏳ **IN PROGRESS**

**סטטוס:** ✅ Audit Complete, ✅ Approved, ⏳ In Progress

**משימות:**
- [ ] **2.4.1** איחוד CSS Variables ל-`phoenix-base.css`
  - מיזוג כל ה-CSS Variables מ-`design-tokens.css`
  - מיזוג כל ה-CSS Variables מ-`global_page_template.jsx` (inline)
  - וידוא Single Source of Truth

- [ ] **2.4.2** הסרת קבצים כפולים
  - הסרת `ui/styles/design-tokens.css`
  - הסרת `ui/styles/auth.css`

- [ ] **2.4.3** הסרת inline CSS מ-JSX
  - הסרת `<style>` tag מ-`global_page_template.jsx`
  - העברת כל ה-CSS Variables ל-`phoenix-base.css`

- [ ] **2.4.4** תיקון מיקום קבצים
  - העברת כל הקבצים מ-`ui/styles/` ל-`ui/src/styles/` (אם יש)
  - הסרת `ui/styles/` directory אם ריק

- [ ] **2.4.5** וידוא ITCSS compliance
  - וידוא שכל קובץ עומד ב-ITCSS hierarchy
  - הוספת הערות ITCSS layer במידת הצורך

**קבצים לטיפול:**
- `ui/src/styles/phoenix-base.css` (למזג CSS Variables)
- `ui/styles/design-tokens.css` (להסיר)
- `ui/styles/auth.css` (להסיר)
- `ui/src/layout/global_page_template.jsx` (להסיר inline CSS)

---

### **שלב 2.5: יצירת Cube Components Library** ⏸️ **PENDING** (לאחר השלמת שלב 2)

**מטרה:** עבודה עם Team 30 על זיהוי ויצירת Components משותפים ברמת קוביה.

**תפקידכם:**
- [ ] עבודה עם Team 30 על זיהוי Components משותפים
- [ ] ולידציה ויזואלית של Components משותפים
- [ ] בדיקת עמידה ב-CSS Standards Protocol
- [ ] בדיקת עמידה ב-LEGO System
- [ ] תיעוד CSS Classes של Components משותפים

**Components לזיהוי:**

**Identity & Authentication Cube (D15):**
- AuthForm
- AuthValidation
- AuthErrorHandler
- AuthLayout

**Financial Cube (D16, D18, D21):**
- FinancialTable
- FinancialFilters
- FinancialSummary
- FinancialCard

---

### **שלב 2.6: עדכון CSS_CLASSES_INDEX.md** ⏸️ **PENDING**

**משימות:**
- [ ] תיעוד כל ה-CSS Classes של Components משותפים
- [ ] הוספת ITCSS layer information
- [ ] הוספת מידע על קוביות מודולריות
- [ ] הסרת duplicates מהאינדקס

---

## 🎨 עקרונות CSS חשובים

### **ITCSS Hierarchy:**
1. **Settings** - CSS Variables (`phoenix-base.css`)
2. **Tools** - Mixins, Functions (אם יש)
3. **Generic** - Reset, Normalize (`phoenix-base.css`)
4. **Elements** - Base HTML elements (`phoenix-base.css`)
5. **Objects** - LEGO Components (`phoenix-components.css`)
6. **Components** - Complex UI components (`phoenix-header.css`, Cube-specific CSS)
7. **Trumps** - Utilities, Overrides (Page-specific CSS)

### **CSS Standards Protocol:**
- BEM naming convention
- Logical Properties בלבד
- CSS Variables בלבד לצבעים
- Spacing multiples של 8px
- No magic numbers

---

## ✅ Checklist

### **שלב 2.4: תיקון היררכיה**
- [x] Audit Complete ✅
- [x] אישור תיקונים ✅
- [ ] איחוד CSS Variables ל-`phoenix-base.css`
- [ ] הסרת `design-tokens.css`
- [ ] הסרת `auth.css`
- [ ] הסרת inline CSS מ-`global_page_template.jsx`
- [ ] תיקון מיקום קבצים
- [ ] וידוא ITCSS compliance

### **שלב 2.5: Cube Components Library** (לאחר שלב 2)
- [ ] עבודה עם Team 30 על זיהוי Components משותפים
- [ ] ולידציה ויזואלית של Components
- [ ] בדיקת עמידה ב-CSS Standards Protocol
- [ ] תיעוד CSS Classes

### **שלב 2.6: עדכון CSS_CLASSES_INDEX.md**
- [ ] תיעוד Components משותפים
- [ ] הוספת ITCSS layer information
- [ ] הוספת מידע על קוביות מודולריות

---

## 🔗 קישורים רלוונטיים

### **תוכנית מלאה:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית מעודכנת מלאה

### **תיעוד CSS:**
- `_COMMUNICATION/team_40/TEAM_40_TO_TEAM_10_CSS_AUDIT_FINDINGS.md` - ממצאי Audit שלכם
- `documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_CSS_HIERARCHY_AUDIT.md` - דוח Audit מלא
- `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md` - CSS Standards Protocol
- `documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md` - CSS Classes Index

---

## 🎯 הצעדים הבאים

1. **מיידי:** המשך עבודה על שלב 2.4 (תיקון היררכיית CSS)
2. **לאחר השלמה:** התחלת עבודה על שלב 2.5 (Cube Components Library) עם Team 30
3. **לאחר השלמה:** עדכון `CSS_CLASSES_INDEX.md`

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🟢 **ACTIVE - AWAITING YOUR PROGRESS**

**log_entry | Team 10 | LEGO_REFACTOR_V2 | TO_TEAM_40 | 2026-02-01**
