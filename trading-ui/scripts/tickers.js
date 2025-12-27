/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 52
 * 
 * PAGE INITIALIZATION (1)
 * - initializeProviderSymbolFields() - * Load provider symbol mappings for a ticker (for edit mode)
 * 
 * DATA LOADING (14)
 * - loadCurrenciesData() - loadCurrenciesData function
 * - getCurrencySymbol() - * Load currencies data from server
 * - getTickerTypeStyle() - * Get currency symbol by currency ID
 * - getTickerStatusStyle() - * Get ticker type style configuration
 * - getTickerStatusLabel() - getTickerStatusLabel function
 * - loadTickerProviderSymbols() - loadTickerProviderSymbols function
 * - loadProviderSymbolFields() - * Initialize provider symbol fields when modal is shown
 * - getTickerSymbol() - * בדיקת פריטים מקושרים לפני מחיקת טיקר
 * - loadAndRefreshMissingData() - loadAndRefreshMissingData function
 * - getDataStatusBadge() - getDataStatusBadge function
 * - loadTickersDataInternal() - * Get data status badge HTML for a ticker
 * - loadColorsAndApplyToHeaders() - loadColorsAndApplyToHeaders function
 * - tryLoadData() - tryLoadData function
 * - getTypeDisplayName() - getTypeDisplayName function
 * 
 * DATA MANIPULATION (13)
 * - updateCurrencyOptions() - * Get ticker status label in Hebrew
 * - updateActiveTradesField() - updateActiveTradesField function
 * - updateTickerActiveTradesStatus() - updateTickerActiveTradesStatus function
 * - updateAllActiveTradesStatuses() - updateAllActiveTradesStatuses function
 * - saveTicker() - saveTicker function
 * - updateTicker() - updateTicker function
 * - checkLinkedItemsBeforeDeleteTicker() - checkLinkedItemsBeforeDeleteTicker function
 * - updateAllTickerStatuses() - * בדיקת פריטים מקושרים לפני ביטול טיקר
 * - checkLinkedItemsAndDeleteTicker() - checkLinkedItemsAndDeleteTicker function
 * - deleteTicker() - deleteTicker function
 * - confirmDeleteTicker() - confirmDeleteTicker function
 * - updateTickersSummaryStats() - updateTickersSummaryStats function
 * - updateTickersTable() - updateTickersTable function
 * 
 * EVENT HANDLING (3)
 * - restoreTickersSectionState() - restoreTickersSectionState function
 * - performTickerCancellation() - * בדיקת מקושרים וביצוע ביטול טיקר
 * - performTickerDeletion() - * בדיקת מקושרים וביצוע מחיקת טיקר
 * 
 * UI UPDATES (1)
 * - renderTickersTableRows() - renderTickersTableRows function
 * 
 * VALIDATION (5)
 * - checkLinkedItemsAndCancelTicker() - checkLinkedItemsAndCancelTicker function
 * - checkLinkedItemsBeforeCancelTicker() - * בדיקת פריטים מקושרים לפני מחיקת טיקר
 * - checkTickerDataCompleteness() - checkTickerDataCompleteness function
 * - checkTickersDataCompleteness() - checkTickersDataCompleteness function
 * - checkTickerExternalData() - checkTickerExternalData function
 * 
 * OTHER (15)
 * - editTicker() - editTicker function
 * - viewTickerDetails() - * Edit existing ticker
 * - collectProviderSymbols() - collectProviderSymbols function
 * - populateProviderSymbolFields() - * Collect provider symbols from form
 * - cancelTicker() - cancelTicker function
 * - performCancelTicker() - performCancelTicker function
 * - reactivateTicker() - reactivateTicker function
 * - ensureHistoricalDataForTickers() - ensureHistoricalDataForTickers function
 * - enrichTickersWithFullData() - enrichTickersWithFullData function
 * - restorePageState() - restorePageState function
 * - refreshTickerExternalData() - refreshTickerExternalData function
 * - refreshAllTickersData() - refreshAllTickersData function
 * - refreshYahooFinanceData() - refreshYahooFinanceData function
 * - refreshYahooFinanceDataSilently() - refreshYahooFinanceDataSilently function
 * - filterTickersByType() - filterTickersByType function
 * 
 * ==========================================
 */
/**
 * Tickers Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for managing tickers including:
 * - CRUD operations for tickers
 * - Data loading and table management
 * - Form validation and UI interactions
 * - Modal handling and state management
 * - External data integration (Yahoo Finance)
 * - Currency management
 * - Status and activity tracking
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

// ===== קובץ JavaScript לדף טיקרים =====

// ===== TICKER MANAGEMENT FUNCTIONS =====
// CRUD operations for tickers

/**
 * Edit existing ticker
 * Opens modal for editing ticker
 * 
 * @function editTicker
 * @param {number|string} tickerId - ID of the ticker to edit
 * @returns {void}
 */
async function editTicker(tickerId) {
  // Use ModalManagerV2 directly
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
    await window.ModalManagerV2.showEditModal('tickersModal', 'ticker', tickerId);
    if (window.TagUIManager && typeof window.TagUIManager.hydrateSelectForEntity === 'function') {
      await window.TagUIManager.hydrateSelectForEntity('tickerTags', 'ticker', tickerId, { force: true });
    }
  } else {
    window.Logger?.error('ModalManagerV2 לא זמין', { page: "tickers" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
    }
  }
}

/**
 * צפייה בפרטי טיקר
 * מציג חלון עם פרטים מפורטים של הטיקר
 * @param {number} tickerId - מזהה הטיקר
 */
function viewTickerDetails(tickerId) {
  try {
    // צפייה בפרטי טיקר באמצעות מודל פרטי ישות הגלובלי
    if (typeof window.showEntityDetails === 'function') {
      window.showEntityDetails('ticker', tickerId, { mode: 'view' });
    } else {
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'מערכת פרטי ישויות לא זמינה');
      }
    }
  } catch (error) {
    window.Logger.error('Error in viewTickerDetails:', error, { tickerId, page: "tickers" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת פרטי הטיקר');
    }
  }
}


/*
 * Tickers.js - Tickers Page Management
 * ====================================
 *
 * This file contains all tickers management functionality for the TikTrack application.
 * It handles tickers CRUD operations, table updates, and user interactions.
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * - notification-system.js (for linked items warnings)
 * - linked-items.js (for linked items modal display)
 *
 * Table Mapping:
 * - Uses 'tickers' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * Linked Items Integration:
 * - Delete operations trigger linked items warning via notification-system.js
 * - Advanced modal display handled by linked-items.js
 * - Color-coded badges and responsive design
 *
 * File: trading-ui/scripts/tickers.js
 * Version: 1.9.9
 * Last Updated: August 26, 2025
 */

// משתנים גלובליים

if (!window.tickersData) {
  window.tickersData = [];

}
if (!window.currenciesData) {
  window.currenciesData = [];

}
if (!window.currenciesLoaded) {
  window.currenciesLoaded = false;

}
let tickersData = window.tickersData;
let tickersPaginationInstance = null;


// מפת צבעים לסוגי טיקרים
const tickerTypeColors = {
  'stock': { bg: '#e3f2fd', text: '#1976d2', label: 'מניה' },
  'etf': { bg: '#f3e5f5', text: '#7b1fa2', label: 'ETF' },
  'bond': { bg: '#e8f5e8', text: '#388e3c', label: 'אג"ח' },
  'crypto': { bg: '#fff3e0', text: '#f57c00', label: 'קריפטו' },
  'forex': { bg: '#fce4ec', text: '#c2185b', label: 'מטבע חוץ' },
  'commodity': { bg: '#f1f8e9', text: '#689f38', label: 'סחורה' },
  'other': { bg: '#fafafa', text: '#616161', label: 'אחר' },
};

// ===== CURRENCY MANAGEMENT FUNCTIONS =====
// Currency data loading and management

/**
 * Load currencies data from server
 * Fetches all currencies for dropdowns
 * 
 * @function loadCurrenciesData
 * @async
 * @returns {Promise<void>}
 */
async function loadCurrenciesData() {
  try {
    const response = await fetch('/api/currencies/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    window.currenciesData = data.data || data;
    window.currenciesLoaded = true;

  } catch (error) {
    handleApiError(error, 'טעינת מטבעות');
    window.currenciesData = [];
    window.currenciesLoaded = false;
  }
}

/**
 * Get currency symbol by currency ID
 * @param {number|string} currencyId - Currency ID
 * @returns {string} Currency symbol or 'N/A' if not found
 */
function getCurrencySymbol(currencyId) {
  try {
    if (!window.currenciesData || !window.currenciesLoaded) {
      return currencyId || 'N/A';
    }

    const currency = window.currenciesData.find(c => c.id === currencyId);
    return currency ? currency.symbol : currencyId || 'N/A';
  } catch (error) {
    window.Logger.error('getCurrencySymbol failed', { page: 'tickers', error: error?.message || error });
    return currencyId || 'N/A';
  }
}

/**
 * Get ticker type style configuration
 * @param {string} type - Ticker type
 * @returns {Object} Style object with backgroundColor, color, padding, etc.
 */
function getTickerTypeStyle(type) {
  try {
    const typeConfig = tickerTypeColors[type] || tickerTypeColors['other'];
    return {
      backgroundColor: typeConfig.bg,
      color: typeConfig.text,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'inline-block',
      textAlign: 'center',
    };
  } catch (error) {
    window.Logger.error('getTickerTypeStyle failed', { page: 'tickers', error: error?.message || error });
    return {
      backgroundColor: '#6c757d',
      color: '#ffffff',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'inline-block',
      textAlign: 'center',
    };
  }
}

/**
 * Get ticker status style configuration
 * @param {string} status - Ticker status ('open', 'closed', 'cancelled')
 * @returns {Object} Style object with backgroundColor, color, padding, etc.
 */
function getTickerStatusStyle(status) {
  try {
    const statusConfig = {
      'open': { bg: '#e8f5e8', text: '#388e3c' },
      'closed': { bg: '#fff3cd', text: '#856404' },
      'cancelled': { bg: '#ffebee', text: '#d32f2f' },
    };

    const config = statusConfig[status] || statusConfig['open'];
    return {
      backgroundColor: config.bg,
      color: config.text,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'inline-block',
      textAlign: 'center',
    };
  } catch (error) {
    window.Logger.error('getTickerStatusStyle failed', { page: 'tickers', error: error?.message || error });
    return {
      backgroundColor: '#e8f5e8',
      color: '#388e3c',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'inline-block',
      textAlign: 'center',
    };
  }
}

/**
 * Get ticker status label in Hebrew
 * @param {string} status - Ticker status ('open', 'closed', 'cancelled')
 * @returns {string} Status label in Hebrew
 */
function getTickerStatusLabel(status) {
  try {
    const labels = {
      'open': 'פתוח',
      'closed': 'סגור',
      'cancelled': 'מבוטל',
    };
    return labels[status] || 'פתוח';
  } catch (error) {
    window.Logger.error('getTickerStatusLabel failed', { page: 'tickers', error: error?.message || error });
    return 'פתוח';
  }
}

/**
 * Generate currency options HTML for select elements
 * @param {Object|null} [ticker=null] - Ticker object for pre-selection
 * @returns {string} HTML string with option elements
 */
let currenciesUnavailableNotified = false;

function generateTickerCurrencyOptions(ticker = null) {
  try {
    let options = '';

    // בדיקה אם יש נתוני מטבעות
    if (Array.isArray(window.currenciesData) && window.currenciesData.length > 0) {
      window.currenciesData.forEach(currency => {
        // בדיקה אם המטבע נבחר לטיקר הנוכחי
        const isSelected = ticker && (
          ticker.currency_id === currency.id ||
                  ticker.currency && ticker.currency.symbol === currency.symbol ||
                  ticker.currency === currency.symbol
        );

        options += `<option value="${currency.id}" ${isSelected ? 'selected' : ''}>${currency.name} (${currency.symbol})</option>`;
      });
    } else {
      if (!currenciesUnavailableNotified) {
        currenciesUnavailableNotified = true;
        window.Logger?.warn('⚠️ currencies data not available - currency selects disabled', { page: 'tickers' });
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification('נתוני מטבעות לא זמינים', 'לא ניתן לטעון את רשימת המטבעות מהשרת');
        }
      }
      options = '<option value="" disabled>נתוני מטבעות לא זמינים</option>';
    }

    return options;
  } catch (error) {
    window.Logger.error('generateTickerCurrencyOptions failed', { page: 'tickers', error: error?.message || error });
    if (!currenciesUnavailableNotified) {
      currenciesUnavailableNotified = true;
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בטעינת מטבעות', error.message || 'בדוק את החיבור לשרת');
      }
    }
    return '<option value="" disabled>נתוני מטבעות לא זמינים</option>';
  }
}

/**
 * Update currency options in add/edit ticker forms
 * Uses SelectPopulatorService if available, falls back to local implementation
 * @param {Object|null} [ticker=null] - Ticker object for pre-selection in edit mode
 * @returns {Promise<void>}
 */
async function updateCurrencyOptions(ticker = null) {
  try {
    const addSelect = document.getElementById('addTickerCurrency');
    const editSelect = document.getElementById('editTickerCurrency');

    // Use SelectPopulatorService if available
    if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateCurrenciesSelect === 'function') {
      const defaultValue = ticker?.currency_id || ticker?.currency?.id || null;
      
      if (addSelect) {
        await window.SelectPopulatorService.populateCurrenciesSelect(addSelect, {
          includeEmpty: true,
          emptyText: 'בחר מטבע...',
          defaultValue: null // Don't set default in add mode
        });
      }

      if (editSelect) {
        await window.SelectPopulatorService.populateCurrenciesSelect(editSelect, {
          includeEmpty: true,
          emptyText: 'בחר מטבע...',
          defaultValue: defaultValue
        });
      }
      return;
    }

    // Fallback to local implementation
    const currenciesAvailable = Array.isArray(window.currenciesData) && window.currenciesData.length > 0;

    if (addSelect) {
      const addOptions = generateTickerCurrencyOptions();
      addSelect.textContent = '';
      if (currenciesAvailable) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'בחר מטבע...';
        addSelect.appendChild(defaultOption);
      }
      // Convert HTML string to DOM elements safely
      const parser = new DOMParser();
      const doc = parser.parseFromString(addOptions, 'text/html');
      const fragment = document.createDocumentFragment();
      Array.from(doc.body.childNodes).forEach(node => {
        fragment.appendChild(node.cloneNode(true));
      });
      addSelect.appendChild(fragment);
    }

    if (editSelect) {
      const editOptions = generateTickerCurrencyOptions(ticker);
      editSelect.textContent = '';
      if (currenciesAvailable) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'בחר מטבע...';
        editSelect.appendChild(defaultOption);
      }
      // Convert HTML string to DOM elements safely
      const parser = new DOMParser();
      const doc = parser.parseFromString(editOptions, 'text/html');
      const fragment = document.createDocumentFragment();
      Array.from(doc.body.childNodes).forEach(node => {
        fragment.appendChild(node.cloneNode(true));
      });
      editSelect.appendChild(fragment);
    }
  } catch (error) {
    window.Logger.error('updateCurrencyOptions failed', { page: 'tickers', error: error?.message || error });
  }
}

// ===== STATUS MANAGEMENT FUNCTIONS =====
// Status updates and activity tracking

/**
 * Update active trades field for tickers using entity service
 * 
 * עדכון שדה active_trades עבור טיקרים באמצעות שירות ישויות
 * 
 * Updates active_trades field based on open trades. Uses TradesData service
 * instead of direct API calls. Falls back to direct API call if service is unavailable.
 * 
 * Update active trades field for tickers
 * @returns {Promise<void>}
 * @throws {Error} When data loading fails
 */
async function updateActiveTradesField() {
  // Updating active_trades field for tickers

  try {
    // טעינת טריידים באמצעות שירות ישויות (preferred method)
    let trades = [];
    if (window.TradesData && typeof window.TradesData.loadTradesData === 'function') {
      trades = await window.TradesData.loadTradesData().catch(() => []);
    } else {
      // Fallback: direct API call
      const tradesResponse = await fetch('/api/trades/');
      if (!tradesResponse.ok) {
        // window.Logger.warn('⚠️ Could not load trades for active_trades update', { page: "tickers" });
        return;
      }
      const data = await tradesResponse.json();
      trades = data.data || data || [];
    }

    // יצירת מפה של טיקרים עם טריידים פתוחים
    const tickersWithOpenTrades = new Set();
    trades.forEach(trade => {
      if (trade.status === 'open' && trade.ticker_id) {
        tickersWithOpenTrades.add(trade.ticker_id);
      }
    });

    // עדכון שדה active_trades בטיקרים בזיכרון
    (window.tickersData || []).forEach(ticker => {
      const hasOpenTrades = tickersWithOpenTrades.has(ticker.id);
      ticker.active_trades = hasOpenTrades;
    });

    // עדכון סטטיסטיקות סיכום לאחר עדכון שדה active_trades
    // הסרת הקריאה הכפולה - updateTickersSummaryStats נקראת ב-loadTickersData
    // updateTickersSummaryStats(tickersData);

  } catch (error) {
    handleSystemError(error, 'עדכון שדה active_trades');
  }
}

/**
 * עדכון אוטומטי של שדה active_trades לטיקר ספציפי
 * @deprecated Use window.tickerService.updateTickerActiveTradesStatus(tickerId) instead
 */
async function updateTickerActiveTradesStatus(tickerId) {
  // קריאה לשירות המאוחד
  if (window.tickerService && window.tickerService.updateTickerActiveTradesStatus) {
    return await window.tickerService.updateTickerActiveTradesStatus(tickerId);
  } else {
    // fallback לפונקציה המקורית אם השירות לא זמין
    try {
      const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await response.json(); // result not used

        // רענון הנתונים
        await loadTickersData();
      } else {
        handleApiError('שגיאה בעדכון שדה active_trades לטיקר', response.status);
      }
    } catch (error) {
      handleSystemError(error, 'עדכון שדה active_trades לטיקר');
    }
  }
}

/**
 * עדכון אוטומטי של כל שדות active_trades
 * @deprecated Use window.tickerService.updateAllActiveTradesStatuses() instead
 */
async function updateAllActiveTradesStatuses() {
  // קריאה לשירות המאוחד
  if (window.tickerService && window.tickerService.updateAllActiveTradesStatuses) {
    return await window.tickerService.updateAllActiveTradesStatuses();
  } else {
    // fallback לפונקציה המקורית אם השירות לא זמין
    try {
      const response = await fetch('/api/tickers/update-all-active-trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await response.json(); // result not used

        // רענון הנתונים
        await loadTickersData();
      } else {
        handleApiError('שגיאה בעדכון כל שדות active_trades', response.status);
      }
    } catch (error) {
      handleSystemError(error, 'עדכון כל שדות active_trades');
    }
  }
}

