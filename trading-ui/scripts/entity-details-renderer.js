/**
 * Entity Details Renderer - TikTrack Entity Details Rendering System
 * =================================================================
 *
 * מערכת רנדור מתקדמת לתצוגת פרטי ישויות במערכת TikTrack
 *
 * תכונות עיקריות:
 * - רנדור מותאם אישית לכל סוג ישות
 * - תמיכה ב-RTL ועיצוב מתקדם
 * - אינטגרציה עם מערכת הצבעים מ-preferences
 * - הצגת פריטים מקושרים ונתונים חיצוניים
 * - responsive design עם Apple Design System
 * - מערכת פילטר מתקדמת לכל עמוד (ינואר 2025)
 *   כל עמוד יכול להגדיר איזה כפתורי פילטר להציג/להסתיר
 *
 * קובץ: trading-ui/scripts/entity-details-renderer.js
 * גרסה: 1.0.0
 * יוצר: Nimrod
 * תאריך יצירה: 4 בספטמבר 2025
 *
 * תלויות:
 * - entity-details-api.js (נתוני API)
 * - linked-items.js (פריטים מקושרים)
 * - notification-system.js (התראות גלובליות)
 *
 * דוקומנטציה: documentation/features/entity-details-system/README.md
 */

// ===== ENTITY DETAILS RENDERER CLASS =====

/**
 * EntityDetailsRenderer - מחלקה לרנדור תצוגות פרטי ישויות
 * 
 * ✨ מערכת פילטר מתקדמת - ינואר 2025:
 * כל עמוד יכול להגדיר איזה כפתורי פילטר להציג בטבלת הפריטים המקושרים
 * על ידי הגדרת window.linkedItemsFilterConfig:
 * 
 * - Array: ['trade', 'trading_account'] - לכל סוגי הישויות
 * - Object: { 'ticker': ['trade', 'trading_account'], 'all': [...] } - לפי סוג ישות
 * - Function: (entityType) => ['trade', 'trading_account'] - הגדרה דינמית
 * 
 * ראה: documentation/frontend/LINKED_ITEMS_SYSTEM.md
 * 
 * @class EntityDetailsRenderer
 */
class EntityDetailsRenderer {
    
    /**
     * Constructor - אתחול מחלקת EntityDetailsRenderer
     * ✨ עודכן לתמיכה במערכת העדפות!
     * 
     * @constructor
     */
    constructor() {
        this.isInitialized = false;
        this.entityColors = {};
        
        // Default filter configuration - which filter buttons to show for each entity type
        // כל עמוד יכול לדרוס את ההגדרות הללו על ידי הגדרת window.linkedItemsFilterConfig
        this.defaultFilterConfig = {
            // All entity types - show all filter buttons by default
            'all': ['trading_account', 'trade', 'trade_plan', 'ticker', 'alert', 'execution', 'cash_flow', 'note'],
            // Entity-specific configurations (can override default)
            'ticker': ['trading_account', 'trade', 'trade_plan', 'alert', 'execution', 'cash_flow', 'note'],
            'trade': ['trading_account', 'trade_plan', 'ticker', 'alert', 'execution', 'cash_flow', 'note'],
            'trading_account': ['trade', 'trade_plan', 'ticker', 'alert', 'execution', 'cash_flow', 'note'],
            'alert': ['trading_account', 'trade', 'trade_plan', 'ticker', 'execution', 'cash_flow', 'note'],
            'execution': ['trading_account', 'trade', 'trade_plan', 'ticker', 'alert', 'cash_flow', 'note'],
            'cash_flow': ['trading_account', 'trade', 'trade_plan', 'ticker', 'alert', 'execution', 'note'],
            'note': ['trading_account', 'trade', 'trade_plan', 'ticker', 'alert', 'execution', 'cash_flow'],
            'trade_plan': ['trading_account', 'trade', 'ticker', 'alert', 'execution', 'cash_flow', 'note']
        };
        
        // אתחול async (לא-בלוקינג)
        this.init().catch(error => {
            window.Logger.error('❌ EntityDetailsRenderer initialization failed:', error, { page: "entity-details-renderer" });
        });
    }
    
    /**
     * Get filter configuration for entity type
     * Returns which filter buttons should be displayed
     * 
     * @param {string} entityType - Entity type (ticker, trade, account, etc.)
     * @returns {Array<string>} Array of entity types to show as filter buttons
     * @private
     */
    _getFilterConfig(entityType) {
        // Check if page has custom filter configuration
        if (window.linkedItemsFilterConfig) {
            // Page-specific configuration - can be:
            // 1. Object with entityType keys: { 'ticker': ['trade', 'account'], ... }
            // 2. Array for all entities: ['trade', 'account', ...]
            // 3. Function that returns config: (entityType) => ['trade', 'account']
            
            if (typeof window.linkedItemsFilterConfig === 'function') {
                // Function - call it with entityType
                const config = window.linkedItemsFilterConfig(entityType);
                if (Array.isArray(config)) {
                    return config;
                }
            } else if (Array.isArray(window.linkedItemsFilterConfig)) {
                // Array - use for all entity types
                return window.linkedItemsFilterConfig;
            } else if (typeof window.linkedItemsFilterConfig === 'object') {
                // Object - check for entityType-specific config
                if (window.linkedItemsFilterConfig[entityType]) {
                    return window.linkedItemsFilterConfig[entityType];
                }
                // Fallback to 'all' key if exists
                if (window.linkedItemsFilterConfig['all']) {
                    return window.linkedItemsFilterConfig['all'];
                }
            }
        }
        
        // Use default configuration
        return this.defaultFilterConfig[entityType] || this.defaultFilterConfig['all'];
    }

    /**
     * Initialize renderer system - אתחול מערכת הרנדור
     * ✨ עודכן לתמיכה במערכת העדפות!
     * 
     * @private
     */
    async init() {
        try {
            // טעינת צבעי ישויות מההעדפות
            await this.loadEntityColors();
            
            this.isInitialized = true;
            
            // הוספה לאובייקט הגלובלי
            window.entityDetailsRenderer = this;
            
            window.Logger.info('✅ EntityDetailsRenderer initialized successfully with preferences support', { page: "entity-details-renderer" });
            
        } catch (error) {
            window.Logger.error('❌ Error initializing EntityDetailsRenderer:', error, { page: "entity-details-renderer" });
        }
    }

    /**
     * Load entity colors from preferences - טעינת צבעי ישויות מההעדפות
     * ✨ עודכן לתמיכה במערכת העדפות!
     * 
     * @private
     */
    async loadEntityColors() {
        // צבעי ברירת מחדל
        this.entityColors = {
            ticker: '#019193',
            trade: '#007bff', 
            trade_plan: '#0056b3',
            execution: '#17a2b8',
            account: '#28a745',
            alert: '#ff9c05',
            cash_flow: '#20c997',
            note: '#6c757d'
        };

        // ניסיון לטעון צבעים מהעדפות ראשית
        try {
            window.Logger.info('🎨 Loading entity colors from preferences...', { page: "entity-details-renderer" });
            window.Logger.info('🔍 Debug - window.ENTITY_COLORS:', window.ENTITY_COLORS, { page: "entity-details-renderer" });
            window.Logger.info('🔍 Debug - window.currentPreferences:', window.currentPreferences, { page: "entity-details-renderer" });
            window.Logger.info('🔍 Debug - window.userPreferences:', window.userPreferences, { page: "entity-details-renderer" });
            
            // נסה מערכת העדפות
            if (window.preferences && window.preferences.preferences && window.preferences.preferences.colorScheme) {
                const colorScheme = window.preferences.preferences.colorScheme;
                if (colorScheme.entities) {
                    Object.assign(this.entityColors, colorScheme.entities);
                    window.Logger.info('✅ Loaded entity colors from preferences system', { page: "entity-details-renderer" });
                    return;
                }
            }
            
            // נסה מערכת currentPreferences
            if (window.currentPreferences && window.currentPreferences.entityColors) {
                Object.assign(this.entityColors, window.currentPreferences.entityColors);
                window.Logger.info('✅ Loaded entity colors from currentPreferences', { page: "entity-details-renderer" });
                return;
            }
            
            // נסה מערכת גלובלית (compatibility layer)
            if (window.ENTITY_COLORS && Object.keys(window.ENTITY_COLORS).length > 0) {
                Object.assign(this.entityColors, window.ENTITY_COLORS);
                window.Logger.info('✅ Loaded entity colors from global system', { page: "entity-details-renderer" });
                return;
            }
            
            // Fallback ל-userPreferences
            if (window.userPreferences && window.userPreferences.entityColors) {
                Object.assign(this.entityColors, window.userPreferences.entityColors);
                window.Logger.info('✅ Loaded entity colors from userPreferences', { page: "entity-details-renderer" });
                return;
            }
            
            // Fallback אחרון - נסה לטעון מהמערכת הקיימת
            try {
                if (window.loadPreferences && typeof window.loadPreferences === 'function') {
                    const preferences = await window.loadPreferences();
                    if (preferences && preferences.entityColors) {
                        Object.assign(this.entityColors, preferences.entityColors);
                        window.Logger.info('✅ Loaded entity colors from loadPreferences', { page: "entity-details-renderer" });
                        return;
                    }
                }
            } catch (prefError) {
                window.Logger.debug('loadPreferences not available, using defaults', { page: "entity-details-renderer" });
            }
            
        } catch (error) {
            window.Logger.debug('Could not load entity colors from preferences, using defaults', { page: "entity-details-renderer" });
        }
        
        window.Logger.info('🔄 Using default entity colors', { page: "entity-details-renderer" });
    }

    /**
     * Normalize entity type - נירמול סוג ישות
     * Converts various entity type names to canonical form
     * 
     * @param {string} entityType - סוג ישות
     * @returns {string} - סוג ישות מנורמל
     * @private
     */
    normalizeEntityType(entityType) {
        if (!entityType || typeof entityType !== 'string') {
            return entityType;
        }
        
        const normalized = entityType.toLowerCase().trim();
        
        // מיפוי שמות שונים לאותו סוג ישות
        // חשוב: trading_account הוא הישות הנכונה - אין עוד תמיכה ב-account ישן!
        const typeMapping = {
            'tradingaccount': 'trading_account',
            'trading-account': 'trading_account'
        };
        
        // אם מישהו משתמש ב-account ישן - שגיאה!
        if (normalized === 'account') {
            const error = new Error("❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!");
            window.Logger?.error('❌ normalizeEntityType received deprecated value', { entityType }, { page: "entity-details-renderer" });
            throw error;
        }
        
        const mapped = typeMapping[normalized];
        if (mapped) {
            return mapped;
        }
        
        return normalized;
    }

    renderError(message) {
        const text = message || 'שגיאה בטעינת נתונים';
        return `<div class="alert alert-danger text-center my-3">${text}</div>`;
    }

    /**
     * Main render function - פונקציית רנדור ראשית
     * 
     * @param {string} entityType - סוג הישות
     * @param {Object} entityData - נתוני הישות
     * @param {Object} options - אפשרויות רנדור
     * @returns {Promise<string>} - HTML מרונדר
     * @public
     */
    async render(entityType, entityData, options = {}) {
        try {
            if (!entityType || !entityData) {
                return this.renderError('חסרים נתוני ישות');
            }

            // נירמול סוג ישות - רק trading_account נתמך!
            const normalizedEntityType = this.normalizeEntityType(entityType);

            if (window.Logger) {
                window.Logger.info('✅ [1.4 EntityDetailsRenderer.render] Called with options.sourceInfo', {
                    entityType: entityType,
                    normalizedEntityType: normalizedEntityType,
                    hasOptions: !!options,
                    hasSourceInfo: !!options?.sourceInfo,
                    sourceInfo: options?.sourceInfo,
                    sourceInfoString: options?.sourceInfo ? JSON.stringify(options.sourceInfo) : null,
                    allOptions: options,
                    page: "entity-details-renderer"
                });
            }

            // בחירת פונקציית רנדור לפי סוג הישות
            switch (normalizedEntityType) {
                case 'ticker':
                    return this.renderTicker(entityData, options);
                case 'trade':
                    return this.renderTrade(entityData, options);
                case 'trade_plan':
                    return this.renderTradePlan(entityData, options);
                case 'execution':
                    return this.renderExecution(entityData, options);
                case 'position':
                    return this.renderPosition(entityData, options);
                case 'trading_account':
                    return this.renderAccount(entityData, options);
                case 'account':
                    // DEPRECATED - use trading_account instead!
                    const error1 = new Error(`❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!`);
                    window.Logger.error('❌ DEPRECATED: account entity type used in render', { entityData }, { page: "entity-details-renderer" });
                    console.error(error1);
                    throw error1;
                case 'alert':
                    return this.renderAlert(entityData, options);
                case 'cash_flow':
                    return this.renderCashFlow(entityData, options);
                case 'note':
                    return this.renderNote(entityData, options);
                default:
                    return this.renderGeneric(entityData, entityType, options);
            }

        } catch (error) {
            window.Logger.error('Error rendering entity details:', error, { page: "entity-details-renderer" });
            return this.renderError(`שגיאה ברנדור: ${error.message}`);
        }
    }

