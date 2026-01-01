#!/usr/bin/env node
/**
 * Registry Suite Runner - Team D QA Validation
 * ===========================================
 *
 * Runs the complete Registry Suite through the CRUD Dashboard
 * and generates detailed Pass/Fail reports with error details.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class RegistrySuiteRunner {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.dashboardUrl = `${this.baseUrl}/crud_testing_dashboard`;
        this.results = {
            timestamp: new Date().toISOString(),
            environment: 'local/8080',
            status: 'running',
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                warningTests: 0,
                skippedTests: 0,
                totalPages: 0,
                passedPages: 0,
                failedPages: 0
            },
            pageResults: [],
            failedTests: [],
            errors: []
        };
    }

    async run() {
        console.log('🚀 Starting Registry Suite Runner');
        console.log('==================================');
        console.log(`Timestamp: ${this.results.timestamp}`);
        console.log(`Environment: ${this.results.environment}`);
        console.log('==================================');

        let browser;
        try {
            // Launch browser
            console.log('🔍 Launching browser...');
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();

            // Set up console logging
            page.on('console', msg => {
                const text = msg.text();
                if (text.includes('Registry Suite') || text.includes('✅') || text.includes('❌') || text.includes('⚠️')) {
                    console.log(`📝 ${text}`);
                }
            });

            // Navigate to dashboard
            console.log(`🌐 Navigating to ${this.dashboardUrl}...`);
            await page.goto(this.dashboardUrl, { waitUntil: 'networkidle2' });

            // Wait for page to load and check if login modal appears
            console.log('⏳ Waiting for page to load...');
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Check if login modal is visible and handle login
            console.log('🔍 Checking for login modal...');
            const loginModalVisible = await page.evaluate(() => {
                const modal = document.querySelector('.modal');
                return modal && modal.classList.contains('show');
            });

            if (loginModalVisible) {
                console.log('🔐 Login modal detected, attempting to login...');

                // Wait for form elements
                await page.waitForSelector('#loginUsername', { timeout: 5000 });
                await page.waitForSelector('#loginPassword', { timeout: 5000 });

                // Fill login form
                await page.type('#loginUsername', 'admin', { delay: 100 });
                await page.type('#loginPassword', 'admin123', { delay: 100 });

                // Click login button
                await page.click('button[type="submit"]');

                // Wait for login to complete - check for modal disappearance
                console.log('⏳ Waiting for login to complete...');
                let attempts = 0;
                while (attempts < 10) {
                    const stillVisible = await page.evaluate(() => {
                        const modal = document.querySelector('.modal');
                        return modal && modal.classList.contains('show');
                    });
                    if (!stillVisible) break;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                }
                console.log('✅ Login modal disappeared, proceeding...');
            } else {
                console.log('✅ No login modal detected');
            }

            // Wait for dashboard to load - check for the registry button
            console.log('⏳ Waiting for dashboard to initialize...');
            let buttonFound = false;
            let attempts = 0;
            while (attempts < 30 && !buttonFound) {
                buttonFound = await page.evaluate(() => {
                    const button = document.querySelector('button[onclick*="runRegistrySuite"]');
                    return button !== null;
                });
                if (!buttonFound) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                    console.log(`⏳ Still waiting for registry button... (${attempts}/30)`);
                }
            }

            if (!buttonFound) {
                throw new Error('Registry Suite button not found after 30 seconds');
            }

            console.log('✅ Registry Suite button found!');

            console.log('✅ Dashboard loaded successfully');

            // Check if registry components are available
            const registryCheck = await page.evaluate(() => {
                return {
                    hasTestOrchestrator: !!window.TestOrchestrator,
                    hasTestRegistry: !!window.TestRegistry,
                    hasTestResultsModel: !!window.TestResultsModel,
                    hasTestRelevancyRules: !!window.TestRelevancyRules,
                    registryLength: window.TestRegistry?.TEST_REGISTRY?.length || 0
                };
            });

            console.log('🔧 Registry components status:');
            console.log(`  - TestOrchestrator: ${registryCheck.hasTestOrchestrator ? '✅' : '❌'}`);
            console.log(`  - TestRegistry: ${registryCheck.hasTestRegistry ? '✅' : '❌'}`);
            console.log(`  - TestResultsModel: ${registryCheck.hasTestResultsModel ? '✅' : '❌'}`);
            console.log(`  - TestRelevancyRules: ${registryCheck.hasTestRelevancyRules ? '✅' : '❌'}`);
            console.log(`  - Registry tests: ${registryCheck.registryLength}`);

            if (!registryCheck.hasTestOrchestrator || !registryCheck.hasTestRegistry) {
                throw new Error('Required registry components not available');
            }

            // Run the registry suite
            console.log('\n🎯 Running Registry Suite...');
            const testPromise = page.evaluate(async () => {
                return new Promise((resolve, reject) => {
                    // Override the dashboard's result handling to capture results
                    const originalUpdateTestResults = window.crudTester?.updateTestResults;
                    let capturedResults = null;

                    if (window.crudTester) {
                        window.crudTester.updateTestResults = function() {
                            capturedResults = {
                                registry: window.crudTester.results.registry,
                                stats: window.crudTester.stats
                            };
                        };
                    }

                    // Run the registry suite
                    window.runRegistrySuite().then(() => {
                        // Wait for completion
                        const checkComplete = () => {
                            if (window.crudTester?.stats?.inProgress === 0) {
                                resolve(capturedResults);
                            } else {
                                setTimeout(checkComplete, 1000);
                            }
                        };
                        checkComplete();
                    }).catch(reject);

                    // Timeout after 5 minutes
                    setTimeout(() => reject(new Error('Registry suite timeout')), 300000);
                });
            });

            const testResults = await testPromise;
            console.log('✅ Registry Suite completed');

            // Extract detailed results
            const detailedResults = await page.evaluate(() => {
                const results = window.crudTester?.results?.registry || {};
                const stats = window.crudTester?.stats || {};

                return {
                    tests: results.tests || [],
                    summaries: results.summaries || [],
                    stats: stats,
                    pageSummaries: window.TestResultsModel?.summarizeByPage(results.tests || []) || []
                };
            });

            // Process results
            this.processResults(detailedResults);

        } catch (error) {
            console.error('❌ Error running Registry Suite:', error.message);
            this.results.errors.push({
                type: 'runtime_error',
                message: error.message,
                stack: error.stack
            });
            this.results.status = 'failed';
        } finally {
            if (browser) {
                await browser.close();
                console.log('🔒 Browser closed');
            }
        }

        // Generate final report
        this.generateReport();
    }

    processResults(detailedResults) {
        console.log('\n📊 Processing results...');

        const { tests = [], summaries = [], pageSummaries = [] } = detailedResults;

        this.results.summary.totalTests = tests.length;
        this.results.pageResults = pageSummaries;

        // Count test results
        let passedTests = 0;
        let failedTests = 0;
        let warningTests = 0;
        let skippedTests = 0;

        tests.forEach(test => {
            if (test.status === 'passed' || test.status === 'success') {
                passedTests++;
            } else if (test.status === 'failed' || test.status === 'error') {
                failedTests++;
                this.results.failedTests.push({
                    testId: test.testId || test.id,
                    testName: test.testName || test.name,
                    page: test.page,
                    error: test.error || test.message,
                    executionTime: test.executionTime || test.durationMs
                });
            } else if (test.status === 'warning') {
                warningTests++;
            } else if (test.status === 'skipped') {
                skippedTests++;
            }
        });

        this.results.summary.passedTests = passedTests;
        this.results.summary.failedTests = failedTests;
        this.results.summary.warningTests = warningTests;
        this.results.summary.skippedTests = skippedTests;

        // Count page results
        this.results.summary.totalPages = pageSummaries.length;
        this.results.summary.passedPages = pageSummaries.filter(p => p.failed === 0).length;
        this.results.summary.failedPages = pageSummaries.filter(p => p.failed > 0).length;

        this.results.status = failedTests > 0 ? 'failed' : 'passed';

        console.log(`📈 Results: ${passedTests} passed, ${failedTests} failed, ${warningTests} warnings, ${skippedTests} skipped`);
        console.log(`📄 Pages: ${this.results.summary.passedPages}/${this.results.summary.totalPages} passed`);
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 REGISTRY SUITE FINAL REPORT');
        console.log('='.repeat(80));

        console.log(`🕒 Run Timestamp: ${this.results.timestamp}`);
        console.log(`🌐 Environment: ${this.results.environment}`);
        console.log(`📊 Status: ${this.results.status.toUpperCase()}`);
        console.log();

        // Summary
        const s = this.results.summary;
        console.log('📈 SUMMARY:');
        console.log(`  Tests: ${s.passedTests}/${s.totalTests} passed (${s.failedTests} failed, ${s.warningTests} warnings, ${s.skippedTests} skipped)`);
        console.log(`  Pages: ${s.passedPages}/${s.totalPages} passed (${s.failedPages} failed)`);
        console.log();

        // Success rate
        const passRate = s.totalTests > 0 ? ((s.passedTests / s.totalTests) * 100).toFixed(1) : '0.0';
        console.log(`🎯 Success Rate: ${passRate}%`);
        console.log();

        // Page results
        if (this.results.pageResults.length > 0) {
            console.log('📄 PAGE RESULTS:');
            this.results.pageResults.forEach(page => {
                const status = page.failed > 0 ? '❌' : page.warnings > 0 ? '⚠️' : '✅';
                console.log(`  ${status} ${page.page}: ${page.passed}/${page.total} passed (${page.failed} failed, ${page.warnings} warnings)`);
            });
            console.log();
        }

        // Failed tests details
        if (this.results.failedTests.length > 0) {
            console.log('❌ FAILED TESTS DETAILS:');
            this.results.failedTests.forEach((failure, index) => {
                console.log(`  ${index + 1}. ${failure.testName} (${failure.page})`);
                console.log(`     Error: ${failure.error || 'Unknown error'}`);
                if (failure.executionTime) {
                    console.log(`     Time: ${failure.executionTime}ms`);
                }
                console.log();
            });
        }

        // Runtime errors
        if (this.results.errors.length > 0) {
            console.log('🚨 RUNTIME ERRORS:');
            this.results.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.type}: ${error.message}`);
            });
            console.log();
        }

        // Recommendations
        console.log('🎯 RECOMMENDATIONS:');
        if (passRate >= 90) {
            console.log('  ✅ Excellent! Registry Suite is production-ready');
        } else if (passRate >= 70) {
            console.log('  ⚠️ Good progress, but critical issues remain');
        } else if (passRate >= 50) {
            console.log('  ❌ Significant issues need immediate attention');
        } else {
            console.log('  🚨 Critical failures require urgent fixes');
        }

        // Save detailed report to file
        const reportPath = path.join(__dirname, 'registry_suite_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);

        console.log('\n🏁 Registry Suite execution completed');
    }
}

// Run if called directly
if (require.main === module) {
    const runner = new RegistrySuiteRunner();
    runner.run().catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = RegistrySuiteRunner;
