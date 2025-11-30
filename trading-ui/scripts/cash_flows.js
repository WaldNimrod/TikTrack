/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 35
 * 
 * PAGE INITIALIZATION (3)
 * - initializeCashFlowsPage() - initializeCashFlowsPage function
 * - setupSourceFieldListeners() - setupSourceFieldListeners function
 * - initializeExternalIdFields() - * Setup source field listeners
 * 
 * DATA LOADING (10)
 * - loadCashFlowsData() - loadCashFlowsData function
 * - getAccountNameById() - getAccountNameById function
 * - ensureTradingAccountsLoaded() - ensureTradingAccountsLoaded function
 * - loadCashFlows() - * טעינת נתוני חשבונות מסחר אם הם לא נטענו
 * - loadAccountsForCashFlow() - loadAccountsForCashFlow function
 * - loadCurrenciesForCashFlow() - loadCurrenciesForCashFlow function
 * - getCashFlowTypeWithColor() - * Format amount
 * - getCashFlowTypeText() - getCashFlowTypeText function
 * - loadTradesForCashFlow() - * Edit cash flow
 * - loadTradePlansForCashFlow() - loadTradePlansForCashFlow function
 * 
 * DATA MANIPULATION (6)
 * - deleteCashFlow() - deleteCashFlow function
 * - updatePageSummaryStats() - Uses InfoSummarySystem from services/statistics-calculator.js
 * - updateCashFlowsTable() - * Format USD rate
 * - updateCashFlow() - updateCashFlow function
 * - saveCashFlow() - saveCashFlow function
 * - confirmDeleteCashFlow() - confirmDeleteCashFlow function
 * 
 * EVENT HANDLING (1)
 * - performCashFlowDeletion() - performCashFlowDeletion function
 * 
 * UI UPDATES (2)
 * - renderCashFlowsTable() - * טעינת רשימת מטבעות למודולי cash flow
 * - showCashFlowDetails() - * Format USD rate
 * 
 * VALIDATION (2)
 * - validateCashFlowForm() - validateCashFlowForm function
 * - validateEditCashFlowForm() - validateEditCashFlowForm function
 * 
 * UTILITIES (3)
 * - formatAmount() - formatAmount function
 * - formatCashFlowAmount() - * Get cash flow type text
 * - formatUsdRate() - formatUsdRate function
 * 
 * OTHER (8)
 * - calculateBalance() - calculateBalance function
 * - startAutoRefresh() - * Update cash flows table
 * - applyDynamicColors() - * Start auto refresh
 * - applyUserPreferences() - applyUserPreferences function
 * - manageExternalIdField() - * Confirm delete cash flow
 * - editCashFlow() - editCashFlow function
 * - generateDetailedLog() - generateDetailedLog function
 * - generateDetailedLogForCashFlows() - generateDetailedLogForCashFlows function
 * 
 * ==========================================
 */
/**
 * Cash Flows Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for managing cash flows including:
 * - CRUD operations for cash flows
 * - Data loading and table management
 * - Form validation and UI interactions
 * - Modal handling and state management
 * - Filtering and sorting functionality
 * - Related objects integration
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

// ===== קובץ JavaScript לדף תזרימי מזומנים =====

/**
 * Load cash flows data from server (via CashFlowsData service)
 * @function loadCashFlowsData
 * @async
 * @param {Object} options - Loader options (force, ttl, signal, queryParams)
 * @returns {Promise<Array>}
 */
