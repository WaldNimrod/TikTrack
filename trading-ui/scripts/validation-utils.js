// ===== VALIDATION UTILS - מערכת ולידציה גלובלית =====
/*
 * Validation Utils - TikTrack
 * ===========================
 * 
 * מערכת ולידציה גלובלית עם תמיכה בוולידציה בזמן אמת ובזמן שליחה
 * 
 * 📖 דוקומנטציה מפורטת: VALIDATION_SYSTEM_DOCUMENTATION.md
 * 
 * קובץ: trading-ui/scripts/validation-utils.js
 * גרסה: 2.1
 * עדכון אחרון: אוגוסט 27, 2025
 * מחבר: TikTrack Development Team
 */

// ===== קבועים =====

// כללי ולידציה ברירת מחדל
const DEFAULT_VALIDATION_RULES = {
    text: {
        required: false,
        minLength: 0,
        maxLength: 255,
        pattern: /.*/,
        customValidation: null
    },
    number: {
        required: false,
        min: null,
        max: null,
        step: null,
        customValidation: null
    },
    email: {
        required: false,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        customValidation: null
    },
    date: {
        required: false,
        minDate: null,
        maxDate: null,
        customValidation: null
    },
    select: {
        required: false,
        customValidation: null
    }
};

// ===== פונקציות עזר =====

/**
 * בדיקה אם תאריך תקין
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

/**
 * בדיקה אם אימייל תקין
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * בדיקה אם מספר טלפון תקין
 */
function isValidPhone(phone) {
    return /^[\d\s\-\+\(\)]+$/.test(phone);
}

// ===== פונקציות ויזואליות =====

/**
 * הצגת שגיאה בשדה
 */
function showFieldError(input, message) {
    // הסרת סימון קודם
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    
    // הסרת הודעת שגיאה קודמת
    const existingError = input.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // הוספת הודעת שגיאה חדשה
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
    
    }

/**
 * הצגת הצלחה בשדה
 */
function showFieldSuccess(input) {
    // הסרת סימון קודם
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    // הסרת הודעת שגיאה
    const existingError = input.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    }

/**
 * ניקוי שגיאה משדה
 */
function clearFieldError(input) {
    input.classList.remove('is-invalid');
    const existingError = input.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * ניקוי ולידציה משדה
 */
function clearFieldValidation(input) {
    input.classList.remove('is-valid', 'is-invalid');
    const existingError = input.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * ניקוי כל שגיאות הוולידציה
 */
function clearValidationErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        clearFieldValidation(input);
    });
}

// ===== פונקציות ולידציה =====

/**
 * ולידציה של שדה טקסט
 */
function validateTextField(input, rules = {}) {
    const value = input.value.trim();
    const mergedRules = { ...DEFAULT_VALIDATION_RULES.text, ...rules };
    
    // בדיקת שדה חובה
    if (mergedRules.required && value.length === 0) {
        showFieldError(input, 'שדה זה הוא חובה');
        return false;
    }
    
    // אם השדה ריק ולא חובה - תקין
    if (value.length === 0) {
        clearFieldValidation(input);
        return true;
    }
    
    // בדיקת אורך מינימלי
    if (value.length < mergedRules.minLength) {
        showFieldError(input, `מינימום ${mergedRules.minLength} תווים`);
        return false;
    }
    
    // בדיקת אורך מקסימלי
    if (value.length > mergedRules.maxLength) {
        showFieldError(input, `מקסימום ${mergedRules.maxLength} תווים`);
        return false;
    }
    
    // בדיקת תבנית
    if (!mergedRules.pattern.test(value)) {
        showFieldError(input, 'ערך לא תקין');
        return false;
    }
    
    // בדיקה מותאמת אישית
    if (mergedRules.customValidation) {
        const customResult = mergedRules.customValidation(value, input);
        if (customResult !== true) {
            showFieldError(input, customResult);
            return false;
        }
    }
    
    // אם הכל תקין
    showFieldSuccess(input);
    return true;
}

/**
 * ולידציה של שדה מספר
 */
