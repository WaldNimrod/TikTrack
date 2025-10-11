/**
 * Test Header Only Page - JavaScript Functions
 * פונקציות JavaScript ספציפיות לעמוד בדיקת ראש הדף החדש
 * 
 * @version 3.2.0
 * @lastUpdated October 11, 2025
 * @author TikTrack Development Team
 */

console.log('🔧 test-header-only.js v3.2.0 loaded successfully!');

// ===== GLOBAL INITIALIZATION FUNCTION =====

/**
 * Initialize Test Header Page
 * Called by unified initialization system
 */
window.initializeTestHeaderPage = async function() {
    console.log('🧪 Test Header Page initialization starting...');
    
    try {
        // Wait for filter system to be ready
        let attempts = 0;
        while (!window.filterSystem && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.filterSystem) {
            console.log('✅ Filter system ready, registering tables...');
            registerTablesWithFilterSystem();
        } else {
            console.error('❌ Filter system not available after waiting');
        }
        
        // Run initial tests
        runInitialTests();
        
        // Load action buttons if available
        setTimeout(() => {
            if (typeof window.loadTableActionButtons === 'function') {
                console.log('🔧 Loading action buttons...');
                window.loadTableActionButtons();
            }
        }, 500);
        
        console.log('✅ Test Header Page initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing test header page:', error);
    }
};

// ===== TABLE REGISTRATION =====

/**
 * Register Tables with Filter System
 */
function registerTablesWithFilterSystem() {
    try {
        console.log('🔧 Registering tables with filter system...');
        
        if (!window.filterSystem || typeof window.filterSystem.registerTable !== 'function') {
            console.error('❌ Filter system not available for table registration');
            return;
        }
        
        // Register tickers table
        const tickersConfig = {
            tableId: 'tickersTable',
            fields: {
                symbol: 'symbol',
                status: 'status',
                has_trades: 'has_trades',
                current_price: 'current_price',
                change_percent: 'change_percent',
                investment_type: 'investment_type',
                name: 'name',
                remarks: 'remarks',
                date: 'date'
            }
        };
        
        console.log('🔧 Registering tickersTable with config:', tickersConfig);
        window.filterSystem.registerTable('tickersTable', tickersConfig);
        console.log('✅ Tickers table registered with filter system');
        
        // Register trade plans table
        const tradePlansConfig = {
            tableId: 'tradePlansTable',
            fields: {
                symbol: 'ticker',
                date: 'date',
                investment_type: 'investment_type',
                side: 'side',
                amount: 'amount',
                target: 'target',
                stop: 'stop',
                current: 'current',
                status: 'status',
                account: 'account'
            }
        };
        
        console.log('🔧 Registering tradePlansTable with config:', tradePlansConfig);
        window.filterSystem.registerTable('tradePlansTable', tradePlansConfig);
        console.log('✅ Trade plans table registered with filter system');
        
        // Apply initial filters if any
        if (window.filterSystem.currentFilters) {
            console.log('🔧 Applying initial filters...');
            window.filterSystem.applyAllFilters();
        }
        
    } catch (error) {
        console.error('❌ Error registering tables:', error);
    }
}

// ===== TEST FUNCTIONS =====

/**
 * Run Initial Tests
 */
function runInitialTests() {
    console.log('🧪 Running initial tests...');
    
    // Test 1: Check if filter system is available
    if (window.filterSystem) {
        console.log('✅ Test 1: Filter system available');
        updateTestStatus('filterComponentStatus', 'זמין ✅', true);
    } else {
        console.log('❌ Test 1: Filter system not available');
        updateTestStatus('filterComponentStatus', 'לא זמין ❌', false);
    }
    
    // Test 2: Check if tables exist
    const tickersTable = document.getElementById('tickersTable');
    const tradePlansTable = document.getElementById('tradePlansTable');
    
    if (tickersTable && tradePlansTable) {
        console.log('✅ Test 2: Both tables found in DOM');
        updateTestStatus('componentsIntegrationStatus', 'טבלאות נמצאו ✅', true);
    } else {
        console.log('❌ Test 2: Tables not found');
        updateTestStatus('componentsIntegrationStatus', 'טבלאות לא נמצאו ❌', false);
    }
    
    // Test 3: Count table rows
    if (tickersTable) {
        const tickersRows = tickersTable.querySelectorAll('tbody tr').length;
        console.log(`✅ Test 3: Tickers table has ${tickersRows} rows`);
        updateTestStatus('componentsCount', tickersRows.toString(), true);
    }
    
    if (tradePlansTable) {
        const tradePlansRows = tradePlansTable.querySelectorAll('tbody tr').length;
        console.log(`✅ Test 4: Trade plans table has ${tradePlansRows} rows`);
        updateTestStatus('servicesCount', tradePlansRows.toString(), true);
    }
    
    // Test 5: Performance metrics
    if (window.performance && window.performance.now) {
        const loadTime = Math.round(window.performance.now());
        console.log(`✅ Test 5: Page load time: ${loadTime}ms`);
        updateTestStatus('loadTime', `${loadTime}ms`, true);
    }
    
    console.log('✅ Initial tests completed');
}

/**
 * Update Test Status Display
 */
function updateTestStatus(elementId, text, success) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
        element.style.color = success ? 'green' : 'red';
        element.style.fontWeight = 'bold';
    }
}

// ===== TEST CONTROL FUNCTIONS =====

/**
 * Run Unit Tests
 */
