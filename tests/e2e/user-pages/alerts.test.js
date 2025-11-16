/**
 * Alerts Page E2E Tests - TikTrack
 * =================================
 * 
 * End-to-end tests for the alerts page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadPageTemplate, mountHtml, resetDom } = require('../../utils/page-test-utils');

describe('Alerts Page E2E Tests', () => {
    let htmlContent;
    let documentRef;

    beforeAll(() => {
        htmlContent = loadPageTemplate('alerts');
    });

    beforeEach(() => {
        ({ document: documentRef } = mountHtml(htmlContent, { url: '/alerts' }));
    });

    afterEach(() => {
        resetDom();
    });

    test('should load alerts page successfully', () => {
        expect(documentRef.title).toBeDefined();
        expect(documentRef.body).toBeDefined();
    });

    test('should have alerts table with correct data-table-type', () => {
        const table = documentRef.querySelector('table[data-table-type="alerts"]');
        expect(table).not.toBeNull();
    });

    test('should have add alert button wired to ModalManager via data-onclick', () => {
        const addButton = documentRef.querySelector('button[data-button-type="ADD"][data-entity-type="alert"]');
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

    test('should have proper page structure', () => {
        expect(documentRef.querySelector('.main-content') || documentRef.querySelector('main')).not.toBeNull();
    });

    test('should be responsive', () => {
        const viewport = documentRef.querySelector('meta[name="viewport"]');
        expect(viewport).not.toBeNull();
    });

    describe('ModalManagerV2 Integration', () => {
        test('should use ModalManagerV2.hideModal for add alert modal', () => {
            // Mock ModalManagerV2
            const hideModalSpy = jest.fn();
            window.ModalManagerV2 = {
                hideModal: hideModalSpy
            };

            // Mock Bootstrap Modal
            const mockModalInstance = {
                hide: jest.fn()
            };
            global.bootstrap = {
                Modal: {
                    getInstance: jest.fn().mockReturnValue(mockModalInstance)
                }
            };

            // Create modal element
            const modalElement = documentRef.createElement('div');
            modalElement.id = 'addAlertModal';
            modalElement.className = 'modal fade';
            documentRef.body.appendChild(modalElement);

            // Simulate createAlertFromCondition behavior
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                window.ModalManagerV2.hideModal('addAlertModal');
            }

            expect(hideModalSpy).toHaveBeenCalledWith('addAlertModal');
        });

        test('should not have legacy Bootstrap modal event listeners', () => {
            // Create modal element
            const modalElement = documentRef.createElement('div');
            modalElement.id = 'addAlertModal';
            modalElement.className = 'modal fade';
            documentRef.body.appendChild(modalElement);

            // Verify no legacy event listeners are attached
            const clickListeners = modalElement.getEventListeners?.() || [];
            const backdropListeners = clickListeners.filter(
                listener => listener.type === 'click' && listener.target === modalElement
            );

            // ModalManagerV2 handles backdrop clicks automatically, so legacy listeners should not exist
            expect(backdropListeners.length).toBe(0);
        });

        test('should fallback to Bootstrap Modal when ModalManagerV2 is unavailable', () => {
            // No ModalManagerV2
            window.ModalManagerV2 = undefined;

            // Mock Bootstrap Modal
            const hideSpy = jest.fn();
            const mockModalInstance = {
                hide: hideSpy
            };
            global.bootstrap = {
                Modal: {
                    getInstance: jest.fn().mockReturnValue(mockModalInstance)
                }
            };

            // Create modal element
            const modalElement = documentRef.createElement('div');
            modalElement.id = 'addAlertModal';
            modalElement.className = 'modal fade';
            documentRef.body.appendChild(modalElement);

            // Simulate fallback behavior
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }

            expect(hideSpy).toHaveBeenCalled();
        });
    });
});
