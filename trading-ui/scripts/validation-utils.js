// ===== VALIDATION UTILS - מערכת ולידציה גלובלית =====
/*
 * Validation Utils - TikTrack
 * ===========================
 *
 * מערכת ולידציה גלובלית עם תמיכה בוולידציה בזמן אמת ובזמן שליחה
 *
 * 📖 דוקומנטציה מפורטת: documentation/frontend/VALIDATION_SYSTEM.md
 *
 * קובץ: trading-ui/scripts/validation-utils.js
 * גרסה: 3.0
 * עדכון אחרון: ינואר 12, 2025
 * מחבר: TikTrack Development Team
 *
 * תיקונים אחרונים (12 בינואר 2025):
 * - הוספת validateDateRange() לוולידציה בין שדות תאריך
 * - הוספת validateEntityForm() לעזרה בטפסי CRUD נפוצים
 * - הוספת validateWithConfirmation() לוולידציה עם אישור משתמש
 * - הרחבת המערכת לתמיכה בכל דפוסי הולידציה במערכת
 * - סטנדרטיזציה מלאה של הולידציה בכל עמודי המשתמש
 */

// ===== קבועים =====

// כללי ולידציה ברירת מחדל
const DEFAULT_VALIDATION_RULES = {
  text: {
    required: false,
    minLength: 0,
    maxLength: 255,
    pattern: /.*/,
    customValidation: null,
  },
  number: {
    required: false,
    min: null,
    max: null,
    step: null,
    customValidation: null,
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    customValidation: null,
  },
  date: {
    required: false,
    minDate: null,
    maxDate: null,
    customValidation: null,
  },
  select: {
    required: false,
    customValidation: null,
  },
};

// ===== פונקציות עזר =====

/**
 * קבלת תווית השדה
 */
function getFieldLabel(field) {
  // ניסיון למצוא label לפי for
  const label = document.querySelector(`label[for="${field.id}"]`);
  if (label) {
    return label.textContent.trim();
  }

  // ניסיון למצוא label קרוב
  const parentLabel = field.closest('.form-group')?.querySelector('label') ||
                       field.parentNode?.querySelector('label');
  if (parentLabel) {
    return parentLabel.textContent.trim();
  }

  // ניסיון לקבל מתוך placeholder
  if (field.placeholder) {
    return field.placeholder;
  }

  // ברירת מחדל - שם השדה
  return field.name || field.id || 'שדה לא ידוע';
}

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
  return /^[\d\s\-+()]+$/.test(phone);
}

// ===== פונקציות ויזואליות =====

/**
 * הצגת שגיאה בשדה
 */
function showFieldError(input, message) {
  // אם input הוא מחרוזת (ID), נקבל את האלמנט
  const element = typeof input === 'string' ? document.getElementById(input) : input;

  // בדיקה שהאלמנט קיים
  if (!element) {
    // showFieldError: Element not found for input
    return;
  }

  // הסרת סימון קודם
  element.classList.remove('is-valid');
  element.classList.add('is-invalid');

  // הסרת הודעת שגיאה קודמת
  const existingError = element.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }

  // הוספת הודעת שגיאה חדשה
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  element.parentNode.appendChild(errorDiv);
}

/**
 * הצגת הצלחה בשדה
 */
function showFieldSuccess(input) {
  // אם input הוא מחרוזת (ID), נקבל את האלמנט
  const element = typeof input === 'string' ? document.getElementById(input) : input;

  // בדיקה שהאלמנט קיים
  if (!element) {
    // showFieldSuccess: Element not found for input
    return;
  }

  // הסרת סימון קודם
  element.classList.remove('is-invalid');
  element.classList.add('is-valid');

  // הסרת הודעת שגיאה
  const existingError = element.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
}

/**
 * ניקוי שגיאה משדה
 */
function clearFieldError(input) {
  // אם input הוא מחרוזת (ID), נקבל את האלמנט
  const element = typeof input === 'string' ? document.getElementById(input) : input;

  // בדיקה שהאלמנט קיים
  if (!element) {
    // clearFieldError: Element not found for input
    return;
  }

  element.classList.remove('is-invalid');
  const existingError = element.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
}

