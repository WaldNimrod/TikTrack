/**
 * Cash Flows Table Initialization - Initialize table managers
 * -----------------------------------------------------------------
 * אתחול Table Managers עבור Cash Flows Tables (2 tables: Cash Flows + Currency Conversions)
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

import { loadCashFlowsData } from './cashFlowsDataLoader.js';
import sharedServices from '../../../components/core/Shared_Services.js';
import { showCashFlowFormModal } from './cashFlowsForm.js';

// Import masked log utility for security compliance
import { maskedLog } from '../../../utils/maskedLog.js';

// Load table formatters (available via window.tableFormatters)
// Ensure tableFormatters.js is loaded before this script
const formatCurrency = window.tableFormatters?.formatCurrency || function(amount, currency) {
  return `${currency || '$'}${Number(amount || 0).toFixed(2)}`;
};
const formatDate = window.tableFormatters?.formatDate || function(date) {
  return date || '';
};

/**
 * Validate ULID format
 * ULID format: 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
 * Gate B Fix: Prevent sending invalid tradingAccountId (e.g., "הכול", account names) to API
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid ULID
 */
function isValidULID(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  // ULID is 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
  const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
  return ulidRegex.test(value);
}

/**
 * Normalize tradingAccountId - only return if valid ULID
 * Gate B Fix: Prevent sending invalid tradingAccountId (e.g., "הכול", account names) to API
 * @param {any} value - Filter value
 * @returns {string|undefined} Valid ULID or undefined
 */
function normalizeTradingAccountId(value) {
  if (!value || typeof value !== 'string') {
    return undefined;
  }
  // If value is "הכול" or empty string, return undefined
  if (value === 'הכול' || value === '' || value === null || value === undefined) {
    return undefined;
  }
  // If value is a valid ULID, return it
  if (isValidULID(value)) {
    return value;
  }
  // Otherwise, return undefined (don't send invalid values)
  return undefined;
}

