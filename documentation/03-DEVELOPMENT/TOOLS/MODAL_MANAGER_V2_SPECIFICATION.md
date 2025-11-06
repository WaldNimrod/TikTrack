# ModalManagerV2 Specification - TikTrack Modal System
## תכנון מפורט של מנהל המודלים המרכזי החדש

**תאריך יצירה**: 12 בינואר 2025  
**מטרה**: תכנון מפורט של ModalManagerV2 עם אינטגרציה מלאה בכל המערכות הקיימות

---

## 📊 סיכום כללי

**שדרוג**: ModalManager הקיים → ModalManagerV2  
**אינטגרציה**: 7 מערכות קיימות  
**תכונות חדשות**: CRUD מאוחד, Field Components, Configuration-driven  
**תמיכה**: RTL מלא, ITCSS, רספונסיבי

---

## 🏗️ מבנה המחלקה

### ModalManagerV2 Class
```javascript
/**
 * ModalManagerV2 - TikTrack Modal System
 * =====================================
 * 
 * מנהל מודלים מרכזי מתקדם עם תמיכה מלאה ב-CRUD operations
 * ואינטגרציה עם כל המערכות הקיימות במערכת TikTrack
 * 
 * @version 2.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - יצירת מודלים דינמית מקונפיגורציה
 * - אינטגרציה מלאה עם כל המערכות הקיימות
 * - תמיכה ב-RTL מלא
 * - עיצוב ITCSS
 * - ביצועים אופטימליים
 */

class ModalManagerV2 {
    /**
     * Constructor - אתחול ModalManagerV2
     * 
     * @constructor
     */
    constructor() {
        this.modals = new Map();
        this.configurations = new Map();
        this.activeModal = null;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize ModalManagerV2 - אתחול המערכת
     * 
     * @private
     */
    init() {
        try {
            this.setupEventListeners();
            this.loadDefaultConfigurations();
            this.isInitialized = true;
            
            // הוספה לאובייקט הגלובלי
            window.ModalManagerV2 = this;
            
            console.log('ModalManagerV2 initialized successfully');
        } catch (error) {
            console.error('Error initializing ModalManagerV2:', error);
        }
    }

    /**
     * Setup event listeners - הגדרת מאזיני אירועים
     * 
     * @private
     */
    setupEventListeners() {
        // מאזין לסגירת מודלים
        document.addEventListener('hidden.bs.modal', (event) => {
            this.handleModalHidden(event.target);
        });
        
        // מאזין לפתיחת מודלים
        document.addEventListener('shown.bs.modal', (event) => {
            this.handleModalShown(event.target);
        });
        
        // מאזין לשינוי העדפות משתמש
        if (window.PreferencesSystem) {
            window.PreferencesSystem.onPreferencesChanged(() => {
                this.updateAllModalColors();
            });
        }
    }

    /**
     * Load default configurations - טעינת קונפיגורציות ברירת מחדל
     * 
     * @private
     */
    loadDefaultConfigurations() {
        // טעינת קונפיגורציות מקבצי config
        const configFiles = [
            'cash-flows-config.js',
            'notes-config.js',
            'trading-accounts-config.js',
            'tickers-config.js',
            'executions-config.js',
            'alerts-config.js',
            'trade-plans-config.js',
            'trades-config.js'
        ];
        
        configFiles.forEach(configFile => {
            this.loadConfiguration(configFile);
        });
    }
}
```

---

## 🔧 פונקציות עיקריות

### 1. יצירת מודלים

