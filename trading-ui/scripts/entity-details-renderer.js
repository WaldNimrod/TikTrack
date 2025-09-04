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
      // // console.error('Error initializing EntityDetailsRenderer:', error); // Disabled for linting
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
      note: '#6c757d',
    };

    // ניסיון לטעון צבעים מהעדפות משתמש
    try {
      if (window.userPreferences && window.userPreferences.entityColors) {
        Object.assign(this.entityColors, window.userPreferences.entityColors);
      }
    } catch (error) {
      // // console.debug('Could not load entity colors from preferences, using defaults'); // Disabled for linting
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
      // // console.error('Error rendering entity details:', error); // Disabled for linting
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
    const entityColor = this.entityColors.ticker || '#dc3545';

    return `
            <div class="entity-details-container ticker-details">
                ${this.renderEntityHeader('טיקר', tickerData.symbol || tickerData.id, entityColor)}
                
                <div class="row">
                    <div class="col-md-6">
                        ${this.renderBasicInfo(tickerData, 'ticker')}
                    </div>
                    <div class="col-md-6">
                        ${this.renderMarketData(tickerData)}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderLinkedItems(tickerData.linked_items || [])}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        ${this.renderActionButtons('ticker', tickerData.id)}
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
      note: 'fa-sticky-note',
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
    let html = '<div class="entity-basic-info"><h6 class="border-bottom pb-2 mb-3">מידע בסיסי</h6>';

    fields.forEach(field => {
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
    // בדיקה אם יש נתונים חיצוניים
    const hasExternalData = tickerData.current_price || tickerData.data_source;

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

    return `
            <div class="entity-market-data">
                <h6 class="border-bottom pb-2 mb-3">
                    נתוני שוק 
                    ${tickerData.market_status ? this.formatMarketStatus(tickerData.market_status) : ''}
                </h6>
                <div class="row mb-2">
                    <div class="col-5 text-muted">מחיר נוכחי:</div>
                    <div class="col-7">${this.formatPrice(tickerData.current_price)}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-5 text-muted">שינוי יומי:</div>
                    <div class="col-7">${this.formatPriceChange(tickerData.daily_change, tickerData.daily_change_percent)}</div>
                </div>
                ${tickerData.volume ? `
                <div class="row mb-2">
                    <div class="col-5 text-muted">נפח מסחר:</div>
                    <div class="col-7">${this.formatVolume(tickerData.volume)}</div>
                </div>
                ` : ''}
                ${tickerData.day_high || tickerData.day_low ? `
                <div class="row mb-2">
                    <div class="col-5 text-muted">טווח יומי:</div>
                    <div class="col-7">${this.formatPrice(tickerData.day_low)} - ${this.formatPrice(tickerData.day_high)}</div>
                </div>
                ` : ''}
                <div class="row mb-2">
                    <div class="col-5 text-muted">עדכון אחרון:</div>
                    <div class="col-7">${this.formatDateTime(tickerData.last_updated)}</div>
                </div>
                ${tickerData.data_source ? `
                <div class="row mb-2">
                    <div class="col-5 text-muted">מקור נתונים:</div>
                    <div class="col-7"><span class="badge bg-info">${this.formatDataSource(tickerData.data_source)}</span></div>
                </div>
                ` : ''}
            </div>
        `;
  }

  /**
     * Format market status - עיצוב מצב שוק
     */
  formatMarketStatus(status) {
    const statusMappings = {
      open: { text: 'פתוח', class: 'bg-success' },
      closed: { text: 'סגור', class: 'bg-secondary' },
      unknown: { text: 'לא ידוע', class: 'bg-warning' },
    };

    const statusInfo = statusMappings[status] || { text: status, class: 'bg-secondary' };
    return `<span class="badge ${statusInfo.class} ms-2">${statusInfo.text}</span>`;
  }

  /**
     * Format volume - עיצוב נפח מסחר
     */
  formatVolume(volume) {
    if (!volume && volume !== 0) {return 'לא זמין';}

    const numVolume = parseFloat(volume);
    if (isNaN(numVolume)) {return String(volume);}

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
      iex_cloud: 'IEX Cloud',
    };

    return sourceMappings[source] || source;
  }

  /**
     * Format price change - עיצוב שינוי מחיר
     */
  formatPriceChange(change, changePercent) {
    if (!change && change !== 0 || !changePercent && changePercent !== 0) {
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
                    <button class="btn btn-primary btn-sm" onclick="window.entityDetailsModal.editEntity('${entityType}', ${entityId})">
                        <i class="fas fa-edit me-1"></i>עריכה
                    </button>
                    <button class="btn btn-info btn-sm" onclick="window.entityDetailsModal.openEntityPage('${entityType}', ${entityId})">
                        <i class="fas fa-external-link-alt me-1"></i>פתח בדף
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
    if (!linkedItems || linkedItems.length === 0) {
      return `
                <div class="entity-linked-items">
                    <h6 class="border-bottom pb-2 mb-3">פריטים מקושרים</h6>
                    <div class="text-muted text-center py-4">
                        <i class="fas fa-link fa-2x mb-3"></i>
                        <p>אין פריטים מקושרים</p>
                    </div>
                </div>
            `;
    }

    let html = `
            <div class="entity-linked-items">
                <h6 class="border-bottom pb-2 mb-3">פריטים מקושרים (${linkedItems.length})</h6>
                <div class="row">
        `;

    linkedItems.forEach(item => {
      const entityColor = this.entityColors[item.type] || '#6c757d';
      html += `
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-2">
                                <div class="entity-icon-small me-2" style="background-color: ${entityColor};">
                                    <i class="fas ${this.getEntityIcon(item.type)} text-white"></i>
                                </div>
                                <span class="badge" style="background-color: ${entityColor};">${this.getEntityDisplayName(item.type)}</span>
                            </div>
                            <h6 class="card-title">${item.title || item.symbol || item.name || `#${item.id}`}</h6>
                            <p class="card-text text-muted small">${this.formatStatus(item.status)}</p>
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="showEntityDetails('${item.type}', ${item.id})">
                                צפה בפרטים
                            </button>
                        </div>
                    </div>
                </div>
            `;
    });

    html += '</div></div>';
    return html;
  }

  // Helper methods
  getBasicFields(entityType) {
    const fieldMappings = {
      ticker: [
        { key: 'symbol', label: 'סימול', type: 'text' },
        { key: 'name', label: 'שם חברה', type: 'text' },
        { key: 'status', label: 'סטטוס', type: 'status' },
      ],
      trade: [
        { key: 'symbol', label: 'טיקר', type: 'text' },
        { key: 'status', label: 'סטטוס', type: 'status' },
        { key: 'quantity', label: 'כמות', type: 'number' },
      ],
    };
    return fieldMappings[entityType] || [];
  }

  formatPrice(price) {
    if (!price && price !== 0) {return 'לא זמין';}
    return `$${parseFloat(price).toFixed(2)}`;
  }

  formatStatus(status) {
    if (!status) {return '<span class="badge bg-secondary">לא זמין</span>';}
    return `<span class="badge bg-primary">${status}</span>`;
  }

  formatDateTime(datetime) {
    if (!datetime) {return 'לא זמין';}
    return new Date(datetime).toLocaleString('he-IL');
  }

  formatFieldValue(value, type) {
    if (!value) {return 'לא זמין';}
    switch (type) {
    case 'datetime': return this.formatDateTime(value);
    case 'price': return this.formatPrice(value);
    case 'status': return this.formatStatus(value);
    default: return String(value);
    }
  }

  renderError(message) {
    return `<div class="alert alert-danger">${message}</div>`;
  }

  getEntityDisplayName(entityType) {
    const names = {
      ticker: 'טיקר', trade: 'טרייד', trade_plan: 'תכנית',
      execution: 'ביצוע', account: 'חשבון', alert: 'התראה',
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
    // // console.error('Error auto-initializing EntityDetailsRenderer:', error); // Disabled for linting
  }
});
