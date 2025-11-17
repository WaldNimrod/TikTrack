/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 67
 * 
 * PAGE INITIALIZATION (4)
 * - initializeTradesPage() - * Load modal data (placeholder - ModalManagerV2 handles this automatically)
 * - setupDateValidation() - setupDateValidation function
 * - initializeTradeConditionsSystem() - * Add buy/sell transaction to trade (placeholder - in development)
 * - setupSortEventListeners() - setupSortEventListeners function
 * 
 * DATA LOADING (6)
 * - getInvestmentTypeColor() - * עיצוב שינוי יומי עם צבעים לפי העדפות
 * - loadTradesData() - loadTradesData function
 * - loadTradeTickerInfo() - loadTradeTickerInfo function
 * - loadTickerDataForTrades() - loadTickerDataForTrades function
 * - loadTradePlanDates() - loadTradePlanDates function
 * - loadModalData() - loadModalData function
 * 
 * DATA MANIPULATION (18)
 * - updateTradesTable() - updateTradesTable function
 * - deleteTradeRecord() - * ביצוע הביטול בפועל
 * - addEditImportantNote() - * ביצוע המחיקה בפועל
 * - addEditReminder() - * Add important note to edit modal
 * - addTrade() - * Add edit reminder functionality (placeholder)
 * - hideAddTradeModal() - hideAddTradeModal function
 * - updateRadioButtons() - * Hide edit trade modal
 * - addImportantNote() - * Clear date validation messages
 * - addReminder() - * Add important note (alias for addEditImportantNote)
 * - updateTableStats() - updateTableStats function
 * - addEditBuySell() - * Update table statistics
 * - updateEditTradeTickerFromPlan() - updateEditTradeTickerFromPlan function
 * - updateEditTradePriceFromTicker() - updateEditTradePriceFromTicker function
 * - updateTrade() - updateTrade function
 * - confirmDeleteTrade() - confirmDeleteTrade function
 * - showAddTradeModal() - showAddTradeModal function
 * - saveTrade() - * הצגת מודל עריכת טרייד
 * - deleteTrade() - deleteTrade function
 * 
 * EVENT HANDLING (16)
 * - formatDailyChange() - formatDailyChange function
 * - performTradeCancellation() - * בדיקת מקושרים וביצוע ביטול
 * - performTradeDeletion() - performTradeDeletion function
 * - clearTradeValidation() - * Edit trade function - wrapper for showEditTradeModal
 * - onRelationTypeChange() - onRelationTypeChange function
 * - onRelatedObjectChange() - * Handle relation type change
 * - enableConditionFields() - * Handle related object change
 * - disableConditionFields() - * Enable condition fields for trade modal
 * - refreshPositions() - * Initialize trades page - called from page-initialization-configs.js
 * - showDateValidationError() - showDateValidationError function
 * - clearDateValidationMessages() - * Show date validation error message
 * - onShowClosedTradesChange() - * Add important note (alias for addEditImportantNote)
 * - validateTradePlanChange() - validateTradePlanChange function
 * - validateTradeChanges() - validateTradeChanges function
 * - validateTickerChange() - validateTickerChange function
 * - showTickerChangeConfirmation() - showTickerChangeConfirmation function
 * 
 * UI UPDATES (3)
 * - displayTradeTickerInfo() - * טעינת מידע על הטיקר (למודל החדש)
 * - hideEditTradeModal() - * Hide add trade modal
 * - showEditTradeModal() - * Show add trade modal
 * 
 * VALIDATION (4)
 * - checkLinkedItemsAndCancel() - checkLinkedItemsAndCancel function
 * - validateTradeForm() - * Clear trade form validation
 * - validateDateFields() - validateDateFields function
 * - validateTradePlanDate() - validateTradePlanDate function
 * 
 * OTHER (16)
 * - viewTickerDetails() - viewTickerDetails function
 * - viewAccountDetails() - * View ticker details for a specific ticker ID
 * - viewTradePlanDetails() - * View account details for a specific account ID
 * - editTradeRecord() - * View trade plan details for a specific trade plan ID
 * - cancelTradeRecord() - * Edit trade record for a specific trade ID
 * - editTrade() - * פונקציה להצגת מודל עריכת טרייד
 * - populateSelect() - populateSelect function
 * - populateRelatedObjects() - * Disable condition fields for trade modal
 * - restoreSortState() - restoreSortState function
 * - enableTradeFormFields() - * Restore sort state wrapper
 * - disableTradeFormFields() - disableTradeFormFields function
 * - applyStatusFilterToTrades() - applyStatusFilterToTrades function
 * - reactivateTrade() - reactivateTrade function
 * - refreshTrades() - refreshTrades function
 * - generateDetailedLog() - generateDetailedLog function
 * - generateDetailedLogForTrades() - REMOVED: not used
 * 
 * ==========================================
 */
/**
 * Trades Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for managing trades including:
 * - CRUD operations for trades
 * - Data loading and table management
 * - Form validation and UI interactions
 * - Modal handling and state management
 * - Filtering and sorting functionality
 * - Conditions system integration
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

/**
 * Trades.js - TikTrack Frontend
 * =============================
 *
 * This file contains all trade management functionality for the TikTrack application.
 * It handles trade CRUD operations, table updates, filtering, and user interactions.
 *
 * TABLE STRUCTURE FIXES (August 24, 2025):
 * =======================================
 *
 * ISSUE: Table headers and data columns were inconsistent
 * - HTML had 10 columns but data rendering had 11 columns
 * - Column order mismatch between headers and data
 * - Sorting failed due to incorrect column mappings
 *
 * FIXES APPLIED:
 * - Updated tableHTML generation to match 11-column structure
 * - Fixed column order: account_name, ticker_symbol, trade_plan_id, status, etc.
 * - Updated "Show Linked Details" button onclick to use viewLinkedItemsForTrade()
 * - Fixed sortTable function to call window.sortTableData correctly
 * - Updated colspan from 10 to 11 in HTML loading row
 *
 * SORTING IMPROVEMENTS:
 * - Fixed sortTable function to use global window.sortTableData
 * - Corrected function parameters: (columnIndex, data, tableType, updateFunction)
 * - Integrated with global sorting system for consistency
 *
 * Usage:
 * - Used in trades.html (trades/tracking page)
 * - Used in database.html (database page - trades table)
 *
 * Features:
 * - Trade data loading and management
 * - Trade table updates and display

 * - Trade creation, editing, and deletion
 * - Integration with global translation system
 * - "Show Linked Details" button for viewing related entities
 *
 * Architecture:
 * - Modular function organization by responsibility
 * - Integration with global translation system
 * - Comprehensive error handling and user feedback
 * - State management for trade operations
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)

 * - linked-items.js (linked items modal functionality)
 *
 * Table Mapping:
 * - Uses 'trades' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * @version 1.9.9
 * @lastUpdated August 26, 2025
 * @tableStructureFixes August 24, 2025 - Fixed column structure and sorting
 *
 * פונקציות עיקריות:
 * - cancelTradeRecord() - ביטול טרייד
 * - deleteTradeRecord() - מחיקת טרייד
 * - validateTradeForm() - ולידציה של טופס
 * - viewLinkedItemsForTrade() - הצגת פריטים מקושרים לטרייד
 *
 * תכונות חדשות:
 * - ולידציה מלאה של טופס הוספת טרייד
 * - שמירה לשרת עם API
 * - טעינת נתונים למודל (חשבונות, תוכניות)
 * - הודעות שגיאה והצלחה
 * - עיצוב אחיד עם שאר המודלים
 * - כפתור "הצג פרטים מקושרים" בכל שורה
 *
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025-08-24
 * ========================================
 */

// בדיקה שהפונקציות הנדרשות נטענו
if (typeof showErrorNotification === 'undefined') {
  // window.Logger.error('showErrorNotification לא נטענה!', { page: "trades" });
}
if (typeof showSuccessNotification === 'undefined') {
  // window.Logger.error('showSuccessNotification לא נטענה!', { page: "trades" });
}
if (typeof handleFunctionNotFound === 'undefined') {
  // window.Logger.error('handleFunctionNotFound לא נטענה!', { page: "trades" });
}

// משתנים גלובליים לדף המעקב
if (typeof window.tradesData === 'undefined') {
  const tradesData = [];
  window.tradesData = tradesData;
}

/**
 * עיצוב שינוי יומי עם צבעים לפי העדפות
 * @param {number} dailyChange - השינוי היומי באחוזים
 * @returns {string} - HTML מעוצב עם צבעים
 */
function formatDailyChange(dailyChange) {
  try {
  if (dailyChange === undefined || dailyChange === null) {
    return '-';
  }
  
  const changeValue = parseFloat(dailyChange);
  const isPositive = changeValue >= 0;
  const sign = isPositive ? '+' : '';
  const formattedValue = `${sign}${Math.abs(changeValue).toFixed(2)}%`;
  
  // קבלת צבעים מהעדפות או ברירת מחדל
  const colors = window.getTableColors ? window.getTableColors() : { 
    positive: '#28a745', 
    negative: '#dc3545' 
  };
  
  const color = isPositive ? colors.positive : colors.negative;
  
  const colorClass = isPositive ? 'numeric-value-positive' : 'numeric-value-negative';
  return `<span class="${colorClass}">${formattedValue}</span>`;
  } catch (error) {
    window.Logger.error('Error in formatDailyChange:', error, { dailyChange, page: "trades" });
    return '-';
  }
}

/**
 * קביעת צבע לפי סוג השקעה
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} - קוד הצבע
 */
function getInvestmentTypeColor(investmentType) {
  try {
  // השתמש במערכת הצבעים הכללית אם היא זמינה
  if (window.getInvestmentTypeColor && window.getInvestmentTypeColor !== getInvestmentTypeColor) {
    return window.getInvestmentTypeColor(investmentType);
  }

  // ברירת מחדל אם המערכת הכללית לא זמינה
  if (!investmentType) {return '#6c757d';} // אפור לנתונים חסרים

  // השתמש במערכת הצבעים הכללית אם היא זמינה
  const typeColors = {
    'swing': window.getEntityColor ? window.getEntityColor('trade') : '#26baac',
    'investment': window.getEntityColor ? window.getEntityColor('account') : '#28a745',
    'passive': window.getEntityColor ? window.getEntityColor('note') : '#6f42c1',
  };

  const normalizedType = investmentType.toLowerCase().trim();
  return typeColors[normalizedType] || '#6c757d'; // ברירת מחדל אפור
  } catch (error) {
    window.Logger.error('Error in getInvestmentTypeColor:', error, { investmentType, page: "trades" });
    return '#6c757d';
  }
}


/**
 * טעינת נתוני טריידים מהשרת
 *
 * פונקציה זו טוענת את כל הטריידים מהשרת ומעדכנת את הטבלה
 * כולל טיפול בשגיאות ועדכון המשתנה הגלובלי
 *
 * תכונות:
 * - קריאה ל-API `/api/trades/`
 * - טיפול בשגיאות רשת
 * - עדכון המשתנה הגלובלי window.tradesData
 * - עדכון הטבלה עם הנתונים החדשים
 * - תמיכה בפילטרים מקומיים
 *
 * @returns {Promise<void>}
 */
// ===== DATA LOADING FUNCTIONS =====
// Data fetching, table updates, and statistics

/**
 * Load trades data from server
 * Fetches all trades and updates the table display
 * 
 * **Trade Planning Fields Support (2025-01-29):**
 * - Maps planning fields (planned_quantity, planned_amount, entry_price) from API response
 * - Includes these fields in localTradesData for use in edit modal and details module
 * - Supports legacy 'quantity' field for backward compatibility
 * 
 * **Data Sources (priority order):**
 * 1. TableDataRegistry (unified system)
 * 2. TradesData service (entity-specific service)
 * 3. Direct API call fallback
 * 
 * @function loadTradesData
 * @async
 * @returns {Promise<void>}
 * 
 * @example
 * // Loads trades with planning fields
 * await loadTradesData();
 * // window.tradesData now includes: planned_quantity, planned_amount, entry_price
 */
async function loadTradesData() {
  try {
    window.Logger.info('Loading trades data via TradesData module', { page: "trades" });

    let rawData = [];
    // Prefer the unified TableDataRegistry when available to align with other pages
    if (window.TableDataRegistry && typeof window.TableDataRegistry.getData === 'function') {
      try {
        rawData = await window.TableDataRegistry.getData('trades', { force: true });
      } catch (e) {
        window.Logger?.warn('⚠️ TableDataRegistry.getData failed for trades, falling back to TradesData', { error: e }, { page: 'trades' });
      }
    }
    if (!Array.isArray(rawData) || rawData.length === 0) {
    const loader = window.TradesData?.loadTradesData;
    if (typeof loader === 'function') {
      rawData = await loader({ force: true });
    } else {
      // Fallback: direct API call aligned with system API config
      window.Logger.warn('⚠️ TradesData service not available - using direct API fallback', { page: 'trades' });
      try {
        let response = await fetch('/api/trades/', { cache: 'no-store' });
        if (!response.ok) {
          // retry without trailing slash
          const retry = await fetch('/api/trades', { cache: 'no-store' });
          if (!retry.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          response = retry;
        }
        const json = await response.json();
        rawData = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      } catch (apiError) {
        window.Logger.error('❌ Trades API fallback failed', apiError, { page: 'trades' });
        rawData = [];
      }
    }
    }

    const apiData = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : [];
    try {
      window.Logger?.info?.('🔎 TradesUI: loader results', {
        isArray: Array.isArray(rawData),
        rawLen: Array.isArray(rawData) ? rawData.length : null,
        apiLen: Array.isArray(apiData) ? apiData.length : null,
      }, { page: 'trades' });
    } catch (e) {}

    if (!Array.isArray(apiData)) {
      window.Logger.warn('⚠️ Trades data loader returned non-array payload', { rawData }, { page: "trades" });
      window.tradesData = [];
      syncTradesPagination([]);
      return;
    }

    // עדכון הנתונים המקומיים - שימוש בשמות אחידים מה-API
    const localTradesData = apiData.map(trade => ({
      id: trade.id,
      trading_account_id: trade.trading_account_id, // Backend uses trading_account_id
      account_name: trade.account_name,
      ticker_id: trade.ticker_id,
      ticker_symbol: trade.ticker_symbol,
      trade_plan_id: trade.trade_plan_id,
      trade_plan_created_at: trade.trade_plan_created_at, // תאריך יצירה של התוכנית
      trade_plan_planned_amount: trade.trade_plan_planned_amount, // סכום מתוכנן של התוכנית
      status: trade.status,
      investment_type: trade.investment_type,
      side: trade.side,
      created_at: trade.created_at,
      closed_at: trade.closed_at,
      cancelled_at: trade.cancelled_at,
      notes: trade.notes,
      // Planning fields (snapshot) - from Trade model
      planned_quantity: trade.planned_quantity || trade.quantity || null,
      planned_amount: trade.planned_amount || null,
      entry_price: trade.entry_price || null,
      // Legacy fields for backward compatibility
      quantity: trade.planned_quantity || trade.quantity || null,
      // Position data from backend
      position: trade.position,
      current_price: trade.current_price,
      daily_change: trade.daily_change,
      change_amount: trade.change_amount,
      updated_at: trade.updated_at || trade.closed_at || trade.cancelled_at || trade.created_at
    }));

    // עדכון המשתנה הגלובלי
    window.tradesData = localTradesData;
    window.Logger.info('💾 loadTradesData: Stored', localTradesData.length, 'trades in window.tradesData', { page: "trades" });

    window.Logger.info('🔄 loadTradesData: syncing pagination...', { page: "trades" });
    syncTradesPagination(localTradesData);

    // עדכון סטטיסטיקות
    // Update table statistics using local wrapper that delegates to global function
    if (typeof updateTableStats === 'function') {
      updateTableStats();
    } else if (typeof window.updatePageSummaryStats === 'function') {
      window.updatePageSummaryStats('trades', window.tradesData);
    }
    
    // Register table with UnifiedTableSystem after data is loaded
    if (typeof window.registerTradesTables === 'function') {
      window.registerTradesTables();
    }

    // Restore page state (filters, sort, sections, entity filters)
    await restorePageState('trades');

  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'נתוני טריידים');
    } else {
      // window.Logger.error('Error loading trades data:', error, { page: "trades" });
    }

    const tbody = document.querySelector('#tradesTable tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">שגיאה בטעינת נתונים: ' + error.message + '</td></tr>';
    } else {
      if (typeof handleElementNotFound === 'function') {
        handleElementNotFound('#tradesTable tbody', 'CRITICAL');
      } else {
        // window.Logger.error('#tradesTable tbody element not found', { page: "trades" });
      }
    }
  }
}

/**
 * Ensure pagination is initialized and synchronized with dataset
 * @param {Array} tradesData
 */
function syncTradesPagination(tradesData) {
  try {
    const tableId = 'tradesTable';
    const tableType = 'trades';

    if (window.setTableData) {
      window.setTableData(tableType, tradesData, { tableId });
      window.setFilteredTableData(tableType, tradesData, { tableId, skipPageReset: true });
    }

    const paginationOptions = getTradesPaginationOptions();
    const paginationInstance = window.ensureTablePagination
      ? window.ensureTablePagination(tableId, paginationOptions)
      : null;

    if (paginationInstance) {
      paginationInstance.setData(tradesData);
    } else {
      updateTradesTable(tradesData);
      updateTradesSummary(tradesData);
      updateTradesCounters(tradesData.length);
    }
  } catch (error) {
    window.Logger?.error('Error syncing trades pagination:', error, { page: "trades" });
    updateTradesTable(tradesData);
    updateTradesSummary(tradesData);
    updateTradesCounters(tradesData?.length || 0);
  }
}

/**
 * Update trades summary statistics
 * @param {Array|null} [filteredDataOverride=null] - Filtered data override
 * @returns {void}
 */
function updateTradesSummary(filteredDataOverride = null) {
  try {
    const filteredData = filteredDataOverride
      || (window.getFilteredTableData ? window.getFilteredTableData('trades', { asReference: true }) : window.tradesData);

    if (typeof updateTableStats === 'function') {
      updateTableStats();
    } else if (typeof window.updatePageSummaryStats === 'function') {
      window.updatePageSummaryStats('trades', filteredData || window.tradesData);
    }
  } catch (error) {
    window.Logger?.warn('updateTradesSummary failed', { error });
  }
}

/**
 * Update trades counters
 * @param {number|null} [filteredCountOverride=null] - Filtered count override
 * @returns {void}
 */
function updateTradesCounters(filteredCountOverride = null) {
  try {
    // Use generic updateTableCount function
    if (window.updateTableCount) {
      window.updateTableCount('tradesCount', 'trades', 'טריידים', filteredCountOverride);
    } else {
      // Fallback to old implementation
      const countElement = document.getElementById('tradesCount');
      if (!countElement) {
        return;
      }

      let filteredCount = filteredCountOverride;
      if (filteredCount === null || typeof filteredCount === 'undefined') {
        if (window.getTableDataCounts) {
          const counts = window.getTableDataCounts('trades');
          filteredCount = counts.filtered;
        } else {
          filteredCount = window.tradesData?.length || 0;
        }
      }

      countElement.textContent = `${filteredCount} טריידים`;
    }
  } catch (error) {
    window.Logger?.warn('updateTradesCounters failed', { error });
  }
}

