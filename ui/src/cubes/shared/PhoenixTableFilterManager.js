/**
 * PhoenixTableFilterManager - Class לניהול פילטרים של טבלאות
 * ----------------------------------------------------------------
 * Class לניהול פילטרים מקומיים של טבלה עם אינטגרציה לפילטרים גלובליים.
 * 
 * @description Class לניהול פילטרים מקומיים של טבלה עם שילוב פילטרים גלובליים
 * @standard JS Standards Protocol ✅ | Clean Slate Rule ✅ | Accessibility ✅
 * @legacyReference Legacy.tables.filtering
 * 
 * @example
 * const filterManager = new PhoenixTableFilterManager(tableElement);
 * // שילוב פילטרים גלובליים + מקומיים
 * // עדכון בזמן אמת
 * // שמירת מצב (URL/LocalStorage)
 */

// Loaded as classic script - use window.maskedLog if available, else safe console fallback (audit.maskedLog per JS Standards)
const _log = (typeof window !== 'undefined' && window.maskedLog) || ((msg, data) => {
  if (data && typeof data === 'object' && Object.keys(data).length > 0) console.log(msg, data);
  else console.log(msg);
});

class PhoenixTableFilterManager {
  /**
   * @param {HTMLTableElement} tableElement - אלמנט הטבלה
   */
  constructor(tableElement) {
    this.table = tableElement;
    this.filters = {
      global: {}, // פילטרים גלובליים (מ-header-filters)
      local: {}   // פילטרים מקומיים (מ-phoenix-table-filters)
    };
    this.init();
  }

  /**
   * init - אתחול המנהל
   * 
   * @description חיבור event listeners לפילטרים גלובליים ומקומיים
   */
  init() {
    if (!this.table) {
      console.warn('[PhoenixTableFilterManager] Table element not found');
      return;
    }

    // האזנה לשינויים בפילטרים גלובליים (מ-header-filters)
    this.initGlobalFilters();

    // האזנה לשינויים בפילטרים מקומיים (מ-phoenix-table-filters)
    this.initLocalFilters();

    // טעינת מצב פילטרים מ-LocalStorage או URL
    this.loadFilterState();

    _log(`[PhoenixTableFilterManager] Initialized for table: ${this.table.id || 'unnamed'}`);
  }

  /**
   * initGlobalFilters - אתחול פילטרים גלובליים
   * 
   * @description האזנה לשינויים בפילטרים גלובליים (מ-header-filters)
   */
  initGlobalFilters() {
    // האזנה לאירועים מ-header-filters (אם קיים)
    if (window.headerSystem && window.headerSystem.filterManager) {
      // אם יש מערכת פילטרים גלובלית, האזן לשינויים
      document.addEventListener('phoenix-global-filter-change', (e) => {
        this.filters.global = e.detail || {};
        this.applyFilters();
      });
    } else {
      // אלטרנטיבה: האזנה ישירה ל-inputs של header-filters
      const globalFilterInputs = document.querySelectorAll('.header-filters input, .header-filters select');
      globalFilterInputs.forEach(input => {
        input.addEventListener('change', () => {
          this.updateGlobalFilter(input);
          this.applyFilters();
        });
      });
    }
  }

  /**
   * initLocalFilters - אתחול פילטרים מקומיים
   * 
   * @description האזנה לשינויים בפילטרים מקומיים (מ-phoenix-table-filters)
   */
  initLocalFilters() {
    const localFilters = this.table.querySelectorAll('.phoenix-table-filters input, .phoenix-table-filters select');
    
    localFilters.forEach(filter => {
      filter.addEventListener('change', () => {
        this.updateLocalFilter(filter);
        this.applyFilters();
      });

      // תמיכה ב-input events עבור שדות טקסט
      if (filter.type === 'text' || filter.type === 'search') {
        filter.addEventListener('input', () => {
          this.updateLocalFilter(filter);
          this.applyFilters();
        });
      }
    });
  }