```javascript
/**
 * Create CRUD modal from configuration - יצירת מודל CRUD מקונפיגורציה
 * 
 * @param {Object} config - קונפיגורציה של המודל
 * @param {string} config.id - מזהה המודל
 * @param {string} config.entityType - סוג הישות
 * @param {Object} config.title - כותרות המודל
 * @param {string} config.size - גודל המודל (sm, lg, xl)
 * @param {string} config.headerType - סוג הכותרת (colored, danger, success, info, warning)
 * @param {Array} config.fields - שדות המודל
 * @param {Object} config.validation - כללי ולידציה
 * @param {string} config.onSave - פונקציית שמירה
 * @returns {HTMLElement} אלמנט המודל
 */
createCRUDModal(config) {
    try {
        // בדיקת תקינות קונפיגורציה
        this.validateConfiguration(config);
        
        // יצירת HTML המודל
        const modalHTML = this.generateModalHTML(config);
        
        // הוספה לדף
        const modalElement = this.insertModalIntoDOM(modalHTML);
        
        // אתחול כל המערכות
        this.initializeModalSystems(modalElement, config);
        
        // שמירה במפה
        this.modals.set(config.id, {
            element: modalElement,
            config: config,
            isActive: false
        });
        
        return modalElement;
    } catch (error) {
        console.error(`Error creating CRUD modal ${config.id}:`, error);
        throw error;
    }
}

/**
 * Generate modal HTML - יצירת HTML של המודל
 * 
 * @param {Object} config - קונפיגורציה של המודל
 * @returns {string} HTML של המודל
 * @private
 */
generateModalHTML(config) {
    const fieldsHTML = this.generateFieldsHTML(config.fields);
    
    return `
        <div class="modal fade" id="${config.id}" tabindex="-1" 
             aria-labelledby="${config.id}Label" aria-hidden="true"
             data-bs-backdrop="true" data-bs-keyboard="true">
            <div class="modal-dialog modal-${config.size || 'lg'}">
                <div class="modal-content">
                    <div class="modal-header modal-header-${config.headerType || 'colored'}">
                        <h5 class="modal-title" id="${config.id}Label">${config.title.add || 'הוספת ישות'}</h5>
                        <button data-button-type="CLOSE" data-bs-dismiss="modal" 
                                data-text="סגור" aria-label="סגור"></button>
                    </div>
                    <div class="modal-body">
                        <form id="${config.id}Form">
                            ${fieldsHTML}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button data-button-type="CANCEL" data-bs-dismiss="modal" 
                                data-text="ביטול"></button>
                        <button data-button-type="SAVE" data-onclick="${config.onSave}" 
                                data-text="שמור"></button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate fields HTML - יצירת HTML של השדות
 * 
 * @param {Array} fields - רשימת שדות
 * @returns {string} HTML של השדות
 * @private
 */
generateFieldsHTML(fields) {
    if (!fields || !Array.isArray(fields)) {
        return '';
    }
    
    return fields.map(field => {
        return window.FieldComponentFactory.renderField(field.type, field);
    }).join('');
}
```

### 2. הצגת מודלים

```javascript
/**
 * Show modal with mode and data - הצגת מודל עם מצב ונתונים
 * 
 * @param {string} modalId - מזהה המודל
 * @param {string} mode - מצב המודל (add, edit, view)
 * @param {Object} entityData - נתוני הישות (לעריכה/צפייה)
 * @returns {Promise<void>}
 */
async showModal(modalId, mode = 'add', entityData = null) {
    try {
        // בדיקה שהמודל קיים
        if (!this.modals.has(modalId)) {
            throw new Error(`Modal ${modalId} not found`);
        }
        
        const modalInfo = this.modals.get(modalId);
        const modalElement = modalInfo.element;
        
        // עדכון כותרת לפי מצב
        this.updateModalTitle(modalElement, modalInfo.config, mode);
        
        // איפוס טופס
        this.resetForm(modalElement);
        
        // מילוי נתונים אם במצב עריכה/צפייה
        if (mode === 'edit' && entityData) {
            await this.populateForm(modalElement, entityData);
        }
        
        // הפעלת ולידציה
        this.initializeValidation(modalElement, modalInfo.config);
        
        // הפעלת מערכת הכפתורים
        this.initializeButtons(modalElement);
        
        // יישום צבעים
        this.applyUserColors(modalElement, modalInfo.config.entityType);
        
        // מילוי selects
        await this.populateSelects(modalElement, modalInfo.config);
        
        // הצגת המודל
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // עדכון מצב
        modalInfo.isActive = true;
        this.activeModal = modalId;
        
    } catch (error) {
        console.error(`Error showing modal ${modalId}:`, error);
        throw error;
    }
}

