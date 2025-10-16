/**
 * ========================================
 * Trade Plans Data Layer
 * ========================================
 * 
 * אחראי על:
 * - קריאות API (GET, POST, PUT, DELETE)
 * - ניהול מטמון (UnifiedCacheManager)
 * - טיפול בשגיאות API
 * - החזרת Promises
 */

/**
 * טעינת נתוני תוכניות מסחר
 * @returns {Promise<Array>} רשימת תוכניות מסחר
 */
async function loadTradePlansData() {
  try {
    // נסה מטמון תחילה
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      const cached = await window.UnifiedCacheManager.get('trade_plans', {
        ttl: 30000 // 30 שניות
      });
      
      if (cached) {
        console.log('📦 Trade plans loaded from cache');
        return cached;
      }
    }

    // Use trade-plan-service to load data
    if (typeof window.tradePlanService?.loadTradePlansData === 'function') {
      console.log('🔄 Loading trade plans data via trade-plan-service...');
      const data = await window.tradePlanService.loadTradePlansData();
      
      // שמירה במטמון
      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save('trade_plans', data, {
          ttl: 30000
        });
      }
      
      return data;
    }

    // Fallback: load data directly from API
    console.log('🔄 Loading trade plans data directly from API...');
    const response = await fetch('/api/trade_plans/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // שמירה במטמון
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save('trade_plans', data, {
        ttl: 30000
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error loading trade plans data:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני תוכניות מסחר');
    }
    throw error;
  }
}

/**
 * שמירת תוכנית מסחר חדשה
 * @param {Object} planData - נתוני התוכנית
 * @returns {Promise<Object>} התוכנית שנוצרה
 */
async function saveTradePlan(planData) {
  try {
    const response = await fetch('/api/trade_plans/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trade_plans');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error saving trade plan:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בשמירת תוכנית מסחר');
    }
    throw error;
  }
}

/**
 * עדכון תוכנית מסחר קיימת
 * @param {number} planId - מזהה התוכנית
 * @param {Object} planData - נתוני התוכנית המעודכנים
 * @returns {Promise<Object>} התוכנית המעודכנת
 */
async function updateTradePlan(planId, planData) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade_plans/${planId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trade_plans');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error updating trade plan:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בעדכון תוכנית מסחר');
    }
    throw error;
  }
}

/**
 * מחיקת תוכנית מסחר
 * @param {number} planId - מזהה התוכנית
 * @returns {Promise<Object>} תוצאת המחיקה
 */
async function deleteTradePlan(planId) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade_plans/${planId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trade_plans');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error deleting trade plan:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה במחיקת תוכנית מסחר');
    }
    throw error;
  }
}

/**
 * ביצוע תוכנית מסחר
 * @param {number} planId - מזהה התוכנית
 * @returns {Promise<Object>} תוצאת הביצוע
 */
async function executeTradePlan(planId) {
  try {
    const response = await fetch('/api/trade_plans/' + planId + '/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trade_plans');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error executing trade plan:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בביצוע תוכנית מסחר');
    }
    throw error;
  }
}

/**
 * ביטול תוכנית מסחר
 * @param {number} planId - מזהה התוכנית
 * @returns {Promise<Object>} תוצאת הביטול
 */
async function cancelTradePlan(planId) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade_plans/${planId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trade_plans');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error canceling trade plan:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בביטול תוכנית מסחר');
    }
    throw error;
  }
}

/**
 * העתקת תוכנית מסחר
 * @param {number} planId - מזהה התוכנית
 * @returns {Promise<Object>} התוכנית החדשה
 */
async function copyTradePlan(planId) {
  try {
    const response = await fetch('/api/trade_plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ copy_from: planId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trade_plans');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error copying trade plan:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בהעתקת תוכנית מסחר');
    }
    throw error;
  }
}

/**
 * קבלת נתוני מטמון
 * @returns {Promise<Array|null>} נתוני מטמון או null
 */
async function getCachedTradePlans() {
  try {
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      return await window.UnifiedCacheManager.get('trade_plans');
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting cached trade plans:', error);
    return null;
  }
}

/**
 * שמירת נתונים במטמון
 * @param {Array} data - נתונים לשמירה
 * @returns {Promise<void>}
 */
async function setCachedTradePlans(data) {
  try {
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save('trade_plans', data, {
        ttl: 30000
      });
    }
  } catch (error) {
    console.error('❌ Error setting cached trade plans:', error);
  }
}

/**
 * ביטול מטמון תוכניות מסחר
 * @returns {Promise<void>}
 */
async function invalidateTradePlansCache() {
  try {
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trade_plans');
    }
  } catch (error) {
    console.error('❌ Error invalidating trade plans cache:', error);
  }
}

// ייצוא המודול
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
