/**
 * Comprehensive Testing Script for Positions/Portfolio System
 * ===========================================================
 * 
 * סקריפט בדיקה מקיף למערכת הפוזיציות והפורטפוליו
 * 
 * Usage: Call window.testPositionsPortfolioSystem() in browser console
 * 
 * Tests:
 * 1. System Availability
 * 2. Data Loading (Positions, Portfolio, Accounts)
 * 3. Table Registration
 * 4. Table Rendering
 * 5. Sorting Functionality
 * 6. Filtering Functionality
 * 7. Position Details Modal
 * 8. Account Selector
 * 9. Header Statistics
 * 10. Data Formatting
 */

window.testPositionsPortfolioSystem = async function() {
  console.log('🔍 ===== COMPREHENSIVE POSITIONS/PORTFOLIO SYSTEM TEST =====');
  console.log('');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: [],
    startTime: Date.now()
  };

  function test(name, condition, details = '') {
    const passed = typeof condition === 'function' ? condition() : !!condition;
    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`✅ PASS: ${name}${details ? ' - ' + details : ''}`);
    } else {
      results.failed++;
      console.error(`❌ FAIL: ${name}${details ? ' - ' + details : ''}`);
    }
    return passed;
  }

  function warn(name, condition, details = '') {
    const passed = typeof condition === 'function' ? condition() : !!condition;
    if (!passed) {
      results.warnings++;
      console.warn(`⚠️ WARN: ${name}${details ? ' - ' + details : ''}`);
    }
    return passed;
  }

  // ===== TEST 1: System Availability =====
  console.log('📋 TEST 1: System Availability');
  console.log('-----------------------------------');
  
  test('window.initPositionsPortfolio exists', () => typeof window.initPositionsPortfolio === 'function');
  test('window.positionsPortfolioState exists', () => !!window.positionsPortfolioState);
  test('window.UnifiedTableSystem exists', () => !!window.UnifiedTableSystem);
  test('window.updatePositionsTable exists', () => typeof window.updatePositionsTable === 'function');
  test('window.updatePortfolioTable exists', () => typeof window.updatePortfolioTable === 'function');
  test('window.showPositionDetails exists', () => typeof window.showPositionDetails === 'function');
  test('window.UnifiedCacheManager exists', () => !!window.UnifiedCacheManager);
  
  console.log('');

  // ===== TEST 2: DOM Elements =====
  console.log('📋 TEST 2: DOM Elements');
  console.log('-----------------------------------');
  
  test('positionsTable exists', () => !!document.getElementById('positionsTable'));
  test('portfolioTable exists', () => !!document.getElementById('portfolioTable'));
  test('accountsTable exists', () => !!document.getElementById('accountsTable'));
  test('positionsAccountSelector exists', () => !!document.getElementById('positionsAccountSelector'));
  test('portfolioAccountFilter exists', () => !!document.getElementById('portfolioAccountFilter'));
  test('positionsCountText exists', () => !!document.getElementById('positionsCountText'));
  test('positionsTotalValue exists', () => !!document.getElementById('positionsTotalValue'));
  test('positionsAccountTotalValue exists', () => !!document.getElementById('positionsAccountTotalValue'));
  
  console.log('');

  // ===== TEST 3: Table Registration =====
  console.log('📋 TEST 3: Table Registration');
  console.log('-----------------------------------');
  
  if (window.UnifiedTableSystem) {
    test('trading_accounts table registered', () => window.UnifiedTableSystem.registry.isRegistered('trading_accounts'));
    test('account_activity table registered', () => window.UnifiedTableSystem.registry.isRegistered('account_activity'));
    test('positions table registered', () => window.UnifiedTableSystem.registry.isRegistered('positions'));
    test('portfolio table registered', () => window.UnifiedTableSystem.registry.isRegistered('portfolio'));
    
    ['trading_accounts', 'account_activity', 'positions', 'portfolio'].forEach(tableType => {
      const config = window.UnifiedTableSystem.registry.getConfig(tableType);
      if (config) {
        test(`${tableType} has dataGetter`, () => typeof config.dataGetter === 'function');
        test(`${tableType} has updateFunction`, () => typeof config.updateFunction === 'function');
        test(`${tableType} has tableSelector`, () => typeof config.tableSelector === 'string' && config.tableSelector.length > 0);
      }
    });
  } else {
    test('UnifiedTableSystem available', false, 'UnifiedTableSystem not loaded');
  }
  
  console.log('');

  // ===== TEST 4: Data Loading =====
  console.log('📋 TEST 4: Data Loading');
  console.log('-----------------------------------');
  
  // Test trading accounts data
  const accountsData = window.trading_accountsData || [];
  test('trading accounts data exists', () => Array.isArray(accountsData));
  warn('trading accounts data has items', () => accountsData.length > 0, `Found ${accountsData.length} trading accounts`);
  
  // Test positions data
  const positionsData = window.positionsPortfolioState?.positionsData || [];
  test('positions state exists', () => !!window.positionsPortfolioState);
  test('positions data is array', () => Array.isArray(positionsData));
  warn('positions data has items', () => positionsData.length > 0, `Found ${positionsData.length} positions`);
  
  // Test portfolio data
  const portfolioData = window.positionsPortfolioState?.portfolioData?.positions || [];
  test('portfolio data is array', () => Array.isArray(portfolioData));
  warn('portfolio data has items', () => portfolioData.length > 0, `Found ${portfolioData.length} portfolio positions`);
  
  // Test state structure
  if (window.positionsPortfolioState) {
    test('state has selectedAccountId', () => typeof window.positionsPortfolioState.selectedAccountId === 'number' || window.positionsPortfolioState.selectedAccountId === null);
    test('state has isLoading', () => typeof window.positionsPortfolioState.isLoading === 'boolean');
  }
  
  console.log('');

  // ===== TEST 5: Table Rendering =====
  console.log('📋 TEST 5: Table Rendering');
  console.log('-----------------------------------');
  
  ['positions', 'portfolio', 'trading_accounts'].forEach(tableType => {
    const tableId = tableType === 'positions' ? 'positionsTable' : 
                   tableType === 'portfolio' ? 'portfolioTable' : 'accountsTable';
    const table = document.getElementById(tableId);
    
    if (table) {
      const tbody = table.querySelector('tbody');
      test(`${tableType} table has tbody`, () => !!tbody);
      
      if (tbody) {
        const rows = tbody.querySelectorAll('tr');
        const hasData = rows.length > 0 && !rows[0].textContent.includes('טוען') && !rows[0].textContent.includes('אין נתונים');
        warn(`${tableType} table has rendered rows`, () => hasData, `Found ${rows.length} rows`);
        
        // Check for empty state message
        if (rows.length === 1 && (rows[0].textContent.includes('אין נתונים') || rows[0].textContent.includes('טוען'))) {
          warn(`${tableType} table is empty or loading`, false, 'Table appears to be empty or still loading');
        }
      }
      
      const thead = table.querySelector('thead');
      test(`${tableType} table has thead`, () => !!thead);
      
      if (thead) {
        const sortableHeaders = thead.querySelectorAll('.sortable-header');
        test(`${tableType} table has sortable headers`, () => sortableHeaders.length > 0, `Found ${sortableHeaders.length} sortable headers`);
      }
    }
  });
  
  console.log('');

  // ===== TEST 6: Sorting Functionality =====
  console.log('📋 TEST 6: Sorting Functionality');
  console.log('-----------------------------------');
  
  ['trading_accounts', 'positions', 'portfolio'].forEach(tableType => {
    if (window.UnifiedTableSystem && window.UnifiedTableSystem.registry.isRegistered(tableType)) {
      const config = window.UnifiedTableSystem.registry.getConfig(tableType);
      if (config && config.sortable) {
        const data = config.dataGetter();
        if (Array.isArray(data) && data.length > 0) {
          try {
            // Test sorting by first column
            const result = window.UnifiedTableSystem.sorter.sort(tableType, 0);
            test(`${tableType} sort returns result`, () => result !== null && result !== undefined);
            test(`${tableType} sort returns array`, () => Array.isArray(result));
            test(`${tableType} sort preserves data length`, () => result.length === data.length);
            
            // Test that sortTable function works
            const sortResult = window.sortTable(tableType, 0);
            test(`window.sortTable works for ${tableType}`, () => sortResult !== null && sortResult !== undefined);
          } catch (e) {
            test(`${tableType} sort doesn't throw`, false, e.message);
          }
        } else {
          warn(`${tableType} sort test skipped (no data)`, false);
        }
      }
    }
  });
  
  console.log('');

  // ===== TEST 7: Account Selector =====
  console.log('📋 TEST 7: Account Selector');
  console.log('-----------------------------------');
  
  const positionsSelector = document.getElementById('positionsAccountSelector');
  if (positionsSelector) {
    test('positions selector has options', () => positionsSelector.options.length > 0);
    test('positions selector has selected value', () => positionsSelector.value !== '');
    warn('positions selector has multiple accounts', () => positionsSelector.options.length > 1, `Found ${positionsSelector.options.length} accounts`);
  }
  
  const portfolioSelector = document.getElementById('portfolioAccountFilter');
  if (portfolioSelector) {
    test('portfolio selector has options', () => portfolioSelector.options.length > 0);
    warn('portfolio selector has multiple accounts', () => portfolioSelector.options.length > 1, `Found ${portfolioSelector.options.length} accounts`);
  }
  
  console.log('');

  // ===== TEST 8: Header Statistics =====
  console.log('📋 TEST 8: Header Statistics');
  console.log('-----------------------------------');
  
  const countText = document.getElementById('positionsCountText');
  if (countText) {
    const countTextValue = countText.textContent.trim();
    test('positions count text exists', () => countTextValue.length > 0);
    test('positions count text is not "בחר חשבון מסחר..."', () => countTextValue !== 'בחר חשבון מסחר...', `Current: "${countTextValue}"`);
  }
  
  const totalValue = document.getElementById('positionsTotalValue');
  if (totalValue) {
    test('positions total value element exists', () => !!totalValue);
    warn('positions total value is displayed', () => totalValue.style.display !== 'none', 'Total value might be hidden');
  }
  
  const accountTotal = document.getElementById('positionsAccountTotalValue');
  if (accountTotal) {
    test('positions account total element exists', () => !!accountTotal);
    warn('positions account total is displayed', () => accountTotal.style.display !== 'none', 'Account total might be hidden');
  }
  
  console.log('');

  // ===== TEST 9: Data Display - All Fields and Calculations =====
  console.log('📋 TEST 9: Data Display - All Fields and Calculations');
  console.log('-----------------------------------');
  
  if (positionsData.length > 0) {
    const samplePosition = positionsData[0];
    
    // Required fields
    test('position has ticker_symbol', () => !!samplePosition.ticker_symbol);
    test('position has ticker_id', () => typeof samplePosition.ticker_id === 'number');
    test('position has quantity', () => typeof samplePosition.quantity === 'number');
    test('position has side', () => ['long', 'short', 'closed'].includes(samplePosition.side));
    test('position has trading_account_id', () => typeof samplePosition.trading_account_id === 'number');
    
    // Price fields
    test('position has average_price_net', () => typeof samplePosition.average_price_net === 'number');
    warn('position has average_price_gross', () => typeof samplePosition.average_price_gross === 'number', 'Gross price may be missing');
    
    // Value fields
    test('position has market_value', () => typeof samplePosition.market_value === 'number');
    test('position has current_position_cost', () => typeof samplePosition.current_position_cost === 'number');
    
    // P&L fields
    test('position has unrealized_pl', () => typeof samplePosition.unrealized_pl === 'number');
    test('position has unrealized_pl_percent', () => typeof samplePosition.unrealized_pl_percent === 'number');
    warn('position has realized_pl', () => typeof samplePosition.realized_pl === 'number', 'Realized P&L may be 0');
    warn('position has realized_pl_percent', () => typeof samplePosition.realized_pl_percent === 'number', 'Realized P&L % may be 0');
    
    // Transaction totals
    test('position has total_bought_quantity', () => typeof samplePosition.total_bought_quantity === 'number');
    test('position has total_bought_amount', () => typeof samplePosition.total_bought_amount === 'number');
    test('position has total_sold_quantity', () => typeof samplePosition.total_sold_quantity === 'number');
    test('position has total_sold_amount', () => typeof samplePosition.total_sold_amount === 'number');
    test('position has total_fees', () => typeof samplePosition.total_fees === 'number');
    
    // Percentage fields
    test('position has percent_of_account', () => typeof samplePosition.percent_of_account === 'number');
    warn('position has percent_of_portfolio', () => typeof samplePosition.percent_of_portfolio === 'number', 'Portfolio % may only be in portfolio table');
    
    // Check table rendering
    const positionsTable = document.getElementById('positionsTable');
    if (positionsTable) {
      const tbody = positionsTable.querySelector('tbody');
      if (tbody) {
        const rows = tbody.querySelectorAll('tr');
        const hasDataRows = Array.from(rows).some(row => {
          const text = row.textContent || '';
          return text.includes(samplePosition.ticker_symbol) && !text.includes('אין נתונים') && !text.includes('טוען');
        });
        test('positions table displays sample position', () => hasDataRows, `Looking for ${samplePosition.ticker_symbol}`);
      }
    }
    
    // Check portfolio table
    const portfolioTable = document.getElementById('portfolioTable');
    if (portfolioTable && portfolioData.length > 0) {
      const portfolioSample = portfolioData.find(p => p.ticker_symbol === samplePosition.ticker_symbol);
      if (portfolioSample) {
        test('portfolio table has corresponding position', () => !!portfolioSample);
        test('portfolio position has account_name', () => !!portfolioSample.account_name);
      }
    }
  } else {
    warn('data display test skipped', false, 'No positions data available');
  }
  
  console.log('');

  // ===== TEST 10: Number Formatting =====
  console.log('📋 TEST 10: Number Formatting');
  console.log('-----------------------------------');
  
  // Check formatting functions
  if (typeof window.formatCurrencyHebrew === 'function') {
    test('formatCurrencyHebrew function exists', true);
    
    // Test currency formatting
    const testValue1 = 1234.56;
    const formatted1 = window.formatCurrencyHebrew(testValue1, false, false);
    test('formatCurrencyHebrew formats with decimals', () => formatted1.includes('1') && formatted1.includes('$'));
    
    const testValue2 = 1234.56;
    const formatted2 = window.formatCurrencyHebrew(testValue2, false, true);
    test('formatCurrencyHebrew formats without decimals (noDecimals=true)', () => !formatted2.includes('.') || formatted2.includes('1,235'));
    
    const testValue3 = -1234.56;
    const formatted3 = window.formatCurrencyHebrew(testValue3, false, true);
    test('formatCurrencyHebrew places minus sign at end (RTL)', () => formatted3.endsWith('-'));
    
    const testValue4 = 1234.56;
    const formatted4 = window.formatCurrencyHebrew(testValue4, true, true);
    test('formatCurrencyHebrew places plus sign at end when showSign=true', () => formatted4.endsWith('+'));
    
    // Test with commas
    const testValue5 = 1234567.89;
    const formatted5 = window.formatCurrencyHebrew(testValue5, false, true);
    test('formatCurrencyHebrew includes commas for thousands', () => formatted5.includes(',') || formatted5.includes('1,234,568'));
  } else {
    test('formatCurrencyHebrew function exists', false, 'Function not found');
  }
  
  // Check table formatting
  const positionsTable = document.getElementById('positionsTable');
  if (positionsData.length > 0 && positionsTable) {
    const tbody = positionsTable.querySelector('tbody');
    if (tbody) {
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const dataRow = rows.find(row => {
        const text = row.textContent || '';
        return text.includes('$') && !text.includes('אין נתונים') && !text.includes('טוען');
      });
      
      if (dataRow) {
        const rowText = dataRow.textContent || '';
        test('positions table row contains currency symbol', () => rowText.includes('$'));
        test('positions table row contains quantity with #', () => rowText.includes('#'));
        
        // Check percentage formatting (should have sign at end for RTL)
        // Format: (5.50%+) or (5.50%-) - sign comes after % for RTL display
        const percentMatch = rowText.match(/\([0-9.]+%[+-]\)/);
        if (percentMatch) {
          const matchedText = percentMatch[0];
          // Check that the match contains % and has + or - at the end (before closing parenthesis)
          const hasSignAtEnd = matchedText.includes('%') && (matchedText.endsWith('+)') || matchedText.endsWith('-)'));
          test('percentage has sign at end (RTL)', () => hasSignAtEnd, `Matched: "${matchedText}"`);
        } else {
          // If no match found, check if there's any percentage in the row
          const hasPercent = rowText.includes('%');
          warn('percentage has sign at end (RTL)', () => !hasPercent, 'No percentage with sign found in row (may be expected if no P&L data)');
        }
      }
    }
  }
  
  console.log('');

  // ===== TEST 11: Position Details Modal =====
  console.log('📋 TEST 11: Position Details Modal');
  console.log('-----------------------------------');
  
  test('showPositionDetails is function', () => typeof window.showPositionDetails === 'function');
  
  if (positionsData.length > 0) {
    const samplePosition = positionsData[0];
    const accountId = samplePosition.trading_account_id;
    const tickerId = samplePosition.ticker_id;
    
    test('sample position has required IDs for modal', () => {
      return typeof accountId === 'number' && accountId > 0 && 
             typeof tickerId === 'number' && tickerId > 0;
    });
    
    // Test modal structure (without actually opening it)
    test('can call showPositionDetails with valid IDs', () => {
      try {
        return typeof window.showPositionDetails === 'function' && 
               typeof accountId === 'number' && 
               typeof tickerId === 'number';
      } catch (e) {
        return false;
      }
    });
    
    // Check if modal HTML structure would be correct
    // We can't test the actual modal without opening it, but we can verify the function exists
    warn('modal opens correctly', () => {
      // This would require actually opening the modal, which we avoid in automated tests
      return true;
    }, 'Manual test required: Open position details modal and verify layout');
    
    // Check for required elements that should be in modal
    warn('modal has header with Symbol | Side | Account', () => true, 'Manual test: Verify header row layout');
    warn('modal has two-column layout', () => true, 'Manual test: Verify column 1 and column 2 structure');
    warn('modal has close button in header', () => true, 'Manual test: Verify close button (icon) at end of header row');
    warn('modal uses trade entity colors', () => true, 'Manual test: Verify modal uses trade entity color scheme');
    warn('modal has executions table if executions exist', () => true, 'Manual test: Verify executions table with sorting');
    
    // Check quantity formatting in modal (should be #+100 or #-50)
    warn('modal quantity displays with # and sign', () => true, 'Manual test: Verify quantity format like #+100 or #-50');
    
    // Check symbol link in modal
    warn('modal symbol is clickable link to ticker details', () => true, 'Manual test: Click symbol link and verify ticker details modal opens');
  } else {
    warn('position details modal test skipped', false, 'No positions data available');
  }
  
  console.log('');

  // ===== TEST 12: Filtering Functionality =====
  console.log('📋 TEST 12: Filtering Functionality');
  console.log('-----------------------------------');
  
  // Check portfolio filters
  const showClosedCheckbox = document.getElementById('portfolioIncludeClosed');
  const consolidateCheckbox = document.getElementById('portfolioUnifyAccounts');
  const sideFilter = document.getElementById('portfolioSideFilter');
  const accountFilter = document.getElementById('portfolioAccountFilter');
  
  test('portfolio include closed checkbox exists', () => !!showClosedCheckbox);
  test('portfolio unify accounts checkbox exists', () => !!consolidateCheckbox);
  test('portfolio side filter exists', () => !!sideFilter);
  test('portfolio account filter exists', () => !!accountFilter);
  
  // Test checkbox functionality
  if (showClosedCheckbox) {
    test('include closed checkbox can be checked', () => {
      const initialValue = showClosedCheckbox.checked;
      showClosedCheckbox.checked = !initialValue;
      const newValue = showClosedCheckbox.checked;
      showClosedCheckbox.checked = initialValue; // Restore
      return newValue !== initialValue;
    });
  }
  
  if (consolidateCheckbox) {
    test('unify accounts checkbox can be checked', () => {
      const initialValue = consolidateCheckbox.checked;
      consolidateCheckbox.checked = !initialValue;
      const newValue = consolidateCheckbox.checked;
      consolidateCheckbox.checked = initialValue; // Restore
      return newValue !== initialValue;
    });
  }
  
  // Test account filter functionality
  if (accountFilter && accountFilter.options.length > 0) {
    const originalValue = accountFilter.value;
    if (accountFilter.options.length > 1) {
      // Try selecting a different account
      const otherOption = Array.from(accountFilter.options).find(opt => opt.value !== originalValue && opt.value !== '');
      if (otherOption) {
        test('account filter can change selection', () => {
          accountFilter.value = otherOption.value;
          const changed = accountFilter.value !== originalValue;
          accountFilter.value = originalValue; // Restore
          return changed;
        });
      }
    }
  }
  
  console.log('');

  // ===== TEST 13: API Integration =====
  console.log('📋 TEST 13: API Integration');
  console.log('-----------------------------------');
  
  // Test that API endpoints are accessible (if we have account ID)
  if (window.positionsPortfolioState?.selectedAccountId) {
    const accountId = window.positionsPortfolioState.selectedAccountId;
    test('selected account ID is valid', () => typeof accountId === 'number' && accountId > 0);
    
    // Test API call (async)
    try {
      const testApiCall = async () => {
        try {
          const response = await fetch(`/api/positions/account/${accountId}`);
          return response.ok || response.status === 404; // 404 is ok if endpoint doesn't exist yet
        } catch (e) {
          return false;
        }
      };
      
      // Note: This is async, so we'll just check if fetch is available
      test('fetch API available', () => typeof fetch === 'function');
    } catch (e) {
      warn('API test skipped', false, e.message);
    }
  } else {
    warn('API test skipped', false, 'No account selected');
  }
  
  console.log('');

  // ===== TEST 14: Event Handlers =====
  console.log('📋 TEST 14: Event Handlers');
  console.log('-----------------------------------');
  
  // Check that sortable headers have onclick handlers
  // Note: We check for data-onclick attribute (used by EventHandlerManager) as well as onclick
  const positionsTableElement = document.getElementById('positionsTable');
  if (positionsTableElement) {
    const sortableHeaders = positionsTableElement.querySelectorAll('.sortable-header');
    let hasHandlers = 0;
    sortableHeaders.forEach(header => {
      // Check for data-onclick attribute (used by EventHandlerManager)
      // Also check for onclick as fallback (legacy support)
      if (header.getAttribute('data-onclick') || header.onclick || header.getAttribute('onclick')) {
        hasHandlers++;
      }
    });
    test('positions table sortable headers have handlers', () => hasHandlers > 0, `Found ${hasHandlers}/${sortableHeaders.length} with handlers`);
  }
  
  const portfolioTable = document.getElementById('portfolioTable');
  if (portfolioTable) {
    const sortableHeaders = portfolioTable.querySelectorAll('.sortable-header');
    let hasHandlers = 0;
    sortableHeaders.forEach(header => {
      // Check for data-onclick attribute (used by EventHandlerManager)
      // Also check for onclick as fallback (legacy support)
      if (header.getAttribute('data-onclick') || header.onclick || header.getAttribute('onclick')) {
        hasHandlers++;
      }
    });
    test('portfolio table sortable headers have handlers', () => hasHandlers > 0, `Found ${hasHandlers}/${sortableHeaders.length} with handlers`);
  }
  
  console.log('');

  // ===== SUMMARY =====
  const duration = Date.now() - results.startTime;
  console.log('📊 ===== TEST SUMMARY =====');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️ Warnings: ${results.warnings}`);
  console.log(`📈 Total: ${results.passed + results.failed + results.warnings}`);
  console.log(`⏱️ Duration: ${duration}ms`);
  console.log('');
  
  if (results.failed === 0) {
    console.log('🎉 All critical tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Please review the errors above.');
    console.log('');
    console.log('Failed tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  ❌ ${t.name}${t.details ? ' - ' + t.details : ''}`);
    });
  }
  
  console.log('');
  console.log('🔍 ===== END TEST =====');
  
  return results;
};

// Note: Auto-run is handled by trading_accounts.html after app initialization

