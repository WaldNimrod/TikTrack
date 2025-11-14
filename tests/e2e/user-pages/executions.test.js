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

    test('should have executions table', () => {
        const executionsTable =
            documentRef.querySelector('#executionsTable') ||
            documentRef.querySelector('.executions-table') ||
            documentRef.querySelector('table[data-table-type="executions"]');
        expect(executionsTable).toBeTruthy();
    });

    test('should have table actions', () => {
        const tableActions =
            documentRef.querySelector('.table-actions') ||
            documentRef.querySelector('#tableActions');
        expect(tableActions).toBeTruthy();
    });

    test('should load required scripts', () => {
        const scripts = documentRef.querySelectorAll('script[src]');
        const scriptSources = Array.from(scripts).map(script => script.src);

        expect(scriptSources.some(src => src.includes('executions.js'))).toBe(true);
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