    /**
     * Render market data for ticker - רנדור נתוני שוק לטיקר
     * 
     * @param {Object} tickerData - נתוני טיקר
     * @param {string} tickerColor - צבע הטיקר
     * @returns {string} - HTML מרונדר
     * @public
     */
    renderMarketData(tickerData, tickerColor = '#019193') {
        const price = tickerData.current_price || tickerData.price || 0;
        const change = tickerData.daily_change || tickerData.change_amount || 0;
        const changePercent = tickerData.daily_change_percent || tickerData.change_percent || 0;
        const volume = tickerData.volume || 0;
        const currencySymbol = tickerData.currency_symbol || (tickerData.currency && tickerData.currency.symbol) || '$';
        const updatedAt = tickerData.yahoo_updated_at || tickerData.updated_at || null;
        const dataSource = tickerData.data_source || null;
        
        // אם אין נתוני שוק, נחזיר רק קו מפריד
        if (!price || price === 0) {
            return `
                <div class="market-data-container pb-2 mb-3 border-bottom">
                    <div class="text-muted small">
                        אין נתוני שוק זמינים
                    </div>
                </div>
            `;
        }
        
        // עיצוב שינוי
        const changeColor = change >= 0 ? '#28a745' : '#dc3545';
        const changeIcon = change >= 0 ? '↗' : '↘';
        const changeSign = change >= 0 ? '+' : '';
        
        // פורמט נפח
        const formattedVolume = volume > 0 ? volume.toLocaleString('he-IL') : 'N/A';
        
        // פורמט תאריך עדכון
        let updatedAtDisplay = '';
        if (updatedAt) {
            try {
                const date = new Date(updatedAt);
                updatedAtDisplay = date.toLocaleString('he-IL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                updatedAtDisplay = updatedAt;
            }
        }
        
        return `
            <div class="market-data-container pb-2 mb-3 border-bottom">
                <div class="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                    <div class="fw-bold fs-5" style="direction: ltr;">
                        ${currencySymbol}${parseFloat(price).toFixed(2)}
                    </div>
                    <div class="d-flex align-items-center gap-2" style="color: ${changeColor}; font-weight: bold; direction: ltr;">
                        <span>${changeIcon}</span>
                        <span>${changeSign}${parseFloat(change).toFixed(2)}</span>
                        <span>(${changeSign}${parseFloat(changePercent).toFixed(2)}%)</span>
                    </div>
                    <div class="text-muted small">
                        נפח: ${formattedVolume}
                    </div>
                    ${updatedAtDisplay ? `
                    <div class="text-muted small">
                        עודכן: ${updatedAtDisplay}
                    </div>
                    ` : ''}
                    ${dataSource ? `
                    <div class="text-muted small">
                        מקור: ${dataSource}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render ticker details - רנדור פרטי טיקר
     * 
     * @param {Object} tickerData - נתוני טיקר
     * @param {Object} options - אפשרויות רנדור
     * @returns {string} - HTML מרונדר
     * @public
     */
    renderTicker(tickerData, options = {}) {
        // קבלת צבע הטיקר מההעדפות
        const tickerColor = this.entityColors.ticker || '#019193';
        const sourceInfo = (options && options.sourceInfo) ? options.sourceInfo : null;
        
        // לוג לבדיקת linked_items
        console.log('🔍 [renderTicker] Ticker data:', {
            id: tickerData.id,
            symbol: tickerData.symbol,
            hasLinkedItems: !!tickerData.linked_items,
            linkedItemsType: typeof tickerData.linked_items,
            linkedItemsIsArray: Array.isArray(tickerData.linked_items),
            linkedItemsCount: tickerData.linked_items?.length || 0,
            linkedItems: tickerData.linked_items
        });
        
        if (window.Logger) {
            window.Logger.info('🔍 [renderTicker] Ticker data:', {
                id: tickerData.id,
                symbol: tickerData.symbol,
                hasLinkedItems: !!tickerData.linked_items,
                linkedItemsType: typeof tickerData.linked_items,
                linkedItemsIsArray: Array.isArray(tickerData.linked_items),
                linkedItemsCount: tickerData.linked_items?.length || 0,
                page: 'entity-details-renderer'
            });
        }
        
        return `
            <div class="entity-details-container ticker-details">
                
                <!-- נתוני שוק למעלה -->
                <div class="mb-4">
                    ${this.renderMarketData(tickerData, tickerColor)}
                </div>
                
                <!-- מידע בסיסי בשתי עמודות -->
                <div class="row g-3">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(tickerData, 'ticker', tickerColor)}
                    </div>
                    <div class="col-md-6">
                        ${this.renderTickerSpecific(tickerData, tickerColor)}
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(tickerData.linked_items || [], tickerColor, 'ticker', tickerData.id, sourceInfo, options)}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render ticker specific information - רנדור מידע ספציפי לטיקר
     * 
     * @param {Object} tickerData - נתוני טיקר
     * @param {string} tickerColor - צבע הטיקר
     * @returns {string} - HTML מרונדר
     * @public
     */
    renderTickerSpecific(tickerData, tickerColor = null) {
        const color = tickerColor || this.entityColors.ticker || '#019193';
        
        // סוג נכס
        const type = tickerData.type || null;
        const typeDisplay = type || 'לא זמין';
        
        // מטבע
        const currencySymbol = tickerData.currency_symbol || 
                              (tickerData.currency && tickerData.currency.symbol) || 
                              '$';
        const currencyName = tickerData.currency_name || 
                            (tickerData.currency && tickerData.currency.name) || 
                            null;
        const currencyDisplay = currencyName ? `${currencySymbol} - ${currencyName}` : currencySymbol;
        
        // תאריך יצירה
        const createdAt = this.formatDateTime(tickerData.created_at) || '-';
        
        // הערות
        const remarks = tickerData.remarks || null;
        
        return `
            <div class="ticker-specific">
                <h6 class="border-bottom pb-2 mb-3" style="border-color: ${color} !important;">פרטי טיקר</h6>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סוג:</label>
                    <span>${typeDisplay}</span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מטבע:</label>
                    <span>${currencyDisplay}</span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך יצירה:</label>
                    <span class="text-muted">${createdAt}</span>
                </div>
                
                ${remarks ? `
                <div class="mb-3">
                    <label class="form-label fw-bold mb-2">הערות:</label>
                    <p class="mb-0">${window.FieldRendererService && window.FieldRendererService.renderTextPreview ? 
                        window.FieldRendererService.renderTextPreview(remarks, { maxLength: 500 }) : 
                        (remarks.length > 500 ? remarks.substring(0, 500) + '...' : remarks)}</p>
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render trade details - רנדור פרטי טרייד
     * 
     * @param {Object} tradeData - נתוני טרייד
     * @param {Object} options - אפשרויות רנדור
     * @returns {string} - HTML מרונדר
     * @public
     */
    renderTrade(tradeData, options = {}) {
        const entityColor = this.entityColors.trade || '#007bff';
        
        // סטטוס - שימוש במערכת הרינדור הכללית
        const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
            ? window.FieldRendererService.renderStatus(tradeData.status, 'trade')
            : '';
        
        // טיקר - נחלץ מה-tickerObject או מה-ticker_symbol
        const tickerSymbol = tradeData.ticker_symbol || 
                            (tradeData.ticker?.symbol) || 
                            (tradeData.ticker_id ? `טיקר #${tradeData.ticker_id}` : 'לא מוגדר');
        
        // נתוני טיקר עדכניים - ננסה לקבל מה-ticker object
        // Backend מחזיר: ticker object עם current_price, daily_change, daily_change_percent, volume
        let tickerInfoHTML = '';
        
        console.log('🔍🔍🔍 [renderTrade] Checking ticker data:', {
            hasTicker: !!tradeData.ticker,
            tickerObject: tradeData.ticker,
            tickerObjectFull: tradeData.ticker ? JSON.stringify(tradeData.ticker, null, 2) : null,
            hasFieldRendererService: !!window.FieldRendererService,
            hasRenderTickerInfo: !!(window.FieldRendererService && window.FieldRendererService.renderTickerInfo),
            tickerObjectKeys: tradeData.ticker ? Object.keys(tradeData.ticker) : [],
            tickerObjectValues: tradeData.ticker ? Object.entries(tradeData.ticker).map(([key, value]) => ({key, value, type: typeof value})) : []
        });
        
        if (tradeData.ticker && window.FieldRendererService && window.FieldRendererService.renderTickerInfo) {
            // יצירת אובייקט ticker עם הנתונים העדכניים לפי המבנה מה-backend
            const tickerData = {
                symbol: tradeData.ticker.symbol || tickerSymbol,
                name: tradeData.ticker.name || '',
                current_price: tradeData.ticker.current_price || 0,
                daily_change: tradeData.ticker.daily_change || 
                            tradeData.ticker.change_amount || 
                            0,
                daily_change_percent: tradeData.ticker.daily_change_percent || 
                                    tradeData.ticker.change_percent || 
                                    0,
                volume: tradeData.ticker.volume || 0,
                currency_symbol: tradeData.ticker.currency_symbol || 
                               (tradeData.ticker.currency?.symbol) || 
                               '$'
            };
            
            console.log('🔍🔍🔍 [renderTrade] tickerData created:', {
                tickerData,
                current_price: tickerData.current_price,
                daily_change: tickerData.daily_change,
                daily_change_percent: tickerData.daily_change_percent,
                volume: tickerData.volume,
                conditionCheck: {
                    current_price_gt_0: tickerData.current_price > 0,
                    daily_change_not_0: tickerData.daily_change !== 0,
                    volume_gt_0: tickerData.volume > 0,
                    conditionResult: (tickerData.current_price > 0 || tickerData.daily_change !== 0 || tickerData.volume > 0)
                }
            });
            
            // רק אם יש לפחות מחיר או שינוי - נציג את המידע
            if (tickerData.current_price > 0 || tickerData.daily_change !== 0 || tickerData.volume > 0) {
                console.log('🔍🔍🔍 [renderTrade] Calling renderTickerInfo...');
                tickerInfoHTML = window.FieldRendererService.renderTickerInfo(tickerData, 'mb-2');
                console.log('🔍🔍🔍 [renderTrade] renderTickerInfo returned:', {
                    tickerInfoHTMLLength: tickerInfoHTML.length,
                    tickerInfoHTML: tickerInfoHTML.substring(0, 200)
                });
            } else {
                console.log('⚠️ [renderTrade] Condition not met - not calling renderTickerInfo');
            }
        } else {
            console.log('⚠️ [renderTrade] Missing requirements for ticker info:', {
                hasTicker: !!tradeData.ticker,
                hasFieldRendererService: !!window.FieldRendererService,
                hasRenderTickerInfo: !!(window.FieldRendererService && window.FieldRendererService.renderTickerInfo)
            });
        }
        
        console.log('🔍🔍🔍 [renderTrade] Final tickerInfoHTML:', {
            tickerInfoHTMLLength: tickerInfoHTML.length,
            tickerInfoHTML: tickerInfoHTML
        });
        
        // אם אין נתונים - לא נציג כלום (בלי fallback, בלי הודעת "לא זמין")
        
        return `
            <div class="entity-details-container trade-details">
                
                <!-- שורה ראשונה: טיקר | נתוני טיקר | סטטוס (משמאל) -->
                <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-3" style="border-bottom: 1px solid #e0e0e0; padding-bottom: 0.75rem;">
                    <!-- טיקר -->
                    <div class="d-flex align-items-center gap-2" style="min-width: 120px;">
                        <strong>טיקר:</strong>
                        <span class="fw-bold">${tickerSymbol}</span>
                    </div>
                    
                    <!-- נתוני טיקר עדכניים - במרכז -->
                    <div class="flex-grow-1" style="text-align: center;">
                        ${tickerInfoHTML || ''}
                    </div>
                    
                    <!-- סטטוס משמאל -->
                    <div class="d-flex align-items-center gap-2" style="min-width: 150px; justify-content: flex-end;">
                        ${statusDisplay ? `<strong>סטטוס:</strong> ${statusDisplay}` : '<span class="text-muted">לא מוגדר</span>'}
                    </div>
                </div>
                
                <div class="row g-3">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(tradeData, 'trade')}
                    </div>
                    <div class="col-md-6">
                        ${this.renderTradeSpecific(tradeData)}
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${(() => {
                            if (window.Logger) {
                                window.Logger.info('✅ [1.5 renderTrade] Calling renderLinkedItems with sourceInfo', {
                                    hasOptions: !!options,
                                    hasSourceInfo: !!options?.sourceInfo,
                                    sourceInfo: options?.sourceInfo,
                                    sourceInfoString: options?.sourceInfo ? JSON.stringify(options.sourceInfo) : null,
                                    page: "entity-details-renderer"
                                });
                            }
                            return this.renderLinkedItems(tradeData.linked_items || [], this.entityColors.trade || '#007bff', 'trade', tradeData.id, options?.sourceInfo || null, options);
                        })()}
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderActionButtons('trade', tradeData.id, tradeData, options?.sourceInfo || null)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render position details - רנדור פרטי פוזיציה מאוחדים
     * @param {Object} positionData
     * @param {Object} options
     * @returns {string}
     */
    renderPosition(positionData, options = {}) {
        if (!positionData) {
            return this.renderError('לא נמצאו נתוני פוזיציה להצגה');
        }

        const FieldRenderer = window.FieldRendererService || null;
        const entityColor = (window.getEntityColor && typeof window.getEntityColor === 'function' ? window.getEntityColor('position') : null)
            || this.entityColors.position
            || this.entityColors.trade
            || '#0d6efd';
        const backgroundColor = (window.getEntityBackgroundColor && typeof window.getEntityBackgroundColor === 'function' ? window.getEntityBackgroundColor('position') : null)
            || 'rgba(13, 110, 253, 0.12)';
        const borderColor = (window.getEntityBorderColor && typeof window.getEntityBorderColor === 'function' ? window.getEntityBorderColor('position') : null)
            || 'rgba(13, 110, 253, 0.35)';
        const currencySymbol = positionData.currency_symbol
            || positionData.base_currency_symbol
            || positionData.account_currency_symbol
            || '$';

        const tickerSymbol = positionData.ticker_symbol
            || positionData.ticker?.symbol
            || (positionData.ticker_id ? `טיקר #${positionData.ticker_id}` : 'לא זמין');
        const accountName = positionData.account_name || '';
        const sideBadge = FieldRenderer?.renderSide ? FieldRenderer.renderSide(positionData.side) : '';

        const quantityValue = Number(positionData.quantity || 0);
        const quantityClass = quantityValue > 0 ? 'numeric-value-positive' : (quantityValue < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
        const quantitySign = quantityValue > 0 ? '+' : (quantityValue < 0 ? '-' : '');
        const quantityHtml = `<span class="${quantityClass}" dir="ltr">${quantitySign}#${Math.abs(quantityValue).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>`;

        const renderAmount = (value, showSign = true, decimals = 0) => {
            if (FieldRenderer?.renderAmount) {
                return FieldRenderer.renderAmount(value || 0, currencySymbol, decimals, showSign);
            }
            if (value === null || value === undefined || Number.isNaN(Number(value))) {
                return '<span class="numeric-value-zero">-</span>';
            }
            const num = Number(value);
            const formatted = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
            const sign = num > 0 && showSign ? '+' : (num < 0 ? '-' : '');
            const cssClass = num > 0 ? 'numeric-value-positive' : (num < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
            return `<span class="${cssClass}" dir="ltr">${sign}${currencySymbol}${formatted}</span>`;
        };

        const renderPercent = (value) => {
            if (FieldRenderer?.renderNumericValue) {
                return FieldRenderer.renderNumericValue(value || 0, '%', true);
            }
            if (value === null || value === undefined) {
                return '<span class="numeric-value-zero">-</span>';
            }
            const num = Number(value) || 0;
            const sign = num > 0 ? '+' : (num < 0 ? '-' : '');
            const cssClass = num > 0 ? 'numeric-value-positive' : (num < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
            return `<span class="${cssClass}" dir="ltr">${sign}${Math.abs(num).toFixed(2)}%</span>`;
        };

        const unrealizedPL = positionData.unrealized_pl || 0;
        const realizedPL = positionData.realized_pl || 0;
        const totalPL = unrealizedPL + realizedPL;

        const normalizedExecutions = Array.isArray(positionData.executions)
            ? positionData.executions.map(exec => {
                const action = exec.action || '';
                let quantity = Number(exec.quantity || 0);
                if (action === 'sell' && quantity > 0) {
                    quantity = -quantity;
                } else if (action === 'buy' && quantity < 0) {
                    quantity = Math.abs(quantity);
                }

                const feeRaw = exec.fee || exec.commission || 0;
                const fee = feeRaw ? -Math.abs(feeRaw) : 0;
                const price = Number(exec.price || 0);

                let total = exec.total !== undefined ? Number(exec.total) : (quantity * price) + fee;
                if (action === 'sell' && total > 0) {
                    total = -Math.abs(total);
                }

                return {
                    ...exec,
                    action,
                    quantity,
                    fee,
                    price,
                    total,
                    date: exec.date || exec.execution_date || exec.created_at || null
                };
            })
            : [];

        window.positionExecutionsData = normalizedExecutions;
        window.updatePositionExecutionsTable = (data = window.positionExecutionsData) => {
                const tableBody = document.querySelector('#positionExecutionsTable tbody');
                if (!tableBody) {
                    return;
                }

            if (!Array.isArray(data) || data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">אין ביצועים להצגה</td></tr>';
                    return;
                }

            const rows = data.map(exec => {
                    const actionLabel = exec.action === 'buy' ? 'קניה' : 'מכירה';
                    const actionClass = exec.action === 'buy' ? 'text-success' : 'text-danger';
                    const qty = Number(exec.quantity || 0);
                    const qtyClass = qty > 0 ? 'numeric-value-positive' : (qty < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
                    const qtySign = qty > 0 ? '+' : (qty < 0 ? '-' : '');
                    const qtyHtml = `<span class="${qtyClass}" dir="ltr">${qtySign}#${Math.abs(qty).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>`;
                const feeHtml = renderAmount(exec.fee || 0, true);
                    const dateText = exec.date ? new Date(exec.date).toLocaleString('he-IL') : 'לא זמין';
                    const priceHtml = renderAmount(exec.price || 0, false, 2);
                const totalHtml = renderAmount(exec.total || 0, true);

                    return `
                        <tr>
                            <td>${dateText}</td>
                            <td><span class="${actionClass}">${actionLabel}</span></td>
                            <td>${qtyHtml}</td>
                            <td>${priceHtml}</td>
                            <td>${feeHtml}</td>
                            <td>${totalHtml}</td>
                        </tr>
                    `;
                }).join('');

            tableBody.innerHTML = rows;
        };

        const executionRowsHtml = normalizedExecutions.length
            ? normalizedExecutions.map(exec => {
                const actionLabel = exec.action === 'buy' ? 'קניה' : 'מכירה';
                const actionClass = exec.action === 'buy' ? 'text-success' : 'text-danger';
                const qty = Number(exec.quantity || 0);
                const qtyClass = qty > 0 ? 'numeric-value-positive' : (qty < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
                const qtySign = qty > 0 ? '+' : (qty < 0 ? '-' : '');
                const qtyHtml = `<span class="${qtyClass}" dir="ltr">${qtySign}#${Math.abs(qty).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>`;
                const dateText = exec.date ? new Date(exec.date).toLocaleString('he-IL') : 'לא זמין';
                const priceHtml = renderAmount(exec.price || 0, false, 2);
                const feeHtml = renderAmount(exec.fee || 0, true);
                const totalHtml = renderAmount(exec.total || 0, true);

                return `
                    <tr>
                        <td>${dateText}</td>
                        <td><span class="${actionClass}">${actionLabel}</span></td>
                        <td>${qtyHtml}</td>
                        <td>${priceHtml}</td>
                        <td>${feeHtml}</td>
                        <td>${totalHtml}</td>
                    </tr>
                `;
            }).join('')
            : '<tr><td colspan="6" class="text-center text-muted py-3">אין ביצועים להצגה</td></tr>';

        const uniqueLinkedItems = new Map();
        const registerLinkedItem = (item) => {
            if (!item || !item.type || !item.id) {
                return;
            }
            const key = `${item.type}-${item.id}`;
            if (!uniqueLinkedItems.has(key)) {
                uniqueLinkedItems.set(key, item);
            }
        };

        const lookupLinkedItemSource = (type, id) => {
            const normalizedId = this._normalizeLinkedItemId(id);
            return this._resolveLinkedItemSource(type, normalizedId, null, 'position', options) || null;
        };

        if (Array.isArray(positionData.linked_items)) {
            positionData.linked_items.forEach(registerLinkedItem);
        }

        if (positionData.ticker_id) {
            const tickerSource = lookupLinkedItemSource('ticker', positionData.ticker_id);
            registerLinkedItem({
                type: 'ticker',
                id: positionData.ticker_id,
                symbol: tickerSymbol,
                name: tickerSource?.name || positionData.ticker?.name || tickerSymbol,
                status: tickerSource?.status || positionData.ticker?.status || null,
                updated_at: tickerSource?.updated_at || tickerSource?.updatedAt || positionData.ticker?.updated_at || null,
                created_at: tickerSource?.created_at || tickerSource?.createdAt || positionData.ticker?.created_at || null,
            });
        }

        if (positionData.trading_account_id) {
            const accountSource = lookupLinkedItemSource('trading_account', positionData.trading_account_id);
            registerLinkedItem({
                type: 'trading_account',
                id: positionData.trading_account_id,
                name: accountSource?.name || accountName || `חשבון ${positionData.trading_account_id}`,
                status: accountSource?.status || positionData.account_status || null,
                updated_at: accountSource?.updated_at || accountSource?.updatedAt || null,
                created_at: accountSource?.created_at || accountSource?.createdAt || null,
            });
        }

        if (Array.isArray(positionData.linked_trade_ids)) {
            positionData.linked_trade_ids.forEach(tradeId => {
                const tradeSource = lookupLinkedItemSource('trade', tradeId);
                registerLinkedItem({
                    type: 'trade',
                    id: tradeId,
                    name: (tradeSource?.symbol || tradeSource?.name || tickerSymbol),
                    status: tradeSource?.status || null,
                    side: tradeSource?.side || positionData.side || null,
                    investment_type: tradeSource?.investment_type || tradeSource?.investmentType || null,
                    updated_at: tradeSource?.updated_at || tradeSource?.updatedAt || null,
                    created_at: tradeSource?.created_at || tradeSource?.createdAt || null,
                });
            });
        }

        if (Array.isArray(positionData.linked_trade_plan_ids)) {
            positionData.linked_trade_plan_ids.forEach(planId => {
                const planSource = lookupLinkedItemSource('trade_plan', planId);
                registerLinkedItem({
                    type: 'trade_plan',
                    id: planId,
                    name: (planSource?.symbol || planSource?.name || tickerSymbol),
                    status: planSource?.status || null,
                    side: planSource?.side || positionData.side || null,
                    investment_type: planSource?.investment_type || planSource?.investmentType || positionData.investment_type || null,
                    updated_at: planSource?.updated_at || planSource?.updatedAt || null,
                    created_at: planSource?.created_at || planSource?.createdAt || null,
                });
            });
        }

        const linkedItemsHtml = this.renderLinkedItems(
            Array.from(uniqueLinkedItems.values()),
            entityColor,
            'position',
            positionData.id || `${positionData.trading_account_id || 'na'}-${positionData.ticker_id || 'na'}`,
            options?.sourceInfo || null,
            options
        );

        window.updatePositionExecutionsTable(window.positionExecutionsData);

        let percentOfAccount = positionData.percent_of_account;
        const accountTotalValueRaw = positionData.account_total_value
            ?? positionData.account_total_value_abs
            ?? positionData.account_value_with_cash
            ?? positionData.account_value
            ?? positionData.account_total
            ?? null;

        if ((percentOfAccount === undefined || percentOfAccount === null) && accountTotalValueRaw !== null) {
            const accountTotalValue = Number(accountTotalValueRaw);
            const marketValue = Number(positionData.market_value || 0);
            if (!Number.isNaN(accountTotalValue) && accountTotalValue !== 0) {
                percentOfAccount = (marketValue / accountTotalValue) * 100;
            } else if (!Number.isNaN(marketValue) && accountTotalValue === 0) {
                percentOfAccount = 0;
            }
        }

        const percentOfPortfolio = positionData.percent_of_portfolio ?? null;

        const executionsSectionHtml = `
            <section class="content-section mt-4" data-section="position-executions">
                <div class="section-header-with-extra-info d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div class="section-title-wrapper d-flex align-items-center gap-2">
                        <h5 class="section-title mb-0">ביצועים לפוזיציה</h5>
                        <span class="badge bg-light text-dark">${normalizedExecutions.length}</span>
                    </div>
                </div>
                <div class="section-content">
                    ${normalizedExecutions.length ? `
                <div class="table-responsive">
                    <table class="table table-sm table-hover mb-0" id="positionExecutionsTable" data-table-type="position_executions">
                        <thead>
                            <tr>
                                <th>
                                    <button class="btn btn-link sortable-header px-0" data-onclick="window.sortTableData(0, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)">תאריך <span class="sort-icon">↕</span></button>
                                </th>
                                <th>
                                    <button class="btn btn-link sortable-header px-0" data-onclick="window.sortTableData(1, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)">פעולה <span class="sort-icon">↕</span></button>
                                </th>
                                <th>
                                    <button class="btn btn-link sortable-header px-0" data-onclick="window.sortTableData(2, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)">כמות <span class="sort-icon">↕</span></button>
                                </th>
                                <th>
                                    <button class="btn btn-link sortable-header px-0" data-onclick="window.sortTableData(3, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)">מחיר <span class="sort-icon">↕</span></button>
                                </th>
                                <th>
                                    <button class="btn btn-link sortable-header px-0" data-onclick="window.sortTableData(4, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)">עמלה <span class="sort-icon">↕</span></button>
                                </th>
                                <th>
                                    <button class="btn btn-link sortable-header px-0" data-onclick="window.sortTableData(5, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)">סה"כ <span class="sort-icon">↕</span></button>
                                </th>
                            </tr>
                        </thead>
                                <tbody>${executionRowsHtml}</tbody>
                    </table>
            </div>
        ` : `
                        <div class="alert alert-info text-center mb-0">אין ביצועים להצגה</div>
                    `}
            </div>
            </section>
        `;

        return `
            <div class="entity-details-container position-details entity-position entity-details-card p-4">
                <div class="entity-card-header d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 mb-4">
                    <div class="d-flex align-items-center gap-3">
                        <span class="fs-4 fw-bold entity-card-title">${tickerSymbol}</span>
                        ${sideBadge}
                    </div>
                    <div class="entity-card-subtitle d-flex align-items-center gap-2 text-muted">
                        <i class="fas fa-wallet"></i>
                        <span>${accountName || 'לא זמין'}</span>
                    </div>
                </div>

                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="list-group list-group-flush">
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">כמות</span>
                                ${quantityHtml}
                    </div>
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">מחיר ממוצע (ברוטו / נטו)</span>
                                <span class="d-flex flex-column align-items-end">
                                    ${renderAmount(positionData.average_price_gross || 0, false, 2)}
                                    <small class="text-muted">${renderAmount(positionData.average_price_net || 0, false, 2)} נטו</small>
                                </span>
                </div>
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">סה"כ עלות</span>
                                ${renderAmount(positionData.current_position_cost || 0, false)}
                            </div>
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">שווי שוק</span>
                                ${renderAmount(positionData.market_value || 0, false)}
                </div>
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">אחוז מהחשבון</span>
                                ${percentOfAccount !== null ? renderPercent(percentOfAccount) : '<span class="numeric-value-zero">-</span>'}
            </div>
                </div>
            </div>
                    <div class="col-md-6">
                        <div class="list-group list-group-flush">
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">P/L לא ממומש</span>
                                <span class="d-flex flex-column align-items-end">
                                    ${renderAmount(unrealizedPL, true)}
                                    ${positionData.unrealized_pl_percent !== undefined ? `<small class="text-muted">${renderPercent(positionData.unrealized_pl_percent)}</small>` : ''}
                                </span>
                </div>
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">P/L ממומש</span>
                                <span class="d-flex flex-column align-items-end">
                                    ${renderAmount(realizedPL, true)}
                                    ${positionData.realized_pl_percent !== undefined ? `<small class="text-muted">${renderPercent(positionData.realized_pl_percent)}</small>` : ''}
                                </span>
                </div>
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">P/L כולל</span>
                                ${renderAmount(totalPL, true)}
                </div>
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">סה"כ קניות</span>
                                <span class="d-flex flex-column align-items-end">
                                    ${(positionData.total_bought_quantity || 0).toLocaleString('en-US')} יחידות
                                    ${renderAmount(positionData.total_bought_amount || 0, false)}
                                </span>
                    </div>
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">סה"כ מכירות</span>
                                <span class="d-flex flex-column align-items-end">
                                    ${(positionData.total_sold_quantity || 0).toLocaleString('en-US')} יחידות
                                    ${renderAmount(-Math.abs(positionData.total_sold_amount || 0), true)}
                                </span>
                </div>
                            <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted">עמלות</span>
                                ${renderAmount(-Math.abs(positionData.total_fees || 0), true)}
                </div>
                            ${percentOfPortfolio !== null ? `
                                <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                    <span class="text-muted">אחוז מהפורטפוליו</span>
                                    ${renderPercent(percentOfPortfolio)}
                                </div>` : ''}
                    </div>
                </div>
            </div>

                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${linkedItemsHtml}
                </div>
            </div>

                ${executionsSectionHtml}
                </div>
            `;
        }
        
    renderLinkedItems(linkedItems = [], entityColor = '#6c757d', parentEntityType = 'entity', parentEntityId = '0', sourceInfo = null, options = {}) {
        try {
            const items = Array.isArray(linkedItems) ? linkedItems.filter(Boolean) : [];
            console.log('🔍 [renderLinkedItems] Starting render', { 
                itemsCount: items.length, 
                parentEntityType, 
                parentEntityId,
                items: items.slice(0, 3) // Show first 3 items for debugging
            });
            
            const sanitizedSuffix = `${parentEntityType || 'entity'}_${parentEntityId || '0'}`.replace(/[^a-zA-Z0-9_-]/g, '_');
            const tableId = `linkedItemsTable_${sanitizedSuffix}`;

            let enrichedItems = this._enrichLinkedItems(items, parentEntityType, options);
            console.log('🔍 [renderLinkedItems] After enrichment', { 
                enrichedCount: enrichedItems.length,
                enrichedItems: enrichedItems.slice(0, 3) // Show first 3 items for debugging
            });
            
            // מיון פריטים מקושרים - פתוחים ראשון, אחר כך תאריך (חדש לישן)
            if (window.LinkedItemsService && window.LinkedItemsService.sortLinkedItems) {
                enrichedItems = window.LinkedItemsService.sortLinkedItems(enrichedItems);
            }

            if (!window.linkedItemsTableData) {
                window.linkedItemsTableData = {};
            }
            window.linkedItemsTableData[tableId] = enrichedItems;

            if (!window.linkedItemsSortHandlers) {
                window.linkedItemsSortHandlers = {};
            }
            window.linkedItemsSortHandlers[tableId] = (sortedData) => {
                if (window.updateLinkedItemsTable) {
                    window.updateLinkedItemsTable(tableId, sortedData);
                }
            };

            const showFilter = options.disableFilter ? false : true;
            const filterTypes = showFilter ? this._getFilterConfig(parentEntityType) : [];
            const filterButtonsHtml = showFilter ? [
                `<button class="btn btn-sm btn-outline-primary filter-icon-btn active" id="filterBtn_${tableId}_all" data-type="all" data-onclick="window.filterLinkedItemsByType('${tableId}', 'all')" data-tooltip="הצג הכל" data-tooltip-placement="top" data-tooltip-trigger="hover">הכל</button>`,
                this._generateFilterButtons(tableId, filterTypes)
            ].join('') : '';

            const baseSourceInfo = {
                sourceModal: 'entity-details',
                sourceType: parentEntityType,
                sourceId: parentEntityId
            };
            const effectiveSourceInfo = Object.assign({}, baseSourceInfo, typeof sourceInfo === 'object' ? sourceInfo : {});

            console.log('🔍 [renderLinkedItems] About to render rows', { 
                enrichedItemsCount: enrichedItems.length,
                firstItem: enrichedItems[0] 
            });
            
            const rowsHtml = enrichedItems.length ? enrichedItems.map((item, index) => {
                try {
                    const rowHtml = this._renderLinkedItemRow(item, tableId, effectiveSourceInfo);
                    if (index === 0) {
                        console.log('🔍 [renderLinkedItems] First row HTML:', rowHtml.substring(0, 200));
                    }
                    return rowHtml;
                } catch (error) {
                    console.error('❌ [renderLinkedItems] Error rendering linked item row:', error, item);
                    window.Logger?.error('Error rendering linked item row:', error, { page: 'entity-details-renderer', item });
                    return `<tr><td colspan="6" class="text-center text-danger py-2">שגיאה בהצגת פריט: ${this._escapeHtml(String(item.type || 'unknown'))}</td></tr>`;
                }
            }).join('') : '<tr><td colspan="6" class="text-center text-muted py-4">אין פריטים מקושרים להצגה</td></tr>';
            
            console.log('🔍 [renderLinkedItems] Rows HTML generated', { 
                rowsHtmlLength: rowsHtml.length,
                hasRows: rowsHtml.length > 0,
                first100Chars: rowsHtml.substring(0, 100)
            });

            const sortHandlerReference = `window.linkedItemsSortHandlers['${tableId}']`;
            const makeSortButton = (label, columnIndex, alignment = 'start') => `
                <button class="btn btn-link sortable-header px-0 text-${alignment}" data-onclick="window.sortTableData(${columnIndex}, window.linkedItemsTableData['${tableId}'] || [], 'linked_items', ${sortHandlerReference})">${label} <span class="sort-icon">↕</span></button>
            `;

            // Get table headers based on entity types in the table
            const tableHeaders = this._getLinkedItemsTableHeaders(enrichedItems, makeSortButton);

            if (showFilter) {
                setTimeout(() => {
                    if (window.entityDetailsRenderer && window.entityDetailsRenderer._initializeFilterTooltips) {
                        window.entityDetailsRenderer._initializeFilterTooltips(tableId);
                    }
                }, 250);
            }

            // Debug: Verify rowsHtml before inserting into template
            console.log('🔍 [renderLinkedItems] Before creating HTML template', {
                rowsHtmlLength: rowsHtml.length,
                rowsHtmlStartsWithTR: rowsHtml.trim().startsWith('<tr'),
                rowsHtmlEndsWithTR: rowsHtml.trim().endsWith('</tr>'),
                rowsHtmlFirstChars: rowsHtml.substring(0, 100),
                rowsHtmlLastChars: rowsHtml.substring(Math.max(0, rowsHtml.length - 100)),
                enrichedItemsCount: enrichedItems.length,
                tableHeadersLength: tableHeaders.length
            });
            
            const html = `
                <section class="content-section entity-linked-items mt-4" data-section="linked-items-${parentEntityType}" data-linked-entity="${parentEntityType}" data-linked-entity-id="${parentEntityId}">
                    <div class="section-header-with-extra-info d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div class="section-title-wrapper d-flex align-items-center gap-2">
                            <h5 class="section-title mb-0">פריטים מקושרים</h5>
                            <span class="badge bg-light text-dark">${enrichedItems.length}</span>
                        </div>
                        ${showFilter ? `
                            <div class="button-row flex-wrap" id="linkedItemsFilter_${tableId}">
                                ${filterButtonsHtml}
                            </div>
                        ` : ''}
                    </div>
                    <div class="section-content">
                        ${enrichedItems.length ? `
                            <div class="table-responsive entity-linked-items-table-wrapper">
                                <table class="table table-sm table-hover mb-0 entity-linked-items-table" id="${tableId}" data-table-type="linked_items">
                                    <thead>
                                        <tr>
                                            ${tableHeaders}
                                        </tr>
                                    </thead>
                                    <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
                        ` : (window.LinkedItemsService && window.LinkedItemsService.renderEmptyLinkedItems 
                            ? `<div class="text-center py-4">${window.LinkedItemsService.renderEmptyLinkedItems(parentEntityType, parentEntityId, entityColor)}</div>`
                            : `<div class="alert alert-info text-center mb-0">אין פריטים מקושרים להצגה</div>`)
                        }
            </div>
                </section>
            `;
            
            // Debug: Verify HTML structure after creation
            const tbodyIndex = html.indexOf('<tbody>');
            const tbodyEndIndex = html.indexOf('</tbody>');
            const tbodyContent = tbodyIndex >= 0 && tbodyEndIndex > tbodyIndex 
                ? html.substring(tbodyIndex + 7, tbodyEndIndex) 
                : 'NOT FOUND';
            console.log('🔍 [renderLinkedItems] After creating HTML template', {
                htmlLength: html.length,
                tbodyFound: tbodyIndex >= 0,
                tbodyContentLength: tbodyContent.length,
                tbodyContentPreview: tbodyContent.substring(0, 200),
                tbodyContentMatchesRowsHtml: tbodyContent.trim() === rowsHtml.trim()
            });

            if (enrichedItems.some(item => this._needsLinkedItemHydration(item))) {
                setTimeout(() => {
                    this._hydrateLinkedItemsAsync(tableId, enrichedItems, parentEntityType, parentEntityId);
                }, 60);
            }

            setTimeout(() => {
                if (window.initializeButtons && typeof window.initializeButtons === 'function') {
                    window.initializeButtons();
                } else if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
                    window.ButtonSystem.initializeButtons();
                }
            }, 100);
        
            console.log('🔍 [renderLinkedItems] Returning HTML', { 
                htmlLength: html.length,
                hasRows: rowsHtml.length > 0,
                tableId: tableId,
                enrichedItemsCount: enrichedItems.length,
                rowsHtmlLength: rowsHtml.length,
                tableStructure: html.substring(html.indexOf('<table'), html.indexOf('</table>') + 8).substring(0, 500)
            });
            
            // Debug: Check if tbody has content - multiple checks at different times
            setTimeout(() => {
                const table = document.getElementById(tableId);
                if (table) {
                    const tbody = table.querySelector('tbody');
                    const rows = tbody ? tbody.querySelectorAll('tr') : [];
                    console.log('🔍 [renderLinkedItems] DOM Check (100ms):', {
                        tableExists: true,
                        tbodyExists: !!tbody,
                        tbodyRows: rows.length,
                        tbodyHTML: tbody ? tbody.innerHTML.substring(0, 200) : 'N/A',
                        tableParent: table.parentElement ? table.parentElement.tagName : 'N/A',
                        tableVisible: table.offsetParent !== null
                    });
                } else {
                    console.warn('⚠️ [renderLinkedItems] Table not found in DOM (100ms):', tableId);
                }
            }, 100);
            
            setTimeout(() => {
                const table = document.getElementById(tableId);
                if (table) {
                    const tbody = table.querySelector('tbody');
                    const rows = tbody ? tbody.querySelectorAll('tr') : [];
                    console.log('🔍 [renderLinkedItems] DOM Check (500ms):', {
                        tableExists: true,
                        tbodyExists: !!tbody,
                        tbodyRows: rows.length,
                        tbodyHTML: tbody ? tbody.innerHTML.substring(0, 200) : 'N/A',
                        rowsHtmlLength: rowsHtml.length,
                        enrichedItemsCount: enrichedItems.length
                    });
                    
                    // Check if rowsHtml was actually inserted
                    if (rows.length === 0 && rowsHtml.length > 0) {
                        console.error('❌ [renderLinkedItems] PROBLEM DETECTED: rowsHtml exists but tbody is empty!', {
                            rowsHtmlLength: rowsHtml.length,
                            rowsHtmlPreview: rowsHtml.substring(0, 500),
                            tbodyInnerHTML: tbody ? tbody.innerHTML : 'N/A',
                            tableInnerHTML: table.innerHTML.substring(0, 1000),
                            tableOuterHTML: table.outerHTML.substring(0, 1000)
                        });
                    }
                } else {
                    console.warn('⚠️ [renderLinkedItems] Table not found in DOM (500ms):', tableId);
                }
            }, 500);
            
            setTimeout(() => {
                const table = document.getElementById(tableId);
                if (table) {
                    const tbody = table.querySelector('tbody');
                    const rows = tbody ? tbody.querySelectorAll('tr') : [];
                    console.log('🔍 [renderLinkedItems] DOM Check (1000ms):', {
                        tableExists: true,
                        tbodyExists: !!tbody,
                        tbodyRows: rows.length,
                        tbodyHTML: tbody ? tbody.innerHTML.substring(0, 200) : 'N/A'
                    });
                } else {
                    console.warn('⚠️ [renderLinkedItems] Table not found in DOM (1000ms):', tableId);
                }
            }, 1000);
            
            return html;
        } catch (error) {
            window.Logger?.error('Error rendering linked items section', error, { page: 'entity-details-renderer' });
            return '<div class="alert alert-warning text-center my-3">שגיאה בטעינת פריטים מקושרים</div>';
        }
    }

    /**
     * Get table headers based on entity types in the linked items
     * @private
     * @param {Array} items - Array of linked items
     * @param {Function} makeSortButton - Function to create sort button
     * @returns {string} HTML for table headers
     */
    _getLinkedItemsTableHeaders(items, makeSortButton) {
        // Use generic headers that work for all entity types
        // Each row will use colspan as needed
        return `
            <th class="col-linked-entity">${makeSortButton('מקושר ל', 0)}</th>
            <th class="text-center col-linked-status">${makeSortButton('סטטוס', 1, 'center')}</th>
            <th class="text-center col-linked-side">${makeSortButton('צד', 2, 'center')}</th>
            <th class="text-center col-linked-investment">${makeSortButton('סוג השקעה', 3, 'center')}</th>
            <th class="text-center col-linked-date">${makeSortButton('תאריך יצירה', 4, 'center')}</th>
            <th class="text-center col-linked-actions">פעולות</th>
        `;
    }
    
    /**
     * Render a single linked item row based on entity type
     * @private
     * @param {Object} item - Linked item object
     * @param {string} tableId - Table ID
     * @param {Object} sourceInfo - Source information
     * @returns {string} HTML for table row
     */
    _renderLinkedItemRow(item, tableId, sourceInfo) {
        try {
            if (!item || !item.type) {
                window.Logger?.warn('Invalid item in _renderLinkedItemRow:', item, { page: 'entity-details-renderer' });
                return '<tr><td colspan="6" class="text-center text-muted py-2">פריט לא תקין</td></tr>';
            }
            
            const entityType = String(item.type || '').toLowerCase();
            const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel)
                ? window.LinkedItemsService.getEntityLabel(item.type)
                : (window.getEntityLabel && typeof window.getEntityLabel === 'function'
                    ? window.getEntityLabel(item.type)
                    : item.type);
            
            const cleanName = (window.LinkedItemsService && window.LinkedItemsService.formatLinkedItemName)
                ? window.LinkedItemsService.formatLinkedItemName(item)
                : (item.description || item.title || item.name || item.symbol || `#${item.id || 'לא זמין'}`);
            
            const itemId = item.id || item.entity_id || item.linked_id || '';
            
            // Create linked badge with ID for alerts and notes
            let linkedBadge;
            if (entityType === 'alert' || entityType === 'note') {
                // Add ID below entity type
                const escapedLabel = this._escapeHtml(entityLabel);
                const escapedName = this._escapeHtml(cleanName);
                const escapedId = this._escapeHtml(`#${itemId}`);
                
                linkedBadge = `
                    <div class="linked-items-table-link d-flex flex-column align-items-start gap-1">
                        <span class="linked-items-table-label fw-semibold text-body">${escapedLabel}</span>
                        <span class="linked-items-table-name text-muted small">${escapedId}</span>
                        <span class="linked-items-table-name text-muted small">${escapedName}</span>
                    </div>
                `;
            } else {
                // Use standard renderLinkedEntity for other types
                linkedBadge = (window.FieldRendererService && window.FieldRendererService.renderLinkedEntity)
                    ? window.FieldRendererService.renderLinkedEntity(
                        item.type,
                        item.id,
                        cleanName,
                        {
                            renderMode: 'linked-items-table',
                            status: item.status,
                            side: item.side,
                            investment_type: item.investment_type
                        }
                    )
                    : `
                        <div class="linked-items-table-link d-flex flex-column align-items-start gap-1">
                            <span class="linked-items-table-label fw-semibold text-body">${entityLabel}</span>
                            <span class="linked-items-table-name text-muted small">${cleanName}</span>
                        </div>
                    `;
            }
            
            const createdDisplay = this.formatDateTime(item.created_at || item.updated_at);
            
            let actionsHtml = (window.LinkedItemsService && window.LinkedItemsService.generateLinkedItemActions)
                ? window.LinkedItemsService.generateLinkedItemActions(item, 'table', {
                    entityColors: this.entityColors,
                    sourceInfo: sourceInfo
                })
                : '';
            
            const normalizedItemId = this._normalizeLinkedItemId(item.id ?? item.entity_id ?? item.linked_id);
            if (!actionsHtml) {
                if (item.type && normalizedItemId !== null && normalizedItemId !== undefined) {
                    const normalizedType = String(item.type).toLowerCase();
                    const onclickValue = `window.showEntityDetails('${normalizedType}', '${normalizedItemId}')`;
                    actionsHtml = `
                        <button class="btn btn-sm btn-outline-primary" data-onclick="${onclickValue}">
                            צפייה בפרטים
                        </button>
                    `;
                } else {
                    actionsHtml = '<span class="text-muted">אין פעולות</span>';
                }
            }
            
            // Render cells based on entity type
            let cells = `<td class="linked-item-entity text-end col-linked-entity">${linkedBadge}</td>`;
            
            if (entityType === 'alert') {
                // Alert: Status | Condition (combined side+investment, colspan=2) | Date | Actions
                const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
                    ? window.FieldRendererService.renderStatus(item.status, item.type)
                    : this.getStatusBadge(item.status);
                
                const condition = item.condition || '';
                const targetValue = item.target_value !== null && item.target_value !== undefined ? item.target_value : '';
                const conditionDisplay = condition || targetValue
                    ? `${this._escapeHtml(String(condition || ''))}${condition && targetValue ? ' → ' : ''}${targetValue !== '' ? this._escapeHtml(String(targetValue)) : ''}`
                    : '<span class="text-muted">-</span>';
                
                cells += `<td class="text-center col-linked-status">${statusDisplay}</td>`;
                cells += `<td class="text-center col-linked-side" colspan="2">${conditionDisplay}</td>`;
                cells += `<td class="text-center col-linked-date">${createdDisplay || ''}</td>`;
                cells += `<td class="text-center col-linked-actions">${actionsHtml}</td>`;
                
            } else if (entityType === 'note') {
                // Note: Content (spanning 3 columns: status+side+investment) | Date | Actions
                const content = item.content || item.note_content || '';
                const contentDisplay = content
                    ? `<span class="text-muted small">${this._escapeHtml(content.length > 100 ? content.substring(0, 100) + '...' : content)}</span>`
                    : '<span class="text-muted">אין תוכן</span>';
                
                cells += `<td class="text-center col-linked-status" colspan="3">${contentDisplay}</td>`;
                cells += `<td class="text-center col-linked-date">${createdDisplay || ''}</td>`;
                cells += `<td class="text-center col-linked-actions">${actionsHtml}</td>`;
                
            } else if (entityType === 'execution') {
                // Execution: Side, Quantity, Price (spanning 3 columns: status+side+investment) | Date | Actions
                const side = item.side || '';
                const quantity = item.quantity || 0;
                const price = item.price || 0;
                
                const sideDisplay = side && window.FieldRendererService && window.FieldRendererService.renderSide
                    ? window.FieldRendererService.renderSide(side)
                    : (side ? `<span class="badge bg-secondary me-1">${this._escapeHtml(String(side))}</span>` : '');
                const quantityDisplay = quantity ? `<span class="text-muted me-2">כמות: ${parseFloat(quantity).toFixed(2)}</span>` : '';
                const priceDisplay = price ? `<span class="text-muted">מחיר: ${parseFloat(price).toFixed(2)}</span>` : '';
                
                const executionDisplay = `${sideDisplay} ${quantityDisplay} ${priceDisplay}`.trim() || '<span class="text-muted">-</span>';
                
                cells += `<td class="text-center col-linked-status" colspan="3">${executionDisplay}</td>`;
                cells += `<td class="text-center col-linked-date">${createdDisplay || ''}</td>`;
                cells += `<td class="text-center col-linked-actions">${actionsHtml}</td>`;
                
            } else {
                // Standard: Status | Side | Investment | Date | Actions
                const statusDisplay = this._getStatusOrAlternativeDisplay(item);
                const sideDisplay = (window.FieldRendererService && window.FieldRendererService.renderSide)
                    ? window.FieldRendererService.renderSide(item.side)
                    : (item.side ? `<span class="badge badge-secondary">${item.side}</span>` : '<span class="badge badge-secondary">-</span>');
                const investmentDisplay = (window.FieldRendererService && window.FieldRendererService.renderType)
                    ? window.FieldRendererService.renderType(item.investment_type)
                    : (item.investment_type ? `<span class="badge badge-secondary">${item.investment_type}</span>` : '<span class="badge badge-secondary">-</span>');
                
                cells += `<td class="text-center col-linked-status">${statusDisplay}</td>`;
                cells += `<td class="text-center col-linked-side">${sideDisplay}</td>`;
                cells += `<td class="text-center col-linked-investment">${investmentDisplay}</td>`;
                cells += `<td class="text-center col-linked-date">${createdDisplay || ''}</td>`;
                cells += `<td class="text-center col-linked-actions">${actionsHtml}</td>`;
            }
            
            return `<tr>${cells}</tr>`;
        } catch (error) {
            window.Logger?.error('Error in _renderLinkedItemRow:', error, { page: 'entity-details-renderer', item });
            return `<tr><td colspan="6" class="text-center text-danger py-2">שגיאה בהצגת פריט: ${this._escapeHtml(String(item?.type || 'unknown'))}</td></tr>`;
        }
    }

    formatDateTime(dateValue) {
        if (!dateValue) {
            return '';
        }
        
        try {
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime())) {
                return typeof dateValue === 'string' ? dateValue : '';
            }

            return date.toLocaleString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return typeof dateValue === 'string' ? dateValue : '';
        }
    }

    /**
     * Get status badge HTML - Fallback function
     * 
     * ⚠️ FALLBACK ONLY - משמש רק כ-Fallback אם FieldRendererService לא זמין
     * 
     * העדיפות היא להשתמש ב-FieldRendererService.renderStatus() אם זמין.
     * פונקציה זו משמשת רק במקרים שבהם FieldRendererService לא זמין.
     * 
     * @param {string} status - סטטוס הישות
     * @returns {string} HTML של badge סטטוס
     * @private
     */
    getStatusBadge(status) {
        if (!status) {
            return '<span class="badge bg-light text-muted">לא זמין</span>';
        }

        const normalized = String(status).toLowerCase();
        const classMap = {
            'open': 'badge bg-success',
            'active': 'badge bg-success',
            'triggered': 'badge bg-warning text-dark',
            'closed': 'badge bg-secondary',
            'inactive': 'badge bg-secondary',
            'cancelled': 'badge bg-danger',
            'archived': 'badge bg-dark'
        };
        const badgeClass = classMap[normalized] || 'badge bg-light text-dark';
        const label = (window.translateStatus && typeof window.translateStatus === 'function')
            ? window.translateStatus(status)
            : status;

        return `<span class="${badgeClass}">${label}</span>`;
    }

    getEntityIcon(entityType) {
        if (!entityType) {
            return '/trading-ui/images/icons/link.svg';
        }

        if (window.LinkedItemsService && window.LinkedItemsService.getLinkedItemIcon) {
            return window.LinkedItemsService.getLinkedItemIcon(entityType);
        }

        const iconMap = {
            'trading_account': '/trading-ui/images/icons/home.svg',
            'trade': '/trading-ui/images/icons/trades.svg',
            'trade_plan': '/trading-ui/images/icons/trade-plans.svg',
            'ticker': '/trading-ui/images/icons/ticker.svg',
            'alert': '/trading-ui/images/icons/alerts.svg',
            'execution': '/trading-ui/images/icons/executions.svg',
            'cash_flow': '/trading-ui/images/icons/cash-flow.svg',
            'note': '/trading-ui/images/icons/notes.svg',
            'position': '/trading-ui/images/icons/portfolio.svg'
        };

        return iconMap[entityType] || '/trading-ui/images/icons/link.svg';
    }
    
    /**
     * Render execution details - רנדור פרטי ביצוע
     * 
     * @param {Object} executionData - נתוני ביצוע
     * @param {Object} options - אפשרויות רנדור
     * @returns {string} - HTML מרונדר
     * @public
     */
    renderExecution(executionData, options = {}) {
        // קבלת צבע הביצוע מההעדפות
        const executionColor = this.entityColors.execution || '#17a2b8';
        
        // Execution לא כולל שדה status - זה לא ישות עם סטטוס
        const sourceInfo = (options && options.sourceInfo) ? options.sourceInfo : null;
        
        // הגדרת options לפריטים מקושרים - ללא פילטר
        const linkedItemsOptions = Object.assign({}, options || {}, {
            disableFilter: true
        });
        
        return `
            <div class="entity-details-container execution-details">
                
                <div class="row g-3">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(executionData, 'execution', executionColor)}
                    </div>
                    <div class="col-md-6">
                        ${this.renderExecutionSpecific(executionData, executionColor)}
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(
                            executionData.linked_items || [],
                            executionColor,
                            'execution',
                            executionData.id,
                            sourceInfo,
                            linkedItemsOptions
                        )}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render execution specific information - רנדור מידע ספציפי לביצוע
     */
    renderExecutionSpecific(executionData, executionColor = null) {
        const color = executionColor || this.entityColors.execution || '#17a2b8';
        
        // כמות ומחיר
        const quantity = executionData.quantity !== null && executionData.quantity !== undefined ? 
                       (window.renderShares ? window.renderShares(executionData.quantity) : executionData.quantity) : 
                       '-';
        const price = executionData.price !== null && executionData.price !== undefined ? 
                    `$${parseFloat(executionData.price).toFixed(2)}` : 
                    '-';
        
        // עמלה
        const fee = executionData.fee !== null && executionData.fee !== undefined ? 
                   `$${parseFloat(executionData.fee).toFixed(2)}` : 
                   '$0.00';
        
        // Realized P/L ו-MTM P/L
        const realizedPL = executionData.realized_pl !== null && executionData.realized_pl !== undefined ? 
                         (window.colorAmountByValue ? 
                             window.colorAmountByValue(executionData.realized_pl, `$${executionData.realized_pl.toFixed(2)}`) : 
                             `$${executionData.realized_pl.toFixed(2)}`) : 
                         '-';
        const mtmPL = executionData.mtm_pl !== null && executionData.mtm_pl !== undefined ? 
                     (window.colorAmountByValue ? 
                         window.colorAmountByValue(executionData.mtm_pl, `$${executionData.mtm_pl.toFixed(2)}`) : 
                         `$${executionData.mtm_pl.toFixed(2)}`) : 
                     '-';
        
        // סוג ביצוע
        const action = executionData.action || executionData.type || '-';
        const actionDisplay = action === 'buy' ? 'קנייה' : 
                             action === 'sell' || action === 'sale' ? 'מכירה' :
                             action === 'short' ? 'מכירה בחסר' :
                             action === 'cover' ? 'כיסוי' : action;
        
        // תאריך ביצוע
        const executionDate = executionData.date ? this.formatDateTime(executionData.date) : 'לא זמין';
        
        // מקור
        const source = executionData.source || '-';
        const sourceDisplay = source !== '-' ? this.translateSource(source) : 'לא זמין';
        
        // קישור לטרייד
        const tradeId = executionData.trade_id || null;
        const tradeSymbol = executionData.trade_ticker_symbol || 
                           (executionData.trade && executionData.trade.ticker_symbol) ||
                           '';
        
        // מזהה חיצוני
        const externalId = executionData.external_id || null;
        
        // הערות
        const notes = executionData.notes || null;
        
        return `
            <div class="execution-specific">
                <h6 class="border-bottom pb-2 mb-3">פרטי ביצוע</h6>
                
                <div class="mb-3">
                    <div class="d-flex align-items-center mb-1">
                        <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מקור:</label>
                        <span>
                            ${sourceDisplay !== 'לא זמין' ? 
                                `<span class="badge bg-info">${sourceDisplay}</span>` : 
                                '<span class="text-muted">לא זמין</span>'}
                        </span>
                    </div>
                    ${externalId ? `
                    <div class="mb-2">
                        <label class="form-label fw-bold me-2 mb-1 d-block" style="min-width: 120px;">מזהה חיצוני:</label>
                        <span class="badge bg-light text-dark d-inline-block" style="word-break: break-word; max-width: 100%; overflow-wrap: break-word; white-space: normal;">${externalId}</span>
                    </div>
                    ` : ''}
                    </div>
                    
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">עמלה:</label>
                    <span>${fee}</span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">Realized P/L:</label>
                    <span>${realizedPL}</span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">MTM P/L:</label>
                    <span>${mtmPL}</span>
                    </div>
                
                ${tradeId ? `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">קישור לטרייד:</label>
                    <span>
                        <a href="#" onclick="window.showEntityDetails('trade', ${tradeId}); return false;" class="entity-link" style="color: ${color};">
                            טרייד #${tradeId}${tradeSymbol ? ` (${tradeSymbol})` : ''}
                        </a>
                    </span>
                    </div>
                ` : ''}
                
                ${notes ? `
                <div class="mb-3">
                    <label class="form-label fw-bold">הערות:</label>
                    <p class="mb-0">${window.FieldRendererService && window.FieldRendererService.renderTextPreview ? 
                        window.FieldRendererService.renderTextPreview(notes, { maxLength: 500 }) : 
                        (notes.length > 500 ? notes.substring(0, 500) + '...' : notes)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Get default account preference value and name - קבלת ערך העדפה ושם חשבון ברירת מחדל
     * מחזיר אובייקט עם הערך והשם (אם קיים) - גם אם הערך הוא "all"
     * @returns {Promise<{value: string, accountName: string|null, profileId: number|null, displayText: string}>}
     * @private
     */
    async getDefaultAccountInfo() {
        try {
            window.Logger.info(`🔍 [getDefaultAccountInfo] Starting to get default account info...`, { page: "entity-details-renderer" });
            
            let preferenceValue = null;
            let profileId = null;
            
            // נסה לקבל את הערך מהעדפות דרך API - שם ההעדפה: default_trading_account
            try {
                const response = await fetch('/api/preferences/user/preference?name=default_trading_account');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data && result.data.value !== null && result.data.value !== undefined) {
                        preferenceValue = result.data.value;
                        profileId = result.data.profile_id;
                        window.Logger.info(`✅ [getDefaultAccountInfo] Got preference from API:`, {
                            value: preferenceValue,
                            profileId: profileId,
                            fullData: result.data,
                            page: "entity-details-renderer"
                        });
                    }
                }
            } catch (apiError) {
                window.Logger.warn('Error getting preference from API, trying other methods', apiError, { page: "entity-details-renderer" });
            }
            
            // Fallback - נסה דרך הפונקציות הגלובליות
            if (preferenceValue === null) {
                if (typeof window.getPreference === 'function') {
                    try {
                        preferenceValue = await window.getPreference('default_trading_account');
                        window.Logger.info(`✅ [getDefaultAccountInfo] Got preference from getPreference: ${preferenceValue}`, { page: "entity-details-renderer" });
                    } catch (prefError) {
                        window.Logger.debug('getPreference failed', prefError, { page: "entity-details-renderer" });
                    }
                }
                
                if (preferenceValue === null && typeof window.getCurrentPreference === 'function') {
                    try {
                        preferenceValue = await window.getCurrentPreference('default_trading_account');
                        window.Logger.info(`✅ [getDefaultAccountInfo] Got preference from getCurrentPreference: ${preferenceValue}`, { page: "entity-details-renderer" });
                    } catch (prefError) {
                        window.Logger.debug('getCurrentPreference failed', prefError, { page: "entity-details-renderer" });
                    }
                }
                
                if (preferenceValue === null && window.currentPreferences) {
                    if (window.currentPreferences.default_trading_account) {
                        preferenceValue = window.currentPreferences.default_trading_account;
                        window.Logger.info(`✅ [getDefaultAccountInfo] Got preference from currentPreferences.default_trading_account: ${preferenceValue}`, { page: "entity-details-renderer" });
                    }
                }
            }
            
            // אם אין ערך בכלל, אין חשבון ברירת מחדל
            if (preferenceValue === null || preferenceValue === undefined) {
                window.Logger.info(`⚠️ [getDefaultAccountInfo] No preference found for default_trading_account`, { page: "entity-details-renderer" });
                return {
                    value: null,
                    accountName: null,
                    profileId: profileId,
                    displayText: 'לא הוגדר חשבון ברירת מחדל'
                };
            }
            
            // אם הערך הוא "all" או לא תקין - אין חשבון ספציפי
            if (preferenceValue === 'all' || preferenceValue === '' || preferenceValue === null || preferenceValue === undefined) {
                window.Logger.info(`⚠️ [getDefaultAccountInfo] Preference value is 'all' or empty: ${preferenceValue}`, { page: "entity-details-renderer" });
                return {
                    value: preferenceValue || 'all',
                    accountName: null,
                    profileId: profileId,
                    displayText: 'לא הוגדר חשבון ספציפי (all)'
                };
            }
            
            // אם הערך הוא מספר - נחפש את שם החשבון
            const parsedId = parseInt(preferenceValue);
            if (!isNaN(parsedId) && parsedId > 0) {
                if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
                    const account = window.trading_accountsData.find(acc => acc.id === parsedId);
                    if (account && account.name) {
                        window.Logger.info(`✅ [getDefaultAccountInfo] Found account name: "${account.name}" for ID ${parsedId}`, { page: "entity-details-renderer" });
                        return {
                            value: preferenceValue,
                            accountId: parsedId,
                            accountName: account.name,
                            profileId: profileId,
                            displayText: account.name
                        };
                    } else {
                        window.Logger.warn(`⚠️ [getDefaultAccountInfo] Account ID ${parsedId} not found in trading_accountsData`, { page: "entity-details-renderer" });
                        return {
                            value: preferenceValue,
                            accountId: parsedId,
                            accountName: null,
                            profileId: profileId,
                            displayText: `חשבון #${parsedId} (לא נמצא)`
                        };
                    }
                } else {
                    window.Logger.warn(`⚠️ [getDefaultAccountInfo] trading_accountsData not available`, { page: "entity-details-renderer" });
                    return {
                        value: preferenceValue,
                        accountId: parsedId,
                        accountName: null,
                        profileId: profileId,
                        displayText: `חשבון #${parsedId} (נתונים לא זמינים)`
                    };
                }
            }
            
            // אם הערך אינו מספר תקין - נציג אותו כפי שהוא
            window.Logger.info(`⚠️ [getDefaultAccountInfo] Unknown preference value format: ${preferenceValue}`, { page: "entity-details-renderer" });
            return {
                value: preferenceValue,
                accountName: null,
                profileId: profileId,
                displayText: `ערך לא תקין: ${preferenceValue}`
            };
            
        } catch (error) {
            window.Logger.error('Error getting default account info:', error, { page: "entity-details-renderer" });
            return {
                value: 'all',
                accountName: null,
                profileId: null,
                displayText: 'שגיאה בטעינת העדפה'
            };
        }
    }

