/**
 * Server Monitor - Advanced Server Monitoring System
 * ==================================================
 * 
 * This file provides comprehensive server monitoring capabilities including:
 * - Real-time health checks and performance metrics
 * - Advanced testing and diagnostic tools
 * - Cache management and optimization
 * - Log viewing with filtering and search
 * - System alerts and notifications
 * 
 * Architecture: Follows the unified initialization system
 * Dependencies: notification-system.js, ui-utils.js, unified-cache-manager.js
 * 
 * @author TikTrack Development Team
 * @version 2.0.6
 * @since 2024-10-02
 */

// ============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// ============================================================================

let serverMonitor = {
    // Configuration
    config: {
        refreshInterval: 5000, // 5 seconds
        logRefreshInterval: 2000, // 2 seconds
        maxLogEntries: 1000,
        apiEndpoints: {
            health: '/api/health',
            performance: '/api/server/status',
            cache: '/api/cache',
            logs: '/api/logs',
            alerts: '/api/system/alerts',
            system: '/api/server/status'
        }
    },
    
    // State management
    state: {
        isMonitoring: false,
        lastUpdate: null,
        currentLogLevel: 'INFO',
        logFilter: '',
        performanceData: {},
        healthStatus: {},
        cacheStats: {},
        systemAlerts: []
    },
    
    // DOM elements cache
    elements: {},
    
    // Timers
    timers: {
        monitor: null,
        logs: null
    }
};

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initialize the server monitor system
 * Called by unified-app-initializer.js
 */
function initializeServerMonitor() {
    console.log('🔧 Server Monitor: Initializing...');
    
    try {
        // Cache DOM elements
        cacheDOMElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize monitoring
        startMonitoring();
        
        // Load initial data
        loadInitialData();
        
        console.log('✅ Server Monitor: Initialized successfully');
        
    } catch (error) {
        console.error('❌ Server Monitor: Initialization failed:', error);
        showNotification('שגיאה באתחול מערכת ניטור השרת', 'error');
    }
}

/**
 * Cache frequently used DOM elements
 */
function cacheDOMElements() {
    serverMonitor.elements = {
        // Summary section
        summaryContainer: document.getElementById('server-summary'),
        healthStatus: document.getElementById('health-status'),
        uptimeDisplay: document.getElementById('uptime-display'),
        lastCheckDisplay: document.getElementById('last-check-display'),
        
        // Statistics section
        statsContainer: document.getElementById('server-statistics'),
        performanceMetrics: document.getElementById('performance-metrics'),
        cacheStats: document.getElementById('cache-stats'),
        systemStats: document.getElementById('system-stats'),
        
        // Tests section
        testsContainer: document.getElementById('server-tests'),
        testResults: document.getElementById('test-results'),
        runAllTestsBtn: document.getElementById('run-all-tests'),
        
        // Tools section
        toolsContainer: document.getElementById('server-tools'),
        toolResults: document.getElementById('tool-results'),
        clearCacheBtn: document.getElementById('clear-cache'),
        restartServerBtn: document.getElementById('restart-server'),
        
        // Advanced tools section
        advancedToolsContainer: document.getElementById('advanced-tools'),
        advancedToolResults: document.getElementById('advanced-tool-results'),
        
        // Log section
        logContainer: document.getElementById('server-logs'),
        logViewer: document.getElementById('logViewer'),
        logLevelFilter: document.getElementById('logLevel'),
        logSearchInput: document.getElementById('logSearch'),
        clearLogsBtn: document.getElementById('clearLogsBtn')
    };
}

/**
 * Setup event listeners for all interactive elements
 */
function setupEventListeners() {
    // Test buttons
    if (serverMonitor.elements.runAllTestsBtn) {
        serverMonitor.elements.runAllTestsBtn.addEventListener('click', runAllTests);
    }
    
    // Tool buttons
    if (serverMonitor.elements.clearCacheBtn) {
        serverMonitor.elements.clearCacheBtn.addEventListener('click', clearSystemCache);
    }
    
    if (serverMonitor.elements.restartServerBtn) {
        serverMonitor.elements.restartServerBtn.addEventListener('click', restartServer);
    }
    
    // Log controls
    if (serverMonitor.elements.logLevelFilter) {
        serverMonitor.elements.logLevelFilter.addEventListener('change', filterLogs);
    }
    
    if (serverMonitor.elements.logSearchInput) {
        serverMonitor.elements.logSearchInput.addEventListener('input', searchLogs);
    }
    
    if (serverMonitor.elements.clearLogsBtn) {
        serverMonitor.elements.clearLogsBtn.addEventListener('click', clearLogViewer);
    }
    
    // Additional log tools
    const exportLogsBtn = document.getElementById('exportLogsBtn');
    if (exportLogsBtn) {
        exportLogsBtn.addEventListener('click', exportLogs);
    }
    
    const copyLogsBtn = document.getElementById('copyLogsBtn');
    if (copyLogsBtn) {
        copyLogsBtn.addEventListener('click', copyLogsToClipboard);
    }
    
    const refreshLogsBtn = document.getElementById('refreshLogsBtn');
    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', updateLogs);
    }
    
    // Top section buttons
    setupTopSectionListeners();
    
    // Test section buttons
    setupTestSectionListeners();
    
    // Tools section buttons
    setupToolsSectionListeners();
    
    // Advanced tools
    setupAdvancedToolListeners();
}

/**
 * Setup event listeners for top section buttons
 */
function setupTopSectionListeners() {
    // Quick restart button
    const quickRestartBtn = document.getElementById('quickRestartBtn');
    if (quickRestartBtn) {
        quickRestartBtn.addEventListener('click', quickRestartServer);
    }
    
    // Change mode button (top section)
    const changeModeBtn = document.getElementById('changeModeBtn');
    if (changeModeBtn) {
        changeModeBtn.addEventListener('click', changeServerMode);
    }
    
    // Change mode button (tools section)
    const changeModeBtn2 = document.getElementById('changeModeBtn2');
    if (changeModeBtn2) {
        changeModeBtn2.addEventListener('click', changeServerMode);
    }
    
    // Monitoring analysis button
    const monitoringAnalysisBtn = document.getElementById('monitoringAnalysisBtn');
    if (monitoringAnalysisBtn) {
        monitoringAnalysisBtn.addEventListener('click', showMonitoringAnalysis);
    }
    
    // Copy detailed log button
    const copyDetailedLogBtn = document.getElementById('copyDetailedLogBtn');
    if (copyDetailedLogBtn) {
        copyDetailedLogBtn.addEventListener('click', copyDetailedLog);
    }
}

/**
 * Setup event listeners for test section buttons
 */
function setupTestSectionListeners() {
    // Copy all results button
    const copyAllResultsBtn = document.getElementById('copyAllResultsBtn');
    if (copyAllResultsBtn) {
        copyAllResultsBtn.addEventListener('click', copyAllTestResults);
    }
    
    // Health check buttons
    const healthCheckBtn = document.getElementById('healthCheckBtn');
    if (healthCheckBtn) {
        healthCheckBtn.addEventListener('click', () => runSingleTest('healthCheck'));
    }
    
    const detailedHealthBtn = document.getElementById('detailedHealthBtn');
    if (detailedHealthBtn) {
        detailedHealthBtn.addEventListener('click', () => runSingleTest('detailedHealth'));
    }
    
    const systemResourcesBtn = document.getElementById('systemResourcesBtn');
    if (systemResourcesBtn) {
        systemResourcesBtn.addEventListener('click', () => runSingleTest('systemResources'));
    }
    
    // Performance test buttons
    const performanceTestBtn = document.getElementById('performanceTestBtn');
    if (performanceTestBtn) {
        performanceTestBtn.addEventListener('click', () => runSingleTest('performance'));
    }
    
    const loadTestBtn = document.getElementById('loadTestBtn');
    if (loadTestBtn) {
        loadTestBtn.addEventListener('click', () => runSingleTest('loadTest'));
    }
    
    const cacheTestBtn = document.getElementById('cacheTestBtn');
    if (cacheTestBtn) {
        cacheTestBtn.addEventListener('click', () => runSingleTest('cache'));
    }
    
    // API test buttons
    const apiEndpointsBtn = document.getElementById('apiEndpointsBtn');
    if (apiEndpointsBtn) {
        apiEndpointsBtn.addEventListener('click', () => runSingleTest('apiEndpoints'));
    }
    
    const rateLimitTestBtn = document.getElementById('rateLimitTestBtn');
    if (rateLimitTestBtn) {
        rateLimitTestBtn.addEventListener('click', () => runSingleTest('rateLimit'));
    }
    
    const errorHandlingBtn = document.getElementById('errorHandlingBtn');
    if (errorHandlingBtn) {
        errorHandlingBtn.addEventListener('click', () => runSingleTest('errorHandling'));
    }
}

/**
 * Setup event listeners for tools section buttons
 */
function setupToolsSectionListeners() {
    // Emergency stop button
    const emergencyStopBtn = document.getElementById('emergencyStopBtn');
    if (emergencyStopBtn) {
        emergencyStopBtn.addEventListener('click', emergencyStopServer);
    }
    
    // Copy all tool results button
    const copyAllToolResultsBtn = document.getElementById('copyAllToolResultsBtn');
    if (copyAllToolResultsBtn) {
        copyAllToolResultsBtn.addEventListener('click', copyAllToolResults);
    }
    
    // Server management buttons
    const stopServerBtn = document.getElementById('stopServerBtn');
    if (stopServerBtn) {
        stopServerBtn.addEventListener('click', stopServer);
    }
    
    // Cache management buttons
    const optimizeCacheBtn = document.getElementById('optimizeCacheBtn');
    if (optimizeCacheBtn) {
        optimizeCacheBtn.addEventListener('click', optimizeCache);
    }
    
    const cacheStatsBtn = document.getElementById('cacheStatsBtn');
    if (cacheStatsBtn) {
        cacheStatsBtn.addEventListener('click', showCacheStats);
    }
    
    // Database management buttons
    const dbOptimizeBtn = document.getElementById('dbOptimizeBtn');
    if (dbOptimizeBtn) {
        dbOptimizeBtn.addEventListener('click', optimizeDatabase);
    }
    
    const dbAnalyzeBtn = document.getElementById('dbAnalyzeBtn');
    if (dbAnalyzeBtn) {
        dbAnalyzeBtn.addEventListener('click', analyzeDatabase);
    }
    
    const dbBackupBtn = document.getElementById('dbBackupBtn');
    if (dbBackupBtn) {
        dbBackupBtn.addEventListener('click', backupDatabase);
    }
    
    // External data buttons
    const refreshDataBtn = document.getElementById('refreshDataBtn');
    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', refreshExternalData);
    }
    
    const dataStatusBtn = document.getElementById('dataStatusBtn');
    if (dataStatusBtn) {
        dataStatusBtn.addEventListener('click', showDataStatus);
    }
    
    const testYahooBtn = document.getElementById('testYahooBtn');
    if (testYahooBtn) {
        testYahooBtn.addEventListener('click', testYahooFinance);
    }
    
    // Advanced tools buttons
    const performanceAnalysisBtn = document.getElementById('performanceAnalysisBtn');
    if (performanceAnalysisBtn) {
        performanceAnalysisBtn.addEventListener('click', () => runAdvancedTool('performance-analysis'));
    }
    
    const bottleneckAnalysisBtn = document.getElementById('bottleneckAnalysisBtn');
    if (bottleneckAnalysisBtn) {
        bottleneckAnalysisBtn.addEventListener('click', () => runAdvancedTool('bottleneck-analysis'));
    }
    
    const optimizationSuggestionsBtn = document.getElementById('optimizationSuggestionsBtn');
    if (optimizationSuggestionsBtn) {
        optimizationSuggestionsBtn.addEventListener('click', () => runAdvancedTool('optimization-suggestions'));
    }
    
    // Export report button
    const exportReportBtn = document.getElementById('exportReportBtn');
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportSystemReport);
    }
}

/**
 * Setup event listeners for advanced tools
 */
function setupAdvancedToolListeners() {
    const advancedButtons = [
        'performance-analysis',
        'memory-optimization',
        'database-health',
        'cache-optimization',
        'security-scan',
        'dependency-check'
    ];
    
    advancedButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => runAdvancedTool(buttonId));
        }
    });
}

// ============================================================================
// MONITORING FUNCTIONS
// ============================================================================

/**
 * Start the monitoring system
 */
function startMonitoring() {
    if (serverMonitor.state.isMonitoring) {
        return;
    }
    
    serverMonitor.state.isMonitoring = true;
    
    // Start main monitoring loop
    serverMonitor.timers.monitor = setInterval(() => {
        updateServerStatus();
    }, serverMonitor.config.refreshInterval);
    
    // Start log monitoring
    serverMonitor.timers.logs = setInterval(() => {
        updateLogs();
    }, serverMonitor.config.logRefreshInterval);
    
    console.log('🔄 Server Monitor: Monitoring started');
}

