/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 16
 * 
 * PAGE INITIALIZATION (2)
 * - initDatabaseDisplay() - initDatabaseDisplay function
 * - setupEventListeners() - * Initialize the database display page
 * 
 * DATA LOADING (3)
 * - loadTableData() - * Set up page event listeners
 * - fetchTableData() - * Load data for a specific table type
 * - showLoadingState() - * Apply sorting functionality to table
 * 
 * DATA MANIPULATION (4)
 * - updateTableDisplay() - * Fetch table data from server
 * - createTableBodyHTML() - createTableBodyHTML function
 * - updateTableInfo() - * Show loading state
 * - addRecord() - * Format status value
 * 
 * EVENT HANDLING (1)
 * - applySortingFunctionality() - * Format cell value based on column configuration
 * 
 * UTILITIES (5)
 * - formatCellValue() - formatCellValue function
 * - formatDate() - * Filter table data
 * - formatNumber() - * Format date value
 * - formatCurrency() - * Format date value
 * - formatStatus() - * Format currency value
 * 
 * OTHER (1)
 * - filterTableData() - * Update table information display
 * 
 * ==========================================
 */
/**
 * ========================================
 * Database Management - Database Display Page Management
 * ========================================
 *
 * This file contains all database display page functionality for the TikTrack application.
 * It handles displaying all database tables in one unified view with sorting and filtering.
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * - notification-system.js (for notifications)
 *
 * Table Mapping:
 * - Uses all table types from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * File: trading-ui/scripts/database.js (renamed from db_display.js)
 * Version: 1.1
 * Last Updated: September 2025
 * Note: Renamed from db_display.js as part of JavaScript architecture standardization
 */

/**
 * Function Index:
 * ==============
 * 
 * PAGE INITIALIZATION:
 * - initDatabaseDisplay()
 * - setupEventListeners()
 * 
 * DATA LOADING:
 * - loadTableData()
 * - fetchTableData()
 * 
 * TABLE DISPLAY:
 * - updateTableDisplay()
 * - createTableBodyHTML()
 * - formatCellValue()
 * - applySortingFunctionality()
 * 
 * UTILITY FUNCTIONS:
 * - showLoadingState()
 * - updateTableInfo()
 * - filterTableData()
 * - formatDate()
 * - formatNumber()
 * - formatCurrency()
 * - formatStatus()
 * 
 * ==============
 */

// ===== GLOBAL VARIABLES =====
let currentTableType = 'accounts'; // Default table type
const tableData = {};

// ===== PAGE INITIALIZATION =====

/**
 * Initialize the database display page
 */
function initDatabaseDisplay() {
  try {

    // Load default table (accounts)
    loadTableData('accounts');

    // Set up event listeners
    setupEventListeners();

    // Initialize header system
    if (window.headerSystem) {
      window.headerSystem.init();
    }

  } catch (error) {
    window.Logger.error('שגיאה באתחול עמוד בסיס הנתונים:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה באתחול עמוד בסיס הנתונים', error.message);
    }
  }
}

/**
 * Set up page event listeners
 */
function setupEventListeners() {
  try {
    // Table type selector
    const tableTypeSelect = document.getElementById('tableTypeSelect');
    if (tableTypeSelect) {
      tableTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        loadTableData(selectedType);
      });
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        filterTableData(this.value);
      });
    }
  } catch (error) {
    window.Logger.error('שגיאה בהגדרת אירועי עמוד בסיס הנתונים:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהגדרת אירועי עמוד בסיס הנתונים', error.message);
    }
  }
}

// ===== DATA LOADING =====

/**
 * Load data for a specific table type
 * @param {string} tableType - The table type to load
 */
async function loadTableData(tableType) {
  try {

    // Update current table type
    currentTableType = tableType;

    // Show loading state
    showLoadingState();

    // Fetch data from server
    const data = await fetchTableData(tableType);

    // Store data
    tableData[tableType] = data;

    // Update table display
    updateTableDisplay(data, tableType);

    // Update table info
    updateTableInfo(tableType, data.length);



  } catch (error) {
    // console.error(`❌ Error loading data for ${tableType}:`, error);
    handleApiError(error, `טעינת נתוני ${tableType}`);
  }
}

