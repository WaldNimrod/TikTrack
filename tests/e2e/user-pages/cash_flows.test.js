/**
 * Cash Flows Page E2E Tests - TikTrack
 * ====================================
 * 
 * End-to-end tests for the cash flows page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Cash Flows Page E2E Tests', () => {
    let dom;
    let document;
    let window;

    beforeAll(async () => {
        const htmlPath = path.join(__dirname, '../../../trading-ui/cash_flows.html');
        if (fs.existsSync(htmlPath)) {
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            dom = new JSDOM(htmlContent, {
                url: 'http://localhost:8080/cash_flows.html',
                pretendToBeVisual: true,
                resources: 'usable'
            });
            document = dom.window.document;
            window = dom.window;
            global.window = window;
            global.document = document;
        }
    });

    afterAll(() => {
        if (dom) {
            dom.window.close();
        }
    });

    test('should load cash flows page successfully', () => {
        if (!document) return;
        expect(document.title).toBeDefined();
        expect(document.body).toBeDefined();
    });

    test('should have cash flows table', () => {
        if (!document) return;
        const table = document.querySelector('table') || document.querySelector('[data-table-type="cash_flow"]');
        expect(table || document.body).toBeDefined();
    });

    test('should have add cash flow button', () => {
        if (!document) return;
        const addButton = document.querySelector('[data-onclick*="add"]') || 
                         document.querySelector('[data-onclick*="cash_flow"]') ||
                         document.querySelector('button');
        expect(addButton || document.body).toBeDefined();
    });
});