    async renderAccount(accountData, options = {}) {
        if (!this.entityColors.trading_account) {
            window.Logger.error('❌ trading_account color not found in entityColors!', { entityColors: this.entityColors }, { page: "entity-details-renderer" });
        }
        
        const accountColor = this.entityColors.trading_account || '#0d6efd';
        const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
            ? window.FieldRendererService.renderStatus(accountData.status, 'trading_account')
            : '';
        
        const accountName = accountData.name || accountData.account_name || 'לא מוגדר';
        
        const defaultAccountInfo = await this.getDefaultAccountInfo();
        const currentAccountId = accountData.id ? parseInt(accountData.id, 10) : null;
        let defaultAccountId = null;

        if (defaultAccountInfo && defaultAccountInfo.accountId !== undefined && defaultAccountInfo.accountId !== null) {
            defaultAccountId = parseInt(defaultAccountInfo.accountId, 10);
        } else if (defaultAccountInfo && typeof defaultAccountInfo.value === 'string') {
            const parsed = parseInt(defaultAccountInfo.value, 10);
            if (!Number.isNaN(parsed)) {
                defaultAccountId = parsed;
            }
        }

        let isDefaultAccount = Boolean(defaultAccountId && currentAccountId && defaultAccountId === currentAccountId);
        if (!isDefaultAccount && defaultAccountInfo && defaultAccountInfo.accountName) {
            const normalizedPrefName = String(defaultAccountInfo.accountName || '').trim().toLowerCase();
            const normalizedAccountName = String(accountName || '').trim().toLowerCase();
            if (normalizedPrefName && normalizedAccountName && normalizedPrefName === normalizedAccountName) {
                isDefaultAccount = true;
            }
        }
        accountData.is_default_trading_account = isDefaultAccount;
        
        const balancesData = (accountData.balances && typeof accountData.balances === 'object') ? accountData.balances : null;
        const currencySymbol = accountData.base_currency_symbol || balancesData?.base_currency || accountData.currency_symbol || '';
        const currencyName = accountData.base_currency_name || accountData.currency_name || balancesData?.base_currency_name || '';
        const formattingContext = { ...accountData };
        if (!formattingContext.currency_symbol && currencySymbol) {
            formattingContext.currency_symbol = currencySymbol;
        }

        const positionsValue = Number(accountData.positions_total_value ?? accountData.total_positions_value ?? balancesData?.positions_total_value ?? 0);
        const baseCurrencyTotalValue = Number(accountData.base_currency_total ?? accountData.base_currency_balance ?? balancesData?.base_currency_total ?? 0);
        const totalAccountValue = Number(accountData.total_account_value ?? accountData.account_total_value ?? balancesData?.total_account_value ?? (baseCurrencyTotalValue + positionsValue));
        const currencyBalancesSource = Array.isArray(accountData.currency_balances) && accountData.currency_balances.length
            ? accountData.currency_balances
            : (Array.isArray(balancesData?.currencies) ? balancesData.currencies : []);
        const currencyBalancesRaw = currencyBalancesSource.map(balance => ({
            currency_id: balance.currency_id,
            currency_symbol: balance.currency_symbol,
            currency_name: balance.currency_name,
            balance: typeof balance.balance === 'number' ? balance.balance : Number(balance.balance || 0),
            is_base: Boolean(balance.is_base)
        }));
        const currencyBalances = currencyBalancesRaw.filter(item => Math.abs(item.balance || 0) > 0.0001);

        const baseCurrencyLabelText = currencySymbol
            ? `${currencySymbol}${currencyName ? ` (${currencyName})` : ''}`
            : (currencyName || '-');
        const baseCurrencyHtml = this.formatFieldValue(baseCurrencyLabelText, 'text', accountColor, 'base_currency', formattingContext);
        const defaultAccountHtml = this.formatFieldValue(isDefaultAccount, 'boolean', accountColor, 'is_default_trading_account', accountData);
        const positionsValueHtml = this.formatFieldValue(positionsValue, 'currency', accountColor, 'positions_total_value', formattingContext);
        const totalAccountValueHtml = this.formatFieldValue(totalAccountValue, 'currency', accountColor, 'total_account_value', formattingContext);
        const baseCurrencyTotalHtml = this.formatFieldValue(baseCurrencyTotalValue, 'currency', accountColor, 'base_currency_total', formattingContext);
        const createdAtHtml = this.formatFieldValue(accountData.created_at, 'datetime', accountColor, 'created_at', accountData);
        const notesHtml = accountData.notes && String(accountData.notes).trim()
            ? this.formatFieldValue(accountData.notes, 'text', accountColor, 'notes', accountData)
            : '<span class="text-muted">אין הערות</span>';

        const balancesListHtml = currencyBalances.length
            ? currencyBalances.map(item => {
                const balanceContext = { ...formattingContext };
                if (item.currency_symbol) {
                    balanceContext.currency_symbol = item.currency_symbol;
                }
                const balanceHtml = this.formatFieldValue(item.balance, 'currency', accountColor, 'currency_balance', balanceContext);
                const labelSymbol = item.currency_symbol || '';
                const labelName = item.currency_name || '';
                const labelText = labelSymbol
                    ? `${labelSymbol}${labelName ? ` (${labelName})` : ''}`
                    : (labelName || (item.currency_id ? `מטבע ${item.currency_id}` : 'מטבע'));
                return `
                    <li class="d-flex justify-content-between align-items-center py-1">
                        <span class="text-muted">${labelText}</span>
                        ${balanceHtml}
                    </li>
                `;
            }).join('')
            : '<li class="text-muted">אין יתרות פעילות</li>';

        let linkedItemsArray = Array.isArray(accountData.linked_items) ? accountData.linked_items : [];
        if ((!linkedItemsArray || linkedItemsArray.length === 0) && window.entityDetailsAPI && typeof window.entityDetailsAPI.getLinkedItems === 'function') {
            try {
                const fetchedLinkedItems = await window.entityDetailsAPI.getLinkedItems('trading_account', currentAccountId || accountData.id);
                if (Array.isArray(fetchedLinkedItems)) {
                    linkedItemsArray = fetchedLinkedItems;
                    accountData.linked_items = fetchedLinkedItems;
                }
            } catch (linkedItemsError) {
                window.Logger?.warn('⚠️ Failed to load trading account linked items in renderer', linkedItemsError, { page: 'entity-details-renderer' });
            }
        }

        const linkedItemsSection = this.renderLinkedItems(
            linkedItemsArray,
            accountColor,
            'trading_account',
            accountData.id,
            options?.sourceInfo || null,
            options
        );

        return `
            <div class="entity-details-container account-details entity-details-card p-4">
                <div class="entity-card-header d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 mb-4">
                    <div class="d-flex align-items-center gap-3">
                        <span class="entity-card-title fs-4 fw-bold">${accountName}</span>
                        ${statusDisplay || ''}
                    </div>
                        </div>
                        
                <div class="row g-3 align-items-stretch">
                    <div class="col-lg-6">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="card-header bg-transparent border-bottom">
                                <h6 class="mb-0">מידע חשבון</h6>
                            </div>
                            <div class="card-body">
                                <div class="list-group list-group-flush border-0">
                                    <div class="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                                        <span class="text-muted">מזהה</span>
                                        <span class="fw-bold">${accountData.id ?? '-'}</span>
                            </div>
                                    <div class="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                                        <span class="text-muted">מטבע ראשי</span>
                                        ${baseCurrencyHtml}
                        </div>
                                    <div class="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                                        <span class="text-muted">חשבון ברירת מחדל</span>
                                        ${defaultAccountHtml}
                    </div>
                                    <div class="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                                        <span class="text-muted">תאריך יצירה</span>
                                        ${createdAtHtml}
                </div>
                                    <div class="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                                        <span class="text-muted">סה״כ שווי פוזיציות</span>
                                        ${positionsValueHtml}
                            </div>
                                    <div class="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                                        <span class="text-muted">סה״כ שווי חשבון</span>
                                        ${totalAccountValueHtml}
                            </div>
                            </div>
                                <div class="mt-4">
                                    <h6 class="text-muted mb-2">הערות</h6>
                                    <div class="border rounded p-3 bg-light">${notesHtml}</div>
                        </div>
                    </div>
                </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="card-header bg-transparent border-bottom">
                                <h6 class="mb-0">יתרות מטבע</h6>
                    </div>
                            <div class="card-body d-flex flex-column">
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="text-muted">סה״כ שווי פוזיציות</span>
                                        ${positionsValueHtml}
                </div>
                                    <div class="d-flex justify-content-between align-items-center mt-2">
                                        <span class="text-muted">סה״כ שווי חשבון</span>
                                        ${totalAccountValueHtml}
                    </div>
                                </div>
                                <ul class="list-unstyled mb-4 flex-grow-1">
                                    ${balancesListHtml}
                                </ul>
                                <div class="pt-3 border-top small text-muted">
                                    הנתונים כוללים יתרות פעילות בלבד. שערי ההמרה העדכניים: ${Object.keys(accountData.exchange_rates_used || {}).length ? Object.entries(accountData.exchange_rates_used).map(([symbol, rate]) => `${symbol}: ${Number(rate).toFixed(4)}`).join(', ') : 'לא זמינים'}
                </div>
                    </div>
                        </div>
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${linkedItemsSection}
                    </div>
                </div>
            </div>
        `;
    }
    renderAlert(alertData, options) {
        try {
            // סטטוס למעלה - שימוש במערכת הרינדור הכללית
            const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
                ? window.FieldRendererService.renderStatus(alertData.status, 'alert')
                : '';
            
            // יצירת כותרת המודול
            
            // יצירת מידע בסיסי + ספציפי להתראה
            const alertDetailsRow = this.renderAlertDetails(alertData);
            
            // יצירת תנאי ההתראה
            const alertCondition = this.renderAlertCondition(alertData);
            const alertConditionSection = alertCondition ? `
                <div class="row g-3 mt-3">
                    <div class="col-12">
                        ${alertCondition}
                    </div>
                </div>
            ` : '';
            
            // יצירת פריטים מקושרים (ללא פילטר)
            const linkedItems = this.renderLinkedItems(
                alertData.linked_items || [],
                this.entityColors.alert || '#ffc107',
                'alert',
                alertData.id,
                options?.sourceInfo || null,
                Object.assign({}, options || {}, { disableFilter: true })
            );
            const linkedItemsSection = linkedItems ? `
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${linkedItems}
                    </div>
                </div>
            ` : '';
            
            return `
                <div class="entity-details-content">
                    <div class="entity-details-body">
                        <!-- סטטוס למעלה -->
                        ${statusDisplay ? `<div class="mb-3 d-flex justify-content-start align-items-center gap-2">
                            <strong>סטטוס:</strong>
                            ${statusDisplay}
                        </div>` : ''}
                        
                        ${alertDetailsRow}
                        ${alertConditionSection}
                        ${linkedItemsSection}
                    </div>
                </div>
            `;
            
        } catch (error) {
            window.Logger.error('Error rendering alert:', error, { page: "entity-details-renderer" });
            return '<div class="alert alert-danger">שגיאה בטעינת פרטי ההתראה</div>';
        }
    }

