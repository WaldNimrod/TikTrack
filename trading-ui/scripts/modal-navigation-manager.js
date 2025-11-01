/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 15
 * 
 * MODAL STACK MANAGEMENT (5)
 * - pushModal() - הוספת מודול ל-stack והיסטוריה
 * - popModal() - הסרת מודול אחרון, חזרה לקודם
 * - goBack() - חזרה למודול הקודם
 * - getHistoryLength() - קבלת מספר מודולים בהיסטוריה
 * - clearHistory() - ניקוי כל ההיסטוריה
 * 
 * BACKDROP MANAGEMENT (3)
 * - manageBackdrop() - יצירה/עדכון/הסרה של backdrop גלובלי
 * - createGlobalBackdrop() - יצירת backdrop גלובלי
 * - removeGlobalBackdrop() - הסרת backdrop גלובלי
 * 
 * BREADCRUMB & NAVIGATION (3)
 * - getBreadcrumb() - יצירת breadcrumb trail מההיסטוריה
 * - updateModalNavigation() - עדכון breadcrumb וכפתור חזור במודול
 * - canGoBack() - בדיקה אם ניתן לחזור אחורה
 * 
 * MODAL DETECTION (2)
 * - detectModalInfo() - זיהוי מידע על מודול (סוג, ישות, מזהה)
 * - isModalElement() - בדיקה אם אלמנט הוא מודול
 * 
 * UTILITIES (2)
 * - getModalTitle() - קבלת כותרת מודול
 * - getEntityLabel() - קבלת שם ישות בעברית
 * 
 * ==========================================
 */
/**
 * Modal Navigation Manager - TikTrack
 * ====================================
 * 
 * מערכת ניהול מודולים מקוננים עם היסטוריית ניווט, backdrop גלובלי, ו-breadcrumb
 * 
 * תכונות עיקריות:
 * - ניהול stack של מודולים פתוחים
 * - backdrop גלובלי אחד לכל המודולים
 * - breadcrumb trail לניווט
 * - כפתור חזור אוטומטי
 * - תמיכה בכל סוגי המודולים (פרטים, עריכה, וכו')
 * - תמיכה בהרחבות עתידיות
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/MODAL_NAVIGATION_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-01-28
 * 
 * @module ModalNavigationManager
 */

// ===== MODAL NAVIGATION MANAGER CLASS =====

/**
 * ModalNavigationManager - מחלקה לניהול מודולים מקוננים
 * 
 * @class ModalNavigationManager
 */
class ModalNavigationManager {
    
    /**
     * Constructor - אתחול ModalNavigationManager
     * 
     * @constructor
     */
    constructor() {
        /**
         * Stack של מודולים פתוחים
         * @type {Array<Object>}
         * @private
         */
        this.modalHistory = [];
        
        /**
         * רפרנס ל-backdrop הגלובלי
         * @type {HTMLElement|null}
         * @private
         */
        this.globalBackdrop = null;
        
        /**
         * סטטוס אתחול
         * @type {boolean}
         * @private
         */
        this.isInitialized = false;
        
        // אתחול המערכת
        this.init();
    }
    
