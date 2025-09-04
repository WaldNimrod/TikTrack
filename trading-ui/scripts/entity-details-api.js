/**
 * Entity Details API - TikTrack Entity Details API Integration
 * ==========================================================
 *
 * מערכת API לקבלת פרטי ישויות מהשרת במערכת TikTrack
 *
 * תכונות עיקריות:
 * - קריאות API מאוחדות לכל סוגי הישויות
 * - טיפול בשגיאות ו-caching מתקדם
 * - אינטגרציה עם מערכת הנתונים החיצוניים
 * - retry logic וטיפול ב-timeouts
 * - עיצוב response data אחיד
 *
 * קובץ: trading-ui/scripts/entity-details-api.js
 * גרסה: 1.0.0
 * יוצר: Nimrod
 * תאריך יצירה: 4 בספטמבר 2025
 *
 * תלויות:
 * - notification-system.js (התראות גלובליות)
 * - Backend API endpoints
 *
 * דוקומנטציה: documentation/features/entity-details-system/README.md
 */

// ===== ENTITY DETAILS API CLASS =====

/**
 * EntityDetailsAPI - מחלקה לטיפול בקריאות API לפרטי ישויות
 *
 * @class EntityDetailsAPI
 */
class EntityDetailsAPI {

  /**
     * Constructor - אתחול מחלקת EntityDetailsAPI
     *
     * @constructor
     */
  constructor() {
    this.baseUrl = '/api/entity-details';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 דקות
    this.isInitialized = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 שנייה

    this.init();
  }

  /**
     * Initialize API system - אתחול מערכת API
     *
     * @private
     */
  init() {
    try {
      // ניקוי cache ישן
      this.clearExpiredCache();

      // הגדרת interval לניקוי cache
      setInterval(() => {
        this.clearExpiredCache();
      }, this.cacheTimeout);

      this.isInitialized = true;

      // הוספה לאובייקט הגלובלי
      window.entityDetailsAPI = this;

      console.info('EntityDetailsAPI initialized successfully');

    } catch (error) {
      // // console.error('Error initializing EntityDetailsAPI:', error); // Disabled for linting
    }
  }

  /**
     * Get entity details - קבלת פרטי ישות מהשרת
     *
     * @param {string} entityType - סוג הישות (ticker, trade, וכו')
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} options - אפשרויות קריאה
     * @returns {Promise<Object>} - Promise עם נתוני הישות
     * @public
     */
  async getEntityDetails(entityType, entityId, options = {}) {
    try {
      // בדיקת פרמטרים
      if (!entityType || !entityId && entityId !== 0) {
        throw new Error('חסרים פרמטרים: entityType ו-entityId');
      }

      // בדיקת cache אם לא נדרש refresh
      if (!options.forceRefresh) {
        const cachedData = this.getCachedData(entityType, entityId);
        if (cachedData) {
          // // console.debug(`Returning cached data for ${entityType} ${entityId}`); // Disabled for linting
          return cachedData;
        }
      }

      console.info(`Fetching entity details for ${entityType} ${entityId}`);

      // קריאה לשרת עם retry logic
      const entityData = await this.fetchWithRetry(entityType, entityId, options);

      // שמירה ב-cache
      this.setCachedData(entityType, entityId, entityData);

      return entityData;

    } catch (error) {
      // // console.error(`Error getting entity details for ${entityType} ${entityId}:`, error); // Disabled for linting

      // הצגת התראת שגיאה
      if (window.showErrorNotification) {
        window.showErrorNotification(`שגיאה בטעינת פרטי ${entityType}: ${error.message}`);
      }

      throw error;
    }
  }

