/**
 * Calendar Date Utils - TikTrack Calendar Date Utilities
 * ======================================================
 * 
 * Utility functions for calendar date calculations and formatting.
 * Integrates with date-utils.js for centralized date operations.
 * 
 * Documentation: See documentation/frontend/TRADING_JOURNAL_PAGE_AUDIT_PLAN.md
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */

(function() {
    'use strict';

    /**
     * Calendar Date Utils Class
     */
    class CalendarDateUtils {
        /**
         * Get first day of month (0 = Sunday, 6 = Saturday)
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @returns {number} Day of week (0-6)
         */
        static getFirstDayOfMonth(year, month) {
            return new Date(year, month, 1).getDay();
        }

        /**
         * Get number of days in month
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @returns {number} Number of days
         */
        static getDaysInMonth(year, month) {
            return new Date(year, month + 1, 0).getDate();
        }

        /**
         * Check if date is today
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @param {number} day - Day
         * @returns {boolean} True if date is today
         */
        static isToday(year, month, day) {
            const today = new Date();
            return today.getFullYear() === year &&
                   today.getMonth() === month &&
                   today.getDate() === day;
        }

        /**
         * Check if month is current month
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @returns {boolean} True if month is current month
         */
        static isCurrentMonth(year, month) {
            const today = new Date();
            return today.getFullYear() === year && today.getMonth() === month;
        }

        /**
         * Navigate to previous or next month using date-utils.js
         * @param {number} year - Current year
         * @param {number} month - Current month (0-11)
         * @param {string} direction - 'prev' or 'next'
         * @returns {Object} {year, month} New year and month
         */
        static navigateMonth(year, month, direction) {
            // Use date-utils.js addMonths if available
            if (window.addMonths && typeof window.addMonths === 'function') {
                const currentDate = new Date(year, month, 1);
                const monthsToAdd = direction === 'prev' ? -1 : 1;
                const newDate = window.addMonths(currentDate, monthsToAdd);
                
                if (newDate) {
                    return {
                        year: newDate.getFullYear(),
                        month: newDate.getMonth()
                    };
                }
            }
            
            // Fallback to manual calculation
            let newMonth = month;
            let newYear = year;
            
            if (direction === 'prev') {
                newMonth--;
                if (newMonth < 0) {
                    newMonth = 11;
                    newYear--;
                }
            } else if (direction === 'next') {
                newMonth++;
                if (newMonth > 11) {
                    newMonth = 0;
                    newYear++;
                }
            }
            
            return { year: newYear, month: newMonth };
        }

        /**
         * Format month name in Hebrew
         * @param {number} month - Month (0-11)
         * @returns {string} Month name in Hebrew
         */
        static getMonthNameHebrew(month) {
            const monthNames = [
                'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
            ];
            return monthNames[month] || '';
        }

        /**
         * Format month display (e.g., "ינואר 2025")
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @returns {string} Formatted month display
         */
        static formatMonthDisplay(year, month) {
            const monthName = this.getMonthNameHebrew(month);
            return `${monthName} ${year}`;
        }

        /**
         * Get Hebrew day names for calendar headers
         * @returns {Array<string>} Array of day names
         */
        static getHebrewDayNames() {
            return ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
        }

        /**
         * Parse DateEnvelope to Date object
         * @param {Object|string|Date} dateValue - DateEnvelope, ISO string, or Date
         * @returns {Date|null} Parsed Date or null
         */
        static parseDate(dateValue) {
            if (!dateValue) return null;
            
            // If it's already a Date object
            if (dateValue instanceof Date) {
                return isNaN(dateValue.getTime()) ? null : dateValue;
            }
            
            // If it's a DateEnvelope object
            if (typeof dateValue === 'object' && dateValue.utc) {
                return new Date(dateValue.utc);
            }
            
            // If it's a string, try to parse it
            if (typeof dateValue === 'string') {
                const parsed = new Date(dateValue);
                return isNaN(parsed.getTime()) ? null : parsed;
            }
            
            return null;
        }

        /**
         * Check if date is within month range
         * @param {Date|string|Object} dateValue - Date to check
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @returns {boolean} True if date is in month
         */
        static isDateInMonth(dateValue, year, month) {
            const date = this.parseDate(dateValue);
            if (!date) return false;
            
            return date.getFullYear() === year && date.getMonth() === month;
        }

        /**
         * Get date range for month (start and end dates)
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @returns {Object} {start: Date, end: Date}
         */
        static getMonthDateRange(year, month) {
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
    }

    // Export to global scope
    window.CalendarDateUtils = CalendarDateUtils;

    if (window.Logger) {
        window.Logger.info('Calendar Date Utils loaded', { 
            page: 'calendar-date-utils' 
        });
    }

})();

