/**
 * Date Utils - TikTrack Date Utilities
 * ====================================
 *
 * REFACTORING HISTORY:
 * ===================
 *
 * This file was created during the main.js modular split (Phase 6 - August 24, 2025)
 * to centralize all date-related functionality that was previously scattered across
 * multiple files.
 *
 * ORIGINAL STATE:
 * - Date formatting functions duplicated in main.js, cash_flows.js, tickers.js, currencies.js
 * - Inconsistent date formatting across the application
 * - No centralized date validation or conversion utilities
 * - Difficult to maintain date-related functionality
 *
 * REFACTORING BENEFITS:
 * - Single source of truth for all date operations
 * - Consistent date formatting across all pages
 * - Comprehensive date validation and conversion utilities
 * - Easy to maintain and extend date functionality
 *
 * CONTENTS:
 * =========
 *
 * 1. DATE FORMATTING FUNCTIONS:
 *    - formatDate() - Standard date formatting
 *    - formatDateTime() - Date and time formatting
 *    - formatDateOnly() - Date only formatting
 *    - formatShortDate() - Short date format
 *    - formatLongDate() - Long date format
 *    - formatTimeOnly() - Time only formatting
 *
 * 2. DATE CONVERSION UTILITIES:
 *    - toISOString() - Convert to ISO string
 *    - toDate() - Convert to Date object
 *
 * 3. DATE VALIDATION FUNCTIONS:
 *    - isValidDate() - Validate date string
 *    - isPastDate() - Check if date is in the past
 *    - isFutureDate() - Check if date is in the future
 *
 * 4. DATE CALCULATION HELPERS:
 *    - daysDifference() - Calculate days between dates
 *    - addDays() - Add days to date
 *    - addMonths() - Add months to date
 *
 * DEPENDENCIES:
 * ============
 * - No external dependencies
 * - All functions exported to global scope (window object)
 *
 * USAGE:
 * ======
 *
 * Basic date formatting:
 * ```javascript
 * const formatted = formatDate('2025-08-24T10:30:00');
 * // Result: "24/08/2025"
 * ```
 *
 * Date validation:
 * ```javascript
 * if (isValidDate(dateString)) {
 *   // Process valid date
 * }
 * ```
 *
 * Date calculations:
 * ```javascript
 * const days = daysDifference(startDate, endDate);
 * const futureDate = addDays(today, 30);
 * ```
 *
 * @version 1.0
 * @lastUpdated August 24, 2025
 * @refactoringPhase 6 - Modular Architecture
 */

// ===== DATE FORMATTING FUNCTIONS =====
/**
 * Format date to standard display format
 *
 * Converts date strings to a consistent display format (DD/MM/YYYY)
 * Handles various input formats and provides fallback for invalid dates
 *
 * @param {string|Date} dateString - Date string or Date object to format
 * @returns {string} Formatted date string (DD/MM/YYYY) or '-' for invalid dates
 */
function formatDate(dateString) {
  if (!dateString) {return '-';}

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {return '-';}

    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    // console.warn('⚠️ Error formatting date:', dateString, error);
    return '-';
  }
}

/**
 * Format date and time for display
 *
 * Converts date strings to display format with both date and time
 * Useful for timestamps and detailed time information
 *
 * @param {string|Date} dateString - Date string or Date object to format
 * @returns {string} Formatted date and time string or '-' for invalid dates
 */
function formatDateTime(dateString) {
  if (!dateString) {return '-';}

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {return '-';}

    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    // console.warn('⚠️ Error formatting date time:', dateString, error);
    return '-';
  }
}

/**
 * Format date only (without time)
 *
 * Similar to formatDate but with more explicit naming
 * Used when you specifically want date without time information
 *
 * @param {string|Date} dateString - Date string or Date object to format
 * @returns {string} Formatted date string (DD/MM/YYYY) or '-' for invalid dates
 */
function formatDateOnly(dateString) {
  if (!dateString) {return '-';}

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {return '-';}

    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    // console.warn('⚠️ Error formatting date only:', dateString, error);
    return '-';
  }
}

/**
 * Format short date for compact display
 *
 * Provides a shorter date format for space-constrained displays
 *
 * @param {string|Date} dateString - Date string or Date object to format
 * @returns {string} Short formatted date string or '-' for invalid dates
 */
