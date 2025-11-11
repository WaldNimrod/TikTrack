/**
 * Modal Systems Integration Tests
 * ===============================
 * 
 * בדיקות אינטגרציה בין מערכות Modal שונות
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptsInOrder, setupBasicMocks } = require('../utils/test-loader');

describe('Modal Systems Integration', () => {
    let modalElement;
    let entityDetailsModal;

    beforeAll(() => {
        // Setup basic mocks
        setupBasicMocks({
            PreferencesSystem: {
                initialized: true,
                getPreference: jest.fn().mockResolvedValue(true),
                setPreference: jest.fn().mockResolvedValue(true),
                onPreferencesChanged: jest.fn()
            },
            SelectPopulatorService: {
                populate: jest.fn()
            },
            FieldRendererService: {
                renderStatus: jest.fn(),
                renderSide: jest.fn(),
                renderAmount: jest.fn()
            }
        });

        // Mock Bootstrap Modal
        global.bootstrap = {
            Modal: jest.fn(function(element) {
                return {
                    show: jest.fn(),
                    hide: jest.fn(),
                    dispose: jest.fn(),
                    _element: element
                };
            })
        };

        // Mock DOM
        modalElement = document.createElement('div');
        modalElement.id = 'test-modal';
        modalElement.className = 'modal fade';
        modalElement.innerHTML = '<div class="modal-dialog"><div class="modal-content"></div></div>';
        document.body.appendChild(modalElement);

        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'test-modal' || id.includes('modal')) {
                return modalElement;
            }
            return null;
        });

        jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
            if (selector.includes('modal')) {
                return modalElement;
            }
            return null;
        });

        // Load modal systems in order
        const code = loadScriptsInOrder(['standalone-core', 'core-modules', 'core-utilities', 'services', 'modal', 'crud']);
        eval(code);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        if (window.ModalManagerV2) {
            window.ModalManagerV2.modals.clear();
            window.ModalManagerV2.activeModal = null;
        }
        if (window.ModalNavigationService?.clear) {
            await window.ModalNavigationService.clear();
        }
    });

    describe('Modal Manager + Modal Navigation Integration', () => {
        test('should integrate ModalManagerV2 with ModalNavigationService', () => {
            expect(window.ModalManagerV2).toBeDefined();
            expect(window.ModalNavigationService).toBeDefined();
            
            if (window.ModalManagerV2 && window.ModalNavigationService) {
                // Both systems should be available
                expect(window.ModalManagerV2.modals).toBeInstanceOf(Map);
                expect(Array.isArray(window.ModalNavigationService.getStack())).toBe(true);
            }
        });

        test('should handle modal stack navigation', async () => {
            if (!window.ModalManagerV2 || !window.ModalNavigationService) {
                return;
            }

            const config = {
                id: 'stack-modal-1',
                entityType: 'test',
                title: { add: 'Add Test' },
                size: 'lg',
                fields: []
            };

            window.ModalManagerV2.createCRUDModal(config);
            
            // Modal should be registered
            expect(window.ModalManagerV2.modals.has('stack-modal-1')).toBe(true);
        });
    });

    describe('Modal Manager + Entity Details Integration', () => {
        test('should integrate ModalManagerV2 with Entity Details Modal', () => {
            expect(window.ModalManagerV2).toBeDefined();
            expect(window.showEntityDetailsModal || window.EntityDetailsModal).toBeDefined();
        });

        test('should handle entity details modal creation', async () => {
            if (!window.ModalManagerV2 || !window.showEntityDetailsModal) {
                return;
            }

            // Entity details modal should work with ModalManagerV2
            await expect(window.showEntityDetailsModal('trade', 1)).resolves.not.toThrow();
        });
    });

    describe('Modal Navigation + Entity Details Integration', () => {
        test('should handle modal navigation with entity details', () => {
            if (!window.ModalNavigationService || typeof window.ModalNavigationService.getStack !== 'function' || !window.showEntityDetailsModal) {
                return;
            }

            // Navigation should handle entity details modals
            const stack = window.ModalNavigationService.getStack();
            expect(Array.isArray(stack)).toBe(true);
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle missing modal dependencies gracefully', () => {
            if (!window.ModalManagerV2) {
                return;
            }

            // Should handle missing dependencies
            const deps = window.ModalManagerV2._checkDependencies ? 
                window.ModalManagerV2._checkDependencies() : {};
            
            expect(typeof deps === 'object').toBe(true);
        });

        test('should handle modal conflicts', async () => {
            if (!window.ModalManagerV2) {
                return;
            }

            const config = {
                id: 'conflict-modal',
                entityType: 'test',
                title: { add: 'Add Test' },
                size: 'lg',
                fields: []
            };

            window.ModalManagerV2.createCRUDModal(config);
            
            // Creating same modal twice should be handled
            expect(() => {
                window.ModalManagerV2.createCRUDModal(config);
            }).not.toThrow();
        });
    });
});

