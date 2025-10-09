// ===== סקריפט בדיקה לשילוב DataCollectionService =====
// להריץ בקונסולה של כל אחד מ-8 עמודי CRUD

console.clear();
console.log('🧪 Testing DataCollectionService Integration\n');
console.log('━'.repeat(60));

// בדיקה שהמערכת נטענה
if (!window.DataCollectionService) {
    console.error('❌ DataCollectionService NOT LOADED!');
    console.log('Make sure services/data-collection-service.js is loaded');
} else {
    console.log('✅ DataCollectionService loaded successfully\n');
    
    // בדיקת פונקציות
    const functions = [
        'collectFormData',
        'collectAllFormData',
        'setFormData',
        'setValue',
        'getValue',
        'resetForm'
    ];
    
    console.log('📋 Available Functions:');
    functions.forEach(fn => {
        const exists = typeof window.DataCollectionService[fn] === 'function';
        console.log(`  ${exists ? '✅' : '❌'} ${fn}`);
    });
    
    // בדיקת shortcuts
    console.log('\n📋 Global Shortcuts:');
    const shortcuts = ['collectFormData', 'setFormData', 'resetForm'];
    shortcuts.forEach(fn => {
        const exists = typeof window[fn] === 'function';
        console.log(`  ${exists ? '✅' : '❌'} window.${fn}`);
    });
}

console.log('\n━'.repeat(60));
console.log('\n🎯 Integration Status:');
console.log('Current Page:', window.location.pathname);

// בדיקת integration ספציפית לפי עמוד
const pageName = window.location.pathname.split('/').pop().replace('.html', '');
const pageTests = {
    'trading_accounts': () => {
        console.log('\n💼 Testing Trading Accounts...');
        console.log('  - saveTradingAccount uses DataCollectionService:', 
                    window.saveTradingAccount.toString().includes('DataCollectionService'));
        console.log('  - updateTradingAccount uses DataCollectionService:', 
                    window.updateTradingAccount.toString().includes('DataCollectionService'));
    },
    'trades': () => {
        console.log('\n📈 Testing Trades...');
        console.log('  - TradesController exists:', typeof window.tradesController !== 'undefined');
    },
    'tickers': () => {
        console.log('\n📊 Testing Tickers...');
        console.log('  - Tickers data:', window.tickersData ? window.tickersData.length + ' records' : 'not loaded');
    },
    'cash_flows': () => {
        console.log('\n💰 Testing Cash Flows...');
        console.log('  - Cash flows data loaded:', typeof window.cashFlowsData !== 'undefined');
    },
    'alerts': () => {
        console.log('\n🔔 Testing Alerts...');
        console.log('  - Alerts data loaded:', typeof window.alertsData !== 'undefined');
    },
    'trade_plans': () => {
        console.log('\n📋 Testing Trade Plans...');
        console.log('  - Trade plans data loaded:', typeof window.tradePlansData !== 'undefined');
    },
    'notes': () => {
        console.log('\n📝 Testing Notes...');
        console.log('  - Notes data loaded:', typeof window.notesData !== 'undefined');
    },
    'executions': () => {
        console.log('\n⚡ Testing Executions...');
        console.log('  - Executions data loaded:', typeof window.executionsData !== 'undefined');
    }
};

if (pageTests[pageName]) {
    pageTests[pageName]();
} else {
    console.log('\n⚠️ Page-specific tests not available for:', pageName);
}

console.log('\n━'.repeat(60));
console.log('\n✅ Integration test completed!');
console.log('\n📌 Next: Test CRUD operations (Add/Edit/Delete)');

