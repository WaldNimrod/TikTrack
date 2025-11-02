/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 22
 * 
 * MODAL STACK MANAGEMENT (5)
 * - pushModal() - הוספת מודול ל-stack והיסטוריה
 * - popModal() - הסרת מודול אחרון
 * - getCurrentModal() - קבלת המודול הנוכחי
 * - getPreviousModal() - קבלת המודול הקודם
 * - clearHistory() - ניקוי כל ההיסטוריה
 * 
 * NAVIGATION (2)
 * - goBack() - חזרה למודול הקודם
 * - canGoBack() - בדיקה אם ניתן לחזור אחורה
 * 
 * UI UPDATES (5)
 * - updateModalNavigation() - עדכון breadcrumb וכפתור חזור במודול
 * - getBreadcrumb() - יצירת breadcrumb trail מההיסטוריה
 * - updateBreadcrumb() - עדכון breadcrumb ב-DOM
 * - setupBreadcrumbClickHandlers() - הגדרת מאזינים ללחיצות על קישורי breadcrumb
 * - navigateToModal() - ניווט למודול לפי אינדקס
 * - updateBackButton() - עדכון כפתור חזור ב-DOM
 * 
 * MODAL DETECTION (1)
 * - detectModalInfo() - זיהוי מידע על מודול (סוג, ישות, מזהה)
 * 
 * ENTITY HELPERS (4)
 * - getEntityLabel() - קבלת שם ישות בעברית
 * - getEntityIcon() - קבלת נתיב איקון לישות
 * - getEntityColor() - קבלת צבע ישות
 * - getModalTitle() - קבלת כותרת מודול
 * 
 * BACKDROP MANAGEMENT (3)
 * - manageBackdrop() - יצירה/עדכון/הסרה של backdrop גלובלי
 * - createGlobalBackdrop() - יצירת backdrop גלובלי
 * - removeGlobalBackdrop() - הסרת backdrop גלובלי
 * 
 * EVENT HANDLERS (2)
 * - handleModalShown() - טיפול באירוע פתיחת מודול
 * - handleModalHidden() - טיפול באירוע סגירת מודול
 * 
 * UTILITIES (2)
 * - generateModalId() - יצירת מזהה ייחודי למודול
 * - compareModals() - השוואה בין שני מודולים
 * - saveModalContent() - שמירת תוכן מודול
 * - restoreModalContent() - שחזור תוכן מודול
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
 * - ניהול stack של מודולים פתוחים (LIFO)
 * - backdrop גלובלי אחד לכל המודולים
 * - breadcrumb trail לניווט
 * - כפתור חזור אוטומטי
 * - תמיכה בכל סוגי המודולים (פרטים, עריכה, וכו')
 * - תמיכה במודולים מקוננים עם sourceInfo
 * 
 * ארכיטקטורה:
 * - Stack Pattern פשוט עם Immutable Updates
 * - כל עדכון למערך יוצר עותק חדש
 * - השוואה בין מודולים לפי entityType:entityId:sourceInfo
 * - תוכן נשמר רק בעת מעבר למודול חדש
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/MODAL_NAVIGATION_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 2.0.0
 * Last Updated: 2025-11-02
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
        
        /**
         * מעקב אחרי מודולים שעברו handleModalShown לאחרונה - למניעת לולאות אינסופיות
         * @type {Map<string, number>}
         * @private
         */
        this.recentlyHandledModals = new Map();
    }
    
    /**
     * Initialize - אתחול המערכת
     * 
     * @returns {Promise<void>}
     * @public
     */
    async init() {
        try {
            // המערך תמיד מתחיל ריק - אין שימוש במטמון
            this.modalHistory = [];
            
            // ניקוי מטמון קיים אם יש - כדי למנוע בלגן ממימוש קודם
            try {
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                    await window.UnifiedCacheManager.remove('modal-navigation-history', {
                        layer: 'localStorage'
                    });
                    if (window.Logger) {
                        window.Logger.info('✅ Removed modal-navigation-history from cache', { page: "modal-navigation-manager" });
                    }
                }
            } catch (cacheError) {
                if (window.Logger) {
                    window.Logger.error('❌ Error clearing modal navigation cache:', cacheError, { page: "modal-navigation-manager" });
                }
            }
            
            // האזנה לאירועי Bootstrap modals
            this.setupBootstrapListeners();
            
            this.isInitialized = true;
            
            if (window.Logger) {
                window.Logger.info('✅ ModalNavigationManager initialized', { 
                    instanceExists: !!this,
                    isInitialized: this.isInitialized,
                    historyLength: this.modalHistory.length,
                    page: "modal-navigation-manager" 
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Failed to initialize ModalNavigationManager', {
                    error: error.message,
                    stack: error.stack,
                    page: "modal-navigation-manager"
                });
            } else {
                console.error('❌ Failed to initialize ModalNavigationManager:', error);
            }
            throw error;
        }
    }
    
    /**
     * Setup Bootstrap listeners - הגדרת מאזינים לאירועי Bootstrap
     * 
     * @private
     */
    setupBootstrapListeners() {
        // האזנה ל-shown.bs.modal - כאשר מודול נפתח
        document.addEventListener('shown.bs.modal', (event) => {
            const modalElement = event.target;
            if (this.isModalElement(modalElement)) {
                this.handleModalShown(modalElement);
            }
        });
        
        // האזנה ל-hidden.bs.modal - כאשר מודול נסגר
        document.addEventListener('hidden.bs.modal', (event) => {
            const modalElement = event.target;
            if (this.isModalElement(modalElement)) {
                this.handleModalHidden(modalElement);
            }
        });
    }
    
    /**
     * Check if element is a modal - בדיקה אם אלמנט הוא מודול
     * 
     * @param {HTMLElement} element - אלמנט לבדיקה
     * @returns {boolean} true אם זה מודול
     * @private
     */
    isModalElement(element) {
        return element && 
               element.classList && 
               element.classList.contains('modal') &&
               element.hasAttribute('tabindex');
    }
    
    // ===== CORE STACK OPERATIONS =====
    
    /**
     * Push modal to stack - הוספת מודול ל-stack
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @param {Object} modalInfo - מידע על המודול (אופציונלי)
     * @returns {Promise<void>}
     * @public
     */
    async pushModal(modalElement, modalInfo = null) {
        try {
            if (!modalElement) {
                throw new Error('modalElement is required');
            }
            
            // זיהוי מידע על המודול אם לא סופק
            if (!modalInfo) {
                modalInfo = this.detectModalInfo(modalElement);
            }
            
            // אם זה מודול CRUD רגיל (הוספה/עריכה) ללא sourceInfo - זה מודול ראשון, ניקוי היסטוריה
            // מודולים מקוננים (עם sourceInfo) נשארים בהיסטוריה
            const isNestedModal = modalInfo.sourceInfo && Object.keys(modalInfo.sourceInfo).length > 0;
            const isAddOrEditModal = modalInfo.type === 'crud-modal' && !isNestedModal;
            
            if (isAddOrEditModal && this.modalHistory.length > 0) {
                // זה מודול הוספה/עריכה חדש - ניקוי היסטוריה קודמת
                if (window.Logger) {
                    window.Logger.info('🧹 [pushModal] Clearing history for new add/edit modal', {
                        modalId: this.generateModalId(modalInfo),
                        previousHistoryLength: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
                this.modalHistory = [];
            }
            
            // יצירת מזהה ייחודי למודול
            const modalId = this.generateModalId(modalInfo);
            
            // בדיקה אם המודול כבר קיים בהיסטוריה
            const existingIndex = this.findModalIndex(modalId);
            
            if (existingIndex >= 0) {
                // המודול כבר קיים - עדכון המידע
                if (window.Logger) {
                    window.Logger.info('🔄 [pushModal] Updating existing modal', {
                        modalId,
                        existingIndex,
                        modalInfo,
                        page: "modal-navigation-manager"
                    });
                }
                
                // יצירת עותק חדש של המערך (immutable update)
                this.modalHistory = [...this.modalHistory];
                
                // עדכון המידע
                this.modalHistory[existingIndex] = {
                    ...this.modalHistory[existingIndex],
                    element: modalElement,
                    info: {
                        ...this.modalHistory[existingIndex].info,
                        ...modalInfo
                    },
                    timestamp: Date.now()
                };
            } else {
                // המודול לא קיים - הוספה למערך
                if (window.Logger) {
                    window.Logger.info('➕ [pushModal] Adding new modal to stack', {
                        modalId,
                        modalInfo,
                        historyLengthBefore: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
                
                // שמירת תוכן המודול הקודם (אם יש)
                if (this.modalHistory.length > 0) {
                    const previousModal = this.modalHistory[this.modalHistory.length - 1];
                    if (previousModal && !previousModal.content) {
                        previousModal.content = this.saveModalContent(previousModal.element);
                    }
                }
                
                // יצירת עותק חדש של המערך (immutable update)
                this.modalHistory = [...this.modalHistory, {
                    element: modalElement,
                    info: modalInfo,
                    content: null,
                    timestamp: Date.now()
                }];
            }
            
            // עדכון UI
            this.updateModalNavigation(modalElement);
            
            // ניהול backdrop
            this.manageBackdrop();
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error pushing modal to stack:', error, { page: "modal-navigation-manager" });
            } else {
                console.error('❌ Error pushing modal to stack:', error);
            }
            throw error;
        }
    }
    
    /**
     * Pop modal from stack - הסרת מודול אחרון מהמערך
     * 
     * @returns {Object|null} המודול שהוסר או null
     * @public
     */
    popModal() {
        if (this.modalHistory.length === 0) {
            return null;
        }
        
        // יצירת עותק חדש של המערך (immutable update)
        const popped = this.modalHistory[this.modalHistory.length - 1];
        this.modalHistory = this.modalHistory.slice(0, -1);
        
        if (window.Logger) {
            window.Logger.info('➖ [popModal] Removed modal from stack', {
                modalId: this.generateModalId(popped.info),
                historyLengthAfter: this.modalHistory.length,
                page: "modal-navigation-manager"
            });
        }
        
        return popped;
    }
    
    /**
     * Get current modal - קבלת המודול הנוכחי
     * 
     * @returns {Object|null} המודול הנוכחי או null
     * @public
     */
    getCurrentModal() {
        if (this.modalHistory.length === 0) {
            return null;
        }
        return this.modalHistory[this.modalHistory.length - 1];
    }
    
    /**
     * Get previous modal - קבלת המודול הקודם
     * 
     * @returns {Object|null} המודול הקודם או null
     * @public
     */
    getPreviousModal() {
        if (this.modalHistory.length < 2) {
            return null;
        }
        return this.modalHistory[this.modalHistory.length - 2];
    }
    
    /**
     * Clear history - ניקוי כל ההיסטוריה
     * 
     * @public
     */
    clearHistory() {
        this.modalHistory = [];
        if (window.Logger) {
            window.Logger.info('🗑️ [clearHistory] Cleared modal history', { page: "modal-navigation-manager" });
        }
    }
    
    /**
     * Find modal index by ID - מציאת אינדקס מודול לפי מזהה
     * 
     * @param {string} modalId - מזהה המודול
     * @returns {number} אינדקס המודול או -1 אם לא נמצא
     * @private
     */
    findModalIndex(modalId) {
        for (let i = 0; i < this.modalHistory.length; i++) {
            const itemId = this.generateModalId(this.modalHistory[i].info);
            if (itemId === modalId) {
                return i;
            }
        }
        return -1;
    }
    
    // ===== NAVIGATION =====
    
    /**
     * Go back - חזרה למודול הקודם
     * 
     * @returns {Promise<boolean>} true אם חזרנו בהצלחה
     * @public
     */
    async goBack() {
        try {
            if (!this.canGoBack()) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ [goBack] Cannot go back - not enough modals in history', {
                        historyLength: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
                return false;
            }
            
            // שמירת תוכן המודול הנוכחי
            const currentModal = this.getCurrentModal();
            if (currentModal && !currentModal.content) {
                currentModal.content = this.saveModalContent(currentModal.element);
            }
            
            // זיהוי המודול הקודם לפני pop
            const previousModal = this.getPreviousModal();
            
            if (!previousModal) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ [goBack] No previous modal found', {
                        historyLength: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
                return false;
            }
            
            if (window.Logger) {
                window.Logger.info('🔙 [goBack] Going back to previous modal', {
                    currentModalId: this.generateModalId(currentModal.info),
                    previousModalId: this.generateModalId(previousModal.info),
                    historyLengthBefore: this.modalHistory.length,
                    page: "modal-navigation-manager"
                });
            }
            
            // הסרת המודול הנוכחי מהמערך
            this.popModal();
            
            // סגירת המודול הנוכחי
            const bsModal = bootstrap.Modal.getInstance(currentModal.element);
            if (bsModal) {
                bsModal.hide();
                
                // המתנה ל-hidden.bs.modal event
                return new Promise((resolve) => {
                    const handleHidden = () => {
                        currentModal.element.removeEventListener('hidden.bs.modal', handleHidden);
                        this.showPreviousModal(previousModal);
                        resolve(true);
                    };
                    currentModal.element.addEventListener('hidden.bs.modal', handleHidden, { once: true });
                });
            } else {
                // fallback - אם אין Bootstrap modal instance
                this.showPreviousModal(previousModal);
                return true;
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error going back:', error, { page: "modal-navigation-manager" });
            } else {
                console.error('❌ Error going back:', error);
            }
            return false;
        }
    }
    
    /**
     * Show previous modal - הצגת המודול הקודם
     * 
     * @param {Object} previousModal - המודול הקודם
     * @private
     */
    showPreviousModal(previousModal) {
        try {
            if (!previousModal || !previousModal.element) {
                throw new Error('Previous modal is invalid');
            }
            
            // שחזור תוכן המודול הקודם (אם נשמר)
            if (previousModal.content) {
                this.restoreModalContent(previousModal.element, previousModal.content, previousModal.info);
            }
            
            // עדכון כותרת המודול הקודם
            const titleElement = previousModal.element.querySelector('.modal-title');
            if (titleElement && previousModal.info) {
                const title = this.getModalTitle(previousModal.info);
                titleElement.textContent = title;
            }
            
            // פתיחת המודול הקודם
            const bsModal = bootstrap.Modal.getInstance(previousModal.element) || 
                          new bootstrap.Modal(previousModal.element);
            bsModal.show();
            
            // עדכון UI
            this.updateModalNavigation(previousModal.element);
            
            // ניהול backdrop
            this.manageBackdrop();
            
            if (window.Logger) {
                window.Logger.info('✅ [showPreviousModal] Previous modal shown', {
                    modalId: this.generateModalId(previousModal.info),
                    page: "modal-navigation-manager"
                });
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error showing previous modal:', error, { page: "modal-navigation-manager" });
            } else {
                console.error('❌ Error showing previous modal:', error);
            }
        }
    }
    
    /**
     * Can go back - בדיקה אם ניתן לחזור אחורה
     * 
     * @returns {boolean} true אם ניתן לחזור
     * @public
     */
    canGoBack() {
        return this.modalHistory.length > 1;
    }
    
    // ===== UI UPDATES =====
    
    /**
     * Update modal navigation - עדכון breadcrumb וכפתור חזור במודול
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @public
     */
    updateModalNavigation(modalElement) {
        try {
            if (!modalElement) {
                return;
            }
            
            // עדכון breadcrumb
            this.updateBreadcrumb(modalElement);
            
            // עדכון כפתור חזור
            this.updateBackButton(modalElement);
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error updating modal navigation:', error, { page: "modal-navigation-manager" });
            } else {
                console.error('❌ Error updating modal navigation:', error);
            }
        }
    }
    
    /**
     * Get breadcrumb - יצירת breadcrumb trail מההיסטוריה
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול (אופציונלי)
     * @returns {string} HTML של breadcrumb
     * @public
     */
    getBreadcrumb(modalElement = null) {
        try {
            if (this.modalHistory.length === 0) {
                return '';
            }
            
            let breadcrumb = '<div class="modal-breadcrumb-trail">';
            
            // מציאת אינדקס המודול הנוכחי
            // המודול הנוכחי הוא תמיד האחרון במערך (LIFO stack)
            // לא משנה איזה modalElement מועבר - האחרון הוא תמיד הנוכחי
            const currentIndex = this.modalHistory.length > 0 ? this.modalHistory.length - 1 : -1;
            
            // יצירת breadcrumb עבור כל פריט במערך
            this.modalHistory.forEach((item, index) => {
                const entityType = item.info?.entityType || 'unknown';
                let entityId = item.info?.entityId;
                
                // אם entityId הוא null או undefined, ננסה למצוא אותו מהכותרת או מ-DOM
                if (entityId === null || entityId === undefined) {
                    // ננסה למצוא את ה-entityId מהכותרת
                    const title = item.info?.title || '';
                    const match = title.match(/(\d+)/);
                    if (match) {
                        entityId = parseInt(match[1], 10);
                    } else {
                        entityId = '?';
                    }
                }
                
                // תרגום entityType לעברית
                const entityLabel = this.getEntityLabel(entityType);
                
                // יצירת טקסט תצוגה מתורגם
                const displayText = entityId !== '?' ? `${entityLabel} ${entityId}` : entityLabel;
                
                const separator = index < this.modalHistory.length - 1 ? ' / ' : '';
                // המודול הנוכחי הוא תמיד האחרון במערך
                const isCurrent = index === currentIndex;
                
                // אם זה המודול הנוכחי (האחרון) - לא קישור, רק טקסט
                if (isCurrent) {
                    breadcrumb += `<span class="breadcrumb-item breadcrumb-current" data-modal-index="${index}" data-entity-type="${entityType}" data-entity-id="${entityId}" style="font-weight: bold; color: var(--current-entity-color-dark, #333);">${displayText}${separator}</span>`;
                } else {
                    // כל המודולים האחרים (כולל הראשון) - קישורים שניתן ללחוץ עליהם
                    breadcrumb += `<a href="#" class="breadcrumb-item breadcrumb-link" data-modal-index="${index}" data-entity-type="${entityType}" data-entity-id="${entityId}" style="color: var(--current-entity-color-dark, #007bff); text-decoration: underline; cursor: pointer;">${displayText}</a>${separator}`;
                }
            });
            
            breadcrumb += '</div>';
            
            return breadcrumb;
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error getting breadcrumb:', error, { page: "modal-navigation-manager" });
            }
            return '';
        }
    }
    
    /**
     * Update breadcrumb - עדכון breadcrumb ב-DOM
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @private
     */
    updateBreadcrumb(modalElement) {
        try {
            if (!modalElement) {
                return;
            }
            
            // חיפוש breadcrumb container
            let breadcrumbContainer = modalElement.querySelector('#entityDetailsBreadcrumb') ||
                                    modalElement.querySelector('.modal-navigation-breadcrumb');
            
            if (!breadcrumbContainer) {
                // יצירת breadcrumb container אם לא קיים
                const headerElement = modalElement.querySelector('.modal-header');
                if (headerElement) {
                    breadcrumbContainer = document.createElement('div');
                    breadcrumbContainer.id = 'entityDetailsBreadcrumb';
                    breadcrumbContainer.className = 'modal-navigation-breadcrumb';
                    // הוספת breadcrumb אחרי הכותרת (לא לפני)
                    const titleElement = headerElement.querySelector('.modal-title');
                    if (titleElement && titleElement.nextSibling) {
                        headerElement.insertBefore(breadcrumbContainer, titleElement.nextSibling);
                    } else {
                        // אם אין nextSibling, הוסף אחרי הכותרת
                        headerElement.insertBefore(breadcrumbContainer, headerElement.querySelector('[data-button-type="CLOSE"]') || headerElement.lastChild);
                    }
                } else {
                    return;
                }
            }
            
            // הסתרת breadcrumb כאשר יש רק אובייקט אחד בהיסטוריה (מודול ראשון)
            if (this.modalHistory.length <= 1) {
                breadcrumbContainer.style.display = 'none';
                breadcrumbContainer.style.visibility = 'hidden';
                return;
            }
            
            // יצירת breadcrumb HTML
            const breadcrumbHTML = this.getBreadcrumb(modalElement);
            
            if (breadcrumbHTML) {
                // הוספת ליבל שמציג את מספר הישויות במערך
                const historyCountLabel = `<span class="modal-history-count-label" style="margin-right: 0.5rem; font-size: 0.85rem; color: #666; font-weight: bold;">[מערך: ${this.modalHistory.length}]</span>`;
                breadcrumbContainer.innerHTML = historyCountLabel + breadcrumbHTML;
                breadcrumbContainer.style.display = 'block';
                breadcrumbContainer.style.visibility = 'visible';
                breadcrumbContainer.style.opacity = '1';
                breadcrumbContainer.style.pointerEvents = 'auto';
                
                // הוספת event listeners לקישורים ב-breadcrumb
                this.setupBreadcrumbClickHandlers(breadcrumbContainer);
            } else {
                // אין breadcrumbHTML - נציג רק את הליבל עם מספר הישויות
                const historyCountLabel = `<span class="modal-history-count-label" style="margin-right: 0.5rem; font-size: 0.85rem; color: #666; font-weight: bold;">[מערך: ${this.modalHistory.length}]</span>`;
                breadcrumbContainer.innerHTML = historyCountLabel;
                breadcrumbContainer.style.display = 'block';
                breadcrumbContainer.style.visibility = 'visible';
                breadcrumbContainer.style.opacity = '0.5';
                breadcrumbContainer.style.pointerEvents = 'none';
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error updating breadcrumb:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Setup breadcrumb click handlers - הגדרת מאזינים ללחיצות על קישורי breadcrumb
     * 
     * @param {HTMLElement} breadcrumbContainer - מיכל ה-breadcrumb
     * @private
     */
    setupBreadcrumbClickHandlers(breadcrumbContainer) {
        try {
            // הסרת listener קיים אם יש
            if (breadcrumbContainer._breadcrumbClickHandler) {
                breadcrumbContainer.removeEventListener('click', breadcrumbContainer._breadcrumbClickHandler);
            }
            
            // יצירת handler חדש
            const clickHandler = (e) => {
                const link = e.target.closest('.breadcrumb-link');
                if (link) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const modalIndex = parseInt(link.getAttribute('data-modal-index'), 10);
                    if (!isNaN(modalIndex) && modalIndex >= 0 && modalIndex < this.modalHistory.length) {
                        if (window.Logger) {
                            window.Logger.debug('🔗 [setupBreadcrumbClickHandlers] Breadcrumb link clicked', {
                                modalIndex,
                                historyLength: this.modalHistory.length,
                                page: "modal-navigation-manager"
                            });
                        }
                        this.navigateToModal(modalIndex);
                    } else {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ [setupBreadcrumbClickHandlers] Invalid modal index', {
                                modalIndex,
                                historyLength: this.modalHistory.length,
                                page: "modal-navigation-manager"
                            });
                        }
                    }
                }
            };
            
            // שמירת reference ל-handler להסרה עתידית
            breadcrumbContainer._breadcrumbClickHandler = clickHandler;
            
            // הוספת event delegation לכל ה-breadcrumb
            breadcrumbContainer.addEventListener('click', clickHandler);
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error setting up breadcrumb click handlers:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Navigate to modal - ניווט למודול לפי אינדקס
     * 
     * @param {number} targetIndex - אינדקס המודול אליו לנווט
     * @returns {Promise<boolean>} true אם ניווט בהצלחה
     * @public
     */
    async navigateToModal(targetIndex) {
        try {
            if (targetIndex < 0 || targetIndex >= this.modalHistory.length) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ [navigateToModal] Invalid target index', {
                        targetIndex,
                        historyLength: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
                return false;
            }
            
            const targetModal = this.modalHistory[targetIndex];
            if (!targetModal || !targetModal.element) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ [navigateToModal] Target modal not found', {
                        targetIndex,
                        page: "modal-navigation-manager"
                    });
                }
                return false;
            }
            
            // מציאת המודול הנוכחי
            const currentModal = this.getCurrentModal();
            const currentIndex = this.modalHistory.length - 1;
            
            if (targetIndex === currentIndex) {
                // כבר במודול הזה
                return true;
            }
            
            if (window.Logger) {
                window.Logger.info('🧭 [navigateToModal] Navigating to modal', {
                    targetIndex,
                    currentIndex,
                    targetModalId: this.generateModalId(targetModal.info),
                    page: "modal-navigation-manager"
                });
            }
            
            // סימון שאנחנו במצב navigation כדי למנוע מ-handleModalHidden לנקות את ההיסטוריה
            this._isNavigating = true;
            
            // אם ה-target הוא לפני המודול הנוכחי - צריך לסגור מודולים עד להגעה אליו
            if (targetIndex < currentIndex) {
                // שמירת המודולים לסגירה (לא מוחקים מה-history עדיין!)
                const modalsToClose = [];
                const indicesToRemove = [];
                
                // איסוף כל המודולים שצריך לסגור (מהסוף עד ה-target)
                for (let i = currentIndex; i > targetIndex; i--) {
                    const modalToClose = this.modalHistory[i];
                    if (modalToClose && modalToClose.element) {
                        // שמירת תוכן לפני סגירה
                        if (!modalToClose.content) {
                            modalToClose.content = this.saveModalContent(modalToClose.element);
                        }
                        modalsToClose.push(modalToClose);
                        indicesToRemove.push(i);
                    }
                }
                
                // סגירת כל המודולים בצורה אסינכרונית
                if (modalsToClose.length > 0) {
                    const closePromises = modalsToClose.map(modal => {
                        return new Promise((resolve) => {
                            const bsModal = bootstrap.Modal.getInstance(modal.element);
                            if (bsModal) {
                                // האזנה לאירוע hidden לפני סגירה
                                const handleHidden = () => {
                                    modal.element.removeEventListener('hidden.bs.modal', handleHidden);
                                    resolve();
                                };
                                modal.element.addEventListener('hidden.bs.modal', handleHidden, { once: true });
                                bsModal.hide();
                            } else {
                                resolve();
                            }
                        });
                    });
                    
                    // המתנה לסגירת כל המודולים
                    await Promise.all(closePromises);
                    
                    // רק עכשיו - אחרי שכל המודולים נסגרו - הסרה מה-history
                    // מסירים מהסוף להתחלה כדי לא לשנות את האינדקסים
                    indicesToRemove.sort((a, b) => b - a).forEach(index => {
                        this.modalHistory = this.modalHistory.filter((item, i) => i !== index);
                    });
                }
            }
            
            // ביטול הסימון
            this._isNavigating = false;
            
            // וידוא שה-target עדיין קיים ב-history (לאחר הסרות)
            const updatedTargetModal = this.modalHistory[targetIndex];
            if (!updatedTargetModal || updatedTargetModal.element !== targetModal.element) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ [navigateToModal] Target modal no longer in history after closing modals', {
                        targetIndex,
                        historyLength: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
                return false;
            }
            
            // שחזור תוכן המודול ה-target
            if (updatedTargetModal.content) {
                this.restoreModalContent(updatedTargetModal.element, updatedTargetModal.content, updatedTargetModal.info);
            }
            
            // עדכון כותרת
            const titleElement = updatedTargetModal.element.querySelector('.modal-title');
            if (titleElement && updatedTargetModal.info) {
                const title = this.getModalTitle(updatedTargetModal.info);
                titleElement.textContent = title;
            }
            
            // פתיחת המודול ה-target
            const bsModal = bootstrap.Modal.getInstance(updatedTargetModal.element) || 
                          new bootstrap.Modal(updatedTargetModal.element);
            bsModal.show();
            
            // המתנה קצרה לוודא שהמודול נפתח לפני עדכון ה-UI
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // עדכון UI
            this.updateModalNavigation(updatedTargetModal.element);
            
            // ניהול backdrop
            this.manageBackdrop();
            
            if (window.Logger) {
                window.Logger.info('✅ [navigateToModal] Navigation completed', {
                    targetIndex,
                    page: "modal-navigation-manager"
                });
            }
            
            return true;
            
        } catch (error) {
            // ביטול הסימון גם במקרה של שגיאה
            this._isNavigating = false;
            
            if (window.Logger) {
                window.Logger.error('❌ Error navigating to modal:', error, { page: "modal-navigation-manager" });
            }
            return false;
        }
    }
    
    /**
     * Update back button - עדכון כפתור חזור ב-DOM
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @private
     */
    updateBackButton(modalElement) {
        try {
            if (!modalElement) {
                return;
            }
            
            const canGoBack = this.canGoBack();
            const headerElement = modalElement.querySelector('.modal-header');
            
            if (!headerElement) {
                return;
            }
            
            // חיפוש כפתור חזור קיים
            let backButton = headerElement.querySelector('[data-button-type="BACK"]') ||
                           headerElement.querySelector('.modal-back-btn') ||
                           headerElement.querySelector('#entityDetailsBackBtn');
            
            if (!backButton) {
                // יצירת כפתור חזור חדש
                backButton = document.createElement('button');
                backButton.id = 'entityDetailsBackBtn';
                backButton.className = 'modal-back-btn';
                backButton.setAttribute('data-button-type', 'BACK');
                backButton.setAttribute('data-variant', 'full');
                backButton.setAttribute('data-text', 'חזור');
                backButton.setAttribute('data-onclick', 'window.modalNavigationManager && window.modalNavigationManager.goBack()');
                backButton.setAttribute('type', 'button');
                
                // הוספה לכותרת לפני כפתור סגירה
                const closeButton = headerElement.querySelector('[data-button-type="CLOSE"]') ||
                                  headerElement.querySelector('.btn-close');
                if (closeButton) {
                    headerElement.insertBefore(backButton, closeButton);
                } else {
                    headerElement.appendChild(backButton);
                }
                
                // הפעלת מערכת הכפתורים
                if (window.ButtonSystem && typeof window.ButtonSystem.processButton === 'function') {
                    window.ButtonSystem.processButton(backButton);
                }
            }
            
            // הסתרת כפתור חזרה כאשר יש רק אובייקט אחד בהיסטוריה (מודול ראשון)
            if (this.modalHistory.length <= 1) {
                backButton.style.display = 'none';
                backButton.style.visibility = 'hidden';
                return;
            }
            
            // עדכון מצב הכפתור
            backButton.disabled = !canGoBack;
            backButton.style.pointerEvents = canGoBack ? 'auto' : 'none';
            backButton.style.opacity = canGoBack ? '1' : '0.5';
            backButton.style.display = 'flex';
            backButton.style.visibility = 'visible';
            
            // וידוא שיש data-onclick
            if (!backButton.getAttribute('data-onclick')) {
                backButton.setAttribute('data-onclick', 'window.modalNavigationManager && window.modalNavigationManager.goBack()');
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error updating back button:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    // ===== MODAL DETECTION =====
    
    /**
     * Detect modal info - זיהוי מידע על מודול
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @returns {Object} מידע על המודול
     * @private
     */
    detectModalInfo(modalElement) {
        try {
            const info = {
                type: 'entity-details',
                entityType: null,
                entityId: null,
                title: null,
                sourceInfo: null,
                icon: null,
                color: null
            };
            
            // זיהוי entityType ו-entityId מ-DOM
            const titleElement = modalElement.querySelector('.modal-title');
            if (titleElement) {
                info.title = titleElement.textContent || titleElement.innerText || '';
            }
            
            // זיהוי מ-EntityDetailsModal אם קיים
            if (window.entityDetailsModal) {
                info.entityType = window.entityDetailsModal.currentEntityType || null;
                info.entityId = window.entityDetailsModal.currentEntityId || null;
                info.sourceInfo = window.entityDetailsModal.sourceInfo || null;
            }
            
            // אם לא נמצא, ננסה לזהות מ-DOM
            if (!info.entityType) {
                // נחפש בו-DOM רמזים ל-entityType
                const modalLabel = modalElement.querySelector('[id$="Label"]');
                if (modalLabel) {
                    const labelText = modalLabel.textContent || '';
                    // ניסיון לזהות entityType מהטקסט
                    if (labelText.includes('תכנון')) {
                        info.entityType = 'trade_plan';
                    } else if (labelText.includes('טרייד')) {
                        info.entityType = 'trade';
                    } else if (labelText.includes('ביצוע')) {
                        info.entityType = 'execution';
                    } else if (labelText.includes('חשבון')) {
                        info.entityType = 'account';
                    } else if (labelText.includes('התראה')) {
                        info.entityType = 'alert';
                    } else if (labelText.includes('הערה')) {
                        info.entityType = 'note';
                    }
                }
            }
            
            // אם לא מצאנו entityId, ננסה למצוא אותו מהכותרת
            if (!info.entityId && info.title) {
                const match = info.title.match(/(\d+)/);
                if (match) {
                    info.entityId = parseInt(match[1], 10);
                }
            }
            
            // אם עדיין לא מצאנו, ננסה לחפש ב-DOM
            if (!info.entityId) {
                // נחפש data attributes או elements עם entity-id
                const entityIdElement = modalElement.querySelector('[data-entity-id]');
                if (entityIdElement) {
                    const entityIdAttr = entityIdElement.getAttribute('data-entity-id');
                    if (entityIdAttr && entityIdAttr !== 'null' && entityIdAttr !== 'undefined') {
                        info.entityId = parseInt(entityIdAttr, 10) || entityIdAttr;
                    }
                }
            }
            
            // קבלת icon ו-color לפי entityType
            if (info.entityType) {
                info.icon = this.getEntityIcon(info.entityType);
                info.color = this.getEntityColor(info.entityType);
            }
            
            return info;
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error detecting modal info:', error, { page: "modal-navigation-manager" });
            }
            return {
                type: 'unknown',
                entityType: null,
                entityId: null,
                title: null,
                sourceInfo: null,
                icon: null,
                color: null
            };
        }
    }
    
    // ===== ENTITY HELPERS =====
    
    /**
     * Get entity label - קבלת שם ישות בעברית
     * 
     * @param {string} entityType - סוג ישות
     * @returns {string} שם ישות בעברית
     * @private
     */
    getEntityLabel(entityType) {
        const labels = {
            ticker: 'טיקר',
            trade: 'טרייד',
            trade_plan: 'תכנון',
            execution: 'ביצוע',
            account: 'חשבון',
            alert: 'התראה',
            cash_flow: 'תזרים מזומנים',
            note: 'הערה'
        };
        
        return labels[entityType] || entityType;
    }
    
    /**
     * Get entity icon - קבלת נתיב איקון לישות
     * 
     * @param {string} entityType - סוג הישות
     * @returns {string} נתיב לאיקון SVG
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
            note: '/trading-ui/images/icons/notes.svg'
        };
        
        return iconMappings[entityType] || '/trading-ui/images/icons/home.svg';
    }
    
    /**
     * Get entity color - קבלת צבע ישות
     * 
     * @param {string} entityType - סוג הישות
     * @returns {string} צבע הישות
     * @private
     */
    getEntityColor(entityType) {
        // שימוש ב-window.getEntityColor אם קיים
        if (window.getEntityColor && typeof window.getEntityColor === 'function') {
            const color = window.getEntityColor(entityType);
            if (color) {
                return color;
            }
        }
        
        // fallback לצבעים בסיסיים
        const colors = {
            ticker: '#007bff',
            trade: '#28a745',
            trade_plan: '#17a2b8',
            execution: '#ffc107',
            account: '#6f42c1',
            alert: '#dc3545',
            cash_flow: '#20c997',
            note: '#6c757d'
        };
        
        return colors[entityType] || '#6c757d';
    }
    
    /**
     * Get modal title - קבלת כותרת מודול
     * 
     * @param {Object} modalInfo - מידע על המודול
     * @returns {string} כותרת המודול
     * @private
     */
    getModalTitle(modalInfo) {
        if (modalInfo.title) {
            return modalInfo.title;
        }
        
        if (modalInfo.entityType && modalInfo.entityId !== undefined) {
            const entityLabel = this.getEntityLabel(modalInfo.entityType);
            return `${entityLabel} #${modalInfo.entityId}`;
        }
        
        return 'מודול';
    }
    
    // ===== BACKDROP MANAGEMENT =====
    
    /**
     * Manage backdrop - ניהול backdrop גלובלי
     * 
     * @private
     */
    manageBackdrop() {
        try {
            if (this.modalHistory.length > 0) {
                // יש מודולים פתוחים - צריך backdrop
                if (!this.globalBackdrop) {
                    this.createGlobalBackdrop();
                }
            } else {
                // אין מודולים פתוחים - הסרת backdrop
                this.removeGlobalBackdrop();
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error managing backdrop:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Create global backdrop - יצירת backdrop גלובלי
     * 
     * @private
     */
    createGlobalBackdrop() {
        try {
            // הסרת backdrops קיימים של Bootstrap
            const existingBackdrops = document.querySelectorAll('.modal-backdrop');
            existingBackdrops.forEach(backdrop => {
                if (backdrop.id !== 'globalModalBackdrop') {
                    backdrop.remove();
                }
            });
            
            // יצירת backdrop גלובלי אם לא קיים
            if (!this.globalBackdrop) {
                this.globalBackdrop = document.createElement('div');
                this.globalBackdrop.id = 'globalModalBackdrop';
                this.globalBackdrop.className = 'modal-backdrop fade show global-modal-backdrop';
                document.body.appendChild(this.globalBackdrop);
            }
            
            // עדכון z-index לפי מספר המודולים
            const zIndex = 1040 + (this.modalHistory.length * 10);
            this.globalBackdrop.style.zIndex = zIndex.toString();
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error creating global backdrop:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Remove global backdrop - הסרת backdrop גלובלי
     * 
     * @private
     */
    removeGlobalBackdrop() {
        try {
            // הסרת ה-backdrop הגלובלי שלנו
            if (this.globalBackdrop) {
                this.globalBackdrop.remove();
                this.globalBackdrop = null;
            }
            
            // הסרת כל backdrops קיימים (כולל אלה ש-Bootstrap יוצר)
            const existingBackdrops = document.querySelectorAll('.modal-backdrop');
            existingBackdrops.forEach(backdrop => {
                try {
                    backdrop.remove();
                } catch (e) {
                    // אם יש בעיה בהסרה, ננסה דרך parent
                    if (backdrop.parentNode) {
                        backdrop.parentNode.removeChild(backdrop);
                    }
                }
            });
            
            // הסרת כל backdrops גם אם הם עדיין שם (למקרה של בעיות timing)
            setTimeout(() => {
                const remainingBackdrops = document.querySelectorAll('.modal-backdrop');
                remainingBackdrops.forEach(backdrop => {
                    try {
                        backdrop.remove();
                    } catch (e) {
                        if (backdrop.parentNode) {
                            backdrop.parentNode.removeChild(backdrop);
                        }
                    }
                });
            }, 100);
            
            // הסרת class מ-body אם Bootstrap הוסיף אותו
            if (document.body.classList.contains('modal-open')) {
                document.body.classList.remove('modal-open');
            }
            
            // הסרת style overflow מ-body אם Bootstrap הוסיף אותו
            if (document.body.style.overflow === 'hidden') {
                document.body.style.overflow = '';
            }
            
            if (window.Logger) {
                window.Logger.info('✅ [removeGlobalBackdrop] Removed all backdrops', {
                    page: "modal-navigation-manager"
                });
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error removing global backdrop:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    // ===== EVENT HANDLERS =====
    
    /**
     * Handle modal shown - טיפול באירוע פתיחת מודול
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @private
     */
    async handleModalShown(modalElement) {
        try {
            const modalId = modalElement?.id || 'unknown';
            
            // הגנה מפני לולאות אינסופיות
            const now = Date.now();
            const lastHandled = this.recentlyHandledModals.get(modalId);
            const timeSinceLastCall = lastHandled ? (now - lastHandled) : Infinity;
            
            if (timeSinceLastCall < 100) {
                if (window.Logger) {
                    window.Logger.debug('⏭️ [handleModalShown] Skipping duplicate call within 100ms', {
                        modalId,
                        timeSinceLastCall,
                        page: "modal-navigation-manager"
                    });
                }
                return;
            }
            
            this.recentlyHandledModals.set(modalId, now);
            
            // ניקוי מודולים ישנים מהמפה
            if (this.recentlyHandledModals.size > 10) {
                for (const [id, timestamp] of this.recentlyHandledModals.entries()) {
                    if (now - timestamp > 5000) {
                        this.recentlyHandledModals.delete(id);
                    }
                }
            }
            
            if (window.Logger) {
                window.Logger.info('✅ [handleModalShown] Bootstrap modal shown event', {
                    modalId,
                    historyLength: this.modalHistory.length,
                    page: "modal-navigation-manager"
                });
            }
            
            // זיהוי מידע על המודול
            let modalInfo = this.detectModalInfo(modalElement);
            
            // בדיקה נוספת: אם detectModalInfo לא מצא sourceInfo, אבל יש ב-EntityDetailsModal
            if (window.entityDetailsModal && window.entityDetailsModal.sourceInfo && 
                !modalInfo.sourceInfo) {
                modalInfo.sourceInfo = window.entityDetailsModal.sourceInfo;
            }
            
            // עדכון או הוספה למערך
            await this.pushModal(modalElement, modalInfo);
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error handling modal shown:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Handle modal hidden - טיפול באירוע סגירת מודול
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @private
     */
    handleModalHidden(modalElement) {
        try {
            // אם אנחנו במצב navigation - לא למחוק את המודול מה-history
            // הוא כבר נמחק ב-navigateToModal אחרי שהוא נסגר
            if (this._isNavigating) {
                if (window.Logger) {
                    window.Logger.debug('⏭️ [handleModalHidden] Skipping removal - navigation in progress', {
                        modalId: modalElement?.id,
                        page: "modal-navigation-manager"
                    });
                }
                // ניהול backdrop גם במצב navigation
                this.manageBackdrop();
                return;
            }
            
            // בדיקה אם המודול עדיין קיים ב-history
            // אם זה סגירה דרך goBack(), המודול כבר הוסר מה-history ב-popModal()
            const modalIndex = this.modalHistory.findIndex(item => item.element === modalElement);
            
            if (modalIndex >= 0) {
                // המודול עדיין ב-history - הסרה שלו (סגירה רגילה, לא דרך goBack)
                if (window.Logger) {
                    window.Logger.info('🗑️ [handleModalHidden] Removing modal from history (closed directly)', {
                        modalId: modalElement?.id,
                        modalIndex,
                        historyLengthBefore: this.modalHistory.length,
                        page: "modal-navigation-manager"
                    });
                }
                
                // יצירת עותק חדש של המערך (immutable update)
                this.modalHistory = this.modalHistory.filter((item, index) => index !== modalIndex);
            }
            
            // בדיקה אם יש עוד מודולים פתוחים ב-DOM
            // בודקים מודולים שפתוחים (עם class 'show' או display: block)
            const openModals = document.querySelectorAll('.modal.show, .modal[style*="display: block"]');
            const hasOpenModals = openModals.length > 0;
            
            // אם אין יותר מודולים פתוחים - ניקוי מלא של ההיסטוריה
            if (!hasOpenModals) {
                if (window.Logger) {
                    window.Logger.info('🗑️ [handleModalHidden] No modals open - clearing history', {
                        modalId: modalElement?.id,
                        historyLengthBefore: this.modalHistory.length,
                        openModalsCount: openModals.length,
                        page: "modal-navigation-manager"
                    });
                }
                this.clearHistory();
            }
            
            // ניהול backdrop (אם יש מודולים אחרים פתוחים)
            this.manageBackdrop();
            
            if (window.Logger) {
                window.Logger.debug('✅ [handleModalHidden] Bootstrap modal hidden event', {
                    modalId: modalElement?.id,
                    wasInHistory: modalIndex >= 0,
                    historyLengthAfter: this.modalHistory.length,
                    page: "modal-navigation-manager"
                });
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error handling modal hidden:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    // ===== UTILITIES =====
    
    /**
     * Generate modal ID - יצירת מזהה ייחודי למודול
     * 
     * @param {Object} modalInfo - מידע על המודול
     * @returns {string} מזהה ייחודי
     * @private
     */
    generateModalId(modalInfo) {
        if (!modalInfo) {
            return 'unknown';
        }
        
        const key = `${modalInfo.entityType || 'unknown'}:${modalInfo.entityId !== undefined ? modalInfo.entityId : '?'}`;
        const sourceInfoStr = JSON.stringify(modalInfo.sourceInfo || null);
        
        return `${key}:${sourceInfoStr}`;
    }
    
    /**
     * Compare modals - השוואה בין שני מודולים
     * 
     * @param {Object} modal1 - מודול ראשון
     * @param {Object} modal2 - מודול שני
     * @returns {boolean} true אם המודולים זהים
     * @private
     */
    compareModals(modal1, modal2) {
        const id1 = this.generateModalId(modal1.info);
        const id2 = this.generateModalId(modal2.info);
        return id1 === id2;
    }
    
    /**
     * Save modal content - שמירת תוכן מודול
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @returns {string|null} תוכן המודול או null
     * @private
     */
    saveModalContent(modalElement) {
        try {
            const contentElement = modalElement.querySelector('#entityDetailsContent') ||
                                 modalElement.querySelector('.modal-body');
            
            if (contentElement && contentElement.innerHTML) {
                return contentElement.innerHTML;
            }
            
            return null;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error saving modal content:', error, { page: "modal-navigation-manager" });
            }
            return null;
        }
    }
    
    /**
     * Restore modal content - שחזור תוכן מודול
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @param {string} content - תוכן לשחזור
     * @param {Object} modalInfo - מידע על המודול (entityType, entityId) - אופציונלי
     * @private
     */
    restoreModalContent(modalElement, content, modalInfo = null) {
        try {
            if (!content) {
                return;
            }
            
            const contentElement = modalElement.querySelector('#entityDetailsContent') ||
                                 modalElement.querySelector('.modal-body');
            
            if (contentElement) {
                contentElement.innerHTML = content;
                
                // אם זה מודול של entity details, נטען מחדש את הפריטים המקושרים
                // כדי לוודא שהם מעודכנים
                if (modalInfo && modalInfo.entityType && modalInfo.entityId && 
                    window.entityDetailsModal && window.entityDetailsModal.loadEntityData) {
                    
                    // מחכים קצת כדי שהתוכן יכנס ל-DOM
                    setTimeout(async () => {
                        try {
                            if (window.Logger) {
                                window.Logger.debug('🔄 [restoreModalContent] Reloading entity data for linked items', {
                                    entityType: modalInfo.entityType,
                                    entityId: modalInfo.entityId,
                                    page: "modal-navigation-manager"
                                });
                            }
                            
                            // טעינה מחדש של הנתונים כולל הפריטים המקושרים
                            await window.entityDetailsModal.loadEntityData(
                                modalInfo.entityType,
                                modalInfo.entityId,
                                {
                                    includeLinkedItems: true,
                                    includeMarketData: true,
                                    forceRefresh: false // לא להכריח רענון - נשתמש במטמון אם יש
                                }
                            );
                        } catch (error) {
                            if (window.Logger) {
                                window.Logger.error('❌ Error reloading entity data after restore:', error, { 
                                    page: "modal-navigation-manager" 
                                });
                            }
                        }
                    }, 100);
                }
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error restoring modal content:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Update modal content - עדכון תוכן מודול קיים
     * 
     * פונקציה זו מאפשרת לעדכן את התוכן של מודול קיים ב-history
     * מבלי לשנות את ה-info שלו. זה חשוב עבור אינטגרציה עם EntityDetailsModal
     * שמעדכן את התוכן אחרי טעינת הנתונים.
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @param {string} content - תוכן חדש
     * @public
     */
    updateModalContent(modalElement, content) {
        try {
            if (!modalElement || !content) {
                return;
            }
            
            // מציאת אינדקס המודול במערך
            const index = this.modalHistory.findIndex(item => item.element === modalElement);
            
            if (index >= 0) {
                // יצירת עותק חדש של המערך (immutable update)
                this.modalHistory = [...this.modalHistory];
                
                // עדכון התוכן רק אם הוא יותר טוב מהקיים
                const existingContent = this.modalHistory[index].content;
                if (!existingContent || content.length > existingContent.length) {
                    this.modalHistory[index] = {
                        ...this.modalHistory[index],
                        content: content
                    };
                }
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error updating modal content:', error, { page: "modal-navigation-manager" });
            }
        }
    }
    
    /**
     * Update modal title in history - עדכון כותרת מודול ב-history
     * 
     * פונקציה זו מאפשרת לעדכן את הכותרת של מודול קיים ב-history
     * מבלי לשנות את שאר המידע שלו.
     * 
     * @param {HTMLElement} modalElement - אלמנט המודול
     * @param {string} title - כותרת חדשה
     * @public
     */
    updateModalTitleInHistory(modalElement, title) {
        try {
            if (!modalElement || !title) {
                return;
            }
            
            // מציאת אינדקס המודול במערך
            const index = this.modalHistory.findIndex(item => item.element === modalElement);
            
            if (index >= 0) {
                // יצירת עותק חדש של המערך (immutable update)
                this.modalHistory = [...this.modalHistory];
                
                // עדכון הכותרת
                this.modalHistory[index] = {
                    ...this.modalHistory[index],
                    info: {
                        ...this.modalHistory[index].info,
                        title: title.trim()
                    }
                };
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error updating modal title in history:', error, { page: "modal-navigation-manager" });
            }
        }
    }
}

// ===== INITIALIZATION =====

/**
 * Initialize ModalNavigationManager - אתחול אוטומטי
 */
(function() {
    function initializeNavigationManager() {
        if (!window.modalNavigationManager) {
            try {
                window.modalNavigationManager = new ModalNavigationManager();
                window.modalNavigationManager.init().then(() => {
                    if (window.Logger) {
                        window.Logger.info('✅ ModalNavigationManager initialized', { 
                            instanceExists: !!window.modalNavigationManager,
                            isInitialized: window.modalNavigationManager?.isInitialized,
                            historyLength: window.modalNavigationManager?.modalHistory?.length || 0,
                            page: "modal-navigation-manager" 
                        });
                    }
                }).catch((error) => {
                    if (window.Logger) {
                        window.Logger.error('❌ Failed to initialize ModalNavigationManager', {
                            error: error.message,
                            stack: error.stack,
                            page: "modal-navigation-manager"
                        });
                    }
                });
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ Failed to create ModalNavigationManager', {
                        error: error.message,
                        stack: error.stack,
                        page: "modal-navigation-manager"
                    });
                } else {
                    console.error('❌ Failed to create ModalNavigationManager:', error);
                }
            }
        } else {
            if (window.Logger) {
                window.Logger.debug('ModalNavigationManager already exists', { 
                    isInitialized: window.modalNavigationManager?.isInitialized,
                    historyLength: window.modalNavigationManager?.modalHistory?.length || 0,
                    page: "modal-navigation-manager" 
                });
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
 * @returns {Promise<void>}
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
 * @returns {Promise<boolean>} true אם חזרנו בהצלחה
 */
window.goBackInModalNavigation = async function() {
    if (window.modalNavigationManager) {
        return await window.modalNavigationManager.goBack();
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
