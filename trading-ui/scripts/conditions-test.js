/**
 * Conditions System Testing Page - TikTrack
 * =========================================
 * 
 * עמוד בדיקה מקיף למערכת התנאים והסיבות
 * משתמש במערכת הלוגים המאוחדת הקיימת
 * 
 * @version 1.0.0
 * @lastUpdated October 2025
 * @author TikTrack Development Team
 */

class ConditionsTestManager {
    constructor() {
        this.initialized = false;
        this.testResults = {};
        this.logEntries = [];
        this.testStartTime = null;
        this.currentTest = null;
        
        // Test configurations
        this.tests = {
            'load-methods': {
                name: 'טעינת שיטות מסחר',
                description: 'טעינת 6 השיטות מה-API',
                apiEndpoint: '/api/trading-methods/',
                method: 'GET'
            },
            'create-condition': {
                name: 'יצירת תנאי חדש',
                description: 'יצירת תנאי חדש עם פרמטרים',
                apiEndpoint: '/api/plan-conditions/trade-plans/1/conditions',
                method: 'POST',
                testData: {
                    method_id: 1,
                    parameters_json: {
                        ma_period: 50,
                        ma_type: 'SMA'
                    }
                },
                requiresSetup: true,
                setupFunction: 'getTradePlanId'
            },
            'read-conditions': {
                name: 'קריאת תנאים קיימים',
                description: 'קריאת תנאים מ-Trade Plan',
                apiEndpoint: '/api/plan-conditions/trade-plans/1/conditions',
                method: 'GET',
                requiresSetup: true,
                setupFunction: 'getTradePlanId'
            },
            'edit-condition': {
                name: 'עריכת תנאי',
                description: 'עריכת תנאי קיים',
                apiEndpoint: '/api/plan-conditions',
                method: 'PUT',
                testData: {
                    id: null, // Will be set dynamically
                    method_id: 1,
                    parameters_json: {
                        ma_period: 100,
                        ma_type: 'EMA'
                    }
                }
            },
            'delete-condition': {
                name: 'מחיקת תנאי',
                description: 'מחיקת תנאי קיים',
                apiEndpoint: '/api/plan-conditions',
                method: 'DELETE',
                testData: {
                    id: null // Will be set dynamically
                }
            },
            'create-alert': {
                name: 'יצירת התראה מתנאי',
                description: 'יצירת התראה מתנאי קיים',
                apiEndpoint: '/api/alerts',
                method: 'POST',
                testData: {
                    related_id: null, // Will be set dynamically (condition ID)
                    message: 'Test alert from condition',
                    condition_attribute: 'price',
                    condition_operator: 'more_than',
                    condition_number: '0'
                }
            },
            'inheritance-test': {
                name: 'בדיקת ירושה',
                description: 'העתקת תנאים מתכנית לטרייד',
                apiEndpoint: '/api/trade-conditions/trades/1/conditions',
                method: 'POST',
                testData: {
                    method_id: 1,
                    parameters_json: {
                        ma_period: 50,
                        ma_type: 'SMA'
                    }
                }
            }
        };
    }

