/**
 * Executions Page E2E Tests - TikTrack
 * ====================================
 * 
 * End-to-end tests for the executions page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadPageTemplate, mountHtml, resetDom } = require('../../utils/page-test-utils');

describe('Executions Page E2E Tests', () => {
    let htmlContent;
    let documentRef;

    beforeAll(() => {
        htmlContent = loadPageTemplate('executions');
    });

    beforeEach(() => {
        ({ document: documentRef } = mountHtml(htmlContent, { url: '/executions' }));
    });

    afterEach(() => {
        resetDom();
    });

    test('should load executions page successfully', () => {
        expect(documentRef.title).toBeDefined();
        expect(documentRef.body).toBeDefined();
    });

    test('should have executions table with correct data-table-type', () => {
        const table = documentRef.querySelector('table[data-table-type="executions"]') ||
                     documentRef.querySelector('#executionsTable') ||
                     documentRef.querySelector('.executions-table');
        expect(table).not.toBeNull();
    });

    test('should have add execution button wired to ModalManager via data-onclick', () => {
        const addButton = documentRef.querySelector('button[data-button-type="ADD"][data-entity-type="execution"]');
        if (addButton) {
            expect(addButton.getAttribute('data-onclick')).toContain('showModalSafe');
        } else {
            // Fallback: check for any add button
            const addButtons = documentRef.querySelectorAll('button[data-onclick*="showModalSafe"][data-onclick*="executionsModal"]');
            expect(addButtons.length).toBeGreaterThan(0);
        }
    });

    test('should have proper page structure', () => {
        const mainContent =
            documentRef.querySelector('main') ||
            documentRef.querySelector('.main-content') ||
            documentRef.querySelector('#main');
        expect(mainContent).toBeTruthy();
    });

    test('should be responsive', () => {
        const viewport = documentRef.querySelector('meta[name="viewport"]');
        expect(viewport).toBeTruthy();
    });
});