/**
 * ניקוי ולידציה משדה
 */
function clearFieldValidation(input) {
  // אם input הוא מחרוזת (ID), נקבל את האלמנט
  const element = typeof input === 'string' ? document.getElementById(input) : input;

  // בדיקה שהאלמנט קיים
  if (!element) {
    // clearFieldValidation: Element not found for input
    return;
  }

  element.classList.remove('is-valid', 'is-invalid');
  const existingError = element.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
}

/**
 * ניקוי כל שגיאות הוולידציה
 */
function clearValidationErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) {return;}

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
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} הוא שדה חובה`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // אם השדה ריק ולא חובה - תקין
  if (value.length === 0) {
    clearFieldValidation(input);
    return true;
  }

  // בדיקת אורך מינימלי
  if (value.length < mergedRules.minLength) {
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} - מינימום ${mergedRules.minLength} תווים נדרשים`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // בדיקת אורך מקסימלי
  if (value.length > mergedRules.maxLength) {
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} - מקסימום ${mergedRules.maxLength} תווים מותרים`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // בדיקת תבנית
  if (!mergedRules.pattern.test(value)) {
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} - ערך לא תקין`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // בדיקה מותאמת אישית
  if (mergedRules.customValidation) {
    const customResult = mergedRules.customValidation(value, input);
    if (customResult !== true) {
      const fieldLabel = getFieldLabel(input);
      const errorMsg = `${fieldLabel} - ${customResult}`;
      showFieldError(input, errorMsg);
      return errorMsg;
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
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} הוא שדה חובה`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // אם השדה ריק ולא חובה - תקין
  if (value.length === 0) {
    clearFieldValidation(input);
    return true;
  }

  // בדיקה שהערך הוא מספר
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} - ערך מספרי לא תקין`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // בדיקת ערך מינימלי
  if (mergedRules.min !== null && numValue < mergedRules.min) {
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} - ערך מינימלי: ${mergedRules.min}`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // בדיקת ערך מקסימלי
  if (mergedRules.max !== null && numValue > mergedRules.max) {
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} - ערך מקסימלי: ${mergedRules.max}`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // בדיקה מותאמת אישית
  if (mergedRules.customValidation) {
    const customResult = mergedRules.customValidation(numValue, input);
    if (customResult !== true) {
      const fieldLabel = getFieldLabel(input);
      const errorMsg = `${fieldLabel} - ${customResult}`;
      showFieldError(input, errorMsg);
      return errorMsg;
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
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} הוא שדה חובה`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // אם השדה ריק ולא חובה - תקין
  if (value.length === 0) {
    clearFieldValidation(input);
    return true;
  }

  // בדיקת תבנית אימייל
  if (!mergedRules.pattern.test(value)) {
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} - כתובת אימייל לא תקינה`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // בדיקה מותאמת אישית
  if (mergedRules.customValidation) {
    const customResult = mergedRules.customValidation(value, input);
    if (customResult !== true) {
      const fieldLabel = getFieldLabel(input);
      const errorMsg = `${fieldLabel} - ${customResult}`;
      showFieldError(input, errorMsg);
      return errorMsg;
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
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} הוא שדה חובה`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // אם השדה ריק ולא חובה - תקין
  if (value.length === 0) {
    clearFieldValidation(input);
    return true;
  }

  // בדיקה שהערך הוא תאריך תקין
  const dateValue = new Date(value);
  if (isNaN(dateValue.getTime())) {
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} - תאריך לא תקין`;
    showFieldError(input, errorMsg);
    return errorMsg;
  }

  // בדיקת תאריך מינימלי
  if (mergedRules.minDate) {
    const minDate = new Date(mergedRules.minDate);
    if (dateValue < minDate) {
      const fieldLabel = getFieldLabel(input);
      const errorMsg = `${fieldLabel} - תאריך מינימלי: ${minDate.toLocaleDateString('he-IL')}`;
      showFieldError(input, errorMsg);
      return errorMsg;
    }
  }

  // בדיקת תאריך מקסימלי
  if (mergedRules.maxDate) {
    const maxDate = new Date(mergedRules.maxDate);
    if (dateValue > maxDate) {
      const fieldLabel = getFieldLabel(input);
      const errorMsg = `${fieldLabel} - תאריך מקסימלי: ${maxDate.toLocaleDateString('he-IL')}`;
      showFieldError(input, errorMsg);
      return errorMsg;
    }
  }

  // בדיקה מותאמת אישית
  if (mergedRules.customValidation) {
    const customResult = mergedRules.customValidation(value, input);
    if (customResult !== true) {
      const fieldLabel = getFieldLabel(input);
      const errorMsg = `${fieldLabel} - ${customResult}`;
      showFieldError(input, errorMsg);
      return errorMsg;
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
    const fieldLabel = getFieldLabel(input);
    const errorMsg = `${fieldLabel} הוא שדה חובה`;
    showFieldError(input, errorMsg);
    return errorMsg;
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
      const fieldLabel = getFieldLabel(input);
      const errorMsg = `${fieldLabel} - ${customResult}`;
      showFieldError(input, errorMsg);
      return errorMsg;
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
  if (!value || value.length === 0) {return 'סמל מטבע הוא חובה';}
  if (value.length !== 3) {return 'סמל מטבע חייב להיות 3 תווים';}
  if (!/^[A-Z]{3}$/.test(value)) {return 'סמל מטבע חייב להיות 3 אותיות גדולות';}
  return true;
}

/**
 * ולידציה של שער מטבע
 */
function validateCurrencyRate(value) {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {return 'שער מטבע חייב להיות מספר';}
  if (numValue <= 0) {return 'שער מטבע חייב להיות חיובי';}
  if (numValue > 1000000) {return 'שער מטבע לא יכול להיות יותר מ-1,000,000';}
  return true;
}

/**
 * ולידציה של סמל טיקר
 */
function validateTickerSymbol(value) {
  if (!value || value.length === 0) {return 'סמל טיקר הוא חובה';}
  if (value.length > 10) {return 'סמל טיקר לא יכול להיות יותר מ-10 תווים';}
  if (!/^[A-Z0-9.]+$/.test(value)) {return 'סמל טיקר יכול להכיל רק אותיות גדולות, מספרים ונקודות';}
  return true;
}

// ===== פונקציות ולידציה מתקדמות =====

/**
 * ולידציה בין שדות תאריך (Cross-field validation)
 * @param {string} startFieldId - מזהה שדה התאריך הראשון
 * @param {string} endFieldId - מזהה שדה התאריך השני
 * @param {string} errorMessage - הודעת שגיאה מותאמת אישית
 * @returns {boolean} true אם תקין, false אם לא תקין
 */
function validateDateRange(startFieldId, endFieldId, errorMessage) {
  const startField = document.getElementById(startFieldId);
  const endField = document.getElementById(endFieldId);
  
  if (!startField || !endField) return true;
  
  const startValue = startField.value;
  const endValue = endField.value;
  
  if (startValue && endValue) {
    const startDate = new Date(startValue);
    const endDate = new Date(endValue);
    
    if (endDate < startDate) {
      showFieldError(endField, errorMessage || 'תאריך סיום לא יכול להיות לפני תאריך התחלה');
      return false;
    }
    
    clearFieldValidation(endField);
  }
  
  return true;
}

/**
 * ולידציה של טופס ישות עם כללים מקיפים
 * עזרה לטפסי CRUD נפוצים
 * @param {string} formId - מזהה הטופס
 * @param {Array} fieldConfigs - מערך של {id, name, type, rules}
 * @returns {Object} {isValid, errors, errorMessages}
 */
function validateEntityForm(formId, fieldConfigs) {
  let isValid = true;
  const errors = {};
  const errorMessages = [];
  
  fieldConfigs.forEach(config => {
    const field = document.getElementById(config.id);
    if (!field) return;
    
    const result = validateField(field, config.rules || {required: true});
    
    if (result !== true) {
      isValid = false;
      errors[config.id] = result;
      errorMessages.push(`${config.name}: ${result}`);
    }
  });
  
  return {isValid, errors, errorMessages};
}

/**
 * ולידציה עם דיאלוג אישור
 * ללוגיקת עסקים שדורשת אישור משתמש
 * @param {string} title - כותרת הדיאלוג
 * @param {string} message - הודעת הדיאלוג
 * @param {Function} validationFn - פונקציית ולידציה להרצה
 * @returns {Promise<boolean>} true אם אושר, false אם לא
 */
async function validateWithConfirmation(title, message, validationFn) {
  const validationResult = await validationFn();
  
  if (!validationResult.isValid) {
    if (window.showErrorNotification) {
      window.showErrorNotification(title, validationResult.message);
    }
    return false;
  }
  
  // הצגת דיאלוג אישור
  return new Promise((resolve) => {
    if (window.showConfirmationDialog) {
      window.showConfirmationDialog(
        title,
        message,
        () => resolve(true),
        () => resolve(false)
      );
    } else {
      resolve(window.confirm(`${title}\n\n${message}`));
    }
  });
}

// ===== פונקציה ראשית =====

/**
 * ולידציה של טופס
 */
function validateForm(formId, validationRules = {}) {
  const form = document.getElementById(formId);
  if (!form) {
    // Form not found
    return { isValid: false, errors: { form: 'טופס לא נמצא' } };
  }

  let isValid = true;
  const errors = {};
  const errorMessages = [];

  // בדיקת שדות חובה
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    if (!field.value || field.value.trim() === '') {
      const fieldLabel = getFieldLabel(field);
      const errorMsg = `${fieldLabel} הוא שדה חובה`;
      showFieldError(field, errorMsg);
      isValid = false;
      errors[field.name || field.id] = errorMsg;
      errorMessages.push(errorMsg);
    }
  });

  // בדיקת שדות תאריך
  const dateFields = form.querySelectorAll('input[type="date"], input[type="datetime-local"]');
  dateFields.forEach(field => {
    if (field.value && !isValidDate(field.value)) {
      const fieldLabel = getFieldLabel(field);
      const errorMsg = `${fieldLabel} - תאריך לא תקין`;
      showFieldError(field, errorMsg);
      isValid = false;
      errors[field.name || field.id] = errorMsg;
      errorMessages.push(errorMsg);
    }
  });

  // בדיקת שדות מספר
  const numberFields = form.querySelectorAll('input[type="number"]');
  numberFields.forEach(field => {
    if (field.value && isNaN(parseFloat(field.value))) {
      const fieldLabel = getFieldLabel(field);
      const errorMsg = `${fieldLabel} - ערך מספרי לא תקין`;
      showFieldError(field, errorMsg);
      isValid = false;
      errors[field.name || field.id] = errorMsg;
      errorMessages.push(errorMsg);
    }
  });

  // בדיקת ולידציה מותאמת אישית
  Object.keys(validationRules).forEach(fieldName => {
    const field = form.querySelector(`[name="${fieldName}"], [id="${fieldName}"]`);
    if (field) {
      const fieldRules = validationRules[fieldName];
      const fieldValid = validateField(field, fieldRules);
      if (!fieldValid) {
        const fieldLabel = getFieldLabel(field);
        const errorMsg = `${fieldLabel} - ${fieldValid}`;
        showFieldError(field, errorMsg);
        isValid = false;
        errors[fieldName] = errorMsg;
        errorMessages.push(errorMsg);
      }
    }
  });

  if (!isValid) {
    // הצגת הודעת שגיאה מפורטת
    const errorSummary = errorMessages.join('\n• ');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאות בטופס', `נמצאו ${errorMessages.length} שגיאות:\n• ${errorSummary}`);
    }
  }

  return { isValid, errors, errorMessages };
}

// ===== פונקציות אתחול =====

/**
 * אתחול מערכת הוולידציה לטופס
 */
function initializeValidation(formId, validationRules = {}) {
  const form = document.getElementById(formId);
  if (!form) {
    // Form ${formId} not found - skipping validation initialization
    return;
  }

  // מציאת כל השדות בטופס
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input, _index) => {
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
    // Form ${formId} not found - skipping validation clearing
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

// ייצוא פונקציות ולידציה מתקדמות
window.validateDateRange = validateDateRange;
window.validateEntityForm = validateEntityForm;
window.validateWithConfirmation = validateWithConfirmation;

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
  validateDateRange,
  validateEntityForm,
  validateWithConfirmation,
  initializeValidation,
  clearValidation,
};

