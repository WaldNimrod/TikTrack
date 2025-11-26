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
        // ⚠️ REMOVED: Hardcoded default colors - use centralized Color Scheme System instead
        // Initialize empty colors object - will be populated from centralized system
        this.entityColors = {};

        // ניסיון לטעון צבעים מהעדפות ראשית
        try {
            window.Logger.info('🎨 Loading entity colors from Color Scheme System...', { page: "entity-details-renderer" });
            
            // Use centralized Color Scheme System API
            if (typeof window.getEntityColor === 'function') {
                // Load colors for all known entity types from centralized system
                const entityTypes = ['ticker', 'trade', 'trade_plan', 'execution', 'account', 'trading_account', 
                                    'alert', 'cash_flow', 'note', 'import_session', 'position'];
                
                for (const entityType of entityTypes) {
                    const color = window.getEntityColor(entityType);
                    if (color) {
                        this.entityColors[entityType] = color;
                    }
                }
                
                if (Object.keys(this.entityColors).length > 0) {
                    window.Logger.info('✅ Loaded entity colors from Color Scheme System', { page: "entity-details-renderer" });
                    return;
                }
            }
            
            // נסה מערכת העדפות (legacy compatibility)
            if (window.preferences && window.preferences.preferences && window.preferences.preferences.colorScheme) {
                const colorScheme = window.preferences.preferences.colorScheme;
                if (colorScheme.entities) {
                    Object.assign(this.entityColors, colorScheme.entities);
                    window.Logger.info('✅ Loaded entity colors from preferences system', { page: "entity-details-renderer" });
                    return;
                }
            }
            
            // נסה מערכת currentPreferences (legacy compatibility)
            if (window.currentPreferences && window.currentPreferences.entityColors) {
                Object.assign(this.entityColors, window.currentPreferences.entityColors);
                window.Logger.info('✅ Loaded entity colors from currentPreferences', { page: "entity-details-renderer" });
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
                window.Logger.debug('loadPreferences not available', { page: "entity-details-renderer" });
            }
            
        } catch (error) {
            if (window.Logger && window.Logger.warn) {
                window.Logger.warn('⚠️ Could not load entity colors - Color Scheme System should be loaded', error, { page: "entity-details-renderer" });
            }
        }
        
        if (Object.keys(this.entityColors).length === 0) {
            window.Logger.warn('⚠️ No entity colors loaded - Color Scheme System should initialize colors from preferences', { page: "entity-details-renderer" });
        }
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
                case 'import_session':
                    return this.renderImportSession(entityData, options);
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
        
        // עיצוב שינוי - שימוש במערכת המרכזית
        const getNumericColorFn = (typeof window.getNumericValueColor === 'function') ? window.getNumericValueColor : null;
        const changeColor = change >= 0 
            ? (getNumericColorFn ? getNumericColorFn(1, 'medium') : '') 
            : (getNumericColorFn ? getNumericColorFn(-1, 'medium') : '');
        const changeIcon = change >= 0 ? '↗' : '↘';
        const changeSign = change >= 0 ? '+' : '';
        
        // פורמט נפח
        const formattedVolume = volume > 0 ? volume.toLocaleString('he-IL') : 'N/A';
        
        // פורמט תאריך עדכון
        let updatedAtDisplay = '';
        if (updatedAt) {
            try {
                const date = new Date(updatedAt);
                // Use FieldRendererService or dateUtils for consistent date formatting
                if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                    updatedAtDisplay = window.FieldRendererService.renderDate(date, true);
                } else if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
                    updatedAtDisplay = window.dateUtils.formatDateTime(date);
                } else if (window.formatDate) {
                    updatedAtDisplay = window.formatDate(date, true);
                } else if (window.dateUtils?.formatDate) {
                    updatedAtDisplay = window.dateUtils.formatDate(date, { includeTime: true });
                } else {
                    updatedAtDisplay = date.toLocaleString('he-IL', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
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

    // REMOVED: Old renderTradeSpecific() - replaced by enhanced version below (line 1151)
    // The new version includes planning fields display (Pre-Plan vs Actual Plan vs Position)
    // with NO FALLBACKS policy - only displays data from Trade entity itself

    /**
     * Render trade plan view - רנדור פרטי תכנית מסחר
     * @param {Object} tradePlanData
     * @param {Object} options
     * @returns {string}
     * @public
     */
    renderTradePlan(tradePlanData, options = {}) {
        try {
            if (!tradePlanData) {
                return this.renderError('לא נמצאו פרטי תכנית להצגה');
            }

            const FieldRenderer = window.FieldRendererService || null;
            const planColor = this.entityColors.trade_plan || (typeof window.getEntityColor === 'function' ? window.getEntityColor('trade_plan') : '');

            let tickerData = tradePlanData.ticker
                || (Array.isArray(window.tickersData) ? window.tickersData.find(t => t?.id === tradePlanData.ticker_id) : null)
                || null;

            if (!tickerData && tradePlanData.ticker_id) {
                tickerData = {
                    id: tradePlanData.ticker_id,
                    symbol: tradePlanData.symbol || `טיקר #${tradePlanData.ticker_id}`,
                    name: tradePlanData.ticker_name || ''
                };
            }

            let tickerInfoHTML = '';
            if (tickerData && FieldRenderer?.renderTickerInfo) {
                tickerInfoHTML = FieldRenderer.renderTickerInfo(tickerData, 'mb-2');
            }

            // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
            const statusDisplay = tradePlanData.status
                ? (window.FieldRendererService?.renderStatus
                    ? window.FieldRendererService.renderStatus(tradePlanData.status, 'trade_plan')
                    : this.getStatusBadge(tradePlanData.status, 'trade_plan'))
                : '<span class="text-muted">לא זמין</span>';

            const tickerSymbol = tickerData?.symbol || tradePlanData.symbol || `תוכנית #${tradePlanData.id}`;

            return `
                <div class="entity-details-container trade-plan-details">
                    <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-3" style="border-bottom: 1px solid #e0e0e0; padding-bottom: 0.75rem;">
                        <div class="d-flex align-items-center gap-2" style="min-width: 120px;">
                            <strong>טיקר:</strong>
                            <span class="fw-bold">${tickerSymbol}</span>
                        </div>
                        <div class="flex-grow-1" style="text-align: center;">
                            ${tickerInfoHTML || ''}
                        </div>
                        <div class="d-flex align-items-center gap-2" style="min-width: 150px; justify-content: flex-end;">
                            <strong>סטטוס:</strong> ${statusDisplay}
                        </div>
                    </div>

                    <div class="row g-3">
                        <div class="col-md-6">
                            ${this.renderBasicInfo(tradePlanData, 'trade_plan')}
                        </div>
                        <div class="col-md-6">
                            ${this.renderTradePlanSpecific(tradePlanData, planColor)}
                        </div>
                    </div>

                    <div class="row g-3 mt-4">
                        <div class="col-12">
                            ${this.renderLinkedItems(
                                tradePlanData.linked_items || [],
                                planColor,
                                'trade_plan',
                                tradePlanData.id,
                                options?.sourceInfo || null,
                                options
                            )}
                        </div>
                    </div>

                    <div class="row g-3 mt-4">
                        <div class="col-12">
                            ${this.renderActionButtons('trade_plan', tradePlanData.id, tradePlanData, options?.sourceInfo || null)}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            window.Logger?.error('Error rendering trade plan details:', error, { page: "entity-details-renderer" });
            return this.renderError(`שגיאה ברנדור פרטי תוכנית: ${error.message}`);
        }
    }

    /**
     * Render trade plan specific information - רנדור מידע ספציפי לתכנית מסחר
     * @param {Object} tradePlanData
     * @param {string} planColor
     * @returns {string}
     * @private
     */
    renderTradePlanSpecific(tradePlanData, planColor = null) {
        if (!tradePlanData) {
            return this.renderError('לא נמצאו נתוני תכנית להצגה');
        }

        const FieldRenderer = window.FieldRendererService || null;
        const color = planColor || this.entityColors.trade_plan || (typeof window.getEntityColor === 'function' ? window.getEntityColor('trade_plan') : '');

        const sideHtml = tradePlanData.side
            ? (FieldRenderer?.renderSide
                ? FieldRenderer.renderSide(tradePlanData.side)
                : `<span class="badge bg-secondary">${this._escapeHtml(String(tradePlanData.side))}</span>`)
            : '<span class="text-muted">לא זמין</span>';
        const investmentHtml = tradePlanData.investment_type
            ? (FieldRenderer?.renderType
                ? FieldRenderer.renderType(tradePlanData.investment_type)
                : `<span class="badge bg-primary-subtle text-primary">${this._escapeHtml(String(tradePlanData.investment_type))}</span>`)
            : '<span class="text-muted">לא זמין</span>';

        const currencySymbol = tradePlanData.currency_symbol || tradePlanData.base_currency_symbol || '$';
        const plannedAmountHtml = (tradePlanData.planned_amount !== null && tradePlanData.planned_amount !== undefined)
            ? (FieldRenderer?.renderAmount
                ? FieldRenderer.renderAmount(tradePlanData.planned_amount, currencySymbol, 0, true)
                : `${currencySymbol}${Number(tradePlanData.planned_amount).toFixed(0)}`)
            : '<span class="text-muted">לא זמין</span>';

        const targetPriceHtml = (tradePlanData.target_price !== null && tradePlanData.target_price !== undefined)
            ? `${currencySymbol}${Number(tradePlanData.target_price).toFixed(2)}`
            : '<span class="text-muted">לא זמין</span>';
        const targetPctHtml = (tradePlanData.target_percentage !== null && tradePlanData.target_percentage !== undefined)
            ? (FieldRenderer?.renderNumericValue
                ? FieldRenderer.renderNumericValue(tradePlanData.target_percentage, '%', true)
                : `${Number(tradePlanData.target_percentage).toFixed(2)}%`)
            : '<span class="text-muted">לא זמין</span>';

        const stopPriceHtml = (tradePlanData.stop_price !== null && tradePlanData.stop_price !== undefined)
            ? `${currencySymbol}${Number(tradePlanData.stop_price).toFixed(2)}`
            : '<span class="text-muted">לא זמין</span>';
        const stopPctHtml = (tradePlanData.stop_percentage !== null && tradePlanData.stop_percentage !== undefined)
            ? (FieldRenderer?.renderNumericValue
                ? FieldRenderer.renderNumericValue(tradePlanData.stop_percentage * 100, '%', true)
                : `${Number(tradePlanData.stop_percentage * 100).toFixed(2)}%`)
            : '<span class="text-muted">לא זמין</span>';

        const accountDisplay = this._renderLinkedEntityReference(
            'trading_account',
            tradePlanData.trading_account_id,
            tradePlanData.account_name || null,
            { renderMode: 'entity-details' }
        );
        const tickerDisplay = this._renderLinkedEntityReference(
            'ticker',
            tradePlanData.ticker_id,
            tradePlanData.ticker?.symbol || tradePlanData.symbol || null,
            { renderMode: 'entity-details', status: tradePlanData.ticker?.status }
        );

        const cancelInfo = (tradePlanData.cancelled_at || tradePlanData.cancel_reason)
            ? `<div class="mb-3">
                    <label class="form-label fw-bold me-2 mb-1" style="min-width: 140px;">פרטי ביטול:</label>
                    <div class="d-flex flex-column gap-1">
                        ${tradePlanData.cancelled_at ? `<span class="text-muted">בוטל בתאריך: ${this.formatDateTime(tradePlanData.cancelled_at)}</span>` : ''}
                        ${tradePlanData.cancel_reason ? `<span class="text-muted">סיבה: ${this._escapeHtml(tradePlanData.cancel_reason)}</span>` : ''}
                    </div>
               </div>`
            : '';

        const entryConditions = tradePlanData.entry_conditions
            ? `<div class="mb-3">
                    <label class="form-label fw-bold">תנאי כניסה:</label>
                    <p class="mb-0">${FieldRenderer?.renderTextPreview
                        ? FieldRenderer.renderTextPreview(tradePlanData.entry_conditions, { maxLength: 600 })
                        : this._escapeHtml(tradePlanData.entry_conditions)}</p>
               </div>`
            : '';

        const planConditionsSection = this.renderPlanConditionsSection(tradePlanData.plan_conditions);

        return `
            <div class="trade-plan-specific">
                <h6 class="border-bottom pb-2 mb-3" style="border-color: ${color} !important;">פרטי תוכנית</h6>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 140px;">צד:</label>
                    <span>${sideHtml}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 140px;">סוג השקעה:</label>
                    <span>${investmentHtml}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 140px;">סכום מתוכנן:</label>
                    <span>${plannedAmountHtml}</span>
                </div>

                <div class="mb-3 d-flex align-items-center flex-wrap gap-2">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 140px;">מחיר יעד:</label>
                    <span>${targetPriceHtml}</span>
                    <span>${targetPctHtml}</span>
                </div>

                <div class="mb-3 d-flex align-items-center flex-wrap gap-2">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 140px;">מחיר סטופ:</label>
                    <span>${stopPriceHtml}</span>
                    <span>${stopPctHtml}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 140px;">חשבון מסחר:</label>
                    <span>${accountDisplay}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 140px;">טיקר:</label>
                    <span>${tickerDisplay}</span>
                </div>

                ${cancelInfo}
                ${entryConditions}
                ${planConditionsSection}
            </div>
        `;
    }

    renderPlanConditionsSection(planConditions) {
        const conditionsList = Array.isArray(planConditions) ? planConditions : [];

        if (!conditionsList.length) {
            return `
                <div class="mb-3">
                    <label class="form-label fw-bold">תנאים מתקדמים:</label>
                    <div class="alert alert-light border mb-0 text-muted">
                        לא קיימים תנאים שמורים עבור תוכנית זו.
                    </div>
                </div>
            `;
        }

        const cards = conditionsList.map((condition, index) => this.renderPlanConditionCard(condition, index)).join('');

        return `
            <div class="mb-3">
                <label class="form-label fw-bold d-flex align-items-center gap-2">
                    תנאים מתקדמים
                    <span class="badge bg-secondary">${conditionsList.length}</span>
                </label>
                <div class="d-flex flex-column gap-2">
                    ${cards}
                </div>
            </div>
        `;
    }

    renderPlanConditionCard(condition, index = 0) {
        if (!condition) {
            return '';
        }

        const translator = window.conditionsTranslations;
        const methodKey = condition.method?.method_key || condition.method_key;
        const methodName = condition.method?.name_he
            || condition.method?.name
            || (methodKey && translator?.getMethodName(methodKey))
            || condition.method?.name_en
            || `תנאי ${index + 1}`;
        const categoryKey = condition.method?.category;
        const categoryName = categoryKey ? (translator?.getCategoryName(categoryKey) || categoryKey) : '';
        const operatorLabel = translator?.getOperator(condition.logical_operator || 'NONE') || (condition.logical_operator || 'NONE');
        const statusBadge = condition.is_active === false
            ? '<span class="badge bg-secondary">מושבת</span>'
            : '<span class="badge bg-success">פעיל</span>';
        const conditionGroup = Number.isFinite(condition.condition_group) && condition.condition_group > 0
            ? `<span class="ms-2 text-muted small">קבוצה: ${condition.condition_group}</span>`
            : '';
        const createdAt = condition.created_at?.display || condition.created_at || '';
        const parametersHtml = this.renderPlanConditionParameters(condition);

        return `
            <div class="border rounded p-3 bg-white shadow-sm">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                        <div class="fw-bold">${this._escapeHtml(methodName)}</div>
                        ${categoryName ? `<div class="text-muted small">${this._escapeHtml(categoryName)}</div>` : ''}
                    </div>
                    ${statusBadge}
                </div>
                <div class="text-muted small mt-2">
                    <span>אופרטור: ${this._escapeHtml(operatorLabel)}</span>
                    ${conditionGroup}
                </div>
                ${parametersHtml}
                ${createdAt ? `<div class="text-muted small mt-2">נוצר: ${this._escapeHtml(createdAt)}</div>` : ''}
            </div>
        `;
    }

    renderPlanConditionParameters(condition) {
        const parameters = this.extractConditionParameters(condition);
        const translator = window.conditionsTranslations;
        const entries = Object.entries(parameters || {});

        if (!entries.length) {
            return `<div class="text-muted small mt-2">אין פרמטרים להצגה עבור תנאי זה.</div>`;
        }

        const listItems = entries.map(([key, value]) => {
            const label = translator?.getParameterName(key) || key;
            const formattedValue = Array.isArray(value) ? value.join(', ') : value;
            return `
                <li class="d-flex justify-content-between gap-2">
                    <span class="text-muted">${this._escapeHtml(label)}</span>
                    <span class="fw-semibold text-end">${this._escapeHtml(String(formattedValue))}</span>
                </li>
            `;
        }).join('');

        return `<ul class="list-unstyled small mt-3 mb-0">${listItems}</ul>`;
    }

    extractConditionParameters(condition) {
        if (condition && typeof condition.parameters === 'object' && !Array.isArray(condition.parameters)) {
            return condition.parameters;
        }

        if (condition?.parameters_json) {
            try {
                const parsed = typeof condition.parameters_json === 'string'
                    ? JSON.parse(condition.parameters_json)
                    : condition.parameters_json;

                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (error) {
                window.Logger?.warn('[EntityDetailsRenderer] Failed to parse condition parameters', { error: error?.message }, { page: 'entity-details-renderer' });
            }
        }

        return {};
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
        const tickerColor = this.entityColors.ticker || (typeof window.getEntityColor === 'function' ? window.getEntityColor('ticker') : '');
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
        const color = tickerColor || this.entityColors.ticker || (typeof window.getEntityColor === 'function' ? window.getEntityColor('ticker') : '');
        
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
        
        // Provider symbols (מיפויי ספקי נתונים)
        const providerSymbols = tickerData.provider_symbols || [];
        
        // 🔍 DEBUG: Log provider symbols for troubleshooting
        if (window.Logger) {
            window.Logger.debug('🔍 [renderTickerSpecific] Provider symbols check:', {
                hasProviderSymbols: 'provider_symbols' in tickerData,
                providerSymbolsType: typeof tickerData.provider_symbols,
                providerSymbolsIsArray: Array.isArray(tickerData.provider_symbols),
                providerSymbolsCount: providerSymbols.length,
                providerSymbols: providerSymbols,
                tickerId: tickerData.id,
                tickerSymbol: tickerData.symbol,
                page: 'entity-details-renderer'
            });
        }
        
        let providerSymbolsHtml = '';
        if (providerSymbols && providerSymbols.length > 0) {
            // יצירת רשימת מיפויים - כל מיפוי בשורה נפרדת, מיושר ימינה כמו שאר השדות
            const mappingsList = providerSymbols.map(mapping => {
                const providerName = mapping.provider_display_name || mapping.provider_name || 'לא ידוע';
                const providerSymbol = mapping.provider_symbol || '';
                return `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">${this._escapeHtml(providerName)}:</label>
                    <span>${this._escapeHtml(providerSymbol)}</span>
                </div>`;
            }).join('');
            
            providerSymbolsHtml = `
                <div class="mb-3 mt-3">
                    <h6 class="border-bottom pb-2 mb-2" style="border-color: ${color} !important;">מיפויי ספקים</h6>
                    ${mappingsList}
                </div>
            `;
        }
        
        // הערות - תמיכה בטקסט עשיר
        const remarks = tickerData.remarks || null;
        let remarksHtml = '';
        if (remarks) {
            // Sanitize HTML using RichTextEditorService for safe rich text rendering
            const sanitizedRemarks = this._sanitizeRichText(remarks);
            remarksHtml = `
                <div class="mb-3 d-flex align-items-start">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">הערות:</label>
                    <div class="flex-grow-1 rich-text-content" style="white-space: pre-wrap; word-wrap: break-word;">
                        ${sanitizedRemarks || '<span class="text-muted">אין תוכן</span>'}
                    </div>
                </div>
            `;
        }
        
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
                
                ${providerSymbolsHtml}
                
                ${remarksHtml}
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
        try {
        const entityColor = this.entityColors.trade || (typeof window.getEntityColor === 'function' ? window.getEntityColor('trade') : '');
        
        // סטטוס - שימוש במערכת הרינדור הכללית
        const statusDisplay = window.FieldRendererService.renderStatus(tradeData.status, 'trade');
        
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
            hasRenderTickerInfo: !!window.FieldRendererService.renderTickerInfo,
            tickerObjectKeys: tradeData.ticker ? Object.keys(tradeData.ticker) : [],
            tickerObjectValues: tradeData.ticker ? Object.entries(tradeData.ticker).map(([key, value]) => ({key, value, type: typeof value})) : []
        });
        
        if (tradeData.ticker && window.FieldRendererService.renderTickerInfo) {
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
                               '$',
                // Open price data
                open_price: tradeData.ticker.open_price || null,
                change_from_open: tradeData.ticker.change_from_open || null,
                change_from_open_percent: tradeData.ticker.change_from_open_percent || null
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
                hasRenderTickerInfo: !!window.FieldRendererService.renderTickerInfo
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
                            return this.renderLinkedItems(tradeData.linked_items || [], this.entityColors.trade || (typeof window.getEntityColor === 'function' ? window.getEntityColor('trade') : ''), 'trade', tradeData.id, options?.sourceInfo || null, options);
                        })()}
                    </div>
                </div>
            </div>
        `;
        } catch (error) {
            window.Logger?.error('Error in renderTrade:', error, { page: "entity-details-renderer" });
            return this.renderError(`שגיאה ברנדור טרייד: ${error.message || error}`);
        }
    }

    /**
     * Render trade specific information - רנדור מידע ספציפי לטרייד
     * 
     * **Trade Planning Fields Support (2025-01-29):**
     * - Displays 3-column table: תכנון מקדים (Pre-Plan) | תכנון בפועל (Actual Plan) | פוזיציה (Position)
     * - Pre-Plan: Only from trade_plan if linked (NO FALLBACKS)
     * - Actual Plan: Only from Trade entity itself (planned_quantity, planned_amount, entry_price) - NO FALLBACKS
     * - Position: From executions/position calculations
     * - If data is missing, displays "לא זמין" (not fallback values)
     * 
     * **No Fallbacks Policy:**
     * - Does not use position data for planning fields
     * - Does not use trade_plan data if not explicitly linked
     * - Does not calculate planning fields from other sources
     * - Only displays actual data from Trade entity or linked trade_plan
     *
     * @param {Object} tradeData - נתוני טרייד כולל:
     *   - planned_quantity: כמות מתוכננת מה-Trade עצמו
     *   - planned_amount: סכום מתוכנן מה-Trade עצמו
     *   - entry_price: מחיר כניסה מה-Trade עצמו
     *   - trade_plan: אובייקט תוכנית מקושרת (אופציונלי)
     *   - position: נתוני פוזיציה מחושבים (אופציונלי)
     * @param {string} tradeColor - צבע הטרייד (אופציונלי)
     * @returns {string} - HTML מרונדר עם טבלת תכנון מקדים/בפועל/פוזיציה
     * @private
     * 
     * @example
     * // Trade with planning fields
     * renderTradeSpecific({
     *   planned_quantity: 100,
     *   planned_amount: 10000,
     *   entry_price: 100,
     *   trade_plan: { planned_amount: 8000, entry_price: 80 }
     * })
     * // Displays: Pre-Plan (8000/80) | Actual Plan (10000/100) | Position (from executions)
     */
    renderTradeSpecific(tradeData, tradeColor = null) {
        try {
            const color = tradeColor || this.entityColors.trade || (typeof window.getEntityColor === 'function' ? window.getEntityColor('trade') : '');
            const FieldRenderer = window.FieldRendererService || null;
        
        // Trade Plan Link
        const tradePlanId = tradeData.trade_plan_id || null;
        const tradePlanSymbol = tradeData.trade_plan_ticker_symbol ||
                               (tradeData.trade_plan && tradeData.trade_plan.ticker_symbol) ||
                               '';
        
        // חישוב תכנון מקדים (Pre-Plan) - מהתוכנית המקורית (trade_plan) בלבד
        // NO FALLBACKS - אם אין trade_plan, לא נציג תכנון מקדים
        let prePlanQuantity = null;
        let prePlanAmount = null;
        let prePlanEntryPrice = null;
        let hasPrePlan = false;
        
        if (tradeData.trade_plan) {
            const plan = tradeData.trade_plan;
            const planPlannedAmount = plan.planned_amount;
            const planEntryPrice = plan.entry_price;
            
            if (planPlannedAmount && planPlannedAmount > 0 && planEntryPrice && planEntryPrice > 0) {
                prePlanAmount = planPlannedAmount;
                prePlanEntryPrice = planEntryPrice;
                prePlanQuantity = planPlannedAmount / planEntryPrice;
                hasPrePlan = true;
            } else if (planPlannedAmount && planPlannedAmount > 0) {
                prePlanAmount = planPlannedAmount;
                hasPrePlan = true;
            }
        }

        // חישוב תכנון בפועל (Actual Plan / Snapshot) - מה-Trade עצמו בלבד
        // NO FALLBACKS - אם אין נתונים ב-Trade, לא נציג תכנון בפועל
        let actualPlanQuantity = null;
        let actualPlanAmount = null;
        let actualPlanEntryPrice = null;
        let hasActualPlan = false;
        
        // רק מה-Trade עצמו - בלי חישובים, בלי fallbacks
        // בדיקה מפורשת ל-null/undefined - לא להשתמש ב-|| כי 0 הוא ערך תקין
        const tradePlannedQuantity = (tradeData.planned_quantity !== null && tradeData.planned_quantity !== undefined) 
            ? tradeData.planned_quantity 
            : ((tradeData.quantity !== null && tradeData.quantity !== undefined) ? tradeData.quantity : null);
        const tradePlannedAmount = (tradeData.planned_amount !== null && tradeData.planned_amount !== undefined) 
            ? tradeData.planned_amount 
            : null;
        const tradeEntryPrice = (tradeData.entry_price !== null && tradeData.entry_price !== undefined) 
            ? tradeData.entry_price 
            : null;
        
        if (tradePlannedQuantity !== null && tradePlannedQuantity > 0) {
            actualPlanQuantity = tradePlannedQuantity;
            hasActualPlan = true;
        }
        if (tradePlannedAmount !== null && tradePlannedAmount > 0) {
            actualPlanAmount = tradePlannedAmount;
            hasActualPlan = true;
        }
        if (tradeEntryPrice !== null && tradeEntryPrice > 0) {
            actualPlanEntryPrice = tradeEntryPrice;
            hasActualPlan = true;
        }
        
        // חישוב פוזיציה - שימוש במערכת החישוב הקיימת מה-backend
        let positionQuantity = 0;
        let positionAmount = 0;
        let positionAveragePrice = 0;
        let positionMarketValue = 0;
        let positionPercentOfAccount = 0;
        
        // חישוב P/L
        let realizedPL = 0;
        let unrealizedPL = 0;
        let mtmPL = 0;
        
        // חישוב קניות ומכירות
        let totalBoughtQuantity = 0;
        let totalBoughtAmount = 0;
        let totalBoughtAverage = 0;
        let totalSoldQuantity = 0;
        let totalSoldAmount = 0;
        let totalSoldAverage = 0;
        
        // מחיר נוכחי של הטיקר (כולל נפילה לשדה שטוח שמגיע מטבלת ה-Trades)
        const currentPrice = tradeData.ticker?.current_price
                           || tradeData.ticker?.price
                           || tradeData.current_price
                           || 0;
        
        // קבלת executions לחישובים
        const executions = (tradeData.linked_items || []).filter(item => item.type === 'execution');
        
        // אם יש נתוני פוזיציה מה-backend (מחושבים ב-PositionCalculatorService)
        if (tradeData.position) {
            positionQuantity = tradeData.position.quantity || 0;
            positionAveragePrice = tradeData.position.average_price || 0;
            
            // total_cost זה רק קניות כולל עמלות, אבל אנחנו רוצים סכום נטו
            // נחשב סכום נטו: קניות - מכירות (אם יש מכירות)
            const totalCost = tradeData.position.total_cost || 0;
            totalBoughtQuantity = tradeData.position.total_bought || 0;
            totalSoldQuantity = tradeData.position.total_sold || 0;
            
            // חישוב קניות
            if (totalBoughtQuantity > 0) {
                totalBoughtAmount = totalCost;
                totalBoughtAverage = totalCost / totalBoughtQuantity;
            }
            
            // חישוב מכירות
            if (totalSoldQuantity > 0) {
                let soldAmount = 0;
                executions.forEach(exec => {
                    const action = exec.action || '';
                    if (action === 'sell') {
                        const quantity = parseFloat(exec.quantity || 0);
                        const price = parseFloat(exec.price || 0);
                        const fee = parseFloat(exec.fee || 0);
                        soldAmount += (quantity * price) - fee;
                    }
                });
                totalSoldAmount = soldAmount;
                totalSoldAverage = soldAmount / totalSoldQuantity;
            }
            
            positionAmount = totalBoughtAmount - totalSoldAmount;
            
            // חישוב גודל פוזיציה (market value) = כמות * מחיר נוכחי
            if (positionQuantity !== 0 && currentPrice > 0) {
                positionMarketValue = Math.abs(positionQuantity) * currentPrice;
            }
        } 
        // Fallback: חישוב ידני מ-executions ב-linked_items (אם אין נתונים מה-backend)
        else {
            if (executions.length > 0) {
                let totalCost = 0;
                
                executions.forEach(exec => {
                    const quantity = parseFloat(exec.quantity || 0);
                    const price = parseFloat(exec.price || 0);
                    const fee = parseFloat(exec.fee || 0);
                    const action = exec.action || '';
                    
                    if (action === 'buy') {
                        totalBoughtQuantity += quantity;
                        totalBoughtAmount += (quantity * price) + fee;
                        totalCost += (quantity * price) + fee;
                    } else if (action === 'sell') {
                        totalSoldQuantity += quantity;
                        totalSoldAmount += (quantity * price) - fee;
                    }
                });
                
                positionQuantity = totalBoughtQuantity - totalSoldQuantity;
                positionAmount = totalBoughtAmount - totalSoldAmount;
                
                // חישוב מחיר ממוצע
                if (totalBoughtQuantity > 0) {
                    positionAveragePrice = totalCost / totalBoughtQuantity;
                    totalBoughtAverage = totalCost / totalBoughtQuantity;
                }
                
                // חישוב מחיר ממוצע מכירות
                if (totalSoldQuantity > 0) {
                    totalSoldAverage = totalSoldAmount / totalSoldQuantity;
                }
                
                // חישוב גודל פוזיציה
                if (positionQuantity !== 0 && currentPrice > 0) {
                    positionMarketValue = Math.abs(positionQuantity) * currentPrice;
                }
            }
        }
        
        // לוג דיאגנוסטיקה עבור טבלת תכנון/פוזיציה
        try {
            window.Logger?.info?.('🔎 [TradeDetails Diagnostics] Planning/Position snapshot', {
                tradeId: tradeData.id,
                sources: {
                    hasTradePlanObject: !!tradeData.trade_plan,
                    hasFlatPlannedAmount: !!(tradeData.trade_plan_planned_amount || tradeData.planned_amount),
                    hasTradePlanningFields: !!(tradeData.planned_quantity || tradeData.planned_amount || tradeData.entry_price),
                    hasLinkedItems: Array.isArray(tradeData.linked_items),
                    linkedItemsCount: Array.isArray(tradeData.linked_items) ? tradeData.linked_items.length : 0
                },
                prePlan: {
                    prePlanAmount,
                    prePlanEntryPrice,
                    prePlanQuantity
                },
                actualPlan: {
                    actualPlanAmount,
                    actualPlanEntryPrice,
                    actualPlanQuantity
                },
                position: {
                    positionQuantity,
                    positionAveragePrice,
                    positionMarketValue
                },
                prices: {
                    currentPrice
                }
            }, { page: 'entity-details-renderer' });
        } catch (_e) {}

        // חישוב Realized P/L, Unrealized P/L, MTM P/L מ-executions
        // רק מ-executions שיש להם נתונים מפורשים - אין fallback או דמה!
        let hasRealizedPLData = false;
        let hasMTMData = false;
        
        executions.forEach(exec => {
            const action = exec.action || '';
            
            // Realized P/L - רק מ-sell executions (רק אם יש נתון מפורש)
            if (action === 'sell' && exec.realized_pl !== null && exec.realized_pl !== undefined) {
                realizedPL += parseFloat(exec.realized_pl || 0);
                hasRealizedPLData = true;
            }
            
            // MTM P/L - מכל ה-executions (רק אם יש נתון מפורש)
            if (exec.mtm_pl !== null && exec.mtm_pl !== undefined) {
                mtmPL += parseFloat(exec.mtm_pl || 0);
                hasMTMData = true;
            }
        });
        
        // חישוב Unrealized P/L = (מחיר נוכחי - מחיר ממוצע) * כמות נוכחית
        // רק אם יש מחיר נוכחי ומחיר ממוצע תקינים
        let unrealizedPLCalculated = false;
        if (positionQuantity !== 0 && currentPrice > 0 && positionAveragePrice > 0) {
            unrealizedPL = (currentPrice - positionAveragePrice) * positionQuantity;
            unrealizedPLCalculated = true;
        }
        
        // בדיקה: אם אין מכירות, Unrealized P/L צריך להיות שווה ל-Total P/L
        const hasSales = totalSoldQuantity > 0;
        const hasValidTotalPL = tradeData.total_pl !== null && tradeData.total_pl !== undefined;
        const totalPLValue = hasValidTotalPL ? parseFloat(tradeData.total_pl || 0) : null;
        
        // אם אין מכירות ויש Unrealized P/L מחושב, Total P/L צריך להיות שווה לו
        if (!hasSales && unrealizedPLCalculated) {
            // אם Total P/L מה-backend שונה משמעותית מ-Unrealized P/L, נשתמש ב-Unrealized P/L המחושב
            if (hasValidTotalPL) {
                const diff = Math.abs(totalPLValue - unrealizedPL);
                // אם ההפרש גדול מ-0.01, נשתמש ב-Unrealized P/L המחושב (יותר מדויק)
                if (diff > 0.01) {
                    // Total P/L מה-backend לא תואם - נשתמש ב-Unrealized P/L המחושב
                    // Total P/L יעודכן להיות שווה ל-Unrealized P/L
                }
            }
        }
        
        // חישוב אחוזים עבור כל סוגי P/L
        let realizedPLPercent = null;
        let unrealizedPLPercent = null;
        let mtmPLPercent = null;
        let totalPLPercent = null;
        
        // Realized P/L אחוז - יחסית למחיר הממוצע של הקניות שנמכרו
        // השלם: סכום הקניות שנמכרו (מחיר ממוצע קניות * כמות שנמכרה)
        if (hasSales && hasRealizedPLData && totalBoughtAverage > 0 && totalSoldQuantity > 0) {
            // חישוב: רווח/הפסד מוכר / (מחיר ממוצע קניות * כמות שנמכרה) * 100
            const soldCostBasis = totalBoughtAverage * totalSoldQuantity;
            if (soldCostBasis > 0) {
                realizedPLPercent = (realizedPL / soldCostBasis) * 100;
            }
        }
        
        // Unrealized P/L אחוז - יחסית למחיר הממוצע של הפוזיציה
        if (unrealizedPLCalculated && positionAveragePrice > 0) {
            unrealizedPLPercent = ((currentPrice - positionAveragePrice) / positionAveragePrice) * 100;
        }
        
        // MTM P/L אחוז - יחסית למחיר הממוצע של הפוזיציה
        if (hasMTMData && positionAveragePrice > 0 && positionQuantity !== 0) {
            const mtmPLPerShare = mtmPL / Math.abs(positionQuantity);
            mtmPLPercent = (mtmPLPerShare / positionAveragePrice) * 100;
        }
        
        // חישוב Total P/L - לוגיקה נכונה:
        // אם אין מכירות: Total P/L = Unrealized P/L
        // אם יש מכירות: Total P/L = Realized P/L + Unrealized P/L
        let calculatedTotalPL = null;
        let totalPLDisplay = null;
        let totalPLMessage = null;
        
        if (!hasSales) {
            // אין מכירות - Total P/L צריך להיות שווה ל-Unrealized P/L
            if (unrealizedPLCalculated) {
                calculatedTotalPL = unrealizedPL;
                totalPLPercent = unrealizedPLPercent;
            } else {
                // אין מחיר נוכחי - לא ניתן לחשב Unrealized P/L
                calculatedTotalPL = null;
                totalPLMessage = 'לא ניתן לחשב - חסר מחיר נוכחי';
            }
        } else {
            // יש מכירות - Total P/L = Realized P/L + Unrealized P/L
            calculatedTotalPL = realizedPL + unrealizedPL;
            
            // חישוב אחוז Total P/L - יחסית לסכום ההשקעה הכולל
            const totalInvestment = totalBoughtAmount;
            if (totalInvestment > 0) {
                totalPLPercent = (calculatedTotalPL / totalInvestment) * 100;
            } else if (positionAveragePrice > 0 && positionQuantity !== 0) {
                // Fallback: יחסית למחיר הממוצע
                const totalCost = positionAveragePrice * Math.abs(positionQuantity);
                if (totalCost > 0) {
                    totalPLPercent = (calculatedTotalPL / totalCost) * 100;
                }
            }
        }
        
        // פורמט Total P/L
        if (calculatedTotalPL !== null) {
            const totalPLFormatted = FieldRenderer?.renderAmount
                ? FieldRenderer.renderAmount(calculatedTotalPL, '$', 2, true)
                : (window.colorAmountByValue
                    ? window.colorAmountByValue(calculatedTotalPL, `$${calculatedTotalPL.toFixed(2)}`)
                    : `$${calculatedTotalPL.toFixed(2)}`);
            
            // הוספת אחוז אם יש
            if (totalPLPercent !== null) {
                totalPLDisplay = `${totalPLFormatted} <span class="text-muted">(${totalPLPercent >= 0 ? '+' : ''}${totalPLPercent.toFixed(2)}%)</span>`;
            } else {
                totalPLDisplay = totalPLFormatted;
            }
        } else {
            totalPLDisplay = totalPLMessage || '<span class="text-muted">חסר נתונים</span>';
        }
        
        // חישוב אחוז מהחשבון - שימוש בנתונים מה-backend
        let accountTotalValue = tradeData.account_total_value || 0;
        
        // חישוב אחוז מהחשבון עבור פוזיציה בפועל
        if (accountTotalValue > 0 && positionMarketValue > 0) {
            positionPercentOfAccount = (positionMarketValue / accountTotalValue) * 100;
        }
        
        // חישוב אחוז מהחשבון עבור תכנון מקדים ותכנון בפועל
        // רק אם יש נתונים אמיתיים (לא null)
        let prePlanPercentOfAccount = null;
        if (accountTotalValue > 0 && prePlanAmount !== null && prePlanAmount > 0) {
            prePlanPercentOfAccount = (prePlanAmount / accountTotalValue) * 100;
        }
        let actualPlanPercentOfAccount = null;
        if (accountTotalValue > 0 && actualPlanAmount !== null && actualPlanAmount > 0) {
            actualPlanPercentOfAccount = (actualPlanAmount / accountTotalValue) * 100;
        }
        
        // פורמט כמות - ספרה אחת אחרי הנקודה
        // אם null - מציג "לא זמין" (לא fallback!)
        const formatQuantity = (qty) => {
            if (qty === null || qty === undefined) {
                return '<span class="text-muted">לא זמין</span>';
            }
            if (qty === 0) return '0';
            // עיגול לספרה אחת אחרי הנקודה
            const roundedQty = parseFloat((Math.round(qty * 10) / 10).toFixed(1));
            // פורמט עם ספרה אחת אחרי הנקודה
            const formattedQty = roundedQty.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
            // אם renderShares קיים, נשתמש בו אבל נחליף את המספר בפורמט הנכון
            if (FieldRenderer?.renderShares) {
                const sharesHtml = FieldRenderer.renderShares(roundedQty);
                // החלפת המספר בפורמט הנכון (עם ספרה אחת אחרי הנקודה)
                return sharesHtml.replace(/#[\d,]+\.?[\d]*/, `#${formattedQty}`);
            } else if (window.renderShares) {
                const sharesHtml = window.renderShares(roundedQty);
                return sharesHtml.replace(/#[\d,]+\.?[\d]*/, `#${formattedQty}`);
            } else {
                return formattedQty;
            }
        };
        
        // פורמט סכום - שימוש ישיר ב-FieldRendererService
        // אם null - מציג "לא זמין"
        const formatAmount = (amt) => {
            if (amt === null || amt === undefined) {
                return '<span class="text-muted">לא זמין</span>';
            }
            if (amt === 0) return '$0.00';
            return window.FieldRendererService.renderAmount(amt, '$', 2, false);
        };
        
        // פונקציה עזר לפורמט P/L עם אחוזים
        const formatPLWithPercent = (plValue, plPercent, hasData) => {
            if (!hasData) return formatAmount(plValue || 0);
            if (plValue === null || plValue === undefined) return formatAmount(0);
            
            const plFormatted = formatAmount(plValue);
            if (plPercent !== null && plPercent !== undefined && !isNaN(plPercent)) {
                return `${plFormatted} <span class="text-muted">(${plPercent >= 0 ? '+' : ''}${plPercent.toFixed(2)}%)</span>`;
            }
            return plFormatted;
        };
        
        // פורמט מחיר ממוצע
        // אם null - מציג "לא זמין" (לא fallback!)
        const formatAveragePrice = (price) => {
            if (price === null || price === undefined) {
                return '<span class="text-muted">לא זמין</span>';
            }
            if (price === 0) return '$0.00';
            return FieldRenderer?.renderAmount
                ? FieldRenderer.renderAmount(price, '$', 2, false)
                : (window.renderAmount
                    ? window.renderAmount(price, '$', 2, false)
                    : `$${price.toFixed(2)}`);
        };
        
        // פורמט אחוז
        // אם null - מציג "לא זמין" (לא fallback!)
        const formatPercent = (percent) => {
            if (percent === null || percent === undefined) {
                return '<span class="text-muted">לא זמין</span>';
            }
            if (percent === 0) return '0.00%';
            return `${percent.toFixed(2)}%`;
        };
        
        return `
            <div class="trade-specific">
                <h6 class="border-bottom pb-2 mb-3">פרטי טרייד</h6>
                
                <div class="mb-3">
                    <table class="table table-sm" style="border: none;">
                        <thead>
                            <tr>
                                <th style="width: 25%; border: none; padding: 8px;"></th>
                                <th style="width: 25%; border: none; padding: 8px;">תכנון מקדים</th>
                                <th style="width: 25%; border: none; padding: 8px;">תכנון בפועל</th>
                                <th style="width: 25%; border: none; padding: 8px;">פוזיציה</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: none; padding: 8px;"><strong>כמות:</strong></td>
                                <td style="border: none; padding: 8px;">${hasPrePlan ? formatQuantity(prePlanQuantity) : '<span class="text-muted">לא זמין</span>'}</td>
                                <td style="border: none; padding: 8px;">${hasActualPlan ? formatQuantity(actualPlanQuantity) : '<span class="text-muted">לא זמין</span>'}</td>
                                <td style="border: none; padding: 8px;">${formatQuantity(positionQuantity)}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 8px;"><strong>סכום:</strong></td>
                                <td style="border: none; padding: 8px;">${hasPrePlan ? formatAmount(prePlanAmount) : '<span class="text-muted">לא זמין</span>'}</td>
                                <td style="border: none; padding: 8px;">${hasActualPlan ? formatAmount(actualPlanAmount) : '<span class="text-muted">לא זמין</span>'}</td>
                                <td style="border: none; padding: 8px;">${formatAmount(positionMarketValue)}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 8px;"><strong>אחוז מהחשבון:</strong></td>
                                <td style="border: none; padding: 8px;">${prePlanPercentOfAccount !== null ? formatPercent(prePlanPercentOfAccount) : '<span class="text-muted">לא זמין</span>'}</td>
                                <td style="border: none; padding: 8px;">${actualPlanPercentOfAccount !== null ? formatPercent(actualPlanPercentOfAccount) : '<span class="text-muted">לא זמין</span>'}</td>
                                <td style="border: none; padding: 8px;">${positionPercentOfAccount > 0 ? formatPercent(positionPercentOfAccount) : '<span class="text-muted">לא זמין</span>'}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 8px;"><strong>מחיר כניסה:</strong></td>
                                <td style="border: none; padding: 8px;">${hasPrePlan ? formatAveragePrice(prePlanEntryPrice) : '<span class="text-muted">לא זמין</span>'}</td>
                                <td style="border: none; padding: 8px;">${hasActualPlan ? formatAveragePrice(actualPlanEntryPrice) : '<span class="text-muted">לא זמין</span>'}</td>
                                <td style="border: none; padding: 8px;">${formatAveragePrice(positionAveragePrice)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="mt-2 pt-2" style="border-top: 1px solid #e0e0e0;">
                        <table class="table table-sm" style="border: none;">
                            <thead>
                                <tr>
                                    <th style="width: 33%; border: none; padding: 8px;"></th>
                                    <th style="width: 33%; border: none; padding: 8px;">קניות</th>
                                    <th style="width: 34%; border: none; padding: 8px;">מכירות</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border: none; padding: 8px;"><strong>כמות:</strong></td>
                                    <td style="border: none; padding: 8px;" class="text-success">${formatQuantity(totalBoughtQuantity)}</td>
                                    <td style="border: none; padding: 8px;" class="text-danger">${formatQuantity(totalSoldQuantity)}</td>
                                </tr>
                                <tr>
                                    <td style="border: none; padding: 8px;"><strong>סכום כולל:</strong></td>
                                    <td style="border: none; padding: 8px;" class="text-success">${formatAmount(totalBoughtAmount)}</td>
                                    <td style="border: none; padding: 8px;" class="text-danger">${formatAmount(totalSoldAmount)}</td>
                                </tr>
                                <tr>
                                    <td style="border: none; padding: 8px;"><strong>סכום ממוצע:</strong></td>
                                    <td style="border: none; padding: 8px;" class="text-success">${formatAveragePrice(totalBoughtAverage)}</td>
                                    <td style="border: none; padding: 8px;" class="text-danger">${formatAveragePrice(totalSoldAverage)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-2 pt-2" style="border-top: 1px solid #e0e0e0;">
                        <div class="d-flex align-items-center mb-2">
                            <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">Realized P/L:</label>
                            <span>${hasSales ? (hasRealizedPLData ? formatPLWithPercent(realizedPL, realizedPLPercent, true) || formatAmount(realizedPL) : '<span class="text-muted">אין נתונים ב-executions</span>') : '<span class="text-muted">אין מכירות</span>'}</span>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">Unrealized P/L:</label>
                            <span>${unrealizedPLCalculated ? formatPLWithPercent(unrealizedPL, unrealizedPLPercent, true) || formatAmount(unrealizedPL) : '<span class="text-muted">חסר מחיר נוכחי</span>'}</span>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">MTM P/L:</label>
                            <span>${hasMTMData ? formatPLWithPercent(mtmPL, mtmPLPercent, true) || formatAmount(mtmPL) : '<span class="text-muted">אין נתונים</span>'}</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">Total P/L:</label>
                            <span>${totalPLDisplay}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        } catch (error) {
            window.Logger?.error('Error in renderTradeSpecific:', error, { page: "entity-details-renderer" });
            return `<div class="trade-specific">
                <h6 class="border-bottom pb-2 mb-3">פרטי טרייד</h6>
                <div class="alert alert-danger">
                    שגיאה ברנדור: ${error.message || error}
                </div>
            </div>`;
        }
    }

    /**
     * Render trade plan details - רנדור פרטי תכנית מסחר
     *
     * @param {Object} tradePlanData - נתוני תכנית המסחר
     * @param {Object} options - אפשרויות רנדור
     * @returns {string} - HTML מרונדר של התכנית
     * @public
     */
    renderTradePlan(tradePlanData, options = {}) {
        if (!tradePlanData) {
            return this.renderError('לא נמצאו נתוני תכנית מסחר להצגה');
        }

        const FieldRenderer = window.FieldRendererService || null;
        const entityColor = this.entityColors.trade_plan || this.entityColors.trade || (typeof window.getEntityColor === 'function' ? (window.getEntityColor('trade_plan') || window.getEntityColor('trade')) : '');

        const tickerSymbol = tradePlanData.ticker_symbol ||
            tradePlanData.ticker?.symbol ||
            (tradePlanData.ticker_id ? `טיקר #${tradePlanData.ticker_id}` : 'לא זמין');

        let tickerInfoHTML = '';
        if (tradePlanData.ticker && FieldRenderer?.renderTickerInfo) {
            const tickerData = {
                symbol: tradePlanData.ticker.symbol || tickerSymbol,
                name: tradePlanData.ticker.name || '',
                current_price: tradePlanData.ticker.current_price || 0,
                daily_change: tradePlanData.ticker.daily_change || tradePlanData.ticker.change_amount || 0,
                daily_change_percent: tradePlanData.ticker.daily_change_percent || tradePlanData.ticker.change_percent || 0,
                volume: tradePlanData.ticker.volume || 0,
                currency_symbol: tradePlanData.ticker.currency_symbol || tradePlanData.currency_symbol || '$'
            };

            if (tickerData.current_price > 0 || tickerData.daily_change !== 0 || tickerData.volume > 0) {
                tickerInfoHTML = FieldRenderer.renderTickerInfo(tickerData, 'mb-2');
            }
        }

        const statusDisplay = FieldRenderer?.renderStatus
            ? FieldRenderer.renderStatus(tradePlanData.status, 'trade_plan')
            : (tradePlanData.status || 'לא זמין');

        return `
            <div class="entity-details-container trade-plan-details">
                <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-3" style="border-bottom: 1px solid #e0e0e0; padding-bottom: 0.75rem;">
                    <div class="d-flex align-items-center gap-2" style="min-width: 120px;">
                        <strong>טיקר:</strong>
                        <span class="fw-bold">${tickerSymbol}</span>
                    </div>
                    <div class="flex-grow-1" style="text-align: center;">
                        ${tickerInfoHTML || ''}
                    </div>
                    <div class="d-flex align-items-center gap-3" style="min-width: 200px; justify-content: flex-end;">
                        ${statusDisplay ? `<span class="d-inline-flex align-items-center gap-2"><strong>סטטוס:</strong> ${statusDisplay}</span>` : ''}
                    </div>
                </div>

                <div class="row g-3">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(tradePlanData, 'trade_plan')}
                    </div>
                    <div class="col-md-6">
                        ${this.renderTradePlanSpecific(tradePlanData, entityColor)}
                    </div>
                </div>

                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(tradePlanData.linked_items || [], this.entityColors.trade_plan || entityColor, 'trade_plan', tradePlanData.id, options?.sourceInfo || null, options)}
                    </div>
                </div>

                <div class="row g-3 mt-4">
                    <div class="col-12">
                        ${this.renderActionButtons('trade_plan', tradePlanData.id, tradePlanData, options?.sourceInfo || null)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render specific trade plan info - רנדור מידע ייעודי לתכנית מסחר
     *
     * @param {Object} tradePlanData - נתוני תכנית המסחר
     * @param {string} entityColor - צבע הישות
     * @returns {string} - HTML מרונדר
     * @private
     */
    renderTradePlanSpecific(tradePlanData, entityColor = '#26baac') {
        const FieldRenderer = window.FieldRendererService || null;
        const currencySymbol = tradePlanData.currency_symbol ||
            tradePlanData.account_currency_symbol ||
            tradePlanData.trading_account?.currency_symbol ||
            '$';

        const renderAmount = (value, decimals = 2) => {
            if (FieldRenderer?.renderAmount) {
                return FieldRenderer.renderAmount(value || 0, currencySymbol, decimals, false);
            }
            const num = Number(value || 0);
            return `<span dir="ltr">${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>`;
        };

        const renderPercent = (value) => {
            if (FieldRenderer?.renderNumericValue) {
                return FieldRenderer.renderNumericValue(value || 0, '%', true);
            }
            if (value === null || value === undefined || Number.isNaN(Number(value))) {
                return '<span class="numeric-value-zero">-</span>';
            }
            const num = Number(value);
            const sign = num > 0 ? '+' : (num < 0 ? '-' : '');
            const cssClass = num > 0 ? 'numeric-value-positive' : (num < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
            return `<span class="${cssClass}" dir="ltr">${sign}${Math.abs(num).toFixed(2)}%</span>`;
        };

        const renderQuantity = (value) => {
            if (FieldRenderer?.renderNumericValue) {
                return FieldRenderer.renderNumericValue(value || 0, '', true);
            }
            if (value === null || value === undefined || Number.isNaN(Number(value))) {
                return '<span class="numeric-value-zero">-</span>';
            }
            const num = Number(value);
            const sign = num > 0 ? '+' : (num < 0 ? '-' : '');
            const cssClass = num > 0 ? 'numeric-value-positive' : (num < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
            return `<span class="${cssClass}" dir="ltr">${sign}${Math.abs(num).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>`;
        };

        // Calculate stop_price and target_price if not provided but percentages exist
        const entryPrice = Number(tradePlanData.entry_price || 0);
        let stopPrice = tradePlanData.stop_price || null;
        let targetPrice = tradePlanData.target_price || null;
        
        if (!stopPrice && entryPrice > 0 && tradePlanData.stop_percentage) {
            // Calculate stop_price from entry_price and stop_percentage
            const stopPercent = Number(tradePlanData.stop_percentage) / 100;
            const side = tradePlanData.side?.toLowerCase() || 'long';
            if (side === 'long') {
                stopPrice = entryPrice * (1 - stopPercent);
            } else {
                stopPrice = entryPrice * (1 + stopPercent);
            }
        }
        
        if (!targetPrice && entryPrice > 0 && tradePlanData.target_percentage) {
            // Calculate target_price from entry_price and target_percentage
            const targetPercent = Number(tradePlanData.target_percentage) / 100;
            const side = tradePlanData.side?.toLowerCase() || 'long';
            if (side === 'long') {
                targetPrice = entryPrice * (1 + targetPercent);
            } else {
                targetPrice = entryPrice * (1 - targetPercent);
            }
        }

        // Render Stop Loss with percentage and amount in one line (negative color)
        const renderStopLossCombined = () => {
            if (!stopPrice && !tradePlanData.stop_percentage) {
                return '<span class="text-muted">לא הוגדר</span>';
            }
            // Render amount with negative color
            const amountValue = stopPrice ? Number(stopPrice) : 0;
            const amountHtml = stopPrice 
                ? `<span class="numeric-value-negative" dir="ltr">${currencySymbol}${Math.abs(amountValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`
                : '<span class="text-muted">-</span>';
            // Render percentage with negative color (always negative for stop loss)
            let percentHtml = '<span class="text-muted">-</span>';
            if (tradePlanData.stop_percentage) {
                const stopPercent = Number(tradePlanData.stop_percentage);
                percentHtml = `<span class="numeric-value-negative" dir="ltr">-${Math.abs(stopPercent).toFixed(2)}%</span>`;
            }
            return `<span dir="ltr">${amountHtml} ${percentHtml}</span>`;
        };

        // Render Take Profit with percentage and amount in one line (positive color)
        const renderTakeProfitCombined = () => {
            if (!targetPrice && !tradePlanData.target_percentage) {
                return '<span class="text-muted">לא הוגדר</span>';
            }
            // Render amount with positive color
            const amountValue = targetPrice ? Number(targetPrice) : 0;
            const amountHtml = targetPrice 
                ? `<span class="numeric-value-positive" dir="ltr">${currencySymbol}${Math.abs(amountValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`
                : '<span class="text-muted">-</span>';
            // Render percentage with positive color
            const percentHtml = tradePlanData.target_percentage ? renderPercent(tradePlanData.target_percentage) : '<span class="text-muted">-</span>';
            return `<span dir="ltr">${amountHtml} ${percentHtml}</span>`;
        };

        return `
            <div class="trade-plan-specific">
                <h6 class="border-bottom pb-2 mb-3" style="border-color: ${entityColor} !important;">פרטי תכנון</h6>
                <div class="list-group list-group-flush">
                    <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                        <span class="text-muted">מחיר כניסה מתוכנן</span>
                        <span>${tradePlanData.entry_price ? renderAmount(tradePlanData.entry_price, 2) : '<span class="text-muted">לא הוגדר</span>'}</span>
                    </div>
                    <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                        <span class="text-muted">Stop Loss</span>
                        ${renderStopLossCombined()}
                    </div>
                    <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                        <span class="text-muted">Take Profit</span>
                        ${renderTakeProfitCombined()}
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
                    // Use FieldRendererService or dateUtils for consistent date formatting
                    let dateText = 'לא זמין';
                    if (exec.date) {
                        if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                            dateText = window.FieldRendererService.renderDate(exec.date, true);
                        } else if (window.formatDate) {
                            dateText = window.formatDate(exec.date, true);
                        } else if (window.dateUtils?.formatDate) {
                            dateText = window.dateUtils.formatDate(exec.date, { includeTime: true });
                        } else {
                            const dateObj = exec.date instanceof Date ? exec.date : new Date(exec.date);
                            dateText = dateObj.toLocaleString('he-IL');
                        }
                    }
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
                // Use FieldRendererService or dateUtils for consistent date formatting
                let dateText = 'לא זמין';
                if (exec.date) {
                    if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                        dateText = window.FieldRendererService.renderDate(exec.date, true);
                    } else if (window.formatDate) {
                        dateText = window.formatDate(exec.date, true);
                    } else if (window.dateUtils?.formatDate) {
                        dateText = window.dateUtils.formatDate(exec.date, { includeTime: true });
                    } else {
                        const dateObj = exec.date instanceof Date ? exec.date : new Date(exec.date);
                        dateText = dateObj.toLocaleString('he-IL');
                    }
                }
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
                                    <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="תאריך" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTableData(0, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)"></button>
                                </th>
                                <th>
                                    <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="פעולה" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTableData(1, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)"></button>
                                </th>
                                <th>
                                    <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="כמות" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTableData(2, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)"></button>
                                </th>
                                <th>
                                    <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="מחיר" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTableData(3, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)"></button>
                                </th>
                                <th>
                                    <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="עמלה" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTableData(4, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)"></button>
                                </th>
                                <th>
                                    <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="סה"כ" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTableData(5, window.positionExecutionsData || [], 'position_executions', window.updatePositionExecutionsTable)"></button>
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
        
        // Register position_executions table with UnifiedTableSystem if not already registered
        if (normalizedExecutions.length > 0 && window.UnifiedTableSystem?.registry && !window.UnifiedTableSystem.registry.isRegistered('position_executions')) {
            const columns = window.TABLE_COLUMN_MAPPINGS?.position_executions || [];
            window.UnifiedTableSystem.registry.register('position_executions', {
                dataGetter: () => {
                    if (window.TableDataRegistry) {
                        return window.TableDataRegistry.getFullData('position_executions', { asReference: true });
                    }
                    return window.positionExecutionsData || [];
                },
                updateFunction: (rows) => {
                    if (typeof window.updatePositionExecutionsTable === 'function') {
                        window.updatePositionExecutionsTable(rows);
                    }
                },
                tableSelector: '#positionExecutionsTable',
                columns,
                filterable: false,
                sortable: true,
                // Default sort: date desc (column index 0)
                defaultSort: { columnIndex: 0, direction: 'desc', key: 'date' }
            });
        }

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
            window.Logger?.info('🔍 [renderLinkedItems] Starting render', { 
                itemsCount: items.length, 
                parentEntityType, 
                parentEntityId,
                items: items.slice(0, 3), // Show first 3 items for debugging
                itemsIsArray: Array.isArray(items),
                itemsType: typeof items
            }, { page: 'entity-details-renderer' });
            
            console.log('🔍 [renderLinkedItems] Starting render', { 
                itemsCount: items.length, 
                parentEntityType, 
                parentEntityId,
                items: items.slice(0, 3) // Show first 3 items for debugging
            });
            
            const sanitizedSuffix = `${parentEntityType || 'entity'}_${parentEntityId || '0'}`.replace(/[^a-zA-Z0-9_-]/g, '_');
            const tableId = `linkedItemsTable_${sanitizedSuffix}`;
            const tableType = `linked_items__${sanitizedSuffix}`;

            let enrichedItems = this._enrichLinkedItems(items, parentEntityType, options);
            console.log('🔍 [renderLinkedItems] After enrichment', { 
                enrichedCount: enrichedItems.length,
                enrichedItems: enrichedItems.slice(0, 3) // Show first 3 items for debugging
            });
            
            // מיון פריטים מקושרים - פתוחים ראשון, אחר כך תאריך (חדש לישן)
            if (!window.LinkedItemsService || !window.LinkedItemsService.sortLinkedItems) {
                console.error('❌ [renderLinkedItems] LinkedItemsService is not available');
                if (window.Logger) {
                    window.Logger.error('LinkedItemsService is not available', { page: 'entity-details-renderer' });
                }
                return '<div class="alert alert-warning">שגיאה בטעינת שירות פריטים מקושרים</div>';
            }
            enrichedItems = window.LinkedItemsService.sortLinkedItems(enrichedItems);

            if (!window.linkedItemsTableData) {
                window.linkedItemsTableData = {};
            }
            window.linkedItemsTableData[tableId] = enrichedItems;

            if (window.TableDataRegistry) {
                window.TableDataRegistry.registerTable({ tableType, tableId, source: 'entity-details-renderer' });
                window.TableDataRegistry.setFullData(tableType, enrichedItems, {
                    tableId,
                    resetFiltered: true,
                });
            }

            if (window.UnifiedTableSystem?.registry && !window.UnifiedTableSystem.registry.isRegistered(tableType)) {
                const columns = window.TABLE_COLUMN_MAPPINGS?.linked_items || [];
                // Default sort: created_at desc (column index 4)
                window.UnifiedTableSystem.registry.register(tableType, {
                    dataGetter: () => {
                        if (window.TableDataRegistry) {
                            return window.TableDataRegistry.getFullData(tableType, { asReference: true });
                        }
                        return window.linkedItemsTableData?.[tableId] || [];
                    },
                    updateFunction: (rows) => this.updateLinkedItemsTableBody(tableId, rows),
                    tableSelector: `#${tableId}`,
                    columns,
                    filterable: true,
                    sortable: true,
                    defaultSort: { columnIndex: 4, direction: 'desc', key: 'created_at' }
                });
            }

            if (!window.linkedItemsSortHandlers) {
                window.linkedItemsSortHandlers = {};
            }
            window.linkedItemsSortHandlers[tableId] = (sortedData) => {
                if (typeof window.updateLinkedItemsTable === 'function') {
                    window.updateLinkedItemsTable(tableId, sortedData);
                } else if (window.entityDetailsRenderer && typeof window.entityDetailsRenderer.updateLinkedItemsTableBody === 'function') {
                    window.entityDetailsRenderer.updateLinkedItemsTableBody(tableId, Array.isArray(sortedData) ? sortedData : []);
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
            const hasRegistry = Boolean(window.TableDataRegistry);
            const dataExpression = hasRegistry
                ? `window.TableDataRegistry.getFilteredData('${tableType}')`
                : `window.linkedItemsTableData['${tableId}'] || []`;
            const makeSortButton = (label, columnIndex, alignment = 'start') => `
                <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="${label}" data-classes="btn-link sortable-header px-0 text-${alignment}" data-onclick="window.sortTableData(${columnIndex}, ${dataExpression}, '${tableType}', ${sortHandlerReference})"></button>
            `;

            // Get table headers based on entity types in the table
            const tableHeaders = this._getLinkedItemsTableHeaders(enrichedItems, makeSortButton);

            if (showFilter) {
                setTimeout(async () => {
                    if (window.entityDetailsRenderer && window.entityDetailsRenderer._initializeFilterTooltips) {
                        window.entityDetailsRenderer._initializeFilterTooltips(tableId);
                    }
                    
                    // טעינת מצב פילטר שמור
                    const pageName = (typeof window.getCurrentPageName === 'function') ? window.getCurrentPageName() : 'default';
                    const savedFilterType = await loadEntityFilterState(pageName, tableId);
                    if (savedFilterType && savedFilterType !== 'all') {
                        // הפעלת הפילטר השמור
                        await window.filterLinkedItemsByType(tableId, savedFilterType);
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
                        ${
                            enrichedItems.length
                                ? `
                            <div class="table-responsive entity-linked-items-table-wrapper">
                                <table class="table table-sm table-hover mb-0 entity-linked-items-table" id="${tableId}" data-table-type="${tableType}">
                                    <thead>
                                        <tr>
                                            ${tableHeaders}
                                        </tr>
                                    </thead>
                                    <tbody>${rowsHtml}</tbody>
                                </table>
                            </div>
                        `
                                : `
                            <div class="text-center py-4">
                                ${(window.LinkedItemsService && window.LinkedItemsService.renderEmptyLinkedItems) 
                                    ? window.LinkedItemsService.renderEmptyLinkedItems(parentEntityType, parentEntityId, entityColor)
                                    : '<div class="text-muted">אין פריטים מקושרים</div>'}
                            </div>
                        `
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
            window.Logger?.info('🔍 [renderLinkedItems] After creating HTML template', {
                htmlLength: html.length,
                tbodyFound: tbodyIndex >= 0,
                tbodyContentLength: tbodyContent.length,
                tbodyContentPreview: tbodyContent.substring(0, 200),
                tbodyContentMatchesRowsHtml: tbodyContent.trim() === rowsHtml.trim(),
                enrichedItemsCount: enrichedItems.length,
                tableId: tableId,
                hasTableInHTML: html.includes(`id="${tableId}"`),
                htmlIncludesLinkedItemsTable: html.includes('linkedItemsTable_')
            }, { page: 'entity-details-renderer' });
            
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
                window.ButtonSystem.initializeButtons();
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

    _renderLinkedEntityReference(entityType, entityId, displayName = null, meta = {}) {
        if (!entityId) {
            return '<span class="text-muted">לא זמין</span>';
        }

        const label = displayName
            ? this._escapeHtml(String(displayName))
            : this._escapeHtml(`${this.getEntityLabel(entityType)} #${entityId}`);

        if (window.FieldRendererService?.renderLinkedEntity) {
            return window.FieldRendererService.renderLinkedEntity(
                entityType,
                entityId,
                label,
                Object.assign({}, meta)
            );
        }

        return `
            <a href="#"
               class="entity-link"
               onclick="if (window.showEntityDetails) { window.showEntityDetails('${entityType}', ${entityId}); } return false;">
               ${label}
            </a>
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
            if (!window.LinkedItemsService || !window.LinkedItemsService.getEntityLabel || !window.LinkedItemsService.formatLinkedItemName) {
                console.error('❌ [renderLinkedItemsRow] LinkedItemsService is not available');
                if (window.Logger) {
                    window.Logger.error('LinkedItemsService is not available', { page: 'entity-details-renderer' });
                }
                return '<tr><td colspan="4" class="text-danger">שגיאה בטעינת שירות פריטים מקושרים</td></tr>';
            }
            const entityLabel = window.LinkedItemsService.getEntityLabel(item.type);
            const cleanName = window.LinkedItemsService.formatLinkedItemName(item);
            
            const itemId = item.id || item.entity_id || item.linked_id || '';
            const metrics = item.metrics || {};
            const conditions = item.conditions || {};
            const timestamps = item.timestamps || {};
            const sideValue = metrics.side ?? item.side;
            const investmentTypeValue = metrics.investment_type ?? item.investment_type;
            const quantityValue = metrics.quantity ?? item.quantity;
            const priceValue = metrics.price ?? item.price;
            const amountValue = metrics.amount ?? item.amount;
            const createdAtValue = item.created_at || timestamps.created_at;
            const updatedAtValue = item.updated_at || timestamps.updated_at;
            
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
                linkedBadge = window.FieldRendererService.renderLinkedEntity(
                    item.type,
                    item.id,
                    cleanName,
                    {
                        renderMode: 'linked-items-table',
                        status: item.status,
                        side: item.side,
                        investment_type: item.investment_type
                    }
                );
            }
            
            if (!linkedBadge) {
                linkedBadge = `
                        <div class="linked-items-table-link d-flex flex-column align-items-start gap-1">
                            <span class="linked-items-table-label fw-semibold text-body">${entityLabel}</span>
                            <span class="linked-items-table-name text-muted small">${cleanName}</span>
                        </div>
                    `;
            }
            
            const createdDisplay = this.formatDateTime(createdAtValue || updatedAtValue);
            
            let actionsHtml = '';
            if (window.LinkedItemsService && window.LinkedItemsService.generateLinkedItemActions) {
                actionsHtml = window.LinkedItemsService.generateLinkedItemActions(item, 'table', {
                    entityColors: this.entityColors,
                    sourceInfo: sourceInfo
                });
            } else {
                console.error('❌ [renderLinkedItemsRow] LinkedItemsService.generateLinkedItemActions is not available');
                if (window.Logger) {
                    window.Logger.error('LinkedItemsService.generateLinkedItemActions is not available', { page: 'entity-details-renderer' });
                }
            }
            
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
                const statusDisplay = window.FieldRendererService.renderStatus(item.status, item.type);
                
                const condition = conditions.trigger_type ?? item.condition ?? '';
                const targetValueRaw = conditions.target_value ?? item.target_value;
                const targetValue = targetValueRaw !== null && targetValueRaw !== undefined ? targetValueRaw : '';
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
                const side = sideValue || '';
                const quantity = quantityValue || 0;
                const price = priceValue || 0;
                
                const sideDisplay = side ? window.FieldRendererService.renderSide(side) : '';
                const quantityDisplay = quantity ? `<span class="text-muted me-2">כמות: ${parseFloat(quantity).toFixed(2)}</span>` : '';
                const priceDisplay = price ? `<span class="text-muted">מחיר: ${parseFloat(price).toFixed(2)}</span>` : '';
                
                const executionDisplay = `${sideDisplay} ${quantityDisplay} ${priceDisplay}`.trim() || '<span class="text-muted">-</span>';
                
                cells += `<td class="text-center col-linked-status" colspan="3">${executionDisplay}</td>`;
                cells += `<td class="text-center col-linked-date">${createdDisplay || ''}</td>`;
                cells += `<td class="text-center col-linked-actions">${actionsHtml}</td>`;
                
            } else {
                // Standard: Status | Side | Investment | Date | Actions
                const statusDisplay = this._getStatusOrAlternativeDisplay(item);
                const effectiveSide = sideValue;
                const effectiveInvestmentType = investmentTypeValue;
                const sideDisplay = effectiveSide ? window.FieldRendererService.renderSide(effectiveSide) : '<span class="badge badge-secondary">-</span>';
                const investmentDisplay = effectiveInvestmentType ? window.FieldRendererService.renderType(effectiveInvestmentType) : '<span class="badge badge-secondary">-</span>';
                
                cells += `<td class="text-center col-linked-status">${statusDisplay}</td>`;
                cells += `<td class="text-center col-linked-side">${sideDisplay}</td>`;
                cells += `<td class="text-center col-linked-investment">${investmentDisplay}</td>`;
                cells += `<td class="text-center col-linked-date">${createdDisplay || this.formatDateTime(createdAtValue || updatedAtValue) || ''}</td>`;
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

            return window.formatDate ? window.formatDate(date, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(date, { includeTime: true }) : date.toLocaleString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }));
        } catch (error) {
            return typeof dateValue === 'string' ? dateValue : '';
        }
    }

    /**
     * Get status badge HTML - משתמש ב-FieldRendererService המרכזי
     * @deprecated - השתמש ישירות ב-window.FieldRendererService.renderStatus()
     * 
     * @param {string} status - סטטוס הישות
     * @param {string} entityType - סוג ישות (לשימוש ב-FieldRendererService)
     * @returns {string} HTML של badge סטטוס
     * @private
     */
    getStatusBadge(status, entityType = 'default') {
        if (!status) {
            return '<span class="status-badge" data-status-category="unknown">-</span>';
        }

        // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
        if (window.FieldRendererService?.renderStatus) {
            return window.FieldRendererService.renderStatus(status, entityType);
        }
        
        // Fallback למקרה נדיר ביותר שהמערכת לא זמינה
        return '<span class="badge bg-light text-muted">-</span>';
    }

    getEntityIcon(entityType) {
        if (!entityType) {
            return '/trading-ui/images/icons/link.svg';
        }

        if (!window.LinkedItemsService || !window.LinkedItemsService.getLinkedItemIcon) {
            console.warn('⚠️ [getEntityIcon] LinkedItemsService.getLinkedItemIcon is not available, using fallback');
            return '/trading-ui/images/icons/link.svg';
        }

        return window.LinkedItemsService.getLinkedItemIcon(entityType);
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
        const executionColor = this.entityColors.execution || (typeof window.getEntityColor === 'function' ? window.getEntityColor('execution') : '');
        
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
        const color = executionColor || this.entityColors.execution || (typeof window.getEntityColor === 'function' ? window.getEntityColor('execution') : '');
        
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
                             action === 'sell' ? 'מכירה' :
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
                    <p class="mb-0">${window.FieldRendererService.renderTextPreview(notes, { maxLength: 500 })}</p>
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
            
            // נסה לקבל את הערך דרך המנגנון האחיד PreferencesCore
            try {
                if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
                    preferenceValue = await window.PreferencesCore.getPreference(
                        'default_trading_account',
                        window.PreferencesCore.currentUserId,
                        window.PreferencesCore.currentProfileId
                    );
                    if (preferenceValue !== null && preferenceValue !== undefined) {
                        profileId = window.PreferencesCore.currentProfileId ?? null;
                        window.Logger.info(`✅ [getDefaultAccountInfo] Got preference from PreferencesCore:`, {
                            value: preferenceValue,
                            profileId,
                            page: "entity-details-renderer"
                        });
                    } else {
                        window.Logger.warn(`⚠️ [getDefaultAccountInfo] Preference 'default_trading_account' not found in PreferencesCore`, { page: "entity-details-renderer" });
                    }
                } else {
                    window.Logger.warn(`⚠️ [getDefaultAccountInfo] PreferencesCore not available`, { page: "entity-details-renderer" });
                }
            } catch (coreError) {
                window.Logger.debug('PreferencesCore.getPreference failed', coreError, { page: "entity-details-renderer" });
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
        
        const accountColor = this.entityColors.trading_account || (typeof window.getEntityColor === 'function' ? window.getEntityColor('trading_account') : '');
        const statusDisplay = window.FieldRendererService.renderStatus(accountData.status, 'trading_account');
        
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
        const openingBalance = Number(accountData.opening_balance ?? accountData.openingBalance ?? 0);
        const openingBalanceHtml = this.formatFieldValue(openingBalance, 'currency', accountColor, 'opening_balance', formattingContext);
        const positionsValueHtml = this.formatFieldValue(positionsValue, 'currency', accountColor, 'positions_total_value', formattingContext);
        const totalAccountValueHtml = this.formatFieldValue(totalAccountValue, 'currency', accountColor, 'total_account_value', formattingContext);
        const baseCurrencyTotalHtml = this.formatFieldValue(baseCurrencyTotalValue, 'currency', accountColor, 'base_currency_total', formattingContext);
        const createdAtHtml = this.formatFieldValue(accountData.created_at, 'datetime', accountColor, 'created_at', accountData);
        const notesHtml = accountData.notes && String(accountData.notes).trim()
            ? this.formatFieldValue(accountData.notes, 'text', accountColor, 'notes', accountData)
            : '<span class="text-muted">אין הערות</span>';
        const tagsSection = this.renderTagsDisplay('trading_account', this._getEntityTags(accountData), {
            containerClasses: 'mt-3',
            title: 'תגיות',
            emptyMessage: 'אין תגיות משויכות'
        });

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
                                        <span class="text-muted">יתרת פתיחה</span>
                                        ${openingBalanceHtml}
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
                                ${tagsSection || ''}
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
            const statusDisplay = window.FieldRendererService.renderStatus(alertData.status, 'alert');
            
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
                this.entityColors.alert || (typeof window.getEntityColor === 'function' ? window.getEntityColor('alert') : ''),
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

        const hasLinkedItemsService = true;

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

        let actionsHtml = '';
        if (window.LinkedItemsService && window.LinkedItemsService.generateLinkedItemActions) {
            actionsHtml = window.LinkedItemsService.generateLinkedItemActions(itemForActions, 'modal', {
                entityColors: this.entityColors,
                sourceInfo: actionSourceInfo
            }) || '';
        } else {
            console.error('❌ [renderActionButtons] LinkedItemsService.generateLinkedItemActions is not available');
            if (window.Logger) {
                window.Logger.error('LinkedItemsService.generateLinkedItemActions is not available', { page: 'entity-details-renderer' });
            }
        }

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

        // Remove "open record page" action for cash_flow by stripping VIEW buttons
        if (entityType === 'cash_flow' && actionsHtml && actionsHtml.includes('data-button-type="VIEW"')) {
            actionsHtml = actionsHtml.replace(/<button[^>]*data-button-type="VIEW"[\s\S]*?<\/button>/g, '');
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
    formatDate(dateInput) {
        if (!dateInput) return 'לא זמין';
        try {
            // Support DateEnvelope {display, local, utc, epochMs}
            if (typeof dateInput === 'object') {
                const display = dateInput.display || dateInput.DISPLAY;
                if (display) return display;
                const localVal = dateInput.local || dateInput.LOCAL;
                if (localVal) {
                    // Use FieldRendererService or dateUtils for consistent date formatting
                    if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                        return window.FieldRendererService.renderDate(dateInput, true);
                    }
                    const d = new Date(localVal);
                    if (!isNaN(d.getTime())) {
                        if (window.formatDate) {
                            return window.formatDate(d, true);
                        }
                        if (window.dateUtils?.formatDate) {
                            return window.dateUtils.formatDate(d, { includeTime: true });
                        }
                        // Last resort: use toLocaleDateString
                        return d.toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                }
                const utcVal = dateInput.utc || dateInput.UTC;
                if (utcVal) {
                    // Use FieldRendererService or dateUtils for consistent date formatting
                    if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                        return window.FieldRendererService.renderDate(dateInput, true);
                    }
                    const d = new Date(utcVal);
                    if (!isNaN(d.getTime())) {
                        if (window.formatDate) {
                            return window.formatDate(d, true);
                        }
                        if (window.dateUtils?.formatDate) {
                            return window.dateUtils.formatDate(d, { includeTime: true });
                        }
                        // Last resort: use toLocaleDateString
                        return d.toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                }
                const epoch = dateInput.epochMs || dateInput.epochms || dateInput.epoch;
                if (epoch) {
                    // Use FieldRendererService or dateUtils for consistent date formatting
                    if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                        return window.FieldRendererService.renderDate(dateInput, true);
                    }
                    const d = new Date(Number(epoch));
                    if (!isNaN(d.getTime())) {
                        if (window.formatDate) {
                            return window.formatDate(d, true);
                        }
                        if (window.dateUtils?.formatDate) {
                            return window.dateUtils.formatDate(d, { includeTime: true });
                        }
                        // Last resort: use toLocaleDateString
                        return d.toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                }
            }
            // Fallbacks: handle YYYY-MM-DD safely, then general string/Date
            if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
                const [y, m, d] = dateInput.split('-').map(Number);
                const dateOnly = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0);
                // Use FieldRendererService or dateUtils for consistent date formatting
                if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                    return window.FieldRendererService.renderDate(dateOnly, false);
                }
                if (window.formatDate) {
                    return window.formatDate(dateOnly);
                }
                if (window.dateUtils?.formatDate) {
                    return window.dateUtils.formatDate(dateOnly, { includeTime: false });
                }
                // Last resort: use toLocaleDateString
                return dateOnly.toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            }
            const date = new Date(dateInput);
            // Use FieldRendererService or dateUtils for consistent date formatting
            if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                return window.FieldRendererService.renderDate(date, true);
            }
            if (window.formatDate) {
                return window.formatDate(date, true);
            }
            if (window.dateUtils?.formatDate) {
                return window.dateUtils.formatDate(date, { includeTime: true });
            }
            // Last resort: use toLocaleDateString
            return date.toLocaleDateString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return typeof dateInput === 'string' ? dateInput : 'לא זמין';
        }
    }
    renderCashFlow(cashFlowData, options = {}) {
        const entityColor = this.entityColors.cash_flow || (typeof window.getEntityColor === 'function' ? window.getEntityColor('cash_flow') : '');
        
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
        
        const exchangePairSection = (window.FieldRendererService &&
            typeof window.FieldRendererService.renderExchangePairCards === 'function' &&
            cashFlowData.exchange_pair_summary)
            ? window.FieldRendererService.renderExchangePairCards(cashFlowData.exchange_pair_summary, {
                currentId: cashFlowData.id,
                renderAction: (flow) => {
                    // Cash flow has no dedicated details page; do not render an open-page button
                    return '';
                }
            })
            : '';

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

                ${exchangePairSection ? `
                <div class="row g-3 mt-4">
                    <div class="col-12">
                        <h6 class="border-bottom pb-2 mb-3">צמד המרה</h6>
                        ${exchangePairSection}
                    </div>
                </div>` : ''}
                
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

        const amountHtml = window.FieldRendererService.renderAmount(amount, symbol || '', 0, true);

        if (section === 'primary') {
            const typeHtml = cashFlowData.type
                ? window.FieldRendererService.renderType(cashFlowData.type, amount)
                : '<span class="text-muted">לא זמין</span>';

            const currencyNameDisplay = name || 'לא זמין';
            const pairSummary = cashFlowData.exchange_pair_summary || null;
            const currenciesHtml = pairSummary
                ? (function () {
                    const fromName = pairSummary.from?.currency_name || 'לא זמין';
                    const toName = pairSummary.to?.currency_name || 'לא זמין';
                    const fromSymbol = pairSummary.from?.currency_symbol || '';
                    const toSymbol = pairSummary.to?.currency_symbol || '';
                    const fromBadge = window.FieldRendererService.renderCurrency(
                        pairSummary.from?.currency_id || null,
                        fromName,
                        fromSymbol || ''
                    );
                    const toBadge = window.FieldRendererService.renderCurrency(
                        pairSummary.to?.currency_id || null,
                        toName,
                        toSymbol || ''
                    );
                    return `
                        <div class="d-flex flex-column gap-2">
                            <div class="d-flex align-items-center gap-2">
                                <span class="text-muted">מקור:</span>
                                ${fromBadge}
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="text-muted">מבוקש:</span>
                                ${toBadge}
                            </div>
                        </div>
                    `;
                })()
                : `<span class="text-muted">${currencyNameDisplay}</span>`;
        
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
                
                    <div class="mb-3 d-flex">
                        <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">מטבע:</label>
                        <div class="d-flex align-items-start">
                            ${currenciesHtml}
                        </div>
                    </div>
                </div>
            `;
        }

        // Fee: for exchanges, fee is stored on the 'from' side; fallback to pair summary if present
        let feeAmount = Number(cashFlowData.fee_amount || 0);
        let feeSymbol = symbol || '';
        const pairSummary = cashFlowData.exchange_pair_summary || null;
        if (pairSummary && Number(pairSummary.fee_amount || 0) > 0) {
            feeAmount = Number(pairSummary.fee_amount);
            // Prefer account (fee) currency symbol from summary if available
            feeSymbol = pairSummary.fee_currency_symbol || feeSymbol;
            if ((!feeSymbol || feeSymbol.length === 0) && pairSummary.fee_currency_id && typeof window.getCurrencyDisplay === 'function') {
                const c = window.getCurrencyDisplay(pairSummary.fee_currency_id);
                feeSymbol = (c && c.symbol) ? c.symbol : feeSymbol;
            }
        }
        const feeHtml = window.FieldRendererService.renderAmount(feeAmount, feeSymbol, 0, true);

        let tradeDisplay = '<span class="text-muted">לא מקושר</span>';
        if (cashFlowData.trade_id) {
            const tradeLabel = cashFlowData.trade_symbol ||
                (cashFlowData.trade_ticker_symbol ? `${cashFlowData.trade_ticker_symbol} #${cashFlowData.trade_id}` : `טרייד #${cashFlowData.trade_id}`);
            tradeDisplay = window.FieldRendererService.renderLinkedEntity('trade', cashFlowData.trade_id, tradeLabel, {
                renderMode: 'details',
                status: cashFlowData.trade_status,
                side: cashFlowData.trade_side
            });
        }

        const sourceDisplay = cashFlowData.source
            ? `<span class="badge bg-info">${this.translateCashFlowSource(cashFlowData.source)}</span>`
            : '<span class="text-muted">לא זמין</span>';

        const externalIdDisplay = cashFlowData.external_id
            ? `<span class="badge bg-light text-dark text-break" style="word-break: break-word; max-width: 100%;">${cashFlowData.external_id}</span>`
            : '<span class="text-muted">לא זמין</span>';

        // Exchange rate (if available in pair summary)
        const exchangeRateRow = (pairSummary && pairSummary.exchange_rate)
            ? `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">שער המרה:</label>
                    <span class="text-muted" dir="ltr">${Number(pairSummary.exchange_rate).toFixed(6)}</span>
                </div>
              `
            : '';

        return `
            <div class="cash-flow-secondary mt-4">

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">עמלה:</label>
                    <div class="d-flex align-items-center gap-2">
                        ${feeHtml}
                    </div>
                </div>
                
                ${exchangeRateRow}
                
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
                
                ${this._renderCashFlowDescriptionInline(cashFlowData)}
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
            displayHtml = window.FieldRendererService.renderCurrency(
                cashFlowData.currency_id || null,
                name,
                symbol || ''
            );
        } else {
            const combined = `${symbol || ''}${name ? ` (${name})` : ''}`.trim();
            displayHtml = `<span class="text-muted" dir="ltr">${combined || name || symbol || ''}</span>`;
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
            'currency_exchange_from': 'המרת מט״ח - יציאה',
            'currency_exchange_to': 'המרת מט״ח - כניסה',
            'fee': 'עמלה',
            'dividend': 'דיבידנד',
            'interest': 'ריבית',
            'tax': 'מיסים',
            'syep_interest': 'ריבית SYEP',
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
     * Render cash flow description inline - רנדור הערה של תזרים מזומנים (inline, for secondary column)
     * Displays rich text (HTML) with line breaks support, without background
     * 
     * @param {Object} cashFlowData - נתוני תזרים מזומנים
     * @returns {string} - HTML מרונדר
     * @private
     */
    _renderCashFlowDescriptionInline(cashFlowData) {
        const description = cashFlowData.description || null;
        
        if (!description) {
            return ''; // Don't show empty description
        }
        
        // Sanitize HTML using RichTextEditorService for safe rich text rendering
        let descriptionHtml = '';
        if (window.RichTextEditorService && typeof window.RichTextEditorService.sanitizeHTML === 'function') {
            // Use RichTextEditorService sanitization for safe HTML rendering
            const sanitizedHtml = window.RichTextEditorService.sanitizeHTML(description);
            // Display as rich text without background - preserve formatting and line breaks
            descriptionHtml = sanitizedHtml || '<span class="text-muted">אין תוכן</span>';
        } else if (window.FieldRendererService && typeof window.FieldRendererService.renderTextPreview === 'function') {
            // Fallback to text preview with line breaks
            descriptionHtml = window.FieldRendererService.renderTextPreview(description, { maxLength: 2000, preserveLineBreaks: true });
        } else {
            // Last resort: escape and preserve line breaks
            descriptionHtml = this._escapeHtml(description).replace(/\n/g, '<br>');
        }
        
        return `
                <div class="mb-3 d-flex align-items-start">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">הערה:</label>
                    <div class="flex-grow-1 rich-text-content" style="white-space: pre-wrap; word-wrap: break-word;">
                        ${descriptionHtml}
                    </div>
                </div>
        `;
    }

    /**
     * Render cash flow linked items - רנדור פריטים מקושרים לתזרים מזומנים
     */
    renderCashFlowLinkedItems(cashFlowData) {
        // Use the general renderLinkedItems method like other entities
        let linkedItems = Array.isArray(cashFlowData.linked_items) ? [...cashFlowData.linked_items] : [];
        const entityColor = this.entityColors.cash_flow || (typeof window.getEntityColor === 'function' ? window.getEntityColor('cash_flow') : '');

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
        if (!window.LinkedItemsService || !window.LinkedItemsService.getLinkedItemIcon || !window.LinkedItemsService.getEntityLabel) {
            console.error('❌ [_generateFilterButton] LinkedItemsService is not available');
            if (window.Logger) {
                window.Logger.error('LinkedItemsService is not available', { page: 'entity-details-renderer' });
            }
            return '';
        }
        const iconPath = window.LinkedItemsService.getLinkedItemIcon(entityType);
        const entityLabel = window.LinkedItemsService.getEntityLabel(entityType);
        
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
        // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
        if (['trade', 'trade_plan', 'alert', 'trading_account', 'ticker'].includes(entityType)) {
            if (window.FieldRendererService?.renderStatus) {
                return window.FieldRendererService.renderStatus(item.status, entityType);
            }
            return this.getStatusBadge(item.status, entityType);
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
            const sideDisplay = side ? window.FieldRendererService.renderSide(side) : '';
            const quantityDisplay = quantity ? `<span class="text-muted">כמות: ${parseFloat(quantity).toFixed(2)}</span>` : '';
            return sideDisplay ? `${sideDisplay} ${quantityDisplay}`.trim() : quantityDisplay || '<span class="text-muted">-</span>';
        }
        
        // Default: show status if exists, otherwise show "-"
        // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
        if (item.status !== null && item.status !== undefined) {
            if (window.FieldRendererService?.renderStatus) {
                return window.FieldRendererService.renderStatus(item.status, entityType);
            }
            return this.getStatusBadge(item.status, entityType);
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
        const noteColor = this.entityColors.note || (typeof window.getEntityColor === 'function' ? window.getEntityColor('note') : '');
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
        
        if (!window.FieldRendererService.renderAttachment) {
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
    /**
     * Render import session details - רנדור פרטי סשן ייבוא
     * @param {Object} sessionData - Import session data
     * @param {Object} options - Rendering options
     * @returns {string} - HTML string
     */
    renderImportSession(sessionData, options = {}) {
        try {
            const sessionColor = this.entityColors.import_session || (typeof window.getEntityColor === 'function' ? window.getEntityColor('import_session') || window.getEntityColor('execution') : '');
            const sourceInfo = options?.sourceInfo || null;
            const linkedItemsOptions = Object.assign({}, options, { disableFilter: true });
            
            // Extract session information
            const sessionId = sessionData.id || 'לא זמין';
            const status = sessionData.status || 'unknown';
            const statusDisplay = window.FieldRendererService?.renderStatus 
                ? window.FieldRendererService.renderStatus(status, 'import_session')
                : `<span class="badge bg-secondary">${status}</span>`;
            
            const provider = sessionData.provider || sessionData.connector_type || 'לא צויין';
            const fileName = sessionData.file_name || 'לא צויין';
            const fileSize = sessionData.file_size ? this._formatFileSize(sessionData.file_size) : 'לא זמין';
            const tradingAccountName = sessionData.trading_account?.name 
                || sessionData.trading_account_name 
                || 'לא צויין';
            
            const totalRecords = sessionData.total_records || 0;
            const importedRecords = sessionData.imported_records || 0;
            const skippedRecords = sessionData.skipped_records || 0;
            
            const createdAt = this.formatDateTime(sessionData.created_at) || 'לא זמין';
            const completedAt = this.formatDateTime(sessionData.completed_at) || 'לא הושלם';
            
            // Summary data
            const summaryData = sessionData.summary_data || {};
            const summaryStats = sessionData.summary_stats || {};
            
            // Build summary section
            const summaryHtml = `
                <div class="import-session-summary-section">
                    <h6 class="border-bottom pb-2 mb-3" style="border-color: ${sessionColor} !important;">סיכום סטטיסטיקות</h6>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="d-flex justify-content-between align-items-center flex-wrap">
                                <span class="text-muted fw-bold">סה"כ רשומות:</span>
                                <span class="text-break">${totalRecords}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex justify-content-between align-items-center flex-wrap">
                                <span class="text-muted fw-bold">יובאו:</span>
                                <span class="text-break text-success">${importedRecords}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex justify-content-between align-items-center flex-wrap">
                                <span class="text-muted fw-bold">הושמטו:</span>
                                <span class="text-break text-warning">${skippedRecords}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            return `
                <div class="entity-details-container import-session-details">
                    <!-- מידע בסיסי -->
                    <div class="row g-3">
                        <div class="col-md-6">
                            ${this.renderBasicInfo(sessionData, 'import_session', sessionColor)}
                        </div>
                        <div class="col-md-6 d-flex flex-column gap-4">
                            <div class="import-session-status-section">
                                <h6 class="border-bottom pb-2 mb-3" style="border-color: ${sessionColor} !important;">סטטוס</h6>
                                <div class="d-flex justify-content-between align-items-center flex-wrap">
                                    <span class="text-muted fw-bold">סטטוס:</span>
                                    <span class="text-break">${statusDisplay}</span>
                                </div>
                            </div>
                            ${summaryHtml}
                        </div>
                    </div>
                    
                    <!-- פרטי קובץ -->
                    <div class="row g-3 mt-4">
                        <div class="col-12">
                            <div class="import-session-file-section">
                                <h6 class="border-bottom pb-2 mb-3" style="border-color: ${sessionColor} !important;">פרטי קובץ</h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                                            <span class="text-muted fw-bold">שם קובץ:</span>
                                            <span class="text-break" title="${fileName}">${this._escapeHtml(fileName)}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                                            <span class="text-muted fw-bold">גודל קובץ:</span>
                                            <span class="text-break">${fileSize}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                                            <span class="text-muted fw-bold">ספק נתונים:</span>
                                            <span class="text-break">${this._escapeHtml(provider)}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                                            <span class="text-muted fw-bold">חשבון מסחר:</span>
                                            <span class="text-break">${this._escapeHtml(tradingAccountName)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- פריטים מקושרים -->
                    <div class="row g-3 mt-4">
                        <div class="col-12">
                            ${this.renderLinkedItems(sessionData.linked_items || [], sessionColor, 'import_session', sessionData.id, sourceInfo, linkedItemsOptions)}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            window.Logger.error('Error rendering import session:', error, { page: "entity-details-renderer" });
            return '<div class="alert alert-danger">שגיאה בטעינת פרטי סשן הייבוא</div>';
        }
    }
    
    /**
     * Format file size - עיצוב גודל קובץ
     * @param {number} bytes - File size in bytes
     * @returns {string} - Formatted file size
     * @private
     */
    _formatFileSize(bytes) {
        if (!bytes || bytes === 0) {
            return '0 B';
        }
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        
        // אם אין נתונים - ננקה את הטבלה (זה תקין אחרי מחיקה)
        if (sortedData.length === 0) {
            console.log('ℹ️ [updateLinkedItemsTableBody] Empty sorted data - clearing table (this is normal after deletion)');
            tbody.innerHTML = '';
            
            // Initialize tooltips and buttons even for empty table
            this._initializeFilterTooltips(tableId);
            setTimeout(() => {
                if (window.initializeButtons && typeof window.initializeButtons === 'function') {
                    window.initializeButtons();
                } else if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
                    window.ButtonSystem.initializeButtons();
                }
            }, 100);
            
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
                
                // Use insertAdjacentHTML to directly insert the <tr> into tbody
                // This avoids browser stripping <tr> tags when parsing in a <div>
                tbody.insertAdjacentHTML('beforeend', rowHtml.trim());
                rowsAdded++;
                
                if (index === 0) {
                    const firstRow = tbody.querySelector('tr:last-child');
                    console.log('🔍 [updateLinkedItemsTableBody] First row added:', {
                        rowHTML: rowHtml.substring(0, 200),
                        rowElement: firstRow ? firstRow.outerHTML.substring(0, 200) : 'N/A'
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
            const currentTableType =
                table?.dataset?.tableType ||
                (window.TableDataRegistry?.resolveTableType?.(tableId)) ||
                'linked_items';
            window.updateSortIcons(currentTableType, null, null, table);
        }
        
        // Initialize tooltips for filter buttons
        this._initializeFilterTooltips(tableId);
        
        // טעינת מצב פילטר שמור
        const pageName = (typeof window.getCurrentPageName === 'function') ? window.getCurrentPageName() : 'default';
        loadEntityFilterState(pageName, tableId).then(async (savedFilterType) => {
            if (savedFilterType && savedFilterType !== 'all') {
                // הפעלת הפילטר השמור
                await window.filterLinkedItemsByType(tableId, savedFilterType);
            }
        }).catch(err => {
            if (window.Logger) {
                window.Logger.warn('⚠️ Failed to load entity filter state', err, { page: "entity-details-renderer" });
            }
        });
        
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
        
        // Use centralized button system to initialize tooltips
        // This ensures consistent tooltip handling across the entire system
        if (window.advancedButtonSystem && typeof window.advancedButtonSystem.initializeTooltips === 'function') {
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
        } else {
            console.warn(`🔍 [Tooltip Debug] Button system not available - tooltips will not be initialized`);
            if (window.Logger) {
                window.Logger.warn('Button system not available for tooltip initialization', { 
                    tableId, 
                    page: 'entity-details-renderer' 
                });
            }
        }
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
            const typeLabel = window.LinkedItemsService.getEntityLabel(enriched.type);
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
            const label = window.LinkedItemsService.getEntityLabel(item.type);
            const cleanName = window.LinkedItemsService.formatLinkedItemName(item);

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

        if (window.TableDataRegistry) {
            const resolvedTableType = window.TableDataRegistry.resolveTableType?.(tableId) || tableId;
            window.TableDataRegistry.setFullData(resolvedTableType, updatedItems, {
                tableId,
                resetFiltered: false,
            });
        }

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
        
        // תאריך יצירה מוצג רק עבור ישויות שאינן ticker או trade (עבור trade הוא מוצג אחרי סוג השקעה)
        if (entityType !== 'ticker' && entityType !== 'cash_flow' && entityType !== 'trade' && entityType !== 'trade_plan') {
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
            const statusDisplay = status ? window.FieldRendererService.renderStatus(status, 'ticker') : '<span class="text-muted">לא זמין</span>';
            
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
            if (relatedEntity && window.FieldRendererService.renderLinkedEntity) {
                const cleanName = window.LinkedItemsService.formatLinkedItemName(relatedEntity);
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
                const fallbackLabel = window.LinkedItemsService.formatLinkedItemName(relatedEntity);
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
            const positiveTypes = new Set(['deposit', 'dividend', 'transfer_in', 'other_positive', 'currency_exchange_to']);
            const negativeTypes = new Set(['withdrawal', 'fee', 'transfer_out', 'other_negative', 'currency_exchange_from']);
            
            let effectiveAmount = amountValue;
            if (typeLower) {
                if (positiveTypes.has(typeLower)) {
                    effectiveAmount = Math.abs(amountValue);
                } else if (negativeTypes.has(typeLower)) {
                    effectiveAmount = -Math.abs(amountValue);
                }
            }
            
            const amountHtml = window.FieldRendererService.renderAmount(effectiveAmount, symbol || '', 0, true);
            const typeHtml = entityData.type
                ? window.FieldRendererService.renderType(entityData.type, effectiveAmount)
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
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך יצירה:</label>
                    <span class="text-muted">${createdAt}</span>
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
        } else if (entityType === 'trade_plan') {
            const FieldRenderer = window.FieldRendererService || null;
            const sideDisplay = FieldRenderer?.renderSide
                ? FieldRenderer.renderSide(entityData.side)
                : (entityData.side || 'לא זמין');

            const investmentTypeDisplay = FieldRenderer?.renderType
                ? FieldRenderer.renderType(entityData.investment_type || '')
                : (entityData.investment_type || 'לא זמין');

            const accountId = entityData.trading_account_id || entityData.account_id || entityData.account?.id || null;
            const accountName = entityData.trading_account_name ||
                entityData.account_name ||
                entityData.account?.name ||
                (accountId ? `חשבון #${accountId}` : null);

            const accountDisplay = accountId
                ? `<a href="#" onclick="window.showEntityDetails('trading_account', ${accountId}); return false;" class="entity-link" style="color: ${color};">${accountName || `חשבון #${accountId}`}</a>`
                : (accountName ? `<span>${accountName}</span>` : null);

            // Calculate quantity from planned_amount and entry_price
            const plannedAmount = Number(entityData.planned_amount || 0);
            const entryPrice = Number(entityData.entry_price || 0);
            const calculatedQuantity = (entryPrice > 0 && plannedAmount > 0) ? plannedAmount / entryPrice : 0;
            const quantity = (entityData.quantity && Number(entityData.quantity) > 0) ? Number(entityData.quantity) : calculatedQuantity;

            // Render quantity and amount without positive/negative colors
            const renderQuantityNeutral = (value) => {
                if (value === null || value === undefined || Number.isNaN(Number(value)) || value === 0) {
                    return '<span class="text-muted">לא הוגדר</span>';
                }
                const num = Number(value);
                return `<span dir="ltr">${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>`;
            };

            const currencySymbol = entityData.currency_symbol ||
                entityData.account_currency_symbol ||
                entityData.trading_account?.currency_symbol ||
                '$';

            const renderAmountNeutral = (value, decimals = 2) => {
                if (value === null || value === undefined || Number.isNaN(Number(value)) || value === 0) {
                    return '<span class="text-muted">לא הוגדר</span>';
                }
                const num = Number(value || 0);
                return `<span dir="ltr">${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>`;
            };

            html += `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">צד:</label>
                    <span>${sideDisplay}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סוג השקעה:</label>
                    <span>${investmentTypeDisplay}</span>
                </div>

                ${accountDisplay ? `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">חשבון מסחר:</label>
                    ${accountDisplay}
                </div>
                ` : ''}

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך יצירה:</label>
                    <span class="text-muted">${createdAt}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך כניסה:</label>
                    <span class="text-muted">${this.formatDateTime(entityData.entry_date || entityData.created_at) || 'לא הוגדר'}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">כמות מתוכננת:</label>
                    <span>${renderQuantityNeutral(quantity)}</span>
                </div>

                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סכום מתוכנן:</label>
                    <span>${renderAmountNeutral(entityData.planned_amount, 2)}</span>
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
                                 action === 'sell' ? 'מכירה' :
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
                        ${window.FieldRendererService.renderAction(action)}
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
        } else if (entityType === 'trade') {
            const FieldRenderer = window.FieldRendererService || null;
            const color = this.entityColors.trade || (typeof window.getEntityColor === 'function' ? window.getEntityColor('trade') : '');
            
            // Side (Long/Short)
            const sideDisplay = FieldRenderer?.renderSide
                ? FieldRenderer.renderSide(entityData.side)
                : (entityData.side || 'לא זמין');
            
            // Investment Type
            const investmentTypeDisplay = FieldRenderer?.renderType
                ? FieldRenderer.renderType(entityData.investment_type || '')
                : (entityData.investment_type || 'לא זמין');
            
            // Trade Plan Link - לפני התאריכים
            const tradePlanId = entityData.trade_plan_id || null;
            const tradePlanSymbol = entityData.trade_plan_ticker_symbol ||
                                   (entityData.trade_plan && entityData.trade_plan.ticker_symbol) ||
                                   '';
            
            // Closed Date - מוצג אם יש תאריך סגירה
            const closedAtDisplay = (entityData.closed_at && entityData.closed_at !== null && entityData.closed_at !== '')
                ? this.formatDateTime(entityData.closed_at)
                : null;
            
            // Cancelled Date - מוצג רק אם הטרייד בוטל ויש תאריך ביטול
            const cancelledAtDisplay = (entityData.status === 'cancelled' && entityData.cancelled_at)
                ? this.formatDateTime(entityData.cancelled_at)
                : null;
            
            // Cancel Reason - מוצג רק אם הטרייד בוטל
            const cancelReason = (entityData.status === 'cancelled' && entityData.cancel_reason) 
                ? entityData.cancel_reason 
                : null;
            
            // Notes
            const notes = entityData.notes || null;
            
            html += `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">צד:</label>
                    <span>${sideDisplay}</span>
                </div>
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">סוג השקעה:</label>
                    <span>${investmentTypeDisplay}</span>
                </div>
                
                ${tradePlanId ? `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תכנית מסחר:</label>
                    <span>
                        <a href="#" onclick="window.showEntityDetails('trade_plan', ${tradePlanId}); return false;" class="entity-link" style="color: ${color};">
                            תכנית #${tradePlanId}${tradePlanSymbol ? ` (${tradePlanSymbol})` : ''}
                        </a>
                    </span>
                </div>
                ` : ''}
                
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך יצירה:</label>
                    <span class="text-muted">${createdAt}</span>
                </div>
                
                ${closedAtDisplay ? `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך סגירה:</label>
                    <span>${closedAtDisplay}</span>
                </div>
                ` : ''}
                
                ${cancelledAtDisplay ? `
                <div class="mb-3 d-flex align-items-center">
                    <label class="form-label fw-bold me-2 mb-0" style="min-width: 120px;">תאריך ביטול:</label>
                    <span>${cancelledAtDisplay}</span>
                </div>
                ` : ''}
                
                ${cancelReason ? `
                <div class="mb-3">
                    <label class="form-label fw-bold mb-1 d-block">סיבת ביטול:</label>
                    <p class="mb-0">${FieldRenderer?.renderTextPreview ? FieldRenderer.renderTextPreview(cancelReason, { maxLength: 500 }) : cancelReason}</p>
                </div>
                ` : ''}
                
                ${notes ? `
                <div class="mb-3">
                    <label class="form-label fw-bold mb-1 d-block">הערות:</label>
                    <p class="mb-0">${FieldRenderer?.renderTextPreview ? FieldRenderer.renderTextPreview(notes, { maxLength: 500 }) : notes}</p>
                </div>
                ` : ''}
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

        const tagsBlock = this.renderTagsDisplay(entityType, this._getEntityTags(entityData), {
            entityType,
            containerClasses: 'mb-3',
            title: 'תגיות',
            emptyMessage: 'אין תגיות משויכות'
        });
        if (tagsBlock) {
            html += tagsBlock;
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
     * Resolve entity tags from API payload without colliding with legacy fields
     * @param {Object} entityData
     * @returns {Array<Object>}
     * @private
     */
    _getEntityTags(entityData) {
        if (!entityData) {
            return [];
        }

        if (Array.isArray(entityData.tag_assignments)) {
            return entityData.tag_assignments;
        }

        if (Array.isArray(entityData.tags)) {
            return entityData.tags;
        }

        return [];
    }
    
    /**
     * Render standardized tags display with graceful fallback
     * @param {string} entityType
     * @param {Array<Object>} tags
     * @param {Object} options
     * @returns {string}
     */
    renderTagsDisplay(entityType, tags, options = {}) {
        const renderOptions = Object.assign({
            entityType: entityType || 'entity',
            containerClasses: '',
            title: 'תגיות',
            emptyMessage: 'אין תגיות משויכות',
            showTitle: true,
            includeCategory: true
        }, options || {});

        if (window.FieldRendererService?.renderTagBadges) {
            return window.FieldRendererService.renderTagBadges(tags, renderOptions) || '';
        }

        const tagItems = Array.isArray(tags) ? tags.filter(Boolean) : [];
        const tagNames = tagItems.map((tag) => {
            if (tag && typeof tag === 'object') {
                const name = tag.name || tag.display_name || tag.title || '';
                const categoryName = renderOptions.includeCategory !== false
                    ? (tag.category_name || (tag.category && tag.category.name) || '')
                    : '';
                if (categoryName && name) {
                    return `${categoryName} • ${name}`;
                }
                return name || categoryName || '';
            }
            return String(tag || '');
        }).filter((name) => Boolean(name && name.trim()));

        const titleHtml = this._escapeHtml(renderOptions.title);
        const containerClass = ['entity-tags-block', renderOptions.containerClasses].filter(Boolean).join(' ').trim();

        if (!tagNames.length) {
            if (renderOptions.showTitle === false) {
                return '';
            }
            return `
                <div class="${containerClass}">
                    <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold">${titleHtml}:</span>
                        <span class="text-muted">${this._escapeHtml(renderOptions.emptyMessage)}</span>
                    </div>
                </div>
            `;
        }

        const badges = tagNames.map((name) => `
            <span class="badge rounded-pill bg-light text-dark border me-1 mb-1">
                ${this._escapeHtml(name)}
            </span>
        `).join('');

        if (renderOptions.showTitle === false) {
            return `
                <div class="${containerClass}">
                    <div class="tag-badge-container d-flex flex-wrap gap-2">
                        ${badges}
                    </div>
                </div>
            `;
        }

        return `
            <div class="${containerClass}">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="fw-bold">${titleHtml}:</span>
                </div>
                <div class="tag-badge-container d-flex flex-wrap gap-2">
                    ${badges}
                </div>
            </div>
        `;
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
 * Save entity filter state for a specific table
 * @param {string} pageName - Page name
 * @param {string} tableId - Table ID
 * @param {string} selectedType - Selected entity type filter
 */
async function saveEntityFilterState(pageName, tableId, selectedType) {
    if (!pageName || !tableId || !selectedType) {
        return;
    }
    
    // שמירה דרך PageStateManager אם זמין
    if (window.PageStateManager && window.PageStateManager.initialized) {
        try {
            const currentState = await window.PageStateManager.loadEntityFilters(pageName);
            currentState[tableId] = selectedType;
            await window.PageStateManager.saveEntityFilters(pageName, currentState);
            if (window.Logger) {
                window.Logger.debug(`💾 Saved entity filter state via PageStateManager: ${tableId} = "${selectedType}"`, { page: "entity-details-renderer" });
            }
        } catch (err) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Failed to save entity filter state via PageStateManager, using localStorage fallback', err, { page: "entity-details-renderer" });
            }
            // Fallback ל-localStorage
            const key = `entityFilter_${pageName}_${tableId}`;
            localStorage.setItem(key, selectedType);
        }
    } else {
        // Fallback ל-localStorage רק אם PageStateManager לא זמין
        const key = `entityFilter_${pageName}_${tableId}`;
        localStorage.setItem(key, selectedType);
    }
}

/**
 * Load entity filter state for a specific table
 * @param {string} pageName - Page name
 * @param {string} tableId - Table ID
 * @returns {Promise<string|null>} Selected entity type or null if not found
 */
async function loadEntityFilterState(pageName, tableId) {
    if (!pageName || !tableId) {
        return null;
    }
    
    // טעינה דרך PageStateManager אם זמין
    if (window.PageStateManager && window.PageStateManager.initialized) {
        try {
            const entityFilters = await window.PageStateManager.loadEntityFilters(pageName);
            if (entityFilters && entityFilters.hasOwnProperty(tableId)) {
                if (window.Logger) {
                    window.Logger.debug(`💾 Loaded entity filter state via PageStateManager: ${tableId} = "${entityFilters[tableId]}"`, { page: "entity-details-renderer" });
                }
                return entityFilters[tableId];
            }
        } catch (err) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Failed to load entity filter state via PageStateManager, trying localStorage fallback', err, { page: "entity-details-renderer" });
            }
        }
    }
    
    // Fallback ל-localStorage רק אם PageStateManager לא זמין או אין מצב שמור
    const key = `entityFilter_${pageName}_${tableId}`;
    return localStorage.getItem(key);
}

/**
 * Filter linked items table by entity type
 * @param {string} tableId - Table ID
 * @param {string} type - Entity type to filter by ('all' to show all)
 */
window.filterLinkedItemsByType = async function(tableId, type) {
    if (!tableId || !type) {
        console.warn('[filterLinkedItemsByType] Missing parameters:', { tableId, type });
        return;
    }
    
    // שמירת מצב פילטר
    const pageName = (typeof window.getCurrentPageName === 'function') ? window.getCurrentPageName() : 'default';
    await saveEntityFilterState(pageName, tableId, type);
    
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
    
    const registry = window.TableDataRegistry;
    const resolvedTableType = registry?.resolveTableType?.(tableId) || tableId;
    const fullData = registry
        ? registry.getFullData(resolvedTableType, { asReference: true })
        : (window.linkedItemsTableData?.[tableId] || []);

    const effectiveType = typeof type === 'string' ? type.trim() : 'all';
    const filterPayload =
        effectiveType === 'all'
            ? { custom: { relatedType: 'all' } }
            : { custom: { relatedType: effectiveType } };

    let filteredItems = [];
    let appliedViaUnified = false;
    const canUseUnifiedFilter = Boolean(window.UnifiedTableSystem?.filter?.apply) && Boolean(resolvedTableType);

    if (canUseUnifiedFilter) {
        try {
            filteredItems =
                window.UnifiedTableSystem.filter.apply(resolvedTableType, filterPayload, undefined, {
                    mergeWithActiveFilters: false,
                    tableIdOverride: tableId,
                }) || [];
            appliedViaUnified = true;
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('[filterLinkedItemsByType] unified filter failed, falling back to legacy mode', {
                    tableId,
                    tableType: resolvedTableType,
                    error: error?.message || error,
                    page: 'entity-details-renderer',
                });
            } else {
                console.warn('[filterLinkedItemsByType] unified filter failed, fallback to legacy mode', error);
            }
            filteredItems = legacyFilterLinkedItems(effectiveType, fullData);
        }
    } else {
        filteredItems = legacyFilterLinkedItems(effectiveType, fullData);
    }

    if (!appliedViaUnified && registry && resolvedTableType) {
        const filterContext =
            effectiveType === 'all'
                ? {
                    status: [],
                    type: [],
                    account: [],
                    search: '',
                    dateRange: null,
                    custom: {},
                }
                : {
                    status: [],
                    type: [],
                    account: [],
                    search: '',
                    dateRange: null,
                    custom: { relatedType: effectiveType },
                };

        registry.setFilteredData(resolvedTableType, Array.isArray(filteredItems) ? filteredItems : [], {
            tableId,
            skipPageReset: false,
            filterContext,
            clearFilters: effectiveType === 'all',
        });
    }

    if (window.entityDetailsRenderer && typeof window.entityDetailsRenderer.updateLinkedItemsTableBody === 'function') {
        window.entityDetailsRenderer.updateLinkedItemsTableBody(tableId, Array.isArray(filteredItems) ? filteredItems : []);
    } else {
        console.warn('[filterLinkedItemsByType] EntityDetailsRenderer.updateLinkedItemsTableBody not available');
    }
};

/**
 * Legacy fallback filter for linked items when unified pipeline is unavailable
 * @param {string} type - Requested entity type (or 'all')
 * @param {Array} data - Linked items dataset
 * @returns {Array} Filtered dataset
 */
function legacyFilterLinkedItems(type, data) {
    const sourceArray = Array.isArray(data) ? data : [];
    if (!Array.isArray(sourceArray) || sourceArray.length === 0 || type === 'all') {
        return [...sourceArray];
    }

    const normalized = String(type || '').toLowerCase();
    const normalizedCanonical = (() => {
        if (normalized === 'account') {
            return 'trading_account';
        }
        if (normalized === 'plan') {
            return 'trade_plan';
        }
        return normalized;
    })();

    return sourceArray.filter((item) => {
        if (!item || typeof item !== 'object') {
            return false;
        }
        const itemType = String(
            item.type ||
            item.related_type ||
            item.relatedType ||
            item.related_object_type ||
            ''
        ).toLowerCase();

        if (!itemType) {
            return false;
        }

        if (itemType === normalizedCanonical) {
            return true;
        }

        if (normalizedCanonical === 'trading_account' && (itemType === 'account' || itemType === 'trading_account')) {
            return true;
        }

        if (normalizedCanonical === 'trade_plan' && itemType === 'plan') {
            return true;
        }

        return false;
    });
}

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize EntityDetailsRenderer - אתחול אוטומטי של EntityDetailsRenderer
 */
try {
    // אתחול מערכת Renderer והצמדה ל-window בצורה מאובטחת
    window.EntityDetailsRenderer = window.EntityDetailsRenderer || EntityDetailsRenderer;

    if (!window.entityDetailsRenderer || !(window.entityDetailsRenderer instanceof window.EntityDetailsRenderer)) {
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