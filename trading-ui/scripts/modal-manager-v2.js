/**
 * Modal Manager V2 - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the central modal management system with full CRUD operations support
 * and integration with all existing TikTrack systems.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/MODAL_SYSTEM_V2.md
 * - documentation/02-ARCHITECTURE/FRONTEND/MODAL_MANAGEMENT_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 2.1.0
 * Last Updated: 2025-01-27
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
        // רק cash-flows-config נטען כרגע
        // שאר הקבצים יטענו כשנצור אותם
    }

    /**
     * Create CRUD modal from configuration - יצירת מודל CRUD מקונפיגורציה
     * 
     * @param {Object} config - קונפיגורציה של המודל
     * @param {string} config.id - מזהה המודל
     * @param {string} config.entityType - סוג הישות
     * @param {Object} config.title - כותרות המודל
     * @param {string} config.size - גודל המודל (sm, lg, xl)
     * @param {string} config.headerType - סוג הכותרת (dynamic)
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
                        <div class="modal-header modal-header-dynamic" 
                             style="background: linear-gradient(135deg, var(--current-entity-color-light), var(--current-entity-color-dark))">
                            <h5 class="modal-title" id="${config.id}Label" style="color: var(--current-entity-color-dark)">${config.title.add || 'הוספת ישות'}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" 
                                    aria-label="סגור"></button>
                        </div>
                        <div class="modal-body">
                            <form id="${config.id}Form">
                                ${fieldsHTML}
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" data-button-type="CANCEL" data-variant="normal" 
                                    data-bs-dismiss="modal" data-text="ביטול"></button>
                            <button type="button" id="${config.id}SaveBtn" data-button-type="SAVE" data-variant="normal" 
                                    data-onclick="${config.onSave}()" data-text="שמור"></button>
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
        
        // ארגון השדות בעמודות - 2-3 עמודות לפי הדגשי העיצוב
        const fieldsPerRow = 2; // 2 עמודות כמו שביקשת
        const rows = [];
        
        for (let i = 0; i < fields.length; i += fieldsPerRow) {
            const rowFields = fields.slice(i, i + fieldsPerRow);
            const rowHTML = `
                <div class="row">
                    ${rowFields.map(field => `
                        <div class="col-md-6">
                            ${this.renderField(field)}
                        </div>
                    `).join('')}
                </div>
            `;
            rows.push(rowHTML);
        }
        
        return rows.join('');
    }

    /**
     * Render field - יצירת HTML של שדה
     * 
     * @param {Object} field - קונפיגורציה של השדה
     * @returns {string} HTML של השדה
     * @private
     */
    renderField(field) {
        const requiredAttr = field.required ? 'required' : '';
        const requiredStar = field.required ? '<span class="text-danger">*</span>' : '';
        const disabledAttr = field.disabled ? 'disabled' : '';
        
        switch (field.type) {
            case 'text':
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <input type="text" 
                               class="form-control" 
                               id="${field.id}" 
                               name="${field.id}"
                               ${requiredAttr}
                               ${disabledAttr}
                               placeholder="${field.placeholder || ''}"
                               value="${field.defaultValue || ''}">
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'number':
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <input type="number" 
                               class="form-control" 
                               id="${field.id}" 
                               name="${field.id}"
                               ${requiredAttr}
                               ${disabledAttr}
                               ${field.min ? `min="${field.min}"` : ''}
                               ${field.max ? `max="${field.max}"` : ''}
                               ${field.step ? `step="${field.step}"` : ''}
                               value="${field.defaultValue || ''}">
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'date':
            case 'datetime-local':
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <input type="${field.type === 'datetime-local' ? 'datetime-local' : (field.dateTime ? 'datetime-local' : 'date')}" 
                               class="form-control" 
                               id="${field.id}" 
                               name="${field.id}"
                               ${requiredAttr}
                               value="${field.defaultValue || ''}">
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'select':
                let optionsHTML = '';
                if (field.includeEmpty !== false) {
                    const emptyText = field.emptyText || 'בחר...';
                    optionsHTML += `<option value="">${emptyText}</option>`;
                }
                
                if (field.options && Array.isArray(field.options)) {
                    field.options.forEach(option => {
                        const value = option.value || option.id || option;
                        const label = option.label || option.name || option;
                        const selected = field.defaultValue === value ? 'selected' : '';
                        optionsHTML += `<option value="${value}" ${selected}>${label}</option>`;
                    });
                }
                
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <select class="form-select" 
                                id="${field.id}" 
                                name="${field.id}"
                                ${requiredAttr}>
                            ${optionsHTML}
                        </select>
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'textarea':
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <textarea class="form-control" 
                                  id="${field.id}" 
                                  name="${field.id}"
                                  ${requiredAttr}
                                  rows="${field.rows || 4}"
                                  placeholder="${field.placeholder || ''}">${field.defaultValue || ''}</textarea>
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            default:
                console.warn(`Unknown field type: ${field.type}`);
                return '';
        }
    }

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
            
            // הפעלת ולידציה
            this.initializeValidation(modalElement, modalInfo.config);
            
            // הפעלת מערכת הכפתורים
            this.initializeButtons(modalElement);
            
            // יישום צבעים
            this.applyUserColors(modalElement, modalInfo.config.entityType);
            
            // מילוי selects (חייב להיות לפני populateForm)
            await this.populateSelects(modalElement, modalInfo.config);
            
            // מילוי נתונים אם במצב עריכה/צפייה (אחרי populateSelects!)
            if (mode === 'edit' && entityData) {
                await this.populateForm(modalElement, entityData);
            }
            
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
            // Convert singular to plural for API endpoints
            const apiEndpoint = this.getPluralEndpoint(entityType);
            const response = await fetch(`/api/${apiEndpoint}/${entityId}`);
            
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
    
    /**
     * Convert singular entity type to plural API endpoint
     * @param {string} entityType - סוג הישות ביחיד
     * @returns {string} שם ה-endpoint ברבים
     */
    getPluralEndpoint(entityType) {
        const pluralMap = {
            'cash_flow': 'cash_flows',
            'trade': 'trades',
            'trading_account': 'trading-accounts',
            'alert': 'alerts',
            'execution': 'executions',
            'ticker': 'tickers',
            'trade_plan': 'trade_plans',
            'note': 'notes'
        };
        return pluralMap[entityType] || `${entityType}s`;
    }

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
        
        // Get modal config for field mapping
        const modalInfo = this.modals.get(modalElement.id);
        const config = modalInfo?.config;
        
        // Debug: Log received data
        console.log('📝 populateForm - received data:', data);
        console.log('📝 populateForm - entity type:', config?.entityType);
        
        // Field mapping for different entities
        const fieldMapping = this.getFieldMapping(config?.entityType);
        console.log('📝 populateForm - field mapping:', fieldMapping);
        
        // Fields to ignore (metadata/relationship fields)
        const fieldsToIgnore = ['id', 'created_at', 'updated_at', 'account_name', 'currency_name', 'currency_symbol', 'usd_rate'];
        
        // מילוי שדות רגילים
        Object.entries(data).forEach(([key, value]) => {
            // Ignore metadata fields
            if (fieldsToIgnore.includes(key)) {
                console.log(`⏭️ Skipping ${key} (metadata field)`);
                return;
            }
            
            // Try direct match first
            let field = form.querySelector(`#${key}, [name="${key}"]`);
            
            // If no direct match, try field mapping
            if (!field && fieldMapping[key]) {
                field = form.querySelector(`#${fieldMapping[key]}, [name="${fieldMapping[key]}"]`);
            }
            
            if (field) {
                console.log(`✅ Found field for ${key} (value: ${value})`);
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = Boolean(value);
                } else if (field.tagName === 'SELECT') {
                    // For selects, set value directly
                    field.value = value || '';
                } else if (field.type === 'datetime-local' && value) {
                    // Convert date-only value to datetime-local format (YYYY-MM-DDTHH:MM)
                    const dateStr = typeof value === 'string' ? value : value.toString();
                    field.value = dateStr.includes('T') ? dateStr : `${dateStr}T00:00`;
                } else {
                    field.value = value || '';
                }
            } else {
                console.log(`❌ No field found for ${key} (value: ${value})`);
            }
        });
        
        // מילוי selects מיוחדים
        this.populateSpecialSelects(form, data);
    }
    
    /**
     * Get field mapping for entity type - מיפוי שדות לפי סוג ישות
     * Maps backend field names to frontend field IDs
     */
    getFieldMapping(entityType) {
        const mappings = {
            'cash_flow': {
                'amount': 'cashFlowAmount',
                'type': 'cashFlowType',
                'currency_id': 'cashFlowCurrency',
                'trading_account_id': 'cashFlowAccount',
                'date': 'cashFlowDate',
                'description': 'cashFlowDescription',
                'source': 'cashFlowSource',
                'external_id': 'cashFlowExternalId',
                'trade_id': 'cashFlowTrade',
                'trade_plan_id': 'cashFlowTradePlan'
            },
            'ticker': {
                'symbol': 'tickerSymbol',
                'name': 'tickerName',
                'sector': 'tickerSector',
                'industry': 'tickerIndustry'
            },
            'trade': {
                'account_id': 'tradeAccount',
                'ticker_id': 'tradeTicker',
                'side': 'tradeSide',
                'status': 'tradeStatus',
                'notes': 'tradeNotes'
            },
            'trade_plan': {
                'ticker_id': 'planTicker',
                'account_id': 'planAccount',
                'side': 'planSide',
                'planned_amount': 'planAmount',
                'stop_loss': 'planStopLoss',
                'target_price': 'planTargetPrice'
            },
            'alert': {
                'ticker_id': 'alertTicker',
                'condition': 'alertCondition',
                'threshold': 'alertThreshold'
            },
            'execution': {
                'trade_id': 'executionTrade',
                'ticker_id': 'executionTicker',
                'side': 'executionSide',
                'quantity': 'executionQuantity',
                'price': 'executionPrice'
            },
            'trading_account': {
                'name': 'accountName',
                'type': 'accountType',
                'currency_id': 'accountCurrency'
            },
            'note': {
                'title': 'noteTitle',
                'content': 'noteContent',
                'related_entity_type': 'noteEntityType',
                'related_entity_id': 'noteEntityId'
            }
        };
        
        return mappings[entityType] || {};
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
        
        // ברירת מחדל לחשבון מסחר מסחר - חיפוש מדויק יותר
        const accountField = form.querySelector('[id*="Account"], [name*="account"], [id*="account"], [name*="Account"]');
        if (accountField && preferences.defaultTradingAccount) {
            accountField.value = preferences.defaultTradingAccount;
            console.log('Applied default account:', preferences.defaultTradingAccount);
        }
        
        // ברירת מחדל למטבע - חיפוש מדויק יותר
        const currencyField = form.querySelector('[id*="Currency"], [name*="currency"], [id*="currency"], [name*="Currency"]');
        if (currencyField && preferences.defaultCurrency) {
            currencyField.value = preferences.defaultCurrency;
            console.log('Applied default currency:', preferences.defaultCurrency);
        }
        
        // ברירת מחדל לתאריך - היום
        const dateField = form.querySelector('input[type="date"], input[type="datetime-local"]');
        if (dateField && !dateField.value) {
            const today = new Date();
            const dateValue = dateField.type === 'datetime-local' 
                ? today.toISOString().slice(0, 16) 
                : today.toISOString().slice(0, 10);
            dateField.value = dateValue;
            console.log('Applied default date:', dateValue);
        }
        
        // ברירת מחדל למקור - ידני
        const sourceField = form.querySelector('[id*="Source"], [name*="source"], [id*="source"], [name*="Source"]');
        if (sourceField && !sourceField.value) {
            sourceField.value = 'manual';
            console.log('Applied default source: manual');
        }
    }

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
        // עיבוד כל הכפתורים במודל - מערכת הכפתורים תטפל בזה אוטומטית
        // אין צורך לקרוא לפונקציה ספציפית
    }

    /**
     * Apply user colors - יישום צבעי משתמש
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @param {string} entityType - סוג הישות
     * @private
     */
    applyUserColors(modalElement, entityType) {
        if (!entityType) return;
        
        // הוספת data attribute למודל לזיהוי סוג הישות
        modalElement.setAttribute('data-entity-type', entityType);
        
        // קבלת צבעי הישות מהמערכת הדינמית
        const entityColors = window.ENTITY_COLORS || {};
        const entityBackgroundColors = window.ENTITY_BACKGROUND_COLORS || {};
        const entityTextColors = window.ENTITY_TEXT_COLORS || {};
        
        const entityColor = entityColors[entityType] || '#26baac';
        const backgroundColor = entityBackgroundColors[entityType] || 'rgba(38, 186, 172, 0.1)';
        const textColor = entityTextColors[entityType] || '#1a9d7a';

        // הזרקת משתני CSS דינמיים למודל (ITCSS compliant)
        modalElement.style.setProperty('--modal-entity-color', entityColor);
        modalElement.style.setProperty('--modal-entity-bg', backgroundColor);
        modalElement.style.setProperty('--modal-entity-text', textColor);
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
     * Initialize modal systems - אתחול מערכות המודל
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @param {Object} config - קונפיגורציה של המודל
     * @private
     */
    initializeModalSystems(modalElement, config) {
        // אתחול מערכת הכפתורים
        this.initializeButtons(modalElement);
        
        // יישום צבעים
        this.applyUserColors(modalElement, config.entityType);
    }

    /**
     * Populate special selects - מילוי selects מיוחדים
     * 
     * @param {HTMLElement} form - אלמנט הטופס
     * @param {Object} data - נתונים למילוי
     * @private
     */
    populateSpecialSelects(form, data) {
        // מילוי selects מיוחדים לפי הצורך
        // לדוגמה: trade, tradePlan, etc.
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
}

// אתחול אוטומטי כאשר הדף נטען
document.addEventListener('DOMContentLoaded', () => {
    if (!window.ModalManagerV2) {
        new ModalManagerV2();
    }
});
