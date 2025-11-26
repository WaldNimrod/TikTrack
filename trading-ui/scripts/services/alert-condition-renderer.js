/**
 * Alert Condition Renderer Service
 * מערכת רינדור מתקדמת לתנאי התראות
 */

class AlertConditionRenderer {
    
    // הגדרת סוג ממשק - חכם (ברירת מחדל) או קבוע (פולבאק)
    static interfaceMode = 'dynamic'; // 'dynamic' = חכם | 'fixed' = קבוע
    
    // מיפוי attributes לעברית ואייקונים - מותאם למסחר בארה"ב
    static attributeConfig = {
        price: { 
            label: 'מחיר', 
            unit: '$', 
            icon: '💰', 
            inputType: 'number', 
            min: 0.01,           // לפחות 1 סנט
            max: 10000,          // מקסימום $10,000 למניה
            step: 0.01 
        },
        change: { 
            label: 'שינוי באחוזים', 
            unit: '%', 
            icon: '📈', 
            inputType: 'number', 
            min: -100,           // מקסימום ירידה 100%
            max: 1000,           // מקסימום עליה (חדשות טובות)
            step: 0.01 
        },
        volume: { 
            label: 'נפח מסחר', 
            unit: '', 
            icon: '📊', 
            inputType: 'number', 
            min: 1,              // לפחות יחידה אחת
            max: 1000000000,     // מקסימום מיליארד יחידות
            step: 1 
        },
        ma: { 
            label: 'ממוצע נע', 
            unit: '$', 
            icon: '📉', 
            inputType: 'number', 
            min: 0.01,           // כמו מחיר
            max: 10000,          // כמו מחיר
            step: 0.01 
        },
        balance: {
            label: 'יתרה',
            unit: '',
            icon: '🏦',
            inputType: 'number',
            min: -1000000000,
            max: 1000000000,
            step: 0.01
        }
    };
    
    // מיפוי operators לעברית - מותאם למסחר
    static operatorConfig = {
        more_than: { label: 'יותר מ', symbol: '>' },
        less_than: { label: 'פחות מ', symbol: '<' },
        equals: { label: 'שווה בדיוק ל', symbol: '=' },
        change: { label: 'שינוי בכל כיוון', symbol: '📈📉' },
        change_up: { label: 'עליה של', symbol: '⬆📈' },
        change_down: { label: 'ירידה של', symbol: '⬇📈' },
        cross: { label: 'חוצה', symbol: '⚡' },
        cross_up: { label: 'חוצה למעלה', symbol: '⬆⚡' },
        cross_down: { label: 'חוצה למטה', symbol: '⬇⚡' }
    };
    
    /**
     * רינדור תנאי מלא בעברית
     */
    static renderConditionText(attribute, operator, number) {
        const attrConfig = this.attributeConfig[attribute] || {};
        const opConfig = this.operatorConfig[operator] || {};
        
        const attrLabel = attrConfig.label || attribute;
        const opLabel = opConfig.label || operator;
        const unit = attrConfig.unit || '';
        const formattedNumber = this.formatConditionNumber(number, attrConfig);
        const unitSuffix = unit ? ` ${unit}` : '';
        
        return `${attrLabel} ${opLabel} ${formattedNumber}${unitSuffix}`.trim();
    }
    
    /**
     * הגדרת מצב ממשק
     */
    static setInterfaceMode(mode) {
        this.interfaceMode = mode;
    }
    
    /**
     * בדיקת מצב ממשק
     */
    static isDynamicMode() {
        return this.interfaceMode === 'dynamic';
    }
    
    /**
     * רינדור ממשק קבוע (פולבאק - Option C)
     * 3 שדות נפרדים קבועים
     */
    static renderFixedInterface() {
        // הממשק הקבוע הוא מה שיש ב-HTML כבר
        // זה רק מגדיר שהממשק הקבוע צריך להיות פעיל
    }
    
    /**
     * רינדור ממשק דינמי (ברירת מחדל - Option A)
     * שדה שמשתנה לפי attribute שנבחר
     */
    static renderDynamicInterface(containerId, attribute, currentValue = '', operator = '') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const config = this.attributeConfig[attribute];
        if (!config) {
            // fallback לממשק פשוט
            container.innerHTML = `<input type="number" class="form-control" id="${containerId}Value" value="${currentValue}" step="0.01" required>`;
            return;
        }
        
        // בניית input דינמי עם attributes לפי attribute
        const attributes = [];
        if (config.min !== undefined) attributes.push(`min="${config.min}"`);
        if (config.max !== undefined) attributes.push(`max="${config.max}"`);
        if (config.step !== undefined) attributes.push(`step="${config.step}"`);
        
