// Stage 2 Full Regression Testing - All 8 entities
// Tests: executions, trading_accounts, tickers, trades, notes, alerts, user_profile, watch_lists
// Operations: Full CRUD where applicable, UPDATE only for user_profile

// Entity configurations
const entities = [
    {
        name: 'execution',
        endpoint: '/api/executions/',
        payload: {
            ticker_id: 1,
            trading_account_id: 247,
            action: 'buy',
            quantity: 100,
            price: 150.50,
            date: new Date().toISOString().split('T')[0],
            fee: 10.00,
            source: 'manual',
            notes: `Regression test execution ${Date.now()}`
        }
    },
    {
        name: 'trading_account',
        endpoint: '/api/trading_accounts/',
        payload: {
            name: `Regression Account ${Date.now()}`,
            currency_id: 1
        }
    },
    {
        name: 'ticker',
        endpoint: '/api/tickers/',
        payload: {
            symbol: `R${Date.now().toString().slice(-6)}`,
            name: `Regression Ticker ${Date.now()}`,
            type: 'stock',
            currency_id: 1
        }
    },
    {
        name: 'trade',
        endpoint: '/api/trades/',
        payload: {
            ticker_id: 1,
            trading_account_id: 247,
            side: 'Long',
            investment_type: 'swing',
            status: 'open',
            planned_amount: 10000,
            entry_price: 100.50,
            notes: `Regression test trade ${Date.now()}`
        }
    },
    {
        name: 'note',
        endpoint: '/api/notes/',
        payload: {
            title: 'Regression Test Note',
            content: 'Note created during Stage 2 full regression testing',
            related_type_id: 1,
            related_id: 1
        }
    },
    {
        name: 'alert',
        endpoint: '/api/alerts/',
        payload: {
            related_type_id: 4,
            related_id: 1,
            condition_attribute: 'price',
            condition_operator: 'more_than',
            condition_number: 100,
            status: 'open'
        }
    },
    {
        name: 'user_profile',
        endpoint: '/api/auth/me',
        method: 'PUT',
        payload: {
            first_name: 'Regression',
            last_name: 'Test',
            email: `regression.test.${Date.now()}@example.com`
        }
    },
    {
        name: 'watch_list',
        endpoint: '/api/watch_lists/',
        payload: {
            name: `Regression Watch List ${Date.now()}`,
            description: 'Watch list created during regression testing'
        }
    }
];

// First, get authentication token
async function getAuthToken() {
    try {
        console.log('🔐 Getting authentication token...');

        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Authentication successful');
        console.log('Token received:', data.data?.access_token ? 'YES' : 'NO');
        return data.data?.access_token;

    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        return null;
    }
}

