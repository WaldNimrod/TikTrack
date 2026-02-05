# 📡 הודעה: Team 10 → Team 30 (Frontend) | תוכנית LEGO Refactor V2

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend Execution)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** LEGO_REFACTOR_PLAN_V2 | Status: 🟢 **ACTIVE**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 📋 Executive Summary

התוכנית לבנייה מחדש עודכנה בהתאם לארכיטקטורת LEGO מודולרית. תפקידכם עודכן - אתם אחראים על יצירת מבנה קוביות מודולריות ובנייה מחדש של העמודים לפי קוביות.

---

## 🎯 תפקידכם המעודכן

### **אחריות מרכזית:**
1. **עדכון תבנית בסיס** (`global_page_template.jsx`) - שלב 1.3
2. **יצירת מבנה קוביות מודולריות** (`ui/src/cubes/`) - שלב 2.5
3. **יצירת Shared Components** לכל קוביה - שלב 2.5
4. **יצירת State Management** (Context API) לכל קוביה - שלב 3
5. **יצירת API Services** לכל קוביה - שלב 3
6. **⚠️ כלל ברזל: ארגון סקריפטים חיצוניים** - שלב 3.5
   - אין סקריפטים בתוך העמוד - כל הסקריפטים בקבצים חיצוניים
   - ארגון לפי קוביות מודולריות
   - פונקציות משותפות בקובץ משותף (לא כפילות קוד)
7. **בנייה מחדש של עמודים** לפי קוביות מודולריות - שלב 3

---

## 📊 משימות מיידיות

### **שלב 1.3: עדכון תבנית בסיס** ⏳ **IN PROGRESS**

**החלטות:**
- ✅ **CSS:** CSS Classes מותאמים אישית (לא Tailwind)
- ✅ **Filter:** React Context (`PhoenixFilterContext`) - לשמור על פונקציונליות קיימת

**משימות:**
- [ ] עדכון `global_page_template.jsx` לפי הבלופרינט החדש
- [ ] יישום מבנה LEGO System נכון (`tt-container` > `tt-section` > `tt-section-row`)
- [ ] שמירה על פונקציונליות קיימת (`PhoenixFilterContext`)

**Blueprint:**
- `_COMMUNICATION/team_31/team_31_staging/D15_PAGE_TEMPLATE.html`

---

### **שלב 2.5: יצירת Cube Components Library** ⏸️ **PENDING** (לאחר השלמת שלב 2)

**מטרה:** זיהוי ויצירת Components משותפים ברמת קוביה לפני בנייה מחדש של העמודים.

**תהליך:**

#### **2.5.1 זיהוי Components משותפים**

**Identity & Authentication Cube (D15):**
- [ ] **AuthForm** - טופס משותף (Login, Register, Reset Password)
- [ ] **AuthValidation** - ולידציה משותפת (PhoenixSchema)
- [ ] **AuthErrorHandler** - טיפול בשגיאות משותף
- [ ] **AuthLayout** - Layout משותף לעמודי Auth

**Financial Cube (D16, D18, D21):**
- [ ] **FinancialTable** - טבלה משותפת עם `PhoenixTable` component
- [ ] **FinancialFilters** - פילטרים משותפים
- [ ] **FinancialSummary** - סיכומים משותפים
- [ ] **FinancialCard** - כרטיסי סיכום משותפים

#### **2.5.2 יצירת מבנה תיקיות**

```
ui/src/
├── cubes/
│   ├── identity/              # Identity & Authentication Cube
│   │   ├── components/        # Components משותפים
│   │   ├── contexts/          # State Management משותף
│   │   ├── hooks/             # Hooks משותפים
│   │   ├── services/          # API Services
│   │   └── pages/             # עמודים של הקוביה
│   └── financial/             # Financial Cube
│       ├── components/        # Components משותפים
│       ├── contexts/          # State Management משותף
│       ├── hooks/             # Hooks משותפים
│       ├── services/          # API Services
│       └── pages/             # עמודים של הקוביה
```

---

### **שלב 3: בנייה מחדש לפי קוביות מודולריות** ⏸️ **PENDING**

#### **3.1 Identity & Authentication Cube (D15)**

**עמודים:**
- D15_LOGIN
- D15_REGISTER
- D15_RESET_PWD
- D15_PROFILE
- D15_INDEX

**תהליך:**

##### **3.1.1 יצירת Cube Structure**
- [ ] יצירת תיקיית `ui/src/cubes/identity/`
- [ ] יצירת תיקיות: `components/`, `contexts/`, `hooks/`, `services/`, `pages/`

##### **3.1.2 יצירת Shared Components**
- [ ] **AuthForm.jsx** - טופס משותף עם Props גמישים
- [ ] **AuthValidation.jsx** - ולידציה משותפת (PhoenixSchema)
- [ ] **AuthErrorHandler.jsx** - טיפול בשגיאות משותף
- [ ] **AuthLayout.jsx** - Layout משותף

