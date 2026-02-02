/**
 * usePhoenixTableFilter - React Hook לניהול פילטרים מקומיים של טבלה
 * ----------------------------------------------------------------
 * Hook לניהול פילטרים מקומיים של טבלה עם אינטגרציה לפילטרים גלובליים.
 * 
 * @description Hook לניהול פילטרים מקומיים של טבלה עם שילוב פילטרים גלובליים
 * @standard JS Standards Protocol ✅ | Audit Trail System ✅ | Debug Mode ✅
 * @legacyReference Legacy.tables.filtering
 */

import { useState, useCallback, useMemo } from 'react';
import { usePhoenixFilter } from '../contexts/PhoenixFilterContext.jsx';
import { audit } from '../../../utils/audit';
import { DEBUG_MODE } from '../../../utils/debug';

/**
 * Filter State Type
 * @typedef {Object} FilterState
 * @property {Object} global - פילטרים גלובליים (מ-PhoenixFilterContext)
 * @property {Object} local - פילטרים מקומיים של הטבלה
 */

/**
 * usePhoenixTableFilter Hook
 * 
 * @description Hook לניהול פילטרים מקומיים של טבלה עם שילוב פילטרים גלובליים
 * @returns {Object} { filters, applyFilters, setLocalFilter, clearFilters, combinedFilters }
 * 
 * @example
 * const { filters, setLocalFilter, clearFilters, combinedFilters } = usePhoenixTableFilter();
 * 
 * // עדכון פילטר מקומי
 * setLocalFilter('dateFrom', '2026-01-01');
 * 
 * // קבלת פילטרים משולבים (גלובלי + מקומי)
 * console.log(combinedFilters);
 * // { global: { search: 'חשבון' }, local: { dateFrom: '2026-01-01' } }
 */
export const usePhoenixTableFilter = () => {
  // פילטרים גלובליים (מ-PhoenixFilterContext)
  const { filters: globalFilters } = usePhoenixFilter();

  // State management: פילטרים מקומיים של הטבלה
  const [localFilters, setLocalFilters] = useState({});

  /**
   * setLocalFilter - עדכון פילטר מקומי
   * 
   * @description עדכון פילטר מקומי של הטבלה
   * @param {string} key - מפתח הפילטר המקומי
   * @param {any} value - ערך הפילטר
   * 
   * @example
   * setLocalFilter('dateFrom', '2026-01-01');
   * setLocalFilter('dateTo', '2026-01-31');
   * setLocalFilter('accountId', '01ARZ3NDEKTSV4RRFFQ69G5FAV');
   */
  const setLocalFilter = useCallback((key, value) => {
    setLocalFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [key]: value
      };

      // Audit Trail - לוג כל שינוי פילטר מקומי (רק ב-?debug)
      if (DEBUG_MODE) {
        audit.log('Tables', 'Local filter changed', {
          key,
          value,
          previousValue: prevFilters[key],
          allLocalFilters: newFilters
        });
      }

      return newFilters;
    });
  }, []);

  /**
   * applyFilters - שילוב פילטרים גלובליים ומקומיים
   * 
   * @description שילוב פילטרים גלובליים ומקומיים לפילטרים משולבים
   * @param {Object} additionalFilters - פילטרים נוספים (אופציונלי)
   * @returns {Object} פילטרים משולבים
   * 
   * @example
   * const combinedFilters = applyFilters({ customFilter: 'value' });
   * // Returns: { ...globalFilters, ...localFilters, customFilter: 'value' }
   */
  const applyFilters = useCallback((additionalFilters = {}) => {
    const combinedFilters = {
      ...globalFilters,
      ...localFilters,
      ...additionalFilters
    };

    // Audit Trail - לוג שילוב פילטרים (רק ב-?debug)
    if (DEBUG_MODE) {
      audit.log('Tables', 'Filters applied', {
        globalFilters,
        localFilters,
        additionalFilters,
        combinedFilters
      });
    }

    return combinedFilters;
  }, [globalFilters, localFilters]);

  /**
   * clearFilters - איפוס כל הפילטרים המקומיים
   * 
   * @description איפוס כל הפילטרים המקומיים של הטבלה (לא נוגע בפילטרים גלובליים)
   * 
   * @example
   * clearFilters();
   * // localFilters = {}
   */
  const clearFilters = useCallback(() => {
    const previousFilters = { ...localFilters };
    setLocalFilters({});

    // Audit Trail - לוג איפוס פילטרים מקומיים (רק ב-?debug)
    if (DEBUG_MODE) {
      audit.log('Tables', 'Local filters cleared', {
        previousFilters,
        globalFilters
      });
    }
  }, [localFilters, globalFilters]);

  /**
   * combinedFilters - פילטרים משולבים (גלובלי + מקומי)
   * 
   * @description פילטרים משולבים מחושבים אוטומטית (useMemo)
   * @type {Object}
   */
  const combinedFilters = useMemo(() => {
    return {
      ...globalFilters,
      ...localFilters
    };
  }, [globalFilters, localFilters]);

  return {
    filters: {
      global: globalFilters,
      local: localFilters
    },
    applyFilters,
    setLocalFilter,
    clearFilters,
    combinedFilters
  };
};

export default usePhoenixTableFilter;
