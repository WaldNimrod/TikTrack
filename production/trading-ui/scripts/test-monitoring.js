/**
 * Test Monitoring Page - TikTrack
 * ================================
 *
 * עמוד בדיקה למערכת הניטור
 * כולל קריאות לפונקציות ממערכות שונות
 *
 * @version 1.0.0
 * @created 2025-01-XX
 * @author TikTrack Development Team
 */

// ===== PAGE INITIALIZATION =====

/**
 * Initialize Test Monitoring page
 */
async function initializeTestMonitoringPage() {
    console.log('🔧 Initializing Test Monitoring page...');
    
    try {
        // Load page data
        await loadTestMonitoringData();
        
        // Setup page-specific functionality
        setupTestMonitoringHandlers();
        
        console.log('✅ Test Monitoring page initialized successfully');
        
        // Test various systems
        if (typeof window.Logger !== 'undefined' && window.Logger.info) {
            window.Logger.info('✅ Test Monitoring page initialized', { page: "test-monitoring" });
        }
        
        if (typeof showNotification === 'function') {
            showNotification('עמוד בדיקה נטען בהצלחה', 'success');
        }
    } catch (error) {
        console.error('❌ Failed to initialize Test Monitoring page:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה באתחול עמוד בדיקה', 'error');
        }
    }
}

/**
 * Load Test Monitoring data
 */
async function loadTestMonitoringData() {
    console.log('📊 Loading Test Monitoring data...');
    
    try {
        // Test DataCollectionService
        if (typeof window.DataCollectionService !== 'undefined') {
            console.log('✅ DataCollectionService available');
        }
        
        // Test UnifiedCacheManager
        if (typeof window.UnifiedCacheManager !== 'undefined') {
            console.log('✅ UnifiedCacheManager available');
        }
        
        // Test NotificationSystem
        if (typeof window.NotificationSystem !== 'undefined') {
            console.log('✅ NotificationSystem available');
        }
        
        console.log('✅ Test Monitoring data loaded');
    } catch (error) {
        console.error('❌ Failed to load Test Monitoring data:', error);
        throw error;
    }
}

/**
 * Setup Test Monitoring event handlers
 */
function setupTestMonitoringHandlers() {
    console.log('🔧 Setting up Test Monitoring handlers...');
    
    // Test handlers are defined below
    console.log('✅ Test Monitoring handlers setup complete');
}

// ===== TEST FUNCTIONS =====

/**
 * Test Notification System
 */
function testNotification() {
    const resultsDiv = document.getElementById('test-results');
    let html = '<h6>תוצאות בדיקת התראות:</h6><ul>';
    
    if (typeof showNotification === 'function') {
        showNotification('בדיקת מערכת התראות', 'info');
        html += '<li class="text-success">✅ showNotification זמינה</li>';
    } else {
        html += '<li class="text-danger">❌ showNotification לא זמינה</li>';
    }
    
    if (typeof window.NotificationSystem !== 'undefined') {
        html += '<li class="text-success">✅ NotificationSystem זמינה</li>';
    } else {
        html += '<li class="text-danger">❌ NotificationSystem לא זמינה</li>';
    }
    
    html += '</ul>';
    resultsDiv.innerHTML = html;
}

/**
 * Test Data Collection Service
 */
function testDataCollection() {
    const resultsDiv = document.getElementById('test-results');
    let html = '<h6>תוצאות בדיקת איסוף נתונים:</h6><ul>';
    
    if (typeof window.DataCollectionService !== 'undefined') {
        html += '<li class="text-success">✅ DataCollectionService זמינה</li>';
        
        // Test collection
        try {
            const testData = window.DataCollectionService.collectFormData({
                testField: 'test-input'
            });
            html += '<li class="text-success">✅ DataCollectionService.collectFormData עובד</li>';
        } catch (error) {
            html += `<li class="text-warning">⚠️ שגיאה: ${error.message}</li>`;
        }
    } else {
        html += '<li class="text-danger">❌ DataCollectionService לא זמינה</li>';
    }
    
    html += '</ul>';
    resultsDiv.innerHTML = html;
}

/**
 * Test Cache System
 */
function testCache() {
    const resultsDiv = document.getElementById('test-results');
    let html = '<h6>תוצאות בדיקת מטמון:</h6><ul>';
    
    if (typeof window.UnifiedCacheManager !== 'undefined') {
        html += '<li class="text-success">✅ UnifiedCacheManager זמינה</li>';
        
        // Test cache operations
        if (window.UnifiedCacheManager.initialized) {
            html += '<li class="text-success">✅ UnifiedCacheManager מאותחלת</li>';
        } else {
            html += '<li class="text-warning">⚠️ UnifiedCacheManager לא מאותחלת</li>';
        }
    } else {
        html += '<li class="text-danger">❌ UnifiedCacheManager לא זמינה</li>';
    }
    
    if (typeof window.CacheSyncManager !== 'undefined') {
        html += '<li class="text-success">✅ CacheSyncManager זמינה</li>';
    } else {
        html += '<li class="text-danger">❌ CacheSyncManager לא זמינה</li>';
    }
    
    html += '</ul>';
    resultsDiv.innerHTML = html;
}

/**
 * Test Logger System
 */
function testLogger() {
    const resultsDiv = document.getElementById('test-results');
    let html = '<h6>תוצאות בדיקת לוגים:</h6><ul>';
    
    if (typeof window.Logger !== 'undefined') {
        html += '<li class="text-success">✅ Logger זמינה</li>';
        
        // Test logging
        try {
            window.Logger.info('בדיקת לוגר', { page: "test-monitoring" });
            html += '<li class="text-success">✅ Logger.info עובד</li>';
        } catch (error) {
            html += `<li class="text-warning">⚠️ שגיאה: ${error.message}</li>`;
        }
    } else {
        html += '<li class="text-danger">❌ Logger לא זמינה</li>';
    }
    
    html += '</ul>';
    resultsDiv.innerHTML = html;
}

// ===== GLOBAL EXPORTS =====

window.initializeTestMonitoringPage = initializeTestMonitoringPage;
window.loadTestMonitoringData = loadTestMonitoringData;
window.setupTestMonitoringHandlers = setupTestMonitoringHandlers;
window.testNotification = testNotification;
window.testDataCollection = testDataCollection;
window.testCache = testCache;
window.testLogger = testLogger;

// Auto-initialize if page is loaded directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTestMonitoringPage);
} else {
    initializeTestMonitoringPage();
}