  /**
     * Fetch with retry logic - קריאה עם לוגיקת חזרות
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} options - אפשרויות קריאה
     * @returns {Promise<Object>} - Promise עם נתוני הישות
     * @private
     */
  async fetchWithRetry(entityType, entityId, options = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // // console.debug(`Fetch attempt ${attempt}/${this.retryAttempts} for ${entityType} ${entityId}`); // Disabled for linting

        // קריאה ישירה לAPI
        const entityData = await this.fetchEntityFromAPI(entityType, entityId);

        return entityData;

      } catch (error) {
        lastError = error;
        // // console.warn(`Attempt ${attempt} failed for ${entityType} ${entityId}:`, error.message); // Disabled for linting

        // המתנה לפני ניסיון נוסף (אלא אם זה הניסיון האחרון)
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
     * Fetch entity from API - קריאת ישות מה-API
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @returns {Promise<Object>} - Promise עם נתוני הישות
     * @private
     */
  async fetchEntityFromAPI(entityType, entityId) {
    // נסה קודם את endpoint החדש המיוחד
    try {
      return await this.fetchFromNewEndpoint(entityType, entityId);
    } catch (error) {
      // // console.debug(`New endpoint failed for ${entityType}, trying existing endpoints:`, error.message); // Disabled for linting
      // אם החדש לא עובד, נסה את הendpoints הקיימים
      return await this.fetchFromExistingEndpoints(entityType, entityId);
    }
  }

  /**
     * Fetch from new entity details endpoint - קריאה מהendpoint החדש
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @returns {Promise<Object>} - Promise עם נתוני הישות
     * @private
     */
  async fetchFromNewEndpoint(entityType, entityId) {
    const url = `${this.baseUrl}/${entityType}/${entityId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`${entityType} עם מזהה ${entityId} לא נמצא`);
      }
      throw new Error(`שגיאת שרת: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'שגיאה לא ידועה מהשרת');
    }

