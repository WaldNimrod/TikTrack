# 📡 דוח זיהוי Components משותפים - שלב 2.5.1

**From:** Team 30 (Frontend Execution)  
**To:** Team 10 (The Gateway), Team 40 (UI Assets & Design)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** STAGE_2.5_COMPONENTS_IDENTIFICATION | Status: ✅ **COMPLETE**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 📋 Executive Summary

**הושלם:** ✅ **זיהוי Components משותפים**

**תהליך:**
- ✅ סקירת כל העמודים הקיימים (LoginForm, RegisterForm, PasswordResetFlow, ProfileView)
- ✅ זיהוי patterns חוזרים
- ✅ תיעוד Components שזוהו

---

## 🔍 Components שזוהו - Identity Cube

### **1. AuthForm** 🎯 **HIGH PRIORITY**

**תיאור:** Component משותף לטופסי Auth (Login, Register, Reset Password)

**Patterns שזוהו:**
- ✅ Form state management (`formData`, `isLoading`, `error`, `fieldErrors`)
- ✅ Input change handler עם ולידציה
- ✅ Form validation באמצעות Schema
- ✅ Error handling (general + field-level)
- ✅ Loading states
- ✅ Layout structure (`auth-form`, `form-group`, `form-label`, `form-control`)

**Props מוצעים:**
```javascript
{
  formType: 'login' | 'register' | 'reset-password',
  fields: Array<FieldConfig>, // הגדרת שדות דינמית
  validationSchema: Object, // Schema לולידציה
  onSubmit: Function, // Callback לשליחה
  initialData?: Object, // נתונים ראשוניים
  submitLabel?: string, // טקסט כפתור שליחה
  links?: Array<LinkConfig>, // קישורים (למשל "שכחתי סיסמה")
}
```

**מיקום:** `ui/src/cubes/identity/components/AuthForm.jsx`

**שימוש ב-Components קיימים:**
- `PhoenixSchema` (ולידציה)
- `AuthErrorHandler` (טיפול בשגיאות)
- `AuthLayout` (Layout)

---

### **2. AuthValidation** 🎯 **HIGH PRIORITY**

**תיאור:** Hook/Utility לולידציה משותפת של טופסי Auth

**Patterns שזוהו:**
- ✅ Field-level validation (בזמן input change)
- ✅ Form-level validation (לפני submit)
- ✅ Schema-based validation
- ✅ הודעות שגיאה מתורגמות

**API מוצע:**
```javascript
// Hook
const { validateField, validateForm, fieldErrors, formErrors } = useAuthValidation({
  schema: validationSchema,
  formData: formData,
});

// או Utility functions
validateField(fieldName, value, schema);
validateForm(formData, schema);
```

**מיקום:** `ui/src/cubes/identity/hooks/useAuthValidation.js`

**שימוש ב-Components קיימים:**
- `logic/schemas/authSchema.js` (Schema קיים)
- `logic/schemas/userSchema.js` (Schema קיים)

---

### **3. AuthErrorHandler** 🎯 **MEDIUM PRIORITY**

**תיאור:** Component לטיפול והצגת שגיאות ב-Auth Forms

**Patterns שזוהו:**
- ✅ General error display (בחלק העליון של הטופס)
- ✅ Field-level error display (תחת כל שדה)
- ✅ Error styling (`auth-form__error`, `auth-form__error-message`)
- ✅ ARIA attributes (`role="alert"`, `aria-live="polite"`)
- ✅ JS Selectors (`js-error-feedback`)

**Props מוצעים:**
```javascript
{
  error?: string, // General error message
  fieldErrors?: Object, // { fieldName: errorMessage }
  showFieldErrors?: boolean, // האם להציג field errors
}
```

**מיקום:** `ui/src/cubes/identity/components/AuthErrorHandler.jsx`

**שימוש ב-Components קיימים:**
- LEGO System (`tt-section`, `tt-section-row`)
- CSS Classes מ-`CSS_CLASSES_INDEX.md`

---

### **4. AuthLayout** 🎯 **MEDIUM PRIORITY**

