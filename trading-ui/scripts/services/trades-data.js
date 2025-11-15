/**
 * ========================================
 * Trades Data Layer
 * ========================================
 *
 * Handles:
 * - API calls (GET, POST, PUT, DELETE)
 * - UnifiedCacheManager integration
 * - Standardized error handling
 * - Promise-based responses
 */

async function loadTradesData() {
  try {
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      const cached = await window.UnifiedCacheManager.get('trades-data', { ttl: 30000 });
      if (cached) {
        console.log('📦 Trades loaded from cache');
        return Array.isArray(cached)
          ? cached
          : Array.isArray(cached?.data)
            ? cached.data
            : [];
      }
    }

    console.log('🔄 Loading trades data from API...');
    const response = await fetch('/api/trades/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const payload = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save('trades-data', payload, { ttl: 30000 });
    }

    return payload;
  } catch (error) {
    console.error('❌ Error loading trades data:', error);
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
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades-data');
    }
    return result;
  } catch (error) {
    console.error('❌ Error saving trade:', error);
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
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades-data');
    }
    return result;
  } catch (error) {
    console.error('❌ Error updating trade:', error);
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
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades-data');
    }
    return result;
  } catch (error) {
    console.error('❌ Error deleting trade:', error);
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
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades-data');
    }
    return result;
  } catch (error) {
    console.error('❌ Error closing trade:', error);
    window.showErrorNotification?.('שגיאה', 'שגיאה בסגירת טרייד');
    throw error;
  }
}

async function getTradeDetails(tradeId) {
  try {
    const response = await fetch(`/api/trades/${tradeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error getting trade details:', error);
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
    console.error('❌ Error copying trade:', error);
    window.showErrorNotification?.('שגיאה', 'שגיאה בהעתקת טרייד');
    throw error;
  }
}

async function getCachedTrades() {
  try {
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      return await window.UnifiedCacheManager.get('trades-data');
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting cached trades:', error);
    return null;
  }
}

async function setCachedTrades(data) {
  try {
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save('trades-data', data, { ttl: 30000 });
    }
  } catch (error) {
    console.error('❌ Error setting cached trades:', error);
  }
}

async function invalidateTradesCache() {
  try {
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades-data');
    }
  } catch (error) {
    console.error('❌ Error invalidating trades cache:', error);
  }
}

window.TradesData = {
  loadTradesData,
  saveTrade,
  updateTrade,
  deleteTrade,
  closeTrade,
  getTradeDetails,
  copyTrade,
  getCachedTrades,
  setCachedTrades,
  invalidateTradesCache
};

console.log('✅ Trades Data module loaded');

