/**
 * Trades Data Service
 * ======================================
 * Unified loader for trades data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load trades list via API (with cache bust for local file protocol)
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
(function tradesDataService() {
  const TRADES_DATA_KEY = 'trades-data';
  const TRADES_TTL = 45 * 1000; // 45 seconds per audit plan
  const PAGE_LOG_CONTEXT = { page: 'trades-data' };

  async function loadTradesData(options = {}) {
    try {
      const { force = false } = options || {};
      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(TRADES_DATA_KEY, { ttl: TRADES_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Trades loaded from cache', PAGE_LOG_CONTEXT);
          return Array.isArray(cached)
            ? cached
            : Array.isArray(cached?.data)
              ? cached.data
              : [];
        }
      }

      window.Logger?.debug?.('🔄 Loading trades data from API...', PAGE_LOG_CONTEXT);
    let response = await fetch('/api/trades/');
    if (!response.ok) {
      // Retry without trailing slash once
      const retry = await fetch('/api/trades');
      if (!retry.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      response = retry;
    }

    const data = await response.json();
    try {
      window.Logger?.info?.('🔎 TradesData: raw API payload snapshot', {
        hasDataKey: !!data && Object.prototype.hasOwnProperty.call(data, 'data'),
        isArrayRoot: Array.isArray(data),
        dataArrayLen: Array.isArray(data?.data) ? data.data.length : null,
      }, { page: 'trades-data' });
    } catch (e) {
      // ignore log issues
    }
    const payload = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save(TRADES_DATA_KEY, payload, { ttl: TRADES_TTL });
    }

    window.Logger?.debug?.('✅ Trades loaded from API', { ...PAGE_LOG_CONTEXT, count: payload.length });
    return payload;
  } catch (error) {
    window.Logger?.error?.('❌ Error loading trades data', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בטעינת נתוני טריידים');
    throw error;
  }
}

async function saveTrade(tradeData) {
  try {
    const response = await fetch('/api/trades/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      await window.CacheSyncManager.invalidateByAction('trade-created');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error saving trade', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בשמירת טרייד');
    throw error;
  }
}

async function updateTrade(tradeId, tradeData) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trades/${tradeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      await window.CacheSyncManager.invalidateByAction('trade-updated');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error updating trade', { ...PAGE_LOG_CONTEXT, tradeId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בעדכון טרייד');
    throw error;
  }
}

async function deleteTrade(tradeId) {
  try {
    const response = await fetch(`/api/trades/${tradeId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      await window.CacheSyncManager.invalidateByAction('trade-deleted');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error deleting trade', { ...PAGE_LOG_CONTEXT, tradeId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה במחיקת טרייד');
    throw error;
  }
}

async function closeTrade(tradeId, closeData) {
  try {
    const response = await fetch(`/api/trades/${tradeId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(closeData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
      // Closing a trade is similar to updating it
      await window.CacheSyncManager.invalidateByAction('trade-updated');
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ Error closing trade', { ...PAGE_LOG_CONTEXT, tradeId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בסגירת טרייד');
    throw error;
  }
}

async function getTradeDetails(tradeId, options = {}) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trades/${tradeId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: options.signal,
    });
    if (!response.ok) {
      const error = new Error(`טעינת פרטי טרייד ${tradeId} נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch trade details', {
        ...PAGE_LOG_CONTEXT,
        tradeId,
        error: error.message,
      });
      throw error;
    }
    return await response.json();
  } catch (error) {
    window.Logger?.error?.('❌ Error getting trade details', { ...PAGE_LOG_CONTEXT, tradeId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בקבלת פרטי טרייד');
    throw error;
  }
}

async function copyTrade(tradeId) {
  try {
    const originalTrade = await getTradeDetails(tradeId);
    const newTradeData = {
      ...originalTrade,
      id: undefined,
      status: 'open',
      created_at: undefined,
      updated_at: undefined
    };
    return await saveTrade(newTradeData);
  } catch (error) {
    window.Logger?.error?.('❌ Error copying trade', { ...PAGE_LOG_CONTEXT, tradeId, error: error?.message || error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בהעתקת טרייד');
    throw error;
  }
}

async function getCachedTrades() {
  try {
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      return await window.UnifiedCacheManager.get(TRADES_DATA_KEY);
    }
    return null;
  } catch (error) {
    window.Logger?.warn?.('⚠️ Error getting cached trades', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    return null;
  }
}

async function setCachedTrades(data) {
  try {
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save(TRADES_DATA_KEY, data, { ttl: TRADES_TTL });
    }
  } catch (error) {
    window.Logger?.warn?.('⚠️ Error setting cached trades', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
  }
}

async function invalidateTradesCache() {
  try {
    if (window.CacheSyncManager?.invalidateByAction) {
      await window.CacheSyncManager.invalidateByAction('trade-updated');
    } else if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      // Fallback to direct invalidation if CacheSyncManager not available
      await window.UnifiedCacheManager.invalidate(TRADES_DATA_KEY);
    }
  } catch (error) {
    window.Logger?.warn?.('⚠️ Error invalidating trades cache', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
  }
}

window.TradesData = {
  KEY: TRADES_DATA_KEY,
  TTL: TRADES_TTL,
  loadTradesData,
  saveTrade,
  updateTrade,
  deleteTrade,
  closeTrade,
  getTradeDetails,
  copyTrade,
  getCachedTrades,
  setCachedTrades,
  invalidateTradesCache,
};

window.Logger?.info?.('✅ Trades Data Service initialized', PAGE_LOG_CONTEXT);
})();

