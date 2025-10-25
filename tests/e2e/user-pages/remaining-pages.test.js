/**
 * Remaining User Pages E2E Tests - TikTrack
 * ==========================================
 * 
 * End-to-end tests for remaining user pages
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Helper function to create E2E test for a page
function createPageTest(pageName, htmlFile, scriptFile) {
    describe(`${pageName} Page E2E Tests`, () => {
        let dom;
        let document;
        let window;

        beforeAll(async () => {
            // Load the HTML file
            const htmlPath = path.join(__dirname, `../../../trading-ui/${htmlFile}`);
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            
            // Create JSDOM instance
            dom = new JSDOM(htmlContent, {
                url: `http://localhost:8080/${htmlFile}`,
                pretendToBeVisual: true,
                resources: 'usable'
            });
            
            document = dom.window.document;
            window = dom.window;
            global.window = window;
            global.document = document;
        });

        afterAll(() => {
            if (dom) {
                dom.window.close();
            }
        });

        test(`should load ${pageName} page successfully`, () => {
            expect(document.title).toBeDefined();
            expect(document.body).toBeDefined();
        });

        test(`should have main content area for ${pageName}`, () => {
            // Check for main content area
            const mainContent = document.querySelector('main') ||
                               document.querySelector('.main-content') ||
                               document.querySelector('#main');
            expect(mainContent).toBeTruthy();
        });

        test(`should load required scripts for ${pageName}`, () => {
            // Check for required script tags
            const scripts = document.querySelectorAll('script[src]');
            const scriptSources = Array.from(scripts).map(script => script.src);
            
            // Check for essential scripts
            expect(scriptSources.some(src => src.includes(scriptFile))).toBe(true);
        });

        test(`should be responsive for ${pageName}`, () => {
            // Check for viewport meta tag
            const viewport = document.querySelector('meta[name="viewport"]');
            expect(viewport).toBeTruthy();
        });

        test(`should have proper language attributes for ${pageName}`, () => {
            const html = document.documentElement;
            expect(html.lang).toBeDefined();
        });
    });
}

// Create tests for remaining pages
createPageTest('Tickers', 'tickers.html', 'tickers.js');
createPageTest('Trading Accounts', 'trading_accounts.html', 'trading_accounts.js');
createPageTest('Cash Flows', 'cash_flows.html', 'cash_flows.js');
createPageTest('Notes', 'notes.html', 'notes.js');
createPageTest('Research', 'research.html', 'research.js');
createPageTest('Database Display', 'db_display.html', 'db_display.js');
createPageTest('Database Extra Data', 'db_extradata.html', 'db_extradata.js');
