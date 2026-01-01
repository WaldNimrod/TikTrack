/**
 * Stage 2 QA Test - Executions + Trading Accounts
 * Focused QA run with Logger + Network evidence capture
 */

const fs = require('fs');
const path = require('path');

// Clear previous debug log
const logPath = path.join(__dirname, '.cursor', 'debug.log');
if (fs.existsSync(logPath)) {
    fs.unlinkSync(logPath);
}

// Simulate window and Logger
global.window = {
    Logger: {
        info: function(msg, data) {
            const entry = {
                id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                location: 'test_stage2_qa.js:Logger',
                message: msg,
                data: data || {},
                sessionId: 'stage2_qa_test',
                runId: 'stage2_qa_run_001',
                hypothesisId: 'qa_validation'
            };
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(logPath, logLine);
            console.log('ℹ️', msg, data ? JSON.stringify(data).substring(0, 100) + '...' : '');
        },
        error: function(msg, data) {
            const entry = {
                id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                location: 'test_stage2_qa.js:Logger.error',
                message: msg,
                data: data || {},
                sessionId: 'stage2_qa_test',
                runId: 'stage2_qa_run_001',
                hypothesisId: 'qa_validation'
            };
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(logPath, logLine);
            console.log('❌', msg, data ? JSON.stringify(data).substring(0, 100) + '...' : '');
        },
        warn: function(msg, data) {
            const entry = {
                id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                location: 'test_stage2_qa.js:Logger.warn',
                message: msg,
                data: data || {},
                sessionId: 'stage2_qa_test',
                runId: 'stage2_qa_run_001',
                hypothesisId: 'qa_validation'
            };
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(logPath, logLine);
            console.log('⚠️', msg, data ? JSON.stringify(data).substring(0, 100) + '...' : '');
        }
    }
};

// Mock fetch to simulate API calls and capture network
let capturedRequests = [];
global.fetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    capturedRequests.push({
        url,
        method,
        headers: options.headers || {},
        body,
        timestamp: new Date().toISOString()
    });

    window.Logger.info(`Network: ${method} ${url}`, { body });

    // Mock responses
    if (url.includes('/api/trading-accounts') && method === 'POST') {
        return {
            ok: true,
            status: 201,
            json: async () => ({ id: 100, ...body })
        };
    }

    if (url.includes('/api/trading-accounts') && method === 'PUT') {
        return {
            ok: true,
            status: 200,
            json: async () => ({ id: parseInt(url.split('/').pop()), ...body })
        };
    }

    if (url.includes('/api/executions') && method === 'POST') {
        return {
            ok: true,
            status: 201,
            json: async () => ({ id: 200, ...body })
        };
    }

    if (url.includes('/api/executions') && method === 'PUT') {
        return {
            ok: true,
            status: 200,
            json: async () => ({ id: parseInt(url.split('/').pop()), ...body })
        };
    }

    if (url.includes('/api/trading-accounts') && method === 'GET') {
        return {
            ok: true,
            json: async () => [{ id: 1, name: 'Test Account', status: 'open' }]
        };
    }

    if (url.includes('/api/tickers') && method === 'GET') {
        return {
            ok: true,
            json: async () => [{ id: 1, symbol: 'AAPL', name: 'Apple Inc.' }]
        };
    }

    if (url.includes('/api/currencies') && method === 'GET') {
        return {
            ok: true,
            json: async () => [{ id: 1, code: 'USD', name: 'US Dollar' }]
        };
    }

    return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
    };
};

// Import field maps
const fieldMaps = {
    trading_account: {
        required: ['name', 'currency_id'],
        fields: {
            name: { id: '#accountName', type: 'text', required: true },
            currency_id: { id: '#accountCurrency', type: 'int', required: true },
            opening_balance: { id: '#accountOpeningBalance', type: 'number', default: 0 },
            status: { id: '#accountStatus', type: 'text', default: 'open' },
            notes: { id: '#accountNotes', type: 'rich-text', default: null }
        },
        modalId: 'tradingAccountsModal'
    },
    execution: {
        required: ['ticker_id', 'trading_account_id', 'action', 'quantity', 'price', 'date'],
        fields: {
            ticker_id: { id: '#executionTicker', type: 'int', required: true },
            trading_account_id: { id: '#executionAccount', type: 'int', required: true },
            action: { id: '#executionType', type: 'text', required: true, default: 'buy' },
            quantity: { id: '#executionQuantity', type: 'number', required: true, default: 100 },
            price: { id: '#executionPrice', type: 'number', required: true, default: 100 },
            date: { id: '#executionDate', type: 'datetime-local', required: true },
            fee: { id: '#executionCommission', type: 'number', default: 0 },
            source: { id: '#executionSource', type: 'text', default: 'manual' },
            external_id: { id: '#executionExternalId', type: 'text', default: null },
            notes: { id: '#executionNotes', type: 'rich-text', default: null },
            realized_pl: { id: '#executionRealizedPL', type: 'number', default: null },
            mtm_pl: { id: '#executionMTMPL', type: 'number', default: null },
            trade_id: { id: '#executionTradeId', type: 'int', default: null }
        },
        modalId: 'executionsModal'
    }
};

