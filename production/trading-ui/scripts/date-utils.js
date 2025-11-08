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
function formatDate(dateString, includeTime = false) {
  if (!dateString) {return '-';}

  try {
    const date = parseDate(dateString);
    if (!date) {return '-';}

    if (includeTime) {
      return date.toLocaleString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

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
  return formatDate(dateString, true);
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
  return formatDate(dateString, false);
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
    const date = parseDate(dateString);
    if (!date) {return '-';}

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
    const date = parseDate(dateString);
    if (!date) {return '-';}

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
    const date = parseDate(dateString);
    if (!date) {return '-';}

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

    // Strategy 2: Handle combined ISO date-time with space or T separator
    const isoDateTimeMatch = cleanString.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?(Z|[+-]\d{2}:\d{2})?$/
    );
    if (isoDateTimeMatch) {
      const [, year, month, day, hour, minute, second = '00', fractional = '', timezone = ''] = isoDateTimeMatch;
      let isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
      if (fractional) {
        // Convert microseconds to milliseconds by trimming/padding to 3 digits
        const millis = fractional.padEnd(3, '0').slice(0, 3);
        isoString += `.${millis}`;
      }
      if (timezone) {
        isoString += timezone;
      }
      parsedDate = new Date(isoString);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Strategy 3: Handle Hebrew date format (DD/MM/YYYY)
    const hebrewDateMatch = cleanString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (hebrewDateMatch) {
      const [, day, month, year] = hebrewDateMatch;
      // Note: JavaScript Date constructor expects MM/DD/YYYY format
      parsedDate = new Date(`${month}/${day}/${year}`);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Strategy 4: Handle YYYY-MM-DD format
    const isoDateMatch = cleanString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoDateMatch) {
      const [, year, month, day] = isoDateMatch;
      parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Strategy 5: Handle DD-MM-YYYY format
    const europeanDateMatch = cleanString.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (europeanDateMatch) {
      const [, day, month, year] = europeanDateMatch;
      parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Strategy 6: Handle timestamp (milliseconds)
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

    // Strategy 7: Try with custom format if provided
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

// Mark as ready
window.dateUtilsReady = true;
// console.log('✅ Date Utils ready');
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

// ===== DATE RANGE TRANSLATION =====
/**
 * Translate date range string to actual start and end dates
 * 
 * Supports calendar-based ranges (השבוע, החודש, השנה) and relative ranges (7 days, 30 days, etc.)
 * All calendar ranges are calculated from the calendar start (Sunday for week, 1st for month, Jan 1 for year)
 * 
 * @param {string} dateRange - Date range string (e.g., "השבוע", "החודש", "שבוע", etc.)
 * @returns {Object|null} Object with startDate and endDate (ISO strings) or null for invalid ranges
 * 
 * @example
 * translateDateRangeToDates('השבוע') 
 * // Returns: { startDate: '2025-01-05T00:00:00.000Z', endDate: '2025-01-11T23:59:59.999Z' }
 */
function translateDateRangeToDates(dateRange) {
  if (!dateRange || dateRange === 'כל זמן') {
    return null;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();
  
  let startDate = null;
  let endDate = null;
  
  switch (dateRange) {
    case 'היום': {
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    
    case 'אתמול': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = new Date(yesterday);
      endDate = new Date(yesterday);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    
    // השבוע = מתחילת השבוע הקלנדארי (יום ראשון) עד היום
    case 'השבוע': {
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      startDate = startOfWeek;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    
    // שבוע = 7 ימים אחורה מהיום
    case 'שבוע':
    case '7 ימים': {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      startDate = weekAgo;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    
    // שבוע קודם = השבוע הקלנדארי הקודם (יום ראשון עד שבת של השבוע הקודם)
    case 'שבוע קודם':
    case 'שבוע שעבר': {
      const dayOfWeek = today.getDay();
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1); // Last Saturday
      lastWeekEnd.setHours(23, 59, 59, 999);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6); // Previous Sunday
      lastWeekStart.setHours(0, 0, 0, 0);
      startDate = lastWeekStart;
      endDate = lastWeekEnd;
      break;
    }
    
    // החודש = מתחילת החודש הקלנדארי (יום 1) עד היום
    case 'החודש': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      startDate = startOfMonth;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    
    // חודש = 30 ימים אחורה מהיום
    case 'חודש':
    case '30 ימים': {
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 30);
      startDate = monthAgo;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    
    // חודש קודם = החודש הקלנדארי הקודם (יום 1 עד היום האחרון של החודש הקודם)
    case 'חודש קודם': {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      lastMonthStart.setHours(0, 0, 0, 0);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
      lastMonthEnd.setHours(23, 59, 59, 999);
      startDate = lastMonthStart;
      endDate = lastMonthEnd;
      break;
    }
    
    // השנה = מתחילת השנה הקלנדארית (1 בינואר) עד היום
    case 'השנה': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      startDate = startOfYear;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    
    // שנה = 365 ימים אחורה מהיום
    case 'שנה':
    case '365 ימים': {
      const yearAgo = new Date(today);
      yearAgo.setDate(today.getDate() - 365);
      startDate = yearAgo;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    
    // שנה קודמת = השנה הקלנדארית הקודמת (1 בינואר עד 31 בדצמבר של השנה הקודמת)
    case 'שנה קודמת':
    case 'שנה שעברה': {
      const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
      lastYearStart.setHours(0, 0, 0, 0);
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
      lastYearEnd.setHours(23, 59, 59, 999);
      startDate = lastYearStart;
      endDate = lastYearEnd;
      break;
    }
    
    default:
      return null;
  }
  
  if (startDate && endDate) {
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }
  
  return null;
}

// _REMOVED_initializeDateUtils - Function was commented out and is no longer in use
// Original implementation was removed as part of code cleanup

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
};

// Export translateDateRangeToDates to global scope
window.translateDateRangeToDates = translateDateRangeToDates;
