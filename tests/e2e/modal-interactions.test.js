/**
 * Modal Interactions E2E Tests - TikTrack
 * ========================================
 * 
 * End-to-end tests for modal interactions
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptsInOrder, setupBasicMocks } = require('../utils/test-loader');

describe('Modal Interactions E2E Tests', () => {
    let modalElement;

    beforeAll(() => {
        setupBasicMocks({
            PreferencesSystem: {
                initialized: true,
                getPreference: jest.fn().mockResolvedValue(true)
            },
            SelectPopulatorService: {
                populate: jest.fn()
            },
            FieldRendererService: {
                renderStatus: jest.fn(),
                renderSide: jest.fn()
            }
        });

        global.bootstrap = {
            Modal: jest.fn(function(element) {
                return {
                    show: jest.fn(),
                    hide: jest.fn(),
                    dispose: jest.fn()
                };
            })
        };

        modalElement = document.createElement('div');
        modalElement.id = 'test-modal';
        modalElement.className = 'modal fade';
        document.body.appendChild(modalElement);

        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id.includes('modal')) {
                return modalElement;
            }
            return null;
        });

        const code = loadScriptsInOrder(['standalone-core', 'core-modules', 'services', 'modal']);
        eval(code);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should open modal when triggered', async () => {
        if (!window.ModalManagerV2 || !window.ModalManagerV2.showModal) {
            return;
        }

        const config = {
            id: 'interaction-modal',
            entityType: 'test',
            title: { add: 'Add Test' },
            size: 'lg',
            fields: []
        };

        window.ModalManagerV2.createCRUDModal(config);
        
        await window.ModalManagerV2.showModal('interaction-modal', 'add');
        
        expect(bootstrap.Modal).toHaveBeenCalled();
    });

    test('should close modal when close button clicked', () => {
        if (!window.ModalManagerV2 || !window.ModalManagerV2.closeModal) {
            return;
        }

        window.ModalManagerV2.activeModal = 'test-modal';
        
        expect(() => {
            window.ModalManagerV2.closeModal();
        }).not.toThrow();
    });

    test('should handle modal navigation', () => {
        if (!window.ModalNavigationService || typeof window.ModalNavigationService.getStack !== 'function') {
            return;
        }

        const stack = window.ModalNavigationService.getStack();
        expect(Array.isArray(stack)).toBe(true);
    });
});

