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
 * Service Systems Integration:
 * ✅ Global Element Cache - window.getElement (4 usages)
 * ✅ FieldRendererService - renderDate/Number/Boolean (3 types)
 * ✅ UI Systems - showNotification, createEditButton, createDeleteButton
 * ✅ Entity Colors - window.getEntityColor
 * ❌ CRUDResponseHandler - Not needed (Read-only page)
 * ❌ DataCollectionService - Not needed (No forms)
 * ❌ SelectPopulatorService - Not needed (No dropdowns)
 * ❌ DefaultValueSetter - Not needed (No forms)
 *
 * File: trading-ui/scripts/db_display.js
 * Version: 2.0 - Services Integration Complete
 * Last Updated: October 11, 2025
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
  
  // Update the main display with all table statistics as cards
  updateMainTableDisplay();
}

/**
 * Set up page event listeners
 */
function setupEventListeners() {
  // Table type selector
  const tableTypeSelect = window.getElement?.('tableTypeSelect') || document.getElementById('tableTypeSelect');
  if (tableTypeSelect) {
    tableTypeSelect.addEventListener('change', function() {
      const selectedType = this.value;
      loadTableData(selectedType);
    });
  }

  // Search functionality
  const searchInput = window.getElement?.('searchInput') || document.getElementById('searchInput');
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

    // Store the data for this table type
    if (!window.dbTableData) {
      window.dbTableData = {};
    }
    window.dbTableData[tableType] = data;

    // Update the specific table display
    updateTableDisplay(tableType, data);

    console.log(`✅ Data loaded for ${tableType}: ${data.length} records`);

  } catch (error) {
    console.error(`❌ Error loading data for ${tableType}:`, error);
    handleDataLoadError(error, tableType);
  }
}

/**
 * Fetch table data from server using physical database schema
 * @param {string} tableType - The table type to fetch
 * @returns {Promise<Array>} The fetched data
 */
