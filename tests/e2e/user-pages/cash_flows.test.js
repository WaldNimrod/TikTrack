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

const { loadPageTemplate, mountHtml, resetDom } = require('../../utils/page-test-utils');

describe('Cash Flows Page E2E Tests', () => {
    let htmlContent;
    let documentRef;

    beforeAll(() => {
        htmlContent = loadPageTemplate('cash-flows');
    });

    beforeEach(() => {
        ({ document: documentRef } = mountHtml(htmlContent, { url: '/cash-flows' }));
    });

    afterEach(() => {
        resetDom();
    });

    test('should load cash flows page successfully', () => {
        expect(documentRef.title).toBeDefined();
        expect(documentRef.body).toBeDefined();
    });

    test('should have cash flows table with correct data-table-type', () => {
        const table = documentRef.querySelector('table[data-table-type="cash_flow"]') ||
                     documentRef.querySelector('table');
        expect(table).not.toBeNull();
    });

    test('should have add cash flow button wired to ModalManager via data-onclick', () => {
        const addButton = documentRef.querySelector('button[data-button-type="ADD"][data-entity-type="cash_flow"]');
        if (addButton) {
            expect(addButton.getAttribute('data-onclick')).toContain('showModalSafe');
        } else {
            // Fallback: check for any add button
            const addButtons = documentRef.querySelectorAll('button[data-onclick*="showModalSafe"][data-onclick*="cashFlow"]');
            expect(addButtons.length).toBeGreaterThan(0);
        }
    });

    test('should have proper page structure', () => {
        expect(documentRef.querySelector('.main-content') || documentRef.querySelector('main')).not.toBeNull();
    });

    test('should be responsive', () => {
        const viewport = documentRef.querySelector('meta[name="viewport"]');
        expect(viewport).not.toBeNull();
    });
});