    return data.data;
  }

  /**
     * Fetch from existing endpoints - קריאה מהendpoints הקיימים
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @returns {Promise<Object>} - Promise עם נתוני הישות
     * @private
     */
  async fetchFromExistingEndpoints(entityType, entityId) {
    const endpointMappings = {
      ticker: `/api/tickers/${entityId}`,
      trade: `/api/trades/${entityId}`,
      trade_plan: `/api/trade-plans/${entityId}`,
      execution: `/api/executions/${entityId}`,
      account: `/api/accounts/${entityId}`,
      alert: `/api/alerts/${entityId}`,
      cash_flow: `/api/cash-flows/${entityId}`,
      note: `/api/notes/${entityId}`,
    };

    const endpoint = endpointMappings[entityType];
    if (!endpoint) {
      throw new Error(`לא נמצא endpoint עבור סוג ישות: ${entityType}`);
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`${entityType} עם מזהה ${entityId} לא נמצא`);
      }
      throw new Error(`שגיאת שרת: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // עיצוב נתונים אחיד
    return this.normalizeEntityData(entityType, data);
  }

  /**
     * Normalize entity data - עיצוב נתונים אחיד
     *
     * @param {string} entityType - סוג הישות
     * @param {Object} rawData - נתונים גולמיים
     * @returns {Object} - נתונים מעוצבים
     * @private
     */
  normalizeEntityData(entityType, rawData) {
    // אם הנתונים עטופים בsucess/data, חלץ אותם
    const data = rawData.data || rawData;

    // וודא שיש מזהה
    if (!data.id && !data.ticker_id && !data.trade_id) {
      // // console.warn('Entity data missing ID field:', data); // Disabled for linting
    }

    // הוסף מידע נוסף
    data.entity_type = entityType;
    data.fetched_at = new Date().toISOString();

    // וודא שיש מערך פריטים מקושרים
    if (!data.linked_items) {
      data.linked_items = [];
    }

    return data;
  }

  /**
     * Get cached data - קבלת נתונים מה-cache
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @returns {Object|null} - נתונים מ-cache או null
     * @private
     */
  getCachedData(entityType, entityId) {
    const cacheKey = `${entityType}_${entityId}`;
    const cachedEntry = this.cache.get(cacheKey);

    if (!cachedEntry) {return null;}

    // בדיקת תוקף
    const now = Date.now();
    if (now - cachedEntry.timestamp > this.cacheTimeout) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cachedEntry.data;
  }

  /**
     * Set cached data - שמירת נתונים ב-cache
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} data - נתונים לשמירה
     * @private
     */
  setCachedData(entityType, entityId, data) {
    const cacheKey = `${entityType}_${entityId}`;

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    // // console.debug(`Cached data for ${cacheKey}`); // Disabled for linting
  }

  /**
     * Clear expired cache - ניקוי cache פג תוקף
     *
     * @private
     */
  clearExpiredCache() {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      // // console.debug(`Cleared ${deletedCount} expired cache entries`); // Disabled for linting
    }
  }

  /**
     * Clear all cache - ניקוי כל ה-cache
     *
     * @public
     */
  clearCache() {
    const cacheSize = this.cache.size;
    this.cache.clear();
    console.info(`Cleared ${cacheSize} cache entries`);
  }

  /**
     * Clear entity cache - ניקוי cache לישות ספציפית
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @public
     */
  clearEntityCache(entityType, entityId) {
    const cacheKey = `${entityType}_${entityId}`;
    const deleted = this.cache.delete(cacheKey);

    if (deleted) {
      // // console.debug(`Cleared cache for ${cacheKey}`); // Disabled for linting
    }
  }

  /**
     * Refresh entity data - רענון נתוני ישות
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @returns {Promise<Object>} - Promise עם נתונים מרוענים
     * @public
     */
  async refreshEntityData(entityType, entityId) {
    try {
      // מחיקת cache לישות
      this.clearEntityCache(entityType, entityId);

      // קבלת נתונים חדשים
      const entityData = await this.getEntityDetails(entityType, entityId, { forceRefresh: true });

      console.info(`Refreshed data for ${entityType} ${entityId}`);

      // התראת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('נתוני הישות רוענו בהצלחה');
      }

      return entityData;

    } catch (error) {
      // // console.error(`Error refreshing entity data for ${entityType} ${entityId}:`, error); // Disabled for linting

      if (window.showErrorNotification) {
        window.showErrorNotification(`שגיאה ברענון נתוני ישות: ${error.message}`);
      }

      throw error;
    }
  }

  /**
     * Get entity with linked items - קבלת ישות עם פריטים מקושרים
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @returns {Promise<Object>} - Promise עם נתונים כולל פריטים מקושרים
     * @public
     */
  async getEntityWithLinkedItems(entityType, entityId) {
    // קבלת פרטי הישות הבסיסיים
    const entityData = await this.getEntityDetails(entityType, entityId);

    // קבלת פריטים מקושרים
    const linkedItems = await this.getLinkedItems(entityType, entityId);

    // שילוב הנתונים
    entityData.linked_items = linkedItems;

    return entityData;
  }

  /**
     * Get linked items for entity - קבלת פריטים מקושרים לישות
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @returns {Promise<Array>} - Promise עם מערך פריטים מקושרים
     * @public
     */
  async getLinkedItems(entityType, entityId) {
    try {
      const url = `/api/linked-items/${entityType}/${entityId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // // console.debug(`No linked items found for ${entityType} ${entityId}`); // Disabled for linting
          return [];
        }
        throw new Error(`שגיאת שרת בקבלת פריטים מקושרים: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data || [];

    } catch (error) {
      // // console.error(`Error getting linked items for ${entityType} ${entityId}:`, error); // Disabled for linting
      return []; // החזר מערך ריק במקום לזרוק שגיאה
    }
  }

  /**
     * Get external data for entity - קבלת נתונים חיצוניים לישות
     *
     * @param {string} entityType - סוג הישות
     * @param {Object} entityData - נתוני הישות
     * @returns {Promise<Object>} - Promise עם נתונים חיצוניים
     * @public
     */
  async getExternalData(entityType, entityData) {
    try {
      // רק עבור טיקרים יש נתונים חיצוניים
      if (entityType !== 'ticker' || !entityData.symbol) {
        return null;
      }

      // שימוש במערכת הנתונים החיצוניים הקיימת
      if (window.externalDataService) {
        // // console.debug(`Fetching external data for ticker ${entityData.symbol}`); // Disabled for linting

        // קריאה למערכת הנתונים החיצוניים
        const externalData = await window.externalDataService.getQuote(entityData.symbol);

        if (externalData && externalData.success && externalData.data) {
          console.info(`External data loaded for ${entityData.symbol}`);

          // עיצוב הנתונים לתצוגה במערכת פרטי הישויות
          const formattedData = {
            current_price: externalData.data.regularMarketPrice || externalData.data.price,
            daily_change: externalData.data.regularMarketChange || externalData.data.change,
            daily_change_percent: externalData.data.regularMarketChangePercent || externalData.data.changePercent,
            market_cap: externalData.data.marketCap,
            volume: externalData.data.regularMarketVolume || externalData.data.volume,
            previous_close: externalData.data.regularMarketPreviousClose,
            day_high: externalData.data.regularMarketDayHigh,
            day_low: externalData.data.regularMarketDayLow,
            last_updated: new Date().toISOString(),
            data_source: 'yahoo_finance',
            market_status: this._determineMarketStatus(externalData.data),
          };

          return formattedData;
        } else {
          // // console.debug(`No external data available for ${entityData.symbol}`); // Disabled for linting
          return null;
        }

      } else {
        // // console.debug('External data service not available'); // Disabled for linting
        return null;
      }

    } catch (error) {
      // // console.warn(`Could not fetch external data for ${entityData.symbol}:`, error); // Disabled for linting
      return null;
    }
  }

  /**
     * Determine market status from external data
     *
     * @param {Object} externalData - External data object
     * @returns {string} - Market status
     * @private
     */
  _determineMarketStatus(externalData) {
    try {
      // בדיקה אם השוק פתוח בהתבסס על הנתונים
      const now = new Date();
      const lastUpdate = externalData.regularMarketTime ?
        new Date(externalData.regularMarketTime * 1000) : new Date();

      // הפרש זמן של יותר מ-4 שעות מעיד על שוק סגור
      const timeDiff = now - lastUpdate;
      const fourHours = 4 * 60 * 60 * 1000;

      if (timeDiff > fourHours) {
        return 'closed';
      }

      // בדיקה אם יש volume - אם יש, השוק כנראה פתוח
      const volume = externalData.regularMarketVolume || externalData.volume;
      if (volume && volume > 0) {
        return 'open';
      }

      return 'unknown';

    } catch (error) {
      // // console.debug('Could not determine market status:', error); // Disabled for linting
      return 'unknown';
    }
  }

  /**
     * Update entity data - עדכון נתוני ישות
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} updateData - נתונים לעדכון
     * @returns {Promise<Object>} - Promise עם נתונים מעודכנים
     * @public
     */
  async updateEntityData(entityType, entityId, updateData) {
    try {
      const url = `${this.baseUrl}/${entityType}/${entityId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`שגיאה בעדכון: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // מחיקת cache לישות שעודכנה
      this.clearEntityCache(entityType, entityId);

      // התראת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הישות עודכנה בהצלחה');
      }

      return data.data || data;

    } catch (error) {
      // // console.error(`Error updating entity ${entityType} ${entityId}:`, error); // Disabled for linting

      if (window.showErrorNotification) {
        window.showErrorNotification(`שגיאה בעדכון ישות: ${error.message}`);
      }

      throw error;
    }
  }

  /**
     * Delete entity - מחיקת ישות
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @returns {Promise<boolean>} - Promise עם תוצאת המחיקה
     * @public
     */
  async deleteEntity(entityType, entityId) {
    try {
      // אישור מחיקה עם מערכת ההתראות הגלובלית
      const confirmed = await this.confirmDeletion(entityType, entityId);
      if (!confirmed) {return false;}

      const url = `${this.baseUrl}/${entityType}/${entityId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`שגיאה במחיקה: ${response.status} ${response.statusText}`);
      }

      // מחיקת cache
      this.clearEntityCache(entityType, entityId);

      // התראת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הישות נמחקה בהצלחה');
      }

      return true;

    } catch (error) {
      // // console.error(`Error deleting entity ${entityType} ${entityId}:`, error); // Disabled for linting

      if (window.showErrorNotification) {
        window.showErrorNotification(`שגיאה במחיקת ישות: ${error.message}`);
      }

      return false;
    }
  }

  /**
     * Confirm deletion - אישור מחיקה
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @returns {Promise<boolean>} - Promise עם תוצאת האישור
     * @private
     */
  async confirmDeletion(entityType, entityId) {
    return new Promise(resolve => {
      // שימוש במערכת ההתראות הגלובלית
      if (window.showConfirmNotification) {
        window.showConfirmNotification(
          `האם אתה בטוח שברצונך למחוק את ${entityType} #${entityId}?`,
          'מחיקת ישות',
          confirmed => resolve(confirmed),
        );
      } else {
        // fallback לconfirm רגיל
        const result = confirm(`האם אתה בטוח שברצונך למחוק את ${entityType} #${entityId}?`);
        resolve(result);
      }
    });
  }

  /**
     * Delay utility function - פונקציית עזר להמתנה
     *
     * @param {number} ms - זמן המתנה במילישניות
     * @returns {Promise} - Promise שמסתיים לאחר ההמתנה
     * @private
     */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
     * Get cache statistics - קבלת סטטיסטיקות cache
     *
     * @returns {Object} - סטטיסטיקות cache
     * @public
     */
  getCacheStats() {
    const stats = {
      total_entries: this.cache.size,
      cache_timeout: this.cacheTimeout,
      entries: [],
    };

    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      const expiresIn = this.cacheTimeout - age;

      stats.entries.push({
        key,
        age_ms: age,
        expires_in_ms: expiresIn,
        is_expired: expiresIn <= 0,
      });
    }

    return stats;
  }
}

