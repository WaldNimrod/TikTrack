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

/**
 * טעינת נתוני תכניות מסחר מהשרת
 */
async function loadTradePlansData() {
  try {
    // Loading trade plans data from server...

    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const url = `${base}/api/trade_plans/`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.data) {
      // Server response does not contain data field
      tradePlansData = [];
      isDataLoaded = true;
      return [];
    }

    if (!Array.isArray(responseData.data)) {
      // Server data is not an array
      tradePlansData = [];
      isDataLoaded = true;
      return [];
    }

    tradePlansData = responseData.data;
    isDataLoaded = true;

    // Loaded ${tradePlansData.length} trade plans
    return tradePlansData;

  } catch {
    // Error loading trade plans data

    // Use demo data as fallback
    tradePlansData = getDemoTradePlansData();
    isDataLoaded = true;

    // Using demo data: ${tradePlansData.length} trade plans
    return tradePlansData;
  }
}

/**
 * קבלת נתוני תכניות מסחר
 */
function getTradePlans() {
  return tradePlansData;
}

/**
 * בדיקה אם הנתונים נטענו
 */
function isTradePlansLoaded() {
  return isDataLoaded;
}

/**
 * עיצוב סטטוס תכנון להצגה
 */
function formatTradePlanStatus(status) {
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
function getTradePlanById(id) {
  return tradePlansData.find(plan => plan.id === id);
}

/**
 * קבלת תכנונים לפי סטטוס
 */
function getTradePlansByStatus(status) {
  return tradePlansData.filter(plan => plan.status === status);
}

/**
 * קבלת תכנונים לפי סוג השקעה
 */
function getTradePlansByInvestmentType(investmentType) {
  return tradePlansData.filter(plan => plan.investment_type === investmentType);
}

/**
 * קבלת תכנונים לפי חשבון
 */
function getTradePlansByAccount(accountId) {
  return tradePlansData.filter(plan => plan.account_id === accountId);
}

/**
 * קבלת תכנונים לפי טיקר
 */
function getTradePlansByTicker(tickerId) {
  return tradePlansData.filter(plan => plan.ticker_id === tickerId);
}

/**
 * חיפוש תכנונים לפי טקסט
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

/**
 * נתוני דמו לתכניות מסחר
 */
function getDemoTradePlansData() {
  return [
    {
      id: 1,
      ticker_id: 1,
      account_id: 1,
      investment_type: 'stock',
      status: 'open',
      entry_conditions: 'מחיר מתחת ל-50$',
      reasons: 'חברה יציבה עם פוטנציאל צמיחה',
      created_at: '2025-08-01T10:00:00Z',
      updated_at: '2025-08-01T10:00:00Z',
      ticker: {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
      },
    },
    {
      id: 2,
      ticker_id: 2,
      account_id: 1,
      investment_type: 'stock',
      status: 'closed',
      entry_conditions: 'מחיר מעל 100$',
      reasons: 'חברה טכנולוגית עם ביצועים טובים',
      created_at: '2025-07-15T14:30:00Z',
      updated_at: '2025-08-15T16:45:00Z',
      ticker: {
        id: 2,
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
      },
    },
  ];
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
window.loadTradePlansData = loadTradePlansData;
window.formatTradePlanStatus = formatTradePlanStatus;
window.parseTradePlanStatus = parseTradePlanStatus;

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

