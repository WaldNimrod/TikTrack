/**
 * Database Extra Data Display System
 * מערכת תצוגת טבלאות עזר במסד נתונים
 *
 * This script handles the display of extra database tables
 * in a structured, user-friendly format similar to db_display.js
 *
 * @author TikTrack System
 * @version 1.0.0
 * @lastUpdated October 30, 2025
 * @since 2025-10-30
 */

// ===== GLOBAL VARIABLES =====
let totalRecords = 0;
let tableData = {};

// ===== INITIALIZATION =====

/**
 * Initialize the database extra data display page
 */
function initDatabaseExtraData() {
  window.Logger?.info('Initializing database extra data page', { page: 'db_extradata' });
  
  // Load all tables
  loadAllTables();
  
  window.Logger?.info('Database extra data page initialized successfully', { page: 'db_extradata' });
}

/**
 * Load all extra data tables
 */
async function loadAllTables() {
  window.Logger?.debug('Loading all extra data tables', { page: 'db_extradata' });
  
  // API endpoints and their corresponding container IDs
  const tables = [
    { type: 'constraints', apiSlug: 'constraints', container: 'constraintsContainer' },
    { type: 'currencies', apiSlug: 'currencies', container: 'currenciesContainer' },
    { type: 'preference_groups', apiSlug: 'preference-groups', container: 'preferenceGroupsContainer' },
    { type: 'system_setting_groups', apiSlug: 'system-setting-groups', container: 'systemSettingGroupsContainer' },
    { type: 'external_data_providers', apiSlug: 'external-data-providers', container: 'externalDataProvidersContainer' },
    { type: 'quotes_last', apiSlug: 'quotes-last', container: 'quotesLastContainer' },
    { type: 'plan_conditions', apiSlug: 'plan-conditions', container: 'planConditionsContainer' },
    { type: 'user_preferences', apiSlug: 'user-preferences', container: 'userPreferencesContainer' }
  ];
  
  totalRecords = 0;
  
  for (const table of tables) {
    try {
      window.Logger?.debug('Loading table', { page: 'db_extradata', type: table.type, apiSlug: table.apiSlug });
      await loadTableData(table.type, table.apiSlug, table.container);
    } catch (error) {
      const identifier = table.apiSlug || table.type;
      window.Logger?.error('Error loading table', { page: 'db_extradata', identifier, error: error?.message || error });
    }
  }
  
  // Update summary stats
  updateSummaryStats();
  window.Logger?.info('All extra data tables loaded', { page: 'db_extradata' });
}

// ===== DATA LOADING =====

/**
 * Load data for a specific table type
 * @param {string} tableType - The table type to load
 * @param {string} containerId - The container ID for the table
 */
async function loadTableData(tableType, apiSlug, containerId) {
  try {
    window.Logger?.debug('Loading data for table type', { page: 'db_extradata', tableType });

    // Show loading state
    showLoadingState(tableType);

    // Fetch data from server
    const data = await fetchTableData(apiSlug);

    // Store data
    tableData[tableType] = data;

    // Update table display
    updateTableDisplay(data, tableType, containerId);

    // Update table info
    updateTableInfo(tableType, data.length);

    // Add to total records
    totalRecords += data.length;

    window.Logger?.debug('Data loaded for table type', { page: 'db_extradata', tableType, recordCount: data.length });

  } catch (error) {
    const identifier = apiSlug || tableType;
    window.Logger?.error('Error loading table data', { page: 'db_extradata', identifier, error: error?.message || error });
    // Show error state
    updateTableDisplay([], tableType, containerId);
    updateTableInfo(tableType, 0);
  }
}

/**
 * Fetch table data from server
 * @param {string} tableType - The table type to fetch
 * @returns {Array} The table data
 */
