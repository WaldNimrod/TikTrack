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
 * UNIFIED CACHE INTEGRATION (January 26, 2025):
 * =============================================
 * - Integrated with UnifiedCacheManager for table data caching
 * - Added table state management with unified cache
 * - Improved performance with smart caching strategies
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
 * 2. UNIFIED CACHE INTEGRATION:
 *    - loadTableDataFromCache() - Load table data from unified cache
 *    - saveTableDataToCache() - Save table data to unified cache
 *    - saveTableState() - Save table UI state to cache
 *    - loadTableState() - Load table UI state from cache
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
  // Use centralized table mappings system according to specification
  if (window.tableMappings && window.tableMappings.getColumnValue) {
    return window.tableMappings.getColumnValue(item, columnIndex, tableType);
  }

  // Fallback - should not happen if centralized system is loaded
  console.warn(`⚠️ [tables.js] Centralized table mappings not available, falling back to basic field access for ${tableType}:${columnIndex}`);
  return '';
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
    // Change column (index 2) - שינוי יומי - special handling for positive/negative values
    if (columnIndex === 2) {
      const aNum = parseFloat(aValue) || -Infinity;
      const bNum = parseFloat(bValue) || -Infinity;
      
      // If both are -Infinity (missing data), they're equal
      if (aNum === -Infinity && bNum === -Infinity) {
        return 0;
      }
      
      // Missing data (-Infinity) is always smallest
      if (aNum === -Infinity) return -1;
      if (bNum === -Infinity) return 1;
      
      // For change percentage: positive values first, then negative values
      // Within each group, sort by absolute value
      if (aNum > 0 && bNum < 0) return -1; // Positive before negative
      if (aNum < 0 && bNum > 0) return 1;  // Positive before negative
      
      // Both same sign - sort by absolute value (descending)
      return Math.abs(bNum) - Math.abs(aNum);
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

  // Custom sorting for cash_flows table
  if (tableType === 'cash_flows') {
    // Type column (index 1) - Hebrew alphabetical sorting for cash flow types
    if (columnIndex === 1) {
      // Use Hebrew locale for proper alphabetical sorting
      return aValue.localeCompare(bValue, 'he-IL');
    }
    
    // Amount column (index 2) - numeric sorting with proper handling of negative values
    if (columnIndex === 2) {
      const aNum = parseFloat(aValue) || -Infinity;
      const bNum = parseFloat(bValue) || -Infinity;
      
      // If both are -Infinity (missing data), they're equal
      if (aNum === -Infinity && bNum === -Infinity) {
        return 0;
      }
      
      // Missing data (-Infinity) is always smallest
      if (aNum === -Infinity) return -1;
      if (bNum === -Infinity) return 1;
      
      // Standard numeric comparison
      return aNum - bNum;
    }
  }

  // Custom sorting for notes table
  if (tableType === 'notes') {
    // Related object column (index 1) - Hebrew alphabetical sorting
    if (columnIndex === 1) {
      // Use Hebrew locale for proper alphabetical sorting
      return aValue.localeCompare(bValue, 'he-IL');
    }
    
    // Content column (index 2) - Hebrew alphabetical sorting
    if (columnIndex === 2) {
      // Use Hebrew locale for proper alphabetical sorting
      return aValue.localeCompare(bValue, 'he-IL');
    }
    
    // Created date column (index 4) - date sorting
    if (columnIndex === 4) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      
      // Handle invalid dates
      if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) {
        return 0;
      }
      if (isNaN(aDate.getTime())) return -1;
      if (isNaN(bDate.getTime())) return 1;
      
      // Standard date comparison
      return aDate - bDate;
    }
  }

  // Custom sorting for other table types can be added here
  // if (tableType === 'trades') { ... }
  // if (tableType === 'accounts') { ... }

  return null; // No custom logic applies - use standard sorting
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
      // Handle -Infinity values (missing data should be smallest)
      if (aValue === -Infinity && bValue === -Infinity) {
        return 0;
      }
      if (aValue === -Infinity) {
        return newDirection === 'asc' ? -1 : 1; // -Infinity is always smallest
      }
      if (bValue === -Infinity) {
        return newDirection === 'asc' ? 1 : -1; // -Infinity is always smallest
      }

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
        return newDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return newDirection === 'asc' ? 1 : -1;
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

  // Log sorted data for debugging
  console.log(`🔍 [SORT] Sorted data (first 3):`, sortedData.slice(0, 3).map(item => {
    const value = getColumnValue(item, columnIndex, tableType);
    return { value, symbol: item.symbol, data: item };
  }));
  console.log(`🔍 [SORT] Original data (first 3):`, data.slice(0, 3).map(item => {
    const value = getColumnValue(item, columnIndex, tableType);
    return { value, symbol: item.symbol, data: item };
  }));
  
  // Log all price values for debugging when sorting by price
  if (tableType === 'tickers' && columnIndex === 3) {
    console.log(`🔍 [SORT] All price values before sort:`, data.map(item => ({
      symbol: item.symbol,
      price: getColumnValue(item, columnIndex, tableType),
      raw_price: item.current_price
    })));
    console.log(`🔍 [SORT] All price values after sort:`, sortedData.map(item => ({
      symbol: item.symbol,
      price: getColumnValue(item, columnIndex, tableType),
      raw_price: item.current_price
    })));
    
        // Log detailed price comparison
        console.log(`🔍 [SORT] Price comparison - First 5 items:`);
        for (let i = 0; i < Math.min(5, sortedData.length); i++) {
          const item = sortedData[i];
          const price = getColumnValue(item, columnIndex, tableType);
          const fieldName = window.TABLE_COLUMN_MAPPINGS?.[tableType]?.[columnIndex] || 'unknown';
          console.log(`  ${item.symbol || item.name}: ${price} (fieldName: ${fieldName})`);
        }
  }
  console.log(`🔍 [SORT] Sorted symbols (ALL):`, sortedData.map(item => item.symbol));
  console.log(`🔍 [SORT] Original symbols (ALL):`, data.map(item => item.symbol));
  // Use centralized table mappings for debugging
  if (window.TABLE_COLUMN_MAPPINGS) {
    const columnMappings = window.TABLE_COLUMN_MAPPINGS;
    console.log(`🔍 [SORT] Column mapping for ${tableType}:`, columnMappings[tableType]);
    console.log(`🔍 [SORT] Column ${columnIndex} maps to:`, columnMappings[tableType]?.[columnIndex]);
  }

  // Update the table
  if (typeof updateFunction === 'function') {
    console.log(`🔍 [SORT] Calling updateFunction with ${sortedData.length} items`);
    updateFunction(sortedData);
  } else {
    console.warn(`⚠️ [SORT] updateFunction is not a function:`, typeof updateFunction);
  }

  // Update sort icons
  updateSortIcons(tableType, columnIndex, newDirection);

  // Table sorted by column
  return sortedData;
};