    /**
     * Render alert-specific information - רנדור מידע ספציפי להתראה
     */
    renderAlertSpecific(alertData) {
        return ''; // נשמר לשימוש עתידי במקרה שנרצה לספק גרסה נוספת
    }

    /**
     * Render alert metadata and message in two columns
     * @param {Object} alertData
     * @returns {string}
     */
    renderAlertDetails(alertData = {}) {
        const triggeredState = this.getAlertTriggeredState(
            alertData.is_triggered !== undefined ? alertData.is_triggered : alertData.triggered
        );
        const triggeredBadge = `<span class="triggered-badge ${triggeredState.cssClass}">${triggeredState.label}</span>`;
        const createdAtDisplay = this.formatDateTime(alertData.created_at) || 'לא זמין';
        const expiryDisplay = alertData.expiry_date
            ? this.formatDate(alertData.expiry_date)
            : 'ללא';
        const triggeredAtDisplay = alertData.triggered_at
            ? this.formatDateTime(alertData.triggered_at)
            : '';
        const messageHtml = alertData.message && String(alertData.message).trim()
            ? alertData.message
            : '<span class="text-muted">אין הודעה</span>';
        
        return `
            <div class="row g-3 align-items-start">
                <div class="col-md-6">
                    <div class="d-flex flex-column gap-2">
                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                            <span class="text-muted fw-bold">מספר:</span>
                            <span class="text-break">${alertData.id ?? '-'}</span>
                    </div>
                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                            <span class="text-muted fw-bold">הופעל:</span>
                            <span class="text-break">${triggeredBadge}</span>
                    </div>
                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                            <span class="text-muted fw-bold">תאריך יצירה:</span>
                            <span class="text-break">${createdAtDisplay}</span>
                    </div>
                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                            <span class="text-muted fw-bold">תאריך תפוגה:</span>
                            <span class="text-break">${expiryDisplay}</span>
                    </div>
                        ${triggeredAtDisplay ? `
                            <div class="d-flex justify-content-between align-items-center flex-wrap">
                                <span class="text-muted fw-bold">תאריך הפעלה:</span>
                                <span class="text-break">${triggeredAtDisplay}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="d-flex flex-column gap-2">
                        <span class="text-muted fw-bold">הודעה:</span>
                        <div class="text-break" dir="auto">
                            ${messageHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render alert condition - רנדור תנאי ההתראה
     */
    renderAlertCondition(alertData) {
        if (!alertData.condition_display_text && !alertData.condition) {
            return '';
        }
        
        const conditionText = alertData.condition_display_text || this.getAlertConditionText(alertData);
        
        return `
            <div class="info-section">
                <h4>תנאי ההתראה</h4>
                <div class="condition-display">
                    <div class="condition-text">${conditionText}</div>
                </div>
            </div>
        `;
    }

    /**
     * Render entity action buttons (view/edit/delete) using existing linked items system
     * @param {string} entityType
     * @param {number|string} entityId
     * @param {Object} entityData
     * @param {Object|null} sourceInfo
     * @returns {string}
     */
    renderActionButtons(entityType, entityId, entityData = {}, sourceInfo = null) {
        if (!entityType || entityId === null || entityId === undefined) {
            return '';
        }

        const hasLinkedItemsService = !!(window.LinkedItemsService && typeof window.LinkedItemsService.generateLinkedItemActions === 'function');

        const normalizedId = this._normalizeLinkedItemId(entityId);
        if (normalizedId === null || normalizedId === undefined) {
            return '';
        }

        if (window.Logger) {
            window.Logger.info('🛠️ [renderActionButtons] start', {
                entityType,
                entityId: normalizedId,
                hasLinkedItemsService,
                hasSourceInfo: !!sourceInfo,
                currentEntityType: this.currentEntityType,
                currentEntityId: this.currentEntityId,
                page: 'entity-details-renderer'
            });
        }

        if (!hasLinkedItemsService) {
            if (window.Logger) {
                window.Logger.warn('⚠️ [renderActionButtons] LinkedItemsService missing, returning empty markup', {
                    entityType,
                    entityId: normalizedId,
                    page: 'entity-details-renderer'
                });
            }
            return '';
        }

        const itemForActions = {
            type: entityType,
            id: normalizedId,
            status: entityData.status || entityData.state || null,
            side: entityData.side || null,
            investment_type: entityData.investment_type || entityData.trade_type || null
        };

        const actionSourceInfo = sourceInfo || {
            sourceModal: 'entity-details',
            sourceType: this.currentEntityType || entityType,
            sourceId: this.currentEntityId || normalizedId
        };

        const actionsHtml = window.LinkedItemsService.generateLinkedItemActions(itemForActions, 'modal', {
            entityColors: this.entityColors,
            sourceInfo: actionSourceInfo
        }) || '';

        if (window.Logger) {
            window.Logger.info('🛠️ [renderActionButtons] generated HTML', {
                entityType,
                entityId: normalizedId,
                actionsLength: actionsHtml.length,
                containsViewButton: actionsHtml.includes('data-button-type="VIEW"'),
                page: 'entity-details-renderer'
            });
        }

        if (!actionsHtml || !actionsHtml.trim()) {
            return '';
        }

        return `
            <div class="entity-details-actions mt-4 d-flex justify-content-end">
                ${actionsHtml}
            </div>
        `;
    }

    /**
     * Get alert condition text - קבלת טקסט תנאי ההתראה
     */
    getAlertConditionText(alertData) {
        if (!alertData.condition_attribute || !alertData.condition_operator || !alertData.condition_number) {
            return 'תנאי לא מוגדר';
        }
        
        const attribute = this.getConditionAttributeLabel(alertData.condition_attribute);
        const operator = this.getConditionOperatorLabel(alertData.condition_operator);
        const number = alertData.condition_number;
        
        return `${attribute} ${operator} ${number}`;
    }

    /**
     * Get condition attribute label - קבלת תווית מאפיין התנאי
     */
    getConditionAttributeLabel(attribute) {
        const labels = {
            'price': 'מחיר',
            'volume': 'נפח',
            'change_percent': 'שינוי באחוזים',
            'change_amount': 'שינוי בסכום'
        };
        return labels[attribute] || attribute;
    }

    /**
     * Get condition operator label - קבלת תווית אופרטור התנאי
     */
    getConditionOperatorLabel(operator) {
        const labels = {
            'greater_than': 'גדול מ',
            'less_than': 'קטן מ',
            'equals': 'שווה ל',
            'greater_than_or_equal': 'גדול או שווה ל',
            'less_than_or_equal': 'קטן או שווה ל'
        };
        return labels[operator] || operator;
    }

    /**
     * Get status class - קבלת מחלקת סטטוס
     */
    getStatusClass(status) {
        const classes = {
            'open': 'status-open',
            'closed': 'status-closed',
            'cancelled': 'status-cancelled',
            'triggered': 'status-triggered'
        };
        return classes[status] || 'status-unknown';
    }

    /**
     * Get status label - קבלת תווית סטטוס
     */
    getStatusLabel(status) {
        const labels = {
            'open': 'פתוח',
            'closed': 'סגור',
            'cancelled': 'מבוטל',
            'triggered': 'הופעל'
        };
        return labels[status] || status;
    }

    /**
     * Get triggered class - קבלת מחלקת הופעל
     */
    getTriggeredClass(triggered) {
        return triggered ? 'triggered-yes' : 'triggered-no';
    }

    /**
     * Get triggered label - קבלת תווית הופעל
     */
    getTriggeredLabel(triggered) {
        return triggered ? 'כן' : 'לא';
    }

    /**
     * Normalize alert triggered state (false/new/true)
     * @param {string|boolean|null|undefined} triggeredValue
     * @returns {{cssClass: string, label: string}}
     */
    getAlertTriggeredState(triggeredValue) {
        const value = (typeof triggeredValue === 'string')
            ? triggeredValue.toLowerCase().trim()
            : triggeredValue;

        if (value === true || value === 'true' || value === 'yes' || value === '1') {
            return {
                cssClass: 'triggered-yes',
                label: 'כן'
            };
        }

        if (value === 'new' || value === 'pending') {
            return {
                cssClass: 'triggered-new',
                label: 'חדש'
            };
        }

        return {
            cssClass: 'triggered-no',
            label: 'לא'
        };
    }

    /**
     * Format date - עיצוב תאריך
     */
    formatDate(dateString) {
        if (!dateString) return 'לא זמין';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }
    renderCashFlow(cashFlowData, options = {}) {
        const entityColor = this.entityColors.cash_flow || '#fd7e14';
        
        // 🔍 DEBUG: Log all cash flow data for debugging
        console.group('🔍 [CASH_FLOW_DEBUG] Rendering cash flow');
        console.log('ID:', cashFlowData.id);
        console.log('Type:', cashFlowData.type);
        console.log('Amount:', cashFlowData.amount);
        console.log('Source:', cashFlowData.source);
        console.log('External ID:', cashFlowData.external_id);
        console.log('Date:', cashFlowData.date);
        console.log('Trading Account ID:', cashFlowData.trading_account_id);
        console.log('Account Name:', cashFlowData.account_name);
        console.log('Trading Account Name:', cashFlowData.trading_account_name);
        console.log('Currency ID:', cashFlowData.currency_id);
        console.log('Currency Symbol:', cashFlowData.currency_symbol);
        console.log('Currency Code:', cashFlowData.currency_code);
        console.log('Account Object:', cashFlowData.account);
        console.log('Currency Object:', cashFlowData.currency);
        console.log('Trading Account Object:', cashFlowData.trading_account);
        console.log('All Keys:', Object.keys(cashFlowData));
        console.log('Full Data Object:', cashFlowData);
        console.groupEnd();
        if (window.Logger) {
            window.Logger.debug('🔍 [CASH_FLOW_DEBUG] Rendering cash flow with data:', {
                id: cashFlowData.id,
                type: cashFlowData.type,
                amount: cashFlowData.amount,
                source: cashFlowData.source,
                external_id: cashFlowData.external_id,
                date: cashFlowData.date,
                trading_account_id: cashFlowData.trading_account_id,
                account_name: cashFlowData.account_name,
                trading_account_name: cashFlowData.trading_account_name,
                currency_id: cashFlowData.currency_id,
                currency_symbol: cashFlowData.currency_symbol,
                currency_code: cashFlowData.currency_code,
                account: cashFlowData.account,
                currency: cashFlowData.currency,
                trading_account: cashFlowData.trading_account,
                allKeys: Object.keys(cashFlowData),
                fullData: cashFlowData
            }, { page: 'entity-details-renderer' });
        }
        
        return `
            <div class="entity-details-container cash-flow-details">
                <div class="row g-3">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(cashFlowData, 'cash_flow')}
                    </div>
                    <div class="col-md-6">
                        ${this.renderCashFlowSpecific(cashFlowData, { section: 'secondary' })}
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderCashFlowLinkedItems(cashFlowData)}
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderActionButtons('cash_flow', cashFlowData.id, cashFlowData, options?.sourceInfo || null)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render cash flow specific information - רנדור מידע ספציפי לתזרים מזומנים
     */
    renderCashFlowSpecific(cashFlowData, options = {}) {
        const section = (options && options.section) ? options.section : 'primary';
        const { symbol, name, displayHtml } = this._resolveCashFlowCurrencyDetails(cashFlowData);
        const amount = Number(cashFlowData.amount || 0);
        const flowDate = cashFlowData.date || cashFlowData.flow_date || cashFlowData.created_at || null;
        const formattedDate = flowDate ? this.formatDate(flowDate) : 'לא זמין';

        const amountHtml = (window.FieldRendererService && window.FieldRendererService.renderAmount)
            ? window.FieldRendererService.renderAmount(amount, symbol || '', 0, true)
            : `<span class="${amount >= 0 ? 'text-success' : 'text-danger'} fw-bold" dir="ltr">${(symbol || '')}${Math.abs(amount).toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>`;

        if (section === 'primary') {
            const typeHtml = cashFlowData.type
                ? (window.FieldRendererService && window.FieldRendererService.renderType
                    ? window.FieldRendererService.renderType(cashFlowData.type, amount)
                    : `<span class="badge bg-secondary">${this.translateCashFlowType(cashFlowData.type)}</span>`)
                : '<span class="text-muted">לא זמין</span>';

            const currencyNameDisplay = name || 'לא זמין';
        
        return `
                <div class="cash-flow-primary">
                    <h6 class="border-bottom pb-2 mb-3">נתונים כספיים</h6>

                    <div class="mb-3 d-flex align-items-center">
                        <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך:</label>
                        <span class="text-muted">${formattedDate}</span>
                    </div>

                    <div class="mb-3 d-flex align-items-center">
                        <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סוג תזרים:</label>
                        ${typeHtml}
                </div>
                
                    <div class="mb-3 d-flex align-items-center">
                        <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סכום:</label>
                        <div class="d-flex align-items-center gap-2">
                            ${amountHtml}
                        </div>
                </div>
                
                    <div class="mb-3 d-flex align-items-center">
                        <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מטבע:</label>
                        <span class="text-muted">${currencyNameDisplay}</span>
                </div>
                </div>
            `;
        }

        const feeAmount = Number(cashFlowData.fee_amount || 0);
        const feeHtml = (window.FieldRendererService && window.FieldRendererService.renderAmount)
            ? window.FieldRendererService.renderAmount(feeAmount, symbol || '', 0, true)
            : `<span class="${feeAmount >= 0 ? 'text-success' : 'text-danger'} fw-bold" dir="ltr">${(symbol || '')}${Math.abs(feeAmount).toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>`;

        let tradeDisplay = '<span class="text-muted">לא מקושר</span>';
        if (cashFlowData.trade_id) {
            const tradeLabel = cashFlowData.trade_symbol ||
                (cashFlowData.trade_ticker_symbol ? `${cashFlowData.trade_ticker_symbol} #${cashFlowData.trade_id}` : `טרייד #${cashFlowData.trade_id}`);
            if (window.FieldRendererService && window.FieldRendererService.renderLinkedEntity) {
                tradeDisplay = window.FieldRendererService.renderLinkedEntity('trade', cashFlowData.trade_id, tradeLabel, {
                    renderMode: 'details',
                    status: cashFlowData.trade_status,
                    side: cashFlowData.trade_side
                });
            } else {
                tradeDisplay = `
                    <a href="#" class="entity-link d-inline-flex align-items-center gap-2" onclick="window.showEntityDetails('trade', ${cashFlowData.trade_id}); return false;">
                        <span class="badge bg-primary-subtle text-primary">🔗</span>
                        <span>${tradeLabel}</span>
                    </a>
                `;
            }
        }

        const sourceDisplay = cashFlowData.source
            ? `<span class="badge bg-info">${this.translateCashFlowSource(cashFlowData.source)}</span>`
            : '<span class="text-muted">לא זמין</span>';

        const externalIdDisplay = cashFlowData.external_id
            ? `<span class="badge bg-light text-dark text-break" style="word-break: break-word; max-width: 100%;">${cashFlowData.external_id}</span>`
            : '<span class="text-muted">לא זמין</span>';

        return `
            <div class="cash-flow-secondary mt-4">

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">עמלה:</label>
                    <div class="d-flex align-items-center gap-2">
                        ${feeHtml}
                    </div>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מקור:</label>
                    ${sourceDisplay}
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מזהה חיצוני:</label>
                    ${externalIdDisplay}
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">טרייד מקושר:</label>
                    <span class="d-flex align-items-center gap-2">${tradeDisplay}</span>
                </div>
            </div>
        `;
    }

    _resolveCashFlowCurrencyDetails(cashFlowData) {
        const fallbackSymbols = {
            USD: '$',
            ILS: '₪',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CAD: 'C$',
            AUD: 'A$',
            CHF: '₣',
            NZD: 'NZ$',
            SEK: 'kr',
            NOK: 'kr',
            DKK: 'kr',
            ZAR: 'R',
            CNY: '¥',
            HKD: 'HK$',
            SGD: 'S$',
            RUB: '₽',
            TRY: '₺',
            INR: '₹',
            MXN: '$'
        };

        let symbol = cashFlowData.currency_symbol ||
            (cashFlowData.currency && (cashFlowData.currency.symbol || cashFlowData.currency.code)) ||
            '';
        let name = cashFlowData.currency_name ||
            (cashFlowData.currency && cashFlowData.currency.name) ||
            '';
        let code = cashFlowData.currency_code ||
            (cashFlowData.currency && (cashFlowData.currency.code || cashFlowData.currency.symbol)) ||
            '';

        if (!code && typeof symbol === 'string' && symbol.length === 3 && /^[A-Z]+$/.test(symbol)) {
            code = symbol;
        }

        if (cashFlowData.currency_id && typeof window !== 'undefined' && typeof window.getCurrencyDisplay === 'function') {
            try {
                const currencyInfo = window.getCurrencyDisplay(cashFlowData.currency_id);
                if (currencyInfo) {
                    if (currencyInfo.symbol) {
                        symbol = currencyInfo.symbol;
                    }
                    if (currencyInfo.name) {
                        name = currencyInfo.name;
                    }
                    if (currencyInfo.code) {
                        code = currencyInfo.code;
                    }
                }
            } catch (error) {
                window.Logger?.warn('⚠️ [CASH_FLOW_RENDER] getCurrencyDisplay failed', error, { page: 'entity-details-renderer' });
            }
        }

        if ((!symbol || /^[A-Z]{3}$/.test(symbol || '')) && code) {
            const mapped = fallbackSymbols[String(code).toUpperCase()];
            if (mapped) {
                symbol = mapped;
            }
        }

        if (symbol && /^[A-Z]{3}$/.test(symbol)) {
            symbol = '';
        }

        let displayHtml = '<span class="text-muted">לא זמין</span>';
        if (symbol || name) {
            if (window.FieldRendererService && typeof window.FieldRendererService.renderCurrency === 'function') {
                displayHtml = window.FieldRendererService.renderCurrency(
                    cashFlowData.currency_id || null,
                    name,
                    symbol || ''
                );
            } else {
                const combined = `${symbol || ''}${name ? ` (${name})` : ''}`.trim();
                displayHtml = `<span class="text-muted" dir="ltr">${combined || name || symbol || ''}</span>`;
            }
        }

        return {
            symbol: typeof symbol === 'string' ? symbol : '',
            name: typeof name === 'string' ? name : '',
            displayHtml
        };
    }

    /**
     * Translate cash flow type - תרגום סוג תזרים
     */
    translateCashFlowType(type) {
        const translations = {
            'deposit': 'הפקדה',
            'withdrawal': 'משיכה',
            'transfer_in': 'העברה מחשבון אחר',
            'transfer_out': 'העברה לחשבון אחר',
            'fee': 'עמלה',
            'dividend': 'דיבידנד',
            'interest': 'ריבית',
            'other_positive': 'אחר חיובי',
            'other_negative': 'אחר שלילי',
            'opening_balance': 'יתרת פתיחה'
        };
        const key = (type || '').toLowerCase();
        return translations[key] || type;
    }

    translateNoteRelationType(rawType) {
        if (!rawType) {
            return '';
        }

        const normalized = String(rawType).toLowerCase().replace(/[-\s]/g, '_');
        const mapping = {
            'trade': 'טרייד',
            'trades': 'טרייד',
            'trade_plan': 'תכנית מסחר',
            'trade_plans': 'תכנית מסחר',
            'ticker': 'טיקר',
            'tickers': 'טיקר',
            'trading_account': 'חשבון מסחר',
            'trading_accounts': 'חשבון מסחר',
            'account': 'חשבון מסחר',
            'accounts': 'חשבון מסחר',
            'execution': 'ביצוע',
            'executions': 'ביצוע',
            'cash_flow': 'תזרים',
            'cash_flows': 'תזרים',
            'alert': 'התראה',
            'alerts': 'התראה',
            'note': 'הערה',
            'notes': 'הערה'
        };

        return mapping[normalized] || rawType;
    }

    /**
     * Translate cash flow source - תרגום מקור תזרים
     */
    translateCashFlowSource(source) {
        if (!source) return 'לא זמין';
        
        const translations = {
            'manual': 'ידני',
            'api': 'API',
            'import': 'ייבוא',
            'file_import': 'ייבוא קובץ',
            'direct_import': 'ייבוא ישיר',
            'system': 'מערכת'
        };
        return translations[source] || source;
    }

    /**
     * Render cash flow linked items - רנדור פריטים מקושרים לתזרים מזומנים
     */
    renderCashFlowLinkedItems(cashFlowData) {
        // Use the general renderLinkedItems method like other entities
        let linkedItems = Array.isArray(cashFlowData.linked_items) ? [...cashFlowData.linked_items] : [];
        const entityColor = this.entityColors.cash_flow || '#fd7e14';

        const tradingAccountId = cashFlowData.trading_account_id 
            || cashFlowData.account?.id 
            || cashFlowData.account_id 
            || null;
        const tradingAccountName = cashFlowData.trading_account_name 
            || cashFlowData.account_name 
            || cashFlowData.account?.name 
            || (tradingAccountId ? `חשבון #${tradingAccountId}` : null);

        if (tradingAccountId) {
            const hasTradingAccountLinked = linkedItems.some(item => {
                if (!item) return false;
                const itemType = (item.type || item.entity_type || '').toLowerCase();
                const itemId = Number(item.id ?? item.entity_id ?? item.linked_id);
                return ['trading_account', 'account'].includes(itemType) && !Number.isNaN(itemId) && itemId === Number(tradingAccountId);
            });

            if (!hasTradingAccountLinked) {
                linkedItems.push({
                    id: tradingAccountId,
                    type: 'trading_account',
                    title: tradingAccountName,
                    name: tradingAccountName,
                    status: cashFlowData.account?.status || null,
                    created_at: cashFlowData.created_at || null,
                    description: tradingAccountName ? `חשבון מסחר: ${tradingAccountName}` : 'חשבון מסחר מקושר'
                });
            }
        }

        return this.renderLinkedItems(linkedItems, entityColor, 'cash_flow', cashFlowData.id, null, { disableFilter: true });
    }

    /**
     * Get entity label - קבלת תווית ישות
     */
    /**
     * Generate filter buttons HTML based on configuration
     * @private
     * @param {string} tableId - Table ID
     * @param {Array<string>} entityTypes - Array of entity types to show as filter buttons
     * @returns {string} HTML for all filter buttons
     */
    _generateFilterButtons(tableId, entityTypes) {
        if (!Array.isArray(entityTypes) || entityTypes.length === 0) {
            return '';
        }
        
        // Use Set to prevent duplicate buttons
        const uniqueEntityTypes = [...new Set(entityTypes)];
        
        return uniqueEntityTypes.map(entityType => this._generateFilterButton(entityType, tableId)).join('');
    }
    
    /**
     * Generate filter button HTML with icon only using central button system
     * Uses data-tooltip for tooltip support through button system
     * @private
     * @param {string} entityType - Entity type
     * @param {string} tableId - Table ID
     * @returns {string} HTML for filter button
     */
    _generateFilterButton(entityType, tableId) {
        const iconPath = (window.LinkedItemsService && window.LinkedItemsService.getLinkedItemIcon)
            ? window.LinkedItemsService.getLinkedItemIcon(entityType)
            : '/trading-ui/images/icons/home.svg';
        
        const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel)
            ? window.LinkedItemsService.getEntityLabel(entityType)
            : ((window.getEntityLabel && typeof window.getEntityLabel === 'function')
                ? window.getEntityLabel(entityType)
                : entityType);
        
        // Create clear and descriptive tooltip text
        const tooltipText = `סינון לפי ${entityLabel}`;
        
        // Generate unique ID for the button
        const buttonId = `filterBtn_${tableId}_${entityType}`;
        
        // Create button with icon as img tag
        // Use data-tooltip for tooltip support through button system
        // Button system will process and initialize tooltip automatically
        return `
            <button 
                class="btn btn-sm btn-outline-primary filter-icon-btn" 
                id="${buttonId}"
                data-type="${entityType}"
                data-onclick="window.filterLinkedItemsByType('${tableId}', '${entityType}')"
                data-tooltip="${tooltipText}"
                data-tooltip-placement="top"
                data-tooltip-trigger="hover"
                style="padding: 4px 8px; display: inline-flex; align-items: center; justify-content: center; min-width: 32px;">
                <img src="${iconPath}" alt="${entityLabel}" class="filter-icon" style="width: 20px; height: 20px; display: block;">
            </button>
        `;
    }
    
    getEntityLabel(entityType) {
        const labels = {
            'ticker': 'טיקר',
            'trade': 'טרייד',
            'trade_plan': 'תכנון',
            'execution': 'ביצוע',
            'trading_account': 'חשבון מסחר',
            'alert': 'התראה',
            'cash_flow': 'תזרים',
            'note': 'הערה'
        };
        return labels[entityType] || entityType;
    }
    
    /**
     * Get status display or alternative data for entities without status
     * @private
     * @param {Object} item - Linked item object
     * @returns {string} HTML for status or alternative display
     */
    _getStatusOrAlternativeDisplay(item) {
        const entityType = String(item.type || '').toLowerCase();
        
        // Entities that have status - show status
        if (['trade', 'trade_plan', 'alert', 'trading_account', 'ticker'].includes(entityType)) {
            if (window.FieldRendererService && window.FieldRendererService.renderStatus) {
                return window.FieldRendererService.renderStatus(item.status, item.type);
            }
            return this.getStatusBadge(item.status);
        }
        
        // Entities without status - show alternative data
        if (entityType === 'note') {
            // Show note content (truncated)
            const content = item.content || item.note_content || '';
            const truncatedContent = content.length > 50 
                ? content.substring(0, 50) + '...' 
                : content;
            return truncatedContent 
                ? `<span class="text-muted small" data-tooltip="${this._escapeHtml(content)}" data-tooltip-placement="top">${this._escapeHtml(truncatedContent)}</span>`
                : '<span class="text-muted">אין תוכן</span>';
        }
        
        if (entityType === 'cash_flow') {
            // Show cash flow type and amount
            const flowType = item.type || item.flow_type || '';
            const amount = item.amount || 0;
            const currencySymbol = item.currency_symbol || '$';
            const typeDisplay = flowType ? `<span class="badge bg-info text-dark me-1">${this._escapeHtml(String(flowType))}</span>` : '';
            const amountDisplay = amount !== 0 ? `${currencySymbol}${parseFloat(amount).toFixed(2)}` : '-';
            return `${typeDisplay}${amountDisplay}`;
        }
        
        if (entityType === 'execution') {
            // Show side and quantity
            const side = item.side || '';
            const quantity = item.quantity || 0;
            const sideDisplay = side && window.FieldRendererService && window.FieldRendererService.renderSide
                ? window.FieldRendererService.renderSide(side)
                : (side ? `<span class="badge bg-secondary me-1">${this._escapeHtml(String(side))}</span>` : '');
            const quantityDisplay = quantity ? `<span class="text-muted">כמות: ${parseFloat(quantity).toFixed(2)}</span>` : '';
            return sideDisplay ? `${sideDisplay} ${quantityDisplay}`.trim() : quantityDisplay || '<span class="text-muted">-</span>';
        }
        
        // Default: show status if exists, otherwise show "-"
        if (item.status !== null && item.status !== undefined) {
            if (window.FieldRendererService && window.FieldRendererService.renderStatus) {
                return window.FieldRendererService.renderStatus(item.status, item.type);
            }
            return this.getStatusBadge(item.status);
        }
        
        return '<span class="text-muted">-</span>';
    }
    
    /**
     * Escape HTML special characters
     * @private
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    _escapeHtml(text) {
        if (typeof text !== 'string') {
            text = String(text || '');
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    /**
     * Render note details - רנדור פרטי הערה
     * 
     * @param {Object} noteData - נתוני הערה
     * @param {Object} options - אפשרויות רנדור
     * @returns {string} - HTML מרונדר
     * @public
     */
    renderNote(noteData, options = {}) {
        // קבלת צבע ההערה מההעדפות
        const noteColor = this.entityColors.note || '#6c757d';
        const sourceInfo = options?.sourceInfo || null;
        const linkedItemsOptions = Object.assign({}, options, { disableFilter: true });
        const sanitizedContent = this._sanitizeRichText(noteData?.content);
        const contentHtml = `
            <div class="note-content-section">
                <h6 class="border-bottom pb-2 mb-3" style="border-color: ${noteColor} !important;">תוכן ההודעה</h6>
                <div class="note-content text-break" dir="auto">
                    ${sanitizedContent || '<span class="text-muted">אין תוכן</span>'}
                </div>
            </div>
        `;
        const attachmentHtml = this._renderNoteAttachment(noteData, noteColor);
        
        return `
            <div class="entity-details-container note-details">
                
                <!-- מידע בסיסי + תוכן -->
                <div class="row g-3">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(noteData, 'note', noteColor)}
                    </div>
                    <div class="col-md-6 d-flex flex-column gap-4">
                        ${contentHtml}
                        ${attachmentHtml}
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(noteData.linked_items || [], noteColor, 'note', noteData.id, sourceInfo, linkedItemsOptions)}
                    </div>
                </div>
            </div>
        `;
    }
    
    _sanitizeRichText(html) {
        if (!html) {
            return '';
        }
        
        if (window.RichTextEditorService && typeof window.RichTextEditorService.sanitizeHTML === 'function') {
            return window.RichTextEditorService.sanitizeHTML(html);
        }
        
        if (typeof window !== 'undefined' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
            try {
                return window.DOMPurify.sanitize(String(html), {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'span', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
                    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'dir']
                });
            } catch (error) {
                window.Logger?.warn('⚠️ [EntityDetailsRenderer] Failed to sanitize rich text', { error }, { page: 'entity-details-renderer' });
            }
        }
        
        return String(html)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\n/g, '<br />');
    }
    
