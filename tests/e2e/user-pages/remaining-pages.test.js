/**
 * Remaining User Pages E2E Tests - TikTrack
 * ==========================================
 * 
 * End-to-end tests for remaining user pages
 * 
 * @version 1.0.0
 * @created January 2025
 * author TikTrack Development Team
 */

const { loadPageTemplate } = require('../../utils/page-test-utils');

function createPageTest(pageName, pageKey) {
    describe(`${pageName} Page E2E Tests`, () => {
        let htmlContent;

        beforeAll(() => {
            htmlContent = loadPageTemplate(pageKey);
        });

        test(`should load ${pageName} page successfully`, () => {
            expect(htmlContent.includes('page-body')).toBe(true);
        });

        test(`should have main content area for ${pageName}`, () => {
            expect(
                htmlContent.includes('main-content') ||
                htmlContent.includes('content-section')
            ).toBe(true);
        });

        test(`should load required scripts for ${pageName}`, () => {
            expect(htmlContent.includes('<script')).toBe(true);
        });

        test(`should be responsive for ${pageName}`, () => {
            expect(htmlContent.includes('meta name="viewport"')).toBe(true);
        });

        test(`should have proper language attributes for ${pageName}`, () => {
            expect(htmlContent.includes('<html lang="')).toBe(true);
        });
    });
}

const pages = [
    { name: 'Tickers', key: 'tickers' },
    { name: 'Trading Accounts', key: 'trading-accounts' },
    { name: 'Cash Flows', key: 'cash-flows' },
    { name: 'Notes', key: 'notes' },
    { name: 'Research', key: 'research' },
    { name: 'Database Display', key: 'db-display' },
    { name: 'Database Extra Data', key: 'db-extradata' }
];

pages.forEach(({ name, key }) => {
    createPageTest(name, key);
});