##### **3.1.3 יצירת State Management**
- [ ] **AuthContext.jsx** - Context API משותף לכל עמודי Identity
- [ ] **useAuth.js** - Hook משותף לניהול Auth state

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
- [ ] העתקת HTML Blueprint מ-`team_31_staging/`
- [ ] המרה ל-React Component תוך שימוש ב-Shared Components
- [ ] שימוש ב-AuthContext ו-useAuth Hook
- [ ] אינטגרציה עם identityApi Service
- [ ] שמירה על מבנה LEGO System (`tt-container` > `tt-section` > `tt-section-row`)
- [ ] **⚠️ כלל ברזל:** אין סקריפטים בתוך העמוד - כל הסקריפטים בקבצים חיצוניים (`ui/src/cubes/identity/scripts/`)
- [ ] ולידציה: fidelity, RTL, Accessibility

**בלופרינטים זמינים:**
- `_COMMUNICATION/team_31/team_31_staging/D15_LOGIN.html`
- `_COMMUNICATION/team_31/team_31_staging/D15_REGISTER.html`
- `_COMMUNICATION/team_31/team_31_staging/D15_RESET_PWD.html`
- `_COMMUNICATION/team_31/team_31_staging/D15_PROFILE.html`
- `_COMMUNICATION/team_31/team_31_staging/D15_INDEX.html`

**Backend API Endpoints:**
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/reset-password`
- `/api/users/me`
- `/api/users/me` (PUT)
- `/api/users/me/password` (PUT)

---

#### **3.2 Financial Cube (D16)**

**עמודים:**
- D16_ACCTS_VIEW (Trading Accounts)

**תהליך:**

##### **3.2.1 יצירת Cube Structure**
- [ ] יצירת תיקיית `ui/src/cubes/financial/`
- [ ] יצירת תיקיות: `components/`, `contexts/`, `hooks/`, `services/`, `pages/`

##### **3.2.2 יצירת Shared Components**
- [ ] **FinancialTable.jsx** - טבלה משותפת עם `PhoenixTable` component
- [ ] **FinancialFilters.jsx** - פילטרים משותפים
- [ ] **FinancialSummary.jsx** - סיכומים משותפים
- [ ] **FinancialCard.jsx** - כרטיסי סיכום משותפים

##### **3.2.3 יצירת State Management**
- [ ] **FinancialContext.jsx** - Context API משותף לכל עמודי Financial
- [ ] **useFinancial.js** - Hook משותף לניהול Financial state

##### **3.2.4 יצירת API Service**
- [ ] **financialApi.js** - כל ה-API calls של Financial Cube
  - `getTradingAccounts()`
  - `getTradingAccount(id)`

##### **3.2.5 בנייה מחדש של D16_ACCTS_VIEW**
- [ ] העתקת HTML Blueprint מ-`team_31_staging/` או `team_01_staging/`
- [ ] המרה ל-React Component תוך שימוש ב-Shared Components
- [ ] שימוש ב-FinancialContext ו-useFinancial Hook
- [ ] אינטגרציה עם financialApi Service
- [ ] שימוש ב-`PhoenixTable` component לטבלאות
- [ ] שמירה על מבנה LEGO System
- [ ] **⚠️ כלל ברזל:** אין סקריפטים בתוך העמוד - כל הסקריפטים בקבצים חיצוניים (`ui/src/cubes/financial/scripts/`)
- [ ] ולידציה: fidelity, RTL, Accessibility

---

### **שלב 3.5: ארגון סקריפטים חיצוניים** ⚠️ **כלל ברזל** ⏸️ **PENDING**

**כלל ברזל:** **אין סקריפטים בתוך העמוד** - כל הסקריפטים חייבים להיות בקבצים חיצוניים.

**משימות:**

#### **3.5.1 יצירת מבנה תיקיות**
- [ ] יצירת תיקיית `ui/src/cubes/shared/scripts/` לפונקציות משותפות
- [ ] יצירת תיקיית `ui/src/cubes/identity/scripts/` לסקריפטים של Identity Cube
- [ ] יצירת תיקיית `ui/src/cubes/financial/scripts/` לסקריפטים של Financial Cube

#### **3.5.2 העברת סקריפטים לקבצים חיצוניים**
- [ ] זיהוי כל ה-`<script>` tags בתוך HTML/JSX
- [ ] העברת כל הסקריפטים לקבצים חיצוניים לפי קוביה
- [ ] הסרת כל ה-`<script>` tags מתוך HTML/JSX
- [ ] הסרת כל ה-inline event handlers (`onclick`, `onchange`, `onsubmit`, וכו')

#### **3.5.3 ארגון פונקציות משותפות**
- [ ] זיהוי פונקציות המשמשות יותר מקוביה אחת
- [ ] העברת פונקציות משותפות ל-`ui/src/cubes/shared/scripts/`
- [ ] וידוא אין כפילות קוד

#### **3.5.4 עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`**
- [ ] Transformation Layer (`snake_case` ↔ `camelCase`)
- [ ] JS Selectors עם `js-` prefix (לא BEM classes)
- [ ] Audit Trail System
- [ ] JSDoc documentation עם `@legacyReference`
- [ ] Icon Standards (SVG inline בלבד, אין ספריות חיצוניות)

