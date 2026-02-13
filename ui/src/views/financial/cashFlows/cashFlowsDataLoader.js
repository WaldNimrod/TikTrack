/**
 * Cash Flows Data Loader - טעינת נתונים מ-API עבור Cash Flows View
 * -----------------------------------------------------------------------------
 * טעינת נתונים מ-API עבור Cash Flows View
 * 
 * @description טעינת נתונים מ-API עבור:
 * - קונטיינר 0: סיכום מידע והתראות פעילות
 * - קונטיינר 1: טבלת תזרימי מזומנים
 * - קונטיינר 2: טבלת המרות מטבע (אם נדרש)
 * 
 * @version v1.0 - Uses sharedServices.js (PDSC Client) - Fixed manual transformation
 * 
 * API Integration Guide: TEAM_20_TO_TEAM_30_PHASE_2_API_INTEGRATION_GUIDE.md
 * PDSC Boundary Contract: documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md
 */

// Import PDSC Client (Shared_Services.js)
import sharedServices from '../../../components/core/sharedServices.js';

// Import transformers for additional transformations if needed
import { apiToReact } from '../../../cubes/shared/utils/transformers.js';

// Import masked log utility for security compliance
import { maskedLog } from '../../../utils/maskedLog.js';

/**
 * Validate ULID format
 * ULID format: 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid ULID
 */
function isValidULID(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  // ULID is 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
  const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
  return ulidRegex.test(value);
}

/**
 * Normalize tradingAccountId - only return if valid ULID
 * Gate B Fix: Prevent sending invalid tradingAccountId (e.g., "הכול", account names) to API
 * @param {any} value - Filter value
 * @returns {string|undefined} Valid ULID or undefined
 */
function normalizeTradingAccountId(value) {
  if (!value || typeof value !== 'string') {
    return undefined;
  }
  // If value is "הכול" or empty string, return undefined
  if (value === 'הכול' || value === '' || value === null || value === undefined) {
    return undefined;
  }
  // If value is a valid ULID, return it
  if (isValidULID(value)) {
    return value;
  }
  // Otherwise, return undefined (don't send invalid values)
  return undefined;
}

/**
 * Fetch Cash Flows
 * 
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Query Parameters (camelCase → snake_case automatically):
 * - tradingAccountId (string, optional) - Filter by trading account ULID
 * - dateFrom (date, optional) - Filter by transaction_date >= dateFrom (YYYY-MM-DD)
 * - dateTo (date, optional) - Filter by transaction_date <= dateTo (YYYY-MM-DD)
 * - flowType (string, optional) - Filter by flow_type: "DEPOSIT", "WITHDRAWAL", "DIVIDEND", "INTEREST", "FEE", "CURRENCY_CONVERSION", "OTHER"
 * - search (string, optional) - Search in description and external_reference
 * 
 * Response includes: data array, total, summary (total_deposits, total_withdrawals, net_flow)
 * 
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Response data with data array, total, and summary
 */
async function fetchCashFlows(filters = {}) {
  try {
    // Ensure Shared Services is initialized
    await sharedServices.init();
    
    // Gate B Fix: Normalize tradingAccountId - only send if valid ULID
    // Gate B Fix: Remove dateRange object - it should be split into dateFrom/dateTo before calling API
    // Gate B Fix: Remove empty strings - they cause 400 errors
    const normalizedFilters = { ...filters };
    if (normalizedFilters.tradingAccountId) {
      const normalizedId = normalizeTradingAccountId(normalizedFilters.tradingAccountId);
      if (normalizedId) {
        normalizedFilters.tradingAccountId = normalizedId;
      } else {
        delete normalizedFilters.tradingAccountId;
      }
    }
    delete normalizedFilters.dateRange; // Remove dateRange object - Shared_Services will handle dateFrom/dateTo
    
    // Gate B Fix: Remove empty strings from filters
    Object.keys(normalizedFilters).forEach(key => {
      const value = normalizedFilters[key];
      if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        delete normalizedFilters[key];
      }
    });
    
    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    // Note: filters should be in camelCase (e.g., tradingAccountId, dateFrom, dateTo, flowType)
    // Shared_Services will automatically transform to snake_case for API
    const response = await sharedServices.get('/cash_flows', normalizedFilters);
    
    // Response is already transformed by Shared_Services
    // Parse decimal strings to numbers for summary
    const summary = response.summary ? {
      totalDeposits: parseFloat(response.summary.total_deposits || response.summary.totalDeposits || '0'),
      totalWithdrawals: parseFloat(response.summary.total_withdrawals || response.summary.totalWithdrawals || '0'),
      netFlow: parseFloat(response.summary.net_flow || response.summary.netFlow || '0')
    } : null;
    
    return {
      data: response.data || [],
      total: response.total || 0,
      summary: summary
    };
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Cash Flows Data Loader] Error fetching cash flows:', { 
      errorCode: error.code,
      status: error.status
    });
    
    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Cash Flows Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message
      });
    }
    
    return { 
      data: [], 
      total: 0,
      summary: {
        totalDeposits: 0,
        totalWithdrawals: 0,
        netFlow: 0
      }
    };
  }
}

