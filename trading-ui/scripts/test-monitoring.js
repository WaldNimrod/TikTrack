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


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeTestMonitoringPage() - Initializetestmonitoringpage
// - setupTestMonitoringHandlers() - Setuptestmonitoringhandlers

// === Event Handlers ===
// - loadTestMonitoringData() - Loadtestmonitoringdata
// - testNotification() - Testnotification
// - testDataCollection() - Testdatacollection

// === Other ===
// - testCache() - Testcache
// - testLogger() - Testlogger

// ===== PAGE INITIALIZATION =====

/**
 * Initialize Test Monitoring page
 */
async function initializeTestMonitoringPage() {
    if (window.Logger) { window.Logger.info('🔧 Initializing Test Monitoring page...', { page: 'test-monitoring', component: 'test-monitoring' }); }
    
    try {
        // Load page data
        await loadTestMonitoringData();
        
        // Setup page-specific functionality
        setupTestMonitoringHandlers();
        
        // Register tables with UnifiedTableSystem
        if (typeof registerTablesWithUnifiedTableSystem === 'function') {
            registerTablesWithUnifiedTableSystem();
        }
        
        // Initialize PreferencesSystem if available
        if (window.PreferencesSystem && typeof window.PreferencesSystem.initialize === 'function') {
            window.PreferencesSystem.initialize().then(() => {
                if (window.Logger) {
                    window.Logger.info('PreferencesSystem initialized', {
                        page: 'test-monitoring',
                        component: 'preferences-system',
                        action: 'init-complete'
                    });
                }
            }).catch(error => {
                if (window.Logger) {
                    window.Logger.warn('PreferencesSystem initialization failed', {
                        page: 'test-monitoring',
                        component: 'preferences-system',
                        action: 'init-failed',
                        error: error.message
                    });
                }
            });
        }
        
        if (window.Logger) { window.Logger.info('✅ Test Monitoring page initialized successfully', { page: 'test-monitoring', component: 'test-monitoring' }); }
        
        // Test various systems
        if (typeof window.Logger !== 'undefined' && window.Logger.info) {
            window.Logger.info('✅ Test Monitoring page initialized', { page: "test-monitoring" });
        }
        
        if (typeof window.NotificationSystem !== 'undefined') {
            if (window.NotificationSystem) { window.NotificationSystem.show('עמוד בדיקה נטען בהצלחה', 'success'); }
        }
    } catch (error) {
        if (window.Logger) { window.Logger.error('❌ Failed to initialize Test Monitoring page:', { page: 'test-monitoring', component: 'test-monitoring', error: 'error.message', stack: 'error.stack' }); }
        if (typeof window.NotificationSystem !== 'undefined') {
            if (window.NotificationSystem) { window.NotificationSystem.show('שגיאה באתחול עמוד בדיקה', 'error'); }
        }
    }
}

/**
 * Load Test Monitoring data
 */
async function loadTestMonitoringData() {
    if (window.Logger) { window.Logger.info('📊 Loading Test Monitoring data...', { page: 'test-monitoring', component: 'test-monitoring' }); }
    
    try {
        // Test DataCollectionService
        if (typeof window.DataCollectionService !== 'undefined') {
            if (window.Logger) { window.Logger.info('✅ DataCollectionService available', { page: 'test-monitoring', component: 'test-monitoring' }); }
        }
        
        // Test UnifiedCacheManager
        if (typeof window.UnifiedCacheManager !== 'undefined') {
            if (window.Logger) { window.Logger.info('✅ UnifiedCacheManager available', { page: 'test-monitoring', component: 'test-monitoring' }); }
        }
        
        // Test NotificationSystem
        if (typeof window.NotificationSystem !== 'undefined') {
            if (window.Logger) { window.Logger.info('✅ NotificationSystem available', { page: 'test-monitoring', component: 'test-monitoring' }); }
        }
        
        if (window.Logger) { window.Logger.info('✅ Test Monitoring data loaded', { page: 'test-monitoring', component: 'test-monitoring' }); }
    } catch (error) {
        if (window.Logger) { window.Logger.error('❌ Failed to load Test Monitoring data:', { page: 'test-monitoring', component: 'test-monitoring', error: 'error.message', stack: 'error.stack' }); }
        throw error;
    }
}

