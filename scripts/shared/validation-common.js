/**
 * ========================================
 * Shared Validation Common
 * ========================================
 * 
 * קוד משותף לvalidation:
 * - בדיקות כלליות
 * - הודעות שגיאה
 * - כללי עסק
 */

/**
 * מחלקה לvalidation משותף
 */
class ValidationCommon {
  /**
   * בדיקת שדה חובה
   * @param {string} value - ערך
   * @param {string} fieldName - שם השדה
   * @returns {Object} תוצאת הבדיקה
   */
  static validateRequired(value, fieldName) {
    if (!value || value.toString().trim() === '') {
      return {
        isValid: false,
        message: `${fieldName} הוא שדה חובה`
      };
    }
    return { isValid: true };
  }

  /**
   * בדיקת מספר חיובי
   * @param {string|number} value - ערך
   * @param {string} fieldName - שם השדה
   * @param {number} minValue - ערך מינימלי
   * @returns {Object} תוצאת הבדיקה
   */
  static validatePositiveNumber(value, fieldName, minValue = 0) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות מספר תקין`
      };
    }
    
    if (num <= minValue) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות גדול מ-${minValue}`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת טווח מספר
   * @param {string|number} value - ערך
   * @param {string} fieldName - שם השדה
   * @param {number} min - מינימום
   * @param {number} max - מקסימום
   * @returns {Object} תוצאת הבדיקה
   */
  static validateNumberRange(value, fieldName, min, max) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות מספר תקין`
      };
    }
    
    if (num < min || num > max) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות בין ${min} ל-${max}`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת אורך מחרוזת
   * @param {string} value - ערך
   * @param {string} fieldName - שם השדה
   * @param {number} minLength - אורך מינימלי
   * @param {number} maxLength - אורך מקסימלי
   * @returns {Object} תוצאת הבדיקה
   */
  static validateStringLength(value, fieldName, minLength, maxLength) {
    const length = value ? value.length : 0;
    
    if (length < minLength) {
      return {
        isValid: false,
        message: `${fieldName} חייב להכיל לפחות ${minLength} תווים`
      };
    }
    
    if (length > maxLength) {
      return {
        isValid: false,
        message: `${fieldName} חייב להכיל לכל היותר ${maxLength} תווים`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת תאריך
   * @param {string|Date} value - ערך
   * @param {string} fieldName - שם השדה
   * @param {Date} minDate - תאריך מינימלי
   * @param {Date} maxDate - תאריך מקסימלי
   * @returns {Object} תוצאת הבדיקה
   */
  static validateDate(value, fieldName, minDate = null, maxDate = null) {
    if (!value) {
      return {
        isValid: false,
        message: `${fieldName} הוא שדה חובה`
      };
    }
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות תאריך תקין`
      };
    }
    
    if (minDate && date < minDate) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות אחרי ${minDate.toLocaleDateString('he-IL')}`
      };
    }
    
    if (maxDate && date > maxDate) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות לפני ${maxDate.toLocaleDateString('he-IL')}`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת דוא"ל
   * @param {string} value - ערך
   * @param {string} fieldName - שם השדה
   * @returns {Object} תוצאת הבדיקה
   */
  static validateEmail(value, fieldName) {
    if (!value) {
      return {
        isValid: false,
        message: `${fieldName} הוא שדה חובה`
      };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(value)) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות כתובת דוא"ל תקינה`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת טלפון
   * @param {string} value - ערך
   * @param {string} fieldName - שם השדה
   * @returns {Object} תוצאת הבדיקה
   */
  static validatePhone(value, fieldName) {
    if (!value) {
      return {
        isValid: false,
        message: `${fieldName} הוא שדה חובה`
      };
    }
    
    // הסרת תווים לא מספריים
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length < 9 || cleanValue.length > 15) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות מספר טלפון תקין`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת מחיר תקין
   * @param {string|number} value - ערך
   * @param {string} fieldName - שם השדה
   * @param {number} minPrice - מחיר מינימלי
   * @param {number} maxPrice - מחיר מקסימלי
   * @returns {Object} תוצאת הבדיקה
   */
  static validatePrice(value, fieldName, minPrice = 0, maxPrice = 1000000) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות מספר תקין`
      };
    }
    
