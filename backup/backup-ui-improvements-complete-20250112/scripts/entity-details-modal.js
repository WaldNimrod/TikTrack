/**
 * Entity Details Modal - TikTrack Entity Details System
 * ===================================================
 *
 * מערכת מתקדמת להצגת פרטי ישויות במערכת TikTrack
 *
 * תכונות עיקריות:
 * - חלון קופץ אחיד לכל סוגי הישויות
 * - הצגת מידע מפורט וקישורים
 * - אינטגרציה עם מערכת הנתונים החיצוניים
 * - תמיכה ב-RTL ועיצוב מתקדם
 * - אינטגרציה עם מערכת ההתראות הגלובלית
 *
 * קובץ: trading-ui/scripts/entity-details-modal.js
 * גרסה: 1.0.0
 * יוצר: Nimrod
 * תאריך יצירה: 4 בספטמבר 2025
 *
 * תלויות:
 * - entity-details-renderer.js (רנדור תצוגות)
 * - entity-details-api.js (קריאות API) 
 * - notification-system.js (התראות גלובליות)
 * - Bootstrap 5.3.0 (מודלים)
 *
 * דוקומנטציה: documentation/features/entity-details-system/README.md
 */

// ===== ENTITY DETAILS MODAL CLASS =====

/**
 * EntityDetailsModal - מחלקה ראשית לניהול חלון קופץ פרטי ישויות
 * 
 * @class EntityDetailsModal
 */
class EntityDetailsModal {
    
    /**
     * Constructor - אתחול מחלקת EntityDetailsModal
     * 
     * @constructor
     */
    constructor() {
        this.modal = null;
        this.modalId = 'entityDetailsModal';
        this.currentEntityType = null;
        this.currentEntityId = null;
        this.isInitialized = false;
        
        // אתחול המערכת
        this.init();
    }

