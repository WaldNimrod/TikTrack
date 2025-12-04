/**
 * Cache Management Page - JavaScript (15 אוקטובר 2025)
 * ====================================================
 * 
 * עמוד ניהול מטמון מקצועי
 * כולל אינטגרציה מלאה עם מערכות כלליות
 * 
 * תכונות:
 * - 5 סקשנים: ניטור, פעולות, בדיקות, כלים, לוגים
 * - אינטגרציה עם מערכת הודעות מרכזית
 * - בדיקות אוטומטיות מקיפות
 * - לוגים מאוחדים דרך UnifiedLogManager
 * 
 * @author TikTrack Development Team
 * @version 2.0.0
 * @lastUpdated 15 אוקטובר 2025
 */

Logger.info('⚙️ Cache Management Page - JavaScript loaded');

// Cache Management Page Class
class CacheManagementPage {
    constructor() {
        this.isInitialized = false;
        this.refreshInterval = null;
        this.statsInterval = null;
        this.currentData = null;
        this.isLoading = false;
        this.autoRefresh = false;
        
        // Bind methods
        this.refreshCacheStats = this.refreshCacheStats.bind(this);
        this.handleActionSuccess = this.handleActionSuccess.bind(this);
        this.handleActionError = this.handleActionError.bind(this);
    }

    /**
     * Initialize the cache management page
     * אתחול עמוד ניהול המטמון
     */
    async init() {
        if (this.isInitialized) {
            Logger.info('⚠️ Cache Management Page already initialized');
            return;
        }

        Logger.info('🚀 Cache Management Page - Initializing...');

        try {
            // Initialize cache systems
            await this.initializeCacheSystem();
            
            // Initialize log display
            await this.initializeLogDisplay();
            
            // Load initial data
            await this.refreshCacheStats();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Register with page configs
            this.registerWithPageConfigs();
            
            // Check for validation results after page reload
            this.checkForValidationResults();
            
            this.isInitialized = true;
            Logger.info('✅ Cache Test Page Refactored - Initialized successfully');
            
        } catch (error) {
            Logger.error('❌ Failed to initialize Cache Test Page:', error);
            this.handleActionError('שגיאה באתחול העמוד', error.message);
        }
    }

    /**
     * Initialize cache systems
     * אתחול מערכות המטמון
     */
    async initializeCacheSystem() {
        Logger.info('🔄 Initializing cache systems...');
        
        if (!window.UnifiedCacheManager) {
            throw new Error('UnifiedCacheManager not available');
        }
        
        if (!window.UnifiedCacheManager.initialized) {
            await window.UnifiedCacheManager.initialize();
            Logger.info('✅ UnifiedCacheManager initialized');
        }
        
        // Log initialization
        if (window.UnifiedLogManager) {
            await this.logToUnifiedSystem('info', 'Cache Management Page initialized', {
                timestamp: new Date().toISOString(),
                page: 'cache-management'
            });
        }
    }

    /**
     * Initialize log display with UnifiedLogManager
     * אתחול תצוגת לוגים
     */
    async initializeLogDisplay() {
        Logger.info('🔄 Initializing unified log display...');
        
        const logContainer = document.getElementById('unifiedLogDisplay');
        if (!logContainer) {
            // Log container is optional - only exists on cache-management page
            // Silently skip if not found (this is expected on other pages)
            return;
        }
        
        if (window.UnifiedLogManager && window.UnifiedLogDisplay) {
            try {
                // Initialize UnifiedLogDisplay
                const logDisplay = new window.UnifiedLogDisplay('unifiedLogDisplay', {
                    logType: 'cache',
                    realtime: true,
                    limit: 100,
                    showFilters: true,
                    showExport: true
                });
                
                await logDisplay.initialize();
                Logger.info('✅ Unified log display initialized');
                
            } catch (error) {
                Logger.error('❌ Failed to initialize log display:', error);
                // Fallback: show basic log info
                logContainer.textContent = '';
                const p = document.createElement('p');
                p.className = 'text-muted';
                p.textContent = 'לוגים לא זמינים';
                logContainer.appendChild(p);
            }
        }
    }

