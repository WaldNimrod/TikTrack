// ====================================================================================================
// LINTER COMPREHENSIVE TESTING SYSTEM
// ====================================================================================================
// 
// מערכת בדיקות מקיפה עבור מערכת הלינטר
// מופרדת מהקובץ הראשי לשיפור ארגון הקוד

/**
 * COMPREHENSIVE TESTING AND OPTIMIZATION SYSTEM
 * Performs full system validation and optimization
 */
async function runComprehensiveTests() {
    try {
        // Starting comprehensive system tests...
        addLogEntry('INFO', 'Starting comprehensive system tests', { testType: 'full' });

        const testResults = {
            timestamp: new Date().toISOString(),
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            warnings: 0,
            performance: {},
            security: {},
            functionality: {},
            recommendations: []
        };

        // Test 1: System Components
        const componentTests = await testSystemComponents();
        testResults.totalTests += componentTests.total;
        testResults.passedTests += componentTests.passed;
        testResults.failedTests += componentTests.failed;
        testResults.warnings += componentTests.warnings;

        // Test 2: Performance
        const performanceTests = await testPerformance();
        testResults.performance = performanceTests;
        testResults.totalTests += performanceTests.total;
        testResults.passedTests += performanceTests.passed;
        testResults.failedTests += performanceTests.failed;

        // Test 3: Security
        const securityTests = await testSecurity();
        testResults.security = securityTests;
        testResults.totalTests += securityTests.total;
        testResults.passedTests += securityTests.passed;
        testResults.failedTests += securityTests.failed;

        // Test 4: Functionality
        const functionalityTests = await testFunctionality();
        testResults.functionality = functionalityTests;
        testResults.totalTests += functionalityTests.total;
        testResults.passedTests += functionalityTests.passed;
        testResults.failedTests += functionalityTests.failed;

        // Test 5: Data Integrity
        const dataIntegrityTests = await testDataIntegrity();
        testResults.totalTests += dataIntegrityTests.total;
        testResults.passedTests += dataIntegrityTests.passed;
        testResults.failedTests += dataIntegrityTests.failed;

        // Generate recommendations
        testResults.recommendations = generateTestRecommendations(testResults);

        // Comprehensive tests completed
        addLogEntry('SUCCESS', `Comprehensive tests completed: ${testResults.passedTests}/${testResults.totalTests} passed`, testResults);

        // Save results
        await saveTestResults(testResults);

        // Display results
        displayTestResults(testResults);

        return testResults;

    } catch (error) {
        addLogEntry('ERROR', 'Failed to run comprehensive tests', { error: error.message });
        throw error;
    }
}

async function testSystemComponents() {
    const tests = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    // Test IndexedDB availability
    tests.push({
        name: 'IndexedDB Availability',
        status: typeof window.indexedDB !== 'undefined' ? 'PASS' : 'FAIL',
        message: typeof window.indexedDB !== 'undefined' ? 'IndexedDB is available' : 'IndexedDB not supported'
    });

    // Test Chart.js availability
    tests.push({
        name: 'Chart.js Library',
        status: typeof window.Chart !== 'undefined' ? 'PASS' : 'FAIL',
        message: typeof window.Chart !== 'undefined' ? 'Chart.js is loaded' : 'Chart.js not found'
    });

    // Test notification system
    tests.push({
        name: 'Notification System',
        status: typeof window.showSuccessNotification === 'function' ? 'PASS' : 'WARN',
        message: typeof window.showSuccessNotification === 'function' ? 'Notification system available' : 'Notification system not found'
    });

    // Test data collector
    tests.push({
        name: 'Data Collector',
        status: typeof window.dataCollectorInstance !== 'undefined' ? 'PASS' : 'FAIL',
        message: typeof window.dataCollectorInstance !== 'undefined' ? 'Data collector initialized' : 'Data collector not found'
    });

    // Count results
    tests.forEach(test => {
        if (test.status === 'PASS') passed++;
        else if (test.status === 'FAIL') failed++;
        else if (test.status === 'WARN') warnings++;
    });

    return { tests, total: tests.length, passed, failed, warnings };
}

