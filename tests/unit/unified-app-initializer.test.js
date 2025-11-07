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

const { loadScriptWithDependencies, setupBasicMocks } = require('../utils/test-loader');

describe('Unified App Initializer', () => {
    beforeAll(() => {
        // Setup basic mocks (location is already set up there)
        setupBasicMocks();

        // Update location for this specific test
        try {
            Object.defineProperty(window, 'location', {
                value: {
                    pathname: '/test-page',
                    search: '',
                    hash: ''
                },
                writable: true,
                configurable: true
            });
        } catch (e) {
            // If redefinition fails, location was already set correctly
            window.location.pathname = '/test-page';
            window.location.search = '';
            window.location.hash = '';
        }

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

        // Load with dependencies using test loader
        const code = loadScriptWithDependencies('scripts/unified-app-initializer.js');
        eval(code);
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

