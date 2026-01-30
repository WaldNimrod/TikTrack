/**
 * Error Handlers - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains utility functions for handling errors throughout the TikTrack application.
 * Provides centralized error handling and logging functionality.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/ERROR_HANDLING_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

// ===== פונקציות טיפול בשגיאות =====

/**
 * Handle API errors
 * @function handleApiError
 * @param {Error} error - The error object
 * @param {string} context - Error context
 * @param {string|null} userMessage - User message
 * @returns {void}
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
 * Handle element not found errors
 * @function handleElementNotFound
 * @param {string} elementId - Element ID
 * @param {string} fallback - Fallback action
 * @returns {void}
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
 * Handle validation errors
 * @function handleValidationError
 * @param {string} field - Field name
 * @param {string} message - Error message
 * @returns {void}
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
 * Handle data load errors
 * @function handleDataLoadError
 * @param {Error} error - The error object
 * @param {string} dataType - Type of data being loaded
 * @returns {void}
 */
function handleDataLoadError(error, dataType) {
  // console.warn(`🔧 Data load error for ${dataType}:`, error);

  const message = `שגיאה בטעינת ${dataType} - נסה לרענן את הדף`;

  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  }
}

/**
 * Handle save errors
 * @function handleSaveError
 * @param {Error} error - The error object
 * @param {string} operation - Operation being performed
 * @returns {void}
 */
function handleSaveError(error, operation) {
  // console.warn(`🔧 Save error for ${operation}:`, error);

  const message = `שגיאה ב${operation} - נסה שוב`;

  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  }
}

/**
 * Handle delete errors
 * @function handleDeleteError
 * @param {Error} error - The error object
 * @param {string} itemType - Type of item being deleted
 * @returns {void}
 */
function handleDeleteError(error, itemType) {
  // console.warn(`🔧 Delete error for ${itemType}:`, error);

  const message = `שגיאה במחיקת ${itemType} - נסה שוב`;

  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  }
}

/**
 * Handle system errors
 * @function handleSystemError
 * @param {Error} error - The error object
 * @param {string} system - System name
 * @returns {void}
 */
function handleSystemError(error, system) {
  // console.warn(`🔧 System error in ${system}:`, error);

  const message = `שגיאה במערכת ${system} - נסה לרענן את הדף`;

  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  }
}

// ===== GLOBAL EXPORTS =====
window.handleApiError = handleApiError;
window.handleElementNotFound = handleElementNotFound;
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
