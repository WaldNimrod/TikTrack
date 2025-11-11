/**
 * Modal Navigation Manager Unit Tests
 * ====================================
 * 
 * Unit tests for the Modal Navigation Manager system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Load the actual Modal Navigation Manager code
const modalNavCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/modal-navigation-manager.js'),
    'utf8'
);

describe('Modal Navigation Manager', () => {
    beforeAll(() => {
        // Mock Bootstrap Modal
        global.bootstrap = {
            Modal: jest.fn(function(element) {
                return {
                    show: jest.fn(),
                    hide: jest.fn(),
                    dispose: jest.fn()
                };
            })
        };

        // Evaluate the real code
        eval(modalNavCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize ModalNavigationService', () => {
            expect(window.ModalNavigationService).toBeDefined();
            expect(window.modalNavigationManager).toBeDefined();
        });
    });
});

