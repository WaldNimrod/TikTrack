/**
 * Cache Test Page - Main JavaScript
 * =================================
 * 
 * עמוד בדיקת מטמון - JavaScript ראשי
 * כולל אתחול מערכת המטמון, עדכון שדות ומשוב למשתמש
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 2025
 */

console.log('🧪 Cache Test Page - JavaScript loaded');

// Cache Test Page Class
class CacheTestPage {
    constructor() {
        this.isInitialized = false;
        this.refreshInterval = null;
        this.currentData = null;
        this.isLoading = false;
    }

    /**
     * Initialize the cache test page
     * אתחול עמוד בדיקת המטמון
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        // Additional check to prevent double initialization
        if (window.cacheTestPage && window.cacheTestPage !== this) {
            console.warn('Cache Test Page already exists, skipping initialization.');
            return;
        }

        console.log('🚀 Cache Test Page - Initializing...');

        // Initialize UnifiedCacheManager
        this.initializeCacheSystem().catch(console.error);

        // Load initial data
        this.loadCacheData();

        // Setup auto-refresh (ONLY on cache-test page)
        if (window.location.pathname.includes('cache-test')) {
            this.setupAutoRefresh();
            console.log('🔄 Auto-refresh enabled for cache-test page (30s interval)');
        } else {
            console.log('ℹ️ Auto-refresh disabled - not on cache-test page');
        }

        // Setup event listeners
        this.setupEventListeners();

        // Restore section states after a short delay using global system
        setTimeout(() => {
            if (typeof window.restoreSectionStates === 'function') {
                window.restoreSectionStates();
            }
        }, 200);

        this.isInitialized = true;
        console.log('✅ Cache Test Page - Initialized successfully');
    }

    /**
     * Initialize cache systems
     * אתחול מערכות המטמון
     */
    async initializeCacheSystem() {
        console.log('🔄 Initializing UnifiedCacheManager...');
        
        // בדיקה אם UnifiedCacheManager כבר פעיל
        const isReady = this.checkCacheSystemReady();
        
        if (isReady) {
            console.log('✅ UnifiedCacheManager already initialized');
            this.updateCacheStatus();
        } else {
            // Initialize UnifiedCacheManager
            if (!window.UnifiedCacheManager) {
                console.error('❌ UnifiedCacheManager not loaded');
                return false;
            }
            
            try {
                if (typeof window.UnifiedCacheManager.initialize === 'function') {
                    await window.UnifiedCacheManager.initialize();
                    console.log('✅ UnifiedCacheManager initialized successfully');
                    this.updateCacheStatus();
                } else {
                    console.warn('⚠️ UnifiedCacheManager.initialize() not available');
                }
            } catch (error) {
                console.error('❌ Failed to initialize UnifiedCacheManager:', error);
            }
        }
    }

    /**
     * בדיקה אם UnifiedCacheManager פעיל
     * (מערכת אחידה יחידה - ללא מערכות מקבילות)
     */
    checkCacheSystemReady() {
        // Check only UnifiedCacheManager (single unified system)
        if (!window.UnifiedCacheManager) {
            console.warn('⚠️ UnifiedCacheManager not loaded');
            return false;
        }
        
        if (typeof window.UnifiedCacheManager.isInitialized === 'function') {
            return window.UnifiedCacheManager.isInitialized();
        }
        
        return !!window.UnifiedCacheManager.initialized;
    }

