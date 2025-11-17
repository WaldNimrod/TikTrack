/**
 * Field Renderer Service - TikTrack
 * =================================
 * 
 * מערכת מרכזית לרנדור שדות מורכבים: badges, currency, dates
 * מחליפה קוד חוזר ב-138 מקומות במערכת
 * 
 * @version 1.4.0
 * @created January 2025
 * @updated October 13, 2025 - Added renderBoolean() for yes/no icons
 * @updated January 21, 2025 - Added renderTickerInfo() for ticker price display
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
 * - רנדור פרטי טיקר (מחיר, שינוי, נפח) בשורה אחת
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

        if (entityType === 'import_session') {
            if (statusLower === 'completed' || statusLower === 'importing') {
                category = 'open';
            } else if (statusLower === 'ready' || statusLower === 'analyzing') {
                category = 'closed';
            } else if (statusLower === 'failed') {
                category = 'cancelled';
            }
        }
        
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
        // Use arrow icons instead of text - up arrow for long (positive), down arrow for short (negative)
        const sideIcon = isLong ? '↑' : '↓';
        const sideClass = isLong ? 'badge-long' : 'badge-short';
        
        return `<span class="badge ${sideClass}" title="${isLong ? 'לונג' : 'שורט'}">${sideIcon}</span>`;
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
     * // Output: '<span class="numeric-value-positive" dir="ltr">+5.20%</span>'
     */
    static renderNumericValue(value, suffix = '', showPrefix = false) {
        if (value === null || value === undefined || value === '' || isNaN(value)) {
            return '<span class="numeric-value-zero">-</span>';
        }

        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        const cssClass = numValue > 0 ? 'numeric-value-positive' : (numValue < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
        const absoluteValue = Math.abs(numValue);
        const formattedValue = absoluteValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        let sign = '';
        if (numValue < 0) {
            sign = '-';
        } else if (numValue > 0 && showPrefix) {
            sign = '+';
        }

        const suffixText = suffix || '';
        const base = `${formattedValue}${suffixText}`;
        const display = sign ? `${sign}${base}` : base;

        return `<span class="${cssClass}" dir="ltr">${display}</span>`;
    }

    /**
     * Legacy alias לשם הישן renderNumericBadge
     * שומר על תאימות אחורה לבדיקות וכלים קיימים
     */
    static renderNumericBadge(value, suffix = '', showPrefix = true) {
        return this.renderNumericValue(value, suffix, showPrefix);
    }

    /**
     * Render duration since last update with optional tooltip
     * @param {Date|string|object} value
     * @param {Object} options
     * @param {string} options.fallback
     * @param {string} options.format
     * @param {boolean} options.includeSeconds
     * @param {boolean} options.showAbsolute
     * @returns {string}
     */
    static renderUpdatedTimestamp(value, options = {}) {
        const {
            fallback = 'לא זמין',
            format = 'dhm',
            includeSeconds = false,
            showAbsolute = true
        } = options || {};

        let candidate = value;
        if (typeof window.ensureDateEnvelope === 'function') {
            const envelope = window.ensureDateEnvelope(value);
            if (envelope) {
                candidate = envelope;
            }
        }

        // Use window.dateUtils.toDateObject (window.toDateObject doesn't exist)
        const dateObj = (window.dateUtils && typeof window.dateUtils.toDateObject === 'function')
            ? window.dateUtils.toDateObject(candidate)
            : (value instanceof Date ? value : new Date(value));

        if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
            return `<span class="updated-value-empty">${fallback}</span>`;
        }

        const durationDisplay = typeof window.getDurationSince === 'function'
            ? window.getDurationSince(dateObj, { format, includeSeconds, fallback: null })
            : null;

        const absoluteDisplay = typeof window.formatDateTime === 'function'
            ? window.formatDateTime(dateObj)
            : dateObj.toLocaleString('he-IL');

        const content = durationDisplay || absoluteDisplay || fallback;
        const titleAttr = showAbsolute && absoluteDisplay ? ` title="${absoluteDisplay}"` : '';

        return `<span class="updated-value" dir="ltr"${titleAttr}>${content}</span>`;
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
        const normalizedSymbol = this._normalizeCurrencySymbol(symbol);
        const displayText = normalizedSymbol || name || id;
        const title = name || symbol || '';
        return `<span class="currency-display" title="${title}">${displayText}</span>`;
    }

    /**
     * רנדור נפח במיליונים עם פסיקים
     * 
     * @param {number|string} volume - הנפח
     * @param {boolean} showMillions - להציג במיליונים (ברירת מחדל true)
     * @returns {string} - HTML מעוצב
     * 
     * @example
     * const html = FieldRendererService.renderVolume(1500000);
     * // Output: '<span class="volume-display">1.5M</span>'
     */
    static renderVolume(volume, showMillions = true) {
        if (!volume || volume === 'N/A' || isNaN(volume)) {
            return '<span class="volume-display">-</span>';
        }
        
        const numVolume = parseFloat(volume);
        if (numVolume === 0) return '<span class="volume-display">0</span>';
        
        if (showMillions) {
            // המרה למיליונים
            const millions = numVolume / 1000000;
            const formatted = millions.toLocaleString('he-IL', { maximumFractionDigits: 1 });
            return `<span class="volume-display" title="נפח: ${numVolume.toLocaleString('he-IL')}">${formatted}M</span>`;
        } else {
            // פורמט רגיל עם פסיקים
            const formatted = numVolume.toLocaleString('he-IL');
            return `<span class="volume-display">${formatted}</span>`;
        }
    }

    /**
     * רנדור סכום עם מטבע (RTL: סימן משמאל למספר)
     * 
     * @param {number} value - ערך מספרי
     * @param {string} currencySymbol - סמל מטבע ($, ₪, €)
     * @param {number} decimals - מספר ספרות אחרי נקודה (ברירת מחדל 2)
     * @returns {string} - HTML עם סימן משמאל למספר (RTL)
     * 
     * @example
     * const html = FieldRendererService.renderAmount(1234.56, '$');
     * // Output: '<span class="numeric-value-positive" dir="ltr">+$1,234.56</span>'
     */
    static renderAmount(value, currencySymbol = '$', decimals = 0, showSign = true) {
        if (value === null || value === undefined || value === '') {
            return '-';
        }

        const numValue = Number(value);
        if (Number.isNaN(numValue)) {
            return '<span class="numeric-value-zero">-</span>';
        }

        const absoluteValue = Math.abs(numValue);
        const formattedValue = absoluteValue.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });

        const symbol = this._normalizeCurrencySymbol(currencySymbol) || '';
        const base = `${symbol}${formattedValue}`;

        let sign = '';
        if (numValue < 0) {
            sign = '-';
        } else if (showSign && numValue > 0) {
            sign = '+';
        }

        const colorClass = numValue > 0 ? 'numeric-value-positive' : (numValue < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
        const display = sign ? `${sign}${base}` : base;

        return `<span class="${colorClass}" dir="ltr">${display}</span>`;
    }

    static _normalizeCurrencySymbol(symbol) {
        if (!symbol) return '';
        const trimmed = String(symbol).trim();
        if (!trimmed) return '';

        const map = {
            'USD': '$',
            'ILS': '₪',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'AUD': 'A$',
            'CAD': 'C$',
            'CHF': 'CHF',
            'CNY': '¥',
            'HKD': 'HK$',
            'INR': '₹'
        };

        if (trimmed.length === 1 || /[^A-Za-z]/.test(trimmed)) {
            return trimmed;
        }

        const upper = trimmed.toUpperCase();
        return map[upper] || trimmed;
    }

    /**
     * רנדור type badge (סוג השקעה)
     * 
     * @param {string} type - סוג (swing, investment, passive)
     * @param {number|null} amountForColor - סכום לקביעת צבע (חיובי/שלילי), אופציונלי
     * @returns {string} - HTML של ה-badge
     * 
     * @example
     * const html = FieldRendererService.renderType('swing');
     * const htmlColored = FieldRendererService.renderType('deposit', 100); // ירוק
     */
    static renderType(type, amountForColor = null) {
        if (!type) return '<span class="badge badge-secondary">-</span>';
        
        // תרגום לעברית
        const typeTranslations = {
            'swing': 'סווינג',
            'investment': 'השקעה',
            'passive': 'פסיבי',
            'deposit': 'הפקדה',
            'withdrawal': 'משיכה',
            'fee': 'עמלה',
            'dividend': 'דיבידנד',
            'transfer_in': 'העברה פנימה',
            'transfer_out': 'העברה החוצה',
            'currency_exchange_from': 'המרת מט״ח - יציאה',
            'currency_exchange_to': 'המרת מט״ח - כניסה',
            'other_positive': 'אחר חיובי',
            'other_negative': 'אחר שלילי',
            'opening_balance': 'יתרת פתיחה',
            // Execution actions (buy/sell)
            'buy': 'קנייה',
            'sell': 'מכירה',
            'sale': 'מכירה'
        };
        
        const typeLower = type.toLowerCase();
        const typeHebrew = typeTranslations[typeLower] || type;
        
        // קביעת צבע לפי amount אם סופק
        let colorClass = '';
        if (amountForColor !== null && amountForColor !== undefined) {
            colorClass = amountForColor >= 0 ? ' text-success' : ' text-danger';
        } else {
            const positiveTypes = new Set([
                'deposit',
                'dividend',
                'transfer_in',
                'other_positive',
                'opening_balance',
                'currency_exchange_to'
            ]);
            const negativeTypes = new Set([
                'withdrawal',
                'fee',
                'transfer_out',
                'other_negative',
                'currency_exchange_from'
            ]);
            if (positiveTypes.has(typeLower)) {
                colorClass = ' text-success';
            } else if (negativeTypes.has(typeLower)) {
                colorClass = ' text-danger';
            }
        }
        
        return `<span class="badge badge-type badge-capsule${colorClass}" data-type="${typeLower}">${typeHebrew}</span>`;
    }

    /**
     * Render currency exchange badge
     * @param {Object} meta - Exchange metadata
     * @returns {string} badge HTML
     */
    static renderExchangeBadge(meta = {}) {
        // Per requirement: do not render an exchange badge in the table (or anywhere)
        return '';

    }

    /**
     * Render stacked cards for currency exchange pair
     * @param {Object} summary - Pair summary metadata
     * @param {Object} options - Rendering options
     * @param {number|string} options.currentId - Current cash flow ID (to highlight)
     * @param {Function} options.renderAction - Callback to render action buttons per flow
     * @returns {string} HTML string
     */
    static renderExchangePairCards(summary, options = {}) {
        if (!summary) {
            return '';
        }

        const currentId = options.currentId !== undefined && options.currentId !== null
            ? Number(options.currentId)
            : null;
        const renderAction = typeof options.renderAction === 'function'
            ? options.renderAction
            : () => '';

        const formatAmount = (value, symbol) => {
            const numericValue = typeof value === 'number' ? value : parseFloat(value);
            if (!Number.isFinite(numericValue)) {
                return '<span class="text-muted">לא זמין</span>';
            }
            return this.renderAmount(numericValue, symbol || '', 2, true);
        };

        const formatDate = (raw) => {
            if (!raw) {
                return 'לא זמין';
            }
            try {
                const date = new Date(raw);
                if (Number.isNaN(date.getTime())) {
                    return raw;
                }
                return date.toLocaleString('he-IL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                return raw;
            }
        };

        const renderCard = (flowData = {}, direction = 'from') => {
            const isFrom = direction === 'from';
            const title = isFrom ? 'צד שלילי - מטבע מקור' : 'צד חיובי - מטבע יעד';
            const amountValue = flowData.raw_amount !== undefined
                ? flowData.raw_amount
                : (isFrom ? -(flowData.amount || 0) : (flowData.amount || 0));
            const amountHtml = formatAmount(amountValue, flowData.currency_symbol);
            const currencyHtml = this.renderCurrency(
                flowData.currency_id,
                flowData.currency_name,
                flowData.currency_symbol || ''
            );
            const dateText = formatDate(flowData.date);
            const actionHtml = renderAction(flowData, direction) || '';
            const isCurrent = flowData.id !== undefined && currentId !== null && Number(flowData.id) === currentId;
            const badgeHtml = flowData.id
                ? `<span class="badge ${isCurrent ? 'bg-secondary' : 'bg-info'} ms-2">
                        ${isCurrent ? 'רשומה נוכחית' : 'רשומה צמודה'}
                   </span>`
                : '';

            return `
                <div class="card exchange-pair-card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                            <div class="fw-bold">${title}${badgeHtml}</div>
                            ${actionHtml}
                        </div>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <div class="text-muted small">סכום</div>
                                ${amountHtml}
                            </div>
                            <div class="col-md-4">
                                <div class="text-muted small">מטבע</div>
                                ${currencyHtml || '<span class="text-muted">לא זמין</span>'}
                            </div>
                            <div class="col-md-4">
                                <div class="text-muted small">תאריך</div>
                                <span class="text-muted" dir="ltr">${dateText}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };

        const fromCard = renderCard(summary.from, 'from');
        const toCard = renderCard(summary.to, 'to');

        const exchangeRateDisplay = Number.isFinite(summary.exchange_rate)
            ? `<span dir="ltr">${summary.exchange_rate.toFixed(6)}</span>`
            : '<span class="text-muted">לא זמין</span>';
        const feeHtml = summary.fee_amount !== undefined
            ? formatAmount(summary.fee_amount, summary.fee_currency_symbol)
            : '<span class="text-muted">לא זמין</span>';
        const netOutValue = summary.net_out_account_currency !== undefined
            ? -Math.abs(Number(summary.net_out_account_currency) || 0)
            : null;
        const netInValue = summary.net_in_target_currency !== undefined
            ? Math.abs(Number(summary.net_in_target_currency) || 0)
            : null;
        const netOutHtml = netOutValue !== null
            ? formatAmount(netOutValue, summary.fee_currency_symbol)
            : '<span class="text-muted">לא זמין</span>';
        const netInHtml = netInValue !== null
            ? formatAmount(netInValue, (summary.to && summary.to.currency_symbol) || '')
            : '<span class="text-muted">לא זמין</span>';

        const footer = `
            <div class="card exchange-pair-summary">
                <div class="card-body">
                    <div class="row g-3 align-items-center">
                        <div class="col-md-3">
                            <div class="text-muted small">שער המרה</div>
                            ${exchangeRateDisplay}
                        </div>
                        <div class="col-md-3">
                            <div class="text-muted small">עמלה</div>
                            ${feeHtml}
                        </div>
                        <div class="col-md-3">
                            <div class="text-muted small">נטו במטבע חשבון</div>
                            ${netOutHtml}
                        </div>
                        <div class="col-md-3">
                            <div class="text-muted small">נטו במטבע יעד</div>
                            ${netInHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        return `
            <div class="cash-flow-exchange-pair-cards">
                ${fromCard}
                ${toCard}
                ${footer}
            </div>
        `;
    }

    /**
     * רנדור action badge (פעולה: קנייה/מכירה)
     * 
     * @param {string} action - פעולה (buy, sale, sell)
     * @param {number|null} amountForColor - סכום לקביעת צבע (חיובי/שלילי), אופציונלי
     * @returns {string} - HTML של ה-badge (עיצוב זהה ל-renderType)
     * 
     * @example
     * const html = FieldRendererService.renderAction('buy');
     * const htmlColored = FieldRendererService.renderAction('sell', -100); // שלילי
     */
    static renderAction(action, amountForColor = null) {
        if (!action) return '<span class="badge badge-secondary">-</span>';
        
        const actionLower = action.toLowerCase();
        const isBuy = actionLower === 'buy' || actionLower === 'קנייה';
        const actionHebrew = isBuy ? 'קנייה' : 'מכירה';
        
        // קביעת צבע לפי amount אם סופק, אחרת לפי סוג פעולה (buy = שלילי בדרך כלל, sell = חיובי)
        let colorClass = '';
        if (amountForColor !== null && amountForColor !== undefined) {
            colorClass = amountForColor >= 0 ? ' text-success' : ' text-danger';
        } else {
            // ברירת מחדל: buy = שלילי (יוצא כסף), sell = חיובי (נכנס כסף)
            colorClass = isBuy ? ' text-danger' : ' text-success';
        }
        
        // שימוש באותו עיצוב כמו renderType - badge-type badge-capsule
        return `<span class="badge badge-type badge-capsule${colorClass}" data-type="${actionLower}">${actionHebrew}</span>`;
    }

    /**
     * רנדור טקסט מקוצר (Preview) להצגה בטבלאות
     *
     * @param {string} value - תוכן HTML או טקסט חופשי
     * @param {Object} [options]
     * @param {number} [options.maxLength=20] - אורך מקסימלי לפני קיצור
     * @param {string} [options.emptyPlaceholder='-'] - טקסט חלופי כשהתוכן ריק
     * @param {boolean} [options.tooltip=true] - האם להציג title עם הטקסט המלא
     * @param {boolean} [options.sanitize=true] - האם להשתמש ב-DOMPurify (אם זמין)
     * @param {string} [options.className=''] - מחלקות CSS נוספות ל-span
     * @returns {string} HTML של התצוגה המקוצרת
     */
    static renderTextPreview(value, options = {}) {
        const {
            maxLength = 20,
            emptyPlaceholder = '-',
            tooltip = true,
            sanitize = true,
            className = ''
        } = options || {};

        const spanClass = className ? `text-truncate-preview ${className}` : 'text-truncate-preview';

        if (value === null || value === undefined || value === '') {
            const placeholderEscaped = this._escapeHtml(emptyPlaceholder);
            return `<span class="${spanClass}">${placeholderEscaped}</span>`;
        }

        let source = String(value);

        if (sanitize && typeof window !== 'undefined' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
            try {
                source = window.DOMPurify.sanitize(source, {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span'],
                    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'dir'],
                    ALLOW_DATA_ATTR: false
                });
            } catch (error) {
                console.warn('⚠️ FieldRendererService.renderTextPreview: DOMPurify sanitize failed', error);
            }
        }

        const plainText = this._toPlainText(source);

        if (!plainText) {
            const placeholderEscaped = this._escapeHtml(emptyPlaceholder);
            return `<span class="${spanClass}">${placeholderEscaped}</span>`;
        }

        let displayText = plainText;
        if (typeof maxLength === 'number' && maxLength > 0 && plainText.length > maxLength) {
            displayText = `${plainText.substring(0, maxLength).trimEnd()}…`;
        }

        const escapedDisplay = this._escapeHtml(displayText);
        const titleAttr = tooltip ? ` title="${this._escapeHtml(plainText)}"` : '';

        return `<span class="${spanClass}" data-max-length="${maxLength}"${titleAttr}>${escapedDisplay}</span>`;
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
        
        // Check if short format is requested
        const isShort = meta && meta.short === true;

        // Select icon path by entity type (using existing icons set)
        const iconMap = {
            'trade': '/trading-ui/images/icons/trades.svg',
            'trading_account': '/trading-ui/images/icons/trading_accounts.svg',
            'ticker': '/trading-ui/images/icons/tickers.svg',
            'alert': '/trading-ui/images/icons/alerts.svg',
            'cash_flow': '/trading-ui/images/icons/cash_flows.svg',
            'note': '/trading-ui/images/icons/notes.svg',
            'trade_plan': '/trading-ui/images/icons/trade_plans.svg',
            'execution': '/trading-ui/images/icons/executions.svg',
            'default': '/trading-ui/images/icons/home.svg',
        };

        const iconPath = iconMap[type] || iconMap['default'];
        const safeId = typeof relatedId === 'number' || (typeof relatedId === 'string' && relatedId) ? relatedId : '';

        // Click handler preference: showEntityDetails → openItemPage → viewLinkedItems
        const onclick = safeId !== ''
            ? `onclick="if (window.showEntityDetails) { showEntityDetails('${type}', ${safeId}); } else if (window.openItemPage) { openItemPage('${type}', ${safeId}); } else if (window.viewLinkedItems) { viewLinkedItems(${safeId}, '${type}'); } return false;"`
            : '';

        // Normalize meta param (support calling with meta as 3rd argument)
        const metaObj = (meta && typeof meta === 'object') ? meta : (displayName && typeof displayName === 'object' ? displayName : null);
        const renderMode = metaObj && typeof metaObj.renderMode === 'string' ? metaObj.renderMode : null;

        let dateShort = '';
        if (metaObj && metaObj.date) {
            const dateValue = metaObj.date;
            dateShort = (typeof FieldRendererService !== 'undefined' && FieldRendererService.renderDateShort)
                ? FieldRendererService.renderDateShort(dateValue)
                : FieldRendererService._formatDateDdMm(dateValue);
        }

        if (renderMode === 'notes-table') {
            const entityColor = (typeof window !== 'undefined' && window.getEntityColor && typeof window.getEntityColor === 'function')
                ? window.getEntityColor(type)
                : '';

            const escapedName = this._escapeHtml(text);
            const titleStyle = entityColor ? ` style="color: ${entityColor};"` : '';
            const typeLabel = this._escapeHtml(label);
            const dateText = dateShort ? `<span class="linked-object-card-date">${this._escapeHtml(dateShort)}</span>` : '';

            const badges = [];
            if (metaObj && metaObj.status) {
                badges.push(FieldRendererService.renderStatus(metaObj.status, type));
            }
            if (metaObj && metaObj.side) {
                badges.push(FieldRendererService.renderSide(metaObj.side));
            }
            if (metaObj && metaObj.investment_type) {
                badges.push(FieldRendererService.renderType(metaObj.investment_type));
            }

            const badgesHtml = badges.filter(Boolean).join('');

            return `
            <div class="linked-object-card notes-linked-object" role="link" tabindex="0" ${onclick} data-entity-type="${type}" data-entity-id="${safeId}">
                <div class="linked-object-card-icon">
                    <img src="${iconPath}" alt="${this._escapeHtml(label)}" class="linked-object-card-icon-img" width="60" height="60" />
                </div>
                <div class="linked-object-card-content">
                    <div class="linked-object-card-title"${titleStyle}>
                        <span class="linked-object-card-type">${typeLabel}</span>
                        <span class="linked-object-card-name">${escapedName}</span>
                        ${dateText}
                    </div>
                    <div class="linked-object-card-meta">
                        ${badgesHtml || ''}
                    </div>
                </div>
            </div>`;
        }

        if (renderMode === 'linked-items-table') {
            const escapedLabel = this._escapeHtml(label);
            const escapedText = this._escapeHtml(text);
            const entityColorClass = `entity-${type}`;
            return `
            <a href="#" class="linked-items-table-link text-decoration-none d-flex align-items-center gap-2" role="link" tabindex="0" ${onclick} data-entity-type="${type}" data-entity-id="${safeId}">
                <span class="linked-items-table-icon ${entityColorClass}">
                    <img src="${iconPath}" alt="${escapedLabel}" class="linked-items-table-icon-image" />
                </span>
                <span class="linked-items-table-text d-flex flex-column align-items-start gap-1">
                    <span class="linked-items-table-label fw-semibold text-body">${escapedLabel}</span>
                    <span class="linked-items-table-name text-muted small">${escapedText}</span>
                </span>
            </a>`;
        }

        // Determine center content
        // 1) For account: show account name (displayName/meta.name), no date
        // 2) For other types: ticker symbol (meta.ticker or displayName for ticker/trade/trade_plan) + date if exists
        let tickerText = null;
        if (metaObj && metaObj.ticker) {
            tickerText = metaObj.ticker;
        } else if ((type === 'ticker' || type === 'trade' || type === 'trade_plan') && typeof displayName === 'string' && displayName) {
            tickerText = displayName;
        }

        // For account override: use name in symbol slot, hide date
        if (type === 'account') {
            const accountName = (typeof displayName === 'string' && displayName)
                ? displayName
                : (metaObj && typeof metaObj.name === 'string' ? metaObj.name : '');
            tickerText = accountName || '';
            dateShort = '';
        }
        
        // For trade_plan: use planned amount instead of ticker symbol
        if (type === 'trade_plan') {
            if (metaObj && metaObj.planned_amount) {
                tickerText = `$${Number(metaObj.planned_amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            } else if (typeof displayName === 'string' && displayName) {
                tickerText = displayName;
            }
            // Show only day and month for trade plans
            if (metaObj && metaObj.date) {
                const dateValue = metaObj.date;
                dateShort = (typeof FieldRendererService !== 'undefined' && FieldRendererService.renderDateShort)
                    ? FieldRendererService.renderDateShort(dateValue)
                    : FieldRendererService._formatDateDdMm(dateValue);
            }
        }
        
        // Short format: return simple text without full badge structure
        if (isShort) {
            if (type === 'trade_plan') {
                console.log('🔍 renderLinkedEntity DEBUG:', { metaObj, planned_amount: metaObj?.planned_amount, date: metaObj?.date });
                const amount = metaObj && metaObj.planned_amount ? `$${Number(metaObj.planned_amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '';
                // Force DD/MM format for testing
                const dateValue = metaObj && metaObj.date ? metaObj.date : null;
                const date = dateValue ? FieldRendererService._formatDateDdMm(dateValue) : '';
                console.log('🔍 renderLinkedEntity RESULT:', { amount, date, result: `${amount} ${date}`.trim() });
                return `<a href="#" onclick="if (window.showEntityDetails) { showEntityDetails('trade_plan', ${relatedId}); } return false;" class="plan-link" data-plan-id="${relatedId}">${amount} ${date}</a>`.trim();
            }
            // For other types, return simple text
            return `<a href="#" onclick="if (window.showEntityDetails) { showEntityDetails('${type}', ${relatedId}); } return false;" class="linked-entity-short">${text}</a>`;
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
                ${dateShort ? `<span class=\"linked-object-date\">${dateShort}</span>` : ``}
            </span>`;

        return `
        <div class="linked-object-badge entity-${type}" role="link" tabindex="0" ${onclick} data-entity-type="${type}" data-entity-id="${safeId}">
            <span class="linked-object-kind">
                <span class="linked-object-kind-icon"><img class="linked-object-icon" src="${iconPath}" alt="${label}"></span>
                <span class="linked-object-kind-title"><strong class="linked-object-type">${label}</strong></span>
            </span>
            ${centerHtml}
            <span class="linked-object-status">${statusHtml}</span>
        </div>`;
    }

    /**
     * Render attachment preview and download link
     * 
     * @param {Object|string} attachmentInput - attachment path or object with attachment data
     * @param {Object} options - rendering options
     * @returns {Object} - rendering fragments (hasAttachment, previewHtml, linkHtml, metaHtml, etc.)
     */
    static renderAttachment(attachmentInput, options = {}) {
        const normalized = this._normalizeAttachmentInput(attachmentInput, options);
        if (!normalized.attachmentPath) {
            return {
                hasAttachment: false,
                previewHtml: '',
                linkHtml: '',
                metaHtml: '',
                extensionBadgeHtml: '',
                downloadUrl: '',
                meta: null,
                fileName: '',
                attachmentPath: ''
            };
        }

        const { meta, downloadUrl, fileName } = normalized;
        const previewMaxHeight = Number(options.previewMaxHeight || options.imageMaxHeight || 220);
        const pdfHeight = Number(options.pdfHeight || 240);
        const previewEnabled = options.preview !== false;

        let previewHtml = '';
        if (previewEnabled) {
            if (meta.isImage) {
                const previewTitle = this._escapeHtml(meta.displayName || fileName);
                previewHtml = `
                    <div class="${options.imagePreviewWrapperClass || 'attachment-preview-image border rounded bg-light p-2 text-center mb-2'}">
                        <button type="button"
                                class="${options.imagePreviewButtonClass || 'attachment-preview-button border-0 bg-transparent p-0 w-100'}"
                                data-attachment-preview="image"
                                data-preview-src="${downloadUrl}"
                                data-preview-title="${previewTitle}"
                                aria-label="הצגת ${previewTitle} בתצוגה מוגדלת"
                                style="cursor: zoom-in;">
                            <img src="${downloadUrl}" alt="${previewTitle}" class="${options.imageClass || 'img-fluid rounded'}" style="max-height: ${previewMaxHeight}px; object-fit: contain;" loading="lazy" decoding="async" />
                        </button>
                    </div>
                `;
            } else if (meta.isPdf) {
                const previewTitle = this._escapeHtml(meta.displayName || fileName);
                const pdfButtonClass = options.pdfPreviewButtonClass || 'attachment-preview-pdf-button btn btn-outline-secondary w-100 text-start d-flex align-items-center justify-content-between gap-3';
                const pdfIcon = `<span class="${options.iconClass || 'fs-5'}">${meta.icon}</span>`;
                previewHtml = `
                    <div class="${options.pdfPreviewWrapperClass || 'attachment-preview-pdf border rounded bg-light p-2 mb-2'}">
                        <button type="button"
                                class="${pdfButtonClass}"
                                data-attachment-preview="pdf"
                                data-preview-src="${downloadUrl}"
                                data-preview-title="${previewTitle}"
                                data-preview-mime="application/pdf"
                                aria-label="הצגת ${previewTitle} בתצוגה מוגדלת">
                            <span class="d-flex align-items-center gap-2">
                                ${pdfIcon}
                                <span class="attachment-preview-label" dir="auto">לחץ לפתיחה</span>
                            </span>
                        </button>
                    </div>
                `;
            } else if (typeof options.customPreview === 'function') {
                previewHtml = options.customPreview({ downloadUrl, meta, fileName, attachmentPath: normalized.attachmentPath }) || '';
            }
        }

        const iconClass = options.iconClass || 'fs-5';
        const linkClass = options.linkClass || 'attachment-file-link d-inline-flex align-items-center gap-2 text-break fw-semibold';
        const titleAttr = this._escapeHtml(meta.displayName || fileName);
        const downloadAttr = options.download === false ? '' : ` download="${this._escapeHtml(fileName)}"`;
        const targetAttr = options.openInSameTab ? '' : ' target="_blank" rel="noopener"';
        const labelStrategy = options.labelStrategy || 'label';
        let linkLabel = meta.label || fileName;
        if (labelStrategy === 'full') {
            linkLabel = meta.displayName || fileName;
        } else if (labelStrategy === 'short') {
            linkLabel = meta.tableStyleLabel || meta.label || fileName;
        }

        const iconHtml = `<span class="${iconClass}">${meta.icon}</span>`;
        const linkHtml = `
            <a href="${downloadUrl}"${targetAttr} class="${linkClass}"${downloadAttr} title="${titleAttr}">
                ${iconHtml}
                <span class="attachment-file-name" dir="auto">${this._escapeHtml(linkLabel)}</span>
            </a>
        `;

        const extensionBadgeHtml = (options.showExtension === false || !meta.extension)
            ? ''
            : `<span class="${options.extensionBadgeClass || 'badge bg-light text-dark attachment-extension-badge'}">${this._escapeHtml(meta.extension.toUpperCase())}</span>`;

        const metaWrapperClass = options.metaWrapperClass || 'attachment-meta d-flex align-items-center gap-2 flex-wrap';
        const metaHtml = `
            <div class="${metaWrapperClass}">
                ${linkHtml}
                ${extensionBadgeHtml}
            </div>
        `;

        const containerClass = options.containerClass || 'attachment-display';
        const containerHtml = options.withContainer === false
            ? ''
            : `
                <div class="${containerClass}">
                    ${previewHtml}
                    ${metaHtml}
                </div>
            `;

        return {
            hasAttachment: true,
            previewHtml,
            linkHtml,
            metaHtml,
            extensionBadgeHtml,
            containerHtml,
            downloadUrl,
            meta,
            fileName,
            attachmentPath: normalized.attachmentPath
        };
    }

    // Backwards-compatible alias (generic naming enforced)
    static renderLinkedObject(relatedType, relatedId, displayName = '') {
        return this.renderLinkedEntity(relatedType, relatedId, displayName);
    }

    // ===== Private helpers =====
    static _resolveEntityType(relatedType) {
        if (typeof relatedType === 'string' && relatedType) {
            const raw = relatedType.toString().toLowerCase().replace(/[-\s]/g, '_');
            
            // אם מישהו משתמש ב-account ישן - שגיאה!
            if (raw === 'account') {
                const error = new Error(`❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!`);
                window.Logger.error('❌ DEPRECATED: account entity type used in field-renderer-service', { 
                    relatedType, 
                    stack: error.stack 
                }, { page: "field-renderer-service" });
                console.error(error);
                throw error;
            }
            
            // Normalize synonyms → canonical
            const map = {
                'trading_account': 'trading_account',
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
                'execution': 'execution',
                'position': 'position'
            };
            return map[raw] || raw || 'default';
        }
        if (typeof relatedType === 'number') {
            switch (relatedType) {
                case 1: return 'trading_account'; // was 'account' - now deprecated
                case 2: return 'trade';
                case 3: return 'trade_plan';
                case 4: return 'ticker';
                default: return 'default';
            }
        }
        return 'default';
    }

    static _getEntityHebrewLabel(type) {
        const map = {
            'trade': 'טרייד',
            'trading_account': 'חשבון מסחר',
            'ticker': 'טיקר',
            'alert': 'התראה',
            'cash_flow': 'תזרים מזומנים',
            'note': 'הערה',
            'trade_plan': 'תוכנית',
            'execution': 'ביצוע',
            'position': 'פוזיציה',
            'default': 'אובייקט'
        };
        return map[type] || map['default'];
    }

    static _formatDateDdMm(date) {
        if (date === null || date === undefined || date === '') {
            return '';
        }

        // Use formatDateShort for consistent dd.mm format
        if (typeof window.dateUtils?.formatDateShort === 'function') {
            return window.dateUtils.formatDateShort(date);
        }
        if (typeof window.formatDateShort === 'function') {
            return window.formatDateShort(date);
        }

        let resolvedDate = null;

        try {
            if (typeof window !== 'undefined' && window.dateUtils) {
                const envelope = typeof window.dateUtils.ensureDateEnvelope === 'function'
                    ? window.dateUtils.ensureDateEnvelope(date)
                    : null;

                if (envelope) {
                    resolvedDate = typeof window.dateUtils.toDateObject === 'function'
                        ? window.dateUtils.toDateObject(envelope)
                        : (envelope.utc ? new Date(envelope.utc) : null);
                }
            }

            if (!resolvedDate) {
                if (date instanceof Date) {
                    resolvedDate = date;
                } else if (typeof date === 'object' && date !== null) {
                    if (date.utc) {
                        resolvedDate = new Date(date.utc);
                    } else if (date.epochMs !== undefined) {
                        resolvedDate = new Date(date.epochMs);
                    } else if (date.local) {
                        resolvedDate = new Date(date.local);
                    }
                }
            }

            if (!resolvedDate) {
                resolvedDate = new Date(date);
            }

            if (!(resolvedDate instanceof Date) || Number.isNaN(resolvedDate.getTime())) {
                return '';
            }

            const dd = String(resolvedDate.getDate()).padStart(2, '0');
            const mm = String(resolvedDate.getMonth() + 1).padStart(2, '0');
            return `${dd}.${mm}`;
        } catch (e) {
            return '';
        }
    }

    static _toPlainText(html) {
        if (!html) {
            return '';
        }

        return String(html)
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static _escapeHtml(text) {
        if (text === null || text === undefined) {
            return '';
        }

        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    static _normalizeAttachmentInput(attachmentInput, options = {}) {
        const pathKeys = [
            options.pathKey,
            options.attachmentPathKey,
            'attachment',
            'path',
            'file_path',
            'filePath',
            'url',
            'href'
        ].filter(Boolean);

        const nameKeys = [
            options.fileNameKey,
            'fileName',
            'file_name',
            'filename',
            'name',
            'original_name'
        ].filter(Boolean);

        let attachmentPath = '';
        let fileName = options.fileName ? String(options.fileName).trim() : '';

        if (attachmentInput && typeof attachmentInput === 'object' && !(attachmentInput instanceof String)) {
            for (const key of pathKeys) {
                if (attachmentInput[key]) {
                    attachmentPath = attachmentInput[key];
                    break;
                }
            }
            if (!attachmentPath && attachmentInput.attachment !== undefined) {
                attachmentPath = attachmentInput.attachment;
            }
            if (!fileName) {
                for (const key of nameKeys) {
                    if (attachmentInput[key]) {
                        fileName = String(attachmentInput[key]).trim();
                        break;
                    }
                }
            }
        } else if (attachmentInput !== null && attachmentInput !== undefined) {
            attachmentPath = attachmentInput;
        }

        attachmentPath = String(attachmentPath || '').trim();
        if (!attachmentPath) {
            return { attachmentPath: '', fileName: '', meta: null, downloadUrl: '' };
        }

        if (!fileName) {
            fileName = this._extractAttachmentFileName(attachmentPath);
        }

        const meta = this._getAttachmentMeta(fileName || attachmentPath);
        const encodePath = options.encode === undefined ? true : options.encode;
        const encodedPath = encodePath ? encodeURI(attachmentPath) : String(attachmentPath);

        let downloadUrl = options.downloadUrl || '';
        if (!downloadUrl) {
            if (typeof options.urlBuilder === 'function') {
                downloadUrl = options.urlBuilder(encodedPath, { attachmentPath, fileName, meta });
            } else {
                const baseUrl = options.baseUrl || '';
                if (baseUrl) {
                    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
                    const trimmedPath = options.preserveLeadingSlash ? encodedPath : encodedPath.replace(/^\/+/, '');
                    downloadUrl = `${normalizedBase}${trimmedPath}`;
                } else {
                    downloadUrl = encodedPath;
                }
            }
        }

        return {
            attachmentPath,
            fileName,
            meta,
            downloadUrl
        };
    }

    static _extractAttachmentFileName(attachmentPath) {
        if (!attachmentPath) {
            return '';
        }

        const parts = String(attachmentPath).split(/[/\\]/);
        return parts[parts.length - 1] || '';
    }

    static _getAttachmentMeta(fileName = '') {
        const safeName = String(fileName || '').trim();
        const extension = (safeName.split('.').pop() || '').toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const iconMap = {
            image: '🖼️',
            pdf: '📕',
            word: '📘',
            excel: '📊',
            text: '📄',
            default: '📄'
        };

        let icon = iconMap.default;
        if (imageExtensions.includes(extension)) {
            icon = iconMap.image;
        } else if (extension === 'pdf') {
            icon = iconMap.pdf;
        } else if (['doc', 'docx'].includes(extension)) {
            icon = iconMap.word;
        } else if (['xls', 'xlsx'].includes(extension)) {
            icon = iconMap.excel;
        } else if (extension === 'txt') {
            icon = iconMap.text;
        }

        const maxLabelLength = 30;
        const fullName = safeName || 'קובץ מצורף';
        const label = fullName.length > maxLabelLength
            ? `${fullName.substring(0, maxLabelLength).trimEnd()}…`
            : fullName;

        const shortLabelLength = 10;
        const tableStyleLabel = fullName.length > shortLabelLength
            ? `${fullName.substring(0, shortLabelLength)}…`
            : fullName;

        return {
            icon,
            extension,
            displayName: fullName,
            label,
            tableStyleLabel,
            isImage: imageExtensions.includes(extension),
            isPdf: extension === 'pdf'
        };
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
        if (!date && date !== 0) {
            return '-';
        }

        const fmt = (envelope, fallback) => {
            if (!envelope) {
                return fallback;
            }
            if (typeof window.dateUtils?.formatEnvelope === 'function') {
                return window.dateUtils.formatEnvelope(envelope, { includeTime });
            }
            if (typeof window.formatDate === 'function') {
                return window.formatDate(envelope.local || envelope.utc || fallback, includeTime);
            }
            return fallback;
        };

        if (typeof date === 'object' && (date.epochMs || date.utc || date.local)) {
            return fmt(date, date.display || '-');
        }

        const isoCandidate = typeof date === 'string' ? date : null;
        if (isoCandidate && window.dateUtils?.parseEnvelope) {
            const envelope = window.dateUtils.parseEnvelope({ utc: isoCandidate });
            return fmt(envelope, isoCandidate);
        }

        if (typeof window.dateUtils?.formatDate === 'function') {
            return window.dateUtils.formatDate(date, { includeTime });
        }
        if (typeof window.formatDate === 'function') {
            return window.formatDate(date, includeTime);
        }

        try {
            // Fallback: use dateUtils functions for consistent formatting
            if (typeof window.dateUtils?.formatDate === 'function') {
                return window.dateUtils.formatDate(date, { includeTime });
            }
            if (typeof window.formatDate === 'function') {
                return window.formatDate(date, includeTime);
            }
            // Last resort: manual formatting with European format
            const dateObj = new Date(date);
            if (includeTime) {
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                return `${day}.${month}.${year} ${hours}:${minutes}`;
            } else {
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();
                return `${day}.${month}.${year}`;
            }
        } catch (error) {
            return isoCandidate || '-';
        }
    }

    /**
     * Render short date dd.mm
     */
    static renderDateShort(date) {
        if (typeof window.dateUtils?.formatDateShort === 'function') {
            return window.dateUtils.formatDateShort(date);
        }
        if (typeof window.formatDateShort === 'function') {
            return window.formatDateShort(date);
        }
        return this._formatDateDdMm(date);
    }

    /**
     * רנדור תאריך ביצוע (שנה בשתי ספרות + שעה)
     * 
     * @param {string|Date} date - תאריך ביצוע
     * @returns {string} - HTML עם תאריך ושעה בפורמט dd.mm.YY HH:MM
     * 
     * @example
     * const html = FieldRendererService.renderExecutionDate('2024-01-15T14:30:00');
     * // Output: '<span class="execution-date">15.01.24 14:30</span>'
     */
    static renderExecutionDate(date) {
        if (!date && date !== 0) {
            return '-';
        }

        const fmt = (envelope, fallback) => {
            if (!envelope) {
                return fallback;
            }
        if (typeof window.dateUtils?.formatDate === 'function') {
            return `<span class="execution-date">${window.dateUtils.formatDate(envelope, { includeTime: true, twoDigitYear: true })}</span>`;
            }
            if (typeof window.renderDate === 'function') {
                return `<span class="execution-date">${window.renderDate(envelope.local || envelope.utc || fallback, true)}</span>`;
            }
            return fallback;
        };

        if (typeof date === 'object' && (date.epochMs || date.utc || date.local)) {
            return fmt(date, date.display || '-');
        }

        const isoCandidate = typeof date === 'string' ? date : null;
        if (isoCandidate && window.dateUtils?.parseEnvelope) {
            const envelope = window.dateUtils.parseEnvelope({ utc: isoCandidate });
            return fmt(envelope, isoCandidate);
        }

        try {
            // Use formatDateNormal for dd.mm.YY format with time
            if (typeof window.dateUtils?.formatDateNormal === 'function') {
                const formatted = window.dateUtils.formatDateNormal(date, { includeTime: true });
                return `<span class="execution-date">${formatted}</span>`;
            }
            if (typeof window.formatDateNormal === 'function') {
                const formatted = window.formatDateNormal(date, true);
                return `<span class="execution-date">${formatted}</span>`;
            }
            // Fallback: manual formatting with European format
            const dateObj = new Date(date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = String(dateObj.getFullYear()).slice(-2);
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            return `<span class="execution-date">${day}.${month}.${year} ${hours}:${minutes}</span>`;
        } catch (error) {
            return isoCandidate || '-';
        }
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
     * רנדור פוזיציה עם יחידות (ללא ספרות אחרי נקודה)
     * 
     * @param {number} quantity - כמות הפוזיציה
     * @param {number} averagePrice - מחיר ממוצע
     * @param {string} currencySymbol - סמל מטבע (ברירת מחדל $)
     * @returns {string} - HTML עם פורמט RTL: 8,000$(150#)
     * 
     * @example
     * const html = FieldRendererService.renderPosition(150, 53.33);
     * // Output RTL: '<span class="position-display">8,000$(150#)</span>'
     */
    static renderPosition(quantity, averagePrice, currencySymbol = '$') {
        if (!quantity || quantity === 0) {
            return '<span class="numeric-value-zero">אין ביצועים</span>';
        }
        
        if (!averagePrice || averagePrice === 0) {
            return '<span class="numeric-value-zero">-</span>';
        }
        
        const totalValue = Math.abs(quantity * averagePrice);
        const formattedValue = totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 });
        const formattedQuantity = Math.abs(quantity).toLocaleString('en-US', { maximumFractionDigits: 0 });
        
        const colorClass = quantity > 0 ? 'numeric-value-positive' : 'numeric-value-negative';
        
        // RTL: ערך קודם (ימין), אחר כך סימן מטבע (שמאל), ואז יחידות בסוגריים
        return `<span class="position-display ${colorClass}">${formattedValue}${currencySymbol}(${formattedQuantity}#)</span>`;
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

    /**
     * רנדור פרטי מחיר טיקר בשורה אחת
     * 
     * @param {Object} ticker - אובייקט טיקר עם פרטים
     * @param {string} ticker.symbol - סמל הטיקר
     * @param {string} ticker.name - שם הטיקר
     * @param {number} ticker.current_price - מחיר נוכחי
     * @param {number} ticker.daily_change - שינוי יומי
     * @param {number} ticker.daily_change_percent - אחוז שינוי יומי
     * @param {number} ticker.volume - נפח מסחר
     * @param {string} cssClass - מחלקות CSS נוספות
     * @returns {string} - HTML מוכן להצגה
     * 
     * @example
     * const html = FieldRendererService.renderTickerInfo({
     *   symbol: 'AAPL',
     *   name: 'Apple Inc.',
     *   current_price: 150.25,
     *   daily_change: 2.15,
     *   daily_change_percent: 1.45,
     *   volume: 45000000
     * });
     */
    static renderTickerInfo(ticker, cssClass = '') {
        if (!ticker) {
            return '';
        }
        
        const symbol = ticker.symbol || 'N/A';
        const name = ticker.name || 'N/A';
        const price = ticker.current_price || 0;
        const change = ticker.daily_change || 0;
        const changePercent = ticker.daily_change_percent || 0;
        const volume = ticker.volume || 0;
        
        // סמל מטבע דינמי
        const currencySymbol = ticker.currency_symbol || '$';
        
        // שימוש במערכת הצבעים הכללית
        const changeColor = change >= 0 ? 'text-success' : 'text-danger';
        const changeIcon = change >= 0 ? '↗' : '↘';
        
        // פורמט נפח
        const formattedVolume = volume > 0 ? volume.toLocaleString('he-IL') : 'N/A';
        
        // תצוגה קומפקטית בשורה אחת (כפי שיצרנו עבור trade_plan ו-trade)
        const compactDisplay = `
            <div class="ticker-info-display-inline ${cssClass}" style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
                <span class="fw-bold">${currencySymbol}${price.toFixed(2)}</span>
                <span class="${changeColor}">
                    ${changeIcon} ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)
                </span>
                <span class="text-muted small">
                    נפח: ${formattedVolume}
                </span>
            </div>
        `;
        
        return compactDisplay;
    }

    /**
     * Render standardized tag badges block for any entity
     *
     * @param {Array<Object>} tags - Array of tag objects (as returned from TagService)
     * @param {Object} options - Rendering options
     * @param {boolean} [options.showTitle=true] - Whether to render the section title
     * @param {string} [options.title='תגיות'] - Section title
     * @param {string} [options.emptyMessage='אין תגיות משויכות'] - Message when no tags are present
     * @param {string} [options.entityType='entity'] - Entity type identifier
     * @param {string} [options.containerClasses=''] - Extra classes for outer container
     * @param {boolean} [options.includeCategory=true] - Whether to prefix category name before tag name
     * @returns {string} HTML string representing the tags block
     */
    static renderTagBadges(tags, options = {}) {
        const {
            showTitle = true,
            title = 'תגיות',
            emptyMessage = 'אין תגיות משויכות',
            entityType = 'entity',
            containerClasses = '',
            includeCategory = true
        } = options || {};

        const normalizedTags = Array.isArray(tags) ? tags.filter(Boolean) : [];
        const sectionTitle = this._escapeHtml(title);
        const emptyLabel = this._escapeHtml(emptyMessage);
        const normalizedEntityType = this._escapeHtml(entityType || 'entity');
        const outerClasses = ['entity-tags-block', containerClasses].filter(Boolean).join(' ').trim();

        const renderHeader = (hasTags) => {
            if (!showTitle) {
                return hasTags ? '' : `<span class="text-muted">${emptyLabel}</span>`;
            }

            if (hasTags) {
                return `
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="fw-bold">${sectionTitle}:</span>
                    </div>
                `;
            }

            return `
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold">${sectionTitle}:</span>
                    <span class="text-muted">${emptyLabel}</span>
                </div>
            `;
        };

        if (!normalizedTags.length) {
            return `
                <div class="${outerClasses}" data-entity-type="${normalizedEntityType}">
                    ${renderHeader(false)}
                </div>
            `;
        }

        const badgesHtml = normalizedTags.map((tag) => {
            const tagId = tag.id != null ? String(tag.id) : '';
            const categoryId = tag.category_id != null
                ? String(tag.category_id)
                : (tag.category && tag.category.id != null ? String(tag.category.id) : '');

            const tagName = tag.name || tag.label || tag.display_name || '';
            const categoryName = includeCategory
                ? (tag.category_name || (tag.category && tag.category.name) || '')
                : '';

            const label = [categoryName, tagName]
                .filter(Boolean)
                .join(includeCategory && categoryName && tagName ? ' • ' : '');

            const displayLabel = this._escapeHtml(label || tagName || categoryName || '-');
            const normalizedColor = this._normalizeTagColorValue(
                tag.color_hex || tag.color || tag.category_color || (tag.category && tag.category.color_hex) || null
            );

            const dataAttrs = [
                tagId ? `data-tag-id="${this._escapeHtml(tagId)}"` : '',
                categoryId ? `data-category-id="${this._escapeHtml(categoryId)}"` : ''
            ].filter(Boolean).join(' ');

            return `
                <span class="badge rounded-pill bg-light text-dark border me-1 mb-1"
                      style="border-color: ${normalizedColor};"
                      ${dataAttrs}>
                    ${displayLabel}
                </span>
            `;
        }).join('');

        return `
            <div class="${outerClasses}" data-entity-type="${normalizedEntityType}">
                ${renderHeader(true)}
                <div class="tag-badge-container d-flex flex-wrap gap-2">
                    ${badgesHtml}
                </div>
            </div>
        `;
    }

    // ===== PRIVATE HELPER METHODS =====

    /**
     * Normalize hex color values for tag rendering
     * @private
     */
    static _normalizeTagColorValue(colorCandidate, fallback = '#26baac') {
        if (!colorCandidate) {
            return fallback;
        }

        const trimmed = String(colorCandidate).trim();
        const hexRegex = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
        if (hexRegex.test(trimmed)) {
            return trimmed;
        }

        return fallback;
    }

    /**
     * תרגום סטטוס לעברית
     * @private
     */
    static _translateStatus(status, entityType) {
        // אם מישהו משתמש ב-account ישן - שגיאה!
        if (entityType === 'account') {
            const error = new Error(`❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!`);
            window.Logger.error('❌ DEPRECATED: account entity type used in _translateStatus', { entityType, status }, { page: "field-renderer-service" });
            console.error(error);
            throw error;
        }
        
        // מערכות תרגום לפי סוג ישות
        const translators = {
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

        if (entityType === 'import_session') {
            const importTranslations = {
                'completed': 'הושלם',
                'ready': 'מוכן',
                'analyzing': 'בבדיקה',
                'importing': 'ייבוא פעיל',
                'failed': 'נכשל',
                'cancelled': 'בוטל',
                'canceled': 'בוטל',
                'created': 'נוצר'
            };
            return importTranslations[status.toLowerCase()] || status;
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
window.renderExchangeBadge = (meta) => FieldRendererService.renderExchangeBadge(meta);
window.renderExchangePairCards = (summary, options) => FieldRendererService.renderExchangePairCards(summary, options);
window.renderSide = (side) => FieldRendererService.renderSide(side);
window.renderNumericValue = (value, suffix, showPrefix) => FieldRendererService.renderNumericValue(value, suffix, showPrefix);
window.renderNumericBadge = (value, suffix, showPrefix) => FieldRendererService.renderNumericBadge(value, suffix, showPrefix);
window.renderPnL = (value, currency) => FieldRendererService.renderPnL(value, currency); // deprecated - use renderNumericValue
window.renderCurrency = (id, name, symbol) => FieldRendererService.renderCurrency(id, name, symbol);
window.renderAmount = (value, currencySymbol, decimals, showSign) => FieldRendererService.renderAmount(value, currencySymbol, decimals, showSign);
window.renderType = (type, amountForColor) => FieldRendererService.renderType(type, amountForColor);
window.renderAction = (action, amountForColor) => FieldRendererService.renderAction(action, amountForColor);
window.renderPriority = (priority) => FieldRendererService.renderPriority(priority);
window.renderDate = (date, includeTime) => FieldRendererService.renderDate(date, includeTime);
window.renderShares = (shares, cssClass) => FieldRendererService.renderShares(shares, cssClass);
window.renderPosition = (quantity, averagePrice, currencySymbol) => FieldRendererService.renderPosition(quantity, averagePrice, currencySymbol);
window.renderBoolean = (value, size) => FieldRendererService.renderBoolean(value, size);
window.renderTickerInfo = (ticker, cssClass) => FieldRendererService.renderTickerInfo(ticker, cssClass);
window.renderVolume = (volume, showMillions) => FieldRendererService.renderVolume(volume, showMillions);
window.renderExecutionDate = (date) => FieldRendererService.renderExecutionDate(date);
window.renderUpdatedTimestamp = (value, options) => FieldRendererService.renderUpdatedTimestamp(value, options);

console.log('✅ field-renderer-service.js v=1.4.0 loaded - added renderTickerInfo() for ticker price display');
