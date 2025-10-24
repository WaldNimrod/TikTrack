/**
 * System Debug Helper - קוד בדיקה מקיף למערכת TikTrack
 * 
 * שימוש: הדבק את הקוד הזה בקונסולה של הדפדפן
 * 
 * פונקציות זמינות:
 * - window.debugSystem() - בדיקה מקיפה של כל המערכת
 * - window.debugCache() - בדיקת מערכת המטמון
 * - window.debugPages() - בדיקת כל העמודים
 * - window.debugErrors() - בדיקת שגיאות
 * - window.debugPerformance() - בדיקת ביצועים
 */

// ========================================
// פונקציות בדיקה עיקריות
// ========================================

window.debugSystem = function() {
    console.group('🔍 TikTrack System Debug Report');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🌐 URL:', window.location.href);
    console.log('📄 Page:', window.location.pathname);
    
    // בדיקת מערכות בסיס
    console.group('🏗️ Core Systems');
    console.log('✅ Logger Service:', typeof window.Logger !== 'undefined' ? 'Available' : 'Missing');
    console.log('✅ Unified Cache Manager:', typeof window.unifiedCacheManager !== 'undefined' ? 'Available' : 'Missing');
    console.log('✅ Notification System:', typeof window.showSuccessNotification !== 'undefined' ? 'Available' : 'Missing');
    console.log('✅ Header System:', typeof window.HeaderSystem !== 'undefined' ? 'Available' : 'Missing');
    console.groupEnd();
    
    // בדיקת שגיאות
    console.group('🚨 Error Analysis');
    const errors = [];
    const originalError = window.onerror;
    window.onerror = function(msg, url, line, col, error) {
        errors.push({
            message: msg,
            url: url,
            line: line,
            column: col,
            error: error
        });
        if (originalError) originalError.apply(this, arguments);
    };
    
    // בדיקת console errors
    const originalConsoleError = console.error;
    let consoleErrors = [];
    console.error = function(...args) {
        consoleErrors.push(args);
        originalConsoleError.apply(console, args);
    };
    
    console.log('📊 Total Errors Detected:', errors.length);
    if (errors.length > 0) {
        console.table(errors);
    }
    console.groupEnd();
    
    // בדיקת ביצועים
    console.group('⚡ Performance');
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Page Load Time:', loadTime + 'ms');
        console.log('🔄 DOM Ready:', timing.domContentLoadedEventEnd - timing.navigationStart + 'ms');
    }
    console.groupEnd();
    
    // בדיקת מטמון
    console.group('💾 Cache Status');
    if (window.unifiedCacheManager) {
        try {
            const stats = window.unifiedCacheManager.getStats();
            console.log('📊 Cache Stats:', stats);
        } catch (e) {
            console.log('❌ Cache Stats Error:', e.message);
        }
    }
    console.groupEnd();
    
    console.groupEnd();
    
    return {
        errors: errors,
        consoleErrors: consoleErrors,
        systems: {
            logger: typeof window.Logger !== 'undefined',
            cache: typeof window.unifiedCacheManager !== 'undefined',
            notifications: typeof window.showSuccessNotification !== 'undefined',
            header: typeof window.HeaderSystem !== 'undefined'
        }
    };
};

window.debugCache = function() {
    console.group('💾 Cache System Debug');
    
    if (!window.unifiedCacheManager) {
        console.error('❌ Unified Cache Manager not available');
        console.groupEnd();
        return;
    }
    
    try {
        const stats = window.unifiedCacheManager.getStats();
        console.log('📊 Cache Statistics:', stats);
        
        // בדיקת localStorage
        console.log('🗄️ localStorage Keys:', Object.keys(localStorage));
        console.log('📦 localStorage Size:', JSON.stringify(localStorage).length + ' bytes');
        
        // בדיקת IndexedDB
        if ('indexedDB' in window) {
            console.log('🗃️ IndexedDB Available:', true);
        } else {
            console.log('🗃️ IndexedDB Available:', false);
        }
        
    } catch (error) {
        console.error('❌ Cache Debug Error:', error);
    }
    
    console.groupEnd();
};

