# 🏗️ תוכנית CSS & Blueprint Refactor V2 - בנייה מחדש לפי ארכיטקטורת LEGO מודולרית

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend), Team 40 (UI Assets & Design), Team 31 (Blueprint), Team 50 (QA)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** CSS_BLUEPRINT_REFACTOR_PLAN_V2 | Status: 🟢 **ACTIVE**  
**Priority:** 🔴 **P0 - CRITICAL**  
**⚠️ כלל ברזל:** אין סקריפטים בתוך העמוד - כל הסקריפטים בקבצים חיצוניים  
**🛡️ ארכיטקטורה:** נעולה לפי החלטת האדריכלית הראשית (`ARCHITECT_DECISION_LEGO_CUBES_FINAL.md`)  
**📱 Fluid Design:** חובה לפי `ARCHITECT_RESPONSIVE_CHARTER.md` - ללא media queries, שימוש ב-`clamp()`/`min()`/`max()`, Grid עם `auto-fit`/`auto-fill`  
**🛡️ Final Governance Lock:** כל חריגה תגרור פסילת G-Bridge מיידית

---

## 📋 Executive Summary

**מטרה:** בנייה מחדש של כל העמודים שכבר מימשנו בהתאם לבלופרינטים חדשים מ-Team 31, תיקון היררכיית CSS, ויישום תבנית בסיס מדויקת - **כל זאת תוך שמירה על ארכיטקטורת LEGO מודולרית וקוביות מודולריות**.

**רקע:**
- Team 31 סיפק בלופרינטים חדשים ומעודכנים לכל העמודים שכבר מימשנו
- Team 40 סיים CSS Audit ומצא בעיות קריטיות (כפילויות, היררכיה לא נכונה)
- Team 30 עובד על מערכת טבלאות React Framework
- **בדיקה אדריכלית:** התוכנית הקודמת לא עמדה במלואה בארכיטקטורה מודולרית - עודכן בהתאם
- **⚠️ עדכון קריטי:** זוהתה בעיה - הבלופרינט הנכון הוא `D15_PAGE_TEMPLATE_STAGE_1.html` (לא בלופרינטים אחרים) 🚨
  - **מקור:** `TEAM_30_TO_TEAM_10_BLUEPRINT_IMPLEMENTATION_UPDATE.md`
  - **פתרון:** כל הבלופרינטים יש ליישם לפי `D15_PAGE_TEMPLATE_STAGE_1.html` כבסיס + `index.html` לאינדקס

**עמודים בסקופ (לפי קוביות מודולריות):**
- **Identity & Authentication Cube (D15):** D15_LOGIN, D15_REGISTER, D15_RESET_PWD, D15_PROFILE, D15_INDEX
- **Financial Cube (D16):** D16_ACCTS_VIEW

---

## 🎯 מטרות התוכנית

### **1. תיקון היררכיית CSS (P0)**
- איחוד כל CSS Variables למקור אמת יחיד (`phoenix-base.css`)
- הסרת כפילויות (design-tokens.css, auth.css)
- תיקון סדר טעינת CSS
- עמידה ב-ITCSS hierarchy

### **2. יישום תבנית בסיס מדויקת (P0)**
- עדכון `global_page_template.jsx` לפי הבלופרינט החדש
- יישום מבנה LEGO System נכון (`tt-container` > `tt-section` > `tt-section-row`)
- שמירה על פונקציונליות קיימת (React Context, Hooks)

### **3. בנייה מחדש לפי קוביות מודולריות (P0)** ⭐ **חדש**
- בנייה מחדש של כל העמודים **לפי קוביות מודולריות** (לא עמודים בודדים)
- זיהוי ויצירת Components משותפים ברמת קוביה
- יצירת State Management משותף ברמת קוביה
- Backend Integration ברמת קוביה

### **4. ארגון סקריפטים חיצוניים (P0)** ⚠️ **כלל ברזל**
- **אין סקריפטים בתוך העמוד** - כל הסקריפטים חייבים להיות בקבצים חיצוניים
- ארגון קבצי סקריפטים לפי קוביות מודולריות
- פונקציות משותפות בקובץ משותף (לא כפילות קוד)
- הקפדה על כל הכללים והסטנדרטים (`TT2_JS_STANDARDS_PROTOCOL.md`)

### **5. ולידציה ואיכות (P1)**
- בדיקת fidelity מול Blueprint
- בדיקת RTL compliance
- בדיקת Accessibility (ARIA)
- בדיקת עמידה בארכיטקטורה מודולרית
- **בדיקת עמידה בכל האפיונים והתקנים** (Team 50) ⚠️ **חובה**
  - JavaScript Standards (`TT2_JS_STANDARDS_PROTOCOL.md`)
  - CSS Standards (`TT2_CSS_STANDARDS_PROTOCOL.md`)
  - HTML/JSX Standards (LEGO System, אין inline scripts/styles)
  - ארגון קבצים (סקריפטים חיצוניים, פונקציות משותפות)

---

## 📊 שלבי העבודה

### **שלב 1: עדכון תבנית בסיס (global_page_template.jsx)** ⏳ **IN PROGRESS**

**צוותים:** Team 30 (Frontend) + Team 40 (UI Assets)

**משימות:**
- [x] **1.1** קבלת Blueprint מעודכן מ-Team 31 ✅
- [x] **1.2** ניתוח מבנה הבלופרינט החדש ✅
- [ ] **1.3** עדכון `global_page_template.jsx` לפי הבלופרינט
  - החלטה: **CSS Classes מותאמים אישית** (לא Tailwind)
  - החלטה: **React Context** (`PhoenixFilterContext`) - לשמור על פונקציונליות קיימת
  - יישום מבנה LEGO System נכון (`tt-container` > `tt-section` > `tt-section-row`)

**החלטות:**
1. ✅ **גישת CSS:** CSS Classes מותאמים אישית (להתאים לבלופרינט)
2. ✅ **גישת Filter:** React Context (`PhoenixFilterContext`) - לשמור על פונקציונליות קיימת

**קבצים:**
- `ui/src/layout/global_page_template.jsx` (לעדכן)
- **⚠️ CRITICAL:** `_COMMUNICATION/team_01/team_01_staging/D15_PAGE_TEMPLATE_STAGE_1.html` - **הבלופרינט הנכון** 🛡️ **MANDATORY**
- **⚠️ CRITICAL:** `_COMMUNICATION/team_01/team_01_staging/index.html` - **אינדקס בלופרינטים** 🛡️ **MANDATORY**
- `_COMMUNICATION/team_31/team_31_staging/D15_PAGE_TEMPLATE.html` - **לא מעודכן** ⚠️

**עדכון קריטי:** `TEAM_10_BLUEPRINT_CRITICAL_UPDATE.md` 🚨

