/**
 * Brokers Fees Data Loader - טעינת נתונים מ-API עבור Brokers Fees View
 * -----------------------------------------------------------------------------
 * טעינת נתונים מ-API עבור Brokers Fees View
 *
 * @description טעינת נתונים מ-API עבור:
 * - קונטיינר 0: סיכום מידע והתראות פעילות
 * - קונטיינר 1: טבלת ברוקרים ועמלות
 *
 * @version v1.0 - Uses sharedServices.js (PDSC Client) for all API calls
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
 * Fetch Brokers Fees — ADR-015: fees per trading account
 *
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Query Parameters (camelCase → snake_case automatically):
 * - tradingAccountId (string, optional) - Filter by trading account ULID (primary)
 * - broker (string, optional) - Filter by broker name (via account)
 * - commissionType (string, optional) - Filter by commission type: "TIERED" or "FLAT"
 * - search (string, optional) - Search in account name, broker, commission
 *
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Response data with data array and total
 */
async function fetchBrokersFees(filters = {}) {
  try {
    // Ensure Shared Services is initialized
    await sharedServices.init();

    // Gate B Fix: Remove dateRange object - it should be split into dateFrom/dateTo before calling API
    // Gate B Fix: Remove empty strings - they cause 400 errors
    const normalizedFilters = { ...filters };
    delete normalizedFilters.dateRange; // Remove dateRange object - Shared_Services will handle dateFrom/dateTo

    // Gate B Fix: Remove empty/null strings from filters
    Object.keys(normalizedFilters).forEach((key) => {
      const value = normalizedFilters[key];
      if (
        value == null ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        delete normalizedFilters[key];
      }
    });

    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    const response = await sharedServices.get(
      '/brokers_fees',
      normalizedFilters,
    );

    // Response is already transformed by Shared_Services
    // data.data contains the array, data.total contains total count
    return {
      data: response.data || [],
      total: response.total || 0,
    };
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Brokers Fees Data Loader] Error fetching brokers fees:', {
      errorCode: error.code,
      status: error.status,
    });

    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Brokers Fees Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message,
      });
    }

    return { data: [], total: 0 };
  }
}

/**
 * Fetch Brokers Fees Summary — ADR-015: per trading account
 *
 * @description Uses Shared_Services.js (PDSC Client) for API calls
 * Query Parameters (camelCase → snake_case automatically):
 * - tradingAccountId (string, optional) - Filter by trading account ULID (primary)
 * - broker (string, optional) - Filter by broker name (via account)
 * - commissionType (string, optional) - Filter by commission type: "TIERED" or "FLAT"
 * - search (string, optional) - Search in account name, broker, commission
 *
 * @param {Object} filters - Filter parameters (camelCase)
 * @returns {Promise<Object>} Summary data from Backend
 */
async function fetchBrokersFeesSummary(filters = {}) {
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

    // Gate B Fix: Remove empty/null strings from filters
    Object.keys(summaryFilters).forEach((key) => {
      const value = summaryFilters[key];
      if (
        value == null ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        delete summaryFilters[key];
      }
    });

    // Use Shared_Services.get() - automatically handles:
    // - routes.json SSOT
    // - Transformers (camelCase → snake_case for query params)
    // - Error handling (PDSC Error Schema)
    // - Response transformation (snake_case → camelCase)
    const response = await sharedServices.get(
      '/brokers_fees/summary',
      summaryFilters,
    );

    // Response is already transformed by Shared_Services
    const summary = response.summary || response;

    // Use masked log for security compliance (prevents token leakage)
    maskedLog('[Brokers Fees Data Loader] Summary fetched from Backend', {
      summary,
    });

    return summary;
  } catch (error) {
    // Gate B Fix: Handle 400 gracefully - don't log as SEVERE
    // Use masked log for security compliance (prevents token leakage)
    maskedLog(
      '[Brokers Fees Data Loader] Error fetching brokers fees summary:',
      {
        errorCode: error.code,
        status: error.status,
      },
    );

    // Handle PDSC Error Schema
    if (error.code) {
      maskedLog('[Brokers Fees Data Loader] PDSC Error:', {
        code: error.code,
        message: error.message_i18n || error.message,
      });
    }

    // Return default summary structure - don't throw to prevent SEVERE errors
    return {
      totalBrokers: 0,
      activeBrokers: 0,
      avgCommissionPerTrade: 0,
      monthlyFixedCommissions: 0,
      yearlyFixedCommissions: 0,
    };
  }
}

/**
 * Fetch Reference Brokers — GET /reference/brokers (ADR-013)
 * Used for brokers list in top container
 */
async function fetchReferenceBrokers() {
  try {
    await sharedServices.init();
    const response = await sharedServices.get('/reference/brokers', {});
    const items = response?.data ?? response ?? [];
    return Array.isArray(items) ? items : [];
  } catch (error) {
    maskedLog('[Brokers Fees] Error fetching reference brokers:', {
      errorCode: error?.code,
      status: error?.status,
    });
    return [];
  }
}

/**
 * Load all data for Brokers Fees View
 */
async function loadBrokersFeesData(filters = {}) {
  try {
    // Load summary, table, and reference brokers in parallel
    const [summaryData, tableData, brokersList] = await Promise.all([
      fetchBrokersFeesSummary(filters),
      fetchBrokersFees(filters),
      fetchReferenceBrokers(),
    ]);

    return {
      summary: summaryData,
      table: tableData,
      brokersList,
    };
  } catch (error) {
    // Gate B Fix: Handle errors gracefully - don't log full error object
    // Use masked log for security compliance (prevents token leakage)
    maskedLog('Error loading brokers fees data:', {
      errorCode: error.code,
      status: error.status,
    });
    return {
      summary: {
        totalBrokers: 0,
        activeBrokers: 0,
        avgCommissionPerTrade: 0,
        monthlyFixedCommissions: 0,
        yearlyFixedCommissions: 0,
      },
      table: { data: [], total: 0 },
      brokersList: [],
    };
  }
}

// Export functions
export {
  fetchBrokersFees,
  fetchBrokersFeesSummary,
  fetchReferenceBrokers,
  loadBrokersFeesData,
};
