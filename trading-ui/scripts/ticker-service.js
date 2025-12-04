/**
 * Ticker Service - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the ticker service for TikTrack.
 * Provides advanced ticker management functions with caching and filtering.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/TICKER_SERVICE_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

// ===== שירות טיקרים כללי =====
/*
 * Ticker Service - Global Ticker Management
 * ========================================
 *
 * שירות כללי לטיקרים שמספק פונקציות מתקדמות לקבלת טיקרים
 * לפי תנאים שונים. זמין לכל העמודים באפליקציה.
 *
 * פונקציות עיקריות:
 * - getTickers() - קבלת כל הטיקרים
 * - getTickersWithTrades() - טיקרים עם טריידים
 * - getTickersWithPlans() - טיקרים עם תכנונים
 * - getTickersByStatus() - טיקרים לפי סטטוס
 * - getTickersByType() - טיקרים לפי סוג
 *
 * File: trading-ui/scripts/ticker-service.js
 * Version: 1.0
 * Created: August 25, 2025
 */

// Cache לטיקרים
let tickersCache = null;
let tradesCache = null;
let plansCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 דקות

function resolveExternalCurrencySymbol(quoteCurrency, symbol = '') {
  const normalized = typeof quoteCurrency === 'string' ? quoteCurrency.trim() : '';
  if (normalized) {
    return { symbol: normalized, hasCurrency: true };
  }

  const metadata = { symbol, page: 'tickers' };
  window.Logger?.warn?.('⚠️ External quote missing currency value', metadata);

  const notificationMessage = symbol
    ? `לא התקבל מטבע מהספק עבור ${symbol}`
    : 'לא התקבל מטבע מהספק עבור הטיקר שנבדק';

  if (typeof window.showWarningNotification === 'function') {
    window.showWarningNotification('נתוני מטבע חסרים', notificationMessage, 6000, 'system');
  } else if (typeof window.showNotification === 'function') {
    window.showNotification('נתוני מטבע חסרים', 'warning');
  }

  return { symbol: '', hasCurrency: false };
}

/**
 * בדיקה אם ה-cache עדכני
 */
/**
 * Check if cache is valid
 * @function isCacheValid
 * @returns {boolean} Whether cache is valid
 */
function isCacheValid() {
  return lastCacheUpdate && Date.now() - lastCacheUpdate < CACHE_DURATION;
}

/**
 * ניקוי ה-cache
 */
/**
 * Clear ticker cache
 * @function clearCache
 * @returns {void}
 * @deprecated Use window.clearCacheQuick() or window.clearAllCacheAdvanced() instead
 */
function clearCache() {
  // Use centralized cache clearing instead of local clearing
  if (typeof window.clearCacheQuick === 'function') {
    window.clearCacheQuick();
  } else {
    // Fallback to local clearing only if centralized system not available
    tickersCache = null;
    tradesCache = null;
    plansCache = null;
    lastCacheUpdate = null;
    console.log('🧹 Tickers cache cleared (local fallback)');
  }
}

/**
 * קבלת כל הטיקרים מהשרת
 * @returns {Promise<Array>} מערך של טיקרים
 */
/**
 * Get all tickers from server
 * @function getTickers
 * @async
 * @returns {Promise<Array>} Array of tickers
 */
async function getTickers() {
  try {
    const response = await fetch('/api/tickers/');
    if (response.ok) {
      const data = await response.json();
      const tickers = data.data || data || [];

      return tickers;
    } else {
      // Failed to fetch tickers
      return [];
    }
  } catch {
    // Error fetching tickers
    return [];
  }
}

/**
 * קבלת טריידים מהשרת
 * @returns {Promise<Array>} מערך של טריידים
 */
/**
 * Get all trades from server
 * @function getTrades
 * @async
 * @returns {Promise<Array>} Array of trades
 */
async function getTrades() {
  try {
    const response = await fetch('/api/trades/');
    if (response.ok) {
      const data = await response.json();
      const trades = data.data || data || [];

      return trades;
    } else {
      // Failed to fetch trades
      return [];
    }
  } catch {
    // Error fetching trades
    return [];
  }
}