    /**
     * Initialize modal system - אתחול מערכת המודל
     * 
     * @private
     */
    init() {
        try {
            // יצירת מבנה HTML בסיסי למודל
            this.createModalStructure();
            
            // הוספת event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            
            // הוספה לאובייקט הגלובלי
            window.entityDetailsModal = this;
            
            console.info('EntityDetailsModal initialized successfully');
            
        } catch (error) {
            console.error('Error initializing EntityDetailsModal:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה באתחול מערכת פרטי ישויות');
            }
        }
    }

    /**
     * Create modal HTML structure - יצירת מבנה HTML למודל
     * 
     * @private
     */
    createModalStructure() {
        // בדיקה אם המודל כבר קיים
        if (document.getElementById(this.modalId)) {
            this.modal = document.getElementById(this.modalId);
            return;
        }

        // יצירת מבנה HTML למודל
        // Note: No aria-hidden - let Bootstrap manage it to avoid accessibility warnings
        const modalHTML = `
            <div class="modal fade" id="${this.modalId}" tabindex="-1" 
                 aria-labelledby="${this.modalId}Label">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content entity-details-modal">
                        <div class="modal-header modal-header-colored">
                            <h5 class="modal-title" id="${this.modalId}Label">
                                פרטי ישות
                            </h5>
                            <div id="quickActionButtons" class="btn-group btn-group-sm" role="group">
                                <!-- כפתורי פעולות מהירות יוכנסו כאן דינמית -->
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body entity-details-body" id="entityDetailsContent">
                            <div class="entity-details-loading">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">טוען...</span>
                                </div>
                                <p class="mt-3">טוען פרטי ישות...</p>
                            </div>
                        </div>
                        <div class="modal-footer entity-details-footer">
                            <button type="button" class="btn btn-secondary" 
                                    data-bs-dismiss="modal">סגירה</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // הוספה ל-DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // שמירת הפניה למודל
        this.modal = document.getElementById(this.modalId);
    }

    /**
     * Setup event listeners - הגדרת מאזיני אירועים
     * 
     * @private  
     */
    setupEventListeners() {
        if (!this.modal) return;

        // מאזין לסגירת המודל
        this.modal.addEventListener('hidden.bs.modal', () => {
            this.onModalHidden();
        });

        // מאזין למקש ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });

        console.debug('EntityDetailsModal event listeners set up');
    }

    /**
     * Show entity details modal - הצגת חלון קופץ עם פרטי ישות
     * 
     * @param {string} entityType - סוג הישות (ticker, trade, trade_plan, וכו')
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} options - אפשרויות נוספות
     * @public
     */
    async show(entityType, entityId, options = {}) {
        try {
            if (!entityType || (!entityId && entityId !== 0)) {
                throw new Error('חסרים פרמטרים: entityType ו-entityId');
            }

            // בדיקת אתחול
            if (!this.isInitialized) {
                throw new Error('EntityDetailsModal לא אותחל');
            }

            // שמירת מידע נוכחי
            this.currentEntityType = entityType;
            this.currentEntityId = entityId;

            // עדכון כותרת המודל (זמנית עד לטעינת הנתונים)
            const titleElement = document.getElementById(`${this.modalId}Label`);
            if (titleElement) {
                const entityNames = {
                    ticker: 'טיקר',
                    trade: 'טרייד', 
                    trade_plan: 'תכנית השקעה',
                    execution: 'ביצוע עסקה',
                    account: 'חשבון',
                    alert: 'התראה',
                    cash_flow: 'תזרים מזומנים',
                    note: 'הערה'
                };
                const entityName = entityNames[entityType] || 'ישות';
                titleElement.textContent = `פרטי ${entityName} #${entityId}`;
            }

            // הצגת מצב טעינה
            this.showLoadingState();

            // הצגת המודל
            this.showModal();

            // טעינת הנתונים
            await this.loadEntityData(entityType, entityId, options);

        } catch (error) {
            console.error('Error showing entity details modal:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification(`שגיאה בהצגת פרטי ישות: ${error.message}`);
            }
            this.hide();
        }
    }

    /**
     * Hide modal - הסתרת החלון הקופץ
     * 
     * @public
     */
    hide() {
        try {
            if (this.modal && this.isVisible()) {
                const bsModal = bootstrap.Modal.getInstance(this.modal);
                if (bsModal) {
                    bsModal.hide();
                } else {
                    // fallback
                    this.modal.style.display = 'none';
                    this.modal.classList.remove('show');
                    document.body.classList.remove('modal-open');
                }
            }
        } catch (error) {
            console.error('Error hiding entity details modal:', error);
        }
    }

    /**
     * Check if modal is visible - בדיקה אם המודל מוצג
     * 
     * @returns {boolean} - true אם המודל מוצג
     * @public
     */
    isVisible() {
        return this.modal && this.modal.classList.contains('show');
    }

    /**
     * Update modal title - עדכון כותרת המודל
     * 
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות  
     * @private
     */

    /**
     * Show loading state - הצגת מצב טעינה
     * 
     * @private
     */
    showLoadingState() {
        const contentElement = document.getElementById('entityDetailsContent');
        if (!contentElement) return;

        contentElement.innerHTML = `
            <div class="entity-details-loading d-flex flex-column align-items-center justify-content-center" style="min-height: 300px;">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">טוען...</span>
                </div>
                <p class="mt-3 text-muted">טוען פרטי ישות...</p>
            </div>
        `;
    }

    /**
     * Load entity data - טעינת נתוני הישות
     * 
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} options - אפשרויות נוספות
     * @private
     */
    async loadEntityData(entityType, entityId, options = {}) {
        try {
            // בדיקת זמינות API module
            if (!window.entityDetailsAPI) {
                throw new Error('Entity Details API לא נטען');
            }

            // קריאה ל-API לקבלת נתוני הישות
            const entityData = await window.entityDetailsAPI.getEntityDetails(entityType, entityId);

            // בדיקת זמינות Renderer module  
            if (!window.entityDetailsRenderer) {
                throw new Error('Entity Details Renderer לא נטען');
            }

                    // קבלת נתונים חיצוניים עבור טיקרים
        if (entityType === 'ticker' && window.entityDetailsAPI) {
            try {
                const externalData = await window.entityDetailsAPI.getExternalData(entityType, entityData);
                if (externalData) {
                    // שילוב הנתונים החיצוניים עם נתוני הישות
                    entityData = { ...entityData, ...externalData };
                }
            } catch (error) {
                console.debug('Could not load external data for ticker:', error);
            }
        }

        // עדכון כותרת המודל
        this.updateModalTitle(entityType, entityData);

        // רנדור הנתונים
        const renderedContent = window.entityDetailsRenderer.render(entityType, entityData, options);

        // הצגת התוכן ברנדור
        this.showRenderedContent(renderedContent);

        } catch (error) {
            console.error('Error loading entity data:', error);
            this.showErrorState(error.message);
        }
    }

    /**
     * Update modal title - עדכון כותרת המודל
     * 
     * @param {string} entityType - סוג הישות
     * @param {Object} entityData - נתוני הישות
     * @private
     */
    updateModalTitle(entityType, entityData) {
        const titleElement = document.getElementById(`${this.modalId}Label`);
        const headerElement = this.modal?.querySelector('.modal-header');
        
        console.log('🎯 updateModalTitle called:', { entityType, entityData, titleElement, headerElement });
        
        if (!titleElement) {
            console.warn('⚠️ Title element not found:', `${this.modalId}Label`);
            return;
        }
        
        if (!headerElement) {
            console.warn('⚠️ Header element not found');
            return;
        }

        let title = 'פרטי ישות';
        
        if (entityType === 'ticker' && entityData.symbol) {
            title = `פרטי טיקר: ${entityData.symbol}`;
        } else if (entityType === 'trade' && entityData.symbol) {
            title = `פרטי טרייד: ${entityData.symbol}`;
        } else if (entityType === 'trade_plan' && entityData.symbol) {
            title = `פרטי תכנית: ${entityData.symbol}`;
        } else if (entityType === 'alert' && entityData.symbol) {
            title = `פרטי התראה: ${entityData.symbol}`;
        }

        console.log('🎯 Setting title to:', title);
        titleElement.textContent = title;
        
        // עדכון צבע כותרת המודל לפי סוג הישות
        this.updateModalHeaderColor(entityType);
        
        // עדכון כפתורי פעולות מהירות
        this.updateQuickActionButtons(entityType, entityData);
    }

    /**
     * Update modal header color - עדכון צבע כותרת המודל
     * 
     * @param {string} entityType - סוג הישות
     * @private
     */
    updateModalHeaderColor(entityType) {
        const headerElement = this.modal?.querySelector('.modal-header');
        if (!headerElement) return;

        // קבלת צבע הישות מהמערכת הגלובלית
        let entityColor = '#019193'; // ברירת מחדל
        
        console.log('🎨 Modal header color debug:');
        console.log('🔍 entityType:', entityType);
        console.log('🔍 window.entityDetailsRenderer?.entityColors:', window.entityDetailsRenderer?.entityColors);
        console.log('🔍 window.ENTITY_COLORS:', window.ENTITY_COLORS);
        console.log('🔍 window.currentPreferences?.entityColors:', window.currentPreferences?.entityColors);
        
        if (window.entityDetailsRenderer && window.entityDetailsRenderer.entityColors) {
            entityColor = window.entityDetailsRenderer.entityColors[entityType] || entityColor;
            console.log('✅ Using entityDetailsRenderer color:', entityColor);
        } else if (window.ENTITY_COLORS && window.ENTITY_COLORS[entityType]) {
            entityColor = window.ENTITY_COLORS[entityType];
            console.log('✅ Using ENTITY_COLORS color:', entityColor);
        } else if (window.currentPreferences && window.currentPreferences.entityColors && window.currentPreferences.entityColors[entityType]) {
            entityColor = window.currentPreferences.entityColors[entityType];
            console.log('✅ Using currentPreferences color:', entityColor);
        } else {
            console.log('⚠️ Using default color:', entityColor);
        }

        // עדכון צבע הרקע של הכותרת
        headerElement.style.backgroundColor = entityColor;
        headerElement.style.color = 'white';
        headerElement.style.borderBottom = `2px solid ${entityColor}`;
        
        console.log('🎨 Applied color to modal header:', entityColor);
    }

    /**
     * Update quick action buttons - עדכון כפתורי פעולות מהירות
     * 
     * @param {string} entityType - סוג הישות
     * @param {Object} entityData - נתוני הישות
     * @private
     */
    updateQuickActionButtons(entityType, entityData) {
        const buttonsContainer = document.getElementById('quickActionButtons');
        if (!buttonsContainer) return;

        let buttonsHtml = '';
        
        if (entityType === 'ticker') {
            buttonsHtml = `
                <button class="btn btn-outline-light btn-sm" onclick="viewLinkedItemsForTicker(${entityData.id})" title="פריטים מקושרים">
                    <i class="fas fa-link"></i>
                </button>
                <button class="btn btn-outline-light btn-sm" onclick="editTicker(${entityData.id})" title="ערוך טיקר">
                    <i class="fas fa-edit"></i>
                </button>
            `;
        }
        
        buttonsContainer.innerHTML = buttonsHtml;
    }

    /**
     * Show rendered content - הצגת תוכן מרונדר
     * 
     * @param {string} renderedContent - תוכן HTML מרונדר
     * @private
     */
    showRenderedContent(renderedContent) {
        const contentElement = document.getElementById('entityDetailsContent');
        if (!contentElement) return;

        contentElement.innerHTML = renderedContent;
    }

    /**
     * Show error state - הצגת מצב שגיאה
     * 
     * @param {string} errorMessage - הודעת שגיאה
     * @private
     */
    showErrorState(errorMessage) {
        const contentElement = document.getElementById('entityDetailsContent');
        if (!contentElement) return;

        contentElement.innerHTML = `
            <div class="entity-details-error d-flex flex-column align-items-center justify-content-center" style="min-height: 300px;">
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h6>שגיאה בטעינת פרטי הישות</h6>
                    <p class="mb-0">${errorMessage}</p>
                </div>
                <button type="button" class="btn btn-outline-primary" onclick="window.entityDetailsModal.retry()">
                    נסה שוב
                </button>
            </div>
        `;
    }

    /**
     * Show modal using Bootstrap - הצגת המודל באמצעות Bootstrap
     * 
     * @private
     */
    showModal() {
        if (!this.modal) return;

        try {
            const bsModal = new bootstrap.Modal(this.modal);
            bsModal.show();
        } catch (error) {
            console.error('Error showing modal with Bootstrap:', error);
            // fallback להצגה ישירה
            this.modal.style.display = 'block';
            this.modal.classList.add('show');
            document.body.classList.add('modal-open');
        }
    }

    /**
     * Retry loading data - ניסיון חוזר לטעינת נתונים
     * 
     * @public
     */
    async retry() {
        if (this.currentEntityType && this.currentEntityId !== null) {
            await this.show(this.currentEntityType, this.currentEntityId);
        }
    }

    /**
     * Handle modal hidden event - טיפול באירוע הסתרת המודל
     * 
     * @private
     */
    onModalHidden() {
        // ניקוי נתונים נוכחיים
        this.currentEntityType = null;
        this.currentEntityId = null;
        
        // ניקוי תוכן המודל
        const contentElement = document.getElementById('entityDetailsContent');
        if (contentElement) {
            contentElement.innerHTML = '';
        }
    }

    /**
     * Get current entity info - קבלת מידע על הישות הנוכחית
     * 
     * @returns {Object} - מידע על הישות הנוכחית
     * @public
     */
    getCurrentEntityInfo() {
        return {
            entityType: this.currentEntityType,
            entityId: this.currentEntityId,
            isVisible: this.isVisible()
        };
    }

    /**
     * Edit entity - עריכת ישות (פתיחת מודל עריכה)
     * 
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @public
     */
    editEntity(entityType, entityId) {
        try {
            // הסתרת חלון הפרטים
            this.hide();
            
            // פתיחת מודל עריכה לפי סוג הישות
            const editFunctions = {
                ticker: 'editTicker',
                trade: 'editTrade', 
                trade_plan: 'editTradePlan',
                execution: 'editExecution',
                account: 'editAccount',
                alert: 'editAlert',
                cash_flow: 'editCashFlow',
                note: 'editNote'
            };
            
            const editFunction = editFunctions[entityType];
            if (editFunction && window[editFunction]) {
                window[editFunction](entityId);
            } else {
                console.warn(`Edit function not found for entity type: ${entityType}`);
                if (window.showWarningNotification) {
                    window.showWarningNotification(`פונקציית עריכה לא נמצאה עבור ${entityType}`);
                }
            }
            
        } catch (error) {
            console.error('Error editing entity:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בפתיחת מודל עריכה');
            }
        }
    }

    /**
     * Open entity page - פתיחת דף הישות
     * 
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @public
     */
    openEntityPage(entityType, entityId) {
        try {
            const pageUrls = {
                ticker: 'tickers',
                trade: 'trades',
                trade_plan: 'trade_plans',
                execution: 'executions', 
                account: 'accounts',
                alert: 'alerts',
                cash_flow: 'cash_flows',
                note: 'notes'
            };
            
            const pageUrl = pageUrls[entityType];
            if (pageUrl) {
                // פתיחה בטאב חדש עם פילטר לפי המזהה
                const url = `${pageUrl}?filter_id=${entityId}`;
                window.open(url, '_blank');
                
                if (window.showInfoNotification) {
                    window.showInfoNotification(`נפתח דף ${entityType} בטאב חדש`);
                }
            } else {
                console.warn(`Page URL not found for entity type: ${entityType}`);
                if (window.showWarningNotification) {
                    window.showWarningNotification(`דף לא נמצא עבור סוג ישות זה`);
                }
            }
            
        } catch (error) {
            console.error('Error opening entity page:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בפתיחת דף הישות');
            }
        }
    }

    /**
     * Show linked items - הצגת פריטים מקושרים
     * 
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @public
     */
    showLinkedItems(entityType, entityId) {
        try {
            // שימוש במערכת הפריטים המקושרים הקיימת
            if (window.loadLinkedItemsData && window.showLinkedItemsModal) {
                // טעינת נתונים מקושרים באמצעות המנגנון הקיים
                window.loadLinkedItemsData(entityType, entityId)
                    .then(data => {
                        if (data && data.child_entities && data.child_entities.length > 0) {
                            // הצגת מודול מקושרים מלא
                            window.showLinkedItemsModal(data, entityType, entityId, 'view');
                        } else {
                            // הצגת הודעת אין פריטים
                            if (window.showInfoNotification) {
                                window.showInfoNotification('אין פריטים מקושרים לישות זו');
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error loading linked items:', error);
                        if (window.showErrorNotification) {
                            window.showErrorNotification('שגיאה בטעינת פריטים מקושרים');
                        }
                    });
            } else {
                console.warn('Linked items system not available');
                if (window.showWarningNotification) {
                    window.showWarningNotification('מערכת הפריטים המקושרים לא זמינה');
                }
            }
            
        } catch (error) {
            console.error('Error showing linked items:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בהצגת פריטים מקושרים');
            }
        }
    }

    /**
     * Export entity - ייצוא ישות
     * 
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @public
     */
    async exportEntity(entityType, entityId) {
        try {
            if (window.showInfoNotification) {
                window.showInfoNotification('מכין קובץ ייצוא...');
            }
            
            // קבלת נתוני הישות
            const entityData = await window.entityDetailsAPI.getEntityWithLinkedItems(entityType, entityId);
            
            if (!entityData) {
                throw new Error('לא ניתן לקבל נתוני ישות לייצוא');
            }
            
            // יצירת תוכן JSON לייצוא
            const exportData = {
                entity_type: entityType,
                entity_id: entityId,
                export_date: new Date().toISOString(),
                data: entityData
            };
            
            // יצירת קובץ להורדה
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            // יצירת link להורדה
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(dataBlob);
            downloadLink.download = `${entityType}_${entityId}_details.json`;
            
            // הפעלת ההורדה
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // ניקוי זכרון
            URL.revokeObjectURL(downloadLink.href);
            
            if (window.showSuccessNotification) {
                window.showSuccessNotification('הקובץ יוצא בהצלחה');
            }
            
        } catch (error) {
            console.error('Error exporting entity:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification(`שגיאה בייצוא: ${error.message}`);
            }
        }
    }
}

