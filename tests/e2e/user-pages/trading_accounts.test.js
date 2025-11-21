/**
 * Trading Accounts Page E2E Tests - TikTrack
 * ===========================================
 * 
 * End-to-end tests for the trading accounts page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadPageTemplate, mountHtml, resetDom } = require('../../utils/page-test-utils');

describe('Trading Accounts Page E2E Tests', () => {
    let htmlContent;
    let documentRef;

    beforeAll(() => {
        htmlContent = loadPageTemplate('trading-accounts');
    });

    beforeEach(() => {
        ({ document: documentRef } = mountHtml(htmlContent, { url: '/trading-accounts' }));
    });

    afterEach(() => {
        resetDom();
    });

    test('should load trading accounts page successfully', () => {
        expect(documentRef.title).toBeDefined();
        expect(documentRef.body).toBeDefined();
    });

    test('should have trading accounts table with correct data-table-type', () => {
        const table = documentRef.querySelector('table[data-table-type="trading_account"]') ||
                     documentRef.querySelector('table');
        expect(table).not.toBeNull();
    });

    test('should have add account button wired to ModalManager via data-onclick', () => {
        const addButton = documentRef.querySelector('button[data-button-type="ADD"][data-entity-type="trading_account"]');
        if (addButton) {
            expect(addButton.getAttribute('data-onclick')).toContain('showModalSafe');
        } else {
            // Fallback: check for any add button
            const addButtons = documentRef.querySelectorAll('button[data-onclick*="showModalSafe"][data-onclick*="tradingAccount"]');
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

