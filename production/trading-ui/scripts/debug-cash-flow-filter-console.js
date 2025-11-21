/**
 * Cash Flow Filter Debug - Console Version
 * 
 * USAGE: Copy and paste this entire code block into the browser console on the cash_flows page
 * 
 * Or run: copy(await fetch('/scripts/debug-cash-flow-filter-console.js').then(r => r.text()))
 * Then paste in console
 */

(function() {
console.log('🔍 ===== Cash Flow Filter Debug =====');

// 1. Check if select element exists
const select = document.getElementById('cashFlowTypeFilter');
console.log('1️⃣ Select element check:', {
  exists: !!select,
  id: select?.id,
  value: select?.value,
  options: select ? Array.from(select.options).map(opt => ({ value: opt.value, text: opt.text })) : null,
  hasDataFilterChange: select?.hasAttribute('data-filter-change'),
  dataFilterChangeValue: select?.getAttribute('data-filter-change')
});

// 2. Check EventHandlerManager
console.log('2️⃣ EventHandlerManager check:', {
  exists: !!window.EventHandlerManager,
  initialized: window.EventHandlerManager?.initialized,
  hasHandleFilterChange: typeof window.EventHandlerManager?.handleFilterChange === 'function',
  hasHandleDelegatedChange: typeof window.EventHandlerManager?.handleDelegatedChange === 'function'
});

// 3. Check filterCashFlowsByType function
console.log('3️⃣ Filter function check:', {
  exists: typeof window.filterCashFlowsByType === 'function',
  type: typeof window.filterCashFlowsByType
});

// 4. Check activeCashFlowTypeFilter (might be in cash_flows.js scope)
console.log('4️⃣ Active filter state:', {
  // Try to access from window or check if it's defined
  note: 'activeCashFlowTypeFilter might be in cash_flows.js local scope'
});

// 5. Check pagination instance
const getPaginationInstance = typeof window.getCashFlowsPaginationInstance === 'function' 
  ? window.getCashFlowsPaginationInstance() 
  : null;
console.log('5️⃣ Pagination check:', {
  hasGetCashFlowsPaginationInstance: typeof window.getCashFlowsPaginationInstance === 'function',
  paginationInstance: getPaginationInstance,
  hasSetData: getPaginationInstance ? typeof getPaginationInstance.setData === 'function' : false
});

// 6. Check data sources
console.log('6️⃣ Data sources check:', {
  hasCashFlowsData: typeof window.cashFlowsData !== 'undefined',
  cashFlowsDataLength: Array.isArray(window.cashFlowsData) ? window.cashFlowsData.length : 'not array',
  hasAllCashFlowsData: typeof window.allCashFlowsData !== 'undefined',
  allCashFlowsDataLength: Array.isArray(window.allCashFlowsData) ? window.allCashFlowsData.length : 'not array',
  hasFilteredCashFlowsData: typeof window.filteredCashFlowsData !== 'undefined',
  filteredCashFlowsDataLength: Array.isArray(window.filteredCashFlowsData) ? window.filteredCashFlowsData.length : 'not array'
});

// 7. Test manual change event with logging
if (select) {
  console.log('7️⃣ Testing manual change event...');
  
  // Set up a temporary listener to see if events are being caught
  const testListener = function(e) {
    console.log('   🎯 Change event caught by listener!', {
      value: e.target.value,
      type: e.type,
      bubbles: e.bubbles
    });
  };
  select.addEventListener('change', testListener, { once: true });
  
  const testEvent = new Event('change', { bubbles: true, cancelable: true });
  select.dispatchEvent(testEvent);
  console.log('   ✅ Change event dispatched');
  
  // Check if EventHandlerManager would catch it
  setTimeout(() => {
    console.log('   📊 After event dispatch - check console for EventHandlerManager logs');
  }, 100);
}

// 8. Check for event listeners (limited - can't directly access)
console.log('8️⃣ Event listeners:', {
  note: 'Cannot directly access event listeners, but we can test if change event works',
  selectElement: select ? 'exists' : 'not found'
});

// 9. Manual test function
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

// 10. Test direct change with full logging
window.testDirectChange = function() {
  if (!select) {
    console.error('❌ Select element not found');
    return;
  }
  console.log('🧪 Testing direct change event...');
  const oldValue = select.value;
  select.value = select.value === 'all' ? 'deposit' : 'all';
  console.log('   Changed value from', oldValue, 'to', select.value);
  
  // Listen for the change event
  const changeListener = function(e) {
    console.log('   🎯 Change event fired!', {
      target: e.target.id,
      value: e.target.value,
      hasDataFilterChange: e.target.hasAttribute('data-filter-change')
    });
  };
  select.addEventListener('change', changeListener, { once: true });
  
  const event = new Event('change', { bubbles: true, cancelable: true });
  select.dispatchEvent(event);
  console.log('✅ Direct change event dispatched, new value:', select.value);
  console.log('   📊 Check console for EventHandlerManager logs about filterChange:cashFlowType');
};

// 11. Check if setupCashFlowTypeFilterDropdown was called
console.log('9️⃣ Setup function check:', {
  hasSetupFunction: typeof window.setupCashFlowTypeFilterDropdown === 'function',
  note: 'setupCashFlowTypeFilterDropdown might be in cash_flows.js local scope'
});

// 12. Try to manually call setup if needed
if (select && !select.hasAttribute('data-filter-change')) {
  console.log('⚠️ data-filter-change missing! Attempting to fix...');
  if (typeof window.setupCashFlowTypeFilterDropdown === 'function') {
    window.setupCashFlowTypeFilterDropdown();
    console.log('✅ setupCashFlowTypeFilterDropdown called manually');
    console.log('   Now has data-filter-change:', select.hasAttribute('data-filter-change'));
  } else {
    console.log('❌ setupCashFlowTypeFilterDropdown not available in window scope');
    // Try to add it manually
    select.setAttribute('data-filter-change', 'cashFlowType');
    console.log('✅ Added data-filter-change manually');
  }
}

// 13. Monitor for filter events
const originalConsoleLog = console.log;
let filterEventCaught = false;
const eventMonitor = function(eventName) {
  const originalAddEventListener = document.addEventListener;
  document.addEventListener = function(type, listener, options) {
    if (type === 'filterChange:cashFlowType') {
      console.log('   🎯 Found filterChange:cashFlowType listener registered!');
      filterEventCaught = true;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
};
// Note: This is just for info, actual monitoring happens in the test functions

console.log('✅ Debug complete!');
console.log('📝 Available test functions:');
console.log('   - testCashFlowFilter("deposit") - Test filter with specific type');
console.log('   - testDirectChange() - Test direct change event (triggers real change)');
console.log('');
console.log('💡 TIP: Change the dropdown manually and watch for these logs:');
console.log('   - 🔔 Filter change event received from EventHandlerManager');
console.log('   - 🔍 filterCashFlowsByType called');
console.log('🔍 ===== End Debug =====');
})();

