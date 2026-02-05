/**
 * Trading Accounts Routing Test
 * Tests that /trading_accounts route serves HTML file correctly
 * Team 30 (Frontend Execution)
 */

import { createDriver, waitForElement, getConsoleLogs, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { TEST_CONFIG, TEST_USERS } from './selenium-config.js';

const logger = new TestLogger();

/**
 * Test: Trading Accounts Route Serves HTML
 */
async function testTradingAccountsRoute() {
  const driver = await createDriver();
  
  try {
    logger.log('testTradingAccountsRoute', 'START', { message: 'Starting test' });
    
    // Step 1: Navigate to frontend first (to establish proper origin)
    logger.log('testTradingAccountsRoute', 'INFO', { message: 'Navigating to frontend root first' });
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1000);
    
    // Step 2: Set authentication token (now we have proper origin)
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
    await driver.executeScript(`localStorage.setItem('access_token', '${testToken}');`);
    logger.log('testTradingAccountsRoute', 'INFO', { message: 'Token set in localStorage' });
    
    // Step 3: Navigate to trading_accounts
    logger.log('testTradingAccountsRoute', 'INFO', { message: 'Navigating to /trading_accounts' });
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    
    // Step 4: Wait for page to load
    await driver.sleep(3000);
    
    // Step 4: Check if HTML page loaded (not React Router redirect)
    const currentUrl = await driver.getCurrentUrl();
    logger.log('testTradingAccountsRoute', 'INFO', { message: `Current URL: ${currentUrl}` });
    
    // Step 5: Check console logs for Auth Guard
    const consoleLogs = await getConsoleLogs(driver);
    const authGuardLogs = consoleLogs.filter(log => 
      log.message.includes('Auth Guard') || 
      log.message.includes('auth-guard')
    );
    
    logger.log('testTradingAccountsRoute', 'INFO', { 
      message: `Found ${authGuardLogs.length} Auth Guard logs`,
      logs: authGuardLogs.slice(0, 5) // First 5 logs
    });
    
    // Step 6: Check if page title indicates HTML page
    const pageTitle = await driver.getTitle();
    logger.log('testTradingAccountsRoute', 'INFO', { message: `Page title: ${pageTitle}` });
    
    // Step 7: Check if specific HTML elements exist (from trading_accounts.html)
    try {
      // Look for elements that should exist in the HTML page
      const pageWrapper = await driver.findElement({ css: '.page-wrapper' }).catch(() => null);
      const authGuardScript = await driver.executeScript(`
        return Array.from(document.querySelectorAll('script')).some(s => 
          s.src && s.src.includes('auth-guard.js')
        );
      `);
      
      if (pageWrapper && authGuardScript) {
        logger.log('testTradingAccountsRoute', 'PASS', { 
          message: 'HTML page loaded correctly - found page-wrapper and auth-guard.js'
        });
      } else {
        logger.log('testTradingAccountsRoute', 'FAIL', { 
          message: 'HTML page not loaded - missing expected elements',
          hasPageWrapper: !!pageWrapper,
          hasAuthGuard: authGuardScript
        });
      }
    } catch (error) {
      logger.error('testTradingAccountsRoute', error);
    }
    
    // Step 8: Check if redirected to home (should NOT happen)
    if (currentUrl.includes('/trading_accounts')) {
      logger.log('testTradingAccountsRoute', 'PASS', { 
        message: 'Still on /trading_accounts - no redirect occurred'
      });
    } else {
      logger.log('testTradingAccountsRoute', 'FAIL', { 
        message: `Redirected away from /trading_accounts to: ${currentUrl}`
      });
    }
    
  } catch (error) {
    logger.error('testTradingAccountsRoute', error);
  } finally {
    await driver.quit();
  }
}

/**
 * Test: Trading Accounts with Debug Mode
 */
