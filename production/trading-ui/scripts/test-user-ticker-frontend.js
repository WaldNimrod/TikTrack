/**
 * Frontend Test Script for User-Ticker Integration
 * ================================================
 * 
 * Tests frontend functionality:
 * - Ticker selectors show only user's tickers
 * - Custom fields are displayed correctly
 * - API endpoints work correctly
 * 
 * Run this in browser console after page load
 */

(function() {
    'use strict';
    
    const testResults = [];
    
    function logTest(name, passed, message = '') {
        const status = passed ? '✅' : '❌';
        const logMessage = `${status} ${name}${message ? ': ' + message : ''}`;
        console.log(logMessage);
        testResults.push({ name, passed, message });
        return passed;
    }
    
    async function testTickersDataService() {
        console.log('\n=== Testing TickersData Service ===');
        
        if (!window.tickersData) {
            return logTest('TickersData service available', false, 'window.tickersData not found');
        }
        logTest('TickersData service available', true);
        
        // Test getUserTickers
        try {
            const tickers = await window.tickersData.getUserTickers({ force: true });
            const passed = Array.isArray(tickers) && tickers.length > 0;
            logTest('getUserTickers returns data', passed, `Got ${tickers.length} tickers`);
            
            if (tickers.length > 0) {
                const sample = tickers[0];
                const hasCustomFields = 'name_custom' in sample && 'type_custom' in sample;
                logTest('Tickers have custom fields', hasCustomFields, 
                    hasCustomFields ? `Sample: name_custom=${sample.name_custom}, type_custom=${sample.type_custom}` : 'Missing custom fields');
            }
        } catch (error) {
            return logTest('getUserTickers works', false, error.message);
        }
        
        return true;
    }
    
    async function testSelectPopulatorService() {
        console.log('\n=== Testing SelectPopulatorService ===');
        
        if (!window.SelectPopulatorService) {
            return logTest('SelectPopulatorService available', false, 'window.SelectPopulatorService not found');
        }
        logTest('SelectPopulatorService available', true);
        
        // Create a test select element
        const testSelect = document.createElement('select');
        testSelect.id = 'test-ticker-select';
        document.body.appendChild(testSelect);
        
        try {
            await window.SelectPopulatorService.populateTickersSelect(testSelect, {
                includeEmpty: true,
                emptyText: 'בחר טיקר...'
            });
            
            const options = Array.from(testSelect.options);
            const hasOptions = options.length > 1; // More than just the empty option
            logTest('populateTickersSelect populates select', hasOptions, `Got ${options.length} options`);
            
            // Check if options show custom names
            if (hasOptions) {
                const sampleOption = options.find(opt => opt.value && opt.value !== '');
                if (sampleOption) {
                    const showsCustomName = sampleOption.text.includes('-');
                    logTest('Options show ticker names', showsCustomName, `Sample: ${sampleOption.text}`);
                }
            }
            
            // Cleanup
            document.body.removeChild(testSelect);
        } catch (error) {
            document.body.removeChild(testSelect);
            return logTest('populateTickersSelect works', false, error.message);
        }
        
        return true;
    }
    
    async function testAPIEndpoints() {
        console.log('\n=== Testing API Endpoints ===');
        
        // Test GET /api/tickers/my
        try {
            const response = await fetch('/api/tickers/my');
            if (!response.ok) {
                return logTest('GET /api/tickers/my', false, `Status: ${response.status}`);
            }
            
            const data = await response.json();
            const hasData = data.status === 'success' && Array.isArray(data.data) && data.data.length > 0;
            logTest('GET /api/tickers/my returns data', hasData, `Got ${data.data?.length || 0} tickers`);
            
            if (hasData && data.data.length > 0) {
                const sample = data.data[0];
                const hasCustomFields = 'name_custom' in sample && 'type_custom' in sample && 'user_ticker_status' in sample;
                logTest('API returns custom fields', hasCustomFields, 
                    hasCustomFields ? `Sample has custom fields` : 'Missing custom fields in response');
            }
        } catch (error) {
            return logTest('GET /api/tickers/my', false, error.message);
        }
        
        // Test GET /api/tickers/ (should also return user's tickers)
        try {
            const response = await fetch('/api/tickers/');
            if (!response.ok) {
                return logTest('GET /api/tickers/', false, `Status: ${response.status}`);
            }
            
            const data = await response.json();
            const hasData = data.status === 'success' && Array.isArray(data.data);
            logTest('GET /api/tickers/ returns data', hasData, `Got ${data.data?.length || 0} tickers`);
        } catch (error) {
            return logTest('GET /api/tickers/', false, error.message);
        }
        
        return true;
    }
    
    async function testTickerSelectors() {
        console.log('\n=== Testing Ticker Selectors on Page ===');
        
        // Find all ticker select elements
        const tickerSelects = document.querySelectorAll('select[id*="ticker" i], select[name*="ticker" i], select[data-field*="ticker" i]');
        
        if (tickerSelects.length === 0) {
            logTest('Ticker selectors found', false, 'No ticker select elements found on page');
            return true; // Not a failure, just no selects on current page
        }
        
        logTest('Ticker selectors found', true, `Found ${tickerSelects.length} select(s)`);
        
        // Check if they're populated
        let populatedCount = 0;
        for (const select of tickerSelects) {
            if (select.options.length > 1) { // More than just placeholder
                populatedCount++;
            }
        }
        
        logTest('Ticker selectors populated', populatedCount > 0, `${populatedCount}/${tickerSelects.length} populated`);
        
        return true;
    }
    
    async function testTickersPage() {
        console.log('\n=== Testing Tickers Page ===');
        
        // Check if we're on tickers page
        if (!window.location.pathname.includes('tickers')) {
            logTest('On tickers page', false, 'Not on tickers page - skipping');
            return true;
        }
        
        // Check if tickers table exists
        const tickersTable = document.querySelector('table[data-table-type="tickers"], #tickersTable, table.tickers-table');
        if (!tickersTable) {
            logTest('Tickers table found', false, 'Tickers table not found');
            return true;
        }
        
        logTest('Tickers table found', true);
        
        // Check if table rows show custom fields
        const rows = tickersTable.querySelectorAll('tbody tr');
        if (rows.length > 0) {
            const firstRow = rows[0];
            const hasCustomName = firstRow.textContent.includes('name_custom') || 
                                 firstRow.querySelector('td:nth-child(7)'); // Name column
            logTest('Table shows ticker data', hasCustomName, `${rows.length} rows found`);
        }
        
        return true;
    }
    
    async function runAllTests() {
        console.log('\n' + '='.repeat(60));
        console.log('FRONTEND USER-TICKER INTEGRATION TESTS');
        console.log('='.repeat(60));
        console.log(`Page: ${window.location.pathname}`);
        console.log(`Time: ${new Date().toLocaleString()}`);
        
        await testTickersDataService();
        await testSelectPopulatorService();
        await testAPIEndpoints();
        await testTickerSelectors();
        await testTickersPage();
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        
        const passed = testResults.filter(r => r.passed).length;
        const total = testResults.length;
        
        testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.name}${result.message ? ': ' + result.message : ''}`);
        });
        
        console.log(`\nTotal: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('✅ All tests passed! 🎉');
        } else {
            console.log(`❌ ${total - passed} test(s) failed`);
        }
        
        return { passed, total, results: testResults };
    }
    
    // Export for manual testing
    window.testUserTickerIntegration = runAllTests;
    
    // Auto-run if on test page or if explicitly requested
    if (window.location.search.includes('test=user-ticker') || window.location.hash === '#test') {
        runAllTests();
    } else {
        console.log('Frontend test script loaded. Run window.testUserTickerIntegration() to execute tests.');
    }
})();


