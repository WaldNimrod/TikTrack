/**
 * Trading Accounts Data Loader - טעינת נתונים מ-API עבור Trading Accounts View
 * -----------------------------------------------------------------------------
 * טעינת נתונים מ-API עבור כל הקונטיינרים ב-Trading Accounts View
 * 
 * @description טעינת נתונים מ-API עבור:
 * - קונטיינר 0: סיכום מידע והתראות פעילות
 * - קונטיינר 1: טבלת חשבונות מסחר
 * - קונטיינר 2: כרטיסי סיכום תנועות
 * - קונטיינר 3: טבלת תנועות
 * - קונטיינר 4: טבלת פוזיציות
 * 
 * @version v2.0 - Phase 2: Uses Shared_Services.js (PDSC Client) for all API calls
 * 
 * Note: Trading Accounts API schema not in API Integration Guide yet.
 * Using Shared_Services.js for consistency with D18 and D21.
 * PDSC Boundary Contract: documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md
 */

// Import PDSC Client (Shared_Services.js)
import sharedServices from '../../../components/core/sharedServices.js';

// Import transformers for additional transformations if needed
import { apiToReact } from '../../../cubes/shared/utils/transformers.js';

// Import masked log utility for security compliance
import { maskedLog } from '../../../utils/maskedLog.js';
import { toCanonicalStatus, toHebrewStatus } from '../../../utils/statusAdapter.js';
import { toFlowTypeLabel } from '../../../utils/flowTypeValues.js';

/**
 * Validate ULID format
 * ULID format: 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
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

/**
 * Fetch Trading Accounts
 * 
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Query Parameters (camelCase → snake_case automatically):
 * - status (string, optional) - Filter by status
 * - search (string, optional) - Search in account names
 * 
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Response data with data array and total
 */
async function fetchTradingAccounts(filters = {}) {
  try {
    // Ensure Shared Services is initialized
    await sharedServices.init();
    
    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    const response = await sharedServices.get('/trading_accounts', filters);
    
    // Response is already transformed by Shared_Services
    return {
      data: response.data || [],
      total: response.total || 0
    };
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Trading Accounts Data Loader] Error fetching trading accounts:', { 
      errorCode: error.code,
      status: error.status
    });
    
    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Trading Accounts Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message
      });
    }
    
    return { data: [], total: 0 };
  }
}

/**
 * Fetch Cash Flows
 * 
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Reuses Cash Flows API integration (same as D21)
 * 
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Response data with data array, total, and summary
 */
async function fetchCashFlows(filters = {}) {
  try {
    // Ensure Shared Services is initialized
    await sharedServices.init();
    
    // Gate B Fix: Normalize tradingAccountId - only send if valid ULID
    // Gate B Fix: Remove dateRange object - it should be split into dateFrom/dateTo before calling API
    // Gate B Fix: Remove empty strings - they cause 400 errors
    const normalizedFilters = { ...filters };
    if (normalizedFilters.tradingAccountId) {
      const normalizedId = normalizeTradingAccountId(normalizedFilters.tradingAccountId);
      if (normalizedId) {
        normalizedFilters.tradingAccountId = normalizedId;
      } else {
        delete normalizedFilters.tradingAccountId;
      }
    }
    delete normalizedFilters.dateRange; // Remove dateRange object - Shared_Services will handle dateFrom/dateTo
    
    // Gate B Fix: Remove empty strings from filters
    Object.keys(normalizedFilters).forEach(key => {
      const value = normalizedFilters[key];
      if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        delete normalizedFilters[key];
      }
    });
    
    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    // Note: filters should be in camelCase (e.g., tradingAccountId, dateFrom, dateTo, flowType)
    // Shared_Services will automatically transform to snake_case for API
    const response = await sharedServices.get('/cash_flows', normalizedFilters);
    
    // Parse decimal strings to numbers for summary
    const summary = response.summary ? {
      totalDeposits: parseFloat(response.summary.total_deposits || response.summary.totalDeposits || '0'),
      totalWithdrawals: parseFloat(response.summary.total_withdrawals || response.summary.totalWithdrawals || '0'),
      netFlow: parseFloat(response.summary.net_flow || response.summary.netFlow || '0')
    } : {
      totalDeposits: 0,
      totalWithdrawals: 0,
      netFlow: 0
    };
    
    return {
      data: response.data || [],
      total: response.total || 0,
      summary: summary
    };
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Trading Accounts Data Loader] Error fetching cash flows:', { 
      errorCode: error.code,
      status: error.status
    });
    
    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Trading Accounts Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message
      });
    }
    
    return { 
      data: [], 
      total: 0, 
      summary: { 
        totalDeposits: 0, 
        totalWithdrawals: 0, 
        netFlow: 0 
      } 
    };
  }
}

