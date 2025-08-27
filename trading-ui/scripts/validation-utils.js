// ===== VALIDATION UTILS - פונקציות גלובליות לוולידציה =====

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
    
    // יצירת אלמנט הודעת שגיאה
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    errorDiv.id = `${field.name}-error`;
    
    // הוספה אחרי השדה
    field.parentNode.appendChild(errorDiv);
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

// ייצוא פונקציות גלובליות
window.validateForm = validateForm;
window.showFieldError = showFieldError;
window.clearFieldError = clearFieldError;
window.clearValidationErrors = clearValidationErrors;
window.isValidDate = isValidDate;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