function validateNumberField(input, rules = {}) {
    const value = input.value.trim();
    const mergedRules = { ...DEFAULT_VALIDATION_RULES.number, ...rules };
    
    // בדיקת שדה חובה
    if (mergedRules.required && value.length === 0) {
        showFieldError(input, 'שדה זה הוא חובה');
        return false;
    }
    
    // אם השדה ריק ולא חובה - תקין
    if (value.length === 0) {
        clearFieldValidation(input);
        return true;
    }
    
    // בדיקה שהערך הוא מספר
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        showFieldError(input, 'ערך מספרי לא תקין');
        return false;
    }
    
    // בדיקת ערך מינימלי
    if (mergedRules.min !== null && numValue < mergedRules.min) {
        showFieldError(input, `ערך מינימלי: ${mergedRules.min}`);
        return false;
    }
    
    // בדיקת ערך מקסימלי
    if (mergedRules.max !== null && numValue > mergedRules.max) {
        showFieldError(input, `ערך מקסימלי: ${mergedRules.max}`);
        return false;
    }
    
    // בדיקה מותאמת אישית
    if (mergedRules.customValidation) {
        const customResult = mergedRules.customValidation(numValue, input);
        if (customResult !== true) {
            showFieldError(input, customResult);
            return false;
        }
    }
    
    // אם הכל תקין
    showFieldSuccess(input);
    return true;
}

/**
 * ולידציה של שדה אימייל
 */
function validateEmailField(input, rules = {}) {
    const value = input.value.trim();
    const mergedRules = { ...DEFAULT_VALIDATION_RULES.email, ...rules };
    
    // בדיקת שדה חובה
    if (mergedRules.required && value.length === 0) {
        showFieldError(input, 'שדה זה הוא חובה');
        return false;
    }
    
    // אם השדה ריק ולא חובה - תקין
    if (value.length === 0) {
        clearFieldValidation(input);
        return true;
    }
    
    // בדיקת תבנית אימייל
    if (!mergedRules.pattern.test(value)) {
        showFieldError(input, 'כתובת אימייל לא תקינה');
        return false;
    }
    
    // בדיקה מותאמת אישית
    if (mergedRules.customValidation) {
        const customResult = mergedRules.customValidation(value, input);
        if (customResult !== true) {
            showFieldError(input, customResult);
            return false;
        }
    }
    
    // אם הכל תקין
    showFieldSuccess(input);
    return true;
}

/**
 * ולידציה של שדה תאריך
 */
function validateDateField(input, rules = {}) {
    const value = input.value.trim();
    const mergedRules = { ...DEFAULT_VALIDATION_RULES.date, ...rules };
    
    // בדיקת שדה חובה
    if (mergedRules.required && value.length === 0) {
        showFieldError(input, 'שדה זה הוא חובה');
        return false;
    }
    
    // אם השדה ריק ולא חובה - תקין
    if (value.length === 0) {
        clearFieldValidation(input);
        return true;
    }
    
    // בדיקה שהערך הוא תאריך תקין
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) {
        showFieldError(input, 'תאריך לא תקין');
        return false;
    }
    
    // בדיקת תאריך מינימלי
    if (mergedRules.minDate) {
        const minDate = new Date(mergedRules.minDate);
        if (dateValue < minDate) {
            showFieldError(input, `תאריך מינימלי: ${minDate.toLocaleDateString('he-IL')}`);
            return false;
        }
    }
    
    // בדיקת תאריך מקסימלי
    if (mergedRules.maxDate) {
        const maxDate = new Date(mergedRules.maxDate);
        if (dateValue > maxDate) {
            showFieldError(input, `תאריך מקסימלי: ${maxDate.toLocaleDateString('he-IL')}`);
            return false;
        }
    }
    
    // בדיקה מותאמת אישית
    if (mergedRules.customValidation) {
        const customResult = mergedRules.customValidation(value, input);
        if (customResult !== true) {
            showFieldError(input, customResult);
            return false;
        }
    }
    
    // אם הכל תקין
    showFieldSuccess(input);
    return true;
}

/**
 * ולידציה של שדה סלקט
 */