**סטטוס:** ⏳ **IN PROGRESS** - Team 30 ממשיך בעבודה (עם הבלופרינט הנכון)

---

### **שלב 2: הידוק היררכיה וחלוקה בין קבצי CSS** (P0) ✅ **COMPLETE** 🛡️ **APPROVED BY ARCHITECT**

**עדכון:** 🛡️ **ARCHITECT DECISION 2026-02-02** - Fluid Design Mandate נוסף לשלב זה

**צוותים:** Team 40 (UI Assets & Design)

**משימות:**
- [x] **2.1** בדיקה ומיפוי של כל קבצי ה-CSS הקיימים ✅ **COMPLETE**
- [x] **2.2** זיהוי כפילויות ובעיות היררכיה ✅ **COMPLETE**
- [x] **2.3** אישור תיקונים ✅ **APPROVED BY ARCHITECT** 🛡️
- [x] **2.3** תיקון היררכיה וחלוקה ✅ **COMPLETE**
  - איחוד CSS Variables ל-`phoenix-base.css` (SSOT) ✅
  - הסרת `design-tokens.css` ✅
  - הסרת `auth.css` ✅
  - הסרת קבצי JSON (`design-tokens/*.json`) ✅
  - הסרת inline CSS מ-`global_page_template.jsx` ✅
- [x] **2.4** עדכון `CSS_CLASSES_INDEX.md` ✅ **COMPLETE**
  - תיעוד כל ה-CSS Classes עם ITCSS layer information ✅
  - הוספת Authentication & Identity classes (15 classes) ✅
  - הוספת Form Elements classes (4 classes) ✅
  - עדכון CSS file hierarchy ✅
  - גרסה: v1.0 → v1.1 ✅

**ממצאים קריטיים (Team 40 Audit):**

#### **בעיה 1: כפילות CSS Variables** 🔴 **CRITICAL**
- **מיקומים:** `phoenix-base.css`, `design-tokens.css`, `global_page_template.jsx` (inline)
- **פתרון:** איחוד הכל ל-`phoenix-base.css`, הסרת `design-tokens.css`, הסרת inline CSS

#### **בעיה 2: כפילות Auth Styles** 🔴 **CRITICAL**
- **מיקומים:** `D15_IDENTITY_STYLES.css`, `auth.css`
- **פתרון:** שמירה על `D15_IDENTITY_STYLES.css` (QA Approved), הסרת `auth.css`

#### **בעיה 3: מיקום קבצים לא עקבי** 🟡 **WARNING**
- **מיקומים:** `ui/styles/` vs `ui/src/styles/`
- **פתרון:** העברת כל הקבצים ל-`ui/src/styles/`

**קבצים לטיפול:**
- `ui/src/styles/phoenix-base.css` (למזג CSS Variables)
- `ui/styles/design-tokens.css` (להסיר)
- `ui/styles/auth.css` (להסיר)
- `ui/src/layout/global_page_template.jsx` (להסיר inline CSS)

**סטטוס:** ✅ **COMPLETE** - כל המשימות הושלמו (2.1-2.4)

**עדכון:** 🛡️ **ARCHITECT DECISION 2026-02-02** - Fluid Design Mandate  
**משימה חדשה:** **2.6** - הסרת media queries והחלפתן ב-Fluid Design (ראה שלב 2.6 למטה)

---

### **שלב 2.5: יצירת Cube Components Library** ⭐ **חדש** (P0) 🟡 **IN PROGRESS**

**צוותים:** Team 30 (Frontend - מוביל) + Team 40 (UI Assets - ולידציה ויזואלית)

**מטרה:** זיהוי ויצירת Components משותפים ברמת קוביה לפני בנייה מחדש של העמודים.

**הודעה להפעלה:** `TEAM_10_TO_TEAM_30_40_STAGE_2.5_ACTIVATION.md` 🟢  
**סטטוס נוכחי:** 🟡 **75% Complete (Phase 1 - Identity Cube)**

**תהליך:**

#### **2.5.1 זיהוי Components משותפים לכל קוביה**

**Identity & Authentication Cube (D15):**
- [x] **useAuthValidation** - Hook לולידציה משותפת ✅ **COMPLETE**
- [x] **AuthErrorHandler** - טיפול בשגיאות משותף ✅ **COMPLETE** (הוגש לולידציה)
- [x] **AuthLayout** - Layout משותף לעמודי Auth ✅ **COMPLETE** (הוגש לולידציה)
- [ ] **AuthForm** - טופס משותף (Login, Register, Reset Password) 🟡 **IN PROGRESS**

**Financial Cube (D16, D18, D21):**
- [ ] **FinancialTable** - טבלה משותפת (Accounts, Brokers, Cash)
- [ ] **FinancialFilters** - פילטרים משותפים
- [ ] **FinancialSummary** - סיכומים משותפים
- [ ] **FinancialCard** - כרטיסי סיכום משותפים

#### **2.5.2 יצירת מבנה תיקיות לפי קוביות**

```
ui/src/
├── cubes/
│   ├── identity/              # Identity & Authentication Cube
│   │   ├── components/        # Components משותפים
│   │   │   ├── AuthForm.jsx
│   │   │   ├── AuthValidation.jsx
│   │   │   ├── AuthErrorHandler.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── contexts/          # State Management משותף
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/             # Hooks משותפים
│   │   │   └── useAuth.js
│   │   ├── services/          # API Services
│   │   │   └── identityApi.js
│   │   └── pages/             # עמודים של הקוביה
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── ResetPasswordPage.jsx
│   │       └── ProfilePage.jsx
│   ├── financial/            # Financial Cube
│   │   ├── components/        # Components משותפים
│   │   │   ├── FinancialTable.jsx
│   │   │   ├── FinancialFilters.jsx
│   │   │   ├── FinancialSummary.jsx
│   │   │   └── FinancialCard.jsx
│   │   ├── contexts/         # State Management משותף
│   │   │   └── FinancialContext.jsx
│   │   ├── hooks/            # Hooks משותפים
│   │   │   └── useFinancial.js
│   │   ├── services/          # API Services
│   │   │   └── financialApi.js
│   │   └── pages/            # עמודים של הקוביה
│   │       ├── AccountsPage.jsx (D16)
│   │       ├── BrokersPage.jsx (D18)
│   │       └── CashPage.jsx (D21)
```

#### **2.5.3 תיעוד Components**

- [ ] יצירת `CUBE_COMPONENTS_INDEX.md` לכל קוביה
- [ ] תיעוד Props, Usage, Examples
- [ ] תיעוד State Management משותף

**סטטוס:** 🟡 **IN PROGRESS** - Phase 1: 75% Complete (3 מתוך 4 Components) ✅