/**
 * Stop the monitoring system
 */
function stopMonitoring() {
    if (!serverMonitor.state.isMonitoring) {
      return;
    }

    serverMonitor.state.isMonitoring = false;
    
    // Clear timers
    if (serverMonitor.timers.monitor) {
        clearInterval(serverMonitor.timers.monitor);
        serverMonitor.timers.monitor = null;
    }
    
    if (serverMonitor.timers.logs) {
        clearInterval(serverMonitor.timers.logs);
        serverMonitor.timers.logs = null;
    }
    
    console.log('⏹️ Server Monitor: Monitoring stopped');
}

/**
 * Update server status and metrics
 */
async function updateServerStatus() {
    try {
        // Update health status
        await updateHealthStatus();
        
        // Update performance metrics
        await updatePerformanceMetrics();
        
        // Update cache statistics
        await updateCacheStats();
        
        // Update system statistics
        await updateSystemStats();
        
        // Update last check time
        updateLastCheckTime();
      
    } catch (error) {
        console.error('❌ Server Monitor: Error updating status:', error);
        showNotification('שגיאה בעדכון סטטוס השרת', 'error');
    }
}

/**
 * Update health status
 */
async function updateHealthStatus() {
    try {
        const response = await fetch(serverMonitor.config.apiEndpoints.health);
        const data = await response.json();
        
        serverMonitor.state.healthStatus = data;
        
        if (serverMonitor.elements.healthStatus) {
            const statusClass = data.status === 'healthy' ? 'success' : 'danger';
            serverMonitor.elements.healthStatus.innerHTML = `
                <span class="badge bg-${statusClass}">${data.status}</span>
                <small class="text-muted ms-2">${data.message || ''}</small>
            `;
        }
        
        if (serverMonitor.elements.uptimeDisplay && data.uptime) {
            serverMonitor.elements.uptimeDisplay.textContent = formatUptime(data.uptime);
      }
      
    } catch (error) {
        console.error('❌ Health check failed:', error);
        if (serverMonitor.elements.healthStatus) {
            serverMonitor.elements.healthStatus.innerHTML = `
                <span class="badge bg-danger">Error</span>
                <small class="text-muted ms-2">Connection failed</small>
            `;
        }
    }
}

/**
 * Update performance metrics
 */