/**
 * Show edit modal with entity data - הצגת מודל עריכה עם נתוני ישות
 * 
 * @param {string} modalId - מזהה המודל
 * @param {string} entityType - סוג הישות
 * @param {string|number} entityId - מזהה הישות
 * @returns {Promise<void>}
 */
async showEditModal(modalId, entityType, entityId) {
    try {
        // טעינת נתוני הישות
        const entityData = await this.loadEntityData(entityType, entityId);
        
        if (!entityData) {
            throw new Error(`Entity ${entityType} with ID ${entityId} not found`);
        }
        
        // הצגת מודל במצב עריכה
        await this.showModal(modalId, 'edit', entityData);
        
    } catch (error) {
        console.error(`Error showing edit modal for ${entityType} ${entityId}:`, error);
        throw error;
    }
}

/**
 * Load entity data from API - טעינת נתוני ישות מ-API
 * 
 * @param {string} entityType - סוג הישות
 * @param {string|number} entityId - מזהה הישות
 * @returns {Promise<Object|null>} נתוני הישות
 * @private
 */
async loadEntityData(entityType, entityId) {
    try {
        const response = await fetch(`/api/${entityType}/${entityId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || result;
        
    } catch (error) {
        console.error(`Error loading entity data for ${entityType} ${entityId}:`, error);
        return null;
    }
}
```

### 3. ניהול טפסים

```javascript
/**
 * Reset form - איפוס טופס
 * 
 * @param {HTMLElement} modalElement - אלמנט המודל
 * @param {string} formId - מזהה הטופס (אופציונלי)
 */
resetForm(modalElement, formId = null) {
    const form = formId ? 
        modalElement.querySelector(`#${formId}`) : 
        modalElement.querySelector('form');
    
    if (!form) return;
    
    // איפוס כל השדות
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // ניקוי שגיאות ולידציה
    this.clearValidationErrors(form);
    
    // מילוי ברירות מחדל מהעדפות
    this.applyDefaultValues(form);
}

/**
 * Populate form with data - מילוי טופס עם נתונים
 * 
 * @param {HTMLElement} modalElement - אלמנט המודל
 * @param {Object} data - נתונים למילוי
 * @param {string} formId - מזהה הטופס (אופציונלי)
 */
populateForm(modalElement, data, formId = null) {
    const form = formId ? 
        modalElement.querySelector(`#${formId}`) : 
        modalElement.querySelector('form');
    
    if (!form || !data) return;
    
    // מילוי שדות רגילים
    Object.entries(data).forEach(([key, value]) => {
        const field = form.querySelector(`#${key}, [name="${key}"]`);
        if (field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = Boolean(value);
            } else {
                field.value = value || '';
            }
        }
    });
    
    // מילוי selects מיוחדים
    this.populateSpecialSelects(form, data);
}

/**
 * Apply default values from preferences - יישום ברירות מחדל מהעדפות
 * 
 * @param {HTMLElement} form - אלמנט הטופס
 * @private
 */
applyDefaultValues(form) {
    if (!window.PreferencesSystem) return;
    
    const preferences = window.PreferencesSystem.manager?.currentPreferences || {};
    
    // ברירת מחדל לחשבון המסחר
    const accountField = form.querySelector('[id*="Account"], [name*="account"]');
    if (accountField && preferences.defaultTradingAccount) {
        accountField.value = preferences.defaultTradingAccount;
    }
    
    // ברירת מחדל למטבע
    const currencyField = form.querySelector('[id*="Currency"], [name*="currency"]');
    if (currencyField && preferences.defaultCurrency) {
        currencyField.value = preferences.defaultCurrency;
    }
    
    // ברירת מחדל לתאריך - היום
    const dateField = form.querySelector('input[type="date"], input[type="datetime-local"]');
    if (dateField && !dateField.value) {
        const today = new Date();
        const dateValue = dateField.type === 'datetime-local' 
            ? today.toISOString().slice(0, 16) 
            : today.toISOString().slice(0, 10);
        dateField.value = dateValue;
    }
}
```

### 4. אינטגרציה עם מערכות קיימות

```javascript
/**
 * Initialize validation system - אתחול מערכת הולידציה
 * 
 * @param {HTMLElement} modalElement - אלמנט המודל
 * @param {Object} config - קונפיגורציה של המודל
 * @private
 */
initializeValidation(modalElement, config) {
    if (!window.initializeValidation || !config.validation) return;
    
    const form = modalElement.querySelector('form');
    if (!form) return;
    
    // יצירת כללי ולידציה
    const validationRules = {};
    config.fields.forEach(field => {
        if (field.validation) {
            validationRules[field.id] = field.validation;
        }
    });
    
    // אתחול ולידציה
    window.initializeValidation(form.id, validationRules);
}

/**
 * Initialize button system - אתחול מערכת הכפתורים
 * 
 * @param {HTMLElement} modalElement - אלמנט המודל
 * @private
 */
initializeButtons(modalElement) {
    if (!window.advancedButtonSystem) return;
    
    // עיבוד כל הכפתורים במודל
    window.advancedButtonSystem.processButtons(modalElement);
}

/**
 * Apply user colors - יישום צבעי משתמש
 * 
 * @param {HTMLElement} modalElement - אלמנט המודל
 * @param {string} entityType - סוג הישות
 * @private
 */
applyUserColors(modalElement, entityType) {
    if (!entityType || !window.getEntityColor) return;
    
    const header = modalElement.querySelector('.modal-header');
    if (!header) return;
    
    // עדכון צבע כותרת - רקע בהיר
    const entityColorLight = window.getEntityColor(entityType);
    const entityColorDark = window.getEntityDarkColor(entityType);
    
    header.style.background = `linear-gradient(135deg, ${entityColorLight}, ${entityColorDark})`;
    
    // עדכון צבע כותרת הטקסט - כהה
    const title = header.querySelector('.modal-title');
    if (title) {
        title.style.color = entityColorDark;
    }
    
    // עדכון צבעי כפתורים
    const closeButton = modalElement.querySelector('[data-button-type="CLOSE"]');
    if (closeButton) {
        closeButton.style.color = entityColorDark;
        closeButton.style.borderColor = entityColorDark;
    }
    
    const saveButton = modalElement.querySelector('[data-button-type="SAVE"]');
    if (saveButton) {
        saveButton.style.color = entityColorDark;
        saveButton.style.borderColor = entityColorDark;
    }
    
    const cancelButton = modalElement.querySelector('[data-button-type="CANCEL"]');
    if (cancelButton) {
        // כפתור ביטול - צבע אזהרה
        cancelButton.style.color = 'var(--warning-color, #fc5a06)';
        cancelButton.style.borderColor = 'var(--warning-color, #fc5a06)';
    }
}

/**
 * Populate selects - מילוי רשימות בחירה
 * 
 * @param {HTMLElement} modalElement - אלמנט המודל
 * @param {Object} config - קונפיגורציה של המודל
 * @private
 */
async populateSelects(modalElement, config) {
    if (!window.SelectPopulatorService) return;
    
    const selects = modalElement.querySelectorAll('select');
    
    for (const select of selects) {
        const selectId = select.id;
        
        try {
            // מילוי לפי סוג השדה
            if (selectId.includes('Account') || selectId.includes('account')) {
                await window.SelectPopulatorService.populateAccountsSelect(selectId, {
                    defaultFromPreferences: true
                });
            } else if (selectId.includes('Ticker') || selectId.includes('ticker')) {
                await window.SelectPopulatorService.populateTickersSelect(selectId, {
                    includeEmpty: true
                });
            } else if (selectId.includes('Currency') || selectId.includes('currency')) {
                await window.SelectPopulatorService.populateCurrenciesSelect(selectId, {
                    defaultFromPreferences: true
                });
            } else if (selectId.includes('TradePlan') || selectId.includes('tradePlan')) {
                await window.SelectPopulatorService.populateTradePlansSelect(selectId, {
                    includeEmpty: true
                });
            }
        } catch (error) {
            console.warn(`Error populating select ${selectId}:`, error);
        }
    }
}
```

### 5. ניהול אירועים

```javascript
/**
 * Handle modal shown event - טיפול באירוע הצגת מודל
 * 
 * @param {HTMLElement} modalElement - אלמנט המודל
 * @private
 */
handleModalShown(modalElement) {
    const modalId = modalElement.id;
    
    if (this.modals.has(modalId)) {
        this.modals.get(modalId).isActive = true;
        this.activeModal = modalId;
    }
    
    // פוקוס על השדה הראשון
    const firstInput = modalElement.querySelector('input:not([readonly]), select, textarea');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

/**
 * Handle modal hidden event - טיפול באירוע הסתרת מודל
 * 
 * @param {HTMLElement} modalElement - אלמנט המודל
 * @private
 */
handleModalHidden(modalElement) {
    const modalId = modalElement.id;
    
    if (this.modals.has(modalId)) {
        this.modals.get(modalId).isActive = false;
    }
    
    if (this.activeModal === modalId) {
        this.activeModal = null;
    }
    
    // ניקוי שגיאות ולידציה
    const form = modalElement.querySelector('form');
    if (form) {
        this.clearValidationErrors(form);
    }
}

/**
 * Clear validation errors - ניקוי שגיאות ולידציה
 * 
 * @param {HTMLElement} form - אלמנט הטופס
 * @private
 */
clearValidationErrors(form) {
    const invalidFields = form.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    });
    
    const errorMessages = form.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(error => {
        error.remove();
    });
}
```

### 6. פונקציות עזר

```javascript
/**
 * Validate configuration - ולידציה של קונפיגורציה
 * 
 * @param {Object} config - קונפיגורציה לבדיקה
 * @throws {Error} אם הקונפיגורציה לא תקינה
 * @private
 */
