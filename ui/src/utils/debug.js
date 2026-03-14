/**
 * Debug Utilities
 * ---------------
 * תמיכה בפרמטר ?debug ב-URL להפעלת לוגים מפורטים ב-Console.
 *
 * @description מערכת דיבאג מבוקרת המאפשרת לוגים מפורטים רק במצב debug
 * @legacyReference Legacy.debug.DEBUG_MODE
 */

/**
 * Debug Mode Flag
 *
 * @description זיהוי פרמטר ?debug ב-URL להפעלת debug mode
 * @type {boolean}
 *
 * @example
 * // URL: http://localhost:8080/login?debug
 * // DEBUG_MODE = true
 */
export const DEBUG_MODE =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).has('debug')
    : false;

/**
 * Debug Log
 *
 * @description רישום לוגים מפורטים ב-Console רק במצב debug
 * @legacyReference Legacy.debug.debugLog
 *
 * @param {string} category - קטגוריית הלוג (למשל: 'Auth', 'API', 'UI')
 * @param {string} message - הודעת הלוג
 * @param {Object} data - נתונים נוספים (אופציונלי)
 *
 * @example
 * debugLog('Auth', 'Login attempt started', { userId: '123' });
 * // Console output (only if DEBUG_MODE = true):
 * // [Auth] Login attempt started { userId: '123' }
 */
export const debugLog = (category, message, data = {}) => {
  if (DEBUG_MODE) {
    console.info(`[${category}] ${message}`, data);
  }
};

/**
 * Debug Error
 *
 * @description רישום שגיאות ב-Console (תמיד מוצג, לא רק ב-debug mode)
 *
 * @param {string} category - קטגוריית השגיאה
 * @param {string} message - הודעת השגיאה
 * @param {Error} error - אובייקט השגיאה
 *
 * @example
 * debugError('Auth', 'Login failure', error);
 * // Console output (always):
 * // [Auth] ERROR: Login failure Error: ...
 */
export const debugError = (category, message, error = null) => {
  console.error(`[${category}] ERROR: ${message}`, error);
};
