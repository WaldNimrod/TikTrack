/**
 * Modal Stack Monitor - כלי ניטור stack למודולים
 * =================================================
 * 
 * כלי זה בודק ומנטר את ה-stack של ModalNavigationService,
 * מזהה מודולים לא רשומים, ומציג התראות על בעיות.
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

(function() {
    'use strict';

    /**
     * Modal Stack Monitor - מנהל ניטור stack
     */
    class ModalStackMonitor {
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
            window.modalStackMonitor = this;
            window.startModalStackMonitoring = () => this.start();
            window.stopModalStackMonitoring = () => this.stop();
            window.checkModalStack = () => this.check();
            window.getModalStackReport = () => this.getReport();
            
            window.Logger?.info('ModalStackMonitor initialized', {
                page: 'modal-stack-monitor'
            });
        }

        /**
         * Start monitoring - התחלת ניטור
         */
        start() {
            if (this.isMonitoring) {
                window.Logger?.warn('ModalStackMonitor is already monitoring', {
                    page: 'modal-stack-monitor'
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

            window.Logger?.info('ModalStackMonitor started', {
                checkInterval: this.checkInterval,
                page: 'modal-stack-monitor'
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

            window.Logger?.info('ModalStackMonitor stopped', {
                page: 'modal-stack-monitor'
            });
        }

        /**
         * Check stack - בדיקת stack
         */
        check() {
            const report = {
                timestamp: new Date().toISOString(),
                stack: [],
                openModals: [],
                errors: [],
                warnings: []
            };

            // בדיקת stack
            const stack = window.ModalNavigationService?.getStack?.() || [];
            report.stack = stack.map((entry, index) => {
                const modalElement = entry.element || document.getElementById(entry.modalId);
                const isOpen = modalElement && modalElement.classList.contains('show');
                const isInDOM = modalElement && document.body.contains(modalElement);
                
                return {
                    index,
                    modalId: entry.modalId,
                    instanceId: entry.instanceId,
                    modalType: entry.modalType,
                    entityType: entry.entityType,
                    entityId: entry.entityId,
                    hasElement: !!modalElement,
                    isOpen,
                    isInDOM
                };
            });

            // בדיקת מודולים פתוחים
            const openModals = document.querySelectorAll('.modal.show');
            report.openModals = Array.from(openModals).map(modal => {
                const modalId = modal.id || 'no-id';
                const inStack = stack.some(entry => 
                    entry.element === modal || entry.modalId === modalId
                );
                
                return {
                    modalId,
                    inStack,
                    isVisible: modal.offsetParent !== null
                };
            });

            // בדיקת תקינות
            // בדיקה 1: כל מודול ב-stack צריך להיות פתוח
            stack.forEach((entry, index) => {
                const modalElement = entry.element || document.getElementById(entry.modalId);
                if (!modalElement) {
                    report.errors.push({
                        type: 'error',
                        message: `מודול ב-stack לא נמצא ב-DOM: ${entry.modalId} (index: ${index})`,
                        modalId: entry.modalId,
                        stackIndex: index
                    });
                } else if (!modalElement.classList.contains('show')) {
                    report.errors.push({
                        type: 'error',
                        message: `מודול ב-stack לא פתוח: ${entry.modalId} (index: ${index})`,
                        modalId: entry.modalId,
                        stackIndex: index
                    });
                }
            });

            // בדיקה 2: כל מודול פתוח צריך להיות ב-stack (אם יש לו ID)
            openModals.forEach(modal => {
                const modalId = modal.id || 'no-id';
                if (modalId === 'no-id') {
                    return; // דילוג על מודולים ללא ID
                }
                
                const inStack = stack.some(entry => 
                    entry.element === modal || entry.modalId === modalId
                );
                
                if (!inStack) {
                    report.warnings.push({
                        type: 'warning',
                        message: `מודול פתוח לא ב-stack: ${modalId}`,
                        modalId
                    });
                }
            });

            // בדיקה 3: אין כפילויות ב-stack
            const modalIds = stack.map(entry => entry.modalId);
            const duplicates = modalIds.filter((id, index) => modalIds.indexOf(id) !== index);
            if (duplicates.length > 0) {
                report.errors.push({
                    type: 'error',
                    message: `נמצאו כפילויות ב-stack: ${duplicates.join(', ')}`,
                    duplicates
                });
            }

            // בדיקה 4: המודול האחרון צריך להיות הפעיל
            if (stack.length > 0) {
                const lastEntry = stack[stack.length - 1];
                const lastModal = lastEntry.element || document.getElementById(lastEntry.modalId);
                if (lastModal) {
                    const isActive = lastModal.classList.contains('modal-active');
                    const isStacked = lastModal.classList.contains('modal-stacked');
                    
                    if (!isActive || isStacked) {
                        report.errors.push({
                            type: 'error',
                            message: `המודול האחרון (${lastEntry.modalId}) לא מסומן כ-active`,
                            modalId: lastEntry.modalId,
                            isActive,
                            isStacked
                        });
                    }
                }
            }

            // בדיקה 5: מודולים קודמים צריכים להיות stacked
            stack.slice(0, -1).forEach((entry, index) => {
                const modalElement = entry.element || document.getElementById(entry.modalId);
                if (modalElement) {
                    const isActive = modalElement.classList.contains('modal-active');
                    const isStacked = modalElement.classList.contains('modal-stacked');
                    
                    if (isActive || !isStacked) {
                        report.errors.push({
                            type: 'error',
                            message: `מודול קודם (${entry.modalId}) לא מסומן כ-stacked`,
                            modalId: entry.modalId,
                            stackIndex: index,
                            isActive,
                            isStacked
                        });
                    }
                }
            });

            // שמירת state
            this.lastState = report;
            this.errors = report.errors;
            this.warnings = report.warnings;

            // הצגת התראות אם יש שגיאות
            if (report.errors.length > 0) {
                window.Logger?.error('Modal Stack Monitor: Errors detected', {
                    errors: report.errors,
                    page: 'modal-stack-monitor'
                });
            }

            if (report.warnings.length > 0) {
                window.Logger?.warn('Modal Stack Monitor: Warnings detected', {
                    warnings: report.warnings,
                    page: 'modal-stack-monitor'
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
    if (!window.modalStackMonitor) {
        window.modalStackMonitor = new ModalStackMonitor();
        window.Logger?.info('ModalStackMonitor instance created', {
            page: 'modal-stack-monitor'
        });
    }

})();