**Components שנוצרו:**
- ✅ `useAuthValidation` Hook - **COMPLETE** (הוגש לולידציה)
- ✅ `AuthErrorHandler` Component - **COMPLETE** (הוגש לולידציה)
- ✅ `AuthLayout` Component - **COMPLETE** (הוגש לולידציה)
- 🟡 `AuthForm` Component - **IN PROGRESS**

**ולידציה:**
- 🟡 **Team 40:** בודק קוד של 3 Components שהוגשו
- ⏸️ **The Visionary:** ממתין להשלמת בדיקות Team 40

**דוחות:**
- `TEAM_30_STAGE_2.5_PROGRESS_REPORT.md` - דוח התקדמות Team 30
- `TEAM_30_TO_TEAM_40_VALIDATION_SUBMISSION.md` - הגשה לולידציה
- `TEAM_40_TO_TEAM_10_STAGE_2.5_READY.md` - Team 40 מוכן לבדיקות
- `TEAM_40_TO_TEAM_10_VALIDATION_WORKFLOW_UPDATE.md` - עדכון תהליך עבודה (ולידציה סופית)

**דוחות:**
- `TEAM_30_STAGE_2.5_PROGRESS_REPORT.md` - דוח התקדמות Team 30
- `TEAM_30_TO_TEAM_40_VALIDATION_SUBMISSION.md` - הגשה לולידציה
- `TEAM_40_TO_TEAM_10_STAGE_2.5_READY.md` - Team 40 מוכן לבדיקות
- `TEAM_40_TO_TEAM_10_VALIDATION_WORKFLOW_UPDATE.md` - עדכון תהליך עבודה (ולידציה סופית)

---

### **שלב 2.6: יישום Fluid Design - הסרת Media Queries** 🛡️ **MANDATORY** (P0) 🔴 **NEW**

**צוותים:** Team 40 (UI Assets & Design - מוביל) + Team 30 (Frontend - יישום)

**מקור:** `ARCHITECT_DECISION_LEGO_CUBES.md` + `ARCHITECT_RESPONSIVE_CHARTER.md`  
**תאריך החלטה:** 2026-02-02  
**סטטוס:** 🔴 **READY TO START**

**מטרה:** הסרת כל ה-media queries והחלפתן ב-Fluid Design (clamp, min, max, Grid auto-fit/auto-fill).

**עקרונות Fluid Design (חובה):**

#### **1. טיפוגרפיה וריווחים נזילים**
- **פונטים:** שימוש ב-`clamp(min, preferred, max)` במקום media queries
- **ריווחים:** שימוש ב-`clamp()` ל-Margins ו-Paddings
- **דוגמה:**
  ```css
  /* ❌ לא נכון - media query */
  @media (max-width: 768px) {
    font-size: 14px;
  }
  
  /* ✅ נכון - Fluid Design */
  font-size: clamp(14px, 2vw + 0.5rem, 18px);
  ```

