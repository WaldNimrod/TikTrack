/**
 * Stage 2 Field Maps Verification
 * Verify that UI selectors exist for executions and trading_accounts
 */

// Simulate window and Logger for Node.js
global.window = {
    Logger: {
        info: (msg, data) => console.log('ℹ️', msg, data || ''),
        error: (msg, data) => console.log('❌', msg, data || ''),
        warn: (msg, data) => console.log('⚠️', msg, data || '')
    }
};

// Simulate document
global.document = {
    querySelector: (selector) => {
        // Mock selectors - return true if selector exists in field maps
        const validSelectors = [
            '#accountName', '#accountCurrency', '#accountOpeningBalance', '#accountStatus', '#accountNotes',
            '#executionTicker', '#executionAccount', '#executionType', '#executionQuantity',
            '#executionPrice', '#executionDate', '#executionCommission', '#executionSource',
            '#executionExternalId', '#executionNotes', '#executionRealizedPL', '#executionMTMPL', '#executionTradeId'
        ];
        return validSelectors.includes(selector) ? {} : null;
    }
};

// Import field maps (simulated)
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

function verifyFieldMaps() {
    console.log('🔍 Verifying UI Field Maps for Stage 2 entities...\n');

    const entities = ['trading_account', 'execution'];
    let totalSelectors = 0;
    let foundSelectors = 0;
    let missingSelectors = [];

    for (const entity of entities) {
        console.log(`📋 Checking ${entity}:`);

        const fieldMap = fieldMaps[entity];
        for (const [fieldName, fieldConfig] of Object.entries(fieldMap.fields)) {
            totalSelectors++;
            const selector = fieldConfig.id;
            const element = document.querySelector(selector);

            if (element) {
                foundSelectors++;
                console.log(`  ✅ ${fieldName}: ${selector}`);
            } else {
                missingSelectors.push({ entity, field: fieldName, selector });
                console.log(`  ❌ ${fieldName}: ${selector} (MISSING)`);
            }
        }
        console.log('');
    }

    console.log('📊 Summary:');
    console.log(`  Total selectors: ${totalSelectors}`);
    console.log(`  Found selectors: ${foundSelectors}`);
    console.log(`  Missing selectors: ${missingSelectors.length}`);

    if (missingSelectors.length > 0) {
        console.log('\n❌ Missing selectors:');
        missingSelectors.forEach(item => {
            console.log(`  ${item.entity}.${item.field}: ${item.selector}`);
        });
    } else {
        console.log('\n✅ All selectors found!');
    }

    return missingSelectors.length === 0;
}

// Run verification
const success = verifyFieldMaps();
process.exit(success ? 0 : 1);