function validateSelectField(input, rules = {}) {
    const value = input.value;
    const mergedRules = { ...DEFAULT_VALIDATION_RULES.select, ...rules };
    
    // בדיקת שדה חובה
    if (mergedRules.required && (!value || value === '')) {
        showFieldError(input, 'שדה זה הוא חובה');
        return false;
    }
    
    // אם השדה ריק ולא חובה - תקין
    if (!value || value === '') {
        clearFieldValidation(input);
        return true;
    }
    
    // בדיקה מותאמת אישית
    if (mergedRules.customValidation) {
        const customResult = mergedRules.customValidation(value, input);
        if (customResult !== true) {
            showFieldError(input, customResult);
            return false;
        }
    }
    
    // אם הכל תקין
    showFieldSuccess(input);
    return true;
}

/**
 * ולידציה כללית של שדה
 */
function validateField(input, rules = {}) {
    switch (input.type) {
        case 'text':
        case 'password':
        case 'email':
        case 'tel':
        case 'url':
            return validateTextField(input, rules);
            
        case 'number':
            return validateNumberField(input, rules);
            
        case 'date':
            return validateDateField(input, rules);
            
        default:
            if (input.tagName === 'SELECT') {
                return validateSelectField(input, rules);
            } else if (input.tagName === 'TEXTAREA') {
                return validateTextField(input, rules);
            } else {
                return validateTextField(input, rules);
            }
    }
}

/**
 * הגדרת ולידציה לשדה
 */
function setupFieldValidation(input, rules = {}) {
    // הסרת event listeners קודמים
    if (input._validationHandler) {
        input.removeEventListener('input', input._validationHandler);
        input.removeEventListener('blur', input._validationHandler);
        input.removeEventListener('change', input._validationHandler);
    }
    
    // יצירת פונקציית ולידציה
    input._validationHandler = () => validateField(input, rules);
    
    // הוספת event listeners
    input.addEventListener('input', input._validationHandler);
    input.addEventListener('blur', input._validationHandler);
    input.addEventListener('change', input._validationHandler);
}

// ===== פונקציות ולידציה מותאמות =====

/**
 * ולידציה של סמל מטבע
 */
function validateCurrencySymbol(value) {
    if (!value || value.length === 0) return 'סמל מטבע הוא חובה';
    if (value.length !== 3) return 'סמל מטבע חייב להיות 3 תווים';
    if (!/^[A-Z]{3}$/.test(value)) return 'סמל מטבע חייב להיות 3 אותיות גדולות';
    return true;
}

/**
 * ולידציה של שער מטבע
 */
function validateCurrencyRate(value) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'שער מטבע חייב להיות מספר';
    if (numValue <= 0) return 'שער מטבע חייב להיות חיובי';
    if (numValue > 1000000) return 'שער מטבע לא יכול להיות יותר מ-1,000,000';
    return true;
}

/**
 * ולידציה של סמל טיקר
 */
function validateTickerSymbol(value) {
    if (!value || value.length === 0) return 'סמל טיקר הוא חובה';
    if (value.length > 10) return 'סמל טיקר לא יכול להיות יותר מ-10 תווים';
    if (!/^[A-Z0-9.]+$/.test(value)) return 'סמל טיקר יכול להכיל רק אותיות גדולות, מספרים ונקודות';
    return true;
}

// ===== פונקציה ראשית =====

/**
 * ולידציה של טופס
 */
function validateForm(formId, validationRules = {}) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error('❌ Form not found:', formId);
        return false;
    }
    
    let isValid = true;
    const errors = {};
    
    // בדיקת שדות חובה
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value || field.value.trim() === '') {
            showFieldError(field, 'שדה זה הוא חובה');
            isValid = false;
            errors[field.name] = 'שדה זה הוא חובה';
        }
    });
    
    // בדיקת שדות תאריך
    const dateFields = form.querySelectorAll('input[type="date"]');
    dateFields.forEach(field => {
        if (field.value && !isValidDate(field.value)) {
            showFieldError(field, 'תאריך לא תקין');
            isValid = false;
            errors[field.name] = 'תאריך לא תקין';
        }
    });
    
    // בדיקת שדות מספר
    const numberFields = form.querySelectorAll('input[type="number"]');
    numberFields.forEach(field => {
        if (field.value && isNaN(parseFloat(field.value))) {
            showFieldError(field, 'ערך מספרי לא תקין');
            isValid = false;
            errors[field.name] = 'ערך מספרי לא תקין';
        }
    });
    
    // בדיקת ולידציה מותאמת אישית
    Object.keys(validationRules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            const fieldRules = validationRules[fieldName];
            const fieldValid = validateField(field, fieldRules);
            if (!fieldValid) {
                isValid = false;
                errors[fieldName] = 'ולידציה נכשלה';
            }
        }
    });
    
    if (!isValid) {
        // הצגת הודעת שגיאה כללית
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('יש לתקן שגיאות בטופס');
        } else {
            alert('יש לתקן שגיאות בטופס');
        }
    }
    
    return isValid;
}