/**
 * Set trades filtered dataset
 * @param {Array} filteredTrades - Filtered trades array
 * @returns {void}
 */
function setTradesFilteredDataset(filteredTrades) {
  try {
    const tableId = 'tradesTable';
    const tableType = 'trades';
    const paginationOptions = getTradesPaginationOptions();
    const paginationInstance = window.ensureTablePagination
      ? window.ensureTablePagination(tableId, paginationOptions)
      : null;

    if (window.setFilteredTableData) {
      window.setFilteredTableData(tableType, filteredTrades, { tableId });
    }

    if (paginationInstance) {
      paginationInstance.setData(filteredTrades);
    } else {
      updateTradesTable(filteredTrades);
      updateTradesSummary(filteredTrades);
      updateTradesCounters(filteredTrades?.length || 0);
    }
  } catch (error) {
    window.Logger?.error('setTradesFilteredDataset failed', { error });
    updateTradesTable(filteredTrades || []);
    updateTradesSummary(filteredTrades);
    updateTradesCounters(filteredTrades?.length || 0);
  }
}

/**
 * Get trades pagination options
 * @returns {Object} Pagination options
 */
function getTradesPaginationOptions() {
  return {
    tableType: 'trades',
    onAfterRender: handleTradesPageRender,
    onFilteredDataChange: handleTradesFilteredChange,
  };
}

/**
 * Handle trades page render
 * @param {Object} options - Render options
 * @param {Array} options.pageData - Page data
 * @param {Object} options.pagination - Pagination info
 * @returns {void}
 */
function handleTradesPageRender({ pageData, pagination }) {
  updateTradesTable(pageData);
  if (window.setPageTableData) {
    window.setPageTableData('trades', pageData, {
      tableId: 'tradesTable',
      pageInfo: pagination,
    });
  }
  updateTradesCounters();
}

/**
 * Handle trades filtered data change
 * @param {Object} options - Change options
 * @param {Array} options.filteredData - Filtered data
 * @returns {void}
 */
function handleTradesFilteredChange({ filteredData }) {
  updateTradesSummary(filteredData);
  updateTradesCounters(filteredData?.length || 0);
}

/**
 * פונקציה לעדכון טבלת הטריידים
 */
/**
 * Update trades table with provided data
 *
 * This function updates the trades table display with the provided trade data.
 * It handles HTML generation, data formatting, and table state management.
 *
 * @param {Array} trades - Array of trade objects to display
 * @returns {void}
 *
 * Features:
 * - Dynamic HTML generation for trade rows
 * - Integration with translation system for type display
 * - Currency formatting and color coding for P&L values
 * - Action buttons for edit, cancel, and delete operations
 * - Automatic row count updates
 */
/**
 * Load ticker information for trade modal
 * @param {number|string} tickerId - Ticker ID
 * @returns {Promise<void>}
 */
async function loadTradeTickerInfo(tickerId) {
  try {
    window.Logger.info('🔄 Loading ticker info for ID:', tickerId, { page: "trades" });
    
    // Get ticker data from API
    const response = await fetch(`/api/tickers/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const tickers = data.data || data;
    
    // Find the specific ticker
    const ticker = tickers.find(t => t.id == tickerId);
    if (!ticker) {
      throw new Error('Ticker not found');
    }
    
    // Display ticker info
    displayTradeTickerInfo(ticker);
    
  } catch (error) {
    window.Logger.error('❌ Error loading ticker info:', error, { page: "trades" });
  }
}

/**
 * Display ticker information in trade modal
 * @param {Object} ticker - Ticker object
 * @returns {void}
 */
function displayTradeTickerInfo(ticker) {
  const tickerInfoContainer = document.getElementById('tradeTickerInfoDisplay');
  if (!tickerInfoContainer) {
    window.Logger?.warn('⚠️ tradeTickerInfoDisplay element not found in trades modal', { page: 'trades' });
    return;
  }

  let tickerInfoDiv = tickerInfoContainer.querySelector('.ticker-info-box');
  if (!tickerInfoDiv) {
    tickerInfoDiv = document.createElement('div');
    tickerInfoDiv.className = 'ticker-info-box mb-3 p-3 bg-light rounded';
    tickerInfoContainer.appendChild(tickerInfoDiv);
  }
  
  // Use the new global renderTickerInfo function
  if (window.renderTickerInfo) {
    tickerInfoDiv.innerHTML = window.renderTickerInfo(ticker, 'ticker-info-display');
  } else {
    // Fallback if renderTickerInfo not available
    const currentPrice = typeof ticker.current_price === 'number' ? `$${ticker.current_price.toFixed(2)}` : 'לא זמין';
    const dailyChange = typeof ticker.daily_change === 'number' ? ticker.daily_change.toFixed(2) : 'לא זמין';
    const dailyChangePercent = typeof ticker.daily_change_percent === 'number' ? ticker.daily_change_percent.toFixed(2) : 'לא זמין';
    const volume = typeof ticker.volume === 'number' ? ticker.volume.toLocaleString() : 'לא זמין';
    const isPositive = typeof ticker.daily_change === 'number' && ticker.daily_change >= 0;

    tickerInfoDiv.innerHTML = `
      <div class="ticker-info-display">
        <div class="row">
          <div class="col-md-6">
            <strong>${ticker.symbol || 'לא זמין'}</strong> - ${ticker.name || 'לא זמין'}
          </div>
          <div class="col-md-6 text-end">
            <span class="fw-bold">${currentPrice}</span>
            ${typeof ticker.daily_change === 'number' && typeof ticker.daily_change_percent === 'number'
              ? `<span class="${isPositive ? 'text-success' : 'text-danger'}">${isPositive ? '↗' : '↘'} ${dailyChange} (${dailyChangePercent}%)</span>`
              : '<span class="text-muted">לא זמין</span>'}
          </div>
        </div>
        <div class="row mt-1">
          <div class="col-12">
            <small class="text-muted">
              נפח: ${volume} | שינוי יומי: ${dailyChange} (${dailyChangePercent}%)
            </small>
          </div>
        </div>
      </div>
    `;
  }
  
  // Set default entry price to current price if field exists
  const entryPriceField = document.getElementById('tradeEntryPrice');
  if (entryPriceField && ticker.current_price) {
    entryPriceField.value = ticker.current_price;
  }

  const tradesModalElement = document.getElementById('tradesModal');
  if (tradesModalElement && window.InvestmentCalculationService && typeof window.InvestmentCalculationService.resync === 'function') {
    window.InvestmentCalculationService.resync(tradesModalElement, { force: true });
  }

  if (typeof window.applyTradePlanDefaultRiskLevels === 'function') {
    window.applyTradePlanDefaultRiskLevels({ force: false, modalElement: tradesModalElement }).catch(error => {
      window.Logger?.warn('⚠️ applyTradePlanDefaultRiskLevels failed for trades modal after ticker update', { error, page: 'trades' });
    });
  }
}

/**
 * Load ticker data for trades using entity service
 * 
 * טעינת נתוני טיקר עדכניים באמצעות שירות ישויות
 * 
 * Fetches ticker data using the global ticker service instead of direct API calls.
 * Falls back to direct API call if service is not available.
 * 
 * @param {Array<Object>} trades - Array of trade objects with ticker_id property
 * @returns {Promise<Object>} Map of ticker data keyed by ticker ID
 * @throws {Error} When API call fails
 * 
 * @example
 * const tickerData = await loadTickerDataForTrades(trades);
 * const tickerPrice = tickerData[trade.ticker_id]?.current_price;
 */
async function loadTickerDataForTrades(trades) {
  try {
    window.Logger.info('🔄 Loading ticker data for trades...', { page: "trades" });
    
    // Get all unique ticker IDs
    const tickerIds = [...new Set(trades.map(trade => trade.ticker_id).filter(id => id))];
    
    if (tickerIds.length === 0) {
      window.Logger.info('⚠️ No ticker IDs found in trades', { page: "trades" });
      return {};
    }
    
    // Fetch ticker data using ticker service (preferred method)
    let tickers = [];
    if (window.tickerService && typeof window.tickerService.getTickers === 'function') {
      tickers = await window.tickerService.getTickers();
    } else if (window.getTickers && typeof window.getTickers === 'function') {
      tickers = await window.getTickers();
    } else {
      // Fallback: direct API call
      window.Logger?.warn('⚠️ Ticker service not available - using direct API fallback', { page: 'trades' });
      const response = await fetch('/api/tickers/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      tickers = data.data || data || [];
    }
    
    // Create a map of ticker data
    const tickerDataMap = {};
    tickers.forEach(ticker => {
      tickerDataMap[ticker.id] = {
        current_price: ticker.current_price,
        daily_change: ticker.daily_change,
        daily_change_percent: ticker.daily_change_percent
      };
    });
    
    window.Logger.info(`✅ Loaded ticker data for ${Object.keys(tickerDataMap, { page: "trades" }).length} tickers`);
    return tickerDataMap;
    
  } catch (error) {
    window.Logger.error('❌ Error loading ticker data:', error, { page: "trades" });
    return {};
  }
}

/**
 * Update trades table
 * @param {Array} trades - Array of trades
 * @returns {Promise<void>}
 */
async function updateTradesTable(trades) {
  window.Logger.info('🔍 updateTradesTable called with:', trades?.length || 0, 'trades', { page: "trades" });
  
  // בדיקה שהנתונים תקינים
  if (!trades || !Array.isArray(trades)) {
    window.Logger.error('❌ Invalid trades data:', trades, { page: "trades" });
    handleValidationError('trades data', 'נתוני טריידים לא תקינים');
    return;
  }

  // טעינת נתוני טיקר עדכניים
  const tickerDataMap = await loadTickerDataForTrades(trades);

  // בדיקה אם אנחנו בדף הנכון
  const tradesTable = document.querySelector('#tradesTable');
  if (!tradesTable) {
    window.Logger.warn('⚠️ #tradesTable not found - not on trades page', { page: "trades" });
    return;
  }
  
  window.Logger.info('✅ Found #tradesTable, proceeding with update', { page: "trades" });

  const tbody = document.querySelector('#tradesTable tbody');
  window.Logger.info('🔍 Looking for tbody:', tbody, { page: "trades" });
  if (!tbody) {
    window.Logger.error('❌ tbody not found!', { page: "trades" });
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('#tradesTable tbody', 'CRITICAL');
    } else {
      // window.Logger.error('#tradesTable tbody element not found', { page: "trades" });
    }
    return;
  }
  window.Logger.info('✅ Found tbody, proceeding with HTML generation', { page: "trades" });

  const tableHTML = trades.map(trade => {
    const createdEnvelope = window.dateUtils?.ensureDateEnvelope
      ? window.dateUtils.ensureDateEnvelope(
          trade.created_at_envelope ||
          trade.createdAtEnvelope ||
          trade.created_at ||
          trade.createdAt ||
          null
        )
      : (
          trade.created_at_envelope ||
          trade.createdAtEnvelope ||
          trade.created_at ||
          trade.createdAt ||
          null
        );

    const openedEnvelope = window.dateUtils?.ensureDateEnvelope
      ? window.dateUtils.ensureDateEnvelope(
          trade.opened_at_envelope ||
          trade.openedAtEnvelope ||
          trade.opened_at ||
          trade.openedAt ||
          createdEnvelope ||
          null
        )
      : (
          trade.opened_at_envelope ||
          trade.openedAtEnvelope ||
          trade.opened_at ||
          trade.openedAt ||
          createdEnvelope ||
          null
        );

    const closedEnvelopeRaw =
      trade.closed_at_envelope ||
      trade.closedAtEnvelope ||
      trade.closed_at ||
      trade.closedAt ||
      trade.cancelled_at_envelope ||
      trade.cancelledAtEnvelope ||
      trade.cancelled_at ||
      trade.cancelledAt ||
      null;

    const closedEnvelope = window.dateUtils?.ensureDateEnvelope
      ? window.dateUtils.ensureDateEnvelope(closedEnvelopeRaw)
      : closedEnvelopeRaw;

    const createdMs = window.dateUtils?.getEpochMilliseconds
      ? window.dateUtils.getEpochMilliseconds(createdEnvelope)
      : (() => {
          try {
            if (!createdEnvelope) {return null;}
            const createdDateObj = createdEnvelope instanceof Date ? createdEnvelope : new Date(createdEnvelope);
            return createdDateObj.getTime();
          } catch {
            return null;
          }
        })();

    const closedMs = window.dateUtils?.getEpochMilliseconds
      ? window.dateUtils.getEpochMilliseconds(closedEnvelope)
      : (() => {
          try {
            if (!closedEnvelope) {return null;}
            const closedDateObj = closedEnvelope instanceof Date ? closedEnvelope : new Date(closedEnvelope);
            return closedDateObj.getTime();
          } catch {
            return null;
          }
        })();

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = trade.investment_type || '';

    // שימוש ב-FieldRendererService לרינדור שדות
    const tickerDisplay = trade.ticker_symbol || getTickerSymbol(trade.ticker_id) || 'טיקר לא ידוע';

    return `
    <tr>
      <td class="ticker-cell">
        <strong><span class="entity-trade-badge entity-badge-base">
          ${tickerDisplay}
        </span></strong>
      </td>
      <td class="price-cell">${(() => {
        const tickerData = tickerDataMap[trade.ticker_id];
        const currentPrice = tickerData?.current_price || trade.current_price;
        return currentPrice ? (window.FieldRendererService ? window.FieldRendererService.renderAmount(parseFloat(currentPrice), '$', 2) : `$${parseFloat(currentPrice).toFixed(2)}`) : '-';
      })()}</td>
      <td class="change-cell">${(() => {
        const tickerData = tickerDataMap[trade.ticker_id];
        const dailyChange = tickerData?.daily_change ?? trade.daily_change;
        if (dailyChange === null || dailyChange === undefined) {
          return '<span class="numeric-value-zero">לא זמין</span>';
        }
        
        return window.FieldRendererService ? window.FieldRendererService.renderNumericValue(dailyChange, '%', true) : formatDailyChange(dailyChange);
      })()}</td>
      <td class="position-quantity-cell">
        ${(() => {
          if (!trade.position || trade.position.quantity === 0) {
            return '<span class="numeric-value-zero">0</span>';
          }
          const qty = trade.position.quantity;
          const avgPrice = trade.position.average_price || 0;
          return window.FieldRendererService ? window.FieldRendererService.renderPosition(qty, avgPrice, '$') : `<span class="numeric-value-positive">${Math.abs(qty).toFixed(0)}</span>`;
        })()}
      </td>
      <td class="position-pl-percent-cell">
        ${(() => {
          if (!trade.position || !trade.position.average_price) {
            return '<span class="numeric-value-zero entity-badge-medium">-</span>';
          }
          const tickerData = tickerDataMap[trade.ticker_id];
          const currentPrice = tickerData?.current_price || 0;
          const avgPrice = trade.position.average_price;
          
          if (currentPrice === 0 || avgPrice === 0) {
            return '<span class="numeric-value-zero entity-badge-medium">-</span>';
          }
          
          const plPercent = ((currentPrice - avgPrice) / avgPrice) * 100;
          return window.FieldRendererService ? window.FieldRendererService.renderNumericValue(plPercent, '%', true) : `<span class="numeric-value-positive">${plPercent >= 0 ? '+' : ''}${plPercent.toFixed(2)}%</span>`;
        })()}
      </td>
      <td class="position-pl-value-cell">
        ${(() => {
          if (!trade.position || !trade.position.quantity) {
            return '<span class="numeric-value-zero entity-badge-medium">-</span>';
          }
          const tickerData = tickerDataMap[trade.ticker_id];
          const currentPrice = tickerData?.current_price || 0;
          const avgPrice = trade.position.average_price || 0;
          const qty = trade.position.quantity;
          
          if (currentPrice === 0 || avgPrice === 0) {
            return '<span class="numeric-value-zero entity-badge-medium">חסר מחיר</span>';
          }
          
          const plValue = (currentPrice - avgPrice) * qty;
          return window.FieldRendererService ? window.FieldRendererService.renderAmount(plValue, '$', 2) : `<span class="numeric-value-positive">$${plValue.toFixed(2)}</span>`;
        })()}
      </td>
      <td class="status-cell" data-status="${trade.status || ''}">${window.FieldRendererService ? window.FieldRendererService.renderStatus(trade.status, 'trade') : `<span class="status-badge status-${trade.status || 'open'}">${trade.status === 'closed' ? 'סגור' : trade.status === 'cancelled' ? 'מבוטל' : 'פתוח'}</span>`}</td>
      <td class="type-cell" data-type="${typeForFilter}">
        ${window.FieldRendererService ? window.FieldRendererService.renderType(trade.investment_type) : `<span class='investment-type-badge badge-type' data-type='${trade.investment_type || ''}' style='background-color: ${getInvestmentTypeColor(trade.investment_type)};'>${window.translateTradeType ? window.translateTradeType(trade.investment_type) : trade.investment_type || '-'}</span>`}
      </td>
      <td class="side-cell" data-side="${trade.side || 'Long'}">
        ${window.FieldRendererService ? window.FieldRendererService.renderSide(trade.side) : `<span class="side-badge ${trade.side === 'Long' ? 'side-long' : 'side-short'}">${trade.side || 'Long'}</span>`}
      </td>
      <td>${trade.account_name || trade.trading_account_id || 'חשבון מסחר לא ידוע'}</td>
      <td data-date="${createdMs || ''}">
        ${(() => {
          if (!createdEnvelope) {
            return '<span class="date-text">לא מוגדר</span>';
          }
          if (window.FieldRendererService?.renderDate) {
            return `<span class="date-text">${window.FieldRendererService.renderDate(createdEnvelope, false)}</span>`;
          }
          if (window.dateUtils?.formatDate) {
            return `<span class="date-text">${window.dateUtils.formatDate(createdEnvelope, { includeTime: false })}</span>`;
          }
          try {
            const dateObj = createdEnvelope instanceof Date ? createdEnvelope : new Date(createdEnvelope);
            if (!Number.isNaN(dateObj.getTime())) {
              const formatted = window.formatDate ? window.formatDate(dateObj) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(dateObj) : dateObj.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }));
              return `<span class="date-text">${formatted}</span>`;
            }
          } catch (error) {
            window.Logger?.warn('⚠️ trades created_at fallback failed', { error, tradeId: trade?.id }, { page: 'trades' });
          }
          return '<span class="date-text">לא מוגדר</span>';
        })()}
      </td>
      <td data-date="${closedMs || ''}">
        ${(() => {
          if (!closedEnvelope) {
            return '<span class="date-text"></span>';
          }
          if (window.FieldRendererService?.renderDate) {
            return `<span class="date-text">${window.FieldRendererService.renderDate(closedEnvelope, false)}</span>`;
          }
          if (window.dateUtils?.formatDate) {
            return `<span class="date-text">${window.dateUtils.formatDate(closedEnvelope, { includeTime: false })}</span>`;
          }
          try {
            const dateObj = closedEnvelope instanceof Date ? closedEnvelope : new Date(closedEnvelope);
            if (!Number.isNaN(dateObj.getTime())) {
              const formatted = window.formatDate ? window.formatDate(dateObj) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(dateObj) : dateObj.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }));
              return `<span class="date-text">${formatted}</span>`;
            }
          } catch (error) {
            window.Logger?.warn('⚠️ trades closed_at fallback failed', { error, tradeId: trade?.id }, { page: 'trades' });
          }
          return '<span class="date-text"></span>';
        })()}
      </td>
      ${(() => {
        // Prefer FieldRendererService.renderDate for consistent date formatting
        const rawDate = trade.updated_at || trade.closed_at || trade.cancelled_at || trade.created_at || null;
        
        if (!rawDate) {
          return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
        }

        // Use FieldRendererService.renderDate for proper date formatting
        let dateDisplay = '';
        let epoch = null;

        if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
          // Use FieldRendererService to render date with time
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
          // Fallback: work directly with date envelope objects or raw values
          const envelope = window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function'
            ? window.dateUtils.ensureDateEnvelope(rawDate)
            : rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || rawDate.local)
              ? rawDate
              : null;

          // Derive epoch milliseconds in a canonical way
          epoch = (() => {
            if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
              return window.dateUtils.getEpochMilliseconds(envelope || rawDate);
            }
            if (typeof window.getEpochMilliseconds === 'function') {
              return window.getEpochMilliseconds(envelope || rawDate);
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
              window.Logger?.warn('⚠️ trades updated-cell date formatting failed', { err, tradeId: trade?.id }, { page: 'trades' });
              return 'לא מוגדר';
            }
          })();
        }

        if (!dateDisplay || dateDisplay === '-') {
          return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
        }

        return `<td class="col-updated"${epoch ? ` data-epoch="${epoch}"` : ''} title="${dateDisplay}"><span class="updated-value" dir="ltr">${dateDisplay}</span></td>`;
      })()}
      <td class="actions-cell">
        <div class="d-flex gap-1 justify-content-center align-items-center" style="flex-wrap: nowrap;">
          ${(() => {
            if (!window.createActionsMenu) {
              return '<!-- Actions menu not available -->';
            }
            const result = window.createActionsMenu([
              { type: 'VIEW', onclick: `window.showEntityDetails('trade', ${trade.id}, { mode: 'view' })`, title: 'צפה בפרטים' },
              { type: 'EDIT', onclick: `editTradeRecord('${trade.id}')`, title: 'ערוך' },
              { type: 'CANCEL', onclick: `cancelTradeRecord('${trade.id}')`, title: 'בטל' },
              { type: 'DELETE', onclick: `deleteTradeRecord('${trade.id}')`, title: 'מחק' }
            ]);
            return result || '';
          })()}
        </div>
      </td>
    </tr>
  `;
  }).join('');

  tbody.innerHTML = tableHTML;

  // עדכון ספירת רשומות - רק בדף תכנון
  if (window.location.pathname === '/trade_plans' || window.location.pathname === '/trade_plans.html') {
    const countElement = document.querySelector('.section-header .table-title');
    if (countElement) {
      countElement.textContent = `📋 תכנון (${trades.length})`;
    }
  }

  // טעינת תאריכי יצירה של תוכניות (רק אם יש קישורים לתוכניות)
  const planLinks = document.querySelectorAll('.plan-link[data-plan-id]');
  if (planLinks.length > 0) {
    if (typeof loadTradePlanDates === 'function') {
      loadTradePlanDates();
    } else if (typeof window.loadTradePlanDates === 'function') {
      window.loadTradePlanDates();
    } else {
      window.Logger?.debug('loadTradePlanDates not available', { page: "trades" });
    }
  }
}

/**
 * Load trade plan dates for plan links in the trades table
 * This function updates plan link text with the actual creation date
 * 
 * @function loadTradePlanDates
 * @returns {Promise<void>}
 */
async function loadTradePlanDates() {
  try {
    const planLinks = document.querySelectorAll('.plan-link[data-plan-id]');
    if (planLinks.length === 0) {
      return; // No plan links to update
    }
    
    window.Logger?.debug(`Loading dates for ${planLinks.length} trade plan links`, { page: "trades" });
    
    for (const link of planLinks) {
      const planId = link.getAttribute('data-plan-id');
      if (!planId) continue;
      
      try {
        const response = await fetch(`/api/trade-plans/${planId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            const plan = data.data;
            const createdDate = plan.created_at ? (window.formatDate ? window.formatDate(plan.created_at) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(plan.created_at) : new Date(plan.created_at).toLocaleDateString('he-IL', { 
              day: '2-digit', 
              month: '2-digit', 
              year: '2-digit' 
            }))) : 'תאריך לא ידוע';
            link.textContent = createdDate;
          } else {
            link.textContent = 'תוכנית קיימת';
          }
        } else {
          link.textContent = 'תוכנית קיימת';
        }
      } catch (error) {
        window.Logger?.warn('Error loading trade plan date', { planId, error }, { page: "trades" });
        link.textContent = 'תוכנית קיימת';
      }
    }
  } catch (error) {
    window.Logger?.error('Error in loadTradePlanDates', error, { page: "trades" });
  }
}

