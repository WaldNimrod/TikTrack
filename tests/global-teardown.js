/**
 * Jest Global Teardown - TikTrack
 * ================================
 * 
 * Global teardown that runs once after all tests
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

module.exports = async () => {
    console.log('🧹 Cleaning up global test environment...');
    
    // Clean up global test data
    if (global.testData) {
        global.testData.users = [];
        global.testData.pages = [];
        global.testData.systems = [];
        global.testData.errors = [];
    }
    
    // Clean up global test utilities
    if (global.testUtils) {
        delete global.testUtils;
    }
    
    // Clean up global test configuration
    if (global.testConfig) {
        delete global.testConfig;
    }
    
    // Reset environment variables
    delete process.env.TEST_MODE;
    
    console.log('✅ Global test environment cleanup complete');
};
