/**
 * Default Value Setter Unit Tests
 * ===============================
 * 
 * Unit tests for the Default Value Setter
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Load the actual Default Value Setter code
const defaultValueCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/default-value-setter.js'),
    'utf8'
);

describe('Default Value Setter', () => {
    beforeAll(() => {
        // Mock getPreference
        global.window.getPreference = jest.fn().mockResolvedValue(null);

        // Evaluate the real code
        eval(defaultValueCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize DefaultValueSetter', () => {
            expect(window.DefaultValueSetter || window.defaultValueSetter).toBeDefined();
        });
    });
});