/**
 * Fetch table data from server
 * @param {string} tableType - The table type to fetch
 * @returns {Promise<Array>} The fetched data
 */
async function fetchTableData(tableType) {
  try {
    const response = await fetch(`/api/${tableType}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      return result.data || [];
    } else {
      throw new Error(result.error?.message || `Error fetching ${tableType} data`);
    }
  } catch {
    // console.error(`❌ Error fetching ${tableType} data:`, error);
    // Return empty array on error
    return [];
  }
}

// ===== TABLE DISPLAY =====

/**
 * Update table display with data
 * @param {Array} data - The data to display
 * @param {string} tableType - The table type
 */
function updateTableDisplay(data, tableType) {
  try {
    // Find the correct container for this table type
    const containerId = `${tableType}Container`;
    const tableContainer = document.getElementById(containerId);

    if (!tableContainer) {
      // console.error(`❌ Table container not found for ${tableType}: ${containerId}`);
      return;
    }

    // Find the table within the container
    const table = tableContainer.querySelector('table');
  if (!table) {
    // console.error(`❌ Table not found in container ${containerId}`);
    return;
  }

  // Find the table body
  const tbody = table.querySelector('tbody');
  if (!tbody) {
    // console.error(`❌ Table body not found in table ${tableType}`);
    return;
  }

  // Get table mappings
  const tableMapping = window.TABLE_COLUMN_MAPPINGS?.[tableType];
  if (!tableMapping) {
    // console.error(`❌ No table mapping found for ${tableType}`);
    return;
  }

  // Create table body HTML
  const tbodyHTML = createTableBodyHTML(data, tableMapping, tableType);

  // Update table body
  tbody.innerHTML = tbodyHTML;

  // Apply sorting functionality
  applySortingFunctionality(tableType);
  } catch (error) {
    window.Logger.error('שגיאה בעדכון תצוגת טבלה:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון תצוגת טבלה', error.message);
    }
  }
}


/**
 * Create table body HTML from data
 * @param {Array} data - The table data
 * @param {Array} tableMapping - The table column mapping array
 * @param {string} tableType - The table type
 * @returns {string} The table body HTML
 */
function createTableBodyHTML(data, tableMapping, _tableType) {
  try {
    let tbodyHTML = '';

    if (data.length === 0) {
      tbodyHTML += `<tr><td colspan="${tableMapping.length}" class="text-center">אין נתונים</td></tr>`;
    } else {
      data.forEach(row => {
        tbodyHTML += '<tr>';
        tableMapping.forEach(fieldName => {
          const value = row[fieldName] || '';
          const formattedValue = formatCellValue(value, { field: fieldName });
          tbodyHTML += `<td>${formattedValue}</td>`;
        });
        tbodyHTML += '</tr>';
      });
    }

    return tbodyHTML;
  } catch (error) {
    window.Logger.error('שגיאה ביצירת HTML של טבלה:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה ביצירת HTML של טבלה', error.message);
    }
    return '<tr><td colspan="100%" class="text-center text-danger">שגיאה בטעינת הנתונים</td></tr>';
  }
}

/**
 * Format cell value based on column configuration
 * @param {*} value - The cell value
 * @param {Object} column - The column configuration
 * @returns {string} The formatted value
 */
function formatCellValue(value, column) {
  try {
    if (value === null || value === undefined) {
      return '';
    }

    // Apply formatting based on column type
    switch (column.type) {
    case 'date':
      return formatDate(value);
    case 'number':
      return formatNumber(value);
    case 'currency':
      return formatCurrency(value);
    case 'status':
      return formatStatus(value);
    default:
      return String(value);
    }
  } catch (error) {
    window.Logger.error('שגיאה בעיצוב ערך תא:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעיצוב ערך תא', error.message);
    }
    return String(value || '');
  }
}

/**
 * Apply sorting functionality to table
 * @param {string} tableType - The table type
 */
function applySortingFunctionality(_tableType) {
  try {
    // Sorting is handled by global sortTable function from main.js
  } catch (error) {
    window.Logger.error('שגיאה בהחלת פונקציונליות מיון:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהחלת פונקציונליות מיון', error.message);
    }
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Show loading state
 */
function showLoadingState() {
  try {
    // Show loading state in the current table's tbody
    if (currentTableType) {
      const containerId = `${currentTableType}Container`;
      const tableContainer = document.getElementById(containerId);
      if (tableContainer) {
        const tbody = tableContainer.querySelector('tbody');
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="10" class="text-center">טוען נתונים...</td></tr>';
        }
      }
    }
  } catch (error) {
    window.Logger.error('שגיאה בהצגת מצב טעינה:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת מצב טעינה', error.message);
    }
  }
}

/**
 * Update table information display
 * @param {string} tableType - The table type
 * @param {number} recordCount - The number of records
 */
function updateTableInfo(tableType, recordCount) {
  try {
    // Update the count display in the section header
    const countElement = document.getElementById(`${tableType}Count`);
    if (countElement) {
      countElement.textContent = `${recordCount} רשומות`;
    }
  } catch (error) {
    window.Logger.error('שגיאה בעדכון מידע טבלה:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון מידע טבלה', error.message);
    }
  }
}

/**
 * Filter table data
 * @param {string} searchTerm - The search term
 */
function filterTableData(searchTerm) {
  try {
    if (!searchTerm || !tableData[currentTableType]) {
      updateTableDisplay(tableData[currentTableType] || [], currentTableType);
      return;
    }

    const filteredData = tableData[currentTableType].filter(row => Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ));

    updateTableDisplay(filteredData, currentTableType);
  } catch (error) {
    window.Logger.error('שגיאה בפילטור נתוני טבלה:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפילטור נתוני טבלה', error.message);
    }
  }
}

/**
 * Format date value
 * @param {string} dateString - The date string
 * @returns {string} The formatted date
 */
// REMOVED: formatDate - use window.formatDate from date-utils.js directly
  if (!dateString) {return '';}

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  } catch {
    return dateString;
  }
}

/**
 * Format number value
 * @param {number} number - The number
 * @returns {string} The formatted number
 */
function formatNumber(number) {
  try {
    if (number === null || number === undefined) {return '';}
    return Number(number).toLocaleString('he-IL');
  } catch (error) {
    window.Logger.error('שגיאה בעיצוב מספר:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעיצוב מספר', error.message);
    }
    return String(number || '');
  }
}

/**
 * Format currency value
 * @param {number} amount - The amount
 * @returns {string} The formatted currency
 */
function formatCurrency(amount) {
  try {
    if (amount === null || amount === undefined) {return '';}
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } catch (error) {
    window.Logger.error('שגיאה בעיצוב מטבע:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעיצוב מטבע', error.message);
    }
    return String(amount || '');
  }
}

/**
 * Format status value
 * @param {string} status - The status
 * @returns {string} The formatted status
 */
function formatStatus(status) {
  try {
    if (!status) {return '';}

    const statusMap = {
      'active': 'פעיל',
      'inactive': 'לא פעיל',
      'pending': 'ממתין',
      'completed': 'הושלם',
      'cancelled': 'בוטל',
    };

    return statusMap[status] || status;
  } catch (error) {
    window.Logger.error('שגיאה בעיצוב סטטוס:', error, { page: "database" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעיצוב סטטוס', error.message);
    }
    return String(status || '');
  }
}

// ===== מערכת טיפול בשגיאות =====
// השתמש במערכת הכללית error-handlers.js

/**
 * Toggle top section visibility
 */

// toggleSection function removed - use toggleSection('main') instead

/**
 * Add new record (placeholder function)
 */
function addRecord() {
  // This is a placeholder function - implement based on requirements
  if (window.showInfoNotification) {
    window.showInfoNotification('פונקציה זו תשולב בהמשך');
  }
}

/**
 * Simple table sorting function for database display page
 * @param {number} columnIndex - The column index to sort by
 * @param {string} tableType - The table type identifier
 */

// ===== UTILITY FUNCTIONS =====

/**
 * Copy detailed log with all database information
 */

// ===== GLOBAL EXPORTS =====

// Export functions to global scope
window.initDatabaseDisplay = initDatabaseDisplay;
window.loadTableData = loadTableData;
window.filterTableData = filterTableData;
// window.toggleSection removed - using global version from ui-utils.js
// toggleSection export removed - use toggleSection('main') instead
window.addRecord = addRecord;
// window.sortTable export removed - using global version from tables.js
// window. export removed - using global version from system-management.js

// Initialize when DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//   initDatabaseDisplay();
// });


