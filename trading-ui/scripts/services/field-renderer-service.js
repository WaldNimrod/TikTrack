/**
 * Field Renderer Service - TikTrack
 * =================================
 * 
 * מערכת מרכזית לרנדור שדות מורכבים: badges, currency, dates
 * מחליפה קוד חוזר ב-138 מקומות במערכת
 * 
 * @version 1.3.0
 * @created January 2025
 * @updated October 13, 2025 - Added renderBoolean() for yes/no icons
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - רנדור status badges (open, closed, cancelled, triggered, not_triggered)
 * - רנדור side badges (Long/Short)
 * - רנדור numeric badges (positive/negative/neutral)
 * - רנדור currency display (1 → US Dollar)
 * - רנדור type badges (swing, investment, passive)
 * - רנדור action badges (buy, sale)
 * - רנדור priority badges (high, medium, low)
 * - רנדור shares/quantity (תמיד עם # prefix)
 * - רנדור boolean (כן/לא עם איקונים ✓/✗)
 * - שימוש ב-date-utils.js לתאריכים
 * - אינטגרציה מלאה עם מערכת צבעים דינמית (3 ווריאנטים)
 */

// ===== FIELD RENDERER SERVICE =====

class FieldRendererService {
    /**
     * רנדור status badge עם צבעים דינמיים ותרגום
     * 
     * @param {string} status - סטטוס (open, closed, cancelled, triggered, not_triggered)
     * @param {string} entityType - סוג ישות (account, trade, alert, note, etc.)
     * @returns {string} - HTML של ה-badge
     * 
     * Supported statuses:
     * - open, closed, cancelled: צבעים מהעדפות משתמש
     * - triggered: צבע אזהרה (warning)
     * - not_triggered: צבע מידע (info)
     * 
     * @example
     * const html = FieldRendererService.renderStatus('open', 'account');
     * const html2 = FieldRendererService.renderStatus('triggered', 'alert');
     */
    static renderStatus(status, entityType = 'default') {
        if (!status) return '<span class="status-badge" data-status-category="unknown">-</span>';
        
        // תרגום סטטוס לעברית
        const translatedStatus = this._translateStatus(status, entityType);
        
        // קביעת קטגוריה לצבע (outline, טקסט כהה לפי קטגוריה)
        const statusLower = String(status).toLowerCase();
        let category = 'unknown';
        if (statusLower === 'open' || statusLower === 'active') category = 'open';
        else if (statusLower === 'closed' || statusLower === 'completed') category = 'closed';
        else if (statusLower === 'cancelled' || statusLower === 'canceled') category = 'cancelled';
        else if (statusLower === 'triggered') category = 'warning';
        else if (statusLower === 'not_triggered') category = 'info';
        
        // שימוש במחלקה הייעודית שלנו ל-outline כדי למנוע טקסט לבן
        return `<span class="status-badge" data-status-category="${category}" data-entity="${entityType}">${translatedStatus}</span>`;
    }

    /**
     * רנדור side badge (Long/Short)
     * 
     * @param {string} side - צד (Long, Short)
     * @returns {string} - HTML של ה-badge
     * 
     * @example
     * const html = FieldRendererService.renderSide('Long');
     */
    static renderSide(side) {
        if (!side) return '<span class="badge badge-secondary">-</span>';
        
        const sideNormalized = side.toLowerCase();
        const isLong = sideNormalized === 'long';
        const sideHebrew = isLong ? 'לונג' : 'שורט';
        const sideClass = isLong ? 'badge-long' : 'badge-short';
        
        return `<span class="badge ${sideClass}">${sideHebrew}</span>`;
    }