// ===== UI STATE MANAGEMENT FUNCTIONS =====
// Section state restoration and UI management

/**
 * Restore tickers section state
 * Restores saved section states from localStorage
 * 
 * @function restoreTickersSectionState
 * @returns {void}
 */
function restoreTickersSectionState() {
  try {
    // שחזור מצב הסקשן העליון
    if (typeof window.restoreAllSectionStates === 'function') {
      window.restoreAllSectionStates();
    } else {
      // window.Logger.warn('⚠️ restoreAllSectionStates function not available globally', { page: "tickers" });
    }

    // שחזור מצב הסקשנים הפנימיים
    if (typeof window.restoreSectionStates === 'function') {
      window.restoreSectionStates();
    } else {
      // window.Logger.warn('⚠️ restoreSectionStates function not available globally', { page: "tickers" });
    }
  } catch (error) {
    window.Logger.error('restoreTickersSectionState failed', { page: 'tickers', error: error?.message || error });
  }
}

// פונקציות נוספות

// פונקציות לפתיחה/סגירה של סקשנים - משתמשות בפונקציות הגלובליות


// פונקציות נוספות

// ========================================
// פונקציות מודלים
// ========================================

/**
 * הצגת מודל טיקר (הוספה או עריכה)
 * @param {string} mode - 'add' או 'edit'
 * @param {number} [id] - מזהה הטיקר (נדרש רק בעריכה)
 */

/**
 * וולידציה מקיפה של טופס טיקר
 * @param {string} mode - 'add' או 'edit'
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */


// ========================================
// פונקציות שמירה ועדכון
// ========================================

// ===== PROVIDER SYMBOL MAPPING FUNCTIONS =====
// Functions for managing provider symbol mappings

/**
 * Load provider symbol mappings for a ticker (for edit mode)
 * 
 * @function loadTickerProviderSymbols
 * @param {number} tickerId - ID of the ticker
 * @async
 * @returns {Promise<void>}
 */
async function loadTickerProviderSymbols(tickerId) {
  if (!tickerId) {
    return;
  }

  try {
    const response = await fetch(`/api/tickers/${tickerId}/provider-symbols`);
    if (!response.ok) {
      if (response.status === 404) {
        // No mappings found - that's OK
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const mappings = result.data || [];

    if (mappings.length > 0) {
      populateProviderSymbolFields(mappings);
    }
  } catch (error) {
    window.Logger?.error('Error loading provider symbols:', error);
    // Don't show error to user - mappings are optional
  }
}

/**
 * Initialize provider symbol fields when modal is shown
 * NOTE: This is now handled by ModalManagerV2.initializeSpecialHandlers()
 * This function is kept for backward compatibility but is no longer called automatically.
 * The modal initialization is handled in modal-manager-v2.js
 */
function initializeProviderSymbolFields() {
  // This function is deprecated - ModalManagerV2 now handles this
  // Kept for backward compatibility
  window.Logger?.warn('⚠️ initializeProviderSymbolFields is deprecated - ModalManagerV2 now handles this');
}

// ===== SAVE AND UPDATE FUNCTIONS =====
// Ticker saving, updating, and data management

/**
 * Load external data providers and populate provider symbol fields
 * 
 * @function loadProviderSymbolFields
 * @async
 * @returns {Promise<void>}
 */
async function loadProviderSymbolFields() {
  const fieldsContainer = document.getElementById('providerSymbolsFields');
  if (!fieldsContainer) {
    window.Logger?.warn('⚠️ Provider symbols fields container not found');
    return;
  }

  // Show loading state
  fieldsContainer.textContent = '';
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'text-center text-muted py-3';
  const spinner = document.createElement('i');
  spinner.className = 'fas fa-spinner fa-spin me-2';
  loadingDiv.appendChild(spinner);
  loadingDiv.appendChild(document.createTextNode('טוען רשימת ספקים...'));
  fieldsContainer.appendChild(loadingDiv);

  try {
    // Load providers from API
    const response = await fetch('/api/external-data-providers/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const providers = (result.data || []).filter(p => p.is_active);

    if (providers.length === 0) {
      fieldsContainer.textContent = '';
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-info mb-0';
      const icon = document.createElement('i');
      icon.className = 'fas fa-info-circle me-2';
      alertDiv.appendChild(icon);
      const small = document.createElement('small');
      small.textContent = 'אין ספקי נתונים פעילים במערכת';
      alertDiv.appendChild(small);
      fieldsContainer.appendChild(alertDiv);
      return;
    }

    // Generate fields for each provider
    const fieldsHTML = providers.map(provider => `
      <div class="mb-3">
        <label for="providerSymbol_${provider.name}" class="form-label small fw-semibold">
          <i class="fas fa-exchange-alt me-1"></i>
          ${provider.display_name || provider.name}
        </label>
        <input type="text" 
               class="form-control form-control-sm" 
               id="providerSymbol_${provider.name}" 
               name="providerSymbol_${provider.name}"
               placeholder="השאר ריק אם לא נדרש מיפוי"
               maxlength="50"
               data-provider-id="${provider.id}"
               data-provider-name="${provider.name}">
        <small class="form-text text-muted">
          <i class="fas fa-info-circle me-1"></i>
          אם ספק זה דורש סימבול שונה מהסימבול הפנימי, הזן כאן (למשל: 500X.MI עבור Yahoo Finance)
        </small>
      </div>
    `).join('');

    fieldsContainer.textContent = '';
    // Convert HTML string to DOM elements safely
    const parser = new DOMParser();
    const doc = parser.parseFromString(fieldsHTML, 'text/html');
    const fragment = document.createDocumentFragment();
    Array.from(doc.body.childNodes).forEach(node => {
      fragment.appendChild(node.cloneNode(true));
    });
    fieldsContainer.appendChild(fragment);
    
    if (window.Logger) {
      window.Logger.debug('Provider symbol fields loaded', { 
        providerCount: providers.length,
        page: 'tickers' 
      });
    }
  } catch (error) {
    window.Logger?.error('Error loading providers:', error);
    fieldsContainer.textContent = '';
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger mb-0';
    const icon = document.createElement('i');
    icon.className = 'fas fa-exclamation-triangle me-2';
    alertDiv.appendChild(icon);
    const small = document.createElement('small');
    small.textContent = 'שגיאה בטעינת ספקי נתונים. נסה לרענן את הדף.';
    alertDiv.appendChild(small);
    fieldsContainer.appendChild(alertDiv);
    
    if (window.Logger) {
      window.Logger.error('Failed to load provider symbol fields', { 
        error: error.message,
        page: 'tickers' 
      });
    }
  }
}

/**
 * Collect provider symbols from form
 * 
 * @function collectProviderSymbols
 * @returns {Object} Dictionary of provider_name -> provider_symbol
 */
function collectProviderSymbols() {
  const providerSymbols = {};
  const inputs = document.querySelectorAll('[id^="providerSymbol_"]');
  
  inputs.forEach(input => {
    const providerName = input.id.replace('providerSymbol_', '');
    const symbol = input.value.trim();
    if (symbol) {
      providerSymbols[providerName] = symbol;
    }
  });

  return Object.keys(providerSymbols).length > 0 ? providerSymbols : null;
}

/**
 * Populate provider symbol fields with existing mappings
 * 
 * @function populateProviderSymbolFields
 * @param {Array} mappings - Array of provider symbol mappings
 * @returns {void}
 */
function populateProviderSymbolFields(mappings) {
  if (!mappings || mappings.length === 0) {
    return;
  }

  mappings.forEach(mapping => {
    // Support both provider_name and provider_display_name
    const providerName = mapping.provider_name || mapping.provider_display_name;
    if (!providerName) {
      window.Logger?.warn('⚠️ Mapping missing provider name:', mapping);
      return;
    }
    
    const input = document.getElementById(`providerSymbol_${providerName}`);
    if (input) {
      // Use DataCollectionService to set value if available
      if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        window.DataCollectionService.setValue(input.id, mapping.provider_symbol || '', 'text');
      } else {
        input.value = mapping.provider_symbol || '';
      }
      if (window.Logger) {
        window.Logger.debug('Populated provider symbol field', {
          providerName,
          symbol: mapping.provider_symbol,
          page: 'tickers'
        });
      }
    } else {
      window.Logger?.warn(`⚠️ Provider symbol input field not found: providerSymbol_${providerName}`);
      if (window.Logger) {
        window.Logger.warn('Provider symbol input field not found', {
          providerName,
          availableFields: Array.from(document.querySelectorAll('[id^="providerSymbol_"]')).map(el => el.id),
          page: 'tickers'
        });
      }
    }
  });
}

/**
 * Save new ticker
 * Collects form data and sends to server for creation
 * 
 * @function saveTicker
 * @async
 * @returns {Promise<void>}
 */
async function saveTicker() {
  
  // איסוף נתונים מהטופס באמצעות DataCollectionService
  // השדות תואמים לקונפיגורציה החדשה ב-tickers-config.js
  const tickerData = DataCollectionService.collectFormData({
    id: { id: 'tickerId', type: 'text' }, // שדה ID נסתר שנוסף בעריכה
    symbol: { id: 'tickerSymbol', type: 'text' },
    name: { id: 'tickerName', type: 'text' },
    type: { id: 'tickerType', type: 'text' },
    currency_id: { id: 'tickerCurrency', type: 'int' },
    status: { id: 'tickerStatus', type: 'text' },
    remarks: { id: 'tickerRemarks', type: 'text' },
    tag_ids: { id: 'tickerTags', type: 'tags', default: [] }
  });
  console.log('🎯 DEBUG: saveTicker collected tickerData:', tickerData);
  console.log('🎯 DEBUG: tickerSymbol element value:', document.getElementById('tickerSymbol')?.value);
  const tagIds = Array.isArray(tickerData.tag_ids) ? tickerData.tag_ids : [];
  delete tickerData.tag_ids;

  // Collect provider symbols
  const providerSymbols = collectProviderSymbols();
  if (providerSymbols) {
    tickerData.provider_symbols = providerSymbols;
  }

  const tickerId = tickerData.id ? parseInt(tickerData.id) : null;
  const symbol = tickerData.symbol?.trim().toUpperCase();
  const name = tickerData.name?.trim();
  const type = tickerData.type;
  const currency_id = tickerData.currency_id;
  const status = tickerData.status || 'closed'; // ברירת מחדל: סגור
  const remarks = tickerData.remarks?.trim();

  // בדיקה אם זה מצב עריכה - אם כן, קרא ל-updateTicker
  if (tickerId) {
    // זה מצב עריכה - קרא ל-updateTicker
    return await updateTicker();
  }

  // ולידציה בסיסית (רק למצב הוספה)
  if (!symbol || symbol.length === 0) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'סמל הטיקר הוא שדה חובה');
    }
      return;
    }

  if (!name || name.length < 2) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'שם החברה חייב להכיל לפחות 2 תווים');
    }
    return;
  }

  if (!type) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'סוג הטיקר הוא שדה חובה');
    }
    return;
  }

  if (!currency_id) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'מטבע הוא שדה חובה');
    }
    return;
  }

  if (!status || !['open', 'closed', 'cancelled'].includes(status)) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'יש לבחור סטטוס תקין');
    }
    return;
  }

  // בדיקה אם הסמל כבר קיים במערכת (רק למצב הוספה)
  const existingTicker = (window.tickersData || []).find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
  if (existingTicker) {
    if (window.showErrorNotification) {
      window.showErrorNotification(
        'שגיאת וולידציה',
        `הסמל ${symbol} כבר קיים במערכת (טיקר: ${existingTicker.name})`
      );
    }
    return;
  }

  // Business Logic API validation - validate ticker symbol
  if (window.TickersData?.validateTickerSymbol) {
    try {
      const symbolValidation = await window.TickersData.validateTickerSymbol(symbol);
      if (!symbolValidation.is_valid) {
        const errorMessage = symbolValidation.errors?.join(', ') || 'ולידציה של סמל נכשלה';
        window.showErrorNotification?.('שגיאת ולידציה', errorMessage);
        return;
      }
    } catch (validationError) {
      window.Logger?.warn('⚠️ Ticker symbol validation error (continuing with save)', {
        error: validationError,
        page: 'tickers'
      });
      // Continue with save even if validation fails (fallback)
    }
  }

  // Business Logic API validation - validate ticker data
  if (window.TickersData?.validateTicker) {
    try {
      const validationResult = await window.TickersData.validateTicker({
        symbol,
        name,
        type,
        currency_id: parseInt(currency_id),
        status
      });

      if (!validationResult.is_valid) {
        const errorMessage = validationResult.errors?.join(', ') || 'ולידציה נכשלה';
        window.showErrorNotification?.('שגיאת ולידציה', errorMessage);
        return;
      }
    } catch (validationError) {
      window.Logger?.warn('⚠️ Ticker validation error (continuing with save)', {
        error: validationError,
        page: 'tickers'
      });
      // Continue with save even if validation fails (fallback)
    }
  }

  const finalStatus = status;

  try {
    const tickerPayload = {
      symbol,
      name,
      type,
      currency_id: parseInt(currency_id),
      status: finalStatus,
      remarks: remarks || null
    };
    
    // Add provider symbols if they exist
    if (providerSymbols) {
      tickerPayload.provider_symbols = providerSymbols;
    }

    // Use UnifiedCRUDService for consistent CRUD operations
    let crudResult;
    if (window.UnifiedCRUDService && typeof window.UnifiedCRUDService.saveEntity === 'function') {
      crudResult = await window.UnifiedCRUDService.saveEntity('ticker', tickerPayload, {
        modalId: 'tickersModal',
        successMessage: `טיקר ${symbol} נוסף בהצלחה!`,
        entityName: 'טיקר',
        reloadFn: window.loadTickersData,
        requiresHardReload: false
      });
    } else {
      // Fallback to direct API call with CRUDResponseHandler
    let response;
    if (window.TickersData && window.TickersData.createTicker) {
      response = await window.TickersData.createTicker(tickerPayload);
    } else {
      // Fallback ל-direct fetch אם השירות לא זמין
      response = await fetch('/api/tickers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tickerPayload),
      });
    }

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
      crudResult = await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'tickersModal',
      successMessage: `טיקר ${symbol} נוסף בהצלחה!`,
      entityName: 'טיקר',
      reloadFn: window.loadTickersData,
      requiresHardReload: false
    });
    }
    
    const newTickerId = Number(crudResult?.data?.id || crudResult?.id);
    if (Number.isFinite(newTickerId) && window.TagService) {
      try {
        await window.TagService.replaceEntityTags('ticker', newTickerId, tagIds);
      } catch (tagError) {
        window.Logger?.warn('⚠️ Failed to update ticker tags', {
          error: tagError,
          tickerId: newTickerId,
          page: 'tickers'
        });
        const errorMessage = window.TagService?.formatTagErrorMessage
          ? window.TagService.formatTagErrorMessage('הטיקר נשמר אך התגיות לא עודכנו', tagError)
          : 'הטיקר נשמר אך התגיות לא עודכנו';
        window.showErrorNotification?.('שמירת תגיות', errorMessage);
      }
    }

    // Return result so wrapper functions can check if save was successful
    return crudResult;

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת טיקר');
    throw error; // Re-throw so wrapper can handle it
  }
}

/**
 * עדכון טיקר קיים
 *
 * כולל ולידציה של פריטים מקושרים באמצעות המערכת הכללית:
 * - API: /api/linked-items/ticker/{id}
 * - פונקציה: window.showLinkedItemsWarning('ticker', id)
 * - מונע ביטול כאשר יש פריטים פתוחים
 *
 * Update ticker
 * Note: updated_at field is NOT modified during user updates - it's reserved for future pricing system updates
 * @returns {Promise<void>}
 */
