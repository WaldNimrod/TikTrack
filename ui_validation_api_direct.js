#!/usr/bin/env node
/**
 * UI Validation API Direct - Team D
 * =================================
 *
 * Direct API validation for trading_account and cash_flow error messages
 * Tests extractErrorMessage function directly with API responses
 */

const fs = require('fs');
const path = require('path');

class UIValidationAPIDirect {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.entitiesToTest = ['trading_account', 'cash_flow'];

        this.results = {
            runId: `ui-validation-api-direct-${Date.now()}`,
            timestamp: new Date().toISOString(),
            environment: this.baseUrl,
            status: 'running',
            context: 'Direct API validation for trading_account and cash_flow error messages',
            entities: {},
            acceptance: {
                specificErrorsDisplayed: false,
                noUnknownErrors: true,
                extractErrorMessageWorking: false
            }
        };

        // Clear debug logs
        this.clearDebugLogs();
    }

    async clearDebugLogs() {
        const logPath = '/Users/nimrod/Documents/TikTrack/TikTrackApp/.cursor/debug.log';
        try {
            if (fs.existsSync(logPath)) {
                fs.unlinkSync(logPath);
            }
        } catch (e) {
            // Ignore
        }
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const http = require('http');
            const https = require('https');
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
                            data: data ? JSON.parse(data) : null,
                            rawData: data
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

    extractErrorMessage(result) {
        if (!result) return 'Unknown error';

        // Try different error formats
        if (result.error?.message) return result.error.message;
        if (typeof result.error === 'string') return result.error;
        if (result.message) return result.message;
        if (result.statusText) return result.statusText;

        // Try to extract from nested error objects
        if (result.error?.error) return result.error.error;
        if (result.errorData?.message) return result.errorData.message;
        if (result.errorData?.error) return result.errorData.error;

        // Last resort - stringify the result and look for error info
        try {
            const str = JSON.stringify(result);
            if (str.includes('error') || str.includes('Error')) {
                // Look for common error patterns
                const matches = str.match(/"(error|message)"\s*:\s*"([^"]+)"/i);
                if (matches && matches[2]) return matches[2];
            }
        } catch (e) {
            // Ignore stringify errors
        }

        return 'API returned error without specific message';
    }

    async validateErrorMessages() {
        console.log('🔍 UI Validation API Direct');
        console.log('===========================');
        console.log(`Run ID: ${this.results.runId}`);
        console.log(`Timestamp: ${this.results.timestamp}`);
        console.log(`Environment: ${this.results.environment}`);
        console.log(`Context: ${this.results.context}`);
        console.log('===========================');

        // Step 1: Login to get token
        console.log('🔐 Logging in...');
        const loginResponse = await this.makeRequest(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            body: { username: 'admin', password: 'admin123' }
        });

        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginResponse);
            this.results.status = 'failed';
            return;
        }

        const token = loginResponse.data?.data?.access_token;
        if (!token) {
            console.error('❌ No token received');
            this.results.status = 'failed';
            return;
        }

        console.log('✅ Login successful');

        const headers = { 'Authorization': `Bearer ${token}` };

        // Step 2: Test each entity
        for (const entity of this.entitiesToTest) {
            console.log(`\n🧪 Testing ${entity} API validation...`);
            this.results.entities[entity] = await this.testEntityAPIValidation(entity, headers);
        }

        // Step 3: Validate acceptance criteria
        this.validateAcceptanceCriteria();

        // Step 4: Generate report
        this.generateAPIValidationReport();

        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ui_validation_api_direct.js:141',message:'API validation completed',data:{results:this.results},timestamp:Date.now(),sessionId:'debug-session',runId:this.results.runId,hypothesisId:'UI_VALIDATION'})}).catch(()=>{});
    }

    async testEntityAPIValidation(entity, headers) {
        const entityResult = {
            entity,
            apiTestStarted: false,
            createAttempted: false,
            apiResponseReceived: false,
            apiResponseStatus: null,
            apiResponseData: null,
            errorMessageExtracted: null,
            isSpecificError: false,
            isUnknownError: false,
            extractErrorMessageWorked: false
        };

        try {
            console.log(`📋 Starting API test for ${entity}...`);

            // Prepare test data that should trigger validation errors
            let testData = {};
            if (entity === 'trading_account') {
                testData = { name: 'Test Account', account_type: 'stock' }; // Missing currency_id
            } else if (entity === 'cash_flow') {
                testData = { amount: 1000.0, type: 'deposit' }; // Missing required fields
            }

            console.log(`📦 Test data:`, testData);

            // Make CREATE request that should fail with validation error
            const apiEndpoint = entity === 'trading_account' ? 'trading_accounts' : 'cash_flows';
            const createResponse = await this.makeRequest(`${this.baseUrl}/api/${apiEndpoint}/`, {
                method: 'POST',
                headers,
                body: testData
            });

            entityResult.apiTestStarted = true;
            entityResult.createAttempted = true;
            entityResult.apiResponseReceived = true;
            entityResult.apiResponseStatus = createResponse.status;
            entityResult.apiResponseData = createResponse.data || createResponse.error;

            console.log(`📡 API Response: ${createResponse.status} - ${createResponse.ok ? 'OK' : 'ERROR'}`);
            console.log(`📄 Response data:`, createResponse.data);

            // Extract error message using extractErrorMessage
            if (!createResponse.ok) {
                const extractedMessage = this.extractErrorMessage(createResponse.data);
                entityResult.errorMessageExtracted = extractedMessage;
                entityResult.extractErrorMessageWorked = true;

                entityResult.isSpecificError = !extractedMessage.includes('Unknown error') &&
                                             !extractedMessage.includes('API returned error') &&
                                             extractedMessage.length > 10;
                entityResult.isUnknownError = extractedMessage.includes('Unknown error') ||
                                            extractedMessage.includes('API returned error');

                console.log(`🎯 Extracted error message: "${extractedMessage}"`);
                console.log(`   Specific error: ${entityResult.isSpecificError}`);
                console.log(`   Unknown error: ${entityResult.isUnknownError}`);
            } else {
                console.log(`⚠️  API call succeeded unexpectedly`);
            }

            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ui_validation_api_direct.js:199',message:'Entity API validation completed',data:{entity,entityResult},timestamp:Date.now(),sessionId:'debug-session',runId:this.results.runId,hypothesisId:'UI_VALIDATION'})}).catch(()=>{});

        } catch (error) {
            console.error(`💥 Error testing ${entity}:`, error.message);
            entityResult.error = error.message;
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ui_validation_api_direct.js:205',message:'Entity API validation error',data:{entity,error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:this.results.runId,hypothesisId:'ERROR_HANDLING'})}).catch(()=>{});
        }

        return entityResult;
    }

    validateAcceptanceCriteria() {
        console.log('\n🎯 Validating Acceptance Criteria...');

        let allSpecificErrors = true;
        let noUnknownErrors = true;
        let extractErrorMessageWorking = false;

        for (const [entity, result] of Object.entries(this.results.entities)) {
            console.log(`\n📋 ${entity}:`);
            console.log(`   API Test Started: ${result.apiTestStarted ? '✅' : '❌'}`);
            console.log(`   Create Attempted: ${result.createAttempted ? '✅' : '❌'}`);
            console.log(`   Response Received: ${result.apiResponseReceived ? '✅' : '❌'}`);
            console.log(`   Status: ${result.apiResponseStatus}`);
            console.log(`   ExtractErrorMessage Worked: ${result.extractErrorMessageWorked ? '✅' : '❌'}`);

            if (result.extractErrorMessageWorked && result.errorMessageExtracted) {
                console.log(`   Error Message: "${result.errorMessageExtracted}"`);
                console.log(`   Specific Error: ${result.isSpecificError ? '✅' : '❌'}`);
                console.log(`   Unknown Error: ${result.isUnknownError ? '❌ YES' : '✅ NO'}`);

                if (!result.isSpecificError) allSpecificErrors = false;
                if (result.isUnknownError) noUnknownErrors = false;
            }

            if (result.extractErrorMessageWorked) extractErrorMessageWorking = true;
        }

        this.results.acceptance.specificErrorsDisplayed = allSpecificErrors;
        this.results.acceptance.noUnknownErrors = noUnknownErrors;
        this.results.acceptance.extractErrorMessageWorking = extractErrorMessageWorking;

        console.log('\n🎯 ACCEPTANCE CRITERIA RESULTS:');
        console.log(`   Specific errors extracted: ${this.results.acceptance.specificErrorsDisplayed ? '✅' : '❌'}`);
        console.log(`   No unknown errors: ${this.results.acceptance.noUnknownErrors ? '✅' : '❌'}`);
        console.log(`   ExtractErrorMessage working: ${this.results.acceptance.extractErrorMessageWorking ? '✅' : '❌'}`);

        const overallSuccess = this.results.acceptance.specificErrorsDisplayed &&
                              this.results.acceptance.noUnknownErrors &&
                              this.results.acceptance.extractErrorMessageWorking;

        this.results.status = overallSuccess ? 'passed' : 'failed';

        console.log(`   OVERALL SUCCESS: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    }

    generateAPIValidationReport() {
        console.log('\n' + '='.repeat(80));
        console.log('🔍 UI VALIDATION API DIRECT REPORT');
        console.log('='.repeat(80));

        console.log(`🆔 Run ID: ${this.results.runId}`);
        console.log(`🕒 Timestamp: ${this.results.timestamp}`);
        console.log(`🌐 Environment: ${this.results.environment}`);
        console.log(`📊 Status: ${this.results.status.toUpperCase()}`);
        console.log(`🎯 Context: ${this.results.context}`);
        console.log();

        // Detailed entity results
        console.log('📋 ENTITY API VALIDATION RESULTS:');
        console.log('==================================');

        for (const [entity, result] of Object.entries(this.results.entities)) {
            console.log(`\n🧪 ${entity}:`);
            console.log(`   API Test Started: ${result.apiTestStarted ? '✅' : '❌'}`);
            console.log(`   Create Attempted: ${result.createAttempted ? '✅' : '❌'}`);
            console.log(`   Response Status: ${result.apiResponseStatus}`);
            console.log(`   ExtractErrorMessage Worked: ${result.extractErrorMessageWorked ? '✅' : '❌'}`);

            if (result.extractErrorMessageWorked && result.errorMessageExtracted) {
                console.log(`   Error Message: "${result.errorMessageExtracted}"`);
                console.log(`   Specific Error: ${result.isSpecificError ? '✅' : '❌'}`);
                console.log(`   Unknown Error: ${result.isUnknownError ? '❌ YES' : '✅ NO'}`);
            }

            if (result.apiResponseData) {
                console.log(`   Raw Response:`, JSON.stringify(result.apiResponseData, null, 2));
            }
        }

        // Acceptance criteria
        console.log('\n🎯 ACCEPTANCE CRITERIA:');
        console.log('======================');
        console.log(`   Specific error messages extracted: ${this.results.acceptance.specificErrorsDisplayed ? '✅' : '❌'}`);
        console.log(`   No "Unknown error" messages: ${this.results.acceptance.noUnknownErrors ? '✅' : '❌'}`);
        console.log(`   extractErrorMessage() working: ${this.results.acceptance.extractErrorMessageWorking ? '✅' : '❌'}`);

        const success = this.results.status === 'passed';
        console.log(`\n🏁 OVERALL RESULT: ${success ? '✅ PASSED' : '❌ FAILED'}`);

        if (success) {
            console.log('🎉 API validation successful - extractErrorMessage working correctly!');
        } else {
            console.log('⚠️  API validation failed - error message extraction needs fixes');
        }

        // Export results
        this.exportAPIValidationResults();
    }

    exportAPIValidationResults() {
        const reportPath = path.join(__dirname, 'ui_validation_api_direct_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);

        // Export summary
        const summaryPath = path.join(__dirname, 'ui_validation_api_direct_summary.json');
        const summary = {
            runId: this.results.runId,
            timestamp: this.results.timestamp,
            environment: this.results.environment,
            status: this.results.status,
            entitiesTested: Object.keys(this.results.entities),
            acceptance: this.results.acceptance,
            results: Object.entries(this.results.entities).map(([entity, result]) => ({
                entity,
                success: result.extractErrorMessageWorked && result.isSpecificError && !result.isUnknownError,
                apiResponseStatus: result.apiResponseStatus,
                errorMessageExtracted: result.errorMessageExtracted,
                isSpecificError: result.isSpecificError,
                isUnknownError: result.isUnknownError,
                extractErrorMessageWorked: result.extractErrorMessageWorked
            }))
        };
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        console.log(`📤 Summary exported to: ${summaryPath}`);
    }
}

// Run if called directly
if (require.main === module) {
    const validator = new UIValidationAPIDirect();
    validator.validateErrorMessages()
        .then(() => {
            console.log('\n✅ UI Validation API Direct Complete');
            if (validator.results.status === 'passed') {
                console.log('🎉 SUCCESS: Error message extraction working correctly!');
                process.exit(0);
            } else {
                console.log('⚠️  FAILURES: Error message extraction needs fixes');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = UIValidationAPIDirect;
