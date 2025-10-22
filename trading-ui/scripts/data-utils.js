/**
 * Data Utils - TikTrack Frontend
 * ==============================
 *
 * Shared data utilities for all pages
 *
 * Features:
 * - Currency loading and management
 * - Account data utilities
 * - Common data fetching functions
 *
 * @author TikTrack Development Team
 * @version 1.9.9
 * @lastUpdated August 26, 2025
 */

// ===== Utility Functions =====

/**
 * בדיקה אם ערך הוא מספרי
 * @param {*} value - הערך לבדיקה
 * @returns {boolean} true אם הערך הוא מספרי
 */
function isNumeric(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// ייצוא פונקציה גלובלית
window.isNumeric = isNumeric;

// ===== Currency Management =====

/**
 * Load currencies from server
 * @returns {Promise<Array>} Array of currencies
 */
async function loadCurrenciesFromServer() {
  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://127.0.0.1:8080/api/currencies/', {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const responseData = await response.json();
      const currencies = responseData.data || responseData;
      window.currenciesData = currencies;
      window.currenciesLoaded = true;

      return currencies;
    } else {
      // טעינת מטבעות ברירת מחדל
      window.currenciesData = [
        { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' },
      ];
      window.currenciesLoaded = true;

      return window.currenciesData;
    }

  } catch {
    // Error loading currencies
    // טעינת מטבעות ברירת מחדל
    window.currenciesData = [
      { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' },
    ];
    window.currenciesLoaded = true;

    return window.currenciesData;
  }
}

/**
 * Get currency display symbol
 * @param {Object} account - Account object
 * @returns {string} Currency symbol
 */
function getCurrencyDisplay(account) {
  if (account.currency && account.currency.symbol) {
    // אם יש פרטי מטבע מלאים
    const symbol = account.currency.symbol;
    switch (symbol) {
    case 'USD': return '$';
    case 'ILS': return '₪';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return symbol;
    }
  } else if (account.currency_id && window.currenciesData && window.currenciesData.length > 0) {
    // אם יש רק currency_id, נחפש את המטבע
    const currency = window.currenciesData.find(c => c.id === account.currency_id);
    if (currency) {
      switch (currency.symbol) {
      case 'USD': return '$';
      case 'ILS': return '₪';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency.symbol;
      }
    }
  } else if (account.currency) {
    // fallback למטבע הישן
    switch (account.currency) {
    case 'USD': return '$';
    case 'ILS': return '₪';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return account.currency;
    }
  }
  return '-';
}

/**
 * Generate currency options for forms
 * @param {Object} account - Account object for selection
 * @returns {string} HTML options string
 */
function generateCurrencyOptions(account = null) {
  if (!window.currenciesData || window.currenciesData.length === 0) {
    // אם אין מטבעות, נחזיר ברירת מחדל
    return `
      <option value="USD" ${account && (account.currency_id === 1 || account.currency && account.currency.symbol === 'USD' || account.currency === 'USD') ? 'selected' : ''}>דולר אמריקאי (USD)</option>
    `;
  }

  return window.currenciesData.map(currency => {
    const isSelected = account && (
      account.currency_id === currency.id ||
      account.currency && account.currency.symbol === currency.symbol ||
      account.currency === currency.symbol ||
      account.currency_id && account.currency_id === currency.id
    );

    return `<option value="${currency.symbol}" ${isSelected ? 'selected' : ''}>${currency.name} (${currency.symbol})</option>`;
  }).join('');
}

// ===== API Utilities =====

/**
 * Make API call with error handling
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
async function apiCall(url, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Load data from API with retry logic
 * @param {string} endpoint - API endpoint
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Array>} Data array
 */
async function loadDataFromAPI(endpoint, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiCall(endpoint);
      const data = response.data || response;

      if (Array.isArray(data)) {

        return data;
      } else {
        // console.warn('⚠️ Response is not an array:', typeof data);
        return [];
      }
    } catch {
      // Attempt failed for endpoint

      if (attempt === maxRetries) {
        // All attempts failed for endpoint
        return [];
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// ===== Data Validation =====

/**
 * Validate data structure
 * @param {Array} data - Data array to validate
 * @param {string} type - Data type for logging
 * @returns {boolean} Is valid
 */
function validateDataStructure(data, _type = 'data') {
  if (!Array.isArray(data)) {
    // Data is not an array
    return false;
  }

  return true;
}

/**
 * Filter data by search term
 * @param {Array} data - Data array
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Filtered data
 */
function filterDataBySearch(data, searchTerm, searchFields = []) {
  if (!searchTerm || searchTerm.trim() === '') {
    return data;
  }

  const term = searchTerm.toLowerCase().trim();

  return data.filter(item => searchFields.some(field => {
    const value = item[field];
    if (value && typeof value === 'string') {
      return value.toLowerCase().includes(term);
    }
    return false;
  }));
}

// ===== Validation Functions =====

/**
 * אימות שדה חובה
 * Validate required field
 */
function validateRequired(value, fieldName) {
  if (!value || value.trim() === '') {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שדה ${fieldName} הוא שדה חובה`);
    } else {
      // שדה הוא שדה חובה
    }
    return false;
  }
  return true;
}

/**
 * אימות מספר
 * Validate number
 */
function validateNumber(value, fieldName, min = null, max = null) {
  const num = parseFloat(value);
  if (isNaN(num)) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שדה ${fieldName} חייב להיות מספר`);
    } else {
      // שדה חייב להיות מספר
    }
    return false;
  }

  if (min !== null && num < min) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שדה ${fieldName} חייב להיות לפחות ${min}`);
    } else {
      // שדה חייב להיות לפחות מינימום
    }
    return false;
  }

  if (max !== null && num > max) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שדה ${fieldName} חייב להיות לכל היותר ${max}`);
    } else {
      // שדה חייב להיות לכל היותר מקסימום
    }
    return false;
  }

  return true;
}

