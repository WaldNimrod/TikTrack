/**
 * Tables.js - TikTrack Table Management System
 * ============================================
 *
 * REFACTORING HISTORY:
 * ===================
 *
 * This file was created during the main.js modular split (Phase 6 - August 24, 2025)
 * by combining table-sorting.js and table-grid.js into a single comprehensive module.
 *
 * ORIGINAL STATE:
 * - Table functions scattered across main.js (2153 lines)
 * - Duplicate sorting logic in multiple files
 * - Inconsistent table management across pages
 * - Difficult to maintain table-specific functionality
 *
 * REFACTORING BENEFITS:
 * - Centralized table management system
 * - Consistent sorting behavior across all tables
 * - Improved maintainability and debugging
 * - Clear separation of concerns
 *
 * SORTING FIXES (August 24, 2025):
 * ================================
 *
 * ISSUE: Multiple table files had incorrect function calls causing:
 * - RangeError: Maximum call stack size exceeded (infinite recursion)
 * - Sorting not working on various pages
 * - Inconsistent sorting behavior across tables
 *
 * FIXES APPLIED:
 * - Fixed trade_plans.js: Changed window.sortTable to window.sortTableData
 * - Fixed notes.js: Changed window.sortTable to window.sortTableData
 * - Fixed alerts.js: Changed window.sortTable to window.sortTableData
 * - Fixed tickers.js: Changed window.sortTable to window.sortTableData
 * - Fixed cash_flows.js: Changed window.sortTable to window.sortTableData
 * - Fixed executions.js: Changed window.sortTable to window.sortTableData
 * - Fixed accounts.js: Corrected window.sortTableData parameters
 *
 * CORRECT FUNCTION SIGNATURE:
 * window.sortTableData(columnIndex, data, tableType, updateFunction)
 *
 * CONTENTS:
 * =========
 *
 * 1. GLOBAL SORTING SYSTEM:
 *    - sortTableData() - Main sorting function for all tables
 *    - sortAnyTable() - Universal table sorter
 *    - sortTable() - Legacy compatibility wrapper
 *    - isDateValue() - Date validation helper
 *
 * 2. SORT STATE MANAGEMENT:
 *    - saveSortState() - Save current sort configuration
 *    - getSortState() - Retrieve saved sort state
 *    - restoreAnyTableSort() - Restore previous sort state
 *    - updateSortIcons() - Update UI sort indicators
 *
 * 3. GRID CORE FUNCTIONS:
 *    - getDefaultColumnDefs() - Default column definitions
 *    - External filter management
 *    - Grid initialization helpers
 *
 * 4. TABLE UTILITIES:
 *    - closeModal() - Modal management (table-related)
 *    - Column value extraction
 *    - Table type validation
 *
 * DEPENDENCIES:
 * ============
 * - table-mappings.js: Column mappings and value extraction
 * - translation-utils.js: Text translations
 * - ui-utils.js: UI interaction helpers
 *
 * USAGE:
 * ======
 *
 * Basic table sorting:
 * ```javascript
 * sortTableData(0, tableData, 'trades', updateTradesTable);
 * ```
 *
 * Restore previous sort:
 * ```javascript
 * restoreAnyTableSort('accounts', accountsData, updateAccountsTable);
 * ```
 *
 * Get default columns:
 * ```javascript
 * const columns = getDefaultColumnDefs();
 * ```
 *
 * @version 1.1
 * @lastUpdated August 24, 2025
 * @refactoringPhase 6 - Modular Architecture
 * @sortingFixes August 24, 2025 - Fixed infinite recursion in all table files
 */

// ===== GLOBAL SORTING SYSTEM =====

/**
 * פונקציה גלובלית למיון טבלאות
 * Global function for sorting tables
 *
 * @param {number} columnIndex - אינדקס העמודה למיון
 * @param {Array} data - נתוני הטבלה
 * @param {string} tableType - סוג הטבלה
 * @param {Function} updateFunction - פונקציה לעדכון הטבלה
 */
function sortTable(columnIndex, data, tableType, updateFunction) {
  // Call the global sortTableData function directly
  window.sortTableData(columnIndex, data, tableType, updateFunction);
}

/**
 * Global function for sorting tables
 *
 * This is the main sorting function used across all tables in the application.
 * It handles different data types (numbers, dates, strings) automatically
 * and maintains sort state for each table type.
 *
 * @param {number} columnIndex - Index of column to sort by
 * @param {Array} data - Data array to sort
 * @param {string} tableType - Type of table (trades, accounts, alerts, etc.)
 * @param {Function} updateFunction - Function to call with sorted data
 * @returns {Array} Sorted data array
 */
/**
 * Get column value for sorting
 *
 * @param {Object} item - Data item
 * @param {number} columnIndex - Column index
 * @param {string} tableType - Table type
 * @returns {*} Column value
 */
