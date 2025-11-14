/**
 * Jest Base Configuration
 * -----------------------
 * Shared settings and helpers for TikTrack Jest projects.
 *
 * @version 1.0.0
 */

const path = require('path');

const SHARED_MODULE_MAPPER = {
    '^@/(.*)$': '<rootDir>/trading-ui/$1',
    '^@scripts/(.*)$': '<rootDir>/trading-ui/scripts/$1',
    '^@styles/(.*)$': '<rootDir>/trading-ui/styles/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
};

const SHARED_TRANSFORM = {
    '^.+\\.js$': 'babel-jest'
};

const SHARED_ENV_OPTIONS = {
    url: 'http://localhost:8080'
};

const SHARED_IGNORE_PATTERNS = [
    '/node_modules/',
    '/backup/',
    '/archive/',
    '/_Tmp/',
    '/coverage/'
];

const baseProjectConfig = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    moduleNameMapper: SHARED_MODULE_MAPPER,
    transform: SHARED_TRANSFORM,
    testEnvironmentOptions: SHARED_ENV_OPTIONS,
    testPathIgnorePatterns: SHARED_IGNORE_PATTERNS,
    coveragePathIgnorePatterns: [
        ...SHARED_IGNORE_PATTERNS,
        '/tests/',
        '/scripts/external_data_integration_client/'
    ],
    globalSetup: '<rootDir>/tests/global-setup.js',
    globalTeardown: '<rootDir>/tests/global-teardown.js',
    detectOpenHandles: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    testTimeout: 15000
};

const createProject = (overrides = {}) => ({
    ...baseProjectConfig,
    ...overrides
});

const unitProject = createProject({
    displayName: 'unit',
    testMatch: ['<rootDir>/tests/unit/**/*.test.js']
});

const integrationProject = createProject({
    displayName: 'integration',
    testMatch: ['<rootDir>/tests/integration/**/*.test.js']
});

const componentProject = createProject({
    displayName: 'component',
    testMatch: [
        '<rootDir>/tests/e2e/**/*.test.js',
        '<rootDir>/tests/pages/**/*.test.js'
    ],
    testTimeout: 20000
});

const combinedCoverageProject = createProject({
    displayName: 'combined',
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: path.join('<rootDir>', 'coverage'),
    coverageReporters: ['html', 'text', 'lcov'],
    collectCoverageFrom: [
        'trading-ui/scripts/**/*.js',
        '!trading-ui/scripts/**/*.backup.js',
        '!trading-ui/scripts/**/__mocks__/**',
        '!trading-ui/scripts/external_data_integration_client/**'
    ],
    coverageThreshold: {
        global: {
            branches: 20,
            functions: 30,
            lines: 30,
            statements: 25
        }
    }
});

module.exports = {
    baseProjectConfig,
    createProject,
    unitProject,
    integrationProject,
    componentProject,
    combinedCoverageProject
};

