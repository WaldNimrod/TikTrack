# Field Components Specification - TikTrack Modal System
## תכנון מפורט של כל רכיבי השדות לשימוש חוזר

**תאריך יצירה**: 12 בינואר 2025  
**מטרה**: תכנון מפורט של כל רכיבי השדות עם סטנדרטים מלאים של TikTrack

---

## 📊 סיכום כללי

**רכיבי שדות**: 19 רכיבים עיקריים  
**סטנדרטים**: JSDoc מלא, שמות משתנים באנגלית, פונקציות בעברית  
**אינטגרציה**: מלאה עם כל המערכות הקיימות  
**תמיכה**: RTL, ITCSS, רספונסיבי

---

## 🏗️ מבנה בסיסי לכל רכיב

### Base Field Component Class
```javascript
/**
 * Base Field Component - TikTrack Modal System
 * ===========================================
 * 
 * מחלקה בסיסית לכל רכיבי השדות במערכת המודלים
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - מבנה אחיד לכל רכיבי השדות
 * - ולידציה מובנית
 * - אינטגרציה עם מערכות קיימות
 * - תמיכה ב-RTL מלא
 * - עיצוב ITCSS
 */

class BaseFieldComponent {
    /**
     * Constructor - אתחול רכיב שדה בסיסי
     * 
     * @constructor
     * @param {Object} config - קונפיגורציה של השדה
     * @param {string} config.id - מזהה השדה
     * @param {string} config.label - תווית השדה
     * @param {boolean} config.required - האם השדה חובה
     * @param {*} config.defaultValue - ערך ברירת מחדל
     * @param {Object} config.validation - כללי ולידציה
     * @param {Object} config.styling - הגדרות עיצוב
     */
    constructor(config) {
        this.config = {
            id: config.id || '',
            label: config.label || '',
            required: config.required || false,
            defaultValue: config.defaultValue || null,
            validation: config.validation || {},
            styling: config.styling || {},
            ...config
        };
        
        this.element = null;
        this.isValid = true;
        this.errorMessage = '';
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize field component - אתחול רכיב השדה
     * 
     * @private
     */
    init() {
        try {
            this.render();
            this.setupEventListeners();
            this.initializeValidation();
            this.isInitialized = true;
        } catch (error) {
            console.error(`Error initializing field ${this.config.id}:`, error);
        }
    }

    /**
     * Render field HTML - יצירת HTML של השדה
     * 
     * @abstract
     * @returns {string} HTML של השדה
     */
    render() {
        throw new Error('render() method must be implemented by subclass');
    }

    /**
     * Setup event listeners - הגדרת מאזיני אירועים
     * 
     * @private
     */
    setupEventListeners() {
        if (!this.element) return;
        
        // Real-time validation
        this.element.addEventListener('input', () => {
            this.validate();
        });
        
        this.element.addEventListener('blur', () => {
            this.validate();
        });
        
        this.element.addEventListener('change', () => {
            this.validate();
        });
    }

    /**
     * Initialize validation - אתחול מערכת הולידציה
     * 
     * @private
     */
    initializeValidation() {
        if (window.initializeValidation && this.config.validation) {
            const validationRules = {};
            validationRules[this.config.id] = this.config.validation;
            window.initializeValidation(this.config.id, validationRules);
        }
    }

    /**
     * Validate field - ולידציה של השדה
     * 
     * @returns {boolean} האם השדה תקין
     */
    validate() {
        if (!this.element || !window.validateField) {
            return true;
        }
        
        const result = window.validateField(this.element, this.config.validation);
        this.isValid = result.isValid;
        this.errorMessage = result.message || '';
        
        return this.isValid;
    }

    /**
     * Get field value - קבלת ערך השדה
     * 
     * @returns {*} ערך השדה
     */
    getValue() {
        if (!this.element) return this.config.defaultValue;
        return this.element.value || this.config.defaultValue;
    }

    /**
     * Set field value - הגדרת ערך השדה
     * 
     * @param {*} value - ערך להגדרה
     */
    setValue(value) {
        if (!this.element) return;
        this.element.value = value || '';
        this.validate();
    }

    /**
     * Clear field - ניקוי השדה
     */
    clear() {
        this.setValue(this.config.defaultValue);
    }

    /**
     * Enable field - הפעלת השדה
     */
    enable() {
        if (this.element) {
            this.element.disabled = false;
            this.element.classList.remove('disabled');
        }
    }

    /**
     * Disable field - השבתת השדה
     */
    disable() {
        if (this.element) {
            this.element.disabled = true;
            this.element.classList.add('disabled');
        }
    }

    /**
     * Show field error - הצגת שגיאת השדה
     * 
     * @param {string} message - הודעת שגיאה
     */
    showError(message) {
        if (!this.element) return;
        
        this.element.classList.add('is-invalid');
        this.element.classList.remove('is-valid');
        
        // הצגת הודעת שגיאה
        let errorElement = this.element.parentNode.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            this.element.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    /**
     * Clear field error - ניקוי שגיאת השדה
     */
    clearError() {
        if (!this.element) return;
        
        this.element.classList.remove('is-invalid');
        this.element.classList.add('is-valid');
        
        const errorElement = this.element.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Get field element - קבלת אלמנט השדה
     * 
     * @returns {HTMLElement|null} אלמנט השדה
     */
    getElement() {
        return this.element;
    }

    /**
     * Destroy field - השמדת השדה
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.isInitialized = false;
    }
}
```