async function fetchTableData(tableType) {
  try {
    // Map table types to correct table names in database
    const tableNames = {
      'accounts': 'trading_accounts',
      'trading_accounts': 'trading_accounts',
      'trades': 'trades',
      'tickers': 'tickers',
      'trade_plans': 'trade_plans',
      'executions': 'executions',
      'alerts': 'alerts',
      'notes': 'notes',
      'cash_flows': 'cash_flows'
    };
    
    const tableName = tableNames[tableType] || tableType;
    
    // Use the new database schema endpoint to get data with physical column order
    const endpoint = `/api/database-schema/table/${tableName}/data`;
    console.log(`🌐 Fetching data for ${tableType} from ${endpoint}`);
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`📥 Received response for ${tableType}:`, result);

    if (result.status === 'success') {
      return result.data?.rows || [];
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

// ===== CARDS DISPLAY =====

/**
 * Get dynamic color for entity type
 * @param {string} entityType - The entity type
 * @returns {string} The color value
 */
function getEntityColor(entityType) {
  if (!entityType) {
    return '#6c757d'; // אפור לנתונים חסרים
  }

  // Try to use the global entity color system first
  if (window.getEntityColor && window.getEntityColor !== getEntityColor) {
    try {
      return window.getEntityColor(entityType);
    } catch (error) {
      console.warn('Error calling global getEntityColor:', error);
    }
  }

  // Try to get color from CSS variables
  try {
    const colorVar = `--entity-${entityType}-color`;
    const computedStyle = getComputedStyle(document.documentElement);
    const color = computedStyle.getPropertyValue(colorVar).trim();
    
    if (color && color !== '') {
      return color;
    }
  } catch (error) {
    console.warn('Error getting CSS color for', entityType, error);
  }

  // Fallback colors based on the system documentation
  const fallbackColors = {
    'account': '#28a745',      // ירוק - חשבונות
    'trade': '#007bff',        // כחול - טריידים
    'ticker': '#dc3545',       // אדום - טיקרים
    'trade-plan': '#0056b3',   // כחול כהה - תכנוני טרייד
    'execution': '#17a2b8',    // כחול טורקיז - ביצועים
    'alert': '#ff9c05',        // כתום - התראות
    'note': '#6f42c1',         // סגול - הערות
    'cash-flow': '#20c997'     // ירוק טורקיז - תזרים מזומנים
  };
  
  const normalizedType = entityType.toLowerCase().trim();
  return fallbackColors[normalizedType] || '#6c757d';
}

/**
 * Update the main display with all table statistics as cards
 */
function updateMainTableDisplay() {
  const container = window.getElement?.('dbCardsContainer') || document.getElementById('dbCardsContainer');
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Table names and their display names with our custom icons and dynamic colors
  const tableInfo = {
    'accounts': { 
      name: 'חשבונות מסחר', 
      icon: 'account-icon', 
      entityType: 'account',
      customIcon: 'images/icons/trading_accounts.svg'
    },
    'trades': { 
      name: 'טריידים', 
      icon: 'trade-icon', 
      entityType: 'trade',
      customIcon: 'images/icons/trades.svg'
    },
    'tickers': { 
      name: 'טיקרים', 
      icon: 'ticker-icon', 
      entityType: 'ticker',
      customIcon: 'images/icons/tickers.svg'
    },
    'trade_plans': { 
      name: 'תוכניות טרייד', 
      icon: 'trade-plan-icon', 
      entityType: 'trade-plan',
      customIcon: 'images/icons/trade_plans.svg'
    },
    'executions': { 
      name: 'ביצועים', 
      icon: 'execution-icon', 
      entityType: 'execution',
      customIcon: 'images/icons/executions.svg'
    },
    'alerts': { 
      name: 'התראות', 
      icon: 'alert-icon', 
      entityType: 'alert',
      customIcon: 'images/icons/alerts.svg'
    },
    'notes': { 
      name: 'הערות', 
      icon: 'note-icon', 
      entityType: 'note',
      customIcon: 'images/icons/notes.svg'
    },
    'cash_flows': { 
      name: 'תזרימי מזומנים', 
      icon: 'cash-flow-icon', 
      entityType: 'cash-flow',
      customIcon: 'images/icons/cash_flows.svg'
    }
  };
  
  // Create cards for each table
  Object.keys(tableInfo).forEach(tableType => {
    const data = window.dbTableData?.[tableType] || [];
    const info = tableInfo[tableType];
    
    // Calculate table size (rough estimate)
    const sizeEstimate = data.length * 100; // Rough estimate: 100 bytes per record
    const sizeText = sizeEstimate > 1024 ? `${(sizeEstimate / 1024).toFixed(1)} KB` : `${sizeEstimate} B`;
    
    // Get dynamic color for this entity type
    const entityColor = getEntityColor(info.entityType);
    
    // Create card element - 4 per row with icon on the right
    const cardCol = document.createElement('div');
    cardCol.className = 'col-lg-3 col-md-4 col-sm-6 col-12 mb-3';
    
    cardCol.innerHTML = `
      <div class="card h-100 border-0 shadow-sm">
        <div class="card-body p-3">
          <!-- Header row with title and export button -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="card-title mb-0" style="font-size: 0.9rem; font-weight: 600;">${info.name}</h6>
            <button class="btn btn-outline-secondary btn-sm" onclick="exportTableData('${tableType}')" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;" title="ייצוא נתונים">
              <i class="fas fa-download"></i>
            </button>
          </div>
          
          <!-- Content row with stats and icon -->
          <div class="d-flex align-items-center">
            <!-- Stats on the left -->
            <div class="flex-grow-1">
              <div class="row text-center">
                <div class="col-6">
                  <div class="border-end">
                    <small class="text-muted d-block">רשומות</small>
                    <strong style="color: ${entityColor}; font-size: 1rem;">${data.length}</strong>
                  </div>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">גודל</small>
                  <small style="color: ${entityColor}; font-size: 0.8rem;">${sizeText}</small>
                </div>
              </div>
            </div>
            <!-- Icon on the right -->
            <div class="ms-3">
              <div class="${info.icon} entity-icon" style="color: ${entityColor}; font-size: 2rem;">
                <img src="${info.customIcon}" alt="${info.name}" style="width: 32px; height: 32px; filter: ${entityColor === '#28a745' ? 'hue-rotate(0deg)' : entityColor === '#007bff' ? 'hue-rotate(200deg)' : entityColor === '#dc3545' ? 'hue-rotate(300deg)' : 'hue-rotate(0deg)'};">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(cardCol);
  });
}

/**
 * Update table display with full data
 * @param {string} tableType - The table type
 * @param {Array} data - The data to display
 */
function updateTableDisplay(tableType, data) {
  // Convert table type to camelCase for ID matching
  // trade_plans -> tradePlans, cash_flows -> cashFlows
  const camelCaseType = tableType.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  
  const tableId = `${camelCaseType}Table`;
  const headerId = `${camelCaseType}TableHeader`;
  const bodyId = `${camelCaseType}TableBody`;
  
  const table = window.getElement?.(tableId) || document.getElementById(tableId);
  const header = window.getElement?.(headerId) || document.getElementById(headerId);
  const body = window.getElement?.(bodyId) || document.getElementById(bodyId);
  
  if (!table || !header || !body) {
    console.warn(`Table elements not found for ${tableType}. Looking for IDs: ${tableId}, ${headerId}, ${bodyId}`);
    return;
  }
  
  // Clear existing content
  header.innerHTML = '';
  body.innerHTML = '';
  
  if (!data || data.length === 0) {
    body.innerHTML = '<tr><td colspan="100%" class="text-center text-muted">אין נתונים להצגה</td></tr>';
    return;
  }
  
  // Generate headers from first record
  const firstRecord = data[0];
  const columns = Object.keys(firstRecord);
  
  // Create header row
  columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column;
    th.style.fontSize = '0.85rem';
    th.style.fontWeight = '600';
    th.style.whiteSpace = 'normal';
    th.style.wordWrap = 'break-word';
    th.style.maxWidth = '150px';
    th.style.verticalAlign = 'middle';
    header.appendChild(th);
  });
  
  // Create data rows
  data.forEach(record => {
    const row = document.createElement('tr');
    
    columns.forEach(column => {
      const td = document.createElement('td');
      const value = record[column];
      
      // Format the value using FieldRendererService when available
      if (value === null || value === undefined) {
        td.textContent = '-';
        td.className = 'text-muted';
      } else if (typeof value === 'boolean') {
        // Use FieldRendererService for boolean if available
        if (window.FieldRendererService?.renderBoolean) {
          td.innerHTML = window.FieldRendererService.renderBoolean(value);
        } else {
          td.textContent = value ? 'כן' : 'לא';
          td.className = value ? 'text-success' : 'text-danger';
        }
      } else if (typeof value === 'number') {
        // Use FieldRendererService for numbers if available
        if (window.FieldRendererService?.renderNumber) {
          td.innerHTML = window.FieldRendererService.renderNumber(value);
        } else {
          td.textContent = value.toLocaleString();
          td.className = 'text-end';
        }
      } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
        // Use FieldRendererService for dates if available
        if (window.FieldRendererService?.renderDate) {
          td.innerHTML = window.FieldRendererService.renderDate(value);
        } else {
          try {
            const date = new Date(value);
            td.textContent = date.toLocaleString('he-IL');
            td.className = 'text-muted';
          } catch (e) {
            td.textContent = value;
          }
        }
      } else {
        td.textContent = value;
      }
      
      td.style.fontSize = '0.85rem';
      row.appendChild(td);
    });
    
    body.appendChild(row);
  });
  
  console.log(`✅ Table ${tableType} updated with ${data.length} records`);
}

// viewTableDetails function removed - not needed for small cards

/**
 * Export table data
 * @param {string} tableType - The table type to export
 */
function exportTableData(tableType) {
  const data = window.dbTableData?.[tableType] || [];
  const tableNames = {
    'accounts': 'חשבונות מסחר',
    'trades': 'טריידים',
    'tickers': 'טיקרים',
    'trade_plans': 'תוכניות טרייד',
    'executions': 'ביצועים',
    'alerts': 'התראות',
    'notes': 'הערות',
    'cash_flows': 'תזרימי מזומנים'
  };
  
  const tableName = tableNames[tableType] || tableType;
  
  if (data.length === 0) {
    if (window.showNotification) {
      window.showNotification(
        `אין נתונים לייצוא עבור ${tableName}`,
        'warning',
        'system'
      );
    }
    return;
  }
  
  // Create CSV content
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${tableName}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (window.showNotification) {
    window.showNotification(
      `נתוני ${tableName} יוצאו בהצלחה`,
      'success',
      'system'
    );
  }
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
      ${window.createEditButton(`editRecord('${tableType}', ${recordId})`)}
      ${window.createDeleteButton(`deleteRecord('${tableType}', ${recordId})`)}
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
window.updateMainTableDisplay = updateMainTableDisplay;
// window.viewTableDetails removed - not needed for small cards
window.exportTableData = exportTableData;
// window.toggleSection removed - using global version from ui-utils.js
// toggleSection export removed - use toggleSection('main') instead
window.addRecord = addRecord;
// window.sortTable export removed - using global version from tables.js
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
// window.copyDetailedLog export removed - using global version from system-management.js
// window.generateDetailedLog export removed - local function only

/**
 * Generate detailed log for Database Display
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - תצוגת בסיס נתונים ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // 1. מצב כללי של העמוד
    log.push('--- מצב כללי של העמוד ---');
    const sections = document.querySelectorAll('.content-section, .section');
    sections.forEach((section, index) => {
        const header = section.querySelector('.section-header, h2, h3');
        const body = section.querySelector('.section-body, .card-body');
        const isOpen = body && body.style.display !== 'none' && !section.classList.contains('collapsed');
        const title = header ? header.textContent.trim() : `סקשן ${index + 1}`;
        log.push(`  ${index + 1}. "${title}": ${isOpen ? 'פתוח' : 'סגור'}`);
    });

    // 2. סטטיסטיקות בסיס נתונים
    log.push('');
    log.push('--- סטטיסטיקות בסיס נתונים ---');
    const dbStats = [
        'accountsStats', 'tradesStats', 'tickersStats', 'tradePlansStats', 
        'alertsStats', 'cashFlowsStats'
    ];
    
    dbStats.forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${statId}: ${value} (${visible})`);
        }
    });

    // 3. טבלאות נתונים
    log.push('');
    log.push('--- טבלאות נתונים ---');
    const tableSections = [
        'tradePlansSection', 'tradesSection', 'accountsSection', 
        'tickersSection', 'executionsSection', 'alertsSection', 'notesSection'
    ];
    
    tableSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const countElement = document.getElementById(sectionId.replace('Section', 'Count'));
            const count = countElement ? countElement.textContent.trim() : 'לא ידוע';
            const visible = section.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${sectionId}: ${count} רשומות (${visible})`);
        }
    });

    // 4. כפתורים וקונטרולים
    log.push('');
    log.push('--- כפתורים וקונטרולים ---');
    const buttonIds = [
        'addRecordBtn', 'editRecordBtn', 'deleteRecordBtn', 'filterBtn',
        'exportBtn', 'refreshBtn', 'searchBtn'
    ];
    
    buttonIds.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const visible = btn.offsetParent !== null ? 'נראה' : 'לא נראה';
            const disabled = btn.disabled ? 'מבוטל' : 'פעיל';
            const text = btn.textContent.trim() || btn.value || 'ללא טקסט';
            log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
        }
    });

    // 5. פילטרים וחיפוש
    log.push('');
    log.push('--- פילטרים וחיפוש ---');
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="חיפוש"], input[placeholder*="search"]');
    if (searchInput) {
        const value = searchInput.value || 'ריק';
        const visible = searchInput.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`חיפוש: "${value}" (${visible})`);
    }

    const filters = document.querySelectorAll('.filter, .form-select, select');
    filters.forEach((filter, index) => {
        const value = filter.value || 'לא נבחר';
        const visible = filter.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`פילטר ${index + 1}: "${value}" (${visible})`);
    });

    // 6. מידע טכני
    log.push('');
    log.push('--- מידע טכני ---');
    log.push(`זמן יצירת הלוג: ${timestamp}`);
    log.push(`גרסת דפדפן: ${navigator.userAgent}`);
    log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
    log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
    
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        log.push(`זמן טעינת עמוד: ${loadTime}ms`);
    }
    
    if (navigator.deviceMemory) {
        log.push(`זיכרון זמין: ${navigator.deviceMemory}GB`);
    }
    
    log.push(`שפת דפדפן: ${navigator.language}`);
    log.push(`פלטפורמה: ${navigator.platform}`);

    // 7. שגיאות והערות מהקונסולה
    log.push('');
    log.push('--- שגיאות והערות מהקונסולה ---');
    log.push('⚠️ חשוב: הלוג המפורט חייב לכלול שגיאות קונסולה לאבחון בעיות');
    log.push('📋 הוראות: פתח את Developer Tools (F12) > Console');
    log.push('📋 העתק את כל השגיאות וההערות מהקונסולה');
    log.push('📋 הוסף אותן ללוג המפורט לפני שליחה');

    log.push('');
    log.push('=== סוף לוג ===');
    return log.join('\n');
}

// Local copyDetailedLog function for db_display page
async function copyDetailedLog() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את כל מה שרואה המשתמש בעמוד');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('לוג מפורט הועתק ללוח', 'success');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        }
    } catch (error) {
        console.error('שגיאה בהעתקת הלוג המפורט:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}

// Initialize when DOM is loaded
// DOMContentLoaded removed - handled by unified system via PAGE_CONFIGS in core-systems.js
// Initialization function already exists: initDatabaseDisplay() - will be called from PAGE_CONFIGS

// console.log('✅ DB Display script loaded successfully');
