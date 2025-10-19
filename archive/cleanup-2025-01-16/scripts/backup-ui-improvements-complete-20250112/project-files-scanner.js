/**
 * Global Project Files Scanner
 * מנגנון גלובלי לסריקת ותיעוד קבצי הפרויקט
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @description Provides comprehensive file discovery and caching for the entire project
 */

// ========================================
// Global Project Files Scanner Class
// ========================================

class ProjectFilesScanner {
    constructor() {
        this.cache = {
            files: null,
            timestamp: null,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        };
        
        this.fileTypes = {
            js: { extensions: ['.js'], count: 0 },
            html: { extensions: ['.html', '.htm'], count: 0 },
            css: { extensions: ['.css'], count: 0 },
            python: { extensions: ['.py'], count: 0 },
            other: { extensions: ['.md', '.json', '.txt', '.yml', '.yaml', '.xml', '.sql', '.sh', '.bat'], count: 0 }
        };
        
        this.excludePatterns = [
            'node_modules',
            '.git',
            '__pycache__',
            '.pytest_cache',
            'venv',
            'env',
            '.env',
            'dist',
            'build',
            'coverage',
            '.coverage',
            'backup',
            'backups',
            'temp',
            'tmp',
            '.DS_Store',
            'Thumbs.db'
        ];
    }

    /**
     * Get all project files with caching
     * @returns {Object} Object containing arrays of files by type
     */
    async getProjectFiles() {
        // Check cache first
        if (this.isCacheValid()) {
            return this.cache.files;
        }

        // Discover files
        const discoveredFiles = await this.discoverAllFiles();
        
        // Update cache
        this.cache.files = discoveredFiles;
        this.cache.timestamp = Date.now();
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        return discoveredFiles;
    }

    /**
     * Get files by specific type
     * @param {string} type - File type (js, html, css, python, other)
     * @returns {Array} Array of file paths
     */
    async getFilesByType(type) {
        const allFiles = await this.getProjectFiles();
        return allFiles[type] || [];
    }

    /**
     * Get total number of files
     * @returns {number} Total file count
     */
    async getTotalFileCount() {
        const allFiles = await this.getProjectFiles();
        return Object.values(allFiles).reduce((sum, files) => sum + files.length, 0);
    }

    /**
     * Get file statistics by type
     * @returns {Object} Statistics object
     */
    async getFileStatistics() {
        const allFiles = await this.getProjectFiles();
        const stats = {
            total: 0,
            js: 0,
            html: 0,
            css: 0,
            python: 0,
            other: 0
        };

        Object.keys(allFiles).forEach(type => {
            const count = allFiles[type] ? allFiles[type].length : 0;
            stats[type] = count;
            stats.total += count;
        });

        return stats;
    }

    /**
     * Clear project files cache
     */
    clearCache() {
        this.cache.files = null;
        this.cache.timestamp = null;
        localStorage.removeItem('projectFiles');
        localStorage.removeItem('projectFilesTimestamp');
    }

    /**
     * Check if cache is valid
     * @returns {boolean} True if cache is valid
     */
    isCacheValid() {
        if (!this.cache.files || !this.cache.timestamp) {
            return false;
        }
        
        const age = Date.now() - this.cache.timestamp;
        return age < this.cache.maxAge;
    }

    /**
     * Save cache to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('projectFiles', JSON.stringify(this.cache.files));
            localStorage.setItem('projectFilesTimestamp', this.cache.timestamp.toString());
        } catch (error) {
            console.warn('Failed to save project files cache:', error);
        }
    }

    /**
     * Load cache from localStorage
     */
    loadFromLocalStorage() {
        try {
            const cached = localStorage.getItem('projectFiles');
            const timestamp = localStorage.getItem('projectFilesTimestamp');
            
            if (cached && timestamp) {
                this.cache.files = JSON.parse(cached);
                this.cache.timestamp = parseInt(timestamp);
            }
        } catch (error) {
            console.warn('Failed to load project files cache:', error);
        }
    }

