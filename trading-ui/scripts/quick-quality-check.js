/**
 * Quick Quality Check - TikTrack
 * ==============================
 * 
 * Quick quality check functionality for the header
 * Provides one-click access to essential quality checks
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 26, 2025
 */

if (window.Logger) {
    window.Logger.info('⚡ Loading Quick Quality Check...', { page: 'quick-quality-check' });
}

/**
 * Quick Quality Check Manager Class
 */
class QuickQualityCheckManager {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        this.lastResults = null;
    }

    /**
     * Initialize the quick quality check manager
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Make functions globally available
            window.runQuickQualityCheck = this.runQuickQualityCheck.bind(this);
            window.showQualityCheckResults = this.showQualityCheckResults.bind(this);

            this.isInitialized = true;
            if (window.Logger) {
                window.Logger.debug('✅ Quick Quality Check Manager initialized', { page: 'quick-quality-check' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing Quick Quality Check Manager:', error, { page: 'quick-quality-check' });
            }
        }
    }

    /**
     * Run quick quality check
     * @param {Event} event - Click event
     */
    async runQuickQualityCheck(event) {
        if (event) {
            event.preventDefault();
        }

        if (this.isRunning) {
            if (typeof window.showWarningNotification === 'function') {
                window.showWarningNotification('בדיקה רצה', 'בדיקת איכות כבר רצה');
            }
            return;
        }

        this.isRunning = true;

        try {
            if (typeof window.showNotification === 'function') {
                window.showNotification('מריץ בדיקת איכות מהירה...', 'info');
            }

            // Run only the most critical checks (Error Handling + JSDoc)
            const [errorCheck, jsdocCheck] = await Promise.all([
                this.runErrorHandlingCheck(),
                this.runJSDocCheck()
            ]);

            this.lastResults = {
                errorHandling: errorCheck,
                jsdoc: jsdocCheck,
                timestamp: new Date().toISOString()
            };

            // Show results in modal
            this.showQualityCheckResults(errorCheck, jsdocCheck);

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error running quick quality check:', error, { page: 'quick-quality-check' });
            }
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'בדיקת האיכות נכשלה');
            }
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Run Error Handling check
     */
    async runErrorHandlingCheck() {
        try {
            const response = await fetch('/api/quality-check/error-handling', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error running Error Handling check:', error, { page: 'quick-quality-check' });
            }
            throw error;
        }
    }

    /**
     * Run JSDoc check
     */
    async runJSDocCheck() {
        try {
            const response = await fetch('/api/quality-check/jsdoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error running JSDoc check:', error, { page: 'quick-quality-check' });
            }
            throw error;
        }
    }

    /**
     * Show quality check results in modal
     * @param {Object} errorCheck - Error handling results
     * @param {Object} jsdocCheck - JSDoc results
     */
    showQualityCheckResults(errorCheck, jsdocCheck) {
        try {
            // Create modal HTML
            const modalHtml = this.generateResultsModal(errorCheck, jsdocCheck);
            
            // Create modal element
            const modalElement = document.createElement('div');
            modalElement.textContent = '';
            const parser = new DOMParser();
            const doc = parser.parseFromString(modalHtml, 'text/html');
            doc.body.childNodes.forEach(node => {
              modalElement.appendChild(node.cloneNode(true));
            });
            modalElement.className = 'modal fade';
            modalElement.id = 'quickQualityCheckModal';
            modalElement.setAttribute('tabindex', '-1');
            modalElement.setAttribute('aria-labelledby', 'quickQualityCheckModalLabel');
            modalElement.setAttribute('aria-hidden', 'true');

            // Add to body
            document.body.appendChild(modalElement);

            // Show modal using ModalManagerV2 first, fallback to Bootstrap
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
                window.ModalManagerV2.showModal('quickQualityCheckModal', 'view').catch(error => {
                    window.Logger?.error('Error showing quality check modal via ModalManagerV2', { error, modalId: 'quickQualityCheckModal', page: 'quick-quality-check' });
                    // Fallback to Bootstrap
                    if (bootstrap?.Modal) {
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                    }
                });
            } else if (bootstrap?.Modal) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }

            // Clean up when modal is hidden
            modalElement.addEventListener('hidden.bs.modal', () => {
                // Try to hide via ModalManagerV2 first
                if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                    window.ModalManagerV2.hideModal('quickQualityCheckModal');
                }
                document.body.removeChild(modalElement);
            });

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error showing quality check results:', error, { page: 'quick-quality-check' });
            }
        }
    }

    /**
     * Generate results modal HTML
     * @param {Object} errorCheck - Error handling results
     * @param {Object} jsdocCheck - JSDoc results
     * @returns {string} Modal HTML
     */
    generateResultsModal(errorCheck, jsdocCheck) {
        const errorData = errorCheck?.data || {};
        const jsdocData = jsdocCheck?.data || {};
        
        const errorCoverage = parseFloat(errorData.summary?.coveragePercentage || 0);
        const jsdocCoverage = parseFloat(jsdocData.summary?.coveragePercentage || 0);
        
        const errorStatus = errorCoverage >= 90 ? 'success' : errorCoverage >= 70 ? 'warning' : 'danger';
        const jsdocStatus = jsdocCoverage >= 100 ? 'success' : jsdocCoverage >= 80 ? 'warning' : 'danger';
        
        const errorIcon = errorCoverage >= 90 ? '✅' : errorCoverage >= 70 ? '⚠️' : '❌';
        const jsdocIcon = jsdocCoverage >= 100 ? '✅' : jsdocCoverage >= 80 ? '⚠️' : '❌';

        return `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="quickQualityCheckModalLabel">
                            ⚡ בדיקת איכות מהירה
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">
                                            <i class="fas fa-shield-alt text-success"></i>
                                            Error Handling Coverage
                                        </h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="alert alert-${errorStatus}">
                                            <h6>${errorIcon} ${errorData.summary?.coveragePercentage || '0'}%</h6>
                                            <div class="row">
                                                <div class="col-4">
                                                    <strong>${errorData.summary?.total || 0}</strong><br>
                                                    <small>סה"כ פונקציות</small>
                                                </div>
                                                <div class="col-4">
                                                    <strong>${errorData.summary?.withCoverage || 0}</strong><br>
                                                    <small>עם כיסוי</small>
                                                </div>
                                                <div class="col-4">
                                                    <strong>${errorData.summary?.withoutCoverage || 0}</strong><br>
                                                    <small>ללא כיסוי</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="progress mb-2">
                                            <div class="progress-bar bg-${errorStatus}" 
                                                 style="width: ${errorCoverage}%"></div>
                                        </div>
                                        <small class="text-muted">
                                            מטרה: 90% לפחות
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">
                                            <i class="fas fa-book text-primary"></i>
                                            JSDoc Coverage
                                        </h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="alert alert-${jsdocStatus}">
                                            <h6>${jsdocIcon} ${jsdocData.summary?.coveragePercentage || '0'}%</h6>
                                            <div class="row">
                                                <div class="col-4">
                                                    <strong>${jsdocData.summary?.total || 0}</strong><br>
                                                    <small>סה"כ פונקציות</small>
                                                </div>
                                                <div class="col-4">
                                                    <strong>${jsdocData.summary?.withJSDoc || 0}</strong><br>
                                                    <small>עם JSDoc</small>
                                                </div>
                                                <div class="col-4">
                                                    <strong>${jsdocData.summary?.withoutJSDoc || 0}</strong><br>
                                                    <small>ללא JSDoc</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="progress mb-2">
                                            <div class="progress-bar bg-${jsdocStatus}" 
                                                 style="width: ${jsdocCoverage}%"></div>
                                        </div>
                                        <small class="text-muted">
                                            מטרה: 100%
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <div class="alert alert-info">
                                <h6><i class="fas fa-info-circle"></i> מידע נוסף</h6>
                                <p class="mb-0">
                                    לבדיקות מפורטות יותר, עבור ל
                                    <a href="code-quality-dashboard.html" class="alert-link">דשבורד איכות הקוד</a>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            סגור
                        </button>
                        <a href="code-quality-dashboard.html" class="btn btn-primary">
                            <i class="fas fa-external-link-alt"></i>
                            דשבורד מלא
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get last results
     * @returns {Object|null} Last results
     */
    getLastResults() {
        return this.lastResults;
    }

    /**
     * Check if running
     * @returns {boolean} Is running
     */
    isCheckRunning() {
        return this.isRunning;
    }
}

// Create global instance
const quickQualityCheckManager = new QuickQualityCheckManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        quickQualityCheckManager.init();
    });
} else {
    quickQualityCheckManager.init();
}

// Export globally
window.QuickQualityCheckManager = quickQualityCheckManager;

if (window.Logger) {
    window.Logger.debug('✅ Quick Quality Check loaded successfully', { page: 'quick-quality-check' });
}