// Test CRUD operations for an entity
async function testEntityCRUD(entity, token) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log(`\n🎯 Testing ${entity.name}:`);
    console.log('='.repeat(50));

    const results = {
        entity: entity.name,
        operations: {}
    };

    let createdId = null;

    // Special handling for user_profile (UPDATE only)
    if (entity.name === 'user_profile') {
        try {
            console.log('✏️ UPDATE operation (PUT /api/auth/me)...');
            const response = await fetch(`http://localhost:8080${entity.endpoint}`, {
                method: entity.method,
                headers: headers,
                body: JSON.stringify(entity.payload)
            });

            const data = await response.json();
            results.operations.update = {
                pass: response.ok,
                status: response.status,
                evidence: data
            };

            if (response.ok) {
                console.log(`✅ UPDATE: PASS (${response.status})`);
            } else {
                console.log(`❌ UPDATE: FAIL (${response.status})`);
                console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
            }

        } catch (error) {
            results.operations.update = {
                pass: false,
                status: null,
                error: error.message
            };
            console.log('❌ UPDATE: ERROR');
            console.log(`   Exception: ${error.message}`);
        }

        return results;
    }

    // Standard CRUD for other entities
    // CREATE
    try {
        console.log('📝 CREATE operation...');
        const response = await fetch(`http://localhost:8080${entity.endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(entity.payload)
        });

        const data = await response.json();
        results.operations.create = {
            pass: response.ok,
            status: response.status,
            evidence: data
        };

        if (response.ok) {
            createdId = data.data?.id;
            console.log(`✅ CREATE: PASS (${response.status})`);
            console.log(`   ID: ${createdId}`);
        } else {
            console.log(`❌ CREATE: FAIL (${response.status})`);
            console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
        }

    } catch (error) {
        results.operations.create = {
            pass: false,
            status: null,
            error: error.message
        };
        console.log('❌ CREATE: ERROR');
        console.log(`   Exception: ${error.message}`);
    }

    if (!createdId) {
        console.log('⚠️ Skipping READ/UPDATE/DELETE due to CREATE failure');
        return results;
    }

    // READ
    try {
        console.log('📖 READ operation...');
        const response = await fetch(`http://localhost:8080${entity.endpoint}${createdId}`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();
        results.operations.read = {
            pass: response.ok,
            status: response.status,
            evidence: data
        };

        if (response.ok) {
            console.log(`✅ READ: PASS (${response.status})`);
        } else {
            console.log(`❌ READ: FAIL (${response.status})`);
            console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
        }

    } catch (error) {
        results.operations.read = {
            pass: false,
            status: null,
            error: error.message
        };
        console.log('❌ READ: ERROR');
        console.log(`   Exception: ${error.message}`);
    }

    // UPDATE
    try {
        console.log('✏️ UPDATE operation...');
        let updatePayload;

        // Entity-specific update payloads
        switch (entity.name) {
            case 'execution':
                updatePayload = { quantity: 200, price: 155.75 };
                break;
            case 'trading_account':
                updatePayload = { name: 'Updated Regression Account' };
                break;
            case 'ticker':
                updatePayload = { symbol: entity.payload.symbol, name: 'Updated Regression Ticker' };
                break;
            case 'trade':
                updatePayload = { status: 'closed' };
                break;
            case 'note':
                updatePayload = { title: 'Updated Regression Note', content: 'Updated content for regression testing', related_type_id: entity.payload.related_type_id, related_id: entity.payload.related_id };
                break;
            case 'alert':
                updatePayload = { condition_number: 150, status: 'closed' };
                break;
            case 'watch_list':
                updatePayload = { name: 'Updated Regression Watch List' };
                break;
            default:
                updatePayload = { name: 'Updated' };
        }

        const response = await fetch(`http://localhost:8080${entity.endpoint}${createdId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(updatePayload)
        });

        const data = await response.json();
        results.operations.update = {
            pass: response.ok,
            status: response.status,
            evidence: data
        };

        if (response.ok) {
            console.log(`✅ UPDATE: PASS (${response.status})`);
        } else {
            console.log(`❌ UPDATE: FAIL (${response.status})`);
            console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
        }

    } catch (error) {
        results.operations.update = {
            pass: false,
            status: null,
            error: error.message
        };
        console.log('❌ UPDATE: ERROR');
        console.log(`   Exception: ${error.message}`);
    }

    // DELETE
    try {
        console.log('🗑️ DELETE operation...');
        const response = await fetch(`http://localhost:8080${entity.endpoint}${createdId}`, {
            method: 'DELETE',
            headers: headers
        });

        const data = await response.json();
        results.operations.delete = {
            pass: response.ok,
            status: response.status,
            evidence: data
        };

        if (response.ok) {
            console.log(`✅ DELETE: PASS (${response.status})`);
        } else {
            console.log(`❌ DELETE: FAIL (${response.status})`);
            console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
        }

    } catch (error) {
        results.operations.delete = {
            pass: false,
            status: null,
            error: error.message
        };
        console.log('❌ DELETE: ERROR');
        console.log(`   Exception: ${error.message}`);
    }

    return results;
}

// Main execution
async function main() {
    console.log('🚀 Starting Stage 2 Full Regression Testing');
    console.log('===========================================');
    console.log('Testing all 8 Stage 2 entities:');
    console.log('executions, trading_accounts, tickers, trades, notes, alerts, user_profile, watch_lists');
    console.log('Credentials: admin/admin123');
    console.log('');

    const token = await getAuthToken();
    if (!token) {
        console.error('❌ Cannot proceed without authentication');
        return;
    }

    const allResults = {
        timestamp: new Date().toISOString(),
        test_type: 'stage_2_full_regression',
        entities_tested: entities.length,
        credentials: { username: 'admin', password: 'admin123' },
        results: {}
    };

    let totalOperations = 0;
    let passedOperations = 0;

    for (const entity of entities) {
        const entityResults = await testEntityCRUD(entity, token);
        allResults.results[entity.name] = entityResults;

        // Count operations
        const operations = Object.keys(entityResults.operations);
        totalOperations += operations.length;

        operations.forEach(op => {
            if (entityResults.operations[op].pass) {
                passedOperations++;
            }
        });
    }

    // Summary
    console.log('\n🎯 STAGE 2 FULL REGRESSION SUMMARY');
    console.log('===================================');

    entities.forEach(entity => {
        const result = allResults.results[entity.name];
        const operations = Object.keys(result.operations);
        const passedCount = operations.filter(op => result.operations[op].pass).length;

        console.log(`${entity.name}: ${passedCount}/${operations.length} operations PASSED`);

        // Show failures
        operations.forEach(op => {
            if (!result.operations[op].pass) {
                const opResult = result.operations[op];
                console.log(`   ❌ ${op.toUpperCase()}: FAIL (${opResult.status || 'ERROR'})`);
                if (opResult.error) {
                    console.log(`      Error: ${opResult.error}`);
                }
            }
        });
    });

    console.log(`\n📊 OVERALL RESULT: ${passedOperations}/${totalOperations} operations PASSED`);

    if (passedOperations === totalOperations) {
        console.log('✅ STAGE 2 FULL REGRESSION: COMPLETE SUCCESS');
        console.log('🎉 All Stage 2 entities verified - Ready for production deployment');
    } else {
        console.log('❌ STAGE 2 FULL REGRESSION: ISSUES FOUND');
        console.log('🔧 Some entities have failures - check details above');
    }

    // Store results globally for debugging
    if (typeof window !== 'undefined') {
        window.stage2FullRegressionResults = allResults;
    }

    return allResults;
}

// Run the test
main().catch(console.error);
