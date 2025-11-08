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
                        ${this.renderAdditionalInfo(tickerData, 'ticker', tickerColor)}
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(tickerData.linked_items || [], tickerColor, 'ticker', tickerData.id, options?.sourceInfo || null, options)}
                    </div>
                </div>
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

        const renderAmount = (value, showSign = true, decimals = 2) => {
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
                const feeHtml = renderAmount(exec.fee || 0, true, 2);
                    const dateText = exec.date ? new Date(exec.date).toLocaleString('he-IL') : 'לא זמין';
                    const priceHtml = renderAmount(exec.price || 0, false, 2);
                const totalHtml = renderAmount(exec.total || 0, true, 2);

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
                const feeHtml = renderAmount(exec.fee || 0, true, 2);
                const totalHtml = renderAmount(exec.total || 0, true, 2);

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
            const sanitizedSuffix = `${parentEntityType || 'entity'}_${parentEntityId || '0'}`.replace(/[^a-zA-Z0-9_-]/g, '_');
            const tableId = `linkedItemsTable_${sanitizedSuffix}`;

            const enrichedItems = this._enrichLinkedItems(items, parentEntityType, options);

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

            const rowsHtml = enrichedItems.length ? enrichedItems.map(item => {
            const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel)
                ? window.LinkedItemsService.getEntityLabel(item.type)
                    : (window.getEntityLabel && typeof window.getEntityLabel === 'function'
                    ? window.getEntityLabel(item.type)
                        : item.type);
            
            const cleanName = (window.LinkedItemsService && window.LinkedItemsService.formatLinkedItemName)
                ? window.LinkedItemsService.formatLinkedItemName(item)
                    : this.getCleanEntityName(item);

                const linkedBadge = (window.FieldRendererService && window.FieldRendererService.renderLinkedEntity)
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
            
            const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
                ? window.FieldRendererService.renderStatus(item.status, item.type)
                : this.getStatusBadge(item.status);
            
                const sideDisplay = (window.FieldRendererService && window.FieldRendererService.renderSide)
                    ? window.FieldRendererService.renderSide(item.side)
                    : (item.side ? `<span class="badge badge-secondary">${item.side}</span>` : '<span class="badge badge-secondary">-</span>');

                const investmentDisplay = (window.FieldRendererService && window.FieldRendererService.renderType)
                    ? window.FieldRendererService.renderType(item.investment_type)
                    : (item.investment_type ? `<span class="badge badge-secondary">${item.investment_type}</span>` : '<span class="badge badge-secondary">-</span>');

                const createdDisplay = this.formatDateTime(item.created_at || item.updated_at);

                const actionsHtml = (window.LinkedItemsService && window.LinkedItemsService.generateLinkedItemActions)
                    ? window.LinkedItemsService.generateLinkedItemActions(item, 'table', {
                entityColors: this.entityColors,
                        sourceInfo: effectiveSourceInfo
                    })
                    : '';

                return `
                    <tr>
                        <td class="linked-item-entity text-end col-linked-entity">${linkedBadge}</td>
                        <td class="text-center col-linked-status">${statusDisplay}</td>
                        <td class="text-center col-linked-side">${sideDisplay}</td>
                        <td class="text-center col-linked-investment">${investmentDisplay}</td>
                        <td class="text-center col-linked-date">${createdDisplay || ''}</td>
                        <td class="text-center col-linked-actions">${actionsHtml}</td>
                </tr>
            `;
            }).join('') : '<tr><td colspan="6" class="text-center text-muted py-4">אין פריטים מקושרים להצגה</td></tr>';

            const sortHandlerReference = `window.linkedItemsSortHandlers['${tableId}']`;
            const makeSortButton = (label, columnIndex, alignment = 'start') => `
                <button class="btn btn-link sortable-header px-0 text-${alignment}" data-onclick="window.sortTableData(${columnIndex}, window.linkedItemsTableData['${tableId}'] || [], 'linked_items', ${sortHandlerReference})">${label} <span class="sort-icon">↕</span></button>
            `;

            if (showFilter) {
                setTimeout(() => {
                    if (window.entityDetailsRenderer && window.entityDetailsRenderer._initializeFilterTooltips) {
                        window.entityDetailsRenderer._initializeFilterTooltips(tableId);
                    }
                }, 250);
            }

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
                                            <th class="col-linked-entity">${makeSortButton('מקושר ל', 0)}</th>
                                            <th class="text-center col-linked-status">${makeSortButton('סטטוס', 1, 'center')}</th>
                                            <th class="text-center col-linked-side">${makeSortButton('צד', 2, 'center')}</th>
                                            <th class="text-center col-linked-investment">${makeSortButton('סוג השקעה', 3, 'center')}</th>
                                            <th class="text-center col-linked-date">${makeSortButton('תאריך יצירה', 4, 'center')}</th>
                                            <th class="text-center col-linked-actions">פעולות</th>
                                        </tr>
                                    </thead>
                                    <tbody>${rowsHtml}</tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="alert alert-info text-center mb-0">אין פריטים מקושרים להצגה</div>
                        `}
                    </div>
                </section>
            `;

            if (enrichedItems.some(item => this._needsLinkedItemHydration(item))) {
                setTimeout(() => {
                    this._hydrateLinkedItemsAsync(tableId, enrichedItems, parentEntityType, parentEntityId);
                }, 60);
            }
        
        return html;
        } catch (error) {
            window.Logger?.error('Error rendering linked items section', error, { page: 'entity-details-renderer' });
            return '<div class="alert alert-warning text-center my-3">שגיאה בטעינת פריטים מקושרים</div>';
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

    getCleanEntityName(item = {}) {
        if (!item || typeof item !== 'object') {
            return 'לא זמין';
        }

        const candidates = [
            item.display_name,
            item.name,
            item.title,
            item.symbol,
            item.ticker_symbol,
            item.account_name,
            item.description,
            item.id
        ];

        const value = candidates.find(val => val !== undefined && val !== null && val !== '') ?? 'לא זמין';
        return typeof value === 'number' ? value.toString() : value;
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

        const currencySymbol = accountData.base_currency_symbol || accountData.currency_symbol || '';
        const currencyName = accountData.base_currency_name || accountData.currency_name || '';
        const formattingContext = { ...accountData };
        if (!formattingContext.currency_symbol && currencySymbol) {
            formattingContext.currency_symbol = currencySymbol;
        }

        const positionsValue = Number(accountData.positions_total_value ?? accountData.total_positions_value ?? 0);
        const baseCurrencyTotalValue = Number(accountData.base_currency_total ?? accountData.base_currency_balance ?? 0);
        const totalAccountValue = Number(accountData.total_account_value ?? accountData.account_total_value ?? (baseCurrencyTotalValue + positionsValue));
        const currencyBalancesRaw = Array.isArray(accountData.currency_balances) ? accountData.currency_balances : [];
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

        const linkedItemsSection = this.renderLinkedItems(
            accountData.linked_items || [],
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
                                <ul class="list-unstyled mb-4 flex-grow-1">
                                    ${balancesListHtml}
                                </ul>
                                <div class="pt-3 border-top d-flex justify-content-between align-items-center">
                                    <span class="text-muted">סה״כ במטבע הבסיס</span>
                                    ${baseCurrencyTotalHtml}
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
                        ${this.renderCashFlowSpecific(cashFlowData)}
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
    renderCashFlowSpecific(cashFlowData) {
        const amount = Number(cashFlowData.amount || 0);
        const currencySymbol = cashFlowData.currency_symbol ||
            (cashFlowData.currency && cashFlowData.currency.symbol) ||
            '';

        const amountHtml = (window.FieldRendererService && window.FieldRendererService.renderAmount)
            ? window.FieldRendererService.renderAmount(amount, currencySymbol, 2, true)
            : `<span class="${amount >= 0 ? 'text-success' : 'text-danger'} fw-bold" dir="ltr">${currencySymbol}${Math.abs(amount).toFixed(2)}</span>`;

        const feeAmount = Number(cashFlowData.fee_amount || 0);
        const feeHtml = (window.FieldRendererService && window.FieldRendererService.renderAmount)
            ? window.FieldRendererService.renderAmount(feeAmount, currencySymbol, 2, true)
            : `<span class="${feeAmount >= 0 ? 'text-success' : 'text-danger'} fw-bold" dir="ltr">${currencySymbol}${Math.abs(feeAmount).toFixed(2)}</span>`;

        const currencyName = cashFlowData.currency_name ||
                             (cashFlowData.currency && cashFlowData.currency.name) ||
                             '';
        let currencyDisplay = '<span class="text-muted">לא זמין</span>';
        if (currencySymbol || currencyName) {
            if (window.FieldRendererService && typeof window.FieldRendererService.renderCurrency === 'function') {
                currencyDisplay = window.FieldRendererService.renderCurrency(
                    cashFlowData.currency_id || null,
                    currencyName,
                    currencySymbol || currencyName || ''
                );
            } else {
                const symbolText = currencySymbol ? currencySymbol : '';
                const nameText = currencyName ? ` (${currencyName})` : '';
                const combined = `${symbolText}${nameText}`.trim();
                currencyDisplay = `<span class="text-muted" dir="ltr">${combined || currencyName || symbolText}</span>`;
            }
        }

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

        const typeDisplay = cashFlowData.type
            ? `<span class="badge bg-secondary">${this.translateCashFlowType(cashFlowData.type)}</span>`
            : '<span class="text-muted">לא זמין</span>';

        return `
            <div class="cash-flow-specific">
                <h6 class="border-bottom pb-2 mb-3">פרטי תזרים</h6>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סכום:</label>
                    <div class="d-flex align-items-center gap-2">
                        ${amountHtml}
                    </div>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">עמלה:</label>
                    <div class="d-flex align-items-center gap-2">
                        ${feeHtml}
                    </div>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מטבע:</label>
                    <span class="d-flex align-items-center gap-2">${currencyDisplay}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">טרייד מקושר:</label>
                    <span class="d-flex align-items-center gap-2">${tradeDisplay}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סוג תזרים:</label>
                    ${typeDisplay}
                </div>

                <div class="mb-3">
                    <div class="d-flex align-items-center mb-2">
                        <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מקור:</label>
                        ${sourceDisplay}
                    </div>
                    <div class="d-flex align-items-center">
                        <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מזהה חיצוני:</label>
                        ${externalIdDisplay}
                    </div>
                </div>

                ${cashFlowData.description ? `
                    <div class="mb-3">
                        <label class="form-label fw-bold me-2 mb-2 d-block">תיאור:</label>
                        <div class="p-3 bg-light rounded border" style="white-space: pre-wrap;">${cashFlowData.description}</div>
                    </div>
                ` : ''}
            </div>
        `;
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
        const linkedItems = cashFlowData.linked_items || [];
        const entityColor = this.entityColors.cash_flow || '#fd7e14';
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
        
        return entityTypes.map(entityType => this._generateFilterButton(entityType, tableId)).join('');
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
        
        // סטטוס למעלה - שימוש במערכת הרינדור הכללית
        const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
            ? window.FieldRendererService.renderStatus(noteData.status || 'active', 'note')
            : '';
        
        return `
            <div class="entity-details-container note-details">
                
                <!-- סטטוס למעלה -->
                ${statusDisplay ? `<div class="mb-3 d-flex justify-content-start align-items-center gap-2">
                    <strong>סטטוס:</strong>
                    ${statusDisplay}
                </div>` : ''}
                
                <!-- מידע בסיסי בשתי עמודות -->
                <div class="row g-3">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(noteData, 'note', noteColor)}
                    </div>
                    <div class="col-md-6">
                        ${this.renderAdditionalInfo(noteData, 'note', noteColor)}
                    </div>
                </div>
                
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(noteData.linked_items || [], noteColor, 'note', noteData.id, options?.sourceInfo || null, options)}
                    </div>
                </div>
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
        const table = document.getElementById(tableId);
        if (!table || !sortedData) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        // ניקוי הטבלה
        tbody.innerHTML = '';
        
        // יצירת שורות חדשות - אותו קוד כמו ב-renderLinkedItems
        sortedData.forEach(item => {
            const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel)
                ? window.LinkedItemsService.getEntityLabel(item.type)
                : (window.getEntityLabel && typeof window.getEntityLabel === 'function'
                    ? window.getEntityLabel(item.type)
                    : item.type);
            
            const cleanName = (window.LinkedItemsService && window.LinkedItemsService.formatLinkedItemName)
                ? window.LinkedItemsService.formatLinkedItemName(item)
                : this.getCleanEntityName(item);
            
            const linkedBadge = (window.FieldRendererService && window.FieldRendererService.renderLinkedEntity)
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
            
            const createdDisplay = this.formatDateTime(item.created_at || item.updated_at) || '';
            
            const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
                ? window.FieldRendererService.renderStatus(item.status, item.type)
                : this.getStatusBadge(item.status);
            
            const sideDisplay = (window.FieldRendererService && window.FieldRendererService.renderSide)
                ? window.FieldRendererService.renderSide(item.side)
                : (item.side ? `<span class="badge badge-secondary">${item.side}</span>` : '<span class="badge badge-secondary">-</span>');

            const investmentDisplay = (window.FieldRendererService && window.FieldRendererService.renderType)
                ? window.FieldRendererService.renderType(item.investment_type)
                : (item.investment_type ? `<span class="badge badge-secondary">${item.investment_type}</span>` : '<span class="badge badge-secondary">-</span>');

            const entityTypeAttr = table.closest('.modal')?.querySelector('[data-entity-type]')?.getAttribute('data-entity-type');
            const entityIdAttr = table.closest('.modal')?.querySelector('[data-entity-id]')?.getAttribute('data-entity-id');
            
            const itemSourceInfo = {
                sourceModal: 'entity-details',
                sourceType: entityTypeAttr || this.currentEntityType,
                sourceId: entityIdAttr || this.currentEntityId
            };
            
            const actionsHtml = (window.LinkedItemsService && window.LinkedItemsService.generateLinkedItemActions)
                ? window.LinkedItemsService.generateLinkedItemActions(item, 'table', { 
                    entityColors: this.entityColors,
                    sourceInfo: itemSourceInfo
                })
                : '';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="linked-item-entity text-end col-linked-entity">${linkedBadge}</td>
                <td class="text-center col-linked-status">${statusDisplay}</td>
                <td class="text-center col-linked-side">${sideDisplay}</td>
                <td class="text-center col-linked-investment">${investmentDisplay}</td>
                <td class="text-center col-linked-date">${createdDisplay}</td>
                <td class="text-center col-linked-actions">${actionsHtml}</td>
            `;
            tbody.appendChild(row);
        });
        
        // עדכון אייקוני המיון
        if (window.updateSortIcons) {
            window.updateSortIcons('linked_items', null, null, table);
        }
        
        // Initialize tooltips for filter buttons
        this._initializeFilterTooltips(tableId);
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
        if (!Array.isArray(items) || items.length === 0) {
            return;
        }

        if (!window.entityDetailsAPI || typeof window.entityDetailsAPI.getEntityDetails !== 'function') {
            return;
        }

        if (!this._linkedItemsHydrationState) {
            this._linkedItemsHydrationState = {};
        }

        if (this._linkedItemsHydrationState[tableId]) {
            return;
        }

        this._linkedItemsHydrationState[tableId] = true;

        const itemsWithIndex = items.map((item, index) => ({ item, index }))
            .filter(({ item }) => this._needsLinkedItemHydration(item));

        if (itemsWithIndex.length === 0) {
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
                    continue;
                }

                const details = await window.entityDetailsAPI.getEntityDetails(normalizedType, entityId, {
                    includeLinkedItems: false,
                    forceRefresh: false
                });

                if (details) {
                    this._mergeLinkedItemDetails(updatedItems[index], details);
                }
            } catch (error) {
                window.Logger?.debug('Linked item hydration skipped', { error, item }, { page: 'entity-details-renderer' });
            }
        }

        window.linkedItemsTableData = window.linkedItemsTableData || {};
        window.linkedItemsTableData[tableId] = updatedItems;

        this.updateLinkedItemsTableBody(tableId, updatedItems);
        this._linkedItemsHydrationState[tableId] = false;
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
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך יצירה:</label>
                    <span class="text-muted">${createdAt}</span>
                </div>
        `;
        
        // Entity-specific fields
        if (entityType === 'cash_flow') {
            const currencySymbol = entityData.currency_symbol ||
                                  entityData.currency_code ||
                                  (entityData.currency && entityData.currency.symbol) ||
                                  (entityData.currency && entityData.currency.code) ||
                                  null;
            const currencyName = entityData.currency_name ||
                                 (entityData.currency && entityData.currency.name) ||
                                 '';
            
            console.log('🔍 [CASH_FLOW_BASIC_INFO] Currency Resolution:', {
                currency_symbol: entityData.currency_symbol,
                currency_code: entityData.currency_code,
                currency_name: entityData.currency_name,
                currency_object: entityData.currency,
                resolved_symbol: currencySymbol,
                resolved_name: currencyName
            });
            if (window.Logger) {
                window.Logger.debug('🔍 [CASH_FLOW_BASIC_INFO] Currency values:', {
                    currency_symbol: entityData.currency_symbol,
                    currency_code: entityData.currency_code,
                    currency_name: entityData.currency_name,
                    currency_object: entityData.currency,
                    resolved_currency_symbol: currencySymbol,
                    resolved_currency_name: currencyName
                }, { page: 'entity-details-renderer' });
            }
            
            let currencyDisplay = '<span class="text-muted">לא זמין</span>';
            if (currencySymbol || currencyName) {
                if (window.FieldRendererService && typeof window.FieldRendererService.renderCurrency === 'function') {
                    currencyDisplay = window.FieldRendererService.renderCurrency(
                        entityData.currency_id || null,
                        currencyName || '',
                        currencySymbol || currencyName || ''
                    );
                } else {
                    const symbolText = currencySymbol ? currencySymbol : '';
                    const nameText = currencyName ? ` (${currencyName})` : '';
                    const combined = `${symbolText}${nameText}`.trim();
                    currencyDisplay = `<span class="text-muted" dir="ltr">${combined || currencyName || symbolText}</span>`;
                }
            }
            
            html += `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מטבע:</label>
                    ${currencyDisplay}
                </div>
            `;
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
        
        if (updatedAt !== '-' && updatedAt !== createdAt) {
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
            // For cash flows, all info is shown in renderCashFlowSpecific
            // No additional fields needed here
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
                const decimals = fieldKey && fieldKey.toLowerCase().includes('balance') ? 2 : 2;
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
                const display = sign ? `${sign}${symbol}${absoluteFormatted}` : `${symbol}${absoluteFormatted}`;
                return `<span class="text-body" dir="ltr">${display}</span>`;
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
 * פילטר פריטים מקושרים לפי סוג ישות
 * Filter linked items by entity type
 * 
 * @param {string} tableId - ID של הטבלה
 * @param {string} type - סוג הישות ('all', 'account', 'trade', 'trade_plan', 'ticker', 'alert', 'execution', 'cash_flow', 'note')
 */
window.filterLinkedItemsByType = function(tableId, type) {
    // עדכון מצב הכפתורים
    const filterContainer = document.getElementById(`linkedItemsFilter_${tableId}`);
    if (filterContainer) {
        const buttons = filterContainer.querySelectorAll('[data-type]');
        buttons.forEach(btn => {
            if (btn.getAttribute('data-type') === type) {
                btn.classList.add('active');
                btn.classList.remove('btn-outline-primary');
                const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
                btn.style.backgroundColor = 'white';
                btn.style.color = colors.positive || '#28a745';
                btn.style.borderColor = colors.positive || '#28a745';
            } else {
                btn.classList.remove('active');
                btn.classList.add('btn-outline-primary');
                btn.style.backgroundColor = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }
        });
    }
    
    // קבלת הנתונים המקוריים
    if (!window.linkedItemsTableData || !window.linkedItemsTableData[tableId]) {
        console.warn(`[filterLinkedItemsByType] No data found for table:`, tableId);
        return;
    }
    
    const allItems = window.linkedItemsTableData[tableId];
    
    // פילטור הנתונים
    let filteredItems = allItems;
    if (type !== 'all') {
        // מיפוי סוגים - רק trading_account נתמך!
        const typeMapping = {
            'trading_account': ['trading_account'],
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
            filteredItems = allItems.filter(item => allowedTypes.includes(item.type));
        }
    }
    
    // עדכון הכותרת עם מספר הפריטים
    const headerElement = document.querySelector(`#${tableId}`).closest('.entity-linked-items')?.querySelector('h6');
    if (headerElement) {
        // עדכון הטקסט של הכותרת (הצד הימני)
        const titleSpan = headerElement.querySelector('span');
        if (titleSpan) {
            titleSpan.textContent = `פריטים מקושרים (${filteredItems.length})`;
        } else {
            // אם אין span, עדכון ישירות
            const titleText = headerElement.childNodes[0];
            if (titleText && titleText.nodeType === Node.TEXT_NODE) {
                titleText.textContent = `פריטים מקושרים (${filteredItems.length})`;
            } else {
                // יצירת span חדש
                const newSpan = document.createElement('span');
                newSpan.textContent = `פריטים מקושרים (${filteredItems.length})`;
                if (headerElement.firstChild) {
                    headerElement.insertBefore(newSpan, headerElement.firstChild);
                } else {
                    headerElement.appendChild(newSpan);
                }
            }
        }
    }
    
    // עדכון הטבלה עם הנתונים המסוננים
    if (window.entityDetailsRenderer && window.entityDetailsRenderer.updateLinkedItemsTableBody) {
        window.entityDetailsRenderer.updateLinkedItemsTableBody(tableId, filteredItems);
        // Initialize tooltips after table update
        if (window.entityDetailsRenderer._initializeFilterTooltips) {
            setTimeout(() => {
                window.entityDetailsRenderer._initializeFilterTooltips(tableId);
            }, 100);
        }
    } else {
        console.warn(`[filterLinkedItemsByType] EntityDetailsRenderer not available`);
    }
    
    if (window.Logger) {
        window.Logger.info('✅ [filterLinkedItemsByType] Linked items filtered', {
            tableId,
            type,
            totalItems: allItems.length,
            filteredItems: filteredItems.length,
            page: 'entity-details-renderer'
        });
    }
};

