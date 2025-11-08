/**
 * Unified Table Management System - TikTrack
 * ==========================================
 * 
 * מערכת טבלאות מרכזית מאוחדת שתאחד את כל המנגנונים הקשורים לטבלאות:
 * - סידור (Sorting)
 * - מיפוי (Column Mapping)
 * - סינון (Filtering)
 * - רינדור (Rendering)
 * - רוחב עמודות (Column Widths)
 * - סגנונות (Styling)
 * - Event Handlers
 * - ניהול מצב (State Management)
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/TABLE_SYSTEM_ANALYSIS.md
 * - documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_TABLE_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-01-27
 */

// ===== TABLE REGISTRY =====

/**
 * TableRegistry - רישום מרכזי של כל הטבלאות
 * 
 * כל טבלה נרשמת פעם אחת עם קונפיגורציה מלאה:
 * - dataGetter - פונקציה לקבלת נתונים
 * - updateFunction - פונקציה לעדכון טבלה
 * - tableSelector - selector של הטבלה
 * - columns - הגדרות עמודות
 * - styles - הגדרות סגנונות
 * - filters - הגדרות סינונים
 */
class TableRegistry {
  constructor() {
    this._tables = new Map();
  }

  /**
   * רישום טבלה במערכת
   * @param {string} tableType - סוג הטבלה (data-table-type)
   * @param {Object} config - קונפיגורציה
   * @param {Function} config.dataGetter - פונקציה לקבלת נתונים () => Array
   * @param {Function} config.updateFunction - פונקציה לעדכון טבלה (data) => void
   * @param {string} config.tableSelector - selector של הטבלה (#tableId)
   * @param {Array} config.columns - הגדרות עמודות (מ-table-mappings.js)
   * @param {Object} config.styles - הגדרות סגנונות (אם רלוונטי)
   * @param {Object} config.filters - הגדרות סינונים (אם רלוונטי)
   * @param {boolean} config.sortable - האם ניתן לסדר (default: true)
   * @param {boolean} config.filterable - האם ניתן לסנן (default: true)
   */
  register(tableType, config) {
    if (!tableType || typeof tableType !== 'string') {
      throw new Error('TableRegistry.register: tableType must be a non-empty string');
    }

    if (!config || typeof config !== 'object') {
      throw new Error('TableRegistry.register: config must be an object');
    }

    if (typeof config.dataGetter !== 'function') {
      throw new Error('TableRegistry.register: config.dataGetter must be a function');
    }

    if (typeof config.updateFunction !== 'function') {
      throw new Error('TableRegistry.register: config.updateFunction must be a function');
    }

    if (!config.tableSelector || typeof config.tableSelector !== 'string') {
      throw new Error('TableRegistry.register: config.tableSelector must be a non-empty string');
    }

    this._tables.set(tableType, {
      dataGetter: config.dataGetter,
      updateFunction: config.updateFunction,
      tableSelector: config.tableSelector,
      columns: config.columns || [],
      styles: config.styles || {},
      filters: config.filters || {},
      sortable: config.sortable !== false,
      filterable: config.filterable !== false,
      ...config
    });
  }

  /**
   * קבלת קונפיגורציה של טבלה
   * @param {string} tableType - סוג הטבלה
   * @returns {Object|null} קונפיגורציה או null אם לא נמצאה
   */
  getConfig(tableType) {
    if (!tableType || typeof tableType !== 'string') {
      return null;
    }
    return this._tables.get(tableType) || null;
  }

  /**
   * בדיקה אם טבלה רשומה
   * @param {string} tableType - סוג הטבלה
   * @returns {boolean}
   */
  isRegistered(tableType) {
    return this._tables.has(tableType);
  }

  /**
   * קבלת רשימת כל הטבלאות הרשומות
   * @returns {Array<string>} רשימת סוגי טבלאות
   */
  getAllTables() {
    return Array.from(this._tables.keys());
  }

  /**
   * ביטול רישום טבלה
   * @param {string} tableType - סוג הטבלה
   */
  unregister(tableType) {
    this._tables.delete(tableType);
  }

  /**
   * ניקוי כל הרישומים
   */
  clear() {
    this._tables.clear();
  }
}

// ===== TABLE SORTER =====

/**
 * TableSorter - סידור מרכזי של טבלאות
 * 
 * משתמש ב-TableRegistry לקבלת קונפיגורציה ומנתוני טבלאות
 * מחליף את window.sortTable הישן
 */
class TableSorter {
  constructor(registry) {
    this.registry = registry;
    // Global recursion guard - prevents ANY sort while a sort is in progress
    this._globalSortingFlag = false;
  }

