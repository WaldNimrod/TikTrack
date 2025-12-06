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
        this.alertsContext = {
            ticker: null,
            linkedEntity: null
        };
        this.attachmentPreviewModal = null;
        this.attachmentPreviewModalInstance = null;
        this.attachmentPreviewImg = null;
        this.attachmentPreviewPdfFrame = null;
        this.attachmentPreviewSpinner = null;
        this.attachmentPreviewError = null;
        this.attachmentPreviewTitleEl = null;
        this.modalQueue = [];
        this.globalBackdrop = null;
        this.backdropClickHandler = this.handleGlobalBackdropClick.bind(this);
        
        this.init();
    }

    static assignDefaultDateValue(inputElement) {
        if (!inputElement) {
            return;
        }

        const includeTime = (inputElement.type || '').toLowerCase() === 'datetime-local';
        let assignedValue = null;

        if (window.DefaultValueSetter) {
            if (includeTime && typeof window.DefaultValueSetter.setCurrentDateTime === 'function') {
                assignedValue = window.DefaultValueSetter.setCurrentDateTime(inputElement.id);
            } else if (typeof window.DefaultValueSetter.setCurrentDate === 'function') {
                assignedValue = window.DefaultValueSetter.setCurrentDate(inputElement.id);
            }
        }

        if (!assignedValue) {
            // Use dateUtils for consistent date handling
            let today;
            if (window.dateUtils && typeof window.dateUtils.getToday === 'function') {
              today = window.dateUtils.getToday();
            } else {
              today = new Date();
            }
            today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
            assignedValue = includeTime
                ? today.toISOString().slice(0, 16)
                : today.toISOString().slice(0, 10);
            // Use DataCollectionService to set value if available
            if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
              window.DataCollectionService.setValue(inputElement.id, assignedValue, type === 'date' ? 'date' : 'dateOnly');
            } else {
              inputElement.value = assignedValue;
            }
        } else {
            // Use DataCollectionService to set value if available
            if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
              window.DataCollectionService.setValue(inputElement.id, assignedValue, 'text');
            } else {
              inputElement.value = assignedValue;
            }
        }

        inputElement.dataset.systemGenerated = 'true';
        delete inputElement.dataset.userModified;
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
            
            window.Logger?.info('ModalManagerV2 initialized successfully', { page: 'modal-manager-v2' });
        } catch (error) {
            window.Logger?.error('Error initializing ModalManagerV2', { page: 'modal-manager-v2', error: error?.message || error });
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
        
        // מאזין מרכזי ללחיצה על backdrop - פועל על כל המודולים במערכת
        // זה מבטיח שלחיצה על הרקע תסגור את המודל כמו לחיצה על כפתור סגור
        document.addEventListener('click', (event) => {
            this.handleBackdropClick(event);
        }, true); // useCapture: true כדי לתפוס את האירוע לפני שהוא מגיע למודל
        
        // מאזין לפתיחת מודלים
        document.addEventListener('shown.bs.modal', (event) => {
            // ניקוי backdrops של Bootstrap לאחר פתיחת modal
            this._cleanupBootstrapBackdrops();
            this.handleModalShown(event.target);
        });
        
        // מאזין לתצוגת קובץ מצורף (תצוגה מקדימה)
        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-attachment-preview]');
            if (!trigger) {
                return;
            }

            event.preventDefault();
            const src = trigger.getAttribute('data-preview-src');
            const title = trigger.getAttribute('data-preview-title') || '';
            const type = (trigger.getAttribute('data-attachment-preview') || 'image').toLowerCase();
            const mime = trigger.getAttribute('data-preview-mime') || '';
            if (src) {
                this.showAttachmentPreview(src, title, { type, mime });
            } else if (window.Logger) {
                window.Logger.warn('⚠️ [ModalManagerV2] Attachment preview trigger missing src', {
                    trigger,
                    page: 'modal-manager-v2'
                });
            }
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
     * Show attachment preview modal (images)
     * @param {string} src - attachment source URL
     * @param {string} title - modal title / attachment name
     * @param {Object} options - preview options (type, mime)
     * @public
     */
    showAttachmentPreview(src, title = '', options = {}) {
        if (!src) {
            window.Logger?.warn('⚠️ [ModalManagerV2] showAttachmentPreview called without src', { page: 'modal-manager-v2' });
            return;
        }

        this._ensureAttachmentPreviewModal();

        if (!this.attachmentPreviewModal) {
            window.Logger?.error('❌ [ModalManagerV2] attachment preview modal not initialized', { page: 'modal-manager-v2' });
            return;
        }

        const safeTitle = title && title.trim() ? title.trim() : 'תצוגת קובץ';
        const previewType = (options.type || 'image').toLowerCase();
        const mimeType = options.mime || '';

        if (this.attachmentPreviewTitleEl) {
            this.attachmentPreviewTitleEl.textContent = safeTitle;
        }

        if (this.attachmentPreviewImg) {
            this.attachmentPreviewImg.classList.add('d-none');
            this.attachmentPreviewImg.dataset.previewSrc = src;
            this.attachmentPreviewImg.alt = safeTitle;
            this.attachmentPreviewImg.src = previewType === 'image' ? src : '';
        }

        if (this.attachmentPreviewPdfFrame) {
            this.attachmentPreviewPdfFrame.classList.add('d-none');
            this.attachmentPreviewPdfFrame.dataset.previewSrc = src;
            this.attachmentPreviewPdfFrame.title = safeTitle;
            this.attachmentPreviewPdfFrame.src = '';
            if (mimeType) {
                this.attachmentPreviewPdfFrame.dataset.previewMime = mimeType;
            } else {
                delete this.attachmentPreviewPdfFrame.dataset.previewMime;
            }
        }

        if (this.attachmentPreviewSpinner) {
            this.attachmentPreviewSpinner.classList.remove('d-none');
        }

        if (this.attachmentPreviewError) {
            this.attachmentPreviewError.classList.add('d-none');
            this.attachmentPreviewError.textContent = 'לא ניתן להציג את הקובץ.';
        }

        if (previewType === 'image') {
            if (this.attachmentPreviewImg) {
                this.attachmentPreviewImg.src = src;
            }
        } else if (previewType === 'pdf') {
            setTimeout(() => {
                if (this.attachmentPreviewPdfFrame) {
                    this.attachmentPreviewPdfFrame.src = src;
                }
            }, 0);
        } else {
            window.Logger?.warn('⚠️ [ModalManagerV2] Unsupported attachment preview type', {
                previewType,
                page: 'modal-manager-v2'
            });
        }

        try {
            if (!this.attachmentPreviewModalInstance) {
                this.attachmentPreviewModalInstance = new bootstrap.Modal(this.attachmentPreviewModal, {
                    backdrop: true,
                    keyboard: true
                });
            }
            this.attachmentPreviewModalInstance.show();
        } catch (error) {
            window.Logger?.error('❌ [ModalManagerV2] Failed to show attachment preview modal', {
                error,
                page: 'modal-manager-v2'
            });
        }
    }

    /**
     * Ensure the attachment preview modal exists in DOM
     * @private
     */
    _ensureAttachmentPreviewModal() {
        if (this.attachmentPreviewModal) {
            return;
        }

        const modalId = 'attachmentPreviewModal';
        if (document.getElementById(modalId)) {
            this.attachmentPreviewModal = document.getElementById(modalId);
        } else {
            const modalHtml = `
                <div class="modal fade attachment-preview-modal" id="${modalId}" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-xl modal-dialog-centered attachment-preview-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">תצוגת קובץ</h5>
                                <button data-button-type="CLOSE" data-bs-dismiss="modal" data-text="סגור"></button>
                            </div>
                            <div class="modal-body text-center">
                                <div class="attachment-preview-spinner my-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">טוען...</span>
                                    </div>
                                </div>
                                <img src="" alt="" class="attachment-preview-modal-image img-fluid rounded d-none" loading="lazy" decoding="async" />           
                                <iframe src="" class="attachment-preview-pdf-frame w-100 border rounded d-none" style="min-height: 70vh;" title="תצוגת קובץ"></iframe>
                                <div class="attachment-preview-error text-muted d-none mt-3">לא ניתן להציג את הקובץ.</div>
                            </div>
                            <div class="modal-footer justify-content-end">
                                <button data-button-type="CLOSE" data-bs-dismiss="modal" data-text="סגור"></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            this.attachmentPreviewModal = document.getElementById(modalId);
        }

        this.attachmentPreviewTitleEl = this.attachmentPreviewModal?.querySelector('.modal-title') || null;                                                     
        this.attachmentPreviewImg = this.attachmentPreviewModal?.querySelector('.attachment-preview-modal-image') || null;                                      
        this.attachmentPreviewPdfFrame = this.attachmentPreviewModal?.querySelector('.attachment-preview-pdf-frame') || null;                                    
        this.attachmentPreviewSpinner = this.attachmentPreviewModal?.querySelector('.attachment-preview-spinner') || null;                                      
        this.attachmentPreviewError = this.attachmentPreviewModal?.querySelector('.attachment-preview-error') || null;                                          

        if (this.attachmentPreviewImg) {
            this.attachmentPreviewImg.addEventListener('load', () => {
                if (this.attachmentPreviewSpinner) {
                    this.attachmentPreviewSpinner.classList.add('d-none');
                }
                this.attachmentPreviewImg.classList.remove('d-none');
            });

            this.attachmentPreviewImg.addEventListener('error', () => {
                if (this.attachmentPreviewSpinner) {
                    this.attachmentPreviewSpinner.classList.add('d-none');
                }
                this.attachmentPreviewImg.classList.add('d-none');
                if (this.attachmentPreviewError) {
                    this.attachmentPreviewError.classList.remove('d-none');
                }
            });
        }

        if (this.attachmentPreviewPdfFrame) {
            this.attachmentPreviewPdfFrame.addEventListener('load', () => {
                if (this.attachmentPreviewSpinner) {
                    this.attachmentPreviewSpinner.classList.add('d-none');
                }
                this.attachmentPreviewPdfFrame.classList.remove('d-none');
                if (this.attachmentPreviewError) {
                    this.attachmentPreviewError.classList.add('d-none');
                }
            });

            this.attachmentPreviewPdfFrame.addEventListener('error', () => {
                if (this.attachmentPreviewSpinner) {
                    this.attachmentPreviewSpinner.classList.add('d-none');
                }
                this.attachmentPreviewPdfFrame.classList.add('d-none');
                if (this.attachmentPreviewError) {
                    this.attachmentPreviewError.classList.remove('d-none');
                }
            });
        }

        if (this.attachmentPreviewModal) {
            this.attachmentPreviewModal.addEventListener('hidden.bs.modal', () => {
                if (this.attachmentPreviewImg) {
                    this.attachmentPreviewImg.src = '';
                    this.attachmentPreviewImg.classList.add('d-none');
                }
                if (this.attachmentPreviewPdfFrame) {
                    this.attachmentPreviewPdfFrame.src = 'about:blank';
                    this.attachmentPreviewPdfFrame.classList.add('d-none');
                }
                if (this.attachmentPreviewSpinner) {
                    this.attachmentPreviewSpinner.classList.add('d-none');
                }
                if (this.attachmentPreviewError) {
                    this.attachmentPreviewError.classList.add('d-none');
                }
            }, { once: false });
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
        // Check if config has tabs
        const hasTabs = config.tabs && Array.isArray(config.tabs) && config.tabs.length > 0;
        
        // Generate fields HTML - either from tabs or from direct fields
        let fieldsHTML = '';
        let tabsHTML = '';
        
        if (hasTabs) {
            // Generate tabs navigation
            tabsHTML = this.generateTabsHTML(config.tabs, config.id);
            
            // Generate fields for each tab
            const tabsContentHTML = config.tabs.map(tab => {
                const tabFieldsHTML = this.generateFieldsHTML(tab.fields);
                return `
                    <div class="tab-pane fade ${tab.active ? 'show active' : ''}" 
                         id="${config.id}Tab${tab.id}" 
                         role="tabpanel" 
                         aria-labelledby="${config.id}Tab${tab.id}-tab">
                        ${tabFieldsHTML}
                    </div>
                `;
            }).join('');
            
            fieldsHTML = `
                <div class="tab-content" id="${config.id}TabContent">
                    ${tabsContentHTML}
                </div>
            `;
        } else {
            // No tabs - use direct fields
            fieldsHTML = this.generateFieldsHTML(config.fields);
        }
        
        // Generate default title in Hebrew if not provided
        let defaultTitle = 'הוספת ישות';
        if (config.entityType && !config.title?.add) {
            const ENTITY_LABELS = {
                ticker: 'טיקר',
                trade: 'טרייד',
                trade_plan: 'תכנון',
                execution: 'ביצוע',
                trading_account: 'חשבון מסחר',
                account: 'חשבון מסחר',
                alert: 'התראה',
                cash_flow: 'תזרים מזומנים',
                note: 'הערה'
            };
            const entityLabel = ENTITY_LABELS[config.entityType] || config.entityType;
            defaultTitle = `הוספת ${entityLabel}`;
        }
        
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
                            <h5 class="modal-title" id="${config.id}Label" style="color: var(--current-entity-color-dark) !important; order: 1;">${config.title?.add || defaultTitle}</h5>
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
                                ${tabsHTML}
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
     * Generate tabs HTML - יצירת HTML של טאבים
     * 
     * @param {Array} tabs - רשימת טאבים
     * @param {string} modalId - מזהה המודל
     * @returns {string} HTML של הטאבים
     * @private
     */
    generateTabsHTML(tabs, modalId) {
        if (!tabs || !Array.isArray(tabs) || tabs.length === 0) {
            return '';
        }
        
        const tabsNavHTML = tabs.map((tab, index) => {
            const activeClass = tab.active ? 'active' : '';
            return `
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${activeClass}" 
                            id="${modalId}Tab${tab.id}-tab" 
                            data-bs-toggle="tab" 
                            data-bs-target="#${modalId}Tab${tab.id}" 
                            type="button" 
                            role="tab" 
                            aria-controls="${modalId}Tab${tab.id}" 
                            aria-selected="${tab.active ? 'true' : 'false'}"
                            data-tab-id="${tab.id}">
                        ${tab.label}
                    </button>
                </li>
            `;
        }).join('');
        
        return `
            <ul class="nav nav-tabs mb-3" id="${modalId}Tabs" role="tablist">
                ${tabsNavHTML}
            </ul>
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
            
            // separator לא צריך row/col - הוסף אותו ישירות
            if (field.type === 'separator') {
                html += this.renderField(field);
                continue;
            }
            
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
                    <div class="mb-2">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <div id="${field.id}" class="form-control-plaintext py-1 px-2">                              
                            <!-- יתמלא דינמית -->
                        </div>
                        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}                                          
                    </div>
                `;
                
            case 'separator':
                // קו מפריד
                return `
                    <hr class="my-4" style="border-top: 2px solid #dee2e6;">
                `;
                
            case 'text':
                const textStyle = field.style || (field.width ? `width: ${field.width}px` : '');
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <input type="text" 
                               class="form-control" 
                               id="${field.id}" 
                               name="${field.name || field.id}"
                               ${requiredAttr}
                               ${disabledAttr}
                               ${readOnlyAttr}
                               ${textStyle ? `style="${textStyle}"` : ''}
                               placeholder="${field.placeholder || ''}"
                               value="${field.defaultValue || ''}">
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'tag-multi-select':
                const initialTags = Array.isArray(field.defaultValue)
                    ? field.defaultValue.join(',')
                    : (field.defaultValue || '');
                const badgeContainerId = `${field.id}TagBadgeContainer`;
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <select 
                            class="form-select tag-multi-select"
                            id="${field.id}"
                            name="${field.name || field.id}"
                            multiple
                            ${disabledAttr}
                            ${readOnlyAttr}
                            data-tag-category="${field.tagCategory ?? ''}"
                            data-include-inactive="${field.includeInactive ? 'true' : 'false'}"
                            data-initial-value="${initialTags}">
                            <option value="" disabled>טוען תגיות...</option>
                        </select>
                        <div id="${badgeContainerId}" class="mt-2 tag-picker-badges text-start small"></div>
                        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
                        case 'number':
                const numberStyle = field.style || (field.width ? `width: ${field.width}px` : '');
                // Check if this is a fee field that needs currency label
                const feeCurrencyLabelHTML = field.feeCurrencyLabel ? 
                    `<small class="text-muted ms-2" id="${field.id}CurrencyLabel" style="font-size: 0.875rem;">-</small>` : '';
                const labelClassAttr = field.labelClass ? ` ${field.labelClass}` : '';
                const labelStyleAttr = field.labelStyle ? ` style="${field.labelStyle}"` : '';
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label${labelClassAttr}"${labelStyleAttr}>
                            ${field.label} ${requiredStar}${feeCurrencyLabelHTML}
                        </label>
                        <input type="number" 
                               class="form-control" 
                               id="${field.id}" 
                               name="${field.name || field.id}"
                               ${requiredAttr}
                               ${disabledAttr}
                               ${readOnlyAttr}
                               ${numberStyle ? `style="${numberStyle}"` : ''}
                               ${field.min ? `min="${field.min}"` : ''}
                               ${field.max ? `max="${field.max}"` : ''}
                               ${field.step ? `step="${field.step}"` : ''}
                               placeholder="${field.placeholder || ''}"
                               value="${field.defaultValue || ''}">
                        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'date':
            case 'datetime-local':
                // Handle 'today' special value for datetime-local
                let dateValue = field.defaultValue || '';
                if (dateValue === 'today') {
                    // Use dateUtils for consistent date handling
                    let today;
                    if (window.dateUtils && typeof window.dateUtils.getToday === 'function') {
                      today = window.dateUtils.getToday();
                    } else {
                      today = new Date();
                    }
                    dateValue = today.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm                                                                   
                }
                const dateStyle = field.style || (field.width ? `width: ${field.width}px` : '');
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <input type="${field.type === 'datetime-local' ? 'datetime-local' : (field.dateTime ? 'datetime-local' : 'date')}"                      
                               class="form-control" 
                               id="${field.id}" 
                               name="${field.name || field.id}"
                               ${requiredAttr}
                               ${disabledAttr}
                               ${readOnlyAttr}
                               ${dateStyle ? `style="${dateStyle}"` : ''}
                               value="${dateValue}">
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'select':
                // Check if this is a tag multi-select field
                const isTagMultiSelect = (field.additionalClasses && (
                    (Array.isArray(field.additionalClasses) && field.additionalClasses.includes('tag-multi-select')) ||
                    (typeof field.additionalClasses === 'string' && field.additionalClasses.includes('tag-multi-select'))
                )) || (field.classList && Array.isArray(field.classList) && field.classList.includes('tag-multi-select'));
                
                // If it's a tag multi-select, render it with badge container like tag-multi-select type
                if (isTagMultiSelect) {
                    const initialTags = Array.isArray(field.defaultValue)
                        ? field.defaultValue.join(',')
                        : (field.defaultValue || '');
                    const badgeContainerId = `${field.id}TagBadgeContainer`;
                    const extraAttributes = [];
                    if (field.multiple) {
                        extraAttributes.push('multiple');
                    }
                    if (field.attributes && typeof field.attributes === 'object') {
                        Object.entries(field.attributes).forEach(([attrKey, attrValue]) => {
                            if (attrValue === true) {
                                extraAttributes.push(attrKey);
                            } else if (attrValue !== false && attrValue !== null && attrValue !== undefined) {
                                extraAttributes.push(`${attrKey}="${attrValue}"`);
                            }
                        });
                    }
                    if (field.dataset && typeof field.dataset === 'object') {
                        Object.entries(field.dataset).forEach(([dataKey, dataValue]) => {
                            if (dataValue !== undefined && dataValue !== null) {
                                extraAttributes.push(`data-${dataKey}="${dataValue}"`);
                            }
                        });
                    }
                    
                    return `
                        <div class="mb-3">
                            <label for="${field.id}" class="form-label">
                                ${field.label} ${requiredStar}
                            </label>
                            <select 
                                class="form-select tag-multi-select"
                                id="${field.id}"
                                name="${field.name || field.id}"
                                ${requiredAttr}
                                ${disabledAttr}
                                ${readOnlyAttr}
                                data-tag-category="${field.tagCategory ?? ''}"
                                data-include-inactive="${field.includeInactive ? 'true' : 'false'}"
                                data-initial-value="${initialTags}"
                                ${extraAttributes.join(' ')}>
                                <option value="" disabled>טוען תגיות...</option>
                            </select>
                            <div id="${badgeContainerId}" class="mt-2 tag-picker-badges text-start small"></div>
                            ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
                            <div class="invalid-feedback"></div>
                        </div>
                    `;
                }
                
                // Regular select field
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
                
                const selectStyle = field.style || (field.width ? `width: ${field.width}px` : '');
                const selectClasses = ['form-select'];
                if (field.additionalClasses) {
                    if (Array.isArray(field.additionalClasses)) {
                        selectClasses.push(...field.additionalClasses);
                    } else {
                        selectClasses.push(field.additionalClasses);
                    }
                }
                if (field.classList && Array.isArray(field.classList)) {
                    selectClasses.push(...field.classList);
                }

                const extraAttributes = [];
                if (field.multiple) {
                    extraAttributes.push('multiple');
                }
                if (field.attributes && typeof field.attributes === 'object') {
                    Object.entries(field.attributes).forEach(([attrKey, attrValue]) => {
                        if (attrValue === true) {
                            extraAttributes.push(attrKey);
                        } else if (attrValue !== false && attrValue !== null && attrValue !== undefined) {
                            extraAttributes.push(`${attrKey}="${attrValue}"`);
                        }
                    });
                }
                if (field.dataset && typeof field.dataset === 'object') {
                    Object.entries(field.dataset).forEach(([dataKey, dataValue]) => {
                        if (dataValue !== undefined && dataValue !== null) {
                            extraAttributes.push(`data-${dataKey}="${dataValue}"`);
                        }
                    });
                }

                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <select class="${selectClasses.join(' ')}" 
                                id="${field.id}" 
                                name="${field.name || field.id}"
                                ${requiredAttr}
                                ${disabledAttr}
                                ${selectStyle ? `style="${selectStyle}"` : ''}
                                ${extraAttributes.join(' ')}>
                            ${optionsHTML}
                        </select>
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'textarea':
                const textareaStyle = field.style || (field.width ? `width: ${field.width}px` : '');
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <textarea class="form-control" 
                                  id="${field.id}" 
                                  name="${field.name || field.id}"
                                  ${requiredAttr}
                                  ${disabledAttr}
                                  ${readOnlyAttr}
                                  ${textareaStyle ? `style="${textareaStyle}"` : ''}
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
                                   name="${field.name || field.id}"
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
                
            case 'linkButton':
                // Link button for trade selection
                // Creates a button that opens a selector modal
                // Also creates a hidden input field to store the selected trade_id (generic field name)
                const linkButtonId = field.id + 'Button';
                const linkButtonText = field.buttonText || field.label || 'קשר לטרייד';
                // Generic field name: trade_id (works for all entity types)
                return `
                    <div class="mb-3">
                        <label class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <input type="hidden" id="trade_id" name="trade_id" value="">
                        <div id="${linkButtonId}">
                            <button type="button" class="btn btn-primary" data-onclick="openTradeSelector('${field.id}')">
                                ${linkButtonText}
                            </button>
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
                                       name="${field.name || field.id}" 
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
                
            case 'file':
                const fileAccept = field.accept || '*/*';
                const fileDescription = field.description ? `<small class="form-text text-muted">${field.description}</small>` : '';
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <input type="file" 
                               class="form-control" 
                               id="${field.id}" 
                               name="${field.name || field.id}"
                               ${requiredAttr}
                               ${disabledAttr}
                               ${readOnlyAttr}
                               accept="${fileAccept}">
                        ${fileDescription}
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'rich-text':
                // Rich text editor using Quill.js
                // The editor will be initialized after modal is shown
                const richTextStyle = field.style || '';
                const richTextHeight = field.height || '300px';
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">
                            ${field.label} ${requiredStar}
                        </label>
                        <div id="${field.id}" 
                             class="rich-text-editor-container" 
                             ${richTextStyle ? `style="${richTextStyle}"` : ''}
                             data-editor-id="${field.id}"
                             data-options='${JSON.stringify(field.options || {})}'>
                            <!-- Quill editor will be initialized here -->
                        </div>
                        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
                        <div class="invalid-feedback"></div>
                    </div>
                `;
                
            case 'custom':
                // Custom HTML field - used for complex UI elements
                return field.html || '';
                
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
    async showModal(modalId, mode = 'add', entityData = null, options = {}) {
        try {
            console.log(`🔍 [ModalManagerV2] showModal called:`, { modalId, mode, entityData, options, modalsCount: this.modals.size });
            
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
                        modalId === 'cashFlowModal' ? 'cashFlowModalConfig' : null,
                        modalId === 'notesModal' ? 'notesModalConfig' : null
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
                    // בדיקה אם המודל קיים ב-DOM (מודל דינמי שנוצר ב-runtime)
                    const dynamicModal = document.getElementById(modalId);
                    if (dynamicModal) {
                        console.log(`✅ [ModalManagerV2] Found dynamic modal in DOM: ${modalId}`);
                        // רישום המודל הדינמי במפה (ללא config)
                        this.modals.set(modalId, {
                            element: dynamicModal,
                            config: null,
                            isActive: false,
                            isDynamic: true
                        });
                    } else {
                        console.error(`❌ [ModalManagerV2] Modal ${modalId} not found and no configuration available`);
                        console.error(`   Checked: window.${modalId}Config, window.${modalId.replace('Modal', '')}ModalConfig`);
                        if (window.showErrorNotification) {
                            window.showErrorNotification('שגיאה', `מודל ${modalId} לא נמצא. אנא רענן את הדף.`);
                        }
                        throw new Error(`Modal ${modalId} not found and could not be created - no configuration found`);
                    }
                }
                
                // בדיקה שוב שהמודל נוצר או נמצא
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
            
            console.log(`✅ [ModalManagerV2] Modal found, proceeding to show:`, { modalId, mode, isDynamic: modalInfo.isDynamic });
            
            // אם זה מודל דינמי (ללא config), נשתמש בטיפול מינימלי
            if (modalInfo.isDynamic) {
                // למודלים דינמיים - פשוט פתיחה דרך Bootstrap
                if (!bootstrap || !bootstrap.Modal) {
                    throw new Error('Bootstrap Modal not available for dynamic modal');
                }
                const modal = new bootstrap.Modal(modalElement, {
                    backdrop: false,
                    keyboard: true
                });
                modal.show();
                modalInfo.isActive = true;
                this.activeModal = modalId;
                return;
            }
            
            // למודלים רגילים עם config - טיפול מלא
            // עדכון כותרת לפי מצב
            this.updateModalTitle(modalElement, modalInfo.config, mode);
            
            const formElement = modalElement.querySelector('form');
            if (formElement) {
                formElement.dataset.modalMode = mode;
            }
            
            // איפוס טופס
            this.resetForm(modalElement);
            
            if (modalElement.id === 'alertsModal' || modalInfo.config?.entityType === 'alert') {
                if (!this.alertsContext) {
                    this.alertsContext = { ticker: null, linkedEntity: null };
                } else {
                    this.alertsContext.ticker = null;
                    this.alertsContext.linkedEntity = null;
                }
            }
            
            // הפעלת ולידציה
            this.initializeValidation(modalElement, modalInfo.config);
            
            // הפעלת מערכת הכפתורים
            this.initializeButtons(modalElement);
            
            // Initialize tabs if exists
            if (modalInfo.config.tabs && Array.isArray(modalInfo.config.tabs) && modalInfo.config.tabs.length > 0) {
                // For cash flow modal - handle currency exchange vs regular flow
                if (modalId === 'cashFlowModal') {
                    this.initializeCashFlowTabs(modalElement, modalInfo.config, mode, entityData, options);
                } else {
                    this.initializeTabs(modalElement, modalInfo.config);
                }
            }
            
            // יישום צבעים
            this.applyUserColors(modalElement, modalInfo.config.entityType);
            
            // מילוי selects (חייב להיות לפני populateForm)
            // Note: populateSelects already handles defaultFromPreferences
            // Pass mode to ensure defaultFromPreferences is false in edit mode
            await this.populateSelects(modalElement, modalInfo.config, mode);
            
            
            if (modalId === 'cashFlowModal' && typeof window.initializeExternalIdFields === 'function') {
                window.initializeExternalIdFields();
            }
            
            // Handle prefill data in add mode (before showing modal)
            if (mode === 'add' && options?.prefill) {
                window.Logger?.info('📝 [ModalManagerV2] Handling prefill data in add mode', {
                    modalId,
                    prefillKeys: Object.keys(options.prefill),
                    page: 'modal-manager-v2'
                });
                
                // Map prefill keys to form field names if needed
                // For notes modal, map noteContent -> content, noteRelatedType -> related_type_id, etc.
                const prefillData = { ...options.prefill };
                
                // Map note-specific prefill keys to form field names
                if (modalId === 'notesModal') {
                    if (prefillData.noteContent !== undefined) {
                        prefillData.content = prefillData.noteContent;
                        delete prefillData.noteContent;
                    }
                    if (prefillData.noteRelatedType !== undefined) {
                        prefillData.related_type_id = prefillData.noteRelatedType;
                        delete prefillData.noteRelatedType;
                    }
                    if (prefillData.noteRelatedObject !== undefined) {
                        prefillData.related_id = prefillData.noteRelatedObject;
                        delete prefillData.noteRelatedObject;
                    }
                }
                
                window.Logger?.info('📝 [ModalManagerV2] Mapped prefill data', {
                    modalId,
                    mappedPrefillKeys: Object.keys(prefillData),
                    page: 'modal-manager-v2'
                });
                
                // Populate form with prefill data
                await this.populateForm(modalElement, prefillData);
            }
            
            // מילוי נתונים אם במצב עריכה/צפייה (אחרי populateSelects!)
            if (mode === 'edit' && entityData) {
                await this.populateForm(modalElement, entityData);
                
                // CRITICAL: For executions modal, save ticker value after populateForm
                // This ensures the value is preserved when initializeSpecialHandlers clones the select
                if (modalId === 'executionsModal') {
                    const tickerSelect = modalElement.querySelector('#executionTicker');
                    if (tickerSelect && tickerSelect.value) {
                        tickerSelect.dataset.preservedValue = tickerSelect.value;
                        console.log(`💾 [showModal] Preserved executionTicker value after populateForm: ${tickerSelect.value}`);
                    }
                }
                
                // After populating form, update external_id field state for executions modal
                if (modalId === 'executionsModal') {
                    const sourceSelect = modalElement.querySelector('#executionSource');
                    const externalIdField = modalElement.querySelector('#executionExternalId');
                    if (sourceSelect && externalIdField) {
                        const sourceValue = sourceSelect.value;
                        if (sourceValue === 'manual') {
                            externalIdField.disabled = true;
                            externalIdField.classList.add('form-control-disabled');
                        } else {
                            externalIdField.disabled = false;
                            externalIdField.classList.remove('form-control-disabled');
                        }
                        console.log(`✅ Updated executionExternalId state after populate (source: ${sourceValue})`);
                    }
                }
                
                // After populating form, disable currency field for trading accounts modal in edit mode
                if (modalId === 'tradingAccountsModal') {
                    const currencyField = modalElement.querySelector('#accountCurrency');
                    if (currencyField) {
                        currencyField.disabled = true;
                        currencyField.classList.add('form-control-disabled');
                        console.log(`✅ Disabled accountCurrency field in edit mode`);
                    }
                }
                
                // After populating form, enable related object fields if related_type_id exists
                if (modalId === 'notesModal') {
                    const noteRelatedTypeField = modalElement.querySelector('#noteRelatedType');
                    const noteRelatedObjectField = modalElement.querySelector('#noteRelatedObject');
                    if (noteRelatedTypeField && noteRelatedObjectField && entityData?.related_type_id) {
                        const relatedTypeId = String(entityData.related_type_id);
                        if (relatedTypeId && relatedTypeId !== '') {
                            noteRelatedObjectField.disabled = false;
                            noteRelatedObjectField.removeAttribute('disabled');
                            console.log(`✅ Enabled noteRelatedObject field in edit mode (related_type_id: ${relatedTypeId})`);
                        }
                    }
                }
                
                // After populating form, enable alertRelatedObject field if related_type_id exists
                if (modalId === 'alertsModal') {
                    const alertRelatedTypeField = modalElement.querySelector('#alertRelatedType');
                    const alertRelatedObjectField = modalElement.querySelector('#alertRelatedObject');
                    if (alertRelatedTypeField && alertRelatedObjectField && entityData?.related_type_id) {
                        const relatedTypeId = String(entityData.related_type_id);
                        if (relatedTypeId && relatedTypeId !== '') {
                            alertRelatedObjectField.disabled = false;
                            alertRelatedObjectField.removeAttribute('disabled');
                            console.log(`✅ Enabled alertRelatedObject field in edit mode (related_type_id: ${relatedTypeId})`);
                        }
                    }
                }
                
                // After populating form, update trade plan summary card (risk/reward calculation) and load market data
                if (modalId === 'tradePlansModal') {
                    console.log('🔍 [TradePlan Edit] Starting post-populateForm updates...');
                    
                    // Log current field values - use DataCollectionService if available
                    const logFieldValues = () => {
                        const fields = window.DataCollectionService ? {
                            ticker: window.DataCollectionService.getValue('tradePlanTicker', 'text', ''),
                            price: window.DataCollectionService.getValue('tradePlanEntryPrice', 'number', ''),
                            quantity: window.DataCollectionService.getValue('tradePlanQuantity', 'number', ''),
                            amount: window.DataCollectionService.getValue('planAmount', 'number', ''),
                            stop: window.DataCollectionService.getValue('tradePlanStopLoss', 'number', ''),
                            target: window.DataCollectionService.getValue('tradePlanTakeProfit', 'number', ''),
                            side: window.DataCollectionService.getValue('tradePlanSide', 'text', '')
                        } : {
                            ticker: modalElement.querySelector('#tradePlanTicker')?.value,
                            price: modalElement.querySelector('#tradePlanEntryPrice')?.value,
                            quantity: modalElement.querySelector('#tradePlanQuantity')?.value,
                            amount: modalElement.querySelector('#planAmount')?.value,
                            stop: modalElement.querySelector('#tradePlanStopLoss')?.value,
                            target: modalElement.querySelector('#tradePlanTakeProfit')?.value,
                            side: modalElement.querySelector('#tradePlanSide')?.value
                        };
                        console.log('📋 [TradePlan Edit] Current field values:', fields);
                        return fields;
                    };
                    
                    logFieldValues();
                    
                    // Wait a bit for all fields to be populated and DOM to be ready
                    setTimeout(async () => {
                        console.log('⏱️ [TradePlan Edit] After 300ms delay...');
                        logFieldValues();
                        
                        // Load ticker market data if ticker is selected
                        const tickerSelect = modalElement.querySelector('#tradePlanTicker');
                        if (tickerSelect && tickerSelect.value && window.loadTradePlanTickerInfo) {
                            try {
                                console.log(`🔄 [TradePlan Edit] Loading ticker market data for ticker: ${tickerSelect.value}`);
                                await window.loadTradePlanTickerInfo(tickerSelect.value);
                                console.log(`✅ [TradePlan Edit] Loaded trade plan ticker market data`);
                                logFieldValues();
                            } catch (error) {
                                window.Logger?.warn('⚠️ Failed to load trade plan ticker market data after populateForm', { error, page: 'modal-manager-v2' });
                            }
                        }
                        
                        // Calculate percentages from prices (like in add mode)
                        // This ensures stop/target percentages are calculated from existing prices
                        // bindForm is called in initializeSpecialHandlers before showModal, so it should be ready
                        // But we wait a bit to ensure all DOM updates are complete
                        if (window.InvestmentCalculationService && typeof window.InvestmentCalculationService.resync === 'function') {
                            try {
                                console.log('🔄 [TradePlan Edit] Calling resync...');
                                
                                // Wait a bit more to ensure bindForm is complete and DOM is ready
                                await new Promise(resolve => setTimeout(resolve, 100));
                                
                                logFieldValues();
                                
                                // Now resync which will calculate percentages from prices via updatePercentFromPrices
                                // and update summary card with risk/reward calculations
                                await window.InvestmentCalculationService.resync(modalElement, { force: true });
                                console.log(`✅ [TradePlan Edit] Updated trade plan summary card and calculated percentages`);
                                
                                // Check summary card content
                                const summaryCard = modalElement.querySelector('#tradePlanRiskSummaryCard');
                                if (summaryCard) {
                                    const riskRewardDiv = summaryCard.querySelector('.risk-summary-card__risk-reward');
                                    if (riskRewardDiv) {
                                        console.log('📊 [TradePlan Edit] Summary card HTML:', riskRewardDiv.innerHTML);
                                    } else {
                                        console.warn('⚠️ [TradePlan Edit] risk-reward div not found in summary card');
                                    }
                                } else {
                                    console.warn('⚠️ [TradePlan Edit] Summary card element not found');
                                }
                                
                                // Call resync again after a short delay to ensure all fields are populated
                                // This is important for edit mode where fields might load asynchronously
                                setTimeout(async () => {
                                    try {
                                        console.log('🔄 [TradePlan Edit] Calling resync again after 200ms...');
                                        logFieldValues();
                                        await window.InvestmentCalculationService.resync(modalElement, { force: true });
                                        console.log(`✅ [TradePlan Edit] Re-updated trade plan summary card`);
                                        
                                        // Check summary card content again
                                        const summaryCard2 = modalElement.querySelector('#tradePlanRiskSummaryCard');
                                        if (summaryCard2) {
                                            const riskRewardDiv2 = summaryCard2.querySelector('.risk-summary-card__risk-reward');
                                            if (riskRewardDiv2) {
                                                console.log('📊 [TradePlan Edit] Summary card HTML after second resync:', riskRewardDiv2.innerHTML);
                                            }
                                        }
                                    } catch (error) {
                                        window.Logger?.warn('⚠️ Failed to re-update trade plan summary card', { error, page: 'modal-manager-v2' });
                                    }
                                }, 200);
                            } catch (error) {
                                console.error('❌ [TradePlan Edit] Error in resync:', error);
                                window.Logger?.warn('⚠️ Failed to update trade plan summary card after populateForm', { error, page: 'modal-manager-v2' });
                            }
                        } else {
                            console.error('❌ [TradePlan Edit] InvestmentCalculationService.resync not available');
                        }
                    }, 300);
                }
                
                // After populating form, load trade ticker market data and update summary card
                if (modalId === 'tradesModal') {
                    console.log('🔍 [Trade Edit] Starting post-populateForm updates...');
                    
                    // Log current field values - use DataCollectionService if available
                    const logFieldValues = () => {
                        const fields = window.DataCollectionService ? {
                            ticker: window.DataCollectionService.getValue('tradeTicker', 'text', ''),
                            price: window.DataCollectionService.getValue('tradeEntryPrice', 'number', ''),
                            quantity: window.DataCollectionService.getValue('tradeQuantity', 'number', ''),
                            amount: window.DataCollectionService.getValue('tradeTotalInvestment', 'number', ''),
                            stop: window.DataCollectionService.getValue('tradeStopLoss', 'number', ''),
                            target: window.DataCollectionService.getValue('tradeTakeProfit', 'number', ''),
                            side: window.DataCollectionService.getValue('tradeSide', 'text', '')
                        } : {
                            ticker: modalElement.querySelector('#tradeTicker')?.value,
                            price: modalElement.querySelector('#tradeEntryPrice')?.value,
                            quantity: modalElement.querySelector('#tradeQuantity')?.value,
                            amount: modalElement.querySelector('#tradeTotalInvestment')?.value,
                            stop: modalElement.querySelector('#tradeStopLoss')?.value,
                            target: modalElement.querySelector('#tradeTakeProfit')?.value,
                            side: modalElement.querySelector('#tradeSide')?.value
                        };
                        console.log('📋 [Trade Edit] Current field values:', fields);
                        return fields;
                    };
                    
                    logFieldValues();
                    
                    // Wait a bit for all fields to be populated and DOM to be ready
                    setTimeout(async () => {
                        console.log('⏱️ [Trade Edit] After 300ms delay...');
                        logFieldValues();
                        
                        // Load ticker market data if ticker is selected
                        const tickerSelect = modalElement.querySelector('#tradeTicker');
                        if (tickerSelect && tickerSelect.value && window.loadTradeTickerInfo) {
                            try {
                                console.log(`🔄 [Trade Edit] Loading ticker market data for ticker: ${tickerSelect.value}`);
                                await window.loadTradeTickerInfo(tickerSelect.value);
                                console.log(`✅ [Trade Edit] Loaded trade ticker market data`);
                                logFieldValues();
                            } catch (error) {
                                window.Logger?.warn('⚠️ Failed to load trade ticker market data after populateForm', { error, page: 'modal-manager-v2' });
                            }
                        }
                        
                        // Calculate percentages from prices (like in add mode)
                        // This ensures stop/target percentages are calculated from existing prices
                        // bindForm is called in initializeSpecialHandlers before showModal, so it should be ready
                        // But we wait a bit to ensure all DOM updates are complete
                        if (window.InvestmentCalculationService && typeof window.InvestmentCalculationService.resync === 'function') {
                            try {
                                console.log('🔄 [Trade Edit] Calling resync...');
                                
                                // Wait a bit more to ensure bindForm is complete and DOM is ready
                                await new Promise(resolve => setTimeout(resolve, 100));
                                
                                logFieldValues();
                                
                                // Now resync which will calculate percentages from prices via updatePercentFromPrices
                                // and update summary card with risk/reward calculations
                                await window.InvestmentCalculationService.resync(modalElement, { force: true });
                                console.log(`✅ [Trade Edit] Updated trade summary card and calculated percentages`);
                                
                                // Check summary card content
                                const summaryCard = modalElement.querySelector('#tradeRiskSummaryCard');
                                if (summaryCard) {
                                    const riskRewardDiv = summaryCard.querySelector('.risk-summary-card__risk-reward');
                                    if (riskRewardDiv) {
                                        console.log('📊 [Trade Edit] Summary card HTML:', riskRewardDiv.innerHTML);
                                    } else {
                                        console.warn('⚠️ [Trade Edit] risk-reward div not found in summary card');
                                    }
                                } else {
                                    console.warn('⚠️ [Trade Edit] Summary card element not found');
                                }
                                
                                // Call resync again after a short delay to ensure all fields are populated
                                // This is important for edit mode where fields might load asynchronously
                                setTimeout(async () => {
                                    try {
                                        console.log('🔄 [Trade Edit] Calling resync again after 200ms...');
                                        logFieldValues();
                                        await window.InvestmentCalculationService.resync(modalElement, { force: true });
                                        console.log(`✅ [Trade Edit] Re-updated trade summary card`);
                                        
                                        // Check summary card content again
                                        const summaryCard2 = modalElement.querySelector('#tradeRiskSummaryCard');
                                        if (summaryCard2) {
                                            const riskRewardDiv2 = summaryCard2.querySelector('.risk-summary-card__risk-reward');
                                            if (riskRewardDiv2) {
                                                console.log('📊 [Trade Edit] Summary card HTML after second resync:', riskRewardDiv2.innerHTML);
                                            }
                                        }
                                    } catch (error) {
                                        window.Logger?.warn('⚠️ Failed to re-update trade summary card', { error, page: 'modal-manager-v2' });
                                    }
                                }, 200);
                            } catch (error) {
                                console.error('❌ [Trade Edit] Error in resync:', error);
                                window.Logger?.warn('⚠️ Failed to update trade summary card after populateForm', { error, page: 'modal-manager-v2' });
                            }
                        } else {
                            console.error('❌ [Trade Edit] InvestmentCalculationService.resync not available');
                        }
                    }, 300);
                }
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
            
            modalElement.dataset.modalMode = mode;
            
            // בדיקה אם המודל נפתח כמודל מקונן (לפני modal.show())
            // בדיקה כפולה: גם ב-ModalNavigationService וגם ישירות ב-DOM
            let isNested = false;
            
            // בדיקה 1: ModalNavigationService stack
            if (window.ModalNavigationService && 
                window.ModalNavigationService.getStack && 
                typeof window.ModalNavigationService.getStack === 'function') {
                const stack = window.ModalNavigationService.getStack();
                isNested = stack.length > 0;
            }
            
            // בדיקה 2: ישירות ב-DOM - אם יש מודל אחר עם class 'show' (חשוב למודלים שנפתחים לפני רישום)
            if (!isNested) {
                const otherOpenModals = document.querySelectorAll('.modal.show');
                // נבדוק אם יש מודל אחר פתוח (לא המודל הנוכחי)
                for (const otherModal of otherOpenModals) {
                    if (otherModal !== modalElement && otherModal.id !== modalId) {
                        isNested = true;
                        window.Logger?.debug(`Modal ${modalId} detected as nested via DOM check (other modal: ${otherModal.id})`, {
                            modalId,
                            otherModalId: otherModal.id,
                            page: 'modal-manager-v2'
                        });
                        break;
                    }
                }
            }
            
            // ניטור לפני פתיחת המודול
            const stackBeforeShow = window.ModalNavigationService?.getStack?.() || [];
            const currentZIndexBefore = modalElement.style.zIndex || getComputedStyle(modalElement).zIndex || 'none';
            const backdropsBeforeShow = Array.from(document.querySelectorAll('.modal-backdrop')).map(b => ({
                id: b.id,
                zIndex: b.style.zIndex || getComputedStyle(b).zIndex,
                hasShowClass: b.classList.contains('show')
            }));
            
            window.Logger?.info('🔍 [Z-INDEX] ModalManagerV2.showModal: Before showing modal', {
                modalId,
                mode,
                isNested,
                stackLengthBefore: stackBeforeShow.length,
                stackBefore: stackBeforeShow.map((e, idx) => ({
                    index: idx,
                    modalId: e.modalId,
                    hasElement: !!e.element
                })),
                currentZIndex: currentZIndexBefore,
                backdropsBeforeShow,
                hasModalZIndexManager: !!window.ModalZIndexManager,
                page: 'modal-manager-v2'
            });

            // הוספת modal-nested class אם נפתח כמודל מקונן (לפני modal.show())
            if (isNested && modalElement) {
                modalElement.classList.add('modal-nested', 'modal-nested-level-2');
                // הגדרת offset גבוה יותר למודל מקונן (40 במקום 20)
                modalElement.style.setProperty('--modal-nested-offset', '40');
                window.Logger?.info('🔍 [Z-INDEX] ModalManagerV2.showModal: Modal marked as nested', {
                    modalId,
                    stackLength: window.ModalNavigationService?.getStack?.()?.length || 0,
                    page: 'modal-manager-v2'
                });
            } else if (modalElement) {
                // הסרת modal-nested אם לא מקונן
                modalElement.classList.remove('modal-nested', 'modal-nested-level-2');
                modalElement.style.removeProperty('--modal-nested-offset');
            }
            
            window.Logger?.info('🔍 [Z-INDEX] ModalManagerV2.showModal: Calling modal.show()', {
                modalId,
                hasBootstrapModal: !!modal,
                page: 'modal-manager-v2'
            });
            
            // ניקוי backdrops של Bootstrap לפני modal.show() כדי למנוע backdrop כפול
            this._cleanupBootstrapBackdrops();
            
            modal.show();
            this.bindDismissButtons(modalElement);
            
            // ניקוי נוסף אחרי modal.show() למקרה ש-Bootstrap יצר backdrop חדש
            const cleanedBackdrops = this._cleanupBootstrapBackdrops();
            
            window.Logger?.info('🔍 [Z-INDEX] ModalManagerV2.showModal: After modal.show(), before backdrop management', {
                modalId,
                cleanedBackdrops,
                page: 'modal-manager-v2'
            });
            
            this.ensureGlobalBackdrop();
            
            // ניטור אחרי ensureGlobalBackdrop
            const backdropsAfterBackdrop = Array.from(document.querySelectorAll('.modal-backdrop')).map(b => ({
                id: b.id,
                zIndex: b.style.zIndex || getComputedStyle(b).zIndex,
                hasShowClass: b.classList.contains('show')
            }));
            
            window.Logger?.info('🔍 [Z-INDEX] ModalManagerV2.showModal: After ensureGlobalBackdrop', {
                modalId,
                backdropsAfterBackdrop,
                page: 'modal-manager-v2'
            });
            
            // עדכון z-index דרך ModalZIndexManager
            // שימוש ב-requestAnimationFrame לעדכון מיידי יותר
            if (window.ModalZIndexManager && typeof window.ModalZIndexManager.forceUpdate === 'function') {
                window.Logger?.info('🔍 [Z-INDEX] ModalManagerV2.showModal: Scheduling z-index forceUpdate', {
                    modalId,
                    method: 'requestAnimationFrame + setTimeout',
                    page: 'modal-manager-v2'
                });
                
                // עדכון מיידי עם requestAnimationFrame, ואז retry עם setTimeout
                const updateZIndex = () => {
                    const stackAfterDelay = window.ModalNavigationService?.getStack?.() || [];
                    window.Logger?.info('🔍 [Z-INDEX] ModalManagerV2.showModal: Calling forceUpdate', {
                        modalId,
                        stackLengthAfterDelay: stackAfterDelay.length,
                        stackAfterDelay: stackAfterDelay.map((e, idx) => ({
                            index: idx,
                            modalId: e.modalId,
                            hasElement: !!e.element
                        })),
                        page: 'modal-manager-v2'
                    });
                    
                    window.ModalZIndexManager.forceUpdate(modalElement);
                    
                    // ניטור אחרי forceUpdate
                    requestAnimationFrame(() => {
                        const finalZIndex = modalElement.style.zIndex || getComputedStyle(modalElement).zIndex || 'none';
                        const dialogZIndex = modalElement.querySelector('.modal-dialog') ? (getComputedStyle(modalElement.querySelector('.modal-dialog')).zIndex) : 'none';
                        const contentZIndex = modalElement.querySelector('.modal-content') ? (getComputedStyle(modalElement.querySelector('.modal-content')).zIndex) : 'none';
                        
                        window.Logger?.info('🔍 [Z-INDEX] ModalManagerV2.showModal: After forceUpdate', {
                            modalId,
                            zIndexBefore: currentZIndexBefore,
                            zIndexAfter: finalZIndex,
                            dialogZIndex,
                            contentZIndex,
                            zIndexChanged: currentZIndexBefore !== finalZIndex,
                            page: 'modal-manager-v2'
                        });
                        
                        // Retry אם z-index לא השתנה (race condition)
                        if (currentZIndexBefore === finalZIndex && stackAfterDelay.length > 0) {
                            setTimeout(() => {
                                window.ModalZIndexManager.forceUpdate(modalElement);
                            }, 50);
                        }
                    });
                };
                
                // עדכון מיידי עם requestAnimationFrame
                requestAnimationFrame(() => {
                    updateZIndex();
                    // Retry עם setTimeout למקרה שה-stack עדיין לא התעדכן
                    setTimeout(updateZIndex, 50);
                });
            } else {
                window.Logger?.warn('🔍 [Z-INDEX] ModalManagerV2.showModal: ModalZIndexManager not available', {
                    modalId,
                    hasModalZIndexManager: !!window.ModalZIndexManager,
                    page: 'modal-manager-v2'
                });
            }
            
            if (mode === 'edit' && entityData) {
                const entityId = entityData.id != null ? String(entityData.id) : '';
                const derivedName = entityData.name
                    || entityData.ticker_symbol
                    || entityData.symbol
                    || entityData.title
                    || entityData.ticker?.symbol
                    || '';
                
                modalElement.dataset.entityId = entityId;
                if (derivedName) {
                    modalElement.dataset.entityName = derivedName;
                } else {
                    delete modalElement.dataset.entityName;
                }
                
                const formElement = modalElement.querySelector('form');
                if (formElement) {
                    formElement.dataset.mode = mode;
                    formElement.dataset.entityId = entityId;
                }
                
                modalElement.dispatchEvent(new CustomEvent('modal:entity-context-changed', {
                    detail: {
                        entityId,
                        entityName: derivedName,
                        entityData
                    }
                }));
            } else {
                delete modalElement.dataset.entityId;
                delete modalElement.dataset.entityName;
                
                const formElement = modalElement.querySelector('form');
                if (formElement) {
                    formElement.dataset.mode = mode;
                    delete formElement.dataset.entityId;
                }
                
                modalElement.dispatchEvent(new CustomEvent('modal:entity-context-reset', {
                    detail: { mode }
                }));
            }
            
            // בדיקה שהמודל נפתח בהצלחה
            console.log(`✅ Modal ${modalId} shown successfully`);
            
            // פונקציה לבדיקה שהמודל גלוי לחלוטין (חשוב למודולים מקוננים)
            const checkModalFullyVisible = () => {
                // בדיקה שהמודל באמת גלוי (לא רק עם class 'show')
                const isFullyVisible = modalElement.classList.contains('show') && 
                                      modalElement.style.display !== 'none' &&
                                      modalElement.offsetParent !== null &&
                                      modalElement.offsetWidth > 0 &&
                                      modalElement.offsetHeight > 0 &&
                                      getComputedStyle(modalElement).visibility !== 'hidden' &&
                                      getComputedStyle(modalElement).opacity !== '0';
                return isFullyVisible;
            };
            
            // פונקציה לבדיקת visibility עם MutationObserver (למודולים מקוננים)
            const checkVisibilityWithObserver = (container, callback, timeout = 2000) => {
                if (!container) {
                    callback(false);
                    return;
                }
                
                // בדיקה מיידית
                if (checkContainerVisible(container)) {
                    callback(true);
                    return;
                }
                
                // שימוש ב-MutationObserver לבדיקת שינויים ב-DOM
                const observer = new MutationObserver(() => {
                    if (checkContainerVisible(container)) {
                        observer.disconnect();
                        callback(true);
                    }
                });
                
                // מעקב אחרי שינויים ב-parent element
                const parentElement = container.parentElement || container.closest('.modal-body') || modalElement;
                if (parentElement) {
                    observer.observe(parentElement, { 
                        attributes: true, 
                        attributeFilter: ['style', 'class'],
                        childList: true, 
                        subtree: true 
                    });
                }
                
                // Timeout fallback
                setTimeout(() => {
                    observer.disconnect();
                    const isVisible = checkContainerVisible(container);
                    callback(isVisible);
                }, timeout);
            };
            
            // פונקציה לבדיקת visibility של container
            const checkContainerVisible = (container) => {
                if (!container) return false;
                return container.offsetParent !== null && 
                       container.style.display !== 'none' && 
                       !container.classList.contains('d-none') &&
                       container.offsetWidth > 0 && 
                       container.offsetHeight > 0 &&
                       getComputedStyle(container).visibility !== 'hidden' &&
                       getComputedStyle(container).opacity !== '0';
            };
            
            // אתחול rich-text editors (חייב להיות אחרי שהמודל נפתח במלואו)
            // משתמש באירוע shown.bs.modal כדי להבטיח שהמודל גלוי לחלוטין
            const initializeRichTextEditorsHandler = async () => {
                // בדיקה אם המודל מקונן (חייב לבדוק מחדש כי זה רץ אחרי shown.bs.modal)
                const isNested = modalElement.classList.contains('modal-nested') || 
                                (window.ModalNavigationService && 
                                 window.ModalNavigationService.getStack && 
                                 typeof window.ModalNavigationService.getStack === 'function' &&
                                 window.ModalNavigationService.getStack().length > 1);
                
                // המתנה קצרה נוספת כדי להבטיח שהדום מוכן והקונטיינרים גלויים
                // במודולים מקוננים, צריך יותר זמן
                const waitTime = isNested ? 500 : 150; // הגדלה ל-500ms למודולים מקוננים
                
                // שימוש ב-requestAnimationFrame למודולים מקוננים
                if (isNested) {
                    await new Promise(resolve => requestAnimationFrame(resolve));
                    await new Promise(resolve => requestAnimationFrame(resolve));
                }
                
                await new Promise(resolve => setTimeout(resolve, waitTime));
                
                // בדיקה נוספת שהמודל עדיין גלוי
                // CRITICAL: אם המודל כבר נפתח (יש class 'show'), ננסה לאתחל גם אם הבדיקה לא עוברת
                const hasShowClass = modalElement.classList.contains('show');
                const isVisible = checkModalFullyVisible();
                
                if (!isVisible && !hasShowClass) {
                    window.Logger?.warn(`Modal ${modalId} is not fully visible, waiting for shown.bs.modal event...`, {
                        modalId,
                        isNested,
                        visibility: {
                            hasShowClass: modalElement.classList.contains('show'),
                            display: modalElement.style.display,
                            offsetParent: modalElement.offsetParent !== null,
                            offsetWidth: modalElement.offsetWidth,
                            offsetHeight: modalElement.offsetHeight,
                            computedVisibility: getComputedStyle(modalElement).visibility,
                            computedOpacity: getComputedStyle(modalElement).opacity
                        },
                        page: 'modal-manager-v2'
                    });
                    
                    // אם המודל לא גלוי, נמתין לאירוע עם retry mechanism
                    let retryCount = 0;
                    const maxRetries = 3;
                    const retryHandler = async () => {
                        retryCount++;
                        await new Promise(resolve => setTimeout(resolve, 200));
                        if (checkModalFullyVisible() || modalElement.classList.contains('show')) {
                            initializeRichTextEditorsHandler();
                        } else if (retryCount < maxRetries) {
                            modalElement.addEventListener('shown.bs.modal', retryHandler, { once: true });
                        } else {
                            window.Logger?.warn(`Modal ${modalId} still not visible after ${maxRetries} retries, attempting initialization anyway`, {
                                modalId,
                                page: 'modal-manager-v2'
                            });
                            // ננסה בכל זאת
                            initializeRichTextEditorsHandler();
                        }
                    };
                    modalElement.addEventListener('shown.bs.modal', retryHandler, { once: true });
                    return;
                }
                
                // אם המודל כבר נפתח (יש class 'show'), ננסה לאתחל גם אם הבדיקה לא עוברת
                if (!isVisible && hasShowClass) {
                    window.Logger?.warn(`Modal ${modalId} has 'show' class but visibility check failed, attempting initialization anyway`, {
                        modalId,
                        page: 'modal-manager-v2'
                    });
                    // נמשיך לאתחל למרות שהבדיקה לא עברה
                }
                
                // בדיקה ש-Quill.js נטען (אם לא, נמתין עד 2 שניות)
                let quillCheckRetries = 20;
                while (quillCheckRetries > 0 && typeof window.Quill === 'undefined') {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    quillCheckRetries--;
                }
                
                // אם Quill.js עדיין לא נטען, ננסה לטעון אותו דינמית
                if (typeof window.Quill === 'undefined') {
                    console.warn('⚠️ Quill.js not found, attempting to load dynamically...');
                    try {
                        await new Promise((resolve, reject) => {
                            // בדיקה אם כבר יש script tag
                            const existingScript = document.querySelector('script[src*="quill"]');
                            if (existingScript) {
                                console.log('🔍 Found existing Quill.js script tag, waiting for it to load...');
                                // אם יש script tag, נמתין שהוא יסתיים
                                const checkQuill = () => {
                                    if (typeof window.Quill !== 'undefined') {
                                        console.log('✅ Quill.js loaded from existing script tag');
                                        resolve();
                                    }
                                };
                                
                                // בדיקה מיידית
                                checkQuill();
                                
                                // אם כבר נטען, נבדוק שוב
                                if (existingScript.complete || existingScript.readyState === 'complete') {
                                    // Script כבר נטען
                                    setTimeout(() => {
                                        if (typeof window.Quill !== 'undefined') {
                                            resolve();
                                        } else {
                                            reject(new Error('Quill.js script tag exists but window.Quill is still undefined'));
                                        }
                                    }, 100);
                                } else {
                                    // נמתין לטעינה
                                    existingScript.addEventListener('load', () => {
                                        setTimeout(checkQuill, 100);
                                    });
                                    existingScript.addEventListener('error', (e) => {
                                        console.error('❌ Error loading Quill.js from existing script tag:', e);
                                        reject(new Error('Failed to load Quill.js from existing script tag'));
                                    });
                                    
                                    // Timeout אחרי 5 שניות
                                    setTimeout(() => {
                                        if (typeof window.Quill === 'undefined') {
                                            reject(new Error('Timeout waiting for Quill.js to load from existing script tag'));
                                        }
                                    }, 5000);
                                }
                            } else {
                                console.log('🔍 No existing Quill.js script tag found, creating new one...');
                                // אם אין script tag, ניצור אחד
                                const script = document.createElement('script');
                                script.src = 'https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js';
                                script.async = false; // לא async כדי להבטיח סדר טעינה
                                script.onload = () => {
                                    setTimeout(() => {
                                        if (typeof window.Quill !== 'undefined') {
                                            console.log('✅ Quill.js loaded dynamically');
                                            resolve();
                                        } else {
                                            reject(new Error('Quill.js script loaded but window.Quill is still undefined'));
                                        }
                                    }, 100);
                                };
                                script.onerror = (e) => {
                                    console.error('❌ Error loading Quill.js dynamically:', e);
                                    reject(new Error('Failed to load Quill.js from CDN'));
                                };
                                document.head.appendChild(script);
                            }
                        });
                    } catch (error) {
                        console.error('❌ Failed to load Quill.js dynamically:', error);
                        console.error('❌ Rich-text editors will not be initialized.');
                        return;
                    }
                }
                
                // בדיקה סופית
                if (typeof window.Quill === 'undefined') {
                    console.error('❌ Quill.js not available after all attempts. Rich-text editors will not be initialized.');
                    return;
                }
                
                // ניסיון אתחול עם retry אם הקונטיינרים עדיין לא גלויים
                // למודולים מקוננים, נשתמש ב-MutationObserver
                const allFields = [];
                if (modalInfo.config.fields && Array.isArray(modalInfo.config.fields)) {
                    allFields.push(...modalInfo.config.fields);
                }
                if (modalInfo.config.tabs && Array.isArray(modalInfo.config.tabs)) {
                    modalInfo.config.tabs.forEach(tab => {
                        if (tab.fields && Array.isArray(tab.fields)) {
                            allFields.push(...tab.fields);
                        }
                    });
                }
                
                const richTextFields = allFields.filter(f => f.type === 'rich-text');
                
                if (richTextFields.length === 0) {
                    window.Logger?.debug('No rich-text fields found in modal config', { modalId, page: 'modal-manager-v2' });
                    return;
                }
                
                // למודולים מקוננים, נשתמש ב-retry mechanism משופר
                if (isNested && richTextFields.length > 0) {
                    window.Logger?.debug('Using enhanced retry mechanism for nested modal rich-text initialization', {
                        modalId,
                        richTextFieldsCount: richTextFields.length,
                        page: 'modal-manager-v2'
                    });
                    
                    // למודולים מקוננים, ננסה יותר פעמים עם המתנות ארוכות יותר
                    let retries = 5; // יותר retries למודולים מקוננים
                    let allInitialized = false;
                    
                    while (retries > 0 && !allInitialized) {
                        // ננסה לאתחל את כל העורכים
                        await this.initializeRichTextEditors(modalElement, modalInfo.config);
                        
                        // בדיקה אם כל העורכים אותחלו
                        allInitialized = richTextFields.every(field => {
                            const container = modalElement.querySelector(`#${field.id}`);
                            if (!container) return false;
                            return container.querySelector('.ql-container') || window.RichTextEditorService?.getEditorInstance(field.id);
                        });
                        
                        if (allInitialized) {
                            window.Logger?.info(`All rich-text editors initialized successfully for nested modal ${modalId}`, {
                                modalId,
                                attempts: 6 - retries,
                                page: 'modal-manager-v2'
                            });
                            break;
                        }
                        
                        retries--;
                        if (retries > 0) {
                            window.Logger?.warn(`Some rich-text editors not initialized in nested modal, retrying... (${retries} attempts left)`, {
                                modalId,
                                failedFields: richTextFields.filter(field => {
                                    const container = modalElement.querySelector(`#${field.id}`);
                                    if (!container) return true;
                                    return !container.querySelector('.ql-container') && !window.RichTextEditorService?.getEditorInstance(field.id);
                                }).map(f => f.id),
                                page: 'modal-manager-v2'
                            });
                            // המתנה ארוכה יותר למודולים מקוננים
                            await new Promise(resolve => setTimeout(resolve, 300));
                        }
                    }
                    
                    if (!allInitialized) {
                        window.Logger?.error(`Failed to initialize all rich-text editors in nested modal ${modalId} after all retries`, {
                            modalId,
                            totalFields: richTextFields.length,
                            failedFields: richTextFields.filter(field => {
                                const container = modalElement.querySelector(`#${field.id}`);
                                if (!container) return true;
                                return !container.querySelector('.ql-container') && !window.RichTextEditorService?.getEditorInstance(field.id);
                            }).map(f => f.id),
                            page: 'modal-manager-v2'
                        });
                    }
                } else {
                    // למודולים רגילים, נשתמש ב-retry mechanism הקיים
                    let retries = 3;
                    while (retries > 0) {
                        await this.initializeRichTextEditors(modalElement, modalInfo.config);
                        
                        const allInitialized = richTextFields.every(field => {
                            const container = modalElement.querySelector(`#${field.id}`);
                            return container && (container.querySelector('.ql-container') || window.RichTextEditorService?.getEditorInstance(field.id));
                        });
                        
                        if (allInitialized || retries === 1) {
                            break;
                        }
                        
                        retries--;
                        window.Logger?.warn(`Some rich-text editors not initialized, retrying... (${retries} attempts left)`, {
                            modalId,
                            page: 'modal-manager-v2'
                        });
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                }
                
                // אם במצב edit, צריך למלא את התוכן אחרי שהעורך אותחל
                // populateForm נקרא לפני modal.show(), אז צריך למלא שוב אחרי אתחול העורך
                if (mode === 'edit' && entityData) {
                    // מילוי נתונים לעורך rich-text (אחרי אתחול)
                    const form = modalElement.querySelector('form');
                    if (form && window.RichTextEditorService) {
                        const fieldMapping = this.getFieldMapping(modalInfo.config?.entityType);
                        if (entityData.content) {
                            // מציאת שדה rich-text בקונפיגורציה
                            const allFields = [];
                            if (modalInfo.config.fields && Array.isArray(modalInfo.config.fields)) {
                                allFields.push(...modalInfo.config.fields);
                            }
                            if (modalInfo.config.tabs && Array.isArray(modalInfo.config.tabs)) {
                                modalInfo.config.tabs.forEach(tab => {
                                    if (tab.fields && Array.isArray(tab.fields)) {
                                        allFields.push(...tab.fields);
                                    }
                                });
                            }
                            
                            // מציאת שדה content (rich-text)
                            const contentField = allFields.find(f => 
                                f.type === 'rich-text' && 
                                (f.id === 'noteContent' || fieldMapping?.content === f.id || f.id.includes('Content'))
                            );
                            if (contentField) {
                                // Sanitize content before setting
                                const sanitizedContent = window.RichTextEditorService.sanitizeHTML(entityData.content || '');
                                window.RichTextEditorService.setContent(contentField.id, sanitizedContent);
                                console.log(`✅ Rich-text content set for field "${contentField.id}"`);
                            }
                        }
                    }
                }
            };
            
            // אם המודל כבר מוצג לחלוטין, נמתין קצת ואז נאתחל
            // למודולים מקוננים, נשתמש ב-requestAnimationFrame + setTimeout ארוך יותר
            // CRITICAL: גם אם המודל לא עובר את הבדיקה המלאה, אם יש class 'show', ננסה לאתחל
            const hasShowClass = modalElement.classList.contains('show');
            const isFullyVisible = checkModalFullyVisible();
            
            if (isFullyVisible || hasShowClass) {
                const isNested = modalElement.classList.contains('modal-nested') || 
                                (window.ModalNavigationService && 
                                 window.ModalNavigationService.getStack && 
                                 typeof window.ModalNavigationService.getStack === 'function' &&
                                 window.ModalNavigationService.getStack().length > 1);
                const delay = isNested ? 800 : 300; // הגדלה ל-800ms למודולים מקוננים
                
                // למודולים מקוננים, נשתמש ב-requestAnimationFrame + setTimeout
                if (isNested) {
                    // המתנה עם requestAnimationFrame + setTimeout ארוך יותר
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                // אם המודל כבר נפתח (יש class 'show'), ננסה לאתחל גם אם הבדיקה לא עוברת
                                if (checkModalFullyVisible() || modalElement.classList.contains('show')) {
                                    initializeRichTextEditorsHandler();
                                } else {
                                    // אם המודל לא גלוי, נשתמש ב-event
                                    modalElement.addEventListener('shown.bs.modal', initializeRichTextEditorsHandler, { once: true });
                                }
                            }, delay);
                        });
                    });
                } else {
                    // המתנה קצרה נוספת כדי להבטיח שהמודל באמת מוכן
                    setTimeout(() => {
                        // אם המודל כבר נפתח (יש class 'show'), ננסה לאתחל גם אם הבדיקה לא עוברת
                        if (checkModalFullyVisible() || modalElement.classList.contains('show')) {
                            initializeRichTextEditorsHandler();
                        } else {
                            // אם המודל לא גלוי, נשתמש ב-event
                            modalElement.addEventListener('shown.bs.modal', initializeRichTextEditorsHandler, { once: true });
                        }
                    }, delay);
                }
            } else {
                // אחרת, המתן לאירוע shown.bs.modal
                modalElement.addEventListener('shown.bs.modal', initializeRichTextEditorsHandler, { once: true });
            }
            
            // Modal Navigation System - רק למודלים מקוננים (nested modals)
            // בדיקה אם יש stack - רק אז זה מודל מקונן שצריך רישום
            const hasStack = window.ModalNavigationService?.getStack?.()?.length > 0;
            
            if (hasStack) {
                const navigationMetadata = {
                    modalId,
                    modalType: 'crud-modal',
                    entityType: modalInfo.config.entityType,
                    entityId: mode === 'edit' && entityData ? entityData.id : null,
                    title: modalElement.querySelector(`#${modalId}Label`)?.textContent || modalInfo.config.title[mode] || '',
                    mode
                };

                if (window.ModalNavigationService?.registerModalOpen) {
                    await window.ModalNavigationService.registerModalOpen(modalElement, navigationMetadata);
                } else if (window.pushModalToNavigation) {
                    await window.pushModalToNavigation(modalElement, navigationMetadata);
                }

                // עדכון UI (breadcrumb וכפתור חזרה) רק במודלים מקוננים
                if (window.modalNavigationManager?.updateModalNavigation) {
                    window.modalNavigationManager.updateModalNavigation(modalElement);
                }
            }
            
            // Apply remaining defaults after modal shows (date, source, etc.)
            if (mode === 'add') {
                await this.applyRemainingDefaults(modalElement.querySelector('form'));
            }
            
            // Special handlers for tickers modal - enable/disable external data check button
            // Must be called AFTER modal is shown to ensure elements exist
            if (modalElement.id === 'tickersModal' || modalInfo.config?.entityType === 'ticker') {
                const form = modalElement.querySelector('form');
                if (form) {
                    const symbolField = form.querySelector('#tickerSymbol');
                    const checkBtn = form.querySelector('#checkTickerExternalDataBtn');
                    
                    if (symbolField && checkBtn) {
                        // Enable/disable button based on symbol field value
                        const updateButtonState = () => {
                            const symbol = symbolField.value?.trim();
                            checkBtn.disabled = !symbol || symbol.length === 0;
                            
                            // Clear previous results when symbol changes
                            const resultDiv = form.querySelector('#tickerExternalDataResult');
                            const warningDiv = form.querySelector('#tickerExternalDataWarning');
                            if (resultDiv) resultDiv.style.display = 'none';
                            if (warningDiv) warningDiv.style.display = 'none';
                        };
                        
                        // Initial state
                        updateButtonState();
                        
                        // Add event listeners with multiple event types for better coverage
                        symbolField.addEventListener('input', updateButtonState, { passive: true });
                        symbolField.addEventListener('change', updateButtonState, { passive: true });
                        symbolField.addEventListener('keyup', updateButtonState, { passive: true });
                        symbolField.addEventListener('paste', () => setTimeout(updateButtonState, 10), { passive: true });
                        
                        // Process button through button system
                        if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
                            window.advancedButtonSystem.processButtons(checkBtn);
                        }
                        
                        console.log('✅ Ticker external data check button initialized', {
                            symbolField: symbolField.id,
                            checkBtn: checkBtn.id,
                            initialDisabled: checkBtn.disabled
                        });
                    }
                }
            }
            
            // Special handlers for notes modal - enable/disable related object select
            // Must be called AFTER modal is shown to ensure elements exist
            if (modalElement.id === 'notesModal' || modalInfo.config?.entityType === 'note') {
                setTimeout(async () => {
                    const form = modalElement.querySelector('form');
                    if (!form) {
                        console.warn('⚠️ Form not found for notes modal');
                        return;
                    }
                    
                    const noteRelatedTypeSelect = form.querySelector('#noteRelatedType');
                    const noteRelatedObjectField = form.querySelector('#noteRelatedObject');
                    
                    if (!noteRelatedTypeSelect || !noteRelatedObjectField) {
                        console.warn('⚠️ Notes modal elements not found:', {
                            noteRelatedTypeSelect: !!noteRelatedTypeSelect,
                            noteRelatedObjectField: !!noteRelatedObjectField
                        });
                        return;
                    }
                    
                    // Handler to update related object field - use form reference to get fresh elements
                    const handleRelatedTypeChange = async (e) => {
                        const relatedTypeId = e.target.value;
                        console.log('🔍 noteRelatedType changed to:', relatedTypeId);
                        
                        // Get fresh reference to the object field (in case DOM changed)
                        const formElement = e.target.closest('form');
                        if (!formElement) return;
                        
                        const relatedObjectField = formElement.querySelector('#noteRelatedObject');
                        if (!relatedObjectField) {
                            console.warn('⚠️ noteRelatedObject field not found in form');
                            return;
                        }
                        
                        if (relatedTypeId && relatedTypeId !== '') {
                            // Enable the related object field
                            relatedObjectField.disabled = false;
                            console.log('✅ noteRelatedObject enabled');
                            
                            // Populate the related objects
                            await this.populateNoteRelatedObjects(formElement, relatedTypeId);
                        } else {
                            // Disable and clear if no type selected
                            relatedObjectField.disabled = true;
                            relatedObjectField.textContent = '';
                            const defaultOption = document.createElement('option');
                            defaultOption.value = '';
                            defaultOption.textContent = 'בחר אובייקט...';
                            relatedObjectField.appendChild(defaultOption);
                            console.log('⚠️ noteRelatedObject disabled - no type selected');
                        }
                    };
                    
                    // Initial state - check if there's already a value (edit mode)
                    // Check both the select value and if the object field already has a value
                    const currentRelatedType = noteRelatedTypeSelect.value;
                    const currentRelatedObject = noteRelatedObjectField.value;
                    const isEditMode = currentRelatedType && currentRelatedType !== '' || currentRelatedObject && currentRelatedObject !== '';
                    
                    if (isEditMode && currentRelatedType && currentRelatedType !== '') {
                        // In edit mode with existing related type - enable the field
                        noteRelatedObjectField.disabled = false;
                        noteRelatedObjectField.removeAttribute('disabled');
                        console.log(`✅ noteRelatedObject enabled (edit mode, type: ${currentRelatedType}, object: ${currentRelatedObject})`);
                        // Populate the related objects for the existing type (if not already populated)
                        if (noteRelatedObjectField.options.length <= 1) {
                            await this.populateNoteRelatedObjects(form, currentRelatedType);
                        }
                    } else if (!isEditMode) {
                        // In add mode or no type selected - disable the field
                        noteRelatedObjectField.disabled = true;
                        console.log('⚠️ noteRelatedObject disabled (add mode or no type selected)');
                    } else {
                        // Field might be enabled by populateForm - don't disable it
                        console.log(`ℹ️ noteRelatedObject state preserved (type: ${currentRelatedType || 'none'}, object: ${currentRelatedObject || 'none'})`);
                    }
                    
                    // Add event listener directly (no need to clone/replace)
                    noteRelatedTypeSelect.addEventListener('change', handleRelatedTypeChange.bind(this));
                    
                    // Also add input event for better coverage
                    noteRelatedTypeSelect.addEventListener('input', handleRelatedTypeChange.bind(this));
                    
                    console.log('✅ Notes related type/object handlers initialized', {
                        noteRelatedTypeSelect: noteRelatedTypeSelect.id,
                        noteRelatedObjectField: noteRelatedObjectField.id,
                        currentRelatedType: currentRelatedType,
                        initialDisabled: noteRelatedObjectField.disabled
                    });
                }, 150); // Slightly longer delay to ensure DOM is fully ready
            }

            // Special handlers for alerts modal - mimic notes behavior
            if (modalElement.id === 'alertsModal' || modalInfo.config?.entityType === 'alert') {
                const formDataForAlerts = entityData || null;
                setTimeout(() => {
                    const form = modalElement.querySelector('form');
                    if (!form) {
                        console.warn('⚠️ Form not found for alerts modal');
                        return;
                    }

                    const alertRelatedTypeSelect = form.querySelector('#alertRelatedType');
                    const alertRelatedObjectField = form.querySelector('#alertRelatedObject');

                    if (!alertRelatedTypeSelect || !alertRelatedObjectField) {
                        console.warn('⚠️ Alerts modal elements not found:', {
                            alertRelatedTypeSelect: !!alertRelatedTypeSelect,
                            alertRelatedObjectField: !!alertRelatedObjectField
                        });
                        return;
                    }

                    const logInfo = (message, data = {}) => {
                        window.Logger?.info?.(message, data, { page: 'modal-manager-v2' });
                    };
                    const logWarn = (message, data = {}) => {
                        window.Logger?.warn?.(message, data, { page: 'modal-manager-v2' });
                    };

                    const handleAlertRelatedTypeChange = async (relatedTypeId, selectedRelatedIdOverride = undefined) => {
                        logInfo('🔁 [alertsModal] related type changed', { relatedTypeId, selectedRelatedIdOverride });
                        if (!alertRelatedObjectField) {
                            logWarn('⚠️ [alertsModal] alertRelatedObject not found when handling type change');
                            return;
                        }

                        if (relatedTypeId && relatedTypeId !== '') {
                            alertRelatedObjectField.disabled = false;
                            alertRelatedObjectField.removeAttribute('disabled');
                            const normalizedSelectedId = selectedRelatedIdOverride !== undefined
                                ? selectedRelatedIdOverride
                                : alertRelatedObjectField.value || (formDataForAlerts && formDataForAlerts.related_id) || null;
                            await this.populateAlertRelatedObjects(form, relatedTypeId, normalizedSelectedId);
                            if (normalizedSelectedId) {
                                // Use DataCollectionService to set value if available
                                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                                  window.DataCollectionService.setValue(alertRelatedObjectField.id, normalizedSelectedId, 'int');
                                } else {
                                  alertRelatedObjectField.value = normalizedSelectedId;
                                }
                            }
                            await this.updateAlertTickerDisplay(form, null);
                            this.handleAlertLinkedEntityUpdate(null);
                        } else {
                            alertRelatedObjectField.disabled = true;
                            alertRelatedObjectField.setAttribute('disabled', 'disabled');
                            alertRelatedObjectField.textContent = '';
                            const defaultOption = document.createElement('option');
                            defaultOption.value = '';
                            defaultOption.textContent = 'בחר אובייקט...';
                            alertRelatedObjectField.appendChild(defaultOption);
                            await this.updateAlertTickerDisplay(form, null);
                            this.handleAlertLinkedEntityUpdate(null);
                        }
                        this.updateAlertDefaultMessage(form);
                    };

                    const handleAlertRelatedObjectChange = async (relatedId) => {
                        const relatedTypeId = alertRelatedTypeSelect.value;
                        logInfo('🔁 [alertsModal] related object changed', { relatedTypeId, relatedId });
                        if (relatedTypeId && relatedId) {
                            await this.updateAlertTickerFromRelatedObject(form, relatedTypeId, relatedId);
                        } else {
                            await this.updateAlertTickerDisplay(form, null);
                            this.handleAlertLinkedEntityUpdate(null);
                        }
                    };

                    // Initial state - check if there's already a value (edit mode)
                    // Check both the select value and if the object field already has a value
                    const currentAlertRelatedType = alertRelatedTypeSelect.value;
                    const currentAlertRelatedObject = alertRelatedObjectField.value;
                    const isAlertEditMode = currentAlertRelatedType && currentAlertRelatedType !== '' || currentAlertRelatedObject && currentAlertRelatedObject !== '';
                    
                    if (isAlertEditMode && currentAlertRelatedType && currentAlertRelatedType !== '') {
                        // In edit mode with existing related type - enable the field
                        alertRelatedObjectField.disabled = false;
                        alertRelatedObjectField.removeAttribute('disabled');
                        console.log(`✅ alertRelatedObject enabled (edit mode, type: ${currentAlertRelatedType}, object: ${currentAlertRelatedObject})`);
                    } else if (!isAlertEditMode) {
                        // In add mode or no type selected - disable the field
                        alertRelatedObjectField.disabled = true;
                        alertRelatedObjectField.setAttribute('disabled', 'disabled');
                        alertRelatedObjectField.textContent = '';
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'בחר אובייקט...';
                        alertRelatedObjectField.appendChild(option);
                        console.log('⚠️ alertRelatedObject disabled (add mode or no type selected)');
                    } else {
                        // Field might be enabled by populateForm - don't disable it
                        console.log(`ℹ️ alertRelatedObject state preserved (type: ${currentAlertRelatedType || 'none'}, object: ${currentAlertRelatedObject || 'none'})`);
                    }

                    if (!alertRelatedTypeSelect.dataset.alertsHandlersAttached) {
                        alertRelatedTypeSelect.addEventListener('change', async (event) => {
                            await handleAlertRelatedTypeChange(event.target.value);
                        });
                        alertRelatedTypeSelect.addEventListener('input', async (event) => {
                            await handleAlertRelatedTypeChange(event.target.value);
                        });
                        alertRelatedTypeSelect.dataset.alertsHandlersAttached = 'true';
                    }

                    if (!alertRelatedObjectField.dataset.alertsHandlersAttached) {
                        alertRelatedObjectField.addEventListener('change', async (event) => {
                            await handleAlertRelatedObjectChange(event.target.value);
                        });
                        alertRelatedObjectField.addEventListener('input', async (event) => {
                            await handleAlertRelatedObjectChange(event.target.value);
                        });
                        alertRelatedObjectField.dataset.alertsHandlersAttached = 'true';
                    }

                    form.addEventListener('change', async (event) => {
                        const { target } = event;
                        if (!target || !target.id) {
                            return;
                        }
                        if (target.id === 'alertRelatedType') {
                            await handleAlertRelatedTypeChange(target.value);
                        } else if (target.id === 'alertRelatedObject') {
                            await handleAlertRelatedObjectChange(target.value);
                        }
                    });

                    console.log('✅ Alerts related type/object handlers initialized', {
                        alertRelatedTypeSelect: alertRelatedTypeSelect.id,
                        alertRelatedObjectField: alertRelatedObjectField.id,
                        initialDisabled: alertRelatedObjectField.disabled
                    });

                    // Ensure state is consistent when modal opens with existing selection
                    if (alertRelatedTypeSelect.value) {
                        const initialRelatedId = (formDataForAlerts && formDataForAlerts.related_id) || alertRelatedObjectField.value || undefined;
                        handleAlertRelatedTypeChange(alertRelatedTypeSelect.value, initialRelatedId);
                    }
                    if (alertRelatedTypeSelect.value && alertRelatedObjectField.value) {
                        handleAlertRelatedObjectChange(alertRelatedObjectField.value);
                    }

                    if (!formDataForAlerts) {
                        this._applyAlertsInitialDefaults(form);
                    }
                    
                    const alertTypeField = form.querySelector('#alertType');
                    const alertConditionField = form.querySelector('#alertCondition');
                    const alertValueField = form.querySelector('#alertValue');
                    
                    const messageUpdater = () => {
                        this.updateAlertDefaultMessage(form);
                    };
                    
                    if (alertTypeField && !alertTypeField.dataset.alertsHandlersAttached) {
                        alertTypeField.addEventListener('change', messageUpdater);
                        alertTypeField.dataset.alertsHandlersAttached = 'true';
                    }
                    
                    if (alertConditionField && !alertConditionField.dataset.alertsHandlersAttached) {
                        alertConditionField.addEventListener('change', messageUpdater);
                        alertConditionField.dataset.alertsHandlersAttached = 'true';
                    }
                    
                    if (alertValueField && !alertValueField.dataset.alertsHandlersAttached) {
                        alertValueField.addEventListener('input', () => {
                            messageUpdater();
                        });
                        alertValueField.addEventListener('change', messageUpdater);
                        alertValueField.dataset.alertsHandlersAttached = 'true';
                    }
                    
                    this.updateAlertDefaultMessage(form, { force: true });
                }, 150);
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

            const modalInfo = this.modals.get(modalId);
            const modalElement = modalInfo?.element || document.getElementById(modalId);
            await this._hydrateTagFieldsForModal(modalElement, entityType, entityId);
            
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
            const entityData = result.data || result;
            
            // Adapt DateEnvelope objects if date-utils is available
            // This ensures date fields are properly converted for form inputs
            if (window.adaptDateEnvelopes && typeof window.adaptDateEnvelopes === 'function') {
                return window.adaptDateEnvelopes(entityData);
            }
            
            return entityData;
            
        } catch (error) {
            console.error(`Error loading entity data for ${entityType} ${entityId}:`, error);
            return null;
        }
    }

    /**
     * Hydrate tag select fields inside a modal after entity data loads.
     * Ensures edit modals show the tags already linked to the entity.
     * @private
     */
    async _hydrateTagFieldsForModal(modalElement, defaultEntityType, entityId) {
        if (!modalElement) {
            window.Logger?.warn('⚠️ _hydrateTagFieldsForModal: modalElement not available', {
                page: 'modal-manager-v2'
            });
            return;
        }

        // Wait for TagUIManager to be available (it might load after modal opens)
        if (!window.TagUIManager) {
            window.Logger?.info('🏷️ TagUIManager not available yet, waiting...', {
                modalId: modalElement.id,
                page: 'modal-manager-v2'
            });
            
            // Retry mechanism: wait for TagUIManager to be available
            let retries = 0;
            const maxRetries = 10;
            const retryDelay = 100; // 100ms between retries
            
            while (retries < maxRetries && !window.TagUIManager) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retries++;
            }
            
            if (!window.TagUIManager) {
                window.Logger?.warn('⚠️ TagUIManager not available after waiting', {
                    modalId: modalElement.id,
                    retries,
                    page: 'modal-manager-v2'
                });
                return;
            }
            
            window.Logger?.info('🏷️ TagUIManager became available after waiting', {
                modalId: modalElement.id,
                retries,
                page: 'modal-manager-v2'
            });
        }

        // First, initialize all tag selects (sets up event listeners and ensures they're ready)
        if (typeof window.TagUIManager.initializeModal === 'function') {
            try {
                window.Logger?.info('🏷️ Initializing tag picker in modal', { 
                    modalId: modalElement.id,
                    entityType: defaultEntityType,
                    page: 'modal-manager-v2' 
                });
                window.TagUIManager.initializeModal(modalElement);
            } catch (error) {
                window.Logger?.warn('⚠️ Failed to initialize tag picker in modal', { 
                    error: error.message || error,
                    modalId: modalElement.id, 
                    page: 'modal-manager-v2' 
                });
            }
        }

        // Wait a bit to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 50));

        const tagSelects = modalElement.querySelectorAll('select.tag-multi-select');
        window.Logger?.info('🏷️ _hydrateTagFieldsForModal called', {
            modalId: modalElement.id,
            defaultEntityType,
            entityId,
            tagSelectsCount: tagSelects.length,
            selectIds: Array.from(tagSelects).map(s => s.id),
            page: 'modal-manager-v2'
        });
        
        if (!tagSelects.length) {
            window.Logger?.info('🏷️ No tag selects found in modal', { modalId: modalElement.id, page: 'modal-manager-v2' });
            return;
        }

        for (const select of tagSelects) {
            const targetEntityType = select.dataset.tagEntity || defaultEntityType;
            if (!targetEntityType || !select.id) {
                window.Logger?.warn('⚠️ Skipping tag select - missing entityType or id', {
                    selectId: select.id,
                    targetEntityType,
                    defaultEntityType,
                    hasTagEntity: !!select.dataset.tagEntity,
                    page: 'modal-manager-v2'
                });
                continue;
            }
            
            // For edit mode: load existing tags for the entity
            if (entityId && typeof window.TagUIManager.hydrateSelectForEntity === 'function') {
                try {
                    window.Logger?.info('🏷️ Hydrating tag select for entity (edit mode)', {
                        selectId: select.id,
                        entityType: targetEntityType,
                        entityId,
                        page: 'modal-manager-v2'
                    });
                    await window.TagUIManager.hydrateSelectForEntity(select.id, targetEntityType, entityId, { force: true });
                } catch (error) {
                    window.Logger?.warn?.('⚠️ Failed to hydrate tag select after edit load', {
                        error: error.message || error,
                        errorStack: error.stack,
                        selectId: select.id,
                        entityType: targetEntityType,
                        entityId,
                        page: 'modal-manager-v2'
                    });
                }
            } else {
                // For add mode: ensure tags are populated - refreshSelectOptions will populate if not already done
                if (typeof window.TagUIManager.refreshSelectOptions === 'function') {
                    window.Logger?.info('🏷️ Refreshing tag select options (add mode)', {
                        selectId: select.id,
                        entityType: targetEntityType,
                        hasTagService: !!window.TagService,
                        hasFetchTags: !!(window.TagService && typeof window.TagService.fetchTags === 'function'),
                        page: 'modal-manager-v2'
                    });
                    
                    // Retry mechanism: wait for TagService to be available
                    let retries = 0;
                    const maxRetries = 5;
                    const retryDelay = 200; // 200ms between retries
                    
                    while (retries < maxRetries) {
                        try {
                            // Check if TagService is available
                            if (window.TagService && typeof window.TagService.fetchTags === 'function') {
                                await window.TagUIManager.refreshSelectOptions(select);
                                window.Logger?.info('🏷️ Tag select refreshed successfully', {
                                    selectId: select.id,
                                    retries,
                                    page: 'modal-manager-v2'
                                });
                                break; // Success, exit retry loop
                            } else {
                                window.Logger?.debug('🏷️ TagService not available yet, waiting...', {
                                    selectId: select.id,
                                    retries,
                                    page: 'modal-manager-v2'
                                });
                                // Wait a bit and retry
                                await new Promise(resolve => setTimeout(resolve, retryDelay));
                                retries++;
                            }
                        } catch (error) {
                            if (retries >= maxRetries - 1) {
                                // Last retry failed, log warning
                                window.Logger?.warn?.('⚠️ Failed to refresh tag select options in add mode after retries', {
                                    error: error.message || error,
                                    errorStack: error.stack,
                                    selectId: select.id,
                                    entityType: targetEntityType,
                                    retries,
                                    page: 'modal-manager-v2'
                                });
                            } else {
                                window.Logger?.debug('🏷️ Error refreshing tag select, retrying...', {
                                    selectId: select.id,
                                    error: error.message || error,
                                    retries,
                                    page: 'modal-manager-v2'
                                });
                                // Wait and retry
                                await new Promise(resolve => setTimeout(resolve, retryDelay));
                                retries++;
                            }
                        }
                    }
                } else {
                    window.Logger?.warn('⚠️ TagUIManager.refreshSelectOptions not available', {
                        selectId: select.id,
                        page: 'modal-manager-v2'
                    });
                }
            }
            
            // Load suggestions for both add and edit modes
            if (typeof window.TagUIManager.loadSuggestionsForSelect === 'function') {
                const suggestionEntityId = entityId && targetEntityType === defaultEntityType ? entityId : null;
                window.TagUIManager.loadSuggestionsForSelect(select, {
                    entityType: targetEntityType,
                    entityId: suggestionEntityId
                });
            }
        }
    }
    
    /**
     * Convert singular entity type to plural API endpoint
     * @param {string} entityType - סוג הישות ביחיד
     * @returns {string} שם ה-endpoint ברבים
     */
    getPluralEndpoint(entityType) {
        const pluralMap = {
            'cash_flow': 'cash-flows',  // Fixed: matches url_prefix='/api/cash-flows' in backend
            'trade': 'trades',
            'trading_account': 'trading-accounts',
            'alert': 'alerts',
            'execution': 'executions',
            'ticker': 'tickers',
            'trade_plan': 'trade-plans',
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
                // Use DataCollectionService to clear field if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(input.id, '', 'text');
                } else {
                  input.value = '';
                }
            }
        });
        
        // ניקוי rich-text editors
        const richTextContainers = form.querySelectorAll('.rich-text-editor-container');
        richTextContainers.forEach(container => {
            const editorId = container.id;
            if (!editorId) {
                return;
            }

            const hasService = window.RichTextEditorService
                && typeof window.RichTextEditorService.getEditorInstance === 'function'
                && typeof window.RichTextEditorService.setContent === 'function';

            if (hasService) {
                const editorInstance = window.RichTextEditorService.getEditorInstance(editorId);
                if (editorInstance) {
                    window.RichTextEditorService.setContent(editorId, '');
                    return;
                }
            }

            container.dataset.pendingContent = '';
        });
        
        // ניקוי שגיאות ולידציה
        this.clearValidationErrors(form);
        
        const formMode = form.dataset.modalMode || modalElement.dataset?.modalMode || '';
        if (formMode !== 'edit') {
            // Note: applyDefaultValues is async but we don't await it here
            this.applyDefaultValues(form).catch(err => console.warn('Error applying default values:', err));
        } else {
            console.log('⏭️ Skipping applyDefaultValues in edit mode');
        }
    }

    /**
     * Initialize rich-text editors in modal - אתחול עורכי טקסט עשיר במודל
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @param {Object} config - קונפיגורציה של המודל
     * @private
     */
    async initializeRichTextEditors(modalElement, config) {
        try {
            // בדיקה ש-RichTextEditorService זמין
            if (!window.RichTextEditorService) {
                console.warn('⚠️ RichTextEditorService not available - rich-text editors will not be initialized');
                return;
            }

            // מציאת כל שדות rich-text בקונפיגורציה
            const allFields = [];
            if (config.fields && Array.isArray(config.fields)) {
                allFields.push(...config.fields);
            }
            if (config.tabs && Array.isArray(config.tabs)) {
                config.tabs.forEach(tab => {
                    if (tab.fields && Array.isArray(tab.fields)) {
                        allFields.push(...tab.fields);
                    }
                });
            }

            // אתחול כל עורכי rich-text
            for (const field of allFields) {
                if (field.type === 'rich-text') {
                    const container = modalElement.querySelector(`#${field.id}`);
                    if (container) {
                        // קבלת options מהשדה
                        const options = field.options || {};
                        
                        // מיזוג עם ברירות מחדל
                        const editorOptions = {
                            placeholder: options.placeholder || field.placeholder || 'הכנס תוכן כאן...',
                            direction: options.direction || 'rtl',
                            maxLength: options.maxLength || field.maxLength,
                            minHeight: options.minHeight, // גובה מינימלי למודולים מקוננים
                            modules: {
                                toolbar: options.toolbar || [
                                    [{ 'header': [2, 3, false] }],
                                    ['bold', 'italic', 'underline', 'strike'],
                                    [{ 'color': [] }, { 'background': [] }],
                                    [{ 'align': ['right', 'center', 'left', 'justify'] }],
                                    [{ 'direction': 'rtl' }, { 'direction': 'ltr' }],
                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                    ['link'],
                                    ['clean']
                                ]
                            }
                        };

                        // אתחול העורך
                        const quill = window.RichTextEditorService.initEditor(field.id, editorOptions);
                        if (quill) {
                            console.log(`✅ Rich-text editor "${field.id}" initialized successfully`);
                            // Check for pending content (set by populateForm before editor was initialized)
                            if (container.dataset.pendingContent !== undefined) {
                                const pendingHtml = container.dataset.pendingContent || '';
                                console.log(`📝 Loading pending content for ${field.id}:`, pendingHtml.substring(0, 100) + '...');
                                this._setRichTextContent(field.id, pendingHtml, pendingHtml ? {} : { clearAutoMessage: true });
                                delete container.dataset.pendingContent;
                            }
                            quill.on('text-change', (delta, oldDelta, source) => {
                                if (this._richTextUpdateGuards && this._richTextUpdateGuards.has(field.id)) {
                                    return;
                                }
                                if (source === 'user') {
                                    container.dataset.userModified = 'true';
                                    delete container.dataset.autoMessage;
                                    delete container.dataset.autoMessageText;
                                }
                            });
                        }
                    } else {
                        console.warn(`⚠️ Rich-text container "${field.id}" not found in modal`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error initializing rich-text editors:', error);
        }
    }

    /**
     * Populate form with data - מילוי טופס עם נתונים
     * 
     * **Trade Planning Fields Support (2025-01-29):**
     * - For trade entities, populates planning fields (planned_quantity, planned_amount, entry_price) 
     *   ONLY from Trade entity itself
     * - NO FALLBACKS - if data is missing, shows clear notification to user
     * - Implements strict data source policy: only Trade's own fields, no position/plan fallbacks
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @param {Object} data - נתונים למילוי, עבור trade כולל:
     *   - planned_quantity: כמות מתוכננת מה-Trade עצמו
     *   - planned_amount: סכום מתוכנן מה-Trade עצמו
     *   - entry_price: מחיר כניסה מה-Trade עצמו
     * @param {string} formId - מזהה הטופס (אופציונלי)
     * @returns {Promise<void>}
     * 
     * @example
     * // For trade entity - only uses Trade's own planning fields
     * await modalManager.populateForm(modalElement, {
     *   planned_quantity: 100,
     *   planned_amount: 10000,
     *   entry_price: 100
     * });
     * // If fields are missing, user will see notification: "נתוני תכנון חסרים"
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
        
        // Get all field configs to check for rich-text fields
        const allFieldConfigs = [];
        if (config?.fields && Array.isArray(config.fields)) {
            allFieldConfigs.push(...config.fields);
        }
        if (config?.tabs && Array.isArray(config.tabs)) {
            config.tabs.forEach(tab => {
                if (tab.fields && Array.isArray(tab.fields)) {
                    allFieldConfigs.push(...tab.fields);
                }
            });
        }
        
        // Create a map of field IDs to their configs for quick lookup
        const fieldConfigMap = new Map();
        allFieldConfigs.forEach(fieldConfig => {
            if (fieldConfig.id) {
                fieldConfigMap.set(fieldConfig.id, fieldConfig);
            }
        });
        
                // Fields to ignore (metadata/relationship fields)
        const fieldsToIgnore = ['id', 'updated_at', 'account_name', 'currency_name', 'currency_symbol', 'usd_rate'];
        
        // Don't ignore created_at/opened_at if they have field mappings (e.g., trade entry date)
        const ignoreCreatedAt = !fieldMapping || (!fieldMapping['created_at'] && !fieldMapping['opened_at']);
        
        // מילוי שדות רגילים
        for (const [key, value] of Object.entries(data)) {
            // Ignore metadata fields (but allow created_at/opened_at if mapped)
            if (fieldsToIgnore.includes(key) || (key === 'created_at' && ignoreCreatedAt)) {
                console.log(`⏭️ Skipping ${key} (metadata field)`);
                continue;
            }
            
            // Skip opened_at if it's the same as created_at (to avoid duplicate)
            if (key === 'opened_at' && data['created_at'] && data['created_at'] === value && fieldMapping['created_at']) {
                console.log(`⏭️ Skipping ${key} (same as created_at)`);
                continue;
            }
            
            // CRITICAL: For date fields, prefer DateEnvelope over display string
            // Check if this is a date field and if there's a _envelope version
            let actualValue = value;
            if ((key === 'date' || key.endsWith('_date') || key.includes('Date')) && data[`${key}_envelope`]) {
                actualValue = data[`${key}_envelope`];
                console.log(`🔍 [populateForm] Using ${key}_envelope instead of ${key} (DateEnvelope detected)`);
            }
            
            // Try direct match first (search in form and all tab panes)
            let field = form.querySelector(`#${key}, [name="${key}"]`);
            if (!field) {
                // Also search in entire modal (including all tab panes)
                field = modalElement.querySelector(`#${key}, [name="${key}"]`);
            }
            
            // If no direct match, try field mapping
            if (!field && fieldMapping[key]) {
                const mappedFieldId = fieldMapping[key];
                console.log(`🔍 Field mapping: ${key} -> ${mappedFieldId}`);
                field = form.querySelector(`#${mappedFieldId}, [name="${mappedFieldId}"]`);
                if (!field) {
                    // Search in entire modal (including all tab panes)
                    field = modalElement.querySelector(`#${mappedFieldId}, [name="${mappedFieldId}"]`);
                }
            }
            
            if (!field) {
                console.log(`⚠️ Field not found for ${key} (mapped to: ${fieldMapping[key] || 'N/A'})`);
            }
            
            if (field) {
                console.log(`✅ Found field for ${key} (value: ${actualValue}, valueType: ${typeof actualValue}, fieldId: ${field.id}, fieldName: ${field.name || 'N/A'})`);
                
                // Check if this is a display field (div with id but not an input)
                if (field.tagName === 'DIV' && field.id && field.classList.contains('form-control-plaintext')) {
                    // Display field - set text content
                    let displayText = value || '';
                    if (key === 'created_at' || field.id === 'alertCreatedAt') {
                        // Format date for display
                        if (displayText) {
                            try {
                                // Use dateUtils for consistent date parsing
                                let date;
                                if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                                  date = window.dateUtils.toDateObject(displayText);
                                } else {
                                  date = new Date(displayText);
                                }
                                if (!isNaN(date.getTime())) {
                                    // Use FieldRendererService or dateUtils for consistent date formatting
                                    if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                                      displayText = window.FieldRendererService.renderDate(date, true);
                                    } else if (window.formatDate) {
                                      displayText = window.formatDate(date, true);
                                    } else if (window.dateUtils?.formatDate) {
                                      displayText = window.dateUtils.formatDate(date, { includeTime: true });
                                    } else {
                                      displayText = date.toLocaleString('he-IL', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      });
                                    }
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
                    const selectValue = value !== null && value !== undefined ? String(value) : '';
                    // Check if this is a dynamic select (Account, Currency, Ticker, TradePlan)
                    // Note: cashFlowAccount includes 'Account', so it will be detected
                    const isTagSelect = field.classList?.contains?.('tag-multi-select') || field.dataset?.tagEntity;
                    const isDynamicSelect = !isTagSelect && (
                        field.id.includes('Ticker') || field.id.includes('Account') || 
                        field.id.includes('Currency') || field.id.includes('TradePlan') ||
                        field.id === 'cashFlowAccount' || field.id === 'cashFlowCurrency' ||
                        field.id === 'executionAccount' || field.id === 'executionTicker' ||
                        field.id === 'tradeAccount' || field.id === 'tradeTicker' ||
                        field.id === 'tradePlanAccount' || field.id === 'tradePlanTicker'
                    );
                    
                    console.log(`🎯 Setting SELECT field ${field.id}:`, {
                        tryingToSet: selectValue,
                        originalValue: value,
                        currentValue: field.value,
                        isDynamicSelect: isDynamicSelect,
                        optionsCount: field.options.length,
                        availableOptions: Array.from(field.options).map(opt => ({value: opt.value, text: opt.text})),                                           
                        hasOption: Array.from(field.options).some(opt => opt.value === selectValue || opt.value === value)                                                                   
                    });
                    
                    // Wait a bit if select has no options yet (might still be loading dynamically)
                    // For dynamic selects, wait until we have more than just the empty option
                    if (isDynamicSelect && field.options.length <= 1) {
                        console.log(`⏳ Select ${field.id} has no options yet (dynamic select), attempting to populate...`);
                        console.log(`   Key: ${key}, Value: ${value}, SelectValue: ${selectValue}`);
                        
                        // Try to populate the select if it's a dynamic select that hasn't been populated yet
                        if (window.SelectPopulatorService) {
                            try {
                                // Check field config to determine what to populate
                                const modalInfoForConfig = this.modals.get(modalElement.id);
                                const config = modalInfoForConfig?.config;
                                const allFields = [];
                                if (config?.fields && Array.isArray(config.fields)) {
                                    allFields.push(...config.fields);
                                }
                                if (config?.tabs && Array.isArray(config.tabs)) {
                                    config.tabs.forEach(tab => {
                                        if (tab.fields && Array.isArray(tab.fields)) {
                                            allFields.push(...tab.fields);
                                        }
                                    });
                                }
                                
                                const fieldConfig = allFields.find(f => f.id === field.id);
                                console.log(`   Field config found:`, !!fieldConfig, `Field ID: ${field.id}`);
                                
                                // Populate based on field type - explicitly check for cashFlowAccount
                                // IMPORTANT: Pass the value as defaultValue so it's set correctly during population
                                // Convert empty string to null for defaultValue (empty string means "no selection")
                                // Ensure proper type conversion for numeric IDs
                                let defaultValueForSelect = null;
                                if (selectValue !== '' && selectValue !== null && selectValue !== undefined) {
                                    // Try to parse as integer for ID fields (accounts, trades, etc.)
                                    const parsed = parseInt(selectValue);
                                    defaultValueForSelect = (!isNaN(parsed) && parsed.toString() === String(selectValue).trim()) 
                                        ? parsed 
                                        : selectValue;
                                }
                                
                                const isTagMultiSelect = field.classList?.contains?.('tag-multi-select');

                                if (!isTagMultiSelect && (field.id === 'cashFlowAccount' || field.id.includes('Account') || field.id.includes('account'))) {
                                    console.log(`   Populating accounts select ${field.id} with defaultValue: ${defaultValueForSelect} (from selectValue: ${selectValue})...`);
                                    await window.SelectPopulatorService.populateAccountsSelect(field, {
                                        includeEmpty: true,
                                        emptyText: 'בחר חשבון מסחר...',
                                        defaultFromPreferences: false, // Don't use default in edit mode
                                        defaultValue: defaultValueForSelect // Pass the value we want to set
                                    });
                                    console.log(`✅ Populated accounts select ${field.id} (${field.options.length} options), value set to: ${field.value}`);
                                } else if (field.id === 'cashFlowCurrency' || field.id.includes('Currency') || field.id.includes('currency')) {
                                    console.log(`   Populating currencies select ${field.id} with defaultValue: ${defaultValueForSelect} (from selectValue: ${selectValue})...`);
                                    await window.SelectPopulatorService.populateCurrenciesSelect(field, {
                                        includeEmpty: true,
                                        emptyText: 'בחר מטבע...',
                                        defaultFromPreferences: false, // Don't use default in edit mode
                                        defaultValue: defaultValueForSelect // Pass the value we want to set
                                    });
                                    console.log(`✅ Populated currencies select ${field.id} (${field.options.length} options), value set to: ${field.value}`);
                                } else if (field.id.includes('Ticker') || field.id.includes('ticker')) {
                                    console.log(`   Populating tickers select ${field.id} with defaultValue: ${defaultValueForSelect} (from selectValue: ${selectValue})...`);
                                    console.log(`   🔍 [populateForm] Ticker field details:`, {
                                        fieldId: field.id,
                                        key: key,
                                        value: value,
                                        selectValue: selectValue,
                                        defaultValueForSelect: defaultValueForSelect,
                                        currentOptionsCount: field.options.length
                                    });
                                    
                                    // Always populate tickers select with defaultValue to ensure value is set
                                    // This is the working solution - not elegant but works
                                    await window.SelectPopulatorService.populateTickersSelect(field, {
                                        includeEmpty: true,
                                        defaultValue: defaultValueForSelect // Pass the value we want to set
                                    });
                                    console.log(`✅ Populated tickers select ${field.id} (${field.options.length} options), value set to: ${field.value}`, {
                                        expectedValue: defaultValueForSelect,
                                        actualValue: field.value,
                                        hasOption: Array.from(field.options).some(opt => opt.value === String(defaultValueForSelect))
                                    });
                                    
                                    // CRITICAL: Skip the general select value setting below for ticker fields
                                    // We already handled it above, and the general code might reset it
                                    field.dataset.tickerHandled = 'true';
                                }
                            } catch (populateError) {
                                console.error(`❌ Failed to populate select ${field.id}:`, populateError);
                            }
                        } else {
                            console.error(`❌ SelectPopulatorService not available for ${field.id}`);
                        }
                        
                        // Retry up to 10 times (1 second total) if select is still loading
                        for (let retry = 0; retry < 10 && field.options.length <= 1; retry++) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                            // Re-check options after wait
                            if (field.options.length > 1) {
                                console.log(`✅ Select ${field.id} options loaded after ${retry + 1} retries (${field.options.length} options)`);
                                break;
                            }
                        }
                        if (field.options.length <= 1) {
                            console.error(`❌ Select ${field.id} still has no options after retries - cannot set value ${selectValue}`);
                        }
                    }
                    
                    // CRITICAL: Skip general select value setting for ticker fields that were already handled
                    if (field.dataset.tickerHandled === 'true') {
                        console.log(`⏭️ Skipping general select value setting for ${field.id} - already handled by ticker-specific code`);
                        // Skip to next iteration in the for loop
                        continue;
                    }
                    
                    // Check if the value exists in options before trying to set it
                    let valueExists = Array.from(field.options).some(opt => 
                        opt.value === selectValue || 
                        String(opt.value) === String(value) ||
                        opt.value === String(value)
                    );
                    
                    if (!valueExists && selectValue && isDynamicSelect) {
                        console.warn(`⚠️ Value ${selectValue} not found in options for ${field.id}, waiting a bit more...`);
                        // Wait a bit more for dynamic selects that might still be loading
                        for (let retry = 0; retry < 5 && !valueExists; retry++) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                            valueExists = Array.from(field.options).some(opt => 
                                opt.value === selectValue || 
                                String(opt.value) === String(value) ||
                                opt.value === String(value)
                            );
                            if (valueExists) {
                                console.log(`✅ Value ${selectValue} found after additional wait (retry ${retry + 1})`);
                                break;
                            }
                        }
                    }
                    
                    // Check if value was already set correctly by populateAccountsSelect/populateCurrenciesSelect/populateTickersSelect
                    const valueAlreadySet = (isDynamicSelect && field.value === selectValue && selectValue);
                    
                    // Try to set the value (skip if already set correctly by populate function)
                    if (!valueAlreadySet) {
                        field.value = selectValue;
                    } else {
                        console.log(`✅ Value ${selectValue} already set correctly by populate function for ${field.id}`);
                    }
                    
                    // If value didn't set (option doesn't exist), try to find matching option or add it dynamically
                    if (field.value !== selectValue && selectValue) {
                        console.log(`⚠️ Value ${selectValue} didn't set directly, searching for matching option...`);
                        const matchingOption = Array.from(field.options).find(opt => 
                            opt.value === selectValue || 
                            String(opt.value) === String(value) ||
                            opt.value === String(value) ||
                            opt.text === value ||
                            opt.text === selectValue
                        );
                        if (matchingOption) {
                            field.value = matchingOption.value;
                            console.log(`✅ Found matching option: ${matchingOption.value} (${matchingOption.text})`);
                        } else {
                            // If no matching option found and this is a select with static options,
                            // add the value dynamically to allow editing existing records with new source values
                            if (!isDynamicSelect) {
                                console.warn(`⚠️ No matching option found for value: ${selectValue} in field ${field.id}`);
                                console.warn(`   Available options:`, Array.from(field.options).map(opt => ({value: opt.value, text: opt.text})));
                                
                                // Add the missing option dynamically (for backward compatibility with new source values)
                                const newOption = document.createElement('option');
                                newOption.value = selectValue;
                                // Try to create a readable label from the value (e.g., 'ibkr_import' -> 'ייבוא IBKR')
                                const labelMap = {
                                    'ibkr_import': 'ייבוא IBKR',
                                    'IBKR-tradelog-csv': 'IBKR CSV',
                                    'IBKR-api': 'IBKR API'
                                };
                                newOption.textContent = labelMap[selectValue] || selectValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                field.appendChild(newOption);
                                field.value = selectValue;
                                console.log(`✅ Added missing option dynamically: ${selectValue} (${newOption.textContent})`);
                            } else {
                                console.error(`❌ Value ${selectValue} not found in dynamic select ${field.id} after waiting`);
                                console.error(`   Available options:`, Array.from(field.options).map(opt => ({value: opt.value, text: opt.text})));
                            }
                        }
                    } else if (field.value === selectValue) {
                        console.log(`✅ Successfully set ${field.id} to ${selectValue}`);
                    }
                    
                    // Detailed logging after setting value
                    const selectedOption = field.options[field.selectedIndex];
                    const selectedText = selectedOption ? selectedOption.text : 'N/A';
                    console.log(`🎯 After setting, field.value is: ${field.value}`);
                    console.log(`📊 Field state for ${field.id}:`, {
                        value: field.value,
                        selectedIndex: field.selectedIndex,
                        selectedText: selectedText,
                        optionsCount: field.options.length,
                        allOptions: Array.from(field.options).map((opt, idx) => ({
                            index: idx,
                            value: opt.value,
                            text: opt.text,
                            selected: opt.selected
                        }))
                    });
                    
                    // Verify the value is actually set correctly
                    if (field.value !== selectValue && selectValue) {
                        console.error(`❌ MISMATCH: field.value (${field.value}) !== selectValue (${selectValue}) for ${field.id}`);
                    } else if (selectValue && field.value === selectValue) {
                        console.log(`✅ VERIFIED: field.value matches selectValue (${selectValue}) for ${field.id}`);
                    }                                                                            
                } else if ((field.classList && field.classList.contains('rich-text-editor-container')) || 
                           (fieldConfigMap.has(field.id) && fieldConfigMap.get(field.id).type === 'rich-text')) {
                    // Rich text editor - use RichTextEditorService
                    // Check both by class and by field config to ensure we catch all rich-text fields
                    if (window.RichTextEditorService && typeof window.RichTextEditorService.getEditorInstance === 'function') {
                        const editor = window.RichTextEditorService.getEditorInstance(field.id);
                        if (editor) {
                            this._setRichTextContent(field.id, value || '', value ? {} : { clearAutoMessage: true });
                            console.log(`📝 Set rich-text field ${field.id} to: ${value || ''}`);
                        } else {
                            // Editor not initialized yet - store content for later
                            field.dataset.pendingContent = value || '';
                            console.log(`⏳ Rich-text editor ${field.id} not initialized yet, storing pending content`);
                        }
                    } else {
                        // RichTextEditorService not available - store content for later
                        field.dataset.pendingContent = value || '';
                        console.warn(`⚠️ RichTextEditorService not available for field ${field.id}, storing pending content`);
                    }
                } else if (field.type === 'date' && actualValue) {
                    // Date type - value should be in YYYY-MM-DD format
                    // CRITICAL: Server returns DateEnvelope objects, not strings!
                    // DateEnvelope structure: { utc, epochMs, local, timezone, display }
                    console.log(`🔍 [populateForm] Processing date field ${field.id}`, {
                        actualValue,
                        actualValueType: typeof actualValue,
                        originalValue: value,
                        isDateEnvelope: window.dateUtils ? window.dateUtils.isDateEnvelope(actualValue) : (actualValue && typeof actualValue === 'object' && 'epochMs' in actualValue && 'utc' in actualValue),
                        isDateObject: actualValue instanceof Date,
                        isString: typeof actualValue === 'string',
                        valueKeys: actualValue && typeof actualValue === 'object' ? Object.keys(actualValue) : null
                    });
                    
                    let dateObj = null;
                    
                    // Priority 1: Check if it's a DateEnvelope object (server returns this!)
                    if (actualValue && typeof actualValue === 'object' && ('epochMs' in actualValue || 'utc' in actualValue || 'local' in actualValue)) {
                        console.log(`🔍 [populateForm] Detected DateEnvelope for ${field.id}`, {
                            utc: actualValue.utc,
                            epochMs: actualValue.epochMs,
                            local: actualValue.local,
                            timezone: actualValue.timezone
                        });
                        
                        // Use dateUtils if available (preferred method)
                        if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                            dateObj = window.dateUtils.toDateObject(actualValue);
                            console.log(`✅ [populateForm] Converted DateEnvelope to Date object via dateUtils:`, dateObj ? dateObj.toISOString() : null);
                        } else {
                            // Fallback: parse from DateEnvelope fields
                            if (actualValue.epochMs && typeof actualValue.epochMs === 'number') {
                                dateObj = new Date(actualValue.epochMs);
                                console.log(`✅ [populateForm] Converted DateEnvelope.epochMs to Date object:`, dateObj.toISOString());
                            } else if (actualValue.utc && typeof actualValue.utc === 'string') {
                                dateObj = new Date(actualValue.utc);
                                console.log(`✅ [populateForm] Converted DateEnvelope.utc to Date object:`, dateObj.toISOString());
                            } else if (actualValue.local && typeof actualValue.local === 'string') {
                                dateObj = new Date(actualValue.local);
                                console.log(`✅ [populateForm] Converted DateEnvelope.local to Date object:`, dateObj.toISOString());
                            }
                        }
                    }
                    // Priority 2: Handle Date objects directly (server may return Date objects)
                    else if (actualValue instanceof Date) {
                        // Use dateUtils for consistent date handling
                        if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                          dateObj = window.dateUtils.toDateObject(actualValue);
                        } else {
                          dateObj = new Date(actualValue.getTime());
                        }
                        console.log(`✅ [populateForm] Using Date object directly:`, dateObj.toISOString());
                    }
                    // Priority 3: Use centralized date utils for strings and other formats
                    else if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                        dateObj = window.dateUtils.toDateObject(actualValue);
                        console.log(`✅ [populateForm] Converted via dateUtils.toDateObject:`, dateObj ? dateObj.toISOString() : null);
                    }
                    // Priority 4: Fallback if date-utils not loaded
                    else if (typeof actualValue === 'string') {
                        dateObj = new Date(actualValue);
                        console.log(`✅ [populateForm] Parsed string value:`, dateObj.toISOString());
                    }
                    else {
                        // Try to convert to string and parse
                        try {
                            dateObj = new Date(actualValue.toString());
                            console.log(`✅ [populateForm] Parsed via toString():`, dateObj.toISOString());
                        } catch (e) {
                            console.warn(`⚠️ Failed to parse date value for ${field.id}:`, actualValue, e);
                        }
                    }
                    
                    if (dateObj && !isNaN(dateObj.getTime())) {
                        // Format as YYYY-MM-DD for date input
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        field.value = `${year}-${month}-${day}`;
                        console.log(`✅ Set date field ${field.id} to: ${field.value}`, {
                            originalValue: value,
                            actualValue: actualValue,
                            dateObj: dateObj.toISOString(),
                            formatted: field.value
                        });
                    } else {
                        console.error(`❌ Invalid date value for ${field.id}:`, {
                            actualValue,
                            actualValueType: typeof actualValue,
                            originalValue: value,
                            dateObj,
                            isNaN: dateObj ? isNaN(dateObj.getTime()) : 'no dateObj',
                            valueKeys: actualValue && typeof actualValue === 'object' ? Object.keys(actualValue) : null
                        });
                    }
                } else if (field.type === 'datetime-local' && actualValue) {
                    // Convert date value to datetime-local format (YYYY-MM-DDTHH:MM)
                    // CRITICAL: Server returns DateEnvelope objects, not strings!
                    // DateEnvelope structure: { utc, epochMs, local, timezone, display }
                    console.log(`🔍 [populateForm] Processing datetime-local field ${field.id}`, {
                        actualValue,
                        actualValueType: typeof actualValue,
                        originalValue: value,
                        isDateEnvelope: window.dateUtils ? window.dateUtils.isDateEnvelope(actualValue) : (actualValue && typeof actualValue === 'object' && 'epochMs' in actualValue && 'utc' in actualValue),
                        isDateObject: actualValue instanceof Date,
                        isString: typeof actualValue === 'string',
                        valueKeys: actualValue && typeof actualValue === 'object' ? Object.keys(actualValue) : null
                    });
                    
                    let dateObj = null;
                    
                    // Priority 1: Check if it's a DateEnvelope object (server returns this!)
                    if (actualValue && typeof actualValue === 'object' && ('epochMs' in actualValue || 'utc' in actualValue || 'local' in actualValue)) {
                        console.log(`🔍 [populateForm] Detected DateEnvelope for ${field.id}`, {
                            utc: actualValue.utc,
                            epochMs: actualValue.epochMs,
                            local: actualValue.local,
                            timezone: actualValue.timezone
                        });
                        
                        // Use dateUtils if available (preferred method)
                        if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                            dateObj = window.dateUtils.toDateObject(actualValue);
                            console.log(`✅ [populateForm] Converted DateEnvelope to Date object via dateUtils:`, dateObj ? dateObj.toISOString() : null);
                        } else {
                            // Fallback: parse from DateEnvelope fields
                            if (actualValue.epochMs && typeof actualValue.epochMs === 'number') {
                                dateObj = new Date(actualValue.epochMs);
                                console.log(`✅ [populateForm] Converted DateEnvelope.epochMs to Date object:`, dateObj.toISOString());
                            } else if (actualValue.utc && typeof actualValue.utc === 'string') {
                                dateObj = new Date(actualValue.utc);
                                console.log(`✅ [populateForm] Converted DateEnvelope.utc to Date object:`, dateObj.toISOString());
                            } else if (actualValue.local && typeof actualValue.local === 'string') {
                                dateObj = new Date(actualValue.local);
                                console.log(`✅ [populateForm] Converted DateEnvelope.local to Date object:`, dateObj.toISOString());
                            }
                        }
                    }
                    // Priority 2: Handle Date objects directly (server may return Date objects)
                    else if (actualValue instanceof Date) {
                        // Use dateUtils for consistent date handling
                        if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                          dateObj = window.dateUtils.toDateObject(actualValue);
                        } else {
                          dateObj = new Date(actualValue.getTime());
                        }
                        console.log(`✅ [populateForm] Using Date object directly:`, dateObj.toISOString());
                    }
                    // Priority 3: Use centralized date utils for strings and other formats
                    else if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                        dateObj = window.dateUtils.toDateObject(actualValue);
                        console.log(`✅ [populateForm] Converted via dateUtils.toDateObject:`, dateObj ? dateObj.toISOString() : null);
                    }
                    // Priority 4: Fallback if date-utils not loaded
                    else if (typeof actualValue === 'string') {
                        dateObj = new Date(actualValue);
                        console.log(`✅ [populateForm] Parsed string value:`, dateObj.toISOString());
                    }
                    else {
                        // Try to convert to string and parse
                        try {
                            dateObj = new Date(actualValue.toString());
                            console.log(`✅ [populateForm] Parsed via toString():`, dateObj.toISOString());
                        } catch (e) {
                            console.warn(`⚠️ Failed to parse datetime value for ${field.id}:`, actualValue, e);
                        }
                    }
                    
                    if (dateObj && !isNaN(dateObj.getTime())) {
                        // Format as YYYY-MM-DDTHH:MM for datetime-local input
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        field.value = `${year}-${month}-${day}T${hours}:${minutes}`;
                        console.log(`✅ Set datetime-local field ${field.id} to: ${field.value}`, {
                            originalValue: value,
                            actualValue: actualValue,
                            dateObj: dateObj.toISOString(),
                            formatted: field.value
                        });
                    } else {
                        console.error(`❌ Invalid datetime value for ${field.id}:`, {
                            actualValue,
                            actualValueType: typeof actualValue,
                            originalValue: value,
                            dateObj,
                            isNaN: dateObj ? isNaN(dateObj.getTime()) : 'no dateObj',
                            valueKeys: actualValue && typeof actualValue === 'object' ? Object.keys(actualValue) : null
                        });
                    }
                } else if (field.type === 'file') {
                    // File inputs cannot have their value set programmatically for security reasons
                    // Only empty string is allowed. Instead, we can show the current filename in a label or text field
                    console.log(`📎 Skipping file input ${field.id} - cannot set value programmatically (security restriction)`);
                    console.log(`   Current attachment filename: ${value || 'none'}`);
                    
                    // Show current filename if editing and file exists
                    if (value && String(value).trim()) {
                        // Try to find or create a display element for the current filename
                        const fileDisplayId = `${field.id}_current`;
                        let fileDisplay = modalElement.querySelector(`#${fileDisplayId}`);
                        
                        if (!fileDisplay) {
                            // Create a small text element to show current filename
                            fileDisplay = document.createElement('div');
                            fileDisplay.id = fileDisplayId;
                            fileDisplay.className = 'text-muted small mt-1';
                            fileDisplay.style.fontSize = '0.875rem';
                            
                            // Insert after the file input's parent container or after the input itself
                            const fieldContainer = field.closest('.mb-3') || field.parentElement;
                            if (fieldContainer) {
                                fieldContainer.appendChild(fileDisplay);
                            } else {
                                field.parentNode.insertBefore(fileDisplay, field.nextSibling);
                            }
                        }
                        
                        fileDisplay.textContent = `קובץ נוכחי: ${value}`;
                        fileDisplay.style.display = 'block';
                        console.log(`📎 Displayed current filename: ${value}`);
                    } else {
                        // Hide display if no file
                        const fileDisplayId = `${field.id}_current`;
                        const fileDisplay = modalElement.querySelector(`#${fileDisplayId}`);
                        if (fileDisplay) {
                            fileDisplay.style.display = 'none';
                        }
                    }
                } else {
                    field.value = value || '';
                    console.log(`✏️ Set ${field.tagName}/${field.type || 'input'} field ${field.id} to: ${field.value}`);
                }

                if (field.dataset && value !== null && value !== undefined && value !== '' &&
                    (field.id === 'tradePlanStopLoss' || field.id === 'tradeStopLoss' ||
                     field.id === 'tradePlanTakeProfit' || field.id === 'tradeTakeProfit')) {
                    field.dataset.userModified = 'true';
                }
            } else {
                console.log(`❌ No field found for ${key} (value: ${value})`);
            }
        }
        
        // מילוי selects מיוחדים
        await this.populateSpecialSelects(form, data);
        
        // עדכון linkButton fields (trade/plan selectors)
        await this.updateLinkButtonFields(form, data);
        
        // Special handling for trade entity: populate planning fields ONLY from Trade entity itself
        // NO FALLBACKS - if data is missing, show clear notification to user
        if (config?.entityType === 'trade') {
            window.Logger?.info('🔍 [Trade Edit] Populating planning fields from Trade entity only', {
                planned_quantity: data.planned_quantity,
                planned_amount: data.planned_amount,
                entry_price: data.entry_price
            }, { page: 'modal-manager-v2' });
            
            // Get Trade's own planning fields ONLY (no fallbacks)
            // בדיקה מפורשת ל-null/undefined - לא להשתמש ב-|| כי 0 הוא ערך תקין
            const tradePlannedQuantity = (data.planned_quantity !== null && data.planned_quantity !== undefined)
                ? data.planned_quantity
                : ((data.quantity !== null && data.quantity !== undefined) ? data.quantity : null);
            const tradePlannedAmount = (data.planned_amount !== null && data.planned_amount !== undefined)
                ? data.planned_amount
                : null;
            const tradeEntryPrice = (data.entry_price !== null && data.entry_price !== undefined)
                ? data.entry_price
                : null;
            
            // Track missing fields for notification
            const missingFields = [];
            
            // Populate entry_price field - ONLY from Trade.entry_price
            const entryPriceField = form.querySelector('#tradeEntryPrice');
            if (entryPriceField) {
                if (!entryPriceField.value || entryPriceField.value === '') {
                    if (tradeEntryPrice && tradeEntryPrice !== 0) {
                        entryPriceField.value = tradeEntryPrice;
                        window.Logger?.info(`✅ Set tradeEntryPrice from Trade.entry_price: ${tradeEntryPrice}`, {}, { page: 'modal-manager-v2' });
                    } else {
                        missingFields.push('מחיר כניסה');
                    }
                }
            }
            
            // Populate quantity field - ONLY from Trade.planned_quantity
            const quantityField = form.querySelector('#tradeQuantity');
            if (quantityField) {
                if (!quantityField.value || quantityField.value === '') {
                    if (tradePlannedQuantity && tradePlannedQuantity !== 0) {
                        quantityField.value = tradePlannedQuantity;
                        window.Logger?.info(`✅ Set tradeQuantity from Trade.planned_quantity: ${tradePlannedQuantity}`, {}, { page: 'modal-manager-v2' });
                    } else {
                        missingFields.push('כמות');
                    }
                }
            }
            
            // Populate amount field - ONLY from Trade.planned_amount
            const amountField = form.querySelector('#tradeTotalInvestment');
            if (amountField) {
                if (!amountField.value || amountField.value === '') {
                    if (tradePlannedAmount && tradePlannedAmount !== 0) {
                        amountField.value = tradePlannedAmount;
                        window.Logger?.info(`✅ Set tradeTotalInvestment from Trade.planned_amount: ${tradePlannedAmount}`, {}, { page: 'modal-manager-v2' });
                    } else {
                        missingFields.push('סכום השקעה');
                    }
                }
            }
            
            // Show notification if any planning fields are missing
            if (missingFields.length > 0 && window.showInfoNotification) {
                const fieldsList = missingFields.join(', ');
                window.showInfoNotification(
                    'נתוני תכנון חסרים',
                    `הטרייד לא כולל את השדות הבאים: ${fieldsList}. אנא מלא אותם ידנית.`,
                    8000,
                    'system'
                );
                window.Logger?.warn('⚠️ Trade missing planning fields', { missingFields, tradeId: data.id }, { page: 'modal-manager-v2' });
            }
        }
        
        // הוספת event listeners לשדות מיוחדים
        this.attachSpecialEventListeners(form, data, config);

        if (modalElement && window.InvestmentCalculationService && typeof window.InvestmentCalculationService.resync === 'function') {
            window.InvestmentCalculationService.resync(modalElement, { force: true });
        }
    }

    /**
     * Update link button fields - עדכון שדות כפתורי קישור
     * 
     * @param {HTMLElement} form - אלמנט הטופס
     * @param {Object} data - נתוני הישות
     * @private
     */
    async updateLinkButtonFields(form, data) {
        // Check for linkedTrade field (generic field name)
        const linkedTradeField = form.querySelector('#linkedTrade');
        
        if (linkedTradeField && data.trade_id) {
            // Update display for linked trade
            await this.updateLinkButtonDisplay('linkedTrade', data.trade_id, 'trade');
        } else {
            // Fallback: check for generic trade_id field
            const tradeIdField = form.querySelector('#trade_id');
            if (tradeIdField && data.trade_id) {
                // Update display for generic trade_id field
                await this.updateLinkButtonDisplay('linkedTrade', data.trade_id, 'trade');
            }
        }
    }

    /**
     * Update link button display - עדכון תצוגת כפתור קישור
     * 
     * @param {string} fieldId - ID של השדה (generic: 'linkedTrade')
     * @param {number} itemId - ID של הפריט המקושר (trade ID)
     * @param {string} itemType - 'trade' (only trades supported now)
     * @private
     */
    async updateLinkButtonDisplay(fieldId, itemId, itemType) {
        try {
            // Only trades are supported now
            if (itemType !== 'trade') {
                console.warn(`Unsupported item type: ${itemType}. Only 'trade' is supported.`);
                return;
            }

            // Fetch trade data
            const response = await fetch(`/api/trades/${itemId}`);
            if (!response.ok) {
                console.warn(`Failed to fetch trade ${itemId}`);
                return;
            }
            
            const data = await response.json();
            const trade = data.data || data;
            
            // Update generic hidden field: trade_id
            const tradeField = document.getElementById('trade_id');
            if (tradeField) {
                tradeField.value = itemId;
            }
            
            // Update using tradeSelectorModal
            if (window.tradeSelectorModal) {
                // Set currentFieldId for proper display update
                window.tradeSelectorModal.currentFieldId = fieldId;
                window.tradeSelectorModal.updateParentModalDisplay(trade, 'trade');
            }
        } catch (error) {
            console.error(`Error updating link button for trade ${itemId}:`, error);
        }
    }
    
    /**
     * Handle updated ticker data for alerts modal
     * @param {Object|null} tickerData
     */
    handleAlertTickerDataUpdate(tickerData) {
        if (!this.alertsContext) {
            this.alertsContext = { ticker: null, linkedEntity: null };
        }
        this.alertsContext.ticker = tickerData || null;
        
        if (tickerData && window.AlertConditionRenderer && typeof window.AlertConditionRenderer.updatePriceUnit === 'function') {
            try {
                window.AlertConditionRenderer.updatePriceUnit(tickerData.id);
            } catch (error) {
                console.warn('⚠️ Failed to update alert price unit:', error);
            }
        }
        
        const alertsModal = document.getElementById('alertsModal');
        const form = alertsModal ? alertsModal.querySelector('form') : null;
        if (form) {
            this.updateAlertDefaultMessage(form);
        }
    }
    
    /**
     * Handle linked entity updates for alerts modal
     * @param {Object|null} linkedEntity
     */
    handleAlertLinkedEntityUpdate(linkedEntity) {
        if (!this.alertsContext) {
            this.alertsContext = { ticker: null, linkedEntity: null };
        }
        this.alertsContext.linkedEntity = linkedEntity || null;
        const alertsModal = document.getElementById('alertsModal');
        const form = alertsModal ? alertsModal.querySelector('form') : null;
        if (form) {
            this.updateAlertDefaultMessage(form);
        }
    }
    
    /**
     * Internal helper to update rich-text editor content with suppression
     * @param {string} editorId
     * @param {string} html
     * @param {Object} options
     */
    _setRichTextContent(editorId, html, options = {}) {
        if (!window.RichTextEditorService || typeof window.RichTextEditorService.setContent !== 'function') {
            return;
        }
        
        const container = document.getElementById(editorId);
        if (!container) {
            return;
        }
        
        if (!this._richTextUpdateGuards) {
            this._richTextUpdateGuards = new Set();
        }
        
        this._richTextUpdateGuards.add(editorId);
        try {
            window.RichTextEditorService.setContent(editorId, html);
        } finally {
            setTimeout(() => {
                this._richTextUpdateGuards.delete(editorId);
            }, 0);
        }
        
        if (options.autoMessageText) {
            container.dataset.autoMessage = 'true';
            container.dataset.autoMessageText = options.autoMessageText;
            delete container.dataset.userModified;
        } else if (options.clearAutoMessage) {
            delete container.dataset.autoMessage;
            delete container.dataset.autoMessageText;
        }
    }
    
    /**
     * Get plain text representation from rich-text editor
     * @param {string} editorId
     * @returns {string}
     */
    _getPlainTextFromEditor(editorId) {
        if (window.RichTextEditorService && typeof window.RichTextEditorService.getEditorInstance === 'function') {
            const editor = window.RichTextEditorService.getEditorInstance(editorId);
            if (editor && typeof editor.getText === 'function') {
                return editor.getText().trim();
            }
        }
        
        const container = document.getElementById(editorId);
        if (!container) {
            return '';
        }
        return (container.textContent || '').trim();
    }
    
    /**
     * Translate alert attribute key to message text
     * @param {string} attribute
     * @returns {string}
     * @private
     */
    _getAlertAttributeText(attribute) {
        const mapping = {
            price: 'מחיר',
            change: 'שינוי',
            volume: 'נפח',
            ma: 'ממוצע נע'
        };
        return mapping[attribute] || attribute || '';
    }
    
    /**
     * Translate alert operator key to message text
     * @param {string} operator
     * @returns {string}
     * @private
     */
    _getAlertOperatorText(operator) {
        const mapping = {
            more_than: 'עובר מעל',
            less_than: 'יורד מתחת ל',
            equals: 'שווה ל',
            change: 'משתנה ב',
            change_up: 'עולה ב',
            change_down: 'יורד ב',
            cross: 'חוצה את',
            cross_up: 'חוצה מעלה את',
            cross_down: 'חוצה מטה את'
        };
        if (mapping[operator]) {
            return mapping[operator];
        }
        if (window.AlertConditionRenderer && window.AlertConditionRenderer.operatorConfig?.[operator]?.label) {
            return window.AlertConditionRenderer.operatorConfig[operator].label;
        }
        return operator || '';
    }
    
    /**
     * Resolve unit for alert value display
     * @param {string} attribute
     * @param {string} operator
     * @param {Object|null} ticker
     * @returns {string}
     * @private
     */
    _resolveAlertUnit(attribute, operator, ticker) {
        let unit = '';
        if (window.AlertConditionRenderer && window.AlertConditionRenderer.attributeConfig?.[attribute]?.unit) {
            unit = window.AlertConditionRenderer.attributeConfig[attribute].unit || '';
        }
        
        const operatorTriggersPercent = ['change', 'change_up', 'change_down'];
        if (operatorTriggersPercent.includes(operator)) {
            return '%';
        }
        
        if ((attribute === 'price' || attribute === 'ma') && ticker?.currency_symbol) {
            return ticker.currency_symbol;
        }
        
        return unit || '';
    }
    
    /**
     * Format alert value for message
     * @param {string} attribute
     * @param {string} operator
     * @param {string|number} rawValue
     * @param {Object|null} ticker
     * @returns {string}
     * @private
     */
    _formatAlertValue(attribute, operator, rawValue, ticker) {
        if (rawValue === null || rawValue === undefined || rawValue === '') {
            return '';
        }
        
        const numericValue = Number(rawValue);
        if (!Number.isFinite(numericValue)) {
            return String(rawValue);
        }
        
        let minimumFractionDigits = 0;
        let maximumFractionDigits = 2;
        
        if (attribute === 'price' || attribute === 'ma') {
            minimumFractionDigits = numericValue % 1 === 0 ? 0 : 2;
            maximumFractionDigits = 2;
        } else if (attribute === 'change' || operator === 'change' || operator === 'change_up' || operator === 'change_down') {
            minimumFractionDigits = 0;
            maximumFractionDigits = 2;
        } else if (attribute === 'volume') {
            minimumFractionDigits = 0;
            maximumFractionDigits = 0;
        }
        
        const formatted = numericValue.toLocaleString('he-IL', {
            minimumFractionDigits,
            maximumFractionDigits
        });
        
        const unit = this._resolveAlertUnit(attribute, operator, ticker);
        return `${formatted}${unit}`;
    }
    
    /**
     * Translate trade side to Hebrew text
     * @param {string} side
     * @returns {string}
     * @private
     */
    _translateSide(side) {
        if (!side) {
            return '';
        }
        const lower = String(side).toLowerCase();
        if (lower === 'long') {
            return 'לונג';
        }
        if (lower === 'short') {
            return 'שורט';
        }
        return side;
    }
    
    /**
     * Format date into short display (DD.MM)
     * @param {string|Date} dateValue
     * @returns {string}
     * @private
     */
    _formatDateShort(dateValue) {
        if (!dateValue) {
            return '';
        }
        if (typeof window.formatShortDate === 'function') {
            return window.formatShortDate(dateValue);
        }
        return '';
    }
    
    /**
     * Build second line text for linked entity
     * @returns {string}
     * @private
     */
    _buildAlertSecondLine() {
        const linked = this.alertsContext?.linkedEntity;
        if (!linked || !linked.type) {
            return '';
        }
        
        const entityLabel = (window.LinkedItemsService && typeof window.LinkedItemsService.getEntityLabel === 'function')
            ? window.LinkedItemsService.getEntityLabel(linked.type) || ''
            : linked.type;
        
        if (linked.type === 'trade' && linked.data) {
            const sideText = this._translateSide(linked.data.side);
            const dateText = this._formatDateShort(linked.data.opened_at || linked.data.created_at || linked.data.date);
            const parts = [`ב${entityLabel}`];
            if (sideText) {
                parts.push(sideText);
            }
            if (dateText) {
                parts.push(dateText);
            }
            return parts.filter(Boolean).join(' ');
        }
        
        if (linked.type === 'trade_plan' && linked.data) {
            const sideText = this._translateSide(linked.data.side);
            const dateText = this._formatDateShort(linked.data.created_at || linked.data.date);
            const parts = [`ב${entityLabel}`];
            if (sideText) {
                parts.push(sideText);
            }
            if (linked.data.investment_type) {
                parts.push(linked.data.investment_type);
            }
            if (dateText) {
                parts.push(dateText);
            }
            return parts.filter(Boolean).join(' ');
        }
        
        if (linked.type === 'trading_account' && linked.data) {
            const name = linked.data.name || linked.data.account_name;
            if (name) {
                return `ב${entityLabel} ${name}`;
            }
        }
        
        if (linked.type === 'ticker' && linked.data) {
            const symbol = linked.data.symbol || linked.data.ticker_symbol;
            if (symbol) {
                return `בטיקר ${symbol}`;
            }
        }
        
        return '';
    }
    
    /**
     * Update default alert message (auto-generated)
     * @param {HTMLFormElement} form
     * @param {Object} options
     */
    updateAlertDefaultMessage(form, options = {}) {
        if (!form || form.dataset.modalMode !== 'add') {
            return;
        }
        
        const messageContainer = form.querySelector('#alertName');
        if (!messageContainer) {
            return;
        }
        
        if (!window.RichTextEditorService || typeof window.RichTextEditorService.getEditorInstance !== 'function') {
            // Try later if editor not ready
            setTimeout(() => this.updateAlertDefaultMessage(form, options), 150);
            return;
        }
        
        if (!options.force) {
            if (messageContainer.dataset.userModified === 'true') {
                return;
            }
        }
        
        const editorPlainText = this._getPlainTextFromEditor('alertName');
        if (!options.force && editorPlainText && !messageContainer.dataset.autoMessage) {
            return;
        }
        
        const ticker = this.alertsContext?.ticker;
        const symbol = (ticker?.symbol || form.querySelector('#alertTicker')?.textContent || '').trim();
        if (!symbol) {
            // Without ticker we cannot build meaningful message
            return;
        }
        
        const attributeField = form.querySelector('#alertType');
        const operatorField = form.querySelector('#alertCondition');
        const valueField = form.querySelector('#alertValue');
        
        const attribute = attributeField?.value || 'price';
        const operator = operatorField?.value || 'more_than';
        const rawValue = valueField?.value;
        
        const attributeText = this._getAlertAttributeText(attribute);
        const operatorText = this._getAlertOperatorText(operator);
        const formattedValue = this._formatAlertValue(attribute, operator, rawValue, ticker);
        if (!formattedValue) {
            return;
        }
        
        const firstLineParts = [
            'טיקר',
            symbol.toUpperCase(),
            attributeText,
            operatorText,
            formattedValue
        ].filter(Boolean);
        
        if (firstLineParts.length < 4) {
            return;
        }
        
        const firstLine = firstLineParts.join(' ');
        const secondLine = this._buildAlertSecondLine();
        
        const messageHtml = secondLine
            ? `<p>${firstLine}</p><p>${secondLine}</p>`
            : `<p>${firstLine}</p>`;
        
        const autoMessageText = secondLine ? `${firstLine}\n${secondLine}` : firstLine;
        this._setRichTextContent('alertName', messageHtml, { autoMessageText });
    }
    
    /**
     * Attach special event listeners for form fields
     * @private
     * @param {HTMLElement} form - The form element
     * @param {Object} data - The entity data (optional, for edit mode)
     * @param {Object} config - The modal configuration (optional)
     */
    attachSpecialEventListeners(form, data = null, config = null) {
        // Event listener ל-alertStatusCombined - פיצול ל-status ו-is_triggered
        const alertStatusCombinedField = form.querySelector('#alertStatusCombined');
        if (alertStatusCombinedField) {
            // יצירת hidden fields אם לא קיימים
            let statusHidden = form.querySelector('#alertStatus_hidden');
            let isTriggeredHidden = form.querySelector('#alertIsTriggered_hidden');
            
            if (!statusHidden) {
                statusHidden = document.createElement('input');
                statusHidden.type = 'hidden';
                statusHidden.id = 'alertStatus_hidden';
                statusHidden.name = 'status';
                form.appendChild(statusHidden);
            }
            
            if (!isTriggeredHidden) {
                isTriggeredHidden = document.createElement('input');
                isTriggeredHidden.type = 'hidden';
                isTriggeredHidden.id = 'alertIsTriggered_hidden';
                isTriggeredHidden.name = 'is_triggered';
                form.appendChild(isTriggeredHidden);
            }
            
                        // פונקציה לעדכון hidden fields
            const updateHiddenFields = () => {
                const combinedValue = alertStatusCombinedField.value;
                if (combinedValue) {
                    const parsed = this.parseCombinedAlertState(combinedValue);
                    if (parsed) {
                        statusHidden.value = parsed.status;
                        isTriggeredHidden.value = parsed.is_triggered;
                        console.log(`✅ Updated hidden fields: status=${parsed.status}, is_triggered=${parsed.is_triggered}`);                                                 
                    } else {
                        console.warn(`⚠️ Could not parse combined state: ${combinedValue}`);
                    }
                }
            };
            
                        // עדכון ראשוני
            updateHiddenFields();
            
            // עדכון כשמשנים את הערך
            alertStatusCombinedField.addEventListener('change', updateHiddenFields);                                                                            
        }
        
        // Add hidden input for entity ID if editing (needed for PUT requests)
        if (data && data.id) {
            let idInput = form.querySelector('input[name="id"]');
            if (!idInput) {
                idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.name = 'id';
                idInput.id = `${config?.entityType || 'entity'}Id`;
                form.appendChild(idInput);
            }
            idInput.value = data.id;
            console.log(`✅ Added hidden ID field: ${data.id}`);
        }
        
        // Note: Ticker external data button initialization moved to showModal() 
        // after modal is shown to ensure elements exist in DOM
        // Note: Notes related type/object handlers moved to showModal() 
        // after modal is shown to ensure elements exist in DOM
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
                'trade_id': 'trade_id'
            },
            'ticker': {
                'symbol': 'tickerSymbol',
                'name': 'tickerName',
                'type': 'tickerType',
                'currency_id': 'tickerCurrency',
                'status': 'tickerStatus',
                'remarks': 'tickerRemarks',
                'sector': 'tickerSector',
                'industry': 'tickerIndustry'
            },
            'trade': {
                'trading_account_id': 'tradeAccount',
                'ticker_id': 'tradeTicker',
                'side': 'tradeSide',
                'status': 'tradeStatus',
                'notes': 'tradeNotes',
                'investment_type': 'tradeType',
                'entry_price': 'tradeEntryPrice',
                'quantity': 'tradeQuantity',
                'created_at': 'tradeEntryDate',
                'opened_at': 'tradeEntryDate',
                'stop_price': 'tradeStopLoss',
                'target_price': 'tradeTakeProfit'
            },
            'trade_plan': {
                'trading_account_id': 'tradePlanAccount',
                'ticker_id': 'tradePlanTicker', // Fixed: was 'planTicker', should be 'tradePlanTicker'
                'side': 'tradePlanSide',
                'investment_type': 'tradePlanType', // Map investment_type to tradePlanType field
                'status': 'tradePlanStatus',
                'planned_amount': 'planAmount',
                'entry_price': 'tradePlanEntryPrice', // Map entry_price to tradePlanEntryPrice field
                'created_at': 'tradePlanEntryDate', // Map created_at to tradePlanEntryDate field
                'entry_date': 'tradePlanEntryDate', // Alias for created_at (if exists in API response)
                'stop_price': 'tradePlanStopLoss', // Map stop_price to tradePlanStopLoss field
                'target_price': 'tradePlanTakeProfit', // Map target_price to tradePlanTakeProfit field
                'notes': 'tradePlanNotes' // Map notes to tradePlanNotes field
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
                                // status and is_triggered are handled via alertStatusCombined -> hidden fields                                                                 
                'created_at': 'alertCreatedAt',
                'expiry_date': 'alertExpiryDate',
                'trade_condition_id': 'alertTradeCondition',
                'plan_condition_id': 'alertPlanCondition'
            },
            'execution': {
                'trade_id': 'trade_id',
                'ticker_id': 'executionTicker',
                'trading_account_id': 'executionAccount',
                'action': 'executionType',
                'type': 'executionType', // Alias for action
                // 'side' removed - not in config and not in database model
                'quantity': 'executionQuantity',
                'price': 'executionPrice',
                'date': 'executionDate',
                'fee': 'executionCommission',
                'source': 'executionSource',
                'external_id': 'executionExternalId',
                'notes': 'executionNotes',
                'realized_pl': 'executionRealizedPL',
                'mtm_pl': 'executionMTMPL'
            },
            'trading_account': {
                'name': 'accountName',
                'type': 'accountType',
                'currency_id': 'accountCurrency',
                'opening_balance': 'accountOpeningBalance',
                'status': 'accountStatus',
                'notes': 'accountNotes'
            },
            'note': {
                'content': 'noteContent',
                'related_type_id': 'noteRelatedType',
                'related_id': 'noteRelatedObject',
                'attachment': 'noteAttachment' // Map attachment to noteAttachment field
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
        
        // Collect all fields from config (including tabs)
        const allFields = [];
        if (config) {
            if (config.fields) {
                allFields.push(...config.fields);
            }
            if (config.tabs) {
                for (const tab of config.tabs) {
                    if (tab.fields) {
                        allFields.push(...tab.fields);
                    }
                }
            }
        }
        
        // Apply defaults from config
        if (allFields.length > 0) {
            for (const field of allFields) {
                // Search for field in entire modal (including tabs)
                let fieldElement = form.querySelector(`#${field.id}`);
                if (!fieldElement && modalElement) {
                    // Also search in tab panes
                    fieldElement = modalElement.querySelector(`#${field.id}`);
                }
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
                            // Use DefaultValueSetter if available
                            if (window.DefaultValueSetter && typeof window.DefaultValueSetter.setCurrentDateTime === 'function') {
                                window.DefaultValueSetter.setCurrentDateTime(fieldElement.id);
                            } else {
                                // Fallback if DefaultValueSetter is not available
                                const today = new Date();
                                today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
                                fieldElement.value = today.toISOString().slice(0, 16);
                            }
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
                    // Use DefaultValueSetter if available
                    if (window.DefaultValueSetter && typeof window.DefaultValueSetter.setCurrentDate === 'function') {
                        window.DefaultValueSetter.setCurrentDate(fieldElement.id);
                    } else {
                        // Fallback if DefaultValueSetter is not available
                        const today = new Date();
                        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
                        fieldElement.value = today.toISOString().slice(0, 10);
                    }
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
     * Apply default values for alerts modal (creation/expiry dates)
     * @param {HTMLFormElement} form
     * @private
     */
    _applyAlertsInitialDefaults(form) {
        if (!form) return;

        const createdDisplay = form.querySelector('#alertCreatedAt');
        const expiryInput = form.querySelector('#alertExpiryDate');

        const now = new Date();

        if (createdDisplay && (!createdDisplay.textContent || !createdDisplay.textContent.trim())) {
            const formatted = this._formatDateForAlertsDisplay(now);
            if (formatted) {
                createdDisplay.textContent = formatted;
                createdDisplay.dataset.defaultTimestamp = now.toISOString();
            }
        }

        if (expiryInput && !expiryInput.value) {
            const expiryDate = new Date(now);
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            // Use DefaultValueSetter if available
            if (window.DefaultValueSetter && typeof window.DefaultValueSetter.setCurrentDate === 'function') {
                window.DefaultValueSetter.setCurrentDate(expiryInput.id);
            } else {
                // Fallback if DefaultValueSetter is not available
                expiryInput.value = expiryDate.toISOString().slice(0, 10);
            }
        }
    }

    /**
     * Format date for alerts display fields using existing global utilities
     * @param {Date|string} dateInput
     * @returns {string}
     * @private
     */
    _formatDateForAlertsDisplay(dateInput) {
        if (!dateInput) return '';
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        const isoString = date.toISOString();
        if (typeof window.formatDateOnly === 'function') {
            return window.formatDateOnly(isoString);
        }
        if (typeof window.formatDate === 'function') {
            return window.formatDate(isoString);
        }
        return window.formatDate ? window.formatDate(date) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(date) : date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }));
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
    /**
     * Initialize tabs - אתחול טאבים במודל
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @param {Object} config - קונפיגורציה של המודל
     * @private
     */
    initializeTabs(modalElement, config) {
        if (!config.tabs || !Array.isArray(config.tabs) || config.tabs.length === 0) {
            return;
        }
        
        const tabsContainer = modalElement.querySelector(`#${config.id}Tabs`);
        if (!tabsContainer) {
            console.warn(`⚠️ Tabs container not found for modal ${config.id}`);
            return;
        }
        
        // Find active tab
        const activeTab = config.tabs.find(tab => tab.active) || config.tabs[0];
        const activeTabId = activeTab.id;
        
        // Update save button onclick based on active tab
        const saveBtn = modalElement.querySelector(`#${config.id}SaveBtn`);
        if (saveBtn) {
            if (activeTabId === 'exchange' && config.onSaveExchange) {
                saveBtn.setAttribute('data-onclick', `${config.onSaveExchange}()`);
            } else if (config.onSave) {
                saveBtn.setAttribute('data-onclick', `${config.onSave}()`);
            }
        }
        
        // Add event listeners to tab buttons
        const tabButtons = tabsContainer.querySelectorAll('button[data-tab-id]');
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (e) => {
                const tabId = e.target.getAttribute('data-tab-id');
                
                // Update save button onclick based on selected tab
                if (saveBtn) {
                    if (tabId === 'exchange' && config.onSaveExchange) {
                        saveBtn.setAttribute('data-onclick', `${config.onSaveExchange}()`);
                    } else if (config.onSave) {
                        saveBtn.setAttribute('data-onclick', `${config.onSave}()`);
                    }
                }
                
                // Initialize currency exchange calculations if exchange tab is active
                if (tabId === 'exchange') {
                    this.initializeCurrencyExchangeCalculations(modalElement);
                }
            });
        });
        
        // Initialize currency exchange calculations if exchange tab is active by default
        if (activeTabId === 'exchange') {
            this.initializeCurrencyExchangeCalculations(modalElement);
        }
    }
    
    /**
     * Initialize cash flow tabs with currency exchange detection - אתחול טאבים של תזרימי מזומנים עם זיהוי המרת מטבע
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @param {Object} config - קונפיגורציה של המודל
     * @param {string} mode - מצב המודל (add, edit)
     * @param {Object} entityData - נתוני הישות (לעריכה)
     * @param {Object} options - אפשרויות נוספות (isCurrencyExchange, exchangeId)
     * @private
     */
    initializeCashFlowTabs(modalElement, config, mode, entityData, options = {}) {
        if (!config.tabs || !Array.isArray(config.tabs) || config.tabs.length === 0) {
            return;
        }
        
        const tabsContainer = modalElement.querySelector(`#${config.id}Tabs`);
        if (!tabsContainer) {
            console.warn(`⚠️ Tabs container not found for modal ${config.id}`);
            return;
        }
        
        // Determine if this is a currency exchange
        let isCurrencyExchange = false;
        
        if (options.isCurrencyExchange) {
            // Explicitly marked as currency exchange
            isCurrencyExchange = true;
        } else if (mode === 'edit' && entityData) {
            // Check entityData for currency exchange indicators
            if (window.isCurrencyExchange && typeof window.isCurrencyExchange === 'function') {
                isCurrencyExchange = window.isCurrencyExchange(entityData);
            } else {
                // Fallback check
                const type = entityData.type || '';
                const externalId = entityData.external_id || '';
                isCurrencyExchange = (
                    type === 'currency_exchange_from' || 
                    type === 'currency_exchange_to' ||
                    (typeof externalId === 'string' && externalId.startsWith('exchange_')) ||
                    entityData.linked_exchange_cash_flow_id ||
                    entityData.exchange_pair_summary
                );
            }
        }
        
        // Find tab buttons and panes
        const tabButtons = tabsContainer.querySelectorAll('button[data-tab-id]');
        const tabPanes = modalElement.querySelectorAll('.tab-pane');
        
        // Show/hide tabs based on currency exchange status
        tabButtons.forEach(button => {
            const tabId = button.getAttribute('data-tab-id');
            const tabPane = modalElement.querySelector(`#${config.id}Tab${tabId}`);
            
            if (tabId === 'regular') {
                // Regular tab - show only for non-exchange flows
                if (isCurrencyExchange) {
                    button.style.display = 'none';
                    if (tabPane) {
                        tabPane.style.display = 'none';
                    }
                } else {
                    button.style.display = '';
                    if (tabPane) {
                        tabPane.style.display = '';
                    }
                }
            } else if (tabId === 'exchange') {
                // Exchange tab - show only for exchange flows
                if (isCurrencyExchange) {
                    button.style.display = '';
                    if (tabPane) {
                        tabPane.style.display = '';
                    }
                    // Activate exchange tab
                    button.classList.add('active');
                    if (tabPane) {
                        tabPane.classList.add('show', 'active');
                    }
                    // Deactivate regular tab
                    const regularButton = tabsContainer.querySelector('button[data-tab-id="regular"]');
                    const regularPane = modalElement.querySelector(`#${config.id}Tabregular`);
                    if (regularButton) {
                        regularButton.classList.remove('active');
                    }
                    if (regularPane) {
                        regularPane.classList.remove('show', 'active');
                    }
                } else {
                    button.style.display = 'none';
                    if (tabPane) {
                        tabPane.style.display = 'none';
                    }
                }
            }
        });
        
        // Update save button onclick based on active tab
        const saveBtn = modalElement.querySelector(`#${config.id}SaveBtn`);
        if (saveBtn) {
            if (isCurrencyExchange && config.onSaveExchange) {
                saveBtn.setAttribute('data-onclick', `${config.onSaveExchange}()`);
            } else if (config.onSave) {
                saveBtn.setAttribute('data-onclick', `${config.onSave}()`);
            }
        }
        
        // Add event listeners to tab buttons
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (e) => {
                const tabId = e.target.getAttribute('data-tab-id');
                
                // Update save button onclick based on selected tab
                if (saveBtn) {
                    if (tabId === 'exchange' && config.onSaveExchange) {
                        saveBtn.setAttribute('data-onclick', `${config.onSaveExchange}()`);
                    } else if (config.onSave) {
                        saveBtn.setAttribute('data-onclick', `${config.onSave}()`);
                    }
                }
                
                // Initialize currency exchange calculations if exchange tab is active
                if (tabId === 'exchange') {
                    this.initializeCurrencyExchangeCalculations(modalElement);
                }
            });
        });
        
        // Initialize currency exchange calculations if exchange tab is active
        if (isCurrencyExchange) {
            this.initializeCurrencyExchangeCalculations(modalElement);
        }
    }
    
    /**
     * Initialize currency exchange calculations - אתחול חישובי המרת מטבע
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @private
     */
    initializeCurrencyExchangeCalculations(modalElement) {
        console.log('🔵 initializeCurrencyExchangeCalculations CALLED');
        
        // Find exchange tab pane - fields are inside it
        const exchangeTabPane = modalElement.querySelector('#cashFlowModalTabexchange');
        const searchScope = exchangeTabPane || modalElement;
        
        console.log('🔵 searchScope:', searchScope ? 'exchangeTabPane found' : 'using modalElement');
        
        const fromAmountField = searchScope.querySelector('#currencyExchangeFromAmount');
        const exchangeRateField = searchScope.querySelector('#currencyExchangeRate');
        const toAmountField = searchScope.querySelector('#currencyExchangeToAmount');
        const fromCurrencyField = searchScope.querySelector('#currencyExchangeFromCurrency');
        const toCurrencyField = searchScope.querySelector('#currencyExchangeToCurrency');
        const feeAmountField = searchScope.querySelector('#currencyExchangeFeeAmount');
        const feeCurrencyLabel = searchScope.querySelector('#currencyExchangeFeeAmountCurrencyLabel');
        const accountField = searchScope.querySelector('#cashFlowAccount');
        const descriptionField = searchScope.querySelector('#cashFlowDescription');
        const netAmountField = searchScope.querySelector('#currencyExchangeNetAmount');
        if (typeof window.setCurrencyExchangeSummary === 'function') {
            window.setCurrencyExchangeSummary(null);
        } else if (netAmountField) {
            netAmountField.textContent = '';
            const div = document.createElement('div');
            div.className = 'text-muted small';
            div.textContent = 'הצמד יוצג לאחר שמירה.';
            netAmountField.appendChild(div);
        }
        
        console.log('🔵 Fields found:', {
            fromAmountField: !!fromAmountField,
            exchangeRateField: !!exchangeRateField,
            toAmountField: !!toAmountField,
            fromCurrencyField: !!fromCurrencyField,
            toCurrencyField: !!toCurrencyField,
            feeAmountField: !!feeAmountField,
            feeCurrencyLabel: !!feeCurrencyLabel,
            accountField: !!accountField,
            descriptionField: !!descriptionField,
            netAmountField: !!netAmountField
        });
        
        if (!fromAmountField || !exchangeRateField || !toAmountField) {
            console.warn('⚠️ Required fields not found, returning early');
            return;
        }
        
        // Helper function to get currency symbol from select field
        const getCurrencySymbol = (currencyField) => {
            if (!currencyField || !currencyField.value) return '';
            const selectedOption = currencyField.options[currencyField.selectedIndex];
            if (!selectedOption) return '';
            // The text content is the symbol (code) itself
            const symbol = selectedOption.textContent.trim() || '';
            return symbol;
        };
        
        // Helper function to get account's primary currency
        const getAccountCurrency = async (accountId) => {
            if (!accountId) return null;
            try {
                const response = await fetch(`/api/trading-accounts/${accountId}`);
                if (!response.ok) return null;
                const data = await response.json();
                if (data.status === 'success' && data.data) {
                    return {
                        id: data.data.currency_id,
                        symbol: data.data.currency_symbol || ''
                    };
                }
            } catch (error) {
                console.warn('Error fetching account currency:', error);
            }
            return null;
        };
        
        // Update fee currency label based on selected account
        const updateFeeCurrencyLabel = async () => {
            console.log('🔵 updateFeeCurrencyLabel CALLED');
            
            // Re-find elements in case they weren't found before (e.g., tab wasn't active)
            // Search in exchange tab pane first, then in entire modal
            let currentFeeCurrencyLabel = null;
            if (exchangeTabPane) {
                currentFeeCurrencyLabel = exchangeTabPane.querySelector('#currencyExchangeFeeAmountCurrencyLabel');
            }
            if (!currentFeeCurrencyLabel) {
                // Try searching in all tab panes
                const allTabPanes = modalElement.querySelectorAll('.tab-pane');
                for (const tabPane of allTabPanes) {
                    currentFeeCurrencyLabel = tabPane.querySelector('#currencyExchangeFeeAmountCurrencyLabel');
                    if (currentFeeCurrencyLabel) break;
                }
            }
            if (!currentFeeCurrencyLabel) {
                // Last resort: search in entire modal
                currentFeeCurrencyLabel = modalElement.querySelector('#currencyExchangeFeeAmountCurrencyLabel');
            }
            
            const currentAccountField = modalElement.querySelector('#cashFlowAccount');
            
            console.log('🔵 currentFeeCurrencyLabel:', currentFeeCurrencyLabel);
            console.log('🔵 currentAccountField:', currentAccountField);
            
            if (!currentFeeCurrencyLabel || !currentAccountField) {
                console.warn('⚠️ feeCurrencyLabel or accountField not found', {
                    feeCurrencyLabel: !!currentFeeCurrencyLabel,
                    accountField: !!currentAccountField,
                    exchangeTabPane: !!exchangeTabPane
                });
                return;
            }
            
            const accountId = currentAccountField.value;
            console.log('🔵 accountId:', accountId);
            
            if (!accountId) {
                currentFeeCurrencyLabel.textContent = '-';
                console.log('🔵 No account selected, setting label to "-"');
                return;
            }
            
            const accountCurrency = await getAccountCurrency(accountId);
            console.log('🔵 accountCurrency:', accountCurrency);
            
            if (accountCurrency && accountCurrency.symbol) {
                currentFeeCurrencyLabel.textContent = accountCurrency.symbol;
                console.log(`✅ Fee currency label updated to: ${accountCurrency.symbol}`);
            } else {
                currentFeeCurrencyLabel.textContent = '-';
                console.warn('⚠️ Account currency not found, setting label to "-"');
            }
        };
        
        // Generate description summary
        const updateDescription = () => {
            console.log('🔵 updateDescription CALLED');
            
            if (!descriptionField) {
                console.warn('⚠️ descriptionField not found');
                return;
            }
            
            const fromAmount = parseFloat(fromAmountField.value) || 0;
            const toAmount = parseFloat(toAmountField.value) || 0;
            const exchangeRate = parseFloat(exchangeRateField.value) || 0;
            const feeAmount = parseFloat(feeAmountField?.value) || 0;
            
            console.log('🔵 Values:', { fromAmount, toAmount, exchangeRate, feeAmount });
            
            // Check if we have minimum required fields
            if (!fromAmount || !exchangeRate) {
                console.log('⚠️ Missing required fields (fromAmount or exchangeRate)');
                return;
            }
            
            // If toAmount is not calculated yet, calculate it
            let calculatedToAmount = toAmount;
            if (!calculatedToAmount && fromAmount && exchangeRate) {
                calculatedToAmount = fromAmount * exchangeRate;
                console.log('🔵 Calculated toAmount:', calculatedToAmount);
            }
            
            // If we still don't have toAmount, don't update
            if (!calculatedToAmount) {
                console.warn('⚠️ No toAmount available');
                return;
            }
            
            const fromSymbol = getCurrencySymbol(fromCurrencyField);
            const toSymbol = getCurrencySymbol(toCurrencyField);
            
            // Re-find feeCurrencyLabel in case it wasn't found before
            // Search in exchange tab pane first, then in all tab panes, then in entire modal
            let currentFeeCurrencyLabel = null;
            if (exchangeTabPane) {
                currentFeeCurrencyLabel = exchangeTabPane.querySelector('#currencyExchangeFeeAmountCurrencyLabel');
            }
            if (!currentFeeCurrencyLabel) {
                // Try searching in all tab panes
                const allTabPanes = modalElement.querySelectorAll('.tab-pane');
                for (const tabPane of allTabPanes) {
                    currentFeeCurrencyLabel = tabPane.querySelector('#currencyExchangeFeeAmountCurrencyLabel');
                    if (currentFeeCurrencyLabel) break;
                }
            }
            if (!currentFeeCurrencyLabel) {
                // Last resort: search in entire modal
                currentFeeCurrencyLabel = modalElement.querySelector('#currencyExchangeFeeAmountCurrencyLabel');
            }
            
            const feeSymbol = currentFeeCurrencyLabel ? currentFeeCurrencyLabel.textContent.trim() : '';
            
            console.log('🔵 Symbols:', { fromSymbol, toSymbol, feeSymbol, feeCurrencyLabelFound: !!currentFeeCurrencyLabel });
            
            // Calculate net amounts
            // Fee is always in account's primary currency (feeSymbol)
            // We need to calculate:
            // 1. Net in account currency (fromAmount - feeAmount if fee is in account currency)
            // 2. Net in target currency (toAmount - feeInToCurrency)
            
            let netInAccountCurrency = fromAmount;
            let netInTargetCurrency = calculatedToAmount;
            let feeInToCurrency = 0;
            let canCalculateNet = true;
            
            if (feeAmount > 0 && feeSymbol) {
                // Calculate net in account currency
                if (feeSymbol === fromSymbol) {
                    // Fee is in account currency (same as fromCurrency) - subtract directly
                    netInAccountCurrency = fromAmount - feeAmount;
                    console.log('🔵 Net in account currency:', netInAccountCurrency, `(${fromAmount} - ${feeAmount})`);
                } else {
                    // Fee is in different currency - can't calculate net in account currency
                    netInAccountCurrency = fromAmount;
                    console.warn('⚠️ Fee is not in account currency, cannot calculate net in account currency');
                }
                
                // Calculate net in target currency
                if (feeSymbol === toSymbol) {
                    // Fee is in target currency - subtract directly
                    feeInToCurrency = feeAmount;
                    netInTargetCurrency = calculatedToAmount - feeInToCurrency;
                    console.log('🔵 Net in target currency (same currency):', netInTargetCurrency, 
                        `(${calculatedToAmount} - ${feeAmount})`);
                } else if (feeSymbol === fromSymbol) {
                    // Fee is in fromCurrency - convert to toCurrency using exchange rate
                    feeInToCurrency = feeAmount * exchangeRate;
                    netInTargetCurrency = calculatedToAmount - feeInToCurrency;
                    console.log('🔵 Net in target currency (converted):', netInTargetCurrency, 
                        `(${calculatedToAmount} - ${feeInToCurrency.toFixed(2)} = ${feeAmount}${feeSymbol} * ${exchangeRate})`);
                } else {
                    // Fee is in different currency (not fromCurrency and not toCurrency)
                    // Cannot convert - show warning
                    canCalculateNet = false;
                    console.warn('⚠️ Fee is in different currency (not fromCurrency or toCurrency), cannot convert:', 
                        { feeSymbol, fromSymbol, toSymbol });
                }
            } else {
                // No fee
                netInAccountCurrency = fromAmount;
                netInTargetCurrency = calculatedToAmount;
                console.log('🔵 No fee, net amounts equal to original amounts');
            }
            
            // Build detailed summary text
            let summaryHTML = '<div style="line-height: 1.8;">';
            
            // סכום להמרה במטבע החשבון
            if (fromSymbol) {
                summaryHTML += `<div><strong>סכום להמרה:</strong> ${fromAmount.toFixed(2)}${fromSymbol}</div>`;
            }
            
            // עמלה במטבע החשבון
            if (feeAmount > 0 && feeSymbol) {
                summaryHTML += `<div><strong>עמלה:</strong> ${feeAmount.toFixed(2)}${feeSymbol}</div>`;
            }
            
            // נטו יתקבל במטבע החשבון
            if (feeSymbol === fromSymbol && feeAmount > 0) {
                summaryHTML += `<div style="color: var(--current-entity-color-dark, #26baac); margin-top: 0.5rem;"><strong>נטו במטבע החשבון:</strong> ${netInAccountCurrency.toFixed(2)}${fromSymbol}</div>`;
            } else if (feeAmount > 0) {
                summaryHTML += `<div style="color: #666; margin-top: 0.5rem;"><strong>נטו במטבע החשבון:</strong> ${fromAmount.toFixed(2)}${fromSymbol} (עמלה במטבע אחר)</div>`;
            }
            
            // נטו יתקבל במטבע המבוקש
            if (toSymbol) {
                if (canCalculateNet && feeAmount > 0) {
                    summaryHTML += `<div style="color: var(--current-entity-color-dark, #26baac); margin-top: 0.5rem; font-size: 1.1em;"><strong>נטו במטבע המבוקש:</strong> ${netInTargetCurrency.toFixed(2)}${toSymbol}</div>`;
                } else {
                    summaryHTML += `<div style="color: var(--current-entity-color-dark, #26baac); margin-top: 0.5rem; font-size: 1.1em;"><strong>נטו במטבע המבוקש:</strong> ${calculatedToAmount.toFixed(2)}${toSymbol}</div>`;
                }
            }
            
            summaryHTML += '</div>';
            
            // Update net amount display field
            if (netAmountField) {
                netAmountField.textContent = '';
                const parser = new DOMParser();
                const doc = parser.parseFromString(summaryHTML, 'text/html');
                doc.body.childNodes.forEach(node => {
                    netAmountField.appendChild(node.cloneNode(true));
                });
                console.log('✅ Net amount field updated with detailed summary');
            } else {
                console.warn('⚠️ netAmountField not found');
            }
            
            // Build description with line breaks
            const descriptionLines = [];
            descriptionLines.push(`המרת ${formatWithSymbol(fromAmount, fromSymbol || '')} ל${formatWithSymbol(calculatedToAmount, toSymbol || '')}`);
            descriptionLines.push(`לפי שער של ${exchangeRate}`);

            if (feeAmount > 0 && feeSymbol) {
                descriptionLines.push(`עמלה: ${formatWithSymbol(feeAmount, feeSymbol)}`);
            } else if (feeAmount === 0) {
                descriptionLines.push('ללא עמלה');
            }

            if (feeAmount > 0 && !normalizedFeeSymbol) {
                descriptionLines.push('מטבע העמלה לא זוהה');
            }

            if (canCalculateNet && netInTargetCurrency !== calculatedToAmount && netInTargetCurrency > 0) {
                descriptionLines.push(`נטו במטבע המבוקש: ${formatWithSymbol(netInTargetCurrency, toSymbol || '')}`);
            } else if (feeAmount > 0 && !canCalculateNet) {
                descriptionLines.push('נטו במטבע המבוקש: לא ניתן לחשב (עמלה במטבע אחר)');
            }

            const descriptionPlain = descriptionLines.join('\n');
            const descriptionHtml = descriptionLines.map(line => `<p>${line}</p>`).join('');
            console.log('🔵 Generated description:', descriptionPlain);
            
            // Always update description (auto-generated)
            if (window.RichTextEditorService && typeof window.RichTextEditorService.setContent === 'function') {
                window.RichTextEditorService.setContent('currencyExchangeDescription', descriptionHtml);
            } else if (descriptionField) {
                if ('value' in descriptionField) {
                    descriptionField.value = descriptionPlain;
                } else {
                    descriptionField.innerText = descriptionPlain;
                }
            }
            console.log('✅ Description updated');
        };
        
        // Calculate toAmount function
        const calculateToAmount = () => {
            console.log('🔵 calculateToAmount CALLED');
            const fromAmount = parseFloat(fromAmountField.value) || 0;
            const exchangeRate = parseFloat(exchangeRateField.value) || 0;
            const toAmount = fromAmount * exchangeRate;
            
            console.log('🔵 Calculation:', { fromAmount, exchangeRate, toAmount });
            
            if (toAmountField) {
                toAmountField.value = toAmount.toFixed(6);
                console.log('✅ toAmountField updated to:', toAmountField.value);
            }
            
            // Update description after calculation
            updateDescription();
        };
        
        // Update toCurrency when fromCurrency changes
        const updateToCurrency = () => {
            if (fromCurrencyField && toCurrencyField) {
                // Get all currencies
                const currencies = Array.from(fromCurrencyField.options);
                const fromCurrencyId = fromCurrencyField.value;
                
                // Find a different currency for toCurrency
                const differentCurrency = currencies.find(opt => opt.value !== fromCurrencyId && opt.value !== '');
                if (differentCurrency && toCurrencyField) {
                    toCurrencyField.value = differentCurrency.value;
                }
            }
        };
        
        // Add event listeners
        if (fromAmountField) {
            fromAmountField.addEventListener('input', calculateToAmount);
            fromAmountField.addEventListener('change', calculateToAmount);
        }
        
        if (exchangeRateField) {
            exchangeRateField.addEventListener('input', calculateToAmount);
            exchangeRateField.addEventListener('change', calculateToAmount);
        }
        
        if (fromCurrencyField) {
            fromCurrencyField.addEventListener('change', () => {
                updateToCurrency();
                calculateToAmount();
                // updateDescription is already called by calculateToAmount
            });
            // Also update description on input (for real-time updates)
            fromCurrencyField.addEventListener('input', () => {
                setTimeout(updateDescription, 50);
            });
        }
        
        if (toCurrencyField) {
            toCurrencyField.addEventListener('change', () => {
                // Recalculate toAmount if needed, then update description
                calculateToAmount();
                updateDescription();
            });
            // Also update description on input (for real-time updates)
            toCurrencyField.addEventListener('input', () => {
                setTimeout(updateDescription, 50);
            });
        }
        
        if (feeAmountField) {
            feeAmountField.addEventListener('input', updateDescription);
            feeAmountField.addEventListener('change', updateDescription);
        }
        
        if (accountField) {
            accountField.addEventListener('change', () => {
                updateFeeCurrencyLabel().then(() => {
                    updateDescription();
                });
            });
        }
        
        // Initial calculation
        calculateToAmount();
        updateToCurrency();
        
        // Update fee currency label - try multiple times to catch when account is loaded
        const tryUpdateFeeCurrency = async (attempt = 0) => {
            if (attempt > 5) {
                console.warn('⚠️ Max attempts reached for updateFeeCurrencyLabel');
                return;
            }
            
            const accountId = accountField?.value;
            console.log(`🔵 Attempt ${attempt + 1}: accountId =`, accountId);
            
            if (accountId) {
                await updateFeeCurrencyLabel();
                // Also update description after fee currency is updated
                setTimeout(() => {
                    updateDescription();
                }, 50);
            } else {
                // Try again after a short delay
                setTimeout(() => {
                    tryUpdateFeeCurrency(attempt + 1);
                }, 200);
            }
        };
        
        // Start trying to update fee currency
        tryUpdateFeeCurrency();
        
        // Also try after a longer delay to catch late-loading fields
        setTimeout(() => {
            if (accountField?.value) {
                updateFeeCurrencyLabel().then(() => {
                    updateDescription();
                });
            }
        }, 1000);
        
        // Listen for tab switch to exchange tab - update fee currency when tab opens
        const exchangeTabButton = modalElement.querySelector('#cashFlowModalTabexchange-tab');
        if (exchangeTabButton) {
            exchangeTabButton.addEventListener('shown.bs.tab', () => {
                console.log('🔵 Exchange tab opened, updating fee currency');
                // Update fee currency when tab opens (account might be loaded by now)
                setTimeout(() => {
                    updateFeeCurrencyLabel().then(() => {
                        updateDescription();
                    });
                }, 100);
            });
        }
        
        // Also listen on the tab pane itself for when it becomes visible
        if (exchangeTabPane) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target;
                        if (target.classList.contains('show') && target.classList.contains('active')) {
                            console.log('🔵 Exchange tab pane became visible, updating fee currency');
                            setTimeout(() => {
                                updateFeeCurrencyLabel().then(() => {
                                    updateDescription();
                                });
                            }, 100);
                        }
                    }
                });
            });
            observer.observe(exchangeTabPane, { attributes: true, attributeFilter: ['class'] });
        }
        
        // Export to global scope for manual calls
        window.calculateCurrencyExchangeToAmount = calculateToAmount;
        window.updateCurrencyExchangeDescription = updateDescription;
        window.updateCurrencyExchangeFeeCurrency = updateFeeCurrencyLabel;
    }

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
     * @param {string} mode - מצב המודל (add, edit, view) - משפיע על defaultFromPreferences
     * @private
     */
    async populateSelects(modalElement, config, mode = 'add') {
        // Check dependencies with validation
        const deps = this._checkDependencies();
        
        if (!deps.selectPopulatorService.available) {
            console.warn('⚠️ SelectPopulatorService not available - select fields may not be populated correctly');
            console.warn('⚠️ Make sure SelectPopulatorService is loaded before ModalManagerV2');
            // Continue without populating - let the form work without defaults
            return;
        }
        
        // Helper function to find field config in tabs or fields
        const findFieldConfig = (selectId, config, tabId = null) => {
            // Check in tabs first
            if (config.tabs && Array.isArray(config.tabs)) {
                for (const tab of config.tabs) {
                    // If tabId is provided, only check that specific tab
                    if (tabId && tab.id !== tabId) {
                        continue;
                    }
                    if (tab.fields && Array.isArray(tab.fields)) {
                        const fieldConfig = tab.fields.find(f => f.id === selectId);
                        if (fieldConfig) {
                            return { fieldConfig, tabId: tab.id };
                        }
                    }
                }
            }
            // Check in direct fields
            if (config.fields && Array.isArray(config.fields)) {
                const fieldConfig = config.fields.find(f => f.id === selectId);
                if (fieldConfig) {
                    return { fieldConfig, tabId: null };
                }
            }
            return null;
        };
        
        // If config has tabs, populate selects in each tab separately
        if (config.tabs && Array.isArray(config.tabs)) {
            for (const tab of config.tabs) {
                const tabPane = modalElement.querySelector(`#${config.id}Tab${tab.id}`);
                if (!tabPane) {
                    console.warn(`⚠️ Tab pane ${config.id}Tab${tab.id} not found`);
                    continue;
                }
                
                const selects = tabPane.querySelectorAll('select');
                console.log(`🔍 populateSelects: Found ${selects.length} select elements in tab ${tab.id}`);
                
                for (const select of selects) {
                    const selectId = select.id;
                    const result = findFieldConfig(selectId, config, tab.id);
                    if (!result) {
                        console.warn(`⚠️ Field config not found for ${selectId} in tab ${tab.id}`);
                        continue;
                    }
                    
                    const { fieldConfig } = result;
                    await this._populateSingleSelect(select, selectId, fieldConfig, config, mode);
                }
            }
        } else {
            // No tabs - use direct fields
            const selects = modalElement.querySelectorAll('select');
            console.log(`🔍 populateSelects: Found ${selects.length} select elements`);
            
            for (const select of selects) {
                const selectId = select.id;
                // Skip empty IDs (might be dynamically created elements)
                if (!selectId || selectId.trim() === '') {
                    continue;
                }
                const result = findFieldConfig(selectId, config);
                if (!result) {
                    console.warn(`⚠️ Field config not found for ${selectId}`);
                    continue;
                }
                
                const { fieldConfig } = result;
                await this._populateSingleSelect(select, selectId, fieldConfig, config, mode);
            }
        }
    }
    
    /**
     * Populate a single select field
     * @private
     * @param {HTMLElement} select - אלמנט ה-select
     * @param {string} selectId - מזהה ה-select
     * @param {Object} fieldConfig - קונפיגורציה של השדה
     * @param {Object} config - קונפיגורציה של המודל
     * @param {string} mode - מצב המודל (add, edit, view) - משפיע על defaultFromPreferences
     */
    async _populateSingleSelect(select, selectId, fieldConfig, config, mode = 'add') {
        // Check if this field has defaultFromPreferences in config
        // CRITICAL: In edit mode, never use defaultFromPreferences - always use the existing value
        let shouldUseDefaultFromPrefs = false;
        if (mode === 'edit') {
            shouldUseDefaultFromPrefs = false; // Never use preferences in edit mode
        } else if (fieldConfig && fieldConfig.defaultFromPreferences) {
            shouldUseDefaultFromPrefs = true;
        }
        
        try {
            // Tag multi-select fields are handled by TagUIManager; skip auto population
            if (select?.classList?.contains?.('tag-multi-select')) {
                console.log(`⏭️ Skipping ${selectId} - Tag multi select handled by TagUIManager`);
                return;
            }

            // Check if field has options in config - if so, don't populate automatically
            let hasStaticOptions = false;
            if (fieldConfig && fieldConfig.options && Array.isArray(fieldConfig.options) && fieldConfig.options.length > 0) {
                hasStaticOptions = true;
                console.log(`⏭️ Skipping ${selectId} - Has static options in config`);
            }
            
            // Skip if field has static options
            if (hasStaticOptions) {
                return;
            }
            
            // Check if field has populateFromService in config (highest priority)
            let populateFromService = null;
            if (fieldConfig && fieldConfig.populateFromService) {
                populateFromService = fieldConfig.populateFromService;
            }
            
            // מילוי לפי סוג השדה
            // Priority 1: populateFromService (explicit configuration)
            // Pass select element directly to avoid ID conflicts in tabs
            if (populateFromService === 'currencies') {
                await window.SelectPopulatorService.populateCurrenciesSelect(select, {
                    defaultFromPreferences: shouldUseDefaultFromPrefs
                });
            } else if (populateFromService === 'accounts') {
                await window.SelectPopulatorService.populateAccountsSelect(select, {
                    defaultFromPreferences: shouldUseDefaultFromPrefs
                });
            } else if (populateFromService === 'tickers') {
                await window.SelectPopulatorService.populateTickersSelect(select, {
                    includeEmpty: true
                });
            }
            // Priority 2: Specific field names (Type, Currency, etc.)
            // Check for tickerType specifically - should NOT be populated (has static options)
            else if (selectId === 'tickerType' || (selectId.includes('Type') && selectId.toLowerCase().includes('ticker'))) {
                // Type field - already has options in config, don't populate
                console.log(`⏭️ Skipping ${selectId} - Type field with static options`);
            } 
            // Check for tickerCurrency specifically - should use populateFromService
            else if (selectId === 'tickerCurrency' || (selectId.includes('Currency') && selectId.toLowerCase().includes('ticker'))) {
                // This should have been handled by populateFromService above, but double-check
                if (populateFromService !== 'currencies') {
                    console.log(`⚠️ ${selectId} should use populateFromService: 'currencies', falling back to manual populate`);
                    await window.SelectPopulatorService.populateCurrenciesSelect(select, {
                        defaultFromPreferences: shouldUseDefaultFromPrefs
                    });
                }
            }
            // Generic Currency fields (not ticker-related)
            else if ((selectId.includes('Currency') || selectId.includes('currency')) && 
                      !selectId.toLowerCase().includes('ticker')) {
                await window.SelectPopulatorService.populateCurrenciesSelect(select, {
                    defaultFromPreferences: shouldUseDefaultFromPrefs
                });
            }
            // Priority 3: Generic field matching
            // Check for Status fields - should NOT be populated (has static options)
            else if (selectId.includes('Status') || selectId.includes('status')) {
                console.log(`⏭️ Skipping ${selectId} - Status field with static options`);
            }
                else if (!select.classList.contains('tag-multi-select') && (selectId.includes('Account') || selectId.includes('account'))) {
                await window.SelectPopulatorService.populateAccountsSelect(select, {
                    defaultFromPreferences: shouldUseDefaultFromPrefs
                });
            } 
            // Ticker select fields (but NOT tickerType or tickerCurrency)
            // Note: executionTicker with populateFromService will be handled above via populateFromService: 'tickers', not here
            else if ((selectId.includes('Ticker') || selectId.includes('ticker')) && 
                      !selectId.includes('Type') && !selectId.includes('Currency') &&
                      selectId !== 'tickerType' && selectId !== 'tickerCurrency') {
                // Regular ticker select (e.g., tradePlanTicker)
                // executionTicker with populateFromService is handled above, so it won't reach here
                await window.SelectPopulatorService.populateTickersSelect(select, {
                    includeEmpty: true
                });
                console.log(`✅ נטענו טיקרים ל-${selectId}`, {
                    selectOptionsAfter: select.options.length,
                    selectValue: select.value
                });
            } else if (selectId.includes('TradePlan') || selectId.includes('tradePlan')) {
                await window.SelectPopulatorService.populateTradePlansSelect(select, {
                    includeEmpty: true
                });
            } else if ((selectId.includes('Trade') || selectId.includes('trade')) && 
                      !selectId.includes('TradePlan') && !selectId.includes('tradePlan')) {
                // Trade select (but not TradePlan) - e.g., cashFlowTrade
                await window.SelectPopulatorService.populateTradesSelect(select, {
                    includeEmpty: true
                });
            }
        } catch (error) {
            console.warn(`Error populating select ${selectId}:`, error);
        }
    }
    

    /**
     * Handle modal shown event - טיפול באירוע הצגת מודל
     * 
     * @param {HTMLElement} modalElement - אלמנט המודל
     * @private
     */
    async handleModalShown(modalElement) {
        const modalId = modalElement.id;
        
        if (this.modals.has(modalId)) {
            this.modals.get(modalId).isActive = true;
            this.activeModal = modalId;
        }
        
        // Get entityType from modal config or dataset
        const modalInfo = this.modals.get(modalId);
        const entityType = modalInfo?.config?.entityType || modalElement.dataset.entityType || null;
        
        // Hydrate tag fields FIRST - this will also call initializeModal internally
        // Must be async and awaited, and pass entityType from config
        await this._hydrateTagFieldsForModal(modalElement, entityType, null);
        
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
    /**
     * Helper function to preserve and restore select value after cloning
     * This is critical for edit mode where values are already populated
     * 
     * @param {HTMLSelectElement} selectElement - The select element to clone
     * @param {HTMLSelectElement} newSelectElement - The cloned select element
     * @param {string} fieldName - Name of the field for logging
     * @private
     */
    _restoreSelectValueAfterClone(selectElement, newSelectElement, fieldName) {
        // Validate inputs
        if (!selectElement || !newSelectElement) {
            console.warn(`⚠️ _restoreSelectValueAfterClone: Invalid elements for ${fieldName}`);
            return;
        }
        
        // Check if selectElement has options property (might be detached from DOM)
        if (!selectElement.options || selectElement.options.length === 0) {
            console.warn(`⚠️ _restoreSelectValueAfterClone: No options available for ${fieldName}`);
            return;
        }
        
        // Save the current value before cloning (important for edit mode!)
        const currentValue = selectElement.value;
        const currentSelectedIndex = selectElement.selectedIndex;
        const currentSelectedText = (currentSelectedIndex >= 0 && selectElement.options[currentSelectedIndex]) 
            ? selectElement.options[currentSelectedIndex].text 
            : '';
        
        if (!currentValue || currentValue === '') {
            // No value to restore
            return;
        }
        
        console.log(`🔄 Cloning select ${fieldName}, preserving value: ${currentValue} (${currentSelectedText})`);
        
        // Restore the value after cloning (critical for edit mode!)
        // cloneNode(true) copies options but not the selected value, so we need to restore it
        // Try to set immediately (options should be copied by cloneNode)
        newSelectElement.value = currentValue;
        
        // If value didn't set (might be type mismatch or option not found), try to find matching option
        if (newSelectElement.value !== currentValue) {
            // Find matching option by value (handle type mismatches)
            const matchingOption = Array.from(newSelectElement.options).find(opt => 
                opt.value === currentValue || 
                String(opt.value) === String(currentValue) ||
                parseInt(opt.value) === parseInt(currentValue)
            );
            
            if (matchingOption) {
                newSelectElement.value = matchingOption.value;
                console.log(`✅ Restored ${fieldName} value after clone: ${matchingOption.value} (${matchingOption.text})`);
            } else {
                // If still not found, wait a bit (options might be repopulated dynamically)
                const restoreValue = () => {
                    if (newSelectElement.options.length <= 1) {
                        // Options not loaded yet, retry
                        setTimeout(restoreValue, 50);
                        return;
                    }
                    
                    const match = Array.from(newSelectElement.options).find(opt => 
                        opt.value === currentValue || 
                        String(opt.value) === String(currentValue) ||
                        parseInt(opt.value) === parseInt(currentValue)
                    );
                    
                    if (match) {
                        newSelectElement.value = match.value;
                        console.log(`✅ Restored ${fieldName} value after clone (delayed): ${match.value} (${match.text})`);
                    } else {
                        console.warn(`⚠️ Could not restore ${fieldName} value: ${currentValue} (option not found)`);
                        console.warn(`   Available options:`, Array.from(newSelectElement.options).map(opt => ({value: opt.value, text: opt.text})));
                    }
                };
                
                // Retry restoration
                setTimeout(restoreValue, 50);
            }
        } else {
            console.log(`✅ Restored ${fieldName} value after clone: ${currentValue}`);
        }
    }

    initializeSpecialHandlers(modalElement) {
        const modalId = modalElement.id;
        
        // For Executions modal - handle ticker and account selection
        if (modalId === 'executionsModal') {
            // Handle ticker selection - clone and re-populate to ensure value is preserved
            // This is the working solution - not elegant but works
            const tickerSelect = modalElement.querySelector('#executionTicker');
            if (tickerSelect) {
                // CRITICAL: Get preserved value from data attribute (set by populateForm)
                // OR use current value if preserved value not available
                const preservedValue = tickerSelect.dataset.preservedValue;
                const originalValue = preservedValue || tickerSelect.value;
                console.log(`💾 [initializeSpecialHandlers] executionTicker - preservedValue: ${preservedValue}, currentValue: ${tickerSelect.value}, will use: ${originalValue}`);
                
                // Clone to remove existing listeners
                const newTickerSelect = tickerSelect.cloneNode(true);
                tickerSelect.parentNode.replaceChild(newTickerSelect, tickerSelect);
                
                console.log(`🔄 [initializeSpecialHandlers] After clone - originalValue: ${originalValue}, newSelect.value: ${newTickerSelect.value}`);
                
                // Re-populate with original value as defaultValue
                if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function') {
                    (async () => {
                        try {
                            console.log(`🔄 [initializeSpecialHandlers] Re-populating with defaultValue: ${originalValue}`);
                            await window.SelectPopulatorService.populateTickersSelect(newTickerSelect, {
                                includeEmpty: true,
                                defaultValue: originalValue // CRITICAL: Use the preserved value
                            });
                            console.log(`✅ [initializeSpecialHandlers] Re-populated, final value: ${newTickerSelect.value}, expected: ${originalValue}`);
                        } catch (error) {
                            console.error(`❌ Error re-populating executionTicker:`, error);
                        }
                    })();
                }
                
                // Add change listener
                newTickerSelect.addEventListener('change', async (e) => {
                    const tickerId = e.target.value;
                    if (tickerId && window.loadExecutionTickerInfo) {
                        await window.loadExecutionTickerInfo(tickerId);
                    }
                });
            }
            
            // Handle account selection - preserve value after any potential cloning
            const accountSelect = modalElement.querySelector('#executionAccount');
            if (accountSelect && accountSelect.value && accountSelect.value !== '') {
                // If account select gets cloned elsewhere, ensure value is preserved
                // This is a safeguard - the select might not be cloned here, but could be elsewhere
                const currentValue = accountSelect.value;
                setTimeout(() => {
                    if (accountSelect.value !== currentValue && currentValue) {
                        accountSelect.value = currentValue;
                        console.log(`✅ Restored executionAccount value: ${currentValue}`);
                    }
                }, 100);
            }
            
            // Handle source field - enable/disable external_id field based on source value
            const sourceSelect = modalElement.querySelector('#executionSource');
            const externalIdField = modalElement.querySelector('#executionExternalId');
            
            if (sourceSelect && externalIdField) {
                // Function to update external_id field state
                const updateExternalIdField = () => {
                    const sourceValue = sourceSelect.value;
                    if (sourceValue === 'manual') {
                        // Disable external_id field for manual source
                        externalIdField.disabled = true;
                        externalIdField.classList.add('form-control-disabled');
                        // Clear value if it's the default '0'
                        if (externalIdField.value === '0' || externalIdField.value === '') {
                            externalIdField.value = '';
                        }
                        console.log(`🔒 Disabled executionExternalId (source: ${sourceValue})`);
                    } else {
                        // Enable external_id field for non-manual sources
                        externalIdField.disabled = false;
                        externalIdField.classList.remove('form-control-disabled');
                        console.log(`🔓 Enabled executionExternalId (source: ${sourceValue})`);
                    }
                };
                
                // Set initial state
                updateExternalIdField();
                
                // Add change listener
                sourceSelect.addEventListener('change', updateExternalIdField);
                
                console.log('✅ Added source field listener for executionExternalId');
            }
            
            // Handle execution type field - enable/disable Realized P/L and MTM P/L fields based on execution type
            // Realized P/L and MTM P/L נדרשים רק ל-sell (מכירה) ו-cover (כיסוי) - סגירת פוזיציות
            // Realized P/L and MTM P/L לא נדרשים ל-buy (קנייה) ו-short (מכירה בחסר) - פתיחת פוזיציות
            const executionTypeSelect = modalElement.querySelector('#executionType');
            const realizedPLField = modalElement.querySelector('#executionRealizedPL');
            const mtmPLField = modalElement.querySelector('#executionMTMPL');
            
            // Function to update both Realized P/L and MTM P/L fields state (same logic for both)
            const updatePLFields = () => {
                const executionType = executionTypeSelect.value;
                if (executionType === 'sell' || executionType === 'cover') {
                    // Enable P/L fields for sell and cover (closing positions)
                    if (realizedPLField) {
                        realizedPLField.disabled = false;
                        realizedPLField.required = true;
                    }
                    if (mtmPLField) {
                        mtmPLField.disabled = false;
                        mtmPLField.required = false; // MTM P/L is optional even when enabled
                    }
                    console.log(`🔓 Enabled P/L fields (type: ${executionType})`);
                } else {
                    // Disable P/L fields for buy, short, and any unknown types (opening positions)
                    if (realizedPLField) {
                        realizedPLField.disabled = true;
                        realizedPLField.required = false;
                        realizedPLField.value = '';
                    }
                    if (mtmPLField) {
                        mtmPLField.disabled = true;
                        mtmPLField.required = false;
                        mtmPLField.value = '';
                    }
                    console.log(`🔒 Disabled P/L fields (type: ${executionType})`);
                }
            };
            
            if (executionTypeSelect) {
                // Set initial state
                updatePLFields();
                
                // Add change listener
                executionTypeSelect.addEventListener('change', updatePLFields);
                
                console.log('✅ Added execution type listener for executionRealizedPL and executionMTMPL');
            }
        }
        
        // For Trade Plans modal - handle ticker selection
        if (modalId === 'tradePlansModal') {
            if (typeof window.setupTradePlanConditionsButton === 'function') {
                try {
                    window.setupTradePlanConditionsButton(modalElement);
                } catch (error) {
                    window.Logger?.warn('⚠️ Failed to initialize trade plan conditions controls', { error, page: 'modal-manager-v2' });
                }
            }

            const runResync = (forceFlag = true) => {
                if (window.InvestmentCalculationService && typeof window.InvestmentCalculationService.resync === 'function') {
                    const resyncPromise = window.InvestmentCalculationService.resync(modalElement, { force: forceFlag });
                    if (resyncPromise && typeof resyncPromise.catch === 'function') {
                        resyncPromise.catch(error => {
                            window.Logger?.warn('⚠️ InvestmentCalculationService resync failed for trade plan modal', { error, page: 'modal-manager-v2' });
                        });
                    }
                    return resyncPromise;
                }
                return Promise.resolve();
            };

            const triggerRiskDefaults = (forceFlag = false) => {
                if (typeof window.applyTradePlanDefaultRiskLevels === 'function') {
                    const riskPromise = window.applyTradePlanDefaultRiskLevels({ force: forceFlag, modalElement });
                    if (riskPromise && typeof riskPromise.catch === 'function') {
                        riskPromise.catch(error => {
                            window.Logger?.warn('⚠️ applyTradePlanDefaultRiskLevels failed during trade plan modal handling', { error, page: 'modal-manager-v2' });
                        });
                    }
                    return riskPromise;
                }
                return Promise.resolve();
            };

            const form = modalElement.querySelector('#tradePlansModalForm');
            const mode = form?.dataset?.mode || modalElement.dataset?.mode || 'add';
            let bindPromiseRef = null;

            const ensureEntryDateDefault = () => {
                if (!entryDateInput || mode !== 'add' || entryDateInput.dataset.userModified === 'true') {
                    return;
                }

                if (entryDateInput.value) {
                    return;
                }

                let assignedValue = null;

                if (window.DefaultValueSetter && typeof window.DefaultValueSetter.setCurrentDate === 'function') {
                    assignedValue = window.DefaultValueSetter.setCurrentDate(entryDateInput.id);
                }

                if (!assignedValue) {
                    const today = new Date();
                    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
                    assignedValue = today.toISOString().slice(0, 10);
                    entryDateInput.value = assignedValue;
                } else {
                    entryDateInput.value = assignedValue;
                }

                entryDateInput.dataset.systemGenerated = 'true';
                delete entryDateInput.dataset.userModified;
            };

            const finalizeInitialization = () => {
                const resyncResult = runResync(true);
                if (resyncResult && typeof resyncResult.then === 'function') {
                    return resyncResult.then(() => triggerRiskDefaults(mode === 'add'));
                }
                return triggerRiskDefaults(mode === 'add');
            };

            const scheduleFinalize = () => {
                if (bindPromiseRef && typeof bindPromiseRef.then === 'function') {
                    bindPromiseRef.then(() => finalizeInitialization()).catch(error => {
                        window.Logger?.warn('⚠️ finalizeInitialization failed for trade plan modal', { error, page: 'modal-manager-v2' });
                    });
                } else {
                    finalizeInitialization();
                }
            };
            const tickerSelect = modalElement.querySelector('#tradePlanTicker');
            if (tickerSelect && !tickerSelect.dataset.autocalcBound) {
                tickerSelect.addEventListener('change', async (e) => {
                    const tickerId = e.target.value;
                    if (tickerId && window.loadTradePlanTickerInfo) {
                        await window.loadTradePlanTickerInfo(tickerId);
                    }
                    await runResync(true);
                    await triggerRiskDefaults(false);
                });
                tickerSelect.dataset.autocalcBound = 'true';
            }
            
            // Handle account selection - preserve value after any potential cloning
            const accountSelect = modalElement.querySelector('#tradePlanAccount');
            if (accountSelect && accountSelect.value && accountSelect.value !== '') {
                // If account select gets cloned elsewhere, ensure value is preserved
                // This is a safeguard - the select might not be cloned here, but could be elsewhere
                const currentValue = accountSelect.value;
                setTimeout(() => {
                    if (accountSelect.value !== currentValue && currentValue) {
                        accountSelect.value = currentValue;
                        console.log(`✅ Restored tradePlanAccount value: ${currentValue}`);
                    }
                }, 100);
            }

            const entryDateInput = modalElement.querySelector('#tradePlanEntryDate');
            const sideSelect = modalElement.querySelector('#tradePlanSide');
            const summaryContainer = modalElement.querySelector('#tradePlanRiskSummaryCard');
            const stopPercentInput = modalElement.querySelector('#tradePlanStopLossPercent');
            const targetPercentInput = modalElement.querySelector('#tradePlanTakeProfitPercent');
            if (entryDateInput && !entryDateInput.dataset.autocalcBound) {
                entryDateInput.addEventListener('input', () => {
                    entryDateInput.dataset.userModified = 'true';
                });
                entryDateInput.dataset.autocalcBound = 'true';
            }
            if (stopPercentInput && !stopPercentInput.dataset.autocalcBound) {
                stopPercentInput.addEventListener('input', () => {
                    stopPercentInput.dataset.userModified = 'true';
                });
                stopPercentInput.dataset.autocalcBound = 'true';
            }
            if (targetPercentInput && !targetPercentInput.dataset.autocalcBound) {
                targetPercentInput.addEventListener('input', () => {
                    targetPercentInput.dataset.userModified = 'true';
                });
                targetPercentInput.dataset.autocalcBound = 'true';
            }

            if (window.InvestmentCalculationService && typeof window.InvestmentCalculationService.bindForm === 'function') {
                const bindPromise = window.InvestmentCalculationService.bindForm(modalElement, {
                    amountField: '#planAmount',
                    quantityField: '#tradePlanQuantity',
                    priceField: '#tradePlanEntryPrice',
                    priceDisplay: '#currentPriceDisplay',
                    stopField: '#tradePlanStopLoss',
                    targetField: '#tradePlanTakeProfit',
                    stopPercentField: '#tradePlanStopLossPercent',
                    targetPercentField: '#tradePlanTakeProfitPercent',
                    sideField: '#tradePlanSide',
                    tickerField: '#tradePlanTicker',
                    summaryField: '#tradePlanRiskSummaryCard',
                    summaryTitle: 'סיכום תוכנית',
                    allowFractionalShares: null,
                    quantityDecimals: 1,
                    amountDecimals: 2,
                    percentDecimals: 2,
                    syncPreference: 'auto',
                    forceRiskOnBind: mode === 'add',
                    forceSyncOnBind: mode === 'add',
                    skipInitialSummaryUpdate: mode === 'edit', // Skip initial summary update in edit mode - will be updated after populateForm
                    stopPreferenceKey: 'defaultStopLoss',
                    targetPreferenceKey: 'defaultTargetPrice'
                });
                if (bindPromise && typeof bindPromise.catch === 'function') {
                    bindPromise.catch(error => {
                        window.Logger?.warn('⚠️ InvestmentCalculationService bind failed for trade plan modal', { error, page: 'modal-manager-v2' });
                    });
                }
                bindPromiseRef = bindPromise;
            }

            const stopInput = modalElement.querySelector('#tradePlanStopLoss');
            const targetInput = modalElement.querySelector('#tradePlanTakeProfit');

            if (mode === 'add') {
                if (stopInput) {
                    delete stopInput.dataset.userModified;
                    delete stopInput.dataset.systemGenerated;
                }
                if (targetInput) {
                    delete targetInput.dataset.userModified;
                    delete targetInput.dataset.systemGenerated;
                }
                if (entryDateInput) {
                    delete entryDateInput.dataset.userModified;
                    delete entryDateInput.dataset.systemGenerated;
                }
                if (sideSelect) {
                    delete sideSelect.dataset.userModified;
                    delete sideSelect.dataset.systemGenerated;
                }
                if (summaryContainer) {
                    delete summaryContainer.dataset.userModified;
                }
                if (stopPercentInput) {
                    delete stopPercentInput.dataset.userModified;
                    delete stopPercentInput.dataset.systemGenerated;
                }
                if (targetPercentInput) {
                    delete targetPercentInput.dataset.userModified;
                    delete targetPercentInput.dataset.systemGenerated;
                }
            } else {
                if (stopInput) {
                    stopInput.dataset.userModified = stopInput.dataset.userModified || 'true';
                }
                if (targetInput) {
                    targetInput.dataset.userModified = targetInput.dataset.userModified || 'true';
                }
                if (entryDateInput) {
                    entryDateInput.dataset.userModified = entryDateInput.dataset.userModified || 'true';
                }
                if (sideSelect) {
                    sideSelect.dataset.userModified = sideSelect.dataset.userModified || 'true';
                }
                if (stopPercentInput) {
                    stopPercentInput.dataset.userModified = stopPercentInput.dataset.userModified || 'true';
                }
                if (targetPercentInput) {
                    targetPercentInput.dataset.userModified = targetPercentInput.dataset.userModified || 'true';
                }
            }

            ensureEntryDateDefault();
            scheduleFinalize();
        }
        
        // For Trades modal - handle ticker selection
        if (modalId === 'tradesModal') {
            if (typeof window.setupTradeConditionsButton === 'function') {
                try {
                    window.setupTradeConditionsButton(modalElement);
                } catch (error) {
                    window.Logger?.warn('⚠️ Failed to initialize trade conditions controls', { error, page: 'modal-manager-v2' });
                }
            }

            const runTradeResync = (forceFlag = true) => {
                if (window.InvestmentCalculationService && typeof window.InvestmentCalculationService.resync === 'function') {
                    const resyncPromise = window.InvestmentCalculationService.resync(modalElement, { force: forceFlag });
                    if (resyncPromise && typeof resyncPromise.catch === 'function') {
                        resyncPromise.catch(error => {
                            window.Logger?.warn('⚠️ InvestmentCalculationService resync failed for trades modal', { error, page: 'modal-manager-v2' });
                        });
                    }
                    return resyncPromise;
                }
                return Promise.resolve();
            };

            const triggerTradeRiskDefaults = (forceFlag = false) => {
                if (typeof window.applyTradePlanDefaultRiskLevels === 'function') {
                    const riskPromise = window.applyTradePlanDefaultRiskLevels({ force: forceFlag, modalElement });
                    if (riskPromise && typeof riskPromise.catch === 'function') {
                        riskPromise.catch(error => {
                            window.Logger?.warn('⚠️ applyTradePlanDefaultRiskLevels failed during trades modal handling', { error, page: 'modal-manager-v2' });
                        });
                    }
                    return riskPromise;
                }
                return Promise.resolve();
            };

            const tradesForm = modalElement.querySelector('#tradesModalForm');
            const tradesMode = tradesForm?.dataset?.mode || modalElement.dataset?.mode || 'add';
            let tradeBindPromise = null;

            const finalizeTradeInitialization = () => {
                const resyncResult = runTradeResync(true);
                if (resyncResult && typeof resyncResult.then === 'function') {
                    return resyncResult.then(() => triggerTradeRiskDefaults(tradesMode === 'add'));
                }
                return triggerTradeRiskDefaults(tradesMode === 'add');
            };

            const scheduleTradeFinalize = () => {
                if (tradeBindPromise && typeof tradeBindPromise.then === 'function') {
                    tradeBindPromise.then(() => finalizeTradeInitialization()).catch(error => {
                        window.Logger?.warn('⚠️ finalizeTradeInitialization failed for trades modal', { error, page: 'modal-manager-v2' });
                    });
                } else {
                    finalizeTradeInitialization();
                }
            };
            // Handle ticker selection
            const tickerSelect = modalElement.querySelector('#tradeTicker');
            if (tickerSelect) {
                // Save original before cloning
                const originalTickerSelect = tickerSelect;
                
                // Remove existing listeners
                const newTickerSelect = tickerSelect.cloneNode(true);
                tickerSelect.parentNode.replaceChild(newTickerSelect, tickerSelect);
                
                // Restore value after clone (critical for edit mode!)
                this._restoreSelectValueAfterClone(originalTickerSelect, newTickerSelect, 'tradeTicker');
                
                // Add change listener
                newTickerSelect.addEventListener('change', async (e) => {
                    const tickerId = e.target.value;
                    if (tickerId && window.loadTradeTickerInfo) {
                        await window.loadTradeTickerInfo(tickerId);
                    }
                    await runTradeResync(true);
                    await triggerTradeRiskDefaults(false);
                });
            }
            
            // Handle account selection - preserve value after any potential cloning
            const accountSelect = modalElement.querySelector('#tradeAccount');
            if (accountSelect && accountSelect.value && accountSelect.value !== '') {
                // If account select gets cloned elsewhere, ensure value is preserved
                // This is a safeguard - the select might not be cloned here, but could be elsewhere
                const currentValue = accountSelect.value;
                setTimeout(() => {
                    if (accountSelect.value !== currentValue && currentValue) {
                        accountSelect.value = currentValue;
                        console.log(`✅ Restored tradeAccount value: ${currentValue}`);
                    }
                }, 100);
            }

            if (window.InvestmentCalculationService && typeof window.InvestmentCalculationService.bindForm === 'function') {
                const bindPromise = window.InvestmentCalculationService.bindForm(modalElement, {
                    amountField: '#tradeTotalInvestment',
                    quantityField: '#tradeQuantity',
                    priceField: '#tradeEntryPrice',
                    stopField: '#tradeStopLoss',
                    targetField: '#tradeTakeProfit',
                    stopPercentField: '#tradeStopLossPercent',
                    targetPercentField: '#tradeTakeProfitPercent',
                    sideField: '#tradeSide',
                    tickerField: '#tradeTicker',
                    summaryField: '#tradeRiskSummaryCard',
                    summaryTitle: 'סיכום טרייד',
                    allowFractionalShares: null,
                    quantityDecimals: 1,
                    amountDecimals: 2,
                    percentDecimals: 2,
                    syncPreference: 'auto',
                    forceRiskOnBind: tradesMode === 'add',
                    forceSyncOnBind: tradesMode === 'add',
                    skipInitialSummaryUpdate: tradesMode === 'edit', // Skip initial summary update in edit mode - will be updated after populateForm
                    stopPreferenceKey: 'defaultStopLoss',
                    targetPreferenceKey: 'defaultTargetPrice'
                });
                if (bindPromise && typeof bindPromise.catch === 'function') {
                    bindPromise.catch(error => {
                        window.Logger?.warn('⚠️ InvestmentCalculationService bind failed for trades modal', { error, page: 'modal-manager-v2' });
                    });
                }
                tradeBindPromise = bindPromise;
            }

            const tradeStopInput = modalElement.querySelector('#tradeStopLoss');
            const tradeTargetInput = modalElement.querySelector('#tradeTakeProfit');
            const tradeEntryDateInput = modalElement.querySelector('#tradeEntryDate');
            const tradeStopPercentInput = modalElement.querySelector('#tradeStopLossPercent');
            const tradeTargetPercentInput = modalElement.querySelector('#tradeTakeProfitPercent');
            const tradeSideSelect = modalElement.querySelector('#tradeSide');
            const tradeSummaryContainer = modalElement.querySelector('#tradeRiskSummaryCard');

            if (tradesMode === 'add') {
                if (tradeStopInput) {
                    delete tradeStopInput.dataset.userModified;
                    delete tradeStopInput.dataset.systemGenerated;
                }
                if (tradeTargetInput) {
                    delete tradeTargetInput.dataset.userModified;
                    delete tradeTargetInput.dataset.systemGenerated;
                }
                if (tradeEntryDateInput) {
                    delete tradeEntryDateInput.dataset.userModified;
                    delete tradeEntryDateInput.dataset.systemGenerated;
                }
                if (tradeStopPercentInput) {
                    delete tradeStopPercentInput.dataset.userModified;
                    delete tradeStopPercentInput.dataset.systemGenerated;
                }
                if (tradeTargetPercentInput) {
                    delete tradeTargetPercentInput.dataset.userModified;
                    delete tradeTargetPercentInput.dataset.systemGenerated;
                }
                if (tradeSideSelect) {
                    delete tradeSideSelect.dataset.userModified;
                    delete tradeSideSelect.dataset.systemGenerated;
                }
                if (tradeSummaryContainer) {
                    delete tradeSummaryContainer.dataset.userModified;
                }
            } else {
                if (tradeStopInput) {
                    tradeStopInput.dataset.userModified = tradeStopInput.dataset.userModified || 'true';
                }
                if (tradeTargetInput) {
                    tradeTargetInput.dataset.userModified = tradeTargetInput.dataset.userModified || 'true';
                }
                if (tradeEntryDateInput) {
                    tradeEntryDateInput.dataset.userModified = tradeEntryDateInput.dataset.userModified || 'true';
                }
                if (tradeStopPercentInput) {
                    tradeStopPercentInput.dataset.userModified = tradeStopPercentInput.dataset.userModified || 'true';
                }
                if (tradeTargetPercentInput) {
                    tradeTargetPercentInput.dataset.userModified = tradeTargetPercentInput.dataset.userModified || 'true';
                }
                if (tradeSideSelect) {
                    tradeSideSelect.dataset.userModified = tradeSideSelect.dataset.userModified || 'true';
                }
            }

            if (tradesMode === 'add' && tradeEntryDateInput && !tradeEntryDateInput.value) {
                ModalManagerV2.assignDefaultDateValue(tradeEntryDateInput);
            }

            scheduleTradeFinalize();
        }
        
        // For Alerts modal - handle ticker selection
        if (modalId === 'alertsModal') {
            const tickerSelect = modalElement.querySelector('#alertTicker');
            // Only process if it's a select element (alertTicker might be a display field)
            if (tickerSelect && tickerSelect.tagName === 'SELECT') {
                // Save original before cloning
                const originalTickerSelect = tickerSelect;
                
                // Remove existing listeners
                const newTickerSelect = tickerSelect.cloneNode(true);
                tickerSelect.parentNode.replaceChild(newTickerSelect, tickerSelect);
                
                // Restore value after clone (critical for edit mode!)
                this._restoreSelectValueAfterClone(originalTickerSelect, newTickerSelect, 'alertTicker');
                
                // Add change listener
                newTickerSelect.addEventListener('change', async (e) => {
                    const tickerId = e.target.value;
                    if (tickerId && window.loadAlertTickerInfo) {
                        await window.loadAlertTickerInfo(tickerId);
                    }
                });
            }
        }

        if (modalId === 'tradesModal') {
            if (typeof window.setupTradeConditionsButton === 'function') {
                try {
                    window.setupTradeConditionsButton(modalElement);
                } catch (error) {
                    window.Logger?.warn('⚠️ Failed to initialize trade conditions controls', { error, page: 'modal-manager-v2' });
                }
            }
        }

        // For Trading Accounts modal - disable currency field in edit mode
        if (modalId === 'tradingAccountsModal') {
            const form = modalElement.querySelector('#tradingAccountsModalForm');
            const mode = form?.dataset?.mode || modalElement.dataset?.mode || 'add';
            const currencyField = modalElement.querySelector('#accountCurrency');
            
            if (currencyField) {
                if (mode === 'edit') {
                    currencyField.disabled = true;
                    currencyField.classList.add('form-control-disabled');
                    console.log(`✅ Disabled accountCurrency field in edit mode (initializeSpecialHandlers)`);
                } else {
                    currencyField.disabled = false;
                    currencyField.classList.remove('form-control-disabled');
                    console.log(`✅ Enabled accountCurrency field in add mode (initializeSpecialHandlers)`);
                }
            }
        }

        // For Tickers modal - load provider symbol fields
        if (modalId === 'tickersModal') {
            // Load provider symbol fields when modal is shown
            if (typeof window.loadProviderSymbolFields === 'function') {
                (async () => {
                    try {
                        await window.loadProviderSymbolFields();
                        
                        // If in edit mode, load existing mappings
                        const form = modalElement.querySelector('#tickersModalForm');
                        const mode = form?.dataset?.mode || modalElement.dataset?.mode || 'add';
                        if (mode === 'edit') {
                            const tickerIdInput = modalElement.querySelector('#tickerId');
                            if (tickerIdInput && tickerIdInput.value) {
                                const tickerId = parseInt(tickerIdInput.value);
                                if (tickerId && typeof window.loadTickerProviderSymbols === 'function') {
                                    await window.loadTickerProviderSymbols(tickerId);
                                }
                            }
                        }
                    } catch (error) {
                        window.Logger?.warn('⚠️ Failed to load provider symbol fields', { error, page: 'modal-manager-v2' });
                    }
                })();
            }
        }

        if (modalId === 'cashFlowModal') {
            // Date fields are now handled by applyRemainingDefaults which processes defaultTime: 'now'
            // This handler only needs to manage account-currency relationship
            
            // Handle account selection - update currency to account's primary currency
            const accountSelects = [
                modalElement.querySelector('#cashFlowAccount'),
                modalElement.querySelector('#currencyExchangeAccount')
            ];
            
            accountSelects.forEach(accountSelect => {
                if (accountSelect) {
                    // Save value BEFORE cloning (critical!)
                    const originalSelect = accountSelect;
                    
                    // Remove existing listeners
                    const newAccountSelect = accountSelect.cloneNode(true);
                    accountSelect.parentNode.replaceChild(newAccountSelect, accountSelect);
                    
                    // Restore the value after cloning (critical for edit mode!)
                    this._restoreSelectValueAfterClone(originalSelect, newAccountSelect, originalSelect.id);
                    
                    // Add change listener
                    newAccountSelect.addEventListener('change', async (e) => {
                        const accountId = e.target.value;
                        if (accountId) {
                            try {
                                // Fetch account details
                                const response = await fetch(`/api/trading-accounts/${accountId}`);
                                if (response.ok) {
                                    const data = await response.json();
                                    const account = data.data || data;
                                    
                                    // Update currency field to account's primary currency
                                    if (account.primary_currency_id) {
                                        // Find the currency field in the same tab
                                        const tabPane = accountSelect.closest('.tab-pane');
                                        const currencyField = tabPane 
                                            ? tabPane.querySelector('#cashFlowCurrency, #currencyExchangeCurrency')
                                            : modalElement.querySelector('#cashFlowCurrency, #currencyExchangeCurrency');
                                        
                                        if (currencyField && currencyField.tagName === 'SELECT') {
                                            // Check if the currency option exists
                                            const optionExists = Array.from(currencyField.options).some(
                                                opt => opt.value == account.primary_currency_id
                                            );
                                            
                                            if (optionExists) {
                                                currencyField.value = account.primary_currency_id;
                                                console.log(`✅ Updated currency to account's primary currency: ${account.primary_currency_id}`);
                                            } else {
                                                console.warn(`⚠️ Currency ${account.primary_currency_id} not found in currency select`);
                                            }
                                        }
                                    }
                                }
                            } catch (error) {
                                console.warn('Error fetching account details:', error);
                            }
                        }
                    });
                    
                    // Trigger change event if account is already selected (for initial load)
                    if (newAccountSelect.value && mode !== 'edit') {
                        newAccountSelect.dispatchEvent(new Event('change'));
                    }
                }
            });
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
        
        // Fix ARIA accessibility: Remove aria-hidden from focused elements before closing
        // This prevents the warning about aria-hidden on elements with focus
        const activeElement = document.activeElement;
        if (activeElement && modalElement.contains(activeElement)) {
            // If the active element is inside the modal, blur it first
            if (typeof activeElement.blur === 'function') {
                activeElement.blur();
            }
            // Remove aria-hidden from active element if it exists
            if (activeElement.hasAttribute('aria-hidden')) {
                activeElement.removeAttribute('aria-hidden');
            }
        }
        
        if (this.modals.has(modalId)) {
            this.modals.get(modalId).isActive = false;
        }
        
        if (this.activeModal === modalId) {
            this.activeModal = null;
        }
        
        if (modalId === 'alertsModal') {
            this.alertsContext = {
                ticker: null,
                linkedEntity: null
            };
        }
        
        // ניקוי rich-text editors
        const form = modalElement.querySelector('form');
        if (form) {
            // ניקוי rich-text editors
            if (window.RichTextEditorService) {
                const richTextContainers = form.querySelectorAll('.rich-text-editor-container');
                richTextContainers.forEach(container => {
                    if (container.id) {
                        window.RichTextEditorService.destroyEditor(container.id);
                    }
                });
            }
            
            // ניקוי שגיאות ולידציה
            this.clearValidationErrors(form);
        }
        
        if (!window.ModalNavigationService?.registerModalClose && window.registerModalNavigationClose) {
            window.registerModalNavigationClose(modalId);
        }

        this.updateGlobalBackdropVisibility();
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
        
        // Check if config has tabs
        const hasTabs = config.tabs && Array.isArray(config.tabs) && config.tabs.length > 0;
        
        if (hasTabs) {
            // Validate tabs structure
            for (const tab of config.tabs) {
                if (!tab.id) {
                    throw new Error('Tab ID is required for each tab');
                }
                if (!tab.fields || !Array.isArray(tab.fields)) {
                    throw new Error(`Fields array is required for tab "${tab.id}"`);
                }
            }
            // For tabs, we need at least one save function (onSave or tab-specific onSave)
            if (!config.onSave && !config.tabs.some(tab => tab.onSave)) {
                throw new Error('Save function is required (onSave or tab-specific onSave)');
            }
        } else {
            // No tabs - validate direct fields
            if (!config.fields || !Array.isArray(config.fields)) {
                throw new Error('Fields array is required');
            }
            
            if (!config.onSave) {
                throw new Error('Save function is required');
            }
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
        const parser = new DOMParser();
        const doc = parser.parseFromString(modalHTML, 'text/html');
        const tempDiv = doc.body;
        
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
        
        // If title is explicitly provided in config, use it
        if (config.title && config.title[mode]) {
            titleElement.textContent = config.title[mode];
            return;
        }
        
        // Otherwise, generate title from entityType (translate to Hebrew)
        let entityLabel = config.entityType;
        
        // Try to get Hebrew label from ENTITY_LABELS (modal-navigation-manager)
        if (window.ModalNavigationService && typeof window.ModalNavigationService.getEntityLabel === 'function') {
            entityLabel = window.ModalNavigationService.getEntityLabel(config.entityType) || entityLabel;
        } else if (window.LinkedItemsService && typeof window.LinkedItemsService.getEntityLabel === 'function') {
            entityLabel = window.LinkedItemsService.getEntityLabel(config.entityType) || entityLabel;
        } else {
            // Fallback: use ENTITY_LABELS from modal-navigation-manager if available
            const ENTITY_LABELS = {
                ticker: 'טיקר',
                trade: 'טרייד',
                trade_plan: 'תכנון',
                execution: 'ביצוע',
                trading_account: 'חשבון מסחר',
                account: 'חשבון מסחר',
                alert: 'התראה',
                cash_flow: 'תזרים מזומנים',
                note: 'הערה'
            };
            entityLabel = ENTITY_LABELS[config.entityType] || entityLabel;
        }
        
        const modePrefix = mode === 'add' ? 'הוספת' : mode === 'edit' ? 'עריכת' : 'צפייה ב';
        const title = `${modePrefix} ${entityLabel}`;
        
        titleElement.textContent = title;
        
        // עדכון navigation UI אחרי עדכון הכותרת
        if (window.ModalNavigationService?.updateModalMetadata) {
            window.ModalNavigationService.updateModalMetadata(modalElement.id, { title });
        }

        if (window.modalNavigationManager?.updateModalNavigation) {
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

    bindDismissButtons(modalElement) {
        if (!modalElement) {
            return;
        }

        const dismissButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"]');
        dismissButtons.forEach((button) => {
            if (!button || button.dataset.modalDismissBound === 'true') {
                return;
            }

            button.addEventListener('click', (event) => {
                if (button.dataset && button.dataset.preventAutoClose === 'true') {
                    return;
                }

                // אל תפריע לפעולות נוספות (למשל שמירה)
                event.preventDefault();
                event.stopPropagation();

                const instance =
                    bootstrap?.Modal?.getInstance(modalElement) ||
                    bootstrap?.Modal?.getOrCreateInstance(modalElement, { backdrop: false, keyboard: true });

                if (instance?.hide) {
                    instance.hide();
                } else {
                    modalElement.classList.remove('show');
                    modalElement.style.display = 'none';
                    modalElement.setAttribute('aria-hidden', 'true');
                    modalElement.removeAttribute('aria-modal');
                    modalElement.dispatchEvent(new Event('hidden.bs.modal'));
                }
            });

            button.dataset.modalDismissBound = 'true';
        });
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
        
                // טיפול מיוחד בהערות עם קישור דרך related_type_id
        const noteRelatedTypeField = form.querySelector('#noteRelatedType');
        const noteRelatedObjectField = form.querySelector('#noteRelatedObject');
        
        // מילוי noteRelatedType ו-noteRelatedObject אם קיימים
        if (noteRelatedTypeField && data.related_type_id) {
            noteRelatedTypeField.value = data.related_type_id;
            
            // הפעלת השדה אם יש related_type_id
            if (noteRelatedObjectField) {
                noteRelatedObjectField.disabled = false;
                noteRelatedObjectField.removeAttribute('disabled');
            }
            
            // מילוי ישיר של noteRelatedObject עם האופציות המלאות
            // לא נסמוך על event כי ה-handler עדיין לא רשום
            if (noteRelatedObjectField && data.related_id) {
                // קרא ישירות ל-populateNoteRelatedObjects עם ה-related_id
                await this.populateNoteRelatedObjects(form, data.related_type_id, data.related_id);
                console.log(`✅ Populated noteRelatedObject with options for type ${data.related_type_id}, selected: ${data.related_id}`);
            } else if (noteRelatedObjectField) {
                // גם אם אין related_id, עדיין נמלא את האופציות
                await this.populateNoteRelatedObjects(form, data.related_type_id, null);
                console.log(`✅ Populated noteRelatedObject with options for type ${data.related_type_id}`);
            }
        }
        
        // מילוי related_type_id ו-related_id אם קיימים
        if (alertRelatedTypeField && data.related_type_id) {
            // עכשיו זה select ולא radio
            alertRelatedTypeField.value = data.related_type_id;
            console.log(`✅ Set alertRelatedType to: ${data.related_type_id}`);
            // הפעלת select האובייקטים המקושרים
            if (alertRelatedObjectField) {
                alertRelatedObjectField.disabled = false;
                alertRelatedObjectField.removeAttribute('disabled');
                // טעינת האובייקטים לפי סוג השיוך
                await this.populateAlertRelatedObjects(form, data.related_type_id, data.related_id);
                
                // עדכון טיקר אוטומטי מהאובייקט המקושר
                if (data.related_id) {
                    await this.updateAlertTickerFromRelatedObject(form, data.related_type_id, data.related_id);
                }
            }
        } else {
            if (alertRelatedObjectField) {
                alertRelatedObjectField.disabled = true;
                alertRelatedObjectField.setAttribute('disabled', 'disabled');
                alertRelatedObjectField.textContent = '';
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'בחר אובייקט...';
                alertRelatedObjectField.appendChild(option);
            }

            if (alertTickerField && data.ticker_id) {
                // אם יש ticker_id ישיר (ללא related object), עדיין נציג אותו
                await this.updateAlertTickerDisplay(form, data.ticker_id);
            }
        }
        
                // עדכון שדה מצב משולב (status + is_triggered) אם יש
        const alertStatusCombinedField = form.querySelector('#alertStatusCombined');                                                                            
        if (alertStatusCombinedField && data.status !== undefined && data.is_triggered !== undefined) {                                                         
            const status = data.status || 'open';
            const isTriggered = data.is_triggered || 'false';
            const combinedValue = this.getCombinedAlertState(status, isTriggered);
            
            if (combinedValue) {
                alertStatusCombinedField.value = combinedValue;
                console.log(`✅ Set alertStatusCombined to: ${combinedValue} (status: ${status}, is_triggered: ${isTriggered})`);                               
            } else {
                console.warn(`⚠️ Could not determine combined state for status=${status}, is_triggered=${isTriggered}, using default`);
                alertStatusCombinedField.value = 'new';
            }
        }
    }
    
    /**
     * Get combined alert state from status and is_triggered
     * Maps status + is_triggered to combined state values
     * @param {string} status - Alert status (open, closed, cancelled)
     * @param {string} isTriggered - Triggered flag (false, new, true)
     * @returns {string|null} Combined state or null if invalid
     * @private
     */
    getCombinedAlertState(status, isTriggered) {
        // Mapping according to getAlertState logic:
        // open + false = 'new'
        // open + new = 'active'
        // closed + new = 'unread'
        // closed + true = 'read'
        // cancelled + false = 'cancelled'
        
        if (status === 'open' && isTriggered === 'false') {
            return 'new';
        }
        if (status === 'open' && isTriggered === 'new') {
            return 'active';
        }
        if (status === 'closed' && isTriggered === 'new') {
            return 'unread';
        }
        if (status === 'closed' && isTriggered === 'true') {
            return 'read';
        }
        if (status === 'cancelled' && isTriggered === 'false') {
            return 'cancelled';
        }
        
        return null;
    }
    
    /**
     * Parse combined alert state to status and is_triggered
     * Maps combined state values back to status + is_triggered
     * @param {string} combinedState - Combined state (new, active, unread, read, cancelled)
     * @returns {Object|null} {status, is_triggered} or null if invalid
     * @private
     */
    parseCombinedAlertState(combinedState) {
        const mapping = {
            'new': { status: 'open', is_triggered: 'false' },
            'active': { status: 'open', is_triggered: 'new' },
            'unread': { status: 'closed', is_triggered: 'new' },
            'read': { status: 'closed', is_triggered: 'true' },
            'cancelled': { status: 'cancelled', is_triggered: 'false' }
        };
        
        return mapping[combinedState] || null;
    }
    
    /**
     * Update alert ticker display from related object
     * @private
     */
    async updateAlertTickerFromRelatedObject(form, relatedTypeId, relatedId) {
        try {
            window.Logger?.info?.('🔎 [updateAlertTickerFromRelatedObject] start', {
                relatedTypeId,
                relatedId
            }, { page: 'modal-manager-v2' });
            
            let tickerId = null;
            let linkedEntity = null;
            
            // שליפת ticker_id מהאובייקט המקושר
            if (relatedTypeId === '2' || relatedTypeId === 2) { // trade
                const response = await fetch(`/api/trades/${relatedId}`);
                if (response.ok) {
                    const result = await response.json();
                    const tradeData = result.data || result;
                    tickerId = tradeData?.ticker_id;
                    linkedEntity = {
                        type: 'trade',
                        data: tradeData
                    };
                }
            } else if (relatedTypeId === '3' || relatedTypeId === 3) { // trade_plan
                const response = await fetch(`/api/trade-plans/${relatedId}`);
                if (response.ok) {
                    const result = await response.json();
                    const planData = result.data || result;
                    tickerId = planData?.ticker_id;
                    linkedEntity = {
                        type: 'trade_plan',
                        data: planData
                    };
                }
            } else if (relatedTypeId === '4' || relatedTypeId === 4) { // ticker
                tickerId = relatedId;
                let tickerData = null;
                if (window.tickersData && Array.isArray(window.tickersData)) {
                    tickerData = window.tickersData.find(t => String(t.id) === String(relatedId)) || null;
                }
                linkedEntity = {
                    type: 'ticker',
                    data: tickerData || { id: relatedId }
                };
            } else if (relatedTypeId === '1' || relatedTypeId === 1) { // trading account
                if (window.accountsData && Array.isArray(window.accountsData)) {
                    const accountData = window.accountsData.find(acc => String(acc.id) === String(relatedId)) || null;
                    linkedEntity = {
                        type: 'trading_account',
                        data: accountData || { id: relatedId }
                    };
                } else {
                    linkedEntity = {
                        type: 'trading_account',
                        data: { id: relatedId }
                    };
                }
            }
            
            this.handleAlertLinkedEntityUpdate(linkedEntity);
            
            window.Logger?.info?.('🔎 [updateAlertTickerFromRelatedObject] resolved tickerId', {
                tickerId
            }, { page: 'modal-manager-v2' });
            
            // עדכון תצוגת הטיקר
            await this.updateAlertTickerDisplay(form, tickerId);
            this.updateAlertDefaultMessage(form);
        } catch (error) {
            console.warn('⚠️ Error updating ticker from related object:', error);
            window.Logger?.error?.('❌ [updateAlertTickerFromRelatedObject] failed', {
                error: error?.message || error
            }, { page: 'modal-manager-v2' });
            await this.updateAlertTickerDisplay(form, null);
            this.handleAlertLinkedEntityUpdate(null);
        }
    }
    
    /**
     * עדכון תצוגת הטיקר במודל התראות באמצעות המימוש הקיים במודול ההתראות
     * @private
     */
    async updateAlertTickerDisplay(form, tickerId) {
        if (window.Logger && typeof window.Logger.info === 'function') {
            window.Logger.info('🔍 [updateAlertTickerDisplay] invoked', {
                tickerId,
                hasLoadFn: typeof window.loadAlertTickerInfo,
                formHasTicker: !!form?.querySelector?.('#alertTicker'),
                formHasInfo: !!form?.querySelector?.('#alertTickerInfo')
            }, { page: 'modal-manager-v2' });
        }
        
        const tickerDisplay = form.querySelector('#alertTicker');
        const tickerInfo = form.querySelector('#alertTickerInfo');
        
        if (!tickerDisplay && !tickerInfo) {
            if (window.Logger && typeof window.Logger.warn === 'function') {
                window.Logger.warn('⚠️ [updateAlertTickerDisplay] Elements not found on form', {
                    tickerId
                }, { page: 'modal-manager-v2' });
            }
            return;
        }
        
        if (!tickerId) {
            tickerDisplay && (tickerDisplay.textContent = '-');
            if (tickerInfo) {
                tickerInfo.textContent = '';
            }
            
            if (typeof window.clearAlertTickerInfo === 'function') {
                window.clearAlertTickerInfo();
            }
            window.Logger?.info?.('ℹ️ [updateAlertTickerDisplay] Cleared ticker display', {}, { page: 'modal-manager-v2' });
            this.handleAlertTickerDataUpdate(null);
            return;
        }
        
        if (typeof window.loadAlertTickerInfo === 'function') {
            window.Logger?.info?.('🔄 [updateAlertTickerDisplay] Delegating to loadAlertTickerInfo', { tickerId }, { page: 'modal-manager-v2' });
            await window.loadAlertTickerInfo(tickerId);
            return;
        }
        
        // Fallback מקומי במידה והמודול הישן עדיין לא נטען
        try {
            const response = await fetch(`/api/tickers/${tickerId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ticker ${tickerId}`);
            }
            const result = await response.json();
            const ticker = result.data || result;
            this.handleAlertTickerDataUpdate(ticker);
            
            window.Logger?.info?.('✅ [updateAlertTickerDisplay] Fallback fetched ticker', {
                tickerId: ticker?.id || tickerId,
                symbol: ticker?.symbol,
                hasRenderer: !!(window.FieldRendererService && window.FieldRendererService.renderTickerInfo)
            }, { page: 'modal-manager-v2' });
            
            if (tickerDisplay) {
                tickerDisplay.textContent = ticker.symbol || 'לא מוגדר';
            }
            if (tickerInfo) {
                if (window.FieldRendererService && typeof window.FieldRendererService.renderTickerInfo === 'function') {
                    tickerInfo.textContent = '';
                    const tickerHTML = window.FieldRendererService.renderTickerInfo(ticker);
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(tickerHTML, 'text/html');
                    doc.body.childNodes.forEach(node => {
                        tickerInfo.appendChild(node.cloneNode(true));
                    });
                } else {
                    tickerInfo.textContent = '';
                    const container = document.createElement('div');
                    container.className = 'ticker-info-display';
                    const flexDiv = document.createElement('div');
                    flexDiv.className = 'd-flex flex-wrap align-items-center gap-2';
                    const strong = document.createElement('strong');
                    strong.textContent = `${(ticker.currency_symbol || '$')}${(ticker.current_price || 0).toFixed(2)}`;
                    flexDiv.appendChild(strong);
                    const changeSpan = document.createElement('span');
                    changeSpan.className = (ticker.daily_change || 0) >= 0 ? 'text-success' : 'text-danger';
                    changeSpan.textContent = `${(ticker.daily_change || 0) >= 0 ? '↗' : '↘'} ${(ticker.daily_change || 0).toFixed(2)} (${(ticker.daily_change_percent || 0).toFixed(2)}%)`;
                    flexDiv.appendChild(changeSpan);
                    const volumeSpan = document.createElement('span');
                    volumeSpan.className = 'text-muted small';
                    volumeSpan.textContent = `נפח: ${(ticker.volume || 0).toLocaleString('he-IL')}`;
                    flexDiv.appendChild(volumeSpan);
                    container.appendChild(flexDiv);
                    tickerInfo.appendChild(container);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error loading ticker info (fallback):', error);
            tickerDisplay && (tickerDisplay.textContent = 'שגיאה בטעינת טיקר');
            if (tickerInfo) {
                tickerInfo.textContent = '';
                const small = document.createElement('small');
                small.className = 'text-muted';
                small.textContent = 'לא ניתן לטעון פרטי טיקר';
                tickerInfo.appendChild(small);
            }
            window.Logger?.error?.('❌ [updateAlertTickerDisplay] Fallback failed', {
                tickerId,
                error: error?.message || error
            }, { page: 'modal-manager-v2' });
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
                    endpoint = '/api/trading-accounts/'; // Fixed: use hyphen instead of underscore
                    valueField = 'id';
                    textField = 'name';
                    break;
                case 2: // trade
                    endpoint = '/api/trades/';
                    valueField = 'id';
                    textField = 'symbol';
                    break;
                case 3: // trade_plan
                    endpoint = '/api/trade-plans/';
                    valueField = 'id';
                    textField = 'symbol';
                    break;
                case 4: // ticker
                    endpoint = '/api/tickers/';
                    valueField = 'id';
                    textField = 'symbol';
                    break;
                default:
                    return;
            }
            
            const response = await fetch(endpoint);
            if (!response.ok) {
                console.warn(`⚠️ Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
                return;
            }
            
            const result = await response.json();
            const items = result.data || result || [];
            
            // ניקוי ה-select
            alertRelatedObjectField.textContent = '';
            
            // הוספת אופציה ריקה
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'בחר אובייקט...';
            alertRelatedObjectField.appendChild(emptyOption);
            
            // הוספת כל האובייקטים
            items.forEach((item) => {
                const option = document.createElement('option');
                option.value = item[valueField];
                
                // יצירת טקסט תצוגה מתאים
                let displayText = '';
                
                // Convert relatedTypeId to number for comparison
                const typeId = parseInt(relatedTypeId);
                
                if (typeId === 2) {
                    // עבור טרייד - צריך להתאים בדיוק לפורמט בטבלה: טרייד | טיקר | צד | סוג השקעה | תאריך
                    // הפורמט בטבלה הוא: טרייד | AAPL | Long | swing | 15.8.2025 (בלי אייקון 🔗)
                    let tickerSymbol = 'לא מוגדר';
                    if (item.ticker_symbol) {
                        tickerSymbol = item.ticker_symbol;
                    } else if (item.ticker?.symbol) {
                        tickerSymbol = item.ticker.symbol;
                    } else if (item.ticker_id && window.tickersData) {
                        const ticker = window.tickersData.find(t => t.id === item.ticker_id);
                        if (ticker) {
                            tickerSymbol = ticker.symbol || 'לא מוגדר';
                        }
                    }
                    
                    const side = item.side || 'לא מוגדר';
                    const investmentType = item.investment_type || 'לא מוגדר';
                    const date = item.created_at || item.opened_at || item.date;
                    const formattedDate = date ? (window.formatDate ? window.formatDate(date) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(date) : new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }))) : 'לא מוגדר';
                    displayText = `טרייד | ${tickerSymbol} | ${side} | ${investmentType} | ${formattedDate}`;
                } else if (typeId === 3) {
                    // עבור תוכנית - צריך להתאים בדיוק לפורמט בטבלה: תוכנית | טיקר | צד | סוג השקעה | תאריך
                    // הפורמט בטבלה הוא: תוכנית | TSLA | Short | passive | 15.8.2025 (בלי אייקון 🔗)
                    let tickerSymbol = 'לא מוגדר';
                    if (item.ticker?.symbol) {
                        tickerSymbol = item.ticker.symbol;
                    } else if (item.ticker_symbol) {
                        tickerSymbol = item.ticker_symbol;
                    } else if (item.ticker_id && window.tickersData) {
                        const ticker = window.tickersData.find(t => t.id === item.ticker_id);
                        if (ticker) {
                            tickerSymbol = ticker.symbol || 'לא מוגדר';
                        }
                    }
                    
                    const side = item.side || 'לא מוגדר';
                    const investmentType = item.investment_type || 'לא מוגדר';
                    const date = item.created_at || item.date;
                    const formattedDate = date ? (window.formatDate ? window.formatDate(date) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(date) : new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }))) : 'לא מוגדר';
                    displayText = `תוכנית | ${tickerSymbol} | ${side} | ${investmentType} | ${formattedDate}`;
                } else if (typeId === 1) {
                    // עבור חשבון - שם + מטבע
                    const currency = item.currency_symbol || item.currency_name || item.currency?.symbol || item.currency || 'ILS';
                    displayText = `${item.name || 'לא מוגדר'} (${currency})`;
                } else if (typeId === 4) {
                    // עבור טיקר - סימבול + שם
                    const symbol = item.symbol || 'לא מוגדר';
                    const name = item.name ? ` - ${item.name}` : '';
                    displayText = `${symbol}${name}`;
                } else {
                    // Fallback
                    displayText = item[textField] || `ID: ${item.id}`;
                }
                
                option.textContent = displayText;
                if (selectedRelatedId && item[valueField] == selectedRelatedId) {
                    option.selected = true;
                }
                alertRelatedObjectField.appendChild(option);
            });

            if (selectedRelatedId) {
                const normalizedSelectedId = String(selectedRelatedId);
                const hasOption = Array.from(alertRelatedObjectField.options).some(
                    opt => opt.value === normalizedSelectedId
                );
                if (hasOption) {
                    alertRelatedObjectField.value = normalizedSelectedId;
                }
            }

            console.log(`✅ Populated alertRelatedObject with ${items.length} items for type ${relatedTypeId}`);
        } catch (error) {
            console.warn('⚠️ Error populating alert related objects:', error);
        }
    }

    /**
     * Populate note related objects select - מילוי select של אובייקטים מקושרים להערה
     * Similar to populateAlertRelatedObjects but for notes
     * 
     * @param {HTMLElement} form - אלמנט הטופס
     * @param {string} relatedTypeId - מזהה סוג הקישור (1=account, 2=trade, 3=trade_plan, 4=ticker)
     * @param {number|null} selectedRelatedId - מזהה האובייקט שנבחר (לעריכה)
     * @private
     */
    async populateNoteRelatedObjects(form, relatedTypeId, selectedRelatedId = null) {
        const noteRelatedObjectField = form.querySelector('#noteRelatedObject');
        if (!noteRelatedObjectField) return;
        
        try {
            let endpoint = '';
            let valueField = 'id';
            let textField = 'name';
            
            switch (parseInt(relatedTypeId)) {
                case 1: // account
                    endpoint = '/api/trading-accounts/'; // Fixed: use hyphen instead of underscore
                    valueField = 'id';
                    textField = 'name';
                    break;
                case 2: // trade
                    endpoint = '/api/trades/';
                    valueField = 'id';
                    textField = 'symbol';
                    break;
                case 3: // trade_plan
                    endpoint = '/api/trade-plans/';
                    valueField = 'id';
                    textField = 'symbol';
                    break;
                case 4: // ticker
                    endpoint = '/api/tickers/';
                    valueField = 'id';
                    textField = 'symbol';
                    break;
                default:
                    return;
            }
            
            console.log(`🔍 Fetching ${endpoint} for relatedTypeId ${relatedTypeId}`);
            const response = await fetch(endpoint);
            if (!response.ok) {
                console.warn(`⚠️ Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
                return;
            }
            
            const result = await response.json();
            const items = result.data || result || [];
            console.log(`📊 Received ${items.length} items from ${endpoint}`);
            
            // Debug: Log first item to see structure
            if (items.length > 0 && (relatedTypeId === 2 || relatedTypeId === 3)) {
                console.log(`🔍 [DEBUG] First item structure for type ${relatedTypeId}:`, items[0]);
                console.log(`🔍 [DEBUG] Available fields in first item:`, Object.keys(items[0]));
                console.log(`🔍 [DEBUG] ticker_id:`, items[0].ticker_id);
                console.log(`🔍 [DEBUG] ticker object:`, items[0].ticker);
                console.log(`🔍 [DEBUG] ticker_symbol:`, items[0].ticker_symbol);
                console.log(`🔍 [DEBUG] side:`, items[0].side);
                console.log(`🔍 [DEBUG] investment_type:`, items[0].investment_type);
                console.log(`🔍 [DEBUG] created_at:`, items[0].created_at);
                console.log(`🔍 [DEBUG] window.tickersData available:`, !!window.tickersData);
                if (window.tickersData) {
                    console.log(`🔍 [DEBUG] window.tickersData length:`, window.tickersData.length);
                }
            }
            
            // ניקוי ה-select
            noteRelatedObjectField.textContent = '';
            
            // הוספת אופציה ריקה
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'בחר אובייקט...';
            noteRelatedObjectField.appendChild(emptyOption);
            
            // הוספת כל האובייקטים
            items.forEach((item, index) => {
                const option = document.createElement('option');
                option.value = item[valueField];
                
                // יצירת טקסט תצוגה מתאים
                let displayText = '';
                
                // Convert relatedTypeId to number for comparison
                const typeId = parseInt(relatedTypeId);
                
                if (typeId === 2) {
                    // עבור טרייד - צריך להתאים בדיוק לפורמט בטבלה: טרייד | טיקר | צד | סוג השקעה | תאריך
                    // הפורמט בטבלה הוא: טרייד | AAPL | Long | swing | 15.8.2025 (בלי אייקון 🔗)
                    // צריך לקבל את הטיקר מתוך item.ticker_id או item.ticker
                    let tickerSymbol = 'לא מוגדר';
                    if (item.ticker_symbol) {
                        tickerSymbol = item.ticker_symbol;
                        console.log(`🔍 [DEBUG] Trade ${index}: Using ticker_symbol = ${tickerSymbol}`);
                    } else if (item.ticker?.symbol) {
                        tickerSymbol = item.ticker.symbol;
                        console.log(`🔍 [DEBUG] Trade ${index}: Using item.ticker.symbol = ${tickerSymbol}`);
                    } else if (item.ticker_id && window.tickersData) {
                        // נסה למצוא את הטיקר מתוך window.tickersData
                        const ticker = window.tickersData.find(t => t.id === item.ticker_id);
                        if (ticker) {
                            tickerSymbol = ticker.symbol || 'לא מוגדר';
                            console.log(`🔍 [DEBUG] Trade ${index}: Found ticker in window.tickersData: ${tickerSymbol}`);
                        } else {
                            console.warn(`⚠️ [DEBUG] Trade ${index}: ticker_id=${item.ticker_id} but not found in window.tickersData`);
                        }
                    } else {
                        console.warn(`⚠️ [DEBUG] Trade ${index}: No ticker symbol found. ticker_id=${item.ticker_id}, ticker_symbol=${item.ticker_symbol}, ticker=${item.ticker}`);
                    }
                    
                    const side = item.side || 'לא מוגדר';
                    const investmentType = item.investment_type || 'לא מוגדר';
                    const date = item.created_at || item.opened_at || item.date;
                    const formattedDate = date ? (window.formatDate ? window.formatDate(date) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(date) : new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }))) : 'לא מוגדר';
                    displayText = `טרייד | ${tickerSymbol} | ${side} | ${investmentType} | ${formattedDate}`;
                    
                    if (index < 3) { // Log only first 3 for debugging
                        console.log(`🔍 [DEBUG] Trade ${index} display text: "${displayText}"`);
                    }
                } else if (typeId === 3) {
                    // עבור תוכנית - צריך להתאים בדיוק לפורמט בטבלה: תוכנית | טיקר | צד | סוג השקעה | תאריך
                    // הפורמט בטבלה הוא: תוכנית | TSLA | Short | passive | 15.8.2025 (בלי אייקון 🔗)
                    // צריך לקבל את הטיקר מתוך item.ticker_id או item.ticker
                    let tickerSymbol = 'לא מוגדר';
                    if (item.ticker?.symbol) {
                        tickerSymbol = item.ticker.symbol;
                        console.log(`🔍 [DEBUG] TradePlan ${index}: Using item.ticker.symbol = ${tickerSymbol}`);
                    } else if (item.ticker_symbol) {
                        tickerSymbol = item.ticker_symbol;
                        console.log(`🔍 [DEBUG] TradePlan ${index}: Using ticker_symbol = ${tickerSymbol}`);
                    } else if (item.ticker_id && window.tickersData) {
                        // נסה למצוא את הטיקר מתוך window.tickersData
                        const ticker = window.tickersData.find(t => t.id === item.ticker_id);
                        if (ticker) {
                            tickerSymbol = ticker.symbol || 'לא מוגדר';
                            console.log(`🔍 [DEBUG] TradePlan ${index}: Found ticker in window.tickersData: ${tickerSymbol}`);
                        } else {
                            console.warn(`⚠️ [DEBUG] TradePlan ${index}: ticker_id=${item.ticker_id} but not found in window.tickersData`);
                        }
                    } else {
                        console.warn(`⚠️ [DEBUG] TradePlan ${index}: No ticker symbol found. ticker_id=${item.ticker_id}, ticker_symbol=${item.ticker_symbol}, ticker=${item.ticker}`);
                    }
                    
                    const side = item.side || 'לא מוגדר';
                    const investmentType = item.investment_type || 'לא מוגדר';
                    const date = item.created_at || item.date;
                    const formattedDate = date ? (window.formatDate ? window.formatDate(date) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(date) : new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }))) : 'לא מוגדר';
                    displayText = `תוכנית | ${tickerSymbol} | ${side} | ${investmentType} | ${formattedDate}`;
                    
                    if (index < 3) { // Log only first 3 for debugging
                        console.log(`🔍 [DEBUG] TradePlan ${index} display text: "${displayText}"`);
                    }
                } else if (typeId === 1) {
                    // עבור חשבון - שם + מטבע
                    // TradingAccount.to_dict() מחזיר: name, currency_symbol או currency
                    const currency = item.currency_symbol || item.currency_name || item.currency?.symbol || item.currency || 'ILS';
                    displayText = `${item.name || 'לא מוגדר'} (${currency})`;
                } else if (typeId === 4) {
                    // עבור טיקר - סימבול + שם
                    const symbol = item.symbol || 'לא מוגדר';
                    const name = item.name ? ` - ${item.name}` : '';
                    displayText = `${symbol}${name}`;
                } else {
                    // Fallback
                    displayText = item[textField] || `ID: ${item.id}`;
                }
                
                option.textContent = displayText;
                if (selectedRelatedId && item[valueField] == selectedRelatedId) {
                    option.selected = true;
                }
                noteRelatedObjectField.appendChild(option);
            });
            
            console.log(`✅ Populated noteRelatedObject with ${items.length} items for type ${relatedTypeId}`);
            
            // Set the selected value if provided
            if (selectedRelatedId) {
                const selectedValue = String(selectedRelatedId);
                noteRelatedObjectField.value = selectedValue;
                console.log(`✅ Set noteRelatedObject value to: ${selectedValue}`);
                
                // Verify the value was set correctly
                if (noteRelatedObjectField.value !== selectedValue) {
                    console.warn(`⚠️ Value ${selectedValue} was not set correctly, current value: ${noteRelatedObjectField.value}`);
                    // Try to find matching option
                    const matchingOption = Array.from(noteRelatedObjectField.options).find(opt => opt.value === selectedValue);
                    if (matchingOption) {
                        noteRelatedObjectField.value = matchingOption.value;
                        console.log(`✅ Found and set matching option: ${matchingOption.value} (${matchingOption.textContent})`);
                    }
                }
            }
            
            // Debug: Check what was actually added to the select
            const allOptions = noteRelatedObjectField.querySelectorAll('option');
            console.log(`🔍 [DEBUG] Total options in select: ${allOptions.length}`);
            console.log(`🔍 [DEBUG] First 3 options text:`, Array.from(allOptions).slice(0, 3).map(opt => opt.textContent));
            
            // Debug: Compare with what's displayed in the table
            if (window.getRelatedObjectDisplay && relatedTypeId === 2) {
                console.log(`🔍 [DEBUG] Comparing with table display for first trade...`);
                const firstTrade = items[0];
                if (firstTrade) {
                    const tableDisplay = window.getRelatedObjectDisplay(
                        { related_type_id: 2, related_id: firstTrade.id },
                        { trades: [firstTrade], tickers: window.tickersData || [] },
                        { showLink: true, format: 'full' }
                    );
                    console.log(`🔍 [DEBUG] Table display (with 🔗):`, tableDisplay.display);
                    console.log(`🔍 [DEBUG] Dropdown display (first option):`, allOptions[1]?.textContent || 'N/A');
                }
            }
        } catch (error) {
            console.warn('⚠️ Error populating note related objects:', error);
        }
    }

    /**
     * Clean up Bootstrap backdrops - ניקוי backdrops של Bootstrap
     * מונע backdrop כפול על ידי הסרת כל backdrops של Bootstrap חוץ מ-globalModalBackdrop
     * 
     * @private
     */
    _cleanupBootstrapBackdrops() {
        try {
            // מציאת כל ה-backdrops ב-DOM
            const allBackdrops = document.querySelectorAll('.modal-backdrop');
            const backdropsBefore = Array.from(allBackdrops).map(b => ({
                id: b.id,
                className: b.className,
                zIndex: b.style.zIndex || getComputedStyle(b).zIndex,
                hasShowClass: b.classList.contains('show')
            }));
            
            let removedCount = 0;
            const removedBackdrops = [];
            
            // ניקוי כל backdrops חוץ מ-globalModalBackdrop
            allBackdrops.forEach(backdrop => {
                // אם זה לא ה-globalBackdrop שלנו - מחק אותו
                if (backdrop.id !== 'globalModalBackdrop') {
                    removedBackdrops.push({
                        id: backdrop.id || 'no-id',
                        className: backdrop.className,
                        zIndex: backdrop.style.zIndex || getComputedStyle(backdrop).zIndex
                    });
                    window.Logger?.info('🔍 [BACKDROP] Removing Bootstrap backdrop', {
                        backdropId: backdrop.id || 'no-id',
                        backdropClasses: backdrop.className,
                        zIndex: backdrop.style.zIndex || getComputedStyle(backdrop).zIndex,
                        page: 'modal-manager-v2'
                    });
                    backdrop.remove();
                    removedCount++;
                }
            });
            
            const backdropsAfter = Array.from(document.querySelectorAll('.modal-backdrop')).map(b => ({
                id: b.id,
                className: b.className,
                zIndex: b.style.zIndex || getComputedStyle(b).zIndex,
                hasShowClass: b.classList.contains('show')
            }));
            
            if (removedCount > 0 || allBackdrops.length > 0) {
                window.Logger?.info('🔍 [BACKDROP] Cleaned up Bootstrap backdrops', {
                    removedCount,
                    backdropsBefore: backdropsBefore,
                    removedBackdrops: removedBackdrops,
                    backdropsAfter: backdropsAfter,
                    page: 'modal-manager-v2'
                });
            }
            
            return removedCount;
        } catch (error) {
            window.Logger?.warn('🔍 [BACKDROP] Error cleaning up Bootstrap backdrops', {
                error: error?.message,
                page: 'modal-manager-v2'
            });
            return 0;
        }
    }

    ensureGlobalBackdrop() {
        const activeCount = this._getActiveModalCount();
        
        window.Logger?.info('🔍 [BACKDROP] ensureGlobalBackdrop called', {
            activeCount,
            hasGlobalBackdrop: !!this.globalBackdrop,
            globalBackdropInDOM: this.globalBackdrop ? document.body.contains(this.globalBackdrop) : false,
            existingBackdropInDOM: !!document.getElementById('globalModalBackdrop'),
            allBackdropsInDOM: Array.from(document.querySelectorAll('.modal-backdrop')).map(b => ({
                id: b.id,
                className: b.className,
                zIndex: b.style.zIndex || getComputedStyle(b).zIndex,
                hasShowClass: b.classList.contains('show')
            })),
            page: 'modal-manager-v2'
        });

        if (activeCount <= 0) {
            window.Logger?.info('🔍 [BACKDROP] No active modals, updating visibility', {
                activeCount,
                page: 'modal-manager-v2'
            });
            this.updateGlobalBackdropVisibility();
            return;
        }

        // ניקוי backdrops של Bootstrap לפני יצירת globalBackdrop
        const cleanedBackdrops = this._cleanupBootstrapBackdrops();
        window.Logger?.info('🔍 [BACKDROP] Cleaned Bootstrap backdrops', {
            cleanedCount: cleanedBackdrops,
            page: 'modal-manager-v2'
        });

        const backdropExistedBefore = !!this.globalBackdrop && document.body.contains(this.globalBackdrop);
        const existingBackdropInDOM = document.getElementById('globalModalBackdrop');

        if (!this.globalBackdrop || !document.body.contains(this.globalBackdrop)) {
            if (existingBackdropInDOM) {
                window.Logger?.info('🔍 [BACKDROP] Reusing existing backdrop from DOM', {
                    backdropId: existingBackdropInDOM.id,
                    zIndex: existingBackdropInDOM.style.zIndex || getComputedStyle(existingBackdropInDOM).zIndex,
                    page: 'modal-manager-v2'
                });
                this.globalBackdrop = existingBackdropInDOM;
            } else {
                window.Logger?.info('🔍 [BACKDROP] Creating new global backdrop', {
                    page: 'modal-manager-v2'
                });
                const backdrop = document.createElement('div');
                backdrop.id = 'globalModalBackdrop';
                backdrop.className = 'modal-backdrop fade global-modal-backdrop';
                backdrop.addEventListener('click', this.backdropClickHandler, { passive: true });
                document.body.appendChild(backdrop);
                this.globalBackdrop = backdrop;
                
                window.Logger?.info('🔍 [BACKDROP] New global backdrop created and appended', {
                    backdropId: backdrop.id,
                    parentElement: backdrop.parentElement?.tagName || 'none',
                    zIndex: backdrop.style.zIndex || getComputedStyle(backdrop).zIndex,
                    page: 'modal-manager-v2'
                });
            }
        }

        if (this.globalBackdrop) {
            const zIndexBefore = this.globalBackdrop.style.zIndex || getComputedStyle(this.globalBackdrop).zIndex || 'none';
            const hasShowClassBefore = this.globalBackdrop.classList.contains('show');
            
            requestAnimationFrame(() => {
                if (this.globalBackdrop) {
                    this.globalBackdrop.classList.add('show');
                    
                    const zIndexAfter = this.globalBackdrop.style.zIndex || getComputedStyle(this.globalBackdrop).zIndex || 'none';
                    const hasShowClassAfter = this.globalBackdrop.classList.contains('show');
                    
                    window.Logger?.info('🔍 [BACKDROP] Global backdrop show class added', {
                        backdropId: this.globalBackdrop.id,
                        zIndexBefore,
                        zIndexAfter,
                        hasShowClassBefore,
                        hasShowClassAfter,
                        isVisible: this.globalBackdrop.offsetParent !== null,
                        display: getComputedStyle(this.globalBackdrop).display,
                        opacity: getComputedStyle(this.globalBackdrop).opacity,
                        page: 'modal-manager-v2'
                    });
                }
            });
        }

        document.body.classList.add('modal-open');
        if (!document.body.style.overflow) {
            document.body.style.overflow = 'hidden';
        }

        window.Logger?.info('🔍 [BACKDROP] ensureGlobalBackdrop completed', {
            activeCount,
            hasGlobalBackdrop: !!this.globalBackdrop,
            globalBackdropId: this.globalBackdrop?.id,
            globalBackdropZIndex: this.globalBackdrop ? (this.globalBackdrop.style.zIndex || getComputedStyle(this.globalBackdrop).zIndex) : 'none',
            globalBackdropHasShow: this.globalBackdrop ? this.globalBackdrop.classList.contains('show') : false,
            bodyHasModalOpen: document.body.classList.contains('modal-open'),
            page: 'modal-manager-v2'
        });
    }

    updateGlobalBackdropVisibility() {
        const activeCount = this._getActiveModalCount();
        
        // בדיקה מדויקת של מספר המודולים הפתוחים
        const openModals = document.querySelectorAll('.modal.show');
        const actualActiveCount = Array.from(openModals).filter(modal => {
            // בדיקה שהמודל באמת גלוי
            return modal.offsetParent !== null && 
                   getComputedStyle(modal).display !== 'none' &&
                   getComputedStyle(modal).visibility !== 'hidden';
        }).length;
        
        window.Logger?.info('🔍 [BACKDROP] updateGlobalBackdropVisibility called', {
            activeCount,
            actualActiveCount,
            openModalsCount: openModals.length,
            hasGlobalBackdrop: !!this.globalBackdrop,
            globalBackdropInDOM: this.globalBackdrop ? document.body.contains(this.globalBackdrop) : false,
            allBackdropsInDOM: Array.from(document.querySelectorAll('.modal-backdrop')).map(b => ({
                id: b.id,
                className: b.className,
                zIndex: b.style.zIndex || getComputedStyle(b).zIndex,
                hasShowClass: b.classList.contains('show')
            })),
            bodyHasModalOpen: document.body.classList.contains('modal-open'),
            page: 'modal-manager-v2'
        });

        // שימוש במספר המודולים הגלויים בפועל
        if (actualActiveCount > 0) {
            window.Logger?.info('🔍 [BACKDROP] Active modals exist, ensuring backdrop', {
                actualActiveCount,
                page: 'modal-manager-v2'
            });
            this.ensureGlobalBackdrop();
            return;
        }

        // ניקוי כל ה-backdrops אם אין מודולים פתוחים
        this._cleanupBootstrapBackdrops();
        
        if (this.globalBackdrop) {
            const backdrop = this.globalBackdrop;
            const backdropZIndexBefore = backdrop.style.zIndex || getComputedStyle(backdrop).zIndex;
            const hasShowClassBefore = backdrop.classList.contains('show');
            
            window.Logger?.info('🔍 [BACKDROP] Hiding and removing global backdrop', {
                backdropId: backdrop.id,
                zIndexBefore: backdropZIndexBefore,
                hasShowClassBefore,
                actualActiveCount,
                page: 'modal-manager-v2'
            });

            const removeBackdrop = () => {
                backdrop.removeEventListener('transitionend', removeBackdrop);
                
                window.Logger?.info('🔍 [BACKDROP] Removing global backdrop from DOM', {
                    backdropId: backdrop.id,
                    parentNode: backdrop.parentNode?.tagName || 'none',
                    page: 'modal-manager-v2'
                });
                
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
                if (this.globalBackdrop === backdrop) {
                    this.globalBackdrop = null;
                }
                
                // ניקוי נוסף של כל ה-backdrops שנותרו
                this._cleanupBootstrapBackdrops();
                
                window.Logger?.info('🔍 [BACKDROP] Global backdrop removed', {
                    backdropRemoved: !document.body.contains(backdrop),
                    globalBackdropIsNull: !this.globalBackdrop,
                    allBackdropsRemaining: Array.from(document.querySelectorAll('.modal-backdrop')).length,
                    page: 'modal-manager-v2'
                });
            };

            backdrop.classList.remove('show');
            backdrop.addEventListener('transitionend', removeBackdrop, { once: true });
            setTimeout(removeBackdrop, 250);
        }

        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        window.Logger?.info('🔍 [BACKDROP] updateGlobalBackdropVisibility completed', {
            activeCount,
            actualActiveCount,
            bodyHasModalOpen: document.body.classList.contains('modal-open'),
            bodyOverflow: document.body.style.overflow,
            allBackdropsRemaining: Array.from(document.querySelectorAll('.modal-backdrop')).map(b => ({
                id: b.id,
                zIndex: b.style.zIndex || getComputedStyle(b).zIndex
            })),
            page: 'modal-manager-v2'
        });
    }

    handleGlobalBackdropClick(event) {
        if (!event || event.target !== this.globalBackdrop) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.closeActiveModal();
    }

    /**
     * Handle backdrop click - טיפול בלחיצה על backdrop (כל סוגי המודולים)
     * פונקציה מרכזית שפועלת על כל המודולים במערכת - גם Bootstrap וגם custom
     * 
     * @param {Event} event - אירוע הלחיצה
     * @private
     */
    handleBackdropClick(event) {
        if (!event) {
            return;
        }

        const target = event.target;
        
        // בדיקה אם הלחיצה היא על backdrop (Bootstrap או global)
        const isBackdropClick = 
            target.classList.contains('modal-backdrop') || 
            target === this.globalBackdrop;
        
        // בדיקה אם הלחיצה היא על modal element עצמו (לא על התוכן שלו)
        // זה קורה כשלוחצים על הרקע של המודל (מחוץ ל-modal-dialog)
        const modalElement = target.closest('.modal.show');
        const isModalElementClick = 
            modalElement && 
            target === modalElement; // הלחיצה היא על modal element עצמו, לא על תוכן

        if (!isBackdropClick && !isModalElementClick) {
            return;
        }

        // מציאת המודל הפעיל
        let activeModal = null;
        
        if (isBackdropClick) {
            // אם לחיצה על backdrop - מציאת המודל הפעיל
            const openModals = document.querySelectorAll('.modal.show');
            if (openModals.length === 0) {
                return;
            }
            activeModal = openModals[openModals.length - 1];
        } else if (isModalElementClick) {
            // אם לחיצה על modal element עצמו
            activeModal = modalElement;
        }

        if (!activeModal) {
            return;
        }

        // בדיקה אם המודל מאפשר סגירה בלחיצה על הרקע
        // אם יש data-bs-backdrop="static" - לא נסגור
        const backdropSetting = activeModal.getAttribute('data-bs-backdrop');
        if (backdropSetting === 'static') {
            return;
        }

        // בדיקה אם הלחיצה היא על modal-dialog (לא על הרקע)
        // אם כן - לא נסגור (זה תוכן המודל)
        if (isModalElementClick) {
            const modalDialog = activeModal.querySelector('.modal-dialog');
            if (modalDialog && modalDialog.contains(target)) {
                return;
            }
        }

        // סגירת המודל
        event.preventDefault();
        event.stopPropagation();

        // ניסיון לסגור דרך Bootstrap Modal instance
        const modalInstance = bootstrap?.Modal?.getInstance(activeModal);
        if (modalInstance && typeof modalInstance.hide === 'function') {
            modalInstance.hide();
        } else {
            // fallback - סגירה ידנית
            activeModal.classList.remove('show');
            activeModal.style.display = 'none';
            activeModal.setAttribute('aria-hidden', 'true');
            activeModal.removeAttribute('aria-modal');
            activeModal.dispatchEvent(new Event('hidden.bs.modal'));
        }
    }

    _getActiveModalCount() {
        let count = 0;
        this.modals.forEach((modalInfo) => {
            if (modalInfo && modalInfo.isActive) {
                count += 1;
            }
        });
        return count;
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
                    return;
                }
            }
        }
        this.updateGlobalBackdropVisibility();
    }

    /**
     * Hide modal by ID - סגירת מודל לפי מזהה
     * 
     * @param {string} modalId - מזהה המודל לסגירה (אופציונלי - אם לא מוגדר, סוגר את המודל הפעיל)
     * @returns {void}
     */
    hideModal(modalId = null) {
        const targetModalId = modalId || this.activeModal;
        if (!targetModalId) {
            return;
        }

        const modalElement = document.getElementById(targetModalId);
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            } else {
                // אם אין instance, נסה ליצור ולסגור
                const newModal = bootstrap.Modal.getOrCreateInstance(modalElement, { backdrop: false });
                if (newModal) {
                    newModal.hide();
                }
            }
        }

        // עדכון activeModal אם זה המודל הפעיל
        if (this.activeModal === targetModalId) {
            this.activeModal = null;
        }

        this.updateGlobalBackdropVisibility();
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
// showModalSafe helper function - only define if not already defined
if (typeof window.showModalSafe === 'undefined') {
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
    // Helper function created
} else {
    // Helper function already exists - skipping duplicate definition
}

// אתחול אוטומטי כאשר הדף נטען
document.addEventListener('DOMContentLoaded', () => {
    if (!window.ModalManagerV2) {
        new ModalManagerV2();
    }
});