function getColumnValue(item, columnIndex, tableType) {
  // Default column mappings for different table types
  const columnMappings = {
    'alerts': [
      'id', 'title', 'status', 'related_type_id', 'condition', 'message', 'created_at', 'is_triggered',
    ],
    'trades': [
      'id', 'symbol', 'side', 'investment_type', 'status', 'account_name', 'created_at', 'amount',
    ],
    'accounts': [
      'id', 'name', 'currency_name', 'balance', 'status', 'created_at',
    ],
    'tickers': [
      'symbol', 'status', 'active_trades', 'current_price', 'change_percent', 'type', 'name', 'remarks', 'yahoo_updated_at',
    ],
    'trade_plans': [
      'id', 'symbol', 'side', 'investment_type', 'status', 'target_price', 'stop_loss', 'created_at',
    ],
    'executions': [
      'id', 'symbol', 'side', 'investment_type', 'status', 'account_name', 'created_at', 'amount',
    ],
    'cash_flows': [
      'id', 'type', 'amount', 'currency', 'account_name', 'description', 'created_at',
    ],
    'notes': [
      'id', 'title', 'content', 'type', 'status', 'created_at',
    ],
  };

  const mapping = columnMappings[tableType] || [];
  const fieldName = mapping[columnIndex];

  if (!fieldName) {
    return '';
  }

  // Handle nested properties
  if (fieldName.includes('.')) {
    const parts = fieldName.split('.');
    let value = item;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) {break;}
    }
    return value || '';
  }

  return item[fieldName] || '';
}

/**
 * Get custom sort value for specific table types and columns
 * Returns null if no custom logic applies
 *
 * @param {Object} a - First item
 * @param {Object} b - Second item
 * @param {number} columnIndex - Column index
 * @param {string} tableType - Table type
 * @param {*} aValue - First item value
 * @param {*} bValue - Second item value
 * @returns {number|null} Custom sort result or null
 */
function getCustomSortValue(a, b, columnIndex, tableType, aValue, bValue) {
  // Custom sorting for tickers table
  if (tableType === 'tickers') {
    // Status column (index 1) - פתוח > סגור > מבוטל
    if (columnIndex === 1) {
      const statusOrder = { 'open': 1, 'closed': 2, 'cancelled': 3 };
      const aOrder = statusOrder[aValue] || 999;
      const bOrder = statusOrder[bValue] || 999;
      return aOrder - bOrder;
    }

    // Active trades column (index 2) - יש טריידים (true) > אין טריידים (false)
    if (columnIndex === 2) {
      const aHasTrades = aValue === true || aValue === 1 || aValue === 'true' || aValue === '1';
      const bHasTrades = bValue === true || bValue === 1 || bValue === 'true' || bValue === '1';
      if (aHasTrades && !bHasTrades) return -1;
      if (!aHasTrades && bHasTrades) return 1;
      return 0;
    }

    // Change percent column (index 4) - ערכים חיוביים ראשון, אחר כך שליליים
    if (columnIndex === 4) {
      const aNum = parseFloat(aValue) || 0;
      const bNum = parseFloat(bValue) || 0;
      
      // אם אחד חיובי ואחד שלילי
      if (aNum > 0 && bNum < 0) return -1;
      if (aNum < 0 && bNum > 0) return 1;
      
      // אם שניהם באותו סימן, סדר לפי הערך
      return aNum - bNum;
    }
  }

  // Custom sorting for alerts table
  if (tableType === 'alerts') {
    // Condition column (index 1) - Hebrew alphabetical sorting
    if (columnIndex === 1) {
      // Use Hebrew locale for proper alphabetical sorting
      return aValue.localeCompare(bValue, 'he-IL');
    }
  }

  // Custom sorting for other table types can be added here
  // if (tableType === 'trades') { ... }
  // if (tableType === 'accounts') { ... }

  return null; // No custom logic applies
}