async function updateTicker() {
  
  // ניקוי מטמון לפני פעולת CRUD - עריכה  // שימוש ב-DataCollectionService לאיסוף נתונים
  // שימוש בשדות החדשים מהטופס (ModalManagerV2)
  const tickerData = DataCollectionService.collectFormData({
    id: { id: 'tickerId', type: 'text' }, // שדה ID נסתר שנוסף בעריכה
    symbol: { id: 'tickerSymbol', type: 'text' },
    name: { id: 'tickerName', type: 'text' },
    type: { id: 'tickerType', type: 'text' },
    currency_id: { id: 'tickerCurrency', type: 'int' },
    status: { id: 'tickerStatus', type: 'text' },
    remarks: { id: 'tickerRemarks', type: 'text' },
    tag_ids: { id: 'tickerTags', type: 'tags', default: [] }
  });

  const { id, symbol, name, type, currency_id, status, remarks, tag_ids = [] } = tickerData;
  const tagIds = Array.isArray(tag_ids) ? tag_ids : [];
  
  // Collect provider symbols
  const providerSymbols = collectProviderSymbols();
  if (providerSymbols) {
    tickerData.provider_symbols = providerSymbols;
  }
  
  // קבלת הטיקר הקיים לבדיקות ולידציה
  const originalTicker = (window.tickersData || []).find(t => t.id === parseInt(id));
  if (!originalTicker) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
    }
    return;
  }

  // ולידציה בסיסית (הסרת ולידציה גלובלית ישנה - הטופס החדש לא משתמש ב-editTickerForm)
  if (!symbol || symbol.length === 0) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'סמל הטיקר הוא שדה חובה');
    }
    return;
  }

  if (!name || name.length < 2) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'שם החברה חייב להכיל לפחות 2 תווים');
    }
    return;
  }

  if (!type) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'סוג הטיקר הוא שדה חובה');
    }
    return;
  }

  if (!currency_id) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'מטבע הוא שדה חובה');
    }
    return;
  }

  if (!status || !['open', 'closed', 'cancelled'].includes(status)) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'יש לבחור סטטוס תקין');
    }
    return;
  }

  // בדיקה אם הסמל כבר קיים בטיקרים אחרים (לא בטיקר הנוכחי)
  const existingTicker = (window.tickersData || []).find(t =>
    t.symbol.toUpperCase() === symbol.toUpperCase() &&
        t.id !== parseInt(id),
  );
  if (existingTicker) {
    if (window.showErrorNotification) {
      window.showErrorNotification(
        'שגיאת וולידציה',
        `הסמל ${symbol} כבר קיים במערכת (טיקר: ${existingTicker.name})`,
      );
    }
    return;
  }

  const finalStatus = status;

  // בדיקה אם הסטטוס השתנה ל"מבוטל" - אם כן, בדוק פריטים מקושרים
  // (originalTicker כבר הוגדר למעלה)
  if (originalTicker && status === 'cancelled' && originalTicker.status !== 'cancelled') {

    // בדיקת פריטים מקושרים באמצעות המערכת הכללית
    try {

      // שימוש ב-API הכללי לקבלת פריטים מקושרים
      const response = await fetch(`/api/linked-items/ticker/${parseInt(id)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const linkedItemsData = await response.json();

      // בדיקה אם יש פריטים פתוחים שמונעים ביטול
      const openTrades = linkedItemsData.child_entities ? linkedItemsData.child_entities.filter(entity =>
        entity.type === 'trade' && entity.status === 'open',
      ) : [];
      const openPlans = linkedItemsData.child_entities ? linkedItemsData.child_entities.filter(entity =>
        entity.type === 'trade_plan' && entity.status === 'open',
      ) : [];

      const hasOpenTrades = openTrades.length > 0;
      const hasOpenPlans = openPlans.length > 0;

      if (hasOpenTrades || hasOpenPlans) {

        // שימוש במערכת הכללית להצגת פריטים מקושרים
        if (window.showLinkedItemsModal) {
          // טעינת נתוני פריטים מקושרים
          try {
            const response = await fetch(`/api/linked-items/ticker/${parseInt(id)}`);
            if (response.ok) {
              const data = await response.json();
              window.showLinkedItemsModal(data, 'ticker', parseInt(id));
            } else {
              throw new Error('Failed to load linked items data');
            }
          } catch (error) {
            handleApiError(error, 'פריטים מקושרים');
          }
        } else {
          handleFunctionNotFound('showLinkedItemsModal', 'פונקציית בדיקת פריטים מקושרים לא זמינה');
          // Fallback - הצגת הודעת אזהרה
          if (window.showWarningNotification) {
            window.showWarningNotification(
              'לא ניתן לבטל טיקר',
              `לא ניתן לבטל את הטיקר ${originalTicker.symbol} כי יש לו טריידים או תכנונים פתוחים. יש לסגור אותם קודם.`,
            );
          }
        }
        return; // לא ממשיכים עם העדכון
      }

    } catch (error) {
      handleSystemError(error, 'בדיקת פריטים מקושרים בעדכון');
      if (window.showErrorNotification) {
        window.showErrorNotification(
          'שגיאה בבדיקה',
          'שגיאה בבדיקת פריטים מקושרים. לא ניתן לבטל את הטיקר.',
        );
      }
      return; // לא ממשיכים עם העדכון
    }
  }

  try {
    const tickerPayload = {
      id: parseInt(id),
      symbol,
      name,
      type,
      currency_id,
      status: finalStatus,
      remarks: remarks || null,
    };
    
    // Add provider symbols if they exist
    if (providerSymbols) {
      tickerPayload.provider_symbols = providerSymbols;
    }

    // Use UnifiedCRUDService for consistent CRUD operations
    let updateResult;
    if (window.UnifiedCRUDService && typeof window.UnifiedCRUDService.saveEntity === 'function') {
      updateResult = await window.UnifiedCRUDService.saveEntity('ticker', tickerPayload, {
        modalId: 'tickersModal',
        successMessage: `טיקר ${symbol} עודכן בהצלחה!`,
        entityName: 'טיקר',
        reloadFn: window.loadTickersData,
        requiresHardReload: false
      });
    } else {
      // Fallback to direct API call with CRUDResponseHandler
    let response;
    if (window.TickersData && window.TickersData.updateTicker) {
      response = await window.TickersData.updateTicker(parseInt(id), tickerPayload);
    } else {
      // Fallback ל-direct fetch אם השירות לא זמין
      response = await fetch(`/api/tickers/${parseInt(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tickerPayload),
      });
    }

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
      updateResult = await CRUDResponseHandler.handleUpdateResponse(response, {
      modalId: 'tickersModal',
      successMessage: `טיקר ${symbol} עודכן בהצלחה!`,
      apiUrl: '/api/tickers/',
      entityName: 'טיקר',
      reloadFn: window.loadTickersData,
      requiresHardReload: false
    });
    }
    
    if (updateResult !== null && window.TagService) {
      try {
        await window.TagService.replaceEntityTags('ticker', Number.parseInt(id, 10), tagIds);
      } catch (tagError) {
        window.Logger?.warn('⚠️ Failed to update ticker tags', {
          error: tagError,
          tickerId: id,
          page: 'tickers'
        });
        const errorMessage = window.TagService?.formatTagErrorMessage
          ? window.TagService.formatTagErrorMessage('הטיקר עודכן אך שמירת התגיות נכשלה', tagError)
          : 'הטיקר עודכן אך שמירת התגיות נכשלה';
        window.showErrorNotification?.('שמירת תגיות', errorMessage);
      }
    }

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'עדכון טיקר');
  }
}

/**
 * Cancel ticker (change status to cancelled)
 * @param {number|string} id - Ticker ID
 * @returns {Promise<void>}
 */
async function cancelTicker(id) {


  try {
    // קבלת פרטי הטיקר לצורך הודעת האישור
    let tickerDetails = '';
    try {
      const response = await fetch(`/api/tickers/${id}`);
      if (response.ok) {
        const tickerData = await response.json();
        const ticker = tickerData.data;
        tickerDetails = `\n\nפרטי הטיקר:\n• סימבול: ${ticker.symbol || 'לא מוגדר'}\n• שם: ${ticker.name || 'לא מוגדר'}\n• סטטוס: ${ticker.status || 'לא מוגדר'}`;
      }
    } catch {
      // window.Logger.warn('לא ניתן לטעון פרטי טיקר:', error, { page: "tickers" });
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ביטול טיקר',
        `האם אתה בטוח שברצונך לבטל טיקר זה?${tickerDetails}`,
        async () => {
          // המשתמש אישר - בדיקת מקושרים ואז ביצוע הביטול
          await checkLinkedItemsAndCancelTicker(id);
        },
        () => {
          // המשתמש ביטל - לא עושים כלום
        },
        'danger', // צבע אדום לחלון האישור
      );
    } else {
      // Fallback למקרה שהמערכת הגלובלית לא זמינה
      const confirmed = typeof showConfirmationDialog === 'function' ? 
        await new Promise(resolve => {
          showConfirmationDialog(
            `האם אתה בטוח שברצונך לבטל טיקר זה?${tickerDetails}`,
            () => resolve(true),
            () => resolve(false),
            'ביטול טיקר',
            'בטל',
            'חזור'
          );
        }) : 
        window.window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך לבטל טיקר זה?${tickerDetails}`);
      if (!confirmed) {
        return;
      }
      await checkLinkedItemsAndCancelTicker(id);
    }

  } catch (error) {
    handleSystemError(error, 'ביטול טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * בדיקת מקושרים וביצוע ביטול טיקר
 * @deprecated Use window.checkLinkedItemsAndPerformAction('ticker', tickerId, 'cancel', performTickerCancellation) instead
 */
async function checkLinkedItemsAndCancelTicker(tickerId) {
  await window.checkLinkedItemsAndPerformAction('ticker', tickerId, 'cancel', performTickerCancellation);
}

/**
 * Perform ticker cancellation (actual API call)
 * @param {number|string} tickerId - Ticker ID
 * @returns {Promise<void>}
 */
async function performTickerCancellation(tickerId) {
  try {
    // שליחה לשרת
    const response = await fetch(`/api/tickers/${tickerId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' }),
    });

    // השתמש במערכת הגלובלית החדשה
    const handled = await window.handleApiResponseWithRefresh(response, {
      loadDataFunction: window.loadTickersData,
      updateActiveFieldsFunction: window.updateActiveTradesField,
      operationName: 'ביטול',
      itemName: 'הטיקר',
      successMessage: 'הטיקר בוטל בהצלחה',
      onSuccess: () => {
        if (typeof window.onTickerStatusChanged === 'function') {
          window.onTickerStatusChanged(tickerId, 'cancelled');
        }
      }
    });

    if (!handled) {
      const errorResponse = await response.text();

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם השגיאה קשורה לטריידים פעילים
        if (errorData.error && errorData.error.message && typeof errorData.error.message === 'string' &&
                    errorData.error.message.includes('active trades')) {

          // הצגת אזהרת פריטים מקושרים
          if (window.showLinkedItemsModal) {
            try {
              const response = await fetch(`/api/linked-items/ticker/${tickerId}`);
              if (response.ok) {
                const data = await response.json();
                window.showLinkedItemsModal(data, 'ticker', tickerId);
              } else {
                throw new Error('Failed to load linked items data');
              }
            } catch (error) {
              handleApiError(error, 'פריטים מקושרים');
            }
          } else {
            if (window.showErrorNotification) {
              window.showErrorNotification('שגיאה בביטול', 'לא ניתן לבטל טיקר זה - יש טריידים פעילים מקושרים אליו');
            }
          }
          return;
        }

        // בדיקה אם הטיקר כבר מבוטל
        if (errorData.error && errorData.error.message && typeof errorData.error.message === 'string' &&
                    errorData.error.message.includes('already cancelled')) {

          if (window.showErrorNotification) {
            window.showErrorNotification('מידע', 'הטיקר כבר מבוטל');
          }
          return;
        }

        // שגיאה אחרת
        handleApiError('שגיאה בביטול טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר: ' + errorData.error.message);
        }

      } catch {
        handleApiError('שגיאה בביטול טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר');
        }
      }
    }

  } catch (error) {
    handleSystemError(error, 'ביצוע ביטול טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר');
    }
  }
}

/**
 * בדיקת פריטים מקושרים לפני מחיקת טיקר
 * @deprecated Use window.checkLinkedItemsBeforeAction('ticker', tickerId, 'delete') instead
 */
async function checkLinkedItemsBeforeDeleteTicker(tickerId) {
  return await window.checkLinkedItemsBeforeAction('ticker', tickerId, 'delete');
}

/**
 * בדיקת פריטים מקושרים לפני ביטול טיקר
 * @deprecated Use window.checkLinkedItemsBeforeAction('ticker', tickerId, 'cancel') instead
 */
async function checkLinkedItemsBeforeCancelTicker(tickerId) {
  return await window.checkLinkedItemsBeforeAction('ticker', tickerId, 'cancel');
}

/**
 * Get ticker symbol by ID
 * @param {number|string} tickerId - Ticker ID
 * @returns {string|null} Ticker symbol or null
 */
function getTickerSymbol(tickerId) {
  try {
    // נסה למצוא בטיקרים שכבר נטענו
    if (window.tickersData) {
      const ticker = window.tickersData.find(t => t.id === tickerId);
      if (ticker) {
        return ticker.symbol;
      }
    }
    return `טיקר ${tickerId}`;
  } catch (error) {
    window.Logger.error('getTickerSymbol failed', { page: 'tickers', tickerId, error: error?.message || error });
    return `טיקר ${tickerId}`;
  }
}

/**
 * עדכון כל הסטטוסים של טיקרים
 * @deprecated Use window.tickerService.updateAllTickerStatuses() instead
 */
async function updateAllTickerStatuses() {
  // קריאה לשירות המאוחד
  if (window.tickerService && window.tickerService.updateAllTickerStatuses) {
    return await window.tickerService.updateAllTickerStatuses();
  } else {
    // fallback לפונקציה המקורית אם השירות לא זמין
    try {
      const response = await fetch('/api/tickers/update-all-statuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // השתמש במערכת הגלובלית החדשה
      const handled = await window.handleApiResponseWithRefresh(response, {
        loadDataFunction: window.loadTickersData,
        updateActiveFieldsFunction: window.updateActiveTradesField,
        operationName: 'עדכון',
        itemName: 'סטטוסי כל הטיקרים',
        successMessage: 'סטטוסים של כל הטיקרים עודכנו בהצלחה'
      });

      if (!handled) {
        const errorResponse = await response.text();
        handleApiError('שגיאה בעדכון סטטוסים', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון סטטוסים של טיקרים');
        }
      }

    } catch (error) {
      handleSystemError(error, 'עדכון סטטוסים');
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון סטטוסים של טיקרים');
      }
    }
  }
}

// Function removed - not used anywhere

/**
 * Perform ticker cancellation (legacy function)
 * @param {number|string} id - Ticker ID
 * @returns {Promise<void>}
 */
async function performCancelTicker(id) {


  // מציאת פרטי הטיקר
  const ticker = (window.tickersData || []).find(t => t.id === id);
  if (!ticker) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'טיקר לא נמצא', 6000, 'system');
    }
    return;
  }

  try {
    const response = await fetch(`/api/tickers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled',
      }),
    });

    if (response.ok) {
      await response.json(); // result not used


      // הצגת הודעת הצלחה עם פרטי הטיקר
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', `הטיקר ${ticker.symbol} - ${ticker.name} בוטל בהצלחה`);
      }

      // רענון הנתונים
      if (typeof loadTickersData === 'function') {
        // אנחנו בעמוד tickers
        // ניקוי מטמון לפני רענון
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCache === 'function') {
          await window.UnifiedCacheManager.clearAllCache('Light');
        } else if (typeof window.clearAllCache === 'function') {
          window.clearAllCache();
        }
        // Clear local tickers data
        window.tickersData = [];
        tickersData = [];
        await loadTickersData();
        // עדכון שדה active_trades רק בעמוד tickers
        await updateActiveTradesField();
      } else {
        // רענון כללי או קריאה למערכת callback
        if (typeof window.onTickerStatusChanged === 'function') {
          window.onTickerStatusChanged(tickerId, 'cancelled');
        } else {
          location.reload();
        }
      }

    } else if (response.status === 404) {
      // הטיקר כבר לא קיים בבסיס הנתונים - נסיר אותו מהמטמון ונרענן
      window.Logger.warn(`טיקר ${id} כבר לא קיים בבסיס הנתונים, מרענן נתונים`, { page: "tickers" });
      
      if (window.showSuccessNotification) {
        window.showSuccessNotification('מידע', `הטיקר כבר לא קיים במערכת - מרענן נתונים`);
      }

      // רענון הנתונים כמו במקרה של הצלחה
      if (typeof loadTickersData === 'function') {
        // ניקוי מטמון לפני רענון
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCache === 'function') {
          await window.UnifiedCacheManager.clearAllCache('Light');
        } else if (typeof window.clearAllCache === 'function') {
          window.clearAllCache();
        }
        // Clear local tickers data
        window.tickersData = [];
        tickersData = [];
        await loadTickersData();
        await updateActiveTradesField();
      } else {
        if (typeof window.onTickerStatusChanged === 'function') {
          window.onTickerStatusChanged(id, 'cancelled');
        } else {
          location.reload();
        }
      }
    } else {
      const errorResponse = await response.text();

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם הטיקר כבר מבוטל
        if (errorData.error && errorData.error.message && typeof errorData.error.message === 'string' &&
                    errorData.error.message.includes('already cancelled')) {

          if (window.showErrorNotification) {
            window.showErrorNotification('מידע', 'הטיקר כבר מבוטל');
          }
          return;
        }

        // שגיאה אחרת
        handleApiError('שגיאה בביטול טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר: ' + errorData.error.message);
        }

      } catch {
        handleApiError('שגיאה בביטול טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר');
        }
      }
    }

  } catch (error) {
    handleSystemError(error, 'ביטול טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול טיקר');
    }
  }
}

/**
 * הפעלה מחדש של טיקר מבוטל
 *
 * @param {string|number} tickerId - מזהה הטיקר
 */
async function reactivateTicker(tickerId) {
  try {

    // מציאת הטיקר בנתונים
    const ticker = (window.tickersData || []).find(t => t.id === tickerId);
    if (!ticker) {
      handleElementNotFound('reactivateTicker', `טיקר לא נמצא: ${tickerId}`);
      throw new Error('טיקר לא נמצא');
    }

    const response = await fetch(`/api/tickers/${tickerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'open',
      }),
    });

    // השתמש במערכת הגלובלית החדשה
    const handled = await window.handleApiResponseWithRefresh(response, {
      loadDataFunction: window.loadTickersData,
      updateActiveFieldsFunction: window.updateActiveTradesField,
      operationName: 'שיחזור',
      itemName: 'הטיקר',
      successMessage: 'טיקר הופעל מחדש בהצלחה!',
      onSuccess: () => {
        if (typeof window.onTickerStatusChanged === 'function') {
          window.onTickerStatusChanged(tickerId, 'open');
        }
      }
    });

    if (!handled) {
      // fallback במקרה של שגיאה לא צפויה
      location.reload();
    }

  } catch (error) {
    handleSystemError(error, 'הפעלה מחדש של טיקר');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש');
    }
  }
}

// הפונקציה הוסרה - קיימת כבר בשורה 417

/**
 * בדיקת מקושרים וביצוע מחיקת טיקר
 * @deprecated Use window.checkLinkedItemsAndPerformAction('ticker', tickerId, 'delete', performTickerDeletion) instead
 */
async function checkLinkedItemsAndDeleteTicker(tickerId) {
  await window.checkLinkedItemsAndPerformAction('ticker', tickerId, 'delete', performTickerDeletion);
}

/**
 * Perform ticker deletion (actual API call)
 * @param {number|string} tickerId - Ticker ID
 * @returns {Promise<void>}
 */
async function performTickerDeletion(tickerId) {
  try {
    // Use UnifiedCRUDService for consistent CRUD operations
    if (window.UnifiedCRUDService && typeof window.UnifiedCRUDService.deleteEntity === 'function') {
      await window.UnifiedCRUDService.deleteEntity('ticker', tickerId, {
        successMessage: 'טיקר נמחק בהצלחה',
        entityName: 'טיקר',
        reloadFn: () => {
          window.loadTickersData({ force: true });
          // Update active trades field if function exists
          if (typeof window.updateActiveTradesField === 'function') {
            window.updateActiveTradesField();
          }
          // Call onTickerDeleted callback if exists
          if (typeof window.onTickerDeleted === 'function') {
            window.onTickerDeleted(tickerId);
          }
        },
        requiresHardReload: false
      });
    } else {
      // Fallback to direct API call with CRUDResponseHandler
    let response;
    if (typeof window.TickersData?.deleteTicker === 'function') {
      response = await window.TickersData.deleteTicker(tickerId);
    } else {
      // Fallback to direct fetch
      response = await fetch(`/api/tickers/${tickerId}`, {
        method: 'DELETE',
      });
    }

    // Use CRUDResponseHandler for consistent response handling
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'טיקר נמחק בהצלחה',
      entityName: 'טיקר',
      reloadFn: () => {
        window.loadTickersData({ force: true });
        // Update active trades field if function exists
        if (typeof window.updateActiveTradesField === 'function') {
          window.updateActiveTradesField();
        }
        // Call onTickerDeleted callback if exists
        if (typeof window.onTickerDeleted === 'function') {
          window.onTickerDeleted(tickerId);
        }
      },
      requiresHardReload: false
    });
    }

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת טיקר');
  }
}

/**
 * מחיקת טיקר
 * Includes linked items check
 */
