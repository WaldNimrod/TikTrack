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
        this.sourceInfo = null; // מידע על המודול המקור (אם נפתח ממודול אחר)
        
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
                    trading_account: 'חשבון מסחר',
                    alert: 'התראה',
                    cash_flow: 'תזרים מזומנים',
                    note: 'הערה'
                };
                const entityName = entityNames[entityType] || 'ישות';
                titleElement.textContent = `פרטי ${entityName} #${entityId}`;
            }

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
            
            // בדיקה אם המודול כבר בהיסטוריה עם תוכן שמור
            // חשוב: אם skipCachedContent=true, נטען מחדש מה-API גם אם יש תוכן שמור
            // זה חשוב במיוחד ב-goBack כדי לוודא שהנתונים נכונים
            let shouldLoadData = true;
            if (!options.skipCachedContent && window.modalNavigationManager && this.modal) {
                const historyItem = window.modalNavigationManager.modalHistory.find(
                    item => item.element === this.modal &&
                           item.info?.entityType === entityType &&
                           item.info?.entityId === entityId &&
                           item.content
                );
                
                if (historyItem && historyItem.content) {
                    // המודול כבר בהיסטוריה עם תוכן שמור - נשתמש בו
                    const contentElement = document.getElementById('entityDetailsContent');
                    if (contentElement) {
                        contentElement.innerHTML = historyItem.content;
                        shouldLoadData = false;
                        
                        if (window.Logger) {
                            window.Logger.info('✅ Using saved content from history (skipping loadEntityData)', {
                                entityType,
                                entityId,
                                contentLength: historyItem.content.length,
                                page: "entity-details-modal"
                            });
                        }
                        
                        // עדכון sourceInfo אם קיים
                        if (historyItem.info?.sourceInfo) {
                            this.sourceInfo = historyItem.info.sourceInfo;
                        }
                        
                        // עדכון כותרת וניווט
                        this.updateModalTitle(entityType, null); // יעודכן מה-content
                        if (window.modalNavigationManager && window.modalNavigationManager.isInitialized) {
                            window.modalNavigationManager.updateModalNavigation(this.modal);
                        }
                    }
                }
            } else if (options.skipCachedContent) {
                if (window.Logger) {
                    window.Logger.info('🔄 skipCachedContent=true - will reload from API (called from goBack)', {
                        entityType,
                        entityId,
                        page: "entity-details-modal"
                    });
                }
            }
            
            if (shouldLoadData) {
                // הצגת מצב טעינה
                this.showLoadingState();

                // הצגת המודל
                await this.showModal();

                // טעינת הנתונים
                await this.loadEntityData(entityType, entityId, options);
            } else {
                // רק הצגת המודל (התוכן כבר שחזרנו)
                await this.showModal();
            }

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
                // הסרה ממערכת ניהול הניווט (תקרה אוטומטית ב-handleModalHidden)
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

        // עדכון מידע במערכת ניהול הניווט
        if (window.modalNavigationManager && this.modal) {
            const modalInfo = {
                type: 'entity-details',
                entityType: entityType,
                entityId: entityId,
                title: this.getModalTitleText(entityType, entityData),
                sourceInfo: this.sourceInfo || null // הוספת sourceInfo אם קיים
            };
            // ✅ לא נקרא ל-pushModal כאן - handleModalShown() כבר קרא ל-pushModal אוטומטית
            // אחרי ש-Bootstrap מפעיל את האירוע shown.bs.modal
            // זה מונע כפילות של 3 קריאות ל-pushModal עבור אותו מודול
            
            // עדכון מידע המודול בהיסטוריה אם הוא כבר קיים
            // (אבל לא נוסיף מודול חדש - זה נעשה ב-handleModalShown)
            if (window.modalNavigationManager) {
                const contentElement = document.getElementById('entityDetailsContent');
                const savedContent = contentElement && contentElement.innerHTML ? contentElement.innerHTML : null;
                
                // חיפוש המודול בהיסטוריה - לפי element או לפי entityType + entityId + sourceInfo
                let currentIndex = window.modalNavigationManager.modalHistory.findIndex(item => item.element === this.modal);
                
                // ✅ תיקון: חיפוש לפי element בלבד - לא נעדכן את modalHistory ישירות!
                // כל העדכונים נעשים דרך pushModal בלבד!
                // אם לא נמצא לפי element, זה אומר שהמודול עדיין לא נוסף ל-history
                // handleModalShown יוסיף אותו, ואז נוכל לעדכן את התוכן
                
                if (currentIndex >= 0) {
                    // מודול קיים בהיסטוריה - נעדכן רק את התוכן (לא את ה-info!)
                    // ה-info מתעדכן רק דרך pushModal!
                    if (savedContent) {
                        const existingContent = window.modalNavigationManager.modalHistory[currentIndex].content;
                        // עדכון התוכן אם הוא יותר טוב מהקיים (או אם אין תוכן קיים)
                        if (!existingContent || savedContent.length > existingContent.length) {
                            window.modalNavigationManager.modalHistory[currentIndex].content = savedContent;
                        }
                    }
                    // ✅ לא מעדכנים את ה-info או את ה-timestamp - זה נעשה רק דרך pushModal!
                } else {
                    // המודול לא נמצא בהיסטוריה - handleModalShown אמור להוסיף אותו
                    // נחכה קצת ונוסיף את התוכן אם המודול יתווסף מאוחר יותר
                    if (window.Logger) {
                        window.Logger.debug('ℹ️ Modal not found in history in loadEntityData - handleModalShown should add it soon', {
                            entityType,
                            entityId,
                            historyLength: window.modalNavigationManager.modalHistory.length,
                            modalInfoSourceInfo: modalInfo.sourceInfo,
                            page: "entity-details-modal"
                        });
                    }
                    // נחכה קצת ונוסיף את התוכן אם המודול יתווסף מאוחר יותר
                    setTimeout(async () => {
                        const retryIndex = window.modalNavigationManager.modalHistory.findIndex(item => item.element === this.modal);
                        if (retryIndex >= 0 && savedContent) {
                            window.modalNavigationManager.modalHistory[retryIndex].content = savedContent;
                            // ✅ לא שומרים למטמון - הוסרנו את כל השימוש במטמון
                        }
                    }, 200);
                }
            }
            // ✅ לא נקרא ל-updateModalNavigation כאן - handleModalShown() כבר קרא לו
            // ואם צריך עדכון נוסף, updateModalTitle() יקרא לו
            // זה מונע כפילות של קריאות ל-updateModalNavigation
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
        
        // שמירת התוכן ב-history אחרי שהוטען (חשוב לשמור אחרי שהוצג)
        // זה מבטיח שהתוכן המלא נשמר, גם אחרי שכל הנתונים נטענו
        if (window.modalNavigationManager && this.modal) {
            const contentElement = document.getElementById('entityDetailsContent');
            if (contentElement && contentElement.innerHTML && contentElement.innerHTML.trim().length > 0) {
                // עדכון התוכן ב-history item הנוכחי
                // נחפש את המודול האחרון בהיסטוריה (יכול להיות שהוא עדיין לא נשמר)
                const currentHistoryIndex = window.modalNavigationManager.modalHistory.findIndex(
                    item => item.element === this.modal &&
                           item.info?.entityType === entityType &&
                           item.info?.entityId === entityId
                );
                
                if (currentHistoryIndex >= 0) {
                    // שמירת התוכן - תמיד נעדכן את התוכן אם הוא קיים
                    // ✅ תיקון: ניהול אחיד - אין הגנות מיוחדות על הראשונה
                    window.modalNavigationManager.modalHistory[currentHistoryIndex].content = contentElement.innerHTML;
                    
                    // ✅ תיקון: עדכון title ב-modalHistory אחרי updateModalTitle()
                    // נעדכן גם את המודול הראשון אם הוא כבר שם (כותרת יכולה להשתנות)
                    const titleElement = document.getElementById(`${this.modalId}Label`);
                    if (titleElement) {
                        const titleText = titleElement.textContent || titleElement.innerText || '';
                        if (titleText.trim()) {
                            window.modalNavigationManager.modalHistory[currentHistoryIndex].info.title = titleText.trim();
                            
                            // ✅ תיקון: לא שומרים למטמון - הוסרנו את כל השימוש במטמון
                            // if (window.modalNavigationManager.saveHistoryToCache) {
                            //     await window.modalNavigationManager.saveHistoryToCache();
                            // }
                            
                            if (window.Logger) {
                                window.Logger.debug('✅ Updated modal title in history', {
                                    entityType,
                                    entityId,
                                    title: titleText.trim(),
                                    historyIndex: currentHistoryIndex,
                                    page: "entity-details-modal"
                                });
                            }
                        }
                    }
                    
                    if (window.Logger) {
                        window.Logger.debug('✅ Saved modal content to history after loading', {
                            entityType,
                            entityId,
                            contentLength: contentElement.innerHTML.length,
                            historyIndex: currentHistoryIndex,
                            hadPreviousContent: !!window.modalNavigationManager.modalHistory[currentHistoryIndex].content,
                            page: "entity-details-modal"
                        });
                    }
                } else {
                    // המודול לא נמצא בהיסטוריה - אולי הוא עדיין לא נוסף?
                    // נחפש רק לפי element (אולי entityType/Id שונים)
                    const modalHistoryIndex = window.modalNavigationManager.modalHistory.findIndex(
                        item => item.element === this.modal
                    );
                    
                    if (modalHistoryIndex >= 0) {
                        // ✅ תיקון: ניהול אחיד - אין הגנות מיוחדות על הראשונה
                        window.modalNavigationManager.modalHistory[modalHistoryIndex].content = contentElement.innerHTML;
                        
                        // ✅ תיקון: לא שומרים למטמון - הוסרנו את כל השימוש במטמון
                        // if (window.modalNavigationManager.saveHistoryToCache) {
                        //     await window.modalNavigationManager.saveHistoryToCache();
                        // }
                        if (window.Logger) {
                            window.Logger.debug('✅ Saved modal content to history (by element only)', {
                                entityType,
                                entityId,
                                contentLength: contentElement.innerHTML.length,
                                historyIndex: modalHistoryIndex,
                                historyEntityType: window.modalNavigationManager.modalHistory[modalHistoryIndex].info?.entityType,
                                historyEntityId: window.modalNavigationManager.modalHistory[modalHistoryIndex].info?.entityId,
                                page: "entity-details-modal"
                            });
                        }
                    } else {
                        // המודול לא נמצא בהיסטוריה - יכול להיות שהוא עוד לא נוסף או שהוא נמחק
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Cannot save content - modal not found in history', {
                                entityType,
                                entityId,
                                modalExists: !!this.modal,
                                modalId: this.modal?.id,
                                historyLength: window.modalNavigationManager.modalHistory.length,
                                page: "entity-details-modal"
                            });
                        }
                    }
                }
            }
        }
        
        // בדיקת DOM לאחר render - שלב 2.2
        if (window.Logger) {
            setTimeout(() => {
                try {
                    // חיפוש כפתור VIEW בפריט מקושר
                    const viewButton = this.modal?.querySelector('button[data-button-type="VIEW"]');
                    if (viewButton) {
                        const dataOnclick = viewButton.getAttribute('data-onclick');
                        window.Logger.info('✅ [2.2 loadEntityData] DOM check after showRenderedContent', {
                            foundViewButton: true,
                            dataOnclick: dataOnclick,
                            dataOnclickLength: dataOnclick?.length || 0,
                            hasSourceInOnclick: dataOnclick?.includes('source:') || false,
                            expectedSourceInfo: this.sourceInfo,
                            page: "entity-details-modal"
                        });
                    } else {
                        window.Logger.info('⚠️ [2.2 loadEntityData] No VIEW button found in DOM', {
                            foundViewButton: false,
                            modalExists: !!this.modal,
                            page: "entity-details-modal"
                        });
                    }
                } catch (error) {
                    window.Logger.warn('⚠️ [2.2 loadEntityData] Error checking DOM', {
                        error: error.message,
                        page: "entity-details-modal"
                    });
                }
            }, 500); // המתנה קצרה כדי לתת ל-DOM להתעדכן
        }

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
    getEntityIcon(entityType) {
        const iconMappings = {
            ticker: '/trading-ui/images/icons/tickers.svg',
            trade: '/trading-ui/images/icons/trades.svg',
            trade_plan: '/trading-ui/images/icons/trade_plans.svg',
            execution: '/trading-ui/images/icons/executions.svg',
            account: '/trading-ui/images/icons/trading_accounts.svg',
            alert: '/trading-ui/images/icons/alerts.svg',
            cash_flow: '/trading-ui/images/icons/cash_flows.svg',
            note: '/trading-ui/images/icons/notes.svg',
            preference: '/trading-ui/images/icons/preferences.svg',
            research: '/trading-ui/images/icons/research.svg',
            design: '/trading-ui/images/icons/design.svg',
            constraint: '/trading-ui/images/icons/constraint.svg',
            development: '/trading-ui/images/icons/development.svg',
            info: '/trading-ui/images/icons/info.svg',
            position: '/trading-ui/images/icons/trades.svg'
        };

        return iconMappings[entityType] || '/trading-ui/images/icons/home.svg';
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
            
            const iconPath = this.getEntityIcon(finalEntityType);
            
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
            
            const iconPath = this.getEntityIcon(finalEntityType);
            
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
        const validEntityTypes = ['trade', 'ticker', 'trading_account', 'alert', 'cash_flow', 'cash-flow', 'note', 'trade_plan', 'trade-plan', 'execution', 'preference', 'research', 'design', 'constraint', 'development', 'position'];
        validEntityTypes.forEach(type => {
            headerElement.classList.remove(`entity-${type}`);
        });
        
        // הוספת מחלקת ישות חדשה - CSS ידאג לצבעים מההעדפות!
        if (entityType) {
            const normalizedType = entityType.replace('_', '-').toLowerCase();
            headerElement.classList.add(`entity-${normalizedType}`);
            
            // הוספת data-entity-type למודול (אם לא קיים)
            if (!modalElement.hasAttribute('data-entity-type')) {
                modalElement.setAttribute('data-entity-type', entityType);
            }
            
            if (window.Logger) {
                window.Logger.info(`🎨 Applied entity class to modal header: entity-${normalizedType}`, { page: "entity-details-modal" });
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
        // Use multiple attempts to ensure tooltips are initialized even if systems load slowly
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
            
            // If we found containers, initialize tooltips
            if (filterContainers.length > 0 || filterButtonsContainers.length > 0) {
                const containersToProcess = filterContainers.length > 0 ? filterContainers : filterButtonsContainers;
                
                containersToProcess.forEach(container => {
                    // Extract tableId from container ID (linkedItemsFilter_linkedItemsTable_alert_2 -> linkedItemsTable_alert_2)
                    const containerId = container.id;
                    const tableId = containerId.replace('linkedItemsFilter_', '');
                    console.log(`🔍 [Tooltip Debug] Initializing tooltips for tableId: ${tableId}`);
                    
                    if (window.entityDetailsRenderer && window.entityDetailsRenderer._initializeFilterTooltips) {
                        window.entityDetailsRenderer._initializeFilterTooltips(tableId);
                    } else {
                        // Fallback: initialize tooltips directly if renderer method not available
                        initializeTooltipsDirectly(container);
                    }
                });
            } else if (buttonsWithTooltip.length > 0) {
                // Fallback: if we found buttons but no containers, initialize directly
                console.log(`🔍 [Tooltip Debug] Found ${buttonsWithTooltip.length} buttons with data-tooltip, initializing directly`);
                const container = buttonsWithTooltip[0].closest('.filter-buttons-container');
                if (container) {
                    initializeTooltipsDirectly(container);
                }
            } else if (attempt < maxAttempts) {
                // Retry after a delay if nothing found yet
                setTimeout(() => initializeTooltips(attempt + 1, maxAttempts), 200);
                return;
            }
            
            // Also try finding tables directly as fallback
            if ((filterContainers.length === 0 && filterButtonsContainers.length === 0) && attempt < maxAttempts) {
                const linkedItemsTables = searchScope.querySelectorAll('[id^="linkedItemsTable_"]');
                console.log(`🔍 [Tooltip Debug] Fallback: Found ${linkedItemsTables.length} linked items tables`);
                linkedItemsTables.forEach(table => {
                    const tableId = table.id;
                    if (window.entityDetailsRenderer && window.entityDetailsRenderer._initializeFilterTooltips) {
                        window.entityDetailsRenderer._initializeFilterTooltips(tableId);
                    }
                });
            }
        };
        
        // Helper function to initialize tooltips directly
        const initializeTooltipsDirectly = (container) => {
            const buttonsWithTooltip = container.querySelectorAll('[data-tooltip]');
            if (buttonsWithTooltip.length === 0) return;
            
            console.log(`🔍 [Tooltip Debug] Direct initialization for ${buttonsWithTooltip.length} buttons`);
            
            // Check if Bootstrap is available
            if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) {
                console.warn('🔍 [Tooltip Debug] Bootstrap not available, skipping direct initialization');
                return;
            }
            
            buttonsWithTooltip.forEach((btn) => {
                try {
                    // Destroy existing tooltip if exists
                    const existingTooltip = bootstrap.Tooltip.getInstance(btn);
                    if (existingTooltip) {
                        existingTooltip.dispose();
                    }
                    
                    const tooltipText = btn.getAttribute('data-tooltip');
                    const placement = btn.getAttribute('data-tooltip-placement') || 'top';
                    const trigger = btn.getAttribute('data-tooltip-trigger') || 'hover';
                    
                    if (tooltipText) {
                        new bootstrap.Tooltip(btn, {
                            title: tooltipText,
                            placement: placement,
                            trigger: trigger
                        });
                        console.log(`✅ [Tooltip Debug] Directly initialized tooltip for button: ${btn.id || btn.getAttribute('data-type')}`);
                    }
                } catch (error) {
                    console.error(`❌ [Tooltip Debug] Error initializing tooltip:`, error);
                }
            });
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
            
            // ✅ לא נקרא ל-pushModal כאן - handleModalShown() יקרא ל-pushModal אוטומטית
            // אחרי ש-Bootstrap מפעיל את האירוע shown.bs.modal
            // זה מונע כפילות של 3 קריאות ל-pushModal עבור אותו מודול
            
            console.log('🟡 [showModal] About to call bsModal.show()', {
                modalId: this.modal?.id,
                hasModalNavigationManager: !!window.modalNavigationManager,
                isInitialized: window.modalNavigationManager?.isInitialized,
                timestamp: new Date().toISOString()
            });
            
            bsModal.show();
            
            console.log('🟡 [showModal] bsModal.show() called - waiting for shown.bs.modal event', {
                modalId: this.modal?.id,
                timestamp: new Date().toISOString()
            });
            
            // ניקוי backdrops אחרי show() - Bootstrap עלול ליצור backdrop למרות backdrop: false
            // נקרא ל-manageBackdrop כדי לנקות כל backdrops שנוצרו ולשמור רק אחד גלובלי
            if (window.modalNavigationManager && window.modalNavigationManager.manageBackdrop) {
                // קריאה מיידית ואחת נוספת אחרי זמן קצר (למקרה ש-Bootstrap יוצר backdrop אחרי show())
                window.modalNavigationManager.manageBackdrop();
                setTimeout(() => {
                    window.modalNavigationManager.manageBackdrop();
                }, 100);
            }
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
        
        // ניקוי backdrop - חובה! זה מבטיח שה-backdrop תמיד יוסר כשהמודול נסגר
        if (window.modalNavigationManager && typeof window.modalNavigationManager.manageBackdrop === 'function') {
            window.modalNavigationManager.manageBackdrop();
        }
        
        // ניקוי תוכן המודל - רק אם המודול לא בהיסטוריה
        // (אם המודול בהיסטוריה, התוכן נשמר שם ולא צריך למחוק אותו)
        if (window.modalNavigationManager) {
            const isInHistory = window.modalNavigationManager.modalHistory.some(
                item => item.element === this.modal
            );
            
            if (!isInHistory) {
                // המודול לא בהיסטוריה - אפשר למחוק את התוכן
                const contentElement = document.getElementById('entityDetailsContent');
                if (contentElement) {
                    contentElement.innerHTML = '';
                    if (window.Logger) {
                        window.Logger.debug('✅ Cleared modal content (not in history)', {
                            modalId: this.modal?.id,
                            page: "entity-details-modal"
                        });
                    }
                }
            } else {
                // המודול בהיסטוריה - התוכן כבר נשמר, לא צריך למחוק
                if (window.Logger) {
                    window.Logger.debug('ℹ️ Modal content preserved (in history)', {
                        modalId: this.modal?.id,
                        page: "entity-details-modal"
                    });
                }
            }
        } else {
            // אין modalNavigationManager - מוחקים את התוכן (fallback)
            const contentElement = document.getElementById('entityDetailsContent');
            if (contentElement) {
                contentElement.innerHTML = '';
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