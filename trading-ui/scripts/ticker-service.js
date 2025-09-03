// ===== שירות טיקרים כללי =====
/*
 * Ticker Service - Global Ticker Management
 * ========================================
 * 
 * שירות כללי לטיקרים שמספק פונקציות מתקדמות לקבלת טיקרים
 * לפי תנאים שונים. זמין לכל העמודים באפליקציה.
 * 
 * NOW INTEGRATED WITH FRONTEND CACHE MANAGER for unified caching.
 *
 * פונקציות עיקריות:
 * - getTickers() - קבלת כל הטיקרים
 * - getTickersWithTrades() - טיקרים עם טריידים
 * - getTickersWithPlans() - טיקרים עם תכנונים
 * - getTickersByStatus() - טיקרים לפי סטטוס
 * - getTickersByType() - טיקרים לפי סוג
 *
 * תכונות מתקדמות חדשות:
 * - Dependency-based cache invalidation
 * - Memory usage optimization
 * - Cache statistics tracking
 * - Real-time cache synchronization
 * - TTL management מתקדם
 *
 * Dependencies:
 * - frontend-cache-manager.js (must be loaded first)
 *
 * File: trading-ui/scripts/ticker-service.js
 * Version: 2.0 - Enhanced with FrontendCacheManager integration
 * Updated: September 2025
 */

// ===== ENHANCED CACHE MANAGEMENT =====
// הוחלף במנהל מטמון מתקדם
// let tickersCache = null;     // DEPRECATED - use frontendCacheManager.getTickersCache()
// let tradesCache = null;      // DEPRECATED - use frontendCacheManager.getTradesCache() 
// let plansCache = null;       // DEPRECATED - use frontendCacheManager.getPlansCache()
// let lastCacheUpdate = null;  // DEPRECATED - cache manager tracks this automatically
const CACHE_DURATION = 5 * 60 * 1000; // 5 דקות - עדיין בשימוש לbackward compatibility

/**
 * בדיקה אם ה-cache עדכני - משופר עם FrontendCacheManager
 * @param {string} namespace - הnamespace לבדיקה (ברירת מחדל: 'tickers')
 */
function isCacheValid(namespace = 'tickers') {
  if (!window.frontendCacheManager) {
    // Fallback למערכת הישנה
    return lastCacheUpdate && Date.now() - lastCacheUpdate < CACHE_DURATION;
  }
  return window.frontendCacheManager.hasCache(namespace, 'all');
}

/**
 * ניקוי ה-cache - משופר עם FrontendCacheManager  
 */
function clearCache() {
  if (window.frontendCacheManager) {
    // Clear specific namespaces
    window.frontendCacheManager.clearNamespace('tickers');
    window.frontendCacheManager.clearNamespace('trades');
    window.frontendCacheManager.clearNamespace('trade_plans');
    window.frontendCacheManager.log('Ticker service cache cleared via unified manager', 'info');
  } else {
    // Fallback למערכת הישנה
    tickersCache = null;
    tradesCache = null;
    plansCache = null;
    lastCacheUpdate = null;
    console.warn('[TickerService] FrontendCacheManager not available, using legacy clear');
  }
}

/**
 * קבלת כל הטיקרים מהשרת
 * @returns {Promise<Array>} מערך של טיקרים
 */