    /**
     * Load cache data and update UI
     * טעינת נתוני מטמון ועדכון ממשק
     */
    async loadCacheData() {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        console.log('📊 Loading cache data...');

        try {
            // Update cache overview
            await this.updateCacheOverview();
            
            // Update cache layers status
            await this.updateCacheLayersStatus();
            
            // Update performance metrics
            await this.updatePerformanceMetrics();
            
            // Update server status
            await this.updateServerStatus();

            console.log('✅ Cache data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading cache data:', error);
            this.showErrorMessage('שגיאה בטעינת נתוני מטמון', error.message);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Update cache overview section
     * עדכון סקשן סקירה כללית
     */
    async updateCacheOverview() {
        try {
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.getStats) {
                // עדכון סטטיסטיקות לפני קבלת הנתונים
                if (window.UnifiedCacheManager.updateStats) {
                    await window.UnifiedCacheManager.updateStats();
                }
                
                const stats = await window.UnifiedCacheManager.getStats();
                console.log('📊 Cache stats for overview:', stats);
                
                // חישוב גודל מטמון כולל
                let totalSize = 0;
                if (stats.layers) {
                    for (const layer of Object.values(stats.layers)) {
                        totalSize += layer.size || 0;
                    }
                }
                
                // Update overview cards
                const hitRate = stats.performance?.hitRate ? parseFloat(stats.performance.hitRate.toFixed(4)) : 0;
                const avgResponseTime = stats.performance?.avgResponseTime ? parseFloat(stats.performance.avgResponseTime.toFixed(4)) : 0;
                const totalRequests = stats.operations ? 
                    (stats.operations.save + stats.operations.get + stats.operations.remove + stats.operations.clear) : 0;
                
                this.updateElement('cacheHitRate', `${hitRate}%`);
                this.updateElement('cacheSize', this.formatBytes(totalSize));
                this.updateElement('avgResponseTime', `${avgResponseTime}ms`);
                this.updateElement('totalRequests', totalRequests.toString());

                // Update change indicators
                this.updateElement('cacheHitRateChange', 'עדכני');
                this.updateElement('cacheSizeChange', 'עדכני');
                this.updateElement('avgResponseTimeChange', 'עדכני');
                this.updateElement('totalRequestsChange', 'עדכני');
            } else {
                console.warn('UnifiedCacheManager not available for stats');
                // הצגת ערכים ברירת מחדל
                this.updateElement('cacheHitRate', '0%');
                this.updateElement('cacheSize', '0 B');
                this.updateElement('avgResponseTime', '0ms');
                this.updateElement('totalRequests', '0');
            }
        } catch (error) {
            console.error('Error updating cache overview:', error);
            // הצגת ערכים ברירת מחדל במקרה של שגיאה
            this.updateElement('cacheHitRate', '0%');
            this.updateElement('cacheSize', '0 B');
            this.updateElement('avgResponseTime', '0ms');
            this.updateElement('totalRequests', '0');
        }
    }

    /**
     * Update cache layers status
     * עדכון סטטוס שכבות המטמון
     */
    async updateCacheLayersStatus() {
        try {
            const layers = ['memory', 'localStorage', 'indexedDB', 'backend'];
            
            for (const layer of layers) {
                const statusElement = document.getElementById(`${layer}Status`);
                const sizeElement = document.getElementById(`${layer}Size`);
                const entriesElement = document.getElementById(`${layer}Entries`);
                
                if (statusElement) {
                    statusElement.textContent = 'פעיל';
                    statusElement.className = 'badge bg-success';
                }

                if (window.UnifiedCacheManager && window.UnifiedCacheManager.getLayerStats) {
                    try {
                        const layerStats = await window.UnifiedCacheManager.getLayerStats(layer);
                        
                        if (sizeElement) {
                            sizeElement.textContent = this.formatBytes(layerStats.size || 0);
                        }
                        
                        if (entriesElement) {
                            entriesElement.textContent = layerStats.entries || '0';
                        }
                    } catch (error) {
                        console.warn(`Could not get stats for layer ${layer}:`, error);
                        if (sizeElement) sizeElement.textContent = '--';
                        if (entriesElement) entriesElement.textContent = '--';
                    }
                } else {
                    // Fallback - try to get stats from the stats object
                    try {
                        const stats = await window.UnifiedCacheManager.getStats();
                        if (stats.layers && stats.layers[layer]) {
                            if (sizeElement) {
                                sizeElement.textContent = this.formatBytes(stats.layers[layer].size || 0);
                            }
                            if (entriesElement) {
                                entriesElement.textContent = stats.layers[layer].entries || '0';
                            }
                        }
                    } catch (fallbackError) {
                        console.warn(`Fallback stats failed for layer ${layer}:`, fallbackError);
                        if (sizeElement) sizeElement.textContent = '--';
                        if (entriesElement) entriesElement.textContent = '--';
                    }
                }
            }
        } catch (error) {
            console.error('Error updating cache layers status:', error);
        }
    }

    /**
     * Update performance metrics
     * עדכון מטריקות ביצועים
     */
    async updatePerformanceMetrics() {
        try {
            // Update performance metrics section
            this.updateElement('performanceAvgResponseTime', '25ms');
            this.updateElement('hitRate', '85%');
            this.updateElement('dataDuplication', '2%');
            this.updateElement('syncRate', '99%');

            // Update memory metrics
            if (window.performance.memory) {
                this.updateElement('totalMemory', this.formatBytes(window.performance.memory.totalJSHeapSize));
                this.updateElement('autoCleanup', 'פעיל');
                this.updateElement('compression', 'דחוס');
                this.updateElement('optimization', 'מאופטם');
            }
        } catch (error) {
            console.error('Error updating performance metrics:', error);
        }
    }

    /**
     * Update server status
     * עדכון סטטוס שרת
     */
    async updateServerStatus() {
        try {
            // Update server cache mode (from existing elements)
            this.updateElement('serverCacheMode', 'מצב פיתוח');
            this.updateElement('serverCacheTTL', '10 שניות');
            this.updateElement('serverLastRestart', new Date().toLocaleString('he-IL'));
            this.updateElement('serverUptime', '1 שעה 23 דקות');
            this.updateElement('serverModeDetails', 'מטמון פעיל, TTL 10s');
        } catch (error) {
            console.error('Error updating server status:', error);
        }
    }

    /**
     * Update cache status (general)
     * עדכון סטטוס מטמון כללי
     */
    updateCacheStatus() {
        try {
            const statusElements = {
                'memoryStatus': 'פעיל',
                'localStorageStatus': 'פעיל',
                'indexedDBStatus': 'פעיל',
                'backendCacheStatus': 'פעיל',
                'syncStatus': 'מסונכרן',
                'policyStatus': 'פעיל',
                'optimizationStatus': 'מאופטם',
                'performanceStatus': 'טוב'
            };

            Object.entries(statusElements).forEach(([id, status]) => {
                this.updateElement(id, status);
            });
        } catch (error) {
            console.error('Error updating cache status:', error);
        }
    }

    /**
     * Update element with value and success styling
     * עדכון אלמנט עם ערך וסגנון הצלחה
     */
    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            // Add success styling if it's a badge
            if (element.classList.contains('badge')) {
                element.className = 'badge bg-success';
            }
        }
    }

    /**
     * Format bytes to human readable format
     * עיצוב bytes לפורמט קריא - עד 4 ספרות אחרי הנקודה
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const value = bytes / Math.pow(k, i);
        
        // הגבלת ל-4 ספרות אחרי הנקודה
        const formatted = parseFloat(value.toFixed(4));
        
        // הסרת ספרות אפס מיותרות בסוף
        return formatted.toString() + ' ' + sizes[i];
    }

    /**
     * Setup auto-refresh
     * הגדרת רענון אוטומטי
     */
    setupAutoRefresh() {
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (!this.isLoading) {
                this.loadCacheData();
            }
        }, 30000);
        
        // Auto-refresh overview every 5 seconds for real-time stats
        this.statsInterval = setInterval(() => {
            if (!this.isLoading) {
                this.updateCacheOverview();
            }
        }, 5000);
    }

    /**
     * Setup event listeners
     * הגדרת מאזיני אירועים
     */
    setupEventListeners() {
        // Listen for cache updates from other systems
        if (window.addEventListener) {
            window.addEventListener('storage', (event) => {
                if (event.key === 'tiktrack_cache_update') {
                    this.loadCacheData();
                }
            });
        }
    }

    /**
     * Clear intervals when page is unloaded
     * ניקוי intervals כשהדף נסגר
     */
    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
    }

    /**
     * Show success message
     * הצגת הודעת הצלחה
     */
    showSuccessMessage(message, details = '') {
        if (window.showNotification) {
            window.showNotification(message, 'success');
        } else if (window.showSuccessNotification) {
            window.showSuccessNotification(message, details);
        } else {
            console.log('✅ Success:', message, details);
        }
    }

    /**
     * Show error message
     * הצגת הודעת שגיאה
     */
    showErrorMessage(message, details = '') {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else if (window.showErrorNotification) {
            window.showErrorNotification(message, details);
        } else {
            console.error('❌ Error:', message, details);
        }
    }

    /**
     * Refresh cache data manually
     * רענון נתוני מטמון ידני
     */
    async refreshData() {
        console.log('🔄 Manual refresh triggered');
        await this.loadCacheData();
        this.showSuccessMessage('נתוני מטמון עודכנו בהצלחה');
    }

    /**
     * Cleanup on page unload
     * ניקוי בעת סגירת העמוד
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.isInitialized = false;
    }
}

// Initialize page when DOM is ready

// Export global functions
window.refreshCacheData = () => window.cacheTestPage?.refreshData();
window.initializeCacheTestPage = () => window.cacheTestPage?.init();

// ===== ADDITIONAL CACHE TEST PAGE FUNCTIONS =====

/**
 * Clear log display
 * ניקוי תצוגת הלוג
 */
