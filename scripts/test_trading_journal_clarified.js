// Comprehensive Trading Journal QA Testing (Clarified Requirements)
// Tests: 1) Weekly/Monthly views, 2) Table filters, 3) Detail drill-down, 4) Notes CRUD

const entities = [
    {
        name: 'trading_journal_weekly',
        endpoint: '/api/trading_journal/weekly',
        method: 'GET',
        description: 'Weekly view of journal entries'
    },
    {
        name: 'trading_journal_monthly',
        endpoint: '/api/trading_journal/monthly',
        method: 'GET',
        description: 'Monthly view of journal entries'
    },
    {
        name: 'trading_journal_filtered',
        endpoint: '/api/trading_journal/filtered',
        method: 'POST',
        payload: {
            date_from: '2026-01-01',
            date_to: '2026-01-31',
            entity_type: 'trade',
            tags: ['analysis']
        },
        description: 'Filtered journal entries'
    },
    {
        name: 'trading_journal_drilldown',
        endpoint: '/api/trading_journal/drilldown',
        method: 'GET',
        params: '?entity_type=trade&entity_id=1',
        description: 'Detail drill-down for specific entity'
    },
    {
        name: 'journal_notes_crud',
        endpoint: '/api/notes/',
        method: 'POST',
        payload: {
            title: 'Journal Note from Trading Journal',
            content: 'Note created through journal interface for trade analysis',
            related_type_id: 1,
            related_id: 1
        },
        description: 'Notes CRUD operations from journal interface'
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

// Test journal feature
async function testJournalFeature(entity, token) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log(`\n🎯 Testing ${entity.name}:`);
    console.log(`📝 ${entity.description}`);
    console.log('='.repeat(60));

    const results = {
        feature: entity.name,
        description: entity.description,
        pass: false,
        status: null,
        evidence: null,
        error: null
    };

    try {
        let url = `http://localhost:8080${entity.endpoint}`;
        if (entity.params) {
            url += entity.params;
        }

        const response = await fetch(url, {
            method: entity.method,
            headers: headers,
            body: entity.payload ? JSON.stringify(entity.payload) : undefined
        });

        const data = await response.json();
        results.status = response.status;
        results.evidence = data;

        if (response.ok) {
            results.pass = true;
            console.log(`✅ PASS (${response.status})`);
            console.log(`   Response contains: ${Array.isArray(data.data) ? `${data.data.length} items` : 'data object'}`);
        } else {
            results.error = data.error?.message || data.message || 'Unknown error';
            console.log(`❌ FAIL (${response.status})`);
            console.log(`   Error: ${results.error}`);
        }

    } catch (error) {
        results.error = error.message;
        console.log('❌ ERROR');
        console.log(`   Exception: ${error.message}`);
    }

    return results;
}

// Test Notes CRUD from journal context
async function testNotesCRUDFromJournal(token) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log(`\n🎯 Testing Notes CRUD from Journal Interface:`);
    console.log('='.repeat(60));

    const results = {
        feature: 'journal_notes_crud',
        operations: {}
    };

    let noteId = null;

    // CREATE note from journal
    try {
        console.log('📝 Creating note from journal interface...');
        const createPayload = {
            title: 'Journal Trading Note',
            content: 'Analysis note created through journal interface for trade ID 303',
            related_type_id: 1,
            related_id: 303
        };

        const response = await fetch('http://localhost:8080/api/notes/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(createPayload)
        });

        const data = await response.json();
        results.operations.create = {
            pass: response.ok,
            status: response.status,
            evidence: data
        };

        if (response.ok) {
            noteId = data.data?.id;
            console.log(`✅ Note CREATE: PASS (${response.status}) - ID: ${noteId}`);
        } else {
            console.log(`❌ Note CREATE: FAIL (${response.status})`);
            return results;
        }

    } catch (error) {
        results.operations.create = { pass: false, error: error.message };
        console.log('❌ Note CREATE: ERROR');
        return results;
    }

    // READ note from journal
    try {
        console.log('📖 Reading note in journal context...');
        const response = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
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
            console.log(`✅ Note READ: PASS (${response.status})`);
        } else {
            console.log(`❌ Note READ: FAIL (${response.status})`);
        }

    } catch (error) {
        results.operations.read = { pass: false, error: error.message };
        console.log('❌ Note READ: ERROR');
    }

    // UPDATE note from journal
    try {
        console.log('✏️ Updating note from journal interface...');
        const updatePayload = {
            title: 'Updated Journal Trading Note',
            content: 'Updated analysis note through journal interface with additional insights',
            related_type_id: 1,
            related_id: 303
        };

        const response = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
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
            console.log(`✅ Note UPDATE: PASS (${response.status})`);
        } else {
            console.log(`❌ Note UPDATE: FAIL (${response.status})`);
        }

    } catch (error) {
        results.operations.update = { pass: false, error: error.message };
        console.log('❌ Note UPDATE: ERROR');
    }

    // DELETE note from journal
    try {
        console.log('🗑️ Deleting note from journal interface...');
        const response = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
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
            console.log(`✅ Note DELETE: PASS (${response.status})`);
        } else {
            console.log(`❌ Note DELETE: FAIL (${response.status})`);
        }

    } catch (error) {
        results.operations.delete = { pass: false, error: error.message };
        console.log('❌ Note DELETE: ERROR');
    }

    return results;
}

