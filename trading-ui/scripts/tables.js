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

    if (typeof window.sortTableData === 'function') {
        window.sortTableData(columnIndex, data, tableType, updateFunction);
    } else {
        // sortTableData function not found in tables.js
    }
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
            'id', 'title', 'status', 'related_type_id', 'condition', 'message', 'created_at', 'is_triggered'
        ],
        'trades': [
            'id', 'symbol', 'side', 'investment_type', 'status', 'account_name', 'created_at', 'amount'
        ],
        'accounts': [
            'id', 'name', 'currency_name', 'balance', 'status', 'created_at'
        ],
        'tickers': [
            'id', 'symbol', 'name', 'price', 'change_percent', 'volume', 'market_cap'
        ],
        'trade_plans': [
            'id', 'symbol', 'side', 'investment_type', 'status', 'target_price', 'stop_loss', 'created_at'
        ],
        'executions': [
            'id', 'symbol', 'side', 'investment_type', 'status', 'account_name', 'created_at', 'amount'
        ],
        'cash_flows': [
            'id', 'type', 'amount', 'currency', 'account_name', 'description', 'created_at'
        ],
        'notes': [
            'id', 'title', 'content', 'type', 'status', 'created_at'
        ]
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
            if (value === undefined) break;
        }
        return value || '';
    }

    return item[fieldName] || '';
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

    // Sort the data
    const sortedData = [...data].sort((a, b) => {
        let aValue = getColumnValue(a, columnIndex, tableType);
        let bValue = getColumnValue(b, columnIndex, tableType);

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
    if (!value) return false;
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
        columnIndex: columnIndex,
        direction: direction,
        timestamp: Date.now()
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
        } catch (e) {
            console.warn(`⚠️ Invalid sort state for ${tableType}:`, e);
        }
    }
    
    // Return default state
    return {
        columnIndex: -1,
        direction: 'asc',
        timestamp: Date.now()
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
let externalFilterPresent = false;

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
    { field: 'updated_at', headerName: 'Updated', width: 150, sortable: true }
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
    closeModal: window.closeModal,
    getDefaultColumnDefs: window.getDefaultColumnDefs
};

// ייצוא פונקציית sortTable גלובלית
window.sortTable = sortTable;

// Tables.js loaded successfully
