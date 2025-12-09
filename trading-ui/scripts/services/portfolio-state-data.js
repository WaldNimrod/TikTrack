/**
 * Portfolio State Data Service
 * ======================================
 * Unified loader for portfolio state data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load portfolio snapshot at specific date
 * - Load portfolio series for charts
 * - Load portfolio performance over date range
 * - Load portfolio comparison between dates
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
 * - loadSnapshot(accountId, date, options) - Load portfolio snapshot at specific date
 * - loadSeries(accountId, startDate, endDate, options) - Load portfolio series for charts
 * - loadPerformance(accountId, dateRange, options) - Load portfolio performance over date range
 * - loadComparison(accountId, date1, date2, options) - Load portfolio comparison between dates
 * 
 * CACHE MANAGEMENT (1):
 * - invalidateCache() - Invalidate all portfolio state cache
 *
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */
(function portfolioStateDataService() {
  const PORTFOLIO_STATE_DATA_KEY = 'portfolio-state-data';
  const PORTFOLIO_STATE_TTL = 10 * 60 * 1000; // 10 minutes
  const PAGE_LOG_CONTEXT = { page: 'portfolio-state-data' };

  /**
   * Load portfolio snapshot at a specific date
   * 
   * @param {number} [accountId] - Account ID (optional, null for all accounts)
   * @param {string} date - Target date (ISO format)
   * @param {Object} [options] - Options
   * @param {boolean} [options.include_closed=false] - Include closed positions
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Portfolio state data
   * 
   * @example
   * const state = await PortfolioStateData.loadSnapshot(1, '2025-01-15');
   */
  async function loadSnapshot(accountId, date, options = {}) {
    try {
      const { include_closed = false, force = false } = options || {};
      
      // Build cache key
      const cacheKey = `portfolio-state-snapshot:${accountId || 'all'}:${date}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: PORTFOLIO_STATE_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Portfolio snapshot loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading portfolio snapshot from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('date', date);
      if (accountId) params.append('account_id', accountId);
      if (include_closed) params.append('include_closed', 'true');
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/portfolio-state/snapshot?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include' // Include cookies for session-based auth
      });
      
      // Handle authentication errors (401/308) - show notification only once
      if (response.status === 401 || response.status === 308) {
        // Use centralized auth error handler if available
        if (typeof window.handleAuthenticationError === 'function') {
          window.handleAuthenticationError(url);
        } else {
          // Fallback: show single notification
          if (!window._authErrorShown) {
            window._authErrorShown = true;
            window.NotificationSystem?.showError?.(
              'נדרשת התחברות',
              'עליך להתחבר למערכת כדי לצפות בנתונים. אנא התחבר כדי להמשיך.'
            );
          }
        }
        throw new Error(`Authentication required (${response.status})`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: PORTFOLIO_STATE_TTL });
      }

      window.Logger?.debug?.('✅ Portfolio snapshot loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      // Don't show error notification for auth errors (already handled above)
      if (error?.message?.includes('Authentication required')) {
        window.Logger?.warn?.('⚠️ Authentication required for portfolio snapshot', { ...PAGE_LOG_CONTEXT });
      } else {
        window.Logger?.error?.('❌ Error loading portfolio snapshot', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת מצב תיק');
      }
      throw error;
    }
  }

  /**
   * Load portfolio series for charts
   * 
   * @param {number} [accountId] - Account ID (optional)
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {Object} [options] - Options
   * @param {string} [options.interval='day'] - Interval ('day', 'week', 'month')
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Portfolio state series
   * 
   * @example
   * const series = await PortfolioStateData.loadSeries(1, '2025-01-01', '2025-01-31', { interval: 'day' });
   */
  async function loadSeries(accountId, startDate, endDate, options = {}) {
    try {
      const { interval = 'day', force = false } = options || {};
      
      // Build cache key
      const cacheKey = `portfolio-state-series:${accountId || 'all'}:${startDate}:${endDate}:${interval}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: PORTFOLIO_STATE_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Portfolio series loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading portfolio series from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      params.append('end_date', endDate);
      params.append('interval', interval);
      if (accountId) params.append('account_id', accountId);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/portfolio-state/series?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include' // Include cookies for session-based auth
      });
      
      // Handle authentication errors (401/308) - show notification only once
      if (response.status === 401 || response.status === 308) {
        // Use centralized auth error handler if available
        if (typeof window.handleAuthenticationError === 'function') {
          window.handleAuthenticationError(url);
        } else {
          // Fallback: show single notification
          if (!window._authErrorShown) {
            window._authErrorShown = true;
            window.NotificationSystem?.showError?.(
              'נדרשת התחברות',
              'עליך להתחבר למערכת כדי לצפות בנתונים. אנא התחבר כדי להמשיך.'
            );
          }
        }
        throw new Error(`Authentication required (${response.status})`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: PORTFOLIO_STATE_TTL });
      }

      window.Logger?.debug?.('✅ Portfolio series loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      // Don't show error notification for auth errors (already handled above)
      if (error?.message?.includes('Authentication required')) {
        window.Logger?.warn?.('⚠️ Authentication required for portfolio series', { ...PAGE_LOG_CONTEXT });
      } else {
        window.Logger?.error?.('❌ Error loading portfolio series', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת סדרת מצב תיק');
      }
      throw error;
    }
  }

  /**
   * Load portfolio performance over date range
   * 
   * @param {number} [accountId] - Account ID (optional)
   * @param {Object} dateRange - Date range object
   * @param {string} dateRange.start_date - Start date (ISO format)
   * @param {string} dateRange.end_date - End date (ISO format)
   * @param {Object} [options] - Options
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Portfolio performance data
   * 
   * @example
   * const performance = await PortfolioStateData.loadPerformance(1, {
   *   start_date: '2025-01-01',
   *   end_date: '2025-01-31'
   * });
   */
  async function loadPerformance(accountId, dateRange, options = {}) {
    try {
      const { force = false } = options || {};
      
      // Build cache key
      const cacheKey = `portfolio-state-performance:${accountId || 'all'}:${dateRange.start_date}:${dateRange.end_date}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: PORTFOLIO_STATE_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Portfolio performance loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading portfolio performance from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('start_date', dateRange.start_date);
      params.append('end_date', dateRange.end_date);
      if (accountId) params.append('account_id', accountId);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/portfolio-state/performance?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include' // Include cookies for session-based auth
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: PORTFOLIO_STATE_TTL });
      }

      window.Logger?.debug?.('✅ Portfolio performance loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading portfolio performance', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת ביצועי תיק');
      throw error;
    }
  }

  /**
   * Load portfolio comparison between two dates
   * 
   * @param {number} [accountId] - Account ID (optional)
   * @param {string} date1 - First date (ISO format)
   * @param {string} date2 - Second date (ISO format)
   * @param {Object} [options] - Options
   * @param {boolean} [options.force=false] - Force fresh data (skip cache)
   * @returns {Promise<Object>} Portfolio comparison data
   * 
   * @example
   * const comparison = await PortfolioStateData.loadComparison(1, '2025-01-01', '2025-01-31');
   */
  async function loadComparison(accountId, date1, date2, options = {}) {
    try {
      const { force = false } = options || {};
      
      // Build cache key
      const cacheKey = `portfolio-state-comparison:${accountId || 'all'}:${date1}:${date2}`;
      
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: PORTFOLIO_STATE_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Portfolio comparison loaded from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading portfolio comparison from API...', PAGE_LOG_CONTEXT);
      
      // Build query string
      const params = new URLSearchParams();
      params.append('date1', date1);
      params.append('date2', date2);
      if (accountId) params.append('account_id', accountId);
      
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const url = `${base}/api/portfolio-state/comparison?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include' // Include cookies for session-based auth
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data || data;

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(cacheKey, payload, { ttl: PORTFOLIO_STATE_TTL });
      }

      window.Logger?.debug?.('✅ Portfolio comparison loaded from API', PAGE_LOG_CONTEXT);
      return payload;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading portfolio comparison', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.NotificationSystem?.showError?.('שגיאה', 'שגיאה בטעינת השוואת מצב תיק');
      throw error;
    }
  }

  /**
   * Invalidate portfolio state cache
   * 
   * @returns {Promise<void>}
   */
  async function invalidateCache() {
    try {
      if (typeof window.UnifiedCacheManager?.delete === 'function') {
        // Delete all portfolio state related cache keys
        const keys = [
          PORTFOLIO_STATE_DATA_KEY,
          'portfolio-state-snapshot',
          'portfolio-state-series',
          'portfolio-state-performance',
          'portfolio-state-comparison'
        ];
        
        for (const key of keys) {
          await window.UnifiedCacheManager.delete(key, { pattern: true });
        }
        
        window.Logger?.debug?.('🗑️ Portfolio state cache invalidated', PAGE_LOG_CONTEXT);
      }
    } catch (error) {
      window.Logger?.error?.('❌ Error invalidating portfolio state cache', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    }
  }

  // Export service
  window.PortfolioStateData = {
    KEY: PORTFOLIO_STATE_DATA_KEY,
    TTL: PORTFOLIO_STATE_TTL,
    loadSnapshot,
    loadSeries,
    loadPerformance,
    loadComparison,
    invalidateCache
  };

  window.Logger?.debug?.('✅ PortfolioStateData service initialized', PAGE_LOG_CONTEXT);
})();




