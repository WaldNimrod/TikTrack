/**
 * Debug Loading Loop - בדיקת לופ בטעינה
 * 
 * שימוש: הדבק את הקוד הזה בקונסולה
 */

window.debugLoadingLoop = function() {
    console.group('🔍 Debug Loading Loop');
    
    // בדיקת מצב הדף
    console.log('📄 Document Ready State:', document.readyState);
    console.log('🌐 URL:', window.location.href);
    console.log('⏰ Current Time:', new Date().toISOString());
    
    // בדיקת מערכות אתחול
    console.group('🏗️ Initialization Systems');
    console.log('✅ Unified App Initializer:', typeof window.initializeUnifiedApp !== 'undefined' ? 'Available' : 'Missing');
    console.log('✅ Logger Service:', typeof window.Logger !== 'undefined' ? 'Available' : 'Missing');
    console.log('✅ Unified Cache Manager:', typeof window.unifiedCacheManager !== 'undefined' ? 'Available' : 'Missing');
    console.log('✅ Header System:', typeof window.HeaderSystem !== 'undefined' ? 'Available' : 'Missing');
    console.groupEnd();
    
    // בדיקת שגיאות
    console.group('🚨 Error Check');
    const errors = [];
    const originalError = window.onerror;
    window.onerror = function(msg, url, line, col, error) {
        errors.push({
            message: msg,
            url: url,
            line: line,
            column: col,
            timestamp: new Date().toISOString()
        });
        if (originalError) originalError.apply(this, arguments);
    };
    
    // בדיקת console errors
    const originalConsoleError = console.error;
    let consoleErrors = [];
    console.error = function(...args) {
        consoleErrors.push({
            message: args.join(' '),
            timestamp: new Date().toISOString()
        });
        originalConsoleError.apply(console, args);
    };
    
    console.log('📊 Errors detected:', errors.length);
    if (errors.length > 0) {
        console.table(errors);
    }
    console.groupEnd();
    
    // בדיקת טיימרים
    console.group('⏰ Timers Check');
    console.log('🔄 setInterval calls:', window.setInterval.toString());
    console.log('⏱️ setTimeout calls:', window.setTimeout.toString());
    console.groupEnd();
    
    // בדיקת אירועים
    console.group('📡 Event Listeners');
    console.log('📄 DOMContentLoaded listeners:', document.readyState);
    console.log('🔄 Load event listeners:', window.onload ? 'Set' : 'Not set');
    console.groupEnd();
    
    // בדיקת ביצועים
    console.group('⚡ Performance');
    if (window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.navigationStart;
            console.log('⏱️ Page Load Time:', loadTime + 'ms');
            console.log('🔄 DOM Ready Time:', navigation.domContentLoadedEventEnd - navigation.navigationStart + 'ms');
        }
    }
    console.groupEnd();
    
    console.groupEnd();
    
    return {
        readyState: document.readyState,
        systems: {
            unifiedApp: typeof window.initializeUnifiedApp !== 'undefined',
            logger: typeof window.Logger !== 'undefined',
            cache: typeof window.unifiedCacheManager !== 'undefined',
            header: typeof window.HeaderSystem !== 'undefined'
        },
        errors: errors,
        consoleErrors: consoleErrors
    };
};

// בדיקה אוטומטית כל 5 שניות
window.startLoadingLoopMonitor = function() {
    console.log('🔍 Starting loading loop monitor...');
    
    let checkCount = 0;
    const maxChecks = 10; // 50 שניות מקסימום
    
    const monitor = setInterval(() => {
        checkCount++;
        console.log(`🔍 Loading check ${checkCount}/${maxChecks}`);
        
        const result = window.debugLoadingLoop();
        
        // בדיקה אם הדף נטען
        if (document.readyState === 'complete') {
            console.log('✅ Page loaded completely');
            clearInterval(monitor);
            return;
        }
        
        // בדיקה אם יש שגיאות חוזרות
        if (result.errors.length > 5) {
            console.log('❌ Too many errors detected, stopping monitor');
            clearInterval(monitor);
            return;
        }
        
        // עצירה אחרי 50 שניות
        if (checkCount >= maxChecks) {
            console.log('⏰ Monitor timeout reached');
            clearInterval(monitor);
            return;
        }
    }, 5000);
    
    return monitor;
};

console.log('🔧 Loading Loop Debug Helper Loaded!');
console.log('📋 Available Commands:');
console.log('  - debugLoadingLoop() - Check current loading state');
console.log('  - startLoadingLoopMonitor() - Start automatic monitoring');