**בלופרינט זמין:**
- `_COMMUNICATION/team_31/team_31_staging/D16_ACCTS_VIEW.html`
- `_COMMUNICATION/team_01/team_01_staging/D16_ACCTS_VIEW.html`

**Backend API Endpoints:**
- `/api/trading-accounts`
- `/api/trading-accounts/{id}`

---

## 🎨 עקרונות חשובים

### **LEGO System:**
- שמירה על מבנה: `tt-container` > `tt-section` > `tt-section-row`
- אין CSS מותאם אישית - רק Logical Properties
- שימוש ב-`phoenix-components.css` ל-LEGO Components

### **מודולריות:**
- כל קוביה היא יחידה עצמאית
- Components משותפים ברמת קוביה
- State Management משותף ברמת קוביה
- Backend Integration ברמת קוביה

### **Transformation Layer:**
- שימוש ב-Transformation Layer (`snake_case` ↔ `camelCase`)
- Backend API: `snake_case`
- Frontend: `camelCase`

### **⚠️ כלל ברזל: ארגון סקריפטים חיצוניים**

**חובה:**
- ✅ **אין סקריפטים בתוך העמוד** - כל הסקריפטים חייבים להיות בקבצים חיצוניים
- ✅ ארגון קבצי סקריפטים לפי קוביות מודולריות (`ui/src/cubes/{cube_name}/scripts/`)
- ✅ פונקציות משותפות בקובץ משותף (`ui/src/cubes/shared/scripts/`)
- ✅ אין כפילות קוד - פונקציות משותפות בקובץ אחד בלבד

**אסור:**
- ❌ אין `<script>` tags בתוך HTML/JSX
- ❌ אין inline JavaScript (`onclick`, `onchange`, `onsubmit`, וכו')
- ❌ אין inline event handlers

**עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`:**
- Transformation Layer (`snake_case` ↔ `camelCase`)
- JS Selectors עם `js-` prefix (לא BEM classes)
- Audit Trail System
- JSDoc documentation עם `@legacyReference`
- Icon Standards (SVG inline בלבד, אין ספריות חיצוניות)

**קישור לפרוטוקול:** `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`

---

## ✅ Checklist

### **שלב 1.3: תבנית בסיס**
- [x] החלטה על גישת CSS ✅
- [x] החלטה על גישת Filter ✅
- [ ] עדכון `global_page_template.jsx`
- [ ] וידוא מבנה LEGO System נכון

### **שלב 2.5: Cube Components Library** (לאחר שלב 2)
- [ ] זיהוי Components משותפים
- [ ] יצירת מבנה תיקיות `ui/src/cubes/`
- [ ] יצירת Shared Components ל-Identity Cube
- [ ] יצירת Shared Components ל-Financial Cube

### **שלב 3: בנייה מחדש לפי קוביות**
- [ ] Identity Cube - Structure, Components, Context, API Service, Pages
- [ ] Financial Cube - Structure, Components, Context, API Service, Pages

### **שלב 3.5: ארגון סקריפטים חיצוניים** ⚠️ **כלל ברזל**
- [ ] יצירת מבנה תיקיות `scripts/` לכל קוביה
- [ ] יצירת תיקיית `shared/scripts/` לפונקציות משותפות
- [ ] העברת כל הסקריפטים לקבצים חיצוניים
- [ ] הסרת כל ה-`<script>` tags מתוך HTML/JSX
- [ ] הסרת כל ה-inline event handlers
- [ ] ארגון פונקציות משותפות בקובץ משותף
- [ ] וידוא עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`

---

## 🔗 קישורים רלוונטיים

### **תוכנית מלאה:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית מעודכנת מלאה

### **בלופרינטים:**
- `_COMMUNICATION/team_31/team_31_staging/` - כל הבלופרינטים

### **תיעוד:**
- `documentation/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md` - LEGO System Spec
- `documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md` - Design Patterns
- `_COMMUNICATION/team_31/team_31_staging/CSS_ARCHITECTURE_HIERARCHY.md` - CSS Architecture

---

## 🎯 הצעדים הבאים

1. **מיידי:** המשך עבודה על שלב 1.3 (תבנית בסיס)
2. **לאחר שלב 2:** התחלת שלב 2.5 (Cube Components Library)
3. **לאחר שלב 2.5:** התחלת שלב 3 (בנייה מחדש לפי קוביות)

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🟢 **ACTIVE - AWAITING YOUR PROGRESS**

**log_entry | Team 10 | LEGO_REFACTOR_V2 | TO_TEAM_30 | 2026-02-01**