**תיאור:** Layout משותף לעמודי Auth

**Patterns שזוהו:**
- ✅ מבנה HTML/JSX משותף
- ✅ שימוש ב-LEGO System (`tt-container` > `tt-section`)
- ✅ Header/Footer משותפים
- ✅ Centered layout
- ✅ RTL support

**Props מוצעים:**
```javascript
{
  title: string, // כותרת העמוד
  children: ReactNode, // תוכן העמוד
  links?: Array<LinkConfig>, // קישורים (למשל "חזרה להתחברות")
}
```

**מיקום:** `ui/src/cubes/identity/components/AuthLayout.jsx`

**שימוש ב-Components קיימים:**
- LEGO System (`tt-container`, `tt-section`, `tt-section-row`)
- CSS Classes מ-`CSS_CLASSES_INDEX.md` (`.auth-layout-root`)

---

## 🔍 Components שזוהו - Financial Cube

### **1. FinancialTable** 🎯 **MEDIUM PRIORITY**

**תיאור:** Wrapper ל-`PhoenixTable` עם Props ספציפיים ל-Financial Cube

**Patterns שזוהו:**
- ✅ שימוש ב-`PhoenixTable` (כבר קיים)
- ✅ Columns definitions ספציפיים ל-Financial
- ✅ Data formatting (כסף, תאריכים, סטטוסים)
- ✅ Actions (עריכה, מחיקה)

**Props מוצעים:**
```javascript
{
  tableType: 'accounts' | 'brokers' | 'cash' | 'transactions',
  data: Array, // נתוני הטבלה
  onEdit?: Function, // Callback לעריכה
  onDelete?: Function, // Callback למחיקה
  // ... כל ה-props של PhoenixTable
}
```

**מיקום:** `ui/src/cubes/financial/components/FinancialTable.jsx`

**שימוש ב-Components קיימים:**
- `PhoenixTable` (מ-`cubes/shared/components/tables/`)
- `PhoenixFilterContext` (מ-`cubes/shared/contexts/`)

---

### **2. FinancialFilters** 🎯 **LOW PRIORITY**

**תיאור:** Component לפילטרים ספציפיים ל-Financial Cube

**Patterns שזוהו:**
- ✅ שימוש ב-`PhoenixFilterContext` (כבר קיים)
- ✅ Date range filters
- ✅ Account/Broker filters
- ✅ Status filters

**מיקום:** `ui/src/cubes/financial/components/FinancialFilters.jsx`

**שימוש ב-Components קיימים:**
- `PhoenixFilterContext` (מ-`cubes/shared/contexts/`)
- LEGO System (`tt-section`, `tt-section-row`)

**הערה:** יכול להיות wrapper פשוט ל-`PhoenixFilterContext` עם UI ספציפי ל-Financial.

---

### **3. FinancialSummary** 🎯 **MEDIUM PRIORITY**

**תיאור:** Component לסיכומים משותפים (Cards, Totals, etc.)

**Patterns שזוהו:**
- ✅ Cards משותפים (Balance, Total, etc.)
- ✅ Layout משותף (Grid/Flex)
- ✅ Styling משותף

**Props מוצעים:**
```javascript
{
  summaries: Array<SummaryConfig>, // [{ label, value, currency, icon }]
  layout?: 'grid' | 'flex', // Layout type
}
```

**מיקום:** `ui/src/cubes/financial/components/FinancialSummary.jsx`

**שימוש ב-Components קיימים:**
- `FinancialCard` (Component נפרד)
- LEGO System (`tt-section`, `tt-section-row`)

---

### **4. FinancialCard** 🎯 **MEDIUM PRIORITY**

**תיאור:** Component לכרטיסי סיכום משותפים

**Patterns שזוהו:**
- ✅ Card structure (`.account-card`, `.card-title`, `.card-footer`)
- ✅ Balance display (`.balance-grid`, `.balance-item`)
- ✅ Status display (`.tag-active`, `.status-verified`)

