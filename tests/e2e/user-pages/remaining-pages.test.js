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

const fs = require('fs');
const path = require('path');

function createPageTest(pageName, htmlFile) {
    describe(`${pageName} Page E2E Tests`, () => {
        let htmlContent;

        beforeAll(() => {
            const htmlPath = path.join(__dirname, `../../../trading-ui/${htmlFile}`);
            htmlContent = fs.readFileSync(htmlPath, 'utf8');
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

createPageTest('Tickers', 'tickers.html');
createPageTest('Trading Accounts', 'trading_accounts.html');
createPageTest('Cash Flows', 'cash_flows.html');
createPageTest('Notes', 'notes.html');
createPageTest('Research', 'research.html');
createPageTest('Database Display', 'db_display.html');
createPageTest('Database Extra Data', 'db_extradata.html');