async function loadCashFlowsData(options = {}) {
  const loadOptions = {
    force: Boolean(options.force),
    ttl: options.ttl ?? window.CashFlowsData?.TTL,
    signal: options.signal,
    queryParams: options.queryParams,
  };

  const fallbackLoader = async () => {
    // This is a fallback - should use CashFlowsData service instead
    if (typeof window.CashFlowsData?.fetchFresh === 'function') {
      return await window.CashFlowsData.fetchFresh(loadOptions);
    }
    const response = await fetch(`/api/cash-flows/?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: loadOptions.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : payload;
  };

  try {
    const beforeCount = Array.isArray(cashFlowsData) ? cashFlowsData.length : 0;
    window.Logger.info('Loading cash flows data', {
      page: 'cash_flows',
      force: loadOptions.force,
      beforeCount,
    });

    const useService = typeof window.CashFlowsData?.loadCashFlowsData === 'function';
    const data = useService
      ? await window.CashFlowsData.loadCashFlowsData(loadOptions)
      : await fallbackLoader();

    const normalizedCashFlows = Array.isArray(data)
      ? data.map(cf => ({
          ...cf,
          updated_at: cf?.updated_at || cf?.date || cf?.created_at || null,
        }))
      : [];

    const preparedCashFlows = ensureExchangePairsAdjacency(normalizedCashFlows);
    window.cashFlowsData = preparedCashFlows;
    window.allCashFlowsData = preparedCashFlows;
    window.filteredCashFlowsData = preparedCashFlows;
    cashFlowsData = preparedCashFlows;

    await syncCashFlowsPagination(preparedCashFlows);

    if (typeof window.applyDefaultSort === 'function') {
      try {
        await window.applyDefaultSort('cash_flows', normalizedCashFlows, updateCashFlowsTable);
      } catch (sortError) {
        window.Logger?.warn('applyDefaultSort failed for cash_flows, using fallback sort', {
          error: sortError,
          page: 'cash_flows',
        });
        applyFallbackDateSort(normalizedCashFlows);
      }
    } else {
      applyFallbackDateSort(normalizedCashFlows);
    }

    updatePageSummaryStats();

    if (typeof window.registerCashFlowsTables === 'function') {
      window.registerCashFlowsTables();
    }

    await restorePageState('cash_flows');

    if (typeof reapplyCashFlowTypeFilter === 'function') {
      try {
        await reapplyCashFlowTypeFilter();
      } catch (filterError) {
        window.Logger?.warn('reapplyCashFlowTypeFilter failed during data load', {
          error: filterError?.message || filterError,
          page: 'cash_flows',
        });
      }
    }

    window.Logger.info(`✅ Loaded ${normalizedCashFlows.length} cash flows`, {
      page: 'cash_flows',
      beforeCount,
      afterCount: normalizedCashFlows.length,
    });

    return normalizedCashFlows;
  } catch (error) {
    window.Logger.error('Error loading cash flows data', error, { page: 'cash_flows' });
    window.showErrorNotification?.('שגיאה בטעינת נתוני תזרימי מזומנים', error.message);
    throw error;
  }
}

/**
 * Fallback sorting by date (newest first) in case the general system is unavailable
 * @function applyFallbackDateSort
 * @param {Array} data - Cash flows array
 */
function applyFallbackDateSort(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return;
  }

  try {
    const sortedData = [...data].sort((a, b) => {
      const dateA = a && a.date ? a.date : null;
      const dateB = b && b.date ? b.date : null;
      
      // Use TableSortValueAdapter if available
      if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
        const sortValueA = window.TableSortValueAdapter.getSortValue({ value: dateA, type: 'auto' });
        const sortValueB = window.TableSortValueAdapter.getSortValue({ value: dateB, type: 'auto' });
        return (sortValueB || 0) - (sortValueA || 0);
      }
      
      // Fallback to dateUtils for consistent date comparison
      const getEpoch = (dateValue) => {
        if (!dateValue) return 0;
        if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
          const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(dateValue) : dateValue;
          return window.dateUtils.getEpochMilliseconds(envelope || dateValue) || 0;
        }
        // Fallback for DateEnvelope objects
        if (dateValue && typeof dateValue === 'object' && typeof dateValue.epochMs === 'number') {
          return dateValue.epochMs;
        }
        // Fallback for Date objects or strings
        try {
          const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
          return dateObj.getTime() || 0;
        } catch {
          return 0;
        }
      };
      const aEpoch = dateA ? getEpoch(dateA) : 0;
      const bEpoch = dateB ? getEpoch(dateB) : 0;
      return bEpoch - aEpoch;
    });

    // Update pagination if it exists, otherwise update table directly
    const paginationInstance = getCashFlowsPaginationInstance();
    if (paginationInstance && typeof paginationInstance.setData === 'function') {
      // Update pagination with sorted data - it will call render callback
      paginationInstance.setData(sortedData);
    } else {
      // No pagination - update table directly
      updateCashFlowsTable(sortedData);
    }
    
    if (typeof window.saveSortState === 'function') {
      window.saveSortState('cash_flows', 3, 'desc');
    }
  } catch (error) {
    window.Logger.error('applyFallbackDateSort: failed to sort data', { page: 'cash_flows', error: error?.message || error });
  }
}

/**
 * Calculate balance
 * @function calculateBalance
 * @returns {void}
 */
function calculateBalance() {
  try {
    window.Logger.info('Calculating balance', { page: 'cash_flows' });
    const balanceSource = Array.isArray(window.filteredCashFlowsData) && window.filteredCashFlowsData.length > 0
      ? window.filteredCashFlowsData
      : (window.allCashFlowsData && window.allCashFlowsData.length > 0
          ? window.allCashFlowsData
          : window.cashFlowsData);

    if (!balanceSource || balanceSource.length === 0) {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('אין נתוני תזרימי מזומנים', 'לא ניתן לחשב יתרה ללא נתונים', 5000, 'ui');
      } else if (typeof window.showNotification === 'function') {
        window.showWarningNotification('אין נתוני תזרימי מזומנים', '', 5000, 'ui');
      }
      return;
    }
    
    // חישוב היתרה
    let totalBalance = 0;
    let incomeTotal = 0;
    let expenseTotal = 0;
    
    balanceSource.forEach(flow => {
      const amount = parseFloat(flow.amount) || 0;
      if (flow.type === 'income' || flow.type === 'הכנסה') {
        incomeTotal += amount;
        totalBalance += amount;
      } else if (flow.type === 'expense' || flow.type === 'הוצאה') {
        expenseTotal += amount;
        totalBalance -= amount;
      }
    });
    
    // הצגת התוצאות
    const balanceMessage = `\n` +
      `סך הכנסות: ${incomeTotal.toFixed(2)}\n` +
      `סך הוצאות: ${expenseTotal.toFixed(2)}\n` +
      `יתרה נוכחית: ${totalBalance.toFixed(2)}`;
    
    if (typeof window.showModalNotification === 'function') {
      const content = `
        <div class="balance-calculation">
          <h5>חישוב יתרה</h5>
          <div class="row">
            <div class="col-md-4">
              <p><strong>סך הכנסות:</strong> ${incomeTotal.toFixed(2)}</p>
            </div>
            <div class="col-md-4">
              <p><strong>סך הוצאות:</strong> ${expenseTotal.toFixed(2)}</p>
            </div>
            <div class="col-md-4">
              <p><strong>יתרה נוכחית:</strong> ${totalBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      `;
      window.showModalNotification('חישוב יתרה', content, 'info');
    } else {
      window.showInfoNotification(`חישוב יתרה:${balanceMessage}`);
    }
    
  } catch (error) {
    window.Logger.error('Error calculating balance', error, { page: 'cash_flows' });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בחישוב יתרה', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בחישוב יתרה');
    }
  }
}
/*
 * Cash Flows.js - Cash Flows Page Management
 * ==========================================
 *
 * This file contains all cash flows management functionality for the TikTrack application.
 * It handles cash flows CRUD operations, table updates, and user interactions.
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 *
 * Table Mapping:
 * - Uses 'cash_flows' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * File: trading-ui/scripts/cash_flows.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// משתנים גלובליים
if (!window.cashFlowsData) {
  window.cashFlowsData = [];
}
if (!window.cashFlowsData) {
  window.cashFlowsData = [];
}
if (!window.allCashFlowsData) {
  window.allCashFlowsData = [];
}
if (!window.filteredCashFlowsData) {
  window.filteredCashFlowsData = [];
}
let cashFlowsData = window.cashFlowsData;
let cashFlowsPaginationInstance = null;
let tradingAccountsData = [];
let currentExchangeHighlightGroupId = null;
const CASH_FLOW_TABLE_TYPE = 'cash_flows';
const CASH_FLOWS_TABLE_ID = 'cashFlowsTable';
const CASH_FLOW_TYPE_FILTERS = new Set([
  'all',
  'deposit',
  'withdrawal',
  'transfer_in',
  'transfer_out',
  'dividend',
  'interest',
  'syep_interest',
  'fee',
  'other_positive',
  'other_negative',
  'exchange',
]);
let activeCashFlowTypeFilter = 'all';
const EXCHANGE_FROM_TYPES = new Set(['currency_exchange_from']);
const EXCHANGE_TO_TYPES = new Set(['currency_exchange_to']);

/**
 * Resolve exchange direction from flow type
 * @param {string} flowType - Flow type
 * @returns {string|null} Exchange direction ('from', 'to', or null)
 */
function resolveExchangeDirectionFromType(flowType) {
  const normalized = typeof flowType === 'string' ? flowType.toLowerCase() : '';
  if (EXCHANGE_FROM_TYPES.has(normalized)) {
    return 'from';
  }
  if (EXCHANGE_TO_TYPES.has(normalized)) {
    return 'to';
  }
  return null;
}

/**
 * Get cash flows pagination instance
 * @returns {Object|null} Pagination instance or null
 */
function getCashFlowsPaginationInstance() {
  // Always return the instance created by syncCashFlowsPagination if it exists
  // This ensures we use the instance with the correct render callback
  if (cashFlowsPaginationInstance) {
    window.Logger?.debug('✅ [getCashFlowsPaginationInstance] Returning cached instance', {
      hasOnAfterRender: typeof cashFlowsPaginationInstance.config?.onAfterRender === 'function',
      tableId: cashFlowsPaginationInstance.config?.tableId
    });
    return cashFlowsPaginationInstance;
  }
  // Fallback: try to get from PaginationSystem
  if (window.PaginationSystem?.get) {
    const instance = window.PaginationSystem.get(CASH_FLOWS_TABLE_ID);
    if (instance) {
      window.Logger?.debug('⚠️ [getCashFlowsPaginationInstance] Using PaginationSystem instance (fallback)', {
        hasOnAfterRender: typeof instance.config?.onAfterRender === 'function',
        tableId: instance.config?.tableId
      });
      cashFlowsPaginationInstance = instance;
      return instance;
    }
  }
  if (typeof window.getPagination === 'function') {
    const instance = window.getPagination(CASH_FLOWS_TABLE_ID);
    if (instance) {
      window.Logger?.debug('⚠️ [getCashFlowsPaginationInstance] Using getPagination instance (fallback)', {
        hasOnAfterRender: typeof instance.config?.onAfterRender === 'function',
        tableId: instance.config?.tableId
      });
      cashFlowsPaginationInstance = instance;
      return instance;
    }
  }
  window.Logger?.warn('⚠️ [getCashFlowsPaginationInstance] No pagination instance found');
  return null;
}

/**
 * Set active cash flow type filter (buttons and dropdown)
 * @param {string} value - Flow type value
 * @returns {void}
 */
function setActiveCashFlowTypeButton(value) {
  const normalizedValue = value || 'all';
  
  // Update dropdown
  const selectId = 'cashFlowTypeFilter';
  if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
    window.DataCollectionService.setValue(selectId, normalizedValue, 'text');
  } else {
    // Fallback if DataCollectionService is not available
    const select = document.getElementById(selectId);
    if (select) {
      select.value = normalizedValue;
    }
  }
  
  // Buttons removed - only dropdown remains
  // No need to update buttons anymore
}

/**
 * Setup cash flow type filter dropdown event listener
 * @returns {void}
 */
function setupCashFlowTypeFilterDropdown() {
  const select = document.getElementById('cashFlowTypeFilter');
  if (!select) {
    window.Logger?.warn('cashFlowTypeFilter dropdown not found', { page: 'cash_flows' });
    return;
  }

  // Set initial value
  const selectId = 'cashFlowTypeFilter';
  const initialValue = activeCashFlowTypeFilter || 'all';
  if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
    window.DataCollectionService.setValue(selectId, initialValue, 'text');
  } else {
    // Fallback if DataCollectionService is not available
    if (select) {
      select.value = initialValue;
    }
  }
  
  // EventHandlerManager will handle the change event automatically via data-onchange attribute
  // No need for manual event listeners - just like buttons with data-onclick!
  window.Logger?.info('✅ Cash flow type filter dropdown initialized', { 
    initialValue: activeCashFlowTypeFilter || 'all',
    hasDataOnchange: select.hasAttribute('data-onchange'),
    dataOnchangeValue: select.getAttribute('data-onchange'),
    page: 'cash_flows' 
  });
}

/**
 * Check if cash flow matches type
 * @param {Object} item - Cash flow item
 * @param {string} normalizedType - Normalized type
 * @returns {boolean} True if matches
 */
function cashFlowMatchesType(item, normalizedType) {
  if (normalizedType === 'all') {
    return true;
  }
  if (normalizedType === 'exchange') {
    if (!item) {
      return false;
    }
    // Exchange rows מזוהים רק אם יש exchange_group_id או external_id בפורמט exchange_
    return Boolean(item.exchange_group_id || isCurrencyExchange(item));
  }
  const candidate = (item?.type || '').toString().toLowerCase();
  return candidate === normalizedType;
}

/**
 * Filter cash flows by type
 * @param {string} flowType - Flow type
 * @param {Object} [options={}] - Filter options
 * @param {boolean} [options.skipButtonUpdate=false] - Skip button update
 * @returns {Promise<void>}
 */
async function filterCashFlowsByType(flowType, options = {}) {
  // Export to window for global access (needed for data-onchange)
  window.filterCashFlowsByType = filterCashFlowsByType;
  
  window.Logger?.debug('🔍 [filterCashFlowsByType] Called with:', { flowType, options });
  window.Logger?.info('🔍 filterCashFlowsByType called', { 
    flowType, 
    options, 
    page: 'cash_flows' 
  });

  const { skipButtonUpdate = false, skipSave = false } = options || {};
  const requestedType = typeof flowType === 'string' && flowType.trim() ? flowType.trim() : 'all';
  const normalizedType = CASH_FLOW_TYPE_FILTERS.has(requestedType) ? requestedType : 'all';
  activeCashFlowTypeFilter = normalizedType;

  window.Logger?.debug('Filter normalized', { 
    requestedType, 
    normalizedType, 
    page: 'cash_flows' 
  });

  if (!skipButtonUpdate) {
    setActiveCashFlowTypeButton(normalizedType);
  }

  // שמירת מצב הפילטר (אלא אם כן skipSave = true)
  if (!skipSave) {
    await saveCashFlowTypeFilterState(normalizedType);
  }

  const paginationInstance = getCashFlowsPaginationInstance();
  const shouldReset = normalizedType === 'all';
  const matcher = shouldReset ? null : (item) => cashFlowMatchesType(item, normalizedType);

  window.Logger?.debug('Pagination check', { 
    hasPagination: !!paginationInstance,
    hasFilterMethod: !!(paginationInstance && typeof paginationInstance.filter === 'function'),
    shouldReset,
    page: 'cash_flows'
  });

  // Filter data locally first
  const filteredData = filterCashFlowsLocallyByType(normalizedType);
  window.filteredCashFlowsData = filteredData;

  window.Logger?.debug('Data filtered', { 
    originalCount: (Array.isArray(window.allCashFlowsData) ? window.allCashFlowsData : window.cashFlowsData || []).length,
    filteredCount: filteredData.length,
    page: 'cash_flows'
  });

  // Update TableDataRegistry
  if (window.TableDataRegistry?.setFilteredData) {
    window.TableDataRegistry.setFilteredData(CASH_FLOW_TABLE_TYPE, filteredData, {
      tableId: CASH_FLOWS_TABLE_ID,
      skipPageReset: false,
      filterContext: { custom: { type: normalizedType } },
      clearFilters: normalizedType === 'all',
    });
    window.Logger?.debug('TableDataRegistry updated', { page: 'cash_flows' });
  }

  // If pagination exists, update it with filtered data
  if (paginationInstance && typeof paginationInstance.setData === 'function') {
    window.Logger?.debug('📊 [filterCashFlowsByType] Using pagination setData', { 
      filteredCount: filteredData.length,
      originalCount: (Array.isArray(window.allCashFlowsData) ? window.allCashFlowsData : window.cashFlowsData || []).length,
      hasPagination: true,
      hasOnAfterRender: typeof paginationInstance.config?.onAfterRender === 'function',
      page: 'cash_flows' 
    });
    window.Logger?.info('Using pagination setData with filtered data', { 
      filteredCount: filteredData.length,
      page: 'cash_flows' 
    });
    // Force update window.filteredCashFlowsData immediately BEFORE setData
    window.filteredCashFlowsData = filteredData;
    window.Logger?.debug('✅ [filterCashFlowsByType] window.filteredCashFlowsData updated to', filteredData.length, 'items');
    // Update pagination with filtered data - it will call render callback
    paginationInstance.setData(filteredData);
    window.Logger?.debug('✅ [filterCashFlowsByType] paginationInstance.setData called with', filteredData.length, 'items');
    
    // Force render table immediately if render callback didn't fire
    // This is a safety net - the render callback should handle this, but if it doesn't, we'll do it here
    setTimeout(async () => {
      const currentPageData = paginationInstance.getCurrentPageData();
      window.Logger?.debug('🔄 [filterCashFlowsByType] Force render check - currentPageData length:', currentPageData.length);
      if (currentPageData.length > 0 || filteredData.length === 0) {
        window.Logger?.debug('🔄 [filterCashFlowsByType] Force calling updateCashFlowsTable');
        await updateCashFlowsTable(currentPageData, { skipDataUpdate: true, skipSummary: true });
      }
    }, 100);
    
    // Show notification if filtered result is empty (and not showing all)
    if (filteredData.length === 0 && normalizedType !== 'all') {
      // Get display name from the select option or button
      const select = document.getElementById('cashFlowTypeFilter');
      let filterTypeName = '';
      if (select) {
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption) {
          filterTypeName = selectedOption.text;
        }
      }
      // Buttons removed - only dropdown remains
      // Fallback: use the type value itself
      if (!filterTypeName) {
        filterTypeName = normalizedType;
      }
      
      const message = `לא נמצאו תזרימי מזומנים מסוג "${filterTypeName}"`;
      // Show notification using the notification system
      if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('סינון תזרימי מזומנים', message, 4000, 'ui', {
          userInitiated: true
        });
      }
    }
    
    return;
  }

  // Fallback: update table directly
  window.Logger?.debug('📊 [filterCashFlowsByType] Using direct table update (no pagination)', { 
    filteredCount: filteredData.length,
    hasPagination: false,
    page: 'cash_flows' 
  });
  window.Logger?.info('Using direct table update (no pagination)', { page: 'cash_flows' });
  await updateCashFlowsTable(filteredData);
  window.Logger?.debug('✅ [filterCashFlowsByType] updateCashFlowsTable completed');
}

/**
 * Filter cash flows locally by type
 * @param {string} flowType - Flow type
 * @returns {Array} Filtered cash flows
 */
function filterCashFlowsLocallyByType(flowType) {
  const sourceData = Array.isArray(window.allCashFlowsData) ? window.allCashFlowsData : (Array.isArray(window.cashFlowsData) ? window.cashFlowsData : []);
  if (flowType === 'all') {
    return [...sourceData];
  }
  const normalized = flowType.toLowerCase();
  return sourceData.filter(item => {
    return cashFlowMatchesType(item, normalized);
  });
}

/**
 * Save cash flow type filter state
 * @param {string} filterType - Filter type value
 * @returns {Promise<void>}
 */
async function saveCashFlowTypeFilterState(filterType) {
  try {
    if (window.PageStateManager && window.PageStateManager.initialized) {
      const pageState = await window.PageStateManager.loadPageState('cash_flows') || {};
      if (!pageState.filters) {
        pageState.filters = {};
      }
      if (!pageState.filters.custom) {
        pageState.filters.custom = {};
      }
      pageState.filters.custom.cashFlowType = filterType;
      await window.PageStateManager.savePageState('cash_flows', pageState);
    }
  } catch (error) {
    window.Logger?.warn('Failed to save cash flow type filter state', { error, page: 'cash_flows' });
  }
}

/**
 * Load cash flow type filter state
 * @returns {Promise<string>} Filter type or 'all' if not found
 */
async function loadCashFlowTypeFilterState() {
  try {
    if (window.PageStateManager && window.PageStateManager.initialized) {
      const pageState = await window.PageStateManager.loadPageState('cash_flows');
      if (pageState?.filters?.custom?.cashFlowType) {
        const savedType = pageState.filters.custom.cashFlowType;
        if (CASH_FLOW_TYPE_FILTERS.has(savedType)) {
          return savedType;
        }
      }
    }
  } catch (error) {
    window.Logger?.warn('Failed to load cash flow type filter state', { error, page: 'cash_flows' });
  }
  return 'all';
}

/**
 * Reapply cash flow type filter
 * @returns {Promise<void>}
 */
async function reapplyCashFlowTypeFilter() {
  // Load saved filter state
  const savedFilter = await loadCashFlowTypeFilterState();
  if (savedFilter && savedFilter !== 'all') {
    activeCashFlowTypeFilter = savedFilter;
  }
  
  // Update dropdown to reflect current filter
  setActiveCashFlowTypeButton(activeCashFlowTypeFilter);
  await filterCashFlowsByType(activeCashFlowTypeFilter, { skipButtonUpdate: true });
}

/**
 * Get account name by ID
 * @function getAccountNameById
 * @param {string} accountId - Account ID
 * @returns {string} Account name
 */
function getAccountNameById(accountId) {
  try {
    // בדיקה אם יש cache של HeaderSystem
    if (window.HeaderSystem && window.HeaderSystem.accountsCache) {
      const account = window.HeaderSystem.accountsCache.find(acc => acc.id === accountId);
      if (account) return account.name;
    }
    
    // בדיקה אם יש נתונים גלובליים
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
      const account = window.trading_accountsData.find(acc => acc.id === accountId);
      if (account) return account.name;
    }
    
    return null;
  } catch (error) {
    window.Logger.error('שגיאה בקבלת שם חשבון מסחר לפי מזהה:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בקבלת שם חשבון מסחר לפי מזהה', error.message);
    }
    return null;
  }
}

/**
 * Ensure trading accounts data is loaded
 * @returns {Promise<void>}
 */
async function ensureTradingAccountsLoaded() {
  // אם יש כבר נתונים, אין צורך לטעון שוב
  if ((window.HeaderSystem && window.HeaderSystem.accountsCache) || 
      (window.trading_accountsData && Array.isArray(window.trading_accountsData))) {
    return;
  }
  
  // טעינת נתונים באמצעות הפונקציה מקובץ השירותים
  if (typeof window.loadTradingAccountsFromServer === 'function') {
    await window.loadTradingAccountsFromServer();
  }
}

// השתמש בפונקציה הכללית מ-translation-utils.js
// הפונקציה colorAmount זמינה גלובלית מ-translation-utils.js

// פונקציות בסיסיות - הוסרו פונקציות לא בשימוש

// פונקציות לפתיחה/סגירה של סקשנים - משתמשות בפונקציות הגלובליות
// הפונקציות הבאות זמינות גלובלית:
// - window.toggleSection()
// - window.toggleSection('cash_flows')
// - window.restoreSectionStates()

/**
 * פונקציה לפתיחה/סגירה של סקשן עליון (התראות וסיכום)
 */

// REMOVED: toggleCashFlowsSection - use window.toggleSection('main') from ui-utils.js instead
// The HTML already uses toggleSection('main') and toggleSection('top')

// REMOVED: restoreCashFlowsSectionState - use window.restoreSectionStates() from ui-utils.js instead
// The global function handles section state restoration for all pages

// פונקציות נוספות
// resetAllFiltersAndReloadData() - לא בשימוש, הוסרה


// פונקציות אלו הוסרו - תזרימי מזומנים לא צריכים בדיקת מקושרים
// הפונקציה showDeleteCashFlowWarning משתמשת ישירות ב-window.showDeleteWarning

// ========================================
// פונקציות מודלים
// ========================================

// פונקציית מחיקה - הוסרה כי לא בשימוש (הוחלפה ב-window.showDeleteWarning)

// ========================================
// פונקציות API
// ========================================

/**
 * Helper validation function for cash flow amount
 * @param {string|number} value - Amount value to validate
 * @returns {string|boolean} Error message or true if valid
 */
function validateCashFlowAmount(value) {
  const amount = parseFloat(value);
  if (isNaN(amount)) return 'יש להזין סכום תקין';
  if (amount === 0) return 'סכום לא יכול להיות 0';
  if (Math.abs(amount) > 10000000) return 'סכום גבוה מדי (מקסימום 10,000,000)';
  return true;
}

/**
 * Helper validation function for cash flow date
 * @param {string} value - Date value to validate
 * @returns {string|boolean} Error message or true if valid
 */
function validateCashFlowDate(value) {
  if (!value) return 'יש להזין תאריך';
  
  // Use dateUtils for consistent date parsing
  let date;
  if (window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function') {
    const envelope = window.dateUtils.ensureDateEnvelope(value);
    if (envelope && envelope.epochMs) {
      date = new Date(envelope.epochMs);
    } else {
      date = new Date(value);
    }
  } else if (value && typeof value === 'object' && typeof value.epochMs === 'number') {
    date = new Date(value.epochMs);
  } else {
    date = new Date(value);
  }
  
  if (Number.isNaN(date.getTime())) return 'תאריך לא תקין';
  
  const today = new Date();
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const minDate = new Date(2000, 0, 1);
  
  if (date > maxDate) return 'תאריך לא יכול להיות יותר משנה קדימה';
  if (date < minDate) return 'תאריך לא יכול להיות לפני שנת 2000';
  return true;
}

/**
 * Validate cash flow form
 * @function validateCashFlowForm
 * @returns {boolean} Is valid
 */
function validateCashFlowForm() {
  try {
    return window.validateEntityForm('addCashFlowForm', [
      { id: 'cashFlowType', name: 'סוג תזרים' },
      { 
        id: 'cashFlowAmount', 
        name: 'סכום',
        validation: validateCashFlowAmount
    },
    { 
      id: 'cashFlowDate', 
      name: 'תאריך',
      validation: validateCashFlowDate
    },
    { id: 'cashFlowAccount', name: 'חשבון מסחר מסחר' },
    { id: 'cashFlowCurrency', name: 'מטבע' },
    { id: 'cashFlowSource', name: 'מקור' }
  ]);
  
  } catch (error) {
    window.Logger.error('שגיאה בוולידציה של טופס תזרים מזומנים:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בוולידציה של טופס תזרים מזומנים', error.message);
    }
    return false;
  }
}

/**
 * הצגת שגיאת וולידציה לשדה
 * @param {string} fieldId - מזהה השדה
 * @param {string} message - הודעת השגיאה
 */
// ולידציה - משתמש במערכת הכללית window.validateEntityForm

/**
 * Validate edit cash flow form
 * @function validateEditCashFlowForm
 * @returns {boolean} Is valid
 */
function validateEditCashFlowForm() {
  try {
    return window.validateEntityForm('editCashFlowForm', [
      { id: 'editCashFlowType', name: 'סוג תזרים' },
      { 
        id: 'editCashFlowAmount', 
        name: 'סכום',
        validation: validateCashFlowAmount
      },
    { 
      id: 'editCashFlowDate', 
      name: 'תאריך',
      validation: validateCashFlowDate
    },
    { id: 'editCashFlowAccount', name: 'חשבון מסחר מסחר' },
    { id: 'editCashFlowCurrency', name: 'מטבע' },
    { id: 'editCashFlowSource', name: 'מקור' }
  ]);
  
  } catch (error) {
    window.Logger.error('שגיאה בוולידציה של טופס עריכת תזרים מזומנים:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בוולידציה של טופס עריכת תזרים מזומנים', error.message);
    }
    return false;
  }
}

// ולידציה - משתמש במערכת הכללית window.validateEntityForm


// ========================================
// פונקציות מחיקה
// ========================================

/**
 * מחיקת תזרים מזומנים
 */
async function deleteCashFlow(id) {
  try {
    // בדיקת פריטים מקושרים לפני חלון האישור
    if (typeof window.checkLinkedItemsBeforeAction === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeAction('cash_flow', id, 'delete');
      if (hasLinkedItems) {
        // יש פריטים מקושרים - המודול כבר הוצג, לא נציג חלון אישור
        return;
      }
    }
    
    // אין פריטים מקושרים - המשך עם חלון האישור
    // Get cash flow details for confirmation message
    let cashFlowDetails = `תזרים מזומנים #${id}`;
    const cashFlow = window.cashFlowsData ? window.cashFlowsData.find(cf => cf.id === id) : null;
    
    if (!cashFlow) {
      window.showErrorNotification('שגיאה', 'תזרים המזומנים לא נמצא', 6000, 'system');
      return;
    }

    // Build detailed cash flow info
    const accountName = getAccountNameById(cashFlow.trading_account_id) || 'לא מוגדר';
    const type = getCashFlowTypeText(cashFlow.type);
    const amount = cashFlow.amount;
    const currency = cashFlow.currency_symbol || '';
    const date = (() => {
      const dateValue = cashFlow.date;
      if (!dateValue) return 'לא מוגדר';
      if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
        const dateEnvelope = window.dateUtils?.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(dateValue) : dateValue;
        return window.FieldRendererService.renderDate(dateEnvelope || dateValue, false);
      }
      if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
        const dateEnvelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(dateValue) : dateValue;
        return window.dateUtils.formatDate(dateEnvelope || dateValue, { includeTime: false });
      }
      try {
        // Use dateUtils for consistent date parsing
        let dateObj;
        if (window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function') {
          const envelope = window.dateUtils.ensureDateEnvelope(dateValue);
          if (envelope && envelope.epochMs) {
            dateObj = new Date(envelope.epochMs);
          } else {
            dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
          }
        } else if (dateValue && typeof dateValue === 'object' && typeof dateValue.epochMs === 'number') {
          dateObj = new Date(dateValue.epochMs);
        } else {
          dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
        }
        
        if (!Number.isNaN(dateObj.getTime())) {
          // Use FieldRendererService or dateUtils for formatting
          if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
            return window.FieldRendererService.renderDate(dateObj, false);
          }
          if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
            return window.dateUtils.formatDate(dateObj, { includeTime: false });
          }
          return window.formatDate ? window.formatDate(dateObj, false) : dateObj.toLocaleDateString('he-IL');
        }
      } catch (error) {
        window.Logger?.warn('⚠️ cash_flows date formatting failed in details', { error, cashFlowId: cashFlow?.id }, { page: 'cash_flows' });
      }
      return 'לא מוגדר';
    })();
    const description = cashFlow.description || 'ללא תיאור';
    
    cashFlowDetails = `${accountName} - ${type}, ${amount}${currency}, תאריך: ${date}, תיאור: ${description}`;

    // Show delete warning with detailed information
    if (window.showDeleteWarning) {
      window.showDeleteWarning('cash_flow', cashFlowDetails, 'תזרים מזומנים',
        async () => await performCashFlowDeletion(id),
        () => {}
      );
    } else {
      // Fallback to simple confirm
      if (!window.showConfirmationDialog('האם אתה בטוח שברצונך למחוק את תזרים המזומנים?')) {
        return;
      }
      await performCashFlowDeletion(id);
    }
    
  } catch (error) {
    window.Logger.error('deleteCashFlow: Error occurred', { page: 'cash_flows', error: error?.message || error });
    CRUDResponseHandler.handleError(error, 'מחיקת תזרים מזומנים');
  }
}

/**
 * Perform cash flow deletion
 * @function performCashFlowDeletion
 * @async
 * @param {number} id - Cash flow ID
 * @returns {Promise<void>}
 */
async function performCashFlowDeletion(id) {
  try {
    let response;
    if (typeof window.CashFlowsData?.deleteCashFlow === 'function') {
      response = await window.CashFlowsData.deleteCashFlow(id);
    } else {
      response = await fetch(`/api/cash-flows/${id}`, {
        method: 'DELETE',
      });
    }

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'תזרים המזומנים נמחק בהצלחה!',
      entityName: 'תזרים מזומנים',
      reloadFn: () => window.loadCashFlowsData({ force: true }),
      requiresHardReload: false
    });
  } catch (error) {
    window.Logger.error('performCashFlowDeletion: Error occurred', { page: 'cash_flows', error: error?.message || error });
    CRUDResponseHandler.handleError(error, 'מחיקת תזרים מזומנים');
  }
}

/**
 * מחיקת כל רשומות תזרימי המזומנים מייבוא (source='file_import')
 * @function deleteImportedCashFlows
 * @async
 * @returns {Promise<void>}
 */