// ===== GLOBAL FUNCTIONS =====

/**
 * Show entity details - פונקציה גלובלית להצגת פרטי ישות
 * 
 * @param {string} entityType - סוג הישות
 * @param {number|string} entityId - מזהה הישות
 * @param {Object} options - אפשרויות נוספות
 * @global
 */
function showEntityDetails(entityType, entityId, options = {}) {
    try {
        // שמירת ID נוכחי לשימוש בפריטים מקושרים
        window.currentEntityId = entityId;
        window.currentEntityType = entityType;
        
        if (window.entityDetailsModal) {
            window.entityDetailsModal.show(entityType, entityId, options);
        } else {
            console.error('EntityDetailsModal not initialized');
            if (window.showErrorNotification) {
                window.showErrorNotification('מערכת פרטי ישויות לא מוכנה');
            }
        }
    } catch (error) {
        console.error('Error in showEntityDetails:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהצגת פרטי ישות');
        }
    }
}

/**
 * Hide entity details modal - פונקציה גלובלית להסתרת חלון פרטי ישות
 * 
 * @global
 */
function hideEntityDetails() {
    try {
        if (window.entityDetailsModal) {
            window.entityDetailsModal.hide();
        }
    } catch (error) {
        console.error('Error in hideEntityDetails:', error);
    }
}