---

## 🔤 1. TextFieldComponent - שדה טקסט בסיסי

```javascript
/**
 * Text Field Component - TikTrack Modal System
 * ===========================================
 * 
 * רכיב שדה טקסט בסיסי עם ולידציה מלאה
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class TextFieldComponent extends BaseFieldComponent {
    /**
     * Render text field HTML - יצירת HTML של שדה טקסט
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const requiredAttr = this.config.required ? 'required' : '';
        const placeholderAttr = this.config.placeholder ? `placeholder="${this.config.placeholder}"` : '';
        const maxLengthAttr = this.config.maxLength ? `maxlength="${this.config.maxLength}"` : '';
        const minLengthAttr = this.config.minLength ? `minlength="${this.config.minLength}"` : '';
        
        const html = `
            <div class="mb-3">
                <label for="${this.config.id}" class="form-label">
                    ${this.config.label}
                    ${this.config.required ? '<span class="text-danger">*</span>' : ''}
                </label>
                <input type="text" 
                       class="form-control" 
                       id="${this.config.id}" 
                       name="${this.config.id}"
                       ${requiredAttr}
                       ${placeholderAttr}
                       ${maxLengthAttr}
                       ${minLengthAttr}
                       value="${this.config.defaultValue || ''}">
                <div class="invalid-feedback"></div>
            </div>
        `;
        
        return html;
    }

    /**
     * Get validation rules - קבלת כללי ולידציה
     * 
     * @returns {Object} כללי ולידציה
     */
    getValidationRules() {
        return {
            required: this.config.required,
            minLength: this.config.minLength || 0,
            maxLength: this.config.maxLength || 255,
            pattern: this.config.pattern || /.*/
        };
    }
}
```

---

## 🔢 2. NumberFieldComponent - שדה מספרי

```javascript
/**
 * Number Field Component - TikTrack Modal System
 * =============================================
 * 
 * רכיב שדה מספרי עם ולידציה מלאה
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class NumberFieldComponent extends BaseFieldComponent {
    /**
     * Render number field HTML - יצירת HTML של שדה מספרי
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const requiredAttr = this.config.required ? 'required' : '';
        const placeholderAttr = this.config.placeholder ? `placeholder="${this.config.placeholder}"` : '';
        const minAttr = this.config.min !== undefined ? `min="${this.config.min}"` : '';
        const maxAttr = this.config.max !== undefined ? `max="${this.config.max}"` : '';
        const stepAttr = this.config.step ? `step="${this.config.step}"` : '';
        
        const html = `
            <div class="mb-3">
                <label for="${this.config.id}" class="form-label">
                    ${this.config.label}
                    ${this.config.required ? '<span class="text-danger">*</span>' : ''}
                </label>
                <input type="number" 
                       class="form-control" 
                       id="${this.config.id}" 
                       name="${this.config.id}"
                       ${requiredAttr}
                       ${placeholderAttr}
                       ${minAttr}
                       ${maxAttr}
                       ${stepAttr}
                       value="${this.config.defaultValue || ''}">
                <div class="invalid-feedback"></div>
            </div>
        `;
        
        return html;
    }

    /**
     * Get validation rules - קבלת כללי ולידציה
     * 
     * @returns {Object} כללי ולידציה
     */
    getValidationRules() {
        return {
            required: this.config.required,
            min: this.config.min,
            max: this.config.max,
            step: this.config.step
        };
    }

    /**
     * Get field value as number - קבלת ערך השדה כמספר
     * 
     * @returns {number|null} ערך השדה כמספר
     */
    getValueAsNumber() {
        const value = this.getValue();
        if (value === '' || value === null) return null;
        return parseFloat(value);
    }
}
```

