/**
 * Tables - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the centralized table management system with sorting, caching,
 * state management, and performance optimization for all TikTrack tables.
 * 
 * Related Documentation:
 * - documentation/03-API_REFERENCE/table-system.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

// ===== LOADING TRACKING =====
console.log('🟢 [tables.js] FILE LOADING STARTED');
console.log('🟢 [tables.js] window.TABLE_COLUMN_MAPPINGS exists:', !!window.TABLE_COLUMN_MAPPINGS);
console.log('🟢 [tables.js] window.getColumnValue exists:', typeof window.getColumnValue === 'function');

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
 * @param {string} tableType - Type of table (trades, trading_accounts, alerts, etc.)
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
  // Special handling for linked_items table
  if (tableType === 'linked_items') {
    switch (columnIndex) {
      case 0: // linked_to - combine type label and name for sorting
        const typeLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel)
          ? window.LinkedItemsService.getEntityLabel(item.type) || item.type || ''
          : item.type || '';
        const formattedName = (window.LinkedItemsService && window.LinkedItemsService.formatLinkedItemName)
          ? window.LinkedItemsService.formatLinkedItemName(item) || ''
          : item.description || item.title || '';
        // Sort by type first, then by name
        return `${typeLabel} ${formattedName}`;
      case 1: // status
        return item.status || '';
      case 2: // created_at
        return item.created_at || item.updated_at || '';
      default:
        return '';
    }
  }
  
  // CRITICAL: Use getColumnValue from table-mappings.js FIRST
  // This is the authoritative source with proper handling of calculated fields
  // Check for direct export first (window.getColumnValue), then object export (window.tableMappings.getColumnValue)
  if (typeof window.getColumnValue === 'function') {
    return window.getColumnValue(item, columnIndex, tableType);
  }
  
  if (window.tableMappings && typeof window.tableMappings.getColumnValue === 'function') {
    return window.tableMappings.getColumnValue(item, columnIndex, tableType);
  }
  
  // Fallback: Try to use TABLE_COLUMN_MAPPINGS directly (basic mapping only)
  // This should rarely execute as table-mappings.js should be loaded first
  if (window.TABLE_COLUMN_MAPPINGS && window.TABLE_COLUMN_MAPPINGS[tableType]) {
    const mapping = window.TABLE_COLUMN_MAPPINGS[tableType];
    const fieldName = mapping[columnIndex];
    if (fieldName) {
      // Handle nested properties
      if (fieldName.includes('.')) {
        const parts = fieldName.split('.');
        let value = item;
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined) break;
        }
        return value || '';
      }
      return item[fieldName] || '';
    }
  }
  
  // Fallback: If table-mappings.js is not loaded, use basic mapping
  // This should rarely happen as table-mappings.js should be loaded before tables.js
  console.warn(`⚠️ table-mappings.js getColumnValue not available, using fallback for ${tableType} column ${columnIndex}`);
  
  // Default column mappings for different table types (fallback only)
  const columnMappings = {
    'alerts': [
      'id', 'title', 'status', 'related_type_id', 'condition', 'message', 'created_at', 'is_triggered',
    ],
    'trades': [
      'id', 'symbol', 'side', 'investment_type', 'status', 'account_name', 'created_at', 'amount',
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
      'account_name',  // 0 - חשבון מסחר (Account)
      'type',          // 1 - סוג (Type)
      'amount',        // 2 - סכום (Amount)
      'date',          // 3 - תאריך (Date)
      'description',   // 4 - תיאור (Description)
      'source',        // 5 - מקור (Source)
    ],
    'notes': [
      'id', 'title', 'content', 'type', 'status', 'created_at',
    ],
    'linked_items': [
      'linked_to',     // 0 - מקושר ל (משולב: type + name)
      'status',         // 1 - סטטוס (Status)
      'created_at',     // 2 - תאריך (Date)
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
  
  // CRITICAL: Prevent recursion - check if we're already sorting
  if (window._sortTableDataInProgress) {
    console.warn(`[sortTableData] Recursion detected: sort already in progress for ${tableType} column ${columnIndex}, returning original data`);
    console.trace('[sortTableData] Stack trace for rejected call');
    return data;
  }
  
  console.log(`[sortTableData] Starting sort: tableType=${tableType}, columnIndex=${columnIndex}, dataLength=${data?.length || 0}, hasUpdateFunction=${typeof updateFunction === 'function'}`);
  
  // Set flag to prevent recursion
  window._sortTableDataInProgress = true;

  try {
    // Validate input data
    if (!data || !Array.isArray(data)) {
      return [];
    }

    if (data.length === 0) {
      return [];
    }

  // Get current sort state for this specific column
  const columnStateKey = `sortState_${tableType}_col_${columnIndex}`;
  const savedColumnState = localStorage.getItem(columnStateKey);
  let currentColumnState = null;
  if (savedColumnState) {
    try {
      currentColumnState = JSON.parse(savedColumnState);
    } catch {
      // Invalid state for this column
    }
  }

  // Determine new sort direction
  let newDirection = 'asc';
  if (currentColumnState) {
    // If column has previous state - toggle direction
    newDirection = currentColumnState.direction === 'asc' ? 'desc' : 'asc';
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
    // Note: We skip secondary sort for now as each column has its own independent sort state
    
    return 0;
  });

  // Update the table
  if (typeof updateFunction === 'function') {
    // CRITICAL: Temporarily disable event handlers to prevent recursion
    const table = document.querySelector(`table[data-table-type="${tableType}"]`);
    if (table) {
      const sortableHeaders = table.querySelectorAll('.sortable-header');
      sortableHeaders.forEach(header => {
        header.style.pointerEvents = 'none';
      });
      
      try {
        updateFunction(sortedData);
      } finally {
        // Re-enable event listeners after a short delay
        setTimeout(() => {
          sortableHeaders.forEach(header => {
            header.style.pointerEvents = '';
          });
        }, 150);
      }
    } else {
      updateFunction(sortedData);
    }
  }

  // Update sort icons
  if (typeof window.updateSortIcons === 'function') {
    window.updateSortIcons(tableType, columnIndex, newDirection);
  }

  // Table sorted by column
  console.log(`[sortTableData] Completed sort: tableType=${tableType}, columnIndex=${columnIndex}, sortedLength=${sortedData?.length || 0}`);
  return sortedData;
  } finally {
    // Clear flag after execution
    window._sortTableDataInProgress = false;
  }
};

// REMOVED: updateSortIconsLocal - duplicate, use window.updateSortIcons from data-basic.js instead
/**
 * Update sort icons in table headers
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {string} direction - Sort direction (asc/desc)
 */