/**
 * Show linked items - פונקציה גלובלית להצגת פריטים מקושרים
 * 
 * @param {string} entityType - סוג הישות
 * @param {number|string} entityId - מזהה הישות
 * @global
 */
function showLinkedItems(entityType, entityId) {
    try {
        // שימוש במנגנון המקושרים הקיים
        if (window.loadLinkedItemsData && window.showLinkedItemsModal) {
            // טעינת נתונים מקושרים באמצעות המנגנון הקיים
            window.loadLinkedItemsData(entityType, entityId)
                .then(data => {
                    if (data && data.child_entities && data.child_entities.length > 0) {
                        // הצגת מודול מקושרים מלא
                        window.showLinkedItemsModal(data, entityType, entityId, 'view');
                    } else {
                        // הצגת הודעת אין פריטים
                        if (window.showInfoNotification) {
                            window.showInfoNotification('אין פריטים מקושרים לישות זו');
                        }
                    }
                })
                .catch(error => {
                    console.error('Error loading linked items:', error);
                    if (window.showErrorNotification) {
                        window.showErrorNotification('שגיאה בטעינת פריטים מקושרים');
                    }
                });
        } else {
            console.error('Linked items system not available');
            if (window.showErrorNotification) {
                window.showErrorNotification('מערכת הפריטים המקושרים לא זמינה');
            }
        }
    } catch (error) {
        console.error('Error in showLinkedItems:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהצגת פריטים מקושרים');
        }
    }
}