    _renderNoteAttachment(noteData = {}, noteColor = '#6c757d') {
        const attachment = noteData?.attachment;
        const headerHtml = `<h6 class="border-bottom pb-2 mb-3" style="border-color: ${noteColor} !important;">קובץ מצורף</h6>`;
        const escapeHtml = (value) => String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        if (!attachment && attachment !== 0) {
            return `
                <div class="note-attachment-section">
                    ${headerHtml}
                    <span class="text-muted">אין קובץ מצורף</span>
                </div>
            `;
        }
        
        if (!window.FieldRendererService || typeof window.FieldRendererService.renderAttachment !== 'function') {
            const safePath = String(attachment || '');
            const fileUrl = `/api/notes/files/${encodeURI(safePath)}`;
            return `
                <div class="note-attachment-section">
                    ${headerHtml}
                    <div class="text-muted">קובץ מצורף</div>
                    <a href="${fileUrl}" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm">
                        פתיחת קובץ
                    </a>
                </div>
            `;
        }

        const attachmentPath = String(attachment || '').trim();
        const fileUrl = `/api/notes/files/${encodeURIComponent(attachmentPath)}`;

        const attachmentRender = window.FieldRendererService.renderAttachment({ attachment: attachmentPath }, {
            attachmentPathKey: 'attachment',
            fileName: attachmentPath,
            downloadUrl: fileUrl,
            previewMaxHeight: 220,
            pdfHeight: 240,
            showExtension: false,
            download: true,
            iconClass: 'fs-5',
            linkClass: 'd-inline-flex align-items-center gap-2 text-break fw-semibold',
            labelStrategy: 'full',
            metaWrapperClass: 'd-flex align-items-center gap-2 flex-wrap'
        });

        if (!attachmentRender || !attachmentRender.hasAttachment) {
            return `
                <div class="note-attachment-section">
                    ${headerHtml}
                    <span class="text-muted">אין קובץ מצורף</span>
                </div>
            `;
        }

        const metaSection = `
            <div class="d-flex align-items-center gap-2 flex-wrap mb-3">
                ${attachmentRender.linkHtml}
                ${attachmentRender.extensionBadgeHtml || ''}
            </div>
        `;

        return `
            <div class="note-attachment-section">
                ${headerHtml}
                ${attachmentRender.previewHtml || ''}
                ${metaSection}
            </div>
        `;
    }
    renderGeneric(entityData, entityType, options) { return '<div>ישות כללית</div>'; }
    
