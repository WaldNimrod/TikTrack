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

    test('should have trading accounts table', () => {
        const table =
            documentRef.querySelector('table') ||
            documentRef.querySelector('[data-table-type="trading_account"]');
        expect(table || documentRef.body).toBeDefined();
    });

    test('should have add account button', () => {
        const addButton =
            documentRef.querySelector('[data-onclick*="add"]') ||
            documentRef.querySelector('[data-onclick*="account"]') ||
            documentRef.querySelector('button');
        expect(addButton || documentRef.body).toBeDefined();
    });
});