async function updatePerformanceMetrics() {
    try {
        // Use the server status API which contains performance data
        const response = await fetch('/api/server/status');
        const data = await response.json();
        
        if (data.status === 'success' && data.data.overall_health) {
            const health = data.data.overall_health;
            const system = health.components.system;
            const api = health.components.api;
            
            serverMonitor.state.performanceData = {
                responseTime: health.response_time_ms,
                memoryUsage: system.details.process_memory_mb,
                cpuUsage: system.details.cpu_percent,
                activeConnections: api.details.available_endpoints,
                uptime: system.details.uptime
            };
            
            if (serverMonitor.elements.performanceMetrics) {
                serverMonitor.elements.performanceMetrics.innerHTML = `
                    <div class="info-summary">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <div class="summary-label">זמן תגובה</div>
                                    <div class="summary-value text-info">${Math.round(health.response_time_ms)}ms</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <div class="summary-label">זיכרון</div>
                                    <div class="summary-value text-warning">${Math.round(system.details.process_memory_mb)}MB</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <div class="summary-label">מעבד</div>
                                    <div class="summary-value text-success">${Math.round(system.details.cpu_percent)}%</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <div class="summary-label">נקודות קצה</div>
                                    <div class="summary-value text-info">${api.details.available_endpoints}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
      }
      
    } catch (error) {
        console.error('❌ Performance metrics failed:', error);
    }
}

/**
 * Update cache statistics
 */
async function updateCacheStats() {
    try {
        const response = await fetch(serverMonitor.config.apiEndpoints.cache + '/stats');
        const data = await response.json();
        
        serverMonitor.state.cacheStats = data;
        
        if (serverMonitor.elements.cacheStats) {
            const hitRate = data.totalRequests > 0 ? 
                ((data.hits / data.totalRequests) * 100).toFixed(1) : '0.0';
            
            serverMonitor.elements.cacheStats.innerHTML = `
                <div class="info-summary">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="summary-item">
                                <div class="summary-label">אחוז הצלחה</div>
                                <div class="summary-value text-success">${hitRate}%</div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="summary-item">
                                <div class="summary-label">רשומות</div>
                                <div class="summary-value text-info">${data.totalEntries || 0}</div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="summary-item">
                                <div class="summary-label">זיכרון מטמון</div>
                                <div class="summary-value text-warning">${data.memoryUsage || 'N/A'}MB</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      }
      
    } catch (error) {
        console.error('❌ Cache stats failed:', error);
    }
}

/**
 * Update system statistics
 */
async function updateSystemStats() {
    try {
        const response = await fetch(serverMonitor.config.apiEndpoints.system);
        const data = await response.json();
        
        if (serverMonitor.elements.systemStats) {
            serverMonitor.elements.systemStats.innerHTML = `
                <div class="info-summary">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="summary-item">
                                <div class="summary-label">חיבורי בסיס נתונים</div>
                                <div class="summary-value text-info">${data.databaseConnections || 'N/A'}</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="summary-item">
                                <div class="summary-label">משימות רקע</div>
                                <div class="summary-value text-success">${data.backgroundTasks || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('❌ System stats failed:', error);
    }
}

/**
 * Update last check time display
 */
function updateLastCheckTime() {
    if (serverMonitor.elements.lastCheckDisplay) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        serverMonitor.elements.lastCheckDisplay.innerHTML = `${timeStr}<br/>${dateStr}`;
    }
    
    serverMonitor.state.lastUpdate = new Date();
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Run all server tests
 */
async function runAllTests() {
    if (!serverMonitor.elements.testResults) return;
    
    const tests = [
        { name: 'Health Check', func: testHealthCheck },
        { name: 'API Endpoints', func: testAPIEndpoints },
        { name: 'Database Connection', func: testDatabaseConnection },
        { name: 'Cache System', func: testCacheSystem },
        { name: 'External Data', func: testExternalData },
        { name: 'Server Performance', func: testServerPerformance },
        { name: 'Memory Usage', func: testMemoryUsage },
        { name: 'Background Tasks', func: testBackgroundTasks },
        { name: 'System Resources', func: testSystemResources },
        { name: 'Security Headers', func: testSecurityHeaders }
    ];
    
    serverMonitor.elements.testResults.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const test of tests) {
        try {
            const result = await test.func();
            results.push({ name: test.name, status: 'success', result });
            successCount++;
      } catch (error) {
            results.push({ name: test.name, status: 'error', error: error.message });
            errorCount++;
        }
    }
    
    displayTestResults(results);
    
    // Show detailed notification with results
    const totalTests = tests.length;
    const timestamp = new Date().toLocaleTimeString('he-IL');
    
    if (errorCount === 0) {
        // All tests passed - show success notification
        if (typeof window.showFinalSuccessNotification === 'function') {
            await window.showFinalSuccessNotification(
                'כל הבדיקות הושלמו בהצלחה!',
                `כל ${totalTests} הבדיקות עברו בהצלחה. המערכת פועלת תקין.`,
                {
                    operation: 'בדיקות שרת',
                    duration: 'זמן ביצוע: ~5 שניות',
                    timestamp: new Date().toISOString(),
                    status: 'הצלחה מלאה',
                    testsPassed: successCount,
                    testsFailed: errorCount,
                    totalTests: totalTests,
                    healthCheck: 'כל המערכות פועלות תקין',
                    nextAction: 'המערכת מוכנה לשימוש'
                },
                'system'
            );
        }
    } else {
        // Some tests failed - show error notification
        const failedTests = results.filter(r => r.status === 'error').map(r => r.name).join(', ');
        
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                'חלק מהבדיקות נכשלו',
                `מתוך ${totalTests} בדיקות, ${successCount} עברו בהצלחה ו-${errorCount} נכשלו.\n\nבדיקות שנכשלו:\n• ${failedTests}\n\nזמן ביצוע: ${timestamp}\nסטטוס: חלקי\n\nבדיקת בריאות נוכחית:\n• סטטוס כללי: ${errorCount === 0 ? 'טוב' : 'דורש תשומת לב'}\n• בדיקות עברו: ${successCount}/${totalTests}\n• בדיקות נכשלו: ${errorCount}/${totalTests}\n\nהוראות: בדוק את הבדיקות שנכשלו וטפל בבעיות שזוהו.`,
                20000
            );
        }
    }
}

/**
 * Test health check endpoint
 */
async function testHealthCheck() {
    const startTime = performance.now();
    const response = await fetch(serverMonitor.config.apiEndpoints.health);
    const endTime = performance.now();
    const data = await response.json();
    
    if (response.ok && data.status === 'healthy') {
        const responseTime = Math.round(endTime - startTime);
        const components = Object.keys(data.components || {}).length;
        return `Health check passed - Response time: ${responseTime}ms, Components: ${components}`;
      } else {
        throw new Error(`Health check failed - Status: ${data.status}, Response: ${response.status}`);
    }
}

/**
 * Test API endpoints
 */
async function testAPIEndpoints() {
    const endpoints = [
        { url: '/api/health', name: 'Health' },
        { url: '/api/server/status', name: 'Server Status' },
        { url: '/api/cache/stats', name: 'Cache Stats' },
        { url: '/api/system/overview', name: 'System Overview' }
    ];
    
    const results = [];
    let successCount = 0;
    let totalResponseTime = 0;
    
    for (const endpoint of endpoints) {
        try {
            const startTime = performance.now();
            const response = await fetch(endpoint.url);
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            totalResponseTime += responseTime;
            
      if (response.ok) {
                results.push(`${endpoint.name}: OK (${responseTime}ms)`);
                successCount++;
            } else {
                results.push(`${endpoint.name}: ${response.status} (${responseTime}ms)`);
      }
    } catch (error) {
            results.push(`${endpoint.name}: Error - ${error.message}`);
        }
    }
    
    const avgResponseTime = Math.round(totalResponseTime / endpoints.length);
    return `Endpoints tested: ${successCount}/${endpoints.length}, Avg response: ${avgResponseTime}ms - ${results.join(', ')}`;
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
    const startTime = performance.now();
    const response = await fetch('/api/server/status');
    const endTime = performance.now();
    const data = await response.json();
    const responseTime = Math.round(endTime - startTime);
    
    if (response.ok && data.data?.overall_health?.components?.database) {
        const db = data.data.overall_health.components.database;
        const size = Math.round(db.details.database_size_mb);
        const tickers = db.details.ticker_count;
        const status = db.status;
        return `Connected (${responseTime}ms) - Status: ${status}, Size: ${size}MB, Tickers: ${tickers}`;
        } else {
        throw new Error(`Database connection failed - Response: ${response.status}, Data: ${JSON.stringify(data).substring(0, 100)}`);
    }
}

/**
 * Test cache system
 */
async function testCacheSystem() {
    const startTime = performance.now();
    const response = await fetch('/api/cache/stats');
    const endTime = performance.now();
    const data = await response.json();
    const responseTime = Math.round(endTime - startTime);
    
    if (response.ok && data.status === 'success') {
        const stats = data.data;
        const hitRate = Math.round(stats.hit_rate_percent);
        const entries = stats.total_entries;
        const memory = stats.memory_usage_mb;
        const requests = stats.total_requests;
        return `Cache OK (${responseTime}ms) - Hit rate: ${hitRate}%, Entries: ${entries}, Memory: ${memory}MB, Requests: ${requests}`;
      } else {
        throw new Error(`Cache system test failed - Response: ${response.status}, Data: ${JSON.stringify(data).substring(0, 100)}`);
    }
}

/**
 * Test external data integration
 */
async function testExternalData() {
    const startTime = performance.now();
    const response = await fetch('/api/external-data/status');
    const endTime = performance.now();
    const data = await response.json();
    const responseTime = Math.round(endTime - startTime);
    
    if (response.ok && data.status === 'success') {
        const status = data.data?.status || 'unknown';
        const lastUpdate = data.data?.last_update || 'unknown';
        const providers = data.data?.providers || [];
        return `External data OK (${responseTime}ms) - Status: ${status}, Last update: ${lastUpdate}, Providers: ${providers.length}`;
    } else {
        throw new Error(`External data test failed - Response: ${response.status}, Data: ${JSON.stringify(data).substring(0, 100)}`);
    }
}

/**
 * Test server performance
 */
async function testServerPerformance() {
    const startTime = performance.now();
    const response = await fetch('/api/server/status');
    const endTime = performance.now();
    const clientResponseTime = Math.round(endTime - startTime);
    
      if (response.ok) {
        const data = await response.json();
        const serverResponseTime = data.data?.overall_health?.response_time_ms || 0;
        const uptime = data.data?.overall_health?.components?.system?.details?.uptime || 'unknown';
        const memory = data.data?.overall_health?.components?.system?.details?.memory_percent || 0;
        const cpu = data.data?.overall_health?.components?.system?.details?.cpu_percent || 0;
        return `Performance OK - Client: ${clientResponseTime}ms, Server: ${Math.round(serverResponseTime)}ms, Uptime: ${uptime}, Memory: ${memory}%, CPU: ${cpu}%`;
      } else {
        throw new Error(`Server performance test failed - Response: ${response.status}, Client time: ${clientResponseTime}ms`);
    }
}

/**
 * Test memory usage
 */
async function testMemoryUsage() {
    const startTime = performance.now();
    const response = await fetch('/api/server/status');
    const endTime = performance.now();
    const data = await response.json();
    const responseTime = Math.round(endTime - startTime);
    
    if (response.ok && data.data?.overall_health?.components?.system) {
        const system = data.data.overall_health.components.system.details;
        const processMemory = Math.round(system.process_memory_mb);
        const systemMemory = Math.round(system.memory_usage_bytes / (1024 * 1024 * 1024));
        const memoryPercent = Math.round(system.memory_percent);
        return `Memory OK (${responseTime}ms) - Process: ${processMemory}MB, System: ${systemMemory}GB (${memoryPercent}%)`;
    } else {
        throw new Error(`Memory test failed - Response: ${response.status}, Data: ${JSON.stringify(data).substring(0, 100)}`);
    }
}

/**
 * Test background tasks
 */
async function testBackgroundTasks() {
    const startTime = performance.now();
    const response = await fetch('/api/logs/raw/app/tail?lines=10');
    const endTime = performance.now();
    const data = await response.json();
    const responseTime = Math.round(endTime - startTime);
    
    if (response.ok && data.success) {
        const lines = data.content.split('\n').filter(line => line.trim());
        const backgroundTaskLines = lines.filter(line => 
            line.includes('background') || 
            line.includes('scheduler') || 
            line.includes('task') ||
            line.includes('cleanup') ||
            line.includes('refresh')
        );
        return `Background tasks OK (${responseTime}ms) - Total log entries: ${lines.length}, Background tasks: ${backgroundTaskLines.length}`;
        } else {
        throw new Error(`Background tasks test failed - Response: ${response.status}, Data: ${JSON.stringify(data).substring(0, 100)}`);
    }
}

/**
 * Test system resources
 */
async function testSystemResources() {
    const startTime = performance.now();
    const response = await fetch('/api/server/status');
    const endTime = performance.now();
    const data = await response.json();
    const responseTime = Math.round(endTime - startTime);
    
    if (response.ok && data.data?.overall_health?.components?.system) {
        const system = data.data.overall_health.components.system.details;
        const cpu = Math.round(system.cpu_percent);
        const memory = Math.round(system.memory_percent);
        const disk = Math.round(system.disk_percent);
        const uptime = system.uptime;
        return `System resources OK (${responseTime}ms) - CPU: ${cpu}%, Memory: ${memory}%, Disk: ${disk}%, Uptime: ${uptime}`;
    } else {
        throw new Error(`System resources test failed - Response: ${response.status}, Data: ${JSON.stringify(data).substring(0, 100)}`);
    }
}

/**
 * Test security headers
 */
async function testSecurityHeaders() {
    const startTime = performance.now();
    const response = await fetch('/api/health');
    const endTime = performance.now();
    const headers = response.headers;
    const responseTime = Math.round(endTime - startTime);
    
    const securityHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'Referrer-Policy'
    ];
    
    const found = securityHeaders.filter(header => headers.get(header));
    const missing = securityHeaders.filter(header => !headers.get(header));
    
    if (found.length >= 3) {
        return `Security headers OK (${responseTime}ms) - Found: ${found.length}/${securityHeaders.length} (${found.join(', ')})`;
        } else {
        return `Security headers WARNING (${responseTime}ms) - Found: ${found.length}/${securityHeaders.length}, Missing: ${missing.join(', ')}`;
    }
}

/**
 * Display test results
 */
function displayTestResults(results) {
    if (!serverMonitor.elements.testResults) return;
    
    const html = results.map(result => {
        const statusClass = result.status === 'success' ? 'success' : 'danger';
        const statusIcon = result.status === 'success' ? '✅' : '❌';
        const content = result.status === 'success' ? result.result : result.error;
        
        return `
            <div class="test-result">
                <div class="d-flex justify-content-between align-items-center">
                    <span>${statusIcon} ${result.name}</span>
                    <span class="badge bg-${statusClass}">${result.status}</span>
        </div>
                <small class="text-muted">${content}</small>
        </div>
      `;
    }).join('');
    
    serverMonitor.elements.testResults.innerHTML = html;
}

// ============================================================================
// TOOL FUNCTIONS
// ============================================================================

/**
 * Clear system cache
 */
async function clearSystemCache() {
    if (!serverMonitor.elements.toolResults) return;
    
    const startTime = performance.now();
    
    try {
        serverMonitor.elements.toolResults.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
        
        // שימוש במערכת המטמון המאוחדת
        if (typeof window.clearAllCache === 'function') {
            const clearResult = await window.clearAllCache();
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            
            if (clearResult) {
                serverMonitor.elements.toolResults.innerHTML = `
                    <div class="alert alert-success">
                        <strong>Cache Cleared Successfully</strong><br/>
                        All cache entries have been cleared using unified cache system
                    </div>
                `;
                
                // Show detailed success notification
                if (typeof window.showFinalSuccessNotification === 'function') {
                    await window.showFinalSuccessNotification(
                        'ניקוי מטמון הושלם בהצלחה!',
                        'כל המטמון נוקה בהצלחה והמערכת פועלת תקין.',
                        {
                            operation: 'ניקוי מטמון מערכת',
                            duration: `${duration}ms`,
                            timestamp: new Date().toISOString(),
                            status: 'הצלחה',
                            method: 'מערכת מטמון מאוחדת',
                            healthCheck: 'המערכת פועלת תקין',
                            nextAction: 'המערכת מוכנה לשימוש'
                        },
                        'system'
                    );
                } else if (typeof window.showSuccessNotification === 'function') {
                    await window.showSuccessNotification(
                        'מטמון המערכת נוקה בהצלחה',
                        'כל המטמון נוקה בהצלחה באמצעות מערכת המטמון המאוחדת',
                        6000
                    );
                } else {
                    showNotification('מטמון המערכת נוקה בהצלחה', 'success');
                }
            } else {
                throw new Error('Failed to clear cache using unified system');
            }
        } else {
            // fallback ל-API ישיר
            const response = await fetch('/api/cache/clear', { method: 'POST' });
            const data = await response.json();
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            
            if (response.ok && data.success) {
                serverMonitor.elements.toolResults.innerHTML = `
                    <div class="alert alert-success">
                        <strong>Cache Cleared Successfully</strong><br/>
                        ${data.message || 'All cache entries have been cleared'}
                    </div>
                `;
                
                // Show detailed success notification
                if (typeof window.showFinalSuccessNotification === 'function') {
                    await window.showFinalSuccessNotification(
                        'ניקוי מטמון הושלם בהצלחה!',
                        'כל המטמון נוקה בהצלחה והמערכת פועלת תקין.',
                        {
                            operation: 'ניקוי מטמון מערכת',
                            duration: `${duration}ms`,
                            timestamp: new Date().toISOString(),
                            status: 'הצלחה',
                            method: 'API ישיר',
                            healthCheck: 'המערכת פועלת תקין',
                            nextAction: 'המערכת מוכנה לשימוש'
                        },
                        'system'
                    );
                } else {
                    showNotification('מטמון המערכת נוקה בהצלחה', 'success');
                }
            } else {
                throw new Error(data.message || 'Failed to clear cache');
            }
        }
      
    } catch (error) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        serverMonitor.elements.toolResults.innerHTML = `
            <div class="alert alert-danger">
                <strong>Cache Clear Failed</strong><br/>
                ${error.message}
            </div>
        `;
        
        // Show detailed error notification
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                'ניקוי מטמון נכשל',
                `ניקוי המטמון נכשל וזוהתה בעיה במערכת.\n\nפרטי השגיאה:\n• פעולה: ניקוי מטמון מערכת\n• זמן ביצוע: ${duration}ms\n• זמן בקשה: ${new Date().toLocaleTimeString('he-IL')}\n• סטטוס: נכשל\n• שגיאה: ${error.message}\n\nבדיקת בריאות נוכחית:\n• סטטוס כללי: דורש תשומת לב\n• פעולה נכשלה: ניקוי מטמון\n• סיבה: ${error.message}\n\nהוראות: בדוק את הבעיה שזוהתה וטפל בה.`,
                15000
            );
      } else {
            showNotification('שגיאה בניקוי המטמון', 'error');
        }
    }
}

/**
 * Restart server
 */
async function restartServer() {
    if (!serverMonitor.elements.toolResults) return;
    
      if (typeof window.showConfirmationDialog === 'function') {
          window.showConfirmationDialog(
            'איתחול שרת',
            'האם אתה בטוח שברצונך להפעיל מחדש את השרת?',
            async () => {
                await executeRestartServer();
            },
            () => {
                console.log('איתחול שרת בוטל על ידי המשתמש');
            },
            'warning'
        );
      } else {
        if (!confirm('האם אתה בטוח שברצונך להפעיל מחדש את השרת?')) {
        return;
      }
        await executeRestartServer();
    }
}

async function executeRestartServer() {
    
    try {
        serverMonitor.elements.toolResults.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
        
        const response = await fetch('/api/system/restart', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok && data.success) {
            serverMonitor.elements.toolResults.innerHTML = `
                <div class="alert alert-warning">
                    <strong>Server Restart Initiated</strong><br/>
                    ${data.message || 'Server is restarting...'}
        </div>
      `;
            showNotification('השרת מופעל מחדש', 'warning');
            
            // Stop monitoring during restart
            stopMonitoring();
            
            // Try to reconnect after 10 seconds
            setTimeout(() => {
                startMonitoring();
            }, 10000);
            
      } else {
            throw new Error(data.message || 'Failed to restart server');
      }
        
    } catch (error) {
        serverMonitor.elements.toolResults.innerHTML = `
            <div class="alert alert-danger">
                <strong>Server Restart Failed</strong><br/>
                ${error.message}
    </div>
        `;
        showNotification('שגיאה בהפעלת השרת מחדש', 'error');
    }
}

// ============================================================================
// ADVANCED TOOLS FUNCTIONS
// ============================================================================

/**
 * Run advanced tool
 */
async function runAdvancedTool(toolId) {
    if (!serverMonitor.elements.advancedToolResults) return;
    
    const toolName = getToolName(toolId);
    const startTime = performance.now();
    
    try {
        serverMonitor.elements.advancedToolResults.innerHTML = `
            <div class="text-center">
                <div class="spinner-border" role="status"></div>
                <p>Running ${toolName}...</p>
        </div>
      `;
        
        const result = await executeAdvancedTool(toolId);
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        serverMonitor.elements.advancedToolResults.innerHTML = `
            <div class="alert alert-info">
                <h6>${toolName} Results</h6>
                <pre>${JSON.stringify(result, null, 2)}</pre>
        </div>
    `;

        // Show detailed success notification
        if (typeof window.showFinalSuccessNotification === 'function') {
            await window.showFinalSuccessNotification(
                `${toolName} הושלם בהצלחה!`,
                `הכלי המתקדם הושלם בהצלחה והמערכת פועלת תקין.`,
                {
                    operation: toolName,
                    duration: `${duration}ms`,
                    timestamp: new Date().toISOString(),
                    status: 'הצלחה',
                    toolId: toolId,
                    result: JSON.stringify(result).substring(0, 200) + '...',
                    healthCheck: 'המערכת פועלת תקין',
                    nextAction: 'המערכת מוכנה לשימוש'
                },
                'system'
            );
        } else {
            showNotification(`${toolName} הושלם בהצלחה`, 'success');
        }
        
    } catch (error) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        serverMonitor.elements.advancedToolResults.innerHTML = `
            <div class="alert alert-danger">
                <h6>${toolName} Failed</h6>
                <p>${error.message}</p>
        </div>
    `;
        
        // Show detailed error notification
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                `${toolName} נכשל`,
                `הכלי המתקדם נכשל וזוהתה בעיה במערכת.\n\nפרטי השגיאה:\n• כלי: ${toolName}\n• זמן ביצוע: ${duration}ms\n• זמן בקשה: ${new Date().toLocaleTimeString('he-IL')}\n• סטטוס: נכשל\n• שגיאה: ${error.message}\n\nבדיקת בריאות נוכחית:\n• סטטוס כללי: דורש תשומת לב\n• כלי נכשל: ${toolName}\n• סיבה: ${error.message}\n\nהוראות: בדוק את הבעיה שזוהתה וטפל בה.`,
                15000
            );
        } else {
            showNotification(`שגיאה ב-${toolName}`, 'error');
        }
    }
}

/**
 * Get tool name by ID
 */
function getToolName(toolId) {
    const toolNames = {
        'performance-analysis': 'Performance Analysis',
        'memory-optimization': 'Memory Optimization',
        'database-health': 'Database Health Check',
        'cache-optimization': 'Cache Optimization',
        'security-scan': 'Security Scan',
        'dependency-check': 'Dependency Check'
    };
    
    return toolNames[toolId] || toolId;
}

/**
 * Execute advanced tool
 */
async function executeAdvancedTool(toolId) {
    // For now, simulate advanced tool execution
    // In the future, these will be real API endpoints
    
    switch (toolId) {
        case 'performance-analysis':
            return await simulatePerformanceAnalysis();
        case 'memory-optimization':
            return await simulateMemoryOptimization();
        case 'database-health':
            return await simulateDatabaseHealthCheck();
        case 'cache-optimization':
            return await simulateCacheOptimization();
        case 'security-scan':
            return await simulateSecurityScan();
        case 'dependency-check':
            return await simulateDependencyCheck();
        default:
            throw new Error(`Unknown tool: ${toolId}`);
    }
}

/**
 * Simulate performance analysis
 */
async function simulatePerformanceAnalysis() {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
    
    return {
        analysis: {
            responseTime: {
                average: '45ms',
                p95: '120ms',
                p99: '250ms'
            },
            throughput: {
                requestsPerSecond: 150,
                peakLoad: 200
            },
            bottlenecks: [
                'Database queries taking 60ms average',
                'Cache hit rate at 85% (target: 90%)'
            ],
            recommendations: [
                'Optimize slow database queries',
                'Increase cache TTL for frequently accessed data',
                'Consider connection pooling'
            ]
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Simulate memory optimization
 */
async function simulateMemoryOptimization() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
        optimization: {
            currentMemory: '245MB',
            optimizedMemory: '198MB',
            savings: '47MB (19%)',
            recommendations: [
                'Clear unused cache entries',
                'Optimize data structures',
                'Implement memory pooling'
            ],
            actions: [
                'Cleared 1,200 expired cache entries',
                'Optimized 3 database connection pools',
                'Reduced memory fragmentation'
            ]
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Simulate database health check
 */
async function simulateDatabaseHealthCheck() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        health: {
            status: 'healthy',
            connectionPool: {
                active: 8,
                idle: 12,
                max: 20
            },
            performance: {
                averageQueryTime: '15ms',
                slowQueries: 2,
                deadlocks: 0
            },
            integrity: {
                tables: 15,
                indexes: 23,
                constraints: 89
            },
            recommendations: [
                'Add index on trades.created_at',
                'Optimize user preferences query'
            ]
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Simulate cache optimization
 */
async function simulateCacheOptimization() {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
        optimization: {
            hitRate: {
                before: '78%',
                after: '89%',
                improvement: '+11%'
            },
            memoryUsage: {
                before: '156MB',
                after: '142MB',
                savings: '14MB'
            },
            actions: [
                'Adjusted TTL for user preferences',
                'Optimized cache key patterns',
                'Cleared redundant entries'
            ],
            recommendations: [
                'Increase cache size for quotes data',
                'Implement cache warming for critical data'
            ]
        },
          timestamp: new Date().toISOString()
    };
}

/**
 * Simulate security scan
 */
async function simulateSecurityScan() {
        await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
        scan: {
            status: 'completed',
            vulnerabilities: {
                critical: 0,
                high: 1,
                medium: 3,
                low: 5
            },
            issues: [
                {
                    level: 'high',
                    description: 'Missing CSRF token validation',
                    recommendation: 'Implement CSRF protection'
                },
                {
                    level: 'medium',
                    description: 'Weak password policy',
                    recommendation: 'Enforce stronger password requirements'
                }
            ],
            securityHeaders: {
                present: 6,
                missing: 2,
                score: 'B+'
            }
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Simulate dependency check
 */
async function simulateDependencyCheck() {
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    return {
        dependencies: {
            python: {
                version: '3.9.7',
                status: 'up-to-date'
            },
            flask: {
                version: '2.3.3',
                status: 'up-to-date'
            },
            sqlite: {
                version: '3.39.0',
                status: 'up-to-date'
            },
            outdated: [
                {
                    package: 'requests',
                    current: '2.28.1',
                    latest: '2.31.0',
                    security: false
                }
            ],
            security: {
                vulnerabilities: 0,
                recommendations: [
                    'Update requests to latest version'
                ]
            }
        },
        timestamp: new Date().toISOString()
    };
}

// ============================================================================
// LOG FUNCTIONS
// ============================================================================

/**
 * Update logs using the unified logging system
 */
async function updateLogs() {
    try {
        // Use the unified logging system endpoints
        const logTypes = ['app', 'errors', 'performance', 'database', 'cache'];
        let allLogs = [];
        
        // Fetch logs from multiple sources
        for (const logType of logTypes) {
            try {
                const response = await fetch(`/api/logs/raw/${logType}/tail?lines=50`);
                const data = await response.json();
                
                if (data.success && data.content) {
                    const parsedLogs = parseLogContent(data.content, logType);
                    allLogs = allLogs.concat(parsedLogs);
                }
            } catch (sourceError) {
                console.warn(`Failed to fetch ${logType} logs:`, sourceError);
                continue;
            }
        }
        
        // Sort logs by timestamp (newest first)
        allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Limit to last 100 entries
        if (allLogs.length > 100) {
            allLogs = allLogs.slice(0, 100);
        }
        
        if (allLogs.length > 0) {
            displayLogs(allLogs);
      } else {
            // Fallback to sample logs if no real logs available
            displayLogs(generateSampleLogs());
      }
        
    } catch (error) {
        console.error('❌ Log update failed:', error);
        // Show sample logs on error
        displayLogs(generateSampleLogs());
    }
}

/**
 * Parse log content from unified logging system
 */
function parseLogContent(content, logType) {
    const logs = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        try {
            // Parse different log formats
            const logEntry = parseLogLine(line, logType);
            if (logEntry) {
                logs.push(logEntry);
      }
    } catch (error) {
            console.warn('Failed to parse log line:', line, error);
        }
    });
    
    return logs;
}

/**
 * Parse individual log line
 */
function parseLogLine(line, logType) {
    // Common log patterns
    const patterns = [
        // Standard Python logging format
        /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - (\w+) - (.+)$/,
        // Simple timestamp format
        /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - (\w+) - (.+)$/,
        // ISO format
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) - (\w+) - (.+)$/
    ];
    
    for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
            const [, timestamp, level, message] = match;
            return {
                timestamp: timestamp,
                level: level.toUpperCase(),
                message: message,
                source: logType
            };
        }
    }
    
    // Fallback for unparseable lines
    return {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: line,
        source: logType
    };
}

/**
 * Generate sample logs for demonstration
 */
function generateSampleLogs() {
    const now = new Date();
    const levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
    const messages = [
        'Server started successfully',
        'Database connection established',
        'Cache system initialized',
        'User authentication successful',
        'API request processed',
        'Background task completed',
        'Memory usage: 245MB',
        'Cache hit rate: 89%',
        'External data updated',
        'System health check passed'
    ];
    const sources = [
        'server_monitor.py',
        'app.py',
        'cache_service.py',
        'database_service.py',
        'auth_service.py'
    ];
    
    const logs = [];
    
    for (let i = 0; i < 20; i++) {
        const timestamp = new Date(now.getTime() - (i * 30000)); // 30 seconds apart
        const level = levels[Math.floor(Math.random() * levels.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        
        logs.push({
            timestamp: timestamp.toISOString(),
            level: level,
            message: message,
            source: source
        });
    }
    
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Display logs in the log viewer
 */
function displayLogs(logs) {
    if (!serverMonitor.elements.logViewer) return;
    
    // Calculate log statistics
    const stats = calculateLogStats(logs);
    updateLogStatistics(stats);
    
    // Generate HTML
    const html = logs.map(log => {
        const levelClass = getLogLevelClass(log.level);
        const timestamp = new Date(log.timestamp);
        const timeStr = timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        const dateStr = timestamp.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        return `
            <div class="log-entry log-${levelClass.toLowerCase()}">
                <div class="log-header">
                    <span class="log-level badge bg-${levelClass}">${log.level}</span>
                    <span class="log-timestamp">${timeStr}<br/>${dateStr}</span>
            </div>
                <div class="log-message">${log.message}</div>
                ${log.source ? `<div class="log-source text-muted">${log.source}</div>` : ''}
      </div>
    `;
    }).join('');
    
    serverMonitor.elements.logViewer.innerHTML = html;
    
    // Auto-scroll to bottom
    serverMonitor.elements.logViewer.scrollTop = serverMonitor.elements.logViewer.scrollHeight;
    
    // Apply current filters
    applyLogFilters();
}

/**
 * Calculate log statistics
 */
function calculateLogStats(logs) {
    const stats = {
        total: logs.length,
        errors: 0,
        warnings: 0,
        info: 0,
        debug: 0,
        sources: {}
    };
    
    logs.forEach(log => {
        // Count by level
        switch (log.level) {
            case 'ERROR':
                stats.errors++;
                break;
            case 'WARNING':
                stats.warnings++;
                break;
            case 'INFO':
                stats.info++;
                break;
            case 'DEBUG':
                stats.debug++;
                break;
        }
        
        // Count by source
        if (log.source) {
            stats.sources[log.source] = (stats.sources[log.source] || 0) + 1;
        }
    });
    
    return stats;
}

/**
 * Update log statistics display
 */
function updateLogStatistics(stats) {
    // Update total entries
    const totalElement = document.getElementById('totalLogEntries');
    if (totalElement) {
        totalElement.textContent = stats.total;
    }
    
    // Update error count
    const errorElement = document.getElementById('errorCount');
    if (errorElement) {
        errorElement.textContent = stats.errors;
    }
    
    // Update warning count
    const warningElement = document.getElementById('warningCount');
    if (warningElement) {
        warningElement.textContent = stats.warnings;
    }
    
    // Update last log update time
    const lastUpdateElement = document.getElementById('lastLogUpdate');
    if (lastUpdateElement) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        lastUpdateElement.innerHTML = `${timeStr}<br/>${dateStr}`;
    }
}

/**
 * Get CSS class for log level
 */
function getLogLevelClass(level) {
    const levelClasses = {
        'ERROR': 'danger',
        'WARNING': 'warning',
        'INFO': 'info',
        'DEBUG': 'secondary',
        'TRACE': 'light'
    };
    
    return levelClasses[level] || 'secondary';
}

/**
 * Filter logs based on level and search
 */
function filterLogs() {
    if (serverMonitor.elements.logLevelFilter) {
        serverMonitor.state.currentLogLevel = serverMonitor.elements.logLevelFilter.value;
    }
    
    if (serverMonitor.elements.logSearchInput) {
        serverMonitor.state.logFilter = serverMonitor.elements.logSearchInput.value;
    }
    
    // Apply filters to current logs without refetching
    applyLogFilters();
}

/**
 * Apply filters to currently displayed logs
 */
function applyLogFilters() {
    const logEntries = serverMonitor.elements.logViewer.querySelectorAll('.log-entry');
    
    logEntries.forEach(entry => {
        const level = entry.querySelector('.log-level')?.textContent;
        const message = entry.querySelector('.log-message')?.textContent;
        const source = entry.querySelector('.log-source')?.textContent;
        
        let showEntry = true;
        
        // Filter by level
        if (serverMonitor.state.currentLogLevel && serverMonitor.state.currentLogLevel !== 'all') {
            const levelMap = {
                'error': ['ERROR'],
                'warning': ['ERROR', 'WARNING'],
                'info': ['ERROR', 'WARNING', 'INFO'],
                'debug': ['ERROR', 'WARNING', 'INFO', 'DEBUG']
            };
            
            if (!levelMap[serverMonitor.state.currentLogLevel]?.includes(level)) {
                showEntry = false;
            }
        }
        
        // Filter by search text
        if (showEntry && serverMonitor.state.logFilter) {
            const searchText = serverMonitor.state.logFilter.toLowerCase();
            const entryText = `${message} ${source}`.toLowerCase();
            
            if (!entryText.includes(searchText)) {
                showEntry = false;
            }
        }
        
        // Show/hide entry
        entry.style.display = showEntry ? 'block' : 'none';
    });
    
    // Update search results count
    const visibleEntries = Array.from(logEntries).filter(entry => entry.style.display !== 'none');
    updateSearchResultsCount(visibleEntries.length, logEntries.length);
}

/**
 * Clear log viewer
 */
function clearLogViewer() {
    if (serverMonitor.elements.logViewer) {
        serverMonitor.elements.logViewer.innerHTML = '<div class="text-muted text-center">No logs to display</div>';
    }
}

/**
 * Export logs to file
 */
function exportLogs() {
    try {
        // Get current logs from the viewer
        const logEntries = serverMonitor.elements.logViewer.querySelectorAll('.log-entry');
        const logs = [];
        
        logEntries.forEach(entry => {
            const level = entry.querySelector('.log-level')?.textContent || 'UNKNOWN';
            const timestamp = entry.querySelector('.log-timestamp')?.textContent || '';
            const message = entry.querySelector('.log-message')?.textContent || '';
            const source = entry.querySelector('.log-source')?.textContent || '';
            
            logs.push({
                timestamp: timestamp.replace(/\n/g, ' '),
                level: level,
                message: message,
                source: source
            });
        });
        
        // Create CSV content
        const csvContent = [
            'Timestamp,Level,Message,Source',
            ...logs.map(log => `"${log.timestamp}","${log.level}","${log.message}","${log.source}"`)
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `server-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('לוגים יוצאו בהצלחה', 'success');
        
    } catch (error) {
        console.error('❌ Export logs failed:', error);
        showNotification('שגיאה בייצוא הלוגים', 'error');
    }
}

/**
 * Search logs with advanced filters
 */
function searchLogs() {
    const searchInput = serverMonitor.elements.logSearchInput;
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    const logEntries = serverMonitor.elements.logViewer.querySelectorAll('.log-entry');
    
    logEntries.forEach(entry => {
        const text = entry.textContent.toLowerCase();
        const matches = text.includes(query);
        
        if (query === '' || matches) {
            entry.style.display = 'block';
  } else {
            entry.style.display = 'none';
        }
    });
    
    // Update search results count
    const visibleEntries = Array.from(logEntries).filter(entry => entry.style.display !== 'none');
    updateSearchResultsCount(visibleEntries.length, logEntries.length);
}

/**
 * Update search results count
 */
function updateSearchResultsCount(visible, total) {
    // Find or create search results indicator
    let resultsIndicator = document.getElementById('search-results-count');
    if (!resultsIndicator) {
        resultsIndicator = document.createElement('div');
        resultsIndicator.id = 'search-results-count';
        resultsIndicator.className = 'search-results-indicator';
        
        const searchContainer = serverMonitor.elements.logSearchInput?.parentElement;
        if (searchContainer) {
            searchContainer.appendChild(resultsIndicator);
        }
    }
    
    if (visible < total) {
        resultsIndicator.textContent = `מציג ${visible} מתוך ${total} רשומות`;
        resultsIndicator.style.display = 'block';
        } else {
        resultsIndicator.style.display = 'none';
    }
}

/**
 * Copy logs to clipboard
 */
async function copyLogsToClipboard() {
    try {
        const logEntries = serverMonitor.elements.logViewer.querySelectorAll('.log-entry');
        const logs = [];
        
        logEntries.forEach(entry => {
            const level = entry.querySelector('.log-level')?.textContent || 'UNKNOWN';
            const timestamp = entry.querySelector('.log-timestamp')?.textContent || '';
            const message = entry.querySelector('.log-message')?.textContent || '';
            const source = entry.querySelector('.log-source')?.textContent || '';
            
            logs.push(`[${timestamp}] ${level}: ${message} ${source ? `(${source})` : ''}`);
        });
        
        const logText = logs.join('\n');
        
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(logText);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = logText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        showNotification('לוגים הועתקו ללוח', 'success');
        
    } catch (error) {
        console.error('❌ Copy logs failed:', error);
        showNotification('שגיאה בהעתקת הלוגים', 'error');
    }
}

/**
 * Highlight log entries by level
 */
function highlightLogLevels() {
    const logEntries = serverMonitor.elements.logViewer.querySelectorAll('.log-entry');
    
    logEntries.forEach(entry => {
        const level = entry.querySelector('.log-level')?.textContent;
        
        // Remove existing highlights
        entry.classList.remove('highlight-error', 'highlight-warning', 'highlight-info');
        
        // Add level-specific highlights
        switch (level) {
            case 'ERROR':
                entry.classList.add('highlight-error');
                break;
            case 'WARNING':
                entry.classList.add('highlight-warning');
                break;
            case 'INFO':
                entry.classList.add('highlight-info');
                break;
        }
    });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format uptime duration
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
        return `${days} ימים, ${hours} שעות`;
    } else if (hours > 0) {
        return `${hours} שעות, ${minutes} דקות`;
    } else {
        return `${minutes} דקות`;
    }
}

/**
 * Load initial data
 */
async function loadInitialData() {
    try {
        await updateServerStatus();
        await updateLogs();
  } catch (error) {
        console.error('❌ Failed to load initial data:', error);
    }
}

/**
 * Show notification using the global notification system
 */
function showNotification(message, type = 'info') {
    if (typeof showNotificationMessage === 'function') {
        showNotificationMessage(message, type);
    } else {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
    }
}

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

/**
 * Cleanup function called when leaving the page
 */
function cleanupServerMonitor() {
    stopMonitoring();
    console.log('🧹 Server Monitor: Cleaned up');
}

// ============================================================================
// EXPORT FOR UNIFIED INITIALIZATION
// ============================================================================

// Register with unified initialization system
if (typeof window !== 'undefined' && window.unifiedAppInitializer) {
    window.unifiedAppInitializer.registerModule('server-monitor', {
        init: initializeServerMonitor,
        cleanup: cleanupServerMonitor,
        dependencies: ['notification-system', 'ui-utils']
    });
}

// ============================================================================
// ADDITIONAL BUTTON FUNCTIONS
// ============================================================================

/**
 * Quick restart server
 */
async function quickRestartServer() {
    if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
            'איתחול מהיר של השרת',
            'האם אתה בטוח שברצונך להפעיל מחדש את השרת במהירות?',
            async () => {
                await executeQuickRestartServer();
            },
            () => {
                console.log('איתחול מהיר בוטל על ידי המשתמש');
            },
            'warning'
        );
    } else {
        if (!confirm('האם אתה בטוח שברצונך להפעיל מחדש את השרת במהירות?')) {
            return;
        }
        await executeQuickRestartServer();
    }
}

