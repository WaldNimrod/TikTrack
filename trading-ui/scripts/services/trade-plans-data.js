/**
 * Trade Plans Data Service
 * ======================================
 * Unified loader for trade plans data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load trade plans list via API (with cache bust for local file protocol)
 * - Save results inside UnifiedCacheManager with a 45s TTL
 * - Provide forced reload + cache invalidation helpers
 * - Surface consistent errors through the global notification + log systems
 * - CRUD operations (create, update, delete, fetchDetails)
 * - CacheSyncManager integration for automatic cache invalidation
 *
 * Related Documentation:
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
 *
 * @version 2.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */
(function tradePlansDataService() {
  const TRADE_PLANS_DATA_KEY = 'trade-plans-data';
  const TRADE_PLANS_TTL = 45 * 1000; // 45 seconds per audit plan
  const PAGE_LOG_CONTEXT = { page: 'trade-plans-data' };

  const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  async function loadTradePlansData(options = {}) {
    const { force = false, ttl = TRADE_PLANS_TTL, signal } = options;
    const loader = async () => {
      window.Logger?.debug?.('🔄 Loading trade plans data directly from API...', PAGE_LOG_CONTEXT);
      const response = await fetch('/api/trade-plans/', { signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const payload = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(TRADE_PLANS_DATA_KEY, payload, { ttl });
      }

      window.Logger?.debug?.('✅ Trade plans loaded from API', { ...PAGE_LOG_CONTEXT, count: payload.length });
      return payload;
    };

    try {
      if (force) {
        await clearTradePlansCache(true);
        return await loader();
      }

      if (window.CacheTTLGuard?.ensure) {
        const cached = await window.CacheTTLGuard.ensure(TRADE_PLANS_DATA_KEY, loader, {
          ttl,
          afterRead: (data) => {
            if (Array.isArray(data)) {
              window.Logger?.debug?.('Trade plans served from cache', { ...PAGE_LOG_CONTEXT, count: data.length });
            }
          },
          afterLoad: (data) => {
            window.Logger?.debug?.('Trade plans loaded from API', {
              ...PAGE_LOG_CONTEXT,
              count: Array.isArray(data) ? data.length : 0,
            });
          },
        });
        return Array.isArray(cached) ? cached : cached || [];
      }

      if (typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(TRADE_PLANS_DATA_KEY, { ttl });
        if (cached) {
          window.Logger?.debug?.('📦 Trade plans loaded from cache', PAGE_LOG_CONTEXT);
          return Array.isArray(cached)
            ? cached
            : Array.isArray(cached?.data)
              ? cached.data
              : [];
        }
      }

      return await loader();
    } catch (error) {
      window.Logger?.error?.('❌ Error loading trade plans data', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      window.showErrorNotification?.('שגיאה', 'שגיאה בטעינת נתוני תוכניות מסחר');
      throw error;
    }
  }

async function saveTradePlan(planData) {
  try {
    const response = await fetch('/api/trade-plans/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      await window.CacheSyncManager.invalidateByAction('trade-plan-created');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error saving trade plan', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בשמירת תוכנית מסחר');
    throw error;
  }
}

async function updateTradePlan(planId, planData) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade-plans/${planId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      await window.CacheSyncManager.invalidateByAction('trade-plan-updated');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error updating trade plan', { ...PAGE_LOG_CONTEXT, planId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בעדכון תוכנית מסחר');
    throw error;
  }
}

async function deleteTradePlan(planId) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade-plans/${planId}`, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      await window.CacheSyncManager.invalidateByAction('trade-plan-deleted');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error deleting trade plan', { ...PAGE_LOG_CONTEXT, planId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה במחיקת תוכנית מסחר');
    throw error;
  }
}

async function executeTradePlan(planId) {
  try {
    const response = await fetch(`/api/trade-plans/${planId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      // Executing a plan is similar to updating it
      await window.CacheSyncManager.invalidateByAction('trade-plan-updated');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error executing trade plan', { ...PAGE_LOG_CONTEXT, planId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בביצוע תוכנית מסחר');
    throw error;
  }
}

async function cancelTradePlan(planId) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade-plans/${planId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      // Canceling a plan is similar to updating it
      await window.CacheSyncManager.invalidateByAction('trade-plan-updated');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error canceling trade plan', { ...PAGE_LOG_CONTEXT, planId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בביטול תוכנית מסחר');
    throw error;
  }
}