// פונקציות נוספות

/**
 * View ticker details for a specific ticker ID
 * @param {number} tickerId - The ticker ID to view details for
 * @returns {void}
 */
function viewTickerDetails(tickerId) {
  try {
  // צפייה בפרטי טיקר באמצעות מודל פרטי ישות
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails('ticker', tickerId, { mode: 'view' });
  } else {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', 'פונקציונליות צפייה בפרטי טיקר תהיה זמינה בקרוב');
      }
    }
  } catch (error) {
    window.Logger.error('Error in viewTickerDetails:', error, { tickerId, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת פרטי הטיקר');
    }
  }
}

/**
 * View account details for a specific account ID
 * @param {number} accountId - The account ID to view details for
 * @returns {void}
 */
function viewAccountDetails(accountId) {
  try {
    // צפייה בפרטי חשבון מסחר באמצעות מודל פרטי ישות
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails('trading_account', accountId, { mode: 'view' });
  } else {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'פונקציונליות צפייה בפרטי חשבון מסחר תהיה זמינה בקרוב');
      }
    }
  } catch (error) {
    window.Logger.error('Error in viewAccountDetails:', error, { accountId, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת פרטי החשבון');
    }
  }
}

/**
 * View trade plan details for a specific trade plan ID
 * @param {number} tradePlanId - The trade plan ID to view details for
 * @returns {void}
 */
function viewTradePlanDetails(tradePlanId) {
  try {
  // צפייה בפרטי תוכנית טרייד באמצעות מודל פרטי ישות
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails('trade_plan', tradePlanId, { mode: 'view' });
  } else {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', `פונקציונליות צפייה בתוכנית טרייד #${tradePlanId} תהיה זמינה בקרוב`);
      }
    }
  } catch (error) {
    window.Logger.error('Error in viewTradePlanDetails:', error, { tradePlanId, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת פרטי תוכנית הטרייד');
    }
  }
}

/**
 * Edit trade record for a specific trade ID
 * @param {number} tradeId - The trade ID to edit
 * @returns {void}
 */
function editTradeRecord(tradeId) {
  try {
    // עריכת טרייד
    // מציאת הטרייד במערך - שימוש ב-window.tradesData (גלובלי) ולא tradesData (מקומי)
    const trade = window.tradesData?.find(t => t.id === tradeId || t.id === parseInt(tradeId));
    if (trade) {
      // Use ModalManagerV2 directly
      if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
        window.ModalManagerV2.showEditModal('tradesModal', 'trade', trade.id);
      } else {
        window.Logger?.error('ModalManagerV2 לא זמין', { page: "trades" });
        // Fallback: try to load trade data directly from API
        if (window.EntityDetailsAPI && typeof window.EntityDetailsAPI.getEntityDetails === 'function') {
          window.EntityDetailsAPI.getEntityDetails('trade', tradeId).then(entityData => {
            if (entityData && window.ModalManagerV2) {
              window.ModalManagerV2.showModal('tradesModal', 'edit', entityData);
            }
          }).catch(err => {
            window.Logger?.error('Failed to load trade data for edit', { error: err, tradeId, page: "trades" });
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני הטרייד');
          });
        }
      }
    } else {
      // Try to load trade data directly from API if not found locally
      if (window.EntityDetailsAPI && typeof window.EntityDetailsAPI.getEntityDetails === 'function') {
        window.Logger?.info('Trade not found locally, loading from API...', { tradeId, page: "trades" });
        window.EntityDetailsAPI.getEntityDetails('trade', tradeId).then(entityData => {
          if (entityData && window.ModalManagerV2) {
            window.ModalManagerV2.showModal('tradesModal', 'edit', entityData);
          } else {
            window.showErrorNotification('שגיאה', 'טרייד לא נמצא', 6000, 'system');
          }
        }).catch(err => {
          window.Logger?.error('Failed to load trade data for edit', { error: err, tradeId, page: "trades" });
          window.showErrorNotification('שגיאה', 'טרייד לא נמצא', 6000, 'system');
        });
      } else {
        if (typeof handleElementNotFound === 'function') {
          handleElementNotFound('trade', 'CRITICAL');
        }
        window.showErrorNotification('שגיאה', 'טרייד לא נמצא', 6000, 'system');
      }
    }
  } catch (error) {
    window.Logger.error('Error in editTradeRecord:', error, { tradeId, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בעריכת הטרייד');
    }
  }
}

/**
 * ביטול טרייד - גרסה משופרת
 */
async function cancelTradeRecord(tradeId) {
  try {
    // קבלת פרטי הטרייד לצורך הודעת האישור
    let tradeDetails = '';
    try {
      const response = await fetch(`/api/trades/${tradeId}`);
      if (response.ok) {
        const tradeData = await response.json();
        const trade = tradeData.data;
        tradeDetails = `\n\nפרטי הטרייד:\n• טיקר: ${trade.ticker_symbol || 'לא מוגדר'}\n• צד: ${trade.side || 'לא מוגדר'}\n• סטטוס: ${trade.status || 'לא מוגדר'}`;
      }
    } catch {
      // window.Logger.warn('לא ניתן לטעון פרטי טרייד:', { page: "trades" });
    }

    const executeCancellation = async () => {
      if (typeof window.checkLinkedItemsAndPerformAction === 'function') {
        await window.checkLinkedItemsAndPerformAction('trade', Number(tradeId), 'cancel', performTradeCancellation);
      } else {
        await performTradeCancellation(tradeId);
      }
    };

    if (typeof window.showCancelWarning === 'function') {
      window.showCancelWarning('trade', tradeDetails || `עסקה #${tradeId}`, 'טרייד', executeCancellation, () => {});
      return;
    }

    if (typeof window.showConfirmationDialog === 'function') {
      const confirmed = await new Promise(resolve => {
        window.showConfirmationDialog(
          'ביטול טרייד',
          `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`,
          () => resolve(true),
          () => resolve(false),
        );
      });
      if (!confirmed) {
        return;
      }
      await executeCancellation();
      return;
    }

    if (!window.confirm(`האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`)) {
      return;
    }
    await executeCancellation();

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'ביטול טרייד');
    } else {
      // window.Logger.error('Error canceling trade:', error, { page: "trades" });
    }
    window.showErrorNotification('שגיאה', error.message, 6000, 'system');
  }
}

/**
 * ביצוע הביטול בפועל
 */
async function performTradeCancellation(tradeId) {
  try {
    // Cache will be invalidated after successful cancellation via CacheSyncManager
    // No need to clear cache before mutation - CacheSyncManager handles dependencies automatically
    const response = await fetch(`/api/trades/${tradeId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' }),
    });

    const handled = await window.handleApiResponseWithRefresh(response.clone(), {
      loadDataFunction: window.loadTradesData,
      operationName: 'ביטול',
      itemName: 'הטרייד',
      successMessage: 'הטרייד בוטל בהצלחה'
    });

    if (!handled) {
      const errorText = await response.text();
      const message = errorText || 'בקשת הביטול לא הצליחה';
      window.showErrorNotification?.('שגיאה בביטול הטרייד', message);
    }
  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'ביטול טרייד');
    } else {
      // window.Logger.error('Error canceling trade:', error, { page: "trades" });
    }
    window.showErrorNotification('שגיאה בביטול הטרייד', error?.message || 'שגיאה לא ידועה', 6000, 'system');
  }
}

/**
 * מחיקת טרייד - גרסה פשוטה
 */
async function deleteTradeRecord(tradeId) {
  try {
    window.Logger.info(`🗑️ deleteTradeRecord called for trade ${tradeId}`, { tradeId, page: 'trades' });
    
    // Get trade details for confirmation message
    let tradeDetails = `עסקה #${tradeId}`;
    const trade = window.tradesData?.find(t => t.id === tradeId || t.id === parseInt(tradeId));
    
    if (trade) {
      // Build detailed trade info
      const ticker = trade.ticker_symbol || trade.symbol || 'לא מוגדר';
      const sideText = trade.side === 'buy' ? 'קנייה' : 
                     trade.side === 'sell' ? 'מכירה' : 
                     trade.side === 'Long' ? 'קנייה' :
                     trade.side === 'Short' ? 'מכירה' : trade.side || 'לא מוגדר';
      
      // Get quantity from trade or position
      let quantity = trade.quantity;
      if (!quantity && trade.position && trade.position.quantity) {
        quantity = trade.position.quantity;
      }
      quantity = quantity || '0';
      
      // Get entry price from trade or position
      let entryPrice = trade.entry_price;
      if (!entryPrice && trade.position && trade.position.average_price) {
        entryPrice = trade.position.average_price;
      }
      entryPrice = entryPrice ? `$${entryPrice}` : 'לא מוגדר';
      
      const openedEnvelope = window.dateUtils?.ensureDateEnvelope
        ? window.dateUtils.ensureDateEnvelope(
            trade.opened_at_envelope ||
            trade.openedAtEnvelope ||
            trade.opened_at ||
            trade.openedAt ||
            trade.created_at_envelope ||
            trade.created_at ||
            null
          )
        : (
            trade.opened_at_envelope ||
            trade.openedAtEnvelope ||
            trade.opened_at ||
            trade.openedAt ||
            trade.created_at_envelope ||
            trade.created_at ||
            null
          );
      let date = 'לא מוגדר';
      if (openedEnvelope) {
        if (window.dateUtils?.formatDate) {
          date = window.dateUtils.formatDate(openedEnvelope, { includeTime: false });
        } else {
          try {
            const dateObj = openedEnvelope instanceof Date ? openedEnvelope : new Date(openedEnvelope);
            if (!Number.isNaN(dateObj.getTime())) {
              date = window.formatDate ? window.formatDate(dateObj) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(dateObj) : dateObj.toLocaleDateString('he-IL'));
            }
          } catch {
            date = 'לא מוגדר';
          }
        }
      }
      
      tradeDetails = `${ticker} - ${sideText}, ${quantity} יחידות ב-${entryPrice}, תאריך פתיחה: ${date}`;
    }
    
    // Check linked items first (Executions, Notes, Alerts)
    window.Logger.info('🔍 Checking for linked items before deletion', { tradeId, page: 'trades' });
    if (typeof window.checkLinkedItemsBeforeAction === 'function') {
      window.Logger.info('✅ checkLinkedItemsBeforeAction function exists', { tradeId, page: 'trades' });
      const hasLinkedItems = await window.checkLinkedItemsBeforeAction('trade', tradeId, 'delete');
      window.Logger.info(`🔍 Linked items check result: hasLinkedItems=${hasLinkedItems}`, { tradeId, page: 'trades' });
      if (hasLinkedItems) {
        window.Logger.info('🚫 Trade has linked items, deletion cancelled', { tradeId, page: 'trades' });
        return;
      }
    } else {
      window.Logger.warn('⚠️ checkLinkedItemsBeforeAction function not available', { tradeId, page: 'trades' });
    }

    // Show delete warning with detailed information
    if (typeof window.showDeleteWarning === 'function') {
      window.showDeleteWarning('trade', tradeDetails, 'עסקה',
        async () => {
          // User confirmed - perform deletion
          await performTradeDeletion(tradeId);
        },
        () => {
          // User cancelled - do nothing
        },
      );
    } else {
      // Fallback in case global system not available
      if (typeof window.showConfirmationDialog === 'function') {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'מחיקת טרייד',
            'האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.',
            () => resolve(true),
            () => resolve(false),
          );
        });
        if (!confirmed) {return;}
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          const confirmed = await new Promise(resolve => {
            window.showConfirmationDialog(
              'מחיקת טרייד',
              'האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.',
              () => resolve(true),
              () => resolve(false),
            );
          });
          if (!confirmed) {return;}
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          if (!window.window.showConfirmationDialog('אישור', 'האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
            return;
          }
        }
      }
      await performTradeDeletion(tradeId);
    }

  } catch (error) {
    if (typeof handleDeleteError === 'function') {
      handleDeleteError(error, 'טרייד');
    } else {
      // window.Logger.error('Error deleting trade:', error, { page: "trades" });
    }
    window.showErrorNotification('שגיאה', error.message, 6000, 'system');
  }
}

/**
 * ביצוע המחיקה בפועל
 */
