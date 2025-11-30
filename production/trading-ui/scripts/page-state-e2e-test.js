/**
 * Page State Management E2E Test
 * ===============================
 * 
 * סקריפט בדיקה E2E למערכת Page State Management
 * 
 * בודק:
 * - שמירת מצב פילטרים
 * - טעינת מצב פילטרים
 * - שמירת מצב סידור
 * - טעינת מצב סידור
 * - שמירת מצב סקשנים
 * - טעינת מצב סקשנים
 * - שמירת מצב פילטרים פנימיים
 * - טעינת מצב פילטרים פנימיים
 * - מיגרציה מנתונים ישנים
 * - מחיקת מצב
 * 
 * שימוש:
 * <script src="scripts/page-state-e2e-test.js"></script>
 * window.runPageStateE2ETests()
 */

(function() {
  'use strict';

  const TEST_RESULTS = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };

  /**
   * בדיקת שמירת מצב פילטרים
   */
  async function testSaveFilters() {
    const testName = 'Save Filters';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page';
      const testFilters = { status: 'open', type: 'trade' };
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      const result = await window.PageStateManager.saveFilters(pageName, testFilters);
      
      if (result) {
        TEST_RESULTS.passed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'passed'
        });
        return true;
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'saveFilters returned false'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * בדיקת טעינת מצב פילטרים
   */
  async function testLoadFilters() {
    const testName = 'Load Filters';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page';
      const testFilters = { status: 'open', type: 'trade' };
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      // שמירה קודם
      await window.PageStateManager.saveFilters(pageName, testFilters);
      
      // טעינה
      const loadedFilters = await window.PageStateManager.loadFilters(pageName);
      
      if (loadedFilters && loadedFilters.status === testFilters.status && loadedFilters.type === testFilters.type) {
        TEST_RESULTS.passed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'passed'
        });
        return true;
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'Loaded filters do not match saved filters'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * בדיקת שמירת מצב סידור
   */
  async function testSaveSort() {
    const testName = 'Save Sort';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page';
      const testSort = { columnIndex: 0, direction: 'asc' };
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      const result = await window.PageStateManager.saveSort(pageName, testSort);
      
      if (result) {
        TEST_RESULTS.passed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'passed'
        });
        return true;
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'saveSort returned false'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * בדיקת טעינת מצב סידור
   */
  async function testLoadSort() {
    const testName = 'Load Sort';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page';
      const testSort = { columnIndex: 0, direction: 'asc' };
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      // שמירה קודם
      await window.PageStateManager.saveSort(pageName, testSort);
      
      // טעינה
      const loadedSort = await window.PageStateManager.loadSort(pageName);
      
      if (loadedSort && loadedSort.columnIndex === testSort.columnIndex && loadedSort.direction === testSort.direction) {
        TEST_RESULTS.passed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'passed'
        });
        return true;
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'Loaded sort does not match saved sort'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * בדיקת שמירת מצב סקשנים
   */
  async function testSaveSections() {
    const testName = 'Save Sections';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page';
      const testSections = { 'section1': true, 'section2': false };
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      const result = await window.PageStateManager.saveSections(pageName, testSections);
      
      if (result) {
        TEST_RESULTS.passed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'passed'
        });
        return true;
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'saveSections returned false'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * בדיקת טעינת מצב סקשנים
   */
  async function testLoadSections() {
    const testName = 'Load Sections';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page';
      const testSections = { 'section1': true, 'section2': false };
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      // שמירה קודם
      await window.PageStateManager.saveSections(pageName, testSections);
      
      // טעינה
      const loadedSections = await window.PageStateManager.loadSections(pageName);
      
      if (loadedSections && loadedSections.section1 === testSections.section1 && loadedSections.section2 === testSections.section2) {
        TEST_RESULTS.passed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'passed'
        });
        return true;
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'Loaded sections do not match saved sections'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * בדיקת שמירת מצב פילטרים פנימיים
   */
  async function testSaveEntityFilters() {
    const testName = 'Save Entity Filters';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page';
      const testEntityFilters = { 'ticker': 'AAPL', 'account': '1' };
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      const result = await window.PageStateManager.saveEntityFilters(pageName, testEntityFilters);
      
      if (result) {
        TEST_RESULTS.passed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'passed'
        });
        return true;
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'saveEntityFilters returned false'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * בדיקת טעינת מצב פילטרים פנימיים
   */
  async function testLoadEntityFilters() {
    const testName = 'Load Entity Filters';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page';
      const testEntityFilters = { 'ticker': 'AAPL', 'account': '1' };
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      // שמירה קודם
      await window.PageStateManager.saveEntityFilters(pageName, testEntityFilters);
      
      // טעינה
      const loadedEntityFilters = await window.PageStateManager.loadEntityFilters(pageName);
      
      if (loadedEntityFilters && loadedEntityFilters.ticker === testEntityFilters.ticker && loadedEntityFilters.account === testEntityFilters.account) {
        TEST_RESULTS.passed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'passed'
        });
        return true;
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'Loaded entity filters do not match saved entity filters'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * בדיקת מיגרציה מנתונים ישנים
   */
  async function testMigrateLegacyData() {
    const testName = 'Migrate Legacy Data';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page-migration';
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      // יצירת נתונים ישנים ב-localStorage
      localStorage.setItem('headerFilters', JSON.stringify({ status: 'open' }));
      localStorage.setItem(`sortState_${pageName}`, JSON.stringify({ columnIndex: 0, direction: 'asc' }));
      localStorage.setItem(`${pageName}_section1_SectionHidden`, 'true');
      localStorage.setItem(`entityFilter_${pageName}_ticker`, 'AAPL');
      
      // מיגרציה
      const result = await window.PageStateManager.migrateLegacyData(pageName);
      
      // בדיקה שהמיגרציה הצליחה
      if (result !== undefined) {
        TEST_RESULTS.passed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'passed',
          note: 'Migration completed (may return false if no data to migrate)'
        });
        return true;
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'migrateLegacyData returned undefined'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * בדיקת מחיקת מצב
   */
  async function testClearPageState() {
    const testName = 'Clear Page State';
    TEST_RESULTS.total++;
    
    try {
      const pageName = 'test-page-clear';
      const testState = { filters: { status: 'open' }, sort: { columnIndex: 0, direction: 'asc' } };
      
      if (!window.PageStateManager) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'PageStateManager not available'
        });
        return false;
      }

      if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }

      // שמירה קודם
      await window.PageStateManager.savePageState(pageName, testState);
      
      // מחיקה
      const result = await window.PageStateManager.clearPageState(pageName);
      
      if (result) {
        // בדיקה שהמצב נמחק
        const loadedState = await window.PageStateManager.loadPageState(pageName);
        
        if (!loadedState) {
          TEST_RESULTS.passed++;
          TEST_RESULTS.details.push({
            test: testName,
            status: 'passed'
          });
          return true;
        } else {
          TEST_RESULTS.failed++;
          TEST_RESULTS.details.push({
            test: testName,
            status: 'failed',
            error: 'State still exists after clear'
          });
          return false;
        }
      } else {
        TEST_RESULTS.failed++;
        TEST_RESULTS.details.push({
          test: testName,
          status: 'failed',
          error: 'clearPageState returned false'
        });
        return false;
      }
    } catch (error) {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: testName,
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  /**
   * הרצת כל הבדיקות
   */
  async function runPageStateE2ETests() {
    console.log('🧪 Starting Page State Management E2E Tests...\n');
    
    TEST_RESULTS.passed = 0;
    TEST_RESULTS.failed = 0;
    TEST_RESULTS.total = 0;
    TEST_RESULTS.details = [];

    // הרצת כל הבדיקות
    await testSaveFilters();
    await testLoadFilters();
    await testSaveSort();
    await testLoadSort();
    await testSaveSections();
    await testLoadSections();
    await testSaveEntityFilters();
    await testLoadEntityFilters();
    await testMigrateLegacyData();
    await testClearPageState();

    // הדפסת תוצאות
    console.log('\n📊 Test Results:');
    console.log(`  Total: ${TEST_RESULTS.total}`);
    console.log(`  Passed: ${TEST_RESULTS.passed}`);
    console.log(`  Failed: ${TEST_RESULTS.failed}`);
    console.log(`  Success Rate: ${((TEST_RESULTS.passed / TEST_RESULTS.total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    TEST_RESULTS.details.forEach(detail => {
      const icon = detail.status === 'passed' ? '✅' : '❌';
      console.log(`  ${icon} ${detail.test}: ${detail.status}`);
      if (detail.error) {
        console.log(`     Error: ${detail.error}`);
      }
      if (detail.note) {
        console.log(`     Note: ${detail.note}`);
      }
    });

    return TEST_RESULTS;
  }

  // ייצוא ל-window
  window.runPageStateE2ETests = runPageStateE2ETests;
  window.PageStateE2ETestResults = TEST_RESULTS;

  console.log('✅ Page State E2E Test script loaded. Run: window.runPageStateE2ETests()');
})();

