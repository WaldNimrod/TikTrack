/**
 * Grid Table Core Functions Module
 * מודול פונקציות ליבת הגריד - משותף לכל הדפים
 * 
 * This module provides the core grid functionality for the TikTrack application.
 * It handles grid initialization, column definitions, filtering, and user interactions.
 * 
 * Features:
 * - AG-Grid integration and configuration
 * - Column definitions and formatting
 * - Filtering and sorting capabilities
 * - User interaction handlers
 * - Data export functionality
 * - Responsive design support
 * 
 * Dependencies:
 * - AG-Grid Community Edition
 * - grid-data.js for data management
 * - grid-filters.js for advanced filtering
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-16
 * 
 * 🚨 CRITICAL REMINDERS:
 * - ALWAYS start with: cd Backend && ./run_monitored.sh
 * - ALWAYS check health: curl http://localhost:8080/api/health
 * - NEVER write routes directly in app.py - use blueprints only!
 * - ALWAYS follow architecture: Models → Services → Routes → App
 * - ALWAYS use port 8080
 * - ALWAYS test all CRUD operations: GET, POST, PUT, DELETE
 */

// ===== GRID CORE FUNCTIONS =====
// קובץ ייעודי ללוגיקת הגריד הבסיסית - משותף לכל הדפים

/**
 * Global variables for grid state management
 * 
 * These variables maintain the current state of the grid across
 * different pages and user interactions.
 */
window.gridApi = null;        // AG-Grid API instance
let externalFilterPresent = false;  // Flag for external filter state

/**
 * Get default column definitions for the trading grid
 * 
 * This function returns the standard column configuration for the
 * trading data grid. Each column includes formatting, filtering,
 * and interaction capabilities.
 * 
 * Column structure:
 * - Action: Quick action buttons
 * - Status: Current trade status with color coding
 * - Current: Current price with change indicators
 * - Stop: Stop loss level
 * - Target: Profit target level
 * - Amount: Investment amount and share count
 * - Type: Trading strategy type
 * - Date: Trade date
 * - Ticker: Asset symbol with clickable link
 * - Account: Trading account name
 * 
 * @returns {Array} Array of column definition objects
 */
const getDefaultColumnDefs = () => [
  { 
    headerName: "המרה", 
    field: "action", 
    width: 60,
    minWidth: 50,
    maxWidth: 80,
    cellRenderer: params => `<span style="cursor: pointer; font-size: 1.2rem;">${params.value}</span>`
  },
  { 
    headerName: "סטטוס", 
    field: "status", 
    width: 80,
    minWidth: 70,
    maxWidth: 100, 
    cellClass: params => `badge-status ${params.value}`,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual'],
      defaultOption: 'equals'
    }
  },
  { 
    headerName: "נוכחי", 
    field: "current", 
    width: 120,
    minWidth: 100,
    maxWidth: 150, 
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : '' 
  },
  { 
    headerName: "סטופ", 
    field: "stop", 
    width: 120,
    minWidth: 100,
    maxWidth: 150, 
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : '' 
  },
  { 
    headerName: "יעד", 
    field: "target", 
    width: 120,
    minWidth: 100,
    maxWidth: 150, 
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : '' 
  },
  { 
    headerName: "סכום/כמות", 
    field: "amount", 
    width: 140,
    minWidth: 120,
    maxWidth: 180,
    flex: 1
  },
  { 
    headerName: "סוג", 
    field: "type", 
    width: 80,
    minWidth: 70,
    maxWidth: 100, 
    cellClass: params => `badge-type ${params.value}`
  },
  { 
    headerName: "תאריך", 
    field: "date", 
    width: 100,
    minWidth: 90,
    maxWidth: 120
  },
  {
    headerName: "נכס",
    field: "ticker",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    cellRenderer: params => {
      return `<a href="#" onclick="openPlanDetails('${params.value}'); return false;" style="color: #0077cc; text-decoration: underline;">${params.value}</a>`;
    }
  },
  { 
    headerName: "חשבון", 
    field: "account", 
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual'],
      defaultOption: 'equals'
    },
    cellRenderer: params => {
      const value = params.value || 'N/A';
      return `<span style="font-weight: 500; color: #29a6a8;">${value}</span>`;
    }
  }
];

/**
 * Get default grid options for the trading grid
 * 
 * This function returns the standard grid configuration for the
 * trading data grid. It includes column definitions, theme, default
 * column properties, and external filter handling.
 * 
 * @param {Array} rowData - Initial data for the grid
 * @returns {Object} Grid options object
 */
const getDefaultGridOptions = (rowData = []) => ({
  columnDefs: getDefaultColumnDefs(),
  rowData: rowData,
  theme: 'legacy',
  defaultColDef: {
    sortable: true,
    filter: false,
    resizable: true,
    wrapText: true,
    autoHeight: true,
    cellStyle: { 
      textAlign: 'center', 
      direction: 'rtl', 
      padding: '4px', 
      fontSize: '0.85rem', 
      lineHeight: '1.4' 
    },
    headerClass: 'ag-header-center',
    floatingFilter: false,
    suppressSizeToFit: false
  },
  isExternalFilterPresent: isExternalFilterPresent,
  doesExternalFilterPass: doesExternalFilterPass,
  onGridReady: onGridReady
});

/**
 * Check if external filter is present
 * 
 * This function returns true if an external filter is currently applied
 * to the grid.
 * 
 * @returns {boolean} True if external filter is present
 */
function isExternalFilterPresent() {
  return externalFilterPresent;
}

/**
 * Check if external filter passes for a given node
 * 
 * This function checks if a given node passes the external filter criteria.
 * 
 * @param {Object} node - The node to check
 * @returns {boolean} True if the node passes the filter
 */
function doesExternalFilterPass(node) {
  // The external filter is handled by applyStatusFilterToGrid
  // This function remains unchanged from the previous code block
  return true;
}

/**
 * Create a grid instance
 * 
 * This function creates an AG-Grid instance in the specified container.
 * It uses the grid options provided to configure the grid.
 * 
 * @param {string} containerId - ID of the container element
 * @param {Array} rowData - Initial data for the grid
 * @param {Object} customOptions - Custom grid options
 * @returns {Object} Grid options object
 */
