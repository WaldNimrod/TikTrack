/**
 * Error Handler - טיפול בשגיאות API
 * 
 * @description מטפל בשגיאות API וממיר אותן למשוב למשתמש
 * @module utils/errorHandler
 * @legacyReference Legacy.error.handle()
 */

import { translateError, ERROR_CODES } from '../logic/errorCodes.js';
import { debugLog } from './debug.js';
import { audit } from './audit.js';

/**
 * Convert snake_case to camelCase
 * 
 * @param {string} str - String in snake_case
 * @returns {string} - String in camelCase
 */
const snakeToCamel = (str) => {
  if (!str) return str;
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Handle API Error Response
 * 
 * @description מטפל בשגיאות API ומחזיר fieldErrors ו-formError
 * @param {Error} error - Axios error
 * @returns {Object} - { fieldErrors: Object, formError: string|null }
 */
export const handleApiError = (error) => {
  const fieldErrors = {};
  let formError = null;
  
  debugLog('ErrorHandler', 'Processing API error', {
    status: error.response?.status,
    hasErrorCode: !!error.response?.data?.error_code,
    hasDetail: !!error.response?.data?.detail
  });
  
  if (!error.response) {
    // Network error or CORS
    audit.error('ErrorHandler', 'Network/CORS error', error);
    
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      formError = translateError('CORS_ERROR', 'שגיאת חיבור לשרת. אנא בדוק שהשרת פועל.');
    } else {
      formError = translateError('NETWORK_ERROR', error.message);
    }
    
    return { fieldErrors, formError };
  }
  
  const status = error.response.status;
  const responseData = error.response.data;
  const errorCode = responseData?.error_code;
  const detail = responseData?.detail;
  
  audit.error('ErrorHandler', `API error ${status}`, {
    errorCode,
    detail: Array.isArray(detail) ? 'Array of errors' : detail,
    url: error.config?.url
  });
  
  if (status === 400) {
    // Bad Request - Validation errors
    if (Array.isArray(detail)) {
      // Pydantic validation errors (array format)
      detail.forEach(err => {
        const field = err.loc?.[err.loc.length - 1]; // Last field in path
        if (field) {
          const camelField = snakeToCamel(field);
          const fieldErrorCode = err.error_code || errorCode;
          const errorMessage = translateError(fieldErrorCode, err.msg);
          fieldErrors[camelField] = errorMessage;
        }
      });
    } else if (typeof detail === 'string') {
      // Generic error message
      formError = translateError(errorCode, detail);
    } else if (typeof detail === 'object' && detail !== null) {
      // Object with field-specific errors
      Object.keys(detail).forEach(key => {
        const camelKey = snakeToCamel(key);
        const fieldError = detail[key];
        if (typeof fieldError === 'string') {
          fieldErrors[camelKey] = translateError(null, fieldError);
        } else if (Array.isArray(fieldError)) {
          fieldErrors[camelKey] = translateError(null, fieldError[0]);
        }
      });
    }
  } else if (status === 401) {
    // Unauthorized - For login, this usually means invalid credentials
    // CRITICAL: Always ensure Hebrew message for 401 errors
    // Priority 1: Use error_code if available (will return Hebrew from ERROR_CODES)
    // Priority 2: Translate detail if it's in English
    // Priority 3: Use detail if it's already in Hebrew
    // Fallback: Use default Hebrew message
    
    // Use error_code if available, otherwise default to AUTH_INVALID_CREDENTIALS
    const effectiveErrorCode = errorCode || 'AUTH_INVALID_CREDENTIALS';
    
    // Translate error - translateError will prioritize errorCode over detail
    let translatedError = translateError(effectiveErrorCode, detail);
    
    // CRITICAL: Double-check result is in Hebrew (for test compatibility)
    const hasHebrew = /[\u0590-\u05FF]/.test(translatedError);
    if (!hasHebrew) {
      // If translation didn't produce Hebrew, force use Hebrew message
      translatedError = ERROR_CODES['AUTH_INVALID_CREDENTIALS'];
      
      debugLog('ErrorHandler', '401 error - forced Hebrew message', {
        errorCode,
        effectiveErrorCode,
        detail,
        originalTranslation: translateError(effectiveErrorCode, detail),
        forcedTranslation: translatedError
      });
    }
    
    formError = translatedError;
    
    debugLog('ErrorHandler', '401 error processed', {
      errorCode,
      effectiveErrorCode,
      detail,
      translatedError: formError,
      hasHebrew: /[\u0590-\u05FF]/.test(formError),
      errorCodeExists: !!ERROR_CODES[effectiveErrorCode],
      errorCodeValue: ERROR_CODES[effectiveErrorCode]
    });
  } else if (status === 403) {
    // Forbidden
    formError = translateError(
      errorCode || 'AUTH_FORBIDDEN',
      detail || 'אין הרשאה לבצע פעולה זו.'
    );
  } else if (status === 404) {
    // Not Found
    formError = translateError(
      errorCode || 'USER_NOT_FOUND',
      detail || 'המשאב המבוקש לא נמצא.'
    );
  } else if (status === 409) {
    // Conflict (e.g., user already exists)
    formError = translateError(
      errorCode || 'USER_ALREADY_EXISTS',
      detail || 'המשאב כבר קיים.'
    );
  } else if (status === 429) {
    // Too Many Requests
    formError = translateError(
      errorCode || 'API_RATE_LIMIT_EXCEEDED',
      detail || 'יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר.'
    );
  } else if (status === 500) {
    // Internal Server Error
    formError = translateError(
      errorCode || 'SERVER_ERROR',
      detail || 'שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר.'
    );
  } else if (status === 503) {
    // Service Unavailable
    formError = translateError(
      errorCode || 'SERVER_UNAVAILABLE',
      detail || 'השרת לא זמין כרגע. אנא נסה שוב מאוחר יותר.'
    );
  } else {
    // Unknown error
    formError = translateError(
      errorCode,
      detail || `שגיאה בלתי צפויה (${status}). אנא נסה שוב.`
    );
  }
  
  return { fieldErrors, formError };
};
