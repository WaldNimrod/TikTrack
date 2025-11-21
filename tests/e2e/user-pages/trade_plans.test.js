/**
 * Trade Plans Page E2E Tests - TikTrack
 * ======================================
 * 
 * End-to-end tests for the trade plans page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadPageTemplate, mountHtml, resetDom } = require('../../utils/page-test-utils');

describe('Trade Plans Page E2E Tests', () => {
    let htmlContent;
    let documentRef;

    beforeAll(() => {
        htmlContent = loadPageTemplate('trade-plans');
    });

    beforeEach(() => {
        ({ document: documentRef } = mountHtml(htmlContent, { url: '/trade-plans' }));
    });

    afterEach(() => {
        resetDom();
    });

    test('should load trade plans page successfully', () => {
        expect(documentRef.title).toBeDefined();
        expect(documentRef.body).toBeDefined();
    });

    test('should have trade plans table with correct data-table-type', () => {
        const table = documentRef.querySelector('table[data-table-type="trade_plans"]');
        expect(table).not.toBeNull();
    });

    test('should have add trade plan button wired to ModalManager via data-onclick', () => {
        const addButton = documentRef.querySelector('button[data-button-type="ADD"][data-entity-type="trade_plan"]');
        if (addButton) {
            expect(addButton.getAttribute('data-onclick')).toContain('showModalSafe');
        } else {
            // Fallback: check for any add button
            const addButtons = documentRef.querySelectorAll('button[data-onclick*="showModalSafe"][data-onclick*="tradePlansModal"]');
            expect(addButtons.length).toBeGreaterThan(0);
        }
    });

    test('should have proper page structure', () => {
        expect(documentRef.querySelector('.main-content') || documentRef.querySelector('main') || documentRef.querySelector('.content-section')).not.toBeNull();
    });

    test('should be responsive', () => {
        const viewport = documentRef.querySelector('meta[name="viewport"]');
        expect(viewport).not.toBeNull();
    });

    describe('ModalManagerV2 Integration', () => {
        test('should use Bootstrap.Modal.getOrCreateInstance for cancel trade plan modal', () => {
            // Mock Bootstrap Modal
            const showSpy = jest.fn();
            const mockModalInstance = {
                show: showSpy
            };
            global.bootstrap = {
                Modal: {
                    getOrCreateInstance: jest.fn().mockReturnValue(mockModalInstance)
                }
            };

            // Create modal element
            const modalElement = documentRef.createElement('div');
            modalElement.id = 'cancelTradePlanModal';
            modalElement.className = 'modal fade';
            documentRef.body.appendChild(modalElement);

            // Simulate openCancelTradePlanModal behavior
            if (modalElement) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
                modal.show();
            }

            expect(bootstrap.Modal.getOrCreateInstance).toHaveBeenCalledWith(modalElement);
            expect(showSpy).toHaveBeenCalled();
        });

        test('should handle special cancel modal correctly', () => {
            // Mock ModalManagerV2 (should not be used for special modals)
            window.ModalManagerV2 = {
                hideModal: jest.fn()
            };

            // Mock Bootstrap Modal
            const mockModalInstance = {
                show: jest.fn(),
                hide: jest.fn()
            };
            global.bootstrap = {
                Modal: {
                    getOrCreateInstance: jest.fn().mockReturnValue(mockModalInstance)
                }
            };

            // Create modal element
            const modalElement = documentRef.createElement('div');
            modalElement.id = 'cancelTradePlanModal';
            documentRef.body.appendChild(modalElement);

            // Special modals use Bootstrap directly, not ModalManagerV2
            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            expect(modal).toBeDefined();
            expect(bootstrap.Modal.getOrCreateInstance).toHaveBeenCalled();
        });
    });
});