/**
 * קבלת תכנונים מהשרת (אופציונלי)
 * @returns {Promise<Array>} מערך של תכנונים
 */
/**
 * Get all trade plans from server
 * @function getTradePlans
 * @async
 * @returns {Promise<Array>} Array of trade plans
 */
async function getTradePlans() {
  try {
    const response = await fetch('/api/trade-plans/');
    if (response.ok) {
      const data = await response.json();
      const plans = data.data || data || [];

      return plans;
    } else {

      return [];
    }
  } catch {

    return [];
  }
}

/**
 * טעינת נתונים ל-cache
 */
/**
 * Load cache data
 * @function loadCache
 * @async
 * @returns {Promise<void>}
 */
async function loadCache() {
  if (isCacheValid()) {

    return;
  }

  try {
    const [tickers, trades, plans] = await Promise.all([
      getTickers(),
      getTrades(),
      getTradePlans(),
    ]);

    tickersCache = tickers;
    tradesCache = trades;
    plansCache = plans;
    lastCacheUpdate = Date.now();

  } catch {
    // Error loading cache
    clearCache();
  }
}

/**
 * קבלת טיקרים עם טריידים
 * @param {Object} options - אפשרויות סינון
 * @param {Array} options.tradeStatuses - סטטוסי טריידים (['active', 'closed', 'open'])
 * @param {boolean} options.useCache - האם להשתמש ב-cache
 * @returns {Promise<Array>} מערך של טיקרים עם טריידים
 */
/**
 * Get tickers with trades
 * @function getTickersWithTrades
 * @async
 * @param {Object} options - Options for filtering
 * @returns {Promise<Array>} Array of tickers with trades
 */
async function getTickersWithTrades(options = {}) {
  const { tradeStatuses = ['active', 'closed', 'open', 'cancelled'], useCache = true } = options;

  if (useCache) {
    await loadCache();
  } else {
    clearCache();
    await loadCache();
  }

  const tickers = tickersCache || await getTickers();
  const trades = tradesCache || await getTrades();

  const relevantTickers = tickers.filter(ticker => trades.some(trade =>
    trade.ticker_id === ticker.id &&
            tradeStatuses.includes(trade.status),
  ));

  return relevantTickers;
}

/**
 * קבלת טיקרים עם תכנונים
 * @param {Object} options - אפשרויות סינון
 * @param {Array} options.planStatuses - סטטוסי תכנונים
 * @param {boolean} options.useCache - האם להשתמש ב-cache
 * @returns {Promise<Array>} מערך של טיקרים עם תכנונים
 */
/**
 * Get tickers with trade plans
 * @function getTickersWithPlans
 * @async
 * @param {Object} options - Options for filtering
 * @returns {Promise<Array>} Array of tickers with trade plans
 */
async function getTickersWithPlans(options = {}) {
  const { planStatuses = [], useCache = true } = options;

  if (useCache) {
    await loadCache();
  } else {
    clearCache();
    await loadCache();
  }

  const tickers = tickersCache || await getTickers();
  const plans = plansCache || await getTradePlans();

  if (plans.length === 0) {

    return [];
  }

  const relevantTickers = tickers.filter(ticker => plans.some(plan =>
    plan.ticker_id === ticker.id &&
            (planStatuses.length === 0 || planStatuses.includes(plan.status)),
  ));

  return relevantTickers;
}

/**
 * קבלת טיקרים עם תכנונים או טריידים
 * @param {Object} options - אפשרויות סינון
 * @param {Array} options.tradeStatuses - סטטוסי טריידים
 * @param {Array} options.planStatuses - סטטוסי תכנונים
 * @param {boolean} options.useCache - האם להשתמש ב-cache
 * @returns {Promise<Array>} מערך של טיקרים רלוונטיים
 */
/**
 * Get relevant tickers
 * @function getRelevantTickers
 * @async
 * @param {Object} options - Options for filtering
 * @returns {Promise<Array>} Array of relevant tickers
 */
