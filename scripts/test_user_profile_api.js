// Focused user_profile testing with Logger+Network evidence
// Tests: UPDATE operation (user_profile uses PUT /api/auth/me)

const entities = [
    {
        name: 'user_profile',
        endpoint: '/api/auth/me',
        method: 'PUT',
        payload: {
            first_name: 'QA Test',
            last_name: 'User',
            email: `qa.test.${Date.now()}@example.com`
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

// Test single entity operation (user_profile only supports UPDATE via PUT)
async function testEntityOperation(entity, token) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log(`\n🎯 Testing ${entity.name}:`);
    console.log('='.repeat(50));

    const results = {
        entity: entity.name,
        update: { pass: false, status: null, error: null, evidence: null }
    };

    // UPDATE (PUT) operation for user_profile
    try {
        console.log('✏️ UPDATE operation (PUT /api/auth/me)...');
        const response = await fetch(`http://localhost:8080${entity.endpoint}`, {
            method: entity.method,
            headers: headers,
            body: JSON.stringify(entity.payload)
        });

        const data = await response.json();
        results.update.status = response.status;
        results.update.evidence = data;

        if (response.ok) {
            results.update.pass = true;
            console.log(`✅ UPDATE: PASS (${response.status})`);
            console.log(`   Message: ${data.data?.message || data.message}`);
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

    return results;
}

// Main execution
async function main() {
    console.log('🚀 Starting Focused User Profile QA Testing');
    console.log('============================================');
    console.log('Credentials: admin/admin123');
    console.log('Entity: user_profile');
    console.log('Operations: UPDATE (PUT /api/auth/me)');
    console.log('');

    const token = await getAuthToken();
    if (!token) {
        console.error('❌ Cannot proceed without authentication');
        return;
    }

    const results = [];

    for (const entity of entities) {
        const entityResults = await testEntityOperation(entity, token);
        results.push(entityResults);
    }

    // Summary
    console.log('\n🎯 QA TESTING SUMMARY');
    console.log('===================');

    const userProfile = results[0]; // Only testing user_profile
    const operations = ['update'];
    let passCount = 0;

    operations.forEach(op => {
        const result = userProfile[op];
        const status = result.pass ? '✅ PASS' : '❌ FAIL';
        console.log(`${userProfile.entity} ${op.toUpperCase()}: ${status}`);
        if (result.pass) passCount++;
        if (!result.pass && result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });

    console.log(`\n📊 OVERALL RESULT: ${passCount}/1 operations PASSED`);

    if (passCount === 1) {
        console.log('✅ USER_PROFILE QA: FULL PASS - Ready for production');
    } else {
        console.log('❌ USER_PROFILE QA: FAILED - Issues remain');
    }

    // Store results globally for debugging
    if (typeof window !== 'undefined') {
        window.userProfileQAResults = results;
    }

    return results;
}

// Run the test
main().catch(console.error);
