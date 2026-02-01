# 📡 הודעה: Team 10 → Team 50 (QA) | דרישות ולידציה - LEGO Refactor Plan V2

**From:** Team 10 (The Gateway)  
**To:** Team 50 (QA)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** VALIDATION_REQUIREMENTS | Status: 🟢 **ACTIVE**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 📋 Executive Summary

לאחר השלמת בנייה מחדש של העמודים לפי ארכיטקטורת LEGO מודולרית, נדרש לבצע ולידציה מקיפה של עמידה בכל האפיונים והתקנים.

---

## 🎯 תפקידכם

**בדיקת עמידה בכל האפיונים והתקנים** לכל העמודים שנבנו מחדש.

---

## 📊 שלב 4: ולידציה ואיכות

### **4.1 בדיקות ויזואליות**

- [ ] **בדיקת fidelity מול Blueprint** (כל עמוד)
  - השוואה ויזואלית מדויקת
  - פונטים, צבעים, עימוד
  - Pixel-perfect compliance

- [ ] **בדיקת RTL compliance**
  - כיוון טקסט נכון
  - מיקום אלמנטים נכון
  - Logical Properties

- [ ] **בדיקת Accessibility (ARIA)**
  - ARIA labels
  - Keyboard navigation
  - Screen reader compatibility

---

### **4.2 בדיקות ארכיטקטורה**

- [ ] **בדיקת עמידה בארכיטקטורה מודולרית**
  - מבנה קוביות מודולריות (`ui/src/cubes/`)
  - Shared Components ברמת קוביה
  - State Management משותף ברמת קוביה
  - Backend Integration ברמת קוביה

- [ ] **בדיקת שימוש ב-Shared Components**
  - אין כפילות קוד
  - שימוש נכון ב-Components משותפים

- [ ] **בדיקת State Management משותף**
  - Context API ברמת קוביה
  - Hooks משותפים

---

### **4.3 בדיקת עמידה בכל האפיונים והתקנים** ⚠️ **חובה**

#### **4.3.1 בדיקות JavaScript (`TT2_JS_STANDARDS_PROTOCOL.md`)**

**Network Integrity:**
- [ ] כל API Payloads ב-`snake_case` תקין
- [ ] כל API Responses עוברים דרך `apiToReact` (camelCase)
- [ ] Transformation Layer מיושם נכון

**Console Audit:**
- [ ] Console נקי במצב רגיל (אין לוגים)
- [ ] Console מלא במצב `?debug` (Audit Trail מלא)
- [ ] Audit Trail System מיושם

**Fidelity Resilience:**
- [ ] שגיאות מוצגות ברכיבי LEGO (`tt-container`, `tt-section`)
- [ ] שגיאות משתמשות ב-CSS classes מ-BEM
- [ ] שגיאות משתמשות ב-JS selectors עם `js-` prefix

**JS Selectors:**
- [ ] כל ה-selectors עם `js-` prefix
- [ ] אין שימוש ב-BEM classes כ-JS selectors
- [ ] אין שימוש ב-LEGO components כ-JS selectors

