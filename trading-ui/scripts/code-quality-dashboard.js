/**
 * Code Quality Dashboard - TikTrack
 * ==================================
 * 
 * Dashboard for monitoring and managing code quality across all user pages
 * 
 * Features:
 * - Error Handling Coverage monitoring
 * - JSDoc Coverage monitoring  
 * - Naming Conventions validation
 * - Function Index management
 * - Real-time quality metrics
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 26, 2025
 */

if (window.Logger) {
  window.Logger.info('📊 Loading Code Quality Dashboard...', { page: 'code-quality-dashboard' });
}

/**
 * Code Quality Dashboard Class
 */
class CodeQualityDashboard {
    constructor() {
        this.isInitialized = false;
        this.lastCheckResults = {
            errorHandling: null,
            jsdoc: null,
            naming: null,
            functionIndex: null
        };
    }

    /**
     * Initialize the dashboard
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Initialize UI elements
            this.initializeUI();
            
            // Load initial data
            this.loadInitialData();
            
            this.isInitialized = true;
            if (window.Logger) {
                window.Logger.info('✅ Code Quality Dashboard initialized', { page: 'code-quality-dashboard' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing Code Quality Dashboard:', error, { page: 'code-quality-dashboard' });
            }
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'נכשל באתחול דשבורד איכות הקוד');
            }
        }
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Set up event listeners for buttons
        this.setupEventListeners();
        
        // Initialize empty states
        this.updateSummaryStats();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.refreshDashboard();
        }, 300000);
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Run all checks
            await this.runAllChecks();
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error loading initial data:', error, { page: 'code-quality-dashboard' });
            }
            this.showErrorState('נכשל בטעינת נתונים ראשוניים');
        }
    }

    /**
     * Run all quality checks
     */
    async runAllChecks() {
        try {
            if (typeof window.showNotification === 'function') {
                window.showNotification('מריץ בדיקות איכות...', 'info');
            }

            // Run all checks in parallel
            const [errorHandling, jsdoc, naming, functionIndex] = await Promise.all([
                this.runErrorHandlingCheck(),
                this.runJSDocCheck(),
                this.runNamingCheck(),
                this.runFunctionIndexCheck()
            ]);

            // Update UI with results
            this.updateAllResults(errorHandling, jsdoc, naming, functionIndex);
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('בדיקות איכות הושלמו');
            }

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error running all checks:', error, { page: 'code-quality-dashboard' });
            }
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'נכשל בהרצת בדיקות איכות');
            }
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

            const data = await response.json();
            this.lastCheckResults.errorHandling = data;
            return data;

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error running Error Handling check:', error, { page: 'code-quality-dashboard' });
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

            const data = await response.json();
            this.lastCheckResults.jsdoc = data;
            return data;

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error running JSDoc check:', error, { page: 'code-quality-dashboard' });
            }
            throw error;
        }
    }

    /**
     * Run Naming Conventions check
     */
    async runNamingCheck() {
        try {
            const response = await fetch('/api/quality-check/naming', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.lastCheckResults.naming = data;
            return data;

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error running Naming check:', error, { page: 'code-quality-dashboard' });
            }
            throw error;
        }
    }

    /**
     * Run Function Index check
     */
    async runFunctionIndexCheck() {
        try {
            const response = await fetch('/api/quality-check/function-index', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.lastCheckResults.functionIndex = data;
            return data;

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error running Function Index check:', error, { page: 'code-quality-dashboard' });
            }
            throw error;
        }
    }

    /**
     * Generate Function Index for all files
     */
    async generateFunctionIndex() {
        try {
            if (typeof window.showNotification === 'function') {
                window.showNotification('מייצר Function Index...', 'info');
            }

            const response = await fetch('/api/quality-check/generate-function-index', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('Function Index נוצר בהצלחה');
            }

            // Refresh Function Index check
            await this.runFunctionIndexCheck();

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error generating Function Index:', error, { page: 'code-quality-dashboard' });
            }
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'נכשל ביצירת Function Index');
            }
        }
    }

    /**
     * Update all results in UI
     */
    updateAllResults(errorHandling, jsdoc, naming, functionIndex) {
        this.displayErrorHandlingResults(errorHandling);
        this.displayJSDocResults(jsdoc);
        this.displayNamingResults(naming);
        this.displayFunctionIndexResults(functionIndex);
        this.updateSummaryStats();
        this.updateLastUpdateTime();
    }

    /**
     * Display Error Handling results
     */
    displayErrorHandlingResults(data) {
        const resultsElement = document.getElementById('errorHandlingResults');
        if (!resultsElement) return;

        if (!data || !data.data) {
            resultsElement.innerHTML = '<div class="text-center text-muted">אין נתונים זמינים</div>';
            return;
        }

        const { summary, pages } = data.data;
        const coveragePercentage = parseFloat(summary.coveragePercentage);
        const statusClass = coveragePercentage >= 90 ? 'success' : coveragePercentage >= 70 ? 'warning' : 'danger';

        let html = `
            <div class="alert alert-${statusClass}">
                <h6>כיסוי Error Handling: ${summary.coveragePercentage}%</h6>
                <div class="row">
                    <div class="col-4">
                        <strong>${summary.total}</strong><br>
                        <small>סה"כ פונקציות</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.withCoverage}</strong><br>
                        <small>עם כיסוי</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.withoutCoverage}</strong><br>
                        <small>ללא כיסוי</small>
                    </div>
                </div>
            </div>
        `;

        // Add pages breakdown
        if (pages && pages.length > 0) {
            html += '<div class="mt-3"><h6>פירוט לפי עמודים:</h6><div class="table-responsive"><table class="table table-sm">';
            html += '<thead><tr><th>עמוד</th><th>כיסוי</th><th>פונקציות</th><th>סטטוס</th></tr></thead><tbody>';
            
            pages.forEach(page => {
                const pageStatusClass = parseFloat(page.coveragePercentage) >= 90 ? 'success' : parseFloat(page.coveragePercentage) >= 70 ? 'warning' : 'danger';
                const statusIcon = parseFloat(page.coveragePercentage) >= 90 ? '✅' : parseFloat(page.coveragePercentage) >= 70 ? '⚠️' : '❌';
                
                html += `
                    <tr>
                        <td>${page.file}</td>
                        <td>${page.coveragePercentage}%</td>
                        <td>${page.totalFunctions}</td>
                        <td><span class="badge bg-${pageStatusClass}">${statusIcon}</span></td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div></div>';
        }

        resultsElement.innerHTML = html;

        // Update stats
        const withCoverageElement = document.getElementById('errorHandlingWithCoverage');
        const withoutCoverageElement = document.getElementById('errorHandlingWithoutCoverage');
        const statusElement = document.getElementById('errorHandlingStatus');
        
        if (withCoverageElement) withCoverageElement.textContent = summary.withCoverage;
        if (withoutCoverageElement) withoutCoverageElement.textContent = summary.withoutCoverage;
        if (statusElement) statusElement.textContent = `${summary.coveragePercentage}%`;
    }

    /**
     * Display JSDoc results
     */
    displayJSDocResults(data) {
        const resultsElement = document.getElementById('jsdocResults');
        if (!resultsElement) return;

        if (!data || !data.data) {
            resultsElement.innerHTML = '<div class="text-center text-muted">אין נתונים זמינים</div>';
            return;
        }

        const { summary, pages } = data.data;
        const coveragePercentage = parseFloat(summary.coveragePercentage);
        const statusClass = coveragePercentage >= 100 ? 'success' : coveragePercentage >= 80 ? 'warning' : 'danger';

        let html = `
            <div class="alert alert-${statusClass}">
                <h6>כיסוי JSDoc: ${summary.coveragePercentage}%</h6>
                <div class="row">
                    <div class="col-4">
                        <strong>${summary.total}</strong><br>
                        <small>סה"כ פונקציות</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.withJSDoc}</strong><br>
                        <small>עם JSDoc</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.withoutJSDoc}</strong><br>
                        <small>ללא JSDoc</small>
                    </div>
                </div>
            </div>
        `;

        // Add pages breakdown
        if (pages && pages.length > 0) {
            html += '<div class="mt-3"><h6>פירוט לפי עמודים:</h6><div class="table-responsive"><table class="table table-sm">';
            html += '<thead><tr><th>עמוד</th><th>כיסוי</th><th>פונקציות</th><th>סטטוס</th></tr></thead><tbody>';
            
            pages.forEach(page => {
                const pageStatusClass = parseFloat(page.coveragePercentage) >= 100 ? 'success' : parseFloat(page.coveragePercentage) >= 80 ? 'warning' : 'danger';
                const statusIcon = parseFloat(page.coveragePercentage) >= 100 ? '✅' : parseFloat(page.coveragePercentage) >= 80 ? '⚠️' : '❌';
                
                html += `
                    <tr>
                        <td>${page.file}</td>
                        <td>${page.coveragePercentage}%</td>
                        <td>${page.totalFunctions}</td>
                        <td><span class="badge bg-${pageStatusClass}">${statusIcon}</span></td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div></div>';
        }

        resultsElement.innerHTML = html;

        // Update stats
        const withDocsElement = document.getElementById('jsdocWithDocs');
        const withoutDocsElement = document.getElementById('jsdocWithoutDocs');
        const statusElement = document.getElementById('jsdocStatus');
        
        if (withDocsElement) withDocsElement.textContent = summary.withJSDoc;
        if (withoutDocsElement) withoutDocsElement.textContent = summary.withoutJSDoc;
        if (statusElement) statusElement.textContent = `${summary.coveragePercentage}%`;
    }

    /**
     * Display Naming Conventions results
     */
    displayNamingResults(data) {
        const resultsElement = document.getElementById('namingResults');
        if (!resultsElement) return;

        if (!data || !data.data) {
            resultsElement.innerHTML = '<div class="text-center text-muted">אין נתונים זמינים</div>';
            return;
        }

        const { summary, pages } = data.data;
        const compliancePercentage = summary.total > 0 ? ((summary.compliant / summary.total) * 100).toFixed(2) : 0;
        const statusClass = compliancePercentage >= 95 ? 'success' : compliancePercentage >= 80 ? 'warning' : 'danger';

        let html = `
            <div class="alert alert-${statusClass}">
                <h6>עמידה בקונבנציות: ${compliancePercentage}%</h6>
                <div class="row">
                    <div class="col-4">
                        <strong>${summary.total}</strong><br>
                        <small>סה"כ פריטים</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.compliant}</strong><br>
                        <small>עומדים בקונבנציות</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.violations}</strong><br>
                        <small>הפרות</small>
                    </div>
                </div>
            </div>
        `;

        // Add pages breakdown
        if (pages && pages.length > 0) {
            html += '<div class="mt-3"><h6>פירוט לפי עמודים:</h6><div class="table-responsive"><table class="table table-sm">';
            html += '<thead><tr><th>עמוד</th><th>הפרות</th><th>סה"כ</th><th>סטטוס</th></tr></thead><tbody>';
            
            pages.forEach(page => {
                const pageStatusClass = page.violations.length === 0 ? 'success' : page.violations.length <= 5 ? 'warning' : 'danger';
                const statusIcon = page.violations.length === 0 ? '✅' : page.violations.length <= 5 ? '⚠️' : '❌';
                
                html += `
                    <tr>
                        <td>${page.file}</td>
                        <td>${page.violations.length}</td>
                        <td>${page.total}</td>
                        <td><span class="badge bg-${pageStatusClass}">${statusIcon}</span></td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div></div>';
        }

        resultsElement.innerHTML = html;

        // Update stats
        const compliantElement = document.getElementById('namingCompliant');
        const violationsElement = document.getElementById('namingViolations');
        const statusElement = document.getElementById('namingStatus');
        
        if (compliantElement) compliantElement.textContent = summary.compliant;
        if (violationsElement) violationsElement.textContent = summary.violations;
        if (statusElement) statusElement.textContent = `${compliancePercentage}%`;
    }

    /**
     * Display Function Index results
     */
    displayFunctionIndexResults(data) {
        const resultsElement = document.getElementById('functionIndexResults');
        if (!resultsElement) return;

        if (!data || !data.data) {
            resultsElement.innerHTML = '<div class="text-center text-muted">אין נתונים זמינים</div>';
            return;
        }

        const { summary, pages } = data.data;
        const statusClass = summary.filesWithIndex === summary.total ? 'success' : summary.filesWithIndex > 0 ? 'warning' : 'danger';

        let html = `
            <div class="alert alert-${statusClass}">
                <h6>Function Index Status</h6>
                <div class="row">
                    <div class="col-4">
                        <strong>${summary.total}</strong><br>
                        <small>סה"כ קבצים</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.filesWithIndex}</strong><br>
                        <small>עם אינדקס</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.filesWithoutIndex}</strong><br>
                        <small>ללא אינדקס</small>
                    </div>
                </div>
            </div>
        `;

        // Add pages breakdown
        if (pages && pages.length > 0) {
            html += '<div class="mt-3"><h6>פירוט לפי עמודים:</h6><div class="table-responsive"><table class="table table-sm">';
            html += '<thead><tr><th>עמוד</th><th>אינדקס</th><th>פונקציות</th><th>סטטוס</th></tr></thead><tbody>';
            
            pages.forEach(page => {
                const pageStatusClass = page.hasIndex ? 'success' : 'danger';
                const statusIcon = page.hasIndex ? '✅' : '❌';
                
                html += `
                    <tr>
                        <td>${page.file}</td>
                        <td>${page.hasIndex ? 'יש' : 'אין'}</td>
                        <td>${page.totalFunctions}</td>
                        <td><span class="badge bg-${pageStatusClass}">${statusIcon}</span></td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div></div>';
        }

        resultsElement.innerHTML = html;

        // Update stats
        const withIndexElement = document.getElementById('filesWithIndex');
        const withoutIndexElement = document.getElementById('filesWithoutIndex');
        const statusElement = document.getElementById('functionIndexStatus');
        
        if (withIndexElement) withIndexElement.textContent = summary.filesWithIndex;
        if (withoutIndexElement) withoutIndexElement.textContent = summary.filesWithoutIndex;
        if (statusElement) statusElement.textContent = `${summary.filesWithIndex}/${summary.total}`;
    }

    /**
     * Update summary statistics
     */
    updateSummaryStats() {
        const totalFunctionsElement = document.getElementById('totalFunctions');
        const errorHandlingCoverageElement = document.getElementById('errorHandlingCoverage');
        const jsdocCoverageElement = document.getElementById('jsdocCoverage');
        const namingComplianceElement = document.getElementById('namingCompliance');

        if (this.lastCheckResults.errorHandling && this.lastCheckResults.errorHandling.data) {
            if (totalFunctionsElement) totalFunctionsElement.textContent = this.lastCheckResults.errorHandling.data.summary.total;
            if (errorHandlingCoverageElement) errorHandlingCoverageElement.textContent = this.lastCheckResults.errorHandling.data.summary.coveragePercentage + '%';
        }

        if (this.lastCheckResults.jsdoc && this.lastCheckResults.jsdoc.data) {
            if (jsdocCoverageElement) jsdocCoverageElement.textContent = this.lastCheckResults.jsdoc.data.summary.coveragePercentage + '%';
        }

        if (this.lastCheckResults.naming && this.lastCheckResults.naming.data) {
            const summary = this.lastCheckResults.naming.data.summary;
            const compliancePercentage = summary.total > 0 ? ((summary.compliant / summary.total) * 100).toFixed(2) : 0;
            if (namingComplianceElement) namingComplianceElement.textContent = compliancePercentage + '%';
        }
    }

    /**
     * Update last update time
     */
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('lastUpdateTime');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = new Date().toLocaleTimeString('he-IL');
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const sections = ['errorHandlingResults', 'jsdocResults', 'namingResults', 'functionIndexResults'];
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.innerHTML = '<div class="text-center text-muted"><i class="fas fa-spinner fa-spin"></i> טוען...</div>';
            }
        });
    }

    /**
     * Show error state
     */
    showErrorState(message) {
        const sections = ['errorHandlingResults', 'jsdocResults', 'namingResults', 'functionIndexResults'];
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.innerHTML = `<div class="text-center text-danger">❌ ${message}</div>`;
            }
        });
    }

    /**
     * Refresh dashboard
     */
    async refreshDashboard() {
        try {
            await this.runAllChecks();
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error refreshing dashboard:', error, { page: 'code-quality-dashboard' });
            }
        }
    }
}

