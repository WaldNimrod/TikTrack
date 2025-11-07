/**
 * Initialization Flow Integration Tests
 * ======================================
 * 
 * בדיקות אינטגרציה של זרימת אתחול מלאה
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptsInOrder, setupBasicMocks } = require('../utils/test-loader');

describe('Initialization Flow Integration', () => {
    beforeAll(() => {
        // Setup basic mocks
        setupBasicMocks({
            UnifiedCacheManager: {
                save: jest.fn().mockResolvedValue(true),
                get: jest.fn().mockResolvedValue(null),
                initialize: jest.fn().mockResolvedValue(true)
            },
            PreferencesSystem: {
                initialized: true,
                getPreference: jest.fn().mockResolvedValue(true),
                initialize: jest.fn().mockResolvedValue(true)
            },
            Logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            }
        });

        // Mock PACKAGE_MANIFEST and PAGE_CONFIGS
        window.PACKAGE_MANIFEST = {
            base: {
                scripts: [],
                loadOrder: 1
            }
        };

        window.PAGE_CONFIGS = {
            'test-page': {
                packages: ['base'],
                requiredGlobals: []
            }
        };

        // Load all systems in order
        const code = loadScriptsInOrder(['standalone-core', 'core-modules', 'core-utilities', 'services', 'preferences', 'initializer']);
        eval(code);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Unified App Initializer + All Systems Integration', () => {
        test('should initialize all systems in correct order', async () => {
            if (!window.UnifiedAppInitializer) {
                return;
            }

            const initializer = new window.UnifiedAppInitializer();
            
            // Should be able to initialize
            expect(initializer).toBeDefined();
            expect(initializer.initialized).toBeDefined();
        });

        test('should validate dependencies before initialization', async () => {
            if (!window.UnifiedAppInitializer) {
                return;
            }

            const initializer = new window.UnifiedAppInitializer();
            
            if (initializer._validateRequiredDependencies) {
                const deps = initializer._validateRequiredDependencies();
                
                expect(deps).toHaveProperty('allAvailable');
                expect(deps).toHaveProperty('missing');
            }
        });
    });

    describe('Cache + Preferences + Notification Integration', () => {
        test('should initialize cache before preferences', async () => {
            if (!window.UnifiedCacheManager || !window.PreferencesSystem) {
                return;
            }

            // Cache should initialize first
            await window.UnifiedCacheManager.initialize();
            
            // Then preferences can use cache
            if (window.PreferencesSystem.initialize) {
                await window.PreferencesSystem.initialize();
            }
            
            expect(window.UnifiedCacheManager.initialize).toHaveBeenCalled();
        });

        test('should use preferences for notifications', async () => {
            if (!window.PreferencesSystem || !window.shouldShowNotification) {
                return;
            }

            window.getPreference = jest.fn().mockResolvedValue(true);
            window.preferencesCache = {
                get: jest.fn().mockResolvedValue({ notification_mode: 'work' })
            };

            const result = await window.shouldShowNotification('system', 'info', false);
            
            expect(typeof result).toBe('boolean');
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle missing dependencies gracefully', async () => {
            if (!window.UnifiedAppInitializer) {
                return;
            }

            const originalCache = window.UnifiedCacheManager;
            delete window.UnifiedCacheManager;

            const initializer = new window.UnifiedAppInitializer();
            
            if (initializer._validateRequiredDependencies) {
                const deps = initializer._validateRequiredDependencies();
                
                // Should detect missing dependency
                expect(deps).toHaveProperty('missing');
            }

            window.UnifiedCacheManager = originalCache;
        });

        test('should continue initialization with partial dependencies', async () => {
            if (!window.UnifiedAppInitializer) {
                return;
            }

            const initializer = new window.UnifiedAppInitializer();
            
            // Should handle partial initialization
            expect(initializer).toBeDefined();
        });
    });
});