async function getTickers() {
  try {
    const response = await fetch('/api/v1/tickers/');
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
    const response = await fetch('/api/v1/trades/');
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
    const response = await fetch('/api/v1/trade_plans/');
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
 * טעינת נתונים ל-cache - משופר עם FrontendCacheManager
 */
async function loadCache() {
  // בדיקה אם כל ה-caches תקפים
  const tickersValid = isCacheValid('tickers');
  const tradesValid = isCacheValid('trades');
  const plansValid = isCacheValid('trade_plans');
  
  if (tickersValid && tradesValid && plansValid) {
    window.frontendCacheManager?.log('All ticker service caches valid, skipping reload', 'debug');
    return;
  }

  try {
    window.frontendCacheManager?.log('Loading ticker service data with dependency tracking', 'info');
    
    const [tickers, trades, plans] = await Promise.all([
      getTickers(),
      getTrades(),
      getTradePlans(),
    ]);

    // Cache עם dependencies מתקדמות
    if (window.frontendCacheManager) {
      window.frontendCacheManager.set('tickers', 'all', tickers, CACHE_DURATION, ['tickers', 'ticker_list']);
      window.frontendCacheManager.set('trades', 'all', trades, CACHE_DURATION, ['trades', 'trade_list']);
      window.frontendCacheManager.set('trade_plans', 'all', plans, CACHE_DURATION, ['trade_plans', 'plan_list']);
      
      window.frontendCacheManager.log(`Cached: ${tickers.length} tickers, ${trades.length} trades, ${plans.length} plans`, 'info');
    } else {
      // Fallback למערכת הישנה
      tickersCache = tickers;
      tradesCache = trades;
      plansCache = plans;
      lastCacheUpdate = Date.now();
      console.warn('[TickerService] Using legacy cache - FrontendCacheManager not available');
    }

  } catch (error) {
    // Error loading cache
    window.frontendCacheManager?.log(`Cache loading failed: ${error.message}`, 'error');
    clearCache();
  }
}

/**
 * קבלת טיקרים עם טריידים - משופר עם FrontendCacheManager
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

  // Get data from unified cache manager or fallback to legacy
  let tickers, trades;
  
  if (window.frontendCacheManager) {
    tickers = window.frontendCacheManager.getTickersCache() || await getTickers();
    trades = window.frontendCacheManager.getTradesCache() || await getTrades();
  } else {
    // Fallback למערכת הישנה
    tickers = tickersCache || await getTickers();
    trades = tradesCache || await getTrades();
  }

  const relevantTickers = tickers.filter(ticker => trades.some(trade =>
    trade.ticker_id === ticker.id &&
            tradeStatuses.includes(trade.status),
  ));

  window.frontendCacheManager?.log(`getTickersWithTrades: found ${relevantTickers.length} tickers with trades`, 'debug');
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

  // Get data from unified cache manager or fallback to legacy
  let tickers, plans;
  
  if (window.frontendCacheManager) {
    tickers = window.frontendCacheManager.getTickersCache() || await getTickers();
    plans = window.frontendCacheManager.getPlansCache() || await getTradePlans();
  } else {
    // Fallback למערכת הישנה
    tickers = tickersCache || await getTickers();
    plans = plansCache || await getTradePlans();
  }

  if (plans.length === 0) {
    window.frontendCacheManager?.log('No plans found, returning empty tickers array', 'debug');
    return [];
  }

  const relevantTickers = tickers.filter(ticker => plans.some(plan =>
    plan.ticker_id === ticker.id &&
            (planStatuses.length === 0 || planStatuses.includes(plan.status)),
  ));

  window.frontendCacheManager?.log(`getTickersWithPlans: found ${relevantTickers.length} tickers with plans`, 'debug');
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

  // Get data from unified cache manager or fallback to legacy
  let tickers, trades, plans;
  
  if (window.frontendCacheManager) {
    tickers = window.frontendCacheManager.getTickersCache() || await getTickers();
    trades = window.frontendCacheManager.getTradesCache() || await getTrades();
    plans = window.frontendCacheManager.getPlansCache() || await getTradePlans();
  } else {
    // Fallback למערכת הישנה
    tickers = tickersCache || await getTickers();
    trades = tradesCache || await getTrades();
    plans = plansCache || await getTradePlans();
  }

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

  window.frontendCacheManager?.log(`getRelevantTickers: found ${relevantTickers.length} relevant tickers`, 'debug');
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

  // Get data from unified cache manager or fallback to legacy
  let tickers, trades, plans;
  
  if (window.frontendCacheManager) {
    tickers = window.frontendCacheManager.getTickersCache() || await getTickers();
    trades = window.frontendCacheManager.getTradesCache() || await getTrades();
    plans = window.frontendCacheManager.getPlansCache() || await getTradePlans();
  } else {
    // Fallback למערכת הישנה
    tickers = tickersCache || await getTickers();
    trades = tradesCache || await getTrades();
    plans = plansCache || await getTradePlans();
  }

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

  // Get data from unified cache manager or fallback to legacy
  let tickers;
  
  if (window.frontendCacheManager) {
    tickers = window.frontendCacheManager.getTickersCache() || await getTickers();
  } else {
    // Fallback למערכת הישנה
    tickers = tickersCache || await getTickers();
  }

  if (types.length === 0) {
    return tickers;
  }

  const filteredTickers = tickers.filter(ticker =>
    types.includes(ticker.type),
  );
  
  window.frontendCacheManager?.log(`getTickersByType: found ${filteredTickers.length} tickers of types ${types.join(',')}`, 'debug');

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

  // Get data from unified cache manager or fallback to legacy
  let tickers, trades;
  
  if (window.frontendCacheManager) {
    tickers = window.frontendCacheManager.getTickersCache() || await getTickers();
    trades = window.frontendCacheManager.getTradesCache() || await getTrades();
  } else {
    // Fallback למערכת הישנה
    tickers = tickersCache || await getTickers();
    trades = tradesCache || await getTrades();
  }

  if (!activeOnly) {
    window.frontendCacheManager?.log(`getTickersByActivity: returning all ${tickers.length} tickers`, 'debug');
    return tickers;
  }

  const activeTickers = tickers.filter(ticker => trades.some(trade =>
    trade.ticker_id === ticker.id &&
            trade.status === 'active',
  ));

  window.frontendCacheManager?.log(`getTickersByActivity: found ${activeTickers.length} active tickers`, 'debug');
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
    const response = await fetch('/api/v1/tickers/');
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
    const tickerSelect = document.getElementById('addTradePlanTickerId');
    if (tickerSelect) {
      // שמירת האופציה הראשונה (בחר טיקר)
      const defaultOption = tickerSelect.querySelector('option[value=""]');
      tickerSelect.innerHTML = '';

      if (defaultOption) {
        tickerSelect.appendChild(defaultOption);
      }

      // הוספת טיקרים פעילים
      activeTickers.forEach(ticker => {
        const option = document.createElement('option');
        option.value = ticker.id;
        option.textContent = ticker.symbol;
        tickerSelect.appendChild(option);
      });

    } else {
      // Ticker select element not found
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
};

