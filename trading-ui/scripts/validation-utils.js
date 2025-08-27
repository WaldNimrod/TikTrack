// ===== VALIDATION UTILS - פונקציות גלובליות לוולידציה =====
/*
 * Validation Utils - TikTrack
 * ===========================
 * 
 * מערכת וולידציה גלובלית עם תמיכה בוולידציה בזמן אמת
 * מספקת סימון ויזואלי (✓ ירוק, ✗ אדום) ובדיקות מותאמות
 * 
 * תכונות:
 * - וולידציה בזמן אמת (oninput, onblur)
 * - סימון ויזואלי עם אייקונים
 * - תמיכה בכל סוגי השדות
 * - הגדרות מותאמות לכל שדה
 * 
 * קובץ: trading-ui/scripts/validation-utils.js
 * גרסה: 2.0
 * עדכון אחרון: אוגוסט 27, 2025
 */

// ===== הגדרות ברירת מחדל =====
const DEFAULT_VALIDATION_RULES = {
    // שדות טקסט רגילים
    text: {
        required: false,
        minLength: 0,
        maxLength: 255,
        pattern: null,
        customValidation: null
    },
    
    // שדות מספריים
    number: {
        required: false,
        min: null,
        max: null,
        step: null,
        customValidation: null
    },
    
    // שדות אימייל
    email: {
        required: false,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        customValidation: null
    },
    
    // שדות תאריך
    date: {
        required: false,
        minDate: null,
        maxDate: null,
        customValidation: null
    },
    
    // שדות סלקט
    select: {
        required: false,
        customValidation: null
    }
};

/**
 * ולידציה של טופס
 * @param {string} formId - מזהה הטופס
 * @param {Object} validationRules - כללי הוולידציה
 * @returns {boolean} האם הטופס תקין
 */
function validateForm(formId, validationRules = {}) {
    console.log(`🔍 Validating form: ${formId}`);
    
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`❌ Form ${formId} not found`);
        return false;
    }

    let isValid = true;
    const errors = {};

    // בדיקת שדות חובה
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            errors[field.name] = 'שדה זה הוא חובה';
            showFieldError(field, 'שדה זה הוא חובה');
        } else {
            clearFieldError(field);
        }
    });

    // בדיקת תאריכים
    const dateFields = form.querySelectorAll('input[type="date"]');
    dateFields.forEach(field => {
        if (field.value && !isValidDate(field.value)) {
            isValid = false;
            errors[field.name] = 'תאריך לא תקין';
            showFieldError(field, 'תאריך לא תקין');
        }
    });

    // בדיקת מספרים
    const numberFields = form.querySelectorAll('input[type="number"]');
    numberFields.forEach(field => {
        if (field.value && isNaN(parseFloat(field.value))) {
            isValid = false;
            errors[field.name] = 'ערך מספרי לא תקין';
            showFieldError(field, 'ערך מספרי לא תקין');
        }
    });

    // בדיקות מותאמות אישית
    Object.keys(validationRules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            const rule = validationRules[fieldName];
            if (rule.required && !field.value.trim()) {
                isValid = false;
                errors[fieldName] = rule.message || 'שדה זה הוא חובה';
                showFieldError(field, rule.message || 'שדה זה הוא חובה');
            }
        }
    });

    return isValid;
}

/**
 * הצגת שגיאה בשדה
 * @param {HTMLElement} field - אלמנט השדה
 * @param {string} message - הודעת השגיאה
 */
function showFieldError(field, message) {
    // הסרת שגיאות קודמות
    clearFieldError(field);
    
    // הוספת מחלקת שגיאה
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    
    // יצירת אלמנט הודעת שגיאה
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    errorDiv.id = `${field.name}-error`;
    
    // הוספה אחרי השדה
    field.parentNode.appendChild(errorDiv);
    
    // הוספת אייקון שגיאה
    addValidationIcon(field, 'error');
}

/**
 * הצגת הצלחה בשדה
 * @param {HTMLElement} field - אלמנט השדה
 */
function showFieldSuccess(field) {
    // הסרת שגיאות קודמות
    clearFieldError(field);
    
    // הוספת מחלקת הצלחה
    field.classList.add('is-valid');
    field.classList.remove('is-invalid');
    
    // הוספת אייקון הצלחה
    addValidationIcon(field, 'success');
}

/**
 * ניקוי שגיאות משדה
 * @param {HTMLElement} field - אלמנט השדה
 */
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    
    // הסרת הודעת שגיאה קיימת
    const existingError = document.getElementById(`${field.name}-error`);
    if (existingError) {
        existingError.remove();
    }
    
    // הסרת אייקון
    removeValidationIcon(field);
}

/**
 * ניקוי כל הסימונים משדה
 * @param {HTMLElement} field - אלמנט השדה
 */