/**
 * Fetch Currency Conversions
 * 
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Query Parameters (camelCase → snake_case automatically):
 * - tradingAccountId (string, optional) - Filter by trading account ULID
 * - dateFrom (date, optional) - Filter by conversion date >= dateFrom (YYYY-MM-DD)
 * - dateTo (date, optional) - Filter by conversion date <= dateTo (YYYY-MM-DD)
 * 
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Currency conversions data
 */
async function fetchCurrencyConversions(filters = {}) {
  try {
    // Ensure Shared Services is initialized
    await sharedServices.init();
    
    // Gate B Fix: Normalize tradingAccountId - only send if valid ULID
    // Gate B Fix: Remove dateRange object - it should be split into dateFrom/dateTo before calling API
    // Gate B Fix: Remove empty strings - they cause 400 errors
    const normalizedFilters = { ...filters };
    if (normalizedFilters.tradingAccountId) {
      const normalizedId = normalizeTradingAccountId(normalizedFilters.tradingAccountId);
      if (normalizedId) {
        normalizedFilters.tradingAccountId = normalizedId;
      } else {
        delete normalizedFilters.tradingAccountId;
      }
    }
    delete normalizedFilters.dateRange; // Remove dateRange object - Shared_Services will handle dateFrom/dateTo
    
    // Gate B Fix: Remove empty strings from filters
    Object.keys(normalizedFilters).forEach(key => {
      const value = normalizedFilters[key];
      if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        delete normalizedFilters[key];
      }
    });
    
    // Gate B Fix: Handle 404 gracefully - endpoint might not exist yet
    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    // Note: filters should be in camelCase (e.g., tradingAccountId, dateFrom, dateTo)
    // Shared_Services will automatically transform to snake_case for API
    const response = await sharedServices.get('/cash_flows/currency_conversions', normalizedFilters);
    
    // Response is already transformed by Shared_Services
    return {
      data: response.data || [],
      total: response.total || 0
    };
  } catch (error) {
    // Gate B Fix: Handle 404/400 gracefully - endpoint might not exist or return error
    // Don't log as SEVERE if it's a 404 (endpoint not implemented yet)
    if (error.status === 404 || error.code === 'HTTP_404') {
      // Endpoint not implemented yet - return empty data silently
      maskedLog('[Cash Flows Data Loader] Currency conversions endpoint not available (404)');
      return { data: [], total: 0 };
    }
    
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Cash Flows Data Loader] Error fetching currency conversions:', { 
      errorCode: error.code,
      status: error.status
    });
    
    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Cash Flows Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message
      });
    }
    
    return { data: [], total: 0 };
  }
}

/**
 * Fetch Cash Flows Summary
 * 
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Query Parameters: Same as GET /cash_flows (except flow_type and search)
 * Response: Empty data array, total: 0, summary object
 * 
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Summary data
 */
