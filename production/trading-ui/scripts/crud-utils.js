/**
 * CRUD Utils - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains global CRUD utility functions for editing, deleting, and canceling records across different table types.
 * 
 * Related Documentation:
 * - documentation/05-REPORTS/CRUD_STANDARDIZATION_WORK_DOCUMENT.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

// ===== CRUD UTILS - פונקציות גלובליות לעריכה ומחיקה =====

/**
 * עריכת רשומה בטבלה
 * @function editRecord
 * @param {string} tableType - סוג הטבלה
 * @param {number} id - מזהה הרשומה
 * @param {Object} data - נתונים לעדכון
 * @returns {void}
 */
function editRecord(tableType, id, data) {

  // קריאה לפונקציה הספציפית של הטבלה
  const editFunction = window[`edit${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Record`];
  if (typeof editFunction === 'function') {
    editFunction(id, data);
  } else {
    // editRecord function not found
  }
}

/**
 * מחיקת רשומה מטבלה
 * @function deleteRecord
 * @param {string} tableType - סוג הטבלה
 * @param {number} id - מזהה הרשומה
 * @returns {void}
 */
function deleteRecord(tableType, id) {

  // קריאה לפונקציה הספציפית של הטבלה
  const deleteFunction = window[`delete${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Record`];
  if (typeof deleteFunction === 'function') {
    deleteFunction(id);
  } else {
    // deleteRecord function not found
  }
}

/**
 * ביטול רשומה בטבלה
 * @function cancelRecord
 * @param {string} tableType - סוג הטבלה
 * @param {number} id - מזהה הרשומה
 * @returns {void}
 */
function cancelRecord(tableType, id) {

  // קריאה לפונקציה הספציפית של הטבלה
  const cancelFunction = window[`cancel${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Record`];
  if (typeof cancelFunction === 'function') {
    cancelFunction(id);
  } else {
    // cancelRecord function not found
  }
}

// ===== GLOBAL EXPORTS =====
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.cancelRecord = cancelRecord;
