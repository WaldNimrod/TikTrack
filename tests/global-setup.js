/**
 * Jest Global Setup - TikTrack
 * ============================
 * 
 * Global setup that runs once before all tests
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

module.exports = async () => {
    console.log('🚀 Setting up global test environment...');
    
    // Set up global test environment variables
    process.env.NODE_ENV = 'test';
    process.env.TEST_MODE = 'true';
    process.env.BASE_URL = 'http://localhost:8080';
    
    // Set up global test configuration
    global.testConfig = {
        baseUrl: 'http://localhost:8080',
        timeout: 10000,
        retries: 3,
        debug: false
    };
    
    // Initialize global test data
    global.testData = {
        users: [],
        pages: [],
        systems: [],
        errors: []
    };
    
    // Set up global test utilities
    global.testUtils = {
        generateTestId: () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createTestUser: (overrides = {}) => ({
            id: global.testUtils.generateTestId(),
            name: 'Test User',
            email: 'test@example.com',
            ...overrides
        }),
        createTestPage: (overrides = {}) => ({
            id: global.testUtils.generateTestId(),
            name: 'Test Page',
            url: '/test',
            ...overrides
        })
    };
    
    console.log('✅ Global test environment setup complete');
};
