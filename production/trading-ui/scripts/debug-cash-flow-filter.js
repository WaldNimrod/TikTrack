/**
 * Debug script for cash flow type filter
 * 
 * USAGE:
 * 1. Copy the entire content of this file
 * 2. Paste it in the browser console on the cash_flows page
 * 3. Or run: eval(await fetch('/scripts/debug-cash-flow-filter.js').then(r => r.text()))
 * 
 * After running, use: testCashFlowFilter("deposit") to test the filter manually
 */

(function debugCashFlowFilter() {
  console.log('🔍 ===== Cash Flow Filter Debug =====');
  
  // 1. Check if select element exists
  const select = document.getElementById('cashFlowTypeFilter');
  console.log('1️⃣ Select element check:', {
    exists: !!select,
    id: select?.id,
    value: select?.value,
    options: select ? Array.from(select.options).map(opt => ({ value: opt.value, text: opt.text })) : null
  });
  
  // 2. Check EventHandlerManager
  console.log('2️⃣ EventHandlerManager check:', {
    exists: !!window.EventHandlerManager,
    initialized: window.EventHandlerManager?.initialized,
    hasHandleFilterChange: typeof window.EventHandlerManager?.handleFilterChange === 'function',
    hasHandleDelegatedChange: typeof window.EventHandlerManager?.handleDelegatedChange === 'function'
  });
  
  // 3. Check if select has data-filter-change attribute
  console.log('3️⃣ Data attributes check:', {
    hasDataFilterChange: select?.hasAttribute('data-filter-change'),
    dataFilterChangeValue: select?.getAttribute('data-filter-change'),
    hasDataOnchange: select?.hasAttribute('data-onchange'),
    dataOnchangeValue: select?.getAttribute('data-onchange')
  });
  
  // 4. Check for event listeners (if possible)
  console.log('4️⃣ Event listeners check:', {
    // Note: Can't directly access listeners, but we can check if change event works
    canTriggerChange: !!select
  });
  
  // 5. Check filterCashFlowsByType function
  console.log('5️⃣ Filter function check:', {
    exists: typeof window.filterCashFlowsByType === 'function',
    type: typeof window.filterCashFlowsByType
  });
  
  // 6. Check activeCashFlowTypeFilter
  console.log('6️⃣ Active filter state:', {
    activeCashFlowTypeFilter: typeof window.activeCashFlowTypeFilter !== 'undefined' 
      ? window.activeCashFlowTypeFilter 
      : 'undefined (check cash_flows.js scope)'
  });
  
  // 7. Test manual trigger
  if (select) {
    console.log('7️⃣ Testing manual change event...');
    const testEvent = new Event('change', { bubbles: true, cancelable: true });
    select.dispatchEvent(testEvent);
    console.log('   ✅ Change event dispatched');
  }
  
  // 8. Check pagination instance
  console.log('8️⃣ Pagination check:', {
    hasGetCashFlowsPaginationInstance: typeof window.getCashFlowsPaginationInstance === 'function',
    paginationInstance: typeof window.getCashFlowsPaginationInstance === 'function' 
      ? window.getCashFlowsPaginationInstance() 
      : null,
    hasSetData: typeof window.getCashFlowsPaginationInstance === 'function' 
      ? typeof window.getCashFlowsPaginationInstance()?.setData === 'function'
      : false
  });
  
  // 9. Check data sources
  console.log('9️⃣ Data sources check:', {
    hasCashFlowsData: typeof window.cashFlowsData !== 'undefined',
    cashFlowsDataLength: Array.isArray(window.cashFlowsData) ? window.cashFlowsData.length : 'not array',
    hasAllCashFlowsData: typeof window.allCashFlowsData !== 'undefined',
    allCashFlowsDataLength: Array.isArray(window.allCashFlowsData) ? window.allCashFlowsData.length : 'not array',
    hasFilteredCashFlowsData: typeof window.filteredCashFlowsData !== 'undefined',
    filteredCashFlowsDataLength: Array.isArray(window.filteredCashFlowsData) ? window.filteredCashFlowsData.length : 'not array'
  });
  
  // 10. Manual test function
  window.testCashFlowFilter = function(type = 'deposit') {
    console.log('🧪 Testing filter with type:', type);
    if (typeof window.filterCashFlowsByType === 'function') {
      return window.filterCashFlowsByType(type).then(() => {
        console.log('✅ Filter test completed');
      }).catch(err => {
        console.error('❌ Filter test failed:', err);
      });
    } else {
      console.error('❌ filterCashFlowsByType function not found');
    }
  };
  
  console.log('✅ Debug script loaded. Use testCashFlowFilter("deposit") to test filter manually.');
  console.log('🔍 ===== End Debug =====');
})();