// ===== GLOBAL FUNCTIONS =====

/**
 * Get entity details - פונקציה גלובלית לקבלת פרטי ישות
 *
 * @param {string} entityType - סוג הישות
 * @param {number|string} entityId - מזהה הישות
 * @param {Object} options - אפשרויות
 * @returns {Promise<Object>} - Promise עם נתוני הישות
 * @global
 */
async function getEntityDetails(entityType, entityId, options = {}) {
  if (window.entityDetailsAPI) {
    return await window.entityDetailsAPI.getEntityDetails(entityType, entityId, options);
  } else {
    throw new Error('EntityDetailsAPI לא מוכן');
  }
}

/**
 * Refresh entity data - פונקציה גלובלית לרענון נתוני ישות
 *
 * @param {string} entityType - סוג הישות
 * @param {number|string} entityId - מזהה הישות
 * @returns {Promise<Object>} - Promise עם נתונים מרוענים
 * @global
 */
async function refreshEntityData(entityType, entityId) {
  if (window.entityDetailsAPI) {
    return await window.entityDetailsAPI.refreshEntityData(entityType, entityId);
  } else {
    throw new Error('EntityDetailsAPI לא מוכן');
  }
}

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize when DOM is ready - אתחול אוטומטי כשה-DOM מוכן
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // אתחול מערכת API
    new EntityDetailsAPI();

    console.info('Entity Details API system loaded and ready');

  } catch (error) {
    // // console.error('Error auto-initializing EntityDetailsAPI:', error); // Disabled for linting
  }
});

