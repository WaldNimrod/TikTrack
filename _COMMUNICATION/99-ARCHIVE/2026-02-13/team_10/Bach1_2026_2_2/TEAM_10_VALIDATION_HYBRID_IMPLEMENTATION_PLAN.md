# 🎯 תוכנית מימוש: Validation Framework היברידי - Team 10

**From:** Team 10 (The Gateway)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** VALIDATION_HYBRID_IMPLEMENTATION | Status: 📋 **IMPLEMENTATION PLAN**  
**Priority:** 🔴 **CRITICAL - ARCHITECTURAL MANDATE**

---

## 📋 Executive Summary

**החלטה אדריכלית:** מודל ולידציה היברידי (v1.2)  
**מקור:** `ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md`  
**סטטוס:** ✅ **MANDATORY - APPROVED BY ARCHITECT**

---

## 🎯 עקרונות ההחלטה

### **1. טיפול בשגיאות (The Hybrid Error Protocol)**

**Backend (Team 20):**
- ✅ נשמור על שדה ה-`detail` כפי שמוגדר ב-OpenAPI (עבור Pydantic errors)
- ✅ **חדש:** להוסיף שדה אופציונלי `error_code` לכל תגובת שגיאה

**Frontend (Team 30):**
- ✅ המערכת תיתן עדיפות ל-`error_code`
- ✅ אם `error_code` אינו קיים, תשתמש ב-`detail` ותבצע טרנספורמציה דרך מילון מרכזי

---

### **2. הקמת PhoenixSchema (The Logic Layer)**

**החלטה:** PhoenixSchema אינו קובץ קיים, אלא **דרישה חדשה**.

**מימוש (Team 30):**
- ✅ ליצור תיקיית `src/logic/schemas/`
- ✅ שם ירוכזו כל חוקי הולידציה (למשל `userSchema.js`)
- ✅ **חובה:** רכיבי ה-UI (Input) לא יכילו לוגיקת בדיקה
- ✅ רכיבי UI רק יקבלו "מצב" (Error State) מה-Schema

---

### **3. ולידציה צד-שרת (Security Integrity)**

- ✅ ולידציה צד-שרת היא **חובה** לכל שדה (אבטחה ושלמות נתונים)
- ✅ ולידציה צד-לקוח היא **UX בלבד** (Frontend לעולם לא קובע את "האמת")

---

## 📋 פעולות נדרשות

### **Phase 1: Backend (Team 20)** 🔴 **P0**

#### **1.1 עדכון ErrorResponse Schema**

**מיקום:** OpenAPI Spec  
**פעולה:** להוסיף שדה אופציונלי `error_code` ל-ErrorResponse

```yaml
ErrorResponse:
  type: object
  properties:
    detail:
      type: string
      description: "Error message (for Pydantic errors)"
      example: "Invalid credentials"
    error_code:
      type: string
      description: "Error code (optional, for Contract-First)"
      example: "AUTH_INVALID_CREDENTIALS"
      nullable: true
```

#### **1.2 עדכון Backend Implementation**

**פעולה:** להוסיף תמיכה ב-`error_code` בכל תגובות שגיאה

**דוגמה:**
```python
# Backend error response
{
    "detail": "Invalid credentials",  # Keep for Pydantic
    "error_code": "AUTH_INVALID_CREDENTIALS"  # New optional field
}
```

---

### **Phase 2: Frontend - PhoenixSchema (Team 30)** 🔴 **P0**

#### **2.1 יצירת תיקיית Schemas**

**מיקום:** `ui/src/logic/schemas/`  
**פעולה:** ליצור את התיקייה

#### **2.2 יצירת User Schema**

**קובץ:** `ui/src/logic/schemas/userSchema.js`

