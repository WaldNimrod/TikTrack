/**
 * Test Loader - TikTrack
 * ======================
 * 
 * Test loader that respects the unified initialization system loading order
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

/**
 * Loading order based on Unified Initialization System
 * Stage 1: Core Systems (BASE PACKAGE)
 * Stage 2: Services
 * Stage 3: UI Advanced
 * Stage 4: CRUD
 * Stage 5: Preferences
 */
const LOADING_ORDER = {
    // Stage 1: Core Systems (BASE PACKAGE) - loadOrder: 1
    'core': [
        'scripts/global-favicon.js',
        'scripts/notification-system.js',
        'scripts/ui-utils.js',
        'scripts/warning-system.js',
        'scripts/error-handlers.js',
        'scripts/unified-cache-manager.js',
        'scripts/cache-sync-manager.js',
        'scripts/header-system.js',
        'scripts/page-utils.js',
        'scripts/translation-utils.js',
        'scripts/button-icons.js',
        'scripts/button-system-init.js',
        'scripts/color-scheme-system.js'
    ],
    // Stage 2: Services - loadOrder: 2
    'services': [
        'scripts/services/data-collection-service.js',
        'scripts/services/field-renderer-service.js',
        'scripts/services/select-populator-service.js',
        'scripts/services/crud-response-handler.js',
        'scripts/services/default-value-setter.js',
        'scripts/services/linked-items-service.js'
    ],
    // Stage 3: UI Advanced - loadOrder: 3
    'ui-advanced': [
        'scripts/pagination-system.js',
        'scripts/info-summary-system.js',
        'scripts/modules/actions-menu-system.js'
    ],
    // Stage 4: CRUD - loadOrder: 4
    'crud': [
        'scripts/date-utils.js',
        'scripts/entity-details-api.js',
        'scripts/entity-details-renderer.js',
        'scripts/entity-details-modal.js'
    ],
    // Stage 5: Preferences - loadOrder: 5
    'preferences': [
        'scripts/preferences-core.js',
        'scripts/preferences-system.js'
    ],
    // Special: Event Handler Manager (needs to be early)
    'event-handler': [
        'scripts/event-handler-manager.js'
    ],
    // Special: Modal Manager V2 (needs services)
    'modal': [
        'scripts/modal-manager-v2.js',
        'scripts/modal-navigation-manager.js'
    ],
    // Special: Unified App Initializer (needs everything)
    'initializer': [
        'scripts/unified-app-initializer.js',
        'scripts/modules/core-systems.js'
    ]
};

/**
 * Load scripts in correct order respecting dependencies
 * @param {Array<string>} requiredStages - Stages to load (e.g., ['core', 'services'])
 * @param {string} basePath - Base path to trading-ui directory
 * @returns {string} Combined code
 */
function loadScriptsInOrder(requiredStages = ['core'], basePath = null) {
    if (!basePath) {
        basePath = path.join(__dirname, '../../trading-ui');
    }

    let combinedCode = '';
    const loadedFiles = new Set();
    const loadedFileNames = new Set(); // Track by filename to avoid duplicates

    // Always load core first if not explicitly included
    if (!requiredStages.includes('core')) {
        requiredStages = ['core', ...requiredStages];
    }

    // Load in order
    const stageOrder = ['core', 'event-handler', 'services', 'ui-advanced', 'crud', 'preferences', 'modal', 'initializer'];
    
    for (const stage of stageOrder) {
        if (!requiredStages.includes(stage)) {
            continue;
        }

        const scripts = LOADING_ORDER[stage] || [];
        for (const scriptPath of scripts) {
            const fullPath = path.join(basePath, scriptPath);
            const fileName = scriptPath.split('/').pop();
            
            // Skip if already loaded (by path or filename)
            if (loadedFiles.has(scriptPath) || loadedFileNames.has(fileName)) {
                continue;
            }

            if (fs.existsSync(fullPath)) {
                try {
                    const code = fs.readFileSync(fullPath, 'utf8');
                    combinedCode += `\n// === ${scriptPath} ===\n`;
                    combinedCode += code;
                    combinedCode += `\n// === End ${scriptPath} ===\n\n`;
                    loadedFiles.add(scriptPath);
                    loadedFileNames.add(fileName);
                } catch (error) {
                    console.warn(`Warning: Could not load ${scriptPath}:`, error.message);
                }
            } else {
                console.warn(`Warning: File not found: ${fullPath}`);
            }
        }
    }

    return combinedCode;
}

/**
 * Load a specific script with its dependencies
 * @param {string} scriptPath - Path to script (relative to trading-ui)
 * @param {string} basePath - Base path to trading-ui directory
 * @returns {string} Combined code with dependencies
 */
