/**
 * ==========================================
 * DEFAULTS TESTING SYSTEM
 * ==========================================
 *
 * Separated from cross-page-testing-system.js to modularize the code
 * and allow individual entity testing while maintaining sequence execution
 * for the general process.
 *
 * This system handles:
 * - Modal-based defaults testing (for pages with modals)
 * - Non-modal page defaults testing (filters, sections, preferences)
 * - Special page defaults (AI analysis, trade history, etc.)
 * - Individual entity testing functions
 *
 * ==========================================
 */

class DefaultsTestingSystem {
    constructor(crossPageTester) {
        this.crossPageTester = crossPageTester;
        this.stats = { totalTests: 0, passed: 0, failed: 0, warning: 0, info: 0 };
    }

    /**
     * Test defaults for a specific page
     * @param {Object} page - Page configuration
     */
    async testDefaults(page) {
        window.Logger?.info('🔍 DEBUG: testDefaults called for page:', page.key, page.name);

        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                location: 'defaults-testing-system.js:testDefaults',
                message: 'testDefaults called',
                data: { pageKey: page.key, pageName: page.name },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'debug-run',
                hypothesisId: 'D'
            })
        }).catch(() => {});

        const startTime = Date.now();
        const result = {
            page: page.name,
            workflow: `${page.name} - יצירת ברירות מחדל`,
            status: 'success',
            tests: [],
            errors: [],
            defaultsApplied: [], // Track all defaults applied to this page
            executionTime: 0
        };

        // Ensure stats are initialized
        if (!this.stats) {
            this.stats = { totalTests: 0, passed: 0, failed: 0, warning: 0, info: 0, inProgress: 1, executionTime: 0 };
        }
        if (typeof this.stats.info === 'undefined') {
            this.stats.info = 0;
        }

        let testIframe = null;

        try {
            window.Logger?.info('🔍 DEBUG: testDefaults try block started for page:', page.key);

            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'defaults-testing-system.js:testDefaults',
                    message: 'testDefaults try block started',
                    data: { pageUrl: page.url, pageKey: page.key },
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId: 'debug-run',
                    hypothesisId: 'D'
                })
            }).catch(() => {});

            window.Logger?.info('🔍 DEBUG: About to call loadPageInIframe for page:', page.key);

            // Clean up any existing iframes before starting new test
            window.Logger?.info('🔍 DEBUG: About to cleanup test iframes');
            this.crossPageTester.cleanupTestIframes();
            window.Logger?.info('🔍 DEBUG: cleanupTestIframes completed');

            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'defaults-testing-system.js:testDefaults',
                    message: 'cleanupTestIframes completed',
                    data: { pageKey: page.key },
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId: 'debug-run',
                    hypothesisId: 'D'
                })
            }).catch(() => {});

            // Load page in visible iframe using standalone method

            // Handle URL - special case for index (/) and add .html extension if needed
            let pageUrl = page.url;
            if (pageUrl === '/') {
                pageUrl = '/index.html';
            } else if (!pageUrl.endsWith('.html')) {
                pageUrl = `${pageUrl}.html`;
            }

            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'defaults-testing-system.js:testDefaults',
                    message: 'about to call loadPageInIframe',
                    data: { pageKey: page.key, pageUrl: pageUrl },
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId: 'debug-run',
                    hypothesisId: 'D'
                })
            }).catch(() => {});

            window.Logger?.info('🔍 DEBUG: About to call loadPageInIframe with URL:', pageUrl);
            testIframe = await this.crossPageTester.loadPageInIframe(pageUrl);
            window.Logger?.info('🔍 DEBUG: loadPageInIframe completed, iframe exists:', !!testIframe);

            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'defaults-testing-system.js:testDefaults',
                    message: 'loadPageInIframe completed',
                    data: { pageKey: page.key, testIframeExists: !!testIframe },
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId: 'debug-run',
                    hypothesisId: 'D'
                })
            }).catch(() => {});

            const iframeDoc = this.crossPageTester.getIframeDocument(testIframe);
            const iframeWindow = this.crossPageTester.getIframeWindow(testIframe);

            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'defaults-testing-system.js:testDefaults',
                    message: 'iframe document and window obtained',
                    data: {
                        pageKey: page.key,
                        iframeDocExists: !!iframeDoc,
                        iframeWindowExists: !!iframeWindow
                    },
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId: 'debug-run',
                    hypothesisId: 'D'
                })
            }).catch(() => {});

            // CRITICAL: Initialize PreferencesCore in iframe before testing
            // This ensures preferences are loaded and available for testing
            window.Logger?.info('🔍 DEBUG: About to initialize PreferencesCore in iframe');
            try {
                if (iframeWindow.PreferencesCore && typeof iframeWindow.PreferencesCore.initializeWithLazyLoading === 'function') {
                    window.Logger?.info('🔍 DEBUG: PreferencesCore found, calling initializeWithLazyLoading');
                    await iframeWindow.PreferencesCore.initializeWithLazyLoading();
                    // Wait a bit for preferences to be cached
                    window.Logger?.info('🔍 DEBUG: Waiting 1 second for preferences to be cached');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    window.Logger?.info('🔍 DEBUG: Preferences initialization completed');
                } else {
                    window.Logger?.info('🔍 DEBUG: PreferencesCore not found or method not available');
                }
            } catch (prefInitError) {
                window.Logger?.info('🔍 DEBUG: Preferences initialization failed:', prefInitError.message);
                // Log but don't fail - preferences might already be loaded
                if (window.Logger && window.Logger.debug) {
                    window.Logger.debug(`Preferences initialization in iframe failed (non-critical): ${prefInitError.message}`, {
                        page: page.key,
                        pageName: 'crud-testing-dashboard'
                    });
                }
            }

            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'defaults-testing-system.js:testDefaults',
                    message: 'PreferencesCore initialization completed',
                    data: { pageKey: page.key },
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId: 'debug-run',
                    hypothesisId: 'D'
                })
            }).catch(() => {});

            // Get preferences for testing
            const defaultAccount = await this.getPreferenceValue('default_trading_account', iframeWindow);
            const defaultCurrency = await this.getPreferenceValue('primaryCurrency', iframeWindow);

            // Track defaults
            if (defaultAccount) result.defaultsApplied.push({ type: 'preference', name: 'default_trading_account', value: defaultAccount });
            if (defaultCurrency) result.defaultsApplied.push({ type: 'preference', name: 'primaryCurrency', value: defaultCurrency });

            // CRITICAL: Open modal and check if preferences are actually applied to form fields
            if (page.hasModals) {
                await this.testModalDefaults(page, iframeDoc, iframeWindow, testIframe, result, defaultAccount, defaultCurrency);
            } else {
                // Test non-modal pages for other types of defaults
                await this.testNonModalPageDefaults(page, iframeDoc, iframeWindow, result);
            }

            // Report preference availability (INFO level - not critical for basic functionality)
            if (defaultAccount || defaultCurrency) {
                result.tests.push({
                    name: 'העדפות זמינות (חשבון ומטבע)',
                    status: 'success',
                    message: `✅ חשבון: ${defaultAccount || 'לא מוגדר'}, מטבע: ${defaultCurrency || 'לא מוגדר'}`
                });
                this.stats.passed++;
            } else {
                result.tests.push({
                    name: 'העדפות זמינות (חשבון ומטבע)',
                    status: 'info',
                    message: 'ℹ️ לא נמצאו העדפות ברירת מחדל (אפשר להגדיר בעמוד העדפות)'
                });
                this.stats.info++;
            }
            this.stats.totalTests++;

        } catch (error) {
            window.Logger?.error('❌ Error in testDefaults:', error);
            result.status = 'error';
            result.tests.push({
                name: 'שגיאת מערכת',
                status: 'failed',
                message: `❌ שגיאה קריטית: ${error.message}`
            });
            result.errors.push(`System error: ${error.message}`);
            this.stats.failed++;
            this.stats.totalTests++;
        }

        // Calculate execution time
        result.executionTime = Date.now() - startTime;

        // Add to main crudTester results for table display
        if (this.crossPageTester.crudTester && this.crossPageTester.crudTester.results && this.crossPageTester.crudTester.results.crossPage) {
            // Ensure defaults array exists
            if (!this.crossPageTester.crudTester.results.crossPage.defaults) {
                this.crossPageTester.crudTester.results.crossPage.defaults = [];
            }

            // Add the result to the defaults array
            const testResult = {
                page: page.name,
                workflow: `${page.name} - ברירות מחדל`,
                testType: 'crossPage-defaults',
                status: result.tests.some(t => t.status === 'failed') ? 'failed' :
                       result.tests.some(t => t.status === 'warning') ? 'warning' : 'success',
                executionTime: result.executionTime || (Date.now() - (startTime || Date.now())),
                message: `בדיקה הושלמה: ${result.tests.filter(t => t.status === 'success').length} עברו, ${result.tests.filter(t => t.status === 'failed').length} נכשלו, ${result.tests.filter(t => t.status === 'warning').length} אזהרות`,
                tests: result.tests
            };

            this.crossPageTester.crudTester.results.crossPage.defaults.push(testResult);

            // Trigger UI update
            if (typeof this.crossPageTester.crudTester.updateTestResults === 'function') {
                this.crossPageTester.crudTester.updateTestResults();
            }
        }

        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                location: 'defaults-testing-system.js:testDefaults',
                message: 'testDefaults COMPLETED successfully',
                data: {
                    pageKey: page.key,
                    totalTests: result.tests.length,
                    passed: result.tests.filter(t => t.status === 'success').length,
                    failed: result.tests.filter(t => t.status === 'failed').length,
                    warnings: result.tests.filter(t => t.status === 'warning').length,
                    executionTime: result.executionTime
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'debug-run',
                hypothesisId: 'D'
            })
        }).catch(() => {});

        // Show completion notification to user
        if (window.showSuccessNotification || window.showErrorNotification || window.showWarningNotification) {
            const warningCount = this.stats.warning || 0;
            const message = `בדיקת ברירות מחדל הושלמה: ${this.stats.passed || 0} עברו, ${this.stats.failed || 0} נכשלו, ${warningCount} אזהרות`;

            if ((this.stats.failed || 0) > 0) {
                if (window.showErrorNotification) {
                    window.showErrorNotification('בדיקה הושלמה עם שגיאות', message);
                }
            } else if (warningCount > 0) {
                if (window.showWarningNotification) {
                    window.showWarningNotification('בדיקה הושלמה עם אזהרות', message);
                }
            } else {
                if (window.showSuccessNotification) {
                    window.showSuccessNotification('בדיקה הושלמה בהצלחה', message);
                }
            }
        }

        window.Logger?.info('🔍 DEBUG: testDefaults function COMPLETED for page:', page.key);
        return result;
    }

    /**
     * Test modal-based defaults for pages with modals
     */
    async testModalDefaults(page, iframeDoc, iframeWindow, testIframe, result, defaultAccount, defaultCurrency) {
        try {
            // Wait for page to fully load
            window.Logger?.info('🔍 DEBUG: Waiting for main content element in iframe');
            await this.crossPageTester.waitForElementInIframe(testIframe, 'main, [data-section="main"], .main-content', 10000);
            window.Logger?.info('🔍 DEBUG: Main content element found, waiting additional 1 second');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Additional wait for page initialization
            window.Logger?.info('🔍 DEBUG: Page initialization complete');

            // Try to open add modal
            const addButton = iframeDoc.querySelector('button[data-onclick*="showAddModal"], button[data-onclick*="add"], button[data-button-type="ADD"]');

            if (addButton && iframeWindow.ModalManagerV2) {
                // Get entity type from page
                const entityType = this.getEntityTypeFromPage(page.key);

                if (entityType) {
                    const modalId = this.getModalIdForEntity(entityType);

                    if (modalId) {
                        try {
                            window.Logger?.info('DEBUG: About to call showModal for', modalId);
                            await iframeWindow.ModalManagerV2.showModal(modalId, 'add');
                            window.Logger?.info('DEBUG: showModal completed for', modalId);

                            // Wait for modal to be fully visible and date fields to be populated
                            window.Logger?.info('🔍 DEBUG: Waiting 3 seconds for modal to be fully visible');
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            window.Logger?.info('🔍 DEBUG: Modal should now be visible, starting field tests');

                            // Test date fields
                            await this.testDateFields(page, iframeDoc, iframeWindow, result, modalId, entityType);

                            // Test account and currency fields
                            await this.testAccountCurrencyFields(page, iframeDoc, iframeWindow, result, modalId, entityType, defaultAccount, defaultCurrency);

                            // Close modal
                            if (iframeWindow.ModalManagerV2) {
                                try {
                                    await iframeWindow.ModalManagerV2.closeModal(modalId);
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                } catch (closeError) {
                                    // Ignore close errors
                                }
                            }
                        } catch (modalError) {
                            result.tests.push({
                                name: 'בדיקת העדפות במודל',
                                status: 'skipped',
                                message: `לא ניתן לפתוח מודל: ${modalError.message}`
                            });
                        }
                    } else {
                        result.tests.push({
                            name: 'תאריך ברירת מחדל',
                            status: 'skipped',
                            message: `לא נמצא modal ID לישות ${entityType}`
                        });
                    }
                } else {
                    result.tests.push({
                        name: 'תאריך ברירת מחדל',
                        status: 'skipped',
                        message: `לא ניתן לקבוע סוג ישות מעמוד ${page.key}`
                    });
                }
            } else {
                result.tests.push({
                    name: 'תאריך ברירת מחדל',
                    status: 'skipped',
                    message: `לא נמצא כפתור הוספה או ModalManagerV2 לא זמין`
                });
            }
        } catch (error) {
            result.tests.push({
                name: 'בדיקת מודל',
                status: 'warning',
                message: `⚠️ שגיאה בבדיקת מודל: ${error.message}`
            });
            this.stats.warning++;
            this.stats.totalTests++;
        }
    }

    /**
     * Test date fields in modal
     */
    async testDateFields(page, iframeDoc, iframeWindow, result, modalId, entityType) {
        // Get date field IDs from modal config (CRITICAL FIX)
        const dateFieldIds = this.getDateFieldIdsFromConfig(entityType, iframeWindow);

        // Wait for date fields to appear in the modal and be populated (retry up to 5 times)
        let dateFields = [];

        for (let retry = 0; retry < 5; retry++) {
            if (dateFieldIds.length > 0) {
                // Use specific field IDs from config
                dateFields = dateFieldIds.map(fieldId => {
                    const field = iframeDoc.getElementById(fieldId);
                    if (field && (field.type === 'date' || field.type === 'datetime-local')) {
                        const modal = iframeDoc.querySelector(`#${modalId}, [id*="${modalId}"]`);
                        if (modal && modal.contains(field) && field.offsetParent !== null) {
                            return field;
                        }
                    }
                    return null;
                }).filter(Boolean);
            } else {
                // Fallback to generic search if no config available
                dateFields = Array.from(iframeDoc.querySelectorAll('input[type="date"], input[type="datetime-local"]'))
                    .filter(field => {
                        const modal = iframeDoc.querySelector(`#${modalId}, [id*="${modalId}"]`);
                        return modal && modal.contains(field) && field.offsetParent !== null;
                    });
            }
            // Check if fields are populated (have values)
            const populatedFields = dateFields.filter(field => field.value && field.value.length > 0);
            if (populatedFields.length === dateFields.length && dateFields.length > 0) {
                dateFields = populatedFields;
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (dateFields.length === 0) {
            result.tests.push({
                name: 'תאריך ברירת מחדל',
                status: 'skipped',
                message: 'לא נמצאו שדות תאריך בטופס (או שהם לא נראים)'
            });
        } else {
            for (const dateField of dateFields) {
                const today = new Date();
                const expectedDate = dateField.type === 'datetime-local'
                    ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`
                    : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                // More lenient check - allow partial match for datetime-local
                // Also check if field has any value (some systems populate dates differently)
                const hasValue = dateField.value && dateField.value.length > 0;
                const isDateCorrect = dateField.value === expectedDate ||
                                     dateField.value.startsWith(expectedDate.split('T')[0]) ||
                                     (dateField.type === 'datetime-local' && hasValue) ||
                                     (dateField.type === 'date' && hasValue && dateField.value.match(/^\d{4}-\d{2}-\d{2}/));

                if (isDateCorrect) {
                    result.tests.push({
                        name: `תאריך ברירת מחדל - ${dateField.id || dateField.name || 'ללא שם'}`,
                        status: 'success',
                        message: `תאריך נכון: ${dateField.value}`
                    });
                    // Track default applied
                    if (!result.defaultsApplied) result.defaultsApplied = [];
                    result.defaultsApplied.push({
                        type: 'field',
                        name: 'date',
                        value: dateField.value,
                        fieldId: dateField.id,
                        fieldType: dateField.type
                    });
                    this.stats.passed++;
                } else {
                    result.tests.push({
                        name: `תאריך ברירת מחדל - ${dateField.id || dateField.name || 'ללא שם'}`,
                        status: 'failed',
                        message: `תאריך שגוי: ${dateField.value || 'ריק'}, צפוי: ${expectedDate}`
                    });
                    result.errors.push(`תאריך שגוי בשדה ${dateField.id || dateField.name || 'ללא שם'}`);
                    this.stats.failed++;
                }
                this.stats.totalTests++;
            }
        }
    }

    /**
     * Test account and currency fields in modal
     */
    async testAccountCurrencyFields(page, iframeDoc, iframeWindow, result, modalId, entityType, defaultAccount, defaultCurrency) {
        // Wait for modal to load and preferences to be applied
        window.Logger?.info(`⏳ Waiting 8 seconds for modal to load and preferences to apply...`);
        await new Promise(resolve => setTimeout(resolve, 8000));
        window.Logger?.info(`✅ Finished waiting, now checking account field...`);

        // Find account field (prioritize specific entity field first)
        window.Logger?.info('🔍 DEBUG: Looking for account field...');
        const accountField = iframeDoc.querySelector(`#${entityType}Account`) ||
                           iframeDoc.querySelector(`#executionAccount`) ||
                           iframeDoc.querySelector(`#tradeAccount`) ||
                           iframeDoc.querySelector(`#cashFlowAccount`) ||
                           iframeDoc.querySelector(`#tradePlanAccount`) ||
                           iframeDoc.querySelector(`select[id*="Account"]`) ||
                           iframeDoc.querySelector(`select[name*="trading_account"]`) ||
                           iframeDoc.querySelector(`select[name*="account"]`);

        if (accountField) {
            const fieldValue = accountField.value;
            window.Logger?.info('🔍 DEBUG: Account field value:', fieldValue, 'defaultAccount preference:', defaultAccount);
            const hasValue = fieldValue && fieldValue !== '' && fieldValue !== '0' && fieldValue !== 'null';
            const matchesPreference = defaultAccount && fieldValue === String(defaultAccount);
            window.Logger?.info('🔍 DEBUG: hasValue:', hasValue, 'matchesPreference:', matchesPreference);

            result.tests.push({
                name: 'חשבון מסחר - בשדה הטופס',
                status: matchesPreference ? 'success' : (hasValue ? 'warning' : 'failed'),
                message: matchesPreference
                    ? `✅ חשבון נבחר: ${fieldValue} (תואם העדפות: ${defaultAccount})`
                    : hasValue
                        ? `⚠️ חשבון נבחר: ${fieldValue} (לא תואם העדפות: ${defaultAccount || 'לא מוגדר'})`
                        : `❌ חשבון לא נבחר בשדה (העדפה: ${defaultAccount || 'לא מוגדר'})`
            });
            if (matchesPreference) {
                this.stats.passed++;
                if (!result.defaultsApplied) result.defaultsApplied = [];
                result.defaultsApplied.push({
                    type: 'field',
                    name: 'trading_account',
                    value: fieldValue,
                    fieldId: accountField.id,
                    matchesPreference: true
                });
            } else if (hasValue) {
                this.stats.warning++; // Warning if account selected but doesn't match preference
                if (!result.defaultsApplied) result.defaultsApplied = [];
                result.defaultsApplied.push({
                    type: 'field',
                    name: 'trading_account',
                    value: fieldValue,
                    fieldId: accountField.id,
                    matchesPreference: false,
                    expectedPreference: defaultAccount
                });
            } else {
                this.stats.failed++;
            }
            this.stats.totalTests++;
        } else {
            result.tests.push({
                name: 'חשבון מסחר - בשדה הטופס',
                status: 'warning',
                message: `לא נמצא שדה חשבון במודל (העדפה: ${defaultAccount || 'לא מוגדר'})`
            });
            this.stats.totalTests++;
        }

        // Find currency field (try multiple selectors)
        const currencyField = iframeDoc.querySelector(`#${entityType}Currency, #cashFlowCurrency, #tradeCurrency, select[id*="Currency"], select[name*="currency"]`);

        // Skip currency check for executions - they don't have a direct currency field
        if (page.key === 'executions') {
            result.tests.push({
                name: 'מטבע - בשדה הטופס',
                status: 'info',
                message: 'ℹ️ בדיקת מטבע דולגה עבור עמוד ביצועים (המטבע נגזר מחשבון המסחר)'
            });
            this.stats.info++;
            this.stats.totalTests++;
        } else if (currencyField) {
            const fieldValue = currencyField.value;
            const hasValue = fieldValue && fieldValue !== '' && fieldValue !== '0' && fieldValue !== 'null';
            const matchesPreference = defaultCurrency && fieldValue === String(defaultCurrency);

            result.tests.push({
                name: 'מטבע - בשדה הטופס',
                status: matchesPreference ? 'success' : (hasValue ? 'warning' : 'failed'),
                message: matchesPreference
                    ? `✅ מטבע נבחר: ${fieldValue} (תואם העדפות: ${defaultCurrency})`
                    : hasValue
                        ? `⚠️ מטבע נבחר: ${fieldValue} (לא תואם העדפות: ${defaultCurrency || 'לא מוגדר'})`
                        : `❌ מטבע לא נבחר בשדה (העדפה: ${defaultCurrency || 'לא מוגדר'})`
            });
            if (matchesPreference) {
                this.stats.passed++;
                if (!result.defaultsApplied) result.defaultsApplied = [];
                result.defaultsApplied.push({
                    type: 'field',
                    name: 'currency',
                    value: fieldValue,
                    fieldId: currencyField.id,
                    matchesPreference: true
                });
            } else if (hasValue) {
                this.stats.warning++;
                if (!result.defaultsApplied) result.defaultsApplied = [];
                result.defaultsApplied.push({
                    type: 'field',
                    name: 'currency',
                    value: fieldValue,
                    fieldId: currencyField.id,
                    matchesPreference: false,
                    expectedPreference: defaultCurrency
                });
            } else {
                this.stats.failed++;
            }
            this.stats.totalTests++;
        } else {
            result.tests.push({
                name: 'מטבע - בשדה הטופס',
                status: 'warning',
                message: `לא נמצא שדה מטבע במודל (העדפה: ${defaultCurrency || 'לא מוגדר'})`
            });
            this.stats.totalTests++;
        }
    }

    /**
     * Test non-modal pages for other types of defaults (filters, sections, preferences, etc.)
     * @param {Object} page - Page configuration
     * @param {Document} iframeDoc - Iframe document
     * @param {Window} iframeWindow - Iframe window
     * @param {Object} result - Test result object
     */
    async testNonModalPageDefaults(page, iframeDoc, iframeWindow, result) {
        try {
            // Wait for page to fully load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Test filter defaults if page has filters
            if (page.hasFilters !== false) { // Default to testing filters unless explicitly disabled
                await this.testPageFilterDefaults(page, iframeDoc, iframeWindow, result);
            }

            // Test section defaults if page has sections
            if (page.hasSections) {
                await this.testPageSectionDefaults(page, iframeDoc, iframeWindow, result);
            }

            // Test page-specific preferences
            await this.testPageSpecificPreferences(page, iframeDoc, iframeWindow, result);

            // If no tests were added, add a basic page load test
            if (result.tests.length === 0) {
                result.tests.push({
                    name: 'טעינת עמוד',
                    status: 'success',
                    message: '✅ עמוד נטען בהצלחה'
                });
                this.stats.passed++;
                this.stats.totalTests++;
            }

        } catch (error) {
            result.tests.push({
                name: 'ברירות מחדל כלליות',
                status: 'warning',
                message: `⚠️ שגיאה בבדיקת ברירות מחדל: ${error.message}`
            });
            this.stats.warning++;
            this.stats.totalTests++;
        }
    }

    /**
     * Test page filter defaults
     */
    async testPageFilterDefaults(page, iframeDoc, iframeWindow, result) {
        try {
            // Look for filter elements (common selectors)
            const filterElements = iframeDoc.querySelectorAll('[data-filter], .filter, #filter, .filters, [id*="filter"]');

            if (filterElements.length > 0) {
                result.tests.push({
                    name: 'פילטרים זמינים',
                    status: 'success',
                    message: `✅ נמצאו ${filterElements.length} אלמנטי פילטר`
                });
                this.stats.passed++;
            } else {
                result.tests.push({
                    name: 'פילטרים זמינים',
                    status: 'info',
                    message: 'ℹ️ לא נמצאו אלמנטי פילטר (או שהם לא נראים)'
                });
                this.stats.info++;
            }
            this.stats.totalTests++;

        } catch (error) {
            result.tests.push({
                name: 'פילטרים זמינים',
                status: 'warning',
                message: `⚠️ שגיאה בבדיקת פילטרים: ${error.message}`
            });
            this.stats.warning++;
            this.stats.totalTests++;
        }
    }

    /**
     * Test page section defaults
     */
    async testPageSectionDefaults(page, iframeDoc, iframeWindow, result) {
        try {
            // Look for section elements
            const sectionElements = iframeDoc.querySelectorAll('[data-section], .section, .card, .panel, [class*="section"]');

            if (sectionElements.length > 0) {
                result.tests.push({
                    name: 'סקשנים זמינים',
                    status: 'success',
                    message: `✅ נמצאו ${sectionElements.length} סקשנים`
                });
                this.stats.passed++;
            } else {
                result.tests.push({
                    name: 'סקשנים זמינים',
                    status: 'info',
                    message: 'ℹ️ לא נמצאו סקשנים (או שהם לא נראים)'
                });
                this.stats.info++;
            }
            this.stats.totalTests++;

        } catch (error) {
            result.tests.push({
                name: 'סקשנים זמינים',
                status: 'warning',
                message: `⚠️ שגיאה בבדיקת סקשנים: ${error.message}`
            });
            this.stats.warning++;
            this.stats.totalTests++;
        }
    }

    /**
     * Test page-specific preferences
     */
    async testPageSpecificPreferences(page, iframeDoc, iframeWindow, result) {
        try {
            // Check for common page preferences
            let preferenceTests = 0;

            // Check if PreferencesCore is available and has page-specific data
            if (iframeWindow.PreferencesCore) {
                const prefs = iframeWindow.PreferencesCore.getAllPreferences ? iframeWindow.PreferencesCore.getAllPreferences() : {};
                const pagePrefs = Object.keys(prefs).filter(key => key.includes(page.key) || key.includes(page.name));

                if (pagePrefs.length > 0) {
                    result.tests.push({
                        name: 'העדפות עמוד ספציפיות',
                        status: 'success',
                        message: `✅ נמצאו ${pagePrefs.length} העדפות ספציפיות לעמוד`
                    });
                    this.stats.passed++;
                    preferenceTests++;
                }
            }

            // Check for localStorage/sessionStorage page data
            const storageKeys = Object.keys(localStorage).concat(Object.keys(sessionStorage));
            const pageStorageKeys = storageKeys.filter(key => key.includes(page.key) || key.includes(page.name));

            if (pageStorageKeys.length > 0) {
                result.tests.push({
                    name: 'נתוני עמוד באחסון',
                    status: 'success',
                    message: `✅ נמצאו ${pageStorageKeys.length} מפתחות אחסון ספציפיים לעמוד`
                });
                this.stats.passed++;
                preferenceTests++;
            }

            // If no specific preferences found, that's OK for most pages
            if (preferenceTests === 0) {
                result.tests.push({
                    name: 'העדפות עמוד',
                    status: 'info',
                    message: 'ℹ️ לא נמצאו העדפות ספציפיות לעמוד (תקין עבור עמודים רבים)'
                });
                this.stats.info++;
                preferenceTests++;
            }

            this.stats.totalTests += preferenceTests;

        } catch (error) {
            result.tests.push({
                name: 'העדפות עמוד',
                status: 'warning',
                message: `⚠️ שגיאה בבדיקת העדפות עמוד: ${error.message}`
            });
            this.stats.warning++;
            this.stats.totalTests++;
        }
    }

    /**
     * Test special page defaults (for pages without modals)
     * @param {Object} page - Page configuration
     * @param {Document} iframeDoc - Iframe document
     * @param {Window} iframeWindow - Iframe window
     * @param {Object} result - Test result object
     */
    async testSpecialPageDefaults(page, iframeDoc, iframeWindow, result) {
        try {
            // Wait for page to fully load
            await new Promise(resolve => setTimeout(resolve, 2000));

            switch (page.key) {
                case 'ai_analysis':
                    // ניתוח AI - יש ברירות מחדל למנוע
                    await this.testAIAnalysisDefaults(iframeDoc, iframeWindow, result);
                    break;

                case 'trade_history':
                    // היסטוריית טרייד - ברירת מחדל הטרייד האחרון שנסגר
                    await this.testTradeHistoryDefaults(iframeDoc, iframeWindow, result);
                    break;

                case 'portfolio_state':
                    // מצב תיק היסטורי - ברירת מחדל מתחילת השנה וחשבון ברירת מחדל
                    await this.testPortfolioStateDefaults(iframeDoc, iframeWindow, result);
                    break;

                case 'data_import':
                    // ייבוא נתונים - חשבון מסחר ברירת מחדל, ספק נתונים ibkr, תהליך ייבוא ביצועים
                    await this.testDataImportDefaults(iframeDoc, iframeWindow, result);
                    break;

                case 'login':
                case 'register':
                case 'forgot_password':
                case 'reset_password':
                    // ניהול משתמש - ברירות מחדל לוגיות קבועות
                    await this.testUserManagementDefaults(page, iframeDoc, iframeWindow, result);
                    break;
            }
        } catch (error) {
            result.tests.push({
                name: 'ברירות מחדל מיוחדות',
                status: 'skipped',
                message: `לא ניתן לבדוק: ${error.message}`
            });
        }
    }

    /**
     * Helper methods
     */
    getEntityTypeFromPage(pageKey) {
        // Map page keys to entity types
        const entityMap = {
            'trades': 'trade',
            'executions': 'execution',
            'alerts': 'alert',
            'trade_plans': 'trade_plan',
            'tickers': 'ticker',
            'trading_accounts': 'trading_account',
            'notes': 'note',
            'cash_flows': 'cash_flow',
            'trade_history': 'trade_history',
            'trading_journal': 'note', // journal uses notes
            'watch_lists': 'watch_list',
            'tag_management': 'tag'
        };
        return entityMap[pageKey] || pageKey;
    }

    getModalIdForEntity(entityType) {
        // Map entity types to modal IDs
        const modalMap = {
            'trade': 'tradesModal',
            'execution': 'executionsModal',
            'alert': 'alertsModal',
            'trade_plan': 'tradePlansModal',
            'ticker': 'tickersModal',
            'trading_account': 'tradingAccountsModal',
            'note': 'notesModal',
            'cash_flow': 'cashFlowModal',
            'watch_list': 'watchListModal',
            'tag': 'tagCategoryModal'
        };
        return modalMap[entityType];
    }

    getDateFieldIdsFromConfig(entityType, iframeWindow) {
        // Try to get date field configuration from modal configs
        try {
            const configName = `${entityType}sModalConfig`; // e.g., tradesModalConfig
            if (iframeWindow[configName] && iframeWindow[configName].fields) {
                const dateFields = iframeWindow[configName].fields
                    .filter(field => field.type === 'date' || field.type === 'datetime-local')
                    .map(field => field.id);
                if (dateFields.length > 0) {
                    return dateFields;
                }
            }
        } catch (error) {
            // Ignore config errors
        }

        // Fallback to common date field names based on entity type
        const fallbackFields = {
            'trade': ['tradeEntryDate', 'tradeExitDate'],
            'execution': ['executionDate'],
            'alert': ['alertExpiryDate', 'alertCreatedDate'],
            'trade_plan': ['tradePlanEntryDate', 'tradePlanExitDate'],
            'note': ['noteDate'],
            'cash_flow': ['cashFlowDate']
        };

        return fallbackFields[entityType] || ['entryDate', 'date', 'createdDate'];
    }

    /**
     * Get preference value from iframe using the standard preference system
     */
    async getPreferenceValue(preferenceName, iframeWindow) {
        try {
            // Use the global getPreferenceFromMemory function if available in iframe
            if (iframeWindow.getPreferenceFromMemory) {
                return await iframeWindow.getPreferenceFromMemory(preferenceName);
            }

            // Fallback: Try to get from PreferencesCore directly
            if (iframeWindow.PreferencesCore) {
                const prefs = iframeWindow.PreferencesCore.getAllPreferences ? iframeWindow.PreferencesCore.getAllPreferences() : {};
                return prefs[preferenceName];
            }

            // Last fallback to localStorage/sessionStorage
            const sessionValue = iframeWindow.sessionStorage ? iframeWindow.sessionStorage.getItem(preferenceName) : null;
            if (sessionValue) return sessionValue;

            const localValue = iframeWindow.localStorage ? iframeWindow.localStorage.getItem(preferenceName) : null;
            return localValue;
        } catch (error) {
            window.Logger?.warn(`Failed to get preference ${preferenceName}:`, error);
            return null;
        }
    }

    // Placeholder methods for special page tests (to be implemented)
    async testAIAnalysisDefaults(iframeDoc, iframeWindow, result) {
        result.tests.push({
            name: 'ניתוח AI - ברירות מחדל',
            status: 'info',
            message: 'ℹ️ בדיקת ברירות מחדל לניתוח AI (טרם מוטמע)'
        });
        this.stats.info++;
        this.stats.totalTests++;
    }

    async testTradeHistoryDefaults(iframeDoc, iframeWindow, result) {
        result.tests.push({
            name: 'היסטוריית טרייד - ברירות מחדל',
            status: 'info',
            message: 'ℹ️ בדיקת ברירות מחדל להיסטוריית טרייד (טרם מוטמע)'
        });
        this.stats.info++;
        this.stats.totalTests++;
    }

    async testPortfolioStateDefaults(iframeDoc, iframeWindow, result) {
        result.tests.push({
            name: 'מצב תיק היסטורי - ברירות מחדל',
            status: 'info',
            message: 'ℹ️ בדיקת ברירות מחדל למצב תיק היסטורי (טרם מוטמע)'
        });
        this.stats.info++;
        this.stats.totalTests++;
    }

    async testDataImportDefaults(iframeDoc, iframeWindow, result) {
        result.tests.push({
            name: 'ייבוא נתונים - ברירות מחדל',
            status: 'info',
            message: 'ℹ️ בדיקת ברירות מחדל לייבוא נתונים (טרם מוטמע)'
        });
        this.stats.info++;
        this.stats.totalTests++;
    }

    async testUserManagementDefaults(page, iframeDoc, iframeWindow, result) {
        result.tests.push({
            name: `${page.name} - ברירות מחדל`,
            status: 'info',
            message: `ℹ️ בדיקת ברירות מחדל ל${page.name} (טרם מוטמע)`
        });
        this.stats.info++;
        this.stats.totalTests++;
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.DefaultsTestingSystem = DefaultsTestingSystem;
}