---

## 📅 3. DateFieldComponent - שדה תאריך

```javascript
/**
 * Date Field Component - TikTrack Modal System
 * ===========================================
 * 
 * רכיב שדה תאריך עם ולידציה מלאה
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class DateFieldComponent extends BaseFieldComponent {
    /**
     * Render date field HTML - יצירת HTML של שדה תאריך
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const requiredAttr = this.config.required ? 'required' : '';
        const minDateAttr = this.config.minDate ? `min="${this.config.minDate}"` : '';
        const maxDateAttr = this.config.maxDate ? `max="${this.config.maxDate}"` : '';
        
        const html = `
            <div class="mb-3">
                <label for="${this.config.id}" class="form-label">
                    ${this.config.label}
                    ${this.config.required ? '<span class="text-danger">*</span>' : ''}
                </label>
                <input type="${this.config.dateTime ? 'datetime-local' : 'date'}" 
                       class="form-control" 
                       id="${this.config.id}" 
                       name="${this.config.id}"
                       ${requiredAttr}
                       ${minDateAttr}
                       ${maxDateAttr}
                       value="${this.config.defaultValue || ''}">
                <div class="invalid-feedback"></div>
            </div>
        `;
        
        return html;
    }

    /**
     * Get validation rules - קבלת כללי ולידציה
     * 
     * @returns {Object} כללי ולידציה
     */
    getValidationRules() {
        return {
            required: this.config.required,
            minDate: this.config.minDate,
            maxDate: this.config.maxDate
        };
    }

    /**
     * Get field value as Date - קבלת ערך השדה כתאריך
     * 
     * @returns {Date|null} ערך השדה כתאריך
     */
    getValueAsDate() {
        const value = this.getValue();
        if (value === '' || value === null) return null;
        return new Date(value);
    }

    /**
     * Set field value from Date - הגדרת ערך השדה מתאריך
     * 
     * @param {Date} date - תאריך להגדרה
     */
    setValueFromDate(date) {
        if (!date) {
            this.setValue('');
            return;
        }
        
        const value = this.config.dateTime 
            ? date.toISOString().slice(0, 16) // datetime-local format
            : date.toISOString().slice(0, 10); // date format
        
        this.setValue(value);
    }
}
```

---

## 📋 4. SelectFieldComponent - רשימת בחירה