/**
 * Fetch Trading Accounts Summary
 * 
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Query Parameters (camelCase → snake_case automatically):
 * - status (string, optional) - Filter by status
 * - investmentType (string, optional) - Filter by investment type
 * - tradingAccountId (string, optional) - Filter by trading account ULID
 * - dateFrom (date, optional) - Filter by date >= dateFrom (YYYY-MM-DD)
 * - dateTo (date, optional) - Filter by date <= dateTo (YYYY-MM-DD)
 * - search (string, optional) - Search in account names
 * 
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Summary data from Backend
 */
async function fetchTradingAccountsSummary(filters = {}) {
  try {
    // Ensure Shared Services is initialized
    await sharedServices.init();
    
    // Gate B Fix: Remove pagination parameters from summary call
    // Summary endpoints don't need pagination (page, page_size)
    const summaryFilters = { ...filters };
    delete summaryFilters.page;
    delete summaryFilters.pageSize;
    
    // Gate B Fix: Normalize tradingAccountId - only send if valid ULID
    if (summaryFilters.tradingAccountId) {
      const normalizedId = normalizeTradingAccountId(summaryFilters.tradingAccountId);
      if (normalizedId) {
        summaryFilters.tradingAccountId = normalizedId;
      } else {
        delete summaryFilters.tradingAccountId;
      }
    }
    
    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    const response = await sharedServices.get('/trading_accounts/summary', summaryFilters);
    
    // Response is already transformed by Shared_Services
    const summary = response.summary || response;
    
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Trading Accounts Data Loader] Summary fetched from Backend', { summary });
    
    return summary;
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Trading Accounts Data Loader] Error fetching trading accounts summary:', { 
      errorCode: error.code,
      status: error.status
    });
    
    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Trading Accounts Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message
      });
    }
    
    // Return default summary structure - don't throw to prevent SEVERE errors
    return {
      totalAccounts: 0,
      activeAccounts: 0,
      totalBalance: 0,
      totalPl: 0,
      totalValue: 0,
      avgValue: 0,
      activePositions: 0
    };
  }
}

/**
 * Fetch Cash Flows Summary
 * 
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Reuses Cash Flows Summary API integration (same as D21)
 * Used for Container 2 (Cash Flows Summary Cards)
 * 
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Summary data
 */