    if (num < minPrice) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות לפחות ${minPrice}`
      };
    }
    
    if (num > maxPrice) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות לכל היותר ${maxPrice}`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת כמות תקינה
   * @param {string|number} value - ערך
   * @param {string} fieldName - שם השדה
   * @param {number} minQuantity - כמות מינימלית
   * @param {number} maxQuantity - כמות מקסימלית
   * @returns {Object} תוצאת הבדיקה
   */
  static validateQuantity(value, fieldName, minQuantity = 1, maxQuantity = 1000000) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות מספר תקין`
      };
    }
    
    if (num < minQuantity) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות לפחות ${minQuantity}`
      };
    }
    
    if (num > maxQuantity) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות לכל היותר ${maxQuantity}`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת הגיון עסקי - מחיר עצירה
   * @param {number} entryPrice - מחיר כניסה
   * @param {number} stopPrice - מחיר עצירה
   * @param {string} tradeType - סוג טרייד
   * @returns {Object} תוצאת הבדיקה
   */
  static validateStopPrice(entryPrice, stopPrice, tradeType) {
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopPrice);
    
    if (isNaN(entry) || isNaN(stop)) {
      return {
        isValid: false,
        message: 'מחירי כניסה ועצירה חייבים להיות מספרים תקינים'
      };
    }
    
    if (tradeType === 'buy' && stop >= entry) {
      return {
        isValid: false,
        message: 'מחיר עצירה חייב להיות נמוך ממחיר כניסה לרכישה'
      };
    }
    
    if (tradeType === 'sell' && stop <= entry) {
      return {
        isValid: false,
        message: 'מחיר עצירה חייב להיות גבוה ממחיר כניסה למכירה'
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת הגיון עסקי - מחיר יעד
   * @param {number} entryPrice - מחיר כניסה
   * @param {number} targetPrice - מחיר יעד
   * @param {string} tradeType - סוג טרייד
   * @returns {Object} תוצאת הבדיקה
   */
  static validateTargetPrice(entryPrice, targetPrice, tradeType) {
    const entry = parseFloat(entryPrice);
    const target = parseFloat(targetPrice);
    
    if (isNaN(entry) || isNaN(target)) {
      return {
        isValid: false,
        message: 'מחירי כניסה ויעד חייבים להיות מספרים תקינים'
      };
    }
    
    if (tradeType === 'buy' && target <= entry) {
      return {
        isValid: false,
        message: 'מחיר יעד חייב להיות גבוה ממחיר כניסה לרכישה'
      };
    }
    
    if (tradeType === 'sell' && target >= entry) {
      return {
        isValid: false,
        message: 'מחיר יעד חייב להיות נמוך ממחיר כניסה למכירה'
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת מחיר יציאה
   * @param {number} entryPrice - מחיר כניסה
   * @param {number} exitPrice - מחיר יציאה
   * @param {string} tradeType - סוג טרייד
   * @returns {Object} תוצאת הבדיקה
   */
  static validateExitPrice(entryPrice, exitPrice, tradeType) {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    
    if (isNaN(entry) || isNaN(exit)) {
      return {
        isValid: false,
        message: 'מחירי כניסה ויציאה חייבים להיות מספרים תקינים'
      };
    }
    
    if (tradeType === 'buy' && exit <= entry) {
      return {
        isValid: false,
        message: 'מחיר יציאה חייב להיות גבוה ממחיר כניסה לרכישה'
      };
    }
    
    if (tradeType === 'sell' && exit >= entry) {
      return {
        isValid: false,
        message: 'מחיר יציאה חייב להיות נמוך ממחיר כניסה למכירה'
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת סכום תקין
   * @param {string|number} value - ערך
   * @param {string} fieldName - שם השדה
   * @param {number} minAmount - סכום מינימלי
   * @param {number} maxAmount - סכום מקסימלי
   * @returns {Object} תוצאת הבדיקה
   */
  static validateAmount(value, fieldName, minAmount = 0, maxAmount = 10000000) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות מספר תקין`
      };
    }
    
    if (num < minAmount) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות לפחות ${minAmount}`
      };
    }
    
    if (num > maxAmount) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות לכל היותר ${maxAmount}`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת רשימה של ערכים
   * @param {Array} values - רשימת ערכים
   * @param {Function} validator - פונקציית בדיקה
   * @returns {Object} תוצאת הבדיקה
   */
  static validateList(values, validator) {
    if (!Array.isArray(values)) {
      return {
        isValid: false,
        message: 'הערכים חייבים להיות רשימה'
      };
    }
    
    for (let i = 0; i < values.length; i++) {
      const result = validator(values[i], i);
      if (!result.isValid) {
        return {
          isValid: false,
          message: `שגיאה בפריט ${i + 1}: ${result.message}`
        };
      }
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת קיום ערך ברשימה
   * @param {string} value - ערך
   * @param {Array} allowedValues - רשימת ערכים מותרים
   * @param {string} fieldName - שם השדה
   * @returns {Object} תוצאת הבדיקה
   */
  static validateInList(value, allowedValues, fieldName) {
    if (!allowedValues.includes(value)) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות אחד מהערכים הבאים: ${allowedValues.join(', ')}`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת מספר שלם
   * @param {string|number} value - ערך
   * @param {string} fieldName - שם השדה
   * @returns {Object} תוצאת הבדיקה
   */
  static validateInteger(value, fieldName) {
    const num = parseInt(value);
    
    if (isNaN(num) || !Number.isInteger(parseFloat(value))) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות מספר שלם`
      };
    }
    
    return { isValid: true };
  }

  /**
   * בדיקת מספר עשרוני
   * @param {string|number} value - ערך
   * @param {string} fieldName - שם השדה
   * @param {number} decimals - מספר ספרות עשרוניות
   * @returns {Object} תוצאת הבדיקה
   */
  static validateDecimal(value, fieldName, decimals = 2) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return {
        isValid: false,
        message: `${fieldName} חייב להיות מספר תקין`
      };
    }
    
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > decimals) {
      return {
        isValid: false,
        message: `${fieldName} חייב להכיל לכל היותר ${decimals} ספרות עשרוניות`
      };
    }
    
    return { isValid: true };
  }
}

// ייצוא המודול
window.ValidationCommon = ValidationCommon;

console.log('✅ Shared Validation Common module loaded');