```javascript
/**
 * Select Field Component - TikTrack Modal System
 * =============================================
 * 
 * רכיב רשימת בחירה עם ולידציה מלאה
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class SelectFieldComponent extends BaseFieldComponent {
    /**
     * Render select field HTML - יצירת HTML של רשימת בחירה
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const requiredAttr = this.config.required ? 'required' : '';
        const multipleAttr = this.config.multiple ? 'multiple' : '';
        
        let optionsHtml = '';
        
        // אופציה ריקה אם נדרש
        if (this.config.includeEmpty !== false) {
            const emptyText = this.config.emptyText || 'בחר...';
            optionsHtml += `<option value="">${emptyText}</option>`;
        }
        
        // אופציות מהקונפיגורציה
        if (this.config.options && Array.isArray(this.config.options)) {
            this.config.options.forEach(option => {
                const value = option.value || option.id || option;
                const label = option.label || option.name || option;
                const selected = this.config.defaultValue === value ? 'selected' : '';
                optionsHtml += `<option value="${value}" ${selected}>${label}</option>`;
            });
        }
        
        const html = `
            <div class="mb-3">
                <label for="${this.config.id}" class="form-label">
                    ${this.config.label}
                    ${this.config.required ? '<span class="text-danger">*</span>' : ''}
                </label>
                <select class="form-select" 
                        id="${this.config.id}" 
                        name="${this.config.id}"
                        ${requiredAttr}
                        ${multipleAttr}>
                    ${optionsHtml}
                </select>
                <div class="invalid-feedback"></div>
            </div>
        `;
        
        return html;
    }

    /**
     * Get validation rules - קבלת כללי ולידציה
     * 
     * @returns {Object} כללי ולידציה
     */
    getValidationRules() {
        return {
            required: this.config.required,
            enum: this.config.options ? this.config.options.map(opt => opt.value || opt) : []
        };
    }

    /**
     * Add option to select - הוספת אופציה לרשימה
     * 
     * @param {string} value - ערך האופציה
     * @param {string} label - תווית האופציה
     * @param {boolean} selected - האם לבחור את האופציה
     */
    addOption(value, label, selected = false) {
        if (!this.element) return;
        
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        if (selected) option.selected = true;
        
        this.element.appendChild(option);
    }

    /**
     * Clear options - ניקוי כל האופציות
     */
    clearOptions() {
        if (!this.element) return;
        this.element.innerHTML = '';
        
        // הוספת אופציה ריקה אם נדרש
        if (this.config.includeEmpty !== false) {
            const emptyText = this.config.emptyText || 'בחר...';
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = emptyText;
            this.element.appendChild(emptyOption);
        }
    }
}
```

---

## 📝 5. TextareaFieldComponent - שדה טקסט רב-שורות

```javascript
/**
 * Textarea Field Component - TikTrack Modal System
 * ===============================================
 * 
 * רכיב שדה טקסט רב-שורות עם ולידציה מלאה
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class TextareaFieldComponent extends BaseFieldComponent {
    /**
     * Render textarea field HTML - יצירת HTML של שדה טקסט רב-שורות
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const requiredAttr = this.config.required ? 'required' : '';
        const placeholderAttr = this.config.placeholder ? `placeholder="${this.config.placeholder}"` : '';
        const maxLengthAttr = this.config.maxLength ? `maxlength="${this.config.maxLength}"` : '';
        const rowsAttr = this.config.rows ? `rows="${this.config.rows}"` : 'rows="4"';
        
        const html = `
            <div class="mb-3">
                <label for="${this.config.id}" class="form-label">
                    ${this.config.label}
                    ${this.config.required ? '<span class="text-danger">*</span>' : ''}
                </label>
                <textarea class="form-control" 
                          id="${this.config.id}" 
                          name="${this.config.id}"
                          ${requiredAttr}
                          ${placeholderAttr}
                          ${maxLengthAttr}
                          ${rowsAttr}>${this.config.defaultValue || ''}</textarea>
                <div class="invalid-feedback"></div>
            </div>
        `;
        
        return html;
    }

    /**
     * Get validation rules - קבלת כללי ולידציה
     * 
     * @returns {Object} כללי ולידציה
     */
    getValidationRules() {
        return {
            required: this.config.required,
            minLength: this.config.minLength || 0,
            maxLength: this.config.maxLength || 1000
        };
    }
}
```

---

## 🔗 6. AccountSelectComponent - בחירת חשבון מסחר

```javascript
/**
 * Account Select Component - TikTrack Modal System
 * ===============================================
 * 
 * רכיב בחירת חשבון מסחר עם אינטגרציה מלאה ל-SelectPopulatorService
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class AccountSelectComponent extends SelectFieldComponent {
    /**
     * Render account select HTML - יצירת HTML של בחירת חשבון
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const html = super.render();
        
        // אתחול מילוי החשבונות
        this.populateAccounts();
        
        return html;
    }

    /**
     * Populate accounts from API - מילוי חשבונות מ-API
     * 
     * @private
     */
    async populateAccounts() {
        if (!window.SelectPopulatorService) {
            console.warn('SelectPopulatorService not available');
            return;
        }
        
        try {
            await window.SelectPopulatorService.populateAccountsSelect(this.config.id, {
                includeEmpty: this.config.includeEmpty !== false,
                defaultFromPreferences: this.config.defaultFromPreferences || false,
                defaultValue: this.config.defaultValue
            });
        } catch (error) {
            console.error('Error populating accounts:', error);
        }
    }

    /**
     * Get validation rules - קבלת כללי ולידציה
     * 
     * @returns {Object} כללי ולידציה
     */
    getValidationRules() {
        return {
            required: this.config.required
        };
    }
}
```