async function performTradeDeletion(tradeId) {
  try {
    // Send delete request
    // Cache will be invalidated after successful delete via CacheSyncManager
    // No need to clear cache before mutation - CacheSyncManager handles dependencies automatically
    const response = await fetch(`/api/trades/${tradeId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    // Use CRUDResponseHandler for consistent response handling
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'טרייד נמחק בהצלחה',
      entityName: 'טרייד',
      reloadFn: window.loadTradesData,
      requiresHardReload: false
    });

    // אימות מחיקה בפועל: בדיקת GET שהרשומה איננה יותר
    try {
      const verify = await fetch(`/api/trades/${tradeId}`, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (verify && verify.ok) {
        // עדיין קיים בשרת – דווח שגיאת עקביות ורענן קשיח של הטבלה
        window.Logger?.warn('⚠️ Deletion verification failed – trade still exists', { tradeId, status: verify.status }, { page: 'trades' });
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification('מחיקה', 'מחיקת הטרייד דווחה כהצלחה אך הרשומה עדיין קיימת. נבצע רענון וננסה שוב.');
        }
        // ניקוי מטמונים ורענון
        try {
          await window.UnifiedCacheManager?.clearByPattern?.('trades');
          await window.UnifiedCacheManager?.clearByPattern?.('dashboard');
        } catch (_e) {}
        if (typeof window.loadTradesData === 'function') {
          await window.loadTradesData();
        }
      } else if (verify && verify.status === 404) {
        window.Logger?.info('✅ Deletion verified – trade not found (404)', { tradeId }, { page: 'trades' });
      }
    } catch (verErr) {
      window.Logger?.debug('Deletion verification check failed (network or other)', { tradeId, error: verErr }, { page: 'trades' });
    }

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת טרייד');
  }
}

// ===== EDIT MODAL HELPER FUNCTIONS =====
// Helper functions for edit modal functionality

/**
 * Add important note to edit modal
 * Placeholder for future note functionality
 * 
 * @function addEditImportantNote
 * @returns {void}
 */
function addEditImportantNote() {
  try {
        if (typeof window.showNotification === 'function') {
    window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר הערות עשירות לטרייד');
        }
  } catch (error) {
    window.Logger.error('Error in addEditImportantNote:', error, { page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בהוספת הערה חשובה');
    }
  }
}

/**
 * Add edit reminder functionality (placeholder)
 * @returns {void}
 */
function addEditReminder() {
  try {
        if (typeof window.showNotification === 'function') {
      window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר התראות לטרייד');
        }
  } catch (error) {
    window.Logger.error('Error in addEditReminder:', error, { page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בהוספת תזכורת');
    }
  }
}

/**
 * פונקציה להצגת מודל עריכת טרייד
 */

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

    // שחזור סידור
    if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      const { columnIndex, direction } = pageState.sort;
      if (typeof columnIndex === 'number' && columnIndex >= 0) {
        await window.UnifiedTableSystem.sorter.sort('trades', columnIndex, {
          direction: direction || 'asc',
          saveState: false // Don't save again, already restored
        });
      }
    } else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      // אם אין מצב שמור, נסה להחיל סידור ברירת מחדל
      await window.UnifiedTableSystem.sorter.applyDefaultSort('trades');
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

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for HTML onclick attributes

// Wrapper function - always uses force: true for CRUD operations (standard pattern like executions.js)
const originalLoadTradesData = loadTradesData;
window.loadTradesData = async function(options = {}) {
  // When called from CRUDResponseHandler, always force reload to get fresh data
  // This matches the standard pattern used in executions.js and other pages
  // Note: loadTradesData already calls TradesData.loadTradesData({ force: true }) internally,
  // but we ensure it's always called with force: true from the wrapper
  return await originalLoadTradesData();
};

window.updateTradesTable = updateTradesTable;
window.updatePageSummaryStats = updatePageSummaryStats;

/**
 * Add trade function - wrapper for showAddTradeModal
 * Maintains backward compatibility with old function name
 * 
 * @function addTrade
 * @returns {void}
 */
async function addTrade() {
  if (typeof showAddTradeModal === 'function') {
    // Use ModalManagerV2 directly
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
      await window.ModalManagerV2.showModal('tradesModal', 'add');
      const select = document.getElementById('tradeTags');
      if (select) {
        select.setAttribute('data-initial-value', '');
        if (window.TagUIManager?.refreshSelectOptions) {
          await window.TagUIManager.refreshSelectOptions(select);
        }
      }
    }
  } else {
    window.Logger?.error('showAddTradeModal not available', { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'לא ניתן לפתוח מודל הוספת טרייד');
    }
  }
}

window.addTrade = addTrade;

/**
 * Edit trade function - wrapper for showEditTradeModal
 * Maintains backward compatibility with old function name
 * 
 * @function editTrade
 * @param {number} tradeId - Trade ID to edit
 * @returns {void}
 */
async function editTrade(tradeId) {
  // Use ModalManagerV2 directly
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
    await window.ModalManagerV2.showEditModal('tradesModal', 'trade', tradeId);
    if (window.TagUIManager?.hydrateSelectForEntity) {
      await window.TagUIManager.hydrateSelectForEntity('tradeTags', 'trade', tradeId, { force: true });
    }
  } else {
    window.Logger?.error('showEditTradeModal not available', { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'לא ניתן לפתוח מודל עריכת טרייד');
    }
  }
}

window.editTrade = editTrade;
window.deleteTrade = deleteTrade;
window.updateTrade = updateTrade;
window.loadTradeTickerInfo = loadTradeTickerInfo;
window.displayTradeTickerInfo = displayTradeTickerInfo;

/**
 * Clear trade form validation
 * Wrapper for global clearValidation function
 * 
 * @function clearTradeValidation
 * @param {string} formId - Form ID to clear validation for (optional, defaults to 'addTradeForm')
 * @returns {void}
 */
function clearTradeValidation(formId = 'addTradeForm') {
  if (typeof window.clearValidation === 'function') {
    window.clearValidation(formId);
  } else if (typeof window.clearValidationErrors === 'function') {
    window.clearValidationErrors(formId);
  } else {
    window.Logger?.debug('Validation clearing functions not available', { formId, page: "trades" });
  }
}

/**
 * Validate trade form
 * Wrapper for global validation system
 * 
 * @function validateTradeForm
 * @param {string} formId - Form ID to validate (optional, defaults to 'addTradeForm')
 * @returns {boolean} - True if form is valid, false otherwise
 */
function validateTradeForm(formId = 'addTradeForm') {
  const form = document.getElementById(formId);
  if (!form) {
    window.Logger?.warn('Form not found for validation', { formId, page: "trades" });
    return false;
  }
  
  // Use global validation system if available
  if (typeof window.validateForm === 'function') {
    const result = window.validateForm(formId);
    // Handle both boolean and object results
    return typeof result === 'boolean' ? result : (result?.isValid !== false);
  }
  
  // Fallback: check required fields
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('is-invalid');
    } else {
      field.classList.remove('is-invalid');
    }
  });
  
  return isValid;
}

window.clearTradeValidation = clearTradeValidation;
window.validateTradeForm = validateTradeForm;
// REMOVED: window.showAddTradeModal - use window.ModalManagerV2.showModal('tradesModal', 'add') directly

/**
 * Hide add trade modal
 * Wrapper for ModalManagerV2 hideModal
 * 
 * @function hideAddTradeModal
 * @returns {void}
 */
function hideAddTradeModal() {
  try {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
      window.ModalManagerV2.hideModal('tradesModal');
    } else {
      window.Logger?.warn('ModalManagerV2.hideModal not available, modal may not close', { page: "trades" });
    }
  } catch (error) {
    window.Logger?.error('Error in hideAddTradeModal', error, { page: "trades" });
  }
}

window.hideAddTradeModal = hideAddTradeModal;
// REMOVED: window.showEditTradeModal - use window.ModalManagerV2.showEditModal('tradesModal', 'trade', id) directly

/**
 * Hide edit trade modal
 * Wrapper for ModalManagerV2 hideModal
 * 
 * @function hideEditTradeModal
 * @returns {void}
 */
function hideEditTradeModal() {
  try {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
      window.ModalManagerV2.hideModal('tradesModal');
    } else {
      window.Logger?.warn('ModalManagerV2.hideModal not available, modal may not close', { page: "trades" });
    }
  } catch (error) {
    window.Logger?.error('Error in hideEditTradeModal', error, { page: "trades" });
  }
}

window.hideEditTradeModal = hideEditTradeModal;

/**
 * Update radio buttons for relation type selection
 * Sets up event listeners for relation type radio buttons
 * 
 * @function updateRadioButtons
 * @param {Array} accounts - Array of account objects
 * @param {Array} trades - Array of trade objects
 * @param {Array} tradePlans - Array of trade plan objects
 * @param {Array} tickers - Array of ticker objects
 * @returns {void}
 */
function updateRadioButtons(accounts, trades, tradePlans, tickers) {
  try {
    // Update account radio button
    const accountRadio = document.getElementById('tradeRelationAccount');
    const editAccountRadio = document.getElementById('editTradeRelationAccount');

    if (accountRadio) {
      accountRadio.addEventListener('change', () => {
        populateSelect('tradeRelatedObjectSelect', accounts, 'name', 'חשבון מסחר');
      });
    }

    if (editAccountRadio) {
      editAccountRadio.addEventListener('change', () => {
        populateSelect('editTradeRelatedObjectSelect', accounts, 'name', 'חשבון מסחר');
      });
    }

    // Update trade radio button
    const tradeRadio = document.getElementById('tradeRelationTrade');
    const editTradeRadio = document.getElementById('editTradeRelationTrade');

    if (tradeRadio) {
      tradeRadio.addEventListener('change', () => {
        populateSelect('tradeRelatedObjectSelect', trades, 'id', 'טרייד');
      });
    }

    if (editTradeRadio) {
      editTradeRadio.addEventListener('change', () => {
        populateSelect('editTradeRelatedObjectSelect', trades, 'id', 'טרייד');
      });
    }

    // Update trade plan radio button
    const planRadio = document.getElementById('tradeRelationTradePlan');
    const editPlanRadio = document.getElementById('editTradeRelationTradePlan');

    if (planRadio) {
      planRadio.addEventListener('change', () => {
        populateSelect('tradeRelatedObjectSelect', tradePlans, 'id', 'תכנון');
      });
    }

    if (editPlanRadio) {
      editPlanRadio.addEventListener('change', () => {
        populateSelect('editTradeRelatedObjectSelect', tradePlans, 'id', 'תכנון');
      });
    }

    // Update ticker radio button
    const tickerRadio = document.getElementById('tradeRelationTicker');
    const editTickerRadio = document.getElementById('editTradeRelationTicker');

    if (tickerRadio) {
      tickerRadio.addEventListener('change', () => {
        populateSelect('tradeRelatedObjectSelect', tickers, 'symbol', '');
      });
    }

    if (editTickerRadio) {
      editTickerRadio.addEventListener('change', () => {
        populateSelect('editTradeRelatedObjectSelect', tickers, 'symbol', '');
      });
    }
    
  } catch (error) {
    window.Logger?.error('שגיאה בעדכון רדיו באטונים:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בעדכון רדיו באטונים');
    }
  }
}

window.updateRadioButtons = updateRadioButtons;

/**
 * Populate select element with data
 * 
 * @function populateSelect
 * @param {string} selectId - ID of the select element
 * @param {Array} data - Array of data objects
 * @param {string} field - Field name to use as value
 * @param {string} prefix - Optional prefix for option text
 * @returns {void}
 */
function populateSelect(selectId, data, field, prefix = '') {
  try {
    const select = document.getElementById(selectId);
    if (!select) {
      window.Logger?.debug('Select element not found', { selectId, page: "trades" });
      return;
    }

    select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

    if (!data || data.length === 0) {
      window.Logger?.debug('No data available for select', { selectId, page: "trades" });
      return;
    }

    data.forEach(item => {
      const option = document.createElement('option');
      const value = item[field] || item.id || item.name || '';
      const text = prefix ? `${prefix}: ${value}` : value;
      
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    });
    
  } catch (error) {
    window.Logger?.error('Error in populateSelect', error, { selectId, page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה במילוי select');
    }
  }
}

window.populateSelect = populateSelect;

/**
 * Handle relation type change
 * Called when radio button for relation type changes
 * 
 * @function onRelationTypeChange
 * @param {HTMLInputElement} radioElement - The radio button element that was selected
 * @returns {void}
 */
function onRelationTypeChange(radioElement) {
  try {
    if (!radioElement || !radioElement.value) {
      return;
    }

    // Enable the related object select field
    const relatedObjectSelect = document.getElementById('tradeRelatedObjectSelect');
    if (relatedObjectSelect) {
      relatedObjectSelect.disabled = false;
      relatedObjectSelect.classList.remove('disabled-field');
    }

    // Populate related objects based on selected type
    populateRelatedObjects(parseInt(radioElement.value));
    
  } catch (error) {
    window.Logger?.error('שגיאה בשינוי סוג שיוך:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בשינוי סוג שיוך');
    }
  }
}

/**
 * Handle related object change
 * Called when select element for related object changes
 * 
 * @function onRelatedObjectChange
 * @param {HTMLSelectElement} selectElement - The select element that was changed
 * @returns {void}
 */
function onRelatedObjectChange(selectElement) {
  try {
    if (!selectElement) {
      return;
    }

    if (selectElement.value) {
      // Enable condition fields when object is selected
      enableConditionFields();
    } else {
      // Disable condition fields when no object is selected
      disableConditionFields();
    }
  } catch (error) {
    window.Logger?.error('שגיאה בבחירת אובייקט:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בבחירת אובייקט');
    }
  }
}

/**
 * Enable condition fields for trade modal
 * 
 * @function enableConditionFields
 * @returns {void}
 */
function enableConditionFields() {
  try {
    const fields = [
      'tradeConditionAttribute',
      'tradeConditionOperator',
      'tradeConditionNumber',
      'tradeConditionMessage'
    ];

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = false;
        field.classList.remove('disabled-field');
      }
    });
  } catch (error) {
    window.Logger?.error('שגיאה בהפעלת שדות תנאי:', error, { page: "trades" });
  }
}

/**
 * Disable condition fields for trade modal
 * 
 * @function disableConditionFields
 * @returns {void}
 */
function disableConditionFields() {
  try {
    const fields = [
      'tradeConditionAttribute',
      'tradeConditionOperator',
      'tradeConditionNumber',
      'tradeConditionMessage'
    ];

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = true;
        field.classList.add('disabled-field');
        field.value = '';
      }
    });
  } catch (error) {
    window.Logger?.error('שגיאה בהשבתת שדות תנאי:', error, { page: "trades" });
  }
}

/**
 * Populate related objects select based on relation type
 * @param {number|string} relationTypeId - The relation type ID (1=account, 2=trade, 3=trade_plan, 4=ticker)
 * @returns {void}
 */
function populateRelatedObjects(relationTypeId) {
  try {
    const selectId = 'tradeRelatedObjectSelect';
    const select = document.getElementById(selectId);
    if (!select) {
      window.Logger?.debug('Select element not found for populateRelatedObjects', { selectId, page: "trades" });
      return;
    }

    select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

    switch (relationTypeId) {
      case 1: // Account
        populateSelect(selectId, window.accountsData || [], 'name', 'חשבון מסחר');
        break;
      case 2: // Trade
        populateSelect(selectId, window.tradesData || [], 'id', 'טרייד');
        break;
      case 3: // Trade Plan
        populateSelect(selectId, window.tradePlansData || [], 'id', 'תכנון');
        break;
      case 4: // Ticker
        populateSelect(selectId, window.tickersData || [], 'symbol', '');
        break;
      default:
        window.Logger?.debug('Unknown relation type', { relationTypeId, page: "trades" });
    }
  } catch (error) {
    window.Logger?.error('שגיאה במילוי אובייקטים קשורים:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה במילוי אובייקטים קשורים');
    }
  }
}

window.onRelationTypeChange = onRelationTypeChange;
window.onRelatedObjectChange = onRelatedObjectChange;
window.enableConditionFields = enableConditionFields;
window.disableConditionFields = disableConditionFields;
window.populateRelatedObjects = populateRelatedObjects;
// Note: filterTradesLocally and filterTradesData removed - use unified filter system from header-system.js
// The unified filter system handles all filtering through applyFilter() and related functions
// Note: getDemoTradesData removed - we don't use demo data in the system. If no data is available, show clear message to user
/**
 * Restore sort state wrapper
 * Uses global restoreSortState from page-utils.js
 * @returns {Promise<void>}
 */
async function restoreSortState() {
  try {
    if (typeof window.pageUtils?.restoreSortState === 'function') {
      await window.pageUtils.restoreSortState('trades');
    } else if (window.UnifiedTableSystem?.sorter?.applyDefaultSort) {
      await window.UnifiedTableSystem.sorter.applyDefaultSort('trades');
    } else {
      window.Logger?.debug('restoreSortState not available - using setupSortableHeaders instead', { page: "trades" });
      // Fallback - setup sortable headers will restore state automatically
      if (typeof window.setupSortableHeaders === 'function') {
        window.setupSortableHeaders('trades');
      }
    }
  } catch (error) {
    window.Logger?.error('Error restoring sort state:', error, { page: "trades" });
  }
}

/**
 * Enable trade form fields
 * Activates form fields in the add/edit modals
 * 
 * @function enableTradeFormFields
 * @returns {void}
 */
function enableTradeFormFields() {
  try {
    const fieldsToEnable = [
      'addTradeType',
      'addTradeSide',
      'addTradeAccountId',
      'addTradeOpenedAt',
      'addTradeNotes',
    ];

    fieldsToEnable.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = false;
        field.classList.remove('disabled');
      }
    });
    
    // Also enable edit modal fields
    const editFieldsToEnable = [
      'editTradeType',
      'editTradeSide',
      'editTradeAccountId',
      'editTradeOpenedAt',
      'editTradeNotes',
    ];
    
    editFieldsToEnable.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = false;
        field.classList.remove('disabled');
      }
    });
  } catch (error) {
    window.Logger?.error('Error enabling trade form fields:', error, { page: "trades" });
  }
}

/**
 * Disable trade form fields
 * Deactivates form fields in the add/edit modals
 * 
 * @function disableTradeFormFields
 * @returns {void}
 */
function disableTradeFormFields() {
  try {
    const fieldsToDisable = [
      'addTradeType',
      'addTradeSide',
      'addTradeAccountId',
      'addTradeOpenedAt',
      'addTradeNotes',
    ];

    fieldsToDisable.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = true;
        field.classList.add('disabled');
      }
    });
    
    // Also disable edit modal fields
    const editFieldsToDisable = [
      'editTradeType',
      'editTradeSide',
      'editTradeAccountId',
      'editTradeOpenedAt',
      'editTradeNotes',
    ];
    
    editFieldsToDisable.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = true;
        field.classList.add('disabled');
      }
    });
  } catch (error) {
    window.Logger?.error('Error disabling trade form fields:', error, { page: "trades" });
  }
}

/**
 * Load modal data (placeholder - ModalManagerV2 handles this automatically)
 * 
 * @function loadModalData
 * @returns {void}
 */
function loadModalData() {
  try {
    // ModalManagerV2 handles modal data loading automatically
    // This function is kept for backward compatibility but doesn't need to do anything
    window.Logger?.debug('loadModalData called - ModalManagerV2 handles data loading automatically', { page: "trades" });
  } catch (error) {
    window.Logger?.error('Error in loadModalData:', error, { page: "trades" });
  }
}

window.restoreSortState = restoreSortState;
// Note: setupModalConfigurations removed - ModalManagerV2 handles modal configurations automatically via modal-configs/trades-config.js
window.addEditImportantNote = addEditImportantNote;
window.addEditReminder = addEditReminder;
window.enableTradeFormFields = enableTradeFormFields;
window.disableTradeFormFields = disableTradeFormFields;
window.loadModalData = loadModalData;
/**
 * Initialize trades page - called from page-initialization-configs.js
 * 
 * @function initializeTradesPage
 * @returns {Promise<void>}
 */
async function initializeTradesPage() {
  try {
    window.Logger?.info('📈 Initializing Trades page...', { page: "trades" });
    
    // Load trades data
    if (typeof loadTradesData === 'function') {
      await loadTradesData();
    } else if (typeof window.loadTradesData === 'function') {
      await window.loadTradesData();
    } else {
      window.Logger?.warn('⚠️ loadTradesData not available', { page: "trades" });
    }
    
    window.Logger?.info('✅ Trades page initialized successfully', { page: "trades" });
  } catch (error) {
    window.Logger?.error('❌ Error initializing Trades page:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה באתחול עמוד טריידים');
    }
  }
}

/**
 * רענון נתוני פוזיציות
 * מרענן את נתוני הטריידים והפוזיציות מהשרת
 * 
 * @function refreshPositions
 * @returns {Promise<void>}
 */
async function refreshPositions() {
  try {
    window.Logger?.info('🔄 Refreshing positions data...', { page: "trades" });
    
    // Invalidate cache if UnifiedCacheManager is available
    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
      try {
        await window.UnifiedCacheManager.remove('trade-positions');
        window.Logger?.debug('Cache invalidated for trade-positions', { page: "trades" });
      } catch (cacheError) {
        window.Logger?.warn('Failed to invalidate cache:', cacheError, { page: "trades" });
      }
    }
    
    // Show notification
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מרענן פוזיציות...', 'מעדכן נתוני פוזיציה מהשרת');
    }
    
    // Reload data
    if (typeof loadTradesData === 'function') {
      await loadTradesData();
    } else if (typeof window.loadTradesData === 'function') {
      await window.loadTradesData();
    } else {
      window.Logger?.error('loadTradesData not available', { page: "trades" });
      throw new Error('loadTradesData not available');
    }
    
    // Show success notification
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('פוזיציות עודכנו', 'נתוני הפוזיציה עודכנו בהצלחה', 3000);
    }
    
    window.Logger?.info('✅ Positions refreshed successfully', { page: "trades" });
  } catch (error) {
    window.Logger?.error('❌ Error refreshing positions:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה ברענון נתוני פוזיציות', 5000);
    }
  }
}

/**
 * Setup date validation for trade forms
 * Sets up event listeners for date field validation (openedAt/closedAt)
 * 
 * @function setupDateValidation
 * @returns {void}
 */
function setupDateValidation() {
  try {
    const openedAtField = document.getElementById('editTradeOpenedAt');
    const closedAtField = document.getElementById('editTradeClosedAt');

    if (openedAtField && closedAtField) {
      // ולידציה בעת שינוי תאריך יצירה
      openedAtField.addEventListener('change', function () {
        validateDateFields();
      });

      // ולידציה בעת שינוי תאריך סגירה
      closedAtField.addEventListener('change', function () {
        validateDateFields();
      });
    }
    
    // Also setup for add modal
    const addOpenedAtField = document.getElementById('addTradeOpenedAt');
    const addClosedAtField = document.getElementById('addTradeClosedAt');
    
    if (addOpenedAtField && addClosedAtField) {
      addOpenedAtField.addEventListener('change', function () {
        validateDateFields();
      });
      
      addClosedAtField.addEventListener('change', function () {
        validateDateFields();
      });
    }
  } catch (error) {
    window.Logger?.error('Error setting up date validation:', error, { page: "trades" });
  }
}

/**
 * Validate date fields (openedAt must be before closedAt)
 * 
 * @function validateDateFields
 * @returns {void}
 */
function validateDateFields() {
  try {
    // Check edit modal first
    const openedAtField = document.getElementById('editTradeOpenedAt');
    const closedAtField = document.getElementById('editTradeClosedAt');

    if (openedAtField && closedAtField) {
      const openedAt = openedAtField.value;
      const closedAt = closedAtField.value;

      // הסרת הודעות שגיאה קודמות
      clearDateValidationMessages();

      if (openedAt && closedAt) {
        const openedDate = new Date(openedAt);
        const closedDate = new Date(closedAt);

        if (closedDate < openedDate) {
          if (typeof window.showFieldError === 'function') {
            window.showFieldError(closedAtField, 'תאריך סגירה לא יכול להיות לפני תאריך יצירה');
          }
          closedAtField.classList.add('is-invalid');
        } else {
          closedAtField.classList.remove('is-invalid');
          closedAtField.classList.add('is-valid');
        }
      }
    }
    
    // Also validate add modal
    const addOpenedAtField = document.getElementById('addTradeOpenedAt');
    const addClosedAtField = document.getElementById('addTradeClosedAt');
    
    if (addOpenedAtField && addClosedAtField) {
      const addOpenedAt = addOpenedAtField.value;
      const addClosedAt = addClosedAtField.value;
      
      if (addOpenedAt && addClosedAt) {
        const addOpenedDate = new Date(addOpenedAt);
        const addClosedDate = new Date(addClosedAt);
        
        if (addClosedDate < addOpenedDate) {
          if (typeof window.showFieldError === 'function') {
            window.showFieldError(addClosedAtField, 'תאריך סגירה לא יכול להיות לפני תאריך יצירה');
          }
          addClosedAtField.classList.add('is-invalid');
        } else {
          addClosedAtField.classList.remove('is-invalid');
          addClosedAtField.classList.add('is-valid');
        }
      }
    }
  } catch (error) {
    window.Logger?.error('Error validating date fields:', error, { page: "trades" });
  }
}

/**
 * Show date validation error message
 * 
 * @function showDateValidationError
 * @param {string} message - Error message to display
 * @param {HTMLElement} field - Field to attach error to
 * @returns {void}
 */
// REMOVED: showDateValidationError - use window.showFieldError(field, message) from validation-utils.js directly

/**
 * Clear date validation messages
 * 
 * @function clearDateValidationMessages
 * @returns {void}
 */
function clearDateValidationMessages() {
  try {
    // Clear edit modal
    const closedAtField = document.getElementById('editTradeClosedAt');
    if (closedAtField) {
      const existingError = closedAtField.parentNode?.querySelector('.invalid-feedback');
      if (existingError) {
        existingError.remove();
      }
      closedAtField.classList.remove('is-invalid', 'is-valid');
    }
    
    // Clear add modal
    const addClosedAtField = document.getElementById('addTradeClosedAt');
    if (addClosedAtField) {
      const existingError = addClosedAtField.parentNode?.querySelector('.invalid-feedback');
      if (existingError) {
        existingError.remove();
      }
      addClosedAtField.classList.remove('is-invalid', 'is-valid');
    }
  } catch (error) {
    window.Logger?.error('Error clearing date validation messages:', error, { page: "trades" });
  }
}

/**
 * Add important note (alias for addEditImportantNote)
 * Placeholder for future note functionality
 * 
 * @function addImportantNote
 * @returns {void}
 */
function addImportantNote() {
  return addEditImportantNote();
}

/**
 * Add reminder (alias for addEditReminder)
 * Placeholder for future reminder functionality
 * 
 * @function addReminder
 * @returns {void}
 */
function addReminder() {
  return addEditReminder();
}

/**
 * Handle change in "Show Closed Trades" checkbox
 * Reloads modal data to update the trades list
 * 
 * @function onShowClosedTradesChange
 * @param {Event} event - Change event from checkbox
 * @returns {void}
 */
function onShowClosedTradesChange(event) {
  try {
    const showClosed = event?.target?.checked || false;
    window.Logger?.debug('Show closed trades changed:', showClosed, { page: "trades" });
    
    // Reload modal data to update the trades list
    // This will refresh the trade plan selection dropdown based on the filter
    if (typeof loadModalData === 'function') {
      loadModalData();
    } else {
      window.Logger?.warn('loadModalData not available', { page: "trades" });
    }
  } catch (error) {
    window.Logger?.error('Error in onShowClosedTradesChange:', error, { page: "trades" });
  }
}

window.initializeTradesPage = initializeTradesPage;
window.setupDateValidation = setupDateValidation;
window.validateDateFields = validateDateFields;
window.clearDateValidationMessages = clearDateValidationMessages;
window.addImportantNote = addImportantNote;
window.addReminder = addReminder;
window.setupSortEventListeners = setupSortEventListeners;
// Note: filterTradesData removed - use unified filter system from header-system.js
window.onShowClosedTradesChange = onShowClosedTradesChange;
window.refreshPositions = refreshPositions;

/**
 * Update table statistics
 * Wrapper that delegates to global updatePageSummaryStats from ui-utils.js
 * 
 * IMPORTANT: We use updatePageSummaryStats directly (not updateTableStats) to avoid recursion
 * since we're exporting a function with the same name.
 * 
 * @function updateTableStats
 * @returns {void}
 */
function updateTableStats() {
  try {
    // Use updatePageSummaryStats directly - it's the unified system function
    if (typeof window.updatePageSummaryStats === 'function') {
      const filteredData = window.getFilteredTableData
        ? window.getFilteredTableData('trades', { asReference: true })
        : window.tradesData;
      window.updatePageSummaryStats('trades', filteredData || window.tradesData);
    } else {
      window.Logger?.warn('updatePageSummaryStats not available', { page: "trades" });
    }
  } catch (error) {
    window.Logger?.error('Error updating table stats:', error, { page: "trades" });
  }
}

/**
 * Add buy/sell transaction to trade (placeholder - in development)
 * 
 * @function addEditBuySell
 * @returns {void}
 */
function addEditBuySell() {
  try {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('בפיתוח', 'הפונקציונליות להוספת עסקת קניה/מכירה לטרייד נמצאת כרגע בפיתוח');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('בפיתוח', 'info');
    }
    window.Logger?.debug('addEditBuySell called - feature in development', { page: "trades" });
  } catch (error) {
    window.Logger?.error('Error in addEditBuySell:', error, { page: "trades" });
  }
}

// Export - safe because we only call updatePageSummaryStats, not updateTableStats
window.updateTableStats = updateTableStats;
window.loadTradePlanDates = loadTradePlanDates;
window.addEditBuySell = addEditBuySell;

/**
 * Initialize conditions system for trades
 * Uses global ConditionsInitializer from conditions package
 */
function initializeTradeConditionsSystem() {
  try {
    // First check if conditionsSystem is already available (most reliable check)
    if (window.conditionsSystem && window.conditionsSystem.initializer) {
      window.Logger?.info('✅ Conditions system already initialized for trades', { page: "trades" });
      return true;
    }
    
    const initializerInstance = (() => {
      if (window.conditionsInitializer && typeof window.conditionsInitializer.initialize === 'function') {
        return window.conditionsInitializer;
      }
      if (typeof window.ConditionsInitializer === 'function') {
        try {
          return new window.ConditionsInitializer();
        } catch (error) {
          window.Logger?.warn('Error creating ConditionsInitializer instance:', error, { page: "trades" });
          return null;
        }
      }
      return null;
    })();

    if (initializerInstance && typeof initializerInstance.initialize === 'function') {
      const afterInit = () => {
        if (window.conditionsCRUDManager) {
          window.conditionsCRUDManager.setContext({ entityType: 'trade' });
          window.conditionsCRUDManager.getTradingMethods();
        }
        window.Logger?.info('✅ Trades conditions system initialized successfully', { page: "trades" });
      };

      const initResult = initializerInstance.initialize();
      if (initResult && typeof initResult.then === 'function') {
        initResult.then(afterInit).catch(error => {
          window.Logger?.error('Error initializing trades conditions system:', error, { page: "trades" });
        });
      } else if (initResult !== false) {
        afterInit();
      }
      return true;
    }
    
    // If not available immediately, try deferred check
    setTimeout(() => {
      if (window.conditionsSystem && window.conditionsSystem.initializer) {
        window.Logger?.info('✅ Conditions system initialized for trades (deferred check)', { page: "trades" });
        return true;
      } else {
        // Only log debug level - conditions system is optional
        window.Logger?.debug('ConditionsInitializer not available after deferred check - conditions package may not be loaded', { page: "trades" });
      }
    }, 500);
    
    return false;
  } catch (error) {
    window.Logger?.error('Error in initializeTradeConditionsSystem:', error, { page: "trades" });
    return false;
  }
}

window.initializeTradeConditionsSystem = initializeTradeConditionsSystem;

function getTradesModalElement() {
  return document.getElementById('tradesModal');
}

function getTradeModalEntityName(modalElement) {
  if (!modalElement) {
    return '';
  }
  if (modalElement.dataset.entityName && modalElement.dataset.entityName.trim() !== '') {
    return modalElement.dataset.entityName;
  }
  const tickerSelect = modalElement.querySelector('#tradeTicker');
  if (tickerSelect && tickerSelect.selectedOptions.length > 0) {
    const tickerName = tickerSelect.selectedOptions[0].textContent?.trim();
    if (tickerName) {
      modalElement.dataset.entityName = tickerName;
      return tickerName;
    }
  }
  return '';
}

async function openTradeConditionsModal(modalElement, options = {}) {
  if (!modalElement) {
    window.Logger?.error('Trades modal element not found while opening conditions', {}, { page: 'trades' });
    window.showNotification?.('מודול הטריידים לא זמין כרגע.', 'error');
    return;
  }
  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    window.showNotification?.('יש לשמור את הטרייד לפני ניהול תנאים.', 'info');
    return;
  }
  const entityName = getTradeModalEntityName(modalElement);
  const { focusConditionId = null, layoutMode = 'form-only' } = options;
  if (!window.conditionsModalController?.open) {
    window.showNotification?.('מודול התנאים אינו זמין כעת.', 'error');
    return;
  }
  try {
    await window.conditionsModalController.open({
      entityType: 'trade',
      entityId: Number(entityId),
      entityName,
      parentModalId: modalElement.id,
      focusConditionId,
      layoutMode
    });
  } catch (error) {
    window.Logger?.error('Failed to open trade conditions modal', { error: error?.message }, { page: 'trades' });
    window.showNotification?.('שגיאה בפתיחת מודול התנאים.', 'error');
  }
}

async function handleTradeConditionsButtonClick() {
  const modalElement = getTradesModalElement();
  await openTradeConditionsModal(modalElement);
}

window.handleTradeConditionsButtonClick = handleTradeConditionsButtonClick;

async function handleTradeConditionSummaryEdit(conditionId) {
  const modalElement = getTradesModalElement();
  if (!modalElement) {
    window.showNotification?.('מודול הטריידים לא זמין כרגע.', 'error');
    return;
  }
  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    window.showNotification?.('נדרש לשמור את הטרייד לפני עריכת תנאים.', 'info');
    return;
  }
  const numericConditionId = Number(conditionId);
  if (!Number.isFinite(numericConditionId)) {
    window.Logger?.warn('handleTradeConditionSummaryEdit called without valid condition id', { conditionId }, { page: 'trades' });
    return;
  }
  await openTradeConditionsModal(modalElement, { focusConditionId: numericConditionId });
}

async function handleTradeConditionSummaryDelete(conditionId) {
  const modalElement = getTradesModalElement();
  if (!modalElement) {
    window.showNotification?.('מודול הטריידים לא זמין כרגע.', 'error');
    return;
  }
  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    window.showNotification?.('נדרש לשמור את הטרייד לפני מחיקת תנאים.', 'info');
    return;
  }
  const numericConditionId = Number(conditionId);
  if (!Number.isFinite(numericConditionId)) {
    window.Logger?.warn('handleTradeConditionSummaryDelete called without valid condition id', { conditionId }, { page: 'trades' });
    return;
  }

  const renderer = window.ConditionsSummaryRenderer;
  const cachedCondition = renderer?.getCondition?.('trade', entityId, numericConditionId);
  const confirmed = renderer?.confirmDeletion
    ? await renderer.confirmDeletion(cachedCondition)
    : window.confirm('האם למחוק את התנאי הנבחר?');
  if (!confirmed) {
    return;
  }

  if (isConditionsModalOpen('trade', entityId) && window.conditionsUIManager?.handleDeleteCondition) {
    await window.conditionsUIManager.handleDeleteCondition(numericConditionId, { skipConfirm: true });
    return;
  }

  if (renderer?.deleteConditionViaCrud) {
    await renderer.deleteConditionViaCrud('trade', numericConditionId, entityId);
  } else {
    await deleteConditionViaCrud(numericConditionId, entityId, 'trade');
  }
}

window.handleTradeConditionSummaryEdit = handleTradeConditionSummaryEdit;
window.handleTradeConditionSummaryDelete = handleTradeConditionSummaryDelete;

/**
 * Evaluate single trade condition
 * @param {number|string} conditionId - Condition ID
 * @returns {Promise<Object>} Evaluation result
 */
async function evaluateSingleTradeCondition(conditionId) {
  if (!conditionId) {
    throw new Error('מזהה תנאי חסר');
  }
  const response = await fetch(`/api/trade-conditions/${conditionId}/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload?.message || 'שגיאה בבדיקת התנאי';
    throw new Error(message);
  }
  const payload = await response.json();
  return normalizeConditionEvaluationPayload(payload?.data || payload);
}

/**
 * Handle trade condition row evaluate
 * @param {number|string} conditionId - Condition ID
 * @returns {Promise<void>}
 */
async function handleTradeConditionRowEvaluate(conditionId) {
  if (!conditionId) {
    return;
  }
  const modalElement = getTradesModalElement();
  if (!modalElement) {
    window.showNotification?.('מודול הטריידים לא זמין כרגע.', 'error');
    return;
  }
  const renderer = window.ConditionsSummaryRenderer;
  const translator = window.conditionsTranslations;
  const button = document.querySelector(`[data-condition-evaluate="${conditionId}"]`);
  renderer?.setButtonLoadingState?.(button, true);
  try {
    const payload = await evaluateSingleTradeCondition(conditionId);
    if (payload) {
      renderer?.setEvaluation?.('trade', Number(conditionId), payload);
      const successMessage = translator?.getMessage?.('single_condition_evaluated') || 'התנאי נבדק בהצלחה.';
      window.showNotification?.(successMessage, 'success');
    }
  } catch (error) {
    window.Logger?.error('handleTradeConditionRowEvaluate failed', { error: error?.message, conditionId }, { page: 'trades' });
    const errorMessage = translator?.getMessage?.('single_condition_evaluate_error') || 'שגיאה בבדיקת התנאי.';
    window.showNotification?.(errorMessage, 'error');
    renderer?.setEvaluation?.('trade', Number(conditionId), { error: errorMessage });
  } finally {
    renderer?.setButtonLoadingState?.(button, false);
    const refreshedModal = getTradesModalElement();
    if (refreshedModal) {
      loadTradeConditionsSummary(refreshedModal, { showLoading: false });
    }
  }
}

window.handleTradeConditionRowEvaluate = handleTradeConditionRowEvaluate;

async function handleTradeConditionToggleAlerts(conditionId) {
  if (!conditionId) {
    return;
  }
  const modalElement = getTradesModalElement();
  if (!modalElement) {
    window.showNotification?.('מודול הטריידים לא זמין כרגע.', 'error');
    return;
  }
  const renderer = window.ConditionsSummaryRenderer;
  const translator = window.conditionsTranslations;
  const button = document.querySelector(`[data-condition-toggle="${conditionId}"]`);
  renderer?.setButtonLoadingState?.(button, true);
  try {
    const response = await fetch(`/api/trade-conditions/${conditionId}/alert/toggle`, {
      method: 'POST'
    });
    const payload = await response.json();
    if (!response.ok || payload?.status === 'error') {
      throw new Error(payload?.message || 'toggle_failed');
    }
    const isEnabled = payload?.data?.auto_generate_alerts !== false;
    const messageKey = isEnabled ? 'auto_alerts_enabled' : 'auto_alerts_disabled';
    const notification = translator?.getMessage?.(messageKey)
      || (isEnabled ? 'התראות אוטומטיות הופעלו.' : 'התראות אוטומטיות כובו.');
    window.showNotification?.(notification, 'success');
  } catch (error) {
    window.Logger?.error('handleTradeConditionToggleAlerts failed', { error: error?.message, conditionId }, { page: 'trades' });
    const errorMessage = translator?.getMessage?.('auto_alerts_toggle_error') || 'שגיאה בעדכון מצב ההתראות.';
    window.showNotification?.(errorMessage, 'error');
  } finally {
    renderer?.setButtonLoadingState?.(button, false);
    const refreshedModal = getTradesModalElement();
    if (refreshedModal) {
      loadTradeConditionsSummary(refreshedModal, { showLoading: false });
    }
  }
}

window.handleTradeConditionToggleAlerts = handleTradeConditionToggleAlerts;

async function handleTradeEvaluateConditionsClick() {
  const modalElement = getTradesModalElement();
  if (!modalElement) {
    window.showNotification?.('מודול הטריידים לא זמין כרגע.', 'error');
    return;
  }
  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    window.showNotification?.('יש לשמור את הטרייד לפני בדיקת תנאים.', 'info');
    return;
  }

  window.ConditionsSummaryRenderer?.setButtonLoadingStateById?.('tradeEvaluateConditionsButton', true);
  try {
    const conditions = await getTradeConditionsForEvaluation(entityId);
    if (!Array.isArray(conditions) || !conditions.length) {
      window.showNotification?.('אין תנאים פעילים לטרייד זה.', 'info');
      return;
    }

    const evaluationResults = await Promise.all(
      conditions
        .filter(condition => condition?.id)
        .map(condition => evaluateSingleTradeCondition(condition.id)
          .then(payload => ({
            conditionId: condition.id,
            payload
          }))
          .catch(error => ({
            conditionId: condition.id,
            error: error?.message || 'evaluation_failed'
          })))
    );

    const renderer = window.ConditionsSummaryRenderer;
    let successCount = 0;
    let errorCount = 0;

    evaluationResults.forEach(result => {
      if (!result || !result.conditionId) {
        return;
      }
      if (result.error) {
        errorCount += 1;
        renderer?.setEvaluation?.('trade', Number(result.conditionId), { error: result.error });
        return;
      }
      if (result.payload) {
        successCount += 1;
        renderer?.setEvaluation?.('trade', Number(result.conditionId), result.payload);
      }
    });

    if (successCount) {
      window.showNotification?.(`נבדקו ${successCount} תנאים בהצלחה.`, 'success');
    }
    if (errorCount) {
      window.showNotification?.(`${errorCount} תנאים לא נבדקו.`, 'warning');
    }
  } catch (error) {
    window.Logger?.error('handleTradeEvaluateConditionsClick failed', { error, page: 'trades' });
    window.showNotification?.('שגיאה בבדיקת התנאים.', 'error');
  } finally {
    window.ConditionsSummaryRenderer?.setButtonLoadingStateById?.('tradeEvaluateConditionsButton', false);
    const refreshedModal = getTradesModalElement();
    if (refreshedModal) {
      loadTradeConditionsSummary(refreshedModal, { showLoading: false });
    }
  }
}