async function fetchCashFlowsSummary(filters = {}) {
  try {
    // Ensure Shared Services is initialized
    await sharedServices.init();
    
    // Gate B Fix: Remove pagination parameters from summary call
    // Summary endpoints don't need pagination (page, page_size)
    // Gate B Fix: Remove dateRange object - it should be split into dateFrom/dateTo before calling API
    // Gate B Fix: Remove empty strings - they cause 400 errors
    const summaryFilters = { ...filters };
    delete summaryFilters.page;
    delete summaryFilters.pageSize;
    delete summaryFilters.dateRange; // Remove dateRange object - Shared_Services will handle dateFrom/dateTo
    
    // Gate B Fix: Remove empty strings from filters
    Object.keys(summaryFilters).forEach(key => {
      const value = summaryFilters[key];
      if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        delete summaryFilters[key];
      }
    });
    
    // Gate B Fix: Normalize tradingAccountId - only send if valid ULID
    if (summaryFilters.tradingAccountId) {
      const normalizedId = normalizeTradingAccountId(summaryFilters.tradingAccountId);
      if (normalizedId) {
        summaryFilters.tradingAccountId = normalizedId;
      } else {
        delete summaryFilters.tradingAccountId;
      }
    }
    
    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    // Note: filters should be in camelCase (e.g., tradingAccountId, dateFrom, dateTo)
    // Shared_Services will automatically transform to snake_case for API
    const response = await sharedServices.get('/cash_flows/summary', summaryFilters);
    
    // Parse decimal strings to numbers
    const summary = response.summary ? {
      totalDeposits: parseFloat(response.summary.total_deposits || response.summary.totalDeposits || '0'),
      totalWithdrawals: parseFloat(response.summary.total_withdrawals || response.summary.totalWithdrawals || '0'),
      netFlow: parseFloat(response.summary.net_flow || response.summary.netFlow || '0')
    } : {
      totalDeposits: 0,
      totalWithdrawals: 0,
      netFlow: 0
    };
    
    return summary;
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Trading Accounts Data Loader] Error fetching cash flows summary:', { 
      errorCode: error.code,
      status: error.status
    });
    
    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Trading Accounts Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message
      });
    }
    
    return { totalDeposits: 0, totalWithdrawals: 0, netFlow: 0 };
  }
}

/**
 * Fetch Positions
 * 
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Note: Positions API schema not in API Integration Guide yet.
 * Using Shared_Services.js for consistency.
 * 
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Response data with data array and total
 */
async function fetchPositions(filters = {}) {
  try {
    // Ensure Shared Services is initialized
    await sharedServices.init();
    
    // Gate B Fix: Normalize tradingAccountId - only send if valid ULID
    // Gate B Fix: Remove empty strings - they cause 400 errors
    const normalizedFilters = { ...filters };
    if (normalizedFilters.tradingAccountId) {
      const normalizedId = normalizeTradingAccountId(normalizedFilters.tradingAccountId);
      if (normalizedId) {
        normalizedFilters.tradingAccountId = normalizedId;
      } else {
        delete normalizedFilters.tradingAccountId;
      }
    }
    
    // Gate B Fix: Remove empty strings from filters
    Object.keys(normalizedFilters).forEach(key => {
      const value = normalizedFilters[key];
      if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        delete normalizedFilters[key];
      }
    });
    
    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    // Note: filters should be in camelCase (e.g., tradingAccountId)
    // Shared_Services will automatically transform to snake_case for API
    const response = await sharedServices.get('/positions', normalizedFilters);
    
    // Response is already transformed by Shared_Services
    return {
      data: response.data || [],
      total: response.total || 0
    };
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Trading Accounts Data Loader] Error fetching positions:', { 
      errorCode: error.code,
      status: error.status
    });
    
    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Trading Accounts Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message
      });
    }
    
    return { data: [], total: 0 };
  }
}

/**
 * Load Container 0: Summary and Alerts
 * 
 * @description Loads summary from trading_accounts/summary endpoint (SSOT v1.2.0: REQUIRED)
 * No local calculation - all data comes from Backend endpoint
 */