    /**
     * Discover all files in the project dynamically
     * @returns {Object} Object containing arrays of files by type
     */
    async discoverAllFiles() {
        const discoveredFiles = {
            js: [],
            html: [],
            css: [],
            python: [],
            other: []
        };

        try {
            // Try to get files from server API first

            const serverFiles = await this.getFilesFromServer();
            if (serverFiles && Object.keys(serverFiles).length > 0) {
                console.log('✅ Server file discovery successful, using dynamic files');
                return serverFiles;
            }
        } catch (error) {
            console.warn('❌ Failed to get files from server, trying local API:', error);
        }

        try {
            // Try local file discovery as second option
            const localFiles = await this.getFilesFromLocalAPI();
            if (localFiles && Object.keys(localFiles).length > 0) {
                return localFiles;
            }
        } catch (error) {
            console.warn('Failed to get files from local API, falling back to static list:', error);
        }

        // Fallback to static file lists if server is not available
        console.log('📁 Using static file lists as fallback');
        const staticFiles = this.getStaticFileLists();
        
        // Process each file type
        Object.keys(staticFiles).forEach(type => {
            if (discoveredFiles[type]) {
                discoveredFiles[type] = staticFiles[type].filter(file => 
                    this.isValidFile(file)
                );
            }
        });

        const totalFiles = Object.values(discoveredFiles).reduce((sum, files) => sum + files.length, 0);
        console.log(`📁 Static file discovery completed: ${totalFiles} files found`);

        return discoveredFiles;
    }

