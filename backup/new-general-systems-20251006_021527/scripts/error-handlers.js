// ===== קובץ JavaScript לטיפול בשגיאות =====
/*
 * Error-Handlers.js - Error Handling Utilities
 * ===========================================
 *
 * This file contains utility functions for handling errors throughout the TikTrack application.
 * It provides centralized error handling and logging functionality.
 *
 * Dependencies:
 * - notification-system.js (for user notifications)
 *
 * File: trading-ui/scripts/error-handlers.js
 * Version: 1.0
 * Last Updated: August 31, 2025
 */

// ===== פונקציות טיפול בשגיאות =====

/**
 * טיפול בשגיאות API
 * @param {Error} error - השגיאה
 * @param {string} context - הקונטקסט של השגיאה
 * @param {string} userMessage - הודעה למשתמש
 */
function handleApiError(error, context = 'API_CALL', userMessage = null) {
  // לוג מפורט למפתחים
  // console.warn(`🔧 API Error in ${context}:`, error);

  // הודעה למשתמש
  const message = userMessage || `שגיאה ב${context} - נסה שוב מאוחר יותר`;

  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  } else {
    // showErrorNotification לא זמינה
  }
}

/**
 * טיפול באלמנטים שלא נמצאו
 * @param {string} elementId - מזהה האלמנט
 * @param {string} fallback - פעולה חלופית
 */
function handleElementNotFound(elementId, fallback = 'ELEMENT_NOT_FOUND') {
  // console.warn(`🔧 Element not found: ${elementId} - ${fallback}`);

  // הודעה למשתמש רק אם זה קריטי
  if (fallback === 'CRITICAL') {
    if (typeof window.showWarningNotification === 'function') {
      window.showWarningNotification('אזהרה', 'אלמנט לא נמצא - ייתכן שהדף לא נטען כראוי');
    }
  }
}

/**
 * טיפול בפונקציות שלא נמצאו
 * @param {string} functionName - שם הפונקציה
 * @param {string} fallback - פעולה חלופית
 */
function handleFunctionNotFound(functionName, fallback = 'FUNCTION_NOT_FOUND') {
  // console.warn(`🔧 Function not found: ${functionName} - ${fallback}`);

  // הודעה למשתמש רק אם זה קריטי
  if (fallback === 'CRITICAL') {
    if (typeof window.showWarningNotification === 'function') {
      window.showWarningNotification('אזהרה', 'פונקציה לא זמינה - ייתכן שהדף לא נטען כראוי');
    }
  }
}

/**
 * טיפול בשגיאות ולידציה
 * @param {string} field - שם השדה
 * @param {string} message - הודעת השגיאה
 */
function handleValidationError(field, message) {
  // console.warn(`🔧 Validation error in ${field}: ${message}`);

  // הצגת שגיאה בשדה הספציפי
  if (typeof window.showValidationWarning === 'function') {
    window.showValidationWarning(field, message);
  } else if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאת וולידציה', message);
  }
}

/**
 * טיפול בשגיאות טעינת נתונים
 * @param {Error} error - השגיאה
 * @param {string} dataType - סוג הנתונים
 */
function handleDataLoadError(error, dataType) {
  // console.warn(`🔧 Data load error for ${dataType}:`, error);

  const message = `שגיאה בטעינת ${dataType} - נסה לרענן את הדף`;

  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  }
}

/**
 * טיפול בשגיאות שמירה
 * @param {Error} error - השגיאה
 * @param {string} operation - סוג הפעולה
 */
function handleSaveError(error, operation) {
  // console.warn(`🔧 Save error for ${operation}:`, error);

  const message = `שגיאה ב${operation} - נסה שוב`;

  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  }
}

/**
 * טיפול בשגיאות מחיקה
 * @param {Error} error - השגיאה
 * @param {string} itemType - סוג הפריט
 */
function handleDeleteError(error, itemType) {
  // console.warn(`🔧 Delete error for ${itemType}:`, error);

  const message = `שגיאה במחיקת ${itemType} - נסה שוב`;

  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  }
}

/**
 * טיפול בשגיאות מערכת
 * @param {Error} error - השגיאה
 * @param {string} system - שם המערכת
 */
function handleSystemError(error, system) {
  // console.warn(`🔧 System error in ${system}:`, error);

  const message = `שגיאה במערכת ${system} - נסה לרענן את הדף`;

  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  }
}

// ===== ייצוא פונקציות גלובליות =====

// ייצוא פונקציות לטיפול בשגיאות
window.handleApiError = handleApiError;
window.handleElementNotFound = handleElementNotFound;
window.handleFunctionNotFound = handleFunctionNotFound;
window.handleValidationError = handleValidationError;
window.handleDataLoadError = handleDataLoadError;
window.handleSaveError = handleSaveError;
window.handleDeleteError = handleDeleteError;
window.handleSystemError = handleSystemError;

// ===== אינדקס פונקציות =====
/*
 * אינדקס פונקציות בקובץ זה:
 *
 * 1. handleApiError(error, context, userMessage) - טיפול בשגיאות API
 * 2. handleElementNotFound(elementId, fallback) - טיפול באלמנטים לא נמצאו
 * 3. handleFunctionNotFound(functionName, fallback) - טיפול בפונקציות לא נמצאו
 * 4. handleValidationError(field, message) - טיפול בשגיאות ולידציה
 * 5. handleDataLoadError(error, dataType) - טיפול בשגיאות טעינת נתונים
 * 6. handleSaveError(error, operation) - טיפול בשגיאות שמירה
 * 7. handleDeleteError(error, itemType) - טיפול בשגיאות מחיקה
 * 8. handleSystemError(error, system) - טיפול בשגיאות מערכת
 *
 * כל הפונקציות מיוצאת ל-global scope וזמינות בכל הפרויקט.
 */