function _REMOVED_updateSortIconsLocal(tableType, columnIndex, direction) {
  try {
    // Find the table by data-table-type attribute
    const table = document.querySelector(`table[data-table-type="${tableType}"]`);
    if (!table) {
      console.warn(`⚠️ Table with type "${tableType}" not found for sort icons update`);
      return;
    }

    // Clear all sort icons first
    const headers = table.querySelectorAll('th .sort-icon');
    headers.forEach(header => {
      header.textContent = '↕';
      header.className = 'sort-icon';
    });

    // Update the specific column's sort icon
    const targetHeader = table.querySelector(`th:nth-child(${columnIndex + 1}) .sort-icon`);
    if (targetHeader) {
      if (direction === 'asc') {
        targetHeader.textContent = '↑';
        targetHeader.className = 'sort-icon sort-asc';
      } else if (direction === 'desc') {
        targetHeader.textContent = '↓';
        targetHeader.className = 'sort-icon sort-desc';
      } else {
        targetHeader.textContent = '↕';
        targetHeader.className = 'sort-icon';
      }
    }

  } catch (error) {
    console.error('❌ Error updating sort icons:', error);
  }
}

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
  // Save state for both table type (current column) and specific column
  localStorage.setItem(`sortState_${tableType}`, JSON.stringify(sortState));
  localStorage.setItem(`sortState_${tableType}_col_${columnIndex}`, JSON.stringify(sortState));
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
 * @param {string|number} tableTypeOrColumnIndex - Type of table OR column index
 * @param {number} columnIndex - Column index (if first param is tableType)
 * @param {Array} dataArray - Data array (optional)
 * @param {Function} updateFunction - Update function (optional)
 * @returns {Array} Sorted data
 */
