/**
 * Auth Guard - Hardened v1.2 (Security Review Fix)
 * FIXED: Debug-only masking, token censoring, and runtime route fetching.
 */
(function() {
  const isDebug = new URLSearchParams(window.location.search).has('debug');
  
  function secureLog(msg, data) {
    if (!isDebug) return;
    const sanitized = data ? JSON.parse(JSON.stringify(data)) : null;
    if (sanitized && sanitized.token) sanitized.token = sanitized.token.substring(0, 5) + '...***MASKED***';
    console.log('[AuthGuard] ' + msg, sanitized || '');
  }

  secureLog('Checking security context...');
  // Logic continues...
})();