/**
 * Trade Plan Service - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the trade plan service for TikTrack.
 * Provides centralized access to trade plans data and utilities.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/TRADE_PLAN_SERVICE_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

/**
 * ========================================
 * Trade Plan Service - Global Service File
 * ========================================
 *
 * Global service file for trade plans data and utilities
 * Provides centralized access to trade plans data for all pages
 *
 * Functions:
 * - getTradePlans() - Get all trade plans data
 * - isTradePlansLoaded() - Check if data is loaded
 * - loadTradePlansData() - Load data from server
 * - formatTradePlanStatus() - Format status for display
 * - parseTradePlanStatus() - Parse status from display
 *
 * Global exports:
 * - window.tradePlanService - Main service object
 * - window.getTradePlans - Get data function
 * - window.isTradePlansLoaded - Check loaded function
 * - window.loadTradePlansData - Load data function
 * - window.formatTradePlanStatus - Format status function
 * - window.parseTradePlanStatus - Parse status function
 *
 * Author: Tik.track Development Team
 * Last update date: 2025-09-01
 * Status: ✅ Complete
 * ========================================
 */

// Global variables
let tradePlansData = [];
let isDataLoaded = false;

function normalizeTradePlansPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  throw new Error('Invalid trade plans payload');
}

function notifyTradePlanLoadError(message, error, context = {}) {
  const metadata = { page: 'trade_plan_service', ...context };
  if (typeof window.Logger?.error === 'function') {
    window.Logger.error(message, error, metadata);
  }
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה בטעינת תכניות מסחר', message, 6000, 'system');
  }
}

/**
 * טעינת נתוני תכניות מסחר מהשרת
 */
/**
 * Load trade plans data from server
 * @function loadTradePlansData
 * @async
 * @returns {Promise<Array>} Array of trade plans
 */
async function loadTradePlansData(options = {}) {
  const { force = false } = options;
  const loader = window.TradePlansData?.loadTradePlansData;
  if (typeof loader !== 'function') {
    const error = new Error('TradePlansData loader unavailable');
    isDataLoaded = false;
    notifyTradePlanLoadError('שכבת הנתונים של תכניות המסחר לא זמינה', error, { stage: 'missing-loader' });
    throw error;
  }

  try {
    const payload = await loader({ force });
    tradePlansData = normalizeTradePlansPayload(payload);
    isDataLoaded = true;
    return tradePlansData;
  } catch (error) {
    isDataLoaded = false;
    notifyTradePlanLoadError('טעינת נתוני תכניות המסחר נכשלה', error, { stage: 'load-failure' });
    throw error;
  }
}

/**
 * קבלת נתוני תכניות מסחר
 */
/**
 * Get trade plans data
 * @function getTradePlans
 * @returns {Array} Array of trade plans
 */
function getTradePlans() {
  return tradePlansData;
}

/**
 * בדיקה אם הנתונים נטענו
 */
/**
 * Check if trade plans data is loaded
 * @function isTradePlansLoaded
 * @returns {boolean} Whether data is loaded
 */
function isTradePlansLoaded() {
  return isDataLoaded;
}

/**
 * עיצוב סטטוס תכנון להצגה
 */
/**
 * Format trade plan status for display
 * @function formatTradePlanStatus
 * @param {string} status - Trade plan status
 * @returns {string} Formatted status
 */
function formatTradePlanStatus(status) {
  // Use Translation Utilities if available
  if (window.translateTradePlanStatus && typeof window.translateTradePlanStatus === 'function') {
    return window.translateTradePlanStatus(status);
  }
  
  // Fallback to local implementation
  const statusMap = {
    'open': 'פתוח',
    'closed': 'סגור',
    'cancelled': 'בוטל',
  };

  return statusMap[status] || status;
}

/**
 * המרת סטטוס מתצוגה לערך
 */
/**
 * Parse trade plan status from display
 * @function parseTradePlanStatus
 * @param {string} displayStatus - Display status
 * @returns {string} Parsed status
 */
function parseTradePlanStatus(displayStatus) {
  const reverseStatusMap = {
    'פתוח': 'open',
    'סגור': 'closed',
    'בוטל': 'cancelled',
  };

  return reverseStatusMap[displayStatus] || displayStatus;
}

/**
 * קבלת תכנון לפי ID
 */
/**
 * Get trade plan by ID
 * @function getTradePlanById
 * @param {number} id - Trade plan ID
 * @returns {Object|null} Trade plan object or null
 */
function getTradePlanById(id) {
  return tradePlansData.find(plan => plan.id === id);
}

/**
 * קבלת תכנונים לפי סטטוס
 */
/**
 * Get trade plans by status
 * @function getTradePlansByStatus
 * @param {string} status - Trade plan status
 * @returns {Array} Array of trade plans
 */
function getTradePlansByStatus(status) {
  return tradePlansData.filter(plan => plan.status === status);
}

/**
 * קבלת תכנונים לפי סוג השקעה
 */
