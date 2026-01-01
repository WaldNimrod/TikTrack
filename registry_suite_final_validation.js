#!/usr/bin/env node
/**
 * Registry Suite Final Validation - Team D QA
 * ===========================================
 *
 * Runs final Registry Suite validation after Team A/C fixes
 * Expected: 10/10 API entities passing
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

class RegistrySuiteFinalValidation {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.token = null;
        this.startTime = Date.now();
        this.results = {
            timestamp: new Date().toISOString(),
            environment: 'final-validation',
            status: 'running',
            summary: {
                totalTests: 10,
                executedTests: 0,
                passedTests: 0,
                failedTests: 0,
                successRate: 0,
                totalTimeMs: 0
            },
            testResults: [],
            failures: [],
            registryLoaded: false,
            registryTestCount: 0
        };
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            const reqOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            const req = protocol.request(url, reqOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const result = {
                            ok: res.statusCode >= 200 && res.statusCode < 300,
                            status: res.statusCode,
                            data: data ? JSON.parse(data) : null
                        };
                        resolve(result);
                    } catch (e) {
                        resolve({
                            ok: false,
                            status: res.statusCode,
                            error: `JSON parse error: ${e.message}`,
                            rawData: data
                        });
                    }
                });
            });

            req.on('error', reject);

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    async login() {
        console.log('🔐 Authenticating...');
        const response = await this.makeRequest(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            body: {
                username: 'admin',
                password: 'admin123'
            }
        });

        if (response.ok && response.data?.data?.access_token) {
            this.token = response.data.data.access_token;
            console.log('✅ Authentication successful');
            return true;
        } else {
            console.log('❌ Authentication failed:', response.error || response.status);
            return false;
        }
    }

    async validateRegistryLoaded() {
        console.log('📚 Validating registry components...');

        try {
            // Read and validate registry
            const registryPath = path.join(__dirname, 'trading-ui', 'scripts', 'test-registry.js');
            const registryContent = fs.readFileSync(registryPath, 'utf8');

            const match = registryContent.match(/const TEST_REGISTRY = (\[[\s\S]*?\]);/);
            if (!match) {
                console.log('❌ Could not parse TEST_REGISTRY');
                return false;
            }

            const registry = new Function('return ' + match[1])();
            this.results.registryTestCount = registry.length;
            this.results.registryLoaded = true;

            console.log(`✅ Registry loaded: ${registry.length} tests available`);
            return true;

        } catch (error) {
            console.log('❌ Registry validation failed:', error.message);
            return false;
        }
    }

    getApiEndpoint(entityType) {
        const endpointMap = {
            'trade': 'trades',
            'trade_plan': 'trade_plans',
            'alert': 'alerts',
            'ticker': 'tickers',
            'trading_account': 'trading_accounts',
            'note': 'notes',
            'tag': 'tags',
            'watch_list': 'watch_lists',
            'execution': 'executions',
            'cash_flow': 'cash_flows',
            'user_profile': 'user_profile',
            'user_management': 'user_management',
            'trading_journal': 'trading_journal',
            'tag_management': 'tag_management',
            'data_import': 'data_import',
            'preferences': 'preferences'
        };
        return endpointMap[entityType] || entityType + 's';
    }

    async runApiEntityTest(entityType) {
        const testStart = Date.now();
        const headers = { 'Authorization': `Bearer ${this.token}` };
        const apiEndpoint = this.getApiEndpoint(entityType);

        console.log(`🧪 Testing ${entityType} → /api/${apiEndpoint}/`);

        try {
            const response = await this.makeRequest(`${this.baseUrl}/api/${apiEndpoint}/`, {
                headers
            });

            const testTime = Date.now() - testStart;
            const success = response.ok;
            const itemCount = response.data?.data?.length || 0;

            const result = {
                entityType,
                endpoint: `/api/${apiEndpoint}/`,
                success,
                statusCode: response.status,
                itemCount,
                executionTimeMs: testTime,
                timestamp: new Date().toISOString()
            };

            if (success) {
                console.log(`  ✅ PASS - ${itemCount} items (${testTime}ms)`);
                this.results.summary.passedTests++;
            } else {
                console.log(`  ❌ FAIL - HTTP ${response.status} (${testTime}ms)`);
                console.log(`     Error: ${response.error || response.data?.message || 'Unknown error'}`);

                this.results.summary.failedTests++;
                this.results.failures.push({
                    entityType,
                    endpoint: `/api/${apiEndpoint}/`,
                    statusCode: response.status,
                    error: response.error || response.data?.message || 'Unknown error',
                    executionTimeMs: testTime
                });
            }

            this.results.testResults.push(result);
            return result;

        } catch (error) {
            const testTime = Date.now() - testStart;
            console.log(`  ❌ FAIL - Exception: ${error.message} (${testTime}ms)`);

            const result = {
                entityType,
                endpoint: `/api/${apiEndpoint}/`,
                success: false,
                statusCode: null,
                error: error.message,
                executionTimeMs: testTime,
                timestamp: new Date().toISOString()
            };

            this.results.summary.failedTests++;
            this.results.failures.push(result);
            this.results.testResults.push(result);

            return result;
        }
    }

    async runFinalValidation() {
        console.log('🚀 Registry Suite Final Validation');
        console.log('==================================');
        console.log(`Start Time: ${this.results.timestamp}`);
        console.log(`Environment: ${this.results.environment}`);
        console.log('==================================');

        // Step 1: Authenticate
        if (!await this.login()) {
            this.results.status = 'failed';
            return;
        }

        // Step 2: Validate registry is loaded
        if (!await this.validateRegistryLoaded()) {
            this.results.status = 'failed';
            return;
        }

        // Step 3: Run tests for all 10 API entities
        const apiEntities = ['trade', 'trade_plan', 'alert', 'ticker', 'trading_account', 'note', 'tag', 'preferences', 'execution', 'watch_list'];

        console.log(`\n🎯 Testing ${apiEntities.length} API entities:`);
        console.log('=====================================');

        for (const entityType of apiEntities) {
            this.results.summary.executedTests++;
            await this.runApiEntityTest(entityType);
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Calculate final results
        this.results.summary.totalTimeMs = Date.now() - this.startTime;
        this.results.summary.successRate = ((this.results.summary.passedTests / this.results.summary.totalTests) * 100).toFixed(1);

        this.results.status = this.results.summary.failedTests === 0 ? 'passed' : 'failed';

        this.generateFinalReport();
    }

    generateFinalReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 REGISTRY SUITE FINAL VALIDATION REPORT');
        console.log('='.repeat(80));

        console.log(`🕒 Timestamp: ${this.results.timestamp}`);
        console.log(`🌐 Environment: ${this.results.environment}`);
        console.log(`📊 Status: ${this.results.status.toUpperCase()}`);
        console.log(`⏱️  Total Time: ${this.results.summary.totalTimeMs}ms`);
        console.log();

        const s = this.results.summary;
        console.log('📈 SUMMARY:');
        console.log(`  Registry Tests Available: ${this.results.registryTestCount}`);
        console.log(`  API Entities Tested: ${s.executedTests}/${s.totalTests}`);
        console.log(`  ✅ Passed: ${s.passedTests}`);
        console.log(`  ❌ Failed: ${s.failedTests}`);
        console.log(`  🎯 Success Rate: ${s.successRate}%`);
        console.log();

        if (s.passedTests === s.totalTests) {
            console.log('🎉 SUCCESS: All 10 API entities are now passing!');
            console.log('✅ Registry Suite validation completed successfully');
        } else {
            console.log('⚠️  PARTIAL SUCCESS: Some entities still failing');
        }

        // Detailed results
        console.log('\n📋 DETAILED RESULTS:');
        console.log('==================');

        const passedResults = this.results.testResults.filter(r => r.success);
        const failedResults = this.results.testResults.filter(r => !r.success);

        if (passedResults.length > 0) {
            console.log('✅ PASSING ENTITIES:');
            passedResults.forEach(result => {
                console.log(`  • ${result.entityType}: ${result.itemCount} items (${result.executionTimeMs}ms)`);
            });
        }

        if (failedResults.length > 0) {
            console.log('\n❌ FAILING ENTITIES:');
            failedResults.forEach(result => {
                console.log(`  • ${result.entityType}: HTTP ${result.statusCode} (${result.executionTimeMs}ms)`);
                console.log(`    Error: ${result.error}`);
            });
        }

        // Performance summary
        const avgTime = this.results.testResults.reduce((sum, r) => sum + r.executionTimeMs, 0) / this.results.testResults.length;
        console.log(`\n⚡ PERFORMANCE: Average response time: ${avgTime.toFixed(0)}ms per entity`);

        // Save detailed report
        const reportPath = path.join(__dirname, 'registry_suite_final_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);

        console.log('\n🏁 Registry Suite final validation completed');

        // Export summary for documentation
        this.exportDocumentationSummary();
    }

    exportDocumentationSummary() {
        const summary = {
            timestamp: this.results.timestamp,
            status: this.results.status,
            successRate: this.results.summary.successRate,
            passed: this.results.summary.passedTests,
            failed: this.results.summary.failedTests,
            totalTimeMs: this.results.summary.totalTimeMs,
            registryTests: this.results.registryTestCount,
            failures: this.results.failures.map(f => ({
                entity: f.entityType,
                endpoint: f.endpoint,
                status: f.statusCode,
                error: f.error
            }))
        };

        const exportPath = path.join(__dirname, 'registry_final_summary.json');
        fs.writeFileSync(exportPath, JSON.stringify(summary, null, 2));
        console.log(`📤 Export summary saved to: ${exportPath}`);
    }
}

// Run if called directly
if (require.main === module) {
    const validator = new RegistrySuiteFinalValidation();
    validator.runFinalValidation()
        .then(() => {
            console.log('\n✅ Registry Suite Final Validation Complete');
            if (validator.results.status === 'passed') {
                console.log('🎉 SUCCESS: All 10 API entities passing!');
                process.exit(0);
            } else {
                console.log('⚠️  FAILURES DETECTED: See report for details');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = RegistrySuiteFinalValidation;
