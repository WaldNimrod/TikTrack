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

// ===== Currency Management =====

/**
 * Load currencies from server
 * @returns {Promise<Array>} Array of currencies
 */
async function loadCurrenciesFromServer() {
  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://127.0.0.1:8080/api/v1/currencies/', {
      method: 'GET',
      headers: headers
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
        { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' }
      ];
      window.currenciesLoaded = true;
      
      return window.currenciesData;
    }

  } catch (error) {
    console.error('❌ Error loading currencies:', error);
    // טעינת מטבעות ברירת מחדל
    window.currenciesData = [
      { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' }
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
      <option value="USD" ${account && (account.currency_id === 1 || (account.currency && account.currency.symbol === 'USD') || (account.currency === 'USD')) ? 'selected' : ''}>דולר אמריקאי (USD)</option>
    `;
  }

  return window.currenciesData.map(currency => {
    const isSelected = account && (
      account.currency_id === currency.id ||
      (account.currency && account.currency.symbol === currency.symbol) ||
      (account.currency === currency.symbol) ||
      (account.currency_id && account.currency_id === currency.id)
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
  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
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
        console.warn('⚠️ Response is not an array:', typeof data);
        return [];
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed for ${endpoint}:`, error);

      if (attempt === maxRetries) {
        console.error(`❌ All ${maxRetries} attempts failed for ${endpoint}`);
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
function validateDataStructure(data, type = 'data') {
  if (!Array.isArray(data)) {
    console.error(`❌ ${type} is not an array:`, typeof data);
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

  return data.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (value && typeof value === 'string') {
        return value.toLowerCase().includes(term);
      }
      return false;
    });
  });
}

// ===== Export Functions =====

// Make functions globally available
window.loadCurrenciesFromServer = loadCurrenciesFromServer;
window.getCurrencyDisplay = getCurrencyDisplay;
window.generateCurrencyOptions = generateCurrencyOptions;
window.apiCall = apiCall;
window.loadDataFromAPI = loadDataFromAPI;
window.validateDataStructure = validateDataStructure;
window.filterDataBySearch = filterDataBySearch;

// Export module
window.dataUtils = {
    loadCurrenciesFromServer,
    getCurrencyDisplay,
    generateCurrencyOptions,
    apiCall,
    loadDataFromAPI,
    validateDataStructure,
    filterDataBySearch
};