(function initCashFlowsTables() {
  'use strict';
  
  let currentFilters = {};
  let cashFlowsPage = 1;
  let cashFlowsPageSize = 25;
  let currencyConversionsPage = 1;
  let currencyConversionsPageSize = 25;
  let cashFlowsData = { data: [], total: 0 };
  let currencyConversionsData = { data: [], total: 0 };
  
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
   */
  function initializeTableManagers() {
    const runInit = () => {
      initTables();
      initAddButton();
      if (isAuthenticated()) {
        loadInitialData();
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runInit);
    } else {
      runInit();
    }
  }
  
  /**
   * Initialize add button handler
   */
  function initAddButton() {
    const addButton = document.querySelector('.js-add-cash-flow');
    if (addButton) {
      addButton.addEventListener('click', function(e) {
        e.preventDefault();
        handleAddCashFlow();
      });
    }
  }
  
  /**
   * Initialize tables
   */
  function initTables() {
    // Initialize Cash Flows Table
    const cashFlowsTable = document.querySelector('#cashFlowsTable');
    if (cashFlowsTable && window.PhoenixTableSortManager && window.PhoenixTableFilterManager) {
      const sortManager = new window.PhoenixTableSortManager(cashFlowsTable);
      const filterManager = new window.PhoenixTableFilterManager(cashFlowsTable);
      
      // Listen to sort events
      cashFlowsTable.addEventListener('phoenix-table-sorted', function(e) {
        const { sortKey, sortDirection } = e.detail;
        if (sortKey && sortDirection) {
          loadCashFlowsTableData();
        }
      });
    }
    
    // Initialize Currency Conversions Table
    const currencyConversionsTable = document.querySelector('#currencyConversionsTable');
    if (currencyConversionsTable && window.PhoenixTableSortManager && window.PhoenixTableFilterManager) {
      const sortManager = new window.PhoenixTableSortManager(currencyConversionsTable);
      const filterManager = new window.PhoenixTableFilterManager(currencyConversionsTable);
      
      // Listen to sort events
      currencyConversionsTable.addEventListener('phoenix-table-sorted', function(e) {
        const { sortKey, sortDirection } = e.detail;
        if (sortKey && sortDirection) {
          loadCurrencyConversionsTableData();
        }
      });
    }
    
    // Initialize pagination handlers
    initPaginationHandlers();
    
    // Initialize internal filter handlers
    initInternalFilterHandlers();
  }
  
  /**
   * Initialize pagination handlers
   */
  function initPaginationHandlers() {
    // Cash Flows pagination
    const cashFlowsPageSizeSelect = document.querySelector('.js-table-page-size[data-table-id="cashFlowsTable"]');
    const cashFlowsPrevPageBtn = document.getElementById('cashFlowsPrevPageBtn');
    const cashFlowsNextPageBtn = document.getElementById('cashFlowsNextPageBtn');
    
    if (cashFlowsPageSizeSelect) {
      cashFlowsPageSizeSelect.addEventListener('change', function(e) {
        cashFlowsPageSize = parseInt(e.target.value);
        cashFlowsPage = 1;
        loadCashFlowsTableData();
      });
    }
    
    if (cashFlowsPrevPageBtn) {
      cashFlowsPrevPageBtn.addEventListener('click', function() {
        if (cashFlowsPage > 1) {
          cashFlowsPage--;
          loadCashFlowsTableData();
        }
      });
    }
    
    if (cashFlowsNextPageBtn) {
      cashFlowsNextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(cashFlowsData.total / cashFlowsPageSize);
        if (cashFlowsPage < totalPages) {
          cashFlowsPage++;
          loadCashFlowsTableData();
        }
      });
    }
    
    // Currency Conversions pagination
    const currencyConversionsPageSizeSelect = document.querySelector('.js-table-page-size[data-table-id="currencyConversionsTable"]');
    const currencyConversionsPrevPageBtn = document.getElementById('currencyConversionsPrevPageBtn');
    const currencyConversionsNextPageBtn = document.getElementById('currencyConversionsNextPageBtn');
    
    if (currencyConversionsPageSizeSelect) {
      currencyConversionsPageSizeSelect.addEventListener('change', function(e) {
        currencyConversionsPageSize = parseInt(e.target.value);
        currencyConversionsPage = 1;
        loadCurrencyConversionsTableData();
      });
    }
    
    if (currencyConversionsPrevPageBtn) {
      currencyConversionsPrevPageBtn.addEventListener('click', function() {
        if (currencyConversionsPage > 1) {
          currencyConversionsPage--;
          loadCurrencyConversionsTableData();
        }
      });
    }
    
    if (currencyConversionsNextPageBtn) {
      currencyConversionsNextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(currencyConversionsData.total / currencyConversionsPageSize);
        if (currencyConversionsPage < totalPages) {
          currencyConversionsPage++;
          loadCurrencyConversionsTableData();
        }
      });
    }
  }
  
  /**
   * Initialize internal filter handlers
   */
  function initInternalFilterHandlers() {
    const typeSelect = document.getElementById('cashFlowsType');
    
    if (typeSelect) {
      typeSelect.addEventListener('change', function() {
        cashFlowsPage = 1;
        loadAllData();
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
   * Load all data (summary + both tables)
   */
  async function loadAllData() {
    try {
      // Filters from page header (global) + flowType (internal only filter kept)
      const flowType = document.getElementById('cashFlowsType')?.value || '';
      const dateRange = currentFilters?.dateRange;
      const tradingAccountId = currentFilters?.tradingAccount || undefined;
      const search = currentFilters?.search || undefined;
      const dateFromFromRange = dateRange?.from || undefined;
      const dateToFromRange = dateRange?.to || undefined;
      
      const filters = {
        dateFrom: dateFromFromRange,
        dateTo: dateToFromRange,
        tradingAccountId: tradingAccountId,
        flowType: flowType || undefined,
        search: search || currentFilters?.search || undefined,
        page: cashFlowsPage,
        pageSize: cashFlowsPageSize
      };
      
      const result = await loadCashFlowsData(filters);
      
      cashFlowsData = result.cashFlows;
      currencyConversionsData = result.currencyConversions;
      
      updateSummary(result.summary);
      updateCashFlowsTable(result.cashFlows.data);
      updateCurrencyConversionsTable(result.currencyConversions.data);
      updateCashFlowsPagination();
      updateCurrencyConversionsPagination();
    } catch (error) {
      // Gate B Fix: Handle errors gracefully - don't log full error object
      // Use masked log for security compliance (prevents token leakage)
      maskedLog('Error loading cash flows data:', { 
        errorCode: error?.code,
        status: error?.status
      });
    }
  }
  
  /**
   * Load Cash Flows table data only
   */
  async function loadCashFlowsTableData() {
    try {
      const flowType = document.getElementById('cashFlowsType')?.value || '';
      const dateRange = currentFilters?.dateRange;
      const tradingAccountId = normalizeTradingAccountId(currentFilters?.tradingAccount);
      const search = currentFilters?.search || undefined;
      const dateFromFromRange = dateRange?.from || undefined;
      const dateToFromRange = dateRange?.to || undefined;
      
      const filters = {
        dateFrom: dateFromFromRange,
        dateTo: dateToFromRange,
        tradingAccountId: tradingAccountId, // Will be undefined if not valid ULID
        flowType: flowType || undefined,
        search: search || currentFilters?.search || undefined,
        page: cashFlowsPage,
        pageSize: cashFlowsPageSize
      };
      
      const result = await loadCashFlowsData(filters);
      
      cashFlowsData = result.cashFlows;
      updateCashFlowsTable(result.cashFlows.data);
      updateCashFlowsPagination();
    } catch (error) {
      // Use masked log for security compliance (prevents token leakage)
      maskedLog('Error loading cash flows table data:', { 
        errorCode: error?.code,
        status: error?.status
      });
    }
  }
  
  /**
   * Load Currency Conversions table data only
   */
  async function loadCurrencyConversionsTableData() {
    try {
      const dateRange = currentFilters?.dateRange;
      const tradingAccountId = normalizeTradingAccountId(currentFilters?.tradingAccount);
      const dateFromFromRange = dateRange?.from || undefined;
      const dateToFromRange = dateRange?.to || undefined;
      
      const filters = {
        dateFrom: dateFromFromRange,
        dateTo: dateToFromRange,
        tradingAccountId: tradingAccountId, // Will be undefined if not valid ULID
        page: currencyConversionsPage,
        pageSize: currencyConversionsPageSize
      };
      
      const result = await loadCashFlowsData(filters);
      
      currencyConversionsData = result.currencyConversions || { data: [], total: 0 };
      updateCurrencyConversionsTable(currencyConversionsData.data);
      updateCurrencyConversionsPagination();
    } catch (error) {
      // Gate B Fix: Handle errors gracefully - don't log as SEVERE
      // Currency conversions endpoint might not exist - use empty data
      if (error.status !== 404 && error.code !== 'HTTP_404') {
        maskedLog('Error loading currency conversions table data:', { 
          errorCode: error?.code,
          status: error?.status
        });
      }
      // Use empty data to prevent page breakage
      currencyConversionsData = { data: [], total: 0 };
      updateCurrencyConversionsTable([]);
      updateCurrencyConversionsPagination();
    }
  }
  
  /**
   * Update summary section
   */
  function updateSummary(summary) {
    const totalFlowsEl = document.getElementById('totalFlows');
    const monthlyFlowsEl = document.getElementById('monthlyFlows');
    const totalBalanceEl = document.getElementById('totalBalance');
    const monthlyDepositsEl = document.getElementById('monthlyDeposits');
    const monthlyWithdrawalsEl = document.getElementById('monthlyWithdrawals');
    const weeklyFlowsEl = document.getElementById('weeklyFlows');
    const monthlyConversionsEl = document.getElementById('monthlyConversions');
    const tableCashFlowsCountEl = document.getElementById('tableCashFlowsCount');
    const currencyConversionsCountEl = document.getElementById('currencyConversionsCount');
    
    if (totalFlowsEl) totalFlowsEl.textContent = summary.totalFlows || 0;
    if (monthlyFlowsEl) monthlyFlowsEl.textContent = summary.monthlyFlows || 0;
    if (totalBalanceEl) {
      const span = totalBalanceEl.querySelector('span');
      if (span) {
        const balance = summary.totalBalance || 0;
        span.className = balance >= 0 ? 'numeric-value-positive' : 'numeric-value-negative';
        span.textContent = formatCurrency(Math.abs(balance), 'USD');
      }
    }
    if (monthlyDepositsEl) {
      const span = monthlyDepositsEl.querySelector('span');
      if (span) span.textContent = formatCurrency(summary.monthlyDeposits || 0, 'USD');
    }
    if (monthlyWithdrawalsEl) {
      const span = monthlyWithdrawalsEl.querySelector('span');
      if (span) {
        const withdrawals = summary.monthlyWithdrawals || 0;
        span.className = withdrawals >= 0 ? 'numeric-value-positive' : 'numeric-value-negative';
        span.textContent = formatCurrency(Math.abs(withdrawals), 'USD');
      }
    }
    if (weeklyFlowsEl) weeklyFlowsEl.textContent = summary.weeklyFlows || 0;
    if (monthlyConversionsEl) monthlyConversionsEl.textContent = summary.monthlyConversions || 0;
    if (tableCashFlowsCountEl) tableCashFlowsCountEl.textContent = `${cashFlowsData.total || 0} תנועות`;
    if (currencyConversionsCountEl) currencyConversionsCountEl.textContent = `${currencyConversionsData.total || 0} המרות`;
  }
  
  /**
   * Update Cash Flows table with data
   */
  function updateCashFlowsTable(data) {
    const tbody = document.getElementById('cashFlowsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.innerHTML = '<td colspan="9" class="phoenix-table__cell phoenix-table__cell--empty">אין נתונים להצגה</td>';
      tbody.appendChild(row);
      return;
    }
    
    data.forEach(flow => {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      // Use externalUlid if available, otherwise use id
      const flowId = flow.externalUlid || flow.external_ulid || flow.id || '';
      row.setAttribute('data-flow-id', flowId);
      
      // Trade - placeholder until API has trade link (ticker + long/short arrow)
      const tradeCell = document.createElement('td');
      tradeCell.className = 'phoenix-table__cell col-trade';
      tradeCell.setAttribute('data-field', 'trade');
      const tradeDisplay = flow.trade || flow.tradeId
        ? String(flow.trade || flow.tradeId)
        : '—'; // TODO: When trades linked - show ticker + ↗ (long) or ↘ (short)
      tradeCell.textContent = tradeDisplay;
      row.appendChild(tradeCell);
      
      // Account - API returns accountName (camelCase) or account_name (snake_case)
      const accountCell = document.createElement('td');
      accountCell.className = 'phoenix-table__cell col-account';
      accountCell.setAttribute('data-field', 'account');
      accountCell.textContent = flow.accountName || flow.account_name || flow.account || '—';
      row.appendChild(accountCell);
      
      // Type (badge) - API returns flowType (camelCase) or flow_type (snake_case)
      const typeCell = document.createElement('td');
      typeCell.className = 'phoenix-table__cell col-type';
      typeCell.setAttribute('data-field', 'type');
      typeCell.setAttribute('dir', 'rtl');
      const badge = document.createElement('span');
      badge.className = 'phoenix-table__status-badge operation-type-badge';
      const flowTypeVal = (flow.flowType || flow.flow_type || flow.type || '').toLowerCase();
      const flowTypeLabels = {
        deposit: 'הפקדה',
        withdrawal: 'משיכה',
        dividend: 'דיבידנד',
        interest: 'ריבית',
        fee: 'עמלה',
        other: 'אחר'
      };
      badge.setAttribute('data-operation-type', flowTypeVal);
      badge.textContent = flowTypeLabels[flowTypeVal] || flow.flowType || flow.flow_type || flow.type || '—';
      typeCell.appendChild(badge);
      row.appendChild(typeCell);
      
      // Amount
      const amountCell = document.createElement('td');
      amountCell.className = 'phoenix-table__cell col-amount phoenix-table__cell--numeric phoenix-table__cell--currency';
      amountCell.setAttribute('data-field', 'amount');
      amountCell.setAttribute('data-currency', flow.currency || 'USD');
      const amountSpan = document.createElement('span');
      const amount = flow.amount || 0;
      amountSpan.className = amount >= 0 ? 'numeric-value-positive' : 'numeric-value-negative';
      amountSpan.setAttribute('dir', 'ltr');
      amountSpan.textContent = `${amount >= 0 ? '+' : ''}${formatCurrency(Math.abs(amount), flow.currency || 'USD')}`;
      amountCell.appendChild(amountSpan);
      row.appendChild(amountCell);
      
      // Date - API returns transactionDate (camelCase) or transaction_date (snake_case)
      const dateCell = document.createElement('td');
      dateCell.className = 'phoenix-table__cell col-date phoenix-table__cell--date';
      dateCell.setAttribute('data-field', 'date');
      dateCell.textContent = formatDate(flow.transactionDate || flow.transaction_date || flow.date || '');
      row.appendChild(dateCell);
      
      // Description
      const descriptionCell = document.createElement('td');
      descriptionCell.className = 'phoenix-table__cell col-description';
      descriptionCell.setAttribute('data-field', 'description');
      descriptionCell.textContent = flow.description || '';
      row.appendChild(descriptionCell);
      
      // Source - API may return externalReference (camelCase) as source
      const sourceCell = document.createElement('td');
      sourceCell.className = 'phoenix-table__cell col-source';
      sourceCell.setAttribute('data-field', 'source');
      sourceCell.textContent = flow.externalReference || flow.external_reference || flow.source || '—';
      row.appendChild(sourceCell);
      
      // Updated - API does not currently return updated_at; show when available
      const updatedCell = document.createElement('td');
      updatedCell.className = 'phoenix-table__cell col-updated phoenix-table__cell--date';
      updatedCell.setAttribute('data-field', 'updated');
      updatedCell.textContent = formatDate(flow.updatedAt || flow.updated_at || flow.updated || '');
      row.appendChild(updatedCell);
      
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
            <button class="table-action-btn js-action-view" aria-label="צפה" data-flow-id="${flowId}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="table-action-btn js-action-edit" aria-label="ערוך" data-flow-id="${flowId}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="מחק" data-flow-id="${flowId}">
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
    initCashFlowsActionHandlers();
  }
  
  /**
   * Update Currency Conversions table with data
   */
  function updateCurrencyConversionsTable(data) {
    const tbody = document.getElementById('currencyConversionsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.innerHTML = '<td colspan="7" class="phoenix-table__cell phoenix-table__cell--empty">אין נתונים להצגה</td>';
      tbody.appendChild(row);
      return;
    }
    
    data.forEach(conversion => {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.setAttribute('data-conversion-id', conversion.id || '');
      
      // Date
      const dateCell = document.createElement('td');
      dateCell.className = 'phoenix-table__cell col-date phoenix-table__cell--date';
      dateCell.setAttribute('data-field', 'date');
      dateCell.textContent = formatDate(conversion.date || '');
      row.appendChild(dateCell);
      
      // Account
      const accountCell = document.createElement('td');
      accountCell.className = 'phoenix-table__cell col-account';
      accountCell.setAttribute('data-field', 'account');
      accountCell.textContent = conversion.account || '';
      row.appendChild(accountCell);
      
      // From
      const fromCell = document.createElement('td');
      fromCell.className = 'phoenix-table__cell col-from phoenix-table__cell--numeric phoenix-table__cell--currency';
      fromCell.setAttribute('data-field', 'from');
      fromCell.setAttribute('data-currency', conversion.fromCurrency || 'USD');
      const fromSpan = document.createElement('span');
      fromSpan.className = 'numeric-value-negative';
      fromSpan.setAttribute('dir', 'ltr');
      fromSpan.textContent = formatCurrency(Math.abs(conversion.fromAmount || 0), conversion.fromCurrency || 'USD');
      fromCell.appendChild(fromSpan);
      const fromCurrencySpan = document.createElement('span');
      fromCurrencySpan.style.cssText = 'font-size: 0.85em; color: var(--apple-text-secondary);';
      fromCurrencySpan.textContent = ` ${conversion.fromCurrency || 'USD'}`;
      fromCell.appendChild(fromCurrencySpan);
      row.appendChild(fromCell);
      
      // To
      const toCell = document.createElement('td');
      toCell.className = 'phoenix-table__cell col-to phoenix-table__cell--numeric phoenix-table__cell--currency';
      toCell.setAttribute('data-field', 'to');
      toCell.setAttribute('data-currency', conversion.toCurrency || 'EUR');
      const toSpan = document.createElement('span');
      toSpan.className = 'numeric-value-positive';
      toSpan.setAttribute('dir', 'ltr');
      toSpan.textContent = `+${formatCurrency(Math.abs(conversion.toAmount || 0), conversion.toCurrency || 'EUR')}`;
      toCell.appendChild(toSpan);
      const toCurrencySpan = document.createElement('span');
      toCurrencySpan.style.cssText = 'font-size: 0.85em; color: var(--apple-text-secondary);';
      toCurrencySpan.textContent = ` ${conversion.toCurrency || 'EUR'}`;
      toCell.appendChild(toCurrencySpan);
      row.appendChild(toCell);
      
      // Estimated Rate
      const rateCell = document.createElement('td');
      rateCell.className = 'phoenix-table__cell col-estimated-rate phoenix-table__cell--numeric';
      rateCell.setAttribute('data-field', 'estimated_rate');
      const rateSpan = document.createElement('span');
      rateSpan.setAttribute('dir', 'ltr');
      rateSpan.textContent = (conversion.estimatedRate || 0).toFixed(2);
      rateCell.appendChild(rateSpan);
      row.appendChild(rateCell);
      
      // Identification
      const identificationCell = document.createElement('td');
      identificationCell.className = 'phoenix-table__cell col-identification';
      identificationCell.setAttribute('data-field', 'identification');
      identificationCell.textContent = conversion.identification || '';
      row.appendChild(identificationCell);
      
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
            <button class="table-action-btn js-action-view" aria-label="צפה" data-conversion-id="${conversion.id || ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="table-action-btn js-action-edit" aria-label="ערוך" data-conversion-id="${conversion.id || ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="מחק" data-conversion-id="${conversion.id || ''}">
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
    initCurrencyConversionsActionHandlers();
  }
  
  /**
   * Initialize Cash Flows action handlers
   */
  function initCashFlowsActionHandlers() {
    const viewButtons = document.querySelectorAll('#cashFlowsTableBody .js-action-view');
    const editButtons = document.querySelectorAll('#cashFlowsTableBody .js-action-edit');
    const deleteButtons = document.querySelectorAll('#cashFlowsTableBody .js-action-delete');
    
    viewButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const flowId = this.getAttribute('data-flow-id');
        handleViewCashFlow(flowId);
      });
    });
    
    editButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const flowId = this.getAttribute('data-flow-id');
        handleEditCashFlow(flowId);
      });
    });
    
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const flowId = this.getAttribute('data-flow-id');
        handleDeleteCashFlow(flowId);
      });
    });
  }
  
  /**
   * Handle view cash flow action
   */
  async function handleViewCashFlow(flowId) {
    try {
      await sharedServices.init();
      const response = await sharedServices.get(`/cash_flows/${flowId}`);
      // Show view modal/dialog with cash flow details
      showCashFlowModal(response.data, 'view');
    } catch (error) {
      maskedLog('[Cash Flows] Error viewing cash flow:', {
        errorCode: error.code,
        status: error.status
      });
      alert('שגיאה בטעינת פרטי התזרים');
    }
  }
  
  /**
   * Handle edit cash flow action
   */
  async function handleEditCashFlow(flowId) {
    try {
      await sharedServices.init();
      const response = await sharedServices.get(`/cash_flows/${flowId}`);
      // Show edit modal/dialog with cash flow data
      showCashFlowModal(response.data, 'edit');
    } catch (error) {
      maskedLog('[Cash Flows] Error loading cash flow for edit:', {
        errorCode: error.code,
        status: error.status
      });
      alert('שגיאה בטעינת פרטי התזרים לעריכה');
    }
  }
  
  /**
   * Handle delete cash flow action
   */
  async function handleDeleteCashFlow(flowId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק את התזרים?')) {
      return;
    }
    
    try {
      await sharedServices.init();
      
      // Find cash flow to get externalUlid if needed
      const flow = cashFlowsData.data?.find(f => f.id === flowId || f.externalUlid === flowId);
      const idToUse = flow?.externalUlid || flowId;
      
      await sharedServices.delete(`/cash_flows/${idToUse}`);
      // Reload table data
      await loadAllData();
      maskedLog('[Cash Flows] Cash flow deleted successfully', { flowId: idToUse });
    } catch (error) {
      maskedLog('[Cash Flows] Error deleting cash flow:', {
        errorCode: error.code,
        status: error.status
      });
      alert('שגיאה במחיקת התזרים');
    }
  }
  
  /**
   * Handle add new cash flow action
   */
  function handleAddCashFlow() {
    // Show add modal/dialog with empty form
    showCashFlowModal(null, 'add');
  }
  
  /**
   * Show cash flow modal (view/edit/add)
   */
  function showCashFlowModal(data, mode) {
    if (mode === 'view') {
      // View mode - show read-only modal
      alert(`צפייה בתזרים:\n${JSON.stringify(data, null, 2)}`);
    } else if (mode === 'edit') {
      // Edit mode - show form with existing data
      showCashFlowFormModal(data, function(formData, originalData) {
        return handleSaveCashFlow(originalData.externalUlid || originalData.id, formData);
      });
    } else if (mode === 'add') {
      // Add mode - show empty form
      showCashFlowFormModal(null, function(formData) {
        return handleSaveCashFlow(null, formData);
      });
    }
  }
  
  // Export for use by add button if exists
  window.handleAddCashFlow = handleAddCashFlow;
  
  /**
   * Handle save cash flow (create or update)
   */
  async function handleSaveCashFlow(flowId, flowData) {
    try {
      await sharedServices.init();
      
      // Prepare data for API (ensure camelCase format)
      const apiData = {
        tradingAccountId: flowData.tradingAccountId || flowData.trading_account_id,
        transactionDate: flowData.transactionDate || flowData.transaction_date,
        flowType: flowData.flowType || flowData.flow_type,
        amount: flowData.amount || 0,
        currency: flowData.currency || 'USD',
        description: flowData.description || '',
        externalReference: flowData.externalReference || flowData.external_reference || ''
      };
      
      // Remove empty optional fields
      if (!apiData.description) delete apiData.description;
      if (!apiData.externalReference) delete apiData.externalReference;
      
      // Use externalUlid if available, otherwise use flowId
      const idToUse = flowData.externalUlid || flowId;
      
      if (idToUse) {
        // Update existing
        await sharedServices.put(`/cash_flows/${idToUse}`, apiData);
        maskedLog('[Cash Flows] Cash flow updated successfully', { flowId: idToUse });
      } else {
        // Create new
        await sharedServices.post('/cash_flows', apiData);
        maskedLog('[Cash Flows] Cash flow created successfully');
      }
      
      // Reload table data
      await loadAllData();
    } catch (error) {
      maskedLog('[Cash Flows] Error saving cash flow:', {
        errorCode: error.code,
        status: error.status,
        details: error.details
      });
      
      // Show user-friendly error message
      let errorMessage = 'שגיאה בשמירת התזרים';
      
      // Handle validation errors with field details
      if (error.code === 'VALIDATION_FIELD_REQUIRED' || error.status === 422) {
        if (error.details && error.details.field) {
          // Show field-specific error if available
          const fieldName = error.details.field === 'trading_account_id' ? 'חשבון מסחר' :
                          error.details.field === 'transaction_date' ? 'תאריך פעולה' :
                          error.details.field === 'flow_type' ? 'סוג תזרים' :
                          error.details.field === 'amount' ? 'סכום' :
                          error.details.field === 'currency' ? 'מטבע' :
                          error.details.field;
          errorMessage = `שגיאה בשדה ${fieldName}: ${error.message || 'אנא מלא את השדה הנדרש'}`;
        } else {
          errorMessage = error.message || 'אנא מלא את כל השדות הנדרשים';
        }
      } else if (error.message_i18n || error.message) {
        errorMessage = error.message_i18n || error.message;
      }
      
      alert(errorMessage);
      throw error; /* D16: Re-throw so modal stays open on error */
    }
  }
  
  /**
   * Initialize Currency Conversions action handlers
   */
  function initCurrencyConversionsActionHandlers() {
    const viewButtons = document.querySelectorAll('#currencyConversionsTableBody .js-action-view');
    const editButtons = document.querySelectorAll('#currencyConversionsTableBody .js-action-edit');
    const deleteButtons = document.querySelectorAll('#currencyConversionsTableBody .js-action-delete');
    
    viewButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const conversionId = this.getAttribute('data-conversion-id');
        handleViewCurrencyConversion(conversionId);
      });
    });
    
    editButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const conversionId = this.getAttribute('data-conversion-id');
        handleEditCurrencyConversion(conversionId);
      });
    });
    
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const conversionId = this.getAttribute('data-conversion-id');
        handleDeleteCurrencyConversion(conversionId);
      });
    });
  }
  
  /**
   * Handle view currency conversion action
   */
  async function handleViewCurrencyConversion(conversionId) {
    try {
      await sharedServices.init();
      const conversion = currencyConversionsData.data?.find(c => c.id === conversionId || c.externalUlid === conversionId);
      if (conversion) {
        showCurrencyConversionModal(conversion, 'view');
      } else {
        const response = await sharedServices.get(`/cash_flows/currency_conversions/${conversionId}`);
        showCurrencyConversionModal(response.data || response, 'view');
      }
    } catch (error) {
      maskedLog('[Cash Flows] Error viewing currency conversion:', {
        errorCode: error.code,
        status: error.status
      });
      alert('שגיאה בטעינת פרטי ההמרה');
    }
  }
  
  /**
   * Handle edit currency conversion action
   */
  async function handleEditCurrencyConversion(conversionId) {
    try {
      await sharedServices.init();
      const conversion = currencyConversionsData.data?.find(c => c.id === conversionId || c.externalUlid === conversionId);
      if (conversion) {
        showCurrencyConversionModal(conversion, 'edit');
      } else {
        const response = await sharedServices.get(`/cash_flows/currency_conversions/${conversionId}`);
        showCurrencyConversionModal(response.data || response, 'edit');
      }
    } catch (error) {
      maskedLog('[Cash Flows] Error loading currency conversion for edit:', {
        errorCode: error.code,
        status: error.status
      });
      alert('שגיאה בטעינת פרטי ההמרה לעריכה');
    }
  }
  
  /**
   * Handle delete currency conversion action
   */
  async function handleDeleteCurrencyConversion(conversionId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המרת המטבע?')) {
      return;
    }
    
    try {
      await sharedServices.init();
      const conversion = currencyConversionsData.data?.find(c => c.id === conversionId || c.externalUlid === conversionId);
      const idToUse = conversion?.externalUlid || conversionId;
      
      await sharedServices.delete(`/cash_flows/currency_conversions/${idToUse}`);
      await loadAllData();
      maskedLog('[Cash Flows] Currency conversion deleted successfully', { conversionId: idToUse });
    } catch (error) {
      maskedLog('[Cash Flows] Error deleting currency conversion:', {
        errorCode: error.code,
        status: error.status
      });
      alert('שגיאה במחיקת המרת המטבע');
    }
  }
  
  /**
   * Show currency conversion modal (view/edit)
   * Note: Currency conversions are typically read-only, but we support view/edit for consistency
   */
  function showCurrencyConversionModal(data, mode) {
    if (mode === 'view') {
      alert(`צפייה בהמרת מטבע:\n${JSON.stringify(data, null, 2)}`);
    } else if (mode === 'edit') {
      // Currency conversions are typically read-only, but if edit is needed:
      alert(`עריכת המרת מטבע:\n${JSON.stringify(data, null, 2)}\n\nהערה: המרות מטבע הן בדרך כלל לקריאה בלבד.`);
    }
  }
  
  /**
   * Update Cash Flows pagination UI
   */
  function updateCashFlowsPagination() {
    const paginationInfo = document.getElementById('cashFlowsPaginationInfo');
    const pageNumbers = document.getElementById('cashFlowsPageNumbers');
    const prevPageBtn = document.getElementById('cashFlowsPrevPageBtn');
    const nextPageBtn = document.getElementById('cashFlowsNextPageBtn');
    
    const totalPages = Math.ceil(cashFlowsData.total / cashFlowsPageSize);
    const start = (cashFlowsPage - 1) * cashFlowsPageSize + 1;
    const end = Math.min(cashFlowsPage * cashFlowsPageSize, cashFlowsData.total);
    
    if (paginationInfo) {
      paginationInfo.textContent = `מציג ${start}-${end} מתוך ${cashFlowsData.total} רשומות`;
    }
    
    if (pageNumbers) {
      pageNumbers.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'phoenix-table-pagination__page-number';
        if (i === cashFlowsPage) {
          pageBtn.className += ' phoenix-table-pagination__page-number--active';
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', function() {
          cashFlowsPage = i;
          loadCashFlowsTableData();
        });
        pageNumbers.appendChild(pageBtn);
      }
    }
    
    if (prevPageBtn) {
      prevPageBtn.disabled = cashFlowsPage === 1;
    }
    
    if (nextPageBtn) {
      nextPageBtn.disabled = cashFlowsPage >= totalPages;
    }
  }
  
  /**
   * Update Currency Conversions pagination UI
   */
  function updateCurrencyConversionsPagination() {
    const paginationInfo = document.getElementById('currencyConversionsPaginationInfo');
    const pageNumbers = document.getElementById('currencyConversionsPageNumbers');
    const prevPageBtn = document.getElementById('currencyConversionsPrevPageBtn');
    const nextPageBtn = document.getElementById('currencyConversionsNextPageBtn');
    
    const totalPages = Math.ceil(currencyConversionsData.total / currencyConversionsPageSize);
    const start = (currencyConversionsPage - 1) * currencyConversionsPageSize + 1;
    const end = Math.min(currencyConversionsPage * currencyConversionsPageSize, currencyConversionsData.total);
    
    if (paginationInfo) {
      paginationInfo.textContent = `מציג ${start}-${end} מתוך ${currencyConversionsData.total} רשומות`;
    }
    
    if (pageNumbers) {
      pageNumbers.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'phoenix-table-pagination__page-number';
        if (i === currencyConversionsPage) {
          pageBtn.className += ' phoenix-table-pagination__page-number--active';
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', function() {
          currencyConversionsPage = i;
          loadCurrencyConversionsTableData();
        });
        pageNumbers.appendChild(pageBtn);
      }
    }
    
    if (prevPageBtn) {
      prevPageBtn.disabled = currencyConversionsPage === 1;
    }
    
    if (nextPageBtn) {
      nextPageBtn.disabled = currencyConversionsPage >= totalPages;
    }
  }
  
  /**
   * Update filters (called from header handlers)
   */
  window.updateCashFlowsFilters = function(filters) {
    currentFilters = filters;
    cashFlowsPage = 1;
    currencyConversionsPage = 1;
    loadAllData();
  };
  
  // Auto-initialize
  initializeTableManagers();
})();