/**
 * Setup Test Monitoring event handlers
 */
function setupTestMonitoringHandlers() {
    if (window.Logger) { window.Logger.info('🔧 Setting up Test Monitoring handlers...', { page: 'test-monitoring', component: 'test-monitoring' }); }
    
    // Test handlers are defined below
    if (window.Logger) { window.Logger.info('✅ Test Monitoring handlers setup complete', { page: 'test-monitoring', component: 'test-monitoring' }); }
}

// ===== TEST FUNCTIONS =====

/**
 * Test Notification System
 */
function testNotification() {
    const resultsDiv = document.getElementById('test-results');
    let html = '<h6>תוצאות בדיקת התראות:</h6><ul>';
    
    if (typeof window.NotificationSystem !== 'undefined') {
        if (window.NotificationSystem) { window.NotificationSystem.show('בדיקת מערכת התראות', 'info'); }
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

/**
 * Register tables with UnifiedTableSystem
 * This function should be called after page load
 */
function registerTablesWithUnifiedTableSystem() {
    if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
        if (window.Logger) {
            window.Logger.warn('UnifiedTableSystem not available', {
                page: 'test-monitoring',
                component: 'table-registration'
            });
        }
        return;
    }
    
    // Find all tables with data-table-type attribute
    const tables = document.querySelectorAll('table[data-table-type]');
    
    tables.forEach(table => {
        const tableType = table.getAttribute('data-table-type');
        if (!tableType) return;
        
        // Skip if already registered
        if (window.UnifiedTableSystem.registry.isRegistered(tableType)) {
            if (window.Logger) {
                window.Logger.debug(`Table ${tableType} already registered`, {
                    page: 'test-monitoring',
                    component: 'table-registration'
                });
            }
            return;
        }
        
        try {
            // Get table rows
            const tbody = table.querySelector('tbody');
            if (!tbody) return;
            
            const rows = Array.from(tbody.querySelectorAll('tr'));
            if (rows.length === 0) return;
            
            // Extract data from rows
            const data = rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return cells.map(cell => cell.textContent.trim());
            });
            
            // Get column names from header
            const headerRow = table.querySelector('thead tr');
            const columns = headerRow ? 
                Array.from(headerRow.querySelectorAll('th')).map(th => {
                    const button = th.querySelector('button');
                    return button ? button.textContent.trim().replace(/↕/g, '').trim() : th.textContent.trim();
                }) :
                [];
            
            // Register with UnifiedTableSystem
            window.UnifiedTableSystem.registry.register(tableType, {
                dataGetter: () => data,
                updateFunction: (sortedData) => {
                    if (!tbody || !Array.isArray(sortedData)) return;
                    
                    // Rebuild rows from sorted data
                    const sortedRowsHTML = sortedData.map((sortedRow, idx) => {
                        // Try to find original row by first cell content
                        const firstCellText = sortedRow[0];
                        const originalRow = rows.find(row => {
                            const firstCell = row.querySelector('td');
                            return firstCell && firstCell.textContent.trim() === firstCellText;
                        });
                        return originalRow ? originalRow.outerHTML : '';
                    }).filter(html => html);
                    
                    tbody.innerHTML = sortedRowsHTML.join('');
                },
                tableSelector: `table[data-table-type="${tableType}"]`,
                columns: columns,
                sortable: true,
                filterable: false,
                defaultSort: { columnIndex: 0, direction: 'asc' }
            });
            
            if (window.Logger) {
                window.Logger.info(`Registered table ${tableType} with UnifiedTableSystem`, {
                    page: 'test-monitoring',
                    component: 'table-registration',
                    tableType: tableType,
                    rowCount: data.length
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error(`Error registering table ${tableType}`, {
                    page: 'test-monitoring',
                    component: 'table-registration',
                    tableType: tableType,
                    error: error.message,
                    stack: error.stack
                });
            }
        }
    });
    
    // Setup sort handlers after registration
    if (window.UnifiedTableSystem && window.UnifiedTableSystem.events) {
        window.UnifiedTableSystem.events.setupSortHandlers();
    }
}

window.testLogger = testLogger;

// Auto-initialize if page is loaded directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTestMonitoringPage);
} else {
    initializeTestMonitoringPage();
}


