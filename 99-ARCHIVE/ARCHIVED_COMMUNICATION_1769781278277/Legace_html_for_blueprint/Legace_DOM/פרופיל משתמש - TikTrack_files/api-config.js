/**
 * API Configuration - TikTrack
 * =============================
 * 
 * הגדרות מרכזיות לכתובות API
 * Central API configuration
 * 
 * @version 1.0.0
 * @created 2025-11-09
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - הגדרת API_BASE_URL מרכזית
 * - תמיכה בפיתוח (8090) ובפרודקשן (5001)
 * - שימוש ב-relative URLs בכל מקום
 * 
 * שימוש:
 * - כל הקוד משתמש ב-relative URLs (`/api/...`)
 * - אם נדרש, ניתן להשתמש ב-`window.API_BASE_URL`
 */

// ===== API BASE URL CONFIGURATION =====

// #region agent log - API config loading
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'api-config.js:loading',
    message: 'API configuration file loading',
    data: {
      timestamp: Date.now(),
      page: window.location.pathname,
      hasExistingAPIConfig: typeof window.API_CONFIG !== 'undefined'
    },
    sessionId: 'batch_d_auth_debug',
    hypothesisId: 'H2_api_config_loading'
  })
}).catch(() => {});
// #endregion

/**
 * API Base URL
 * 
 * משתמש ב-relative URLs (`''`) שפועלים אוטומטית עם כל פורט
 * Uses relative URLs (`''`) that work automatically with any port
 * 
 * פיתוח (8090): relative URLs יעבדו
 * פרודקשן (5001): relative URLs יעבדו
 */
window.API_BASE_URL = '';

// Export as API_CONFIG object for compatibility
window.API_CONFIG = {
  baseUrl: window.API_BASE_URL,
  environment: window.API_ENV
};

// ===== ENVIRONMENT DETECTION (Optional) =====

/**
 * Detect current environment
 * זיהוי סביבה נוכחית
 */
window.API_ENV = (function() {
    const port = window.location.port;
    const hostname = window.location.hostname;
    
    // Production detection
    if (port === '5001' || hostname.includes('production')) {
        return 'production';
    }
    
    // Development detection
    if (port === '8090' || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'development';
    }
    
    // Default to development
    return 'development';
})();

// ===== LOGGING (Development only) =====

if (window.API_ENV === 'development' && window.Logger && Logger.DEBUG_MODE) {
    // Only log in DEBUG mode via Logger
    window.Logger.debug('API Config initialized', {
        baseURL: window.API_BASE_URL,
        environment: window.API_ENV,
        port: window.location.port,
        hostname: window.location.hostname
    });
}

// #region agent log - API config final state
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'api-config.js:final_state',
    message: 'API configuration completed - final state',
    data: {
      timestamp: Date.now(),
      page: window.location.pathname,
      apiBaseUrl: window.API_BASE_URL,
      apiEnv: window.API_ENV,
      port: window.location.port,
      hostname: window.location.hostname,
      hasAuthToken: !!sessionStorage.getItem('authToken'),
      hasCurrentUser: !!window.currentUser
    },
    sessionId: 'batch_d_auth_debug',
    hypothesisId: 'H2_api_config_loading'
  })
}).catch(() => {});
// #endregion