/**
 * אימות תאריך
 * Validate date
 */
function validateDate(value, fieldName) {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שדה ${fieldName} חייב להיות תאריך תקין`);
    } else {
      // שדה חייב להיות תאריך תקין
    }
    return false;
  }
  return true;
}

// ===== Price Calculation Functions =====

/**
 * Calculate default stop and target prices
 * @param {number} currentPrice - Current price
 * @param {object} options - Additional options
 * @returns {object} Stop and target prices
 */
function calculateDefaultPrices(currentPrice, options = {}) {
  const {
    defaultStopPercent = 5,
    defaultTargetPercent = 10,
  } = options;

  const stopPrice = currentPrice * (1 - defaultStopPercent / 100);
  const targetPrice = currentPrice * (1 + defaultTargetPercent / 100);

  return {
    stopPrice: parseFloat(stopPrice.toFixed(2)),
    targetPrice: parseFloat(targetPrice.toFixed(2)),
  };
}

/**
 * Convert amount to shares
 * @param {number} amount - Amount to invest
 * @param {number} price - Current price per share
 * @param {boolean} allowFractionalShares - Whether to allow fractional shares
 * @returns {object} Shares and adjusted amount
 */
function convertAmountToShares(amount, price, allowFractionalShares = null) {
  if (!amount || !price || price <= 0) {
    // console.warn('Invalid amount or price for conversion:', { amount, price });
    return { shares: 0, adjustedAmount: 0 };
  }

  // Get user preference for fractional shares if not specified
  let useFractionalShares = allowFractionalShares;
  if (useFractionalShares === null) {
    useFractionalShares = getUserPreference('allowFractionalShares', false);
  }

  let shares;
  if (useFractionalShares) {
    // Allow fractional shares
    shares = amount / price;
  } else {
    // Only whole shares
    shares = Math.floor(amount / price);
  }

  const adjustedAmount = shares * price;

  return {
    shares: parseFloat(shares.toFixed(4)),
    adjustedAmount: parseFloat(adjustedAmount.toFixed(2)),
  };
}

/**
 * Convert shares to amount
 * @param {number} shares - Number of shares
 * @param {number} price - Current price per share
 * @returns {number} Total amount
 */
function convertSharesToAmount(shares, price) {
  if (!shares || !price || price <= 0) {
    // console.warn('Invalid shares or price for conversion:', { shares, price });
    return 0;
  }

  const amount = shares * price;
  return parseFloat(amount.toFixed(2));
}

/**
 * Get user preference
 * ✨ עודכן לתמיכה במערכת העדפות!
 * @param {string} key - Preference key
 * @param {*} defaultValue - Default value
 * @returns {*} User preference value
 */
async function getUserPreference(key, defaultValue = null) {
  try {
    console.log(`🔍 data-utils getUserPreference(${key})`);
    
    // נסה מהמערכת הגלובלית החדשה
    if (typeof window.getCurrentPreference === 'function') {
      const value = await window.getCurrentPreference(key);
      if (value !== null && value !== undefined) {
        console.log(`✅ Got preference ${key}: ${value}`);
        return value;
      }
    }
    
    // Fallback ל-localStorage מקומי
    const preferences = JSON.parse(localStorage.getItem('tikTrack_preferences') || '{}');
    const localValue = preferences[key] !== undefined ? preferences[key] : defaultValue;
    console.log(`🔄 Using localStorage preference ${key}: ${localValue}`);
    return localValue;
  } catch (error) {
    console.warn('⚠️ Error reading user preference:', error);
    return defaultValue;
  }
}

// ===== Export Functions =====

// Make functions globally available
window.loadCurrenciesFromServer = loadCurrenciesFromServer;
window.getCurrencyDisplay = getCurrencyDisplay;
window.generateCurrencyOptions = generateCurrencyOptions;
window.apiCall = apiCall;
window.calculateDefaultPrices = calculateDefaultPrices;
window.convertAmountToShares = convertAmountToShares;
window.convertSharesToAmount = convertSharesToAmount;
window.getUserPreference = getUserPreference;
window.loadDataFromAPI = loadDataFromAPI;
window.validateDataStructure = validateDataStructure;
window.filterDataBySearch = filterDataBySearch;
window.validateRequired = validateRequired;
window.validateNumber = validateNumber;
window.validateDate = validateDate;

// Export module
window.dataUtils = {
  validateRequired,
  validateNumber,
  validateDate,
  loadCurrenciesFromServer,
  getCurrencyDisplay,
  generateCurrencyOptions,
  apiCall,
  calculateDefaultPrices,
  convertAmountToShares,
  convertSharesToAmount,
  getUserPreference,
  loadDataFromAPI,
  validateDataStructure,
  filterDataBySearch,
};

// Alias for compatibility with package manifest
window.DataUtils = window.dataUtils;

// Mark as ready
window.dataUtilsReady = true;
// console.log('✅ Data Utils ready');