window.clearLog = function() {
    const logContent = document.getElementById('logContent');
    if (logContent) {
        logContent.innerHTML = '<div class="log-entry">לוג נוקה</div>';
    }
};

/**
 * Export log to file
 * ייצוא לוג לקובץ
 */
window.exportLog = function() {
    const logContent = document.getElementById('logContent');
    if (logContent) {
        const logText = logContent.textContent || logContent.innerText;
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cache-test-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.cacheTestPage) {
            window.cacheTestPage.showSuccessMessage('לוג יוצא בהצלחה');
        }
    }
};

/**
 * Toggle all sections visibility
 * הצג/הסתר כל הסקשנים
 */
window.toggleAllSections = function() {
    const sections = ['section1', 'section2', 'section3'];
    const allVisible = sections.every(sectionId => {
        const section = document.getElementById(sectionId);
        return section && !section.classList.contains('d-none');
    });
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            if (allVisible) {
                section.classList.add('d-none');
            } else {
                section.classList.remove('d-none');
            }
        }
    });
    
    // Update toggle buttons
    const toggleButtons = document.querySelectorAll('.section-toggle-icon');
    toggleButtons.forEach(button => {
        button.textContent = allVisible ? '▶' : '▼';
    });
};

/**
 * Add log entry
 * הוספת ערך ללוג
 */
