(function() {
  const isDebug = new URLSearchParams(window.location.search).has('debug');
  function secureLog(msg, data) {
    if (!isDebug) return;
    const sanitized = data ? JSON.parse(JSON.stringify(data)) : null;
    if (sanitized && sanitized.token) sanitized.token = '***MASKED***';
    console.log('[AuthGuard] ' + msg, sanitized || '');
  }
  secureLog('System Ready. Verification in progress...');
})();