async function deleteTicker(tickerId) {
    window.Logger.info(`🗑️ deleteTicker called for ticker ${tickerId}`, { tickerId, page: 'tickers' });
    
    try {
        // Get ticker details for confirmation message
        let tickerDetails = `טיקר #${tickerId}`;
        const ticker = window.tickersData?.find(t => t.id === tickerId || t.id === parseInt(tickerId));
        
        if (ticker) {
            const symbol = ticker.symbol || 'לא מוגדר';
            const name = ticker.name || 'לא מוגדר';
            const statusText = ticker.status === 'open' ? 'פתוח' :
                             ticker.status === 'closed' ? 'סגור' :
                             ticker.status === 'cancelled' ? 'מבוטל' : ticker.status || 'לא מוגדר';
            const typeText = ticker.type || 'לא מוגדר';
            
            tickerDetails = `${symbol} - ${name}, סטטוס: ${statusText}, סוג: ${typeText}`;
        }
        
        // Check linked items first (Trades, Trade Plans, Alerts, Notes)
        window.Logger.info('🔍 Checking for linked items before deletion', { tickerId, page: 'tickers' });
        if (typeof window.checkLinkedItemsBeforeAction === 'function') {
            window.Logger.info('✅ checkLinkedItemsBeforeAction function exists', { tickerId, page: 'tickers' });
            const hasLinkedItems = await window.checkLinkedItemsBeforeAction('ticker', tickerId, 'delete');
            window.Logger.info(`🔍 Linked items check result: hasLinkedItems=${hasLinkedItems}`, { tickerId, page: 'tickers' });
            if (hasLinkedItems) {
                window.Logger.info('🚫 Ticker has linked items, deletion cancelled', { tickerId, page: 'tickers' });
                return;
            }
        } else {
            window.Logger.warn('⚠️ checkLinkedItemsBeforeAction function not available', { tickerId, page: 'tickers' });
        }
        
        // Use warning system for confirmation with detailed information
        if (window.showDeleteWarning) {
            window.showDeleteWarning('ticker', tickerDetails, 'טיקר',
                async () => await performTickerDeletion(tickerId),
                () => {}
            );
        } else {
            // Fallback to simple confirm
            if (!window.showConfirmationDialog('האם אתה בטוח שברצונך למחוק את הטיקר?')) {
                return;
            }
            await performTickerDeletion(tickerId);
        }
        
    } catch (error) {
        window.Logger.error('Error deleting ticker:', error, { tickerId, page: 'tickers' });
        CRUDResponseHandler.handleError(error, 'מחיקת טיקר');
    }
}

/**
 * אישור מחיקת טיקר (לשמירה על תאימות לאחור)
 * @deprecated Use deleteTicker instead
 */
async function confirmDeleteTicker(id) {
  
  // ניקוי מטמון לפני פעולת CRUD - מחיקה  // מציאת הטיקר לפני מחיקה כדי להציג פרטים בהודעה
  const ticker = (window.tickersData || []).find(t => t.id === id);
  const tickerInfo = ticker ? `${ticker.symbol} - ${ticker.name}` : `טיקר ${id}`;

  try {
    // שימוש בשירות הנתונים החדש
    let response;
    if (window.TickersData && window.TickersData.deleteTicker) {
      response = await window.TickersData.deleteTicker(id);
    } else {
      // Fallback ל-direct fetch אם השירות לא זמין
      response = await fetch(`/api/tickers/${id}`, {
        method: 'DELETE',
      });
    }

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: `טיקר ${tickerInfo} נמחק בהצלחה!`,
      apiUrl: '/api/tickers/',
      entityName: 'טיקר',
      reloadFn: window.loadTickersData,
      requiresHardReload: false
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת טיקר');
  }
}

// ========================================
// פונקציות מודל פריטים מקושרים
// ========================================


// ========================================
// פונקציות עזר
// ========================================

/**
 * הצגת הודעה
 */


// ===== DATA MANAGEMENT FUNCTIONS =====
// Data loading, caching, and table management

// REMOVED: clearTickersCache - use window.UnifiedCacheManager.clearAllCache() or window.clearAllCache() from unified-cache-manager.js instead

/**
 * Internal function for loading tickers data
 * @param {Object} [options={}] - Loading options (force, signal, etc.)
 * @returns {Promise<Array>} Array of tickers
 */
/**
 * Check if ticker has complete data (historical data and technical indicators)
 * @param {Object} ticker - Ticker object
 * @returns {Object} Object with data completeness status
 */
function checkTickerDataCompleteness(ticker) {
  const result = {
    hasPrice: false,
    hasHistorical: false,
    hasATR: false,
    hasWeek52: false,
    hasVolatility: false,
    hasMA20: false,
    hasMA150: false,
    historicalCount: 0,
    missingFields: [],
    missingCalculations: [],
    completeness: 0 // 0-100 percentage
  };

  // Check for price data
  const hasPrice = ticker && (
    ticker.current_price !== undefined && ticker.current_price !== null ||
    ticker.price !== undefined && ticker.price !== null
  );
  result.hasPrice = hasPrice;
  if (!hasPrice) {
    result.missingFields.push('נתוני מחיר נוכחי');
  }

  // Check for historical data count
  if (ticker.historical_quotes_count !== undefined) {
    result.historicalCount = ticker.historical_quotes_count;
    result.hasHistorical = result.historicalCount >= 150;
    if (!result.hasHistorical) {
      result.missingFields.push(`נתונים היסטוריים (${result.historicalCount}/150)`);
    }
  } else {
    result.missingFields.push('נתונים היסטוריים (לא נטען)');
  }

  // Check ATR
  if (ticker.atr !== undefined && ticker.atr !== null) {
    result.hasATR = true;
  } else {
    result.missingCalculations.push('ATR');
  }

  // Check 52W
  if (ticker.week52_high !== undefined && ticker.week52_high !== null &&
      ticker.week52_low !== undefined && ticker.week52_low !== null) {
    result.hasWeek52 = true;
  } else {
    result.missingCalculations.push('52W High/Low');
  }

  // Check Volatility
  if (ticker.volatility !== undefined && ticker.volatility !== null) {
    result.hasVolatility = true;
  } else {
    result.missingCalculations.push('תנודתיות');
  }

  // Check MA 20
  if (ticker.ma_20 !== undefined && ticker.ma_20 !== null) {
    result.hasMA20 = true;
  } else {
    result.missingCalculations.push('MA 20');
  }

  // Check MA 150
  if (ticker.ma_150 !== undefined && ticker.ma_150 !== null) {
    result.hasMA150 = true;
  } else {
    result.missingCalculations.push('MA 150');
  }

  // Calculate completeness percentage
  const totalChecks = 7; // price, historical, ATR, 52W, Volatility, MA20, MA150
  const passedChecks = [
    result.hasPrice,
    result.hasHistorical,
    result.hasATR,
    result.hasWeek52,
    result.hasVolatility,
    result.hasMA20,
    result.hasMA150
  ].filter(Boolean).length;
  result.completeness = Math.round((passedChecks / totalChecks) * 100);

  return result;
}

/**
 * Check completeness of data for all tickers
 * @param {Array} tickers - Array of tickers
 * @returns {Object} Summary of data completeness
 */
async function checkTickersDataCompleteness(tickers) {
  if (!Array.isArray(tickers) || tickers.length === 0) {
    return {
      total: 0,
      complete: 0,
      incomplete: 0,
      missingHistorical: [],
      missingIndicators: []
    };
  }

  const summary = {
    total: tickers.length,
    complete: 0,
    incomplete: 0,
    missingHistorical: [],
    missingIndicators: []
  };

  tickers.forEach(ticker => {
    const completeness = checkTickerDataCompleteness(ticker);
    if (completeness.completeness === 100) {
      summary.complete++;
    } else {
      summary.incomplete++;
      if (!completeness.hasHistorical) {
        summary.missingHistorical.push({
          id: ticker.id,
          symbol: ticker.symbol,
          count: completeness.historicalCount
        });
      }
      if (completeness.missingCalculations.length > 0) {
        summary.missingIndicators.push({
          id: ticker.id,
          symbol: ticker.symbol,
          missing: completeness.missingCalculations
        });
      }
    }
  });

  return summary;
}

/**
 * Ensure historical data is loaded for tickers that need it
 * @param {Array} tickers - Array of tickers
 * @param {Object} options - Options (silent, showProgress)
 * @returns {Promise<Array>} Array of tickers with historical data
 */
async function ensureHistoricalDataForTickers(tickers, options = {}) {
  const { silent = false, showProgress = true } = options;
  
  if (!Array.isArray(tickers) || tickers.length === 0) {
    return tickers;
  }

  if (!window.ExternalDataService) {
    window.Logger?.warn?.('ExternalDataService not available, skipping historical data loading', { page: 'tickers' });
    return tickers;
  }

  const overlayId = 'tickers-ensure-historical';
  let progressStep = 0;
  const totalSteps = tickers.length;

  if (showProgress && window.UnifiedProgressManager) {
    // Create overlay first with config
    const progressManager = new window.UnifiedProgressManager();
    progressManager.createOverlay(overlayId, {
      title: 'טוען נתונים היסטוריים',
      totalSteps: totalSteps,
      stepLabels: Array(totalSteps).fill(''),
      stepDescriptions: Array(totalSteps).fill('')
    });
    // Show initial progress
    window.unifiedProgressManager.showProgress(overlayId, 1, 'בודק טיקרים', `בודק ${tickers.length} טיקרים...`);
  }

  const tickersWithData = [];
  const tickersNeedingData = [];

  // First pass: identify tickers needing data
  for (const ticker of tickers) {
    const completeness = checkTickerDataCompleteness(ticker);
    if (!completeness.hasHistorical || completeness.historicalCount < 150) {
      tickersNeedingData.push(ticker);
    } else {
      tickersWithData.push(ticker);
    }
  }

  if (tickersNeedingData.length === 0) {
    if (showProgress && window.UnifiedProgressManager) {
      window.UnifiedProgressManager.hideProgress(overlayId);
    }
    if (!silent) {
      window.Logger?.info?.('All tickers have sufficient historical data', { 
        count: tickers.length, 
        page: 'tickers' 
      });
    }
    return tickers;
  }

  if (!silent) {
    window.Logger?.info?.('Loading historical data for tickers', { 
      total: tickers.length,
      needingData: tickersNeedingData.length,
      page: 'tickers' 
    });
  }

  // Second pass: load historical data for tickers that need it
  for (let i = 0; i < tickersNeedingData.length; i++) {
    const ticker = tickersNeedingData[i];
    progressStep++;

    if (showProgress && window.UnifiedProgressManager) {
      const percentage = Math.round((progressStep / totalSteps) * 100);
      window.UnifiedProgressManager.updateProgress(overlayId, percentage, `טוען נתונים היסטוריים עבור ${ticker.symbol || ticker.id} (${progressStep}/${totalSteps})`);
    }

    try {
      // Use ExternalDataService to refresh ticker data with historical data
      const refreshedData = await window.ExternalDataService.refreshTickerData(ticker.id, {
        forceRefresh: false,
        includeHistorical: true,
        daysBack: 150
      });

      // Merge refreshed data with original ticker
      const enrichedTicker = {
        ...ticker,
        ...refreshedData,
        historical_quotes_count: refreshedData.historical_quotes_count || 0
      };

      tickersWithData.push(enrichedTicker);

      // Save to cache
      if (window.UnifiedCacheManager) {
        const cacheKey = `ticker-full-${ticker.id}`;
        await window.UnifiedCacheManager.save(cacheKey, enrichedTicker, 'memory', { ttl: 3600 });
      }

      if (!silent) {
        window.Logger?.debug?.('Loaded historical data for ticker', {
          tickerId: ticker.id,
          symbol: ticker.symbol,
          historicalCount: enrichedTicker.historical_quotes_count,
          page: 'tickers'
        });
      }
    } catch (error) {
      window.Logger?.warn?.('Failed to load historical data for ticker', {
        tickerId: ticker.id,
        symbol: ticker.symbol,
        error: error.message,
        page: 'tickers'
      });
      // Add ticker without historical data
      tickersWithData.push(ticker);
    }
  }

  if (showProgress && window.UnifiedProgressManager) {
    window.UnifiedProgressManager.hideProgress(overlayId);
  }

  return tickersWithData;
}

/**
 * Enrich tickers with full data from EntityDetailsAPI
 * @param {Array} tickers - Array of basic tickers
 * @param {Object} options - Options (silent, showProgress, forceRefresh)
 * @returns {Promise<Array>} Array of enriched tickers
 */
async function enrichTickersWithFullData(tickers, options = {}) {
  const { silent = false, showProgress = true, forceRefresh = false } = options;

  if (!Array.isArray(tickers) || tickers.length === 0) {
    return tickers;
  }

  if (!window.entityDetailsAPI || typeof window.entityDetailsAPI.getEntityDetails !== 'function') {
    window.Logger?.warn?.('EntityDetailsAPI not available, skipping data enrichment', { page: 'tickers' });
    return tickers;
  }

  const overlayId = 'tickers-enrich-data';
  const totalSteps = tickers.length;
  let completedCount = 0;
  const batchSize = options.batchSize || 5;
  const maxConcurrent = options.maxConcurrent || 3;

  if (showProgress && window.UnifiedProgressManager) {
    // Create overlay first with config
    const progressManager = new window.UnifiedProgressManager();
    progressManager.createOverlay(overlayId, {
      title: 'מעשיר נתוני טיקרים',
      totalSteps: totalSteps,
      stepLabels: Array(totalSteps).fill(''),
      stepDescriptions: Array(totalSteps).fill('')
    });
    // Show initial progress
    window.unifiedProgressManager.showProgress(overlayId, 1, 'מתחיל תהליך', `טוען נתונים מלאים עבור ${tickers.length} טיקרים...`);
  }

  // Helper function to enrich a single ticker
  const enrichSingleTicker = async (ticker, index) => {
    try {
      // Check cache first
      const cacheKey = `ticker-full-${ticker.id}`;
      let fullData = null;

      if (!forceRefresh && window.UnifiedCacheManager) {
        fullData = await window.UnifiedCacheManager.get(cacheKey, 'memory');
        if (fullData) {
          if (!silent) {
            window.Logger?.debug?.('Loaded full ticker data from cache', {
              tickerId: ticker.id,
              symbol: ticker.symbol,
              page: 'tickers'
            });
          }
        }
      }

      // If not in cache, load from API
      if (!fullData) {
        fullData = await window.entityDetailsAPI.getEntityDetails('ticker', ticker.id, {
          includeMarketData: true,
          includeLinkedItems: false, // Don't load linked items to avoid 429 errors
          forceRefresh: forceRefresh
        });

        // Save to cache
        if (window.UnifiedCacheManager && fullData) {
          await window.UnifiedCacheManager.save(cacheKey, fullData, 'memory', { ttl: 3600 });
        }
      }

      // Merge full data with basic ticker data
      const enrichedTicker = {
        ...ticker,
        ...fullData
      };

      completedCount++;
      if (showProgress && window.UnifiedProgressManager) {
        const percentage = Math.round((completedCount / totalSteps) * 100);
        window.UnifiedProgressManager.updateProgress(overlayId, percentage, `טוען נתונים מלאים (${completedCount}/${totalSteps})`);
      }

      if (!silent) {
        window.Logger?.debug?.('Enriched ticker with full data', {
          tickerId: ticker.id,
          symbol: ticker.symbol,
          hasATR: !!enrichedTicker.atr,
          hasWeek52: !!enrichedTicker.week52_high,
          hasVolatility: !!enrichedTicker.volatility,
          hasMA20: !!enrichedTicker.ma_20,
          hasMA150: !!enrichedTicker.ma_150,
          page: 'tickers'
        });
      }

      return { index, ticker: enrichedTicker, error: null };
    } catch (error) {
      completedCount++;
      window.Logger?.warn?.('Failed to enrich ticker with full data', {
        tickerId: ticker.id,
        symbol: ticker.symbol,
        error: error.message,
        page: 'tickers'
      });
      return { index, ticker: ticker, error: error.message };
    }
  };

  // Process tickers in batches with concurrency limit
  const enrichedResults = [];
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    
    // Process batch with concurrency limit
    const batchPromises = [];
    for (let j = 0; j < batch.length; j += maxConcurrent) {
      const concurrentBatch = batch.slice(j, j + maxConcurrent);
      const concurrentPromises = concurrentBatch.map((ticker, batchIndex) => 
        enrichSingleTicker(ticker, i + j + batchIndex)
      );
      batchPromises.push(Promise.all(concurrentPromises));
    }
    
    const batchResults = await Promise.all(batchPromises);
    enrichedResults.push(...batchResults.flat());
  }

  // Sort results by original index to maintain order
  enrichedResults.sort((a, b) => a.index - b.index);
  const enrichedTickers = enrichedResults.map(r => r.ticker);

  if (showProgress && window.UnifiedProgressManager) {
    window.UnifiedProgressManager.hideProgress(overlayId);
  }

  return enrichedTickers;
}

/**
 * Load and refresh missing data for tickers
 * @param {Array} tickers - Array of tickers
 * @param {Object} options - Options (silent, showProgress)
 * @returns {Promise<Object>} Summary of refresh operation
 */
