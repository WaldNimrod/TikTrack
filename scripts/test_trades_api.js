// Focused trades CRUD testing with Logger+Network evidence
// Tests: CREATE, READ, UPDATE, DELETE after Team C fixes

const entities = [
    {
        name: 'trade',
        endpoint: '/api/trades/',
        payload: {
            ticker_id: 1,
            trading_account_id: 247, // Use admin trading account
            side: 'Long',
            investment_type: 'swing',
            status: 'open',
            planned_amount: 10000,
            entry_price: 100.50,
            notes: `QA Test trade ${Date.now()}`
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

// Test single entity CRUD operations
async function testEntityCRUD(entity, token) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log(`\n🎯 Testing ${entity.name}:`);
    console.log('='.repeat(50));

    let createdId = null;
    const results = {
        entity: entity.name,
        create: { pass: false, status: null, error: null, evidence: null },
        read: { pass: false, status: null, error: null, evidence: null },
        update: { pass: false, status: null, error: null, evidence: null },
        delete: { pass: false, status: null, error: null, evidence: null }
    };

    // CREATE
    try {
        console.log('📝 CREATE operation...');
        const response = await fetch(`http://localhost:8080${entity.endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(entity.payload)
        });

        const data = await response.json();
        results.create.status = response.status;
        results.create.evidence = data;

        if (response.ok) {
            results.create.pass = true;
            createdId = data.data?.id;
            console.log(`✅ CREATE: PASS (${response.status})`);
            console.log(`   ID: ${createdId}`);
        } else {
            results.create.error = data.error?.message || 'Unknown error';
            console.log(`❌ CREATE: FAIL (${response.status})`);
            console.log(`   Error: ${results.create.error}`);
        }

    } catch (error) {
        results.create.error = error.message;
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
        results.read.status = response.status;
        results.read.evidence = data;

        if (response.ok) {
            results.read.pass = true;
            console.log(`✅ READ: PASS (${response.status})`);
        } else {
            results.read.error = data.error?.message || 'Unknown error';
            console.log(`❌ READ: FAIL (${response.status})`);
            console.log(`   Error: ${results.read.error}`);
        }

    } catch (error) {
        results.read.error = error.message;
        console.log('❌ READ: ERROR');
        console.log(`   Exception: ${error.message}`);
    }

    // UPDATE
    try {
        console.log('✏️ UPDATE operation...');
        const updatePayload = {
            status: 'closed',
            notes: 'QA Test trade - Updated to closed'
        };

        const response = await fetch(`http://localhost:8080${entity.endpoint}${createdId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(updatePayload)
        });

        const data = await response.json();
        results.update.status = response.status;
        results.update.evidence = data;

        if (response.ok) {
            results.update.pass = true;
            console.log(`✅ UPDATE: PASS (${response.status})`);
        } else {
            results.update.error = data.error?.message || 'Unknown error';
            console.log(`❌ UPDATE: FAIL (${response.status})`);
            console.log(`   Error: ${results.update.error}`);
        }

    } catch (error) {
        results.update.error = error.message;
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
        results.delete.status = response.status;
        results.delete.evidence = data;

        if (response.ok) {
            results.delete.pass = true;
            console.log(`✅ DELETE: PASS (${response.status})`);
        } else {
            results.delete.error = data.error?.message || 'Unknown error';
            console.log(`❌ DELETE: FAIL (${response.status})`);
            console.log(`   Error: ${results.delete.error}`);
        }

    } catch (error) {
        results.delete.error = error.message;
        console.log('❌ DELETE: ERROR');
        console.log(`   Exception: ${error.message}`);
    }

    return results;
}

// Main execution
async function main() {
    console.log('🚀 Starting Focused Trades QA Testing');
    console.log('=====================================');
    console.log('Credentials: admin/admin123');
    console.log('Entity: trades');
    console.log('Operations: CREATE, READ, UPDATE, DELETE');
    console.log('');

    const token = await getAuthToken();
    if (!token) {
        console.error('❌ Cannot proceed without authentication');
        return;
    }

    const results = [];

    for (const entity of entities) {
        const entityResults = await testEntityCRUD(entity, token);
        results.push(entityResults);
    }

    // Summary
    console.log('\n🎯 QA TESTING SUMMARY');
    console.log('===================');

    const trades = results[0]; // Only testing trades
    const operations = ['create', 'read', 'update', 'delete'];
    let passCount = 0;

    operations.forEach(op => {
        const result = trades[op];
        const status = result.pass ? '✅ PASS' : '❌ FAIL';
        console.log(`${trades.entity} ${op.toUpperCase()}: ${status}`);
        if (result.pass) passCount++;
        if (!result.pass && result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });

    console.log(`\n📊 OVERALL RESULT: ${passCount}/4 operations PASSED`);

    if (passCount === 4) {
        console.log('✅ TRADES QA: FULL PASS - Ready for production');
    } else {
        console.log('❌ TRADES QA: PARTIAL/FAILED - Issues remain');
    }

    // Store results globally for debugging
    if (typeof window !== 'undefined') {
        window.tradesQAResults = results;
    }

    return results;
}

// Run the test
main().catch(console.error);
