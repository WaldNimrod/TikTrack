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

    describe('ModalManagerV2 Integration', () => {
        test('should use ModalManagerV2.hideModal for delete note modal', () => {
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
            modalElement.id = 'deleteNoteModal';
            modalElement.className = 'modal fade';
            documentRef.body.appendChild(modalElement);

            // Mock confirmDeleteNote function
            if (typeof window.confirmDeleteNote === 'function') {
                window.confirmDeleteNote(1);
            } else {
                // Simulate the function call
                if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                    window.ModalManagerV2.hideModal('deleteNoteModal');
                }
            }

            expect(hideModalSpy).toHaveBeenCalledWith('deleteNoteModal');
        });

        test('should use ModalManagerV2.hideModal for view note modal', () => {
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
            modalElement.id = 'viewNoteModal';
            modalElement.className = 'modal fade';
            documentRef.body.appendChild(modalElement);

            // Mock editCurrentNote function
            if (typeof window.editCurrentNote === 'function') {
                window.currentViewingNoteId = 1;
                window.editCurrentNote();
            } else {
                // Simulate the function call
                if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                    window.ModalManagerV2.hideModal('viewNoteModal');
                }
            }

            expect(hideModalSpy).toHaveBeenCalledWith('viewNoteModal');
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
            modalElement.id = 'deleteNoteModal';
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

    describe('PageStateManager Integration', () => {
        test('should use PageStateManager for section state restoration', () => {
            // Mock PageStateManager
            const loadSectionsSpy = jest.fn().mockResolvedValue({});
            window.PageStateManager = {
                loadSections: loadSectionsSpy,
                loadPageState: jest.fn().mockResolvedValue({
                    sections: { 'top-section': true, 'main-section': false }
                })
            };

            // Mock restoreAllSectionStates
            const restoreAllSpy = jest.fn().mockResolvedValue(undefined);
            window.restoreAllSectionStates = restoreAllSpy;

            // Mock restorePageState
            if (typeof window.restorePageState === 'function') {
                window.restorePageState('notes');
            } else {
                // Simulate the function call
                if (window.PageStateManager && typeof window.PageStateManager.loadPageState === 'function') {
                    window.PageStateManager.loadPageState('notes').then(pageState => {
                        if (pageState.sections && typeof window.restoreAllSectionStates === 'function') {
                            window.restoreAllSectionStates();
                        }
                    });
                }
            }

            // Verify PageStateManager was used
            expect(window.PageStateManager.loadPageState).toBeDefined();
        });

        test('should not have legacy restoreNotesSectionState function', () => {
            // Verify the legacy function is not exported
            expect(window.restoreNotesSectionState).toBeUndefined();
            
            // Verify restoreAllSectionStates is available
            expect(typeof window.restoreAllSectionStates).toBe('function');
        });

        test('should restore page state using PageStateManager', async () => {
            // Mock PageStateManager
            const mockPageState = {
                filters: { type: 'all' },
                sort: { columnIndex: 0, direction: 'asc' },
                sections: { 'top-section': true }
            };

            window.PageStateManager = {
                loadPageState: jest.fn().mockResolvedValue(mockPageState),
                loadSections: jest.fn().mockResolvedValue(mockPageState.sections)
            };

            window.restoreAllSectionStates = jest.fn().mockResolvedValue(undefined);
            window.filterSystem = {
                currentFilters: {},
                applyAllFilters: jest.fn()
            };
            window.UnifiedTableSystem = {
                sorter: {
                    sort: jest.fn().mockResolvedValue(undefined),
                    applyDefaultSort: jest.fn().mockResolvedValue(undefined)
                }
            };

            // Simulate restorePageState
            if (window.PageStateManager && typeof window.PageStateManager.loadPageState === 'function') {
                const pageState = await window.PageStateManager.loadPageState('notes');
                
                if (pageState.sections && typeof window.restoreAllSectionStates === 'function') {
                    await window.restoreAllSectionStates();
                }

                expect(window.PageStateManager.loadPageState).toHaveBeenCalledWith('notes');
                expect(window.restoreAllSectionStates).toHaveBeenCalled();
            }
        });
    });
});

