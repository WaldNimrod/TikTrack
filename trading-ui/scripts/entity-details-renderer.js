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
            console.error('❌ EntityDetailsRenderer initialization failed:', error);
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
            
            console.info('✅ EntityDetailsRenderer initialized successfully with preferences support');
            
        } catch (error) {
            console.error('❌ Error initializing EntityDetailsRenderer:', error);
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
            console.log('🎨 Loading entity colors from preferences...');
            console.log('🔍 Debug - window.ENTITY_COLORS:', window.ENTITY_COLORS);
            console.log('🔍 Debug - window.currentPreferences:', window.currentPreferences);
            console.log('🔍 Debug - window.userPreferences:', window.userPreferences);
            
            // נסה מערכת העדפות
            if (window.preferences && window.preferences.preferences && window.preferences.preferences.colorScheme) {
                const colorScheme = window.preferences.preferences.colorScheme;
                if (colorScheme.entities) {
                    Object.assign(this.entityColors, colorScheme.entities);
                    console.log('✅ Loaded entity colors from preferences system');
                    return;
                }
            }
            
            // נסה מערכת currentPreferences
            if (window.currentPreferences && window.currentPreferences.entityColors) {
                Object.assign(this.entityColors, window.currentPreferences.entityColors);
                console.log('✅ Loaded entity colors from currentPreferences');
                return;
            }
            
            // נסה מערכת גלובלית (compatibility layer)
            if (window.ENTITY_COLORS && Object.keys(window.ENTITY_COLORS).length > 0) {
                Object.assign(this.entityColors, window.ENTITY_COLORS);
                console.log('✅ Loaded entity colors from global system');
                return;
            }
            
            // Fallback ל-userPreferences
            if (window.userPreferences && window.userPreferences.entityColors) {
                Object.assign(this.entityColors, window.userPreferences.entityColors);
                console.log('✅ Loaded entity colors from userPreferences');
                return;
            }
            
            // Fallback אחרון - נסה לטעון מהמערכת הקיימת
            try {
                if (window.loadPreferences && typeof window.loadPreferences === 'function') {
                    const preferences = await window.loadPreferences();
                    if (preferences && preferences.entityColors) {
                        Object.assign(this.entityColors, preferences.entityColors);
                        console.log('✅ Loaded entity colors from loadPreferences');
                        return;
                    }
                }
            } catch (prefError) {
                console.debug('loadPreferences not available, using defaults');
            }
            
        } catch (error) {
            console.debug('Could not load entity colors from preferences, using defaults');
        }
        
        console.log('🔄 Using default entity colors');
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
            console.error('Error rendering entity details:', error);
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
        console.log(`🎨 Rendering ticker data:`, tickerData);
        
        // קבלת צבע הטיקר מההעדפות
        const tickerColor = this.entityColors.ticker || '#019193';
        
        return `
            <div class="entity-details-container ticker-details">
                <!-- נתוני שוק למעלה -->
                <div class="mb-4">
                    ${this.renderMarketData(tickerData, tickerColor)}
                </div>
                
                <!-- כותרת מידע בסיסי -->
                <div class="row">
                    <div class="col-12">
                        <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${tickerColor} !important;">מידע בסיסי</h6>
                    </div>
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
                        ${this.renderLinkedItems(tickerData.linked_items || [], tickerColor)}
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
        
        return `
            <div class="entity-details-container trade-details">
                ${this.renderEntityHeader('טרייד', tradeData.symbol || tradeData.id, entityColor)}
                
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
                        ${this.renderLinkedItems(tradeData.linked_items || [])}
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
     * @returns {string} - מחלקת אייקון FontAwesome
     * @private
     */
    getEntityIcon(entityType) {
        const iconMappings = {
            ticker: 'fa-chart-line',
            trade: 'fa-exchange-alt',
            trade_plan: 'fa-strategy',
            execution: 'fa-check-circle',
            account: 'fa-university',
            alert: 'fa-bell',
            cash_flow: 'fa-money-bill-wave',
            note: 'fa-sticky-note'
        };

        return iconMappings[entityType] || 'fa-cube';
    }

    /**
     * Render entity header - רנדור כותרת ישות
     */
    renderEntityHeader(entityTypeName, entityIdentifier, color) {
        return `
            <div class="entity-details-header mb-4">
                <div class="d-flex align-items-center">
                    <div class="entity-icon-circle me-3" style="background-color: ${color};">
                        <i class="fas ${this.getEntityIcon(entityTypeName)} text-white"></i>
                    </div>
                    <div>
                        <h4 class="mb-1" style="color: ${color};">${entityTypeName}</h4>
                        <p class="text-muted mb-0">${entityIdentifier}</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render basic info - רנדור מידע בסיסי
     */
    renderBasicInfo(entityData, entityType, entityColor = '#019193') {
        const fields = this.getBasicFields(entityType);
        // חלוקת השדות לשתי עמודות
        const fieldsPerColumn = Math.ceil(fields.length / 2);
        const firstColumnFields = fields.slice(0, fieldsPerColumn);
        
        let html = `
            <div class="entity-basic-info">
        `;
        
        firstColumnFields.forEach(field => {
            const value = entityData[field.key] || 'לא זמין';
            const displayValue = this.formatFieldValue(value, field.type, entityColor);
            
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
            const value = entityData[field.key] || 'לא זמין';
            const displayValue = this.formatFieldValue(value, field.type, entityColor);
            
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
        console.log(`📈 Rendering market data for:`, tickerData);
        // בדיקה אם יש נתונים חיצוניים
        const hasExternalData = tickerData.current_price || tickerData.change_percent || tickerData.volume || tickerData.yahoo_updated_at;
        console.log(`📈 Has external data:`, hasExternalData);
        
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
     */
    renderLinkedItems(linkedItems, entityColor = '#019193') {
        console.log(`🔗 Rendering linked items:`, linkedItems);
        // בדיקה אם יש פריטים מקושרים
        const hasLinkedItems = linkedItems && linkedItems.length > 0;
        console.log(`🔗 Has linked items:`, hasLinkedItems);
        
        // מיון הפריטים המקושרים: פתוח ראשון, ואז לפי תאריך
        if (hasLinkedItems) {
            linkedItems.sort((a, b) => {
                // מיון לפי סטטוס - פתוח ראשון
                const statusOrder = { 'open': 0, 'closed': 1, 'cancelled': 2 };
                const aStatusOrder = statusOrder[a.status] ?? 3;
                const bStatusOrder = statusOrder[b.status] ?? 3;
                
                if (aStatusOrder !== bStatusOrder) {
                    return aStatusOrder - bStatusOrder;
                }
                
                // אם אותו סטטוס - מיון לפי תאריך (החדש ביותר ראשון)
                const aDate = new Date(a.created_at || a.updated_at || 0);
                const bDate = new Date(b.created_at || b.updated_at || 0);
                return bDate - aDate;
            });
        }
        
        if (!hasLinkedItems) {
            return `
                <div class="entity-linked-items">
                    <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${entityColor} !important;">פריטים מקושרים</h6>
                    <div class="text-muted text-center py-4">
                        <i class="fas fa-link fa-2x mb-3"></i>
                        <p>אין פריטים מקושרים</p>
                        <button class="btn btn-outline-primary btn-sm mt-2" onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], 'ticker', window.currentEntityId || 'null')">
                            <i class="fas fa-search me-1"></i>חפש פריטים מקושרים
                        </button>
                    </div>
                </div>
            `;
        }

        // יצירת טבלה מינימלית של פריטים מקושרים
        let html = `
            <div class="entity-linked-items">
                <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${entityColor} !important;">פריטים מקושרים (${linkedItems.length})</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead style="background-color: ${entityColor}50 !important;">
                            <tr>
                                <th>סוג</th>
                                <th>שם</th>
                                <th>סטטוס</th>
                                <th>תאריך</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        linkedItems.forEach(item => {
            const itemEntityColor = this.entityColors[item.type] || '#6c757d';
            const statusBadge = this.getStatusBadge(item.status);
            const typeBadge = this.getTypeBadge(item.type, itemEntityColor);
            
            html += `
                <tr>
                    <td>${typeBadge}</td>
                    <td>
                        <strong>${this.getCleanEntityName(item)}</strong>
                        ${item.type === 'alert' && item.condition ? 
                            `<br><small class="text-muted">תנאי: ${item.condition}</small>` : 
                            (item.description ? `<br><small class="text-muted">${item.description}</small>` : '')}
                    </td>
                    <td>${statusBadge}</td>
                    <td><small>${this.formatDateTime(item.created_at || item.updated_at)}</small></td>
                    <td>
                        ${window.createLinkButton ? window.createLinkButton(`window.showEntityDetails('${item.type}', ${item.id})`) : 
                            `<button class="btn btn-sm btn-info" onclick="window.showEntityDetails('${item.type}', ${item.id})" title="צפה בפרטים"><i class="fas fa-eye"></i></button>`}
                        ${window.createEditButton ? window.createEditButton(`window.editTicker(${item.id})`) : 
                            `<button class="btn btn-sm btn-secondary" onclick="window.editTicker(${item.id})" title="ערוך"><i class="fas fa-edit"></i></button>`}
                        ${this.getActionButtonForType(item.type, item.id, item.status)}
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
                <div class="text-center mt-3">
                    <button class="btn btn-outline-primary" onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], 'ticker', window.currentEntityId || 'null')">
                        <i class="fas fa-search me-1"></i>פריטים מקושרים מלאים
                    </button>
                </div>
            </div>
        `;
        return html;
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
                text: 'חשבון', 
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
        let name = item.title || item.name || item.symbol || `#${item.id}`;
        
        // הסרת סוג הישות מהשם אם הוא קיים
        const typePrefixes = {
            'trade': ['טרייד:', 'Trade:', 'trade:'],
            'trade_plan': ['תכנון:', 'תכנית:', 'Plan:', 'plan:'],
            'alert': ['התראה:', 'Alert:', 'alert:'],
            'account': ['חשבון:', 'Account:', 'account:'],
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
     * Get action button for entity type - כפתור פעולה לפי סוג ישות
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
                return `<button class="btn btn-sm btn-danger" onclick="if (typeof showNotification === 'function') { showNotification('מחיקה לא זמינה', 'warning'); } else { alert('מחיקה לא זמינה'); }" title="מחק">🗑️</button>`;
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
                { key: 'symbol', label: 'טיקר', type: 'text' },
                { key: 'status', label: 'סטטוס', type: 'status' },
                { key: 'quantity', label: 'כמות', type: 'number' }
            ],
            trade_plan: [
                { key: 'id', label: 'מזהה', type: 'number' },
                { key: 'ticker_symbol', label: 'טיקר', type: 'text' },
                { key: 'side', label: 'צד', type: 'text' },
                { key: 'investment_type', label: 'סוג השקעה', type: 'text' },
                { key: 'status', label: 'סטטוס', type: 'status' },
                { key: 'target_price', label: 'מחיר יעד', type: 'currency' },
                { key: 'stop_loss', label: 'סטופ לוס', type: 'currency' },
                { key: 'notes', label: 'הערות', type: 'text' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' },
                { key: 'updated_at', label: 'תאריך עדכון', type: 'datetime' }
            ],
            account: [
                { key: 'id', label: 'מזהה', type: 'number' },
                { key: 'name', label: 'שם חשבון', type: 'text' },
                { key: 'type', label: 'סוג', type: 'text' },
                { key: 'status', label: 'סטטוס', type: 'status' },
                { key: 'currency', label: 'מטבע', type: 'text' },
                { key: 'balance', label: 'יתרה', type: 'currency' },
                { key: 'notes', label: 'הערות', type: 'text' },
                { key: 'created_at', label: 'תאריך יצירה', type: 'datetime' },
                { key: 'updated_at', label: 'תאריך עדכון', type: 'datetime' }
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

    formatFieldValue(value, type, entityColor = '#019193') {
        if (value === null || value === undefined || value === '') return 'לא זמין';
        switch (type) {
            case 'datetime': return this.formatDateTime(value);
            case 'price': return this.formatPrice(value);
            case 'status': return this.formatStatus(value, entityColor);
            case 'boolean': return value ? 'כן' : 'לא';
            case 'number': return typeof value === 'number' ? value.toLocaleString('he-IL') : String(value);
            case 'text': return String(value);
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
            execution: 'ביצוע', account: 'חשבון', alert: 'התראה'
        };
        return names[entityType] || entityType;
    }

    renderTradeSpecific(tradeData) { return '<div>פרטי טרייד</div>'; }
    renderTradePlan(tradePlanData, options = {}) {
        console.log(`🎨 Rendering trade plan data:`, tradePlanData);
        
        // קבלת צבע התוכנית מההעדפות
        const planColor = this.entityColors.trade_plan || '#6f42c1';
        
        return `
            <div class="entity-details-container trade-plan-details">
                <!-- כותרת מידע בסיסי -->
                <div class="row">
                    <div class="col-12">
                        <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${planColor} !important;">מידע בסיסי</h6>
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
                        ${this.renderLinkedItems(tradePlanData.linked_items || [], planColor)}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderExecution(executionData, options) { return '<div>ביצוע עסקה</div>'; }
    
    renderAccount(accountData, options = {}) {
        console.log(`🎨 Rendering account data:`, accountData);
        
        // קבלת צבע החשבון מההעדפות
        const accountColor = this.entityColors.account || '#28a745';
        
        return `
            <div class="entity-details-container account-details">
                <!-- כותרת מידע בסיסי -->
                <div class="row">
                    <div class="col-12">
                        <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${accountColor} !important;">מידע בסיסי</h6>
                    </div>
                </div>
                
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
                        ${this.renderLinkedItems(accountData.linked_items || [], accountColor)}
                    </div>
                </div>
            </div>
        `;
    }
    renderAlert(alertData, options) {
        try {
            console.log('🎨 Rendering alert data:', alertData);
            
            // יצירת כותרת המודול
            const header = this.renderEntityHeader('התראה', alertData.id || 'לא זמין', this.entityColors.alert);
            
            // יצירת מידע בסיסי
            const basicInfo = this.renderBasicInfo(alertData, 'alert');
            
            // יצירת מידע ספציפי להתראה
            const alertSpecific = this.renderAlertSpecific(alertData);
            
            // יצירת תנאי ההתראה
            const alertCondition = this.renderAlertCondition(alertData);
            
            // יצירת פריטים מקושרים
            const linkedItems = this.renderLinkedItems(alertData.linked_items || []);
            
            // יצירת כפתורי פעולה
            const actionButtons = this.renderActionButtons('alert', alertData.id);
            
            return `
                <div class="entity-details-content">
                    ${header}
                    <div class="entity-details-body">
                        ${basicInfo}
                        ${alertSpecific}
                        ${alertCondition}
                        ${linkedItems}
                    </div>
                    ${actionButtons}
                </div>
            `;
            
        } catch (error) {
            console.error('Error rendering alert:', error);
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
    renderCashFlow(cashFlowData, options) { return '<div>תזרים מזומנים</div>'; }
    renderNote(noteData, options) { return '<div>הערה</div>'; }
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
        
        console.info('Entity Details Renderer system loaded and ready');
        
//     } catch (error) {
//         console.error('Error auto-initializing EntityDetailsRenderer:', error);
//     }
// });