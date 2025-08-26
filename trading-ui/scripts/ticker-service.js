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
    return lastCacheUpdate && (Date.now() - lastCacheUpdate) < CACHE_DURATION;
}

/**
 * ניקוי ה-cache
 */
function clearCache() {
    tickersCache = null;
    tradesCache = null;
    plansCache = null;
    lastCacheUpdate = null;
    console.log('🗑️ Ticker service cache cleared');
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
            console.log('✅ Retrieved', tickers.length, 'tickers from server');
            return tickers;
        } else {
            console.error('❌ Failed to fetch tickers:', response.status);
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching tickers:', error);
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
            console.log('✅ Retrieved', trades.length, 'trades from server');
            return trades;
        } else {
            console.error('❌ Failed to fetch trades:', response.status);
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching trades:', error);
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
            console.log('✅ Retrieved', plans.length, 'trade plans from server');
            return plans;
        } else {
            console.log('⚠️ Trade Plans API not available, returning empty array');
            return [];
        }
    } catch (error) {
        console.log('⚠️ Trade Plans API not available:', error.message);
            return [];
    }
}

/**
 * טעינת נתונים ל-cache
 */
async function loadCache() {
    if (isCacheValid()) {
        console.log('📦 Using cached data');
        return;
    }

    console.log('🔄 Loading data to cache...');

    try {
        const [tickers, trades, plans] = await Promise.all([
            getTickers(),
            getTrades(),
            getTradePlans()
        ]);

        tickersCache = tickers;
        tradesCache = trades;
        plansCache = plans;
        lastCacheUpdate = Date.now();

        console.log('✅ Cache loaded:', {
            tickers: tickers.length,
            trades: trades.length,
            plans: plans.length
        });
    } catch (error) {
        console.error('❌ Error loading cache:', error);
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

    const relevantTickers = tickers.filter(ticker => {
        return trades.some(trade =>
            trade.ticker_id === ticker.id &&
            tradeStatuses.includes(trade.status)
        );
    });

    console.log(`✅ Found ${relevantTickers.length} tickers with trades (statuses: ${tradeStatuses.join(', ')})`);
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
        console.log('⚠️ No trade plans available');
        return [];
    }

    const relevantTickers = tickers.filter(ticker => {
        return plans.some(plan =>
            plan.ticker_id === ticker.id &&
            (planStatuses.length === 0 || planStatuses.includes(plan.status))
        );
    });

    console.log(`✅ Found ${relevantTickers.length} tickers with plans`);
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
        useCache = true
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
            tradeStatuses.includes(trade.status)
        );

        const hasPlans = plans.length > 0 && plans.some(plan =>
            plan.ticker_id === ticker.id &&
            (planStatuses.length === 0 || planStatuses.includes(plan.status))
        );

        if (hasTrades || hasPlans) {
            console.log(`✅ Ticker ${ticker.symbol} (ID: ${ticker.id}) - hasTrades: ${hasTrades}, hasPlans: ${hasPlans}`);
        }

        return hasTrades || hasPlans;
    });

    console.log(`✅ Found ${relevantTickers.length} relevant tickers`);
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
            trade.ticker.id === ticker.id &&
            (trade.status === 'open' || trade.status === 'closed')
        );

        // בדיקת תכנונים בסטטוס פתוח או סגור
        const hasOpenOrClosedPlans = plans.length > 0 && plans.some(plan =>
            plan.ticker_id === ticker.id &&
            (plan.status === 'open' || plan.status === 'closed')
        );

        if (hasOpenOrClosedTrades || hasOpenOrClosedPlans) {
            console.log(`✅ Ticker ${ticker.symbol} (ID: ${ticker.id}) - hasOpenOrClosedTrades: ${hasOpenOrClosedTrades}, hasOpenOrClosedPlans: ${hasOpenOrClosedPlans}`);
        }

        return hasOpenOrClosedTrades || hasOpenOrClosedPlans;
    });

    console.log(`✅ Found ${relevantTickers.length} tickers with open or closed trades/plans`);
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
        types.includes(ticker.type)
    );

    console.log(`✅ Found ${filteredTickers.length} tickers of types: ${types.join(', ')}`);
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

    const activeTickers = tickers.filter(ticker => {
        return trades.some(trade =>
            trade.ticker_id === ticker.id &&
            trade.status === 'active'
        );
    });

    console.log(`✅ Found ${activeTickers.length} active tickers`);
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
        console.warn(`⚠️ Select element with id '${selectId}' not found`);
        return;
    }

    select.innerHTML = `<option value="">${placeholder}</option>`;

    tickers.forEach(ticker => {
        const option = document.createElement('option');
        option.value = ticker.id;
        option.textContent = `${ticker.symbol} - ${ticker.name}`;
        select.appendChild(option);
    });

    console.log(`✅ Updated select '${selectId}' with ${tickers.length} options`);
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
    clearCache,
    loadCache
};

console.log('✅ Ticker Service loaded successfully');
