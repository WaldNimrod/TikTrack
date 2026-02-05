# 📡 הודעה: Team 10 → Team 30 & Team 40 | הפעלת שלב 2.5

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend), Team 40 (UI Assets & Design)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** STAGE_2.5_ACTIVATION | Status: 🟢 **READY TO START**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 📋 Executive Summary

**שלב 2 הושלם במלואו** ✅  
**שלב 2.5 מוכן להתחיל** 🟢

**צוותים:** Team 30 (מוביל) + Team 40 (ולידציה ויזואלית)

---

## ✅ סטטוס נוכחי

### **שלב 2: היררכיית CSS** ✅ **COMPLETE**
- ✅ Task 2.1: CSS Audit
- ✅ Task 2.2: CSS Hierarchy Analysis
- ✅ Task 2.3: CSS Refactoring (SSOT established)
- ✅ Task 2.4: CSS_CLASSES_INDEX.md Update (v1.1)

### **יישום החלטות אדריכליות** ✅ **COMPLETE**
- ✅ מבנה תיקיות נוצר (`components/core/`, `cubes/shared/`, `cubes/identity/`, `cubes/financial/`)
- ✅ Components קיימים הועברו (13 קבצים)
- ✅ כל ה-imports עודכנו (17 קבצים)
- ✅ אין inline scripts - הכל תקין

---

## 🎯 שלב 2.5: Cube Components Library - מוכן להתחיל

### **תנאים:**
- ✅ שלב 2 הושלם (CSS)
- ✅ מבנה תיקיות נוצר (LEGO Cubes)
- ✅ Components קיימים הועברו

**סטטוס:** 🟢 **READY TO START**

---

## 📋 משימות לפי צוות

### **Team 30 (Frontend) - מוביל** 🔴 **P0**

#### **2.5.1 זיהוי Components משותפים** 🟢 **START HERE**

**Identity & Authentication Cube (D15):**
- [ ] **AuthForm** - טופס משותף (Login, Register, Reset Password)
  - Props גמישים לכל סוג טופס
  - שימוש ב-PhoenixSchema לולידציה
  - טיפול בשגיאות משותף
- [ ] **AuthValidation** - ולידציה משותפת
  - שימוש ב-PhoenixSchema
  - הודעות שגיאה מתורגמות
- [ ] **AuthErrorHandler** - טיפול בשגיאות משותף
  - הצגת שגיאות ברכיבי LEGO
  - Audit Trail
- [ ] **AuthLayout** - Layout משותף לעמודי Auth
  - מבנה HTML/JSX משותף
  - שימוש ב-LEGO System (`tt-container` > `tt-section`)

**Financial Cube (D16, D18, D21):**
- [ ] **FinancialTable** - טבלה משותפת
  - שימוש ב-`PhoenixTable` component (כבר קיים ב-`cubes/shared/components/tables/`)
  - Props גמישים לכל סוג טבלה
- [ ] **FinancialFilters** - פילטרים משותפים
  - שימוש ב-`PhoenixFilterContext` (כבר קיים ב-`cubes/shared/contexts/`)
- [ ] **FinancialSummary** - סיכומים משותפים
  - Cards משותפים
  - Layout משותף
- [ ] **FinancialCard** - כרטיסי סיכום משותפים
  - Design משותף
  - Props גמישים

#### **2.5.2 יצירת Components**

**מיקום:**
- Identity Components → `ui/src/cubes/identity/components/`
- Financial Components → `ui/src/cubes/financial/components/`