#### **2. גריד גמיש (No-Media-Query Goal)**
- **Grid:** שימוש ב-`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
- **Container:** תמיד ברוחב מקסימלי של 1400px (כבר מיושם)
- **דוגמה:**
  ```css
  /* ✅ נכון - Grid גמיש */
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: clamp(16px, 2vw, 24px);
  }
  ```

#### **3. טבלאות ונתונים (Mobile Tables)**
- **טבלאות לא "נשברות" למובייל** - עטופות ב-`overflow-x: auto`
- **שימוש ב-Sticky Columns** לשמירה על קונטקסט
- **רוחב מינימלי** לרכיבי LEGO (כמו טבלאות) עם Horizontal Scroll פנימי

**משימות:**

- [ ] **2.6.1** זיהוי כל ה-media queries בקוד
  - [ ] `phoenix-components.css` - 1 media query (@media min-width: 1024px)
  - [ ] `phoenix-base.css` - 1 media query (@media prefers-color-scheme: dark) - **לשמור** (dark mode)
  - [ ] `phoenix-header.css` - 3 media queries (@media max-width: 768px, min-width: 768px, min-width: 1200px)
  - [ ] `phoenix-tables.css` - לבדוק אם יש media queries
  - [ ] קבצי CSS נוספים - סריקה מלאה

- [ ] **2.6.2** החלפת media queries ב-Fluid Design
  - [ ] **פונטים:** החלפת כל הגדרות font-size ב-`clamp()`
  - [ ] **ריווחים:** החלפת כל margins/paddings ב-`clamp()` (אם נדרש)
  - [ ] **Grid:** החלפת media queries ב-`repeat(auto-fit, minmax(...))`
  - [ ] **טבלאות:** וידוא ש-tables עטופות ב-`overflow-x: auto` (כבר מיושם ב-`.phoenix-table-wrapper`)

- [ ] **2.6.3** בדיקת עמידה ב-Responsive Charter
  - [ ] כל הפונטים משתמשים ב-`clamp()`
  - [ ] כל הריווחים משתמשים ב-`clamp()` (אם נדרש)
  - [ ] כל ה-Grids משתמשים ב-`auto-fit`/`auto-fill`
  - [ ] אין media queries (חוץ מ-dark mode אם נדרש)

- [ ] **2.6.4** עדכון תיעוד
  - [ ] עדכון `CSS_CLASSES_INDEX.md` - הסרת התייחסויות ל-media queries
  - [ ] עדכון `TT2_TABLES_REACT_FRAMEWORK.md` - הוספת סעיף על Fluid Design בטבלאות
  - [ ] יצירת/עדכון `ARCHITECT_RESPONSIVE_CHARTER.md` - תיעוד מלא

**קבצים לטיפול:**
- `ui/src/styles/phoenix-components.css` - הסרת `@media (min-width: 1024px)`
- `ui/src/styles/phoenix-header.css` - הסרת 3 media queries
- `ui/src/styles/phoenix-tables.css` - לבדוק אם יש media queries
- `ui/src/styles/phoenix-base.css` - **לשמור** `@media (prefers-color-scheme: dark)` (dark mode)

**החלטות אדריכליות:**
- 🛡️ **איסור מוחלט:** אין לכתוב קבצי CSS נפרדים למובייל
- 🛡️ **טכנולוגיה:** `clamp()`, `min()`, `max()` עבור גדלי פונטים וריווחים
- 🛡️ **Layout:** Flexbox ו-Grid עם `auto-fit` ו-`auto-fill`
- 🛡️ **Viewports:** רוחב מינימלי לרכיבי LEGO עם Horizontal Scroll פנימי

**קישורים:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` - החלטה אדריכלית סופית 🛡️ **FINAL GOVERNANCE LOCK**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESPONSIVE_CHARTER.md` - אמנת רספונסיביות

**סטטוס:** 🔴 **READY TO START** - ממתין להפעלת Team 40

---

### **שלב 3: בנייה מחדש לפי קוביות מודולריות** ⭐ **עודכן** (P0)

**צוותים:** Team 30 (Frontend) + Team 40 (UI Assets)

**תנאי מקדמים:**
- ✅ שלב 1 הושלם (תבנית בסיס)
- ✅ שלב 2 הושלם (היררכיית CSS)
- ✅ שלב 2.5 הושלם (Cube Components Library)

---

#### **3.1 Identity & Authentication Cube (D15)** 🔴 **P0**

**עמודים:**
- D15_LOGIN
- D15_REGISTER
- D15_RESET_PWD
- D15_PROFILE
- D15_INDEX

**תהליך:**

##### **3.1.1 יצירת Cube Structure** 🛡️ **MANDATORY STRUCTURE** ✅ **COMPLETE**
- [x] יצירת תיקיית `ui/src/cubes/identity/` ✅ **COMPLETE**
- [x] יצירת תיקיות: `components/`, `contexts/`, `hooks/`, `services/`, `scripts/`, `pages/` ✅ **COMPLETE**
- [x] העברת Components קיימים מ-`components/auth/` ו-`components/profile/` → `cubes/identity/components/` ✅ **COMPLETE**
- [x] העברת `auth.js` מ-`services/` → `cubes/identity/services/` ✅ **COMPLETE**

##### **3.1.2 יצירת Shared Components**
- [ ] **AuthForm** - טופס משותף עם Props גמישים
- [ ] **AuthValidation** - ולידציה משותפת (PhoenixSchema)
- [ ] **AuthErrorHandler** - טיפול בשגיאות משותף
- [ ] **AuthLayout** - Layout משותף

##### **3.1.3 יצירת State Management**
- [ ] **AuthContext** - Context API משותף לכל עמודי Identity
- [ ] **useAuth** Hook - Hook משותף לניהול Auth state

##### **3.1.4 יצירת API Service**
- [ ] **identityApi.js** - כל ה-API calls של Identity Cube
  - `login()`
  - `register()`
  - `resetPassword()`
  - `getProfile()`
  - `updateProfile()`
  - `changePassword()`

##### **3.1.5 בנייה מחדש של עמודים**
לכל עמוד:
- [ ] **⚠️ CRITICAL:** יישום לפי `D15_PAGE_TEMPLATE_STAGE_1.html` כבסיס 🛡️ **MANDATORY**
- [ ] **⚠️ CRITICAL:** עקיבה אחרי `index.html` לכל הבלופרינטים 🛡️ **MANDATORY**
- [ ] העתקת תוכן מ-Blueprint ספציפי (לפי האינדקס)
- [ ] המרה ל-React Component תוך שימוש ב-Shared Components
- [ ] שימוש ב-AuthContext ו-useAuth Hook
- [ ] אינטגרציה עם identityApi Service
- [ ] שמירה על מבנה LEGO System (`tt-container` > `tt-section` > `tt-section-row`)
- [ ] **⚠️ כלל ברזל:** אין סקריפטים בתוך העמוד - כל הסקריפטים בקבצים חיצוניים

##### **3.1.6 Refactor רטרואקטיבי - הוצאת לוגיקה מקבצי Auth קיימים** 🛡️ **MANDATORY - RETROACTIVE**
**מקור:** `ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` - משמעת סקריפטים (The Clean Slate Rule)

**מטרה:** כל עמודי ה-Auth הקיימים חייבים לעבור Refactor להוצאת הלוגיקה לקבצים חיצוניים.

**משימות:**
- [ ] **3.1.6.1** סריקה מלאה של כל קבצי Auth קיימים
  - [ ] זיהוי כל תגי `<script>` בתוך קבצי HTML/JSX
  - [ ] זיהוי כל event handlers inline (`onclick`, `onchange`, וכו')
  - [ ] רשימת כל הלוגיקה שצריכה להיות מועברת לקבצים חיצוניים

- [ ] **3.1.6.2** יצירת קבצי JavaScript חיצוניים
  - [ ] `cubes/identity/scripts/auth-login.js` - לוגיקת Login
  - [ ] `cubes/identity/scripts/auth-register.js` - לוגיקת Register
  - [ ] `cubes/identity/scripts/auth-reset-password.js` - לוגיקת Reset Password
  - [ ] `cubes/identity/scripts/auth-profile.js` - לוגיקת Profile
  - [ ] פונקציות משותפות ב-`cubes/identity/scripts/auth-common.js`

- [ ] **3.1.6.3** העברת לוגיקה לקבצים חיצוניים
  - [ ] הסרת כל תגי `<script>` מקבצי HTML/JSX
  - [ ] הסרת כל event handlers inline
  - [ ] העברת כל הלוגיקה לקבצי JavaScript חיצוניים
  - [ ] שימוש ב-`js-` prefixed classes במקום inline handlers

- [ ] **3.1.6.4** עדכון קבצי HTML/JSX
  - [ ] הוספת `<script src="...">` בסוף `<body>` (לפני G-Bridge banner)
  - [ ] הסרת כל תגי `<script>` פנימיים
  - [ ] הסרת כל event handlers inline

- [ ] **3.1.6.5** בדיקת עמידה
  - [ ] אין תגי `<script>` בתוך HTML/JSX
  - [ ] אין event handlers inline
  - [ ] כל הלוגיקה בקבצים חיצוניים
  - [ ] שימוש ב-`js-` prefixed classes
  - [ ] בדיקת G-Bridge - חייבת לעבור (ירוק)

**קבצים לטיפול:**
- כל קבצי Auth קיימים (Login, Register, Reset Password, Profile)
- קבצי HTML בסטייג'ינג (אם יש)
- קבצי JSX/React (אם יש inline scripts)

**החלטה אדריכלית:**
- 🛡️ **איסור מוחלט:** אין לכתוב תגי `<script>` בתוך קבצי HTML או JSX
- 🛡️ **רטרואקטיביות:** כל עמודי ה-Auth הקיימים חייבים לעבור Refactor
- 🛡️ **G-Bridge:** כל חריגה תגרור פסילת G-Bridge מיידית

**קישורים:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` - החלטה אדריכלית סופית
- `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md` - JS Standards Protocol

**סטטוס:** 🔴 **READY TO START** - משימה רטרואקטיבית חובה
- [ ] ארגון קבצי סקריפטים לפי קוביה (`ui/src/cubes/identity/scripts/`)
- [ ] ולידציה: fidelity, RTL, Accessibility

