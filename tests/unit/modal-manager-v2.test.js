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

const fs = require('fs');
const path = require('path');

// Load the actual Modal Manager V2 code
const modalManagerCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/modal-manager-v2.js'),
    'utf8'
);

describe('Modal Manager V2', () => {
    let modalElement;

    beforeAll(() => {
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

        // Mock window.PreferencesSystem
        global.window.PreferencesSystem = {
            initialized: true,
            onPreferencesChanged: jest.fn()
        };

        // Mock window.SelectPopulatorService
        global.window.SelectPopulatorService = {
            populate: jest.fn()
        };

        // Mock document methods
        modalElement = document.createElement('div');
        modalElement.id = 'test-modal';
        modalElement.className = 'modal fade';
        modalElement.innerHTML = '<div class="modal-dialog"><div class="modal-content"></div></div>';

        document.body.appendChild = jest.fn();
        document.body.insertAdjacentHTML = jest.fn();
        document.getElementById.mockImplementation((id) => {
            if (id === 'test-modal') {
                return modalElement;
            }
            return null;
        });

        document.querySelector.mockImplementation((selector) => {
            if (selector === '#test-modal') {
                return modalElement;
            }
            return null;
        });

        document.querySelectorAll.mockImplementation(() => []);

        // Mock event listeners
        document.addEventListener.mockImplementation((event, callback) => {
            if (event === 'DOMContentLoaded') {
                // Simulate DOMContentLoaded
                setTimeout(() => callback(), 0);
            }
        });

        // Evaluate the real code
        eval(modalManagerCode);
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
            expect(window.ModalManagerV2).toBeDefined();
            expect(window.ModalManagerV2.isInitialized).toBe(true);
        });

        test('should have modals Map', () => {
            expect(window.ModalManagerV2.modals).toBeInstanceOf(Map);
        });

        test('should have configurations Map', () => {
            expect(window.ModalManagerV2.configurations).toBeInstanceOf(Map);
        });
    });

    describe('createCRUDModal', () => {
        test('should create modal from configuration', () => {
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
            await expect(
                window.ModalManagerV2.showModal('non-existent-modal', 'add')
            ).rejects.toThrow();
        });
    });

    describe('registerConfiguration', () => {
        test('should register modal configuration', () => {
            const config = {
                id: 'registered-modal',
                entityType: 'test',
                title: { add: 'Add Test' },
                size: 'lg',
                fields: [],
                onSave: 'saveTest'
            };

            window.ModalManagerV2.registerConfiguration(config);

            expect(window.ModalManagerV2.configurations.has('registered-modal')).toBe(true);
        });
    });

    describe('closeModal', () => {
        test('should close active modal', async () => {
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
            await window.ModalManagerV2.closeModal('test-close-modal');

            expect(mockModalInstance.hide).toHaveBeenCalled();
        });
    });

    describe('showModalSafe helper', () => {
        test('should be available globally', () => {
            expect(window.showModalSafe).toBeDefined();
            expect(typeof window.showModalSafe).toBe('function');
        });

        test('should handle modal showing safely', async () => {
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
            const deps = window.ModalManagerV2._checkDependencies();

            expect(deps).toHaveProperty('preferencesSystem');
            expect(deps).toHaveProperty('selectPopulatorService');
        });
    });
});