  /**
   * updateGlobalFilter - עדכון פילטר גלובלי
   * 
   * @description עדכון פילטר גלובלי לפי input
   * @param {HTMLElement} input - אלמנט input/select של הפילטר הגלובלי
   */
  updateGlobalFilter(input) {
    const filterKey = input.dataset.filterType || input.id || input.name;
    const filterValue = input.value || input.checked || null;

    if (filterValue && filterValue !== 'הכול' && filterValue !== 'כל') {
      this.filters.global[filterKey] = filterValue;
    } else {
      delete this.filters.global[filterKey];
    }

    _log('[PhoenixTableFilterManager] Global filter updated', {
      key: filterKey,
      value: filterValue,
      globalFilters: this.filters.global
    });
  }

  /**
   * updateLocalFilter - עדכון פילטר מקומי
   * 
   * @description עדכון פילטר מקומי של הטבלה
   * @param {HTMLElement} filter - אלמנט input/select של הפילטר המקומי
   */
  updateLocalFilter(filter) {
    const filterKey = filter.dataset.filterKey || filter.id || filter.name;
    const filterValue = filter.value || filter.checked || null;

    if (filterValue && filterValue !== '') {
      this.filters.local[filterKey] = filterValue;
    } else {
      delete this.filters.local[filterKey];
    }

    // שמירת מצב פילטרים
    this.saveFilterState();

    _log('[PhoenixTableFilterManager] Local filter updated', {
      key: filterKey,
      value: filterValue,
      localFilters: this.filters.local
    });
  }

