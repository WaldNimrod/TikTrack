/**
 * Missing Functions Scanner
 * Script to scan all page files and identify missing functions
 * 
 * This script compares window.* exports to actual function definitions
 * and creates a report of missing functions for each page.
 * 
 * Usage: Open browser console and run this script or include in debug page
 */

(function() {
    'use strict';

    /**
     * Scan a JavaScript file for function exports and usages
     */
    function scanPageFile(filePath) {
        const results = {
            file: filePath,
            exports: [],
            usages: [],
            missing: [],
            errors: []
        };

        // This would need to fetch the file content
        // For now, we'll check the actual window object
        return results;
    }

    /**
     * Check if a function exists in window object
     */
    function checkFunctionExists(funcName) {
        const parts = funcName.split('.');
        let obj = window;
        for (const part of parts) {
            if (obj && typeof obj[part] !== 'undefined') {
                obj = obj[part];
            } else {
                return false;
            }
        }
        return typeof obj === 'function';
    }

    /**
     * Scan all main page scripts
     */
    function scanAllPages() {
        const pages = [
            'trade_plans',
            'trades',
            'executions',
            'alerts',
            'tickers',
            'trading_accounts',
            'notes',
            'cash_flows'
        ];

        const report = {
            timestamp: new Date().toISOString(),
            pages: {},
            summary: {
                totalMissing: 0,
                totalPages: pages.length
            }
        };

        // Common functions that should be checked
        const commonFunctions = [
            'updateTickerInfo',
            'addImportantNote',
            'addReminder',
            'updateSharesFromAmount',
            'updateAmountFromShares',
            'setupPriceCalculation',
            'setupEditPriceCalculation',
            'setupSortableHeadersLocal',
            'restorePlanningSectionState',
            'initializeTradePlanConditionsSystem'
        ];

        pages.forEach(pageName => {
            const pageReport = {
                missingFunctions: [],
                availableFunctions: [],
                exports: []
            };

            // Check for common functions
            commonFunctions.forEach(funcName => {
                const fullName = `window.${funcName}`;
                if (!checkFunctionExists(funcName)) {
                    // Check if it's page-specific (e.g., initializeTradePlanConditionsSystem only for trade_plans)
                    const isPageSpecific = (funcName.includes('TradePlan') && pageName === 'trade_plans') ||
                                         (funcName.includes('Trade') && pageName === 'trades') ||
                                         (funcName.includes('Execution') && pageName === 'executions');
                    
                    if (isPageSpecific || !funcName.includes('Trade') && !funcName.includes('Execution')) {
                        pageReport.missingFunctions.push(funcName);
                    }
                } else {
                    pageReport.availableFunctions.push(funcName);
                }
            });

            // Count exports (this would need actual file scanning)
            // For now, we'll just report what's missing

            report.pages[pageName] = pageReport;
            report.summary.totalMissing += pageReport.missingFunctions.length;
        });

        return report;
    }

    /**
     * Generate HTML report
     */
    function generateReport(report) {
        let html = '<div style="font-family: monospace; padding: 20px;">';
        html += `<h2>Missing Functions Report</h2>`;
        html += `<p><strong>Generated:</strong> ${report.timestamp}</p>`;
        html += `<p><strong>Summary:</strong> ${report.summary.totalMissing} missing functions across ${report.summary.totalPages} pages</p>`;
        html += '<hr>';

        Object.keys(report.pages).forEach(pageName => {
            const pageReport = report.pages[pageName];
            html += `<h3>${pageName}.js</h3>`;
            
            if (pageReport.missingFunctions.length > 0) {
                html += '<div style="color: red; margin-left: 20px;">';
                html += '<strong>Missing Functions:</strong><ul>';
                pageReport.missingFunctions.forEach(func => {
                    html += `<li>${func}</li>`;
                });
                html += '</ul></div>';
            } else {
                html += '<div style="color: green; margin-left: 20px;">✅ No missing functions</div>';
            }
            
            html += '<br>';
        });

        html += '</div>';
        return html;
    }

    /**
     * Main execution function
     */
    function runScan() {
        console.log('🔍 Starting missing functions scan...');
        const report = scanAllPages();
        console.log('📊 Scan complete:', report);
        
        // Display report in console
        console.table(report.pages);
        
        // Optionally create visual report
        if (typeof document !== 'undefined') {
            const reportDiv = document.createElement('div');
            reportDiv.id = 'missing-functions-report';
            const reportHTML = generateReport(report);
            reportDiv.textContent = '';
            const parser = new DOMParser();
            const doc = parser.parseFromString(reportHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
              reportDiv.appendChild(node.cloneNode(true));
            });
            reportDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: white; border: 2px solid #333; z-index: 10000; max-height: 80vh; overflow-y: auto; max-width: 600px;';
            document.body.appendChild(reportDiv);
        }
        
        return report;
    }

    // Export to window for console access
    window.scanMissingFunctions = runScan;
    window.MissingFunctionsScanner = {
        scan: runScan,
        scanPage: scanPageFile,
        checkFunction: checkFunctionExists
    };

    console.log('✅ Missing Functions Scanner loaded. Run window.scanMissingFunctions() to start scan.');
})();