window.runUnitTests = function() {
    console.log('🧪 Running unit tests...');
    
    // Test Header System
    if (window.HeaderSystemClass) {
        console.log('✅ HeaderSystemClass available');
        updateTestStatus('headerComponentStatus', 'זמין ✅', true);
    } else {
        console.log('❌ HeaderSystemClass not available');
        updateTestStatus('headerComponentStatus', 'לא זמין ❌', false);
    }
    
    // Test Filter System
    if (window.filterSystem) {
        console.log('✅ Filter System available');
        updateTestStatus('filterComponentStatus', 'זמין ✅', true);
        
        // Test filter functions
        if (typeof window.filterSystem.applyAllFilters === 'function') {
            console.log('✅ applyAllFilters function available');
        }
        
        if (typeof window.filterSystem.registerTable === 'function') {
            console.log('✅ registerTable function available');
        }
    }
    
    // Test UnifiedCacheManager
    if (window.UnifiedCacheManager) {
        console.log('✅ UnifiedCacheManager available');
        updateTestStatus('stateServiceStatus', 'זמין ✅', true);
    }
    
    if (typeof window.showNotification === 'function') {
        window.showNotification('בדיקות יחידה הושלמו', 'success', 'בדיקות', 3000, 'system');
    }
};

/**
 * Run Integration Tests
 */
window.runIntegrationTests = function() {
    console.log('🧪 Running integration tests...');
    
    // Test filter integration with tables
    if (window.filterSystem) {
        const registeredTables = Object.keys(window.filterSystem.registeredTables || {});
        console.log(`✅ Registered tables: ${registeredTables.join(', ')}`);
        updateTestStatus('fullIntegrationStatus', `${registeredTables.length} טבלאות רשומות ✅`, true);
    }
    
    if (typeof window.showNotification === 'function') {
        window.showNotification('בדיקות אינטגרציה הושלמו', 'success', 'בדיקות', 3000, 'system');
    }
};

/**
 * Run Performance Tests
 */
window.runPerformanceTests = function() {
    console.log('🧪 Running performance tests...');
    
    const perfData = {
        loadTime: window.performance ? Math.round(window.performance.now()) : 'N/A',
        memory: window.performance && window.performance.memory ? 
               Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'
    };
    
    console.log('📊 Performance data:', perfData);
    
    updateTestStatus('loadTime', `${perfData.loadTime}ms`, true);
    updateTestStatus('memoryUsage', perfData.memory, true);
    updateTestStatus('initializationStatus', 'הושלם ✅', true);
    
    if (typeof window.showNotification === 'function') {
        window.showNotification('בדיקות ביצועים הושלמו', 'success', 'בדיקות', 3000, 'system');
    }
};

/**
 * Run All Tests
 */
window.runAllTests = function() {
    console.log('🧪 Running all tests...');
    
    window.runUnitTests();
    setTimeout(() => window.runIntegrationTests(), 500);
    setTimeout(() => window.runPerformanceTests(), 1000);
    
    if (typeof window.showNotification === 'function') {
        window.showNotification('כל הבדיקות הושלמו', 'success', 'בדיקות', 3000, 'system');
    }
};

/**
 * Reset System
 */
window.resetSystem = function() {
    console.log('🔄 Resetting system...');
    
    // Clear all filters
    if (window.filterSystem && typeof window.clearAllFilters === 'function') {
        window.clearAllFilters();
    }
    
    // Reset all test statuses
    const statusElements = document.querySelectorAll('[id$="Status"], [id$="Count"], [id$="Time"]');
    statusElements.forEach(el => {
        el.textContent = 'טוען...';
        el.style.color = '';
        el.style.fontWeight = '';
    });
    
    if (typeof window.showNotification === 'function') {
        window.showNotification('המערכת אופסה', 'info', 'איפוס', 2000, 'system');
    }
    
    // Re-run initial tests
    setTimeout(() => runInitialTests(), 500);
};

/**
 * Copy Detailed Log
 */
window.copyDetailedLog = function() {
    console.log('📋 Copying detailed log...');
    
    const log = {
        timestamp: new Date().toISOString(),
        filterSystem: !!window.filterSystem,
        headerSystem: !!window.HeaderSystemClass,
        cacheManager: !!window.UnifiedCacheManager,
        registeredTables: window.filterSystem ? Object.keys(window.filterSystem.registeredTables || {}) : [],
        performance: {
            loadTime: window.performance ? Math.round(window.performance.now()) : 'N/A',
            memory: window.performance && window.performance.memory ? 
                   Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'
        }
    };
    
    const logText = JSON.stringify(log, null, 2);
    
    // Copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(logText).then(() => {
            console.log('✅ Log copied to clipboard');
            if (typeof window.showNotification === 'function') {
                window.showNotification('לוג הועתק ללוח', 'success', 'העתקה', 2000, 'system');
            }
        }).catch(err => {
            console.error('❌ Failed to copy log:', err);
        });
    } else {
        console.log('📋 Log text:', logText);
        alert('לוג מפורט:\n\n' + logText);
    }
};

// ===== SECTION TOGGLE FUNCTIONS =====

/**
 * Toggle Top Section
 */
window.toggleTopSection = function() {
    const section = document.getElementById('top-section');
    if (section) {
        section.classList.toggle('collapsed');
        console.log('🔧 Top section toggled');
    }
};

/**
 * Toggle Section
 */
window.toggleSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
        console.log(`🔧 Section ${sectionId} toggled`);
    }
};

console.log('✅ test-header-only.js v3.2.0 initialization complete');
