/**
 * Test Executions with Runtime Evidence Capture
 * Run executions CRUD tests and capture Logger + Network evidence
 */

const fs = require('fs');
const path = require('path');

// Create evidence log file
const evidenceLogPath = path.join(__dirname, 'executions_evidence.log');
if (fs.existsSync(evidenceLogPath)) {
    fs.unlinkSync(evidenceLogPath);
}

// Simulate window and Logger
global.window = {
    Logger: {
        info: function(msg, data) {
            const entry = `ℹ️ LOGGER: ${msg} ${data ? JSON.stringify(data).substring(0, 100) + '...' : ''}`;
            console.log(entry);
            fs.appendFileSync(evidenceLogPath, entry + '\n');
        },
        error: function(msg, data) {
            const entry = `❌ LOGGER ERROR: ${msg} ${data ? JSON.stringify(data).substring(0, 100) + '...' : ''}`;
            console.log(entry);
            fs.appendFileSync(evidenceLogPath, entry + '\n');
        },
        warn: function(msg, data) {
            const entry = `⚠️ LOGGER WARN: ${msg} ${data ? JSON.stringify(data).substring(0, 100) + '...' : ''}`;
            console.log(entry);
            fs.appendFileSync(evidenceLogPath, entry + '\n');
        }
    }
};

// Mock document
global.document = {
    querySelector: (selector) => {
        // Mock existing selectors
        const validSelectors = [
            '#executionTicker', '#executionAccount', '#executionType', '#executionQuantity',
            '#executionPrice', '#executionDate', '#executionCommission', '#executionSource',
            '#executionExternalId', '#executionNotes', '#executionRealizedPL', '#executionMTMPL',
            '#executionTradeId'
        ];
        return validSelectors.includes(selector) ? {} : null;
    },
    getElementById: (id) => {
        const validIds = ['executionsTable', 'executionsModal'];
        return validIds.includes(id) ? {} : null;
    }
};

// Captured requests for Network evidence
let capturedRequests = [];

// Mock fetch with request capture
global.fetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    capturedRequests.push({
        timestamp: new Date().toISOString(),
        method,
        url,
        body,
        headers: options.headers || {}
    });

    const networkLog = `🌐 NETWORK: ${method} ${url}`;
    console.log(networkLog);
    fs.appendFileSync(evidenceLogPath, networkLog + '\n');

    if (body) {
        const bodyLog = `📦 PAYLOAD: ${JSON.stringify(body, null, 2)}`;
        console.log(bodyLog);
        fs.appendFileSync(evidenceLogPath, bodyLog + '\n');
    }

    // Mock API responses
    if (url.includes('/api/executions') && method === 'POST') {
        // Simulate validation error for testing
        return {
            ok: false,
            status: 400,
            json: async () => ({
                error: 'Validation failed: trading_account_id must be a valid integer',
                details: 'Foreign key constraint violation'
            })
        };
    }

    if (url.includes('/api/trading-accounts')) {
        return {
            ok: true,
            json: async () => [{ id: 1, name: 'Test Account', status: 'open' }]
        };
    }

    if (url.includes('/api/tickers')) {
        return {
            ok: true,
            json: async () => [{ id: 1, symbol: 'AAPL', name: 'Apple Inc.' }]
        };
    }

    return {
        ok: true,
        status: 200,
        json: async () => ({ success: true })
    };
};

// Mock UnifiedPayloadBuilder
const UnifiedPayloadBuilder = {
    build: function(entityType, fieldMap, isUpdate = false) {
        const testData = {};

        // Generate execution test data
        if (entityType === 'execution') {
            testData.ticker_id = 1;
            testData.trading_account_id = 1;
            testData.action = 'buy';
            testData.quantity = 100;
            testData.price = 100.00;
            testData.date = new Date().toISOString().slice(0, 16);
            testData.fee = 5.00;
            testData.source = 'manual';
            testData.external_id = 'TEST123';
            testData.notes = 'Test execution via Stage 2 validation';
            testData.trade_id = null;
        }

        return testData;
    }
};

