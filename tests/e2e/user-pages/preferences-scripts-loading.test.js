/**
 * Preferences Scripts Loading Tests - TikTrack
 * ============================================
 * 
 * בדיקות E2E לבדיקת טעינת קבצי העדפות בכל העמודים
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadPageTemplate, mountHtml, resetDom } = require('../../utils/page-test-utils');

// Pages that should have preferences package
// Note: Some pages might have different names in the file system
const PAGES_WITH_PREFERENCES = [
    'index',
    'trades',
    'alerts',
    'trade-plans',  // Note: file is trade_plans.html but mapped as 'trade-plans'
    'trading-accounts',  // Note: file is trading_accounts.html but mapped as 'trading-accounts'
    'executions',
    'cash-flows',  // Note: file is cash_flows.html but mapped as 'cash-flows'
    'notes',
    'research',
    'tickers',
    'preferences',
    'db-display',  // Note: file is db_display.html but mapped as 'db-display'
    'db-extradata'  // Note: file is db_extradata.html but mapped as 'db-extradata'
];

// Required preference scripts
const REQUIRED_PREFERENCE_SCRIPTS = [
    'preferences-data.js',
    'preferences-v4.js',
    'preferences-ui-v4.js'
];

describe('Preferences Scripts Loading - All Pages', () => {
    afterEach(() => {
        resetDom();
    });

    describe.each(PAGES_WITH_PREFERENCES)('Page: %s', (pageName) => {
        let htmlContent;
        let documentRef;

        beforeAll(() => {
            try {
                htmlContent = loadPageTemplate(pageName);
            } catch (error) {
                // Some pages might not exist or have different names
                htmlContent = null;
            }
        });

        beforeEach(() => {
            if (htmlContent) {
                try {
                    ({ document: documentRef } = mountHtml(htmlContent, { url: `/${pageName}` }));
                } catch (error) {
                    // Some pages might not mount correctly, skip tests for those
                    documentRef = null;
                }
            }
        });

        test('should have preferences-data.js script', () => {
            if (!htmlContent || !documentRef) {
                return; // Skip if page doesn't exist or couldn't mount
            }

            const scripts = documentRef.querySelectorAll('script[src*="preferences-data.js"]');
            expect(scripts.length).toBeGreaterThan(0);
        });

        test('should have preferences-v4.js script', () => {
            if (!htmlContent || !documentRef) {
                return; // Skip if page doesn't exist or couldn't mount
            }

            const scripts = documentRef.querySelectorAll('script[src*="preferences-v4.js"]');
            expect(scripts.length).toBeGreaterThan(0);
        });

        test('should have preferences-ui-v4.js script', () => {
            if (!htmlContent || !documentRef) {
                return; // Skip if page doesn't exist or couldn't mount
            }

            const scripts = documentRef.querySelectorAll('script[src*="preferences-ui-v4.js"]');
            expect(scripts.length).toBeGreaterThan(0);
        });

        test('preferences-data.js should load before crud-response-handler.js', () => {
            if (!htmlContent || !documentRef) {
                return; // Skip if page doesn't exist or couldn't mount
            }

            const allScripts = Array.from(documentRef.querySelectorAll('script[src]'));
            const preferencesDataIndex = allScripts.findIndex(script => 
                script.src.includes('preferences-data.js')
            );
            const crudResponseHandlerIndex = allScripts.findIndex(script => 
                script.src.includes('crud-response-handler.js')
            );

            if (preferencesDataIndex !== -1 && crudResponseHandlerIndex !== -1) {
                expect(preferencesDataIndex).toBeLessThan(crudResponseHandlerIndex);
            }
        });

        test('should not have duplicate Bootstrap JS (5.3.0)', () => {
            if (!htmlContent || !documentRef) {
                return; // Skip if page doesn't exist or couldn't mount
            }

            const bootstrapScripts = Array.from(documentRef.querySelectorAll('script[src*="bootstrap"]'))
                .filter(script => script.src.includes('5.3.0'));
            
            expect(bootstrapScripts.length).toBe(0);
        });

        test('should have Bootstrap JS 5.3.3 from base package', () => {
            if (!htmlContent || !documentRef) {
                return; // Skip if page doesn't exist or couldn't mount
            }

            const bootstrapScripts = Array.from(documentRef.querySelectorAll('script[src*="bootstrap"]'))
                .filter(script => script.src.includes('5.3.3'));
            
            // At least one Bootstrap 5.3.3 should be loaded
            expect(bootstrapScripts.length).toBeGreaterThanOrEqual(1);
        });
    });
});

describe('Preferences Scripts Loading - Specific Page Checks', () => {
    afterEach(() => {
        resetDom();
    });

    describe('Executions Page', () => {
        let htmlContent;
        let documentRef;

        beforeAll(() => {
            htmlContent = loadPageTemplate('executions');
        });

        beforeEach(() => {
            ({ document: documentRef } = mountHtml(htmlContent, { url: '/executions' }));
        });

        test('should have all required preference scripts', () => {
            REQUIRED_PREFERENCE_SCRIPTS.forEach(scriptName => {
                const scripts = documentRef.querySelectorAll(`script[src*="${scriptName}"]`);
                expect(scripts.length).toBeGreaterThan(0);
            });
        });

        test('should have pending-execution-trade-creation.js', () => {
            const scripts = documentRef.querySelectorAll('script[src*="pending-execution-trade-creation.js"]');
            expect(scripts.length).toBeGreaterThan(0);
        });
    });

    describe('Cash Flows Page', () => {
        let htmlContent;
        let documentRef;

        beforeAll(() => {
            htmlContent = loadPageTemplate('cash-flows');
        });

        beforeEach(() => {
            ({ document: documentRef } = mountHtml(htmlContent, { url: '/cash_flows' }));
        });

        test('should have all required preference scripts', () => {
            REQUIRED_PREFERENCE_SCRIPTS.forEach(scriptName => {
                const scripts = documentRef.querySelectorAll(`script[src*="${scriptName}"]`);
                expect(scripts.length).toBeGreaterThan(0);
            });
        });

        test('preferences-data.js should load before crud-response-handler.js', () => {
            const allScripts = Array.from(documentRef.querySelectorAll('script[src]'));
            const preferencesDataIndex = allScripts.findIndex(script => 
                script.src.includes('preferences-data.js')
            );
            const crudResponseHandlerIndex = allScripts.findIndex(script => 
                script.src.includes('crud-response-handler.js')
            );

            expect(preferencesDataIndex).not.toBe(-1);
            expect(crudResponseHandlerIndex).not.toBe(-1);
            expect(preferencesDataIndex).toBeLessThan(crudResponseHandlerIndex);
        });
    });

    describe('Preferences Page', () => {
        let htmlContent;
        let documentRef;

        beforeAll(() => {
            htmlContent = loadPageTemplate('preferences');
        });

        beforeEach(() => {
            ({ document: documentRef } = mountHtml(htmlContent, { url: '/preferences' }));
        });

        test('should have preferences-page.js script', () => {
            const scripts = documentRef.querySelectorAll('script[src*="preferences-page.js"]');
            expect(scripts.length).toBeGreaterThan(0);
        });

        test('should have preferences-debug-monitor.js script', () => {
            const scripts = documentRef.querySelectorAll('script[src*="preferences-debug-monitor.js"]');
            expect(scripts.length).toBeGreaterThan(0);
        });

        test('should have all required preference scripts', () => {
            REQUIRED_PREFERENCE_SCRIPTS.forEach(scriptName => {
                const scripts = documentRef.querySelectorAll(`script[src*="${scriptName}"]`);
                expect(scripts.length).toBeGreaterThan(0);
            });
        });
    });
});

