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

/**
 * בדיקה אם ה-cache עדכני
 */
function isCacheValid() {
  return lastCacheUpdate && Date.now() - lastCacheUpdate < CACHE_DURATION;
}

/**
 * ניקוי ה-cache
 */
function clearCache() {
  tickersCache = null;
  tradesCache = null;
  plansCache = null;
  lastCacheUpdate = null;

}

/**
 * קבלת כל הטיקרים מהשרת
 * @returns {Promise<Array>} מערך של טיקרים
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
async function getTradePlans() {
  try {
    const response = await fetch('/api/trade_plans/');
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
function updateTickerSelect(selectId, tickers, placeholder = 'בחר טיקר...') {
  const select = document.getElementById(selectId);
  if (!select) {
    // Select element with id '${selectId}' not found
    return;
  }

  select.innerHTML = `<option value="">${placeholder}</option>`;

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
async function loadTickersForTradePlan() {
  try {
    const response = await fetch('/api/tickers/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const tickers = data.data || data;

    // סינון טיקרים - רק פתוח או סגור
    const activeTickers = tickers.filter(ticker =>
      ticker.status === 'open' || ticker.status === 'closed',
    );

    // Loaded active tickers

    // עדכון רשימת הטיקרים
    console.log('🔄 tickerService.loadTickersForTradePlan: Updating ticker select...');
    const tickerSelect = document.getElementById('ticker');
    if (tickerSelect) {
      console.log(`🔧 tickerService.loadTickersForTradePlan: Ticker select found, current value: "${tickerSelect.value}"`);
      
      // Clear existing options except the first one
      tickerSelect.innerHTML = '<option value="">בחר טיקר</option>';
      
      // Add ticker options
      activeTickers.forEach(ticker => {
        const option = document.createElement('option');
        option.value = ticker.id;
        option.textContent = `${ticker.symbol} - ${ticker.name || ticker.symbol}`;
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
window.tickerService = {
  getTickers,
  getTrades,
  getTradePlans,
  getTickersWithTrades,
  getTickersWithPlans,
  getRelevantTickers,
  getTickersWithOpenOrClosedTradesAndPlans,
  getTickersByType,
  getTickersByActivity,
  updateTickerSelect,
  loadTickersForTradePlan,
  clearCache,
  loadCache,
  saveTicker,
  updateTicker,
  deleteTicker,
  updateTickerActiveTradesStatus,
  updateAllActiveTradesStatuses,
  updateAllTickerStatuses,
  updateTickerFromTradePlan,
  updateTickersListForClosedTrades,
};

// ===== CRUD OPERATIONS =====

/**
 * שמירת טיקר חדש
 * 
 * Note: updated_at field is NOT set during creation - it's reserved for future pricing system updates
 */
async function saveTicker() {
  // איסוף נתונים מהטופס באמצעות DataCollectionService
  const tickerData = DataCollectionService.collectFormData({
    symbol: { id: 'addTickerSymbol', type: 'text' },
    name: { id: 'addTickerName', type: 'text' },
    type: { id: 'addTickerType', type: 'text' },
    currency_id: { id: 'addTickerCurrency', type: 'int' },
    remarks: { id: 'addTickerRemarks', type: 'text' }
  });

  const symbol = tickerData.symbol?.trim().toUpperCase() || '';
  const name = tickerData.name?.trim() || '';
  const type = tickerData.type || 'stock'; // ברירת מחדל: מניה
  const currency_id = tickerData.currency_id || 1; // ברירת מחדל: USD
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

  // טיקר חדש תמיד יהיה "closed" (אין לו טריידים)
  const finalStatus = 'closed';

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
    await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'addTickerModal',
      successMessage: `טיקר ${symbol} נוסף בהצלחה!`,
      apiUrl: '/api/tickers/',
      entityName: 'טיקר'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת טיקר');
  }
}

/**
 * עדכון טיקר קיים
 */
async function updateTicker() {
  // שימוש ב-DataCollectionService לאיסוף נתונים
  const tickerData = DataCollectionService.collectFormData({
    symbol: { id: 'editTickerSymbol', type: 'text' },
    name: { id: 'editTickerName', type: 'text' },
    type: { id: 'editTickerType', type: 'text' },
    currency_id: { id: 'editTickerCurrency', type: 'int' },
    remarks: { id: 'editTickerRemarks', type: 'text' },
    status: { id: 'editTickerStatus', type: 'text' }
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
      modalId: 'editTickerModal',
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