    /**
     * רנדור numeric value עם צבע (חיובי/שלילי/ניטרלי)
     * 
     * @param {number|string} value - ערך מספרי
     * @param {string} suffix - סיומת (%, $, וכו')
     * @param {boolean} showPrefix - להציג + לחיובי
     * @returns {string} - HTML עם class מתאים
     * 
     * @example
     * const html = FieldRendererService.renderNumericValue(5.2, '%', true);
     * // Output: '<span class="profit-positive">+5.2%</span>'
     */
    static renderNumericValue(value, suffix = '', showPrefix = false) {
        if (value === null || value === undefined || value === '' || isNaN(value)) {
            return '<span class="profit-neutral">-</span>';
        }
        
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        const cssClass = numValue > 0 ? 'profit-positive' : (numValue < 0 ? 'profit-negative' : 'profit-neutral');
        const prefix = (numValue > 0 && showPrefix) ? '+' : '';
        const displayValue = numValue.toFixed(2);
        
        return `<span class="${cssClass}">${prefix}${displayValue}${suffix}</span>`;
    }

    /**
     * רנדור P&L (רווח/הפסד)
     * @deprecated - השתמש ב-renderNumericValue במקום
     */
    static renderPnL(value, currency = '₪') {
        return this.renderNumericValue(value, currency, true);
    }

    /**
     * רנדור currency (מטבע)
     * 
     * @param {number} id - מזהה מטבע
     * @param {string} name - שם מטבע
     * @param {string} symbol - סימול מטבע
     * @returns {string} - HTML מעוצב
     * 
     * @example
     * const html = FieldRendererService.renderCurrency(1, 'US Dollar', '$');
     * // Output: '<span class="currency-display" title="US Dollar">$</span>'
     */
    static renderCurrency(id, name, symbol) {
        if (!symbol && !name) return '-';
        const displayText = symbol || name || id;
        const title = name || symbol || '';
        return `<span class="currency-display" title="${title}">${displayText}</span>`;
    }

    /**
     * רנדור type badge (סוג השקעה)
     * 
     * @param {string} type - סוג (swing, investment, passive)
     * @returns {string} - HTML של ה-badge
     * 
     * @example
     * const html = FieldRendererService.renderType('swing');
     */
    static renderType(type) {
        if (!type) return '<span class="badge badge-secondary">-</span>';
        
        // תרגום לעברית
        const typeTranslations = {
            'swing': 'סווינג',
            'investment': 'השקעה',
            'passive': 'פסיבי'
        };
        
        const typeLower = type.toLowerCase();
        const typeHebrew = typeTranslations[typeLower] || type;
        
        return `<span class="badge badge-type badge-capsule" data-type="${typeLower}">${typeHebrew}</span>`;
    }

    /**
     * רנדור action badge (פעולה: קנייה/מכירה)
     * 
     * @param {string} action - פעולה (buy, sale, sell)
     * @returns {string} - HTML של ה-badge
     * 
     * @example
     * const html = FieldRendererService.renderAction('buy');
     */
    static renderAction(action) {
        if (!action) return '<span class="badge badge-secondary">-</span>';
        
        const actionLower = action.toLowerCase();
        const isBuy = actionLower === 'buy' || actionLower === 'קנייה';
        const actionHebrew = isBuy ? 'קנייה' : 'מכירה';
        const actionClass = isBuy ? 'action-buy' : 'action-sell';
        
        return `<span class="badge ${actionClass}">${actionHebrew}</span>`;
    }

    /**
     * רנדור priority badge (עדיפות)
     * 
     * @param {string} priority - עדיפות (high, medium, low)
     * @returns {string} - HTML של ה-badge
     * 
     * @example
     * const html = FieldRendererService.renderPriority('high');
     */
    static renderPriority(priority) {
        if (!priority) return '<span class="badge badge-secondary">-</span>';
        
        // תרגום לעברית
        const priorityTranslations = {
            'high': 'גבוהה',
            'medium': 'בינונית',
            'low': 'נמוכה'
        };
        
        const priorityLower = priority.toLowerCase();
        const priorityHebrew = priorityTranslations[priorityLower] || priority;
        
        // קביעת class לפי עדיפות
        const priorityClass = priorityLower === 'high' ? 'badge-danger' : 
                             (priorityLower === 'medium' ? 'badge-warning' : 'badge-info');
        
        return `<span class="badge ${priorityClass}">${priorityHebrew}</span>`;
    }