async function loadAndRefreshMissingData(tickers, options = {}) {
  const { silent = false, showProgress = true } = options;

  if (!Array.isArray(tickers) || tickers.length === 0) {
    return {
      total: 0,
      refreshed: 0,
      failed: 0,
      errors: [],
      skipped: 0
    };
  }

  try {
    // Check for missing data using API endpoint
    const response = await fetch('/api/external-data/status/tickers/missing-data');
    if (!response.ok) {
      throw new Error(`Failed to fetch missing data status: ${response.status}`);
    }

    const data = await response.json();
    const missingDataInfo = data?.data || {};

    const missingHistorical = missingDataInfo.tickers_missing_historical || [];
    const missingIndicators = missingDataInfo.tickers_missing_indicators || [];
    const missingCurrent = missingDataInfo.tickers_missing_current || [];

    const allMissingTickerIds = new Set([
      ...missingHistorical.map(t => t.id),
      ...missingIndicators.map(t => t.id),
      ...missingCurrent.map(t => t.id)
    ]);

    if (allMissingTickerIds.size === 0) {
      if (!silent) {
        window.Logger?.info?.('No tickers with missing data found', { page: 'tickers' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showSuccess('כל הנתונים עדכניים', 'כל הטיקרים בעלי נתונים עדכניים');
        }
      }
      return {
        total: tickers.length,
        refreshed: 0,
        failed: 0,
        errors: [],
        skipped: tickers.length
      };
    }

    if (!silent) {
      window.Logger?.info?.('Found tickers with missing data', {
        missingHistorical: missingHistorical.length,
        missingIndicators: missingIndicators.length,
        missingCurrent: missingCurrent.length,
        total: allMissingTickerIds.size,
        page: 'tickers'
      });
    }

    const overlayId = 'tickers-refresh-missing';
    const tickersToRefresh = tickers.filter(t => allMissingTickerIds.has(t.id));
    const tickersSkipped = tickers.filter(t => !allMissingTickerIds.has(t.id));
    let progressStep = 0;
    const totalSteps = tickersToRefresh.length;

    if (showProgress && window.UnifiedProgressManager) {
      // Create overlay first with config
      const progressManager = new window.UnifiedProgressManager();
      progressManager.createOverlay(overlayId, {
        title: 'מרענן נתונים חסרים',
        totalSteps: totalSteps,
        stepLabels: Array(totalSteps).fill(''),
        stepDescriptions: Array(totalSteps).fill('')
      });
      // Show initial progress
      window.unifiedProgressManager.showProgress(overlayId, 1, 'מתחיל תהליך', `מרענן ${tickersToRefresh.length} טיקרים...`);
    }

    const results = {
      total: tickersToRefresh.length,
      refreshed: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < tickersToRefresh.length; i++) {
      const ticker = tickersToRefresh[i];
      progressStep++;

      if (showProgress && window.UnifiedProgressManager) {
        const percentage = Math.round((progressStep / totalSteps) * 100);
        window.UnifiedProgressManager.updateProgress(overlayId, percentage, `מרענן נתונים עבור ${ticker.symbol || ticker.id} (${progressStep}/${totalSteps})`);
      }

      try {
        if (window.ExternalDataService) {
          // Don't use forceRefresh - let backend check what's missing and load only that
          // Backend will determine what to load based on missing data check
          const refreshResult = await window.ExternalDataService.refreshTickerData(ticker.id, {
            forceRefresh: false, // Let backend decide
            includeHistorical: undefined, // Let backend decide based on missing data
            daysBack: undefined // Let backend decide
          });
          
          // Check if data was actually loaded or skipped (all fresh)
          if (refreshResult?.data?.skipped) {
            // Data was fresh, skipped refresh
            if (window.Logger) {
              window.Logger.info('Ticker data is fresh, skipped refresh', {
                tickerId: ticker.id,
                symbol: ticker.symbol,
                reason: refreshResult.data.reason,
                page: 'tickers'
              });
            }
            results.refreshed++; // Count as success (no refresh needed)
          } else {
            // Data was loaded
            results.refreshed++;
            if (window.Logger) {
              window.Logger.info('Ticker data refreshed successfully', {
                tickerId: ticker.id,
                symbol: ticker.symbol,
                actionsTaken: refreshResult?.data?.actions_taken || [],
                actionsSkipped: refreshResult?.data?.actions_skipped || [],
                page: 'tickers'
              });
            }
          }
        } else {
          throw new Error('ExternalDataService not available');
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          tickerId: ticker.id,
          symbol: ticker.symbol,
          error: error.message
        });
        window.Logger?.warn?.('Failed to refresh ticker data', {
          tickerId: ticker.id,
          symbol: ticker.symbol,
          error: error.message,
          page: 'tickers'
        });
      }
    }

    if (showProgress && window.UnifiedProgressManager) {
      window.UnifiedProgressManager.hideProgress(overlayId);
    }

    if (!silent) {
      const summaryMessage = `עודכנו ${results.refreshed} טיקרים${tickersSkipped.length > 0 ? `, ${tickersSkipped.length} דולגו (עדכניים)` : ''}${results.failed > 0 ? `, ${results.failed} נכשלו` : ''}`;
      window.Logger?.info?.('Completed refreshing missing data', {
        refreshed: results.refreshed,
        skipped: tickersSkipped.length,
        failed: results.failed,
        page: 'tickers'
      });
      
      if (window.NotificationSystem) {
        if (results.failed === 0) {
          window.NotificationSystem.showSuccess('רענון נתונים הושלם', summaryMessage);
        } else {
          window.NotificationSystem.showWarning('רענון נתונים הושלם (חלקי)', summaryMessage);
        }
      }
    }

    return {
      ...results,
      skipped: tickersSkipped.length
    };
  } catch (error) {
    window.Logger?.error?.('Failed to load and refresh missing data', {
      error: error.message,
      page: 'tickers'
    });
    return {
      total: tickers.length,
      refreshed: 0,
      failed: tickers.length,
      errors: [{ error: error.message }]
    };
  }
}

/**
 * Get data status badge HTML for a ticker
 * @param {Object} ticker - Ticker object
 * @returns {string} HTML badge element
 */
function getDataStatusBadge(ticker) {
  const completeness = checkTickerDataCompleteness(ticker);
  
  let badgeClass = 'badge bg-success';
  let badgeText = 'מלא';
  let badgeTitle = 'כל הנתונים זמינים';

  if (completeness.completeness === 0) {
    badgeClass = 'badge bg-danger';
    badgeText = 'חסר';
    badgeTitle = 'נתונים חסרים - נדרש רענון';
  } else if (completeness.completeness < 50) {
    badgeClass = 'badge bg-danger';
    badgeText = 'חלקי';
    badgeTitle = `נתונים חלקיים (${completeness.completeness}%)`;
  } else if (completeness.completeness < 100) {
    badgeClass = 'badge bg-warning';
    badgeText = 'חלקי';
    badgeTitle = `נתונים חלקיים (${completeness.completeness}%)`;
  }

  return `<span class="${badgeClass}" title="${badgeTitle}" data-bs-toggle="tooltip">${badgeText}</span>`;
}