    /**
     * עדכון גוף הטבלה של פריטים מקושרים לאחר מיון
     * Update linked items table body after sorting
     * 
     * @param {string} tableId - ID של הטבלה
     * @param {Array} sortedData - נתונים ממוינים
     * @private
     */
    updateLinkedItemsTableBody(tableId, sortedData) {
        console.log('🔍 [updateLinkedItemsTableBody] START', {
            tableId,
            sortedDataCount: sortedData?.length || 0,
            sortedData: sortedData?.slice(0, 2) // First 2 items for debugging
        });
        
        const table = document.getElementById(tableId);
        if (!table) {
            console.warn('⚠️ [updateLinkedItemsTableBody] Table not found:', tableId);
            return;
        }
        if (!sortedData || !Array.isArray(sortedData)) {
            console.warn('⚠️ [updateLinkedItemsTableBody] No sorted data provided or invalid data:', {
                sortedData,
                isArray: Array.isArray(sortedData)
            });
            return;
        }
        
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.warn('⚠️ [updateLinkedItemsTableBody] tbody not found in table:', tableId);
            return;
        }
        
        // הגנה: אם אין נתונים תקינים, אל ננקה את הטבלה
        if (sortedData.length === 0) {
            console.warn('⚠️ [updateLinkedItemsTableBody] Empty sorted data, keeping existing table content');
            return;
        }
        