window.sortTable = function (tableTypeOrColumnIndex, columnIndex, dataArray, updateFunction) {
  // CRITICAL: Always log to console to trace calls - this is the first line of the function
  console.log('🔍 [sortTable] FUNCTION CALLED', {
    tableTypeOrColumnIndex: typeof tableTypeOrColumnIndex === 'string' ? tableTypeOrColumnIndex : typeof tableTypeOrColumnIndex,
    columnIndex: columnIndex,
    hasDataArray: !!dataArray,
    hasUpdateFunction: !!updateFunction,
    argsLength: arguments.length,
    stackTrace: new Error().stack.split('\n').slice(0, 3).join('\n')
  });
  // Handle call with only columnIndex (number) - find table from DOM
  // This is used by older tables that call sortTable(0) without tableType
  if (typeof tableTypeOrColumnIndex === 'number' && (columnIndex === undefined || typeof columnIndex !== 'number') && arguments.length === 1) {
    // Try to find the table from the event target or active element
    let clickedElement = null;
    
    // Try to get from window.event (old browsers) or global event
    if (typeof event !== 'undefined' && event && event.target) {
      clickedElement = event.target;
    } else {
      // Fallback: try to find the active/clicked button
      clickedElement = document.activeElement;
      // If activeElement is not a button, try to find the last clicked sortable header
      if (!clickedElement || !clickedElement.classList.contains('sortable-header')) {
        const sortableHeaders = document.querySelectorAll('.sortable-header');
        // Find the one that was recently clicked (this is a workaround)
        clickedElement = Array.from(sortableHeaders).find(el => {
          const rect = el.getBoundingClientRect();
          // Check if element is visible and potentially clicked
          return rect.width > 0 && rect.height > 0;
        });
      }
    }
    
    const table = clickedElement?.closest('table[data-table-type]');
    if (!table) {
      return;
    }
    
    const tableType = table.getAttribute('data-table-type');
    const actualColumnIndex = tableTypeOrColumnIndex;
    
    // Now handle as if called with (tableType, columnIndex)
    return window.sortTable(tableType, actualColumnIndex);
  }
  
  // Handle call with string tableType and number columnIndex
  if (typeof tableTypeOrColumnIndex === 'string' && typeof columnIndex === 'number' && arguments.length === 2) {
    const tableType = tableTypeOrColumnIndex;
    
    // Use UnifiedTableSystem if available
    if (window.UnifiedTableSystem && window.UnifiedTableSystem.registry.isRegistered(tableType)) {
      if (window.Logger) {
        window.Logger.debug(`[sortTable] Using UnifiedTableSystem for "${tableType}" column ${columnIndex}`, { page: "tables" });
      }
      const result = window.UnifiedTableSystem.sorter.sort(tableType, columnIndex);
      if (window.Logger) {
        window.Logger.debug(`[sortTable] UnifiedTableSystem returned ${result?.length || 0} items`, { page: "tables" });
      }
      return result;
    }
    
    // ===== FALLBACK TO OLD SYSTEM =====
    // This code is for backward compatibility with tables not yet registered with UnifiedTableSystem
    // Once all tables are migrated to UnifiedTableSystem, this fallback code can be removed
    // Get the table data from the current page
    let tableData = [];
    let updateFn = null;
    
    // Try to get data from page-specific functions (OLD APPROACH)
    if (tableType === 'executions' && window.executionsData) {
      tableData = window.executionsData;
      updateFn = (sortedData) => window.updateExecutionsTableMain(sortedData);
    } else if (tableType === 'tickers' && window.tickersData) {
      tableData = window.tickersData;
      updateFn = (sortedData) => window.updateTickersTableMain(sortedData);
    } else if (tableType === 'trading_accounts') {
      // Get trading accounts data
      if (window.trading_accountsData) {
        tableData = window.trading_accountsData;
        updateFn = (sortedData) => {
          if (typeof window.updateTradingAccountsTable === 'function') {
            window.updateTradingAccountsTable(sortedData);
          }
        };
      } else {
        return;
      }
    } else if (tableType === 'cash_flows' && window.cashFlowsData) {
      tableData = window.cashFlowsData;
      updateFn = (sortedData) => window.updateCashFlowsTable(sortedData);
    } else if (tableType === 'alerts' && window.alertsData) {
      tableData = window.alertsData;
      updateFn = (sortedData) => window.updateAlertsTable(sortedData);
    } else if (tableType === 'notes' && window.notesData) {
      tableData = window.notesData;
      updateFn = (sortedData) => window.updateNotesTable(sortedData);
    } else if (tableType === 'trades' && window.tradesData) {
      tableData = window.tradesData;
      updateFn = (sortedData) => window.updateTradesTable(sortedData);
    } else if (tableType === 'trade_plans' && window.tradePlansData) {
      tableData = window.tradePlansData;
      updateFn = (sortedData) => window.updateTradePlansTable(sortedData);
    } 
    // ===== OLD CODE - REPLACED BY UnifiedTableSystem =====
    // NOTE: positions and portfolio tables are now handled by UnifiedTableSystem (registered in trading_accounts.js)
    // This code is commented out to prevent conflicts - it should never execute for registered tables
    // The UnifiedTableSystem check above (line 487) will catch these tables before this fallback code runs
    // This code is kept here for reference only and can be removed after full system-wide migration
    /*
    else if (tableType === 'positions') {
      // OLD CODE - positions table is now registered with UnifiedTableSystem
      // This code should never execute because UnifiedTableSystem handles it first
      if (window.positionsPortfolioState && window.positionsPortfolioState.positionsData) {
        tableData = window.positionsPortfolioState.positionsData;
        updateFn = (sortedData) => window.updatePositionsTable(sortedData);
      } else {
        return;
      }
    } else if (tableType === 'portfolio') {
      // OLD CODE - portfolio table is now registered with UnifiedTableSystem
      // This code should never execute because UnifiedTableSystem handles it first
      if (window.positionsPortfolioState && window.positionsPortfolioState.portfolioData && window.positionsPortfolioState.portfolioData.positions) {
        tableData = window.positionsPortfolioState.portfolioData.positions;
        updateFn = (sortedData) => window.updatePortfolioTable(sortedData);
      } else {
        return;
      }
    } 
    */
    else {
      return;
    }
    
    // Validate data before sorting
    if (!Array.isArray(tableData)) {
      return;
    }
    
    if (tableData.length === 0) {
      return;
    }
    
    const result = window.sortTableData(columnIndex, tableData, tableType, updateFn);
    return result;
  }
  
  // Handle new call with all parameters (explicit call with data array)
  if (typeof tableTypeOrColumnIndex === 'string' && typeof columnIndex === 'number' && Array.isArray(dataArray)) {
    return window.sortTableData(columnIndex, dataArray, tableTypeOrColumnIndex, updateFunction);
  }
  
  // If we get here, parameters are invalid
  return [];
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

// NOTE: window.sortTable is already defined above (line 450) with the correct signature
// that handles both old-style calls (sortTable(columnIndex)) and new-style calls (sortTable(tableType, columnIndex))
// The local function sortTable() (line 27) is a helper function only, not exported
// DO NOT override window.sortTable here - it's already correctly defined above

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

// ===== UNIFIED CACHE INTEGRATION =====

/**
 * Load table data from unified cache
 * Loads table data from the unified cache system with fallback to server
 *
 * @param {string} tableId - Table identifier
 * @param {Object} filters - Table filters
 * @param {Function} serverLoader - Server data loader function
 * @returns {Promise<Array>} Table data
 */
window.loadTableDataFromCache = async function(tableId, filters = {}, serverLoader = null) {
  try {
    if (!window.UnifiedCacheManager) {
      console.warn('⚠️ UnifiedCacheManager not available, using direct server load');
      return serverLoader ? await serverLoader() : [];
    }

    // יצירת מפתח cache ייחודי
    const cacheKey = `table-${tableId}-${JSON.stringify(filters)}`;
    
    // טעינה ממטמון מאוחד
    const data = await window.UnifiedCacheManager.get(cacheKey, {
      fallback: serverLoader,
      ttl: 300000 // 5 דקות
    });
    
    console.log(`✅ Loaded table ${tableId} data from cache`);
    return data || [];
    
  } catch (error) {
    console.error(`❌ Failed to load table ${tableId} from cache:`, error);
    return serverLoader ? await serverLoader() : [];
  }
};

/**
 * Save table data to unified cache
 * Saves table data to the unified cache system
 *
 * @param {string} tableId - Table identifier
 * @param {Array} data - Table data
 * @param {Object} filters - Table filters
 * @returns {Promise<boolean>} Success status
 */
window.saveTableDataToCache = async function(tableId, data, filters = {}) {
  try {
    if (!window.UnifiedCacheManager) {
      console.warn('⚠️ UnifiedCacheManager not available, skipping cache save');
      return false;
    }

    // יצירת מפתח cache ייחודי
    const cacheKey = `table-${tableId}-${JSON.stringify(filters)}`;
    
    // שמירה במטמון מאוחד
    const result = await window.UnifiedCacheManager.save(cacheKey, data, {
      ttl: 300000, // 5 דקות
      syncToBackend: false
    });
    
    if (result) {
      console.log(`✅ Saved table ${tableId} data to cache`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to save table ${tableId} to cache:`, error);
    return false;
  }
};

/**
 * Save table UI state to cache
 * Saves table UI state (sorting, filtering, pagination) to cache
 *
 * @param {string} tableId - Table identifier
 * @param {Object} state - Table UI state
 * @returns {Promise<boolean>} Success status
 */
window.saveTableState = async function(tableId, state) {
  try {
    if (!window.UnifiedCacheManager) {
      console.warn('⚠️ UnifiedCacheManager not available, skipping state save');
      return false;
    }

    // שמירת מצב UI ב-localStorage
    const result = await window.UnifiedCacheManager.save(`table-${tableId}-state`, state, {
      layer: 'localStorage',
      ttl: 3600000 // שעה
    });
    
    if (result) {
      console.log(`✅ Saved table ${tableId} state to cache`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to save table ${tableId} state to cache:`, error);
    return false;
  }
};

/**
 * Load table UI state from cache
 * Loads table UI state (sorting, filtering, pagination) from cache
 *
 * @param {string} tableId - Table identifier
 * @returns {Promise<Object|null>} Table UI state or null
 */
window.loadTableState = async function(tableId) {
  try {
    if (!window.UnifiedCacheManager) {
      console.warn('⚠️ UnifiedCacheManager not available, returning null state');
      return null;
    }

    // טעינת מצב UI מ-localStorage
    const state = await window.UnifiedCacheManager.get(`table-${tableId}-state`);
    
    if (state) {
      console.log(`✅ Loaded table ${tableId} state from cache`);
    }
    
    return state;
    
  } catch (error) {
    console.error(`❌ Failed to load table ${tableId} state from cache:`, error);
    return null;
  }
};

// Tables.js loaded successfully
