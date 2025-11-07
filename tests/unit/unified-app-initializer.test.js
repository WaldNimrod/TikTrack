/**
 * Unified App Initializer Unit Tests
 * ===================================
 * 
 * Unit tests for the Unified App Initializer system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Load the actual Unified App Initializer code
const initializerCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/unified-app-initializer.js'),
    'utf8'
);

describe('Unified App Initializer', () => {
    beforeAll(() => {
        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/test-page',
                search: '',
                hash: ''
            },
            writable: true
        });

        // Mock PACKAGE_MANIFEST
        global.window.PACKAGE_MANIFEST = {
            base: {
                scripts: []
            }
        };

        // Mock PAGE_CONFIGS
        global.window.PAGE_CONFIGS = {
            'test-page': {
                packages: ['base'],
                requiredGlobals: []
            }
        };

        // Evaluate the real code
        eval(initializerCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize UnifiedAppInitializer class', () => {
            expect(window.UnifiedAppInitializer).toBeDefined();
            expect(typeof window.UnifiedAppInitializer).toBe('function');
        });

        test('should create instance', () => {
            const instance = new window.UnifiedAppInitializer();
            expect(instance).toBeDefined();
            expect(instance.initialized).toBe(false);
        });
    });
});

