/**
 * usePhoenixTableData - React Hook לטעינת נתוני טבלה מ-Backend API
 * ----------------------------------------------------------------
 * Hook לטעינת נתוני טבלה מ-Backend API עם Transformation Layer, Loading states, ו-Error handling.
 * 
 * @description Hook לטעינת נתוני טבלה מ-Backend API עם תמיכה ב-Transformation Layer
 * @standard JS Standards Protocol ✅ | Transformation Layer ✅ | Audit Trail System ✅ | Debug Mode ✅
 * @legacyReference Legacy.tables.dataFetching
 */

import { useState, useEffect, useCallback } from 'react';
import { apiToReact } from '../utils/transformers';
import { audit } from '../../../utils/audit';
import { DEBUG_MODE } from '../../../utils/debug';
import { handleApiError } from '../../../utils/errorHandler';

/**
 * usePhoenixTableData Hook
 * 
 * @description Hook לטעינת נתוני טבלה מ-Backend API
 * @param {Function} fetchFunction - פונקציה לטעינת נתונים (חייבת להחזיר Promise)
 * @param {Array} dependencies - תלויות ל-useEffect (למשל: [filters, sortState])
 * @returns {Object} { data, loading, error, refetch }
 * 
 * @example
 * const { data, loading, error, refetch } = usePhoenixTableData(
 *   () => tradingAccountsService.list(),
 *   [filters, sortState]
 * );
 * 
 * // הנתונים כבר מומרים ל-camelCase (מ-snake_case)
 * console.log(data); // [{ displayNames: 'חשבון 1', availableAmounts: 1000 }, ...]
 */
export const usePhoenixTableData = (fetchFunction, dependencies = []) => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * fetchData - טעינת נתונים מ-Backend API
   * 
   * @description טעינת נתונים מ-Backend API עם Transformation Layer ו-Error handling
   * @private
   */
  const fetchData = useCallback(async () => {
    if (!fetchFunction) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Audit Trail - לוג התחלת טעינת נתונים (רק ב-?debug)
      if (DEBUG_MODE) {
        audit.log('Tables', 'Data fetch started', {
          fetchFunction: fetchFunction.name,
          dependencies
        });
      }

      // קריאה ל-Backend API
      const response = await fetchFunction();

      // Transformation Layer: Backend (snake_case) → Frontend (camelCase)
      const transformedData = apiToReact(response.data || response);

      setData(transformedData);

      // Audit Trail - לוג הצלחת טעינת נתונים (רק ב-?debug)
      if (DEBUG_MODE) {
        audit.log('Tables', 'Data fetch succeeded', {
          fetchFunction: fetchFunction.name,
          dataCount: Array.isArray(transformedData) ? transformedData.length : 1,
          sampleData: Array.isArray(transformedData) ? transformedData[0] : transformedData
        });
      }
    } catch (err) {
      // Error handling עם errorHandler
      const errorMessage = handleApiError(err);
      setError(errorMessage);

      // Audit Trail - לוג שגיאה בטעינת נתונים
      audit.error('Tables', 'Data fetch failed', err);

      // איפוס נתונים במקרה של שגיאה
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, ...dependencies]);

  /**
   * refetch - טעינה מחדש של הנתונים
   * 
   * @description טעינה מחדש של הנתונים (לשימוש ידני)
   * 
   * @example
   * const { refetch } = usePhoenixTableData(...);
   * 
   * // טעינה מחדש לאחר עדכון
   * await updateAccount();
   * refetch();
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // useEffect: טעינת נתונים אוטומטית כאשר dependencies משתנים
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

export default usePhoenixTableData;
