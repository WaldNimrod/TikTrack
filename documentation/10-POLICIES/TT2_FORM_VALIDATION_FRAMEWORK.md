# 🎯 תשתית ולידציה לטפסים - Phoenix Form Validation Framework (v1.2)

**id:** `TT2_FORM_VALIDATION_FRAMEWORK`  
**owner:** Team 30 (Frontend Execution) + Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-01  
**version:** v1.2

---

**פרויקט:** פיניקס (TikTrack V2)  
**תפקיד:** תשתית ולידציה מרכזית לכל הטפסים במערכת  
**סטטוס:** ✅ **מימוש הושלם - מוכן לשימוש - Backend & Frontend Complete - Ready for QA Testing**

---

## 📋 תקציר מנהלים

תשתית ולידציה מרכזית המגדירה מודל אחיד לכל הטפסים במערכת Phoenix. המודל מספק:
- **ולידציה דו-שכבתית:** Client-side (UX) + Server-side (Security)
- **משוב מפורט למשתמש:** הודעות שגיאה ברורות בעברית
- **לוג מפורט לפיתוח:** Audit Trail מלא עם `?debug` mode
- **עיצוב עדין ומדויק:** BEM classes + LEGO components
- **גמישות ואינטגרציה:** תמיכה בולידציה משלימה בצד שרת
- **PhoenixSchema מרכזי:** כל Validation Rules ב-Schemas מרכזיות

**רפרנסים לאפיון:**
- `TT2_JS_STANDARDS_PROTOCOL.md` - סטנדרטי JavaScript ו-Transformation Layer
- `TT2_CSS_STANDARDS_PROTOCOL.md` - סטנדרטי CSS ו-BEM
- `PHOENIX_MASTER_BIBLE.md` - נהלים אדריכליים
- `ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md` - החלטה אדריכלית על מודל היברידי
- `TEAM_10_TO_TEAM_30_VALIDATION_PHOENIX_SCHEMA.md` - הוראות מימוש
- `TT2_VALIDATION_DEVELOPER_GUIDE.md` - מדריך מפתח מפורט

**מימוש:**
- ✅ **Backend:** `TEAM_20_TO_TEAM_10_ERROR_CODE_CLEAN_IMPLEMENTATION.md` - Error Codes Complete
- ✅ **Frontend:** `TEAM_30_TO_TEAM_10_VALIDATION_PHOENIX_SCHEMA_COMPLETE.md` - PhoenixSchema Complete
- ⏸️ **QA:** `TEAM_10_TO_TEAM_50_VALIDATION_COMPREHENSIVE_TESTING.md` - Testing Required

---

## 1. ארכיטקטורת ולידציה

### 1.1 מודל דו-שכבתי

```
┌─────────────────────────────────────────────────────────┐
│                    User Input                            │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Client-Side Validation (UX)                   │
│  - Instant feedback                                    │
│  - Field-level errors                                  │
│  - Form-level errors                                   │
│  - Visual indicators (BEM classes)                    │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Server-Side Validation (Security)            │
│  - Pydantic schema validation                          │
│  - Business logic validation                           │
│  - Data integrity checks                              │
│  - Security validations                                │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Success / Error Response                   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 זרימת ולידציה

1. **User Input** → Field onChange/onBlur
2. **Client Validation** → Field-level validation
3. **Visual Feedback** → BEM error classes + error messages
4. **Form Submit** → Full form validation
5. **API Call** → Server-side validation
6. **Error Handling** → Display server errors + client errors
7. **Success** → Clear errors + show success message

---

## 2. מבנה ולידציה - Client Side

### 2.1 State Management

```javascript
// Form State Structure
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
  // ...
});

// Validation State
const [fieldErrors, setFieldErrors] = useState({
  field1: null,  // null = no error, string = error message
  field2: null,
  // ...
});

// Form-level State
const [formErrors, setFormErrors] = useState([]);  // Array of general errors
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitError, setSubmitError] = useState(null);
```

### 2.2 Validation Rules Structure

```javascript
/**
 * Validation Rules Schema
 * 
 * @typedef {Object} ValidationRule
 * @property {string} field - Field name (camelCase)
 * @property {Function} validator - Validation function (value, formData) => string|null
 * @property {string} errorMessage - Error message in Hebrew
 * @property {boolean} required - Is field required
 * @property {string} type - Field type (email, phone, text, etc.)
 */