    /**
     * Render linked object badge for tables
     * Displays icon + text with entity-colored background and clickable behavior
     * 
     * @param {string|number} relatedType - entity type string (e.g. 'trade') or numeric type id (1=account,2=trade,3=trade_plan,4=ticker)
     * @param {number|string} relatedId - related entity id
     * @param {string} displayName - optional user-friendly name (e.g., ticker symbol)
     * @returns {string} HTML of the linked object badge
     */
    static renderLinkedEntity(relatedType, relatedId, displayName = '', meta = null) {
        const type = this._resolveEntityType(relatedType);
        const label = this._getEntityHebrewLabel(type);
        const text = (typeof displayName === 'string' && displayName) ? displayName : label;

        // Select icon path by entity type (using existing icons set)
        const iconMap = {
            'trade': '/trading-ui/images/icons/trades.svg',
            'account': '/trading-ui/images/icons/trading_accounts.svg',
            'ticker': '/trading-ui/images/icons/tickers.svg',
            'alert': '/trading-ui/images/icons/alerts.svg',
            'cash_flow': '/trading-ui/images/icons/cash_flows.svg',
            'note': '/trading-ui/images/icons/notes.svg',
            'trade_plan': '/trading-ui/images/icons/trade_plans.svg',
            'execution': '/trading-ui/images/icons/executions.svg',
            'other': '/trading-ui/images/icons/home.svg',
        };

        const iconPath = iconMap[type] || iconMap['other'];
        const safeId = typeof relatedId === 'number' || (typeof relatedId === 'string' && relatedId) ? relatedId : '';

        // Click handler preference: showEntityDetails → openItemPage → viewLinkedItems
        const onclick = safeId !== ''
            ? `onclick="if (window.showEntityDetails) { showEntityDetails('${type}', ${safeId}); } else if (window.openItemPage) { openItemPage('${type}', ${safeId}); } else if (window.viewLinkedItems) { viewLinkedItems(${safeId}, '${type}'); } return false;"`
            : '';

        // Normalize meta param (support calling with meta as 3rd argument)
        const metaObj = (meta && typeof meta === 'object') ? meta : (displayName && typeof displayName === 'object' ? displayName : null);
        
        // Determine ticker to show: prefer meta.ticker; fallback to displayName for known types
        let tickerText = null;
        if (metaObj && metaObj.ticker) {
            tickerText = metaObj.ticker;
        } else if ((type === 'ticker' || type === 'trade' || type === 'trade_plan') && typeof displayName === 'string' && displayName) {
            tickerText = displayName;
        }

        // Format date dd.mm if exists
        let dateShort = '';
        if (metaObj && metaObj.date) {
            dateShort = (typeof FieldRendererService !== 'undefined' && FieldRendererService.renderDateShort)
                ? FieldRendererService.renderDateShort(metaObj.date)
                : FieldRendererService._formatDateDdMm(metaObj.date);
        }

        // Status HTML if exists
        let statusHtml = '';
        if (metaObj && metaObj.status) {
            statusHtml = (typeof FieldRendererService !== 'undefined' && FieldRendererService.renderStatus)
                ? FieldRendererService.renderStatus(metaObj.status, type)
                : `<span class="badge badge-secondary">${metaObj.status}</span>`;
        }

        // Compose new layout (RTL): [entity icon] | [symbol with date underneath] | [status]
        const centerHtml = `
            <span class="linked-object-center" aria-label="${label}">
                ${tickerText ? `<span class=\"linked-object-symbol\">${tickerText}</span>` : `<span class=\"linked-object-symbol\"></span>`}
                ${dateShort ? `<span class=\"linked-object-date\">${dateShort}</span>` : `<span class=\"linked-object-date\"></span>`}
            </span>`;

        return `
        <div class="linked-object-badge entity-${type}" role="link" tabindex="0" ${onclick} data-entity-type="${type}" data-entity-id="${safeId}">
            <span class="linked-object-kind"><img class="linked-object-icon" src="${iconPath}" alt="${label}"> <strong class="linked-object-type">${label}</strong></span>
            ${centerHtml}
            <span class="linked-object-status">${statusHtml}</span>
        </div>`;
    }

    // Backwards-compatible alias (generic naming enforced)
    static renderLinkedObject(relatedType, relatedId, displayName = '') {
        return this.renderLinkedEntity(relatedType, relatedId, displayName);
    }

    // ===== Private helpers =====
    static _resolveEntityType(relatedType) {
        if (typeof relatedType === 'string' && relatedType) {
            const raw = relatedType.toString().toLowerCase().replace(/[-\s]/g, '_');
            // Normalize synonyms → canonical
            const map = {
                'trading_account': 'account',
                'account': 'account',
                'trade': 'trade',
                'tradeplan': 'trade_plan',
                'trade_plan': 'trade_plan',
                'plan': 'trade_plan',
                'ticker': 'ticker',
                'symbol': 'ticker',
                'cashflow': 'cash_flow',
                'cash_flow': 'cash_flow',
                'alert': 'alert',
                'note': 'note',
                'execution': 'execution'
            };
            return map[raw] || raw || 'other';
        }
        if (typeof relatedType === 'number') {
            switch (relatedType) {
                case 1: return 'account';
                case 2: return 'trade';
                case 3: return 'trade_plan';
                case 4: return 'ticker';
                default: return 'other';
            }
        }
        return 'other';
    }

    static _getEntityHebrewLabel(type) {
        const map = {
            'trade': 'טרייד',
            'account': 'חשבון',
            'ticker': 'טיקר',
            'alert': 'התראה',
            'cash_flow': 'תזרים מזומנים',
            'note': 'הערה',
            'trade_plan': 'תוכנית',
            'execution': 'ביצוע',
            'other': 'אובייקט'
        };
        return map[type] || map['other'];
    }

    static _formatDateDdMm(date) {
        try {
            const d = new Date(date);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            return `${dd}.${mm}`;
        } catch (e) {
            return '';
        }
    }
    /**
     * רנדור תאריך בפורמט עברי
     * 
     * @param {string|Date} date - תאריך
     * @param {boolean} includeTime - לכלול שעה (אופציונלי)
     * @returns {string} - תאריך מעוצב
     * 
     * @example
     * const html = FieldRendererService.renderDate('2025-01-10');
     * const html2 = FieldRendererService.renderDate('2025-01-10T14:30:00', true);
     */
    static renderDate(date, includeTime = false) {
        if (!date) return '-';
        
        // אם יש date-utils.js - השתמש בו
        if (window.formatDate) {
            return window.formatDate(date, includeTime);
        }
        
        // Fallback
        try {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString('he-IL', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
        } catch (e) {
            return date;
        }
    }

    /**
     * Render short date dd.mm
     */
    static renderDateShort(date) {
        return this._formatDateDdMm(date);
    }

    /**
     * רנדור shares/quantity עם # prefix
     * 
     * @param {number} shares - כמות מניות
     * @param {string} cssClass - class נוסף (אופציונלי)
     * @returns {string} - HTML עם # prefix
     * 
     * @example
     * const html = FieldRendererService.renderShares(150);
     * // Output: '<span class="numeric-ltr">#150</span>'
     */
    static renderShares(shares, cssClass = 'numeric-ltr') {
        if (!shares || shares === 0) return '-';
        return `<span class="${cssClass}">#${shares}</span>`;
    }