function formatShortDate(dateString) {
  if (!dateString) {return '-';}

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {return '-';}

    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    // console.warn('⚠️ Error formatting short date:', dateString, error);
    return '-';
  }
}

/**
 * Format long date with full month name
 *
 * Provides a more detailed date format with full month names
 * Useful for formal displays and detailed information
 *
 * @param {string|Date} dateString - Date string or Date object to format
 * @returns {string} Long formatted date string or '-' for invalid dates
 */
function formatLongDate(dateString) {
  if (!dateString) {return '-';}

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {return '-';}

    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    // console.warn('⚠️ Error formatting long date:', dateString, error);
    return '-';
  }
}

/**
 * Format time only from date string
 *
 * Extracts and formats only the time portion from a date string
 * Useful for time-only displays
 *
 * @param {string|Date} dateString - Date string or Date object to format
 * @returns {string} Formatted time string (HH:MM) or '-' for invalid dates
 */
function formatTimeOnly(dateString) {
  if (!dateString) {return '-';}

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {return '-';}

    return date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    // console.warn('⚠️ Error formatting time:', dateString, error);
    return '-';
  }
}

// ===== DATE CONVERSION UTILITIES =====
/**
 * Parse date string to Date object with multiple format support
 *
 * Parses various date string formats and returns a valid Date object
 * Supports multiple input formats including ISO, Hebrew locale, and custom formats
 *
 * @param {string} dateString - Date string to parse
 * @param {Object} options - Parsing options
 * @returns {Date|null} Parsed Date object or null for invalid dates
 */
function parseDate(dateString, options = {}) {
  if (!dateString) {return null;}

  try {
    // Handle different input types
    if (dateString instanceof Date) {
      return isNaN(dateString.getTime()) ? null : dateString;
    }

    if (typeof dateString !== 'string') {
      return null;
    }

    // Clean the input string
    const cleanString = dateString.trim();
    if (!cleanString) {return null;}

    // Try different parsing strategies
    let parsedDate = null;

    // Strategy 1: Direct Date constructor (handles most ISO formats)
    parsedDate = new Date(cleanString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    // Strategy 2: Handle Hebrew date format (DD/MM/YYYY)
    const hebrewDateMatch = cleanString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (hebrewDateMatch) {
      const [, day, month, year] = hebrewDateMatch;
      // Note: JavaScript Date constructor expects MM/DD/YYYY format
      parsedDate = new Date(`${month}/${day}/${year}`);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Strategy 3: Handle YYYY-MM-DD format
    const isoDateMatch = cleanString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoDateMatch) {
      const [, year, month, day] = isoDateMatch;
      parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Strategy 4: Handle DD-MM-YYYY format
    const europeanDateMatch = cleanString.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (europeanDateMatch) {
      const [, day, month, year] = europeanDateMatch;
      parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Strategy 5: Handle timestamp (milliseconds)
    if (/^\d+$/.test(cleanString)) {
      const timestamp = parseInt(cleanString, 10);
      // Check if it's a reasonable timestamp (between 1970 and 2100)
      if (timestamp > 0 && timestamp < 4102444800000) {
        parsedDate = new Date(timestamp);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }

    // Strategy 6: Try with custom format if provided
    if (options.format) {
      try {
        // This is a simplified custom format parser
        // In a full implementation, you might want to use a library like moment.js
        const formatPatterns = {
          'DD/MM/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
          'MM/DD/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
          'YYYY-MM-DD': /^(\d{4})-(\d{2})-(\d{2})$/,
          'DD-MM-YYYY': /^(\d{2})-(\d{2})-(\d{4})$/
        };

        const pattern = formatPatterns[options.format];
        if (pattern) {
          const match = cleanString.match(pattern);
          if (match) {
            let year, month, day;
            
            if (options.format === 'DD/MM/YYYY' || options.format === 'DD-MM-YYYY') {
              [, day, month, year] = match;
            } else {
              [, year, month, day] = match;
            }
            
            parsedDate = new Date(`${year}-${month}-${day}`);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          }
        }
      } catch (error) {
        // Ignore custom format errors
      }
    }

    // If all strategies failed, return null
    return null;

  } catch (error) {
    console.warn('⚠️ Error parsing date:', dateString, error);
    return null;
  }
}

/**
 * Convert date to ISO string format
 *
 * Converts any date input to ISO 8601 string format
 * Useful for API calls and data storage
 *
 * @param {string|Date} date - Date to convert
 * @returns {string} ISO string format or null for invalid dates
 */
function toISOString(date) {
  if (!date) {return null;}

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {return null;}

    return dateObj.toISOString();
  } catch {
    // console.warn('⚠️ Error converting to ISO string:', date, error);
    return null;
  }
}

/**
 * Convert to Date object
 *
 * Safely converts any input to a Date object
 * Returns null for invalid dates
 *
 * @param {string|Date} date - Date to convert
 * @returns {Date|null} Date object or null for invalid dates
 */
function toDate(date) {
  if (!date) {return null;}

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {return null;}

    return dateObj;
  } catch {
    // console.warn('⚠️ Error converting to Date:', date, error);
    return null;
  }
}

// ===== DATE VALIDATION FUNCTIONS =====
/**
 * Validate if a string is a valid date
 *
 * Checks if the input can be converted to a valid Date object
 *
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date, false otherwise
 */
function isValidDate(dateString) {
  if (!dateString) {return false;}

  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Check if date is in the past
 *
 * Compares the given date with the current date
 *
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past, false otherwise
 */
function isPastDate(date) {
  if (!date) {return false;}

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {return false;}

    return dateObj < new Date();
  } catch {
    // console.warn('⚠️ Error checking past date:', date, error);
    return false;
  }
}

/**
 * Check if date is in the future
 *
 * Compares the given date with the current date
 *
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the future, false otherwise
 */
function isFutureDate(date) {
  if (!date) {return false;}

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {return false;}

    return dateObj > new Date();
  } catch {
    // console.warn('⚠️ Error checking future date:', date, error);
    return false;
  }
}

// ===== DATE CALCULATION HELPERS =====
/**
 * Calculate days difference between two dates
 *
 * Returns the number of days between two dates
 * Positive value if endDate is after startDate
 *
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} Number of days difference or null for invalid dates
 */
function daysDifference(startDate, endDate) {
  if (!startDate || !endDate) {return null;}

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {return null;}

    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch {
    // console.warn('⚠️ Error calculating days difference:', error);
    return null;
  }
}

/**
 * Add days to a date
 *
 * Adds specified number of days to a date
 *
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date|null} New date or null for invalid input
 */
function addDays(date, days) {
  if (!date || typeof days !== 'number') {return null;}

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {return null;}

    dateObj.setDate(dateObj.getDate() + days);
    return dateObj;
  } catch {
    // console.warn('⚠️ Error adding days:', error);
    return null;
  }
}