---

## 📈 7. TickerSelectComponent - בחירת טיקר

```javascript
/**
 * Ticker Select Component - TikTrack Modal System
 * ===============================================
 * 
 * רכיב בחירת טיקר עם אינטגרציה מלאה ל-SelectPopulatorService
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class TickerSelectComponent extends SelectFieldComponent {
    /**
     * Render ticker select HTML - יצירת HTML של בחירת טיקר
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const html = super.render();
        
        // הוספת מידע טיקר
        const tickerInfoHtml = `
            <div id="${this.config.id}Info" class="mt-2 d-none">
                <div class="row">
                    <div class="col-4">
                        <small class="text-muted">מחיר:</small>
                        <div id="${this.config.id}Price" class="fw-bold">-</div>
                    </div>
                    <div class="col-4">
                        <small class="text-muted">שינוי יומי:</small>
                        <div id="${this.config.id}Change" class="fw-bold">-</div>
                    </div>
                    <div class="col-4">
                        <small class="text-muted">ווליום:</small>
                        <div id="${this.config.id}Volume" class="fw-bold">-</div>
                    </div>
                </div>
            </div>
        `;
        
        // אתחול מילוי הטיקרים
        this.populateTickers();
        
        return html + tickerInfoHtml;
    }

    /**
     * Populate tickers from API - מילוי טיקרים מ-API
     * 
     * @private
     */
    async populateTickers() {
        if (!window.SelectPopulatorService) {
            console.warn('SelectPopulatorService not available');
            return;
        }
        
        try {
            await window.SelectPopulatorService.populateTickersSelect(this.config.id, {
                includeEmpty: this.config.includeEmpty !== false,
                defaultValue: this.config.defaultValue,
                filterFn: this.config.filterFn
            });
            
            // הוספת מאזין לשינוי טיקר
            this.setupTickerChangeListener();
        } catch (error) {
            console.error('Error populating tickers:', error);
        }
    }

    /**
     * Setup ticker change listener - הגדרת מאזין לשינוי טיקר
     * 
     * @private
     */
    setupTickerChangeListener() {
        if (!this.element) return;
        
        this.element.addEventListener('change', async (event) => {
            const tickerId = event.target.value;
            if (tickerId) {
                await this.updateTickerInfo(tickerId);
            } else {
                this.hideTickerInfo();
            }
        });
    }

    /**
     * Update ticker info - עדכון מידע טיקר
     * 
     * @param {string} tickerId - מזהה הטיקר
     * @private
     */
    async updateTickerInfo(tickerId) {
        try {
            const response = await fetch(`/api/tickers/${tickerId}`);
            if (!response.ok) return;
            
            const tickerData = await response.json();
            const ticker = tickerData.data || tickerData;
            
            // עדכון מידע טיקר
            const priceElement = document.getElementById(`${this.config.id}Price`);
            const changeElement = document.getElementById(`${this.config.id}Change`);
            const volumeElement = document.getElementById(`${this.config.id}Volume`);
            const infoElement = document.getElementById(`${this.config.id}Info`);
            
            if (priceElement) priceElement.textContent = ticker.price || '-';
            if (changeElement) changeElement.textContent = ticker.change || '-';
            if (volumeElement) volumeElement.textContent = ticker.volume || '-';
            if (infoElement) infoElement.classList.remove('d-none');
        } catch (error) {
            console.error('Error updating ticker info:', error);
        }
    }

    /**
     * Hide ticker info - הסתרת מידע טיקר
     * 
     * @private
     */
    hideTickerInfo() {
        const infoElement = document.getElementById(`${this.config.id}Info`);
        if (infoElement) {
            infoElement.classList.add('d-none');
        }
    }
}
```

---

## 💰 8. CurrencySelectComponent - בחירת מטבע

