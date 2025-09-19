/**
 * Project Files Scanner - Global System
 * ====================================
 * 
 * מנגנון גלובלי לסריקת ותיעוד קבצי הפרויקט
 * זמין לכל העמודים במערכת
 * 
 * @version 1.0.0
 * @lastUpdated September 19, 2025
 * @author TikTrack Development Team
 */

// ========================================
// Global Project Files Scanner
// ========================================

class ProjectFilesScanner {
    constructor() {
        this.cacheKey = 'projectFilesScanner';
        this.cacheTimeKey = 'projectFilesScannerTimestamp';
        this.maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
        this.discoveredFiles = null;
    }

    /**
     * Get all project files (with caching)
     * @returns {Object} Object with file arrays by type
     */
    async getProjectFiles() {
        // Check cache first
        const cached = this.getCachedFiles();
        if (cached) {
            return cached;
        }

        // Discover files if no cache
        return await this.discoverAllFiles();
    }

    /**
     * Get cached files if available and fresh
     * @returns {Object|null} Cached files or null
     */
    getCachedFiles() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            const cacheTime = localStorage.getItem(this.cacheTimeKey);
            
            if (cached && cacheTime) {
                const age = Date.now() - parseInt(cacheTime);
                if (age < this.maxCacheAge) {
                    this.discoveredFiles = JSON.parse(cached);
                    return this.discoveredFiles;
                }
            }
        } catch (error) {
            console.warn('Error reading cached files:', error);
        }
        return null;
    }

    /**
     * Discover all project files
     * @returns {Object} Object with file arrays by type
     */
    async discoverAllFiles() {
        const discoveredFiles = {
            js: [],
            html: [],
            css: [],
            python: [],
            other: []
        };

        // JavaScript files
        discoveredFiles.js = [
            'trading-ui/scripts/linter-realtime-monitor.js',
            'trading-ui/scripts/linter-file-analysis.js',
            'trading-ui/scripts/linter-testing-system.js',
            'trading-ui/scripts/linter-export-system.js',
            'trading-ui/scripts/indexeddb-adapter.js',
            'trading-ui/scripts/log-recovery.js',
            'trading-ui/scripts/data-collector.js',
            'trading-ui/scripts/chart-renderer.js',
            'trading-ui/scripts/main.js',
            'trading-ui/scripts/notification-system.js',
            'trading-ui/scripts/ui-utils.js',
            'trading-ui/scripts/tables.js',
            'trading-ui/scripts/linked-items.js',
            'trading-ui/scripts/page-utils.js',
            'trading-ui/scripts/data-utils.js',
            'trading-ui/scripts/translation-utils.js',
            'trading-ui/scripts/console-cleanup.js',
            'trading-ui/scripts/date-utils.js',
            'trading-ui/scripts/color-demo-toggle.js',
            'trading-ui/scripts/color-scheme-system.js',
            'trading-ui/scripts/preferences.js',
            'trading-ui/scripts/header-system.js',
            'trading-ui/scripts/filter-system.js',
            'trading-ui/scripts/accounts.js',
            'trading-ui/scripts/executions.js',
            'trading-ui/scripts/trades.js',
            'trading-ui/scripts/database.js',
            'trading-ui/scripts/background-tasks.js',
            'trading-ui/scripts/alerts.js',
            'trading-ui/scripts/tickers.js',
            'trading-ui/scripts/trade_plans.js',
            'trading-ui/scripts/entity-details-renderer.js',
            'trading-ui/scripts/menu.js',
            'trading-ui/scripts/preferences-page.js',
            'trading-ui/scripts/server-monitor.js',
            'trading-ui/scripts/project-files-scanner.js'
        ];

        // HTML files
        discoveredFiles.html = [
            'trading-ui/linter-realtime-monitor.html',
            'trading-ui/crud-testing-dashboard.html',
            'trading-ui/test-header-only.html',
            'trading-ui/color-scheme-examples.html',
            'trading-ui/test-header-menus-pushed.html',
            'trading-ui/test-header-yesterday.html',
            'trading-ui/index.html',
            'trading-ui/accounts.html',
            'trading-ui/executions.html',
            'trading-ui/trades.html',
            'trading-ui/preferences.html',
            'trading-ui/database.html',
            'trading-ui/background-tasks.html',
            'trading-ui/alerts.html',
            'trading-ui/tickers.html',
            'trading-ui/trade_plans.html',
            'trading-ui/server-monitor.html'
        ];

        // CSS files
        discoveredFiles.css = [
            'trading-ui/styles-new/01-settings/_variables.css',
            'trading-ui/styles-new/02-tools/_mixins.css',
            'trading-ui/styles-new/03-generic/_reset.css',
            'trading-ui/styles-new/04-elements/_typography.css',
            'trading-ui/styles-new/05-objects/_layout.css',
            'trading-ui/styles-new/06-components/_buttons-advanced.css',
            'trading-ui/styles-new/06-components/_tables.css',
            'trading-ui/styles-new/07-utilities/_spacing.css',
            'trading-ui/styles-new/header-styles.css',
            'trading-ui/styles/header-styles.css',
            'trading-ui/styles/main-styles.css',
            'trading-ui/styles-new/08-themes/_dark-theme.css',
            'trading-ui/styles-new/08-themes/_light-theme.css',
            'trading-ui/styles-new/09-overrides/_bootstrap-overrides.css'
        ];

        // Python files
        discoveredFiles.python = [
            'Backend/dev_server.py',
            'Backend/db_manager.py',
            'Backend/api_handler.py',
            'Backend/background_tasks.py',
            'Backend/indexeddb_service.py',
            'Backend/data_collector.py',
            'Backend/chart_service.py',
            'Backend/linter_service.py',
            'Backend/preferences_service.py',
            'Backend/accounts_service.py',
            'Backend/executions_service.py',
            'Backend/trades_service.py',
            'Backend/database_service.py',
            'Backend/app.py',
            'Backend/config.py',
            'Backend/models.py',
            'Backend/services.py',
            'Backend/utils.py',
            'Backend/validators.py',
            'Backend/external_data.py'
        ];

        // Other files
        discoveredFiles.other = [
            'README.md',
            'package.json',
            'requirements.txt',
            'documentation/frontend/LINTER_SYSTEM.md',
            'documentation/frontend/CHART_IMPLEMENTATION.md',
            'documentation/frontend/INDEXEDDB_SYSTEM.md',
            'documentation/frontend/BACKGROUND_TASKS.md',
            'documentation/frontend/TESTING_SYSTEM.md',
            'documentation/frontend/EXPORT_SYSTEM.md',
            'documentation/frontend/NOTIFICATION_SYSTEM.md',
            'documentation/frontend/HEADER_SYSTEM.md',
            'documentation/frontend/FILTER_SYSTEM.md',
            'documentation/backend/API_DOCUMENTATION.md',
            'documentation/backend/DATABASE_SCHEMA.md',
            'documentation/backend/SERVICES_ARCHITECTURE.md',
            'documentation/backend/EXTERNAL_DATA_INTEGRATION.md',
            'documentation/backend/BACKGROUND_PROCESSES.md',
            'documentation/backend/SECURITY_GUIDELINES.md',
            'documentation/backend/PERFORMANCE_OPTIMIZATION.md',
            'documentation/backend/DEPLOYMENT_GUIDE.md',
            'documentation/backend/MONITORING_AND_LOGGING.md',
            'documentation/backend/ERROR_HANDLING.md',
            'documentation/backend/TESTING_STRATEGY.md',
            'documentation/backend/MAINTENANCE_GUIDE.md',
            'documentation/backend/TROUBLESHOOTING.md',
            'documentation/backend/UPGRADE_PROCEDURES.md',
            'documentation/backend/BACKUP_AND_RECOVERY.md',
            'documentation/backend/SCALING_GUIDELINES.md',
            'documentation/backend/INTEGRATION_GUIDE.md',
            'documentation/backend/CUSTOMIZATION_GUIDE.md'
        ];

        // Cache the results
        this.cacheFiles(discoveredFiles);
        this.discoveredFiles = discoveredFiles;
        
        return discoveredFiles;
    }

    /**
     * Cache discovered files
     * @param {Object} files - Files to cache
     */
    cacheFiles(files) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(files));
            localStorage.setItem(this.cacheTimeKey, Date.now().toString());
        } catch (error) {
            console.warn('Error caching files:', error);
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        localStorage.removeItem(this.cacheKey);
        localStorage.removeItem(this.cacheTimeKey);
        this.discoveredFiles = null;
    }

    /**
     * Get files by type
     * @param {string} type - File type (js, html, css, python, other)
     * @returns {Array} Array of files
     */
    async getFilesByType(type) {
        const files = await this.getProjectFiles();
        return files[type] || [];
    }

    /**
     * Get total file count
     * @returns {number} Total number of files
     */
    async getTotalFileCount() {
        const files = await this.getProjectFiles();
        return Object.values(files).reduce((sum, fileArray) => sum + fileArray.length, 0);
    }

    /**
     * Get file statistics
     * @returns {Object} Statistics object
     */
    async getFileStatistics() {
        const files = await this.getProjectFiles();
        const stats = {};
        
        Object.keys(files).forEach(type => {
            stats[type] = files[type].length;
        });
        
        stats.total = Object.values(stats).reduce((sum, count) => sum + count, 0);
        
        return stats;
    }
}

// ========================================
// Global Instance and Functions
// ========================================

// Create global instance
window.projectFilesScanner = new ProjectFilesScanner();

// Global convenience functions
window.getProjectFiles = () => window.projectFilesScanner.getProjectFiles();
window.getFilesByType = (type) => window.projectFilesScanner.getFilesByType(type);
window.getTotalFileCount = () => window.projectFilesScanner.getTotalFileCount();
window.getFileStatistics = () => window.projectFilesScanner.getFileStatistics();
window.clearProjectFilesCache = () => window.projectFilesScanner.clearCache();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectFilesScanner;
}
