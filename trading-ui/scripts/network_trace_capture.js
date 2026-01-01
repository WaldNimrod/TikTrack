// Network trace capture for CRUD POST requests
console.log("🔍 Starting Network Trace Capture for CRUD POST requests...");

const capturedRequests = [];
const originalFetch = window.fetch;

// Intercept all fetch calls
window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    const method = options.method || 'GET';
    
    if (method === 'POST' && url.includes('/api/')) {
        const requestData = {
            timestamp: new Date().toISOString(),
            method,
            url,
            headers: options.headers || {},
            body: options.body ? (() => {
                try {
                    return JSON.parse(options.body);
                } catch (e) {
                    return options.body;
                }
            })() : null
        };
        
        capturedRequests.push(requestData);
        
        console.log(`📡 CAPTURED POST: ${url}`);
        console.log(`📦 Payload:`, requestData.body);
    }
    
    return originalFetch.apply(this, args);
};

// Function to show captured POST requests
window.showCapturedPosts = function() {
    console.log("\n📋 CAPTURED POST REQUESTS:");
    console.log("==========================");
    
    if (capturedRequests.length === 0) {
        console.log("❌ No POST requests captured yet");
        return;
    }
    
    capturedRequests.forEach((req, index) => {
        console.log(`\n${index + 1}. ${req.method} ${req.url}`);
        console.log(`   Timestamp: ${req.timestamp}`);
        if (req.body) {
            console.log(`   Payload: ${JSON.stringify(req.body, null, 2)}`);
        }
    });
};

// Function to filter by entity
window.filterPostsByEntity = function(entity) {
    const filtered = capturedRequests.filter(req => 
        req.url.includes(`/api/${entity}`)
    );
    
    console.log(`\n🎯 POST requests for ${entity}:`);
    console.log("================================");
    
    if (filtered.length === 0) {
        console.log(`❌ No POST requests found for ${entity}`);
        return;
    }
    
    filtered.forEach((req, index) => {
        console.log(`\n${index + 1}. ${req.url}`);
        console.log(`   Payload: ${JSON.stringify(req.body, null, 2)}`);
        
        // Check for required fields
        if (entity === 'trading_accounts' && !req.body.currency_id) {
            console.log(`   ❌ MISSING: currency_id`);
        }
        if (entity === 'cash_flows' && req.body.flow_type) {
            console.log(`   ❌ WRONG: using flow_type instead of type`);
        }
        if (entity === 'cash_flows' && req.body.type) {
            console.log(`   ✅ CORRECT: using type field`);
        }
        if (entity === 'alerts' && req.body.condition_operator === 'gt') {
            console.log(`   ❌ WRONG: using 'gt' instead of 'more_than'`);
        }
        if (entity === 'alerts' && req.body.condition_operator === 'more_than') {
            console.log(`   ✅ CORRECT: using 'more_than'`);
        }
    });
};

console.log("✅ Network trace capture active");
console.log("📝 Use showCapturedPosts() to see all captured requests");
console.log("🎯 Use filterPostsByEntity('trading_accounts') to see specific entity requests");