    /**
     * Initialize ModalNavigationManager - אתחול המערכת
     * 
     * @private
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // טעינת היסטוריה ממטמון אם קיים
            await this.loadHistoryFromCache();
            
            // מאזין לסגירת מודולים
            document.addEventListener('hidden.bs.modal', (event) => {
                this.handleModalHidden(event.target);
            });
            
            // מאזין לפתיחת מודולים
            document.addEventListener('shown.bs.modal', (event) => {
                this.handleModalShown(event.target);
            });
            
            this.isInitialized = true;
            
            // הוספה לאובייקט הגלובלי
            window.modalNavigationManager = this;
            
            if (typeof window.Logger !== 'undefined' && window.Logger.info) {
                window.Logger.info('ModalNavigationManager initialized successfully', { 
                    historyLoaded: this.modalHistory.length,
                    page: "modal-navigation-manager" 
                });
            } else {
                console.log('ModalNavigationManager initialized successfully', { historyLoaded: this.modalHistory.length });
            }
        } catch (error) {
            if (typeof window.Logger !== 'undefined' && window.Logger.error) {
                window.Logger.error('Error initializing ModalNavigationManager:', error, { page: "modal-navigation-manager" });
            } else {
                console.error('Error initializing ModalNavigationManager:', error);
            }
        }
    }
    
    /**
     * Load history from cache - טעינת היסטוריה ממטמון
     * 
     * @private
     * @returns {Promise<void>}
     */
    async loadHistoryFromCache() {
        try {
            // Check UnifiedCacheManager availability with proper validation
            if (typeof window.UnifiedCacheManager !== 'undefined' && 
                window.UnifiedCacheManager !== null &&
                window.UnifiedCacheManager.initialized === true) {
                const cachedHistory = await window.UnifiedCacheManager.get('modal-navigation-history', {
                    layer: 'localStorage',
                    fallback: () => []
                });
                
                if (cachedHistory && Array.isArray(cachedHistory) && cachedHistory.length > 0) {
                    // ניקוי אלמנטים שלא קיימים יותר ב-DOM
                    const validHistory = [];
                    for (const item of cachedHistory) {
                        // בדיקה אם המודול עדיין קיים (אם יש element reference)
                        // במקרה של טעינה מחדש, ה-element לא יהיה קיים, אז נשמור רק את ה-info
                        if (item.info) {
                            validHistory.push({
                                element: null, // יוגדר מחדש כשהמודול יפתח
                                info: item.info,
                                timestamp: item.timestamp || Date.now()
                            });
                        }
                    }
                    
                    // שמירה רק אם יש פריטים תקפים (לא נטען היסטוריה מלאה אחרי רענון)
                    // למניעת בעיות, נשמור רק את המבנה אבל לא את ה-elements
                    // Elements יוגדרו מחדש כשהמודולים יפתחו
                    if (validHistory.length > 0) {
                        // לא נטען את ההיסטוריה המלאה - רק נוודא שיש גישה אליה
                        // ההיסטוריה תיבנה מחדש כשהמודולים יפתחו
                        if (window.Logger) {
                            window.Logger.debug('Modal history found in cache (will rebuild on modal open)', {
                                cachedCount: validHistory.length,
                                page: "modal-navigation-manager"
                            });
                        }
                    }
                }
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error loading modal history from cache:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Save history to cache - שמירת היסטוריה למטמון
     * 
     * @private
     * @returns {Promise<void>}
     */
    async saveHistoryToCache() {
        try {
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                // שמירה רק של ה-info (לא ה-element references) למטמון
                const historyToSave = this.modalHistory.map(item => ({
                    info: item.info,
                    timestamp: item.timestamp
                }));
                
                await window.UnifiedCacheManager.save('modal-navigation-history', historyToSave, {
                    layer: 'localStorage',
                    ttl: 3600000 // 1 שעה
                });
                
                if (window.Logger) {
                    window.Logger.debug('Modal history saved to cache', {
                        count: historyToSave.length,
                        page: "modal-navigation-manager"
                    });
                }
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error saving modal history to cache:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Handle modal shown event - טיפול באירוע פתיחת מודול
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול שנפתח
     * @private
     * @returns {Promise<void>}
     */
    async handleModalShown(modalElement) {
        try {
            if (window.Logger) {
                window.Logger.info('🎬 handleModalShown called', {
                    modalId: modalElement?.id,
                    historyLength: this.modalHistory.length,
                    page: "modal-navigation-manager"
                });
            }
            
            // רק אם זה מודול חדש (לא כבר בהיסטוריה)
            const existingIndex = this.modalHistory.findIndex(item => item.element === modalElement);
            
            if (window.Logger) {
                window.Logger.debug('🔍 Checking if modal exists in history', {
                    modalId: modalElement?.id,
                    existingIndex,
                    isNewModal: existingIndex === -1,
                    historyLength: this.modalHistory.length,
                    page: "modal-navigation-manager"
                });
            }
            
            if (existingIndex === -1) {
                // זיהוי מידע על המודול
                const modalInfo = this.detectModalInfo(modalElement);
                
                if (window.Logger) {
                    window.Logger.info('📥 Adding new modal to history (from handleModalShown)', {
                        modalId: modalElement?.id,
                        modalInfo,
                        page: "modal-navigation-manager"
                    });
                }
                
                // הוספה ל-stack
                await this.pushModal(modalElement, modalInfo);
            } else {
                if (window.Logger) {
                    window.Logger.debug('ℹ️ Modal already in history, skipping pushModal', {
                        modalId: modalElement?.id,
                        existingIndex,
                        page: "modal-navigation-manager"
                    });
                }
            }
            
            // עדכון backdrop
            this.manageBackdrop();
            
            // עדכון navigation UI - חשוב מאוד! זה מוסיף את breadcrumb וכפתור חזור
            if (window.Logger) {
                window.Logger.info('📞 Scheduling updateModalNavigation from handleModalShown (100ms delay)', {
                    modalId: modalElement?.id,
                    page: "modal-navigation-manager"
                });
            }
            
            setTimeout(() => {
                if (window.Logger) {
                    window.Logger.info('📞 Executing updateModalNavigation from handleModalShown (after delay)', {
                        modalId: modalElement?.id,
                        page: "modal-navigation-manager"
                    });
                }
                this.updateModalNavigation(modalElement);
            }, 100); // קצת delay כדי לוודא שהכותרת עודכנה
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error handling modal shown:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Handle modal hidden event - טיפול באירוע סגירת מודול
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול שנסגר
     * @private
     * @returns {Promise<void>}
     */
    async handleModalHidden(modalElement) {
        try {
            // הסרה מה-stack רק אם זה המודול האחרון
            const lastIndex = this.modalHistory.length - 1;
            if (lastIndex >= 0 && this.modalHistory[lastIndex].element === modalElement) {
                await this.popModal();
            }
            
            // עדכון backdrop
            this.manageBackdrop();
            
            // עדכון navigation UI של המודול הקודם (אם יש)
            const previousModal = this.getPreviousModal();
            if (previousModal) {
                this.updateModalNavigation(previousModal.element);
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error handling modal hidden:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Push modal to stack - הוספת מודול ל-stack והיסטוריה
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @param {Object} modalInfo - מידע על המודול (type, entityType, entityId, title)
     * @public
     * @returns {Promise<void>}
     */
    async pushModal(modalElement, modalInfo = null) {
        try {
            // אם לא סופק modalInfo, ננסה לזהות אותו
            if (!modalInfo) {
                modalInfo = this.detectModalInfo(modalElement);
            }
            
            // בדיקה אם המודול כבר בהיסטוריה
            const existingIndex = this.modalHistory.findIndex(item => item.element === modalElement);
            
            // בדיקה אם זה מודול מקונן (יש sourceInfo)
            const hasSourceInfo = modalInfo && (modalInfo.sourceInfo || modalInfo.source);
            const isNestedModal = hasSourceInfo && this.modalHistory.length > 0;
            
            // אם המודול כבר קיים והמיקום הוא המודול האחרון - רק נעדכן
            // אבל אם זה מודול עם sourceInfo (מודול מקונן), נוסיף אותו שוב להיסטוריה
            const isLastModal = existingIndex >= 0 && existingIndex === this.modalHistory.length - 1;
            
            if (isNestedModal) {
                // מודול מקונן - תמיד נוסיף להיסטוריה, גם אם זה אותו element
                // זה מאפשר לשמור את המודול הקודם ולאפשר חזרה
                this.modalHistory.push({
                    element: modalElement,
                    info: modalInfo,
                    timestamp: Date.now()
                });
                
                if (window.Logger) {
                    window.Logger.info('✅ Pushed nested modal to stack (with sourceInfo):', {
                        modalInfo,
                        sourceInfo: modalInfo.sourceInfo || modalInfo.source,
                        existingIndex,
                        historyLength: this.modalHistory.length,
                        previousModal: this.modalHistory.length > 1 ? {
                            entityType: this.modalHistory[this.modalHistory.length - 2].info?.entityType,
                            entityId: this.modalHistory[this.modalHistory.length - 2].info?.entityId
                        } : null,
                        page: "modal-navigation-manager"
                    });
                }
            } else if (isLastModal) {
                // עדכון מודול אחרון ללא sourceInfo - רק עדכון (לא מודול מקונן)
                this.modalHistory[existingIndex].info = modalInfo;
                this.modalHistory[existingIndex].timestamp = Date.now();
                
                if (window.Logger) {
                    window.Logger.debug('Updated last modal in history (same context, no nesting):', {
                        modalInfo,
                        historyLength: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
            } else {
                // מודול חדש שלא נמצא בהיסטוריה - נוסיף להיסטוריה
                this.modalHistory.push({
                    element: modalElement,
                    info: modalInfo,
                    timestamp: Date.now()
                });
                
                if (window.Logger) {
                    window.Logger.debug('Pushed new modal to stack:', {
                        modalInfo,
                        existingIndex,
                        historyLength: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
            }
            
            // שמירה למטמון
            await this.saveHistoryToCache();
            
            if (window.Logger) {
                window.Logger.debug(`Modal stack updated (${this.modalHistory.length} total)`, {
                    modalInfo,
                    page: "modal-navigation-manager"
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error pushing modal to stack:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Pop modal from stack - הסרת מודול אחרון, חזרה לקודם
     * 
     * @public
     * @returns {Promise<Object|null>} המודול שהוסר או null אם אין מודולים
     */
    async popModal() {
        try {
            if (this.modalHistory.length === 0) {
                return null;
            }
            
            const removed = this.modalHistory.pop();
            
            // שמירה למטמון
            await this.saveHistoryToCache();
            
            if (window.Logger) {
                window.Logger.debug(`Popped modal from stack (${this.modalHistory.length} remaining)`, {
                    modalInfo: removed.info,
                    page: "modal-navigation-manager"
                });
            }
            
            return removed;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error popping modal from stack:', error, { page: "modal-navigation-manager" });
            }
            return null;
        }
    }
    
    /**
     * Go back to previous modal - חזרה למודול הקודם
     * 
     * @public
     * @returns {boolean} true אם חזרנו בהצלחה, false אחרת
     */
    goBack() {
        try {
            if (window.Logger) {
                window.Logger.debug('🔙 goBack() called', {
                    historyLength: this.modalHistory.length,
                    history: this.modalHistory.map((item, idx) => ({
                        index: idx,
                        entityType: item.info?.entityType,
                        entityId: item.info?.entityId
                    })),
                    page: "modal-navigation-manager"
                });
            }
            
            if (this.modalHistory.length <= 1) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Cannot go back - only one or no modals in history', {
                        historyLength: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
                return false;
            }
            
            // הסרת המודול הנוכחי מההיסטוריה
            const currentModal = this.modalHistory.pop();
            
            if (window.Logger) {
                window.Logger.debug('📤 Popped current modal from history', {
                    currentModal: {
                        entityType: currentModal.info?.entityType,
                        entityId: currentModal.info?.entityId
                    },
                    remainingHistory: this.modalHistory.length,
                    page: "modal-navigation-manager"
                });
            }
            
            // סגירת המודול הנוכחי
            if (currentModal && currentModal.element) {
                const bsModal = bootstrap.Modal.getInstance(currentModal.element);
                if (bsModal) {
                    bsModal.hide();
                    if (window.Logger) {
                        window.Logger.debug('✅ Hidden current modal', { page: "modal-navigation-manager" });
                    }
                } else {
                    // Fallback - הסתרה ישירה
                    if (currentModal.element) {
                        currentModal.element.classList.remove('show');
                        currentModal.element.style.display = 'none';
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) {
                            backdrop.remove();
                        }
                    }
                }
            }
            
            // שמירת ההיסטוריה העדכנית
            this.saveHistoryToCache();
            
            // אם יש מודול קודם, נוודא שהוא מוצג
            if (this.modalHistory.length > 0) {
                const previousModal = this.modalHistory[this.modalHistory.length - 1];
                if (previousModal && previousModal.element) {
                    // המודול הקודם אמור להיות פתוח כבר (Bootstrap לא סוגר מודולים מקוננים)
                    // אבל נוודא שהוא מוצג
                    const prevBsModal = bootstrap.Modal.getInstance(previousModal.element);
                    if (prevBsModal) {
                        prevBsModal.show();
                        if (window.Logger) {
                            window.Logger.debug('✅ Showing previous modal', {
                                entityType: previousModal.info?.entityType,
                                entityId: previousModal.info?.entityId,
                                page: "modal-navigation-manager"
                            });
                        }
                    }
                    
                    // עדכון ממשק הניווט של המודול הקודם
                    setTimeout(() => {
                        this.updateModalNavigation(previousModal.element);
                    }, 100);
                }
            }
            
            return true;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error going back:', error, { page: "modal-navigation-manager" });
            }
            return false;
        }
    }
    
    /**
     * Get history length - קבלת מספר מודולים בהיסטוריה
     * 
     * @public
     * @returns {number} מספר מודולים בהיסטוריה
     */
    getHistoryLength() {
        return this.modalHistory.length;
    }
    
    /**
     * Clear history - ניקוי כל ההיסטוריה
     * 
     * @public
     * @returns {Promise<void>}
     */
    async clearHistory() {
        this.modalHistory = [];
        this.manageBackdrop();
        
        // מחיקת היסטוריה מהמטמון
        try {
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                await window.UnifiedCacheManager.remove('modal-navigation-history');
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error clearing modal history from cache:', error, { page: "modal-navigation-manager" });
            }
        }
        
        if (window.Logger) {
            window.Logger.debug('Modal history cleared', { page: "modal-navigation-manager" });
        }
    }
    
    /**
     * Manage global backdrop - יצירה/עדכון/הסרה של backdrop גלובלי
     * 
     * @private
     * @returns {void}
     */
    manageBackdrop() {
        try {
            // הסרת כל ה-backdrops הקיימים (פרט לגלובלי שלנו)
            const existingBackdrops = document.querySelectorAll('.modal-backdrop:not(#globalModalBackdrop)');
            existingBackdrops.forEach(backdrop => backdrop.remove());
            
            // אם יש מודולים פתוחים - יצירת/עדכון backdrop גלובלי
            if (this.modalHistory.length > 0) {
                this.createGlobalBackdrop();
            } else {
                // אם אין מודולים - הסרת backdrop
                this.removeGlobalBackdrop();
                
                // הסרת modal-open מ-body אם אין מודולים
                document.body.classList.remove('modal-open');
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error managing backdrop:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Create global backdrop - יצירת backdrop גלובלי
     * 
     * @private
     * @returns {void}
     */
    createGlobalBackdrop() {
        try {
            // אם כבר קיים - עדכון z-index
            if (this.globalBackdrop) {
                // z-index: 1040 (default) + מספר מודולים * 10
                const zIndex = 1040 + (this.modalHistory.length * 10);
                this.globalBackdrop.style.zIndex = zIndex;
                return;
            }
            
            // יצירת backdrop חדש
            this.globalBackdrop = document.createElement('div');
            this.globalBackdrop.id = 'globalModalBackdrop';
            this.globalBackdrop.className = 'modal-backdrop fade show global-modal-backdrop';
            
            // z-index: 1040 (default) + מספר מודולים * 10
            const zIndex = 1040 + (this.modalHistory.length * 10);
            this.globalBackdrop.style.zIndex = zIndex;
            
            // הוספה ל-body
            document.body.appendChild(this.globalBackdrop);
            
            // הוספת modal-open ל-body
            document.body.classList.add('modal-open');
            
            if (window.Logger) {
                window.Logger.debug('Global backdrop created', { 
                    zIndex,
                    modalsCount: this.modalHistory.length,
                    page: "modal-navigation-manager" 
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error creating global backdrop:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Remove global backdrop - הסרת backdrop גלובלי
     * 
     * @private
     * @returns {void}
     */
    removeGlobalBackdrop() {
        try {
            if (this.globalBackdrop) {
                this.globalBackdrop.remove();
                this.globalBackdrop = null;
                
                if (window.Logger) {
                    window.Logger.debug('Global backdrop removed', { page: "modal-navigation-manager" });
                }
            }
            
            // הסרת modal-open מ-body אם אין מודולים נוספים
            const otherModals = document.querySelectorAll('.modal.show');
            if (otherModals.length === 0) {
                document.body.classList.remove('modal-open');
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error removing global backdrop:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Get breadcrumb trail - יצירת breadcrumb trail מההיסטוריה
     * 
     * @param {HTMLElement|null} currentModal - מודול נוכחי (אופציונלי)
     * @public
     * @returns {string} HTML של breadcrumb
     */
    getBreadcrumb(currentModal = null) {
        try {
            if (this.modalHistory.length <= 1) {
                return '';
            }
            
            // יצירת breadcrumb רק מההיסטוריה (בלי המודול הנוכחי)
            const historyForBreadcrumb = this.modalHistory.slice(0, -1);
            
            let breadcrumb = '<div class="modal-breadcrumb-trail">';
            
            historyForBreadcrumb.forEach((item, index) => {
                const title = this.getModalTitle(item.element, item.info);
                const separator = index < historyForBreadcrumb.length - 1 ? ' / ' : '';
                
                breadcrumb += `<span class="breadcrumb-item" data-modal-index="${index}">${title}${separator}</span>`;
            });
            
            breadcrumb += '</div>';
            
            return breadcrumb;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error creating breadcrumb:', error, { page: "modal-navigation-manager" });
            }
            return '';
        }
    }
    
    /**
     * Update modal navigation UI - עדכון breadcrumb וכפתור חזור במודול
     * 
     * מיקום:
     * - Breadcrumb: בתוך <div class="modal-navigation-breadcrumb" id="entityDetailsBreadcrumb"> בכותרת (order: 0)
     * - כפתור חזרה: <button id="entityDetailsBackBtn" class="modal-back-btn"> בכותרת (order: 998)
     * 
     * תנאי הצגה:
     * - Breadcrumb: מוצג רק אם modalHistory.length > 1
     * - כפתור חזרה: מוצג רק אם canGoBack() === true (כלומר modalHistory.length > 1)
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול לעדכון
     * @public
     * @returns {void}
     */
    updateModalNavigation(modalElement) {
        try {
            // לוג התחלתי מפורט
            if (window.Logger) {
                window.Logger.info('🚀 updateModalNavigation STARTED', {
                    modalElementExists: !!modalElement,
                    modalId: modalElement?.id,
                    modalHistoryLength: this.modalHistory.length,
                    canGoBack: this.canGoBack(),
                    historyDetails: this.modalHistory.map((item, idx) => ({
                        index: idx,
                        entityType: item.info?.entityType,
                        entityId: item.info?.entityId,
                        hasSourceInfo: !!(item.info?.sourceInfo || item.info?.source),
                        elementId: item.element?.id
                    })),
                    page: "modal-navigation-manager"
                });
            }
            
            if (!modalElement) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ updateModalNavigation: modalElement is null/undefined', { page: "modal-navigation-manager" });
                }
                return;
            }
            
            const headerElement = modalElement.querySelector('.modal-header');
            if (!headerElement) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ updateModalNavigation: headerElement not found', {
                        modalId: modalElement.id,
                        page: "modal-navigation-manager"
                    });
                }
                return;
            }
            
            // חיפוש או יצירת breadcrumb container
            let breadcrumbContainer = headerElement.querySelector('.modal-navigation-breadcrumb');
            if (!breadcrumbContainer) {
                breadcrumbContainer = document.createElement('div');
                breadcrumbContainer.className = 'modal-navigation-breadcrumb';
                breadcrumbContainer.style.order = '0'; // לפני הכותרת ב-RTL
                headerElement.insertBefore(breadcrumbContainer, headerElement.firstChild);
            }
            
            // עדכון breadcrumb
            const breadcrumbHTML = this.getBreadcrumb(modalElement);
            // DEBUG: תמיד נציג ברדקראמבס (אפילו אם historyLength <= 1)
            const shouldShowBreadcrumb = true; // DEBUG: this.modalHistory.length > 1;
            
            if (window.Logger) {
                window.Logger.debug('🍞 Breadcrumb update:', { 
                    modalId: modalElement.id,
                    shouldShowBreadcrumb,
                    historyLength: this.modalHistory.length,
                    breadcrumbHTML: breadcrumbHTML || '(empty)',
                    breadcrumbLength: breadcrumbHTML?.length || 0,
                    containerExists: !!breadcrumbContainer,
                    containerId: breadcrumbContainer?.id,
                    page: "modal-navigation-manager" 
                });
            }
            
            // DEBUG: אם אין ברדקראמבס, ניצור אחד לדוגמה
            const displayBreadcrumbHTML = breadcrumbHTML || '<div class="modal-breadcrumb-trail"><span class="breadcrumb-item">DEBUG: Breadcrumb (historyLength=' + this.modalHistory.length + ')</span></div>';
            breadcrumbContainer.innerHTML = displayBreadcrumbHTML;
            
            // הצגה/הסתרה של breadcrumb container
            // DEBUG: תמיד נציג את הברדקראמבס
            breadcrumbContainer.style.display = 'block';
            breadcrumbContainer.style.visibility = 'visible';
            if (window.Logger) {
                window.Logger.debug('✅ DEBUG: Breadcrumb always shown', { page: "modal-navigation-manager" });
            }
            
            // חיפוש או יצירת כפתור חזור
            // חיפוש גם ב-id של הכפתור הקיים בכותרת (entityDetailsBackBtn)
            let backButton = headerElement.querySelector('[data-button-type="BACK"]') 
                || headerElement.querySelector('.modal-back-btn') 
                || headerElement.querySelector('#entityDetailsBackBtn')
                || document.getElementById('entityDetailsBackBtn');
            
            const canGoBack = this.canGoBack();
            
            // DEBUG: תמיד נציג את הכפתור כדי לבדוק אם הוא מופיע
            // TODO: להחזיר את התנאי canGoBack אחרי הבדיקה
            
            // לוג מפורט לבדיקת המצב
            if (window.Logger) {
                window.Logger.debug('🔍 Back button search:', {
                    foundInHeader: !!headerElement.querySelector('[data-button-type="BACK"]'),
                    foundByClass: !!headerElement.querySelector('.modal-back-btn'),
                    foundByIdInHeader: !!headerElement.querySelector('#entityDetailsBackBtn'),
                    foundByIdGlobal: !!document.getElementById('entityDetailsBackBtn'),
                    backButtonExists: !!backButton,
                    canGoBack,
                    historyLength: this.modalHistory.length,
                    modalHistoryDetails: this.modalHistory.map((item, idx) => ({
                        index: idx,
                        entityType: item.info?.entityType,
                        entityId: item.info?.entityId,
                        hasSourceInfo: !!(item.info?.sourceInfo || item.info?.source)
                    })),
                    page: "modal-navigation-manager"
                });
            }
            
            if (window.Logger) {
                window.Logger.debug('updateModalNavigation: Checking back button', { 
                    modalId: modalElement.id,
                    canGoBack,
                    historyLength: this.modalHistory.length,
                    backButtonExists: !!backButton,
                    modalHistory: this.modalHistory.map(item => ({
                        entityType: item.info?.entityType,
                        entityId: item.info?.entityId,
                        hasSourceInfo: !!(item.info?.sourceInfo || item.info?.source)
                    })),
                    page: "modal-navigation-manager" 
                });
            }
            
            // DEBUG: תמיד נציג את הכפתור (ללא קשר ל-canGoBack)
            // נציג את הכפתור תמיד - לא משנה מה הערך של canGoBack
            if (true) { // DEBUG: canGoBack - שונה ל-true כדי תמיד להציג
                if (window.Logger) {
                    window.Logger.info('✅ DEBUG MODE - Always showing back button (regardless of canGoBack)', {
                        modalId: modalElement.id,
                        historyLength: this.modalHistory.length,
                        canGoBack: canGoBack,
                        page: "modal-navigation-manager"
                    });
                }
                
                // ניסיון ראשון למצוא כפתור קיים - כולל כפתור עם display: none
                if (!backButton) {
                    if (window.Logger) {
                        window.Logger.debug('🔍 Back button not found in first search, trying comprehensive search', {
                            headerElementExists: !!headerElement,
                            modalId: modalElement.id,
                            page: "modal-navigation-manager"
                        });
                    }
                    
                    // חיפוש מקיף יותר - כולל כפתורים מוסתרים
                    const allBackButtons = headerElement.querySelectorAll('[data-button-type="BACK"], .modal-back-btn, #entityDetailsBackBtn');
                    if (window.Logger) {
                        window.Logger.debug('🔍 Comprehensive button search:', {
                            foundButtonsCount: allBackButtons.length,
                            buttons: Array.from(allBackButtons).map(btn => ({
                                id: btn.id,
                                className: btn.className,
                                display: window.getComputedStyle(btn).display,
                                styleDisplay: btn.style.display
                            })),
                            page: "modal-navigation-manager"
                        });
                    }
                    
                    if (allBackButtons.length > 0) {
                        backButton = allBackButtons[0];
                        if (window.Logger) {
                            window.Logger.info('✅ Found hidden back button', {
                                buttonId: backButton.id,
                                computedDisplay: window.getComputedStyle(backButton).display,
                                inlineDisplay: backButton.style.display,
                                page: "modal-navigation-manager"
                            });
                        }
                    } else {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ No back buttons found in comprehensive search', { page: "modal-navigation-manager" });
                        }
                    }
                } else {
                    if (window.Logger) {
                        window.Logger.debug('✅ Back button found in first search', {
                            buttonId: backButton.id,
                            className: backButton.className,
                            computedDisplay: window.getComputedStyle(backButton).display,
                            page: "modal-navigation-manager"
                        });
                    }
                }
                
                // אם עדיין לא נמצא, ננסה למצוא אותו שוב אחרי delay קצר
                if (!backButton) {
                    // נסיון נוסף - אולי הכפתור עדיין לא נטען
                    setTimeout(() => {
                        const retryButton = headerElement.querySelector('[data-button-type="BACK"]') 
                            || headerElement.querySelector('.modal-back-btn') 
                            || headerElement.querySelector('#entityDetailsBackBtn')
                            || document.getElementById('entityDetailsBackBtn');
                        
                        if (retryButton && true) { // this.canGoBack() - שונה ל-true לבדיקה
                            // הסרת styles ישנים והגדרת חדשים בלי !important
                            retryButton.style.removeProperty('display');
                            retryButton.style.removeProperty('visibility');
                            // וידוא שה-variant הוא 'full'
                            if (!retryButton.getAttribute('data-variant') || retryButton.getAttribute('data-variant') !== 'full') {
                                retryButton.setAttribute('data-variant', 'full');
                            }
                            retryButton.style.display = 'flex';
                            retryButton.style.visibility = 'visible';
                            retryButton.style.order = '997'; // לפני כפתור סגירה (997 < 998)
                            if (!retryButton.hasAttribute('data-navigation-listener')) {
                                retryButton.setAttribute('data-navigation-listener', 'true');
                                retryButton.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    this.goBack();
                                });
                            }
                            if (window.ButtonSystem && typeof window.ButtonSystem.processButton === 'function') {
                                window.ButtonSystem.processButton(retryButton);
                            }
                            if (window.Logger) {
                                window.Logger.debug('✅ Enabled back button after retry', { page: "modal-navigation-manager" });
                            }
                        }
                    }, 200);
                }
                
                if (!backButton) {
                    // יצירת כפתור חזור
                    backButton = document.createElement('button');
                    backButton.type = 'button';
                    backButton.setAttribute('data-button-type', 'BACK');
                    backButton.setAttribute('data-variant', 'full'); // מצב מלא - איקון + טקסט
                    backButton.setAttribute('data-text', ''); // המערכת תמלא את הטקסט מאוטומטית
                    backButton.title = 'חזור למודול הקודם';
                    backButton.className = 'modal-back-btn';
                    backButton.style.order = '997'; // לפני כפתור סגירה (997 < 998)
                    // הגדרת styles בלי !important - ITCSS יעבוד
                    backButton.style.display = 'flex';
                    backButton.style.visibility = 'visible';
                    
                    // הוספת event listener
                    backButton.addEventListener('click', () => {
                        if (window.Logger) {
                            window.Logger.debug('Back button clicked', { 
                                modalId: modalElement.id,
                                page: "modal-navigation-manager" 
                            });
                        }
                        this.goBack();
                    });
                    
                    // הוספה לכותרת (לפני כפתור סגירה)
                    const closeButton = headerElement.querySelector('[data-button-type="CLOSE"]');
                    if (closeButton) {
                        headerElement.insertBefore(backButton, closeButton);
                    } else {
                        headerElement.appendChild(backButton);
                    }
                    
                    // הפעלת מערכת הכפתורים על הכפתור החדש
                    if (window.ButtonSystem && typeof window.ButtonSystem.processButton === 'function') {
                        window.ButtonSystem.processButton(backButton);
                    }
                } else {
                    // הכפתור כבר קיים - רק נוודא שהוא מוצג ופועל
                    // הסרת display: none אם קיים - גם מה-style attribute וגם מה-inline style
                    const computedDisplay = window.getComputedStyle(backButton).display;
                    if (computedDisplay === 'none' || backButton.style.display === 'none') {
                        // הסרת style attribute שמכיל display: none
                        if (backButton.hasAttribute('style') && backButton.getAttribute('style').includes('display: none')) {
                            const currentStyle = backButton.getAttribute('style');
                            const newStyle = currentStyle.replace(/display:\s*none;?/gi, '').trim();
                            if (newStyle) {
                                backButton.setAttribute('style', newStyle);
                            } else {
                                backButton.removeAttribute('style');
                            }
                        }
                        // הסרת כל ה-styles הישנים והגדרת חדשים
                        backButton.style.removeProperty('display');
                        backButton.style.removeProperty('visibility');
                        backButton.style.removeProperty('opacity');
                        // הגדרת styles חדשים בלי !important - ITCSS יעבוד
                        backButton.style.display = 'flex';
                        backButton.style.visibility = 'visible';
                        
                        if (window.Logger) {
                            window.Logger.debug('✅ Removed display:none from back button', {
                                modalId: modalElement.id,
                                newComputedDisplay: window.getComputedStyle(backButton).display,
                                newComputedVisibility: window.getComputedStyle(backButton).visibility,
                                page: "modal-navigation-manager"
                            });
                        }
                    }
                    
                    // נוודא שיש event listener (אם הכפתור נוצר ב-HTML, אולי אין)
                    if (!backButton.hasAttribute('data-navigation-listener')) {
                        backButton.setAttribute('data-navigation-listener', 'true');
                        backButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.Logger) {
                                window.Logger.debug('🔙 Back button clicked', { 
                                    modalId: modalElement.id,
                                    historyLength: this.modalHistory.length,
                                    page: "modal-navigation-manager" 
                                });
                            }
                            this.goBack();
                        });
                    }
                    
                    // נוודא שהכפתור פעיל ומוצג
                    backButton.disabled = false;
                    backButton.style.pointerEvents = 'auto';
                    // וידוא שה-variant הוא 'full' (איקון + טקסט)
                    if (!backButton.getAttribute('data-variant') || backButton.getAttribute('data-variant') !== 'full') {
                        backButton.setAttribute('data-variant', 'full');
                    }
                    backButton.style.order = '997'; // לפני כפתור סגירה (997 < 998)
                    // וידוא שהכפתור מוצג (בלי !important - ITCSS יעבוד)
                    if (window.getComputedStyle(backButton).display === 'none') {
                        backButton.style.display = 'flex';
                    }
                    if (window.getComputedStyle(backButton).visibility === 'hidden') {
                        backButton.style.visibility = 'visible';
                    }
                    
                    // הפעלת מערכת הכפתורים כדי לוודא שהוא מעוצב נכון
                    if (window.ButtonSystem && typeof window.ButtonSystem.processButton === 'function') {
                        window.ButtonSystem.processButton(backButton);
                    }
                    
                    if (window.Logger) {
                        window.Logger.debug('✅ Back button enabled and visible', {
                            modalId: modalElement.id,
                            display: backButton.style.display,
                            computedDisplay: window.getComputedStyle(backButton).display,
                            visibility: window.getComputedStyle(backButton).visibility,
                            disabled: backButton.disabled,
                            page: "modal-navigation-manager"
                        });
                    }
                }
            } else {
                // DEBUG: לא מסתירים את הכפתור במוד DEBUG
                if (window.Logger) {
                    window.Logger.info('⚠️ DEBUG MODE - Not hiding back button (normally would hide when canGoBack=false)', {
                        modalId: modalElement.id,
                        historyLength: this.modalHistory.length,
                        canGoBack: canGoBack,
                        reason: this.modalHistory.length <= 1 ? 'historyLength <= 1' : 'unknown',
                        backButtonExists: !!backButton,
                        page: "modal-navigation-manager"
                    });
                }
                
                // DEBUG: במקום להסתיר, נציג את הכפתור
                // אם אין כפתור, ניצור אותו (בדיקה)
                if (!backButton) {
                    // חיפוש מקיף
                    const allBackButtons = headerElement.querySelectorAll('[data-button-type="BACK"], .modal-back-btn, #entityDetailsBackBtn');
                    if (allBackButtons.length > 0) {
                        backButton = allBackButtons[0];
                    }
                }
                
                if (!backButton) {
                    // יצירת כפתור חזור (בדיקה)
                    backButton = document.createElement('button');
                    backButton.type = 'button';
                    backButton.setAttribute('data-button-type', 'BACK');
                    backButton.setAttribute('data-variant', 'full'); // מצב מלא - איקון + טקסט
                    backButton.setAttribute('data-text', ''); // המערכת תמלא את הטקסט מאוטומטית
                    backButton.title = 'חזור למודול הקודם';
                    backButton.className = 'modal-back-btn';
                    backButton.style.order = '997'; // לפני כפתור סגירה (997 < 998)
                    backButton.style.display = 'flex';
                    backButton.style.visibility = 'visible';
                    
                    backButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.Logger) {
                            window.Logger.debug('🔙 DEBUG: Back button clicked', { page: "modal-navigation-manager" });
                        }
                        if (this.canGoBack()) {
                            this.goBack();
                        }
                    });
                    
                    const closeButton = headerElement.querySelector('[data-button-type="CLOSE"]');
                    if (closeButton) {
                        headerElement.insertBefore(backButton, closeButton);
                    } else {
                        headerElement.appendChild(backButton);
                    }
                    
                    if (window.ButtonSystem && typeof window.ButtonSystem.processButton === 'function') {
                        window.ButtonSystem.processButton(backButton);
                    }
                } else {
                    // הצגת הכפתור גם כש-canGoBack הוא false (בדיקה)
                    // וידוא שה-variant הוא 'full' (איקון + טקסט)
                    if (!backButton.getAttribute('data-variant') || backButton.getAttribute('data-variant') !== 'full') {
                        backButton.setAttribute('data-variant', 'full');
                    }
                    backButton.style.order = '997'; // לפני כפתור סגירה (997 < 998)
                    backButton.style.removeProperty('display');
                    backButton.style.display = 'flex';
                    backButton.style.visibility = 'visible';
                    
                    // הפעלת מערכת הכפתורים כדי לעדכן את הכפתור עם האיקון והטקסט
                    if (window.ButtonSystem && typeof window.ButtonSystem.processButton === 'function') {
                        window.ButtonSystem.processButton(backButton);
                    }
                }
                
                if (window.Logger) {
                    window.Logger.debug('✅ DEBUG: Back button shown/created even though canGoBack=false', { 
                        modalId: modalElement.id,
                        backButtonExists: !!backButton,
                        computedDisplay: backButton ? window.getComputedStyle(backButton).display : 'N/A',
                        page: "modal-navigation-manager" 
                    });
                }
            }
            
            // לוג סיום מפורט
            if (window.Logger) {
                const finalBackButton = headerElement.querySelector('[data-button-type="BACK"]') 
                    || headerElement.querySelector('.modal-back-btn') 
                    || headerElement.querySelector('#entityDetailsBackBtn')
                    || document.getElementById('entityDetailsBackBtn');
                    
                window.Logger.info('🏁 updateModalNavigation COMPLETED', {
                    modalId: modalElement.id,
                    breadcrumbShown: shouldShowBreadcrumb && breadcrumbHTML ? true : false,
                    backButtonShown: canGoBack && finalBackButton ? true : false,
                    finalBackButtonDisplay: finalBackButton ? window.getComputedStyle(finalBackButton).display : 'N/A',
                    finalBackButtonVisible: finalBackButton ? window.getComputedStyle(finalBackButton).visibility : 'N/A',
                    historyLength: this.modalHistory.length,
                    canGoBack: this.canGoBack(),
                    page: "modal-navigation-manager"
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating modal navigation:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Check if can go back - בדיקה אם ניתן לחזור אחורה
     * 
     * תנאי: modalHistory.length > 1
     * 
     * @public
     * @returns {boolean} true אם יש יותר ממודול אחד
     */
    canGoBack() {
        const canGo = this.modalHistory.length > 1;
        
        if (window.Logger) {
            window.Logger.debug('🔍 canGoBack() check:', {
                result: canGo,
                historyLength: this.modalHistory.length,
                condition: `historyLength (${this.modalHistory.length}) > 1`,
                historyDetails: this.modalHistory.map((item, idx) => ({
                    index: idx,
                    entityType: item.info?.entityType,
                    entityId: item.info?.entityId,
                    hasSourceInfo: !!(item.info?.sourceInfo || item.info?.source),
                    elementId: item.element?.id
                })),
                page: "modal-navigation-manager"
            });
        }
        
        return canGo;
    }
    
    /**
     * Detect modal info - זיהוי מידע על מודול (סוג, ישות, מזהה)
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @private
     * @returns {Object} מידע על המודול {type, entityType, entityId, title}
     */
    detectModalInfo(modalElement) {
        try {
            const info = {
                type: 'unknown',
                entityType: null,
                entityId: null,
                title: null
            };
            
            if (!modalElement) return info;
            
            // זיהוי לפי ID
            const modalId = modalElement.id || '';
            
            // EntityDetailsModal
            if (modalId === 'entityDetailsModal' || modalId.includes('entityDetails')) {
                info.type = 'entity-details';
                // נסה לקבל מה-window.currentEntityType/Id או מה-EntityDetailsModal
                if (window.entityDetailsModal) {
                    info.entityType = window.entityDetailsModal.currentEntityType || window.currentEntityType;
                    info.entityId = window.entityDetailsModal.currentEntityId || window.currentEntityId;
                } else if (window.currentEntityType) {
                    info.entityType = window.currentEntityType;
                    info.entityId = window.currentEntityId;
                }
            }
            // ModalManagerV2 modals
            else if (modalId.includes('Modal')) {
                info.type = 'crud-modal';
                // נסה לקבל מה-data-entity-type
                const entityTypeAttr = modalElement.getAttribute('data-entity-type');
                if (entityTypeAttr) info.entityType = entityTypeAttr;
            }
            
            // קבלת כותרת
            const titleElement = modalElement.querySelector('.modal-title, [id$="Label"]');
            if (titleElement) {
                // נסה לקבל טקסט נקי (בלי HTML)
                const titleText = titleElement.textContent || titleElement.innerText || '';
                // אם יש span עם טקסט, נסה לקבל את הטקסט מתוכו
                const titleSpan = titleElement.querySelector('span');
                if (titleSpan && titleSpan.textContent) {
                    info.title = titleSpan.textContent.trim() || titleText.trim();
                } else {
                    info.title = titleText.trim();
                }
            }
            
            if (window.Logger) {
                window.Logger.debug('detectModalInfo', { 
                    modalId,
                    detectedInfo: info,
                    page: "modal-navigation-manager" 
                });
            }
            
            return info;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error detecting modal info:', error, { page: "modal-navigation-manager" });
            }
            return { type: 'unknown', entityType: null, entityId: null, title: null };
        }
    }
    
    /**
     * Check if element is modal - בדיקה אם אלמנט הוא מודול
     * 
     * @param {HTMLElement} element - אלמנט לבדיקה
     * @private
     * @returns {boolean} true אם זה מודול
     */
    isModalElement(element) {
        return element && element.classList.contains('modal');
    }
    
    /**
     * Get modal title - קבלת כותרת מודול
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @param {Object} modalInfo - מידע על המודול (אופציונלי)
     * @private
     * @returns {string} כותרת המודול
     */
    getModalTitle(modalElement, modalInfo = null) {
        try {
            // נסה לקבל מהמידע
            if (modalInfo && modalInfo.title) {
                return modalInfo.title;
            }
            
            // נסה לקבל מה-HTML
            const titleElement = modalElement?.querySelector('.modal-title, [id$="Label"]');
            if (titleElement) {
                return titleElement.textContent || titleElement.innerText || '';
            }
            
            // נסה לקבל לפי סוג ישות
            if (modalInfo && modalInfo.entityType && modalInfo.entityId) {
                const entityLabel = this.getEntityLabel(modalInfo.entityType);
                return `${entityLabel} #${modalInfo.entityId}`;
            }
            
            return 'מודול';
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error getting modal title:', error, { page: "modal-navigation-manager" });
            }
            return 'מודול';
        }
    }
    
    /**
     * Get entity label - קבלת שם ישות בעברית
     * 
     * @param {string} entityType - סוג ישות
     * @private
     * @returns {string} שם ישות בעברית
     */
    getEntityLabel(entityType) {
        const labels = {
            ticker: 'טיקר',
            trade: 'טרייד',
            trade_plan: 'תכנון',
            execution: 'ביצוע',
            account: 'חשבון מסחר',
            alert: 'התראה',
            cash_flow: 'תזרים מזומנים',
            note: 'הערה'
        };
        
        return labels[entityType] || entityType;
    }
    
    /**
     * Get previous modal - קבלת המודול הקודם
     * 
     * @private
     * @returns {Object|null} המודול הקודם או null
     */
    getPreviousModal() {
        if (this.modalHistory.length < 2) {
            return null;
        }
        return this.modalHistory[this.modalHistory.length - 2];
    }
}

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize when DOM is ready - אתחול אוטומטי כשה-DOM מוכן
 */
(function() {
    'use strict';
    
    function initializeNavigationManager() {
        if (!window.modalNavigationManager) {
            window.modalNavigationManager = new ModalNavigationManager();
            if (window.Logger) {
                window.Logger.info('✅ ModalNavigationManager initialized', { page: "modal-navigation-manager" });
            }
        } else {
            if (window.Logger) {
                window.Logger.debug('ModalNavigationManager already exists', { page: "modal-navigation-manager" });
            }
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeNavigationManager);
    } else {
        // DOM כבר מוכן
        initializeNavigationManager();
    }
})();

// ===== GLOBAL FUNCTION EXPORTS =====

/**
 * Push modal to navigation stack - פונקציה גלובלית להוספת מודול ל-stack
 * 
 * @param {HTMLElement} modalElement - אלמנט המודול
 * @param {Object} modalInfo - מידע על המודול (אופציונלי)
 * @global
 * @returns {void}
 */
window.pushModalToNavigation = async function(modalElement, modalInfo = null) {
    if (window.modalNavigationManager) {
        await window.modalNavigationManager.pushModal(modalElement, modalInfo);
    }
};

/**
 * Go back in modal navigation - פונקציה גלובלית לחזרה למודול קודם
 * 
 * @global
 * @returns {boolean} true אם חזרנו בהצלחה
 */
window.goBackInModalNavigation = function() {
    if (window.modalNavigationManager) {
        return window.modalNavigationManager.goBack();
    }
    return false;
};

/**
 * Get modal breadcrumb - פונקציה גלובלית לקבלת breadcrumb
 * 
 * @param {HTMLElement|null} modalElement - אלמנט המודול (אופציונלי)
 * @global
 * @returns {string} HTML של breadcrumb
 */
window.getModalBreadcrumb = function(modalElement = null) {
    if (window.modalNavigationManager) {
        return window.modalNavigationManager.getBreadcrumb(modalElement);
    }
    return '';
};

if (window.Logger) {
    window.Logger.info('Modal Navigation Manager loaded', { page: "modal-navigation-manager" });
}