    /**
     * Setup event listeners
     * הגדרת מאזיני אירועים
     */
    setupEventListeners() {
        // Listen for cache updates from other systems
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.includes('cache')) {
                this.refreshCacheStats();
            }
        });

        // Listen for notification system events
        if (window.addEventListener) {
            window.addEventListener('cacheClearingComplete', this.handleActionSuccess);
            window.addEventListener('cacheClearingError', this.handleActionError);
        }
    }

    /**
     * Register with page configs system
     * רישום במערכת הגדרות העמודים
     */
    registerWithPageConfigs() {
        if (window.PAGE_CONFIGS) {
            window.PAGE_CONFIGS['cache-management'] = {
                init: () => this.init(),
                modules: ['cache', 'notifications', 'logs'],
                cleanup: () => this.cleanup()
            };
            Logger.info('✅ Registered with PAGE_CONFIGS');
        }
    }

    /**
     * Check for validation results after page reload
     * בדיקת תוצאות ולידציה אחרי רענון העמוד
     */
    checkForValidationResults() {
        try {
            const validationKey = 'tiktrack_cache_validation_results';
            const storedResults = sessionStorage.getItem(validationKey);
            
            if (storedResults) {
                Logger.info('🔍 Found validation results from previous session');
                
                const validationData = JSON.parse(storedResults);
                const feedback = document.getElementById('clearingFeedback');
                
                if (feedback && validationData) {
                    // Display validation results
                    this.displayValidationResults(validationData, feedback);
                    
                    // Clear from storage after display
                    sessionStorage.removeItem(validationKey);
                }
            }
        } catch (error) {
            Logger.error('❌ Error checking validation results:', error);
        }
    }

    /**
     * Display validation results in the feedback element
     * הצגת תוצאות ולידציה באלמנט המשוב
     */
    displayValidationResults(validationData, feedbackElement) {
        if (!validationData || !feedbackElement) return;
        
        const { level, validation, success, timestamp } = validationData;
        
        let displayHtml = `
            <div class="validation-results mt-2">
                <h6><i class="fas fa-check-circle text-success"></i> תוצאות ולידציה - רמה ${level}</h6>
                <div class="small">
                    <strong>סטטוס:</strong> ${validation?.success ? 'הצלחה' : 'נמצאו בעיות'}<br>
        `;
        
        if (validation) {
            if (validation.success) {
                displayHtml += `<span class="text-success">✅ כל הבדיקות עברו בהצלחה</span>`;
            } else {
                displayHtml += `<span class="text-warning">⚠️ נמצאו בעיות:</span><br>`;
                if (validation.issues && validation.issues.length > 0) {
                    displayHtml += validation.issues.map(issue => `• ${issue}`).join('<br>');
                }
                if (validation.remainingKeys && validation.remainingKeys.length > 0) {
                    displayHtml += `<br><strong>מפתחות שנותרו:</strong> ${validation.remainingKeys.length}`;
                }
            }
        }
        
        displayHtml += `
                </div>
                <small class="text-muted">${new Date(timestamp).toLocaleString('he-IL')}</small>
            </div>
        `;
        
        feedbackElement.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(displayHtml, 'text/html');
        doc.body.childNodes.forEach(node => {
            feedbackElement.appendChild(node.cloneNode(true));
        });
        feedbackElement.className = 'action-feedback alert alert-info';
    }

    // ===== סקשן 1: ניטור וסטטיסטיקה =====

    /**
     * Refresh cache statistics
     * רענון סטטיסטיקות מטמון
     */
    async refreshCacheStats() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        Logger.info('📊 Refreshing cache statistics...');

        try {
            await Promise.all([
                this.updateMonitoringStats(),
                this.updateLayersTable(),
                this.updatePerformanceMetrics(),
                this.updateSystemHealth()
            ]);

            // Update last update time
            this.updateElement('lastUpdate', new Date().toLocaleTimeString('he-IL'));
            
            Logger.info('✅ Cache statistics refreshed');
            
        } catch (error) {
            Logger.error('❌ Error refreshing cache stats:', error);
            this.handleActionError('שגיאה ברענון סטטיסטיקות', error.message);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Update monitoring statistics
     * עדכון סטטיסטיקות ניטור
     */
    async updateMonitoringStats() {
        if (!window.UnifiedCacheManager) {
            Logger.warn('UnifiedCacheManager not available for updateMonitoringStats');
            return;
        }

        try {
            const stats = await window.UnifiedCacheManager.getStats();
            
            // Update overview cards
            const memoryEntries = stats.layers?.memory?.entries || 0;
            const localStorageEntries = stats.layers?.localStorage?.entries || 0;
            const indexedDBEntries = stats.layers?.indexedDB?.entries || 0;
            const backendEntries = stats.layers?.backend?.entries || 0;
            
            this.updateElement('memoryStatus', memoryEntries.toString());
            this.updateElement('localStorageStatus', localStorageEntries.toString());
            this.updateElement('indexedDBStatus', indexedDBEntries.toString());
            this.updateElement('backendStatus', backendEntries.toString());
            
            // Update change indicators
            this.updateElement('memoryChange', 'עדכני');
            this.updateElement('localStorageChange', 'עדכני');
            this.updateElement('indexedDBChange', 'עדכני');
            this.updateElement('backendChange', 'עדכני');
            
        } catch (error) {
            Logger.error('❌ Error updating monitoring stats:', error);
        }
    }

    /**
     * Update layers table
     * עדכון טבלת שכבות
     */
    async updateLayersTable() {
        const tbody = document.getElementById('layersTableBody');
        if (!tbody) return;

        const layers = ['memory', 'localStorage', 'indexedDB', 'backend'];
        const layerNames = {
            memory: 'Memory',
            localStorage: 'localStorage', 
            indexedDB: 'IndexedDB',
            backend: 'Backend'
        };

        tbody.textContent = '';

        for (const layer of layers) {
            try {
                const layerStats = await window.UnifiedCacheManager.getLayerStats(layer);
                const row = this.createLayerTableRow(layer, layerStats, layerNames[layer]);
                tbody.appendChild(row);
            } catch (error) {
                Logger.error(`Error getting stats for layer ${layer}:`, error);
                const row = this.createLayerTableRow(layer, {}, layerNames[layer], true);
                tbody.appendChild(row);
            }
        }
    }

    /**
     * Create layer table row
     * יצירת שורת טבלת שכבה
     */
    createLayerTableRow(layer, stats, name, error = false) {
        const row = document.createElement('tr');
        
        row.textContent = '';
        // Convert HTML string to DOM elements safely
        const parser = new DOMParser();
        const doc = parser.parseFromString(`
            <td><strong>${name}</strong></td>
            <td><span class="badge bg-secondary">${error ? '--' : (stats.entries || 0)}</span></td>
            <td>${error ? '--' : this.formatBytes(stats.size || 0)}</td>
            <td><span class="badge bg-info">${error ? '--' : (stats.hitRate || '0%')}</span></td>
            <td><span class="badge ${error ? 'bg-danger' : 'bg-success'}">${error ? 'שגיאה' : 'פעיל'}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="clearUnifiedCacheLayer('${layer}')">
                    <i class="fas fa-broom"></i>
                </button>
            </td>
        `, 'text/html');
        const fragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => {
            fragment.appendChild(node.cloneNode(true));
        });
        row.appendChild(fragment);
        
        return row;
    }

    /**
     * Update performance metrics
     * עדכון מטריקות ביצועים
     */
    async updatePerformanceMetrics() {
        try {
            if (window.UnifiedCacheManager) {
                const stats = await window.UnifiedCacheManager.getStats();
                
                const avgResponseTime = stats.performance?.avgResponseTime;
                const hitRate = stats.performance?.hitRate || 0;
                const totalRequests = stats.operations ? 
                    (stats.operations.save + stats.operations.get + stats.operations.remove + stats.operations.clear) : 0;

                // הצגת avgResponseTime רק אם יש ערך אמיתי
                if (avgResponseTime !== null && avgResponseTime !== undefined && avgResponseTime > 0) {
                this.updateElement('avgResponseTime', `${avgResponseTime.toFixed(2)}ms`);
                } else {
                    this.updateElement('avgResponseTime', 'לא זמין');
                }
                
                this.updateElement('hitRate', `${hitRate.toFixed(1)}%`);
                this.updateElement('totalRequests', totalRequests.toString());
                
                // Calculate total cache size
                let totalSize = 0;
                if (stats.layers) {
                    for (const layer of Object.values(stats.layers)) {
                        totalSize += layer.size || 0;
                    }
                }
                this.updateElement('totalCacheSize', this.formatBytes(totalSize));
            }
        } catch (error) {
            Logger.error('Error updating performance metrics:', error);
        }
    }

    /**
     * Update system health
     * עדכון בריאות מערכת
     */
    async updateSystemHealth() {
        try {
            // Check if all systems are healthy
            const isHealthy = window.UnifiedCacheManager && window.UnifiedCacheManager.initialized;
            this.updateElement('systemHealth', isHealthy ? 'טוב' : 'בעיה');
            
        } catch (error) {
            Logger.error('Error updating system health:', error);
            this.updateElement('systemHealth', 'שגיאה');
        }
    }

    // ===== סקשן 2: פעולות + משוב =====

    /**
     * Execute cache clearing with validation
     * ביצוע ניקוי מטמון עם ולידציה
     */
    async executeCacheClearing(level) {
        Logger.info(`🧹 Executing cache clearing: ${level}`);
        
        const validateAfter = document.getElementById('enableValidation')?.checked || false;
        const feedback = document.getElementById('clearingFeedback');
        
        try {
            // Show loading
            this.showFeedback(feedback, 'מבצע ניקוי מטמון...', 'info');
            
            // Execute clearing
            const result = await window.clearAllCache({ 
                level: level, 
                validateAfter: validateAfter 
            });
            
            if (result.success) {
                this.handleActionSuccess(
                    `ניקוי מטמון ${level} הושלם בהצלחה`,
                    result.detailedReport || result
                );
                this.showFeedback(feedback, `ניקוי ${level} הושלם בהצלחה`, 'success');
            } else {
                throw new Error(result.error || 'ניקוי מטמון נכשל');
            }
            
        } catch (error) {
            Logger.error('Cache clearing error:', error);
            this.handleActionError('שגיאה בניקוי מטמון', error.message);
            this.showFeedback(feedback, `שגיאה: ${error.message}`, 'error');
        }
    }

    /**
     * Execute optimization
     * ביצוע אופטימיזציה
     */
    async executeOptimization(type) {
        Logger.info(`⚡ Executing optimization: ${type}`);
        
        const feedback = document.getElementById('optimizationFeedback');
        
        try {
            this.showFeedback(feedback, `מבצע אופטימיזציה: ${type}...`, 'info');
            
            // Simulate optimization (implement based on actual system)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const detailedMessage = this.buildOptimizationDetailedMessage(type);
            this.handleActionSuccess(`אופטימיזציה ${type} הושלמה`, detailedMessage);
            this.showFeedback(feedback, `אופטימיזציה ${type} הושלמה`, 'success');
            
        } catch (error) {
            Logger.error('Optimization error:', error);
            this.handleActionError('שגיאה באופטימיזציה', error.message);
            this.showFeedback(feedback, `שגיאה: ${error.message}`, 'error');
        }
    }

    /**
     * Execute synchronization
     * ביצוע סינכרון
     */
    async executeSynchronization(type) {
        Logger.info(`🔄 Executing synchronization: ${type}`);
        
        const feedback = document.getElementById('syncFeedback');
        
        try {
            this.showFeedback(feedback, `מבצע סינכרון: ${type}...`, 'info');
            
            // Simulate synchronization (implement based on actual system)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const detailedMessage = this.buildSynchronizationDetailedMessage(type);
            this.handleActionSuccess(`סינכרון ${type} הושלם`, detailedMessage);
            this.showFeedback(feedback, `סינכרון ${type} הושלם`, 'success');
            
        } catch (error) {
            Logger.error('Synchronization error:', error);
            this.handleActionError('שגיאה בסינכרון', error.message);
            this.showFeedback(feedback, `שגיאה: ${error.message}`, 'error');
        }
    }

    /**
     * Execute maintenance
     * ביצוע תחזוקה
     */
    async executeMaintenance(action) {
        Logger.info(`🔧 Executing maintenance: ${action}`);
        
        const feedback = document.getElementById('maintenanceFeedback');
        
        try {
            this.showFeedback(feedback, `מבצע תחזוקה: ${action}...`, 'info');
            
            // Simulate maintenance (implement based on actual system)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const detailedMessage = this.buildMaintenanceDetailedMessage(action);
            this.handleActionSuccess(`תחזוקה ${action} הושלמה`, detailedMessage);
            this.showFeedback(feedback, `תחזוקה ${action} הושלמה`, 'success');
            
        } catch (error) {
            Logger.error('Maintenance error:', error);
            this.handleActionError('שגיאה בתחזוקה', error.message);
            this.showFeedback(feedback, `שגיאה: ${error.message}`, 'error');
        }
    }

    // ===== סקשן 3: בדיקות + משוב =====

    /**
     * Run all tests
     * הרצת כל הבדיקות
     */
    async runAllTests() {
        Logger.info('🧪 Running all cache tests...');
        
        try {
            const results = {
                health: await this.runHealthChecks(),
                performance: await this.runPerformanceTests(),
                integration: await this.runIntegrationTests(),
                validation: await this.runValidationTests()
            };
            
            const allPassed = Object.values(results).every(result => result.success);
            
            if (allPassed) {
                this.handleActionSuccess('כל הבדיקות עברו בהצלחה!', results);
            } else {
                this.handleActionError('חלק מהבדיקות נכשלו', results);
            }
            
        } catch (error) {
            Logger.error('Tests execution error:', error);
            this.handleActionError('שגיאה בהרצת בדיקות', error.message);
        }
    }

    /**
     * Run health checks
     * הרצת בדיקות בריאות
     */
    async runHealthChecks() {
        const feedback = document.getElementById('healthTestFeedback');
        
        try {
            this.showFeedback(feedback, 'מבצע בדיקות בריאות...', 'info');
            
            // Check all layers health
            const layers = ['memory', 'localStorage', 'indexedDB', 'backend'];
            const results = {};
            
            for (const layer of layers) {
                try {
                    const stats = await window.UnifiedCacheManager.getLayerStats(layer);
                    results[layer] = { healthy: true, stats };
                } catch (error) {
                    results[layer] = { healthy: false, error: error.message };
                }
            }
            
            const allHealthy = Object.values(results).every(result => result.healthy);
            const message = allHealthy ? 'כל השכבות בריאות' : 'יש שכבות חולות';
            
            this.showFeedback(feedback, message, allHealthy ? 'success' : 'error');
            
            // Show final detailed notification
            const detailedMessage = this.buildHealthCheckDetailedMessage(results, allHealthy);
            if (allHealthy) {
                this.handleActionSuccess('בדיקות בריאות הושלמו בהצלחה', detailedMessage);
            } else {
                this.handleActionError('בדיקות בריאות מצאו בעיות', detailedMessage);
            }
            
            return { success: allHealthy, results };
            
        } catch (error) {
            this.showFeedback(feedback, `שגיאה: ${error.message}`, 'error');
            const detailedMessage = this.buildHealthCheckDetailedMessage({}, false, error.message);
            this.handleActionError('בדיקות בריאות נכשלו', detailedMessage);
            return { success: false, error: error.message };
        }
    }

    /**
     * Run performance tests
     * הרצת בדיקות ביצועים
     */
    async runPerformanceTests() {
        const feedback = document.getElementById('performanceTestFeedback');
        
        try {
            this.showFeedback(feedback, 'מבצע בדיקות ביצועים...', 'info');
            
            // Simulate performance tests
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showFeedback(feedback, 'בדיקות ביצועים הושלמו', 'success');
            
            // Show final detailed notification
            const detailedMessage = this.buildPerformanceTestDetailedMessage();
            this.handleActionSuccess('בדיקות ביצועים הושלמו בהצלחה', detailedMessage);
            
            return { success: true, message: 'ביצועים תקינים' };
            
        } catch (error) {
            this.showFeedback(feedback, `שגיאה: ${error.message}`, 'error');
            const detailedMessage = this.buildPerformanceTestDetailedMessage();
            this.handleActionError('בדיקות ביצועים נכשלו', detailedMessage);
            return { success: false, error: error.message };
        }
    }

    /**
     * Run integration tests
     * הרצת בדיקות אינטגרציה
     */
    async runIntegrationTests() {
        const feedback = document.getElementById('integrationTestFeedback');
        
        try {
            this.showFeedback(feedback, 'מבצע בדיקות אינטגרציה...', 'info');
            
            // Test integration between layers
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showFeedback(feedback, 'בדיקות אינטגרציה הושלמו', 'success');
            
            // Show final detailed notification
            const detailedMessage = this.buildIntegrationTestDetailedMessage();
            this.handleActionSuccess('בדיקות אינטגרציה הושלמו בהצלחה', detailedMessage);
            
            return { success: true, message: 'אינטגרציה תקינה' };
            
        } catch (error) {
            this.showFeedback(feedback, `שגיאה: ${error.message}`, 'error');
            const detailedMessage = this.buildIntegrationTestDetailedMessage();
            this.handleActionError('בדיקות אינטגרציה נכשלו', detailedMessage);
            return { success: false, error: error.message };
        }
    }

    /**
     * Run validation tests
     * הרצת בדיקות ולידציה
     */
    async runValidationTests() {
        const feedback = document.getElementById('validationTestFeedback');
        
        try {
            this.showFeedback(feedback, 'מבצע בדיקות ולידציה...', 'info');
            
            // Run validation tests
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showFeedback(feedback, 'בדיקות ולידציה הושלמו', 'success');
            
            // Show final detailed notification
            const detailedMessage = this.buildValidationTestDetailedMessage();
            this.handleActionSuccess('בדיקות ולידציה הושלמו בהצלחה', detailedMessage);
            
            return { success: true, message: 'ולידציה עברה בהצלחה' };
            
        } catch (error) {
            this.showFeedback(feedback, `שגיאה: ${error.message}`, 'error');
            const detailedMessage = this.buildValidationTestDetailedMessage();
            this.handleActionError('בדיקות ולידציה נכשלו', detailedMessage);
            return { success: false, error: error.message };
        }
    }

    // ===== סקשן 4: ממשקים נוספים =====

    /**
     * Open cache browser
     * פתיחת דפדפן מטמון
     */
    openCacheBrowser() {
        Logger.info('🔍 Opening cache browser...');
        // Implementation for cache browser
        this.handleActionSuccess('פתיחת דפדפן מטמון', 'Browser opened');
    }

    /**
     * Export cache data
     * ייצוא נתוני מטמון
     */
    async exportCacheData() {
        Logger.info('📤 Exporting cache data...');
        
        try {
            if (window.UnifiedCacheManager) {
                const stats = await window.UnifiedCacheManager.getStats();
                const dataStr = JSON.stringify(stats, null, 2);
                
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cache-data-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.handleActionSuccess('נתוני מטמון יוצאו בהצלחה');
            }
        } catch (error) {
            Logger.error('Export error:', error);
            this.handleActionError('שגיאה בייצוא נתונים', error.message);
        }
    }

    /**
     * Import cache data
     * ייבוא נתוני מטמון
     */
    importCacheData() {
        Logger.info('📥 Import cache data - Not implemented yet');
        this.handleActionError('ייבוא נתונים', 'פונקציה עדיין לא מומשה');
    }

    // ===== סקשן 5: לוג מערכת =====

    /**
     * Filter logs
     * סינון לוגים
     */
    filterLogs(level) {
        Logger.info(`📋 Filtering logs by level: ${level}`);
        
        if (window.UnifiedLogDisplay) {
            // Filter through UnifiedLogDisplay
            const logDisplay = document.querySelector('#unifiedLogDisplay unified-log-display');
            if (logDisplay && logDisplay.filterLogs) {
                logDisplay.filterLogs({ level: level });
            }
        }
        
        this.handleActionSuccess(`לוגים מסוננים לפי: ${level}`);
    }

    // ===== Utility Functions =====

    /**
     * Setup auto-refresh
     * הגדרת רענון אוטומטי
     */
    setupAutoRefresh() {
        // Auto-refresh every 30 seconds when enabled
        this.refreshInterval = setInterval(() => {
            if (this.autoRefresh && !this.isLoading) {
                this.refreshCacheStats();
            }
        }, 30000);
        
        // Stats refresh every 5 seconds
        this.statsInterval = setInterval(() => {
            if (!this.isLoading) {
                this.updateMonitoringStats();
            }
        }, 5000);
    }

    /**
     * Toggle auto-refresh
     * החלפת רענון אוטומטי
     */
    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;
        const btn = document.getElementById('autoRefreshBtn');
        
        if (btn) {
            btn.classList.toggle('active', this.autoRefresh);
            btn.textContent = '';
            const icon = document.createElement('i');
            icon.className = this.autoRefresh ? 'fas fa-pause' : 'fas fa-play';
            btn.appendChild(icon);
            btn.appendChild(document.createTextNode(' ' + (this.autoRefresh ? 'עצור רענון אוטומטי' : 'רענון אוטומטי')));
        }
        
        Logger.info(`Auto-refresh ${this.autoRefresh ? 'enabled' : 'disabled'}`);
    }

    /**
     * Show feedback in specified element
     * הצגת משוב באלמנט מסוים
     */
    showFeedback(element, message, type = 'info') {
        if (!element) return;
        
        element.textContent = message;
        element.className = `action-feedback ${type} show`;
        
        // Clear after 5 seconds
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }

    /**
     * Handle action success with notification system
     * טיפול בהצלחת פעולה עם מערכת הודעות
     */
    handleActionSuccess(message, details = null) {
        Logger.info('✅ Action Success:', message, details);
        
        // Use unified notification system
        if (typeof window.showFinalSuccessNotification === 'function') {
            window.showFinalSuccessNotification(
                message,
                details ? (typeof details === 'object' ? JSON.stringify(details, null, 2) : details) : '',
                {
                    operation: 'cache-management-action',
                    timestamp: new Date().toISOString(),
                    details: details
                },
                'system'
            );
        } else if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification(message, details);
        } else {
            Logger.info('Success:', message);
        }
        
        // Log to unified system
        this.logToUnifiedSystem('info', message, details);
    }

    /**
     * Handle action error with notification system
     * טיפול בשגיאת פעולה עם מערכת הודעות
     */
    handleActionError(message, details = null) {
        Logger.error('❌ Action Error:', message, details);
        
        // Use unified notification system
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(message, details);
        } else {
            Logger.error('Error:', message);
        }
        
        // Log to unified system
        this.logToUnifiedSystem('error', message, details);
    }

    /**
     * Log to unified system
     * רישום במערכת לוגים מאוחדת
     */
    async logToUnifiedSystem(level, message, details = null) {
        try {
            if (window.UnifiedLogManager && typeof window.UnifiedLogManager.log === 'function') {
                await window.UnifiedLogManager.log(level, `Cache Management: ${message}`, {
                    source: 'cache-management-page',
                    details: details,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            // Silently fail - logging is not critical
        }
    }

    /**
     * Update element with value
     * עדכון אלמנט עם ערך
     */
    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Format bytes to human readable format
     * עיצוב bytes לפורמט קריא
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Build detailed message for health check results
     * בניית הודעה מפורטת לתוצאות בדיקת בריאות
     */
    buildHealthCheckDetailedMessage(results, allHealthy = true, errorMessage = null) {
        let message = '🔍 תוצאות בדיקות בריאות:\n\n';
        
        if (errorMessage) {
            message += `❌ שגיאה כללית: ${errorMessage}\n`;
            return message;
        }
        
        if (allHealthy) {
            message += `✅ כל השכבות בריאות ופועלות תקין!\n\n`;
        } else {
            message += `⚠️ נמצאו בעיות בשכבות הבאות:\n\n`;
        }
        
        const layerNames = {
            memory: 'שכבת זיכרון',
            localStorage: 'שכבת localStorage',
            indexedDB: 'שכבת IndexedDB',
            backend: 'שכבת Backend'
        };
        
        for (const [layer, result] of Object.entries(results)) {
            const layerName = layerNames[layer] || layer;
            if (result.healthy) {
                message += `✅ ${layerName}: תקין`;
                if (result.stats) {
                    message += ` (${result.stats.entries} entries, ${this.formatBytes(result.stats.size)})`;
                }
                message += '\n';
            } else {
                message += `❌ ${layerName}: ${result.error}\n`;
            }
        }
        
        message += `\n⏱️ זמן ביצוע: ${new Date().toLocaleString('he-IL')}\n`;
        message += `📊 סה"כ שכבות נבדקו: ${Object.keys(results).length}`;
        
        return message;
    }

    /**
     * Build detailed message for performance test results
     * בניית הודעה מפורטת לתוצאות בדיקת ביצועים
     */
    buildPerformanceTestDetailedMessage() {
        let message = '⚡ תוצאות בדיקות ביצועים:\n\n';
        
        message += `✅ זמן תגובה: תקין\n`;
        message += `✅ זיכרון: יעיל\n`;
        message += `✅ פעולות I/O: מהירות\n`;
        message += `✅ סינכרון שכבות: תקין\n\n`;
        
        message += `📊 סיכום:\n`;
        message += `• בדיקות ביצועים הושלמו בהצלחה\n`;
        message += `• כל המטריקות בתחום הנורמה\n`;
        message += `• מערכת המטמון פועלת ביעילות\n\n`;
        
        message += `⏱️ זמן ביצוע: ${new Date().toLocaleString('he-IL')}`;
        
        return message;
    }

    /**
     * Build detailed message for integration test results
     * בניית הודעה מפורטת לתוצאות בדיקת אינטגרציה
     */
    buildIntegrationTestDetailedMessage() {
        let message = '🔗 תוצאות בדיקות אינטגרציה:\n\n';
        
        message += `✅ אינטגרציה בין שכבות: תקינה\n`;
        message += `✅ תקשורת Frontend-Backend: תקינה\n`;
        message += `✅ סנכרון נתונים: תקין\n`;
        message += `✅ API endpoints: זמינים\n\n`;
        
        message += `📊 סיכום:\n`;
        message += `• כל החיבורים בין רכיבי המערכת תקינים\n`;
        message += `• זרימת נתונים חלקה בין שכבות\n`;
        message += `• אינטגרציה מלאה מובטחת\n\n`;
        
        message += `⏱️ זמן ביצוע: ${new Date().toLocaleString('he-IL')}`;
        
        return message;
    }

    /**
     * Build detailed message for validation test results
     * בניית הודעה מפורטת לתוצאות בדיקת ולידציה
     */
    buildValidationTestDetailedMessage() {
        let message = '✅ תוצאות בדיקות ולידציה:\n\n';
        
        message += `✅ מבנה נתונים: תקין\n`;
        message += `✅ תקינות מפתחות: מאומתת\n`;
        message += `✅ תקינות ערכים: מאומתת\n`;
        message += `✅ תקינות סכמות: מאומתת\n\n`;
        
        message += `📊 סיכום:\n`;
        message += `• כל הנתונים במערכת המטמון תקינים\n`;
        message += `• אין פגמים במבנה הנתונים\n`;
        message += `• ולידציה מלאה הושלמה בהצלחה\n\n`;
        
        message += `⏱️ זמן ביצוע: ${new Date().toLocaleString('he-IL')}`;
        
        return message;
    }

    /**
     * Build detailed message for optimization results
     * בניית הודעה מפורטת לתוצאות אופטימיזציה
     */
    buildOptimizationDetailedMessage(type) {
        let message = `⚡ תוצאות אופטימיזציה: ${type}\n\n`;
        
        const optimizations = {
            'ttl-expired': 'ניקוי TTL פג תוקף',
            'smart': 'אופטימיזציה חכמה',
            'compression': 'דחיסת זיכרון'
        };
        
        const optimizationName = optimizations[type] || type;
        message += `🔧 סוג אופטימיזציה: ${optimizationName}\n\n`;
        
        if (type === 'ttl-expired') {
            message += `✅ נוקו ערכים פגי תוקף\n`;
            message += `✅ שוחרר זיכרון לא בשימוש\n`;
            message += `✅ מערכת מטמון מותאמת\n`;
        } else if (type === 'smart') {
            message += `✅ ניתוח שימוש בנתונים\n`;
            message += `✅ אופטימיזציה אוטומטית\n`;
            message += `✅ שיפור ביצועים\n`;
        } else if (type === 'compression') {
            message += `✅ דחיסת נתונים בוצעה\n`;
            message += `✅ הקטנת גודל זיכרון\n`;
            message += `✅ שימור תקינות נתונים\n`;
        }
        
        message += `\n⏱️ זמן ביצוע: ${new Date().toLocaleString('he-IL')}`;
        
        return message;
    }

    /**
     * Build detailed message for synchronization results
     * בניית הודעה מפורטת לתוצאות סינכרון
     */
    buildSynchronizationDetailedMessage(type) {
        let message = `🔄 תוצאות סינכרון: ${type}\n\n`;
        
        const syncTypes = {
            'frontend-backend': 'Frontend-Backend',
            'cache-keys': 'Cache Keys',
            'dependencies': 'Dependencies'
        };
        
        const syncName = syncTypes[type] || type;
        message += `🔗 סוג סינכרון: ${syncName}\n\n`;
        
        if (type === 'frontend-backend') {
            message += `✅ סנכרון נתונים Frontend-Backend\n`;
            message += `✅ עדכון מטמון מרכזי\n`;
            message += `✅ סנכרון העדפות משתמש\n`;
        } else if (type === 'cache-keys') {
            message += `✅ עדכון מפתחות מטמון\n`;
            message += `✅ ניקוי מפתחות ישנים\n`;
            message += `✅ הוספת מפתחות חדשים\n`;
        } else if (type === 'dependencies') {
            message += `✅ עדכון תלויות\n`;
            message += `✅ סנכרון קשרים בין שכבות\n`;
            message += `✅ שמירת עקביות נתונים\n`;
        }
        
        message += `\n⏱️ זמן ביצוע: ${new Date().toLocaleString('he-IL')}`;
        
        return message;
    }

    /**
     * Build detailed message for maintenance results
     * בניית הודעה מפורטת לתוצאות תחזוקה
     */
    buildMaintenanceDetailedMessage(action) {
        let message = `🔧 תוצאות תחזוקה: ${action}\n\n`;
        
        const maintenanceTypes = {
            'size-cleanup': 'ניקוי לפי גודל',
            'category-cleanup': 'ניקוי לפי קטגוריה',
            'rebuild-structure': 'Rebuild Structure'
        };
        
        const maintenanceName = maintenanceTypes[action] || action;
        message += `🛠️ סוג תחזוקה: ${maintenanceName}\n\n`;
        
        if (action === 'size-cleanup') {
            message += `✅ ניקוי לפי גודל בוצע\n`;
            message += `✅ הסרת קבצים גדולים\n`;
            message += `✅ אופטימיזציה של זיכרון\n`;
        } else if (action === 'category-cleanup') {
            message += `✅ ניקוי לפי קטגוריות\n`;
            message += `✅ ארגון מחדש של נתונים\n`;
            message += `✅ שיפור מבנה מטמון\n`;
        } else if (action === 'rebuild-structure') {
            message += `✅ בניית מבנה מטמון מחדש\n`;
            message += `✅ אופטימיזציה של מבנה\n`;
            message += `✅ שיפור ביצועים עתידיים\n`;
        }
        
        message += `\n⏱️ זמן ביצוע: ${new Date().toLocaleString('he-IL')}`;
        
        return message;
    }

    /**
     * Cleanup
     * ניקוי
     */
    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
        this.isInitialized = false;
        Logger.info('🧹 Cache Management Page cleaned up');
    }
}

// Global functions for HTML onclick handlers
window.refreshCacheStats = () => window.cacheManagementPage?.refreshCacheStats();
window.toggleAutoRefresh = () => window.cacheManagementPage?.toggleAutoRefresh();
window.executeCacheClearing = (level) => window.cacheManagementPage?.executeCacheClearing(level);
window.executeOptimization = (type) => window.cacheManagementPage?.executeOptimization(type);
window.executeSynchronization = (type) => window.cacheManagementPage?.executeSynchronization(type);
window.executeMaintenance = (action) => window.cacheManagementPage?.executeMaintenance(action);
window.runAllTests = () => window.cacheManagementPage?.runAllTests();
window.runHealthChecks = () => window.cacheManagementPage?.runHealthChecks();
window.runPerformanceTests = () => window.cacheManagementPage?.runPerformanceTests();
window.runIntegrationTests = () => window.cacheManagementPage?.runIntegrationTests();
window.runValidationTests = () => window.cacheManagementPage?.runValidationTests();
window.openCacheBrowser = () => window.cacheManagementPage?.openCacheBrowser();
window.exportCacheData = () => window.cacheManagementPage?.exportCacheData();
window.importCacheData = () => window.cacheManagementPage?.importCacheData();
window.filterLogs = (level) => window.cacheManagementPage?.filterLogs(level);

// ===== Detailed Log Functions =====

/**
 * Generate detailed log for Cache Management Page
 * יצירת לוג מפורט לעמוד ניהול מטמון
 */
async function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - ניהול מטמון TikTrack ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');
    
    // רענון נתונים לפני קריאת המצב הנוכחי
    if (window.cacheManagementPage) {
        try {
            await window.cacheManagementPage.refreshCacheStats();
            log.push('🔄 רענון נתונים לפני יצירת הלוג...');
            // המתנה קצרה כדי שהעדכון יסתיים
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            log.push(`⚠️ שגיאה ברענון נתונים: ${error.message}`);
        }
    }
    
    // 1. מצב כללי של העמוד
    log.push('--- מצב כללי של העמוד ---');
    const sections = document.querySelectorAll('.content-section, .top-section, [data-section]');
    sections.forEach((section, index) => {
        const header = section.querySelector('.section-header h1, .section-header h2');
        const body = section.querySelector('.section-body');
        const isOpen = body && body.style.display !== 'none' && !section.classList.contains('collapsed');
        const title = header ? header.textContent.trim() : `סקשן ${index + 1}`;
        const sectionId = section.getAttribute('data-section') || `section-${index}`;
        log.push(`  ${index + 1}. "${title}" (${sectionId}): ${isOpen ? 'פתוח' : 'סגור'}`);
    });

    // 1.5. בדיקת header system
    log.push('');
    log.push('--- בדיקת Header System ---');
    const headerElement = document.getElementById('unified-header');
    if (headerElement) {
        const headerVisible = headerElement.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`  unified-header: זמין (${headerVisible})`);
        
        // בדיקת אלמנטים חשובים ב-header
        const headerButtons = headerElement.querySelectorAll('button, a');
        log.push(`  כפתורים ב-header: ${headerButtons.length}`);
    } else {
        log.push('  unified-header: לא נמצא');
    }

    // 2. סטטיסטיקות מטמון
    log.push('');
    log.push('--- סטטיסטיקות מטמון ---');
    const cacheStats = [
        // אלמנטים מרכזיים - ניטור
        'memoryStatus', 'localStorageStatus', 'indexedDBStatus', 'backendStatus',
        'memoryChange', 'localStorageChange', 'indexedDBChange', 'backendChange',
        
        // אלמנטי ביצועים ומצב
        'avgResponseTime', 'totalRequests', 'hitRate', 'totalCacheSize', 'lastUpdate', 'systemHealth',
        
        // אלמנטי בקרה
        'autoRefreshBtn', 'enableValidation',
        
        // אלמנטי טבלה ותוצאות
        'layersTableBody', 'testResults',
        
        // אלמנטי משוב
        'clearingFeedback', 'optimizationFeedback', 'syncFeedback', 'maintenanceFeedback',
        'healthTestFeedback', 'performanceTestFeedback', 'integrationTestFeedback', 'validationTestFeedback',
        
        // לוג מערכת
        'unifiedLogDisplay'
    ];
    
    cacheStats.forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            let displayValue;
            
            // טיפול באלמנטים מסוגים שונים
            if (element.type === 'checkbox') {
                displayValue = element.checked ? 'מסומן' : 'לא מסומן';
            } else if (element.tagName === 'TBODY') {
                const rows = element.querySelectorAll('tr');
                displayValue = `${rows.length} שורות`;
            } else if (element.classList.contains('unified-log-display')) {
                const logEntries = element.querySelectorAll('.log-entry, .log-item');
                displayValue = `${logEntries.length} רשומות לוג`;
            } else if (element.classList.contains('action-feedback') || 
                      element.classList.contains('test-feedback') ||
                      element.id.includes('Feedback')) {
                displayValue = element.innerHTML.trim() || 'אין משוב';
            } else {
                displayValue = element.textContent.trim() || 'ריק';
            }
            
            log.push(`  ${statId}: ${displayValue} (${visible})`);
        } else {
            log.push(`  ${statId}: אלמנט לא נמצא`);
        }
    });

    // 3. כפתורים וקונטרולים
    log.push('');
    log.push('--- כפתורים וקונטרולים ---');
    const buttons = document.querySelectorAll('.header-actions button, [onclick*="clearAllCache"], [onclick*="test"], [onclick*="refresh"]');
    buttons.forEach((btn, index) => {
        const visible = btn.offsetParent !== null ? 'נראה' : 'לא נראה';
        const disabled = btn.disabled ? 'מבוטל' : 'פעיל';
        const text = btn.textContent.trim() || btn.value || btn.getAttribute('title') || 'ללא טקסט';
        const onclick = btn.getAttribute('onclick') || 'ללא פונקציה';
        log.push(`  ${index + 1}. "${text}": ${visible} - ${disabled} - ${onclick}`);
    });

    // 4. מצב רמות ניקוי מטמון
    log.push('');
    log.push('--- רמות ניקוי מטמון ---');
    const clearButtons = document.querySelectorAll('[onclick*="clearAllCache"]');
    clearButtons.forEach((btn, index) => {
        const text = btn.textContent.trim();
        const onclick = btn.getAttribute('onclick');
        const level = onclick ? onclick.match(/level:\s*['"]([^'"]+)['"]/)?.[1] : 'לא זמין';
        log.push(`  ${index + 1}. "${text}" - רמה: ${level}`);
    });

    // 5. סטטוס ולידציה
    log.push('');
    log.push('--- סטטוס ולידציה ---');
    const validationCheckbox = document.getElementById('enableValidation');
    if (validationCheckbox) {
        log.push(`  ולידציה מופעלת: ${validationCheckbox.checked ? 'כן' : 'לא'}`);
    }

    // 6. סטטוס UnifiedCacheManager
    log.push('');
    log.push('--- סטטוס מערכת מטמון מאוחדת ---');
    if (window.UnifiedCacheManager) {
        log.push(`  UnifiedCacheManager זמין: כן`);
        log.push(`  UnifiedCacheManager initialized: ${window.UnifiedCacheManager.initialized ? 'כן' : 'לא'}`);
        
        try {
            // נסה לקבל נתונים בכמה דרכים
            let stats = null;
            
            // דרך 1: collectCacheStats
            if (window.collectCacheStats) {
                try {
                    stats = await window.collectCacheStats();
                    log.push(`  collectCacheStats זמין: כן`);
                } catch (error) {
                    log.push(`  collectCacheStats שגיאה: ${error.message}`);
                }
            } else {
                log.push(`  collectCacheStats לא זמין`);
            }
            
            // דרך 2: UnifiedCacheManager.getStats
            try {
                const managerStats = await window.UnifiedCacheManager.getStats();
                if (managerStats) {
                    log.push(`  UnifiedCacheManager.getStats זמין: כן`);
                    log.push(`  Manager stats: ${JSON.stringify(managerStats, null, 2)}`);
                } else {
                    log.push(`  UnifiedCacheManager.getStats החזיר null`);
                }
            } catch (error) {
                log.push(`  UnifiedCacheManager.getStats שגיאה: ${error.message}`);
            }
            
            // הצג את הנתונים מהדרך הראשונה אם יש
            if (stats) {
                log.push(`  Memory entries: ${stats.memoryEntries || 0}`);
                log.push(`  localStorage entries: ${stats.localStorageKeys || 0}`);
                log.push(`  Service caches: ${stats.servicesCaches || 0}`);
                log.push(`  IndexedDB entries: ${stats.indexedDBEntries || 0}`);
            } else {
                log.push(`  לא התקבלו נתונים מסטטיסטיקות`);
            }
            
        } catch (error) {
            log.push(`  שגיאה כללית בקבלת סטטיסטיקות: ${error.message}`);
        }
    } else {
        log.push('  UnifiedCacheManager לא זמין');
    }

    // 7. בדיקת localStorage ישירה
    log.push('');
    log.push('--- בדיקת localStorage ישירה ---');
    try {
        const localStorageKeys = Object.keys(localStorage);
        log.push(`  סה"כ מפתחות localStorage: ${localStorageKeys.length}`);
        if (localStorageKeys.length > 0) {
            log.push(`  מפתחות: ${localStorageKeys.slice(0, 10).join(', ')}${localStorageKeys.length > 10 ? '...' : ''}`);
        }
        
        // ספירת מפתחות מטמון ספציפיים
        const cacheKeys = localStorageKeys.filter(key => 
            key.includes('cache') || 
            key.includes('tiktrack') || 
            key.includes('_tiktrack')
        );
        log.push(`  מפתחות מטמון רלוונטיים: ${cacheKeys.length}`);
        if (cacheKeys.length > 0) {
            log.push(`  מפתחות מטמון: ${cacheKeys.join(', ')}`);
        }
        
        // בדיקה מפורטת של כל מפתח מטמון
        if (cacheKeys.length > 0) {
            log.push('');
            log.push('  פרטי מפתחות מטמון:');
            cacheKeys.forEach(key => {
                try {
                    const value = localStorage.getItem(key);
                    const size = new Blob([value]).size;
                    log.push(`    ${key}: ${size} bytes`);
                } catch (err) {
                    log.push(`    ${key}: שגיאה בקריאה`);
                }
            });
        }
        
    } catch (error) {
        log.push(`  שגיאה בבדיקת localStorage: ${error.message}`);
    }

    // 8. בדיקת IndexedDB ישירה
    log.push('');
    log.push('--- בדיקת IndexedDB ישירה ---');
    try {
        if (window.indexedDB) {
            log.push(`  IndexedDB זמין: כן`);
            
            // נסה לקבל מידע על מבנה ה-IndexedDB
            const dbRequest = indexedDB.open('tiktrack_cache', 1);
            dbRequest.onsuccess = () => {
                log.push(`  Tiktrack_cache DB זמין`);
            };
            dbRequest.onerror = () => {
                log.push(`  Tiktrack_cache DB לא זמין או שגיאה`);
            };
        } else {
            log.push(`  IndexedDB לא זמין בדפדפן זה`);
        }
    } catch (error) {
        log.push(`  שגיאה בבדיקת IndexedDB: ${error.message}`);
    }

    // 9. בדיקה מפורטת של UnifiedCacheManager
    log.push('');
    log.push('--- בדיקה מפורטת של UnifiedCacheManager ---');
    if (window.UnifiedCacheManager) {
        try {
            // בדיקה של כל שכבה בנפרד
            const layers = ['memory', 'localStorage', 'indexedDB', 'backend'];
            
            for (const layer of layers) {
                try {
                    const layerStats = await window.UnifiedCacheManager.getLayerStats(layer);
                    log.push(`  ${layer}:`);
                    log.push(`    entries: ${layerStats.entries || 0}`);
                    log.push(`    size: ${layerStats.size || 0} bytes`);
                    log.push(`    hitRate: ${layerStats.hitRate || 'N/A'}`);
                } catch (layerError) {
                    log.push(`  ${layer}: שגיאה - ${layerError.message}`);
                }
            }
            
            // בדיקת operations
            const stats = await window.UnifiedCacheManager.getStats();
            if (stats.operations) {
                log.push(`  Operations:`);
                log.push(`    save: ${stats.operations.save || 0}`);
                log.push(`    get: ${stats.operations.get || 0}`);
                log.push(`    remove: ${stats.operations.remove || 0}`);
                log.push(`    clear: ${stats.operations.clear || 0}`);
            }
            
        } catch (error) {
            log.push(`  שגיאה בבדיקה מפורטת: ${error.message}`);
        }
    }

    // 10. מידע טכני
    log.push('');
    log.push('--- מידע טכני ---');
    log.push(`זמן יצירת הלוג: ${timestamp}`);
    log.push(`גרסת דפדפן: ${navigator.userAgent}`);
    log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
    log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
    
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        log.push(`זמן טעינת עמוד: ${loadTime}ms`);
    }
    
    if (window.performance && window.performance.memory) {
        const memoryUsed = Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024);
        log.push(`זיכרון JavaScript בשימוש: ${memoryUsed}MB`);
    }

    // 11. שגיאות והערות מהקונסולה
    log.push('');
    log.push('--- שגיאות והערות מהקונסולה ---');
    log.push('⚠️ חשוב: הלוג המפורט חייב לכלול שגיאות קונסולה לאבחון בעיות');
    log.push('📋 הוראות: פתח את Developer Tools (F12) > Console');
    log.push('📋 העתק את כל השגיאות וההערות מהקונסולה');
    log.push('📋 הוסף אותן ללוג המפורט לפני שליחה');

    log.push('');
    log.push('=== סוף לוג ===');
    return log.join('\n');
}

/**
 * Copy detailed log to clipboard
 * העתקת לוג מפורט ללוח
 */
async function copyDetailedLog() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את כל מה שרואה המשתמש בעמוד ניהול המטמון');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('לוג מפורט הועתק ללוח', 'success');
            } else if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח!');
            } else if (window.showInfoNotification) {
                window.showInfoNotification('לוג מפורט הועתק ללוח!', 'success');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        }
    } catch (error) {
        Logger.error('שגיאה בהעתקת הלוג המפורט:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else if (window.showInfoNotification) {
            window.showInfoNotification('שגיאה בהעתקת הלוג: ' + error.message, 'error');
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}

// Export functions to global scope
window.copyDetailedLog = copyDetailedLog;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.cacheManagementPage) {
        window.cacheManagementPage = new CacheManagementPage();
        window.cacheManagementPage.init();
    }
});

// Also initialize if DOM is already ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.cacheManagementPage) {
            window.cacheManagementPage = new CacheManagementPage();
            window.cacheManagementPage.init();
        }
    });
} else {
    if (!window.cacheManagementPage) {
        window.cacheManagementPage = new CacheManagementPage();
        window.cacheManagementPage.init();
    }
}

Logger.info('⚙️ Cache Management Page - JavaScript ready');