async function loadTickersDataInternal(options = {}) {
  try {
    window.Logger.info('Loading tickers data', { page: "tickers" });

    // Guard: avoid hitting APIs before authentication is ready
    const currentUser = window.TikTrackAuth?.getCurrentUser?.();
    if (!currentUser || !currentUser.id) {
      window.Logger?.debug?.('⚠️ Skipping tickers load - user not authenticated', { page: 'tickers' });
      return [];
    }
    
    // Use TickersData service if available, otherwise fallback to direct API call
    let rawTickers = [];
    if (window.TickersData?.loadTickersData) {
      rawTickers = await window.TickersData.loadTickersData({ force: options.force || false });
      window.Logger.info('📊 נתונים שהתקבלו מ-TickersData service:', rawTickers.length, 'טיקרים', { page: "tickers" });
    } else {
      // Fallback: direct API call with cache bypass
      if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCache === 'function') {
        await window.UnifiedCacheManager.clearAllCache('Light');
      } else if (typeof window.clearAllCache === 'function') {
        window.clearAllCache();
      }
      // Clear local tickers data
      window.tickersData = [];
      tickersData = [];
      
      // טעינת מטבעות אם עוד לא נטענו
      if (!window.currenciesLoaded) {
        await loadCurrenciesData();
      }

      // קריאה ישירה לשרת עם timestamp למניעת cache
      const response = await fetch(`/api/tickers/?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      rawTickers = data?.data || data;
      
      // Log volume data for debugging
      if (window.Logger && rawTickers && rawTickers.length > 0) {
        const firstTicker = rawTickers[0];
        window.Logger.info('📊 First ticker from API:', {
          symbol: firstTicker.symbol,
          volume: firstTicker.volume,
          volumeType: typeof firstTicker.volume,
          hasVolume: 'volume' in firstTicker,
          change_percent: firstTicker.change_percent,
          change_percentType: typeof firstTicker.change_percent,
          hasChangePercent: 'change_percent' in firstTicker,
          current_price: firstTicker.current_price,
          change_amount: firstTicker.change_amount,
          allKeys: Object.keys(firstTicker).filter(k => k.toLowerCase().includes('volume') || k.toLowerCase().includes('change'))
        }, { page: 'tickers' });
      }
    }

    // שמירת הנתונים
    // IMPORTANT: yahoo_updated_at is the timestamp when external market data (price) was last updated
    tickersData = Array.isArray(rawTickers)
      ? rawTickers.map(ticker => {
          // Log volume for each ticker
          if (window.Logger && ticker.volume !== undefined && ticker.volume !== null) {
            window.Logger.debug('📊 Ticker volume data:', {
              symbol: ticker.symbol,
              volume: ticker.volume,
              volumeType: typeof ticker.volume
            }, { page: 'tickers' });
          }
          
          return {
            ...ticker,
            // Preserve volume explicitly to ensure it's not lost
            volume: ticker.volume !== undefined ? ticker.volume : null,
            // Preserve yahoo_updated_at as primary source for "last price update" display
            yahoo_updated_at: ticker.yahoo_updated_at || null,
            updated_at: ticker.updated_at
              || ticker.yahoo_updated_at
              || ticker.fetched_at
              || ticker.last_updated_at
              || ticker.created_at
              || null
          };
        })
      : [];
    window.tickersData = tickersData;
    
    // Log final tickersData volume
    if (window.Logger && tickersData.length > 0) {
      const firstTicker = tickersData[0];
      window.Logger.info('📊 First ticker in tickersData after processing:', {
        symbol: firstTicker.symbol,
        volume: firstTicker.volume,
        volumeType: typeof firstTicker.volume,
        hasVolume: 'volume' in firstTicker,
        change_percent: firstTicker.change_percent,
        change_percentType: typeof firstTicker.change_percent,
        hasChangePercent: 'change_percent' in firstTicker,
        current_price: firstTicker.current_price,
        change_amount: firstTicker.change_amount
      }, { page: 'tickers' });
    }

    // עדכון שדה active_trades
    await updateActiveTradesField();

    // Enrich tickers with full data (historical data, technical indicators)
    // Only if not forcing refresh and we want to load full data
    if (!options.skipEnrichment && options.enrichWithFullData !== false) {
      try {
        window.Logger?.info?.('Enriching tickers with full data', { 
          count: tickersData.length, 
          page: 'tickers' 
        });
        
        tickersData = await enrichTickersWithFullData(tickersData, {
          silent: options.silent || false,
          showProgress: options.showProgress !== false,
          forceRefresh: options.force || false
        });
      } catch (error) {
        window.Logger?.warn?.('Failed to enrich tickers with full data, continuing with basic data', {
          error: error.message,
          page: 'tickers'
        });
      }
    }

    // Check for missing data and optionally refresh
    if (options.autoRefreshMissing !== false) {
      try {
        const completenessSummary = await checkTickersDataCompleteness(tickersData);
        if (completenessSummary.incomplete > 0 && !options.silent) {
          window.Logger?.info?.('Found tickers with incomplete data', {
            incomplete: completenessSummary.incomplete,
            total: completenessSummary.total,
            page: 'tickers'
          });
        }
      } catch (error) {
        window.Logger?.warn?.('Failed to check data completeness', {
          error: error.message,
          page: 'tickers'
        });
      }
    }

    // עדכון הטבלה (אחרי עדכון active_trades והעשרת נתונים)
    await updateTickersTable(tickersData);

    // עדכון סטטיסטיקות סיכום
    updateTickersSummaryStats(tickersData);
    
    // Register table with UnifiedTableSystem after data is loaded
    if (typeof window.registerTickersTables === 'function') {
      window.registerTickersTables();
    }

    // Restore page state (filters, sort, sections, entity filters)
    await restorePageState('tickers');

    // יישום צבעי ישות על כותרות אחרי טעינת הנתונים
    if (window.applyEntityColorsToHeaders) {
      window.applyEntityColorsToHeaders('ticker');
    }
  } catch (error) {
    handleApiError(error, 'טעינת נתוני טיקרים');
    throw error;
  }
}

// Wrapper function - always uses force: true for CRUD operations (standard pattern like executions.js)
window.loadTickersData = async function(options = {}) {
  // When called from CRUDResponseHandler, always force reload to get fresh data
  // This matches the standard pattern used in executions.js and other pages
  // Note: enrichWithFullData is still enabled by default even with force: true
  // because we want to enrich data after loading fresh basic data
  return await loadTickersDataInternal({ 
    ...options, 
    force: true,
    enrichWithFullData: options.enrichWithFullData !== false, // Default to true even with force
    autoRefreshMissing: options.autoRefreshMissing !== false // Default to true
  });
};

/**
 * Update tickers summary statistics
 * @param {Array} tickers - Array of tickers to summarize
 * @returns {void}
 */
function updateTickersSummaryStats(tickers) {
  const tickersArray = Array.isArray(tickers)
    ? tickers
    : (window.TableDataRegistry ? window.TableDataRegistry.getFilteredData('tickers') : window.tickersData || []);

  try {
    // מערכת מאוחדת לסיכום נתונים
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      const config = window.INFO_SUMMARY_CONFIGS.tickers;
      window.InfoSummarySystem.calculateAndRender(tickersArray, config);
    } else {
      // מערכת סיכום נתונים לא זמינה
      const summaryStatsElement = document.getElementById('summaryStats');
      if (summaryStatsElement) {
        summaryStatsElement.textContent = '';
        const div = document.createElement('div');
        div.style.color = '#dc3545';
        div.style.fontWeight = 'bold';
        div.textContent = '⚠️ מערכת סיכום נתונים לא זמינה - נא לרענן את הדף';
        summaryStatsElement.appendChild(div);
      }
    }
  } catch (error) {
    window.Logger.error('updateTickersSummaryStats failed', { page: 'tickers', error: error?.message || error });
  }
}


/**
 * Render tickers table rows
 * @param {Array} tickers - Array of tickers to render
 * @returns {void}
 */
function renderTickersTableRows(tickers) {
  try {
    const toFiniteNumber = (value) => {
      // 0 הוא ערך תקין - לא להחזיר null עבורו
      if (value === 0 || value === '0') {
        return 0;
      }
      if (value === null || value === undefined || value === '' || value === 'N/A') {
        return null;
      }
      const numericValue = typeof value === 'number' ? value : parseFloat(value);
      return Number.isFinite(numericValue) ? numericValue : null;
    };
    const parseValidDate = (value) => {
      if (!value) {
        return null;
      }
      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
      }
      // Use dateUtils for consistent date parsing
      if (typeof value === 'object') {
        const nestedCandidate = value.local || value.utc || value.iso || value.timestamp;
        return parseValidDate(nestedCandidate);
      }
      const candidate = new Date(value);
      return Number.isNaN(candidate.getTime()) ? null : candidate;
    };

    // מציאת ה-tbody
    let tbody = document.querySelector('table[data-table-type="tickers"] tbody');

    if (!tbody) {
      const container = document.getElementById('tickersContainer');
      if (container) {
        tbody = container.querySelector('tbody');
      }
    }

    if (!tbody) {
      handleElementNotFound('updateTickersTable', 'אלמנט tbody לא נמצא');
      return;
    }

    // בדיקה אם יש נתונים
    if (!tickers || tickers.length === 0) {
      tbody.textContent = '';
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 10;
      td.className = 'text-center';
      td.textContent = 'לא נמצאו טיקרים';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    // ניקוי הטבלה
    tbody.textContent = '';
    
    // יצירת שורות עם עיצוב משופר - שימוש ב-createElement במקום DOMParser
    tickers.forEach(ticker => {
      // קבלת סמל מטבע - שימוש ב-FieldRendererService._normalizeCurrencySymbol
      // Priority: ticker.currency_symbol (from enriched data) > getCurrencySymbol(currency_id) > fallback
      let rawCurrencySymbol = ticker.currency_symbol || ticker.currency?.symbol || getCurrencySymbol(ticker.currency_id);
      let currencySymbol = rawCurrencySymbol || '$';
      
      // נירמול מטבע באמצעות FieldRendererService
      if (window.FieldRendererService && typeof window.FieldRendererService._normalizeCurrencySymbol === 'function') {
        currencySymbol = window.FieldRendererService._normalizeCurrencySymbol(currencySymbol) || currencySymbol;
      } else {
        // Fallback - אותו לוגיקה כמו FieldRendererService._normalizeCurrencySymbol
        if (currencySymbol && currencySymbol.length > 1 && /^[A-Za-z]+$/.test(currencySymbol)) {
          const symbolMap = {
            'USD': '$', 'ILS': '₪', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
            'AUD': 'A$', 'CAD': 'C$', 'CHF': 'CHF', 'CNY': '¥', 'HKD': 'HK$', 'INR': '₹'
          };
          currencySymbol = symbolMap[currencySymbol.toUpperCase()] || currencySymbol;
        }
      }
      
      // מחיר - Priority: current_price > price > last_price
      const priceValue = toFiniteNumber(ticker.current_price || ticker.price || ticker.last_price);
      
      // שינוי יומי - Priority: change_percent > daily_change_percent > change_pct_day > change_percent_day
      // חשוב: בדיקה מפורטת - לא להשתמש ב-|| כי 0 הוא ערך תקין (סוף שבוע/חג)
      // null/undefined = אין נתונים, 0 = יש נתונים אבל אין שינוי
      let changePercentValue = null;
      if (ticker.change_percent !== undefined && ticker.change_percent !== null) {
        changePercentValue = toFiniteNumber(ticker.change_percent);
        // אם הערך המקורי הוא 0, שמור אותו (גם אם toFiniteNumber החזיר null)
        if (changePercentValue === null && ticker.change_percent === 0) {
          changePercentValue = 0;
        }
      } else if (ticker.daily_change_percent !== undefined && ticker.daily_change_percent !== null) {
        changePercentValue = toFiniteNumber(ticker.daily_change_percent);
        if (changePercentValue === null && ticker.daily_change_percent === 0) {
          changePercentValue = 0;
        }
      } else if (ticker.change_pct_day !== undefined && ticker.change_pct_day !== null) {
        changePercentValue = toFiniteNumber(ticker.change_pct_day);
        if (changePercentValue === null && ticker.change_pct_day === 0) {
          changePercentValue = 0;
        }
      } else if (ticker.change_percent_day !== undefined && ticker.change_percent_day !== null) {
        changePercentValue = toFiniteNumber(ticker.change_percent_day);
        if (changePercentValue === null && ticker.change_percent_day === 0) {
          changePercentValue = 0;
        }
      } else if (ticker.change_pct !== undefined && ticker.change_pct !== null) {
        changePercentValue = toFiniteNumber(ticker.change_pct);
        if (changePercentValue === null && ticker.change_pct === 0) {
          changePercentValue = 0;
        }
      }
      
      // נפח - Priority: volume > trading_volume > daily_volume
      // חשוב: בדיקה מפורטת - לא להשתמש ב-|| כי 0 הוא ערך תקין (סוף שבוע/חג)
      // null/undefined = אין נתונים, 0 = יש נתונים אבל אין נפח
      let volumeValue = null;
      if (ticker.volume !== undefined && ticker.volume !== null) {
        volumeValue = toFiniteNumber(ticker.volume);
        // אם הערך המקורי הוא 0, שמור אותו (גם אם toFiniteNumber החזיר null)
        if (volumeValue === null && ticker.volume === 0) {
          volumeValue = 0;
        }
      } else if (ticker.trading_volume !== undefined && ticker.trading_volume !== null) {
        volumeValue = toFiniteNumber(ticker.trading_volume);
        if (volumeValue === null && ticker.trading_volume === 0) {
          volumeValue = 0;
        }
      } else if (ticker.daily_volume !== undefined && ticker.daily_volume !== null) {
        volumeValue = toFiniteNumber(ticker.daily_volume);
        if (volumeValue === null && ticker.daily_volume === 0) {
          volumeValue = 0;
        }
      }

      // מחיר - שימוש ב-FieldRendererService.renderAmount (תמיד עם סמל מטבע)
      let priceHtml = 'N/A';
      if (priceValue !== null && priceValue !== undefined && Number.isFinite(priceValue)) {
        if (typeof window.renderAmount === 'function') {
          priceHtml = window.renderAmount(priceValue, currencySymbol, 2, false);
        } else {
          // Fallback - תמיד עם סמל מטבע
          priceHtml = `${currencySymbol || '$'}${priceValue.toFixed(2)}`;
        }
      }

      // Get change from open values
      const changeFromOpenValue = toFiniteNumber(ticker.change_from_open);
      const changeFromOpenPercentValue = toFiniteNumber(ticker.change_from_open_percent);
      
      // Calculate change amount from percentage if not provided directly
      // תמיכה בשדות שונים מהשרת - חשוב: בדיקה מפורטת כי 0 הוא ערך תקין
      let changeAmountValue = null;
      if (ticker.change_amount !== undefined && ticker.change_amount !== null) {
        changeAmountValue = toFiniteNumber(ticker.change_amount);
      } else if (ticker.daily_change !== undefined && ticker.daily_change !== null) {
        changeAmountValue = toFiniteNumber(ticker.daily_change);
      } else if (ticker.change_amount_day !== undefined && ticker.change_amount_day !== null) {
        changeAmountValue = toFiniteNumber(ticker.change_amount_day);
      }
      
      // אם אין change amount אבל יש change percent ומחיר, חשב אותו
      if ((changeAmountValue === null || changeAmountValue === undefined || isNaN(changeAmountValue)) && priceValue !== null && changePercentValue !== null && Number.isFinite(priceValue) && Number.isFinite(changePercentValue)) {
        // Calculate: changeAmount = price * (changePercent / 100)
        changeAmountValue = priceValue * (changePercentValue / 100);
      }
      
      // Render change - שימוש בפורמט אחיד (תמיד להציג אם יש נתונים, כולל 0)
      // בדיקה: האם יש נתונים בכלל (גם 0 זה נתון תקין - סוף שבוע/חג)
      let changeHtml = 'N/A';
      const hasChangePercent = changePercentValue !== null && changePercentValue !== undefined && !isNaN(changePercentValue) && Number.isFinite(changePercentValue);
      const hasChangeAmount = changeAmountValue !== null && changeAmountValue !== undefined && !isNaN(changeAmountValue) && Number.isFinite(changeAmountValue);
      
      if (hasChangePercent) {
        // 0 הוא ערך תקין - הצג אותו (סוף שבוע/חג)
        const changeColor = changePercentValue > 0 ? 'text-success' : (changePercentValue < 0 ? 'text-danger' : 'text-secondary');
        
        // Format percentage: sign left of number, % symbol after number, no + for positive
        const percentSign = changePercentValue < 0 ? '-' : '';
        const percentValue = Math.abs(changePercentValue).toFixed(2);
        const percentText = `${percentSign}${percentValue}%`;
        
        // Format amount: sign left of currency symbol, no + for positive
        let amountText = '';
        if (hasChangeAmount) {
          const amountSign = changeAmountValue < 0 ? '-' : '';
          const amountValue = Math.abs(changeAmountValue).toFixed(2);
          amountText = `${amountSign}${currencySymbol}${amountValue}`;
        }
        
        // Combine: amount in parentheses not bold first, then percentage bold (appears on right in RTL)
        // In RTL: what's written last appears first (on the right), so we write percentage last to appear first
        if (amountText) {
          changeHtml = `<span class="${changeColor}" dir="ltr" style="white-space: nowrap;"><span class="fw-normal">(${amountText})</span><span class="fw-bold">${percentText}</span></span>`;
        } else {
          changeHtml = `<span class="${changeColor} fw-bold" dir="ltr">${percentText}</span>`;
        }
      } else if (hasChangeAmount) {
        // אם יש רק change amount ללא percentage, הצג אותו (גם אם 0)
        const changeColor = changeAmountValue > 0 ? 'text-success' : (changeAmountValue < 0 ? 'text-danger' : 'text-secondary');
        const amountSign = changeAmountValue < 0 ? '-' : '';
        const amountValue = Math.abs(changeAmountValue).toFixed(2);
        changeHtml = `<span class="${changeColor} fw-bold" dir="ltr">${amountSign}${currencySymbol}${amountValue}</span>`;
      }
      
      // Debug log for missing data
      if (!hasChangePercent && !hasChangeAmount && window.Logger) {
        window.Logger.debug('⚠️ No change data for ticker', {
          symbol: ticker.symbol,
          tickerId: ticker.id,
          change_percent: ticker.change_percent,
          daily_change_percent: ticker.daily_change_percent,
          change_pct_day: ticker.change_pct_day,
          change_amount: ticker.change_amount,
          daily_change: ticker.daily_change,
          change_amount_day: ticker.change_amount_day,
          changePercentValue,
          changeAmountValue,
          page: 'tickers'
        });
      }
      
      // Build change from open HTML if available
      let changeFromOpenHtml = '';
      if (changeFromOpenValue !== null && changeFromOpenPercentValue !== null) {
        const changeFromOpenColor = changeFromOpenValue >= 0 ? 'text-success' : 'text-danger';
        const changeFromOpenIcon = changeFromOpenValue >= 0 ? '↗' : '↘';
        changeFromOpenHtml = `<br><small class="${changeFromOpenColor}">${changeFromOpenIcon} מפתיחה: ${changeFromOpenValue >= 0 ? '+' : ''}${changeFromOpenValue.toFixed(2)} (${changeFromOpenPercentValue >= 0 ? '+' : ''}${changeFromOpenPercentValue.toFixed(2)}%)</small>`;
      }

      // קבלת עיצוב סוג טיקר - שימוש ב-type_custom אם קיים
      const tickerType = ticker.type_custom || ticker.type;
      const typeStyle = getTickerTypeStyle(tickerType);
      const typeLabel = tickerTypeColors[tickerType]?.label || tickerType || 'N/A';

      // קבלת עיצוב סטטוס - שימוש ב-user_ticker_status אם קיים (סטטוס ברמת שיוך)
      const tickerStatus = ticker.user_ticker_status || ticker.status;
      const statusStyle = getTickerStatusStyle(tickerStatus);
      const statusLabel = getTickerStatusLabel(tickerStatus);
      const statusHtml = (typeof window.renderStatus === 'function')
        ? window.renderStatus(tickerStatus, 'ticker')
        : `<span class="status-badge entity-badge-base" style="background-color: ${statusStyle.backgroundColor}; color: ${statusStyle.color};">
              ${statusLabel}
           </span>`;

      // Build updated cell HTML
      // Priority: yahoo_updated_at (market data - last price update) > updated_at > fetched_at > created_at (fallback)
      // IMPORTANT: yahoo_updated_at is the timestamp when external market data (price) was last updated
      const rawDate = ticker.yahoo_updated_at || ticker.updated_at || ticker.fetched_at || ticker.last_updated_at || ticker.created_at || null;
      let dateDisplay = '';
      let epoch = null;
      
      if (rawDate) {
        if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
          dateDisplay = window.FieldRendererService.renderDate(rawDate, true);
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
          const fallbackDate = parseValidDate(rawDate);
          if (fallbackDate && fallbackDate instanceof Date && !Number.isNaN(fallbackDate.getTime())) {
            const envelope = window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function'
              ? window.dateUtils.ensureDateEnvelope(fallbackDate)
              : null;
            epoch = (() => {
              if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                return window.dateUtils.getEpochMilliseconds(envelope || fallbackDate);
              }
              if (typeof window.getEpochMilliseconds === 'function') {
                return window.getEpochMilliseconds(envelope || fallbackDate);
              }
              if (envelope && typeof envelope.epochMs === 'number') {
                return envelope.epochMs;
              }
              return fallbackDate.getTime();
            })();
            dateDisplay = (() => {
              if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
                return window.dateUtils.formatDateTime(envelope || fallbackDate);
              }
              if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
                return window.dateUtils.formatDate(envelope || fallbackDate, { includeTime: true });
              }
              try {
                return window.formatDate ? window.formatDate(fallbackDate, true) : fallbackDate.toLocaleString('he-IL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } catch (err) {
                window.Logger?.warn('⚠️ tickers updated-cell date formatting failed', { err, tickerId: ticker?.id }, { page: 'tickers' });
                return 'לא מוגדר';
              }
            })();
          }
        }
      }
      
      // Build updated cell HTML with data status badge
      const dataStatusBadge = getDataStatusBadge(ticker);
      const updatedCellHtml = dateDisplay && dateDisplay !== '-'
        ? `<td class="col-updated"${epoch ? ` data-epoch="${epoch}"` : ''} title="${dateDisplay}"><span class="updated-value" dir="ltr">${dateDisplay}</span>${dataStatusBadge}</td>`
        : `<td class="col-updated"><span class="updated-value-empty">N/A</span>${dataStatusBadge}</td>`;

      // Build actions menu HTML
      const actionsHtml = (() => {
        if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
        const actions = [
          { type: 'VIEW', onclick: `window.showEntityDetails('ticker', ${ticker.id}, { mode: 'view' })`, title: 'צפה בפרטי טיקר' },
          { type: 'DASHBOARD', onclick: `window.location.href='/ticker_dashboard.html?tickerId=${ticker.id}'`, title: 'דשבורד מלא' },
          { type: 'REFRESH', onclick: `refreshTickerExternalData(${ticker.id}, ${ticker.symbol ? `'${String(ticker.symbol).replace(/'/g, "\\'")}'` : '""'})`, title: 'רענון נתונים חיצוניים' },
          { type: 'EDIT', onclick: `window.ModalManagerV2 && window.ModalManagerV2.showEditModal('tickersModal', 'ticker', ${ticker.id})`, title: 'ערוך' },
          { type: ticker.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL', onclick: `${ticker.status === 'cancelled' ? 'reactivateTicker' : 'performTickerCancellation'}(${ticker.id})`, title: ticker.status === 'cancelled' ? 'הפעל מחדש טיקר' : 'בטל טיקר' },
          { type: 'DELETE', onclick: `deleteTicker(${ticker.id})`, title: 'מחק' }
        ];
        const result = window.createActionsMenu(actions);
        return result || '';
      })();

      // Create row element
      const row = document.createElement('tr');
      const rowHTML = `
        <td title="${ticker.symbol || 'N/A'}">
          <span class="ticker-symbol-link" 
                data-onclick="if (window.showEntityDetails) { window.showEntityDetails('ticker', ${ticker.id}); } else { window.Logger.error('פונקציה showEntityDetails לא קיימת', { page: "tickers" }); }" 
                title="לחץ לצפייה בפרטי הטיקר">
            <strong>${ticker.symbol || 'N/A'}</strong>
          </span>
        </td>
        <td class="table-cell-center numeric-ltr" title="${priceValue !== null && Number.isFinite(priceValue) ? `מחיר נוכחי: ${currencySymbol || ''}${priceValue.toFixed(2)}` : 'אין נתוני מחיר'}" dir="ltr">
          ${priceHtml}
        </td>
        <td class="table-cell-center numeric-ltr" title="${changePercentValue !== null ? `שינוי יומי: ${changePercentValue.toFixed(2)}%${changeAmountValue !== null && !isNaN(changeAmountValue) ? ` (${changeAmountValue >= 0 ? '+' : ''}${currencySymbol}${Math.abs(changeAmountValue).toFixed(2)})` : ''}` : 'אין נתוני שינוי'}${changeFromOpenValue !== null ? ` | שינוי מפתיחה: ${changeFromOpenValue.toFixed(2)} (${changeFromOpenPercentValue.toFixed(2)}%)` : ''}" dir="ltr">
          ${changeHtml}${changeFromOpenHtml}
        </td>
        <td class="table-cell-center numeric-ltr" title="${volumeValue !== null && volumeValue !== undefined && !isNaN(volumeValue) && Number.isFinite(volumeValue) && volumeValue >= 0 ? `נפח: ${volumeValue.toLocaleString('he-IL')}` : 'אין נתוני נפח'}" dir="ltr">
          ${(() => {
            // הצג נפח גם אם הוא 0 (זה נתון תקין)
            if (volumeValue !== null && volumeValue !== undefined && !isNaN(volumeValue) && Number.isFinite(volumeValue) && volumeValue >= 0) {
              if (typeof window.renderVolume === 'function') {
                return window.renderVolume(volumeValue, true);
              }
              return volumeValue.toLocaleString('he-IL');
            }
            // Debug log for missing volume
            if (window.Logger) {
              window.Logger.debug('⚠️ No volume data for ticker', {
                symbol: ticker.symbol,
                tickerId: ticker.id,
                volume: ticker.volume,
                trading_volume: ticker.trading_volume,
                daily_volume: ticker.daily_volume,
                volumeValue,
                page: 'tickers'
              });
            }
            return 'N/A';
          })()}
        </td>
        <td class="status-cell" data-status="${ticker.user_ticker_status || ticker.status || ''}" title="${statusLabel}">
          ${statusHtml}
        </td>
        <td class="type-cell" data-type="${ticker.type_custom || ticker.type || ''}" title="${typeLabel}">
          <span class="badge-type entity-badge-base" style="background-color: ${typeStyle.backgroundColor}; color: ${typeStyle.color};">
            ${typeLabel}
          </span>
        </td>
        <td title="${ticker.name_custom || ticker.name || 'N/A'}">${ticker.name_custom || ticker.name || 'N/A'}</td>
        <td class="table-cell-center" title="${ticker.currency_id ? `מטבע: ${currencySymbol}` : 'אין נתוני מטבע'}">
          ${window.renderCurrency ? window.renderCurrency(ticker.currency_id, ticker.currency_name, currencySymbol) : currencySymbol}
        </td>
        ${updatedCellHtml}
        <td class="actions-cell">
          ${actionsHtml}
        </td>
      `;
      row.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<table><tbody><tr>${rowHTML}</tr></tbody></table>`, 'text/html');
      const tempRow = doc.body.querySelector('tr');
      if (tempRow) {
          Array.from(tempRow.children).forEach(cell => {
              row.appendChild(cell.cloneNode(true));
          });
      }
      
      tbody.appendChild(row);
    });
    
    // כפיית reflow של הדפדפן
    tbody.offsetHeight;

    // עדכון הספירה - משתמש בפונקציה הגנרית לקבלת סך כל הרשומות
    if (window.updateTableCount) {
      window.updateTableCount('.table-count', 'tickers', 'טיקרים', tickers.length);
    } else {
      // Fallback
      const countElement = document.querySelector('.table-count');
      if (countElement) {
        countElement.textContent = `${tickers.length} טיקרים`;
      }
    }
    
    window.Logger.debug(`📊 טבלת טיקרים עודכנה עם ${tickers.length} פריטים`, { page: "tickers" });

    // סידור ברירת מחדל לפי העמודה הראשונה (סמל) - רק אם אין סידור קיים
    if (typeof window.applyDefaultSort === 'function') {
      window.applyDefaultSort('tickers', tickers, updateTickersTable);
    }

    // עדכון סטטיסטיקות סיכום
    updateTickersSummaryStats(tickers);

  } catch (error) {
    handleSystemError(error, 'עדכון טבלת טיקרים');
  }
}

/**
 * Update tickers table with new data
 * @param {Array} tickers - Array of tickers to display
 * @param {Object} [options={}] - Options (skipPagination, etc.)
 * @returns {Promise<void>}
 */
async function updateTickersTable(tickers, options = {}) {
  const { skipPagination = false } = options;
  const safeTickers = Array.isArray(tickers) ? tickers : [];

  if (!skipPagination && typeof window.updateTableWithPagination === 'function') {
    try {
      tickersPaginationInstance = await window.updateTableWithPagination({
        tableId: 'tickersTable',
        tableType: 'tickers',
        data: safeTickers,
        render: async (pageData, context) => {
          renderTickersTableRows(pageData);
          if (window.setPageTableData) {
            window.setPageTableData('tickers', pageData, {
              tableId: 'tickersTable',
              pageInfo: context?.pageInfo,
            });
          }
        },
        onFilteredDataChange: ({ filteredData }) => {
          if (typeof window.updateTickersSummaryStats === 'function') {
            window.updateTickersSummaryStats(Array.isArray(filteredData) ? filteredData : []);
          }
        },
      });
      return;
    } catch (error) {
      window.Logger?.warn('updateTickersTable pagination fallback triggered', { error, page: 'tickers' });
    }
  }

  if (window.setTableData) {
    window.setTableData('tickers', safeTickers, { tableId: 'tickersTable' });
    window.setFilteredTableData?.('tickers', safeTickers, { tableId: 'tickersTable', skipPageReset: true });
  }

  renderTickersTableRows(safeTickers);
}


// הגדרת הפונקציות כגלובליות
window.updateActiveTradesField = updateActiveTradesField;
window.updateTickerActiveTradesStatus = updateTickerActiveTradesStatus;
window.updateAllActiveTradesStatuses = updateAllActiveTradesStatuses;
window.deleteTicker = deleteTicker;
window.cancelTicker = cancelTicker;
window.performCancelTicker = performCancelTicker;
window.updateAllTickerStatuses = updateAllTickerStatuses;
// window.toggleSection removed - using global version from ui-utils.js
// Wrapper function for backward compatibility - uses global toggleSection
window.toggleTickersSection = function() {
    if (typeof window.toggleSection === 'function') {
        window.toggleSection('tickers');
    } else {
        window.Logger.error('toggleSection not available', { page: 'tickers' });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מערכת הסתרת סקשנים לא זמינה. אנא רענן את הדף.');
        }
    }
};
window.restoreTickersSectionState = restoreTickersSectionState;
// Wrapper function for backward compatibility - uses UnifiedCacheManager
window.clearTickersCache = async function() {
    // Clear tickers data from memory
    if (window.tickersData) {
        window.tickersData = [];
    }
    
    // Use UnifiedCacheManager if available
    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clear === 'function') {
        try {
            // Clear cache related to tickers
            await window.UnifiedCacheManager.clear('all', { 
                pattern: /ticker|tickers/i 
            });
            if (window.Logger) {
                window.Logger.info('✅ Tickers cache cleared via UnifiedCacheManager', { page: "tickers" });
            }
        } catch (error) {
            window.Logger.warn('Failed to clear cache via UnifiedCacheManager', { page: 'tickers', error: error?.message || error });
            // Fallback to window.clearAllCache if available
            if (typeof window.clearAllCache === 'function') {
                await window.clearAllCache();
            }
        }
    } else if (typeof window.clearAllCache === 'function') {
        // Fallback to global clearAllCache
        await window.clearAllCache();
    } else {
        window.Logger.warn('No cache clearing system available', { page: 'tickers' });
    }
};