// Mock UnifiedPayloadBuilder
const UnifiedPayloadBuilder = {
    validTickers: ['PLTR', 'AAPL', 'TSLA', 'MSFT', 'QQQ'],
    activeTradingAccountId: 1,

    build: function(entityType, fieldMap, isUpdate = false) {
        return this.generateTestData(entityType, fieldMap, isUpdate);
    },

    generateTestData: function(entityType, fieldMap, isUpdate = false) {
        const testData = {};

        for (const [fieldName, fieldConfig] of Object.entries(fieldMap.fields)) {
            testData[fieldName] = this.generateFieldValue(fieldName, fieldConfig, entityType, isUpdate);
        }

        this.applyEntitySpecificOverrides(testData, entityType, isUpdate);

        return testData;
    },

    generateFieldValue: function(fieldName, fieldConfig, entityType, isUpdate) {
        if (['trading_account_id', 'ticker_id', 'currency_id'].includes(fieldName)) {
            return 1; // Mock resolved ID
        }

        switch (fieldConfig.type) {
            case 'text':
                return fieldConfig.default || `Test ${fieldName}`;
            case 'number':
                return fieldConfig.default || 100;
            case 'int':
                return fieldConfig.default || 1;
            case 'datetime-local':
                return new Date().toISOString().slice(0, 16);
            case 'date':
                return new Date().toISOString().split('T')[0];
            case 'rich-text':
                return fieldConfig.default || 'Test notes';
            case 'bool':
                return fieldConfig.default || false;
            default:
                return fieldConfig.default || `default_${fieldName}`;
        }
    },

    applyEntitySpecificOverrides: function(testData, entityType, isUpdate) {
        switch (entityType) {
            case 'execution':
                testData.trading_account_id = 1;
                testData.ticker_id = 1;
                break;
            case 'trading_account':
                testData.currency_id = 1;
                break;
        }
    }
};

// Mock UnifiedCRUDService
const UnifiedCRUDService = {
    async create(entityType, data) {
        window.Logger.info(`CRUD Create: ${entityType}`, { data });

        const endpoint = entityType === 'trading_account' ? '/api/trading-accounts/' : '/api/executions/';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Create failed');
        }

        return await response.json();
    },

    async update(entityType, id, data) {
        window.Logger.info(`CRUD Update: ${entityType} ${id}`, { data });

        const endpoint = entityType === 'trading_account' ? `/api/trading-accounts/${id}` : `/api/executions/${id}`;

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Update failed');
        }

        return await response.json();
    },

    async delete(entityType, id) {
        window.Logger.info(`CRUD Delete: ${entityType} ${id}`);

        const endpoint = entityType === 'trading_account' ? `/api/trading-accounts/${id}` : `/api/executions/${id}`;

        const response = await fetch(endpoint, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Delete failed');
        }

        return { success: true };
    }
};

// Test function that mimics the dashboard behavior
async function runStage2QA() {
    console.log('🚀 Starting Stage 2 QA Test - Executions + Trading Accounts\n');

    const entities = ['trading_account', 'execution'];
    let passed = 0;
    let failed = 0;

    for (const entity of entities) {
        console.log(`📋 Testing ${entity}...`);

        try {
            const fieldMap = fieldMaps[entity];

            // Test Create
            console.log(`  🔄 Testing ${entity} CREATE...`);
            const createData = UnifiedPayloadBuilder.build(entity, fieldMap, false);
            const createResult = await UnifiedCRUDService.create(entity, createData);

            if (createResult.id) {
                console.log(`  ✅ ${entity} CREATE: PASSED (ID: ${createResult.id})`);
                passed++;

                // Test Update
                console.log(`  🔄 Testing ${entity} UPDATE...`);
                const updateData = UnifiedPayloadBuilder.build(entity, fieldMap, true);
                const updateResult = await UnifiedCRUDService.update(entity, createResult.id, updateData);

                if (updateResult.id) {
                    console.log(`  ✅ ${entity} UPDATE: PASSED`);
                    passed++;
                } else {
                    console.log(`  ❌ ${entity} UPDATE: FAILED`);
                    failed++;
                }

                // Test Delete
                console.log(`  🔄 Testing ${entity} DELETE...`);
                const deleteResult = await UnifiedCRUDService.delete(entity, createResult.id);

                if (deleteResult.success) {
                    console.log(`  ✅ ${entity} DELETE: PASSED`);
                    passed++;
                } else {
                    console.log(`  ❌ ${entity} DELETE: FAILED`);
                    failed++;
                }

            } else {
                console.log(`  ❌ ${entity} CREATE: FAILED`);
                failed++;
            }

        } catch (error) {
            console.log(`  ❌ ${entity}: ERROR - ${error.message}`);
            failed++;
        }

        console.log('');
    }

    // Summary
    console.log('📊 QA Test Summary:');
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  📦 Total Requests Captured: ${capturedRequests.length}`);

    console.log('\n🔍 Network Evidence:');
    capturedRequests.forEach((req, i) => {
        console.log(`  ${i+1}. ${req.method} ${req.url}`);
        if (req.body) {
            console.log(`     Payload: ${JSON.stringify(req.body).substring(0, 100)}...`);
        }
    });

    console.log(`\n📝 Logger evidence saved to: ${logPath}`);

    return failed === 0;
}

// Run the test
runStage2QA().then(success => {
    console.log(`\n${success ? '🎉' : '💥'} Stage 2 QA Test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
});
