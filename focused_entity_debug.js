const puppeteer = require('puppeteer');
const fs = require('fs');

const DASHBOARD_URL = 'http://localhost:8080/crud_testing_dashboard';
const LOG_PATH = '/Users/nimrod/Documents/TikTrack/TikTrackApp/.cursor/debug.log';

// Focused entities to test
const ENTITIES = ['trade_plan', 'cash_flow', 'user_profile'];

async function logToFile(message, data = {}) {
    const logEntry = JSON.stringify({
        sessionId: 'focused-entity-debug',
        runId: `focused-${Date.now()}`,
        hypothesisId: 'focused-debugging',
        location: 'focused_entity_debug.js',
        message,
        data,
        timestamp: Date.now()
    });

    fs.appendFileSync(LOG_PATH, logEntry + '\n');
}

async function runFocusedEntityTest(entity) {
    console.log(`🔍 Starting focused test for ${entity}...`);

    // Clear previous logs
    try {
        if (fs.existsSync(LOG_PATH)) {
            fs.unlinkSync(LOG_PATH);
            console.log('🧹 Cleared previous logs');
        }
    } catch (e) {
        console.log('⚠️ Could not clear logs:', e.message);
    }

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Enable detailed logging - ONLY Logger, no console
        page.on('response', response => {
            const url = response.url();
            if (url.includes('/api/') && (
                url.includes(entity) ||
                url.includes(entity.replace('_', '-')) ||
                url.includes('/logs/batch')
            )) {
                logToFile(`network_${entity}`, {
                    url,
                    status: response.status(),
                    method: response.request().method(),
                    entity,
                    runId: `focused-${entity}`
                });
            }
        });

        // Capture Logger messages only
        page.on('response', async (response) => {
            if (response.url().includes('/logs/batch')) {
                try {
                    const request = response.request();
                    const payload = request.postData();
                    if (payload) {
                        const logs = JSON.parse(payload).logs || [];
                        logs.forEach(log => {
                            if (log.message && log.message.includes(entity)) {
                                logToFile(`logger_${entity}`, {
                                    level: log.level,
                                    message: log.message,
                                    context: log.context,
                                    entity,
                                    runId: `focused-${entity}`
                                });
                            }
                        });
                    }
                } catch (e) {
                    // Ignore parsing errors
                }
            }
        });

        logToFile(`start_focused_test_${entity}`, {
            entity,
            url: DASHBOARD_URL,
            timestamp: new Date().toISOString(),
            runId: `focused-${entity}`
        });

        // First navigate to login page to establish session
        const loginUrl = 'http://localhost:8080/login.html';
        await page.goto(loginUrl, { waitUntil: 'networkidle0' });
        logToFile(`navigated_login_${entity}`, {
            entity,
            url: loginUrl,
            runId: `focused-${entity}`
        });

        // Login
        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');
        await page.click('button[type="submit"]');

        // Wait for navigation after login
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
        logToFile(`login_completed_${entity}`, {
            entity,
            currentUrl: page.url(),
            runId: `focused-${entity}`
        });

        // Now navigate to dashboard
        await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle0' });
        logToFile(`navigated_dashboard_${entity}`, {
            entity,
            url: DASHBOARD_URL,
            currentUrl: page.url(),
            runId: `focused-${entity}`
        });

        // Check if we're on dashboard after navigation
        const currentUrl = page.url();
        const pageTitle = await page.title();

        logToFile(`dashboard_check_${entity}`, {
            currentUrl,
            pageTitle,
            entity,
            runId: `focused-${entity}`
        });

        // Verify we're on the correct dashboard page
        if (!currentUrl.includes('crud_testing_dashboard') || pageTitle.includes('התחברות')) {
            logToFile(`wrong_page_${entity}`, {
                expected: DASHBOARD_URL,
                actual: currentUrl,
                title: pageTitle,
                entity,
                runId: `focused-${entity}`
            });
            throw new Error(`Not on dashboard page. URL: ${currentUrl}, Title: ${pageTitle}`);
        }

        logToFile(`on_correct_page_${entity}`, {
            entity,
            runId: `focused-${entity}`
        });

        // Wait for dashboard to stabilize
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check if dashboard is loaded properly (iframe-based testing)
        const dashboardReady = await page.evaluate(() => {
            // Check if the dashboard testing system is initialized
            return !!(window.crudTester && typeof window.crudTester.runSingleEntityTest === 'function');
        });

        logToFile(`dashboard_ready_check_${entity}`, {
            dashboardReady,
            hasCrudTester: await page.evaluate(() => !!window.crudTester),
            hasRunSingleEntityTest: await page.evaluate(() => !!(window.crudTester && typeof window.crudTester.runSingleEntityTest === 'function')),
            entity,
            runId: `focused-${entity}`
        });

        if (!dashboardReady) {
            logToFile(`dashboard_not_ready_${entity}`, {
                entity,
                runId: `focused-${entity}`
            });

            // Get page diagnostics
            const pageDiagnostics = await page.evaluate(() => {
                return {
                    totalElements: document.querySelectorAll('*').length,
                    visibleElements: Array.from(document.querySelectorAll('*')).filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.width > 0 && rect.height > 0;
                    }).length,
                    testCards: !!document.querySelector('.individual-test-cards'),
                    anyTestCards: !!document.querySelector('.test-entity-card'),
                    crudTestingContainer: !!document.querySelector('#crudTestingContainer'),
                    crudTester: !!window.crudTester,
                    runSingleEntityTest: !!(window.crudTester && typeof window.crudTester.runSingleEntityTest === 'function'),
                    bodyClasses: document.body ? document.body.className : 'no body'
                };
            });

            logToFile(`page_diagnostics_${entity}`, {
                diagnostics: pageDiagnostics,
                entity,
                runId: `focused-${entity}`
            });

            return {
                entity,
                success: false,
                error: 'Dashboard testing system not ready',
                diagnostics: pageDiagnostics
            };
        }

        // Dashboard is ready, run the entity test through the iframe system
        logToFile(`starting_entity_test_${entity}`, {
            entity,
            runId: `focused-${entity}`
        });

        // Run the entity test - choose between iframe or main window
        const useIframe = process.argv.includes('--iframe'); // Pass --iframe flag to use iframe mode
        const mode = useIframe ? 'iframe' : 'main-window';

        logToFile(`test_mode_${entity}`, {
            entity,
            mode,
            useIframe,
            runId: `focused-${entity}-${mode}`
        });

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                location: 'focused_entity_debug.js:test_mode',
                message: `Starting ${mode} test for ${entity}`,
                data: { entity, mode, useIframe },
                timestamp: Date.now(),
                sessionId: 'focused-entity-debug',
                runId: `focused-${entity}-${mode}`,
                hypothesisId: 'iframe-vs-main-window'
            })
        }).catch(() => {});
        // #endregion

        const entityResult = await page.evaluate(async (entityType, useIframe) => {
            try {
                console.log(`🚀 Running ${useIframe ? 'iframe' : 'main-window'}-based test for ${entityType}`);

                // Instrumentation for debugging
                const debugInfo = {
                    headerLoaded: false,
                    topBarLoaded: false,
                    appInitializerFinished: false,
                    apiCalls: [],
                    payloadError: false,
                    startTime: Date.now()
                };

                // Send instrumentation logs
                const sendLog = (message, data) => {
                    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            location: 'focused_entity_debug.js:page_instrumentation',
                            message,
                            data: { ...data, entity: entityType, mode: useIframe ? 'iframe' : 'main-window' },
                            timestamp: Date.now(),
                            sessionId: 'focused-entity-debug',
                            runId: `focused-${entityType}-${useIframe ? 'iframe' : 'main-window'}`,
                            hypothesisId: 'iframe-vs-main-window'
                        })
                    }).catch(() => {});
                };

                // Check Header/TopBar loading
                const checkHeaderTopBar = () => {
                    debugInfo.headerLoaded = !!(document.querySelector('#header-system') || document.querySelector('.header-container'));
                    debugInfo.topBarLoaded = !!(document.querySelector('.top-bar') || document.querySelector('#top-bar'));
                    sendLog('header_topbar_check', { headerLoaded: debugInfo.headerLoaded, topBarLoaded: debugInfo.topBarLoaded });
                };
                checkHeaderTopBar();

                // Check UnifiedAppInitializer
                const checkAppInitializer = () => {
                    if (window.UnifiedAppInitializer) {
                        debugInfo.appInitializerFinished = window.UnifiedAppInitializer.isInitialized || window.UnifiedAppInitializer.finished;
                    }
                    sendLog('app_initializer_check', { appInitializerFinished: debugInfo.appInitializerFinished, hasInitializer: !!window.UnifiedAppInitializer });
                };
                checkAppInitializer();

                // Monitor API calls
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                    const url = args[0];
                    if (typeof url === 'string' && url.includes('/api/')) {
                        const apiCall = {
                            url,
                            method: args[1]?.method || 'GET',
                            timestamp: Date.now()
                        };
                        debugInfo.apiCalls.push(apiCall);
                        sendLog('api_call_detected', apiCall);
                    }
                    return originalFetch.apply(this, args);
                };

                // Monitor for payload initialization error
                const originalError = window.console.error;
                window.console.error = function(...args) {
                    const message = args.join(' ');
                    if (message.includes("Cannot access 'payload' before initialization")) {
                        debugInfo.payloadError = true;
                        sendLog('payload_error_detected', { error: message });
                    }
                    return originalError.apply(this, args);
                };

                let result;
                if (useIframe) {
                    // iframe mode
                    result = await window.crudTester.runSingleEntityTest(entityType);
                } else {
                    // main window mode - simulate direct test
                    // This would require implementing the test logic directly in main window
                    // For now, we'll just check if the functions exist
                    const funcName = {
                        'trade_plan': 'runTradePlanTestOnly',
                        'cash_flow': 'runCashFlowTestOnly',
                        'user_profile': 'runUserProfileTestOnly'
                    }[entityType];

                    if (typeof window[funcName] === 'function') {
                        result = await window[funcName]();
                    } else {
                        throw new Error(`Function ${funcName} not found in main window`);
                    }
                }

                debugInfo.endTime = Date.now();
                debugInfo.duration = debugInfo.endTime - debugInfo.startTime;

                console.log(`✅ Entity test completed for ${entityType}`);
                return { success: true, result, debugInfo };
            } catch (error) {
                console.error(`❌ Entity test failed for ${entityType}:`, error);
                return { success: false, error: error.message, debugInfo: null };
            }
        }, entity, useIframe);

        logToFile(`entity_test_started_${entity}`, {
            function: funcName,
            entity,
            runId: `focused-${entity}`
        });

        // Wait for test completion or timeout
        const testResult = await Promise.race([
            // Wait for completion indicators
            new Promise((resolve) => {
                let completed = false;
                const checkCompletion = () => {
                    if (completed) return;
                    setTimeout(() => {
                        logToFile(`test_completion_check_${entity}`, {
                            entity,
                            runId: `focused-${entity}`
                        });
                        checkCompletion();
                    }, 1000);
                };
                checkCompletion();
            }),
            // Timeout after 30 seconds
            new Promise((resolve) => {
                setTimeout(() => {
                    logToFile(`test_timeout_${entity}`, {
                        entity,
                        timeout: 30000,
                        runId: `focused-${entity}`
                    });
                    resolve({ timeout: true });
                }, 30000);
            })
        ]);

        logToFile(`test_result_${entity}`, {
            result: testResult,
            entity,
            runId: `focused-${entity}`
        });

        // Wait a bit more for any final logs
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            entity,
            success: !testResult.timeout,
            testResult
        };

    } catch (error) {
        logToFile(`error_${entity}`, {
            error: error.message,
            stack: error.stack,
            entity,
            runId: `focused-${entity}`
        });

        return {
            entity,
            success: false,
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

async function main() {
    console.log('🎯 Starting Focused Entity Debug (3 entities)');
    console.log('📍 URL:', DASHBOARD_URL);
    console.log('📝 Using Logger only (no console output)');

    const results = {};

    for (const entity of ENTITIES) {
        console.log(`\n🔍 Testing ${entity}...`);

        const result = await runFocusedEntityTest(entity);
        results[entity] = result;

        console.log(`📊 ${entity}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);

        if (result.success) {
            console.log(`🎉 ${entity} passed in both Page and Dashboard! Moving to next entity.`);
        } else {
            console.log(`❌ ${entity} failed. Check logs for details.`);
        }

        // Small delay between entities
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Generate final report
    const report = {
        timestamp: new Date().toISOString(),
        focusEntities: ENTITIES,
        results,
        environment: {
            dashboardUrl: DASHBOARD_URL,
            method: 'Logger + Network only'
        }
    };

    const reportPath = 'focused_entity_debug_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 FINAL REPORT');
    console.log('===============');
    console.log(`Report saved to: ${reportPath}`);
    console.log(`Logs saved to: ${LOG_PATH}`);
    console.log('\n📋 SUMMARY:');
    ENTITIES.forEach(entity => {
        const result = results[entity];
        console.log(`${entity}: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    });
}

if (require.main === module) {
    main().catch(console.error);
}
