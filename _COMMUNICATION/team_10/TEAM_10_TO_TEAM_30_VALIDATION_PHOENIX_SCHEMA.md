# 📡 הודעה: Team 10 → Team 30 (Validation PhoenixSchema)

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** VALIDATION_PHOENIX_SCHEMA | Status: 🔴 **P0 MANDATORY**  
**Priority:** 🔴 **CRITICAL - ARCHITECTURAL MANDATE**

---

## 📋 Executive Summary

**החלטה אדריכלית:** מודל ולידציה היברידי (v1.2)  
**מקור:** `ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md`  
**סטטוס:** ✅ **MANDATORY - APPROVED BY ARCHITECT**

---

## 🎯 המשימה

**ליצור PhoenixSchema מרכזי ולהעביר את כל Validation Rules ל-Schemas.**

---

## 📋 פעולות נדרשות

### **1. יצירת תיקיית Schemas** 🔴 **P0**

**מיקום:** `ui/src/logic/schemas/`  
**פעולה:** ליצור את התיקייה

```bash
mkdir -p ui/src/logic/schemas
```

---

### **2. יצירת User Schema** 🔴 **P0**

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
 * Validate first name field
 * 
 * @param {string} value - First name value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateFirstName = (value) => {
  if (value && value.length > 100) {
    return { isValid: false, error: 'שם פרטי לא יכול להיות יותר מ-100 תווים' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate last name field
 * 
 * @param {string} value - Last name value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateLastName = (value) => {
  if (value && value.length > 100) {
    return { isValid: false, error: 'שם משפחה לא יכול להיות יותר מ-100 תווים' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate display name field
 * 
 * @param {string} value - Display name value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateDisplayName = (value) => {
  if (value && value.length > 100) {
    return { isValid: false, error: 'שם תצוגה לא יכול להיות יותר מ-100 תווים' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate timezone field
 * 
 * @param {string} value - Timezone value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateTimezone = (value) => {
  if (!value) {
    return { isValid: false, error: 'שדה חובה' };
  }
  
  const timezoneRegex = /^[A-Za-z_]+\/[A-Za-z_]+$/;
  if (!timezoneRegex.test(value)) {
    return { isValid: false, error: 'אזור זמן לא תקין' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate language field
 * 
 * @param {string} value - Language value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateLanguage = (value) => {
  if (!value) {
    return { isValid: false, error: 'שדה חובה' };
  }
  
  const validLanguages = ['he', 'en', 'ar', 'ru'];
  if (!validLanguages.includes(value)) {
    return { isValid: false, error: 'שפה לא תקינה' };
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
  
  // First name validation
  const firstNameResult = validateFirstName(formData.firstName);
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.error;
  }
  
  // Last name validation
  const lastNameResult = validateLastName(formData.lastName);
  if (!lastNameResult.isValid) {
    errors.lastName = lastNameResult.error;
  }
  
  // Display name validation
  const displayNameResult = validateDisplayName(formData.displayName);
  if (!displayNameResult.isValid) {
    errors.displayName = displayNameResult.error;
  }
  
  // Timezone validation
  const timezoneResult = validateTimezone(formData.timezone);
  if (!timezoneResult.isValid) {
    errors.timezone = timezoneResult.error;
  }
  
  // Language validation
  const languageResult = validateLanguage(formData.language);
  if (!languageResult.isValid) {
    errors.language = languageResult.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

---

### **3. יצירת Error Code Dictionary** 🔴 **P0**

**קובץ:** `ui/src/logic/errorCodes.js`

**תוכן:** (ראה `TEAM_10_VALIDATION_HYBRID_IMPLEMENTATION_PLAN.md`)

---

### **4. יצירת Error Handler** 🔴 **P0**

**קובץ:** `ui/src/utils/errorHandler.js`

**תוכן:** (ראה `TEAM_10_VALIDATION_HYBRID_IMPLEMENTATION_PLAN.md`)

---

### **5. עדכון Components** 🔴 **P0**

**חובה:** להסיר לוגיקת בדיקה מתוך Components ולהשתמש ב-Schemas

**דוגמה - ProfileView:**

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
import { validateEmail, validateUserForm } from '../../logic/schemas/userSchema.js';
import { handleApiError } from '../../utils/errorHandler.js';

const ProfileView = () => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    // ...
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    
    // ✅ שימוש ב-Schema מרכזי
    const result = validateEmail(value);
    setFieldErrors(prev => ({
      ...prev,
      email: result.error
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ שימוש ב-Schema מרכזי
    const { isValid, errors } = validateUserForm(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      // API call...
    } catch (error) {
      // ✅ שימוש ב-Error Handler מעודכן
      const { fieldErrors: apiErrors, formError: apiError } = handleApiError(error);
      setFieldErrors(prev => ({ ...prev, ...apiErrors }));
      setFormError(apiError);
    }
  };
  
  // ...
};
```

---

### **6. עדכון התוכנית** 🟡 **P1**

**קובץ:** `_COMMUNICATION/team_30_staging/TT2_FORM_VALIDATION_FRAMEWORK.md`

**פעולות:**
1. להוסיף פרק על PhoenixSchema
2. לעדכן את Error Handling לפי המודל ההיברידי
3. להסיר Validation Rules מתוך Components
4. להוסיף דוגמאות לשימוש ב-Schemas

---

## 📋 Checklist

- [ ] יצירת תיקיית `src/logic/schemas/`
- [ ] יצירת `userSchema.js` עם Validation Rules
- [ ] יצירת `errorCodes.js` עם מילון Error Codes
- [ ] יצירת `errorHandler.js` עם Error Handler מעודכן
- [ ] עדכון Components - הסרת לוגיקת בדיקה, שימוש ב-Schemas
  - [ ] ProfileView
  - [ ] PasswordChangeForm
  - [ ] LoginForm
  - [ ] RegisterForm
- [ ] עדכון התוכנית `TT2_FORM_VALIDATION_FRAMEWORK.md`

---

## ⚠️ הערות חשובות

1. **חובה:** רכיבי UI לא יכילו לוגיקת בדיקה - רק יקבלו "מצב" (Error State) מה-Schema
2. **ריכוזיות:** כל Validation Rules צריכות להיות ב-Schemas מרכזיות
3. **תאימות:** לשמור על תאימות עם הקוד הקיים (לא לשבור)

---

## 🔗 מסמכים רלוונטיים

1. **החלטה אדריכלית:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md`
2. **תוכנית מימוש:** `_COMMUNICATION/team_10/TEAM_10_VALIDATION_HYBRID_IMPLEMENTATION_PLAN.md`
3. **תוכנית Team 30:** `_COMMUNICATION/team_30_staging/TT2_FORM_VALIDATION_FRAMEWORK.md`

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**log_entry | Team 10 | VALIDATION_PHOENIX_SCHEMA | TO_TEAM_30 | 2026-02-01**

**Status:** 🔴 **P0 MANDATORY - AWAITING TEAM 30 IMPLEMENTATION**
