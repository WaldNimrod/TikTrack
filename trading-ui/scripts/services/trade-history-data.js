/**
 * Trade History Data Service
 * ======================================
 * Unified loader for trade history data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load trade history with filters via API
 * - Load trade statistics
 * - Load aggregated trade history
 * - Load plan vs execution analysis
 * - Save results inside UnifiedCacheManager with TTL
 * - Provide forced reload + cache invalidation helpers
 * - Surface consistent errors through the global notification + log systems
 * - CacheSyncManager integration for automatic cache invalidation
 *
 * Related Documentation:
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * - documentation/02-ARCHITECTURE/FRONTEND/HISTORICAL_DATA_SERVICES.md
 * - documentation/03-DEVELOPMENT/PLANS/HISTORICAL_PAGES_FULL_IMPLEMENTATION_PLAN.md
 *
 * Function Index:
 * ==============
 * 
 * DATA LOADING (4):
 * - loadTradeHistory(filters, options) - Load trade history with filters
 * - fetchFreshTradeHistory(filters, options) - Force reload trade history (skip cache)
 * - loadStatistics(filters, options) - Load trade statistics
 * - loadAggregated(groupBy, filters, options) - Load aggregated trade history
 * - loadPlanVsExecution(dateRange, options) - Load plan vs execution analysis
 * 
 * CACHE MANAGEMENT (1):
 * - invalidateCache() - Invalidate all trade history cache
 *
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */
(function tradeHistoryDataService() {
  const TRADE_HISTORY_DATA_KEY = 'trade-history-data';
  const TRADE_HISTORY_TTL = 5 * 60 * 1000; // 5 minutes
  const PAGE_LOG_CONTEXT = { page: 'trade-history-data' };

  /**
   * Load trade history data with filters
   * 
   * @param {Object} filters - Filter object
   * @param {number} [filters.account_id] - Account ID filter
   * @param {number} [filters.ticker_id] - Ticker ID filter
   * @param {string} [filters.start_date] - Start date (ISO format)
   * @param {string} [filters.end_date] - End date (ISO format)
   * @param {string} [filters.status] - Status filter ('open', 'closed', 'all')
   * @param {string} [filters.investment_type] - Investment type filter
   * @param {string} [filters.group_by] - Group by ('period', 'ticker', 'account')
   * @param {Object} [options] - Options
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Trade history data
   * 
   * @example
   * const data = await TradeHistoryData.loadTradeHistory({
   *   account_id: 1,
   *   start_date: '2025-01-01',
   *   end_date: '2025-01-31'
   * });
   */
  async function loadTradeHistory(filters = {}, options = {}) {
    try {
      const { force = false } = options || {};
      
      // Build cache key from filters
      const filtersHash = JSON.stringify(filters);
      const cacheKey = `${TRADE_HISTORY_DATA_KEY}:${filtersHash}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: TRADE_HISTORY_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Trade history loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading trade history from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      if (filters.account_id) params.append('account_id', filters.account_id);
      if (filters.ticker_id) params.append('ticker_id', filters.ticker_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.status) params.append('status', filters.status);
      if (filters.investment_type) params.append('investment_type', filters.investment_type);
      if (filters.group_by) params.append('group_by', filters.group_by);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trade-history/?${params.toString()}`;
      
      const response = await fetch(url, { });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: TRADE_HISTORY_TTL });
      }

      window.Logger?.debug?.('✅ Trade history loaded from API', { ...PAGE_LOG_CONTEXT, count: payload?.trades?.length || 0 });
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading trade history', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת היסטוריית טריידים');
      throw error;
    }
  }

  /**
   * Fetch fresh trade history (force reload, skip cache)
   * 
   * @param {Object} filters - Filter object
   * @param {Object} [options] - Options
   * @returns {Promise<Object>} Trade history data
   */
  async function fetchFreshTradeHistory(filters = {}, options = {}) {
    return loadTradeHistory(filters, { ...options, force: true });
  }

  /**
   * Load trade statistics
   * 
   * @param {Object} filters - Filter object
   * @param {Object} [options] - Options
   * @returns {Promise<Object>} Trade statistics
   */
  async function loadStatistics(filters = {}, options = {}) {
    try {
      const { force = false } = options || {};
      
      // Build cache key
      const filtersHash = JSON.stringify(filters);
      const cacheKey = `trade-history-statistics:${filtersHash}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: TRADE_HISTORY_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Trade statistics loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading trade statistics from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      if (filters.account_id) params.append('account_id', filters.account_id);
      if (filters.ticker_id) params.append('ticker_id', filters.ticker_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.status) params.append('status', filters.status);
      if (filters.period) params.append('period', filters.period);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trade-history/statistics?${params.toString()}`;
      
      const response = await fetch(url, { });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: TRADE_HISTORY_TTL });
      }

      window.Logger?.debug?.('✅ Trade statistics loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading trade statistics', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת סטטיסטיקות טריידים');
      throw error;
    }
  }

  /**
   * Load aggregated trade history
   * 
   * @param {string} groupBy - Group by ('period', 'ticker', 'account')
   * @param {Object} filters - Filter object
   * @param {Object} [options] - Options
   * @returns {Promise<Object>} Aggregated trade history
   */
  async function loadAggregated(groupBy, filters = {}, options = {}) {
    try {
      const { force = false } = options || {};
      
      // Build cache key
      const filtersHash = JSON.stringify({ ...filters, group_by: groupBy });
      const cacheKey = `trade-history-aggregated:${filtersHash}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: TRADE_HISTORY_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Aggregated trade history loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading aggregated trade history from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('group_by', groupBy);
      if (filters.account_id) params.append('account_id', filters.account_id);
      if (filters.ticker_id) params.append('ticker_id', filters.ticker_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trade-history/aggregated?${params.toString()}`;
      
      const response = await fetch(url, { });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: TRADE_HISTORY_TTL });
      }

      window.Logger?.debug?.('✅ Aggregated trade history loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading aggregated trade history', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת אגרגציה של היסטוריית טריידים');
      throw error;
    }
  }

  /**
   * Load plan vs execution analysis
   * 
   * @param {Object} dateRange - Date range object
   * @param {string} dateRange.start_date - Start date (ISO format)
   * @param {string} dateRange.end_date - End date (ISO format)
   * @param {Object} [options] - Options
   * @returns {Promise<Object>} Plan vs execution analysis
   */
  async function loadPlanVsExecution(dateRange, options = {}) {
    try {
      const { force = false } = options || {};
      
      // Build cache key
      const cacheKey = `trade-history-plan-vs-execution:${dateRange.start_date}:${dateRange.end_date}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: TRADE_HISTORY_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Plan vs execution analysis loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading plan vs execution analysis from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('start_date', dateRange.start_date);
      params.append('end_date', dateRange.end_date);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trade-history/plan-vs-execution?${params.toString()}`;
      
      const response = await fetch(url, { });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: TRADE_HISTORY_TTL });
      }

      window.Logger?.debug?.('✅ Plan vs execution analysis loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading plan vs execution analysis', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת ניתוח תוכניות vs ביצועים');
      throw error;
    }
  }

  /**
   * Load trade timeline with all linked items and calculations
   * 
   * @param {number} tradeId - Trade ID
   * @param {Object} [options] - Options
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @param {boolean} [options.include_durations=true] - Include duration calculations
   * @returns {Promise<Object>} Timeline data
   */
  async function loadTradeTimeline(tradeId, options = {}) {
    try {
      const { force = false, include_durations = true } = options || {};
      
      // Build cache key
      const cacheKey = `trade-history-timeline-${tradeId}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey);
        if (cached) {
          window.Logger?.debug?.('📦 Trade timeline loaded from cache', { ...PAGE_LOG_CONTEXT, tradeId });
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading trade timeline from API...', { ...PAGE_LOG_CONTEXT, tradeId });
      
      // Build query string
      const params = new URLSearchParams();
      if (include_durations !== undefined) {
        params.append('include_durations', include_durations.toString());
      }
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trade-history/${tradeId}/timeline?${params.toString()}`;
      
      const response = await fetch(url, { });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload);
      }

      window.Logger?.debug?.('✅ Trade timeline loaded from API', { ...PAGE_LOG_CONTEXT, tradeId, items: payload?.timeline?.length || 0 });
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading trade timeline', { ...PAGE_LOG_CONTEXT, tradeId, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת טיימליין טרייד');
      throw error;
    }
  }

  /**
   * Load trade chart data including market prices, position data, and P/L
   * 
   * @param {number} tradeId - Trade ID
   * @param {Object} [options] - Options
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @param {number} [options.days_before=7] - Days before first record
   * @param {number} [options.days_after=7] - Days after last record
   * @returns {Promise<Object>} Chart data
   */
  async function loadTradeChartData(tradeId, options = {}) {
    try {
      const { force = false, days_before = 7, days_after = 7 } = options || {};
      
      // Build cache key
      const cacheKey = `trade-history-chart-data-${tradeId}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey);
        if (cached) {
          window.Logger?.debug?.('📦 Trade chart data loaded from cache', { ...PAGE_LOG_CONTEXT, tradeId });
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading trade chart data from API...', { ...PAGE_LOG_CONTEXT, tradeId });
      
      // Build query string
      const params = new URLSearchParams();
      params.append('days_before', days_before.toString());
      params.append('days_after', days_after.toString());
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trade-history/${tradeId}/chart-data?${params.toString()}`;
      
      const response = await fetch(url, { });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload);
      }

      window.Logger?.debug?.('✅ Trade chart data loaded from API', { ...PAGE_LOG_CONTEXT, tradeId });
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading trade chart data', { ...PAGE_LOG_CONTEXT, tradeId, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת נתוני גרף טרייד');
      throw error;
    }
  }

  /**
   * Load detailed trade statistics
   * 
   * @param {number} tradeId - Trade ID
   * @param {Object} [options] - Options
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Trade statistics
   */
  async function loadTradeStatistics(tradeId, options = {}) {
    try {
      const { force = false } = options || {};
      
      // Build cache key
      const cacheKey = `trade-history-statistics-${tradeId}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey);
        if (cached) {
          window.Logger?.debug?.('📦 Trade statistics loaded from cache', { ...PAGE_LOG_CONTEXT, tradeId });
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading trade statistics from API...', { ...PAGE_LOG_CONTEXT, tradeId });
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trade-history/${tradeId}/statistics`;
      
      const response = await fetch(url, { });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload);
      }

      window.Logger?.debug?.('✅ Trade statistics loaded from API', { ...PAGE_LOG_CONTEXT, tradeId });
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading trade statistics', { ...PAGE_LOG_CONTEXT, tradeId, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת סטטיסטיקות טרייד');
      throw error;
    }
  }

  /**
   * Load complete trade analysis (timeline + chart data + statistics)
   * This is a unified endpoint optimized for the trade-history page
   * 
   * @param {number} tradeId - Trade ID
   * @param {Object} [options] - Options
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @param {number} [options.days_before=7] - Days before first record
   * @param {number} [options.days_after=7] - Days after last record
   * @param {boolean} [options.include_durations=true] - Include duration calculations
   * @returns {Promise<Object>} Complete analysis data
   */
  async function loadTradeFullAnalysis(tradeId, options = {}) {
    try {
      const { force = false, days_before = 7, days_after = 7, include_durations = true } = options || {};
      
      // Build cache key
      const cacheKey = `trade-history-full-analysis-${tradeId}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey);
        if (cached) {
          window.Logger?.debug?.('📦 Trade full analysis loaded from cache', { ...PAGE_LOG_CONTEXT, tradeId });
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading trade full analysis from API...', { ...PAGE_LOG_CONTEXT, tradeId });
      
      // Build query string
      const params = new URLSearchParams();
      params.append('days_before', days_before.toString());
      params.append('days_after', days_after.toString());
      params.append('include_durations', include_durations.toString());
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trade-history/${tradeId}/full-analysis?${params.toString()}`;
      
      const response = await fetch(url, { });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload);
      }

      window.Logger?.debug?.('✅ Trade full analysis loaded from API', { ...PAGE_LOG_CONTEXT, tradeId });
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading trade full analysis', { ...PAGE_LOG_CONTEXT, tradeId, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת ניתוח מלא של טרייד');
      throw error;
    }
  }

  /**
   * Invalidate trade history cache
   * 
   * @returns {Promise<void>}
   */
  async function invalidateCache() {
    try {
      if (typeof window.UnifiedCacheManager?.delete === 'function') {
        // Delete all trade history related cache keys
        const keys = [
          TRADE_HISTORY_DATA_KEY,
          'trade-history-statistics',
          'trade-history-aggregated',
          'trade-history-plan-vs-execution',
          'trade-history-timeline',
          'trade-history-chart-data',
          'trade-history-position-data',
          'trade-history-pl-data',
          'trade-history-full-analysis'
        ];
        
        for (const key of keys) {
          await window.UnifiedCacheManager.delete(key, { pattern: true });
        }
        
        window.Logger?.debug?.('🗑️ Trade history cache invalidated', PAGE_LOG_CONTEXT);
      }
    } catch (error) {
      window.Logger?.error?.('❌ Error invalidating trade history cache', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    }
  }

  // Export service
  window.TradeHistoryData = {
    KEY: TRADE_HISTORY_DATA_KEY,
    TTL: TRADE_HISTORY_TTL,
    loadTradeHistory,
    fetchFreshTradeHistory,
    loadStatistics,
    loadAggregated,
    loadPlanVsExecution,
    loadTradeTimeline,
    loadTradeChartData,
    loadTradeStatistics,
    loadTradeFullAnalysis,
    invalidateCache
  };

  window.Logger?.debug?.('✅ TradeHistoryData service initialized', PAGE_LOG_CONTEXT);
})();


