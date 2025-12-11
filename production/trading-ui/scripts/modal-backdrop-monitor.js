/**
 * Modal Backdrop Monitor - כלי ניטור backdrop למודולים
 * ========================================================
 * 
 * כלי זה בודק ומנטר את מספר ה-backdrops,
 * מזהה backdrops כפולים, ומציג התראות על בעיות.
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - ModalBackdropMonitor.init() - Init
// - ModalBackdropMonitor.start() - Start

// === Event Handlers ===
// - ModalBackdropMonitor.stop() - Stop
// - ModalBackdropMonitor.check() - Check
// - ModalBackdropMonitor.getReport() - Getreport
// - ModalBackdropMonitor.getErrors() - Geterrors
// - ModalBackdropMonitor.getWarnings() - Getwarnings

(function() {
    'use strict';

    /**
     * Modal Backdrop Monitor - מנהל ניטור backdrop
     */
    class ModalBackdropMonitor {
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
            window.modalBackdropMonitor = this;
            window.startModalBackdropMonitoring = () => this.start();
            window.stopModalBackdropMonitoring = () => this.stop();
            window.checkModalBackdrop = () => this.check();
            window.getModalBackdropReport = () => this.getReport();
            
            window.Logger?.info('ModalBackdropMonitor initialized', {
                page: 'modal-backdrop-monitor'
            });
        }

        /**
         * Start monitoring - התחלת ניטור
         */
        start() {
            if (this.isMonitoring) {
                window.Logger?.warn('ModalBackdropMonitor is already monitoring', {
                    page: 'modal-backdrop-monitor'
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

            window.Logger?.info('ModalBackdropMonitor started', {
                checkInterval: this.checkInterval,
                page: 'modal-backdrop-monitor'
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

            window.Logger?.info('ModalBackdropMonitor stopped', {
                page: 'modal-backdrop-monitor'
            });
        }

        /**
         * Check backdrop - בדיקת backdrop
         */
        check() {
            const report = {
                timestamp: new Date().toISOString(),
                backdrops: [],
                openModals: 0,
                errors: [],
                warnings: []
            };

            // בדיקת מודולים פתוחים
            const openModals = document.querySelectorAll('.modal.show');
            report.openModals = Array.from(openModals).filter(modal => {
                return modal.offsetParent !== null && 
                       getComputedStyle(modal).display !== 'none' &&
                       getComputedStyle(modal).visibility !== 'hidden';
            }).length;

            // בדיקת backdrops
            const backdrops = document.querySelectorAll('.modal-backdrop');
            report.backdrops = Array.from(backdrops).map(backdrop => {
                const backdropId = backdrop.id || 'no-id';
                const computedStyle = getComputedStyle(backdrop);
                const zIndex = backdrop.style.zIndex || computedStyle.zIndex || 'auto';
                const hasShowClass = backdrop.classList.contains('show');
                const isGlobal = backdropId === 'globalModalBackdrop' || backdrop.classList.contains('global-modal-backdrop');
                const isVisible = backdrop.offsetParent !== null;
                
                return {
                    backdropId,
                    zIndex,
                    hasShowClass,
                    isGlobal,
                    isVisible,
                    className: backdrop.className
                };
            });

            // בדיקת תקינות
            // בדיקה 1: צריך להיות backdrop אחד בלבד
            if (backdrops.length > 1) {
                report.errors.push({
                    type: 'error',
                    message: `נמצאו ${backdrops.length} backdrops - צריך להיות אחד בלבד`,
                    count: backdrops.length,
                    backdrops: report.backdrops.map(b => ({
                        id: b.backdropId,
                        isGlobal: b.isGlobal
                    }))
                });
            }

            // בדיקה 2: צריך להיות backdrop אחד אם יש מודולים פתוחים
            if (report.openModals > 0 && backdrops.length === 0) {
                report.errors.push({
                    type: 'error',
                    message: `יש ${report.openModals} מודולים פתוחים אבל אין backdrop`,
                    openModals: report.openModals
                });
            }

            // בדיקה 3: לא צריך להיות backdrop אם אין מודולים פתוחים
            if (report.openModals === 0 && backdrops.length > 0) {
                report.warnings.push({
                    type: 'warning',
                    message: `אין מודולים פתוחים אבל יש ${backdrops.length} backdrops`,
                    backdropsCount: backdrops.length
                });
            }

            // בדיקה 4: צריך להיות backdrop גלובלי
            const globalBackdrop = backdrops.find(b => {
                const backdropId = b.id || 'no-id';
                return backdropId === 'globalModalBackdrop' || b.classList.contains('global-modal-backdrop');
            });
            
            if (report.openModals > 0 && !globalBackdrop) {
                report.errors.push({
                    type: 'error',
                    message: 'אין backdrop גלובלי למרות שיש מודולים פתוחים',
                    openModals: report.openModals
                });
            }

            // בדיקה 5: לא צריך להיות backdrops של Bootstrap
            const bootstrapBackdrops = Array.from(backdrops).filter(b => {
                const backdropId = b.id || 'no-id';
                return backdropId !== 'globalModalBackdrop' && !b.classList.contains('global-modal-backdrop');
            });
            
            if (bootstrapBackdrops.length > 0) {
                report.errors.push({
                    type: 'error',
                    message: `נמצאו ${bootstrapBackdrops.length} backdrops של Bootstrap - צריך להיות רק globalModalBackdrop`,
                    bootstrapBackdrops: bootstrapBackdrops.map(b => ({
                        id: b.id || 'no-id',
                        className: b.className
                    }))
                });
            }

            // בדיקה 6: z-index של backdrop צריך להיות נכון
            if (globalBackdrop && window.ModalZIndexManager) {
                const expectedZIndex = window.ModalZIndexManager.BACKDROP_Z_INDEX;
                const actualZIndex = globalBackdrop.style.zIndex || getComputedStyle(globalBackdrop).zIndex || 'auto';
                
                if (actualZIndex !== String(expectedZIndex) && actualZIndex !== 'auto') {
                    report.warnings.push({
                        type: 'warning',
                        message: `Backdrop z-index לא תקין: צפוי ${expectedZIndex}, בפועל ${actualZIndex}`,
                        expected: expectedZIndex,
                        actual: actualZIndex
                    });
                }
            }

            // שמירת state
            this.lastState = report;
            this.errors = report.errors;
            this.warnings = report.warnings;

            // הצגת התראות אם יש שגיאות
            if (report.errors.length > 0) {
                window.Logger?.error('Modal Backdrop Monitor: Errors detected', {
                    errors: report.errors,
                    page: 'modal-backdrop-monitor'
                });
            }

            if (report.warnings.length > 0) {
                window.Logger?.warn('Modal Backdrop Monitor: Warnings detected', {
                    warnings: report.warnings,
                    page: 'modal-backdrop-monitor'
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
    if (!window.modalBackdropMonitor) {
        window.modalBackdropMonitor = new ModalBackdropMonitor();
        window.Logger?.info('ModalBackdropMonitor instance created', {
            page: 'modal-backdrop-monitor'
        });
    }

})();

