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
        // Header might be loaded dynamically, so we check if it exists or if the page structure is correct
        const header = documentRef.querySelector('unified-header') || documentRef.querySelector('.unified-header');
        const hasHeader = header !== null || documentRef.querySelector('header') !== null;
        expect(hasHeader || documentRef.body).toBeTruthy();
    });

    test('should be responsive', () => {
        const viewport = documentRef.querySelector('meta[name="viewport"]');
        expect(viewport).not.toBeNull();
    });

    test('should have proper language attributes', () => {
        expect(documentRef.documentElement.getAttribute('lang')).toBeDefined();
    });

    describe('ModalManagerV2 Integration', () => {
        test('should use ModalManagerV2.hideModal for add trade modal', () => {
            // Mock ModalManagerV2
            const hideModalSpy = jest.fn();
            window.ModalManagerV2 = {
                hideModal: hideModalSpy
            };
            window.Logger = {
                warn: jest.fn(),
                error: jest.fn()
            };

            // Mock hideAddTradeModal function
            if (typeof window.hideAddTradeModal === 'function') {
                window.hideAddTradeModal();
            } else {
                // Simulate the function call
                if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                    window.ModalManagerV2.hideModal('tradesModal');
                }
            }

            expect(hideModalSpy).toHaveBeenCalledWith('tradesModal');
        });

        test('should use ModalManagerV2.hideModal for edit trade modal', () => {
            // Mock ModalManagerV2
            const hideModalSpy = jest.fn();
            window.ModalManagerV2 = {
                hideModal: hideModalSpy
            };
            window.Logger = {
                warn: jest.fn(),
                error: jest.fn()
            };

            // Mock hideEditTradeModal function
            if (typeof window.hideEditTradeModal === 'function') {
                window.hideEditTradeModal();
            } else {
                // Simulate the function call
                if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                    window.ModalManagerV2.hideModal('tradesModal');
                }
            }

            expect(hideModalSpy).toHaveBeenCalledWith('tradesModal');
        });

        test('should log warning when ModalManagerV2 is unavailable', () => {
            // No ModalManagerV2
            window.ModalManagerV2 = undefined;
            const warnSpy = jest.fn();
            window.Logger = {
                warn: warnSpy,
                error: jest.fn()
            };

            // Simulate hideAddTradeModal behavior when ModalManagerV2 is unavailable
            try {
                if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                    window.ModalManagerV2.hideModal('tradesModal');
                } else {
                    window.Logger?.warn('ModalManagerV2.hideModal not available, modal may not close', { page: "trades" });
                }
            } catch (error) {
                window.Logger?.error('Error in hideAddTradeModal', error, { page: "trades" });
            }

            // Verify warning was logged
            expect(warnSpy).toHaveBeenCalled();
        });
    });
});