        // יחידות דינמיות לפי אופרטור
        let unit = config.unit || '';
        if (attribute === 'price' && (operator === 'change' || operator === 'change_up' || operator === 'change_down')) {
            unit = '%'; // שינוי מחיר באחוזים
        }
        
        // שמור על ID ספציפי לפי container
        let inputId = `${containerId}Value`;
        let onchangeEvent = 'onSmartConditionChange(this)';
        
        if (containerId === 'smartValueContainer') {
            inputId = 'smartValueInput'; // שמור על ה-ID המקורי
            onchangeEvent = 'onSmartConditionChange(this)';
        }
        if (containerId === 'editSmartValueContainer') {
            inputId = 'editSmartValueInput'; // שמור על ה-ID המקורי
            onchangeEvent = 'onEditSmartConditionChange(this)';
        }
        
        const inputHtml = `
            <div class="input-group">
                <input type="${config.inputType}" 
                       class="form-control" 
                       id="${inputId}" 
                       value="${currentValue}" 
                       ${attributes.join(' ')} 
                       required
                       onchange="${onchangeEvent}">
                ${unit ? `<span class="input-group-text">${unit}</span>` : ''}
            </div>
        `;
        
        container.innerHTML = inputHtml;
    }
    
    /**
     * רינדור שדה input לפי מצב הממשק
     */
    static renderDynamicInput(containerId, attribute, currentValue = '', operator = '') {
        // בדיקת מצב ממשק - דינמי או קבוע
        if (this.isDynamicMode()) {
            this.renderDynamicInterface(containerId, attribute, currentValue, operator);
        } else {
            // במקרה של ממשק קבוע, זה נשמר ב-HTML
            const container = document.getElementById(containerId);
            if (container) {
                const input = container.querySelector('input');
                if (input) {
                    // Use DataCollectionService to set value if available
                    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                      window.DataCollectionService.setValue(input.id, currentValue, 'text');
                    } else {
                      input.value = currentValue;
                    }
                }
            }
        }
    }
    
    /**
     * החלפת מצב ממשק בזמן אמת
     */
    static toggleInterfaceMode() {
        this.interfaceMode = this.interfaceMode === 'dynamic' ? 'fixed' : 'dynamic';
        return this.interfaceMode;
    }
    
    /**
     * רינדור תצוגה מקדימה של התנאי
     */
    static renderPreview(previewId, attribute, operator, number) {
        const preview = document.getElementById(previewId);
        if (!preview) return;
        
        if (!attribute || !operator || !number) {
            preview.textContent = 'בחר תנאי...';
            preview.className = 'condition-preview text-muted';
            return;
        }
        
        const text = this.renderConditionText(attribute, operator, number);
        preview.textContent = text;
        preview.className = 'condition-preview text-success fw-bold';
    }
    
    /**
     * קבלת המטבע של הטיקר הספציפי
     */
    static async getTickerCurrency(tickerId) {
        try {
            const response = await fetch(`/api/tickers/${tickerId}`);
            if (response.ok) {
                const data = await response.json();
                return data.data?.currency?.symbol || '$'; // fallback ל-USD
            }
        } catch (error) {
            console.error('Error fetching ticker currency:', error);
        }
        return '$'; // fallback
    }
    
    /**
     * עדכון יחידת המחיר לפי המטבע של הטיקר
     */
    static async updatePriceUnit(tickerId) {
        if (tickerId) {
            const currency = await this.getTickerCurrency(tickerId);
            if (this.attributeConfig.price) {
                this.attributeConfig.price.unit = currency;
            }
        }
    }
    
    /**
     * רינדור ממשק מלא - מתקדם או בסיסי
     */
    static renderFullInterface(containerSelector, mode = null) {
        if (mode) {
            this.setInterfaceMode(mode);
        }
        
        // כאן ניתן להוסיף לוגיקה נוספת למעבר בין ממשקים מלאים
        // כרגע הממשק המתקדם הוא ברירת המחדל ב-HTML
    }

    /**
     * פורמט מספר להצגת תנאי
     * @param {string|number} value - ערך התנאי
     * @param {Object} attrConfig - הגדרות המאפיין
     * @returns {string} הערך בפורמט קריא
     */
    static formatConditionNumber(value, attrConfig = {}) {
        if (value === null || value === undefined || value === '') {
            return '-';
        }

        const raw = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
        const numericValue = Number(raw);
        if (!Number.isFinite(numericValue)) {
            return String(value);
        }

        const decimals = attrConfig?.step === 1 ? 0 : 2;
        return numericValue.toLocaleString('he-IL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals,
        });
    }
}

// Export to global scope
window.AlertConditionRenderer = AlertConditionRenderer;
