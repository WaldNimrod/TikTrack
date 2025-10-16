/**
 * ========================================
 * Trades Data Layer
 * ========================================
 * 
 * אחראי על:
 * - קריאות API (GET, POST, PUT, DELETE)
 * - ניהול מטמון (UnifiedCacheManager)
 * - טיפול בשגיאות API
 * - החזרת Promises
 */

/**
 * טעינת נתוני טריידים
 * @returns {Promise<Array>} רשימת טריידים
 */
async function loadTradesData() {
  try {
    // נסה מטמון תחילה
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      const cached = await window.UnifiedCacheManager.get('trades', {
        ttl: 30000 // 30 שניות
      });
      
      if (cached) {
        console.log('📦 Trades loaded from cache');
        return cached;
      }
    }

    // טעינה מהשרת
    console.log('🔄 Loading trades data from API...');
    const response = await fetch('/api/trades/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // שמירה במטמון
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save('trades', data, {
        ttl: 30000
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error loading trades data:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני טריידים');
    }
    throw error;
  }
}

/**
 * שמירת טרייד חדש
 * @param {Object} tradeData - נתוני הטרייד
 * @returns {Promise<Object>} הטרייד שנוצר
 */
async function saveTrade(tradeData) {
  try {
    const response = await fetch('/api/trades/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradeData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error saving trade:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בשמירת טרייד');
    }
    throw error;
  }
}

/**
 * עדכון טרייד קיים
 * @param {number} tradeId - מזהה הטרייד
 * @param {Object} tradeData - נתוני הטרייד המעודכנים
 * @returns {Promise<Object>} הטרייד המעודכן
 */
async function updateTrade(tradeId, tradeData) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trades/${tradeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradeData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error updating trade:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בעדכון טרייד');
    }
    throw error;
  }
}

/**
 * מחיקת טרייד
 * @param {number} tradeId - מזהה הטרייד
 * @returns {Promise<Object>} תוצאת המחיקה
 */
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
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error deleting trade:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה במחיקת טרייד');
    }
    throw error;
  }
}

/**
 * סגירת טרייד
 * @param {number} tradeId - מזהה הטרייד
 * @param {Object} closeData - נתוני הסגירה
 * @returns {Promise<Object>} תוצאת הסגירה
 */
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
    
    // ביטול מטמון
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error closing trade:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בסגירת טרייד');
    }
    throw error;
  }
}

/**
 * קבלת פרטי טרייד
 * @param {number} tradeId - מזהה הטרייד
 * @returns {Promise<Object>} פרטי הטרייד
 */
async function getTradeDetails(tradeId) {
  try {
    const response = await fetch(`/api/trades/${tradeId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error getting trade details:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בקבלת פרטי טרייד');
    }
    throw error;
  }
}

/**
 * העתקת טרייד
 * @param {number} tradeId - מזהה הטרייד
 * @returns {Promise<Object>} הטרייד החדש
 */
async function copyTrade(tradeId) {
  try {
    // קבלת פרטי הטרייד המקורי
    const originalTrade = await getTradeDetails(tradeId);
    
    // יצירת טרייד חדש עם נתונים מעודכנים
    const newTradeData = {
      ...originalTrade,
      id: undefined, // הסרת ID כדי ליצור טרייד חדש
      status: 'open',
      created_at: undefined,
      updated_at: undefined
    };
    
    const result = await saveTrade(newTradeData);
    
    return result;
  } catch (error) {
    console.error('❌ Error copying trade:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בהעתקת טרייד');
    }
    throw error;
  }
}

/**
 * קבלת נתוני מטמון
 * @returns {Promise<Array|null>} נתוני מטמון או null
 */
async function getCachedTrades() {
  try {
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      return await window.UnifiedCacheManager.get('trades');
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting cached trades:', error);
    return null;
  }
}

/**
 * שמירת נתונים במטמון
 * @param {Array} data - נתונים לשמירה
 * @returns {Promise<void>}
 */
async function setCachedTrades(data) {
  try {
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save('trades', data, {
        ttl: 30000
      });
    }
  } catch (error) {
    console.error('❌ Error setting cached trades:', error);
  }
}

/**
 * ביטול מטמון טריידים
 * @returns {Promise<void>}
 */
async function invalidateTradesCache() {
  try {
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate('trades');
    }
  } catch (error) {
    console.error('❌ Error invalidating trades cache:', error);
  }
}

// ייצוא המודול
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
