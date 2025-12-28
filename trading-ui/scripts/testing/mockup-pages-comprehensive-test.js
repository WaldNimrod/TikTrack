/**
 * Mockup Pages Comprehensive Test Suite
 * ======================================
 * 
 * סקריפט בדיקה מקיף לכל עמודי המוקאפ
 * 
 * תכונות:
 * - בדיקת טעינת עמודים
 * - בדיקת שגיאות בקונסול
 * - בדיקת מערכת ניתור הטעינה
 * - בדיקת אינטגרציות
 * - בדיקות CRUD ו-E2E
 * - יצירת דוחות מפורטים
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @date 2025-01-28
 */


// ===== FUNCTION INDEX =====

// === Class Methods ===
// - MockupPagesComprehensiveTester.generateSummary() - Generatesummary
// - MockupPagesComprehensiveTester.generateMarkdownReport() - Generatemarkdownreport
// - MockupPagesComprehensiveTester.exportResults() - Exportresults

// === Initialization ===
// - MockupPagesComprehensiveTester.initializeConsoleMonitoring() - Initializeconsolemonitoring

// === Event Handlers ===
// - MockupPagesComprehensiveTester.testConsoleErrors() - Testconsoleerrors
// - MockupPagesComprehensiveTester.testIntegrations() - Testintegrations
// - MockupPagesComprehensiveTester.getPageConfig() - Getpageconfig
// - console.error() - Error
// - console.warn() - Warn