function clearFieldValidation(field) {
    field.classList.remove('is-valid', 'is-invalid');
    
    // הסרת הודעת שגיאה קיימת
    const existingError = document.getElementById(`${field.name}-error`);
    if (existingError) {
        existingError.remove();
    }
    
    // הסרת אייקון
    removeValidationIcon(field);
}

/**
 * הוספת אייקון וולידציה
 * @param {HTMLElement} field - אלמנט השדה
 * @param {string} type - סוג האייקון ('success' או 'error')
 */
function addValidationIcon(field, type) {
    // הסרת אייקון קודם
    removeValidationIcon(field);
    
    // יצירת אייקון חדש
    const icon = document.createElement('span');
    icon.className = `validation-icon validation-icon-${type}`;
    icon.innerHTML = type === 'success' ? '✓' : '✗';
    icon.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 16px;
        font-weight: bold;
        z-index: 10;
        pointer-events: none;
    `;
    
    // צבעים
    if (type === 'success') {
        icon.style.color = '#28a745';
    } else {
        icon.style.color = '#dc3545';
    }
    
    // הוספה לשדה
    const parent = field.parentElement;
    if (parent) {
        parent.style.position = 'relative';
        parent.appendChild(icon);
    }
}

/**
 * הסרת אייקון וולידציה
 * @param {HTMLElement} field - אלמנט השדה
 */
function removeValidationIcon(field) {
    const parent = field.parentElement;
    if (parent) {
        const icon = parent.querySelector('.validation-icon');
        if (icon) {
            icon.remove();
        }
    }
}

/**
 * ניקוי כל שגיאות הוולידציה בטופס
 * @param {string} formId - מזהה הטופס
 */
function clearValidationErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // ניקוי מחלקות שגיאה
    const invalidFields = form.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
        field.classList.remove('is-invalid');
    });

    // הסרת הודעות שגיאה
    const errorMessages = form.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(error => {
        error.remove();
    });
}

/**
 * בדיקת תקינות תאריך
 * @param {string} dateString - מחרוזת התאריך
 * @returns {boolean} האם התאריך תקין
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * בדיקת תקינות אימייל
 * @param {string} email - כתובת האימייל
 * @returns {boolean} האם האימייל תקין
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * בדיקת תקינות מספר טלפון
 * @param {string} phone - מספר הטלפון
 * @returns {boolean} האם מספר הטלפון תקין
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 9;
}

// ===== פונקציות וולידציה בזמן אמת =====

/**
 * הגדרת וולידציה לשדה
 * @param {string} fieldId - מזהה השדה
 * @param {Object} rules - כללי הוולידציה
 * @param {string} fieldType - סוג השדה ('text', 'number', 'email', 'date', 'select')
 */
function setupFieldValidation(fieldId, rules = {}, fieldType = 'text') {
    const input = document.getElementById(fieldId);
    if (!input) {
        console.warn(`Field ${fieldId} not found`);
        return;
    }
    
    // ניקוי וולידציה קיימת
    clearFieldValidation(input);
    
    // הוספת מאזינים - רק על blur ורק אם יש תוכן
    input.addEventListener('blur', () => {
        // וולידציה רק אם יש תוכן או שזה שדה חובה
        if (input.value.trim() || rules.required) {
            validateField(input, rules, fieldType);
        }
    });
    
    // וולידציה על input רק אם יש תוכן
    input.addEventListener('input', () => {
        if (input.value.trim()) {
            validateField(input, rules, fieldType);
        } else {
            // אם השדה ריק - ניקוי וולידציה
            clearFieldValidation(input);
        }
    });
    
    // שמירת הכללים בשדה
    input.dataset.validationRules = JSON.stringify(rules);
    input.dataset.validationType = fieldType;
}

/**
 * וולידציה של שדה בודד
 * @param {HTMLElement} input - אלמנט השדה
 * @param {Object} rules - כללי הוולידציה
 * @param {string} fieldType - סוג השדה
 * @returns {boolean} - האם השדה תקין
 */
function validateField(input, rules = {}, fieldType = 'text') {
    switch (fieldType) {
        case 'text':
            return validateTextField(input, rules);
        case 'number':
            return validateNumberField(input, rules);
        case 'email':
            return validateEmailField(input, rules);
        case 'date':
            return validateDateField(input, rules);
        case 'select':
            return validateSelectField(input, rules);
        default:
            return validateTextField(input, rules);
    }
}

/**
 * וולידציה של שדה טקסט
 * @param {HTMLInputElement} input - אלמנט השדה
 * @param {Object} rules - כללי הוולידציה
 * @returns {boolean} - האם השדה תקין
 */
function validateTextField(input, rules = {}) {
    const value = input.value.trim();
    const mergedRules = { ...DEFAULT_VALIDATION_RULES.text, ...rules };
    
    // בדיקת שדה חובה - רק על blur
    if (mergedRules.required && value.length === 0) {
        showFieldError(input, 'שדה זה הוא חובה');
        return false;
    }
    
    // אם השדה ריק ולא חובה - ניקוי וולידציה
    if (value.length === 0) {
        clearFieldValidation(input);
        return true;
    }
    
    // בדיקת אורך מינימלי
    if (mergedRules.minLength > 0 && value.length < mergedRules.minLength) {
        showFieldError(input, `מינימום ${mergedRules.minLength} תווים נדרשים`);
        return false;
    }
    
    // בדיקת אורך מקסימלי
    if (mergedRules.maxLength > 0 && value.length > mergedRules.maxLength) {
        showFieldError(input, `מקסימום ${mergedRules.maxLength} תווים מותרים`);
        return false;
    }
    
    // בדיקת תבנית
    if (mergedRules.pattern && !mergedRules.pattern.test(value)) {
        showFieldError(input, mergedRules.errorMessage || 'ערך לא תקין');
        return false;
    }
    
    // בדיקה מותאמת למטבעות
    if (input.id === 'currencySymbol' || input.id === 'editCurrencySymbol') {
        const currencyResult = validateCurrencySymbol(value);
        if (currencyResult !== true) {
            showFieldError(input, currencyResult);
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
 * וולידציה של שדה מספרי
 * @param {HTMLInputElement} input - אלמנט השדה
 * @param {Object} rules - כללי הוולידציה
 * @returns {boolean} - האם השדה תקין
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
        showFieldError(input, 'יש להזין מספר תקין');
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
 * וולידציה של שדה אימייל
 * @param {HTMLInputElement} input - אלמנט השדה
 * @param {Object} rules - כללי הוולידציה
 * @returns {boolean} - האם השדה תקין
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
 * וולידציה של שדה תאריך
 * @param {HTMLInputElement} input - אלמנט השדה
 * @param {Object} rules - כללי הוולידציה
 * @returns {boolean} - האם השדה תקין
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
        const customResult = mergedRules.customValidation(dateValue, input);
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
 * וולידציה של שדה סלקט
 * @param {HTMLSelectElement} input - אלמנט השדה
 * @param {Object} rules - כללי הוולידציה
 * @returns {boolean} - האם השדה תקין
 */
function validateSelectField(input, rules = {}) {
    const value = input.value;
    const mergedRules = { ...DEFAULT_VALIDATION_RULES.select, ...rules };
    
    // בדיקת שדה חובה
    if (mergedRules.required && (!value || value === '')) {
        showFieldError(input, 'יש לבחור ערך');
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

// ===== פונקציות וולידציה מותאמות =====

/**
 * וולידציה של סמל מטבע (רק אותיות אנגליות גדולות)
 * @param {string} value - הערך לבדיקה
 * @returns {string|true} - הודעת שגיאה או true
 */
function validateCurrencySymbol(value) {
    const pattern = /^[A-Z]+$/;
    if (!pattern.test(value)) {
        return 'סמל מטבע חייב להכיל רק אותיות אנגליות גדולות';
    }
    if (value.length > 10) {
        return 'סמל מטבע לא יכול להיות יותר מ-10 תווים';
    }
    return true;
}

/**
 * וולידציה של שער מטבע (מספר חיובי)
 * @param {number} value - הערך לבדיקה
 * @returns {string|true} - הודעת שגיאה או true
 */
function validateCurrencyRate(value) {
    if (value < 0) {
        return 'שער מטבע חייב להיות מספר חיובי';
    }
    return true;
}

// ייצוא פונקציות גלובליות
window.validateForm = validateForm;
window.showFieldError = showFieldError;
window.showFieldSuccess = showFieldSuccess;
window.clearFieldError = clearFieldError;
window.clearFieldValidation = clearFieldValidation;
window.clearValidationErrors = clearValidationErrors;
window.isValidDate = isValidDate;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;

// ייצוא פונקציות וולידציה בזמן אמת
window.setupFieldValidation = setupFieldValidation;
window.validateField = validateField;
window.validateTextField = validateTextField;
window.validateNumberField = validateNumberField;
window.validateEmailField = validateEmailField;
window.validateDateField = validateDateField;
window.validateSelectField = validateSelectField;

// ייצוא פונקציות וולידציה מותאמות
window.validateCurrencySymbol = validateCurrencySymbol;
window.validateCurrencyRate = validateCurrencyRate;

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
    validateCurrencyRate
};

console.log('✅ Validation Utils loaded successfully');
console.log('📋 Available functions:');
console.log('   🔧 setupFieldValidation(fieldId, rules, type) - הגדרת וולידציה לשדה');
console.log('   ✅ validateField(input, rules, type) - וולידציה של שדה בודד');
console.log('   📝 validateForm(formId) - וולידציה של טופס שלם');
console.log('   🧹 clearFieldValidation(field) - ניקוי וולידציות');
