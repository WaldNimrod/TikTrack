/**
 * Browser Pages Validation Script
 * סקריפט בדיקה אוטומטי לכל העמודים
 * 
 * שימוש:
 * 1. פתח כל עמוד בדפדפן
 * 2. פתח את הקונסולה
 * 3. העתק והדבק את הקוד הזה
 * 4. או טען את הקובץ הזה בדף init-system-management.html
 */

(function() {
    'use strict';

    class BrowserPagesValidation {
        constructor() {
            this.results = [];
            this.currentPageIndex = 0;
            this.pages = [];
            this.isRunning = false;
        }

        /**
         * Initialize pages list from PAGE_CONFIGS
         */
        initializePagesList() {
            if (!window.PAGE_CONFIGS) {
                console.error('❌ PAGE_CONFIGS not available');
                return;
            }

            this.pages = Object.keys(window.PAGE_CONFIGS)
                .filter(pageName => {
                    // Skip test/archive/backup pages
                    return !pageName.includes('test') && 
                           !pageName.includes('archive') && 
                           !pageName.includes('backup') &&
                           !pageName.includes('smart'); // Skip smart pages
                })
                .map(pageName => ({
                    name: pageName,
                    config: window.PAGE_CONFIGS[pageName]
                }));

            console.log(`✅ Initialized ${this.pages.length} pages for validation`);
        }

        /**
         * Run validation on all pages
         */
        async runAllPagesValidation() {
            if (this.isRunning) {
                console.warn('⚠️ Validation already running');
                return;
            }

            this.isRunning = true;
            this.results = [];
            this.currentPageIndex = 0;

            console.log('🚀 Starting validation of all pages...');
            console.log(`📋 Total pages: ${this.pages.length}`);

            // Initialize pages list
            this.initializePagesList();

            if (this.pages.length === 0) {
                console.error('❌ No pages found');
                this.isRunning = false;
                return;
            }

            // Start validation
            await this.validateNextPage();
        }

        /**
         * Validate next page
         */
        async validateNextPage() {
            if (this.currentPageIndex >= this.pages.length) {
                // All pages validated
                this.isRunning = false;
                this.generateReport();
                return;
            }

            const page = this.pages[this.currentPageIndex];
            const pageName = page.name;
            const pageConfig = page.config;

            console.log(`\n📄 Validating page ${this.currentPageIndex + 1}/${this.pages.length}: ${pageName}`);

            try {
                // Check if we're on the correct page
                const currentPage = this.getCurrentPageName();
                
                if (currentPage !== pageName) {
                    console.log(`⚠️ Not on page ${pageName}. Current: ${currentPage}`);
                    console.log(`💡 Navigate to /${pageName}.html and run this script again`);
                    
                    this.results.push({
                        pageName,
                        status: 'skipped',
                        error: `Not on page ${pageName}. Current: ${currentPage}`,
                        timestamp: new Date().toISOString()
                    });

                    this.currentPageIndex++;
                    await this.validateNextPage();
                    return;
                }

                // Check if monitoring system is available
                if (typeof window.runDetailedPageScan === 'undefined') {
                    this.results.push({
                        pageName,
                        status: 'error',
                        error: 'Monitoring system not available',
                        timestamp: new Date().toISOString()
                    });

                    this.currentPageIndex++;
                    await this.validateNextPage();
                    return;
                }

                // Run detailed page scan
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

                console.log(`✅ Page ${pageName} validated:`, {
                    status: issues.criticalErrors > 0 ? 'error' : issues.warnings > 0 ? 'warning' : 'success',
                    criticalErrors: issues.criticalErrors,
                    warnings: issues.warnings
                });

            } catch (error) {
                console.error(`❌ Error validating page ${pageName}:`, error);
                this.results.push({
                    pageName,
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }

            this.currentPageIndex++;
            
            // Continue with next page (with delay to avoid overwhelming the browser)
            setTimeout(() => {
                this.validateNextPage();
            }, 1000);
        }

        /**
         * Classify issues by severity and type
         */
        classifyIssues(scanResults) {
            const issues = {
                criticalErrors: 0,
                warnings: 0,
                info: 0,
                missingScripts: [],
                missingGlobals: [],
                duplicates: [],
                loadOrderIssues: [],
                versionMismatches: []
            };

            // Critical errors
            if (scanResults.criticalErrors) {
                issues.criticalErrors += scanResults.criticalErrors;
            }

            // Mismatches
            if (scanResults.mismatches) {
                issues.warnings += scanResults.mismatches;
            }

            // Duplicates
            if (scanResults.duplicates && scanResults.duplicates.length > 0) {
                issues.duplicates = scanResults.duplicates;
                issues.criticalErrors += scanResults.duplicates.length;
            }

            // Load order issues
            if (scanResults.loadOrderIssues && scanResults.loadOrderIssues.length > 0) {
                issues.loadOrderIssues = scanResults.loadOrderIssues;
                issues.warnings += scanResults.loadOrderIssues.length;
            }

            // Version mismatches
            if (scanResults.versionMismatches && scanResults.versionMismatches.length > 0) {
                issues.versionMismatches = scanResults.versionMismatches;
                issues.warnings += scanResults.versionMismatches.length;
            }

            // Missing scripts/globals from mismatch details
            if (scanResults.mismatchDetails) {
                scanResults.mismatchDetails.forEach(detail => {
                    if (detail.type === 'missing_script') {
                        issues.missingScripts.push(detail);
                        issues.criticalErrors++;
                    } else if (detail.type === 'missing_global') {
                        issues.missingGlobals.push(detail);
                        issues.criticalErrors++;
                    } else if (detail.severity === 'warning') {
                        issues.warnings++;
                    } else if (detail.severity === 'info') {
                        issues.info++;
                    }
                });
            }

            return issues;
        }

        /**
         * Get current page name
         */
        getCurrentPageName() {
            const path = window.location.pathname;
            let currentPage = path.split('/').pop();
            
            if (!currentPage || currentPage === '' || currentPage === '/') {
                currentPage = 'index';
            } else {
                currentPage = currentPage.replace('.html', '');
            }
            
            // Handle specific pages with custom URL mapping
            if (path.includes('tag-management')) {
                currentPage = 'tag-management';
            } else if (path.includes('ai-analysis')) {
                currentPage = 'ai-analysis';
            }
            
            return currentPage;
        }

        /**
         * Generate report
         */
        generateReport() {
            console.log('\n📊 Validation Complete!');
            console.log('='.repeat(50));
            
            const totalPages = this.results.length;
            const successPages = this.results.filter(r => r.status === 'success').length;
            const errorPages = this.results.filter(r => r.status === 'error').length;
            const warningPages = this.results.filter(r => r.status === 'warning').length;
            const skippedPages = this.results.filter(r => r.status === 'skipped').length;

            console.log(`\n📈 Summary:`);
            console.log(`  Total pages: ${totalPages}`);
            console.log(`  ✅ Success: ${successPages}`);
            console.log(`  ⚠️  Warnings: ${warningPages}`);
            console.log(`  ❌ Errors: ${errorPages}`);
            console.log(`  ⏭️  Skipped: ${skippedPages}`);

            // Pages with errors
            const errorPagesList = this.results.filter(r => r.status === 'error');
            if (errorPagesList.length > 0) {
                console.log(`\n❌ Pages with errors (${errorPagesList.length}):`);
                errorPagesList.forEach(page => {
                    console.log(`  - ${page.pageName}: ${page.error || 'Critical errors found'}`);
                    if (page.issues) {
                        console.log(`    Critical Errors: ${page.issues.criticalErrors}`);
                        console.log(`    Warnings: ${page.issues.warnings}`);
                    }
                });
            }

            // Pages with warnings
            const warningPagesList = this.results.filter(r => r.status === 'warning');
            if (warningPagesList.length > 0) {
                console.log(`\n⚠️  Pages with warnings (${warningPagesList.length}):`);
                warningPagesList.forEach(page => {
                    console.log(`  - ${page.pageName}: ${page.issues?.warnings || 0} warnings`);
                });
            }

            // Save results to localStorage for later retrieval
            try {
                localStorage.setItem('browserPagesValidationResults', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    totalPages,
                    successPages,
                    warningPages,
                    errorPages,
                    skippedPages,
                    results: this.results
                }));
                console.log('\n💾 Results saved to localStorage (key: browserPagesValidationResults)');
            } catch (e) {
                console.warn('⚠️ Could not save results to localStorage:', e);
            }

            // Copy results to clipboard (if possible)
            this.copyResultsToClipboard();

            return {
                totalPages,
                successPages,
                warningPages,
                errorPages,
                skippedPages,
                results: this.results
            };
        }

        /**
         * Copy results to clipboard
         */
        copyResultsToClipboard() {
            try {
                const reportText = this.generateMarkdownReport();
                navigator.clipboard.writeText(reportText).then(() => {
                    console.log('📋 Report copied to clipboard!');
                }).catch(err => {
                    console.warn('⚠️ Could not copy to clipboard:', err);
                });
            } catch (e) {
                console.warn('⚠️ Clipboard API not available:', e);
            }
        }

        /**
         * Generate markdown report
         */
        generateMarkdownReport() {
            const timestamp = new Date().toISOString();
            const totalPages = this.results.length;
            const successPages = this.results.filter(r => r.status === 'success').length;
            const errorPages = this.results.filter(r => r.status === 'error').length;
            const warningPages = this.results.filter(r => r.status === 'warning').length;
            const skippedPages = this.results.filter(r => r.status === 'skipped').length;

            let report = `# דוח בדיקת עמודים בדפדפן
## Browser Pages Validation Report

**תאריך יצירה:** ${timestamp}
**מטרה:** בדיקת כל העמודים עם כלי הניטור runDetailedPageScan

---

## 📊 סיכום כללי

- **סה"כ עמודים:** ${totalPages}
- **✅ עמודים תקינים:** ${successPages}
- **⚠️ עמודים עם אזהרות:** ${warningPages}
- **❌ עמודים עם שגיאות:** ${errorPages}
- **⏭️ עמודים שדולגו:** ${skippedPages}

---

## 📁 תוצאות מפורטות

`;

            // Sort by status (errors first, then warnings, then success)
            const sortedResults = this.results.sort((a, b) => {
                const statusOrder = { 'error': 0, 'warning': 1, 'success': 2, 'skipped': 3 };
                return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
            });

            sortedResults.forEach(result => {
                const statusIcon = {
                    'success': '✅',
                    'warning': '⚠️',
                    'error': '❌',
                    'skipped': '⏭️'
                }[result.status] || '❓';

                report += `### ${statusIcon} ${result.pageName}\n\n`;
                report += `**סטטוס:** ${result.status}\n\n`;

                if (result.error) {
                    report += `**שגיאה:** ${result.error}\n\n`;
                }

                if (result.issues) {
                    report += `**בעיות:**\n`;
                    report += `- Critical Errors: ${result.issues.criticalErrors}\n`;
                    report += `- Warnings: ${result.issues.warnings}\n`;
                    report += `- Info: ${result.issues.info}\n\n`;

                    if (result.issues.missingScripts && result.issues.missingScripts.length > 0) {
                        report += `**קבצים חסרים (${result.issues.missingScripts.length}):**\n`;
                        result.issues.missingScripts.forEach(script => {
                            report += `- ${script.file || script.message}\n`;
                        });
                        report += `\n`;
                    }

                    if (result.issues.missingGlobals && result.issues.missingGlobals.length > 0) {
                        report += `**Globals חסרים (${result.issues.missingGlobals.length}):**\n`;
                        result.issues.missingGlobals.forEach(global => {
                            report += `- ${global.global || global.message}\n`;
                        });
                        report += `\n`;
                    }

                    if (result.issues.duplicates && result.issues.duplicates.length > 0) {
                        report += `**כפילויות (${result.issues.duplicates.length}):**\n`;
                        result.issues.duplicates.forEach(dup => {
                            report += `- ${dup}\n`;
                        });
                        report += `\n`;
                    }
                }

                if (result.summary) {
                    report += `**סיכום:**\n`;
                    report += `- Total Issues: ${result.summary.totalIssues || 0}\n`;
                    report += `- Critical Errors: ${result.summary.criticalErrors || 0}\n`;
                    report += `- Warnings: ${result.summary.warnings || 0}\n\n`;
                }

                report += `---\n\n`;
            });

            return report;
        }
    }

    // Export to global scope
    window.BrowserPagesValidation = BrowserPagesValidation;

    // Auto-initialize if on init-system-management page
    if (window.location.pathname.includes('init-system-management')) {
        const validator = new BrowserPagesValidation();
        window.browserPagesValidator = validator;
        console.log('✅ BrowserPagesValidation initialized. Use: window.browserPagesValidator.runAllPagesValidation()');
    }

})();