async function fetchCashFlowsSummary(filters = {}) {
  try {
    // Ensure Shared Services is initialized
    await sharedServices.init();
    
    // Gate B Fix: Remove pagination parameters from summary call
    // Summary endpoints don't need pagination (page, page_size)
    // Gate B Fix: Remove dateRange object - it should be split into dateFrom/dateTo before calling API
    // Gate B Fix: Remove empty strings - they cause 400 errors
    const summaryFilters = { ...filters };
    delete summaryFilters.page;
    delete summaryFilters.pageSize;
    delete summaryFilters.dateRange; // Remove dateRange object - Shared_Services will handle dateFrom/dateTo
    
    // Gate B Fix: Remove empty strings from filters
    Object.keys(summaryFilters).forEach(key => {
      const value = summaryFilters[key];
      if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        delete summaryFilters[key];
      }
    });
    
    // Gate B Fix: Normalize tradingAccountId - only send if valid ULID
    if (summaryFilters.tradingAccountId) {
      const normalizedId = normalizeTradingAccountId(summaryFilters.tradingAccountId);
      if (normalizedId) {
        summaryFilters.tradingAccountId = normalizedId;
      } else {
        delete summaryFilters.tradingAccountId;
      }
    }
    
    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    // Note: filters should be in camelCase (e.g., tradingAccountId, dateFrom, dateTo)
    // Shared_Services will automatically transform to snake_case for API
    // Summary endpoints exclude flow_type and search per API Guide (already handled by removing from filters)
    const response = await sharedServices.get('/cash_flows/summary', summaryFilters);
    
    // Parse decimal strings to numbers
    const summary = response.summary ? {
      totalDeposits: parseFloat(response.summary.total_deposits || response.summary.totalDeposits || '0'),
      totalWithdrawals: parseFloat(response.summary.total_withdrawals || response.summary.totalWithdrawals || '0'),
      netFlow: parseFloat(response.summary.net_flow || response.summary.netFlow || '0')
    } : {
      totalDeposits: 0,
      totalWithdrawals: 0,
      netFlow: 0
    };
    
    return summary;
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Cash Flows Data Loader] Error fetching cash flows summary:', { 
      errorCode: error.code,
      status: error.status
    });
    
    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Cash Flows Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message
      });
    }
    
    // Return default summary structure - don't throw to prevent SEVERE errors
    return {
      totalDeposits: 0,
      totalWithdrawals: 0,
      netFlow: 0
    };
  }
}

/**
 * Load all data for Cash Flows View
 * 
 * @description Loads summary and cash flows data in parallel
 * Note: Summary is included in fetchCashFlows response, so we can use it directly
 * 
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Complete data object with summary, cashFlows, and currencyConversions
 */
async function loadCashFlowsData(filters = {}) {
  try {
    // Gate B Fix: Load currency conversions separately to handle 404 gracefully
    // Don't let currency_conversions failure break the entire page load
    let currencyConversionsData = { data: [], total: 0 };
    try {
      currencyConversionsData = await fetchCurrencyConversions(filters);
    } catch (currencyError) {
      // Endpoint might not exist - silently use empty data
      if (currencyError.status !== 404 && currencyError.code !== 'HTTP_404') {
        maskedLog('[Cash Flows Data Loader] Currency conversions error:', { 
          errorCode: currencyError.code,
          status: currencyError.status
        });
      }
    }
    
    // Load cash flows (includes summary) - this is critical, don't fail silently
    const cashFlowsData = await fetchCashFlows(filters);
    
    // Extract summary from cashFlowsData or fetch separately if needed
    let summary = cashFlowsData.summary;
    if (!summary) {
      try {
        summary = await fetchCashFlowsSummary(filters);
      } catch (summaryError) {
        // Summary fetch failed - use default
        maskedLog('[Cash Flows Data Loader] Summary fetch failed:', { 
          errorCode: summaryError.code,
          status: summaryError.status
        });
        summary = {
          totalDeposits: 0,
          totalWithdrawals: 0,
          netFlow: 0
        };
      }
    }
    
    return {
      summary: summary,
      cashFlows: {
        data: cashFlowsData.data || [],
        total: cashFlowsData.total || 0
      },
      currencyConversions: currencyConversionsData
    };
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Cash Flows Data Loader] Error loading cash flows data:', { 
      errorCode: error.code,
      status: error.status
    });
    return {
      summary: {
        totalDeposits: 0,
        totalWithdrawals: 0,
        netFlow: 0
      },
      cashFlows: { data: [], total: 0 },
      currencyConversions: { data: [], total: 0 }
    };
  }
}

// Export functions
export {
  fetchCashFlows,
  fetchCurrencyConversions,
  fetchCashFlowsSummary,
  loadCashFlowsData
};
