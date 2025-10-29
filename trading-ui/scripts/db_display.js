/**
 * ========================================
 * DB Display - Database Display Page Management
 * ========================================
 *
 * This file contains all database display page functionality for the TikTrack application.
 * It handles displaying all database tables with raw data from the database.
 *
 * Dependencies:
 * - notification-system.js (for notifications)
 * - ui-utils.js (for toggleSection)
 *
 * File: trading-ui/scripts/db_display.js
 * Version: 2.0
 * Last Updated: January 22, 2025
 */

// ===== GLOBAL VARIABLES =====
const tableData = {};
let totalRecords = 0;

// ===== PAGE INITIALIZATION =====

/**
 * Initialize the database display page
 */
function initDatabaseDisplay() {
  console.log('🔄 Initializing database display page...');

  // Load all tables
  loadAllTables();

  console.log('✅ Database display page initialized successfully');
}

/**
 * Load all tables data
 */
async function loadAllTables() {
  console.log('🔄 Loading all tables...');
  
  // API endpoints - some use dashes, some use underscores
  const tables = [
    'trading-accounts',  // API uses dash
    'trades',
    'tickers', 
    'trade_plans',       // API uses underscore
    'executions',
    'alerts',            // Has SQL error - will show error state
    'notes',
    'cash_flows'         // API uses underscore
  ];
  
  totalRecords = 0;
  
  for (const table of tables) {
    try {
      console.log(`📊 Loading ${table}...`);
      await loadTableData(table);
    } catch (error) {
      console.error(`Error loading ${table}:`, error);
    }
  }
  
  // Update summary stats
  updateSummaryStats();
  console.log('✅ All tables loaded');
}

// ===== DATA LOADING =====

/**
 * Load data for a specific table type
 * @param {string} tableType - The table type to load (with dashes)
 */
async function loadTableData(tableType) {
  try {
    console.log(`📊 Loading data for table type: ${tableType}`);

    // Show loading state
    showLoadingState(tableType);

    // Fetch data from server
    const data = await fetchTableData(tableType);

    // Store data
    tableData[tableType] = data;

    // Update table display
    updateTableDisplay(data, tableType);

    // Update table info
    updateTableInfo(tableType, data.length);

    // Add to total records
    totalRecords += data.length;

    console.log(`✅ Data loaded for ${tableType}: ${data.length} records`);

  } catch (error) {
    console.error(`❌ Error loading data for ${tableType}:`, error);
    showErrorState(tableType, error.message);
  }
}

/**
 * Fetch table data from server
 * @param {string} tableType - The table type to fetch (with dashes)
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
 * @param {string} tableType - The table type (with dashes)
 */
function updateTableDisplay(data, tableType) {
  // Convert table type to section ID
  const sectionId = getSectionId(tableType);
  const containerId = getContainerId(tableType);
  const tableId = getTableId(tableType);
  
  const tableContainer = document.getElementById(containerId);
  if (!tableContainer) {
    console.error(`❌ Table container not found for ${tableType}: ${containerId}`);
    return;
  }

  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`❌ Table not found: ${tableId}`);
    return;
  }

  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.error(`❌ Table body not found in table ${tableId}`);
    return;
  }

  console.log(`🔧 Updating table display for ${tableType} with ${data.length} records`);

  // Create table headers from first data row
  const thead = table.querySelector('thead');
  if (thead && data.length > 0) {
    thead.innerHTML = createTableHeaders(data);
  }

  // Create table body HTML
  const tbodyHTML = createTableBodyHTML(data, tableType);

  // Update table body
  tbody.innerHTML = tbodyHTML;
}

/**
 * Get section ID from table type
 * @param {string} tableType - Table type with dashes
 * @returns {string} Section ID
 */
function getSectionId(tableType) {
  const mapping = {
    'trading-accounts': 'accountsSection',
    'trades': 'tradesSection',
    'tickers': 'tickersSection',
    'trade-plans': 'tradePlansSection',
    'executions': 'executionsSection',
    'alerts': 'alertsSection',
    'notes': 'notesSection',
    'cash-flows': 'cashFlowsSection'
  };
  return mapping[tableType] || tableType + 'Section';
}

/**
 * Get container ID from table type
 * @param {string} tableType - Table type with dashes
 * @returns {string} Container ID
 */
function getContainerId(tableType) {
  const mapping = {
    'trading-accounts': 'accountsContainer',
    'trades': 'tradesContainer',
    'tickers': 'tickersContainer',
    'trade-plans': 'tradePlansContainer',
    'executions': 'executionsContainer',
    'alerts': 'alertsContainer',
    'notes': 'notesContainer',
    'cash-flows': 'cashFlowsContainer'
  };
  return mapping[tableType] || tableType + 'Container';
}