    /**
     * Get files from server API
     * @returns {Object} Object containing arrays of files by type
     */
    async getFilesFromServer() {
        try {
            console.log('🔍 Fetching files from server API...');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 seconds timeout
            
            const response = await fetch('/api/file-scanner/files', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            console.log('🔍 Response status:', response.status);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔍 Server response data:', data);
            console.log('🔍 Data success:', data.success);
            console.log('🔍 Data files:', data.files);
            
            if (data.success && data.files) {
                console.log(`✅ Server file discovery successful: ${data.total_files} files found`);
                console.log('📊 File breakdown:', {
                    js: data.files.js?.length || 0,
                    html: data.files.html?.length || 0,
                    css: data.files.css?.length || 0,
                    python: data.files.python?.length || 0,
                    other: data.files.other?.length || 0
                });
                return data.files;
            } else {
                console.error('❌ Server returned invalid response:', data);
                throw new Error('Server returned invalid response');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ Server file discovery timed out after 35 seconds');
            } else {
                console.error('❌ Server file discovery failed:', error);
            }
            return null;
        }
    }

    /**
     * Discover files using local file system API (if available)
     * @returns {Object} Object containing arrays of files by type
     */
    async getFilesFromLocalAPI() {
        try {
            // Try to use File System Access API if available
            if ('showDirectoryPicker' in window) {
                // This would require user interaction, so we'll skip for now
                return null;
            }
            
            // Try to use a local file discovery mechanism
            // This could be implemented with a local server or other method
            return null;
        } catch (error) {
            console.warn('Local file discovery failed:', error);
            return null;
        }
    }

    /**
     * Get comprehensive static file lists
     * @returns {Object} Object containing arrays of files by type
     */
    getStaticFileLists() {
        return {
            js: [
                // Core System Files (only existing files)
                'scripts/main.js',
                'scripts/ui-utils.js',
                'scripts/notification-system.js',
                'scripts/tables.js',
                'scripts/header-system.js',
                'scripts/color-scheme-system.js',
                'scripts/linter-realtime-monitor.js',
                
                // Trading System (only existing files)
                'scripts/accounts.js',
                'scripts/executions.js',
                'scripts/trades.js',
                
                // CRUD System (only existing files)
                'scripts/crud-utils.js',
                
                // Preferences System (only existing files)
                'scripts/preferences.js',
                'scripts/preferences-admin.js',
                'scripts/preferences-page.js',
                
                // Utility Files (only existing files)
                'scripts/chart-renderer.js',
                'scripts/data-collector.js',
                'scripts/indexeddb-adapter.js',
                'scripts/log-recovery.js',
                'scripts/linter-file-analysis.js',
                'scripts/linter-testing-system.js',
                'scripts/linter-export-system.js',
                
                // Additional Core Files (only existing files)
                'scripts/account-service.js',
                'scripts/accounts.js',
                'scripts/active-alerts-component.js',
                'scripts/alert-service.js',
                'scripts/alerts.js',
                'scripts/auth.js',
                'scripts/background-tasks.js',
                'scripts/button-icons.js',
                'scripts/cache-test.js',
                'scripts/cash_flows.js',
                'scripts/central-refresh-system.js',
                'scripts/color-demo-toggle.js',
                'scripts/condition-translator.js',
                'scripts/console-cleanup.js',
                'scripts/constraint-manager.js',
                'scripts/constraints.js',
                'scripts/css-management.js',
                'scripts/currencies.js',
                'scripts/database.js',
                'scripts/date-utils.js',
                'scripts/db_display.js',
                'scripts/db-extradata.js',
                'scripts/dynamic-colors-display.js',
                'scripts/entity-details-api.js',
                'scripts/entity-details-modal.js',
                'scripts/entity-details-renderer.js',
                'scripts/entity-details-system.js',
                'scripts/error-handlers.js',
                'scripts/external-data-dashboard.js',
                'scripts/external-data-service.js',
                'scripts/filter-system.js',
                'scripts/header-component.js',
                'scripts/index.js',
                'scripts/js-map-indexeddb-adapter.js',
                'scripts/js-map.js',
                'scripts/linked-items.js',
                'scripts/menu.js',
                'scripts/notes.js',
                'scripts/notifications-center.js',
                'scripts/page-utils.js',
                'scripts/project-files-scanner.js',
                'scripts/real-linter-system.js',
                'scripts/realtime-notifications-client.js',
                'scripts/related-object-filters.js',
                'scripts/research.js',
                'scripts/server-monitor-v2.js',
                'scripts/simple-filter.js',
                'scripts/style-demonstration.js',
                'scripts/system-management.js',
                'scripts/table-mappings.js',
                'scripts/test-header-only.js',
                'scripts/ticker-service.js',
                'scripts/tickers.js',
                'scripts/trade_plans.js',
                'scripts/trade-plan-service.js',
                'scripts/translation-utils.js',
                'scripts/validation-utils.js',
                'scripts/warning-system.js',
                'scripts/yahoo-finance-service.js'
            ],
            
            html: [
                // Main Pages (only existing files)
                'index.html',
                'accounts.html',
                'executions.html',
                'trades.html',
                'preferences.html',
                'linter-realtime-monitor.html',
                
                // Additional Pages (only existing files)
                'alerts.html',
                'apple-style-menu-example.html',
                'background-tasks-fixed.html',
                'background-tasks.html',
                'cache-test.html',
                'cash_flows.html',
                'color-scheme-examples.html',
                'constraints.html',
                'crud-testing-dashboard.html',
                'css-management.html',
                'db_display.html',
                'db_extradata.html',
                'designs.html',
                'dynamic-colors-display.html',
                'external-data-dashboard.html',
                'js-map.html',
                'menu.html',
                'notes.html',
                'notifications-center.html',
                'page-scripts-matrix.html',
                'research.html',
                'server-monitor.html',
                'simple-clean-menu.html',
                'style_demonstration.html',
                'system-management-fixed.html',
                'system-management.html',
                'test-header-clean.html',
                'test-header-menus-pushed.html',
                'test-header-only-new.html',
                'test-header-only-restored.html',
                'test-header-only.html',
                'test-header-yesterday.html',
                'tickers.html',
                'trade_plans.html'
            ],
            
            css: [
                // Main Styles (only existing files)
                // 'styles-new/main.css', // קובץ נמחק
                'styles-new/header-styles.css',
                'styles-new/style-demonstration-cascade.css',
                
                // Settings
                'styles-new/01-settings/_variables.css',
                'styles-new/01-settings/_colors-dynamic.css',
                'styles-new/01-settings/_colors-semantic.css',
                'styles-new/01-settings/_spacing.css',
                'styles-new/01-settings/_typography.css',
                'styles-new/01-settings/_rtl-logical.css',
                'styles-new/01-settings/_breakpoints.css',
                
                // Tools
                'styles-new/02-tools/_functions.css',
                'styles-new/02-tools/_mixins.css',
                
                // Generic
                'styles-new/03-generic/_reset.css',
                'styles-new/03-generic/_base.css',
                
                // Elements
                'styles-new/04-elements/_headings.css',
                'styles-new/04-elements/_links.css',
                'styles-new/04-elements/_forms-base.css',
                'styles-new/04-elements/_buttons-base.css',
                
                // Objects
                'styles-new/05-objects/_layout.css',
                'styles-new/05-objects/_grid.css',
                
                // Components
                'styles-new/06-components/_buttons-advanced.css',
                'styles-new/06-components/_tables.css',
                'styles-new/06-components/_cards.css',
                'styles-new/06-components/_modals.css',
                'styles-new/06-components/_notifications.css',
                'styles-new/06-components/_navigation.css',
                'styles-new/06-components/_forms-advanced.css',
                'styles-new/06-components/_badges-status.css',
                'styles-new/06-components/_entity-colors.css',
                'styles-new/06-components/_info-summary.css',
                'styles-new/06-components/_page-headers.css',
                'styles-new/06-components/_system-management.css',
                'styles-new/06-components/_constraints.css',
                'styles-new/06-components/_bootstrap-overrides.css',
                
                // Trumps
                'styles-new/07-trumps/js-map-advanced.css',
                'styles-new/07-trumps/page-scripts-matrix.css',
                
                // Themes
                'styles-new/08-themes/_light.css',
                'styles-new/08-themes/_dark.css',
                'styles-new/08-themes/_high-contrast.css',
                
                // Utilities
                'styles-new/09-utilities/_utilities.css'
            ],
            
            python: [
                // Backend Core
                'Backend/app.py',
                // 'Backend/dev_server.py', // Removed - using app.py only
                'Backend/database.py',
                'Backend/config.py',
                'Backend/auth.py',
                'Backend/security.py',
                'Backend/cache.py',
                'Backend/logger.py',
                'Backend/error_handler.py',
                'Backend/validation.py',
                'Backend/session_manager.py',
                'Backend/websocket_manager.py',
                
                // API Endpoints
                'Backend/api/__init__.py',
                'Backend/api/accounts.py',
                'Backend/api/executions.py',
                'Backend/api/trades.py',
                'Backend/api/positions.py',
                'Backend/api/portfolio.py',
                'Backend/api/market_data.py',
                'Backend/api/order_management.py',
                'Backend/api/preferences.py',
                'Backend/api/development.py',
                'Backend/api/database.py',
                'Backend/api/logs.py',
                'Backend/api/system.py',
                'Backend/api/linter.py',
                
                // Services
                'Backend/services/__init__.py',
                'Backend/services/account_service.py',
                'Backend/services/execution_service.py',
                'Backend/services/trade_service.py',
                'Backend/services/position_service.py',
                'Backend/services/portfolio_service.py',
                'Backend/services/market_data_service.py',
                'Backend/services/order_service.py',
                'Backend/services/preference_service.py',
                'Backend/services/development_service.py',
                'Backend/services/database_service.py',
                'Backend/services/log_service.py',
                'Backend/services/system_service.py',
                'Backend/services/linter_service.py',
                
                // Models
                'Backend/models/__init__.py',
                'Backend/models/account.py',
                'Backend/models/execution.py',
                'Backend/models/trade.py',
                'Backend/models/position.py',
                'Backend/models/portfolio.py',
                'Backend/models/market_data.py',
                'Backend/models/order.py',
                'Backend/models/preference.py',
                'Backend/models/development.py',
                'Backend/models/database.py',
                'Backend/models/log.py',
                'Backend/models/system.py',
                'Backend/models/linter.py',
                
                // Utils
                'Backend/utils/__init__.py',
                'Backend/utils/database_utils.py',
                'Backend/utils/date_utils.py',
                'Backend/utils/file_utils.py',
                'Backend/utils/string_utils.py',
                'Backend/utils/validation_utils.py',
                'Backend/utils/security_utils.py',
                'Backend/utils/cache_utils.py',
                'Backend/utils/log_utils.py',
                'Backend/utils/error_utils.py',
                'Backend/utils/response_utils.py',
                'Backend/utils/request_utils.py',
                'Backend/utils/websocket_utils.py',
                'Backend/utils/linter_utils.py',
                
                // Tests
                'Backend/tests/__init__.py',
                'Backend/tests/test_accounts.py',
                'Backend/tests/test_executions.py',
                'Backend/tests/test_trades.py',
                'Backend/tests/test_positions.py',
                'Backend/tests/test_portfolio.py',
                'Backend/tests/test_market_data.py',
                'Backend/tests/test_order_management.py',
                'Backend/tests/test_preferences.py',
                'Backend/tests/test_development.py',
                'Backend/tests/test_database.py',
                'Backend/tests/test_logs.py',
                'Backend/tests/test_system.py',
                'Backend/tests/test_linter.py',
                'Backend/tests/test_api.py',
                'Backend/tests/test_services.py',
                'Backend/tests/test_models.py',
                'Backend/tests/test_utils.py',
                
                // Scripts
                'Backend/scripts/init_database.py',
                'Backend/scripts/backup_database.py',
                'Backend/scripts/restore_database.py',
                'Backend/scripts/cleanup_logs.py',
                'Backend/scripts/update_schema.py',
                'Backend/scripts/migrate_data.py',
                'Backend/scripts/export_data.py',
                'Backend/scripts/import_data.py',
                'Backend/scripts/validate_data.py',
                'Backend/scripts/optimize_database.py',
                'Backend/scripts/generate_reports.py',
                'Backend/scripts/monitor_system.py',
                'Backend/scripts/linter_scan.py'
            ],
            
            other: [
                // Documentation
                'README.md',
                'CHANGELOG.md',
                'CONTRIBUTING.md',
                'LICENSE.md',
                'SECURITY.md',
                'API.md',
                'DEPLOYMENT.md',
                'DEVELOPMENT.md',
                'TESTING.md',
                'TROUBLESHOOTING.md',
                
                // Configuration Files
                'package.json',
                'package-lock.json',
                'requirements.txt',
                'Pipfile',
                'Pipfile.lock',
                'pyproject.toml',
                'setup.py',
                'setup.cfg',
                'tox.ini',
                'pytest.ini',
                'coverage.ini',
                '.gitignore',
                '.gitattributes',
                '.editorconfig',
                '.eslintrc.json',
                '.prettierrc',
                '.babelrc',
                'webpack.config.js',
                'rollup.config.js',
                'vite.config.js',
                'tsconfig.json',
                'jsconfig.json',
                
                // Environment Files
                '.env.example',
                '.env.local',
                '.env.development',
                '.env.production',
                '.env.test',
                
                // Database Files
                'Backend/db/schema.sql',
                'Backend/db/migrations/001_initial.sql',
                'Backend/db/migrations/002_add_accounts.sql',
                'Backend/db/migrations/003_add_executions.sql',
                'Backend/db/migrations/004_add_trades.sql',
                'Backend/db/migrations/005_add_positions.sql',
                'Backend/db/migrations/006_add_portfolio.sql',
                'Backend/db/migrations/007_add_market_data.sql',
                'Backend/db/migrations/008_add_orders.sql',
                'Backend/db/migrations/009_add_preferences.sql',
                'Backend/db/migrations/010_add_development.sql',
                'Backend/db/migrations/011_add_logs.sql',
                'Backend/db/migrations/012_add_system.sql',
                'Backend/db/migrations/013_add_linter.sql',
                
                // Log Files
                'logs/app.log',
                'logs/error.log',
                'logs/access.log',
                'logs/debug.log',
                'logs/system.log',
                'logs/linter.log',
                'logs/development.log',
                'logs/production.log',
                'logs/test.log',
                
                // Backup Files
                'backups/database_backup.sql',
                'backups/config_backup.json',
                'backups/logs_backup.tar.gz',
                'backups/system_backup.tar.gz',
                
                // Scripts
                'scripts/start.sh',
                'scripts/stop.sh',
                'scripts/restart.sh',
                'scripts/backup.sh',
                'scripts/restore.sh',
                'scripts/cleanup.sh',
                'scripts/update.sh',
                'scripts/deploy.sh',
                'scripts/test.sh',
                'scripts/lint.sh',
                'scripts/build.sh',
                'scripts/install.sh',
                'scripts/uninstall.sh',
                
                // Docker Files
                'Dockerfile',
                'docker-compose.yml',
                'docker-compose.dev.yml',
                'docker-compose.prod.yml',
                'docker-compose.test.yml',
                '.dockerignore',
                
                // CI/CD Files
                '.github/workflows/ci.yml',
                '.github/workflows/cd.yml',
                '.github/workflows/test.yml',
                '.github/workflows/lint.yml',
                '.github/workflows/security.yml',
                '.gitlab-ci.yml',
                'Jenkinsfile',
                'azure-pipelines.yml',
                
                // Monitoring Files
                'monitoring/prometheus.yml',
                'monitoring/grafana.json',
                'monitoring/alertmanager.yml',
                'monitoring/nginx.conf',
                'monitoring/ssl.conf',
                
                // Documentation Files
                'docs/api/accounts.md',
                'docs/api/executions.md',
                'docs/api/trades.md',
                'docs/api/positions.md',
                'docs/api/portfolio.md',
                'docs/api/market_data.md',
                'docs/api/order_management.md',
                'docs/api/preferences.md',
                'docs/api/development.md',
                'docs/api/database.md',
                'docs/api/logs.md',
                'docs/api/system.md',
                'docs/api/linter.md',
                'docs/frontend/javascript_architecture.md',
                'docs/frontend/css_architecture.md',
                'docs/frontend/ui_components.md',
                'docs/frontend/color_schemes.md',
                'docs/frontend/responsive_design.md',
                'docs/backend/database_schema.md',
                'docs/backend/api_endpoints.md',
                'docs/backend/services.md',
                'docs/backend/models.md',
                'docs/backend/utils.md',
                'docs/backend/security.md',
                'docs/backend/performance.md',
                'docs/backend/monitoring.md',
                'docs/backend/deployment.md',
                'docs/backend/testing.md',
                'docs/backend/troubleshooting.md'
            ]
        };
        
        return staticFiles;
    }

    /**
     * Check if file should be included
     * @param {string} filePath - File path to check
     * @returns {boolean} True if file should be included
     */
    isValidFile(filePath) {
        // Check exclude patterns
        for (const pattern of this.excludePatterns) {
            if (filePath.includes(pattern)) {
                return false;
            }
        }
        
        // Check if file has valid extension
        const extension = this.getFileExtension(filePath);
        if (!extension) {
            return false;
        }
        
        return true;
    }

    /**
     * Get file extension
     * @param {string} filePath - File path
     * @returns {string} File extension
     */
    getFileExtension(filePath) {
        const lastDot = filePath.lastIndexOf('.');
        if (lastDot === -1) {
            return '';
        }
        return filePath.substring(lastDot);
    }

    /**
     * Get file type based on extension
     * @param {string} filePath - File path
     * @returns {string} File type
     */
    getFileType(filePath) {
        const extension = this.getFileExtension(filePath).toLowerCase();
        
        if (this.fileTypes.js.extensions.includes(extension)) {
            return 'js';
        } else if (this.fileTypes.html.extensions.includes(extension)) {
            return 'html';
        } else if (this.fileTypes.css.extensions.includes(extension)) {
            return 'css';
        } else if (this.fileTypes.python.extensions.includes(extension)) {
            return 'python';
        } else if (this.fileTypes.other.extensions.includes(extension)) {
            return 'other';
        }
        
        return 'other';
    }
}

// ========================================
// Global Instance and Functions
// ========================================

// Create global instance
console.log('🔧 Initializing ProjectFilesScanner...');
window.projectFilesScanner = new ProjectFilesScanner();
console.log('✅ ProjectFilesScanner initialized');

// Load cache from localStorage on initialization
console.log('🔧 Loading from localStorage...');
window.projectFilesScanner.loadFromLocalStorage();
console.log('✅ ProjectFilesScanner loaded from localStorage');

// Global functions for backward compatibility
window.getProjectFiles = () => window.projectFilesScanner.getProjectFiles();
window.getFilesByType = (type) => window.projectFilesScanner.getFilesByType(type);
window.getTotalFileCount = () => window.projectFilesScanner.getTotalFileCount();
window.getFileStatistics = () => window.projectFilesScanner.getFileStatistics();
window.clearProjectFilesCache = () => window.projectFilesScanner.clearCache();

// ========================================
// Export for module systems
// ========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectFilesScanner;
}

// ========================================
// Console logging for debugging
// ========================================

console.log('🔍 Project Files Scanner loaded successfully');
console.log('📊 Available functions:', {
    getProjectFiles: typeof window.getProjectFiles,
    getFilesByType: typeof window.getFilesByType,
    getTotalFileCount: typeof window.getTotalFileCount,
    getFileStatistics: typeof window.getFileStatistics,
    clearProjectFilesCache: typeof window.clearProjectFilesCache
});
