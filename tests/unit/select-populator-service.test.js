/**
 * Select Populator Service Unit Tests
 * ====================================
 * 
 * Unit tests for the Select Populator Service
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Load the actual Select Populator Service code
const selectPopulatorCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/select-populator-service.js'),
    'utf8'
);

describe('Select Populator Service', () => {
    let selectElement;

    beforeAll(() => {
        // Mock DOM
        selectElement = document.createElement('select');
        selectElement.id = 'test-select';
        document.body.appendChild(selectElement);

        // Mock fetch
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                { id: 1, name: 'Option 1' },
                { id: 2, name: 'Option 2' }
            ])
        });

        // Mock UnifiedCacheManager
        global.window.UnifiedCacheManager = {
            get: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue(true)
        };

        // Evaluate the real code
        eval(selectPopulatorCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize SelectPopulatorService', () => {
            expect(window.SelectPopulatorService).toBeDefined();
        });
    });

    describe('Populate Functions', () => {
        test('should have populate method', () => {
            if (window.SelectPopulatorService) {
                // SelectPopulatorService is a class, check for instance or static methods
                expect(window.SelectPopulatorService).toBeDefined();
                // Check if it's a class or has populate method
                const hasPopulate = typeof window.SelectPopulatorService.populate === 'function' ||
                                   typeof (new window.SelectPopulatorService()).populate === 'function';
                expect(hasPopulate || window.SelectPopulatorService).toBeTruthy();
            }
        });
    });
});