async function getRelevantTickers(options = {}) {
  const {
    tradeStatuses = ['active', 'closed', 'open', 'cancelled'],
    planStatuses = [],
    useCache = true,
  } = options;

  if (useCache) {
    await loadCache();
  } else {
    clearCache();
    await loadCache();
  }

  const tickers = tickersCache || await getTickers();
  const trades = tradesCache || await getTrades();
  const plans = plansCache || await getTradePlans();

  const relevantTickers = tickers.filter(ticker => {
    const hasTrades = trades.some(trade =>
      trade.ticker_id === ticker.id &&
            tradeStatuses.includes(trade.status),
    );

    const hasPlans = plans.length > 0 && plans.some(plan =>
      plan.ticker_id === ticker.id &&
            (planStatuses.length === 0 || planStatuses.includes(plan.status)),
    );

    if (hasTrades || hasPlans) {
      // Ticker has trades or plans
    }

    return hasTrades || hasPlans;
  });

  return relevantTickers;
}

/**
 * קבלת טיקרים עם טריידים ותכנונים בסטטוס פתוח או סגור
 * @param {Object} options - אפשרויות סינון
 * @param {boolean} options.useCache - האם להשתמש ב-cache
 * @returns {Promise<Array>} מערך של טיקרים עם טריידים ותכנונים פתוחים/סגורים
 */
/**
 * Get tickers with open or closed trades and plans
 * @function getTickersWithOpenOrClosedTradesAndPlans
 * @async
 * @param {Object} options - Options for filtering
 * @returns {Promise<Array>} Array of tickers with trades and plans
 */
async function getTickersWithOpenOrClosedTradesAndPlans(options = {}) {
  const { useCache = true } = options;

  if (useCache) {
    await loadCache();
  } else {
    clearCache();
    await loadCache();
  }

  const tickers = tickersCache || await getTickers();
  const trades = tradesCache || await getTrades();
  const plans = plansCache || await getTradePlans();

  const relevantTickers = tickers.filter(ticker => {
    // בדיקת טריידים בסטטוס פתוח או סגור
    const hasOpenOrClosedTrades = trades.some(trade =>
      trade.ticker_id === ticker.id &&
            (trade.status === 'open' || trade.status === 'closed'),
    );

    // בדיקת תכנונים בסטטוס פתוח או סגור
    const hasOpenOrClosedPlans = plans.length > 0 && plans.some(plan =>
      plan.ticker_id === ticker.id &&
            (plan.status === 'open' || plan.status === 'closed'),
    );

    if (hasOpenOrClosedTrades || hasOpenOrClosedPlans) {
      // Ticker has open or closed trades/plans
    }

    return hasOpenOrClosedTrades || hasOpenOrClosedPlans;
  });

  return relevantTickers;
}

/**
 * קבלת טיקרים לפי סוג
 * @param {Array} types - סוגי טיקרים
 * @param {boolean} useCache - האם להשתמש ב-cache
 * @returns {Promise<Array>} מערך של טיקרים
 */
/**
 * Get tickers by type
 * @function getTickersByType
 * @async
 * @param {Array} types - Ticker types
 * @param {boolean} useCache - Whether to use cache
 * @returns {Promise<Array>} Array of tickers by type
 */
async function getTickersByType(types = [], useCache = true) {
  if (useCache) {
    await loadCache();
  } else {
    clearCache();
    await loadCache();
  }

  const tickers = tickersCache || await getTickers();

  if (types.length === 0) {
    return tickers;
  }

  const filteredTickers = tickers.filter(ticker =>
    types.includes(ticker.type),
  );

  return filteredTickers;
}

/**
 * קבלת טיקרים לפי סטטוס פעילות
 * @param {boolean} activeOnly - האם להציג רק טיקרים פעילים
 * @param {boolean} useCache - האם להשתמש ב-cache
 * @returns {Promise<Array>} מערך של טיקרים
 */
