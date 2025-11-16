/**
 * Dashboard Data Service
 * ======================================
 * מרכז אחיד לטעינת נתוני הדשבורד (טריידים, התראות, חשבונות, תזרימי מזומנים)
 * כולל תמיכה במטמון הרב-שכבתי ובניקוי משותף לאחר פעולות CRUD.
 */
(function dashboardDataService() {
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

  function normalizeDashboardPayload({ trades = [], alerts = [], accounts = [], cashFlows = [] }) {
    return {
      trades,
      alerts,
      accounts,
      cashFlows,
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

    const payload = normalizeDashboardPayload({ trades, alerts, accounts, cashFlows });
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