function createGrid(containerId, rowData = [], customOptions = {}) {
  console.log('Creating grid in container:', containerId);
  
  const gridDiv = document.querySelector(containerId);
  if (!gridDiv) {
    console.error('Grid container not found:', containerId);
    return null;
  }
  
  // Check if grid already exists in the container
  if (gridDiv.children.length > 0 && gridDiv.querySelector('.ag-root')) {
    console.log('Grid already exists in container, skipping creation');
    return null;
  }
  
  // Check if agGrid is loaded
  if (typeof agGrid === 'undefined') {
    console.error('agGrid is not loaded!');
    return null;
  }
  
  // Check if custom column definitions are provided
  let gridOptions;
  if (window.getPageColumnDefs) {
    // Use page-specific column definitions
    console.log('Using page-specific column definitions');
    const pageColumnDefs = window.getPageColumnDefs();
    console.log('Page column definitions:', pageColumnDefs);
    gridOptions = {
      ...getDefaultGridOptions(rowData),
      columnDefs: pageColumnDefs,
      ...customOptions
    };
  } else if (window.getPageGridOptions) {
    // Use page-specific grid options
    console.log('Using page-specific grid options');
    gridOptions = {
      ...window.getPageGridOptions(rowData),
      ...customOptions
    };
  } else {
    // Use default grid options
    console.log('Using default grid options');
    gridOptions = {
      ...getDefaultGridOptions(rowData),
      ...customOptions
    };
  }
  
  try {
    console.log('Creating grid with options:', gridOptions);
    agGrid.createGrid(gridDiv, gridOptions);
    console.log('Grid created successfully');
    return gridOptions;
  } catch (error) {
    console.error('Error creating grid:', error);
    return null;
  }
}

/**
 * Initialize grid on ready
 * 
 * This function is called when the grid is ready to be initialized.
 * It sets up the grid API, handles size adjustments, updates status,
 * loads data, and applies filters.
 * 
 * @param {Object} params - Grid API parameters
 */
function onGridReady(params) {
  // Check if grid is already initialized
  if (window.gridApi) {
    console.log('Grid already initialized, skipping onGridReady');
    return;
  }
  
  gridApi = params.api;
  window.gridApi = params.api;
  console.log('Grid API available:', !!gridApi);
  
  // Adjust grid size to fit the screen
  params.api.sizeColumnsToFit();
  
  // Update grid on window resize
  window.addEventListener('resize', () => {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 100);
  });
  
  // Update status
  updateGridStatus();
  
  // Load trades from server if this is a grid test page
  if (window.location.pathname.includes('grid-test')) {
    console.log('Grid test page detected, loading trades...');
    if (typeof loadDataByType === 'function') {
      loadDataByType('trades').then(data => {
        console.log('Trades loaded for grid test:', data);
        // Update grid with new data
        if (window.gridApi && data) {
          window.gridApi.setGridOption('rowData', data);
          console.log('Grid updated with trades data');
        }
      }).catch(error => {
        console.error('Error loading trades for grid test:', error);
      });
    }
  }
  
  // Check if there's a pending filter
  if (window.pendingFilter) {
    console.log('Applying pending filter:', window.pendingFilter);
          if (typeof applyStatusFilterToGrid === 'function') {
        applyStatusFilterToGrid(window.pendingFilter, window.pendingAccountFilter);
      } else {
        console.log('applyStatusFilterToGrid not available yet, will apply later');
      }
    delete window.pendingFilter;
  } else {
          // Default: open only
      console.log('No saved filter, applying default filter: פתוח');
      if (typeof applyStatusFilterToGrid === 'function') {
        applyStatusFilterToGrid(['פתוח'], null);
      } else {
        console.log('applyStatusFilterToGrid not available yet, will apply later');
      }
  }
  
  // Update summary statistics based on displayed data
  setTimeout(() => {
    if (window.updateSummaryStats) {
      updateSummaryStats();
    }
    
    // Check if applyStatusFilterToGrid is available now
    if (typeof applyStatusFilterToGrid === 'function') {
      console.log('applyStatusFilterToGrid is now available, applying default filter');
      applyStatusFilterToGrid(['פתוח'], null);
    } else {
      console.log('applyStatusFilterToGrid still not available, will try again later');
      // Try again after a delay
      setTimeout(() => {
              if (typeof applyStatusFilterToGrid === 'function') {
        console.log('applyStatusFilterToGrid is now available on second try, applying default filter');
        applyStatusFilterToGrid(['פתוח'], null);
      } else {
        console.log('applyStatusFilterToGrid still not available on second try');
      }
      }, 500);
    }
  }, 200);
  
  console.log('Grid initialized successfully');
}

/**
 * Update grid status
 * 
 * This function updates the status indicators for the grid.
 */
function updateGridStatus() {
  const statusItems = document.querySelectorAll('.status-item');
  if (statusItems.length >= 2) {
    statusItems[0].innerHTML = '<div class="status-dot success"></div><span>גריד מוכן</span>';
    statusItems[1].innerHTML = '<div class="status-dot success"></div><span>נתונים נטענו</span>';
  }
}

/**
 * Open plan details
 * 
 * This function opens a dialog to view plan details for a given ticker.
 * 
 * @param {string} ticker - Ticker symbol of the plan
 */
function openPlanDetails(ticker) {
  alert(`פתיחת פרטי תכנון עבור ${ticker}`);
}

/**
 * Update grid data
 * 
 * This function updates the grid data with new data.
 * 
 * @param {Array} newData - New data to be set in the grid
 */
function updateGridData(newData) {
  if (gridApi) {
    gridApi.setGridOption('rowData', newData);
    console.log('Grid data updated with', newData.length, 'rows');
    
    // We don't update summary statistics here - the filter will handle that
  } else {
    console.warn('Grid API not available');
  }
}

/**
 * Refresh grid
 * 
 * This function refreshes the grid by refreshing cells and adjusting column sizes.
 */
function refreshGrid() {
  if (gridApi) {
    gridApi.refreshCells();
    gridApi.sizeColumnsToFit();
    console.log('Grid refreshed');
  }
}

/**
 * Clear grid
 * 
 * This function clears the grid data.
 */
function clearGrid() {
  if (gridApi) {
    gridApi.setGridOption('rowData', []);
    console.log('Grid cleared');
  }
}

/**
 * Set page-specific column definitions
 * 
 * This function sets custom column definitions for the grid.
 * 
 * @param {Array} columnDefs - Array of column definition objects
 */
function setPageColumnDefs(columnDefs) {
  window.getPageColumnDefs = () => columnDefs;
  console.log('Page column definitions set:', columnDefs);
}

/**
 * Add a new column to default definitions
 * 
 * This function adds a new column to the default column definitions.
 * 
 * @param {Object} newColumn - New column definition object
 */
function addColumnToDefaultDefs(newColumn) {
  const defaultDefs = getDefaultColumnDefs();
  defaultDefs.push(newColumn);
  console.log('Column added to default definitions:', newColumn);
}

