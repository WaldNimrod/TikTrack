/**
 * Date Utils - TikTrack Date Utilities
 * ====================================
 * 
 * This file contains all date-related utility functions including:
 * - Date formatting functions
 * - Date conversion utilities
 * - Date validation functions
 * 
 * Extracted from main.js to improve modularity and maintainability.
 * 
 * @version 1.0
 * @lastUpdated August 24, 2025
 */

// ===== פונקציות עיצוב תאריכים =====
// Date formatting functions

/**
 * פונקציה לעיצוב תאריך עם שעה
 * Format date with time
 * 
 * @param {string} dateString - מחרוזת תאריך
 * @returns {string} תאריך מעוצב
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

/**
 * פונקציה לעיצוב תאריך ושעה
 * Format date and time
 * 
 * @param {string} dateString - מחרוזת תאריך
 * @returns {string} תאריך ושעה מעוצבים
 */
function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL');
}

/**
 * פונקציה לעיצוב תאריך בלבד (ללא שעה)
 * Format date only (without time)
 * 
 * @param {string} dateString - מחרוזת תאריך
 * @returns {string} תאריך בלבד מעוצב
 */
function formatDateOnly(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
}

/**
 * פונקציה לעיצוב תאריך קצר
 * Format short date
 * 
 * @param {string} dateString - מחרוזת תאריך
 * @returns {string} תאריך קצר
 */
function formatShortDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
  });
}

/**
 * פונקציה לעיצוב תאריך ארוך
 * Format long date
 * 
 * @param {string} dateString - מחרוזת תאריך
 * @returns {string} תאריך ארוך
 */
function formatLongDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * פונקציה לעיצוב זמן בלבד
 * Format time only
 * 
 * @param {string} dateString - מחרוזת תאריך
 * @returns {string} זמן בלבד
 */
function formatTimeOnly(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('he-IL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// ===== פונקציות המרה =====
// Conversion functions

/**
 * המרת תאריך למחרוזת ISO
 * Convert date to ISO string
 * 
 * @param {string|Date} date - תאריך להמרה
 * @returns {string} מחרוזת ISO
 */
function toISOString(date) {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toISOString();
}

/**
 * המרת תאריך לתאריך JavaScript
 * Convert to JavaScript Date object
 * 
 * @param {string|Date} date - תאריך להמרה
 * @returns {Date|null} אובייקט תאריך או null
 */
function toDate(date) {
  if (!date) return null;
  const dateObj = new Date(date);
  return isNaN(dateObj.getTime()) ? null : dateObj;
}

// ===== פונקציות ולידציה =====
// Validation functions

/**
 * בדיקה אם מחרוזת היא תאריך תקין
 * Check if string is valid date
 * 
 * @param {string} dateString - מחרוזת לבדיקה
 * @returns {boolean} true אם תאריך תקין
 */
function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * בדיקה אם תאריך הוא בעבר
 * Check if date is in the past
 * 
 * @param {string|Date} date - תאריך לבדיקה
 * @returns {boolean} true אם בעבר
 */
function isPastDate(date) {
  if (!date) return false;
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj < now;
}

/**
 * בדיקה אם תאריך הוא בעתיד
 * Check if date is in the future
 * 
 * @param {string|Date} date - תאריך לבדיקה
 * @returns {boolean} true אם בעתיד
 */
function isFutureDate(date) {
  if (!date) return false;
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj > now;
}

// ===== פונקציות חישוב =====
// Calculation functions

/**
 * חישוב הפרש ימים בין שני תאריכים
 * Calculate days difference between two dates
 * 
 * @param {string|Date} date1 - תאריך ראשון
 * @param {string|Date} date2 - תאריך שני
 * @returns {number} הפרש ימים
 */
function daysDifference(date1, date2) {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * הוספת ימים לתאריך
 * Add days to date
 * 
 * @param {string|Date} date - תאריך התחלתי
 * @param {number} days - מספר ימים להוספה
 * @returns {Date} תאריך חדש
 */
function addDays(date, days) {
  if (!date) return new Date();
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
}

/**
 * הוספת חודשים לתאריך
 * Add months to date
 * 
 * @param {string|Date} date - תאריך התחלתי
 * @param {number} months - מספר חודשים להוספה
 * @returns {Date} תאריך חדש
 */
function addMonths(date, months) {
  if (!date) return new Date();
  const dateObj = new Date(date);
  dateObj.setMonth(dateObj.getMonth() + months);
  return dateObj;
}

// ===== ייצוא פונקציות גלובליות =====
// Export global functions

window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatDateOnly = formatDateOnly;
window.formatShortDate = formatShortDate;
window.formatLongDate = formatLongDate;
window.formatTimeOnly = formatTimeOnly;
window.toISOString = toISOString;
window.toDate = toDate;
window.isValidDate = isValidDate;
window.isPastDate = isPastDate;
window.isFutureDate = isFutureDate;
window.daysDifference = daysDifference;
window.addDays = addDays;
window.addMonths = addMonths;

console.log('✅ Date Utils loaded successfully');
