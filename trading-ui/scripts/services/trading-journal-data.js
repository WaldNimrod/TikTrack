/**
 * Trading Journal Data Service
 * ======================================
 * Unified loader for trading journal data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load journal entries (notes, trades, executions) for date range
 * - Load journal statistics
 * - Load calendar data for specific month
 * - Load entries by entity type and ID
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
 * - loadEntries(dateRange, filters, options) - Load journal entries for date range
 * - loadStatistics(dateRange, options) - Load journal statistics
 * - loadCalendarData(month, year, options) - Load calendar data for specific month
 * - loadByEntity(entityType, entityId, options) - Load entries by entity type and ID
 * 
 * CACHE MANAGEMENT (1):
 * - invalidateCache() - Invalidate all trading journal cache
 *
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */
(function tradingJournalDataService() {
  const TRADING_JOURNAL_DATA_KEY = 'trading-journal-data';
  const TRADING_JOURNAL_TTL = 3 * 60 * 1000; // 3 minutes
  const PAGE_LOG_CONTEXT = { page: 'trading-journal-data' };

  /**
   * Load journal entries for a date range
   * 
   * @param {Object} dateRange - Date range object
   * @param {string} dateRange.start_date - Start date (ISO format)
   * @param {string} dateRange.end_date - End date (ISO format)
   * @param {Object} [filters] - Filter object
   * @param {string} [filters.entity_type] - Entity type ('trade', 'execution', 'note', 'all')
   * @param {number} [filters.entity_id] - Entity ID
   * @param {Object} [options] - Options
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Journal entries data
   * 
   * @example
   * const entries = await TradingJournalData.loadEntries({
   *   start_date: '2025-01-01',
   *   end_date: '2025-01-31'
   * }, { entity_type: 'all' });
   */
  async function loadEntries(dateRange, filters = {}, options = {}) {
    try {
      const { force = false } = options || {};
      
      // Build cache key
      const filtersHash = JSON.stringify({ ...filters, ...dateRange });
      const cacheKey = `${TRADING_JOURNAL_DATA_KEY}:entries:${filtersHash}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: TRADING_JOURNAL_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Journal entries loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading journal entries from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('start_date', dateRange.start_date);
      params.append('end_date', dateRange.end_date);
      if (filters.entity_type) params.append('entity_type', filters.entity_type);
      if (filters.entity_id) params.append('entity_id', filters.entity_id);
      if (filters.ticker_symbol) params.append('ticker_symbol', filters.ticker_symbol);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trading-journal/entries?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include' // Include cookies for session-based auth
      });
      
      // Handle 401/308 authentication errors
      if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: TRADING_JOURNAL_TTL });
      }

      window.Logger?.debug?.('✅ Journal entries loaded from API', { ...PAGE_LOG_CONTEXT, count: payload?.entries?.length || 0 });
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading journal entries', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת רשומות יומן');
      throw error;
    }
  }

  /**
   * Load journal statistics
   * 
   * @param {Object} dateRange - Date range object
   * @param {Object} [options] - Options
   * @param {string} [options.entity_type] - Entity type filter
   * @param {string} [options.period] - Period filter
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Journal statistics
   * 
   * @example
   * const stats = await TradingJournalData.loadStatistics({
   *   start_date: '2025-01-01',
   *   end_date: '2025-01-31'
   * });
   */
  async function loadStatistics(dateRange, options = {}) {
    try {
      const { entity_type, period, force = false } = options || {};
      
      // Build cache key
      const cacheKey = `trading-journal-statistics:${dateRange.start_date}:${dateRange.end_date}:${entity_type || 'all'}:${period || 'all'}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: TRADING_JOURNAL_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Journal statistics loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading journal statistics from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('start_date', dateRange.start_date);
      params.append('end_date', dateRange.end_date);
      if (entity_type) params.append('entity_type', entity_type);
      if (period) params.append('period', period);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trading-journal/statistics?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include' // Include cookies for session-based auth
      });
      
      // Handle 401/308 authentication errors
      if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: TRADING_JOURNAL_TTL });
      }

      window.Logger?.debug?.('✅ Journal statistics loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading journal statistics', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת סטטיסטיקות יומן');
      throw error;
    }
  }

  /**
   * Load calendar data for a specific month
   * 
   * @param {number} month - Month (1-12)
   * @param {number} year - Year (e.g., 2025)
   * @param {Object} [options] - Options
   * @param {string} [options.entity_type] - Entity type filter
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Calendar data
   * 
   * @example
   * const calendar = await TradingJournalData.loadCalendarData(1, 2025);
   */
  async function loadCalendarData(month, year, options = {}) {
    try {
      const { entity_type, force = false } = options || {};
      
      // Build cache key
      const cacheKey = `trading-journal-calendar:${year}:${month}:${entity_type || 'all'}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: TRADING_JOURNAL_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Calendar data loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading calendar data from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('month', month);
      params.append('year', year);
      if (entity_type) params.append('entity_type', entity_type);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trading-journal/calendar?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include' // Include cookies for session-based auth
      });
      
      // Handle 401/308 authentication errors
      if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: TRADING_JOURNAL_TTL });
      }

      window.Logger?.debug?.('✅ Calendar data loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading calendar data', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת נתוני לוח שנה');
      throw error;
    }
  }

  /**
   * Load entries by entity type and ID
   * 
   * @param {string} entityType - Entity type ('trade', 'execution', 'note')
   * @param {number} entityId - Entity ID
   * @param {Object} [options] - Options
   * @param {string} [options.start_date] - Start date filter (ISO format)
   * @param {string} [options.end_date] - End date filter (ISO format)
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Journal entries for the entity
   * 
   * @example
   * const entries = await TradingJournalData.loadByEntity('trade', 123);
   */
  async function loadByEntity(entityType, entityId, options = {}) {
    try {
      const { start_date, end_date, force = false } = options || {};
      
      // Build cache key
      const cacheKey = `trading-journal-by-entity:${entityType}:${entityId}:${start_date || 'all'}:${end_date || 'all'}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: TRADING_JOURNAL_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Journal entries by entity loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading journal entries by entity from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('entity_type', entityType);
      params.append('entity_id', entityId);
      if (start_date) params.append('start_date', start_date);
      if (end_date) params.append('end_date', end_date);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/trading-journal/by-entity?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include' // Include cookies for session-based auth
      });
      
      // Handle 401/308 authentication errors
      if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: TRADING_JOURNAL_TTL });
      }

      window.Logger?.debug?.('✅ Journal entries by entity loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading journal entries by entity', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת רשומות יומן לפי ישות');
      throw error;
    }
  }

  /**
   * Invalidate trading journal cache
   * 
   * @returns {Promise<void>}
   */
  async function invalidateCache() {
    try {
      if (typeof window.UnifiedCacheManager?.delete === 'function') {
        // Delete all trading journal related cache keys
        const keys = [
          TRADING_JOURNAL_DATA_KEY,
          'trading-journal-statistics',
          'trading-journal-calendar',
          'trading-journal-by-entity'
        ];
        
        for (const key of keys) {
          await window.UnifiedCacheManager.delete(key, { pattern: true });
        }
        
        window.Logger?.debug?.('🗑️ Trading journal cache invalidated', PAGE_LOG_CONTEXT);
      }
    } catch (error) {
      window.Logger?.error?.('❌ Error invalidating trading journal cache', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    }
  }

  // Export service
  window.TradingJournalData = {
    KEY: TRADING_JOURNAL_DATA_KEY,
    TTL: TRADING_JOURNAL_TTL,
    loadEntries,
    loadStatistics,
    loadCalendarData,
    loadByEntity,
    invalidateCache
  };

  window.Logger?.debug?.('✅ TradingJournalData service initialized', PAGE_LOG_CONTEXT);
})();