async function deleteImportedCashFlows() {
  try {
    // Show confirmation dialog
    const confirmationMessage = 'האם אתה בטוח שברצונך למחוק את כל רשומות תזרימי המזומנים שמקורן בייבוא (source=\'file_import\')?\n\nפעולה זו תמחק את כל הרשומות המיובאות ותאפשר בדיקות ייבוא מחדש.';
    
    if (typeof window.showConfirmationDialog === 'function') {
      const confirmed = await new Promise((resolve) => {
        try {
          window.showConfirmationDialog(
            'מחיקת רשומות מייבוא',
            confirmationMessage || 'האם אתה בטוח שברצונך למחוק את כל רשומות תזרימי המזומנים מייבוא?',
            () => resolve(true),
            () => resolve(false),
            'danger'
          );
        } catch (error) {
          window.Logger?.error('Error in showConfirmationDialog:', error);
          // Fallback to simple confirm
          const confirmed = window.window.showConfirmationDialog(confirmationMessage || 'האם אתה בטוח שברצונך למחוק את כל רשומות תזרימי המזומנים מייבוא?');
          resolve(confirmed);
        }
      });
      
      if (!confirmed) {
        return;
      }
    } else {
      // Fallback to simple confirm
      if (!window.showConfirmationDialog(confirmationMessage || 'האם אתה בטוח שברצונך למחוק את כל רשומות תזרימי המזומנים מייבוא?')) {
        return;
      }
    }

    // Show loading notification
    if (window.showNotification) {
      window.showNotification('מבצע מחיקה...', 'info', 3000);
    }

    // Call API endpoint
    const response = await fetch('/api/cash-flows/delete-imported', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      const deletedCount = data.deleted_count || 0;
      const message = deletedCount > 0 
        ? `נמחקו ${deletedCount} רשומות תזרימי מזומנים מייבוא בהצלחה!`
        : 'לא נמצאו רשומות מייבוא למחיקה.';
      
      if (window.showNotification) {
        window.showNotification(message, 'success', 5000);
      } else {
        window.showErrorNotification(message, "שגיאה");
      }

      // Reload cash flows data
      if (typeof window.loadCashFlowsData === 'function') {
        await window.loadCashFlowsData({ force: true });
      } else if (typeof window.updateCashFlowsTable === 'function') {
        // Fallback: try to refresh table
        window.updateCashFlowsTable();
      }
    } else {
      const errorMessage = data.error?.message || data.message || 'שגיאה במחיקת רשומות מייבוא';
      if (window.showNotification) {
        window.showNotification(errorMessage, 'error', 6000);
      } else {
        window.showErrorNotification(`שגיאה: ${errorMessage}`, "שגיאה");
      }
      
      if (window.Logger) {
        window.Logger.error('deleteImportedCashFlows: API error', { 
          page: 'cash_flows', 
          error: errorMessage,
          response: data
        });
      }
    }
  } catch (error) {
    const errorMessage = error?.message || 'שגיאה בלתי צפויה במחיקת רשומות מייבוא';
    if (window.showNotification) {
      window.showNotification(errorMessage, 'error', 6000);
    } else {
      window.showErrorNotification(`שגיאה: ${errorMessage}`, "שגיאה");
    }
    
    if (window.Logger) {
      window.Logger.error('deleteImportedCashFlows: Error occurred', { 
        page: 'cash_flows', 
        error: error?.message || error 
      });
    }
  }
}

// Export function to window for onclick handler
window.deleteImportedCashFlows = deleteImportedCashFlows;

// ========================================
// פונקציות פריטים מקושרים
// ========================================

// ========================================
// Validation Rules
// ========================================

// כללי וולידציה למודל הוספה
const addCashFlowValidationRules = {
  cashFlowAccount: {
    required: true,
    message: 'נדרש לבחור חשבון מסחר',
  },
  cashFlowType: {
    required: true,
    message: 'נדרש לבחור סוג תזרים',
  },
  cashFlowAmount: {
    required: true,
    min: 0.01,
    message: 'נדרש להזין סכום חיובי',
  },
  cashFlowCurrency: {
    required: true,
    message: 'נדרש לבחור מטבע',
  },
  cashFlowDate: {
    required: true,
    message: 'נדרש לבחור תאריך',
  },
  cashFlowSource: {
    required: true,
    message: 'נדרש לבחור מקור',
  },
  cashFlowExternalId: {
    required: false, // לא חובה - תלוי במקור
    message: 'נדרש להזין מזהה חיצוני',
  },
};

// כללי וולידציה למודל עריכה
const editCashFlowValidationRules = {
  editCashFlowAccount: {
    required: true,
    message: 'נדרש לבחור חשבון מסחר',
  },
  editCashFlowType: {
    required: true,
    message: 'נדרש לבחור סוג תזרים',
  },
  editCashFlowAmount: {
    required: true,
    min: 0.01,
    message: 'נדרש להזין סכום חיובי',
  },
  editCashFlowCurrency: {
    required: true,
    message: 'נדרש לבחור מטבע',
  },
  editCashFlowDate: {
    required: true,
    message: 'נדרש לבחור תאריך',
  },
  editCashFlowSource: {
    required: true,
    message: 'נדרש לבחור מקור',
  },
  editCashFlowExternalId: {
    required: false, // לא חובה - תלוי במקור
    message: 'נדרש להזין מזהה חיצוני',
  },
};

// ========================================
// פונקציות עזר
// ========================================

/**
 * טעינת מטבעות מהשרת עם מערכת המטבעות החדשה
 */
// loadCurrenciesFromServer - using global function from data-utils.js

/**
 * טעינת רשימת חשבונות למודולי cash flow
 * @param {string} selectId - ID של ה-select element
 * @param {boolean} useDefaultFromPreferences - האם להשתמש בברירת מחדל מהעדפות
 */
async function loadAccountsForCashFlow(selectId, useDefaultFromPreferences = false) {
  try {
    // שימוש ב-SelectPopulatorService
    await SelectPopulatorService.populateAccountsSelect(selectId, {
      includeEmpty: true,
      emptyText: 'בחר חשבון מסחר...',
      defaultFromPreferences: useDefaultFromPreferences,
      filterFn: (account) => account.status === 'open'
    });
    
    // לוגים רק למודול הוספה
    if (useDefaultFromPreferences) {
      const select = document.getElementById(selectId);
      window.Logger.debug('After loading - selected value', { value: select?.value, page: 'cash_flows' });
      window.Logger.debug('After loading - selected text', { text: select?.options[select?.selectedIndex]?.text, page: 'cash_flows' });
    }
    
  } catch (error) {
    handleApiError(error, 'טעינת חשבונות');

    // הצגת הודעת שגיאה
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת חשבונות');
    }
  }
}

/**
 * טעינת רשימת מטבעות למודולי cash flow
 * @param {string} selectId - ID של ה-select element
 * @param {boolean} useDefaultFromPreferences - האם להשתמש בברירת מחדל מהעדפות
 */
async function loadCurrenciesForCashFlow(selectId, useDefaultFromPreferences = false) {
  try {
    // שימוש ב-SelectPopulatorService
    await SelectPopulatorService.populateCurrenciesSelect(selectId, {
      includeEmpty: true,
      emptyText: 'בחר מטבע...',
      defaultFromPreferences: useDefaultFromPreferences
    });
  } catch (error) {
    handleApiError(error, 'טעינת מטבעות');

    // הצגת הודעת שגיאה
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת מטבעות');
    }
  }
}

/**
 * רינדור טבלת תזרימי מזומנים
 */
async function renderCashFlowsTable() {
  const tbody = document.querySelector('#cashFlowsContainer table tbody');
  if (!tbody) {return;}

  tbody.textContent = '';

  // Use filtered data if available, otherwise use cashFlowsData
  const dataToRender = Array.isArray(window.filteredCashFlowsData) && window.filteredCashFlowsData.length > 0
    ? window.filteredCashFlowsData
    : (Array.isArray(cashFlowsData) ? cashFlowsData : []);
  
  window.Logger?.debug('🎨 [renderCashFlowsTable] Rendering table', {
    filteredDataLength: window.filteredCashFlowsData?.length || 0,
    cashFlowsDataLength: cashFlowsData?.length || 0,
    dataToRenderLength: dataToRender.length
  });

  if (!dataToRender || dataToRender.length === 0) {
    // Check if we're filtering (not showing all data)
    const isFiltered = activeCashFlowTypeFilter && activeCashFlowTypeFilter !== 'all';
    
    let message = 'לא נמצאו תזרימי מזומנים';
    let filterTypeName = '';
    
    if (isFiltered) {
      // Get display name from the select option or button
      const select = document.getElementById('cashFlowTypeFilter');
      if (select) {
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption) {
          filterTypeName = selectedOption.text;
        }
      }
      // Buttons removed - only dropdown remains
      // Fallback: use the type value itself
      if (!filterTypeName) {
        filterTypeName = activeCashFlowTypeFilter;
      }
      
      message = `לא נמצאו תזרימי מזומנים מסוג "${filterTypeName}"`;
      
      // Show notification using the notification system
      // showInfoNotification(title, message, duration, category, options)
      if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('סינון תזרימי מזומנים', message, 4000, 'ui', {
          userInitiated: true
        });
      } else if (typeof window.showNotification === 'function') {
        // showNotification(message, type, title, duration, category, options)
        window.showNotification(message, 'info', 'סינון תזרימי מזומנים', 4000, 'ui');
      }
    }
    
    // Show message in table as well
    tbody.textContent = '';
    const messageRow = document.createElement('tr');
    const messageCell = document.createElement('td');
    messageCell.colSpan = 9;
    messageCell.className = 'text-center';
    messageCell.textContent = message;
    messageRow.appendChild(messageCell);
    tbody.appendChild(messageRow);
    return;
  }

  // וידוא שנתוני חשבונות מסחר נטענו
  await ensureTradingAccountsLoaded();

  dataToRender.forEach(cashFlow => {
    const row = document.createElement('tr');
    // קבלת שם החשבון מסחר - קודם ננסה מהשרת, אחר כך fallback
    const accountName = cashFlow.account_name || getAccountNameById(cashFlow.trading_account_id) || `חשבון מסחר ${cashFlow.trading_account_id}`;

    // הצגת סמל מטבע עם שימוש במערכת הכללית getCurrencyDisplay
    const currencyDisplay = resolveCurrencySymbolForCashFlow(cashFlow);

    // Check if this is a currency exchange
    const isExchange = isCurrencyExchange(cashFlow);
    const exchangeId = isExchange ? getExchangeIdFromCashFlow(cashFlow) : null;
    const exchangeGroupId = cashFlow.exchange_group_id || (isExchange ? cashFlow.external_id : null);
    const exchangeDirection = cashFlow.exchange_direction
      || resolveExchangeDirectionFromType(cashFlow.type);

    if (exchangeGroupId) {
      row.dataset.exchangeGroupId = exchangeGroupId;
      if (exchangeDirection) {
        row.dataset.exchangeDirection = exchangeDirection;
      } else {
        row.removeAttribute('data-exchange-direction');
      }
    } else {
      row.removeAttribute('data-exchange-group-id');
      row.removeAttribute('data-exchange-direction');
    }

    // קבלת סוג בעזרת מערכת הרינדור הכללית
    const parsedAmount = typeof cashFlow.amount === 'number'
      ? cashFlow.amount
      : parseFloat(cashFlow.amount);
    const amountForColor = Number.isFinite(parsedAmount) ? parsedAmount : null;
    const baseTypeDisplay = (window.FieldRendererService && typeof window.FieldRendererService.renderType === 'function')
      ? window.FieldRendererService.renderType(cashFlow.type, amountForColor)
      : getCashFlowTypeWithColor(cashFlow.type);
    const exchangeBadgeHtml = (window.FieldRendererService && typeof window.FieldRendererService.renderExchangeBadge === 'function' && exchangeGroupId)
      ? window.FieldRendererService.renderExchangeBadge({
          exchange_group_id: exchangeGroupId,
          exchange_direction: exchangeDirection,
          linked_exchange_summary: cashFlow.linked_exchange_summary,
          exchange_pair_summary: cashFlow.exchange_pair_summary
        })
      : (isExchange ? '🔁 ' : '');
    const typeDisplay = exchangeBadgeHtml
      ? `${exchangeBadgeHtml}${baseTypeDisplay}`
      : baseTypeDisplay;
    
    // Trade column - show trade ID with link button if exists
    const tradeCell = cashFlow.trade_id 
      ? `<div class="table-cell-flex-small">
           <button class="btn btn-sm btn-outline-primary table-btn-small" 
                   data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${cashFlow.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${cashFlow.trade_id}, 'view'); }" 
                   title="פתח פרטי טרייד">
             🔗
           </button>
           <span>#${cashFlow.trade_id}</span>
         </div>`
      : '-';

    // עיצוב סכום עם יישור נכון וצביעה
    // For exchanges, we need to show both amounts (from -> to)
    let amountDisplay = formatCashFlowAmount(cashFlow.amount, cashFlow.type, currencyDisplay);
    if (isExchange) {
      // For exchange, we need to fetch the "to" flow to show both amounts
      // For now, show the amount with exchange indicator
      // The full exchange details will be shown in details modal
      amountDisplay = `🔄 ${amountDisplay}`;
    }

    // עיצוב שער עם 2 ספרות אחרי הנקודה
    const rateDisplay = formatUsdRate(cashFlow.usd_rate);

    // Actions menu - different for exchanges
    const actionsMenu = isExchange ? 
      (() => {
        if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
        const menuItems = [
          { type: 'VIEW', onclick: `showCashFlowDetails(${cashFlow.id})`, title: 'הצג פרטי המרה' }
        ];
        if (cashFlow.linked_exchange_cash_flow_id) {
          menuItems.push({
            type: 'LINK',
            onclick: `showCashFlowDetails(${cashFlow.linked_exchange_cash_flow_id})`,
            title: 'פתח רשומה צמודה'
          });
        }
        menuItems.push(
          { type: 'EDIT', onclick: `editCashFlow(${cashFlow.id})`, title: 'ערוך המרת מטבע' },
          { type: 'DELETE', onclick: `deleteCurrencyExchange('${exchangeId}')`, title: 'מחק המרת מטבע' }
        );
        const result = window.createActionsMenu(menuItems);
        return result || '';
      })() :
      (() => {
        if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
        const result = window.createActionsMenu([
          { type: 'VIEW', onclick: `showCashFlowDetails(${cashFlow.id})`, title: 'הצג פרטי תזרים' },
          { type: 'EDIT', onclick: `editCashFlow(${cashFlow.id})`, title: 'ערוך תזרים' },
          { type: 'DELETE', onclick: `deleteCashFlow(${cashFlow.id})`, title: 'מחק תזרים' }
        ]);
        return result || '';
      })();

    const descriptionDisplay = (window.FieldRendererService && typeof window.FieldRendererService.renderTextPreview === 'function')
      ? window.FieldRendererService.renderTextPreview(cashFlow.description, { maxLength: 20, emptyPlaceholder: '-' })
      : (() => {
          const fallbackPlain = (cashFlow.description || '').replace(/<[^>]*>/g, '').trim();
          if (!fallbackPlain) {
            return '-';
          }
          const truncated = fallbackPlain.length > 20 ? `${fallbackPlain.substring(0, 20).trimEnd()}…` : fallbackPlain;
          const escape = (text) => String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          return `<span class="text-truncate-preview" title="${escape(fallbackPlain)}">${escape(truncated)}</span>`;
        })();

            row.innerHTML = `
            <td class="trade-cell" data-trade-id="${cashFlow.trade_id || ''}">
                ${tradeCell}
            </td>
            <td class="col-account ticker-cell" data-account="${cashFlow.trading_account_id || accountName || ''}">
                <div class="table-cell-flex">
                    <span class="entity-trading_account-badge entity-account-badge entity-badge-base">
                        ${accountName}
                    </span>
                </div>
            </td>
            <td class="col-type type-cell" data-type="${cashFlow.type || ''}" dir="rtl">${typeDisplay}</td>
            <td class="col-amount text-end">
                ${amountDisplay}
            </td>
            <td class="col-date table-cell-center" data-date="${cashFlow.date || ''}">${(() => {
              const dateValue = cashFlow.date;
              if (!dateValue) {
                return '<span class="date-text">-</span>';
              }
              // Use FieldRendererService.renderDate for consistent date formatting
              if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                const dateEnvelope = window.dateUtils?.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(dateValue) : dateValue;
                return `<span class="date-text">${window.FieldRendererService.renderDate(dateEnvelope || dateValue, false)}</span>`;
              }
              // Fallback to dateUtils or formatDate
              if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
                const dateEnvelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(dateValue) : dateValue;
                return `<span class="date-text">${window.dateUtils.formatDate(dateEnvelope || dateValue, { includeTime: false })}</span>`;
              }
              // Last fallback
              try {
                const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
                if (!Number.isNaN(dateObj.getTime())) {
                  const formatted = window.formatDate ? window.formatDate(dateObj, false) : dateObj.toLocaleDateString('he-IL');
                  return `<span class="date-text">${formatted}</span>`;
                }
              } catch (error) {
                window.Logger?.warn('⚠️ cash_flows date formatting failed', { error, cashFlowId: cashFlow?.id }, { page: 'cash_flows' });
              }
              return '<span class="date-text">-</span>';
            })()}</td>
            <td class="col-description">${descriptionDisplay}</td>
            <td class="col-source">${window.translateCashFlowSource ?
    window.translateCashFlowSource(cashFlow.source) :
    cashFlow.source}</td>
            ${(() => {
              // Prefer FieldRendererService.renderDate for consistent date formatting (same as notes page)
              const rawDate = cashFlow.updated_at || cashFlow.date || cashFlow.created_at || null;
              
              if (!rawDate) {
                return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
              }

              // Use FieldRendererService.renderDate for proper date formatting (handles DateEnvelope, Date objects, strings)
              let dateDisplay = '';
              let epoch = null;

              if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                // Use FieldRendererService to render date with time (same as notes page)
                dateDisplay = window.FieldRendererService.renderDate(rawDate, true);
                
                // Get epoch for sorting
                if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                  const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(rawDate) : rawDate;
                  epoch = window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                } else if (rawDate instanceof Date) {
                  epoch = rawDate.getTime();
                } else if (typeof rawDate === 'string') {
                  const parsed = Date.parse(rawDate);
                  epoch = Number.isNaN(parsed) ? null : parsed;
                } else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {
                  epoch = rawDate.epochMs;
                }
              } else {
                // Fallback: work directly with date envelope objects or raw values (same as notes page)
                const envelope = window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function'
                  ? window.dateUtils.ensureDateEnvelope(rawDate)
                  : rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || rawDate.local)
                    ? rawDate
                    : null;

                // Derive epoch milliseconds
                epoch = (() => {
                  if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                    return window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                  }
                  if (envelope && typeof envelope.epochMs === 'number') {
                    return envelope.epochMs;
                  }
                  if (rawDate instanceof Date) {
                    return rawDate.getTime();
                  }
                  if (typeof rawDate === 'string') {
                    const parsed = Date.parse(rawDate);
                    return Number.isNaN(parsed) ? null : parsed;
                  }
                  return null;
                })();

                if (epoch === null || Number.isNaN(epoch)) {
                  return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
                }

                // Build date display using unified date utilities
                dateDisplay = (() => {
                  if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
                    return window.dateUtils.formatDateTime(envelope || rawDate);
                  }
                  if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
                    return window.dateUtils.formatDate(envelope || rawDate, { includeTime: true });
                  }
                  try {
                    const dateObj = new Date(epoch);
                    return window.formatDate ? window.formatDate(dateObj, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(dateObj, { includeTime: true }) : dateObj.toLocaleString('he-IL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }));
                  } catch (err) {
                    window.Logger?.warn('⚠️ cash_flows updated-cell date formatting failed', { err, cashFlowId: cashFlow?.id }, { page: 'cash_flows' });
                    return 'לא מוגדר';
                  }
                })();
              }

              if (!dateDisplay || dateDisplay === '-') {
                return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
              }

              return `<td class="col-updated"${epoch ? ` data-epoch="${epoch}"` : ''} title="${dateDisplay}"><span class="updated-value" dir="ltr">${dateDisplay}</span></td>`;
            })()}
            <td class="col-actions actions-cell actions-4-items">
              ${actionsMenu}
            </td>
        `;
    tbody.appendChild(row);
  });

  setupExchangeRowInteractions();

  // עדכון מספר הפריטים - משתמש בפונקציה הגנרית לקבלת סך כל הרשומות
  if (window.updateTableCount) {
    window.updateTableCount('cashFlowsCount', 'cash_flows', 'תזרימים', cashFlowsData.length);
  } else {
    // Fallback
    const countElement = document.getElementById('cashFlowsCount');
    if (countElement) {
      // Use TableDataRegistry to get total filtered count (not just current page)
      if (window.getTableDataCounts) {
        const counts = window.getTableDataCounts('cash_flows');
        const totalCount = counts.filtered || counts.total || cashFlowsData.length;
        countElement.textContent = `${totalCount} תזרימים`;
      } else {
        // Fallback to data length
        countElement.textContent = `${cashFlowsData.length} תזרימים`;
      }
    }
  }

  // Clean up and reinitialize Bootstrap tooltips after table update
  // This prevents "Cannot convert undefined or null to object" errors
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    try {
      // Destroy all existing tooltips in the table container
      const tableContainer = document.querySelector('#cashFlowsContainer');
      if (tableContainer) {
        const existingTooltips = tableContainer.querySelectorAll('[data-bs-toggle="tooltip"], [data-tooltip]');
        existingTooltips.forEach(element => {
          const tooltipInstance = bootstrap.Tooltip.getInstance(element);
          if (tooltipInstance) {
            try {
              tooltipInstance.dispose();
            } catch (e) {
              // Ignore disposal errors
            }
          }
        });
      }
      
      // Reinitialize tooltips via button system if available
      if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
        setTimeout(() => {
          window.ButtonSystem.initializeButtons();
        }, 100);
      } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.initializeTooltips === 'function') {
        setTimeout(() => {
          const tableContainer = document.querySelector('#cashFlowsContainer');
          if (tableContainer) {
            window.advancedButtonSystem.initializeTooltips(tableContainer);
          }
        }, 100);
      }
    } catch (tooltipError) {
      window.Logger?.warn('Tooltip cleanup/reinit failed', { error: tooltipError?.message, page: 'cash_flows' });
    }
  }

  // Render unified forex exchanges table
  // IMPORTANT: Use ALL cash flows data (not filtered/paginated) for unified exchanges table
  // The second table should show all relevant exchanges regardless of filter or pagination
  try {
    const allData = Array.isArray(window.allCashFlowsData) && window.allCashFlowsData.length > 0
      ? window.allCashFlowsData
      : (Array.isArray(window.cashFlowsData) && window.cashFlowsData.length > 0
          ? window.cashFlowsData
          : []);
    renderUnifiedForexExchangesTable(allData);
  } catch (e) {
    window.Logger?.warn('renderUnifiedForexExchangesTable failed', { error: e?.message, page: 'cash_flows' });
  }
}

