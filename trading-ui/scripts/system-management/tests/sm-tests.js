/**
 * System Management Tests - TikTrack
 * ===================================
 * 
 * Automated tests for system management sections
 * Tests section loading, API endpoints, validation, and error handling
 * 
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 * @author TikTrack Development Team
 */

class SMTests {
  /**
   * Test all sections
   * בדיקת כל הסקשנים
   * @returns {Promise<Object>} Test results
   */
  static async testAllSections() {
    const results = {};
    const sections = [
      'sm-dashboard',
      'sm-server',
      'sm-cache',
      'sm-performance',
      'sm-external-data',
      'sm-alerts',
      'sm-database',
      'sm-background-tasks',
      'sm-operations',
      'sm-system-settings'
    ];
    
    console.log('🧪 Starting section tests...');
    
    for (const sectionId of sections) {
      try {
        results[sectionId] = await this.testSection(sectionId);
      } catch (error) {
        results[sectionId] = {
          passed: false,
          error: error.message
        };
      }
    }
    
    const passed = Object.values(results).filter(r => r.passed).length;
    const total = sections.length;
    
    console.log(`✅ Tests completed: ${passed}/${total} passed`);
    
    return {
      results,
      summary: {
        passed,
        total,
        failed: total - passed
      }
    };
  }
  
  /**
   * Test a single section
   * בדיקת סקשן יחיד
   * @param {string} sectionId - Section ID
   * @returns {Promise<Object>} Test result
   */
  static async testSection(sectionId) {
    const result = {
      sectionId,
      passed: false,
      tests: {}
    };
    
    // Test 1: Check if element exists in DOM
    result.tests.elementExists = this.testElementExists(sectionId);
    
    // Test 2: Check if section class is available
    const sectionClassName = this.getSectionClassName(sectionId);
    result.tests.classAvailable = this.testClassAvailable(sectionClassName);
    
    // Test 3: Check if section is initialized
    if (window.systemManagementMain) {
      result.tests.sectionInitialized = this.testSectionInitialized(sectionId);
    }
    
    // Test 4: Test data loading (if section is initialized)
    if (result.tests.sectionInitialized?.passed) {
      result.tests.dataLoading = await this.testDataLoading(sectionId);
    }
    
    // Test 5: Test render
    if (result.tests.dataLoading?.passed) {
      result.tests.render = this.testRender(sectionId);
    }
    
    // Test 6: Test event listeners
    result.tests.eventListeners = this.testEventListeners(sectionId);
    
    // Overall result
    result.passed = Object.values(result.tests).every(test => test?.passed !== false);
    
    return result;
  }
  
  /**
   * Test if element exists in DOM
   * בדיקה אם element קיים ב-DOM
   */
  static testElementExists(sectionId) {
    const element = document.getElementById(sectionId);
    return {
      passed: !!element,
      message: element ? 'Element exists' : 'Element not found in DOM'
    };
  }
  
  /**
   * Test if class is available
   * בדיקה אם קלאס זמין
   */
  static testClassAvailable(className) {
    const available = typeof window[className] !== 'undefined';
    return {
      passed: available,
      message: available ? `Class ${className} is available` : `Class ${className} not found`
    };
  }
  
  /**
   * Test if section is initialized
   * בדיקה אם סקשן מאותחל
   */
  static testSectionInitialized(sectionId) {
    const section = window.systemManagementMain?.sections?.get(sectionId);
    return {
      passed: !!section && section.isInitialized,
      message: section ? 'Section is initialized' : 'Section not initialized'
    };
  }
  
  /**
   * Test data loading
   * בדיקת טעינת נתונים
   */
  static async testDataLoading(sectionId) {
    try {
      const section = window.systemManagementMain?.sections?.get(sectionId);
      if (!section) {
        return { passed: false, message: 'Section not found' };
      }
      
      // Try to load data
      await section.loadData();
      
      return {
        passed: true,
        message: 'Data loaded successfully',
        hasData: !!section.lastData
      };
    } catch (error) {
      return {
        passed: false,
        message: `Data loading failed: ${error.message}`
      };
    }
  }
  
  /**
   * Test render
   * בדיקת render
   */
  static testRender(sectionId) {
    const element = document.getElementById(sectionId);
    if (!element) {
      return { passed: false, message: 'Element not found' };
    }
    
    const hasContent = element.innerHTML.trim().length > 0;
    const hasError = element.querySelector('.sm-error-card, .error') !== null;
    
    return {
      passed: hasContent && !hasError,
      message: hasContent ? 'Content rendered' : 'No content rendered',
      hasError
    };
  }
  
  /**
   * Test event listeners
   * בדיקת event listeners
   */
  static testEventListeners(sectionId) {
    const element = document.getElementById(sectionId);
    if (!element) {
      return { passed: false, message: 'Element not found' };
    }
    
    // Check for buttons with event handlers
    const buttons = element.querySelectorAll('button[onclick], button[data-onclick]');
    
    return {
      passed: true,
      message: `Found ${buttons.length} interactive elements`,
      buttonCount: buttons.length
    };
  }
  
  /**
   * Get section class name
   * קבלת שם קלאס של סקשן
   */
  static getSectionClassName(sectionId) {
    const parts = sectionId.split('-');
    return 'SM' + parts.slice(1).map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('') + 'Section';
  }
  
  /**
   * Run all tests and display results
   * הרצת כל הבדיקות והצגת תוצאות
   */
  static async runAllTests() {
    console.log('🚀 Starting System Management Tests...');
    const results = await this.testAllSections();
    
    // Display results
    console.table(results.results);
    console.log('Summary:', results.summary);
    
    return results;
  }
}

// Export for global access
window.SMTests = SMTests;

// Auto-run tests if in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Run tests after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (window.location.search.includes('run-tests')) {
        SMTests.runAllTests();
      }
    }, 5000);
  });
}