// פונקציות נתונים חיצוניים
window.refreshYahooFinanceData = refreshYahooFinanceData;
window.refreshYahooFinanceDataSilently = refreshYahooFinanceDataSilently;

// פונקציות מודלים
// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly
// REMOVED: window.showEditTickerModal - use window.ModalManagerV2.showEditModal('tickersModal', 'ticker', id) directly
// Note: showDeleteTickerModal removed - not needed (using confirmDeleteTicker directly)
window.saveTicker = saveTicker;

/**
 * בדיקת נתונים חיצוניים עבור טיקר חדש
 * טוען נתונים מ-Yahoo Finance ומציג אותם במודל
 * 
 * @function checkTickerExternalData
 * @async
 * @returns {Promise<void>}
 */
async function checkTickerExternalData() {
    const symbolField = document.getElementById('tickerSymbol');
    const checkBtn = document.getElementById('checkTickerExternalDataBtn');
    const resultDiv = document.getElementById('tickerExternalDataResult');
    const warningDiv = document.getElementById('tickerExternalDataWarning');
    
    if (!symbolField || !checkBtn || !resultDiv || !warningDiv) {
        window.Logger.warn('Elements not found for external data check', { page: 'tickers' });
        return;
    }
    
    const internalSymbol = symbolField.value?.trim().toUpperCase();
    if (!internalSymbol || internalSymbol.length === 0) {
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'יש להכניס סמל טיקר לפני הבדיקה');
        }
        return;
    }
    
    try {
        // Disable button and show loading
        checkBtn.disabled = true;
        // Use IconSystem to render loader icon
        checkBtn.textContent = '';
        if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
            const loaderIcon = await window.IconSystem.renderIcon('button', 'refresh', {
                size: '16',
                alt: 'loading',
                class: 'icon fa-spin'
            });
            // Convert HTML string to DOM elements safely
            const parser = new DOMParser();
            const doc = parser.parseFromString(loaderIcon, 'text/html');
            const iconElement = doc.body.firstElementChild;
            if (iconElement) {
                checkBtn.appendChild(iconElement.cloneNode(true));
            }
            checkBtn.appendChild(document.createTextNode(' בודק...'));
        } else {
            // Fallback if IconSystem not available
            const img = document.createElement('img');
            img.src = '/trading-ui/images/icons/tabler/loader.svg';
            img.width = 16;
            img.height = 16;
            img.alt = 'loading';
            img.className = 'icon fa-spin';
            checkBtn.appendChild(img);
            checkBtn.appendChild(document.createTextNode(' בודק...'));
        }
        resultDiv.style.display = 'none';
        warningDiv.style.display = 'none';
        
        // Check if provider symbol mapping exists for Yahoo Finance
        // Look for provider symbol field for Yahoo Finance
        let symbolToUse = internalSymbol;
        const yahooProviderField = document.getElementById('providerSymbol_yahoo_finance');
        if (yahooProviderField && yahooProviderField.value && yahooProviderField.value.trim()) {
            symbolToUse = yahooProviderField.value.trim().toUpperCase();
            window.Logger?.info(`Using provider symbol '${symbolToUse}' instead of internal symbol '${internalSymbol}' for Yahoo Finance`, { page: 'tickers' });
        }
        
        window.Logger?.info(`Checking external data for symbol: ${symbolToUse} (internal: ${internalSymbol})`, { page: 'tickers' });
        
        // Check if ExternalDataService is available
        if (!window.ExternalDataService) {
            throw new Error('שירות נתונים חיצוניים לא זמין');
        }
        
        // Fetch quote data - force refresh to get latest data
        // Use provider symbol if available, otherwise use internal symbol
        const quoteData = await window.ExternalDataService.getQuote(symbolToUse, { forceRefresh: true });
        
        if (quoteData && quoteData.price) {
            const currencyResolution = typeof window.resolveExternalCurrencySymbol === 'function'
                ? window.resolveExternalCurrencySymbol(quoteData.currency, symbolToUse)
                : {
                    symbol: (typeof quoteData.currency === 'string' && quoteData.currency.trim()) || '',
                    hasCurrency: Boolean(quoteData.currency)
                };

            // Success - Display ticker info
            // המרת נתונים לפורמט שמצפה FieldRendererService.renderTickerInfo
            // ExternalDataService מחזיר: price, change_amount_day, change_pct_day, volume, currency
            const tickerInfo = {
                symbol: internalSymbol, // Always show internal symbol in display
                name: quoteData.name || internalSymbol, // Use name from quote if available
                current_price: parseFloat(quoteData.price) || 0,
                daily_change: parseFloat(quoteData.change_amount_day || quoteData.change_amount || 0),
                daily_change_percent: parseFloat(quoteData.change_pct_day || quoteData.change_percent || 0),
                volume: parseInt(quoteData.volume || 0),
                currency_symbol: currencyResolution.symbol
            };
            
            // Add note if provider symbol was used
            const providerSymbolNote = (symbolToUse !== internalSymbol) 
                ? `<div class="text-info small mt-2"><i class="fas fa-info-circle me-1"></i>נבדק עם סימבול ספק: <strong>${symbolToUse}</strong> (סימבול פנימי: ${internalSymbol})</div>`
                : '';
            
            // Render using FieldRendererService
            let tickerInfoHTML = '';
            if (window.FieldRendererService && window.FieldRendererService.renderTickerInfo) {
                tickerInfoHTML = window.FieldRendererService.renderTickerInfo(tickerInfo, 'ticker-info-display');
            } else {
                // Fallback display
                const changeColor = tickerInfo.daily_change >= 0 ? 'text-success' : 'text-danger';
                const changeIcon = tickerInfo.daily_change >= 0 ? '↗' : '↘';
                const formattedVolume = tickerInfo.volume > 0 ? tickerInfo.volume.toLocaleString('he-IL') : 'N/A';
                tickerInfoHTML = `
                    <div class="d-flex gap-3 align-items-center flex-wrap justify-content-center">
                        <span class="fw-bold">מחיר: ${tickerInfo.currency_symbol}${tickerInfo.current_price.toFixed(2)}</span>
                        <span class="${changeColor}">
                            ${changeIcon} ${tickerInfo.daily_change >= 0 ? '+' : ''}${tickerInfo.daily_change.toFixed(2)} 
                            (${tickerInfo.daily_change_percent >= 0 ? '+' : ''}${tickerInfo.daily_change_percent.toFixed(2)}%)
                        </span>
                        <span class="text-muted small">נפח: ${formattedVolume}</span>
                    </div>
                `;
            }
            
            // Clear and build result div using createElement
            resultDiv.textContent = '';
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success mb-0';
            
            const headerDiv = document.createElement('div');
            headerDiv.className = 'd-flex align-items-center gap-2 mb-2';
            const icon = document.createElement('i');
            icon.className = 'fas fa-check-circle';
            headerDiv.appendChild(icon);
            const strong = document.createElement('strong');
            strong.textContent = `נתונים נמצאו עבור ${internalSymbol}`;
            headerDiv.appendChild(strong);
            alertDiv.appendChild(headerDiv);
            
            // Add ticker info HTML - Convert HTML string to DOM elements safely
            const parser = new DOMParser();
            const doc = parser.parseFromString(tickerInfoHTML, 'text/html');
            const fragment = document.createDocumentFragment();
            Array.from(doc.body.childNodes).forEach(node => {
                fragment.appendChild(node.cloneNode(true));
            });
            alertDiv.appendChild(fragment);
            
            // Add currency notice if needed
            if (!currencyResolution.hasCurrency) {
                const noticeDiv = document.createElement('div');
                noticeDiv.className = 'text-warning small mt-2';
                noticeDiv.textContent = 'לא התקבל מטבע מהספק, המחיר מוצג ללא סמל מטבע.';
                alertDiv.appendChild(noticeDiv);
            }
            
            // Add provider symbol note if needed
            if (providerSymbolNote) {
                // Convert HTML string to DOM elements safely
                const parser2 = new DOMParser();
                const doc2 = parser2.parseFromString(providerSymbolNote, 'text/html');
                const fragment2 = document.createDocumentFragment();
                Array.from(doc2.body.childNodes).forEach(node => {
                    fragment2.appendChild(node.cloneNode(true));
                });
                alertDiv.appendChild(fragment2);
            }
            
            resultDiv.appendChild(alertDiv);
            resultDiv.style.display = 'block';
            warningDiv.style.display = 'none';
            
            window.Logger?.info(`✅ External data loaded successfully for ${symbolToUse} (internal: ${internalSymbol})`, { page: 'tickers' });
        } else {
            throw new Error('לא התקבלו נתונים מהשרת');
        }
        
    } catch (error) {
        window.Logger?.error('Error checking external data', { page: 'tickers', symbol, error: error?.message || error });
        
        // Show warning using createElement
        warningDiv.textContent = '';
        const warningContainer = document.createElement('div');
        warningContainer.className = 'd-flex align-items-start';
        
        const warningIcon = document.createElement('i');
        warningIcon.className = 'fas fa-exclamation-triangle me-2 mt-1';
        warningContainer.appendChild(warningIcon);
        
        const warningContent = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = 'לא ניתן לטעון נתונים חיצוניים';
        warningContent.appendChild(strong);
        
        const errorP = document.createElement('p');
        errorP.className = 'mb-0 small';
        errorP.textContent = error.message || 'שגיאה בטעינת נתונים מהשרת';
        warningContent.appendChild(errorP);
        
        const noticeP = document.createElement('p');
        noticeP.className = 'mb-0 small mt-1';
        noticeP.textContent = 'ניתן להמשיך בהוספת הטיקר ללא נתונים חיצוניים.';
        warningContent.appendChild(noticeP);
        
        warningContainer.appendChild(warningContent);
        warningDiv.appendChild(warningContainer);
        warningDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        
        if (window.showWarningNotification) {
            window.showWarningNotification(
                'נתונים חיצוניים לא זמינים',
                `לא ניתן לטעון נתונים עבור ${symbolToUse}${symbolToUse !== internalSymbol ? ` (סימבול פנימי: ${internalSymbol})` : ''}. ניתן להמשיך בהוספת הטיקר ללא נתונים אלה.`
            );
        }
    } finally {
        // Re-enable button
        checkBtn.disabled = false;
        // Use IconSystem to render refresh icon
        checkBtn.textContent = '';
        if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
            const refreshIcon = await window.IconSystem.renderIcon('button', 'refresh', {
                size: '16',
                alt: 'refresh',
                class: 'icon me-1'
            });
            // Convert HTML string to DOM elements safely
            const parser = new DOMParser();
            const doc = parser.parseFromString(refreshIcon, 'text/html');
            const iconElement = doc.body.firstElementChild;
            if (iconElement) {
                checkBtn.appendChild(iconElement.cloneNode(true));
            }
            checkBtn.appendChild(document.createTextNode(' בדוק נתונים חיצוניים'));
        } else {
            // Fallback if IconSystem not available
            const img = document.createElement('img');
            img.src = '/trading-ui/images/icons/tabler/refresh.svg';
            img.width = 16;
            img.height = 16;
            img.alt = 'refresh';
            img.className = 'icon me-1';
            checkBtn.appendChild(img);
            checkBtn.appendChild(document.createTextNode(' בדוק נתונים חיצוניים'));
        }
    }
}

// Export function globally
window.checkTickerExternalData = checkTickerExternalData;
window.updateTicker = updateTicker;
window.confirmDeleteTicker = confirmDeleteTicker;

// פונקציות חדשות לביטול טיקר
window.checkLinkedItemsAndCancelTicker = checkLinkedItemsAndCancelTicker;
window.checkLinkedItemsBeforeCancelTicker = checkLinkedItemsBeforeCancelTicker;
window.performTickerCancellation = performTickerCancellation;
window.getTickerSymbol = getTickerSymbol;

// פונקציות חדשות למחיקת טיקר
window.deleteTicker = deleteTicker;
window.checkLinkedItemsAndDeleteTicker = checkLinkedItemsAndDeleteTicker;
window.checkLinkedItemsBeforeDeleteTicker = checkLinkedItemsBeforeDeleteTicker;
window.performTickerDeletion = performTickerDeletion;

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת טיקרים
 * @param {number} columnIndex - אינדקס העמודה לסידור
 *
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת סימבול
 * sortTable(1); // סידור לפי עמודת שם
 * sortTable(2); // סידור לפי עמודת סוג
 *
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
// restoreSortState - using global function from page-utils.js

// הגדרת הפונקציות כגלובליות
// window.sortTable export removed - using global version from tables.js
window.updateTickersTable = updateTickersTable;
window.updateTickersSummaryStats = updateTickersSummaryStats;
window.loadCurrenciesData = loadCurrenciesData;
window.getCurrencySymbol = getCurrencySymbol;
window.getTickerTypeStyle = getTickerTypeStyle;
window.getTickerStatusStyle = getTickerStatusStyle;
window.getTickerStatusLabel = getTickerStatusLabel;
window.generateTickerCurrencyOptions = generateTickerCurrencyOptions;
window.updateCurrencyOptions = updateCurrencyOptions;

// פונקציות ביטול טיקר - גלובליות
window.cancelTicker = cancelTicker;
window.checkLinkedItemsAndCancelTicker = checkLinkedItemsAndCancelTicker;
// ===== GLOBAL EXPORTS =====
// Export functions to global scope for HTML onclick attributes

// Export all necessary functions to global scope
window.editTicker = editTicker;
window.loadCurrenciesData = loadCurrenciesData;

// Export provider symbol functions to window for ModalManagerV2 access
window.loadProviderSymbolFields = loadProviderSymbolFields;
window.loadTickerProviderSymbols = loadTickerProviderSymbols;
window.collectProviderSymbols = collectProviderSymbols;
window.populateProviderSymbolFields = populateProviderSymbolFields;
window.updateActiveTradesField = updateActiveTradesField;
window.updateAllActiveTradesStatuses = updateAllActiveTradesStatuses;
window.restoreTickersSectionState = restoreTickersSectionState;
// Note: saveTicker already exported above
// REMOVED: window.clearTickersCache - use window.UnifiedCacheManager.clearAllCache() or window.clearAllCache() directly
// Note: window.loadTickersData is already defined as wrapper function above (line 1650)
window.loadColorsAndApplyToHeaders = loadColorsAndApplyToHeaders;
window.refreshYahooFinanceData = refreshYahooFinanceData;
window.refreshYahooFinanceDataSilently = refreshYahooFinanceDataSilently;
window.toggleSection = toggleSection;

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
        await window.UnifiedTableSystem.sorter.sort('tickers', columnIndex, {
          direction: direction || 'asc',
          saveState: false // Don't save again, already restored
        });
      }
    } else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      // אם אין מצב שמור, נסה להחיל סידור ברירת מחדל
      await window.UnifiedTableSystem.sorter.applyDefaultSort('tickers');
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
 * Register tickers table with UnifiedTableSystem
 * This function registers the tickers table for unified sorting and filtering
 */
window.registerTickersTables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { page: "tickers" });
        return;
    }

    // Get column mappings from table-mappings.js
    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    // Register tickers table
    window.UnifiedTableSystem.registry.register('tickers', {
        dataGetter: () => {
            return window.tickersData || [];
        },
        updateFunction: (data) => {
            if (typeof window.updateTickersTableMain === 'function') {
                window.updateTickersTableMain(data);
            } else if (typeof window.updateTickersTable === 'function') {
                window.updateTickersTable(data);
            }
        },
        tableSelector: 'table[data-table-type="tickers"]',
        columns: getColumns('tickers'),
        sortable: true,
        filterable: true,
        // Default sort: updated_at desc (column index 8)
        defaultSort: { columnIndex: 8, direction: 'desc', key: 'updated_at' }
    });
};
// REMOVED: window.toggleTickersSection - use window.toggleSection('tickers') directly
// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly
// REMOVED: window.showEditTickerModal - use window.ModalManagerV2.showEditModal('tickersModal', 'ticker', id) directly
// Note: saveTickerData removed - not needed (using saveTicker directly)
window.performTickerCancellation = performTickerCancellation;
window.checkLinkedItemsBeforeCancelTicker = checkLinkedItemsBeforeCancelTicker;
window.getTickerSymbol = getTickerSymbol;
window.reactivateTicker = reactivateTicker;
window.updateAllTickerStatuses = updateAllTickerStatuses;

// ===== COLOR MANAGEMENT FUNCTIONS =====
// Color loading and header styling

/**
 * Load colors from preferences and apply to headers
 * Loads color preferences and applies them to page headers
 * 
 * @function loadColorsAndApplyToHeaders
 * @async
 * @returns {Promise<void>}
 */
async function loadColorsAndApplyToHeaders() {
  try {
    // ✨ טעינת העדפות ספציפיות לעמוד tickers
    const relevantPreferenceKeys = ['entityTickerColor', 'primaryColor', 'secondaryColor', 'theme', 'language'];
    
    if (window.loadSpecificPreferences) {
      const specificPreferences = await window.loadSpecificPreferences(relevantPreferenceKeys, 1, null);
      window.Logger.info('✅ Loaded specific preferences for tickers:', Object.keys(specificPreferences, { page: "tickers" }));
      
      // Apply only the loaded preferences
      if (window.loadAllColorsFromPreferences && specificPreferences) {
        window.loadAllColorsFromPreferences(specificPreferences);
      }
    } else if (window.loadPreferences) {
      // Fallback to loading all preferences
      await window.loadPreferences(1, null);
      window.Logger.info('🔄 Loaded all preferences for tickers (fallback, { page: "tickers" })');
      
      // Filter to only relevant preferences
      if (window.currentPreferences) {
        const relevantPreferences = {};
        relevantPreferenceKeys.forEach(key => {
          if (window.currentPreferences[key] !== undefined) {
            relevantPreferences[key] = window.currentPreferences[key];
          }
        });
        
        if (window.loadAllColorsFromPreferences) {
          window.loadAllColorsFromPreferences(relevantPreferences);
        }
      }
    }

    // יישום צבעי ישות על כותרות
    if (window.applyEntityColorsToHeaders) {
      window.applyEntityColorsToHeaders('ticker');
    }
  } catch (error) {
    window.Logger.error('שגיאה בטעינת צבעים:', error, { page: "tickers" });
  }
}