window.sortTableData = function (columnIndex, data, tableType, updateFunction) {
  // Global sortTableData called for table

  // Get current sort state
  const currentSortState = window.getSortState(tableType);

  // Determine new sort direction
  let newDirection = 'asc';
  if (currentSortState.columnIndex === columnIndex) {
    // If same column - toggle direction
    newDirection = currentSortState.direction === 'asc' ? 'desc' : 'asc';
  }

  // Save new sort state
  window.saveSortState(tableType, columnIndex, newDirection);

  // Sort the data with custom logic for specific table types
  const sortedData = [...data].sort((a, b) => {
    // Primary sort by current column
    let aValue = getColumnValue(a, columnIndex, tableType);
    let bValue = getColumnValue(b, columnIndex, tableType);

    // Custom sorting logic for specific table types and columns
    const customSortResult = getCustomSortValue(a, b, columnIndex, tableType, aValue, bValue);
    if (customSortResult !== null) {
      const primaryResult = newDirection === 'asc' ? customSortResult : -customSortResult;
      if (primaryResult !== 0) return primaryResult;
    } else {
      // Standard sorting logic
      // Convert to numbers if possible
      if (!isNaN(aValue) && !isNaN(bValue)) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      // Convert to dates if possible
      if (isDateValue(aValue) && isDateValue(bValue)) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Perform sort comparison
      if (aValue < bValue) {
        const primaryResult = newDirection === 'asc' ? -1 : 1;
        if (primaryResult !== 0) return primaryResult;
      }
      if (aValue > bValue) {
        const primaryResult = newDirection === 'asc' ? 1 : -1;
        if (primaryResult !== 0) return primaryResult;
      }
    }

    // Secondary sort by previous column if exists
    if (currentSortState.columnIndex !== null && currentSortState.columnIndex !== columnIndex) {
      const prevColumnIndex = currentSortState.columnIndex;
      const prevDirection = currentSortState.direction;
      
      let aPrevValue = getColumnValue(a, prevColumnIndex, tableType);
      let bPrevValue = getColumnValue(b, prevColumnIndex, tableType);

      // Custom sorting logic for previous column
      const prevCustomSortResult = getCustomSortValue(a, b, prevColumnIndex, tableType, aPrevValue, bPrevValue);
      if (prevCustomSortResult !== null) {
        return prevDirection === 'asc' ? prevCustomSortResult : -prevCustomSortResult;
      }

      // Standard sorting logic for previous column
      // Convert to numbers if possible
      if (!isNaN(aPrevValue) && !isNaN(bPrevValue)) {
        aPrevValue = parseFloat(aPrevValue);
        bPrevValue = parseFloat(bPrevValue);
      }

      // Convert to dates if possible
      if (isDateValue(aPrevValue) && isDateValue(bPrevValue)) {
        aPrevValue = new Date(aPrevValue);
        bPrevValue = new Date(bPrevValue);
      }

      // Perform secondary sort comparison
      if (aPrevValue < bPrevValue) {
        return prevDirection === 'asc' ? -1 : 1;
      }
      if (aPrevValue > bPrevValue) {
        return prevDirection === 'asc' ? 1 : -1;
      }
    }

    return 0;
  });

  // Update the table
  if (typeof updateFunction === 'function') {
    updateFunction(sortedData);
  }

  // Update sort icons
  updateSortIcons(tableType, columnIndex, newDirection);

  // Table sorted by column
  return sortedData;
};

/**
 * Check if value is a valid date
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a valid date
 */
function isDateValue(value) {
  if (!value) {return false;}
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Save sort state for a specific table type
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {string} direction - Sort direction (asc/desc)
 */
window.saveSortState = function (tableType, columnIndex, direction) {
  const sortState = {
    columnIndex,
    direction,
    timestamp: Date.now(),
  };
  localStorage.setItem(`sortState_${tableType}`, JSON.stringify(sortState));
  // Sort state saved for table
};

/**
 * Get saved sort state for a table type
 *
 * @param {string} tableType - Type of table
 * @returns {Object} Sort state object with columnIndex, direction, timestamp
 */
window.getSortState = function (tableType) {
  const savedState = localStorage.getItem(`sortState_${tableType}`);
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch {
      // Invalid sort state for ${tableType}
    }
  }

  // Return default state
  return {
    columnIndex: -1,
    direction: 'asc',
    timestamp: Date.now(),
  };
};

/**
 * Set sort state for a specific table type
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {string} direction - Sort direction (asc/desc)
 */
window.setSortState = function (tableType, columnIndex, direction) {
  window.saveSortState(tableType, columnIndex, direction);
};


/**
 * Universal table sorter - can sort any table with any data
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {Array} data - Data to sort
 * @param {Function} updateFunction - Function to update table
 * @returns {Array} Sorted data
 */
window.sortAnyTable = function (tableType, columnIndex, data, updateFunction) {
  return window.sortTableData(columnIndex, data, tableType, updateFunction);
};

/**
 * Legacy compatibility wrapper for table sorting
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {Array} dataArray - Data array
 * @param {Function} updateFunction - Update function
 * @returns {Array} Sorted data
 */
window.sortTable = function (tableType, columnIndex, dataArray, updateFunction) {
  return window.sortTableData(columnIndex, dataArray, tableType, updateFunction);
};

/**
 * Restore previous sort state for any table
 *
 * @param {string} tableType - Type of table
 * @param {Array} data - Data to sort
 * @param {Function} updateFunction - Function to update table
 */