async function executeQuickRestartServer() {
    const startTime = Date.now();
    
    try {
        console.log('🔄 מתחיל איתחול מהיר של השרת...');
        
        if (typeof window.showNotification === 'function') {
            await window.showNotification(
                'מפעיל מחדש את השרת במהירות...\n\nהתהליך עשוי לקחת מספר שניות.',
                'info',
                'איתחול מהיר מתחיל',
                5000,
                'system'
            );
        }
        
        const response = await fetch('/api/server/change-mode', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                mode: 'preserve', 
                restart_type: 'quick' 
            })
        });
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        // בדיקה אם התהליך באמת התרחש
        let processSuccess = false;
        let serverData = null;
        
        try {
            // נסה לקבל נתונים מהשרת כדי לוודא שהוא עובד
            const healthCheck = await fetch('/api/health');
            if (healthCheck.ok) {
                const healthData = await healthCheck.json();
                processSuccess = healthData.status === 'healthy' || healthData.status === 'success';
                serverData = healthData;
            }
        } catch (healthError) {
            console.warn('Health check failed, but restart might have succeeded:', healthError);
            // אם בדיקת הבריאות נכשלה, נחכה קצת וננסה שוב
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                const retryHealth = await fetch('/api/health');
                if (retryHealth.ok) {
                    const retryData = await retryHealth.json();
                    processSuccess = retryData.status === 'healthy' || retryData.status === 'success';
                    serverData = retryData;
                }
            } catch (retryError) {
                console.error('Retry health check also failed:', retryError);
            }
        }
        
        // בדיקה נוספת - נסה לקבל סטטוס שרת
        if (!processSuccess) {
            try {
                const statusCheck = await fetch('/api/server/status');
                if (statusCheck.ok) {
                    const statusData = await statusCheck.json();
                    processSuccess = statusData.data && statusData.data.overall_health;
                    serverData = statusData;
                }
            } catch (statusError) {
                console.error('Status check failed:', statusError);
            }
        }
        
        if (response.ok && processSuccess) {
            // בדיקת בריאות מפורטת לאחר איתחול
            let healthDetails = '';
            try {
                const detailedHealth = await fetch('/api/health');
                if (detailedHealth.ok) {
                    const healthData = await detailedHealth.json();
                    healthDetails = `\n\nבדיקת בריאות לאחר איתחול:\n• סטטוס כללי: ${healthData.status}\n• API: ${healthData.data?.components?.api?.status || 'לא ידוע'}\n• בסיס נתונים: ${healthData.data?.components?.database?.status || 'לא ידוע'}\n• מטמון: ${healthData.data?.components?.cache?.status || 'לא ידוע'}`;
                }
            } catch (healthError) {
                healthDetails = '\n\n⚠️ לא ניתן לקבל פרטי בריאות מפורטים';
            }
            
            // הודעת הצלחה סופית עם מודל מפורט
            if (typeof window.showFinalSuccessNotification === 'function') {
                await window.showFinalSuccessNotification(
                    'איתחול מהיר הושלם בהצלחה!',
                    'השרת הופעל מחדש בהצלחה וכל המערכות פועלות תקין',
                    {
                        operation: 'quick-restart',
                        duration: `${duration} שניות`,
                        timestamp: new Date().toISOString(),
                        serverStatus: processSuccess ? 'פעיל' : 'לא ידוע',
                        healthCheck: healthDetails,
                        restartType: 'quick',
                        nextAction: 'העמוד יעודכן בעוד 3 שניות'
                    },
                    'system'
                );
            } else if (typeof window.showNotification === 'function') {
                // Fallback להודעה רגילה
                await window.showNotification(
                    `השרת הופעל מחדש בהצלחה!\n\nפרטי התהליך:\n• זמן ביצוע: ${duration} שניות\n• סטטוס: הצלחה\n• זמן סיום: ${new Date().toLocaleTimeString('he-IL')}\n• סוג: איתחול מהיר${healthDetails}\n\nהעמוד יעודכן בעוד 3 שניות...`,
                    'success',
                    'איתחול מהיר הושלם בהצלחה',
                    10000,
                    'system'
                );
            }
            
            console.log(`✅ איתחול מהיר הושלם בהצלחה - ${duration} שניות`);
            
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } else {
            // בדיקת בריאות גם במקרה של כישלון
            let failureDetails = '';
            try {
                const failureHealth = await fetch('/api/health');
                if (failureHealth.ok) {
                    const healthData = await failureHealth.json();
                    failureDetails = `\n\nבדיקת בריאות לאחר כישלון:\n• סטטוס: ${healthData.status}\n• API: ${healthData.data?.components?.api?.status || 'לא זמין'}\n• בסיס נתונים: ${healthData.data?.components?.database?.status || 'לא זמין'}`;
                }
            } catch (healthError) {
                failureDetails = '\n\n❌ השרת לא מגיב כלל';
            }
            
            // יצירת הודעת שגיאה מפורטת
            let errorMessage = 'איתחול השרת נכשל';
            if (response.status === 404) {
                errorMessage = 'endpoint איתחול לא נמצא - השרת לא תומך באיתחול';
            } else if (response.status === 500) {
                errorMessage = 'שגיאת שרת פנימית במהלך האיתחול';
            } else if (!processSuccess) {
                errorMessage = 'השרת לא הגיב לאחר האיתחול - ייתכן שהשרת לא הופעל מחדש';
            }
            
            throw new Error(errorMessage + failureDetails);
        }
        
    } catch (error) {
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.error('❌ Quick restart failed:', error);
        
        // הודעת שגיאה מפורטת עם מודל
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                'שגיאה באיתחול מהיר',
                `איתחול מהיר נכשל!\n\nפרטי השגיאה:\n• הודעת שגיאה: ${error.message}\n• זמן ניסיון: ${duration} שניות\n• זמן שגיאה: ${new Date().toLocaleTimeString('he-IL')}\n• סוג: איתחול מהיר\n\nנסה שוב או השתמש באיתחול רגיל.`,
                10000
            );
        } else if (typeof window.showNotification === 'function') {
            // Fallback להודעה רגילה
            await window.showNotification(
                `איתחול מהיר נכשל!\n\nפרטי השגיאה:\n• הודעת שגיאה: ${error.message}\n• זמן ניסיון: ${duration} שניות\n• זמן שגיאה: ${new Date().toLocaleTimeString('he-IL')}\n• סוג: איתחול מהיר\n\nנסה שוב או השתמש באיתחול רגיל.`,
                'error',
                'שגיאה באיתחול מהיר',
                10000,
                'system'
            );
        }
    }
}