/**
 * Update page summary statistics
 * @function updatePageSummaryStats
 * @returns {void}
 * Uses InfoSummarySystem from services/statistics-calculator.js
 */
function updatePageSummaryStats() {
  try {
    const summarySource = Array.isArray(window.filteredCashFlowsData) && window.filteredCashFlowsData.length > 0
      ? window.filteredCashFlowsData
      : (Array.isArray(window.allCashFlowsData) && window.allCashFlowsData.length > 0
          ? window.allCashFlowsData
          : (cashFlowsData || []));

    // Use global InfoSummarySystem if available
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS && window.INFO_SUMMARY_CONFIGS.cash_flows) {
      const config = window.INFO_SUMMARY_CONFIGS.cash_flows;
      window.InfoSummarySystem.calculateAndRender(summarySource, config);
      window.Logger.debug('Page summary stats updated via InfoSummarySystem', { 
        count: summarySource?.length || 0, 
        page: 'cash_flows' 
      });
    } else {
      // Fallback to local implementation if global system not available
      // Use generic updateTableCount function
      if (window.updateTableCount) {
        window.updateTableCount('cashFlowsCount', 'cash_flows', 'תזרימים', summarySource ? summarySource.length : 0);
      } else {
        // Fallback
        const countElement = document.getElementById('cashFlowsCount');
        if (countElement) {
          // Use TableDataRegistry to get total filtered count (not just current page)
          if (window.getTableDataCounts) {
            const counts = window.getTableDataCounts('cash_flows');
            const totalCount = counts.filtered || counts.total || (summarySource ? summarySource.length : 0);
            countElement.textContent = `${totalCount} תזרימים`;
          } else if (summarySource) {
            // Fallback to summary source length
            countElement.textContent = `${summarySource.length} תזרימים`;
          }
        }
      }
      
      const summaryElement = document.getElementById('cashFlowsSummary');
      if (summaryElement && summarySource) {
        const totalAmount = summarySource.reduce((sum, cf) => sum + (cf.amount || 0), 0);
        summaryElement.textContent = `סה"כ: ${summarySource.length} תזרימים, ${totalAmount.toFixed(2)} ₪`;
      }
      
      window.Logger.warn('InfoSummarySystem not available - using fallback', { page: 'cash_flows' });
    }
  } catch (error) {
    window.Logger.warn('Error updating page summary stats', { 
      error: error.message, 
      page: 'cash_flows' 
    });
  }
}

/**
 * Sync cash flows pagination
 * @param {Array} cashFlows - Array of cash flows
 * @returns {Promise<void>}
 */
async function syncCashFlowsPagination(cashFlows) {
  const safeCashFlows = Array.isArray(cashFlows) ? cashFlows : [];

  if (typeof window.updateTableWithPagination === 'function') {
    try {
      cashFlowsPaginationInstance = await window.updateTableWithPagination({
        tableId: 'cashFlowsTable',
        tableType: 'cash_flows',
        data: safeCashFlows,
        render: async (pageData, context = {}) => {
          // Handle both signature formats:
          // 1. Old: ({ pageData, pagination: paginationInfo }) - direct from pagination
          // 2. New: (pageData, { pageInfo, ... }) - from updateTableWithPagination
          const actualPageData = Array.isArray(pageData) ? pageData : (pageData?.pageData || []);
          const paginationInfo = context?.pageInfo || pageData?.pagination || {};
          
          window.Logger?.debug('🔄 [syncCashFlowsPagination] Render callback called', {
            pageDataLength: actualPageData?.length || 0,
            paginationInfo: paginationInfo,
            currentPage: paginationInfo.currentPage,
            totalPages: paginationInfo.totalPages,
          });
          // Skip data update and summary when called from pagination render
          // to prevent infinite loops - pagination already handles data
          // IMPORTANT: Update window.filteredCashFlowsData so renderCashFlowsTable uses the correct data
          window.filteredCashFlowsData = actualPageData;
          window.Logger?.debug('🔄 [syncCashFlowsPagination] window.filteredCashFlowsData updated to', window.filteredCashFlowsData.length, 'items');
          await updateCashFlowsTable(actualPageData, { skipDataUpdate: true, skipSummary: true });
          window.Logger?.debug('✅ [syncCashFlowsPagination] updateCashFlowsTable completed');
          if (window.setPageTableData) {
            window.setPageTableData('cash_flows', actualPageData, {
              tableId: 'cashFlowsTable',
              pageInfo: paginationInfo,
            });
          }
        },
        onFilteredDataChange: ({ filteredData }) => {
          window.filteredCashFlowsData = Array.isArray(filteredData) ? filteredData : [];
          if (typeof updatePageSummaryStats === 'function') {
            updatePageSummaryStats();
          }
          // Update count element with total filtered records (not just current page)
          // Use generic updateTableCount function
          if (window.updateTableCount) {
            window.updateTableCount('cashFlowsCount', 'cash_flows', 'תזרימים', window.filteredCashFlowsData.length);
          } else {
            // Fallback
            const countElement = document.getElementById('cashFlowsCount');
            if (countElement) {
              // Use TableDataRegistry to get total filtered count
              if (window.getTableDataCounts) {
                const counts = window.getTableDataCounts('cash_flows');
                const totalCount = counts.filtered || counts.total || window.filteredCashFlowsData.length;
                countElement.textContent = `${totalCount} תזרימים`;
              } else {
                // Fallback to filtered data length
                countElement.textContent = `${window.filteredCashFlowsData.length} תזרימים`;
              }
            }
          }
        },
      });
      return;
    } catch (error) {
      window.Logger?.warn('syncCashFlowsPagination: falling back to direct render', { error, page: 'cash_flows' });
    }
  }

  if (window.setTableData) {
    window.setTableData('cash_flows', safeCashFlows, { tableId: CASH_FLOWS_TABLE_ID });
    window.setFilteredTableData?.('cash_flows', safeCashFlows, { tableId: CASH_FLOWS_TABLE_ID, skipPageReset: true });
  }

  await updateCashFlowsTable(safeCashFlows);
}

/**
 * Group cash flows into unified forex exchanges (one row per exchange_<uuid>)
 * @param {Array} rows - Array of cash flow rows
 * @returns {Array} Array of grouped exchange objects
 */
function groupUnifiedExchanges(rows) {
  const data = Array.isArray(rows) ? rows : [];
  const groups = new Map();
  const isExchangeExternal = (cf) => {
    // קיים group id מה-API? זה זיהוי תקף, גם אם לא מתחיל ב-exchange_
    if (cf?.exchange_group_id && typeof cf.exchange_group_id === 'string') {
      return true;
    }
    // אחרת, קבל מזהה מה-external_id בפורמט exchange_
    const id = cf?.external_id || '';
    return typeof id === 'string' && id.startsWith('exchange_');
  };
  data.forEach(cf => {
    if (!cf || !isExchangeExternal(cf)) return;
    const groupId = cf.exchange_group_id || cf.external_id;
    const bucket = groups.get(groupId) || { id: groupId, from: null, to: null, account_id: cf.trading_account_id };
    // classify
    const type = String(cf.type || '').toLowerCase();
    if (EXCHANGE_FROM_TYPES.has(type)) {
      if (!bucket.from || Math.abs(bucket.from.amount || 0) < Math.abs(cf.amount || 0)) {
        bucket.from = cf;
      }
    } else if (EXCHANGE_TO_TYPES.has(type)) {
      if (!bucket.to || Math.abs(bucket.to.amount || 0) < Math.abs(cf.amount || 0)) {
        bucket.to = cf;
      }
    } else {
      // fallback by exchange_direction if exists
      if (cf.exchange_direction === 'from' && !bucket.from) bucket.from = cf;
      if (cf.exchange_direction === 'to' && !bucket.to) bucket.to = cf;
    }
    if (!bucket.account_id && cf.trading_account_id) {
      bucket.account_id = cf.trading_account_id;
    }
    groups.set(groupId, bucket);
  });
  return Array.from(groups.values());
}

/**
 * Render unified forex exchanges table at page bottom
 * @param {Array} sourceRows - Array of cash flow rows
 * @returns {void}
 */
function renderUnifiedForexExchangesTable(sourceRows) {
  const tableBody = document.querySelector('#forexUnifiedTable tbody');
  if (!tableBody) return;
  const groups = groupUnifiedExchanges(sourceRows);
  if (!groups || groups.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center">אין המרות מטבע להצגה.</td></tr>`;
    return;
  }
  const fmtAmt = (amt, curIdOrSymbol) => {
    const symbol = typeof curIdOrSymbol === 'string' ? curIdOrSymbol : '';
    if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
      return window.FieldRendererService.renderAmount(amt || 0, symbol || '$', 2, true);
    }
    const n = Number(amt || 0);
    return `${(symbol || '$')}${n.toFixed(2)}`;
  };
  const getCurrencySymbol = (cf) => {
    if (!cf) return '';
    // Prefer symbol on record, else map from currency_id via global helper, else raw currency code
    if (cf.currency_symbol) return cf.currency_symbol;
    if (cf.currency) return cf.currency;
    if (cf.currency_id && typeof resolveCurrencyById === 'function') {
      const c = resolveCurrencyById(cf.currency_id);
      return c?.symbol || '';
    }
    return '';
  };
  const getAccountName = (id) => {
    return (typeof getAccountNameById === 'function' ? getAccountNameById(id) : null) || (id ? `חשבון מסחר ${id}` : '-');
  };
  const fmtDate = (d) => {
    if (!d) return '-';
    if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
      const dateEnvelope = window.dateUtils?.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(d) : d;
      return window.FieldRendererService.renderDate(dateEnvelope || d, false);
    }
    if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
      const dateEnvelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(d) : d;
      return window.dateUtils.formatDate(dateEnvelope || d, { includeTime: false });
    }
    try {
      const dateObj = d instanceof Date ? d : new Date(d);
      if (!Number.isNaN(dateObj.getTime())) {
        return window.formatDate ? window.formatDate(dateObj, false) : dateObj.toLocaleDateString('he-IL');
      }
    } catch (error) {
      window.Logger?.warn('⚠️ cash_flows fmtDate formatting failed', { error }, { page: 'cash_flows' });
    }
    return '-';
  };
  const buildActions = (groupId, fromId, toId) => {
    if (!window.createActionsMenu) return '';
    const items = [];
    if (fromId) items.push({ type: 'VIEW', onclick: `showCashFlowDetails(${fromId})`, title: 'פתח צד From' });
    if (toId) items.push({ type: 'VIEW', onclick: `showCashFlowDetails(${toId})`, title: 'פתח צד To' });
    return window.createActionsMenu(items) || '';
  };
  tableBody.innerHTML = '';
  groups.forEach(g => {
    const date = g.to?.date || g.from?.date || g.to?.updated_at || g.from?.updated_at || null;
    const fromAmt = g.from?.amount || 0;
    const fromSym = getCurrencySymbol(g.from);
    const toAmt = g.to?.amount || 0;
    const toSym = getCurrencySymbol(g.to);
    const rate = (Math.abs(fromAmt) > 0 && toAmt) ? (toAmt / Math.abs(fromAmt)) : null;
    const rateDisplay = rate ? (rate.toFixed(6)) : '—';
    const accountName = getAccountName(g.account_id);
    const idDisplay = g.id || '-';
    const actions = buildActions(g.id, g.from?.id, g.to?.id);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="table-cell-center">${fmtDate(date)}</td>
      <td>${accountName}</td>
      <td dir="ltr">${fmtAmt(fromAmt, fromSym)}</td>
      <td dir="ltr">${fmtAmt(toAmt, toSym)}</td>
      <td dir="ltr">${rateDisplay}</td>
      <td dir="ltr">${idDisplay}</td>
      <td class="text-center">${actions}</td>
    `;
    tableBody.appendChild(row);
  });
}

/**
 * Ensure exchange pairs adjacency
 * @param {Array} rows - Array of rows
 * @returns {Array} Ordered rows
 */
function ensureExchangePairsAdjacency(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return Array.isArray(rows) ? rows : [];
  }

  const lookup = new Map();
  rows.forEach(row => {
    if (row && typeof row === 'object' && row.id !== undefined) {
      lookup.set(row.id, row);
    }
  });

  const visited = new Set();
  const ordered = [];

  rows.forEach(row => {
    if (!row) {
      return;
    }
    const rowId = row.id;
    if (rowId !== undefined && visited.has(rowId)) {
      return;
    }

    const groupId = row.exchange_group_id;
    const counterpartId = row.linked_exchange_cash_flow_id;
    if (groupId && counterpartId) {
      const counterpart = lookup.get(counterpartId);
      const first = row.exchange_direction === 'to' && counterpart ? counterpart : row;
      const second = first === row ? counterpart : row;

      if (first && (first.id === undefined || !visited.has(first.id))) {
        ordered.push(first);
        if (first.id !== undefined) {
          visited.add(first.id);
        }
      }

      if (second && (second.id === undefined || !visited.has(second.id))) {
        ordered.push(second);
        if (second.id !== undefined) {
          visited.add(second.id);
        }
      }
    } else {
      ordered.push(row);
      if (rowId !== undefined) {
        visited.add(rowId);
      }
    }
  });

  return ordered;
}

/**
 * Setup exchange row interactions (hover, click handlers)
 * @returns {void}
 */
function setupExchangeRowInteractions() {
  const table = document.getElementById('cashFlowsTable');
  if (!table) return;

  const rows = table.querySelectorAll('tbody tr[data-exchange-group-id]');
  rows.forEach(row => {
    if (row.dataset.exchangeInteractionBound === 'true') {
      return;
    }
    const groupId = row.dataset.exchangeGroupId;
    if (!groupId) {
      return;
    }

    const highlight = () => highlightExchangeGroup(groupId);
    const clear = () => clearExchangeHighlight(groupId);

    row.addEventListener('mouseenter', highlight);
    row.addEventListener('mouseleave', clear);
    row.addEventListener('focus', highlight);
    row.addEventListener('blur', clear);
    row.dataset.exchangeInteractionBound = 'true';
  });
}

/**
 * Highlight exchange group
 * @param {string} groupId - Group ID
 * @returns {void}
 */
function highlightExchangeGroup(groupId) {
  if (!groupId) return;
  if (currentExchangeHighlightGroupId && currentExchangeHighlightGroupId !== groupId) {
    clearExchangeHighlight(currentExchangeHighlightGroupId);
  }
  const rows = document.querySelectorAll(`#cashFlowsTable tbody tr[data-exchange-group-id="${groupId}"]`);
  rows.forEach(row => row.classList.add('table-warning'));
  currentExchangeHighlightGroupId = groupId;
}

/**
 * Clear exchange highlight
 * @param {string} groupId - Group ID
 * @returns {void}
 */
function clearExchangeHighlight(groupId) {
  const targetGroup = groupId || currentExchangeHighlightGroupId;
  if (!targetGroup) return;
  const rows = document.querySelectorAll(`#cashFlowsTable tbody tr[data-exchange-group-id="${targetGroup}"]`);
  rows.forEach(row => row.classList.remove('table-warning'));
  if (!groupId || currentExchangeHighlightGroupId === targetGroup) {
    currentExchangeHighlightGroupId = null;
  }
}

/**
 * Set currency exchange summary
 * @param {Object} summary - Exchange summary object
 * @returns {void}
 */
function setCurrencyExchangeSummary(summary) {
  const container = document.getElementById('currencyExchangeNetAmount');
  if (!container) return;

  if (!summary || !window.FieldRendererService || typeof window.FieldRendererService.renderExchangePairCards !== 'function') {
    container.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted small';
        div.textContent = 'הצמד יוצג לאחר שמירה.';
        container.innerHTML.appendChild(div);
    return;
  }

  container.innerHTML = window.FieldRendererService.renderExchangePairCards(summary, {
    renderAction: (flow) => {
      if (!flow?.id) {
        return '';
      }
      if (typeof showEntityDetails === 'function') {
        return `<button class="btn btn-sm btn-outline-primary" data-onclick="showEntityDetails('cash_flow', ${flow.id}, { mode: 'view' })">פתח רשומה</button>`;
      }
      return '';
    }
  });
}

/**
 * Hydrate cash flow exchange display
 * @param {number|string} cashFlowId - Cash flow ID
 * @returns {void}
 */
function hydrateCashFlowExchangeDisplay(cashFlowId) {
  const container = document.getElementById('cashFlowExchangePairDisplay');
  if (!container) return;

  if (!window.FieldRendererService || typeof window.FieldRendererService.renderExchangePairCards !== 'function') {
    container.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted small';
        div.textContent = 'הצמד יוצג לאחר שמירה.';
        container.innerHTML.appendChild(div);
    return;
  }

  const numericId = Number(cashFlowId);
  if (!Number.isFinite(numericId)) {
    container.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted small';
        div.textContent = 'תזרים זה אינו חלק מהמרת מטבע.';
        container.innerHTML.appendChild(div);
    return;
  }

  const record = Array.isArray(window.cashFlowsData)
    ? window.cashFlowsData.find(flow => Number(flow.id) === numericId)
    : null;

  if (!record || !record.exchange_pair_summary) {
    container.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted small';
        div.textContent = 'תזרים זה אינו חלק מהמרת מטבע.';
        container.innerHTML.appendChild(div);
    return;
  }

  container.innerHTML = window.FieldRendererService.renderExchangePairCards(record.exchange_pair_summary, {
    currentId: record.id,
    renderAction: (flow) => {
      if (!flow?.id) {
        return '';
      }
      return `<button class="btn btn-sm btn-outline-primary" data-onclick="showCashFlowDetails(${flow.id})">פתח רשומה</button>`;
    }
  });
}

// פונקציות הועברו ל-translation-utils.js:
// getTypeDisplayName -> translateCashFlowType
// getSourceDisplayName -> translateCashFlowSource

/**
 * Format amount - משתמש ב-FieldRendererService המרכזי
 * @deprecated - השתמש ישירות ב-window.FieldRendererService.renderAmount()
 * @function formatAmount
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount HTML
 */
function formatAmount(amount) {
  try {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      return '<span class="text-muted">לא זמין</span>';
    }
    
    // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
    if (window.FieldRendererService?.renderAmount) {
      return window.FieldRendererService.renderAmount(numericAmount, '$', 2, false);
    }
    
    // Fallback ל-Translation Utilities
    if (window.formatCurrencyWithCommas && typeof window.formatCurrencyWithCommas === 'function') {
      return window.formatCurrencyWithCommas(numericAmount, 'USD');
    }
    
    // Fallback למקרה נדיר ביותר שהמערכת לא זמינה
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'USD',
    }).format(numericAmount);
  } catch (error) {
    window.Logger?.error('שגיאה בעיצוב סכום:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעיצוב סכום', error.message);
    }
    return amount?.toString() || '-';
  }
}

