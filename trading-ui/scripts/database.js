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

// ===== GLOBAL VARIABLES =====
let currentTableType = 'accounts'; // Default table type
const tableData = {};

// ===== PAGE INITIALIZATION =====

/**
 * Initialize the database display page
 */
function initDatabaseDisplay() {
  // console.log('🔄 Initializing database display page...');

  // Load default table (accounts)
  loadTableData('accounts');

  // Set up event listeners
  setupEventListeners();

  // Initialize header system
  if (window.headerSystem) {
    window.headerSystem.init();
  }

  // console.log('✅ Database display page initialized successfully');
}

/**
 * Set up page event listeners
 */
function setupEventListeners() {
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
}

// ===== DATA LOADING =====

/**
 * Load data for a specific table type
 * @param {string} tableType - The table type to load
 */
async function loadTableData(tableType) {
  try {
    // console.log(`📊 Loading data for table type: ${tableType}`);

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


    // console.log(`✅ Data loaded for ${tableType}: ${data.length} records`);

  } catch (error) {
    // console.error(`❌ Error loading data for ${tableType}:`, error);
    handleDataLoadError(error, tableType);
  }
}

/**
 * Fetch table data from server
 * @param {string} tableType - The table type to fetch
 * @returns {Promise<Array>} The fetched data
 */
async function fetchTableData(tableType) {
  try {
    const response = await fetch(`/api/v1/${tableType}/`);
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
}


/**
 * Create table body HTML from data
 * @param {Array} data - The table data
 * @param {Array} tableMapping - The table column mapping array
 * @param {string} tableType - The table type
 * @returns {string} The table body HTML
 */
function createTableBodyHTML(data, tableMapping, _tableType) {
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
}

/**
 * Format cell value based on column configuration
 * @param {*} value - The cell value
 * @param {Object} column - The column configuration
 * @returns {string} The formatted value
 */
function formatCellValue(value, column) {
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
}

/**
 * Apply sorting functionality to table
 * @param {string} tableType - The table type
 */
function applySortingFunctionality(_tableType) {
  // Sorting is handled by global sortTable function from main.js
  // console.log(`🔀 Sorting functionality applied to ${tableType} table`);
}

// ===== UTILITY FUNCTIONS =====

/**
 * Show loading state
 */
function showLoadingState() {
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
}

/**
 * Update table information display
 * @param {string} tableType - The table type
 * @param {number} recordCount - The number of records
 */
function updateTableInfo(tableType, recordCount) {
  // Update the count display in the section header
  const countElement = document.getElementById(`${tableType}Count`);
  if (countElement) {
    countElement.textContent = `${recordCount} רשומות`;
  }
}

/**
 * Filter table data
 * @param {string} searchTerm - The search term
 */
function filterTableData(searchTerm) {
  if (!searchTerm || !tableData[currentTableType]) {
    updateTableDisplay(tableData[currentTableType] || [], currentTableType);
    return;
  }

  const filteredData = tableData[currentTableType].filter(row => Object.values(row).some(value =>
    String(value).toLowerCase().includes(searchTerm.toLowerCase()),
  ));

  updateTableDisplay(filteredData, currentTableType);
}

/**
 * Format date value
 * @param {string} dateString - The date string
 * @returns {string} The formatted date
 */
function formatDate(dateString) {
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
  if (number === null || number === undefined) {return '';}
  return Number(number).toLocaleString('he-IL');
}

/**
 * Format currency value
 * @param {number} amount - The amount
 * @returns {string} The formatted currency
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined) {return '';}
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format status value
 * @param {string} status - The status
 * @returns {string} The formatted status
 */
function formatStatus(status) {
  if (!status) {return '';}

  const statusMap = {
    'active': 'פעיל',
    'inactive': 'לא פעיל',
    'pending': 'ממתין',
    'completed': 'הושלם',
    'cancelled': 'בוטל',
  };

  return statusMap[status] || status;
}

/**
 * Handle data load error
 * @param {Error} error - The error
 * @param {string} tableType - The table type
 */
function handleDataLoadError(error, tableType) {
  // console.error(`❌ Error loading ${tableType} data:`, error);

  // Show error notification
  if (window.showErrorNotification) {
    window.showErrorNotification(`שגיאה בטעינת נתוני ${tableType}`);
  }

  // Show error state in table
  if (currentTableType) {
    const containerId = `${currentTableType}Container`;
    const tableContainer = document.getElementById(containerId);
    if (tableContainer) {
      const tbody = tableContainer.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">' +
          `שגיאה בטעינת נתונים: ${error.message}</td></tr>`;
      }
    }
  }
}