// Global functions for button onclick handlers
window.runAllChecks = async function() {
    if (window.codeQualityDashboard) {
        await window.codeQualityDashboard.runAllChecks();
    }
};

window.runErrorHandlingCheck = async function() {
    if (window.codeQualityDashboard) {
        await window.codeQualityDashboard.runErrorHandlingCheck();
    }
};

window.runJSDocCheck = async function() {
    if (window.codeQualityDashboard) {
        await window.codeQualityDashboard.runJSDocCheck();
    }
};

window.runNamingCheck = async function() {
    if (window.codeQualityDashboard) {
        await window.codeQualityDashboard.runNamingCheck();
    }
};

window.runFunctionIndexCheck = async function() {
    if (window.codeQualityDashboard) {
        await window.codeQualityDashboard.runFunctionIndexCheck();
    }
};

window.generateFunctionIndex = async function() {
    if (window.codeQualityDashboard) {
        await window.codeQualityDashboard.generateFunctionIndex();
    }
};

window.refreshDashboard = async function() {
    if (window.codeQualityDashboard) {
        await window.codeQualityDashboard.refreshDashboard();
    }
};

// Create global instance
const codeQualityDashboard = new CodeQualityDashboard();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        codeQualityDashboard.init();
    });
} else {
    codeQualityDashboard.init();
}

// Export globally
window.codeQualityDashboard = codeQualityDashboard;

if (window.Logger) {
    window.Logger.info('✅ Code Quality Dashboard loaded successfully', { page: 'code-quality-dashboard' });
}
