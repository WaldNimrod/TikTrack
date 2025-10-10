/**
 * Field Renderer Service - TikTrack
 * =================================
 * 
 * מערכת מרכזית לרנדור שדות מורכבים: badges, currency, dates
 * מחליפה קוד חוזר ב-138 מקומות במערכת
 * 
 * @version 1.1.0
 * @created January 2025
 * @updated January 2025
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
        if (!status) return '<span class="badge badge-secondary">-</span>';
        
        // תרגום סטטוס לעברית
        const translatedStatus = this._translateStatus(status, entityType);
        
        // נרמול שם הסטטוס לclass
        const normalizedStatus = status.toLowerCase().replace('_', '-');
        
        // מיפוי לקטגוריית צבע
        let colorCategory = normalizedStatus;
        if (normalizedStatus === 'triggered') {
            colorCategory = 'warning';
        } else if (normalizedStatus === 'not-triggered') {
            colorCategory = 'info';
        }
        
        // יצירת HTML עם data-attribute לקטגוריית הצבע
        return `<span class="status-badge status-badge-${normalizedStatus}" data-status-category="${colorCategory}">
            ${translatedStatus}
        </span>`;
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
        
        // צבעים מההעדפות או fallback
        let color, bgColor, borderColor;
        
        if (window.getStatusColor && window.getStatusBackgroundColor) {
            color = isLong ? 
                window.getStatusColor('open', 'medium') : 
                window.getStatusColor('closed', 'medium');
            bgColor = isLong ? 
                window.getStatusBackgroundColor('open') : 
                window.getStatusBackgroundColor('closed');
            borderColor = color;
        } else {
            // Fallback colors
            if (isLong) {
                color = 'var(--numeric-positive-medium, #28a745)';
                bgColor = 'var(--numeric-positive-light, #d4edda)';
                borderColor = 'var(--numeric-positive-border, #c3e6cb)';
            } else {
                color = 'var(--numeric-negative-medium, #dc3545)';
                bgColor = 'var(--numeric-negative-light, #f8d7da)';
                borderColor = 'var(--numeric-negative-border, #f5c6cb)';
            }
        }
        
        return `<span class="side-badge side-${sideNormalized}" style="background-color: ${bgColor}; color: ${color}; border: 1px solid ${borderColor};">
            ${side}
        </span>`;
    }

    /**
     * רנדור ערך מספרי עם צבע לפי סימן (חיובי/שלילי/אפס)
     * מתאים לכל ערך מספרי: יתרות, רווח/הפסד, שינויים, וכו'
     * 
     * @param {number} value - ערך מספרי
     * @param {string} suffix - סיומת (מטבע, אחוז, וכו') - אופציונלי
     * @param {boolean} showPrefix - האם להציג + לערכים חיוביים
     * @returns {string} - HTML של ה-badge
     * 
     * @example
     * const html = FieldRendererService.renderNumericValue(123.45, ' $');
     * const html2 = FieldRendererService.renderNumericValue(-50.00, '%', true);
     */
    static renderNumericValue(value, suffix = '', showPrefix = true) {
        if (value === null || value === undefined) return '<span class="badge badge-secondary">-</span>';
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '<span class="badge badge-secondary">-</span>';
        
        const isPositive = numValue > 0;
        const isZero = numValue === 0;
        
        // צבעים
        let color, bgColor, borderColor, cssClass;
        
        if (isZero) {
            // אפס - אפור
            color = 'var(--numeric-neutral-medium, #6c757d)';
            bgColor = 'var(--numeric-neutral-light, #f8f9fa)';
            borderColor = 'var(--numeric-neutral-border, #dee2e6)';
            cssClass = 'neutral';
        } else if (isPositive) {
            // חיובי - ירוק
            color = 'var(--numeric-positive-medium, #28a745)';
            bgColor = 'var(--numeric-positive-light, #d4edda)';
            borderColor = 'var(--numeric-positive-border, #c3e6cb)';
            cssClass = 'positive';
        } else {
            // שלילי - אדום
            color = 'var(--numeric-negative-medium, #dc3545)';
            bgColor = 'var(--numeric-negative-light, #f8d7da)';
            borderColor = 'var(--numeric-negative-border, #f5c6cb)';
            cssClass = 'negative';
        }
        
        const displayValue = numValue.toFixed(2);
        const prefix = (showPrefix && isPositive) ? '+' : '';
        
        return `<span class="numeric-badge ${cssClass}" style="background-color: ${bgColor}; color: ${color}; border: 1px solid ${borderColor};">
            ${prefix}${displayValue}${suffix}
        </span>`;
    }

    /**
     * רנדור PnL badge (רווח/הפסד) - קיצור ל-renderNumericValue
     * @deprecated - השתמש ב-renderNumericValue במקום
     */
    static renderPnL(value, currency = '') {
        return this.renderNumericValue(value, currency, true);
    }

    /**
     * רנדור currency display (1 → US Dollar)
     * 
     * @param {number|string} currencyId - ID של המטבע
     * @param {string} currencyName - שם המטבע (אופציונלי)
     * @param {string} currencySymbol - סמל המטבע (אופציונלי)
     * @returns {string} - תצוגת מטבע
     * 
     * @example
     * const html = FieldRendererService.renderCurrency(1, 'US Dollar', 'USD');
     */
    static renderCurrency(currencyId, currencyName = null, currencySymbol = null) {
        // אם יש שם וסמל - הצג אותם
        if (currencyName && currencySymbol) {
            return `${currencyName} (${currencySymbol})`;
        }
        
        // אם יש רק שם - הצג אותו
        if (currencyName) {
            return currencyName;
        }
        
        // אם יש רק סמל - הצג אותו
        if (currencySymbol) {
            return currencySymbol;
        }
        
        // fallback - הצג את ה-ID
        return currencyId || '-';
    }

    /**
     * רנדור type badge (swing, investment, passive)
     * 
     * @param {string} type - סוג
     * @returns {string} - HTML של ה-badge
     * 
     * @example
     * const html = FieldRendererService.renderType('swing');
     */
    static renderType(type) {
        if (!type) return '<span class="badge badge-secondary">-</span>';
        
        const typeNormalized = type.toLowerCase();
        
        // מיפוי צבעים לפי סוג
        const colorMap = {
            'swing': { color: '#007bff', bg: 'rgba(0, 123, 255, 0.1)', border: '#007bff' },
            'investment': { color: '#28a745', bg: 'rgba(40, 167, 69, 0.1)', border: '#28a745' },
            'passive': { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)', border: '#6c757d' },
            'default': { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)', border: '#6c757d' }
        };
        
        const colors = colorMap[typeNormalized] || colorMap.default;
        
        // תרגום לעברית
        const typeTranslations = {
            'swing': 'סווינג',
            'investment': 'השקעה',
            'passive': 'פסיבי'
        };
        
        const displayType = typeTranslations[typeNormalized] || type;
        
        return `<span class="type-badge type-${typeNormalized}" style="background-color: ${colors.bg}; color: ${colors.color}; border: 1px solid ${colors.border};">
            ${displayType}
        </span>`;
    }

    /**
     * רנדור action badge (buy, sale)
     * 
     * @param {string} action - פעולה (buy, sale)
     * @returns {string} - HTML של ה-badge
     * 
     * @example
     * const html = FieldRendererService.renderAction('buy');
     */
    static renderAction(action) {
        if (!action) return '<span class="badge badge-secondary">-</span>';
        
        const actionNormalized = action.toLowerCase();
        const isBuy = actionNormalized === 'buy';
        
        // צבעים
        const color = isBuy ? '#28a745' : '#dc3545';
        const bgColor = isBuy ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)';
        const borderColor = color;
        
        // תרגום
        const displayAction = isBuy ? 'קניה' : 'מכירה';
        
        return `<span class="action-badge action-${actionNormalized}" style="background-color: ${bgColor}; color: ${color}; border: 1px solid ${borderColor};">
            ${displayAction}
        </span>`;
    }

    /**
     * רנדור priority badge (high, medium, low)
     * 
     * @param {string} priority - עדיפות (high, medium, low)
     * @returns {string} - HTML של ה-badge
     * 
     * @example
     * const html = FieldRendererService.renderPriority('high');
     */
    static renderPriority(priority) {
        if (!priority) return '<span class="badge badge-secondary">-</span>';
        
        const priorityNormalized = priority.toLowerCase();
        
        // מיפוי צבעים
        const colorMap = {
            'high': { color: '#dc3545', bg: 'rgba(220, 53, 69, 0.1)', border: '#dc3545' },
            'medium': { color: '#ffc107', bg: 'rgba(255, 193, 7, 0.1)', border: '#ffc107' },
            'low': { color: '#28a745', bg: 'rgba(40, 167, 69, 0.1)', border: '#28a745' },
            'default': { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)', border: '#6c757d' }
        };
        
        const colors = colorMap[priorityNormalized] || colorMap.default;
        
        // תרגום
        const priorityTranslations = {
            'high': 'גבוהה',
            'medium': 'בינונית',
            'low': 'נמוכה'
        };
        
        const displayPriority = priorityTranslations[priorityNormalized] || priority;
        
        return `<span class="priority-badge priority-${priorityNormalized}" style="background-color: ${colors.bg}; color: ${colors.color}; border: 1px solid ${colors.border};">
            ${displayPriority}
        </span>`;
    }

    /**
     * רנדור תאריך (עם או בלי שעה)
     * משתמש ב-date-utils.js הקיים
     * 
     * @param {string|Date} date - תאריך
     * @param {boolean} includeTime - האם לכלול שעה
     * @returns {string} - תאריך מפורמט
     * 
     * @example
     * const html = FieldRendererService.renderDate('2025-01-09T10:30:00', true);
     */
    static renderDate(date, includeTime = false) {
        if (!date) return '-';
        
        // שימוש במערכת date-utils.js הקיימת
        if (includeTime && typeof window.formatDateTime === 'function') {
            return window.formatDateTime(date);
        } else if (typeof window.formatDate === 'function') {
            return window.formatDate(date);
        }
        
        // Fallback
        try {
            const dateObj = new Date(date);
            if (includeTime) {
                return dateObj.toLocaleString('he-IL');
            }
            return dateObj.toLocaleDateString('he-IL');
        } catch (e) {
            return date;
        }
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

    /**
     * קבלת צבעים דינמיים לסטטוס
     * @private
     */
    static _getStatusColors(status) {
        const normalizedStatus = status.toLowerCase();
        
        // מיפוי סטטוסים מיוחדים לסטטוסים סטנדרטיים
        let mappedStatus = normalizedStatus;
        if (normalizedStatus === 'triggered') {
            mappedStatus = 'warning'; // צבע אזהרה
        } else if (normalizedStatus === 'not_triggered') {
            mappedStatus = 'info'; // צבע מידע
        } else if (normalizedStatus === 'canceled') {
            mappedStatus = 'cancelled'; // נרמול איות
        }
        
        // ניסיון לקבל מהעדפות משתמש עם הווריאנטים
        if (window.getStatusColor && typeof window.getStatusColor === 'function') {
            return {
                color: window.getStatusColor(mappedStatus, 'medium'),
                bgColor: window.getStatusColor(mappedStatus, 'light'),
                borderColor: window.getStatusColor(mappedStatus, 'border')
            };
        }
        
        // Fallback colors עם 3 ווריאנטים
        const fallbackColors = {
            'open': { color: '#28a745', bg: '#d4edda', border: '#c3e6cb' },
            'closed': { color: '#6c757d', bg: '#e2e3e5', border: '#d6d8db' },
            'cancelled': { color: '#dc3545', bg: '#f8d7da', border: '#f5c6cb' },
            'warning': { color: '#ffc107', bg: '#fff3cd', border: '#ffeaa7' },
            'info': { color: '#17a2b8', bg: '#d1ecf1', border: '#bee5eb' },
            'default': { color: '#6c757d', bg: '#e2e3e5', border: '#d6d8db' }
        };
        
        const colors = fallbackColors[mappedStatus] || fallbackColors.default;
        return { color: colors.color, bgColor: colors.bg, borderColor: colors.border };
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

console.log('✅ FieldRendererService loaded successfully');

