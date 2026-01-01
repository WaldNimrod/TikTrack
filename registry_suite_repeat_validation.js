#!/usr/bin/env node
/**
 * Registry Suite Repeat Validation - Team D QA
 * ============================================
 *
 * Repeat validation after Team C fixes - expecting 10/10 success
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

class RegistrySuiteRepeatValidation {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.token = null;
        this.startTime = Date.now();
        this.runId = `repeat-${Date.now()}`;

        this.results = {
            runId: this.runId,
            timestamp: new Date().toISOString(),
            environment: 'repeat-validation',
            status: 'running',
            summary: {
                totalTests: 10,
                executedTests: 0,
                passedTests: 0,
                failedTests: 0,
                successRate: 0,
                totalTimeMs: 0,
                averageResponseTime: 0
            },
            testResults: [],
            failures: [],
            registryLoaded: false,
            registryTestCount: 0
        };

        // Clear previous logs
        this.clearDebugLogs();
    }

    async clearDebugLogs() {
        const logPath = '/Users/nimrod/Documents/TikTrack/TikTrackApp/.cursor/debug.log';
        try {
            if (fs.existsSync(logPath)) {
                fs.unlinkSync(logPath);
            }
        } catch (e) {
            // Ignore if file doesn't exist
        }
    }

    async makeRequest(url, options = {}) {
        const requestStart = Date.now();
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
                    const requestTime = Date.now() - requestStart;
                    try {
                        const result = {
                            ok: res.statusCode >= 200 && res.statusCode < 300,
                            status: res.statusCode,
                            data: data ? JSON.parse(data) : null,
                            responseTime: requestTime,
                            rawData: data
                        };
                        resolve(result);
                    } catch (e) {
                        resolve({
                            ok: false,
                            status: res.statusCode,
                            error: `JSON parse error: ${e.message}`,
                            rawData: data,
                            responseTime: requestTime
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
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:65',message:'Starting authentication process',data:{runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'A'})}).catch(()=>{});

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
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:75',message:'Authentication successful',data:{tokenLength:this.token.length,runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'A'})}).catch(()=>{});
            return true;
        } else {
            console.log('❌ Authentication failed:', response.error || response.status);
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:79',message:'Authentication failed',data:{status:response.status,error:response.error,runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'A'})}).catch(()=>{});
            return false;
        }
    }

    async validateRegistryLoaded() {
        console.log('📚 Validating registry components...');
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:84',message:'Validating registry loading',data:{runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'B'})}).catch(()=>{});

        try {
            const registryPath = path.join(__dirname, 'trading-ui', 'scripts', 'test-registry.js');
            const registryContent = fs.readFileSync(registryPath, 'utf8');

            const match = registryContent.match(/const TEST_REGISTRY = (\[[\s\S]*?\]);/);
            if (!match) {
                console.log('❌ Could not parse TEST_REGISTRY');
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:93',message:'Registry parsing failed',data:{runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'B'})}).catch(()=>{});
                return false;
            }

            const registry = new Function('return ' + match[1])();
            this.results.registryTestCount = registry.length;
            this.results.registryLoaded = true;

            console.log(`✅ Registry loaded: ${registry.length} tests available`);
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:102',message:'Registry loaded successfully',data:{registryTestCount:registry.length,runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'B'})}).catch(()=>{});
            return true;

        } catch (error) {
            console.log('❌ Registry validation failed:', error.message);
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:107',message:'Registry validation error',data:{error:error.message,runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'B'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:132',message:'Starting API test',data:{entityType,apiEndpoint,runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'C'})}).catch(()=>{});

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
                responseTime: response.responseTime,
                timestamp: new Date().toISOString()
            };

            if (success) {
                console.log(`  ✅ PASS - ${itemCount} items (${testTime}ms)`);
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:152',message:'API test passed',data:{entityType,itemCount,executionTimeMs:testTime,responseTime:response.responseTime,runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'C'})}).catch(()=>{});
                this.results.summary.passedTests++;
            } else {
                console.log(`  ❌ FAIL - HTTP ${response.status} (${testTime}ms)`);
                console.log(`     Error: ${response.error || response.data?.message || 'Unknown error'}`);
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:157',message:'API test failed',data:{entityType,statusCode:response.status,error:response.error || response.data?.message,executionTimeMs:testTime,runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'C'})}).catch(()=>{});
                this.results.summary.failedTests++;
                this.results.failures.push({
                    entityType,
                    endpoint: `/api/${apiEndpoint}/`,
                    statusCode: response.status,
                    error: response.error || response.data?.message || 'Unknown error',
                    executionTimeMs: testTime,
                    responseTime: response.responseTime
                });
            }

            this.results.testResults.push(result);
            return result;

        } catch (error) {
            const testTime = Date.now() - testStart;
            console.log(`  ❌ FAIL - Exception: ${error.message} (${testTime}ms)`);
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'registry_suite_repeat_validation.js:176',message:'API test exception',data:{entityType,error:error.message,executionTimeMs:testTime,runId:this.runId},timestamp:Date.now(),sessionId:'debug-session',runId:this.runId,hypothesisId:'C'})}).catch(()=>{});
            const result = {
                entityType,
                endpoint: `/api/${apiEndpoint}/`,
                success: false,
                statusCode: null,
                error: error.message,
                executionTimeMs: testTime,
                responseTime: 0,
                timestamp: new Date().toISOString()
            };

            this.results.summary.failedTests++;
            this.results.failures.push(result);
            this.results.testResults.push(result);

            return result;
        }
    }

    async runRepeatValidation() {
        console.log('🔄 Registry Suite Repeat Validation');
        console.log('====================================');
        console.log(`Run ID: ${this.runId}`);
        console.log(`Timestamp: ${this.results.timestamp}`);
        console.log(`Environment: ${this.results.environment}`);
        console.log('====================================');

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

        console.log(`\n🎯 Testing ${apiEntities.length} API entities (expecting 10/10 PASS):`);
        console.log('================================================================');

        for (const entityType of apiEntities) {
            this.results.summary.executedTests++;
            await this.runApiEntityTest(entityType);
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Calculate final results
        this.results.summary.totalTimeMs = Date.now() - this.startTime;
        this.results.summary.successRate = ((this.results.summary.passedTests / this.results.summary.totalTests) * 100).toFixed(1);
        this.results.summary.averageResponseTime = this.results.testResults.reduce((sum, r) => sum + r.responseTime, 0) / this.results.testResults.length;

        this.results.status = this.results.summary.failedTests === 0 ? 'passed' : 'failed';

        this.generateRepeatReport();
    }

    generateRepeatReport() {
        console.log('\n' + '='.repeat(80));
        console.log('🔄 REGISTRY SUITE REPEAT VALIDATION REPORT');
        console.log('='.repeat(80));

        console.log(`🆔 Run ID: ${this.results.runId}`);
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
        console.log(`  ⚡ Average Response Time: ${s.averageResponseTime.toFixed(0)}ms`);
        console.log();

        if (s.passedTests === s.totalTests) {
            console.log('🎉 SUCCESS: All 10 API entities are now passing!');
            console.log('✅ Registry Suite repeat validation completed successfully');
            console.log('🏆 TARGET ACHIEVED: 10/10 API entities working');
        } else {
            console.log('❌ PARTIAL SUCCESS: Some entities still failing');
            console.log(`📊 Progress: ${s.passedTests}/${s.totalTests} entities working`);
        }

        // Detailed results
        console.log('\n📋 DETAILED RESULTS:');
        console.log('==================');

        const passedResults = this.results.testResults.filter(r => r.success);
        const failedResults = this.results.testResults.filter(r => !r.success);

        if (passedResults.length > 0) {
            console.log('✅ PASSING ENTITIES:');
            passedResults.forEach(result => {
                console.log(`  • ${result.entityType}: ${result.itemCount} items (${result.executionTimeMs}ms, ${result.responseTime}ms response)`);
            });
        }

        if (failedResults.length > 0) {
            console.log('\n❌ FAILING ENTITIES:');
            failedResults.forEach(result => {
                console.log(`  • ${result.entityType}: HTTP ${result.statusCode} (${result.executionTimeMs}ms)`);
                console.log(`    Error: ${result.error}`);
            });
        }

        // Performance analysis
        console.log('\n⚡ PERFORMANCE ANALYSIS:');
        const fastest = this.results.testResults.reduce((min, r) => r.executionTimeMs < min.executionTimeMs ? r : min);
        const slowest = this.results.testResults.reduce((max, r) => r.executionTimeMs > max.executionTimeMs ? r : max);
        console.log(`  Fastest: ${fastest.entityType} (${fastest.executionTimeMs}ms)`);
        console.log(`  Slowest: ${slowest.entityType} (${slowest.executionTimeMs}ms)`);

        // Save detailed report
        const reportPath = path.join(__dirname, 'registry_suite_repeat_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);

        // Export summary for documentation
        this.exportDocumentationSummary();

        console.log('\n🏁 Registry Suite repeat validation completed');
    }

    exportDocumentationSummary() {
        const summary = {
            runId: this.results.runId,
            timestamp: this.results.timestamp,
            status: this.results.status,
            successRate: this.results.summary.successRate,
            passed: this.results.summary.passedTests,
            failed: this.results.summary.failedTests,
            totalTimeMs: this.results.summary.totalTimeMs,
            averageResponseTime: this.results.summary.averageResponseTime,
            registryTests: this.results.registryTestCount,
            failures: this.results.failures.map(f => ({
                entity: f.entityType,
                endpoint: f.endpoint,
                status: f.statusCode,
                error: f.error,
                executionTimeMs: f.executionTimeMs,
                responseTime: f.responseTime
            }))
        };

        const exportPath = path.join(__dirname, 'registry_repeat_summary.json');
        fs.writeFileSync(exportPath, JSON.stringify(summary, null, 2));
        console.log(`📤 Export summary saved to: ${exportPath}`);
    }
}

// Run if called directly
if (require.main === module) {
    const validator = new RegistrySuiteRepeatValidation();
    validator.runRepeatValidation()
        .then(() => {
            console.log('\n✅ Registry Suite Repeat Validation Complete');
            if (validator.results.status === 'passed') {
                console.log('🎉 SUCCESS: All 10 API entities passing!');
                process.exit(0);
            } else {
                console.log('❌ FAILURES DETECTED: See report for details');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = RegistrySuiteRepeatValidation;
