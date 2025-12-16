/**
 * Modal Z-Index Monitor - כלי ניטור z-index למודולים
 * ======================================================
 * 
 * כלי זה בודק ומנטר את z-index של כל המודולים הפתוחים,
 * מזהה בעיות z-index, ומציג התראות על בעיות.
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/NESTED_MODALS_Z_INDEX_SYSTEM.md
 * - documentation/03-DEVELOPMENT/GUIDES/NESTED_MODALS_GUIDE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - ModalZIndexMonitor.init() - Init
// - ModalZIndexMonitor.start() - Start

// === Event Handlers ===
// - ModalZIndexMonitor.stop() - Stop
// - ModalZIndexMonitor.check() - Check
// - ModalZIndexMonitor.getReport() - Getreport
// - ModalZIndexMonitor.getErrors() - Geterrors
// - ModalZIndexMonitor.getWarnings() - Getwarnings

(function() {
    'use strict';

    /**
     * Modal Z-Index Monitor - מנהל ניטור z-index
     */
    class ModalZIndexMonitor {
        constructor() {
            this.isMonitoring = false;
            this.monitoringInterval = null;
            this.checkInterval = 1000; // בדיקה כל שנייה
            this.lastState = null;
            this.errors = [];
            this.warnings = [];
            
            this.init();
        }

        /**
         * Initialize - אתחול המערכת
         * 
         * @private
         */
        init() {
            // יצירת פונקציות גלובליות לניטור
            window.modalZIndexMonitor = this;
            window.startModalZIndexMonitoring = () => this.start();
            window.stopModalZIndexMonitoring = () => this.stop();
            window.checkModalZIndex = () => this.check();
            window.getModalZIndexReport = () => this.getReport();
            
            window.Logger?.info('ModalZIndexMonitor initialized', {
                page: 'modal-z-index-monitor'
            });
        }

        /**
         * Start monitoring - התחלת ניטור
         */
        start() {
            if (this.isMonitoring) {
                window.Logger?.warn('ModalZIndexMonitor is already monitoring', {
                    page: 'modal-z-index-monitor'
                });
                return;
            }

            this.isMonitoring = true;
            this.errors = [];
            this.warnings = [];
            
            // בדיקה ראשונית
            this.check();
            
            // בדיקה תקופתית
            this.monitoringInterval = setInterval(() => {
                this.check();
            }, this.checkInterval);

            window.Logger?.info('ModalZIndexMonitor started', {
                checkInterval: this.checkInterval,
                page: 'modal-z-index-monitor'
            });
        }

        /**
         * Stop monitoring - עצירת ניטור
         */
        stop() {
            if (!this.isMonitoring) {
                return;
            }

            this.isMonitoring = false;
            
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }

            window.Logger?.info('ModalZIndexMonitor stopped', {
                page: 'modal-z-index-monitor'
            });
        }

        /**
         * Check z-index - בדיקת z-index של כל המודולים
         */
        check() {
            const report = {
                timestamp: new Date().toISOString(),
                modals: [],
                backdrops: [],
                stack: [],
                errors: [],
                warnings: []
            };

            // בדיקת stack
            const stack = window.ModalNavigationService?.getStack?.() || [];
            report.stack = stack.map((entry, index) => ({
                index,
                modalId: entry.modalId,
                instanceId: entry.instanceId,
                modalType: entry.modalType,
                entityType: entry.entityType,
                entityId: entry.entityId
            }));

            // בדיקת מודולים פתוחים
            const openModals = document.querySelectorAll('.modal.show');
            report.modals = Array.from(openModals).map(modal => {
                const modalId = modal.id || 'no-id';
                const computedStyle = getComputedStyle(modal);
                const dialog = modal.querySelector('.modal-dialog');
                const content = modal.querySelector('.modal-content');
                
                const modalZIndex = modal.style.zIndex || computedStyle.zIndex || 'auto';
                const dialogZIndex = dialog ? (dialog.style.zIndex || getComputedStyle(dialog).zIndex || 'auto') : 'none';
                const contentZIndex = content ? (content.style.zIndex || getComputedStyle(content).zIndex || 'auto') : 'none';
                
                const opacity = modal.style.opacity || computedStyle.opacity || '1';
                const pointerEvents = modal.style.pointerEvents || computedStyle.pointerEvents || 'auto';
                
                const isActive = modal.classList.contains('modal-active');
                const isStacked = modal.classList.contains('modal-stacked');
                const isNested = modal.classList.contains('modal-nested');
                
                // מציאת stackIndex
                const stackIndex = stack.findIndex(entry => 
                    entry.element === modal || entry.modalId === modalId
                );
                
                // חישוב z-index צפוי
                let expectedZIndex = 'auto';
                if (stackIndex >= 0 && window.ModalZIndexManager) {
                    const expected = window.ModalZIndexManager.calculateModalZIndex(stackIndex, stack.length);
                    expectedZIndex = expected.modal;
                }
                
                // בדיקת תקינות
                const issues = [];
                
                // בדיקה 1: z-index נכון
                if (stackIndex >= 0 && expectedZIndex !== 'auto' && modalZIndex !== String(expectedZIndex)) {
                    issues.push({
                        type: 'error',
                        message: `Z-index לא תקין: צפוי ${expectedZIndex}, בפועל ${modalZIndex}`,
                        expected: expectedZIndex,
                        actual: modalZIndex
                    });
                }
                
                // בדיקה 2: המודול האחרון צריך להיות modal-active
                if (stackIndex === stack.length - 1 && !isActive) {
                    issues.push({
                        type: 'error',
                        message: 'המודול האחרון צריך להיות modal-active',
                        isActive,
                        isStacked
                    });
                }
                
                // בדיקה 3: מודולים קודמים צריכים להיות modal-stacked
                if (stackIndex >= 0 && stackIndex < stack.length - 1 && !isStacked) {
                    issues.push({
                        type: 'error',
                        message: 'מודול קודם צריך להיות modal-stacked',
                        isActive,
                        isStacked
                    });
                }
                
                // בדיקה 4: opacity נכון
                if (stackIndex === stack.length - 1 && opacity !== '1') {
                    issues.push({
                        type: 'error',
                        message: `המודול האחרון צריך להיות opacity: 1, בפועל ${opacity}`,
                        expected: '1',
                        actual: opacity
                    });
                }
                
                if (stackIndex >= 0 && stackIndex < stack.length - 1 && opacity !== '0.5') {
                    issues.push({
                        type: 'error',
                        message: `מודול קודם צריך להיות opacity: 0.5, בפועל ${opacity}`,
                        expected: '0.5',
                        actual: opacity
                    });
                }
                
                // בדיקה 5: pointer-events נכון
                if (stackIndex === stack.length - 1 && pointerEvents !== 'auto') {
                    issues.push({
                        type: 'warning',
                        message: `המודול האחרון צריך להיות pointer-events: auto, בפועל ${pointerEvents}`,
                        expected: 'auto',
                        actual: pointerEvents
                    });
                }
                
                if (stackIndex >= 0 && stackIndex < stack.length - 1 && pointerEvents !== 'none') {
                    issues.push({
                        type: 'warning',
                        message: `מודול קודם צריך להיות pointer-events: none, בפועל ${pointerEvents}`,
                        expected: 'none',
                        actual: pointerEvents
                    });
                }
                
                // בדיקה 6: dialog z-index נכון
                if (stackIndex >= 0 && expectedZIndex !== 'auto' && dialogZIndex !== String(Number(expectedZIndex) + 1)) {
                    issues.push({
                        type: 'warning',
                        message: `Dialog z-index לא תקין: צפוי ${Number(expectedZIndex) + 1}, בפועל ${dialogZIndex}`,
                        expected: Number(expectedZIndex) + 1,
                        actual: dialogZIndex
                    });
                }
                
                // בדיקה 7: content z-index נכון
                if (stackIndex >= 0 && expectedZIndex !== 'auto' && contentZIndex !== String(Number(expectedZIndex) + 2)) {
                    issues.push({
                        type: 'warning',
                        message: `Content z-index לא תקין: צפוי ${Number(expectedZIndex) + 2}, בפועל ${contentZIndex}`,
                        expected: Number(expectedZIndex) + 2,
                        actual: contentZIndex
                    });
                }
                
                // הוספת issues ל-report
                issues.forEach(issue => {
                    if (issue.type === 'error') {
                        report.errors.push({
                            modalId,
                            stackIndex,
                            ...issue
                        });
                    } else {
                        report.warnings.push({
                            modalId,
                            stackIndex,
                            ...issue
                        });
                    }
                });
                
                return {
                    modalId,
                    stackIndex: stackIndex >= 0 ? stackIndex : null,
                    zIndex: {
                        modal: modalZIndex,
                        dialog: dialogZIndex,
                        content: contentZIndex,
                        expected: expectedZIndex
                    },
                    visibility: {
                        opacity,
                        pointerEvents
                    },
                    classes: {
                        isActive,
                        isStacked,
                        isNested
                    },
                    issues: issues.length,
                    hasErrors: issues.some(i => i.type === 'error'),
                    hasWarnings: issues.some(i => i.type === 'warning')
                };
            });

            // בדיקת backdrops
            const backdrops = document.querySelectorAll('.modal-backdrop');
            report.backdrops = Array.from(backdrops).map(backdrop => {
                const backdropId = backdrop.id || 'no-id';
                const computedStyle = getComputedStyle(backdrop);
                const zIndex = backdrop.style.zIndex || computedStyle.zIndex || 'auto';
                const hasShowClass = backdrop.classList.contains('show');
                const isGlobal = backdropId === 'globalModalBackdrop' || backdrop.classList.contains('global-modal-backdrop');
                
                // בדיקת תקינות
                const issues = [];
                
                // בדיקה 1: צריך להיות backdrop אחד בלבד
                if (backdrops.length > 1) {
                    issues.push({
                        type: 'error',
                        message: `נמצאו ${backdrops.length} backdrops - צריך להיות אחד בלבד`,
                        count: backdrops.length
                    });
                }
                
                // בדיקה 2: backdrop צריך להיות globalModalBackdrop
                if (!isGlobal) {
                    issues.push({
                        type: 'error',
                        message: 'Backdrop לא גלובלי - צריך להיות globalModalBackdrop',
                        backdropId
                    });
                }
                
                // בדיקה 3: z-index של backdrop צריך להיות מתחת למודול הראשון
                if (window.ModalZIndexManager && stack.length > 0) {
                    const expectedBackdropZIndex = window.ModalZIndexManager.BACKDROP_Z_INDEX;
                    if (zIndex !== String(expectedBackdropZIndex)) {
                        issues.push({
                            type: 'warning',
                            message: `Backdrop z-index לא תקין: צפוי ${expectedBackdropZIndex}, בפועל ${zIndex}`,
                            expected: expectedBackdropZIndex,
                            actual: zIndex
                        });
                    }
                }
                
                // הוספת issues ל-report
                issues.forEach(issue => {
                    if (issue.type === 'error') {
                        report.errors.push({
                            backdropId,
                            ...issue
                        });
                    } else {
                        report.warnings.push({
                            backdropId,
                            ...issue
                        });
                    }
                });
                
                return {
                    backdropId,
                    zIndex,
                    hasShowClass,
                    isGlobal,
                    issues: issues.length,
                    hasErrors: issues.some(i => i.type === 'error'),
                    hasWarnings: issues.some(i => i.type === 'warning')
                };
            });

            // בדיקת stack תקינות
            // בדיקה 1: כל מודול ב-stack צריך להיות פתוח
            stack.forEach((entry, index) => {
                const modalElement = entry.element || document.getElementById(entry.modalId);
                if (!modalElement || !modalElement.classList.contains('show')) {
                    report.errors.push({
                        type: 'error',
                        message: `מודול ב-stack לא פתוח: ${entry.modalId} (index: ${index})`,
                        modalId: entry.modalId,
                        stackIndex: index
                    });
                }
            });

            // בדיקה 2: כל מודול פתוח צריך להיות ב-stack
            openModals.forEach(modal => {
                const modalId = modal.id || 'no-id';
                const inStack = stack.some(entry => 
                    entry.element === modal || entry.modalId === modalId
                );
                if (!inStack && modalId !== 'no-id') {
                    report.warnings.push({
                        type: 'warning',
                        message: `מודול פתוח לא ב-stack: ${modalId}`,
                        modalId
                    });
                }
            });

            // בדיקה 3: המודול האחרון צריך להיות עליון
            if (stack.length > 0) {
                const lastEntry = stack[stack.length - 1];
                const lastModal = lastEntry.element || document.getElementById(lastEntry.modalId);
                if (lastModal) {
                    const lastZIndex = lastModal.style.zIndex || getComputedStyle(lastModal).zIndex || 'auto';
                    const otherModals = Array.from(openModals).filter(m => m !== lastModal);
                    
                    otherModals.forEach(otherModal => {
                        const otherZIndex = otherModal.style.zIndex || getComputedStyle(otherModal).zIndex || 'auto';
                        if (otherZIndex !== 'auto' && lastZIndex !== 'auto' && Number(otherZIndex) >= Number(lastZIndex)) {
                            report.errors.push({
                                type: 'error',
                                message: `המודול האחרון (${lastEntry.modalId}) לא עליון: z-index ${lastZIndex} vs ${otherModal.id} z-index ${otherZIndex}`,
                                lastModalId: lastEntry.modalId,
                                lastZIndex,
                                otherModalId: otherModal.id,
                                otherZIndex
                            });
                        }
                    });
                }
            }

            // שמירת state
            this.lastState = report;
            this.errors = report.errors;
            this.warnings = report.warnings;

            // הצגת התראות אם יש שגיאות
            if (report.errors.length > 0) {
                window.Logger?.error('Modal Z-Index Monitor: Errors detected', {
                    errors: report.errors,
                    page: 'modal-z-index-monitor'
                });
            }

            if (report.warnings.length > 0) {
                window.Logger?.warn('Modal Z-Index Monitor: Warnings detected', {
                    warnings: report.warnings,
                    page: 'modal-z-index-monitor'
                });
            }

            return report;
        }

        /**
         * Get report - קבלת דוח נוכחי
         */
        getReport() {
            if (!this.lastState) {
                this.check();
            }
            return this.lastState;
        }

        /**
         * Get errors - קבלת שגיאות
         */
        getErrors() {
            return this.errors;
        }

        /**
         * Get warnings - קבלת אזהרות
         */
        getWarnings() {
            return this.warnings;
        }
    }

    // יצירת instance גלובלי
    if (!window.modalZIndexMonitor) {
        window.modalZIndexMonitor = new ModalZIndexMonitor();
        window.Logger?.info('ModalZIndexMonitor instance created', {
            page: 'modal-z-index-monitor'
        });
    }

})();

