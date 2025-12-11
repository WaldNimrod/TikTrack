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

  const CACHE_KEY = 'dashboard-data';
  const DEPENDENT_KEYS = ['dashboard-trades', 'dashboard-alerts', 'dashboard-accounts', 'dashboard-cash-flows'];
  const TTL = 60 * 1000; // 60 שניות – נתוני תצוגה בלבד

  const ENDPOINTS = {
    trades: '/api/trades/',
    alerts: '/api/alerts/',
    accounts: '/api/trading-accounts/',
    cashFlows: '/api/cash-flows/'
  };

  async function fetchJsonList(url, label) {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
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
    if (!force && window.UnifiedCacheManager?.get) {
      const cached = await window.UnifiedCacheManager.get(CACHE_KEY, { ttl: TTL });
      if (cached) {
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
          page: 'dashboard-data',
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

  window.DashboardData = {
    load: loadDashboardData,
    save: saveDashboardCache,
    invalidate: invalidateDashboardData
  };
})();