  /**
   * סידור טבלה לפי עמודה
   * @param {string} tableType - סוג הטבלה
   * @param {number} columnIndex - אינדקס העמודה
   * @returns {Array|null} נתונים מסודרים או null אם שגיאה
   */
  sort(tableType, columnIndex) {
    // CRITICAL: Prevent infinite recursion - check BOTH instance flag AND global flag
    // This prevents ANY sort from happening while a sort is in progress
    if (this._globalSortingFlag || window._sortTableDataInProgress) {
      console.warn(`[TableSorter.sort] Recursion guard: Sort already in progress, rejecting call for ${tableType} column ${columnIndex}`);
      console.trace('[TableSorter.sort] Stack trace for rejected call');
      return null;
    }
    
    console.log(`[TableSorter.sort] Starting sort: tableType=${tableType}, columnIndex=${columnIndex}, flag=${this._globalSortingFlag}, globalFlag=${window._sortTableDataInProgress}`);
    
    // Set instance flag to prevent recursion from this source
    this._globalSortingFlag = true;

    const release = () => {
      console.log(`[TableSorter.sort] Completed sort: tableType=${tableType}, columnIndex=${columnIndex}`);
      this._globalSortingFlag = false;
    };

    try {
      // CRITICAL: Always log to console to trace calls
      console.log('🔍 [TableSorter.sort] FUNCTION CALLED', { 
        tableType, 
        columnIndex,
        isRegistered: this.registry.isRegistered(tableType),
        stackTrace: new Error().stack.split('\n').slice(0, 3).join('\n')
      });
      const config = this.registry.getConfig(tableType);
      if (!config) {
        console.warn(`[TableSorter.sort] Table type "${tableType}" not registered`);
        // Log only if Logger is available, otherwise silent
        if (window.Logger) {
          window.Logger.warn(`TableSorter.sort: Table type "${tableType}" not registered`, { page: "unified-table-system" });
        }
        release();
        return null;
      }

      // קבלת נתונים
      const data = config.dataGetter();
      if (!Array.isArray(data)) {
        if (window.Logger) {
          window.Logger.warn(`TableSorter.sort: dataGetter for "${tableType}" did not return an array`, { page: "unified-table-system" });
        }
        release();
        return null;
      }

      if (data.length === 0) {
        release();
        return [];
      }

      // שימוש ב-sortTableData הקיים
      // CRITICAL: Temporarily disable event handlers during sort to prevent recursion
      const originalUpdateFunction = config.updateFunction;
      const safeUpdateFunction = (sortedData) => {
        if (window._updateFunctionInProgress) {
          console.warn(`[TableSorter.sort] updateFunction already in progress for ${tableType}, skipping`);
          console.trace('[TableSorter.sort] Stack trace for updateFunction recursion');
          return;
        }

        window._updateFunctionInProgress = true;

        const table = document.querySelector(config.tableSelector);
        const sortableHeaders = table ? Array.from(table.querySelectorAll('.sortable-header')) : [];
        sortableHeaders.forEach(header => {
          header.style.pointerEvents = 'none';
        });

        const release = () => {
          setTimeout(() => {
            sortableHeaders.forEach(header => {
              header.style.pointerEvents = '';
            });
            window._updateFunctionInProgress = false;
          }, 150);
        };

        try {
          console.log(`[TableSorter.sort] Calling updateFunction for ${tableType} with ${sortedData?.length || 0} items`);
          const result = originalUpdateFunction(sortedData);

          if (result && typeof result.then === 'function') {
            return result.finally(release);
          }

          release();
          return result;
        } catch (error) {
          console.error(`[TableSorter.sort] Error in updateFunction for ${tableType}:`, error);
          release();
          throw error;
        }
      };
      
      if (typeof window.sortTableData === 'function') {
        const sortResult = window.sortTableData(columnIndex, data, tableType, safeUpdateFunction);
        if (sortResult && typeof sortResult.then === 'function') {
          return sortResult.then(result => {
            release();
            return result;
          }).catch(error => {
            release();
            throw error;
          });
        }
        release();
        return sortResult;
      } else {
        if (window.Logger) {
          window.Logger.error('TableSorter.sort: window.sortTableData not available', { page: "unified-table-system" });
        }
        window._updateFunctionInProgress = false;
        release();
        return null;
      }
    } catch (error) {
      release();
      throw error;
    }
  }

  /**
   * קבלת מצב סידור של טבלה
   * @param {string} tableType - סוג הטבלה
   * @returns {Object} מצב סידור
   */
  getSortState(tableType) {
    if (typeof window.getSortState === 'function') {
      return window.getSortState(tableType);
    }
    return { columnIndex: -1, direction: 'asc', timestamp: Date.now() };
  }

