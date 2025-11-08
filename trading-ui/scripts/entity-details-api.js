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
            
            window.Logger.info('EntityDetailsAPI initialized successfully', { page: "entity-details-api" });
        } catch (error) {
            window.Logger.error('Error initializing EntityDetailsAPI:', error, { page: "entity-details-api" });
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
            
            const shouldLoadLinkedItems = options.includeLinkedItems !== false;
            if (shouldLoadLinkedItems) {
                // בדיקה אם הבאקאנד כבר החזיר linked_items (כמו עבור ticker)
                // חשוב: נבדוק אם השדה קיים גם אם הוא ריק (מערך ריק)
                const hasLinkedItemsFromBackend = entityData.linked_items !== undefined && Array.isArray(entityData.linked_items);
                
                if (hasLinkedItemsFromBackend) {
                    console.log(`✅ [ENTITY-DETAILS-API] Using linked_items from backend for ${entityType} ${entityId}:`, {
                        count: entityData.linked_items.length,
                        items: entityData.linked_items
                    });
                    if (window.Logger) {
                        window.Logger.info(`✅ Using linked_items from backend for ${entityType} ${entityId}:`, {
                            count: entityData.linked_items.length,
                            page: "entity-details-api"
                        });
                    }
                    // הבאקאנד כבר החזיר linked_items - לא צריך לטעון שוב
                } else {
                    // הבאקאנד לא החזיר linked_items - נטען בנפרד
                    try {
                        console.log(`🔗 [ENTITY-DETAILS-API] Loading linked items separately for ${entityType} ${entityId}...`);
                        if (window.Logger) {
                            window.Logger.info(`🔗 Loading linked items separately for ${entityType} ${entityId}...`, { page: "entity-details-api" });
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
                        // אם הבאקאנד החזיר linked_items ריק, נשתמש בזה
                        if (!entityData.linked_items) {
                            entityData.linked_items = [];
                        }
                    }
                }
            } else {
                console.log(`⏭️ [ENTITY-DETAILS-API] Skipping linked items load for ${entityType} ${entityId} (includeLinkedItems=false)`);
                if (window.Logger) {
                    window.Logger.info(`⏭️ Skipping linked items load for ${entityType} ${entityId} (includeLinkedItems=false)`, { page: "entity-details-api" });
                }
                entityData.linked_items = entityData.linked_items || [];
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
                const entityData = await this.fetchEntityFromAPI(entityType, entityId, options);
                
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
    async fetchEntityFromAPI(entityType, entityId, options = {}) {
        if (entityType === 'position') {
            return this.fetchPositionDetails(entityId, options);
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
            // אם נכשל, נסה את ה-endpoints הישנים כגיבוי
            window.Logger.warn(`New endpoint failed for ${entityType} ${entityId}, trying old endpoint:`, error.message, { page: "entity-details-api" });
            try {
                return await this.fetchFromExistingEndpoints(entityType, entityId);
            } catch (fallbackError) {
                window.Logger.error(`Failed to fetch ${entityType} ${entityId} from both endpoints:`, fallbackError.message, { page: "entity-details-api" });
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
            trade_plan: `/api/trade_plans/${entityId}`,
            execution: `/api/executions/${entityId}`,
            account: `/api/trading-accounts/${entityId}`,
            trading_account: `/api/trading-accounts/${entityId}`, // Alias for trading_account
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
                if (!options.forceRefresh && window.UnifiedCacheManager.initialized) {
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
                        if (window.UnifiedCacheManager.initialized) {
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
        const response = await fetch(`/api/cash_flows/${cashFlowId}`);
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