module.exports = {
    // Test environment
    testEnvironment: 'jsdom',
    
    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js'
    ],
    
    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'text', 'lcov'],
    collectCoverageFrom: [
        'trading-ui/scripts/**/*.js',
        '!trading-ui/scripts/import-user-data.js',
        '!trading-ui/scripts/**/*-old*.js',
        '!trading-ui/scripts/**/backup/**/*.js',
        '!trading-ui/scripts/**/archive/**/*.js',
        '!trading-ui/scripts/backup/**/*.js',
        '!trading-ui/scripts/archive/**/*.js',
        '!trading-ui/scripts/**/*.min.js',
        '!trading-ui/scripts/**/*.bundle.js',
        '!trading-ui/scripts/**/*.test.js',
        '!trading-ui/scripts/**/*.spec.js'
    ],
    
    // Coverage thresholds
    // Gradual coverage increase plan
    // Phase 1 (Completed): 0% - Building test infrastructure
    // Phase 2 (Current): 40% - Core systems covered
    // Phase 3 (Target: Q2 2025): 60% - All critical systems covered
    // Phase 4 (Target: Q3 2025): 80% - Full coverage target
    // See: documentation/02-ARCHITECTURE/FRONTEND/TESTING_SCOPE.md
    coverageThreshold: {
        global: {
            branches: 40,
            functions: 40,
            lines: 40,
            statements: 40
        }
    },
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Module name mapping
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/trading-ui/$1',
        '^@scripts/(.*)$': '<rootDir>/trading-ui/scripts/$1',
        '^@styles/(.*)$': '<rootDir>/trading-ui/styles/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1'
    },
    
    // Transform configuration
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    
    // Test timeout
    testTimeout: 10000,
    
    // Verbose output
    verbose: true,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Reset mocks between tests
    resetMocks: true,
    
    // Restore mocks between tests
    restoreMocks: true,
    
    // Global setup
    globalSetup: '<rootDir>/tests/global-setup.js',
    
    // Global teardown
    globalTeardown: '<rootDir>/tests/global-teardown.js',
    
    // Test results processor
    testResultsProcessor: '<rootDir>/tests/results-processor.js',
    
    // Coverage path ignore patterns
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/backup/',
        '/archive/',
        '/_Tmp/',
        '/coverage/',
        '/tests/'
    ],
    
    // Test path ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/backup/',
        '/archive/',
        '/_Tmp/',
        '/coverage/'
    ],
    
    // Module file extensions
    moduleFileExtensions: ['js', 'json', 'node'],
    
    // Test environment options
    testEnvironmentOptions: {
        url: 'http://localhost:8080'
    },
    
    // Globals
    globals: {
        'window': {},
        'document': {},
        'navigator': {},
        'TextEncoder': {},
        'TextDecoder': {},
        'Logger': {},
        'UnifiedCacheManager': {},
        'showNotification': {},
        'showSuccessNotification': {},
        'showErrorNotification': {},
        'showWarningNotification': {},
        'showInfoNotification': {},
        'FieldRendererService': {},
        'ButtonSystem': {},
        'TableSystem': {},
        'ChartSystem': {}
    },
    
    // Test suites
    projects: [
        {
            displayName: 'unit',
            testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
            testEnvironment: 'jsdom'
        },
        {
            displayName: 'integration',
            testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
            testEnvironment: 'jsdom'
        },
        {
            displayName: 'e2e',
            testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
            testEnvironment: 'jsdom'
        }
    ]
};
