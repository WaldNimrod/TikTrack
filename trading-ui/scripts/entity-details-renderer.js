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
     * 
     * @constructor
     */
    constructor() {
        this.isInitialized = false;
        this.entityColors = {};
        
        this.init();
    }

    /**
     * Initialize renderer system - אתחול מערכת הרנדור
     * 
     * @private
     */
    init() {
        try {
            // טעינת צבעי ישויות מההעדפות
            this.loadEntityColors();
            
            this.isInitialized = true;
            
            // הוספה לאובייקט הגלובלי
            window.entityDetailsRenderer = this;
            
            console.info('EntityDetailsRenderer initialized successfully');
            
        } catch (error) {
            console.error('Error initializing EntityDetailsRenderer:', error);
        }
    }

    /**
     * Load entity colors from preferences - טעינת צבעי ישויות מההעדפות
     * 
     * @private
     */
    loadEntityColors() {
        // צבעי ברירת מחדל
        this.entityColors = {
            ticker: '#dc3545',
            trade: '#007bff', 
            trade_plan: '#0056b3',
            execution: '#17a2b8',
            account: '#28a745',
            alert: '#ff9c05',
            cash_flow: '#20c997',
            note: '#6c757d'
        };

        // ניסיון לטעון צבעים מהעדפות משתמש
        try {
            if (window.userPreferences && window.userPreferences.entityColors) {
                Object.assign(this.entityColors, window.userPreferences.entityColors);
            }
        } catch (error) {
            console.debug('Could not load entity colors from preferences, using defaults');
        }
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
        
        return `
            <div class="entity-details-container ticker-details">
                <!-- נתוני שוק למעלה -->
                <div class="mb-4">
                    ${this.renderMarketData(tickerData)}
                </div>
                
                <!-- מידע בסיסי בשתי עמודות -->
                <div class="row">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(tickerData, 'ticker')}
                    </div>
                    <div class="col-md-6">
                        ${this.renderAdditionalInfo(tickerData, 'ticker')}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(tickerData.linked_items || [])}
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
    renderBasicInfo(entityData, entityType) {
        const fields = this.getBasicFields(entityType);
        // חלוקת השדות לשתי עמודות
        const fieldsPerColumn = Math.ceil(fields.length / 2);
        const firstColumnFields = fields.slice(0, fieldsPerColumn);
        
        let html = '<div class="entity-basic-info"><h6 class="border-bottom pb-2 mb-3">מידע בסיסי</h6>';
        
        firstColumnFields.forEach(field => {
            const value = entityData[field.key] || 'לא זמין';
            const displayValue = this.formatFieldValue(value, field.type);
            
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">${field.label}:</div>
                    <div class="col-7">${displayValue}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Render additional info - רנדור מידע נוסף (עמודה שנייה)
     */
    renderAdditionalInfo(entityData, entityType) {
        const fields = this.getBasicFields(entityType);
        // חלוקת השדות לשתי עמודות
        const fieldsPerColumn = Math.ceil(fields.length / 2);
        const secondColumnFields = fields.slice(fieldsPerColumn);
        
        if (secondColumnFields.length === 0) {
            return '<div class="entity-additional-info"></div>';
        }
        
        let html = '<div class="entity-additional-info"><h6 class="border-bottom pb-2 mb-3">&nbsp;</h6>';
        
        secondColumnFields.forEach(field => {
            const value = entityData[field.key] || 'לא זמין';
            const displayValue = this.formatFieldValue(value, field.type);
            
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">${field.label}:</div>
                    <div class="col-7">${displayValue}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Render market data - רנדור נתוני שוק
     */
    renderMarketData(tickerData) {
        console.log(`📈 Rendering market data for:`, tickerData);
        // בדיקה אם יש נתונים חיצוניים
        const hasExternalData = tickerData.current_price || tickerData.change_percent || tickerData.volume || tickerData.yahoo_updated_at;
        console.log(`📈 Has external data:`, hasExternalData);
        
        if (!hasExternalData) {
            return `
                <div class="entity-market-data">
                    <h6 class="border-bottom pb-2 mb-3">נתוני שוק</h6>
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
                <h6 class="border-bottom pb-2 mb-3">נתוני שוק</h6>
        `;

        // מחיר נוכחי
        if (tickerData.current_price) {
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">מחיר נוכחי:</div>
                    <div class="col-7 fw-bold">${this.formatPrice(tickerData.current_price)}</div>
                </div>
            `;
        }

        // שינוי אחוזים
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

        // שינוי בדולרים
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

        // נפח מסחר
        if (tickerData.volume) {
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">נפח מסחר:</div>
                    <div class="col-7">${parseInt(tickerData.volume).toLocaleString('he-IL')}</div>
                </div>
            `;
        }

        // תאריך עדכון אחרון של נתונים חיצוניים
        if (tickerData.yahoo_updated_at) {
            const updateTime = new Date(tickerData.yahoo_updated_at).toLocaleString('he-IL');
            html += `
                <div class="row mb-2">
                    <div class="col-5 text-muted">עדכון נתונים:</div>
                    <div class="col-7 text-info">${updateTime}</div>
                </div>
            `;
        }

        html += '</div>';
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
    renderLinkedItems(linkedItems) {
        console.log(`🔗 Rendering linked items:`, linkedItems);
        // בדיקה אם יש פריטים מקושרים
        const hasLinkedItems = linkedItems && linkedItems.length > 0;
        console.log(`🔗 Has linked items:`, hasLinkedItems);
        
        if (!hasLinkedItems) {
            return `
                <div class="entity-linked-items">
                    <h6 class="border-bottom pb-2 mb-3">פריטים מקושרים</h6>
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
                <h6 class="border-bottom pb-2 mb-3">פריטים מקושרים (${linkedItems.length})</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead class="table-light">
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
            const entityColor = this.entityColors[item.type] || '#6c757d';
            const statusBadge = this.getStatusBadge(item.status);
            const typeBadge = this.getTypeBadge(item.type, entityColor);
            
            html += `
                <tr>
                    <td>${typeBadge}</td>
                    <td>
                        <strong>${item.title || item.name || item.symbol || `#${item.id}`}</strong>
                        ${item.type === 'alert' && item.condition ? 
                            `<br><small class="text-muted">תנאי: ${item.condition}</small>` : 
                            (item.description ? `<br><small class="text-muted">${item.description}</small>` : '')}
                    </td>
                    <td>${statusBadge}</td>
                    <td><small>${this.formatDateTime(item.created_at || item.updated_at)}</small></td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-info" onclick="window.showEntityDetails('${item.type}', ${item.id})" title="צפה בפרטים">👁️</button>
                            <button class="btn btn-outline-secondary" onclick="window.editTicker(${item.id})" title="ערוך">✏️</button>
                        </div>
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
        
        // שימוש במערכת הצבעים החדשה
        if (window.getStatusColor) {
            const color = window.getStatusColor(status);
            return `<span class="badge status-${status}-badge" style="background-color: ${color} !important; color: white !important;">${statusInfo.text}</span>`;
        } else {
            // fallback לצבעים הישנים
            const fallbackClass = status === 'open' ? 'bg-success' : 
                                 status === 'closed' ? 'bg-secondary' : 
                                 status === 'cancelled' ? 'bg-danger' : 'bg-secondary';
            return `<span class="badge ${fallbackClass}">${statusInfo.text}</span>`;
        }
    }

    getTypeBadge(type, color) {
        const typeMap = {
            'trade': { text: 'טרייד', icon: 'fas fa-chart-line' },
            'trade_plan': { text: 'תכנון', icon: 'fas fa-clipboard-list' },
            'alert': { text: 'התראה', icon: 'fas fa-bell' },
            'note': { text: 'הערה', icon: 'fas fa-sticky-note' },
            'execution': { text: 'ביצוע', icon: 'fas fa-handshake' },
            'account': { text: 'חשבון', icon: 'fas fa-wallet' },
            'cash_flow': { text: 'תזרים', icon: 'fas fa-money-bill-wave' }
        };
        
        const typeInfo = typeMap[type] || { text: type || 'לא ידוע', icon: 'fas fa-question' };
        return `<span class="badge" style="background-color: ${color};"><i class="${typeInfo.icon} me-1"></i>${typeInfo.text}</span>`;
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
            ]
        };
        return fieldMappings[entityType] || [];
    }

    formatPrice(price) {
        if (!price && price !== 0) return 'לא זמין';
        return `$${parseFloat(price).toFixed(2)}`;
    }

    formatStatus(status) {
        if (!status) return '<span class="badge bg-secondary">לא זמין</span>';
        
        // תרגום סטטוסים לעברית
        const statusTranslations = {
            'open': 'פתוח',
            'closed': 'סגור', 
            'cancelled': 'מבוטל'
        };
        
        const translatedStatus = statusTranslations[status] || status;
        
        // שימוש בצבעי סטטוס מהמערכת הגלובלית
        if (window.getStatusColor && window.getStatusBackgroundColor) {
            const textColor = window.getStatusColor(status);
            const bgColor = window.getStatusBackgroundColor(status);
            return `<span class="badge" style="color: ${textColor}; background-color: ${bgColor};">${translatedStatus}</span>`;
        }
        
        // fallback לצבעים בסיסיים
        const statusColors = {
            'open': 'bg-success',
            'closed': 'bg-secondary', 
            'cancelled': 'bg-danger'
        };
        const badgeClass = statusColors[status] || 'bg-primary';
        
        return `<span class="badge ${badgeClass}">${translatedStatus}</span>`;
    }

    formatDateTime(datetime) {
        if (!datetime) return 'לא זמין';
        return new Date(datetime).toLocaleDateString('he-IL');
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
            html += `<span class="badge me-1" style="background-color: ${color} !important; color: white !important;">פתוח: ${summary.open}</span>`;
        }
        if (summary.closed > 0) {
            const color = window.getStatusColor ? window.getStatusColor('closed') : '#6c757d';
            html += `<span class="badge me-1" style="background-color: ${color} !important; color: white !important;">סגור: ${summary.closed}</span>`;
        }
        if (summary.cancelled > 0) {
            const color = window.getStatusColor ? window.getStatusColor('cancelled') : '#dc3545';
            html += `<span class="badge me-1" style="background-color: ${color} !important; color: white !important;">מבוטל: ${summary.cancelled}</span>`;
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
            html += `<span class="badge me-1" style="background-color: ${color} !important; color: white !important;">פתוח: ${summary.open}</span>`;
        }
        if (summary.closed > 0) {
            const color = window.getStatusColor ? window.getStatusColor('closed') : '#6c757d';
            html += `<span class="badge me-1" style="background-color: ${color} !important; color: white !important;">סגור: ${summary.closed}</span>`;
        }
        if (summary.cancelled > 0) {
            const color = window.getStatusColor ? window.getStatusColor('cancelled') : '#dc3545';
            html += `<span class="badge me-1" style="background-color: ${color} !important; color: white !important;">מבוטל: ${summary.cancelled}</span>`;
        }
        html += `</div>`;
        
        return html;
    }

    formatFieldValue(value, type) {
        if (value === null || value === undefined || value === '') return 'לא זמין';
        switch (type) {
            case 'datetime': return this.formatDateTime(value);
            case 'price': return this.formatPrice(value);
            case 'status': return this.formatStatus(value);
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
    renderTradePlan(tradePlanData, options) { return '<div>תכנית השקעה</div>'; }
    renderExecution(executionData, options) { return '<div>ביצוע עסקה</div>'; }
    renderAccount(accountData, options) { return '<div>חשבון</div>'; }
    renderAlert(alertData, options) { return '<div>התראה</div>'; }
    renderCashFlow(cashFlowData, options) { return '<div>תזרים מזומנים</div>'; }
    renderNote(noteData, options) { return '<div>הערה</div>'; }
    renderGeneric(entityData, entityType, options) { return '<div>ישות כללית</div>'; }
}

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize when DOM is ready - אתחול אוטומטי כשה-DOM מוכן
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // אתחול מערכת הרנדור
        new EntityDetailsRenderer();
        
        console.info('Entity Details Renderer system loaded and ready');
        
    } catch (error) {
        console.error('Error auto-initializing EntityDetailsRenderer:', error);
    }
});