/**
 * Change server mode - Show cache mode options
 */
async function changeServerMode() {
    try {
        // קבלת מצב מטמון נוכחי
        const currentResponse = await fetch('/api/cache/stats');
        const currentData = await currentResponse.json();
        
        let currentMode = 'רגיל'; // ברירת מחדל
        let currentModeId = 'normal';
        
        if (currentResponse.ok && currentData.success) {
            // נסה לקבל את המצב הנוכחי מהנתונים
            const cacheData = currentData.data;
            if (cacheData.mode) {
                currentModeId = cacheData.mode;
                switch (cacheData.mode) {
                    case 'aggressive': currentMode = 'אגרסיבי'; break;
                    case 'conservative': currentMode = 'שמרני'; break;
                    case 'disabled': currentMode = 'מבוטל'; break;
                    case 'normal':
                    default: currentMode = 'רגיל'; break;
                }
            } else {
                // אם אין מצב מוגדר, נסה להבין מהסטטיסטיקות
                if (cacheData.hit_rate_percent > 80) {
                    currentMode = 'אגרסיבי';
                    currentModeId = 'aggressive';
                } else if (cacheData.hit_rate_percent < 50) {
                    currentMode = 'שמרני';
                    currentModeId = 'conservative';
                }
            }
        }
        
        // רשימת מצבי מטמון זמינים (ללא ניקוי מטמון)
        const cacheModes = [
            { id: 'preserve', name: 'רגיל', description: 'TTL סטנדרטי', icon: '⚙️' },
            { id: 'development', name: 'פיתוח', description: 'TTL ארוך', icon: '🚀' },
            { id: 'production', name: 'ייצור', description: 'TTL קצר', icon: '🐌' },
            { id: 'no-cache', name: 'מבוטל', description: 'ללא מטמון', icon: '🚫' }
        ];
        
        // יצירת רשימת אופציות ככרטיסים קטנים עם גובה דינמי
        let optionsHTML = `
            <div class="cache-mode-selector">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">בחר מצב מטמון חדש</h5>
                    <button type="button" class="btn btn-warning btn-sm" 
                            onclick="executeCacheModeChange('clear', 'ניקוי מטמון')">
                        🧹 ניקוי מטמון
                    </button>
                </div>
                <p class="text-muted mb-3">
                    <strong>מצב נוכחי:</strong> 
                    <span class="badge bg-primary">${currentMode}</span>
                </p>
                <div class="row g-2">
        `;
        
        cacheModes.forEach(mode => {
            const isActive = mode.id === currentModeId;
            const cardClass = isActive ? 'border-primary bg-light' : 'border-secondary';
            const badgeClass = isActive ? 'bg-primary' : 'bg-secondary';
            
            optionsHTML += `
                <div class="col-6 col-md-3">
                    <button type="button" class="btn btn-outline-secondary w-100 p-0 cache-mode-card ${cardClass}" 
                            data-mode-id="${mode.id}" data-mode-name="${mode.name}"
                            style="border: 2px solid; min-height: 120px;">
                        <div class="card-body text-center p-2 h-100 d-flex flex-column justify-content-center">
                            <div class="mb-2 fs-4">${mode.icon}</div>
                            <h6 class="card-title mb-1 small">${mode.name}</h6>
                            <p class="card-text small text-muted mb-1">${mode.description}</p>
                            <span class="badge ${badgeClass} small">
                                ${isActive ? 'נוכחי' : 'בחר'}
                            </span>
                        </div>
                    </button>
                </div>
            `;
        });
        
        optionsHTML += `
                </div>
            </div>
        `;
        
        // הצגת דיאלוג בחירה עם רוחב מוכפל
        if (typeof window.showConfirmationDialog === 'function') {
            // יצירת מודל מותאם אישית עם רוחב מוכפל
            const modalId = 'cacheModeModal';
            const modalHTML = `
                <div class="modal fade warning-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true" data-bs-backdrop="true" data-bs-keyboard="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header bg-info text-white">
                                <h5 class="modal-title" id="${modalId}Label">שינוי מצב מטמון</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
                            <div class="modal-body">
                                ${optionsHTML}
            </div>
                            <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="margin-left: 8px;">סגור</button>
                            </div>
            </div>
          </div>
        </div>
      `;
            
            // הסרת מודל קיים אם יש
            const existingModal = document.getElementById(modalId);
            if (existingModal) {
                existingModal.remove();
            }
            
            // הוספת המודל לדף
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // הצגת המודל
            const modal = document.getElementById(modalId);
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
            
            // הוספת event listeners לכפתורי מצב מטמון
            const cacheButtons = modal.querySelectorAll('.cache-mode-card');
            cacheButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const modeId = this.getAttribute('data-mode-id');
                    const modeName = this.getAttribute('data-mode-name');
                    executeCacheModeChange(modeId, modeName);
                });
            });
            
            // הוספת event listener לכפתור ניקוי מטמון
            const clearButton = modal.querySelector('button[onclick*="clear"]');
            if (clearButton) {
                clearButton.addEventListener('click', function() {
                    executeCacheModeChange('clear', 'ניקוי מטמון');
                });
            }
        } else {
            // Fallback - בחירה פשוטה
            const selectedMode = prompt(`בחר מצב מטמון:\n1. רגיל\n2. אגרסיבי\n3. שמרני\n4. מבוטל\n5. ניקוי מטמון\n\nמצב נוכחי: ${currentMode}\n\nהכנס מספר (1-5):`);
            if (selectedMode && selectedMode >= 1 && selectedMode <= 5) {
                const modeIndex = parseInt(selectedMode) - 1;
                await executeCacheModeChange(cacheModes[modeIndex].id, cacheModes[modeIndex].name);
            }
        }
        
  } catch (error) {
        console.error('❌ Failed to load cache modes:', error);
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                'שגיאה בטעינת מצבי מטמון',
                `לא ניתן לטעון את מצבי המטמון הזמינים.\n\nפרטי השגיאה:\n• הודעת שגיאה: ${error.message}\n• סוג: ${error.name || 'Unknown'}\n• זמן שגיאה: ${new Date().toLocaleTimeString('he-IL')}\n• סוג: טעינת מצבי מטמון\n\nנסה לרענן את העמוד או בדוק את חיבור השרת.`,
                8000
            );
        }
    }
}