async function copyTradePlan(planId) {
  try {
    const response = await fetch('/api/trade-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ copy_from: planId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      // Copying creates a new plan
      await window.CacheSyncManager.invalidateByAction('trade-plan-created');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error copying trade plan', { ...PAGE_LOG_CONTEXT, planId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בהעתקת תוכנית מסחר');
    throw error;
  }
}

async function fetchTradePlanDetails(planId, options = {}) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade-plans/${planId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: options.signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת פרטי תוכנית מסחר ${planId} נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch trade plan details', {
        ...PAGE_LOG_CONTEXT,
        planId,
        error: error.message,
      });
      throw error;
    }

    return response.json();
  } catch (error) {
    window.Logger?.error?.('❌ Error getting trade plan details', { ...PAGE_LOG_CONTEXT, planId, error: error?.message || error });
    throw error;
  }
}

async function getCachedTradePlans() {
  try {
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      return await window.UnifiedCacheManager.get(TRADE_PLANS_DATA_KEY);
    }
    return null;
  } catch (error) {
    window.Logger?.warn?.('⚠️ Error getting cached trade plans', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    return null;
  }
}

async function setCachedTradePlans(data) {
  try {
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save(TRADE_PLANS_DATA_KEY, data, { ttl: TRADE_PLANS_TTL });
    }
  } catch (error) {
    window.Logger?.warn?.('⚠️ Error setting cached trade plans', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
  }
}

async function clearTradePlansCache(clearAll = false) {
  try {
    if (clearAll && typeof window.UnifiedCacheManager?.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(TRADE_PLANS_DATA_KEY);
    } else if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate(TRADE_PLANS_DATA_KEY);
    }
  } catch (error) {
    window.Logger?.warn?.('⚠️ Error clearing trade plans cache', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
  }
}

async function invalidateTradePlansCache() {
  try {
    if (window.CacheSyncManager?.invalidateByAction) {
      await window.CacheSyncManager.invalidateByAction('trade-plan-updated');
    } else if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      // Fallback to direct invalidation if CacheSyncManager not available
      await window.UnifiedCacheManager.invalidate(TRADE_PLANS_DATA_KEY);
    }
  } catch (error) {
    window.Logger?.warn?.('⚠️ Error invalidating trade plans cache', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
  }
}

  // ========================================================================
  // Business Logic API Wrappers
  // ========================================================================

  /**
   * Validate trade plan data using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {Object} planData - Trade plan data to validate
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateTradePlan(planData) {
    const cacheKey = `business:validate-trade-plan:${JSON.stringify(planData)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/trade-plan/validate', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(planData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            return {
              is_valid: false,
              errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
            };
          }

          const result = await response.json();
          return {
            is_valid: result.status === 'success',
            errors: []
          };
        }, { ttl: 60 * 1000 });
      }
      
      // Fallback if CacheTTLGuard not available
      const response = await fetch('/api/business/trade-plan/validate', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(planData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          is_valid: false,
          errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
        };
      }

      const result = await response.json();
      return {
        is_valid: result.status === 'success',
        errors: []
      };
    } catch (error) {
      window.Logger?.error?.('❌ Error validating trade plan', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

window.TradePlansData = {
  KEY: TRADE_PLANS_DATA_KEY,
  TTL: TRADE_PLANS_TTL,
  loadTradePlansData,
  saveTradePlan,
  updateTradePlan,
  deleteTradePlan,
  executeTradePlan,
  cancelTradePlan,
  copyTradePlan,
  fetchTradePlanDetails,
  getCachedTradePlans,
  setCachedTradePlans,
  invalidateTradePlansCache,
  validateTradePlan,
};

window.Logger?.info?.('✅ Trade Plans Data Service initialized', PAGE_LOG_CONTEXT);
})();