/**
 * Get tickers by activity
 * @function getTickersByActivity
 * @async
 * @param {boolean} activeOnly - Whether to get only active tickers
 * @param {boolean} useCache - Whether to use cache
 * @returns {Promise<Array>} Array of tickers by activity
 */
async function getTickersByActivity(activeOnly = true, useCache = true) {
  if (useCache) {
    await loadCache();
  } else {
    clearCache();
    await loadCache();
  }

  const tickers = tickersCache || await getTickers();
  const trades = tradesCache || await getTrades();

  if (!activeOnly) {
    return tickers;
  }

  const activeTickers = tickers.filter(ticker => trades.some(trade =>
    trade.ticker_id === ticker.id &&
            trade.status === 'active',
  ));

  return activeTickers;
}

/**
 * עדכון שדות select עם טיקרים
 * @param {string} selectId - מזהה ה-select
 * @param {Array} tickers - מערך של טיקרים
 * @param {string} placeholder - טקסט ברירת מחדל
 */
/**
 * Update ticker select dropdown
 * @function updateTickerSelect
 * @param {string} selectId - Select element ID
 * @param {Array} tickers - Array of tickers
 * @param {string} placeholder - Placeholder text
 * @returns {void}
 */
function updateTickerSelect(selectId, tickers, placeholder = 'בחר טיקר...') {
  const select = document.getElementById(selectId);
  if (!select) {
    // Select element with id '${selectId}' not found
    return;
  }

  select.textContent = '';
  const option = document.createElement('option');
  option.value = '';
  option.textContent = placeholder;
  select.appendChild(option);

  tickers.forEach(ticker => {
    const option = document.createElement('option');
    option.value = ticker.id;
    option.textContent = `${ticker.symbol} - ${ticker.name}`;
    select.appendChild(option);
  });

}

/**
 * טעינת טיקרים עבור מודל תכנון טרייד
 * מספק טיקרים פעילים (פתוח או סגור) לעדכון שדות select
 * @returns {Promise<void>}
 */
/**
 * Load tickers for trade plan
 * @function loadTickersForTradePlan
 * @async
 * @returns {Promise<void>}
 */
async function loadTickersForTradePlan() {
  try {
    // Use /api/tickers/my to get only user's tickers
    const response = await fetch('/api/tickers/my');
    if (!response.ok) {
      // Fallback to /api/tickers/ if /my fails
      const fallbackResponse = await fetch('/api/tickers/');
      if (!fallbackResponse.ok) {
        throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
      }
      const fallbackData = await fallbackResponse.json();
      var tickers = fallbackData.data || fallbackData;
    } else {
      const data = await response.json();
      var tickers = data.data || data;
    }

    // סינון טיקרים - רק פתוח או סגור (ברמת user_ticker_status או status)
    let activeTickers = tickers.filter(ticker => {
      const status = ticker.user_ticker_status || ticker.status;
      return status === 'open' || status === 'closed';
    });

    // Sort tickers alphabetically using centralized business logic
    if (window.tickersData && typeof window.tickersData.sortTickersAlphabetically === 'function') {
      activeTickers = window.tickersData.sortTickersAlphabetically(activeTickers);
    } else {
      // Fallback sorting if service not available
      activeTickers.sort((a, b) => {
        const symbolA = (a.symbol || a.ticker_symbol || '').toUpperCase();
        const symbolB = (b.symbol || b.ticker_symbol || '').toUpperCase();
        const symbolCompare = symbolA.localeCompare(symbolB, 'he', { numeric: true, sensitivity: 'base' });
        if (symbolCompare !== 0) return symbolCompare;
        const nameA = (a.name || '').toUpperCase();
        const nameB = (b.name || '').toUpperCase();
        return nameA.localeCompare(nameB, 'he', { numeric: true, sensitivity: 'base' });
      });
    }

    // עדכון רשימת הטיקרים
    console.log('🔄 tickerService.loadTickersForTradePlan: Updating ticker select...');
    const tickerSelect = document.getElementById('ticker');
    if (tickerSelect) {
      console.log(`🔧 tickerService.loadTickersForTradePlan: Ticker select found, current value: "${tickerSelect.value}"`);
      
      // Clear existing options except the first one
      tickerSelect.textContent = '';
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'בחר טיקר';
      tickerSelect.appendChild(option);
      
      // Add ticker options - use custom name if available
      activeTickers.forEach(ticker => {
        const option = document.createElement('option');
        option.value = ticker.id;
        const displayName = ticker.name_custom || ticker.name || ticker.symbol;
        option.textContent = `${ticker.symbol} - ${displayName}`;
        tickerSelect.appendChild(option);
      });
      
      console.log(`✅ tickerService.loadTickersForTradePlan: Added ${activeTickers.length} ticker options`);

    } else {
      console.log('❌ tickerService.loadTickersForTradePlan: Ticker select not found');
    }

  } catch {
    // Error loading tickers
    // Fallback to static options if API fails
  }
}

