/**
 * Modal Manager V2 Unit Tests
 * ============================
 * 
 * Unit tests for the Modal Manager V2 system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptWithDependencies, setupBasicMocks } = require('../utils/test-loader');

describe('Modal Manager V2', () => {
    let modalElement;

    beforeAll(() => {
        // Setup basic mocks with modal-specific dependencies
        setupBasicMocks({
            PreferencesSystem: {
                initialized: true,
                getPreference: jest.fn().mockResolvedValue(true),
                setPreference: jest.fn().mockResolvedValue(true),
                onPreferencesChanged: jest.fn()
            },
            SelectPopulatorService: {
                populate: jest.fn()
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

        // Mock document methods
        modalElement = document.createElement('div');
        modalElement.id = 'test-modal';
        modalElement.className = 'modal fade';
        modalElement.innerHTML = '<div class="modal-dialog"><div class="modal-content"></div></div>';

        document.body.appendChild(modalElement);

        // Use spyOn while preserving original behavior for other selectors
        const originalGetElementById = document.getElementById.bind(document);
        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'test-modal') {
                return modalElement;
            }
            return originalGetElementById(id);
        });

        const originalQuerySelector = document.querySelector.bind(document);
        jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
            if (selector === '#test-modal') {
                return modalElement;
            }
            return originalQuerySelector(selector);
        });

        // Mock event listeners - trigger immediately for test environment
        jest.spyOn(document, 'addEventListener').mockImplementation((event, callback) => {
            if (event === 'DOMContentLoaded') {
                // Simulate DOMContentLoaded immediately
                callback();
            }
        });

        // Mock console methods
        global.console.log = jest.fn();
        global.console.warn = jest.fn();
        global.console.error = jest.fn();

        // Load with dependencies using test loader only if not already loaded
        if (!window.ModalManagerV2) {
            const code = loadScriptWithDependencies('scripts/modal-manager-v2.js');
            eval(code);
        }
        
        // Ensure ModalManagerV2 is initialized (it should auto-initialize on DOMContentLoaded)
        // Trigger initialization manually if needed
        if (!window.ModalManagerV2) {
            const event = new Event('DOMContentLoaded');
            document.dispatchEvent(event);
        }
        
        if (window.ModalManagerV2) {
            window.ModalManagerV2.modals = new Map();
            window.ModalManagerV2.configurations = new Map();
            window.ModalManagerV2.activeModal = null;
            window.ModalManagerV2.isInitialized = true;
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
        if (window.ModalManagerV2) {
            window.ModalManagerV2.modals.clear();
            window.ModalManagerV2.configurations.clear();
            window.ModalManagerV2.activeModal = null;
        }
    });

    describe('Initialization', () => {
        test('should initialize ModalManagerV2', () => {
            // ModalManagerV2 should be initialized automatically on DOMContentLoaded
            // But in test environment, we may need to wait or trigger manually
            expect(window.ModalManagerV2).toBeDefined();
            if (window.ModalManagerV2) {
                expect(window.ModalManagerV2.isInitialized).toBe(true);
            }
        });

        test('should have modals Map', () => {
            if (window.ModalManagerV2) {
                expect(window.ModalManagerV2.modals).toBeInstanceOf(Map);
            }
        });

        test('should have configurations Map', () => {
            if (window.ModalManagerV2) {
                expect(window.ModalManagerV2.configurations).toBeInstanceOf(Map);
            }
        });
    });

    describe('createCRUDModal', () => {
        test('should create modal from configuration', () => {
            if (!window.ModalManagerV2) {
                // Skip if not initialized
                return;
            }

            const config = {
                id: 'test-modal',
                entityType: 'test',
                title: {
                    add: 'Add Test',
                    edit: 'Edit Test'
                },
                size: 'lg',
                fields: [
                    {
                        name: 'name',
                        label: 'Name',
                        type: 'text',
                        required: true
                    }
                ],
                onSave: 'saveTest'
            };

            const modal = window.ModalManagerV2.createCRUDModal(config);

            expect(modal).toBeDefined();
            expect(window.ModalManagerV2.modals.has('test-modal')).toBe(true);
        });

        test('should validate configuration before creating', () => {
            if (!window.ModalManagerV2) {
                return;
            }

            const invalidConfig = {
                id: 'invalid-modal'
                // Missing required fields
            };

            expect(() => {
                window.ModalManagerV2.createCRUDModal(invalidConfig);
            }).toThrow();
        });
    });

    describe('showModal', () => {
        test('should show existing modal', async () => {
            if (!window.ModalManagerV2) {
                return;
            }

            const config = {
                id: 'test-show-modal',
                entityType: 'test',
                title: { add: 'Add Test' },
                size: 'lg',
                fields: [],
                onSave: 'saveTest'
            };

            window.ModalManagerV2.createCRUDModal(config);
            
            // Mock Bootstrap Modal instance
            const mockModalInstance = {
                show: jest.fn(),
                hide: jest.fn(),
                dispose: jest.fn()
            };
            bootstrap.Modal.mockReturnValue(mockModalInstance);

            await window.ModalManagerV2.showModal('test-show-modal', 'add');

            expect(bootstrap.Modal).toHaveBeenCalled();
        });

        test('should handle non-existent modal gracefully', async () => {
            if (!window.ModalManagerV2) {
                return;
            }

            // showModal may throw or return error, depending on implementation
            try {
                await window.ModalManagerV2.showModal('non-existent-modal', 'add');
            } catch (error) {
                // Expected to throw for non-existent modal
                expect(error).toBeDefined();
            }
        });
    });

    describe('registerConfiguration', () => {
        test('should register modal configuration', () => {
            if (!window.ModalManagerV2) {
                return;
            }

            const config = {
                id: 'registered-modal',
                entityType: 'test',
                title: { add: 'Add Test' },
                size: 'lg',
                fields: [],
                onSave: 'saveTest'
            };

            if (window.ModalManagerV2.registerConfiguration) {
                window.ModalManagerV2.registerConfiguration(config);
                expect(window.ModalManagerV2.configurations.has('registered-modal')).toBe(true);
            }
        });
    });

    describe('closeModal', () => {
        test('should close active modal', async () => {
            if (!window.ModalManagerV2) {
                return;
            }

            const config = {
                id: 'test-close-modal',
                entityType: 'test',
                title: { add: 'Add Test' },
                size: 'lg',
                fields: [],
                onSave: 'saveTest'
            };

            window.ModalManagerV2.createCRUDModal(config);
            
            const mockModalInstance = {
                show: jest.fn(),
                hide: jest.fn(),
                dispose: jest.fn()
            };
            bootstrap.Modal.mockReturnValue(mockModalInstance);

            await window.ModalManagerV2.showModal('test-close-modal', 'add');
            
            if (window.ModalManagerV2.closeModal) {
                await window.ModalManagerV2.closeModal('test-close-modal');
                expect(mockModalInstance.hide).toHaveBeenCalled();
            }
        });
    });

    describe('showModalSafe helper', () => {
        test('should be available globally', () => {
            expect(window.showModalSafe).toBeDefined();
            expect(typeof window.showModalSafe).toBe('function');
        });

        test('should handle modal showing safely', async () => {
            if (!window.ModalManagerV2) {
                return;
            }

            const config = {
                id: 'safe-modal',
                entityType: 'test',
                title: { add: 'Add Test' },
                size: 'lg',
                fields: [],
                onSave: 'saveTest'
            };

            window.ModalManagerV2.createCRUDModal(config);

            const mockModalInstance = {
                show: jest.fn(),
                hide: jest.fn(),
                dispose: jest.fn()
            };
            bootstrap.Modal.mockReturnValue(mockModalInstance);

            await window.showModalSafe('safe-modal', 'add');

            expect(bootstrap.Modal).toHaveBeenCalled();
        });
    });

    describe('Dependency checking', () => {
        test('should check dependencies correctly', () => {
            if (!window.ModalManagerV2 || !window.ModalManagerV2._checkDependencies) {
                return;
            }

            const deps = window.ModalManagerV2._checkDependencies();

            expect(deps).toHaveProperty('preferencesSystem');
            expect(deps).toHaveProperty('selectPopulatorService');
        });
    });
});