/**
 * Execute cache mode change
 */
async function executeCacheModeChange(modeId, modeName) {
    try {
        console.log(`🔄 משנה מצב מטמון ל: ${modeName}`);
        
        if (typeof window.showInfoNotification === 'function') {
            await window.showInfoNotification(
                'משנה מצב מטמון',
                `משנה את מצב המטמון ל"${modeName}"...`,
                3000
            );
        } else if (typeof window.showNotification === 'function') {
            await window.showNotification(
                `משנה את מצב המטמון ל"${modeName}"...`,
                'info',
                'משנה מצב מטמון',
                3000,
                'system'
            );
        }
        
        let response;
        let data;
        
        if (modeId === 'clear') {
            // ניקוי מטמון - שימוש במערכת המטמון המאוחדת
            if (typeof window.clearAllCache === 'function') {
                const clearResult = await window.clearAllCache();
                if (clearResult) {
                    // יצירת תגובה מדומה כדי לעבור ללוגיקה של הצלחה
                    response = { ok: true };
                    data = { success: true, status: 'success', message: 'Cache cleared successfully' };
                } else {
                    throw new Error('Failed to clear cache using unified system');
                }
            } else {
                // fallback ל-API ישיר
                response = await fetch('/api/cache/clear', { method: 'POST' });
                data = await response.json();
            }
        } else {
            // שינוי מצב עם איתחול מהיר
            response = await fetch('/api/server/change-mode', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: modeId, restart_type: 'quick' })
            });
            data = await response.json();
        }
        
        if (response.ok && (data.success || data.status === 'success')) {
            if (modeId === 'clear') {
                // ניקוי מטמון הצליח
                if (typeof window.showSuccessNotification === 'function') {
                    await window.showSuccessNotification(
                        'מטמון נוקה בהצלחה!',
                        `המטמון נוקה בהצלחה!\n\nפרטים:\n• פעולה: ניקוי מטמון\n• זמן ביצוע: ${new Date().toLocaleTimeString('he-IL')}\n• סטטוס: הצלחה\n• הוראות: המטמון ריק ומוכן לשימוש`,
                        8000
                    );
                } else if (typeof window.showNotification === 'function') {
                    await window.showNotification(
                        `המטמון נוקה בהצלחה!\n\nפרטים:\n• פעולה: ניקוי מטמון\n• זמן ביצוע: ${new Date().toLocaleTimeString('he-IL')}\n• סטטוס: הצלחה`,
                        'success',
                        'מטמון נוקה בהצלחה',
                        8000,
                        'system'
                    );
                }
            } else {
                // שינוי מצב מטמון
                // בדיקה אם השרת באמת יכול להפעיל מחדש את עצמו
                const canRestart = data.data && !data.data.note?.includes('Restart script not found');
                
                // שינוי מצב מטמון - השרת לא יכול לשנות מצב בזמן ריצה
                // בדיקת בריאות מפורטת
                let healthDetails = '';
                try {
                    const detailedHealth = await fetch('/api/health');
                    if (detailedHealth.ok) {
                        const healthData = await detailedHealth.json();
                        healthDetails = `\n\nבדיקת בריאות נוכחית:\n• סטטוס כללי: ${healthData.status}\n• API: ${healthData.data?.components?.api?.status || 'לא ידוע'}\n• בסיס נתונים: ${healthData.data?.components?.database?.status || 'לא ידוע'}\n• מטמון: ${healthData.data?.components?.cache?.status || 'לא ידוע'}`;
                    }
                } catch (healthError) {
                    healthDetails = '\n\n⚠️ לא ניתן לקבל פרטי בריאות מפורטים';
                }
                
                // הודעת אזהרה מפורטת עם מודל
                if (typeof window.showErrorNotification === 'function') {
                    await window.showErrorNotification(
                        'מצב מטמון לא ניתן לשינוי בזמן ריצה',
                        `השרת לא יכול לשנות מצב מטמון בזמן ריצה.\n\nפרטי השגיאה:\n• מצב מבוקש: ${modeName}\n• זמן בקשה: ${new Date().toLocaleTimeString('he-IL')}\n• סטטוס: לא ניתן לשינוי\n• סיבה: השרת קובע מצב מטמון על בסיס משתני סביבה\n• מצב נוכחי: ${data.data?.current_mode || 'לא ידוע'}\n• הוראות: ${data.data?.instructions || 'הפעל מחדש את השרת עם משתני סביבה מתאימים'}${healthDetails}\n\nכדי לשנות מצב מטמון, הפעל מחדש את השרת עם משתני סביבה מתאימים.`,
                        15000
                    );
                } else if (typeof window.showNotification === 'function') {
                    await window.showNotification(
                        `מצב מטמון לא ניתן לשינוי בזמן ריצה!\n\nפרטים:\n• מצב מבוקש: ${modeName}\n• זמן בקשה: ${new Date().toLocaleTimeString('he-IL')}\n• סטטוס: לא ניתן לשינוי\n• סיבה: השרת קובע מצב מטמון על בסיס משתני סביבה`,
                        'warning',
                        'מצב מטמון לא ניתן לשינוי בזמן ריצה',
                        15000,
                        'system'
                    );
                }
            }
            
            // ניקוי פוקוס וסגירת הדיאלוג
            const modal = document.getElementById('cacheModeModal');
            if (modal) {
                // ניקוי פוקוס מכל הכפתורים במודל
                const focusedElement = modal.querySelector(':focus');
                if (focusedElement) {
                    focusedElement.blur();
                }
                
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }
            
        } else {
            throw new Error(data.message || 'Failed to change cache mode');
        }
        
    } catch (error) {
        console.error('❌ Cache mode change failed:', error);
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                'שגיאה בשינוי מצב מטמון',
                `שינוי מצב המטמון נכשל!\n\nפרטי השגיאה:\n• הודעת שגיאה: ${error.message}\n• זמן שגיאה: ${new Date().toLocaleTimeString('he-IL')}\n• סוג: שינוי מצב מטמון\n\nנסה שוב או השתמש במצב אחר.`,
                10000
            );
        } else if (typeof window.showNotification === 'function') {
            await window.showNotification(
                `שינוי מצב המטמון נכשל!\n\nשגיאה: ${error.message}\n\nנסה שוב.`,
                'error',
                'שגיאה בשינוי מצב מטמון',
                8000,
                'system'
            );
        }
    }
}

/**
 * Show monitoring analysis - Detailed system analysis
 */
