/**
 * Trade Plans Page E2E Tests - TikTrack
 * ======================================
 * 
 * End-to-end tests for the trade plans page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Trade Plans Page E2E Tests', () => {
    let dom;
    let document;
    let window;

    beforeAll(async () => {
        // Load the HTML file
        const htmlPath = path.join(__dirname, '../../../trading-ui/trade_plans.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Create JSDOM instance
        dom = new JSDOM(htmlContent, {
            url: 'http://localhost:8080/trade_plans.html',
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

    test('should load trade plans page successfully', () => {
        expect(document.title).toBeDefined();
        expect(document.body).toBeDefined();
    });

    test('should have trade plans table', () => {
        // Check for trade plans table
        const plansTable = document.querySelector('#plansTable') ||
                          document.querySelector('.plans-table') ||
                          document.querySelector('table[data-table-type="plans"]');
        expect(plansTable).toBeTruthy();
    });

    test('should load required scripts', () => {
        // Check for required script tags
        const scripts = document.querySelectorAll('script[src]');
        const scriptSources = Array.from(scripts).map(script => script.src);
        
        // Check for essential scripts
        expect(scriptSources.some(src => src.includes('trade_plans.js'))).toBe(true);
    });

    test('should have proper page structure', () => {
        // Check for main content area
        const mainContent = document.querySelector('main') ||
                           document.querySelector('.main-content') ||
                           document.querySelector('#main');
        expect(mainContent).toBeTruthy();
    });

    test('should be responsive', () => {
        // Check for viewport meta tag
        const viewport = document.querySelector('meta[name="viewport"]');
        expect(viewport).toBeTruthy();
    });
});