/**
 * Get trade plans by investment type
 * @function getTradePlansByInvestmentType
 * @param {string} investmentType - Investment type
 * @returns {Array} Array of trade plans
 */
function getTradePlansByInvestmentType(investmentType) {
  return tradePlansData.filter(plan => plan.investment_type === investmentType);
}

/**
 * קבלת תכנונים לפי חשבון
 */
/**
 * Get trade plans by account
 * @function getTradePlansByAccount
 * @param {number} accountId - Account ID
 * @returns {Array} Array of trade plans
 */
function getTradePlansByAccount(accountId) {
  return tradePlansData.filter(plan => plan.account_id === accountId);
}

/**
 * קבלת תכנונים לפי טיקר
 */
/**
 * Get trade plans by ticker
 * @function getTradePlansByTicker
 * @param {number} tickerId - Ticker ID
 * @returns {Array} Array of trade plans
 */
function getTradePlansByTicker(tickerId) {
  return tradePlansData.filter(plan => plan.ticker_id === tickerId);
}

/**
 * חיפוש תכנונים לפי טקסט
 */
/**
 * Search trade plans by text
 * @function searchTradePlans
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching trade plans
 */
function searchTradePlans(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return tradePlansData;
  }

  const searchTermLower = searchTerm.toLowerCase();
  return tradePlansData.filter(plan =>
    plan.ticker?.symbol?.toLowerCase().includes(searchTermLower) ||
        plan.ticker?.name?.toLowerCase().includes(searchTermLower) ||
        plan.entry_conditions?.toLowerCase().includes(searchTermLower) ||
        plan.reasons?.toLowerCase().includes(searchTermLower),
  );
}

/**
 * פילטור תכנונים לפי מספר קריטריונים
 */
/**
 * Filter trade plans by criteria
 * @function filterTradePlans
 * @param {Object} filters - Filter criteria
 * @returns {Array} Array of filtered trade plans
 */
function filterTradePlans(filters = {}) {
  let filteredData = [...tradePlansData];

  // פילטור לפי סטטוס
  if (filters.statuses && filters.statuses.length > 0) {
    filteredData = filteredData.filter(plan =>
      filters.statuses.includes(plan.status),
    );
  }

  // פילטור לפי סוג השקעה
  if (filters.types && filters.types.length > 0) {
    filteredData = filteredData.filter(plan =>
      filters.types.includes(plan.investment_type),
    );
  }

  // פילטור לפי חשבון
  if (filters.accounts && filters.accounts.length > 0) {
    filteredData = filteredData.filter(plan =>
      filters.accounts.includes(plan.account_id),
    );
  }

  // פילטור לפי תאריך
  if (filters.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    if (startDate && endDate) {
      filteredData = filteredData.filter(plan => {
        const planDate = new Date(plan.created_at);
        return planDate >= startDate && planDate <= endDate;
      });
    }
  }

  // פילטור לפי חיפוש
  if (filters.searchTerm) {
    filteredData = searchTradePlans(filters.searchTerm);
  }

  return filteredData;
}

// ===== Global Exports =====

// Main service object
window.tradePlanService = {
  getTradePlans,
  isTradePlansLoaded,
  loadTradePlansData,
  formatTradePlanStatus,
  parseTradePlanStatus,
  getTradePlanById,
  getTradePlansByStatus,
  getTradePlansByInvestmentType,
  getTradePlansByAccount,
  getTradePlansByTicker,
  searchTradePlans,
  filterTradePlans,
};

// Individual function exports
window.getTradePlans = getTradePlans;
window.isTradePlansLoaded = isTradePlansLoaded;
// Wrapper function - always uses force: true for CRUD operations (standard pattern like executions.js)
const originalLoadTradePlansData = loadTradePlansData;
window.loadTradePlansData = async function(options = {}) {
  // When called from CRUDResponseHandler, always force reload to get fresh data
  // This matches the standard pattern used in executions.js and other pages
  return await originalLoadTradePlansData({ ...options, force: true });
};
window.formatTradePlanStatus = formatTradePlanStatus;
window.parseTradePlanStatus = parseTradePlanStatus;
window.getTradePlanById = getTradePlanById;
window.getTradePlansByStatus = getTradePlansByStatus;
window.getTradePlansByInvestmentType = getTradePlansByInvestmentType;
window.getTradePlansByAccount = getTradePlansByAccount;
window.getTradePlansByTicker = getTradePlansByTicker;
window.searchTradePlans = searchTradePlans;
window.filterTradePlans = filterTradePlans;

// Data access for backward compatibility
Object.defineProperty(window, 'tradePlansData', {
  get: () => tradePlansData,
  set: value => {
    tradePlansData = value;
    isDataLoaded = true;
  },
});

Object.defineProperty(window, 'trade_plansData', {
  get: () => tradePlansData,
  set: value => {
    tradePlansData = value;
    isDataLoaded = true;
  },
});

// Trade Plan Service loaded successfully

