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
 * - תמיכה בפיתוח (8080) ובפרודקשן (5001)
 * - שימוש ב-relative URLs בכל מקום
 * 
 * שימוש:
 * - כל הקוד משתמש ב-relative URLs (`/api/...`)
 * - אם נדרש, ניתן להשתמש ב-`window.API_BASE_URL`
 */

// ===== API BASE URL CONFIGURATION =====

/**
 * API Base URL
 * 
 * משתמש ב-relative URLs (`''`) שפועלים אוטומטית עם כל פורט
 * Uses relative URLs (`''`) that work automatically with any port
 * 
 * פיתוח (8080): relative URLs יעבדו
 * פרודקשן (5001): relative URLs יעבדו
 */
window.API_BASE_URL = '';

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
    if (port === '8080' || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'development';
    }
    
    // Default to development
    return 'development';
})();

// ===== LOGGING (Development only) =====

if (window.API_ENV === 'development') {
    console.log('🔧 API Config initialized:', {
        baseURL: window.API_BASE_URL,
        environment: window.API_ENV,
        port: window.location.port,
        hostname: window.location.hostname
    });
}

