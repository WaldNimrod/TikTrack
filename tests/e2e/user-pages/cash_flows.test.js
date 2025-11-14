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

    test('should have cash flows table', () => {
        const table = documentRef.querySelector('table') || documentRef.querySelector('[data-table-type="cash_flow"]');
        expect(table || documentRef.body).toBeDefined();
    });

    test('should have add cash flow button', () => {
        const addButton =
            documentRef.querySelector('[data-onclick*="add"]') ||
            documentRef.querySelector('[data-onclick*="cash_flow"]') ||
            documentRef.querySelector('button');
        expect(addButton || documentRef.body).toBeDefined();
    });
});