window.handleTradeEvaluateConditionsClick = handleTradeEvaluateConditionsClick;

/**
 * Get trade conditions for evaluation
 * @param {number|string} entityId - Entity ID
 * @returns {Promise<Array>} Array of conditions
 */
async function getTradeConditionsForEvaluation(entityId) {
  const numericId = Number(entityId);
  const cached = window.ConditionsSummaryRenderer?.getConditions?.('trade', numericId);
  if (Array.isArray(cached) && cached.length) {
    return cached;
  }
  const response = await fetch(`/api/trade-conditions/trades/${entityId}/conditions`);
  if (!response.ok) {
    throw new Error('טעינת התנאים נכשלה');
  }
  const payload = await response.json();
  const data = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
  if (Array.isArray(data)) {
    window.ConditionsSummaryRenderer?.setConditions?.('trade', numericId, data);
  }
  return data;
}

async function loadTradeConditionsSummary(modalElement, { showLoading = true } = {}) {
  const summaryContainer = modalElement?.querySelector('#tradeConditionsSummary');
  if (!summaryContainer) {
    return;
  }

  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    delete summaryContainer.dataset.entityId;
    summaryContainer.innerHTML = '<div class="text-muted small mb-0">נדרש לשמור את הטרייד לפני שניתן להציג תנאים.</div>';
    window.ConditionsSummaryRenderer?.clearCache?.('trade', null);
    return;
  }

  summaryContainer.dataset.entityId = entityId;
  const crudManager = window.conditionsCRUDManager;
  if (!crudManager) {
    summaryContainer.innerHTML = '<div class="text-muted small mb-0">מערכת התנאים אינה זמינה כעת.</div>';
    return;
  }

  if (showLoading) {
    summaryContainer.innerHTML = `
      <div class="text-center text-muted py-2">
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        טוען תנאים פעילים...
      </div>
    `;
  }

  try {
    crudManager.setContext?.({ entityType: 'trade' });
    const conditions = await crudManager.readConditions(Number(entityId), true);
    const activeConditions = (conditions || []).filter(condition => condition?.is_active !== false);
    window.ConditionsSummaryRenderer?.setConditions?.('trade', Number(entityId), activeConditions);

    if (!activeConditions.length) {
      summaryContainer.innerHTML = '<div class="text-muted small mb-0">אין תנאים פעילים לטרייד זה.</div>';
      return;
    }

    summaryContainer.innerHTML = window.ConditionsSummaryRenderer?.buildTable?.('trade', activeConditions, {
      edit: 'handleTradeConditionSummaryEdit',
      delete: 'handleTradeConditionSummaryDelete',
      evaluate: 'handleTradeConditionRowEvaluate',
      toggle: 'handleTradeConditionToggleAlerts'
    }) || '<div class="text-muted small mb-0">לא נמצא Renderer להצגת תנאים.</div>';
    if (window.ButtonSystem?.processButtons) {
      window.ButtonSystem.processButtons(summaryContainer);
    } else if (window.ButtonSystem?.hydrateButtons) {
      window.ButtonSystem.hydrateButtons(summaryContainer);
    }
  } catch (error) {
    window.Logger?.error('Failed to load trade conditions summary', { error: error?.message, entityId }, { page: 'trades' });
    summaryContainer.innerHTML = '<div class="alert alert-warning py-2 px-2 mb-0 small">שגיאה בטעינת תנאים פעילים. נסה שוב.</div>';
  }
}