/**
 * Get cash flow type with color
 * @function getCashFlowTypeWithColor
 * @param {string} type - Cash flow type
 * @returns {string} HTML with color
 */
function getCashFlowTypeWithColor(type) {
  try {
    const typeTranslation = window.translateCashFlowType ? window.translateCashFlowType(type) : type;

    // שימוש במערכת הצבעים הדינמית - רק צבע טקסט ללא רקע
    if (window.getTableColors) {
      const colors = window.getTableColors();
      let color = colors.secondary; // ברירת מחדל
    
    switch (type) {
    case 'deposit':
    case 'dividend':
    case 'transfer_in':
    case 'interest':
    case 'syep_interest':
    case 'other_positive':
    case 'currency_exchange_to':
      color = colors.positive;
      break;
    case 'withdrawal':
    case 'transfer_out':
    case 'fee':
    case 'other_negative':
    case 'currency_exchange_from':
      color = colors.negative;
      break;
    default:
      color = colors.secondary;
    }
    
    return `<span class="numeric-value-positive" style="color: ${color}; font-weight: 600;">${typeTranslation}</span>`;
  }

  // fallback למערכת הצביעה הישנה
  let cssClass = '';
  switch (type) {
  case 'deposit':
  case 'dividend':
  case 'transfer_in':
  case 'interest':
  case 'syep_interest':
  case 'other_positive':
  case 'currency_exchange_to':
    cssClass = 'numeric-value-positive';
    break;
  case 'withdrawal':
  case 'transfer_out':
  case 'fee':
  case 'other_negative':
  case 'currency_exchange_from':
    cssClass = 'numeric-value-negative';
    break;
  default:
    cssClass = 'numeric-value-zero';
  }

  return `<span class="${cssClass} entity-badge-base"><strong>${typeTranslation}</strong></span>`;
  
  } catch (error) {
    window.Logger.error('שגיאה בקבלת סוג תזרים עם צבע:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בקבלת סוג תזרים עם צבע', error.message);
    }
    return type;
  }
}

/**
 * Get cash flow type text
 * @function getCashFlowTypeText
 * @param {string} type - Cash flow type
 * @returns {string} Type text
 */
function getCashFlowTypeText(type) {
  return window.translateCashFlowType ? window.translateCashFlowType(type) : type;
}

/**
 * Resolve currency symbol for cash flow rows using general currency display system
 * @function resolveCurrencySymbolForCashFlow
 * @param {Object} cashFlow - Cash flow record
 * @returns {string} Currency symbol (₪, $, € וכו')
 */
function resolveCurrencySymbolForCashFlow(cashFlow) {
  const fallbackSymbol = '$';
  if (!cashFlow || typeof cashFlow !== 'object') {
    return fallbackSymbol;
  }

  // Build minimal structure expected by getCurrencyDisplay (general system)
  const stubAccount = {
    currency_id: cashFlow.currency_id,
    currency: cashFlow.currency && typeof cashFlow.currency === 'object' ? cashFlow.currency : undefined
  };

  if (!stubAccount.currency && cashFlow.currency_symbol) {
    stubAccount.currency = { symbol: cashFlow.currency_symbol };
  }

  if (typeof window.getCurrencyDisplay === 'function') {
    try {
      const displaySymbol = window.getCurrencyDisplay(stubAccount);
      if (displaySymbol && displaySymbol !== '-' && typeof displaySymbol === 'string') {
        return displaySymbol;
      }
    } catch (error) {
      window.Logger && window.Logger.warn && window.Logger.warn('resolveCurrencySymbolForCashFlow failed via getCurrencyDisplay', { error, page: 'cash_flows' });
    }
  }

  const rawSymbol = cashFlow.currency_symbol || (cashFlow.currency && cashFlow.currency.symbol) || '';
  switch (rawSymbol) {
  case '$':
  case '₪':
  case '€':
  case '£':
  case '¥':
    return rawSymbol;
  case 'USD':
    return '$';
  case 'ILS':
    return '₪';
  case 'EUR':
    return '€';
  case 'GBP':
    return '£';
  case 'JPY':
    return '¥';
  default:
    return rawSymbol && rawSymbol.length === 1 ? rawSymbol : fallbackSymbol;
  }
}

/**
 * Format cash flow amount
 * @function formatCashFlowAmount
 * @param {number} amount - Amount to format
 * @param {string|null} type - Cash flow type (deposit/withdrawal/transfer/etc.)
 * @param {string} currencySymbol - Symbol to show
 * @returns {string} Formatted amount
 */
function formatCashFlowAmount(amount, type = null, currencySymbol = '$') {
  if (!amount && amount !== 0) {return '-';}

  const numAmount = Number(amount);
  if (Number.isNaN(numAmount)) {return '-';}

  const typeLower = type ? String(type).toLowerCase() : '';
  const positiveTypes = new Set(['deposit', 'dividend', 'transfer_in', 'other_positive', 'currency_exchange_to']);
  const negativeTypes = new Set(['withdrawal', 'fee', 'transfer_out', 'other_negative', 'currency_exchange_from']);

  let effectiveAmount = numAmount;
  if (typeLower) {
    if (positiveTypes.has(typeLower)) {
      effectiveAmount = Math.abs(numAmount);
    } else if (negativeTypes.has(typeLower)) {
      effectiveAmount = -Math.abs(numAmount);
    }
  }

  // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
  const baseAmount = window.FieldRendererService?.renderAmount
    ? window.FieldRendererService.renderAmount(effectiveAmount, currencySymbol || '$', 2, true)
    : '<span class="numeric-value-zero">-</span>';

  if (window.getTableColors && typeof window.getTableColors === 'function') {
    const colors = window.getTableColors();
    const color = effectiveAmount >= 0 ? colors.positive : colors.negative;
    return baseAmount.replace('<span', `<span style="color: ${color};"`);
  }

  return baseAmount;
}

/**
 * Format USD rate
 * @function formatUsdRate
 * @param {number} rate - Rate to format
 * @returns {string} Formatted rate
 */
function formatUsdRate(rate) {
  if (!rate) {return '1.00';}
  const numRate = parseFloat(rate);
  return numRate.toFixed(2);
}

// ========================================
// פונקציות עדכון טבלה
// ========================================

/**
 * Show cash flow details
 * @function showCashFlowDetails
 * @param {string} cashFlowId - Cash flow ID
 * @returns {void}
 */
function showCashFlowDetails(cashFlowId) {
  // שימוש במערכת הפרטים הגלובלית
  if (window.showEntityDetails) {
    window.showEntityDetails('cash_flow', cashFlowId, { mode: 'view' });
  } else {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'מערכת פרטי ישויות לא זמינה');
    }
  }
}

/**
 * הצגת פריטים מקושרים לתזרים מזומנים
 * @param {string} entityType - סוג הישות
 * @param {number} entityId - מזהה הישות
 */
// showLinkedItemsModal - using global function from linked-items.js

/**
 * Update cash flows table
 * @function updateCashFlowsTable
 * @param {Array} cashFlows - Cash flows array
 * @returns {void}
 */
async function updateCashFlowsTable(cashFlows, options = {}) {
  const { skipDataUpdate = false, skipSummary = false } = options;
  const prepared = ensureExchangePairsAdjacency(Array.isArray(cashFlows) ? [...cashFlows] : []);

  // עדכון הנתונים הגלובליים רק אם לא מדלגים
  if (!skipDataUpdate) {
    window.cashFlowsData = prepared;
    window.filteredCashFlowsData = prepared;
    cashFlowsData = prepared;
  } else {
    // רק עדכן את window.filteredCashFlowsData אם זה נקרא מה-render callback
    window.filteredCashFlowsData = prepared;
  }

  // רינדור הטבלה
  await renderCashFlowsTable();

  // עדכון סטטיסטיקות רק אם לא מדלגים
  if (!skipSummary) {
    updatePageSummaryStats();
  }
}

// הגדרת הפונקציות כגלובליות
window.showCashFlowDetails = showCashFlowDetails;
// window.showLinkedItemsModal = showLinkedItemsModal; // הוסר - הפונקציה לא מוגדרת כאן
window.updateCashFlowsTable = updateCashFlowsTable;

// פונקציית פילטור מקומי - הוסרה כי לא בשימוש

// ========================================
// אתחול הדף
// ========================================

// הפונקציה loadCashFlows הראשונה נשארת בשורה 241
// הפונקציה הכפולה נמחקה

/**
 * Start auto refresh
 * @function startAutoRefresh
 * @returns {void}
 */
function startAutoRefresh() {
  window.Logger.info('Starting automatic cash flows update', { page: 'cash_flows' });
  
  // עדכון נתונים כל 30 שניות - הושבת זמנית למניעת לופים
  // setInterval(async () => {
  //   try {
  //     window.Logger.info('Automatic cash flows data update', { page: 'cash_flows' });
  //     await loadCashFlows();
  //     
  //     // עדכון סטטיסטיקות
  //     if (typeof updatePageSummaryStats === 'function') {
  //       updatePageSummaryStats();
  //     }
  //     
  //     window.Logger.info('Automatic update completed successfully', { page: 'cash_flows' });
  //   } catch (error) {
  //     window.Logger.error('Error in automatic update', error, { page: 'cash_flows' });
  //   }
  // }, 30000); // 30 שניות
  
  window.Logger.info('Automatic update activated - refresh every 30 seconds', { page: 'cash_flows' });
}

/**
 * טעינת העדפות משתמש
 */
// loadUserPreferences - using global function from preferences-core.js

/**
 * החלת מערכת צבעים דינמית
 */
async function applyDynamicColors() {
  try {
    window.Logger.info('Applying dynamic color system', { page: 'cash_flows' });
    
    // טעינת צבעי ישויות מהמערכת הגלובלית
    if (typeof window.loadEntityColors === 'function') {
      const entityColors = await window.loadEntityColors();
      if (entityColors) {
        window.Logger.debug('Entity colors loaded', { entityColors, page: 'cash_flows' });
        
        // החלת צבעי תזרימי מזומנים
        if (entityColors.cash_flow) {
          document.documentElement.style.setProperty('--cash-flow-color', entityColors.cash_flow);
          document.documentElement.style.setProperty('--cash-flow-bg-color', entityColors.cash_flow + '20');
        }
        
        // החלת צבעי חשבונות מסחר - רק trading_account!
        if (entityColors.trading_account) {
          document.documentElement.style.setProperty('--trading-account-color', entityColors.trading_account);
          document.documentElement.style.setProperty('--trading-account-bg-color', entityColors.trading_account + '20');
        } else if (entityColors.account) {
          // DEPRECATED - should use trading_account!
          const error = new Error(`❌ DEPRECATED: entityColors.account is no longer supported. Use entityColors.trading_account instead!`);
          window.Logger.error('DEPRECATED: entityColors.account used', { page: 'cash_flows', entityColors });
          throw error;
        }
        
        // החלת צבעי מטבעות
        if (entityColors.currency) {
          document.documentElement.style.setProperty('--currency-color', entityColors.currency);
          document.documentElement.style.setProperty('--currency-bg-color', entityColors.currency + '20');
        }
      }
    }
    
    // טעינת צבעי סטטוס
    if (typeof window.loadStatusColors === 'function') {
      const statusColors = await window.loadStatusColors();
      if (statusColors) {
        window.Logger.debug('Status colors loaded', { statusColors, page: 'cash_flows' });
        
        // החלת צבעי סטטוס לתזרימי מזומנים
        if (statusColors.income) {
          document.documentElement.style.setProperty('--income-color', statusColors.income);
          document.documentElement.style.setProperty('--income-bg-color', statusColors.income + '20');
        }
        
        if (statusColors.expense) {
          document.documentElement.style.setProperty('--expense-color', statusColors.expense);
          document.documentElement.style.setProperty('--expense-bg-color', statusColors.expense + '20');
        }
        
        if (statusColors.transfer) {
          document.documentElement.style.setProperty('--transfer-color', statusColors.transfer);
          document.documentElement.style.setProperty('--transfer-bg-color', statusColors.transfer + '20');
        }
      }
    }
    
    // החלת ערכת צבעים כללית
    if (typeof window.applyColorScheme === 'function') {
      await window.applyColorScheme();
    }
    
    window.Logger.info('Dynamic color system applied successfully', { page: 'cash_flows' });
  } catch (error) {
    window.Logger.error('Error applying dynamic color system', error, { page: 'cash_flows' });
  }
}

/**
 * Apply user preferences
 * @function applyUserPreferences
 * @param {Object} preferences - User preferences
 * @returns {void}
 */
function applyUserPreferences(preferences) {
  try {
    if (!preferences) return;
    
    window.Logger.info('Applying user preferences to page', { page: 'cash_flows' });
    
    // החלת העדפת גודל עמוד (רק תצוגה, לא שמירה)
    const paginationSize = preferences.pagination_size_cash_flows || 25;
    // עדכון תצוגת הטבלה לפי העדפת המשתמש
    if (window.cashFlowsTable && typeof window.cashFlowsTable.pageSize === 'function') {
      window.cashFlowsTable.pageSize(paginationSize);
    }
    
    // החלת העדפת מטבע ברירת מחדל
    const defaultCurrency = preferences.default_currency || 'USD';
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
      window.DataCollectionService.setValue('currency', defaultCurrency, 'text');
    } else {
      // Fallback אם DataCollectionService לא זמין
      const currencyElement = document.getElementById('currency');
      if (currencyElement) {
        currencyElement.value = defaultCurrency;
      }
    }
    
    // החלת העדפת תצוגת המרת מטבע
    const showConversion = preferences.show_currency_conversion !== false;
    const conversionElements = document.querySelectorAll('.currency-conversion');
    conversionElements.forEach(el => {
      el.style.display = showConversion ? 'block' : 'none';
    });
    
    // החלת העדפת פורמט תאריך
    const dateFormat = preferences.date_format || 'DD/MM/YYYY';
    window.cashFlowsDateFormat = dateFormat;
    
    // החלת העדפת פורמט מספרים
    const numberFormat = preferences.number_format || 'en-US';
    window.cashFlowsNumberFormat = numberFormat;
    
    // החלת העדפת מצב תצוגה
    const displayMode = preferences.cash_flows_display_mode || 'table';
    if (displayMode === 'cards') {
      // הוספת קלאס לתצוגת כרטיסים
      document.body.classList.add('cash-flows-cards-mode');
    }
    
    window.Logger.info('User preferences applied successfully', { page: 'cash_flows' });
  } catch (error) {
    window.Logger.error('Error applying user preferences', error, { page: 'cash_flows' });
  }
}

/**
 * Initialize cash flows page
 * @returns {Promise<void>}
 */
async function initializeCashFlowsPage() {
  window.Logger?.debug('🚀 [initializeCashFlowsPage] Starting initialization...');
  window.Logger.info('Initializing cash flows page', { page: 'cash_flows' });

  try {
    // טעינת העדפות משתמש
    // Ensure preferences are initialized before loading
    if (window.initializePreferencesWithLazyLoading && typeof window.initializePreferencesWithLazyLoading === 'function') {
      await window.initializePreferencesWithLazyLoading();
    }
    const preferences = await window.getAllPreferences();
    
    // החלת העדפות על העמוד
    if (preferences && typeof applyUserPreferences === 'function') {
    applyUserPreferences(preferences);
    }
    
    // החלת מערכת צבעים דינמית
    await applyDynamicColors();

    // טעינת מטבעות מהשרת
    await window.loadCurrenciesFromServer();

    // טעינת נתונים
    await loadCashFlowsData();

    // שחזור מצב הסגירה
    if (typeof window.restoreSectionStates === 'function') {
      window.restoreSectionStates();
    }

    // שחזור מצב סידור
    if (window.pageUtils?.restoreSortState) {
      await window.pageUtils.restoreSortState('cash_flows');
    } else {
      await window.restoreSortState?.('cash_flows');
    }

    // הגדרת event listeners לשדות מקור
    setupSourceFieldListeners();

    // הגדרת event listener לדרופדאון סוג תזרים
    window.Logger?.debug('🔧 [initializeCashFlowsPage] Setting up cash flow type filter dropdown...');
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      window.Logger?.debug('⏰ [initializeCashFlowsPage] setTimeout callback - calling setupCashFlowTypeFilterDropdown');
      setupCashFlowTypeFilterDropdown();
    }, 100);

    // אתחול מערכת וולידציה
    if (window.initializeValidation) {
      window.initializeValidation('addCashFlowForm', addCashFlowValidationRules);
      window.initializeValidation('editCashFlowForm', editCashFlowValidationRules);
    }
    
    // הפעלת עדכון אוטומטי
    startAutoRefresh();
    
    window.Logger.info('Cash flows page initialized successfully', { page: 'cash_flows' });
  } catch (error) {
    window.Logger.error('Error initializing cash flows page', error, { page: 'cash_flows' });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה באתחול העמוד', error.message);
    }
  }
}