    /**
     * רנדור בוליאני (כן/לא) עם איקונים
     * 
     * @param {boolean|string|number} value - ערך בוליאני (true, false, 1, 0, 'yes', 'no', 'כן', 'לא')
     * @param {string} size - גודל (sm, md, lg) - ברירת מחדל md
     * @returns {string} - HTML עם איקון
     * 
     * @example
     * const html = FieldRendererService.renderBoolean(true);
     * // Output: '<span class="text-success fw-bold">✓</span>'
     * 
     * const html2 = FieldRendererService.renderBoolean(false);
     * // Output: '<span class="text-danger fw-bold">✗</span>'
     */
    static renderBoolean(value, size = 'md') {
        // המרת ערכים שונים לבוליאני
        let isTrue = false;
        
        if (typeof value === 'boolean') {
            isTrue = value;
        } else if (typeof value === 'number') {
            isTrue = value === 1 || value > 0;
        } else if (typeof value === 'string') {
            const normalized = value.toLowerCase().trim();
            isTrue = normalized === 'true' || normalized === 'yes' || 
                     normalized === '1' || normalized === 'כן';
        }
        
        // קביעת איקון וclass
        const icon = isTrue ? '✓' : '✗';
        const baseClass = isTrue ? 'text-success' : 'text-danger';
        const sizeClass = size === 'lg' ? 'fs-4' : (size === 'sm' ? 'fs-6' : '');
        const classes = `${baseClass} ${sizeClass} fw-bold`.trim();
        
        return `<span class="${classes}">${icon}</span>`;
    }