**בלופרינטים זמינים:** ⚠️ **CRITICAL UPDATE**
- **תבנית בסיס:** `_COMMUNICATION/team_01/team_01_staging/D15_PAGE_TEMPLATE_STAGE_1.html` 🛡️ **MANDATORY**
- **אינדקס:** `_COMMUNICATION/team_01/team_01_staging/index.html` 🛡️ **MANDATORY**
- **בלופרינטים ספציפיים:** לפי האינדקס (`index.html`) - יש לבדוק את הקישורים הרלוונטיים

**⚠️ חשוב:** כל הבלופרינטים יש ליישם לפי `D15_PAGE_TEMPLATE_STAGE_1.html` כבסיס + האינדקס (`index.html`)

**עדכון קריטי:** `TEAM_10_BLUEPRINT_CRITICAL_UPDATE.md` 🚨

**Backend API Endpoints:**
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/reset-password`
- `/api/users/me`
- `/api/users/me` (PUT)
- `/api/users/me/password` (PUT)

---

#### **3.2 Financial Cube (D16, D18, D21)** 🔴 **P0**

**עמודים:**
- D16_ACCTS_VIEW (Trading Accounts)
- D18_BRKRS_VIEW (Brokers) - עתידי
- D21_CASH_VIEW (Cash Flow) - עתידי

**תהליך:**

##### **3.2.1 יצירת Cube Structure** 🛡️ **MANDATORY STRUCTURE**
- [ ] יצירת תיקיית `ui/src/cubes/financial/` (אם לא קיימת)
- [ ] יצירת תיקיות: `components/`, `contexts/`, `hooks/`, `services/`, `scripts/`, `pages/`

##### **3.2.2 יצירת Shared Components**
- [ ] **FinancialTable** - טבלה משותפת עם `PhoenixTable` component
- [ ] **FinancialFilters** - פילטרים משותפים
- [ ] **FinancialSummary** - סיכומים משותפים
- [ ] **FinancialCard** - כרטיסי סיכום משותפים

##### **3.2.3 יצירת State Management**
- [ ] **FinancialContext** - Context API משותף לכל עמודי Financial
- [ ] **useFinancial** Hook - Hook משותף לניהול Financial state

##### **3.2.4 יצירת API Service**
- [ ] **financialApi.js** - כל ה-API calls של Financial Cube
  - `getTradingAccounts()`
  - `getTradingAccount(id)`
  - `getBrokers()` (עתידי)
  - `getCashFlow()` (עתידי)

##### **3.2.5 בנייה מחדש של D16_ACCTS_VIEW**
- [ ] **⚠️ CRITICAL:** יישום לפי `D15_PAGE_TEMPLATE_STAGE_1.html` כבסיס 🛡️ **MANDATORY**
- [ ] **⚠️ CRITICAL:** עקיבה אחרי `index.html` לכל הבלופרינטים 🛡️ **MANDATORY**
- [ ] העתקת תוכן מ-Blueprint ספציפי (לפי האינדקס)
- [ ] המרה ל-React Component תוך שימוש ב-Shared Components
- [ ] שימוש ב-FinancialContext ו-useFinancial Hook
- [ ] אינטגרציה עם financialApi Service
- [ ] שימוש ב-`PhoenixTable` component לטבלאות
- [ ] שמירה על מבנה LEGO System
- [ ] **⚠️ כלל ברזל:** אין סקריפטים בתוך העמוד - כל הסקריפטים בקבצים חיצוניים
- [ ] ארגון קבצי סקריפטים לפי קוביה (`ui/src/cubes/financial/scripts/`)
- [ ] ולידציה: fidelity, RTL, Accessibility

**בלופרינט זמין:** ⚠️ **CRITICAL UPDATE**
- **תבנית בסיס:** `_COMMUNICATION/team_01/team_01_staging/D15_PAGE_TEMPLATE_STAGE_1.html` 🛡️ **MANDATORY**
- **אינדקס:** `_COMMUNICATION/team_01/team_01_staging/index.html` 🛡️ **MANDATORY**
- **בלופרינט ספציפי:** לפי האינדקס - יש לבדוק את הקישור ל-D16_ACCTS_VIEW

**⚠️ חשוב:** יש ליישם לפי `D15_PAGE_TEMPLATE_STAGE_1.html` כבסיס + האינדקס

**עדכון קריטי:** `TEAM_10_BLUEPRINT_CRITICAL_UPDATE.md` 🚨

**Backend API Endpoints:**
- `/api/trading-accounts`
- `/api/trading-accounts/{id}`

---

### **שלב 3.5: ארגון סקריפטים חיצוניים** ⚠️ **כלל ברזל** (P0) 🛡️ **MANDATORY**

**צוותים:** Team 30 (Frontend)

**כלל ברזל:** **אין סקריפטים בתוך העמוד** - כל הסקריפטים חייבים להיות בקבצים חיצוניים. 🛡️ **MANDATORY**

**החלטת האדריכלית:** 🛡️
- **איסור מוחלט** על `<script>` בתוך HTML/JSX
- **חובה** להעביר את כל הלוגיקה של עמודי Auth הקיימים לקבצים חיצוניים

**משימות:**

#### **3.5.1 מבנה קבצי סקריפטים לפי קוביות**

```
ui/src/
├── cubes/
│   ├── identity/
│   │   ├── scripts/          # סקריפטים ספציפיים ל-Identity Cube
│   │   │   ├── identityPageInit.js
│   │   │   └── identityFormHandlers.js
│   │   └── ...
│   ├── financial/
│   │   ├── scripts/          # סקריפטים ספציפיים ל-Financial Cube
│   │   │   ├── financialPageInit.js
│   │   │   └── financialTableHandlers.js
│   │   └── ...
│   └── shared/               # פונקציות משותפות לכל הקוביות
│       └── scripts/
│           ├── commonUtils.js
│           ├── apiHelpers.js
│           └── errorHandlers.js
```

#### **3.5.2 כללים מחייבים**

**✅ חובה:**
- כל הסקריפטים בקבצים חיצוניים (`.js` או `.jsx`)
- ארגון לפי קוביות מודולריות
- פונקציות משותפות בקובץ משותף (`ui/src/cubes/shared/scripts/`)
- אין כפילות קוד - פונקציות משותפות בקובץ אחד בלבד
- עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`:
  - Transformation Layer (`snake_case` ↔ `camelCase`)
  - JS Selectors עם `js-` prefix
  - Audit Trail System
  - JSDoc documentation
  - Icon Standards (SVG inline בלבד)