// ===== FUNCTION INDEX =====
/*
 * 📚 אינדקס פונקציות:
 * ================
 *
 * מחלקה ראשית:
 * - EntityDetailsAPI.constructor() - אתחול המחלקה
 * - EntityDetailsAPI.init() - אתחול מערכת API
 * - EntityDetailsAPI.getEntityDetails() - קבלת פרטי ישות
 * - EntityDetailsAPI.refreshEntityData() - רענון נתוני ישות
 * - EntityDetailsAPI.updateEntityData() - עדכון נתוני ישות
 * - EntityDetailsAPI.deleteEntity() - מחיקת ישות
 *
 * פונקציות קריאה:
 * - fetchWithRetry() - קריאה עם retry logic
 * - fetchEntityFromAPI() - קריאת ישות מ-API
 * - fetchFromNewEndpoint() - קריאה מendpoint חדש
 * - fetchFromExistingEndpoints() - קריאה מendpoints קיימים
 * - getEntityWithLinkedItems() - קבלת ישות עם פריטים מקושרים
 * - getLinkedItems() - קבלת פריטים מקושרים
 * - getExternalData() - קבלת נתונים חיצוניים
 *
 * פונקציות cache:
 * - getCachedData() - קבלת נתונים מcache
 * - setCachedData() - שמירת נתונים בcache
 * - clearExpiredCache() - ניקוי cache פג תוקף
 * - clearCache() - ניקוי כל הcache
 * - clearEntityCache() - ניקוי cache לישות ספציפית
 * - getCacheStats() - סטטיסטיקות cache
 *
 * פונקציות עזר:
 * - normalizeEntityData() - עיצוב נתונים אחיד
 * - confirmDeletion() - אישור מחיקה
 * - delay() - המתנה
 *
 * פונקציות גלובליות:
 * - getEntityDetails() - קבלת פרטי ישות
 * - refreshEntityData() - רענון נתוני ישות
 */
