/**
 * Modal Z-Index Manager - מערכת מרכזית לניהול z-index של מודולים מקוננים
 * ============================================================================
 * 
 * מערכת זו מספקת ניהול מרכזי ודינמי של z-index למודולים מקוננים (nested modals).
 * היא מחשבה z-index באופן דינמי לפי עומק ה-stack ומבטיחה שהמודול החדש תמיד מופיע
 * מעל המודול הקודם, בעוד שהמודול הקודם נשאר נראה (dimmed) מאחוריו.
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * Features:
 * - חישוב z-index דינמי לפי stack depth
 * - אינטגרציה עם ModalNavigationService
 * - אינטגרציה עם ModalManagerV2
 * - עדכון אוטומטי של z-index בעת שינוי stack
 * - תמיכה ב-CSS variables לדינמיות
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/NESTED_MODALS_Z_INDEX_SYSTEM.md
 * - documentation/03-DEVELOPMENT/GUIDES/NESTED_MODALS_GUIDE.md
 */

(function() {
    'use strict';

    /**
     * Modal Z-Index Manager - מנהל z-index מרכזי
     */
    class ModalZIndexManager {
        constructor() {
            this.BASE_Z_INDEX = 1040;
            this.Z_INDEX_INCREMENT = 10;
            this.BACKDROP_Z_INDEX = this.BASE_Z_INDEX - 1;
            this.isInitialized = false;
            
            // מאזינים לשינויים ב-stack
            this.navigationUnsubscribe = null;
            
            this.init();
        }

        /**
         * Initialize - אתחול המערכת
         * 
         * @private
         */
        init() {
            try {
                // המתנה עד ש-ModalNavigationService זמין
                if (window.ModalNavigationService) {
                    this.setupNavigationListener();
                } else {
                    // Retry mechanism
                    let retries = 0;
                    const maxRetries = 10;
                    const checkInterval = setInterval(() => {
                        retries++;
                        if (window.ModalNavigationService) {
                            clearInterval(checkInterval);
                            this.setupNavigationListener();
                        } else if (retries >= maxRetries) {
                            clearInterval(checkInterval);
                            window.Logger?.warn('ModalNavigationService not available after retries, z-index updates will be manual', {
                                page: 'modal-z-index-manager'
                            });
                        }
                    }, 100);
                }

                this.isInitialized = true;
                window.Logger?.info('ModalZIndexManager initialized successfully', {
                    page: 'modal-z-index-manager'
                });
            } catch (error) {
                window.Logger?.error('Error initializing ModalZIndexManager', {
                    error: error?.message || error,
                    page: 'modal-z-index-manager'
                });
            }
        }

        /**
         * Setup navigation listener - הגדרת מאזין לשינויי stack
         * 
         * @private
         */
        setupNavigationListener() {
            if (!window.ModalNavigationService) {
                return;
            }

            try {
                // Subscribe לשינויי stack
                this.navigationUnsubscribe = window.ModalNavigationService.subscribe((snapshot) => {
                    if (snapshot && snapshot.stack) {
                        // עדכון מיידי עם requestAnimationFrame
                        requestAnimationFrame(() => {
                            this.updateAllModalZIndexes(snapshot.stack);
                        });
                    }
                });

                window.Logger?.debug('ModalZIndexManager: Navigation listener setup complete', {
                    page: 'modal-z-index-manager'
                });
            } catch (error) {
                window.Logger?.warn('Error setting up navigation listener', {
                    error: error?.message || error,
                    page: 'modal-z-index-manager'
                });
            }
        }

        /**
         * Calculate z-index for modal - חישוב z-index למודול
         * 
         * @param {number} stackIndex - אינדקס בסטאק (0 = ראשון, 1 = שני, וכו')
         * @param {number} totalStack - סך כל המודולים בסטאק
         * @returns {Object} Object עם z-index values
         */
        calculateModalZIndex(stackIndex, totalStack) {
            // z-index של modal = BASE + (stackIndex * INCREMENT)
            const modalZIndex = this.BASE_Z_INDEX + (stackIndex * this.Z_INDEX_INCREMENT);
            const dialogZIndex = modalZIndex + 1;
            const contentZIndex = modalZIndex + 2;
            const backdropZIndex = this.BACKDROP_Z_INDEX + (stackIndex * this.Z_INDEX_INCREMENT);

            return {
                modal: modalZIndex,
                dialog: dialogZIndex,
                content: contentZIndex,
                backdrop: backdropZIndex
            };
        }

        /**
         * Update z-index for a single modal - עדכון z-index למודול אחד
         * 
         * @param {HTMLElement} modalElement - אלמנט המודול
         * @param {number} stackIndex - אינדקס בסטאק
         * @param {number} totalStack - סך כל המודולים בסטאק
         */
        updateModalZIndex(modalElement, stackIndex, totalStack) {
            if (!modalElement) {
                window.Logger?.warn('🔍 [Z-INDEX] updateModalZIndex: modalElement is null', {
                    stackIndex,
                    totalStack,
                    page: 'modal-z-index-manager'
                });
                return;
            }

            // קליטת z-index קיים לפני העדכון (לניטור)
            const previousModalZIndex = modalElement.style.zIndex || getComputedStyle(modalElement).zIndex || 'none';
            const dialog = modalElement.querySelector('.modal-dialog');
            const content = modalElement.querySelector('.modal-content');
            const previousDialogZIndex = dialog ? (dialog.style.zIndex || getComputedStyle(dialog).zIndex || 'none') : 'none';
            const previousContentZIndex = content ? (content.style.zIndex || getComputedStyle(content).zIndex || 'none') : 'none';

            const zIndexes = this.calculateModalZIndex(stackIndex, totalStack);

            // עדכון CSS variables על המודול
            modalElement.style.setProperty('--modal-z-index', zIndexes.modal);
            modalElement.style.setProperty('--modal-dialog-z-index', zIndexes.dialog);
            modalElement.style.setProperty('--modal-content-z-index', zIndexes.content);
            modalElement.style.setProperty('--backdrop-z-index', zIndexes.backdrop);

            // עדכון z-index ישירות על האלמנטים
            modalElement.style.zIndex = zIndexes.modal;

            if (dialog) {
                dialog.style.zIndex = zIndexes.dialog;
            }

            if (content) {
                content.style.zIndex = zIndexes.content;
            }

            // עדכון backdrop z-index
            const globalBackdrop = document.getElementById('globalModalBackdrop');
            let backdropZIndexBefore = 'none';
            let backdropZIndexAfter = 'none';
            if (globalBackdrop) {
                backdropZIndexBefore = globalBackdrop.style.zIndex || getComputedStyle(globalBackdrop).zIndex || 'none';
                // Backdrop z-index = z-index של המודול הנמוך ביותר - 1
                const lowestModalZIndex = this.BASE_Z_INDEX;
                backdropZIndexAfter = lowestModalZIndex - 1;
                globalBackdrop.style.zIndex = backdropZIndexAfter;
            }

            // עדכון מיידי של classes ו-opacity לפני עדכון z-index
            // זה מבטיח שהמודולים הקודמים יהפכו ל-dimmed מיד
            const wasActive = modalElement.classList.contains('modal-active');
            const wasStacked = modalElement.classList.contains('modal-stacked');
            const previousOpacity = modalElement.style.opacity || getComputedStyle(modalElement).opacity || '1';
            
            // עדכון classes ו-opacity מיד - לפני עדכון z-index
            if (stackIndex === totalStack - 1) {
                // המודול הפעיל - full visibility
                modalElement.classList.remove('modal-stacked');
                modalElement.classList.add('modal-active');
                // עדכון מיידי של opacity ו-pointer-events
                requestAnimationFrame(() => {
                    modalElement.style.opacity = '1';
                    modalElement.style.pointerEvents = 'auto';
                });
            } else {
                // מודולים קודמים - dimmed
                modalElement.classList.remove('modal-active');
                modalElement.classList.add('modal-stacked');
                // עדכון מיידי של opacity ו-pointer-events
                requestAnimationFrame(() => {
                    modalElement.style.opacity = '0.5';
                    modalElement.style.pointerEvents = 'none';
                });
            }

            // ניטור מפורט
            window.Logger?.info('🔍 [Z-INDEX] Modal z-index updated', {
                modalId: modalElement.id,
                stackIndex,
                totalStack,
                zIndexes,
                previous: {
                    modalZIndex: previousModalZIndex,
                    dialogZIndex: previousDialogZIndex,
                    contentZIndex: previousContentZIndex,
                    opacity: previousOpacity,
                    wasActive,
                    wasStacked
                },
                current: {
                    modalZIndex: zIndexes.modal,
                    dialogZIndex: zIndexes.dialog,
                    contentZIndex: zIndexes.content,
                    opacity: modalElement.style.opacity || getComputedStyle(modalElement).opacity,
                    isActive: modalElement.classList.contains('modal-active'),
                    isStacked: modalElement.classList.contains('modal-stacked')
                },
                backdrop: {
                    exists: !!globalBackdrop,
                    zIndexBefore: backdropZIndexBefore,
                    zIndexAfter: backdropZIndexAfter
                },
                page: 'modal-z-index-manager'
            });
        }

        /**
         * Update z-index for all modals - עדכון z-index לכל המודולים
         * 
         * @param {Array} stack - רשימת מודולים מה-stack (מ-ModalNavigationService)
         */
        updateAllModalZIndexes(stack) {
            if (!Array.isArray(stack) || stack.length === 0) {
                // אין מודולים פתוחים - איפוס
                window.Logger?.info('🔍 [Z-INDEX] No modals in stack, resetting all z-indexes', {
                    page: 'modal-z-index-manager'
                });
                this.resetAllZIndexes();
                return;
            }

            window.Logger?.info('🔍 [Z-INDEX] Starting update of all modal z-indexes', {
                stackLength: stack.length,
                stackSummary: stack.map((entry, idx) => ({
                    index: idx,
                    modalId: entry.modalId,
                    modalType: entry.modalType,
                    hasElement: !!entry.element
                })),
                page: 'modal-z-index-manager'
            });

            // עדכון z-index לכל מודול ב-stack
            stack.forEach((entry, index) => {
                const modalElement = entry.element || document.getElementById(entry.modalId);
                if (modalElement) {
                    this.updateModalZIndex(modalElement, index, stack.length);
                } else {
                    window.Logger?.warn('🔍 [Z-INDEX] Modal element not found for stack entry', {
                        modalId: entry.modalId,
                        stackIndex: index,
                        totalStack: stack.length,
                        entry: {
                            modalId: entry.modalId,
                            modalType: entry.modalType,
                            hasElement: !!entry.element
                        },
                        page: 'modal-z-index-manager'
                    });
                }
            });

            // עדכון backdrop z-index לפי המודול הנמוך ביותר
            this.updateBackdropZIndex(stack.length);

            // סיכום סופי
            const allModals = document.querySelectorAll('.modal.show');
            const modalSummary = Array.from(allModals).map(modal => {
                const computedStyle = getComputedStyle(modal);
                const dialog = modal.querySelector('.modal-dialog');
                const content = modal.querySelector('.modal-content');
                return {
                    modalId: modal.id,
                    zIndex: modal.style.zIndex || computedStyle.zIndex,
                    dialogZIndex: dialog ? (dialog.style.zIndex || getComputedStyle(dialog).zIndex) : 'none',
                    contentZIndex: content ? (content.style.zIndex || getComputedStyle(content).zIndex) : 'none',
                    opacity: modal.style.opacity || computedStyle.opacity,
                    isActive: modal.classList.contains('modal-active'),
                    isStacked: modal.classList.contains('modal-stacked'),
                    isNested: modal.classList.contains('modal-nested')
                };
            });

            const globalBackdrop = document.getElementById('globalModalBackdrop');
            window.Logger?.info('🔍 [Z-INDEX] All modal z-indexes updated - Final Summary', {
                stackLength: stack.length,
                modalsCount: allModals.length,
                modals: modalSummary,
                backdrop: {
                    exists: !!globalBackdrop,
                    zIndex: globalBackdrop ? (globalBackdrop.style.zIndex || getComputedStyle(globalBackdrop).zIndex) : 'none',
                    hasShowClass: globalBackdrop ? globalBackdrop.classList.contains('show') : false
                },
                page: 'modal-z-index-manager'
            });
        }

        /**
         * Update backdrop z-index - עדכון z-index של backdrop
         * 
         * @param {number} stackDepth - עומק ה-stack
         * @private
         */
        updateBackdropZIndex(stackDepth) {
            const globalBackdrop = document.getElementById('globalModalBackdrop');
            if (!globalBackdrop) {
                window.Logger?.warn('🔍 [BACKDROP] Global backdrop not found for z-index update', {
                    stackDepth,
                    backdropExists: !!document.getElementById('globalModalBackdrop'),
                    allBackdrops: Array.from(document.querySelectorAll('.modal-backdrop')).map(b => ({
                        id: b.id,
                        zIndex: b.style.zIndex || getComputedStyle(b).zIndex,
                        hasShowClass: b.classList.contains('show')
                    })),
                    page: 'modal-z-index-manager'
                });
                return;
            }

            // קליטת z-index קיים לפני העדכון (לניטור)
            const previousZIndex = globalBackdrop.style.zIndex || getComputedStyle(globalBackdrop).zIndex || 'none';
            const previousHasShowClass = globalBackdrop.classList.contains('show');
            const previousOpacity = globalBackdrop.style.opacity || getComputedStyle(globalBackdrop).opacity || 'none';

            // Backdrop תמיד מתחת למודול הנמוך ביותר
            const backdropZIndex = this.BACKDROP_Z_INDEX;
            globalBackdrop.style.setProperty('--backdrop-z-index', backdropZIndex);
            globalBackdrop.style.zIndex = backdropZIndex;

            // ניטור מפורט
            window.Logger?.info('🔍 [BACKDROP] Backdrop z-index updated', {
                backdropZIndex,
                stackDepth,
                previous: {
                    zIndex: previousZIndex,
                    hasShowClass: previousHasShowClass,
                    opacity: previousOpacity
                },
                current: {
                    zIndex: backdropZIndex,
                    hasShowClass: globalBackdrop.classList.contains('show'),
                    opacity: globalBackdrop.style.opacity || getComputedStyle(globalBackdrop).opacity,
                    isVisible: globalBackdrop.offsetParent !== null,
                    display: getComputedStyle(globalBackdrop).display
                },
                backdropElement: {
                    id: globalBackdrop.id,
                    className: globalBackdrop.className,
                    parentElement: globalBackdrop.parentElement?.tagName || 'none'
                },
                allBackdropsInDOM: Array.from(document.querySelectorAll('.modal-backdrop')).map(b => ({
                    id: b.id,
                    zIndex: b.style.zIndex || getComputedStyle(b).zIndex,
                    hasShowClass: b.classList.contains('show'),
                    isVisible: b.offsetParent !== null
                })),
                page: 'modal-z-index-manager'
            });
        }

        /**
         * Reset all z-indexes - איפוס כל ה-z-indexes
         * 
         * @private
         */
        resetAllZIndexes() {
            const allModals = document.querySelectorAll('.modal.show');
            allModals.forEach(modal => {
                modal.style.removeProperty('--modal-z-index');
                modal.style.removeProperty('--modal-dialog-z-index');
                modal.style.removeProperty('--modal-content-z-index');
                modal.style.zIndex = '';
                modal.style.opacity = '';
                modal.style.pointerEvents = '';
                
                // הסרת classes
                modal.classList.remove('modal-stacked', 'modal-active');

                const dialog = modal.querySelector('.modal-dialog');
                if (dialog) {
                    dialog.style.zIndex = '';
                }

                const content = modal.querySelector('.modal-content');
                if (content) {
                    content.style.zIndex = '';
                }
            });

            const globalBackdrop = document.getElementById('globalModalBackdrop');
            if (globalBackdrop) {
                globalBackdrop.style.removeProperty('--backdrop-z-index');
                globalBackdrop.style.zIndex = '';
            }

            window.Logger?.debug('All z-indexes reset', {
                page: 'modal-z-index-manager'
            });
        }

        /**
         * Force update - עדכון כפוי (לשימוש ידני)
         * 
         * @param {HTMLElement} modalElement - אלמנט המודול (אופציונלי)
         */
        forceUpdate(modalElement = null) {
            window.Logger?.info('🔍 [Z-INDEX] forceUpdate called', {
                hasModalElement: !!modalElement,
                modalId: modalElement?.id || 'all',
                page: 'modal-z-index-manager'
            });

            if (modalElement) {
                // עדכון מודול אחד לפי stack
                const stack = window.ModalNavigationService?.getStack?.() || [];
                const stackIndex = stack.findIndex(entry => 
                    entry.element === modalElement || entry.modalId === modalElement.id
                );
                
                if (stackIndex >= 0) {
                    window.Logger?.info('🔍 [Z-INDEX] forceUpdate: Updating single modal', {
                        modalId: modalElement.id,
                        stackIndex,
                        totalStack: stack.length,
                        page: 'modal-z-index-manager'
                    });
                    this.updateModalZIndex(modalElement, stackIndex, stack.length);
                } else {
                    window.Logger?.warn('🔍 [Z-INDEX] Modal not found in stack for force update', {
                        modalId: modalElement.id,
                        stackLength: stack.length,
                        stackSummary: stack.map(e => ({ modalId: e.modalId, hasElement: !!e.element })),
                        page: 'modal-z-index-manager'
                    });
                }
            } else {
                // עדכון כל המודולים
                const stack = window.ModalNavigationService?.getStack?.() || [];
                window.Logger?.info('🔍 [Z-INDEX] forceUpdate: Updating all modals', {
                    stackLength: stack.length,
                    stackSummary: stack.map((e, idx) => ({
                        index: idx,
                        modalId: e.modalId,
                        hasElement: !!e.element
                    })),
                    page: 'modal-z-index-manager'
                });
                this.updateAllModalZIndexes(stack);
            }
        }

        /**
         * Destroy - הרס המערכת
         */
        destroy() {
            if (this.navigationUnsubscribe) {
                this.navigationUnsubscribe();
                this.navigationUnsubscribe = null;
            }

            this.resetAllZIndexes();
            this.isInitialized = false;

            window.Logger?.info('ModalZIndexManager destroyed', {
                page: 'modal-z-index-manager'
            });
        }
    }

    // יצירת instance גלובלי
    if (!window.ModalZIndexManager) {
        window.ModalZIndexManager = new ModalZIndexManager();
        window.Logger?.info('ModalZIndexManager instance created', {
            page: 'modal-z-index-manager'
        });
    }

})();