// ===== פונקציות אתחול =====

/**
 * אתחול מערכת הוולידציה לטופס
 */
function initializeValidation(formId, validationRules = {}) {
    const form = document.getElementById(formId);
    if (!form) {
        console.warn(`⚠️ Form ${formId} not found - skipping validation initialization`);
        return;
    }

    // מציאת כל השדות בטופס
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
        // הסרת event listeners קודמים
        if (input._validationHandler) {
            input.removeEventListener('input', input._validationHandler);
            input.removeEventListener('blur', input._validationHandler);
            input.removeEventListener('change', input._validationHandler);
        }
        
        // יצירת פונקציית ולידציה מותאמת לשדה
        input._validationHandler = () => {
            const fieldRules = validationRules[input.name] || {};
            // ולידציה לפי סוג השדה
            let isValid = false;
            
            switch (input.type) {
                case 'text':
                case 'password':
                case 'email':
                case 'tel':
                case 'url':
                    isValid = validateTextField(input, fieldRules);
                    break;
                    
                case 'number':
                    isValid = validateNumberField(input, fieldRules);
                    break;
                    
                case 'date':
                    isValid = validateDateField(input, fieldRules);
                    break;
                    
                default:
                    if (input.tagName === 'SELECT') {
                        isValid = validateSelectField(input, fieldRules);
                    } else if (input.tagName === 'TEXTAREA') {
                        isValid = validateTextField(input, fieldRules);
                    } else {
                        isValid = validateField(input, fieldRules);
                    }
                    break;
            }
            
            return isValid;
        };
        
        // הוספת event listeners
        input.addEventListener('input', input._validationHandler);  // בזמן הקלדה
        input.addEventListener('blur', input._validationHandler);   // בזמן עזיבת השדה
        input.addEventListener('change', input._validationHandler); // בזמן שינוי ערך
        
        });
    
    }

/**
 * ניקוי וולידציה לטופס
 */
function clearValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.warn(`⚠️ Form ${formId} not found - skipping validation clearing`);
        return;
    }

    // ניקוי כל השדות
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        clearFieldValidation(input);
    });

    }

// ===== ייצוא פונקציות =====

// ייצוא פונקציות עזר
window.isValidDate = isValidDate;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;

// ייצוא פונקציות ויזואליות
window.showFieldError = showFieldError;
window.showFieldSuccess = showFieldSuccess;
window.clearFieldError = clearFieldError;
window.clearFieldValidation = clearFieldValidation;
window.clearValidationErrors = clearValidationErrors;

// ייצוא פונקציות ולידציה
window.validateForm = validateForm;
window.validateField = validateField;
window.validateTextField = validateTextField;
window.validateNumberField = validateNumberField;
window.validateEmailField = validateEmailField;
window.validateDateField = validateDateField;
window.validateSelectField = validateSelectField;
window.setupFieldValidation = setupFieldValidation;

// ייצוא פונקציות ולידציה מותאמות
window.validateCurrencySymbol = validateCurrencySymbol;
window.validateCurrencyRate = validateCurrencyRate;
window.validateTickerSymbol = validateTickerSymbol;

// ייצוא פונקציות אתחול
window.initializeValidation = initializeValidation;
window.clearValidation = clearValidation;

// ייצוא המודול
window.validationUtils = {
    validateForm,
    showFieldError,
    showFieldSuccess,
    clearFieldError,
    clearFieldValidation,
    clearValidationErrors,
    isValidDate,
    isValidEmail,
    isValidPhone,
    setupFieldValidation,
    validateField,
    validateTextField,
    validateNumberField,
    validateEmailField,
    validateDateField,
    validateSelectField,
    validateCurrencySymbol,
    validateCurrencyRate,
    validateTickerSymbol,
    initializeValidation,
    clearValidation
};