**Props מוצעים:**
```javascript
{
  title: string,
  balances?: Array<{ currency: string, amount: number }>,
  status?: string,
  statusType?: 'active' | 'inactive' | 'verified' | 'pending',
  footer?: ReactNode,
}
```

**מיקום:** `ui/src/cubes/financial/components/FinancialCard.jsx`

**שימוש ב-Components קיימים:**
- CSS Classes מ-`CSS_CLASSES_INDEX.md`
- LEGO System (`tt-section-row`)

---

## 📊 סיכום Components

### **Identity Cube:**
| Component | Priority | Status | מיקום |
|-----------|----------|--------|-------|
| AuthForm | HIGH | 🟢 Ready | `cubes/identity/components/AuthForm.jsx` |
| AuthValidation | HIGH | 🟢 Ready | `cubes/identity/hooks/useAuthValidation.js` |
| AuthErrorHandler | MEDIUM | 🟢 Ready | `cubes/identity/components/AuthErrorHandler.jsx` |
| AuthLayout | MEDIUM | 🟢 Ready | `cubes/identity/components/AuthLayout.jsx` |

### **Financial Cube:**
| Component | Priority | Status | מיקום |
|-----------|----------|--------|-------|
| FinancialTable | MEDIUM | 🟢 Ready | `cubes/financial/components/FinancialTable.jsx` |
| FinancialFilters | LOW | 🟡 Later | `cubes/financial/components/FinancialFilters.jsx` |
| FinancialSummary | MEDIUM | 🟢 Ready | `cubes/financial/components/FinancialSummary.jsx` |
| FinancialCard | MEDIUM | 🟢 Ready | `cubes/financial/components/FinancialCard.jsx` |

---

## 🎯 סדר עדיפויות

### **Phase 1: Identity Cube (HIGH PRIORITY)**
1. ✅ **AuthValidation** (Hook) - בסיס לולידציה
2. ✅ **AuthErrorHandler** (Component) - בסיס לטיפול בשגיאות
3. ✅ **AuthLayout** (Component) - Layout משותף
4. ✅ **AuthForm** (Component) - Component הראשי

### **Phase 2: Financial Cube (MEDIUM PRIORITY)**
1. ✅ **FinancialCard** (Component) - Component פשוט
2. ✅ **FinancialSummary** (Component) - שימוש ב-FinancialCard
3. ✅ **FinancialTable** (Component) - Wrapper ל-PhoenixTable

---

## 📋 דרישות טכניות

### **כל ה-Components חייבים:**
- ✅ שימוש ב-LEGO System (`tt-container`, `tt-section`, `tt-section-row`)
- ✅ שימוש ב-CSS Classes מ-`CSS_CLASSES_INDEX.md`
- ✅ עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`
- ✅ JSDoc documentation עם `@legacyReference`
- ✅ JS Selectors עם `js-` prefix
- ✅ Audit Trail System (`audit.log`, `audit.error`)
- ✅ Transformation Layer (`snake_case` ↔ `camelCase`)
- ✅ RTL support
- ✅ Accessibility (ARIA attributes)

---

## 🔗 קישורים רלוונטיים

### **Components קיימים:**
- `ui/src/cubes/shared/components/tables/PhoenixTable.jsx`
- `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`
- `ui/src/cubes/shared/hooks/`

### **סטנדרטים:**
- `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
- `documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md`

### **Schemas:**
- `ui/src/logic/schemas/authSchema.js`
- `ui/src/logic/schemas/userSchema.js`

---

## ✅ Checklist

- [x] סקירת כל העמודים הקיימים
- [x] זיהוי Components משותפים
- [x] תיעוד Components שזוהו
- [x] הגדרת Props/API מוצעים
- [x] קביעת סדר עדיפויות
- [ ] התחלת יצירת Components (Phase 1)

---

**Team 30 (Frontend Execution)**  
**Date:** 2026-02-01  
**Status:** ✅ **COMPONENTS IDENTIFIED - READY FOR IMPLEMENTATION**  
**Next Step:** התחלת יצירת Components (Phase 1: Identity Cube)