function setupTradeConditionsButton(modalElement) {
  window.Logger?.info('setupTradeConditionsButton invoked', { modalId: modalElement?.id, mode: modalElement?.dataset?.modalMode || modalElement?.dataset?.mode }, { page: 'trades' });
  if (!modalElement) {
    return;
  }

  const controlsWrapper = modalElement.querySelector('[data-conditions-controls="trade"]');
  if (!controlsWrapper || controlsWrapper.dataset.initialized === 'true') {
    return;
  }

  if (window.ButtonSystem?.processButtons) {
    window.ButtonSystem.processButtons(controlsWrapper);
  } else if (window.ButtonSystem?.hydrateButtons) {
    window.ButtonSystem.hydrateButtons(controlsWrapper);
  }

  const summaryContainer = controlsWrapper.querySelector('#tradeConditionsSummary');
  const disabledHint = controlsWrapper.querySelector('[data-conditions-disabled-hint]');
  const openButton = document.getElementById('tradeOpenConditionsButton');
  const evaluateButton = document.getElementById('tradeEvaluateConditionsButton');
  const tickerSelect = modalElement.querySelector('#tradeTicker');

  const updateButtonState = () => {
    const isEnabled = Boolean(modalElement.dataset.entityId);
    if (openButton) {
      openButton.toggleAttribute('disabled', !isEnabled);
      openButton.setAttribute('aria-disabled', isEnabled ? 'false' : 'true');
    }
    if (evaluateButton) {
      evaluateButton.toggleAttribute('disabled', !isEnabled);
      evaluateButton.setAttribute('aria-disabled', isEnabled ? 'false' : 'true');
    }
    if (disabledHint) {
      disabledHint.classList.toggle('d-none', Boolean(isEnabled));
    }

    if (summaryContainer) {
      if (isEnabled) {
        loadTradeConditionsSummary(modalElement);
      } else {
        delete summaryContainer.dataset.entityId;
        summaryContainer.innerHTML = '<div class="text-muted small mb-0">נדרש לשמור את הטרייד לפני שניתן להציג תנאים.</div>';
      }
    }
  };

  if (tickerSelect && !tickerSelect.dataset.conditionsNameBound) {
    tickerSelect.addEventListener('change', () => {
      getTradeModalEntityName(modalElement);
      updateButtonState();
    });
    tickerSelect.dataset.conditionsNameBound = 'true';
  }

  modalElement.addEventListener('modal:entity-context-changed', updateButtonState);
  modalElement.addEventListener('modal:entity-context-reset', () => {
    modalElement.dataset.entityId = '';
    modalElement.dataset.entityName = '';
    window.ConditionsSummaryRenderer?.clearCache?.('trade', null);
    updateButtonState();
  });

  if (!modalElement.__tradeConditionsUpdatedListener) {
    modalElement.__tradeConditionsUpdatedListener = (event) => {
      const detail = event.detail || {};
      if (detail.entityType !== 'trade' || !detail.tradeId) {
        return;
      }
      if (String(detail.tradeId) === String(modalElement.dataset.entityId)) {
        loadTradeConditionsSummary(modalElement, { showLoading: false });
      }
    };
    window.addEventListener('tradePlanConditionsUpdated', modalElement.__tradeConditionsUpdatedListener);
  }

  controlsWrapper.dataset.initialized = 'true';
  updateButtonState();
  window.Logger?.info('Trade conditions controls ready', { entityId: modalElement.dataset.entityId, mode: modalElement.dataset.modalMode || modalElement.dataset.mode }, { page: 'trades' });
}

window.setupTradeConditionsButton = setupTradeConditionsButton;

// ===== SORTING AND FILTERING FUNCTIONS =====
// Table sorting, filtering, and state management

/**
 * Setup sort event listeners for trades table
 * Configures sortable headers for table columns
 * 
 * @function setupSortEventListeners
 * @returns {void}
 */
/**
 * Setup sort event listeners
 * Note: This function is deprecated - all sortable headers now use data-onclick attributes
 * Kept for backward compatibility but does nothing (headers use EventHandlerManager)
 */
function setupSortEventListeners() {
  // Deprecated: All sortable headers now use data-onclick attributes
  // EventHandlerManager handles clicks automatically via event delegation
  // This function is kept for backward compatibility but does nothing
  if (window.Logger) {
    window.Logger.debug('setupSortEventListeners called but is deprecated - using data-onclick instead', { page: "trades" });
  }
}

// הוסר - המערכת המאוחדת מטפלת באתחול
// קריאה לטעינת נתונים כשהדף נטען
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', function () {
//     // הוספת event listeners
//     setupSortEventListeners();
//     setTimeout(() => {
//       if (typeof window.loadTradesData === 'function') {
//         window.loadTradesData();
//       }
//     }, 1000);
//   });
// } else {
//   // הדף כבר נטען
//   // טעינת מצב הסידור השמור
//   loadTradesSortState();
//   // הוספת event listeners
//   setupSortEventListeners();
//   setTimeout(() => {
//     if (typeof window.loadTradesData === 'function') {
//       window.loadTradesData();
//     }
//   }, 1000);
// }

/**
 * בדיקת התאמת תוכנית טרייד לטרייד
 */