function loadScriptWithDependencies(scriptPath, basePath = null) {
    if (!basePath) {
        basePath = path.join(__dirname, '../../trading-ui');
    }

    // Determine which stages are needed based on script path
    const requiredStages = ['core']; // Always need core
    
    if (scriptPath.includes('service')) {
        requiredStages.push('services');
    }
    if (scriptPath.includes('modal')) {
        requiredStages.push('services', 'modal');
    }
    if (scriptPath.includes('entity-details')) {
        requiredStages.push('services', 'crud');
    }
    if (scriptPath.includes('pagination') || scriptPath.includes('info-summary')) {
        requiredStages.push('ui-advanced');
    }
    if (scriptPath.includes('unified-app-initializer') || scriptPath.includes('core-systems')) {
        requiredStages.push('services', 'ui-advanced', 'crud', 'preferences', 'modal', 'initializer');
    }
    if (scriptPath.includes('event-handler')) {
        requiredStages.push('event-handler');
    }
    if (scriptPath.includes('cache-sync')) {
        // cache-sync-manager needs unified-cache-manager which is in core
        requiredStages.push('core'); // Already included, but ensure unified-cache-manager loads first
    }
    if (scriptPath.includes('page-utils')) {
        requiredStages.push('core'); // Already included
    }
    if (scriptPath.includes('notification')) {
        // notification-system needs core systems but doesn't need services
        requiredStages.push('core'); // Already included
    }
    if (scriptPath.includes('ui-utils')) {
        requiredStages.push('core'); // Already included
    }

    // Load dependencies first
    let code = loadScriptsInOrder(requiredStages, basePath);

    // Check if the specific script was already loaded in dependencies
    const scriptFileName = scriptPath.split('/').pop();
    const alreadyLoaded = code.includes(`// === ${scriptPath} ===`) || 
                         code.includes(`// === scripts/`) && code.includes(`// === scripts/${scriptFileName}`);

    // Then load the specific script if not already loaded
    if (!alreadyLoaded) {
        const fullPath = path.join(basePath, scriptPath);
        if (fs.existsSync(fullPath)) {
            const scriptCode = fs.readFileSync(fullPath, 'utf8');
            code += `\n// === ${scriptPath} ===\n`;
            code += scriptCode;
            code += `\n// === End ${scriptPath} ===\n\n`;
        }
    }

    return code;
}

/**
 * Setup test environment with proper loading order
 * @param {Object} options - Setup options
 * @param {Array<string>} options.stages - Stages to load
 * @param {string} options.scriptPath - Specific script to load
 * @param {Object} options.mocks - Additional mocks to setup
 */
function setupTestEnvironment(options = {}) {
    const { stages = ['core'], scriptPath = null, mocks = {} } = options;

    // Setup basic mocks first
    setupBasicMocks(mocks);

    // Load scripts in order
    let code = '';
    if (scriptPath) {
        code = loadScriptWithDependencies(scriptPath);
    } else {
        code = loadScriptsInOrder(stages);
    }

    // Evaluate code
    eval(code);

    return code;
}

/**
 * Setup basic mocks required for all tests
 * @param {Object} additionalMocks - Additional mocks
 */
function setupBasicMocks(additionalMocks = {}) {
    // Ensure window exists
    if (!global.window) {
        global.window = {};
    }

    // Setup window.location BEFORE any code is loaded (to avoid redefinition errors)
    // Delete existing location if it exists and is configurable
    try {
        delete window.location;
    } catch (e) {
        // If delete fails, try to make it configurable first
        try {
            Object.defineProperty(window, 'location', {
                value: window.location,
                writable: true,
                configurable: true
            });
            delete window.location;
        } catch (e2) {
            // If still fails, just continue - will handle in individual tests
        }
    }

    // Set default location
    if (!window.location) {
        Object.defineProperty(window, 'location', {
            value: {
                href: 'http://localhost:8080',
                pathname: '/',
                search: '',
                hash: '',
                reload: jest.fn()
            },
            writable: true,
            configurable: true
        });
    }

    // Ensure document exists
    if (!global.document) {
        global.document = {
            createElement: jest.fn(),
            getElementById: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(() => []),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            body: {
                appendChild: jest.fn(),
                insertAdjacentHTML: jest.fn()
            },
            documentElement: {
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                style: {
                    setProperty: jest.fn(),
                    getPropertyValue: jest.fn()
                }
            }
        };
    }

    // Ensure localStorage exists
    if (!global.localStorage) {
        const storage = {};
        global.localStorage = {
            getItem: jest.fn((key) => storage[key] || null),
            setItem: jest.fn((key, value) => { storage[key] = value; }),
            removeItem: jest.fn((key) => { delete storage[key]; }),
            clear: jest.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); })
        };
    }

    // Ensure Logger exists
    if (!global.window.Logger) {
        global.window.Logger = {
            info: jest.fn((...args) => true),
            warn: jest.fn((...args) => true),
            error: jest.fn((...args) => true),
            debug: jest.fn((...args) => true)
        };
    }

    // Ensure fetch exists
    if (!global.fetch) {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
            text: () => Promise.resolve('{}')
        });
    }

    // Apply additional mocks
    Object.assign(global.window, additionalMocks);
}

module.exports = {
    loadScriptsInOrder,
    loadScriptWithDependencies,
    setupTestEnvironment,
    setupBasicMocks,
    LOADING_ORDER
};

