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
        this.planConditionsCache = new Map();
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
            
            if (window.Logger && typeof window.Logger.info === 'function') {
                window.Logger.info('EntityDetailsAPI initialized successfully', { page: "entity-details-api" });
            } else if (window.DEBUG_MODE) {
                console.log('EntityDetailsAPI initialized successfully');
            }
        } catch (error) {
            if (window.Logger && typeof window.Logger.error === 'function') {
                window.Logger.error('Error initializing EntityDetailsAPI:', error, { page: "entity-details-api" });
            } else if (window.DEBUG_MODE) {
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

            // קריאה לשרת עם retry logic
            const entityData = await this.fetchWithRetry(entityType, entityId, options);
            
            const shouldLoadLinkedItems = options.includeLinkedItems !== false;
            const expectedLinkedItemsCount = typeof entityData.linked_items_count === 'number'
                ? entityData.linked_items_count
                : null;
            if (shouldLoadLinkedItems) {
                // בדיקה אם הבאקאנד כבר החזיר linked_items (כמו עבור ticker)
                // חשוב: נבדוק אם השדה קיים גם אם הוא ריק (מערך ריק)
                const hasLinkedItemsFromBackend = entityData.linked_items !== undefined && Array.isArray(entityData.linked_items);
                
                if (hasLinkedItemsFromBackend) {
                    // הבאקאנד כבר החזיר linked_items - לא צריך לטעון שוב
                } else {
                    // הבאקאנד לא החזיר linked_items - נטען בנפרד
                    try {
                        const linkedItems = await this.getLinkedItems(entityType, entityId, {
                            forceRefresh: options.forceRefresh || (expectedLinkedItemsCount !== null && expectedLinkedItemsCount > 0),
                            expectedCount: expectedLinkedItemsCount
                        });
                        entityData.linked_items = linkedItems;
                    } catch (error) {
                        console.error(`❌ [ENTITY-DETAILS-API] Failed to load linked items for ${entityType} ${entityId}:`, error);
                        if (window.Logger) {
                            window.Logger.error(`❌ Failed to load linked items for ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
                        }
                        // אם הבאקאנד החזיר linked_items ריק, נשתמש בזה
                        if (!entityData.linked_items) {
                            entityData.linked_items = [];
                        }
                    }
                }
            } else {
                entityData.linked_items = entityData.linked_items || [];
            }

            // 🔧 Enrichment for trade planning data:
            // במקרה של trade, אם אין plan object/flat fields, ננסה להשלים מתוך trade_plan ב-linked_items
            if (entityType === 'trade') {
                try {
                    const hasPlanObject = !!entityData.trade_plan;
                    const hasFlatPlan = (entityData.trade_plan_planned_amount !== undefined && entityData.trade_plan_planned_amount !== null)
                        || (entityData.planned_amount !== undefined && entityData.planned_amount !== null);
                    const linked = Array.isArray(entityData.linked_items) ? entityData.linked_items : [];
                    const planItem = linked.find(it => (it && (it.type === 'trade_plan' || it.type === 'plan')));
                    
                    if ((!hasPlanObject || !hasFlatPlan) && planItem && planItem.id) {
                        // אם אין ערכים קריטיים, נטען את ה-trade_plan המלא מה-API
                        if (window.Logger) {
                            window.Logger.info('🔗 Enriching trade planning from trade_plan endpoint...', {
                                tradeId: entityId,
                                planId: planItem.id
                            }, { page: "entity-details-api" });
                        }
                        const planResp = await fetch(`/api/trade-plans/${planItem.id}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            }
                        });
                        if (planResp.ok) {
                            const planPayload = await planResp.json();
                            const planData = planPayload?.data || planPayload || null;
                            if (planData) {
                                // שמירת האובייקט המלא
                                entityData.trade_plan = entityData.trade_plan || planData;
                                // שדות שטוחים שה-Renderer יודע לקרוא מהם
                                // NO FALLBACKS - רק אם אין trade_plan_planned_amount, נשתמש בזה מהתוכנית (זה לא fallback, זה המקור האמיתי)
                                // אבל entry_price - רק מה-Trade עצמו, לא מהתוכנית!
                                // Removed: trade_plan_planned_amount fallback - זה שדה של התוכנית, לא של הטרייד
                                // Removed: entry_price fallback - רק מה-Trade עצמו
                            }
                        }
                    }
                } catch (enrichError) {
                    window.Logger?.debug('⚠️ Failed to enrich trade planning data from trade_plan', { error: enrichError?.message }, { page: "entity-details-api" });
                }
            }
            
            // טעינת נתוני שוק אם נדרש (לטיקרים)
            // הערה: EntityDetailsService כבר מחזיר נתוני שוק, אבל נטען גם מ-getMarketData
            // כדי לוודא שיש לנו את הנתונים העדכניים ביותר
            // חשוב: אם getMarketData לא מחזיר שדה מסוים, נשמור את הערך הקיים מ-EntityDetailsService
            if (entityType === 'ticker' && options.includeMarketData !== false) {
                try {
                    // שמירת הנתונים הקיימים מ-EntityDetailsService לפני עדכון
                    const existingPrice = entityData.current_price || entityData.price;
                    const existingChangePercent = entityData.change_percent || entityData.daily_change_percent;
                    const existingChangeAmount = entityData.change_amount || entityData.daily_change;
                    const existingVolume = entityData.volume;
                    const existingMarketCap = entityData.market_cap;
                    const existingYahooUpdatedAt = entityData.yahoo_updated_at;
                    const existingDataSource = entityData.data_source;
                    
                    const marketData = await this.getMarketData(entityId);
                    if (marketData) {
                        // עדכון רק אם הערך קיים (לא null/undefined) - אחרת נשמור את הערך הקיים
                        if (marketData.price !== undefined && marketData.price !== null) {
                            entityData.current_price = marketData.price;
                            entityData.price = marketData.price; // Alias
                        } else if (existingPrice !== undefined && existingPrice !== null) {
                            // שמירת הערך הקיים אם אין ערך חדש
                            entityData.current_price = existingPrice;
                            entityData.price = existingPrice;
                        }
                        
                        if (marketData.change_pct_day !== undefined && marketData.change_pct_day !== null) {
                            entityData.change_percent = marketData.change_pct_day;
                            entityData.daily_change_percent = marketData.change_pct_day;
                        } else if (existingChangePercent !== undefined && existingChangePercent !== null) {
                            entityData.change_percent = existingChangePercent;
                            entityData.daily_change_percent = existingChangePercent;
                        }
                        
                        if (marketData.change_amount_day !== undefined && marketData.change_amount_day !== null) {
                            entityData.change_amount = marketData.change_amount_day;
                            entityData.daily_change = marketData.change_amount_day;
                        } else if (existingChangeAmount !== undefined && existingChangeAmount !== null) {
                            entityData.change_amount = existingChangeAmount;
                            entityData.daily_change = existingChangeAmount;
                        }
                        
                        // Volume: עדכן רק אם יש ערך חדש, אחרת נשמור את הקיים
                        if (marketData.volume !== undefined && marketData.volume !== null) {
                            entityData.volume = marketData.volume;
                        } else if (existingVolume !== undefined && existingVolume !== null) {
                            // שמירת הערך הקיים אם אין ערך חדש
                            entityData.volume = existingVolume;
                        }
                        
                        // Market cap: עדכן רק אם יש ערך חדש, אחרת נשמור את הקיים
                        if (marketData.market_cap !== undefined && marketData.market_cap !== null) {
                            entityData.market_cap = marketData.market_cap;
                        } else if (existingMarketCap !== undefined && existingMarketCap !== null) {
                            // שמירת הערך הקיים אם אין ערך חדש
                            entityData.market_cap = existingMarketCap;
                        }
                        
                        if (marketData.fetched_at) {
                            entityData.yahoo_updated_at = marketData.fetched_at;
                        } else if (existingYahooUpdatedAt) {
                            entityData.yahoo_updated_at = existingYahooUpdatedAt;
                        }
                        
                        if (marketData.provider) {
                            entityData.data_source = marketData.provider;
                        } else if (existingDataSource) {
                            entityData.data_source = existingDataSource;
                        }
                        
                        // לוג לבדיקה
                        window.Logger.debug(`Market data merged for ticker ${entityId}`, {
                            price: entityData.current_price,
                            volume: entityData.volume,
                            market_cap: entityData.market_cap,
                            hadExistingPrice: existingPrice !== undefined && existingPrice !== null,
                            hadExistingVolume: existingVolume !== undefined && existingVolume !== null,
                            hadExistingMarketCap: existingMarketCap !== undefined && existingMarketCap !== null,
                            marketDataPrice: marketData.price,
                            marketDataVolume: marketData.volume,
                            marketDataMarketCap: marketData.market_cap,
                            page: "entity-details-api"
                        });
                    } else {
                        // אם getMarketData החזיר null, נשתמש בנתונים מה-service (כבר שמורים)
                        window.Logger.debug(`getMarketData returned null for ticker ${entityId}, preserving data from EntityDetailsService`, {
                            price: entityData.current_price || entityData.price,
                            volume: entityData.volume,
                            market_cap: entityData.market_cap,
                            page: "entity-details-api"
                        });
                    }
                } catch (error) {
                    // במקרה של שגיאה, נשמור את הנתונים הקיימים
                    window.Logger.warn(`Failed to load market data for ${entityType} ${entityId}, preserving existing data:`, error, { page: "entity-details-api" });
                }
            }

            // טעינת שם המטבע אם נדרש (לטיקרים)
            if (entityType === 'ticker' && entityData.currency_id) {
                try {
                    const currencyData = await this.getCurrencyData(entityData.currency_id);
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
                    const linkedItems = await this.getLinkedItems(entityType, entityId);
                    
                    if (linkedItems && linkedItems.length > 0) {
                        // סינון טריידים ותכנונים
                        const trades = linkedItems.filter(item => item.type === 'trade');
                        const tradePlans = linkedItems.filter(item => item.type === 'trade_plan');
                        
                        entityData.trades_summary = trades;
                        entityData.trade_plans_summary = tradePlans;
                    }
                } catch (error) {
                    window.Logger.warn(`Failed to load trades and plans data for ${entityType} ${entityId}:`, error, { page: "entity-details-api" });
                }
            }

            if (entityType === 'trade_plan') {
                try {
                    entityData.plan_conditions = await this.getTradePlanConditions(entityId, {
                        forceRefresh: options.forceRefresh
                    });
                } catch (error) {
                    window.Logger.warn(`Failed to load conditions for trade_plan ${entityId}:`, error, { page: "entity-details-api" });
                    entityData.plan_conditions = Array.isArray(entityData.plan_conditions) ? entityData.plan_conditions : [];
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
                const entityData = await this.fetchEntityFromAPI(entityType, entityId, options);
                
                return entityData;
                
            } catch (error) {
                lastError = error;
                
                // Check for 404 first - don't log or retry on entity not found
                const isNotFound = error?.message?.includes('לא נמצא') || 
                                   error?.message?.includes('not found') ||
                                   error?.message?.includes('404');
                
                if (isNotFound) {
                    // For 404 errors, only log at debug level to reduce noise
                    window.Logger.debug(`Entity ${entityType} ${entityId} not found (404), skipping retries`, { page: "entity-details-api" });
                    throw error; // Don't retry, throw immediately
                }
                
                // For other errors, log warning and retry
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
    async fetchEntityFromAPI(entityType, entityId, options = {}) {
        if (entityType === 'position') {
            return this.fetchPositionDetails(entityId, options);
        }
        
        // Import session uses a special endpoint
        if (entityType === 'import_session') {
            return this.fetchImportSessionDetails(entityId, options);
        }
        
        // נסה קודם את ה-endpoint החדש (מחזיר ticker object עם נתוני שוק)
        try {
            let entityData = await this.fetchFromNewEndpoint(entityType, entityId);

            // 🔄 Post-fetch validation for cash flows to ensure critical fields are present
            if (entityType === 'cash_flow') {
                const missingFields = this._getMissingCashFlowFields(entityData);
                if (missingFields.length > 0) {
                    const recoveryContext = {
                        entityId,
                        missingFields,
                        hasType: 'type' in entityData,
                        hasSource: 'source' in entityData,
                        hasExternalId: 'external_id' in entityData,
                        hasAccountName: 'account_name' in entityData,
                        hasCurrencySymbol: 'currency_symbol' in entityData
                    };

                    console.warn('⚠️ [CASH_FLOW_API] Critical fields missing after new endpoint fetch, attempting recovery via legacy endpoint', recoveryContext);
                    window.Logger.warn('⚠️ [CASH_FLOW_API] Missing fields after new endpoint fetch, attempting recovery', recoveryContext, { page: 'entity-details-api' });

                    try {
                        const fallbackRaw = await this.fetchFromExistingEndpoints(entityType, entityId);
                        const fallbackData = this.normalizeEntityData(entityType, fallbackRaw);
                        const recovered = [];

                        missingFields.forEach(field => {
                            if ((fallbackData[field] !== undefined && fallbackData[field] !== null) &&
                                (entityData[field] === undefined || entityData[field] === null)) {
                                entityData[field] = fallbackData[field];
                                recovered.push(field);
                            }
                        });

                        const remainingMissing = this._getMissingCashFlowFields(entityData);
                        window.Logger.info('✅ [CASH_FLOW_API] Recovery attempt completed', {
                            entityId,
                            recoveredFields: recovered,
                            remainingMissing,
                            page: 'entity-details-api'
                        });

                        if (remainingMissing.length > 0) {
                            console.warn('⚠️ [CASH_FLOW_API] Some fields remain missing after recovery attempt', {
                                entityId,
                                remainingMissing
                            });
                        }
                    } catch (recoveryError) {
                        console.error('❌ [CASH_FLOW_API] Recovery via legacy endpoint failed', recoveryError);
                        window.Logger.error('❌ [CASH_FLOW_API] Recovery via legacy endpoint failed', recoveryError, { page: 'entity-details-api' });
                    }
                }
            }

            return entityData;
        } catch (error) {
            // Check if it's a 404 error before trying fallback
            const isNotFound = error?.message?.includes('לא נמצא') || 
                               error?.message?.includes('not found') ||
                               error?.message?.includes('404');
            
            if (isNotFound && options.skipRetryOn404) {
                // If skipRetryOn404 is set and it's a 404, don't try fallback endpoints
                window.Logger.debug(`Entity ${entityType} ${entityId} not found (404), skipping fallback endpoints`, { page: "entity-details-api" });
                throw error;
            }
            
            // אם נכשל, נסה את ה-endpoints הישנים כגיבוי
            if (!isNotFound) {
                window.Logger.warn(`New endpoint failed for ${entityType} ${entityId}, trying old endpoint:`, error.message, { page: "entity-details-api" });
            } else {
                window.Logger.debug(`New endpoint returned 404 for ${entityType} ${entityId}, trying old endpoint`, { page: "entity-details-api" });
            }
            
            try {
                return await this.fetchFromExistingEndpoints(entityType, entityId);
            } catch (fallbackError) {
                const fallbackIsNotFound = fallbackError?.message?.includes('לא נמצא') || 
                                           fallbackError?.message?.includes('not found') ||
                                           fallbackError?.message?.includes('404');
                
                if (fallbackIsNotFound) {
                    // For 404 errors, only log at debug level
                    window.Logger.debug(`Entity ${entityType} ${entityId} not found (404) in both endpoints`, { page: "entity-details-api" });
                } else {
                    // For other errors, log as error
                    window.Logger.error(`Failed to fetch ${entityType} ${entityId} from both endpoints:`, fallbackError.message, { page: "entity-details-api" });
                }
                throw fallbackError;
            }
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

        const entityData = data.data;
        
        // לוג לבדיקה - מה מגיע מה-endpoint החדש
        if (entityType === 'trade_plan' && entityData) {
            console.log('🔍🔍🔍 [fetchFromNewEndpoint] trade_plan data received:', {
                hasTicker: !!entityData.ticker,
                tickerKeys: entityData.ticker ? Object.keys(entityData.ticker) : [],
                tickerData: entityData.ticker ? JSON.stringify(entityData.ticker, null, 2) : null
            });
        }
        
        // 🔍 DEBUG: Log for cash flows from new endpoint
        if (entityType === 'cash_flow') {
            console.group('🔍 [CASH_FLOW_API] New Endpoint Response');
            console.log('URL:', url);
            console.log('Response Status:', response.status);
            console.log('Raw Data:', data);
            console.log('Entity Data:', entityData);
            if (entityData) {
                console.log('Entity Data Keys:', Object.keys(entityData));
                console.log('Has flow_type:', 'flow_type' in entityData);
                console.log('Has flow_date:', 'flow_date' in entityData);
                console.log('Has type:', 'type' in entityData);
                console.log('Has date:', 'date' in entityData);
                console.log('Has account_name:', 'account_name' in entityData);
                console.log('Has currency_symbol:', 'currency_symbol' in entityData);
            }
            console.groupEnd();
        }

        return this.normalizeEntityData(entityType, entityData);
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
            account: `/api/trading-accounts/${entityId}`,
            trading_account: `/api/trading-accounts/${entityId}`, // Alias for trading_account
            alert: `/api/alerts/${entityId}`,
            cash_flow: `/api/cash-flows/${entityId}`,
            note: `/api/notes/${entityId}`,
            import_session: `/api/user-data-import/session/${entityId}`
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
        
        // 🔍 DEBUG: Log raw API response for cash flows
        if (entityType === 'cash_flow') {
            console.group('🔍 [CASH_FLOW_API] Raw API Response');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
            console.log('Raw Data:', data);
            console.log('Data Field:', data.data);
            console.log('Normalized Data:', data.data || data);
            if (data.data) {
                console.log('Data Keys:', Object.keys(data.data));
                console.log('Account Name:', data.data.account_name);
                console.log('Currency Symbol:', data.data.currency_symbol);
                console.log('Type:', data.data.type);
                console.log('Source:', data.data.source);
                console.log('External ID:', data.data.external_id);
            }
            console.groupEnd();
            if (window.Logger) {
                window.Logger.debug('🔍 [CASH_FLOW_API] Raw API response:', {
                    status: response.status,
                    statusText: response.statusText,
                    rawData: data,
                    dataField: data.data,
                    normalizedData: data.data || data
                }, { page: 'entity-details-api' });
            }
        }
        
        // עיצוב נתונים אחיד
        return this.normalizeEntityData(entityType, data);
    }

    /**
     * Fetch position details (composite key: accountId+tickerId)
     * @param {string} entityId - composite identifier (accountId-tickerId)
     * @param {Object} options - Additional options (expects accountId/tickerId under positionContext)
     * @returns {Promise<Object>} - Position details payload
     * @private
     */
    async fetchPositionDetails(entityId, options = {}) {
        const { accountId, tickerId } = this._resolvePositionIdentifiers(entityId, options);

        if (!accountId || !tickerId) {
            throw new Error('position identifier missing accountId or tickerId');
        }

        const url = `/api/positions/${accountId}/${tickerId}/details`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`פוזיציה לא נמצאה עבור חשבון ${accountId} וטיקר ${tickerId}`);
            }
            throw new Error(`שגיאת שרת: ${response.status} ${response.statusText}`);
        }

        const payload = await response.json();
        const positionData = payload?.data || null;

        if (!positionData) {
            throw new Error('השרת החזיר נתונים ריקים עבור פרטי פוזיציה');
        }

        const compositeId = `${accountId}-${tickerId}`;
        positionData.id = compositeId;
        positionData.entity_type = 'position';
        positionData.account_id = positionData.account_id || accountId;
        positionData.ticker_id = positionData.ticker_id || tickerId;

        // Ensure executions data exists for sorting
        if (Array.isArray(positionData.executions)) {
            positionData.executions = positionData.executions.map(exec => ({
                ...exec,
                date: exec.date || exec.execution_date || exec.created_at || null,
                total: (exec.quantity * exec.price) + (exec.fee || 0)
            }));
        } else {
            positionData.executions = [];
        }

        // Ensure linked items array (positions currently lack linked items endpoint)
        if (!Array.isArray(positionData.linked_items)) {
            positionData.linked_items = [];
        }

        return positionData;
    }

    /**
     * Fetch import session details - קריאת פרטי סשן ייבוא
     * @param {number|string} entityId - Session ID
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Import session details payload
     * @private
     */
    async fetchImportSessionDetails(entityId, options = {}) {
        const url = `/api/user-data-import/session/${entityId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`סשן ייבוא עם מזהה ${entityId} לא נמצא`);
            }
            throw new Error(`שגיאת שרת: ${response.status} ${response.statusText}`);
        }

        const payload = await response.json();
        
        // The API returns { success: true, session: {...} } or { status: 'success', session: {...} }
        const sessionData = payload.session || payload.data || payload;
        
        if (!sessionData) {
            throw new Error('השרת החזיר נתונים ריקים עבור פרטי סשן ייבוא');
        }

        // Normalize the data structure
        const normalizedData = {
            ...sessionData,
            id: sessionData.id || entityId,
            entity_type: 'import_session',
            type: 'import_session'
        };

        // Ensure linked items array (import sessions may have linked cash flows, executions, etc.)
        if (!Array.isArray(normalizedData.linked_items)) {
            normalizedData.linked_items = [];
        }

        return normalizedData;
    }

    /**
     * Resolve accountId/tickerId for position entity
     * @param {string} entityId
     * @param {Object} options
     * @returns {{accountId: number|null, tickerId: number|null}}
     * @private
     */
    _resolvePositionIdentifiers(entityId, options = {}) {
        let accountId = null;
        let tickerId = null;

        if (options.positionContext) {
            const ctx = options.positionContext;
            if (ctx.accountId) {
                accountId = Number(ctx.accountId);
            }
            if (ctx.tickerId) {
                tickerId = Number(ctx.tickerId);
            }
        }

        if ((!accountId || !tickerId) && typeof entityId === 'string') {
            const parts = entityId.split(/[:|-]/);
            if (parts.length >= 2) {
                const maybeAccount = Number(parts[0]);
                const maybeTicker = Number(parts[1]);
                if (!accountId && !Number.isNaN(maybeAccount)) {
                    accountId = maybeAccount;
                }
                if (!tickerId && !Number.isNaN(maybeTicker)) {
                    tickerId = maybeTicker;
                }
            }
        }

        if ((!accountId || !tickerId) && options.accountId && options.tickerId) {
            accountId = Number(options.accountId);
            tickerId = Number(options.tickerId);
        }

        return {
            accountId: !Number.isNaN(accountId) && accountId ? Number(accountId) : null,
            tickerId: !Number.isNaN(tickerId) && tickerId ? Number(tickerId) : null
        };
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
        
        // 🔍 DEBUG: Log provider_symbols for tickers
        if (entityType === 'ticker') {
            if (window.Logger) {
                window.Logger.debug('🔍 [normalizeEntityData] Ticker provider symbols check:', {
                    hasProviderSymbols: 'provider_symbols' in data,
                    providerSymbolsType: typeof data.provider_symbols,
                    providerSymbolsIsArray: Array.isArray(data.provider_symbols),
                    providerSymbolsCount: (data.provider_symbols || []).length,
                    providerSymbols: data.provider_symbols,
                    tickerId: data.id,
                    tickerSymbol: data.symbol,
                    page: 'entity-details-api'
                });
            }
        }
        
        // 🔍 DEBUG: Log normalization for cash flows
        if (entityType === 'cash_flow') {
            console.group('🔍 [CASH_FLOW_NORMALIZE] Before Normalization');
            console.log('Raw Data:', rawData);
            console.log('Extracted Data:', data);
            console.log('Has Data Field:', !!rawData.data);
            console.log('Has flow_type:', 'flow_type' in data);
            console.log('Has flow_date:', 'flow_date' in data);
            console.log('Has type:', 'type' in data);
            console.log('Has date:', 'date' in data);
            console.groupEnd();
            if (window.Logger) {
                window.Logger.debug('🔍 [CASH_FLOW_NORMALIZE] Before normalization:', {
                    rawData: rawData,
                    extractedData: data,
                    hasDataField: !!rawData.data,
                    hasFlowType: 'flow_type' in data,
                    hasFlowDate: 'flow_date' in data
                }, { page: 'entity-details-api' });
            }
        }
        
        // 🔧 FIX: Transform flow_type/flow_date to type/date for cash flows
        if (entityType === 'cash_flow') {
            if (data.flow_type !== undefined && data.type === undefined) {
                data.type = data.flow_type;
                console.log('🔧 [CASH_FLOW_NORMALIZE] Transformed flow_type to type:', data.type);
            }
            if (data.flow_date !== undefined && data.date === undefined) {
                data.date = data.flow_date;
                console.log('🔧 [CASH_FLOW_NORMALIZE] Transformed flow_date to date:', data.date);
            }

            if (!data.account_name) {
                if (data.trading_account_name) {
                    data.account_name = data.trading_account_name;
                } else if (data.account && data.account.name) {
                    data.account_name = data.account.name;
                }
            }

            if (!data.currency_symbol) {
                if (data.currency && data.currency.symbol) {
                    data.currency_symbol = data.currency.symbol;
                } else if (data.currency_code) {
                    data.currency_symbol = data.currency_code;
                } else if (data.currency_id && window.getCurrencyDisplay) {
                    try {
                        const currencyInfo = window.getCurrencyDisplay(data.currency_id);
                        if (currencyInfo && currencyInfo.symbol) {
                            data.currency_symbol = currencyInfo.symbol;
                        }
                    } catch (error) {
                        window.Logger.warn('⚠️ [CASH_FLOW_NORMALIZE] Failed to resolve currency symbol', error, { page: 'entity-details-api' });
                    }
                }
            }

            if (!data.source) {
                data.source = 'manual';
            }

            if (data.status === undefined || data.status === null) {
                delete data.status;
            }

            if (!data.external_id) {
                data.external_id = null;
            }
        }
        
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

        // 🔍 DEBUG: Log after normalization for cash flows
        if (entityType === 'cash_flow') {
            console.group('🔍 [CASH_FLOW_NORMALIZE] After Normalization');
            console.log('Normalized Data:', data);
            console.log('ID:', data.id);
            console.log('Type:', data.type);
            console.log('Account Name:', data.account_name);
            console.log('Currency Symbol:', data.currency_symbol);
            console.log('Source:', data.source);
            console.log('External ID:', data.external_id);
            console.log('Status:', data.status);
            console.log('Date:', data.date);
            console.log('All Keys:', Object.keys(data));
            console.groupEnd();
            if (window.Logger) {
                window.Logger.debug('🔍 [CASH_FLOW_NORMALIZE] After normalization:', {
                    normalizedData: data,
                    id: data.id,
                    type: data.type,
                    account_name: data.account_name,
                    currency_symbol: data.currency_symbol,
                    source: data.source,
                    external_id: data.external_id,
                    allKeys: Object.keys(data)
                }, { page: 'entity-details-api' });
            }
        }

        return data;
    }

    /**
     * Identify missing critical fields for cash flow entities
     * @param {Object} entityData - normalized entity data
     * @returns {Array<string>} - list of fields missing (undefined/null)
     * @private
     */
    _getMissingCashFlowFields(entityData) {
        if (!entityData || typeof entityData !== 'object') {
            return ['type', 'source', 'external_id', 'account_name', 'currency_symbol'];
        }

        const criticalFields = ['type', 'source', 'external_id', 'account_name', 'currency_symbol', 'currency_name'];

        return criticalFields.filter(field => entityData[field] === undefined || entityData[field] === null);
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

        for (const [key, entry] of this.planConditionsCache.entries()) {
            if (now - entry.timestamp > this.cacheTimeout) {
                this.planConditionsCache.delete(key);
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
        const conditionsSize = this.planConditionsCache.size;
        this.planConditionsCache.clear();
        window.Logger.info(`Cleared ${cacheSize} entity cache entries and ${conditionsSize} plan conditions entries`, { page: "entity-details-api" });
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

        if (entityType === 'trade_plan') {
            const conditionsKey = this.getPlanConditionsCacheKey(entityId);
            if (this.planConditionsCache.delete(conditionsKey)) {
                window.Logger.debug(`Cleared plan conditions cache for ${conditionsKey}`, { page: "entity-details-api" });
            }
        }
    }

    /**
     * Get cache key for plan conditions
     * @param {number|string} tradePlanId
     * @returns {string}
     * @private
     */
    getPlanConditionsCacheKey(tradePlanId) {
        return `trade_plan_conditions_${tradePlanId}`;
    }

    /**
     * Load trade plan conditions for entity details
     * @param {number|string} tradePlanId
     * @param {Object} options
     * @returns {Promise<Array>}
     * @private
     */
    async getTradePlanConditions(tradePlanId, options = {}) {
        if (!tradePlanId && tradePlanId !== 0) {
            return [];
        }

        const cacheKey = this.getPlanConditionsCacheKey(tradePlanId);

        if (!options.forceRefresh && this.planConditionsCache.has(cacheKey)) {
            const cached = this.planConditionsCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                window.Logger.debug(`Using cached plan conditions for ${tradePlanId}`, { page: "entity-details-api" });
                return cached.data;
            }
        }

        try {
            window.Logger.info(`Loading plan conditions for trade_plan ${tradePlanId}`, { page: "entity-details-api" });
            const response = await fetch(`/api/plan-conditions/trade-plans/${tradePlanId}/conditions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`שגיאה בטעינת תנאים (status ${response.status})`);
            }

            const payload = await response.json();
            if (payload?.status !== 'success') {
                throw new Error(payload?.message || 'שגיאה בטעינת תנאים');
            }

            const conditions = Array.isArray(payload.data) ? payload.data : [];

            this.planConditionsCache.set(cacheKey, {
                data: conditions,
                timestamp: Date.now()
            });

            window.Logger.info(`Loaded ${conditions.length} plan conditions for trade_plan ${tradePlanId}`, { page: "entity-details-api" });
            return conditions;
        } catch (error) {
            window.Logger.error(`Failed to load plan conditions for trade_plan ${tradePlanId}:`, error, { page: "entity-details-api" });
            throw error;
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
        const expectedCount = typeof options.expectedCount === 'number' ? options.expectedCount : null;
        
        try {
            // בדיקה במטמון אם לא forceRefresh
            if (!options.forceRefresh && window.UnifiedCacheManager.initialized) {
                const cachedData = await window.UnifiedCacheManager.get(cacheKey, {
                    layer: 'memory',
                    fallback: null
                });
                
                if (cachedData !== null && Array.isArray(cachedData)) {
                    const cachedCount = cachedData.length;
                    const cacheMatchesExpectation = expectedCount === null || expectedCount === cachedCount;
                    
                    if (cacheMatchesExpectation) {
                        if (window.Logger) {
                            window.Logger.debug(`✅ Linked items retrieved from cache for ${entityType} ${entityId}`, {
                                count: cachedCount,
                                expectedCount,
                                page: "entity-details-api"
                            });
                        }
                        return cachedData;
                    }
                    
                    // אם כמות הפריטים במטמון לא תואמת את מה שהשרת מבטיח, נרענן
                    if (window.Logger) {
                        window.Logger.info(`🔄 Cache mismatch for ${entityType} ${entityId} (cached=${cachedCount}, expected=${expectedCount}) - refreshing from API`, {
                            page: "entity-details-api"
                        });
                    }
                }
            }
        
            // אם לא במטמון - טעינה מה-API
            const url = `/api/linked-items/${entityType}/${entityId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    window.Logger.debug(`No linked items found for ${entityType} ${entityId}`, { page: "entity-details-api" });
                        // שמירת מערך ריק במטמון גם במקרה של 404 (כדי לא לטעון שוב)
                        const emptyArray = [];
                        if (window.UnifiedCacheManager.initialized) {
                            await window.UnifiedCacheManager.save(cacheKey, emptyArray, {
                                layer: 'memory',
                                ttl: 300000 // 5 דקות
                            });
                        }
                    return emptyArray;
                }
                // Handle 429 (Too Many Requests) gracefully - return empty array instead of throwing
                if (response.status === 429) {
                    window.Logger.warn(`⚠️ Rate limit exceeded for linked items ${entityType} ${entityId} - returning empty array`, { page: "entity-details-api" });
                    // Save empty array to cache to prevent repeated requests
                    const emptyArray = [];
                    if (window.UnifiedCacheManager.initialized) {
                        await window.UnifiedCacheManager.save(cacheKey, emptyArray, {
                            layer: 'memory',
                            ttl: 60000 // 1 minute - shorter TTL for rate limit errors
                        });
                    }
                    return emptyArray;
                }
                throw new Error(`שגיאת שרת בקבלת פריטים מקושרים: ${response.status}`);
            }

            const data = await response.json();
            
            const enrichLinkedItems = (items, direction) => {
                if (!Array.isArray(items)) {
                    return [];
                }
                return items.map(item => {
                    const enrichedItem = { ...item };
                    const metrics = item.metrics || {};
                    const conditions = item.conditions || {};
                    const timestamps = item.timestamps || {};
                    const statusObject = item.status;

                    if (!enrichedItem.link_direction) {
                        enrichedItem.link_direction = direction;
                    }

                    // שמירה על התאמה לאחור - העדפה לנתונים החדשים אם קיימים
                    if (statusObject && typeof statusObject === 'object') {
                        enrichedItem.status = statusObject.value ?? statusObject.status ?? enrichedItem.status;
                    }
                    enrichedItem.side = metrics.side ?? enrichedItem.side;
                    enrichedItem.investment_type = metrics.investment_type ?? enrichedItem.investment_type;
                    if (metrics.quantity !== undefined) {
                        enrichedItem.quantity = metrics.quantity;
                    }
                    if (metrics.price !== undefined) {
                        enrichedItem.price = metrics.price;
                    }
                    if (metrics.amount !== undefined) {
                        enrichedItem.amount = metrics.amount;
                    }

                    if (conditions.trigger_type !== undefined) {
                        enrichedItem.condition = conditions.trigger_type;
                    }
                    if (conditions.target_value !== undefined) {
                        enrichedItem.target_value = conditions.target_value;
                    }

                    if (!enrichedItem.created_at && timestamps.created_at) {
                        enrichedItem.created_at = timestamps.created_at;
                    }
                    if (!enrichedItem.updated_at && timestamps.updated_at) {
                        enrichedItem.updated_at = timestamps.updated_at;
                    }
                    if (!enrichedItem.closed_at && timestamps.closed_at) {
                        enrichedItem.closed_at = timestamps.closed_at;
                    }

                    // מידע מתצוגה חדשה
                    const display = item.display || {};
                    if (!enrichedItem.title && display.title) {
                        enrichedItem.title = display.title;
                    }
                    if (!enrichedItem.name && display.name) {
                        enrichedItem.name = display.name;
                    }
                    if (!enrichedItem.description && display.description) {
                        enrichedItem.description = display.description;
                    }

                    return enrichedItem;
                });
            };

            const childLinkedItems = enrichLinkedItems(data?.child_entities, 'child');
            const parentLinkedItems = enrichLinkedItems(data?.parent_entities, 'parent');
            const allLinkedItems = [...childLinkedItems, ...parentLinkedItems];

                // שמירה במטמון עם TTL של 5 דקות
                if (window.UnifiedCacheManager.initialized) {
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
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                // Try to get error details from response
                let errorMessage = `שגיאת שרת בקבלת נתוני שוק: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                    if (errorData.suggestion) {
                        errorMessage += ` (${errorData.suggestion})`;
                    }
                } catch (e) {
                    // If response is not JSON, use default message
                }
                
                // For 404/410, return null (no data available) - this is expected
                if (response.status === 404 || response.status === 410) {
                    window.Logger.debug(`Market data not available for ticker ${tickerId}: ${errorMessage}`, { 
                        status: response.status,
                        page: "entity-details-api" 
                    });
                    return null;
                }
                
                // For other errors, log and return null (graceful degradation)
                window.Logger.warn(`Error getting market data for ticker ${tickerId}: ${errorMessage}`, { 
                    status: response.status,
                    page: "entity-details-api" 
                });
                return null;
            }

            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                return data.data;
            } else {
                // Log if response format is unexpected
                window.Logger.debug(`Unexpected response format for ticker ${tickerId}`, { 
                    status: data.status,
                    hasData: !!data.data,
                    page: "entity-details-api" 
                });
                return null;
            }

        } catch (error) {
            window.Logger.error(`Error getting market data for ticker ${tickerId}:`, error, { page: "entity-details-api" });
            return null; // החזר null במקום לזרוק שגיאה - graceful degradation
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
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`שגיאת שרת בקבלת נתוני מטבע: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                return data.data;
            } else {
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

            // Use direct entity API endpoint to avoid 302 redirect
            // entity-details API returns 302 redirect, so we use the actual endpoint directly
            const directUrl = `/api/${entityType}s/${entityId}`;
            
            const response = await fetch(directUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || errorData.message || `שגיאה במחיקה: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
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
                        'מחיקת ישות',  // title
                        `האם אתה בטוח שברצונך למחוק את ${entityType} #${entityId}?`,  // message
                        () => resolve(true),  // onConfirm
                        () => resolve(false),  // onCancel
                        'danger'  // color
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
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 20
 * 
 * INITIALIZATION (2)
 * - constructor() - אתחול מחלקת EntityDetailsAPI
 * - init() - אתחול מערכת API וניקוי cache
 * 
 * MAIN API METHODS (3)
 * - getEntityDetails() - קבלת פרטי ישות מהשרת עם caching
 * - refreshEntityData() - רענון נתוני ישות (force refresh)
 * - updateEntityData() - עדכון נתוני ישות בשרת
 * - deleteEntity() - מחיקת ישות מהשרת
 * 
 * FETCH METHODS (5)
 * - fetchWithRetry() - קריאה עם retry logic (3 ניסיונות)
 * - fetchEntityFromAPI() - קריאת ישות מ-API (מנהל endpoints שונים)
 * - fetchFromNewEndpoint() - קריאה מ-endpoint חדש (/api/entity-details/)
 * - fetchFromExistingEndpoints() - קריאה מ-endpoints קיימים (legacy)
 * - fetchPositionDetails() - קריאת פרטי פוזיציה (composite ID)
 * 
 * LINKED ITEMS & EXTERNAL DATA (3)
 * - getEntityWithLinkedItems() - קבלת ישות עם פריטים מקושרים
 * - getLinkedItems() - קבלת פריטים מקושרים בלבד
 * - getExternalData() - קבלת נתונים חיצוניים (Yahoo Finance)
 * 
 * MARKET & CURRENCY DATA (2)
 * - getMarketData() - קבלת נתוני שוק לטיקר
 * - getCurrencyData() - קבלת נתוני מטבע
 * 
 * CACHE MANAGEMENT (6)
 * - getCachedData() - קבלת נתונים מ-cache
 * - setCachedData() - שמירת נתונים ב-cache
 * - clearExpiredCache() - ניקוי cache פג תוקף
 * - clearCache() - ניקוי כל ה-cache
 * - clearEntityCache() - ניקוי cache לישות ספציפית
 * - getCacheStats() - סטטיסטיקות cache
 * 
 * DATA NORMALIZATION & HELPERS (3)
 * - normalizeEntityData() - עיצוב נתונים אחיד (flow_type→type, flow_date→date)
 * - _getMissingCashFlowFields() - זיהוי שדות חסרים בתזרים מזומנים
 * - _resolvePositionIdentifiers() - פירוק composite ID לפוזיציה
 * - _determineMarketStatus() - קביעת סטטוס שוק לפי נתונים חיצוניים
 * - confirmDeletion() - אישור מחיקה עם confirmation dialog
 * - delay() - פונקציית עזר להמתנה
 * 
 * GLOBAL FUNCTIONS (2)
 * - getEntityDetails() - פונקציה גלובלית לקבלת פרטי ישות
 * - refreshEntityData() - פונקציה גלובלית לרענון נתוני ישות
 * - debugCashFlow() - פונקציה גלובלית לניטור נתוני תזרים מזומנים
 * 
 * ==========================================
 */

/**
 * Debug cash flow data - פונקציה גלובלית לניטור נתוני תזרים מזומנים
 * 
 * @param {number} cashFlowId - מזהה תזרים מזומנים
 * @returns {Promise<void>}
 * 
 * @example
 * // בקונסול:
 * await debugCashFlow(13);
 */
window.debugCashFlow = async function(cashFlowId) {
    console.group(`🔍 [DEBUG] Cash Flow #${cashFlowId}`);
    
    try {
        // 1. Fetch from API
        console.log('📡 Step 1: Fetching from API...');
        const response = await fetch(`/api/cash-flows/${cashFlowId}`);
        const apiData = await response.json();
        console.log('✅ API Response:', apiData);
        console.log('📊 API Data Field:', apiData.data);
        
        // 2. Get via EntityDetailsAPI
        console.log('\n📡 Step 2: Fetching via EntityDetailsAPI...');
        if (window.entityDetailsAPI) {
            const entityData = await window.entityDetailsAPI.getEntityDetails('cash_flow', cashFlowId, { forceRefresh: true });
            console.log('✅ Entity Details:', entityData);
            
            // 3. Check specific fields
            console.log('\n📋 Step 3: Field Check:');
            console.table({
                'ID': entityData.id || '❌ MISSING',
                'Type': entityData.type || '❌ MISSING',
                'Amount': entityData.amount || '❌ MISSING',
                'Status': entityData.status || '❌ MISSING',
                'Source': entityData.source || '❌ MISSING',
                'External ID': entityData.external_id || '❌ MISSING',
                'Date': entityData.date || '❌ MISSING',
                'Trading Account ID': entityData.trading_account_id || '❌ MISSING',
                'Account Name': entityData.account_name || '❌ MISSING',
                'Trading Account Name': entityData.trading_account_name || '❌ MISSING',
                'Currency ID': entityData.currency_id || '❌ MISSING',
                'Currency Symbol': entityData.currency_symbol || '❌ MISSING',
                'Currency Code': entityData.currency_code || '❌ MISSING',
                'Account Object': entityData.account ? '✅ EXISTS' : '❌ MISSING',
                'Currency Object': entityData.currency ? '✅ EXISTS' : '❌ MISSING',
                'Trading Account Object': entityData.trading_account ? '✅ EXISTS' : '❌ MISSING'
            });
            
            // 4. Check nested objects
            if (entityData.account) {
                console.log('\n📦 Account Object:', entityData.account);
            }
            if (entityData.currency) {
                console.log('\n📦 Currency Object:', entityData.currency);
            }
            if (entityData.trading_account) {
                console.log('\n📦 Trading Account Object:', entityData.trading_account);
            }
            
            // 5. All keys
            console.log('\n🔑 All Keys:', Object.keys(entityData));
            
            // 6. Full object
            console.log('\n📦 Full Entity Data Object:', entityData);
            
        } else {
            console.error('❌ EntityDetailsAPI not available');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
    
    console.groupEnd();
    
    return {
        message: 'Debug complete. Check console for details.',
        cashFlowId: cashFlowId
    };
};

/**
 * Debug trade details - פונקציה גלובלית לניטור נתוני טרייד
 * 
 * שימוש: בקונסול
 *   await debugTrade(30)
 * 
 * תדפיס:
 * - תמצית מה-GET הישן (/api/trades/{id})
 * - תמצית מה-EntityDetailsAPI (כולל linked_items)
 * - טבלת שדות קריטיים לתכנון/פוזיציה כפי שה-Renderer משתמש בהם
 */
window.debugTrade = async function(tradeId) {
    console.group(`🔍 [DEBUG] Trade #${tradeId}`);
    try {
        // 1) Raw API
        console.log('📡 Step 1: GET /api/trades/{id}');
        const r1 = await fetch(`/api/trades/${tradeId}`);
        const j1 = await r1.json().catch(() => ({}));
        const d1 = j1?.data || j1 || null;
        console.log('✅ API Response (raw):', j1);
        if (d1) {
            console.table({
                id: d1.id,
                trade_plan_id: d1.trade_plan_id,
                trade_plan_planned_amount: d1.trade_plan_planned_amount,
                planned_amount: d1.planned_amount,
                entry_price: d1.entry_price,
                current_price: d1.current_price,
                has_trade_plan_obj: !!d1.trade_plan,
                linked_items_count: Array.isArray(d1.linked_items) ? d1.linked_items.length : 0
            });
        }

        // 2) Via EntityDetailsAPI
        console.log('\n📡 Step 2: EntityDetailsAPI.getEntityDetails(trade, includeLinkedItems=true)');
        const d2 = await (window.entityDetailsAPI
            ? window.entityDetailsAPI.getEntityDetails('trade', tradeId, { includeLinkedItems: true, forceRefresh: true })
            : Promise.reject(new Error('EntityDetailsAPI not available')));
        console.log('✅ Entity Details:', d2);
        console.table({
            id: d2.id,
            trade_plan_id: d2.trade_plan_id,
            trade_plan_planned_amount: d2.trade_plan_planned_amount,
            planned_amount: d2.planned_amount,
            entry_price: d2.entry_price,
            current_price: d2.current_price,
            has_trade_plan_obj: !!d2.trade_plan,
            linked_items_count: Array.isArray(d2.linked_items) ? d2.linked_items.length : 0
        });

        // 3) Extract planned fields as renderer would
        console.log('\n🧮 Step 3: Renderer inputs (planning calc)');
        const pick = (obj, key, fallback = 0) => {
            const v = obj && obj[key];
            return (v === undefined || v === null) ? fallback : v;
        };
        const fromObj = d2.trade_plan ? {
            plannedAmount: Number(pick(d2.trade_plan, 'planned_amount')),
            targetPrice: Number(pick(d2.trade_plan, 'target_price'))
        } : null;
        const flatPlannedAmount = Number(d2.trade_plan_planned_amount || d2.planned_amount || 0);
        const flatEntryPrice = Number(d2.entry_price || 0);
        let liPlan = null;
        if (Array.isArray(d2.linked_items)) {
            liPlan = d2.linked_items.find(x => (x.type === 'trade_plan' || x.type === 'plan')) || null;
        }
        const liPlannedAmount = Number(
            (liPlan && (liPlan.planned_amount || liPlan.amount || (liPlan.metrics && liPlan.metrics.amount))) || 0
        );
        const liEntryPrice = Number(
            (liPlan && (liPlan.entry_price || liPlan.target_price)) || 0
        );
        console.table({
            fromPlanObject_plannedAmount: fromObj ? fromObj.plannedAmount : 'N/A',
            fromPlanObject_targetPrice: fromObj ? fromObj.targetPrice : 'N/A',
            flat_plannedAmount: flatPlannedAmount,
            flat_entryPrice: flatEntryPrice,
            linkedItem_plannedAmount: liPlannedAmount,
            linkedItem_entryPrice: liEntryPrice
        });

        // 4) Decision tree summary
        console.log('\n🧭 Step 4: Decision tree');
        if (fromObj && fromObj.plannedAmount > 0 && fromObj.targetPrice > 0) {
            console.log('➡️ Renderer uses plan object (planned_amount / target_price).');
        } else if (flatPlannedAmount > 0 && flatEntryPrice > 0) {
            console.log('➡️ Renderer uses flat fields (trade_plan_planned_amount/planned_amount + entry_price).');
        } else if (liPlannedAmount > 0 && (liEntryPrice > 0 || flatEntryPrice > 0)) {
            console.log('➡️ Renderer uses linked_items plan fallback.');
        } else {
            console.warn('❌ No valid planning source detected (all sources empty).');
        }
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
    console.groupEnd();
    return { ok: true };
};