window.debugPages = function() {
    console.group('📄 Pages Debug');
    
    const pages = [
        'index', 'trades', 'executions', 'trade_plans', 'alerts', 
        'notes', 'cash_flows', 'tickers', 'trading_accounts', 'preferences'
    ];
    
    pages.forEach(page => {
        const script = document.querySelector(`script[src*="${page}.js"]`);
        if (script) {
            console.log(`✅ ${page}.js:`, 'Loaded');
        } else {
            console.log(`❌ ${page}.js:`, 'Not Found');
        }
    });
    
    console.groupEnd();
};

window.debugErrors = function() {
    console.group('🚨 Error Debug');
    
    // איסוף שגיאות מהקונסולה
    const errors = [];
    const originalError = console.error;
    console.error = function(...args) {
        errors.push({
            timestamp: new Date().toISOString(),
            message: args.join(' '),
            stack: new Error().stack
        });
        originalError.apply(console, args);
    };
    
    // בדיקת שגיאות JavaScript
    window.addEventListener('error', function(e) {
        console.log('🚨 JavaScript Error:', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
    });
    
    // בדיקת שגיאות Promise
    window.addEventListener('unhandledrejection', function(e) {
        console.log('🚨 Promise Rejection:', {
            reason: e.reason,
            promise: e.promise
        });
    });
    
    console.groupEnd();
};

window.debugPerformance = function() {
    console.group('⚡ Performance Debug');
    
    if (window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            console.log('📊 Navigation Timing:', {
                'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart + 'ms',
                'TCP Connect': navigation.connectEnd - navigation.connectStart + 'ms',
                'Request': navigation.responseStart - navigation.requestStart + 'ms',
                'Response': navigation.responseEnd - navigation.responseStart + 'ms',
                'DOM Processing': navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart + 'ms',
                'Total Load': navigation.loadEventEnd - navigation.navigationStart + 'ms'
            });
        }
        
        // בדיקת משאבים
        const resources = performance.getEntriesByType('resource');
        console.log('📦 Resources Loaded:', resources.length);
        
        const slowResources = resources.filter(r => r.duration > 1000);
        if (slowResources.length > 0) {
            console.log('🐌 Slow Resources (>1s):', slowResources.map(r => ({
                name: r.name,
                duration: r.duration + 'ms'
            })));
        }
    }
    
    // בדיקת זיכרון
    if (performance.memory) {
        console.log('🧠 Memory Usage:', {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        });
    }
    
    console.groupEnd();
};

// ========================================
// פונקציות בדיקה מתקדמות
// ========================================

window.debugNetwork = function() {
    console.group('🌐 Network Debug');
    
    // בדיקת חיבור לשרת
    fetch('/api/health')
        .then(response => {
            console.log('✅ Server Health:', response.status);
            return response.json();
        })
        .then(data => console.log('📊 Server Data:', data))
        .catch(error => console.log('❌ Server Error:', error.message));
    
    console.groupEnd();
};

window.debugConsole = function() {
    console.group('🖥️ Console Debug');
    
    // בדיקת console methods
    const consoleMethods = ['log', 'warn', 'error', 'info', 'debug'];
    consoleMethods.forEach(method => {
        console.log(`✅ console.${method}:`, typeof console[method] === 'function' ? 'Available' : 'Missing');
    });
    
    // בדיקת Logger
    if (window.Logger) {
        console.log('📝 Logger Methods:', Object.getOwnPropertyNames(window.Logger));
    }
    
    console.groupEnd();
};

// ========================================
// פונקציה ראשית - הרץ הכל
// ========================================

window.debugAll = function() {
    console.clear();
    console.log('🚀 Starting TikTrack System Debug...');
    
    const results = {
        system: window.debugSystem(),
        cache: window.debugCache(),
        pages: window.debugPages(),
        errors: window.debugErrors(),
        performance: window.debugPerformance(),
        network: window.debugNetwork(),
        console: window.debugConsole()
    };
    
    console.log('✅ Debug Complete! Results:', results);
    return results;
};

// ========================================
// הודעת טעינה
// ========================================

console.log('🔧 TikTrack Debug Helper Loaded!');
console.log('📋 Available Commands:');
console.log('  - debugAll() - Run all debug checks');
console.log('  - debugSystem() - Core system check');
console.log('  - debugCache() - Cache system check');
console.log('  - debugPages() - Pages check');
console.log('  - debugErrors() - Error analysis');
console.log('  - debugPerformance() - Performance check');
console.log('  - debugNetwork() - Network check');
console.log('  - debugConsole() - Console check');