        console.log('🔍 [updateLinkedItemsTableBody] Before clearing tbody', {
            tbodyRowsBefore: tbody.querySelectorAll('tr').length,
            tbodyHTMLBefore: tbody.innerHTML.substring(0, 100)
        });
        
        // ניקוי הטבלה
        tbody.innerHTML = '';
        
        console.log('🔍 [updateLinkedItemsTableBody] After clearing tbody', {
            tbodyRowsAfter: tbody.querySelectorAll('tr').length,
            tbodyHTMLAfter: tbody.innerHTML
        });
        
        // קבלת sourceInfo מהטבלה
        const entityTypeAttr = table.closest('.modal')?.querySelector('[data-entity-type]')?.getAttribute('data-entity-type');
        const entityIdAttr = table.closest('.modal')?.querySelector('[data-entity-id]')?.getAttribute('data-entity-id');
        
        const itemSourceInfo = {
            sourceModal: 'entity-details',
            sourceType: entityTypeAttr || this.currentEntityType,
            sourceId: entityIdAttr || this.currentEntityId
        };
        
        console.log('🔍 [updateLinkedItemsTableBody] About to render rows', {
            sortedDataCount: sortedData.length,
            itemSourceInfo,
            firstItem: sortedData[0]
        });
        
        // יצירת שורות חדשות באמצעות הפונקציה המאוחדת
        let rowsAdded = 0;
        sortedData.forEach((item, index) => {
            try {
                const rowHtml = this._renderLinkedItemRow(item, tableId, itemSourceInfo);
                if (!rowHtml || rowHtml.trim() === '') {
                    console.warn(`⚠️ [updateLinkedItemsTableBody] Empty row HTML for item ${index}:`, item);
                    return;
                }
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rowHtml.trim();
                const row = tempDiv.querySelector('tr');
                if (row) {
                    tbody.appendChild(row);
                    rowsAdded++;
                    if (index === 0) {
                        console.log('🔍 [updateLinkedItemsTableBody] First row added:', {
                            rowHTML: rowHtml.substring(0, 200),
                            rowElement: row.outerHTML.substring(0, 200)
                        });
                    }
                } else {
                    console.warn(`⚠️ [updateLinkedItemsTableBody] No <tr> found in row HTML for item ${index}:`, {
                        rowHtml: rowHtml.substring(0, 200),
                        item
                    });
                }
            } catch (error) {
                console.error(`❌ [updateLinkedItemsTableBody] Error rendering row ${index}:`, error, item);
            }
        });
        
        console.log('🔍 [updateLinkedItemsTableBody] After adding rows', {
            rowsAdded,
            tbodyRowsAfter: tbody.querySelectorAll('tr').length,
            tbodyHTMLAfter: tbody.innerHTML.substring(0, 300)
        });
        
        // עדכון אייקוני המיון
        if (window.updateSortIcons) {
            window.updateSortIcons('linked_items', null, null, table);
        }
        
        // Initialize tooltips for filter buttons
        this._initializeFilterTooltips(tableId);
        
