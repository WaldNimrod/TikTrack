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
            
            if (typeof window.Logger !== 'undefined' && window.Logger.info) {
                window.Logger.info('EntityDetailsAPI initialized successfully', { page: "entity-details-api" });
            } else {
                console.log('EntityDetailsAPI initialized successfully');
            }
        } catch (error) {
            if (typeof window.Logger !== 'undefined' && window.Logger.error) {
                window.Logger.error('Error initializing EntityDetailsAPI:', error, { page: "entity-details-api" });
            } else {
                console.error('Error initializing EntityDetailsAPI:', error);
            }
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
            if (!entityType || (!entityId && entityId !== 0)) {
                throw new Error('חסרים פרמטרים: entityType ו-entityId');
            }

            // בדיקת cache אם לא נדרש refresh
            // חשוב: אם ביקשנו linked_items, נבדוק שה-cache כולל אותם
            if (!options.forceRefresh) {
                const cachedData = this.getCachedData(entityType, entityId);
                if (cachedData) {
                    // אם ביקשנו linked_items אבל הם לא ב-cache - נטען מחדש
                    const needsLinkedItems = options.includeLinkedItems !== false;
                    const hasLinkedItems = cachedData.linked_items && Array.isArray(cachedData.linked_items);
                    
                    if (needsLinkedItems && !hasLinkedItems) {
                        window.Logger.info(`🔄 Cache exists but missing linked_items for ${entityType} ${entityId}, fetching fresh data`, { 
                            cachedDataKeys: Object.keys(cachedData),
                            page: "entity-details-api" 
                        });
                        // נמשיך לטעון מחדש - לא נחזיר מה-cache
                    } else {
                        window.Logger.debug(`✅ Returning cached data for ${entityType} ${entityId}`, { 
                            hasLinkedItems,
                            linkedItemsCount: cachedData.linked_items?.length || 0,
                            page: "entity-details-api" 
                        });
                        return cachedData;
                    }
                }
            }

            window.Logger.info(`Fetching entity details for ${entityType} ${entityId}`, { page: "entity-details-api" });

            // קריאה לשרת עם retry logic
            const entityData = await this.fetchWithRetry(entityType, entityId, options);
            window.Logger.info(`📊 Entity data received:`, entityData, { page: "entity-details-api" });
            
            // טעינת פריטים מקושרים אם נדרש
            console.log(`🔍 [ENTITY-DETAILS-API] Checking linked items option for ${entityType} ${entityId}:`, {
                includeLinkedItems: options.includeLinkedItems,
                includeLinkedItemsNotFalse: options.includeLinkedItems !== false,
                willLoad: options.includeLinkedItems !== false
            });
            
            if (window.Logger) {
                window.Logger.info(`🔍 Checking linked items option for ${entityType} ${entityId}:`, {
                    includeLinkedItems: options.includeLinkedItems,
                    includeLinkedItemsNotFalse: options.includeLinkedItems !== false,
                    willLoad: options.includeLinkedItems !== false,
                    page: "entity-details-api"
                });
            }
            
            if (options.includeLinkedItems !== false) {
                try {
                    console.log(`🔗 [ENTITY-DETAILS-API] Loading linked items for ${entityType} ${entityId}...`);
                    if (window.Logger) {
                        window.Logger.info(`🔗 Loading linked items for ${entityType} ${entityId}...`, { page: "entity-details-api" });
                    }
                    const linkedItems = await this.getLinkedItems(entityType, entityId);
                    console.log(`🔗 [ENTITY-DETAILS-API] Linked items received for ${entityType} ${entityId}:`, {
                        count: linkedItems.length,
                        items: linkedItems
                    });
                    if (window.Logger) {
                        window.Logger.info(`🔗 Linked items received for ${entityType} ${entityId}:`, {
                            count: linkedItems.length,
                            items: linkedItems,
                            page: "entity-details-api"
                        });
                    }
                    entityData.linked_items = linkedItems;
                } catch (error) {
                    console.error(`❌ [ENTITY-DETAILS-API] Failed to load linked items for ${entityType} ${entityId}:`, error);
                    if (window.Logger) {
                        window.Logger.error(`❌ Failed to load linked items for ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
                    }
                    entityData.linked_items = [];
                }
            } else {
                console.log(`⏭️ [ENTITY-DETAILS-API] Skipping linked items load for ${entityType} ${entityId} (includeLinkedItems=false)`);
                if (window.Logger) {
                    window.Logger.info(`⏭️ Skipping linked items load for ${entityType} ${entityId} (includeLinkedItems=false)`, { page: "entity-details-api" });
                }
                entityData.linked_items = [];
            }
            
            // טעינת נתוני שוק אם נדרש (לטיקרים)
            if (entityType === 'ticker' && options.includeMarketData !== false) {
                try {
                    window.Logger.info(`📈 Loading market data for ${entityType} ${entityId}...`, { page: "entity-details-api" });
                    const marketData = await this.getMarketData(entityId);
                    window.Logger.info(`📈 Market data received:`, marketData, { page: "entity-details-api" });
                    if (marketData) {
                        entityData.current_price = marketData.price;
                        entityData.change_percent = marketData.change_pct_day;
                        entityData.change_amount = marketData.change_amount_day;
                        entityData.volume = marketData.volume;
                        entityData.yahoo_updated_at = marketData.fetched_at;
                        entityData.data_source = marketData.provider;
                    }
                } catch (error) {
                    window.Logger.warn(`Failed to load market data for ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
                }
            }

            // טעינת שם המטבע אם נדרש (לטיקרים)
            if (entityType === 'ticker' && entityData.currency_id) {
                try {
                    window.Logger.info(`💰 Loading currency data for currency_id ${entityData.currency_id}...`, { page: "entity-details-api" });
                    const currencyData = await this.getCurrencyData(entityData.currency_id);
                    window.Logger.info(`💰 Currency data received:`, currencyData, { page: "entity-details-api" });
                    if (currencyData) {
                        entityData.currency_name = currencyData.name;
                        entityData.currency_symbol = currencyData.symbol;
                    }
                } catch (error) {
                    window.Logger.warn(`Failed to load currency data for currency_id ${entityData.currency_id}:`, error, { page: "entity-details-api" });
                }
            }

            // טעינת נתונים על טריידים ותכנונים אם נדרש (לטיקרים)
            if (entityType === 'ticker' && options.includeLinkedItems !== false) {
                try {
                    window.Logger.info(`📊 Loading trades and plans data for ${entityType} ${entityId}...`, { page: "entity-details-api" });
                    const linkedItems = await this.getLinkedItems(entityType, entityId);
                    window.Logger.info(`📊 Linked items received:`, linkedItems, { page: "entity-details-api" });
                    
                    if (linkedItems && linkedItems.length > 0) {
                        // סינון טריידים ותכנונים
                        const trades = linkedItems.filter(item => item.type === 'trade');
                        const tradePlans = linkedItems.filter(item => item.type === 'trade_plan');
                        
                        entityData.trades_summary = trades;
                        entityData.trade_plans_summary = tradePlans;
                        
                        window.Logger.info(`📊 Trades: ${trades.length}, Trade Plans: ${tradePlans.length}`, { page: "entity-details-api" });
                    }
                } catch (error) {
                    window.Logger.warn(`Failed to load trades and plans data for ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
                }
            }
            
            // שמירה ב-cache
            this.setCachedData(entityType, entityId, entityData);
            
            return entityData;

        } catch (error) {
            window.Logger.error(`Error getting entity details for ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
            
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
                window.Logger.debug(`Fetch attempt ${attempt}/${this.retryAttempts} for ${entityType} ${entityId}`, { page: "entity-details-api" });
                
                // קריאה ישירה לAPI
                const entityData = await this.fetchEntityFromAPI(entityType, entityId);
                
                return entityData;
                
            } catch (error) {
                lastError = error;
                window.Logger.warn(`Attempt ${attempt} failed for ${entityType} ${entityId}:`, error.message, { page: "entity-details-api" });
                
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
        // השתמש ישירות ב-endpoints הקיימים (endpoint החדש לא עובד)
        try {
            return await this.fetchFromExistingEndpoints(entityType, entityId);
        } catch (error) {
            window.Logger.error(`Failed to fetch ${entityType} ${entityId}:`, error.message, { page: "entity-details-api" });
            throw error;
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
                'Accept': 'application/json'
            }
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
            trade_plan: `/api/trade_plans/${entityId}`,
            execution: `/api/executions/${entityId}`,
            account: `/api/accounts/${entityId}`,
            alert: `/api/alerts/${entityId}`,
            cash_flow: `/api/cash_flows/${entityId}`,
            note: `/api/notes/${entityId}`
        };

        const endpoint = endpointMappings[entityType];
        if (!endpoint) {
            throw new Error(`לא נמצא endpoint עבור סוג ישות: ${entityType}`);
        }

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
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
            window.Logger.warn('Entity data missing ID field:', data, { page: "entity-details-api" });
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
        
        if (!cachedEntry) return null;
        
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
            data: data,
            timestamp: Date.now()
        });
        
        window.Logger.debug(`Cached data for ${cacheKey}`, { page: "entity-details-api" });
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
            window.Logger.debug(`Cleared ${deletedCount} expired cache entries`, { page: "entity-details-api" });
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
        window.Logger.info(`Cleared ${cacheSize} cache entries`, { page: "entity-details-api" });
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
            window.Logger.debug(`Cleared cache for ${cacheKey}`, { page: "entity-details-api" });
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
            
            window.Logger.info(`Refreshed data for ${entityType} ${entityId}`, { page: "entity-details-api" });
            
            // התראת הצלחה
            if (window.showSuccessNotification) {
                window.showSuccessNotification('נתוני הישות רוענו בהצלחה');
            }
            
            return entityData;
            
        } catch (error) {
            window.Logger.error(`Error refreshing entity data for ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
            
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
        try {
            // קבלת פרטי הישות הבסיסיים
            const entityData = await this.getEntityDetails(entityType, entityId);
            
            // קבלת פריטים מקושרים
            const linkedItems = await this.getLinkedItems(entityType, entityId);
            
            // שילוב הנתונים
            entityData.linked_items = linkedItems;
            
            return entityData;
            
        } catch (error) {
            window.Logger.error(`Error getting entity with linked items for ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
            throw error;
        }
    }

    /**
     * Get linked items for entity - קבלת פריטים מקושרים לישות
     * 
     * מעודכן להשתמש ב-UnifiedCacheManager עם TTL של 5 דקות
     * 
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} options - אפשרויות (forceRefresh)
     * @returns {Promise<Array>} - Promise עם מערך פריטים מקושרים
     * @public
     */
    async getLinkedItems(entityType, entityId, options = {}) {
        const cacheKey = `linked-items-${entityType}-${entityId}`;
        
            try {
                // בדיקה במטמון אם לא forceRefresh
                if (!options.forceRefresh && window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                    const cachedData = await window.UnifiedCacheManager.get(cacheKey, {
                        layer: 'memory',
                        fallback: null
                    });
                    
                    if (cachedData !== null && Array.isArray(cachedData)) {
                        if (window.Logger) {
                            window.Logger.debug(`✅ Linked items retrieved from cache for ${entityType} ${entityId}`, {
                                count: cachedData.length,
                                page: "entity-details-api"
                            });
                        }
                        return cachedData;
                    }
                }
            
            // אם לא במטמון - טעינה מה-API
            const url = `/api/linked-items/${entityType}/${entityId}`;
            console.log(`🔗 [ENTITY-DETAILS-API] Fetching linked items from: ${url}`);
            if (window.Logger) {
                window.Logger.info(`🔗 Fetching linked items from: ${url}`, { page: "entity-details-api" });
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log(`🔗 [ENTITY-DETAILS-API] Response status: ${response.status}`);
            if (window.Logger) {
                window.Logger.info(`🔗 Response status: ${response.status}`, { page: "entity-details-api" });
            }

            if (!response.ok) {
                if (response.status === 404) {
                    window.Logger.debug(`No linked items found for ${entityType} ${entityId}`, { page: "entity-details-api" });
                        // שמירת מערך ריק במטמון גם במקרה של 404 (כדי לא לטעון שוב)
                        const emptyArray = [];
                        if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                            await window.UnifiedCacheManager.save(cacheKey, emptyArray, {
                                layer: 'memory',
                                ttl: 300000 // 5 דקות
                            });
                        }
                    return emptyArray;
                }
                throw new Error(`שגיאת שרת בקבלת פריטים מקושרים: ${response.status}`);
            }

            const data = await response.json();
            console.log(`🔗 [ENTITY-DETAILS-API] Raw linked items data:`, data);
            if (window.Logger) {
                window.Logger.info(`🔗 Raw linked items data:`, data, { page: "entity-details-api" });
            }
            
            // איחוד child_entities ו-parent_entities למערך אחד
            const allLinkedItems = [];
            
            // הוספת child_entities
            if (data && data.child_entities && Array.isArray(data.child_entities)) {
                console.log(`🔗 [ENTITY-DETAILS-API] Processing child entities:`, data.child_entities);
                if (window.Logger) {
                    window.Logger.info(`🔗 Processing child entities:`, data.child_entities, { page: "entity-details-api" });
                }
                data.child_entities.forEach(item => {
                    allLinkedItems.push({
                        id: item.id,
                        type: item.type,
                        title: item.title || `${item.type} ${item.id}`,
                        description: item.description || '',
                        status: item.status,
                        created_at: item.created_at,
                        updated_at: item.updated_at
                    });
                });
            }
            
            // הוספת parent_entities (חשוב! זה כולל trade_plan עבור trade)
            if (data && data.parent_entities && Array.isArray(data.parent_entities)) {
                console.log(`🔗 [ENTITY-DETAILS-API] Processing parent entities:`, data.parent_entities);
                if (window.Logger) {
                    window.Logger.info(`🔗 Processing parent entities:`, data.parent_entities, { page: "entity-details-api" });
                }
                data.parent_entities.forEach(item => {
                    allLinkedItems.push({
                        id: item.id,
                        type: item.type,
                        title: item.title || `${item.type} ${item.id}`,
                        description: item.description || '',
                        status: item.status,
                        created_at: item.created_at,
                        updated_at: item.updated_at
                    });
                });
            }
            
                // שמירה במטמון עם TTL של 5 דקות
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                    await window.UnifiedCacheManager.save(cacheKey, allLinkedItems, {
                        layer: 'memory',
                        ttl: 300000 // 5 דקות
                    });
                    
                    if (window.Logger) {
                        window.Logger.debug(`✅ Linked items saved to cache for ${entityType} ${entityId}`, {
                            count: allLinkedItems.length,
                            page: "entity-details-api"
                        });
                    }
                }
            
            console.log(`🔗 [ENTITY-DETAILS-API] Final linked items (${allLinkedItems.length} total):`, {
                allLinkedItems,
                childCount: data?.child_entities?.length || 0,
                parentCount: data?.parent_entities?.length || 0
            });
            if (window.Logger) {
                window.Logger.info(`🔗 Final linked items (${allLinkedItems.length} total):`, allLinkedItems, { 
                    childCount: data?.child_entities?.length || 0,
                    parentCount: data?.parent_entities?.length || 0,
                    page: "entity-details-api" 
                });
            }
            return allLinkedItems;

        } catch (error) {
            window.Logger.error(`Error getting linked items for ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
            return []; // החזר מערך ריק במקום לזרוק שגיאה
        }
    }

    /**
     * Get market data for ticker - קבלת נתוני שוק לטיקר
     * 
     * @param {number|string} tickerId - מזהה הטיקר
     * @returns {Promise<Object|null>} - Promise עם נתוני שוק או null
     * @public
     */
    async getMarketData(tickerId) {
        try {
            const url = `/api/external-data/quotes/${tickerId}`;
            window.Logger.info(`📈 Fetching market data from: ${url}`, { page: "entity-details-api" });
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            window.Logger.info(`📈 Market data response status: ${response.status}`, { page: "entity-details-api" });

            if (!response.ok) {
                if (response.status === 404 || response.status === 410) {
                    window.Logger.debug(`No market data found for ticker ${tickerId} (status: ${response.status}, { page: "entity-details-api" })`);
                    return null;
                }
                throw new Error(`שגיאת שרת בקבלת נתוני שוק: ${response.status}`);
            }

            const data = await response.json();
            window.Logger.info(`📈 Raw market data:`, data, { page: "entity-details-api" });
            
            if (data.status === 'success' && data.data) {
                return data.data;
            } else {
                window.Logger.info(`📈 No market data found`, { page: "entity-details-api" });
                return null;
            }

        } catch (error) {
            window.Logger.error(`Error getting market data for ticker ${tickerId}:`, error, { page: "entity-details-api" });
            return null; // החזר null במקום לזרוק שגיאה
        }
    }

    /**
     * Get currency data - קבלת נתוני מטבע
     * 
     * @param {number|string} currencyId - מזהה המטבע
     * @returns {Promise<Object|null>} - Promise עם נתוני מטבע או null
     * @public
     */
    async getCurrencyData(currencyId) {
        try {
            const url = `/api/currencies/${currencyId}`;
            window.Logger.info(`💰 Fetching currency data from: ${url}`, { page: "entity-details-api" });
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            window.Logger.info(`💰 Currency data response status: ${response.status}`, { page: "entity-details-api" });

            if (!response.ok) {
                if (response.status === 404) {
                    window.Logger.debug(`No currency data found for currency ${currencyId}`, { page: "entity-details-api" });
                    return null;
                }
                throw new Error(`שגיאת שרת בקבלת נתוני מטבע: ${response.status}`);
            }

            const data = await response.json();
            window.Logger.info(`💰 Raw currency data:`, data, { page: "entity-details-api" });
            
            if (data.status === 'success' && data.data) {
                return data.data;
            } else {
                window.Logger.info(`💰 No currency data found`, { page: "entity-details-api" });
                return null;
            }

        } catch (error) {
            window.Logger.error(`Error getting currency data for currency ${currencyId}:`, error, { page: "entity-details-api" });
            return null; // החזר null במקום לזרוק שגיאה
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
                window.Logger.debug(`Fetching external data for ticker ${entityData.symbol}`, { page: "entity-details-api" });
                
                // קריאה למערכת הנתונים החיצוניים
                const externalData = await window.externalDataService.getQuote(entityData.symbol);
                
                if (externalData && externalData.success && externalData.data) {
                    window.Logger.info(`External data loaded for ${entityData.symbol}`, { page: "entity-details-api" });
                    
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
                        market_status: this._determineMarketStatus(externalData.data)
                    };
                    
                    return formattedData;
                } else {
                    window.Logger.debug(`No external data available for ${entityData.symbol}`, { page: "entity-details-api" });
                    return null;
                }
                
            } else {
                window.Logger.debug('External data service not available', { page: "entity-details-api" });
                return null;
            }

        } catch (error) {
            window.Logger.warn(`Could not fetch external data for ${entityData.symbol}:`, error, { page: "entity-details-api" });
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
            window.Logger.debug('Could not determine market status:', error, { page: "entity-details-api" });
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
                    'Accept': 'application/json'
                },
                body: JSON.stringify(updateData)
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
            window.Logger.error(`Error updating entity ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
            
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
            if (!confirmed) return false;

            const url = `${this.baseUrl}/${entityType}/${entityId}`;
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
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
            window.Logger.error(`Error deleting entity ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
            
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
        return new Promise((resolve) => {
            // שימוש במערכת ההתראות הגלובלית
            if (window.showConfirmNotification) {
                window.showConfirmNotification(
                    `האם אתה בטוח שברצונך למחוק את ${entityType} #${entityId}?`,
                    'מחיקת ישות',
                    (confirmed) => resolve(confirmed)
                );
            } else {
                // fallback לconfirm רגיל
                if (typeof showConfirmationDialog === 'function') {
                    showConfirmationDialog(
                        `האם אתה בטוח שברצונך למחוק את ${entityType} #${entityId}?`,
                        () => resolve(true),
                        () => resolve(false),
                        'מחיקת ישות',
                        'מחק',
                        'ביטול'
                    );
                } else {
                    const result = window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך למחוק את ${entityType} #${entityId}?`);
                    resolve(result);
                }
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
            entries: []
        };

        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            const age = now - entry.timestamp;
            const expiresIn = this.cacheTimeout - age;
            
            stats.entries.push({
                key: key,
                age_ms: age,
                expires_in_ms: expiresIn,
                is_expired: expiresIn <= 0
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
    try {
        if (window.entityDetailsAPI) {
            return await window.entityDetailsAPI.getEntityDetails(entityType, entityId, options);
        } else {
            throw new Error('EntityDetailsAPI לא מוכן');
        }
    } catch (error) {
        window.Logger.error('Error in global getEntityDetails:', error, { page: "entity-details-api" });
        throw error;
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
    try {
        if (window.entityDetailsAPI) {
            return await window.entityDetailsAPI.refreshEntityData(entityType, entityId);
        } else {
            throw new Error('EntityDetailsAPI לא מוכן');
        }
    } catch (error) {
        window.Logger.error('Error in global refreshEntityData:', error, { page: "entity-details-api" });
        throw error;
    }
}

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize when DOM is ready - אתחול אוטומטי כשה-DOM מוכן
 */
// document.addEventListener('DOMContentLoaded', () => {
//     try {
//         // אתחול מערכת API
        new EntityDetailsAPI();
        
        window.Logger.info('Entity Details API system loaded and ready', { page: "entity-details-api" });
        
//     } catch (error) {
//         window.Logger.error('Error auto-initializing EntityDetailsAPI:', error, { page: "entity-details-api" });
//     }
// });

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