async function loadContainer0() {
  try {
    // Get global filters for summary
    const globalFilters = {};
    const statusFilter = document.getElementById('selectedStatus');
    const investmentTypeFilter = document.getElementById('selectedType');
    const accountFilter = document.getElementById('selectedAccount');
    const dateRangeFilter = document.getElementById('selectedDateRange');
    const searchInput = document.getElementById('searchFilterInput');
    
    if (statusFilter && statusFilter.textContent !== 'כל סטטוס') {
      globalFilters.status = toCanonicalStatus(statusFilter.textContent);
    }
    
    if (investmentTypeFilter && investmentTypeFilter.textContent !== 'כל סוג השקעה') {
      globalFilters.investmentType = investmentTypeFilter.textContent;
    }
    
    if (accountFilter && accountFilter.textContent !== 'כל חשבון מסחר') {
      // TODO: Extract account ULID from filter when available
      globalFilters.tradingAccountId = null;
    }
    
    if (dateRangeFilter && dateRangeFilter.textContent !== 'כל זמן') {
      // TODO: Extract date range from filter when available
      globalFilters.dateFrom = null;
      globalFilters.dateTo = null;
    }
    
    if (searchInput && searchInput.value) {
      globalFilters.search = searchInput.value;
    }
    
    // Fetch summary from Backend endpoint (SSOT v1.2.0: REQUIRED)
    const summaryData = await fetchTradingAccountsSummary(globalFilters);
    
    // Extract summary values (handle both snake_case and camelCase from Shared_Services)
    const totalAccounts = summaryData.totalAccounts || summaryData.total_accounts || 0;
    const activeAccounts = summaryData.activeAccounts || summaryData.active_accounts || 0;
    const totalBalance = parseFloat(summaryData.totalBalance || summaryData.total_balance || 0);
    const totalPnL = parseFloat(summaryData.totalPl || summaryData.total_pl || summaryData.totalPnL || 0);
    const totalValue = parseFloat(summaryData.totalValue || summaryData.total_value || 0);
    const avgValue = parseFloat(summaryData.avgValue || summaryData.avg_value || 0);
    const activePositions = summaryData.activePositions || summaryData.active_positions || 0;
    
    // Update summary stats
    const totalAccountsEl = document.getElementById('totalAccounts');
    const activeAccountsEl = document.getElementById('activeAccounts');
    const totalBalanceEl = document.getElementById('totalBalance');
    const totalPnLEl = document.getElementById('totalPnL');
    
    if (totalAccountsEl) totalAccountsEl.textContent = totalAccounts;
    if (activeAccountsEl) activeAccountsEl.textContent = activeAccounts;
    if (totalBalanceEl) {
      const balanceSpan = totalBalanceEl.querySelector('.numeric-value-positive') || totalBalanceEl;
      balanceSpan.textContent = window.tableFormatters?.formatCurrency(totalBalance, 'USD', 2) || `$${totalBalance.toFixed(2)}`;
    }
    if (totalPnLEl) {
      const pnlSpan = totalPnLEl.querySelector('.numeric-value-positive') || totalPnLEl;
      const isPositive = totalPnL >= 0;
      pnlSpan.className = isPositive ? 'numeric-value-positive' : 'numeric-value-negative';
      pnlSpan.textContent = window.tableFormatters?.formatCurrency(totalPnL, 'USD', 2) || `$${totalPnL.toFixed(2)}`;
    }
    
    // Update expanded summary
    const expandedContent = document.getElementById('portfolioSummaryContent');
    if (expandedContent) {
      expandedContent.innerHTML = `
        <span>פוזיציות פעילות: ${activePositions}</span>
        <span>שווי כולל: <span class="numeric-value-positive" dir="ltr">${window.tableFormatters?.formatCurrency(totalValue, 'USD', 2) || `$${totalValue.toFixed(2)}`}</span></span>
        <span>שווי ממוצע לחשבון: <span class="numeric-value-positive" dir="ltr">${window.tableFormatters?.formatCurrency(avgValue, 'USD', 2) || `$${avgValue.toFixed(2)}`}</span></span>
        <span>P/L כולל: <span class="numeric-value-positive" dir="ltr">${window.tableFormatters?.formatCurrency(totalPnL, 'USD', 2) || `$${totalPnL.toFixed(2)}`}</span></span>
      `;
    }
    
    // Update header count
    const headerCount = document.querySelector('[data-section="summary-alerts"] .index-section__header-count');
    if (headerCount) {
      headerCount.textContent = '0 התראות פעילות'; // TODO: Add alerts when available
    }
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('Error loading Container 0:', { 
      errorCode: error.code,
      status: error.status
    });
  }
}

