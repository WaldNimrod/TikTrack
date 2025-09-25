/**
 * ========================================
 * DB Display - Database Display Page Management
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
 * File: trading-ui/scripts/db_display.js
 * Version: 1.0
 * Last Updated: September 1, 2025
 */

// ===== GLOBAL VARIABLES =====
let currentTableType = 'accounts'; // Default table type
const tableData = {};

// ===== PAGE INITIALIZATION =====

/**
 * Initialize the database display page
 */
function initDatabaseDisplay() {
  console.log('🔄 Initializing database display page...');

  // Load all tables
  loadAllTables();

  // Set up event listeners
  setupEventListeners();

  // Initialize header system
  if (window.headerSystem) {
    window.headerSystem.init();
  }

  console.log('✅ Database display page initialized successfully');
}

/**
 * Load all tables data
 */
async function loadAllTables() {
  console.log('🔄 Loading all tables...');
  const tables = ['accounts', 'trades', 'tickers', 'trade_plans', 'executions', 'alerts', 'notes', 'cash_flows'];
  
  for (const table of tables) {
    try {
      console.log(`📊 Loading ${table}...`);
      await loadTableData(table);
    } catch (error) {
      console.error(`Error loading ${table}:`, error);
    }
  }
  console.log('✅ All tables loaded');
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
    console.log(`📊 Loading data for table type: ${tableType}`);

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

    // Update summary statistics
    updateSummaryStats(tableType, data.length);

    console.log(`✅ Data loaded for ${tableType}: ${data.length} records`);

  } catch (error) {
    console.error(`❌ Error loading data for ${tableType}:`, error);
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
    console.log(`🌐 Fetching data for ${tableType} from /api/${tableType}/`);
    const response = await fetch(`/api/${tableType}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`📥 Received response for ${tableType}:`, result);

    if (result.status === 'success') {
      return result.data || [];
    } else {
      throw new Error(result.error?.message || `Error fetching ${tableType} data`);
    }
  } catch (error) {
    console.error(`❌ Error fetching ${tableType} data:`, error);
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
  let containerId = `${tableType}Container`;
  
  // Handle special cases for container IDs
  if (tableType === 'trade_plans') {
    containerId = 'tradePlansContainer';
  } else if (tableType === 'cash_flows') {
    containerId = 'cashFlowsContainer';
  }
  
  const tableContainer = document.getElementById(containerId);

  if (!tableContainer) {
    console.error(`❌ Table container not found for ${tableType}: ${containerId}`);
    return;
  }

  // Find the table within the container
  const table = tableContainer.querySelector('table');
  if (!table) {
    console.error(`❌ Table not found in container ${containerId}`);
    return;
  }

  // Find the table body
  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.error(`❌ Table body not found in table ${tableType}`);
    return;
  }

  // Get table mappings
  const tableMapping = window.TABLE_COLUMN_MAPPINGS?.[tableType];
  if (!tableMapping) {
    console.error(`❌ No table mapping found for ${tableType}`);
    return;
  }

  console.log(`🔧 Updating table display for ${tableType} with ${data.length} records`);

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
function createTableBodyHTML(data, tableMapping, tableType) {
  let tbodyHTML = '';

  console.log(`🔨 Creating table body HTML for ${tableType} with ${data.length} records`);

  if (data.length === 0) {
    tbodyHTML += `<tr><td colspan="${tableMapping.length + 1}" class="text-center">אין נתונים</td></tr>`;
  } else {
    data.forEach((row, index) => {
      if (index < 3) { // Log first 3 rows for debugging
        console.log(`📋 Row ${index} for ${tableType}:`, row);
      }
      tbodyHTML += '<tr>';
      tableMapping.forEach(fieldName => {
        const value = row[fieldName] || '';
        const formattedValue = formatCellValue(value, { field: fieldName });
        tbodyHTML += `<td>${formattedValue}</td>`;
      });
      
      // Add actions column
      const actionsHTML = createActionsHTML(row, tableType);
      tbodyHTML += `<td class="actions-cell">${actionsHTML}</td>`;
      
      tbodyHTML += '</tr>';
    });
  }

  console.log(`✅ Created table body HTML for ${tableType}: ${tbodyHTML.length} characters`);
  return tbodyHTML;
}

/**
 * Create actions HTML for a table row
 * @param {Object} row - The row data
 * @param {string} tableType - The table type
 * @returns {string} The actions HTML
 */
function createActionsHTML(row, tableType) {
  const recordId = row.id || row.ID || '';
  if (!recordId) {
    return '<span class="text-muted">-</span>';
  }

  return `
    <div class="action-buttons">
      <button class="btn btn-sm btn-outline-primary" onclick="editRecord('${tableType}', ${recordId})" title="ערוך">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger" onclick="deleteRecord('${tableType}', ${recordId})" title="מחק">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
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
    let containerId = `${currentTableType}Container`;
    
    // Handle special cases for container IDs
    if (currentTableType === 'trade_plans') {
      containerId = 'tradePlansContainer';
    } else if (currentTableType === 'cash_flows') {
      containerId = 'cashFlowsContainer';
    }
    
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
  let countElementId = `${tableType}Count`;
  
  // Handle special cases for count element IDs
  if (tableType === 'trade_plans') {
    countElementId = 'tradePlansCount';
  } else if (tableType === 'cash_flows') {
    countElementId = 'cashFlowsCount';
  }
  
  const countElement = document.getElementById(countElementId);
  if (countElement) {
    countElement.textContent = `${recordCount} רשומות`;
  } else {
    console.log(`ℹ️ No count element found for ${countElementId}`);
  }
}

/**
 * Update summary statistics
 * @param {string} tableType - The table type
 * @param {number} recordCount - The number of records
 */
function updateSummaryStats(tableType, recordCount) {
  // Map table types to their display names
  const statsMapping = {
    'accounts': 'accountsStats',
    'trades': 'tradesStats',
    'tickers': 'tickersStats',
    'trade_plans': 'tradePlansStats',
    'alerts': 'alertsStats',
    'cash_flows': 'cashFlowsStats'
  };

  const statsElementId = statsMapping[tableType];
  if (statsElementId) {
    const statsElement = document.getElementById(statsElementId);
    if (statsElement) {
      statsElement.textContent = recordCount;
      console.log(`📊 Updated stats for ${tableType}: ${recordCount} records`);
    } else {
      console.log(`ℹ️ No stats element found for ${statsElementId}`);
    }
  } else {
    console.log(`ℹ️ No stats mapping found for ${tableType}`);
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
    let containerId = `${currentTableType}Container`;
    
    // Handle special cases for container IDs
    if (currentTableType === 'trade_plans') {
      containerId = 'tradePlansContainer';
    } else if (currentTableType === 'cash_flows') {
      containerId = 'cashFlowsContainer';
    }
    
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

/**
 * Toggle main section visibility
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

// ===== ACTION FUNCTIONS =====

/**
 * Edit a record
 * @param {string} tableType - The table type
 * @param {number} recordId - The record ID
 */
function editRecord(tableType, recordId) {
  console.log(`✏️ Edit record: ${tableType} ID ${recordId}`);
  // TODO: Implement edit functionality
  if (typeof showNotification === 'function') {
    showNotification(`עריכת רשומה: ${tableType} ID ${recordId}`, 'info');
  } else {
    alert(`עריכת רשומה: ${tableType} ID ${recordId}`);
  }
}

/**
 * Delete a record
 * @param {string} tableType - The table type
 * @param {number} recordId - The record ID
 */
function deleteRecord(tableType, recordId) {
  console.log(`🗑️ Delete record: ${tableType} ID ${recordId}`);
  if (typeof showConfirmationDialog === 'function') {
    showConfirmationDialog(
      `האם אתה בטוח שברצונך למחוק את הרשומה ${recordId}?`,
      () => {
        // TODO: Implement delete functionality
        if (typeof showNotification === 'function') {
          showNotification(`מחיקת רשומה: ${tableType} ID ${recordId}`, 'info');
        } else {
          alert(`מחיקת רשומה: ${tableType} ID ${recordId}`);
        }
      },
      null,
      'מחיקת רשומה',
      'מחק',
      'ביטול'
    );
  } else if (confirm(`האם אתה בטוח שברצונך למחוק את הרשומה ${recordId}?`)) {
    // TODO: Implement delete functionality
    if (typeof showNotification === 'function') {
      showNotification(`מחיקת רשומה: ${tableType} ID ${recordId}`, 'info');
    } else {
      alert(`מחיקת רשומה: ${tableType} ID ${recordId}`);
    }
  }
}


/**
 * Copy detailed log with all data and status
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
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
// window.copyDetailedLog export removed - using global version from system-management.js

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('➕ Database display page DOM loaded');
  initDatabaseDisplay();
});

// console.log('✅ DB Display script loaded successfully');