**תוכן:**
```javascript
/**
 * User Validation Schema
 * 
 * @description Centralized validation rules for user forms
 * @module logic/schemas/userSchema
 */

/**
 * Validate email field
 * 
 * @param {string} value - Email value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateEmail = (value) => {
  if (!value?.trim()) {
    return { isValid: false, error: 'שדה חובה' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: 'אימייל לא תקין' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate phone number field
 * 
 * @param {string} value - Phone number value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validatePhoneNumber = (value) => {
  if (!value) {
    return { isValid: true, error: null }; // Optional field
  }
  
  const clean = value.replace(/[\s-()]/g, '');
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  
  if (!phoneRegex.test(clean)) {
    return { isValid: false, error: 'מספר טלפון חייב להיות בפורמט E.164 (דוגמה: +972501234567)' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate entire user form
 * 
 * @param {Object} formData - Form data (camelCase)
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateUserForm = (formData) => {
  const errors = {};
  
  // Email validation
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  // Phone validation
  const phoneResult = validatePhoneNumber(formData.phoneNumber);
  if (!phoneResult.isValid) {
    errors.phoneNumber = phoneResult.error;
  }
  
  // Add more validations...
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

#### **2.3 עדכון Components**

**חובה:** להסיר לוגיקת בדיקה מתוך Components

**לפני (❌ לא נכון):**
```javascript
const ProfileView = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // ❌ לוגיקת בדיקה בתוך Component
    if (!value.trim()) {
      setEmailError('שדה חובה');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('אימייל לא תקין');
    } else {
      setEmailError(null);
    }
  };
  
  // ...
};
```

**אחרי (✅ נכון):**
```javascript
import { validateEmail } from '../../logic/schemas/userSchema.js';

const ProfileView = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // ✅ שימוש ב-Schema מרכזי
    const result = validateEmail(value);
    setEmailError(result.error);
  };
  
  // ...
};
```

---

### **Phase 3: Frontend - Error Handling (Team 30)** 🔴 **P0**

#### **3.1 יצירת Error Code Dictionary**

**קובץ:** `ui/src/logic/errorCodes.js`

**תוכן:**
```javascript
/**
 * Error Code Dictionary
 * 
 * @description Centralized error code to Hebrew message mapping
 * @module logic/errorCodes
 */

/**
 * Error code to Hebrew message mapping
 */
export const ERROR_CODES = {
  // Authentication errors
  'AUTH_INVALID_CREDENTIALS': 'שם משתמש או סיסמה שגויים. אנא נסה שוב.',
  'AUTH_TOKEN_EXPIRED': 'פג תוקף ההתחברות. אנא התחבר מחדש.',
  'AUTH_UNAUTHORIZED': 'אין הרשאה לבצע פעולה זו.',
  
  // Validation errors
  'VALIDATION_FIELD_REQUIRED': 'שדה חובה',
  'VALIDATION_INVALID_EMAIL': 'אימייל לא תקין',
  'VALIDATION_INVALID_PHONE': 'מספר טלפון לא תקין',
  'VALIDATION_INVALID_FORMAT': 'פורמט לא תקין',
  
  // User errors
  'USER_NOT_FOUND': 'משתמש לא נמצא.',
  'USER_ALREADY_EXISTS': 'משתמש כבר קיים.',
  'USER_UPDATE_FAILED': 'עדכון המשתמש נכשל.',
  
  // Generic errors
  'SERVER_ERROR': 'שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר.',
  'NETWORK_ERROR': 'שגיאת רשת. אנא בדוק את החיבור.',
  'UNKNOWN_ERROR': 'שגיאה בלתי צפויה. אנא נסה שוב.',
};

/**
 * Translate error code or message to Hebrew
 * 
 * @param {string} errorCode - Error code (if available)
 * @param {string} detail - Error detail message (fallback)
 * @returns {string} - Hebrew error message
 */
