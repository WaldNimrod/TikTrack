// ===== סקריפט בדיקה מקיף למערכות השירות החדשות =====
// העתק והדבק ב-Console של http://localhost:8080/services-test

console.clear();
console.log('🧪 Starting comprehensive services test...\n');

const results = {};

// ===== TEST 1: DataCollectionService =====
console.log('📦 Test 1: DataCollectionService');
try {
    if (!window.DataCollectionService) throw new Error('DataCollectionService not found');
    
    document.getElementById('testText').value = 'Test123';
    document.getElementById('testNumber').value = '456.78';
    
    const collected = window.DataCollectionService.collectFormData({
        text: { id: 'testText', type: 'text' },
        number: { id: 'testNumber', type: 'number' }
    });
    
    if (collected.text !== 'Test123') throw new Error('Text collection failed');
    if (collected.number !== 456.78) throw new Error('Number conversion failed');
    
    window.DataCollectionService.setValue('testText', 'NewValue', 'text');
    if (document.getElementById('testText').value !== 'NewValue') throw new Error('setValue failed');
    
    results.dataCollection = '✅ PASS';
    console.log('  ✅ DataCollectionService - PASS\n');
} catch (error) {
    results.dataCollection = '❌ FAIL: ' + error.message;
    console.error('  ❌ DataCollectionService - FAIL:', error.message, '\n');
}

// ===== TEST 2: FieldRendererService =====
console.log('🎨 Test 2: FieldRendererService');
try {
    if (!window.FieldRendererService) throw new Error('FieldRendererService not found');
    
    const statusHTML = window.FieldRendererService.renderStatus('open', 'trade');
    if (!statusHTML.includes('status-badge')) throw new Error('Status badge failed');
    
    const sideHTML = window.FieldRendererService.renderSide('Long');
    if (!sideHTML.includes('side-badge')) throw new Error('Side badge failed');
    
    const pnlHTML = window.FieldRendererService.renderPnL(100, '$');
    if (!pnlHTML.includes('pnl-badge')) throw new Error('PnL badge failed');
    
    const typeHTML = window.FieldRendererService.renderType('swing');
    if (!typeHTML.includes('type-badge')) throw new Error('Type badge failed');
    
    const actionHTML = window.FieldRendererService.renderAction('buy');
    if (!actionHTML.includes('action-badge')) throw new Error('Action badge failed');
    
    const priorityHTML = window.FieldRendererService.renderPriority('high');
    if (!priorityHTML.includes('priority-badge')) throw new Error('Priority badge failed');
    
    results.fieldRenderer = '✅ PASS';
    console.log('  ✅ FieldRendererService - PASS\n');
} catch (error) {
    results.fieldRenderer = '❌ FAIL: ' + error.message;
    console.error('  ❌ FieldRendererService - FAIL:', error.message, '\n');
}

// ===== TEST 3: SelectPopulatorService =====
console.log('📋 Test 3: SelectPopulatorService');
try {
    if (!window.SelectPopulatorService) throw new Error('SelectPopulatorService not found');
    
    if (typeof window.SelectPopulatorService.populateTickersSelect !== 'function') {
        throw new Error('populateTickersSelect not found');
    }
    
    results.selectPopulator = '✅ PASS (click button to test API)';
    console.log('  ✅ SelectPopulatorService - PASS (click button to test API)\n');
} catch (error) {
    results.selectPopulator = '❌ FAIL: ' + error.message;
    console.error('  ❌ SelectPopulatorService - FAIL:', error.message, '\n');
}

// ===== TEST 4: CRUDResponseHandler =====
console.log('🔄 Test 4: CRUDResponseHandler');
try {
    if (!window.CRUDResponseHandler) throw new Error('CRUDResponseHandler not found');
    
    if (typeof window.CRUDResponseHandler.handleSaveResponse !== 'function') {
        throw new Error('handleSaveResponse not found');
    }
    if (typeof window.CRUDResponseHandler.handleUpdateResponse !== 'function') {
        throw new Error('handleUpdateResponse not found');
    }
    if (typeof window.CRUDResponseHandler.handleDeleteResponse !== 'function') {
        throw new Error('handleDeleteResponse not found');
    }
    
    results.crudHandler = '✅ PASS (click buttons to test)';
    console.log('  ✅ CRUDResponseHandler - PASS (click buttons to test responses)\n');
} catch (error) {
    results.crudHandler = '❌ FAIL: ' + error.message;
    console.error('  ❌ CRUDResponseHandler - FAIL:', error.message, '\n');
}