        // Initialize buttons for action buttons
        setTimeout(() => {
            if (window.initializeButtons && typeof window.initializeButtons === 'function') {
                window.initializeButtons();
            } else if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
                window.ButtonSystem.initializeButtons();
            }
            
            // Final check after initialization
            const finalTbody = table.querySelector('tbody');
            console.log('🔍 [updateLinkedItemsTableBody] Final check after initialization', {
                tbodyRowsFinal: finalTbody ? finalTbody.querySelectorAll('tr').length : 0,
                tbodyHTMLFinal: finalTbody ? finalTbody.innerHTML.substring(0, 300) : 'N/A'
            });
        }, 100);
    }
    
    /**
     * Initialize tooltips for filter buttons using central button system
     * @private
     * @param {string} tableId - Table ID
     */
    _initializeFilterTooltips(tableId) {
        const filterContainer = document.getElementById(`linkedItemsFilter_${tableId}`);
        if (!filterContainer) {
            if (window.Logger) {
                window.Logger.debug('Filter container not found for tooltip initialization', { tableId, page: 'entity-details-renderer' });
            }
            console.warn(`🔍 [Tooltip Debug] Filter container not found: linkedItemsFilter_${tableId}`);
            return;
        }
        
        console.log(`🔍 [Tooltip Debug] _initializeFilterTooltips called for tableId: ${tableId}`);
        console.log(`🔍 [Tooltip Debug] Container found:`, filterContainer);
        
        // Count buttons with data-tooltip
        const buttonsWithTooltip = filterContainer.querySelectorAll('[data-tooltip]');
        console.log(`🔍 [Tooltip Debug] Buttons with data-tooltip: ${buttonsWithTooltip.length}`);
        
        if (buttonsWithTooltip.length === 0) {
            console.warn(`🔍 [Tooltip Debug] No buttons with data-tooltip found in container`);
            return;
        }
        
        // Check if button system is available
        const buttonSystemAvailable = window.advancedButtonSystem && window.advancedButtonSystem.initializeTooltips;
        console.log(`🔍 [Tooltip Debug] Button system available:`, buttonSystemAvailable);
        
        if (!buttonSystemAvailable) {
            console.warn(`🔍 [Tooltip Debug] Button system not available, attempting manual initialization`);
            // Fallback: manual Bootstrap tooltip initialization
            if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                buttonsWithTooltip.forEach((btn) => {
                    try {
                        // Destroy existing tooltip if exists
                        const existingTooltip = bootstrap.Tooltip.getInstance(btn);
                        if (existingTooltip) {
                            existingTooltip.dispose();
                        }
                        
                        const tooltipText = btn.getAttribute('data-tooltip');
                        const placement = btn.getAttribute('data-tooltip-placement') || 'top';
                        const trigger = btn.getAttribute('data-tooltip-trigger') || 'hover';
                        
                        if (tooltipText) {
                            new bootstrap.Tooltip(btn, {
                                title: tooltipText,
                                placement: placement,
                                trigger: trigger
                            });
                            console.log(`🔍 [Tooltip Debug] Manually initialized tooltip for button: ${btn.id || btn.getAttribute('data-type')}`);
                        }
                    } catch (error) {
                        console.error(`🔍 [Tooltip Debug] Error initializing tooltip:`, error);
                    }
                });
            } else {
                console.error(`🔍 [Tooltip Debug] Bootstrap Tooltip not available`);
            }
            return;
        }
        
        // Wait for DOM to be ready, then use button system to initialize tooltips
        requestAnimationFrame(() => {
            setTimeout(() => {
                console.log(`🔍 [Tooltip Debug] Calling initializeTooltips on container`);
                // Use button system to initialize tooltips for buttons with data-tooltip
                // Filter buttons don't have data-button-type, so we only initialize tooltips
                window.advancedButtonSystem.initializeTooltips(filterContainer);
                
                // Verify tooltips were initialized
                setTimeout(() => {
                    const initializedCount = Array.from(buttonsWithTooltip).filter(btn => 
                        bootstrap?.Tooltip?.getInstance(btn)
                    ).length;
                    console.log(`🔍 [Tooltip Debug] Tooltips initialized: ${initializedCount}/${buttonsWithTooltip.length}`);
                }, 200);
            }, 100);
        });
    }

    _enrichLinkedItems(items = [], parentEntityType = 'entity', options = {}) {
        if (!Array.isArray(items) || items.length === 0) {
            return [];
        }

        return items.map(item => this._enrichLinkedItem(item, parentEntityType, options));
    }

    _enrichLinkedItem(item, parentEntityType = 'entity', options = {}) {
        const enriched = Object.assign({}, item || {});
        const itemType = (enriched.type || enriched.entity_type || '').toLowerCase();
        const normalizedId = this._normalizeLinkedItemId(enriched.id ?? enriched.entity_id ?? enriched.linked_id);

        // Ensure basic fields are present
        if (!enriched.type && itemType) {
            enriched.type = itemType;
        }
        if (!enriched.id && normalizedId !== null) {
            enriched.id = normalizedId;
        }

        const sourceData = this._resolveLinkedItemSource(itemType, normalizedId, enriched, parentEntityType, options);

        if (sourceData && typeof sourceData === 'object') {
            if (!enriched.status && sourceData.status) {
                enriched.status = sourceData.status;
            }
            if (!enriched.side && (sourceData.side || sourceData.position_side)) {
                enriched.side = sourceData.side || sourceData.position_side;
            }
            if (!enriched.investment_type && (sourceData.investment_type || sourceData.investmentType)) {
                enriched.investment_type = sourceData.investment_type || sourceData.investmentType;
            }
            if (!enriched.updated_at && (sourceData.updated_at || sourceData.updatedAt || sourceData.last_updated_at)) {
                enriched.updated_at = sourceData.updated_at || sourceData.updatedAt || sourceData.last_updated_at;
            }
            if (!enriched.created_at && (sourceData.created_at || sourceData.createdAt)) {
                enriched.created_at = sourceData.created_at || sourceData.createdAt;
            }
            if (!enriched.name && sourceData.name) {
                enriched.name = sourceData.name;
            }
            if (!enriched.title && sourceData.title) {
                enriched.title = sourceData.title;
            }
            if (!enriched.description && sourceData.description) {
                enriched.description = sourceData.description;
            }
            if (!enriched.symbol && sourceData.symbol) {
                enriched.symbol = sourceData.symbol;
            }
        }

        // Ensure we have at least description or title for display
        if (!enriched.description && !enriched.title && !enriched.name && !enriched.symbol) {
            // Try to build a basic description from available fields
            const typeLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel)
                ? window.LinkedItemsService.getEntityLabel(enriched.type)
                : enriched.type || 'פריט';
            enriched.description = `${typeLabel} #${enriched.id || 'לא זמין'}`;
        }

        if (!enriched.updated_at && enriched.created_at) {
            enriched.updated_at = enriched.created_at;
        }

        enriched.linked_to = enriched.linked_to || this._buildLinkedToSortValue(enriched, parentEntityType);
        return enriched;
    }

    _resolveLinkedItemSource(itemType, normalizedId, enriched, parentEntityType, options) {
        if (!itemType) {
            return null;
        }

        const datasets = {
            trade: window.tradesData,
            trade_plan: window.tradePlansData,
            trading_account: window.trading_accountsData,
            account: window.trading_accountsData,
            ticker: window.tickersData,
            execution: window.executionsData,
            cash_flow: window.cashFlowsData,
            note: window.notesData,
            alert: window.alertsData
        };

        const dataset = datasets[itemType];
        if (Array.isArray(dataset)) {
            const match = dataset.find(entry => this._normalizeLinkedItemId(entry?.id) === normalizedId);
            if (match) {
                return match;
            }
        }

        return null;
    }

    _normalizeLinkedItemId(value) {
        if (value === null || value === undefined) {
            return null;
        }

        const numericValue = Number(value);
        if (!Number.isNaN(numericValue) && `${numericValue}` === String(value).trim()) {
            return numericValue;
        }

        return String(value).trim();
    }

    _buildLinkedToSortValue(item, parentEntityType) {
        try {
            const label = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel)
                ? window.LinkedItemsService.getEntityLabel(item.type)
                : (window.getEntityLabel && typeof window.getEntityLabel === 'function'
                    ? window.getEntityLabel(item.type)
                    : (item.type || parentEntityType || 'entity'));

            const cleanName = (window.LinkedItemsService && window.LinkedItemsService.formatLinkedItemName)
                ? window.LinkedItemsService.formatLinkedItemName(item)
                : (item.symbol || item.name || item.title || item.description || `#${item.id ?? ''}`);

            return `${label || ''} ${cleanName || ''}`.trim().toLowerCase();
        } catch (error) {
            return `${item.type || parentEntityType || 'entity'}_${item.id || ''}`.toLowerCase();
        }
    }

    _needsLinkedItemHydration(item) {
        if (!item) {
            return false;
        }

        const requiresStatus = !item.status;
        const requiresSide = ['trade', 'trade_plan', 'position', 'execution'].includes((item.type || '').toLowerCase()) && !item.side;
        const requiresInvestment = ['trade', 'trade_plan'].includes((item.type || '').toLowerCase()) && !item.investment_type;
        const requiresUpdatedAt = !item.updated_at && item.created_at;

        return requiresStatus || requiresSide || requiresInvestment || requiresUpdatedAt;
    }

    async _hydrateLinkedItemsAsync(tableId, items, parentEntityType, parentEntityId) {
        console.log('🔍 [_hydrateLinkedItemsAsync] START', {
            tableId,
            itemsCount: items?.length || 0,
            parentEntityType,
            parentEntityId
        });
        
        if (!Array.isArray(items) || items.length === 0) {
            console.log('🔍 [_hydrateLinkedItemsAsync] No items to hydrate');
            return;
        }

        if (!window.entityDetailsAPI || typeof window.entityDetailsAPI.getEntityDetails !== 'function') {
            console.log('🔍 [_hydrateLinkedItemsAsync] entityDetailsAPI not available');
            return;
        }

        if (!this._linkedItemsHydrationState) {
            this._linkedItemsHydrationState = {};
        }

        if (this._linkedItemsHydrationState[tableId]) {
            console.log('🔍 [_hydrateLinkedItemsAsync] Already hydrating, skipping');
            return;
        }

        this._linkedItemsHydrationState[tableId] = true;

        const itemsWithIndex = items.map((item, index) => ({ item, index }))
            .filter(({ item }) => this._needsLinkedItemHydration(item));

        console.log('🔍 [_hydrateLinkedItemsAsync] Items needing hydration', {
            itemsNeedingHydration: itemsWithIndex.length,
            totalItems: items.length
        });

        if (itemsWithIndex.length === 0) {
            console.log('🔍 [_hydrateLinkedItemsAsync] No items need hydration');
            this._linkedItemsHydrationState[tableId] = false;
            return;
        }

        const updatedItems = [...items];

        for (const { item, index } of itemsWithIndex) {
            try {
                let normalizedType;
                try {
                    normalizedType = this.normalizeEntityType(item.type);
                } catch (typeError) {
                    if ((item.type || '').toLowerCase() === 'account') {
                        normalizedType = 'trading_account';
                    } else {
                        throw typeError;
                    }
                }

                const entityId = this._normalizeLinkedItemId(item.id);
                if (entityId === null || entityId === undefined) {
                    console.warn('⚠️ [_hydrateLinkedItemsAsync] Invalid entity ID for item:', item);
                    continue;
                }

                console.log('🔍 [_hydrateLinkedItemsAsync] Fetching details for item', {
                    index,
                    type: normalizedType,
                    id: entityId
                });

                const details = await window.entityDetailsAPI.getEntityDetails(normalizedType, entityId, {
                    includeLinkedItems: false,
                    forceRefresh: false
                });

                if (details) {
                    console.log('🔍 [_hydrateLinkedItemsAsync] Details fetched, merging', {
                        index,
                        detailsKeys: Object.keys(details)
                    });
                    this._mergeLinkedItemDetails(updatedItems[index], details);
                } else {
                    console.warn('⚠️ [_hydrateLinkedItemsAsync] No details returned for item:', {
                        index,
                        type: normalizedType,
                        id: entityId
                    });
                }
            } catch (error) {
                console.error('❌ [_hydrateLinkedItemsAsync] Error hydrating item:', error, item);
                window.Logger?.debug('Linked item hydration skipped', { error, item }, { page: 'entity-details-renderer' });
            }
        }

        // הגנה: וידוא שיש לפחות פריט אחד לפני עדכון הטבלה
        if (!Array.isArray(updatedItems) || updatedItems.length === 0) {
            console.warn('⚠️ [_hydrateLinkedItemsAsync] No items to update after hydration, keeping original table');
            this._linkedItemsHydrationState[tableId] = false;
            return;
        }

        window.linkedItemsTableData = window.linkedItemsTableData || {};
        window.linkedItemsTableData[tableId] = updatedItems;

        console.log('🔍 [_hydrateLinkedItemsAsync] About to update table body', {
            tableId,
            updatedItemsCount: updatedItems.length,
            updatedItemsSample: updatedItems.slice(0, 2)
        });

        // עדכון הטבלה רק אם יש נתונים תקינים
        try {
            this.updateLinkedItemsTableBody(tableId, updatedItems);
        } catch (error) {
            console.error('❌ [_hydrateLinkedItemsAsync] Error updating table body:', error);
            // במקרה של שגיאה, נשאיר את הטבלה המקורית
        }
        
        this._linkedItemsHydrationState[tableId] = false;
        
        console.log('🔍 [_hydrateLinkedItemsAsync] END');
    }

    _mergeLinkedItemDetails(target, details) {
        if (!target || !details) {
            return;
        }

        const normalizedDetails = { ...details };

        const resolve = (...keys) => {
            for (const key of keys) {
                if (normalizedDetails[key] !== undefined && normalizedDetails[key] !== null && normalizedDetails[key] !== '') {
                    return normalizedDetails[key];
                }
            }
            return null;
        };

        target.status = target.status || resolve('status', 'state');
        target.side = target.side || resolve('side', 'trade_side', 'position_side', 'direction');
        target.investment_type = target.investment_type || resolve('investment_type', 'strategy_type', 'trade_type');
        target.updated_at = resolve('updated_at', 'modified_at', 'last_updated_at', 'updatedAt') || target.updated_at || target.created_at;
        target.created_at = resolve('created_at', 'createdAt', 'opened_at', 'openedAt') || target.created_at;
        target.name = target.name || resolve('name', 'title', 'symbol');
        target.title = target.title || target.name;
        target.symbol = target.symbol || resolve('symbol');

        if (!target.linked_to) {
            target.linked_to = this._buildLinkedToSortValue(target, target.type);
        }
    }
    
    /**
     * Render basic information section - רנדור מידע בסיסי
     * 
     * @param {Object} entityData - נתוני הישות
     * @param {string} entityType - סוג הישות
     * @param {string} entityColor - צבע הישות (אופציונלי)
     * @returns {string} - HTML מרונדר
     * @public
     */
    renderBasicInfo(entityData, entityType, entityColor = null) {
        const color = entityColor || this.entityColors[entityType] || '#6c757d';
        
        // Common basic fields
        const id = entityData.id || entityData.entity_id || '-';
        const createdAt = this.formatDateTime(entityData.created_at) || '-';
        const updatedAt = this.formatDateTime(entityData.updated_at) || '-';
        
        let html = `
            <div class="basic-info">
                <h6 class="border-bottom pb-2 mb-3" style="border-color: ${color} !important;">מידע בסיסי</h6>
        `;
        
        // תאריך יצירה מוצג רק עבור ישויות שאינן ticker (עבור ticker הוא מועבר לעמודה השנייה)
        if (entityType !== 'ticker' && entityType !== 'cash_flow') {
            html += `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך יצירה:</label>
                    <span class="text-muted">${createdAt}</span>
                </div>
            `;
        }
        
        // Entity-specific fields
        if (entityType === 'ticker') {
            const symbol = entityData.symbol || 'לא זמין';
            const name = entityData.name || null;
            
            // סטטוס
            const status = entityData.status || null;
            const statusDisplay = status && window.FieldRendererService && window.FieldRendererService.renderStatus
                ? window.FieldRendererService.renderStatus(status, 'ticker')
                : (status ? `<span class="badge bg-secondary">${status}</span>` : '<span class="text-muted">לא זמין</span>');
            
            // טריידים פעילים - בדיקה דינמית מתוך פריטים מקושרים
            let activeTrades = 'לא זמין';
            if (entityData.active_trades !== null && entityData.active_trades !== undefined) {
                activeTrades = entityData.active_trades ? 'כן' : 'לא';
            } else if (Array.isArray(entityData.linked_items) && entityData.linked_items.length > 0) {
                // בדיקה דינמית מתוך פריטים מקושרים
                const activeTradesList = entityData.linked_items.filter(item => {
                    const itemType = String(item.type || '').toLowerCase();
                    const itemStatus = String(item.status || '').toLowerCase();
                    return (itemType === 'trade' || itemType === 'trade_plan') && itemStatus === 'open';
                });
                activeTrades = activeTradesList.length > 0 ? 'כן' : 'לא';
            }
            
            html += `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סמל:</label>
                    <span class="fw-bold">${symbol}</span>
                </div>
                
                ${name ? `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">שם:</label>
                    <span>${name}</span>
                </div>
                ` : ''}
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סטטוס:</label>
                    <span>${statusDisplay}</span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">טריידים פעילים:</label>
                    <span>${activeTrades}</span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך עדכון אחרון:</label>
                    <span class="text-muted">${updatedAt}</span>
                </div>
            `;
            
            // תאריך יצירה לא מוצג כאן - מועבר לעמודה השנייה
        } else if (entityType === 'note') {
            const relatedEntity = entityData.related_entity
                || (Array.isArray(entityData.linked_items) && entityData.linked_items.length ? entityData.linked_items[0] : null);
            const relatedTypeSource = (entityData.related_type_label || (relatedEntity && relatedEntity.type)) || '';
            const relatedTypeDisplay = this.translateNoteRelationType(relatedTypeSource);

            let relatedBadge = '<span class="text-muted">לא מקושר</span>';
            if (relatedEntity && window.FieldRendererService && window.FieldRendererService.renderLinkedEntity) {
                const cleanName = (window.LinkedItemsService && window.LinkedItemsService.formatLinkedItemName)
                    ? window.LinkedItemsService.formatLinkedItemName(relatedEntity)
                    : (relatedEntity.description || relatedEntity.title || relatedEntity.name || relatedEntity.symbol || `#${relatedEntity.id || 'לא זמין'}`);
                const meta = Object.assign(
                    {
                        renderMode: 'notes-table',
                        status: relatedEntity.status,
                        side: relatedEntity.side,
                        investment_type: relatedEntity.investment_type,
                        date: relatedEntity.date || relatedEntity.created_at || relatedEntity.updated_at || null,
                        ticker: relatedEntity.ticker,
                        planned_amount: relatedEntity.planned_amount
                    },
                    {}
                );
                relatedBadge = window.FieldRendererService.renderLinkedEntity(
                    relatedEntity.type,
                    relatedEntity.id,
                    cleanName,
                    meta
                );
            } else if (relatedEntity) {
                const fallbackLabel = (window.LinkedItemsService && window.LinkedItemsService.formatLinkedItemName)
                    ? window.LinkedItemsService.formatLinkedItemName(relatedEntity)
                    : (relatedEntity.description || relatedEntity.title || relatedEntity.name || relatedEntity.symbol || `#${relatedEntity.id || 'לא זמין'}`);
                relatedBadge = `
                    <a href="#" class="entity-link d-inline-flex align-items-center gap-2"
                       onclick="window.showEntityDetails && window.showEntityDetails('${relatedEntity.type}', ${relatedEntity.id}); return false;">
                        <span class="badge bg-primary-subtle text-primary">🔗</span>
                        <span>${fallbackLabel}</span>
                    </a>
                `;
            }

            html += `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סוג שיוך:</label>
                    <span class="text-muted">${relatedTypeDisplay || 'לא זמין'}</span>
                </div>
                <div class="mb-3 d-flex align-items-start">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">רשומה מקושרת:</label>
                    <div class="flex-grow-1">
                        ${relatedBadge}
                    </div>
                </div>
            `;

        } else if (entityType === 'cash_flow') {
            const flowDate = entityData.date || entityData.flow_date || entityData.created_at || null;
            const formattedFlowDate = flowDate ? this.formatDate(flowDate) : 'לא זמין';
            const { symbol, name } = this._resolveCashFlowCurrencyDetails(entityData);
            const amountValue = Number(entityData.amount || 0);
            
            // Normalize amount based on type - same logic as in cash_flows.js formatCashFlowAmount
            const typeLower = (entityData.type || '').toLowerCase();
            const positiveTypes = new Set(['deposit', 'dividend', 'transfer_in', 'other_positive']);
            const negativeTypes = new Set(['withdrawal', 'fee', 'transfer_out', 'other_negative']);
            
            let effectiveAmount = amountValue;
            if (typeLower) {
                if (positiveTypes.has(typeLower)) {
                    effectiveAmount = Math.abs(amountValue);
                } else if (negativeTypes.has(typeLower)) {
                    effectiveAmount = -Math.abs(amountValue);
                }
            }
            
            const amountHtml = (window.FieldRendererService && window.FieldRendererService.renderAmount)
                ? window.FieldRendererService.renderAmount(effectiveAmount, symbol || '', 0, true)
                : `<span class="${effectiveAmount >= 0 ? 'text-success' : 'text-danger'} fw-bold" dir="ltr">${(symbol || '')}${Math.abs(effectiveAmount).toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>`;
            const typeHtml = entityData.type
                ? (window.FieldRendererService && window.FieldRendererService.renderType
                    ? window.FieldRendererService.renderType(entityData.type, effectiveAmount)
                    : `<span class="badge bg-secondary">${this.translateCashFlowType(entityData.type)}</span>`)
                : '<span class="text-muted">לא זמין</span>';
            const currencyNameDisplay = name || 'לא זמין';

            html += `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך:</label>
                    <span class="text-muted">${formattedFlowDate}</span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סוג תזרים:</label>
                    ${typeHtml}
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סכום:</label>
                    <div class="d-flex align-items-center gap-2">
                        ${amountHtml}
                    </div>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מטבע:</label>
                    <span class="text-muted">${currencyNameDisplay}</span>
                </div>
            `;

            if (window.Logger) {
                window.Logger.debug('🔍 [CASH_FLOW_BASIC_INFO] Currency values present (rendered in specific section)', {
                    currency_symbol: entityData.currency_symbol,
                    currency_code: entityData.currency_code,
                    currency_name: entityData.currency_name,
                    currency_object: entityData.currency
                }, { page: 'entity-details-renderer' });
            } else {
                console.log('🔍 [CASH_FLOW_BASIC_INFO] Currency values present (rendered in specific section):', {
                    currency_symbol: entityData.currency_symbol,
                    currency_code: entityData.currency_code,
                    currency_name: entityData.currency_name,
                    currency_object: entityData.currency
                });
            }
        } else if (entityType === 'execution') {
            // טיקר - תמיכה ב-symbol (מ-to_dict) וגם ticker_symbol
            const tickerSymbol = entityData.ticker_symbol || 
                                entityData.symbol ||
                                (entityData.ticker && entityData.ticker.symbol) ||
                                null;
            const tickerId = entityData.ticker_id || 
                           (entityData.ticker && entityData.ticker.id) ||
                           null;
            
            // סוג ביצוע
            const action = entityData.action || entityData.type || '-';
            const actionDisplay = action === 'buy' ? 'קנייה' : 
                                 action === 'sell' || action === 'sale' ? 'מכירה' :
                                 action === 'short' ? 'מכירה בחסר' :
                                 action === 'cover' ? 'כיסוי' : action;
            
            // כמות ומחיר
            const quantity = entityData.quantity !== null && entityData.quantity !== undefined ? 
                           (window.renderShares ? window.renderShares(entityData.quantity) : entityData.quantity) : 
                           '-';
            const price = entityData.price !== null && entityData.price !== undefined ? 
                        `$${parseFloat(entityData.price).toFixed(2)}` : 
                        '-';
            
            html += `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">טיקר:</label>
                    <span class="text-muted">
                        ${tickerId && tickerSymbol ? `<a href="#" onclick="window.showEntityDetails('ticker', ${tickerId}); return false;" class="entity-link" style="color: ${color};">${tickerSymbol}</a>` : (tickerSymbol || 'לא מוגדר')}
                    </span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סוג ביצוע:</label>
                    <span>
                        ${window.FieldRendererService && window.FieldRendererService.renderAction ? 
                            window.FieldRendererService.renderAction(action) : 
                            `<span class="badge ${action === 'buy' ? 'bg-success' : 'bg-danger'}">${actionDisplay}</span>`}
                    </span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">כמות:</label>
                    <span class="fw-bold">${quantity}</span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מחיר:</label>
                    <span class="fw-bold">${price}</span>
                </div>
            `;
        }
        
        // תאריך עדכון אחרון - עבור ticker כבר מוצג בתוך ה-if, עבור ישויות אחרות מוצג רק אם שונה מתאריך יצירה
        if (entityType !== 'ticker' && entityType !== 'cash_flow' && updatedAt !== '-' && updatedAt !== createdAt) {
            html += `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך עדכון אחרון:</label>
                    <span class="text-muted">${updatedAt}</span>
                </div>
            `;
        }
        
        html += `</div>`;
        
        return html;
    }
    
    /**
     * Render additional information section - רנדור מידע נוסף
     * 
     * @param {Object} entityData - נתוני הישות
     * @param {string} entityType - סוג הישות
     * @param {string} entityColor - צבע הישות (אופציונלי)
     * @returns {string} - HTML מרונדר
     * @public
     */
    renderAdditionalInfo(entityData, entityType, entityColor = null) {
        const color = entityColor || this.entityColors[entityType] || '#6c757d';
        
        let html = `
            <div class="additional-info">
                <h6 class="border-bottom pb-2 mb-3" style="border-color: ${color} !important;">מידע נוסף</h6>
        `;
        
        // Entity-specific additional fields
        if (entityType === 'cash_flow') {
            // For cash flows, specific fields are rendered via renderCashFlowSpecific (primary/secondary sections)
        }
        // Execution uses renderExecutionSpecific instead of renderAdditionalInfo
        
        html += `</div>`;
        
        return html;
    }
    
    /**
     * Translate source value to Hebrew - תרגום ערך מקור לעברית
     * 
     * @param {string} source - ערך המקור
     * @returns {string} - ערך מתורגם
     * @private
     */
    translateSource(source) {
        const translations = {
            'manual': 'ידני',
            'file_import': 'ייבוא קובץ',
            'direct_import': 'ייבוא ישיר',
            'api': 'API'
        };
        
        return translations[source] || source;
    }

    formatFieldValue(value, type = 'text', entityColor = null, fieldKey = '', entityData = {}) {
        if (value === null || value === undefined || value === '') {
            return '<span class="text-muted">-</span>';
        }

        const renderer = window.FieldRendererService || null;
        const data = entityData || {};
        const normalizedType = (type || '').toString().toLowerCase();

        const escapeHtml = (text) => {
            const str = text === null || text === undefined ? '' : String(text);
            if (renderer && typeof renderer._escapeHtml === 'function') {
                return renderer._escapeHtml(str);
            }
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        const sanitizeText = (text) => {
            if (typeof window !== 'undefined' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
                try {
                    return window.DOMPurify.sanitize(String(text), {
                        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'span', 'ul', 'ol', 'li', 'a'],
                        ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'dir']
                    });
                } catch (error) {
                    window.Logger?.warn('⚠️ [formatFieldValue] DOMPurify sanitize failed', error, { page: 'entity-details-renderer' });
                }
            }
            return escapeHtml(text).replace(/\n/g, '<br />');
        };

        const numberToLocale = (num, options = {}) => {
            const numeric = Number(num);
            if (Number.isNaN(numeric)) {
                return escapeHtml(num);
            }
            return numeric.toLocaleString('he-IL', options);
        };

        switch (normalizedType) {
            case 'currency':
            case 'amount': {
                const symbol = this._resolveCurrencySymbol(data, renderer?.defaultCurrencySymbol || '');
                const lowerKey = (fieldKey || '').toString().toLowerCase();
                let decimals = 0;
                if (lowerKey.includes('rate')) {
                    decimals = 4;
                } else if (lowerKey.includes('price')) {
                    decimals = 2;
                } else if (lowerKey.includes('percentage') || lowerKey.includes('percent')) {
                    decimals = 2;
                }
                if (renderer && typeof renderer.renderAmount === 'function') {
                    return renderer.renderAmount(value, symbol, decimals, true);
                }
                const numeric = Number(value);
                if (Number.isNaN(numeric)) {
                    return escapeHtml(value);
                }
                const absoluteFormatted = Math.abs(numeric).toLocaleString('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                });
                const sign = numeric > 0 ? '+' : (numeric < 0 ? '-' : '');
                const cssClass = numeric > 0 ? 'numeric-value-positive' : (numeric < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
                const display = sign ? `${sign}${symbol}${absoluteFormatted}` : `${symbol}${absoluteFormatted}`;
                return `<span class="${cssClass}" dir="ltr">${display}</span>`;
            }
            case 'number': {
                if (renderer && typeof renderer.renderNumericValue === 'function') {
                    return renderer.renderNumericValue(value, '', false);
                }
                return `<span dir="ltr">${numberToLocale(value)}</span>`;
            }
            case 'percentage': {
                if (renderer && typeof renderer.renderNumericValue === 'function') {
                    return renderer.renderNumericValue(value, '%', true);
                }
                const numeric = Number(value);
                if (Number.isNaN(numeric)) {
                    return escapeHtml(value);
                }
                return `<span dir="ltr">${numeric.toFixed(2)}%</span>`;
            }
            case 'boolean': {
                if (renderer && typeof renderer.renderBoolean === 'function') {
                    return renderer.renderBoolean(Boolean(value));
                }
                return Boolean(value) ? 'כן' : 'לא';
            }
            case 'status': {
                if (renderer && typeof renderer.renderStatus === 'function') {
                    const statusEntityType = data.entity_type || data.type || entityColor || 'default';
                    return renderer.renderStatus(value, statusEntityType);
                }
                return escapeHtml(value);
            }
            case 'side': {
                if (renderer && typeof renderer.renderSide === 'function') {
                    return renderer.renderSide(value);
                }
                return escapeHtml(value);
            }
            case 'type': {
                if (renderer && typeof renderer.renderType === 'function') {
                    const amountForColor = data.amount_for_color ?? null;
                    return renderer.renderType(value, amountForColor);
                }
                return escapeHtml(value);
            }
            case 'action': {
                if (renderer && typeof renderer.renderAction === 'function') {
                    const amountForColor = data.amount_for_color ?? null;
                    return renderer.renderAction(value, amountForColor);
                }
                return escapeHtml(value);
            }
            case 'datetime': {
                const formatted = this.formatDateTime(value);
                return formatted || '<span class="text-muted">-</span>';
            }
            case 'date': {
                const formatted = this.formatDate(value);
                return formatted || '<span class="text-muted">-</span>';
            }
            default:
                return sanitizeText(value);
        }
    }

    _resolveCurrencySymbol(entityData = {}, fallback = '') {
        if (!entityData || typeof entityData !== 'object') {
            return fallback;
        }

        return entityData.currency_symbol ??
            entityData.base_currency_symbol ??
            entityData.currencySymbol ??
            (entityData.currency && (entityData.currency.symbol ?? entityData.currency.code)) ??
            (entityData.base_currency && (entityData.base_currency.symbol ?? entityData.base_currency.code)) ??
            fallback;
    }
}

// ===== GLOBAL FILTER FUNCTION FOR LINKED ITEMS TABLE =====

/**
 * Filter linked items table by entity type
 * @param {string} tableId - Table ID
 * @param {string} type - Entity type to filter by ('all' to show all)
 */
window.filterLinkedItemsByType = function(tableId, type) {
    if (!tableId || !type) {
        console.warn('[filterLinkedItemsByType] Missing parameters:', { tableId, type });
        return;
    }
    
    // Update button states
    const filterContainer = document.getElementById(`linkedItemsFilter_${tableId}`);
    if (filterContainer) {
        const buttons = filterContainer.querySelectorAll('[data-type]');
        buttons.forEach(btn => {
            const btnType = btn.getAttribute('data-type');
            if (btnType === type) {
                btn.classList.add('active');
                btn.classList.remove('btn-outline-primary');
                const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
                btn.style.backgroundColor = 'white';
                btn.style.color = colors.positive;
                btn.style.borderColor = colors.positive;
            } else {
                btn.classList.remove('active');
                btn.classList.add('btn-outline-primary');
                btn.style.backgroundColor = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }
        });
    }
    
    // Get original data
    if (!window.linkedItemsTableData || !window.linkedItemsTableData[tableId]) {
        console.warn(`[filterLinkedItemsByType] No data found for table:`, tableId);
        return;
    }
    
    const allItems = window.linkedItemsTableData[tableId];
    
    // Filter data
    let filteredItems = allItems;
    if (type !== 'all') {
        const typeMapping = {
            'trading_account': ['trading_account', 'account'],
            'trade': ['trade'],
            'trade_plan': ['trade_plan'],
            'ticker': ['ticker'],
            'alert': ['alert'],
            'execution': ['execution'],
            'cash_flow': ['cash_flow'],
            'note': ['note']
        };
        
        const allowedTypes = typeMapping[type] || [];
        if (allowedTypes.length > 0) {
            filteredItems = allItems.filter(item => {
                const itemType = String(item.type || '').toLowerCase();
                return allowedTypes.includes(itemType);
            });
        } else {
            filteredItems = [];
        }
    }
    
    // Update table using EntityDetailsRenderer method
    if (window.entityDetailsRenderer && typeof window.entityDetailsRenderer.updateLinkedItemsTableBody === 'function') {
        window.entityDetailsRenderer.updateLinkedItemsTableBody(tableId, filteredItems);
    } else {
        console.warn('[filterLinkedItemsByType] EntityDetailsRenderer.updateLinkedItemsTableBody not available');
    }
};

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize EntityDetailsRenderer - אתחול אוטומטי של EntityDetailsRenderer
 */
try {
    // אתחול מערכת Renderer והצמדה ל-window בצורה מאובטחת
    if (!window.entityDetailsRenderer || !(window.entityDetailsRenderer instanceof EntityDetailsRenderer)) {
        window.entityDetailsRenderer = new EntityDetailsRenderer();
        if (typeof window.Logger !== 'undefined' && window.Logger.info) {
            window.Logger.info('Entity Details Renderer system loaded and ready', { page: "entity-details-renderer" });
        } else {
            console.log('✅ Entity Details Renderer system loaded and ready');
        }
    } else if (typeof window.Logger !== 'undefined' && window.Logger.debug) {
        window.Logger.debug('Entity Details Renderer already initialized - reusing existing instance', { page: "entity-details-renderer" });
    }
} catch (error) {
    if (typeof window.Logger !== 'undefined' && window.Logger.error) {
        window.Logger.error('Error auto-initializing EntityDetailsRenderer:', error, { page: "entity-details-renderer" });
    } else {
        console.error('❌ Error auto-initializing EntityDetailsRenderer:', error);
    }
}