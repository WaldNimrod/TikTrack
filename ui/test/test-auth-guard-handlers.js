/**
 * Test Auth Guard Handlers - External JS for test-auth-guard.html
 * ----------------------------------------------------------------
 * Handlers for Auth Guard test page - moved from inline JS to external file
 * for policy compliance (Hybrid scripts policy forbids inline JS)
 */

// Capture console.log for display
const originalLog = console.log;
let logOutput = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTestHandlers);
} else {
  initTestHandlers();
}

function initTestHandlers() {
  logOutput = document.getElementById('logOutput');

  console.log = function (...args) {
    originalLog.apply(console, args);
    if (args[0] && args[0].includes && args[0].includes('Auth Guard')) {
      if (logOutput) {
        logOutput.textContent += args.join(' ') + '\n';
        logOutput.scrollTop = logOutput.scrollHeight;
      }
    }
  };

  // Initial log
  log('Test page loaded. Auth Guard should be initialized.');
  if (window.AuthGuard) {
    log('AuthGuard object available: ' + !!window.AuthGuard);
    log('AuthGuard.debugMode: ' + window.AuthGuard.debugMode);
  } else {
    log('WARNING: AuthGuard object not available');
  }
}

function enableDebugMode() {
  localStorage.setItem('auth_guard_debug', 'true');
  log('Debug mode enabled');
}

function disableDebugMode() {
  localStorage.removeItem('auth_guard_debug');
  log('Debug mode disabled');
}

function checkDebugMode() {
  const debug = localStorage.getItem('auth_guard_debug') === 'true';
  log('Debug mode status: ' + (debug ? 'ENABLED' : 'DISABLED'));
  if (window.AuthGuard) {
    log('AuthGuard.debugMode: ' + window.AuthGuard.debugMode);
  }
}

function setTestToken() {
  localStorage.setItem('access_token', 'test_token_' + Date.now());
  log('Test token set');
}

function removeToken() {
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');
  log('Token removed');
}

function checkToken() {
  const token =
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token');
  log('Token exists: ' + !!token);
  if (token) {
    log('Token length: ' + token.length);
    log('Token preview: ' + token.substring(0, 30) + '...');
  }
}

function testIsAuthenticated() {
  if (window.AuthGuard && window.AuthGuard.isAuthenticated) {
    const result = window.AuthGuard.isAuthenticated();
    log('isAuthenticated() result: ' + result);
  } else {
    log('ERROR: AuthGuard.isAuthenticated not available');
  }
}

function testCheck() {
  if (window.AuthGuard && window.AuthGuard.check) {
    log('Calling check()...');
    window.AuthGuard.check();
  } else {
    log('ERROR: AuthGuard.check not available');
  }
}

function testLogWithTimestamp() {
  if (window.AuthGuard && window.AuthGuard.logWithTimestamp) {
    const result = window.AuthGuard.logWithTimestamp('Test log message', {
      test: 'data',
    });
    log('logWithTimestamp() returned: ' + JSON.stringify(result));
  } else {
    log('ERROR: AuthGuard.logWithTimestamp not available');
  }
}

function navigateToTradingAccounts() {
  window.location.href = '/trading_accounts';
}

function navigateToTradingAccountsDebug() {
  window.location.href = '/trading_accounts?debug=true';
}

function clearLogs() {
  if (logOutput) {
    logOutput.textContent = '';
  }
}

function log(message) {
  if (!logOutput) {
    logOutput = document.getElementById('logOutput');
  }
  if (logOutput) {
    const timestamp = new Date().toISOString();
    logOutput.textContent += `[${timestamp}] ${message}\n`;
    logOutput.scrollTop = logOutput.scrollHeight;
  }
}

// Export functions to global scope (for compatibility)
window.enableDebugMode = enableDebugMode;
window.disableDebugMode = disableDebugMode;
window.checkDebugMode = checkDebugMode;
window.setTestToken = setTestToken;
window.removeToken = removeToken;
window.checkToken = checkToken;
window.testIsAuthenticated = testIsAuthenticated;
window.testCheck = testCheck;
window.testLogWithTimestamp = testLogWithTimestamp;
window.navigateToTradingAccounts = navigateToTradingAccounts;
window.navigateToTradingAccountsDebug = navigateToTradingAccountsDebug;
window.clearLogs = clearLogs;

// Attach event listeners to buttons (Policy Compliance - No inline onclick)
function attachEventListeners() {
  const buttons = document.querySelectorAll('.test-button[data-action]');
  buttons.forEach((button) => {
    const action = button.getAttribute('data-action');
    if (window[action]) {
      button.addEventListener('click', window[action]);
    } else {
      console.warn(`Handler function not found for action: ${action}`);
    }
  });
}

// Attach listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachEventListeners);
} else {
  attachEventListeners();
}
