/**
 * PhoenixTable - Component בסיסי לטבלאות Phoenix
 * ------------------------------------------------
 * Component בסיסי לטבלאות עם תמיכה בסידור, סינון, ו-Accessibility.
 *
 * @description Component בסיסי לטבלאות עם אינטגרציה ל-Hooks, Audit Trail, ו-Transformation Layer
 * @standard JS Standards Protocol ✅ | LEGO System ✅ | Accessibility ✅ | Audit Trail ✅
 * @legacyReference Legacy.tables.PhoenixTable
 */

import React, { useMemo } from 'react';
import { usePhoenixTableSort } from '../../hooks/usePhoenixTableSort';
import { usePhoenixTableFilter } from '../../hooks/usePhoenixTableFilter';
import { audit } from '../../../utils/audit';
import { DEBUG_MODE } from '../../../utils/debug';

/**
 * Column Definition Type
 * @typedef {Object} Column
 * @property {string} key - מפתח השדה (camelCase)
 * @property {string} label - תווית העמודה
 * @property {boolean} sortable - האם ניתן למיין לפי עמודה זו
 * @property {string} type - סוג השדה ('string' | 'numeric' | 'date' | 'boolean' | 'currency')
 * @property {Function} render - פונקציית רינדור מותאמת אישית (אופציונלי)
 */

/**
 * PhoenixTable Component Props
 * @typedef {Object} PhoenixTableProps
 * @property {Array} data - נתוני הטבלה (camelCase)
 * @property {Array<Column>} columns - הגדרת עמודות
 * @property {Function} onSort - Callback לסידור (אופציונלי)
 * @property {Function} onFilter - Callback לסינון (אופציונלי)
 * @property {boolean} loading - מצב טעינה
 * @property {string} error - הודעת שגיאה (אופציונלי)
 * @property {string} title - כותרת הטבלה (אופציונלי)
 * @property {string} sectionName - שם הסקשן (לשימוש ב-data-section)
 */

/**
 * PhoenixTable Component
 *
 * @description Component בסיסי לטבלאות עם תמיכה בסידור, סינון, ו-Accessibility
 *
 * @param {PhoenixTableProps} props - Props של Component
 *
 * @example
 * <PhoenixTable
 *   data={accounts}
 *   columns={[
 *     { key: 'displayNames', label: 'שם חשבון מסחר', sortable: true, type: 'string' },
 *     { key: 'availableAmounts', label: 'יתרה', sortable: true, type: 'numeric' }
 *   ]}
 *   loading={false}
 *   title="ניהול חשבונות מסחר"
 * />
 */