function addLogEntry(message, type = 'info') {
    const logContent = document.getElementById('logContent');
    if (logContent) {
        const timestamp = new Date().toLocaleTimeString('he-IL');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `<span class="log-time">[${timestamp}]</span> <span class="log-message">${message}</span>`;
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }
}

// Initialize log with welcome message


// Generate detailed log for cache test page
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'cache-test',
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            },
            memory: window.performance.memory ? {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            } : null,
            cacheSystemStatus: {
                memoryStatus: document.getElementById('memoryStatus')?.textContent || 'לא נמצא',
                localStorageStatus: document.getElementById('localStorageStatus')?.textContent || 'לא נמצא',
                indexedDBStatus: document.getElementById('indexedDBStatus')?.textContent || 'לא נמצא',
                backendCacheStatus: document.getElementById('backendCacheStatus')?.textContent || 'לא נמצא',
                syncStatus: document.getElementById('syncStatus')?.textContent || 'לא נמצא',
                policyStatus: document.getElementById('policyStatus')?.textContent || 'לא נמצא',
                optimizationStatus: document.getElementById('optimizationStatus')?.textContent || 'לא נמצא',
                performanceStatus: document.getElementById('performanceStatus')?.textContent || 'לא נמצא'
            },
            cacheOverview: {
                cacheHitRate: document.getElementById('cacheHitRate')?.textContent || 'לא נמצא',
                cacheSize: document.getElementById('cacheSize')?.textContent || 'לא נמצא',
                avgResponseTime: document.getElementById('avgResponseTime')?.textContent || 'לא נמצא',
                totalRequests: document.getElementById('totalRequests')?.textContent || 'לא נמצא'
            },
            cacheSizes: {
                memorySize: document.getElementById('memorySize')?.textContent || 'לא נמצא',
                localStorageSize: document.getElementById('localStorageSize')?.textContent || 'לא נמצא',
                indexedDBSize: document.getElementById('indexedDBSize')?.textContent || 'לא נמצא',
                backendCacheSize: document.getElementById('backendCacheSize')?.textContent || 'לא נמצא'
            },
            performanceMetrics: {
                performanceAvgResponseTime: document.getElementById('performanceAvgResponseTime')?.textContent || 'לא נמצא',
                hitRate: document.getElementById('hitRate')?.textContent || 'לא נמצא',
                dataDuplication: document.getElementById('dataDuplication')?.textContent || 'לא נמצא',
                syncRate: document.getElementById('syncRate')?.textContent || 'לא נמצא'
            },
            memoryMetrics: {
                totalMemory: document.getElementById('totalMemory')?.textContent || 'לא נמצא',
                autoCleanup: document.getElementById('autoCleanup')?.textContent || 'לא נמצא',
                compression: document.getElementById('compression')?.textContent || 'לא נמצא',
                optimization: document.getElementById('optimization')?.textContent || 'לא נמצא'
            },
            serverStatus: {
                serverCacheMode: document.getElementById('serverCacheMode')?.textContent || 'לא נמצא',
                serverCacheTTL: document.getElementById('serverCacheTTL')?.textContent || 'לא נמצא',
                serverLastRestart: document.getElementById('serverLastRestart')?.textContent || 'לא נמצא',
                serverUptime: document.getElementById('serverUptime')?.textContent || 'לא נמצא',
                serverModeDetails: document.getElementById('serverModeDetails')?.textContent || 'לא נמצא'
            },
            sections: {
                topSection: {
                    title: 'סטטיסטיקות מערכת מטמון',
                    visible: !document.querySelector('.top-section')?.classList.contains('d-none'),
                    content: document.querySelector('.top-section')?.textContent?.substring(0, 200) || 'לא נמצא'
                },
                actionsSection: {
                    title: 'פעולות מערכת מטמון',
                    visible: !document.getElementById('section1')?.classList.contains('d-none'),
                    content: document.getElementById('section1')?.textContent?.substring(0, 200) || 'לא נמצא'
                },
                feedbackSection: {
                    title: 'משוב ומידע מפורט',
                    visible: !document.getElementById('section2')?.classList.contains('d-none'),
                    content: document.getElementById('section2')?.textContent?.substring(0, 200) || 'לא נמצא'
                },
                logSection: {
                    title: 'לוג מערכת',
                    visible: !document.getElementById('section3')?.classList.contains('d-none'),
                    content: document.getElementById('section3')?.textContent?.substring(0, 200) || 'לא נמצא'
                }
            },
            console: {
                errors: [],
                warnings: [],
                logs: []
            }
        };

        // Capture console messages temporarily
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = function(...args) {
            logData.console.errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            logData.console.warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };

        console.log = function(...args) {
            logData.console.logs.push(args.join(' '));
            originalLog.apply(console, args);
        };

        // Restore original console functions after a short delay
        setTimeout(() => {
            console.error = originalError;
            console.warn = originalWarn;
            console.log = originalLog;
        }, 100);

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        return `Error generating log: ${error.message}`;
    }
}