    /**
     * Initialize the testing system
     */
    async initialize() {
        console.log('🔧 initialize() called');
        
        if (this.initialized) {
            console.log('🔧 Already initialized, returning');
            return;
        }
        
        try {
            console.log('🔧 Starting initialization...');
            await this.logWithUnifiedSystem('info', 'מערכת בדיקת תנאים מאותחלת...', 'development');
            
            // Setup event listeners
            console.log('🔧 Setting up event listeners...');
            this.setupEventListeners();
            
            // Initialize test results
            console.log('🔧 Initializing test results...');
            this.initializeTestResults();
            
            this.initialized = true;
            console.log('🔧 Initialization complete!');
            await this.logWithUnifiedSystem('info', 'מערכת בדיקת תנאים מוכנה לשימוש', 'development');
            
        } catch (error) {
            console.error('🔧 Initialization error:', error);
            await this.logWithUnifiedSystem('error', `שגיאה באתחול: ${error.message}`, 'system');
            throw error;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Run test buttons
        const runTestButtons = document.querySelectorAll('.run-test-btn');
        console.log(`🔧 Found ${runTestButtons.length} run test buttons`);
        
        runTestButtons.forEach((btn, index) => {
            console.log(`🔧 Setting up button ${index + 1}:`, btn.dataset.test);
            btn.addEventListener('click', (e) => {
                console.log('🔧 Button clicked:', e.target);
                const testId = e.target.closest('.run-test-btn').dataset.test;
                console.log('🔧 Test ID:', testId);
                this.runTest(testId);
            });
        });

        // Run All Tests button
        document.getElementById('runAllTestsBtn').addEventListener('click', () => {
            this.runAllTests();
        });

        // Control buttons
        document.getElementById('clearLogsBtn').addEventListener('click', () => {
            this.clearLogs();
        });

        document.getElementById('copyLogBtn').addEventListener('click', () => {
            this.copyLog('formatted');
        });

        document.getElementById('copyFormattedBtn').addEventListener('click', () => {
            this.copyLog('formatted');
        });

        document.getElementById('copyRawBtn').addEventListener('click', () => {
            this.copyLog('raw');
        });

        document.getElementById('resetAllBtn').addEventListener('click', () => {
            this.resetAll();
        });
    }

    /**
     * Initialize test results
     */
    initializeTestResults() {
        Object.keys(this.tests).forEach(testId => {
            this.testResults[testId] = {
                status: 'pending',
                duration: 0,
                startTime: null,
                endTime: null,
                error: null,
                data: null
            };
        });
    }

    /**
     * Run all tests sequentially
     */
    async runAllTests() {
        try {
            await this.logWithUnifiedSystem('info', 'מתחיל להריץ את כל הבדיקות...', 'development');
            
            const testIds = Object.keys(this.tests);
            
            for (const testId of testIds) {
                await this.runTest(testId);
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            await this.logWithUnifiedSystem('success', 'כל הבדיקות הושלמו!', 'development');
            
        } catch (error) {
            await this.logWithUnifiedSystem('error', `שגיאה בהרצת כל הבדיקות: ${error.message}`, 'system');
        }
    }

    /**
     * Run a specific test
     */
    async runTest(testId) {
        console.log('🔧 runTest called with testId:', testId);
        
        if (!this.tests[testId]) {
            console.log('🔧 Test not found:', testId);
            await this.logWithUnifiedSystem('error', `בדיקה לא נמצאה: ${testId}`, 'system');
            return;
        }
        
        console.log('🔧 Test found, starting...');

        const test = this.tests[testId];
        const testElement = document.querySelector(`[data-test="${testId}"]`);
        
        // Get test number based on testId
        const testNumbers = {
            'load-methods': '1',
            'create-condition': '2', 
            'read-conditions': '3',
            'edit-condition': '4',
            'delete-condition': '5',
            'create-alert': '6',
            'inheritance-test': '7'
        };
        
        const testNumber = testNumbers[testId] || '1';
        const statusElement = document.getElementById(`status-${testNumber}`);
        const durationElement = document.getElementById(`duration-${testNumber}`);

        try {
            // Update status to running
            this.testResults[testId].status = 'running';
            this.testResults[testId].startTime = Date.now();
            statusElement.textContent = '🔵';
            statusElement.className = 'test-status running';

            await this.logWithUnifiedSystem('info', `Test ${this.getTestNumber(testId)} - ${test.name}`, 'development');
            await this.logWithUnifiedSystem('info', `תיאור: ${test.description}`, 'development');

            // Prepare test data
            let testData = test.testData || {};
            
            // Handle setup functions
            if (test.requiresSetup && test.setupFunction) {
                if (test.setupFunction === 'getTradePlanId') {
                    await this.logWithUnifiedSystem('info', `🔧 Getting trade plan ID for test...`, 'development');
                    const tradePlanId = await this.getTradePlanId();
                    await this.logWithUnifiedSystem('info', `🔧 Using trade plan ID: ${tradePlanId}`, 'development');
                    test.apiEndpoint = test.apiEndpoint.replace('/1/', `/${tradePlanId}/`);
                }
            }
            
            if (testId === 'edit-condition' || testId === 'delete-condition') {
                // Get condition ID from previous test or create a new one
                const createResult = this.testResults['create-condition'];
                if (createResult && createResult.data && createResult.data.id) {
                    testData.id = createResult.data.id;
                } else {
                    // Create a new condition first
                    await this.logWithUnifiedSystem('info', '🔧 Creating condition for edit/delete test...', 'development');
                    const createTest = this.tests['create-condition'];
                    const createTestData = { ...createTest.testData };
                    
                    // Setup trade plan ID if needed
                    if (createTest.requiresSetup && createTest.setupFunction === 'getTradePlanId') {
                        const tradePlanId = await this.getTradePlanId();
                        createTestData.trade_plan_id = tradePlanId;
                    }
                    
                    const createResponse = await this.makeApiCall(createTest.apiEndpoint, createTest.method, createTestData);
                    if (createResponse && createResponse.data && createResponse.data.id) {
                        testData.id = createResponse.data.id;
                        await this.logWithUnifiedSystem('info', `🔧 Created condition with ID: ${testData.id}`, 'development');
                    } else {
                        throw new Error('לא הצלחנו ליצור תנאי לעריכה/מחיקה');
                    }
                }
            }

            if (testId === 'create-alert') {
               // Get condition ID from previous test or create a new one
               const createResult = this.testResults['create-condition'];
               if (createResult && createResult.data && createResult.data.id) {
                   testData.related_id = createResult.data.id;
               } else {
                    // Create a new condition first
                    await this.logWithUnifiedSystem('info', '🔧 Creating condition for alert test...', 'development');
                    const createTest = this.tests['create-condition'];
                    const createTestData = { ...createTest.testData };
                    
                    // Setup trade plan ID if needed
                    if (createTest.requiresSetup && createTest.setupFunction === 'getTradePlanId') {
                        const tradePlanId = await this.getTradePlanId();
                        createTestData.trade_plan_id = tradePlanId;
                    }
                    
                   const createResponse = await this.makeApiCall(createTest.apiEndpoint, createTest.method, createTestData);
                   if (createResponse && createResponse.data && createResponse.data.id) {
                       testData.related_id = createResponse.data.id;
                       await this.logWithUnifiedSystem('info', `🔧 Created condition with ID: ${testData.related_id}`, 'development');
                   } else {
                       throw new Error('לא הצלחנו ליצור תנאי ליצירת התראה');
                   }
                }
            }

            // Build final endpoint with ID if needed
            let finalEndpoint = test.apiEndpoint;
            if ((testId === 'edit-condition' || testId === 'delete-condition') && testData.id) {
                finalEndpoint = `${test.apiEndpoint}/${testData.id}`;
            }

            // Make API call
            await this.logWithUnifiedSystem('info', `📡 API Call: ${test.method} ${finalEndpoint}`, 'development');
            if (testData && Object.keys(testData).length > 0) {
                await this.logWithUnifiedSystem('info', `📝 Test Data:`, 'development', testData);
            }

            const response = await this.makeApiCall(finalEndpoint, test.method, testData, test.queryParams);
            
            // Calculate duration
            this.testResults[testId].endTime = Date.now();
            this.testResults[testId].duration = this.testResults[testId].endTime - this.testResults[testId].startTime;
            this.testResults[testId].status = 'success';
            this.testResults[testId].data = response;

            // Update UI
            statusElement.textContent = '✅';
            statusElement.className = 'test-status success';
            durationElement.textContent = `${this.testResults[testId].duration}ms`;

            await this.logWithUnifiedSystem('success', `בדיקה הושלמה בהצלחה (${this.testResults[testId].duration}ms)`, 'development');
            await this.logWithUnifiedSystem('info', `תוצאה:`, 'development', response);

            // Update statistics
            this.updateStatistics();
            
            // Update info summary in top section
            this.updateInfoSummary();

        } catch (error) {
            // Update status to failed
            this.testResults[testId].status = 'failed';
            this.testResults[testId].endTime = Date.now();
            this.testResults[testId].duration = this.testResults[testId].endTime - this.testResults[testId].startTime;
            this.testResults[testId].error = error.message;

            // Update UI
            statusElement.textContent = '❌';
            statusElement.className = 'test-status error';
            durationElement.textContent = `${this.testResults[testId].duration}ms`;

            await this.logWithUnifiedSystem('error', `בדיקה נכשלה: ${error.message}`, 'system');
            await this.logWithUnifiedSystem('error', `פרטי שגיאה:`, 'system', error);

            // Update statistics
            this.updateStatistics();
        }
    }

    /**
     * Get trade plan ID for testing
     */
    async getTradePlanId() {
        try {
            // Use direct fetch to avoid infinite loop
            const response = await fetch('/api/trade_plans/');
            const data = await response.json();
            
            console.log('Trade plans response:', data);
            
            if (data && data.data && data.data.length > 0) {
                console.log('Found existing trade plan:', data.data[0].id);
                return data.data[0].id;
            } else {
                console.log('No trade plans found, creating new one...');
                // If no trade plans exist, create one first
                const createResponse = await fetch('/api/trade_plans/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: 'Test Plan for Conditions',
                        description: 'Test plan created for conditions testing',
                        account_id: 1
                    })
                });
                
                if (!createResponse.ok) {
                    console.error('Failed to create trade plan:', createResponse.status, createResponse.statusText);
                    const errorText = await createResponse.text();
                    console.error('Error response:', errorText);
                    return 1; // Fallback
                }
                
                const createData = await createResponse.json();
                console.log('Created new trade plan:', createData);
                return createData.data.id;
            }
        } catch (error) {
            console.warn('Could not get trade plan ID, using default ID 1:', error);
            return 1;
        }
    }

    /**
     * Make API call
     */
    async makeApiCall(endpoint, method, data = null, queryParams = null) {
        const url = new URL(endpoint, window.location.origin);
        
        // Add query parameters
        if (queryParams) {
            Object.keys(queryParams).forEach(key => {
                url.searchParams.append(key, queryParams[key]);
            });
        }

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get test number for display
     */
    getTestNumber(testId) {
        const testNumbers = {
            'load-methods': 1,
            'create-condition': 2,
            'read-conditions': 3,
            'edit-condition': 4,
            'delete-condition': 5,
            'create-alert': 6,
            'inheritance-test': 7
        };
        return testNumbers[testId] || '?';
    }

    /**
     * Log message using the unified notification system
     */
    async logWithUnifiedSystem(level, message, category = 'development', data = null) {
        try {
            // Use the unified logging system
            if (window.logWithCategory) {
                await window.logWithCategory(level, message, category, data);
            }
            
            // Also show notification for important messages
            if (level === 'error' && window.showErrorNotification) {
                window.showErrorNotification(message, 'בדיקת תנאים');
            } else if (level === 'success' && window.showSuccessNotification) {
                window.showSuccessNotification(message, 'בדיקת תנאים');
            } else if (level === 'warning' && window.showWarningNotification) {
                window.showWarningNotification(message, 'בדיקת תנאים');
            } else if (level === 'info' && window.showInfoNotification) {
                window.showInfoNotification(message, 'בדיקת תנאים');
            }
            
            // Store in local log entries for display
            const timestamp = new Date().toLocaleString('he-IL');
            const logEntry = {
                timestamp,
                level,
                message,
                data,
                category,
                id: Date.now() + Math.random()
            };

            this.logEntries.push(logEntry);
            this.displayLogEntry(logEntry);
            
        } catch (error) {
            console.error('Error in unified logging:', error);
            // Fallback to console
            console[level](`[${category.toUpperCase()}] ${message}`, data);
        }
    }

    /**
     * Legacy log function for backward compatibility
     */
    log(level, message, data = null) {
        this.logWithUnifiedSystem(level, message, 'development', data);
    }

    /**
     * Display log entry in the UI
     */
    displayLogEntry(logEntry) {
        const logContent = document.getElementById('logContent');
        const logElement = document.createElement('div');
        
        // Use unified system icons and colors
        const levelInfo = this.getUnifiedLevelInfo(logEntry.level);
        logElement.className = `log-entry ${levelInfo.class}`;
        logElement.dataset.logId = logEntry.id;
        
        let html = `
            <span class="log-timestamp">[${logEntry.timestamp}]</span>
            <span class="log-level">${levelInfo.icon} ${logEntry.level.toUpperCase()}:</span>
            <span class="log-message">${logEntry.message}</span>
        `;

        if (logEntry.category) {
            html += `<span class="log-category">[${logEntry.category}]</span>`;
        }

        if (logEntry.data) {
            html += `<div class="log-data">${JSON.stringify(logEntry.data, null, 2)}</div>`;
        }

        logElement.innerHTML = html;
        logContent.appendChild(logElement);

        // Auto-scroll to bottom
        logContent.scrollTop = logContent.scrollHeight;
    }

    /**
     * Get unified level info using the notification system
     */
    getUnifiedLevelInfo(level) {
        // Use the unified system's emoji and styling
        if (window.getLogEmoji) {
            const emoji = window.getLogEmoji(level);
            return {
                icon: emoji,
                class: level.toLowerCase()
            };
        }
        
        // Fallback to local definitions
        const fallbackLevels = {
            info: { icon: 'ℹ️', class: 'info' },
            success: { icon: '✅', class: 'success' },
            warning: { icon: '⚠️', class: 'warning' },
            error: { icon: '❌', class: 'error' },
            debug: { icon: '🔍', class: 'debug' },
            running: { icon: '🔵', class: 'running' }
        };
        
        return fallbackLevels[level] || fallbackLevels.info;
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logEntries = [];
        document.getElementById('logContent').innerHTML = '';
        this.logWithUnifiedSystem('info', 'לוגים נוקו', 'development');
    }

    /**
     * Copy log in specified format
     */
    copyLog(format) {
        if (this.logEntries.length === 0) {
            this.log('WARNING', 'אין לוגים להעתקה');
            return;
        }

        let logText = '';
        
        if (format === 'formatted') {
            // Copy as HTML
            const logContent = document.getElementById('logContent');
            logText = logContent.innerHTML;
        } else {
            // Copy as raw text
            logText = this.generateRawLog();
        }

        navigator.clipboard.writeText(logText).then(() => {
            this.logWithUnifiedSystem('success', `לוג הועתק ללוח (${format})`, 'development');
        }).catch(err => {
            this.logWithUnifiedSystem('error', `שגיאה בהעתקה: ${err.message}`, 'system');
        });
    }

    /**
     * Generate raw log text
     */
    generateRawLog() {
        let logText = '════════════════════════════════════════\n';
        logText += '🔧 Conditions System Test - Session Log\n';
        logText += `Time: ${new Date().toLocaleString('he-IL')}\n`;
        logText += '════════════════════════════════════════\n\n';

        this.logEntries.forEach(entry => {
            const levelInfo = this.getUnifiedLevelInfo(entry.level);
            logText += `[${entry.timestamp}] ${levelInfo.icon} ${entry.level.toUpperCase()}: ${entry.message}\n`;
            
            if (entry.category) {
                logText += `  Category: ${entry.category}\n`;
            }
            
            if (entry.data) {
                logText += `  Data: ${JSON.stringify(entry.data, null, 2)}\n`;
            }
        });

        logText += '\n════════════════════════════════════════\n';
        logText += '📊 Test Summary\n';
        logText += '════════════════════════════════════════\n';
        
        const stats = this.calculateStatistics();
        logText += `Total Tests: ${stats.total}\n`;
        logText += `Passed: ${stats.passed} ✅\n`;
        logText += `Failed: ${stats.failed} ❌\n`;
        logText += `Duration: ${stats.duration}s\n`;
        logText += `Success Rate: ${stats.successRate}%\n`;
        logText += '════════════════════════════════════════\n';

        return logText;
    }

    /**
     * Reset all tests
     */
    resetAll() {
        // Reset test results
        this.initializeTestResults();
        
        // Reset UI
        document.querySelectorAll('.test-status').forEach(el => {
            el.textContent = '⚪';
            el.className = 'test-status pending';
        });
        
        document.querySelectorAll('.test-duration').forEach(el => {
            el.textContent = '';
        });
        
        // Clear logs
        this.clearLogs();
        
        this.logWithUnifiedSystem('info', 'כל הבדיקות אופסו', 'development');
    }

    /**
     * Update statistics
     */
    updateStatistics() {
        const stats = this.calculateStatistics();
        
        const totalElement = document.getElementById('totalTests');
        const passedElement = document.getElementById('passedTests');
        const failedElement = document.getElementById('failedTests');
        const durationElement = document.getElementById('totalDuration');
        
        if (totalElement) totalElement.textContent = stats.total;
        if (passedElement) passedElement.textContent = stats.passed;
        if (failedElement) failedElement.textContent = stats.failed;
        if (durationElement) durationElement.textContent = `${stats.duration}s`;
    }

    /**
     * Calculate statistics
     */
    calculateStatistics() {
        const results = Object.values(this.testResults);
        const total = results.length;
        const passed = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;
        const totalDuration = results.reduce((sum, r) => sum + r.duration, 0) / 1000;
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        return { total, passed, failed, duration: totalDuration.toFixed(1), successRate };
    }

    /**
     * Update info summary in top section
     */
    updateInfoSummary() {
        const stats = this.calculateStatistics();
        
        // Update info summary elements
        const totalTestsEl = document.getElementById('totalTests');
        const passedTestsEl = document.getElementById('passedTests');
        const failedTestsEl = document.getElementById('failedTests');
        const totalDurationEl = document.getElementById('totalDuration');
        
        if (totalTestsEl) totalTestsEl.textContent = stats.total;
        if (passedTestsEl) passedTestsEl.textContent = stats.passed;
        if (failedTestsEl) failedTestsEl.textContent = stats.failed;
        if (totalDurationEl) totalDurationEl.textContent = `${stats.duration}s`;
    }
}

// Global instance
let conditionsTestManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔧 DOM Content Loaded, creating conditionsTestManager...');
    try {
        conditionsTestManager = new ConditionsTestManager();
        console.log('🔧 conditionsTestManager created:', conditionsTestManager);
        // Don't auto-initialize - let the unified system handle it
        window.conditionsTestManager = conditionsTestManager;
        console.log('🔧 conditionsTestManager assigned to window');
    } catch (error) {
        console.error('🔧 Failed to create conditions test manager:', error);
    }
});

// Export for global access
window.conditionsTestManager = conditionsTestManager;