/**
 * Add months to a date
 *
 * Adds specified number of months to a date
 *
 * @param {string|Date} date - Base date
 * @param {number} months - Number of months to add
 * @returns {Date|null} New date or null for invalid input
 */
function addMonths(date, months) {
  if (!date || typeof months !== 'number') {return null;}

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {return null;}

    dateObj.setMonth(dateObj.getMonth() + months);
    return dateObj;
  } catch {
    // console.warn('⚠️ Error adding months:', error);
    return null;
  }
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatDateOnly = formatDateOnly;
window.formatShortDate = formatShortDate;
window.formatLongDate = formatLongDate;
window.formatTimeOnly = formatTimeOnly;
window.parseDate = parseDate;
window.toISOString = toISOString;
window.toDate = toDate;
window.isValidDate = isValidDate;
window.isPastDate = isPastDate;
window.isFutureDate = isFutureDate;
window.daysDifference = daysDifference;
window.addDays = addDays;
window.addMonths = addMonths;

// אתחול Date Utils
// function initializeDateUtils() {
//   // Date Utils loaded successfully
// }

// ייצוא המודול עצמו
window.dateUtils = {
  formatDate,
  formatDateTime,
  formatDateOnly,
  formatShortDate,
  formatLongDate,
  formatTimeOnly,
  parseDate,
  toISOString,
  toDate,
  isValidDate,
  isPastDate,
  isFutureDate,
  daysDifference,
  addDays,
  addMonths,
  createDateWithTimezone,
  translateDateRangeToDates,
};