validateConfiguration(config) {
    if (!config.id) {
        throw new Error('Modal ID is required');
    }
    
    if (!config.entityType) {
        throw new Error('Entity type is required');
    }
    
    if (!config.fields || !Array.isArray(config.fields)) {
        throw new Error('Fields array is required');
    }
    
    if (!config.onSave) {
        throw new Error('Save function is required');
    }
}

/**
 * Insert modal into DOM - הוספת מודל ל-DOM
 * 
 * @param {string} modalHTML - HTML של המודל
 * @returns {HTMLElement} אלמנט המודל
 * @private
 */
insertModalIntoDOM(modalHTML) {
    // יצירת אלמנט זמני
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    
    const modalElement = tempDiv.firstElementChild;
    
    // הוספה לדף
    document.body.appendChild(modalElement);
    
    return modalElement;
}

/**
 * Update modal title - עדכון כותרת המודל
 * 
 * @param {HTMLElement} modalElement - אלמנט המודל
 * @param {Object} config - קונפיגורציה של המודל
 * @param {string} mode - מצב המודל
 * @private
 */
updateModalTitle(modalElement, config, mode) {
    const titleElement = modalElement.querySelector('.modal-title');
    if (!titleElement) return;
    
    const title = config.title && config.title[mode] ? 
        config.title[mode] : 
        `${mode === 'add' ? 'הוספת' : mode === 'edit' ? 'עריכת' : 'צפייה ב'}${config.entityType}`;
    
    titleElement.textContent = title;
}

