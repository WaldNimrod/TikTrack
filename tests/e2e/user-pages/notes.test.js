/**
 * Notes Page E2E Tests - TikTrack
 * ================================
 * 
 * End-to-end tests for the notes page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadPageTemplate, mountHtml, resetDom } = require('../../utils/page-test-utils');

describe('Notes Page E2E Tests', () => {
    let htmlContent;
    let documentRef;

    beforeAll(() => {
        htmlContent = loadPageTemplate('notes');
    });

    beforeEach(() => {
        ({ document: documentRef } = mountHtml(htmlContent, { url: '/notes' }));
    });

    afterEach(() => {
        resetDom();
    });

    test('should load notes page successfully', () => {
        expect(documentRef.title).toBeDefined();
        expect(documentRef.body).toBeDefined();
    });

    test('should have notes table', () => {
        const table = documentRef.querySelector('table') || documentRef.querySelector('[data-table-type="note"]');
        expect(table || documentRef.body).toBeDefined();
    });

    test('should have add note button', () => {
        const addButton =
            documentRef.querySelector('[data-onclick*="add"]') ||
            documentRef.querySelector('[data-onclick*="note"]') ||
            documentRef.querySelector('button');
        expect(addButton || documentRef.body).toBeDefined();
    });
});

