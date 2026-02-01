/**
 * Error Handler - טיפול בשגיאות API
 * 
 * @description מטפל בשגיאות API וממיר אותן למשוב למשתמש
 * @module utils/errorHandler
 * @legacyReference Legacy.error.handle()
 */

import { translateError } from '../logic/errorCodes.js';
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
    // Unauthorized
    formError = translateError(
      errorCode || 'AUTH_UNAUTHORIZED',
      detail || 'אימות נכשל. אנא בדוק את פרטיך.'
    );
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
