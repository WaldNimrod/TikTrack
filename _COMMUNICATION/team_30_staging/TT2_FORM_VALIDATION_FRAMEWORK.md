# 🎯 תשתית ולידציה לטפסים - Phoenix Form Validation Framework (v1.0)

**פרויקט:** פיניקס (TikTrack V2)  
**תפקיד:** תשתית ולידציה מרכזית לכל הטפסים במערכת  
**תאריך:** 2026-01-31  
**צוות:** Team 30 (Frontend) → Team 10 (The Gateway)  
**סטטוס:** ✅ תכנון מפורט - מוכן למימוש

---

## 📋 תקציר מנהלים

תשתית ולידציה מרכזית המגדירה מודל אחיד לכל הטפסים במערכת Phoenix. המודל מספק:
- **ולידציה דו-שכבתית:** Client-side (UX) + Server-side (Security)
- **משוב מפורט למשתמש:** הודעות שגיאה ברורות בעברית
- **לוג מפורט לפיתוח:** Audit Trail מלא עם `?debug` mode
- **עיצוב עדין ומדויק:** BEM classes + LEGO components
- **גמישות ואינטגרציה:** תמיכה בולידציה משלימה בצד שרת

**רפרנסים לאפיון:**
- `TT2_JS_STANDARDS_PROTOCOL.md` - סטנדרטי JavaScript ו-Transformation Layer
- `TT2_CSS_STANDARDS_PROTOCOL.md` - סטנדרטי CSS ו-BEM
- `PHOENIX_MASTER_BIBLE.md` - נהלים אדריכליים

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

## 4. Server-Side Integration

### 4.1 Error Response Handling

```javascript
/**
 * Handle API Error Response
 * 
 * @param {Error} error - Axios error
 * @param {Object} validationRules - Client-side rules
 * @returns {Object} - { fieldErrors: Object, formError: string|null }
 */
const handleApiError = (error, validationRules) => {
  const fieldErrors = {};
  let formError = null;
  
  if (error.response?.status === 400) {
    // Validation error from server
    const detail = error.response.data?.detail;
    
    if (Array.isArray(detail)) {
      // Pydantic validation errors
      detail.forEach(err => {
        const field = err.loc?.[err.loc.length - 1]; // Last field in path
        const camelField = snakeToCamel(field);
        fieldErrors[camelField] = translateError(err.msg);
      });
    } else if (typeof detail === 'string') {
      // Generic error message
      formError = translateError(detail);
    }
  } else if (error.response?.status === 401) {
    formError = 'אימות נכשל. אנא בדוק את פרטיך.';
  } else if (error.response?.status === 500) {
    formError = 'שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר.';
  } else {
    formError = 'שגיאה בלתי צפויה. אנא נסה שוב.';
  }
  
  return { fieldErrors, formError };
};
```

### 4.2 Error Translation

```javascript
/**
 * Translate Server Error to Hebrew
 * 
 * @param {string} errorMsg - English error message
 * @returns {string} - Hebrew error message
 */
const translateError = (errorMsg) => {
  const translations = {
    'field required': 'שדה חובה',
    'invalid email': 'אימייל לא תקין',
    'phone number must be in E.164 format': 'מספר טלפון חייב להיות בפורמט E.164',
    'invalid credentials': 'שם משתמש או סיסמה שגויים. אנא נסה שוב.',
    'bad request': 'בקשה לא תקינה. אנא בדוק את הפרטים שהזנת.',
    // ... more translations
  };
  
  // Check for exact match
  if (translations[errorMsg.toLowerCase()]) {
    return translations[errorMsg.toLowerCase()];
  }
  
  // Check for partial match
  for (const [key, value] of Object.entries(translations)) {
    if (errorMsg.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  // If backend provides Hebrew, use it directly
  // Otherwise, return generic message
  return errorMsg || 'שגיאה בעדכון. אנא נסה שוב.';
};
```

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

## 7. דוגמה מלאה - Profile Form

