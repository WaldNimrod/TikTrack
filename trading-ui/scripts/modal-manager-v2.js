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
     * Check if required dependencies are available
     * בדיקת תלויות נדרשות
     * @private
     * @returns {Object} Dependency status
     */
    _checkDependencies() {
        return {
            preferencesSystem: {
                available: typeof window.PreferencesSystem !== 'undefined' && window.PreferencesSystem !== null,
                initialized: window.PreferencesSystem?.initialized === true
            },
            selectPopulatorService: {
                available: typeof window.SelectPopulatorService !== 'undefined' && window.SelectPopulatorService !== null
            }
        };
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
        
        // מאזין לשינוי העדפות משתמש - עם validation
        const deps = this._checkDependencies();
        if (deps.preferencesSystem.available && deps.preferencesSystem.initialized) {
            try {
                if (typeof window.PreferencesSystem.onPreferencesChanged === 'function') {
                    window.PreferencesSystem.onPreferencesChanged(() => {
                        this.updateAllModalColors();
                    });
                    console.log('✅ PreferencesSystem listener registered');
                }
            } catch (e) {
                console.warn('⚠️ Failed to register PreferencesSystem listener:', e);
            }
        } else {
            // Try to register listener later when PreferencesSystem is ready
            this._tryRegisterPreferencesListener();
            
            // Only show warning in debug mode to reduce console noise
            const DEBUG_MODE = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.search.includes('debug=true');
            if (DEBUG_MODE) {
                console.debug('⚠️ PreferencesSystem not yet available - will retry registration later');
            }
        }
    }

    /**
     * Try to register PreferencesSystem listener (called when PreferencesSystem becomes available)
     * @private
     */
    _tryRegisterPreferencesListener() {
        // Retry registration after a short delay
        setTimeout(() => {
            const deps = this._checkDependencies();
            if (deps.preferencesSystem.available && deps.preferencesSystem.initialized) {
                try {
                    if (typeof window.PreferencesSystem.onPreferencesChanged === 'function') {
                        window.PreferencesSystem.onPreferencesChanged(() => {
                            this.updateAllModalColors();
                        });
                        console.log('✅ PreferencesSystem listener registered (delayed)');
                    }
                } catch (e) {
                    // Silently fail - PreferencesSystem might not support this feature
                }
            }
        }, 2000); // Retry after 2 seconds
        
        // Also listen for preferences:loaded event
        if (typeof window.addEventListener === 'function') {
            window.addEventListener('preferences:loaded', () => {
                const deps = this._checkDependencies();
                if (deps.preferencesSystem.available && deps.preferencesSystem.initialized) {
                    try {
                        if (typeof window.PreferencesSystem.onPreferencesChanged === 'function') {
                            window.PreferencesSystem.onPreferencesChanged(() => {
                                this.updateAllModalColors();
                            });
                            console.log('✅ PreferencesSystem listener registered (via event)');
                        }
                    } catch (e) {
                        // Silently fail
                    }
                }
            }, { once: true });
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
                 data-bs-backdrop="false" data-bs-keyboard="true"
                 data-entity-type="${config.entityType || ''}">
                <div class="modal-dialog modal-${config.size || 'lg'}">
                    <div class="modal-content">
                        <div class="modal-header modal-header-colored" 
                             style="background-color: var(--current-entity-color-light) !important; border-bottom: 2px solid var(--current-entity-color-dark)">
                            <!-- Breadcrumb navigation -->
                            <div class="modal-navigation-breadcrumb" style="order: 0; width: 100%; margin-bottom: 0.5rem;"></div>
                            <h5 class="modal-title" id="${config.id}Label" style="color: var(--current-entity-color-dark) !important; order: 1;">${config.title.add || 'הוספת ישות'}</h5>
                            <!-- Back button - uses the button system -->
                            <button type="button" 
                                    data-button-type="BACK" 
                                    data-variant="small" 
                                    data-text="" 
                                    title="חזור למודול הקודם"
                                    class="modal-back-btn"
                                    style="order: 998; display: none;">
                            </button>
                            <!-- Close button -->
                            <button type="button" 
                                    data-button-type="CLOSE" 
                                    data-variant="small" 
                                    data-bs-dismiss="modal" 
                                    data-text="" 
                                    title="סגור"
                                    class="modal-close-btn"
                                    style="order: 999;">
                            </button>
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
        
        let html = '';
        let currentRow = null;
        
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            
            // אם יש rowClass או colClass - זה תחילת שורה חדשה
            if (field.rowClass || field.colClass) {
                // סגור שורה קודמת אם קיימת
                if (currentRow !== null) {
                    html += '</div>';
                    currentRow = null;
                }
                
                // פתח שורה חדשה
                const rowClass = field.rowClass || 'row';
                html += `<div class="${rowClass}">`;
                currentRow = i;
                
                // הוסף את השדה עם colClass שלו
                const colClass = field.colClass || 'col-md-6';
                html += `<div class="${colClass}">`;
                html += this.renderField(field);
                html += '</div>';
                
                // בדוק אם השדה הבא באותה שורה (יש לו rowClass/colClass)
                let nextIndex = i + 1;
                while (nextIndex < fields.length && (fields[nextIndex].rowClass || fields[nextIndex].colClass)) {
                    const nextField = fields[nextIndex];
                    const nextColClass = nextField.colClass || 'col-md-6';
                    html += `<div class="${nextColClass}">`;
                    html += this.renderField(nextField);
                    html += '</div>';
                    nextIndex++;
                }
                
                // סגור את השורה
                html += '</div>';
                i = nextIndex - 1; // המשך מהשדה הבא
                currentRow = null;
            } else {
                // שדה רגיל - הוסף אותו בשורה חדשה
                html += `<div class="row"><div class="col-12">`;
                html += this.renderField(field);
                html += '</div></div>';
            }
        }
        
        // סגור שורה אחרונה אם קיימת
        if (currentRow !== null) {
            html += '</div>';
        }
        
        return html;
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
        const readOnlyAttr = field.readOnly ? 'readonly' : '';
        
        switch (field.type) {
            case 'display':
                // שדה תצוגה בלבד - לא input
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <div id="${field.id}" class="form-control-plaintext" style="min-height: 38px; padding: 0.375rem 0.75rem;">
                            <!-- יתמלא דינמית -->
                        </div>
                        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
                    </div>
                `;
                
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
                               ${readOnlyAttr}
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
                               ${readOnlyAttr}
                               ${field.min ? `min="${field.min}"` : ''}
                               ${field.max ? `max="${field.max}"` : ''}
                               ${field.step ? `step="${field.step}"` : ''}
                               value="${field.defaultValue || ''}">
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'date':
            case 'datetime-local':
                // Handle 'today' special value for datetime-local
                let dateValue = field.defaultValue || '';
                if (dateValue === 'today') {
                    const today = new Date();
                    dateValue = today.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm                                                                   
                }
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
                               ${disabledAttr}
                               ${readOnlyAttr}
                               value="${dateValue}">
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
                
                        case 'checkbox':
                const checkedAttr = field.defaultValue === true || field.defaultValue === 'true' ? 'checked' : '';                                              
                return `
                    <div class="mb-3">
                        <div class="form-check">
                            <input type="checkbox" 
                                   class="form-check-input" 
                                   id="${field.id}" 
                                   name="${field.id}"
                                   value="true"
                                   ${checkedAttr}
                                   ${requiredAttr}
                                   ${disabledAttr}>
                            <label for="${field.id}" class="form-check-label">
                                ${field.label} ${requiredStar}
                            </label>
                        </div>
                        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}                                          
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'radio':
                let radioButtonsHTML = '';
                if (field.options && Array.isArray(field.options)) {
                    field.options.forEach((option, index) => {
                        const value = option.value || option.id || option;
                        const label = option.label || option.name || option;
                        const radioId = `${field.id}_${index}`;
                        const checked = field.defaultValue === value || field.defaultValue === String(value) ? 'checked' : '';
                        radioButtonsHTML += `
                            <div class="form-check">
                                <input type="radio" 
                                       class="form-check-input" 
                                       id="${radioId}" 
                                       name="${field.id}" 
                                       value="${value}"
                                       ${checked}
                                       ${requiredAttr}
                                       ${disabledAttr}>
                                <label for="${radioId}" class="form-check-label">
                                    ${label}
                                </label>
                            </div>
                        `;
                    });
                }
                return `
                    <div class="mb-3">
                        <label class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <div class="radio-group">
                            ${radioButtonsHTML}
                        </div>
                        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}                                          
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
            console.log(`🔍 [ModalManagerV2] showModal called:`, { modalId, mode, entityData, modalsCount: this.modals.size });
            
            // בדיקה שהמודל קיים - אם לא, ננסה ליצור אותו מהקונפיגורציה
            if (!this.modals.has(modalId)) {
                console.warn(`⚠️ [ModalManagerV2] Modal ${modalId} not found, attempting to create from configuration...`);
                
                // נסה למצוא את הקונפיגורציה וליצור את המודל
                let config = null;
                
                if (this.configurations.has(modalId)) {
                    config = this.configurations.get(modalId);
                    console.log(`✅ Found config in configurations map for ${modalId}`);
                } else {
                    // נסה למצוא את הקונפיגורציה במשתנים הגלובליים
                    // אפשרויות: modalIdConfig, modalIdModalConfig, או קונפיגורציות ספציפיות
                    const possibleNames = [
                        `${modalId}Config`,
                        `${modalId.replace('Modal', '')}ModalConfig`,
                        // Fallbacks ספציפיים לפי סוג המודל
                        modalId === 'tradingAccountsModal' ? 'tradingAccountsModalConfig' : null,
                        modalId === 'tickersModal' ? 'tickersModalConfig' : null,
                        modalId === 'executionsModal' ? 'executionsModalConfig' : null,
                        modalId === 'cashFlowModal' ? 'cashFlowModalConfig' : null
                    ].filter(Boolean); // הסרת null values
                    
                    for (const name of possibleNames) {
                        if (window[name]) {
                            config = window[name];
                            console.log(`✅ Found config in window.${name}`);
                            break;
                        }
                    }
                }
                
                if (config) {
                    try {
                        this.createCRUDModal(config);
                        console.log(`✅ Modal ${modalId} created successfully`);
                    } catch (createError) {
                        console.error(`❌ Error creating modal ${modalId}:`, createError);
                        throw createError;
                    }
                } else {
                    console.error(`❌ [ModalManagerV2] Modal ${modalId} not found and no configuration available`);
                    console.error(`   Checked: window.${modalId}Config, window.${modalId.replace('Modal', '')}ModalConfig`);
                    console.error(`   Available window properties:`, Object.keys(window).filter(k => k.includes('Modal') || k.includes('Config')));
                    if (window.showErrorNotification) {
                        window.showErrorNotification('שגיאה', `מודל ${modalId} לא נמצא. אנא רענן את הדף.`);
                    }
                    throw new Error(`Modal ${modalId} not found and could not be created - no configuration found`);
                }
                
                // בדיקה שוב שהמודל נוצר
                if (!this.modals.has(modalId)) {
                    console.error(`❌ Modal ${modalId} still not found after creation attempt`);
                    throw new Error(`Modal ${modalId} could not be created`);
                }
            }
            
            const modalInfo = this.modals.get(modalId);
            if (!modalInfo) {
                console.error(`❌ [ModalManagerV2] Modal info not found for ${modalId}`);
                throw new Error(`Modal ${modalId} info not found`);
            }
            
            const modalElement = modalInfo.element;
            if (!modalElement) {
                console.error(`❌ [ModalManagerV2] Modal element not found for ${modalId}`);
                throw new Error(`Modal ${modalId} element not found`);
            }
            
            console.log(`✅ [ModalManagerV2] Modal found, proceeding to show:`, { modalId, mode });
            
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
            // Note: populateSelects already handles defaultFromPreferences
            await this.populateSelects(modalElement, modalInfo.config);
            
            // מילוי נתונים אם במצב עריכה/צפייה (אחרי populateSelects!)
            if (mode === 'edit' && entityData) {
                await this.populateForm(modalElement, entityData);
            }
            // In add mode, defaults are applied by populateSelects for fields with defaultFromPreferences
            // Additional defaults (date, source) are handled below after modal shows
            
            // הצגת המודל - ללא backdrop (ננהל אותו מרכזית)
            if (!bootstrap || !bootstrap.Modal) {
                console.error('❌ Bootstrap Modal not available');
                if (window.showErrorNotification) {
                    window.showErrorNotification('שגיאה', 'Bootstrap לא זמין. אנא רענן את הדף.');
                }
                throw new Error('Bootstrap Modal not available');
            }
            
            // בדיקה שהאלמנט קיים ב-DOM
            if (!document.body.contains(modalElement)) {
                console.error('❌ Modal element not in DOM:', modalId);
                if (window.showErrorNotification) {
                    window.showErrorNotification('שגיאה', `מודל ${modalId} לא נמצא בדף.`);
                }
                throw new Error(`Modal element ${modalId} not in DOM`);
            }
            
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: false, // ננהל backdrop מרכזית
                keyboard: true
            });
            
            // בדיקה שהמודל נוצר בהצלחה
            if (!modal) {
                console.error('❌ Failed to create Bootstrap modal instance');
                throw new Error('Failed to create Bootstrap modal instance');
            }
            
            modal.show();
            
            // בדיקה שהמודל נפתח בהצלחה
            console.log(`✅ Modal ${modalId} shown successfully`);
            
            // ניקוי backdrops שנוצרו על ידי Bootstrap - חשוב מאוד!
            if (window.modalNavigationManager && typeof window.modalNavigationManager.manageBackdrop === 'function') {
                // קריאה מיידית ואחת נוספת אחרי זמן קצר (למקרה ש-Bootstrap יוצר backdrop אחרי show())
                window.modalNavigationManager.manageBackdrop();
                setTimeout(() => {
                    window.modalNavigationManager.manageBackdrop();
                }, 100);
            }
            
            // הוספה למערכת ניהול הניווט
            if (window.modalNavigationManager) {
                const modalNavInfo = {
                    type: 'crud-modal',
                    entityType: modalInfo.config.entityType,
                    entityId: mode === 'edit' && entityData ? entityData.id : null,
                    title: modalElement.querySelector(`#${modalId}Label`)?.textContent || modalInfo.config.title[mode] || ''
                };
                window.modalNavigationManager.pushModal(modalElement, modalNavInfo);
            }
            
            // Apply remaining defaults after modal shows (date, source, etc.)
            if (mode === 'add') {
                await this.applyRemainingDefaults(modalElement.querySelector('form'));
            }
            
            // עדכון מצב
            modalInfo.isActive = true;
            this.activeModal = modalId;
            
            // עדכון navigation UI
            if (window.modalNavigationManager) {
                window.modalNavigationManager.updateModalNavigation(modalElement);
            }
            
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
        
        // Note: applyDefaultValues is async but we don't await it here
        // It will be applied after populateForm for edit mode anyway
        this.applyDefaultValues(form).catch(err => console.warn('Error applying default values:', err));
    }

    /**
     * Populate form with data - מילוי טופס עם נתונים
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @param {Object} data - נתונים למילוי
     * @param {string} formId - מזהה הטופס (אופציונלי)
     */
    async populateForm(modalElement, data, formId = null) {
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
        const fieldsToIgnore = ['id', 'updated_at', 'account_name', 'currency_name', 'currency_symbol', 'usd_rate'];
        
        // Don't ignore created_at if it has a field mapping (e.g., alerts)
        const ignoreCreatedAt = !fieldMapping || !fieldMapping['created_at'];
        
        // מילוי שדות רגילים
        Object.entries(data).forEach(([key, value]) => {
            // Ignore metadata fields (but allow created_at if mapped)
            if (fieldsToIgnore.includes(key) || (key === 'created_at' && ignoreCreatedAt)) {
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
                
                // Check if this is a display field (div with id but not an input)
                if (field.tagName === 'DIV' && field.id && field.classList.contains('form-control-plaintext')) {
                    // Display field - set text content
                    let displayText = value || '';
                    if (key === 'created_at' || field.id === 'alertCreatedAt') {
                        // Format date for display
                        if (displayText) {
                            try {
                                const date = new Date(displayText);
                                if (!isNaN(date.getTime())) {
                                    displayText = date.toLocaleString('he-IL', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                }
                            } catch (e) {
                                // Keep original value if parsing fails
                            }
                        }
                    }
                    field.textContent = displayText;
                    console.log(`📋 Set display field ${field.id} to: ${displayText}`);
                } else if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = Boolean(value);
                } else if (field.tagName === 'SELECT') {
                    // For selects, set value directly
                    console.log(`🎯 Setting SELECT field ${field.id}:`, {
                        tryingToSet: value,
                        currentValue: field.value,
                        availableOptions: Array.from(field.options).map(opt => ({value: opt.value, text: opt.text})),                                           
                        hasOption: Array.from(field.options).some(opt => opt.value === value)                                                                   
                    });
                    field.value = value || '';
                    console.log(`🎯 After setting, field.value is: ${field.value}`);                                                                            
                } else if (field.type === 'datetime-local' && value) {
                    // Convert date-only value to datetime-local format (YYYY-MM-DDTHH:MM)                                                                      
                    const dateStr = typeof value === 'string' ? value : value.toString();                                                                       
                    field.value = dateStr.includes('T') ? dateStr : `${dateStr}T00:00`;                                                                         
                } else {
                    field.value = value || '';
                    console.log(`✏️ Set ${field.tagName}/${field.type || 'input'} field ${field.id} to: ${field.value}`);
                }
            } else {
                console.log(`❌ No field found for ${key} (value: ${value})`);
            }
        });
        
        // מילוי selects מיוחדים
        await this.populateSpecialSelects(form, data);
        
        // הוספת event listeners לשדות מיוחדים
        this.attachSpecialEventListeners(form);
    }
    
    /**
     * Attach special event listeners for form fields
     * @private
     */
    attachSpecialEventListeners(form) {
                // Event listener ל-alertRelatedType - מילוי alertRelatedObject (עכשיו select)                                                                          
        const alertRelatedTypeSelect = form.querySelector('#alertRelatedType');
        if (alertRelatedTypeSelect) {
            alertRelatedTypeSelect.addEventListener('change', async (e) => {
                const relatedTypeId = e.target.value;
                const alertRelatedObjectField = form.querySelector('#alertRelatedObject');                                                                      
                if (alertRelatedObjectField) {
                    if (relatedTypeId) {
                        alertRelatedObjectField.disabled = false;
                        await this.populateAlertRelatedObjects(form, relatedTypeId);                                                                            
                        // ניקוי הטיקר עד לבחירת אובייקט
                        await this.updateAlertTickerDisplay(form, null);
                    } else {
                        alertRelatedObjectField.disabled = true;
                        alertRelatedObjectField.innerHTML = '<option value="">בחר אובייקט...</option>';
                        // ניקוי הטיקר אם אין שיוך
                        await this.updateAlertTickerDisplay(form, null);
                    }
                }
            });
        }
        
        // Event listener ל-alertRelatedObject - עדכון טיקר אוטומטי
        const alertRelatedObjectField = form.querySelector('#alertRelatedObject');
        if (alertRelatedObjectField) {
            alertRelatedObjectField.addEventListener('change', async (e) => {
                const relatedTypeId = alertRelatedTypeSelect?.value;
                const relatedId = e.target.value;
                if (relatedTypeId && relatedId) {
                    await this.updateAlertTickerFromRelatedObject(form, relatedTypeId, relatedId);
                } else {
                    await this.updateAlertTickerDisplay(form, null);
                }
            });
        }
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
                'trading_account_id': 'tradeAccount',
                'ticker_id': 'tradeTicker',
                'side': 'tradeSide',
                'status': 'tradeStatus',
                'notes': 'tradeNotes'
            },
            'trade_plan': {
                'trading_account_id': 'tradePlanAccount',
                'ticker_id': 'planTicker',
                'side': 'planSide',
                'investment_type': 'tradePlanType', // Map investment_type to tradePlanType field
                'planned_amount': 'planAmount',
                'stop_loss': 'planStopLoss',
                'target_price': 'planTargetPrice'
            },
                        'alert': {
                'message': 'alertName',
                // ticker_id is handled separately in populateSpecialSelects (not a direct field)
                'related_type_id': 'alertRelatedType',
                'related_id': 'alertRelatedObject',
                'condition_attribute': 'alertType',
                'condition_operator': 'alertCondition',
                'condition_number': 'alertValue',
                // condition_display_text is calculated field, not stored as separate field
                'status': 'alertStatus',
                'created_at': 'alertCreatedAt',
                'trade_condition_id': 'alertTradeCondition',
                'plan_condition_id': 'alertPlanCondition'
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
    /**
     * Apply remaining defaults (non-select fields only)
     * SelectPopulatorService handles account/currency defaults
     */
    async applyRemainingDefaults(form) {
        if (!form) return;
        
        // Get modal config
        const modalElement = form.closest('.modal');
        const modalInfo = this.modals.get(modalElement?.id);
        const config = modalInfo?.config;
        
        // Apply defaults from config
        if (config && config.fields) {
            for (const field of config.fields) {
                const fieldElement = form.querySelector(`#${field.id}`);
                if (!fieldElement) continue;
                
                // Skip if field already has a value
                if (fieldElement.value) continue;
                
                // For select fields with defaultFromPreferences, let SelectPopulatorService handle it
                // BUT we still need to handle other select fields (like executionCommission which is an INPUT)
                if (fieldElement.tagName === 'SELECT') {
                    // Skip if this is an account or currency field handled by SelectPopulatorService
                    // BUT only if it doesn't have defaultFromPreferences in config
                    if (field.defaultFromPreferences) {
                        console.log(`⏭️ Skipping ${field.id} - will be handled by SelectPopulatorService`);
                        continue;
                    }
                    
                    // Skip cashFlowAccount and cashFlowCurrency (always handled by SelectPopulatorService)
                    if (field.id === 'cashFlowAccount' || field.id === 'cashFlowCurrency') {
                        continue;
                    }
                    
                    // Apply defaultValue for other select fields (e.g., source)
                    // Handle 'today' special value for datetime-local fields
                    if (field.defaultValue !== undefined && field.defaultValue !== null) {
                        if (field.type === 'datetime-local' && field.defaultValue === 'today') {
                            const today = new Date();
                            fieldElement.value = today.toISOString().slice(0, 16);
                        } else {
                            fieldElement.value = field.defaultValue;
                        }
                        console.log(`Applied default value for ${field.id}:`, fieldElement.value);
                        continue;
                    }
                    continue;
                }
                
                // Apply defaultFromPreferences first (before defaultValue)
                if (field.defaultFromPreferences) {
                    console.log(`🔍 Checking defaultFromPreferences for field: ${field.id}`);
                    if (window.getPreferenceFromMemory) {
                        const prefName = this._getPreferenceNameForField(field.id);
                        console.log(`🔍 Mapped field ${field.id} to preference: ${prefName}`);
                        if (prefName) {
                            const prefValue = await window.getPreferenceFromMemory(prefName);
                            console.log(`🔍 Retrieved preference value for ${prefName}:`, prefValue);
                            if (prefValue !== null && prefValue !== undefined) {
                                fieldElement.value = prefValue;
                                console.log(`✅ Applied preference default for ${field.id} (${prefName}):`, prefValue);
                                continue;
                            } else {
                                console.log(`⚠️ No preference value found for ${prefName}`);
                            }
                        } else {
                            console.log(`⚠️ No preference name mapping found for field: ${field.id}`);
                        }
                    } else {
                        console.log(`⚠️ getPreferenceFromMemory not available`);
                    }
                }
                
                // Apply defaultValue if exists
                if (field.defaultValue !== undefined && field.defaultValue !== null) {
                    fieldElement.value = field.defaultValue;
                    console.log(`Applied default value for ${field.id}:`, field.defaultValue);
                    continue;
                }
                
                // Apply defaultTime if field is date
                if (field.type === 'date' && field.defaultTime === 'now') {
                    const today = new Date();
                    fieldElement.value = today.toISOString().slice(0, 10);
                    console.log(`Applied default date for ${field.id}`);
                    continue;
                }
            }
        }
    }
    
    /**
     * Legacy method - kept for backward compatibility (resetForm)
     */
    async applyDefaultValues(form) {
        if (!form) return;
        
        // This is now just a wrapper for applyRemainingDefaults
        await this.applyRemainingDefaults(form);
    }
    
    /**
     * Get preference name for field - קבלת שם העדפה לשדה
     * @param {string} fieldId - Field ID
     * @returns {string|null} Preference name
     * @private
     */
    _getPreferenceNameForField(fieldId) {
        // Map field IDs to preference names
        const preferenceMap = {
            'cashFlowAccount': 'default_trading_account',
            'cashFlowCurrency': 'primaryCurrency',
            'executionAccount': 'default_trading_account',
            'executionCommission': 'defaultCommission'
        };
        
        // Try to find matching preference
        for (const [fieldPattern, prefName] of Object.entries(preferenceMap)) {
            if (fieldId.includes(fieldPattern) || fieldId === fieldPattern) {
                return prefName;
            }
        }
        
        return null;
    }
    
    /**
     * Apply preference default value for field
     * @param {Object} field - Field config
     * @param {HTMLElement} fieldElement - Field element
     * @param {Object} preferences - User preferences
     * @private
     */
    _applyPreferenceDefault(field, fieldElement, preferences) {
        // Map field IDs to preference names
        const preferenceMap = {
            'cashFlowAccount': 'default_trading_account',
            'cashFlowCurrency': 'primaryCurrency',
            'executionAccount': 'default_trading_account',
            'executionCommission': 'defaultCommission',
            'tradingAccount': 'default_trading_account',
            'currency': 'primaryCurrency'
        };
        
        // Try to find matching preference
        for (const [fieldPattern, prefName] of Object.entries(preferenceMap)) {
            if (field.id.includes(fieldPattern) || field.id === fieldPattern) {
                const prefValue = preferences[prefName];
                if (prefValue) {
                    fieldElement.value = prefValue;
                    console.log(`Applied preference default for ${field.id}:`, prefValue);
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Initialize validation system - אתחול מערכת הולידציה
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @param {Object} config - קונפיגורציה של המודל
     * @private
     */
    initializeValidation(modalElement, config) {
        if (!window.initializeValidation) return;
        
        const form = modalElement.querySelector('form');
        if (!form) return;
        
        // אתחול מערכת הוולידציה המרכזית
        // המערכת המרכזית (validation-utils.js) בודקת אוטומטית:
        // 1. שדות עם [required] attribute
        // 2. שדות תאריך (input[type="date"])
        // 3. שדות מספר (input[type="number"])
        // 4. ולידציה לפי סוגי שדות (text, email, etc.)
        // אין צורך להעביר validationRules - המערכת המרכזית עובדת לפי HTML attributes
        window.initializeValidation(form.id, {});
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
        
        // הוספת data attribute למודל לזיהוי סוג הישות - CSS ידאג לצבעים!
        modalElement.setAttribute('data-entity-type', entityType);
        
        // הוספת class גם לכותרת המודל (אם יש)
        const headerElement = modalElement.querySelector('.modal-header');
        if (headerElement) {
            // הסרת כל המחלקות הישנות
            const validEntityTypes = ['trade', 'ticker', 'account', 'trading_account', 'alert', 'cash_flow', 'cash-flow', 'note', 'trade_plan', 'trade-plan', 'execution', 'preference', 'research', 'design', 'constraint', 'development'];
            validEntityTypes.forEach(type => {
                headerElement.classList.remove(`entity-${type}`);
            });
            
            // הוספת מחלקת ישות חדשה - CSS ידאג לצבעים מההעדפות!
            const normalizedType = entityType.replace('_', '-').toLowerCase();
            headerElement.classList.add(`entity-${normalizedType}`);
        }
        
        // כל הצבעים עכשיו מגיעים מההעדפות דרך CSS - אין צורך ב-CSS variables או inline styles!
    }

    /**
     * Populate selects - מילוי רשימות בחירה
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @param {Object} config - קונפיגורציה של המודל
     * @private
     */
    async populateSelects(modalElement, config) {
        // Check dependencies with validation
        const deps = this._checkDependencies();
        
        if (!deps.selectPopulatorService.available) {
            console.warn('⚠️ SelectPopulatorService not available - select fields may not be populated correctly');
            console.warn('⚠️ Make sure SelectPopulatorService is loaded before ModalManagerV2');
            // Continue without populating - let the form work without defaults
            return;
        }
        
        const selects = modalElement.querySelectorAll('select');
        console.log(`🔍 populateSelects: Found ${selects.length} select elements`);
        
        for (const select of selects) {
            const selectId = select.id;
            
            // Check if this field has defaultFromPreferences in config
            let shouldUseDefaultFromPrefs = false;
            if (config && config.fields) {
                const fieldConfig = config.fields.find(f => f.id === selectId);
                if (fieldConfig && fieldConfig.defaultFromPreferences) {
                    shouldUseDefaultFromPrefs = true;
                }
            }
            
            try {
                // מילוי לפי סוג השדה
                if (selectId.includes('Account') || selectId.includes('account')) {
                    await window.SelectPopulatorService.populateAccountsSelect(selectId, {
                        defaultFromPreferences: shouldUseDefaultFromPrefs
                    });
                } else if (selectId.includes('Ticker') || selectId.includes('ticker')) {
                    await window.SelectPopulatorService.populateTickersSelect(selectId, {
                        includeEmpty: true
                    });
                } else if (selectId.includes('Currency') || selectId.includes('currency')) {
                    await window.SelectPopulatorService.populateCurrenciesSelect(selectId, {
                        defaultFromPreferences: shouldUseDefaultFromPrefs
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
        
        // ניקוי backdrops כפולים - Bootstrap עלול ליצור backdrop גם אחרי shown event
        if (window.modalNavigationManager && typeof window.modalNavigationManager.manageBackdrop === 'function') {
            window.modalNavigationManager.manageBackdrop();
        }
        
        // פוקוס על השדה הראשון
        const firstInput = modalElement.querySelector('input:not([readonly]), select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Initialize special handlers for specific modals
        this.initializeSpecialHandlers(modalElement);
    }
    
    /**
     * Initialize special handlers for specific modals
     * @param {HTMLElement} modalElement - The modal element
     * @private
     */
    initializeSpecialHandlers(modalElement) {
        const modalId = modalElement.id;
        
        // For Executions modal - handle ticker selection
        if (modalId === 'executionsModal') {
            const tickerSelect = modalElement.querySelector('#executionTicker');
            if (tickerSelect) {
                // Remove existing listeners
                const newTickerSelect = tickerSelect.cloneNode(true);
                tickerSelect.parentNode.replaceChild(newTickerSelect, tickerSelect);
                
                // Add change listener
                newTickerSelect.addEventListener('change', async (e) => {
                    const tickerId = e.target.value;
                    if (tickerId && window.loadExecutionTickerInfo) {
                        await window.loadExecutionTickerInfo(tickerId);
                    }
                });
            }
        }
        
        // For Trade Plans modal - handle ticker selection
        if (modalId === 'tradePlansModal') {
            const tickerSelect = modalElement.querySelector('#tradePlanTicker');
            if (tickerSelect) {
                // Remove existing listeners
                const newTickerSelect = tickerSelect.cloneNode(true);
                tickerSelect.parentNode.replaceChild(newTickerSelect, tickerSelect);
                
                // Add change listener
                newTickerSelect.addEventListener('change', async (e) => {
                    const tickerId = e.target.value;
                    if (tickerId && window.loadTradePlanTickerInfo) {
                        await window.loadTradePlanTickerInfo(tickerId);
                    }
                });
            }
        }
        
        // For Trades modal - handle ticker selection
        if (modalId === 'tradesModal') {
            const tickerSelect = modalElement.querySelector('#tradeTicker');
            if (tickerSelect) {
                // Remove existing listeners
                const newTickerSelect = tickerSelect.cloneNode(true);
                tickerSelect.parentNode.replaceChild(newTickerSelect, tickerSelect);
                
                // Add change listener
                newTickerSelect.addEventListener('change', async (e) => {
                    const tickerId = e.target.value;
                    if (tickerId && window.loadTradeTickerInfo) {
                        await window.loadTradeTickerInfo(tickerId);
                    }
                });
            }
        }
        
        // For Alerts modal - handle ticker selection
        if (modalId === 'alertsModal') {
            const tickerSelect = modalElement.querySelector('#alertTicker');
            if (tickerSelect) {
                // Remove existing listeners
                const newTickerSelect = tickerSelect.cloneNode(true);
                tickerSelect.parentNode.replaceChild(newTickerSelect, tickerSelect);
                
                // Add change listener
                newTickerSelect.addEventListener('change', async (e) => {
                    const tickerId = e.target.value;
                    if (tickerId && window.loadAlertTickerInfo) {
                        await window.loadAlertTickerInfo(tickerId);
                    }
                });
            }
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
        
        // ניקוי backdrop - חובה! זה מבטיח שה-backdrop תמיד יוסר כשהמודול נסגר
        if (window.modalNavigationManager && typeof window.modalNavigationManager.manageBackdrop === 'function') {
            window.modalNavigationManager.manageBackdrop();
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
        
        // עדכון navigation UI אחרי עדכון הכותרת
        if (window.modalNavigationManager) {
            // עדכון המידע במודול הנוכחי
            const currentIndex = window.modalNavigationManager.modalHistory.findIndex(item => item.element === modalElement);
            if (currentIndex >= 0 && currentIndex !== 0) {
                // חשוב: לא נעדכן את המודול הראשון (index 0) - הוא חייב להישאר קבוע
                window.modalNavigationManager.modalHistory[currentIndex].info.title = title;
            }
            // עדכון UI
            window.modalNavigationManager.updateModalNavigation(modalElement);
        }
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
    async populateSpecialSelects(form, data) {
        // מילוי selects מיוחדים לפי הצורך
        // לדוגמה: trade, tradePlan, etc.
        
        // טיפול מיוחד בהתראות עם קישור דרך related_type_id
        const alertTickerField = form.querySelector('#alertTicker');
        const alertRelatedTypeField = form.querySelector('#alertRelatedType');
        const alertRelatedObjectField = form.querySelector('#alertRelatedObject');
        
                // מילוי related_type_id ו-related_id אם קיימים
        if (alertRelatedTypeField && data.related_type_id) {
            // עכשיו זה select ולא radio
            alertRelatedTypeField.value = data.related_type_id;
            console.log(`✅ Set alertRelatedType to: ${data.related_type_id}`);
            // הפעלת select האובייקטים המקושרים
            if (alertRelatedObjectField) {
                alertRelatedObjectField.disabled = false;
                // טעינת האובייקטים לפי סוג השיוך
                await this.populateAlertRelatedObjects(form, data.related_type_id, data.related_id);
                
                // עדכון טיקר אוטומטי מהאובייקט המקושר
                if (data.related_id) {
                    await this.updateAlertTickerFromRelatedObject(form, data.related_type_id, data.related_id);
                }
            }
        } else if (alertTickerField && data.ticker_id) {
            // אם יש ticker_id ישיר (ללא related object), עדיין נציג אותו
            await this.updateAlertTickerDisplay(form, data.ticker_id);
        }
    }
    
    /**
     * Update alert ticker display from related object
     * @private
     */
    async updateAlertTickerFromRelatedObject(form, relatedTypeId, relatedId) {
        try {
            let tickerId = null;
            
            // שליפת ticker_id מהאובייקט המקושר
            if (relatedTypeId === '2' || relatedTypeId === 2) { // trade
                const response = await fetch(`/api/trades/${relatedId}`);
                if (response.ok) {
                    const result = await response.json();
                    tickerId = result.data?.ticker_id;
                }
            } else if (relatedTypeId === '3' || relatedTypeId === 3) { // trade_plan
                const response = await fetch(`/api/trade_plans/${relatedId}`);
                if (response.ok) {
                    const result = await response.json();
                    tickerId = result.data?.ticker_id;
                }
            } else if (relatedTypeId === '4' || relatedTypeId === 4) { // ticker
                tickerId = relatedId;
            }
            
            // עדכון תצוגת הטיקר
            await this.updateAlertTickerDisplay(form, tickerId);
        } catch (error) {
            console.warn('⚠️ Error updating ticker from related object:', error);
            await this.updateAlertTickerDisplay(form, null);
        }
    }
    
    /**
     * Update alert ticker display (both ticker name and price info)
     * @private
     */
    async updateAlertTickerDisplay(form, tickerId) {
        const tickerDisplay = form.querySelector('#alertTicker');
        const tickerInfoDiv = form.querySelector('#alertTickerInfo');
        
        if (!tickerDisplay) return;
        
        if (!tickerId) {
            // ניקוי תצוגת הטיקר
            tickerDisplay.textContent = '-';
            if (tickerInfoDiv) {
                tickerInfoDiv.innerHTML = '';
            }
            return;
        }
        
        try {
            // טעינת פרטי הטיקר
            const response = await fetch(`/api/tickers/${tickerId}`);
            if (response.ok) {
                const result = await response.json();
                const ticker = result.data;
                if (ticker) {
                    // עדכון תצוגת הטיקר (רק סימבול)
                    const tickerSymbol = ticker.symbol || 'לא מוגדר';
                    tickerDisplay.textContent = tickerSymbol;
                    
                    // עדכון פרטי מחיר
                    if (tickerInfoDiv) {
                        if (window.FieldRendererService && window.FieldRendererService.renderTickerInfo) {
                            tickerInfoDiv.innerHTML = window.FieldRendererService.renderTickerInfo(ticker);
                        } else {
                            // Fallback
                            tickerInfoDiv.innerHTML = `
                                <div class="ticker-info-display">
                                    <strong>${ticker.symbol || 'N/A'}</strong> - ${ticker.name || 'N/A'}<br>
                                    <span class="fw-bold">$${(ticker.current_price || 0).toFixed(2)}</span>
                                    <span class="${(ticker.daily_change || 0) >= 0 ? 'text-success' : 'text-danger'}">
                                        ${(ticker.daily_change || 0) >= 0 ? '↗' : '↘'} 
                                        ${(ticker.daily_change || 0).toFixed(2)} 
                                        (${(ticker.daily_change_percent || 0).toFixed(2)}%)
                                    </span>
                                </div>
                            `;
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Error loading ticker info:', error);
            tickerDisplay.textContent = 'שגיאה בטעינת טיקר';
            if (tickerInfoDiv) {
                tickerInfoDiv.innerHTML = '<small class="text-muted">לא ניתן לטעון פרטי טיקר</small>';
            }
        }
    }
    
    /**
     * Populate alert related objects select based on related type
     * @private
     */
    async populateAlertRelatedObjects(form, relatedTypeId, selectedRelatedId = null) {
        const alertRelatedObjectField = form.querySelector('#alertRelatedObject');
        if (!alertRelatedObjectField) return;
        
        try {
            let endpoint = '';
            let valueField = 'id';
            let textField = 'name';
            
            switch (parseInt(relatedTypeId)) {
                case 1: // account
                    endpoint = '/api/trading_accounts';
                    valueField = 'id';
                    textField = 'name';
                    break;
                case 2: // trade
                    endpoint = '/api/trades';
                    valueField = 'id';
                    textField = 'symbol'; // נשתמש ב-symbol או בנתונים אחרים
                    break;
                case 3: // trade_plan
                    endpoint = '/api/trade_plans';
                    valueField = 'id';
                    textField = 'symbol'; // נשתמש ב-symbol או בנתונים אחרים
                    break;
                case 4: // ticker
                    endpoint = '/api/tickers';
                    valueField = 'id';
                    textField = 'symbol';
                    break;
                default:
                    return;
            }
            
            const response = await fetch(endpoint);
            if (!response.ok) return;
            
            const result = await response.json();
            const items = result.data || [];
            
            // ניקוי ה-select
            alertRelatedObjectField.innerHTML = '';
            
            // הוספת אופציה ריקה
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'בחר אובייקט...';
            alertRelatedObjectField.appendChild(emptyOption);
            
            // הוספת כל האובייקטים
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                
                // יצירת טקסט תצוגה מתאים
                let displayText = item[textField] || `ID: ${item.id}`;
                if (relatedTypeId === 2 || relatedTypeId === 3) {
                    // עבור טרייד ותוכנית - נציג סימבול ותאריך
                    const symbol = item.symbol || item.ticker_symbol || 'לא מוגדר';
                    const date = item.created_at || item.date;
                    const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : '';
                    displayText = `${symbol}${formattedDate ? ' - ' + formattedDate : ''}`;
                } else if (relatedTypeId === 1) {
                    // עבור חשבון - שם + מטבע
                    const currency = item.currency || 'ILS';
                    displayText = `${item.name || 'לא מוגדר'} (${currency})`;
                }
                
                option.textContent = displayText;
                if (selectedRelatedId && item[valueField] == selectedRelatedId) {
                    option.selected = true;
                }
                alertRelatedObjectField.appendChild(option);
            });
            
            console.log(`✅ Populated alertRelatedObject with ${items.length} items for type ${relatedTypeId}`);
        } catch (error) {
            console.warn('⚠️ Error populating alert related objects:', error);
        }
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

// Helper function for easier onclick handlers - created IMMEDIATELY when script loads (before DOMContentLoaded)
// This ensures it's available for onclick handlers in HTML
window.showModalSafe = async function(modalId, mode = 'add') {
    try {
        console.log(`🔍 [showModalSafe] Called with:`, { modalId, mode, ModalManagerV2Available: !!window.ModalManagerV2 });
        
        // אם ModalManagerV2 לא זמין, ננסה לחכות קצת
        if (!window.ModalManagerV2) {
            console.warn('⚠️ [showModalSafe] ModalManagerV2 not available, waiting...');
            // נחכה עד 2 שניות ל-ModalManagerV2
            for (let i = 0; i < 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (window.ModalManagerV2) {
                    console.log(`✅ [showModalSafe] ModalManagerV2 became available after ${(i + 1) * 100}ms`);
                    break;
                }
            }
        }
        
        if (window.ModalManagerV2 && window.ModalManagerV2.showModal) {
            console.log(`✅ [showModalSafe] Calling ModalManagerV2.showModal`);
            await window.ModalManagerV2.showModal(modalId, mode);
            console.log(`✅ [showModalSafe] Modal shown successfully`);
        } else {
            console.error('❌ [showModalSafe] ModalManagerV2 not available after wait');
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
            }
        }
    } catch (error) {
        console.error('❌ [showModalSafe] Error showing modal:', error);
        console.error('   Error stack:', error.stack);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', `שגיאה בפתיחת מודל: ${error.message}`);
        }
    }
};
console.log('✅ [showModalSafe] Helper function created immediately');

// אתחול אוטומטי כאשר הדף נטען
document.addEventListener('DOMContentLoaded', () => {
    if (!window.ModalManagerV2) {
        new ModalManagerV2();
    }
});