const validationRules = {
  email: {
    required: true,
    type: 'email',
    validator: (value, formData) => {
      if (!value.trim()) return 'שדה חובה';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'אימייל לא תקין';
      }
      return null;
    }
  },
  phoneNumber: {
    required: false,
    type: 'phone',
    validator: (value, formData) => {
      if (!value) return null; // Optional field
      const clean = value.replace(/[\s-()]/g, '');
      if (!/^\+[1-9]\d{1,14}$/.test(clean)) {
        return 'מספר טלפון חייב להיות בפורמט E.164 (דוגמה: +972501234567)';
      }
      return null;
    }
  },
  // ... more rules
};
```

### 2.3 Validation Functions

```javascript
/**
 * Validate Single Field
 * 
 * @param {string} fieldName - Field name (camelCase)
 * @param {any} value - Field value
 * @param {Object} formData - Full form data
 * @param {Object} rules - Validation rules
 * @returns {string|null} - Error message or null
 */
const validateField = (fieldName, value, formData, rules) => {
  const rule = rules[fieldName];
  if (!rule) return null;
  
  // Required check
  if (rule.required && !value?.trim()) {
    return 'שדה חובה';
  }
  
  // Custom validator
  if (rule.validator) {
    return rule.validator(value, formData);
  }
  
  return null;
};

/**
 * Validate Entire Form
 * 
 * @param {Object} formData - Form data
 * @param {Object} rules - Validation rules
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(fieldName => {
    const error = validateField(fieldName, formData[fieldName], formData, rules);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

---

## 3. UI/UX - Visual Feedback

### 3.1 BEM Classes (CSS Standards)

```css
/* Block */
.form-group { }

/* Element */
.form-group__label { }
.form-group__input { }
.form-group__error { }
.form-group__error-message { }

/* Modifier */
.form-group__input--error { }
.form-group__input--success { }
.form-group__input--disabled { }
```

### 3.2 JS Selectors (JS Standards)

```html
<!-- Field with error -->
<div class="form-group">
  <label class="form-group__label js-field-label" for="email">
    אימייל:
  </label>
  <input
    type="email"
    id="email"
    name="email"
    class="form-group__input js-field-input form-group__input--error"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <span
    id="email-error"
    class="form-group__error-message js-field-error"
    role="alert"
    aria-live="polite"
  >
    אימייל לא תקין
  </span>
</div>
```

### 3.3 Error Display Pattern

```javascript
// Field-level error
{fieldErrors.email && (
  <span
    className="form-group__error-message js-field-error"
    id="email-error"
    role="alert"
    aria-live="polite"
  >
    {fieldErrors.email}
  </span>
)}

// Form-level error
{submitError && (
  <div
    className="auth-form__error js-form-error"
    role="alert"
    aria-live="assertive"
  >
    {submitError}
  </div>
)}
```

---

## 4. Error Handling - המודל ההיברידי

### 4.1 Error Code Dictionary

**מיקום:** `ui/src/logic/errorCodes.js`

**מבנה:**
```javascript
export const ERROR_CODES = {
  'AUTH_INVALID_CREDENTIALS': 'שם משתמש או סיסמה שגויים. אנא נסה שוב.',
  'VALIDATION_FIELD_REQUIRED': 'שדה חובה',
  // ... more codes
};

export const translateError = (errorCode, detail = null) => {
  // Priority 1: Use error_code if available
  // Priority 2: Translate detail message
  // Priority 3: Use Hebrew if provided by backend
  // Fallback: Generic error
};
```

### 4.2 Error Handler

**מיקום:** `ui/src/utils/errorHandler.js`

**תפקיד:** מטפל בשגיאות API וממיר אותן ל-fieldErrors ו-formError

**שימוש:**
```javascript
import { handleApiError } from '../../utils/errorHandler.js';

try {
  // API call...
} catch (error) {
  const { fieldErrors: apiErrors, formError: apiError } = handleApiError(error);
  setFieldErrors(prev => ({ ...prev, ...apiErrors }));
  setFormError(apiError);
}
```

---

## 5. Server-Side Integration

### 5.1 Error Response Handling

```javascript
**ראה:** `ui/src/utils/errorHandler.js` - מימוש מלא

**עקרונות:**
1. **Priority 1:** שימוש ב-`error_code` אם קיים
2. **Priority 2:** תרגום `detail` message דרך מילון
3. **Priority 3:** שימוש ישיר בהודעה בעברית אם קיימת
4. **Fallback:** הודעת שגיאה גנרית
```

**ראה:** `ui/src/logic/errorCodes.js` - מימוש מלא עם `translateError()`

---

## 5. Audit Trail & Logging

### 5.1 Validation Logging

```javascript
import { audit } from '../../utils/audit.js';
import { debugLog } from '../../utils/debug.js';