async function validateTradePlanChange(newTradePlanId, tradeData) {
  if (!newTradePlanId) {
    return { isValid: true, message: '' }; // ללא תוכנית - תקין
  }

  try {
    // קבלת פרטי התוכנית החדשה
    // Use relative URL to work with both development (8080) and production (5001)
    const url = `/api/trade-plans/${newTradePlanId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('שגיאה בטעינת פרטי התוכנית');
    }

    const tradePlan = await response.json();
    // בדיקה 1: התאמת טיקר
    if (tradePlan.data.ticker_id !== tradeData.ticker_id) {
      const errorMessage = `התוכנית החדשה מקושרת לטיקר ${tradePlan.data.ticker?.symbol || 'שונה'} ואילו הטרייד מקושר לטיקר ${tradeData.ticker_symbol || 'שונה'}. לא ניתן לקשר תוכנית לטיקר אחר.`;
      return {
        isValid: false,
        message: errorMessage,
      };
    }

    // בדיקה 2: התאמת צד (Long/Short)
    if (tradePlan.data.side !== tradeData.side) {
      return {
        isValid: false,
        message: `התוכנית החדשה היא ${tradePlan.data.side === 'Long' ? 'Long' : 'Short'} ואילו הטרייד הוא ${tradeData.side === 'Long' ? 'Long' : 'Short'}. לא ניתן לקשר תוכנית לצד אחר.`,
      };
    }

    // בדיקה 3: תאריך יצירת התוכנית לא מאוחר מתאריך פתיחת הטרייד
    if ((tradePlan.data.created_at || tradePlan.data.created_at_envelope) && (tradeData.opened_at || tradeData.opened_at_envelope)) {
      const planCreatedEnvelope = window.dateUtils?.ensureDateEnvelope
        ? window.dateUtils.ensureDateEnvelope(tradePlan.data.created_at_envelope || tradePlan.data.created_at)
        : (tradePlan.data.created_at_envelope || tradePlan.data.created_at);
      const tradeOpenedEnvelope = window.dateUtils?.ensureDateEnvelope
        ? window.dateUtils.ensureDateEnvelope(tradeData.opened_at_envelope || tradeData.opened_at)
        : (tradeData.opened_at_envelope || tradeData.opened_at);

      const planCreatedAt = window.dateUtils?.toDateObject
        ? window.dateUtils.toDateObject(planCreatedEnvelope)
        : (planCreatedEnvelope ? new Date(planCreatedEnvelope) : null);
      const tradeOpenedAt = window.dateUtils?.toDateObject
        ? window.dateUtils.toDateObject(tradeOpenedEnvelope)
        : (tradeOpenedEnvelope ? new Date(tradeOpenedEnvelope) : null);

      if (planCreatedAt && tradeOpenedAt && planCreatedAt > tradeOpenedAt) {
        return {
          isValid: false,
          message: `תאריך יצירת התוכנית (${window.formatDate ? window.formatDate(planCreatedAt) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(planCreatedAt) : planCreatedAt.toLocaleDateString('he-IL'))}) מאוחר מתאריך פתיחת הטרייד (${window.formatDate ? window.formatDate(tradeOpenedAt) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(tradeOpenedAt) : tradeOpenedAt.toLocaleDateString('he-IL'))}). לא ניתן לקשר תוכנית שנוצרה אחרי פתיחת הטרייד.`,
        };
      }
    }

    return { isValid: true, message: '' };

  } catch {
    handleValidationError('trade plan', 'שגיאה בבדיקת התוכנית');
    return {
      isValid: false,
      message: 'שגיאה בבדיקת התוכנית. אנא נסה שוב.',
    };
  }
}

/**
 * בדיקת שינויים בטרייד לפני שמירה
 */
async function validateTradeChanges(originalTrade, updatedTrade) {
  try {
  const validations = [];

  // בדיקת שינוי תוכנית טרייד
  const originalPlanId = originalTrade.trade_plan_id ? parseInt(originalTrade.trade_plan_id) : null;
  const updatedPlanId = updatedTrade.trade_plan_id ? parseInt(updatedTrade.trade_plan_id) : null;

  // בדיקה אם יש שינוי אמיתי (לא רק null vs null)
  if (originalPlanId !== updatedPlanId && (originalPlanId !== null || updatedPlanId !== null)) {
    // בדיקת ולידציה של תוכנית טרייד
    const planValidation = await validateTradePlanChange(updatedPlanId, updatedTrade);
    if (!planValidation.isValid) {
      validations.push(planValidation.message);
    }

    // בדיקת תאריך תוכנית טרייד
    const dateValidation = await validateTradePlanDate(updatedPlanId, originalTrade);
    if (!dateValidation.isValid) {
      validations.push(dateValidation.message);
    }
  }

  // בדיקת שינוי טיקר
  const originalTickerId = originalTrade.ticker_id ? parseInt(originalTrade.ticker_id) : null;
  const updatedTickerId = updatedTrade.ticker_id ? parseInt(updatedTrade.ticker_id) : null;

  if (originalTickerId !== updatedTickerId && (originalTickerId !== null || updatedTickerId !== null)) {
    const tickerValidation = await validateTickerChange(updatedTickerId, originalTrade);
    if (!tickerValidation.isValid) {
      validations.push(tickerValidation.message);
    }
  }

  // בדיקת פוזיציה בעדכון סטטוס
  if (updatedTrade.status === 'closed' && originalTrade.status !== 'closed') {
    const positionValidation = validateTradeStatusChange(updatedTrade.status, updatedTrade);
    if (!positionValidation) {
      validations.push('ביטול שמירה עקב בדיקת פוזיציה');
    }
  }

  // בדיקת תאריכים - תאריך סגירה לא יכול להיות לפני תאריך יצירה
  if ((updatedTrade.opened_at || updatedTrade.opened_at_envelope) && (updatedTrade.closed_at || updatedTrade.closed_at_envelope)) {
    const openedEnvelope = window.dateUtils?.ensureDateEnvelope
      ? window.dateUtils.ensureDateEnvelope(updatedTrade.opened_at_envelope || updatedTrade.opened_at)
      : (updatedTrade.opened_at_envelope || updatedTrade.opened_at);
    const closedEnvelope = window.dateUtils?.ensureDateEnvelope
      ? window.dateUtils.ensureDateEnvelope(updatedTrade.closed_at_envelope || updatedTrade.closed_at)
      : (updatedTrade.closed_at_envelope || updatedTrade.closed_at);

    const openedAt = window.dateUtils?.toDateObject
      ? window.dateUtils.toDateObject(openedEnvelope)
      : (openedEnvelope ? new Date(openedEnvelope) : null);
    const closedAt = window.dateUtils?.toDateObject
      ? window.dateUtils.toDateObject(closedEnvelope)
      : (closedEnvelope ? new Date(closedEnvelope) : null);

    if (openedAt && closedAt && closedAt < openedAt) {
      validations.push(`תאריך סגירה (${window.formatDate ? window.formatDate(closedAt) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(closedAt) : closedAt.toLocaleDateString('he-IL'))}) לא יכול להיות לפני תאריך יצירה (${window.formatDate ? window.formatDate(openedAt) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(openedAt) : openedAt.toLocaleDateString('he-IL'))})`);
    }
  }

  return validations;
  } catch (error) {
    window.Logger.error('Error in validateTradeChanges:', error, { originalTrade, updatedTrade, page: "trades" });
    return ['שגיאה בבדיקת השינויים'];
  }
}

// ולידציה של תאריכים - משתמשת בפונקציות הכלליות מ-validation-utils.js

// ===== פונקציות פילטר לטבלת טריידים =====

/**
 * פונקציה לטיפול בפילטר סטטוס לטבלת טריידים
 */
async function applyStatusFilterToTrades(selectedStatuses) {
  try {
  if (!window.tradesData || !Array.isArray(window.tradesData)) {
      // window.Logger.warn('⚠️ No trades data available for filtering', { page: "trades" });
    return;
  }

  let filteredTrades = [...window.tradesData];

  // אם יש בחירות ספציפיות (לא "הכול")
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('הכול')) {
    // המרת ערכים עבריים לאנגלית
    const statusMapping = {
      'פתוח': 'open',
      'סגור': 'closed',
      'מבוטל': 'cancelled',
    };

    const englishStatuses = selectedStatuses.map(status => statusMapping[status] || status);

    filteredTrades = filteredTrades.filter(trade => {
      const tradeStatus = trade.status || 'open';
      return englishStatuses.includes(tradeStatus);
    });

    // Status filter applied
  }

  // עדכון הטבלה עם הנתונים המסוננים
  setTradesFilteredDataset(filteredTrades);
  } catch (error) {
    window.Logger.error('Error in applyStatusFilterToTrades:', error, { selectedStatuses, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בסינון הטריידים');
    }
  }
}

// ייצוא פונקציות פילטר לגלובל
window.applyStatusFilterToTrades = applyStatusFilterToTrades;
// ייצוא פונקציות ולידציה חדשות
window.validateTickerChange = validateTickerChange;
window.validateTradePlanDate = validateTradePlanDate;
window.showTickerChangeConfirmation = showTickerChangeConfirmation;

// ייצוא פונקציות עדכון מחירים
window.updateEditTradeTickerFromPlan = updateEditTradeTickerFromPlan;
window.updateEditTradePriceFromTicker = updateEditTradePriceFromTicker;

/**
 * בדיקת שינוי טיקר בטרייד
 * @param {string} newTickerId - מזהה הטיקר החדש
 * @param {object} tradeData - נתוני הטרייד הנוכחי
 * @returns {Promise<object>} תוצאות הוולידציה
 */
async function validateTickerChange(newTickerId, tradeData) {
  if (!newTickerId || !tradeData.ticker_id) {
    return { isValid: true, message: '' };
  }

  const originalTickerId = parseInt(tradeData.ticker_id);
  const updatedTickerId = parseInt(newTickerId);

  // בדיקה אם הטיקר השתנה
  if (originalTickerId === updatedTickerId) {
    return { isValid: true, message: '' };
  }

  try {
    // קבלת פרטי הטיקר המקורי והחדש
    const [originalTickerResponse, newTickerResponse] = await Promise.all([
      fetch(`/api/tickers/${originalTickerId}`),
      fetch(`/api/tickers/${updatedTickerId}`),
    ]);

    if (!originalTickerResponse.ok || !newTickerResponse.ok) {
      throw new Error('שגיאה בקבלת פרטי טיקרים');
    }

    const originalTicker = await originalTickerResponse.json();
    const newTicker = await newTickerResponse.json();

    const originalSymbol = originalTicker.data?.symbol || 'לא ידוע';
    const newSymbol = newTicker.data?.symbol || 'לא ידוע';

    // הצגת דיאלוג אישור
    const confirmed = await showTickerChangeConfirmation(originalSymbol, newSymbol);

    return {
      isValid: confirmed,
      message: confirmed ? '' : 'המשתמש ביטל את שינוי הטיקר',
    };

  } catch {
    handleValidationError('ticker change', 'שגיאה בבדיקת שינוי טיקר');
    return {
      isValid: false,
      message: 'שגיאה בבדיקת הטיקר. אנא נסה שוב.',
    };
  }
}

/**
 * הצגת דיאלוג אישור לשינוי טיקר
 * @param {string} originalSymbol - סימבול הטיקר המקורי
 * @param {string} newSymbol - סימבול הטיקר החדש
 * @returns {Promise<boolean>} האם המשתמש אישר את השינוי
 */
function showTickerChangeConfirmation(originalSymbol, newSymbol) {
  try {
    return new Promise(resolve => {
      const message = 'האם אתה בטוח שברצונך לשנות את הטיקר מ-' + originalSymbol + ' ל-' + newSymbol + '?\n\n' +
        'שינוי טיקר בטרייד קיים עלול להשפיע על:\n' +
        '• חישובי רווח/הפסד\n' +
        '• קישור לתוכניות טרייד\n' +
        '• נתוני מעקב היסטוריים\n\n' +
        'האם להמשיך בשינוי?';

      if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
          'שינוי טיקר בטרייד',
          message,
          'אשר שינוי',
          'ביטול',
          () => resolve(true),
          () => resolve(false),
        );
      } else {
        // Fallback לדיאלוג פשוט
        if (typeof window.showConfirmationDialog === 'function') {
          window.showConfirmationDialog(
            'אישור',
            message,
            confirmed => resolve(confirmed),
            () => resolve(false),
          );
        } else {
          if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
              'אישור',
              message,
              confirmed => resolve(confirmed),
              () => resolve(false),
            );
          } else {
            // Fallback למקרה שמערכת התראות לא זמינה
            const confirmed = window.confirm(message);
            resolve(confirmed);
          }
          resolve(confirmed);
        }
      }
    });
  } catch (error) {
    window.Logger.error('Error in showTickerChangeConfirmation:', error, { originalSymbol, newSymbol, page: "trades" });
    return Promise.resolve(false);
  }
}

/**
 * בדיקת תאריך תוכנית טרייד לעומת תאריך הטרייד
 * @param {string} tradePlanId - מזהה תוכנית הטרייד
 * @param {object} tradeData - נתוני הטרייד
 * @returns {Promise<object>} תוצאות הוולידציה
 */
async function validateTradePlanDate(tradePlanId, tradeData) {
  if (!tradePlanId || !tradeData.created_at) {
    return { isValid: true, message: '' };
  }

  try {
    // קבלת פרטי תוכנית הטרייד
    const response = await fetch(`/api/trade-plans/${tradePlanId}`);
    if (!response.ok) {
      throw new Error('שגיאה בקבלת פרטי תוכנית טרייד');
    }

    const tradePlan = await response.json();
    const planCreatedAt = new Date(tradePlan.data.created_at);
    const tradeCreatedAt = new Date(tradeData.created_at);

    // בדיקה אם תאריך יצירת התוכנית מאוחר מתאריך יצירת הטרייד
    if (planCreatedAt > tradeCreatedAt) {
      return {
        isValid: false,
        message: `לא ניתן לקשר תוכנית טרייד שנוצרה בתאריך ${window.formatDate ? window.formatDate(planCreatedAt) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(planCreatedAt) : planCreatedAt.toLocaleDateString('he-IL'))} לטרייד שנוצר בתאריך ${window.formatDate ? window.formatDate(tradeCreatedAt) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(tradeCreatedAt) : tradeCreatedAt.toLocaleDateString('he-IL'))}. תאריך יצירת התוכנית לא יכול להיות מאוחר מתאריך יצירת הטרייד.`,
      };
    }

    return { isValid: true, message: '' };

  } catch {
    handleValidationError('trade plan date', 'שגיאה בבדיקת תאריך תוכנית טרייד');
    return {
      isValid: false,
      message: 'שגיאה בבדיקת תאריך התוכנית. אנא נסה שוב.',
    };
  }
}

/**
 * עדכון טיקר במודל העריכה לפי תוכנית טרייד נבחרת
 * @param {string} tradePlanId - מזהה תוכנית הטרייד
 */
async function updateEditTradeTickerFromPlan(tradePlanId) {
  if (!tradePlanId) {
    return;
  }

  // בדיקה אם השדה נוקה על ידי המערכת
  const tradePlanSelect = document.getElementById('editTradeTradePlanId');
  if (tradePlanSelect && tradePlanSelect.getAttribute('data-cleared') === 'true') {
    // השדה נוקה על ידי המערכת - לא לבצע עדכון
    tradePlanSelect.removeAttribute('data-cleared');
    return;
  }

  try {
    // קבלת פרטי התוכנית
    const response = await fetch(`/api/trade-plans/${tradePlanId}`);
    if (!response.ok) {
      throw new Error('שגיאה בקבלת פרטי תוכנית טרייד');
    }

    const tradePlan = await response.json();
    const plan = tradePlan.data;

    // בדיקה אם הטיקר שונה מהמקורי
    const originalTrade = window.currentEditTrade;
    const originalTickerId = originalTrade?.ticker_id;


    // בדיקה אם יש טיקר מקורי והטיקר של התוכנית החדשה שונה
    if (originalTickerId && plan.ticker_id && plan.ticker_id.toString() !== originalTickerId.toString()) {
      // שינוי תוכנית עם טיקר שונה - לא נתמך
      window.showErrorNotification(
        'פיצר לא נתמך',
        'שינוי תוכנית טרייד לטיקר שונה עדיין לא נתמך במערכת. אנא בחר תוכנית עם אותו טיקר או הסר את הקישור לתוכנית.',
      );

      // החזרת שדה התוכנית למצבו המקורי
      const editTradePlanSelect = document.getElementById('editTradeTradePlanId');
      if (editTradePlanSelect && originalTrade) {
        if (originalTrade.trade_plan_id) {
          tradePlanSelect.value = originalTrade.trade_plan_id;
        } else {
          tradePlanSelect.value = '';
        }

        // סימון שהשדה הוחזר למצב מקורי
        tradePlanSelect.setAttribute('data-restored', 'true');
      }

      return; // עצירת התהליך
    }

    // עדכון שדות הטיקר - רק אם הטיקר זהה או אם אין טיקר נוכחי
    const tickerDisplay = document.getElementById('editTradeTickerDisplay');
    const tickerIdInput = document.getElementById('editTradeTickerId');

    if (tickerDisplay && plan.ticker_symbol) {
      tickerDisplay.textContent = plan.ticker_symbol;
    }

    if (tickerIdInput && plan.ticker_id) {
      tickerIdInput.value = plan.ticker_id;

      // עדכון מחיר מהטיקר החדש
      await updateEditTradePriceFromTicker(plan.ticker_id);
    }

  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'עדכון טיקר במודל העריכה');
    } else {
      // window.Logger.error('Error updating ticker in edit modal:', error, { page: "trades" });
    }
  }
}

/**
 * עדכון מחיר במודל העריכה לפי טיקר נבחר
 * @param {string} tickerId - מזהה הטיקר
 */
async function updateEditTradePriceFromTicker(tickerId) {
  if (!tickerId) {
    return;
  }

  try {
    const response = await fetch(`/api/tickers/${tickerId}`);
    if (response.ok) {
      const tickerData = await response.json();
      const ticker = tickerData.data;

      // עדכון מחיר נוכחי
      const currentPriceElement = document.getElementById('editTradeCurrentPrice');
      if (currentPriceElement && ticker.current_price) {
        currentPriceElement.textContent = `$${parseFloat(ticker.current_price).toFixed(2)}`;
      }

      // עדכון שינוי יומי
      const dailyChangeElement = document.getElementById('editTradeDailyChange');
      if (dailyChangeElement && ticker.daily_change !== undefined) {
        const dailyChange = parseFloat(ticker.daily_change);
        const dailyChangeValue = dailyChange >= 0 ? `+${dailyChange.toFixed(2)}%` : `${dailyChange.toFixed(2)}%`;
        dailyChangeElement.textContent = dailyChangeValue;

        // צביעה לפי ערך באמצעות המערכת הגלובלית
        const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745', negative: '#dc3545' };
        if (dailyChange >= 0) {
          dailyChangeElement.style.color = colors.positive;
          dailyChangeElement.style.fontWeight = 'bold';
        } else {
          dailyChangeElement.style.color = colors.negative;
          dailyChangeElement.style.fontWeight = 'bold';
        }
      }
    }
  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'עדכון מחיר במודל העריכה');
    } else {
      // window.Logger.error('Error updating price in edit modal:', error, { page: "trades" });
    }
  }
}

/**
 * הפעלה מחדש של טרייד מבוטל
 *
 * @param {string|number} tradeId - מזהה הטרייד
 */
async function reactivateTrade(tradeId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - עריכה    // מציאת הטרייד בנתונים
    const trade = tradesData.find(t => t.id === tradeId);
    if (!trade) {
      if (typeof handleElementNotFound === 'function') {
        handleElementNotFound('trade', 'CRITICAL');
      } else {
        // window.Logger.error('trade not found', { page: "trades" });
      }
      throw new Error('טרייד לא נמצא');
    }

    // Use relative URL to work with both development (8080) and production (5001)
    const response = await fetch(`/api/trades/${tradeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'open',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // הצגת הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('טרייד הופעל מחדש בהצלחה!', '', 4000, 'business');
    } else if (typeof window.showNotification === 'function') {
      window.showSuccessNotification('טרייד הופעל מחדש בהצלחה!', '', 4000, 'business');
    }

    // רענון הטבלה
    await loadTradesData();

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'הפעלה מחדש של טרייד');
    } else {
      // window.Logger.error('Error reactivating trade:', error, { page: "trades" });
    }
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש');
    }
  }
}

/**
 * רענון נתוני טריידים
 * טוען מחדש את כל נתוני הטריידים מהשרת
 */
function refreshTrades() {
  try {
    window.Logger.info('🔄 מרענן נתוני טריידים...', { page: "trades" });
    
    // הצגת אינדיקטור טעינה
    if (typeof window.showNotification === 'function') {
      window.showInfoNotification('מרענן נתוני טריידים...');
    }
    
    // טעינת נתונים מחדש
    loadTradesData();
    
    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('נתוני טריידים רוענו בהצלחה');
    } else if (typeof window.showNotification === 'function') {
      window.showSuccessNotification('נתוני טריידים רוענו בהצלחה');
    }
    
  } catch (error) {
    window.Logger.error('שגיאה ברענון טריידים:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה ברענון טריידים', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה ברענון טריידים');
    }
  }
}

/**
 * עדכון טרייד קיים
 * @param {number} tradeId - מזהה הטרייד
 * @param {Object} tradeData - נתוני הטרייד החדשים
 */
function updateTrade(tradeId, tradeData) {
  try {
    window.Logger.info('📝 מעדכן טרייד:', tradeId, tradeData, { page: "trades" });
    
    // ולידציה בסיסית
    if (!tradeId || !tradeData) {
      throw new Error('נתונים חסרים לעדכון טרייד');
    }
    
    // שליחה לשרת
    fetch('/api/trades/' + tradeId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradeData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('שגיאה בעדכון טרייד');
      }
      return response.json();
    })
    .then(data => {
      window.Logger.info('✅ טרייד עודכן בהצלחה:', data, { page: "trades" });
      
      // רענון הטבלה
      loadTradesData();
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('טרייד עודכן בהצלחה');
      } else if (typeof window.showNotification === 'function') {
        window.showSuccessNotification('טרייד עודכן בהצלחה');
      }
    })
    .catch(error => {
      window.Logger.error('שגיאה בעדכון טרייד:', error, { page: "trades" });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון טרייד', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון טרייד');
      }
    });
    
  } catch (error) {
    window.Logger.error('שגיאה בעדכון טרייד:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טרייד', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טרייד');
    }
  }
}

/**
 * אישור מחיקת טרייד
 * מציג חלון אישור לפני מחיקת טרייד
 * @param {number} tradeId - מזהה הטרייד למחיקה
 */
function confirmDeleteTrade(tradeId) {
  try {
    window.Logger.info('🗑️ מאשר מחיקת טרייד:', tradeId, { page: "trades" });
    
    // חיפוש הטרייד בנתונים
    const trade = window.tradesData.find(t => t.id === tradeId);
    if (!trade) {
      throw new Error('טרייד לא נמצא');
    }
    
    // יצירת הודעת אישור
    const confirmMessage = `האם אתה בטוח שברצונך למחוק את הטרייד?\n\n` +
      `חשבון מסחר: ${trade.account_name || 'לא ידוע'}\n` +
      `טיקר: ${trade.ticker_symbol || 'לא ידוע'}\n` +
      `סכום: ${trade.amount || 'לא ידוע'}`;
    
    // הצגת חלון אישור
    if (confirm(confirmMessage)) {
      // ביצוע המחיקה
      deleteTradeRecord(tradeId);
    }
    
  } catch (error) {
    window.Logger.error('שגיאה באישור מחיקת טרייד:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה באישור מחיקת טרייד', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה באישור מחיקת טרייד');
    }
  }
}