export const translateError = (errorCode, detail = null) => {
  // Priority 1: Use error_code if available
  if (errorCode && ERROR_CODES[errorCode]) {
    return ERROR_CODES[errorCode];
  }
  
  // Priority 2: Translate detail message
  if (detail) {
    // Check for exact match
    const detailLower = detail.toLowerCase();
    if (ERROR_CODES[detailLower]) {
      return ERROR_CODES[detailLower];
    }
    
    // Check for partial match
    for (const [key, value] of Object.entries(ERROR_CODES)) {
      if (detailLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // If backend provides Hebrew, use it directly
    // Otherwise, return generic message
    return detail || 'שגיאה בעדכון. אנא נסה שוב.';
  }
  
  // Fallback
  return ERROR_CODES['UNKNOWN_ERROR'];
};
```

#### **3.2 עדכון Error Handler**

**קובץ:** `ui/src/utils/errorHandler.js` (חדש)

**תוכן:**
```javascript
import { translateError } from '../logic/errorCodes.js';

/**
 * Handle API Error Response
 * 
 * @param {Error} error - Axios error
 * @returns {Object} - { fieldErrors: Object, formError: string|null }
 */
export const handleApiError = (error) => {
  const fieldErrors = {};
  let formError = null;
  
  if (error.response?.status === 400) {
    const responseData = error.response.data;
    const errorCode = responseData?.error_code;
    const detail = responseData?.detail;
    
    // Handle Pydantic validation errors (array)
    if (Array.isArray(detail)) {
      detail.forEach(err => {
        const field = err.loc?.[err.loc.length - 1];
        const camelField = snakeToCamel(field);
        const fieldErrorCode = err.error_code || errorCode;
        fieldErrors[camelField] = translateError(fieldErrorCode, err.msg);
      });
    } else if (typeof detail === 'string') {
      // Generic error message
      formError = translateError(errorCode, detail);
    }
  } else if (error.response?.status === 401) {
    const errorCode = error.response.data?.error_code;
    const detail = error.response.data?.detail;
    formError = translateError(errorCode, detail || 'אימות נכשל. אנא בדוק את פרטיך.');
  } else if (error.response?.status === 500) {
    const errorCode = error.response.data?.error_code;
    formError = translateError(errorCode, 'שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר.');
  } else {
    formError = translateError(null, 'שגיאה בלתי צפויה. אנא נסה שוב.');
  }
  
  return { fieldErrors, formError };
};
```

---

### **Phase 4: עדכון התוכנית (Team 30)** 🟡 **P1**

#### **4.1 עדכון TT2_FORM_VALIDATION_FRAMEWORK.md**

**פעולות:**
1. להוסיף פרק על PhoenixSchema
2. לעדכן את Error Handling לפי המודל ההיברידי
3. להסיר Validation Rules מתוך Components
4. להוסיף דוגמאות לשימוש ב-Schemas

---

## 📋 Checklist למימוש

### **Team 20 (Backend):**
- [ ] עדכון OpenAPI Spec - הוספת `error_code` ל-ErrorResponse
- [ ] עדכון Backend - הוספת תמיכה ב-`error_code` בכל תגובות שגיאה
- [ ] בדיקות - וידוא שכל שגיאות מחזירות `error_code` (אופציונלי)

### **Team 30 (Frontend):**
- [ ] יצירת תיקיית `src/logic/schemas/`
- [ ] יצירת `userSchema.js` עם Validation Rules
- [ ] יצירת `errorCodes.js` עם מילון Error Codes
- [ ] יצירת `errorHandler.js` עם Error Handler מעודכן
- [ ] עדכון Components - הסרת לוגיקת בדיקה, שימוש ב-Schemas
- [ ] עדכון התוכנית `TT2_FORM_VALIDATION_FRAMEWORK.md`

---

## 🔗 מסמכים רלוונטיים

1. **החלטה אדריכלית:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md`
2. **ניתוח:** `_COMMUNICATION/team_10/TEAM_10_ARCHITECT_VALIDATION_DIRECTIVE_ANALYSIS.md`
3. **תוכנית Team 30:** `_COMMUNICATION/team_30_staging/TT2_FORM_VALIDATION_FRAMEWORK.md`
4. **OpenAPI Spec:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**log_entry | Team 10 | VALIDATION_HYBRID_IMPLEMENTATION | PLAN_CREATED | 2026-02-01**

**Status:** 📋 **IMPLEMENTATION PLAN READY - AWAITING TEAM EXECUTION**