/**
 * Global functions for grid operations
 * 
 * These functions are made available globally for use in other parts of the application
 */
window.createGrid = createGrid;
window.updateGridData = updateGridData;
window.refreshGrid = refreshGrid;
window.clearGrid = clearGrid;
window.openPlanDetails = openPlanDetails;
window.updateGridStatus = updateGridStatus;
window.setPageColumnDefs = setPageColumnDefs;
window.addColumnToDefaultDefs = addColumnToDefaultDefs;

/**
 * Format currency
 * 
 * This function formats a given amount as a currency string.
 * 
 * @param {number} amount - Amount to be formatted
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage
 * 
 * This function formats a given value as a percentage string.
 * 
 * @param {number} value - Value to be formatted
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }
  
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Toggle alerts section
 * 
 * This function toggles the visibility of the alerts section.
 */
function toggleAlertsSection() {
  const alertsSection = document.getElementById('alertsSection');
  const filterBtn = document.querySelector('.filter-toggle-btn');
  const isCollapsed = alertsSection.classList.contains('collapsed');
  
  if (isCollapsed) {
    // Open alerts section
    alertsSection.classList.remove('collapsed');
    filterBtn.classList.remove('active');
    localStorage.setItem('alertsSectionCollapsed', 'false');
    console.log('פתיחת אזור התראות');
  } else {
    // Close alerts section
    alertsSection.classList.add('collapsed');
    filterBtn.classList.add('active');
    localStorage.setItem('alertsSectionCollapsed', 'true');
    console.log('סגירת אזור התראות');
  }
}

function toggleTopSection() {
  const topSection = document.getElementById('topSection');
  const filterBtn = topSection.querySelector('.top-toggle-btn');
  const isCollapsed = topSection.classList.contains('collapsed');
  
  if (isCollapsed) {
    // Open top section
    topSection.classList.remove('collapsed');
    filterBtn.classList.remove('active');
    localStorage.setItem('topSectionCollapsed', 'false');
    console.log('פתיחת חלק עליון');
  } else {
    // Close top section
    topSection.classList.add('collapsed');
    filterBtn.classList.add('active');
    localStorage.setItem('topSectionCollapsed', 'true');
    console.log('סגירת חלק עליון');
  }
}

function restoreAlertsSectionState() {
  const alertsSection = document.getElementById('alertsSection');
  const filterBtn = document.querySelector('.filter-toggle-btn');
  const isCollapsed = localStorage.getItem('alertsSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    alertsSection.classList.add('collapsed');
    filterBtn.classList.add('active');
    console.log('שחזור מצב: אזור התראות מקופל');
  } else {
    alertsSection.classList.remove('collapsed');
    filterBtn.classList.remove('active');
    console.log('שחזור מצב: אזור התראות פתוח');
  }
}

function restoreTopSectionState() {
  const topSection = document.getElementById('topSection');
  const filterBtn = document.querySelector('.top-toggle-btn');
  const isCollapsed = localStorage.getItem('topSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    topSection.classList.add('collapsed');
    filterBtn.classList.add('active');
    console.log('שחזור מצב: חלק עליון מקופל');
  } else {
    topSection.classList.remove('collapsed');
    filterBtn.classList.remove('active');
    console.log('שחזור מצב: חלק עליון פתוח');
  }
}

/**
 * Load alerts
 * 
 * This function loads sample alerts into the alerts section.
 */
function loadAlerts() {
  const alertsContainer = document.getElementById('alertsContainer');
  if (!alertsContainer) return;
  
  // Determine page type based on URL
  const isPlanningPage = window.location.pathname.includes('planning');
  const openDetailsFunction = isPlanningPage ? 'openPlanDetails' : 'openTradeDetails';
  
  // Sample alerts data
  const alerts = [
    { ticker: 'AAPL', message: 'מחיר חצה את 180$', price: '$184.32 (+1.2%)' },
    { ticker: 'TSLA', message: 'מחיר ירד מתחת ל-700$', price: '$688.90 (-2.1%)' },
    { ticker: 'MSFT', message: 'תזכורת לכניסה ביום שלישי', price: '$342.00 (+2.4%)' }
  ];
  
  const alertsHtml = alerts.map(alert => `
    <div class="alert-card">
      <strong onclick="${openDetailsFunction}('${alert.ticker}')">${alert.ticker}</strong><br />
      ${alert.message}<br />
      <span class="price">נוכחי: ${alert.price}</span>
      <button class="btn btn-secondary" onclick="markAlertAsRead(this, '${alert.ticker}')">סמן כנקרא</button>
    </div>
  `).join('');
  
  alertsContainer.innerHTML = alertsHtml;
  
  // Update alerts count
  const alertsCount = document.getElementById('alertsCount');
  if (alertsCount) {
    alertsCount.textContent = alerts.length;
  }
}

/**
 * Mark alert as read
 * 
 * This function marks an alert as read when the user clicks on it.
 * 
 * @param {Object} button - The button element that was clicked
 * @param {string} ticker - Ticker symbol of the alert
 */
function markAlertAsRead(button, ticker) {
  const alertCard = button.closest('.alert-card');
  if (alertCard) {
    alertCard.classList.add('read');
    button.textContent = 'נקרא';
    button.disabled = true;
    console.log(`התראה עבור ${ticker} סומנה כנקראה`);
  }
}

/**
 * Reset all filters and reload data
 * 
 * This function resets all filters and reloads data based on the current page type.
 */
async function resetAllFiltersAndReloadData() {
  console.log('=== resetAllFiltersAndReloadData called ===');
  
  // Determine page type based on URL
  const isPlanningPage = window.location.pathname.includes('planning');
  const isDatabasePage = window.location.pathname.includes('database');
  
  // Clear filters in the header component
  const header = document.querySelector('app-header');
  if (header && typeof header.clearAllFilters === 'function') {
    console.log('Calling clearAllFilters from component');
    header.clearAllFilters();
  }
  
  // Reset global variables
  window.selectedStatusesForFilter = [];
  window.selectedTypesForFilter = [];
  window.selectedAccountsForFilter = [];
  window.selectedDateRangeForFilter = null;
  window.selectedSearchTermForFilter = null;
  
  // Clear local storage
  const filterPrefix = isPlanningPage ? 'planningFilter' : isDatabasePage ? 'databaseFilter' : 'trackingFilter';
  localStorage.removeItem(`${filterPrefix}Statuses`);
  localStorage.removeItem(`${filterPrefix}Types`);
  localStorage.removeItem(`${filterPrefix}Accounts`);
  localStorage.removeItem(`${filterPrefix}DateRange`);
  localStorage.removeItem(`${filterPrefix}Search`);
  
  // Reload data based on page type
  if (isPlanningPage && typeof loadPlansData === 'function') {
    await loadPlansData();
  } else if (isDatabasePage && typeof loadDatabaseStats === 'function') {
    await loadDatabaseStats();
  } else if (typeof loadTradesDataDirect === 'function') {
    await loadTradesDataDirect();
  }
  
  console.log('=== resetAllFiltersAndReloadData completed ===');
}

