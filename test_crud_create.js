// Test CRUD create for trades
async function testCRUDCreate() {
    try {
        // Mock the required services
        window.Logger = {
            debug: console.log,
            info: console.log,
            error: console.error,
            warn: console.warn
        };

        // Load the unified CRUD service
        await import('./trading-ui/scripts/services/unified-crud-service.js');

        // Test data for trade
        const testData = {
            trading_account_id: 1,
            ticker_id: 1,
            status: 'open',
            side: 'Long',
            investment_type: 'swing',
            planned_quantity: 100,
            entry_price: 100,
            notes: 'Test trade from script'
        };

        console.log('Testing UnifiedCRUDService.create for trade...');
        console.log('Test data:', testData);

        const result = await window.UnifiedCRUDService.create('trade', testData);

        console.log('Result:', result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', result ? Object.keys(result) : 'null');
        console.log('Success check:', result && (result.success === true || result.status === 'success'));
        console.log('Record ID:', result?.data?.id || result?.id);

    } catch (error) {
        console.error('Error:', error);
    }
}

testCRUDCreate();