// Detailed Log Functions for Trades Page
/**
 * Generate detailed log for trades page
 * @returns {string} JSON string of detailed log data
 */
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'trades',
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            },
            memory: window.performance.memory ? {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            } : null,
            tradesStats: {
                totalTrades: document.getElementById('totalTrades')?.textContent || 'לא נמצא',
                openTrades: document.getElementById('openTrades')?.textContent || 'לא נמצא',
                closedTrades: document.getElementById('closedTrades')?.textContent || 'לא נמצא',
                totalPL: document.getElementById('totalPL')?.textContent || 'לא נמצא',
                actualData: {
                    totalTradesCount: window.tradesData ? window.tradesData.length : 0,
                    openTradesCount: window.tradesData ? window.tradesData.filter(t => t.status === 'open').length : 0,
                    closedTradesCount: window.tradesData ? window.tradesData.filter(t => t.status === 'closed').length : 0,
                    cancelledTradesCount: window.tradesData ? window.tradesData.filter(t => t.status === 'cancelled').length : 0
                }
            },
            sections: {
                topSection: {
                    title: 'מעקב טריידים',
                    visible: !document.querySelector('.top-section')?.classList.contains('d-none'),
                    alertsCount: document.querySelectorAll('.alert-card').length,
                    summaryStats: document.getElementById('summaryStats')?.textContent || 'לא נמצא',
                    colorDemoVisible: !document.getElementById('tradesColorDemo')?.style.display === 'none',
                    actualContent: {
                        hasHeader: !!document.querySelector('.top-section .section-header'),
                        hasStats: !!document.querySelector('.top-section .summary-stats'),
                        hasFilters: !!document.querySelector('.top-section .filters'),
                        hasButtons: !!document.querySelector('.top-section .action-buttons')
                    }
                },
                contentSection: {
                    title: 'הטריידים שלי',
                    visible: !document.querySelector('.content-section')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('#tradesTable tbody tr').length,
                    tableData: document.querySelector('#tradesContainer')?.textContent?.substring(0, 300) || 'לא נמצא',
                    actualContent: {
                        hasTable: !!document.querySelector('#tradesTable'),
                        hasTableBody: !!document.querySelector('#tradesTable tbody'),
                        hasTableHead: !!document.querySelector('#tradesTable thead'),
                        hasFilters: !!document.querySelector('.content-section .filters'),
                        hasPagination: !!document.querySelector('.content-section .pagination')
                    }
                }
            },
            tableData: {
                totalRows: document.querySelectorAll('#tradesTable tbody tr').length,
                headers: Array.from(document.querySelectorAll('#tradesTable thead th')).map(th => th.textContent?.trim()),
                sortableColumns: document.querySelectorAll('.sortable-header').length,
                hasData: document.querySelectorAll('#tradesTable tbody tr').length > 0,
                selectedRows: document.querySelectorAll('#tradesTable tbody tr.selected').length,
                actualTradesData: window.tradesData ? window.tradesData.map(trade => ({
                    id: trade.id,
                    ticker: trade.ticker_symbol || trade.ticker_id,
                    status: trade.status,
                    type: trade.investment_type,
                    side: trade.side,
                    currentPrice: trade.current_price,
                    dailyChange: trade.daily_change,
                    created: trade.created_at,
                    closed: trade.closed_at || trade.cancelled_at
                })) : [],
                tableStructure: {
                    hasTbody: !!document.querySelector('#tradesTable tbody'),
                    hasThead: !!document.querySelector('#tradesTable thead'),
                    tbodyRowCount: document.querySelectorAll('#tradesTable tbody tr').length,
                    theadColCount: document.querySelectorAll('#tradesTable thead th').length
                }
            },
            modals: {
                addModal: document.getElementById('addTradeModal') ? 'זמין' : 'לא זמין',
                editModal: document.getElementById('editTradeModal') ? 'זמין' : 'לא זמין',
                deleteModal: document.getElementById('deleteTradeModal') ? 'זמין' : 'לא זמין',
                linkedItemsModal: document.getElementById('linkedItemsModal') ? 'זמין' : 'לא זמין'
            },
            functions: {
                showAddTradeModal: typeof window.ModalManagerV2?.showModal === 'function' ? 'זמין (ModalManagerV2)' : 'לא זמין',
                editTradeRecord: typeof window.editTradeRecord === 'function' ? 'זמין' : 'לא זמין',
                deleteTradeRecord: typeof window.deleteTradeRecord === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                sortTableData: typeof window.sortTableData === 'function' ? 'זמין' : 'לא זמין'
            },
            buttons: {
                addTradeBtn: document.getElementById('addTradeBtn') ? 'זמין' : 'לא זמין',
                editTradeBtn: document.getElementById('editTradeBtn') ? 'זמין' : 'לא זמין',
                deleteTradeBtn: document.getElementById('deleteTradeBtn') ? 'זמין' : 'לא זמין'
            },
            console: {
                errors: [],
                warnings: [],
                logs: []
            },
            systems: {
                unifiedCacheManager: typeof window.UnifiedCacheManager === 'object' ? 'זמין' : 'לא זמין',
                headerSystem: typeof window.HeaderSystem === 'object' ? 'זמין' : 'לא זמין',
                notificationSystem: typeof window.showNotification === 'function' ? 'זמין' : 'לא זמין',
                colorSchemeSystem: typeof window.applyEntityColorsToHeaders === 'function' ? 'זמין' : 'לא זמין',
                translationSystem: typeof window.translateTradeType === 'function' ? 'זמין' : 'לא זמין',
                buttonSystem: typeof window.createEditButton === 'function' ? 'זמין' : 'לא זמין',
                linkedItemsSystem: typeof window.viewLinkedItemsForTrade === 'function' ? 'זמין' : 'לא זמין',
                preferencesSystem: typeof window.getPreference === 'function' ? 'זמין' : 'לא זמין',
                validationSystem: typeof window.initializeValidation === 'function' ? 'זמין' : 'לא זמין',
                tableSystem: typeof window.sortTableData === 'function' ? 'זמין' : 'לא זמין'
            },
            ui: {
                headerVisible: !!document.getElementById('unified-header'),
                headerHeight: document.getElementById('unified-header')?.offsetHeight || 0,
                mainContentVisible: !!document.querySelector('.main-content'),
                backgroundWrapperVisible: !!document.querySelector('.background-wrapper'),
                pageBodyVisible: !!document.querySelector('.page-body'),
                pageStructure: {
                    hasBackgroundWrapper: !!document.querySelector('.background-wrapper'),
                    hasPageBody: !!document.querySelector('.page-body'),
                    hasMainContent: !!document.querySelector('.main-content'),
                    hasTopSection: !!document.querySelector('.top-section'),
                    hasContentSection: !!document.querySelector('.content-section')
                },
                elements: {
                    totalElements: document.querySelectorAll('*').length,
                    visibleElements: document.querySelectorAll(':not([style*="display: none"]):not(.d-none)').length,
                    hiddenElements: document.querySelectorAll('[style*="display: none"], .d-none').length
                },
                styling: {
                    hasBootstrap: !!document.querySelector('link[href*="bootstrap"]'),
                    hasCustomCSS: !!document.querySelector('link[href*="styles-new"]'),
                    hasFontAwesome: !!document.querySelector('link[href*="font-awesome"]'),
                    hasBootstrapIcons: !!document.querySelector('link[href*="bootstrap-icons"]')
                }
            }
        };

        // Capture console messages
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = function(...args) {
            logData.console.errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            logData.console.warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };

        console.log = function(...args) {
            logData.console.logs.push(args.join(' '));
            originalLog.apply(console, args);
        };

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        return `Error generating log: ${error.message}`;
    }
}


// ===== MODAL FUNCTIONS - NEW SYSTEM =====
// Modal management using ModalManagerV2

/**
 * Show add trade modal
 * Uses ModalManagerV2 for consistent modal experience
 * 
 * @function showAddTradeModal
 * @returns {void}
 */
// REMOVED: showAddTradeModal - use window.ModalManagerV2.showModal('tradesModal', 'add') directly

/**
 * הצגת מודל עריכת טרייד
 * Uses ModalManagerV2 for consistent modal experience
 */
// REMOVED: showEditTradeModal - use window.ModalManagerV2.showEditModal('tradesModal', 'trade', tradeId) directly

/**
 * שמירת טרייד - Save Trade
 * Handles both add and edit modes with planning fields support
 * 
 * **Trade Planning Fields Support (2025-01-29):**
 * - Sends planning fields (planned_quantity, planned_amount, entry_price) to backend
 * - Calculates planned_amount from quantity * entry_price if not provided
 * - Backend implements snapshot logic: if trade_plan_id is provided, planning fields 
 *   are copied from plan (unless explicitly overridden)
 * 
 * **No Fallbacks Policy:**
 * - Only sends fields that are explicitly provided in form
 * - Does not calculate or infer planning fields from other sources
 * - If fields are missing, they are sent as null (backend handles gracefully)
 * 
 * @function saveTrade
 * @returns {Promise<void>}
 * 
 * @example
 * // Form with planning fields
 * // tradeQuantity = 100, tradeEntryPrice = 100
 * // Result: planned_quantity=100, planned_amount=10000, entry_price=100
 * 
 * // Form with trade_plan_id
 * // Backend will snapshot planning fields from plan automatically
 */
async function saveTrade() {
    window.Logger.debug('saveTrade called', { page: 'trades' });
    
    try {
        // ניקוי מטמון לפני פעולת CRUD        // Collect form data using DataCollectionService
        const form = document.getElementById('tradesModalForm');
        if (!form) {
            throw new Error('Trade form not found');
        }
        
        const tradeData = DataCollectionService.collectFormData({
            ticker_id: { id: 'tradeTicker', type: 'int' },
            trading_account_id: { id: 'tradeAccount', type: 'int' }, // Backend expects trading_account_id
            side: { id: 'tradeSide', type: 'text' },
            type: { id: 'tradeType', type: 'text' },
            quantity: { id: 'tradeQuantity', type: 'float' },
            entry_price: { id: 'tradeEntryPrice', type: 'float' },
            stop_loss: { id: 'tradeStopLoss', type: 'float', default: null },
            take_profit: { id: 'tradeTakeProfit', type: 'float', default: null },
            entry_date: { id: 'tradeEntryDate', type: 'date' },
            status: { id: 'tradeStatus', type: 'text' },
            notes: { id: 'tradeNotes', type: 'rich-text', default: null },
            tag_ids: { id: 'tradeTags', type: 'tags', default: [] }
        });

        const tagIds = Array.isArray(tradeData.tag_ids) ? tradeData.tag_ids : [];
        delete tradeData.tag_ids;

        if (tradeData.side) {
            const normalizedSide = String(tradeData.side).trim().toLowerCase();
            if (normalizedSide === 'long') {
                tradeData.side = 'Long';
            } else if (normalizedSide === 'short') {
                tradeData.side = 'Short';
            }
        }
        
        // Calculate planned_amount from quantity and entry_price if not provided directly
        let plannedAmount = tradeData.planned_amount;
        if (!plannedAmount && tradeData.quantity && tradeData.entry_price) {
            plannedAmount = parseFloat(tradeData.quantity) * parseFloat(tradeData.entry_price);
        }

        const payload = {
            // Core required fields – must match backend Trade model exactly
            trading_account_id: tradeData.trading_account_id,
            ticker_id: tradeData.ticker_id,
            status: tradeData.status,
            side: tradeData.side,
            investment_type: tradeData.type,
            // Planning fields (snapshot from form or from trade_plan)
            planned_quantity: tradeData.quantity ? parseFloat(tradeData.quantity) : null,
            planned_amount: plannedAmount ? parseFloat(plannedAmount) : null,
            entry_price: tradeData.entry_price ? parseFloat(tradeData.entry_price) : null,
            // Notes are stored as free text
            notes: tradeData.notes || null
        };
        
        if (tradeData.entry_date) {
            try {
                const entryDate = new Date(tradeData.entry_date);
                payload.created_at = entryDate.toISOString();
            } catch (dateError) {
                window.Logger.warn('Invalid entry date provided', { entryDate: tradeData.entry_date, error: dateError });
            }
        }
        
        // Validate data
        if (!window.validateEntityForm) {
            throw new Error('Validation system not available');
        }
        
        const validationConfig = [
            { id: 'tradeTicker', name: 'טיקר', rules: { required: true } },
            { id: 'tradeAccount', name: 'חשבון מסחר', rules: { required: true } },
            { id: 'tradeSide', name: 'צד', rules: { required: true } },
            { id: 'tradeType', name: 'סוג השקעה', rules: { required: true } },
            { id: 'tradeQuantity', name: 'כמות', rules: { required: true, min: 1 } },
            { id: 'tradeEntryPrice', name: 'מחיר כניסה', rules: { required: true, min: 0.01 } },
            { id: 'tradeStopLoss', name: 'Stop Loss', rules: { required: false, min: 0.01 } },
            { id: 'tradeTakeProfit', name: 'Take Profit', rules: { required: false, min: 0.01 } },
            { id: 'tradeStopLossPercent', name: 'Stop Loss (%)', rules: { required: false, min: 0.01 } },
            { id: 'tradeTakeProfitPercent', name: 'Take Profit (%)', rules: { required: false, min: 0.01 } },
            { id: 'tradeEntryDate', name: 'תאריך כניסה', rules: { required: true } },
            { id: 'tradeStatus', name: 'סטטוס', rules: { required: true } }
        ];
        
        const validationResult = window.validateEntityForm('tradesModalForm', validationConfig);
        
        if (!validationResult.isValid) {
            window.Logger.warn('Trade validation failed', { page: 'trades' });
            if (validationResult.errorMessages?.length && window.showErrorNotification) {
                window.showErrorNotification('שגיאת ולידציה', validationResult.errorMessages.join('\n'));
            }
            return;
        }
        
        // Determine if this is add or edit
        const isEdit = form.dataset.mode === 'edit';
        const tradeId = form.dataset.tradeId;
        
        // Prepare API call
        const url = isEdit ? `/api/trades/${tradeId}` : '/api/trades';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Cache will be invalidated after successful save via CacheSyncManager in CRUDResponseHandler
        // No need to clear cache before mutation - CacheSyncManager handles dependencies automatically

        // Send to API
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        // Use CRUDResponseHandler for consistent response handling
        let crudResult = null;
        if (isEdit) {
            crudResult = await CRUDResponseHandler.handleUpdateResponse(response, {
                modalId: 'tradesModal',
                successMessage: 'טרייד עודכן בהצלחה',
                entityName: 'טרייד',
                reloadFn: window.loadTradesData,
                requiresHardReload: false
            });
        } else {
            crudResult = await CRUDResponseHandler.handleSaveResponse(response, {
                modalId: 'tradesModal',
                successMessage: 'טרייד נוסף בהצלחה',
                entityName: 'טרייד',
                reloadFn: window.loadTradesData,
                requiresHardReload: false
            });

            if (crudResult && window.PendingExecutionTradeCreation?.handleTradeCreated) {
                await window.PendingExecutionTradeCreation.handleTradeCreated(crudResult);
            }
        }

        const resolvedTradeId = isEdit ? Number(tradeId) : Number(crudResult?.data?.id || crudResult?.id);
        if (Number.isFinite(resolvedTradeId)) {
            try {
                await window.TagService.replaceEntityTags('trade', resolvedTradeId, tagIds);
            } catch (tagError) {
                window.Logger?.warn('⚠️ Failed to update trade tags', {
                    error: tagError,
                    tradeId: resolvedTradeId,
                    page: 'trades'
                });
                const errorMessage = window.TagService?.formatTagErrorMessage
                    ? window.TagService.formatTagErrorMessage('שמירת תגיות הטרייד נכשלה - הנתונים נשמרו ללא תגיות', tagError)
                    : 'שמירת תגיות הטרייד נכשלה - הנתונים נשמרו ללא תגיות';
                window.showErrorNotification?.('שמירת תגיות', errorMessage);
            }
        }
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'שמירת טרייד');
    }
}

/**
 * מחיקת טרייד - alias ל-deleteTradeRecord
 */
async function deleteTrade(tradeId) {
    return await deleteTradeRecord(tradeId);
}

// REMOVED: window.showAddTradeModal - use window.showModalSafe('tradesModal', 'add') directly

/**
 * Bind conditions management controls inside the trade modal
 * @param {HTMLElement} modalElement
 */
function setupTradeConditionsButton(modalElement) {
    if (!modalElement) {
        return;
    }

    const controlsWrapper = modalElement.querySelector('[data-conditions-controls="trade"]');
    if (!controlsWrapper || controlsWrapper.dataset.initialized === 'true') {
        return;
    }

    const openButton = controlsWrapper.querySelector('#tradeOpenConditionsButton');
    const disabledHint = controlsWrapper.querySelector('[data-conditions-disabled-hint]');
    const tickerSelect = modalElement.querySelector('#tradeTicker');

    const ensureEntityName = () => {
        if (modalElement.dataset.entityName && modalElement.dataset.entityName.trim() !== '') {
            return modalElement.dataset.entityName;
        }
        if (tickerSelect && tickerSelect.selectedOptions.length > 0) {
            const tickerName = tickerSelect.selectedOptions[0].textContent?.trim();
            if (tickerName) {
                modalElement.dataset.entityName = tickerName;
                return tickerName;
            }
        }
        return '';
    };

    const updateButtonState = () => {
        const mode = modalElement.dataset.modalMode || modalElement.dataset.mode || '';
        const entityId = modalElement.dataset.entityId || '';
        const isEnabled = mode === 'edit' && entityId;

        if (openButton) {
            openButton.disabled = !isEnabled;
            openButton.classList.toggle('btn-outline-secondary', !isEnabled);
            openButton.classList.toggle('btn-outline-primary', isEnabled);
        }

        if (disabledHint) {
            disabledHint.classList.toggle('d-none', Boolean(isEnabled));
        }
    };

    if (openButton) {
        openButton.addEventListener('click', async () => {
            const entityId = modalElement.dataset.entityId;
            if (!entityId) {
                window.showNotification?.('ניתן לנהל תנאים רק לאחר שמירת הטרייד.', 'info');
                return;
            }

            try {
                const initResult = typeof window.initializeTradeConditionsSystem === 'function'
                    ? window.initializeTradeConditionsSystem()
                    : false;
                if (initResult && typeof initResult.then === 'function') {
                    await initResult;
                }
            } catch (error) {
                window.Logger?.warn('Failed to initialize trade conditions system before modal launch', { error, page: 'trades' });
            }

            if (!window.ConditionsModalController || typeof window.ConditionsModalController.open !== 'function') {
                window.Logger?.error('ConditionsModalController לא זמין', { page: 'trades' });
                window.showNotification?.('לא ניתן לפתוח את מודול התנאים כעת.', 'error');
                return;
            }

            const entityName = ensureEntityName();
            const context = {
                entityType: 'trade',
                entityId: Number(entityId),
                entityName,
                parentModalId: modalElement.id
            };

            window.ConditionsModalController.open(context);
        });
    }

    if (tickerSelect && !tickerSelect.dataset.conditionsNameBound) {
        tickerSelect.addEventListener('change', () => {
            ensureEntityName();
            updateButtonState();
        });
        tickerSelect.dataset.conditionsNameBound = 'true';
    }

    modalElement.addEventListener('modal:entity-context-changed', updateButtonState);
    modalElement.addEventListener('modal:entity-context-reset', updateButtonState);

    controlsWrapper.dataset.initialized = 'true';
    updateButtonState();
}

/**
 * Show edit trade modal (wrapper for ModalManagerV2)
 * Maintains backward compatibility with HTML onclick handlers
 * @function showEditTradeModal
 * @param {number|string} tradeId - ID of trade to edit
 */
window.showEditTradeModal = function(tradeId) {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
        window.ModalManagerV2.showEditModal('tradesModal', 'trade', tradeId);
    } else {
        window.Logger.error('ModalManagerV2 not available', { page: 'trades' });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
        }
    }
};

// Export functions to window for global access
window.saveTrade = saveTrade;
window.deleteTrade = deleteTrade;
window.performTradeDeletion = performTradeDeletion;
window.setupTradeConditionsButton = setupTradeConditionsButton;

/**
 * Register trades table with UnifiedTableSystem
 * This function registers the trades table for unified sorting and filtering
 */
window.registerTradesTables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { page: "trades" });
        return;
    }

    // Get column mappings from table-mappings.js
    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    // Register trades table
    window.UnifiedTableSystem.registry.register('trades', {
        dataGetter: () => {
            return window.tradesData || [];
        },
        updateFunction: (data) => {
            if (typeof window.updateTradesTable === 'function') {
                setTradesFilteredDataset(Array.isArray(data) ? data : []);
            }
        },
        tableSelector: '#tradesTable',
        columns: getColumns('trades'),
        sortable: true,
        filterable: true
    });
};

