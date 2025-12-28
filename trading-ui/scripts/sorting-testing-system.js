/**
 * ==========================================
 * SORTING TESTING SYSTEM
 * ==========================================
 *
 * Separated from cross-page-testing-system.js to modularize the code
 * and allow individual entity testing while maintaining sequence execution
 * for the general process.
 *
 * This system handles:
 * - Individual page table sorting testing
 * - Modal-based sorting testing (for pages with modals)
 * - Non-modal page sorting testing (for pages with tables)
 * - Special page sorting (AI analysis, trade history, etc.)
 * - Individual entity testing functions
 *
 * ==========================================
 */

class SortingTestingSystem {
    constructor(crossPageTester) {
        this.crossPageTester = crossPageTester;
        this.stats = { totalTests: 0, passed: 0, failed: 0, warning: 0, info: 0 };
        this.testedPages = new Set(); // Track pages that have been tested to prevent duplicates
    }

    /**
     * Test sorting for a specific page
     * @param {Object} page - Page configuration
     */
    async testSorting(page) {
        console.log('🔍 DEBUG: SortingTestingSystem.testSorting called for page:', page.key, page.name);

        // Check if page has already been tested
        const pageKey = `${page.key}-${page.name}`;
        if (this.testedPages.has(pageKey)) {
            console.log('⚠️ Page already tested, skipping:', page.name);
            // #region agent log - PAGE ALREADY TESTED
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    location:'sorting-testing-system.js:testSorting:already-tested',
                    message:`Page already tested, skipping: ${page.name}`,
                    data:{
                        pageName:page.name,
                        pageKey:page.key,
                        testedPagesCount:this.testedPages.size
                    },
                    timestamp:Date.now(),
                    sessionId:'debug-session',
                    runId:'individual-sorting-test',
                    hypothesisId:'INDIVIDUAL_TESTING'
                })
            }).catch(()=>{});
            // #endregion
            return null; // Return null to indicate page was skipped
        }

        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                location: 'sorting-testing-system.js:testSorting',
                message: 'SortingTestingSystem.testSorting called',
                data: { pageKey: page.key, pageName: page.name, hasTables: page.hasTables },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'individual-sorting-test',
                hypothesisId: 'INDIVIDUAL_TESTING'
            })
        }).catch(() => {});

        const startTime = Date.now();
        const result = {
            page: page.name,
            workflow: `${page.name} - מיון טבלאות`,
            status: 'success',
            tests: [],
            errors: [],
            tablesTested: 0,
            tablesFound: 0,
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
            console.log('🔍 DEBUG: SortingTestingSystem.testSorting try block started for page:', page.key);

            // Skip testing the current page to avoid conflicts
            const currentPath = window.location.pathname;
            const pagePath = page.url === '/' ? '/index.html' : (page.url.endsWith('.html') ? page.url : `${page.url}.html`);

            // #region agent log - HYPOTHESIS 6: Check current page logic
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    location:'sorting-testing-system.js:testSorting:current-page-check',
                    message:`Checking if current page should be skipped`,
                    data:{
                        pageName:page.name,
                        pageKey:page.key,
                        pageUrl:page.url,
                        currentPath:currentPath,
                        pagePath:pagePath,
                        shouldSkip:currentPath === pagePath,
                        pageKeyInTestedPages:this.testedPages.has(pageKey)
                    },
                    timestamp:Date.now(),
                    sessionId:'debug-session',
                    runId:'sorting-test-debug',
                    hypothesisId:'H6_CURRENT_PAGE_CHECK'
                })
            }).catch(()=>{});
            // #endregion

            if (currentPath === pagePath || page.key === 'index') {
                console.log('⚠️ Skipping sorting test for page:', page.key, '- index page causes conflicts when loaded in iframe');
                result.status = 'warning';
                result.executionTime = Date.now() - startTime;
                result.message = `דילוג על בדיקת דף הבית: ${page.name} (גורם להתנגשויות ב-iframe)`;
                result.tablesFound = 0;
                result.tablesTested = 0;
                this.testedPages.add(pageKey);
                this.crossPageTester.crudTester.results.crossPage.sorting.push(result);
                this.crossPageTester.crudTester.updateTestResults();
                return result;
            }

            // Also check if this page was already tested (deduplication)
            if (this.testedPages.has(pageKey)) {
                console.log('⚠️ Skipping already tested page:', page.key);
                result.status = 'warning';
                result.executionTime = Date.now() - startTime;
                result.message = `עמוד כבר נבדק: ${page.name}`;
                result.tablesFound = 0;
                result.tablesTested = 0;
                return result;
            }

            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'sorting-testing-system.js:testSorting',
                    message: 'SortingTestingSystem.testSorting try block started',
                    data: { pageUrl: page.url, pageKey: page.key, currentPath, pagePath },
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId: 'individual-sorting-test',
                    hypothesisId: 'INDIVIDUAL_TESTING'
                })
            }).catch(() => {});

            // Clean up any existing iframes before starting new test
            console.log('🔍 DEBUG: About to cleanup test iframes');
            this.crossPageTester.cleanupTestIframes();
            console.log('🔍 DEBUG: cleanupTestIframes completed');

            // Handle URL - special case for index (/) and add .html extension if needed
            let pageUrl = page.url;
            if (pageUrl === '/') {
                pageUrl = '/index.html';
            } else if (!pageUrl.endsWith('.html')) {
                pageUrl = `${pageUrl}.html`;
            }

            console.log('🔍 DEBUG: About to call loadPageInIframe for page:', page.key);
            testIframe = await this.crossPageTester.loadPageInIframe(pageUrl);

            console.log('🔍 DEBUG: loadPageInIframe completed, iframe loaded');

            const iframeDoc = this.crossPageTester.getIframeDocument(testIframe);
            const iframeWindow = this.crossPageTester.getIframeWindow(testIframe);

            // Wait for table to have actual data rows (not just empty or loading)
            await this.crossPageTester.waitForElementInIframe(testIframe, 'table, table tbody', 10000);

            // Wait longer for dynamic data loading
            await this.crossPageTester.waitForElementInIframe(testIframe, 'table tbody tr:not(:empty), table tr[data-id], table tr:has(td:not(:empty))', 30000);

            // Additional wait for actual data to be loaded
            await new Promise(resolve => {
                const checkForData = () => {
                    try {
                        const iframeDoc = this.crossPageTester.getIframeDocument(testIframe);
                        const rows = iframeDoc.querySelectorAll('table tbody tr');
                        let hasData = false;

                        for (const row of rows) {
                            const cells = row.querySelectorAll('td');
                            if (cells.length > 0) {
                                for (const cell of cells) {
                                    const text = cell.textContent?.trim();
                                    if (text && text !== '' && text !== '-' && text !== 'N/A' && text !== 'לא זמין') {
                                        hasData = true;
                                        break;
                                    }
                                }
                                if (hasData) break;
                            }
                        }

                        if (hasData && rows.length >= 2) {
                            resolve();
                        } else {
                            setTimeout(checkForData, 1000); // Check every second
                        }
                    } catch (e) {
                        setTimeout(checkForData, 1000);
                    }
                };

                // Timeout after 45 seconds if no data loads
                setTimeout(() => resolve(), 45000);
                checkForData();
            });

            // Find ALL tables on the page - count them accurately
            const allTables = Array.from(iframeDoc.querySelectorAll('table'));
            result.tablesFound = allTables.length;

            // Get all testable tables (with data-table-type)
            const testableTables = iframeDoc.querySelectorAll('table[data-table-type]');
            result.tablesTested = testableTables.length;

            if (testableTables.length === 0) {
                result.tablesFound = iframeDoc.querySelectorAll('table').length;
                result.tablesTested = 0;

                result.tests.push({
                    name: 'מיון טבלאות',
                    status: 'skipped',
                    message: 'לא נמצאה טבלה'
                });

                // Create final result with proper message format
                result.status = 'warning';
                result.executionTime = Date.now() - startTime;
                result.message = `בדיקת מיון הושלמה: טבלאות ${result.tablesTested}/${result.tablesFound}, ${result.tests.filter(t => t.status === 'success').length} עברו, ${result.tests.filter(t => t.status === 'failed').length} נכשלו, ${result.tests.filter(t => t.status === 'warning').length} אזהרות`;

                // Mark page as tested
                this.testedPages.add(pageKey);

                // Store result in crudTester
                if (this.crossPageTester.crudTester && this.crossPageTester.crudTester.results &&
                    this.crossPageTester.crudTester.results.crossPage) {
                    if (!this.crossPageTester.crudTester.results.crossPage.sorting) {
                        this.crossPageTester.crudTester.results.crossPage.sorting = [];
                    }
                    this.crossPageTester.crudTester.results.crossPage.sorting.push(result);
                    this.crossPageTester.crudTester.updateTestResults();
                }

                return result;
            }

            // Check if table has data rows
            const allRows = Array.from(table.querySelectorAll('tbody tr, tbody > tr'));
            const dataRows = allRows.filter(row => {
                const cells = row.querySelectorAll('td');
                return cells.length > 0 && Array.from(cells).some(cell => cell.textContent && cell.textContent.trim() !== '');
            });

            // Allow testing even with empty tables for structure validation
            if (dataRows.length < 2) {
                result.tests.push({
                    name: 'מבנה טבלה',
                    status: 'success',
                    message: `טבלה נמצאה עם ${allRows.length} שורות (${dataRows.length} עם נתונים)`
                });

                result.tests.push({
                    name: 'מיון טבלאות',
                    status: 'skipped',
                    message: `דילוג על מיון - לא מספיק נתונים (${dataRows.length} שורות)`
                });

                result.status = 'success';
                result.executionTime = Date.now() - startTime;
                result.tablesTested = result.tablesFound; // Test all tables found, not just those with data-table-type
                result.message = `בדיקת מיון הושלמה: טבלאות ${result.tablesTested}/${result.tablesFound}, ${result.tests.filter(t => t.status === 'success').length} עברו, ${result.tests.filter(t => t.status === 'failed').length} נכשלו, ${result.tests.filter(t => t.status === 'warning').length} אזהרות`;

                // Mark page as tested
                this.testedPages.add(pageKey);

                // Store result
                if (this.crossPageTester.crudTester && this.crossPageTester.crudTester.results &&
                    this.crossPageTester.crudTester.results.crossPage) {
                    if (!this.crossPageTester.crudTester.results.crossPage.sorting) {
                        this.crossPageTester.crudTester.results.crossPage.sorting = [];
                    }
                    this.crossPageTester.crudTester.results.crossPage.sorting.push(result);
                    this.crossPageTester.crudTester.updateTestResults();
                }

                return result;
            }

            // Test multiple tables info
            if (testableTables.length > 1) {
                result.tests.push({
                    name: 'טבלאות מרובות',
                    status: 'success',
                    message: `נמצאו ${testableTables.length} טבלאות עם data-table-type`
                });
                this.stats.passed++;
                this.stats.totalTests++;
            }

            // Test each table with data-table-type
            let tablesActuallyTested = 0;
            for (let i = 0; i < testableTables.length; i++) {
                const table = testableTables[i];
                const tableType = table.getAttribute('data-table-type') || this.crossPageTester.getEntityTypeFromPage(page.key);

                try {
                    // Check if table has data rows
                    const allRows = Array.from(table.querySelectorAll('tbody tr, tbody > tr'));
                    const dataRows = allRows.filter(row => {
                        const cells = row.querySelectorAll('td');
                        return cells.length > 0 && Array.from(cells).some(cell => cell.textContent && cell.textContent.trim() !== '');
                    });

                    if (dataRows.length < 2) {
                        result.tests.push({
                            name: `טבלה ${i + 1} - מבנה`,
                            status: 'success',
                            message: `טבלה נמצאה עם ${allRows.length} שורות (${dataRows.length} עם נתונים)`
                        });
                        result.tests.push({
                            name: `טבלה ${i + 1} - מיון`,
                            status: 'skipped',
                            message: `דילוג על מיון - לא מספיק נתונים (${dataRows.length} שורות)`
                        });
                        continue;
                    }

                    tablesActuallyTested++;

                    // Test default sort for this table
                    if (iframeWindow.UnifiedTableSystem && iframeWindow.UnifiedTableSystem.registry.isRegistered(tableType)) {
                        const config = iframeWindow.UnifiedTableSystem.registry.getConfig(tableType);
                        if (config && config.defaultSort) {
                            result.tests.push({
                                name: `טבלה ${i + 1} - ברירת מחדל`,
                                status: 'success',
                                message: `ברירת מחדל מוגדרת: ${JSON.stringify(config.defaultSort)}`
                            });
                            this.stats.passed++;
                        } else {
                            result.tests.push({
                                name: `טבלה ${i + 1} - ברירת מחדל`,
                                status: 'warning',
                                message: 'ברירת מחדל לא מוגדרת'
                            });
                            this.stats.warning++;
                        }
                    } else {
                        result.tests.push({
                            name: `טבלה ${i + 1} - ברירת מחדל`,
                            status: 'warning',
                            message: 'מערכת טבלאות לא רשומה'
                        });
                        this.stats.warning++;
                    }
                    this.stats.totalTests++;

                    // Test column sorting functionality for this table
                    try {
                        // Find sortable headers
                        const sortableHeaders = Array.from(table.querySelectorAll('.sortable-header, th[data-sort], th.sortable'));
                        if (sortableHeaders.length > 0) {
                            const firstHeader = sortableHeaders[0];

                            // Extract initial column values for proper sorting verification
                            const initialRows = Array.from(table.querySelectorAll('tbody tr, tbody > tr'));
                            const thElement = firstHeader.closest('th');
                            const columnIndex = thElement ? Array.from(thElement.parentElement.children).indexOf(thElement) : 0;

                            const initialValues = initialRows.map(row => {
                                const cells = row.querySelectorAll('td');
                                return cells[columnIndex]?.textContent?.trim() || '';
                            }).filter(val => val !== '');

                            if (initialValues.length >= 2) {
                                // Click header to sort ASC
                                firstHeader.click();
                                await new Promise(resolve => setTimeout(resolve, 1500));

                                // Extract values after sorting
                                const afterClickRows = Array.from(table.querySelectorAll('tbody tr, tbody > tr'));
                                const afterClickValues = afterClickRows.map(row => {
                                    const cells = row.querySelectorAll('td');
                                    return cells[columnIndex]?.textContent?.trim() || '';
                                }).filter(val => val !== '');

                                // Check if values are sorted ascending
                                const isSortedAsc = afterClickValues.every((val, index) =>
                                    index === 0 || afterClickValues[index - 1] <= val
                                );

                                if (isSortedAsc) {
                                    result.tests.push({
                                        name: `טבלה ${i + 1} - מיון עולה`,
                                        status: 'success',
                                        message: `הטבלה ממוינת עולה: ${afterClickValues.slice(0, 3).join(', ')}...`
                                    });
                                    this.stats.passed++;
                                } else {
                                    result.tests.push({
                                        name: `טבלה ${i + 1} - מיון עולה`,
                                        status: 'failed',
                                        message: `הטבלה לא ממוינת כראוי: ${afterClickValues.slice(0, 3).join(', ')}...`
                                    });
                                    this.stats.failed++;
                                }
                                this.stats.totalTests++;

                                // Test second click reverses sort (DESC)
                                firstHeader.click();
                                await new Promise(resolve => setTimeout(resolve, 1500));

                                // Extract values after second click
                                const afterSecondClickRows = Array.from(table.querySelectorAll('tbody tr, tbody > tr'));
                                const afterSecondClickValues = afterSecondClickRows.map(row => {
                                    const cells = row.querySelectorAll('td');
                                    return cells[columnIndex]?.textContent?.trim() || '';
                                }).filter(val => val !== '');

                                // Check if values are sorted descending
                                const isSortedDesc = afterSecondClickValues.every((val, index) =>
                                    index === 0 || afterSecondClickValues[index - 1] >= val
                                );

                                if (isSortedDesc) {
                                    result.tests.push({
                                        name: `טבלה ${i + 1} - מיון יורד`,
                                        status: 'success',
                                        message: `הטבלה ממוינת יורד: ${afterSecondClickValues.slice(0, 3).join(', ')}...`
                                    });
                                    this.stats.passed++;
                                } else {
                                    result.tests.push({
                                        name: `טבלה ${i + 1} - מיון יורד`,
                                        status: 'failed',
                                        message: `הטבלה לא ממוינת כראוי: ${afterSecondClickValues.slice(0, 3).join(', ')}...`
                                    });
                                    this.stats.failed++;
                                }
                                this.stats.totalTests++;
                            } else {
                                result.tests.push({
                                    name: `טבלה ${i + 1} - מיון עמודות`,
                                    status: 'skipped',
                                    message: `לא מספיק נתונים לבדיקת מיון (${initialValues.length} ערכים)`
                                });
                            }
                        } else {
                            result.tests.push({
                                name: `טבלה ${i + 1} - מיון עמודות`,
                                status: 'warning',
                                message: 'לא נמצאו עמודות ניתנות למיון'
                            });
                            this.stats.warning++;
                            this.stats.totalTests++;
                        }
                    } catch (error) {
                        result.tests.push({
                            name: `טבלה ${i + 1} - מיון עמודות`,
                            status: 'failed',
                            message: `שגיאה בבדיקת מיון עמודות: ${error.message}`
                        });
                        this.stats.failed++;
                        this.stats.totalTests++;
                    }

                } catch (error) {
                    result.tests.push({
                        name: `טבלה ${i + 1} - שגיאה כללית`,
                        status: 'failed',
                        message: `שגיאה בבדיקת הטבלה: ${error.message}`
                    });
                    this.stats.failed++;
                    this.stats.totalTests++;
                }
            }

            // Update tablesTested to reflect actual tested tables
            result.tablesTested = tablesActuallyTested;

            result.status = result.tests.some(t => t.status === 'failed') ? 'failed' :
                           result.tests.some(t => t.status === 'warning') ? 'warning' : 'success';
            result.executionTime = Date.now() - startTime;
            result.message = `בדיקת מיון הושלמה: טבלאות ${result.tablesTested}/${result.tablesFound}, ${result.tests.filter(t => t.status === 'success').length} עברו, ${result.tests.filter(t => t.status === 'failed').length} נכשלו, ${result.tests.filter(t => t.status === 'warning').length} אזהרות`;

        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
            result.error = error.message;
            result.executionTime = Date.now() - startTime;
            console.error(`❌ Error in SortingTestingSystem.testSorting for ${page.name}:`, error);

            result.tests.push({
                name: 'טעינת עמוד',
                status: 'failed',
                message: `שגיאה בטעינת העמוד: ${error.message}`
            });
        }

        // Mark page as tested
        this.testedPages.add(pageKey);

        // Store result in crudTester
        if (this.crossPageTester.crudTester && this.crossPageTester.crudTester.results &&
            this.crossPageTester.crudTester.results.crossPage) {
            if (!this.crossPageTester.crudTester.results.crossPage.sorting) {
                this.crossPageTester.crudTester.results.crossPage.sorting = [];
            }
            this.crossPageTester.crudTester.results.crossPage.sorting.push(result);
            this.crossPageTester.crudTester.updateTestResults();
        }

        console.log(`✅ SortingTestingSystem.testSorting completed for ${page.name}:`, result);
        return result;
    }

    /**
     * Get all pages that should be tested for sorting
     */
    getAllSortingPages() {
        const allPages = [
            ...this.crossPageTester.pageGroups.user,
            ...this.crossPageTester.pageGroups.userManagement,
            ...this.crossPageTester.pageGroups.developmentTools,
            ...this.crossPageTester.pageGroups.testing,
            ...this.crossPageTester.pageGroups.technical
        ];

        // Filter pages that have tables
        return allPages.filter(page => page.hasTables === true);
    }

    /**
     * Run comprehensive sorting tests on all pages
     */
    async runAllSortingTests() {
        console.log('🚀 Starting comprehensive sorting test');

        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                location: 'sorting-testing-system.js:runAllSortingTests',
                message: 'Starting comprehensive sorting test',
                data: { testedPagesCount: this.testedPages.size },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'comprehensive-sorting-test',
                hypothesisId: 'COMPREHENSIVE_TESTING'
            })
        }).catch(() => {});

        const allPages = this.getAllSortingPages();
        const results = [];

        for (const page of allPages) {
            try {
                console.log(`🔍 Testing sorting for page: ${page.name}`);
                const result = await this.testSorting(page);
                if (result) {
                    results.push(result);
                }
            } catch (error) {
                console.error(`❌ Error testing page ${page.name}:`, error);
                const errorResult = {
                    page: page.name,
                    status: 'error',
                    message: `שגיאה בבדיקה: ${error.message}`,
                    executionTime: 0,
                    tests: [],
                    errors: [error.message]
                };
                results.push(errorResult);
            }
        }

        console.log(`✅ Comprehensive sorting test completed: ${results.length} pages tested`);

        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                location: 'sorting-testing-system.js:runAllSortingTests',
                message: 'Comprehensive sorting test completed',
                data: {
                    totalPages: allPages.length,
                    testedPages: results.length,
                    testedPagesSet: this.testedPages.size
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'comprehensive-sorting-test',
                hypothesisId: 'COMPREHENSIVE_TESTING'
            })
        }).catch(() => {});

        return results;
    }
}

// Make it globally available
window.SortingTestingSystem = SortingTestingSystem;