/**
 * Get table ID from table type
 * @param {string} tableType - Table type with dashes
 * @returns {string} Table ID
 */
function getTableId(tableType) {
  const mapping = {
    'trading-accounts': 'accountsTable',
    'trades': 'tradesTable',
    'tickers': 'tickersTable',
    'trade-plans': 'tradePlansTable',
    'executions': 'executionsTable',
    'alerts': 'alertsTable',
    'notes': 'notesTable',
    'cash-flows': 'cashFlowsTable'
  };
  return mapping[tableType] || tableType + 'Table';
}


/**
 * Create table headers from data
 * @param {Array} data - The table data
 * @returns {string} The table headers HTML
 */
function createTableHeaders(data) {
  if (data.length === 0) return '<tr><th>No data</th></tr>';
  const fields = Object.keys(data[0]);
  return '<tr>' + fields.map(f => `<th>${f}</th>`).join('') + '</tr>';
}

/**
 * Create table body HTML from data
 * @param {Array} data - The table data
 * @param {string} tableType - The table type
 * @returns {string} The table body HTML
 */
function createTableBodyHTML(data, tableType) {
  if (data.length === 0) {
    return '<tr><td colspan="100" class="text-center">No data</td></tr>';
  }
  
  // Get all fields from first record
  const fields = Object.keys(data[0]);
  
  let html = '';
  data.forEach(row => {
    html += '<tr>';
    fields.forEach(field => {
      const value = row[field] || '';
      html += `<td>${value}</td>`;
    });
    html += '</tr>';
  });
  return html;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Show loading state for a specific table
 * @param {string} tableType - The table type
 */
function showLoadingState(tableType) {
  const containerId = getContainerId(tableType);
  const tableContainer = document.getElementById(containerId);
  if (tableContainer) {
    const tbody = tableContainer.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="100" class="text-center">Loading data...</td></tr>';
    }
  }
}

/**
 * Show error state for a specific table
 * @param {string} tableType - The table type
 * @param {string} errorMessage - The error message
 */
function showErrorState(tableType, errorMessage) {
  const containerId = getContainerId(tableType);
  const tableContainer = document.getElementById(containerId);
  if (tableContainer) {
    const tbody = tableContainer.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="100" class="text-center text-danger">Error: ${errorMessage}</td></tr>`;
    }
  }
}

/**
 * Update table information display
 * @param {string} tableType - The table type (with dashes)
 * @param {number} recordCount - The number of records
 */
function updateTableInfo(tableType, recordCount) {
  // Convert table type to count element ID
  const countElementId = getCountElementId(tableType);
  const countElement = document.getElementById(countElementId);
  if (countElement) {
    countElement.textContent = `${recordCount} records`;
  } else {
    console.log(`ℹ️ No count element found for ${countElementId}`);
  }
}

/**
 * Get count element ID from table type
 * @param {string} tableType - Table type with dashes
 * @returns {string} Count element ID
 */
function getCountElementId(tableType) {
  const mapping = {
    'trading-accounts': 'accountsCount',
    'trades': 'tradesCount',
    'tickers': 'tickersCount',
    'trade-plans': 'tradePlansCount',
    'executions': 'executionsCount',
    'alerts': 'alertsCount',
    'notes': 'notesCount',
    'cash-flows': 'cashFlowsCount'
  };
  return mapping[tableType] || tableType + 'Count';
}

/**
 * Update summary statistics in top section
 */
function updateSummaryStats() {
  const totalTablesElement = document.getElementById('totalTables');
  const totalRecordsElement = document.getElementById('totalRecords');
  const lastUpdateElement = document.getElementById('lastUpdate');
  
  if (totalTablesElement) {
    totalTablesElement.textContent = Object.keys(tableData).length;
  }
  
  if (totalRecordsElement) {
    totalRecordsElement.textContent = totalRecords;
  }
  
  if (lastUpdateElement) {
    lastUpdateElement.textContent = new Date().toLocaleString('he-IL');
  }
}

// ===== GLOBAL EXPORTS =====

// Export functions to global scope
window.initDatabaseDisplay = initDatabaseDisplay;
window.loadTableData = loadTableData;


// ===== INITIALIZATION =====

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('➕ Database display page DOM loaded');
  initDatabaseDisplay();
});

console.log('✅ DB Display script loaded successfully');