  /**
   * applyFilters - שילוב פילטרים גלובליים ומקומיים
   * 
   * @description שילוב פילטרים גלובליים ומקומיים וסינון שורות הטבלה
   * @param {Object} additionalFilters - פילטרים נוספים (אופציונלי)
   */
  applyFilters(additionalFilters = {}) {
    const combinedFilters = {
      ...this.filters.global,
      ...this.filters.local,
      ...additionalFilters
    };

    const tbody = this.table.querySelector('tbody, .phoenix-table__body');
    if (!tbody) {
      console.warn('[PhoenixTableFilterManager] Table body not found');
      return;
    }

    const rows = tbody.querySelectorAll('tr, .phoenix-table__row');
    let visibleCount = 0;

    rows.forEach(row => {
      let shouldShow = true;

      // בדיקת כל הפילטרים המשולבים
      for (const [filterKey, filterValue] of Object.entries(combinedFilters)) {
        if (!this.matchesFilter(row, filterKey, filterValue)) {
          shouldShow = false;
          break;
        }
      }

      // הצגה/הסתרה של השורה
      if (shouldShow) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    // עדכון מידע pagination (אם קיים)
    this.updatePaginationInfo(visibleCount, rows.length);

    _log('[PhoenixTableFilterManager] Filters applied', {
      globalFilters: this.filters.global,
      localFilters: this.filters.local,
      additionalFilters,
      combinedFilters,
      visibleRows: visibleCount,
      totalRows: rows.length
    });
  }

  /**
   * matchesFilter - בדיקה אם שורה תואמת לפילטר
   * 
   * @description בדיקה אם שורה תואמת לפילטר מסוים
   * @param {HTMLElement} row - אלמנט השורה
   * @param {string} filterKey - מפתח הפילטר
   * @param {any} filterValue - ערך הפילטר
   * @returns {boolean} - האם השורה תואמת
   */
  matchesFilter(row, filterKey, filterValue) {
    // חיפוש טקסט (search)
    if (filterKey === 'search' && filterValue) {
      const rowText = row.textContent.toLowerCase();
      return rowText.includes(filterValue.toLowerCase());
    }

    // פילטר לפי שדה ספציפי
    const cell = row.querySelector(`[data-field="${filterKey}"]`);
    if (cell) {
      const cellText = cell.textContent.trim();
      
      // בדיקה מדויקת
      if (cellText === filterValue) {
        return true;
      }

      // בדיקה חלקית (למקרה של חיפוש)
      if (cellText.toLowerCase().includes(String(filterValue).toLowerCase())) {
        return true;
      }
    }

    // פילטר לפי תאריך (date range)
    if (filterKey === 'dateFrom' || filterKey === 'dateTo') {
      const dateCell = row.querySelector('[data-field="date"], [data-field="updated"]');
      if (dateCell) {
        const cellDate = this.parseDate(dateCell.textContent.trim());
        const filterDate = new Date(filterValue);
        
        if (filterKey === 'dateFrom' && cellDate < filterDate) {
          return false;
        }
        if (filterKey === 'dateTo' && cellDate > filterDate) {
          return false;
        }
      }
    }

    // אם אין התאמה, השורה תוצג (אלא אם הפילטר מחייב התאמה)
    return true;
  }

  /**
   * parseDate - פרסור תאריך מפורמט DD/MM/YYYY
   * 
   * @description המרת תאריך מפורמט DD/MM/YYYY ל-Date object
   * @param {string} dateString - מחרוזת תאריך בפורמט DD/MM/YYYY
   * @returns {Date} - אובייקט תאריך
   */
  parseDate(dateString) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date(dateString);
  }

  /**
   * updatePaginationInfo - עדכון מידע pagination
   * 
   * @description עדכון מידע pagination עם מספר השורות הנראות
   * @param {number} visibleCount - מספר שורות נראות
   * @param {number} totalCount - מספר שורות כולל
   */
  updatePaginationInfo(visibleCount, totalCount) {
    const paginationInfo = this.table.closest('.phoenix-table-wrapper')?.nextElementSibling?.querySelector('.phoenix-table-pagination__info');
    if (paginationInfo) {
      const infoText = paginationInfo.querySelector('span');
      if (infoText) {
        infoText.textContent = `מציג 1-${visibleCount} מתוך ${totalCount} רשומות`;
      }
    }
  }

  /**
   * saveFilterState - שמירת מצב פילטרים
   * 
   * @description שמירת מצב פילטרים ב-LocalStorage או URL
   */
  saveFilterState() {
    const tableId = this.table.id || 'default';
    const storageKey = `phoenix-table-filters-${tableId}`;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.filters.local));
    } catch (e) {
      console.warn('[PhoenixTableFilterManager] Failed to save filter state', e);
    }

    // עדכון URL (אופציונלי)
    if (window.history && window.history.replaceState) {
      const url = new URL(window.location);
      Object.entries(this.filters.local).forEach(([key, value]) => {
        url.searchParams.set(`filter_${key}`, value);
      });
      window.history.replaceState({}, '', url);
    }
  }

  /**
   * loadFilterState - טעינת מצב פילטרים
   * 
   * @description טעינת מצב פילטרים מ-LocalStorage או URL
   */
  loadFilterState() {
    const tableId = this.table.id || 'default';
    const storageKey = `phoenix-table-filters-${tableId}`;

    // טעינה מ-LocalStorage
    try {
      const savedFilters = localStorage.getItem(storageKey);
      if (savedFilters) {
        this.filters.local = JSON.parse(savedFilters);
      }
    } catch (e) {
      console.warn('[PhoenixTableFilterManager] Failed to load filter state', e);
    }

    // טעינה מ-URL (אופציונלי)
    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.forEach((value, key) => {
        if (key.startsWith('filter_')) {
          const filterKey = key.replace('filter_', '');
          this.filters.local[filterKey] = value;
        }
      });
    }

    // יישום פילטרים שנטענו
    if (Object.keys(this.filters.local).length > 0) {
      this.applyFilters();
    }
  }

  /**
   * clearFilters - איפוס כל הפילטרים המקומיים
   * 
   * @description איפוס כל הפילטרים המקומיים של הטבלה (לא נוגע בפילטרים גלובליים)
   */
  clearFilters() {
    this.filters.local = {};
    
    // איפוס שדות פילטרים מקומיים
    const localFilters = this.table.querySelectorAll('.phoenix-table-filters input, .phoenix-table-filters select');
    localFilters.forEach(filter => {
      if (filter.type === 'checkbox' || filter.type === 'radio') {
        filter.checked = false;
      } else {
        filter.value = '';
      }
    });

    // שמירת מצב
    this.saveFilterState();

    // יישום פילטרים (רק גלובליים)
    this.applyFilters();

    _log('[PhoenixTableFilterManager] Local filters cleared');
  }

  /**
   * getCombinedFilters - קבלת פילטרים משולבים
   * 
   * @description קבלת פילטרים משולבים (גלובלי + מקומי)
   * @returns {Object} פילטרים משולבים
   */
  getCombinedFilters() {
    return {
      ...this.filters.global,
      ...this.filters.local
    };
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhoenixTableFilterManager;
}

// Global export for use in HTML files
window.PhoenixTableFilterManager = PhoenixTableFilterManager;
