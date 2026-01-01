/**
 * All Pages Monitoring Test - TikTrack Frontend
 * =============================================
 * 
 * סקריפט בדיקה אוטומטי לכל עמודי המערכת
 * 
 * Features:
 * - סריקה אוטומטית של כל העמודים
 * - תיעוד כל הבעיות שנמצאו
 * - סיווג בעיות לפי חומרה וסוג
 * - יצירת רשימת משימות תיקון
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

if (window.Logger) {
  window.Logger.debug('🔍 Loading All Pages Monitoring Test...', { page: 'all-pages-monitoring-test' });
}

/**
 * All Pages Monitoring Test Class
 */
class AllPagesMonitoringTest {
    constructor() {
        this.results = [];
        this.currentPageIndex = 0;
        this.pages = [];
        this.isRunning = false;
    }

    /**
     * Initialize with pages list
     */
    init() {
        // Get pages from PAGE_CONFIGS
        if (window.PAGE_CONFIGS) {
            this.pages = Object.keys(window.PAGE_CONFIGS)
                .filter(pageName => {
                    // Skip test pages and backup pages
                    return !pageName.includes('test') && 
                           !pageName.includes('backup') && 
                           !pageName.includes('smart') &&
                           !pageName.includes('debug');
                })
                .sort();
        } else {
            // Fallback: common pages
            this.pages = [
                'index', 'trades', 'trade_plans', 'executions', 'cash_flows',
                'trading_accounts', 'tickers', 'alerts', 'notes', 'research',
                'preferences', 'tag-management', 'data_import'
            ];
        }

        if (window.Logger) {
            window.Logger.debug(`✅ All Pages Monitoring Test initialized with ${this.pages.length} pages`, { page: 'all-pages-monitoring-test' });
        }
    }

    /**
     * Run test on all pages
     */
    async runAllPagesTest() {
        if (this.isRunning) {
            if (typeof showNotification === 'function') {
                showNotification('בדיקה כבר רצה', 'warning');
            }
            return;
        }

        this.isRunning = true;
        this.results = [];
        this.currentPageIndex = 0;

        if (typeof showNotification === 'function') {
            showNotification(`מתחיל בדיקה על ${this.pages.length} עמודים...`, 'info');
        }

        // Initialize if needed
        if (this.pages.length === 0) {
            this.init();
        }

        // Run test on first page
        await this.testNextPage();
    }

    /**
     * Test next page
     */
    async testNextPage() {
        if (this.currentPageIndex >= this.pages.length) {
            // All pages tested
            this.isRunning = false;
            this.displayResults();
            return;
        }

        const pageName = this.pages[this.currentPageIndex];
        
        if (window.Logger) {
            window.Logger.info(`Testing page ${this.currentPageIndex + 1}/${this.pages.length}: ${pageName}`, { page: 'all-pages-monitoring-test' });
        }

        try {
            // Check if we're on the correct page
            const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
            
            if (currentPage !== pageName) {
                // Navigate to the page
                window.location.href = `/${pageName}.html`;
                // Wait for navigation
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Wait for page to load
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    setTimeout(resolve, 2000);
                } else {
                    window.addEventListener('load', () => {
                        setTimeout(resolve, 2000);
                    });
                }
            });

            // Get page config
            const pageConfig = window.PAGE_CONFIGS?.[pageName];
            if (!pageConfig) {
                this.results.push({
                    pageName,
                    status: 'error',
                    error: 'No page config found',
                    timestamp: new Date().toISOString()
                });
                this.currentPageIndex++;
                await this.testNextPage();
                return;
            }

            // Run monitoring check
            if (typeof window.runDetailedPageScan === 'undefined') {
                this.results.push({
                    pageName,
                    status: 'error',
                    error: 'Monitoring system not available',
                    timestamp: new Date().toISOString()
                });
                this.currentPageIndex++;
                await this.testNextPage();
                return;
            }

            const scanResults = await window.runDetailedPageScan(pageName, pageConfig);
            
            // Classify issues
            const issues = this.classifyIssues(scanResults);
            