window.restoreAnyTableSort = function (tableType, data, updateFunction) {
  const sortState = window.getSortState(tableType);
  if (sortState.columnIndex >= 0) {
    // Restoring sort state for table
    window.sortTableData(sortState.columnIndex, data, tableType, updateFunction);
  }
};

/**
 * Apply default sorting to table (first column, ascending)
 * Only applies if no sort state exists
 *
 * @param {string} tableType - Type of table
 * @param {Array} data - Data to sort
 * @param {Function} updateFunction - Function to update table
 */
window.applyDefaultSort = function (tableType, data, updateFunction) {
  const sortState = window.getSortState(tableType);
  if (!sortState || sortState.columnIndex === null || sortState.columnIndex === undefined) {
    // Apply default sort by first column (index 0)
    window.sortTableData(0, data, tableType, updateFunction);
  }
};

/**
 * Close modal - moved here as it's often table-related
 *
 * @param {string} modalId - ID of modal to close
 */
window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    } else {
      // Fallback: hide modal manually
      modal.classList.remove('show');
      modal.style.display = 'none';
    }

    // Remove backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }

    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
};

// ===== GRID CORE FUNCTIONS =====
/**
 * External filter presence flag
 * Used to track if external filters are active
 */
// const externalFilterPresent = false; // לא בשימוש כרגע

/**
 * Get default column definitions for tables
 *
 * @returns {Array} Array of default column definitions
 */
const getDefaultColumnDefs = () => [
  { field: 'id', headerName: 'ID', width: 80, sortable: true },
  { field: 'name', headerName: 'Name', width: 200, sortable: true },
  { field: 'status', headerName: 'Status', width: 120, sortable: true },
  { field: 'created_at', headerName: 'Created', width: 150, sortable: true },
  { field: 'updated_at', headerName: 'Updated', width: 150, sortable: true },
];

/**
 * Export default column definitions to global scope
 */
window.getDefaultColumnDefs = getDefaultColumnDefs;

// ייצוא המודול עצמו
window.tables = {
  sortTableData: window.sortTableData,
  getSortState: window.getSortState,
  setSortState: window.setSortState,
  updateSortIcons: window.updateSortIcons,
  sortAnyTable: window.sortAnyTable,
  sortTable: window.sortTable,
  restoreAnyTableSort: window.restoreAnyTableSort,
  applyDefaultSort: window.applyDefaultSort,
  getCustomSortValue: getCustomSortValue,
  closeModal: window.closeModal,
  getDefaultColumnDefs: window.getDefaultColumnDefs,
};

// ייצוא פונקציית sortTable גלובלית
window.sortTable = sortTable;

// ייצוא closeModalGlobal ככינוי ל-closeModal
window.closeModalGlobal = window.closeModal;

/**
 * Global function for loading table data
 * Generic implementation that can be used across all pages
 *
 * @param {string} tableType - Type of table to load
 * @param {Function} updateFunction - Function to call with loaded data
 * @returns {Promise<Array>} Loaded data
 */
window.loadTableData = async function(tableType, updateFunction) {
  try {
    console.log(`📊 Loading data for table type: ${tableType}`);
    
    // Show loading state if function exists
    if (typeof window.showLoadingState === 'function') {
      window.showLoadingState();
    }
    
    // Fetch data from server
    const response = await fetch(`/api/data/${tableType}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Loaded ${data.length} records for ${tableType}`);
    
    // Call update function if provided
    if (typeof updateFunction === 'function') {
      updateFunction(data);
    }
    
    // Hide loading state if function exists
    if (typeof window.hideLoadingState === 'function') {
      window.hideLoadingState();
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error loading table data for ${tableType}:`, error);
    
    // Show error notification if function exists
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שגיאה בטעינת נתוני ${tableType}: ${error.message}`);
    }
    
    // Hide loading state if function exists
    if (typeof window.hideLoadingState === 'function') {
      window.hideLoadingState();
    }
    
    throw error;
  }
};

/**
 * Global function for refreshing table data
 * Generic implementation that reloads current table data
 *
 * @param {string} tableType - Type of table to refresh
 * @param {Function} updateFunction - Function to call with refreshed data
 * @returns {Promise<Array>} Refreshed data
 */
window.refreshTable = async function(tableType, updateFunction) {
  try {
    console.log(`🔄 Refreshing table: ${tableType}`);
    
    // Clear any cached data for this table type
    if (window.tableData && window.tableData[tableType]) {
      delete window.tableData[tableType];
    }
    
    // Reload data
    const data = await window.loadTableData(tableType, updateFunction);
    
    // Show success notification if function exists
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', `טבלת ${tableType} רועננה בהצלחה`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error refreshing table ${tableType}:`, error);
    
    // Show error notification if function exists
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שגיאה ברענון טבלת ${tableType}: ${error.message}`);
    }
    
    throw error;
  }
};

// Tables.js loaded successfully
