/**
 * usePhoenixTableSort - React Hook לניהול סידור טבלאות
 * -----------------------------------------------------
 * Hook לניהול מצב סידור טבלאות עם תמיכה ב-Multi-sort (Primary + Secondary).
 *
 * @description Hook לניהול סידור טבלאות עם מחזור סידור (ASC → DESC → NONE) ו-Multi-sort (Shift + click)
 * @standard JS Standards Protocol ✅ | Audit Trail System ✅ | Debug Mode ✅
 * @legacyReference Legacy.tables.sorting
 */

import { useState, useCallback } from 'react';
import { audit } from '../../../utils/audit';
import { DEBUG_MODE } from '../../../utils/debug';

/**
 * Sort State Type
 * @typedef {Object} SortState
 * @property {{key: string|null, direction: 'ASC'|'DESC'|'NONE'}} primary - רמת סידור ראשונה
 * @property {{key: string|null, direction: 'ASC'|'DESC'|'NONE'}} secondary - רמת סידור שניה
 */

/**
 * usePhoenixTableSort Hook
 *
 * @description Hook לניהול מצב סידור טבלאות
 * @returns {Object} { sortState, handleSort, clearSort, getSortState }
 *
 * @example
 * const { sortState, handleSort, clearSort } = usePhoenixTableSort();
 *
 * // לחיצה ראשונה: ASC
 * handleSort('displayNames');
 * // sortState.primary = { key: 'displayNames', direction: 'ASC' }
 *
 * // לחיצה שניה: DESC
 * handleSort('displayNames');
 * // sortState.primary = { key: 'displayNames', direction: 'DESC' }
 *
 * // לחיצה שלישית: NONE (איפוס)
 * handleSort('displayNames');
 * // sortState.primary = { key: null, direction: null }
 *
 * // Multi-sort (Shift + click): רמת סידור שניה
 * handleSort('brokerNames', true);
 * // sortState.secondary = { key: 'brokerNames', direction: 'ASC' }
 */
export const usePhoenixTableSort = () => {
  // State management: מצב סידור (Primary + Secondary)
  const [sortState, setSortState] = useState({
    primary: { key: null, direction: null },
    secondary: { key: null, direction: null },
  });

  /**
   * handleSort - טיפול בלחיצה על כותרת עמודה לסידור
   *
   * @description מחזור סידור: ASC → DESC → NONE (או רמת סידור שניה עם Shift)
   * @param {string} key - מפתח השדה לסידור (למשל: 'displayNames', 'availableAmounts')
   * @param {boolean} isSecondary - האם זו רמת סידור שניה (Shift + click)
   *
   * @example
   * // לחיצה רגילה: רמת סידור ראשונה
   * handleSort('displayNames');
   *
   * // Shift + click: רמת סידור שניה
   * handleSort('brokerNames', true);
   */
  const handleSort = useCallback((key, isSecondary = false) => {
    setSortState((prevState) => {
      const currentState = isSecondary
        ? prevState.secondary
        : prevState.primary;
      const newState = { ...prevState };

      // מחזור סידור: ASC → DESC → NONE
      if (currentState.key === key) {
        // אותה עמודה - מחזור כיוון
        if (currentState.direction === 'ASC') {
          // ASC → DESC
          if (isSecondary) {
            newState.secondary = { key, direction: 'DESC' };
          } else {
            newState.primary = { key, direction: 'DESC' };
            // איפוס רמת סידור שניה אם משנים את הראשונה
            newState.secondary = { key: null, direction: null };
          }
        } else if (currentState.direction === 'DESC') {
          // DESC → NONE (איפוס)
          if (isSecondary) {
            newState.secondary = { key: null, direction: null };
          } else {
            newState.primary = { key: null, direction: null };
            // איפוס רמת סידור שניה אם מאפסים את הראשונה
            newState.secondary = { key: null, direction: null };
          }
        }
      } else {
        // עמודה חדשה - התחלה ב-ASC
        if (isSecondary) {
          newState.secondary = { key, direction: 'ASC' };
        } else {
          newState.primary = { key, direction: 'ASC' };
          // איפוס רמת סידור שניה אם משנים את הראשונה
          newState.secondary = { key: null, direction: null };
        }
      }

      // Audit Trail - לוג כל שינוי סידור (רק ב-?debug)
      if (DEBUG_MODE) {
        audit.log('Tables', 'Sort changed', {
          key,
          direction: isSecondary
            ? newState.secondary.direction
            : newState.primary.direction,
          isSecondary,
          sortState: newState,
        });
      }

      return newState;
    });
  }, []);

  /**
   * clearSort - איפוס כל הסידור
   *
   * @description איפוס כל מצב הסידור למצב התחלתי
   *
   * @example
   * clearSort();
   * // sortState.primary = { key: null, direction: null }
   * // sortState.secondary = { key: null, direction: null }
   */
  const clearSort = useCallback(() => {
    const initialSortState = {
      primary: { key: null, direction: null },
      secondary: { key: null, direction: null },
    };

    setSortState(initialSortState);

    // Audit Trail - לוג איפוס סידור (רק ב-?debug)
    if (DEBUG_MODE) {
      audit.log('Tables', 'Sort cleared', {
        previousSortState: sortState,
        newSortState: initialSortState,
      });
    }
  }, [sortState]);

  /**
   * getSortState - קבלת מצב הסידור הנוכחי
   *
   * @description קבלת מצב הסידור הנוכחי (read-only)
   * @returns {SortState} מצב הסידור הנוכחי
   *
   * @example
   * const currentSortState = getSortState();
   * console.log(currentSortState.primary.key); // 'displayNames' או null
   */
  const getSortState = useCallback(() => {
    return sortState;
  }, [sortState]);

  return {
    sortState,
    handleSort,
    clearSort,
    getSortState,
  };
};

export default usePhoenixTableSort;
