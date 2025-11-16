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

    test('should have notes table with correct data-table-type', () => {
        const table = documentRef.querySelector('table[data-table-type="notes"]');
        expect(table).not.toBeNull();
    });

    test('should have add note button wired to ModalManager via data-onclick', () => {
        const addButton = documentRef.querySelector('button[data-button-type="ADD"][data-entity-type="note"]');
        expect(addButton).not.toBeNull();
        expect(addButton.getAttribute('data-onclick')).toContain('showModalSafe');
    });

    test('should have entity-type filter buttons with icons only', () => {
        const filterContainer = documentRef.querySelector('.filter-buttons-container');
        expect(filterContainer).not.toBeNull();

        const allButton = filterContainer.querySelector('button[data-type="all"][data-button-type="FILTER"]');
        const accountButton = filterContainer.querySelector('button[data-type="account"][data-button-type="FILTER"]');
        const tradeButton = filterContainer.querySelector('button[data-type="trade"][data-button-type="FILTER"]');
        const planButton = filterContainer.querySelector('button[data-type="trade_plan"][data-button-type="FILTER"]');
        const tickerButton = filterContainer.querySelector('button[data-type="ticker"][data-button-type="FILTER"]');

        expect(allButton).not.toBeNull();
        expect(accountButton).not.toBeNull();
        expect(tradeButton).not.toBeNull();
        expect(planButton).not.toBeNull();
        expect(tickerButton).not.toBeNull();

        // וידוא שהכפתורים מוגדרים לוריאנט קטן (איקון בלבד) וללא טקסט גלוי
        [allButton, accountButton, tradeButton, planButton, tickerButton].forEach(btn => {
            expect(btn.getAttribute('data-variant')).toBe('small');
            expect(btn.textContent.trim()).toBe('');
        });
    });
});

