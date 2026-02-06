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
 * @version v1.2 - Hardened: Uses centralized FIX_transformers.js (v1.2) for all transformations
 */

// Import centralized transformers (FIX_transformers.js v1.2)
import { apiToReact } from '../../../cubes/shared/utils/transformers.js';

// API Base URL - Use Vite proxy (configured in vite.config.js)
// Vite proxy: /api -> http://localhost:8082
// This avoids CORS issues and works in both dev and production
const API_BASE_URL = '/api/v1';

/**
 * Get Authorization Header
 */
function getAuthHeader() {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Fetch Trading Accounts
 */
async function fetchTradingAccounts(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status !== undefined) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const url = `${API_BASE_URL}/trading_accounts${params.toString() ? '?' + params.toString() : ''}`;
    const authHeader = getAuthHeader();
    
    // Debug logging removed - security compliance
    // Use maskedLog if debug logging is required
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });
    
    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text();
      }
      console.error('[Trading Accounts Data Loader] API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorDetails
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }
    
    const data = await response.json();
    return apiToReact(data);
  } catch (error) {
    console.error('Error fetching trading accounts:', error);
    return { data: [], total: 0 };
  }
}

/**
 * Fetch Cash Flows
 */
async function fetchCashFlows(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.tradingAccountId) params.append('trading_account_id', filters.tradingAccountId);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.flowType) params.append('flow_type', filters.flowType);
    
    const url = `${API_BASE_URL}/cash_flows${params.toString() ? '?' + params.toString() : ''}`;
    const authHeader = getAuthHeader();
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });
    
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text();
      }
      console.error('[Trading Accounts Data Loader] API Error (cash_flows):', {
        status: response.status,
        statusText: response.statusText,
        errorDetails
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }
    
    const data = await response.json();
    return apiToReact(data);
  } catch (error) {
    console.error('Error fetching cash flows:', error);
    return { data: [], total: 0, summary: { totalDeposits: 0, totalWithdrawals: 0, netFlow: 0 } };
  }
}

/**
 * Fetch Cash Flows Summary
 */
async function fetchCashFlowsSummary(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.tradingAccountId) params.append('trading_account_id', filters.tradingAccountId);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    
    const url = `${API_BASE_URL}/cash_flows/summary${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return apiToReact(data);
  } catch (error) {
    console.error('Error fetching cash flows summary:', error);
    return { totalDeposits: 0, totalWithdrawals: 0, netFlow: 0 };
  }
}

/**
 * Fetch Positions
 */
async function fetchPositions(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.tradingAccountId) params.append('trading_account_id', filters.tradingAccountId);
    
    const url = `${API_BASE_URL}/positions${params.toString() ? '?' + params.toString() : ''}`;
    const authHeader = getAuthHeader();
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });
    
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text();
      }
      console.error('[Trading Accounts Data Loader] API Error (positions):', {
        status: response.status,
        statusText: response.statusText,
        errorDetails
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }
    
    const data = await response.json();
    return apiToReact(data);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return { data: [], total: 0 };
  }
}

/**
 * Load Container 0: Summary and Alerts
 */
async function loadContainer0() {
  try {
    const accountsData = await fetchTradingAccounts();
    const accounts = accountsData.data || [];
    
    // Calculate totals
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter(acc => acc.isActive).length;
    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
    const totalPnL = accounts.reduce((sum, acc) => sum + parseFloat(acc.totalPl || 0), 0);
    
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
    const positionsData = await fetchPositions();
    const positions = positionsData.data || [];
    const activePositions = positions.filter(pos => pos.status === 'OPEN').length;
    const totalValue = accounts.reduce((sum, acc) => sum + parseFloat(acc.accountValue || 0), 0);
    const avgValue = totalAccounts > 0 ? totalValue / totalAccounts : 0;
    
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
    console.error('Error loading Container 0:', error);
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
      
      const statusBadge = account.isActive 
        ? '<span class="phoenix-table__status-badge phoenix-table__status-badge--active">פעיל</span>'
        : '<span class="phoenix-table__status-badge phoenix-table__status-badge--inactive">לא פעיל</span>';
      
      row.innerHTML = `
        <td class="phoenix-table__cell col-name" role="cell">${account.displayName || ''}</td>
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
    console.error('Error loading Container 1:', error);
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
    console.error('Error loading Container 2:', error);
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
      
      const flowTypeLabels = {
        'DEPOSIT': 'הפקדה',
        'WITHDRAWAL': 'משיכה',
        'DIVIDEND': 'דיבידנד',
        'INTEREST': 'ריבית',
        'FEE': 'עמלה',
        'OTHER': 'אחר'
      };
      
      const statusBadge = flow.status === 'VERIFIED' 
        ? '<span class="phoenix-table__status-badge phoenix-table__status-badge--active">מאומת</span>'
        : flow.status === 'PENDING'
        ? '<span class="phoenix-table__status-badge phoenix-table__status-badge--inactive">ממתין</span>'
        : `<span class="phoenix-table__status-badge phoenix-table__status-badge--inactive">${flow.status || ''}</span>`;
      
      row.innerHTML = `
        <td class="phoenix-table__cell col-date" role="cell">${formatDate(flow.transactionDate || '')}</td>
        <td class="phoenix-table__cell col-type" role="cell">${flowTypeLabels[flow.flowType] || flow.flowType || ''}</td>
        <td class="phoenix-table__cell col-subtype" role="cell">${flow.subtype || ''}</td>
        <td class="phoenix-table__cell col-account" role="cell">${flow.accountName || ''}</td>
        <td class="phoenix-table__cell col-amount" role="cell">
          <span class="${flow.flowType === 'DEPOSIT' ? 'numeric-value-positive' : 'numeric-value-negative'}" dir="ltr">
            ${flow.flowType === 'DEPOSIT' ? '+' : '-'}${formatCurrency(parseFloat(flow.amount || 0), flow.currency || 'USD', 2)}
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
    console.error('Error loading Container 3:', error);
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
      
      const statusBadge = position.status === 'OPEN'
        ? '<span class="phoenix-table__status-badge phoenix-table__status-badge--active">פתוח</span>'
        : '<span class="phoenix-table__status-badge phoenix-table__status-badge--inactive">סגור</span>';
      
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
    console.error('Error loading Container 4:', error);
  }
}

/**
 * Initialize: Load all containers on page load
 */
function initializeTradingAccountsDataLoader() {
  // Wait for DOM and table formatters to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        loadAllContainers();
      }, 100);
    });
  } else {
    setTimeout(() => {
      loadAllContainers();
    }, 100);
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

// Export for global use
window.TradingAccountsDataLoader = {
  loadContainer0,
  loadContainer1,
  loadContainer2,
  loadContainer3,
  loadContainer4,
  loadAllContainers,
  fetchTradingAccounts,
  fetchCashFlows,
  fetchCashFlowsSummary,
  fetchPositions
};

// Auto-initialize
initializeTradingAccountsDataLoader();