// הגדרת הפונקציות כגלובליות
// ===== GLOBAL EXPORTS =====
window.isCacheValid = isCacheValid;
window.clearCache = clearCache;
window.getTickers = getTickers;
window.getTrades = getTrades;
window.getTradePlans = getTradePlans;
window.loadCache = loadCache;
window.getTickersWithTrades = getTickersWithTrades;
window.getTickersWithPlans = getTickersWithPlans;
window.getRelevantTickers = getRelevantTickers;
window.getTickersWithOpenOrClosedTradesAndPlans = getTickersWithOpenOrClosedTradesAndPlans;
window.getTickersByType = getTickersByType;
window.getTickersByActivity = getTickersByActivity;
window.updateTickerSelect = updateTickerSelect;
window.loadTickersForTradePlan = loadTickersForTradePlan;
window.saveTicker = saveTicker;
window.updateTicker = updateTicker;
window.deleteTicker = deleteTicker;
window.updateTickerActiveTradesStatus = updateTickerActiveTradesStatus;
window.updateAllActiveTradesStatuses = updateAllActiveTradesStatuses;
window.updateAllTickerStatuses = updateAllTickerStatuses;
window.updateTickerFromTradePlan = updateTickerFromTradePlan;
window.updateTickersListForClosedTrades = updateTickersListForClosedTrades;
window.resolveExternalCurrencySymbol = resolveExternalCurrencySymbol;

// ===== TICKER SERVICE OBJECT =====
/**
 * Ticker Service Object - Provides unified interface for ticker operations
 * This object wraps all ticker-related functions for easier access
 */
window.tickerService = {
    getTickers: getTickers,
    getTrades: getTrades,
    getTradePlans: getTradePlans,
    loadCache: loadCache,
    getTickersWithTrades: getTickersWithTrades,
    getTickersWithPlans: getTickersWithPlans,
    getRelevantTickers: getRelevantTickers,
    getTickersWithOpenOrClosedTradesAndPlans: getTickersWithOpenOrClosedTradesAndPlans,
    getTickersByType: getTickersByType,
    getTickersByActivity: getTickersByActivity,
    updateTickerSelect: updateTickerSelect,
    loadTickersForTradePlan: loadTickersForTradePlan,
    saveTicker: saveTicker,
    updateTicker: updateTicker,
    deleteTicker: deleteTicker,
    updateTickerActiveTradesStatus: updateTickerActiveTradesStatus,
    updateAllActiveTradesStatuses: updateAllActiveTradesStatuses,
    updateAllTickerStatuses: updateAllTickerStatuses,
    updateTickerFromTradePlan: updateTickerFromTradePlan,
    updateTickersListForClosedTrades: updateTickersListForClosedTrades,
    resolveExternalCurrencySymbol: resolveExternalCurrencySymbol,
    isCacheValid: isCacheValid,
    clearCache: clearCache
};

// ===== CRUD OPERATIONS =====

