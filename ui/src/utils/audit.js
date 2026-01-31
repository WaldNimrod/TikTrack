/**
 * Phoenix Audit System
 * --------------------
 * תשתית לניטור ודיבאגינג בזמן אמת.
 * 
 * @description כל מודול (Auth, Data, Trading) חייב לממש רישום פעולות דרך מחלקת ה-AuditTrail
 * @legacyReference Legacy.audit.PhoenixAudit
 */

import { DEBUG_MODE } from './debug.js';

/**
 * PhoenixAudit - מערכת Audit Trail
 * 
 * @description מחלקה לניהול רישום פעולות וניטור
 * @legacyReference Legacy.audit.PhoenixAudit
 * 
 * @class
 */
class PhoenixAudit {
  constructor() {
    // זיהוי Debug Flag מה-URL
    this.isDebug = DEBUG_MODE;
    this.logs = [];
    this.maxLogs = 1000;
  }

  /**
   * Log - רישום פעולה לוגית
   * 
   * @description רישום פעולה לוגית עם timestamp ונתונים
   * @legacyReference Legacy.audit.log
   * 
   * @param {string} module - שם המודול (למשל: 'Auth', 'API', 'UI')
   * @param {string} action - הפעולה המבוצעת
   * @param {object} data - נתונים בפורמט נקי (אופציונלי)
   * 
   * @example
   * audit.log('Auth', 'Login attempt started', { email: 'user@example.com' });
   */
  log(module, action, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      module,
      action,
      data,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      url: typeof window !== 'undefined' ? window.location.href : null
    };

    this.logs.push(entry);
    
    // Keep only last 1000 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output (only in debug mode)
    if (this.isDebug) {
      console.info(`🛡️ [Phoenix Audit][${module}] ${action}`, data || '');
    }
  }

  /**
   * Error - רישום שגיאה
   * 
   * @description רישום שגיאה עם פרטים מלאים
   * @legacyReference Legacy.audit.error
   * 
   * @param {string} module - שם המודול
   * @param {string} message - הודעת השגיאה
   * @param {Error} error - אובייקט השגיאה (אופציונלי)
   * 
   * @example
   * audit.error('Auth', 'Login failure', error);
   */
  error(module, message, error = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      module,
      action: 'ERROR',
      message,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      url: typeof window !== 'undefined' ? window.location.href : null
    };

    this.logs.push(entry);
    
    // Keep only last 1000 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Errors are always logged to console
    console.error(`❌ [Phoenix Audit][${module}] ERROR: ${message}`, error);
  }

  /**
   * Export - ייצוא הלוגים
   * 
   * @description ייצוא הלוגים לצורכי QA ובדיקות
   * @legacyReference Legacy.audit.export
   * 
   * @returns {string} - JSON string of audit trail
   * 
   * @example
   * const logs = audit.export();
   * // Returns: JSON string with all audit logs
   */
  export() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear - ניקוי הלוגים
   * 
   * @description ניקוי הלוגים (לצורכי בדיקה)
   * @legacyReference Legacy.audit.clear
   * 
   * @example
   * audit.clear();
   */
  clear() {
    this.logs = [];
  }

  /**
   * Get Logs - קבלת הלוגים
   * 
   * @description קבלת מערך הלוגים (לצורכי בדיקה)
   * 
   * @returns {Array} - מערך הלוגים
   */
  getLogs() {
    return this.logs;
  }
}

// Export singleton instance
export const audit = new PhoenixAudit();
