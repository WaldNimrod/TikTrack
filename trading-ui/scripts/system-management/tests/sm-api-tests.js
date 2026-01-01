/**
 * System Management API Tests - TikTrack
 * ======================================
 * 
 * Automated tests for system management API endpoints
 * Tests API endpoints, response structure, and error handling
 * 
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 * @author TikTrack Development Team
 */

class SMAPITests {
  /**
   * Test all API endpoints
   * בדיקת כל ה-API endpoints
   * @returns {Promise<Object>} Test results
   */
  static async testAllEndpoints() {
    const endpoints = [
      { url: '/api/system/overview', method: 'GET', name: 'System Overview' },
      { url: '/api/system/health', method: 'GET', name: 'System Health' },
      { url: '/api/system/metrics', method: 'GET', name: 'System Metrics' },
      { url: '/api/system/info', method: 'GET', name: 'System Info' },
      { url: '/api/system/database', method: 'GET', name: 'Database Info' },
      { url: '/api/system/cache', method: 'GET', name: 'Cache Info' },
      { url: '/api/system/performance', method: 'GET', name: 'Performance' },
      { url: '/api/system/environment', method: 'GET', name: 'Environment' },
      { url: '/api/server/status', method: 'GET', name: 'Server Status' },
      { url: '/api/server/system/info', method: 'GET', name: 'Server System Info' },
      { url: '/api/cache/stats', method: 'GET', name: 'Cache Stats' },
      { url: '/api/cache/health', method: 'GET', name: 'Cache Health' },
      { url: '/api/system-settings/smtp', method: 'GET', name: 'SMTP Settings' },
      { url: '/api/system-settings/external-data', method: 'GET', name: 'External Data Settings' }
    ];
    
    const results = {};
    
    window.Logger?.info('🧪 Starting API endpoint tests...');
    
    for (const endpoint of endpoints) {
      try {
        results[endpoint.url] = await this.testEndpoint(endpoint);
      } catch (error) {
        results[endpoint.url] = {
          passed: false,
          error: error.message
        };
      }
    }
    
    const passed = Object.values(results).filter(r => r.passed).length;
    const total = endpoints.length;
    
    window.Logger?.info(`✅ API tests completed: ${passed}/${total} passed`);
    
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
   * Test a single endpoint
   * בדיקת endpoint יחיד
   * @param {Object} endpoint - Endpoint configuration
   * @returns {Promise<Object>} Test result
   */
  static async testEndpoint(endpoint) {
    const result = {
      endpoint: endpoint.url,
      method: endpoint.method,
      name: endpoint.name,
      passed: false,
      tests: {}
    };
    
    try {
      // Test 1: Check if endpoint is reachable
      const startTime = performance.now();
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }, });
      const responseTime = performance.now() - startTime;
      
      result.tests.reachable = {
        passed: true,
        message: 'Endpoint is reachable',
        status: response.status,
        responseTime: `${responseTime.toFixed(2)}ms`
      };
      
      // Test 2: Check response status
      result.tests.status = {
        passed: response.ok,
        message: response.ok ? 'Response status OK' : `Response status: ${response.status}`,
        status: response.status
      };
      
      // Test 3: Check response structure
      if (response.ok) {
        const data = await response.json();
        result.tests.structure = this.testResponseStructure(data, endpoint.url);
        result.data = data;
      }
      
      // Overall result
      result.passed = Object.values(result.tests).every(test => test?.passed !== false);
      
    } catch (error) {
      result.tests.reachable = {
        passed: false,
        message: `Failed to reach endpoint: ${error.message}`
      };
      result.error = error.message;
    }
    
    return result;
  }
  
  /**
   * Test response structure
   * בדיקת מבנה response
   */
  static testResponseStructure(data, endpoint) {
    if (!data || typeof data !== 'object') {
      return {
        passed: false,
        message: 'Response is not a valid object'
      };
    }
    
    // Check for common response structure
    const hasStatus = 'status' in data || 'success' in data;
    const hasData = 'data' in data || 'result' in data;
    
    return {
      passed: hasStatus || hasData,
      message: hasStatus ? 'Response has status field' : 'Response structure may be different',
      hasStatus,
      hasData
    };
  }
  
  /**
   * Run all API tests and display results
   * הרצת כל בדיקות ה-API והצגת תוצאות
   */
  static async runAllTests() {
    window.Logger?.info('🚀 Starting System Management API Tests...');
    const results = await this.testAllEndpoints();
    
    // Display results
    window.Logger?.table(results.results);
    window.Logger?.info('Summary:', results.summary);
    
    return results;
  }
}

// Export for global access
window.SMAPITests = SMAPITests;

// Auto-run tests if in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Run tests after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (window.location.search.includes('run-api-tests')) {
        SMAPITests.runAllTests();
      }
    }, 5000);
  });
}