// Main execution
async function main() {
    console.log('🚀 Comprehensive Trading Journal QA Testing (Clarified Requirements)');
    console.log('================================================================');
    console.log('Testing 4 core journal features:');
    console.log('1. Weekly/Monthly views');
    console.log('2. Table filters');
    console.log('3. Detail drill-down');
    console.log('4. Notes CRUD from journal');
    console.log('Credentials: admin/admin123');
    console.log('');

    const token = await getAuthToken();
    if (!token) {
        console.error('❌ Cannot proceed without authentication');
        return;
    }

    const allResults = {
        timestamp: new Date().toISOString(),
        test_type: 'stage_2_batch_5_clarified_journal_qa',
        features_tested: 4,
        credentials: { username: 'admin', password: 'admin123' },
        results: {}
    };

    let totalTests = 0;
    let passedTests = 0;

    // Test 1-3: Journal views and features
    console.log('\n📊 TESTING JOURNAL VIEWS & FEATURES');
    console.log('===================================');

    for (const entity of entities.slice(0, 4)) { // Skip notes CRUD for now
        const result = await testJournalFeature(entity, token);
        allResults.results[entity.name] = result;
        totalTests++;
        if (result.pass) passedTests++;
    }

    // Test 4: Notes CRUD from journal
    console.log('\n📝 TESTING NOTES CRUD FROM JOURNAL');
    console.log('=================================');

    const notesResult = await testNotesCRUDFromJournal(token);
    allResults.results.journal_notes_crud = notesResult;

    // Count notes CRUD operations
    const notesOperations = Object.keys(notesResult.operations);
    totalTests += notesOperations.length;
    notesOperations.forEach(op => {
        if (notesResult.operations[op].pass) passedTests++;
    });

    // Summary
    console.log('\n🎯 COMPREHENSIVE JOURNAL QA SUMMARY');
    console.log('==================================');

    // Feature results
    console.log('\n📊 Feature Results:');
    const features = [
        { name: 'Weekly View', key: 'trading_journal_weekly' },
        { name: 'Monthly View', key: 'trading_journal_monthly' },
        { name: 'Table Filters', key: 'trading_journal_filtered' },
        { name: 'Detail Drill-down', key: 'trading_journal_drilldown' },
        { name: 'Notes CRUD', key: 'journal_notes_crud' }
    ];

    features.forEach(feature => {
        const result = allResults.results[feature.key];
        if (feature.key === 'journal_notes_crud') {
            const ops = Object.keys(result.operations);
            const passedOps = ops.filter(op => result.operations[op].pass).length;
            console.log(`${feature.name}: ${passedOps}/${ops.length} operations PASSED`);
        } else {
            const status = result.pass ? '✅ PASS' : '❌ FAIL';
            console.log(`${feature.name}: ${status}`);
        }
    });

    console.log(`\n📊 OVERALL RESULT: ${passedTests}/${totalTests} tests PASSED`);

    if (passedTests === totalTests) {
        console.log('✅ TRADING JOURNAL QA: COMPLETE SUCCESS');
        console.log('🎉 All journal features validated successfully');
    } else {
        console.log('❌ TRADING JOURNAL QA: PARTIAL/FAILED');
        console.log('🔧 Some journal features have issues');
    }

    // Store results globally for debugging
    if (typeof window !== 'undefined') {
        window.tradingJournalClarifiedQAResults = allResults;
    }

    return allResults;
}

// Run the test
main().catch(console.error);
