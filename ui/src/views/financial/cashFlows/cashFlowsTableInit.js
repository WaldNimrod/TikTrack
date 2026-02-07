/**
 * Cash Flows Table Initialization - Initialize table managers
 * -----------------------------------------------------------------
 * אתחול Table Managers עבור Cash Flows Tables (2 tables: Cash Flows + Currency Conversions)
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

import { loadCashFlowsData } from './cashFlowsDataLoader.js';

// Load table formatters (available via window.tableFormatters)
// Ensure tableFormatters.js is loaded before this script
const formatCurrency = window.tableFormatters?.formatCurrency || function(amount, currency) {
  return `${currency || '$'}${Number(amount || 0).toFixed(2)}`;
};
const formatDate = window.tableFormatters?.formatDate || function(date) {
  return date || '';
};

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
   * Initialize all table managers
   */
  function initializeTableManagers() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initTables();
        loadInitialData();
      });
    } else {
      initTables();
      loadInitialData();
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
    const dateFromInput = document.getElementById('cashFlowsDateFrom');
    const dateToInput = document.getElementById('cashFlowsDateTo');
    const accountSelect = document.getElementById('cashFlowsAccount');
    const typeSelect = document.getElementById('cashFlowsType');
    const searchInput = document.getElementById('cashFlowsSearch');
    
    let filterTimeout;
    
    function applyInternalFilters() {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(function() {
        cashFlowsPage = 1;
        loadAllData();
      }, 300);
    }
    
    if (dateFromInput) {
      dateFromInput.addEventListener('change', applyInternalFilters);
    }
    
    if (dateToInput) {
      dateToInput.addEventListener('change', applyInternalFilters);
    }
    
    if (accountSelect) {
      accountSelect.addEventListener('change', applyInternalFilters);
    }
    
    if (typeSelect) {
      typeSelect.addEventListener('change', applyInternalFilters);
    }
    
    if (searchInput) {
      searchInput.addEventListener('input', applyInternalFilters);
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
      // Get internal filter values
      const dateFrom = document.getElementById('cashFlowsDateFrom')?.value || '';
      const dateTo = document.getElementById('cashFlowsDateTo')?.value || '';
      const account = document.getElementById('cashFlowsAccount')?.value || '';
      const type = document.getElementById('cashFlowsType')?.value || '';
      const search = document.getElementById('cashFlowsSearch')?.value || '';
      
      const filters = {
        ...currentFilters,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        tradingAccount: account || undefined,
        type: type || undefined,
        search: search || undefined,
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
      console.error('Error loading cash flows data:', error);
    }
  }
  
  /**
   * Load Cash Flows table data only
   */
  async function loadCashFlowsTableData() {
    try {
      const dateFrom = document.getElementById('cashFlowsDateFrom')?.value || '';
      const dateTo = document.getElementById('cashFlowsDateTo')?.value || '';
      const account = document.getElementById('cashFlowsAccount')?.value || '';
      const type = document.getElementById('cashFlowsType')?.value || '';
      const search = document.getElementById('cashFlowsSearch')?.value || '';
      
      const filters = {
        ...currentFilters,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        tradingAccount: account || undefined,
        type: type || undefined,
        search: search || undefined,
        page: cashFlowsPage,
        pageSize: cashFlowsPageSize
      };
      
      const result = await loadCashFlowsData(filters);
      
      cashFlowsData = result.cashFlows;
      updateCashFlowsTable(result.cashFlows.data);
      updateCashFlowsPagination();
    } catch (error) {
      console.error('Error loading cash flows table data:', error);
    }
  }
  
  /**
   * Load Currency Conversions table data only
   */
  async function loadCurrencyConversionsTableData() {
    try {
      const dateFrom = document.getElementById('cashFlowsDateFrom')?.value || '';
      const dateTo = document.getElementById('cashFlowsDateTo')?.value || '';
      const account = document.getElementById('cashFlowsAccount')?.value || '';
      
      const filters = {
        ...currentFilters,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        tradingAccount: account || undefined,
        page: currencyConversionsPage,
        pageSize: currencyConversionsPageSize
      };
      
      const result = await loadCashFlowsData(filters);
      
      currencyConversionsData = result.currencyConversions;
      updateCurrencyConversionsTable(result.currencyConversions.data);
      updateCurrencyConversionsPagination();
    } catch (error) {
      console.error('Error loading currency conversions table data:', error);
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
    const cashFlowsCountEl = document.getElementById('cashFlowsCount');
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
    if (cashFlowsCountEl) cashFlowsCountEl.textContent = `${summary.totalFlows || 0} תנועות`;
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
      row.setAttribute('data-flow-id', flow.id || '');
      
      // Trade
      const tradeCell = document.createElement('td');
      tradeCell.className = 'phoenix-table__cell col-trade';
      tradeCell.setAttribute('data-field', 'trade');
      tradeCell.textContent = flow.trade || '';
      row.appendChild(tradeCell);
      
      // Account
      const accountCell = document.createElement('td');
      accountCell.className = 'phoenix-table__cell col-account';
      accountCell.setAttribute('data-field', 'account');
      accountCell.textContent = flow.account || '';
      row.appendChild(accountCell);
      
      // Type (badge)
      const typeCell = document.createElement('td');
      typeCell.className = 'phoenix-table__cell col-type';
      typeCell.setAttribute('data-field', 'type');
      typeCell.setAttribute('dir', 'rtl');
      const badge = document.createElement('span');
      badge.className = 'phoenix-table__status-badge operation-type-badge';
      const flowType = (flow.type || '').toLowerCase();
      const isPositive = flowType === 'deposit' || flowType === 'execution';
      badge.setAttribute('data-operation-type', flowType);
      badge.setAttribute('data-type-positive', isPositive);
      badge.textContent = flow.type || '';
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
      
      // Date
      const dateCell = document.createElement('td');
      dateCell.className = 'phoenix-table__cell col-date phoenix-table__cell--date';
      dateCell.setAttribute('data-field', 'date');
      dateCell.textContent = formatDate(flow.date || '');
      row.appendChild(dateCell);
      
      // Description
      const descriptionCell = document.createElement('td');
      descriptionCell.className = 'phoenix-table__cell col-description';
      descriptionCell.setAttribute('data-field', 'description');
      descriptionCell.textContent = flow.description || '';
      row.appendChild(descriptionCell);
      
      // Source
      const sourceCell = document.createElement('td');
      sourceCell.className = 'phoenix-table__cell col-source';
      sourceCell.setAttribute('data-field', 'source');
      sourceCell.textContent = flow.source || '';
      row.appendChild(sourceCell);
      
      // Updated
      const updatedCell = document.createElement('td');
      updatedCell.className = 'phoenix-table__cell col-updated phoenix-table__cell--date';
      updatedCell.setAttribute('data-field', 'updated');
      updatedCell.textContent = formatDate(flow.updated || '');
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
            <button class="table-action-btn js-action-view" aria-label="צפה" data-flow-id="${flow.id || ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="table-action-btn js-action-edit" aria-label="ערוך" data-flow-id="${flow.id || ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="מחק" data-flow-id="${flow.id || ''}">
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
        // TODO: Implement view action
        // Debug logging removed - security compliance
      });
    });
    
    editButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const flowId = this.getAttribute('data-flow-id');
        // TODO: Implement edit action
        // Debug logging removed - security compliance
      });
    });
    
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const flowId = this.getAttribute('data-flow-id');
        // TODO: Implement delete action
        // Debug logging removed - security compliance
      });
    });
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
        // TODO: Implement view action
        // Debug logging removed - security compliance
      });
    });
    
    editButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const conversionId = this.getAttribute('data-conversion-id');
        // TODO: Implement edit action
        // Debug logging removed - security compliance
      });
    });
    
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const conversionId = this.getAttribute('data-conversion-id');
        // TODO: Implement delete action
        // Debug logging removed - security compliance
      });
    });
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