    // ===== PRIVATE HELPER METHODS =====

    /**
     * תרגום סטטוס לעברית
     * @private
     */
    static _translateStatus(status, entityType) {
        // מערכות תרגום לפי סוג ישות
        const translators = {
            'account': window.translateAccountStatus,
            'trading_account': window.translateAccountStatus,
            'trade': window.translateTradeStatus,
            'alert': window.translateAlertStatus,
            'note': window.translateNoteStatus,
            'execution': window.translateExecutionStatus,
            'cash_flow': window.translateCashFlowStatus,
            'trade_plan': window.translateTradePlanStatus,
            'ticker': window.translateTickerStatus
        };
        
        const translator = translators[entityType];
        if (translator && typeof translator === 'function') {
            return translator(status);
        }
        
        // תרגום גנרי - רק סטטוסים סטנדרטיים
        const genericTranslations = {
            'open': 'פתוח',
            'closed': 'סגור',
            'cancelled': 'מבוטל',
            'canceled': 'מבוטל',
            'triggered': 'הופעל',
            'not_triggered': 'לא הופעל'
        };
        
        return genericTranslations[status.toLowerCase()] || status;
    }

}

// ===== EXPORT TO GLOBAL SCOPE =====

window.FieldRendererService = FieldRendererService;

// Shortcuts למתודות נפוצות
window.renderStatus = (status, entityType) => FieldRendererService.renderStatus(status, entityType);
window.renderSide = (side) => FieldRendererService.renderSide(side);
window.renderNumericValue = (value, suffix, showPrefix) => FieldRendererService.renderNumericValue(value, suffix, showPrefix);
window.renderPnL = (value, currency) => FieldRendererService.renderPnL(value, currency); // deprecated - use renderNumericValue
window.renderCurrency = (id, name, symbol) => FieldRendererService.renderCurrency(id, name, symbol);
window.renderType = (type) => FieldRendererService.renderType(type);
window.renderAction = (action) => FieldRendererService.renderAction(action);
window.renderPriority = (priority) => FieldRendererService.renderPriority(priority);
window.renderDate = (date, includeTime) => FieldRendererService.renderDate(date, includeTime);
window.renderShares = (shares, cssClass) => FieldRendererService.renderShares(shares, cssClass);
window.renderBoolean = (value, size) => FieldRendererService.renderBoolean(value, size);

console.log('✅ field-renderer-service.js v=1.3.0 loaded - added renderBoolean() for yes/no icons');