// הפעלת אתחול כשהדף נטען - סטנדרטי כמו כל העמודים
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    window.Logger?.debug('🚀 [cash_flows.js] DOMContentLoaded - calling initializeCashFlowsPage');
    initializeCashFlowsPage();
  });
} else {
  // DOM already loaded
  window.Logger?.debug('🚀 [cash_flows.js] DOM already loaded - calling initializeCashFlowsPage immediately');
  initializeCashFlowsPage();
}

// ===== CRUD FUNCTIONS =====

// REMOVED: saveCashFlow function - using ModalManagerV2 automatic CRUD handling
// The ModalManagerV2 system automatically handles save operations based on modal configuration

/**
 * עדכון תזרים מזומנים
 * @function updateCashFlow
 * @param {string} id - Cash flow ID
 * @returns {Promise<void>}
 */
async function updateCashFlow(id) {
    window.Logger.debug('updateCashFlow called', { id, page: 'cash_flows' });
    
    try {
        // Find cash flow data
        const cashFlow = cashFlowsData.find(cf => cf.id === id);
        if (!cashFlow) {
            throw new Error('Cash flow not found');
        }
        
        // Show edit modal with data
        if (window.ModalManagerV2) {
            window.ModalManagerV2.showEditModal('cashFlowModal', cashFlow);
        } else {
            throw new Error('ModalManagerV2 not available');
        }
        
    } catch (error) {
        window.Logger.error('Error updating cash flow', { error: error.message, page: 'cash_flows' });
        
        if (window.showNotification) {
            window.showNotification('שגיאה בעדכון תזרים המזומנים', 'error', 'system');
        }
    }
}

// REMOVED: window exports for removed functions
// Use window.toggleSection('main') instead of toggleCashFlowsSection
// Use window.restoreSectionStates() instead of restoreCashFlowsSectionState
// ===== MODAL FUNCTIONS - NEW SYSTEM =====

/**
 * Save cash flow - required by ModalManagerV2
 * @function saveCashFlow
 * @async
 * @returns {Promise<void>}
 */
async function saveCashFlow() {
    window.Logger.debug('saveCashFlow called', { page: 'cash_flows' });
    
    try {
        const modal = document.getElementById('cashFlowModal');
        const activeTabButton = modal ? modal.querySelector('#cashFlowModalTabs .nav-link.active') : null;
        const activeTabId = activeTabButton ? activeTabButton.getAttribute('data-tab-id') : null;
        if (activeTabId === 'exchange') {
            if (typeof window.saveCurrencyExchange === 'function') {
                return await window.saveCurrencyExchange();
            }
            window.Logger.warn('saveCashFlow invoked from exchange tab but saveCurrencyExchange missing', { page: 'cash_flows' });
            return;
        }

        // Count records BEFORE save
        const initialTableCount = cashFlowsData ? cashFlowsData.length : 0;
        window.Logger.debug('Initial state: Table has records', { page: 'cash_flows', count: initialTableCount });
        
        // CRUDResponseHandler will handle cache clearing automatically
        // No need to call clearCacheBeforeCRUD here
        
        // Collect form data using DataCollectionService
        const form = document.getElementById('cashFlowModalForm');
        if (!form) {
            throw new Error('Cash flow form not found');
        }
        window.Logger.debug('saveCashFlow - Form found', { page: 'cash_flows' });
        
        const cashFlowData = DataCollectionService.collectFormData({
            amount: { id: 'cashFlowAmount', type: 'float' },
            type: { id: 'cashFlowType', type: 'text' },
            currency_id: { id: 'cashFlowCurrency', type: 'int' },
            trading_account_id: { id: 'cashFlowAccount', type: 'int' },  // Backend expects trading_account_id
            date: { id: 'cashFlowDate', type: 'dateOnly' },  // Backend expects Date only, not datetime
            description: { id: 'cashFlowDescription', type: 'rich-text', default: null },
            source: { id: 'cashFlowSource', type: 'text' },
            external_id: { id: 'cashFlowExternalId', type: 'text', default: '0' },
            trade_id: { id: 'trade_id', type: 'int', default: null },  // Optional link to trade
            tag_ids: { id: 'cashFlowTags', type: 'tags', default: [] }
        });
        
        // Prepare data to send (trade_id is optional, can be null)
        const { tag_ids: tagIdsRaw, ...dataToSend } = cashFlowData;
        const tagIds = Array.isArray(tagIdsRaw) ? tagIdsRaw : [];
        
        // ולידציה מפורטת
        let hasErrors = false;
        if (!cashFlowData.amount || cashFlowData.amount <= 0) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowAmount', 'סכום חייב להיות גדול מ-0');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.type) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowType', 'סוג תזרים הוא שדה חובה');
            }
            hasErrors = true;
        }

        if (cashFlowData.description && cashFlowData.description.length > 5000) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowDescription', 'תיאור התזרים חורג מהאורך המותר (5,000 תווים)');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.currency_id) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowCurrency', 'מטבע הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.trading_account_id) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowAccount', 'חשבון מסחר הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.date) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowDate', 'תאריך הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.source) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowSource', 'מקור הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (hasErrors) {
            window.Logger.warn('saveCashFlow - Validation errors, returning', { page: 'cash_flows' });
            return;
        }

        // Business Logic API validation
        if (window.CashFlowsData?.validateCashFlow) {
            try {
                const validationResult = await window.CashFlowsData.validateCashFlow({
                    amount: cashFlowData.amount,
                    type: cashFlowData.type,
                    currency_id: cashFlowData.currency_id,
                    trading_account_id: cashFlowData.trading_account_id,
                    date: cashFlowData.date,
                    description: cashFlowData.description
                });

                if (!validationResult.is_valid) {
                    const errorMessage = validationResult.errors?.join(', ') || 'ולידציה נכשלה';
                    window.showErrorNotification?.('שגיאת ולידציה', errorMessage);
                    return;
                }
            } catch (validationError) {
                window.Logger?.warn('⚠️ Cash flow validation error (continuing with save)', {
                    error: validationError,
                    page: 'cash_flows'
                });
                // Continue with save even if validation fails (fallback)
            }
        }
        
        window.Logger.debug('saveCashFlow - Validation passed', { page: 'cash_flows' });
        
        // Determine if this is add or edit
        const isEdit = form.dataset.mode === 'edit';
        const cashFlowId = form.dataset.cashFlowId;
        window.Logger.debug('saveCashFlow resolved mode', { page: 'cash_flows', isEdit, cashFlowId });
        
        let response;
        if (isEdit && typeof window.CashFlowsData?.updateCashFlow === 'function') {
            response = await window.CashFlowsData.updateCashFlow(cashFlowId, dataToSend);
        } else if (!isEdit && typeof window.CashFlowsData?.createCashFlow === 'function') {
            response = await window.CashFlowsData.createCashFlow(dataToSend);
        } else {
            const url = isEdit ? `/api/cash-flows/${cashFlowId}` : '/api/cash-flows';
            response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
        }
        
        let responseToHandle = response;
        if (!response.ok) {
            const responseClone = response.clone();
            const errorText = await responseClone.text();
            window.Logger.error('saveCashFlow error response', {
                page: 'cash_flows',
                status: response.status,
                body: errorText,
            });
        }
        
        // CRUDResponseHandler handles ALL response processing including errors
        // No need to pre-check or call response.json() here
        let crudResult = null;
        if (isEdit) {
            window.Logger.debug('saveCashFlow - Calling handleUpdateResponse', { page: 'cash_flows', cashFlowId });
            crudResult = await CRUDResponseHandler.handleUpdateResponse(responseToHandle, {
                modalId: 'cashFlowModal',
                successMessage: 'תזרים מזומן עודכן בהצלחה',
                entityName: 'תזרים מזומן',
                reloadFn: () => window.loadCashFlowsData({ force: true }),
                requiresHardReload: false  // Prevent reload confirmation dialog
            });
        } else {
            window.Logger.debug('saveCashFlow - Calling handleSaveResponse', { page: 'cash_flows' });
            crudResult = await CRUDResponseHandler.handleSaveResponse(responseToHandle, {
                modalId: 'cashFlowModal',
                successMessage: 'תזרים מזומן נוסף בהצלחה',
                entityName: 'תזרים מזומן',
                reloadFn: () => window.loadCashFlowsData({ force: true }),
                requiresHardReload: false  // Prevent reload confirmation dialog
            });
        }
        
        const resolvedCashFlowId = isEdit
            ? Number(cashFlowId)
            : Number(crudResult?.data?.id || crudResult?.id);
        if (Number.isFinite(resolvedCashFlowId) && window.TagService) {
            try {
                await window.TagService.replaceEntityTags('cash_flow', resolvedCashFlowId, tagIds);
            } catch (tagError) {
                window.Logger?.warn('⚠️ Failed to update cash flow tags', {
                    error: tagError,
                    cashFlowId: resolvedCashFlowId,
                    page: 'cash_flows'
                });
                const errorMessage = window.TagService?.formatTagErrorMessage
                    ? window.TagService.formatTagErrorMessage('התזרים נשמר אך התגיות לא עודכנו', tagError)
                    : 'התזרים נשמר אך התגיות לא עודכנו';
                window.showErrorNotification?.('שמירת תגיות', errorMessage);
            }
        }
        
        window.Logger.debug('saveCashFlow - CRUDResponseHandler completed', { page: 'cash_flows' });
        
    } catch (error) {
        window.Logger.error('saveCashFlow - Error caught', { page: 'cash_flows', error: error?.message || error });
        CRUDResponseHandler.handleError(error, 'שמירת תזרים מזומן');
    }
}

// ===== Currency Exchange Functions =====

/**
 * Save currency exchange - creates atomic exchange operation
 * @function saveCurrencyExchange
 * @async
 * @returns {Promise<void>}
 */
async function saveCurrencyExchange() {
    window.Logger.debug('saveCurrencyExchange called', { page: 'cash_flows' });
    
    try {
        const form = document.getElementById('cashFlowModalForm');
        if (!form) {
            throw new Error('Cash flow form not found');
        }
        
        // Collect exchange form data
        const exchangeData = DataCollectionService.collectFormData({
            trading_account_id: { id: 'currencyExchangeAccount', type: 'int' },
            from_currency_id: { id: 'currencyExchangeFromCurrency', type: 'int' },
            to_currency_id: { id: 'currencyExchangeToCurrency', type: 'int' },
            from_amount: { id: 'currencyExchangeFromAmount', type: 'float' },
            exchange_rate: { id: 'currencyExchangeRate', type: 'float' },
            fee_amount: { id: 'currencyExchangeFeeAmount', type: 'float', default: 0 },
            date: { id: 'currencyExchangeDate', type: 'dateOnly' },
            description: { id: 'currencyExchangeDescription', type: 'rich-text', default: '' },
            source: { id: 'currencyExchangeSource', type: 'text', default: 'manual' },
            external_id: { id: 'currencyExchangeExternalId', type: 'text', default: '0' }
        });

        manageExternalIdField(exchangeData.source, 'exchange');
        const exchangeExternalIdField = document.getElementById('currencyExchangeExternalId');
        if (exchangeExternalIdField) {
            exchangeData.external_id = exchangeExternalIdField.value || '0';
        } else {
            exchangeData.external_id = exchangeData.external_id || '0';
        }

        if (typeof window.clearValidation === 'function') {
            window.clearValidation('cashFlowModalForm');
        }

        let validationResult = { isValid: true, errorMessages: [] };
        if (typeof window.validateEntityForm === 'function') {
            validationResult = window.validateEntityForm('cashFlowModalForm', [
                { id: 'currencyExchangeAccount', name: 'חשבון מסחר', rules: { required: true } },
                { id: 'currencyExchangeFromCurrency', name: 'מטבע מקור', rules: { required: true } },
                { id: 'currencyExchangeToCurrency', name: 'מטבע יעד', rules: { required: true } },
                { id: 'currencyExchangeFromAmount', name: 'סכום להמרה', rules: { required: true, min: 0.01 } },
                { id: 'currencyExchangeRate', name: 'שער המרה', rules: { required: true, min: 0.000001 } },
                { id: 'currencyExchangeFeeAmount', name: 'עמלה', rules: { required: false, min: 0 } },
                { id: 'currencyExchangeDate', name: 'תאריך', rules: { required: true } },
                { id: 'currencyExchangeSource', name: 'מקור', rules: { required: true } }
            ]);
        }

        if (!validationResult.isValid) {
            const firstError = validationResult.errorMessages?.[0] || 'נא להשלים את כל השדות הנדרשים';
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', firstError);
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאת ולידציה', firstError, 'error');
            }
            return;
        }

        // Cross-field validation: different currencies
        if (exchangeData.from_currency_id === exchangeData.to_currency_id) {
            if (typeof window.showFieldError === 'function') {
                window.showFieldError('currencyExchangeToCurrency', 'מטבע יעד חייב להיות שונה ממטבע המקור');
            }
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', 'מטבע יעד חייב להיות שונה ממטבע המקור');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאת ולידציה', 'מטבע יעד חייב להיות שונה ממטבע המקור', 'error');
            }
            return;
        }

        // Ensure calculated to amount is positive
        const toAmountFieldId = 'currencyExchangeToAmount';
        let calculatedToAmount = NaN;
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
            const currentValue = window.DataCollectionService.getValue(toAmountFieldId, 'number', NaN);
            calculatedToAmount = currentValue;
        } else {
            // Fallback if DataCollectionService is not available
            const toAmountField = document.getElementById(toAmountFieldId);
            calculatedToAmount = toAmountField ? parseFloat(toAmountField.value) : NaN;
        }
        
        if (isNaN(calculatedToAmount) || calculatedToAmount <= 0) {
            calculatedToAmount = (exchangeData.from_amount || 0) * (exchangeData.exchange_rate || 0);
            const formattedValue = calculatedToAmount ? calculatedToAmount.toFixed(6) : '';
            
            if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                window.DataCollectionService.setValue(toAmountFieldId, formattedValue, 'number');
            } else {
                // Fallback if DataCollectionService is not available
                const toAmountField = document.getElementById(toAmountFieldId);
                if (toAmountField) {
                    toAmountField.value = formattedValue;
                }
            }
        }
        if (!calculatedToAmount || calculatedToAmount <= 0) {
            if (typeof window.showFieldError === 'function') {
                window.showFieldError('currencyExchangeToAmount', 'סכום מומר חייב להיות גדול מ-0');
            }
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', 'לא ניתן לחשב סכום מומר תקין');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאת ולידציה', 'לא ניתן לחשב סכום מומר תקין', 'error');
            }
            return;
        }

        exchangeData.to_amount = calculatedToAmount;
        exchangeData.fee_amount = exchangeData.fee_amount || 0;

        // Normalize external ID for manual source
        if (exchangeData.external_id === null || exchangeData.external_id === undefined || exchangeData.external_id === '') {
            exchangeData.external_id = '0';
        }
        if (exchangeData.source === 'manual') {
            exchangeData.external_id = '0';
        }

        // Additional description length check
        if (exchangeData.description && exchangeData.description.length > 5000) {
            if (typeof window.showFieldError === 'function') {
                window.showFieldError('currencyExchangeDescription', 'תיאור ההמרה חורג מהאורך המותר (5,000 תווים)');
            }
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', 'תיאור ההמרה חורג מהאורך המותר (5,000 תווים)');
            }
            return;
        }
        
        // Align fee currency with trading account base currency
        let accountCurrencyId = null;
        if (exchangeData.trading_account_id) {
            try {
                if (typeof window.TradingAccountsData?.fetchTradingAccount === 'function') {
                    const accountPayload = await window.TradingAccountsData.fetchTradingAccount(exchangeData.trading_account_id);
                    const accountData = accountPayload?.data || accountPayload;
                    accountCurrencyId = accountData?.currency_id || null;
                } else {
                    const accountResponse = await fetch(`/api/trading-accounts/${exchangeData.trading_account_id}`);
                    if (accountResponse.ok) {
                        const accountData = await accountResponse.json();
                        const payload = accountData?.data || accountData;
                        accountCurrencyId = payload?.currency_id || null;
                    }
                }
            } catch (error) {
                window.Logger.error('saveCurrencyExchange - Failed to load account currency', error, {
                    page: 'cash_flows',
                    tradingAccountId: exchangeData.trading_account_id,
                });
            }
        }

        if (exchangeData.trading_account_id && !accountCurrencyId) {
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', 'לא ניתן לטעון את מטבע הבסיס של חשבון המסחר');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאת ולידציה', 'לא ניתן לטעון את מטבע הבסיס של חשבון המסחר', 'error');
            }
            return;
        }

        exchangeData.fee_currency_id = accountCurrencyId;

		// Normalize date to backend expected format (YYYY-MM-DD) - avoid sending Date/datetime objects
		if (exchangeData.date) {
			try {
				// Handle cases where a Date object or complex object sneaks in
				if (typeof exchangeData.date === 'object') {
					const maybeValue = exchangeData.date.value || exchangeData.date.display || exchangeData.date.iso || exchangeData.date.toString?.();
					exchangeData.date = String(maybeValue || '').split('T')[0];
				} else {
					exchangeData.date = String(exchangeData.date).split('T')[0];
				}
				// Final guard: enforce YYYY-MM-DD strictly
				const ymd = /^\d{4}-\d{2}-\d{2}$/;
				if (!ymd.test(exchangeData.date)) {
					const d = new Date(exchangeData.date);
					if (!isNaN(d.getTime())) {
						const y = d.getFullYear();
						const m = String(d.getMonth() + 1).padStart(2, '0');
						const day = String(d.getDate()).padStart(2, '0');
						exchangeData.date = `${y}-${m}-${day}`;
					} else {
						exchangeData.date = null;
					}
				}
			} catch (e) {
				exchangeData.date = null;
			}
		}

		// Debug trace for payload (uses Logger, not console)
		try {
			window.Logger?.debug?.('saveCurrencyExchange - payload preview', {
				page: 'cash_flows',
				payloadKeys: Object.keys(exchangeData || {}),
				dateType: typeof exchangeData.date,
				dateValue: exchangeData.date
			});
		} catch (_) {}

        // Check if this is edit mode
        const isEdit = form.dataset.mode === 'edit';
        const exchangeId = form.dataset.exchangeId;
        
        let response;
        if (isEdit && typeof window.CashFlowsData?.updateCurrencyExchange === 'function') {
            response = await window.CashFlowsData.updateCurrencyExchange(exchangeId, exchangeData);
        } else if (!isEdit && typeof window.CashFlowsData?.createCurrencyExchange === 'function') {
            response = await window.CashFlowsData.createCurrencyExchange(exchangeData);
        } else {
            const url = isEdit ? `/api/cash-flows/exchange/${exchangeId}` : '/api/cash-flows/exchange';
            response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exchangeData)
            });
        }
        
        let responseToHandle = response;
        if (!response.ok) {
            const responseClone = response.clone();
            const errorText = await responseClone.text();
            window.Logger.error('saveCurrencyExchange error response', {
                page: 'cash_flows',
                status: response.status,
                body: errorText,
            });
        }
        
        if (isEdit) {
            await CRUDResponseHandler.handleUpdateResponse(responseToHandle, {
                modalId: 'cashFlowModal',
                successMessage: 'המרת מטבע עודכנה בהצלחה',
                entityName: 'המרת מטבע',
                reloadFn: () => window.loadCashFlowsData({ force: true }),
                requiresHardReload: false
            });
        } else {
            await CRUDResponseHandler.handleSaveResponse(responseToHandle, {
                modalId: 'cashFlowModal',
                successMessage: 'המרת מטבע נוצרה בהצלחה',
                entityName: 'המרת מטבע',
                reloadFn: () => window.loadCashFlowsData({ force: true }),
                requiresHardReload: false
            });
        }
        
    } catch (error) {
        window.Logger.error('saveCurrencyExchange - Error caught', { page: 'cash_flows', error: error?.message || error });
        CRUDResponseHandler.handleError(error, 'שמירת המרת מטבע');
    }
}