const PhoenixTable = ({
  data = [],
  columns = [],
  onSort,
  onFilter,
  loading = false,
  error = null,
  title = null,
  sectionName = 'table-section',
}) => {
  // Hooks: שימוש ב-Hooks לניהול סידור ופילטרים
  const { sortState, handleSort } = usePhoenixTableSort();
  const { combinedFilters } = usePhoenixTableFilter();

  /**
   * handleSortClick - טיפול בלחיצה על כותרת עמודה לסידור
   *
   * @description טיפול בלחיצה על כותרת עמודה לסידור (עם תמיכה ב-Multi-sort עם Shift)
   */
  const handleSortClick = (columnKey, event) => {
    const isSecondary = event.shiftKey;
    handleSort(columnKey, isSecondary);

    // Callback לסידור (אם מוגדר)
    if (onSort) {
      onSort(columnKey, sortState, isSecondary);
    }

    // Audit Trail - לוג לחיצה על סידור (רק ב-?debug)
    if (DEBUG_MODE) {
      audit.log('Tables', 'Sort header clicked', {
        columnKey,
        isSecondary,
        sortState,
      });
    }
  };

  /**
   * getSortIcon - קבלת אייקון סידור לפי מצב
   *
   * @description קבלת אייקון סידור לפי מצב (ASC, DESC, NONE)
   * @param {string} columnKey - מפתח העמודה
   * @returns {string} מצב הסידור ('asc' | 'desc' | 'none')
   */
  const getSortIcon = (columnKey) => {
    if (sortState.primary.key === columnKey) {
      return sortState.primary.direction === 'ASC'
        ? 'asc'
        : sortState.primary.direction === 'DESC'
          ? 'desc'
          : 'none';
    }
    if (sortState.secondary.key === columnKey) {
      return sortState.secondary.direction === 'ASC'
        ? 'asc'
        : sortState.secondary.direction === 'DESC'
          ? 'desc'
          : 'none';
    }
    return 'none';
  };

  /**
   * renderCell - רינדור תא בטבלה
   *
   * @description רינדור תא בטבלה לפי סוג השדה
   * @param {any} value - ערך התא
   * @param {Column} column - הגדרת העמודה
   * @param {Object} row - שורה שלמה (לשימוש ב-render מותאם אישית)
   */
  const renderCell = (value, column, row) => {
    // אם יש פונקציית render מותאמת אישית
    if (column.render) {
      return column.render(value, row);
    }

    // רינדור לפי סוג השדה
    switch (column.type) {
      case 'numeric':
      case 'currency':
        return (
          <span className="phoenix-table__cell--numeric">
            {typeof value === 'number' ? value.toLocaleString('he-IL') : value}
          </span>
        );
      case 'date':
        // פורמט תאריך: DD/MM/YY
        if (value instanceof Date) {
          const d = value.getDate().toString().padStart(2, '0');
          const m = (value.getMonth() + 1).toString().padStart(2, '0');
          const y = value.getFullYear().toString().slice(-2);
          return `${d}/${m}/${y}`;
        }
        return value;
      case 'boolean':
        return value ? 'כן' : 'לא';
      default:
        return value;
    }
  };

  /**
   * sortedAndFilteredData - נתונים מסודרים ומסוננים
   *
   * @description נתונים מסודרים ומסוננים לפי sortState ו-combinedFilters
   */
  const sortedAndFilteredData = useMemo(() => {
    let result = [...data];

    // סינון (אם יש פילטרים)
    if (combinedFilters && Object.keys(combinedFilters).length > 0) {
      // TODO: יישום לוגיקת סינון לפי combinedFilters
      // זה ייושם בשלב 4 עם הטבלה הראשונה
    }

    // סידור (אם יש סידור פעיל)
    if (sortState.primary.key) {
      const primaryColumn = columns.find(
        (col) => col.key === sortState.primary.key,
      );
      if (primaryColumn) {
        result.sort((a, b) => {
          const aValue = a[sortState.primary.key];
          const bValue = b[sortState.primary.key];

          // סידור לפי סוג השדה
          if (
            primaryColumn.type === 'numeric' ||
            primaryColumn.type === 'currency'
          ) {
            return sortState.primary.direction === 'ASC'
              ? (aValue || 0) - (bValue || 0)
              : (bValue || 0) - (aValue || 0);
          }

          // סידור טקסטואלי
          const aStr = String(aValue || '').toLowerCase();
          const bStr = String(bValue || '').toLowerCase();
          return sortState.primary.direction === 'ASC'
            ? aStr.localeCompare(bStr, 'he')
            : bStr.localeCompare(aStr, 'he');
        });
      }
    }

    // סידור שניה (אם יש)
    if (sortState.secondary.key) {
      const secondaryColumn = columns.find(
        (col) => col.key === sortState.secondary.key,
      );
      if (secondaryColumn) {
        result.sort((a, b) => {
          const aValue = a[sortState.secondary.key];
          const bValue = b[sortState.secondary.key];

          if (
            secondaryColumn.type === 'numeric' ||
            secondaryColumn.type === 'currency'
          ) {
            return sortState.secondary.direction === 'ASC'
              ? (aValue || 0) - (bValue || 0)
              : (bValue || 0) - (aValue || 0);
          }

          const aStr = String(aValue || '').toLowerCase();
          const bStr = String(bValue || '').toLowerCase();
          return sortState.secondary.direction === 'ASC'
            ? aStr.localeCompare(bStr, 'he')
            : bStr.localeCompare(aStr, 'he');
        });
      }
    }

    return result;
  }, [data, sortState, combinedFilters, columns]);

  // רינדור Component
  return (
    <tt-section data-section={sectionName} data-title={title || undefined}>
      <div className="index-section__body">
        <tt-section-row>
          <div className="phoenix-table-wrapper">
            {error && (
              <div className="phoenix-table__error js-table-error" role="alert">
                {error}
              </div>
            )}

            {loading && (
              <div className="phoenix-table__loading js-table-loading">
                טוען נתונים...
              </div>
            )}

            {!loading && !error && (
              <table
                className="phoenix-table js-table"
                role="table"
                aria-label={title || 'טבלת נתונים'}
              >
                <thead className="phoenix-table__head" role="rowgroup">
                  <tr className="phoenix-table__row" role="row">
                    {columns.map((column) => {
                      const sortIcon = getSortIcon(column.key);
                      const ariaSort =
                        sortIcon === 'asc'
                          ? 'ascending'
                          : sortIcon === 'desc'
                            ? 'descending'
                            : 'none';

                      return (
                        <th
                          key={column.key}
                          className={`phoenix-table__header ${column.sortable ? 'js-table-sort-trigger' : ''}`}
                          role="columnheader"
                          aria-sort={column.sortable ? ariaSort : undefined}
                          tabIndex={column.sortable ? 0 : undefined}
                          onClick={
                            column.sortable
                              ? (e) => handleSortClick(column.key, e)
                              : undefined
                          }
                          onKeyDown={
                            column.sortable
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleSortClick(column.key, e);
                                  }
                                }
                              : undefined
                          }
                        >
                          <span className="phoenix-table__header-text">
                            {column.label}
                          </span>
                          {column.sortable && (
                            <span className="phoenix-table__sort-indicator js-sort-indicator">
                              <svg
                                className={`phoenix-table__sort-icon js-sort-icon`}
                                data-sort-state={sortIcon}
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                {sortIcon === 'asc' && (
                                  <path
                                    d="M6 2L2 6H10L6 2Z"
                                    fill="currentColor"
                                  />
                                )}
                                {sortIcon === 'desc' && (
                                  <path
                                    d="M6 10L10 6H2L6 10Z"
                                    fill="currentColor"
                                  />
                                )}
                                {sortIcon === 'none' && (
                                  <path
                                    d="M6 3L3 6H9L6 3Z M6 9L9 6H3L6 9Z"
                                    fill="currentColor"
                                    opacity="0.3"
                                  />
                                )}
                              </svg>
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="phoenix-table__body" role="rowgroup">
                  {sortedAndFilteredData.length === 0 ? (
                    <tr className="phoenix-table__row" role="row">
                      <td
                        className="phoenix-table__cell"
                        colSpan={columns.length}
                        role="gridcell"
                      >
                        אין נתונים להצגה
                      </td>
                    </tr>
                  ) : (
                    sortedAndFilteredData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="phoenix-table__row"
                        role="row"
                      >
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={`phoenix-table__cell ${column.type === 'numeric' || column.type === 'currency' ? 'phoenix-table__cell--numeric' : ''} ${column.type === 'currency' ? 'phoenix-table__cell--currency' : ''} ${column.type === 'date' ? 'phoenix-table__cell--date' : ''} ${column.type === 'boolean' ? 'phoenix-table__cell--status' : ''}`}
                            data-field={column.key}
                            role="gridcell"
                          >
                            {renderCell(row[column.key], column, row)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </tt-section-row>
      </div>
    </tt-section>
  );
};

export default PhoenixTable;