/**
 * Update all modal colors - עדכון צבעי כל המודלים
 * 
 * @private
 */
updateAllModalColors() {
    this.modals.forEach((modalInfo, modalId) => {
        if (modalInfo.isActive) {
            this.applyUserColors(modalInfo.element, modalInfo.config.entityType);
        }
    });
}

/**
 * Load configuration - טעינת קונפיגורציה
 * 
 * @param {string} configFile - שם קובץ הקונפיגורציה
 * @private
 */
loadConfiguration(configFile) {
    // הטעינה תתבצע על ידי הוספת script tag
    const script = document.createElement('script');
    script.src = `scripts/modal-configs/${configFile}`;
    script.async = true;
    document.head.appendChild(script);
}

/**
 * Get modal info - קבלת מידע על מודל
 * 
 * @param {string} modalId - מזהה המודל
 * @returns {Object|null} מידע על המודל
 */
getModalInfo(modalId) {
    return this.modals.get(modalId) || null;
}

/**
 * Get active modal - קבלת המודל הפעיל
 * 
 * @returns {string|null} מזהה המודל הפעיל
 */
getActiveModal() {
    return this.activeModal;
}

/**
 * Close active modal - סגירת המודל הפעיל
 */
closeActiveModal() {
    if (this.activeModal) {
        const modalElement = document.getElementById(this.activeModal);
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    }
}

