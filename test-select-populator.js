// ===== בדיקת SelectPopulatorService =====
// להריץ בקונסולה של דף עם המערכת

console.clear();
console.log('🧪 Testing SelectPopulatorService\n');
console.log('━'.repeat(60));

// בדיקה 1: קיום המערכת
console.log('\n📦 Test 1: Service Availability');
if (!window.SelectPopulatorService) {
    console.error('❌ FAIL: SelectPopulatorService NOT LOADED!');
} else {
    console.log('✅ PASS: SelectPopulatorService loaded');
}

// בדיקה 2: פונקציות זמינות
console.log('\n📋 Test 2: Available Functions');
const functions = [
    'populateTickersSelect',
    'populateAccountsSelect',
    'populateCurrenciesSelect',
    'populateTradePlansSelect',
    'populateGenericSelect'
];

let allFunctionsExist = true;
functions.forEach(fn => {
    const exists = typeof window.SelectPopulatorService[fn] === 'function';
    console.log(`  ${exists ? '✅' : '❌'} ${fn}`);
    if (!exists) allFunctionsExist = false;
});

if (allFunctionsExist) {
    console.log('\n✅ PASS: All functions available');
} else {
    console.error('\n❌ FAIL: Some functions missing');
}

// בדיקה 3: Global shortcuts
console.log('\n📋 Test 3: Global Shortcuts');
const shortcuts = [
    'populateTickersSelect',
    'populateAccountsSelect',
    'populateCurrenciesSelect'
];

let allShortcutsExist = true;
shortcuts.forEach(fn => {
    const exists = typeof window[fn] === 'function';
    console.log(`  ${exists ? '✅' : '❌'} window.${fn}`);
    if (!exists) allShortcutsExist = false;
});

if (allShortcutsExist) {
    console.log('\n✅ PASS: All shortcuts available');
} else {
    console.error('\n❌ FAIL: Some shortcuts missing');
}

// בדיקה 4: API Test - Tickers
console.log('\n📋 Test 4: API Integration Test (Click button to test)');
console.log('Run this in console after services load:');
console.log(`
// Test tickers population:
await window.SelectPopulatorService.populateTickersSelect('testSelect', {
    includeEmpty: true,
    emptyText: 'בחר טיקר...',
    filterActive: true
});

// Test accounts population:
await window.SelectPopulatorService.populateAccountsSelect('testSelect', {
    includeEmpty: true,
    emptyText: 'בחר חשבון...',
    filterActive: true
});

// Test currencies population:
await window.SelectPopulatorService.populateCurrenciesSelect('testSelect', {
    includeEmpty: true,
    emptyText: 'בחר מטבע...',
    setDefault: true
});
`);

console.log('\n━'.repeat(60));
console.log('\n✅ Basic tests completed!');
console.log('\n💡 Next: Test actual population with HTML select elements');
console.log('   Create a <select id="testSelect"></select> and run API tests above');



