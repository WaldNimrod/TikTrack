/**
 * Modal Helper Service
 * שירות עזר למודלים - מספק פונקציות גלובליות לפתיחת מודלים
 *
 * Code Review Fix - Phase 4: אחידות <head>
 * מרכז את showModalSafe בשירות משותף במקום הגדרות כפולות בכל עמוד
 *
 * @version 1.0.0
 * @created December 2025
 * @author TikTrack Development Team
 */

(function() {
    'use strict';

    // ===== FUNCTION INDEX =====
    // - showModalSafe() - פתיחת מודל בצורה בטוחה עם המתנה ל-ModalManagerV2

    /**
     * Show modal safely - waits for ModalManagerV2 to be available
     * פתיחת מודל בצורה בטוחה עם המתנה ל-ModalManagerV2
     *
     * @param {string} modalId - Modal element ID
     * @param {string} mode - Modal mode ('add', 'edit', 'view', etc.)
     * @returns {Promise<void>}
     */
    function showModalSafe(modalId, mode = 'add') {
        return new Promise((resolve, reject) => {
            try {
                // Use Logger Service if available, fallback to console
                const log = window.Logger?.debug?.bind(window.Logger) || (() => {});
                const warn = window.Logger?.warn?.bind(window.Logger) || (() => {});
                const error = window.Logger?.error?.bind(window.Logger) || (() => {});

                log(`🔍 [ModalHelperService.showModalSafe] Called with:`, { modalId, mode, ModalManagerV2Available: !!window.ModalManagerV2 });

                // If ModalManagerV2 is not available, wait for it (up to 2 seconds)
                if (!window.ModalManagerV2) {
                    warn('⚠️ [ModalHelperService.showModalSafe] ModalManagerV2 not available, waiting...');
                    let attempts = 0;
                    const maxAttempts = 20; // 2 seconds at 100ms intervals

                    const checkModalManager = () => {
                        attempts++;

                        if (window.ModalManagerV2) {
                            log(`✅ [ModalHelperService.showModalSafe] ModalManagerV2 became available after ${(attempts * 100)}ms`);
                            openModal();
                        } else if (attempts >= maxAttempts) {
                            error('❌ [ModalHelperService.showModalSafe] ModalManagerV2 not available after timeout');
                            const message = 'מערכת המודלים לא זמינה. אנא רענן את הדף.';
                            if (window.showErrorNotification) {
                                window.showErrorNotification('שגיאה', message);
                            } else {
                                alert(message);
                            }
                            reject(new Error('ModalManagerV2 timeout'));
                        } else {
                            setTimeout(checkModalManager, 100);
                        }
                    };

                    const openModal = () => {
                        try {
                            if (window.ModalManagerV2 && window.ModalManagerV2.showModal) {
                                log(`✅ [ModalHelperService.showModalSafe] Calling ModalManagerV2.showModal`);
                                window.ModalManagerV2.showModal(modalId, mode);
                                log(`✅ [ModalHelperService.showModalSafe] Modal shown successfully`);
                                resolve();
                            } else {
                                throw new Error('ModalManagerV2.showModal not available');
                            }
                        } catch (modalError) {
                            error('❌ [ModalHelperService.showModalSafe] Error opening modal:', modalError);
                            const message = `שגיאה בפתיחת מודל: ${modalError.message}`;
                            if (window.showErrorNotification) {
                                window.showErrorNotification('שגיאה', message);
                            } else {
                                alert(message);
                            }
                            reject(modalError);
                        }
                    };

                    checkModalManager();
                } else {
                    // ModalManagerV2 is already available
                    if (window.ModalManagerV2 && window.ModalManagerV2.showModal) {
                        log(`✅ [ModalHelperService.showModalSafe] Calling ModalManagerV2.showModal (immediately)`);
                        window.ModalManagerV2.showModal(modalId, mode);
                        log(`✅ [ModalHelperService.showModalSafe] Modal shown successfully`);
                        resolve();
                    } else {
                        error('❌ [ModalHelperService.showModalSafe] ModalManagerV2.showModal not available');
                        reject(new Error('ModalManagerV2.showModal not available'));
                    }
                }
            } catch (err) {
                const error = window.Logger?.error?.bind(window.Logger) || (() => {});
                error('❌ [ModalHelperService.showModalSafe] Unexpected error:', err);
                window.Logger?.error?.("   Error stack:", err.stack);
                const message = `שגיאה בפתיחת מודל: ${err.message}`;
                if (window.showErrorNotification) {
                    window.showErrorNotification('שגיאה', message);
                } else {
                    alert(message);
                }
                reject(err);
            }
        });
    }

    // ===== GLOBAL EXPORTS =====

    // Create global service object
    window.ModalHelperService = {
        showModalSafe: showModalSafe,
        version: '1.0.0',
        created: 'December 2025'
    };

    // For backward compatibility, also expose showModalSafe globally
    // This allows existing onclick attributes to continue working
    if (typeof window.showModalSafe === 'undefined') {
        window.showModalSafe = showModalSafe;
    }

    // Log successful initialization
    const log = window.Logger?.debug?.bind(window.Logger) || console.log;
    log('✅ [ModalHelperService] Initialized successfully - showModalSafe available globally');

})();
