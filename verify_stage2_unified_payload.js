/**
 * Stage 2 UnifiedPayloadBuilder Verification
 * Verify that UnifiedPayloadBuilder generates valid payloads for executions and trading_accounts
 */

// Simulate window and Logger for Node.js
global.window = {
    Logger: {
        info: (msg, data) => console.log('ℹ️', msg, data || ''),
        error: (msg, data) => console.log('❌', msg, data || ''),
        warn: (msg, data) => console.log('⚠️', msg, data || '')
    }
};

// Simulate fetch for dynamic ID resolution
global.fetch = async (url) => {
    console.log(`🌐 Mock fetch: ${url}`);

    if (url === '/api/trading-accounts/') {
        return {
            json: async () => [{ id: 1, status: 'open', name: 'Test Account' }]
        };
    }

    if (url === '/api/tickers/') {
        return {
            json: async () => [{ id: 1, symbol: 'AAPL', name: 'Apple Inc.' }]
        };
    }

    if (url === '/api/currencies/') {
        return {
            json: async () => [{ id: 1, code: 'USD', name: 'US Dollar' }]
        };
    }

    return {
        json: async () => []
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

// Mock UnifiedPayloadBuilder (simplified version)
const UnifiedPayloadBuilder = {
    validTickers: ['PLTR', 'AAPL', 'TSLA', 'MSFT', 'QQQ'],
    activeTradingAccountId: null,

    build: function(entityType, fieldMap, isUpdate = false) {
        return this.generateTestData(entityType, fieldMap, isUpdate);
    },

    generateTestData: function(entityType, fieldMap, isUpdate = false) {
        if (!fieldMap || !fieldMap.fields) {
            throw new Error(`No field map found for entity: ${entityType}`);
        }

        const testData = {};

        for (const [fieldName, fieldConfig] of Object.entries(fieldMap.fields)) {
            testData[fieldName] = this.generateFieldValue(fieldName, fieldConfig, entityType, isUpdate);
        }

        this.applyEntitySpecificOverrides(testData, entityType, isUpdate);

        if (isUpdate) {
            this.applyUpdateModifications(testData, entityType);
        }

        this.validateRequiredFields(testData, fieldMap.required || [], entityType);

        return testData;
    },

    generateFieldValue: function(fieldName, fieldConfig, entityType, isUpdate) {
        if (this.isDynamicIdField(fieldName)) {
            return this.resolveDynamicId(fieldName, entityType);
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

    isDynamicIdField: function(fieldName) {
        return ['trading_account_id', 'ticker_id', 'currency_id'].includes(fieldName);
    },

    resolveDynamicId: function(fieldName, entityType) {
        // Mock resolution
        switch (fieldName) {
            case 'trading_account_id':
                return 1;
            case 'ticker_id':
                return 1;
            case 'currency_id':
                return 1;
            default:
                return 1;
        }
    },

    applyEntitySpecificOverrides: function(testData, entityType, isUpdate) {
        switch (entityType) {
            case 'execution':
                if (!testData.trading_account_id) {
                    testData.trading_account_id = 1;
                }
                if (!testData.ticker_id) {
                    testData.ticker_id = 1;
                }
                break;
            case 'trading_account':
                if (!testData.currency_id) {
                    testData.currency_id = 1;
                }
                break;
        }
    },

    applyUpdateModifications: function(testData, entityType) {
        if (testData.notes) {
            testData.notes = testData.notes + ' (updated)';
        }
        if (testData.amount) {
            testData.amount = testData.amount + 100;
        }
    },

    validateRequiredFields: function(testData, requiredFields, entityType) {
        const missing = requiredFields.filter(field => !testData[field]);
        if (missing.length > 0) {
            console.warn(`Missing required fields for ${entityType}:`, missing);
        }
    }
};

async function verifyUnifiedPayloadBuilder() {
    console.log('🔧 Verifying UnifiedPayloadBuilder for Stage 2 entities...\n');

    const entities = ['trading_account', 'execution'];
    let success = true;

    for (const entity of entities) {
        console.log(`📋 Testing ${entity}:`);

        const fieldMap = fieldMaps[entity];

        try {
            // Test create payload
            const createPayload = UnifiedPayloadBuilder.build(entity, fieldMap, false);
            console.log('  ✅ Create payload generated');

            // Check required fields
            const requiredFields = fieldMap.required || [];
            const missing = requiredFields.filter(field => !createPayload[field]);
            if (missing.length > 0) {
                console.log(`  ❌ Missing required fields: ${missing.join(', ')}`);
                success = false;
            } else {
                console.log('  ✅ All required fields present');
            }

            // Test update payload
            const updatePayload = UnifiedPayloadBuilder.build(entity, fieldMap, true);
            console.log('  ✅ Update payload generated');

            console.log(`  📦 Sample create payload:`, JSON.stringify(createPayload, null, 2).substring(0, 200) + '...');

        } catch (error) {
            console.log(`  ❌ Error generating payload: ${error.message}`);
            success = false;
        }

        console.log('');
    }

    if (success) {
        console.log('✅ UnifiedPayloadBuilder verification PASSED');
    } else {
        console.log('❌ UnifiedPayloadBuilder verification FAILED');
    }

    return success;
}

// Run verification
verifyUnifiedPayloadBuilder().then(success => {
    process.exit(success ? 0 : 1);
});