/**
 * Toggle top section visibility
 */
function toggleTopSection() {
    if (typeof window.toggleTopSection === 'function') {
        window.toggleTopSection();
    } else {
        console.warn('toggleTopSection function not found');
    }
}

// toggleMainSection function removed - use toggleSection('main') instead

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
function sortTable(columnIndex, tableType) {
  if (!tableData[tableType] || tableData[tableType].length === 0) {
    return;
  }

  const data = [...tableData[tableType]];
  const tableMapping = window.TABLE_COLUMN_MAPPINGS?.[tableType];

  if (!tableMapping) {
    // console.error(`❌ No table mapping found for ${tableType}`);
    return;
  }

  // Get the field name for the column
  const fieldName = tableMapping[columnIndex];
  if (!fieldName) {
    // console.error(`❌ Invalid column index: ${columnIndex}`);
    return;
  }

  // Sort the data
  data.sort((a, b) => {
    const aVal = a[fieldName];
    const bVal = b[fieldName];

    if (aVal === null || aVal === undefined) {return 1;}
    if (bVal === null || bVal === undefined) {return -1;}

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal;
    }

    return String(aVal).localeCompare(String(bVal), 'he');
  });

  // Update the display with sorted data
  updateTableDisplay(data, tableType);
}

// ===== UTILITY FUNCTIONS =====

/**
 * Copy detailed log with all database information
 */
function copyDetailedLog() {
  try {
    let detailedLog = `=== בסיס נתונים - לוג מפורט ===\n`;
    detailedLog += `תאריך ושעה: ${new Date().toLocaleString('he-IL')}\n\n`;
    
    // Database summary
    const summaryStats = document.getElementById('summaryStats');
    if (summaryStats) {
      detailedLog += `=== סיכום נתונים ===\n`;
      const accounts = document.getElementById('accountsStats')?.textContent || '0';
      const trades = document.getElementById('tradesStats')?.textContent || '0';
      const tickers = document.getElementById('tickersStats')?.textContent || '0';
      const tradePlans = document.getElementById('tradePlansStats')?.textContent || '0';
      const alerts = document.getElementById('alertsStats')?.textContent || '0';
      
      detailedLog += `סה"כ חשבונות: ${accounts}\n`;
      detailedLog += `סה"כ טריידים: ${trades}\n`;
      detailedLog += `סה"כ טיקרים: ${tickers}\n`;
      detailedLog += `סה"כ תוכניות: ${tradePlans}\n`;
      detailedLog += `סה"כ התראות: ${alerts}\n\n`;
    }

    // Tables status
    detailedLog += `=== סטטוס טבלאות ===\n`;
    const tables = ['accounts', 'trades', 'tickers', 'trade_plans', 'executions', 'alerts', 'notes'];
    tables.forEach(tableType => {
      const count = document.getElementById(`${tableType}Count`)?.textContent || 'לא ידוע';
      detailedLog += `${tableType}: ${count}\n`;
    });

    // Current table data
    if (currentTableType && tableData[currentTableType]) {
      detailedLog += `\n=== טבלה פעילה: ${currentTableType} ===\n`;
      detailedLog += `מספר רשומות: ${tableData[currentTableType].length}\n`;
    }

    detailedLog += `\n=== סיום לוג ===`;

    // Copy to clipboard
    navigator.clipboard.writeText(detailedLog).then(() => {
      if (window.notifications && window.notifications.success) {
        window.notifications.success('לוג מפורט הועתק ללוח בהצלחה');
      }
    }).catch(err => {
      console.error('שגיאה בהעתקת לוג:', err);
      if (window.notifications && window.notifications.error) {
        window.notifications.error('שגיאה בהעתקת לוג מפורט');
      }
    });
  } catch (error) {
    console.error('שגיאה ביצירת לוג מפורט:', error);
    if (window.notifications && window.notifications.error) {
      window.notifications.error('שגיאה ביצירת לוג מפורט');
    }
  }
}

// ===== GLOBAL EXPORTS =====

// Export functions to global scope
window.initDatabaseDisplay = initDatabaseDisplay;
window.loadTableData = loadTableData;
window.filterTableData = filterTableData;
window.toggleTopSection = toggleTopSection;
// toggleMainSection export removed - use toggleSection('main') instead
window.addRecord = addRecord;
window.sortTable = sortTable;
window.copyDetailedLog = copyDetailedLog;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // console.log('➕ Database display page DOM loaded');
  initDatabaseDisplay();
});

// console.log('✅ DB Display script loaded successfully');

