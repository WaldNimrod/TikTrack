/**
 * PhoenixFilterContext - Context API לפילטרים גלובליים
 * ----------------------------------------------------
 * מערכת ניהול פילטרים גלובליים לכל הטבלאות במערכת.
 * 
 * @description Context API לניהול מצב פילטרים גלובליים (status, investmentType, tradingAccount, dateRange, search)
 * @standard JS Standards Protocol ✅ | Audit Trail System ✅ | Debug Mode ✅
 * @legacyReference Legacy.filters.globalFilters
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { audit } from '../../../utils/audit';
import { DEBUG_MODE } from '../../../utils/debug';

/**
 * Filter State Type
 * @typedef {Object} FilterState
 * @property {string|null} status - סטטוס (פתוח/סגור/מבוטל)
 * @property {string|null} investmentType - סוג השקעה
 * @property {string|null} tradingAccount - חשבון מסחר
 * @property {{from: string|null, to: string|null}} dateRange - טווח תאריכים
 * @property {string} search - חיפוש טקסט חופשי
 */

/**
 * Filter Context Type
 * @typedef {Object} FilterContextType
 * @property {FilterState} filters - מצב הפילטרים הנוכחי
 * @property {function(string, any): void} setFilter - עדכון פילטר ספציפי
 * @property {function(): void} clearFilters - איפוס כל הפילטרים
 * @property {function(): FilterState} getFilters - קבלת מצב הפילטרים הנוכחי
 */

// יצירת Context
const PhoenixFilterContext = createContext(null);

/**
 * PhoenixFilterProvider - Provider Component
 * 
 * @description מספק Context API לניהול פילטרים גלובליים
 * @param {React.ReactNode} children - רכיבי הילדים
 * 
 * @example
 * <PhoenixFilterProvider>
 *   <App />
 * </PhoenixFilterProvider>
 */
export const PhoenixFilterProvider = ({ children }) => {
  // State management: פילטרים גלובליים
  const [filters, setFiltersState] = useState({
    status: null,
    investmentType: null,
    tradingAccount: null,
    dateRange: {
      from: null,
      to: null
    },
    search: ''
  });

  /**
   * setFilter - עדכון פילטר ספציפי
   * 
   * @description עדכון פילטר יחיד במצב הפילטרים
   * @param {string} key - מפתח הפילטר (status, investmentType, tradingAccount, dateRange, search)
   * @param {any} value - ערך הפילטר
   * 
   * @example
   * setFilter('status', 'active');
   * setFilter('dateRange', { from: '2026-01-01', to: '2026-01-31' });
   * setFilter('search', 'חשבון מסחר');
   */
  const setFilter = useCallback((key, value) => {
    setFiltersState((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [key]: value
      };

      // Audit Trail - לוג כל שינוי פילטר (רק ב-?debug)
      if (DEBUG_MODE) {
        audit.log('Filters', `Filter changed: ${key}`, {
          key,
          value,
          previousValue: prevFilters[key],
          allFilters: newFilters
        });
      }

      return newFilters;
    });
  }, []);

  /**
   * clearFilters - איפוס כל הפילטרים
   * 
   * @description איפוס כל הפילטרים למצב התחלתי
   * 
   * @example
   * clearFilters();
   */
  const clearFilters = useCallback(() => {
    const initialFilters = {
      status: null,
      investmentType: null,
      tradingAccount: null,
      dateRange: {
        from: null,
        to: null
      },
      search: ''
    };

    setFiltersState(initialFilters);

    // Audit Trail - לוג איפוס פילטרים (רק ב-?debug)
    if (DEBUG_MODE) {
      audit.log('Filters', 'All filters cleared', {
        previousFilters: filters,
        newFilters: initialFilters
      });
    }
  }, [filters]);

  /**
   * getFilters - קבלת מצב הפילטרים הנוכחי
   * 
   * @description קבלת מצב הפילטרים הנוכחי (read-only)
   * @returns {FilterState} מצב הפילטרים הנוכחי
   * 
   * @example
   * const currentFilters = getFilters();
   * console.log(currentFilters.status); // 'active' או null
   */
  const getFilters = useCallback(() => {
    return filters;
  }, [filters]);

  // Context Value
  const contextValue = {
    filters,
    setFilter,
    clearFilters,
    getFilters
  };

  return (
    <PhoenixFilterContext.Provider value={contextValue}>
      {children}
    </PhoenixFilterContext.Provider>
  );
};

/**
 * usePhoenixFilter - Hook לשימוש ב-PhoenixFilterContext
 * 
 * @description Hook wrapper ל-Context API של הפילטרים הגלובליים
 * @returns {FilterContextType} { filters, setFilter, clearFilters, getFilters }
 * 
 * @throws {Error} אם נעשה שימוש מחוץ ל-PhoenixFilterProvider
 * 
 * @example
 * const { filters, setFilter, clearFilters } = usePhoenixFilter();
 * 
 * // עדכון פילטר
 * setFilter('status', 'active');
 * 
 * // קריאת פילטר
 * console.log(filters.status); // 'active'
 * 
 * // איפוס פילטרים
 * clearFilters();
 */
export const usePhoenixFilter = () => {
  const context = useContext(PhoenixFilterContext);
  
  if (!context) {
    throw new Error('usePhoenixFilter must be used within a PhoenixFilterProvider');
  }
  
  return context;
};

// Export default
export default PhoenixFilterContext;
