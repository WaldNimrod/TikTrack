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
  window.Logger?.info('Initializing database display page', { page: 'db_display' });

  // Load all tables
  loadAllTables();

  window.Logger?.info('Database display page initialized successfully', { page: 'db_display' });
}

/**
 * Load all tables data
 */
async function loadAllTables() {
  window.Logger?.debug('Loading all tables', { page: 'db_display' });
  
  // API endpoints and their corresponding container IDs
  const tables = [
    { api: 'trading-accounts', container: 'accountsContainer' },
    { api: 'trades', container: 'tradesContainer' },
    { api: 'tickers', container: 'tickersContainer' },
    { api: 'trade-plans', container: 'tradePlansContainer' },
    { api: 'executions', container: 'executionsContainer' },
    { api: 'alerts', container: 'alertsContainer' },
    { api: 'notes', container: 'notesContainer' },
    { api: 'cash-flows', container: 'cashFlowsContainer' }
  ];
  
  totalRecords = 0;
  
  for (const table of tables) {
    try {
      window.Logger?.debug('Loading table', { page: 'db_display', api: table.api });
      await loadTableDataLocal(table.api, table.container);
    } catch (error) {
      window.Logger?.error('Error loading table', { page: 'db_display', api: table.api, error: error?.message || error });
    }
  }
  
  // Update summary stats
  updateSummaryStats();
  window.Logger?.info('All tables loaded', { page: 'db_display' });
}

// ===== DATA LOADING =====

/**
 * Load data for a specific table type
 * Uses centralized loadTableData from services package
 * @param {string} tableType - The table type to load (with dashes)
 * @param {string} containerId - The container ID for the table
 */
async function loadTableDataLocal(tableType, containerId) {
  try {
    window.Logger?.debug('Loading data for table type', { page: 'db_display', tableType });

    // Show loading state
    showLoadingState(tableType);

    // Use centralized loadTableData function from services package if available
    // Otherwise fallback to direct fetch
    let data = [];
    
    if (typeof window.loadTableData === 'function') {
      // Convert table type with dashes to table type without dashes for mapping
      const tableTypeNormalized = tableType.replace(/-/g, '_');
      try {
        data = await window.loadTableData(tableTypeNormalized, null, {
          tableId: getTableId(tableType),
          entityName: tableType,
          columns: 10 // Default column count for error display
        });
      } catch (err) {
        // If centralized function doesn't support this table type, fetch directly
        window.Logger?.debug('Centralized loadTableData failed, fetching directly', { 
          page: 'db_display', 
          tableType, 
          error: err?.message 
        });
        const response = await fetch(`/api/${tableType}/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        data = (result.status === 'success' && result.data) ? result.data : [];
      }
    } else {
      // Fallback to direct fetch if centralized function not available
      window.Logger?.warn('window.loadTableData not available, using direct fetch', { page: 'db_display', tableType });
      const response = await fetch(`/api/${tableType}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      data = (result.status === 'success' && result.data) ? result.data : [];
    }

    // Store data
    tableData[tableType] = Array.isArray(data) ? data : [];

    // Update table display using centralized system
    const tableTypeNormalized = tableType.replace(/-/g, '_');
    if (typeof window.updateTable === 'function') {
      window.updateTable(tableTypeNormalized, tableData[tableType]);
    } else {
      // Fallback to local function if centralized system not available
      updateTableDisplay(tableData[tableType], tableType, containerId);
    }

    // Update table info
    updateTableInfo(tableType, tableData[tableType].length);

    // Add to total records
    totalRecords += tableData[tableType].length;

    window.Logger?.debug('Data loaded for table type', { page: 'db_display', tableType, recordCount: tableData[tableType].length });

  } catch (error) {
    window.Logger?.error('Error loading data for table type', { page: 'db_display', tableType, error: error?.message || error });
    showErrorState(tableType, error.message);
  }
}

// REMOVED: fetchTableData - Use centralized window.loadTableData from services package instead

// ===== TABLE DISPLAY =====

/**
 * Update table display with data (FALLBACK - Use window.updateTable() instead)
 * @deprecated Use window.updateTable() from unified-table-system.js
 * @param {Array} data - The data to display
 * @param {string} tableType - The table type (with dashes)
 * @param {string} containerId - The container ID for the table
 */
function updateTableDisplay(data, tableType, containerId) {
  // Convert table type to section ID
  const sectionId = getSectionId(tableType);
  const tableId = getTableId(tableType);
  
  const tableContainer = document.getElementById(containerId);
  if (!tableContainer) {
    window.Logger?.error('Table container not found', { page: 'db_display', tableType, containerId });
    return;
  }

  const table = document.getElementById(tableId);
  if (!table) {
    window.Logger?.error('Table not found', { page: 'db_display', tableId });
    return;
  }

  const tbody = table.querySelector('tbody');
  if (!tbody) {
    window.Logger?.error('Table body not found', { page: 'db_display', tableId });
    return;
  }

  window.Logger?.debug('Updating table display (fallback)', { page: 'db_display', tableType, recordCount: data.length });

  // Create table headers from first data row
  const thead = table.querySelector('thead');
  if (thead && data.length > 0) {
    const headersHTML = createTableHeaders(data);
    thead.textContent = '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = headersHTML;
    while (tempDiv.firstChild) {
      thead.appendChild(tempDiv.firstChild);
    }
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
 * Create table headers from data (FALLBACK - Use UnifiedTableSystem instead)
 * @deprecated Use window.UnifiedTableSystem.renderer.render() instead
 * @param {Array} data - The table data
 * @returns {string} The table headers HTML
 */
function createTableHeaders(data) {
  if (data.length === 0) return '<tr><th>No data</th></tr>';
  const fields = Object.keys(data[0]);
  return '<tr>' + fields.map(f => `<th>${f}</th>`).join('') + '</tr>';
}

/**
 * Create table body HTML from data (FALLBACK - Use UnifiedTableSystem instead)
 * @deprecated Use window.UnifiedTableSystem.renderer.render() instead
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
    window.Logger?.debug('No count element found', { page: 'db_display', countElementId });
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
// REMOVED: window.loadTableData - conflicts with centralized loadTableData from services package
// Use loadTableDataLocal internally, or window.loadTableData directly if needed
window.loadDatabaseInfo = async function loadDatabaseInfo() {
  await loadAllTables();
};

if (typeof window.loadUserPreferences !== 'function') {
  window.loadUserPreferences = async function loadUserPreferencesFallback(options = {}) {
    if (window.PreferencesSystem?.initialize && !window.PreferencesSystem.initialized) {
      await window.PreferencesSystem.initialize();
    }
    return window.PreferencesSystem?.getAllPreferences?.() || true;
  };
}


// ===== INITIALIZATION =====

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.Logger?.info('Database display page DOM loaded', { page: 'db_display' });
  initDatabaseDisplay();
});

window.Logger?.info('DB Display script loaded successfully', { page: 'db_display' });