async function fetchTableData(apiSlug) {
  window.Logger?.debug('Fetching data from API', { page: 'db_extradata', apiSlug, url: `/api/${apiSlug}/` });
  
  const response = await fetch(`/api/${apiSlug}/`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  window.Logger?.debug('Received response', { page: 'db_extradata', apiSlug, result });
  
  if (result.data && Array.isArray(result.data)) {
    return result.data;
  } else {
    window.Logger?.warn('No data array found in response', { page: 'db_extradata', apiSlug });
    return [];
  }
}

/**
 * Show loading state for a table
 * @param {string} tableType - The table type
 */
function showLoadingState(tableType) {
  const containerId = getContainerId(tableType);
  const tableContainer = document.getElementById(containerId);
  if (tableContainer) {
    const tbody = tableContainer.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="100" class="text-center text-muted">Loading data...</td></tr>';
    }
  }
}

/**
 * Show error state for a table
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

// ===== TABLE DISPLAY =====

/**
 * Update table display with data
 * @param {Array} data - The data to display
 * @param {string} tableType - The table type
 * @param {string} containerId - The container ID for the table
 */
function updateTableDisplay(data, tableType, containerId) {
  // Convert table type to section ID
  const sectionId = getSectionId(tableType);
  const tableId = getTableId(tableType);
  
  const tableContainer = document.getElementById(containerId);
  if (!tableContainer) {
    window.Logger?.error('Table container not found', { page: 'db_extradata', tableType, containerId });
    return;
  }

  const table = document.getElementById(tableId);
  if (!table) {
    window.Logger?.error('Table not found', { page: 'db_extradata', tableId });
    return;
  }

  const tbody = table.querySelector('tbody');
  if (!tbody) {
    window.Logger?.error('Table body not found', { page: 'db_extradata', tableId });
    return;
  }

  window.Logger?.debug('Updating table display', { page: 'db_extradata', tableType, recordCount: data.length });

  // Create table headers from first data row
  const thead = table.querySelector('thead');
  if (thead && data.length > 0) {
    const headers = createTableHeaders(data);
    thead.innerHTML = headers;
  }

  // Create table rows
  const rows = createTableRows(data);
  tbody.innerHTML = rows;

  // Update table count
  // Count indicator handled by updateTableInfo()
}

/**
 * Create table headers from data
 * @param {Array} data - The table data
 * @returns {string} HTML for table headers
 */
function createTableHeaders(data) {
  if (data.length === 0) return '<tr><th>No data</th></tr>';
  
  const firstRow = data[0];
  const headers = Object.keys(firstRow);
  
  const headerCells = headers.map(header => 
    `<th>${header}</th>`
  ).join('');
  
  return `<tr>${headerCells}</tr>`;
}

/**
 * Create table rows from data
 * @param {Array} data - The table data
 * @returns {string} HTML for table rows
 */
function createTableRows(data) {
  if (data.length === 0) {
    return '<tr><td colspan="100" class="text-center text-muted">No data available</td></tr>';
  }
  
  return data.map(row => {
    const cells = Object.values(row).map(value => 
      `<td>${formatCellValue(value)}</td>`
    ).join('');
    
    return `<tr>${cells}</tr>`;
  }).join('');
}

/**
 * Format cell value for display
 * @param {*} value - The cell value
 * @returns {string} Formatted value
 */
