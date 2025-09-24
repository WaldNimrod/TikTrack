/**
 * Test Initialization System - TikTrack
 * ====================================
 *
 * בדיקת מערכת האתחול החדשה
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== TEST INITIALIZATION SYSTEM =====

class TestInitializationSystem {
    constructor() {
        this.testResults = [];
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Run comprehensive initialization tests
     */
    async runTests() {
        console.log('🧪 Starting Initialization System Tests...');
        this.startTime = Date.now();
        
        try {
            // Test 1: Basic initialization
            await this.testBasicInitialization();
            
            // Test 2: Page detection
            await this.testPageDetection();
            
            // Test 3: System detection
            await this.testSystemDetection();
            
            // Test 4: Performance
            await this.testPerformance();
            
            // Test 5: Error handling
            await this.testErrorHandling();
            
            this.endTime = Date.now();
            this.logTestResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.addTestResult('Test Suite', false, error.message);
        }
    }

    /**
     * Test basic initialization
     */
    async testBasicInitialization() {
        console.log('🔧 Testing basic initialization...');
        
        try {
            // Test if unified app initializer is available
            if (typeof window.UnifiedAppInitializer === 'undefined') {
                throw new Error('UnifiedAppInitializer not available');
            }
            
            // Test if global instance exists
            if (typeof window.unifiedAppInit === 'undefined') {
                throw new Error('unifiedAppInit global instance not available');
            }
            
            // Test if main function exists
            if (typeof window.initializeUnifiedApp === 'undefined') {
                throw new Error('initializeUnifiedApp function not available');
            }
            
            this.addTestResult('Basic Initialization', true, 'All components available');
            
        } catch (error) {
            this.addTestResult('Basic Initialization', false, error.message);
        }
    }

    /**
     * Test page detection
     */
    async testPageDetection() {
        console.log('🔍 Testing page detection...');
        
        try {
            const pageInfo = window.unifiedAppInit.detectPageInfo();
            
            if (!pageInfo.name) {
                throw new Error('Page name not detected');
            }
            
            if (!pageInfo.type) {
                throw new Error('Page type not detected');
            }
            
            if (!pageInfo.requirements) {
                throw new Error('Page requirements not detected');
            }
            
            this.addTestResult('Page Detection', true, `Detected: ${pageInfo.name} (${pageInfo.type})`);
            
        } catch (error) {
            this.addTestResult('Page Detection', false, error.message);
        }
    }

    /**
     * Test system detection
     */
    async testSystemDetection() {
        console.log('🔧 Testing system detection...');
        
        try {
            const systems = window.unifiedAppInit.detectAvailableSystems();
            
            if (systems.size === 0) {
                throw new Error('No systems detected');
            }
            
            // Check for essential systems
            const essentialSystems = ['uiUtils', 'notifications'];
            const missingSystems = essentialSystems.filter(system => !systems.has(system));
            
            if (missingSystems.length > 0) {
                console.warn(`⚠️ Missing essential systems: ${missingSystems.join(', ')}`);
            }
            
            this.addTestResult('System Detection', true, `Detected ${systems.size} systems`);
            
        } catch (error) {
            this.addTestResult('System Detection', false, error.message);
        }
    }

    /**
     * Test performance
     */
    async testPerformance() {
        console.log('⚡ Testing performance...');
        
        try {
            // Reset and test initialization time
            window.unifiedAppInit.reset();
            
            const startTime = Date.now();
            await window.initializeUnifiedApp();
            const endTime = Date.now();
            
            const totalTime = endTime - startTime;
            
            if (totalTime > 5000) {
                throw new Error(`Initialization too slow: ${totalTime}ms`);
            }
            
            this.addTestResult('Performance', true, `Initialization completed in ${totalTime}ms`);
            
        } catch (error) {
            this.addTestResult('Performance', false, error.message);
        }
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('🛡️ Testing error handling...');
        
        try {
            // Test error handler registration
            let errorCaught = false;
            
            window.unifiedAppInit.addErrorHandler((error) => {
                errorCaught = true;
            });
            
            // Simulate an error
            try {
                throw new Error('Test error');
            } catch (error) {
                window.unifiedAppInit.handleError(error);
            }
            
            if (!errorCaught) {
                throw new Error('Error handler not triggered');
            }
            
            this.addTestResult('Error Handling', true, 'Error handlers working correctly');
            
        } catch (error) {
            this.addTestResult('Error Handling', false, error.message);
        }
    }

    /**
     * Add test result
     */
    addTestResult(testName, passed, message) {
        this.testResults.push({
            name: testName,
            passed: passed,
            message: message,
            timestamp: Date.now()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${message}`);
    }

    /**
     * Log test results
     */
    logTestResults() {
        const totalTime = this.endTime - this.startTime;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const totalTests = this.testResults.length;
        
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${totalTests - passedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        console.log(`Total Time: ${totalTime}ms`);
        
        console.log('\n📋 Detailed Results:');
        this.testResults.forEach(test => {
            const status = test.passed ? '✅' : '❌';
            console.log(`${status} ${test.name}: ${test.message}`);
        });
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            const message = `Tests completed: ${passedTests}/${totalTests} passed`;
            const type = passedTests === totalTests ? 'success' : 'warning';
            window.showNotification(message, type);
        }
    }

    /**
     * Get test results
     */
    getResults() {
        return {
            results: this.testResults,
            totalTime: this.endTime - this.startTime,
            passed: this.testResults.filter(test => test.passed).length,
            total: this.testResults.length
        };
    }
}

// ===== GLOBAL INSTANCE =====

window.TestInitializationSystem = TestInitializationSystem;
window.testInitSystem = new TestInitializationSystem();

// ===== GLOBAL EXPORT =====

window.runInitializationTests = async function() {
    return await window.testInitSystem.runTests();
};

window.getTestResults = function() {
    return window.testInitSystem.getResults();
};