// Field validation
const handleFieldChange = (fieldName, value) => {
  const error = validateField(fieldName, value, formData, validationRules);
  
  if (error) {
    audit.log('FormValidation', `Field validation failed: ${fieldName}`, {
      field: fieldName,
      value: value?.substring(0, 10) + '...', // Masked
      error: error
    });
  }
  
  setFieldErrors(prev => ({
    ...prev,
    [fieldName]: error
  }));
};

// Form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Client-side validation
  const { isValid, errors } = validateForm(formData, validationRules);
  
  if (!isValid) {
    audit.log('FormValidation', 'Form validation failed', {
      errors: Object.keys(errors),
      fieldCount: Object.keys(errors).length
    });
    setFieldErrors(errors);
    return;
  }
  
  audit.log('FormValidation', 'Form validation passed', {
    fieldCount: Object.keys(formData).length
  });
  
  // Submit to API...
};
```

### 5.2 Debug Mode

```javascript
// In debug mode (?debug), log all validation details
if (window.location.search.includes('debug')) {
  debugLog('FormValidation', 'Field validation', {
    field: fieldName,
    value: value,
    rule: validationRules[fieldName],
    error: error
  });
}
```

---

## 6. מימוש - Form Validation Hook

### 6.1 useFormValidation Hook

```javascript
/**
 * useFormValidation Hook
 * 
 * @description Custom hook for form validation
 * @param {Object} initialData - Initial form data
 * @param {Object} rules - Validation rules
 * @returns {Object} - Form state and handlers
 */
const useFormValidation = (initialData, rules) => {
  const [formData, setFormData] = useState(initialData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  
  // Validate single field
  const validateField = useCallback((fieldName, value) => {
    return validateField(fieldName, value, formData, rules);
  }, [formData, rules]);
  
  // Handle field change
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear field error when user types
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    // Clear form error
    if (formError) {
      setFormError(null);
    }
  }, [fieldErrors, formError]);
  
  // Handle field blur (validate on blur)
  const handleFieldBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const value = formData[fieldName];
    const error = validateField(fieldName, value);
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error || null
    }));
  }, [formData, validateField]);
  
  // Validate entire form
  const validateForm = useCallback(() => {
    const { isValid, errors } = validateForm(formData, rules);
    setFieldErrors(errors);
    return isValid;
  }, [formData, rules]);
  
  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setFieldErrors({});
    setFormError(null);
    setTouched({});
  }, [initialData]);
  
  return {
    formData,
    fieldErrors,
    formError,
    isSubmitting,
    touched,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    resetForm,
    setFormError,
    setIsSubmitting
  };
};
```

---

**ראה:** `ui/src/components/profile/ProfileView.jsx` - מימוש מלא עם PhoenixSchema

---

## 8. קבצים שנוצרו

### 8.1 Schemas
- ✅ `ui/src/logic/schemas/userSchema.js` - Validation rules למשתמשים
- ⏸️ `ui/src/logic/schemas/authSchema.js` - למימוש עתידי
- ⏸️ `ui/src/logic/schemas/apiKeySchema.js` - למימוש עתידי

### 8.2 Error Handling
- ✅ `ui/src/logic/errorCodes.js` - מילון Error Codes
- ✅ `ui/src/utils/errorHandler.js` - Error Handler מעודכן

### 8.3 Components מעודכנים
- ✅ `ui/src/components/profile/ProfileView.jsx` - מימוש עם PhoenixSchema

---

## 9. מימוש וסטטוס

### 9.1 סטטוס מימוש ✅ **COMPLETE**

**Backend (Team 20):** ✅ **COMPLETE**
- ✅ עדכון OpenAPI Spec - הוספת `error_code` (חובה) ל-ErrorResponse
- ✅ יצירת Exception Utilities - `HTTPExceptionWithCode` עם `error_code` חובה
- ✅ עדכון Exception Handlers - תמיכה מלאה ב-error_code
- ✅ עדכון כל ה-HTTPException Calls - 46 calls עודכנו
- ✅ יצירת רשימת Error Codes - 40+ codes מתועדים

**Frontend (Team 30):** ✅ **COMPLETE**
- ✅ יצירת תיקיית `src/logic/schemas/`
- ✅ יצירת `userSchema.js` עם Validation Rules
- ✅ יצירת `authSchema.js` עם Validation Rules
- ✅ יצירת `errorCodes.js` עם מילון Error Codes
- ✅ יצירת `errorHandler.js` עם Error Handler מעודכן
- ✅ עדכון ProfileView - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- ✅ עדכון PasswordChangeForm - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- ✅ עדכון LoginForm - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- ✅ עדכון RegisterForm - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- ✅ עדכון PasswordResetFlow - הסרת לוגיקת בדיקה, שימוש ב-Schemas

**תיעוד:** ✅ **COMPLETE**
- ✅ עדכון התוכנית `TT2_FORM_VALIDATION_FRAMEWORK.md`
- ✅ יצירת מדריך מפתח `TT2_VALIDATION_DEVELOPER_GUIDE.md`
- ✅ עדכון אינדקס `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` (אינדקס מאוחד)

---

### 9.2 Checklist מימוש ✅ **COMPLETE**

- [x] יצירת תיקיית `src/logic/schemas/`
- [x] יצירת `userSchema.js` עם Validation Rules
- [x] יצירת `authSchema.js` עם Validation Rules
- [x] יצירת `errorCodes.js` עם מילון Error Codes
- [x] יצירת `errorHandler.js` עם Error Handler מעודכן
- [x] עדכון ProfileView - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- [x] עדכון PasswordChangeForm - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- [x] עדכון LoginForm - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- [x] עדכון RegisterForm - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- [x] עדכון PasswordResetFlow - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- [x] כל השדות עוברים ולידציה client-side
- [x] כל השגיאות מוצגות בעברית
- [x] BEM classes מיושמים נכון
- [x] JS selectors עם `js-` prefix
- [x] Audit Trail מיושם בכל הפעולות
- [x] Error handling מטפל בכל סוגי השגיאות
- [x] Server-side errors משולבים נכון
- [x] Accessibility (ARIA) מיושם
- [x] Transformation Layer עובד נכון
- [x] Debug mode עובד

---

### 9.3 קבצים שנוצרו/עודכנו

**Backend:**
- ✅ `api/utils/exceptions.py` - Exception Utilities
- ✅ `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` - OpenAPI Spec מעודכן

**Frontend:**
- ✅ `ui/src/logic/schemas/userSchema.js` - User Validation Schema
- ✅ `ui/src/logic/schemas/authSchema.js` - Authentication Validation Schema
- ✅ `ui/src/logic/errorCodes.js` - Error Code Dictionary
- ✅ `ui/src/utils/errorHandler.js` - Error Handler מעודכן
- ✅ `ui/src/components/profile/ProfileView.jsx` - מעודכן
- ✅ `ui/src/components/profile/PasswordChangeForm.jsx` - מעודכן
- ✅ `ui/src/components/auth/LoginForm.jsx` - מעודכן
- ✅ `ui/src/components/auth/RegisterForm.jsx` - מעודכן
- ✅ `ui/src/components/auth/PasswordResetFlow.jsx` - מעודכן

**תיעוד:**
- ✅ `documentation/10-POLICIES/TT2_FORM_VALIDATION_FRAMEWORK.md` - מעודכן
- ✅ `documentation/02-DEVELOPMENT/TT2_VALIDATION_DEVELOPER_GUIDE.md` - חדש
- ✅ `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` - מעודכן (אינדקס מאוחד)

---

### 9.4 בדיקות נדרשות

**Team 50:** בדיקות מקיפות נדרשות - ראה `TEAM_10_TO_TEAM_50_VALIDATION_COMPREHENSIVE_TESTING.md`

---

## 10. רפרנסים

1. **JS Standards Protocol:** `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
   - Transformation Layer (snake_case ↔ camelCase)
   - JS selectors עם `js-` prefix
   - Audit Trail System