function resolveFieldId(candidateIds, fallbackId) {
  const ids = Array.isArray(candidateIds) ? candidateIds : [candidateIds];
  const activeModal =
    document.querySelector('.modal.show') ||
    document.getElementById('tickersModal') ||
    null;

  for (const candidate of ids) {
    if (!candidate) {
      continue;
    }

    const byId = document.getElementById(candidate);
    if (byId) {
      return candidate;
    }

    if (activeModal) {
      const scopedById = activeModal.querySelector(`#${candidate}`);
      if (scopedById) {
        return candidate;
      }

      const scopedByName = activeModal.querySelector(`[name="${candidate}"]`);
      if (scopedByName) {
        if (!scopedByName.id) {
          const generatedId = `${candidate}__resolved`;
          scopedByName.id = document.getElementById(generatedId)
            ? `${generatedId}_${Date.now()}`
            : generatedId;
        }
        return scopedByName.id;
      }
    }
  }

  if (fallbackId) {
    return fallbackId;
  }

  if (Array.isArray(candidateIds) && candidateIds.length > 0) {
    return candidateIds[0];
  }

  return undefined;
}

/**
 * שמירת טיקר חדש
 * 
 * Note: updated_at field is NOT set during creation - it's reserved for future pricing system updates
 */
/**
 * Save ticker
 * @function saveTicker
 * @async
 * @returns {Promise<void>}
 */
async function saveTicker() {
  const symbolFieldId = resolveFieldId(['tickerSymbol', 'addTickerSymbol']);
  const nameFieldId = resolveFieldId(['tickerName', 'addTickerName']);
  const typeFieldId = resolveFieldId(['tickerType', 'addTickerType']);
  const currencyFieldId = resolveFieldId(['tickerCurrency', 'addTickerCurrency']);
  const statusFieldId = resolveFieldId(['tickerStatus', 'addTickerStatus']);
  const remarksFieldId = resolveFieldId(['tickerRemarks', 'addTickerRemarks']);

  // איסוף נתונים מהטופס באמצעות DataCollectionService
  const tickerData = DataCollectionService.collectFormData({
    symbol: { id: symbolFieldId, type: 'text' },
    name: { id: nameFieldId, type: 'text' },
    type: { id: typeFieldId, type: 'text' },
    currency_id: { id: currencyFieldId, type: 'int' },
    status: { id: statusFieldId, type: 'text' },
    remarks: { id: remarksFieldId, type: 'text' }
  });

  const symbol = tickerData.symbol?.trim().toUpperCase() || '';
  const name = tickerData.name?.trim() || '';
  const type = tickerData.type || 'stock'; // ברירת מחדל: מניה
  const currency_id = tickerData.currency_id || 1; // ברירת מחדל: USD
  const status = tickerData.status || 'closed'; // ברירת מחדל: סגור
  const remarks = tickerData.remarks?.trim() || '';

  // ולידציה מקיפה
  if (!symbol) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'יש להזין סמל טיקר');
    }
    return;
  }

  if (!name) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'יש להזין שם טיקר');
    }
    return;
  }

  if (!type) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'יש לבחור סוג טיקר');
    }
    return;
  }

  if (!currency_id) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'יש לבחור מטבע');
    }
    return;
  }

  if (!status || !['open', 'closed', 'cancelled'].includes(status)) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת וולידציה', 'יש לבחור סטטוס תקין');
    }
    return;
  }

  // בדיקה אם הסמל כבר קיים במערכת
  const existingTicker = (window.tickersData || []).find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
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

  try {
    const tickerPayload = {
      symbol,
      name,
      type,
      currency_id,
      status: finalStatus,
      remarks: remarks || null,
    };

    const response = await fetch('/api/tickers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tickerPayload),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    const crudResult = await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'tickersModal',
      successMessage: `טיקר ${symbol} נוסף בהצלחה!`,
      apiUrl: '/api/tickers/',
      entityName: 'טיקר'
    });

    // Return result so wrapper functions can check if save was successful
    return crudResult;

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת טיקר');
    throw error; // Re-throw so wrapper can handle it
  }
}

/**
 * עדכון טיקר קיים
 */
/**
 * Update ticker
 * @function updateTicker
 * @async
 * @returns {Promise<void>}
 */
