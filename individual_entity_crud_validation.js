const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';
const DASHBOARD_URL = `${BASE_URL}/crud_testing_dashboard`;
const LOG_PATH = '/Users/nimrod/Documents/TikTrack/TikTrackApp/.cursor/debug.log';

// All 15 entities to test
const ENTITIES = [
    'trades', 'trade_plans', 'executions', 'alerts',
    'tickers', 'user_management', 'tag_management', 'data_import',
    'trading_accounts', 'notes', 'cash_flow', 'watch_lists',
    'preferences', 'user_profile', 'import_session'
];

const BROWSERS = ['chrome', 'firefox'];

async function logToFile(message, data = {}) {
    const logEntry = JSON.stringify({
        sessionId: 'individual-entity-validation',
        runId: data.runId || 'main',
        hypothesisId: data.hypothesisId || 'validation',
        location: 'individual_entity_crud_validation.js',
        message,
        data,
        timestamp: Date.now()
    });

    fs.appendFileSync(LOG_PATH, logEntry + '\n');
}

async function runEntityTest(browserType, entity) {
    console.log(`🚀 Starting ${entity} test in ${browserType}...`);

    let executablePath = undefined;
        if (browserType === 'firefox') {
            // Try different Firefox locations
            const firefoxPaths = [
                '/Applications/Firefox.app/Contents/MacOS/firefox',
                '/usr/local/bin/firefox',
                '/usr/bin/firefox',
                'firefox' // Let system find it
            ];

            for (const path of firefoxPaths) {
                try {
                    // Simple check if path exists (won't work for 'firefox' command)
                    if (path === 'firefox' || require('fs').existsSync(path)) {
                        executablePath = path;
                        break;
                    }
                } catch (e) {
                    // Continue trying other paths
                }
            }

            if (!executablePath) {
                console.log('Firefox not found, will use default browser detection');
                // Don't set executablePath, let Puppeteer try to find it
            }
        }

        const browser = await puppeteer.launch({
            headless: false,
            executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        // Enable console logging
        page.on('console', msg => {
            console.log(`${browserType}/${entity} Console:`, msg.text());
            logToFile(`console_${browserType}_${entity}`, {
                level: msg.type(),
                message: msg.text(),
                runId: `${entity}_${browserType}`
            });
        });

        // Capture network requests
        page.on('response', response => {
            if (response.url().includes('/api/')) {
                logToFile(`network_${browserType}_${entity}`, {
                    url: response.url(),
                    status: response.status(),
                    method: response.request().method(),
                    payload: response.request().postData() || 'GET',
                    runId: `${entity}_${browserType}`
                });
            }
        });

        logToFile(`start_test_${browserType}_${entity}`, {
            entity,
            browser: browserType,
            timestamp: new Date().toISOString(),
            runId: `${entity}_${browserType}`
        });

        // Navigate to dashboard
        await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle0' });
        logToFile(`navigated_${browserType}_${entity}`, {
            url: DASHBOARD_URL,
            runId: `${entity}_${browserType}`
        });

        // Check if we need to login by checking URL and page content
        const currentUrl = page.url();
        const pageTitle = await page.title();
        const hasLoginForm = await page.$('#username') !== null;
        const isLoginPage = currentUrl.includes('login') || pageTitle.includes('התחברות') || pageTitle.includes('Login');

        console.log(`${browserType}/${entity}: URL: ${currentUrl}`);
        console.log(`${browserType}/${entity}: Title: ${pageTitle}`);
        console.log(`${browserType}/${entity}: Login form found: ${hasLoginForm}`);
        console.log(`${browserType}/${entity}: Is login page: ${isLoginPage}`);

        if (hasLoginForm || isLoginPage) {
            console.log(`${browserType}/${entity}: Attempting login...`);
            // We found login elements, login
            await page.type('#username', 'admin');
            await page.type('#password', 'admin123');
            await page.click('button[type="submit"]');

            // Wait for navigation or for login to complete
            try {
                await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
                console.log(`${browserType}/${entity}: Navigation after login completed`);
            } catch (navError) {
                console.log(`${browserType}/${entity}: No navigation after login, checking if login succeeded...`);
                // Check if we're still on login page
                const stillHasLogin = await page.$('#username') !== null;
                if (stillHasLogin) {
                    throw new Error('Login failed - still on login page');
                }
            }

            logToFile(`logged_in_${browserType}_${entity}`, {
                runId: `${entity}_${browserType}`
            });
        } else {
            console.log(`${browserType}/${entity}: No login form found, assuming already logged in`);
            logToFile(`already_logged_in_${browserType}_${entity}`, {
                runId: `${entity}_${browserType}`
            });
        }

        // Wait for dashboard to fully load - be more patient
        console.log(`${browserType}/${entity}: Waiting for dashboard to load...`);

        // Wait up to 20 seconds for the cards to appear
        let hasCards = false;
        for (let i = 0; i < 20; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            hasCards = await page.$('.individual-test-cards') !== null;
            if (hasCards) break;
            console.log(`${browserType}/${entity}: Waiting... ${i + 1}/20 seconds`);
        }

        const hasFunctions = await page.evaluate(() => typeof window.runTradeTestOnly === 'function');

        if (!hasCards) {
            // Log what's actually on the page
            const pageContent = await page.evaluate(() => {
                const allElements = Array.from(document.querySelectorAll('*'));
                const visibleElements = allElements.filter(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                });

                return {
                    title: document.title,
                    hasBody: !!document.body,
                    totalElements: allElements.length,
                    visibleElements: visibleElements.length,
                    testCards: !!document.querySelector('.individual-test-cards'),
                    anyCards: !!document.querySelector('.test-entity-card'),
                    bodyClasses: document.body ? document.body.className : 'no body',
                    firstFewElements: allElements.slice(0, 5).map(el => ({
                        tag: el.tagName,
                        id: el.id,
                        class: el.className,
                        text: el.textContent.slice(0, 50)
                    }))
                };
            });
            console.log(`${browserType}/${entity}: Page content:`, pageContent);
        }

        if (!hasCards || !hasFunctions) {
            throw new Error(`Dashboard not loaded properly. Cards: ${hasCards}, Functions: ${hasFunctions}`);
        }

        console.log(`${browserType}/${entity}: Dashboard loaded successfully!`);

        logToFile(`dashboard_loaded_${browserType}_${entity}`, {
            runId: `${entity}_${browserType}`
        });

        // Map entity names to the correct function names
        const functionMapping = {
            'trades': 'runTradeTestOnly',
            'trade_plans': 'runTradePlanTestOnly',
            'executions': 'runExecutionTestOnly',
            'alerts': 'runAlertTestOnly',
            'tickers': 'runTickerTestOnly',
            'user_management': 'runUserManagementTestOnly',
            'tag_management': 'runTagManagementTestOnly',
            'data_import': 'runDataImportTestOnly',
            'trading_accounts': 'runTradingAccountTestOnly',
            'notes': 'runNoteTestOnly',
            'cash_flow': 'runCashFlowTestOnly',
            'watch_lists': 'runWatchListTestOnly',
            'preferences': 'runPreferencesTestOnly',
            'user_profile': 'runUserProfileTestOnly',
            'import_session': 'runImportSessionTestOnly'
        };

        const functionName = functionMapping[entity];
        if (!functionName) {
            throw new Error(`No function mapping found for entity: ${entity}`);
        }

        // Wait for the function to be available
        await page.waitForFunction((funcName) => {
            return typeof window[funcName] === 'function';
        }, {}, functionName);

        logToFile(`function_available_${browserType}_${entity}`, {
            function: functionName,
            runId: `${entity}_${browserType}`
        });

        // Call the test function and wait for completion
        let testResults = null;
        let completionStatus = 'unknown';

        try {
            // Call the test function
            await page.evaluate((funcName) => {
                console.log(`🚀 Calling ${funcName}()`);
                return window[funcName]();
            }, functionName);

            logToFile(`test_started_${browserType}_${entity}`, {
                function: functionName,
                runId: `${entity}_${browserType}`
            });

            // Wait for test completion with timeout
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.log(`⏰ Timeout waiting for ${entity} test completion`);
                    completionStatus = 'timeout';
                    resolve();
                }, 45000); // 45 second timeout

                // Listen for console messages indicating completion
                const consoleHandler = (msg) => {
                    const text = msg.text();
                    if (text.includes(`✅ ${functionName} completed`)) {
                        clearTimeout(timeout);
                        completionStatus = 'success';
                        page.off('console', consoleHandler);
                        resolve();
                    } else if (text.includes(`❌ ${functionName} failed`)) {
                        clearTimeout(timeout);
                        completionStatus = 'failed';
                        page.off('console', consoleHandler);
                        resolve();
                    }
                };

                page.on('console', consoleHandler);
            });

            logToFile(`test_completion_status_${browserType}_${entity}`, {
                status: completionStatus,
                runId: `${entity}_${browserType}`
            });

        } catch (error) {
            console.error(`❌ Error during ${entity} test:`, error.message);
            logToFile(`error_during_test_${browserType}_${entity}`, {
                error: error.message,
                stack: error.stack,
                runId: `${entity}_${browserType}`
            });
            completionStatus = 'error';
        }

        // Wait a bit for results to settle
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to extract results from various possible locations
        try {
            testResults = await page.evaluate((entityName, funcName, status) => {
                // Try different result locations
                let results = null;

                // Check window.testResults
                if (window.testResults && window.testResults[entityName]) {
                    results = window.testResults[entityName];
                }

                // Check if there's a global crudTester with results
                if (!results && window.crudTester && window.crudTester.results) {
                    const e2eResults = window.crudTester.results.e2e || [];
                    const entityResult = e2eResults.find(r => r.workflow && r.workflow.includes(entityName));
                    if (entityResult) {
                        results = {
                            create: entityResult.status === 'success' ? 'pass' : 'fail',
                            read: entityResult.status === 'success' ? 'pass' : 'fail',
                            update: entityResult.status === 'success' ? 'pass' : 'fail',
                            delete: entityResult.status === 'success' ? 'pass' : 'fail',
                            status: entityResult.status,
                            executionTime: entityResult.executionTime
                        };
                    }
                }

                // Check localStorage
                try {
                    const stored = localStorage.getItem('crud_automated_test_report');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed.results && parsed.results[entityName]) {
                            results = parsed.results[entityName];
                        }
                    }
                } catch (e) {
                    // Ignore localStorage errors
                }

                // If no results found but we know the status, create basic results
                if (!results && status !== 'unknown') {
                    results = {
                        create: status === 'success' ? 'pass' : 'fail',
                        read: status === 'success' ? 'pass' : 'unknown',
                        update: status === 'success' ? 'pass' : 'unknown',
                        delete: status === 'success' ? 'pass' : 'unknown',
                        status: status,
                        executionTime: 0
                    };
                }

                return results ? {
                    entity: entityName,
                    function: funcName,
                    create: results.create || 'unknown',
                    read: results.read || 'unknown',
                    update: results.update || 'unknown',
                    delete: results.delete || 'unknown',
                    status: results.status || status,
                    executionTime: results.executionTime || 0,
                    details: results.details || {}
                } : {
                    entity: entityName,
                    function: funcName,
                    create: 'unknown',
                    read: 'unknown',
                    update: 'unknown',
                    delete: 'unknown',
                    status: status,
                    executionTime: 0,
                    details: {}
                };
            }, entity, functionName, completionStatus);
        } catch (extractError) {
            console.error(`❌ Error extracting results for ${entity}:`, extractError.message);
            testResults = {
                entity,
                function: functionName,
                create: 'error',
                read: 'error',
                update: 'error',
                delete: 'error',
                status: 'error',
                executionTime: 0,
                details: { extractionError: extractError.message }
            };
        }

        logToFile(`results_extracted_${browserType}_${entity}`, {
            results: testResults,
            runId: `${entity}_${browserType}`
        });

        return testResults;

    } catch (error) {
        console.error(`❌ Error testing ${entity} in ${browserType}:`, error.message);
        logToFile(`error_${browserType}_${entity}`, {
            error: error.message,
            stack: error.stack,
            runId: `${entity}_${browserType}`
        });

        return {
            entity,
            browser: browserType,
            error: error.message,
            operations: { create: 'error', read: 'error', update: 'error', delete: 'error' }
        };
    } finally {
        await browser.close();
    }
}