  /**
   * שמירת מצב סידור
   * @param {string} tableType - סוג הטבלה
   * @param {number} columnIndex - אינדקס העמודה
   * @param {string} direction - כיוון סידור ('asc' | 'desc')
   */
  saveSortState(tableType, columnIndex, direction) {
    if (typeof window.saveSortState === 'function') {
      window.saveSortState(tableType, columnIndex, direction);
    }
  }
}

// ===== TABLE RENDERER =====

/**
 * TableRenderer - רינדור אחיד של טבלאות
 * 
 * אחראי על רינדור טבלאות בצורה אחידה
 * אינטגרציה עם FieldRendererService
 */
class TableRenderer {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * רינדור טבלה
   * @param {string} tableType - סוג הטבלה
   * @param {Array} data - נתונים לרינדור
   * @param {Object} options - אפשרויות נוספות
   */
  render(tableType, data, options = {}) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      console.warn(`TableRenderer.render: Table type "${tableType}" not registered`);
      return;
    }

    // שימוש ב-updateFunction מהקונפיגורציה
    if (typeof config.updateFunction === 'function') {
      config.updateFunction(data, options);
    } else {
      console.error(`TableRenderer.render: updateFunction not available for "${tableType}"`);
    }
  }

  /**
   * עדכון טבלה
   * @param {string} tableType - סוג הטבלה
   * @param {Array} data - נתונים לעדכון
   */
  update(tableType, data) {
    this.render(tableType, data);
  }
}

// ===== TABLE FILTER =====

/**
 * TableFilter - סינון מרכזי של טבלאות
 * 
 * איחוד עם window.filterSystem הקיים
 */
class TableFilter {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * החלת סינון על טבלה
   * @param {string} tableType - סוג הטבלה
   * @param {string} filterType - סוג סינון (status, type, account, date, search)
   * @param {*} value - ערך הסינון
   */
  apply(tableType, filterType, value) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      console.warn(`TableFilter.apply: Table type "${tableType}" not registered`);
      return;
    }

    // שימוש ב-filterSystem הקיים
    if (window.filterSystem && typeof window.filterSystem.applyFilter === 'function') {
      window.filterSystem.applyFilter(filterType, value);
    } else {
      console.warn('TableFilter.apply: window.filterSystem not available');
    }
  }

  /**
   * ביטול כל הסינונים של טבלה
   * @param {string} tableType - סוג הטבלה
   */
  clear(tableType) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      return;
    }

    // ביטול סינונים דרך filterSystem
    if (window.filterSystem && typeof window.filterSystem.clearFilters === 'function') {
      window.filterSystem.clearFilters();
    }
  }
}

// ===== TABLE STATE MANAGER =====

/**
 * TableStateManager - ניהול מצב מרכזי של טבלאות
 * 
 * אינטגרציה עם UnifiedCacheManager
 */