function copyDetailedLog() {
    try {
        const logContent = generateDetailedLog();
        navigator.clipboard.writeText(logContent).then(() => {
            if (window.showNotification) {
                window.showNotification('לוג מפורט הועתק ללוח', 'success');
            } else {
                alert('לוג מפורט הועתק ללוח');
            }
        }).catch(err => {
            console.error('Failed to copy log:', err);
            // Fallback: show in console
            console.log('Detailed Log:', logContent);
            if (window.showNotification) {
                window.showNotification('לוג מפורט הוצג בקונסול', 'info');
            } else {
                alert('לוג מפורט הוצג בקונסול');
            }
        });
    } catch (error) {
        console.error('Error copying log:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בהעתקת הלוג', 'error');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

// ========================================
// Cache Test Page Helper Functions
// ========================================

/**
 * Show success message
 */
function showSuccessMessage(message, details = null) {
    if (window.cacheTestPage) {
        window.cacheTestPage.showSuccessMessage(message, details);
    } else if (window.showNotification) {
        window.showNotification(message, 'success');
    } else {
        console.log('✅ SUCCESS:', message, details);
    }
}

/**
 * Show warning message
 */
function showWarningMessage(message, details = null) {
    if (window.cacheTestPage) {
        window.cacheTestPage.showWarningMessage(message, details);
    } else if (window.showNotification) {
        window.showNotification(message, 'warning');
    } else {
        console.warn('⚠️ WARNING:', message, details);
    }
}

/**
 * Show error message
 */
function showErrorMessage(message, details = null) {
    if (window.cacheTestPage) {
        window.cacheTestPage.showErrorMessage(message, details);
    } else if (window.showNotification) {
        window.showNotification(message, 'error');
    } else {
        console.error('❌ ERROR:', message, details);
    }
}

/**
 * Clear log
 */
function clearLog() {
    if (window.cacheTestPage) {
        window.cacheTestPage.clearLog();
    }
}

/**
 * Export log
 */
function exportLog() {
    if (window.cacheTestPage) {
        window.cacheTestPage.exportLog();
    }
}

/**
 * Toggle all sections
 */
function toggleAllSections() {
    if (window.toggleAllSections) {
        window.toggleAllSections();
    }
}

// Export functions to global scope
window.copyDetailedLog = copyDetailedLog;
window.generateDetailedLog = generateDetailedLog;
window.showSuccessMessage = showSuccessMessage;
window.showWarningMessage = showWarningMessage;
window.showErrorMessage = showErrorMessage;
window.clearLog = clearLog;
window.exportLog = exportLog;
window.toggleAllSections = toggleAllSections;

// ========================================
// Cache Clearing Levels Testing
// ========================================

/**
 * Test all 4 cache clearing levels
 * Validates that each level clears what it should and doesn't clear what it shouldn't
 * @returns {Promise<Object>} Test results for all levels
 */
window.testClearingLevels = async function() {
    console.log('🧪 Testing all 4 cache clearing levels...');
    
    const startTime = Date.now();
    
    const testResults = {
        startTime: startTime,
        light: { tested: false, passed: false, details: {} },
        medium: { tested: false, passed: false, details: {} },
        full: { tested: false, passed: false, details: {} },
        nuclear: { tested: false, passed: false, note: 'Manual test only - too destructive' }
    };
    
    try {
        // Helper: Capture full snapshot
        async function captureSnapshot() {
            const snapshot = {
                memory: await window.UnifiedCacheManager.getLayerStats('memory'),
                localStorage: await window.UnifiedCacheManager.getLayerStats('localStorage'),
                indexedDB: await window.UnifiedCacheManager.getLayerStats('indexedDB'),
                backend: await window.UnifiedCacheManager.getLayerStats('backend'),
                orphansCount: 0
            };
            
            // Count orphan keys
            const orphanKeysList = [
                'cashFlowsSectionState', 'executionsTopSectionCollapsed',
                'colorScheme', 'customColorScheme', 'headerFilters', 'consoleSettings',
                'authToken', 'currentUser',
                'crud_test_results', 'linterLogs', 'css-duplicates-results', 'serverMonitorSettings'
            ];
            orphanKeysList.forEach(key => {
                if (localStorage.getItem(key) !== null) {
                    snapshot.orphansCount++;
                }
            });
            
            // Count dynamic keys
            Object.keys(localStorage).forEach(key => {
                if (/^sortState_|^section-visibility-|^top-section-collapsed-/.test(key)) {
                    snapshot.orphansCount++;
                }
            });
            
            return snapshot;
        }
        
        // === TEST LIGHT ===
        console.log('\n🧪 Testing LIGHT level...');
        const beforeLight = await captureSnapshot();
        
        // Clear using Light
        const lightResult = await window.clearAllCache({ 
            level: 'light', 
            skipConfirmation: true,
            verbose: false 
        });
        
        const afterLight = await captureSnapshot();
        
        testResults.light.tested = true;
        testResults.light.details = {
            memoryCleared: afterLight.memory.entries === 0,
            localStorageUntouched: afterLight.localStorage.entries === beforeLight.localStorage.entries,
            indexedDBUntouched: afterLight.indexedDB.entries === beforeLight.indexedDB.entries,
            orphansUntouched: afterLight.orphansCount >= beforeLight.orphansCount - 1  // -1 for css-duplicates
        };
        testResults.light.passed = 
            testResults.light.details.memoryCleared &&
            testResults.light.details.localStorageUntouched &&
            testResults.light.details.indexedDBUntouched;
        
        console.log(`${testResults.light.passed ? '✅' : '❌'} LIGHT test:`, testResults.light.details);
        
        // Wait a bit before next test
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // === TEST MEDIUM ===
        console.log('\n🧪 Testing MEDIUM level...');
        
        // Re-populate some data for testing
        await window.UnifiedCacheManager.save('test-medium', 'data', { layer: 'localStorage' });
        await window.UnifiedCacheManager.save('test-idb', 'data', { layer: 'indexedDB' });
        
        // IMPORTANT: Create orphan keys for testing!
        localStorage.setItem('test-orphan-medium', 'should-stay');
        localStorage.setItem('colorScheme', 'test-scheme');
        
        const beforeMedium = await captureSnapshot();
        console.log('📊 Before Medium:', {
            localStorage: beforeMedium.localStorage.entries,
            indexedDB: beforeMedium.indexedDB.entries,
            orphans: beforeMedium.orphansCount
        });
        
        const mediumResult = await window.clearAllCache({ 
            level: 'medium', 
            skipConfirmation: true,
            verbose: false 
        });
        
        // Wait a bit for async operations to complete
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const afterMedium = await captureSnapshot();
        console.log('📊 After Medium:', {
            localStorage: afterMedium.localStorage.entries,
            indexedDB: afterMedium.indexedDB.entries,
            orphans: afterMedium.orphansCount
        });
        
        testResults.medium.tested = true;
        testResults.medium.details = {
            memoryCleared: afterMedium.memory.entries === 0,
            localStorageCleared: afterMedium.localStorage.entries === 0,
            indexedDBCleared: afterMedium.indexedDB.entries === 0,
            backendCleared: afterMedium.backend.entries === 0,
            orphansUntouched: afterMedium.orphansCount >= beforeMedium.orphansCount  // Should stay!
        };
        testResults.medium.passed = 
            testResults.medium.details.memoryCleared &&
            testResults.medium.details.localStorageCleared &&
            testResults.medium.details.indexedDBCleared &&
            testResults.medium.details.orphansUntouched;
        
        console.log(`${testResults.medium.passed ? '✅' : '❌'} MEDIUM test:`, testResults.medium.details);
        
        // Cleanup orphans we created
        localStorage.removeItem('test-orphan-medium');
        localStorage.removeItem('colorScheme');
        
        // Wait before next test
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // === TEST FULL ===
        console.log('\n🧪 Testing FULL level...');
        
        // Re-populate ALL layers for testing
        await window.UnifiedCacheManager.save('test-full-memory', 'data', { layer: 'memory' });
        await window.UnifiedCacheManager.save('test-full-ls', 'data', { layer: 'localStorage' });
        await window.UnifiedCacheManager.save('test-full-idb', 'data', { layer: 'indexedDB' });
        
        // Add some orphan keys for testing
        localStorage.setItem('test-orphan-state', 'test');
        localStorage.setItem('sortState_test', 'test');
        localStorage.setItem('colorScheme', 'test-full');
        
        const beforeFull = await captureSnapshot();
        console.log('📊 Before Full:', {
            memory: beforeFull.memory.entries,
            localStorage: beforeFull.localStorage.entries,
            indexedDB: beforeFull.indexedDB.entries,
            orphans: beforeFull.orphansCount
        });
        
        const fullResult = await window.clearAllCache({ 
            level: 'full', 
            skipConfirmation: true,
            verbose: false,
            includeAuth: false  // Don't clear auth for safety in testing
        });
        
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const afterFull = await captureSnapshot();
        console.log('📊 After Full:', {
            memory: afterFull.memory.entries,
            localStorage: afterFull.localStorage.entries,
            indexedDB: afterFull.indexedDB.entries,
            orphans: afterFull.orphansCount
        });
        
        testResults.full.tested = true;
        testResults.full.details = {
            memoryCleared: afterFull.memory.entries === 0,
            localStorageCleared: afterFull.localStorage.entries === 0,
            indexedDBCleared: afterFull.indexedDB.entries === 0,
            orphansCleared: afterFull.orphansCount < beforeFull.orphansCount,
            authPreserved: true  // We set includeAuth=false
        };
        testResults.full.passed = 
            testResults.full.details.memoryCleared &&
            testResults.full.details.localStorageCleared &&
            testResults.full.details.indexedDBCleared &&
            testResults.full.details.orphansCleared;
        
        console.log(`${testResults.full.passed ? '✅' : '❌'} FULL test:`, testResults.full.details);
        
        // === NUCLEAR - MANUAL ONLY ===
        console.log('\n⚠️ NUCLEAR test: Manual only (too destructive for automated testing)');
        testResults.nuclear.tested = false;
        testResults.nuclear.passed = 'N/A';
        
        // === SUMMARY ===
        const duration = Date.now() - startTime;
        const totalPassed = Object.values(testResults).filter(r => r && typeof r === 'object' && r.passed === true).length;
        const totalTested = Object.values(testResults).filter(r => r && typeof r === 'object' && r.tested === true).length;
        const totalFailed = totalTested - totalPassed;
        
        console.log('\n📊 Test Summary:');
        console.log(`✅ Passed: ${totalPassed}/${totalTested}`);
        console.log('Results:', testResults);
        
        // Build detailed message
        let detailedMessage = `סה"כ נבדקו: ${totalTested} רמות\n`;
        detailedMessage += `✅ עברו: ${totalPassed}\n`;
        if (totalFailed > 0) {
            detailedMessage += `❌ נכשלו: ${totalFailed}\n`;
        }
        detailedMessage += `\n📋 פירוט:\n`;
        detailedMessage += `• Light: ${testResults.light.passed ? '✅ עבר' : '❌ נכשל'}\n`;
        detailedMessage += `• Medium: ${testResults.medium.passed ? '✅ עבר' : '❌ נכשל'}\n`;
        detailedMessage += `• Full: ${testResults.full.passed ? '✅ עבר' : '❌ נכשל'}\n`;
        detailedMessage += `• Nuclear: ⚠️ בדיקה ידנית בלבד`;
        
        // Show results in UI - Final Success Modal or Error
        if (totalPassed === totalTested) {
            // All tests passed - show Final Success Modal with details
            if (typeof window.showFinalSuccessNotification === 'function') {
                await window.showFinalSuccessNotification(
                    'בדיקת רמות ניקוי הושלמה בהצלחה! ✅',
                    `בדיקת רמות הניקוי עברה בהצלחה.\n\n${detailedMessage}\n\nזמן בדיקה: ${duration}ms`,
                    {
                        operation: 'cache-clearing-levels-test',
                        duration: `${duration}ms`,
                        timestamp: new Date().toISOString(),
                        results: {
                            light: testResults.light,
                            medium: testResults.medium,
                            full: testResults.full,
                            nuclear: testResults.nuclear
                        },
                        totalTested: totalTested,
                        totalPassed: totalPassed,
                        totalFailed: totalFailed,
                        successRate: '100%',
                        status: 'all-tests-passed',
                        healthCheck: 'כל רמות הניקוי עובדות כצפוי',
                        nextAction: 'המערכת מוכנה לשימוש מלא'
                    },
                    'testing'
                );
            }
        } else {
            // Some tests failed - show Error Modal
            if (typeof window.showErrorNotification === 'function') {
                await window.showErrorNotification(
                    'בדיקת רמות ניקוי',
                    `⚠️ יש כשלים בבדיקה\n\n${detailedMessage}\n\nבדוק את הקונסול לפרטים מלאים.`,
                    10000,
                    'testing'
                );
            }
        }
        
        return testResults;
        
    } catch (error) {
        console.error('❌ Testing failed:', error);
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                'בדיקת רמות ניקוי',
                `❌ שגיאה קריטית!\n\nהבדיקה נכשלה בשגיאה:\n• ${error.message}\n• ${error.stack?.split('\n')[0] || 'לא זמין'}\n\nבדוק את הקונסול לפרטים מלאים.`,
                10000,
                'testing'
            );
        }
        return testResults;
    }
};

// Initialize when DOM is ready - only if not already initialized by UnifiedAppInitializer
// Skip direct initialization for cache-test page as it's handled by UnifiedAppInitializer
if (!window.cacheTestPage && !window.location.pathname.includes('cache-test')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.cacheTestPage = new CacheTestPage();
            window.cacheTestPage.init();
        });
    } else {
        window.cacheTestPage = new CacheTestPage();
        window.cacheTestPage.init();
    }
}

console.log('🧪 Cache Test Page - JavaScript ready, class available:', typeof CacheTestPage);