/**
 * Load currency exchange for editing
 * @function loadCurrencyExchange
 * @async
 * @param {string} exchangeId - Exchange UUID
 * @returns {Promise<void>}
 */
async function loadCurrencyExchange(exchangeId) {
    try {
        window.Logger.debug('loadCurrencyExchange - Loading exchange', { page: 'cash_flows', exchangeId });
        
        let payload;
        if (typeof window.CashFlowsData?.fetchCurrencyExchange === 'function') {
            payload = await window.CashFlowsData.fetchCurrencyExchange(exchangeId);
        } else {
            const response = await fetch(`/api/cash-flows/exchange/${exchangeId}`);
            if (!response.ok) {
                throw new Error('Failed to load currency exchange');
            }
            payload = await response.json();
        }
        
        const exchangeData = payload?.data || payload;
        if (!exchangeData?.from_flow || !exchangeData?.to_flow) {
            throw new Error('Invalid response from server');
        }
        const fromFlow = exchangeData.from_flow;
        const toFlow = exchangeData.to_flow;
        const feeAmount = exchangeData.fee_amount ?? (fromFlow ? Math.abs(fromFlow.fee_amount || 0) : 0);
        
        // Populate form fields using DataCollectionService
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setFormData) {
            // Field map for currency exchange form
            const currencyExchangeFieldMap = {
                trading_account_id: { id: 'currencyExchangeAccount', type: 'int' },
                from_currency_id: { id: 'currencyExchangeFromCurrency', type: 'int' },
                to_currency_id: { id: 'currencyExchangeToCurrency', type: 'int' },
                from_amount: { id: 'currencyExchangeFromAmount', type: 'number' },
                exchange_rate: { id: 'currencyExchangeRate', type: 'number' },
                fee_amount: { id: 'currencyExchangeFeeAmount', type: 'number' },
                source: { id: 'currencyExchangeSource', type: 'text' },
                external_id: { id: 'currencyExchangeExternalId', type: 'text' },
                date: { id: 'currencyExchangeDate', type: 'dateOnly' }
            };
            
            // Prepare values for form population
            const exchangeValues = {
                trading_account_id: fromFlow.trading_account_id,
                from_currency_id: fromFlow.currency_id,
                to_currency_id: toFlow.currency_id,
                from_amount: Math.abs(fromFlow.amount),
                exchange_rate: exchangeData.exchange_rate,
                fee_amount: feeAmount,
                source: fromFlow.source || 'manual',
                external_id: fromFlow.external_id || '0',
                date: fromFlow.date
            };
            
            // Set form data using DataCollectionService
            window.DataCollectionService.setFormData(currencyExchangeFieldMap, exchangeValues);
            
            // Handle external ID field state
            manageExternalIdField((fromFlow.source || 'manual'), 'exchange');
            
            // Handle rich text description separately (uses RichTextEditorService)
            const descriptionContent = fromFlow.description || '';
            if (window.RichTextEditorService && typeof window.RichTextEditorService.setContent === 'function') {
                window.RichTextEditorService.setContent('currencyExchangeDescription', descriptionContent);
            }
        } else {
            // Fallback if DataCollectionService is not available
            // Use DataCollectionService to set values if available
            if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                window.DataCollectionService.setValue('currencyExchangeAccount', fromFlow.trading_account_id, 'int');
                window.DataCollectionService.setValue('currencyExchangeFromCurrency', fromFlow.currency_id, 'int');
                window.DataCollectionService.setValue('currencyExchangeToCurrency', toFlow.currency_id, 'int');
                window.DataCollectionService.setValue('currencyExchangeFromAmount', Math.abs(fromFlow.amount), 'number');
                window.DataCollectionService.setValue('currencyExchangeRate', exchangeData.exchange_rate, 'number');
                window.DataCollectionService.setValue('currencyExchangeFeeAmount', feeAmount, 'number');
                window.DataCollectionService.setValue('currencyExchangeSource', fromFlow.source || 'manual', 'text');
                window.DataCollectionService.setValue('currencyExchangeExternalId', fromFlow.external_id || '0', 'text');
                window.DataCollectionService.setValue('currencyExchangeDate', fromFlow.date, 'date');
                manageExternalIdField((fromFlow.source || 'manual'), 'exchange');
            } else {
                // Fallback if DataCollectionService is not available
                const accountField = document.getElementById('currencyExchangeAccount');
                if (accountField) {
                    accountField.value = fromFlow.trading_account_id;
                }
                if (document.getElementById('currencyExchangeFromCurrency')) {
                    document.getElementById('currencyExchangeFromCurrency').value = fromFlow.currency_id;
                }
                if (document.getElementById('currencyExchangeToCurrency')) {
                    document.getElementById('currencyExchangeToCurrency').value = toFlow.currency_id;
                }
                if (document.getElementById('currencyExchangeFromAmount')) {
                    document.getElementById('currencyExchangeFromAmount').value = Math.abs(fromFlow.amount);
                }
                if (document.getElementById('currencyExchangeRate')) {
                    document.getElementById('currencyExchangeRate').value = exchangeData.exchange_rate;
                }
                if (document.getElementById('currencyExchangeFeeAmount')) {
                    document.getElementById('currencyExchangeFeeAmount').value = feeAmount;
                }
                // Note: fee currency is now a label, not a select field - it's updated automatically based on account
                if (document.getElementById('currencyExchangeSource')) {
                    document.getElementById('currencyExchangeSource').value = fromFlow.source || 'manual';
                }
                if (document.getElementById('currencyExchangeExternalId')) {
                    const externalField = document.getElementById('currencyExchangeExternalId');
                    externalField.value = fromFlow.external_id || '0';
                    manageExternalIdField((fromFlow.source || 'manual'), 'exchange');
                }
                if (document.getElementById('currencyExchangeDate')) {
                    document.getElementById('currencyExchangeDate').value = fromFlow.date;
                }
            }
            const descriptionContent = fromFlow.description || '';
            if (window.RichTextEditorService && typeof window.RichTextEditorService.setContent === 'function') {
                window.RichTextEditorService.setContent('currencyExchangeDescription', descriptionContent);
            } else {
                const descriptionField = document.getElementById('currencyExchangeDescription');
                if (descriptionField) {
                    descriptionField.value = descriptionContent;
                }
            }
        }
        
        // Set exchange ID in form
        const form = document.getElementById('cashFlowModalForm');
        if (form) {
            form.dataset.exchangeId = exchangeId;
            form.dataset.mode = 'edit';
        }
        
        // Trigger toAmount calculation and update fee currency label
        if (window.calculateCurrencyExchangeToAmount) {
            window.calculateCurrencyExchangeToAmount();
        }
        
        // Update fee currency label based on account
        if (accountField) {
            accountField.dispatchEvent(new Event('change'));
        }

        if (window.updateCurrencyExchangeDescription) {
            window.updateCurrencyExchangeDescription();
        }
        
        if (typeof setCurrencyExchangeSummary === 'function') {
            setCurrencyExchangeSummary(exchangeData.exchange_pair_summary || null);
        }

        window.Logger.debug('loadCurrencyExchange - Exchange loaded successfully', { page: 'cash_flows', exchangeId });
        
    } catch (error) {
        window.Logger.error('loadCurrencyExchange - Error', { page: 'cash_flows', exchangeId, error: error?.message || error });
        if (window.showNotification) {
            window.showNotification('שגיאה', 'שגיאה בטעינת פרטי המרת מטבע', 'error');
        }
    }
}

/**
 * Delete currency exchange
 * @function deleteCurrencyExchange
 * @async
 * @param {string} exchangeId - Exchange UUID
 * @returns {Promise<void>}
 */
async function deleteCurrencyExchange(exchangeId) {
    try {
        let confirmed = false;
        if (typeof window.showDeleteWarning === 'function') {
            confirmed = await new Promise(resolve => {
                window.showDeleteWarning(
                    'currency_exchange',
                    exchangeId,
                    'המרת מטבע',
                    () => resolve(true),
                    () => resolve(false),
                );
            });
        } else {
            // Fallback למקרה שמערכת התראות לא זמינה
            confirmed = window.showConfirmationDialog('האם אתה בטוח שברצונך למחוק את המרת המטבע? פעולה זו תמחק את כל הרשומות המקושרות.');
        }
        
        if (!confirmed) {
            return;
        }
        
        window.Logger.debug('deleteCurrencyExchange - Deleting exchange', { page: 'cash_flows', exchangeId });
        
        let response;
        if (typeof window.CashFlowsData?.deleteCurrencyExchange === 'function') {
            response = await window.CashFlowsData.deleteCurrencyExchange(exchangeId);
        } else {
            response = await fetch(`/api/cash-flows/exchange/${exchangeId}`, {
                method: 'DELETE'
            });
        }
        
        await CRUDResponseHandler.handleDeleteResponse(response, {
            successMessage: 'המרת מטבע נמחקה בהצלחה',
            entityName: 'המרת מטבע',
            reloadFn: () => window.loadCashFlowsData({ force: true }),
            requiresHardReload: false
        });
        
    } catch (error) {
        window.Logger.error('deleteCurrencyExchange - Error', { page: 'cash_flows', exchangeId, error: error?.message || error });
        if (window.showNotification) {
            window.showNotification('שגיאה', `שגיאה במחיקת המרת מטבע: ${error.message}`, 'error');
        }
    }
}

/**
 * Check if cash flow is part of currency exchange
 * @function isCurrencyExchange
 * @param {Object} cashFlow - Cash flow object
 * @returns {boolean}
 */
function isCurrencyExchange(cashFlow) {
    if (!cashFlow) {
        return false;
    }
    if (resolveExchangeDirectionFromType(cashFlow.type)) {
        return true;
    }
    if (cashFlow.exchange_group_id) {
        return true;
    }
    if (cashFlow.linked_exchange_cash_flow_id || cashFlow.linked_exchange_summary || cashFlow.exchange_pair_summary) {
        return true;
    }
    if (cashFlow.source && String(cashFlow.source).toLowerCase() === 'currency_exchange') {
        return true;
    }
    const externalId = cashFlow.external_id;
    return typeof externalId === 'string' && externalId.startsWith('exchange_');
}

/**
 * Get exchange UUID from cash flow
 * @function getExchangeIdFromCashFlow
 * @param {Object} cashFlow - Cash flow object
 * @returns {string|null}
 */
function getExchangeIdFromCashFlow(cashFlow) {
    if (!isCurrencyExchange(cashFlow)) {
        return null;
    }
    const groupId = cashFlow.exchange_group_id || cashFlow.external_id;
    if (!groupId) {
        return null;
    }
    // Remove 'exchange_' prefix if present - backend expects just the UUID
    const uuid = typeof groupId === 'string' ? groupId.replace(/^exchange_/, '') : String(groupId).replace(/^exchange_/, '');
    return uuid || null;
}

// Export save function for ModalManagerV2
window.saveCashFlow = saveCashFlow;
window.saveCurrencyExchange = saveCurrencyExchange;
window.updateCashFlow = updateCashFlow;
window.loadCurrencyExchange = loadCurrencyExchange;
window.deleteCurrencyExchange = deleteCurrencyExchange;
window.isCurrencyExchange = isCurrencyExchange;
window.getExchangeIdFromCashFlow = getExchangeIdFromCashFlow;

// יצירת alias לפונקציית המחיקה לשמירה על תאימות
/**
 * Confirm delete cash flow
 * @function confirmDeleteCashFlow
 * @param {string} id - Cash flow ID
 * @returns {void}
 */
function confirmDeleteCashFlow(id) {
  return deleteCashFlow(id);
}
window.confirmDeleteCashFlow = confirmDeleteCashFlow;

// window.viewLinkedItemsForCashFlow = viewLinkedItemsForCashFlow; // נמחק

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת תזרימי מזומנים
 * @param {number} columnIndex - אינדקס העמודה לסידור
 *
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת חשבון מסחר
 * sortTable(2); // סידור לפי עמודת סכום
 * sortTable(4); // סידור לפי עמודת תאריך
 *
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
// restoreSortState - using global function from page-utils.js

// הגדרת הפונקציה כגלובלית
// window.sortTable export removed - using global version from tables.js

// ========================================
// פונקציות לניהול שדה מזהה חיצוני
// ========================================

/**
 * Manage external ID field
 * @function manageExternalIdField
 * @param {string} source - Source type
 * @param {string} modalType - Modal type
 * @returns {void}
 */
function manageExternalIdField(source, modalType) {
  let fieldId = 'cashFlowExternalId';
  switch (modalType) {
  case 'edit':
    fieldId = 'editCashFlowExternalId';
    break;
  case 'exchange':
  case 'exchange-edit':
    fieldId = 'currencyExchangeExternalId';
    break;
  default:
    fieldId = 'cashFlowExternalId';
  }
  const externalIdField = document.getElementById(fieldId);

  if (!externalIdField) {
    handleElementNotFound('manageExternalIdField', `שדה מזהה חיצוני לא נמצא במודל ${modalType} - מחפש ${fieldId}`);
    return;
  }

  // אם המקור הוא ידני, השדה לא פעיל
  if (source === 'manual') {
    externalIdField.disabled = true;
    // Use DataCollectionService if available
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
      window.DataCollectionService.setValue(fieldId, '0', 'text');
    } else {
      externalIdField.value = '0'; // ערך ברירת מחדל
    }
    externalIdField.classList.add('form-control-disabled');
  } else {
    // אם המקור אינו ידני, השדה פעיל
    externalIdField.disabled = false;
    externalIdField.classList.remove('form-control-disabled');

    // אם השדה ריק, אפשר למשתמש להזין ערך
    let currentValue = '';
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      currentValue = window.DataCollectionService.getValue(fieldId, 'text', '0');
    } else {
      currentValue = externalIdField.value || '0';
    }
    
    if (currentValue === '0') {
      if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        window.DataCollectionService.setValue(fieldId, '', 'text');
      } else {
        externalIdField.value = '';
      }
    }
  }
}

/**
 * Setup source field listeners
 * @function setupSourceFieldListeners
 * @returns {void}
 */
function setupSourceFieldListeners() {
  // למודל הוספה
  const addSourceField = document.getElementById('cashFlowSource');
  if (addSourceField) {
    addSourceField.addEventListener('change', function () {
      manageExternalIdField(this.value, 'add');
    });
  }

  // למודל עריכה
  const editSourceField = document.getElementById('editCashFlowSource');
  if (editSourceField) {
    editSourceField.addEventListener('change', function () {
      manageExternalIdField(this.value, 'edit');
    });
  }

  const exchangeSourceField = document.getElementById('currencyExchangeSource');
  if (exchangeSourceField) {
    exchangeSourceField.addEventListener('change', function () {
      manageExternalIdField(this.value, 'exchange');
    });
  }
}


/**
 * הצגת שגיאה לשדה בודד
 */
// showFieldError() - זמינה גלובלית מ-ui-utils.js כ-showValidationWarning

// Function removed - not used anywhere

/**
 * Initialize external ID fields
 * @function initializeExternalIdFields
 * @returns {void}
 */
function initializeExternalIdFields() {
  // אתחול במודל הוספה
  const addSourceField = document.getElementById('cashFlowSource');
  if (addSourceField) {
    manageExternalIdField(addSourceField.value, 'add');
  }

  // אתחול במודל עריכה
  const editSourceField = document.getElementById('editCashFlowSource');
  if (editSourceField) {
    manageExternalIdField(editSourceField.value, 'edit');
  }

  const exchangeSourceField = document.getElementById('currencyExchangeSource');
  if (exchangeSourceField) {
    manageExternalIdField(exchangeSourceField.value, 'exchange');
  }
}

// פונקציות מודל חדשות - מערכת ModalManagerV2
// REMOVED: showAddCashFlowModal - use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly
// Wrapper function removed - call ModalManagerV2 directly from HTML or code

// REMOVED: showEditCashFlowModal - use window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', cashFlowId) directly
// Wrapper function removed - call ModalManagerV2 directly from HTML or code

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions

// Cash Flow CRUD functions
/**
 * Edit cash flow
 * @function editCashFlow
 * @param {string} id - Cash flow ID
 * @returns {void}
 */