// ===== GLOBAL UPDATE FUNCTION FOR LINKED ITEMS TABLE =====

/**
 * עדכון טבלת פריטים מקושרים לאחר מיון
 * Global function for updating linked items table after sorting
 * 
 * @param {string} tableId - ID של הטבלה
 * @param {Array} sortedData - נתונים ממוינים
 */
window.updateLinkedItemsTable = function(tableId, sortedData) {
    const table = document.getElementById(tableId);
    if (!table || !sortedData) {
        console.warn(`[updateLinkedItemsTable] Table or data not found:`, { tableId, hasTable: !!table, hasData: !!sortedData });
        return;
    }
    
    // עדכון הנתונים הגולמיים
    if (!window.linkedItemsTableData) {
        window.linkedItemsTableData = {};
    }
    window.linkedItemsTableData[tableId] = sortedData;
    
    // שמירת מצב הפילטר הנוכחי
    const filterContainer = document.getElementById(`linkedItemsFilter_${tableId}`);
    let currentFilterType = 'all';
    if (filterContainer) {
        const activeButton = filterContainer.querySelector('.active[data-type]');
        if (activeButton) {
            currentFilterType = activeButton.getAttribute('data-type') || 'all';
        }
    }
    
    // הפעלת הפילטר מחדש כדי לשמור את מצב הסינון
    if (currentFilterType !== 'all') {
        window.filterLinkedItemsByType(tableId, currentFilterType);
    } else {
        // אם אין סינון - עדכון רגיל
        if (window.entityDetailsRenderer && window.entityDetailsRenderer.updateLinkedItemsTableBody) {
            window.entityDetailsRenderer.updateLinkedItemsTableBody(tableId, sortedData);
        } else {
            console.warn(`[updateLinkedItemsTable] EntityDetailsRenderer not available`);
        }
    }
};

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize when DOM is ready - אתחול אוטומטי כשה-DOM מוכן
 */
// document.addEventListener('DOMContentLoaded', () => {
//     try {
//         // אתחול מערכת הרנדור
        window.entityDetailsRenderer = new EntityDetailsRenderer();
        
        window.Logger.info('Entity Details Renderer system loaded and ready', { page: "entity-details-renderer" });
        
//     } catch (error) {
//         window.Logger.error('Error auto-initializing EntityDetailsRenderer:', error, { page: "entity-details-renderer" });
//     }
// });