function formatCellValue(value) {
  if (value === null || value === undefined) {
    return '<span class="text-muted">-</span>';
  }
  
  if (typeof value === 'boolean') {
    return value ? '✓' : '✗';
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  if (typeof value === 'string' && value.length > 50) {
    return `<span title="${value}">${value.substring(0, 50)}...</span>`;
  }
  
  return String(value);
}

/**
 * Update table information display
 * @param {string} tableType - The table type
 * @param {number} recordCount - The number of records
 */
function updateTableInfo(tableType, recordCount) {
  // Convert table type to count element ID
  const countElementId = getCountElementId(tableType);
  const countElement = document.getElementById(countElementId);
  if (countElement) {
    countElement.textContent = `${recordCount} records`;
  } else {
    window.Logger?.debug('No count element found', { page: 'db_extradata', countElementId });
  }
}

/**
 * Get count element ID from table type
 * @param {string} tableType - Table type
 * @returns {string} Count element ID
 */
function getCountElementId(tableType) {
  const mapping = {
    'constraints': 'constraintsCount',
    'currencies': 'currenciesCount',
    'preference_groups': 'preferenceGroupsCount',
    'system_setting_groups': 'systemSettingGroupsCount',
    'external_data_providers': 'externalDataProvidersCount',
    'quotes_last': 'quotesLastCount',
    'plan_conditions': 'planConditionsCount',
    'user_preferences': 'userPreferencesCount'
  };
  return mapping[tableType] || tableType + 'Count';
}

/**
 * Update summary statistics in top section
 */
function updateSummaryStats() {
  const totalTablesElement = document.getElementById('totalExtraTables');
  const totalRecordsElement = document.getElementById('totalExtraRecords');
  const dataSizeElement = document.getElementById('extraDataSize');
  const lastUpdateElement = document.getElementById('extraLastUpdate');
  
  if (totalTablesElement) {
    totalTablesElement.textContent = '8';
  }
  
  if (totalRecordsElement) {
    totalRecordsElement.textContent = totalRecords.toLocaleString();
  }
  
  if (dataSizeElement) {
    // Estimate data size (rough calculation)
    const estimatedSize = Math.round(totalRecords * 0.5); // 0.5KB per record estimate
    dataSizeElement.textContent = `${estimatedSize} KB`;
  }
  
  if (lastUpdateElement) {
    lastUpdateElement.textContent = new Date().toLocaleString('he-IL');
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get section ID from table type
 * @param {string} tableType - Table type
 * @returns {string} Section ID
 */
function getSectionId(tableType) {
  const mapping = {
    'constraints': 'constraintsSection',
    'currencies': 'currenciesSection',
    'preference_groups': 'preferenceGroupsSection',
    'system_setting_groups': 'systemSettingGroupsSection',
    'external_data_providers': 'externalDataProvidersSection',
    'quotes_last': 'quotesLastSection',
    'plan_conditions': 'planConditionsSection',
    'user_preferences': 'userPreferencesSection'
  };
  return mapping[tableType] || tableType + 'Section';
}

/**
 * Get container ID from table type
 * @param {string} tableType - Table type
 * @returns {string} Container ID
 */
function getContainerId(tableType) {
  const mapping = {
    'constraints': 'constraintsContainer',
    'currencies': 'currenciesContainer',
    'preference_groups': 'preferenceGroupsContainer',
    'system_setting_groups': 'systemSettingGroupsContainer',
    'external_data_providers': 'externalDataProvidersContainer',
    'quotes_last': 'quotesLastContainer',
    'plan_conditions': 'planConditionsContainer',
    'user_preferences': 'userPreferencesContainer'
  };
  return mapping[tableType] || tableType + 'Container';
}

/**
 * Get table ID from table type
 * @param {string} tableType - Table type
 * @returns {string} Table ID
 */
function getTableId(tableType) {
  const mapping = {
    'constraints': 'constraintsTable',
    'currencies': 'currenciesTable',
    'preference_groups': 'preferenceGroupsTable',
    'system_setting_groups': 'systemSettingGroupsTable',
    'external_data_providers': 'externalDataProvidersTable',
    'quotes_last': 'quotesLastTable',
    'plan_conditions': 'planConditionsTable',
    'user_preferences': 'userPreferencesTable'
  };
  return mapping[tableType] || tableType + 'Table';
}

// ===== EVENT LISTENERS =====

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.Logger?.info('Database extra data page DOM loaded', { page: 'db_extradata' });
  
  // Initialize the page
  initDatabaseExtraData();
});

// Export for global access
window.initDatabaseExtraData = initDatabaseExtraData;
// toggleSection removed - using global version from ui-utils.js
window.loadExtraData = async function loadExtraData() {
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

window.Logger?.info('DB Extra Data script loaded successfully', { page: 'db_extradata' });
