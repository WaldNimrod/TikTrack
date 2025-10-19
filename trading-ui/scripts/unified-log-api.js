/**
 * Unified Log API - TikTrack
 * ==========================
 *
 * API פשוט לשימוש במערכת הלוגים החדשה
 * מאפשר יישום פשוט בכל עמוד עם ממשק אחיד
 *
 * USAGE EXAMPLES:
 * ===============
 * 
 * // Basic usage
 * window.UnifiedLogAPI.showLog('notificationHistory', 'log-container');
 * 
 * // Advanced usage
 * window.UnifiedLogAPI.showLog('linterHistory', 'log-container', {
 *     displayConfig: 'full',
 *     autoRefresh: true,
 *     filters: { timeRange: 'lastDay' }
 * });
 * 
 * // Multiple logs
 * window.UnifiedLogAPI.showMultipleLogs([
 *     { type: 'notificationHistory', container: 'notifications-log' },
 *     { type: 'linterHistory', container: 'linter-log' }
 * ]);
 * 
 * // Export data
 * window.UnifiedLogAPI.exportLog('notificationHistory', 'csv');
 * 
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== UNIFIED LOG API =====

class UnifiedLogAPI {
    constructor() {
        this.initialized = false;
        this.activeDisplays = new Map();
        this.defaultOptions = {
            displayConfig: 'default',
            autoLoad: true,
            showLoading: true,
            autoRefresh: false,
            refreshInterval: 30000,
            filters: {},
            sortBy: null,
            sortOrder: 'desc',
            pagination: { page: 1, itemsPerPage: 50 }
        };
    }

    /**
     * Initialize the API
     */
    async initialize() {
        if (this.initialized) {
            console.log('✅ UnifiedLogAPI already initialized');
            return;
        }

        try {
            console.log('🚀 Initializing UnifiedLogAPI...');
            
            // Check dependencies
            if (!window.UnifiedLogManager) {
                throw new Error('UnifiedLogManager not available');
            }

            if (!window.UnifiedLogDisplay) {
                throw new Error('UnifiedLogDisplay not available');
            }

            // Initialize LogManager if needed
            if (!window.UnifiedLogManager.initialized) {
                await window.UnifiedLogManager.initialize();
            }

            this.initialized = true;
            console.log('✅ UnifiedLogAPI initialized successfully');
            
            return this.getStatus();
        } catch (error) {
            console.error('❌ Failed to initialize UnifiedLogAPI:', error);
            throw error;
        }
    }

    /**
     * Show a single log
     */
    async showLog(logType, containerId, options = {}) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const mergedOptions = { ...this.defaultOptions, ...options };
            
            console.log(`📊 Showing log: ${logType} in container: ${containerId}`);
            
            // Create or get existing display
            let display = this.activeDisplays.get(containerId);
            
            if (!display) {
                // Set the log type in options
                mergedOptions.logType = logType;
                display = new window.UnifiedLogDisplay(containerId, mergedOptions);
                this.activeDisplays.set(containerId, display);
            } else {
                // Update existing display with new log type
                display.setLogType(logType);
            }

            // Set log type and load data
            display.setLogType(logType);
            
            return display;
        } catch (error) {
            console.error(`❌ Failed to show log ${logType}:`, error);
            this.showError(containerId, error.message);
            throw error;
        }
    }

    /**
     * Show multiple logs
     */
    async showMultipleLogs(logConfigs, globalOptions = {}) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            console.log(`📊 Showing ${logConfigs.length} logs`);
            
            const results = [];
            
            for (const config of logConfigs) {
                const { type, container, options = {} } = config;
                const mergedOptions = { ...globalOptions, ...options };
                
                try {
                    const display = await this.showLog(type, container, mergedOptions);
                    results.push({ success: true, type, container, display });
                } catch (error) {
                    console.error(`❌ Failed to show log ${type} in ${container}:`, error);
                    results.push({ success: false, type, container, error: error.message });
                }
            }
            
            return results;
        } catch (error) {
            console.error('❌ Failed to show multiple logs:', error);
            throw error;
        }
    }

    /**
     * Hide a log display
     */
    hideLog(containerId) {
        const display = this.activeDisplays.get(containerId);
        if (display) {
            display.destroy();
            this.activeDisplays.delete(containerId);
            console.log(`📊 Hidden log in container: ${containerId}`);
        }
    }

    /**
     * Hide all log displays
     */
    hideAllLogs() {
        for (const [containerId, display] of this.activeDisplays) {
            display.destroy();
        }
        this.activeDisplays.clear();
        console.log('📊 Hidden all log displays');
    }

    /**
     * Refresh a specific log
     */
    async refreshLog(containerId) {
        const display = this.activeDisplays.get(containerId);
        if (display) {
            await display.refresh();
            console.log(`📊 Refreshed log in container: ${containerId}`);
        } else {
            console.warn(`⚠️ No active display found for container: ${containerId}`);
        }
    }

    /**
     * Refresh all logs
     */
    async refreshAllLogs() {
        const refreshPromises = [];
        
        for (const [containerId, display] of this.activeDisplays) {
            refreshPromises.push(display.refresh());
        }
        
        await Promise.all(refreshPromises);
        console.log('📊 Refreshed all log displays');
    }

    /**
     * Export log data
     */
    async exportLog(logType, format = 'csv', options = {}) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            console.log(`📊 Exporting ${logType} as ${format}`);
            
            const result = await window.UnifiedLogManager.exportLogData(logType, format, options);
            
            if (window.showNotification) {
                window.showNotification(`הנתונים יוצאו בהצלחה: ${result.filename || 'ללוח'}`, 'success');
            }
            
            return result;
        } catch (error) {
            console.error(`❌ Failed to export ${logType} as ${format}:`, error);
            
            if (window.showNotification) {
                window.showNotification(`שגיאה בייצוא: ${error.message}`, 'error');
            }
            
            throw error;
        }
    }

    /**
     * Get log data without displaying
     */
    async getLogData(logType, options = {}) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            return await window.UnifiedLogManager.getLogData(logType, options);
        } catch (error) {
            console.error(`❌ Failed to get log data for ${logType}:`, error);
            throw error;
        }
    }

    /**
     * Get available log types
     */
    getAvailableLogTypes() {
        if (!this.initialized || !window.UnifiedLogManager) {
            return [];
        }
        
        return window.UnifiedLogManager.getAvailableLogTypes();
    }

    /**
     * Get log type configuration
     */
    getLogTypeConfig(logType) {
        if (!this.initialized || !window.UnifiedLogManager) {
            return null;
        }
        
        return window.UnifiedLogManager.getLogTypeConfig(logType);
    }

    /**
     * Set global options
     */
    setGlobalOptions(options) {
        this.defaultOptions = { ...this.defaultOptions, ...options };
        console.log('📊 Updated global options:', this.defaultOptions);
    }

    /**
     * Get active displays
     */
    getActiveDisplays() {
        return Array.from(this.activeDisplays.entries()).map(([containerId, display]) => ({
            containerId,
            logType: display.options.logType,
            displayConfig: display.options.displayConfig
        }));
    }

    /**
     * Show error in container
     */
    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>שגיאה:</strong> ${message}
                </div>
            `;
        }
    }

    /**
     * Get API status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            activeDisplays: this.activeDisplays.size,
            defaultOptions: this.defaultOptions,
            availableLogTypes: this.getAvailableLogTypes().length,
            logManagerAvailable: !!window.UnifiedLogManager,
            displayComponentAvailable: !!window.UnifiedLogDisplay
        };
    }
}

// ===== GLOBAL INSTANCE =====

// Create global instance
window.UnifiedLogAPI = new UnifiedLogAPI();

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Quick function to show notification log
 */
window.showNotificationLog = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('notificationHistory', containerId, options);
};

/**
 * Quick function to show linter log
 */
window.showLinterLog = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('linterHistory', containerId, options);
};

/**
 * Quick function to show system logs
 */
window.showSystemLogs = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('systemLogs', containerId, options);
};

/**
 * Quick function to show error reports
 */
window.showErrorReports = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('errorReports', containerId, options);
};

/**
 * Quick function to show file mappings
 */
window.showFileMappings = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('fileMappings', containerId, options);
};

/**
 * Quick function to show chart history
 */
window.showChartHistory = function(containerId, options = {}) {
    return window.UnifiedLogAPI.showLog('chartHistory', containerId, options);
};

/**
 * Quick function to show background tasks log
 */
window.showBackgroundTasksLog = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('backgroundTasksLog', containerId, options);
};

/**
 * Quick function to show external data log
 */
window.showExternalDataLog = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('externalDataLog', containerId, options);
};

/**
 * Quick function to show server app logs
 */
window.showServerAppLogs = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('serverAppLogs', containerId, options);
};

/**
 * Quick function to show server error logs
 */
window.showServerErrorLogs = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('serverErrorLogs', containerId, options);
};

/**
 * Quick function to show server performance logs
 */
window.showServerPerformanceLogs = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('serverPerformanceLogs', containerId, options);
};

/**
 * Quick function to show server database logs
 */
window.showServerDatabaseLogs = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('serverDatabaseLogs', containerId, options);
};

/**
 * Quick function to show server cache logs
 */
window.showServerCacheLogs = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('serverCacheLogs', containerId, options);
};

/**
 * Quick function to show server background tasks logs
 */
window.showServerBackgroundTasksLogs = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('serverBackgroundTasksLogs', containerId, options);
};

/**
 * Quick function to show background tasks file log (alias)
 */
window.showBackgroundTasksFileLog = function(containerId = 'unified-logs-container', options = {}) {
    return window.showServerBackgroundTasksLogs(containerId, options);
};

/**
 * Quick function to show cache log
 */
window.showCacheLog = function(containerId = 'unified-logs-container', options = {}) {
    return window.UnifiedLogAPI.showLog('cacheLog', containerId, options);
};

/**
 * Quick function to export any log
 */
window.exportLog = function(logType, format = 'csv', options = {}) {
    return window.UnifiedLogAPI.exportLog(logType, format, options);
};

/**
 * Quick function to get log data
 */
window.getLogData = function(logType, options = {}) {
    return window.UnifiedLogAPI.getLogData(logType, options);
};

/**
 * Quick function to get available log types
 */
window.getAvailableLogTypes = function() {
    return window.UnifiedLogAPI.getAvailableLogTypes();
};

// ===== INTEGRATION WITH UNIFIED INITIALIZATION =====

/**
 * Initialize API when unified system is ready
 */
// הוסר - המערכת המאוחדת מטפלת באתחול
// document.addEventListener('DOMContentLoaded', async function() {
//     // Wait for unified initialization system
//     if (window.UnifiedAppInitializer) {
//         // API will be initialized when needed
//         console.log('📊 UnifiedLogAPI ready for initialization');
//     } else {
//         // Fallback initialization
//         try {
//             await window.UnifiedLogAPI.initialize();
//         } catch (error) {
//             console.warn('⚠️ Failed to initialize UnifiedLogAPI:', error);
//         }
//     }
// });

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedLogAPI;
}

console.log('📊 UnifiedLogAPI loaded successfully');
