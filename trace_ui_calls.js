// Script to trace what the UI actually sends when running CRUD tests
console.log("🔍 Tracing UI calls for CRUD tests...");

// Mock the fetch function to capture calls
const originalFetch = window.fetch;
const capturedCalls = [];

window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    const method = options.method || 'GET';
    
    capturedCalls.push({
        url,
        method,
        headers: options.headers,
        body: options.body ? JSON.parse(options.body) : null,
        timestamp: new Date().toISOString()
    });
    
    console.log(`📡 ${method} ${url}`);
    if (options.body) {
        try {
            const body = JSON.parse(options.body);
            console.log(`📦 Payload:`, JSON.stringify(body, null, 2));
        } catch (e) {
            console.log(`📦 Body:`, options.body);
        }
    }
    
    return originalFetch.apply(this, args);
};

// Function to run a specific test and capture calls
window.traceEntityTest = async function(entityType) {
    console.log(`\n🎯 Tracing ${entityType} CRUD test...`);
    capturedCalls.length = 0; // Clear previous calls
    
    try {
        // This simulates what the CRUD dashboard does
        const crudTester = window.crudTester;
        if (!crudTester) {
            console.error("❌ crudTester not found");
            return;
        }
        
        // Map entity type to page key
        const pageKey = Object.keys(crudTester.pages).find(key => {
            const page = crudTester.pages[key];
            return page.entityType === entityType || key.replace('_', '-') === entityType;
        });
        
        if (!pageKey) {
            console.error(`❌ Page key not found for ${entityType}`);
            return;
        }
        
        console.log(`📋 Using page key: ${pageKey} for entity: ${entityType}`);
        
        // This would trigger the actual test
        // For now, just check what endpoints would be used
        const unifiedService = window.UnifiedCRUDService;
        if (unifiedService) {
            const testPayload = { name: `Test ${entityType} ${Date.now()}` };
            if (entityType === 'trading_account') {
                testPayload.currency_id = 1;
            }
            
            console.log(`🔗 Would call: POST /api/${entityType.replace('_', '')}s/`);
            console.log(`📦 Would send:`, JSON.stringify(testPayload, null, 2));
        }
        
    } catch (error) {
        console.error("❌ Error tracing test:", error);
    }
    
    return capturedCalls;
};

// Function to show captured calls
window.showCapturedCalls = function() {
    console.log("\n📋 Captured Calls Summary:");
    capturedCalls.forEach((call, index) => {
        console.log(`${index + 1}. ${call.method} ${call.url}`);
        if (call.body) {
            console.log(`   Payload: ${JSON.stringify(call.body)}`);
        }
    });
};

console.log("✅ Tracing script loaded. Use:");
console.log("- traceEntityTest('trading_account') to trace a specific entity");
console.log("- showCapturedCalls() to see all captured calls");
