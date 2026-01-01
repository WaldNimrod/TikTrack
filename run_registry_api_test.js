#!/usr/bin/env node
/**
 * Registry Suite API Runner - Team D QA Validation
 * Runs registry tests via direct API calls without browser
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

class RegistryAPITester {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.token = null;
        this.results = {
            timestamp: new Date().toISOString(),
            environment: 'api-direct',
            status: 'running',
            summary: {
                totalTests: 0,
                executedTests: 0,
                passedTests: 0,
                failedTests: 0,
                skippedTests: 0,
                totalPages: 0,
                passedPages: 0,
                failedPages: 0
            },
            testResults: [],
            failedTests: [],
            registry: []
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
        console.log('🔐 Logging in...');
        const response = await this.makeRequest(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            body: {
                username: 'admin',
                password: 'admin123'
            }
        });

        if (response.ok && response.data?.data?.access_token) {
            this.token = response.data.data.access_token;
            console.log('✅ Login successful');
            return true;
        } else {
            console.log('❌ Login failed:', response);
            return false;
        }
    }

    async loadRegistry() {
        console.log('📚 Loading test registry...');

        try {
            // Read the registry file directly
            const registryPath = path.join(__dirname, 'trading-ui', 'scripts', 'test-registry.js');
            const registryContent = fs.readFileSync(registryPath, 'utf8');

            // Extract the TEST_REGISTRY array using regex
            const match = registryContent.match(/const TEST_REGISTRY = (\[[\s\S]*?\]);/);
            if (!match) {
                console.log('❌ Could not parse TEST_REGISTRY from file');
                return false;
            }

            // Create a safe evaluation context
            const registryData = match[1];

            // Use Function constructor instead of eval for safety
            const registry = new Function('return ' + registryData)();

            this.results.registry = registry;
            this.results.summary.totalTests = registry.length;

            console.log(`✅ Loaded ${registry.length} tests from registry`);

            // Group by category
            const categories = {};
            registry.forEach(test => {
                categories[test.category] = (categories[test.category] || 0) + 1;
            });

            console.log('📊 Test categories:', categories);
            return true;

        } catch (error) {
            console.log('❌ Error loading registry:', error.message);
            return false;
        }
    }

    getApiEndpoint(entityType) {
        // Map entity types to correct API endpoints
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

    async runBasicAPITest(entityType) {
        console.log(`🧪 Testing basic API for ${entityType}...`);

        const headers = { 'Authorization': `Bearer ${this.token}` };
        const apiEndpoint = this.getApiEndpoint(entityType);

        try {
            // Try to get list
            const listResponse = await this.makeRequest(`${this.baseUrl}/api/${apiEndpoint}/`, {
                headers
            });

            if (listResponse.ok) {
                console.log(`  ✅ GET /api/${apiEndpoint}/ - OK (${listResponse.data?.data?.length || 0} items)`);
                return { success: true, operation: 'list', endpoint: apiEndpoint, count: listResponse.data?.data?.length || 0 };
            } else {
                console.log(`  ❌ GET /api/${apiEndpoint}/ - Failed (${listResponse.status})`);
                return { success: false, operation: 'list', endpoint: apiEndpoint, error: listResponse };
            }
        } catch (error) {
            console.log(`  ❌ GET /api/${apiEndpoint}/ - Exception: ${error.message}`);
            return { success: false, operation: 'list', endpoint: apiEndpoint, error: error.message };
        }
    }

    async runRegistryAPITests() {
        console.log('🚀 Running Registry API Tests...');

        if (!await this.login()) {
            this.results.status = 'failed';
            return;
        }

        if (!await this.loadRegistry()) {
            this.results.status = 'failed';
            return;
        }

        // Get unique entity types from registry that have actual API endpoints
        const apiEntities = ['trade', 'trade_plan', 'alert', 'ticker', 'trading_account', 'note', 'tag', 'watch_list', 'execution', 'cash_flow', 'user_profile', 'user_management', 'trading_journal', 'tag_management', 'data_import', 'preferences'];

        const entityTypes = [...new Set(
            this.results.registry
                .filter(test => test.entityType && apiEntities.includes(test.entityType))
                .map(test => test.entityType)
        )];

        console.log(`🎯 Testing ${entityTypes.length} API entity types: ${entityTypes.join(', ')}`);
        console.log(`📊 Total registry tests: ${this.results.registry.length}, API-relevant: ${entityTypes.length}`);

        this.results.summary.totalPages = entityTypes.length;

        for (const entityType of entityTypes) {
            console.log(`\n📄 Testing entity: ${entityType}`);
            this.results.summary.executedTests++;

            const testResult = await this.runBasicAPITest(entityType);

            if (testResult.success) {
                this.results.summary.passedTests++;
                this.results.summary.passedPages++;
            } else {
                this.results.summary.failedTests++;
                this.results.summary.failedPages++;
                this.results.failedTests.push({
                    entityType,
                    ...testResult
                });
            }

            this.results.testResults.push({
                entityType,
                ...testResult,
                timestamp: new Date().toISOString()
            });

            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.results.status = this.results.summary.failedTests === 0 ? 'passed' : 'failed';
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 REGISTRY SUITE API TEST REPORT');
        console.log('='.repeat(80));

        console.log(`🕒 Run Timestamp: ${this.results.timestamp}`);
        console.log(`🌐 Environment: ${this.results.environment}`);
        console.log(`📊 Status: ${this.results.status.toUpperCase()}`);
        console.log();

        const s = this.results.summary;
        console.log('📈 SUMMARY:');
        console.log(`  Tests: ${s.executedTests}/${s.totalTests} executed (${s.passedTests} passed, ${s.failedTests} failed)`);
        console.log(`  Entities: ${s.passedPages}/${s.totalPages} passed (${s.failedPages} failed)`);
        console.log();

        const passRate = s.totalPages > 0 ? ((s.passedPages / s.totalPages) * 100).toFixed(1) : '0.0';
        console.log(`🎯 Success Rate: ${passRate}%`);
        console.log();

        if (this.results.failedTests.length > 0) {
            console.log('❌ FAILED ENTITIES:');
            this.results.failedTests.forEach((failure, index) => {
                console.log(`  ${index + 1}. ${failure.entityType} - ${failure.operation}`);
                if (failure.error?.status) {
                    console.log(`     Status: ${failure.error.status}`);
                }
                if (failure.error?.error) {
                    console.log(`     Error: ${failure.error.error}`);
                }
                console.log();
            });
        }

        // Save detailed report
        const reportPath = path.join(__dirname, 'registry_api_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`💾 Detailed report saved to: ${reportPath}`);

        console.log('\n🏁 Registry API test execution completed');
    }
}

// Run if called directly
if (require.main === module) {
    const tester = new RegistryAPITester();
    tester.runRegistryAPITests()
        .then(() => tester.generateReport())
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = RegistryAPITester;