**דרישות:**
- ✅ שימוש ב-LEGO System (`tt-container`, `tt-section`, `tt-section-row`)
- ✅ שימוש ב-CSS Classes מ-`CSS_CLASSES_INDEX.md`
- ✅ עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`
- ✅ JSDoc documentation עם `@legacyReference`
- ✅ JS Selectors עם `js-` prefix
- ✅ Audit Trail System
- ✅ Transformation Layer (`snake_case` ↔ `camelCase`)

#### **2.5.3 תיעוד Components**

- [ ] יצירת `CUBE_COMPONENTS_INDEX.md` לכל קוביה
- [ ] תיעוד Props, Usage, Examples
- [ ] תיעוד State Management משותף

---

### **Team 40 (UI Assets & Design) - ולידציה ויזואלית** 🟡 **P1**

#### **ולידציה ויזואלית של Components**

**לאחר ש-Team 30 יוצר Components:**

- [ ] בדיקת fidelity מול Design Tokens (`phoenix-base.css`)
- [ ] בדיקת עמידה ב-CSS Classes מ-`CSS_CLASSES_INDEX.md`
- [ ] בדיקת RTL compliance
- [ ] בדיקת Accessibility (ARIA)
- [ ] בדיקת עמידה ב-ITCSS hierarchy

**תהליך:**
1. Team 30 יוצר Component
2. Team 30 שולח ל-Team 40 לבדיקה
3. Team 40 בודק ויזואלית ומאשר/מבקש תיקונים
4. Team 30 מתקן לפי הערות
5. Team 40 מאשר סופית

---

## 📊 תהליך עבודה משותף

### **שלב 1: זיהוי Components** (Team 30)
- סקירת כל העמודים הקיימים
- זיהוי Components שחוזרים על עצמם
- תיעוד Components שזוהו

### **שלב 2: יצירת Components** (Team 30)
- יצירת Components לפי סדר עדיפויות
- שימוש ב-Shared Components קיימים (`PhoenixTable`, `PhoenixFilterContext`)
- עמידה בכל הסטנדרטים

### **שלב 3: ולידציה ויזואלית** (Team 40)
- בדיקת כל Component
- אישור או בקשה לתיקונים
- אישור סופי

### **שלב 4: תיעוד** (Team 30)
- יצירת `CUBE_COMPONENTS_INDEX.md`
- תיעוד Props, Usage, Examples

---

## 🔗 קישורים רלוונטיים

### **תוכנית:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית מלאה

### **תוצרים של שלב 2:**
- `documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md` (v1.1) - CSS Classes Index
- `ui/src/cubes/` - מבנה LEGO Cubes מלא

### **Components קיימים:**
- `ui/src/cubes/shared/components/tables/PhoenixTable.jsx` - טבלה משותפת
- `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx` - Filter Context
- `ui/src/cubes/shared/hooks/` - Hooks משותפים
- `ui/src/cubes/shared/utils/transformers.js` - Transformation Layer

### **סטנדרטים:**
- `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md` - JavaScript Standards
- `documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md` - CSS Classes

---

## ⚠️ הערות חשובות

1. **תיאום:** Team 30 מוביל את התהליך, Team 40 משתתף בולידציה
2. **עדיפויות:** להתחיל עם Identity Cube (D15) - יותר Components משותפים
3. **שימוש ב-Components קיימים:** להשתמש ב-`PhoenixTable` ו-`PhoenixFilterContext` שכבר קיימים
4. **תיעוד:** חובה לתעד כל Component ב-`CUBE_COMPONENTS_INDEX.md`

---

## ✅ Checklist התחלה

### **Team 30:**
- [ ] סקירת כל העמודים הקיימים (D15_LOGIN, D15_REGISTER, D15_RESET_PWD, D15_PROFILE, D16_ACCTS_VIEW)
- [ ] זיהוי Components משותפים
- [ ] תיעוד Components שזוהו
- [ ] התחלת יצירת Components (להתחיל עם Identity Cube)

### **Team 40:**
- [ ] הכנה לבדיקות ולידציה ויזואלית
- [ ] סקירת `CSS_CLASSES_INDEX.md` (v1.1)
- [ ] הכנת קריטריוני בדיקה

---

## 🎯 הצעדים הבאים

1. **Team 30:** התחלת זיהוי Components משותפים (Identity Cube)
2. **Team 30:** יצירת Component ראשון (למשל `AuthForm`)
3. **Team 40:** ולידציה ויזואלית של Component הראשון
4. **Team 30:** תיקונים לפי הערות (אם יש)
5. **Team 40:** אישור סופי
6. **חוזר חלילה** עד שכל ה-Components נוצרו

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🟢 **STAGE 2.5 READY TO START**

**log_entry | Team 10 | STAGE_2.5_ACTIVATION | TO_TEAM_30_40 | 2026-02-01**
