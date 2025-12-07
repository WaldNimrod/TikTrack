/**
 * Modal Quantum System Tests - בדיקות אוטומטיות למערכת מודולים מקווננים
 * =========================================================================
 * 
 * בדיקות אוטומטיות לבדיקת תקינות מערכת המודולים המקווננים,
 * כולל z-index, backdrop, כפתור חזור, ו-stack.
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/NESTED_MODALS_Z_INDEX_SYSTEM.md
 * - documentation/03-DEVELOPMENT/GUIDES/NESTED_MODALS_GUIDE.md
 */

(function() {
    'use strict';

    /**
     * Modal Quantum System Tests - בדיקות אוטומטיות
     */
    class ModalQuantumSystemTests {
        constructor() {
            this.testResults = [];
            this.isRunning = false;
            
            this.init();
        }

        /**
         * Initialize - אתחול המערכת
         * 
         * @private
         */
        init() {
            // יצירת פונקציות גלובליות לבדיקות
            window.modalQuantumSystemTests = this;
            window.runModalQuantumSystemTests = () => this.runAllTests();
            window.testModalZIndex = () => this.testZIndex();
            window.testModalBackdrop = () => this.testBackdrop();
            window.testModalBackButton = () => this.testBackButton();
            window.testModalStack = () => this.testStack();
            
            window.Logger?.info('ModalQuantumSystemTests initialized', {
                page: 'modal-quantum-system-tests'
            });
        }

        /**
         * Run all tests - הרצת כל הבדיקות
         */
        async runAllTests() {
            if (this.isRunning) {
                window.Logger?.warn('Tests are already running', {
                    page: 'modal-quantum-system-tests'
                });
                return;
            }

            this.isRunning = true;
            this.testResults = [];

            window.Logger?.info('Starting Modal Quantum System Tests', {
                page: 'modal-quantum-system-tests'
            });

            try {
                // בדיקת z-index
                await this.testZIndex();
                
                // בדיקת backdrop
                await this.testBackdrop();
                
                // בדיקת כפתור חזור
                await this.testBackButton();
                
                // בדיקת stack
                await this.testStack();
                
                // בדיקת מעבר בין מודולים
                await this.testModalNavigation();
                
            } catch (error) {
                window.Logger?.error('Error running tests', {
                    error: error?.message || error,
                    page: 'modal-quantum-system-tests'
                });
            } finally {
                this.isRunning = false;
            }

            return this.getTestResults();
        }

        /**
         * Test z-index - בדיקת z-index
         */
        async testZIndex() {
            const testName = 'Z-Index Test';
            const result = {
                testName,
                passed: true,
                errors: [],
                warnings: []
            };

            try {
                // בדיקה 1: ModalZIndexManager זמין
                if (!window.ModalZIndexManager) {
                    result.passed = false;
                    result.errors.push('ModalZIndexManager לא זמין');
                    this.testResults.push(result);
                    return result;
                }

                // בדיקה 2: חישוב z-index נכון
                const testZIndex = window.ModalZIndexManager.calculateModalZIndex(0, 1);
                if (testZIndex.modal !== 1040 || testZIndex.dialog !== 1041 || testZIndex.content !== 1042) {
                    result.passed = false;
                    result.errors.push(`חישוב z-index לא נכון: ${JSON.stringify(testZIndex)}`);
                }

                // בדיקה 3: z-index של מודול שני
                const testZIndex2 = window.ModalZIndexManager.calculateModalZIndex(1, 2);
                if (testZIndex2.modal !== 1050 || testZIndex2.dialog !== 1051 || testZIndex2.content !== 1052) {
                    result.passed = false;
                    result.errors.push(`חישוב z-index של מודול שני לא נכון: ${JSON.stringify(testZIndex2)}`);
                }

                // בדיקה 4: בדיקת z-index בפועל (אם יש מודולים פתוחים)
                const openModals = document.querySelectorAll('.modal.show');
                if (openModals.length > 0) {
                    const stack = window.ModalNavigationService?.getStack?.() || [];
                    openModals.forEach((modal, index) => {
                        const modalId = modal.id || 'no-id';
                        const stackIndex = stack.findIndex(entry => 
                            entry.element === modal || entry.modalId === modalId
                        );
                        
                        if (stackIndex >= 0) {
                            const expected = window.ModalZIndexManager.calculateModalZIndex(stackIndex, stack.length);
                            const actual = modal.style.zIndex || getComputedStyle(modal).zIndex || 'auto';
                            
                            if (actual !== String(expected.modal) && actual !== 'auto') {
                                result.warnings.push({
                                    modalId,
                                    message: `Z-index לא תקין: צפוי ${expected.modal}, בפועל ${actual}`,
                                    expected: expected.modal,
                                    actual
                                });
                            }
                        }
                    });
                }

            } catch (error) {
                result.passed = false;
                result.errors.push(`שגיאה בבדיקת z-index: ${error?.message || error}`);
            }

            this.testResults.push(result);
            return result;
        }

        /**
         * Test backdrop - בדיקת backdrop
         */
        async testBackdrop() {
            const testName = 'Backdrop Test';
            const result = {
                testName,
                passed: true,
                errors: [],
                warnings: []
            };

            try {
                // בדיקה 1: מספר backdrops
                const backdrops = document.querySelectorAll('.modal-backdrop');
                const openModals = document.querySelectorAll('.modal.show');
                const actualOpenModals = Array.from(openModals).filter(modal => {
                    return modal.offsetParent !== null && 
                           getComputedStyle(modal).display !== 'none' &&
                           getComputedStyle(modal).visibility !== 'hidden';
                }).length;

                // צריך להיות backdrop אחד בלבד
                if (backdrops.length > 1) {
                    result.passed = false;
                    result.errors.push(`נמצאו ${backdrops.length} backdrops - צריך להיות אחד בלבד`);
                }

                // צריך להיות backdrop אחד אם יש מודולים פתוחים
                if (actualOpenModals > 0 && backdrops.length === 0) {
                    result.passed = false;
                    result.errors.push(`יש ${actualOpenModals} מודולים פתוחים אבל אין backdrop`);
                }

                // בדיקה 2: backdrop גלובלי
                const globalBackdrop = document.getElementById('globalModalBackdrop');
                if (actualOpenModals > 0 && !globalBackdrop) {
                    result.passed = false;
                    result.errors.push('אין backdrop גלובלי למרות שיש מודולים פתוחים');
                }

                // בדיקה 3: אין backdrops של Bootstrap
                const bootstrapBackdrops = Array.from(backdrops).filter(b => {
                    const backdropId = b.id || 'no-id';
                    return backdropId !== 'globalModalBackdrop' && !b.classList.contains('global-modal-backdrop');
                });
                
                if (bootstrapBackdrops.length > 0) {
                    result.passed = false;
                    result.errors.push(`נמצאו ${bootstrapBackdrops.length} backdrops של Bootstrap`);
                }

            } catch (error) {
                result.passed = false;
                result.errors.push(`שגיאה בבדיקת backdrop: ${error?.message || error}`);
            }

            this.testResults.push(result);
            return result;
        }

        /**
         * Test back button - בדיקת כפתור חזור
         */
        async testBackButton() {
            const testName = 'Back Button Test';
            const result = {
                testName,
                passed: true,
                errors: [],
                warnings: []
            };

            try {
                // בדיקה 1: ModalNavigationService זמין
                if (!window.ModalNavigationService) {
                    result.passed = false;
                    result.errors.push('ModalNavigationService לא זמין');
                    this.testResults.push(result);
                    return result;
                }

                // בדיקה 2: כפתור חזור במודולים מקוננים
                const stack = window.ModalNavigationService.getStack();
                if (stack.length > 1) {
                    // צריך להיות כפתור חזור במודול האחרון
                    const lastEntry = stack[stack.length - 1];
                    const lastModal = lastEntry.element || document.getElementById(lastEntry.modalId);
                    
                    if (lastModal) {
                        const header = lastModal.querySelector('.modal-header');
                        if (header) {
                            const backButton = header.querySelector('[data-button-type="BACK"]') ||
                                             header.querySelector('.modal-back-btn') ||
                                             header.querySelector('#entityDetailsBackBtn');
                            
                            if (!backButton) {
                                result.passed = false;
                                result.errors.push(`אין כפתור חזור במודול האחרון: ${lastEntry.modalId}`);
                            } else {
                                // בדיקה שהכפתור גלוי
                                const isVisible = backButton.style.display !== 'none' && 
                                                backButton.style.visibility !== 'hidden' &&
                                                getComputedStyle(backButton).display !== 'none';
                                
                                if (!isVisible) {
                                    result.passed = false;
                                    result.errors.push(`כפתור חזור לא גלוי במודול: ${lastEntry.modalId}`);
                                }
                                
                                // בדיקה שהכפתור לא disabled
                                if (backButton.disabled) {
                                    result.passed = false;
                                    result.errors.push(`כפתור חזור disabled במודול: ${lastEntry.modalId}`);
                                }
                            }
                        }
                    }
                }

            } catch (error) {
                result.passed = false;
                result.errors.push(`שגיאה בבדיקת כפתור חזור: ${error?.message || error}`);
            }

            this.testResults.push(result);
            return result;
        }

        /**
         * Test stack - בדיקת stack
         */
        async testStack() {
            const testName = 'Stack Test';
            const result = {
                testName,
                passed: true,
                errors: [],
                warnings: []
            };

            try {
                // בדיקה 1: ModalNavigationService זמין
                if (!window.ModalNavigationService) {
                    result.passed = false;
                    result.errors.push('ModalNavigationService לא זמין');
                    this.testResults.push(result);
                    return result;
                }

                // בדיקה 2: כל מודול ב-stack צריך להיות פתוח
                const stack = window.ModalNavigationService.getStack();
                stack.forEach((entry, index) => {
                    const modalElement = entry.element || document.getElementById(entry.modalId);
                    if (!modalElement) {
                        result.passed = false;
                        result.errors.push(`מודול ב-stack לא נמצא ב-DOM: ${entry.modalId} (index: ${index})`);
                    } else if (!modalElement.classList.contains('show')) {
                        result.passed = false;
                        result.errors.push(`מודול ב-stack לא פתוח: ${entry.modalId} (index: ${index})`);
                    }
                });

                // בדיקה 3: המודול האחרון צריך להיות active
                if (stack.length > 0) {
                    const lastEntry = stack[stack.length - 1];
                    const lastModal = lastEntry.element || document.getElementById(lastEntry.modalId);
                    if (lastModal) {
                        const isActive = lastModal.classList.contains('modal-active');
                        const isStacked = lastModal.classList.contains('modal-stacked');
                        
                        if (!isActive || isStacked) {
                            result.passed = false;
                            result.errors.push(`המודול האחרון (${lastEntry.modalId}) לא מסומן כ-active`);
                        }
                    }
                }

                // בדיקה 4: מודולים קודמים צריכים להיות stacked
                stack.slice(0, -1).forEach((entry, index) => {
                    const modalElement = entry.element || document.getElementById(entry.modalId);
                    if (modalElement) {
                        const isActive = modalElement.classList.contains('modal-active');
                        const isStacked = modalElement.classList.contains('modal-stacked');
                        
                        if (isActive || !isStacked) {
                            result.passed = false;
                            result.errors.push(`מודול קודם (${entry.modalId}) לא מסומן כ-stacked`);
                        }
                    }
                });

            } catch (error) {
                result.passed = false;
                result.errors.push(`שגיאה בבדיקת stack: ${error?.message || error}`);
            }

            this.testResults.push(result);
            return result;
        }

        /**
         * Test modal navigation - בדיקת מעבר בין מודולים
         */
        async testModalNavigation() {
            const testName = 'Modal Navigation Test';
            const result = {
                testName,
                passed: true,
                errors: [],
                warnings: []
            };

            try {
                // בדיקה 1: ModalNavigationService זמין
                if (!window.ModalNavigationService) {
                    result.passed = false;
                    result.errors.push('ModalNavigationService לא זמין');
                    this.testResults.push(result);
                    return result;
                }

                // בדיקה 2: canGoBack עובד
                const stack = window.ModalNavigationService.getStack();
                const canGoBack = window.ModalNavigationService.canGoBack();
                
                if (stack.length > 1 && !canGoBack) {
                    result.passed = false;
                    result.errors.push('canGoBack מחזיר false למרות שיש יותר ממודול אחד ב-stack');
                }
                
                if (stack.length <= 1 && canGoBack) {
                    result.passed = false;
                    result.errors.push('canGoBack מחזיר true למרות שיש מודול אחד בלבד ב-stack');
                }

            } catch (error) {
                result.passed = false;
                result.errors.push(`שגיאה בבדיקת מעבר בין מודולים: ${error?.message || error}`);
            }

            this.testResults.push(result);
            return result;
        }

        /**
         * Get test results - קבלת תוצאות הבדיקות
         */
        getTestResults() {
            return {
                timestamp: new Date().toISOString(),
                totalTests: this.testResults.length,
                passedTests: this.testResults.filter(r => r.passed).length,
                failedTests: this.testResults.filter(r => !r.passed).length,
                results: this.testResults
            };
        }
    }

    // יצירת instance גלובלי
    if (!window.modalQuantumSystemTests) {
        window.modalQuantumSystemTests = new ModalQuantumSystemTests();
        window.Logger?.info('ModalQuantumSystemTests instance created', {
            page: 'modal-quantum-system-tests'
        });
    }

})();

