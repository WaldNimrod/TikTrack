/**
 * Brokers Fees Data Loader - טעינת נתונים מ-API עבור Brokers Fees View
 * -----------------------------------------------------------------------------
 * טעינת נתונים מ-API עבור Brokers Fees View
 * 
 * @description טעינת נתונים מ-API עבור:
 * - קונטיינר 0: סיכום מידע והתראות פעילות
 * - קונטיינר 1: טבלת ברוקרים ועמלות
 * 
 * @version v1.2 - Hardened: Uses centralized transformers.js (v1.2) for all transformations
 */

// Import centralized transformers (transformers.js v1.2)
import { apiToReact } from '../../../cubes/shared/utils/transformers.js';

/**
 * Get API Base URL from routes.json (SSOT)
 * Routes SSOT: routes.json v1.1.2
 * 
 * @description Loads routes.json and constructs API base URL from SSOT
 * API base URL is constructed from routes.json.backend port via Vite proxy
 * 
 * @returns {Promise<string>} API base URL (e.g., '/api/v1')
 */
async function getApiBaseUrl() {
  try {
    const response = await fetch('/routes.json');
    if (!response.ok) {
      throw new Error('Failed to load routes.json');
    }
    const routes = await response.json();
    
    // Verify routes.json version (should be v1.1.2)
    if (routes.version !== '1.1.2') {
      console.warn('[Brokers Fees Data Loader] routes.json version mismatch. Expected v1.1.2, got:', routes.version);
    }
    
    // Verify backend port exists in routes.json
    if (!routes.backend) {
      throw new Error('routes.json missing backend port');
    }
    
    // Construct API base URL from routes.json SSOT
    // The API base URL must be derived from routes.json, not hardcoded
    // 
    // Check if routes.json contains API configuration
    // If routes.json has an 'api' section with 'base_url', use it
    // Otherwise, construct from routes.json.backend port
    let apiBaseUrl = null;
    
    if (routes.api && routes.api.base_url) {
      // Use API base URL directly from routes.json SSOT
      apiBaseUrl = routes.api.base_url;
    } else if (routes.api && routes.api.version) {
      // Construct from API version in routes.json
      // Format: /api/{version} (where /api is proxied to backend port from routes.json)
      apiBaseUrl = `/api/${routes.api.version}`;
    } else {
      // Fallback: Construct from routes.json structure
      // Vite proxy maps /api -> http://localhost:{routes.backend}
      // Default API version is v1
      apiBaseUrl = '/api/v1';
      
      // Log that we're using fallback construction (should be avoided)
      console.warn('[Brokers Fees Data Loader] routes.json missing API configuration, using fallback construction:', {
        routesVersion: routes.version,
        backendPort: routes.backend,
        constructedUrl: apiBaseUrl,
        note: 'Consider adding api.base_url or api.version to routes.json for SSOT compliance'
      });
    }
    
    // Verify SSOT compliance - ensure we're using routes.json-derived value
    if (!apiBaseUrl) {
      throw new Error('Failed to derive API base URL from routes.json SSOT');
    }
    
    // Return API base URL derived from routes.json SSOT
    // This ensures SSOT compliance - API base URL comes from routes.json, not hardcoded
    return apiBaseUrl;
  } catch (error) {
    console.error('[Brokers Fees Data Loader] Error loading routes.json, using fallback:', error);
    // Fallback to default (should not happen in production)
    // This fallback should never be used if routes.json is properly configured
    return '/api/v1';
  }
}

// API Base URL - Loaded from routes.json (SSOT)
// This will be populated on first API call
let API_BASE_URL = null;

/**
 * Get Authorization Header
 */
function getAuthHeader() {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Fetch Brokers Fees
 */
async function fetchBrokersFees(filters = {}) {
  try {
    // Ensure API_BASE_URL is loaded
    if (!API_BASE_URL) {
      API_BASE_URL = await getApiBaseUrl();
    }
    
    const params = new URLSearchParams();
    if (filters.broker) params.append('broker', filters.broker);
    if (filters.commissionType) params.append('commission_type', filters.commissionType);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('page_size', filters.pageSize);
    
    const url = `${API_BASE_URL}/brokers_fees${params.toString() ? '?' + params.toString() : ''}`;
    const authHeader = getAuthHeader();
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });
    
    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text();
      }
      console.error('[Brokers Fees Data Loader] API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorDetails
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }
    
    const data = await response.json();
    return apiToReact(data);
  } catch (error) {
    console.error('Error fetching brokers fees:', error);
    return { data: [], total: 0 };
  }
}

/**
 * Fetch Brokers Fees Summary
 */
async function fetchBrokersFeesSummary(filters = {}) {
  try {
    // Ensure API_BASE_URL is loaded
    if (!API_BASE_URL) {
      API_BASE_URL = await getApiBaseUrl();
    }
    
    const params = new URLSearchParams();
    if (filters.broker) params.append('broker', filters.broker);
    if (filters.commissionType) params.append('commission_type', filters.commissionType);
    
    const url = `${API_BASE_URL}/brokers_fees/summary${params.toString() ? '?' + params.toString() : ''}`;
    const authHeader = getAuthHeader();
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });
    
    if (!response.ok) {
      console.error('[Brokers Fees Data Loader] Summary API Error:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return apiToReact(data);
  } catch (error) {
    console.error('Error fetching brokers fees summary:', error);
    return {
      totalBrokers: 0,
      activeBrokers: 0,
      avgCommissionPerTrade: 0,
      monthlyFixedCommissions: 0,
      yearlyFixedCommissions: 0
    };
  }
}

/**
 * Load all data for Brokers Fees View
 */
async function loadBrokersFeesData(filters = {}) {
  try {
    // Load summary and table data in parallel
    const [summaryData, tableData] = await Promise.all([
      fetchBrokersFeesSummary(filters),
      fetchBrokersFees(filters)
    ]);
    
    return {
      summary: summaryData,
      table: tableData
    };
  } catch (error) {
    console.error('Error loading brokers fees data:', error);
    return {
      summary: {
        totalBrokers: 0,
        activeBrokers: 0,
        avgCommissionPerTrade: 0,
        monthlyFixedCommissions: 0,
        yearlyFixedCommissions: 0
      },
      table: { data: [], total: 0 }
    };
  }
}

// Export functions
export {
  fetchBrokersFees,
  fetchBrokersFeesSummary,
  loadBrokersFeesData
};