async function main() {
    console.log('🎯 Starting Full Entity Matrix CRUD Validation');
    console.log('📊 Testing 15 entities × 2 browsers = 30 test runs');
    console.log('🔧 Dashboard URL:', DASHBOARD_URL);
    console.log('📝 Logs:', LOG_PATH);

    // Clear previous logs
    try {
        if (fs.existsSync(LOG_PATH)) {
            fs.unlinkSync(LOG_PATH);
            console.log('🧹 Cleared previous logs');
        }
    } catch (e) {
        console.log('⚠️ Could not clear logs:', e.message);
    }

    const results = {};
    const summary = {
        total: ENTITIES.length * BROWSERS.length,
        completed: 0,
        errors: 0,
        passed: 0,
        failed: 0
    };

    for (const entity of ENTITIES) {
        results[entity] = {};

        for (const browser of BROWSERS) {
            console.log(`\n🔍 Testing ${entity} in ${browser}...`);

            try {
                const result = await runEntityTest(browser, entity);
                results[entity][browser] = result;

                if (result && result.status === 'error') {
                    summary.errors++;
                    console.log(`❌ ${entity}/${browser}: ERROR - ${result.details?.extractionError || 'Unknown error'}`);
                } else if (result && result.create && result.read && result.update && result.delete) {
                    const ops = [result.create, result.read, result.update, result.delete];
                    const passed = ops.filter(op => op === 'pass').length;
                    const failed = ops.filter(op => op === 'fail').length;

                    if (failed === 0) {
                        summary.passed++;
                        console.log(`✅ ${entity}/${browser}: PASSED (${passed}/4 operations)`);
                    } else {
                        summary.failed++;
                        console.log(`⚠️ ${entity}/${browser}: PARTIAL (${passed}/4 passed, ${failed}/4 failed)`);
                    }
                }

                summary.completed++;
            } catch (browserError) {
                console.error(`❌ Browser error for ${entity}/${browser}:`, browserError.message);
                results[entity][browser] = {
                    entity,
                    browser,
                    error: browserError.message,
                    operations: { create: 'error', read: 'error', update: 'error', delete: 'error' }
                };
                summary.errors++;
                summary.completed++;
            }
        }

        // Small delay between entities to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate final report
    const report = {
        timestamp: new Date().toISOString(),
        summary,
        results,
        environment: {
            baseUrl: BASE_URL,
            dashboardUrl: DASHBOARD_URL,
            browsers: BROWSERS,
            entities: ENTITIES
        }
    };

    const reportPath = 'individual_entity_validation_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 FINAL REPORT');
    console.log('===============');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Completed: ${summary.completed}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Errors: ${summary.errors}`);
    console.log(`Report saved to: ${reportPath}`);
    console.log(`Logs saved to: ${LOG_PATH}`);

    // Generate matrix format for easy reading
    console.log('\n📋 CRUD MATRIX');
    console.log('===============');
    console.log('Entity\t\tChrome\t\t\t\tFirefox');
    console.log('------\t\t------\t\t\t\t------');

    for (const entity of ENTITIES) {
        const chrome = results[entity].chrome;
        const firefox = results[entity].firefox;

        const formatOps = (result) => {
            if (!result || result.error) return 'ERROR';
            return `${result.create}/${result.read}/${result.update}/${result.delete}`;
        };

        console.log(`${entity.padEnd(15)}\t${formatOps(chrome).padEnd(20)}\t${formatOps(firefox)}`);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runEntityTest, ENTITIES, BROWSERS };
