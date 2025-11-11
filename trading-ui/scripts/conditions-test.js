/**
 * Conditions System Testing Page - TikTrack
 * =========================================
 * 
 * עמוד בדיקה מקיף למערכת התנאים והסיבות
 * משתמש במערכת הלוגים המאוחדת הקיימת
 * 
 * Now uses modular architecture with separate components:
 * - conditions-translations.js
 * - conditions-validator.js
 * - conditions-crud-manager.js
 * - conditions-form-generator.js
 * - conditions-initializer.js
 * 
 * @version 2.0.0
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
        
        // Modular components
        this.conditionsSystem = null;
        this.translator = null;
        this.validator = null;
        this.crudManager = null;
        this.formGenerator = null;
        
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
            },
            'evaluate-single': {
                name: 'הערכת תנאי יחיד',
                description: 'הערכת תנאי בודד מול נתוני שוק',
                apiEndpoint: '/api/plan-conditions/1/evaluate',
                method: 'POST'
            },
            'evaluate-all': {
                name: 'הערכת כל התנאים',
                description: 'הערכת כל התנאים הפעילים במערכת',
                apiEndpoint: '/api/plan-conditions/evaluate-all',
                method: 'POST'
            },
            'alert-auto-generation': {
                name: 'יצירת התראות אוטומטית',
                description: 'בדיקת יצירת התראות אוטומטית מתנאים',
                apiEndpoint: '/api/plan-conditions/1/evaluate',
                method: 'POST'
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
            
            // Wait for conditions system to be ready
            await this.waitForConditionsSystem();
            
            // Initialize modular components
            this.initializeModularComponents();
            
            // Setup event listeners
            console.log('🔧 Setting up event listeners...');
            this.setupEventListeners();
            
            // Setup quick stats
            console.log('🔧 Setting up quick stats...');
            this.setupQuickStats();
            
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
     * Wait for conditions system to be ready
     * המתנה למערכת התנאים להיות מוכנה
     */
    async waitForConditionsSystem() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        while (attempts < maxAttempts) {
            if (window.conditionsSystem && window.conditionsSystem.initializer) {
                const status = window.conditionsSystem.initializer.getStatus();
                if (status.isInitialized) {
                    console.log('✅ Conditions system is ready');
                    return;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Conditions system not ready after 5 seconds');
    }
    
    /**
     * Initialize modular components
     * אתחול רכיבים מודולריים
     */
    initializeModularComponents() {
        if (window.conditionsSystem) {
            this.conditionsSystem = window.conditionsSystem;
            this.translator = this.conditionsSystem.translations;
            this.validator = this.conditionsSystem.validator;
            this.crudManager = this.conditionsSystem.crudManager;
            this.formGenerator = this.conditionsSystem.formGenerator;
            
            console.log('✅ Modular components initialized');
        } else {
            throw new Error('Conditions system not available');
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
            'inheritance-test': '7',
            'evaluate-single': '8',
            'evaluate-all': '9',
            'alert-auto-generation': '10'
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

            // Special handling for evaluation tests
            let response;
            if (testId === 'evaluate-single') {
                await this.logWithUnifiedSystem('info', `🔍 Evaluating single condition (ID: 1)...`, 'development');
                response = await this.makeApiCall(finalEndpoint, test.method, testData, test.queryParams);
                
                if (response.data) {
                    const evalResult = response.data;
                    await this.logWithUnifiedSystem('info', `📊 Evaluation Result:`, 'development', {
                        condition_met: evalResult.met,
                        method: evalResult.method_name,
                        current_price: evalResult.current_price,
                        details: evalResult.details
                    });
                }
            } else if (testId === 'evaluate-all') {
                await this.logWithUnifiedSystem('info', `🔍 Evaluating all active conditions...`, 'development');
                response = await this.makeApiCall(finalEndpoint, test.method, testData, test.queryParams);
                
                if (response.data) {
                    const results = response.data;
                    const metCount = results.filter(r => r.met).length;
                    await this.logWithUnifiedSystem('info', `📊 Bulk Evaluation Results:`, 'development', {
                        total_conditions: results.length,
                        conditions_met: metCount,
                        conditions_not_met: results.length - metCount
                    });
                }
            } else if (testId === 'alert-auto-generation') {
                await this.logWithUnifiedSystem('info', `🔍 Testing alert auto-generation...`, 'development');
                response = await this.makeApiCall(finalEndpoint, test.method, testData, test.queryParams);
                
                if (response.data) {
                    const evalResult = response.data;
                    await this.logWithUnifiedSystem('info', `📊 Alert Generation Test:`, 'development', {
                        condition_met: evalResult.met,
                        method: evalResult.method_name,
                        current_price: evalResult.current_price,
                        alert_should_be_created: evalResult.met
                    });
                }
            } else {
                response = await this.makeApiCall(finalEndpoint, test.method, testData, test.queryParams);
            }
            
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
            const response = await fetch('/api/trade-plans/');
            const data = await response.json();
            
            console.log('Trade plans response:', data);
            
            if (data && data.data && data.data.length > 0) {
                console.log('Found existing trade plan:', data.data[0].id);
                return data.data[0].id;
            } else {
                console.log('No trade plans found, creating new one...');
                // If no trade plans exist, create one first
                const createResponse = await fetch('/api/trade-plans/', {
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
            'inheritance-test': 7,
            'evaluate-single': 8,
            'evaluate-all': 9,
            'alert-auto-generation': 10
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

    /**
     * Load quick statistics for the dashboard
     */
    async loadQuickStats() {
        try {
            this.logWithUnifiedSystem('📊 Loading quick statistics...', 'info', 'ui');

            // Load active trades count
            const tradesResponse = await this.makeApiCall('/api/trades/', 'GET');
            const activeTrades = tradesResponse.data ? tradesResponse.data.filter(trade => trade.status === 'open').length : 0;
            document.getElementById('activeTradesCount').textContent = activeTrades;

            // Load active conditions count
            const conditionsResponse = await this.makeApiCall('/api/plan-conditions/trade-plans/1/conditions', 'GET');
            const activeConditions = conditionsResponse.data ? conditionsResponse.data.filter(condition => condition.is_active).length : 0;
            document.getElementById('activeConditionsCount').textContent = activeConditions;

            // Load trading methods count
            const methodsResponse = await this.makeApiCall('/api/trading-methods/', 'GET');
            const methodsCount = methodsResponse.data ? methodsResponse.data.length : 0;
            document.getElementById('tradingMethodsCount').textContent = methodsCount;

            // Load trade plans count
            const plansResponse = await this.makeApiCall('/api/trade-plans/', 'GET');
            const plansCount = plansResponse.data ? plansResponse.data.length : 0;
            document.getElementById('tradePlansCount').textContent = plansCount;

            this.logWithUnifiedSystem('✅ Quick statistics loaded successfully', 'success', 'ui');

        } catch (error) {
            console.error('❌ Failed to load quick stats:', error);
            this.logWithUnifiedSystem(`❌ Failed to load quick stats: ${error.message}`, 'error', 'system');
            
            // Set error values
            document.getElementById('activeTradesCount').textContent = 'שגיאה';
            document.getElementById('activeConditionsCount').textContent = 'שגיאה';
            document.getElementById('tradingMethodsCount').textContent = 'שגיאה';
            document.getElementById('tradePlansCount').textContent = 'שגיאה';
        }
    }

    /**
     * Setup quick stats functionality
     */
    setupQuickStats() {
        // Load stats on initialization
        this.loadQuickStats();

        // Setup refresh button
        const refreshBtn = document.getElementById('refreshStatsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadQuickStats();
            });
        }
    }
}

/**
 * Conditions UI Manager - Demo Interface
 * =====================================
 * 
 * מנהל ממשק לדוגמה לניהול תנאים
 * מציג רשימת תנאים וטופס יצירה/עריכה
 */
class ConditionsUIManager {
    constructor() {
        this.methods = [];
        this.conditions = [];
        this.currentCondition = null;
        this.currentTradePlanId = 1; // Default to plan 1 for demo
        
        // Modular components
        this.conditionsSystem = null;
        this.translator = null;
        this.validator = null;
        this.crudManager = null;
        this.formGenerator = null;
    }

    async initialize() {
        console.log('🎨 Initializing Conditions UI Manager...');
        
        // Wait for conditions system to be ready
        await this.waitForConditionsSystem();
        
        // Initialize modular components
        this.initializeModularComponents();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load methods
        await this.loadMethods();
        
        // Load conditions
        await this.loadConditions();
        
        console.log('✅ Conditions UI Manager initialized');
    }
    
    /**
     * Wait for conditions system to be ready
     * המתנה למערכת התנאים להיות מוכנה
     */
    async waitForConditionsSystem() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        while (attempts < maxAttempts) {
            if (window.conditionsSystem && window.conditionsSystem.initializer) {
                const status = window.conditionsSystem.initializer.getStatus();
                if (status.isInitialized) {
                    console.log('✅ Conditions system is ready for UI Manager');
                    return;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Conditions system not ready for UI Manager after 5 seconds');
    }
    
    /**
     * Initialize modular components
     * אתחול רכיבים מודולריים
     */
    initializeModularComponents() {
        if (window.conditionsSystem) {
            this.conditionsSystem = window.conditionsSystem;
            this.translator = this.conditionsSystem.translations;
            this.validator = this.conditionsSystem.validator;
            this.crudManager = this.conditionsSystem.crudManager;
            this.formGenerator = this.conditionsSystem.formGenerator;
            
            console.log('✅ UI Manager modular components initialized');
        } else {
            throw new Error('Conditions system not available for UI Manager');
        }
    }

    setupEventListeners() {
        // Add condition button
        const addBtn = document.getElementById('addConditionBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showForm());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshConditionsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadConditions());
        }

        // Evaluation controls
        const evaluateAllBtn = document.getElementById('evaluateAllBtn');
        if (evaluateAllBtn) {
            evaluateAllBtn.addEventListener('click', () => this.evaluateAllConditions());
        }

        const refreshEvaluationsBtn = document.getElementById('refreshEvaluationsBtn');
        if (refreshEvaluationsBtn) {
            refreshEvaluationsBtn.addEventListener('click', () => this.refreshEvaluations());
        }

        // Form buttons
        const saveBtn = document.getElementById('saveConditionBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCondition());
        }

        const cancelBtn = document.getElementById('cancelFormBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideForm());
        }

        const closeBtn = document.getElementById('closeFormBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideForm());
        }

        // Method select change
        const methodSelect = document.getElementById('methodSelect');
        if (methodSelect) {
            methodSelect.addEventListener('change', (e) => this.onMethodChange(e.target.value));
        }
    }

    async loadMethods() {
        try {
            if (this.crudManager) {
                this.methods = await this.crudManager.getTradingMethods();
                this.populateMethodsSelect();
                console.log(`✅ Loaded ${this.methods.length} methods using modular system`);
            } else {
                // Fallback to direct API call
                const response = await fetch('/api/trading-methods/');
                const result = await response.json();
                
                if (result.status === 'success') {
                    this.methods = result.data;
                    this.populateMethodsSelect();
                    console.log(`✅ Loaded ${this.methods.length} methods using fallback`);
                }
            }
        } catch (error) {
            console.error('❌ Failed to load methods:', error);
        }
    }

    populateMethodsSelect() {
        const select = document.getElementById('methodSelect');
        if (!select) return;

        select.innerHTML = '<option value="">בחר שיטה...</option>';
        this.methods.forEach(method => {
            const option = document.createElement('option');
            option.value = method.id;
            option.textContent = `${method.name_he} (${method.name_en})`;
            option.dataset.method = JSON.stringify(method);
            select.appendChild(option);
        });
    }

    onMethodChange(methodId) {
        if (!methodId) {
            document.getElementById('parametersContainer').innerHTML = '';
            return;
        }

        const method = this.methods.find(m => m.id == methodId);
        if (!method) return;

        this.renderParameters(method);
    }

    renderParameters(method) {
        const container = document.getElementById('parametersContainer');
        if (!container) return;

        container.innerHTML = '<h5 class="mb-3">פרמטרים</h5>';

        method.parameters.forEach(param => {
            const div = document.createElement('div');
            div.className = 'mb-3';

            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = `${param.parameter_name_he} (${param.parameter_name_en})`;
            if (param.is_required) {
                label.innerHTML += ' <span class="text-danger">*</span>';
            }

            let input;
            if (param.parameter_type === 'dropdown') {
                input = document.createElement('select');
                input.className = 'form-select';
                const options = param.validation_rule ? param.validation_rule.split(',') : [];
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    input.appendChild(option);
                });
            } else {
                input = document.createElement('input');
                input.className = 'form-control';
                input.type = param.parameter_type === 'boolean' ? 'checkbox' : 
                            param.parameter_type === 'number' || param.parameter_type === 'period' ? 'number' : 'text';
                
                if (param.min_value) input.min = param.min_value;
                if (param.max_value) input.max = param.max_value;
                if (param.default_value) input.value = param.default_value;
            }

            input.id = `param_${param.parameter_key}`;
            input.dataset.key = param.parameter_key;
            input.dataset.type = param.parameter_type;

            const help = document.createElement('small');
            help.className = 'form-text text-muted';
            help.textContent = param.help_text_he || param.help_text_en;

            div.appendChild(label);
            div.appendChild(input);
            div.appendChild(help);
            container.appendChild(div);
        });
    }

    async loadConditions() {
        try {
            const listBody = document.getElementById('conditionsListBody');
            if (!listBody) return;

            listBody.innerHTML = '<div class="text-center p-3 text-muted"><i class="fas fa-spinner fa-spin"></i> טוען תנאים...</div>';

            if (this.crudManager) {
                this.conditions = await this.crudManager.readConditions(this.currentTradePlanId);
                this.renderConditions();
                console.log(`✅ Loaded ${this.conditions.length} conditions using modular system`);
            } else {
                // Fallback to direct API call
                const response = await fetch(`/api/plan-conditions/trade-plans/${this.currentTradePlanId}/conditions`);
                const result = await response.json();

                if (result.status === 'success') {
                    this.conditions = result.data;
                    this.renderConditions();
                    console.log(`✅ Loaded ${this.conditions.length} conditions using fallback`);
                }
            }
        } catch (error) {
            console.error('❌ Failed to load conditions:', error);
            const listBody = document.getElementById('conditionsListBody');
            if (listBody) {
                listBody.innerHTML = '<div class="text-center p-3 text-danger">❌ שגיאה בטעינת תנאים</div>';
            }
        }
    }

    renderConditions() {
        const listBody = document.getElementById('conditionsListBody');
        if (!listBody) return;

        if (this.conditions.length === 0) {
            listBody.innerHTML = '<div class="text-center p-3 text-muted">אין תנאים להצגה</div>';
            return;
        }

        listBody.innerHTML = '';
        this.conditions.forEach(condition => {
            const item = this.createConditionItem(condition);
            listBody.appendChild(item);
        });
    }

    createConditionItem(condition) {
        const div = document.createElement('div');
        div.className = 'condition-item';
        div.dataset.id = condition.id;

        const header = document.createElement('div');
        header.className = 'condition-item-header';

        const methodName = document.createElement('div');
        methodName.className = 'condition-method-name';
        methodName.textContent = condition.method ? condition.method.name_he : 'שיטה לא ידועה';

        const status = document.createElement('span');
        status.className = `condition-status ${condition.is_active ? 'active' : 'inactive'}`;
        status.textContent = condition.is_active ? 'פעיל' : 'לא פעיל';

        header.appendChild(methodName);
        header.appendChild(status);

        const params = document.createElement('div');
        params.className = 'condition-parameters';
        const paramsObj = typeof condition.parameters === 'string' ? 
            JSON.parse(condition.parameters) : condition.parameters;
        params.textContent = `פרמטרים: ${JSON.stringify(paramsObj)}`;

        const actions = document.createElement('div');
        actions.className = 'condition-actions';

        const editBtn = document.createElement('button');
        editBtn.setAttribute('data-button-type', 'EDIT');
        editBtn.setAttribute('data-variant', 'small');
        editBtn.setAttribute('data-text', 'עריכה');
        editBtn.setAttribute('title', 'עריכה');
        editBtn.onclick = () => this.editCondition(condition);

        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('data-button-type', 'DELETE');
        deleteBtn.setAttribute('data-variant', 'small');
        deleteBtn.setAttribute('data-text', 'מחיקה');
        deleteBtn.setAttribute('title', 'מחיקה');
        deleteBtn.onclick = () => this.deleteCondition(condition.id);

        const alertBtn = document.createElement('button');
        alertBtn.className = 'btn btn-sm btn-warning';
        alertBtn.innerHTML = '<i class="fas fa-bell"></i> התראה';
        alertBtn.onclick = () => this.createAlertFromCondition(condition);

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        actions.appendChild(alertBtn);

        div.appendChild(header);
        div.appendChild(params);
        div.appendChild(actions);

        return div;
    }

    showForm(condition = null) {
        this.currentCondition = condition;
        const form = document.getElementById('conditionForm');
        const title = document.getElementById('formTitle');
        
        if (form) {
            form.style.display = 'block';
            title.textContent = condition ? 'עריכת תנאי' : 'תנאי חדש';

            if (condition) {
                // Populate form with condition data
                document.getElementById('methodSelect').value = condition.method_id;
                this.onMethodChange(condition.method_id);
                
                // Populate parameters
                setTimeout(() => {
                    const params = typeof condition.parameters === 'string' ? 
                        JSON.parse(condition.parameters) : condition.parameters;
                    Object.keys(params).forEach(key => {
                        const input = document.getElementById(`param_${key}`);
                        if (input) input.value = params[key];
                    });
                }, 100);

                document.getElementById('logicalOperator').value = condition.logical_operator || 'NONE';
                document.getElementById('conditionGroup').value = condition.condition_group || 0;
                document.getElementById('isActive').checked = condition.is_active !== false;
            } else {
                // Reset form
                document.getElementById('methodSelect').value = '';
                document.getElementById('parametersContainer').innerHTML = '';
                document.getElementById('logicalOperator').value = 'NONE';
                document.getElementById('conditionGroup').value = 0;
                document.getElementById('isActive').checked = true;
            }
        }
    }

    hideForm() {
        const form = document.getElementById('conditionForm');
        if (form) {
            form.style.display = 'none';
        }
        this.currentCondition = null;
    }

    async saveCondition() {
        try {
            const methodId = document.getElementById('methodSelect').value;
            if (!methodId) {
                alert('יש לבחור שיטת מסחר');
                return;
            }

            // Collect parameters
            const parameters = {};
            const paramInputs = document.querySelectorAll('[data-key]');
            paramInputs.forEach(input => {
                const key = input.dataset.key;
                parameters[key] = input.value;
            });

            const data = {
                method_id: parseInt(methodId),
                parameters_json: parameters,
                logical_operator: document.getElementById('logicalOperator').value,
                condition_group: parseInt(document.getElementById('conditionGroup').value),
                is_active: document.getElementById('isActive').checked
            };

            // Use modular system if available
            if (this.crudManager) {
                if (this.currentCondition) {
                    // Update
                    await this.crudManager.updateCondition(this.currentCondition.id, data);
                } else {
                    // Create
                    await this.crudManager.createCondition(this.currentTradePlanId, data);
                }
                
                console.log('✅ Condition saved successfully using modular system');
                this.hideForm();
                await this.loadConditions();
            } else {
                // Fallback to direct API calls
                let response;
                if (this.currentCondition) {
                    // Update
                    response = await fetch(`/api/plan-conditions/${this.currentCondition.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                } else {
                    // Create
                    response = await fetch(`/api/plan-conditions/trade-plans/${this.currentTradePlanId}/conditions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                }

                const result = await response.json();
                if (result.status === 'success') {
                    console.log('✅ Condition saved successfully using fallback');
                    this.hideForm();
                    await this.loadConditions();
                } else {
                    alert('שגיאה בשמירת התנאי');
                }
            }
        } catch (error) {
            console.error('❌ Failed to save condition:', error);
            alert('שגיאה בשמירת התנאי');
        }
    }

    editCondition(condition) {
        this.showForm(condition);
    }

    async deleteCondition(conditionId) {
        if (!confirm('האם למחוק את התנאי?')) return;

        try {
            // Use modular system if available
            if (this.crudManager) {
                await this.crudManager.deleteCondition(conditionId);
                console.log('✅ Condition deleted successfully using modular system');
                await this.loadConditions();
            } else {
                // Fallback to direct API call
                const response = await fetch(`/api/plan-conditions/${conditionId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();
                if (result.status === 'success') {
                    console.log('✅ Condition deleted successfully using fallback');
                    await this.loadConditions();
                } else {
                    alert('שגיאה במחיקת התנאי');
                }
            }
        } catch (error) {
            console.error('❌ Failed to delete condition:', error);
            alert('שגיאה במחיקת התנאי');
        }
    }

    async createAlertFromCondition(condition) {
        try {
            const data = {
                related_id: condition.id,
                message: `התראה מתנאי: ${condition.method ? condition.method.name_he : 'תנאי'}`,
                condition_attribute: 'price',
                condition_operator: 'more_than',
                condition_number: '0'
            };

            const response = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.status === 'success') {
                alert('התראה נוצרה בהצלחה!');
                console.log('✅ Alert created successfully');
            } else {
                alert('שגיאה ביצירת התראה');
            }
        } catch (error) {
            console.error('❌ Failed to create alert:', error);
            alert('שגיאה ביצירת התראה');
        }
    }

    /**
     * Evaluate all conditions in the UI demo
     */
    async evaluateAllConditions() {
        try {
            await this.logWithUnifiedSystem('info', '🔍 Starting bulk evaluation of all conditions...', 'development');
            
            const response = await this.makeApiCall('/api/plan-conditions/evaluate-all', 'POST');
            
            if (response.data) {
                const results = response.data;
                const metCount = results.filter(r => r.met).length;
                
                await this.logWithUnifiedSystem('info', `📊 Bulk evaluation completed:`, 'development', {
                    total_conditions: results.length,
                    conditions_met: metCount,
                    conditions_not_met: results.length - metCount
                });
                
                // Update the conditions list with evaluation results
                this.updateConditionsWithEvaluations(results);
                
                // Show notification
                if (window.showNotificationSmart) {
                    window.showNotificationSmart(`הערכה הושלמה: ${metCount}/${results.length} תנאים התקיימו`, 'success');
                }
            }
        } catch (error) {
            console.error('❌ Failed to evaluate all conditions:', error);
            await this.logWithUnifiedSystem('error', `❌ Failed to evaluate all conditions: ${error.message}`, 'system');
        }
    }

    /**
     * Refresh evaluations for all conditions
     */
    async refreshEvaluations() {
        try {
            await this.logWithUnifiedSystem('info', '🔄 Refreshing condition evaluations...', 'development');
            
            // Reload conditions to get fresh evaluation data
            await this.loadConditions();
            
            if (window.showNotificationSmart) {
                window.showNotificationSmart('הערכות התנאים רוענו', 'info');
            }
        } catch (error) {
            console.error('❌ Failed to refresh evaluations:', error);
            await this.logWithUnifiedSystem('error', `❌ Failed to refresh evaluations: ${error.message}`, 'system');
        }
    }

    /**
     * Update conditions list with evaluation results
     */
    updateConditionsWithEvaluations(evaluationResults) {
        const conditionsListBody = document.getElementById('conditionsListBody');
        if (!conditionsListBody) return;

        // Create a map of condition_id to evaluation result
        const evaluationMap = {};
        evaluationResults.forEach(result => {
            evaluationMap[result.condition_id] = result;
        });

        // Update each condition item with evaluation status
        const conditionItems = conditionsListBody.querySelectorAll('.condition-item');
        conditionItems.forEach(item => {
            const conditionId = item.dataset.conditionId;
            const evaluation = evaluationMap[conditionId];
            
            if (evaluation) {
                // Add evaluation status indicator
                let statusIndicator = item.querySelector('.evaluation-status');
                if (!statusIndicator) {
                    statusIndicator = document.createElement('div');
                    statusIndicator.className = 'evaluation-status';
                    item.appendChild(statusIndicator);
                }
                
                statusIndicator.innerHTML = `
                    <div class="evaluation-result ${evaluation.met ? 'met' : 'not-met'}">
                        <i class="fas fa-${evaluation.met ? 'check-circle text-success' : 'times-circle text-danger'}"></i>
                        <span>${evaluation.met ? 'התקיים' : 'לא התקיים'}</span>
                        <small>${evaluation.current_price ? `מחיר: ${evaluation.current_price}` : ''}</small>
                    </div>
                `;
            }
        });
    }

    /**
     * Evaluate a single condition
     */
    async evaluateSingleCondition(conditionId) {
        try {
            await this.logWithUnifiedSystem('info', `🔍 Evaluating condition ${conditionId}...`, 'development');
            
            const response = await this.makeApiCall(`/api/plan-conditions/${conditionId}/evaluate`, 'POST');
            
            if (response.data) {
                const result = response.data;
                await this.logWithUnifiedSystem('info', `📊 Condition ${conditionId} evaluation:`, 'development', {
                    condition_met: result.met,
                    method: result.method_name,
                    current_price: result.current_price,
                    details: result.details
                });
                
                // Update the specific condition item
                this.updateSingleConditionEvaluation(conditionId, result);
                
                return result;
            }
        } catch (error) {
            console.error(`❌ Failed to evaluate condition ${conditionId}:`, error);
            await this.logWithUnifiedSystem('error', `❌ Failed to evaluate condition ${conditionId}: ${error.message}`, 'system');
        }
    }

    /**
     * Update a single condition with evaluation result
     */
    updateSingleConditionEvaluation(conditionId, evaluation) {
        const conditionItem = document.querySelector(`[data-condition-id="${conditionId}"]`);
        if (!conditionItem) return;

        let statusIndicator = conditionItem.querySelector('.evaluation-status');
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.className = 'evaluation-status';
            conditionItem.appendChild(statusIndicator);
        }
        
        statusIndicator.innerHTML = `
            <div class="evaluation-result ${evaluation.met ? 'met' : 'not-met'}">
                <i class="fas fa-${evaluation.met ? 'check-circle text-success' : 'times-circle text-danger'}"></i>
                <span>${evaluation.met ? 'התקיים' : 'לא התקיים'}</span>
                <small>${evaluation.current_price ? `מחיר: ${evaluation.current_price}` : ''}</small>
                <button class="btn btn-xs btn-outline-primary" onclick="window.conditionsTestManager.evaluateSingleCondition(${conditionId})">
                    <i class="fas fa-sync"></i>
                </button>
            </div>
        `;
    }
}

// Global instance
let conditionsTestManager;
let conditionsUIManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔧 DOM Content Loaded, creating conditionsTestManager...');
    try {
        conditionsTestManager = new ConditionsTestManager();
        console.log('🔧 conditionsTestManager created:', conditionsTestManager);
        // Don't auto-initialize - let the unified system handle it
        window.conditionsTestManager = conditionsTestManager;
        console.log('🔧 conditionsTestManager assigned to window');
        
        // Also create UI manager
        conditionsUIManager = new ConditionsUIManager();
        await conditionsUIManager.initialize();
        window.conditionsUIManager = conditionsUIManager;
        console.log('🔧 conditionsUIManager created and initialized');
    } catch (error) {
        console.error('🔧 Failed to create conditions test manager:', error);
    }
});

// Export for global access
window.conditionsTestManager = conditionsTestManager;
window.conditionsUIManager = conditionsUIManager;