// הוסר - המערכת המאוחדת מטפלת באתחול
// אתחול הדף
// document.addEventListener('DOMContentLoaded', function () {
//   // שחזור מצב הסגירה
//   restoreTickersSectionState();

  // טעינת צבעים מההעדפות לפני יישום על הכותרות
  loadColorsAndApplyToHeaders();

  // אתחול וולידציה - שימוש בפונקציות הגלובליות
  if (window.initializeValidation) {
    // שימוש בוולידציה הגלובלית ללא כללים מותאמים
    window.initializeValidation('addTickerForm', {});
    window.initializeValidation('editTickerForm', {});
  }

  // שחזור מצב סידור
  if (window.pageUtils?.restoreSortState) {
    window.pageUtils.restoreSortState('tickers');
  } else if (window.UnifiedTableSystem?.sorter?.applyDefaultSort) {
    window.UnifiedTableSystem.sorter.applyDefaultSort('tickers');
  }

  // טעינת נתוני טיקרים
  (async () => {
    await loadTickersData();
  })();
// });

// אתחול נוסף כשהדף נטען לחלוטין
window.addEventListener('load', function () {

  // בדיקה אם אנחנו בדף טיקרים
  const isTickersPage = window.location.pathname.includes('tickers') ||
                         document.querySelector('table[data-table-type="tickers"]') ||
                         document.getElementById('tickersContainer');

  if (!isTickersPage) {
    return;
  }

  // טעינת נתונים עם ניסיונות חוזרים
  let attempts = 0;
  const maxAttempts = 10;

  function tryLoadData() {

    // בדיקה מפורטת יותר

    const tbody = document.querySelector('table[data-table-type="tickers"] tbody') ||
                     document.getElementById('tickersContainer')?.querySelector('tbody');

    if (tbody) {
      // נמצא tbody, טוען נתונים
      // קורא ל-loadTickersData
      (async () => {
        await loadTickersData();
      })();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(tryLoadData, 500);
    } else {
      handleElementNotFound('tryLoadData', 'לא הצלחתי למצוא את הטבלה אחרי 10 ניסיונות');
      // מנסה לטעון נתונים בכל מקרה
      (async () => {
        await loadTickersData();
      })();
    }
  }

  // קורא ל-tryLoadData
  tryLoadData();
});

// ===== Yahoo Finance Integration =====

// ===== EXTERNAL DATA FUNCTIONS =====
// External data integration and refresh

/**
 * Refresh external data for a specific ticker
 * Updates external price data, historical data, and technical indicators for a single ticker
 * 
 * @function refreshTickerExternalData
 * @async
 * @param {number} tickerId - Ticker ID
 * @param {string} tickerSymbol - Ticker symbol (for display)
 * @returns {Promise<void>}
 */
async function refreshTickerExternalData(tickerId, tickerSymbol = '') {
  try {
    if (!window.ExternalDataService) {
      window.NotificationSystem?.showError('שגיאה', 'שירות נתונים חיצוניים לא זמין');
      return;
    }

    const overlayId = `refresh-ticker-${tickerId}`;
    
    // Show progress overlay
    if (window.UnifiedProgressManager) {
      window.unifiedProgressManager.showProgress(overlayId, {
        title: `מרענן נתונים עבור ${tickerSymbol || `טיקר #${tickerId}`}`,
        message: 'מתחבר לספק נתונים...',
        showCancel: false
      });
    }

    // Refresh ticker data with historical data and technical indicators
    const refreshedData = await window.ExternalDataService.refreshTickerData(tickerId, {
      forceRefresh: true,
      includeHistorical: true,
      daysBack: 150
    });

    // Invalidate cache to force reload of fresh data
    if (window.UnifiedCacheManager) {
      await window.UnifiedCacheManager.invalidate(`ticker-full-${tickerId}`, 'memory');
      await window.UnifiedCacheManager.invalidate(`entity-details-ticker-${tickerId}`, 'memory');
    }

    // Wait a bit for backend to save the data
    await new Promise(resolve => setTimeout(resolve, 500));

    // Reload ticker details from EntityDetailsAPI to get all updated data (including volume)
    if (window.entityDetailsAPI) {
      const fullData = await window.entityDetailsAPI.getEntityDetails('ticker', tickerId, {
        includeMarketData: true,
        includeLinkedItems: false,
        forceRefresh: true
      });

      // Update ticker data with full details from EntityDetailsAPI
      // Priority: refreshedData (latest from API) > fullData (from EntityDetailsAPI) > existing data
      if (window.tickersData && Array.isArray(window.tickersData)) {
        const tickerIndex = window.tickersData.findIndex(t => t.id === tickerId);
        if (tickerIndex !== -1) {
          // Merge: refreshedData has the latest data from the refresh endpoint
          // fullData has all fields from EntityDetailsAPI (may be cached)
          // Use refreshedData.volume if available, otherwise use fullData.volume
          const finalVolume = refreshedData.volume !== null && refreshedData.volume !== undefined 
            ? refreshedData.volume 
            : (fullData.volume !== null && fullData.volume !== undefined ? fullData.volume : null);
          
          // Log detailed information for debugging
          window.Logger?.info?.('Updating ticker data after refresh', {
            tickerId,
            symbol: tickerSymbol,
            refreshedData: {
              price: refreshedData.price,
              volume: refreshedData.volume,
              change_percent: refreshedData.change_percent
            },
            fullData: {
              price: fullData.price,
              volume: fullData.volume,
              change_percent: fullData.change_percent
            },
            finalVolume: finalVolume,
            hasVolume: finalVolume !== null && finalVolume !== undefined,
            page: 'tickers'
          });
          
          // Update ticker data - prioritize refreshedData for latest values
          const updatedTicker = {
            ...window.tickersData[tickerIndex],
            // Merge all fields from fullData first (includes all entity details)
            ...fullData,
            // Override with refreshed data to ensure latest values (these are the most recent)
            current_price: refreshedData.price || fullData.current_price || window.tickersData[tickerIndex].current_price,
            change_percent: refreshedData.change_percent || fullData.change_percent || window.tickersData[tickerIndex].change_percent,
            change_amount: refreshedData.change_amount || fullData.change_amount || window.tickersData[tickerIndex].change_amount,
            volume: finalVolume, // Use volume from refreshedData if available, otherwise from fullData
            price: refreshedData.price || fullData.price,
            fetched_at: refreshedData.fetched_at || fullData.fetched_at
          };
          
          window.tickersData[tickerIndex] = updatedTicker;
          
          // Log after update to verify
          window.Logger?.info?.('Ticker data updated in window.tickersData', {
            tickerId,
            symbol: tickerSymbol,
            updatedVolume: window.tickersData[tickerIndex].volume,
            updatedPrice: window.tickersData[tickerIndex].current_price,
            page: 'tickers'
          });
        }
      }
    } else {
      // Fallback: Update with refreshed data directly if EntityDetailsAPI is not available
      if (window.tickersData && Array.isArray(window.tickersData)) {
        const tickerIndex = window.tickersData.findIndex(t => t.id === tickerId);
        if (tickerIndex !== -1) {
          window.tickersData[tickerIndex] = {
            ...window.tickersData[tickerIndex],
            current_price: refreshedData.price,
            change_percent: refreshedData.change_percent,
            change_amount: refreshedData.change_amount,
            volume: refreshedData.volume
          };
        }
      }
    }

    // Hide progress overlay
    if (window.UnifiedProgressManager) {
      window.UnifiedProgressManager.hideProgress(overlayId);
    }

    // Re-render the tickers table to show updated data (including volume)
    if (window.tickersData && Array.isArray(window.tickersData)) {
      renderTickersTableRows(window.tickersData);
    }

    // Show success notification
    window.NotificationSystem?.showSuccess(
      'רענון הושלם',
      `נתוני ${tickerSymbol || `טיקר #${tickerId}`} עודכנו בהצלחה`
    );

    // Re-render table to show updated data
    if (typeof renderTickersTableRows === 'function') {
      await renderTickersTableRows(window.tickersData);
    } else if (typeof updateTickersTable === 'function') {
      await updateTickersTable(window.tickersData);
    }

  } catch (error) {
    // Hide progress overlay on error
    if (window.UnifiedProgressManager) {
      window.UnifiedProgressManager.hideProgress(`refresh-ticker-${tickerId}`);
    }

    window.Logger?.error('Error refreshing ticker external data:', error, { page: 'tickers' });
    window.NotificationSystem?.showError(
      'שגיאה ברענון נתונים',
      `לא הצלחנו לרענן את נתוני ${tickerSymbol || `טיקר #${tickerId}`}: ${error.message}`
    );
  }
}

// Make function globally available
window.refreshTickerExternalData = refreshTickerExternalData;

/**
 * Refresh external data for all tickers on the page
 * Updates external price data, historical data, and technical indicators for all visible tickers
 * 
 * @function refreshAllTickersData
 * @async
 * @returns {Promise<void>}
 */
async function refreshAllTickersData() {
  try {
    if (!window.tickersData || window.tickersData.length === 0) {
      window.NotificationSystem?.showError('שגיאה', 'אין טיקרים לרענון');
      return;
    }

    const overlayId = 'refresh-all-tickers';
    
    // Show progress overlay
    if (window.UnifiedProgressManager) {
      window.unifiedProgressManager.showProgress(overlayId, {
        title: `מרענן נתונים עבור ${window.tickersData.length} טיקרים`,
        message: 'מתחבר לספק נתונים...',
        showCancel: false
      });
    }

    let successCount = 0;
    let errorCount = 0;

    // Refresh each ticker one by one
    for (let i = 0; i < window.tickersData.length; i++) {
      const ticker = window.tickersData[i];
      
      if (window.UnifiedProgressManager) {
        window.UnifiedProgressManager.updateProgress(overlayId, {
          message: `מרענן ${ticker.symbol || `טיקר #${ticker.id}`} (${i + 1}/${window.tickersData.length})`
        });
      }

      try {
        await window.refreshTickerExternalData(ticker.id, ticker.symbol || '');
        successCount++;
      } catch (error) {
        errorCount++;
        window.Logger?.warn(`Failed to refresh ticker ${ticker.symbol || ticker.id}:`, error);
      }
    }

    // Hide progress overlay
    if (window.UnifiedProgressManager) {
      window.UnifiedProgressManager.hideProgress(overlayId);
    }

    // Show summary notification
    if (errorCount === 0) {
      window.NotificationSystem?.showSuccess(
        'רענון הושלם',
        `עודכנו נתונים עבור ${successCount} טיקרים בהצלחה`
      );
    } else {
      window.NotificationSystem?.showWarning(
        'רענון הושלם חלקית',
        `עודכנו נתונים עבור ${successCount} טיקרים, ${errorCount} נכשלו`
      );
    }

    // Reload table to show updated data
    if (typeof updateTickersTable === 'function') {
      await updateTickersTable(window.tickersData);
    }

  } catch (error) {
    if (window.UnifiedProgressManager) {
      window.UnifiedProgressManager.hideProgress('refresh-all-tickers');
    }

    window.Logger?.error('Error refreshing all tickers data:', error, { page: 'tickers' });
    window.NotificationSystem?.showError(
      'שגיאה ברענון נתונים',
      `לא הצלחנו לרענן את הנתונים: ${error.message}`
    );
  }
}

// Make function globally available
window.refreshAllTickersData = refreshAllTickersData;

/**
 * Refresh Yahoo Finance data for all tickers
 * Updates external price data for all tickers
 * 
 * @function refreshYahooFinanceData
 * @async
 * @returns {Promise<void>}
 */
async function refreshYahooFinanceData() {
  try {
    // קבלת כל הטיקרים מהמערכת (כולל מבוטלים)
    if (!window.tickersData || window.tickersData.length === 0) {
      await loadTickersData();
    }

    // שימוש בשירות האחיד לקבלת נתונים
    const externalDataService = window.ExternalDataService;
    if (!externalDataService) {
      throw new Error('External Data Service not available');
    }

    // קבלת נתוני מחירים לכל הטיקרים (כולל מבוטלים)
    const externalData = await externalDataService.refreshTickersData(window.tickersData, 'yahooRefreshBtn');

    if (externalData) {
      // עדכון הנתונים הגלובליים והטבלה (כולל מבוטלים)
      window.tickersData = externalDataService.updateTickersWithExternalData(window.tickersData, externalData);
      await updateTickersTable(window.tickersData);
      
      // עדכון סטטיסטיקות סיכום
      updateTickersSummaryStats(window.tickersData);
    }

  } catch (error) {
    window.Logger.error('Error refreshing external data:', error, { page: "tickers" });
  }
}

// Function moved to external-data-service.js for reusability across pages

/**
 * רענון נתוני מחירים חיצוניים ללא הודעות (לטעינה אוטומטית)
 * משתמש בשירות האחיד שעובד עם כל הספקים
 */
async function refreshYahooFinanceDataSilently() {
  try {
    // קבלת כל הטיקרים מהמערכת
    if (!window.tickersData || window.tickersData.length === 0) {
      return;
    }

    // שימוש בשירות האחיד לקבלת נתונים
    const externalDataService = window.ExternalDataService;
    if (!externalDataService) {
      window.Logger.warn('External Data Service not available for silent refresh', { page: "tickers" });
      return;
    }

    // קבלת נתוני מחירים בשקט
    const externalData = await externalDataService.refreshTickersDataSilently(window.tickersData);

    if (externalData) {
      // עדכון הנתונים הגלובליים (ללא הודעות)
      window.tickersData = externalDataService.updateTickersWithExternalData(window.tickersData, externalData);
      window.Logger.info('📈 External data updated silently:', externalData, { page: "tickers" });
    } else {
      window.Logger.warn('📈 No external data received for silent refresh', { page: "tickers" });
    }

  } catch (error) {
    window.Logger.warn('Silent external data refresh failed:', error.message, { page: "tickers" });
  }
}

/**
 * Filter tickers by type
 * @param {string} type - Ticker type to filter by ('all', 'stock', 'etf', 'bond', 'crypto', 'forex', 'other')
 * @returns {void}
 */
function filterTickersByType(type) {
  try {
    window.Logger.info(`🔍 Filtering tickers by type: ${type}`, { page: "tickers" });
    
    // עדכון מצב הכפתורים - רק אחד פעיל בכל פעם
    const buttons = document.querySelectorAll('.ticker-type-filter [data-type]');
    buttons.forEach(btn => {
      const btnType = btn.getAttribute('data-type');
      if (btnType === type) {
        // כפתור פעיל
        btn.classList.add('active');
        if (btnType === 'all') {
          // כפתור איפוס - עיצוב מיוחד
          btn.classList.remove('btn');
          btn.style.backgroundColor = 'white';
          btn.style.color = '#28a745';
          btn.style.borderColor = '#28a745';
        } else {
          // כפתורים רגילים
          btn.classList.remove('btn');
          btn.style.backgroundColor = 'white';
          btn.style.color = '#28a745';
          btn.style.borderColor = '#28a745';
        }
      } else {
        // כפתורים לא פעילים
        btn.classList.remove('active');
        if (btnType === 'all') {
          // כפתור איפוס - עיצוב ברירת מחדל
          btn.style.backgroundColor = '';
          btn.style.color = '';
          btn.style.borderColor = '';
        } else {
          // כפתורים רגילים
          btn.classList.add('btn');
          btn.style.backgroundColor = '';
          btn.style.color = '';
          btn.style.borderColor = '';
        }
      }
    });

    // פילטור הנתונים - סוג אחד בלבד
    let filteredData = [...window.tickersData];
    
    if (type !== 'all') {
      // פילטר לפי סוג ספציפי
      filteredData = filteredData.filter(ticker => ticker.type === type);
    }
    // אם type === 'all', מציג את כל הטיקרים

    // עדכון הטבלה
    if (typeof window.updateTickersTable === 'function') {
      window.updateTickersTable(filteredData);
    }

    // עדכון ספירת הטיקרים - משתמש בפונקציה הגנרית לקבלת סך כל הרשומות
    if (window.updateTableCount) {
      const typeText = type === 'all' ? 'כל הטיקרים' : getTypeDisplayName(type);
      const itemName = type !== 'all' ? `טיקרים (${typeText})` : 'טיקרים';
      window.updateTableCount('.table-count', 'tickers', itemName, filteredData.length);
    } else {
      // Fallback
      const countElement = document.querySelector('.table-count');
      if (countElement) {
        const typeText = type === 'all' ? 'כל הטיקרים' : getTypeDisplayName(type);
        countElement.textContent = `${filteredData.length} טיקרים${type !== 'all' ? ` (${typeText})` : ''}`;
      }
    }

    window.Logger.info(`🔍 Filtered ${filteredData.length} tickers out of ${window.tickersData.length} for type: ${type}`, { page: "tickers" });
  } catch (error) {
    window.Logger.error('filterTickersByType failed', { page: 'tickers', type, error: error?.message || error });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בסינון טיקרים');
    }
  }
}

/**
 * Get display name for ticker type in Hebrew
 * @param {string} type - Ticker type
 * @returns {string} Display name in Hebrew
 * @deprecated Use window.translateTickerType() from translation-utils.js instead
 * This function is kept for backward compatibility but should use the centralized Translation Utilities
 */
function getTypeDisplayName(type) {
  try {
    // Use Translation Utilities if available
    if (window.translateTickerType && typeof window.translateTickerType === 'function') {
      return window.translateTickerType(type);
    }
    
    // Fallback to local implementation
    const typeNames = {
      'stock': 'מניות',
      'etf': 'ETF',
      'bond': 'אג"ח',
      'crypto': 'קריפטו',
      'forex': 'מטבע חוץ',
      'commodity': 'סחורה',
      'other': 'אחר'
    };
    return typeNames[type] || type;
  } catch (error) {
    window.Logger.error('getTypeDisplayName failed', { page: 'tickers', type, error: error?.message || error });
    return type;
  }
}

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// ===== UTILITY FUNCTIONS =====
// Helper functions for UI interactions and general utilities

// toggleSection function removed - using global version from ui-basic.js

// REMOVED: toggleTickersSection - use window.toggleSection('tickers') from ui-utils.js directly

// ===== MODAL FUNCTIONS - NEW SYSTEM =====
// Modal management using ModalManagerV2

// REMOVED: showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly

// REMOVED: showEditTickerModal - use window.ModalManagerV2.showEditModal('tickersModal', 'ticker', tickerId) directly

/**
 * שמירת טיקר
 * Handles both add and edit modes
 */
// REMOVED: Duplicate saveTicker function - using ModalManagerV2 automatic CRUD handling

/**
 * מחיקת טיקר
 * Includes linked items check
 */
// REMOVED: Duplicate deleteTicker function - using confirmDeleteTicker instead

// Export functions to window for global access
// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly
// REMOVED: window.showEditTickerModal - use window.ModalManagerV2.showEditModal('tickersModal', 'ticker', id) directly
// Note: saveTicker and deleteTicker removed - using ModalManagerV2 and confirmDeleteTicker instead

