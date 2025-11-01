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
        
        // אתחול async (לא-בלוקינג)
        this.init().catch(error => {
            window.Logger.error('❌ EntityDetailsRenderer initialization failed:', error, { page: "entity-details-renderer" });
        });
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
     * Main render function - פונקציית רנדור ראשית
     * 
     * @param {string} entityType - סוג הישות
     * @param {Object} entityData - נתוני הישות
     * @param {Object} options - אפשרויות רנדור
     * @returns {string} - HTML מרונדר
     * @public
     */
    render(entityType, entityData, options = {}) {
        try {
            if (!entityType || !entityData) {
                return this.renderError('חסרים נתוני ישות');
            }

            if (window.Logger) {
                window.Logger.info('✅ [1.4 EntityDetailsRenderer.render] Called with options.sourceInfo', {
                    entityType: entityType,
                    hasOptions: !!options,
                    hasSourceInfo: !!options?.sourceInfo,
                    sourceInfo: options?.sourceInfo,
                    sourceInfoString: options?.sourceInfo ? JSON.stringify(options.sourceInfo) : null,
                    allOptions: options,
                    page: "entity-details-renderer"
                });
            }

            // בחירת פונקציית רנדור לפי סוג הישות
            switch (entityType) {
                case 'ticker':
                    return this.renderTicker(entityData, options);
                case 'trade':
                    return this.renderTrade(entityData, options);
                case 'trade_plan':
                    return this.renderTradePlan(entityData, options);
                case 'execution':
                    return this.renderExecution(entityData, options);
                case 'account':
                    return this.renderAccount(entityData, options);
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
        window.Logger.info(`🎨 Rendering ticker data:`, tickerData, { page: "entity-details-renderer" });
        
        // קבלת צבע הטיקר מההעדפות
        const tickerColor = this.entityColors.ticker || '#019193';
        
        return `
            <div class="entity-details-container ticker-details">
                
                <!-- נתוני שוק למעלה -->
                <div class="mb-4">
                    ${this.renderMarketData(tickerData, tickerColor)}
                </div>
                
                <!-- מידע בסיסי בשתי עמודות -->
                <div class="row">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(tickerData, 'ticker', tickerColor)}
                    </div>
                    <div class="col-md-6">
                        ${this.renderAdditionalInfo(tickerData, 'ticker', tickerColor)}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(tickerData.linked_items || [], tickerColor, 'ticker', tickerData.id, options?.sourceInfo || null)}
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
        
        // סטטוס למעלה - שימוש במערכת הרינדור הכללית
        const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
            ? window.FieldRendererService.renderStatus(tradeData.status, 'trade')
            : '';
        
        return `
            <div class="entity-details-container trade-details">
                
                <!-- סטטוס למעלה -->
                ${statusDisplay ? `<div class="mb-3 d-flex justify-content-start align-items-center gap-2">
                    <strong>סטטוס:</strong>
                    ${statusDisplay}
                </div>` : ''}
                
                <div class="row">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(tradeData, 'trade')}
                    </div>
                    <div class="col-md-6">
                        ${this.renderTradeSpecific(tradeData)}
                    </div>
                </div>
                
                <div class="row mt-4">
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
                            return this.renderLinkedItems(tradeData.linked_items || [], this.entityColors.trade || '#007bff', 'trade', tradeData.id, options?.sourceInfo || null);
                        })()}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderActionButtons('trade', tradeData.id)}
                    </div>
                </div>
            </div>
        `;
    }

    // ===== HELPER FUNCTIONS =====

    /**
     * Get entity icon - קבלת אייקון לסוג ישות
     * 
     * @param {string} entityType - סוג ישות
     * @returns {string} - נתיב לאייקון SVG
     * @private
     */
    getEntityIcon(entityType) {
        const iconMappings = {
            ticker: '/trading-ui/images/icons/tickers.svg',
            trade: '/trading-ui/images/icons/trades.svg',
            trade_plan: '/trading-ui/images/icons/trade_plans.svg',
            execution: '/trading-ui/images/icons/executions.svg',
            account: '/trading-ui/images/icons/trading_accounts.svg',
            alert: '/trading-ui/images/icons/alerts.svg',
            cash_flow: '/trading-ui/images/icons/cash_flows.svg',
            note: '/trading-ui/images/icons/notes.svg'
        };

        return iconMappings[entityType] || '/trading-ui/images/icons/home.svg';
    }

    /**
     * Convert hex color to light background color - המרת צבע hex לרקע בהיר
     * 
     * @param {string} hex - צבע hex
     * @returns {string} - צבע רקע בהיר כ-RGBA
     * @private
     */
    _hexToLightBg(hex) {
        // הסרת # אם קיים
        hex = hex.replace('#', '');
        
        // המרה ל-RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // החזרת RGBA עם alpha נמוך לרקע בהיר
        return `rgba(${r}, ${g}, ${b}, 0.15)`;
    }


    /**
     * Render basic info - רנדור מידע בסיסי
     */
    renderBasicInfo(entityData, entityType, entityColor = '#019193') {
        const fields = this.getBasicFields(entityType);
        
        // Debug logging for trade_plan
        if (entityType === 'trade_plan') {
            console.log('🔍🔍🔍 [renderBasicInfo] trade_plan entityData:', {
                ticker_symbol: entityData.ticker_symbol,
                ticker_id: entityData.ticker_id,
                hasTickerObject: !!entityData.ticker,
                tickerObject: entityData.ticker,
                allKeys: Object.keys(entityData),
                entityDataSnapshot: JSON.parse(JSON.stringify(entityData)) // Deep copy for inspection
            });
        }
        
        // חלוקת השדות לשתי עמודות
        const fieldsPerColumn = Math.ceil(fields.length / 2);
        const firstColumnFields = fields.slice(0, fieldsPerColumn);
        
        let html = `
            <div class="entity-basic-info">
        `;
        
        firstColumnFields.forEach(field => {
            const value = entityData[field.key];
            const displayValue = this.formatFieldValue(value, field.type, entityColor, field.key, entityData, field);
            
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">${field.label}:</div>
                    <div class="col-7">${displayValue}</div>
                </div>
            `;
        });
        
        html += `
            </div>
        `;
        return html;
    }

    /**
     * Render additional info - רנדור מידע נוסף (עמודה שנייה)
     */
    renderAdditionalInfo(entityData, entityType, entityColor = '#019193') {
        const fields = this.getBasicFields(entityType);
        // חלוקת השדות לשתי עמודות
        const fieldsPerColumn = Math.ceil(fields.length / 2);
        const secondColumnFields = fields.slice(fieldsPerColumn);
        
        if (secondColumnFields.length === 0) {
            return '<div class="entity-additional-info"></div>';
        }
        
        let html = `
            <div class="entity-additional-info">
        `;
        
        secondColumnFields.forEach(field => {
            const value = entityData[field.key];
            const displayValue = this.formatFieldValue(value, field.type, entityColor, field.key, entityData, field);
            
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">${field.label}:</div>
                    <div class="col-7">${displayValue}</div>
                </div>
            `;
        });
        
        html += `
            </div>
        `;
        return html;
    }

    /**
     * Render market data - רנדור נתוני שוק
     */
    renderMarketData(tickerData, entityColor = '#019193') {
        window.Logger.info(`📈 Rendering market data for:`, tickerData, { page: "entity-details-renderer" });
        // בדיקה אם יש נתונים חיצוניים
        const hasExternalData = tickerData.current_price || tickerData.change_percent || tickerData.volume || tickerData.yahoo_updated_at;
        window.Logger.info(`📈 Has external data:`, hasExternalData, { page: "entity-details-renderer" });
        
        if (!hasExternalData) {
            return `
                <div class="entity-market-data">
                    <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${entityColor} !important;">נתוני שוק</h6>
                    <div class="text-muted text-center py-4">
                        <i class="fas fa-chart-line fa-2x mb-3"></i>
                        <p>נתוני שוק לא זמינים</p>
                        <small>התחבר לאינטרנט לצפייה בנתונים עדכניים</small>
                    </div>
                </div>
            `;
        }

        // הצגת נתוני שוק זמינים
        let html = `
            <div class="entity-market-data">
                <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${entityColor} !important;">נתוני שוק</h6>
                <div class="row">
                    <div class="col-md-6">
        `;

        // עמודה ראשונה - מחיר ושינויים
        if (tickerData.current_price) {
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">מחיר נוכחי:</div>
                    <div class="col-7 fw-bold">${this.formatPrice(tickerData.current_price)}</div>
                </div>
            `;
        }

        if (tickerData.change_percent !== null && tickerData.change_percent !== undefined) {
            const changeClass = tickerData.change_percent >= 0 ? 'text-success' : 'text-danger';
            const changeSign = tickerData.change_percent >= 0 ? '+' : '';
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">שינוי %:</div>
                    <div class="col-7 ${changeClass} fw-bold">${changeSign}${tickerData.change_percent.toFixed(2)}%</div>
                </div>
            `;
        }

        if (tickerData.change_amount !== null && tickerData.change_amount !== undefined) {
            const changeClass = tickerData.change_amount >= 0 ? 'text-success' : 'text-danger';
            const changeSign = tickerData.change_amount >= 0 ? '+' : '';
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">שינוי $:</div>
                    <div class="col-7 ${changeClass} fw-bold">${changeSign}$${tickerData.change_amount.toFixed(2)}</div>
                </div>
            `;
        }

        html += `
                    </div>
                    <div class="col-md-6">
        `;

        // עמודה שנייה - נפח ועדכון
        if (tickerData.volume) {
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">נפח מסחר:</div>
                    <div class="col-7">${parseInt(tickerData.volume).toLocaleString('he-IL')}</div>
                </div>
            `;
        }

        if (tickerData.yahoo_updated_at) {
            const updateTime = new Date(tickerData.yahoo_updated_at).toLocaleString('he-IL');
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">עדכון נתונים:</div>
                    <div class="col-7 text-info">${updateTime}</div>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
            </div>
        `;
        return html;
    }

    /**
     * Format market status - עיצוב מצב שוק
     */
    formatMarketStatus(status) {
        const statusMappings = {
            open: { text: 'פתוח', class: 'bg-success' },
            closed: { text: 'סגור', class: 'bg-secondary' }, 
            unknown: { text: 'לא ידוע', class: 'bg-warning' }
        };
        
        const statusInfo = statusMappings[status] || { text: status, class: 'bg-secondary' };
        return `<span class="badge ${statusInfo.class} ms-2">${statusInfo.text}</span>`;
    }

    /**
     * Format volume - עיצוב נפח מסחר
     */
    formatVolume(volume) {
        if (!volume && volume !== 0) return 'לא זמין';
        
        const numVolume = parseFloat(volume);
        if (isNaN(numVolume)) return String(volume);
        
        // המרה לקיצור (K, M, B)
        if (numVolume >= 1000000000) {
            return `${(numVolume / 1000000000).toFixed(1)}B`;
        } else if (numVolume >= 1000000) {
            return `${(numVolume / 1000000).toFixed(1)}M`;
        } else if (numVolume >= 1000) {
            return `${(numVolume / 1000).toFixed(1)}K`;
        } else {
            return numVolume.toLocaleString('en-US');
        }
    }

    /**
     * Format data source - עיצוב מקור נתונים
     */
    formatDataSource(source) {
        const sourceMappings = {
            yahoo_finance: 'Yahoo Finance',
            alpha_vantage: 'Alpha Vantage',
            google_finance: 'Google Finance',
            iex_cloud: 'IEX Cloud'
        };
        
        return sourceMappings[source] || source;
    }

    /**
     * Format price change - עיצוב שינוי מחיר
     */
    formatPriceChange(change, changePercent) {
        if ((!change && change !== 0) || (!changePercent && changePercent !== 0)) {
            return 'לא זמין';
        }
        
        const numChange = parseFloat(change);
        const numPercent = parseFloat(changePercent);
        
        if (isNaN(numChange) || isNaN(numPercent)) {
            return 'לא זמין';
        }
        
        const color = numChange >= 0 ? 'text-success' : 'text-danger';
        const sign = numChange >= 0 ? '+' : '';
        
        return `<span class="${color}">${sign}${this.formatPrice(numChange)} (${sign}${numPercent.toFixed(2)}%)</span>`;
    }

    /**
     * Render action buttons - רנדור כפתורי פעולה
     */
    renderActionButtons(entityType, entityId) {
        return `
            <div class="entity-action-buttons border-top pt-3">
                <h6 class="mb-3">פעולות מהירות</h6>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-primary btn-sm" onclick="window.editTicker(${entityId})">
                        <i class="fas fa-edit me-1"></i>עריכה
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="window.entityDetailsModal.showLinkedItems('${entityType}', ${entityId})">
                        <i class="fas fa-link me-1"></i>פריטים מקושרים
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="window.entityDetailsModal.exportEntity('${entityType}', ${entityId})">
                        <i class="fas fa-download me-1"></i>ייצוא
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render linked items - רנדור פריטים מקושרים
     * 
     * מעודכן להשתמש ב-LinkedItemsService ללוגיקה משותפת
     */
    renderLinkedItems(linkedItems, entityColor = '#019193', entityType = null, entityId = null, sourceInfo = null) {
        // בדיקת LinkedItemsService פעם אחת בתחילת הפונקציה
        if (!window.LinkedItemsService || !window.LinkedItemsService.generateLinkedItemActions) {
            // הצגת הודעה אחת בלבד בפעם הראשונה
            if (!window._linkedItemsServiceErrorShown) {
                window._linkedItemsServiceErrorShown = true;
                
                if (window.showErrorNotification) {
                    window.showErrorNotification(
                        'שגיאה במערכת',
                        'מערכת LinkedItemsService לא זמינה. הפריטים המקושרים לא יוצגו. נא לרענן את הדף או ליצור קשר עם התמיכה הטכנית.'
                    );
                }
                
                if (window.Logger) {
                    window.Logger.error('❌ LinkedItemsService not available - linked items will not be displayed', {
                        hasLinkedItemsService: !!window.LinkedItemsService,
                        hasGenerateMethod: !!(window.LinkedItemsService && window.LinkedItemsService.generateLinkedItemActions),
                        page: "entity-details-renderer"
                    });
                }
            }
            
            // החזרת HTML עם הודעה במקום פריטים מקושרים
            return `
                <div class="entity-linked-items">
                    <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${entityColor} !important;">פריטים מקושרים</h6>
                    <div class="text-danger text-center py-4">
                        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                        <p class="mb-2"><strong>מערכת LinkedItemsService לא זמינה</strong></p>
                        <p class="small text-muted">נא לרענן את הדף או ליצור קשר עם התמיכה הטכנית</p>
                    </div>
                </div>
            `;
        }
        
        console.log('🔗🔗🔗 [renderLinkedItems] CALLED', {
            entityType: entityType,
            entityId: entityId,
            hasSourceInfo: !!sourceInfo,
            sourceInfo: sourceInfo,
            sourceInfoString: sourceInfo ? JSON.stringify(sourceInfo) : null,
            linkedItemsLength: linkedItems?.length || 0,
            isArray: Array.isArray(linkedItems)
        });
        
        if (window.Logger) {
            window.Logger.info('✅ [1.6 renderLinkedItems] Called with sourceInfo parameter', {
                entityType: entityType,
                entityId: entityId,
                hasSourceInfo: !!sourceInfo,
                sourceInfo: sourceInfo,
                sourceInfoString: sourceInfo ? JSON.stringify(sourceInfo) : null,
                linkedItemsLength: linkedItems?.length || 0,
                isArray: Array.isArray(linkedItems),
                page: "entity-details-renderer"
            });
        }
        
        // בדיקה אם יש פריטים מקושרים
        const hasLinkedItems = linkedItems && Array.isArray(linkedItems) && linkedItems.length > 0;
        window.Logger.info(`🔗 Has linked items: ${hasLinkedItems}`, {
            linkedItems,
            hasLinkedItems,
            page: "entity-details-renderer"
        });
        
        // אם אין פריטים - שימוש ב-LinkedItemsService
        if (!hasLinkedItems) {
            // ניסיון לקבל entityType ו-entityId מה-context אם לא סופקו
            const currentEntityType = entityType || window.currentEntityType || 'ticker';
            const currentEntityId = entityId || window.currentEntityId || 'null';
            
            if (window.LinkedItemsService && window.LinkedItemsService.renderEmptyLinkedItems) {
                return window.LinkedItemsService.renderEmptyLinkedItems(currentEntityType, currentEntityId, entityColor);
            }
            
            // Fallback אם Service לא זמין
            return `
                <div class="entity-linked-items">
                    <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${entityColor} !important;">פריטים מקושרים</h6>
                    <div class="text-muted text-center py-4">
                        <i class="fas fa-link fa-2x mb-3"></i>
                        <p>אין פריטים מקושרים</p>
                        <button class="btn btn-outline-primary btn-sm mt-2" onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], '${currentEntityType}', ${currentEntityId})">
                            <i class="fas fa-search me-1"></i>חפש פריטים מקושרים
                        </button>
                    </div>
                </div>
            `;
        }

        // מיון הפריטים המקושרים באמצעות LinkedItemsService
        const sortedItems = (window.LinkedItemsService && window.LinkedItemsService.sortLinkedItems)
            ? window.LinkedItemsService.sortLinkedItems(linkedItems)
            : linkedItems; // Fallback אם Service לא זמין

        // יצירת טבלה מינימלית של פריטים מקושרים
        let html = `
            <div class="entity-linked-items">
                <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${entityColor} !important;">פריטים מקושרים (${sortedItems.length})</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-hover entity-linked-items-table">
                        <thead style="background-color: ${entityColor}50 !important;">
                            <tr>
                                <th style="width: 25%;">סוג</th>
                                <th style="width: 35%;">שם</th>
                                <th style="width: 15%; text-align: center;">סטטוס</th>
                                <th style="width: 25%; text-align: center;">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        sortedItems.forEach(item => {
            // עמודה "סוג" - איקון + שם הישות (strong) - שימוש ב-LinkedItemsService
            const iconPath = (window.LinkedItemsService && window.LinkedItemsService.getLinkedItemIcon)
                ? window.LinkedItemsService.getLinkedItemIcon(item.type)
                : this.getEntityIcon(item.type); // Fallback
            
            const itemEntityColor = (window.LinkedItemsService && window.LinkedItemsService.getLinkedItemColor)
                ? window.LinkedItemsService.getLinkedItemColor(item.type, { entityColors: this.entityColors })
                : (this.entityColors[item.type] || '#6c757d'); // Fallback
            
            // שם הישות בעברית - שימוש ב-LinkedItemsService
            const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel)
                ? window.LinkedItemsService.getEntityLabel(item.type)
                : ((window.getEntityLabel && typeof window.getEntityLabel === 'function')
                    ? window.getEntityLabel(item.type)
                    : item.type); // Fallback
            
            // צביעת האיקון בצבע הישות באמצעות CSS mask - איקון כפול בגודל (48px)
            const typeDisplay = `
                <span class="d-inline-flex align-items-center gap-2">
                    <img src="${iconPath}" alt="${item.type}" class="linked-item-type-icon" style="width: 48px; height: 48px; mask-image: url('${iconPath}'); mask-repeat: no-repeat; mask-position: center; mask-size: contain; -webkit-mask-image: url('${iconPath}'); -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; -webkit-mask-size: contain; background-color: ${itemEntityColor}; display: inline-block;" />
                    <strong>${entityLabel}</strong>
                </span>
            `;
            
            // עמודה "שם" - שם נקי עם תאריך - שימוש ב-LinkedItemsService
            const cleanName = (window.LinkedItemsService && window.LinkedItemsService.formatLinkedItemName)
                ? window.LinkedItemsService.formatLinkedItemName(item)
                : this.getCleanEntityName(item); // Fallback
            
            const itemDate = this.formatDateTime(item.created_at || item.updated_at);
            // שורה אחת בלבד: שם + תאריך
            const nameDisplay = `${cleanName}${itemDate ? ` - ${itemDate}` : ''}`;
            
            // עמודה "סטטוס" - שימוש במערכת הרינדור המרכזית - מיושר למרכז עם רווח
            const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
                ? window.FieldRendererService.renderStatus(item.status, item.type)
                : this.getStatusBadge(item.status);
            
            // עמודה "פעולות" - שימוש ב-LinkedItemsService ליצירת כפתורים
            // העברת מידע על המקור (entity-details modal) ל-LinkedItemsService
            // אם sourceInfo לא סופק (null), ניצור אחד מהמידע הנוכחי (fallback)
            const itemSourceInfo = sourceInfo || {
                sourceModal: 'entity-details',
                sourceType: entityType || this.currentEntityType,
                sourceId: entityId || this.currentEntityId
            };
            
            if (window.Logger) {
                window.Logger.info('✅ [1.7 renderLinkedItems] itemSourceInfo created', {
                    itemType: item.type,
                    itemId: item.id,
                    sourceInfoParameter: sourceInfo,
                    sourceInfoParameterString: sourceInfo ? JSON.stringify(sourceInfo) : null,
                    itemSourceInfo: itemSourceInfo,
                    itemSourceInfoString: JSON.stringify(itemSourceInfo),
                    isFallback: !sourceInfo,
                    sourceInfoProvided: !!sourceInfo,
                    entityType: entityType || this.currentEntityType,
                    entityId: entityId || this.currentEntityId,
                    page: "entity-details-renderer"
                });
            }
            
            // לוג לפני קריאה ל-LinkedItemsService
            if (window.Logger) {
                window.Logger.info('🔗 [EntityDetailsRenderer] About to call LinkedItemsService.generateLinkedItemActions', {
                    itemType: item.type,
                    itemId: item.id,
                    hasItemSourceInfo: !!itemSourceInfo,
                    itemSourceInfo: itemSourceInfo,
                    sourceInfoProvided: !!sourceInfo,
                    page: "entity-details-renderer"
                });
            }
            
            console.log('🔗🔗🔗 [renderLinkedItems] About to call LinkedItemsService.generateLinkedItemActions', {
                itemType: item.type,
                itemId: item.id,
                itemSourceInfo: itemSourceInfo,
                itemSourceInfoString: JSON.stringify(itemSourceInfo),
                hasLinkedItemsService: !!(window.LinkedItemsService && window.LinkedItemsService.generateLinkedItemActions)
            });
            
            if (window.Logger) {
                window.Logger.info('✅ [1.8 renderLinkedItems] Calling LinkedItemsService.generateLinkedItemActions', {
                    itemType: item.type,
                    itemId: item.id,
                    itemSourceInfo: itemSourceInfo,
                    itemSourceInfoString: JSON.stringify(itemSourceInfo),
                    optionsSourceInfo: itemSourceInfo,
                    page: "entity-details-renderer"
                });
            }
            
            // LinkedItemsService כבר נבדק בתחילת הפונקציה - אם לא זמין, הפונקציה חזרה מוקדם
            // כאן אנחנו בטוחים שהוא זמין
            
            // LinkedItemsService זמין - שימוש רגיל
            const actionsHtml = window.LinkedItemsService.generateLinkedItemActions(item, 'table', { 
                entityColors: this.entityColors,
                sourceInfo: itemSourceInfo
            });
            
            console.log('🔗🔗🔗 [renderLinkedItems] After calling LinkedItemsService - actionsHtml:', {
                actionsHtmlLength: actionsHtml?.length || 0,
                actionsHtmlPreview: actionsHtml?.substring(0, 300) || '',
                hasSourceInHtml: actionsHtml?.includes('source') || false
            });
            
            // לוג אחרי הקריאה
            if (window.Logger) {
                window.Logger.info('✅ [1.12 renderLinkedItems] actionsHtml created', {
                    itemType: item.type,
                    itemId: item.id,
                    actionsHtmlLength: actionsHtml?.length || 0,
                    actionsHtmlPreview: actionsHtml?.substring(0, 500) || '',
                    actionsHtmlFull: actionsHtml,
                    page: "entity-details-renderer"
                });
            }
            
            html += `
                <tr>
                    <td>${typeDisplay}</td>
                    <td>${nameDisplay}</td>
                    <td style="text-align: center; padding-inline-end: 1rem;">${statusDisplay}</td>
                    <td style="text-align: center;">${actionsHtml}</td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        return html;
    }
    
    /**
     * Fallback method for generating linked item actions if LinkedItemsService is not available
     * 
     * @private
     * @param {Object} item - פריט מקושר
     * @returns {string} - HTML של כפתורים
     */
    _generateLinkedItemActionsFallback(item, sourceInfo = null) {
        console.log('⚠️⚠️⚠️ [Fallback] _generateLinkedItemActionsFallback called', {
            itemType: item.type,
            itemId: item.id,
            hasSourceInfo: !!sourceInfo,
            sourceInfo: sourceInfo,
            sourceInfoString: sourceInfo ? JSON.stringify(sourceInfo) : null
        });
        
        let actionsHtml = '<div class="btn-group btn-group-sm linked-items-actions" role="group">';
        
        // יצירת viewOptions עם sourceInfo
        let viewOptions = { mode: 'view', includeLinkedItems: true };
        if (sourceInfo) {
            viewOptions.source = sourceInfo;
            console.log('✅✅✅ [Fallback] sourceInfo added to viewOptions', {
                sourceInfo: sourceInfo,
                viewOptions: viewOptions
            });
        }
        
        // בניית מחרוזת JavaScript object literal
        const buildObjectLiteral = (obj) => {
            if (obj === null) return 'null';
            if (obj === undefined) return 'undefined';
            if (typeof obj === 'string') return `'${obj.replace(/'/g, "\\'")}'`;
            if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
            if (Array.isArray(obj)) {
                return `[${obj.map(buildObjectLiteral).join(', ')}]`;
            }
            const entries = Object.entries(obj).map(([key, value]) => {
                const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key.replace(/'/g, "\\'")}'`;
                return `${safeKey}: ${buildObjectLiteral(value)}`;
            });
            return `{${entries.join(', ')}}`;
        };
        
        const viewOptionsStr = buildObjectLiteral(viewOptions);
        console.log('🔧🔧🔧 [Fallback] viewOptionsStr generated', {
            viewOptions: viewOptions,
            viewOptionsStr: viewOptionsStr,
            hasSourceInStr: viewOptionsStr.includes('source')
        });
        
        // כפתור VIEW - עם sourceInfo
        const onclickCode = `window.showEntityDetails('${item.type}', ${item.id}, ${viewOptionsStr})`;
        const escapedOnclick = onclickCode.replace(/"/g, '&quot;');
        console.log('✅✅✅ [Fallback] onclickCode created', {
            onclickCode: onclickCode,
            escapedOnclick: escapedOnclick,
            hasSourceInCode: onclickCode.includes('source')
        });
        
        actionsHtml += `<button data-button-type="VIEW" data-variant="small" data-onclick="${escapedOnclick}" data-text="" title="צפה בפרטים"></button>`;
        
        // כפתור LINK
        const linkFunction = this.getLinkedItemsFunctionForType(item.type, item.id);
        if (linkFunction) {
            actionsHtml += `<button data-button-type="LINK" data-variant="small" data-onclick="${linkFunction}" data-text="" title="פריטים מקושרים"></button>`;
        }
        
        // כפתור EDIT
        const editFunction = this.getEditFunctionForType(item.type, item.id);
        if (editFunction) {
            actionsHtml += `<button data-button-type="EDIT" data-variant="small" data-onclick="${editFunction}" data-text="" title="ערוך"></button>`;
        }
        
        // כפתור CANCEL/REACTIVATE או DELETE
        const cancelFunction = this.getCancelFunctionForType(item.type, item.id, item.status);
        if (cancelFunction) {
            const cancelType = item.status === 'cancelled' || item.status === 'canceled' ? 'REACTIVATE' : 'CANCEL';
            const cancelTitle = item.status === 'cancelled' || item.status === 'canceled' ? 'הפעל מחדש' : 'בטל';
            actionsHtml += `<button data-button-type="${cancelType}" data-variant="small" data-onclick="${cancelFunction}" data-text="" title="${cancelTitle}"></button>`;
        } else {
            const deleteFunction = this.getDeleteFunctionForType(item.type, item.id);
            if (deleteFunction) {
                actionsHtml += `<button data-button-type="DELETE" data-variant="small" data-onclick="${deleteFunction}" data-text="" title="מחק"></button>`;
            }
        }
        
        actionsHtml += '</div>';
        return actionsHtml;
    }

    // Helper methods
    getStatusBadge(status) {
        const statusMap = {
            'open': { text: 'פתוח' },
            'closed': { text: 'סגור' },
            'cancelled': { text: 'מבוטל' }
        };
        
        const statusInfo = statusMap[status] || { text: status || 'לא ידוע' };
        
        // קבלת צבע הסטטוס
        let statusColor = '#6c757d'; // ברירת מחדל
        
        if (window.getStatusColor) {
            statusColor = window.getStatusColor(status);
        } else {
            // fallback לצבעים בסיסיים
            const statusColors = {
                'open': '#28a745',
                'closed': '#6c757d', 
                'cancelled': '#dc3545'
            };
            statusColor = statusColors[status] || '#6c757d';
        }
        
        // המרת hex ל-rgba עם 0.3 שקיפות
        const rgb = this.hexToRgb(statusColor);
        const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(108, 117, 125, 0.3)';
        
        return `<span class="badge" style="color: black; background-color: ${bgColor}; border: 1px solid ${statusColor}; border-radius: 0.375rem; padding: 0.25rem 0.5rem;">${statusInfo.text}</span>`;
    }

    getTypeBadge(type, color) {
        // מיפוי סוגי ישויות לטיפוסי השקעה בטבלאות הראשיות
        const typeMapping = {
            'trade': { 
                text: 'טרייד', 
                icon: 'fas fa-exchange-alt',
                investmentType: 'swing' // טרייד = swing trading
            },
            'trade_plan': { 
                text: 'תכנון', 
                icon: 'fas fa-clipboard-list',
                investmentType: 'investment' // תכנון = השקעה ארוכת טווח
            },
            'execution': { 
                text: 'ביצוע', 
                icon: 'fas fa-handshake',
                investmentType: 'swing'
            },
            'account': { 
                text: 'חשבון מסחר', 
                icon: 'fas fa-university',
                investmentType: 'investment'
            },
            'alert': { 
                text: 'התראה', 
                icon: 'fas fa-bell',
                investmentType: 'passive'
            },
            'cash_flow': { 
                text: 'תזרים', 
                icon: 'fas fa-money-bill-wave',
                investmentType: 'passive'
            },
            'note': { 
                text: 'הערה', 
                icon: 'fas fa-sticky-note',
                investmentType: 'passive'
            },
            'ticker': { 
                text: 'טיקר', 
                icon: 'fas fa-chart-line',
                investmentType: 'swing'
            }
        };
        
        const typeInfo = typeMapping[type] || { 
            text: type || 'לא ידוע', 
            icon: 'fas fa-question',
            investmentType: 'other'
        };
        
        // קבלת צבע מהמערכת הגלובלית כמו בטבלאות הראשיות
        let typeColor = color;
        if (window.getInvestmentTypeColor) {
            typeColor = window.getInvestmentTypeColor(typeInfo.investmentType);
        } else if (window.getEntityColor) {
            typeColor = window.getEntityColor(type);
        }
        
        // קבלת מחלקת CSS כמו בטבלאות הראשיות
        const typeClass = this.getTypeClass(typeInfo.investmentType);
        
        return `
            <span class="type-badge ${typeClass}" style="background-color: ${typeColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.85em; font-weight: 500;">
                <i class="${typeInfo.icon} me-1"></i>${typeInfo.text}
            </span>
        `;
    }
    
    /**
     * Get CSS class for investment type - כמו בטבלאות הראשיות
     */
    getTypeClass(type) {
        if (type === null || type === undefined) {
            return 'type-other';
        }
        
        switch (type) {
            case 'swing': return 'type-swing';
            case 'investment': return 'type-investment';
            case 'passive': return 'type-passive';
            default: return 'type-other';
        }
    }

    /**
     * Get clean entity name without type prefix - קבלת שם ישות נקי ללא סוג הישות
     */
    getCleanEntityName(item) {
        // שימוש ב-description אם קיים (מכיל את הפורמט הנכון מהשרת: "טרייד Long על TSLA")
        // אחרת נופל ל-title או name
        let name = item.description || item.title || item.name || item.symbol || `#${item.id}`;
        
        // הסרת סוג הישות מהשם אם הוא קיים
        const typePrefixes = {
            'trade': ['טרייד:', 'Trade:', 'trade:'],
            'trade_plan': ['תכנון:', 'תכנית:', 'Plan:', 'plan:'],
            'alert': ['התראה:', 'Alert:', 'alert:'],
            'account': ['חשבון מסחר:', 'Account:', 'account:'],
            'ticker': ['טיקר:', 'Ticker:', 'ticker:'],
            'execution': ['ביצוע:', 'Execution:', 'execution:'],
            'cash_flow': ['תזרים:', 'Cash Flow:', 'cash_flow:'],
            'note': ['הערה:', 'Note:', 'note:']
        };
        
        const prefixes = typePrefixes[item.type] || [];
        for (const prefix of prefixes) {
            if (name.startsWith(prefix)) {
                name = name.substring(prefix.length).trim();
                break;
            }
        }
        
        return name;
    }

    /**
     * Get linked items function for entity type - פונקציה לפריטים מקושרים לפי סוג ישות
     */
    getLinkedItemsFunctionForType(type, id) {
        const functions = {
            'trade': `viewLinkedItemsForTrade(${id})`,
            'trade_plan': `viewLinkedItemsForTradePlan(${id})`,
            'ticker': `viewLinkedItemsForTicker(${id})`,
            'account': `viewLinkedItemsForAccount(${id})`,
            'alert': `viewLinkedItemsForAlert(${id})`,
            'cash_flow': `window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${id})`,
            'execution': `viewLinkedItemsForExecution(${id})`,
            'note': `viewLinkedItemsForNote(${id})`
        };
        
        // Dynamic function name
        if (functions[type]) {
            return functions[type];
        }
        
        // Fallback - generic function
        return `window.showLinkedItemsModal && window.showLinkedItemsModal([], '${type}', ${id})`;
    }
    
    /**
     * Get edit function for entity type - פונקציה לעריכה לפי סוג ישות
     */
    getEditFunctionForType(type, id) {
        const functions = {
            'trade': `editTradeRecord('${id}')`,
            'trade_plan': `editTradePlan('${id}')`,
            'ticker': `window.ModalManagerV2 && window.ModalManagerV2.showEditModal('tickersModal', 'ticker', ${id})`,
            'account': `editAccount('${id}')`,
            'alert': `editAlert(${id})`,
            'cash_flow': `window.ModalManagerV2 && window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', ${id})`,
            'execution': `window.ModalManagerV2 && window.ModalManagerV2.showEditModal('executionsModal', 'execution', ${id})`,
            'note': `window.ModalManagerV2 && window.ModalManagerV2.showEditModal('notesModal', 'note', ${id})`
        };
        
        return functions[type] || '';
    }
    
    /**
     * Get cancel/reactivate function for entity type - פונקציה לביטול/הפעלה מחדש לפי סוג ישות
     */
    getCancelFunctionForType(type, id, status) {
        const isCancelled = status === 'cancelled' || status === 'canceled';
        
        if (isCancelled) {
            // Reactivate functions
            const reactivateFunctions = {
                'trade': `window.reactivateTrade && window.reactivateTrade(${id})`,
                'trade_plan': `window.reactivateTradePlan && window.reactivateTradePlan(${id})`,
                'account': `window.reactivateAccount && window.reactivateAccount(${id})`,
                'alert': `window.reactivateAlert && window.reactivateAlert(${id})`
            };
            return reactivateFunctions[type] || null;
        } else {
            // Cancel functions
            const cancelFunctions = {
                'trade': `cancelTradeRecord('${id}')`,
                'trade_plan': `window.openCancelTradePlanModal && window.openCancelTradePlanModal(${id})`,
                'account': `window.cancelAccount && window.cancelAccount(${id})`,
                'alert': `window.cancelAlert && window.cancelAlert(${id})`
            };
            return cancelFunctions[type] || null;
        }
    }
    
    /**
     * Get delete function for entity type - פונקציה למחיקה לפי סוג ישות
     */
    getDeleteFunctionForType(type, id) {
        const functions = {
            'ticker': `performTickerCancellation(${id})`,
            'execution': `deleteExecution(${id})`,
            'cash_flow': `deleteCashFlow(${id})`,
            'note': `deleteNote(${id})`
        };
        
        return functions[type] || null;
    }
    
    /**
     * Get action button for entity type - כפתור פעולה לפי סוג ישות (deprecated - use getLinkedItemsFunctionForType, getEditFunctionForType, etc.)
     */
    getActionButtonForType(type, id, status) {
        // ישויות עם כפתור ביטול/שיחזור
        const cancelableTypes = ['trade', 'trade_plan', 'alert', 'account'];
        
        if (cancelableTypes.includes(type)) {
            // כפתור ביטול/שיחזור - שימוש בפונקציה הגלובלית בדיוק
            if (window.createCancelButton) {
                return window.createCancelButton(type, id, status);
            } else {
                // Fallback זהה בדיוק לפונקציה הגלובלית
                const isCancelled = status === 'cancelled' || status === 'canceled';
                const buttonClass = isCancelled ? 'btn-success' : 'btn-danger';
                const title = isCancelled ? 'הפעל מחדש' : 'בטל';
                const icon = isCancelled ? '✓' : 'X';
                
                // יצירת onclick בהתאם לסטטוס וסוג האובייקט - זהה לפונקציה הגלובלית
                let onclick = '';
                if (id) {
                    if (isCancelled) {
                        // הפעלה מחדש - פונקציות שונות לכל סוג
                        switch (type) {
                        case 'trade_plan':
                            onclick = `onclick="window.reactivateTradePlan && window.reactivateTradePlan(${id})"`;
                            break;
                        case 'trade':
                            onclick = `onclick="window.reactivateTrade && window.reactivateTrade(${id})"`;
                            break;
                        case 'alert':
                            onclick = `onclick="window.reactivateAlert && window.reactivateAlert(${id})"`;
                            break;
                        case 'account':
                            onclick = `onclick="window.reactivateAccount && window.reactivateAccount(${id})"`;
                            break;
                        default: {
                            const reactivateFunc = `window.reactivate${type.charAt(0).toUpperCase() + type.slice(1)}`;
                            onclick = `onclick="${reactivateFunc} && ${reactivateFunc}(${id})"`;
                            break;
                        }
                        }
                    } else {
                        // ביטול - פונקציות שונות לכל סוג
                        switch (type) {
                        case 'trade_plan':
                            onclick = `onclick="window.openCancelTradePlanModal && window.openCancelTradePlanModal(${id})"`;
                            break;
                        case 'trade':
                            onclick = `onclick="window.cancelTradeRecord && window.cancelTradeRecord(${id})"`;
                            break;
                        case 'alert':
                            onclick = `onclick="window.cancelAlert && window.cancelAlert(${id})"`;
                            break;
                        case 'account':
                            onclick = `onclick="window.cancelAccount && window.cancelAccount(${id})"`;
                            break;
                        default: {
                            const cancelFunc = `window.cancel${type.charAt(0).toUpperCase() + type.slice(1)}`;
                            onclick = `onclick="${cancelFunc} && ${cancelFunc}(${id})"`;
                            break;
                        }
                        }
                    }
                }
                
                // HTML זהה בדיוק לפונקציה הגלובלית
                const buttonSize = isCancelled ? '' : 'btn-sm'; // כפתור שיחזור גדול יותר
                return `<button class="btn ${buttonSize} ${buttonClass}" ${onclick} title="${title}">` +
                       `<span class="cancel-icon">${icon}</span></button>`;
            }
        } else {
            // כפתור מחיקה לכל השאר
            if (window.createDeleteButtonByType) {
                return window.createDeleteButtonByType(type, id);
            } else if (window.createDeleteButton) {
                return window.createDeleteButton(`if (typeof showNotification === 'function') { showNotification('מחיקה לא זמינה', 'warning'); } else { alert('מחיקה לא זמינה'); }`);
            } else {
                return '<button class="btn btn-danger btn-sm">מחק</button>';
            }
        }
    }

    getBasicFields(entityType) {
        const fieldMappings = {
            ticker: [
                { key: 'id', label: 'מזהה', type: 'number' },
                { key: 'symbol', label: 'סימול', type: 'text' },
                { key: 'name', label: 'שם חברה', type: 'text' },
                { key: 'type', label: 'סוג', type: 'text' },
                { key: 'status', label: 'סטטוס', type: 'status' },
                { key: 'currency_name', label: 'מטבע', type: 'text' },
                { key: 'trades_summary', label: 'טריידים', type: 'trades_summary' },
                { key: 'trade_plans_summary', label: 'תכנונים', type: 'trade_plans_summary' },
                { key: 'remarks', label: 'הערות', type: 'text' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' },
                { key: 'updated_at', label: 'תאריך עדכון', type: 'datetime' }
            ],
            trade: [
                { key: 'id', label: 'מזהה', type: 'number' },
                { key: 'ticker_symbol', label: 'טיקר', type: 'text' },
                { key: 'account_name', label: 'חשבון מסחר', type: 'text' },
                { key: 'status', label: 'סטטוס', type: 'status' },
                { key: 'investment_type', label: 'סוג השקעה', type: 'text' },
                { key: 'side', label: 'צד', type: 'text' },
                { key: 'opened_at', label: 'נפתח ב', type: 'datetime' },
                { key: 'closed_at', label: 'נסגר ב', type: 'datetime' },
                { key: 'cancelled_at', label: 'בוטל ב', type: 'datetime' },
                { key: 'cancel_reason', label: 'סיבת ביטול', type: 'text' },
                { key: 'total_pl', label: 'סה"כ P/L', type: 'currency' },
                { key: 'notes', label: 'הערות', type: 'text' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' }
            ],
                    trade_plan: [
                        { key: 'id', label: 'מזהה', type: 'number' },
                        // ticker_symbol לא כאן - מוצג בשורה הראשונה עם נתוני טיקר
                        { key: 'account_name', label: 'חשבון מסחר', type: 'text' },
                { key: 'side', label: 'צד', type: 'text' },
                { key: 'investment_type', label: 'סוג השקעה', type: 'text' },
                // סטטוס מוצג בשורה הראשונה - לא כאן
                { key: 'planned_amount', label: 'סכום מתוכנן', type: 'currency' },
                { key: 'entry_conditions', label: 'תנאי כניסה', type: 'text' },
                { key: 'target_price', label: 'מחיר יעד', type: 'currency' },
                { key: 'target_percentage', label: 'אחוז יעד', type: 'percentage' },
                { key: 'stop_price', label: 'סטופ', type: 'currency', required: true },
                { key: 'stop_percentage', label: 'אחוז סטופ', type: 'percentage' },
                // current_price לא כאן - מוצג כחלק מנתוני הטיקר
                { key: 'reasons', label: 'הערות', type: 'text', showEmpty: true },
                { key: 'cancelled_at', label: 'בוטל ב', type: 'datetime' },
                { key: 'cancel_reason', label: 'סיבת ביטול', type: 'text' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' }
            ],
            account: [
                { key: 'id', label: 'מזהה', type: 'number' },
                { key: 'name', label: 'שם חשבון מסחר', type: 'text' },
                { key: 'type', label: 'סוג', type: 'text' },
                { key: 'status', label: 'סטטוס', type: 'status' },
                { key: 'currency', label: 'מטבע', type: 'text' },
                { key: 'balance', label: 'יתרה', type: 'currency' },
                { key: 'notes', label: 'הערות', type: 'text' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' },
                { key: 'updated_at', label: 'תאריך עדכון', type: 'datetime' }
            ],
            execution: [
                { key: 'id', label: 'מזהה', type: 'number' },
                { key: 'trade_id', label: 'מזהה טרייד', type: 'number' },
                { key: 'action', label: 'פעולה', type: 'text' },
                { key: 'date', label: 'תאריך ושעה', type: 'datetime' },
                { key: 'quantity', label: 'כמות', type: 'number' },
                { key: 'price', label: 'מחיר', type: 'currency' },
                { key: 'commission', label: 'עמלה', type: 'currency' },
                { key: 'fees', label: 'עמלות נוספות', type: 'currency' },
                { key: 'source', label: 'מקור', type: 'text' },
                { key: 'notes', label: 'הערות', type: 'text' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' }
            ],
            note: [
                { key: 'id', label: 'מזהה', type: 'number' },
                { key: 'content', label: 'תוכן', type: 'text' },
                { key: 'attachment', label: 'קובץ מצורף', type: 'text' },
                { key: 'related_type_id', label: 'סוג קשור', type: 'text' },
                { key: 'related_id', label: 'מזהה קשור', type: 'number' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' }
            ],
            alert: [
                { key: 'id', label: 'מזהה', type: 'number' },
                { key: 'ticker_symbol', label: 'טיקר', type: 'text' },
                { key: 'status', label: 'סטטוס', type: 'status' },
                { key: 'condition_attribute', label: 'מאפיין תנאי', type: 'text' },
                { key: 'condition_operator', label: 'אופרטור תנאי', type: 'text' },
                { key: 'condition_value', label: 'ערך תנאי', type: 'text' },
                { key: 'is_triggered', label: 'הופעל', type: 'boolean' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' },
                { key: 'triggered_at', label: 'תאריך הפעלה', type: 'datetime' }
            ],
            cash_flow: [
                { key: 'id', label: 'מזהה', type: 'number' },
                { key: 'type', label: 'סוג תזרים', type: 'text' },
                { key: 'amount', label: 'סכום', type: 'currency' },
                { key: 'currency_symbol', label: 'מטבע', type: 'text' },
                { key: 'date', label: 'תאריך', type: 'datetime' },
                { key: 'source', label: 'מקור', type: 'text' },
                { key: 'account_name', label: 'חשבון מסחר', type: 'text' },
                { key: 'external_id', label: 'מזהה חיצוני', type: 'text' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' }
            ]
        };
        return fieldMappings[entityType] || [];
    }

    formatPrice(price) {
        if (!price && price !== 0) return 'לא זמין';
        return `$${parseFloat(price).toFixed(2)}`;
    }

    formatStatus(status, entityColor = '#019193') {
        if (!status) return '<span class="badge bg-secondary">לא זמין</span>';
        
        // תרגום סטטוסים לעברית
        const statusTranslations = {
            'open': 'פתוח',
            'closed': 'סגור', 
            'cancelled': 'מבוטל'
        };
        
        const translatedStatus = statusTranslations[status] || status;
        
        // קבלת צבע הסטטוס
        let statusColor = '#6c757d'; // ברירת מחדל
        
        if (window.getStatusColor) {
            statusColor = window.getStatusColor(status);
        } else {
            // fallback לצבעים בסיסיים
            const statusColors = {
                'open': '#28a745',
                'closed': '#6c757d', 
                'cancelled': '#dc3545'
            };
            statusColor = statusColors[status] || '#6c757d';
        }
        
        // המרת hex ל-rgba עם 0.3 שקיפות
        const rgb = this.hexToRgb(statusColor);
        const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(108, 117, 125, 0.3)';
        
        return `<span class="badge" style="color: black; background-color: ${bgColor}; border: 1px solid ${statusColor}; border-radius: 0.375rem; padding: 0.25rem 0.5rem;">${translatedStatus}</span>`;
    }

    formatDateTime(datetime) {
        if (!datetime) return 'לא זמין';
        return new Date(datetime).toLocaleDateString('he-IL');
    }

    /**
     * Convert hex color to RGB - המרת צבע hex ל-RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    formatTradesSummary(tradesData) {
        if (!tradesData || !Array.isArray(tradesData)) {
            return '<span class="text-muted">אין טריידים</span>';
        }

        const summary = {
            open: 0,
            closed: 0,
            cancelled: 0,
            total: tradesData.length
        };

        tradesData.forEach(trade => {
            switch (trade.status) {
                case 'open': summary.open++; break;
                case 'closed': summary.closed++; break;
                case 'cancelled': summary.cancelled++; break;
            }
        });

        let html = `<div class="trades-summary">`;
        if (summary.open > 0) {
            const color = window.getStatusColor ? window.getStatusColor('open') : '#28a745';
            const rgb = this.hexToRgb(color);
            const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(40, 167, 69, 0.3)';
            html += `<span class="badge me-1" style="color: black; background-color: ${bgColor}; border: 1px solid ${color}; border-radius: 0.375rem; padding: 0.25rem 0.5rem;">פתוח: ${summary.open}</span>`;
        }
        if (summary.closed > 0) {
            const color = window.getStatusColor ? window.getStatusColor('closed') : '#6c757d';
            const rgb = this.hexToRgb(color);
            const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(108, 117, 125, 0.3)';
            html += `<span class="badge me-1" style="color: black; background-color: ${bgColor}; border: 1px solid ${color}; border-radius: 0.375rem; padding: 0.25rem 0.5rem;">סגור: ${summary.closed}</span>`;
        }
        if (summary.cancelled > 0) {
            const color = window.getStatusColor ? window.getStatusColor('cancelled') : '#dc3545';
            const rgb = this.hexToRgb(color);
            const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(220, 53, 69, 0.3)';
            html += `<span class="badge me-1" style="color: black; background-color: ${bgColor}; border: 1px solid ${color}; border-radius: 0.375rem; padding: 0.25rem 0.5rem;">מבוטל: ${summary.cancelled}</span>`;
        }
        html += `</div>`;
        
        return html;
    }

    formatTradePlansSummary(plansData) {
        if (!plansData || !Array.isArray(plansData)) {
            return '<span class="text-muted">אין תכנונים</span>';
        }

        const summary = {
            open: 0,
            closed: 0,
            cancelled: 0,
            total: plansData.length
        };

        plansData.forEach(plan => {
            switch (plan.status) {
                case 'open': summary.open++; break;
                case 'closed': summary.closed++; break;
                case 'cancelled': summary.cancelled++; break;
            }
        });

        let html = `<div class="trade-plans-summary">`;
        if (summary.open > 0) {
            const color = window.getStatusColor ? window.getStatusColor('open') : '#28a745';
            const rgb = this.hexToRgb(color);
            const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(40, 167, 69, 0.3)';
            html += `<span class="badge me-1" style="color: black; background-color: ${bgColor}; border: 1px solid ${color}; border-radius: 0.375rem; padding: 0.25rem 0.5rem;">פתוח: ${summary.open}</span>`;
        }
        if (summary.closed > 0) {
            const color = window.getStatusColor ? window.getStatusColor('closed') : '#6c757d';
            const rgb = this.hexToRgb(color);
            const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(108, 117, 125, 0.3)';
            html += `<span class="badge me-1" style="color: black; background-color: ${bgColor}; border: 1px solid ${color}; border-radius: 0.375rem; padding: 0.25rem 0.5rem;">סגור: ${summary.closed}</span>`;
        }
        if (summary.cancelled > 0) {
            const color = window.getStatusColor ? window.getStatusColor('cancelled') : '#dc3545';
            const rgb = this.hexToRgb(color);
            const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(220, 53, 69, 0.3)';
            html += `<span class="badge me-1" style="color: black; background-color: ${bgColor}; border: 1px solid ${color}; border-radius: 0.375rem; padding: 0.25rem 0.5rem;">מבוטל: ${summary.cancelled}</span>`;
        }
        html += `</div>`;
        
        return html;
    }

    formatFieldValue(value, type, entityColor = '#019193', fieldKey = null, entityData = null, fieldConfig = null) {
        // טיפול מיוחד בשדות עם showEmpty (כמו הערות)
        if (fieldConfig && fieldConfig.showEmpty) {
            if (value === null || value === undefined || value === '') {
                return '<span class="text-muted">אין הערות</span>';
            }
        }
        
        if (value === null || value === undefined || value === '') {
            // טיקר - אין תכנון בלי טיקר, אז לא להציג "לא זמין"
                if (fieldKey === 'ticker_symbol') {
                    // Fallback: ננסה לחלץ מה-tickerObject אם הוא קיים
                    if (entityData?.ticker?.symbol) {
                        console.log('🔍🔍🔍 [formatFieldValue] ticker_symbol from tickerObject:', {
                            tickerSymbol: entityData.ticker.symbol,
                            tickerObject: entityData.ticker
                        });
                        return entityData.ticker.symbol;
                    }
                    // Debug logging
                    console.log('🔍🔍🔍 [formatFieldValue] ticker_symbol field:', {
                        value: value,
                        entityData: entityData,
                        fieldConfig: fieldConfig,
                        hasTickerObject: !!entityData?.ticker,
                        tickerObject: entityData?.ticker
                    });
                    return value || '-';
                }
            // אם זה שדה חובה - נציג הודעה ברורה
            if (fieldConfig && fieldConfig.required) {
                return '<span class="text-danger">חובה</span>';
            }
            return 'לא זמין';
        }
        
        // קבלת סמל מטבע מהנתונים
        const getCurrencySymbol = () => {
            if (!entityData) return '$';
            
            // ניסיון לקבל מהטיקר
            if (entityData.ticker && entityData.ticker.currency_symbol) {
                return entityData.ticker.currency_symbol;
            }
            if (entityData.ticker && entityData.ticker.currency && entityData.ticker.currency.symbol) {
                const symbol = entityData.ticker.currency.symbol;
                // המרה מסמל ISO לסמל תצוגה
                if (symbol === 'USD') return '$';
                if (symbol === 'ILS') return '₪';
                if (symbol === 'EUR') return '€';
                if (symbol === 'GBP') return '£';
                return symbol;
            }
            
            // ניסיון לקבל מה-currency_id דרך currenciesData
            if (entityData.ticker && entityData.ticker.currency_id && window.currenciesData && window.currenciesData.length > 0) {
                const currency = window.currenciesData.find(c => c.id === entityData.ticker.currency_id);
                if (currency && currency.symbol) {
                    const symbol = currency.symbol;
                    if (symbol === 'USD') return '$';
                    if (symbol === 'ILS') return '₪';
                    if (symbol === 'EUR') return '€';
                    if (symbol === 'GBP') return '£';
                    return symbol;
                }
            }
            
            // ברירת מחדל
            return '$';
        };
        
        // טיפול מיוחד בשדות ספציפיים לפי fieldKey
        if (fieldKey === 'side' && window.FieldRendererService && window.FieldRendererService.renderSide) {
            return window.FieldRendererService.renderSide(value);
        }
        if (fieldKey === 'investment_type' && window.FieldRendererService && window.FieldRendererService.renderType) {
            return window.FieldRendererService.renderType(value);
        }
        // טיפול בשדות מחיר - כולל stop_price (לא רק stop_loss)
        if ((fieldKey === 'target_price' || fieldKey === 'stop_price' || fieldKey === 'stop_loss') && window.FieldRendererService && window.FieldRendererService.renderAmount) {
            const currencySymbol = getCurrencySymbol();
            return window.FieldRendererService.renderAmount(parseFloat(value), currencySymbol, 2);
        }
        
        // טיפול בשדות אחוז
        if (fieldKey === 'target_percentage' || fieldKey === 'stop_percentage') {
            if (typeof value === 'number') {
                return `${value.toFixed(2)}%`;
            }
            return String(value) + '%';
        }
        
        switch (type) {
            case 'datetime': return this.formatDateTime(value);
            case 'price': return this.formatPrice(value);
            case 'status': return this.formatStatus(value, entityColor);
            case 'boolean': return value ? 'כן' : 'לא';
            case 'number': return typeof value === 'number' ? value.toLocaleString('he-IL') : String(value);
            case 'currency': 
                // אם זה currency, נשתמש ב-renderAmount אם אפשר
                if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                    const currencySymbol = getCurrencySymbol();
                    return window.FieldRendererService.renderAmount(parseFloat(value), currencySymbol, 2);
                }
                return typeof value === 'number' ? value.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(value);
            case 'text': return String(value);
            case 'percentage': 
                if (typeof value === 'number') {
                    return `${value.toFixed(2)}%`;
                }
                return String(value) + '%';
            case 'trades_summary': return this.formatTradesSummary(value);
            case 'trade_plans_summary': return this.formatTradePlansSummary(value);
            default: return String(value);
        }
    }

    renderError(message) {
        return `<div class="alert alert-danger">${message}</div>`;
    }

    getEntityDisplayName(entityType) {
        const names = {
            ticker: 'טיקר', trade: 'טרייד', trade_plan: 'תכנית',
            execution: 'ביצוע', account: 'חשבון מסחר', alert: 'התראה'
        };
        return names[entityType] || entityType;
    }

    renderTradeSpecific(tradeData) { return ''; }
    renderTradePlan(tradePlanData, options = {}) {
        window.Logger.info(`🎨 Rendering trade plan data:`, tradePlanData, { page: "entity-details-renderer" });
        
        // קבלת צבע התוכנית מההעדפות
        const planColor = this.entityColors.trade_plan || '#6f42c1';
        
        // סטטוס - שימוש במערכת הרינדור הכללית
        const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
            ? window.FieldRendererService.renderStatus(tradePlanData.status, 'trade_plan')
            : '';
        
        // טיקר - נחלץ מה-tickerObject או מה-ticker_symbol
        const tickerSymbol = tradePlanData.ticker_symbol || 
                            (tradePlanData.ticker?.symbol) || 
                            (tradePlanData.ticker_id ? `טיקר #${tradePlanData.ticker_id}` : 'לא מוגדר');
        
        // נתוני טיקר עדכניים - ננסה לקבל מה-ticker object
        // Backend מחזיר: ticker object עם current_price, daily_change, daily_change_percent, volume
        let tickerInfoHTML = '';
        
        console.log('🔍🔍🔍 [renderTradePlan] Checking ticker data:', {
            hasTicker: !!tradePlanData.ticker,
            tickerObject: tradePlanData.ticker,
            tickerObjectFull: JSON.stringify(tradePlanData.ticker, null, 2),
            hasFieldRendererService: !!window.FieldRendererService,
            hasRenderTickerInfo: !!(window.FieldRendererService && window.FieldRendererService.renderTickerInfo),
            tickerObjectKeys: tradePlanData.ticker ? Object.keys(tradePlanData.ticker) : [],
            tickerObjectValues: tradePlanData.ticker ? Object.entries(tradePlanData.ticker).map(([key, value]) => ({key, value, type: typeof value})) : []
        });
        
        if (tradePlanData.ticker && window.FieldRendererService && window.FieldRendererService.renderTickerInfo) {
            // יצירת אובייקט ticker עם הנתונים העדכניים לפי המבנה מה-backend
            const tickerData = {
                symbol: tradePlanData.ticker.symbol || tickerSymbol,
                name: tradePlanData.ticker.name || '',
                current_price: tradePlanData.ticker.current_price || 0,
                daily_change: tradePlanData.ticker.daily_change || 
                            tradePlanData.ticker.change_amount || 
                            0,
                daily_change_percent: tradePlanData.ticker.daily_change_percent || 
                                    tradePlanData.ticker.change_percent || 
                                    0,
                volume: tradePlanData.ticker.volume || 0,
                currency_symbol: tradePlanData.ticker.currency_symbol || 
                               (tradePlanData.ticker.currency?.symbol) || 
                               '$'
            };
            
            console.log('🔍🔍🔍 [renderTradePlan] tickerData created:', {
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
                console.log('🔍🔍🔍 [renderTradePlan] Calling renderTickerInfo...');
                tickerInfoHTML = window.FieldRendererService.renderTickerInfo(tickerData, 'mb-2');
                console.log('🔍🔍🔍 [renderTradePlan] renderTickerInfo returned:', {
                    tickerInfoHTMLLength: tickerInfoHTML.length,
                    tickerInfoHTML: tickerInfoHTML.substring(0, 200)
                });
            } else {
                console.log('⚠️ [renderTradePlan] Condition not met - not calling renderTickerInfo');
            }
        } else {
            console.log('⚠️ [renderTradePlan] Missing requirements for ticker info:', {
                hasTicker: !!tradePlanData.ticker,
                hasFieldRendererService: !!window.FieldRendererService,
                hasRenderTickerInfo: !!(window.FieldRendererService && window.FieldRendererService.renderTickerInfo)
            });
        }
        
        console.log('🔍🔍🔍 [renderTradePlan] Final tickerInfoHTML:', {
            tickerInfoHTMLLength: tickerInfoHTML.length,
            tickerInfoHTML: tickerInfoHTML
        });
        
        // אם אין נתונים - לא נציג כלום (בלי fallback, בלי הודעת "לא זמין")
        
        return `
            <div class="entity-details-container trade-plan-details">
                
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
                
                <!-- מידע בסיסי בשתי עמודות -->
                <div class="row">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(tradePlanData, 'trade_plan', planColor)}
                    </div>
                    <div class="col-md-6">
                        ${this.renderAdditionalInfo(tradePlanData, 'trade_plan', planColor)}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${(() => {
                            if (window.Logger) {
                                window.Logger.info('✅ [1.5 renderTradePlan] Calling renderLinkedItems with sourceInfo', {
                                    hasOptions: !!options,
                                    hasSourceInfo: !!options?.sourceInfo,
                                    sourceInfo: options?.sourceInfo,
                                    sourceInfoString: options?.sourceInfo ? JSON.stringify(options.sourceInfo) : null,
                                    page: "entity-details-renderer"
                                });
                            }
                            return this.renderLinkedItems(tradePlanData.linked_items || [], planColor, 'trade_plan', tradePlanData.id, options?.sourceInfo || null);
                        })()}
                    </div>
                </div>
            </div>
        `;
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
        window.Logger.info(`🎨 Rendering execution data:`, executionData, { page: "entity-details-renderer" });
        
        // קבלת צבע הביצוע מההעדפות
        const executionColor = this.entityColors.execution || '#17a2b8';
        
        // סטטוס למעלה - שימוש במערכת הרינדור הכללית
        const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
            ? window.FieldRendererService.renderStatus(executionData.status, 'execution')
            : '';
        
        return `
            <div class="entity-details-container execution-details">
                
                <!-- סטטוס למעלה -->
                ${statusDisplay ? `<div class="mb-3 d-flex justify-content-start align-items-center gap-2">
                    <strong>סטטוס:</strong>
                    ${statusDisplay}
                </div>` : ''}
                
                <!-- מידע בסיסי בשתי עמודות -->
                <div class="row">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(executionData, 'execution', executionColor)}
                    </div>
                    <div class="col-md-6">
                        ${this.renderAdditionalInfo(executionData, 'execution', executionColor)}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(executionData.linked_items || [], executionColor, 'execution', executionData.id, options?.sourceInfo || null)}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAccount(accountData, options = {}) {
        window.Logger.info(`🎨 Rendering account data:`, accountData, { page: "entity-details-renderer" });
        
        // קבלת צבע החשבון מסחר מההעדפות
        const accountColor = this.entityColors.account || '#28a745';
        
        // סטטוס למעלה - שימוש במערכת הרינדור הכללית
        const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
            ? window.FieldRendererService.renderStatus(accountData.status, 'account')
            : '';
        
        return `
            <div class="entity-details-container account-details">
                
                <!-- סטטוס למעלה -->
                ${statusDisplay ? `<div class="mb-3 d-flex justify-content-start align-items-center gap-2">
                    <strong>סטטוס:</strong>
                    ${statusDisplay}
                </div>` : ''}
                
                <!-- מידע בסיסי בשתי עמודות -->
                <div class="row">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(accountData, 'account', accountColor)}
                    </div>
                    <div class="col-md-6">
                        ${this.renderAdditionalInfo(accountData, 'account', accountColor)}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(accountData.linked_items || [], accountColor, 'account', accountData.id, options?.sourceInfo || null)}
                    </div>
                </div>
            </div>
        `;
    }
    renderAlert(alertData, options) {
        try {
            window.Logger.info('🎨 Rendering alert data:', alertData, { page: "entity-details-renderer" });
            
            // סטטוס למעלה - שימוש במערכת הרינדור הכללית
            const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
                ? window.FieldRendererService.renderStatus(alertData.status, 'alert')
                : '';
            
            // יצירת כותרת המודול
            
            // יצירת מידע בסיסי
            const basicInfo = this.renderBasicInfo(alertData, 'alert');
            
            // יצירת מידע ספציפי להתראה
            const alertSpecific = this.renderAlertSpecific(alertData);
            
            // יצירת תנאי ההתראה
            const alertCondition = this.renderAlertCondition(alertData);
            
            // יצירת פריטים מקושרים
            const linkedItems = this.renderLinkedItems(alertData.linked_items || [], this.entityColors.alert || '#ffc107', 'alert', alertData.id, options?.sourceInfo || null);
            
            // יצירת כפתורי פעולה
            const actionButtons = this.renderActionButtons('alert', alertData.id);
            
            return `
                <div class="entity-details-content">
                    <div class="entity-details-body">
                        <!-- סטטוס למעלה -->
                        ${statusDisplay ? `<div class="mb-3 d-flex justify-content-start align-items-center gap-2">
                            <strong>סטטוס:</strong>
                            ${statusDisplay}
                        </div>` : ''}
                        
                        ${basicInfo}
                        ${alertSpecific}
                        ${alertCondition}
                        ${linkedItems}
                    </div>
                    ${actionButtons}
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
        const statusClass = this.getStatusClass(alertData.status);
        const statusLabel = this.getStatusLabel(alertData.status);
        const triggeredClass = this.getTriggeredClass(alertData.triggered);
        const triggeredLabel = this.getTriggeredLabel(alertData.triggered);
        
        return `
            <div class="info-section">
                <h4>פרטי התראה</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <label>סטטוס:</label>
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                    </div>
                    <div class="info-item">
                        <label>הופעל:</label>
                        <span class="triggered-badge ${triggeredClass}">${triggeredLabel}</span>
                    </div>
                    <div class="info-item">
                        <label>תאריך יצירה:</label>
                        <span>${this.formatDate(alertData.created_at)}</span>
                    </div>
                    <div class="info-item">
                        <label>תאריך עדכון:</label>
                        <span>${this.formatDate(alertData.updated_at)}</span>
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
        
        // סטטוס למעלה - שימוש במערכת הרינדור הכללית
        const statusDisplay = (window.FieldRendererService && window.FieldRendererService.renderStatus)
            ? window.FieldRendererService.renderStatus(cashFlowData.status || 'active', 'cash_flow')
            : '';
        
        return `
            <div class="entity-details-container cash-flow-details">
                
                <!-- סטטוס למעלה -->
                ${statusDisplay ? `<div class="mb-3 d-flex justify-content-start align-items-center gap-2">
                    <strong>סטטוס:</strong>
                    ${statusDisplay}
                </div>` : ''}
                
                <div class="row">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(cashFlowData, 'cash_flow')}
                    </div>
                    <div class="col-md-6">
                        ${this.renderCashFlowSpecific(cashFlowData)}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderCashFlowLinkedItems(cashFlowData)}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderActionButtons('cash_flow', cashFlowData.id)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render cash flow specific information - רנדור מידע ספציפי לתזרים מזומנים
     */
    renderCashFlowSpecific(cashFlowData) {
        const amount = parseFloat(cashFlowData.amount || 0);
        const amountClass = amount >= 0 ? 'text-success' : 'text-danger';
        const amountIcon = amount >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        return `
            <div class="cash-flow-specific">
                <h6 class="border-bottom pb-2 mb-3">פרטי תזרים</h6>
                
                <div class="mb-3">
                    <label class="form-label fw-bold">סכום:</label>
                    <div class="d-flex align-items-center">
                        <i class="fas ${amountIcon} ${amountClass} me-2"></i>
                        <span class="${amountClass} fw-bold fs-5">
                            ${cashFlowData.currency_symbol || '$'}${Math.abs(amount).toFixed(2)}
                        </span>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label fw-bold">סוג תזרים:</label>
                    <span class="badge bg-secondary">${this.translateCashFlowType(cashFlowData.type)}</span>
                </div>
                
                <div class="mb-3">
                    <label class="form-label fw-bold">מקור:</label>
                    <span class="badge bg-info">${this.translateCashFlowSource(cashFlowData.source)}</span>
                </div>
                
                <div class="mb-3">
                    <label class="form-label fw-bold">תאריך:</label>
                    <span>${this.formatDate(cashFlowData.date)}</span>
                </div>
                
                <div class="mb-3">
                    <label class="form-label fw-bold">מזהה:</label>
                    <span class="badge bg-light text-dark">#${cashFlowData.id}</span>
                </div>
                
                ${cashFlowData.description ? `
                <div class="mb-3">
                    <label class="form-label fw-bold">תיאור:</label>
                    <p class="mb-0">${cashFlowData.description}</p>
                </div>
                ` : ''}
                
                ${cashFlowData.external_id ? `
                <div class="mb-3">
                    <label class="form-label fw-bold">מזהה חיצוני:</label>
                    <span class="badge bg-light text-dark">${cashFlowData.external_id}</span>
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
            'transfer': 'העברה',
            'fee': 'עמלה',
            'dividend': 'דיבידנד',
            'interest': 'ריבית'
        };
        return translations[type] || type;
    }

    /**
     * Translate cash flow source - תרגום מקור תזרים
     */
    translateCashFlowSource(source) {
        const translations = {
            'manual': 'ידני',
            'api': 'API',
            'import': 'ייבוא',
            'system': 'מערכת'
        };
        return translations[source] || source;
    }

    /**
     * Render cash flow linked items - רנדור פריטים מקושרים לתזרים מזומנים
     */
    renderCashFlowLinkedItems(cashFlowData) {
        // הוספת החשבון מסחר המקושר כפריט מקושר ראשון
        const accountItem = cashFlowData.trading_account_id ? `
            <div class="col-md-6">
                <div class="card linked-item-card">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="linked-item-icon me-3">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="card-title mb-1">${cashFlowData.account_name || `חשבון מסחר ${cashFlowData.trading_account_id}`}</h6>
                                <p class="card-text text-muted small mb-0">חשבון מסחר מסחר #${cashFlowData.trading_account_id}</p>
                            </div>
                            <div class="linked-item-actions">
                                <button class="btn btn-sm btn-outline-primary" 
                                        onclick="window.showEntityDetails('account', ${cashFlowData.trading_account_id})"
                                        title="צפה בפרטים">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ` : '';
        
        return `
            <div class="linked-items-section">
                <h6 class="border-bottom pb-2 mb-3">פריטים מקושרים</h6>
                <div class="row g-3 mb-3">
                    ${accountItem}
                </div>
                
                <div class="text-center">
                    <button class="btn btn-outline-primary" 
                            onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${cashFlowData.id})"
                            title="צפה בכל הפריטים המקושרים">
                        <i class="fas fa-link me-2"></i>
                        צפה בכל הפריטים המקושרים
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get entity label - קבלת תווית ישות
     */
    getEntityLabel(entityType) {
        const labels = {
            'ticker': 'טיקר',
            'trade': 'טרייד',
            'trade_plan': 'תכנון',
            'execution': 'ביצוע',
            'account': 'חשבון מסחר',
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
        window.Logger.info(`🎨 Rendering note data:`, noteData, { page: "entity-details-renderer" });
        
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
                <div class="row">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(noteData, 'note', noteColor)}
                    </div>
                    <div class="col-md-6">
                        ${this.renderAdditionalInfo(noteData, 'note', noteColor)}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(noteData.linked_items || [], noteColor, 'note', noteData.id, options?.sourceInfo || null)}
                    </div>
                </div>
            </div>
        `;
    }
    renderGeneric(entityData, entityType, options) { return '<div>ישות כללית</div>'; }
}

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize when DOM is ready - אתחול אוטומטי כשה-DOM מוכן
 */
// document.addEventListener('DOMContentLoaded', () => {
//     try {
//         // אתחול מערכת הרנדור
        new EntityDetailsRenderer();
        
        window.Logger.info('Entity Details Renderer system loaded and ready', { page: "entity-details-renderer" });
        
//     } catch (error) {
//         window.Logger.error('Error auto-initializing EntityDetailsRenderer:', error, { page: "entity-details-renderer" });
//     }
// });