class TableStateManager {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * שמירת מצב טבלה
   * @param {string} tableType - סוג הטבלה
   * @param {Object} state - מצב לשמירה
   */
  save(tableType, state) {
    if (!tableType || typeof tableType !== 'string') {
      return;
    }

    // שמירה ב-localStorage
    try {
      localStorage.setItem(`tableState_${tableType}`, JSON.stringify(state));
    } catch (e) {
      console.error(`TableStateManager.save: Failed to save state for "${tableType}"`, e);
    }

    // שמירה ב-UnifiedCacheManager אם זמין
    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.set === 'function') {
      window.UnifiedCacheManager.set(`tableState_${tableType}`, state, { dependencies: ['tables'] })
        .catch(err => {
          console.error(`TableStateManager.save: Cache save failed for "${tableType}"`, err);
        });
    }
  }

  /**
   * טעינת מצב טבלה
   * @param {string} tableType - סוג הטבלה
   * @returns {Object|null} מצב או null אם לא נמצא
   */
  load(tableType) {
    if (!tableType || typeof tableType !== 'string') {
      return null;
    }

    // טעינה מ-localStorage
    try {
      const saved = localStorage.getItem(`tableState_${tableType}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`TableStateManager.load: Failed to load state for "${tableType}"`, e);
    }

    // טעינה מ-UnifiedCacheManager אם זמין
    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.get === 'function') {
      return window.UnifiedCacheManager.get(`tableState_${tableType}`, { dependencies: ['tables'] })
        .catch(err => {
          console.error(`TableStateManager.load: Cache load failed for "${tableType}"`, err);
          return null;
        });
    }

    return null;
  }
}

// ===== TABLE STYLE MANAGER =====

/**
 * TableStyleManager - ניהול סגנונות מרכזי של טבלאות
 * 
 * ניהול רוחב עמודות דינמי
 * אינטגרציה עם CSS variables
 */
class TableStyleManager {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * קבלת רוחב עמודות של טבלה
   * @param {string} tableType - סוג הטבלה
   * @returns {Object} מיפוי עמודה -> רוחב
   */
  getColumnWidths(tableType) {
    const config = this.registry.getConfig(tableType);
    if (!config || !config.styles || !config.styles.columnWidths) {
      return {};
    }
    return config.styles.columnWidths;
  }

  /**
   * החלת סגנונות על טבלה
   * @param {string} tableType - סוג הטבלה
   */
  applyStyles(tableType) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      return;
    }

    const table = document.querySelector(config.tableSelector);
    if (!table) {
      return;
    }

    // החלת CSS variables אם מוגדרים
    if (config.styles && config.styles.cssVariables) {
      Object.entries(config.styles.cssVariables).forEach(([key, value]) => {
        table.style.setProperty(key, value);
      });
    }
  }
}

// ===== TABLE EVENT HANDLER =====

/**
 * TableEventHandler - טיפול באירועים מרכזי של טבלאות
 * 
 * מחליף את event-handler-manager לטבלאות
 */
class TableEventHandler {
  constructor(registry, sorter) {
    this.registry = registry;
    this.sorter = sorter;
  }

  /**
   * הגדרת event handlers לסידור
   * @param {string} tableType - סוג הטבלה
   */
  setupSortHandlers(tableType) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      return;
    }

    const table = document.querySelector(config.tableSelector);
    if (!table) {
      return;
    }

    // חיפוש כל ה-sortable headers
    const sortableHeaders = table.querySelectorAll('.sortable-header');
    sortableHeaders.forEach((header, index) => {
      // הסרת onclick handlers קיימים
      header.removeAttribute('onclick');
      
      // הוספת event listener חדש
      header.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // סידור לפי עמודה
        if (this.sorter) {
          this.sorter.sort(tableType, index);
        }
      });
    });
  }

  /**
   * הגדרת event handlers לסינון
   * @param {string} tableType - סוג הטבלה
   */
  setupFilterHandlers(tableType) {
    // TODO: מימוש בהמשך
  }
}

// ===== UNIFIED TABLE SYSTEM =====

/**
 * UnifiedTableSystem - מערכת טבלאות מרכזית מאוחדת
 * 
 * מאחדת את כל המנגנונים:
 * - TableRegistry - רישום טבלאות
 * - TableRenderer - רינדור
 * - TableSorter - סידור
 * - TableFilter - סינון
 * - TableStateManager - ניהול מצב
 * - TableStyleManager - ניהול סגנונות
 * - TableEventHandler - טיפול באירועים
 */
window.UnifiedTableSystem = (function() {
  const registry = new TableRegistry();
  const renderer = new TableRenderer(registry);
  const sorter = new TableSorter(registry);
  const filter = new TableFilter(registry);
  const stateManager = new TableStateManager(registry);
  const styleManager = new TableStyleManager(registry);
  const eventHandler = new TableEventHandler(registry, sorter);

  return {
    registry,
    renderer,
    sorter,
    filter,
    state: stateManager,
    styles: styleManager,
    events: eventHandler
  };
})();

// ===== EXPORT FOR GLOBAL USE =====

// Note: window.sortTable is defined in tables.js
// The actual implementation in tables.js checks the registry first

// Export render
window.renderTable = function(tableType, data, options) {
  if (!window.UnifiedTableSystem) {
    console.warn('renderTable: UnifiedTableSystem not available');
    return;
  }
  return window.UnifiedTableSystem.renderer.render(tableType, data, options);
};

// Export update
window.updateTable = function(tableType, data) {
  if (!window.UnifiedTableSystem) {
    console.warn('updateTable: UnifiedTableSystem not available');
    return;
  }
  return window.UnifiedTableSystem.renderer.update(tableType, data);
};

// Export filter
window.filterTable = function(tableType, filterType, value) {
  if (!window.UnifiedTableSystem) {
    console.warn('filterTable: UnifiedTableSystem not available');
    return;
  }
  return window.UnifiedTableSystem.filter.apply(tableType, filterType, value);
};

// System ready
if (window.Logger) {
  window.Logger.info('✅ UnifiedTableSystem loaded', { page: "unified-table-system" });
} else {
  console.log('✅ UnifiedTableSystem loaded');
}

