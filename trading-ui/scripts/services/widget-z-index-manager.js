/**
 * Widget Z-Index Manager - מערכת מרכזית לניהול z-index של widget overlays
 * ============================================================================
 * 
 * מערכת זו מספקת ניהול מרכזי ודינמי של z-index ל-widget overlays.
 * היא מחשבה z-index באופן דינמי לפי stack של overlays פעילים ומבטיחה שהעלון החדש
 * תמיד מופיע מעל העלון הקודם.
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * Features:
 * - חישוב z-index דינמי לפי stack depth
 * - ניהול stack של overlays פעילים
 * - עדכון אוטומטי של z-index בעת פתיחה/סגירה
 * - תמיכה ב-BASE_Z_INDEX ו-Z_INDEX_INCREMENT (כמו ModalZIndexManager)
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/NESTED_MODALS_Z_INDEX_SYSTEM.md
 * - documentation/02-ARCHITECTURE/FRONTEND/WIDGET_OVERLAY_SYSTEM.md
 */

(function() {
    'use strict';

    /**
     * Widget Z-Index Manager - מנהל z-index מרכזי ל-widget overlays
     */
    class WidgetZIndexManager {
        constructor() {
            // Use same base as ModalZIndexManager but start higher to be above modals
            // Modals use 1040-1090, so widgets should use 1100+
            this.BASE_Z_INDEX = 1100;
            this.Z_INDEX_INCREMENT = 10;
            this.isInitialized = false;
            
            // Track active overlays stack
            this.overlayStack = [];
            
            this.init();
        }

        /**
         * Initialize - אתחול המערכת
         * 
         * @private
         */
        init() {
            try {
                this.isInitialized = true;
                window.Logger?.info('WidgetZIndexManager initialized successfully', {
                    page: 'widget-z-index-manager',
                    baseZIndex: this.BASE_Z_INDEX,
                    increment: this.Z_INDEX_INCREMENT
                });
            } catch (error) {
                window.Logger?.error('Error initializing WidgetZIndexManager', {
                    error: error?.message || error,
                    page: 'widget-z-index-manager'
                });
            }
        }

        /**
         * Register overlay - רישום overlay חדש
         * 
         * @param {HTMLElement} overlayElement - אלמנט ה-overlay
         * @param {HTMLElement} itemElement - אלמנט ה-item הקשור
         * @returns {number} z-index שהוקצה
         */
        registerOverlay(overlayElement, itemElement) {
            if (!overlayElement) {
                window.Logger?.warn('WidgetZIndexManager: Cannot register overlay - element is null', {
                    page: 'widget-z-index-manager'
                });
                return this.BASE_Z_INDEX;
            }

            // Check if overlay is already registered
            const existingIndex = this.overlayStack.findIndex(entry => entry.overlay === overlayElement);
            if (existingIndex >= 0) {
                // Already registered, return existing z-index
                const stackIndex = existingIndex;
                const zIndex = this.BASE_Z_INDEX + (stackIndex * this.Z_INDEX_INCREMENT);
                return zIndex;
            }

            // Add to stack
            const stackEntry = {
                overlay: overlayElement,
                item: itemElement,
                timestamp: Date.now()
            };
            
            this.overlayStack.push(stackEntry);
            const stackIndex = this.overlayStack.length - 1;
            const zIndex = this.BASE_Z_INDEX + (stackIndex * this.Z_INDEX_INCREMENT);

            // Update z-index
            this.updateOverlayZIndex(overlayElement, stackIndex);

            window.Logger?.debug('WidgetZIndexManager: Overlay registered', {
                overlayId: overlayElement.id || 'no-id',
                stackIndex,
                zIndex,
                stackLength: this.overlayStack.length,
                page: 'widget-z-index-manager'
            });

            return zIndex;
        }

        /**
         * Unregister overlay - הסרת overlay מה-stack
         * 
         * @param {HTMLElement} overlayElement - אלמנט ה-overlay
         */
        unregisterOverlay(overlayElement) {
            if (!overlayElement) {
                return;
            }

            const index = this.overlayStack.findIndex(entry => entry.overlay === overlayElement);
            if (index < 0) {
                return; // Not in stack
            }

            // Remove from stack
            this.overlayStack.splice(index, 1);

            // Update all remaining overlays
            this.updateAllOverlayZIndexes();

            window.Logger?.debug('WidgetZIndexManager: Overlay unregistered', {
                overlayId: overlayElement.id || 'no-id',
                remainingStackLength: this.overlayStack.length,
                page: 'widget-z-index-manager'
            });
        }

        /**
         * Calculate z-index for overlay - חישוב z-index ל-overlay
         * 
         * @param {number} stackIndex - אינדקס בסטאק (0 = ראשון, 1 = שני, וכו')
         * @returns {number} z-index value
         */
        calculateOverlayZIndex(stackIndex) {
            return this.BASE_Z_INDEX + (stackIndex * this.Z_INDEX_INCREMENT);
        }

        /**
         * Update z-index for a single overlay - עדכון z-index ל-overlay אחד
         * 
         * @param {HTMLElement} overlayElement - אלמנט ה-overlay
         * @param {number} stackIndex - אינדקס בסטאק
         */
        updateOverlayZIndex(overlayElement, stackIndex) {
            if (!overlayElement) {
                return;
            }

            const zIndex = this.calculateOverlayZIndex(stackIndex);
            overlayElement.style.zIndex = zIndex;

            window.Logger?.debug('WidgetZIndexManager: Overlay z-index updated', {
                overlayId: overlayElement.id || 'no-id',
                stackIndex,
                zIndex,
                page: 'widget-z-index-manager'
            });
        }

        /**
         * Update z-index for all overlays - עדכון z-index לכל ה-overlays
         */
        updateAllOverlayZIndexes() {
            this.overlayStack.forEach((entry, index) => {
                this.updateOverlayZIndex(entry.overlay, index);
            });
        }

        /**
         * Get current z-index for overlay - קבלת z-index נוכחי ל-overlay
         * 
         * @param {HTMLElement} overlayElement - אלמנט ה-overlay
         * @returns {number|null} z-index או null אם לא רשום
         */
        getOverlayZIndex(overlayElement) {
            if (!overlayElement) {
                return null;
            }

            const index = this.overlayStack.findIndex(entry => entry.overlay === overlayElement);
            if (index < 0) {
                return null;
            }

            return this.calculateOverlayZIndex(index);
        }

        /**
         * Clear all overlays - ניקוי כל ה-overlays
         */
        clearAll() {
            this.overlayStack = [];
            window.Logger?.debug('WidgetZIndexManager: All overlays cleared', {
                page: 'widget-z-index-manager'
            });
        }

        /**
         * Destroy - הרס המערכת
         */
        destroy() {
            this.clearAll();
            this.isInitialized = false;

            window.Logger?.info('WidgetZIndexManager destroyed', {
                page: 'widget-z-index-manager'
            });
        }
    }

    // יצירת instance גלובלי
    if (!window.WidgetZIndexManager) {
        window.WidgetZIndexManager = new WidgetZIndexManager();
        window.Logger?.info('WidgetZIndexManager instance created', {
            page: 'widget-z-index-manager'
        });
    }

})();