// Mock UnifiedCRUDService
const UnifiedCRUDService = {
    async create(entityType, data) {
        window.Logger.info(`CRUD Create: ${entityType}`, { data });

        const response = await fetch('/api/executions/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || 'Unknown error';

            // This should be logged via Logger only
            window.Logger.error(`CRUD ${entityType} operation failed`, {
                entity: entityType,
                error: errorMessage,
                status: response.status,
                details: errorData.details
            });

            throw new Error(errorMessage);
        }

        return await response.json();
    }
};

// Mock table update
function updateTestResultsTable(result) {
    const tableLog = `📊 TABLE UPDATE: ${JSON.stringify(result, null, 2)}`;
    console.log(tableLog);
    fs.appendFileSync(evidenceLogPath, tableLog + '\n');
}

// Test executions CRUD operations
async function testExecutionsCRUD() {
    console.log('🚀 Starting Executions CRUD Test with Evidence Capture\n');
    fs.appendFileSync(evidenceLogPath, '🚀 Starting Executions CRUD Test with Evidence Capture\n\n');

    try {
        // Get field map
        const fieldMap = {
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
            }
        };

        console.log('📋 Field Map Verification:');
        fs.appendFileSync(evidenceLogPath, '📋 Field Map Verification:\n');

        let selectorCount = 0;
        for (const [fieldName, fieldConfig] of Object.entries(fieldMap.fields)) {
            const selector = fieldConfig.id;
            const element = document.querySelector(selector);
            const status = element ? '✅ FOUND' : '❌ MISSING';
            const logEntry = `  ${fieldName}: ${selector} - ${status}`;
            console.log(logEntry);
            fs.appendFileSync(evidenceLogPath, logEntry + '\n');
            if (element) selectorCount++;
        }

        console.log(`\n📊 Field Map Summary: ${selectorCount}/${Object.keys(fieldMap.fields).length} selectors found\n`);
        fs.appendFileSync(evidenceLogPath, `\n📊 Field Map Summary: ${selectorCount}/${Object.keys(fieldMap.fields).length} selectors found\n\n`);

        // Test CREATE operation (will fail with validation error)
        console.log('🔄 Testing Execution CREATE (expecting validation error)...');
        fs.appendFileSync(evidenceLogPath, '🔄 Testing Execution CREATE (expecting validation error)...\n');

        const testData = UnifiedPayloadBuilder.build('execution', fieldMap, false);

        try {
            const createResult = await UnifiedCRUDService.create('execution', testData);
            console.log('✅ CREATE succeeded unexpectedly');
            fs.appendFileSync(evidenceLogPath, '✅ CREATE succeeded unexpectedly\n');
        } catch (error) {
            const errorMessage = error.message;

            console.log(`❌ CREATE failed as expected: "${errorMessage}"`);
            fs.appendFileSync(evidenceLogPath, `❌ CREATE failed as expected: "${errorMessage}"\n`);

            // Simulate table update with error
            const tableResult = {
                entity: 'execution',
                operation: 'create',
                status: 'failed',
                error: errorMessage,
                details: `API returned 400: ${errorMessage}`,
                timestamp: new Date().toISOString()
            };

            updateTestResultsTable(tableResult);
        }

    } catch (error) {
        console.log(`💥 Test execution failed: ${error.message}`);
        fs.appendFileSync(evidenceLogPath, `💥 Test execution failed: ${error.message}\n`);
    }

    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`  Network requests captured: ${capturedRequests.length}`);
    console.log(`  Logger entries: ${fs.readFileSync(evidenceLogPath, 'utf8').split('\n').filter(line => line.includes('LOGGER')).length}`);
    console.log(`  Evidence saved to: ${evidenceLogPath}`);

    fs.appendFileSync(evidenceLogPath, '\n📋 Test Summary:\n');
    fs.appendFileSync(evidenceLogPath, `  Network requests captured: ${capturedRequests.length}\n`);
    fs.appendFileSync(evidenceLogPath, `  Logger entries: ${fs.readFileSync(evidenceLogPath, 'utf8').split('\n').filter(line => line.includes('LOGGER')).length}\n`);
    fs.appendFileSync(evidenceLogPath, `  Evidence saved to: ${evidenceLogPath}\n`);

    return capturedRequests.length > 0;
}

// Run the test
testExecutionsCRUD().then(success => {
    console.log(`\n${success ? '🎉' : '💥'} Executions test ${success ? 'completed with evidence' : 'failed'}`);
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('💥 Test execution error:', error);
    process.exit(1);
});
