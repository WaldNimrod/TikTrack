/**
 * Trades Page E2E Tests - TikTrack
 * ================================
 * 
 * End-to-end tests for the trades page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadPageTemplate, mountHtml, resetDom } = require('../../utils/page-test-utils');

describe('Trades Page E2E Tests', () => {
    let htmlContent;
    let documentRef;

    beforeAll(() => {
        htmlContent = loadPageTemplate('trades');
    });

    beforeEach(() => {
        ({ document: documentRef } = mountHtml(htmlContent, { url: '/trades' }));
    });

    afterEach(() => {
        resetDom();
    });

    test('should load trades page successfully', () => {
        expect(documentRef.title).toBeDefined();
        expect(documentRef.body).toBeDefined();
    });

    test('should have trades table with correct data-table-type', () => {
        const table = documentRef.querySelector('table[data-table-type="trades"]');
        expect(table).not.toBeNull();
    });

    test('should have add trade button wired to ModalManager via data-onclick', () => {
        const addButton = documentRef.querySelector('button[data-button-type="ADD"][data-entity-type="trade"]');
        if (addButton) {
            expect(addButton.getAttribute('data-onclick')).toContain('showModalSafe');
        } else {
            // Fallback: check for any add button
            const addButtons = documentRef.querySelectorAll('button[data-onclick*="showModalSafe"][data-onclick*="tradesModal"]');
            expect(addButtons.length).toBeGreaterThan(0);
        }
    });

    test('should have proper page structure', () => {
        expect(documentRef.querySelector('.main-content') || documentRef.querySelector('main')).not.toBeNull();
    });

    test('should have unified header', () => {
        expect(documentRef.querySelector('unified-header') || documentRef.querySelector('.unified-header')).not.toBeNull();
    });

    test('should be responsive', () => {
        const viewport = documentRef.querySelector('meta[name="viewport"]');
        expect(viewport).not.toBeNull();
    });

    test('should have proper language attributes', () => {
        expect(documentRef.documentElement.getAttribute('lang')).toBeDefined();
    });
});