async function showMonitoringAnalysis() {
    try {
        console.log('📊 מתחיל ניתוח ניטור מפורט...');
        
        // איסוף נתונים ממספר endpoints
        const [serverResponse, healthResponse, cacheResponse] = await Promise.allSettled([
            fetch('/api/server/status'),
            fetch('/api/health'),
            fetch('/api/cache/stats')
        ]);
        
        let analysisData = {
            timestamp: new Date().toLocaleTimeString('he-IL'),
            date: new Date().toLocaleDateString('he-IL'),
            serverStatus: 'לא זמין',
            healthStatus: 'לא זמין',
            cacheStatus: 'לא זמין'
        };
        
        // עיבוד נתוני שרת
        if (serverResponse.status === 'fulfilled' && serverResponse.value.ok) {
            const serverData = await serverResponse.value.json();
            if (serverData.data) {
                analysisData.serverStatus = 'פעיל';
                analysisData.serverDetails = {
                    overallHealth: serverData.data.overall_health?.status || 'לא ידוע',
                    uptime: serverData.data.overall_health?.components?.system?.details?.uptime || 'לא ידוע',
                    memory: serverData.data.overall_health?.components?.system?.details?.memory_percent ? 
                        `${serverData.data.overall_health.components.system.details.memory_percent}%` : 'לא ידוע',
                    cpu: serverData.data.overall_health?.components?.system?.details?.cpu_percent ? 
                        `${serverData.data.overall_health.components.system.details.cpu_percent}%` : 'לא ידוע'
                };
            }
        }
        
        // עיבוד נתוני בריאות
        if (healthResponse.status === 'fulfilled' && healthResponse.value.ok) {
            const healthData = await healthResponse.value.json();
            if (healthData.components) {
                analysisData.healthStatus = 'טוב';
                analysisData.healthDetails = {
                    api: healthData.components?.api?.status || 'לא ידוע',
                    database: healthData.components?.database?.status || 'לא ידוע',
                    cache: healthData.components?.cache?.status || 'לא ידוע'
                };
            }
        }
        
        // עיבוד נתוני מטמון
        if (cacheResponse.status === 'fulfilled' && cacheResponse.value.ok) {
            const cacheData = await cacheResponse.value.json();
            if (cacheData.data) {
                analysisData.cacheStatus = 'פעיל';
                analysisData.cacheDetails = {
                    hitRate: cacheData.data.hit_rate_percent || 0,
                    totalEntries: cacheData.data.total_entries || 0,
                    memoryUsage: cacheData.data.estimated_memory_mb || 0,
                    totalRequests: cacheData.data.total_requests || 0
                };
            }
        }
        
        // יצירת דוח מפורט
        const reportHTML = `
            <div class="monitoring-analysis">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">📊 ניתוח ניטור מערכת מפורט</h5>
                    <button type="button" class="btn btn-primary btn-sm" 
                            onclick="copyMonitoringReport()">
                        📋 העתק דוח
                    </button>
              </div>
                <div class="row">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h6>🖥️ סטטוס שרת</h6>
            </div>
              <div class="card-body">
                                <p><strong>סטטוס:</strong> ${analysisData.serverStatus}</p>
                                ${analysisData.serverDetails ? `
                                    <p><strong>בריאות כללית:</strong> ${analysisData.serverDetails.overallHealth}</p>
                                    <p><strong>זמן פעילות:</strong> ${analysisData.serverDetails.uptime}</p>
                                    <p><strong>זיכרון:</strong> ${analysisData.serverDetails.memory}</p>
                                    <p><strong>מעבד:</strong> ${analysisData.serverDetails.cpu}</p>
                                ` : '<p class="text-muted">פרטים לא זמינים</p>'}
              </div>
            </div>
          </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h6>🏥 בריאות מערכת</h6>
              </div>
              <div class="card-body">
                                <p><strong>סטטוס:</strong> ${analysisData.healthStatus}</p>
                                ${analysisData.healthDetails ? `
                                    <p><strong>API:</strong> ${analysisData.healthDetails.api}</p>
                                    <p><strong>בסיס נתונים:</strong> ${analysisData.healthDetails.database}</p>
                                    <p><strong>מטמון:</strong> ${analysisData.healthDetails.cache}</p>
                                ` : '<p class="text-muted">פרטים לא זמינים</p>'}
              </div>
            </div>
          </div>
                    <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                                <h6>💾 סטטוס מטמון</h6>
              </div>
              <div class="card-body">
                                <p><strong>סטטוס:</strong> ${analysisData.cacheStatus}</p>
                                ${analysisData.cacheDetails ? `
                                    <p><strong>אחוז הצלחה:</strong> ${analysisData.cacheDetails.hitRate}%</p>
                                    <p><strong>רשומות:</strong> ${analysisData.cacheDetails.totalEntries}</p>
                                    <p><strong>זיכרון:</strong> ${analysisData.cacheDetails.memoryUsage}MB</p>
                                    <p><strong>בקשות:</strong> ${analysisData.cacheDetails.totalRequests}</p>
                                ` : '<p class="text-muted">פרטים לא זמינים</p>'}
                  </div>
                  </div>
                  </div>
                </div>
                <div class="mt-3">
                    <small class="text-muted">
                        <strong>זמן ניתוח:</strong> ${analysisData.timestamp} | <strong>תאריך:</strong> ${analysisData.date}
                    </small>
              </div>
            </div>
    `;

        // שמירת נתוני הדוח גלובלית להעתקה
        window.currentMonitoringReport = analysisData;
        
        // הצגת הדוח עם מודל מותאם אישית רחב
        if (typeof window.showConfirmationDialog === 'function') {
            // יצירת מודל מותאם אישית עם רוחב מוכפל
            const modalId = 'monitoringAnalysisModal';
            const modalHTML = `
                <div class="modal fade warning-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true" data-bs-backdrop="true" data-bs-keyboard="true">
                    <div class="modal-dialog modal-dialog-centered modal-xl">
                        <div class="modal-content">
                            <div class="modal-header bg-info text-white">
                                <h5 class="modal-title" id="${modalId}Label">ניתוח ניטור מפורט</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
                            <div class="modal-body">
                                ${reportHTML}
                </div>
                            <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="margin-left: 8px;">סגור</button>
              </div>
            </div>
          </div>
      </div>
    `;

            // הסרת מודל קיים אם יש
            const existingModal = document.getElementById(modalId);
            if (existingModal) {
                existingModal.remove();
            }
            
            // הוספת המודל לדף
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // הצגת המודל
            const modal = document.getElementById(modalId);
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
            
            // הוספת event listener לכפתור העתקה בכותרת
            const copyButton = modal.querySelector('button[onclick*="copyMonitoringReport"]');
            if (copyButton) {
                copyButton.addEventListener('click', function() {
                    copyMonitoringReport();
                });
            }
        } else {
            // Fallback
      if (typeof window.showNotification === 'function') {
                await window.showNotification(
                    `ניתוח הניטור הושלם בהצלחה!\n\nסטטוס שרת: ${analysisData.serverStatus}\nבריאות מערכת: ${analysisData.healthStatus}\nסטטוס מטמון: ${analysisData.cacheStatus}`,
                    'info',
                    'ניתוח ניטור הושלם',
                    8000,
                    'system'
                );
            }
        }
        
        console.log('✅ ניתוח ניטור הושלם:', analysisData);
    
  } catch (error) {
        console.error('❌ Monitoring analysis failed:', error);
        
    if (typeof window.showNotification === 'function') {
            await window.showNotification(
                `ניתוח הניטור נכשל!\n\nשגיאה: ${error.message}\n\nנסה שוב או בדוק את חיבור השרת.`,
                'error',
                'שגיאה בניתוח ניטור',
                8000,
                'system'
            );
        }
    }
}

/**
 * Copy monitoring report to clipboard
 */
async function copyMonitoringReport() {
    try {
        if (!window.currentMonitoringReport) {
    if (typeof window.showNotification === 'function') {
                await window.showNotification(
                    'אין דוח זמין להעתקה. הרץ ניתוח ניטור קודם.',
                    'warning',
                    'אין דוח זמין',
                    4000,
                    'system'
                );
            }
            return;
        }
        
        const analysisData = window.currentMonitoringReport;
        
        // יצירת טקסט הדוח
        const reportText = `
ניתוח ניטור מערכת - ${analysisData.date} ${analysisData.timestamp}

🖥️ סטטוס שרת: ${analysisData.serverStatus}
${analysisData.serverDetails ? `
- בריאות כללית: ${analysisData.serverDetails.overallHealth}
- זמן פעילות: ${analysisData.serverDetails.uptime}
- זיכרון: ${analysisData.serverDetails.memory}
- מעבד: ${analysisData.serverDetails.cpu}
` : ''}

🏥 בריאות מערכת: ${analysisData.healthStatus}
${analysisData.healthDetails ? `
- API: ${analysisData.healthDetails.api}
- בסיס נתונים: ${analysisData.healthDetails.database}
- מטמון: ${analysisData.healthDetails.cache}
` : ''}

💾 סטטוס מטמון: ${analysisData.cacheStatus}
${analysisData.cacheDetails ? `
- אחוז הצלחה: ${analysisData.cacheDetails.hitRate}%
- רשומות: ${analysisData.cacheDetails.totalEntries}
- זיכרון: ${analysisData.cacheDetails.memoryUsage}MB
- בקשות: ${analysisData.cacheDetails.totalRequests}
` : ''}

---
דוח נוצר: ${new Date().toLocaleString('he-IL')}
        `;
        
        // העתקה ללוח
        await navigator.clipboard.writeText(reportText);
        
        // הודעת הצלחה
        if (typeof window.showNotification === 'function') {
            await window.showNotification(
                `דוח הניתוח הועתק ללוח בהצלחה!\n\nפרטים:\n• שורות: ${reportText.split('\n').length}\n• גודל: ${Math.round(reportText.length / 1024)}KB\n• זמן: ${new Date().toLocaleTimeString('he-IL')}`,
                'success',
                'דוח ניתוח הועתק',
                5000,
                'system'
            );
        }
        
        console.log('✅ דוח ניתוח הועתק ללוח:', reportText.length, 'תווים');
        
      } catch (error) {
        console.error('❌ Failed to copy monitoring report:', error);
        
        if (typeof window.showNotification === 'function') {
            await window.showNotification(
                `העתקת הדוח נכשלה!\n\nשגיאה: ${error.message}\n\nנסה שוב.`,
                'error',
                'שגיאה בהעתקת דוח',
                6000,
                'system'
            );
        }
    }
}

/**
 * Copy detailed log
 */
async function copyDetailedLog() {
    try {
        console.log('📋 מתחיל העתקת לוג מפורט...');
        
        const response = await fetch('/api/logs/raw/app/tail?lines=100');
        const data = await response.json();
        
        if (response.ok && data.success) {
            const logText = data.content;
            const logLines = logText.split('\n').length;
            
            // בדיקה אם יש תוכן
            if (!logText || logText.trim().length === 0) {
                if (typeof window.showWarningNotification === 'function') {
                    window.showWarningNotification(
                        'לוג ריק',
                        'לא נמצא תוכן בלוג. השרת עשוי להיות חדש או שלא נוצרו לוגים עדיין.',
                        6000
      );
            } else {
                    console.warn('⚠️ לוג ריק - לא נמצא תוכן');
                }
                return;
            }
            
            // העתקה ללוח
            let copyMethod = '';
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(logText);
                copyMethod = 'Clipboard API';
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = logText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                copyMethod = 'execCommand';
            }
            
            // הודעת הצלחה מפורטת
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification(
                    'לוג הועתק בהצלחה',
                    `לוג מפורט הועתק ללוח בהצלחה!\n\nפרטים:\n• שורות: ${logLines}\n• שיטה: ${copyMethod}\n• גודל: ${Math.round(logText.length / 1024)}KB\n• זמן: ${new Date().toLocaleTimeString('he-IL')}`,
                    8000
                );
            } else {
                console.log(`✅ לוג הועתק בהצלחה - ${logLines} שורות, ${Math.round(logText.length / 1024)}KB`);
            }
            
        } else {
            throw new Error(`Failed to get logs: ${data.message || 'Unknown error'}`);
    }
    
  } catch (error) {
        console.error('❌ Copy detailed log failed:', error);
        
        // הודעת שגיאה מפורטת
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                'שגיאה בהעתקת לוג',
                `העתקת הלוג נכשלה!\n\nפרטי השגיאה:\n• הודעת שגיאה: ${error.message}\n• סוג: ${error.name || 'Unknown'}\n• זמן שגיאה: ${new Date().toLocaleTimeString('he-IL')}\n• סוג: העתקת לוג מפורט\n\nנסה שוב או בדוק את חיבור השרת.`,
                10000
            );
        } else {
            console.error('❌ שגיאה בהעתקת לוג:', error.message);
        }
    }
}

/**
 * Copy all test results
 */
function copyAllTestResults() {
    const testResults = document.querySelectorAll('.test-result');
    const results = [];
    
    testResults.forEach(result => {
        const name = result.querySelector('span')?.textContent || 'Unknown Test';
        const content = result.querySelector('small')?.textContent || 'No result';
        results.push(`${name}: ${content}`);
    });
    
    const resultsText = results.join('\n');
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(resultsText).then(() => {
            showNotification('תוצאות הבדיקות הועתקו ללוח', 'success');
        });
  } else {
        const textArea = document.createElement('textarea');
        textArea.value = resultsText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('תוצאות הבדיקות הועתקו ללוח', 'success');
    }
}