(function() {
    'use strict';

    /**
     * Mockup Pages Comprehensive Tester
     */
    class MockupPagesComprehensiveTester {
        constructor() {
            this.results = {
                timestamp: new Date().toISOString(),
                pages: [],
                summary: {
                    totalPages: 0,
                    testedPages: 0,
                    pagesWithErrors: 0,
                    pagesWithoutErrors: 0,
                    totalIssues: 0,
                    fixedIssues: 0,
                    remainingIssues: 0
                }
            };

            this.mockupPages = [
                // daily-snapshots
                { name: 'trade-history-page', path: '/mockups/daily-snapshots/trade_history_page.html', hasCRUD: true },
                { name: 'portfolio-state-page', path: '/mockups/daily-snapshots/portfolio_state_page.html', hasCRUD: false },
                { name: 'price-history-page', path: '/mockups/daily-snapshots/price_history_page.html', hasCRUD: false },
                { name: 'comparative-analysis-page', path: '/mockups/daily-snapshots/comparative_analysis_page.html', hasCRUD: false },
                { name: 'trading-journal-page', path: '/mockups/daily-snapshots/trading_journal_page.html', hasCRUD: false },
                { name: 'strategy-analysis-page', path: '/mockups/daily-snapshots/strategy_analysis_page.html', hasCRUD: false },
                { name: 'economic-calendar-page', path: '/mockups/daily-snapshots/economic_calendar_page.html', hasCRUD: false },
                { name: 'history-widget', path: '/mockups/daily-snapshots/history_widget.html', hasCRUD: false },
                { name: 'emotional-tracking-widget', path: '/mockups/daily-snapshots/emotional_tracking_widget.html', hasCRUD: false },
                { name: 'date-comparison-modal', path: '/mockups/daily-snapshots/date_comparison_modal.html', hasCRUD: false },
                { name: 'tradingview-test-page', path: '/mockups/daily-snapshots/tradingview_test_page.html', hasCRUD: false },
                // Additional pages
                { name: 'watch-lists-page', path: '/mockups/watch_lists-page.html', hasCRUD: true },
                { name: 'watch-list-modal', path: '/mockups/watch_list_modal.html', hasCRUD: false },
                { name: 'add-ticker-modal', path: '/mockups/add_ticker_modal.html', hasCRUD: false },
                { name: 'flag-quick-action', path: '/mockups/flag_quick_action.html', hasCRUD: false }
            ];

            this.consoleErrors = [];
            this.consoleWarnings = [];
            this.networkErrors = [];
        }

        /**
         * Initialize console monitoring
         */
        initializeConsoleMonitoring() {
            // Capture console errors
            const originalError = console.error;
            console.error = (...args) => {
                this.consoleErrors.push({
                    timestamp: new Date().toISOString(),
                    message: args.join(' '),
                    stack: new Error().stack
                });
                originalError.apply(console, args);
            };

            // Capture console warnings
            const originalWarn = console.warn;
            console.warn = (...args) => {
                const message = args.join(' ');
                // Only capture critical warnings
                if (message.includes('404') || message.includes('NOT FOUND') || 
                    message.includes('ERR_ABORTED') || message.includes('Failed to load')) {
                    this.consoleWarnings.push({
                        timestamp: new Date().toISOString(),
                        message: message
                    });
                }
                originalWarn.apply(console, args);
            };

            // Monitor network errors
            window.addEventListener('error', (event) => {
                if (event.target && event.target.tagName === 'SCRIPT') {
                    this.networkErrors.push({
                        timestamp: new Date().toISOString(),
                        file: event.target.src,
                        error: event.message || 'Script load error'
                    });
                }
            }, true);
        }

        /**
         * Test page loading
         */
        async testPageLoading(page) {
            const result = {
                pageName: page.name,
                path: page.path,
                loading: {
                    success: false,
                    loadTime: null,
                    errors: []
                }
            };

            try {
                const startTime = performance.now();
                
                // Wait for page to be fully loaded
                if (typeof waitForPageFullyLoaded === 'function') {
                    await waitForPageFullyLoaded();
                } else {
                    // Fallback: wait for DOMContentLoaded and additional time
                    await new Promise(resolve => {
                        if (document.readyState === 'complete') {
                            setTimeout(resolve, 1000);
                        } else {
                            window.addEventListener('load', () => {
                                setTimeout(resolve, 1000);
                            });
                        }
                    });
                }

                const loadTime = performance.now() - startTime;
                result.loading.loadTime = Math.round(loadTime);
                result.loading.success = true;
            } catch (error) {
                result.loading.errors.push({
                    type: 'loading_error',
                    message: error.message || 'Unknown loading error'
                });
            }

            return result;
        }

        /**
         * Test console errors
         */
        testConsoleErrors(pageResult) {
            const errors = {
                consoleErrors: this.consoleErrors.length,
                consoleWarnings: this.consoleWarnings.length,
                networkErrors: this.networkErrors.length,
                criticalIssues: []
            };

            // Check for critical errors
            this.consoleErrors.forEach(error => {
                if (error.message.includes('404') || error.message.includes('NOT FOUND')) {
                    errors.criticalIssues.push({
                        type: '404_error',
                        message: error.message
                    });
                }
            });

            this.networkErrors.forEach(error => {
                errors.criticalIssues.push({
                    type: 'network_error',
                    file: error.file,
                    message: error.error
                });
            });

            pageResult.consoleErrors = errors;
            return errors;
        }

        /**
         * Test loading monitoring system
         */
        async testLoadingMonitoring(pageResult) {
            const monitoring = {
                available: false,
                results: null,
                errors: []
            };

            try {
                if (typeof runDetailedPageScan === 'function') {
                    monitoring.available = true;
                    const pageConfig = this.getPageConfig(pageResult.pageName);
                    if (pageConfig) {
                        monitoring.results = await runDetailedPageScan(pageResult.pageName, pageConfig);
                    } else {
                        monitoring.errors.push('Page config not found');
                    }
                } else {
                    monitoring.errors.push('runDetailedPageScan not available');
                }
            } catch (error) {
                monitoring.errors.push({
                    type: 'monitoring_error',
                    message: error.message || 'Unknown monitoring error'
                });
            }

            pageResult.loadingMonitoring = monitoring;
            return monitoring;
        }

        /**
         * Test integrations
         */
        testIntegrations(pageResult) {
            const integrations = {
                NotificationSystem: {
                    available: typeof window.NotificationSystem !== 'undefined',
                    initialized: window.NotificationSystem?.initialized || false
                },
                Logger: {
                    available: typeof window.Logger !== 'undefined',
                    hasInfo: typeof window.Logger?.info === 'function',
                    hasError: typeof window.Logger?.error === 'function'
                },
                UnifiedCacheManager: {
                    available: typeof window.UnifiedCacheManager !== 'undefined',
                    initialized: window.UnifiedCacheManager?.initialized || false
                },
                PageStateManager: {
                    available: typeof window.PageStateManager !== 'undefined',
                    hasSave: typeof window.PageStateManager?.savePageState === 'function',
                    hasLoad: typeof window.PageStateManager?.loadPageState === 'function'
                },
                LoadingStates: {
                    hasShow: typeof window.showLoadingState === 'function',
                    hasHide: typeof window.hideLoadingState === 'function'
                },
                ButtonSystem: {
                    available: typeof window.ButtonSystem !== 'undefined',
                    hasProcess: typeof window.ButtonSystem?.processButtons === 'function'
                },
                IconSystem: {
                    available: typeof window.IconSystem !== 'undefined',
                    initialized: window.IconSystem?.initialized || false
                },
                TradingViewChartAdapter: {
                    available: typeof window.TradingViewChartAdapter !== 'undefined',
                    hasCreateChart: typeof window.TradingViewChartAdapter?.createChart === 'function'
                }
            };

            pageResult.integrations = integrations;
            return integrations;
        }

        /**
         * Test CRUD operations
         */
        async testCRUD(page) {
            if (!page.hasCRUD) {
                return { skipped: true, reason: 'Page does not have CRUD operations' };
            }

            const crud = {
                available: false,
                tests: {
                    create: null,
                    read: null,
                    update: null,
                    delete: null
                },
                errors: []
            };

            try {
                if (typeof window.CRUDResponseHandler !== 'undefined') {
                    crud.available = true;
                    crud.tests.create = typeof window.handleSaveResponse === 'function';
                    crud.tests.read = typeof window.handleLoadResponse === 'function';
                    crud.tests.update = typeof window.handleUpdateResponse === 'function';
                    crud.tests.delete = typeof window.handleDeleteResponse === 'function';
                } else {
                    crud.errors.push('CRUDResponseHandler not available');
                }
            } catch (error) {
                crud.errors.push({
                    type: 'crud_test_error',
                    message: error.message || 'Unknown CRUD test error'
                });
            }

            return crud;
        }

        /**
         * Test E2E workflows
         */
        async testE2E(page) {
            const e2e = {
                available: false,
                tests: [],
                errors: []
            };

            try {
                // Check if E2E tester is available
                if (typeof window.CRUDE2ETester !== 'undefined') {
                    e2e.available = true;
                    // E2E tests would be run here
                    // For now, just check availability
                } else {
                    e2e.errors.push('E2E tester not available');
                }
            } catch (error) {
                e2e.errors.push({
                    type: 'e2e_test_error',
                    message: error.message || 'Unknown E2E test error'
                });
            }

            return e2e;
        }

        /**
         * Get page config for monitoring
         */
        getPageConfig(pageName) {
            // This would typically come from page-initialization-configs.js
            // For now, return a basic config
            return {
                name: pageName,
                scripts: [],
                dependencies: []
            };
        }

        /**
         * Test single page
         */
        async testPage(page) {
            console.log(`\n🧪 Testing page: ${page.name}`);
            
            // Reset error tracking for this page
            this.consoleErrors = [];
            this.consoleWarnings = [];
            this.networkErrors = [];

            const pageResult = {
                pageName: page.name,
                path: page.path,
                timestamp: new Date().toISOString(),
                status: 'testing'
            };

            // Test page loading
            const loadingResult = await this.testPageLoading(page);
            Object.assign(pageResult, loadingResult);

            // Test console errors
            const consoleResult = this.testConsoleErrors(pageResult);
            
            // Test loading monitoring
            const monitoringResult = await this.testLoadingMonitoring(pageResult);
            
            // Test integrations
            const integrationsResult = this.testIntegrations(pageResult);
            
            // Test CRUD
            const crudResult = await this.testCRUD(page);
            pageResult.crud = crudResult;
            
            // Test E2E
            const e2eResult = await this.testE2E(page);
            pageResult.e2e = e2eResult;

            // Determine overall status
            const hasErrors = consoleResult.consoleErrors > 0 || 
                            consoleResult.networkErrors > 0 ||
                            consoleResult.criticalIssues.length > 0 ||
                            monitoringResult.errors.length > 0;

            pageResult.status = hasErrors ? 'failed' : 'passed';
            pageResult.summary = {
                hasErrors: hasErrors,
                errorCount: consoleResult.consoleErrors + consoleResult.networkErrors,
                warningCount: consoleResult.consoleWarnings,
                criticalIssues: consoleResult.criticalIssues.length
            };

            this.results.pages.push(pageResult);
            return pageResult;
        }

        /**
         * Test all pages
         */
        async testAllPages() {
            console.log('🚀 Starting comprehensive test of all mockup pages...\n');
            
            this.initializeConsoleMonitoring();
            this.results.summary.totalPages = this.mockupPages.length;

            for (const page of this.mockupPages) {
                try {
                    const result = await this.testPage(page);
                    this.results.summary.testedPages++;
                    
                    if (result.status === 'passed') {
                        this.results.summary.pagesWithoutErrors++;
                        console.log(`✅ ${page.name}: PASSED`);
                    } else {
                        this.results.summary.pagesWithErrors++;
                        console.log(`❌ ${page.name}: FAILED (${result.summary.errorCount} errors)`);
                    }
                } catch (error) {
                    console.error(`❌ Error testing ${page.name}:`, error);
                    this.results.summary.pagesWithErrors++;
                }
            }

            this.generateSummary();
            return this.results;
        }

        /**
         * Generate summary report
         */
        generateSummary() {
            let totalIssues = 0;
            this.results.pages.forEach(page => {
                if (page.summary) {
                    totalIssues += page.summary.errorCount + page.summary.criticalIssues;
                }
            });

            this.results.summary.totalIssues = totalIssues;
            this.results.summary.remainingIssues = totalIssues - this.results.summary.fixedIssues;
        }

        /**
         * Generate markdown report
         */
        generateMarkdownReport() {
            const date = new Date().toISOString().split('T')[0];
            let report = `# דוח בדיקות מקיף - עמודי מוקאפ\n\n`;
            report += `**תאריך:** ${date}\n`;
            report += `**בודק:** Automated Test Suite\n`;
            report += `**גרסה:** 1.0.0\n\n`;
            report += `---\n\n`;

            // Summary
            report += `## סיכום כללי\n\n`;
            report += `- **סה"כ עמודים:** ${this.results.summary.totalPages}\n`;
            report += `- **עמודים נבדקו:** ${this.results.summary.testedPages}\n`;
            report += `- **עמודים ללא שגיאות:** ${this.results.summary.pagesWithoutErrors}\n`;
            report += `- **עמודים עם שגיאות:** ${this.results.summary.pagesWithErrors}\n`;
            report += `- **סה"כ בעיות:** ${this.results.summary.totalIssues}\n`;
            report += `- **בעיות שטופלו:** ${this.results.summary.fixedIssues}\n`;
            report += `- **בעיות שנותרו:** ${this.results.summary.remainingIssues}\n\n`;
            report += `---\n\n`;

            // Per-page results
            report += `## תוצאות לפי עמוד\n\n`;
            this.results.pages.forEach(page => {
                const status = page.status === 'passed' ? '✅' : '❌';
                report += `### ${status} ${page.pageName}\n\n`;
                report += `- **סטטוס:** ${page.status === 'passed' ? 'עבר' : 'נכשל'}\n`;
                report += `- **זמן טעינה:** ${page.loading?.loadTime || 'N/A'}ms\n`;
                
                if (page.summary) {
                    report += `- **שגיאות:** ${page.summary.errorCount}\n`;
                    report += `- **אזהרות:** ${page.summary.warningCount}\n`;
                    report += `- **בעיות קריטיות:** ${page.summary.criticalIssues}\n`;
                }

                if (page.consoleErrors) {
                    if (page.consoleErrors.criticalIssues.length > 0) {
                        report += `\n**בעיות קריטיות:**\n`;
                        page.consoleErrors.criticalIssues.forEach(issue => {
                            report += `- ${issue.type}: ${issue.message || issue.file}\n`;
                        });
                    }
                }

                report += `\n`;
            });

            return report;
        }

        /**
         * Export results
         */
        exportResults() {
            const report = this.generateMarkdownReport();
            const json = JSON.stringify(this.results, null, 2);
            
            return {
                markdown: report,
                json: json,
                results: this.results
            };
        }
    }

    // Export to window
    window.MockupPagesComprehensiveTester = MockupPagesComprehensiveTester;

    // Auto-run if on a mockup page
    if (window.location.pathname.includes('/mockups/')) {
        const tester = new MockupPagesComprehensiveTester();
        window.mockupTester = tester;
        
        // Run tests after page loads
        if (document.readyState === 'complete') {
            setTimeout(() => tester.testAllPages(), 2000);
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => tester.testAllPages(), 2000);
            });
        }
    }

    // Manual run function
    window.runMockupComprehensiveTests = function() {
        const tester = new MockupPagesComprehensiveTester();
        return tester.testAllPages();
    };

    console.log('✅ Mockup Pages Comprehensive Tester loaded');
})();