2. **CSS Standards Protocol:** `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
   - BEM naming convention
   - LEGO components
   - Error state classes

3. **Phoenix Master Bible:** `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md`
   - נהלים אדריכליים
   - G-Bridge validation
   - Transformation Layer requirements

4. **החלטה אדריכלית:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_VALIDATION_FINAL.md`
   - מודל ולידציה היברידי
   - PhoenixSchema requirement

5. **הוראות מימוש:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_VALIDATION_PHOENIX_SCHEMA.md`
   - הוראות מפורטות למימוש
   - דוגמאות קוד

---

**סטטוס:** ✅ **מימוש הושלם - Backend & Frontend Complete - Ready for QA Testing**  
**צוות אחראי:** Team 30 (Frontend) + Team 20 (Backend)  
**אישור נדרש:** Team 10 (The Gateway) + Chief Architect  
**עדכון אחרון:** 2026-02-01

---

## 11. מסמכים קשורים

1. **מדריך מפתח:** `documentation/02-DEVELOPMENT/TT2_VALIDATION_DEVELOPER_GUIDE.md` - מדריך מפורט למפתחים עתידיים
2. **Backend Implementation:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_ERROR_CODE_CLEAN_IMPLEMENTATION.md` - דוח מימוש Backend
3. **Frontend Implementation:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_VALIDATION_PHOENIX_SCHEMA_COMPLETE.md` - דוח מימוש Frontend
4. **QA Testing:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_VALIDATION_COMPREHENSIVE_TESTING.md` - דרישות בדיקה מקיפות