// ===== TIMEZONE DATE CREATION =====
/**
 * יצירת תאריך עם timezone
 * Create date with timezone support
 * 
 * @param {number} year - שנה
 * @param {number} month - חודש (0-11)
 * @param {number} day - יום
 * @returns {Promise<string>} תאריך בפורמט YYYY-MM-DD
 */
async function createDateWithTimezone(year, month, day) {
  // Load user preferences for timezone
  let timezone = 'Asia/Jerusalem'; // Default timezone
  
  // Try to get timezone from preferences if available
  if (typeof window.loadUserPreferences === 'function') {
    try {
      const preferences = await window.loadUserPreferences();
      timezone = preferences?.timezone || 'Asia/Jerusalem';
    } catch (error) {
      console.warn('Could not load timezone from preferences, using default:', error);
    }
  }

  // Creating date with timezone
  const date = new Date(year, month, day);
  const options = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return date.toLocaleDateString('en-CA', options); // YYYY-MM-DD format
}

// ===== DATE RANGE TRANSLATION =====
/**
 * תרגום טווח תאריכים לתאריכים אמיתיים
 * Translate date range text to actual start and end dates
 * 
 * Supports Hebrew date range labels like:
 * - 'היום' (Today)
 * - 'אתמול' (Yesterday)
 * - 'שבוע אחרון' (Last week)
 * - 'חודש אחרון' (Last month)
 * - And many more...
 * 
 * @param {string|object} dateRange - טווח תאריכים (טקסט או אובייקט עם startDate ו-endDate)
 * @returns {Promise<object>} אובייקט עם { startDate, endDate } בפורמט YYYY-MM-DD
 */
async function translateDateRangeToDates(dateRange) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  let startDate = 'לא נבחר';
  let endDate = 'לא נבחר';

  if (typeof dateRange === 'string') {
    switch (dateRange) {
    case 'היום':
      startDate = todayStr;
      endDate = todayStr;
      break;

    case 'אתמול': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = yesterday.toISOString().split('T')[0];
      endDate = startDate;
      break;
    }

    case 'שבוע אחרון': {
      const weekAgoLast = new Date(today);
      weekAgoLast.setDate(today.getDate() - 7);
      startDate = weekAgoLast.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'חודש אחרון': {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '3 חודשים אחרונים': {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      startDate = threeMonthsAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '6 חודשים אחרונים': {
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      startDate = sixMonthsAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שנה אחרונה': {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      startDate = yearAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'השבוע': {
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      // In Israel, the week starts on Sunday (0)
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      startDate = startOfWeek.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שבוע': {
      const weekAgo7 = new Date(today);
      weekAgo7.setDate(today.getDate() - 7);
      startDate = weekAgo7.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'החודש': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = startOfMonth.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'MTD': {
      startDate = await createDateWithTimezone(today.getFullYear(), today.getMonth(), 1);
      endDate = todayStr;
      break;
    }

    case 'השנה': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      startDate = startOfYear.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'YTD': {
      startDate = await createDateWithTimezone(today.getFullYear(), 0, 1);
      endDate = todayStr;
      break;
    }

    case '30 יום': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '60 יום': {
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(today.getDate() - 60);
      startDate = sixtyDaysAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '90 יום': {
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);
      startDate = ninetyDaysAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שנה': {
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      startDate = oneYearAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שנה קודמת':
      startDate = await createDateWithTimezone(today.getFullYear() - 1, 0, 1);
      endDate = await createDateWithTimezone(today.getFullYear() - 1, 11, 31);
      break;

    default:
      // Attempting to extract dates from text
      if (dateRange.includes(' - ')) {
        const dates = dateRange.split(' - ');
        startDate = dates[0] || 'לא נבחר';
        endDate = dates[1] || 'לא נבחר';
      } else if (dateRange.includes(' עד ')) {
        const dates = dateRange.split(' עד ');
        startDate = dates[0] || 'לא נבחר';
        endDate = dates[1] || 'לא נבחר';
      } else {
        startDate = dateRange;
        endDate = dateRange;
      }
      break;
    }
  } else if (dateRange && dateRange.startDate && dateRange.endDate) {
    startDate = dateRange.startDate;
    endDate = dateRange.endDate;
  }

  return { startDate, endDate };
}

// Export to global scope
window.createDateWithTimezone = createDateWithTimezone;
window.translateDateRangeToDates = translateDateRangeToDates;