/**
 * Update sort icons in table headers
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {string} direction - Sort direction (asc/desc)
 */
function updateSortIcons(tableType, columnIndex, direction) {
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

    console.log(`🔍 [SORT] Updated sort icons for ${tableType} column ${columnIndex} to ${direction}`);
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
window.saveSortState = async function (tableType, columnIndex, direction) {
  const sortState = {
    columnIndex,
    direction,
    timestamp: Date.now(),
  };
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
    await window.UnifiedCacheManager.save(`sortState_${tableType}`, sortState, {
      layer: 'localStorage',
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      syncToBackend: false
    });
  } else {
    localStorage.setItem(`sortState_${tableType}`, JSON.stringify(sortState)); // fallback
  }
  // Sort state saved for table
};

/**
 * Get saved sort state for a table type
 *
 * @param {string} tableType - Type of table
 * @returns {Object} Sort state object with columnIndex, direction, timestamp
 */
window.getSortState = async function (tableType) {
  let savedState = null;
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
    savedState = await window.UnifiedCacheManager.get(`sortState_${tableType}`);
  } else {
    savedState = localStorage.getItem(`sortState_${tableType}`); // fallback
  }
  if (savedState) {
    try {
      return typeof savedState === 'string' ? JSON.parse(savedState) : savedState;
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

window.updateSortIcons = updateSortIcons;


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
  // Handle legacy call with only column index
  if (typeof tableTypeOrColumnIndex === 'number' && arguments.length === 1) {
    // Find the current table element
    const currentTable = document.querySelector('table[data-table-type]');
    if (!currentTable) {
      console.warn('No table with data-table-type found');
      return;
    }
    
    const tableType = currentTable.getAttribute('data-table-type');
    const tableId = currentTable.id;
    
    // Get the table data from the current page
    let tableData = [];
    let updateFn = null;
    
    // Try to get data from page-specific functions
    if (tableType === 'executions' && window.executionsData) {
      tableData = window.executionsData;
      updateFn = (sortedData) => window.updateExecutionsTableMain(sortedData);
      console.log(`🔍 [SORT] Found executions data:`, tableData.length, 'items');
    } else if (tableType === 'tickers' && window.tickersData) {
      tableData = window.tickersData;
      updateFn = (sortedData) => {
        if (typeof window.updateTickersTable === 'function') {
          window.updateTickersTable(sortedData);
          // עדכון סטטיסטיקות סיכום אחרי עדכון הטבלה
          if (typeof window.updateTickersSummaryStats === 'function') {
            window.updateTickersSummaryStats(sortedData);
          }
        } else {
          console.warn('⚠️ updateTickersTable function not available');
        }
      };
      console.log(`🔍 [SORT] Found tickers data:`, tableData.length, 'items');
    } else if (tableType === 'accounts' && window.accountsData) {
      tableData = window.accountsData;
      updateFn = (sortedData) => window.updateAccountsTableMain(sortedData);
      console.log(`🔍 [SORT] Found accounts data:`, tableData.length, 'items');
    } else if (tableType === 'cash_flows' && window.cashFlowsData) {
      tableData = window.cashFlowsData;
      updateFn = (sortedData) => window.updateCashFlowsTable(sortedData);
      console.log(`🔍 [SORT] Found cash_flows data:`, tableData.length, 'items');
    } else if (tableType === 'alerts' && window.alertsData) {
      tableData = window.alertsData;
      updateFn = (sortedData) => window.updateAlertsTable(sortedData);
      console.log(`🔍 [SORT] Found alerts data:`, tableData.length, 'items');
    } else if (tableType === 'notes' && window.notesData) {
      tableData = window.notesData;
      updateFn = (sortedData) => window.updateNotesTable(sortedData);
      console.log(`🔍 [SORT] Found notes data:`, tableData.length, 'items');
    } else if (tableType === 'trades' && window.tradesData) {
      tableData = window.tradesData;
      updateFn = (sortedData) => window.updateTradesTable(sortedData);
      console.log(`🔍 [SORT] Found trades data:`, tableData.length, 'items');
    } else if (tableType === 'trade_plans' && window.tradePlansData) {
      tableData = window.tradePlansData;
      updateFn = (sortedData) => window.updateTradePlansTable(sortedData);
      console.log(`🔍 [SORT] Found trade_plans data:`, tableData.length, 'items');
    } else if (tableType === 'db_extradata' && window.extraDataData) {
      tableData = window.extraDataData;
      updateFn = (sortedData) => window.updateExtraDataTable(sortedData);
      console.log(`🔍 [SORT] Found db_extradata data:`, tableData.length, 'items');
    } else if (tableType === 'db_display' && window.dbData) {
      tableData = window.dbData;
      updateFn = (sortedData) => window.updateDbTable(sortedData);
      console.log(`🔍 [SORT] Found db_display data:`, tableData.length, 'items');
    } else if (tableType === 'constraints' && window.constraintsData) {
      tableData = window.constraintsData;
      updateFn = (sortedData) => window.updateConstraintsTable(sortedData);
      console.log(`🔍 [SORT] Found constraints data:`, tableData.length, 'items');
    } else if (tableType === 'preferences' && window.preferencesData) {
      tableData = window.preferencesData;
      updateFn = (sortedData) => window.updatePreferencesTable(sortedData);
      console.log(`🔍 [SORT] Found preferences data:`, tableData.length, 'items');
    } else {
      console.warn(`❌ [SORT] No data found for table type: ${tableType}`);
      console.warn(`❌ [SORT] Available data:`, {
        executionsData: !!window.executionsData,
        tickersData: !!window.tickersData,
        accountsData: !!window.accountsData,
        cashFlowsData: !!window.cashFlowsData,
        alertsData: !!window.alertsData,
        notesData: !!window.notesData,
        tradesData: !!window.tradesData,
        tradePlansData: !!window.tradePlansData,
        extraDataData: !!window.extraDataData,
        dbData: !!window.dbData,
        constraintsData: !!window.constraintsData,
        preferencesData: !!window.preferencesData
      });
      return;
    }
    
    // Validate data before sorting
    if (!Array.isArray(tableData)) {
      console.warn(`❌ [SORT] Data is not an array for table type: ${tableType}`, typeof tableData);
      return;
    }
    
    if (tableData.length === 0) {
      console.warn(`⚠️ [SORT] No data to sort for table type: ${tableType}`);
      return;
    }
    
    console.log(`🔍 [SORT] Sorting ${tableData.length} items by column ${tableTypeOrColumnIndex}`);
    return window.sortTableData(tableTypeOrColumnIndex, tableData, tableType, updateFn);
  }
  
  // Handle new call with all parameters
  return window.sortTableData(columnIndex, dataArray, tableTypeOrColumnIndex, updateFunction);
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
    
    // Define API endpoints for different table types
    const apiEndpoints = {
      'tickers': '/api/tickers/',
      'executions': '/api/executions/',
      'accounts': '/api/accounts/',
      'alerts': '/api/alerts/',
      'notes': '/api/notes/',
      'trades': '/api/trades/',
      'trade_plans': '/api/trade_plans/',
      'cash_flows': '/api/cash_flows/',
      'db_extradata': '/api/db_extradata/',
      'db_display': '/api/db_display/',
      'constraints': '/api/constraints/',
      'preferences': '/api/preferences/'
    };
    
    // Get the correct API endpoint for the table type
    const apiEndpoint = apiEndpoints[tableType] || `/api/data/${tableType}`;
    
    // Fetch data from server
    const response = await fetch(`${apiEndpoint}?_t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Handle different response formats
    let data;
    if (responseData.data && Array.isArray(responseData.data)) {
      data = responseData.data;
    } else if (Array.isArray(responseData)) {
      data = responseData;
    } else {
      data = [];
    }
    
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
console.log('✅ [tables.js] Loaded successfully!');
console.log('✅ [tables.js] window.tableMappings available:', !!window.tableMappings);
console.log('✅ [tables.js] window.getColumnValue available:', !!window.getColumnValue);
