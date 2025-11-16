/**
 * ========================================
 * Trade Plans Data Layer
 * ========================================
 *
 * Unified data service for trade plans CRUD operations.
 */

async function loadTradePlansData() {
  try {
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      const cached = await window.UnifiedCacheManager.get('trade-plans-data', { ttl: 30000 });
      if (cached) {
        console.log('📦 Trade plans loaded from cache');
        return Array.isArray(cached)
          ? cached
          : Array.isArray(cached?.data)
            ? cached.data
            : [];
      }
    }

    console.log('🔄 Loading trade plans data directly from API...');
    const response = await fetch('/api/trade-plans/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const payload = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save('trade-plans-data', payload, { ttl: 30000 });
    }

    return payload;
  } catch (error) {
    console.error('❌ Error loading trade plans data:', error);
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
    console.error('❌ Error saving trade plan:', error);
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
    console.error('❌ Error updating trade plan:', error);
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
    console.error('❌ Error deleting trade plan:', error);
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
    console.error('❌ Error executing trade plan:', error);
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
    console.error('❌ Error canceling trade plan:', error);
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
    console.error('❌ Error copying trade plan:', error);
    window.showErrorNotification?.('שגיאה', 'שגיאה בהעתקת תוכנית מסחר');
    throw error;
  }
}

async function getCachedTradePlans() {
  try {
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      return await window.UnifiedCacheManager.get('trade-plans-data');
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting cached trade plans:', error);
    return null;
  }
}

async function setCachedTradePlans(data) {
  try {
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save('trade-plans-data', data, { ttl: 30000 });
    }
  } catch (error) {
    console.error('❌ Error setting cached trade plans:', error);
  }
}

async function invalidateTradePlansCache() {
  try {
    if (window.CacheSyncManager?.invalidateByAction) {
      await window.CacheSyncManager.invalidateByAction('trade-plan-updated');
    } else if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      // Fallback to direct invalidation if CacheSyncManager not available
      await window.UnifiedCacheManager.invalidate('trade-plans-data');
    }
  } catch (error) {
    console.error('❌ Error invalidating trade plans cache:', error);
  }
}

window.TradePlansData = {
  loadTradePlansData,
  saveTradePlan,
  updateTradePlan,
  deleteTradePlan,
  executeTradePlan,
  cancelTradePlan,
  copyTradePlan,
  getCachedTradePlans,
  setCachedTradePlans,
  invalidateTradePlansCache
};

console.log('✅ Trade Plans Data module loaded');

