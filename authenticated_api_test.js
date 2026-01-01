// Authenticated API testing - testing with actual authentication
// This will test what happens when UI runs tests with proper auth

const entities = [
    {
        name: 'trade_plan',
        endpoint: '/api/trade-plans/',
        payload: {
            trading_account_id: 1,
            ticker_id: 1,
            side: 'Long',
            investment_type: 'swing',
            status: 'open',
            planned_amount: 10000,
            entry_price: 100,
            notes: `Test trade plan ${Date.now()}`
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
            status: 'new'
        }
    },
    {
        name: 'ticker',
        endpoint: '/api/tickers/',
        payload: {
            symbol: `T${Date.now().toString().slice(-6)}`.slice(0, 10),
            name: `Test Ticker ${Date.now()}`,
            type: 'stock',
            currency_id: 1
        }
    },
    {
        name: 'trading_account',
        endpoint: '/api/trading_accounts/',
        payload: {
            name: `Test Account ${Date.now()}`,
            currency_id: 1
        }
    },
    {
        name: 'cash_flow',
        endpoint: '/api/cash-flows/',
        payload: {
            amount: 1000,
            type: 'deposit',
            trading_account_id: 1,
            currency_id: 1,
            date: new Date().toISOString().split('T')[0],
            source: 'manual'
        }
    },
    {
        name: 'user_profile',
        endpoint: '/api/auth/me',
        method: 'PUT',
        payload: {
            first_name: 'Test',
            last_name: 'User',
            email: `test.user.${Date.now()}@example.com`
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

async function testEntity(entity, authToken) {
    const url = `http://localhost:8080${entity.endpoint}`;
    const method = entity.method || 'POST';
    
    console.log(`\n🎯 Testing ${entity.name}:`);
    console.log(`   URL: ${method} ${url}`);
    console.log(`   Payload:`, JSON.stringify(entity.payload, null, 2));
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(entity.payload)
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = { raw: responseText };
        }
        
        console.log(`   Response:`, responseData);
        
        // Extract error message like UI does
        let extractedMessage = 'Unknown error';
        if (responseData.error?.message) {
            extractedMessage = responseData.error.message;
        } else if (responseData.message) {
            extractedMessage = responseData.message;
        }
        
        console.log(`   🎯 Extracted Error: "${extractedMessage}"`);
        
        return {
            entity: entity.name,
            endpoint: entity.endpoint,
            method,
            payload: entity.payload,
            status: response.status,
            response: responseData,
            extractedMessage,
            success: response.ok
        };
        
    } catch (error) {
        console.log(`   ❌ Network Error:`, error.message);
        return {
            entity: entity.name,
            endpoint: entity.endpoint,
            method,
            payload: entity.payload,
            error: error.message,
            success: false
        };
    }
}

async function runAuthenticatedTests() {
    console.log('🚀 Starting Authenticated API Tests for 6 Failing Entities\n');
    
    // Get authentication token first
    const authToken = await getAuthToken();
    if (!authToken) {
        console.error('❌ Cannot proceed without authentication');
        return;
    }
    
    console.log('🔑 Using auth token for all requests\n');
    
    const results = [];
    
    for (const entity of entities) {
        const result = await testEntity(entity, authToken);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between requests
    }
    
    console.log('\n📊 AUTHENTICATED API TEST RESULTS:');
    console.log('===================================');
    
    results.forEach(result => {
        console.log(`\n${result.entity.toUpperCase()}:`);
        if (result.error) {
            console.log(`   ❌ Network Error: ${result.error}`);
        } else {
            console.log(`   📡 ${result.method} ${result.endpoint}`);
            console.log(`   📥 Status: ${result.status}`);
            console.log(`   🎯 Extracted Error: "${result.extractedMessage}"`);
            console.log(`   📄 Full Response:`, result.response);
        }
    });
    
    console.log('\n🎉 ANALYSIS:');
    console.log('============');
    
    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);
    
    console.log(`Total entities tested: ${results.length}`);
    console.log(`Successful (2xx): ${successes.length}`);
    console.log(`Failed: ${failures.length}`);
    
    console.log('\n✅ SUCCESSFUL:');
    successes.forEach(success => {
        console.log(`- ${success.entity}: ${success.status} (${success.extractedMessage || 'Success'})`);
    });
    
    console.log('\n❌ FAILED:');
    failures.forEach(failure => {
        console.log(`- ${failure.entity}: ${failure.status} (${failure.extractedMessage || 'Error'})`);
    });
    
    // Check against expected failures from the matrix
    console.log('\n🔍 VALIDATION AGAINST FAILURE MATRIX:');
    console.log('======================================');
    
    const expectedFailures = {
        trade_plan: '404 on POST',
        alert: '400 validation', 
        ticker: '500 server error',
        trading_account: '400 validation',
        cash_flow: '400 validation',
        user_profile: '400 validation'
    };
    
    let matrixMatches = 0;
    results.forEach(result => {
        const expected = expectedFailures[result.entity];
        const actual = result.success ? 'SUCCESS' : `${result.status}`;
        
        const match = (expected === '404 on POST' && result.status === 404) ||
                     (expected === '400 validation' && result.status === 400) ||
                     (expected === '500 server error' && result.status === 500) ||
                     (result.success);
        
        if (match) matrixMatches++;
        
        console.log(`${result.entity}: Expected "${expected}" → Actual "${actual}" ${match ? '✅' : '❌'}`);
    });
    
    console.log(`\nMatrix compliance: ${matrixMatches}/${results.length} entities match expected failures`);
    
    console.log('\n💾 Results stored in window.authenticatedAPITestResults');
    global.window = { authenticatedAPITestResults: results };
    
    return results;
}

// Run the authenticated tests
runAuthenticatedTests().then(results => {
    console.log('\n✅ Authenticated API testing completed');
}).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
});