            this.results.push({
                pageName,
                status: issues.criticalErrors > 0 ? 'error' : issues.warnings > 0 ? 'warning' : 'success',
                summary: scanResults.summary || {
                    totalIssues: 0,
                    criticalErrors: 0,
                    warnings: 0
                },
                issues: issues,
                scanResults: scanResults,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            if (window.Logger) {
                window.Logger.error(`Error testing page ${pageName}:`, error, { page: 'all-pages-monitoring-test' });
            }
            this.results.push({
                pageName,
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }

        this.currentPageIndex++;
        
        // Continue with next page
        await this.testNextPage();
    }

    /**
     * Classify issues by severity and type
     */
    classifyIssues(scanResults) {
        const issues = {
            criticalErrors: 0,
            warnings: 0,
            byType: {},
            bySeverity: {
                error: [],
                warning: [],
                info: []
            },
            fixTasks: []
        };

        // Count mismatches
        if (scanResults.mismatchDetails) {
            scanResults.mismatchDetails.forEach(m => {
                const type = m.type || 'unknown';
                const severity = m.severity || 'warning';
                
                issues.byType[type] = (issues.byType[type] || 0) + 1;
                issues.bySeverity[severity].push(m);
                
                if (severity === 'error') {
                    issues.criticalErrors++;
                } else {
                    issues.warnings++;
                }

                // Generate fix task
                issues.fixTasks.push({
                    page: scanResults.pageName,
                    type: type,
                    severity: severity,
                    message: m.message,
                    recommendation: this.generateFixRecommendation(m, scanResults)
                });
            });
        }

        // Count load order issues
        if (scanResults.loadOrderIssues) {
            scanResults.loadOrderIssues.forEach(issue => {
                const type = 'loading_order';
                issues.byType[type] = (issues.byType[type] || 0) + 1;
                issues.bySeverity.warning.push(issue);
                issues.warnings++;

                issues.fixTasks.push({
                    page: scanResults.pageName,
                    type: type,
                    severity: 'warning',
                    message: issue.message,
                    recommendation: `תקן את סדר הטעינה בקובץ ${scanResults.pageName}.html לפי המניפסט`
                });
            });
        }

        // Count comparison differences
        if (scanResults.comparison) {
            const comp = scanResults.comparison;
            
            if (comp.orderDifferences.length > 0) {
                issues.byType['order_difference'] = (issues.byType['order_difference'] || 0) + comp.orderDifferences.length;
                comp.orderDifferences.forEach(diff => {
                    if (diff.severity === 'error') {
                        issues.criticalErrors++;
                    } else {
                        issues.warnings++;
                    }
                    issues.bySeverity[diff.severity].push(diff);
                    
                    issues.fixTasks.push({
                        page: scanResults.pageName,
                        type: 'order_difference',
                        severity: diff.severity,
                        message: `סדר טעינה שגוי: ${diff.script}`,
                        recommendation: `תקן את סדר הטעינה של ${diff.script} בקובץ ${scanResults.pageName}.html - צריך להיות במיקום ${diff.htmlPosition} אבל נמצא במיקום ${diff.domPosition}`
                    });
                });
            }

            if (comp.missingInDOM.length > 0) {
                issues.byType['missing_in_dom'] = (issues.byType['missing_in_dom'] || 0) + comp.missingInDOM.length;
                issues.criticalErrors += comp.missingInDOM.length;
                comp.missingInDOM.forEach(m => {
                    issues.bySeverity.error.push(m);
                    issues.fixTasks.push({
                        page: scanResults.pageName,
                        type: 'missing_in_dom',
                        severity: 'error',
                        message: `סקריפט חסר ב-DOM: ${m.file}`,
                        recommendation: `בדוק למה ${m.file} לא נטען - ייתכן שזה 404 או שגיאת טעינה אחרת`
                    });
                });
            }
        }

        return issues;
    }

    /**
     * Generate fix recommendation
     */
    generateFixRecommendation(mismatch, scanResults) {
        const type = mismatch.type;
        
        if (type === 'missing_script') {
            return `הוסף את הסקריפט ${mismatch.file || 'החסר'} לקובץ ${scanResults.pageName}.html או וודא שהוא נטען דרך חבילה`;
        } else if (type === 'extra_script') {
            return `הסר את הסקריפט ${mismatch.file || 'הנוסף'} מהקובץ ${scanResults.pageName}.html או הוסף אותו למניפסט`;
        } else if (type === 'duplicate_script') {
            return `הסר את הכפילות של ${mismatch.file || 'הסקריפט'} מהקובץ ${scanResults.pageName}.html`;
        } else if (type === 'missing_global') {
            return `הוסף את החבילה המתאימה ל-PAGE_CONFIGS עבור ${scanResults.pageName} או וודא שהסקריפט נטען`;
        }

        return `תקן את הבעיה בקובץ ${scanResults.pageName}.html לפי התיעוד`;
    }

    /**
     * Display results
     */
    displayResults() {
        const totalPages = this.results.length;
        const successPages = this.results.filter(r => r.status === 'success').length;
        const errorPages = this.results.filter(r => r.status === 'error').length;
        const warningPages = this.results.filter(r => r.status === 'warning').length;

        let totalIssues = 0;
        let totalCriticalErrors = 0;
        let totalWarnings = 0;
        const allFixTasks = [];

        this.results.forEach(result => {
            if (result.issues) {
                totalIssues += result.issues.criticalErrors + result.issues.warnings;
                totalCriticalErrors += result.issues.criticalErrors;
                totalWarnings += result.issues.warnings;
                allFixTasks.push(...result.issues.fixTasks);
            }
        });

        const html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-chart-bar"></i> סיכום בדיקת כל העמודים</h6>
                <p><strong>סה"כ עמודים:</strong> ${totalPages}</p>
                <p><strong>עמודים תקינים:</strong> ${successPages}</p>
                <p><strong>עמודים עם אזהרות:</strong> ${warningPages}</p>
                <p><strong>עמודים עם שגיאות:</strong> ${errorPages}</p>
                <p><strong>סה"כ בעיות:</strong> ${totalIssues}</p>
                <p><strong>שגיאות קריטיות:</strong> ${totalCriticalErrors}</p>
                <p><strong>אזהרות:</strong> ${totalWarnings}</p>
            </div>

            <div class="alert alert-warning">
                <h6><i class="fas fa-tasks"></i> רשימת משימות תיקון (${allFixTasks.length})</h6>
                <div style="max-height: 400px; overflow-y: auto;">
                    <ol>
                        ${allFixTasks.map((task, index) => `
                            <li class="mb-2">
                                <strong>${task.page}</strong> - ${task.type}<br>
                                <small>
                                    <span class="badge ${task.severity === 'error' ? 'bg-danger' : 'bg-warning'}">${task.severity}</span>
                                    ${task.message}<br>
                                    <strong>המלצה:</strong> ${task.recommendation}
                                </small>
                            </li>
                        `).join('')}
                    </ol>
                </div>
            </div>

            <div class="alert alert-info">
                <h6><i class="fas fa-list"></i> תוצאות לפי עמוד</h6>
                <div style="max-height: 500px; overflow-y: auto;">
                    ${this.results.map(result => `
                        <div class="card mb-2">
                            <div class="card-header ${result.status === 'success' ? 'bg-success' : result.status === 'error' ? 'bg-danger' : 'bg-warning'} text-white">
                                <strong>${result.pageName}</strong>
                                <span class="badge bg-light text-dark">${result.status}</span>
                            </div>
                            <div class="card-body">
                                ${result.error ? `<p class="text-danger"><strong>שגיאה:</strong> ${result.error}</p>` : ''}
                                ${result.summary ? `
                                    <p><strong>סה"כ בעיות:</strong> ${result.summary.totalIssues}</p>
                                    <p><strong>שגיאות קריטיות:</strong> ${result.summary.criticalErrors}</p>
                                    <p><strong>אזהרות:</strong> ${result.summary.warnings}</p>
                                ` : ''}
                                ${result.issues && result.issues.byType ? `
                                    <p><strong>בעיות לפי סוג:</strong></p>
                                    <ul>
                                        ${Object.entries(result.issues.byType).map(([type, count]) => `
                                            <li>${type}: ${count}</li>
                                        `).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="text-center mt-3">
                <button class="btn btn-primary" onclick="allPagesMonitoringTest.exportResults()">
                    <i class="fas fa-download"></i> ייצא תוצאות JSON
                </button>
                <button class="btn btn-secondary" onclick="allPagesMonitoringTest.exportFixTasks()">
                    <i class="fas fa-tasks"></i> ייצא רשימת משימות תיקון
                </button>
            </div>
        `;

        if (typeof window.showDetailsModal === 'function') {
            window.showDetailsModal('🔍 תוצאות בדיקת כל העמודים', html);
        } else {
            window.Logger?.info('All Pages Monitoring Test Results:', this.results);
        }

        // Save results globally
        window.allPagesMonitoringTestResults = this.results;
    }

    /**
     * Export results as JSON
     */
    exportResults() {
        const json = JSON.stringify(this.results, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all-pages-monitoring-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification('תוצאות יוצאו בהצלחה', 'success');
        }
    }

    /**
     * Export fix tasks
     */
    exportFixTasks() {
        const allFixTasks = [];
        this.results.forEach(result => {
            if (result.issues && result.issues.fixTasks) {
                allFixTasks.push(...result.issues.fixTasks);
            }
        });

        const tasksText = allFixTasks.map((task, index) => {
            return `${index + 1}. [${task.severity.toUpperCase()}] ${task.page}: ${task.type}\n   ${task.message}\n   המלצה: ${task.recommendation}\n`;
        }).join('\n');

        const blob = new Blob([tasksText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fix-tasks-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification('רשימת משימות תיקון יוצאה בהצלחה', 'success');
        }
    }
}

// Create global instance
const allPagesMonitoringTest = new AllPagesMonitoringTest();

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        allPagesMonitoringTest.init();
    });
} else {
    allPagesMonitoringTest.init();
}

// Export globally
window.allPagesMonitoringTest = allPagesMonitoringTest;

if (window.Logger) {
  window.Logger.debug('✅ All Pages Monitoring Test loaded successfully', { page: 'all-pages-monitoring-test' });
}