// ===== TEST 5: DefaultValueSetter =====
console.log('⚙️ Test 5: DefaultValueSetter');
try {
    if (!window.DefaultValueSetter) throw new Error('DefaultValueSetter not found');
    
    const date = window.DefaultValueSetter.setCurrentDate('testDefaultDate');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('setCurrentDate failed');
    
    const dateTime = window.DefaultValueSetter.setCurrentDateTime('testDefaultDateTime');
    if (!dateTime || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTime)) throw new Error('setCurrentDateTime failed');
    
    window.DefaultValueSetter.setLogicalDefault('testDefaultStatus', 'open');
    if (document.getElementById('testDefaultStatus').value !== 'open') throw new Error('setLogicalDefault failed');
    
    results.defaultValues = '✅ PASS';
    console.log('  ✅ DefaultValueSetter - PASS\n');
} catch (error) {
    results.defaultValues = '❌ FAIL: ' + error.message;
    console.error('  ❌ DefaultValueSetter - FAIL:', error.message, '\n');
}

// ===== TEST 6: StatisticsCalculator =====
console.log('📊 Test 6: StatisticsCalculator');
try {
    if (!window.StatisticsCalculator) throw new Error('StatisticsCalculator not found');
    
    const data = [
        { value: 10, status: 'open' },
        { value: 20, status: 'open' },
        { value: 30, status: 'closed' }
    ];
    
    const sum = window.StatisticsCalculator.calculateSum(data, 'value');
    if (sum !== 60) throw new Error(`Sum failed: expected 60, got ${sum}`);
    
    const avg = window.StatisticsCalculator.calculateAverage(data, 'value');
    if (avg !== 20) throw new Error(`Average failed: expected 20, got ${avg}`);
    
    const count = window.StatisticsCalculator.countRecords(data);
    if (count !== 3) throw new Error(`Count failed: expected 3, got ${count}`);
    
    const openCount = window.StatisticsCalculator.countRecords(data, (item) => item.status === 'open');
    if (openCount !== 2) throw new Error(`Filtered count failed: expected 2, got ${openCount}`);
    
    const { min, max } = window.StatisticsCalculator.getMinMax(data, 'value');
    if (min !== 10 || max !== 30) throw new Error(`MinMax failed: expected 10/30, got ${min}/${max}`);
    
    results.statistics = '✅ PASS';
    console.log('  ✅ StatisticsCalculator - PASS\n');
} catch (error) {
    results.statistics = '❌ FAIL: ' + error.message;
    console.error('  ❌ StatisticsCalculator - FAIL:', error.message, '\n');
}

// ===== SUMMARY =====
console.log('━'.repeat(60));
console.log('📋 SUMMARY - Test Results:');
console.log('━'.repeat(60));
console.log('1. DataCollectionService:', results.dataCollection);
console.log('2. FieldRendererService:', results.fieldRenderer);
console.log('3. SelectPopulatorService:', results.selectPopulator);
console.log('4. CRUDResponseHandler:', results.crudHandler);
console.log('5. DefaultValueSetter:', results.defaultValues);
console.log('6. StatisticsCalculator:', results.statistics);
console.log('━'.repeat(60));

const passed = Object.values(results).filter(r => r.includes('✅')).length;
const failed = Object.values(results).filter(r => r.includes('❌')).length;

console.log(`\n🎯 Final Score: ${passed}/6 PASSED, ${failed}/6 FAILED`);

if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Services are ready for integration.\n');
    console.log('📌 Next steps:');
    console.log('   1. Click all buttons on the page to test UI interactions');
    console.log('   2. Click "טען כל Select Boxes" to test API calls');
    console.log('   3. Verify all badges render correctly');
    console.log('   4. If everything works → proceed to Stage B (integration)\n');
} else {
    console.log('\n⚠️ Some tests failed. Review errors above and fix before proceeding.\n');
}

