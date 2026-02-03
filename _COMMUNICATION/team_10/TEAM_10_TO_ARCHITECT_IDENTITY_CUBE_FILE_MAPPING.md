# 📡 דוח מיפוי קבצים: קובית Identity

**From:** Team 10 (The Gateway)  
**To:** Chief Architect (Gemini Bridge)  
**Date:** 2026-02-02  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** IDENTITY_CUBE_FILE_MAPPING | Status: ✅ **COMPLETE**  
**Priority:** 🔴 **URGENT - BLOCKING REVIEW**

---

## 📋 הקשר

דוח זה מספק מיפוי מדויק של כל הקבצים המיישמים את קובית Identity, כולל נתיבים מדויקים, קישורים, וניתוח Dependency Isolation.

---

## 🗺️ טבלת מיפוי קבצים

| פונקציונליות נדרשת | תיאור לבדיקה | שם קובץ בפועל | נתיב מדויק | קישור |
|---------------------|---------------|---------------|-------------|-------|
| **Logic & State** | ניהול מצב האוטנטיקציה (React Hooks) | `useAuthValidation.js` | `ui/src/cubes/identity/hooks/useAuthValidation.js` | [קישור](#useauthvalidationjs) |
| **Data Contract** | שכבת ה-Transformation (API ↔ UI) | `transformers.js` | `ui/src/cubes/shared/utils/transformers.js` | [קישור](#transformersjs) |
| **API Interface** | מימוש הקריאות לשרת (Identity API) | `auth.js` | `ui/src/cubes/identity/services/auth.js` | [קישור](#authjs) |
| **Blueprint UI** | דף הכניסה הסופי (Refactor V2) | `LoginForm.jsx` | `ui/src/cubes/identity/components/auth/LoginForm.jsx` | [קישור](#loginformjsx) |
| **DNA Core** | מקור האמת למשתנים (SSOT) | `phoenix-base.css` | `ui/src/styles/phoenix-base.css` | [קישור](#phoenix-basecss) |
| **Logic Validation** | ריכוז חוקי הולידציה של הקוביה | `authSchema.js` | `ui/src/logic/schemas/authSchema.js` | [קישור](#authschemajs) |

---

## 📁 פירוט קבצים

### **1. Logic & State - useAuthValidation.js**

**נתיב:** `ui/src/cubes/identity/hooks/useAuthValidation.js`

**תיאור:**
- React Hook לניהול ולידציה של טופסי Auth
- תמיכה ב-Schema-based validation
- Field-level ו-form-level validation
- Integration עם Audit Trail System

**תלות (Dependencies):**
- ✅ `../../../../utils/audit.js` - Audit Trail (מיקום חוקי - utils)
- ✅ `../../../../utils/debug.js` - Debug Mode (מיקום חוקי - utils)

**סטטוס:** ✅ **COMPLIANT** - אין imports מחוץ ל-cubes/shared (חוץ מ-utils שמותר)

---

### **2. Data Contract - transformers.js**

**נתיב:** `ui/src/cubes/shared/utils/transformers.js`

**תיאור:**
- Transformation Layer - המרה בין Backend (snake_case) ל-Frontend (camelCase)
- פונקציות: `apiToReact()`, `reactToApi()`, `reactToApiPasswordChange()`
- SSOT לכל התמורות במערכת

**תלות (Dependencies):**
- ✅ אין תלויות חיצוניות (pure functions)

**סטטוס:** ✅ **COMPLIANT** - קובץ משותף (shared), מיקום חוקי

---

### **3. API Interface - auth.js**

**נתיב:** `ui/src/cubes/identity/services/auth.js`

**תיאור:**
- שירות לניהול אימות משתמשים ותקשורת עם Backend API
- מנהל את כל תהליכי האימות (login, register, logout, refresh token)
- Axios interceptors לטיפול ב-token refresh
- Integration עם Transformation Layer

**תלות (Dependencies):**
- ✅ `axios` - External library (מותר)
- ✅ `../../shared/utils/transformers.js` - Shared cube (מיקום חוקי)
- ✅ `../../../utils/audit.js` - Audit Trail (מיקום חוקי - utils)
- ✅ `../../../utils/debug.js` - Debug Mode (מיקום חוקי - utils)

**סטטוס:** ✅ **COMPLIANT** - אין imports מחוץ ל-cubes/shared (חוץ מ-utils שמותר)

---

### **4. Blueprint UI - LoginForm.jsx**

**נתיב:** `ui/src/cubes/identity/components/auth/LoginForm.jsx`

**תיאור:**
- רכיב React להתחברות משתמשים
- מימוש Pixel Perfect של דף ההתחברות בהתבסס על Blueprint של Team 31
- Validation, error handling, loading states
- Integration עם Auth Service ו-Validation Schema

**תלות (Dependencies):**
- ✅ `react`, `react-router-dom` - External libraries (מותר)
- ✅ `../../services/auth.js` - Identity cube service (מיקום חוקי)
- ✅ `../../../../utils/audit.js` - Audit Trail (מיקום חוקי - utils)
- ✅ `../../../../utils/debug.js` - Debug Mode (מיקום חוקי - utils)
- ✅ `../../../../logic/schemas/authSchema.js` - Validation schema (מיקום חוקי - logic)
- ✅ `../../../../utils/errorHandler.js` - Error handling (מיקום חוקי - utils)
- ✅ `../../../../components/core/PageFooter.jsx` - Core component (מיקום חוקי - components/core)

**סטטוס:** ✅ **COMPLIANT** - אין imports מחוץ ל-cubes/shared (חוץ מ-utils, logic, components/core שמותר)

---

### **5. DNA Core - phoenix-base.css**

**נתיב:** `ui/src/styles/phoenix-base.css`

**תיאור:**
- מקור האמת היחיד (SSOT) לכל משתני CSS
- Global Base Styles לכל העמודים במערכת
- CSS Variables (:root)
- Base Typography, Form Elements, Buttons
- Fluid Design עם clamp() (ללא media queries)

**תלות (Dependencies):**
- ✅ אין תלויות (CSS standalone)

**סטטוס:** ✅ **COMPLIANT** - SSOT, מיקום חוקי

---

### **6. Logic Validation - authSchema.js**

**נתיב:** `ui/src/logic/schemas/authSchema.js`

**תיאור:**
- ריכוז חוקי הולידציה של קובית Identity
- פונקציות validation: `validateUsername`, `validatePassword`, `validateLoginForm`, `validateRegisterForm`, `validatePasswordChangeForm`
- Integration עם `userSchema.js` (validateEmail, validatePhoneNumber)

**תלות (Dependencies):**
- ✅ `./userSchema.js` - Shared schema (מיקום חוקי - logic/schemas)

**סטטוס:** ✅ **COMPLIANT** - מיקום חוקי (logic/schemas)

---

## 📊 ניתוח Dependency Isolation

### **כלים לבדיקת Isolation:**

1. **Manual Code Review** - בדיקת כל ה-imports בקובצי Identity
2. **ESLint Rules** - כללי ESLint למניעת imports לא חוקיים (אם מוגדרים)
3. **TypeScript Path Mapping** - אם היה TypeScript, אפשר היה להגדיר path aliases

### **ממצאים:**

#### ✅ **Imports חוקיים (מותר):**
- `utils/` - Audit Trail, Debug Mode, Error Handler (מיקום חוקי)
- `logic/schemas/` - Validation schemas (מיקום חוקי)
- `components/core/` - Core components (מיקום חוקי)
- `cubes/shared/` - Shared cube utilities (מיקום חוקי)
- External libraries - React, Axios, React Router (מותר)

#### ⚠️ **הערות:**
- **ProfileView.jsx** מייבא `apiKeysService` מ-`../../../../services/apiKeys.js` - זה לא חלק מקובית Identity, אבל זה מיקום חוקי (services)
- **ProfileView.jsx** מייבא `UnifiedHeader` מ-`components/core` - זה מיקום חוקי

### **המלצות:**
1. ✅ **כל ה-imports חוקיים** - אין imports מחוץ ל-cubes/shared (חוץ מ-utils, logic, components/core שמותר)
2. ✅ **אין circular dependencies** - כל ה-imports חד-כיווניים
3. ✅ **Shared utilities** - שימוש נכון ב-`cubes/shared/utils/transformers.js`

---

## 🔍 בדיקת External Scripts (כלל הברזל)

### **תוצאות בדיקה:**

✅ **אין תגי `<script>` בקובצי Identity!**

**קבצים שנבדקו:**
- ✅ `ui/src/cubes/identity/components/auth/LoginForm.jsx` - אין `<script>`
- ✅ `ui/src/cubes/identity/components/auth/RegisterForm.jsx` - אין `<script>`
- ✅ `ui/src/cubes/identity/components/auth/PasswordResetFlow.jsx` - אין `<script>`
- ✅ `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` - אין `<script>`
- ✅ `ui/src/cubes/identity/components/profile/ProfileView.jsx` - אין `<script>`
- ✅ `ui/src/cubes/identity/components/profile/PasswordChangeForm.jsx` - אין `<script>`
- ✅ `ui/src/cubes/identity/components/AuthErrorHandler.jsx` - אין `<script>`
- ✅ `ui/src/cubes/identity/components/AuthLayout.jsx` - אין `<script>`

**סטטוס:** ✅ **COMPLIANT** - כלל הברזל נשמר במלואו!

---

## 🏰 G-Bridge - SANDBOX_INDEX.html

### **מיקום:**
`_COMMUNICATION/team_01/team_01_staging/sandbox/SANDBOX_INDEX.html`

### **סטטוס רכיבי Identity:**

| רכיב | סטטוס G-Bridge | הערות |
|------|----------------|-------|
| **D15_LOGIN.html** | 💎 **BLUEPRINT READY** | Blueprint מוכן |
| **D15_REGISTER.html** | 💎 **BLUEPRINT READY** | Blueprint מוכן |
| **D15_RESET_PWD.html** | 💎 **BLUEPRINT READY** | Blueprint מוכן |
| **D15_PROF_VIEW.html** | ✅ **APPROVED (STAGING)** | מאושר בסטייג'ינג |

### **ניתוח:**

#### ✅ **דפים (Pages):**
- כל דפי Identity מופיעים ב-SANDBOX_INDEX.html
- סטטוסים מעודכנים

#### ⚠️ **רכיבים (Components):**
- **לא מופיעים** - SANDBOX_INDEX.html כולל רק דפים (HTML files)
- **רכיבי React** (LoginForm.jsx, RegisterForm.jsx, וכו') לא מופיעים ב-SANDBOX_INDEX.html

### **המלצות:**
1. ✅ **דפים** - כל דפי Identity מופיעים ב-SANDBOX_INDEX.html
2. ⚠️ **רכיבים** - רכיבי React לא מופיעים ב-SANDBOX_INDEX.html (זה נורמלי - G-Bridge בודק HTML files, לא React components)
3. ✅ **סטטוסים** - כל הסטטוסים מעודכנים

---

## 📋 סיכום תשובות לשאלות האדריכלית

### **1. Dependency Isolation:**

**כלים:**
- ✅ Manual Code Review - בוצע
- ⚠️ ESLint Rules - לא מוגדרים (המלצה: להגדיר)
- ✅ Code Structure - מבנה ברור (cubes/identity, cubes/shared, utils, logic, components/core)

**תוצאות:**
- ✅ **כל ה-imports חוקיים** - אין imports מחוץ ל-cubes/shared (חוץ מ-utils, logic, components/core שמותר)
- ✅ **אין circular dependencies**
- ✅ **Shared utilities** - שימוש נכון ב-`cubes/shared/utils/transformers.js`

### **2. External Scripts:**

**תוצאות:**
- ✅ **אין תגי `<script>` בקובצי Identity!**
- ✅ **כלל הברזל נשמר במלואו**
- ✅ **כל הלוגיקה בקבצי JS חיצוניים**

### **3. G-Bridge:**

**תוצאות:**
- ✅ **דפים** - כל דפי Identity מופיעים ב-SANDBOX_INDEX.html
- ⚠️ **רכיבים** - רכיבי React לא מופיעים (זה נורמלי - G-Bridge בודק HTML files)
- ✅ **סטטוסים** - כל הסטטוסים מעודכנים

---

## 📎 קבצים נוספים בקובית Identity

### **רכיבים נוספים:**

| קובץ | נתיב | תיאור |
|------|------|-------|
| **RegisterForm.jsx** | `ui/src/cubes/identity/components/auth/RegisterForm.jsx` | רכיב הרשמה |
| **PasswordResetFlow.jsx** | `ui/src/cubes/identity/components/auth/PasswordResetFlow.jsx` | זרימת איפוס סיסמה |
| **ProtectedRoute.jsx** | `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` | Route Guard |
| **AuthErrorHandler.jsx** | `ui/src/cubes/identity/components/AuthErrorHandler.jsx` | טיפול בשגיאות Auth |
| **AuthLayout.jsx** | `ui/src/cubes/identity/components/AuthLayout.jsx` | Layout לעמודי Auth |
| **PasswordChangeForm.jsx** | `ui/src/cubes/identity/components/profile/PasswordChangeForm.jsx` | טופס שינוי סיסמה |
| **ProfileView.jsx** | `ui/src/cubes/identity/components/profile/ProfileView.jsx` | תצוגת פרופיל |

---

## ✅ סטטוס סופי

- ✅ **מיפוי קבצים** - הושלם
- ✅ **Dependency Isolation** - נבדק ואושר
- ✅ **External Scripts** - נבדק ואושר (אין `<script>` tags)
- ✅ **G-Bridge** - נבדק ודווח
- ✅ **תשובות לשאלות** - סופקו

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-02  
**Status:** ✅ **COMPLETE - READY FOR ARCHITECT REVIEW**

**log_entry | [Team 10] | IDENTITY_CUBE_FILE_MAPPING | COMPLETE | GREEN | 2026-02-02**