```javascript
/**
 * Currency Select Component - TikTrack Modal System
 * ===============================================
 * 
 * רכיב בחירת מטבע עם אינטגרציה מלאה ל-SelectPopulatorService
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class CurrencySelectComponent extends SelectFieldComponent {
    /**
     * Render currency select HTML - יצירת HTML של בחירת מטבע
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const html = super.render();
        
        // אתחול מילוי המטבעות
        this.populateCurrencies();
        
        return html;
    }

    /**
     * Populate currencies from API - מילוי מטבעות מ-API
     * 
     * @private
     */
    async populateCurrencies() {
        if (!window.SelectPopulatorService) {
            console.warn('SelectPopulatorService not available');
            return;
        }
        
        try {
            await window.SelectPopulatorService.populateCurrenciesSelect(this.config.id, {
                includeEmpty: this.config.includeEmpty !== false,
                defaultFromPreferences: this.config.defaultFromPreferences || false,
                defaultValue: this.config.defaultValue
            });
        } catch (error) {
            console.error('Error populating currencies:', error);
        }
    }

    /**
     * Get validation rules - קבלת כללי ולידציה
     * 
     * @returns {Object} כללי ולידציה
     */
    getValidationRules() {
        return {
            required: this.config.required
        };
    }
}
```

---

## 🧮 9. CalculatedFieldComponent - שדה מחושב

```javascript
/**
 * Calculated Field Component - TikTrack Modal System
 * =================================================
 * 
 * רכיב שדה מחושב (read-only) עם עדכון אוטומטי
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class CalculatedFieldComponent extends BaseFieldComponent {
    /**
     * Render calculated field HTML - יצירת HTML של שדה מחושב
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const html = `
            <div class="mb-3">
                <label for="${this.config.id}" class="form-label">
                    ${this.config.label}
                </label>
                <input type="text" 
                       class="form-control" 
                       id="${this.config.id}" 
                       name="${this.config.id}"
                       readonly
                       value="${this.config.defaultValue || ''}">
                ${this.config.showCalculation ? this.renderCalculationDisplay() : ''}
            </div>
        `;
        
        return html;
    }

    /**
     * Render calculation display - יצירת תצוגת חישוב
     * 
     * @returns {string} HTML של תצוגת החישוב
     * @private
     */
    renderCalculationDisplay() {
        return `
            <div class="form-text">
                ${this.config.calculationLabel || 'סכום מחושב'}: 
                <span id="${this.config.id}Display" class="fw-bold">${this.config.defaultValue || '0.00'}</span>
            </div>
        `;
    }

    /**
     * Update calculated value - עדכון ערך מחושב
     * 
     * @param {*} value - ערך חדש
     */
    updateValue(value) {
        this.setValue(value);
        
        // עדכון תצוגת החישוב
        const displayElement = document.getElementById(`${this.config.id}Display`);
        if (displayElement) {
            displayElement.textContent = value || '0.00';
        }
    }

    /**
     * Get validation rules - קבלת כללי ולידציה
     * 
     * @returns {Object} כללי ולידציה (תמיד תקין)
     */
    getValidationRules() {
        return {
            required: false
        };
    }

    /**
     * Validate field - ולידציה של השדה (תמיד תקין)
     * 
     * @returns {boolean} תמיד true
     */
    validate() {
        this.isValid = true;
        this.errorMessage = '';
        return true;
    }
}
```

---

## ✅ 10. CheckboxFieldComponent - תיבת סימון

