/**
 * Linked Items Service Unit Tests
 * ================================
 * 
 * Unit tests for the Linked Items Service
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Load the actual Linked Items Service code
const linkedItemsCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/linked-items-service.js'),
    'utf8'
);

describe('Linked Items Service', () => {
    beforeAll(() => {
        // Mock fetch
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                { id: 1, type: 'trade', name: 'Trade 1' },
                { id: 2, type: 'alert', name: 'Alert 1' }
            ])
        });

        // Evaluate the real code
        eval(linkedItemsCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize LinkedItemsService', () => {
            expect(window.LinkedItemsService || window.loadLinkedItemsData).toBeDefined();
        });
    });

    describe('Load Functions', () => {
        test('should have loadLinkedItemsData function', () => {
            expect(typeof window.loadLinkedItemsData).toBe('function');
        });
    });
});

