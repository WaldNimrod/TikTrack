// Focused executions CRUD testing after Team C fixes
// Tests: CREATE, READ, UPDATE, DELETE with Logger evidence

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const API_BASE = `${BASE_URL}/api`;

async function getAuthToken() {
    try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        return response.data.token;
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        return null;
    }
}

async function testExecutionsCRUD() {
    const token = await getAuthToken();
    if (!token) return;

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    console.log('🎯 Testing executions CRUD operations');
    console.log('=====================================');

    let testId = null;

    // 1. CREATE test
    try {
        console.log('\n📝 Testing CREATE operation...');
        const createPayload = {
            ticker_id: 1,
            trading_account_id: 247, // Use admin trading account
            action: 'BUY',
            quantity: 100,
            price: 150.50,
            date: '2026-01-01',
            fee: 10.00,
            source: 'manual',
            notes: 'QA Test execution'
        };

        const createResponse = await axios.post(`${API_BASE}/executions/`, createPayload, { headers });
        testId = createResponse.data.data.id;

        console.log('✅ CREATE: PASS');
        console.log(`   Status: ${createResponse.status}`);
        console.log(`   ID: ${testId}`);
        console.log(`   Message: ${createResponse.data.message}`);

    } catch (error) {
        console.log('❌ CREATE: FAIL');
        console.log(`   Status: ${error.response?.status || 'UNKNOWN'}`);
        console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
        return;
    }

    // 2. READ test
    try {
        console.log('\n📖 Testing READ operation...');
        const readResponse = await axios.get(`${API_BASE}/executions/${testId}`, { headers });

        console.log('✅ READ: PASS');
        console.log(`   Status: ${readResponse.status}`);
        console.log(`   Data: ${JSON.stringify(readResponse.data.data, null, 2)}`);

    } catch (error) {
        console.log('❌ READ: FAIL');
        console.log(`   Status: ${error.response?.status || 'UNKNOWN'}`);
        console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    }

    // 3. UPDATE test
    try {
        console.log('\n✏️  Testing UPDATE operation...');
        const updatePayload = {
            quantity: 200,
            price: 155.75,
            notes: 'QA Test execution - Updated'
        };

        const updateResponse = await axios.put(`${API_BASE}/executions/${testId}`, updatePayload, { headers });

        console.log('✅ UPDATE: PASS');
        console.log(`   Status: ${updateResponse.status}`);
        console.log(`   Message: ${updateResponse.data.message}`);

    } catch (error) {
        console.log('❌ UPDATE: FAIL');
        console.log(`   Status: ${error.response?.status || 'UNKNOWN'}`);
        console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    }

    // 4. DELETE test
    try {
        console.log('\n🗑️  Testing DELETE operation...');
        const deleteResponse = await axios.delete(`${API_BASE}/executions/${testId}`, { headers });

        console.log('✅ DELETE: PASS');
        console.log(`   Status: ${deleteResponse.status}`);
        console.log(`   Message: ${deleteResponse.data.message}`);

    } catch (error) {
        console.log('❌ DELETE: FAIL');
        console.log(`   Status: ${error.response?.status || 'UNKNOWN'}`);
        console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    }

    console.log('\n🎯 EXECUTIONS CRUD TESTING COMPLETED');
}

// Run the test
testExecutionsCRUD().catch(console.error);