/**
 * Close all filters
 * 
 * This function closes all filters in the header component.
 */
function closeAllFilters() {
  console.log('=== closeAllFilters called ===');
  
  // Determine page type based on URL
  const isPlanningPage = window.location.pathname.includes('planning');
  const isDatabasePage = window.location.pathname.includes('database');
  
  // Clear filters in the header component
  if (typeof window.resetComponentFilters === 'function') {
    window.resetComponentFilters();
  }
  
  // Reset global variables
  window.selectedStatusesForFilter = [];
  window.selectedTypesForFilter = [];
  window.selectedAccountsForFilter = [];
  window.selectedDateRangeForFilter = null;
  window.selectedSearchTermForFilter = null;
  
  // Clear local storage
  const filterPrefix = isPlanningPage ? 'planningFilter' : isDatabasePage ? 'databaseFilter' : 'trackingFilter';
  localStorage.removeItem(`${filterPrefix}Statuses`);
  localStorage.removeItem(`${filterPrefix}Types`);
  localStorage.removeItem(`${filterPrefix}Accounts`);
  localStorage.removeItem(`${filterPrefix}DateRange`);
  localStorage.removeItem(`${filterPrefix}Search`);
  
  console.log('All filters cleared');
}

/**
 * Custom action confirmation
 * 
 * This function handles confirmation for custom actions.
 */
let customActionCallback = null;

function confirmCustomAction() {
  if (customActionCallback) {
    customActionCallback();
  }
  document.getElementById("customConfirmModal").style.display = "none";
}

function cancelCustomAction() {
  customActionCallback = null;
  document.getElementById("customConfirmModal").style.display = "none";
}

function showCustomConfirm(message, callback) {
  customActionCallback = callback;
  document.getElementById("customConfirmMessage").textContent = message;
  document.getElementById("customConfirmModal").style.display = "block";
}

/**
 * Section toggling functions
 * 
 * These functions toggle the visibility of different sections.
 */

/**
 * Toggle plans section
 * 
 * This function toggles the visibility of the plans section.
 */
window.togglePlansSection = function() {
  const plansSection = document.getElementById('plansSection');
  const toggleBtn = document.querySelector('button[onclick="togglePlansSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (plansSection.classList.contains('collapsed')) {
    plansSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור תכנונים';
    localStorage.setItem('plansSectionCollapsed', 'false');
  } else {
    plansSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור תכנונים';
    localStorage.setItem('plansSectionCollapsed', 'true');
  }
}

/**
 * Restore plans section state
 * 
 * This function restores the state of the plans section.
 */
function restorePlansSectionState() {
  const plansSection = document.getElementById('plansSection');
  const toggleBtn = document.querySelector('button[onclick="togglePlansSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  const isCollapsed = localStorage.getItem('plansSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    plansSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור תכנונים';
  } else {
    plansSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור תכנונים';
  }
}

/**
 * Toggle alerts section
 * 
 * This function toggles the visibility of the alerts section.
 */
window.toggleAlertsSection = function() {
  const alertsSection = document.getElementById('alertsSection');
  const toggleBtn = document.querySelector('button[onclick="toggleAlertsSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (alertsSection.classList.contains('collapsed')) {
    alertsSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור התראות';
    localStorage.setItem('alertsSectionCollapsed', 'false');
  } else {
    alertsSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור התראות';
    localStorage.setItem('alertsSectionCollapsed', 'true');
  }
}

/**
 * Restore alerts section state
 * 
 * This function restores the state of the alerts section.
 */
function restoreAlertsSectionState() {
  const alertsSection = document.getElementById('alertsSection');
  const toggleBtn = document.querySelector('button[onclick="toggleAlertsSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  const isCollapsed = localStorage.getItem('alertsSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    alertsSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור התראות';
  } else {
    alertsSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור התראות';
  }
}

/**
 * Toggle top section
 * 
 * This function toggles the visibility of the top section.
 */
window.toggleTopSection = function() {
  const topSection = document.getElementById('topSection');
  const toggleBtn = document.querySelector('button[onclick="toggleTopSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (topSection.classList.contains('collapsed')) {
    topSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר חלק עליון';
    localStorage.setItem('topSectionCollapsed', 'false');
  } else {
    topSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר חלק עליון';
    localStorage.setItem('topSectionCollapsed', 'true');
  }
}

/**
 * Restore top section state
 * 
 * This function restores the state of the top section.
 */
function restoreTopSectionState() {
  const topSection = document.getElementById('topSection');
  const toggleBtn = document.querySelector('button[onclick="toggleTopSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  const isCollapsed = localStorage.getItem('topSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    topSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר חלק עליון';
  } else {
    topSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר חלק עליון';
  }
}

/**
 * Restore all section states
 * 
 * This function restores the state of all sections.
 */
function restoreAllSectionStates() {
  restorePlansSectionState();
  restoreAlertsSectionState();
  restoreTopSectionState();
  restoreDesignsSectionState();
}

/**
 * Toggle designs section
 * 
 * This function toggles the visibility of the designs section.
 */
window.toggleDesignsSection = function() {
  const designsSection = document.getElementById('designsSection');
  const toggleBtn = document.querySelector('button[onclick="toggleDesignsSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (designsSection.classList.contains('collapsed')) {
    designsSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור עיצובים';
    localStorage.setItem('designsSectionCollapsed', 'false');
  } else {
    designsSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור עיצובים';
    localStorage.setItem('designsSectionCollapsed', 'true');
  }
}

/**
 * Restore designs section state
 * 
 * This function restores the state of the designs section.
 */