/**
 * Load Container 1: Trading Accounts Table
 */
async function loadContainer1(filters = {}) {
  try {
    const accountsData = await fetchTradingAccounts(filters);
    const accounts = accountsData.data || [];
    const tbody = document.querySelector('#accountsTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    accounts.forEach(account => {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.setAttribute('role', 'row');
      
      const formatCurrency = window.tableFormatters?.formatCurrency || ((val, curr) => `${curr === 'USD' ? '$' : ''}${val.toFixed(2)}`);
      const formatDate = window.tableFormatters?.formatDate || ((date) => {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      });
      
      const canon = account.isActive ? 'active' : 'inactive';
      const statusBadge = `<span class="phoenix-table__status-badge phoenix-table__status-badge--${canon}">${toHebrewStatus(canon)}</span>`;
      
      row.innerHTML = `
        <td class="phoenix-table__cell col-name" role="cell">${account.accountName || account.account_name || account.displayName || ''}</td>
        <td class="phoenix-table__cell col-currency" role="cell">${account.currency || ''}</td>
        <td class="phoenix-table__cell col-balance" role="cell">
          <span class="numeric-value-positive" dir="ltr">${formatCurrency(parseFloat(account.balance || 0), account.currency || 'USD', 2)}</span>
        </td>
        <td class="phoenix-table__cell col-positions" role="cell">${account.positionsCount || 0}</td>
        <td class="phoenix-table__cell col-total-pl" role="cell">
          <span class="${parseFloat(account.totalPl || 0) >= 0 ? 'numeric-value-positive' : 'numeric-value-negative'}" dir="ltr">
            ${formatCurrency(parseFloat(account.totalPl || 0), account.currency || 'USD', 2)}
          </span>
        </td>
        <td class="phoenix-table__cell col-account-value" role="cell">
          <span class="numeric-value-positive" dir="ltr">${formatCurrency(parseFloat(account.accountValue || 0), account.currency || 'USD', 2)}</span>
        </td>
        <td class="phoenix-table__cell col-holdings-value" role="cell">
          <span class="numeric-value-positive" dir="ltr">${formatCurrency(parseFloat(account.holdingsValue || 0), account.currency || 'USD', 2)}</span>
        </td>
        <td class="phoenix-table__cell col-status" role="cell">${statusBadge}</td>
        <td class="phoenix-table__cell col-updated" role="cell">${formatDate(account.updatedAt || '')}</td>
        <td class="phoenix-table__cell col-actions phoenix-table__cell--actions" role="cell">
          <div class="table-actions-tooltip">
            <button class="table-actions-trigger" aria-label="פעולות">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            <div class="table-actions-menu">
              <button class="table-action-btn js-action-view" aria-label="צפה" data-account-id="${account.externalUlid || account.id || ''}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="table-action-btn js-action-edit" aria-label="ערוך" data-account-id="${account.externalUlid || account.id || ''}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="table-action-btn js-action-delete" aria-label="מחק" data-account-id="${account.externalUlid || account.id || ''}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Update pagination info
    const paginationInfo = document.querySelector('#accountsTable + .phoenix-table-pagination .phoenix-table-pagination__info span');
    if (paginationInfo) {
      paginationInfo.textContent = `מציג ${accounts.length > 0 ? 1 : 0}-${accounts.length} מתוך ${accountsData.total || 0} רשומות`;
    }
    
    // Update header count
    const activeAccounts = accounts.filter(acc => acc.isActive).length;
    const headerCount = document.querySelector('[data-section="trading-accounts-management"] .index-section__header-count');
    if (headerCount) {
      headerCount.textContent = `${activeAccounts} חשבונות פעילים`;
    }
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('Error loading Container 1:', { 
      errorCode: error.code,
      status: error.status
    });
  }
}

/**
 * Load Container 2: Cash Flows Summary Cards
 */
async function loadContainer2(filters = {}) {
  try {
    const summaryData = await fetchCashFlowsSummary(filters);
    const cardsContainer = document.querySelector('.account-movements-summary-cards');
    
    if (!cardsContainer) return;
    
    const formatCurrency = window.tableFormatters?.formatCurrency || ((val, curr) => `${curr === 'USD' ? '$' : ''}${val.toFixed(2)}`);
    
    cardsContainer.innerHTML = `
      <div class="summary-card">
        <div class="summary-card__label">סה"כ הפקדות</div>
        <div class="summary-card__value">
          <span class="numeric-value-positive" dir="ltr">${formatCurrency(parseFloat(summaryData.totalDeposits || 0), 'USD', 2)}</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-card__label">סה"כ משיכות</div>
        <div class="summary-card__value">
          <span class="numeric-value-negative" dir="ltr">${formatCurrency(parseFloat(summaryData.totalWithdrawals || 0), 'USD', 2)}</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-card__label">תזרים נטו</div>
        <div class="summary-card__value">
          <span class="${parseFloat(summaryData.netFlow || 0) >= 0 ? 'numeric-value-positive' : 'numeric-value-negative'}" dir="ltr">
            ${formatCurrency(parseFloat(summaryData.netFlow || 0), 'USD', 2)}
          </span>
        </div>
      </div>
    `;
    
    // Update header count
    const headerCount = document.querySelector('[data-section="account-movements-summary"] .index-section__header-count');
    if (headerCount) {
      const flowsData = await fetchCashFlows(filters);
      headerCount.textContent = `${flowsData.total || 0} תנועות`;
    }
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('Error loading Container 2:', { 
      errorCode: error.code,
      status: error.status
    });
  }
}

/**
 * Load Container 3: Cash Flows Table
 */
async function loadContainer3(filters = {}) {
  try {
    const flowsData = await fetchCashFlows(filters);
    const flows = flowsData.data || [];
    const tbody = document.querySelector('#accountActivityTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    flows.forEach(flow => {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.setAttribute('role', 'row');
      
      const formatCurrency = window.tableFormatters?.formatCurrency || ((val, curr) => `${curr === 'USD' ? '$' : ''}${val.toFixed(2)}`);
      const formatDate = window.tableFormatters?.formatDate || ((date) => {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      });
      
      const statusBadge = flow.status === 'VERIFIED' 
        ? '<span class="phoenix-table__status-badge phoenix-table__status-badge--active">מאומת</span>'
        : flow.status === 'PENDING'
        ? '<span class="phoenix-table__status-badge phoenix-table__status-badge--inactive">ממתין</span>'
        : `<span class="phoenix-table__status-badge phoenix-table__status-badge--inactive">${flow.status || ''}</span>`;
      
      const flowTypeVal = flow.flowType || flow.flow_type || '';
      row.innerHTML = `
        <td class="phoenix-table__cell col-date" role="cell">${formatDate(flow.transactionDate || '')}</td>
        <td class="phoenix-table__cell col-type" role="cell">${toFlowTypeLabel(flowTypeVal) || flowTypeVal || ''}</td>
        <td class="phoenix-table__cell col-subtype" role="cell">${flow.subtype || ''}</td>
        <td class="phoenix-table__cell col-account" role="cell">${flow.accountName || ''}</td>
        <td class="phoenix-table__cell col-amount" role="cell">
          <span class="${flowTypeVal === 'DEPOSIT' ? 'numeric-value-positive' : 'numeric-value-negative'}" dir="ltr">
            ${flowTypeVal === 'DEPOSIT' ? '+' : '-'}${formatCurrency(parseFloat(flow.amount || 0), flow.currency || 'USD', 2)}
          </span>
        </td>
        <td class="phoenix-table__cell col-currency" role="cell">${flow.currency || ''}</td>
        <td class="phoenix-table__cell col-status" role="cell">${statusBadge}</td>
        <td class="phoenix-table__cell col-actions" role="cell">
          <button class="table-actions-btn" aria-label="פעולות">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Update pagination info
    const paginationInfo = document.querySelector('#accountActivityTable + .phoenix-table-pagination .phoenix-table-pagination__info span');
    if (paginationInfo) {
      paginationInfo.textContent = `מציג ${flows.length > 0 ? 1 : 0}-${flows.length} מתוך ${flowsData.total || 0} רשומות`;
    }
    
    // Update header count
    const headerCount = document.querySelector('[data-section="account-by-dates"] .index-section__header-count');
    if (headerCount) {
      headerCount.textContent = `${flowsData.total || 0} רשומות`;
    }
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('Error loading Container 3:', { 
      errorCode: error?.code,
      status: error?.status
    });
  }
}

/**
 * Load Container 4: Positions Table
 */
async function loadContainer4(filters = {}) {
  try {
    const positionsData = await fetchPositions(filters);
    const positions = positionsData.data || [];
    const tbody = document.querySelector('#positionsTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    positions.forEach(position => {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.setAttribute('role', 'row');
      
      const formatCurrency = window.tableFormatters?.formatCurrency || ((val, curr) => `${curr === 'USD' ? '$' : ''}${val.toFixed(2)}`);
      const formatNumber = window.tableFormatters?.formatNumber || ((val, dec) => val.toFixed(dec));
      const formatPercentage = window.tableFormatters?.formatPercentage || ((val, dec) => `${val.toFixed(dec)}%`);
      
      const directionBadge = position.direction === 'LONG'
        ? '<span class="phoenix-table__status-badge phoenix-table__status-badge--long">לונג</span>'
        : '<span class="phoenix-table__status-badge phoenix-table__status-badge--short">שורט</span>';
      
      const posCanon = position.status === 'OPEN' ? 'active' : 'inactive';
      const statusBadge = `<span class="phoenix-table__status-badge phoenix-table__status-badge--${posCanon}">${toHebrewStatus(posCanon)}</span>`;
      
      // Format current price with daily change
      const currentPriceHtml = window.tableFormatters?.formatCurrentPrice 
        ? window.tableFormatters.formatCurrentPrice(
            parseFloat(position.currentPrice || 0),
            parseFloat(position.dailyChangePercent || 0),
            'USD'
          ).outerHTML
        : `<span class="numeric-value-positive" dir="ltr">${formatCurrency(parseFloat(position.currentPrice || 0), 'USD', 2)}</span>`;
      
      // Format P/L
      const plHtml = window.tableFormatters?.formatPL
        ? window.tableFormatters.formatPL(
            parseFloat(position.unrealizedPl || 0),
            parseFloat(position.unrealizedPlPercent || 0),
            'USD'
          ).outerHTML
        : `<span class="${parseFloat(position.unrealizedPl || 0) >= 0 ? 'numeric-value-positive' : 'numeric-value-negative'}" dir="ltr">
            ${formatCurrency(parseFloat(position.unrealizedPl || 0), 'USD', 1)}
            (${formatPercentage(parseFloat(position.unrealizedPlPercent || 0), 1)})
          </span>`;
      
      row.innerHTML = `
        <td class="phoenix-table__cell col-symbol" role="cell">${position.symbol || ''}</td>
        <td class="phoenix-table__cell col-quantity" role="cell">${formatNumber(parseFloat(position.quantity || 0), 0)}</td>
        <td class="phoenix-table__cell col-avg-price" role="cell">
          <span class="numeric-value-positive" dir="ltr">${formatCurrency(parseFloat(position.avgPrice || 0), 'USD', 2)}</span>
        </td>
        <td class="phoenix-table__cell col-current_price" role="cell">${currentPriceHtml}</td>
        <td class="phoenix-table__cell col-market-value" role="cell">
          <span class="numeric-value-positive" dir="ltr">${formatCurrency(parseFloat(position.marketValue || 0), 'USD', 2)}</span>
        </td>
        <td class="phoenix-table__cell col-unrealized-pl" role="cell">${plHtml}</td>
        <td class="phoenix-table__cell col-percent-account" role="cell">
          <span class="numeric-value-positive" dir="ltr">${formatPercentage(parseFloat(position.percentOfAccount || 0), 1)}</span>
        </td>
        <td class="phoenix-table__cell col-status" role="cell">${statusBadge}</td>
        <td class="phoenix-table__cell col-actions" role="cell">
          <button class="table-actions-btn" aria-label="פעולות">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Update pagination info
    const paginationInfo = document.querySelector('#positionsTable + .phoenix-table-pagination .phoenix-table-pagination__info span');
    if (paginationInfo) {
      paginationInfo.textContent = `מציג ${positions.length > 0 ? 1 : 0}-${positions.length} מתוך ${positionsData.total || 0} רשומות`;
    }
    
    // Update header count
    const headerCount = document.querySelector('[data-section="positions-by-account"] .index-section__header-count');
    if (headerCount) {
      const activePositions = positions.filter(pos => pos.status === 'OPEN').length;
      headerCount.textContent = `${activePositions} פוזיציות פעילות`;
    }
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('Error loading Container 4:', { 
      errorCode: error.code,
      status: error.status
    });
  }
}

/**
 * Gate A Fix: Check if user has auth token before loading data
 */
function isAuthenticated() {
  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken') ||
                  sessionStorage.getItem('access_token') || sessionStorage.getItem('authToken');
    return !!token && String(token).trim() !== '';
  } catch (_) {
    return false;
  }
}

/**
 * Initialize: Load all containers on page load
 * Gate A Fix: Skip loading if guest - prevents 401 errors
 */
function initializeTradingAccountsDataLoader() {
  // Gate A Fix: Don't load data for guests - wait for auth redirect or skip
  if (!isAuthenticated()) {
    maskedLog('[Trading Accounts Data Loader] Guest detected, skipping loadAllContainers');
    return;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => loadAllContainers(), 100);
    });
  } else {
    setTimeout(() => loadAllContainers(), 100);
  }
}

/**
 * Load all containers
 */
async function loadAllContainers() {
  await Promise.all([
    loadContainer0(),
    loadContainer1(),
    loadContainer2(),
    loadContainer3(),
    loadContainer4()
  ]);
}

// Gate B Fix: Export as ES module for dynamic import support
// Also maintain global export for legacy compatibility
export {
  loadContainer0,
  loadContainer1,
  loadContainer2,
  loadContainer3,
  loadContainer4,
  loadAllContainers,
  fetchTradingAccounts,
  fetchTradingAccountsSummary,
  fetchCashFlows,
  fetchCashFlowsSummary,
  fetchPositions
};

// Export main loader function for DataStage
export async function loadTradingAccountsData(filters = {}) {
  // Get filters from Bridge if not provided
  const bridgeFilters = window.PhoenixBridge?.state?.filters || {};
  const mergedFilters = { ...bridgeFilters, ...filters };
  
  // Load all containers with merged filters
  await loadAllContainers();
  
  // Return data structure compatible with other loaders
  return {
    containers: {
      0: null, // Container 0 data is loaded directly into DOM
      1: null, // Container 1 data is loaded directly into DOM
      2: null, // Container 2 data is loaded directly into DOM
      3: null, // Container 3 data is loaded directly into DOM
      4: null  // Container 4 data is loaded directly into DOM
    }
  };
}

// Export for global use (legacy compatibility)
window.TradingAccountsDataLoader = {
  loadContainer0,
  loadContainer1,
  loadContainer2,
  loadContainer3,
  loadContainer4,
  loadAllContainers,
  fetchTradingAccounts,
  fetchTradingAccountsSummary,
  fetchCashFlows,
  fetchCashFlowsSummary,
  fetchPositions,
  loadTradingAccountsData
};

// Auto-initialize
initializeTradingAccountsDataLoader();
