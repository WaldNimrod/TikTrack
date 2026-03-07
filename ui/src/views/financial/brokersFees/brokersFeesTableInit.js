/**
 * Brokers Fees Table Initialization - Initialize table managers
 * -----------------------------------------------------------------
 * אתחול Table Managers עבור Brokers Fees Table
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

import { loadBrokersFeesData } from './brokersFeesDataLoader.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { showBrokerFeeFormModal } from './brokersFeesForm.js';

// Import masked log utility for security compliance
import { maskedLog } from '../../../utils/maskedLog.js';

// Load table formatters (available via window.tableFormatters)
// Ensure tableFormatters.js is loaded before this script
const formatCommissionValue = window.tableFormatters?.formatCommissionValue || function(value, type) {
  return String(value || '');
};
const formatCurrency = window.tableFormatters?.formatCurrency || function(amount, currency) {
  return `${currency || '$'}${Number(amount || 0).toFixed(2)}`;
};

(function initBrokersFeesTable() {
  'use strict';
  
  let currentFilters = { tradingAccountId: null, broker: null, commissionType: null, search: null };
  let currentPage = 1;
  let currentPageSize = 25;
  let tableData = { data: [], total: 0 };
  
  /**
   * Gate A Fix: Check if user has auth token
   */
  function isAuthenticated() {
    try {
      return !!(localStorage.getItem('access_token') || localStorage.getItem('authToken') ||
        sessionStorage.getItem('access_token') || sessionStorage.getItem('authToken'));
    } catch (_) {
      return false;
    }
  }

  /**
   * Initialize all table managers
   * Gate A Fix: Skip loadInitialData for guests - prevents 401
   * Brokers list: clear loading state also when not authenticated (shows "—")
   */
  function initializeTableManagers() {
    const runInit = () => {
      initTable();
      if (isAuthenticated()) {
        loadInitialData();
      } else {
        updateBrokersList([]);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runInit);
    } else {
      runInit();
    }
  }
  
  /**
   * Initialize table
   */
  function initTable() {
    const brokersTable = document.querySelector('#brokersTable');
    if (brokersTable && window.PhoenixTableSortManager && window.PhoenixTableFilterManager) {
      const sortManager = new window.PhoenixTableSortManager(brokersTable);
      const filterManager = new window.PhoenixTableFilterManager(brokersTable);
      
      brokersTable.addEventListener('phoenix-table-sorted', function(e) {
        const { sortKey, sortDirection } = e.detail;
        if (sortKey && sortDirection) {
          sortTableData(sortKey, sortDirection);
        }
      });
    }
    
    initPaginationHandlers();
    initTradingAccountFilter();
  }

  /**
   * Initialize trading account filter (ADR-015: filter fees by account)
   */
  async function initTradingAccountFilter() {
    const select = document.getElementById('tradingAccountFilterSelect');
    if (!select) return;

    try {
      await sharedServices.init();
      const response = await sharedServices.get('/trading_accounts', {});
      const accounts = response?.data ?? response ?? [];
      const arr = Array.isArray(accounts) ? accounts : [];

      select.innerHTML = '<option value="">כל החשבונות</option>';
      arr.forEach((acc) => {
        const id = acc.externalUlid ?? acc.id ?? acc.external_ulid ?? '';
        const name = acc.displayName ?? acc.accountName ?? acc.display_name ?? acc.account_name ?? id;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = name;
        select.appendChild(opt);
      });

      select.addEventListener('change', function() {
        currentFilters.tradingAccountId = this.value?.trim() || null;
        currentPage = 1;
        loadAllData();
      });
    } catch (e) {
      maskedLog('[Brokers Fees] Error loading trading accounts for filter:', { errorCode: e?.code });
    }
  }
  
  /**
   * Initialize pagination handlers
   */
  function initPaginationHandlers() {
    const pageSizeSelect = document.querySelector('.js-table-page-size[data-table-id="brokersTable"]');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', function(e) {
        currentPageSize = parseInt(e.target.value);
        currentPage = 1;
        loadTableData();
      });
    }
    
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
          currentPage--;
          loadTableData();
        }
      });
    }
    
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(tableData.total / currentPageSize);
        if (currentPage < totalPages) {
          currentPage++;
          loadTableData();
        }
      });
    }
  }
  
  /**
   * Load initial data
   */
  async function loadInitialData() {
    await loadAllData();
  }
  
  /**
   * Load all data (summary + table)
   */
  async function loadAllData() {
    try {
      const result = await loadBrokersFeesData({
        ...currentFilters,
        page: currentPage,
        pageSize: currentPageSize
      });
      
      tableData = result.table;
      updateSummary(result.summary, result.table);
      updateTable(result.table.data);
      updatePagination();
      updateBrokersList(result.brokersList || []);
    } catch (error) {
      // Use masked log for security compliance (prevents token leakage)
      maskedLog('Error loading brokers fees data:', { 
        errorCode: error?.code,
        status: error?.status
      });
    }
  }
  
  /**
   * Load table data only
   */
  async function loadTableData() {
    try {
      const result = await loadBrokersFeesData({
        ...currentFilters,
        page: currentPage,
        pageSize: currentPageSize
      });
      
      tableData = result.table;
      updateTable(result.table.data);
      updatePagination();
    } catch (error) {
      // Use masked log for security compliance (prevents token leakage)
      maskedLog('Error loading table data:', { 
        errorCode: error?.code,
        status: error?.status
      });
    }
  }
  
  /**
   * Update brokers list in info-summary (from GET /reference/brokers)
   * רק ברוקרים נתמכים, טקסט פשוט עם פסיקים
   * מקור: GET /reference/brokers — מוצג רשימה או "—" אם אין נתונים
   */
  function updateBrokersList(brokers) {
    const listEl = document.getElementById('brokersList');
    if (!listEl) return;
    const items = Array.isArray(brokers) ? brokers : [];
    const supported = items.filter(b => (b.isSupported ?? b.is_supported ?? true) !== false);
    if (supported.length === 0) {
      listEl.textContent = '—';
      return;
    }
    listEl.textContent = supported
      .map(b => b.displayName ?? b.display_name ?? b.label ?? b.value ?? String(b))
      .join(', ');
  }

  /**
   * Update summary section
   * @param {Object} summary - Summary from API
   * @param {Object} tableResult - Table data result (used as fallback when summary count is 0)
   */
  function updateSummary(summary, tableResult) {
    const totalBrokersEl = document.getElementById('totalBrokers');
    const activeBrokersEl = document.getElementById('activeBrokers');
    const avgCommissionEl = document.getElementById('avgCommissionPerTrade');
    const monthlyFixedEl = document.getElementById('monthlyFixedCommissions');
    const yearlyFixedEl = document.getElementById('yearlyFixedCommissions');
    const tableBrokersCountEl = document.getElementById('tableBrokersCount');
    
    // Fallback: use table count when summary returns 0 but table has records
    const tableCount = tableResult ? (tableResult.total ?? tableResult.data?.length ?? 0) : 0;
    const displayCount = Math.max(summary.activeBrokers || 0, summary.totalBrokers || 0, tableCount);
    
    if (totalBrokersEl) totalBrokersEl.textContent = Math.max(summary.totalBrokers || 0, tableCount);
    if (activeBrokersEl) activeBrokersEl.textContent = displayCount;
    if (avgCommissionEl) {
      const span = avgCommissionEl.querySelector('span');
      if (span) span.textContent = formatCurrency(summary.avgCommissionPerTrade || 0, 'USD');
    }
    if (monthlyFixedEl) {
      const span = monthlyFixedEl.querySelector('span');
      if (span) span.textContent = formatCurrency(summary.monthlyFixedCommissions || 0, 'USD');
    }
    if (yearlyFixedEl) {
      const span = yearlyFixedEl.querySelector('span');
      if (span) span.textContent = formatCurrency(summary.yearlyFixedCommissions || 0, 'USD');
    }
    if (tableBrokersCountEl) tableBrokersCountEl.textContent = `${displayCount} ברוקרים פעילים`;
  }
  
  /**
   * Update table with data
   */
  function updateTable(data) {
    const tbody = document.getElementById('brokersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.innerHTML = '<td colspan="5" class="phoenix-table__cell phoenix-table__cell--empty">אין נתונים להצגה</td>';
      tbody.appendChild(row);
      return;
    }
    
    data.forEach(broker => {
      // Use externalUlid if available, otherwise use id
      const brokerId = broker.externalUlid || broker.external_ulid || broker.id || '';
      
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.setAttribute('data-broker-id', brokerId);
      
      // Account name (ADR-015: fees per trading account)
      const accountCell = document.createElement('td');
      accountCell.className = 'phoenix-table__cell col-broker col-account';
      accountCell.setAttribute('data-field', 'account_name');
      accountCell.textContent = broker.accountName || broker.account_name || broker.broker || '';
      row.appendChild(accountCell);
      
      // Commission type (badge)
      const typeCell = document.createElement('td');
      typeCell.className = 'phoenix-table__cell col-commission-type';
      typeCell.setAttribute('data-field', 'commission_type');
      const badge = document.createElement('span');
      badge.className = 'phoenix-table__status-badge commission-type-badge';
      const commissionType = (broker.commissionType || '').toLowerCase();
      if (commissionType === 'tiered') {
        badge.className += ' commission-type-badge--tiered';
      } else if (commissionType === 'flat') {
        badge.className += ' commission-type-badge--flat';
      }
      badge.textContent = broker.commissionType || '';
      typeCell.appendChild(badge);
      row.appendChild(typeCell);
      
      // Commission value
      const valueCell = document.createElement('td');
      valueCell.className = 'phoenix-table__cell col-commission-value phoenix-table__cell--numeric';
      valueCell.setAttribute('data-field', 'commission_value');
      valueCell.textContent = formatCommissionValue(broker.commissionValue || '', broker.commissionType || '');
      row.appendChild(valueCell);
      
      // Minimum
      const minimumCell = document.createElement('td');
      minimumCell.className = 'phoenix-table__cell col-minimum phoenix-table__cell--numeric phoenix-table__cell--currency';
      minimumCell.setAttribute('data-field', 'minimum');
      minimumCell.setAttribute('data-currency', 'USD');
      const minimumSpan = document.createElement('span');
      minimumSpan.className = 'numeric-value-positive';
      minimumSpan.setAttribute('dir', 'ltr');
      minimumSpan.textContent = formatCurrency(broker.minimum || 0, 'USD');
      minimumCell.appendChild(minimumSpan);
      row.appendChild(minimumCell);
      
      // Actions
      const actionsCell = document.createElement('td');
      actionsCell.className = 'phoenix-table__cell col-actions phoenix-table__cell--actions';
      actionsCell.setAttribute('data-field', 'actions');
      actionsCell.innerHTML = `
        <div class="table-actions-tooltip">
          <button class="table-actions-trigger" aria-label="פעולות">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          <div class="table-actions-menu">
            <button class="table-action-btn js-action-view" aria-label="צפה" title="צפה" data-broker-id="${broker.id || ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="table-action-btn js-action-edit" aria-label="ערוך" title="ערוך" data-broker-id="${broker.id || ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="מחק" title="מחק" data-broker-id="${broker.id || ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      row.appendChild(actionsCell);
      
      tbody.appendChild(row);
    });
    
    // Initialize action handlers
    initActionHandlers();
    initAddButton();
  }
  
  /**
   * Initialize add button handler
   */
  function initAddButton() {
    const addButton = document.querySelector('.js-add-broker-fee');
    if (addButton) {
      addButton.addEventListener('click', function(e) {
        e.preventDefault();
        handleAddBrokerFee();
      });
    }
  }
  
  /**
   * Initialize action handlers
   */
  function initActionHandlers() {
    const viewButtons = document.querySelectorAll('.js-action-view');
    const editButtons = document.querySelectorAll('.js-action-edit');
    const deleteButtons = document.querySelectorAll('.js-action-delete');
    
    viewButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const brokerId = this.getAttribute('data-broker-id');
        handleViewBrokerFee(brokerId);
      });
    });
    
    editButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const brokerId = this.getAttribute('data-broker-id');
        handleEditBrokerFee(brokerId);
      });
    });
    
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const brokerId = this.getAttribute('data-broker-id');
        handleDeleteBrokerFee(brokerId);
      });
    });
  }
  
  /**
   * Handle view broker fee action
   */
  async function handleViewBrokerFee(brokerId) {
    // Find broker fee in current table data
    const brokerFee = tableData.data?.find(b => b.id === brokerId || b.externalUlid === brokerId);
    if (brokerFee) {
      showBrokerFeeModal(brokerFee, 'view');
    } else {
      // Try to fetch from API if not found in table
      try {
        await sharedServices.init();
        const response = await sharedServices.get(`/brokers_fees/${brokerId}`);
        showBrokerFeeModal(response.data || response, 'view');
      } catch (error) {
        maskedLog('[Brokers Fees] Error viewing broker fee:', {
          errorCode: error.code,
          status: error.status
        });
        alert('שגיאה בטעינת פרטי העמלה');
      }
    }
  }
  
  /**
   * Handle edit broker fee action
   */
  async function handleEditBrokerFee(brokerId) {
    // Find broker fee in current table data
    const brokerFee = tableData.data?.find(b => b.id === brokerId || b.externalUlid === brokerId);
    if (brokerFee) {
      showBrokerFeeModal(brokerFee, 'edit');
    } else {
      // Try to fetch from API if not found in table
      try {
        await sharedServices.init();
        const response = await sharedServices.get(`/brokers_fees/${brokerId}`);
        showBrokerFeeModal(response.data || response, 'edit');
      } catch (error) {
        maskedLog('[Brokers Fees] Error loading broker fee for edit:', {
          errorCode: error.code,
          status: error.status
        });
        alert('שגיאה בטעינת פרטי העמלה לעריכה');
      }
    }
  }
  
  /**
   * Handle delete broker fee action
   */
  async function handleDeleteBrokerFee(brokerId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק את העמלה?')) {
      return;
    }
    
    try {
      await sharedServices.init();
      await sharedServices.delete(`/brokers_fees/${brokerId}`);
      // Reload table data
      loadTableData();
      maskedLog('[Brokers Fees] Broker fee deleted successfully', { brokerId });
    } catch (error) {
      maskedLog('[Brokers Fees] Error deleting broker fee:', {
        errorCode: error.code,
        status: error.status
      });
      alert('שגיאה במחיקת העמלה');
    }
  }
  
  /**
   * Handle add new broker fee action
   */
  function handleAddBrokerFee() {
    const preselectedId = currentFilters.tradingAccountId || currentFilters.trading_account_id || '';
    showBrokerFeeModal(null, 'add', preselectedId);
  }
  
  /**
   * Show broker fee modal (view/edit/add)
   * @param {Object} data - Fee data (for edit/view) or null (for add)
   * @param {string} mode - 'view' | 'edit' | 'add'
   * @param {string} preselectedAccountId - For add mode: pre-select trading account
   */
  function showBrokerFeeModal(data, mode, preselectedAccountId = '') {
    if (mode === 'view') {
      alert(`צפייה בעמלה:\n${JSON.stringify(data, null, 2)}`);
    } else if (mode === 'edit') {
      showBrokerFeeFormModal(data, function(formData, originalData) {
        return handleSaveBrokerFee(originalData.externalUlid || originalData.id, formData);
      });
    } else if (mode === 'add') {
      showBrokerFeeFormModal(null, function(formData) {
        return handleSaveBrokerFee(null, formData);
      }, preselectedAccountId);
    }
  }
  
  // Export for use by add button if exists
  window.handleAddBrokerFee = handleAddBrokerFee;
  
  /**
   * Handle save broker fee (create or update) — ADR-015: trading_account_id required
   */
  async function handleSaveBrokerFee(brokerId, brokerFeeData) {
    try {
      await sharedServices.init();

      const commissionValueRaw = brokerFeeData.commissionValue ?? brokerFeeData.commission_value ?? 0;
      let commissionValue;
      if (typeof commissionValueRaw === 'string') {
        const parsed = parseFloat(commissionValueRaw);
        commissionValue = isNaN(parsed) ? 0 : parsed;
      } else if (typeof commissionValueRaw === 'number') {
        commissionValue = commissionValueRaw;
      } else {
        commissionValue = 0;
      }

      const minimum = typeof brokerFeeData.minimum === 'number'
        ? brokerFeeData.minimum
        : parseFloat(brokerFeeData.minimum) || 0;

      const tradingAccountId = brokerFeeData.tradingAccountId ?? brokerFeeData.trading_account_id ?? '';

      const apiData = {
        trading_account_id: tradingAccountId,
        commission_type: brokerFeeData.commissionType ?? brokerFeeData.commission_type ?? 'TIERED',
        commission_value: commissionValue,
        minimum: minimum
      };

      maskedLog('[Brokers Fees] Sending data to API:', {
        trading_account_id: apiData.trading_account_id,
        commission_type: apiData.commission_type
      });

      const idToUse = brokerFeeData.externalUlid ?? brokerId;

      if (idToUse) {
        await sharedServices.put(`/brokers_fees/${idToUse}`, apiData);
        maskedLog('[Brokers Fees] Broker fee updated successfully', { id: idToUse });
      } else {
        await sharedServices.post('/brokers_fees', apiData);
        maskedLog('[Brokers Fees] Broker fee created successfully');
      }
      
      // Reload table data
      loadTableData();
    } catch (error) {
      maskedLog('[Brokers Fees] Error saving broker fee:', {
        errorCode: error.code,
        status: error.status,
        details: error.details
      });
      
      // Show user-friendly error message
      let errorMessage = 'שגיאה בשמירת העמלה';
      
      // Handle validation errors with field details
      if (error.code === 'VALIDATION_FIELD_REQUIRED' || error.status === 422) {
        // Try to extract detailed error information
        let detailedMessage = error.message || '';
        
        // Check if error.details contains field-specific information
        if (error.details) {
          if (error.details.field) {
            const fieldName = error.details.field === 'commission_value' ? 'ערך עמלה' :
                            error.details.field === 'commission_type' ? 'סוג עמלה' :
                            error.details.field === 'trading_account_id' ? 'חשבון מסחר' :
                            error.details.field === 'minimum' ? 'מינימום' :
                            error.details.field;
            detailedMessage = `שגיאה בשדה ${fieldName}: ${error.details.message || error.message || 'אנא מלא את השדה הנדרש'}`;
          } else if (typeof error.details === 'object') {
            // Check for Pydantic validation errors format
            const detailKeys = Object.keys(error.details);
            if (detailKeys.length > 0) {
              const firstError = error.details[detailKeys[0]];
              if (Array.isArray(firstError) && firstError.length > 0) {
                detailedMessage = firstError[0];
              } else if (typeof firstError === 'string') {
                detailedMessage = firstError;
              }
            }
          }
        }
        
        if (detailedMessage && detailedMessage !== error.message) {
          errorMessage = detailedMessage;
        } else {
          errorMessage = error.message || 'אנא מלא את כל השדות הנדרשים';
        }
      } else if (error.message_i18n || error.message) {
        errorMessage = error.message_i18n || error.message;
      }
      
      // Log full error for debugging (will be masked)
      maskedLog('[Brokers Fees] Full error details:', {
        code: error.code,
        status: error.status,
        message: error.message,
        details: error.details
      });
      
      alert(errorMessage);
      throw error; /* D16: Re-throw so modal stays open on error */
    }
  }
  
  /**
   * Sort table data
   */
  function sortTableData(sortKey, sortDirection) {
    // Client-side sorting (if data is already loaded)
    // Otherwise, reload from server with sort params
    loadTableData();
  }
  
  /**
   * Update pagination UI
   */
  function updatePagination() {
    const paginationInfo = document.getElementById('paginationInfo');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    const totalPages = Math.ceil(tableData.total / currentPageSize);
    const start = (currentPage - 1) * currentPageSize + 1;
    const end = Math.min(currentPage * currentPageSize, tableData.total);
    
    if (paginationInfo) {
      paginationInfo.textContent = `מציג ${start}-${end} מתוך ${tableData.total} רשומות`;
    }
    
    if (pageNumbers) {
      pageNumbers.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'phoenix-table-pagination__page-number';
        if (i === currentPage) {
          pageBtn.className += ' phoenix-table-pagination__page-number--active';
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', function() {
          currentPage = i;
          loadTableData();
        });
        pageNumbers.appendChild(pageBtn);
      }
    }
    
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage === 1;
    }
    
    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage >= totalPages;
    }
  }
  
  /**
   * Update filters (called from header handlers or trading account filter)
   */
  window.updateBrokersFeesFilters = function(filters) {
    currentFilters = { ...currentFilters, ...filters };
    currentPage = 1;
    loadAllData();
  };
  
  // Auto-initialize
  initializeTableManagers();
})();
