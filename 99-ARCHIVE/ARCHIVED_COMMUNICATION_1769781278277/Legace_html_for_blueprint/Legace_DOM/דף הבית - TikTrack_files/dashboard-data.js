/**
 * Dashboard Data Service
 * ======================================
 * מרכז אחיד לטעינת נתוני הדשבורד (טריידים, התראות, חשבונות, תזרימי מזומנים)
 * כולל תמיכה במטמון הרב-שכבתי ובניקוי משותף לאחר פעולות CRUD.
 */
(function dashboardDataService() {

// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - fetchJsonList() - Fetchjsonlist

// === Data Functions ===
// - normalizeDashboardPayload() - Normalizedashboardpayload
// - loadDashboardData() - Loaddashboarddata
// - saveDashboardCache() - Savedashboardcache
// - invalidateDashboardData() - Invalidatedashboarddata

  const CACHE_KEY = 'dashboard_data';
  const DEPENDENT_KEYS = ['dashboard-trades', 'dashboard-alerts', 'dashboard-accounts', 'dashboard-cash_flows'];
  const TTL = 60 * 1000; // 60 שניות – נתוני תצוגה בלבד

  const ENDPOINTS = {
    trades: '/api/trades/',
    alerts: '/api/alerts/',
    accounts: '/api/trading_accounts/',
    cashFlows: '/api/cash_flows/'
  };

  async function fetchJsonList(url, label) {
    // #region agent log - H4: API call attempt
    const apiBaseUrl = window.API_BASE_URL || window.API_CONFIG?.baseUrl || '';
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:fetchJsonList:entry',message:'API call attempt',data:{url,label,apiBaseUrl,apiConfigExists:!!window.API_CONFIG,apiBaseUrlExists:!!window.API_BASE_URL,authTokenExists:!!sessionStorage.getItem('authToken'),timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    // #region agent log - H4: API response
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:fetchJsonList:response',message:'API response received',data:{url,label,status:response.status,ok:response.ok,statusText:response.statusText,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    if (!response.ok) {
      throw new Error(`טעינת ${label} נכשלה (${response.status})`);
    }
    const payload = await response.json();
    if (payload?.status && payload.status !== 'success') {
      const message = payload?.error?.message || payload?.message || `טעינת ${label} נכשלה`;
      throw new Error(message);
    }
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload?.data?.records && Array.isArray(payload.data.records)) {
      return payload.data.records;
    }
    return [];
  }

  function normalizeDashboardPayload({ trades = [], alerts = [], accounts = [], cashFlows = [], eodPortfolioSummary = null }) {
    return {
      trades,
      alerts,
      accounts,
      cashFlows,
      eodPortfolioSummary,
      loadedAt: Date.now()
    };
  }

  async function loadDashboardData({ force = false } = {}) {
    // #region agent log - H3/H4: DashboardData load start
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:loadDashboardData:entry',message:'DashboardData.load called',data:{force,ucmExists:!!window.UnifiedCacheManager,ucmInitialized:window.UnifiedCacheManager?.initialized,apiConfigExists:!!window.API_CONFIG,apiBaseUrlExists:!!window.API_BASE_URL,authTokenExists:!!sessionStorage.getItem('authToken'),timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H3_H4'})}).catch(()=>{});
    // #endregion
    if (!force && window.UnifiedCacheManager?.get) {
      const cached = await window.UnifiedCacheManager.get(CACHE_KEY, { ttl: TTL });
      if (cached) {
        // #region agent log - H3: Cache hit
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:loadDashboardData:cache_hit',message:'DashboardData cache hit',data:{cached:!!cached,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        return cached;
      }
    }

    const [trades, alerts, accounts, cashFlows] = await Promise.all([
      fetchJsonList(ENDPOINTS.trades, 'טריידים'),
      fetchJsonList(ENDPOINTS.alerts, 'התראות'),
      fetchJsonList(ENDPOINTS.accounts, 'חשבונות מסחר'),
      fetchJsonList(ENDPOINTS.cashFlows, 'תזרימי מזומנים').catch(() => [])
    ]);

    // Try to load EOD portfolio metrics for today's summary
    let eodPortfolioSummary = null;
    if (window.EODIntegrationHelper && window.EODIntegrationHelper.isEODAvailable()) {
      try {
        const userId = window.g?.user_id || window.TikTrackAuth?.currentUser?.id;
        if (userId) {
          const today = new Date().toISOString().split('T')[0];

                        const eodResult = await window.EODIntegrationHelper.loadEODPortfolioMetrics(
                            userId,
                            {
                                date_from: today,
                                date_to: today
                            }
                        );

          if (eodResult && eodResult.data && Array.isArray(eodResult.data) && eodResult.data.length > 0) {
            // Take the latest record (should be only one for today)
            eodPortfolioSummary = eodResult.data[eodResult.data.length - 1];

            if (window.Logger) {
              window.Logger.info('✅ EOD portfolio summary loaded for dashboard', {
                userId,
                date: today,
                navTotal: eodPortfolioSummary.nav_total,
                source: eodResult.source
              });
            }
          }
        }
      } catch (eodError) {
        if (window.Logger) {
          window.Logger.warn('⚠️ EOD portfolio summary failed for dashboard, proceeding without', {
            error: eodError.message
          });
        }
      }
    }

    const payload = normalizeDashboardPayload({ trades, alerts, accounts, cashFlows, eodPortfolioSummary });
    // #region agent log - H3: DashboardData load complete
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:loadDashboardData:exit',message:'DashboardData loaded successfully',data:{tradesCount:trades.length,alertsCount:alerts.length,accountsCount:accounts.length,cashFlowsCount:cashFlows.length,ucmInitialized:window.UnifiedCacheManager?.initialized,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    await saveDashboardCache(payload);
    return payload;
  }

  async function saveDashboardCache(data) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    await window.UnifiedCacheManager.save(CACHE_KEY, data, { ttl: TTL });
    await Promise.all(
      DEPENDENT_KEYS.map((key) =>
        window.UnifiedCacheManager.save(key, data, { ttl: TTL }).catch(() => {})
      )
    );
  }

  async function invalidateDashboardData() {
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        // Dashboard depends on multiple entities, invalidate by common actions
        await window.CacheSyncManager.invalidateByAction('dashboard-updated');
        return;
      } catch (error) {
        window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed, falling back', {
          page: 'dashboard_data',
          error: error?.message,
        });
      }
    }
    
    // Fallback to direct invalidation
    if (!window.UnifiedCacheManager?.invalidate) {
      return;
    }
    await window.UnifiedCacheManager.invalidate(CACHE_KEY);
    await Promise.all(
      DEPENDENT_KEYS.map((key) => window.UnifiedCacheManager.invalidate(key).catch(() => {}))
    );
  }

  /**
   * Get summary stats from cached dashboard data
   * @returns {Promise<Object>} Summary stats with trades, alerts, accounts, cashFlows, currencySymbol
   */
  async function getSummaryStats() {
    // #region agent log - H5: getSummaryStats called
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getSummaryStats:entry',message:'H5: getSummaryStats called',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    const data = await loadDashboardData({ force: false });
    
    // #region agent log - H5: getSummaryStats data loaded
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getSummaryStats:dataLoaded',message:'H5: getSummaryStats data loaded',data:{timestamp:Date.now(),tradesCount:data.trades?.length||0,alertsCount:data.alerts?.length||0,accountsCount:data.accounts?.length||0,cashFlowsCount:data.cashFlows?.length||0},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    // Determine currency symbol from accounts or default to USD
    const currencySymbol = data.accounts?.length > 0 && data.accounts[0]?.currency_symbol
      ? data.accounts[0].currency_symbol
      : '$';
    
    const result = {
      trades: data.trades || [],
      alerts: data.alerts || [],
      accounts: data.accounts || [],
      cashFlows: data.cashFlows || [],
      currencySymbol: currencySymbol
    };
    
    // #region agent log - H5: getSummaryStats returning
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getSummaryStats:returning',message:'H5: getSummaryStats returning',data:{timestamp:Date.now(),tradesCount:result.trades.length,alertsCount:result.alerts.length,accountsCount:result.accounts.length,currencySymbol:result.currencySymbol},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    return result;
  }

  /**
   * Get recent trades
   * @param {Object} options - Options
   * @param {number} [options.limit=5] - Limit number of trades
   * @returns {Promise<Array>} Recent trades
   */
  async function getRecentTrades({ limit = 5 } = {}) {
    // #region agent log - H4: getRecentTrades called
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getRecentTrades:entry',message:'H4: getRecentTrades called',data:{timestamp:Date.now(),limit:limit},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    const data = await loadDashboardData({ force: false });
    const trades = data.trades || [];
    
    // #region agent log - H4: getRecentTrades data loaded
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getRecentTrades:dataLoaded',message:'H4: getRecentTrades data loaded',data:{timestamp:Date.now(),totalTrades:trades.length,limit:limit},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    // Sort by created_at or updated_at descending and limit
    const result = trades
      .sort((a, b) => {
        const aDate = a.updated_at || a.created_at || 0;
        const bDate = b.updated_at || b.created_at || 0;
        return bDate - aDate;
      })
      .slice(0, limit);
    
    // #region agent log - H4: getRecentTrades returning
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getRecentTrades:returning',message:'H4: getRecentTrades returning',data:{timestamp:Date.now(),resultCount:result.length},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    return result;
  }

  /**
   * Get recent trade plans
   * @param {Object} options - Options
   * @param {number} [options.limit=5] - Limit number of trade plans
   * @returns {Promise<Array>} Recent trade plans
   */
  async function getRecentTradePlans({ limit = 5 } = {}) {
    // #region agent log - H4: getRecentTradePlans called
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getRecentTradePlans:entry',message:'H4: getRecentTradePlans called',data:{timestamp:Date.now(),limit:limit},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    // Trade plans are not in dashboard data, need to fetch separately
    try {
      const response = await fetch('/api/trade_plans/?limit=' + limit, {
        headers: { Accept: 'application/json' }
      });
      
      // #region agent log - H4: getRecentTradePlans response
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getRecentTradePlans:response',message:'H4: getRecentTradePlans response',data:{timestamp:Date.now(),status:response.status,ok:response.ok},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      
      if (!response.ok) {
        return [];
      }
      const payload = await response.json();
      if (payload?.status === 'success' && Array.isArray(payload.data)) {
        const result = payload.data
          .sort((a, b) => {
            const aDate = a.updated_at || a.created_at || 0;
            const bDate = b.updated_at || b.created_at || 0;
            return bDate - aDate;
          })
          .slice(0, limit);
        
        // #region agent log - H4: getRecentTradePlans returning
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getRecentTradePlans:returning',message:'H4: getRecentTradePlans returning',data:{timestamp:Date.now(),resultCount:result.length},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        
        return result;
      }
      return [];
    } catch (error) {
      // #region agent log - H4: getRecentTradePlans error
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/services/dashboard_data.js:getRecentTradePlans:error',message:'H4: getRecentTradePlans error',data:{timestamp:Date.now(),error:error?.message},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      window.Logger?.warn?.('Error loading recent trade plans', { error: error?.message });
      return [];
    }
  }

  window.DashboardData = {
    load: loadDashboardData,
    save: saveDashboardCache,
    invalidate: invalidateDashboardData,
    getSummaryStats: getSummaryStats,
    getRecentTrades: getRecentTrades,
    getRecentTradePlans: getRecentTradePlans
  };
})();