async function testPerformance() {
    const tests = [];
    let passed = 0;
    let failed = 0;

    // Test memory usage
    const memoryInfo = performance.memory || {};
    tests.push({
        name: 'Memory Usage',
        status: memoryInfo.usedJSHeapSize < 50000000 ? 'PASS' : 'WARN', // 50MB limit
        message: `Memory usage: ${Math.round((memoryInfo.usedJSHeapSize || 0) / 1024 / 1024)}MB`,
        value: memoryInfo.usedJSHeapSize
    });

    // Test DOM elements count
    const domElements = document.querySelectorAll('*').length;
    tests.push({
        name: 'DOM Elements',
        status: domElements < 1000 ? 'PASS' : 'WARN',
        message: `DOM elements: ${domElements}`,
        value: domElements
    });

    // Test script loading time
    const loadTime = performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : 0;
    tests.push({
        name: 'Page Load Time',
        status: loadTime < 3000 ? 'PASS' : 'WARN',
        message: `Load time: ${loadTime}ms`,
        value: loadTime
    });

    // Count results
    tests.forEach(test => {
        if (test.status === 'PASS') passed++;
        else failed++;
    });

    return { tests, total: tests.length, passed, failed };
}

async function testSecurity() {
    const tests = [];
    let passed = 0;
    let failed = 0;

    // Test for eval usage
    const hasEval = document.documentElement.innerHTML.includes('eval(');
    tests.push({
        name: 'No eval() usage',
        status: !hasEval ? 'PASS' : 'FAIL',
        message: hasEval ? 'eval() found - security risk' : 'No eval() usage detected'
    });

    // Test for inline event handlers
    const inlineEvents = document.querySelectorAll('[onclick], [onload], [onerror]').length;
    tests.push({
        name: 'Inline Event Handlers',
        status: inlineEvents === 0 ? 'PASS' : 'WARN',
        message: `${inlineEvents} inline event handlers found`
    });

    // Test HTTPS usage
    const isHttps = location.protocol === 'https:';
    tests.push({
        name: 'HTTPS Protocol',
        status: isHttps || location.hostname === 'localhost' ? 'PASS' : 'WARN',
        message: isHttps ? 'Using HTTPS' : 'Not using HTTPS (OK for localhost)'
    });

    // Count results
    tests.forEach(test => {
        if (test.status === 'PASS') passed++;
        else failed++;
    });

    return { tests, total: tests.length, passed, failed };
}

async function testFunctionality() {
    const tests = [];
    let passed = 0;
    let failed = 0;

    // Test file scanning functionality
    try {
        await analyzeFileContent('test.js', 'console.log("test");');
        tests.push({
            name: 'File Analysis',
            status: 'PASS',
            message: 'File analysis working correctly'
        });
        passed++;
    } catch (error) {
        tests.push({
            name: 'File Analysis',
            status: 'FAIL',
            message: `File analysis failed: ${error.message}`
        });
        failed++;
    }

    // Test statistics display
    const statsElements = ['totalFilesStats', 'totalErrorsStats', 'totalWarningsStats'];
    const statsWorking = statsElements.every(id => document.getElementById(id) !== null);
    tests.push({
        name: 'Statistics Display',
        status: statsWorking ? 'PASS' : 'FAIL',
        message: statsWorking ? 'Statistics elements found' : 'Statistics elements missing'
    });
    if (statsWorking) passed++; else failed++;

    // Test log system
    const logContainer = document.getElementById('logContainer');
    tests.push({
        name: 'Log System',
        status: logContainer ? 'PASS' : 'FAIL',
        message: logContainer ? 'Log container available' : 'Log container missing'
    });
    if (logContainer) passed++; else failed++;

    return { tests, total: tests.length, passed, failed };
}