function restoreDesignsSectionState() {
  const designsSection = document.getElementById('designsSection');
  const toggleBtn = document.querySelector('button[onclick="toggleDesignsSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (!designsSection || !toggleBtn || !icon) return;
  
  const isCollapsed = localStorage.getItem('designsSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    designsSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור עיצובים';
  } else {
    designsSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור עיצובים';
  }
}

/**
 * Table sorting functions
 * 
 * These functions handle sorting for tables.
 */

/**
 * Global variables for sorting
 * 
 * These variables maintain the current sorting state across
 * different tables and columns.
 */
let currentSortColumn = null;
let currentSortDirection = 'asc'; // 'asc' or 'desc'

/**
 * Initialize table sorting for a given table
 * 
 * This function sets up sorting functionality for a specific table.
 * 
 * @param {string} tableId - ID of the table
 */
function initializeTableSorting(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const headers = table.querySelectorAll('thead th');
  
  headers.forEach((header, index) => {
    // Skip action column
    if (header.textContent.includes('פעולות') || header.textContent.includes('Actions')) {
      return;
    }
    
    // Check if sorting icon already exists
    if (header.querySelector('.sort-icon')) {
      return; // Already initialized
    }
    
    // Add cursor pointer style
    header.style.cursor = 'pointer';
    header.classList.add('sortable-header');
    
    // Add sorting icon
    const sortIcon = document.createElement('span');
    sortIcon.className = 'sort-icon';
    sortIcon.innerHTML = '↕';
    header.insertBefore(sortIcon, header.firstChild);
    
    // Add event listener
    header.addEventListener('click', () => {
      sortTable(tableId, index);
    });
  });
}

/**
 * Sort table
 * 
 * This function sorts the rows of a table based on the clicked column.
 * 
 * @param {string} tableId - ID of the table
 * @param {number} columnIndex - Index of the clicked column
 */
function sortTable(tableId, columnIndex) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // Check if it's the same column - toggle direction
  if (currentSortColumn === columnIndex) {
    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortColumn = columnIndex;
    currentSortDirection = 'asc';
  }
  
  // Update sort icons
  updateSortIcons(tableId, columnIndex);
  
  // Sort rows
  rows.sort((a, b) => {
    const aValue = getCellValue(a, columnIndex);
    const bValue = getCellValue(b, columnIndex);
    
    let comparison = 0;
    
    // Handle different data types
    if (isNumeric(aValue) && isNumeric(bValue)) {
      comparison = parseFloat(aValue) - parseFloat(bValue);
    } else if (isDate(aValue) && isDate(bValue)) {
      comparison = new Date(aValue) - new Date(bValue);
    } else {
      comparison = String(aValue).localeCompare(String(bValue), 'he');
    }
    
    return currentSortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Remove old rows and append new ones
  rows.forEach(row => tbody.appendChild(row));
}

/**
 * Get cell value
 * 
 * This function retrieves the value of a cell in a given row and column.
 * 
 * @param {Object} row - The row object
 * @param {number} columnIndex - Index of the column
 * @returns {string} Value of the cell
 */
function getCellValue(row, columnIndex) {
  const cell = row.cells[columnIndex];
  if (!cell) return '';
  
  // Strip HTML tags and get text content
  let value = cell.textContent || cell.innerText || '';
  
  // Remove extra spaces
  value = value.trim();
  
  // Handle special values
  if (value.includes('$')) {
    // Remove dollar sign and commas
    value = value.replace(/[$,]/g, '');
  }
  
  if (value.includes('%')) {
    // Remove percentage sign
    value = value.replace(/%/g, '');
  }
  
  return value;
}

/**
 * Check if value is numeric
 * 
 * This function checks if a given value is numeric.
 * 
 * @param {string} value - Value to check
 * @returns {boolean} True if value is numeric
 */
function isNumeric(value) {
  return !isNaN(value) && !isNaN(parseFloat(value));
}

/**
 * Check if value is a date
 * 
 * This function checks if a given value is a valid date.
 * 
 * @param {string} value - Value to check
 * @returns {boolean} True if value is a date
 */
function isDate(value) {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date);
}

/**
 * Update sort icons
 * 
 * This function updates the sort icons for the active column.
 * 
 * @param {string} tableId - ID of the table
 * @param {number} activeColumnIndex - Index of the active column
 */
function updateSortIcons(tableId, activeColumnIndex) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const headers = table.querySelectorAll('thead th');
  
  headers.forEach((header, index) => {
    const sortIcon = header.querySelector('.sort-icon');
    if (!sortIcon) return;
    
    // Remove 'sorted' class from all headers
    header.classList.remove('sorted');
    
    if (index === activeColumnIndex) {
      // Active column
      header.classList.add('sorted');
      sortIcon.innerHTML = currentSortDirection === 'asc' ? '↑' : '↓';
    } else {
      // Inactive column
      sortIcon.innerHTML = '↕';
    }
  });
}

/**
 * Initialize sorting for all tables on the page
 * 
 * This function sets up sorting for all tables on the page.
 */
function initializeAllTableSorting() {
  // Initialize plans table
  initializeTableSorting('plansTable');
  
  // Initialize designs table
  initializeTableSorting('designsTable');
  
  // Initialize other tables as needed
  const tables = ['accountsTable', 'tickersTable', 'tradesTable', 'tradePlansTable', 'alertsTable', 'cashFlowsTable', 'notesTable', 'executionsTable'];
  tables.forEach(tableId => {
    if (document.getElementById(tableId)) {
      initializeTableSorting(tableId);
    }
  });
}

/**
 * CRUD functions
 * 
 * These functions handle create, read, update, and delete operations for records.
 */

/**
 * Show edit modal
 * 
 * This function shows an edit modal for a given table type and data.
 * 
 * @param {string} tableType - Type of table (e.g., 'accounts', 'tickers', 'trades')
 * @param {Object} data - Data for editing
 * 
 * @example
 * // Show edit modal for accounts
 * showEditModal('accounts', accountData);
 */