async function updateTicker() {
  // שימוש ב-DataCollectionService לאיסוף נתונים
  const statusFieldId = resolveFieldId(['tickerStatus', 'editTickerStatus']);
  const tickerData = DataCollectionService.collectFormData({
    symbol: { id: 'tickerSymbol', type: 'text' },
    name: { id: 'tickerName', type: 'text' },
    type: { id: 'tickerType', type: 'text' },
    currency_id: { id: 'tickerCurrency', type: 'int' },
    remarks: { id: 'tickerRemarks', type: 'text' },
    status: { id: statusFieldId, type: 'text' }
  });

  const symbol = tickerData.symbol.trim().toUpperCase();
  const name = tickerData.name.trim();
  const type = tickerData.type;
  const currency_id = tickerData.currency_id;
  const remarks = tickerData.remarks.trim();
  const status = tickerData.status;

  // ולידציה גלובלית
  if (window.validateForm) {
    if (!window.validateForm('editTickerForm')) {
      return;
    }
  }

  try {
    const tickerPayload = {
      symbol,
      name,
      type,
      currency_id,
      status,
      remarks: remarks || null,
    };

    const response = await fetch(`/api/tickers/${window.currentTickerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tickerPayload),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleUpdateResponse(response, {
      modalId: 'tickersModal',
      successMessage: `טיקר ${symbol} עודכן בהצלחה!`,
      apiUrl: '/api/tickers/',
      entityName: 'טיקר'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'עדכון טיקר');
  }
}

/**
 * מחיקת טיקר
 */
/**
 * Delete ticker
 * @function deleteTicker
 * @async
 * @returns {Promise<void>}
 */
async function deleteTicker() {
  try {
    const response = await fetch(`/api/tickers/${window.currentTickerId}`, {
      method: 'DELETE',
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      modalId: 'deleteTickerModal',
      successMessage: `טיקר נמחק בהצלחה!`,
      apiUrl: '/api/tickers/',
      entityName: 'טיקר'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת טיקר');
  }
}

// ===== TICKER STATUS UPDATE FUNCTIONS =====

/**
 * Update ticker active trades status
 * TICKER SERVICE - Centralized function for updating ticker active trades status
 *
 * @param {number} tickerId - Ticker ID
 * @returns {Promise<boolean>} true if successful, false otherwise
 */
/**
 * Update ticker active trades status
 * @function updateTickerActiveTradesStatus
 * @async
 * @param {number} tickerId - Ticker ID
 * @returns {Promise<void>}
 */
async function updateTickerActiveTradesStatus(tickerId) {
  try {
    const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      // עדכון הנתונים המקומיים אם קיימים
      if (window.tickersData && Array.isArray(window.tickersData)) {
        const tickerIndex = window.tickersData.findIndex(ticker => ticker.id === tickerId);
        if (tickerIndex !== -1) {
          window.tickersData[tickerIndex].active_trades = result.data.active_trades;
          window.tickersData[tickerIndex].status = result.data.status;
        }
      }

      // רענון הטבלה אם הפונקציה זמינה
      if (typeof window.updateTickersTable === 'function') {
        window.updateTickersTable(window.tickersData);
      }

      return true;
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error('Error updating ticker active trades status:', error);
    }
    
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בעדכון סטטוס טיקר', error.message);
    }
    
    return false;
  }
}

/**
 * Update all tickers active trades status
 * TICKER SERVICE - Centralized function for updating all tickers active trades status
 *
 * @returns {Promise<number>} Number of successfully updated tickers
 */
/**
 * Update all active trades statuses
 * @function updateAllActiveTradesStatuses
 * @async
 * @returns {Promise<void>}
 */
async function updateAllActiveTradesStatuses() {
  try {
    const response = await fetch('/api/tickers/update-all-active-trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      // עדכון הנתונים המקומיים אם קיימים
      if (window.tickersData && Array.isArray(window.tickersData)) {
        // עדכון כל הטיקרים עם הנתונים החדשים
        result.data.forEach(updatedTicker => {
          const tickerIndex = window.tickersData.findIndex(ticker => ticker.id === updatedTicker.id);
          if (tickerIndex !== -1) {
            window.tickersData[tickerIndex] = { ...window.tickersData[tickerIndex], ...updatedTicker };
          }
        });
      }

      // רענון הטבלה אם הפונקציה זמינה
      if (typeof window.updateTickersTable === 'function') {
        window.updateTickersTable(window.tickersData);
      }

      return result.data.length;
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error('Error updating all tickers active trades status:', error);
    }
    
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בעדכון סטטוסי טיקרים', error.message);
    }
    
    return 0;
  }
}

/**
 * Update all ticker statuses
 * TICKER SERVICE - Centralized function for updating all ticker statuses
 *
 * @returns {Promise<number>} Number of successfully updated tickers
 */
/**
 * Update all ticker statuses
 * @function updateAllTickerStatuses
 * @async
 * @returns {Promise<void>}
 */
async function updateAllTickerStatuses() {
  try {
    const response = await fetch('/api/tickers/update-all-statuses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      // עדכון הנתונים המקומיים אם קיימים
      if (window.tickersData && Array.isArray(window.tickersData)) {
        // עדכון כל הטיקרים עם הנתונים החדשים
        result.data.forEach(updatedTicker => {
          const tickerIndex = window.tickersData.findIndex(ticker => ticker.id === updatedTicker.id);
          if (tickerIndex !== -1) {
            window.tickersData[tickerIndex] = { ...window.tickersData[tickerIndex], ...updatedTicker };
          }
        });
      }

      // רענון הטבלה אם הפונקציה זמינה
      if (typeof window.updateTickersTable === 'function') {
        window.updateTickersTable(window.tickersData);
      }

      return result.data.length;
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error('Error updating all ticker statuses:', error);
    }
    
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בעדכון סטטוסי טיקרים', error.message);
    }
    
    return 0;
  }
}

/**
 * Update ticker from trade plan
 * TICKER SERVICE - Centralized function for updating ticker based on trade plan
 *
 * @param {string} tradePlanId - Trade plan ID
 * @returns {Promise<Object|null>} Updated ticker data or null if error
 */
/**
 * Update ticker from trade plan
 * @function updateTickerFromTradePlan
 * @async
 * @param {number} tradePlanId - Trade plan ID
 * @returns {Promise<void>}
 */
async function updateTickerFromTradePlan(tradePlanId) {
  if (!tradePlanId) {
    return null;
  }

  try {
    const response = await fetch(`/api/trade-plans/${tradePlanId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'success' && result.data) {
      const tradePlan = result.data;
      
      // החזרת נתוני הטיקר והמחיר
      return {
        tickerId: tradePlan.ticker_id,
        tickerSymbol: tradePlan.ticker_symbol,
        tickerName: tradePlan.ticker_name,
        price: tradePlan.price,
        currency: tradePlan.currency
      };
    } else {
      throw new Error('Trade plan not found');
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error('Error updating ticker from trade plan:', error);
    }
    
    return null;
  }
}

/**
 * Update tickers list for closed trades filter
 * TICKER SERVICE - Centralized function for updating tickers list based on closed trades filter
 *
 * @param {boolean} showClosed - Whether to show closed trades
 * @returns {Promise<void>}
 */
/**
 * Update tickers list for closed trades
 * @function updateTickersListForClosedTrades
 * @async
 * @param {boolean} showClosed - Whether to show closed trades
 * @returns {Promise<void>}
 */
async function updateTickersListForClosedTrades(showClosed) {
  try {
    // עדכון רשימת התוכניות במודל הוספת טרייד
    if (showClosed) {
      // טעינה מחדש של נתוני המודל כדי לכלול תוכניות סגורות
      if (typeof window.loadModalData === 'function') {
        await window.loadModalData();
      }
    } else {
      // טעינה מחדש של נתוני המודל כדי להסתיר תוכניות סגורות
      if (typeof window.loadModalData === 'function') {
        await window.loadModalData();
      }
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error('Error updating tickers list for closed trades:', error);
    }
  }
}