/**
 * Destroy modal - השמדת מודל
 * 
 * @param {string} modalId - מזהה המודל
 */
destroyModal(modalId) {
    if (this.modals.has(modalId)) {
        const modalInfo = this.modals.get(modalId);
        
        // הסרה מה-DOM
        if (modalInfo.element && modalInfo.element.parentNode) {
            modalInfo.element.parentNode.removeChild(modalInfo.element);
        }
        
        // הסרה מהמפה
        this.modals.delete(modalId);
        
        // עדכון מודל פעיל
        if (this.activeModal === modalId) {
            this.activeModal = null;
        }
    }
}
```

---

## 🎯 דוגמת שימוש מלא

### יצירת מודל CRUD:
```javascript
// יצירת מודל תזרימי מזומנים
const cashFlowModal = ModalManagerV2.createCRUDModal({
    id: 'cashFlowModal',
    entityType: 'cash_flow',
    title: {
        add: 'הוספת תזרים מזומנים',
        edit: 'עריכת תזרים מזומנים'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        {
            type: 'account-select',
            id: 'cashFlowAccount',
            label: 'חשבון מסחר',
            required: true,
            defaultFromPreferences: true // ברירת מחדל מהעדפות
        },
        {
            type: 'select',
            id: 'cashFlowType',
            label: 'סוג',
            required: true,
            options: [
                { value: 'deposit', label: 'הפקדה' },
                { value: 'withdrawal', label: 'משיכה' }
            ]
        },
        {
            type: 'number',
            id: 'cashFlowAmount',
            label: 'סכום',
            required: true,
            min: 0.01,
            step: 0.01
        },
        {
            type: 'date',
            id: 'cashFlowDate',
            label: 'תאריך',
            required: true,
            defaultValue: 'today' // ברירת מחדל היום
        },
        {
            type: 'currency-select',
            id: 'cashFlowCurrency',
            label: 'מטבע',
            required: true,
            defaultFromPreferences: true // ברירת מחדל מהעדפות
        }
    ],
    validation: {
        cashFlowAmount: { required: true, min: 0.01 }
    },
    onSave: 'saveCashFlow'
});

// הצגת מודל הוספה
await ModalManagerV2.showModal('cashFlowModal', 'add');

// הצגת מודל עריכה
await ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', 123);
```

---

## 🎯 המלצות ליישום

### עקרונות עיצוב:
1. **אינטגרציה מלאה** - שימוש בכל המערכות הקיימות
2. **ביצועים טובים** - lazy loading ו-caching
3. **טיפול בשגיאות** - try-catch בכל הפונקציות
4. **תיעוד מלא** - JSDoc לכל פונקציה
5. **תאימות לאחור** - תמיכה ב-ModalManager הישן

### דרישות טכניות:
1. **Bootstrap 5** - תמיכה מלאה
2. **RTL מלא** - כיוון ימין-שמאל
3. **ITCSS** - אפס inline styles
4. **Accessibility** - תמיכה ב-ARIA labels
5. **Performance** - טעינה מהירה ויעילה

---

**המסמך מוכן לשימוש בפיתוח ModalManagerV2 החדש.**
