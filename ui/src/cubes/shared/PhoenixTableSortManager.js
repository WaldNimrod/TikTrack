/**
 * PhoenixTableSortManager - Class לניהול סידור טבלאות
 * -----------------------------------------------------
 * Class לניהול מצב סידור טבלאות עם תמיכה ב-Multi-sort (Primary + Secondary).
 * 
 * @description Class לניהול סידור טבלאות עם מחזור סידור (ASC → DESC → NONE) ו-Multi-sort (Shift + click)
 * @standard JS Standards Protocol ✅ | Clean Slate Rule ✅ | Accessibility ✅
 * @legacyReference Legacy.tables.sorting
 * 
 * @example
 * const sortManager = new PhoenixTableSortManager(tableElement);
 * // מחזור סידור: ASC → DESC → NONE
 * // Multi-sort: Shift + click לרמת סידור שניה
 */

class PhoenixTableSortManager {
  /**
   * @param {HTMLTableElement} tableElement - אלמנט הטבלה
   */
  constructor(tableElement) {
    this.table = tableElement;
    this.sortState = {
      primary: { key: null, direction: null },
      secondary: { key: null, direction: null }
    };
    this.init();
  }

  /**
   * init - אתחול המנהל
   * 
   * @description חיבור event listeners לכל כותרות העמודות הניתנות לסידור
   */
  init() {
    if (!this.table) {
      console.warn('[PhoenixTableSortManager] Table element not found');
      return;
    }

    // חיבור event listeners לכל כותרות העמודות הניתנות לסידור
    const headers = this.table.querySelectorAll('[data-sortable="true"], .js-table-sort-trigger');
    
    headers.forEach(header => {
      // Event listener ללחיצה רגילה (רמת סידור ראשונה)
      header.addEventListener('click', (e) => {
        if (e.shiftKey) {
          // Shift + click: רמת סידור שניה
          this.handleSort(header, true, e);
        } else {
          // לחיצה רגילה: רמת סידור ראשונה
          this.handleSort(header, false, e);
        }
      });

      // תמיכה ב-keyboard navigation
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (e.shiftKey) {
            this.handleSort(header, true, e);
          } else {
            this.handleSort(header, false, e);
          }
        }
      });
    });

    maskedLog(`[PhoenixTableSortManager] Initialized for table: ${this.table.id || 'unnamed'}`);
  }

  /**
   * handleSort - טיפול בלחיצה על כותרת עמודה לסידור
   * 
   * @description מחזור סידור: ASC → DESC → NONE (או רמת סידור שניה עם Shift)
   * @param {HTMLElement} header - אלמנט כותרת העמודה
   * @param {boolean} isSecondary - האם זו רמת סידור שניה (Shift + click)
   * @param {Event} event - אירוע הלחיצה (אופציונלי)
   */
  handleSort(header, isSecondary = false, event = null) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const sortKey = header.dataset.sortKey || header.dataset.sortKey;
    const sortType = header.dataset.sortType || 'string'; // string, numeric, date, boolean

    if (!sortKey) {
      console.warn('[PhoenixTableSortManager] No sort key found for header');
      return;
    }

    const currentState = isSecondary ? this.sortState.secondary : this.sortState.primary;

    // מחזור סידור: ASC → DESC → NONE
    if (currentState.key === sortKey) {
      // אותה עמודה - מחזור כיוון
      if (currentState.direction === 'ASC') {
        // ASC → DESC
        if (isSecondary) {
          this.sortState.secondary = { key: sortKey, direction: 'DESC' };
        } else {
          this.sortState.primary = { key: sortKey, direction: 'DESC' };
          // איפוס רמת סידור שניה אם משנים את הראשונה
          this.sortState.secondary = { key: null, direction: null };
        }
      } else if (currentState.direction === 'DESC') {
        // DESC → NONE (איפוס)
        if (isSecondary) {
          this.sortState.secondary = { key: null, direction: null };
        } else {
          this.sortState.primary = { key: null, direction: null };
          // איפוס רמת סידור שניה אם מאפסים את הראשונה
          this.sortState.secondary = { key: null, direction: null };
        }
      }
    } else {
      // עמודה חדשה - התחלה ב-ASC
      if (isSecondary) {
        this.sortState.secondary = { key: sortKey, direction: 'ASC' };
      } else {
        this.sortState.primary = { key: sortKey, direction: 'ASC' };
        // איפוס רמת סידור שניה אם משנים את הראשונה
        this.sortState.secondary = { key: null, direction: null };
      }
    }

    // עדכון UI
    this.updateUI();

    // ביצוע סידור
    this.applySort(sortType);

    maskedLog('[PhoenixTableSortManager] Sort changed', {
      key: sortKey,
      direction: isSecondary ? this.sortState.secondary.direction : this.sortState.primary.direction,
      isSecondary,
      sortState: this.sortState
    });
  }

  /**
   * updateUI - עדכון UI (אייקונים, מצבים)
   * 
   * @description עדכון כל כותרות העמודות עם מצב הסידור הנוכחי
   */
  updateUI() {
    const headers = this.table.querySelectorAll('[data-sortable="true"], .js-table-sort-trigger');

    headers.forEach(header => {
      const sortKey = header.dataset.sortKey;
      const sortIcon = header.querySelector('.js-sort-icon, .phoenix-table__sort-icon');
      const sortIndicator = header.querySelector('.js-sort-indicator, .phoenix-table__sort-indicator');

      // בדיקה אם זו רמת סידור ראשונה או שניה
      let sortDirection = null;
      if (this.sortState.primary.key === sortKey) {
        sortDirection = this.sortState.primary.direction;
      } else if (this.sortState.secondary.key === sortKey) {
        sortDirection = this.sortState.secondary.direction;
      }

      // עדכון aria-sort
      if (sortDirection === 'ASC') {
        header.setAttribute('aria-sort', 'ascending');
      } else if (sortDirection === 'DESC') {
        header.setAttribute('aria-sort', 'descending');
      } else {
        header.setAttribute('aria-sort', 'none');
      }

      // עדכון אייקון סידור
      if (sortIcon) {
        if (sortDirection === 'ASC') {
          sortIcon.setAttribute('data-sort-state', 'asc');
          sortIcon.style.opacity = '1';
        } else if (sortDirection === 'DESC') {
          sortIcon.setAttribute('data-sort-state', 'desc');
          sortIcon.style.opacity = '1';
        } else {
          sortIcon.setAttribute('data-sort-state', 'none');
          sortIcon.style.opacity = '0.5';
        }
      }
    });
  }

  /**
   * applySort - ביצוע סידור על שורות הטבלה
   * 
   * @description סידור שורות הטבלה לפי מצב הסידור הנוכחי
   * @param {string} sortType - סוג הנתונים (string, numeric, date, boolean)
   */
  applySort(sortType = 'string') {
    const tbody = this.table.querySelector('tbody, .phoenix-table__body');
    if (!tbody) {
      console.warn('[PhoenixTableSortManager] Table body not found');
      return;
    }

    const rows = Array.from(tbody.querySelectorAll('tr, .phoenix-table__row'));

    // אם אין סידור פעיל, החזרת סדר מקורי
    if (!this.sortState.primary.key && !this.sortState.secondary.key) {
      // שחזור סדר מקורי (אם נשמר)
      if (this.originalRowOrder) {
        const fragment = document.createDocumentFragment();
        this.originalRowOrder.forEach(row => {
          fragment.appendChild(row);
        });
        tbody.appendChild(fragment);
      }
      return;
    }

    // שמירת סדר מקורי (רק בפעם הראשונה)
    if (!this.originalRowOrder) {
      this.originalRowOrder = rows.map(row => row.cloneNode(true));
    }

    // סידור שורות
    rows.sort((a, b) => {
      let comparison = 0;

      // סידור ראשוני
      if (this.sortState.primary.key) {
        comparison = this.compareRows(a, b, this.sortState.primary.key, this.sortState.primary.direction, sortType);
        if (comparison !== 0) {
          return comparison;
        }
      }

      // סידור משני (אם יש)
      if (this.sortState.secondary.key && comparison === 0) {
        comparison = this.compareRows(a, b, this.sortState.secondary.key, this.sortState.secondary.direction, sortType);
      }

      return comparison;
    });

    // עדכון DOM
    const fragment = document.createDocumentFragment();
    rows.forEach(row => {
      fragment.appendChild(row);
    });
    tbody.appendChild(fragment);
  }

  /**
   * compareRows - השוואה בין שתי שורות
   * 
   * @description השוואה בין שתי שורות לפי מפתח סידור
   * @param {HTMLElement} rowA - שורה ראשונה
   * @param {HTMLElement} rowB - שורה שניה
   * @param {string} sortKey - מפתח הסידור
   * @param {string} direction - כיוון הסידור (ASC/DESC)
   * @param {string} sortType - סוג הנתונים
   * @returns {number} -1, 0, או 1
   */
  compareRows(rowA, rowB, sortKey, direction, sortType) {
    const cellA = rowA.querySelector(`[data-field="${sortKey}"]`);
    const cellB = rowB.querySelector(`[data-field="${sortKey}"]`);

    if (!cellA || !cellB) {
      return 0;
    }

    let valueA = this.extractValue(cellA, sortType);
    let valueB = this.extractValue(cellB, sortType);

    let comparison = 0;

    // השוואה לפי סוג הנתונים
    if (sortType === 'numeric') {
      comparison = (valueA || 0) - (valueB || 0);
    } else if (sortType === 'date') {
      comparison = new Date(valueA || 0) - new Date(valueB || 0);
    } else if (sortType === 'boolean') {
      comparison = (valueA ? 1 : 0) - (valueB ? 1 : 0);
    } else {
      // string
      comparison = String(valueA || '').localeCompare(String(valueB || ''), 'he', { numeric: true });
    }

    // היפוך כיוון אם DESC
    if (direction === 'DESC') {
      comparison = -comparison;
    }

    return comparison;
  }

  /**
   * extractValue - חילוץ ערך מתא
   * 
   * @description חילוץ ערך מתא לפי סוג הנתונים
   * @param {HTMLElement} cell - אלמנט התא
   * @param {string} sortType - סוג הנתונים
   * @returns {any} - הערך המחולץ
   */
  extractValue(cell, sortType) {
    let text = cell.textContent.trim();

    if (sortType === 'numeric') {
      // הסרת תווים לא מספריים (כמו $, ₪, פסיקים)
      text = text.replace(/[^\d.-]/g, '');
      return parseFloat(text) || 0;
    } else if (sortType === 'date') {
      // פורמט תאריך: DD/MM/YY
      const parts = text.split('/');
      if (parts.length === 3) {
        let year = parts[2];
        if (year.length === 2) year = '20' + year;
        return new Date(`${year}-${parts[1]}-${parts[0]}`);
      }
      return new Date(text);
    } else if (sortType === 'boolean') {
      // בדיקה אם התא מכיל ערך "פעיל" (פעיל/לא פעיל) או SSOT "פתוח" (active) או "כן"
      return text.includes('פעיל') || text.includes('פתוח') || text.includes('כן') || text.includes('true');
    }

    // string - החזרת הטקסט כפי שהוא
    return text;
  }

  /**
   * clearSort - איפוס כל הסידור
   * 
   * @description איפוס כל מצב הסידור למצב התחלתי
   */
  clearSort() {
    this.sortState = {
      primary: { key: null, direction: null },
      secondary: { key: null, direction: null }
    };
    this.updateUI();
    this.applySort();
    maskedLog('[PhoenixTableSortManager] Sort cleared');
  }

  /**
   * getSortState - קבלת מצב הסידור הנוכחי
   * 
   * @description קבלת מצב הסידור הנוכחי (read-only)
   * @returns {Object} מצב הסידור הנוכחי
   */
  getSortState() {
    return JSON.parse(JSON.stringify(this.sortState));
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhoenixTableSortManager;
}

// Global export for use in HTML files
window.PhoenixTableSortManager = PhoenixTableSortManager;
