/**
 * Error Code Dictionary
 * 
 * @description Centralized error code to Hebrew message mapping
 * @module logic/errorCodes
 * @legacyReference Legacy.error.translate()
 */

/**
 * Error code to Hebrew message mapping
 */
export const ERROR_CODES = {
  // Authentication errors
  'AUTH_INVALID_CREDENTIALS': 'שם משתמש או סיסמה שגויים. אנא נסה שוב.',
  'AUTH_TOKEN_EXPIRED': 'פג תוקף ההתחברות. אנא התחבר מחדש.',
  'AUTH_UNAUTHORIZED': 'אין הרשאה לבצע פעולה זו.',
  'AUTH_FORBIDDEN': 'אין הרשאה לגשת למשאב זה.',
  
  // Validation errors
  'VALIDATION_FIELD_REQUIRED': 'שדה חובה',
  'VALIDATION_INVALID_EMAIL': 'אימייל לא תקין',
  'VALIDATION_INVALID_PHONE': 'מספר טלפון לא תקין',
  'VALIDATION_INVALID_FORMAT': 'פורמט לא תקין',
  'VALIDATION_INVALID_TIMEZONE': 'אזור זמן לא תקין',
  'VALIDATION_INVALID_LANGUAGE': 'שפה לא תקינה',
  'VALIDATION_FIELD_TOO_LONG': 'השדה ארוך מדי',
  
  // User errors
  'USER_NOT_FOUND': 'משתמש לא נמצא.',
  'USER_ALREADY_EXISTS': 'משתמש כבר קיים.',
  'USER_UPDATE_FAILED': 'עדכון המשתמש נכשל.',
  'USER_EMAIL_EXISTS': 'כתובת אימייל זו כבר בשימוש.',
  'USER_USERNAME_EXISTS': 'שם משתמש זה כבר בשימוש.',
  
  // Password errors
  'PASSWORD_INVALID': 'סיסמה שגויה.',
  'PASSWORD_TOO_SHORT': 'סיסמה חייבת להכיל לפחות 8 תווים.',
  'PASSWORD_MISMATCH': 'הסיסמאות לא תואמות.',
  'PASSWORD_SAME_AS_OLD': 'הסיסמה החדשה חייבת להיות שונה מהסיסמה הישנה.',
  
  // API errors
  'API_KEY_INVALID': 'מפתח API לא תקין.',
  'API_KEY_NOT_FOUND': 'מפתח API לא נמצא.',
  'API_RATE_LIMIT_EXCEEDED': 'חרגת ממגבלת הבקשות. אנא נסה שוב מאוחר יותר.',
  
  // Network errors
  'NETWORK_ERROR': 'שגיאת רשת. אנא בדוק את החיבור.',
  'NETWORK_TIMEOUT': 'פג זמן החיבור. אנא נסה שוב.',
  'CORS_ERROR': 'שגיאת חיבור לשרת. אנא בדוק שהשרת פועל.',
  
  // Server errors
  'SERVER_ERROR': 'שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר.',
  'SERVER_UNAVAILABLE': 'השרת לא זמין כרגע. אנא נסה שוב מאוחר יותר.',
  
  // Generic errors
  'UNKNOWN_ERROR': 'שגיאה בלתי צפויה. אנא נסה שוב.',
  'BAD_REQUEST': 'בקשה לא תקינה. אנא בדוק את הפרטים שהזנת.',
};

/**
 * Translate error code or message to Hebrew
 * 
 * @param {string|null} errorCode - Error code (if available)
 * @param {string|null} detail - Error detail message (fallback)
 * @returns {string} - Hebrew error message
 */
export const translateError = (errorCode, detail = null) => {
  // Priority 1: Use error_code if available
  if (errorCode && ERROR_CODES[errorCode]) {
    return ERROR_CODES[errorCode];
  }
  
  // Priority 2: Translate detail message
  if (detail) {
    const detailLower = detail.toLowerCase();
    
    // Check for exact match in error codes (case-insensitive)
    for (const [key, value] of Object.entries(ERROR_CODES)) {
      if (detailLower === key.toLowerCase()) {
        return value;
      }
    }
    
    // Check for common error patterns
    if (detailLower.includes('invalid credentials') || detailLower.includes('invalid credential')) {
      return ERROR_CODES['AUTH_INVALID_CREDENTIALS'];
    }
    
    if (detailLower.includes('bad request')) {
      return ERROR_CODES['BAD_REQUEST'];
    }
    
    if (detailLower.includes('field required') || detailLower.includes('required')) {
      return ERROR_CODES['VALIDATION_FIELD_REQUIRED'];
    }
    
    if (detailLower.includes('invalid email') || detailLower.includes('email')) {
      return ERROR_CODES['VALIDATION_INVALID_EMAIL'];
    }
    
    if (detailLower.includes('invalid phone') || detailLower.includes('phone')) {
      return ERROR_CODES['VALIDATION_INVALID_PHONE'];
    }
    
    if (detailLower.includes('e.164')) {
      return 'מספר טלפון חייב להיות בפורמט E.164 (דוגמה: +972501234567)';
    }
    
    // If backend provides Hebrew, use it directly
    // Check if message contains Hebrew characters
    const hasHebrew = /[\u0590-\u05FF]/.test(detail);
    if (hasHebrew) {
      return detail;
    }
    
    // Otherwise, return generic message
    return detail || ERROR_CODES['UNKNOWN_ERROR'];
  }
  
  // Fallback
  return ERROR_CODES['UNKNOWN_ERROR'];
};