**⚠️ כלל ברזל - ארגון סקריפטים:**
- [ ] **אין `<script>` tags בתוך HTML/JSX**
- [ ] **אין inline event handlers** (`onclick`, `onchange`, `onsubmit`, וכו')
- [ ] כל הסקריפטים בקבצים חיצוניים
- [ ] ארגון קבצי סקריפטים לפי קוביות (`ui/src/cubes/{cube_name}/scripts/`)
- [ ] פונקציות משותפות בקובץ משותף (`ui/src/cubes/shared/scripts/`)
- [ ] אין כפילות קוד - פונקציות משותפות בקובץ אחד בלבד

**JSDoc Documentation:**
- [ ] כל הפונקציות מתועדות ב-JSDoc
- [ ] כל הפונקציות כוללות `@legacyReference`
- [ ] תיעוד מלא של Parameters ו-Returns

**Icon Standards:**
- [ ] כל האיקונים הם SVG inline פשוטים
- [ ] אין שימוש בספריות איקונים חיצוניות (lucide-react, react-icons, וכו')
- [ ] כל האיקונים משתמשים ב-`currentColor`
- [ ] גודל אחיד של איקונים בקונטקסט דומה

**קישור לפרוטוקול:** `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`

---

#### **4.3.2 בדיקות CSS (`TT2_CSS_STANDARDS_PROTOCOL.md`)**

**CSS Hierarchy:**
- [ ] עמידה ב-ITCSS hierarchy
- [ ] סדר טעינת CSS נכון

**CSS Variables:**
- [ ] כל ה-Variables ב-`phoenix-base.css` בלבד
- [ ] אין כפילות CSS Variables

**Inline CSS:**
- [ ] **אין `<style>` tags בתוך HTML/JSX**
- [ ] **אין `style` attributes**

**CSS Classes:**
- [ ] כל ה-classes עומדים ב-BEM convention
- [ ] אין כפילות CSS classes

**Logical Properties:**
- [ ] שימוש ב-Logical Properties בלבד
- [ ] אין שימוש ב-Physical Properties

**קישור לפרוטוקול:** `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`

---

#### **4.3.3 בדיקות HTML/JSX**

**LEGO System:**
- [ ] שימוש ב-`tt-container` > `tt-section` > `tt-section-row`
- [ ] אין CSS מותאם אישית - רק Logical Properties

**Inline Content:**
- [ ] **אין `<script>` tags בתוך HTML/JSX**
- [ ] **אין `<style>` tags בתוך HTML/JSX**
- [ ] **אין `style` attributes**
- [ ] **אין inline event handlers** (`onclick`, `onchange`, וכו')

---

### **4.4 דוח ולידציה**

**Team 50 יוצר דוח מפורט הכולל:**

#### **תבנית דוח:**
- `TEAM_50_LEGO_REFACTOR_VALIDATION_REPORT.md`

#### **תוכן הדוח:**

**1. Executive Summary**
- סטטוס כללי (✅ עבר / ❌ נכשל)
- מספר עמודים שנבדקו
- מספר בעיות שנמצאו

**2. תוצאות בדיקות לפי קטגוריה**

**בדיקות ויזואליות:**
- Fidelity מול Blueprint
- RTL compliance
- Accessibility

**בדיקות ארכיטקטורה:**
- עמידה בארכיטקטורה מודולרית
- שימוש ב-Shared Components
- State Management משותף

**בדיקות JavaScript:**
- Network Integrity
- Console Audit
- Fidelity Resilience
- JS Selectors
- **ארגון סקריפטים חיצוניים** ⚠️
- JSDoc Documentation
- Icon Standards

**בדיקות CSS:**
- CSS Hierarchy
- CSS Variables
- Inline CSS
- CSS Classes
- Logical Properties

**בדיקות HTML/JSX:**
- LEGO System
- Inline Content

**3. רשימת בעיות**

לכל בעיה:
- תיאור הבעיה
- מיקום (קובץ, שורה)
- חומרה (🔴 Critical / 🟡 Warning)
- המלצה לתיקון

**4. סיכום והמלצות**

- אישור סופי או דחייה
- רשימת תיקונים נדרשים
- הערות כלליות

---

## ✅ Checklist

### **בדיקות ויזואליות**
- [ ] Fidelity מול Blueprint
- [ ] RTL compliance
- [ ] Accessibility

### **בדיקות ארכיטקטורה**
- [ ] עמידה בארכיטקטורה מודולרית
- [ ] שימוש ב-Shared Components
- [ ] State Management משותף

### **בדיקות JavaScript**
- [ ] Network Integrity
- [ ] Console Audit
- [ ] Fidelity Resilience
- [ ] JS Selectors
- [ ] **ארגון סקריפטים חיצוניים** ⚠️
- [ ] JSDoc Documentation
- [ ] Icon Standards

### **בדיקות CSS**
- [ ] CSS Hierarchy
- [ ] CSS Variables
- [ ] Inline CSS
- [ ] CSS Classes
- [ ] Logical Properties

### **בדיקות HTML/JSX**
- [ ] LEGO System
- [ ] Inline Content

### **דוח ולידציה**
- [ ] יצירת דוח מפורט
- [ ] רשימת בעיות
- [ ] המלצות לתיקון
- [ ] אישור סופי או דחייה

---

## 🔗 קישורים רלוונטיים

### **פרוטוקולים:**
- `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md` - JavaScript Standards
- `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md` - CSS Standards

### **תוכנית:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית מלאה

---

## 🎯 הצעדים הבאים

1. **להמתין:** להשלמת שלבים 1, 2, 2.5, 3, 3.5
2. **להתחיל:** בדיקות ולידציה מקיפות
3. **ליצור:** דוח מפורט עם כל הממצאים
4. **להמליץ:** אישור או דחייה עם רשימת תיקונים

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🟢 **ACTIVE - AWAITING COMPLETION OF PHASES 1-3.5**

**log_entry | Team 10 | VALIDATION_REQUIREMENTS | TO_TEAM_50 | 2026-02-01**