async function testDataIntegrity() {
    const tests = [];
    let passed = 0;
    let failed = 0;

    // Test scanningResults structure
    const hasResults = typeof scanningResults === 'object' && 
                      Array.isArray(scanningResults.errors) && 
                      Array.isArray(scanningResults.warnings);
    tests.push({
        name: 'Scanning Results Structure',
        status: hasResults ? 'PASS' : 'FAIL',
        message: hasResults ? 'Results structure valid' : 'Invalid results structure'
    });
    if (hasResults) passed++; else failed++;

    // Test fixed issues tracking
    const hasFixedIssues = typeof fixedIssues === 'object' && 
                           fixedIssues.errors instanceof Set && 
                           fixedIssues.warnings instanceof Set;
    tests.push({
        name: 'Fixed Issues Tracking',
        status: hasFixedIssues ? 'PASS' : 'FAIL',
        message: hasFixedIssues ? 'Fixed issues tracking valid' : 'Invalid fixed issues structure'
    });
    if (hasFixedIssues) passed++; else failed++;

    // Test IndexedDB connectivity
    try {
        if (typeof window.IndexedDBAdapter !== 'undefined') {
            const adapter = new window.IndexedDBAdapter();
            await adapter.initialize();
            tests.push({
                name: 'IndexedDB Connection',
                status: 'PASS',
                message: 'IndexedDB connection successful'
            });
            passed++;
        } else {
            tests.push({
                name: 'IndexedDB Connection',
                status: 'WARN',
                message: 'IndexedDB adapter not available'
            });
            failed++;
        }
    } catch (error) {
        tests.push({
            name: 'IndexedDB Connection',
            status: 'FAIL',
            message: `IndexedDB connection failed: ${error.message}`
        });
        failed++;
    }

    return { tests, total: tests.length, passed, failed };
}

function generateTestRecommendations(testResults) {
    const recommendations = [];

    // Performance recommendations
    if (testResults.performance.tests) {
        testResults.performance.tests.forEach(test => {
            if (test.status === 'WARN') {
                recommendations.push({
                    category: 'Performance',
                    priority: 'Medium',
                    message: `Optimize ${test.name.toLowerCase()}: ${test.message}`
                });
            }
        });
    }

    // Security recommendations
    if (testResults.security.tests) {
        testResults.security.tests.forEach(test => {
            if (test.status === 'FAIL') {
                recommendations.push({
                    category: 'Security',
                    priority: 'High',
                    message: `Fix security issue: ${test.message}`
                });
            }
        });
    }

    // General recommendations
    if (testResults.failedTests > 0) {
        recommendations.push({
            category: 'General',
            priority: 'High',
            message: `Address ${testResults.failedTests} failed tests to improve system stability`
        });
    }

    return recommendations;
}

async function saveTestResults(testResults) {
    try {
        if (typeof window.IndexedDBAdapter !== 'undefined') {
            const adapter = new window.IndexedDBAdapter();
            await adapter.initialize();
            await adapter.saveTestResults(testResults);
            // Test results saved to IndexedDB
        }
    } catch (error) {
        addLogEntry('WARNING', 'Failed to save test results to IndexedDB', { error: error.message });
    }
}

function displayTestResults(testResults) {
    const passRate = (testResults.passedTests / testResults.totalTests) * 100;
    
    // Test Results Summary
    // Total Tests logged
    // Passed tests logged
    // Failed tests logged
    // Warnings logged
    // Pass Rate calculated

    if (testResults.recommendations.length > 0) {
        // Recommendations available
        testResults.recommendations.forEach((rec, index) => {
            // Recommendation logged
        });
    }

    // Update test results display
    updateTestResultsDisplay(testResults);
}

