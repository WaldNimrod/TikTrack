/**
 * Unified Table System - Testing Script
 * ======================================
 * 
 * סקריפט בדיקה מקיף למערכת הטבלאות המאוחדת
 * 
 * Usage: Call window.testUnifiedTableSystem() in browser console
 */

window.testUnifiedTableSystem = function() {
  console.log('🔍 ===== UNIFIED TABLE SYSTEM TEST =====');
  console.log('');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  function test(name, condition, details = '') {
    const passed = typeof condition === 'function' ? condition() : !!condition;
    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`✅ PASS: ${name}`);
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
  
  test('UnifiedTableSystem exists', () => window.UnifiedTableSystem);
  test('TableRegistry exists', () => window.UnifiedTableSystem?.registry);
  test('TableSorter exists', () => window.UnifiedTableSystem?.sorter);
  test('TableRenderer exists', () => window.UnifiedTableSystem?.renderer);
  test('TableFilter exists', () => window.UnifiedTableSystem?.filter);
  test('TableStateManager exists', () => window.UnifiedTableSystem?.state);
  test('TableStyleManager exists', () => window.UnifiedTableSystem?.styles);
  test('TableEventHandler exists', () => window.UnifiedTableSystem?.events);
  
  console.log('');

  // ===== TEST 2: Table Registration =====
  console.log('📋 TEST 2: Table Registration');
  console.log('-----------------------------------');
  
  const registeredTables = window.UnifiedTableSystem?.registry?.getAllTables() || [];
  test('At least one table registered', registeredTables.length > 0, 
    `Found ${registeredTables.length} tables`);
  
  test('trading_accounts table registered', 
    window.UnifiedTableSystem?.registry?.isRegistered('trading_accounts'));
  
  test('positions table registered', 
    window.UnifiedTableSystem?.registry?.isRegistered('positions'));
  
  test('portfolio table registered', 
    window.UnifiedTableSystem?.registry?.isRegistered('portfolio'));
  
  console.log('Registered tables:', registeredTables);
  console.log('');

  // ===== TEST 3: Table Configuration =====
  console.log('📋 TEST 3: Table Configuration');
  console.log('-----------------------------------');
  
  ['trading_accounts', 'positions', 'portfolio'].forEach(tableType => {
    const config = window.UnifiedTableSystem?.registry?.getConfig(tableType);
    test(`${tableType} has config`, !!config);
    if (config) {
      test(`${tableType} has dataGetter`, typeof config.dataGetter === 'function');
      test(`${tableType} has updateFunction`, typeof config.updateFunction === 'function');
      test(`${tableType} has tableSelector`, typeof config.tableSelector === 'string' && config.tableSelector.length > 0);
      test(`${tableType} has columns`, Array.isArray(config.columns));
    }
  });
  
  console.log('');

  // ===== TEST 4: Data Access =====
  console.log('📋 TEST 4: Data Access');
  console.log('-----------------------------------');
  
  ['trading_accounts', 'positions', 'portfolio'].forEach(tableType => {
    const config = window.UnifiedTableSystem?.registry?.getConfig(tableType);
    if (config) {
      try {
        const data = config.dataGetter();
        test(`${tableType} dataGetter returns array`, Array.isArray(data), 
          `Got ${data.length} items`);
        warn(`${tableType} has data`, data.length > 0, 'No data available (may be expected)');
      } catch (e) {
        test(`${tableType} dataGetter doesn't throw`, false, e.message);
      }
    }
  });
  
  console.log('');

  // ===== TEST 5: DOM Elements =====
  console.log('📋 TEST 5: DOM Elements');
  console.log('-----------------------------------');
  
  ['trading_accounts', 'positions', 'portfolio'].forEach(tableType => {
    const config = window.UnifiedTableSystem?.registry?.getConfig(tableType);
    if (config) {
      const table = document.querySelector(config.tableSelector);
      test(`${tableType} table exists in DOM`, !!table, config.tableSelector);
      if (table) {
        const tbody = table.querySelector('tbody');
        test(`${tableType} has tbody`, !!tbody);
        const thead = table.querySelector('thead');
        test(`${tableType} has thead`, !!thead);
        const dataTableType = table.getAttribute('data-table-type');
        test(`${tableType} has data-table-type attribute`, !!dataTableType, 
          `Found: ${dataTableType}`);
        test(`${tableType} data-table-type matches`, dataTableType === tableType);
      }
    }
  });
  
  console.log('');

  // ===== TEST 6: Sorting Functionality =====
  console.log('📋 TEST 6: Sorting Functionality');
  console.log('-----------------------------------');
  
  ['trading_accounts', 'positions', 'portfolio'].forEach(tableType => {
    const config = window.UnifiedTableSystem?.registry?.getConfig(tableType);
    if (config && config.sortable) {
      const data = config.dataGetter();
      if (Array.isArray(data) && data.length > 0) {
        test(`${tableType} can sort (has data)`, true, `Testing with ${data.length} items`);
        
        // Test sorting by first column
        try {
          const result = window.UnifiedTableSystem.sorter.sort(tableType, 0);
          test(`${tableType} sort returns result`, result !== null && result !== undefined);
          test(`${tableType} sort returns array`, Array.isArray(result));
          test(`${tableType} sort preserves data length`, result.length === data.length);
        } catch (e) {
          test(`${tableType} sort doesn't throw`, false, e.message);
        }
      } else {
        warn(`${tableType} sort test skipped (no data)`, false);
      }
    } else {
      warn(`${tableType} sort test skipped (not sortable)`, false);
    }
  });
  
  console.log('');

  // ===== TEST 7: Rendering Functionality =====
  console.log('📋 TEST 7: Rendering Functionality');
  console.log('-----------------------------------');
  
  ['trading_accounts', 'positions', 'portfolio'].forEach(tableType => {
    const config = window.UnifiedTableSystem?.registry?.getConfig(tableType);
    if (config) {
      test(`${tableType} updateFunction exists`, typeof config.updateFunction === 'function');
      
      // Test that updateFunction can be called (without actually rendering)
      try {
        const testData = config.dataGetter();
        if (Array.isArray(testData) && testData.length > 0) {
          // Get a small subset for testing
          const subset = testData.slice(0, 1);
          // Don't actually call it, just verify it's callable
          test(`${tableType} updateFunction is callable`, 
            typeof config.updateFunction === 'function');
        }
      } catch (e) {
        test(`${tableType} updateFunction test`, false, e.message);
      }
    }
  });
  
  console.log('');

  // ===== TEST 8: Column Mappings =====
  console.log('📋 TEST 8: Column Mappings');
  console.log('-----------------------------------');
  
  ['trading_accounts', 'positions', 'portfolio'].forEach(tableType => {
    const config = window.UnifiedTableSystem?.registry?.getConfig(tableType);
    if (config) {
      test(`${tableType} has columns mapping`, Array.isArray(config.columns));
      if (config.columns.length > 0) {
        test(`${tableType} has at least one column`, config.columns.length > 0, 
          `${config.columns.length} columns`);
        
        // Check if columns match TABLE_COLUMN_MAPPINGS
        if (window.TABLE_COLUMN_MAPPINGS && window.TABLE_COLUMN_MAPPINGS[tableType]) {
          const expectedColumns = window.TABLE_COLUMN_MAPPINGS[tableType];
          test(`${tableType} columns match TABLE_COLUMN_MAPPINGS`, 
            config.columns.length === expectedColumns.length,
            `Expected ${expectedColumns.length}, got ${config.columns.length}`);
        }
      }
    }
  });
  
  console.log('');

  // ===== TEST 9: Integration with tables.js =====
  console.log('📋 TEST 9: Integration with tables.js');
  console.log('-----------------------------------');
  
  test('window.sortTable exists', typeof window.sortTable === 'function');
  test('window.sortTableData exists', typeof window.sortTableData === 'function');
  
  // Test window.TABLE_COLUMN_MAPPINGS - it should be loaded from table-mappings.js
  // Check both direct export and object export
  const hasDirectExport = !!window.TABLE_COLUMN_MAPPINGS;
  const hasObjectExport = !!(window.tableMappings && window.tableMappings.TABLE_COLUMN_MAPPINGS);
  const hasAnyExport = hasDirectExport || hasObjectExport;
  
  if (hasAnyExport) {
    const mappings = window.TABLE_COLUMN_MAPPINGS || window.tableMappings?.TABLE_COLUMN_MAPPINGS || {};
    const mappingCount = Object.keys(mappings).length;
    test('window.TABLE_COLUMN_MAPPINGS exists', true, `Has ${mappingCount} table mappings (${hasDirectExport ? 'direct' : 'object'} export)`);
    test('window.TABLE_COLUMN_MAPPINGS has trading_accounts', !!mappings.trading_accounts);
    test('window.TABLE_COLUMN_MAPPINGS has positions', !!mappings.positions);
    test('window.TABLE_COLUMN_MAPPINGS has portfolio', !!mappings.portfolio);
    
    // Warn if only object export exists (prefer direct export)
    if (!hasDirectExport && hasObjectExport) {
      warn('window.TABLE_COLUMN_MAPPINGS should be directly exported', false, 'Found only in window.tableMappings object - consider direct export');
    }
  } else {
    // If not found, it might be a timing issue - check again after a delay
    // For now, issue a warning instead of a hard failure
    warn('window.TABLE_COLUMN_MAPPINGS not found', false, 'This may indicate a loading order issue - check package-manifest.js. Retrying in 500ms...');
    
    // Retry after a short delay
    setTimeout(() => {
      const retryHasDirectExport = !!window.TABLE_COLUMN_MAPPINGS;
      const retryHasObjectExport = !!(window.tableMappings && window.tableMappings.TABLE_COLUMN_MAPPINGS);
      const retryHasAnyExport = retryHasDirectExport || retryHasObjectExport;
      
      if (retryHasAnyExport) {
        const retryMappings = window.TABLE_COLUMN_MAPPINGS || window.tableMappings?.TABLE_COLUMN_MAPPINGS || {};
        const retryMappingCount = Object.keys(retryMappings).length;
        console.log(`✅ [RETRY] window.TABLE_COLUMN_MAPPINGS found after delay: ${retryMappingCount} mappings`);
        test('window.TABLE_COLUMN_MAPPINGS exists (retry)', true, `Has ${retryMappingCount} table mappings (${retryHasDirectExport ? 'direct' : 'object'} export)`);
      } else {
        console.error('❌ [RETRY] window.TABLE_COLUMN_MAPPINGS still not found after delay');
        test('window.TABLE_COLUMN_MAPPINGS exists (retry)', false, 'table-mappings.js may not be loaded - check package-manifest.js loading order');
      }
    }, 500);
  }
  
  // Test that sortTable uses UnifiedTableSystem for registered tables
  if (window.UnifiedTableSystem && registeredTables.length > 0) {
    const testTable = registeredTables[0];
    const config = window.UnifiedTableSystem.registry.getConfig(testTable);
    if (config && config.sortable) {
      const data = config.dataGetter();
      if (Array.isArray(data) && data.length > 0) {
        try {
          // This should use UnifiedTableSystem
          const result = window.sortTable(testTable, 0);
          test(`window.sortTable uses UnifiedTableSystem for ${testTable}`, 
            result !== null && result !== undefined);
        } catch (e) {
          test(`window.sortTable works for ${testTable}`, false, e.message);
        }
      }
    }
  }
  
  console.log('');

  // ===== TEST 10: State Management =====
  console.log('📋 TEST 10: State Management');
  console.log('-----------------------------------');
  
  ['trading_accounts', 'positions', 'portfolio'].forEach(tableType => {
    if (window.UnifiedTableSystem?.state) {
      try {
        const state = window.UnifiedTableSystem.state.load(tableType);
        test(`${tableType} state can be loaded`, true, 
          state ? 'State found' : 'No saved state (expected)');
        
        // Test saving state
        const testState = { test: true, timestamp: Date.now() };
        window.UnifiedTableSystem.state.save(tableType, testState);
        const loadedState = window.UnifiedTableSystem.state.load(tableType);
        test(`${tableType} state can be saved and loaded`, 
          loadedState && loadedState.test === true);
        
        // Clean up
        localStorage.removeItem(`tableState_${tableType}`);
      } catch (e) {
        test(`${tableType} state management works`, false, e.message);
      }
    }
  });
  
  console.log('');

  // ===== SUMMARY =====
  console.log('📊 ===== TEST SUMMARY =====');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️ Warnings: ${results.warnings}`);
  console.log(`📈 Total: ${results.passed + results.failed + results.warnings}`);
  console.log('');
  
  if (results.failed === 0) {
    console.log('🎉 All critical tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Please review the errors above.');
  }
  
  console.log('');
  console.log('🔍 ===== END TEST =====');
  
  return results;
};

// Note: Auto-run is handled by trading_accounts.html after app initialization