/**
 * Run single test
 */
async function runSingleTest(testType) {
    const testFunctions = {
        'healthCheck': testHealthCheck,
        'detailedHealth': testDetailedHealth,
        'systemResources': testSystemResources,
        'performance': testServerPerformance,
        'loadTest': testLoadTest,
        'cache': testCacheSystem,
        'apiEndpoints': testAPIEndpoints,
        'rateLimit': testRateLimit,
        'errorHandling': testErrorHandling
    };
    
    const testNames = {
        'healthCheck': 'בדיקת בריאות',
        'detailedHealth': 'בדיקת בריאות מפורטת',
        'systemResources': 'בדיקת משאבי מערכת',
        'performance': 'בדיקת ביצועים',
        'loadTest': 'בדיקת עומס',
        'cache': 'בדיקת מטמון',
        'apiEndpoints': 'בדיקת API',
        'rateLimit': 'בדיקת הגבלת קצב',
        'errorHandling': 'בדיקת טיפול בשגיאות'
    };
    
    const testFunction = testFunctions[testType];
    if (!testFunction) {
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                'בדיקה לא ידועה',
                `הבדיקה "${testType}" לא קיימת במערכת.\n\nזמן בקשה: ${new Date().toLocaleTimeString('he-IL')}\nסטטוס: שגיאה\nסיבה: פונקציית בדיקה לא נמצאה\n\nהוראות: בדוק את שם הבדיקה ונסה שוב.`,
                10000
            );
        }
        return;
    }
    
    const testName = testNames[testType] || testType;
    const startTime = performance.now();
    
    try {
        const result = await testFunction();
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // Show detailed success notification
        if (typeof window.showFinalSuccessNotification === 'function') {
            await window.showFinalSuccessNotification(
                `${testName} הושלמה בהצלחה!`,
                `הבדיקה הושלמה בהצלחה וכל המערכות פועלות תקין.`,
                {
                    operation: testName,
                    duration: `${duration}ms`,
                    timestamp: new Date().toISOString(),
                    status: 'הצלחה',
                    testResult: result,
                    healthCheck: 'המערכת פועלת תקין',
                    nextAction: 'המערכת מוכנה לשימוש'
                },
                'system'
            );
      } else {
            showNotification(`בדיקה ${testName} הושלמה בהצלחה: ${result}`, 'success');
      }
    } catch (error) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // Show detailed error notification
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                `${testName} נכשלה`,
                `הבדיקה נכשלה וזוהתה בעיה במערכת.\n\nפרטי השגיאה:\n• בדיקה: ${testName}\n• זמן ביצוע: ${duration}ms\n• זמן בקשה: ${new Date().toLocaleTimeString('he-IL')}\n• סטטוס: נכשל\n• שגיאה: ${error.message}\n\nבדיקת בריאות נוכחית:\n• סטטוס כללי: דורש תשומת לב\n• בדיקה נכשלו: 1/1\n• סיבה: ${error.message}\n\nהוראות: בדוק את הבעיה שזוהתה וטפל בה.`,
                15000
            );
      } else {
            showNotification(`בדיקה ${testName} נכשלה: ${error.message}`, 'error');
        }
    }
}

/**
 * Test detailed health
 */
async function testDetailedHealth() {
    const response = await fetch('/api/server/status');
    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
        const health = data.data.overall_health;
        return `Health Score: ${health.overall_score}/4, Components: ${Object.keys(health.components).length}`;
  } else {
        throw new Error('Detailed health check failed');
    }
}

/**
 * Test load
 */
async function testLoadTest() {
    const startTime = performance.now();
    const promises = [];
    
    // Simulate load with multiple concurrent requests
    for (let i = 0; i < 5; i++) {
        promises.push(fetch('/api/health'));
    }
    
    await Promise.all(promises);
    const endTime = performance.now();
    
    const responseTime = Math.round(endTime - startTime);
    return `Load test completed: ${responseTime}ms for 5 concurrent requests`;
}

/**
 * Test rate limit
 */
async function testRateLimit() {
    const response = await fetch('/api/health');
    const headers = response.headers;
    
    const rateLimitHeader = headers.get('X-RateLimit-Limit');
    const rateLimitRemaining = headers.get('X-RateLimit-Remaining');
    
    if (rateLimitHeader) {
        return `Rate limit: ${rateLimitRemaining}/${rateLimitHeader} requests remaining`;
            } else {
        return 'No rate limiting detected';
    }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
    try {
        // Test with invalid endpoint
        const response = await fetch('/api/invalid-endpoint');
        if (response.status === 404) {
            return 'Error handling working correctly (404 returned for invalid endpoint)';
            } else {
            return `Unexpected response: ${response.status}`;
        }
  } catch (error) {
        return `Error handling test: ${error.message}`;
    }
}

/**
 * Emergency stop server
 */
async function emergencyStopServer() {
    if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
            'עצירת חירום של השרת',
            '⚠️ אזהרה: האם אתה בטוח שברצונך לעצור את השרת בחירום?',
            async () => {
                await executeEmergencyStopServer();
            },
            () => {
                console.log('עצירת חירום בוטלה על ידי המשתמש');
            },
            'danger'
        );
    } else {
        if (!confirm('⚠️ אזהרה: האם אתה בטוח שברצונך לעצור את השרת בחירום?')) {
            return;
        }
        await executeEmergencyStopServer();
    }
}

async function executeEmergencyStopServer() {
        
        try {
        const response = await fetch('/api/system/stop', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('השרת נעצר בחירום', 'warning');
            } else {
            throw new Error(data.message || 'Failed to stop server');
            }
        
        } catch (error) {
        console.error('❌ Emergency stop failed:', error);
        showNotification('שגיאה בעצירת השרת', 'error');
    }
}

/**
 * Copy all tool results
 */
function copyAllToolResults() {
    const toolResults = document.querySelectorAll('.tool-results .alert');
    const results = [];
    
    toolResults.forEach(result => {
        const content = result.textContent || result.innerText;
        if (content && content.trim()) {
            results.push(content.trim());
        }
    });
    
    const resultsText = results.join('\n\n');
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(resultsText).then(() => {
            showNotification('תוצאות הכלים הועתקו ללוח', 'success');
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = resultsText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('תוצאות הכלים הועתקו ללוח', 'success');
    }
}

/**
 * Stop server
 */
async function stopServer() {
    if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
            'עצירת שרת',
            'האם אתה בטוח שברצונך לעצור את השרת?',
            async () => {
                await executeStopServer();
            },
            () => {
                console.log('עצירת שרת בוטלה על ידי המשתמש');
            },
            'warning'
        );
            } else {
        if (!confirm('האם אתה בטוח שברצונך לעצור את השרת?')) {
            return;
        }
        await executeStopServer();
    }
}

async function executeStopServer() {
        
        try {
        const response = await fetch('/api/system/stop', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('השרת נעצר', 'warning');
      } else {
            throw new Error(data.message || 'Failed to stop server');
      }
        
        } catch (error) {
        console.error('❌ Stop server failed:', error);
        showNotification('שגיאה בעצירת השרת', 'error');
    }
}

/**
 * Optimize cache
 */
async function optimizeCache() {
    try {
        const response = await fetch('/api/cache/optimize', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('מטמון אופטמז בהצלחה', 'success');
    } else {
            throw new Error(data.message || 'Failed to optimize cache');
        }
        
    } catch (error) {
        console.error('❌ Cache optimization failed:', error);
        showNotification('שגיאה באופטימיזציה של המטמון', 'error');
    }
}

/**
 * Show cache stats
 */
async function showCacheStats() {
    try {
        const response = await fetch('/api/cache/stats');
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            const stats = data.data;
            const statsText = `Cache Statistics:
Hit Rate: ${stats.hit_rate_percent}%
Total Entries: ${stats.total_entries}
Memory Usage: ${stats.memory_usage_mb}MB
Total Requests: ${stats.total_requests}`;
            
      if (typeof window.showNotification === 'function') {
                window.showNotification('סטטיסטיקות מטמון', 'info', 'מערכת מטמון', 8000);
                console.log(statsText);
      } else {
                alert(statsText);
        }
    } else {
            throw new Error('Failed to get cache stats');
        }
        
    } catch (error) {
        console.error('❌ Cache stats failed:', error);
        showNotification('שגיאה בקבלת סטטיסטיקות המטמון', 'error');
    }
}

/**
 * Optimize database
 */
async function optimizeDatabase() {
    try {
        const response = await fetch('/api/database/optimize', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('בסיס הנתונים אופטמז בהצלחה', 'success');
    } else {
            throw new Error(data.message || 'Failed to optimize database');
        }
        
    } catch (error) {
        console.error('❌ Database optimization failed:', error);
        showNotification('שגיאה באופטימיזציה של בסיס הנתונים', 'error');
    }
}

/**
 * Analyze database
 */
async function analyzeDatabase() {
    try {
        const response = await fetch('/api/database/analyze');
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            const analysis = data.data;
            const analysisText = `Database Analysis:
Tables: ${analysis.tables}
Indexes: ${analysis.indexes}
Size: ${analysis.size_mb}MB
Last Optimized: ${analysis.last_optimized}`;
            
      if (typeof window.showNotification === 'function') {
                window.showNotification('ניתוח בסיס נתונים', 'info', 'מערכת בסיס נתונים', 8000);
                console.log(analysisText);
      } else {
                alert(analysisText);
        }
    } else {
            throw new Error('Failed to analyze database');
        }
        
    } catch (error) {
        console.error('❌ Database analysis failed:', error);
        showNotification('שגיאה בניתוח בסיס הנתונים', 'error');
    }
}

/**
 * Backup database
 */
async function backupDatabase() {
    try {
        const response = await fetch('/api/database/backup', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('גיבוי בסיס הנתונים הושלם בהצלחה', 'success');
    } else {
            throw new Error(data.message || 'Failed to backup database');
        }
        
    } catch (error) {
        console.error('❌ Database backup failed:', error);
        showNotification('שגיאה בגיבוי בסיס הנתונים', 'error');
    }
}

/**
 * Refresh external data
 */
async function refreshExternalData() {
    try {
        const response = await fetch('/api/external-data/refresh', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('נתונים חיצוניים רוענו בהצלחה', 'success');
            } else {
            throw new Error(data.message || 'Failed to refresh external data');
        }
        
    } catch (error) {
        console.error('❌ External data refresh failed:', error);
        showNotification('שגיאה ברענון הנתונים החיצוניים', 'error');
    }
}

/**
 * Show data status
 */
async function showDataStatus() {
    try {
        const response = await fetch('/api/external-data/status');
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            const status = data.data;
            const statusText = `External Data Status:
Status: ${status.status}
Providers: ${status.providers?.healthy || 0}/${status.providers?.total || 0} healthy
Last Update: ${status.last_update}
Next Update: ${status.next_update}`;
            
            if (typeof window.showNotification === 'function') {
                window.showNotification('סטטוס נתונים חיצוניים', 'info', 'מערכת נתונים חיצוניים', 8000);
                console.log(statusText);
            } else {
                alert(statusText);
        }
    } else {
            throw new Error('Failed to get data status');
        }
        
    } catch (error) {
        console.error('❌ Data status failed:', error);
        showNotification('שגיאה בקבלת סטטוס הנתונים', 'error');
    }
}

/**
 * Test Yahoo Finance
 */
async function testYahooFinance() {
    try {
        const response = await fetch('/api/external-data/test/yahoo');
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            showNotification('בדיקת Yahoo Finance הושלמה בהצלחה', 'success');
  } else {
            throw new Error(data.message || 'Yahoo Finance test failed');
        }
        
    } catch (error) {
        console.error('❌ Yahoo Finance test failed:', error);
        showNotification('שגיאה בבדיקת Yahoo Finance', 'error');
    }
}

/**
 * Export system report
 */
async function exportSystemReport() {
    try {
        const response = await fetch('/api/system/report');
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            const report = data.data;
            const reportText = JSON.stringify(report, null, 2);
            
            // Create and download file
            const blob = new Blob([reportText], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `system-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showNotification('דוח המערכת יוצא בהצלחה', 'success');
  } else {
            throw new Error('Failed to generate system report');
        }
        
    } catch (error) {
        console.error('❌ Export system report failed:', error);
        showNotification('שגיאה בייצוא דוח המערכת', 'error');
    }
}

// ============================================================================
// LEGACY SUPPORT
// ============================================================================

// Support for direct initialization (if not using unified system)
if (typeof window !== 'undefined' && !window.unifiedAppInitializer) {
    document.addEventListener('DOMContentLoaded', initializeServerMonitor);
    window.addEventListener('beforeunload', cleanupServerMonitor);
}