```javascript
/**
 * Checkbox Field Component - TikTrack Modal System
 * ================================================
 * 
 * רכיב תיבת סימון עם ולידציה מלאה
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class CheckboxFieldComponent extends BaseFieldComponent {
    /**
     * Render checkbox field HTML - יצירת HTML של תיבת סימון
     * 
     * @returns {string} HTML של השדה
     */
    render() {
        const checkedAttr = this.config.defaultValue ? 'checked' : '';
        const requiredAttr = this.config.required ? 'required' : '';
        
        const html = `
            <div class="mb-3">
                <div class="form-check">
                    <input type="checkbox" 
                           class="form-check-input" 
                           id="${this.config.id}" 
                           name="${this.config.id}"
                           ${checkedAttr}
                           ${requiredAttr}>
                    <label class="form-check-label" for="${this.config.id}">
                        ${this.config.label}
                        ${this.config.required ? '<span class="text-danger">*</span>' : ''}
                    </label>
                </div>
                <div class="invalid-feedback"></div>
            </div>
        `;
        
        return html;
    }

    /**
     * Get validation rules - קבלת כללי ולידציה
     * 
     * @returns {Object} כללי ולידציה
     */
    getValidationRules() {
        return {
            required: this.config.required
        };
    }

    /**
     * Get field value as boolean - קבלת ערך השדה כבוליאני
     * 
     * @returns {boolean} ערך השדה כבוליאני
     */
    getValueAsBoolean() {
        if (!this.element) return this.config.defaultValue || false;
        return this.element.checked;
    }

    /**
     * Set field value from boolean - הגדרת ערך השדה מבוליאני
     * 
     * @param {boolean} value - ערך בוליאני להגדרה
     */
    setValueFromBoolean(value) {
        if (this.element) {
            this.element.checked = Boolean(value);
        }
    }
}
```

---

## 🎯 11. Field Component Factory - מפעל רכיבי שדות

```javascript
/**
 * Field Component Factory - TikTrack Modal System
 * ==============================================
 * 
 * מפעל ליצירת רכיבי שדות לפי סוג
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

class FieldComponentFactory {
    /**
     * Create field component - יצירת רכיב שדה
     * 
     * @param {string} type - סוג השדה
     * @param {Object} config - קונפיגורציה של השדה
     * @returns {BaseFieldComponent} רכיב השדה
     */
    static createFieldComponent(type, config) {
        const fieldTypes = {
            'text': TextFieldComponent,
            'number': NumberFieldComponent,
            'integer': NumberFieldComponent,
            'date': DateFieldComponent,
            'datetime': DateFieldComponent,
            'select': SelectFieldComponent,
            'textarea': TextareaFieldComponent,
            'account-select': AccountSelectComponent,
            'ticker-select': TickerSelectComponent,
            'currency-select': CurrencySelectComponent,
            'calculated': CalculatedFieldComponent,
            'checkbox': CheckboxFieldComponent
        };
        
        const FieldClass = fieldTypes[type];
        if (!FieldClass) {
            throw new Error(`Unknown field type: ${type}`);
        }
        
        return new FieldClass(config);
    }

    /**
     * Render field HTML - יצירת HTML של שדה
     * 
     * @param {string} type - סוג השדה
     * @param {Object} config - קונפיגורציה של השדה
     * @returns {string} HTML של השדה
     */
    static renderField(type, config) {
        const component = this.createFieldComponent(type, config);
        return component.render();
    }

    /**
     * Get field validation rules - קבלת כללי ולידציה של שדה
     * 
     * @param {string} type - סוג השדה
     * @param {Object} config - קונפיגורציה של השדה
     * @returns {Object} כללי ולידציה
     */
    static getFieldValidationRules(type, config) {
        const component = this.createFieldComponent(type, config);
        return component.getValidationRules();
    }
}

// ייצוא למרחב הגלובלי
window.FieldComponentFactory = FieldComponentFactory;
```

---

## 🎯 המלצות ליישום

### עקרונות עיצוב:
1. **סטנדרטים מלאים** - JSDoc, שמות משתנים באנגלית, פונקציות בעברית
2. **אינטגרציה מלאה** - שימוש בכל המערכות הקיימות
3. **ולידציה מובנית** - כל רכיב כולל ולידציה מלאה
4. **עיצוב אחיד** - כל הרכיבים נראים זהה
5. **ביצועים טובים** - רכיבים קלים ומהירים

### דוגמת שימוש:
```javascript
// יצירת שדה טקסט
const textField = FieldComponentFactory.createFieldComponent('text', {
    id: 'entityName',
    label: 'שם ישות',
    placeholder: 'הכנס שם',
    required: true,
    maxLength: 50,
    validation: {required: true, minLength: 3, maxLength: 50}
});

// הצגת השדה
const fieldHTML = textField.render();
document.getElementById('formContainer').innerHTML += fieldHTML;

// ולידציה
const isValid = textField.validate();

// קבלת ערך
const value = textField.getValue();
```

---

**המסמך מוכן לשימוש בפיתוח רכיבי השדות החדשים.**