/**
 * Edit ticker - עריכת טיקר
 * 
 * @param {number|string} tickerId - מזהה הטיקר
 * @global
 */
function editTicker(tickerId) {
    try {
        console.log(`✏️ Editing ticker ${tickerId}`);
        
        // סגירת המודל הנוכחי
        if (window.entityDetailsModal) {
            window.entityDetailsModal.hide();
        }
        
        // פתיחת מודול עריכת טיקר
        if (window.editTicker) {
            window.editTicker(tickerId);
        } else if (window.openEditTickerModal) {
            window.openEditTickerModal(tickerId);
        } else {
            console.error('Edit ticker modal not available');
            if (window.showErrorNotification) {
                window.showErrorNotification('מודול עריכת טיקר לא זמין');
            }
        }
    } catch (error) {
        console.error('Error in editTicker:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בפתיחת עריכת טיקר');
        }
    }
}

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize when DOM is ready - אתחול אוטומטי כשה-DOM מוכן
 */

// ===== FUNCTION INDEX =====
/*
 * 📚 אינדקס פונקציות:
 * ================
 * 
 * מחלקה ראשית:
 * - EntityDetailsModal.constructor() - אתחול המחלקה
 * - EntityDetailsModal.init() - אתחול מערכת המודל
 * - EntityDetailsModal.show() - הצגת פרטי ישות
 * - EntityDetailsModal.hide() - הסתרת המודל
 * - EntityDetailsModal.isVisible() - בדיקה אם המודל מוצג
 * 
 * פונקציות עזר פרטיות:
 * - createModalStructure() - יצירת מבנה HTML
 * - setupEventListeners() - הגדרת מאזינים
 * - updateModalTitle() - עדכון כותרת
 * - showLoadingState() - הצגת מצב טעינה
 * - loadEntityData() - טעינת נתוני ישות
 * - showRenderedContent() - הצגת תוכן מרונדר
 * - showErrorState() - הצגת מצב שגיאה
 * - showModal() - הצגת המודל
 * - retry() - ניסיון חוזר
 * - onModalHidden() - טיפול בהסתרה
 * - getCurrentEntityInfo() - קבלת מידע נוכחי
 * 
 * פונקציות גלובליות:
 * - showEntityDetails() - הצגת פרטי ישות
 * - hideEntityDetails() - הסתרת חלון פרטים
 * 
 * אתחול אוטומטי:
 * - DOMContentLoaded listener - אתחול כשה-DOM מוכן
 */

// הגדרת פונקציות גלובליות
window.showEntityDetails = showEntityDetails;
window.hideEntityDetails = hideEntityDetails;