function showEditModal(tableType, data) {
    // Create a unique ID for the modal based on table type
    let modalId;
    
    // Map specific table types to their respective modals
    const modalIdMap = {
        'user_roles': 'editUserRolesModal',
        'cash_flows': 'editCashFlowsModal',
        'trade_plans': 'editTradePlanModal',
        'users': 'editUsersModal'
    };
    
    if (modalIdMap[tableType]) {
        modalId = modalIdMap[tableType];
    } else {
        modalId = `edit${capitalizeFirstLetter(tableType)}Modal`;
    }
    
    const modal = document.getElementById(modalId);
    
    // Check if the modal exists in the page
    if (!modal) {
        console.error(`Modal ${modalId} not found`);
        alert('מודל עריכה לא נמצא');
        return;
    }
    
    // Populate the modal with data
    fillEditModalData(tableType, data);
    
    // Show the modal using Bootstrap
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

/**
 * Fill edit modal data
 * 
 * This function populates the edit modal with data based on the table type.
 * 
 * @param {string} tableType - Type of table (e.g., 'accounts', 'tickers', 'trades')
 * @param {Object} data - Data for editing
 * 
 * @example
 * // Populate edit modal data for accounts
 * fillEditModalData('accounts', accountData);
 */
function fillEditModalData(tableType, data) {
    // Create a unique ID for the modal based on table type
    const modalId = `edit${capitalizeFirstLetter(tableType)}Modal`;
    const modal = document.getElementById(modalId);
    
    // Check if the modal exists in the page
    if (!modal) return;
    
    // Populate fields based on table type
    switch (tableType) {
        case 'accounts':
            fillAccountModalData(data);
            break;
        case 'tickers':
            fillTickerModalData(data);
            break;
        case 'trades':
            fillTradeModalData(data);
            break;
        case 'trade_plans':
            fillTradePlanModalData(data);
            break;
        case 'alerts':
            fillAlertModalData(data);
            break;
        case 'cash_flows':
            fillCashFlowModalData(data);
            break;
        case 'notes':
            fillNoteModalData(data);
            break;
        case 'executions':
            fillExecutionModalData(data);
            break;
        case 'alerts':
            fillAlertModalData(data);
            break;
        case 'cash_flows':
            fillCashFlowModalData(data);
            break;
        case 'notes':
            fillNoteModalData(data);
            break;
        case 'users':
            fillUserModalData(data);
            break;
        case 'user_roles':
            fillUserRoleModalData(data);
            break;
        default:
            console.error(`Unknown table type: ${tableType}`);
    }
}

/**
 * Specific data population functions
 * 
 * These functions populate the fields of the edit modal based on the table type.
 */

/**
 * Populate account data
 * 
 * This function populates the account fields in the edit modal.
 * 
 * @param {Object} data - Account data for editing
 * @param {number} data.id - Account ID
 * @param {string} data.name - Account name
 * @param {string} data.currency - Account currency
 * @param {string} data.status - Account status
 * @param {number} data.cash_balance - Account cash balance
 * @param {string} data.notes - Account notes
 */
function fillAccountModalData(data) {
    // Populate fields with data or default values
    document.getElementById('editAccountId').value = data.id;
    document.getElementById('editAccountName').value = data.name || '';
    document.getElementById('editAccountCurrency').value = data.currency || 'USD';
    document.getElementById('editAccountStatus').value = data.status || 'active';
    document.getElementById('editAccountCashBalance').value = data.cash_balance || 0;
    document.getElementById('editAccountNotes').value = data.notes || '';
}

/**
 * Populate ticker data
 * 
 * This function populates the ticker fields in the edit modal.
 * 
 * @param {Object} data - Ticker data for editing
 * @param {number} data.id - Ticker ID
 * @param {string} data.symbol - Ticker symbol
 * @param {string} data.name - Ticker name
 * @param {string} data.type - Ticker type
 * @param {string} data.currency - Ticker currency
 * @param {string} data.remarks - Ticker remarks
 */
function fillTickerModalData(data) {
    // Populate fields with data or default values
    document.getElementById('editTickerId').value = data.id;
    document.getElementById('editTickerSymbol').value = data.symbol || '';
    document.getElementById('editTickerName').value = data.name || '';
    document.getElementById('editTickerType').value = data.type || 'stock';
    document.getElementById('editTickerCurrency').value = data.currency || 'USD';
    document.getElementById('editTickerRemarks').value = data.remarks || '';
}

/**
 * Populate trade data
 * 
 * This function populates the trade fields in the edit modal.
 * 
 * @param {Object} data - Trade data for editing
 * @param {number} data.id - Trade ID
 * @param {number} data.account_id - Account ID
 * @param {number} data.ticker_id - Ticker ID
 * @param {string} data.status - Trade status
 * @param {string} data.type - Trade type
 * @param {string} data.notes - Trade notes
 */
function fillTradeModalData(data) {
    // Populate fields with data or default values
    document.getElementById('editTradeId').value = data.id;
    document.getElementById('editTradeAccountId').value = data.account_id || '';
    document.getElementById('editTradeTickerId').value = data.ticker_id || '';
    document.getElementById('editTradeStatus').value = data.status || 'open';
    document.getElementById('editTradeType').value = data.type || 'buy';
    document.getElementById('editTradeNotes').value = data.notes || '';
}

/**
 * Populate trade plan data
 * 
 * This function populates the trade plan fields in the edit modal.
 * 
 * @param {Object} data - Trade plan data for editing
 * @param {number} data.id - Trade plan ID
 * @param {number} data.account_id - Account ID
 * @param {number} data.ticker_id - Ticker ID
 * @param {string} data.investment_type - Investment type
 * @param {number} data.planned_amount - Planned amount
 * @param {number} data.stop_price - Stop price
 * @param {number} data.target_price - Target price
 * @param {string} data.entry_conditions - Entry conditions
 * @param {string} data.reasons - Reasons
 */
function fillTradePlanModalData(data) {
    // Populate fields with data or default values
    document.getElementById('editTradePlanId').value = data.id;
    document.getElementById('editTradePlanAccountId').value = data.account_id || '';
    document.getElementById('editTradePlanTickerId').value = data.ticker_id || '';
    document.getElementById('editTradePlanInvestmentType').value = data.investment_type || 'swing';
    document.getElementById('editTradePlanPlannedAmount').value = data.planned_amount || 0;
    document.getElementById('editTradePlanStopPrice').value = data.stop_price || '';
    document.getElementById('editTradePlanTargetPrice').value = data.target_price || '';
    document.getElementById('editTradePlanEntryConditions').value = data.entry_conditions || '';
    document.getElementById('editTradePlanReasons').value = data.reasons || '';
}

function fillAlertModalData(data) {
    document.getElementById('editAlertId').value = data.id;
    document.getElementById('editAlertAccountId').value = data.account_id || '';
    document.getElementById('editAlertTickerId').value = data.ticker_id || '';
    document.getElementById('editAlertType').value = data.type || '';
    document.getElementById('editAlertCondition').value = data.condition || '';
    document.getElementById('editAlertMessage').value = data.message || '';
    document.getElementById('editAlertStatus').checked = data.is_active || false;
}

function fillCashFlowModalData(data) {
    document.getElementById('editCashFlowId').value = data.id;
    document.getElementById('editCashFlowAccountId').value = data.account_id || '';
    document.getElementById('editCashFlowType').value = data.type || '';
    document.getElementById('editCashFlowAmount').value = data.amount || 0;
    document.getElementById('editCashFlowDate').value = data.date || '';
    document.getElementById('editCashFlowDescription').value = data.description || '';
}

function fillNoteModalData(data) {
    document.getElementById('editNoteId').value = data.id;
    document.getElementById('editNoteAccountId').value = data.account_id || '';
    document.getElementById('editNoteTradeId').value = data.trade_id || '';
    document.getElementById('editNoteTradePlanId').value = data.trade_plan_id || '';
    document.getElementById('editNoteContent').value = data.content || '';
    document.getElementById('editNoteAttachment').value = data.attachment || '';
}

function fillExecutionModalData(data) {
    document.getElementById('editExecutionId').value = data.id;
    document.getElementById('editExecutionTradeId').value = data.trade_id || '';
    document.getElementById('editExecutionAction').value = data.action || '';
    document.getElementById('editExecutionDate').value = data.date || '';
    document.getElementById('editExecutionQuantity').value = data.quantity || '';
    document.getElementById('editExecutionPrice').value = data.price || 0;
    document.getElementById('editExecutionFee').value = data.fee || 0;
    document.getElementById('editExecutionSource').value = data.source || '';
}

/**
 * Populate alert data
 * 
 * This function populates the alert fields in the edit modal.
 * 
 * @param {Object} data - Alert data for editing
 * @param {number} data.id - Alert ID
 * @param {number} data.account_id - Account ID
 * @param {number} data.ticker_id - Ticker ID
 * @param {string} data.type - Alert type
 * @param {string} data.condition - Alert condition
 * @param {string} data.message - Alert message
 * @param {boolean} data.is_active - Is the alert active
 */
function fillAlertModalData(data) {
    document.getElementById('editAlertId').value = data.id;
    document.getElementById('editAlertAccountId').value = data.account_id || '';
    document.getElementById('editAlertTickerId').value = data.ticker_id || '';
    document.getElementById('editAlertType').value = data.type || '';
    document.getElementById('editAlertCondition').value = data.condition || '';
    document.getElementById('editAlertMessage').value = data.message || '';
    document.getElementById('editAlertIsActive').value = data.is_active ? 'true' : 'false';
}

/**
 * Populate cash flow data
 * 
 * This function populates the cash flow fields in the edit modal.
 * 
 * @param {Object} data - Cash flow data for editing
 * @param {number} data.id - Cash flow ID
 * @param {number} data.account_id - Account ID
 * @param {string} data.type - Cash flow type
 * @param {number} data.amount - Cash flow amount
 * @param {string} data.date - Cash flow date
 * @param {string} data.description - Cash flow description
 */
function fillCashFlowModalData(data) {
    document.getElementById('editCashFlowId').value = data.id;
    document.getElementById('editCashFlowAccountId').value = data.account_id || '';
    document.getElementById('editCashFlowType').value = data.type || '';
    document.getElementById('editCashFlowAmount').value = data.amount || 0;
    document.getElementById('editCashFlowDate').value = data.date || '';
    document.getElementById('editCashFlowDescription').value = data.description || '';
}

/**
 * Populate note data
 * 
 * This function populates the note fields in the edit modal.
 * 
 * @param {Object} data - Note data for editing
 * @param {number} data.id - Note ID
 * @param {number} data.account_id - Account ID
 * @param {number} data.trade_id - Trade ID
 * @param {number} data.trade_plan_id - Trade plan ID
 * @param {string} data.content - Note content
 * @param {string} data.attachment - Note attachment
 */
function fillNoteModalData(data) {
    document.getElementById('editNoteId').value = data.id;
    document.getElementById('editNoteAccountId').value = data.account_id || '';
    document.getElementById('editNoteTradeId').value = data.trade_id || '';
    document.getElementById('editNoteTradePlanId').value = data.trade_plan_id || '';
    document.getElementById('editNoteContent').value = data.content || '';
    document.getElementById('editNoteAttachment').value = data.attachment || '';
}

/**
 * Populate user data
 * 
 * This function populates the user fields in the edit modal.
 * 
 * @param {Object} data - User data for editing
 * @param {number} data.id - User ID
 * @param {string} data.username - Username
 * @param {string} data.email - Email
 * @param {boolean} data.is_active - Is the user active
 * @param {Array} data.roles - User roles
 */
function fillUserModalData(data) {
    document.getElementById('editUserId').value = data.id;
    document.getElementById('editUserUsername').value = data.username || '';
    document.getElementById('editUserEmail').value = data.email || '';
    document.getElementById('editUserIsActive').value = data.is_active ? 'true' : 'false';
    document.getElementById('editUserRoles').value = data.roles ? data.roles.join(', ') : '';
}

/**
 * Populate user role data
 * 
 * This function populates the user role fields in the edit modal.
 * 
 * @param {Object} data - User role data for editing
 * @param {number} data.id - User role ID
 * @param {number} data.user_id - User ID
 * @param {string} data.user_username - Username
 * @param {number} data.role_id - Role ID
 * @param {string} data.role_name - Role name
 * @param {string} data.assigned_at - Assignment date
 */
function fillUserRoleModalData(data) {
    document.getElementById('editUserRoleId').value = data.id;
    document.getElementById('editUserRoleUserId').value = data.user_id || '';
    document.getElementById('editUserRoleUsername').value = data.user_username || '';
    document.getElementById('editUserRoleRoleId').value = data.role_id || '';
    document.getElementById('editUserRoleRoleName').value = data.role_name || '';
    document.getElementById('editUserRoleAssignedAt').value = data.assigned_at || '';
}

/**
 * Collect modal data
 * 
 * This function collects data from the edit modal and returns it as an object.
 * 
 * @param {string} tableType - Type of table (e.g., 'accounts', 'tickers', 'trades')
 * @returns {Object} Object containing collected data
 * 
 * @example
 * // Collect data for accounts
 * const accountData = collectModalData('accounts');
 * // returns { name: "...", currency: "...", status: "...", ... }
 */
function collectModalData(tableType) {
    // Collect data based on table type
    switch (tableType) {
        case 'accounts':
            // Collect account data
            return {
                name: document.getElementById('editAccountName').value,
                currency: document.getElementById('editAccountCurrency').value,
                status: document.getElementById('editAccountStatus').value,
                cash_balance: parseFloat(document.getElementById('editAccountCashBalance').value),
                notes: document.getElementById('editAccountNotes').value
            };
        case 'tickers':
            // Collect ticker data
            return {
                symbol: document.getElementById('editTickerSymbol').value,
                name: document.getElementById('editTickerName').value,
                type: document.getElementById('editTickerType').value,
                currency: document.getElementById('editTickerCurrency').value,
                remarks: document.getElementById('editTickerRemarks').value
            };
        case 'trades':
            // Collect trade data
            return {
                account_id: parseInt(document.getElementById('editTradeAccountId').value),
                ticker_id: parseInt(document.getElementById('editTradeTickerId').value),
                status: document.getElementById('editTradeStatus').value,
                type: document.getElementById('editTradeType').value,
                notes: document.getElementById('editTradeNotes').value
            };
        case 'trade_plans':
            // Collect trade plan data
            return {
                account_id: parseInt(document.getElementById('editTradePlanAccountId').value),
                ticker_id: parseInt(document.getElementById('editTradePlanTickerId').value),
                investment_type: document.getElementById('editTradePlanInvestmentType').value,
                planned_amount: parseFloat(document.getElementById('editTradePlanPlannedAmount').value),
                stop_price: parseFloat(document.getElementById('editTradePlanStopPrice').value) || null,
                target_price: parseFloat(document.getElementById('editTradePlanTargetPrice').value) || null,
                entry_conditions: document.getElementById('editTradePlanEntryConditions').value,
                reasons: document.getElementById('editTradePlanReasons').value
            };
        case 'alerts':
            // Collect alert data
            return {
                account_id: parseInt(document.getElementById('editAlertAccountId').value) || null,
                ticker_id: parseInt(document.getElementById('editAlertTickerId').value) || null,
                type: document.getElementById('editAlertType').value,
                condition: document.getElementById('editAlertCondition').value,
                message: document.getElementById('editAlertMessage').value,
                is_active: document.getElementById('editAlertIsActive').value === 'true'
            };
        case 'cash_flows':
            // Collect cash flow data
            return {
                account_id: parseInt(document.getElementById('editCashFlowAccountId').value),
                type: document.getElementById('editCashFlowType').value,
                amount: parseFloat(document.getElementById('editCashFlowAmount').value),
                date: document.getElementById('editCashFlowDate').value,
                description: document.getElementById('editCashFlowDescription').value
            };
        case 'notes':
            // Collect note data
            return {
                account_id: parseInt(document.getElementById('editNoteAccountId').value) || null,
                trade_id: parseInt(document.getElementById('editNoteTradeId').value) || null,
                trade_plan_id: parseInt(document.getElementById('editNoteTradePlanId').value) || null,
                content: document.getElementById('editNoteContent').value,
                attachment: document.getElementById('editNoteAttachment').value
            };
        case 'executions':
            // Collect execution data
            return {
                trade_id: parseInt(document.getElementById('editExecutionTradeId').value),
                action: document.getElementById('editExecutionAction').value,
                date: document.getElementById('editExecutionDate').value,
                quantity: parseInt(document.getElementById('editExecutionQuantity').value) || null,
                price: parseFloat(document.getElementById('editExecutionPrice').value),
                fee: parseFloat(document.getElementById('editExecutionFee').value) || 0,
                source: document.getElementById('editExecutionSource').value
            };
        case 'users':
            // Collect user data
            return {
                username: document.getElementById('editUserUsername').value,
                email: document.getElementById('editUserEmail').value,
                is_active: document.getElementById('editUserIsActive').value === 'true',
                roles: document.getElementById('editUserRoles').value.split(',').map(role => role.trim()).filter(role => role)
            };
        case 'user_roles':
            // Collect user role data
            return {
                user_id: parseInt(document.getElementById('editUserRoleUserId').value),
                role_id: parseInt(document.getElementById('editUserRoleRoleId').value),
                assigned_at: document.getElementById('editUserRoleAssignedAt').value
            };
        default:
            // Return empty object if table type is not recognized
            return {};
    }
}

/**
 * Refresh table
 * 
 * This function reloads data for a given table type.
 * 
 * @param {string} tableType - Type of table (e.g., 'accounts', 'tickers', 'trades')
 * 
 * @example
 * // Refresh accounts table
 * refreshTable('accounts');
 * 
 * // Refresh tickers table
 * refreshTable('tickers');
 */
function refreshTable(tableType) {
    // Create a function name based on table type
    // For example: 'accounts' -> 'loadAccounts', 'trade_plans' -> 'loadTradePlans'
    let loadFunction;
    
    // Map specific table types to their respective load functions
    const loadFunctionMap = {
        'user_roles': 'loadUserRoles',
        'cash_flows': 'loadCashFlows',
        'trade_plans': 'loadTradePlans',
        'users': 'loadUsers'
    };
    
    if (loadFunctionMap[tableType]) {
        loadFunction = loadFunctionMap[tableType];
    } else {
        loadFunction = `load${capitalizeFirstLetter(tableType.replace('_', ''))}`;
    }
    
    // Check if the function exists and call it
    if (typeof window[loadFunction] === 'function') {
        window[loadFunction]();
    } else {
        console.error(`Load function ${loadFunction} not found for table type ${tableType}`);
    }
}

/**
 * Helper functions for CRUD operations
 * 
 * These functions provide basic services for CRUD operations.
 */

/**
 * Capitalize first letter of a string
 * 
 * This function capitalizes the first letter of a given string.
 * 
 * @param {string} string - The string to capitalize
 * @returns {string} The string with capitalized first letter
 * 
 * @example
 * capitalizeFirstLetter('accounts') // returns 'Accounts'
 * capitalizeFirstLetter('trade_plans') // returns 'Trade_plans'
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Get table display name in Hebrew
 * 
 * This function returns the Hebrew name of a table based on its English name.
 * 
 * @param {string} tableType - Table type in English
 * @returns {string} Table name in Hebrew
 * 
 * @example
 * getTableDisplayName('accounts') // returns 'חשבון'
 * getTableDisplayName('tickers') // returns 'טיקר'
 * getTableDisplayName('unknown') // returns 'unknown'
 */
function getTableDisplayName(tableType) {
    // Map table names in English to their Hebrew equivalents
    const displayNames = {
        'accounts': 'חשבון',
        'tickers': 'טיקר',
        'trades': 'טרייד',
        'trade_plans': 'תוכנית טרייד',
        'alerts': 'התראה',
        'cash_flows': 'תזרים מזומנים',
        'notes': 'הערה',
        'executions': 'ביצוע',
        'users': 'משתמש',
        'user_roles': 'תפקיד משתמש'
    };
    
    // Return Hebrew name or original name if not found
    return displayNames[tableType] || tableType;
}

/**
 * Global functions for CRUD operations
 * 
 * These functions are made available globally for use in other parts of the application
 */
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.saveRecord = saveRecord;

// Call to restore section states on page load
document.addEventListener('DOMContentLoaded', function() {
  // Short delay to ensure all elements are loaded
  setTimeout(() => {
    if (typeof restoreAllSectionStates === 'function') {
      restoreAllSectionStates();
    }
    
    // Initialize table sorting
    initializeAllTableSorting();
  }, 100);
});