function updateTestResultsDisplay(testResults) {
    // Update test results in UI
    const testResultsContainer = document.getElementById('testResults');
    if (testResultsContainer) {
        const passRate = (testResults.passedTests / testResults.totalTests) * 100;
        
        testResultsContainer.innerHTML = `
            <div class="test-summary">
                <h4>בדיקות מערכת</h4>
                <div class="test-stats">
                    <span class="test-stat">סה"כ בדיקות: ${testResults.totalTests}</span>
                    <span class="test-stat success">עברו: ${testResults.passedTests}</span>
                    <span class="test-stat error">נכשלו: ${testResults.failedTests}</span>
                    <span class="test-stat warning">אזהרות: ${testResults.warnings}</span>
                    <span class="test-stat">אחוז הצלחה: ${passRate.toFixed(1)}%</span>
                </div>
            </div>
            <div class="test-recommendations">
                <h5>המלצות (${testResults.recommendations.length})</h5>
                ${testResults.recommendations.map(rec => 
                    `<div class="recommendation ${rec.priority.toLowerCase()}">
                        <strong>[${rec.priority}] ${rec.category}:</strong> ${rec.message}
                    </div>`
                ).join('')}
            </div>
        `;
    }
}

/**
 * QUICK HEALTH CHECK SYSTEM
 * Performs rapid system status check
 */
async function runQuickHealthCheck() {
    try {
        // Running quick health check...
        
        const healthCheck = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            issues: [],
            components: {
                indexedDB: typeof window.indexedDB !== 'undefined',
                chartJS: typeof window.Chart !== 'undefined',
                dataCollector: typeof window.dataCollectorInstance !== 'undefined',
                notifications: typeof window.showSuccessNotification === 'function'
            },
            memory: {
                used: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0,
                limit: performance.memory ? Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) : 0
            }
        };

        // Check for critical issues
        if (!healthCheck.components.indexedDB) {
            healthCheck.issues.push('IndexedDB not supported');
            healthCheck.status = 'warning';
        }

        if (!healthCheck.components.dataCollector) {
            healthCheck.issues.push('Data collector not initialized');
            healthCheck.status = 'warning';
        }

        if (healthCheck.memory.used > 100) { // 100MB
            healthCheck.issues.push('High memory usage detected');
            healthCheck.status = 'warning';
        }

        // Health Check Results available
        addLogEntry('INFO', `Health check completed: ${healthCheck.status}`, healthCheck);
        
        updateHealthCheckDisplay(healthCheck);
        
        return healthCheck;

    } catch (error) {
        addLogEntry('ERROR', 'Health check failed', { error: error.message });
        return { status: 'error', error: error.message };
    }
}

function updateHealthCheckDisplay(healthCheck) {
    const healthContainer = document.getElementById('healthStatus');
    if (healthContainer) {
        const statusClass = healthCheck.status === 'healthy' ? 'success' : 
                           healthCheck.status === 'warning' ? 'warning' : 'error';
        
        healthContainer.innerHTML = `
            <div class="health-status ${statusClass}">
                <h4>מצב מערכת: ${healthCheck.status}</h4>
                <div class="health-components">
                    <div>IndexedDB: ${healthCheck.components.indexedDB ? '✅' : '❌'}</div>
                    <div>Chart.js: ${healthCheck.components.chartJS ? '✅' : '❌'}</div>
                    <div>Data Collector: ${healthCheck.components.dataCollector ? '✅' : '❌'}</div>
                    <div>Notifications: ${healthCheck.components.notifications ? '✅' : '❌'}</div>
                </div>
                <div class="health-memory">
                    זיכרון: ${healthCheck.memory.used}MB / ${healthCheck.memory.limit}MB
                </div>
                ${healthCheck.issues.length > 0 ? `
                    <div class="health-issues">
                        <h5>בעיות:</h5>
                        ${healthCheck.issues.map(issue => `<div>• ${issue}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.runComprehensiveTests = runComprehensiveTests;
    window.runQuickHealthCheck = runQuickHealthCheck;
    window.testSystemComponents = testSystemComponents;
    window.testPerformance = testPerformance;
    window.testSecurity = testSecurity;
    window.testFunctionality = testFunctionality;
    window.testDataIntegrity = testDataIntegrity;
    window.generateTestRecommendations = generateTestRecommendations;
    window.saveTestResults = saveTestResults;
    window.displayTestResults = displayTestResults;
    window.updateTestResultsDisplay = updateTestResultsDisplay;
    window.updateHealthCheckDisplay = updateHealthCheckDisplay;
}