async function testTradingAccountsDebugMode() {
  const driver = await createDriver();
  
  try {
    logger.log('testTradingAccountsDebugMode', 'START', { message: 'Starting debug mode test' });
    
    // Step 1: Navigate to frontend first (to establish proper origin)
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1000);
    
    // Step 2: Set authentication token
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
    await driver.executeScript(`localStorage.setItem('access_token', '${testToken}');`);
    
    // Step 3: Navigate with debug parameter
    logger.log('testTradingAccountsDebugMode', 'INFO', { message: 'Navigating to /trading_accounts?debug=true' });
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts?debug=true`);
    
    // Step 4: Wait for page to load
    await driver.sleep(3000);
    
    // Step 4: Wait longer for logs to appear
    await driver.sleep(2000);
    
    // Step 5: Check console logs for debug mode
    const consoleLogs = await getConsoleLogs(driver);
    logger.log('testTradingAccountsDebugMode', 'INFO', { 
      message: `Total console logs: ${consoleLogs.length}`,
      sampleLogs: consoleLogs.slice(0, 10).map(l => l.message.substring(0, 100))
    });
    
    const debugLogs = consoleLogs.filter(log => 
      log.message.includes('DEBUG MODE') || 
      log.message.includes('debug') ||
      log.message.includes('🔍')
    );
    
    // Also check if debug mode is set in AuthGuard object
    const authGuardDebugMode = await driver.executeScript(`
      return window.AuthGuard && window.AuthGuard.debugMode;
    `);
    
    logger.log('testTradingAccountsDebugMode', 'INFO', { 
      message: `AuthGuard.debugMode: ${authGuardDebugMode}`,
      debugLogsCount: debugLogs.length
    });
    
    if (debugLogs.length > 0 || authGuardDebugMode === true) {
      logger.log('testTradingAccountsDebugMode', 'PASS', { 
        message: `Debug mode detected - found ${debugLogs.length} debug logs, AuthGuard.debugMode: ${authGuardDebugMode}`
      });
    } else {
      logger.log('testTradingAccountsDebugMode', 'FAIL', { 
        message: 'Debug mode not detected - no debug logs found and AuthGuard.debugMode is not true',
        url: await driver.getCurrentUrl()
      });
    }
    
  } catch (error) {
    logger.error('testTradingAccountsDebugMode', error);
  } finally {
    await driver.quit();
  }
}

/**
 * Test: Trading Accounts without Authentication
 */
async function testTradingAccountsNoAuth() {
  const driver = await createDriver();
  
  try {
    logger.log('testTradingAccountsNoAuth', 'START', { message: 'Starting no-auth test' });
    
    // Step 1: Navigate to frontend first (to establish proper origin)
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1000);
    
    // Step 2: Clear ALL storage (localStorage and sessionStorage)
    await driver.executeScript(`
      localStorage.clear();
      sessionStorage.clear();
      // Also remove access_token specifically
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
    `);
    
    // Step 3: Verify storage is cleared
    const tokenAfterClear = await getLocalStorageValue(driver, 'access_token');
    logger.log('testTradingAccountsNoAuth', 'INFO', { 
      message: `Token after clear: ${tokenAfterClear ? 'STILL EXISTS' : 'CLEARED'}` 
    });
    
    // Step 4: Navigate to trading_accounts
    logger.log('testTradingAccountsNoAuth', 'INFO', { message: 'Navigating to /trading_accounts without auth' });
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    
    // Step 5: Wait longer for auth guard to run and redirect
    await driver.sleep(5000);
    
    // Step 6: Check console logs for auth guard activity
    const consoleLogs = await getConsoleLogs(driver);
    const authGuardLogs = consoleLogs.filter(log => 
      log.message.includes('Auth Guard') || 
      log.message.includes('auth-guard') ||
      log.message.includes('not authenticated') ||
      log.message.includes('redirecting to login')
    );
    
    logger.log('testTradingAccountsNoAuth', 'INFO', { 
      message: `Found ${authGuardLogs.length} Auth Guard logs`,
      sampleLogs: authGuardLogs.slice(0, 10).map(l => l.message.substring(0, 150))
    });
    
    // Step 7: Check if redirected to login
    const currentUrl = await driver.getCurrentUrl();
    logger.log('testTradingAccountsNoAuth', 'INFO', { message: `Current URL after redirect: ${currentUrl}` });
    
    // Step 8: Verify localStorage is still empty
    const token = await getLocalStorageValue(driver, 'access_token');
    logger.log('testTradingAccountsNoAuth', 'INFO', { 
      message: `Token in localStorage: ${token ? 'EXISTS (ERROR!)' : 'NULL (CORRECT)'}` 
    });
    
    if (currentUrl.includes('/login')) {
      logger.log('testTradingAccountsNoAuth', 'PASS', { 
        message: 'Correctly redirected to /login'
      });
    } else {
      logger.log('testTradingAccountsNoAuth', 'FAIL', { 
        message: `Not redirected to login - current URL: ${currentUrl}`,
        authGuardRan: authGuardLogs.length > 0,
        tokenExists: !!token,
        possibleReasons: [
          'Auth guard not running',
          'Token still exists in storage',
          'Debug mode enabled',
          'Auth guard delay too long'
        ]
      });
    }
    
  } catch (error) {
    logger.error('testTradingAccountsNoAuth', error);
  } finally {
    await driver.quit();
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('TRADING ACCOUNTS ROUTING TESTS');
  console.log('='.repeat(60) + '\n');
  
  try {
    await testTradingAccountsRoute();
    await testTradingAccountsDebugMode();
    await testTradingAccountsNoAuth();
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    logger.printSummary();
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testTradingAccountsRoute, testTradingAccountsDebugMode, testTradingAccountsNoAuth };