```javascript
import { useFormValidation } from '../../hooks/useFormValidation.js';
import { audit } from '../../utils/audit.js';
import { debugLog } from '../../utils/debug.js';

const ProfileView = () => {
  // Validation rules
  const validationRules = {
    firstName: {
      required: false,
      type: 'text',
      validator: (value) => {
        if (value && value.length > 100) return 'שם פרטי לא יכול להיות יותר מ-100 תווים';
        return null;
      }
    },
    lastName: {
      required: false,
      type: 'text',
      validator: (value) => {
        if (value && value.length > 100) return 'שם משפחה לא יכול להיות יותר מ-100 תווים';
        return null;
      }
    },
    displayName: {
      required: false,
      type: 'text',
      validator: (value) => {
        if (value && value.length > 100) return 'שם תצוגה לא יכול להיות יותר מ-100 תווים';
        return null;
      }
    },
    email: {
      required: true,
      type: 'email',
      validator: (value) => {
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
      validator: (value) => {
        if (!value) return null;
        const clean = value.replace(/[\s-()]/g, '');
        if (!/^\+[1-9]\d{1,14}$/.test(clean)) {
          return 'מספר טלפון חייב להיות בפורמט E.164 (דוגמה: +972501234567)';
        }
        return null;
      }
    },
    timezone: {
      required: true,
      type: 'select',
      validator: (value) => {
        if (!value) return 'שדה חובה';
        if (!/^[A-Za-z_]+\/[A-Za-z_]+$/.test(value)) {
          return 'אזור זמן לא תקין';
        }
        return null;
      }
    },
    language: {
      required: true,
      type: 'select',
      validator: (value) => {
        if (!value) return 'שדה חובה';
        if (!['he', 'en', 'ar', 'ru'].includes(value)) {
          return 'שפה לא תקינה';
        }
        return null;
      }
    }
  };
  
  const {
    formData,
    fieldErrors,
    formError,
    isSubmitting,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    setFormError,
    setIsSubmitting
  } = useFormValidation({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phoneNumber: '',
    timezone: 'UTC',
    language: 'he'
  }, validationRules);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateForm()) {
      audit.log('ProfileView', 'Form validation failed', { fieldErrors });
      return;
    }
    
    setIsSubmitting(true);
    audit.log('ProfileView', 'Form submission started', { 
      fields: Object.keys(formData) 
    });
    
    try {
      // API call with transformation
      const payload = reactToApi(formData);
      const response = await authService.updateUser(payload);
      
      audit.log('ProfileView', 'Form submission successful', { 
        userId: response.externalUlids 
      });
      
      // Success handling
      setFormError(null);
      // Show success message...
      
    } catch (error) {
      audit.error('ProfileView', 'Form submission failed', error);
      
      // Handle API errors
      const { fieldErrors: apiErrors, formError: apiError } = handleApiError(error, validationRules);
      
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...apiErrors }));
      }
      
      if (apiError) {
        setFormError(apiError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with validation */}
      <div className="form-group">
        <label className="form-group__label js-field-label" htmlFor="email">
          אימייל:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-group__input js-field-input ${
            fieldErrors.email ? 'form-group__input--error' : ''
          }`}
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => handleFieldBlur('email')}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
        />
        {fieldErrors.email && (
          <span
            id="email-error"
            className="form-group__error-message js-field-error"
            role="alert"
            aria-live="polite"
          >
            {fieldErrors.email}
          </span>
        )}
      </div>
      
      {/* Form-level error */}
      {formError && (
        <div
          className="auth-form__error js-form-error"
          role="alert"
          aria-live="assertive"
        >
          {formError}
        </div>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'שומר...' : 'שמור שינויים'}
      </button>
    </form>
  );
};
```

---

## 8. בדיקות ואימות

### 8.1 Checklist לפני הגשה

- [ ] כל השדות עוברים ולידציה client-side
- [ ] כל השגיאות מוצגות בעברית
- [ ] BEM classes מיושמים נכון
- [ ] JS selectors עם `js-` prefix
- [ ] Audit Trail מיושם בכל הפעולות
- [ ] Error handling מטפל בכל סוגי השגיאות
- [ ] Server-side errors משולבים נכון
- [ ] Accessibility (ARIA) מיושם
- [ ] Transformation Layer עובד נכון
- [ ] Debug mode עובד

---

## 9. רפרנסים

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

---

**סטטוס:** ✅ **תכנון מפורט הושלם - מוכן למימוש**  
**צוות אחראי:** Team 30 (Frontend)  
**אישור נדרש:** Team 10 (The Gateway) + Chief Architect