**❌ אסור:**
- ❌ אין `<script>` tags בתוך HTML/JSX
- ❌ אין inline JavaScript (`onclick`, `onchange`, וכו')
- ❌ אין כפילות קוד - פונקציות משותפות חייבות להיות בקובץ משותף
- ❌ אין שימוש בספריות איקונים חיצוניות

#### **3.5.3 דוגמה למבנה נכון**

**❌ לא נכון - סקריפט בתוך העמוד:**
```html
<!-- ❌ שגיאה! -->
<div class="login-form">
  <button onclick="handleLogin()">התחבר</button>
</div>
<script>
  function handleLogin() {
    // קוד...
  }
</script>
```

**✅ נכון - סקריפט חיצוני:**
```html
<!-- ✅ נכון -->
<div class="login-form">
  <button class="js-login-trigger">התחבר</button>
</div>
<script src="./cubes/identity/scripts/identityPageInit.js"></script>
```

```javascript
// ui/src/cubes/identity/scripts/identityPageInit.js
import { audit } from '../../shared/scripts/commonUtils.js';
import { identityApi } from '../services/identityApi.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.querySelector('.js-login-trigger');
  if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
  }
});

async function handleLogin() {
  // קוד...
}
```

#### **3.5.4 פונקציות משותפות**

**דוגמה:**
```javascript
// ui/src/cubes/shared/scripts/commonUtils.js
/**
 * Common utility functions used across multiple cubes
 */

export function showError(message) {
  // קוד משותף להצגת שגיאות
}

export function validateEmail(email) {
  // קוד משותף לוולידציית אימייל
}
```

**שימוש בקוביות:**
```javascript
// ui/src/cubes/identity/scripts/identityFormHandlers.js
import { showError, validateEmail } from '../../shared/scripts/commonUtils.js';

// שימוש בפונקציות משותפות
```

---

### **שלב 4: ולידציה ואיכות** (P1)

**צוותים:** Team 50 (QA)

**משימות:**

#### **4.1 בדיקות ויזואליות**
- [ ] בדיקת fidelity מול Blueprint (כל עמוד)
- [ ] בדיקת RTL compliance
- [ ] בדיקת Accessibility (ARIA)

#### **4.2 בדיקות ארכיטקטורה**
- [ ] בדיקת עמידה בארכיטקטורה מודולרית
- [ ] בדיקת שימוש ב-Shared Components
- [ ] בדיקת State Management משותף
- [ ] בדיקת Backend Integration ברמת קוביה

#### **4.3 בדיקת עמידה בכל האפיונים והתקנים** ⚠️ **חובה**

**בדיקות JavaScript (`TT2_JS_STANDARDS_PROTOCOL.md`):**
- [ ] **Network Integrity:** כל API Payloads ב-`snake_case` תקין
- [ ] **Console Audit:** Console נקי במצב רגיל, מלא במצב `?debug`
- [ ] **Fidelity Resilience:** שגיאות מוצגות ברכיבי LEGO
- [ ] **Transformation Layer:** כל תקשורת API עוברת דרך `reactToApi` / `apiToReact`
- [ ] **JS Selectors:** כל ה-selectors עם `js-` prefix
- [ ] **אין inline scripts:** אין `<script>` tags בתוך HTML/JSX
- [ ] **אין inline event handlers:** אין `onclick`, `onchange`, וכו'
- [ ] **ארגון קבצים:** כל הסקריפטים בקבצים חיצוניים לפי קוביות
- [ ] **פונקציות משותפות:** אין כפילות קוד - פונקציות משותפות בקובץ משותף
- [ ] **Icon Standards:** כל האיקונים SVG inline פשוטים (אין ספריות חיצוניות)
- [ ] **JSDoc:** כל הפונקציות מתועדות ב-JSDoc עם `@legacyReference`

**בדיקות CSS (`TT2_CSS_STANDARDS_PROTOCOL.md`):**
- [ ] **CSS Hierarchy:** עמידה ב-ITCSS hierarchy
- [ ] **CSS Variables:** כל ה-Variables ב-`phoenix-base.css` בלבד
- [ ] **אין inline CSS:** אין `<style>` tags בתוך HTML/JSX
- [ ] **אין כפילויות:** אין כפילות CSS Variables או classes
- [ ] **BEM Naming:** כל ה-classes עומדים ב-BEM convention
- [ ] **Logical Properties:** שימוש ב-Logical Properties בלבד

**בדיקות HTML/JSX:**
- [ ] **LEGO System:** שימוש ב-`tt-container` > `tt-section` > `tt-section-row`
- [ ] **אין inline styles:** אין `style` attributes
- [ ] **אין inline scripts:** אין `<script>` tags
- [ ] **אין inline event handlers:** אין `onclick`, `onchange`, וכו'

#### **4.4 דוח ולידציה**

**Team 50 יוצר דוח מפורט הכולל:**
- רשימת כל הבדיקות שבוצעו
- תוצאות כל בדיקה (✅ עבר / ❌ נכשל)
- רשימת בעיות שנמצאו
- המלצות לתיקון
- אישור סופי או דחייה

**תבנית דוח:**
- `TEAM_50_LEGO_REFACTOR_VALIDATION_REPORT.md`

---

## 🎨 היררכיית CSS - סדר טעינה קריטי

**חשוב מאוד:** הקבצים חייבים להיטען בסדר הזה:

```html
<!-- 1. Pico CSS FIRST (Framework) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles (Global defaults, CSS Variables) -->
<link rel="stylesheet" href="./phoenix-base.css">

<!-- 3. LEGO Components (Reusable components) -->
<link rel="stylesheet" href="./phoenix-components.css">

<!-- 4. Header Component (If header is used) -->
<link rel="stylesheet" href="./phoenix-header.css">

<!-- 5. Tables System (If tables are used) -->
<link rel="stylesheet" href="./phoenix-tables.css">

<!-- 6. Cards System (If cards are used) -->
<link rel="stylesheet" href="./phoenix-cards.css">

<!-- 7. Dashboard Styles (If dashboard context) -->
<link rel="stylesheet" href="./D15_DASHBOARD_STYLES.css">

<!-- 8. Identity Styles (If auth pages) -->
<link rel="stylesheet" href="./D15_IDENTITY_STYLES.css">

<!-- 9. Page-Specific Styles (If needed) -->
<link rel="stylesheet" href="./D16_ACCTS_VIEW_STYLES.css">
```

**עקרונות היררכיה:**
- **Level 1:** CSS Variables (`:root`) - מוגדרים ב-`phoenix-base.css` בלבד
- **Level 2:** Base Styles - כל האלמנטים הבסיסיים
- **Level 3:** LEGO Components - רכיבים לשימוש חוזר (`tt-container`, `tt-section`, `tt-section-row`)
- **Level 4:** Context-Specific - סגנונות הקשר (Dashboard, Identity)
- **Level 5:** Page-Specific - סגנונות ספציפיים לעמוד

**⚠️ אזהרה:** שינוי סדר הטעינה יגרום לשבירת סגנונות בגלל CSS cascade ו-specificity.

---

## ⚠️ כלל ברזל: ארגון סקריפטים חיצוניים

### **כלל ברזל:** אין סקריפטים בתוך העמוד

**חובה:**
- ✅ כל הסקריפטים חייבים להיות בקבצים חיצוניים (`.js` או `.jsx`)
- ✅ ארגון קבצי סקריפטים לפי קוביות מודולריות
- ✅ פונקציות משותפות בקובץ משותף (`ui/src/cubes/shared/scripts/`)
- ✅ אין כפילות קוד - פונקציות משותפות בקובץ אחד בלבד

**אסור:**
- ❌ אין `<script>` tags בתוך HTML/JSX
- ❌ אין inline JavaScript (`onclick`, `onchange`, `onsubmit`, וכו')
- ❌ אין inline event handlers

### **מבנה קבצי סקריפטים:**

```
ui/src/
├── cubes/
│   ├── identity/
│   │   ├── scripts/          # סקריפטים ספציפיים ל-Identity Cube
│   │   │   ├── identityPageInit.js
│   │   │   └── identityFormHandlers.js
│   │   └── ...
│   ├── financial/
│   │   ├── scripts/          # סקריפטים ספציפיים ל-Financial Cube
│   │   │   ├── financialPageInit.js
│   │   │   └── financialTableHandlers.js
│   │   └── ...
│   └── shared/               # פונקציות משותפות לכל הקוביות
│       └── scripts/
│           ├── commonUtils.js
│           ├── apiHelpers.js
│           └── errorHandlers.js
```

### **עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`:**

**חובה לעמוד בכל הכללים:**
- Transformation Layer (`snake_case` ↔ `camelCase`)
- JS Selectors עם `js-` prefix (לא BEM classes)
- Audit Trail System
- JSDoc documentation עם `@legacyReference`
- Icon Standards (SVG inline בלבד, אין ספריות חיצוניות)

**קישור לפרוטוקול:** `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`

---

## 🔧 תפקידים לפי צוות

### **Team 30 (Frontend Execution)**
- עדכון `global_page_template.jsx` לפי הבלופרינט החדש
- יצירת מבנה קוביות מודולריות (`ui/src/cubes/`)
- יצירת Shared Components לכל קוביה
- יצירת State Management (Context API) לכל קוביה
- יצירת API Services לכל קוביה
- **⚠️ כלל ברזל:** ארגון סקריפטים חיצוניים לפי קוביות (אין סקריפטים בתוך העמוד)
- יצירת פונקציות משותפות בקובץ משותף (לא כפילות קוד)
- המרת HTML Blueprints ל-React Components תוך שימוש ב-Shared Components
- יישום React Logic (state, hooks, context)
- אינטגרציה עם Backend API
- שמירה על מבנה HTML/CSS המדויק מהבלופרינט
- שימוש ב-Transformation Layer (`snake_case` ↔ `camelCase`)
- שמירה על מבנה LEGO System (`tt-container` > `tt-section` > `tt-section-row`)
- עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md` (JS Selectors, Audit Trail, JSDoc, Icon Standards)

### **Team 40 (UI Assets & Design)**
- CSS Audit ומיפוי קבצים ✅ **COMPLETE**
- זיהוי כפילויות ובעיות היררכיה ✅ **COMPLETE**
- תיקון היררכיה וחלוקה ⏳ **IN PROGRESS**
- איחוד CSS Variables ל-`phoenix-base.css`
- הסרת קבצים כפולים
- עדכון `CSS_CLASSES_INDEX.md`
- עבודה עם Team 30 על יצירת Cube Components Library
- ולידציה ויזואלית של Components משותפים

### **Team 31 (Blueprint)** ⚠️ **תפקיד מעודכן**
- **תפקיד חדש:** ייצור בלופרינטים נוספים לעמודים הבאים
- **לא מעורב בתהליך הבנייה מחדש** - רק ספק Blueprints
- **מטרה:** לייצר בלופרינטים בצורה שתהיה אופטימלית לשילוב במבנה החדש שיצרו Team 30 + Team 40
- **עבודה עתידית:** בלופרינטים לעמודים נוספים לפי המטריצה

---

## 📋 החלטות נדרשות

### **1. גישת CSS (שלב 1.3)** ✅ **החלטה**
**החלטה:** CSS Classes מותאמים אישית (להתאים לבלופרינט)

---

### **2. גישת Filter System (שלב 1.3)** ✅ **החלטה**
**החלטה:** React Context (`PhoenixFilterContext`) - לשמור על פונקציונליות קיימת

---

### **3. אישור CSS Refactor (שלב 2.3)** ✅ **אושר**
**החלטה:** ✅ **אושר** - כל התיקונים מוצדקים ונדרשים

---

### **4. Blueprint D16_ACCTS_VIEW (שלב 3.2)**
**שאלה:** איזה Blueprint להשתמש?

**אפשרויות:**
- **A:** Blueprint מ-Team 01 (`team_01_staging/D16_ACCTS_VIEW.html`)
- **B:** Blueprint מ-Team 31 (`team_31_staging/D16_ACCTS_VIEW.html`)

**המלצה:** תיאום בין Team 01 ו-Team 31 לבחירת Blueprint סופי (או שילוב)

---

## ✅ Checklist כללי

### **שלב 1: תבנית בסיס**
- [x] החלטה על גישת CSS (CSS Classes מותאמים אישית) ✅
- [x] החלטה על גישת Filter (React Context) ✅
- [ ] עדכון `global_page_template.jsx` לפי ההחלטות
- [ ] וידוא מבנה LEGO System נכון
- [ ] שמירה על פונקציונליות קיימת

### **שלב 2: היררכיית CSS**
- [x] בדיקה ומיפוי קבצי CSS ✅
- [x] זיהוי כפילויות ✅
- [x] אישור תיקונים ✅
- [ ] איחוד CSS Variables ל-`phoenix-base.css`
- [ ] הסרת קבצים כפולים
- [ ] הסרת inline CSS מ-JSX
- [ ] עדכון `CSS_CLASSES_INDEX.md`

### **שלב 2.5: Cube Components Library** ⭐ **חדש**
- [ ] זיהוי Components משותפים לכל קוביה
- [ ] יצירת מבנה תיקיות `ui/src/cubes/`
- [ ] יצירת Shared Components ל-Identity Cube
- [ ] יצירת Shared Components ל-Financial Cube
- [ ] תיעוד Components

### **שלב 3: בנייה מחדש לפי קוביות**

#### **Identity Cube (D15):**
- [ ] יצירת Cube Structure
- [ ] יצירת Shared Components (AuthForm, AuthValidation, AuthErrorHandler, AuthLayout)
- [ ] יצירת AuthContext ו-useAuth Hook
- [ ] יצירת identityApi Service
- [ ] בנייה מחדש של D15_LOGIN
- [ ] בנייה מחדש של D15_REGISTER
- [ ] בנייה מחדש של D15_RESET_PWD
- [ ] בנייה מחדש של D15_PROFILE
- [ ] בנייה מחדש של D15_INDEX

#### **Financial Cube (D16):**
- [ ] יצירת Cube Structure
- [ ] יצירת Shared Components (FinancialTable, FinancialFilters, FinancialSummary, FinancialCard)
- [ ] יצירת FinancialContext ו-useFinancial Hook
- [ ] יצירת financialApi Service
- [ ] בנייה מחדש של D16_ACCTS_VIEW

### **שלב 3.5: ארגון סקריפטים חיצוניים** ⚠️ **כלל ברזל**
- [ ] יצירת מבנה תיקיות `scripts/` לכל קוביה
- [ ] יצירת תיקיית `shared/scripts/` לפונקציות משותפות
- [ ] העברת כל הסקריפטים לקבצים חיצוניים
- [ ] הסרת כל ה-`<script>` tags מתוך HTML/JSX
- [ ] הסרת כל ה-inline event handlers (`onclick`, `onchange`, וכו')
- [ ] ארגון פונקציות משותפות בקובץ משותף
- [ ] וידוא עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`

### **שלב 4: ולידציה ואיכות** ⚠️ **חובה**
- [ ] בדיקת fidelity מול Blueprint
- [ ] בדיקת RTL compliance
- [ ] בדיקת Accessibility
- [ ] בדיקת עמידה בארכיטקטורה מודולרית
- [ ] **בדיקת עמידה בכל האפיונים והתקנים** (Team 50):
  - [ ] JavaScript Standards (`TT2_JS_STANDARDS_PROTOCOL.md`)
  - [ ] CSS Standards (`TT2_CSS_STANDARDS_PROTOCOL.md`)
  - [ ] HTML/JSX Standards (LEGO System, אין inline scripts/styles)
  - [ ] ארגון קבצים (סקריפטים חיצוניים, פונקציות משותפות)

---

## 🔗 קישורים רלוונטיים

### **בלופרינטים:**
- `_COMMUNICATION/team_31/team_31_staging/` - כל הבלופרינטים מ-Team 31
- `_COMMUNICATION/team_01/team_01_staging/D16_ACCTS_VIEW.html` - Blueprint D16 מ-Team 01

### **תיעוד:**
- `_COMMUNICATION/team_31/TEAM_31_BATCH_1_HANDOFF_TO_TEAM_10.md` - Handoff Batch 1
- `_COMMUNICATION/team_31/team_31_staging/CSS_ARCHITECTURE_HIERARCHY.md` - ארכיטקטורת CSS
- `_COMMUNICATION/team_40/TEAM_40_TO_TEAM_10_CSS_AUDIT_FINDINGS.md` - ממצאי Audit
- `documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_CSS_HIERARCHY_AUDIT.md` - דוח Audit מלא
- `_COMMUNICATION/team_10/TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md` - בדיקת התאמה לארכיטקטורה

### **פרוטוקולים:**
- `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md` - JavaScript Standards (כלל ברזל: אין סקריפטים בתוך העמוד)
- `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md` - CSS Standards

### **ארכיטקטורה:**
- `documentation/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md` - LEGO System Spec
- `documentation/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md` - Backend LEGO Architecture
- `documentation/01-ARCHITECTURE/TT2_BACKEND_CUBE_INVENTORY.md` - Cube Inventory
- `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` - Page Tracker (קוביות מוגדרות)

---

## 📊 סטטוס נוכחי

### **שלב 1: תבנית בסיס** ⏳ **IN PROGRESS**
- החלטות: ✅ CSS Classes, ✅ React Context
- Team 30 ממשיך בעבודה

### **שלב 2: היררכיית CSS** ⏳ **IN PROGRESS**
- Team 40 סיים Audit ✅
- אישור תיקונים: ✅ **APPROVED**
- Team 40 ממשיך בעבודה

### **שלב 2.5: Cube Components Library** ⏸️ **PENDING**
- ממתין להשלמת שלבים 1 ו-2

### **שלב 3: בנייה מחדש לפי קוביות** ⏸️ **PENDING**
- ממתין להשלמת שלבים 1, 2, 2.5

### **שלב 4: ולידציה** ⏸️ **PENDING**
- ממתין להשלמת שלב 3

---

## 🎯 הצעדים הבאים

1. **מיידי:** Team 30 ממשיך בעבודה על שלב 1.3 (תבנית בסיס)
2. **מיידי:** Team 40 ממשיך בעבודה על שלב 2.4 (תיקון היררכיית CSS)
3. **לאחר השלמה:** התחלת שלב 2.5 (Cube Components Library)
4. **לאחר השלמה:** התחלת שלב 3 (בנייה מחדש לפי קוביות)
5. **⚠️ חובה:** שלב 3.5 - ארגון סקריפטים חיצוניים (כלל ברזל)
6. **לאחר השלמה:** התחלת שלב 4 (ולידציה מקיפה ע"י Team 50)

---

## 📝 שינויים מהגרסה הקודמת

### **שינויים עיקריים:**
1. ✅ **ארגון מחדש לפי קוביות מודולריות** - שלב 3 עבר ארגון מחדש
2. ✅ **הוספת שלב 2.5** - יצירת Cube Components Library
3. ✅ **עדכון תפקיד Team 31** - רק בלופרינטים, לא מעורב בתהליך הבנייה מחדש
4. ✅ **הוספת Backend Integration** - API Services לכל קוביה
5. ✅ **הוספת State Management** - Context API לכל קוביה
6. ✅ **החלטות** - CSS Classes, React Context, אישור CSS Refactor

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-02 (עודכן עם Fluid Design Mandate)  
**Status:** 🟢 **ACTIVE - LEGO ARCHITECTURE COMPLIANT - FLUID DESIGN MANDATORY**

**עדכונים אחרונים:**
- 2026-02-02: הוספת שלב 2.6 - יישום Fluid Design (הסרת media queries)
- 2026-02-02: עדכון לפי החלטות אדריכליות (`ARCHITECT_DECISION_LEGO_CUBES.md`, `ARCHITECT_RESPONSIVE_CHARTER.md`)
- 2026-02-02: עדכון לפי החלטה אדריכלית סופית (`ARCHITECT_DECISION_LEGO_CUBES_FINAL.md`) - הוספת משימה רטרואקטיבית 3.1.6 (Refactor Auth Scripts)
- 2026-02-02: 🛡️ **FINAL GOVERNANCE LOCK** - כל חריגה תגרור פסילת G-Bridge מיידית

**log_entry | Team 10 | CSS_BLUEPRINT_REFACTOR_PLAN_V2 | UPDATED_WITH_FLUID_DESIGN | 2026-02-02**
