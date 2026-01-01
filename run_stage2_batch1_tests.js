
// Script to run Stage 2 Batch 1 tests
async function runStage2Batch1Tests() {
    console.log('🚀 Starting Stage 2 Batch 1 tests...');
    
    try {
        // Run executions test
        console.log('📊 Testing executions...');
        await window.runExecutionTestOnly();
        
        // Run trading_accounts test  
        console.log('💰 Testing trading_accounts...');
        await window.runTradingAccountTestOnly();
        
        console.log('✅ Stage 2 Batch 1 tests completed');
        
    } catch (error) {
        console.error('❌ Stage 2 Batch 1 tests failed:', error);
    }
}

// Run the tests
runStage2Batch1Tests();

