/**
 * Trading Accounts Filters Integration - אינטגרציה בין פילטרים לנתונים
 * ---------------------------------------------------------------------
 * מטפל בפילטרים גלובליים ופנימיים ומעדכן את הנתונים בהתאם
 */

// Import masked log utility for security compliance
import { maskedLog } from '../../../utils/maskedLog.js';

/**
 * Get Global Filters
 */
function getGlobalFilters() {
  const filters = {};
  
  // Status filter
  const statusFilter = document.getElementById('selectedStatus');
  if (statusFilter && statusFilter.textContent !== 'כל סטטוס') {
    filters.status = statusFilter.textContent === 'פתוח';
  }
  
  // Account filter
  const accountFilter = document.getElementById('selectedAccount');
  if (accountFilter && accountFilter.textContent !== 'כל חשבון מסחר') {
    // TODO: Extract account ULID from filter
    filters.tradingAccountId = null; // Will be implemented when account filter provides ULID
  }
  
  // Date range filter
  const dateFilter = document.getElementById('selectedDateRange');
  if (dateFilter && dateFilter.textContent !== 'כל זמן') {
    // TODO: Extract date range from filter
    filters.dateFrom = null;
    filters.dateTo = null;
  }
  
  // Search filter
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput && searchInput.value) {
    filters.search = searchInput.value;
  }
  
  return filters;
}

/**
 * Get Container 2 Filters (Date Range)
 */
function getContainer2Filters() {
  const filters = {};
  
  const dateFrom = document.getElementById('movementsDateFrom');
  const dateTo = document.getElementById('movementsDateTo');
  
  if (dateFrom && dateFrom.value) {
    filters.dateFrom = dateFrom.value;
  }
  
  if (dateTo && dateTo.value) {
    filters.dateTo = dateTo.value;
  }
  
  return filters;
}

/**
 * Get Container 3 Filters (Account + Dates)
 */
function getContainer3Filters() {
  const filters = {};
  
  const accountSelect = document.getElementById('accountByDatesSelect');
  if (accountSelect && accountSelect.value) {
    filters.tradingAccountId = accountSelect.value;
  }
  
  const dateFrom = document.getElementById('accountByDatesDateFrom');
  const dateTo = document.getElementById('accountByDatesDateTo');
  
  if (dateFrom && dateFrom.value) {
    filters.dateFrom = dateFrom.value;
  }
  
  if (dateTo && dateTo.value) {
    filters.dateTo = dateTo.value;
  }
  
  return filters;
}

/**
 * Get Container 4 Filters (Account)
 */
function getContainer4Filters() {
  const filters = {};
  
  const accountSelect = document.getElementById('positionsAccountSelect');
  if (accountSelect && accountSelect.value) {
    filters.tradingAccountId = accountSelect.value;
  }
  
  return filters;
}

/**
 * Setup Filter Listeners
 */
function setupFilterListeners() {
  // Global filters
  const globalFilterInputs = document.querySelectorAll('.js-filter-toggle, .js-search-filter');
  globalFilterInputs.forEach(input => {
    input.addEventListener('change', () => {
      const filters = getGlobalFilters();
      if (window.TradingAccountsDataLoader) {
        window.TradingAccountsDataLoader.loadContainer1(filters);
      }
    });
  });
  
  // Container 2 filters (date range)
  const container2DateInputs = document.querySelectorAll('#movementsDateFrom, #movementsDateTo');
  container2DateInputs.forEach(input => {
    input.addEventListener('change', () => {
      const filters = getContainer2Filters();
      if (window.TradingAccountsDataLoader) {
        window.TradingAccountsDataLoader.loadContainer2(filters);
      }
    });
  });
  
  // Container 3 filters (account + dates)
  const container3Inputs = document.querySelectorAll('#accountByDatesSelect, #accountByDatesDateFrom, #accountByDatesDateTo');
  container3Inputs.forEach(input => {
    input.addEventListener('change', () => {
      const filters = getContainer3Filters();
      if (window.TradingAccountsDataLoader) {
        window.TradingAccountsDataLoader.loadContainer3(filters);
      }
    });
  });
  
  // Container 4 filters (account)
  const container4Select = document.getElementById('positionsAccountSelect');
  if (container4Select) {
    container4Select.addEventListener('change', () => {
      const filters = getContainer4Filters();
      if (window.TradingAccountsDataLoader) {
        window.TradingAccountsDataLoader.loadContainer4(filters);
      }
    });
  }
}

/**
 * Populate Account Selects
 */
async function populateAccountSelects() {
  if (!window.TradingAccountsDataLoader) return;
  
  try {
    const accountsData = await window.TradingAccountsDataLoader.fetchTradingAccounts();
    const accounts = accountsData.data || [];
    
    const selects = [
      document.getElementById('accountByDatesSelect'),
      document.getElementById('positionsAccountSelect')
    ];
    
    selects.forEach(select => {
      if (!select) return;
      
      // Keep "All accounts" option
      const allOption = select.querySelector('option[value=""]');
      const currentValue = select.value;
      
      // Clear existing options except "All accounts"
      select.innerHTML = '';
      if (allOption) {
        select.appendChild(allOption);
      } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'כל החשבונות';
        select.appendChild(defaultOption);
      }
      
      // Add account options
      accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.externalUlid;
        option.textContent = account.displayName || account.externalUlid;
        select.appendChild(option);
      });
      
      // Restore previous selection if still valid
      if (currentValue) {
        select.value = currentValue;
      }
    });
  } catch (error) {
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('Error populating account selects:', { 
      errorCode: error?.code,
      status: error?.status
    });
  }
}

/**
 * Initialize Filters Integration
 */
function initializeFiltersIntegration() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        setupFilterListeners();
        populateAccountSelects();
      }, 500);
    });
  } else {
    setTimeout(() => {
      setupFilterListeners();
      populateAccountSelects();
    }, 500);
  }
}

// Export for global use
window.TradingAccountsFiltersIntegration = {
  getGlobalFilters,
  getContainer2Filters,
  getContainer3Filters,
  getContainer4Filters,
  setupFilterListeners,
  populateAccountSelects
};

// Auto-initialize
initializeFiltersIntegration();