async function editCashFlow(id) {
    try {
        // First, try to load the cash flow data to check if it's a currency exchange
        let response;
        let cashFlowData = null;
        let isExchange = false;
        let exchangeId = null;
        
        try {
            response = await fetch(`/api/cash-flows/${id}`);
            if (response.ok) {
                const result = await response.json();
                cashFlowData = result.data || result;
                
                // Check if this is a currency exchange
                isExchange = window.isCurrencyExchange ? window.isCurrencyExchange(cashFlowData) : false;
                
                if (isExchange) {
                    exchangeId = window.getExchangeIdFromCashFlow ? window.getExchangeIdFromCashFlow(cashFlowData) : null;
                }
            } else if (response.status === 404) {
                // Cash flow not found - might be a currency exchange, try to find it
                // For currency exchanges, we need to find the exchange ID from the table data
                // This is a fallback - ideally the cash flow should exist
                window.Logger?.warn(`Cash flow ${id} not found, might be part of currency exchange`, { page: "cash_flows" });
                // We'll handle this case below
            }
        } catch (fetchError) {
            window.Logger?.warn(`Error loading cash flow ${id}, will try alternative approach`, { error: fetchError, page: "cash_flows" });
        }
        
        if (isExchange && exchangeId) {
            // For currency exchange - use loadCurrencyExchange which loads both FROM and TO flows
            // Show modal first in edit mode with exchange tab active
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
                await window.ModalManagerV2.showModal('cashFlowModal', 'edit', cashFlowData, { 
                    isCurrencyExchange: true,
                    exchangeId: exchangeId 
                });
                
                // Wait a bit for modal to be fully rendered
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Load exchange data (both FROM and TO flows) - this populates the form fields
                if (window.loadCurrencyExchange && typeof window.loadCurrencyExchange === 'function') {
                    await window.loadCurrencyExchange(exchangeId);
                } else {
                    throw new Error('loadCurrencyExchange function not available');
                }
            } else {
                throw new Error('ModalManagerV2 not available');
            }
        } else {
            // For regular cash flow - use standard edit modal
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
                await window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', id);
                if (window.TagUIManager && typeof window.TagUIManager.hydrateSelectForEntity === 'function') {
                    await window.TagUIManager.hydrateSelectForEntity('cashFlowTags', 'cash_flow', id, { force: true });
                }
                hydrateCashFlowExchangeDisplay(id);
            } else {
                throw new Error('ModalManagerV2 not available');
            }
        }
    } catch (error) {
        window.Logger?.error('Error editing cash flow', { error, page: "cash_flows" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', `שגיאה בפתיחת מודל עריכה: ${error.message}`);
        }
    }
}


// ===== TRADE AND TRADE PLAN LOADING FUNCTIONS =====

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for onclick attributes
window.manageExternalIdField = manageExternalIdField;
window.setupSourceFieldListeners = setupSourceFieldListeners;
window.initializeExternalIdFields = initializeExternalIdFields;
window.filterCashFlowsByType = filterCashFlowsByType;
window.reapplyCashFlowTypeFilter = reapplyCashFlowTypeFilter;
window.deleteCashFlow = deleteCashFlow;
window.deleteImportedCashFlows = deleteImportedCashFlows;
window.performCashFlowDeletion = performCashFlowDeletion;
// Export initializeCashFlowsPage EARLY so custom initializer can find it
window.initializeCashFlowsPage = initializeCashFlowsPage;

// Export test functions to window for debugging (always available)
window.testCashFlowFilter = async function(type = 'deposit') {
  window.Logger?.debug('🧪 [testCashFlowFilter] Testing filter with type:', type);
  if (typeof window.filterCashFlowsByType === 'function') {
    try {
      await window.filterCashFlowsByType(type);
      window.Logger?.debug('✅ [testCashFlowFilter] Filter test completed');
    } catch (err) {
      window.Logger?.error('❌ [testCashFlowFilter] Filter test failed:', err);
    }
  } else {
    window.Logger?.error('❌ [testCashFlowFilter] filterCashFlowsByType function not found');
  }
};

window.testDirectChange = function() {
  const select = document.getElementById('cashFlowTypeFilter');
  if (!select) {
    window.Logger?.error('❌ [testDirectChange] Select element not found');
    return;
  }
  window.Logger?.debug('🧪 [testDirectChange] Testing direct change event...');
  const oldValue = select.value;
  select.value = select.value === 'all' ? 'deposit' : 'all';
  window.Logger?.debug('   Changed value from', oldValue, 'to', select.value);
  
  const event = new Event('change', { bubbles: true, cancelable: true });
  select.dispatchEvent(event);
  window.Logger?.debug('✅ [testDirectChange] Direct change event dispatched, new value:', select.value);
};
// REMOVED: window exports for removed modal wrapper functions
// Use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly
// Use window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', cashFlowId) directly
// window.toggleSection removed - using global version from ui-utils.js
window.editCashFlow = editCashFlow;
window.loadCashFlowsData = loadCashFlowsData;
window.updateCashFlowsTable = updateCashFlowsTable;
window.updateCashFlow = updateCashFlow;
window.setCurrencyExchangeSummary = setCurrencyExchangeSummary;

// window.showLinkedItemsWarning = showLinkedItemsWarning; // הוסר - הוחלף ב-showLinkedItemsModal
// window.checkLinkedItemsForCashFlow = checkLinkedItemsForCashFlow; // הוסר - לא נחוץ יותר

/**
 * Generate detailed log
 * @function generateDetailedLog
 * @returns {void}
 */
function generateDetailedLog() {
    const timestamp = window.formatDate ? window.formatDate(new Date(), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(), { includeTime: true }) : new Date().toLocaleString('he-IL'));
    const log = [];

    log.push('=== לוג מפורט - תזרימי מזומנים ===');
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

    // 2. סטטיסטיקות תזרימי מזומנים
    log.push('');
    log.push('--- סטטיסטיקות תזרימי מזומנים ---');
    const cashFlowStats = [
        'totalCashFlows', 'totalDeposits', 'totalWithdrawals', 
        'newAlerts', 'currentBalance'
    ];
    
    cashFlowStats.forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${statId}: ${value} (${visible})`);
        }
    });

    // 3. טבלת תזרימי מזומנים
    log.push('');
    log.push('--- טבלת תזרימי מזומנים ---');
    const table = document.querySelector('#cashFlowsTable, .table, table');
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        log.push(`מספר שורות: ${rows.length}`);
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => cell.textContent.trim()).join(' | ');
            log.push(`  ${index + 1}. ${rowData}`);
        });
    } else {
        log.push('טבלה לא נמצאה');
    }

    // 4. כפתורים וקונטרולים
    log.push('');
    log.push('--- כפתורים וקונטרולים ---');
    const buttonIds = [
        'addCashFlowBtn', 'editCashFlowBtn', 'deleteCashFlowBtn', 'filterBtn',
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

    // 6. סטטיסטיקות תזרימים
    log.push('');
    log.push('--- סטטיסטיקות תזרימים ---');
    const stats = ['totalInflow', 'totalOutflow', 'netFlow', 'balance'];
    stats.forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${statId}: ${value} (${visible})`);
        }
    });

    // 7. מידע טכני
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

    // 8. מצב נתונים מפורט
    log.push('');
    log.push('--- מצב נתונים מפורט ---');
    if (window.cashFlowsData && window.cashFlowsData.length > 0) {
        log.push(`מספר תזרימי מזומנים: ${window.cashFlowsData.length}`);
        
        // ניתוח לפי סוג
        const incomeFlows = window.cashFlowsData.filter(cf => cf.type === 'income');
        const expenseFlows = window.cashFlowsData.filter(cf => cf.type === 'expense');
        const transferFlows = window.cashFlowsData.filter(cf => cf.type === 'transfer');
        
        log.push(`הכנסות: ${incomeFlows.length} תזרימים`);
        log.push(`הוצאות: ${expenseFlows.length} תזרימים`);
        log.push(`העברות: ${transferFlows.length} תזרימים`);
        
        // חישוב סכומים מפורט
        const totalIncome = incomeFlows.reduce((sum, cf) => sum + (cf.amount || 0), 0);
        const totalExpense = expenseFlows.reduce((sum, cf) => sum + (cf.amount || 0), 0);
        const totalTransfer = transferFlows.reduce((sum, cf) => sum + (cf.amount || 0), 0);
        
        log.push(`סה"כ הכנסות: ${totalIncome.toLocaleString()}`);
        log.push(`סה"כ הוצאות: ${totalExpense.toLocaleString()}`);
        log.push(`סה"כ העברות: ${totalTransfer.toLocaleString()}`);
        log.push(`יתרה כוללת: ${(totalIncome - totalExpense).toLocaleString()}`);
        
        // תזרים אחרון
        const lastFlow = window.cashFlowsData[0];
        if (lastFlow) {
            log.push(`תזרים אחרון: ${lastFlow.date} - ${lastFlow.type} - ${lastFlow.amount}`);
        }
    } else {
        log.push('❌ אין נתוני תזרימי מזומנים');
    }

    // 9. מצב מערכות גלובליות
    log.push('');
    log.push('--- מצב מערכות גלובליות ---');
    const globalSystems = [
        'showSuccessNotification',
        'showErrorNotification',
        'restoreSectionStates',
        'UnifiedCacheManager',
        'getPreference',
        'loadEntityColors',
        'applyColorScheme'
    ];
    
    globalSystems.forEach(systemName => {
        const exists = typeof window[systemName] === 'function' || typeof window[systemName] === 'object';
        log.push(`${systemName}: ${exists ? '✅ זמין' : '❌ לא זמין'}`);
    });

    // 10. מצב העדפות
    log.push('');
    log.push('--- מצב העדפות ---');
    if (window.cashFlowsPreferences) {
        log.push('העדפות נטענו: ✅');
        Object.keys(window.cashFlowsPreferences).forEach(key => {
            const value = window.cashFlowsPreferences[key];
            log.push(`  ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        });
    } else {
        log.push('❌ העדפות לא נטענו');
    }

    // 11. מצב צבעים דינמיים
    log.push('');
    log.push('--- מצב צבעים דינמיים ---');
    const colorVars = [
        '--cash-flow-color',
        '--cash-flow-bg-color',
        '--account-color',
        '--income-color',
        '--expense-color'
    ];
    
    colorVars.forEach(colorVar => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
        log.push(`${colorVar}: ${value || 'לא מוגדר'}`);
    });

    // 12. שגיאות והערות מהקונסולה
    log.push('');
    log.push('--- שגיאות והערות מהקונסולה ---');
    log.push('⚠️ חשוב: הלוג המפורט חייב לכלול שגיאות קונסולה לאבחון בעיות');
    log.push('📋 הוראות: פתח את Developer Tools (F12) > Console');
    log.push('📋 העתק את כל השגיאות וההערות מהקונסולה');
    log.push('📋 הוסף אותן ללוג המפורט לפני שליחה');
    log.push('');
    log.push('📋 מידע נוסף נדרש:');
    log.push('- תיאור הבעיה המדויק');
    log.push('- צעדים לשחזור הבעיה');
    log.push('- ציפיות vs מציאות');
    log.push('- צילום מסך אם רלוונטי');

    log.push('');
    log.push('=== סוף לוג מפורט ===');
    return log.join('\n');
}

// ===== מערכת טיפול בשגיאות =====
// השתמש במערכת הכללית error-handlers.js

// ===== GLOBAL EXPORTS =====
window.loadCashFlowsData = loadCashFlowsData;
window.calculateBalance = calculateBalance;
window.getAccountNameById = getAccountNameById;
// REMOVED: window.toggleCashFlowsSection - use window.toggleSection('main') instead
window.validateCashFlowForm = validateCashFlowForm;
window.validateEditCashFlowForm = validateEditCashFlowForm;
window.updatePageSummaryStats = updatePageSummaryStats;
window.formatAmount = formatAmount;
window.getCashFlowTypeWithColor = getCashFlowTypeWithColor;
window.getCashFlowTypeText = getCashFlowTypeText;
window.formatCashFlowAmount = formatCashFlowAmount;
window.formatUsdRate = formatUsdRate;
window.showCashFlowDetails = showCashFlowDetails;
window.updateCashFlowsTable = updateCashFlowsTable;
window.startAutoRefresh = startAutoRefresh;
window.applyUserPreferences = applyUserPreferences;
window.confirmDeleteCashFlow = confirmDeleteCashFlow;
window.manageExternalIdField = manageExternalIdField;
window.setupSourceFieldListeners = setupSourceFieldListeners;
window.initializeExternalIdFields = initializeExternalIdFields;
// REMOVED: window exports for removed modal wrapper functions
// Use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly
// Use window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', cashFlowId) directly
window.editCashFlow = editCashFlow;
window.generateDetailedLog = generateDetailedLog;
window.editCashFlow = editCashFlow;

// פונקציות טעינה
// window.loadCurrenciesFromServer export removed - using global function from data-utils.js
window.loadAccountsForCashFlow = loadAccountsForCashFlow;
window.loadCurrenciesForCashFlow = loadCurrenciesForCashFlow;

// פונקציות תצוגה
window.renderCashFlowsTable = renderCashFlowsTable;
window.updatePageSummaryStats = updatePageSummaryStats;
window.updateCashFlowsTable = updateCashFlowsTable;

// פונקציות עזר
window.formatAmount = formatAmount;
window.getCashFlowTypeWithColor = getCashFlowTypeWithColor;
window.getCashFlowTypeText = getCashFlowTypeText;
window.formatCashFlowAmount = formatCashFlowAmount;
window.formatUsdRate = formatUsdRate;

// פונקציות מודלים
// REMOVED: window exports for removed modal wrapper functions
// Use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly
// Use window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', cashFlowId) directly
window.confirmDeleteCashFlow = confirmDeleteCashFlow;

// פונקציות לוג וניפוי שגיאות
window.generateDetailedLog = generateDetailedLog;
// window. export removed - using local function only

// פונקציות טיפול בשגיאות - משתמש במערכת הכללית error-handlers.js

// פונקציות אתחול
window.initializeCashFlowsPage = initializeCashFlowsPage;
window.restoreSortState = restoreSortState;
window.startAutoRefresh = startAutoRefresh;
// window.loadUserPreferences export removed - using global function from preferences-core.js
window.applyUserPreferences = applyUserPreferences;
window.applyDynamicColors = applyDynamicColors;

// פונקציות אימות
window.setupSourceFieldListeners = setupSourceFieldListeners;
window.initializeExternalIdFields = initializeExternalIdFields;
window.manageExternalIdField = manageExternalIdField;

window.Logger.info('Cash Flows: All functions exported to global scope', { page: 'cash_flows' });

/**
 * Restore page state (filters, sort, sections, entity filters)
 * @param {string} pageName - Page name
 * @returns {Promise<void>}
 */
async function restorePageState(pageName) {
  try {
    // אתחול PageStateManager אם לא מאותחל
    if (window.PageStateManager && !window.PageStateManager.initialized) {
      await window.PageStateManager.initialize();
    }

    if (!window.PageStateManager || !window.PageStateManager.initialized) {
      if (window.Logger) {
        window.Logger.warn('⚠️ PageStateManager not available, skipping state restoration', { page: pageName });
      }
      return;
    }

    // מיגרציה של נתונים קיימים אם יש
    await window.PageStateManager.migrateLegacyData(pageName);

    // טעינת מצב מלא
    const pageState = await window.PageStateManager.loadPageState(pageName);
    if (!pageState) {
      return; // אין מצב שמור
    }

    // שחזור פילטרים ראשיים
    if (pageState.filters && window.filterSystem) {
      window.filterSystem.currentFilters = { ...window.filterSystem.currentFilters, ...pageState.filters };
      if (window.filterSystem.applyAllFilters) {
        window.filterSystem.applyAllFilters();
      }
    }

    // שחזור פילטר סוג תזרים (custom filter)
    if (pageState.filters?.custom?.cashFlowType) {
      const savedType = pageState.filters.custom.cashFlowType;
      if (CASH_FLOW_TYPE_FILTERS.has(savedType)) {
        activeCashFlowTypeFilter = savedType;
        setActiveCashFlowTypeButton(savedType);
        // Apply filter without saving again (already restored)
        await filterCashFlowsByType(savedType, { skipButtonUpdate: true, skipSave: true });
      }
    }

    // שחזור סידור
    if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      const { columnIndex, direction } = pageState.sort;
      if (typeof columnIndex === 'number' && columnIndex >= 0) {
        const sortedData = await window.UnifiedTableSystem.sorter.sort('cash_flows', columnIndex, {
          direction: direction || 'asc',
          saveState: false // Don't save again, already restored
        });
        // Update pagination with sorted data
        if (Array.isArray(sortedData) && window.PaginationSystem) {
          const paginationInstance = getCashFlowsPaginationInstance();
          if (paginationInstance && typeof paginationInstance.setData === 'function') {
            paginationInstance.setData(sortedData);
          }
        }
      }
    } else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      // אם אין מצב שמור, נסה להחיל סידור ברירת מחדל
      const sortedData = await window.UnifiedTableSystem.sorter.applyDefaultSort('cash_flows');
      // Update pagination with sorted data
      if (Array.isArray(sortedData) && window.PaginationSystem) {
        const paginationInstance = getCashFlowsPaginationInstance();
        if (paginationInstance && typeof paginationInstance.setData === 'function') {
          paginationInstance.setData(sortedData);
        }
      }
    }

    // שחזור סקשנים
    if (pageState.sections && typeof window.restoreAllSectionStates === 'function') {
      await window.restoreAllSectionStates();
    }

    // שחזור פילטרים פנימיים (entity filters) - מתבצע אוטומטית ב-entity-details-renderer

    if (window.Logger) {
      window.Logger.debug(`✅ Page state restored for "${pageName}"`, { page: pageName });
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error(`❌ Error restoring page state for "${pageName}":`, error, { page: pageName });
    }
  }
}

/**
 * Register cash_flows table with UnifiedTableSystem
 * This function registers the cash_flows table for unified sorting and filtering
 */
window.registerCashFlowsTables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { page: "cash_flows" });
        return;
    }

    // Get column mappings from table-mappings.js
    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    // Register cash_flows table
    window.UnifiedTableSystem.registry.register('cash_flows', {
        dataGetter: () => {
            if (window.TableDataRegistry?.getFullData) {
                const registryData = window.TableDataRegistry.getFullData(CASH_FLOW_TABLE_TYPE);
                if (Array.isArray(registryData)) {
                    return registryData;
                }
            }
            if (Array.isArray(window.filteredCashFlowsData) && window.filteredCashFlowsData.length > 0) {
                return window.filteredCashFlowsData;
            }
            if (Array.isArray(window.allCashFlowsData) && window.allCashFlowsData.length > 0) {
                return window.allCashFlowsData;
            }
            return window.cashFlowsData || [];
        },
        updateFunction: (data) => {
            // CRITICAL FIX: Sorting must update pagination with FULL sorted data
            // The pagination system will handle slicing to current page
            const paginationInstance = getCashFlowsPaginationInstance();
            if (paginationInstance && typeof paginationInstance.setData === 'function') {
                // Update pagination with full sorted data - it will slice to current page
                // This ensures sorting is applied to ALL data, not just current page
                paginationInstance.setData(Array.isArray(data) ? data : []);
                // Pagination will trigger render callback automatically
                return;
            }
            // If no pagination, update table directly
            if (typeof window.updateCashFlowsTable === 'function') {
                window.updateCashFlowsTable(data);
            }
        },
        tableSelector: '#cashFlowsTable',
        columns: getColumns('cash_flows'),
        sortable: true,
        filterable: true,
        // Default sort: date desc (column index 4)
        defaultSort: { columnIndex: 4, direction: 'desc', key: 'date' }
    });
};
