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

const ENTITY_DISPLAY_NAMES = {
    ticker: 'טיקר',
    trade: 'טרייד',
    trade_plan: 'תכנית השקעה',
    execution: 'ביצוע עסקה',
    trading_account: 'חשבון מסחר',
    account: 'חשבון',
    alert: 'התראה',
    cash_flow: 'תזרים מזומנים',
    note: 'הערה'
};

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
        this.sourceInfo = null; // מידע על המודול המקור (אם נפתח ממודול אחר)
        this.navigationInstanceId = null;
        this.isNavigationRestoreInProgress = false;
        
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
            
            window.Logger.info('EntityDetailsModal initialized successfully', { page: "entity-details-modal" });
            
        } catch (error) {
            window.Logger.error('Error initializing EntityDetailsModal:', error, { page: "entity-details-modal" });
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
        const modalHTML = `
            <div class="modal fade" id="${this.modalId}" tabindex="-1" 
                 aria-labelledby="${this.modalId}Label" aria-hidden="true" 
                 data-bs-backdrop="false" data-bs-keyboard="true">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content entity-details-modal">
                        <div class="modal-header modal-header-colored">
                            <div class="modal-header-title-section">
                                <h5 class="modal-title" id="${this.modalId}Label">
                                    פרטי ישות
                                </h5>
                            </div>
                            <!-- Breadcrumb navigation - במרכז בין הכותרת לכפתורים -->
                            <div class="modal-navigation-breadcrumb" id="entityDetailsBreadcrumb"></div>
                            <div class="modal-header-actions">
                                <!-- Quick action buttons -->
                                <div id="quickActionButtons" class="btn-group btn-group-sm" role="group">
                                    <!-- כפתורי פעולות מהירות יוכנסו כאן דינמית -->
                                </div>
                                <!-- Back button - uses the button system - לפני כפתור סגירה (מימין לסגירה ב-RTL) -->
                                <!-- הכפתור יקבל data-onclick מ-modal-navigation-manager -->
                                <button type="button" 
                                        data-button-type="BACK" 
                                        data-variant="normal" 
                                        title="חזור למודול הקודם"
                                        id="entityDetailsBackBtn">
                                </button>
                                <!-- Close button - uses the button system - בסוף השורה משמאל (הכי שמאלה ב-RTL) - איקון בלבד -->
                                <button type="button" 
                                        data-button-type="CLOSE" 
                                        data-variant="small" 
                                        data-bs-dismiss="modal" 
                                        title="סגור">
                                </button>
                            </div>
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
                            <button type="button" class="btn" 
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

        this.modal.addEventListener('modal-navigation:restore', event => {
            const detail = event?.detail || {};
            const entry = detail.entry || null;
            if (!entry || entry.modalId !== this.modalId) {
                return;
            }
            if (entry.instanceId) {
                this.navigationInstanceId = entry.instanceId;
            }
            if (detail.stage === 'before-show') {
                this._handleNavigationRestore(entry);
            }
            window.Logger?.debug('EntityDetailsModal restore event received', {
                stage: detail.stage || 'unknown',
                entry,
                currentEntityType: this.currentEntityType,
                currentEntityId: this.currentEntityId,
                navigationInstanceId: this.navigationInstanceId,
                page: 'entity-details-modal'
            });
        });

        // מאזין למקש ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });

        window.Logger.debug('EntityDetailsModal event listeners set up', { page: "entity-details-modal" });
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

            const optionsSummary = {
                mode: options?.mode || null,
                sourceInfo: options?.sourceInfo || null,
                navigationMetadata: options?.navigationMetadata
                    ? {
                        modalId: options.navigationMetadata.modalId || null,
                        modalType: options.navigationMetadata.modalType || null,
                        entityType: options.navigationMetadata.entityType || null,
                        entityId: options.navigationMetadata.entityId ?? null,
                        title: options.navigationMetadata.title || null
                    }
                    : null
            };
            window.Logger?.debug('EntityDetailsModal.show invoked', {
                entityType,
                entityId,
                optionsSummary,
                page: 'entity-details-modal'
            });

            // שמירת מידע נוכחי
            this.currentEntityType = entityType;
            this.currentEntityId = entityId;

            const initialTitle = this._applyInitialHeading(entityType, entityId);
            const navigationTitle = (initialTitle || '').trim();

            // שמירת sourceInfo לפני הצגת המודול (אם קיים)
            if (options.source) {
                this.sourceInfo = options.source;
                if (window.Logger) {
                    window.Logger.info('✅ [1.2 EntityDetailsModal.show] SourceInfo saved after assignment', {
                        sourceInfo: this.sourceInfo,
                        sourceInfoString: JSON.stringify(this.sourceInfo),
                        entityType: entityType,
                        entityId: entityId,
                        page: "entity-details-modal"
                    });
                }
            } else {
                this.sourceInfo = null;
                if (window.Logger) {
                    window.Logger.info('⚠️ [1.2 EntityDetailsModal.show] No sourceInfo provided', {
                        entityType: entityType,
                        entityId: entityId,
                        options: options,
                        thisSourceInfo: this.sourceInfo,
                        page: "entity-details-modal"
                    });
                }
            }
            
            // בדיקה אם המודל נפתח כמודל מקונן (יש מודל אחר פתוח)
            const isNested = options.source?.sourceModal === 'linked-items' || 
                           (window.ModalNavigationService && window.ModalNavigationService.getStack().length > 0);
            
            // הוספת modal-nested class אם נפתח כמודל מקונן
            if (isNested && this.modal) {
                this.modal.classList.add('modal-nested', 'modal-nested-level-2');
                // הגדרת offset גבוה יותר למודל מקונן (40 במקום 20)
                this.modal.style.setProperty('--modal-nested-offset', '40');
            } else if (this.modal) {
                // הסרת modal-nested אם לא מקונן
                this.modal.classList.remove('modal-nested', 'modal-nested-level-2');
                this.modal.style.removeProperty('--modal-nested-offset');
            }
            
            // הצגת מצב טעינה
            this.showLoadingState();

            const initialNavigationMetadata = {
                modalId: this.modalId,
                modalType: 'entity-details',
                                entityType,
                                entityId,
                title: navigationTitle,
                allowDuplicateEntries: true
            };

            if (window.ModalNavigationService?.registerModalOpen) {
                const navigationEntry = await window.ModalNavigationService.registerModalOpen(this.modal, initialNavigationMetadata);
                this.navigationInstanceId = navigationEntry?.instanceId || null;
            } else if (window.pushModalToNavigation) {
                await window.pushModalToNavigation(this.modal, initialNavigationMetadata);
                this.navigationInstanceId = null;
            }

                // הצגת המודל
                await this.showModal();

                // טעינת הנתונים
                await this.loadEntityData(entityType, entityId, options);

        } catch (error) {
            window.Logger.error('Error showing entity details modal:', error, { page: "entity-details-modal" });
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
                // אם יש מודל מקונן (יש מודל אחר פתוח) - השתמש ב-goBack
                if (window.ModalNavigationService?.canGoBack && window.ModalNavigationService.canGoBack()) {
                    // יש מודל מקונן - חזור למודל הקודם
                    window.ModalNavigationService.goBack().catch((error) => {
                        window.Logger?.warn('Failed to go back via navigation service, using fallback', { error: error?.message }, { page: "entity-details-modal" });
                        // fallback - סגירה רגילה
                        const bsModal = bootstrap.Modal.getInstance(this.modal);
                        if (bsModal) {
                            bsModal.hide();
                        } else {
                            this.modal.style.display = 'none';
                            this.modal.classList.remove('show');
                        }
                    });
                    return;
                }
                
                // אין מודל מקונן - סגירה רגילה
                const bsModal = bootstrap.Modal.getInstance(this.modal);
                if (bsModal) {
                    bsModal.hide();
                } else {
                    // fallback
                    this.modal.style.display = 'none';
                    this.modal.classList.remove('show');
                }
                
                // ניהול backdrop יקרה אוטומטית ב-ModalNavigationManager
            }
        } catch (error) {
            window.Logger.error('Error hiding entity details modal:', error, { page: "entity-details-modal" });
        }
    }

    /**
     * Apply temporary heading before data load or restore
     * 
     * @param {string} entityType
     * @param {number|string} entityId
     * @private
     */
    _applyInitialHeading(entityType, entityId) {
        this.updateModalHeaderColor(entityType);
        if (window.setCurrentEntityColorForEntity) {
            window.setCurrentEntityColorForEntity(entityType, { updateHeaders: false });
        }
        const titleElement = document.getElementById(`${this.modalId}Label`);
        if (!titleElement) {
            return '';
        }
        const entityName = ENTITY_DISPLAY_NAMES[entityType] || 'ישות';
        const normalizedId = entityId !== undefined && entityId !== null ? entityId : '';
        const heading = normalizedId !== ''
            ? `פרטי ${entityName} #${normalizedId}`
            : `פרטי ${entityName}`;
        titleElement.textContent = heading;
        return heading;
    }

    /**
     * Restore modal content when חוזרים אחורה במערכת הניווט
     * 
     * @param {Object} entry - נתוני הניווט שנשמרו במערכת
     * @private
     */
    async _handleNavigationRestore(entry) {
        if (this.isNavigationRestoreInProgress) {
            window.Logger?.debug('EntityDetailsModal restore skipped - already in progress', {
                entry,
                page: 'entity-details-modal'
            });
            return;
        }

        const entityType = entry?.entityType || null;
        const entityId = entry?.entityId ?? null;
        if (!entityType || entityId === null || entityId === undefined) {
            window.Logger?.warn('EntityDetailsModal restore received entry without entity info', {
                entry,
                page: 'entity-details-modal'
            });
            return;
        }

        // בדיקה אם המודל כבר פתוח עם אותם נתונים - אם כן, לא צריך לטעון מחדש
        if (this.isVisible() && 
            this.currentEntityType === entityType && 
            this.currentEntityId === entityId) {
            window.Logger?.debug('EntityDetailsModal restore skipped - modal already open with same data', {
                entityType,
                entityId,
                page: 'entity-details-modal'
            });
            return;
        }

        this.isNavigationRestoreInProgress = true;
        try {
            this.currentEntityType = entityType;
            this.currentEntityId = entityId;
            this.sourceInfo = entry?.sourceInfo || null;
            this._applyInitialHeading(entityType, entityId);
            this.showLoadingState();

            const restoreOptions = {
                mode: entry?.metadata?.mode ?? null,
                includeLinkedItems: entry?.metadata?.includeLinkedItems,
                includeMarketData: entry?.metadata?.includeMarketData,
                forceRefresh: entry?.metadata?.forceRefresh === true,
                source: entry?.sourceInfo || null,
                navigationRestore: true
            };

            Object.keys(restoreOptions).forEach(key => {
                if (restoreOptions[key] === undefined || restoreOptions[key] === null) {
                    delete restoreOptions[key];
                }
            });

            await this.loadEntityData(entityType, entityId, restoreOptions);
        } catch (error) {
            window.Logger?.error('EntityDetailsModal restore failed', {
                error,
                entry,
                page: 'entity-details-modal'
            });
            if (window.showErrorNotification) {
                window.showErrorNotification('אירעה שגיאה בשחזור פרטי הישות לאחר ניווט אחורה.');
            }
        } finally {
            this.isNavigationRestoreInProgress = false;
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
     * @param {Object|number|string} entityDataOrId - נתוני הישות (Object) או מזהה הישות (number|string)
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
            <div class="entity-details-loading d-flex flex-column align-items-center justify-content-center">
                <div class="spinner-border text-primary" role="status">
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
            console.log('🔍🔍🔍 [loadEntityData] START', {
                entityType,
                entityId,
                entityIdType: typeof entityId,
                options: JSON.stringify(options),
                currentEntityType: this.currentEntityType,
                currentEntityId: this.currentEntityId
            });
            
            // בדיקת זמינות API module
            if (!window.entityDetailsAPI) {
                throw new Error('Entity Details API לא נטען');
            }

            // קריאה ל-API לקבלת נתוני הישות - כולל פריטים מקושרים
            // חשוב: העברת options.includeLinkedItems כדי שהפריטים המקושרים ייטענו
            const apiOptions = {
                includeLinkedItems: options.includeLinkedItems !== false, // ברירת מחדל: true
                includeMarketData: options.includeMarketData !== false, // ברירת מחדל: true
                forceRefresh: options.forceRefresh || false
            };
            
            // לוג ישיר לקונסולה - תמיד יופיע
            console.log(`🔍 [ENTITY-DETAILS-MODAL] Loading entity details: ${entityType} ${entityId}`, {
                apiOptions,
                originalOptions: options
            });
            
            if (window.Logger) {
                window.Logger.info(`🔍 Loading entity details: ${entityType} ${entityId}`, {
                    apiOptions,
                    originalOptions: options,
                    page: "entity-details-modal"
                });
            }
            
            let entityData = await window.entityDetailsAPI.getEntityDetails(entityType, entityId, apiOptions);
            
            if (entityType === 'trading_account' && apiOptions.includeLinkedItems !== false) {
                const hasLinkedItemsArray = Array.isArray(entityData.linked_items);
                if (!hasLinkedItemsArray || options.forceRefresh) {
                    try {
                        const linkedItems = await window.entityDetailsAPI.getLinkedItems('trading_account', entityId, {
                            forceRefresh: options.forceRefresh || false
                        });
                        entityData.linked_items = linkedItems;
                        entityData.linked_items_count = Array.isArray(linkedItems) ? linkedItems.length : 0;
                    } catch (linkedItemsError) {
                        window.Logger?.warn('⚠️ Failed to load trading account linked items', linkedItemsError, { page: 'entity-details-modal' });
                        if (!Array.isArray(entityData.linked_items)) {
                            entityData.linked_items = [];
                            entityData.linked_items_count = 0;
                        }
                    }
                }
            }
            
            // טעינת נתונים נוספים עבור trading_account
            if (entityType === 'trading_account') {
                await this.loadAccountAdditionalData(entityData, entityId);
            }
            
            // שמירת מידע על המקור אם קיים (לניפוי בין מודולים מקוננים)
            if (options.source) {
                if (window.Logger) {
                    window.Logger.debug('Entity details opened from source:', {
                        source: options.source,
                        currentEntity: { type: entityType, id: entityId },
                        page: "entity-details-modal"
                    });
                }
                // אפשר לשמור את המידע הזה לשימוש עתידי (למשל בכותרת או breadcrumb)
                this.sourceInfo = options.source;
            }
            
            // לוג ישיר לקונסולה - תמיד יופיע
            console.log(`📊 [ENTITY-DETAILS-MODAL] Entity data loaded:`, {
                entityType,
                entityId,
                hasLinkedItems: !!entityData.linked_items,
                linkedItemsCount: entityData.linked_items?.length || 0,
                linkedItems: entityData.linked_items,
                sourceInfo: options.source || null
            });
            
            // לוג מיוחד עבור trade_plan ו-trade - בודק את ticker_symbol
            if (entityType === 'trade_plan' || entityType === 'trade') {
                // Fallback: אם ticker_symbol לא מוגדר אבל יש tickerObject, נחלץ אותו
                if (!entityData.ticker_symbol && entityData.ticker?.symbol) {
                    entityData.ticker_symbol = entityData.ticker.symbol;
                    console.log(`✅ [ENTITY-DETAILS-MODAL] Fixed ticker_symbol from tickerObject for ${entityType}:`, {
                        ticker_symbol: entityData.ticker_symbol,
                        tickerObject: entityData.ticker
                    });
                }
                
                console.log(`🔍🔍🔍 [ENTITY-DETAILS-MODAL] ${entityType} ticker debug:`, {
                    entityId: entityId,
                    ticker_symbol: entityData.ticker_symbol,
                    ticker_id: entityData.ticker_id,
                    hasTickerObject: !!entityData.ticker,
                    tickerObject: entityData.ticker,
                    tickerObjectFull: entityData.ticker ? JSON.stringify(entityData.ticker, null, 2) : null,
                    tickerObjectKeys: entityData.ticker ? Object.keys(entityData.ticker) : [],
                    tickerObjectValues: entityData.ticker ? Object.entries(entityData.ticker).map(([key, value]) => ({key, value, type: typeof value})) : [],
                    allKeys: Object.keys(entityData),
                    entityDataSnapshot: JSON.parse(JSON.stringify(entityData)) // Deep copy for inspection
                });
            }
            
            if (window.Logger) {
                window.Logger.info(`📊 Entity data loaded:`, {
                    entityType,
                    entityId,
                    hasLinkedItems: !!entityData.linked_items,
                    linkedItemsCount: entityData.linked_items?.length || 0,
                    linkedItems: entityData.linked_items,
                    sourceInfo: options.source || null,
                    page: "entity-details-modal"
                });
            }

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
                    window.Logger.debug('Could not load external data for ticker:', error, { page: "entity-details-modal" });
                }
            }

        // עדכון כותרת המודל
        this.updateModalTitle(entityType, entityData);

        const finalTitle = this.getModalTitleText(entityType, entityData);
        if (window.ModalNavigationService?.updateModalMetadata) {
            const metadataDetails = {
                mode: options.mode ?? null,
                includeLinkedItems: options.includeLinkedItems !== false,
                includeMarketData: options.includeMarketData !== false,
                forceRefresh: options.forceRefresh === true,
                navigationRestore: options.navigationRestore === true,
                lastLoadedAt: Date.now()
            };
            Object.keys(metadataDetails).forEach(key => {
                if (metadataDetails[key] === null) {
                    delete metadataDetails[key];
                }
            });

            const metadataPayload = {
                entityType,
                entityId,
                title: finalTitle,
                sourceInfo: this.sourceInfo || null,
                metadata: metadataDetails
            };
            if (this.navigationInstanceId) {
                metadataPayload.instanceId = this.navigationInstanceId;
            }
            window.ModalNavigationService.updateModalMetadata(this.modalId, metadataPayload);
        }

        if (window.modalNavigationManager?.updateModalNavigation && this.modal) {
            window.modalNavigationManager.updateModalNavigation(this.modal);
        }

        if (window.setCurrentEntityColorForEntity) {
            const activeEntityType = this.currentEntityType || entityType;
            window.setCurrentEntityColorForEntity(activeEntityType, { updateHeaders: false });
        }

        // רנדור הנתונים - העברת sourceInfo ל-renderer דרך options
        const renderOptions = {
            ...options,
            sourceInfo: this.sourceInfo || null // העברת sourceInfo ל-renderer
        };
        
        console.log('📦📦📦 [loadEntityData] renderOptions created', {
            entityType,
            entityId,
            hasSourceInfo: !!this.sourceInfo,
            thisSourceInfo: this.sourceInfo,
            thisSourceInfoString: this.sourceInfo ? JSON.stringify(this.sourceInfo) : null,
            renderOptionsSourceInfo: renderOptions.sourceInfo,
            renderOptionsSourceInfoString: renderOptions.sourceInfo ? JSON.stringify(renderOptions.sourceInfo) : null,
            allRenderOptions: renderOptions
        });
        
        if (window.Logger) {
            window.Logger.info('✅ [1.3 loadEntityData] renderOptions created with sourceInfo', {
                entityType,
                entityId,
                hasSourceInfo: !!this.sourceInfo,
                thisSourceInfo: this.sourceInfo,
                thisSourceInfoString: this.sourceInfo ? JSON.stringify(this.sourceInfo) : null,
                renderOptionsSourceInfo: renderOptions.sourceInfo,
                renderOptionsSourceInfoString: renderOptions.sourceInfo ? JSON.stringify(renderOptions.sourceInfo) : null,
                allRenderOptions: renderOptions,
                page: "entity-details-modal"
            });
        }
        
        // בדיקה שהרינדור זמין
        if (!window.entityDetailsRenderer || typeof window.entityDetailsRenderer.render !== 'function') {
            throw new Error('Entity Details Renderer לא זמין או לא מוגדר כראוי');
        }

        let renderedContent;
        try {
            renderedContent = await window.entityDetailsRenderer.render(entityType, entityData, renderOptions);
            
            // בדיקה שהתוכן הוחזר
            if (!renderedContent || typeof renderedContent !== 'string') {
                throw new Error('הרינדור החזיר תוכן לא תקין');
            }
        } catch (renderError) {
            window.Logger.error('Error in render call:', renderError, { page: "entity-details-modal" });
            throw new Error(`שגיאה ברנדור: ${renderError.message || renderError}`);
        }

        // הצגת התוכן ברנדור
        this.showRenderedContent(renderedContent);
        
        // אין שמירת תוכן במערכת הניווט – הסתמכות על רענון דינמי בלבד

        } catch (error) {
            window.Logger.error('Error loading entity data:', error, { page: "entity-details-modal" });
            this.showErrorState(error.message);
        }
    }

    /**
     * Get entity icon path - קבלת נתיב איקון לישות
     * 
     * @param {string} entityType - סוג הישות
     * @returns {string} - נתיב לאיקון SVG
     * @private
     */
    async getEntityIcon(entityType) {
        // Use IconSystem if available, fallback to old method
        if (typeof window.IconSystem !== 'undefined' && window.IconSystem.getEntityIcon) {
            try {
                return await window.IconSystem.getEntityIcon(entityType);
            } catch (error) {
                if (typeof window.Logger !== 'undefined') {
                    window.Logger.warn('⚠️ Error getting entity icon from IconSystem, using fallback', { entityType, error, page: 'entity-details-modal' });
                }
            }
        }
        
        // Fallback to old method
        const iconMappings = {
            ticker: '/trading-ui/images/icons/entities/tickers.svg',
            trade: '/trading-ui/images/icons/entities/trades.svg',
            trade_plan: '/trading-ui/images/icons/entities/trade_plans.svg',
            execution: '/trading-ui/images/icons/entities/executions.svg',
            account: '/trading-ui/images/icons/entities/trading_accounts.svg',
            alert: '/trading-ui/images/icons/entities/alerts.svg',
            cash_flow: '/trading-ui/images/icons/entities/cash_flows.svg',
            note: '/trading-ui/images/icons/entities/notes.svg',
            preference: '/trading-ui/images/icons/entities/preferences.svg',
            research: '/trading-ui/images/icons/entities/research.svg',
            design: '/trading-ui/images/icons/tabler/palette.svg',
            constraint: '/trading-ui/images/icons/tabler/lock.svg',
            development: '/trading-ui/images/icons/entities/development.svg',
            info: '/trading-ui/images/icons/tabler/info-circle.svg',
            position: '/trading-ui/images/icons/entities/trades.svg'
        };

        return iconMappings[entityType] || '/trading-ui/images/icons/entities/home.svg';
    }

    /**
     * Update modal title - עדכון כותרת המודל
     * 
     * פורמט חדש: [איקון] פרטי [סוג ישות] מספר [מזהה]
     * 
     * @param {string} entityType - סוג הישות
     * @param {Object} entityData - נתוני הישות
     * @private
     */
    updateModalTitle(entityType, entityDataOrId) {
        const titleElement = document.getElementById(`${this.modalId}Label`);
        const headerElement = this.modal?.querySelector('.modal-header');
        
        // טיפול ב-entityDataOrId - יכול להיות Object (entityData) או number/string (entityId)
        let entityId = '';
        let entityData = null;
        if (entityDataOrId && typeof entityDataOrId === 'object') {
            entityData = entityDataOrId;
            entityId = entityData?.id || '';
        } else if (entityDataOrId !== null && entityDataOrId !== undefined) {
            entityId = entityDataOrId.toString();
        }
        
        // אם לא קיבלנו entityType או entityId, נשתמש בערכים הנוכחיים
        // (זה יכול לקרות כשקוראים מההיסטוריה)
        const finalEntityType = entityType || this.currentEntityType;
        const finalEntityId = entityId || (this.currentEntityId !== null ? this.currentEntityId.toString() : '');
        
        console.log('🔍🔍🔍 [updateModalTitle] START', {
            receivedEntityType: entityType,
            receivedEntityDataOrId: entityDataOrId,
            thisCurrentEntityType: this.currentEntityType,
            thisCurrentEntityId: this.currentEntityId,
            thisSourceInfo: this.sourceInfo,
            finalEntityType,
            finalEntityId,
            titleElementBefore: titleElement?.innerHTML?.substring(0, 100),
            isNestedModal: !!this.sourceInfo
        });
        
        // עדכון currentEntityType/Id כדי לוודא שהם מעודכנים
        if (finalEntityType) {
            this.currentEntityType = finalEntityType;
        }
        if (finalEntityId) {
            this.currentEntityId = finalEntityId;
        }
        
        console.log('🔍🔍🔍 [updateModalTitle] After updating currentEntityType/Id', {
            finalEntityType,
            finalEntityId,
            thisCurrentEntityType: this.currentEntityType,
            thisCurrentEntityId: this.currentEntityId
        });
        
        window.Logger.info('🎯 updateModalTitle called:', { 
            entityType: finalEntityType, 
            entityId: finalEntityId, 
            entityData, 
            titleElement, 
            headerElement,
            currentEntityType: this.currentEntityType,
            currentEntityId: this.currentEntityId,
            sourceInfo: this.sourceInfo
        }, { page: "entity-details-modal" });
        
        if (!titleElement) {
            window.Logger.warn('⚠️ Title element not found:', `${this.modalId}Label`, { page: "entity-details-modal" });
            return;
        }
        
        if (!headerElement) {
            window.Logger.warn('⚠️ Header element not found', { page: "entity-details-modal" });
            return;
        }
        
        // בדיקה אם זה מודול מקונן - אם כן, לא נעדכן את הכותרת (רק ברדקראמבס יציג)
        const isNestedModal = !!this.sourceInfo;
        
        if (isNestedModal) {
            // מודול מקונן - הכותרת תישאר פשוטה, הברדקראמבס יציג את הפרטים
            const entityLabel = (window.getEntityLabel && typeof window.getEntityLabel === 'function') 
                ? window.getEntityLabel(finalEntityType) 
                : finalEntityType;
            
            // Get icon path (async)
            let iconPath;
            try {
                iconPath = await this.getEntityIcon(finalEntityType);
            } catch (error) {
                iconPath = '/trading-ui/images/icons/entities/home.svg'; // Fallback
            }
            
            // טיפול מיוחד עבור account/trading_account - הצגת שם החשבון
            let titleText = '';
            if (finalEntityType === 'trading_account' && entityData && entityData.name) {
                titleText = `פרטי חשבון מסחר: ${entityData.name}`;
            } else {
                // כותרת פשוטה ללא שם הרשומה
                titleText = `פרטי ${entityLabel}`;
            }
            
            const titleHTML = `
                <span class="d-inline-flex align-items-center gap-2">
                    <div class="entity-icon-circle">
                        <img src="${iconPath}" 
                             alt="${entityLabel}" />
                    </div>
                    <span>${titleText}</span>
                </span>
            `;
            
            titleElement.innerHTML = titleHTML;
            
            if (window.Logger) {
                window.Logger.info('🎯 Nested modal - simple title set', { entityLabel, iconPath, finalEntityType, titleText }, { page: "entity-details-modal" });
            }
        } else {
            // מודול רגיל - עדכון מלא של הכותרת
            const entityLabel = (window.getEntityLabel && typeof window.getEntityLabel === 'function') 
                ? window.getEntityLabel(finalEntityType) 
                : finalEntityType;
            
            // Get icon path (async)
            let iconPath;
            try {
                iconPath = await this.getEntityIcon(finalEntityType);
            } catch (error) {
                iconPath = '/trading-ui/images/icons/entities/home.svg'; // Fallback
            }
            
            // טיפול מיוחד עבור account/trading_account - הצגת שם החשבון במקום מספר
            let titleText = '';
            if (finalEntityType === 'trading_account' && entityData && entityData.name) {
                titleText = `פרטי חשבון מסחר: ${entityData.name}`;
            } else {
                // יצירת כותרת חדשה: [איקון] פרטי [סוג ישות] מספר [מזהה]
                titleText = `פרטי ${entityLabel}${finalEntityId ? ` מספר ${finalEntityId}` : ''}`;
            }
            
            const titleHTML = `
                <span class="d-inline-flex align-items-center gap-2">
                    <div class="entity-icon-circle">
                        <img src="${iconPath}" 
                             alt="${entityLabel}" />
                    </div>
                    <span>${titleText}</span>
                </span>
            `;

            console.log('🔍🔍🔍 [updateModalTitle] About to set titleHTML', {
                entityLabel,
                entityId: finalEntityId,
                iconPath,
                finalEntityType,
                titleText,
                titleHTML,
                titleHTMLLength: titleHTML.length,
                titleElementBefore: titleElement?.innerHTML?.substring(0, 100)
            });
            
            window.Logger.info('🎯 Setting title to:', { entityLabel, entityId: finalEntityId, iconPath, finalEntityType, titleText }, { page: "entity-details-modal" });
            titleElement.innerHTML = titleHTML;
            
            console.log('🔍🔍🔍 [updateModalTitle] After setting titleHTML', {
                titleElementAfter: titleElement?.innerHTML?.substring(0, 100),
                titleElementInnerHTMLLength: titleElement?.innerHTML?.length
            });
        }
        
        // לא צריך לשמור ולהחזיר את ה-breadcrumb - modal-navigation-manager מטפל בזה
        // אם נשמור ונחזיר, זה יחליף את התוכן הנכון שנוצר ב-_performNavigationUpdate
        
        // עדכון צבע כותרת המודל לפי סוג הישות
        this.updateModalHeaderColor(finalEntityType);
        
        // עדכון כפתורי פעולות מהירות
        this.updateQuickActionButtons(finalEntityType, entityData);
        
        console.log('🔍🔍🔍 [updateModalTitle] END', {
            finalEntityType,
            finalEntityId,
            titleElementFinal: titleElement?.innerHTML?.substring(0, 100),
            breadcrumbManaged: 'modal-navigation-manager handles breadcrumb',
            thisCurrentEntityType: this.currentEntityType,
            thisCurrentEntityId: this.currentEntityId
        });
        
        // ✅ עדכון navigation UI אחרי עדכון הכותרת - רק אם modalNavigationManager זמין
        // חשוב: handleModalShown() כבר קרא ל-updateModalNavigation, אבל אנחנו מעדכנים אחרי שינוי כותרת
        if (window.modalNavigationManager && this.modal && window.modalNavigationManager.isInitialized) {
            // עדכון עם delay קצר כדי לוודא שהכותרת עודכנה
            setTimeout(() => {
                window.modalNavigationManager.updateModalNavigation(this.modal);
            }, 100);
        }
    }
    
    /**
     * Get modal title text - קבלת טקסט כותרת המודל
     * 
     * @param {string} entityType - סוג הישות
     * @param {Object} entityData - נתוני הישות
     * @private
     * @returns {string} טקסט כותרת
     */
    getModalTitleText(entityType, entityData) {
        // טיפול מיוחד עבור account/trading_account - הצגת שם החשבון במקום מספר
        if (entityType === 'trading_account' && entityData && entityData.name) {
            return `פרטי חשבון מסחר: ${entityData.name}`;
        }
        
        const entityLabel = (window.getEntityLabel && typeof window.getEntityLabel === 'function') 
            ? window.getEntityLabel(entityType) 
            : entityType;
        const entityId = entityData?.id || '';
        return `פרטי ${entityLabel}${entityId ? ` מספר ${entityId}` : ''}`;
    }

    /**
     * Update modal header color - עדכון צבע כותרת המודל
     * 
     * @param {string} entityType - סוג הישות
     * @private
     */
    updateModalHeaderColor(entityType) {
        const headerElement = this.modal?.querySelector('.modal-header');
        const modalElement = this.modal;
        if (!headerElement || !modalElement) return;

        // הסרת כל המחלקות הישנות של ישויות
        // רשימה מלאה של כל סוגי הישויות במערכת
        const validEntityTypes = [
            'trade', 'ticker', 'trading_account', 'alert', 'cash_flow', 'cash-flow', 
            'note', 'trade_plan', 'trade-plan', 'execution', 'preference', 'research', 
            'design', 'constraint', 'development', 'position', 'account'
        ];
        validEntityTypes.forEach(type => {
            const normalizedType = type.replace('_', '-').toLowerCase();
            headerElement.classList.remove(`entity-${normalizedType}`);
            headerElement.classList.remove(`entity-${type}`);
        });
        
        // הוספת מחלקת ישות חדשה - CSS ידאג לצבעים מההעדפות!
        if (entityType) {
            // נירמול סוג הישות (תמיכה גם ב-account ישן)
            let normalizedType = entityType.replace('_', '-').toLowerCase();
            
            // מיפוי account ישן ל-trading_account
            if (normalizedType === 'account') {
                normalizedType = 'trading-account';
                entityType = 'trading_account';
            }
            
            headerElement.classList.add(`entity-${normalizedType}`);
            
            // הוספת data-entity-type למודול (תמיד מעדכן כדי לשמור על סינכרון)
                modalElement.setAttribute('data-entity-type', entityType);
            
            if (window.Logger) {
                window.Logger.info(`🎨 Applied entity class to modal header: entity-${normalizedType} (entityType: ${entityType})`, { 
                    entityType,
                    normalizedType,
                    page: "entity-details-modal" 
                });
            }
        }
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
        
        // עבור ticker - לא מציגים כפתורי פעולות מהירות
        if (entityType === 'ticker') {
            buttonsHtml = ''; // ריק - לא מציגים כפתורים
        }
        
        buttonsContainer.innerHTML = buttonsHtml;
        
        // עבור ticker - מסתירים גם את כפתור החזרה
        const backButton = document.getElementById('entityDetailsBackBtn');
        if (backButton) {
            if (entityType === 'ticker') {
                backButton.style.display = 'none';
            } else {
                backButton.style.display = '';
            }
        }
    }

    /**
     * Show rendered content - הצגת תוכן מרונדר
     * 
     * @param {string} renderedContent - תוכן HTML מרונדר
     * @private
     */
    showRenderedContent(renderedContent) {
        const contentElement = document.getElementById('entityDetailsContent');
        if (!contentElement) {
            console.error('❌ [showRenderedContent] Content element not found!');
            return;
        }

        console.log('🔍 [showRenderedContent] Before setting innerHTML', {
            contentLength: renderedContent.length,
            hasLinkedItemsSection: renderedContent.includes('entity-linked-items'),
            linkedItemsTableExists: renderedContent.includes('linkedItemsTable_'),
            contentElementExists: !!contentElement
        });

        contentElement.innerHTML = renderedContent;
        
        // Debug: Check if linked items table exists after insertion
        setTimeout(() => {
            const linkedItemsTables = contentElement.querySelectorAll('[id^="linkedItemsTable_"]');
            console.log('🔍 [showRenderedContent] After setting innerHTML - Linked items tables found:', linkedItemsTables.length);
            linkedItemsTables.forEach((table, index) => {
                const tbody = table.querySelector('tbody');
                const rows = tbody ? tbody.querySelectorAll('tr') : [];
                console.log(`🔍 [showRenderedContent] Table ${index + 1} (${table.id}):`, {
                    tableExists: !!table,
                    tbodyExists: !!tbody,
                    tbodyRows: rows.length,
                    tbodyHTML: tbody ? tbody.innerHTML.substring(0, 200) : 'N/A',
                    tableHTML: table.outerHTML.substring(0, 500)
                });
            });
        }, 100);
        
        // Initialize tooltips for linked items filter buttons after content is displayed
        // Use centralized button system instead of manual initialization
        const initializeTooltips = (attempt = 1, maxAttempts = 5) => {
            if (attempt > maxAttempts) {
                console.warn(`🔍 [Tooltip Debug] Max attempts reached (${maxAttempts}), stopping tooltip initialization`);
                return;
            }
            
            // Find all filter containers for linked items in the rendered content
            // Search in both contentElement and modal to catch all cases
            const searchScope = this.modal || contentElement;
            const filterContainers = searchScope.querySelectorAll('[id^="linkedItemsFilter_"]');
            const filterButtonsContainers = searchScope.querySelectorAll('.filter-buttons-container[id^="linkedItemsFilter_"]');
            
            // Also search for buttons with data-tooltip directly
            const buttonsWithTooltip = searchScope.querySelectorAll('.filter-buttons-container [data-tooltip]');
            
            console.log(`🔍 [Tooltip Debug] Attempt ${attempt}/${maxAttempts}:`, {
                filterContainers: filterContainers.length,
                filterButtonsContainers: filterButtonsContainers.length,
                buttonsWithTooltip: buttonsWithTooltip.length,
                searchScope: searchScope.id || searchScope.className || 'unknown'
            });
            
            // Use centralized button system to initialize tooltips
            if (window.advancedButtonSystem && typeof window.advancedButtonSystem.initializeTooltips === 'function') {
                // Process all found containers
                const containersToProcess = filterContainers.length > 0 ? filterContainers : filterButtonsContainers;
                
                if (containersToProcess.length > 0) {
                    containersToProcess.forEach(container => {
                        console.log(`🔍 [Tooltip Debug] Initializing tooltips for container: ${container.id}`);
                        window.advancedButtonSystem.initializeTooltips(container);
                    });
                } else if (buttonsWithTooltip.length > 0) {
                    // If no containers but buttons found, find parent container
                    const container = buttonsWithTooltip[0].closest('.filter-buttons-container');
                    if (container) {
                        console.log(`🔍 [Tooltip Debug] Initializing tooltips for container: ${container.id || 'unknown'}`);
                        window.advancedButtonSystem.initializeTooltips(container);
                    }
                }
            } else if (window.entityDetailsRenderer && window.entityDetailsRenderer._initializeFilterTooltips) {
                // Fallback: use renderer method if button system not available
                const containersToProcess = filterContainers.length > 0 ? filterContainers : filterButtonsContainers;
                containersToProcess.forEach(container => {
                    const containerId = container.id;
                    const tableId = containerId.replace('linkedItemsFilter_', '');
                    window.entityDetailsRenderer._initializeFilterTooltips(tableId);
                });
            } else if (attempt < maxAttempts) {
                // Retry after a delay if nothing found yet
                setTimeout(() => initializeTooltips(attempt + 1, maxAttempts), 200);
                return;
            }
        };
        
        // Start initialization with delay to ensure DOM is ready
        setTimeout(() => {
            initializeTooltips(1, 5);
        }, 100);
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
            <div class="entity-details-error d-flex flex-column align-items-center justify-content-center">
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h6>שגיאה בטעינת פרטי הישות</h6>
                    <p class="mb-0">${errorMessage}</p>
                </div>
                <button type="button" class="btn" data-onclick="window.entityDetailsModal.retry()">
                    נסה שוב
                </button>
            </div>
        `;
    }

    /**
     * Show modal using Bootstrap - הצגת המודל באמצעות Bootstrap
     * 
     * @private
     * @returns {Promise<void>}
     */
    async showModal() {
        if (!this.modal) return;

        try {
            // יצירת Bootstrap modal instance ללא backdrop (ננהל אותו באופן מרכזי)
            const bsModal = new bootstrap.Modal(this.modal, {
                backdrop: false, // ננהל backdrop מרכזית
                keyboard: true
            });
            
            console.log('🟡 [showModal] About to call bsModal.show()', {
                modalId: this.modal?.id,
                hasModalNavigationService: !!window.ModalNavigationService,
                timestamp: new Date().toISOString()
            });
            
            bsModal.show();
            
            console.log('🟡 [showModal] bsModal.show() called - waiting for shown.bs.modal event', {
                modalId: this.modal?.id,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            window.Logger.error('Error showing modal with Bootstrap:', error, { page: "entity-details-modal" });
            // fallback להצגה ישירה
            this.modal.style.display = 'block';
            this.modal.classList.add('show');
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
        
        // רישום סגירה במערכת הניווט (רק אם לא נסגר דרך goBack)
        // goBack כבר מטפל בהסרה מה-stack דרך registerModalClose עם internal: true
        if (window.ModalNavigationService?.registerModalClose) {
            // רק אם המודל עדיין ב-stack (לא נסגר דרך goBack)
            const stack = window.ModalNavigationService.getStack();
            const isInStack = stack.some(entry => entry.modalId === this.modalId && entry.instanceId === this.navigationInstanceId);
            if (isInStack) {
                window.ModalNavigationService.registerModalClose(this.modalId, { instanceId: this.navigationInstanceId });
            }
        } else if (window.registerModalNavigationClose) {
            window.registerModalNavigationClose(this.modalId);
        }

        this.navigationInstanceId = null;

        const contentElement = document.getElementById('entityDetailsContent');
        if (contentElement) {
            contentElement.innerHTML = '';
            if (window.Logger) {
                window.Logger.debug('✅ Cleared modal content after hide', {
                    modalId: this.modal?.id,
                    page: "entity-details-modal"
                });
            }
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
                window.Logger.warn(`Edit function not found for entity type: ${entityType}`, { page: "entity-details-modal" });
                if (window.showWarningNotification) {
                    window.showWarningNotification(`פונקציית עריכה לא נמצאה עבור ${entityType}`);
                }
            }
            
        } catch (error) {
            window.Logger.error('Error editing entity:', error, { page: "entity-details-modal" });
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
                trading_account: 'trading_accounts',
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
                window.Logger.warn(`Page URL not found for entity type: ${entityType}`, { page: "entity-details-modal" });
                if (window.showWarningNotification) {
                    window.showWarningNotification(`דף לא נמצא עבור סוג ישות זה`);
                }
            }
            
        } catch (error) {
            window.Logger.error('Error opening entity page:', error, { page: "entity-details-modal" });
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
                        window.Logger.error('Error loading linked items:', error, { page: "entity-details-modal" });
                        if (window.showErrorNotification) {
                            window.showErrorNotification('שגיאה בטעינת פריטים מקושרים');
                        }
                    });
            } else {
                window.Logger.warn('Linked items system not available', { page: "entity-details-modal" });
                if (window.showWarningNotification) {
                    window.showWarningNotification('מערכת הפריטים המקושרים לא זמינה');
                }
            }
            
        } catch (error) {
            window.Logger.error('Error showing linked items:', error, { page: "entity-details-modal" });
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
            window.Logger.error('Error exporting entity:', error, { page: "entity-details-modal" });
            if (window.showErrorNotification) {
                window.showErrorNotification(`שגיאה בייצוא: ${error.message}`);
            }
        }
    }

    /**
     * Load additional data for trading account - טעינת נתונים נוספים עבור חשבון מסחר
     * 
     * @param {Object} entityData - נתוני החשבון
     * @param {number|string} accountId - מזהה החשבון
     * @private
     */
    async loadAccountAdditionalData(entityData, accountId) {
        try {
            // 1. טעינת יתרות
            try {
                const balancesResponse = await fetch(`/api/account-activity/${accountId}/balances`);
                if (balancesResponse.ok) {
                    const balancesData = await balancesResponse.json();
                    if (balancesData.status === 'success' && balancesData.data) {
                        entityData.balances = balancesData.data;
                        
                        // הוספת שם מטבע ראשי
                        if (balancesData.data.base_currency_id && window.currenciesData) {
                            const baseCurrency = window.currenciesData.find(c => c.id === balancesData.data.base_currency_id);
                            if (baseCurrency) {
                                entityData.currency_name = baseCurrency.name || baseCurrency.symbol;
                                if (balancesData.data.base_currency_symbol) {
                                    entityData.currency_symbol = balancesData.data.base_currency_symbol;
                                }
                            }
                        } else if (entityData.currency_id && window.currenciesData) {
                            const currency = window.currenciesData.find(c => c.id === entityData.currency_id);
                            if (currency) {
                                entityData.currency_name = currency.name || currency.symbol;
                                entityData.currency_symbol = currency.symbol;
                            }
                        }
                    }
                }
            } catch (error) {
                window.Logger.warn('Error loading account balances:', error, { page: "entity-details-modal" });
            }

            // 2. טעינת תאריך תנועה אחרונה
            try {
                // חיפוש התאריך האחרון מבין linked_items (אם קיימים)
                let lastDate = null;
                if (entityData.linked_items && Array.isArray(entityData.linked_items)) {
                    entityData.linked_items.forEach(item => {
                        if (item.created_at) {
                            const itemDate = new Date(item.created_at);
                            if (!lastDate || itemDate > new Date(lastDate)) {
                                lastDate = item.created_at;
                            }
                        }
                    });
                }
                
                // אם לא מצאנו ב-linked_items, נטען מה-API
                if (!lastDate) {
                    const transactionResponse = await fetch(`/api/account-activity/${accountId}`);
                    if (transactionResponse.ok) {
                        const transactionData = await transactionResponse.json();
                        if (transactionData.status === 'success' && transactionData.data) {
                            // חיפוש התאריך האחרון מבין ביצועים ותזרימים
                            if (transactionData.data.executions && transactionData.data.executions.length > 0) {
                                const lastExecution = transactionData.data.executions
                                    .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))[0];
                                if (lastExecution) {
                                    lastDate = lastExecution.date || lastExecution.created_at;
                                }
                            }
                            if (transactionData.data.cash_flows && transactionData.data.cash_flows.length > 0) {
                                const lastCashFlow = transactionData.data.cash_flows
                                    .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))[0];
                                if (lastCashFlow) {
                                    const cashFlowDate = lastCashFlow.date || lastCashFlow.created_at;
                                    if (!lastDate || new Date(cashFlowDate) > new Date(lastDate)) {
                                        lastDate = cashFlowDate;
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (lastDate) {
                    entityData.last_transaction_date = lastDate;
                }
            } catch (error) {
                window.Logger.warn('Error loading last transaction date:', error, { page: "entity-details-modal" });
            }

            // 3. בדיקת ברירת מחדל מההעדפות - בדיוק כמו בעמוד התנועות (account-activity.js)
            try {
                let isDefault = null;
                let defaultAccountId = null;
                
                // בדיקה ראשונה - window.getPreference (כמו בעמוד התנועות)
                if (typeof window.getPreference === 'function') {
                    try {
                        // נסה עם default_trading_account (כמו בעמוד התנועות)
                        let prefValue = await window.getPreference('default_trading_account');
                        if (!prefValue) {
                            // נסה עם defaultAccountFilter
                            prefValue = await window.getPreference('defaultAccountFilter');
                        }
                        
                        if (prefValue && prefValue !== 'all' && prefValue !== null && prefValue !== undefined) {
                            // Try to parse as integer ID first
                            const parsed = parseInt(prefValue);
                            if (!isNaN(parsed)) {
                                defaultAccountId = parsed;
                            } else {
                                // Try to find account by name
                                if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
                                    const account = window.trading_accountsData.find(acc => acc.name === prefValue);
                                    if (account) {
                                        defaultAccountId = account.id;
                                    }
                                }
                            }
                            
                            if (defaultAccountId) {
                                isDefault = (defaultAccountId === parseInt(accountId));
                                window.Logger.debug(`✅ Got default account from getPreference: ${prefValue} -> ${defaultAccountId}, isDefault: ${isDefault}`, { page: "entity-details-modal" });
                            }
                        }
                    } catch (prefError) {
                        window.Logger.debug('window.getPreference failed, trying other methods', prefError, { page: "entity-details-modal" });
                    }
                }
                
                // בדיקה שנייה - getCurrentPreference (מטמון/API)
                if (isDefault === null && typeof window.getCurrentPreference === 'function') {
                    try {
                        let defaultAccountFilter = await window.getCurrentPreference('default_trading_account');
                        if (!defaultAccountFilter) {
                            defaultAccountFilter = await window.getCurrentPreference('defaultAccountFilter');
                        }
                        if (defaultAccountFilter && defaultAccountFilter !== 'all' && defaultAccountFilter !== null && defaultAccountFilter !== undefined) {
                            const parsed = parseInt(defaultAccountFilter);
                            if (!isNaN(parsed)) {
                                defaultAccountId = parsed;
                                isDefault = (defaultAccountId === parseInt(accountId));
                                window.Logger.debug(`✅ Got default account from getCurrentPreference: ${defaultAccountFilter}, isDefault: ${isDefault}`, { page: "entity-details-modal" });
                            }
                        }
                    } catch (prefError) {
                        window.Logger.debug('getCurrentPreference failed, trying other methods', prefError, { page: "entity-details-modal" });
                    }
                }
                
                // בדיקה שלישית - PreferencesCore ישירות
                if (isDefault === null && window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
                    try {
                        let defaultAccountFilter = await window.PreferencesCore.getPreference('default_trading_account');
                        if (!defaultAccountFilter || defaultAccountFilter === 'all') {
                            defaultAccountFilter = await window.PreferencesCore.getPreference('defaultAccountFilter');
                        }
                        if (defaultAccountFilter && defaultAccountFilter !== 'all' && defaultAccountFilter !== null && defaultAccountFilter !== undefined) {
                            const parsed = parseInt(defaultAccountFilter);
                            if (!isNaN(parsed)) {
                                defaultAccountId = parsed;
                                isDefault = (defaultAccountId === parseInt(accountId));
                                window.Logger.debug(`✅ Got default account from PreferencesCore: ${defaultAccountFilter}, isDefault: ${isDefault}`, { page: "entity-details-modal" });
                            }
                        }
                    } catch (coreError) {
                        window.Logger.debug('PreferencesCore.getPreference failed', coreError, { page: "entity-details-modal" });
                    }
                }
                
                // בדיקה רביעית - currentPreferences
                if (isDefault === null && window.currentPreferences) {
                    if (window.currentPreferences.default_trading_account) {
                        const parsed = parseInt(window.currentPreferences.default_trading_account);
                        if (!isNaN(parsed)) {
                            defaultAccountId = parsed;
                            isDefault = (defaultAccountId === parseInt(accountId));
                            window.Logger.debug(`✅ Got default_trading_account from currentPreferences: ${defaultAccountId}, isDefault: ${isDefault}`, { page: "entity-details-modal" });
                        }
                    } else if (window.currentPreferences.defaultAccountFilter && window.currentPreferences.defaultAccountFilter !== 'all') {
                        const parsed = parseInt(window.currentPreferences.defaultAccountFilter);
                        if (!isNaN(parsed)) {
                            defaultAccountId = parsed;
                            isDefault = (defaultAccountId === parseInt(accountId));
                            window.Logger.debug(`✅ Got defaultAccountFilter from currentPreferences: ${defaultAccountId}, isDefault: ${isDefault}`, { page: "entity-details-modal" });
                        }
                    }
                }
                
                // בדיקה חמישית - preferences.preferences.trading_settings
                if (isDefault === null && window.preferences && window.preferences.preferences && window.preferences.preferences.trading_settings) {
                    const defaultAccountFilter = window.preferences.preferences.trading_settings.defaultAccountFilter;
                    if (defaultAccountFilter && defaultAccountFilter !== 'all') {
                        const parsed = parseInt(defaultAccountFilter);
                        if (!isNaN(parsed)) {
                            defaultAccountId = parsed;
                            isDefault = (defaultAccountId === parseInt(accountId));
                            window.Logger.debug(`✅ Got defaultAccountFilter from preferences.trading_settings: ${defaultAccountFilter}, isDefault: ${isDefault}`, { page: "entity-details-modal" });
                        }
                    }
                }
                
                // בדיקה שישית - preferences.preferences ישירות
                if (isDefault === null && window.preferences && window.preferences.preferences) {
                    if (window.preferences.preferences.default_trading_account) {
                        const parsed = parseInt(window.preferences.preferences.default_trading_account);
                        if (!isNaN(parsed)) {
                            defaultAccountId = parsed;
                            isDefault = (defaultAccountId === parseInt(accountId));
                            window.Logger.debug(`✅ Got default_trading_account from preferences: ${defaultAccountId}, isDefault: ${isDefault}`, { page: "entity-details-modal" });
                        }
                    } else if (window.preferences.preferences.defaultAccountFilter && window.preferences.preferences.defaultAccountFilter !== 'all') {
                        const defaultAccountFilter = window.preferences.preferences.defaultAccountFilter;
                        const parsed = parseInt(defaultAccountFilter);
                        if (!isNaN(parsed)) {
                            defaultAccountId = parsed;
                            isDefault = (defaultAccountId === parseInt(accountId));
                            window.Logger.debug(`✅ Got defaultAccountFilter from preferences: ${defaultAccountFilter}, isDefault: ${isDefault}`, { page: "entity-details-modal" });
                        }
                    }
                }
                
                // אם מצאנו תוצאה - נקבע אותה, אחרת נשאיר undefined כדי שיוצג "לא זמין"
                entityData.is_default = isDefault !== null ? isDefault : undefined;
                
                if (isDefault === null) {
                    window.Logger.debug(`⚠️ Could not determine default account. accountId: ${accountId}, defaultAccountId: ${defaultAccountId}`, { page: "entity-details-modal" });
                } else {
                    window.Logger.info(`✅ Default account check: accountId=${accountId}, defaultAccountId=${defaultAccountId}, isDefault=${isDefault}`, { page: "entity-details-modal" });
                }
            } catch (error) {
                window.Logger.warn('Error checking default account:', error, { page: "entity-details-modal" });
                entityData.is_default = undefined; // אם יש שגיאה - לא זמין
            }
        } catch (error) {
            window.Logger.error('Error loading additional account data:', error, { page: "entity-details-modal" });
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
        
        if (window.Logger) {
            window.Logger.info('🔍 [1.1 showEntityDetails] Called with', {
                entityType: entityType,
                entityId: entityId,
                options: options,
                hasSource: !!options.source,
                source: options.source,
                sourceInfo: options.source,
                page: "entity-details-modal"
            });
        }
        
        if (window.entityDetailsModal) {
            window.entityDetailsModal.show(entityType, entityId, options);
        } else {
            window.Logger.error('EntityDetailsModal not initialized', { page: "entity-details-modal" });
            if (window.showErrorNotification) {
                window.showErrorNotification('מערכת פרטי ישויות לא מוכנה');
            }
        }
    } catch (error) {
        window.Logger.error('Error in showEntityDetails:', error, { page: "entity-details-modal" });
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
        window.Logger.error('Error in hideEntityDetails:', error, { page: "entity-details-modal" });
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
                    window.Logger.error('Error loading linked items:', error, { page: "entity-details-modal" });
                    if (window.showErrorNotification) {
                        window.showErrorNotification('שגיאה בטעינת פריטים מקושרים');
                    }
                });
        } else {
            window.Logger.error('Linked items system not available', { page: "entity-details-modal" });
            if (window.showErrorNotification) {
                window.showErrorNotification('מערכת הפריטים המקושרים לא זמינה');
            }
        }
    } catch (error) {
        window.Logger.error('Error in showLinkedItems:', error, { page: "entity-details-modal" });
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
        window.Logger.info(`✏️ Editing ticker ${tickerId}`, { page: "entity-details-modal" });
        
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
            window.Logger.error('Edit ticker modal not available', { page: "entity-details-modal" });
            if (window.showErrorNotification) {
                window.showErrorNotification('מודול עריכת טיקר לא זמין');
            }
        }
    } catch (error) {
        window.Logger.error('Error in editTicker:', error, { page: "entity-details-modal" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בפתיחת עריכת טיקר');
        }
    }
}

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize when DOM is ready - אתחול אוטומטי כשה-DOM מוכן
 */
// document.addEventListener('DOMContentLoaded', () => {
//     try {
//         // אתחול המחלקה הראשית
        new EntityDetailsModal();
        
        window.Logger.info('Entity Details Modal system loaded and ready', { page: "entity-details-modal" });
        
//     } catch (error) {
//         window.Logger.error('Error auto-initializing EntityDetailsModal:', error, { page: "entity-details-modal" });
//     }
// });

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

// ===== GLOBAL FUNCTION EXPORTS =====

// Export functions to global scope
window.showEntityDetails = showEntityDetails;
window.hideEntityDetails = hideEntityDetails;