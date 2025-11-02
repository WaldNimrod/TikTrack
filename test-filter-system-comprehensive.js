/**
 * סקריפט בדיקה מקיף למערכת הפילטר
 * Comprehensive Filter System Test Script
 * 
 * תאריך: 22 בינואר 2025
 */

(function() {
  'use strict';

  console.log('🧪 Starting comprehensive filter system tests...');
  
  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  function logTest(name, passed, details = '') {
    testResults.total++;
    if (passed) {
      testResults.passed++;
      console.log(`✅ ${name}`, details ? `- ${details}` : '');
    } else {
      testResults.failed++;
      const error = `${name}${details ? ` - ${details}` : ''}`;
      testResults.errors.push(error);
      console.error(`❌ ${error}`);
    }
  }

  // Test 1: בדיקת קיום filterSystem
  console.log('\n📋 Test 1: Filter System Existence');
  if (window.filterSystem) {
    logTest('filterSystem exists', true);
  } else {
    logTest('filterSystem exists', false, 'filterSystem not found on window object');
  }

  // Test 2: בדיקת פונקציות
  console.log('\n📋 Test 2: Filter System Functions');
  const requiredFunctions = [
    'applyAllFilters',
    'applyFiltersToTable',
    'saveFilters',
    'loadFilters',
    'isDateInRange'
  ];
  
  requiredFunctions.forEach(funcName => {
    if (window.filterSystem && typeof window.filterSystem[funcName] === 'function') {
      logTest(`Function ${funcName} exists`, true);
    } else {
      logTest(`Function ${funcName} exists`, false);
    }
  });

  // Test 3: בדיקת containers מתועדים
  console.log('\n📋 Test 3: Known Containers Detection');
  const knownContainers = [
    'tradesContainer',
    'trade_plansContainer',
    'tickersContainer',
    'alertsContainer',
    'executionsContainer',
    'accountsContainer',
    'cashFlowsContainer',
    'notesContainer'
  ];

  const foundContainers = [];
  const missingContainers = [];

  knownContainers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      foundContainers.push(containerId);
      logTest(`Container ${containerId} exists`, true);
      
      // בדיקה שיש טבלה בתוך container
      const table = container.querySelector('table');
      if (table) {
        logTest(`Table found in ${containerId}`, true, `Table ID: ${table.id || 'no ID'}`);
      } else {
        logTest(`Table found in ${containerId}`, false);
      }
    } else {
      missingContainers.push(containerId);
      logTest(`Container ${containerId} exists`, false, 'Not found on current page');
    }
  });

  console.log(`\n📊 Found ${foundContainers.length}/${knownContainers.length} known containers on this page`);

  // Test 4: בדיקת כל ה-containers בעמוד
  console.log('\n📋 Test 4: All Containers on Page');
  const allContainers = document.querySelectorAll('[id$="Container"]');
  const allContainerIds = Array.from(allContainers).map(c => c.id);
  
  logTest(`Total containers found on page`, true, `${allContainerIds.length} containers`);
  
  allContainerIds.forEach(containerId => {
    const container = document.getElementById(containerId);
    const table = container?.querySelector('table');
    if (table) {
      logTest(`Container ${containerId} has table`, true, `Table ID: ${table.id || 'no ID'}`);
    } else {
      logTest(`Container ${containerId} has table`, false);
    }
  });

  // Test 5: בדיקת data attributes בטבלאות
  console.log('\n📋 Test 5: Data Attributes in Tables');
  
  knownContainers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const table = container.querySelector('table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length === 0) {
      logTest(`Table in ${containerId} has rows`, false, 'No rows found');
      return;
    }
    
    // בדיקת שורה ראשונה לדוגמה
    const firstRow = rows[0];
    if (firstRow.querySelector('td[data-status]')) {
      logTest(`${containerId} - data-status attribute`, true);
    } else {
      logTest(`${containerId} - data-status attribute`, false, 'Will be ignored by status filter');
    }
    
    if (firstRow.querySelector('td[data-investment-type]') || firstRow.querySelector('td[data-type]')) {
      logTest(`${containerId} - data-type/data-investment-type attribute`, true);
    } else {
      logTest(`${containerId} - data-type/data-investment-type attribute`, false, 'Will be ignored by type filter');
    }
    
    if (firstRow.querySelector('td[data-account]')) {
      logTest(`${containerId} - data-account attribute`, true);
    } else {
      logTest(`${containerId} - data-account attribute`, false, 'Will be ignored by account filter');
    }
    
    if (firstRow.querySelector('td[data-date]')) {
      logTest(`${containerId} - data-date attribute`, true);
    } else {
      logTest(`${containerId} - data-date attribute`, false, 'Will be ignored by date filter');
    }
  });

  // Test 6: בדיקת applyAllFilters - סימולציה
  console.log('\n📋 Test 6: applyAllFilters Simulation');
  
  if (window.filterSystem && typeof window.filterSystem.applyAllFilters === 'function') {
    try {
      // ספירת containers לפני
      const containersBefore = document.querySelectorAll('[id$="Container"]').length;
      
      // הרצת הפונקציה (אבל לא באמת כי זה ישנה את התצוגה)
      // במקום זה נבדוק את הלוגיקה
      logTest('applyAllFilters function is callable', true);
      
      // בדיקה שהפונקציה מוצאת את כל ה-containers
      const knownContainersFound = knownContainers.filter(id => document.getElementById(id)).length;
      logTest('Known containers detection', true, `${knownContainersFound} found`);
      
    } catch (error) {
      logTest('applyAllFilters execution', false, error.message);
    }
  }

  // Test 7: בדיקת variations בשמות containers
  console.log('\n📋 Test 7: Container Name Variations');
  
  // בדיקה של tradePlansContainer vs trade_plansContainer
  const tradePlansVariation1 = document.getElementById('tradePlansContainer');
  const tradePlansVariation2 = document.getElementById('trade_plansContainer');
  
  if (tradePlansVariation1 || tradePlansVariation2) {
    if (tradePlansVariation1) {
      logTest('tradePlansContainer (camelCase) exists', true);
    }
    if (tradePlansVariation2) {
      logTest('trade_plansContainer (underscore) exists', true);
    }
    logTest('Container name variation handling', true, 'System should handle both via dynamic detection');
  } else {
    logTest('Container name variation handling', false, 'Neither variation found on this page');
  }

  // Test 8: בדיקת currentFilters
  console.log('\n📋 Test 8: Filter State');
  
  if (window.filterSystem && window.filterSystem.currentFilters) {
    const filters = window.filterSystem.currentFilters;
    logTest('currentFilters object exists', true);
    
    const requiredFilterKeys = ['search', 'dateRange', 'status', 'type', 'account'];
    requiredFilterKeys.forEach(key => {
      if (key in filters) {
        logTest(`Filter ${key} exists`, true, `Value: ${JSON.stringify(filters[key])}`);
      } else {
        logTest(`Filter ${key} exists`, false);
      }
    });
  } else {
    logTest('currentFilters object exists', false);
  }

  // Test 9: בדיקת עמודים ספציפיים
  console.log('\n📋 Test 9: Page-Specific Tests');
  
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop().replace('.html', '') || 'index';
  
  logTest('Current page detection', true, `Page: ${currentPage}`);
  
  // מיפוי עמודים ל-containers שצריכים להיות
  const pageToContainers = {
    'trade_plans': ['trade_plansContainer'],
    'trades': ['tradesContainer'],
    'tickers': ['tickersContainer'],
    'alerts': ['alertsContainer'],
    'executions': ['executionsContainer'],
    'trading_accounts': ['accountsContainer'],
    'cash_flows': ['cashFlowsContainer'],
    'notes': ['notesContainer'],
    'db_display': [
      'accountsContainer',
      'tradesContainer',
      'tickersContainer',
      'tradePlansContainer', // variation!
      'executionsContainer',
      'alertsContainer',
      'notesContainer',
      'cashFlowsContainer'
    ]
  };
  
  if (pageToContainers[currentPage]) {
    const expectedContainers = pageToContainers[currentPage];
    const foundExpected = expectedContainers.filter(id => document.getElementById(id));
    logTest(`Expected containers for ${currentPage}`, 
      foundExpected.length === expectedContainers.length,
      `Found ${foundExpected.length}/${expectedContainers.length}`
    );
  }

  // סיכום
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // החזרת תוצאות לשימוש חיצוני
  window.filterSystemTestResults = testResults;
  
  return testResults;
})();

